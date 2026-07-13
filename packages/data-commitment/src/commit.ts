/**
 * data-commitment-v1 — Poseidon Merkle commitment over path-value pairs.
 *
 * Normaliser + commitment scheme for arbitrary JSON data.
 *
 * Pipeline:
 *  1. Extract path-value pairs from JSON (deep, not flattened).
 *  2. Each pair → Poseidon3 leaf: `poseidon3([toScalar(path), toScalar(value), randomness])`.
 *  3. Merkle tree (Poseidon2 nodes) → root = commitment.
 *
 * The circuit (`circuits/data-commitment-v1.circom`) verifies Merkle inclusion
 * of a specific (path, value) pair against the published root.
 *
 * This mirrors the SDK's `commitments.ts` but uses JSONPath-like paths
 * instead of attribute names, so it can handle arbitrary API responses.
 *
 * Type tagging (`valueForHash`) prevents number/string collisions in
 * `toScalar` (e.g. `42` and `"42"` would otherwise map to the same field
 * element).
 */
import { poseidon2, poseidon3 } from "poseidon-lite";
import { toScalar } from "@lemmaoracle/sdk";
import { randomBytes } from "@noble/hashes/utils";
import type { Json } from "@lemmaoracle/canonical-sort";
import type {
  DataCommitment,
  DataLeafPreimage,
  PathValue,
} from "./types.js";

// ── randomness helper ──────────────────────────────────────────────────

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const randomHex = (length: number = 32): string =>
  bytesToHex(randomBytes(length));

const toHex = (n: bigint): string => `0x${n.toString(16)}`;

// ── path construction ──────────────────────────────────────────────────

/**
 * Append an object-key segment to a path prefix.
 * Uses bracket notation with JSON-escaped keys for unambiguity:
 *   `$` + `foo` → `$["foo"]`
 *   `$["a"]` + `b` → `$["a"]["b"]`
 *
 * JSON.stringify handles all escaping (quotes, backslashes, control
 * chars, Unicode), so keys containing `.`, `[`, `]`, `$` etc. are
 * unambiguous and cannot collide with nested paths.
 */
const appendKey = (prefix: string, key: string): string =>
  `${prefix}[${JSON.stringify(key)}]`;

/**
 * Append an array-index segment to a path prefix.
 * `$.items` + `0` → `$.items[0]`
 *
 * Bare number (no quotes) distinguishes array index from string key
 * `$["0"]`.
 */
const appendIndex = (prefix: string, index: number): string =>
  `${prefix}[${String(index)}]`;

// ── path extraction ─────────────────────────────────────────────────────

/**
 * Recursively extract path-value pairs from a JSON value.
 *
 * - Primitives (null, boolean, number, string): single pair at `prefix`.
 * - Arrays: one pair per element with index appended; order preserved.
 * - Objects: one pair per key (sorted) with key appended.
 *
 * Primitives always become leaves.  Objects and arrays are traversed —
 * they do NOT themselves appear as leaves, only their scalar descendants
 * do.  This keeps every leaf hashable by `toScalar` (which handles numbers
 * and strings, not nested structures).
 */
const extractPathValues = (
  value: Json,
  prefix: string,
): ReadonlyArray<PathValue> =>
  value === null
    ? [{ path: prefix, value: null }]
    : typeof value === "boolean"
      ? [{ path: prefix, value }]
      : typeof value === "number"
        ? [{ path: prefix, value }]
        : typeof value === "string"
          ? [{ path: prefix, value }]
          : Array.isArray(value)
            ? extractFromArray(value as readonly Json[], prefix)
            : extractFromObject(value as Readonly<Record<string, Json>>, prefix);

/** Extract path-value pairs from an array (order preserved). */
const extractFromArray = (
  arr: readonly Json[],
  prefix: string,
): ReadonlyArray<PathValue> =>
  arr.flatMap((item, i) => extractPathValues(item, appendIndex(prefix, i)));

/** Extract path-value pairs from an object (keys sorted). */
const extractFromObject = (
  obj: Readonly<Record<string, Json>>,
  prefix: string,
): ReadonlyArray<PathValue> =>
  Object.keys(obj)
    .sort()
    .flatMap((k) => extractPathValues(obj[k] as Json, appendKey(prefix, k)));

