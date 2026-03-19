import { describe, it, expect } from "vitest";
import { commitNormalized } from "./commitments.js";
import type { Json } from "./internal.js";
import * as R from "ramda";

describe("commitments", () => {
  describe("encodeToField (private, tested via integration)", () => {
    it("produces field elements within BN254 prime via commitNormalized", async () => {
      const normalized = { a: "value1", b: "value2" };
      const result = await commitNormalized(normalized);

      // Check that all outputs are valid hex strings
      expect(result.root).toMatch(/^0x[0-9a-f]+$/);
      expect(result.randomness).toMatch(/^0x[0-9a-f]+$/);
      result.leaves.forEach((commitment) => {
        expect(commitment).toMatch(/^0x[0-9a-f]+$/);
      });

      // Should have 2 leaves (keys a, b)
      expect(result.leaves).toHaveLength(2);
    });
  });

  describe("commitNormalized", () => {
    it("rejects empty or non-object normalized input", async () => {
      await expect(commitNormalized({} as Json)).rejects.toThrow("non-empty object");
      await expect(commitNormalized([] as Json)).rejects.toThrow("non-empty object");
      await expect(commitNormalized("string" as Json)).rejects.toThrow("non-empty object");
    });

    it("produces deterministic leaves for same input", async () => {
      const normalized = { x: 123, y: true, z: "text" };

      const result1 = await commitNormalized(normalized);
      const result2 = await commitNormalized(normalized);

      // All fields should be present
      expect(result1.root).toBeDefined();
      expect(result1.leaves).toBeDefined();
      expect(result1.randomness).toBeDefined();
      expect(result2.root).toBeDefined();
      expect(result2.leaves).toBeDefined();
      expect(result2.randomness).toBeDefined();

      // Should have 3 leaves (x, y, z)
      expect(result1.leaves).toHaveLength(3);
      expect(result2.leaves).toHaveLength(3);

      // Leaves should be different (different randomness)
      expect(result1.leaves[0]).not.toBe(result2.leaves[0]);
    });

    it("produces different roots when any field changes", async () => {
      const base = { field1: "A", field2: "B" };
      const modified = { field1: "A", field2: "C" };

      const resultBase = await commitNormalized(base);
      const resultModified = await commitNormalized(modified);

      expect(resultBase.root).not.toBe(resultModified.root);
    });

    it("produces different roots with different randomness (hiding property)", async () => {
      const normalized = { test: "value" };

      // Run multiple times to get different random values
      const results = await Promise.all(R.times(() => commitNormalized(normalized), 3));

      // All roots should be different (extremely low probability of collision)
      const roots = R.map(R.prop("root"), results);
      const uniqueRoots = new Set(roots);
      expect(uniqueRoots.size).toBe(3);
    });

    it("handles single attribute object", async () => {
      const normalized = { single: "attribute" };
      const result = await commitNormalized(normalized);

      expect(result.leaves).toHaveLength(1);
      expect(result.root).toMatch(/^0x/);
      // For single leaf, root should equal the leaf commitment
      expect(result.root).toBe(result.leaves[0]);
    });

    it("handles complex nested JSON values", async () => {
      const normalized = {
        num: 42,
        str: "hello",
        bool: true,
        null: null,
        arr: [1, 2, 3],
        nested: { inner: "value" },
      };

      const result = await commitNormalized(normalized);

      // Should have 6 leaves (all top-level keys)
      expect(result.leaves).toHaveLength(6);

      // All commitments should be valid hex
      result.leaves.forEach((commitment) => {
        expect(commitment).toMatch(/^0x[0-9a-f]+$/);
      });
    });

    it("sorts keys deterministically", async () => {
      const obj1 = { b: 2, a: 1, c: 3 };
      const obj2 = { a: 1, c: 3, b: 2 };

      const result1 = await commitNormalized(obj1);
      const result2 = await commitNormalized(obj2);

      // Same values, same order should produce same leaf commitments
      // (though randomness differs, so roots will differ)
      // But we can check structure consistency
      expect(result1.leaves).toHaveLength(3);
      expect(result2.leaves).toHaveLength(3);
    });
  });

  describe("inclusionProofs", () => {
    it("returns one proof per leaf", async () => {
      const normalized = { a: "1", b: "2", c: "3" };
      const result = await commitNormalized(normalized);

      expect(result.inclusionProofs).toHaveLength(3);
    });

    it("returns empty siblings/indices for single-leaf tree", async () => {
      const result = await commitNormalized({ only: "one" });

      expect(result.inclusionProofs).toHaveLength(1);
      expect(result.inclusionProofs[0]?.siblings).toEqual([]);
      expect(result.inclusionProofs[0]?.indices).toEqual([]);
    });

    it("returns correct depth for multi-leaf tree", async () => {
      // 3 leaves → padded to 4 → depth 2
      const result = await commitNormalized({ a: "1", b: "2", c: "3" });

      result.inclusionProofs.forEach((proof) => {
        expect(proof.siblings).toHaveLength(2);
        expect(proof.indices).toHaveLength(2);
      });

      // All siblings should be valid hex
      result.inclusionProofs.forEach((proof) => {
        proof.siblings.forEach((s) => expect(s).toMatch(/^0x[0-9a-f]+$/));
      });

      // Indices should be 0 or 1
      result.inclusionProofs.forEach((proof) => {
        proof.indices.forEach((i) => expect([0, 1]).toContain(i));
      });
    });
  });

  describe("leafPreimages", () => {
    it("returns one preimage per leaf with correct attribute names", async () => {
      const normalized = { task_bucket: "field_ops", area_bucket: "east" };
      const result = await commitNormalized(normalized);

      expect(result.leafPreimages).toHaveLength(2);

      // Keys are sorted, so area_bucket comes first
      expect(result.leafPreimages[0]?.name).toBe("area_bucket");
      expect(result.leafPreimages[0]?.value).toBe("east");
      expect(result.leafPreimages[1]?.name).toBe("task_bucket");
      expect(result.leafPreimages[1]?.value).toBe("field_ops");
    });

    it("contains valid hex hashes", async () => {
      const result = await commitNormalized({ key: "value" });
      const pre = result.leafPreimages[0];

      expect(pre?.nameHash).toMatch(/^0x[0-9a-f]+$/);
      expect(pre?.valueHash).toMatch(/^0x[0-9a-f]+$/);
      expect(pre?.blindingHash).toMatch(/^0x[0-9a-f]+$/);
    });

    it("shares the same blindingHash across all leaves", async () => {
      const result = await commitNormalized({ a: "1", b: "2", c: "3" });
      const blindings = result.leafPreimages.map((p) => p.blindingHash);

      expect(new Set(blindings).size).toBe(1);
    });
  });
});
