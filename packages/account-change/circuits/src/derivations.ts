/**
 * TS mirror of the AccountChangeV1 circuit's derivations
 * (circuits/src/account-change.circom, design v1.1).
 *
 * SINGLE SOURCE for the Merkle tree and the leaf pre-image hashes:
 * `circuits/test/account-change.test.ts` (fixtures) and
 * `scripts/seed-demo-vendor.ts` (demo vendor bundle) both import from
 * here, so the two sides cannot diverge. Any change here must be mirrored
 * in the circom and is a breaking change for registered proofs.
 *
 * Merkle tree: hand-rolled depth-20 Poseidon2 tree whose empty leaf is 0
 * (zero-subtree hashing). This is the registry root layout the gate
 * publishes; the circuit constrains inclusion with the boolean-constrained
 * quadratic-mux checker.
 */
import { poseidon1, poseidon2, poseidon4, poseidon6 } from "poseidon-lite";

/** Merkle depth — must match `= AccountChangeV1(20)` in the circom. */
export const TREE_LEVELS = 20;

/** Domain tag for the bank-account tuple (`Poseidon6` pre-image head). */
export const ACCOUNT_DOMAIN = 1101n;

// Zero-subtree hashes for a Poseidon2 Merkle tree whose empty leaf is 0.
const zeroSubtree: bigint[] = [0n];
for (let i = 1; i <= TREE_LEVELS; i++) {
  const prev = zeroSubtree[i - 1] as bigint;
  zeroSubtree[i] = poseidon2([prev, prev]);
}

/** Root of the subtree at (level, idx) for a sparse leaf assignment. */
export function subtreeRoot(
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
  if (!occupied) return zeroSubtree[level] as bigint;
  if (level === 0) return leaves.get(idx) as bigint;
  return poseidon2([
    subtreeRoot(leaves, level - 1, idx * 2),
    subtreeRoot(leaves, level - 1, idx * 2 + 1),
  ]);
}

/**
 * Inclusion path for the leaf at `index`: siblings (as decimal strings)
 * and index bits, level 0 first. Same tuple the circuit takes as
 * `merklePath` / `merkleIndices`.
 */
export function merklePathFor(
  leaves: ReadonlyMap<number, bigint>,
  index: number,
): { root: bigint; path: string[]; indices: string[] } {
  const pathEls: string[] = [];
  const indices: string[] = [];
  for (let level = 0; level < TREE_LEVELS; level++) {
    const nodeIdx = index >> level;
    pathEls.push(subtreeRoot(leaves, level, nodeIdx ^ 1).toString());
    indices.push(String(nodeIdx & 1));
  }
  return {
    root: subtreeRoot(leaves, TREE_LEVELS, 0),
    path: pathEls,
    indices,
  };
}

/** Credential leaf pre-image (agent-identity sub-hash layout). */
export interface CredentialSpec {
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

/**
 * `credentialCommitment` — the registry leaf. Layout (README「Bindings」):
 *   identityHash  = Poseidon2(vendorId, Poseidon1(repSecret))
 *   authorityHash = Poseidon2(roleHash, legalNameHash)
 *   lifecycleHash = Poseidon4(status, validFrom, validUntil, registeredAt)
 *   credentialCommitment = Poseidon4(identityHash, authorityHash,
 *                                    lifecycleHash, credentialSalt)
 */
export function credentialCommitmentOf(c: CredentialSpec): bigint {
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

/** Account tuple components as field elements (fixed-width decimal parse). */
export interface AccountTuple {
  bankCode: bigint;
  branchCode: bigint;
  accountType: bigint;
  accountNumber: bigint;
  holderNameHash: bigint;
}

/** `newAccountHash = Poseidon6(1101, bank, branch, type, number, holder)`. */
export function accountHashOf(a: AccountTuple): bigint {
  return poseidon6([
    ACCOUNT_DOMAIN,
    a.bankCode,
    a.branchCode,
    a.accountType,
    a.accountNumber,
    a.holderNameHash,
  ]);
}
