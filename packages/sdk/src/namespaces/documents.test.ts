import { describe, it, expect, vi } from "vitest";
import type {
  LemmaClient,
  RegisterDocumentRequest,
  RegisterDocumentResponse,
} from "@lemmaoracle/spec";
import { register } from "./documents.js";

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

const payload: RegisterDocumentRequest = {
  schema: "test-schema-v1",
  docHash: "0xdochash",
  cid: "0xdochash",
  issuerId: "test-issuer",
  subjectId: "test-subject",
  commitments: {
    scheme: "poseidon",
    root: "0xroot",
    leaves: ["0x11", "0x22"],
    randomness: "0xrand",
  },
  revocation: { scheme: "none", root: "0x" + "0".repeat(64) },
};

const response: RegisterDocumentResponse = {
  status: "registered",
  docHash: payload.docHash,
};

describe("documents.register", () => {
  it("posts the document payload to /v1/documents with the api key header", async () => {
    const client = makeClient(jsonResponse(response));

    const out = await register(client, payload);

    expect(out).toEqual(response);
    expect(client.fetcher).toHaveBeenCalledWith(
      "https://workers.lemma.test/v1/documents",
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
