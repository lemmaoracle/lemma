import { describe, it, expect } from "vitest";
import { SAMPLES } from "../data/fixtures";
import { verifyCustom, verifySample } from "./verify";

describe("verifySample", () => {
  for (const sample of SAMPLES) {
    it(`returns ${sample.expectedResult} for ${sample.id}`, async () => {
      const result = await verifySample(sample);
      expect(result.overall).toBe(sample.expectedResult);
      expect(result.checks.length).toBeGreaterThan(0);
      if (sample.expectedResult === "fail") {
        expect(result.failureReason).toBeTruthy();
      }
    });
  }

  it("marks the expected check as failed for output_hash_mismatch", async () => {
    const sample = SAMPLES.find(
      (s) => s.id === "financial_tampered_output",
    )!;
    const result = await verifySample(sample);
    const outputCheck = result.checks.find(
      (c) => c.id === "output_commitment",
    );
    expect(outputCheck?.status).toBe("fail");
  });

  it("marks the envelope as failed for model_hash_mismatch", async () => {
    const sample = SAMPLES.find(
      (s) => s.id === "manufacturing_model_swap",
    )!;
    const result = await verifySample(sample);
    expect(result.checks.find((c) => c.id === "envelope")?.status).toBe(
      "fail",
    );
  });

  it("marks replay_protection as failed for replay duplicate", async () => {
    const sample = SAMPLES.find((s) => s.id === "agent_replay_duplicate")!;
    const result = await verifySample(sample);
    expect(
      result.checks.find((c) => c.id === "replay_protection")?.status,
    ).toBe("fail");
  });
});

describe("verifyCustom", () => {
  it("rejects malformed JSON", async () => {
    const result = await verifyCustom("not json");
    expect(result.overall).toBe("fail");
    expect(result.failureReason).toMatch(/parse/i);
  });

  it("rejects when required fields are missing", async () => {
    const result = await verifyCustom(JSON.stringify({ proof_id: "x" }));
    expect(result.overall).toBe("fail");
    expect(result.failureReason).toMatch(/Missing required fields/);
  });

  it("passes a structurally complete bundle (mock)", async () => {
    const sample = SAMPLES[0]!;
    const result = await verifyCustom(JSON.stringify(sample.bundle));
    expect(result.overall).toBe("pass");
  });
});
