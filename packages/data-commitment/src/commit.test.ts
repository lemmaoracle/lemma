import { describe, it, expect } from "vitest";
import { commitToData, extractPaths, verifyInclusion } from "./index.js";
import type { Json } from "./index.js";

describe("extractPaths", () => {
  it("extracts from a flat object", () => {
    const value: Json = { a: 1, b: "hello", c: true };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["a"]', value: 1 },
      { path: '$["b"]', value: "hello" },
      { path: '$["c"]', value: true },
    ]);
  });

  it("extracts from nested objects (sorted keys)", () => {
    const value: Json = { outer: { inner_b: 2, inner_a: 1 } };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["outer"]["inner_a"]', value: 1 },
      { path: '$["outer"]["inner_b"]', value: 2 },
    ]);
  });

  it("extracts from arrays (order preserved)", () => {
    const value: Json = { items: [10, 20, 30] };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["items"][0]', value: 10 },
      { path: '$["items"][1]', value: 20 },
      { path: '$["items"][2]', value: 30 },
    ]);
  });

  it("extracts from array of objects", () => {
    const value: Json = { items: [{ id: "a" }, { id: "b" }] };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["items"][0]["id"]', value: "a" },
      { path: '$["items"][1]["id"]', value: "b" },
    ]);
  });

  it("extracts null and boolean values", () => {
    const value: Json = { nil: null, yes: true, no: false };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["nil"]', value: null },
      { path: '$["no"]', value: false },
      { path: '$["yes"]', value: true },
    ]);
  });

  it("handles primitive root (single leaf)", () => {
    const paths = extractPaths(42);
    expect(paths).toEqual([{ path: "$", value: 42 }]);
  });

  it("handles empty object", () => {
    expect(extractPaths({})).toEqual([]);
  });

  it("handles deeply nested structure", () => {
    const value: Json = {
      data: {
        price: 42000,
        currency: "USD",
        meta: { source: "api", verified: true },
      },
    };
    const paths = extractPaths(value);
    expect(paths).toHaveLength(4);
    expect(paths.map((p) => p.path)).toEqual([
      '$["data"]["currency"]',
      '$["data"]["meta"]["source"]',
      '$["data"]["meta"]["verified"]',
      '$["data"]["price"]',
    ]);
  });

  it("handles keys with special characters (no path collision)", () => {
    // Key "a.b" should NOT collide with nested {"a": {"b": ...}}
    const value: Json = { "a.b": 1, a: { b: 2 } };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["a"]["b"]', value: 2 },       // nested a.b
      { path: '$["a.b"]', value: 1 },           // flat key "a.b"
    ]);
  });

  it("handles keys with brackets in name (no path collision)", () => {
    const value: Json = { "items[0]": "x", items: ["y"] };
    const paths = extractPaths(value);
    expect(paths).toEqual([
      { path: '$["items"][0]', value: "y" },          // array element
      { path: '$["items[0]"]', value: "x" },           // literal key
    ]);
  });
});

describe("commitToData — security properties", () => {
  it("number 42 and string \"42\" produce different roots (no type confusion)", () => {
    const r = "a".repeat(64);
    const numResult = commitToData({ price: 42 }, r);
    const strResult = commitToData({ price: "42" }, r);
    expect(numResult.root).not.toBe(strResult.root);
  });

  it("handles non-integer (float) values without crashing", () => {
    const value: Json = { price: 42000.5 };
    const result = commitToData(value, "a".repeat(64));
    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
    expect(result.leaves).toHaveLength(1);
  });

  it("integer 42 and float 42.5 produce different roots", () => {
    const r = "a".repeat(64);
    const intResult = commitToData({ price: 42 }, r);
    const floatResult = commitToData({ price: 42.5 }, r);
    expect(intResult.root).not.toBe(floatResult.root);
  });

  it("null and string \"null\" produce different roots", () => {
    const r = "a".repeat(64);
    const nullResult = commitToData({ v: null }, r);
    const strResult = commitToData({ v: "null" }, r);
    expect(nullResult.root).not.toBe(strResult.root);
  });

  it("boolean true and string \"true\" produce different roots", () => {
    const r = "a".repeat(64);
    const boolResult = commitToData({ v: true }, r);
    const strResult = commitToData({ v: "true" }, r);
    expect(boolResult.root).not.toBe(strResult.root);
  });

  it("supports maxDepth for circuit alignment", () => {
    const value: Json = { a: 1, b: 2 };
    const r = "a".repeat(64);
    const result = commitToData(value, r, 16);
    expect(result.depth).toBe(16);
    result.inclusionProofs.forEach((proof) => {
      expect(proof.siblings).toHaveLength(16);
      expect(proof.indices).toHaveLength(16);
    });
  });

  it("maxDepth tree root differs from minimum-depth root", () => {
    const value: Json = { a: 1, b: 2 };
    const r = "a".repeat(64);
    const minResult = commitToData(value, r);
    const maxResult = commitToData(value, r, 16);
    expect(minResult.root).not.toBe(maxResult.root);
  });

  it("verifyInclusion works with maxDepth tree", () => {
    const value: Json = { price: 42000, currency: "USD" };
    const r = "a".repeat(64);
    const result = commitToData(value, r, 16);

    const idx = result.pathValues.findIndex((pv) => pv.path === '$["price"]');
    const proof = result.inclusionProofs[idx]!;

    const verified = verifyInclusion(
      result.root,
      result.randomness,
      '$["price"]',
      42000,
      proof.siblings,
      proof.indices,
    );
    expect(verified).toBe(true);
  });
});

