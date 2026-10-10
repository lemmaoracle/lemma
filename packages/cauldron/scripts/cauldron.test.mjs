import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { createSign, X509Certificate } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  assertRunId,
  ATTESTATION_MAX_SKEW_MS,
  BUILD_INPUT_FILES,
  cborEncode,
  cborDecode,
  commitmentNonceHex,
  commitmentNonceHexFromFiles,
  deleteSecurityGroupWithRetry,
  ENCLAVE_MEMORY_LIMIT_BYTES,
  estimateContributeMemory,
  extensionsOf,
  goldenPcrsFrom,
  hashBuildInputs,
  isIpv4,
  PINNED_ROOT_FINGERPRINT,
  pcrsMatch,
  parseArgs,
  planLifecycle,
  sha256Hex,
  verifyBuildInputs,
  verifyChain,
  verifyAttestation,
  verifyBundle,
  warnIfZkeyTooLarge,
} from "./cauldron.mjs";
import { commitmentNonceHex as serveNonce, frame, MAX_FRAME, readFrame } from "../enclave/frame.mjs";
import { BUILD_INPUT_FILES as enclaveBuildFiles, hashBuildInputs as enclaveHashBuildInputs } from "../enclave/hash-build-inputs.mjs";
import { contributeArgv } from "../enclave/serve.mjs";
import { socatSupportsVsock } from "../enclave/socat-vsock.mjs";

const pemToDer = (pem) => Buffer.from(String(pem).replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), "base64");

const pcrHex = (byte) => Buffer.alloc(48, byte).toString("hex");

// --- テスト用証明書チェーン（root CA → leaf）を openssl で生成 ---
let rootPem;
let leafDer;
let rootDer;
let tmp;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cauldron-test-"));
  const run = (args) => execFileSync("openssl", args, { cwd: tmp, stdio: ["ignore", "pipe", "ignore"] });
  run(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "root.key"]);
  run(["req", "-x509", "-key", "root.key", "-out", "root.pem", "-days", "30",
    "-subj", "/C=US/O=Test/CN=test-nitro-root",
    "-addext", "keyUsage=critical,digitalSignature,keyCertSign,cRLSign"]);
  run(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "leaf.key"]);
  run(["req", "-new", "-key", "leaf.key", "-out", "leaf.csr", "-subj", "/C=US/O=Test/CN=test-leaf"]);
  fs.writeFileSync(path.join(tmp, "leaf.ext"), [
    "basicConstraints=critical,CA:FALSE",
    "keyUsage=critical,digitalSignature",
    "",
  ].join("\n"));
  run(["x509", "-req", "-in", "leaf.csr", "-CA", "root.pem", "-CAkey", "root.key",
    "-CAcreateserial", "-out", "leaf.pem", "-days", "30", "-extfile", "leaf.ext"]);
  rootPem = fs.readFileSync(path.join(tmp, "root.pem"), "utf8");
  rootDer = pemToDer(rootPem);
  leafDer = pemToDer(fs.readFileSync(path.join(tmp, "leaf.pem"), "utf8"));
});

const makeAttestation = (overrides = {}, { tamperSig = false, alg = -35, der = false, tag = true } = {}) => {
  const pcrs = new Map([
    [0, Buffer.alloc(48, 1)],
    [1, Buffer.alloc(48, 2)],
    [2, Buffer.alloc(48, 3)],
  ]);
  const payload = new Map([
    ["module_id", "i-0123456789"],
    ["timestamp", Date.now()],
    ["digest", "SHA384"],
    ["pcrs", pcrs],
    ["certificate", leafDer],
    ["cabundle", [rootDer]],
    ["nonce", Buffer.alloc(32, 9)],
    ...Object.entries(overrides),
  ]);
  const payloadBstr = cborEncode(payload);
  const protectedBstr = cborEncode(new Map([[1, alg], [4, "test-kid"]]));
  const sigStructure = cborEncode(["Signature1", protectedBstr, Buffer.alloc(0), payloadBstr]);
  const signer = createSign("SHA384");
  signer.update(sigStructure);
  const signature = signer.sign({
    key: fs.readFileSync(path.join(tmp, "leaf.key")),
    dsaEncoding: der ? "der" : "ieee-p1363",
  });
  if (tamperSig) signature[0] ^= 0xff;
  const body = cborEncode([protectedBstr, new Map([[33, [rootDer]], [34, leafDer]]), payloadBstr, signature]);
  return tag ? Buffer.concat([Buffer.from([0xd2]), body]) : body;
};

