import { describe, expect, it } from "vitest";
import type { LemmaClient } from "@lemmaoracle/spec";
import { getProofStatus } from "./get-proof-status.js";

const makeClient = (response: Response): LemmaClient => ({
  apiBase: "https://workers.lemma.test",
  apiKey: "k",
  fetcher: async () => response,
});

const record = {
  verificationId: "vrf_1",
  docHash: "0xabc",
  circuitId: "account-change-v1",
  proof: "secret",
  inputs: ["1", "2"],
  status: "verified",
  registeredAt: "2026-01-01T00:00:00Z",
};

describe("getProofStatus", () => {
  it("returns proof status from the verificationId endpoint", async () => {
    const client = makeClient(new Response(JSON.stringify(record), { status: 200 }));
    const out = await getProofStatus(client, { verificationId: "vrf_1" });
    expect(out).toEqual({
      verificationId: "vrf_1",
      status: "verified",
      circuitId: "account-change-v1",
      docHash: "0xabc",
      registeredAt: "2026-01-01T00:00:00Z",
    });
  });

  it("returns undefined when the verificationId is unknown", async () => {
    const client = makeClient(
      new Response(JSON.stringify({ error: "Proof not found" }), { status: 404 }),
    );
    const out = await getProofStatus(client, { verificationId: "nope" });
    expect(out).toBeUndefined();
  });

  it("omits proof and inputs even when the response carries them", async () => {
    const client = makeClient(new Response(JSON.stringify(record), { status: 200 }));
    const out = await getProofStatus(client, { verificationId: "vrf_1" });
    expect(out).not.toHaveProperty("proof");
    expect(out).not.toHaveProperty("inputs");
  });
});
