/**
 * Japan Post postal-code feed (W0).
 *
 * Fetches the official ZIP from Japan Post, extracts the UTF-8 CSV, parses
 * every record, and commits a **compact** structure so the proof set stays
 * small: the Merkle tree is over
 * `{ type, count, contentHash, updatedAt }` (~4 leaves → ~4 proofs),
 * not over the ~124K individual records. `contentHash` binds the full list
 * into that commitment, so a client can re-hash the served `data` and check
 * it against the committed leaf.
 *
 * The full record list travels in `data.records` (not committed). Meta lives
 * under `meta.*`. Per-record attributes are NOT emitted (124K records is too
 * many for the KV attributes path).
 *
 * Idempotency: `docHash = sha256(root | docId)` and neither the committed
 * structure nor `docId` carries a timestamp, so re-running against an
 * unchanged ZIP produces the same docHash (register is INSERT-OR-IGNORE).
 * `updatedAt` is an attribute only.
 */

import type { FeedSource } from "../types.js";
import type { FetchResult } from "@lemmaoracle/fetcher";
import type { Json } from "@lemmaoracle/sdk";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";

const DEFAULT_URL =
  "https://www.post.japanpost.jp/zipcode/dl/utf/zip/utf_all.zip";
const TYPE = "jp-postal-codes-v1";

export type PostalCodeRecord = Readonly<{
  code: string;
  prefecture: string;
  city: string;
  town: string;
  prefectureKana: string;
  cityKana: string;
  townKana: string;
}>;

// ── ZIP extraction (minimal, zero-dependency) ─────────────────────────────

const ZIP_LOCAL_HEADER_SIG = 0x04034b50;

/**
 * Extract the first (and only) file from a ZIP buffer.
 *
 * This is a minimal parser that scans for the local file header and inflates
 * the deflated payload.  It is not a general-purpose unzip — it exists
 * because the only Node dependency that would otherwise be needed is adm-zip,
 * and adding it just for one feed is heavy.
 *
 * Throws if no deflated entry is found.
 */
export const extractFirstZipEntry = (buf: Buffer): Buffer => {
  // Scan for local file header signature (PK\x03\x04) — little-endian.
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < buf.length - 4; i++) {
    const sig = buf.readUInt32LE(i);
    // eslint-disable-next-line functional/no-conditional-statements
    if (sig !== ZIP_LOCAL_HEADER_SIG) continue;

    const compression = buf.readUInt16LE(i + 8);
    const compressedSize = buf.readUInt32LE(i + 18);
    const fileNameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const dataStart = i + 30 + fileNameLen + extraLen;

    // eslint-disable-next-line functional/no-conditional-statements
    if (dataStart + compressedSize > buf.length) continue; // truncated

    const raw = buf.subarray(dataStart, dataStart + compressedSize);

    // eslint-disable-next-line functional/no-conditional-statements
    if (compression === 0) return raw; // stored
    // eslint-disable-next-line functional/no-conditional-statements
    if (compression === 8) return inflateRawSync(raw); // deflated
  }

  throw new Error("jp-postal-codes: no valid ZIP entry found");
};

// ── parsing / normalisation ─────────────────────────────────────────────────

/**
 * Parse the UTF-8 CSV into a canonical postal-code array.
 *
 * The CSV has one row per record.  Columns 2,6,7,8,3,4,5 are used
 * (code, prefecture, city, town, prefectureKana, cityKana, townKana).
 * The first row is skipped (it may or may not be a header in the Japan Post
 * format — the 1-record-per-row UTF-8 variant usually has no header, but
 * we skip any row whose column 2 does not look like a 7-digit code).
 *
 * Results are sorted by code (7-digit postal code string).
 */
export const parsePostalCodes = (
  text: string,
): ReadonlyArray<PostalCodeRecord> => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const records: PostalCodeRecord[] = [];

  // eslint-disable-next-line functional/no-loop-statements
  for (const line of lines) {
    const cols = line.split(",");
    // eslint-disable-next-line functional/no-conditional-statements
    if (cols.length < 9) continue;

    const code = cols[2]?.trim() ?? "";
    // Skip header / non-data rows: code must be exactly 7 digits.
    // eslint-disable-next-line functional/no-conditional-statements
    if (!/^\d{7}$/.test(code)) continue;

    records.push({
      code,
      prefecture: (cols[6] ?? "").trim(),
      city: (cols[7] ?? "").trim(),
      town: (cols[8] ?? "").trim(),
      prefectureKana: (cols[3] ?? "").trim(),
      cityKana: (cols[4] ?? "").trim(),
      townKana: (cols[5] ?? "").trim(),
    });
  }

  // eslint-disable-next-line functional/no-conditional-statements
  if (records.length === 0)
    throw new Error("jp-postal-codes: no valid records parsed");

  return [...records].sort((a, b) => a.code.localeCompare(b.code));
};

