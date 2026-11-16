/**
 * Circuit test: witness generation + proof verification for
 * AccountChangeV1 (design v1.1).
 *
 * Covers the positive case (change + first registration) and the
 * negative cases the design promises to reject:
 *   - proof re-pointed at a different account (content binding)
 *   - holder name different from the registered legal name (holder binding)
 *   - missing account-change role (authority binding)
 *   - credential registered after the request was received (v1.1 ordering)
 *   - isFirst inconsistent with oldAccountHash
 *   - proof replayed against a different challenge (gate-side verify)
 */
import { describe, it, beforeAll, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { groth16 } from "snarkjs";
import {
  poseidon1,
  poseidon2,
  poseidon3,
  poseidon4,
  poseidon5,
  poseidon6,
} from "poseidon-lite";

const CIRCUITS_DIR = path.resolve(import.meta.dirname, "..");
const BUILD_DIR = path.join(CIRCUITS_DIR, "build");
const CIRCUIT_NAME = "account-change";
const WASM_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
const ZKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_final.zkey`);
const VKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_vkey.json`);

const LEVELS = 20;
const ACCOUNT_DOMAIN = 1101n;
const CONTEXT_DOMAIN_A = 1102n;
const CONTEXT_DOMAIN_B = 1103n;

// Zero-subtree hashes for a Poseidon2 Merkle tree whose empty leaf is 0.
const zeroSubtree: bigint[] = [0n];
for (let i = 1; i <= LEVELS; i++) {
  zeroSubtree[i] = poseidon2([zeroSubtree[i - 1], zeroSubtree[i - 1]]);
}

function merkleRootForLeafAtIndex0(leaf: bigint): bigint {
  let cur = leaf;
  for (let i = 0; i < LEVELS; i++) {
    cur = poseidon2([cur, zeroSubtree[i]]);
  }
  return cur;
}

interface Fixture {
  input: Record<string, string | string[]>;
  contextHash: bigint;
  attestationCommitment: bigint;
  nullifier: bigint;
  publicSignalCount: number;
  challengeIdIndex: number;
}

function buildFixture(overrides: {
  oldAccountHash?: bigint;
  isFirst?: bigint;
  registeredAt?: bigint;
  roleHash?: bigint;
  requiredRoleHash?: bigint;
  legalNameHash?: bigint;
  holderNameHash?: bigint;
  accountNumber?: bigint;
  newAccountHashOverride?: bigint;
} = {}): Fixture {
  const repSecret = 987654321n;
  const vendorId = 424242n;
  const roleHash = overrides.roleHash ?? poseidon1([777n]); // "account-change"
  const requiredRoleHash = overrides.requiredRoleHash ?? roleHash;
  const legalNameHash = overrides.legalNameHash ?? poseidon1([31337n]);
  const holderNameHash = overrides.holderNameHash ?? legalNameHash;
  const credentialStatus = 1n;
  const validFrom = 1600000000n;
  const validUntil = 1800000000n;
  const registeredAt = overrides.registeredAt ?? 1700000000n;
  const credentialSalt = 555n;

  const repPubKey = poseidon1([repSecret]);
  const identityHash = poseidon2([vendorId, repPubKey]);
  const authorityHash = poseidon2([roleHash, legalNameHash]);
  const lifecycleHash = poseidon4([
    credentialStatus,
    validFrom,
    validUntil,
    registeredAt,
  ]);
  const credentialCommitment = poseidon4([
    identityHash,
    authorityHash,
    lifecycleHash,
    credentialSalt,
  ]);
  const registryRoot = merkleRootForLeafAtIndex0(credentialCommitment);
  const merklePath = Array.from({ length: LEVELS }, (_, i) =>
    zeroSubtree[i].toString(),
  );
  const merkleIndices = Array.from({ length: LEVELS }, () => "0");

  const bankCode = 123n;
  const branchCode = 456n;
  const accountType = 1n;
  const accountNumber = overrides.accountNumber ?? 7654321n;
  const computedNewAccountHash = poseidon6([
    ACCOUNT_DOMAIN,
    bankCode,
    branchCode,
    accountType,
    accountNumber,
    holderNameHash,
  ]);
  const newAccountHash = overrides.newAccountHashOverride ?? computedNewAccountHash;
  const oldAccountHash = overrides.oldAccountHash ?? poseidon6([
    ACCOUNT_DOMAIN,
    bankCode,
    branchCode,
    accountType,
    1111111n,
    holderNameHash,
  ]);
  const isFirst = overrides.isFirst ?? (oldAccountHash === 0n ? 1n : 0n);

  const audienceHash = poseidon1([2026001n]);
  const requestDigest = poseidon1([909090n]);
  const requestReceivedAt = 1750000000n;
  const challengeId = 606060n;
  const challengeIssuedAt = 1750000100n;
  const challengeExpiresAt = 1750100000n;
  const policyHash = poseidon1([111n]);
  const bankEvidenceHash = poseidon1([24680n]);

  const ctxA = poseidon4([CONTEXT_DOMAIN_A, audienceHash, vendorId, requestDigest]);
  const ctxB = poseidon4([
    CONTEXT_DOMAIN_B,
    challengeId,
    challengeIssuedAt,
    challengeExpiresAt,
  ]);
  const contextHash = poseidon4([ctxA, ctxB, registryRoot, policyHash]);
  const attestationCommitment = poseidon5([
    credentialCommitment,
    oldAccountHash,
    newAccountHash,
    bankEvidenceHash,
    contextHash,
  ]);
  const nullifier = poseidon2([credentialCommitment, challengeId]);

  const input: Record<string, string | string[]> = {
    repSecret: repSecret.toString(),
    roleHash: roleHash.toString(),
    legalNameHash: legalNameHash.toString(),
    credentialStatus: credentialStatus.toString(),
    validFrom: validFrom.toString(),
    validUntil: validUntil.toString(),
    registeredAt: registeredAt.toString(),
    credentialSalt: credentialSalt.toString(),
    merklePath,
    merkleIndices,
    bankCode: bankCode.toString(),
    branchCode: branchCode.toString(),
    accountType: accountType.toString(),
    accountNumber: accountNumber.toString(),
    holderNameHash: holderNameHash.toString(),
    registryRoot: registryRoot.toString(),
    credentialCommitment: credentialCommitment.toString(),
    requiredRoleHash: requiredRoleHash.toString(),
    vendorId: vendorId.toString(),
    oldAccountHash: oldAccountHash.toString(),
    newAccountHash: newAccountHash.toString(),
    isFirst: isFirst.toString(),
    audienceHash: audienceHash.toString(),
    requestDigest: requestDigest.toString(),
    requestReceivedAt: requestReceivedAt.toString(),
    challengeId: challengeId.toString(),
    challengeIssuedAt: challengeIssuedAt.toString(),
    challengeExpiresAt: challengeExpiresAt.toString(),
    policyHash: policyHash.toString(),
    bankEvidenceHash: bankEvidenceHash.toString(),
  };

  // Public signals: 3 outputs, then the 15 public inputs in the order
  // declared in `main { public [...] }` (challengeId is input #11).
  return {
    input,
    contextHash,
    attestationCommitment,
    nullifier,
    publicSignalCount: 18,
    challengeIdIndex: 3 + 10,
  };
}

