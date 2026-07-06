/**
 * Trust402 SDK — proof orchestration for publishing content listings.
 *
 * One call (`publish`) generates a per-schema proof and returns
 * a full listing with a listingRoot identifier.
 */
import type { LemmaClient } from "@lemmaoracle/spec";
import { toScalar } from "@lemmaoracle/sdk";
import { poseidon1, poseidon2, poseidon5 } from "poseidon-lite";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "@noble/hashes/utils";

/* ------------------------------------------------------------------ */
/*  Inlined normalizer helpers (from @lemmaoracle/content)             */
/*  Inlined to avoid cross-package rootDir issues and circular deps.   */
/* ------------------------------------------------------------------ */

/** Chunk size in bytes: 31 bytes = 248 bits < 254-bit field prime. */
const CHUNK_SIZE = 31;

/**
 * Convert raw bytes to an array of BN254 field elements.
 * Uses 31-byte big-endian chunks with PKCS7 padding.
 */
const bytesToFieldElements = (data: Uint8Array): bigint[] => {
  const len = data.length;
  const padLen = CHUNK_SIZE - (len % CHUNK_SIZE);
  const paddedLen = len + padLen;

  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  for (let i = len; i < paddedLen; i++) {
    padded[i] = padLen;
  }

  const numChunks = paddedLen / CHUNK_SIZE;
  const elements: bigint[] = new Array(numChunks);

  for (let i = 0; i < numChunks; i++) {
    const offset = i * CHUNK_SIZE;
    let val = 0n;
    for (let j = 0; j < CHUNK_SIZE; j++) {
      const byte = padded[offset + j];
      val = (val << 8n) | BigInt(byte ?? 0);
    }
    elements[i] = val;
  }

  return elements;
};

/**
 * Reduce an array of field elements to a single field element
 * using iterative Poseidon(2) hashing.
 */
const reduceElements = (
  elements: readonly bigint[],
  poseidon2Fn: (inputs: [bigint, bigint]) => bigint,
): bigint => {
  if (elements.length === 0) {
    return 0n;
  }
  let acc = elements[0] ?? 0n;
  for (let i = 1; i < elements.length; i++) {
    acc = poseidon2Fn([acc, elements[i] ?? 0n]);
  }
  return acc;
};

/* ------------------------------------------------------------------ */
/*  Inlined crypto helpers (from @lemmaoracle/sdk platform)            */
/* ------------------------------------------------------------------ */

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = (data: Uint8Array): string => bytesToHex(sha256(data));

const randomHex = (length = 32): string => bytesToHex(randomBytes(length));

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Payload for blog-article content type. */
export type BlogArticlePayload = Readonly<{
  author: string; // DID string
  body: string; // article body text
  published: number; // unix timestamp seconds
  words: number; // word count
  lang: string; // ISO 639-1 (en, ja, ...)
}>;

/** Supported content input variants. */
export type ContentInput =
  | Readonly<{ type: "file"; name: string; bytes: Uint8Array; mimeType: string }>
  | Readonly<{ type: "blog-article"; payload: BlogArticlePayload }>
  | Readonly<{ type: "generic"; mimeType: string; payload: Uint8Array }>;

/** Price in USDC smallest unit (6 decimals). */
export type PriceInput = Readonly<{ amount: number; currency: "USDC" }>;

/** Publish input — everything the seller provides. */
export type Trust402PublishInput = Readonly<{
  content: ContentInput;
  price: PriceInput;
  did: string; // seller DID, e.g. "did:pkh:0x..."
  metadata?: Readonly<{ title?: string; version?: string; description?: string }>;
  /**
   * Pre-computed commitment (0x-hex). When set, per-schema proof generation
   * is skipped. Use when the caller has already computed a commitment via an
   * unsupported content type or external circuit.
   */
  commitment?: string;
}>;

/** Full listing returned after successful publish. */
export type Trust402Listing = Readonly<{
  listingRoot: string;
  schemaId: string;
  commitment: string;
  did: string; // seller DID echoed back (did:pkh, did:ethr, etc.)
  price: PriceInput;
  cid?: string;
  perSchemaProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  } | null;
  metadata?: Readonly<{ title?: string; version?: string; description?: string }>;
  createdAt: number;
}>;

/* ------------------------------------------------------------------ */
/*  Content-Type Registry (internal constant)                          */
/* ------------------------------------------------------------------ */

type ContentMapping = Readonly<{
  circuitId: string;
  needsCID: boolean;
}>;

