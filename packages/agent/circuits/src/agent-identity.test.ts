import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { poseidon1, poseidon2, poseidon6 } from "poseidon-lite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");

// ── BN254 field prime ───────────────────────────────────────────────

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

// ── toScalar: same as @lemmaoracle/sdk commitments.toScalar ─────────

const toScalar = (value: string | number): bigint =>
  typeof value === "number"
    ? BigInt(value) % BN254_PRIME
    : /^\d+$/.test(value)
      ? BigInt(value) % BN254_PRIME
      : BigInt(`0x${createHash("sha256").update(value).digest("hex")}`) % BN254_PRIME;

// ── Witness computation via snarkjs ─────────────────────────────────

type CircuitSignals = Readonly<Record<string, string>>;

const calculateWitness = async (input: CircuitSignals): Promise<string[]> => {
  const { wtns } = await import("snarkjs");
  const wasmPath = path.join(BUILD_DIR, "agent-identity_js", "agent-identity.wasm");
  const wtnsPath = path.join(BUILD_DIR, "test-witness.wtns");

  const bigIntInput = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, BigInt(v)]),
  );

  await wtns.calculate(bigIntInput, wasmPath, wtnsPath);

  const wtnsJson = await wtns.exportJson(wtnsPath);
  fs.unlinkSync(wtnsPath);
  return wtnsJson.map((v: bigint) => v.toString());
};

// ── Witness builder using real Poseidon hashes ──────────────────────

const buildValidInput = (nowSec = 1746000000): CircuitSignals => {
  // Section hashes (same method as SDK: toScalar on JSON string)
  const identityHash = toScalar(JSON.stringify({ agentId: "agent-1", subjectId: "subject-1", controllerId: "", orgId: "" }));
  const authorityHash = toScalar(JSON.stringify({ roles: "admin", scopes: "", permissions: "" }));
  const financialHash = toScalar(JSON.stringify({ spendLimit: "50000", currency: "USD", paymentPolicy: "" }));
  const lifecycleHash = toScalar(JSON.stringify({ issuedAt: "2025-04-29T00:00:00.000Z", expiresAt: "2026-04-29T00:00:00.000Z", revoked: "false", revocationRef: "" }));
  const provenanceHash = toScalar(JSON.stringify({ issuerId: "issuer-1", sourceSystem: "", generatorId: "", chainId: "1", network: "ethereum" }));
  const salt = toScalar("agent-identity-test-salt");

  // credentialCommitment = Poseidon6(identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, salt)
  const credentialCommitment = poseidon6([identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, salt]);

  // Issuer key pair
  const issuerSecretKey = toScalar("issuer-secret-key-test");
  const issuerPublicKey = poseidon1([issuerSecretKey]);

  // MAC = Poseidon2(credentialCommitment, issuerSecretKey)
  const mac = poseidon2([credentialCommitment, issuerSecretKey]);

  return {
    identityHash: identityHash.toString(),
    authorityHash: authorityHash.toString(),
    financialHash: financialHash.toString(),
    lifecycleHash: lifecycleHash.toString(),
    provenanceHash: provenanceHash.toString(),
    salt: salt.toString(),
    issuerSecretKey: issuerSecretKey.toString(),
    mac: mac.toString(),
    issuedAt: "1745900000",
    expiresAt: "1777436000",
    revoked: "0",
    credentialCommitment: credentialCommitment.toString(),
    issuerPublicKey: issuerPublicKey.toString(),
    nowSec: nowSec.toString(),
  };
};

// ── Tests ───────────────────────────────────────────────────────────

describe("circuit build artifacts", () => {
  it("R1CS file exists", () => {
    expect(fs.existsSync(path.join(BUILD_DIR, "agent-identity.r1cs"))).toBe(true);
  });

  it("WASM file exists", () => {
    expect(fs.existsSync(path.join(BUILD_DIR, "agent-identity_js", "agent-identity.wasm"))).toBe(true);
  });

  it("zkey file exists", () => {
    expect(fs.existsSync(path.join(BUILD_DIR, "agent-identity_final.zkey"))).toBe(true);
  });

  it("verification key has correct structure", () => {
    const vkeyPath = path.join(BUILD_DIR, "agent-identity_vkey.json");
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    expect(vkey.protocol).toBe("groth16");
    expect(vkey.curve).toBe("bn128");
    // IC: 1 constant + 3 public inputs = 4
    expect(vkey.IC.length).toBe(4);
  });
});

describe("agent-identity-v1 circuit constraints", () => {
  it("accepts a valid credential within lifecycle window", async () => {
    const input = buildValidInput(1746000000);
    const witness = await calculateWitness(input);
    expect(witness).toBeDefined();
    expect(witness.length).toBeGreaterThan(0);
  }, 30000);

  it("rejects a revoked credential", async () => {
    const input = { ...buildValidInput(), revoked: "1" };
    await expect(calculateWitness(input)).rejects.toThrow();
  }, 30000);

  it("rejects a credential where issuedAt > nowSec", async () => {
    const input = buildValidInput(1000000000);
    await expect(calculateWitness(input)).rejects.toThrow();
  }, 30000);

  it("accepts a credential with expiresAt = 0 (no expiration)", async () => {
    const input = { ...buildValidInput(), expiresAt: "0" };
    const witness = await calculateWitness(input);
    expect(witness).toBeDefined();
    expect(witness.length).toBeGreaterThan(0);
  }, 30000);

  it("rejects an expired credential (nowSec > expiresAt)", async () => {
    const input = buildValidInput(1800000000);
    await expect(calculateWitness(input)).rejects.toThrow();
  }, 30000);

  it("produces correct credentialCommitment in witness output", async () => {
    const input = buildValidInput(1746000000);
    const witness = await calculateWitness(input);
    // Public output index 1 = credentialCommitment
    // (index 0 = constant 1, index 1 = credentialCommitment, 2 = issuerPublicKey, 3 = nowSec)
    expect(witness[1]).toBe(input.credentialCommitment);
  }, 30000);

  it("produces correct issuerPublicKey in witness output", async () => {
    const input = buildValidInput(1746000000);
    const witness = await calculateWitness(input);
    expect(witness[2]).toBe(input.issuerPublicKey);
  }, 30000);
});
