/**
 * canonical-sort-v1 — Deterministic JSON serialisation for commitments.
 *
 * Produces a canonical byte string from arbitrary JSON so that the same logical
 * data always yields the same commitment, regardless of key ordering or number
 * formatting in the source response.
 *
 * Rules (subset of RFC 8785 / JCS):
 *  1. Object keys sorted by Unicode code point (UTF-16 code unit comparison).
 *  2. Deep objects: recursively sorted (NOT flattened).
 *  3. Arrays: order preserved (NOT sorted); elements recursively canonicalised.
 *  4. Numbers: shortest round-trip representation (`String(n)`); `-0` → `"0"`.
 *  5. Strings: standard JSON escaping.
 *  6. No whitespace.
 */

// ── types ───────────────────────────────────────────────────────────────

export type CanonicalOutput = Readonly<{
  canonical: string;
  bytes: Uint8Array;
}>;

// ── encoding helper ──────────────────────────────────────────────────────

const textEncoder = new TextEncoder();

// ── string escaping ─────────────────────────────────────────────────────

const STRING_ESCAPES: Readonly<Record<string, string>> = {
  "\"": "\\\"",
  "\\": "\\\\",
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
};

const escapeChar = (ch: string): string => {
  const shorthand = STRING_ESCAPES[ch];
  return shorthand !== undefined
    ? shorthand
    : `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`;
};

const CONTROL_CHAR_REGEX = new RegExp(
  "[\"\\\\" + String.fromCharCode(0) + "-" + String.fromCharCode(0x1f) + "]",
  "g",
);

const serializeString = (s: string): string =>
  `"${s.replace(CONTROL_CHAR_REGEX, escapeChar)}"`;

// ── number serialisation ────────────────────────────────────────────────

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

const serializeObject = (obj: Readonly<Record<string, JsonType>>): string => {
  const sortedKeys = [...Object.keys(obj)].sort();
  const pairs = sortedKeys.map(
    (k) => `${serializeString(k)}:${canonicalize(obj[k] as JsonType)}`,
  );
  return `{${pairs.join(",")}}`;
};

const serializeArray = (arr: readonly JsonType[]): string =>
  `[${arr.map(canonicalize).join(",")}]`;

// ── Json type (local to avoid circular imports) ─────────────────────────

type JsonType =
  | null
  | boolean
  | number
  | string
  | readonly JsonType[]
  | Readonly<{ [k: string]: JsonType }>;

/**
 * Canonicalise an arbitrary JSON value into a deterministic string.
 */
export const canonicalize = (value: JsonType): string =>
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
            : serializeObject(value as Readonly<Record<string, JsonType>>);

/**
 * Canonicalise JSON and return both the string and its UTF-8 bytes.
 */
export const canonicalSort = (value: JsonType): CanonicalOutput => {
  const canonical = canonicalize(value);
  return {
    canonical,
    bytes: textEncoder.encode(canonical),
  };
};