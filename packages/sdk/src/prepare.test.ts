import { describe, it, expect, vi, beforeEach } from "vitest";
import { create } from "./client.js";
import { define, getSchemaById } from "./schema.js";
import { prepare, normalize } from "./prepare.js";

type Raw = { age: number; country: string };
type Norm = { age_bucket: string; country: string };

// Mock the schema registry directly for this test
vi.mock("./schema.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./schema.js")>();
  return {
    ...actual,
    // Override getSchemaById to return a mock schema for testing
    getSchemaById: vi.fn(),
  };
});

describe("prepare", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getSchemaById to return a schema for the test
    (getSchemaById as any).mockImplementation((schemaId: string) => {
      if (schemaId === "test:prepare-kyc") {
        return {
          id: "test:prepare-kyc",
          normalize: (raw: Raw) => ({
            age_bucket: raw.age >= 18 ? "adult" : "minor",
            country: raw.country,
          }),
        };
      }
      return undefined;
    });
  });

  it("normalizes and produces commitments", async () => {
    const result = await prepare<Raw, Norm>(client, {
      schema: "test:prepare-kyc",
      payload: { age: 25, country: "JP" },
    });

    expect(result.normalized).toEqual({ age_bucket: "adult", country: "JP" });
    expect(result.commitments.root).toMatch(/^0x/);
    expect(result.commitments.randomness).toMatch(/^0x/);
    expect(result.commitments.scheme).toBe("poseidon");
    // Type assertion for the commitments
    const commitments = result.commitments as { leaves: ReadonlyArray<string> };
    expect(commitments.leaves).toBeInstanceOf(Array);
    expect(commitments.leaves).toHaveLength(2); // age_bucket, country
    expect(commitments.leaves[0]).toMatch(/^0x/);
    expect(commitments.leaves[1]).toMatch(/^0x/);
  });

  it("rejects for unknown schema", async () => {
    await expect(prepare(client, { schema: "nonexistent", payload: {} })).rejects.toThrow(
      "Unknown schemaId",
    );
  });

  it("returns inclusionProofs aligned with leaves", async () => {
    const result = await prepare<Raw, Norm>(client, {
      schema: "test:prepare-kyc",
      payload: { age: 25, country: "JP" },
    });

    // 2 attributes → 2 leaves → 2 proofs
    expect(result.inclusionProofs).toHaveLength(2);
    // depth = ceil(log2(2)) = 1
    expect(result.depth).toBe(1);
    result.inclusionProofs.forEach((proof) => {
      expect(proof.siblings).toHaveLength(result.depth);
      expect(proof.indices).toHaveLength(result.depth);
    });
  });

  it("returns leafPreimages with correct attribute names", async () => {
    const result = await prepare<Raw, Norm>(client, {
      schema: "test:prepare-kyc",
      payload: { age: 25, country: "JP" },
    });

    expect(result.leafPreimages).toHaveLength(2);
    // Sorted: age_bucket < country
    expect(result.leafPreimages[0]?.name).toBe("age_bucket");
    expect(result.leafPreimages[0]?.value).toBe("adult");
    expect(result.leafPreimages[1]?.name).toBe("country");
    expect(result.leafPreimages[1]?.value).toBe("JP");
  });
});

describe("normalize", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  beforeEach(() => {
    vi.clearAllMocks();

    (getSchemaById as any).mockImplementation((schemaId: string) => {
      if (schemaId === "test:prepare-kyc") {
        return {
          id: "test:prepare-kyc",
          normalize: (raw: Raw) => ({
            age_bucket: raw.age >= 18 ? "adult" : "minor",
            country: raw.country,
          }),
        };
      }
      return undefined;
    });
  });

  it("returns normalized data without commitment fields", async () => {
    const result = await normalize<Raw, Norm>(client, {
      schema: "test:prepare-kyc",
      payload: { age: 25, country: "JP" },
    });

    expect(result).toEqual({ age_bucket: "adult", country: "JP" });
    // Should NOT have commitment-related fields
    expect((result as Record<string, unknown>).commitments).toBeUndefined();
    expect((result as Record<string, unknown>).depth).toBeUndefined();
    expect((result as Record<string, unknown>).inclusionProofs).toBeUndefined();
  });

  it("rejects for unknown schema", async () => {
    await expect(normalize(client, { schema: "nonexistent", payload: {} })).rejects.toThrow(
      "Unknown schemaId",
    );
  });

  it("produces same normalized data as prepare", async () => {
    const input = { schema: "test:prepare-kyc", payload: { age: 25, country: "JP" } } as const;

    const normalizedOnly = await normalize<Raw, Norm>(client, input);
    const prepared = await prepare<Raw, Norm>(client, input);

    expect(prepared.normalized).toEqual(normalizedOnly);
  });
});
