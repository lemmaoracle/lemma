import { describe, it, expect, vi } from "vitest";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/spec";
import { getById, register } from "./circuits.js";

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

const circuit: CircuitMeta = {
  circuitId: "test-circuit",
  schema: "test-schema",
};

describe("circuits.register", () => {
  it("posts the circuit payload to /v1/circuits with the api key header", async () => {
    const client = makeClient(jsonResponse(circuit));

    const out = await register(client, circuit);

    expect(out).toEqual(circuit);
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/circuits",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(circuit),
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-api-key": "test-key",
        }),
      }),
    );
  });
});

describe("circuits.getById", () => {
  it("encodes the circuitId in the path", async () => {
    const client = makeClient(jsonResponse(circuit));
    const circuitId = "circuit/1 x";

    const out = await getById(client, circuitId);

    expect(out).toEqual(circuit);
    expect(client.fetcher).toHaveBeenCalledWith(
      `https://workers.lemma.test/v1/circuits/${encodeURIComponent(circuitId)}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