describe("cborEncode/cborDecode", () => {
  it("roundtrips ints, bytes, strings, arrays and maps", () => {
    const value = new Map([
      ["int", 12345],
      ["neg", -35],
      ["bytes", Buffer.from("hello")],
      ["arr", [1, "two", Buffer.from("3")]],
    ]);
    const [decoded, offset] = cborDecode(cborEncode(value));
    expect(offset).toBe(cborEncode(value).length);
    expect(decoded.get("int")).toBe(12345);
    expect(decoded.get("neg")).toBe(-35);
    expect(Buffer.from(decoded.get("bytes")).toString()).toBe("hello");
    expect(decoded.get("arr")[1]).toBe("two");
  });

  it("roundtrips the 24-byte and 256-byte length boundaries", () => {
    const value = new Map([
      ["a", "x".repeat(24)],
      ["b", "y".repeat(256)],
    ]);
    const encoded = cborEncode(value);
    const [decoded, offset] = cborDecode(encoded);
    expect(offset).toBe(encoded.length);
    expect(decoded.get("a")).toBe("x".repeat(24));
    expect(decoded.get("b")).toBe("y".repeat(256));
  });

  it("rejects indefinite length, truncation, and huge arrays", () => {
    expect(() => cborDecode(Buffer.from([0x5f]))).toThrow(/indefinite/);
    expect(() => cborDecode(Buffer.from([0x45, 0x01]))).toThrow(/truncated/);
    expect(() => cborDecode(Buffer.from([0x9a, 0xff, 0xff, 0xff, 0xff]))).toThrow(/truncated/);
  });

  it("unwraps COSE tag 18 and rejects other tags", () => {
    const inner = cborEncode([1, 2]);
    const [value, offset] = cborDecode(Buffer.concat([Buffer.from([0xd2]), inner]));
    expect(value).toEqual([1, 2]);
    expect(offset).toBe(inner.length + 1);
    expect(() => cborDecode(Buffer.concat([Buffer.from([0xd3]), inner]))).toThrow(/tag 19/);
  });
});

describe("pcrsMatch", () => {
  it("passes when PCR0/1/2 match, ignoring case", () => {
    const expected = { 0: pcrHex(1).toUpperCase(), 1: pcrHex(2), 2: pcrHex(3) };
    const actual = { 0: pcrHex(1), 1: pcrHex(2).toUpperCase(), 2: pcrHex(3) };
    expect(pcrsMatch(expected, actual).ok).toBe(true);
  });
  it("accepts PCR0-style keys", () => {
    expect(pcrsMatch(
      { PCR0: pcrHex(1), PCR1: pcrHex(2), PCR2: pcrHex(3) },
      { 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) },
    ).ok).toBe(true);
  });
  it("fails on mismatch, missing PCR, or a short value", () => {
    expect(pcrsMatch({ 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }, { 0: pcrHex(9), 1: pcrHex(2), 2: pcrHex(3) }).ok).toBe(false);
    expect(pcrsMatch({ 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }, { 0: pcrHex(1), 1: pcrHex(2) }).ok).toBe(false);
    expect(pcrsMatch({ 0: "aa", 1: pcrHex(2), 2: pcrHex(3) }, { 0: "aa", 1: pcrHex(2), 2: pcrHex(3) }).ok).toBe(false);
  });
});

describe("parseArgs / planLifecycle", () => {
  it("parses command and options", () => {
    const { command, opts } = parseArgs(["phase2", "--r1cs", "a.r1cs", "--dry-run", "--zkey-out", "b.zkey"]);
    expect(command).toBe("phase2");
    expect(opts.r1cs).toBe("a.r1cs");
    expect(opts["dry-run"]).toBe(true);
  });
  it("lists 12 steps and orders provision before teardown", () => {
    const steps = planLifecycle();
    expect(steps).toHaveLength(12);
    expect(steps.findIndex((s) => s.startsWith("provision"))).toBeLessThan(steps.findIndex((s) => s.startsWith("teardown")));
    expect(steps.some((s) => s.includes("sha256(zkey_0000)||sha256(zkey_final)"))).toBe(true);
  });
});

describe("run id and public ip", () => {
  it("accepts generated run ids and rejects filter injection", () => {
    expect(assertRunId("lts-abc123-deadbeef")).toBe("lts-abc123-deadbeef");
    expect(() => assertRunId("lts-abc-def,Name=instance-state-name")).toThrow(/invalid run-id/);
    expect(() => assertRunId("../etc/passwd")).toThrow(/invalid run-id/);
  });
  it("accepts only dotted IPv4", () => {
    expect(isIpv4("203.0.113.4")).toBe(true);
    expect(isIpv4("203.0.113.4/0")).toBe(false);
    expect(isIpv4("1.2.3.256")).toBe(false);
    expect(isIpv4("0.0.0.0 extra")).toBe(false);
  });
});

