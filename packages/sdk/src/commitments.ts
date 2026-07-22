/**
 *
 * Whitepaper §2.3 — Commitments (Poseidon Merkle tree).
 */
import type { DocumentCommitments, InclusionProof, LeafPreimage } from "@lemmaoracle/spec";
import type { Json } from "./internal.js";
import * as R from "ramda";
import { poseidon2, poseidon3 } from "poseidon-lite";
import { sha256Hex, randomHex, utf8ToBytes } from "./platform.js";

// BN254 field prime from circomlib (alt_bn128)
const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

export type PrepareOutput<Norm> = Readonly<{
  normalized: Norm;
  commitments: DocumentCommitments;
  /** Depth of the Merkle tree (0 for a single leaf, 1 for 2 leaves, etc.). */
  depth: number;
  /** Inclusion proof for each leaf (same order as commitments.leaves) */
  inclusionProofs: ReadonlyArray<InclusionProof>;
  /** Pre-image components for each leaf (same order as commitments.leaves) */
  leafPreimages: ReadonlyArray<LeafPreimage>;
}>;

/**
 * Convert an arbitrary value to a finite-field scalar.
 *
 * - `number` → `BigInt(value) % PRIME`
 * - `string` → `SHA-256(value) mod PRIME` (always — never BigInt)
 *
 * Strings are **always** hashed via SHA-256, even numeric strings like `"42"`.
 * This prevents `toScalar(42)` and `toScalar("42")` from mapping to the same
 * field element, which would break the binding property of commitments
 * (e.g. `{"price": 42}` and `{"price": "42"}` would produce the same leaf).
 *
 * Circuits that expect the raw numeric value (e.g. `task_bucket == 1`) should
 * pass the original number to the witness, **not** the output of this function.
 * Use this only when you need the same scalar the SDK used internally
 * (e.g. for `nameHash` / `valueHash` reconstruction).
 */
export const toScalar = (value: string | number): bigint =>
  typeof value === "number"
    ? BigInt(value) % BN254_PRIME
    : BigInt(`0x${sha256Hex(utf8ToBytes(value))}`) % BN254_PRIME;

const toHex = (n: bigint): string => `0x${n.toString(16)}`;

// ---------------------------------------------------------------------------
// Leaf computation
// ---------------------------------------------------------------------------

type LeafResult = Readonly<{
  leaves: ReadonlyArray<bigint>;
  preimages: ReadonlyArray<LeafPreimage>;
}>;

/**
 * Convert a value to a hashable representation for `toScalar`.
 *
 * - `number` (integer) → the number itself (passes through `toScalar`'s BigInt path)
 * - `number` (float)   → `f:${String(n)}` (goes through SHA-256 path, since `BigInt(3.14)` throws)
 * - `string`           → `s:${value}` (forces SHA-256 even for numeric strings)
 * - `null`             → `z:null`
 * - `boolean`          → `b:true` / `b:false`
 *
 * Type tags prevent `toScalar(42)` and `toScalar("42")` from colliding —
 * even after the `toScalar` fix, this keeps the preimage human-readable
 * and the scheme self-documenting.
 */
const valueForHash = (value: Json): string | number =>
  typeof value === "number"
    ? Number.isInteger(value)
      ? value
      : `f:${String(value)}`
    : typeof value === "string"
      ? `s:${value}`
      : value === null
        ? "z:null"
        : typeof value === "boolean"
          ? `b:${String(value)}`
          : JSON.stringify(value);

// ── flat key-value extraction (existing behaviour) ─────────────────────

