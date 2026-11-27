import { describe, it, expect, vi } from "vitest";
import type { LemmaClient, GeneratorMeta } from "@lemmaoracle/spec";
import { getById, register } from "./generators.js";

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

const generator: GeneratorMeta = {
  generatorId: "test-generator",
  schema: "test-schema",
};

describe("generators.register", () => {
  it("posts the generator payload to /v1/doc-generators with the api key header", async () => {
    // Trap: the generators route is /v1/doc-generators, NOT /v1/generators.
    const client = makeClient(jsonResponse(generator));

    const out = await register(client, generator);

    expect(out).toEqual(generator);
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/doc-generators",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(generator),
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-api-key": "test-key",
        }),
      }),
    );
  });
});

describe("generators.getById", () => {
  it("encodes the generatorId in the path", async () => {
    const client = makeClient(jsonResponse(generator));
    const generatorId = "generator/1 x";

    const out = await getById(client, generatorId);

    expect(out).toEqual(generator);
    expect(client.fetcher).toHaveBeenCalledWith(
      `https://workers.lemma.test/v1/doc-generators/${encodeURIComponent(generatorId)}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});