describe("verifyChain", () => {
  it("accepts leaf signed by the root", () => {
    expect(verifyChain(leafDer, [], rootPem).ok).toBe(true);
  });
  it("rejects when the root does not match", () => {
    const otherRoot = fs.readFileSync(path.join(__dirname, "..", "certs", "aws-nitro-root.pem"), "utf8");
    expect(verifyChain(leafDer, [], otherRoot).ok).toBe(false);
  });
  it("rejects an expired chain", () => {
    expect(verifyChain(leafDer, [], rootPem, Date.UTC(2100, 0, 1)).ok).toBe(false);
  });
});

describe("pinned Nitro root", () => {
  it("matches the bundled PEM fingerprint", () => {
    const pem = fs.readFileSync(path.join(__dirname, "..", "certs", "aws-nitro-root.pem"));
    expect(new X509Certificate(pem).fingerprint256).toBe(PINNED_ROOT_FINGERPRINT);
    expect(new X509Certificate(pem).subject).toContain("CN=aws.nitro-enclaves");
  });
});

describe("verifyAttestation", () => {
  it("verifies a tagged ES384 COSE_Sign1 document offline", () => {
    const result = verifyAttestation(makeAttestation(), { rootCertPem: rootPem });
    expect(result.ok).toBe(true);
    expect(result.digest).toBe("SHA384");
    expect(result.pcrs["0"]).toBe(pcrHex(1));
    expect(result.nonce).toBe(Buffer.alloc(32, 9).toString("hex"));
  });
  it("also accepts an untagged document", () => {
    expect(verifyAttestation(makeAttestation({}, { tag: false }), { rootCertPem: rootPem }).ok).toBe(true);
  });
  it("rejects a tampered signature", () => {
    expect(verifyAttestation(makeAttestation({}, { tamperSig: true }), { rootCertPem: rootPem }).ok).toBe(false);
  });
  it("rejects ES256 and DER signatures", () => {
    expect(verifyAttestation(makeAttestation({}, { alg: -7 }), { rootCertPem: rootPem }).reason).toMatch(/ES384/);
    expect(verifyAttestation(makeAttestation({}, { der: true }), { rootCertPem: rootPem }).reason).toMatch(/raw R\|\|S/);
  });
  it("rejects a payload certificate that is not the signing certificate", () => {
    const result = verifyAttestation(makeAttestation({ certificate: Buffer.alloc(8, 7) }), { rootCertPem: rootPem });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/payload certificate/);
  });
  it("rejects trailing bytes and a non-COSE tag", () => {
    expect(verifyAttestation(Buffer.concat([makeAttestation(), Buffer.from([0])]), { rootCertPem: rootPem }).ok).toBe(false);
    const untagged = makeAttestation({}, { tag: false });
    expect(verifyAttestation(Buffer.concat([Buffer.from([0xd3]), untagged]), { rootCertPem: rootPem }).ok).toBe(false);
  });
  it("detects PCR divergence at the bundle level", () => {
    const doc = makeAttestation({ pcrs: new Map([[0, Buffer.alloc(48, 7)], [1, Buffer.alloc(48, 2)], [2, Buffer.alloc(48, 3)]]) });
    const result = verifyAttestation(doc, { rootCertPem: rootPem });
    expect(result.ok).toBe(true);
    const pcr = pcrsMatch(
      { 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) },
      result.pcrs,
    );
    expect(pcr.ok).toBe(false);
  });
});

