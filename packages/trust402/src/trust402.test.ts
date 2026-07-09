import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  publish,
  detectContentType,
  blogArticle,
  contentCommitment,
  computeCid,
} from "./trust402.js";
import type { PublishInput, Article } from "./trust402.js";
import { create, toScalar } from "@lemmaoracle/sdk";
import { poseidon5 } from "poseidon-lite";

// ---------------------------------------------------------------------------
// detectContentType
// ---------------------------------------------------------------------------

describe("detectContentType", () => {
  it("detects image from MIME prefix", () => {
    expect(detectContentType({ type: "image/png", name: "photo.png" })).toBe(
      "image",
    );
    expect(detectContentType({ type: "image/jpeg", name: "img.jpg" })).toBe(
      "image",
    );
  });

  it("maps video MIME to other", () => {
    expect(detectContentType({ type: "video/mp4", name: "vid.mp4" })).toBe(
      "other",
    );
  });

  it("maps CSV MIME to dataset", () => {
    expect(
      detectContentType({ type: "text/csv", name: "data.csv" }),
    ).toBe("dataset");
  });

  it("detects code from JSON MIME", () => {
    expect(
      detectContentType({
        type: "application/json",
        name: "config.json",
      }),
    ).toBe("code");
  });

  it("maps markdown to document", () => {
    expect(
      detectContentType({
        type: "text/markdown",
        name: "readme.md",
      }),
    ).toBe("document");
  });

  it("falls back to extension detection when MIME is unknown", () => {
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "data.csv",
      }),
    ).toBe("dataset");
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "script.py",
      }),
    ).toBe("code");
  });

  it("returns other for unknown types", () => {
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "file.xyz",
      }),
    ).toBe("other");
  });
});

// ---------------------------------------------------------------------------
// Witness builders
// ---------------------------------------------------------------------------

describe("blogArticle", () => {
  const payload: Article = Object.freeze({
    author: "did:ethr:0xabc123",
    body: "Zero-knowledge proofs enable privacy-preserving verification.",
    published: 1714069800,
    words: 8,
    lang: "en",
  });

  it("returns witness with commitment field", () => {
    const result = blogArticle(payload);
    expect(result.witness).toHaveProperty("authorHash");
    expect(result.witness).toHaveProperty("published");
    expect(result.witness).toHaveProperty("integrityHash");
    expect(result.witness).toHaveProperty("words");
    expect(result.witness).toHaveProperty("langCode");
    expect(result.witness).toHaveProperty("commitment");
    expect(result.commitment).toBe(result.witness.commitment);
  });

  it("computes commitment as Poseidon5 of witness fields", () => {
    const result = blogArticle(payload);
    const authorHash = toScalar(payload.author);
    const published = BigInt(payload.published);
    const integrityHash = toScalar(payload.body);
    const words = BigInt(payload.words);
    const langCode = 1n; // "en"
    const expected = `0x${poseidon5([authorHash, published, integrityHash, words, langCode]).toString(16)}`;
    expect(result.commitment).toBe(expected);
  });

  it("is deterministic for same input", () => {
    expect(blogArticle(payload).commitment).toBe(
      blogArticle(payload).commitment,
    );
  });

  it("produces different commitments for different payloads", () => {
    const different = blogArticle({ ...payload, body: "Different." });
    expect(different.commitment).not.toBe(
      blogArticle(payload).commitment,
    );
  });

  it("maps unknown language to 0", () => {
    const result = blogArticle({ ...payload, lang: "xx" });
    expect(result.witness.langCode).toBe("0");
  });
});

describe("contentCommitment", () => {
  const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"

  it("returns witness with fileHash and commitment", () => {
    const result = contentCommitment(bytes);
    expect(result.witness).toHaveProperty("fileHash");
    expect(result.witness).toHaveProperty("commitment");
    expect(result.commitment).toBe(result.witness.commitment);
  });

  it("is deterministic for same input", () => {
    expect(contentCommitment(bytes).commitment).toBe(
      contentCommitment(bytes).commitment,
    );
  });

  it("produces different commitments for different content", () => {
    const different = new Uint8Array([0x57, 0x6f, 0x72, 0x6c, 0x64]); // "World"
    expect(contentCommitment(bytes).commitment).not.toBe(
      contentCommitment(different).commitment,
    );
  });
});

