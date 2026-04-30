import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── Field hash: SHA-256 → BN254-safe field element ─────────────────

const fieldHash = (s: string): string => {
  const digest = Buffer.from(createHash("sha256").update(s, "utf8").digest());
  const masked = Buffer.concat([Buffer.from([digest[0] & 0x0f]), digest.subarray(1)]);
  return BigInt("0x" + masked.toString("hex")).toString();
};

// ── Normalized credential type (matches lemma-agent WASM output) ────

type NormalizedCredential = Readonly<{
  identity: Readonly<{
    agentId: string;
    subjectId: string;
    controllerId: string;
    orgId: string;
  }>;
  authority: Readonly<{
    roles: string;
    scopes: string;
    permissions: string;
  }>;
  financial: Readonly<{
    spendLimit: string;
    currency: string;
    paymentPolicy: string;
  }>;
  lifecycle: Readonly<{
    issuedAt: string;
    expiresAt: string;
    revoked: string;
    revocationRef: string;
  }>;
  provenance: Readonly<{
    issuerId: string;
    sourceSystem: string;
    generatorId: string;
    chainId: string;
    network: string;
  }>;
}>;

const sampleNormalizedCred: NormalizedCredential = {
  identity: {
    agentId: "agent-0xabc123",
    subjectId: "did:lemma:agent:0xabc123",
    controllerId: "did:lemma:org:acme",
    orgId: "acme",
  },
  authority: {
    roles: "purchaser,viewer",
    scopes: "procurement,reporting",
    permissions: "payments:create,reports:read",
  },
  financial: {
    spendLimit: "50000",
    currency: "USD",
    paymentPolicy: "auto-approve-below-limit",
  },
  lifecycle: {
    issuedAt: "2025-04-29T00:00:00.000Z",
    expiresAt: "2026-04-29T00:00:00.000Z",
    revoked: "false",
    revocationRef: "",
  },
  provenance: {
    issuerId: "did:lemma:org:trust-anchor",
    sourceSystem: "",
    generatorId: "",
    chainId: "1",
    network: "ethereum",
  },
};

// ── Witness builder ─────────────────────────────────────────────────

type AgentIdentityWitness = Readonly<{
  identityHash: string;
  authorityHash: string;
  financialHash: string;
  lifecycleHash: string;
  provenanceHash: string;
  salt: string;
  issuerSecretKey: string;
  mac: string;
  issuedAt: string;
  expiresAt: string;
  revoked: string;
  credentialCommitment: string;
  issuerPublicKey: string;
  nowSec: string;
}>;

const buildWitness = (
  cred: NormalizedCredential,
  nowSec: number,
): AgentIdentityWitness => {
  const identityHash = fieldHash(JSON.stringify(cred.identity));
  const authorityHash = fieldHash(JSON.stringify(cred.authority));
  const financialHash = fieldHash(JSON.stringify(cred.financial));
  const lifecycleHash = fieldHash(JSON.stringify(cred.lifecycle));
  const provenanceHash = fieldHash(JSON.stringify(cred.provenance));
  const salt = fieldHash("agent-identity-test-salt");

  const issuerSecretKey = fieldHash("issuer-secret-key-test");

  const commitmentInput = [
    identityHash, authorityHash, financialHash,
    lifecycleHash, provenanceHash, salt,
  ].join(":");
  const credentialCommitment = fieldHash(commitmentInput);

  const issuerPublicKey = fieldHash(`pk:${issuerSecretKey}`);
  const mac = fieldHash(`mac:${credentialCommitment}:${issuerSecretKey}`);

  return {
    identityHash,
    authorityHash,
    financialHash,
    lifecycleHash,
    provenanceHash,
    salt,
    issuerSecretKey,
    mac,
    issuedAt: "1745900000",
    expiresAt: "1777436000",
    revoked: "0",
    credentialCommitment,
    issuerPublicKey,
    nowSec: nowSec.toString(),
  };
};

// ── Tests ───────────────────────────────────────────────────────────

describe("agent-identity-v1 circuit witness", () => {
  it("produces all required witness fields", () => {
    const w = buildWitness(sampleNormalizedCred, 1746000000);
    expect(w.credentialCommitment).toBeTruthy();
    expect(w.issuerPublicKey).toBeTruthy();
    expect(w.identityHash).toBeTruthy();
    expect(w.authorityHash).toBeTruthy();
    expect(w.financialHash).toBeTruthy();
    expect(w.lifecycleHash).toBeTruthy();
    expect(w.provenanceHash).toBeTruthy();
    expect(w.salt).toBeTruthy();
    expect(w.mac).toBeTruthy();
    expect(w.issuedAt).toBeTruthy();
    expect(w.nowSec).toBeTruthy();
  });

  it("produces deterministic commitment for same credential and salt", () => {
    const w1 = buildWitness(sampleNormalizedCred, 1746000000);
    const w2 = buildWitness(sampleNormalizedCred, 1746000000);
    expect(w1.credentialCommitment).toBe(w2.credentialCommitment);
  });

  it("produces different commitment for different credentials", () => {
    const modifiedCred = {
      ...sampleNormalizedCred,
      identity: { ...sampleNormalizedCred.identity, agentId: "agent-different" },
    };
    const w1 = buildWitness(sampleNormalizedCred, 1746000000);
    const w2 = buildWitness(modifiedCred, 1746000000);
    expect(w1.credentialCommitment).not.toBe(w2.credentialCommitment);
  });

  it("issuer public key is derived from secret key", () => {
    const w = buildWitness(sampleNormalizedCred, 1746000000);
    const expectedPk = fieldHash(`pk:${w.issuerSecretKey}`);
    expect(w.issuerPublicKey).toBe(expectedPk);
  });

  it("MAC binds credential commitment to issuer secret key", () => {
    const w = buildWitness(sampleNormalizedCred, 1746000000);
    const expectedMac = fieldHash(`mac:${w.credentialCommitment}:${w.issuerSecretKey}`);
    expect(w.mac).toBe(expectedMac);
  });
});

describe("circuit build artifacts", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const buildDir = path.resolve(__dirname, "../build");

  it("R1CS file exists", () => {
    expect(fs.existsSync(path.join(buildDir, "agent-identity.r1cs"))).toBe(true);
  });

  it("WASM file exists", () => {
    expect(fs.existsSync(path.join(buildDir, "agent-identity_js", "agent-identity.wasm"))).toBe(true);
  });

  it("zkey file exists", () => {
    expect(fs.existsSync(path.join(buildDir, "agent-identity_final.zkey"))).toBe(true);
  });

  it("verification key exists and has correct structure", () => {
    const vkeyPath = path.join(buildDir, "agent-identity_vkey.json");
    expect(fs.existsSync(vkeyPath)).toBe(true);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf8"));
    expect(vkey.protocol).toBe("groth16");
    expect(vkey.curve).toBe("bn128");
    expect(vkey.IC.length).toBe(4);
  });
});

describe("credentialCommitment downstream compatibility", () => {
  const BN254_ORDER = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

  it("is a valid BN254 field element string", () => {
    const w = buildWitness(sampleNormalizedCred, 1746000000);
    const commitment = BigInt(w.credentialCommitment);
    expect(commitment >= BigInt(0)).toBe(true);
    expect(commitment < BN254_ORDER).toBe(true);
  });

  it("fits in 253 bits for role-spend-limit circuit compatibility", () => {
    const w = buildWitness(sampleNormalizedCred, 1746000000);
    const commitment = BigInt(w.credentialCommitment);
    expect(commitment.toString(2).length <= 253).toBe(true);
  });
});