describe("verifyBundle", () => {
  it("verifies attestation + PCR manifest + nonce together", () => {
    const attPath = path.join(tmp, "a.cbor");
    const pcrsPath = path.join(tmp, "p.json");
    fs.writeFileSync(attPath, makeAttestation());
    fs.writeFileSync(pcrsPath, JSON.stringify({
      0: pcrHex(1),
      1: pcrHex(2),
      2: pcrHex(3),
    }));
    const ok = verifyBundle({
      attestationPath: attPath,
      pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"),
      rootCertPem: rootPem,
    });
    expect(ok.ok).toBe(true);
    const bad = verifyBundle({
      attestationPath: attPath,
      pcrsPath,
      nonceHash: sha256Hex(Buffer.from("different")),
      rootCertPem: rootPem,
    });
    expect(bad.ok).toBe(false);
  });

  it("fails closed when no nonce binding is provided", () => {
    const attPath = path.join(tmp, "a2.cbor");
    const pcrsPath = path.join(tmp, "p2.json");
    fs.writeFileSync(attPath, makeAttestation());
    fs.writeFileSync(pcrsPath, JSON.stringify({ 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }));
    const result = verifyBundle({ attestationPath: attPath, pcrsPath, rootCertPem: rootPem });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/nonce binding required/);
  });

  it("binds the nonce to both zkeys and rejects a swapped output", () => {
    const zIn = Buffer.from("zkey-in-bytes");
    const zOut = Buffer.from("zkey-out-bytes");
    const swapped = Buffer.from("zkey-out-swapped");
    const nonce = Buffer.from(commitmentNonceHex(zIn, zOut), "hex");
    const attPath = path.join(tmp, "bound.cbor");
    const pcrsPath = path.join(tmp, "bound-pcrs.json");
    const inPath = path.join(tmp, "in.zkey");
    const outPath = path.join(tmp, "out.zkey");
    const swapPath = path.join(tmp, "swap.zkey");
    fs.writeFileSync(attPath, makeAttestation({ nonce }));
    fs.writeFileSync(pcrsPath, JSON.stringify({ 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }));
    fs.writeFileSync(inPath, zIn);
    fs.writeFileSync(outPath, zOut);
    fs.writeFileSync(swapPath, swapped);
    expect(verifyBundle({
      attestationPath: attPath, pcrsPath, zkeyIn: inPath, zkeyOut: outPath, rootCertPem: rootPem,
    }).ok).toBe(true);
    expect(verifyBundle({
      attestationPath: attPath, pcrsPath, zkeyIn: inPath, zkeyOut: swapPath, rootCertPem: rootPem,
    }).ok).toBe(false);
    expect(commitmentNonceHex(zIn, zOut)).toBe(commitmentNonceHexFromFiles(inPath, outPath));
    expect(commitmentNonceHex(zIn, zOut)).toBe(serveNonce(zIn, zOut));
    expect(commitmentNonceHex(zIn, zOut)).not.toBe(sha256Hex(zIn));
  });
});

describe("framing", () => {
  it("keeps body bytes that arrive in the same chunk as the length", async () => {
    const payload = Buffer.from("abcdefghijklmnopqrstuvwxyz");
    const encoded = frame(payload);
    const stream = new PassThrough();
    const pending = readFrame(stream);
    stream.write(encoded.subarray(0, 3));
    stream.write(encoded.subarray(3));
    expect((await pending).equals(payload)).toBe(true);
  });

  it("splits two frames across arbitrary chunk boundaries", async () => {
    const first = Buffer.from("hello");
    const second = Buffer.from("world!!");
    const blob = Buffer.concat([frame(Buffer.alloc(0)), frame(first), frame(second)]);
    const stream = new PassThrough();
    const pending = (async () => [await readFrame(stream), await readFrame(stream), await readFrame(stream)])();
    for (let i = 0; i < blob.length; i += 3) stream.write(blob.subarray(i, i + 3));
    stream.end();
    const [empty, a, b] = await pending;
    expect(empty.length).toBe(0);
    expect(a.equals(first)).toBe(true);
    expect(b.equals(second)).toBe(true);
  });

  it("rejects a length above the 1GiB cap without allocating it", async () => {
    const stream = new PassThrough();
    const head = Buffer.alloc(4);
    head.writeUInt32BE(MAX_FRAME + 1);
    const pending = readFrame(stream);
    stream.write(head);
    await expect(pending).rejects.toThrow(/too large/);
  });
});

describe("parse_pcrs", () => {
  const hex96 = (ch) => ch.repeat(96);
  const script = path.join(__dirname, "..", "enclave", "parse_pcrs.py");
  const run = (obj) => {
    const out = path.join(tmp, `pcrs-${Math.random().toString(16).slice(2)}.json`);
    execFileSync("python3", [script, out], { input: JSON.stringify(obj), stdio: ["pipe", "pipe", "pipe"] });
    return JSON.parse(fs.readFileSync(out, "utf8"));
  };

  it("reads PCR0/1/2 from a flat document and from Measurements", () => {
    const flat = { PCR0: hex96("a").toUpperCase(), PCR1: hex96("b"), PCR2: `0x${hex96("c")}`, PCR8: hex96("d"), HashAlgorithm: "Sha384" };
    expect(run(flat)).toEqual({ 0: hex96("a"), 1: hex96("b"), 2: hex96("c") });
    const nested = { Measurements: { HashAlgorithm: "Sha384 { }", PCR0: hex96("1"), PCR1: hex96("2"), PCR2: hex96("3") } };
    expect(run(nested)).toEqual({ 0: hex96("1"), 1: hex96("2"), 2: hex96("3") });
  });

  it("fails when PCR2 is missing or not 48 bytes", () => {
    expect(() => run({ Measurements: { PCR0: hex96("a"), PCR1: hex96("b") } })).toThrow();
    expect(() => run({ PCR0: "abcd", PCR1: hex96("b"), PCR2: hex96("c") })).toThrow();
  });
});

