import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { poseidon6 } from "poseidon-lite";
import { computeCredentialCommitment } from "./commit.js";
import type { NormalizedAgentCredential } from "./types.js";

// ── BN254 field prime ───────────────────────────────────────────────

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

const toScalar = (value: string | number): bigint =>
  typeof value === "number"
    ? BigInt(value) % BN254_PRIME
    : /^\d+$/.test(value)
      ? BigInt(value) % BN254_PRIME
      : BigInt(`0x${createHash("sha256").update(value).digest("hex")}`) % BN254_PRIME;

// ── Test data matching agent-identity.test.ts buildValidInput ───────

const testNormalizedCredential: NormalizedAgentCredential = {
  schema: "agent-identity-authority-v1",
  identity: {
    agentId: "agent-1",
    subjectId: "subject-1",
    controllerId: "",
    orgId: "",
  },
  authority: {
    roles: "admin",
    scopes: "",
    permissions: "",
  },
  financial: {
    spendLimit: "50000",
    currency: "USD",
    paymentPolicy: "",
  },
  lifecycle: {
    issuedAt: "2025-04-29T00:00:00.000Z",
    expiresAt: "2026-04-29T00:00:00.000Z",
    revoked: "false",
    revocationRef: "",
  },
  provenance: {
    issuerId: "issuer-1",
    sourceSystem: "",
    generatorId: "",
    chainId: "1",
    network: "ethereum",
  },
};

describe("computeCredentialCommitment", () => {
  it("produces section hashes matching circuit test expectations", () => {
    const salt = "agent-identity-test-salt";
    const saltHex = Buffer.from(salt).toString("hex");
    // Pad to 64 hex chars for consistency with the circuit test
    const paddedSaltHex = saltHex.padStart(64, "0");

    const result = computeCredentialCommitment(testNormalizedCredential, paddedSaltHex);

    // Verify section hashes match the circuit test's toScalar computations
    const expectedIdentityHash = toScalar(JSON.stringify(testNormalizedCredential.identity));
    const expectedAuthorityHash = toScalar(JSON.stringify(testNormalizedCredential.authority));
    const expectedFinancialHash = toScalar(JSON.stringify(testNormalizedCredential.financial));
    const expectedLifecycleHash = toScalar(JSON.stringify(testNormalizedCredential.lifecycle));
    const expectedProvenanceHash = toScalar(JSON.stringify(testNormalizedCredential.provenance));

    expect(result.sectionHashes.identityHash).toBe(expectedIdentityHash.toString());
    expect(result.sectionHashes.authorityHash).toBe(expectedAuthorityHash.toString());
    expect(result.sectionHashes.financialHash).toBe(expectedFinancialHash.toString());
    expect(result.sectionHashes.lifecycleHash).toBe(expectedLifecycleHash.toString());
    expect(result.sectionHashes.provenanceHash).toBe(expectedProvenanceHash.toString());
  });

  it("computes root matching Poseidon6 from circuit test", () => {
    const salt = "agent-identity-test-salt";
    const saltHex = Buffer.from(salt).toString("hex").padStart(64, "0");

    const result = computeCredentialCommitment(testNormalizedCredential, saltHex);

    // Replicate circuit test's Poseidon6 computation
    const identityHash = toScalar(JSON.stringify(testNormalizedCredential.identity));
    const authorityHash = toScalar(JSON.stringify(testNormalizedCredential.authority));
    const financialHash = toScalar(JSON.stringify(testNormalizedCredential.financial));
    const lifecycleHash = toScalar(JSON.stringify(testNormalizedCredential.lifecycle));
    const provenanceHash = toScalar(JSON.stringify(testNormalizedCredential.provenance));
    const saltScalar = BigInt(`0x${saltHex}`);

    const expectedRoot = poseidon6([
      identityHash,
      authorityHash,
      financialHash,
      lifecycleHash,
      provenanceHash,
      saltScalar,
    ]);

    expect(result.root).toBe(expectedRoot.toString());
  });

  it("includes salt in the result", () => {
    const result = computeCredentialCommitment(testNormalizedCredential);
    expect(result.salt).toMatch(/^0x/);
    expect(result.salt.length).toBe(66); // "0x" + 64 hex chars
  });

  it("generates random salt when not provided", () => {
    const result1 = computeCredentialCommitment(testNormalizedCredential);
    const result2 = computeCredentialCommitment(testNormalizedCredential);
    // Different salts should produce different roots
    expect(result1.salt).not.toBe(result2.salt);
    expect(result1.root).not.toBe(result2.root);
  });

  it("produces deterministic results with same salt", () => {
    const salt = "0".repeat(64);
    const result1 = computeCredentialCommitment(testNormalizedCredential, salt);
    const result2 = computeCredentialCommitment(testNormalizedCredential, salt);
    expect(result1.root).toBe(result2.root);
    expect(result1.sectionHashes).toEqual(result2.sectionHashes);
  });
});