const computeLeaves = (
  normalized: Readonly<Record<string, Json>>,
  randomness: string,
): LeafResult => {
  const sortedKeys = [...R.keys(normalized)].sort();
  // randomness is a hex string WITHOUT "0x" prefix (from commit)
  // Convert it to field element (snarkjs will do the same with "0x" + randomness)
  // No modulo reduction - randomness is already in the field
  const blindingField = BigInt(`0x${randomness}`);

  const computeLeaf = (key: string): Readonly<{ preimage: LeafPreimage; leaf: bigint }> => {
    const value = normalized[key];
    // Preserve original type: numbers stay numbers, others become strings
    const valueForHash = typeof value === "number" ? value :
                         R.is(String, value) ? value : JSON.stringify(value);
    const nameField = toScalar(key);
    const valueField = toScalar(valueForHash);

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

// ── recursive path-value extraction (data-commitment-v1 compatible) ─────

/**
 * A single path-value pair extracted from nested JSON.
 *
 * Paths use bracket notation with JSON-escaped keys:
 *   - Root:        `$`
 *   - Property:    `$["foo"]["bar"]`
 *   - Array index: `$["foo"][0]["bar"]`
 */
type PathValue = Readonly<{
  path: string;
  value: Json;
}>;

/** Append an object-key segment to a path prefix. */
const appendKey = (prefix: string, key: string): string =>
  `${prefix}[${JSON.stringify(key)}]`;

/** Append an array-index segment to a path prefix. */
const appendIndex = (prefix: string, index: number): string =>
  `${prefix}[${String(index)}]`;

/**
 * Recursively extract path-value pairs from a JSON value.
 *
 * - Primitives (null, boolean, number, string): single pair at `prefix`.
 * - Arrays: one pair per element with index appended; order preserved.
 * - Objects: one pair per key (sorted) with key appended.
 */
const extractPathValues = (
  value: Json,
  prefix: string,
): ReadonlyArray<PathValue> =>
  value === null
    ? [{ path: prefix, value }]
    : typeof value === "boolean"
      ? [{ path: prefix, value }]
      : typeof value === "number"
        ? [{ path: prefix, value }]
        : typeof value === "string"
          ? [{ path: prefix, value }]
          : Array.isArray(value)
            ? (value as readonly Json[]).flatMap((item: Json, i) =>
                extractPathValues(item, appendIndex(prefix, i)),
              )
            : Object.keys(value as Readonly<Record<string, Json>>)
                .sort()
                .flatMap((k) => extractPathValues((value as Readonly<Record<string, Json>>)[k] as Json, appendKey(prefix, k)));

/** Extract path-value pairs from the root JSON value. Paths start with `$`. */
const extractPaths = (value: Json): ReadonlyArray<PathValue> =>
  extractPathValues(value, "$");

/**
 * Build leaves from path-value pairs using data-commitment-v1 scheme:
 * `leaf = Poseidon3([toScalar(path), toScalar(valueForHash(value)), randomness])`
 */
const computeDataLeaves = (
  pathValues: ReadonlyArray<PathValue>,
  randomness: string,
): LeafResult => {
  const blindingField = BigInt(`0x${randomness}`);

  const computeLeaf = (pv: PathValue): Readonly<{ preimage: LeafPreimage; leaf: bigint }> => {
    const vfHash = valueForHash(pv.value);
    const pathField = toScalar(pv.path);
    const valueField = toScalar(vfHash);

    const preimage: LeafPreimage = {
      name: pv.path,
      value: vfHash,
      nameHash: toHex(pathField),
      valueHash: toHex(valueField),
      blindingHash: toHex(blindingField),
    };

    const leaf = poseidon3([pathField, valueField, blindingField]);
    return { preimage, leaf };
  };

  const results = R.map(computeLeaf, pathValues);
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
  depth: number;
  inclusionProofs: ReadonlyArray<InclusionProof>;
}>;

const buildMerkleTree = (
  leaves: ReadonlyArray<bigint>,
  _poseidon: unknown,
  maxDepth?: number,
): TreeResult => {
  const leafCount = leaves.length;

  return leafCount === 0
    ? { root: 0n, depth: 0, inclusionProofs: [] }
    : leafCount === 1 && (maxDepth === undefined || maxDepth === 0)
      ? {
          root: leaves[0] ?? 0n,
          depth: 0,
          inclusionProofs: [{ siblings: [], indices: [] }],
        }
      : (() => {
    const minDepth = Math.ceil(Math.log2(leafCount));
    const depth = maxDepth !== undefined ? Math.max(minDepth, maxDepth) : minDepth;
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

        return { root, depth, inclusionProofs };
      })();
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * SNARK-friendly hash over field elements using Poseidon (BN254).
 *
 * - 2 inputs → Poseidon2 (binary node hash)
 * - 3 inputs → Poseidon3 (leaf: nameHash ‖ valueHash ‖ blinding)
 * - other    → Poseidon2 applied iteratively (left-fold)
 *
 * Compose with `toScalar` for the same field-element pipeline the SDK
 * uses internally:
 *
 * ```ts
 * const commitment = poseidon([
 *   toScalar("approvalId"), toScalar("signerSet"),
 *   BigInt(42161), BigInt(amount),
 * ]);
 * ```
 */
export const poseidon = (inputs: ReadonlyArray<bigint>): bigint =>
  R.cond([
    [(ins: ReadonlyArray<bigint>) => ins.length === 2, (ins: ReadonlyArray<bigint>) => poseidon2([...ins])],
    [(ins: ReadonlyArray<bigint>) => ins.length === 3, (ins: ReadonlyArray<bigint>) => poseidon3([...ins])],
    [R.T, (ins: ReadonlyArray<bigint>) =>
      R.reduce((acc: bigint, x: bigint) => poseidon2([acc, x]), ins[0] ?? 0n, ins.slice(1))],
  ])(inputs);

export type CommitResult = Readonly<{
  root: string;
  leaves: ReadonlyArray<string>;
  randomness: string;
  /** Depth of the Merkle tree (0 for a single leaf, 1 for 2 leaves, etc.). */
  depth: number;
  inclusionProofs: ReadonlyArray<InclusionProof>;
  leafPreimages: ReadonlyArray<LeafPreimage>;
}>;

export const commit = (
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
        const randomness = randomHex(32);

        const leafResult = computeLeaves(
          normalized as Readonly<Record<string, Json>>,
          randomness,
        );

        const { root, depth, inclusionProofs } = buildMerkleTree(leafResult.leaves, null);

        return Promise.resolve({
          root: toHex(root),
          leaves: R.map((leaf: bigint) => toHex(leaf), leafResult.leaves),
          randomness: `0x${randomness}`,
          depth,
          inclusionProofs,
          leafPreimages: leafResult.preimages,
        });
      },
    ],
  ])(undefined);