describe("AccountChangeV1 circuit", () => {
  let vkey: object;

  beforeAll(async () => {
    vkey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
  }, 30000);

  it("proves an account change and derives context / attestation / nullifier", async () => {
    const f = buildFixture();
    const { proof, publicSignals } = await groth16.fullProve(
      f.input,
      WASM_PATH,
      ZKEY_PATH,
    );

    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
    expect(publicSignals).toHaveLength(f.publicSignalCount);
    expect(publicSignals[0]).toBe(f.contextHash.toString());
    expect(publicSignals[1]).toBe(f.attestationCommitment.toString());
    expect(publicSignals[2]).toBe(f.nullifier.toString());
  }, 60000);

  it("proves a first registration (oldAccountHash = 0, isFirst = 1)", async () => {
    const f = buildFixture({ oldAccountHash: 0n });
    const { proof, publicSignals } = await groth16.fullProve(
      f.input,
      WASM_PATH,
      ZKEY_PATH,
    );
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
  }, 60000);

  it("rejects a proof re-pointed at a different account number", async () => {
    // Gate fixed newAccountHash for account ...321; prover tries ...999.
    const gateFixedHash = poseidon6([
      ACCOUNT_DOMAIN,
      123n,
      456n,
      1n,
      7654321n,
      poseidon1([31337n]),
    ]);
    const f = buildFixture({
      accountNumber: 7654999n,
      newAccountHashOverride: gateFixedHash,
    });
    await expect(
      groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
    ).rejects.toThrow();
  }, 60000);

  it("rejects an account held under a different name than the registered legal name", async () => {
    const f = buildFixture({ holderNameHash: poseidon1([999999n]) });
    await expect(
      groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
    ).rejects.toThrow();
  }, 60000);

  it("rejects a representative without the account-change role", async () => {
    const f = buildFixture({ requiredRoleHash: poseidon1([888n]) });
    await expect(
      groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
    ).rejects.toThrow();
  }, 60000);

  it("rejects a credential registered after the request was received (v1.1 ordering)", async () => {
    const f = buildFixture({ registeredAt: 1760000000n });
    await expect(
      groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
    ).rejects.toThrow();
  }, 60000);

  it("rejects isFirst = 0 for a first registration", async () => {
    const f = buildFixture({ oldAccountHash: 0n, isFirst: 0n });
    await expect(
      groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
    ).rejects.toThrow();
  }, 60000);

  it("does not verify against a different challenge (replay across challenges)", async () => {
    const f = buildFixture();
    const { proof, publicSignals } = await groth16.fullProve(
      f.input,
      WASM_PATH,
      ZKEY_PATH,
    );
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);

    const tampered = [...publicSignals];
    tampered[f.challengeIdIndex] = "707070";
    expect(await groth16.verify(vkey, tampered, proof)).toBe(false);
  }, 60000);
});
