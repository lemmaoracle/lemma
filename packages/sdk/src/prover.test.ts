import { describe, it, expect } from "vitest";
import { create } from "./client";
import { prove } from "./prover";

describe("prover.prove", () => {
  const client = create({ apiBase: "http://localhost:8787" });

  it("generates proof bytes and extracts publicInputs", async () => {
    const result = await prove(client, {
      circuitId: "age-over-18",
      witness: {
        age_bucket: "adult",
        randomness: "0xrand",
        attr_commitment_root: "0xroot123",
      },
    });

    expect(result.proofBytes).toBeTruthy();
    expect(result.publicInputs).toContain("0xroot123");
  });

  it("returns empty publicInputs when no attr_commitment_root", async () => {
    const result = await prove(client, {
      circuitId: "custom-circuit",
      witness: { some_field: "value" },
    });
    expect(result.publicInputs).toEqual([]);
  });
});