// ── hashing / snapshot ───────────────────────────────────────────────────────

const sha256hex = (s: string): string =>
  createHash("sha256").update(s, "utf8").digest("hex");

/**
 * Canonical preimage of the full list: an array of
 * `{code,prefecture,city,town,prefectureKana,cityKana,townKana}` objects
 * sorted by code, keys ascending. `JSON.stringify` gives key-sorted,
 * LF-free, no-trailing-newline UTF-8 — the canonical form a client
 * reproduces to re-derive `contentHash`.
 */
export const canonicalPostalCodes = (
  records: ReadonlyArray<PostalCodeRecord>,
): string =>
  JSON.stringify(
    records.map((r) => ({
      code: r.code,
      city: r.city,
      cityKana: r.cityKana,
      prefecture: r.prefecture,
      prefectureKana: r.prefectureKana,
      town: r.town,
      townKana: r.townKana,
    })),
  );

export type Snapshot = Readonly<{
  compact: Readonly<Record<string, string | number>>;
  contentHash: string;
}>;

/** The committed compact structure (~4 leaves) plus the derived hashes. */
export const buildSnapshot = (
  records: ReadonlyArray<PostalCodeRecord>,
): Snapshot => {
  // eslint-disable-next-line functional/no-conditional-statements
  if (records.length === 0)
    throw new Error("jp-postal-codes: empty record set");
  const contentHash = sha256hex(canonicalPostalCodes(records));
  return {
    compact: {
      type: TYPE,
      count: records.length,
      contentHash,
      updatedAt: new Date().toISOString(),
    },
    contentHash,
  };
};

// ── feed source ──────────────────────────────────────────────────────────────

export const jpPostalCodes: FeedSource = {
  id: "jp-postal-codes",
  label: "Japan postal codes (Japan Post)",
  category: "geo",

  fetch: async (): Promise<FetchResult> => {
    const url = process.env["JP_POSTAL_CODES_URL"] ?? DEFAULT_URL;
    const resp = await fetch(url);
    // eslint-disable-next-line functional/no-conditional-statements
    if (!resp.ok)
      throw new Error(`jp-postal-codes: fetch ${url} → ${resp.status}`);

    const zipBuf = Buffer.from(await resp.arrayBuffer());
    const csvBuf = extractFirstZipEntry(zipBuf);
    const text = new TextDecoder("utf-8").decode(csvBuf);
    const records = parsePostalCodes(text);
    const snap = buildSnapshot(records);

    // Commit the COMPACT structure only (~4 leaves), not the full list.
    const compactJson = snap.compact as unknown as Json;
    const { canonical } = canonicalSort(compactJson);
    const maxDepth = Number(process.env["FEED_MAX_DEPTH"] ?? "16");
    const commitment = commitDeep(compactJson, {
      maxDepth,
    }) as unknown as FetchResult["commitment"];

    return {
      source: "jp-postal-codes",
      fetchedAt: Date.now(),
      // Carry the full list alongside the compact fields so getAttributes can
      // emit it; only the compact fields were committed above.
      data: { ...snap.compact, records } as unknown as Json,
      canonical,
      commitment,
    };
  },

  // Content-derived (contentHash), so an unchanged ZIP yields the same
  // docHash. When Japan Post publishes an update, contentHash changes and a
  // fresh snapshot registers.
  getDocumentId: (data) =>
    String(
      (data as Readonly<Record<string, Json>>)["contentHash"] ?? "unknown",
    ),

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const recordsCount =
      (obj["records"] as ReadonlyArray<PostalCodeRecord> | undefined)
        ?.length ?? 0;
    const attrs: Record<string, string> = {
      "meta.type": String(obj["type"] ?? TYPE),
      "meta.contentHash": `sha256:${String(obj["contentHash"] ?? "")}`,
      "meta.count": String(obj["count"] ?? recordsCount),
      // Attribute only (never committed), so it does not affect idempotency.
      "meta.updatedAt": String(obj["updatedAt"] ?? new Date().toISOString()),
    };
    // Per-record attributes are intentionally NOT emitted — 124K records
    // is too many for the KV attributes path.
    return attrs;
  },
};
