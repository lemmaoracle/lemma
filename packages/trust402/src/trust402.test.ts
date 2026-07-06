import { describe, it, expect, vi, beforeEach } from "vitest";
import { publish, detectContentType } from "./trust402.js";
import type {
  Trust402PublishInput,
  BlogArticlePayload,
} from "./trust402.js";
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

  it("detects video from MIME prefix", () => {
    expect(detectContentType({ type: "video/mp4", name: "vid.mp4" })).toBe(
      "video",
    );
  });

  it("detects CSV from exact MIME match", () => {
    expect(
      detectContentType({ type: "text/csv", name: "data.csv" }),
    ).toBe("csv");
  });

  it("detects code from JSON MIME", () => {
    expect(
      detectContentType({
        type: "application/json",
        name: "config.json",
      }),
    ).toBe("code");
  });

  it("detects code from markdown", () => {
    expect(
      detectContentType({
        type: "text/markdown",
        name: "readme.md",
      }),
    ).toBe("code");
  });

  it("falls back to extension detection when MIME is unknown", () => {
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "data.csv",
      }),
    ).toBe("csv");
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "script.py",
      }),
    ).toBe("code");
  });

  it("returns generic for unknown types", () => {
    expect(
      detectContentType({
        type: "application/octet-stream",
        name: "file.xyz",
      }),
    ).toBe("generic");
  });
});

// ---------------------------------------------------------------------------
// Witness builders (tested via publish with mocked prover / proofs)
// ---------------------------------------------------------------------------