/**
 * Extract path-value pairs from the root JSON value.
 * Paths start with `$`.
 */
export const extractPaths = (value: Json): ReadonlyArray<PathValue> =>
  extractPathValues(value, "$");

// ── leaf computation ────────────────────────────────────────────────────

/**
 * Convert a value to a type-tagged string for hashing.
 *
 * **Why type tags**: `toScalar` from the SDK maps numeric strings and
 * numbers to the same BN254 field element (e.g. `toScalar(42) ===
 * toScalar("42")`).  Without type tags, `{"price": 42}` (number) and
 * `{"price": "42"}` (string) would produce the same Merkle leaf,
 * breaking the binding property of the commitment.
 *
 * Tags also solve the non-integer problem: `BigInt(3.14)` throws, so
 * floats must go through the SHA-256 string path.
 *
 * Tag scheme:
 *  - `number` (integer)  → the number itself (passes through `toScalar`'s
 *    BigInt path — no tag needed since `n:42` string ≠ integer `42`)
 *  - `number` (float)    → `f:${String(n)}` (goes through SHA-256 path)
 *  - `string`            → `s:${value}` (forces SHA-256 even for "42")
 *  - `null`              → `z:null`
 *  - `boolean`           → `b:true` / `b:false`
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

/**
 * Compute a single Poseidon3 leaf from a path-value pair and randomness.
 *
 * `leaf = Poseidon3([toScalar(path), toScalar(valueForHash), randomness])`
 */
const computeLeaf = (
  pv: PathValue,
  randomness: string,
): Readonly<{ preimage: DataLeafPreimage; leaf: bigint }> => {
  const vfHash = valueForHash(pv.value);
  const pathField = toScalar(pv.path);
  const valueField = toScalar(vfHash);
  const blindingField = BigInt(`0x${randomness}`);

  const preimage: DataLeafPreimage = {
    path: pv.path,
    value: vfHash,
    pathHash: toHex(pathField),
    valueHash: toHex(valueField),
    blindingHash: toHex(blindingField),
  };

  const leaf = poseidon3([pathField, valueField, blindingField]);
  return { preimage, leaf };
};

// ── Merkle tree ─────────────────────────────────────────────────────────

type TreeResult = Readonly<{
  root: bigint;
  depth: number;
  inclusionProofs: ReadonlyArray<Readonly<{ siblings: ReadonlyArray<string>; indices: ReadonlyArray<number> }>>;
}>;

/**
 * Build a Poseidon2 Merkle tree from leaf hashes.
 *
 * Pads to the next power of two (or `2^maxDepth` if specified) with zero
 * leaves.  Single-leaf trees have depth 0 (root = leaf, empty proof).
 *
 * When `maxDepth` is provided, the tree is padded to exactly `2^maxDepth`
 * leaves so the depth matches the circuit's `nLevels` parameter.
 */
const buildMerkleTree = (
  leaves: ReadonlyArray<bigint>,
  maxDepth?: number,
): TreeResult => {
  const leafCount = leaves.length;

  // eslint-disable-next-line functional/no-conditional-statements -- guard
  if (leafCount === 0) {
    return { root: 0n, depth: 0, inclusionProofs: [] };
  }

  // eslint-disable-next-line functional/no-conditional-statements -- guard
  if (leafCount === 1 && (maxDepth === undefined || maxDepth === 0)) {
    return {
      root: leaves[0] ?? 0n,
      depth: 0,
      inclusionProofs: [{ siblings: [], indices: [] }],
    };
  }

  const minDepth = Math.ceil(Math.log2(leafCount));
  const depth = maxDepth !== undefined ? Math.max(minDepth, maxDepth) : minDepth;
  const size = Math.pow(2, depth);
  const zero = 0n;
  const padding: bigint[] = Array.from({ length: size - leafCount }, (_unused) => zero);
  const padded: bigint[] = [...leaves, ...padding];

  /* eslint-disable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements --
   * Merkle tree construction requires imperative mutation for performance */
  const layers: bigint[][] = [padded];
  let current = padded;

  while (current.length > 1) {
    const next: bigint[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i] ?? 0n;
      const right = current[i + 1] ?? 0n;
      next.push(poseidon2([left, right]));
    }
    layers.push(next);
    current = next;
  }
  /* eslint-enable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements */

  const root = current[0] ?? zero;

  const inclusionProofs = Array.from({ length: leafCount }, (_, leafIdx) => {
    const siblings: string[] = [];
    const indices: number[] = [];

    /* eslint-disable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements --
     * Proof extraction requires imperative index tracking */
    let idx = leafIdx;
    for (let level = 0; level < depth; level++) {
      const siblingIdx = idx ^ 1;
      const sibling = layers[level]?.[siblingIdx] ?? zero;
      siblings.push(toHex(sibling));
      indices.push(idx & 1);
      idx = Math.floor(idx / 2);
    }
    /* eslint-enable functional/immutable-data, functional/no-expression-statements, functional/no-let, functional/no-loop-statements */

    return { siblings, indices };
  });

  return { root, depth, inclusionProofs };
};