describe("computeCid", () => {
  it("returns sha256-prefixed hex CID", () => {
    const cid = computeCid(new Uint8Array([1, 2, 3]));
    expect(cid).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    expect(computeCid(new Uint8Array([1]))).toBe(computeCid(new Uint8Array([1])));
  });
});

// ---------------------------------------------------------------------------
// publish
// ---------------------------------------------------------------------------

describe("trust402.publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Mock client that returns circuit metadata with no artifacts. */
  const setupMocks = () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/v1/circuits/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              circuitId: url.split("/v1/circuits/")[1],
              schema: "test-schema",
            }),
        });
      }
      if (url.includes("/v1/proofs")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "received",
              verificationId: "verif-001",
            }),
        });
      }
      if (url.includes("/v1/documents")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "registered",
              docHash: "mock-doc-hash",
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const c = create({ apiBase: "http://localhost:8787" });
    (c as Record<string, unknown>).fetcher = mockFetch;
    return c;
  };

  // ── Blog article via witness builder ───────────────────────────────

  describe("blog-article circuit", () => {
    const payload: Article = Object.freeze({
      author: "did:ethr:0xabc123",
      body: "Zero-knowledge proofs enable privacy-preserving verification on decentralized networks.",
      published: 1714069800,
      words: 13,
      lang: "en",
    });

    const makeInput = (): PublishInput => {
      const { witness, commitment } = blogArticle(payload);
      return Object.freeze({
        circuitId: "blog-article-v1.2",
        witness,
        commitment,
        price: Object.freeze({ amount: 42000000, currency: "USDC" as const }),
        did: "did:ethr:0xabc123",
        metadata: Object.freeze({ title: "My Blog Post", version: "1.0.0" }),
      });
    };

    it("publishes a blog-article listing successfully", async () => {
      const client = setupMocks();
      const listing = await publish(client, makeInput());

      expect(listing).toHaveProperty("listingRoot");
      expect(listing).toHaveProperty("commitment");
      expect(listing).toHaveProperty("perSchemaProof");
      expect(listing.schemaId).toBe("blog-article-v1.2");
      expect(listing.did).toBe("did:ethr:0xabc123");
      expect(listing.perSchemaProof!.circuitId).toBe("blog-article-v1.2");
      expect(listing.perSchemaProof!.inputs.length).toBeGreaterThan(0);
      expect(listing.metadata).toEqual({ title: "My Blog Post", version: "1.0.0" });
      expect(listing.cid).toBeUndefined();
    });

    it("computes deterministic commitment from same witness", async () => {
      const client = setupMocks();
      const listing1 = await publish(client, makeInput());
      const listing2 = await publish(client, makeInput());
      expect(listing1.commitment).toBe(listing2.commitment);
    });

    it("generates unique listingRoots per call (random salt)", async () => {
      const client = setupMocks();
      const listing1 = await publish(client, makeInput());
      const listing2 = await publish(client, makeInput());
      expect(listing1.commitment).toBe(listing2.commitment);
      expect(listing1.listingRoot).not.toBe(listing2.listingRoot);
    });

    it("verifies commitment matches Poseidon5 of witness fields", async () => {
      const client = setupMocks();
      const listing = await publish(client, makeInput());

      const authorHash = toScalar(payload.author);
      const published = BigInt(payload.published);
      const integrityHash = toScalar(payload.body);
      const words = BigInt(payload.words);
      const langCode = 1n;
      const expected = `0x${poseidon5([authorHash, published, integrityHash, words, langCode]).toString(16)}`;
      expect(listing.commitment).toBe(expected);
    });
  });

  // ── Content commitment via witness builder ──────────────────────────

  describe("content-commitment circuit", () => {
    const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);

    const makeInput = (): PublishInput => {
      const { witness, commitment } = contentCommitment(bytes);
      return Object.freeze({
        circuitId: "content-commitment-v1.2",
        witness,
        commitment,
        cid: computeCid(bytes),
        price: Object.freeze({ amount: 10000000, currency: "USDC" as const }),
        did: "did:ethr:0xdef456",
      });
    };

    it("publishes a content-commitment listing with CID", async () => {
      const client = setupMocks();
      const listing = await publish(client, makeInput());

      expect(listing.schemaId).toBe("content-commitment-v1.2");
      expect(listing.perSchemaProof!.circuitId).toBe("content-commitment-v1.2");
      expect(listing.cid).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("computes deterministic CID and commitment", async () => {
      const client = setupMocks();
      const listing1 = await publish(client, makeInput());
      const listing2 = await publish(client, makeInput());
      expect(listing1.cid).toBe(listing2.cid);
      expect(listing1.commitment).toBe(listing2.commitment);
    });

    it("passes environment as a query parameter on the proof submission URL", async () => {
      const client = setupMocks();
      const listing = await publish(
        client,
        Object.freeze({ ...makeInput(), environment: "production" as const }),
      );

      const mockFetch = client.fetcher as ReturnType<typeof vi.fn>;
      const proofCall = mockFetch.mock.calls.find(
        (call) =>
          String(call[0]).includes("/v1/proofs") &&
          (call[1] as RequestInit | undefined)?.method === "POST",
      );
      expect(proofCall).toBeDefined();
      expect(String(proofCall![0])).toContain("/v1/proofs?environment=production");
      const body = JSON.parse((proofCall![1] as RequestInit).body as string);
      expect(body.environment).toBeUndefined();
      expect(listing.environment).toBe("production");
    });

    it("omits the environment query parameter when not set", async () => {
      const client = setupMocks();
      const listing = await publish(client, makeInput());

      const mockFetch = client.fetcher as ReturnType<typeof vi.fn>;
      const proofCall = mockFetch.mock.calls.find(
        (call) =>
          String(call[0]).includes("/v1/proofs") &&
          (call[1] as RequestInit | undefined)?.method === "POST",
      );
      expect(proofCall).toBeDefined();
      expect(String(proofCall![0])).not.toContain("environment=");
      const body = JSON.parse((proofCall![1] as RequestInit).body as string);
      expect(body.environment).toBeUndefined();
      expect(listing.environment).toBeUndefined();
    });
  });

  // ── Custom circuit (any circuitId) ──────────────────────────────────

  describe("custom circuit", () => {
    it("accepts arbitrary circuitId and witness", async () => {
      const client = setupMocks();

      const input: PublishInput = Object.freeze({
        circuitId: "blog-article-v1",
        witness: Object.freeze({
          foo: "0x1",
          bar: "42",
          commitment: "0xabc",
        }),
        commitment: "0xabc",
        price: Object.freeze({ amount: 5000, currency: "USDC" as const }),
        did: "did:pkh:eip155:8453:0xdead",
      });

      const listing = await publish(client, input);
      expect(listing.schemaId).toBe("blog-article-v1");
      expect(listing.commitment).toBe("0xabc");
      expect(listing.perSchemaProof!.circuitId).toBe("blog-article-v1");
    });
  });

  // ── Error handling ──────────────────────────────────────────────────

  describe("error handling", () => {
    it("throws when prover.prove fails", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const client = create({ apiBase: "http://localhost:8787" });
      (client as Record<string, unknown>).fetcher = mockFetch;

      const input: PublishInput = Object.freeze({
        circuitId: "content-commitment-v1.2",
        witness: Object.freeze({ fileHash: "0x1", commitment: "0x2" }),
        commitment: "0x2",
        price: Object.freeze({ amount: 100, currency: "USDC" as const }),
        did: "did:ethr:0xerr",
      });

      await expect(publish(client, input)).rejects.toThrow();
    });
  });
});
