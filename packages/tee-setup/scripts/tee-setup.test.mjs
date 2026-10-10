import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { createSign } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {
  cborEncode,
  cborDecode,
  pcrsMatch,
  parseArgs,
  planLifecycle,
  verifyChain,
  verifyAttestation,
  verifyBundle,
  sha256Hex,
} from "./tee-setup.mjs";

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

const makeAttestation = (overrides = {}, { tamperSig = false } = {}) => {
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
  const protectedBstr = cborEncode(new Map([[1, -7], [4, "test-kid"]]));
  const sigStructure = cborEncode(["Signature1", protectedBstr, Buffer.alloc(0), payloadBstr]);
  const signer = createSign("SHA384");
  signer.update(sigStructure);
  const signature = signer.sign({ key: fs.readFileSync(path.join(tmp, "leaf.key")), dsaEncoding: "der" });
  if (tamperSig) signature[0] ^= 0xff;
  return cborEncode([protectedBstr, new Map([[33, [rootDer]], [34, leafDer]]), payloadBstr, signature]);
};

describe("cborEncode/cborDecode", () => {
  it("roundtrips ints, bytes, strings, arrays and maps", () => {
    const value = new Map([
      ["int", 12345],
      ["neg", -7],
      ["bytes", Buffer.from("hello")],
      ["arr", [1, "two", Buffer.from("3")]],
    ]);
    const [decoded, offset] = cborDecode(cborEncode(value));
    expect(offset).toBeGreaterThan(0);
    expect(decoded.get("int")).toBe(12345);
    expect(decoded.get("neg")).toBe(-7);
    expect(Buffer.from(decoded.get("bytes")).toString()).toBe("hello");
    expect(decoded.get("arr")[1]).toBe("two");
  });
});

describe("pcrsMatch", () => {
  it("passes when PCR0/1/2 match", () => {
    const p = { 0: "AA", 1: "bb", 2: "CC" };
    expect(pcrsMatch(p, { 0: "aa", 1: "BB", 2: "cc" }).ok).toBe(true);
  });
  it("fails on mismatch or missing PCR", () => {
    expect(pcrsMatch({ 0: "AA", 1: "bb", 2: "CC" }, { 0: "00", 1: "bb", 2: "CC" }).ok).toBe(false);
    expect(pcrsMatch({ 0: "AA", 1: "bb", 2: "CC" }, { 0: "AA", 1: "bb" }).ok).toBe(false);
  });
});

describe("parseArgs / planLifecycle", () => {
  it("parses command and options", () => {
    const { command, opts } = parseArgs(["phase2", "--r1cs", "a.r1cs", "--dry-run", "--zkey-out", "b.zkey"]);
    expect(command).toBe("phase2");
    expect(opts.r1cs).toBe("a.r1cs");
    expect(opts["dry-run"]).toBe(true);
  });
  it("orders provision before teardown", () => {
    const steps = planLifecycle();
    expect(steps.findIndex((s) => s.startsWith("provision"))).toBeLessThan(steps.findIndex((s) => s.startsWith("teardown")));
    expect(steps.some((s) => s.includes("teardown"))).toBe(true);
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
});

describe("verifyAttestation", () => {
  it("verifies a correctly signed COSE_Sign1 document offline", () => {
    const result = verifyAttestation(makeAttestation(), { rootCertPem: rootPem });
    expect(result.ok).toBe(true);
    expect(result.digest).toBe("SHA384");
    expect(result.pcrs["0"]).toBe(Buffer.alloc(48, 1).toString("hex"));
    expect(result.nonce).toBe(Buffer.alloc(32, 9).toString("hex"));
  });
  it("rejects a tampered signature", () => {
    expect(verifyAttestation(makeAttestation({}, { tamperSig: true }), { rootCertPem: rootPem }).ok).toBe(false);
  });
  it("detects PCR divergence at the bundle level", () => {
    const doc = makeAttestation({ pcrs: new Map([[0, Buffer.alloc(48, 7)], [1, Buffer.alloc(48, 2)], [2, Buffer.alloc(48, 3)]]) });
    const result = verifyAttestation(doc, { rootCertPem: rootPem });
    expect(result.ok).toBe(true);
    const pcr = pcrsMatch(
      { 0: Buffer.alloc(48, 1).toString("hex"), 1: Buffer.alloc(48, 2).toString("hex"), 2: Buffer.alloc(48, 3).toString("hex") },
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
      0: Buffer.alloc(48, 1).toString("hex"),
      1: Buffer.alloc(48, 2).toString("hex"),
      2: Buffer.alloc(48, 3).toString("hex"),
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
});
