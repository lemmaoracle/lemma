/**
 *
 * Whitepaper §2.3 — Commitments (Poseidon Merkle tree).
 */
import { createHash, randomBytes } from "node:crypto";
import type { DocumentCommitments } from "@lemmaoracle/spec";
import type { Json } from "./internal";
import * as R from "ramda";

// BN254 field prime from circomlib (alt_bn128)
const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

export type PrepareOutput<Norm> = Readonly<{
  normalized: Norm;
  commitments: DocumentCommitments;
}>;

// Helper: convert string to BN254 field element via SHA-256 mod p
const encodeToField = (value: string): bigint => {
  const hash = createHash("sha256").update(value).digest("hex");
  const hashBigInt = BigInt(`0x${hash}`);
  return hashBigInt % BN254_PRIME;
};

// Lazy singleton for Poseidon (same pattern as schema registry)

let poseidonInstance: Promise<any> | undefined;

const getPoseidon = (): Promise<any> =>
  poseidonInstance
    ? poseidonInstance
    : (poseidonInstance = import("circomlibjs").then(({ buildPoseidon }) => buildPoseidon()));

// Compute leaf commitments for each attribute
const computeLeaves = async (
  normalized: Readonly<Record<string, Json>>,
  randomness: string,
  poseidon: any,
): Promise<ReadonlyArray<bigint>> => {
  // Sort keys for deterministic ordering
  const sortedKeys = R.keys(normalized).sort();

  return Promise.all(
    R.map((key: string) => {
      const value = normalized[key];
      const valueStr = R.is(String, value) ? value : JSON.stringify(value);
      const keyField = encodeToField(key);
      const valueField = encodeToField(valueStr);
      const randomnessField = encodeToField(randomness);

      // Poseidon(key, value, randomness) as leaf
      const leafField = poseidon([keyField, valueField, randomnessField]);
      return poseidon.F.toObject(leafField);
    }, sortedKeys),
  );
};

// Build Merkle tree recursively
const buildMerkleRoot = (leaves: ReadonlyArray<bigint>, poseidon: any): bigint => {
  const leafCount = leaves.length;

  // Base case: single leaf is its own root, using R.cond for branching
  const handleSingleLeaf = R.cond([
    [
      () => leafCount === 1,
      () => {
        const leaf = leaves[0];
        return leaf === undefined ? poseidon.F.toObject(poseidon.F.zero) : leaf;
      },
    ],
    [
      R.T,
      () => {
        // Pad to next power of 2 with zero field element
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(leafCount)));
        const paddedLeaves = R.concat(
          leaves,
          R.repeat(poseidon.F.toObject(poseidon.F.zero), nextPowerOf2 - leafCount),
        );

        // Pair leaves and hash recursively
        const pairAndHash = (level: ReadonlyArray<bigint>): bigint => {
          const levelSize = level.length;

          return R.cond([
            [
              () => levelSize === 1,
              () => {
                const first = level[0];
                return first === undefined ? poseidon.F.toObject(poseidon.F.zero) : first;
              },
            ],
            [
              R.T,
              () => {
                const pairs = R.splitEvery(2, level);
                const nextLevel = R.map((pair: ReadonlyArray<bigint>) => {
                  const [left, right] = pair;
                  const hashResult = poseidon([left, right]);
                  return poseidon.F.toObject(hashResult);
                }, pairs);

                return pairAndHash(nextLevel);
              },
            ],
          ])();
        };

        return pairAndHash(paddedLeaves);
      },
    ],
  ]);

  return handleSingleLeaf();
};

// Main entry point: Poseidon Merkle commitment
export const commitNormalized = async (
  normalized: Json,
): Promise<
  Readonly<{
    root: string;
    leaves: ReadonlyArray<string>;
    randomness: string;
  }>
> => {
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

        const leaves = await computeLeaves(
          normalized as Readonly<Record<string, Json>>,
          randomness,
          poseidon,
        );

        const root = buildMerkleRoot(leaves, poseidon);

        return {
          root: `0x${root.toString(16)}`,
          leaves: R.map((leaf: bigint) => `0x${leaf.toString(16)}`, leaves),
          randomness: `0x${randomness}`,
        };
      },
    ],
  ])();
};
