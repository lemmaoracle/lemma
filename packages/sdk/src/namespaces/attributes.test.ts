import { describe, it, expect, vi } from "vitest";
import type { LemmaClient, VerifiedAttributesQueryRequest } from "@lemmaoracle/spec";
import { query } from "./attributes.js";

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

const payload: VerifiedAttributesQueryRequest = {
  attributes: [{ name: "country", operator: "eq", value: "US" }],
};

const response = {
  results: [{ attributes: { country: "US" } }],
  hasMore: false,
};

describe("attributes.query", () => {
  it("posts the query payload to /v1/verified-attributes/query with the api key header", async () => {
    const client = makeClient(jsonResponse(response));

    const out = await query(client, payload);

    expect(out).toEqual(response);
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/verified-attributes/query",
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
