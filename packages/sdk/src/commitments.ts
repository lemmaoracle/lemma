/**
 *
 * Whitepaper §2.3 — Commitments (Poseidon Merkle tree).
 */
import { createHash, randomBytes } from "node:crypto";
import type { DocumentCommitments, InclusionProof, LeafPreimage } from "@lemmaoracle/spec";
import type { Json } from "./internal.js";
import * as R from "ramda";

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

// Helper: convert string to BN254 field element via SHA-256 mod p
const encodeToField = (value: string): bigint => {
  const hash = createHash("sha256").update(value).digest("hex");
  const hashBigInt = BigInt(`0x${hash}`);
  return hashBigInt % BN254_PRIME;
};

const toHex = (n: bigint): string => `0x${n.toString(16)}`;

// Lazy singleton for Poseidon (same pattern as schema registry)

let poseidonInstance: Promise<any> | undefined;

const getPoseidon = (): Promise<any> =>
  poseidonInstance
    ? poseidonInstance
    : (poseidonInstance = import("circomlibjs").then(({ buildPoseidon }) => buildPoseidon()));

// ---------------------------------------------------------------------------
// Leaf computation
// ---------------------------------------------------------------------------

type LeafResult = Readonly<{
  leaves: ReadonlyArray<bigint>;
  preimages: ReadonlyArray<LeafPreimage>;
}>;

const computeLeaves = async (
  normalized: Readonly<Record<string, Json>>,
  randomness: string,
  poseidon: any,
): Promise<LeafResult> => {
  const sortedKeys = R.keys(normalized).sort();
  const blindingField = encodeToField(randomness);

  const preimages: LeafPreimage[] = [];
  const leaves: bigint[] = [];

  /* eslint-disable functional/immutable-data, functional/no-expression-statements */
  for (const key of sortedKeys) {
    const value = normalized[key];
    const valueStr = R.is(String, value) ? value : JSON.stringify(value);
    const nameField = encodeToField(key);
    const valueField = encodeToField(valueStr);

    preimages.push({
      name: key,
      value: valueStr,
      nameHash: toHex(nameField),
      valueHash: toHex(valueField),
      blindingHash: toHex(blindingField),
    });

    const leafField = poseidon([nameField, valueField, blindingField]);
    leaves.push(poseidon.F.toObject(leafField));
  }
  /* eslint-enable functional/immutable-data, functional/no-expression-statements */

  return { leaves, preimages };
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
  poseidon: any,
): TreeResult => {
  const leafCount = leaves.length;

  // Single leaf — root equals the leaf, proof is empty
  if (leafCount === 1) {
    const leaf = leaves[0] ?? poseidon.F.toObject(poseidon.F.zero);
    return {
      root: leaf,
      inclusionProofs: [{ siblings: [], indices: [] }],
    };
  }

  // Pad to next power of 2
  const depth = Math.ceil(Math.log2(leafCount));
  const size = Math.pow(2, depth);
  const zero = poseidon.F.toObject(poseidon.F.zero);
  const padded: bigint[] = [...leaves, ...R.repeat(zero, size - leafCount)];

  // Build layers bottom-up, storing each level for proof extraction
  const layers: bigint[][] = [padded];

  /* eslint-disable functional/immutable-data, functional/no-expression-statements */
  let current = padded;
  while (current.length > 1) {
    const next: bigint[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const hashResult = poseidon([current[i], current[i + 1]]);
      next.push(poseidon.F.toObject(hashResult));
    }
    layers.push(next);
    current = next;
  }
  /* eslint-enable functional/immutable-data, functional/no-expression-statements */

  const root = current[0] ?? zero;

  // Extract inclusion proof for each original leaf
  const inclusionProofs: InclusionProof[] = R.times((leafIdx: number) => {
    const siblings: string[] = [];
    const indices: number[] = [];

    /* eslint-disable functional/immutable-data, functional/no-expression-statements */
    let idx = leafIdx;
    for (let level = 0; level < depth; level++) {
      const siblingIdx = idx ^ 1; // XOR to get sibling
      const sibling = layers[level]?.[siblingIdx] ?? zero;
      siblings.push(toHex(sibling));
      indices.push(idx & 1); // 0 = left, 1 = right
      idx = Math.floor(idx / 2);
    }
    /* eslint-enable functional/immutable-data, functional/no-expression-statements */

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

export const commitNormalized = async (
  normalized: Json,
): Promise<CommitResult> => {
  return R.cond([
    [
      () => !R.is(Object, normalized) || R.isEmpty(normalized),
      () => Promise.reject(new Error("Normalized data must be a non-empty object")),
    ],
    [
      R.T,
      async () => {
        const poseidon = await getPoseidon();
        const randomness = randomBytes(32).toString("hex");

        const leafResult = await computeLeaves(
          normalized as Readonly<Record<string, Json>>,
          randomness,
          poseidon,
        );

        const { root, inclusionProofs } = buildMerkleTree(leafResult.leaves, poseidon);

        return {
          root: toHex(root),
          leaves: R.map((leaf: bigint) => toHex(leaf), leafResult.leaves),
          randomness: `0x${randomness}`,
          inclusionProofs,
          leafPreimages: leafResult.preimages,
        };
      },
    ],
  ])();
};
