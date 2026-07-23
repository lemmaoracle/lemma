import { describe, it, expect } from "vitest";
import {
  toIsoDate,
  parseHolidays,
  canonicalHolidays,
  buildSnapshot,
} from "./jp-holidays.js";

// A minimal Shift_JIS-decoded CSV (decoding is the fetch()'s job; here the
// text is already Unicode). Header first, then `月日,名称`, deliberately
// out of order to exercise sorting.
const CSV = [
  "国民の祝日・休日月日,国民の祝日・休日名称",
  "2026/5/5,こどもの日",
  "2026/1/1,元日",
  "2026/11/23,勤労感謝の日",
].join("\r\n");

describe("toIsoDate", () => {
  it("zero-pads YYYY/M/D to ISO", () => {
    expect(toIsoDate("2026/1/1")).toBe("2026-01-01");
    expect(toIsoDate("2026/11/23")).toBe("2026-11-23");
    expect(toIsoDate(" 2026/5/5 ")).toBe("2026-05-05");
  });

  it("throws on a malformed date rather than guessing", () => {
    expect(() => toIsoDate("2026-01-01")).toThrow();
    expect(() => toIsoDate("garbage")).toThrow();
  });
});

describe("parseHolidays", () => {
  it("drops the header, parses rows, and sorts by date", () => {
    expect(parseHolidays(CSV)).toEqual([
      { date: "2026-01-01", name: "元日" },
      { date: "2026-05-05", name: "こどもの日" },
      { date: "2026-11-23", name: "勤労感謝の日" },
    ]);
  });

  it("rejects the whole snapshot on a malformed row (no partial success)", () => {
    const bad = ["header", "2026/1/1,元日", "not-a-row"].join("\n");
    expect(() => parseHolidays(bad)).toThrow();
  });

  it("tolerates trailing blank lines", () => {
    expect(parseHolidays(`${CSV}\r\n\r\n`)).toHaveLength(3);
  });
});

describe("canonicalHolidays", () => {
  it("is stable, key-sorted (date before name), with no trailing newline", () => {
    const c = canonicalHolidays([{ date: "2026-01-01", name: "元日" }]);
    expect(c).toBe('[{"date":"2026-01-01","name":"元日"}]');
    // Order of construction must not matter — only date order does.
    expect(canonicalHolidays(parseHolidays(CSV))).toBe(
      canonicalHolidays([
        { date: "2026-01-01", name: "元日" },
        { date: "2026-05-05", name: "こどもの日" },
        { date: "2026-11-23", name: "勤労感謝の日" },
      ]),
    );
  });
});

describe("buildSnapshot", () => {
  it("commits a compact ~5-field structure, not the full list", () => {
    const { compact } = buildSnapshot(parseHolidays(CSV));
    // Exactly the compact keys → ~5 Merkle leaves, not one per holiday.
    expect(Object.keys(compact).sort()).toEqual([
      "count",
      "holidaysHash",
      "rangeFrom",
      "rangeTo",
      "type",
    ]);
    expect(compact["count"]).toBe(3);
    expect(compact["rangeFrom"]).toBe("2026-01-01");
    expect(compact["rangeTo"]).toBe("2026-11-23");
  });

  it("derives holidaysHash from the full list, so any edit changes it", () => {
    const a = buildSnapshot(parseHolidays(CSV)).holidaysHash;
    const edited = buildSnapshot([
      { date: "2026-01-01", name: "元日(改)" },
    ]).holidaysHash;
    expect(a).not.toBe(edited);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same input, same snapshot (idempotency)", () => {
    expect(buildSnapshot(parseHolidays(CSV)).compact).toEqual(
      buildSnapshot(parseHolidays(CSV)).compact,
    );
  });

  it("rejects an empty holiday set", () => {
    expect(() => buildSnapshot([])).toThrow();
  });
});
