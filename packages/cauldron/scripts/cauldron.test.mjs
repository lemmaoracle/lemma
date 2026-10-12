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
  assertEnclaveInstanceType,
  DEFAULT_CLIENT_TIMEOUT_MS,
  DEFAULT_ENCLAVE_CPU,
  DEFAULT_ENCLAVE_MEMORY_MB,
  DEFAULT_INSTANCE_TYPE,
  deleteSecurityGroupWithRetry,
  ENCLAVE_MEMORY_LIMIT_BYTES,
  enclaveMemoryLimitBytes,
  estimateContributeMemory,
  parseEnclaveResources,
  pickPublicSubnet,
  findSoleFinalPtau,
  phase2,
  provision,
  resolveCircuit,
  resolvePhase2Circuit,
  resolveVerifyInputs,
  REMOTE_DIR,
  remoteSetupCommand,
  resolveLaunchNetwork,
  routeTableForSubnet,
  runInstancesArgs,
  teardownById,
  teardownByRunId,
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
  verifyBundle as verifyBundleImpl,
  warnIfZkeyTooLarge,
} from "./cauldron.mjs";
import { commitmentNonceHex as serveNonce, contributeJobHeader, enclaveHeapMb, frame, MAX_FRAME, parseContributeJobHeader, readFrame } from "../enclave/frame.mjs";
import { BUILD_INPUT_FILES as enclaveBuildFiles, hashBuildInputs as enclaveHashBuildInputs } from "../enclave/hash-build-inputs.mjs";
import { contributeArgv } from "../enclave/serve.mjs";
import { socatSupportsVsock } from "../enclave/socat-vsock.mjs";

const pemToDer = (pem) => Buffer.from(String(pem).replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), "base64");

const pcrHex = (byte) => Buffer.alloc(48, byte).toString("hex");

// --- Test certificate chain (root CA → leaf), generated with openssl ---
let rootPem;
let leafDer;
let rootDer;
let tmp;
let goldenPath;

