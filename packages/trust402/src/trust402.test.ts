import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  publish,
  detectContentType,
  blogArticle,
  contentCommitment,
  listingBindingV2,
  orgIdentity,
  computeCid,
} from "./trust402.js";
import type { PublishInput, Article } from "./trust402.js";
import { create, toScalar } from "@lemmaoracle/sdk";
import { poseidon1, poseidon3, poseidon5 } from "poseidon-lite";
import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  bytesToHex,
  utf8ToBytes,
  concatBytes,
} from "@noble/hashes/utils";
import type { CommitmentSigner } from "./signing.js";

/** Local EIP-191 personal_sign mock — no wallet required. */
const createMockSigner = (): CommitmentSigner => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const pubUncompressed = secp256k1.getPublicKey(privateKey, false);
  const address =
    "0x" + bytesToHex(keccak_256(pubUncompressed.slice(1)).slice(-20));
  const provider = {
    request: async (args: {
      method: string;
      params?: readonly unknown[];
    }): Promise<unknown> => {
      if (args.method !== "personal_sign") {
        throw new Error(`Unexpected method: ${args.method}`);
      }
      const [messageHex] = args.params ?? [];
      if (typeof messageHex !== "string") {
        throw new Error("personal_sign requires a hex message");
      }
      const msgBytes = Uint8Array.from(
        (messageHex.startsWith("0x") ? messageHex.slice(2) : messageHex)
          .match(/.{1,2}/g)!
          .map((b) => parseInt(b, 16)),
      );
      const message = new TextDecoder().decode(msgBytes);
      const prefix = utf8ToBytes(
        `\x19Ethereum Signed Message:\n${msgBytes.length}`,
      );
      const hash = keccak_256(concatBytes(prefix, utf8ToBytes(message)));
      const signed = secp256k1.sign(hash, privateKey);
      const v = 27 + (signed.recovery ?? 0);
      return (
        "0x" +
        bytesToHex(signed.toCompactRawBytes()) +
        v.toString(16).padStart(2, "0")
      );
    },
  };
  return Object.freeze({ provider, address });
};

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

describe("listingBindingV2", () => {
  const TREE_DEPTH = 20;
  const zeroPath = Object.freeze(
    Array.from({ length: TREE_DEPTH }, () => "0x0"),
  );
  const zeroIndices = Object.freeze(
    Array.from({ length: TREE_DEPTH }, () => 0),
  );

  const baseInput = Object.freeze({
    commitment: "0x1a2b3c4d5e6f7890abcdef012345678901234567890abcdef012345678901234",
    orgDid: "0x" + poseidon1([toScalar("org-secret-test-key")]).toString(16),
    individualDid: "did:example:alice",
    priceUsdc: 42000000,
    schemaId: "content-commitment-v1.2",
    memberRoot: "0xabc123",
    merklePath: zeroPath,
    merkleIndices: zeroIndices,
    memberSalt: "0xdeadbeef",
    salt: "0x1111111111111111111111111111111111111111111111111111111111111111",
  });

  it("returns witness with listingRoot and public fields", () => {
    const result = listingBindingV2(baseInput);
    expect(result.listingRoot).toMatch(/^0x[0-9a-f]+$/);
    expect(result.witness.listingRoot).toBe(result.listingRoot);
    expect(result.witness.commitment).toBeDefined();
    expect(result.witness.orgDid).toBeDefined();
    expect(result.witness.memberRoot).toBeDefined();
    expect(result.witness.merklePath).toHaveLength(TREE_DEPTH);
    expect(result.witness.merkleIndices).toHaveLength(TREE_DEPTH);
  });

  it("is deterministic when salt is provided", () => {
    expect(listingBindingV2(baseInput).listingRoot).toBe(
      listingBindingV2(baseInput).listingRoot,
    );
  });

  it("produces different listingRoots for different orgs", () => {
    const other = listingBindingV2({
      ...baseInput,
      orgDid: "0x" + poseidon1([toScalar("org-secret-other-key")]).toString(16),
    });
    expect(other.listingRoot).not.toBe(listingBindingV2(baseInput).listingRoot);
  });

  it("computes listingRoot as Poseidon5(schemaId, commitment, price, orgDid, salt)", () => {
    const result = listingBindingV2(baseInput);
    const expected = `0x${poseidon5([
      toScalar(baseInput.schemaId),
      BigInt(baseInput.commitment),
      toScalar(baseInput.priceUsdc),
      BigInt(baseInput.orgDid),
      BigInt(baseInput.salt),
    ]).toString(16)}`;
    expect(result.listingRoot).toBe(expected);
  });
});

