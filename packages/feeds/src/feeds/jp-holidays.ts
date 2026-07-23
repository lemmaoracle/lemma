/**
 * Cabinet Office public-holiday feed (W0).
 *
 * Fetches the official CSV, decodes Shift_JIS, normalises, and commits a
 * **compact** structure so the proof set stays small: the Merkle tree is over
 * `{ type, holidaysHash, count, rangeFrom, rangeTo }` (~5 leaves → ~5 proofs),
 * not over the ~1,500 individual holidays. `holidaysHash` binds the full list
 * into that commitment, so a client can re-hash the served `data` and check it
 * against the committed leaf.
 *
 * The full holiday list travels in `data.holidays` (not committed) and is
 * emitted as `date.<ISO> = <name>` attributes for the serving side to rebuild.
 * Meta lives under `meta.*`. This is the attribute contract the workers dataset
 * handler reads.
 *
 * Idempotency: `docHash = sha256(root | docId)` and neither the committed
 * structure nor `docId` carries a timestamp, so re-running against an unchanged
 * CSV produces the same docHash (register is INSERT-OR-IGNORE). The snapshot
 * time is an attribute only.
 */

import type { FeedSource } from "../types.js";
import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import type { Json } from "@lemmaoracle/sdk";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import { createHash } from "node:crypto";

const DEFAULT_URL =
  "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";
const TYPE = "jp-holidays-v1";

export type Holiday = Readonly<{ date: string; name: string }>;

// ── helpers ─────────────────────────────────────────────────────────────────

const jsonString = (v: Json | undefined, fallback: string): string =>
  typeof v === "string"
    ? v
    : typeof v === "number" || typeof v === "boolean"
      ? String(v)
      : fallback;

/** Sync validation boundary for parsers — no Promise-returning alternative. */
const fail = (message: string): never => {
  // imperative: sync parser API must throw — no functional alternative
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(message);
};

// ── parsing / normalisation ─────────────────────────────────────────────────

/** `YYYY/M/D` (no zero-pad) → ISO `YYYY-MM-DD`. Throws on anything else. */
export const toIsoDate = (ymd: string): string => {
  const m = ymd.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  return m === null
    ? fail(`jp-holidays: unparsable date "${ymd}"`)
    : `${m[1] ?? ""}-${(m[2] ?? "").padStart(2, "0")}-${(m[3] ?? "").padStart(2, "0")}`;
};

/**
 * Parse the (already Shift_JIS-decoded) CSV into a date-sorted holiday list.
 *
 * Two columns: `月日,名称`. The first line is a header. A row that does not
 * parse rejects the whole snapshot (no partial success — a malformed row is a
 * corruption signal, not a row to skip).
 */
export const parseHolidays = (text: string): ReadonlyArray<Holiday> => {
  const rows = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(1); // drop header

  const holidays = rows.map((line): Holiday => {
    const comma = line.indexOf(",");
    return comma < 0
      ? fail(`jp-holidays: unparsable row "${line}"`)
      : {
          date: toIsoDate(line.slice(0, comma)),
          name: line.slice(comma + 1).trim(),
        };
  });

  return [...holidays].sort((a, b) => a.date.localeCompare(b.date));
};

// ── hashing / snapshot ───────────────────────────────────────────────────────

const sha256hex = (s: string): string =>
  createHash("sha256").update(s, "utf8").digest("hex");

/**
 * Canonical preimage of the full list: an array of `{date,name}` objects in
 * date order, keys already ascending (`date` < `name`). `JSON.stringify` gives
 * key-sorted, LF-free, no-trailing-newline UTF-8 — the canonical form a client
 * reproduces to re-derive `contentHash`.
 */
export const canonicalHolidays = (holidays: ReadonlyArray<Holiday>): string =>
  JSON.stringify(holidays.map((h) => ({ date: h.date, name: h.name })));

export type Snapshot = Readonly<{
  compact: Readonly<Record<string, string | number>>;
  holidaysHash: string;
  rangeFrom: string;
  rangeTo: string;
}>;

/** The committed compact structure (~5 leaves) plus the derived hashes. */
export const buildSnapshot = (holidays: ReadonlyArray<Holiday>): Snapshot => {
  const first = holidays[0];
  const last = holidays[holidays.length - 1];
  return first === undefined || last === undefined
    ? fail("jp-holidays: empty holiday set")
    : (() => {
        const holidaysHash = sha256hex(canonicalHolidays(holidays));
        const rangeFrom = first.date;
        const rangeTo = last.date;
        return {
          compact: {
            type: TYPE,
            holidaysHash,
            count: holidays.length,
            rangeFrom,
            rangeTo,
          },
          holidaysHash,
          rangeFrom,
          rangeTo,
        };
      })();
};

// ── feed source ──────────────────────────────────────────────────────────────

export const jpHolidays: FeedSource = {
  id: "jp-holidays",
  label: "Japan public holidays (Cabinet Office)",
  category: "holidays",

  fetch: (_config?: FetcherConfig): Promise<FetchResult> => {
    const url = process.env["JP_HOLIDAYS_URL"] ?? DEFAULT_URL;

    return fetch(url).then((resp) =>
      !resp.ok
        ? Promise.reject(
            new Error(
              `jp-holidays: fetch ${url} → ${String(resp.status)}`,
            ),
          )
        : resp.arrayBuffer().then((buf) => {
            // Shift_JIS via Node's full-ICU TextDecoder. This feed runs in Node
            // only (the seed drives snarkjs through the pipeline), so it does
            // not rely on workerd's decoder support.
            const text = new TextDecoder("shift_jis").decode(buf);
            const holidays = parseHolidays(text);
            const snap = buildSnapshot(holidays);

            // Commit the COMPACT structure only (~5 leaves), not the full list.
            const compactJson = snap.compact as unknown as Json;
            const { canonical } = canonicalSort(compactJson);
            const maxDepth = Number(process.env["FEED_MAX_DEPTH"] ?? "16");
            const commitment = commitDeep(compactJson, { maxDepth });

            return {
              source: "jp-holidays",
              fetchedAt: Date.now(),
              // Carry the full list alongside the compact fields so getAttributes
              // can emit it; only the compact fields were committed above.
              data: { ...snap.compact, holidays },
              canonical,
              commitment,
            };
          }),
    );
  },

  // Content-derived (last covered date), so an unchanged CSV yields the same
  // docHash. When a new year is published, rangeTo moves and a fresh snapshot
  // registers.
  getDocumentId: (data) =>
    jsonString(
      (data as Readonly<Record<string, Json>>)["rangeTo"],
      "unknown",
    ),

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const holidays =
      (obj["holidays"] as ReadonlyArray<Holiday> | undefined) ?? [];
    return {
      "meta.type": jsonString(obj["type"], TYPE),
      // Served as provenance.contentHash. `sha256:` form matches the spec.
      "meta.contentHash": `sha256:${jsonString(obj["holidaysHash"], "")}`,
      "meta.count": jsonString(obj["count"], String(holidays.length)),
      "meta.rangeFrom": jsonString(obj["rangeFrom"], ""),
      "meta.rangeTo": jsonString(obj["rangeTo"], ""),
      // Attribute only (never committed), so it does not affect idempotency.
      "meta.snapshotAt": new Date().toISOString(),
      ...Object.fromEntries(
        holidays.map((h) => [`date.${h.date}`, h.name] as const),
      ),
    };
  },
};