const verifyBundle = (opts) => verifyBundleImpl({ goldenPath, ...opts });
const buildManifest = () => ({ schema: "lemma-cauldron.build.v1", inputs: hashBuildInputs(path.join(__dirname, "..", "enclave")) });

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
  goldenPath = path.join(tmp, "approved-pcrs.json");
  fs.writeFileSync(goldenPath, JSON.stringify({ measured: true, pcrs: { 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) } }));
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
  const body = cborEncode([protectedBstr, new Map(), payloadBstr, signature]);
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
  it("lists the launch steps and orders provision before teardown", () => {
    const steps = planLifecycle();
    expect(steps).toHaveLength(13);
    expect(steps.findIndex((s) => s.startsWith("provision"))).toBeLessThan(steps.findIndex((s) => s.startsWith("teardown")));
    expect(steps.some((s) => s.includes("sha256(zkey_0000)||sha256(zkey_final)"))).toBe(true);
    expect(steps.some((s) => s.includes(DEFAULT_INSTANCE_TYPE))).toBe(true);
    expect(steps.some((s) => s.includes("sudo env"))).toBe(true);
    expect(steps.some((s) => s.includes("dedicated VPC"))).toBe(true);
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
    expect(verifyChain(leafDer, [rootDer], rootPem).ok).toBe(true);
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
  it("rejects substitution of the signing certificate in the payload", () => {
    const result = verifyAttestation(makeAttestation({ certificate: rootDer }), { rootCertPem: rootPem });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/signature/);
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
      build: buildManifest(),
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
    fs.writeFileSync(pcrsPath, JSON.stringify({ build: buildManifest(), 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }));
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
    fs.writeFileSync(pcrsPath, JSON.stringify({ build: buildManifest(), 0: pcrHex(1), 1: pcrHex(2), 2: pcrHex(3) }));
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
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "server.pem"), "utf8")), [pemToDer(caPem)], caPem).reason).toMatch(/serverAuth/);
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "code.pem"), "utf8")), [pemToDer(caPem)], caPem).ok).toBe(true);

    openssl(dir, ["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "tls-ca.key"]);
    openssl(dir, ["req", "-x509", "-key", "tls-ca.key", "-out", "tls-ca.pem", "-days", "30",
      "-subj", "/C=US/O=Test/CN=tls-ca",
      "-addext", "keyUsage=critical,digitalSignature,keyCertSign,cRLSign",
      "-addext", "extendedKeyUsage=serverAuth"]);
    fs.writeFileSync(path.join(dir, "plain.ext"), "basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\n");
    openssl(dir, ["x509", "-req", "-in", "leaf.csr", "-CA", "tls-ca.pem", "-CAkey", "tls-ca.key", "-CAcreateserial", "-out", "under-tls-ca.pem", "-days", "30", "-extfile", "plain.ext"]);
    const tlsCaPem = fs.readFileSync(path.join(dir, "tls-ca.pem"), "utf8");
    expect(verifyChain(pemToDer(fs.readFileSync(path.join(dir, "under-tls-ca.pem"), "utf8")), [pemToDer(tlsCaPem)], tlsCaPem).reason).toMatch(/CA EKU/);
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
    const chain = (name) => verifyChain(pemToDer(fs.readFileSync(path.join(dir, `${name}.pem`), "utf8")), [pemToDer(caPem)], caPem);
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
    fs.writeFileSync(pcrsPath, JSON.stringify({ build: buildManifest(), ...pcrs }));
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

  it("requires local approval regardless of golden PCRs embedded in the host manifest", () => {
    const good = writeBundle("embedded-good", { ...basePcrs(), golden: { measured: true, pcrs: basePcrs() } });
    expect(verifyBundleImpl({
      attestationPath: good.attPath, pcrsPath: good.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem,
    }).ok).toBe(false);
    const bad = writeBundle("embedded-bad", { ...basePcrs(), golden: { measured: true, pcrs: { ...basePcrs(), 2: pcrHex(4) } } });
    expect(verifyBundle({
      attestationPath: bad.attPath, pcrsPath: bad.pcrsPath,
      nonceHash: Buffer.alloc(32, 9).toString("hex"), rootCertPem: rootPem,
    }).ok).toBe(true);
  });

  it("compares recorded build-input hashes with the local enclave sources", () => {
    const enclaveDir = path.join(__dirname, "..", "enclave");
    expect(BUILD_INPUT_FILES).toEqual(enclaveBuildFiles);
    expect(hashBuildInputs(enclaveDir)).toEqual(enclaveHashBuildInputs(enclaveDir));
    const expected = JSON.parse(fs.readFileSync(path.join(enclaveDir, "expected-pcrs.json"), "utf8"));
    expect(expected.schema).toBe("lemma-cauldron.pcrs.v1");
    expect(expected.measured).toBe(true);
    for (const key of ["0", "1", "2"]) expect(expected.pcrs[key]).toMatch(/^[0-9a-f]{96}$/);
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
    expect(socatSupportsVsock("vsock-connect:<cid>:<port> / vsock-listen:<port>")).toBe(true);
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
    expect(text).toMatch(/warning/);
    expect(text).toMatch(/--enclave-memory-mb 8192/);
    expect(text.match(/warning/g)).toHaveLength(1);
    const raised = enclaveMemoryLimitBytes(16384);
    expect(estimateContributeMemory(huge, raised).exceeds).toBe(false);
    process.stderr.write = (chunk, ...rest) => { chunks.push(String(chunk)); return orig(chunk, ...rest); };
    try { warnIfZkeyTooLarge(big, raised); } finally { process.stderr.write = orig; }
    expect(chunks.join("").match(/warning/g)).toHaveLength(1);
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
    expect(argv).toEqual(["zkey", "contribute", "/tmp/zkey_0000", "/tmp/zkey_final", "-n=lemma-cauldron"]);
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
    const setup = fs.readFileSync(path.join(__dirname, "..", "enclave", "setup-and-run.sh"), "utf8");
    expect(setup).toMatch(/enclaveHeapMb/);
    expect(setup).toMatch(/--max-old-space-size/);
    expect(setup).not.toMatch(/t3\.xlarge/);
  });
});

