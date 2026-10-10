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
  cborEncode,
  cborDecode,
  commitmentNonceHex,
  commitmentNonceHexFromFiles,
  isIpv4,
  PINNED_ROOT_FINGERPRINT,
  pcrsMatch,
  parseArgs,
  planLifecycle,
  sha256Hex,
  verifyChain,
  verifyAttestation,
  verifyBundle,
} from "./tee-setup.mjs";
import { commitmentNonceHex as serveNonce, frame, MAX_FRAME, readFrame } from "../enclave/frame.mjs";

const pcrHex = (byte) => Buffer.alloc(48, byte).toString("hex");

// --- テスト用証明書チェーン（root CA → leaf）を openssl で生成 ---
let rootPem;
let leafDer;
let rootDer;
let tmp;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tee-setup-test-"));
  const run = (args) => execFileSync("openssl", args, { cwd: tmp, stdio: ["ignore", "pipe", "ignore"] });
  run(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "root.key"]);
  run(["req", "-x509", "-key", "root.key", "-out", "root.pem", "-days", "30",
    "-subj", "/C=US/O=Test/CN=test-nitro-root"]);
  run(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "leaf.key"]);
  run(["req", "-new", "-key", "leaf.key", "-out", "leaf.csr", "-subj", "/C=US/O=Test/CN=test-leaf"]);
  run(["x509", "-req", "-in", "leaf.csr", "-CA", "root.pem", "-CAkey", "root.key",
    "-CAcreateserial", "-out", "leaf.pem", "-days", "30"]);
  rootPem = fs.readFileSync(path.join(tmp, "root.pem"), "utf8");
  const pemToDer = (p) => Buffer.from(p.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), "base64");
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
    ["timestamp", 1760000000000],
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
