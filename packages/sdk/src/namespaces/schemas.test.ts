import { describe, it, expect, vi } from "vitest";
import type { Mock } from "vitest";
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/spec";
import { getById, register } from "./schemas.js";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const makeClient = (response: Response, withKey = true): LemmaClient => ({
  apiBase: "https://workers.lemma.test",
  ...(withKey ? { apiKey: "test-key" } : {}),
  fetcher: vi.fn(async () => response) as unknown as typeof fetch,
});

const schema: SchemaMeta = {
  id: "test-schema",
  normalize: {
    artifact: { type: "ipfs", wasm: "ipfs://QmWasm", js: "ipfs://QmJs" },
    hash: "0xhash",
  },
};

describe("schemas.register", () => {
  it("posts the schema payload to /v1/schemas with the api key header", async () => {
    const client = makeClient(jsonResponse(schema));

    const out = await register(client, schema);

    expect(out).toEqual(schema);
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/schemas",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(schema),
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-api-key": "test-key",
        }),
      }),
    );
  });

  it("omits the api key header when the client has no apiKey", async () => {
    const client = makeClient(jsonResponse(schema), false);

    await register(client, schema);

    const calls = (client.fetcher as unknown as Mock).mock.calls;
    const firstCall = calls[0];
    expect(firstCall).toBeDefined();
    const headers = (firstCall?.[1] as RequestInit).headers;
    expect(headers).toEqual({ "content-type": "application/json" });
    expect(headers).not.toHaveProperty("x-api-key");
  });
});

describe("schemas.getById", () => {
  it("encodes the schema id in the path", async () => {
    const client = makeClient(jsonResponse(schema));
    const id = "schema/1 x";

    const out = await getById(client, id);

    expect(out).toEqual(schema);
    expect(client.fetcher).toHaveBeenCalledWith(
      `https://workers.lemma.test/v1/schemas/${encodeURIComponent(id)}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