describe("phase2 launch", () => {
  const publicTable = {
    Associations: [{ Main: true }],
    Routes: [
      { DestinationCidrBlock: "10.0.0.0/16", GatewayId: "local" },
      { DestinationCidrBlock: "0.0.0.0/0", GatewayId: "igw-abc" },
    ],
  };
  const privateTable = {
    Associations: [{ SubnetId: "subnet-aaa1" }],
    Routes: [{ DestinationCidrBlock: "0.0.0.0/0", NatGatewayId: "nat-abc" }],
  };

  it("wires every circuit build.sh to the global cauldron command", () => {
    const root = path.resolve(__dirname, "../../..");
    const builds = [
      "packages/seal/circuits/scripts/build.sh",
      "packages/agent/circuits/scripts/build.sh",
      "packages/roles/circuits/scripts/build.sh",
      "packages/content/circuits/scripts/build.sh",
      "packages/blog-article/circuits/scripts/build.sh",
      "packages/transform/circuits/scripts/build.sh",
      "packages/attestation/circuits/scripts/build.sh",
      "packages/x402/scripts/build.sh",
    ];
    const recorded = path.join(tmp, "cauldron-argv");
    const bin = path.join(tmp, "bin-cauldron");
    fs.mkdirSync(bin, { recursive: true });
    fs.writeFileSync(path.join(bin, "cauldron"), `#!/bin/sh\nprintf '%s\\n' "$@" > ${JSON.stringify(recorded)}\n`);
    fs.chmodSync(path.join(bin, "cauldron"), 0o755);
    const circuitEnv = {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      BUILD_DIR: "/tmp/build",
      CIRCUIT_NAME: "seal-identity",
      PTAU: "/tmp/pot_final.ptau",
      CIRCUIT2_NAME: "listing-binding",
      PTAU2: "/tmp/pot2_final.ptau",
      CIRCUIT3_NAME: "org-identity",
      PTAU3: "/tmp/pot3_final.ptau",
    };
    for (const rel of builds) {
      const file = path.join(root, rel);
      const text = fs.readFileSync(file, "utf8");
      expect(text, rel).toMatch(/\bcauldron phase2 --circuit /);
      expect(text, rel).not.toMatch(/phase2\.sh/);
      expect(text, rel).not.toMatch(/lemma_phase2/);
      expect(text, rel).toMatch(/set -euo pipefail/);
      if (rel === "packages/x402/scripts/build.sh") {
        expect(text, rel).toMatch(/LEMMA_PHASE2:-/);
        expect(text, rel).toMatch(/zkey contribute/);
      } else {
        expect(text, rel).not.toMatch(/zkey contribute/);
      }
      execFileSync("bash", ["-n", file]);
      const calls = [...text.matchAll(/^\s*cauldron phase2 .+$/gm)].map((m) => m[0]);
      expect(calls.length, rel).toBeGreaterThan(0);
      for (const call of calls) {
        fs.rmSync(recorded, { force: true });
        execFileSync("bash", ["-c", call], { env: circuitEnv });
        const argv = fs.readFileSync(recorded, "utf8").trim().split("\n");
        expect(argv[0], rel).toBe("phase2");
        expect(argv, rel).toContain("--circuit");
        expect(argv, rel).toContain("--ptau");
        expect(argv.at(-1), rel).toMatch(/\.ptau$/);
      }
    }
    expect(() => execFileSync("bash", ["-c", "set -euo pipefail\ncauldron phase2 --circuit /tmp/c --ptau /tmp/p"], {
      env: { PATH: "/usr/bin:/bin" },
    })).toThrow(/command not found/);
  });

  it("requires a circuit and derives r1cs, zkeys, and a single ptau", async () => {
    const dir = fs.mkdtempSync(path.join(tmp, "circuit-"));
    const build = path.join(dir, "build");
    fs.mkdirSync(path.join(build, "ptau"), { recursive: true });
    fs.writeFileSync(path.join(build, "seal-identity.r1cs"), "");
    fs.writeFileSync(path.join(build, "seal-identity_0000.zkey"), "");
    fs.writeFileSync(path.join(build, "ptau", "pot17_final.ptau"), "");
    fs.writeFileSync(path.join(build, "ptau", "pot17_0000.ptau"), "");
    const paths = resolveCircuit("seal-identity", { cwd: dir });
    expect(paths).toEqual({
      r1cs: path.join(build, "seal-identity.r1cs"),
      zkeyIn: path.join(build, "seal-identity_0000.zkey"),
      zkeyOut: path.join(build, "seal-identity_final.zkey"),
    });
    expect(resolveCircuit(path.join(build, "seal-identity_0000.zkey"), { cwd: dir }).r1cs).toBe(paths.r1cs);
    expect(findSoleFinalPtau(build)).toBe(path.join(build, "ptau", "pot17_final.ptau"));
    const resolved = resolvePhase2Circuit({ circuit: "seal-identity" }, { cwd: dir });
    expect(resolved.ptau).toBe(path.join(build, "ptau", "pot17_final.ptau"));
    expect(resolved.zkeyOut).toBe(paths.zkeyOut);
    const verify = resolveVerifyInputs({ circuit: "build/seal-identity" }, { cwd: dir });
    expect(verify.attestationPath).toBe(`${paths.zkeyOut}.attestation.cbor`);
    expect(verify.pcrsPath).toBe(`${paths.zkeyOut}.pcrs.json`);
    expect(verify.zkeyIn).toBe(paths.zkeyIn);
    fs.writeFileSync(path.join(build, "ptau", "pot18_final.ptau"), "");
    expect(findSoleFinalPtau(build)).toBeNull();
    await expect(phase2({ "dry-run": true })).rejects.toThrow(/--circuit/);
    const dry = await phase2({ "dry-run": true, circuit: "seal-identity" }, { cwd: dir });
    expect(dry.circuit.zkeyIn).toBe(paths.zkeyIn);
    expect(dry.circuit.ptau).toBeNull();
  });

  it("dry-run keeps the Nitro instance type and the enclave flags", async () => {
    const out = await phase2({
      "dry-run": true, r1cs: "X", "zkey-in": "Y", "zkey-out": "Z", "enclave-memory-mb": "1024",
    });
    expect(out).toMatchObject({
      dryRun: true,
      instanceType: "m6i.xlarge",
      resources: { memoryMb: 1024, cpu: DEFAULT_ENCLAVE_CPU, timeoutMs: DEFAULT_CLIENT_TIMEOUT_MS },
    });
    await expect(phase2({
      "dry-run": true, r1cs: "X", "zkey-in": "Y", "zkey-out": "Z", "instance-type": "t3.xlarge",
    })).rejects.toThrow(/Nitro Enclaves/);
  });

  it("rejects burstable and bare-metal parents and defaults to m6i.xlarge", () => {
    expect(DEFAULT_INSTANCE_TYPE).toBe("m6i.xlarge");
    expect(assertEnclaveInstanceType("m6i.xlarge")).toBe("m6i.xlarge");
    expect(assertEnclaveInstanceType("c6i.2xlarge")).toBe("c6i.2xlarge");
    for (const type of ["t3.xlarge", "t3a.xlarge", "t4g.xlarge", "t2.micro", "u-6tb1.56xlarge", "m6i.metal", "a1.xlarge"]) {
      expect(() => assertEnclaveInstanceType(type)).toThrow(/Nitro Enclaves/);
    }
    expect(() => assertEnclaveInstanceType("not-an-instance")).toThrow(/invalid instance type/);
  });

  it("passes enclave memory, cpu, and timeout through sudo env", () => {
    expect(parseEnclaveResources({})).toEqual({
      memoryMb: DEFAULT_ENCLAVE_MEMORY_MB,
      cpu: DEFAULT_ENCLAVE_CPU,
      timeoutMs: DEFAULT_CLIENT_TIMEOUT_MS,
    });
    const resources = parseEnclaveResources({ "enclave-memory-mb": "12288", "enclave-cpu": "4", "client-timeout-ms": "1000" });
    expect(resources).toEqual({ memoryMb: 12288, cpu: 4, timeoutMs: 1000 });
    expect(remoteSetupCommand(REMOTE_DIR, resources)).toBe(
      `cd ${REMOTE_DIR} && sudo env ENCLAVE_MEMORY_MB=12288 ENCLAVE_CPU=4 CLIENT_TIMEOUT_MS=1000 bash enclave/setup-and-run.sh`,
    );
    expect(() => parseEnclaveResources({ "enclave-memory-mb": "8191" })).toThrow(/enclave-memory-mb/);
    expect(() => parseEnclaveResources({ "enclave-cpu": "1" })).toThrow(/enclave-cpu/);
    expect(() => parseEnclaveResources({ "client-timeout-ms": "abc" })).toThrow(/client-timeout-ms/);
    expect(() => remoteSetupCommand("/tmp/other", resources)).toThrow(/remote dir/);
  });

  it("sizes the enclave node heap from memory and rejects injected options", () => {
    expect(enclaveHeapMb(8192)).toBe(6144);
    expect(enclaveHeapMb(12288)).toBe(9216);
    const header = contributeJobHeader(6144);
    expect(parseContributeJobHeader(header)).toEqual({ nodeOptions: "--max-old-space-size=6144" });
    expect(parseContributeJobHeader(contributeJobHeader(undefined))).toEqual({ nodeOptions: "--max-old-space-size=6144" });
    expect(() => parseContributeJobHeader(Buffer.from(JSON.stringify({ v: 1, maxOldSpaceSize: "6144 --inspect" })))).toThrow(/max-old-space-size/);
    expect(() => parseContributeJobHeader(Buffer.from(JSON.stringify({ v: 1, maxOldSpaceSize: 128 })))).toThrow(/max-old-space-size/);
    expect(() => enclaveHeapMb(512)).toThrow(/ENCLAVE_MEMORY_MB/);
  });

  it("selects only a subnet whose route table reaches an internet gateway", () => {
    expect(routeTableForSubnet("subnet-bbb2", [publicTable, privateTable])).toBe(publicTable);
    expect(routeTableForSubnet("subnet-aaa1", [publicTable, privateTable])).toBe(privateTable);
    expect(pickPublicSubnet([
      { SubnetId: "subnet-aaa1", State: "available" },
      { SubnetId: "subnet-bbb2", State: "available" },
    ], [publicTable, privateTable])).toBe("subnet-bbb2");
    expect(pickPublicSubnet([{ SubnetId: "subnet-aaa1", State: "available" }], [publicTable, privateTable])).toBeNull();
  });

  it("launches into an explicit public subnet and assigns a public IPv4", () => {
    const args = runInstancesArgs({
      ami: "ami-123", instanceType: "m6i.xlarge", keyName: "lemma-tee-lts-1-abcd",
      sgId: "sg-abc", subnetId: "subnet-bbb2", instanceTags: "ResourceType=instance,Tags=[]", region: "us-east-1",
    });
    expect(args).toContain("--subnet-id");
    expect(args).toContain("subnet-bbb2");
    expect(args).toContain("--associate-public-ip-address");
    expect(args).not.toContain("--network-interfaces");
    expect(() => runInstancesArgs({
      ami: "ami-123", instanceType: "m6i.xlarge", keyName: "k", sgId: "sg-abc",
      subnetId: "default", instanceTags: "t", region: "us-east-1",
    })).toThrow(/subnet/);
  });

  it("uses the default VPC public subnet when one exists", async () => {
    const calls = [];
    const awsImpl = async (args) => {
      calls.push(args.join(" "));
      if (args[1] === "describe-vpcs") return JSON.stringify(["vpc-def"]);
      if (args[1] === "describe-subnets") return JSON.stringify({ Subnets: [{ SubnetId: "subnet-bbb2", State: "available" }] });
      if (args[1] === "describe-route-tables") return JSON.stringify({ RouteTables: [publicTable] });
      throw new Error(`unexpected ${args[1]}`);
    };
    const network = await resolveLaunchNetwork({ region: "us-east-1", id: "lts-abc-deadbeef", awsImpl });
    expect(network).toEqual({ created: false, vpcId: "vpc-def", subnetId: "subnet-bbb2" });
    expect(calls.some((line) => line.includes("create-vpc"))).toBe(false);
  });

  it("creates a dedicated VPC when the region has no public subnet, and tears it down", async () => {
    const calls = [];
    const awsImpl = async (args) => {
      calls.push(args);
      const api = args[1];
      if (api === "create-key-pair") return JSON.stringify({ KeyMaterial: "KEY" });
      if (api === "describe-vpcs" && args.includes("Name=is-default,Values=true")) return "[]";
      if (api === "describe-vpcs") return JSON.stringify(["vpc-abc"]);
      if (api === "create-vpc") return JSON.stringify({ Vpc: { VpcId: "vpc-abc" } });
      if (api === "create-subnet") return JSON.stringify({ Subnet: { SubnetId: "subnet-abc" } });
      if (api === "modify-subnet-attribute") return "";
      if (api === "create-internet-gateway") return JSON.stringify({ InternetGateway: { InternetGatewayId: "igw-abc" } });
      if (api === "attach-internet-gateway") return "";
      if (api === "describe-route-tables") return JSON.stringify({ RouteTables: [{ RouteTableId: "rtb-abc" }] });
      if (api === "create-route") return "";
      if (api === "create-security-group") return JSON.stringify({ GroupId: "sg-abc" });
      if (api === "authorize-security-group-ingress") return "";
      if (api === "run-instances") return JSON.stringify({ Instances: [{ InstanceId: "i-abc" }] });
      if (api === "wait") return "";
      if (api === "describe-instances") return JSON.stringify("203.0.113.10");
      if (api === "terminate-instances" || api === "delete-key-pair") return "";
      if (api === "describe-network-interfaces") return "";
      if (api === "delete-security-group" || api === "delete-subnet" || api === "detach-internet-gateway" || api === "delete-internet-gateway" || api === "delete-vpc") return "";
      if (api === "describe-subnets") return JSON.stringify(["subnet-abc"]);
      if (api === "describe-internet-gateways") return JSON.stringify(["igw-abc"]);
      throw new Error(`unexpected ${args.join(" ")}`);
    };
    const state = await provision({
      region: "us-east-1", instanceType: "m6i.xlarge", ami: "ami-123",
      awsImpl, fetchIp: async () => "203.0.113.4", sleep: async () => {},
    });
    try {
      expect(state.network).toMatchObject({ created: true, vpcId: "vpc-abc", subnetId: "subnet-abc", igwId: "igw-abc" });
      expect(state.ip).toBe("203.0.113.10");
      const sg = calls.find((args) => args[1] === "create-security-group");
      expect(sg).toContain("--vpc-id");
      expect(sg).toContain("vpc-abc");
      const run = calls.find((args) => args[1] === "run-instances");
      expect(run).toContain("--subnet-id");
      expect(run).toContain("subnet-abc");
      expect(run).toContain("--associate-public-ip-address");
      expect(run).toContain("m6i.xlarge");
      const vpc = calls.find((args) => args[1] === "create-vpc");
      expect(vpc).toContain("10.66.0.0/16");
    } finally {
      await teardownById(state, { awsImpl, sleep: async () => {} });
    }
    expect(calls.some((args) => args[1] === "delete-vpc" && args.includes("vpc-abc"))).toBe(true);
    expect(calls.some((args) => args[1] === "delete-subnet")).toBe(true);
    expect(calls.some((args) => args[1] === "detach-internet-gateway")).toBe(true);

    calls.length = 0;
    await teardownByRunId("lts-abc123-deadbeef", "us-east-1", { awsImpl, sleep: async () => {} });
    expect(calls.some((args) => args[1] === "delete-vpc")).toBe(true);
  });

  it("leaves a default VPC in place when phase2 did not create it", async () => {
    const calls = [];
    await teardownById({
      id: "lts-abc123-deadbeef",
      region: "us-east-1",
      sgId: "sg-abc",
      network: { created: false, vpcId: "vpc-def", subnetId: "subnet-bbb2" },
    }, {
      awsImpl: async (args) => { calls.push(args[1]); return ""; },
      sleep: async () => {},
    });
    expect(calls).toContain("delete-security-group");
    expect(calls).not.toContain("delete-vpc");
    expect(calls).not.toContain("delete-subnet");
  });

  it("builds a dedicated VPC when the default VPC has no public subnet", async () => {
    const calls = [];
    const awsImpl = async (args) => {
      calls.push(args[1]);
      if (args[1] === "describe-vpcs") return JSON.stringify(["vpc-def"]);
      if (args[1] === "describe-subnets") return JSON.stringify({ Subnets: [{ SubnetId: "subnet-aaa1", State: "available" }] });
      if (args[1] === "describe-route-tables" && calls.filter((name) => name === "describe-route-tables").length === 1) {
        return JSON.stringify({ RouteTables: [privateTable] });
      }
      if (args[1] === "create-vpc") return JSON.stringify({ Vpc: { VpcId: "vpc-abc" } });
      if (args[1] === "create-subnet") return JSON.stringify({ Subnet: { SubnetId: "subnet-abc" } });
      if (args[1] === "modify-subnet-attribute") return "";
      if (args[1] === "create-internet-gateway") return JSON.stringify({ InternetGateway: { InternetGatewayId: "igw-abc" } });
      if (args[1] === "attach-internet-gateway") return "";
      if (args[1] === "describe-route-tables") return JSON.stringify({ RouteTables: [{ RouteTableId: "rtb-abc" }] });
      if (args[1] === "create-route") return "";
      throw new Error(`unexpected ${args.join(" ")}`);
    };
    const network = await resolveLaunchNetwork({ region: "us-east-1", id: "lts-abc123-deadbeef", awsImpl });
    expect(network.created).toBe(true);
    expect(network.vpcId).toBe("vpc-abc");
    expect(calls).toContain("create-vpc");
  });
});