// ── public API ──────────────────────────────────────────────────────────

/**
 * Compute the data-commitment-v1 for a JSON value.
 *
 * Extracts path-value pairs, builds a Poseidon Merkle tree, and returns
 * the root along with inclusion proofs and pre-images.
 *
 * @param value  JSON value (keys are sorted during extraction, so
 *               canonicalisation is not required beforehand).
 * @param randomness  Optional 32-byte hex string (no `0x` prefix).
 *                    If omitted, a new one is generated.
 * @param maxDepth  Optional fixed tree depth (for circuit alignment).
 *                  Pads the tree to `2^maxDepth` leaves with zero leaves.
 */
export const commitToData = (
  value: Json,
  randomness?: string,
  maxDepth?: number,
): DataCommitment => {
  const r = randomness ?? randomHex(32);
  const pathValues = extractPaths(value);

  // eslint-disable-next-line functional/no-conditional-statements -- guard
  if (pathValues.length === 0) {
    // Empty object/array at root — still commit to an empty tree
    return {
      root: toHex(0n),
      randomness: `0x${r}`,
      depth: 0,
      leaves: [],
      inclusionProofs: [],
      leafPreimages: [],
      pathValues: [],
    };
  }

  const leafResults = pathValues.map((pv) => computeLeaf(pv, r));
  const leaves = leafResults.map((res) => res.leaf);
  const preimages = leafResults.map((res) => res.preimage);

  const { root, depth, inclusionProofs } = buildMerkleTree(leaves, maxDepth);

  return {
    root: toHex(root),
    randomness: `0x${r}`,
    depth,
    leaves: leaves.map((leaf) => toHex(leaf)),
    inclusionProofs,
    leafPreimages: preimages,
    pathValues,
  };
};

// ── verification (non-ZK, for Level 2) ──────────────────────────────────

/**
 * Verify that a given value is committed in a data-commitment-v1 root.
 *
 * Reconstructs the leaf from (path, value, randomness) and checks the
 * Merkle inclusion proof against the published root.
 *
 * This is the non-ZK verification path.  The ZK circuit
 * (`circuits/data-commitment-v1.circom`) performs the same check inside a SNARK.
 */
export const verifyInclusion = (
  root: string,
  randomness: string,
  path: string,
  value: Json,
  siblings: ReadonlyArray<string>,
  indices: ReadonlyArray<number>,
): boolean => {
  const r = randomness.startsWith("0x") ? randomness.slice(2) : randomness;
  const vfHash = valueForHash(value);
  const pathField = toScalar(path);
  const valueField = toScalar(vfHash);
  const blindingField = BigInt(`0x${r}`);

  const leaf = poseidon3([pathField, valueField, blindingField]);

  /* eslint-disable functional/no-let, functional/no-loop-statements, functional/no-expression-statements --
   * Merkle verification requires imperative accumulation */
  let current = leaf;
  for (let i = 0; i < siblings.length; i++) {
    const sibling = BigInt(siblings[i] ?? "0");
    const idx = indices[i] ?? 0;
    current = idx === 0
      ? poseidon2([current, sibling])
      : poseidon2([sibling, current]);
  }
  /* eslint-enable functional/no-let, functional/no-loop-statements, functional/no-expression-statements */

  return toHex(current) === root;
};