describe("commitToData — basic properties", () => {
  it("produces a commitment for a flat object", () => {
    const value: Json = { price: 42000, currency: "USD" };
    const result = commitToData(value, "a".repeat(64));

    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
    expect(result.randomness).toBe(`0x${"a".repeat(64)}`);
    expect(result.depth).toBe(1);
    expect(result.leaves).toHaveLength(2);
    expect(result.pathValues).toHaveLength(2);
    expect(result.inclusionProofs).toHaveLength(2);
    expect(result.leafPreimages).toHaveLength(2);
  });

  it("handles a single leaf (depth 0)", () => {
    const value: Json = 42;
    const result = commitToData(value);

    expect(result.depth).toBe(0);
    expect(result.leaves).toHaveLength(1);
    expect(result.inclusionProofs[0]?.siblings).toEqual([]);
  });

  it("handles empty object (zero leaves)", () => {
    const value: Json = {};
    const result = commitToData(value);

    expect(result.leaves).toHaveLength(0);
    expect(result.root).toBe("0x0");
  });

  it("is deterministic with fixed randomness", () => {
    const value: Json = { a: 1, b: 2 };
    const r = "deadbeef".repeat(8);
    const result1 = commitToData(value, r);
    const result2 = commitToData(value, r);
    expect(result1.root).toBe(result2.root);
  });

  it("produces different roots with different randomness", () => {
    const value: Json = { a: 1 };
    const r1 = commitToData(value, "1".repeat(64));
    const r2 = commitToData(value, "2".repeat(64));
    expect(r1.root).not.toBe(r2.root);
  });

  it("produces different roots for different data", () => {
    const r = "f".repeat(64);
    const result1 = commitToData({ a: 1 }, r);
    const result2 = commitToData({ a: 2 }, r);
    expect(result1.root).not.toBe(result2.root);
  });

  it("is order-independent (canonical sort makes keys deterministic)", () => {
    const r = "a".repeat(64);
    const result1 = commitToData({ b: 2, a: 1 }, r);
    const result2 = commitToData({ a: 1, b: 2 }, r);
    expect(result1.root).toBe(result2.root);
  });

  it("leaf preimages contain path and value info", () => {
    const value: Json = { price: 42000 };
    const result = commitToData(value, "0".repeat(64));
    const preimage = result.leafPreimages[0];
    expect(preimage?.path).toBe('$["price"]');
    expect(preimage?.value).toBe(42000);
    expect(preimage?.pathHash).toMatch(/^0x[0-9a-f]+$/);
    expect(preimage?.valueHash).toMatch(/^0x[0-9a-f]+$/);
    expect(preimage?.blindingHash).toMatch(/^0x[0-9a-f]+$/);
  });
});

describe("verifyInclusion", () => {
  it("verifies a valid inclusion proof", () => {
    const value: Json = { price: 42000, currency: "USD" };
    const r = "a".repeat(64);
    const result = commitToData(value, r);

    const priceIdx = result.pathValues.findIndex((pv) => pv.path === '$["price"]');
    expect(priceIdx).toBeGreaterThanOrEqual(0);

    const proof = result.inclusionProofs[priceIdx];
    expect(proof).toBeDefined();

    const verified = verifyInclusion(
      result.root,
      result.randomness,
      '$["price"]',
      42000,
      proof!.siblings,
      proof!.indices,
    );
    expect(verified).toBe(true);
  });

  it("rejects wrong value", () => {
    const value: Json = { price: 42000 };
    const r = "a".repeat(64);
    const result = commitToData(value, r);

    const verified = verifyInclusion(
      result.root,
      result.randomness,
      '$["price"]',
      99999,
      [],
      [],
    );
    expect(verified).toBe(false);
  });

  it("rejects wrong path", () => {
    const value: Json = { price: 42000, currency: "USD" };
    const r = "a".repeat(64);
    const result = commitToData(value, r);

    const proof = result.inclusionProofs[0]!;
    const verified = verifyInclusion(
      result.root,
      result.randomness,
      '$["wrong_path"]',
      42000,
      proof.siblings,
      proof.indices,
    );
    expect(verified).toBe(false);
  });

  it("rejects wrong randomness", () => {
    const value: Json = { price: 42000 };
    const r = "a".repeat(64);
    const result = commitToData(value, r);

    const verified = verifyInclusion(
      result.root,
      "0x" + "b".repeat(64),
      '$["price"]',
      42000,
      [],
      [],
    );
    expect(verified).toBe(false);
  });

  it("verifies inclusion for array elements", () => {
    const value: Json = { items: [{ id: "a" }, { id: "b" }] };
    const r = "c".repeat(64);
    const result = commitToData(value, r);

    const idx = result.pathValues.findIndex((pv) => pv.path === '$["items"][0]["id"]');
    expect(idx).toBeGreaterThanOrEqual(0);

    const proof = result.inclusionProofs[idx]!;
    const verified = verifyInclusion(
      result.root,
      result.randomness,
      '$["items"][0]["id"]',
      "a",
      proof.siblings,
      proof.indices,
    );
    expect(verified).toBe(true);
  });
});
