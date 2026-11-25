import { describe, it, expect, vi } from "vitest";
import type { LemmaClient } from "@lemmaoracle/spec";
import { getById, getByDocHash, submit } from "./proofs.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const makeClient = (response: Response): LemmaClient => ({
  apiBase: "https://workers.lemma.test",
  apiKey: "test-key",
  fetcher: vi.fn(async () => response) as unknown as typeof fetch,
});

const record = {
  verificationId: "vrf_1",
  docHash: "0x" + "a".repeat(64),
  circuitId: "content-commitment-v1.2",
  status: "verified",
  registeredAt: "2026-01-01T00:00:00Z",
} as const;

describe("proofs.submit", () => {
  it("posts the proof payload to /v1/proofs with the api key header", async () => {
    const client = makeClient(jsonResponse({ verificationId: "vrf_1", status: "received" }));
    const payload = {
      docHash: record.docHash,
      circuitId: record.circuitId,
      proof: "0xproof",
      inputs: ["1", "2"],
    };

    const out = await submit(client, payload);

    expect(out).toEqual({ verificationId: "vrf_1", status: "received" });
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/proofs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-api-key": "test-key",
        }),
      }),
    );
  });
});

describe("proofs.getById", () => {
  it("encodes the verificationId in the path", async () => {
    const client = makeClient(jsonResponse(record));
    const verificationId = "vrf/1 x";

    const out = await getById(client, verificationId);

    expect(out).toEqual(record);
    expect(client.fetcher).toHaveBeenCalledWith(
      `https://workers.lemma.test/v1/proofs/${encodeURIComponent(verificationId)}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("proofs.getByDocHash", () => {
  it("encodes the docHash as a query parameter", async () => {
    const client = makeClient(jsonResponse(record));

    const out = await getByDocHash(client, record.docHash);

    expect(out).toEqual(record);
    expect(client.fetcher).toHaveBeenCalledWith(
      `https://workers.lemma.test/v1/proofs?docHash=${encodeURIComponent(record.docHash)}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