describe("trust402.publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Helpers ──────────────────────────────────────────────────────────

  /** Build a mock fetch that returns circuit metadata with no artifacts
   *  (triggering fallback SHA-256 proving path). */
  const setupNoArtifactMocks = () => {
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

  // ── Blog Article tests ──────────────────────────────────────────────

  describe("blog-article content", () => {
    const blogPayload: BlogArticlePayload = Object.freeze({
      author: "did:ethr:0xabc123",
      body: "Zero-knowledge proofs enable privacy-preserving verification on decentralized networks.",
      published: 1714069800,
      words: 13,
      lang: "en",
    });

    const blogInput: Trust402PublishInput = Object.freeze({
      content: Object.freeze({
        type: "blog-article",
        payload: blogPayload,
      } as const),
      price: Object.freeze({ amount: 42000000, currency: "USDC" as const }),
      did: "did:ethr:0xabc123",
      metadata: Object.freeze({ title: "My Blog Post", version: "1.0.0" }),
    });

    it("publishes a blog-article listing successfully", async () => {
      const client = setupNoArtifactMocks();

      const listing = await publish(client, blogInput);

      // Shape
      expect(listing).toHaveProperty("listingRoot");
      expect(listing).toHaveProperty("commitment");
      expect(listing).toHaveProperty("perSchemaProof");
      expect(listing).toHaveProperty("did");
      expect(listing.did).toBe(blogInput.did);
      expect(listing.schemaId).toBe("blog-article-v1.2");
      expect(listing.price).toEqual(blogInput.price);
      expect(listing.cid).toBeUndefined(); // blog-article doesn't need CID

      // perSchemaProof
      expect(listing.perSchemaProof!.circuitId).toBe("blog-article-v1.2");
      expect(listing.perSchemaProof!.inputs.length).toBeGreaterThan(0);

      // Metadata preserved
      expect(listing.metadata).toEqual(blogInput.metadata);

      // createdAt is a recent timestamp
      expect(listing.createdAt).toBeGreaterThan(0);
      expect(listing.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it("computes a deterministic commitment from blog article payload", async () => {
      const client = setupNoArtifactMocks();

      const listing1 = await publish(client, blogInput);
      const listing2 = await publish(client, blogInput);

      // Same input → same commitment
      expect(listing1.commitment).toBe(listing2.commitment);
    });

    it("produces different commitments for different payloads", async () => {
      const client = setupNoArtifactMocks();

      const listing1 = await publish(client, blogInput);

      const differentPayload: BlogArticlePayload = Object.freeze({
        ...blogPayload,
        body: "A completely different article body.",
      });
      const differentInput: Trust402PublishInput = Object.freeze({
        ...blogInput,
        content: Object.freeze({
          type: "blog-article",
          payload: differentPayload,
        } as const),
      });

      const listing2 = await publish(client, differentInput);
      expect(listing1.commitment).not.toBe(listing2.commitment);
    });

    it("verifies the commitment matches Poseidon5 of witness fields", async () => {
      const client = setupNoArtifactMocks();

      const listing = await publish(client, blogInput);

      // Recompute commitment from payload
      const authorHash = toScalar(blogPayload.author);
      const published = BigInt(blogPayload.published);
      const integrityHash = toScalar(blogPayload.body);
      const words = BigInt(blogPayload.words);
      const langMap: Record<string, bigint> = { en: 1n };
      const langCode = langMap[blogPayload.lang] ?? 0n;

      const expectedCommitment = `0x${poseidon5([authorHash, published, integrityHash, words, langCode]).toString(16)}`;

      expect(listing.commitment).toBe(expectedCommitment);
    });

    it("generates unique listingRoots per call (random salt)", async () => {
      const client = setupNoArtifactMocks();

      const listing1 = await publish(client, blogInput);
      const listing2 = await publish(client, blogInput);

      // Same input → different listingRoots (random salt per call)
      expect(listing1.commitment).toBe(listing2.commitment);
      expect(listing1.listingRoot).not.toBe(listing2.listingRoot);
    });
  });

  // ── Content Commitment tests (generic bytes) ────────────────────────

  describe("content-commitment (generic) content", () => {
    const fileBytes = new Uint8Array([
      0x48, 0x65, 0x6c, 0x6c, 0x6f, // "Hello"
    ]);

    const genericInput: Trust402PublishInput = Object.freeze({
      content: Object.freeze({
        type: "generic",
        mimeType: "text/plain",
        payload: fileBytes,
      } as const),
      price: Object.freeze({ amount: 10000000, currency: "USDC" as const }),
      did: "did:ethr:0xdef456",
    });

    it("publishes a generic content listing successfully", async () => {
      const client = setupNoArtifactMocks();

      const listing = await publish(client, genericInput);

      expect(listing.schemaId).toBe("content-commitment-v1.2");
      expect(listing.perSchemaProof!.circuitId).toBe("content-commitment-v1.2");

      // CID should be present for content-commitment
      expect(listing.cid).toBeDefined();
      expect(listing.cid).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("computes deterministic CID", async () => {
      const client = setupNoArtifactMocks();

      const listing1 = await publish(client, genericInput);
      const listing2 = await publish(client, genericInput);

      expect(listing1.cid).toBe(listing2.cid);
      expect(listing1.commitment).toBe(listing2.commitment);
    });

    it("produces different CIDs for different content", async () => {
      const client = setupNoArtifactMocks();

      const listing1 = await publish(client, genericInput);

      const differentInput: Trust402PublishInput = Object.freeze({
        ...genericInput,
        content: Object.freeze({
          type: "generic",
          mimeType: "text/plain",
          payload: new Uint8Array([0x57, 0x6f, 0x72, 0x6c, 0x64]), // "World"
        } as const),
      });

      const listing2 = await publish(client, differentInput);
      expect(listing1.cid).not.toBe(listing2.cid);
      expect(listing1.commitment).not.toBe(listing2.commitment);
    });

    it("verifies commitment matches Poseidon1 of fileHash", async () => {
      const client = setupNoArtifactMocks();

      const listing = await publish(client, genericInput);

      // Recompute via inlined normalizer logic
      const { poseidon1, poseidon2 } = await import("poseidon-lite");

      const BN254_PRIME = BigInt(
        "21888242871839275222246405745257275088548364400416034343698204186575808495617",
      );
      const CHUNK_SIZE = 31;

      const bytesToFieldElements = (data: Uint8Array): bigint[] => {
        const len = data.length;
        const padLen = CHUNK_SIZE - (len % CHUNK_SIZE);
        const paddedLen = len + padLen;
        const padded = new Uint8Array(paddedLen);
        padded.set(data);
        for (let i = len; i < paddedLen; i++) padded[i] = padLen;
        const numChunks = paddedLen / CHUNK_SIZE;
        const elements: bigint[] = new Array(numChunks);
        for (let i = 0; i < numChunks; i++) {
          const offset = i * CHUNK_SIZE;
          let val = 0n;
          for (let j = 0; j < CHUNK_SIZE; j++) {
            val = (val << 8n) | BigInt(padded[offset + j] ?? 0);
          }
          elements[i] = val;
        }
        return elements;
      };

      const reduceElements = (
        elements: readonly bigint[],
        fn: (inputs: [bigint, bigint]) => bigint,
      ): bigint => {
        if (elements.length === 0) return 0n;
        let acc = elements[0] ?? 0n;
        for (let i = 1; i < elements.length; i++) {
          acc = fn([acc, elements[i] ?? 0n]);
        }
        return acc;
      };

      const elements = bytesToFieldElements(fileBytes);
      const fileHash = reduceElements(elements, (inputs: [bigint, bigint]) =>
        poseidon2(inputs),
      );
      const expectedCommitment = `0x${poseidon1([fileHash]).toString(16)}`;

      expect(listing.commitment).toBe(expectedCommitment);
    });
  });

  // ── File type (same as generic, just different input shape) ─────────

  describe("file content", () => {
    it("publishes a file listing with CID", async () => {
      const client = setupNoArtifactMocks();

      const fileBytes = new Uint8Array([1, 2, 3, 4, 5]);
      const fileInput: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "file",
          name: "test.bin",
          bytes: fileBytes,
          mimeType: "application/octet-stream",
        } as const),
        price: Object.freeze({ amount: 5000000, currency: "USDC" as const }),
        did: "did:ethr:0xfile001",
      });

      const listing = await publish(client, fileInput);

      expect(listing.schemaId).toBe("content-commitment-v1.2");
      expect(listing.cid).toBeDefined();
      expect(listing.cid).toMatch(/^sha256:[0-9a-f]{64}$/);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────

  describe("error handling", () => {
    it("throws when circuit metadata fetch fails", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const client = create({ apiBase: "http://localhost:8787" });
      (client as Record<string, unknown>).fetcher = mockFetch;

      const input: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "generic",
          mimeType: "text/plain",
          payload: new Uint8Array([1]),
        } as const),
        price: Object.freeze({ amount: 100, currency: "USDC" as const }),
        did: "did:ethr:0xerr",
      });

      await expect(publish(client, input)).rejects.toThrow();
    });
  });

  // ── Commitment override ─────────────────────────────────────────────

  describe("external commitment", () => {
    it("skips per-schema proof when commitment is provided", async () => {
      const client = setupNoArtifactMocks();

      const input: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "generic",
          mimeType: "application/octet-stream",
          payload: new Uint8Array([1, 2, 3]),
        } as const),
        price: Object.freeze({ amount: 500, currency: "USDC" as const }),
        did: "did:ethr:0xext",
        commitment: "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      });

      const listing = await publish(client, input);

      expect(listing.schemaId).toBe("external");
      expect(listing.commitment).toBe(
        "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      );
      expect(listing.perSchemaProof).toBeNull();
      expect(listing.listingRoot).toBeDefined();
    });

    it("still computes CID when commitment is external", async () => {
      const client = setupNoArtifactMocks();

      const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
      const input: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "generic",
          mimeType: "text/plain",
          payload: bytes,
        } as const),
        price: Object.freeze({ amount: 100, currency: "USDC" as const }),
        did: "did:ethr:0xextcid",
        commitment: "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      });

      const listing = await publish(client, input);

      expect(listing.cid).toBeDefined();
      expect(listing.cid).toMatch(/^sha256:[0-9a-f]{64}$/);
    });

    it("does NOT call circuits or proofs endpoints for per-schema", async () => {
      const calls: string[] = [];
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        calls.push(url);
        if (url.includes("/v1/circuits/")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ circuitId: url.split("/v1/circuits/")[1], schema: "test" }),
          });
        }
        if (url.includes("/v1/proofs")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: "received", verificationId: "v" }),
          });
        }
        if (url.includes("/v1/documents")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: "registered", docHash: "mock" }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const client = create({ apiBase: "http://localhost:8787" });
      (client as Record<string, unknown>).fetcher = mockFetch;

      const input: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "generic",
          mimeType: "text/plain",
          payload: new Uint8Array([1]),
        } as const),
        price: Object.freeze({ amount: 100, currency: "USDC" as const }),
        did: "did:ethr:0xnocall",
        commitment: "0xdeadbeef00000000000000000000000000000000000000000000000000000000",
      });

      await publish(client, input);

      // Should not hit circuits/proofs endpoints (no proofs issued for external commitment)
      const proofCalls = calls.filter((u) => u.includes("/v1/proofs"));
      expect(proofCalls.length).toBe(0);
    });

    it("commitment override works with file type too", async () => {
      const client = setupNoArtifactMocks();

      const input: Trust402PublishInput = Object.freeze({
        content: Object.freeze({
          type: "file",
          name: "secret.bin",
          bytes: new Uint8Array([7, 8, 9]),
          mimeType: "application/octet-stream",
        } as const),
        price: Object.freeze({ amount: 1000, currency: "USDC" as const }),
        did: "did:ethr:0xfileext",
        commitment: "0xcafebabe00000000000000000000000000000000000000000000000000000000",
      });

      const listing = await publish(client, input);

      expect(listing.schemaId).toBe("external");
      expect(listing.perSchemaProof).toBeNull();
      expect(listing.cid).toBeDefined();
    });
  });
});