/**
 * Options for {@link commitDeep}.
 */
export type CommitDeepOptions = Readonly<{
  /** 32-byte hex string (no `0x` prefix). If omitted, a new one is generated. */
  randomness?: string;
  /** Fixed tree depth. Pads the tree to `2^maxDepth` leaves with zero leaves. */
  maxDepth?: number;
}>;

/**
 * Compute a data-commitment-v1 commitment over arbitrary (possibly nested) JSON.
 *
 * Extracts path-value pairs recursively (e.g. `$["rates"]["JPY"] = 162.38`),
 * builds a Poseidon Merkle tree, and returns the root with inclusion proofs.
 *
 * Each leaf is `Poseidon3([toScalar(path), toScalar(valueForHash(value)), randomness])`
 * where `valueForHash` applies type tags (`s:`, `f:`, `z:`, `b:`) to prevent
 * number/string collisions.
 *
 * @param value  Arbitrary JSON value (objects, arrays, primitives).
 * @param options  Optional randomness and maxDepth.
 */
export const commitDeep = (
  value: Json,
  options?: CommitDeepOptions,
): CommitResult => {
  const randomness = options?.randomness ?? randomHex(32);
  const maxDepth = options?.maxDepth;

  const pathValues = extractPaths(value);

  return pathValues.length === 0
    ? {
        root: toHex(0n),
        randomness: `0x${randomness}`,
        depth: 0,
        leaves: [],
        inclusionProofs: [],
        leafPreimages: [],
      }
    : (() => {
        const leafResult = computeDataLeaves(pathValues, randomness);
        const { root, depth, inclusionProofs } = buildMerkleTree(
          leafResult.leaves,
          null,
          maxDepth,
        );

        return {
          root: toHex(root),
          leaves: R.map((leaf: bigint) => toHex(leaf), leafResult.leaves),
          randomness: `0x${randomness}`,
          depth,
          inclusionProofs,
          leafPreimages: leafResult.preimages,
        };
      })();
};
