import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { createSign, X509Certificate } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cborEncode,
  commitmentNonceHex,
  hashBuildInputs,
  verifyAttestation,
  verifyBuildInputs,
  verifyBundle,
  verifyChain,
} from "./cauldron.mjs";

let dir, rootPem, rootDer, interDer, leafDer, leafKey;
const enclaveDir = fileURLToPath(new URL("../enclave/", import.meta.url));
const pcrs = { 0: "41".repeat(48), 1: "42".repeat(48), 2: "43".repeat(48) };
const zkeyIn = Buffer.from("initial zkey fixture");
const zkeyOut = Buffer.from(
  "output fixture whose toxic waste could be retained by an unapproved enclave",
);
const nonce = Buffer.from(commitmentNonceHex(zkeyIn, zkeyOut), "hex");
beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "cauldron-review-"));
  const openssl = (args) =>
    execFileSync("openssl", args, { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  openssl(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", "root.key"]);
  openssl([
    "req",
    "-x509",
    "-key",
    "root.key",
    "-out",
    "root.pem",
    "-days",
    "2",
    "-subj",
    "/CN=review-root",
    "-addext",
    "basicConstraints=critical,CA:TRUE",
    "-addext",
    "keyUsage=critical,keyCertSign,cRLSign",
  ]);
  const issue = (name, issuer, ca) => {
    openssl(["ecparam", "-name", "secp384r1", "-genkey", "-noout", "-out", name + ".key"]);
    openssl([
      "req",
      "-new",
      "-key",
      name + ".key",
      "-out",
      name + ".csr",
      "-subj",
      "/CN=review-" + name,
    ]);
    fs.writeFileSync(
      path.join(dir, name + ".ext"),
      "basicConstraints=critical,CA:" +
        String(ca).toUpperCase() +
        "\nkeyUsage=critical," +
        (ca ? "keyCertSign,cRLSign" : "digitalSignature") +
        "\n",
    );
    openssl([
      "x509",
      "-req",
      "-in",
      name + ".csr",
      "-CA",
      issuer + ".pem",
      "-CAkey",
      issuer + ".key",
      "-CAcreateserial",
      "-out",
      name + ".pem",
      "-days",
      "2",
      "-extfile",
      name + ".ext",
    ]);
  };
  issue("inter", "root", true);
  issue("leaf", "inter", false);
  rootPem = fs.readFileSync(path.join(dir, "root.pem"), "utf8");
  rootDer = new X509Certificate(rootPem).raw;
  interDer = new X509Certificate(fs.readFileSync(path.join(dir, "inter.pem"))).raw;
  leafDer = new X509Certificate(fs.readFileSync(path.join(dir, "leaf.pem"))).raw;
  leafKey = fs.readFileSync(path.join(dir, "leaf.key"));
});
afterAll(() => {
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
});
function attestation(nitroFormat = true) {
  const payload = cborEncode(
    new Map([
      ["module_id", "review-enclave"],
      ["digest", "SHA384"],
      ["timestamp", Date.now()],
      ["pcrs", new Map(Object.entries(pcrs).map(([k, v]) => [Number(k), Buffer.from(v, "hex")]))],
      ["certificate", leafDer],
      ["cabundle", [rootDer, interDer]],
      ["nonce", nonce],
    ]),
  );
  const protectedHeader = cborEncode(new Map([[1, -35]]));
  const signer = createSign("SHA384");
  signer.update(cborEncode(["Signature1", protectedHeader, Buffer.alloc(0), payload]));
  const signature = signer.sign({ key: leafKey, dsaEncoding: "ieee-p1363" });
  const unprotected = nitroFormat
    ? new Map()
    : new Map([
        [34, leafDer],
        [33, [interDer, rootDer]],
      ]);
  return cborEncode([protectedHeader, unprotected, payload, signature]);
}
describe("Nitro attestation trust policy", () => {
  it("accepts payload certificates even when unprotected contains legacy certificate fields", () => {
    expect(verifyAttestation(attestation(false), { rootCertPem: rootPem }).ok).toBe(true);
    expect(verifyChain(leafDer, [interDer, rootDer], rootPem).ok).toBe(false);
  });
  it("must accept a correctly signed Nitro-shaped attestation with an empty unprotected header", () => {
    const result = verifyAttestation(attestation(true), { rootCertPem: rootPem });
    expect(result.ok).toBe(true);
  });
  it("must accept the root-first CA bundle specified by AWS", () => {
    const result = verifyChain(leafDer, [rootDer, interDer], rootPem);
    expect(result.ok).toBe(true);
  });
  it("must reject an enclave whose PCRs are supplied only by the untrusted parent", () => {
    const attPath = path.join(dir, "att.cbor");
    const manifestPath = path.join(dir, "manifest.json");
    const inPath = path.join(dir, "in.zkey");
    const outPath = path.join(dir, "out.zkey");
    fs.writeFileSync(attPath, attestation());
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        pcrs,
        golden: { measured: true, pcrs },
        build: { schema: "lemma-cauldron.build.v1", inputs: hashBuildInputs(enclaveDir) },
      }),
    );
    fs.writeFileSync(inPath, zkeyIn);
    fs.writeFileSync(outPath, zkeyOut);
    const result = verifyBundle({
      attestationPath: attPath,
      pcrsPath: manifestPath,
      zkeyIn: inPath,
      zkeyOut: outPath,
      buildDir: enclaveDir,
      rootCertPem: rootPem,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/golden/);
  });
  it("must include the actual entropy generation and attestation code in build-input hashes", () => {
    const copy = path.join(dir, "enclave");
    fs.cpSync(enclaveDir, copy, { recursive: true });
    const before = hashBuildInputs(copy);
    fs.appendFileSync(path.join(copy, "serve.mjs"), "\n// substituted runtime code\n");
    expect(hashBuildInputs(copy)).not.toEqual(before);
    expect(verifyBuildInputs(before, copy).ok).toBe(false);
  });

  it("accepts approved PCRs and rejects a different independently approved image", () => {
    const attestationPath = path.join(dir, "approved.cbor");
    const pcrsPath = path.join(dir, "approved-manifest.json");
    const goldenPath = path.join(dir, "approved-golden.json");
    const nonceHash = nonce.toString("hex");
    fs.writeFileSync(attestationPath, attestation());
    fs.writeFileSync(
      pcrsPath,
      JSON.stringify({ pcrs, build: { inputs: hashBuildInputs(enclaveDir) } }),
    );
    fs.writeFileSync(goldenPath, JSON.stringify({ measured: true, pcrs }));
    const opts = { attestationPath, pcrsPath, goldenPath, nonceHash, rootCertPem: rootPem };
    expect(verifyBundle(opts).ok).toBe(true);
    fs.writeFileSync(
      goldenPath,
      JSON.stringify({ measured: true, pcrs: { ...pcrs, 2: "44".repeat(48) } }),
    );
    expect(verifyBundle(opts).reason).toMatch(/golden PCR mismatch/);
  });

  it("requires complete build hashes and never skips golden validation", () => {
    const attestationPath = path.join(dir, "build.cbor");
    const pcrsPath = path.join(dir, "build-manifest.json");
    const goldenPath = path.join(dir, "build-golden.json");
    fs.writeFileSync(attestationPath, attestation());
    fs.writeFileSync(goldenPath, JSON.stringify({ measured: true, pcrs }));
    const opts = {
      attestationPath,
      pcrsPath,
      goldenPath,
      nonceHash: nonce.toString("hex"),
      rootCertPem: rootPem,
    };
    fs.writeFileSync(pcrsPath, JSON.stringify({ pcrs }));
    expect(verifyBundle(opts).reason).toMatch(/build input hashes missing/);
    expect(verifyBundle({ ...opts, skipBuildCheck: true }).ok).toBe(true);
    const inputs = hashBuildInputs(enclaveDir);
    delete inputs["frame.mjs"];
    fs.writeFileSync(pcrsPath, JSON.stringify({ pcrs, build: { inputs } }));
    expect(verifyBundle(opts).reason).toMatch(/build input hash mismatch/);
    fs.writeFileSync(goldenPath, JSON.stringify({ measured: false, pcrs }));
    expect(verifyBundle({ ...opts, skipBuildCheck: true }).ok).toBe(false);
  });

  it("rejects missing and malformed golden measurements before any AWS command", () => {
    const stem = path.join(dir, "preflight");
    fs.writeFileSync(stem + ".r1cs", "fixture");
    fs.writeFileSync(stem + "_0000.zkey", "fixture");
    const bin = path.join(dir, "bin");
    fs.mkdirSync(bin);
    const calls = path.join(dir, "aws-called");
    fs.writeFileSync(path.join(bin, "aws"), '#!/bin/sh\ntouch "' + calls + '"\nexit 1\n');
    fs.chmodSync(path.join(bin, "aws"), 0o755);
    const goldenPath = path.join(dir, "preflight-golden.json");
    const cli = fileURLToPath(new URL("./cauldron.mjs", import.meta.url));
    const run = (args) =>
      execFileSync(process.execPath, [cli, "phase2", "--circuit", stem, ...args], {
        env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH },
        timeout: 5000,
        stdio: ["ignore", "pipe", "pipe"],
      });
    expect(() => run([])).toThrow(/golden PCR verification failed/);
    expect(() => run(["--golden", goldenPath])).toThrow(/golden PCR verification failed/);
    for (const doc of [
      { measured: false, pcrs },
      { measured: true, pcrs: { 0: pcrs[0] } },
      { pcrs },
    ]) {
      fs.writeFileSync(goldenPath, JSON.stringify(doc));
      expect(() => run(["--golden", goldenPath])).toThrow(/golden PCR verification failed/);
    }
    expect(fs.existsSync(calls)).toBe(false);
  });
});
