import { describe, it, expect } from "vitest";
import {
  parsePostalCodes,
  canonicalPostalCodes,
  buildSnapshot,
  extractFirstZipEntry,
} from "./jp-postal-codes.js";
import { deflateRawSync } from "node:zlib";

// ── test data ─────────────────────────────────────────────────────────────

const CSV = [
  "01101,060,0600000,ホッカイドウ,サッポロシチュウオウク,イカニケイサイガナイバアイ,北海道,札幌市中央区,以下に掲載がない場合,0,0,0,0,0,0",
  "01101,064,0640941,ホッカイドウ,サッポロシチュウオウク,アサヒガオカ,北海道,札幌市中央区,旭ケ丘,0,0,0,0,0,0",
  "13101,100,1000001,トウキョウト,チヨダク,イカニケイサイガナイバアイ,東京都,千代田区,以下に掲載がない場合,0,0,0,0,0,0",
  // This row has a non-7-digit code in col 2 — should be skipped (header-like)
  "header,row,code,col3,col4,col5,col6,col7,col8,0,0,0,0,0,0",
].join("\r\n");

// ── parsePostalCodes ──────────────────────────────────────────────────────

describe("parsePostalCodes", () => {
  it("parses valid rows and skips non-data rows", () => {
    const records = parsePostalCodes(CSV);
    expect(records).toHaveLength(3);
  });

  it("sorts by postal code ascending", () => {
    const records = parsePostalCodes(CSV);
    expect(records[0]!.code).toBe("0600000");
    expect(records[1]!.code).toBe("0640941");
    expect(records[2]!.code).toBe("1000001");
  });

  it("maps columns correctly", () => {
    const records = parsePostalCodes(CSV);
    const tokyo = records.find((r) => r.code === "1000001")!;
    expect(tokyo).toBeDefined();
    expect(tokyo.prefecture).toBe("東京都");
    expect(tokyo.city).toBe("千代田区");
    expect(tokyo.town).toBe("以下に掲載がない場合");
    expect(tokyo.prefectureKana).toBe("トウキョウト");
    expect(tokyo.cityKana).toBe("チヨダク");
    expect(tokyo.townKana).toBe("イカニケイサイガナイバアイ");
  });

  it("rejects empty input (no valid rows)", () => {
    expect(() => parsePostalCodes("col0,col1,col2\n")).toThrow();
    expect(() => parsePostalCodes("")).toThrow();
  });

  it("tolerates trailing blank lines", () => {
    const records = parsePostalCodes(`${CSV}\r\n\r\n`);
    expect(records).toHaveLength(3);
  });
});

// ── canonicalPostalCodes ──────────────────────────────────────────────────

describe("canonicalPostalCodes", () => {
  it("is stable, key-sorted, with no trailing newline", () => {
    const c = canonicalPostalCodes([
      {
        code: "0600000",
        prefecture: "北海道",
        city: "札幌市中央区",
        town: "以下に掲載がない場合",
        prefectureKana: "ホッカイドウ",
        cityKana: "サッポロシチュウオウク",
        townKana: "イカニケイサイガナイバアイ",
      },
    ]);
    // Keys in the canonical form: code, city, cityKana, prefecture, prefectureKana, town, townKana
    expect(c).toBe(
      '[{"code":"0600000","city":"札幌市中央区","cityKana":"サッポロシチュウオウク",' +
        '"prefecture":"北海道","prefectureKana":"ホッカイドウ",' +
        '"town":"以下に掲載がない場合","townKana":"イカニケイサイガナイバアイ"}]',
    );
  });

  it("is deterministic — same input, same output", () => {
    const records = parsePostalCodes(CSV);
    expect(canonicalPostalCodes(records)).toBe(canonicalPostalCodes(records));
  });

  it("order of construction does not matter — parsePostalCodes always sorts", () => {
    // parsePostalCodes always sorts by code, so any valid CSV yields the
    // same canonical form regardless of row order.
    const csvA = [
      "01101,060,0600000,ホッカイドウ,サッポロシチュウオウク,イカニケイサイガナイバアイ,北海道,札幌市中央区,以下に掲載がない場合,0,0,0,0,0,0",
      "13101,100,1000001,トウキョウト,チヨダク,イカニケイサイガナイバアイ,東京都,千代田区,以下に掲載がない場合,0,0,0,0,0,0",
    ].join("\n");
    const csvB = [
      "13101,100,1000001,トウキョウト,チヨダク,イカニケイサイガナイバアイ,東京都,千代田区,以下に掲載がない場合,0,0,0,0,0,0",
      "01101,060,0600000,ホッカイドウ,サッポロシチュウオウク,イカニケイサイガナイバアイ,北海道,札幌市中央区,以下に掲載がない場合,0,0,0,0,0,0",
    ].join("\n");
    expect(canonicalPostalCodes(parsePostalCodes(csvA))).toBe(
      canonicalPostalCodes(parsePostalCodes(csvB)),
    );
  });
});