const CONTENT_REGISTRY: Record<string, ContentMapping> = {
  "blog-article": { circuitId: "blog-article-v1.2", needsCID: false },
  default: { circuitId: "content-commitment-v1.2", needsCID: true },
} as const;

/* ------------------------------------------------------------------ */
/*  Language code map (ISO 639-1 → numeric code)                       */
/* ------------------------------------------------------------------ */

const LANG_MAP: Readonly<Record<string, bigint>> = Object.freeze({
  en: 1n,
  ja: 2n,
  zh: 3n,
  ko: 4n,
  es: 5n,
  fr: 6n,
  de: 7n,
  pt: 8n,
  ru: 9n,
  ar: 10n,
  hi: 11n,
  it: 12n,
  nl: 13n,
  tr: 14n,
  vi: 15n,
  th: 16n,
  id: 17n,
  pl: 18n,
  uk: 19n,
  sv: 20n,
});

const langToCode = (lang: string): bigint => LANG_MAP[lang.toLowerCase()] ?? 0n;

/* ------------------------------------------------------------------ */
/*  Step 0: selectCircuit                                              */
/* ------------------------------------------------------------------ */

/** Select the per-schema circuit and CID requirement for a content input. */
const selectCircuit = (content: ContentInput): ContentMapping =>
  content.type === "blog-article"
    ? CONTENT_REGISTRY["blog-article"]!
    : CONTENT_REGISTRY.default!;

/* ------------------------------------------------------------------ */
/*  Witness Builders (internal, not exported)                          */
/* ------------------------------------------------------------------ */

/**
 * Build witness for blog-article-v1 circuit.
 *
 * Witness fields:
 *   authorHash, published, integrityHash, words, langCode, commitment
 *   where commitment = poseidon5([authorHash, published, integrityHash, words, langCode])
 */
const buildBlogArticleWitness = (
  payload: BlogArticlePayload,
): Readonly<Record<string, string>> => {
  const authorHash = toScalar(payload.author);
  const published = BigInt(payload.published);
  const integrityHash = toScalar(payload.body);
  const words = BigInt(payload.words);
  const langCode = langToCode(payload.lang);
  const commitment = poseidon5([authorHash, published, integrityHash, words, langCode]);

  return Object.freeze({
    authorHash: `0x${authorHash.toString(16)}`,
    published: published.toString(),
    integrityHash: `0x${integrityHash.toString(16)}`,
    words: words.toString(),
    langCode: langCode.toString(),
    commitment: `0x${commitment.toString(16)}`,
  });
};

/**
 * Build witness for content-commitment-v1 circuit.
 *
 * Uses the canonical normalizer: bytes → fieldElements → poseidon2 reduction → poseidon1.
 */
const buildContentCommitmentWitness = (
  bytes: Uint8Array,
): Readonly<Record<string, string>> => {
  const elements = bytesToFieldElements(bytes);
  const fileHash = reduceElements(elements, (inputs: [bigint, bigint]) =>
    poseidon2(inputs),
  );
  const commitment = poseidon1([fileHash]);

  return Object.freeze({
    fileHash: `0x${fileHash.toString(16)}`,
    commitment: `0x${commitment.toString(16)}`,
  });
};

/** Build the per-schema witness based on content type. */
const buildPerSchemaWitness = (
  content: ContentInput,
): { circuitId: string; witness: Readonly<Record<string, string>> } =>
  content.type === "blog-article"
    ? {
        circuitId: "blog-article-v1.2",
        witness: buildBlogArticleWitness(content.payload),
      }
    : (() => {
        const bytes =
          content.type === "file" ? content.bytes : content.payload;
        return {
          circuitId: "content-commitment-v1.2",
          witness: buildContentCommitmentWitness(bytes),
        };
      })();

/* ------------------------------------------------------------------ */
/*  Hex helpers                                                        */
/* ------------------------------------------------------------------ */

const bigintToHex = (n: bigint): string => `0x${n.toString(16)}`;

/* ------------------------------------------------------------------ */
/*  Main publish function                                              */
/* ------------------------------------------------------------------ */

/**
 * Publish a Trust402 listing.
 *
 * Generates a per-schema proof for the content, registers it with
 * Lemma, and returns a full listing with a deterministic listingRoot
 * identifier (Poseidon5 of schemaId, commitment, price, did, salt).
 */