describe("certificate profile", () => {
  const openssl = (dir, args) => execFileSync("openssl", args, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });

  it("reads digitalSignature, keyCertSign and cRLSign from the AWS Nitro root", () => {
    const raw = new X509Certificate(fs.readFileSync(path.join(__dirname, "..", "certs", "aws-nitro-root.pem"))).raw;
    const profile = extensionsOf(raw);
    expect(profile.keyUsage).toEqual(expect.arrayContaining(["digitalSignature", "keyCertSign", "cRLSign"]));
    expect(profile.eku).toEqual([]);
    expect(profile.nameConstraints).toBeNull();
  });

  it("rejects a leaf or CA that carries TLS serverAuth", () => {
    const dir = fs.mkdtempSync(path.join(tmp, "eku-"));
    openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "ca.key"]);
    openssl(dir, ["req", "-x509", "-key", "ca.key", "-out", "ca.pem", "-days", "30",
      "-subj", "/C=US/O=Test/CN=eku-ca",
      "-addext", "keyUsage=critical,digitalSignature,keyCertSign,cRLSign"]);
    openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "leaf.key"]);
    openssl(dir, ["req", "-new", "-key", "leaf.key", "-out", "leaf.csr", "-subj", "/C=US/O=Test/CN=eku-leaf"]);
    fs.writeFileSync(path.join(dir, "server.ext"), "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\n");
    fs.writeFileSync(path.join(dir, "code.ext"), "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=codeSigning\n");
    openssl(dir, ["x509", "-req", "-in", "leaf.csr", "-CA", "ca.pem", "-CAkey", "ca.key", "-CAcreateserial", "-out", "server.pem", "-days", "30", "-extfile", "server.ext"]);
    openssl(dir, ["x509", "-req", "-in", "leaf.csr", "-CA", "ca.pem", "-CAkey", "ca.key", "-CAcreateserial", "-out", "code.pem", "-days", "30", "-extfile", "code.ext"]);
    const caPem = fs.readFileSync(path.join(dir, "ca.pem"), "utf8");
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "server.pem"), "utf8")), [], caPem).reason).toMatch(/serverAuth/);
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "code.pem"), "utf8")), [], caPem).ok).toBe(true);

    openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "tls-ca.key"]);
    openssl(dir, ["req", "-x509", "-key", "tls-ca.key", "-out", "tls-ca.pem", "-days", "30",
      "-subj", "/C=US/O=Test/CN=tls-ca",
      "-addext", "keyUsage=critical,digitalSignature,keyCertSign,cRLSign",
      "-addext", "extendedKeyUsage=serverAuth"]);
    fs.writeFileSync(path.join(dir, "plain.ext"), "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n");
    openssl(dir, ["x509", "-req", "-in", "leaf.csr", "-CA", "tls-ca.pem", "-CAkey", "tls-ca.key", "-CAcreateserial", "-out", "under-tls-ca.pem", "-days", "30", "-extfile", "plain.ext"]);
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "under-tls-ca.pem"), "utf8")), [], fs.readFileSync(path.join(dir, "tls-ca.pem"), "utf8")).reason).toMatch(/CA EKU/);
  });

  it("enforces directoryName and dNSName constraints when a CA publishes them", () => {
    const dir = fs.mkdtempSync(path.join(tmp, "nc-"));
    fs.writeFileSync(path.join(dir, "nc.cnf"), [
      "[req]", "prompt = no", "distinguished_name = dn", "x509_extensions = v3_ca",
      "[dn]", "C = US", "O = Allowed", "CN = constraint-root",
      "[v3_ca]",
      "basicConstraints = critical,CA:TRUE",
      "keyUsage = critical,digitalSignature,keyCertSign,cRLSign",
      "nameConstraints = critical,permitted;dirName:allowed_dn,permitted;DNS:example.com,excluded;DNS:evil.example.com",
      "[allowed_dn]", "C = US", "O = Allowed", "",
    ].join("\n"));
    openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "ca.key"]);
    openssl(dir, ["req", "-x509", "-key", "ca.key", "-out", "ca.pem", "-days", "30", "-config", "nc.cnf"]);
    const issue = (name, subj, ext) => {
      openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", `${name}.key`]);
      openssl(dir, ["req", "-new", "-key", `${name}.key`, "-out", `${name}.csr`, "-subj", subj]);
      fs.writeFileSync(path.join(dir, `${name}.ext`), ext);
      openssl(dir, ["x509", "-req", "-in", `${name}.csr`, "-CA", "ca.pem", "-CAkey", "ca.key", "-CAcreateserial", "-out", `${name}.pem`, "-days", "30", "-extfile", `${name}.ext`]);
    };
    const leafExt = "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n";
    issue("ok", "/C=US/O=Allowed/CN=ok.example.com", `${leafExt}subjectAltName=DNS:ok.example.com\n`);
    issue("evil", "/C=US/O=Allowed/CN=evil.example.com", `${leafExt}subjectAltName=DNS:evil.example.com\n`);
    issue("other-dns", "/C=US/O=Allowed/CN=other.test", `${leafExt}subjectAltName=DNS:other.test\n`);
    issue("other-org", "/C=US/O=Other/CN=ok.example.com", `${leafExt}subjectAltName=DNS:ok.example.com\n`);
    const caPem = fs.readFileSync(path.join(dir, "ca.pem"), "utf8");
    const chain = (name) => verifyChain(pemToDer(fs.readFileSync(path.join(dir, `${name}.pem`), "utf8")), [], caPem);
    expect(chain("ok").ok).toBe(true);
    expect(chain("evil").reason).toMatch(/excluded/);
    expect(chain("other-dns").reason).toMatch(/permitted/);
    expect(chain("other-org").reason).toMatch(/directoryName/);
  });
});