// ── buildSnapshot ─────────────────────────────────────────────────────────

describe("buildSnapshot", () => {
  it("commits a compact ~4-field structure, not the full list", () => {
    const { compact } = buildSnapshot(parsePostalCodes(CSV));
    expect(Object.keys(compact).sort()).toEqual([
      "contentHash",
      "count",
      "type",
      "updatedAt",
    ]);
    expect(compact["count"]).toBe(3);
    expect(compact["type"]).toBe("jp-postal-codes-v1");
  });

  it("derives contentHash from the full list, so any edit changes it", () => {
    const a = buildSnapshot(parsePostalCodes(CSV)).contentHash;
    const edited = buildSnapshot([
      {
        code: "0600000",
        prefecture: "北海道(改)",
        city: "札幌市中央区",
        town: "以下に掲載がない場合",
        prefectureKana: "ホッカイドウ",
        cityKana: "サッポロシチュウオウク",
        townKana: "イカニケイサイガナイバアイ",
      },
    ]).contentHash;
    expect(a).not.toBe(edited);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same input, same snapshot (idempotency)", () => {
    expect(buildSnapshot(parsePostalCodes(CSV)).compact).toEqual(
      buildSnapshot(parsePostalCodes(CSV)).compact,
    );
  });

  it("rejects an empty record set", () => {
    expect(() => buildSnapshot([])).toThrow();
  });
});

// ── extractFirstZipEntry ──────────────────────────────────────────────────

describe("extractFirstZipEntry", () => {
  it("extracts a stored (uncompressed) ZIP entry", () => {
    const payload = Buffer.from("hello,postal,codes\n", "utf-8");

    // Build a minimal ZIP local file header for a stored entry.
    const fileName = Buffer.from("test.csv", "utf-8");
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); // signature
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0, 6); // flags
    header.writeUInt16LE(0, 8); // compression: stored
    header.writeUInt16LE(0, 10); // mod time
    header.writeUInt16LE(0, 12); // mod date
    // crc32 — we don't check it
    header.writeUInt32LE(0, 14);
    header.writeUInt32LE(payload.length, 18); // compressed size
    header.writeUInt32LE(payload.length, 22); // uncompressed size
    header.writeUInt16LE(fileName.length, 26); // file name length
    header.writeUInt16LE(0, 28); // extra field length

    const zip = Buffer.concat([header, fileName, payload]);
    expect(extractFirstZipEntry(zip).toString("utf-8")).toBe(
      "hello,postal,codes\n",
    );
  });

  it("extracts a deflated ZIP entry", () => {
    const payload = Buffer.from("hello,deflated,codes\n", "utf-8");
    const deflated = deflateRawSync(payload);

    const fileName = Buffer.from("test.csv", "utf-8");
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); // signature
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0, 6); // flags
    header.writeUInt16LE(8, 8); // compression: deflated
    header.writeUInt16LE(0, 10); // mod time
    header.writeUInt16LE(0, 12); // mod date
    header.writeUInt32LE(0, 14); // crc32
    header.writeUInt32LE(deflated.length, 18); // compressed size
    header.writeUInt32LE(payload.length, 22); // uncompressed size
    header.writeUInt16LE(fileName.length, 26); // file name length
    header.writeUInt16LE(0, 28); // extra field length

    const zip = Buffer.concat([header, fileName, deflated]);
    expect(extractFirstZipEntry(zip).toString("utf-8")).toBe(
      "hello,deflated,codes\n",
    );
  });

  it("throws when no valid ZIP entry is found", () => {
    expect(() => extractFirstZipEntry(Buffer.from("not a zip file"))).toThrow();
  });
});
