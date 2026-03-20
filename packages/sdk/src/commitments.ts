/**
 *
 * Whitepaper §2.3 — Commitments (Poseidon Merkle tree).
 */
import { createHash, randomBytes } from "node:crypto";
import type { DocumentCommitments, InclusionProof, LeafPreimage } from "@lemmaoracle/spec";
import type { Json } from "./internal.js";
import * as R from "ramda";
import { poseidon2, poseidon3 } from "poseidon-lite";

// BN254 field prime from circomlib (alt_bn128)
const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

export type PrepareOutput<Norm> = Readonly<{
  normalized: Norm;
  commitments: DocumentCommitments;
  /** Inclusion proof for each leaf (same order as commitments.leaves) */
  inclusionProofs: ReadonlyArray<InclusionProof>;
  /** Pre-image components for each leaf (same order as commitments.leaves) */
  leafPreimages: ReadonlyArray<LeafPreimage>;
}>;

// Helper: convert value to BN254 field element
// Numbers and numeric strings are converted directly, other strings are hashed
const encodeToField = (value: string | number): bigint =>
  typeof value === "number"
    ? BigInt(value) % BN254_PRIME
    : /^\d+$/.test(value)
      ? BigInt(value) % BN254_PRIME
      : BigInt(`0x${createHash("sha256").update(value).digest("hex")}`) % BN254_PRIME;

const toHex = (n: bigint): string => `0x${n.toString(16)}`;

// ---------------------------------------------------------------------------
// Leaf computation
// ---------------------------------------------------------------------------

type LeafResult = Readonly<{
  leaves: ReadonlyArray<bigint>;
  preimages: ReadonlyArray<LeafPreimage>;
}>;

const computeLeaves = (
  normalized: Readonly<Record<string, Json>>,
  randomness: string,
): LeafResult => {
  const sortedKeys = [...R.keys(normalized)].sort();
  // randomness is a hex string WITHOUT "0x" prefix (from commitNormalized)
  // Convert it to field element (snarkjs will do the same with "0x" + randomness)
  // No modulo reduction - randomness is already in the field
  const blindingField = BigInt(`0x${randomness}`);

  const computeLeaf = (key: string): Readonly<{ preimage: LeafPreimage; leaf: bigint }> => {
    const value = normalized[key];
    // Preserve original type: numbers stay numbers, others become strings
    const valueForHash = typeof value === "number" ? value :
                         R.is(String, value) ? value : JSON.stringify(value);
    const nameField = encodeToField(key);
    const valueField = encodeToField(valueForHash);

    const preimage: LeafPreimage = {
      name: key,
      value: valueForHash,
      nameHash: toHex(nameField),
      valueHash: toHex(valueField),
      blindingHash: toHex(blindingField),
    };

    const leaf = poseidon3([nameField, valueField, blindingField]);
    return { preimage, leaf };
  };

  const results = R.map(computeLeaf, sortedKeys);
  return {
    leaves: R.map((r) => r.leaf, results),
    preimages: R.map((r) => r.preimage, results),
  };
};

// ---------------------------------------------------------------------------
// Merkle tree — build tree and extract inclusion proofs
// ---------------------------------------------------------------------------

type TreeResult = Readonly<{
  root: bigint;
  inclusionProofs: ReadonlyArray<InclusionProof>;
}>;

const buildMerkleTree = (
  leaves: ReadonlyArray<bigint>,
  _poseidon: unknown,
): TreeResult => {
  const leafCount = leaves.length;

  // Single leaf — root equals the leaf, proof is empty
  // eslint-disable-next-line functional/no-conditional-statements -- guard clause
  if (leafCount === 1) {
    const leaf = leaves[0] ?? 0n;
    return {
      root: leaf,
      inclusionProofs: [{ siblings: [], indices: [] }],
    };
  }

  // Pad to next power of 2
  const depth = Math.ceil(Math.log2(leafCount));
  const size = Math.pow(2, depth);
  const zero = 0n;
  const padded: bigint[] = [...leaves, ...R.repeat(zero, size - leafCount)];

  // Build layers bottom-up, storing each level for proof extraction
  const layers: bigint[][] = [padded];

  /* eslint-disable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements --
   * Tree construction requires imperative mutation for perf-critical Merkle computation */
  let current = padded;
  while (current.length > 1) {
    const next: bigint[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i] ?? 0n;
      const right = current[i + 1] ?? 0n;
      const hashResult = poseidon2([left, right]);
      next.push(hashResult);
    }
    layers.push(next);
    current = next;
  }
  /* eslint-enable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements */

  const root = current[0] ?? zero;

  // Extract inclusion proof for each original leaf
  const inclusionProofs: InclusionProof[] = R.times((leafIdx: number) => {
    const siblings: string[] = [];
    const indices: number[] = [];

    /* eslint-disable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements --
     * Proof extraction requires imperative index tracking */
    let idx = leafIdx;
    for (let level = 0; level < depth; level++) {
      const siblingIdx = idx ^ 1; // XOR to get sibling
      const sibling = layers[level]?.[siblingIdx] ?? zero;
      siblings.push(toHex(sibling));
      indices.push(idx & 1); // 0 = left, 1 = right
      idx = Math.floor(idx / 2);
    }
    /* eslint-enable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements */

    return { siblings, indices };
  }, leafCount);

  return { root, inclusionProofs };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type CommitResult = Readonly<{
  root: string;
  leaves: ReadonlyArray<string>;
  randomness: string;
  inclusionProofs: ReadonlyArray<InclusionProof>;
  leafPreimages: ReadonlyArray<LeafPreimage>;
}>;

export const commitNormalized = (
  normalized: Json,
): Promise<CommitResult> =>
  R.cond([
    [
      (_placeholder: undefined) => !R.is(Object, normalized) || R.isEmpty(normalized),
      (_placeholder: undefined) => Promise.reject(new Error("Normalized data must be a non-empty object")),
    ],
    [
      R.T,
      (_placeholder: undefined) => {
        const randomness = randomBytes(32).toString("hex");

        const leafResult = computeLeaves(
          normalized as Readonly<Record<string, Json>>,
          randomness,
        );

        const { root, inclusionProofs } = buildMerkleTree(leafResult.leaves, null);

        return Promise.resolve({
          root: toHex(root),
          leaves: R.map((leaf: bigint) => toHex(leaf), leafResult.leaves),
          randomness: `0x${randomness}`,
          inclusionProofs,
          leafPreimages: leafResult.preimages,
        });
      },
    ],
  ])(undefined);
