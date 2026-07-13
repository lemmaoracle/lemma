import { describe, it, expect } from "vitest";
import { canonicalize, canonicalSort } from "./index.js";
import type { Json } from "./index.js";

describe("canonicalize", () => {
  it("serialises null", () => {
    expect(canonicalize(null)).toBe("null");
  });

  it("serialises booleans", () => {
    expect(canonicalize(true)).toBe("true");
    expect(canonicalize(false)).toBe("false");
  });

  it("serialises numbers", () => {
    expect(canonicalize(42)).toBe("42");
    expect(canonicalize(-1)).toBe("-1");
    expect(canonicalize(3.14)).toBe("3.14");
    expect(canonicalize(0)).toBe("0");
    expect(canonicalize(-0)).toBe("0"); // -0 → "0"
    expect(canonicalize(1e21)).toBe("1e+21");
  });

  it("serialises strings with escaping", () => {
    expect(canonicalize("hello")).toBe('"hello"');
    expect(canonicalize('quote"')).toBe('"quote\\""');
    expect(canonicalize("back\\slash")).toBe('"back\\\\slash"');
    expect(canonicalize("tab\there")).toBe('"tab\\there"');
    expect(canonicalize("new\nline")).toBe('"new\\nline"');
    expect(canonicalize("carriage\rreturn")).toBe('"carriage\\rreturn"');
    expect(canonicalize("back\bspace")).toBe('"back\\bspace"');
    expect(canonicalize("form\ffeed")).toBe('"form\\ffeed"');
  });

  it("escapes control characters as \\uXXXX", () => {
    expect(canonicalize("\u0000")).toBe('"\\u0000"');
    expect(canonicalize("\u0001")).toBe('"\\u0001"');
    expect(canonicalize("\u001f")).toBe('"\\u001f"');
  });

  it("does NOT escape forward slash", () => {
    expect(canonicalize("a/b")).toBe('"a/b"');
    expect(canonicalize("https://example.com")).toBe('"https://example.com"');
  });

  it("handles unicode characters", () => {
    expect(canonicalize("日本語")).toBe('"日本語"');
    expect(canonicalize("emoji 🎉")).toBe('"emoji 🎉"');
  });

  it("sorts object keys lexicographically", () => {
    const input: Json = { c: 1, a: 2, b: 3 };
    expect(canonicalize(input)).toBe('{"a":2,"b":3,"c":1}');
  });

  it("sorts nested object keys recursively", () => {
    const input: Json = { z: { y: 1, x: 2 }, a: { c: 3, b: 4 } };
    expect(canonicalize(input)).toBe('{"a":{"b":4,"c":3},"z":{"x":2,"y":1}}');
  });

  it("preserves array order", () => {
    const input: Json = [3, 1, 2];
    expect(canonicalize(input)).toBe("[3,1,2]");
  });

  it("canonicalises objects within arrays (keys sorted, order preserved)", () => {
    const input: Json = [{ b: 2, a: 1 }, { d: 4, c: 3 }];
    expect(canonicalize(input)).toBe('[{"a":1,"b":2},{"c":3,"d":4}]');
  });

  it("handles deeply nested structures", () => {
    const input: Json = {
      data: {
        items: [{ id: "x", value: 42 }, { id: "y", value: 99 }],
      },
    };
    expect(canonicalize(input)).toBe(
      '{"data":{"items":[{"id":"x","value":42},{"id":"y","value":99}]}}',
    );
  });

  it("handles empty objects and arrays", () => {
    expect(canonicalize({})).toBe("{}");
    expect(canonicalize([])).toBe("[]");
  });

  it("handles mixed types", () => {
    const input: Json = { num: 42, str: "hello", bool: true, nil: null, arr: [1, "two", false] };
    expect(canonicalize(input)).toBe(
      '{"arr":[1,"two",false],"bool":true,"nil":null,"num":42,"str":"hello"}',
    );
  });

  it("produces no whitespace", () => {
    const input: Json = { a: { b: 1 } };
    expect(canonicalize(input)).not.toContain(" ");
    expect(canonicalize(input)).not.toContain("\n");
    expect(canonicalize(input)).not.toContain("\t");
  });

  it("is deterministic regardless of insertion order", () => {
    const a: Json = { z: 1, a: 2, m: 3 };
    const b: Json = { a: 2, m: 3, z: 1 };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalize(NaN)).toThrow("non-finite");
    expect(() => canonicalize(Infinity)).toThrow("non-finite");
    expect(() => canonicalize(-Infinity)).toThrow("non-finite");
  });
});

describe("canonicalSort", () => {
  it("returns both string and UTF-8 bytes", () => {
    const result = canonicalSort({ b: 2, a: 1 });
    expect(result.canonical).toBe('{"a":1,"b":2}');
    expect(result.bytes).toBeInstanceOf(Uint8Array);
    expect(result.bytes.length).toBe(result.canonical.length);
  });

  it("bytes match UTF-8 encoding of canonical string", () => {
    const result = canonicalSort({ name: "日本語" });
    const expected = new TextEncoder().encode(result.canonical);
    expect(Array.from(result.bytes)).toEqual(Array.from(expected));
  });
});