describe("attestation timestamp", () => {
  it("accepts a document inside ±15 minutes and rejects one outside", () => {
    const fresh = Date.now();
    expect(verifyAttestation(makeAttestation({ timestamp: fresh }), { rootCertPem: rootPem, now: fresh }).ok).toBe(true);
    expect(verifyAttestation(makeAttestation({ timestamp: fresh + 14 * 60 * 1000 }), { rootCertPem: rootPem, now: fresh }).ok).toBe(true);
    const stale = verifyAttestation(makeAttestation({ timestamp: fresh + ATTESTATION_MAX_SKEW_MS + 1 }), { rootCertPem: rootPem, now: fresh });
    expect(stale.ok).toBe(false);
    expect(stale.reason).toMatch(/timestamp/);
    const later = fresh + ATTESTATION_MAX_SKEW_MS + 60_000;
    expect(verifyAttestation(makeAttestation({ timestamp: later }), { rootCertPem: rootPem, now: fresh }).ok).toBe(false);
    expect(verifyAttestation(makeAttestation({ timestamp: later }), { rootCertPem: rootPem, now: later }).ok).toBe(true);
  });
});

describe("golden PCRs and build inputs", () => {
  const writeBundle = (name, pcrs) => {
    const attPath = path.join(tmp, `${name}.cbor`);
    const pcrsPath = path.join(tmp, `${name}.json`);
    fs.writeFileSync(attPath, makeAttestation());
    fs.writeFileSync(pcrsPath, JSON.stringify(pcrs));
    return { attPath, pcrsPath };
  };
  const basePcrs = () => ({ 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) });

  it("rejects an unmeasured golden file and matches a measured one", () => {
    const { attPath, pcrsPath } = writeBundle("golden", basePcrs());
    const placeholder = path.join(tmp, "placeholder-pcrs.json");
    fs.writeFileSync(placeholder, JSON.stringify({ measured: false, pcrs: { 0: null, 1: null, 2: null } }));
    const missing = verifyBundle({
      attestationPath: attPath, pcrsPath, nonceHash: Buffer.alloc(32, 9).toString("hex"),
      rootCertPem: rootPem, goldenPath: placeholder,
    });
    expect(missing.ok).toBe(false);
    expect(missing.reason).toMatch(/not been measured/);
    expect(goldenPcrsFrom(JSON.parse(fs.readFileSync(placeholder, "utf8"))).measured).toBe(false);

    const golden = path.join(tmp, "golden-pcrs.json");
    fs.writeFileSync(golden, JSON.stringify({ measured: true, pcrs: basePcrs() }));
    expect(verifyBundle({
      attestationPath: attPath, pcrsPath, nonceHash: Buffer.alloc(32, 9).toString("hex"),
      rootCertPem: rootPem, goldenPath: golden,
    }).ok).toBe(true);
    fs.writeFileSync(golden, JSON.stringify({ measured: true, pcrs: { ...basePcrs(), 0: pcrHex(9) } }));
    expect(verifyBundle({
      attestationPath: attPath, pcrsPath, nonceHash: Buffer.alloc(32, 9).toString("hex"),
      rootCertPem: rootPem, goldenPath: golden,
    }).reason).toMatch(/golden PCR/);
  });

  it("checks golden PCRs embedded in the host manifest", () => {
    const good = writeBundle("embedded-good", { ...basePcrs(), golden: { measured: true, pcrs: basePcrs() } });
    expect(verifyBundle({
      attestationPath: good.attPath, pcrsPath: good.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem,
    }).ok).toBe(true);
    const bad = writeBundle("embedded-bad", { ...basePcrs(), golden: { measured: true, pcrs: { ...basePcrs(), 2: pcrHex(4) } } });
    expect(verifyBundle({
      attestationPath: bad.attPath, pcrsPath: bad.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem,
    }).reason).toMatch(/golden PCR/);
  });

  it("compares recorded build-input hashes with the local enclave sources", () => {
    const enclaveDir = path.join(__dirname, "..", "enclave");
    expect(BUILD_INPUT_FILES).toEqual(enclaveBuildFiles);
    expect(hashBuildInputs(enclaveDir)).toEqual(enclaveHashBuildInputs(enclaveDir));
    const expected = JSON.parse(fs.readFileSync(path.join(enclaveDir, "expected-pcrs.json"), "utf8"));
    expect(expected.schema).toBe("lemma-cauldron.pcrs.v1");
    expect(expected.measured).toBe(false);
    expect(expected.pcrs).toEqual({ 0: null, 1: null, 2: null });
    expect(verifyBuildInputs(expected.build.inputs, enclaveDir).ok).toBe(true);

    const { attPath, pcrsPath } = writeBundle("build", {
      ...basePcrs(),
      build: { schema: "lemma-cauldron.build.v1", inputs: hashBuildInputs(enclaveDir) },
    });
    expect(verifyBundle({
      attestationPath: attPath, pcrsPath, nonceHash: Buffer.alloc(32, 9).toString("hex"),
      rootCertPem: rootPem, buildDir: enclaveDir,
    }).ok).toBe(true);
    const drifted = writeBundle("build-drift", {
      ...basePcrs(),
      build: { schema: "lemma-cauldron.build.v1", inputs: { Dockerfile: "ab".repeat(32) } },
    });
    expect(verifyBundle({
      attestationPath: drifted.attPath, pcrsPath: drifted.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem, buildDir: enclaveDir,
    }).reason).toMatch(/build input/);
    expect(verifyBundle({
      attestationPath: drifted.attPath, pcrsPath: drifted.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem,
      buildDir: enclaveDir, skipBuildCheck: true,
    }).ok).toBe(true);
  });
});

