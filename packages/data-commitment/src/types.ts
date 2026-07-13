/**
 * Types for data-commitment-v1.
 *
 * data-commitment-v1 is a Poseidon Merkle tree commitment over path-value
 * pairs extracted from arbitrary JSON.  It is the commitment scheme used
 * by the fetcher (Level 2 oracle) and is reusable independently.
 *
 * The JSON type is re-exported from @lemmaoracle/canonical-sort for
 * convenience, but data-commitment does NOT depend on canonical-sort at
 * runtime — it accepts any Json value and extracts paths itself.
 */

// Re-export Json for consumers that don't import canonical-sort directly
export type { Json } from "@lemmaoracle/canonical-sort";

import type { Json } from "@lemmaoracle/canonical-sort";

/**
 * A single path-value pair extracted from JSON.
 *
 * `path` uses bracket notation with JSON-escaped keys:
 *   - Root:        `$`
 *   - Property:    `$["foo"]["bar"]`
 *   - Array index: `$["foo"][0]["bar"]`
 *
 * This format is unambiguous — keys containing `.`, `[`, `]` etc.
 * are JSON-escaped and cannot collide with nested paths.
 */
export type PathValue = Readonly<{
  path: string;
  value: Json;
}>;

/**
 * Pre-image of a Merkle leaf for data-commitment-v1.
 */
export type DataLeafPreimage = Readonly<{
  /** Bracket-notation path (e.g. `$["data"]["price"]`). */
  path: string;
  /** Type-tagged value used for hashing (e.g. `42`, `s:hello`, `z:null`). */
  value: string | number;
  /** Field element hex for `path`. */
  pathHash: string;
  /** Field element hex for `value`. */
  valueHash: string;
  /** Field element hex for `randomness`. */
  blindingHash: string;
}>;

/**
 * Full commitment output for data-commitment-v1.
 */
export type DataCommitment = Readonly<{
  /** Merkle root (hex with `0x` prefix). */
  root: string;
  /** Randomness used for blinding (hex with `0x` prefix, 32 bytes). */
  randomness: string;
  /** Merkle tree depth (0 for a single leaf). */
  depth: number;
  /** Leaf hashes in canonical (sorted) order (hex with `0x` prefix). */
  leaves: ReadonlyArray<string>;
  /** Inclusion proof for each leaf, same order as `leaves`. */
  inclusionProofs: ReadonlyArray<Readonly<{ siblings: ReadonlyArray<string>; indices: ReadonlyArray<number> }>>;
  /** Pre-image for each leaf. */
  leafPreimages: ReadonlyArray<DataLeafPreimage>;
  /** Path-value pairs in the same order as the leaves. */
  pathValues: ReadonlyArray<PathValue>;
}>;