describe("orgIdentity", () => {
  it("builds witness with correct commitmentHash", () => {
    const orgSecret = "0x" + "aa".repeat(31);
    const orgDid = `0x${poseidon1([BigInt(orgSecret)]).toString(16)}`;
    const memberRoot = "0x" + "bb".repeat(31);
    const domain = "frame00.com";
    const timestamp = 1700000000;
    const signatureR = "0x" + "cc".repeat(31);
    const message = poseidon3([BigInt(memberRoot), toScalar(domain), BigInt(timestamp)]);
    const signatureS = `0x${poseidon3([BigInt(orgSecret), message, BigInt(signatureR)]).toString(16)}`;
    const orgSalt = "0x" + "dd".repeat(31);

    const result = orgIdentity({
      orgSecret,
      orgSalt,
      orgDid,
      memberRoot,
      domain,
      timestamp,
      signatureR,
      signatureS,
    });

    const expectedCommitmentHash = `0x${poseidon5([
      BigInt(orgDid),
      BigInt(memberRoot),
      toScalar(domain),
      BigInt(timestamp),
      BigInt(orgSalt),
    ]).toString(16)}`;
    expect(result.commitmentHash).toBe(expectedCommitmentHash);
    expect(result.witness.orgDid).toBe(orgDid);
    expect(result.witness.orgSecret).toBe(orgSecret);
  });

  it("throws when orgDid does not match Poseidon1(orgSecret)", () => {
    expect(() =>
      orgIdentity({
        orgSecret: "0x" + "aa".repeat(31),
        orgSalt: "0x" + "dd".repeat(31),
        orgDid: "0x" + "ee".repeat(31), // wrong
        memberRoot: "0x" + "bb".repeat(31),
        domain: "frame00.com",
        timestamp: 1700000000,
        signatureR: "0x" + "cc".repeat(31),
        signatureS: "0x" + "ff".repeat(31),
      }),
    ).toThrow("orgDid does not match");
  });

  it("throws when signatureS is invalid", () => {
    const orgSecret = "0x" + "aa".repeat(31);
    const orgDid = `0x${poseidon1([BigInt(orgSecret)]).toString(16)}`;
    expect(() =>
      orgIdentity({
        orgSecret,
        orgSalt: "0x" + "dd".repeat(31),
        orgDid,
        memberRoot: "0x" + "bb".repeat(31),
        domain: "frame00.com",
        timestamp: 1700000000,
        signatureR: "0x" + "cc".repeat(31),
        signatureS: "0x" + "00".repeat(31), // bogus
      }),
    ).toThrow("signatureS does not match");
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

  // ── Institutional binding (listing-binding-v2) ─────────────────────

  describe("institutionalBinding", () => {
    const TREE_DEPTH = 20;
    const zeroPath = Object.freeze(
      Array.from({ length: TREE_DEPTH }, () => "0x0"),
    );
    const zeroIndices = Object.freeze(
      Array.from({ length: TREE_DEPTH }, () => 0),
    );

    it("submits content proof then listing-binding-v2 proof", async () => {
      const client = setupMocks();
      const { witness, commitment } = contentCommitment(
        new Uint8Array([1, 2, 3]),
      );

      const listing = await publish(
        client,
        Object.freeze({
          circuitId: "content-commitment-v1.2",
          witness,
          commitment,
          price: Object.freeze({ amount: 1000000, currency: "USDC" as const }),
          did: "did:example:alice",
          commitmentSigner: createMockSigner(),
          institutionalBinding: Object.freeze({
            orgDid: "0x" + poseidon1([toScalar("org-secret-test-key")]).toString(16),
            memberRoot: "0xabc",
            individualDid: "did:example:alice",
            merklePath: zeroPath,
            merkleIndices: zeroIndices,
            memberSalt: "0x1",
          }),
        }),
      );

      expect(listing.listingRoot).toMatch(/^0x[0-9a-f]+$/);
      expect(listing.commitment).toBe(commitment);

      const mockFetch = client.fetcher as ReturnType<typeof vi.fn>;
      const proofCalls = mockFetch.mock.calls.filter(
        (call) =>
          String(call[0]).includes("/v1/proofs") &&
          (call[1] as RequestInit | undefined)?.method === "POST",
      );
      expect(proofCalls).toHaveLength(2);

      const body0 = JSON.parse((proofCalls[0]![1] as RequestInit).body as string);
      const body1 = JSON.parse((proofCalls[1]![1] as RequestInit).body as string);
      expect(body0.circuitId).toBe("content-commitment-v1.2");
      expect(body1.circuitId).toBe("listing-binding-v2");
    });

    it("throws when institutionalBinding is set without commitmentSigner", async () => {
      const client = setupMocks();
      const { witness, commitment } = contentCommitment(
        new Uint8Array([1, 2, 3]),
      );

      await expect(
        publish(
          client,
          Object.freeze({
            circuitId: "content-commitment-v1.2",
            witness,
            commitment,
            price: Object.freeze({ amount: 1000000, currency: "USDC" as const }),
            did: "did:example:alice",
            institutionalBinding: Object.freeze({
              orgDid: "0x" + poseidon1([toScalar("org-secret-test-key")]).toString(16),
              memberRoot: "0xabc",
              individualDid: "did:example:alice",
              merklePath: zeroPath,
              merkleIndices: zeroIndices,
              memberSalt: "0x1",
            }),
          }),
        ),
      ).rejects.toThrow("commitmentSigner is required when institutionalBinding is set");
    });

    it("uses signed randomness as salt when commitmentSigner is set", async () => {
      const client = setupMocks();
      const { witness, commitment } = contentCommitment(
        new Uint8Array([1, 2, 3]),
      );
      const signer = createMockSigner();

      const listing = await publish(
        client,
        Object.freeze({
          circuitId: "content-commitment-v1.2",
          witness,
          commitment,
          price: Object.freeze({ amount: 1000000, currency: "USDC" as const }),
          did: "did:example:alice",
          commitmentSigner: signer,
          institutionalBinding: Object.freeze({
            orgDid: "0x" + poseidon1([toScalar("org-secret-test-key")]).toString(16),
            memberRoot: "0xabc",
            individualDid: "did:example:alice",
            merklePath: zeroPath,
            merkleIndices: zeroIndices,
            memberSalt: "0x1",
          }),
        }),
      );

      expect(listing.signedCommitment).toBeDefined();
      expect(listing.signedCommitment!.randomness).toMatch(/^0x[0-9a-f]+$/);
      expect(listing.listingRoot).toMatch(/^0x[0-9a-f]+$/);

      // signed randomness must equal the salt used in listingRoot
      const expectedListingRoot = `0x${poseidon5([
        toScalar("content-commitment-v1.2"),
        BigInt(commitment),
        toScalar(1000000),
        BigInt("0x" + poseidon1([toScalar("org-secret-test-key")]).toString(16)),
        BigInt(listing.signedCommitment!.randomness),
      ]).toString(16)}`;
      expect(listing.listingRoot).toBe(expectedListingRoot);
    });

    it("does not submit listing-binding-v2 when institutionalBinding is omitted", async () => {
      const client = setupMocks();
      const { witness, commitment } = contentCommitment(
        new Uint8Array([1, 2, 3]),
      );

      await publish(
        client,
        Object.freeze({
          circuitId: "content-commitment-v1.2",
          witness,
          commitment,
          price: Object.freeze({ amount: 1000000, currency: "USDC" as const }),
          did: "did:example:alice",
        }),
      );

      const mockFetch = client.fetcher as ReturnType<typeof vi.fn>;
      const proofCalls = mockFetch.mock.calls.filter(
        (call) =>
          String(call[0]).includes("/v1/proofs") &&
          (call[1] as RequestInit | undefined)?.method === "POST",
      );
      expect(proofCalls).toHaveLength(1);
      const body = JSON.parse((proofCalls[0]![1] as RequestInit).body as string);
      expect(body.circuitId).toBe("content-commitment-v1.2");
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
