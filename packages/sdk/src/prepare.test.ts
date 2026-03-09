import { describe, it, expect, vi, beforeEach } from "vitest";
import { create } from "./client";
import { define, getSchemaById } from "./schema";
import { prepare } from "./prepare";

type Raw = { age: number; country: string };
type Norm = { age_bucket: string; country: string };

// Mock the schema registry directly for this test
vi.mock("./schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./schema")>();
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
    expect(result.commitments.attrCommitmentRoot).toMatch(/^0x/);
    expect(result.commitments.randomness).toMatch(/^0x/);
    expect(result.commitments.scheme).toBe("poseidon");
    // Type assertion for the commitments
    const commitments = result.commitments as { perAttributeCommitments: ReadonlyArray<string> };
    expect(commitments.perAttributeCommitments).toBeInstanceOf(Array);
    expect(commitments.perAttributeCommitments).toHaveLength(2); // age_bucket, country
    expect(commitments.perAttributeCommitments[0]).toMatch(/^0x/);
    expect(commitments.perAttributeCommitments[1]).toMatch(/^0x/);
  });

  it("rejects for unknown schema", async () => {
    await expect(prepare(client, { schema: "nonexistent", payload: {} })).rejects.toThrow(
      "Unknown schemaId",
    );
  });
});
