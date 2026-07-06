/**
 * Trust402 SDK — proof orchestration for publishing content listings.
 *
 * `publish()` is circuit-agnostic: the caller provides `circuitId`,
 * `witness`, and `commitment`, and publish() handles proof generation,
 * document registration, proof submission, and listingRoot computation.
 *
 * Witness builders for known circuits (blog-article-v1.2,
 * content-commitment-v1.2) are exported as convenience utilities.
 */
import type { LemmaClient, SubmitProofResponse } from "@lemmaoracle/spec";
import { toScalar } from "@lemmaoracle/sdk";
import { poseidon1, poseidon2, poseidon5 } from "poseidon-lite";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "@noble/hashes/utils";

/* ------------------------------------------------------------------ */
/*  Normalizer helpers (for content-commitment witness builder)        */
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
/*  Hex / hash helpers                                                 */
/* ------------------------------------------------------------------ */

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = (data: Uint8Array): string => bytesToHex(sha256(data));

const randomHex = (length = 32): string => bytesToHex(randomBytes(length));

const bigintToHex = (n: bigint): string => `0x${n.toString(16)}`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Price in USDC smallest unit (6 decimals). */
export type PriceInput = Readonly<{ amount: number; currency: "USDC" }>;

/**
 * Publish input — circuit-agnostic.
 *
 * The caller is responsible for building the witness according to
 * the circuit's expected inputs. Witness builders for known circuits
 * are exported as convenience utilities (see below).
 */
export type Trust402PublishInput = Readonly<{
  /** Circuit ID registered with the Lemma API. */
  circuitId: string;
  /** Witness fields passed to prover.prove(). */
  witness: Readonly<Record<string, string>>;
  /** Commitment — the public output that ties the witness to content. */
  commitment: string;
  /** Price in USDC smallest unit (6 decimals). */
  price: PriceInput;
  /** Seller DID. */
  did: string;
  /** Optional content CID (e.g. "sha256:..."). */
  cid?: string;
  /** Optional metadata. */
  metadata?: Readonly<{ title?: string; version?: string; description?: string }>;
  /** Listing environment — determines billing network (sandbox → base-sepolia, production → base). */
  environment?: "sandbox" | "production";
}>;

/** Full listing returned after successful publish. */
export type Trust402Listing = Readonly<{
  listingRoot: string;
  schemaId: string;
  commitment: string;
  did: string;
  price: PriceInput;
  cid?: string;
  perSchemaProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  } | null;
  metadata?: Readonly<{ title?: string; version?: string; description?: string }>;
  /** Listing environment the proof was billed under. */
  environment?: "sandbox" | "production";
  createdAt: number;
}>;

/* ------------------------------------------------------------------ */
/*  Witness builders for known circuits                                */
/* ------------------------------------------------------------------ */

/** Payload for blog-article content type. */
export type BlogArticlePayload = Readonly<{
  author: string; // DID string
  body: string; // article body text
  published: number; // unix timestamp seconds
  words: number; // word count
  lang: string; // ISO 639-1 (en, ja, ...)
}>;

/** Result of a witness builder — the witness record plus the commitment. */
export type WitnessResult = Readonly<{
  witness: Readonly<Record<string, string>>;
  commitment: string;
}>;

/** ISO 639-1 → numeric code map. */
const LANG_MAP: Readonly<Record<string, bigint>> = Object.freeze({
  en: 1n, ja: 2n, zh: 3n, ko: 4n, es: 5n, fr: 6n,
  de: 7n, pt: 8n, ru: 9n, ar: 10n, hi: 11n, it: 12n,
  nl: 13n, tr: 14n, vi: 15n, th: 16n, id: 17n, pl: 18n,
  uk: 19n, sv: 20n,
});

const langToCode = (lang: string): bigint => LANG_MAP[lang.toLowerCase()] ?? 0n;

/**
 * Build witness for blog-article-v1.2 circuit.
 *
 * Witness fields:
 *   authorHash, published, integrityHash, words, langCode, commitment
 *   where commitment = poseidon5([authorHash, published, integrityHash, words, langCode])
 */
export const buildBlogArticleWitness = (
  payload: BlogArticlePayload,
): WitnessResult => {
  const authorHash = toScalar(payload.author);
  const published = BigInt(payload.published);
  const integrityHash = toScalar(payload.body);
  const words = BigInt(payload.words);
  const langCode = langToCode(payload.lang);
  const commitment = poseidon5([authorHash, published, integrityHash, words, langCode]);

  const commitmentHex = bigintToHex(commitment);
  return Object.freeze({
    witness: Object.freeze({
      authorHash: bigintToHex(authorHash),
      published: published.toString(),
      integrityHash: bigintToHex(integrityHash),
      words: words.toString(),
      langCode: langCode.toString(),
      commitment: commitmentHex,
    }),
    commitment: commitmentHex,
  });
};

