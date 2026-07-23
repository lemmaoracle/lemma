/**
 * canonical-sort-v1 — Deterministic JSON serialisation for commitments.
 *
 * Produces a canonical byte string from arbitrary JSON so that the same logical
 * data always yields the same commitment, regardless of key ordering or number
 * formatting in the source response.
 *
 * Rules (subset of RFC 8785 / JCS):
 *  1. Object keys sorted by Unicode code point (UTF-16 code unit comparison,
 *     which is equivalent for BMP and correct for surrogate pairs).
 *  2. Deep objects: recursively sorted (NOT flattened).
 *  3. Arrays: order preserved (NOT sorted); elements recursively canonicalised.
 *  4. Numbers: shortest round-trip representation (`String(n)`); `-0` → `"0"`;
 *     non-finite numbers rejected.
 *  5. Strings: standard JSON escaping (control chars → \uXXXX, shorthand for
 *     \b \t \n \f \r).
 *  6. No whitespace.
 */
import type { CanonicalOutput, Json } from "./types.js";

// ── encoding helper ─────────────────────────────────────────────────────

const textEncoder = new TextEncoder();

const utf8ToBytes = (str: string): Uint8Array => textEncoder.encode(str);

// ── string escaping ────────────────────────────────────────────────────

/**
 * Shorthand escapes for the seven control characters that have them.
 */
const STRING_ESCAPES: Readonly<Record<string, string>> = {
  '"': '\\"',
  "\\": "\\\\",
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
};

/**
 * Escape a single character per JCS rules.
 *
 * Called by `String.prototype.replace` for every character matching
 * `/["\\\u0000-\u001f]/g`.
 */
const escapeChar = (ch: string): string => {
  const shorthand = STRING_ESCAPES[ch];
  return shorthand !== undefined
    ? shorthand
    : `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`;
};

/**
 * Serialise a string as a JSON string literal (with surrounding quotes).
 *
 * Escapes `"`, `\`, and all control characters (U+0000–U+001F).
 * Does NOT escape `/` (forward slash) — JCS does not.
 */
const serializeString = (s: string): string =>
  // eslint-disable-next-line no-control-regex -- JCS requires matching control chars
  `"${s.replace(/["\\\u0000-\u001f]/g, escapeChar)}"`;

// ── number serialisation ────────────────────────────────────────────────

/**
 * Serialise a number in its shortest round-trip form.
 *
 * - `-0` → `"0"` (JCS rule).
 * - Non-finite (NaN, ±Infinity) → throws (not valid JSON).
 * - Otherwise: `String(n)` which per ECMAScript already yields the shortest
 *   string that round-trips to the same number64.
 */
const serializeNumber = (n: number): string =>
  !Number.isFinite(n)
    ? (() => {
        // Sync canonicalize API cannot return Promise.reject; invalid JSON numbers are a hard error.
        // eslint-disable-next-line functional/no-throw-statements -- sync validation boundary
        throw new Error(`canonical-sort: non-finite number: ${String(n)}`);
      })()
    : Object.is(n, -0)
      ? "0"
      : String(n);

// ── recursive canonicalisation ──────────────────────────────────────────

/**
 * Serialise an object: sort keys, serialise each pair, join with commas.
 */
const serializeObject = (obj: Readonly<Record<string, Json>>): string => {
  const sortedKeys = [...Object.keys(obj)].sort();
  const pairs = sortedKeys.map(
    (k) => `${serializeString(k)}:${canonicalize(obj[k] as Json)}`,
  );
  return `{${pairs.join(",")}}`;
};

/**
 * Serialise an array: preserve order, recursively canonicalise each element.
 */
const serializeArray = (arr: readonly Json[]): string =>
  `[${arr.map(canonicalize).join(",")}]`;

/**
 * Canonicalise an arbitrary JSON value into a deterministic string.
 *
 * Dispatches by type using ternary expressions (functional style guide
 * allows ternaries; `R.cond` requires array-typed type parameters which
 * `Json` does not satisfy).
 *
 *  - `null`          → `"null"`
 *  - `boolean`       → `"true"` / `"false"`
 *  - `number`        → shortest round-trip (JCS)
 *  - `string`        → escaped JSON string
 *  - `array`         → `[elem,…]` (order preserved)
 *  - `object`        → `{"key":…}` (keys sorted)
 */
export const canonicalize = (value: Json): string =>
  value === null
    ? "null"
    : typeof value === "boolean"
      ? String(value)
      : typeof value === "number"
        ? serializeNumber(value)
        : typeof value === "string"
          ? serializeString(value)
          : Array.isArray(value)
            ? serializeArray(value)
            : serializeObject(value as Readonly<Record<string, Json>>);

// ── public API ──────────────────────────────────────────────────────────

/**
 * Canonicalise JSON and return both the string and its UTF-8 bytes.
 *
 * The bytes are suitable for hashing with SHA-256 or Poseidon (via
 * `toScalar`).
 */
export const canonicalSort = (value: Json): CanonicalOutput => {
  const canonical = canonicalize(value);
  return {
    canonical,
    bytes: utf8ToBytes(canonical),
  };
};

// Re-export types
export type { CanonicalOutput, Json } from "./types.js";