export const publish = async (
  client: LemmaClient,
  input: Trust402PublishInput,
): Promise<Trust402Listing> => {
  const [{ prover }, { proofs, documents }] = await Promise.all([
    import("@lemmaoracle/sdk"),
    import("@lemmaoracle/sdk"),
  ]);
  const { prove } = prover;
  const { submit } = proofs;
  const { register: registerDocument } = documents;

  // ── Resolve commitment ──
  const externalCommitment = input.commitment !== undefined;
  const mapping = externalCommitment
    ? { circuitId: "external", needsCID: input.content.type !== "blog-article" }
    : selectCircuit(input.content);

  let commitment: string;
  let perSchemaProof: Trust402Listing["perSchemaProof"];

  // Compute CID once — needed for documents.register.
  const cid = mapping.needsCID
    ? (() => {
        const bytes =
          input.content.type === "file"
            ? input.content.bytes
            : input.content.type === "generic"
              ? input.content.payload
              : undefined;
        return bytes !== undefined ? `sha256:${sha256Hex(bytes)}` : undefined;
      })()
    : undefined;

  if (externalCommitment) {
    commitment = input.commitment!;
    perSchemaProof = null;
  } else {
    const { circuitId, witness: perSchemaWitness } =
      buildPerSchemaWitness(input.content);

    const proof = await prove(client, {
      circuitId,
      witness: perSchemaWitness,
    });

    commitment = perSchemaWitness.commitment!;

    // Register the document before submitting the proof.
    await registerDocument(client, {
      docHash: commitment,
      schema: circuitId,
      cid: cid ?? "",
      issuerId: input.did,
      subjectId: input.did,
      commitments: {
        scheme: "poseidon" as const,
        root: commitment,
        leaves: [commitment],
        randomness: "0x0",
      },
      revocation: { root: "" },
    });

    // Register per-schema proof
    await submit(client, {
      docHash: commitment,
      circuitId,
      proof: proof.proof,
      inputs: [commitment],
    });

    perSchemaProof = {
      circuitId,
      proof: proof.proof,
      inputs: [commitment],
    };
  }

  // ── Listing root (deterministic identifier, no ZK proof) ──
  // Previously wrapped in a listing-binding ZK proof which was removed
  // as redundant (crossCheckPassed already binds listing to proof).
  // The listingRoot formula is preserved for backward compat.
  const schemaId = toScalar(mapping.circuitId!);
  const priceUsdc = toScalar(input.price.amount);
  const didScalar = toScalar(input.did);
  const salt = toScalar(randomHex(32));
  const listingRoot = poseidon5([schemaId, BigInt(commitment), priceUsdc, didScalar, salt]);
  const listingRootHex = bigintToHex(listingRoot);

  return Object.freeze({
    listingRoot: listingRootHex,
    schemaId: mapping.circuitId,
    commitment,
    did: input.did,
    price: input.price,
    cid,
    perSchemaProof,
    metadata: input.metadata,
    createdAt: Date.now(),
  });
};

/* ------------------------------------------------------------------ */
/*  Content type detection utility                                     */
/* ------------------------------------------------------------------ */

/** MIME type → content type detection (for File-based input). */
const MIME_TO_CONTENT_TYPE: Readonly<Record<string, string>> = Object.freeze({
  "image/": "image",
  "video/": "video",
  "text/csv": "csv",
  "application/json": "code",
  "text/plain": "code",
  "text/html": "code",
  "text/javascript": "code",
  "text/typescript": "code",
  "application/xml": "code",
  "text/markdown": "code",
});

/**
 * Detect content type from a browser File object.
 * Used by dashboard before publish to show a badge.
 */
export const detectContentType = (file: {
  readonly type: string;
  readonly name: string;
}): string => {
  const exactMatch = Object.entries(MIME_TO_CONTENT_TYPE).find(([key]) =>
    file.type === key,
  );
  if (exactMatch !== undefined) {
    return exactMatch[1];
  }

  const prefixMatch = Object.entries(MIME_TO_CONTENT_TYPE).find(([key]) =>
    key.endsWith("/") && file.type.startsWith(key),
  );
  if (prefixMatch !== undefined) {
    return prefixMatch[1];
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return "csv";
  if (ext === "json" || ext === "jsonl") return "code";
  if (ext === "md") return "code";
  if (ext === "xml") return "code";
  if (ext === "html" || ext === "htm") return "code";
  if (ext === "js" || ext === "ts" || ext === "jsx" || ext === "tsx") return "code";
  if (ext === "py" || ext === "rs" || ext === "go" || ext === "java") return "code";
  if (ext === "sol" || ext === "vy") return "code";

  return "generic";
};