/**
 * Build witness for content-commitment-v1.2 circuit.
 *
 * Uses the canonical normalizer: bytes → fieldElements → poseidon2
 * reduction → poseidon1.
 */
export const buildContentCommitmentWitness = (
  bytes: Uint8Array,
): WitnessResult => {
  const elements = bytesToFieldElements(bytes);
  const fileHash = reduceElements(elements, (inputs: [bigint, bigint]) =>
    poseidon2(inputs),
  );
  const commitment = poseidon1([fileHash]);

  const commitmentHex = bigintToHex(commitment);
  return Object.freeze({
    witness: Object.freeze({
      fileHash: bigintToHex(fileHash),
      commitment: commitmentHex,
    }),
    commitment: commitmentHex,
  });
};

/* ------------------------------------------------------------------ */
/*  CID helper                                                         */
/* ------------------------------------------------------------------ */

/** Compute a sha256-based CID from raw bytes. */
export const computeCid = (bytes: Uint8Array): string =>
  `sha256:${sha256Hex(bytes)}`;

/* ------------------------------------------------------------------ */
/*  Main publish function                                              */
/* ------------------------------------------------------------------ */

/**
 * Publish a Trust402 listing.
 *
 * Generates a per-schema proof via prover.prove(), registers the
 * document, submits the proof, and returns a full listing with a
 * deterministic listingRoot identifier (Poseidon5 of schemaId,
 * commitment, price, did, salt).
 *
 * Circuit-agnostic: the caller chooses the circuitId and builds the
 * witness. Use the exported witness builders for known circuits.
 */
export const publish = async (
  client: LemmaClient,
  input: Trust402PublishInput,
): Promise<Trust402Listing> => {
  const [{ prover }, { post, documents }] = await Promise.all([
    import("@lemmaoracle/sdk"),
    import("@lemmaoracle/sdk"),
  ]);
  const { prove } = prover;
  const { register: registerDocument } = documents;

  // ── 1. Generate per-schema proof ──
  const proof = await prove(client, {
    circuitId: input.circuitId,
    witness: input.witness,
  });

  // ── 2. Register document ──
  await registerDocument(client, {
    docHash: input.commitment,
    schema: input.circuitId,
    cid: input.cid ?? "",
    issuerId: input.did,
    subjectId: input.did,
    commitments: {
      scheme: "poseidon" as const,
      root: input.commitment,
      leaves: [input.commitment],
      randomness: "0x0",
    },
    revocation: { root: "" },
  });

  // ── 3. Submit proof ──
  // Environment rides as a query param so the proof body stays a clean
  // SubmitProofRequest; the Trust402 proxy consumes it for billing.
  const proofPath =
    input.environment !== undefined
      ? `/v1/proofs?environment=${encodeURIComponent(input.environment)}`
      : "/v1/proofs";
  await post<SubmitProofResponse>(client)(proofPath)({
    docHash: input.commitment,
    circuitId: input.circuitId,
    proof: proof.proof,
    inputs: [input.commitment],
  });

  // ── 4. Compute listingRoot (deterministic identifier, no ZK proof) ──
  const schemaIdScalar = toScalar(input.circuitId);
  const priceUsdc = toScalar(input.price.amount);
  const didScalar = toScalar(input.did);
  const salt = toScalar(randomHex(32));
  const listingRoot = poseidon5([
    schemaIdScalar,
    BigInt(input.commitment),
    priceUsdc,
    didScalar,
    salt,
  ]);
  const listingRootHex = bigintToHex(listingRoot);

  return Object.freeze({
    listingRoot: listingRootHex,
    schemaId: input.circuitId,
    commitment: input.commitment,
    did: input.did,
    price: input.price,
    cid: input.cid,
    perSchemaProof: {
      circuitId: input.circuitId,
      proof: proof.proof,
      inputs: [input.commitment],
    },
    metadata: input.metadata,
    environment: input.environment,
    createdAt: Date.now(),
  });
};

/* ------------------------------------------------------------------ */
/*  Content type detection utility (UI helper)                         */
/* ------------------------------------------------------------------ */

/** MIME type → content type detection (for browser File objects). */
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
