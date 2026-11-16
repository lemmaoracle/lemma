/**
 * Circuit test: witness generation + proof verification for
 * AccountChangeV1 (design v1.1 + post-review fixes).
 *
 * Positive cases: account change, first registration, and a credential
 * at a non-zero Merkle index (exercises the right-branch mux).
 * Negative cases cover every binding: content, holder, role, status,
 * registration ordering, the full time window, Merkle path integrity,
 * cross-vendor replay, isFirst consistency in both directions, and
 * field-wrap timestamps (r-k) that must fail the 64-bit range binding.
 * Verify-level cases tamper individual public signals.
 *
 * Like the sibling packages (e.g. listing-binding), the suite skips
 * cleanly when the circuit has not been built.
 */
import { describe, it, beforeAll, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { groth16 } from "snarkjs";
import {
  poseidon1,
  poseidon2,
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

const circuitBuilt =
  fs.existsSync(VKEY_PATH) && fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH);

const LEVELS = 20;
const ACCOUNT_DOMAIN = 1101n;
const CONTEXT_DOMAIN_A = 1102n;
const CONTEXT_DOMAIN_B = 1103n;
const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

// Zero-subtree hashes for a Poseidon2 Merkle tree whose empty leaf is 0.
const zeroSubtree: bigint[] = [0n];
for (let i = 1; i <= LEVELS; i++) {
  zeroSubtree[i] = poseidon2([zeroSubtree[i - 1], zeroSubtree[i - 1]]);
}

/** Root of the subtree at (level, idx) for a sparse leaf assignment. */
function subtreeRoot(
  leaves: ReadonlyMap<number, bigint>,
  level: number,
  idx: number,
): bigint {
  const lo = idx * 2 ** level;
  const hi = lo + 2 ** level;
  let occupied = false;
  for (const k of leaves.keys()) {
    if (k >= lo && k < hi) {
      occupied = true;
      break;
    }
  }
  if (!occupied) return zeroSubtree[level];
  if (level === 0) return leaves.get(idx)!;
  return poseidon2([
    subtreeRoot(leaves, level - 1, idx * 2),
    subtreeRoot(leaves, level - 1, idx * 2 + 1),
  ]);
}

function merklePathFor(
  leaves: ReadonlyMap<number, bigint>,
  index: number,
): { root: bigint; path: string[]; indices: string[] } {
  const pathEls: string[] = [];
  const indices: string[] = [];
  for (let level = 0; level < LEVELS; level++) {
    const nodeIdx = index >> level;
    pathEls.push(subtreeRoot(leaves, level, nodeIdx ^ 1).toString());
    indices.push(String(nodeIdx & 1));
  }
  return {
    root: subtreeRoot(leaves, LEVELS, 0),
    path: pathEls,
    indices,
  };
}

// Public signal positions: 3 outputs, then the 15 public inputs in
// `main { public [...] }` declaration order.
const SIG = {
  contextHash: 0,
  attestationCommitment: 1,
  nullifier: 2,
  registryRoot: 3,
  credentialCommitment: 4,
  requiredRoleHash: 5,
  vendorId: 6,
  oldAccountHash: 7,
  newAccountHash: 8,
  isFirst: 9,
  audienceHash: 10,
  requestDigest: 11,
  requestReceivedAt: 12,
  challengeId: 13,
  challengeIssuedAt: 14,
  challengeExpiresAt: 15,
  policyHash: 16,
  bankEvidenceHash: 17,
} as const;

interface CredentialSpec {
  repSecret: bigint;
  vendorId: bigint;
  roleHash: bigint;
  legalNameHash: bigint;
  credentialStatus: bigint;
  validFrom: bigint;
  validUntil: bigint;
  registeredAt: bigint;
  credentialSalt: bigint;
}

function credentialCommitmentOf(c: CredentialSpec): bigint {
  const identityHash = poseidon2([c.vendorId, poseidon1([c.repSecret])]);
  const authorityHash = poseidon2([c.roleHash, c.legalNameHash]);
  const lifecycleHash = poseidon4([
    c.credentialStatus,
    c.validFrom,
    c.validUntil,
    c.registeredAt,
  ]);
  return poseidon4([identityHash, authorityHash, lifecycleHash, c.credentialSalt]);
}

interface Fixture {
  input: Record<string, string | string[]>;
  contextHash: bigint;
  attestationCommitment: bigint;
  nullifier: bigint;
}

interface FixtureOverrides {
  cred?: Partial<CredentialSpec>;
  vendorIdInput?: bigint;
  leafIndex?: number;
  extraLeaves?: ReadonlyMap<number, bigint>;
  requiredRoleHash?: bigint;
  holderNameHash?: bigint;
  accountNumber?: bigint;
  newAccountHashOverride?: bigint;
  oldAccountHash?: bigint;
  isFirst?: bigint;
  requestReceivedAt?: bigint;
  challengeIssuedAt?: bigint;
  challengeExpiresAt?: bigint;
  policyHash?: bigint;
  registryRootOverride?: bigint;
  merklePathMutate?: (path: string[]) => string[];
  merkleIndicesOverride?: string[];
}

const BASE_CRED: CredentialSpec = {
  repSecret: 987654321n,
  vendorId: 424242n,
  roleHash: poseidon1([777n]),
  legalNameHash: poseidon1([31337n]),
  credentialStatus: 1n,
  validFrom: 1600000000n,
  validUntil: 1800000000n,
  registeredAt: 1700000000n,
  credentialSalt: 555n,
};

function buildFixture(overrides: FixtureOverrides = {}): Fixture {
  const cred: CredentialSpec = { ...BASE_CRED, ...overrides.cred };
  const credentialCommitment = credentialCommitmentOf(cred);
  const leafIndex = overrides.leafIndex ?? 0;
  const leaves = new Map<number, bigint>(overrides.extraLeaves ?? []);
  leaves.set(leafIndex, credentialCommitment);
  const merkle = merklePathFor(leaves, leafIndex);
  const merklePath = overrides.merklePathMutate
    ? overrides.merklePathMutate(merkle.path)
    : merkle.path;

  const holderNameHash = overrides.holderNameHash ?? cred.legalNameHash;
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
  const oldAccountHash =
    overrides.oldAccountHash ??
    poseidon6([
      ACCOUNT_DOMAIN,
      bankCode,
      branchCode,
      accountType,
      1111111n,
      holderNameHash,
    ]);
  const isFirst = overrides.isFirst ?? (oldAccountHash === 0n ? 1n : 0n);

  const vendorIdInput = overrides.vendorIdInput ?? cred.vendorId;
  const registryRoot = overrides.registryRootOverride ?? merkle.root;
  const audienceHash = poseidon1([2026001n]);
  const requestDigest = poseidon1([909090n]);
  const requestReceivedAt = overrides.requestReceivedAt ?? 1750000000n;
  const challengeId = 606060n;
  const challengeIssuedAt = overrides.challengeIssuedAt ?? 1750000100n;
  const challengeExpiresAt = overrides.challengeExpiresAt ?? 1750100000n;
  const policyHash = overrides.policyHash ?? poseidon1([111n]);
  const bankEvidenceHash = poseidon1([24680n]);

  const ctxA = poseidon4([
    CONTEXT_DOMAIN_A,
    audienceHash,
    vendorIdInput,
    requestDigest,
  ]);
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
    repSecret: cred.repSecret.toString(),
    roleHash: cred.roleHash.toString(),
    legalNameHash: cred.legalNameHash.toString(),
    credentialStatus: cred.credentialStatus.toString(),
    validFrom: cred.validFrom.toString(),
    validUntil: cred.validUntil.toString(),
    registeredAt: cred.registeredAt.toString(),
    credentialSalt: cred.credentialSalt.toString(),
    merklePath,
    merkleIndices: overrides.merkleIndicesOverride ?? merkle.indices,
    bankCode: bankCode.toString(),
    branchCode: branchCode.toString(),
    accountType: accountType.toString(),
    accountNumber: accountNumber.toString(),
    holderNameHash: holderNameHash.toString(),
    registryRoot: registryRoot.toString(),
    credentialCommitment: credentialCommitment.toString(),
    requiredRoleHash: (overrides.requiredRoleHash ?? cred.roleHash).toString(),
    vendorId: vendorIdInput.toString(),
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

  return { input, contextHash, attestationCommitment, nullifier };
}

async function expectWitnessFailure(f: Fixture): Promise<void> {
  await expect(
    groth16.fullProve(f.input, WASM_PATH, ZKEY_PATH),
  ).rejects.toThrow();
}

describe.runIf(circuitBuilt)("AccountChangeV1 circuit", () => {
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
    expect(publicSignals).toHaveLength(18);
    expect(publicSignals[SIG.contextHash]).toBe(f.contextHash.toString());
    expect(publicSignals[SIG.attestationCommitment]).toBe(
      f.attestationCommitment.toString(),
    );
    expect(publicSignals[SIG.nullifier]).toBe(f.nullifier.toString());
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

  it("proves a credential at a non-zero Merkle index (right-branch mux)", async () => {
    const f = buildFixture({ leafIndex: 5 });
    const { proof, publicSignals } = await groth16.fullProve(
      f.input,
      WASM_PATH,
      ZKEY_PATH,
    );
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
  }, 60000);

  it("rejects a proof re-pointed at a different account number", async () => {
    const gateFixedHash = poseidon6([
      ACCOUNT_DOMAIN,
      123n,
      456n,
      1n,
      7654321n,
      poseidon1([31337n]),
    ]);
    await expectWitnessFailure(
      buildFixture({
        accountNumber: 7654999n,
        newAccountHashOverride: gateFixedHash,
      }),
    );
  }, 60000);

  it("rejects an account held under a different name than the registered legal name", async () => {
    await expectWitnessFailure(
      buildFixture({ holderNameHash: poseidon1([999999n]) }),
    );
  }, 60000);

  it("rejects a representative without the account-change role", async () => {
    await expectWitnessFailure(
      buildFixture({ requiredRoleHash: poseidon1([888n]) }),
    );
  }, 60000);

  it("rejects a revoked credential (status != 1)", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { credentialStatus: 0n } }),
    );
  }, 60000);

  it("rejects a credential registered after the request was received (v1.1 ordering)", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { registeredAt: 1760000000n } }),
    );
  }, 60000);

  it("rejects validFrom after the challenge was issued", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { validFrom: 1750000200n } }),
    );
  }, 60000);

  it("rejects validUntil before the challenge expires", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { validUntil: 1750050000n } }),
    );
  }, 60000);

  it("rejects an empty challenge window (issuedAt == expiresAt)", async () => {
    await expectWitnessFailure(
      buildFixture({ challengeExpiresAt: 1750000100n }),
    );
  }, 60000);

  it("rejects a request received after the challenge was issued", async () => {
    await expectWitnessFailure(
      buildFixture({ requestReceivedAt: 1750000200n }),
    );
  }, 60000);

  it("rejects a wrapped (r-k) registeredAt - 64-bit range binding regression", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { registeredAt: BN254_PRIME - 100n } }),
    );
  }, 60000);

  it("rejects a wrapped (r-k) validFrom - 64-bit range binding regression", async () => {
    await expectWitnessFailure(
      buildFixture({ cred: { validFrom: BN254_PRIME - 100n } }),
    );
  }, 60000);

  it("rejects a tampered Merkle path element", async () => {
    await expectWitnessFailure(
      buildFixture({
        merklePathMutate: (p) =>
          p.map((v, i) => (i === 3 ? (BigInt(v) + 1n).toString() : v)),
      }),
    );
  }, 60000);

  it("rejects a wrong registry root", async () => {
    await expectWitnessFailure(
      buildFixture({ registryRootOverride: poseidon1([1n]) }),
    );
  }, 60000);

  it("rejects a non-boolean Merkle path index", async () => {
    const f = buildFixture({ leafIndex: 5 });
    const badIndices = [...(f.input.merkleIndices as string[])];
    badIndices[0] = "2";
    await expectWitnessFailure(
      buildFixture({ leafIndex: 5, merkleIndicesOverride: badIndices }),
    );
  }, 60000);

  it("rejects another vendor's credential presented under this vendorId (cross-vendor)", async () => {
    const vendorA = credentialCommitmentOf(BASE_CRED);
    const vendorB: CredentialSpec = {
      ...BASE_CRED,
      repSecret: 123456789n,
      vendorId: 515151n,
    };
    await expectWitnessFailure(
      buildFixture({
        cred: vendorB,
        leafIndex: 1,
        extraLeaves: new Map([[0, vendorA]]),
        vendorIdInput: BASE_CRED.vendorId,
      }),
    );
  }, 60000);

  it("rejects isFirst = 0 for a first registration", async () => {
    await expectWitnessFailure(
      buildFixture({ oldAccountHash: 0n, isFirst: 0n }),
    );
  }, 60000);

  it("rejects isFirst = 1 when an old account exists", async () => {
    await expectWitnessFailure(buildFixture({ isFirst: 1n }));
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
    tampered[SIG.challengeId] = "707070";
    expect(await groth16.verify(vkey, tampered, proof)).toBe(false);
  }, 60000);

  it("does not verify when audience, request, vendor, old account, or policy signals are tampered", async () => {
    const f = buildFixture();
    const { proof, publicSignals } = await groth16.fullProve(
      f.input,
      WASM_PATH,
      ZKEY_PATH,
    );
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);

    const positions = [
      SIG.audienceHash,
      SIG.requestDigest,
      SIG.vendorId,
      SIG.oldAccountHash,
      SIG.policyHash,
    ];
    for (const pos of positions) {
      const tampered = [...publicSignals];
      tampered[pos] = (BigInt(tampered[pos]) + 1n).toString();
      expect(await groth16.verify(vkey, tampered, proof)).toBe(false);
    }
  }, 60000);
});

describe.runIf(!circuitBuilt)("AccountChangeV1 circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