describe("enclave preflight and teardown", () => {
  it("requires both VSOCK address types from socat", () => {
    expect(socatSupportsVsock("VSOCK-CONNECT and VSOCK-LISTEN")).toBe(true);
    expect(socatSupportsVsock("TCP-LISTEN:5000")).toBe(false);
    const script = path.join(__dirname, "..", "enclave", "socat-vsock.mjs");
    expect(() => execFileSync("node", [script], { input: "TCP only", stdio: ["pipe", "pipe", "pipe"] })).toThrow(/VSOCK/);
  });

  it("warns when the zkey memory estimate exceeds the 8GiB enclave", () => {
    const huge = 650 * 1024 * 1024;
    expect(estimateContributeMemory(huge).exceeds).toBe(true);
    expect(estimateContributeMemory(huge).bytes).toBeGreaterThan(ENCLAVE_MEMORY_LIMIT_BYTES);
    expect(estimateContributeMemory(100 * 1024 * 1024).exceeds).toBe(false);
    const big = path.join(tmp, "big.zkey");
    const fd = fs.openSync(big, "w");
    fs.ftruncateSync(fd, huge);
    fs.closeSync(fd);
    const small = path.join(tmp, "small.zkey");
    fs.writeFileSync(small, Buffer.alloc(32));
    const chunks = [];
    const orig = process.stderr.write.bind(process.stderr);
    process.stderr.write = (chunk, ...rest) => { chunks.push(String(chunk)); return orig(chunk, ...rest); };
    try {
      warnIfZkeyTooLarge(big);
      warnIfZkeyTooLarge(small);
      warnIfZkeyTooLarge(path.join(tmp, "missing.zkey"));
    } finally {
      process.stderr.write = orig;
    }
    const text = chunks.join("");
    expect(text).toMatch(/警告/);
    expect(text.match(/警告/g)).toHaveLength(1);
  });

  it("retries security group deletion while an ENI or dependency remains", async () => {
    let deletes = 0;
    const awsImpl = async (args) => {
      if (args[1] === "describe-network-interfaces") return "eni-abc";
      throw new Error("unexpected call");
    };
    await expect(deleteSecurityGroupWithRetry({
      sgId: "sg-1", instanceId: "i-1", region: "us-east-1", attempts: 2, delayMs: 1,
      awsImpl, sleep: async () => {},
    })).rejects.toThrow(/ENI still attached/);

    const retrying = async (args) => {
      if (args[1] === "describe-network-interfaces") return "None";
      deletes += 1;
      if (deletes === 1) throw new Error("DependencyViolation: resource sg-1 has a dependent object");
      return "";
    };
    const done = await deleteSecurityGroupWithRetry({
      sgId: "sg-1", instanceId: "i-1", region: "us-east-1", attempts: 4, delayMs: 1,
      awsImpl: retrying, sleep: async () => {},
    });
    expect(done).toEqual({ ok: true, attempts: 2 });

    const gone = await deleteSecurityGroupWithRetry({
      sgId: "sg-9", region: "us-east-1", attempts: 2, delayMs: 1,
      awsImpl: async (args) => {
        if (args[1] === "describe-network-interfaces") return "";
        throw new Error("InvalidGroup.NotFound");
      },
      sleep: async () => {},
    });
    expect(gone.ok).toBe(true);
  });

  it("parses run-enclave JSON after a log prefix and lists describe-enclaves ids", () => {
    const script = path.join(__dirname, "..", "enclave", "parse_run.py");
    const out = execFileSync("python3", [script, "run"], {
      input: "Started enclave\n{\"EnclaveID\":\"enc-1\",\"EnclaveCID\":16,\"State\":\"RUNNING\"}\n",
      encoding: "utf8",
    });
    expect(out.trim().split("\n")).toEqual(["enc-1", "16"]);
    expect(() => execFileSync("python3", [script, "run"], {
      input: "no json here", stdio: ["pipe", "pipe", "pipe"],
    })).toThrow();
    const listed = execFileSync("python3", ["-c", `
import json, sys
sys.path.insert(0, ${JSON.stringify(path.dirname(script))})
from parse_run import enclave_ids_from_describe, parse_json_value
doc = parse_json_value('noise\\n[{"EnclaveID": "a"}, {"EnclaveID": "b"}]')
print(json.dumps(enclave_ids_from_describe(doc)))
print(json.dumps(enclave_ids_from_describe({"Enclaves": [{"EnclaveID": "c"}]})))
print(json.dumps(enclave_ids_from_describe({"EnclaveID": "d"})))
`], { encoding: "utf8" });
    expect(listed.trim().split("\n")).toEqual(['["a", "b"]', '["c"]', '["d"]']);
  });

  it("does not put contribution entropy on the snarkjs argv", () => {
    const argv = contributeArgv();
    expect(argv).not.toContain("-e");
    expect(argv.join(" ")).not.toContain("super-secret-entropy");
    expect(argv).toEqual(["zkey", "contribute", "/tmp/zkey_0000", "/tmp/zkey_final", "-n", "lemma-cauldron"]);
  });

  it("pins the image digest, apk versions, npm ci and pip hashes", () => {
    const dockerfile = fs.readFileSync(path.join(__dirname, "..", "enclave", "Dockerfile"), "utf8");
    expect(dockerfile).toMatch(/node:20\.20\.2-alpine3\.22@sha256:[0-9a-f]{64}/);
    expect(dockerfile).toMatch(/python3=3\.12\.15-r0/);
    expect(dockerfile).toMatch(/py3-pip=25\.1\.1-r0/);
    expect(dockerfile).toMatch(/socat=1\.8\.1\.3-r0/);
    expect(dockerfile).toMatch(/npm ci --omit=dev/);
    expect(dockerfile).toMatch(/--require-hashes/);
    expect(dockerfile).not.toMatch(/npm install -g/);
    const attest = fs.readFileSync(path.join(__dirname, "..", "enclave", "attest.py"), "utf8");
    expect(attest).toMatch(/aws_nsm_interface/);
    expect(attest).not.toMatch(/aws_nitro_enclaves_attestation/);
    const reqs = fs.readFileSync(path.join(__dirname, "..", "enclave", "requirements.txt"), "utf8");
    expect(reqs).toMatch(/aws-nsm-interface==1\.0\.0/);
    expect(reqs).toMatch(/--hash=sha256:[0-9a-f]{64}/);
  });
});
