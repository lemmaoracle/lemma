/**
 * JSON value — the set of values that `JSON.parse` can produce.
 *
 * Arrays are `ReadonlyArray` and objects are `Readonly` to satisfy the
 * functional style guide (immutability).
 */
export type Json =
  | null
  | boolean
  | number
  | string
  | readonly Json[]
  | Readonly<{ [k: string]: Json }>;

/**
 * Output of canonical-sort-v1.
 *
 * `canonical` is the canonical JSON string (no whitespace, sorted keys,
 * JCS-style number formatting).  `bytes` is the UTF-8 encoding of
 * `canonical` for direct hashing.
 */
export type CanonicalOutput = Readonly<{
  canonical: string;
  bytes: Uint8Array;
}>;
