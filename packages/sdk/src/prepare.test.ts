import { describe, it, expect } from "vitest";
import { create } from "./client";
import { define } from "./schema";
import { prepare } from "./prepare";

type Raw = { age: number; country: string };
type Norm = { age_bucket: string; country: string };

describe("prepare", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  define<Raw, Norm>({
    id: "test:prepare-kyc",
    normalize: (raw) => ({
      age_bucket: raw.age >= 18 ? "adult" : "minor",
      country: raw.country,
    }),
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
  });

  it("rejects for unknown schema", async () => {
    await expect(prepare(client, { schema: "nonexistent", payload: {} })).rejects.toThrow(
      "Unknown schemaId",
    );
  });
});
