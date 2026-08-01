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
import type { LemmaClient } from "@lemmaoracle/spec";
import { toScalar } from "@lemmaoracle/sdk";
import { poseidon1, poseidon2, poseidon5 } from "poseidon-lite";
import { sha256 } from "@noble/hashes/sha2";
import { randomBytes } from "@noble/hashes/utils";
import type { CommitmentSigner } from "./signing.js";
import { signCommitment } from "./signing.js";

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
  // PKCS7 padding: append padLen bytes of value padLen
  const padded = Uint8Array.from([
    ...data,
    ...Uint8Array.from({ length: padLen }, (_: number) => padLen),
  ]);
  const numChunks = padded.length / CHUNK_SIZE;
  return Array.from({ length: numChunks }, (_, i: number) => {
    const offset = i * CHUNK_SIZE;
    return Array.from(
      { length: CHUNK_SIZE },
      (_, j: number) => padded[offset + j] ?? 0,
    ).reduce(
      (acc: bigint, byte: number) => (acc << 8n) | BigInt(byte),
      0n,
    );
  });
};

/**
 * Reduce an array of field elements to a single field element
 * using iterative Poseidon(2) hashing.
 */
const reduceElements = (
  elements: readonly bigint[],
  poseidon2Fn: (inputs: [bigint, bigint]) => bigint,
): bigint =>
  elements.length === 0
    ? 0n
    : elements.slice(1).reduce(
        (acc: bigint, el: bigint) => poseidon2Fn([acc, el]),
        elements[0] ?? 0n,
      );

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

/** File abstraction — avoids `new File()` requirement in Node.js. */
export type FileInput = Readonly<{
  body: string | Uint8Array;
  name: string;
  type?: string;
}>;

/** Storefront content categories (mirrors server ALLOWED_CATEGORIES). */
export type Category = "dataset" | "model" | "code" | "document" | "image" | "audio" | "other";

/**
 * Optional institutional binding for listing-binding-v2.
 * When set on PublishInput, publish() generates a membership+listing proof
 * in addition to the content proof.
 */
export type InstitutionalBinding = Readonly<{
  orgDid: string;
  memberRoot: string;
  individualDid: string;
  merklePath: ReadonlyArray<string>;
  merkleIndices: ReadonlyArray<number>;
  memberSalt: string;
}>;

/**
 * Publish input — circuit-agnostic.
 *
 * The caller is responsible for building the witness according to
 * the circuit's expected inputs. Witness builders for known circuits
 * are exported as convenience utilities (see below).
 */
export type PublishInput = Readonly<{
  /** Circuit ID registered with the Lemma API. */
  circuitId: string;
  /** Witness fields passed to prover.prove() (circuit-specific; may include arrays). */
  witness: Readonly<Record<string, unknown>>;
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
  /** Content file to upload to the storefront. If provided, publish() auto-uploads to /api/cards. */
  file?: Blob | File | FileInput;
  /** Storefront category (e.g. "article", "code"). Required when `file` is set. */
  category?: Category;
  /** Seller payout wallet (0x-prefixed). Required when `file` is set and price > 0. */
  payoutAddress?: string;
  /** Optional institutional binding — when set, publish() generates a listing-binding-v2 proof. */
  institutionalBinding?: InstitutionalBinding;
  /** Optional commitment signer. When set, the commitment is signed via EIP-191
   * and the signature becomes the `randomness` in documents.register and the
   * `salt` in listing-binding-v2. Required for institutional bindings. */
  commitmentSigner?: CommitmentSigner;
}>;

/** Full listing returned after successful publish. */
export type Listing = Readonly<{
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
  /** Storefront card ID (present only when `file` was provided to publish()). */
  cardId?: string;
  /** Signed commitment data (present when commitmentSigner was provided). */
  signedCommitment?: Readonly<{
    signature: string;
    recoveredAddress: string;
    randomness: string;
  }>;
  createdAt: number;
}>;

/* ------------------------------------------------------------------ */
/*  Witness builders for known circuits                                */
/* ------------------------------------------------------------------ */

/** Payload for blog-article content type. */
export type Article = Readonly<{
  author: string; // DID string
  body: string; // article body text
  published: number; // unix timestamp seconds
  words: number; // word count
  lang: string; // ISO 639-1 (en, ja, ...)
}>;

/** Result of a witness builder — the witness record plus the commitment. */
export type Witness = Readonly<{
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
export const blogArticle = (
  payload: Article,
): Witness => {
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
export const contentCommitment = (
  bytes: Uint8Array,
): Witness => {
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
/*  listing-binding-v2 witness builder                                 */
/* ------------------------------------------------------------------ */

const LISTING_BINDING_V2_CIRCUIT_ID = "listing-binding-v2";

/** Parse a hex string (with or without 0x) to bigint. */
const hexToBigInt = (hex: string): bigint =>
  BigInt(hex.startsWith("0x") || hex.startsWith("0X") ? hex : `0x${hex}`);

export type ListingBindingV2Input = Readonly<{
  commitment: string;
  orgDid: string;
  individualDid: string;
  priceUsdc: number;
  schemaId: string;
  memberRoot: string;
  merklePath: ReadonlyArray<string>;
  merkleIndices: ReadonlyArray<number>;
  memberSalt: string;
  /** Optional salt (hex). When omitted, a random Poseidon1 salt is generated. */
  salt?: string;
}>;

export type ListingBindingV2Witness = Readonly<{
  witness: Readonly<{
    individualDid: string;
    salt: string;
    merklePath: ReadonlyArray<string>;
    merkleIndices: ReadonlyArray<string>;
    memberSalt: string;
    listingRoot: string;
    commitment: string;
    orgDid: string;
    memberRoot: string;
    schemaId: string;
    priceUsdc: string;
  }>;
  listingRoot: string;
}>;

/**
 * Build witness for listing-binding-v2 circuit.
 *
 * Computes listingRoot = Poseidon5(schemaId, commitment, priceUsdc, orgDid, salt)
 * and returns all circuit signals as hex strings (indices as decimal "0"/"1").
 */
export const listingBindingV2 = (
  input: ListingBindingV2Input,
): ListingBindingV2Witness => {
  const schemaId = toScalar(input.schemaId);
  const commitment = hexToBigInt(input.commitment);
  const priceUsdc = toScalar(input.priceUsdc);
  const orgDid = toScalar(input.orgDid);
  const individualDid = toScalar(input.individualDid);
  const memberRoot = hexToBigInt(input.memberRoot);
  const memberSalt = hexToBigInt(input.memberSalt);
  const salt =
    input.salt !== undefined
      ? hexToBigInt(input.salt)
      : poseidon1([hexToBigInt(randomHex(32))]);

  const listingRoot = poseidon5([
    schemaId,
    commitment,
    priceUsdc,
    orgDid,
    salt,
  ]);
  const listingRootHex = bigintToHex(listingRoot);

  return Object.freeze({
    witness: Object.freeze({
      individualDid: bigintToHex(individualDid),
      salt: bigintToHex(salt),
      merklePath: Object.freeze(input.merklePath.map((p) =>
        p.startsWith("0x") || p.startsWith("0X") ? p : `0x${p}`,
      )),
      merkleIndices: Object.freeze(
        input.merkleIndices.map((i) => String(i)),
      ),
      memberSalt: bigintToHex(memberSalt),
      listingRoot: listingRootHex,
      commitment: bigintToHex(commitment),
      orgDid: bigintToHex(orgDid),
      memberRoot: bigintToHex(memberRoot),
      schemaId: bigintToHex(schemaId),
      priceUsdc: bigintToHex(priceUsdc),
    }),
    listingRoot: listingRootHex,
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

type ProofSubmission = Readonly<{
  docHash: string;
  circuitId: string;
  proof: string;
  inputs: ReadonlyArray<string>;
}>;

/**
 * Submit a single proof to POST /v1/proofs.
 * Trust402-specific: environment rides as a query param for billing.
 */
const submitProof = async (
  client: LemmaClient,
  submission: ProofSubmission,
  environment: "sandbox" | "production" | undefined,
): Promise<void> => {
  const proofPath =
    environment !== undefined
      ? `/v1/proofs?environment=${encodeURIComponent(environment)}`
      : "/v1/proofs";
  const proofUrl = `${client.apiBase}${proofPath}`;
  const proofHeaders: Record<string, string> = {
    "content-type": "application/json",
  };
  if (client.apiKey !== undefined) {
    proofHeaders["x-api-key"] = client.apiKey;
  }

  let proofRes: Response;
  try {
    proofRes = await (client.fetcher ?? fetch)(proofUrl, {
      method: "POST",
      headers: proofHeaders,
      body: JSON.stringify(submission),
    });
  } catch (e: unknown) {
    if (e instanceof Error) throw e;
    const msg = typeof e === "string" ? e
      : typeof (e as Readonly<{ message?: unknown }>)?.message === "string"
        ? String((e as Readonly<{ message: string }>).message)
        : "Unknown error";
    const code = (e as Readonly<{ code?: unknown }>)?.code;
    const err = new Error(
      `${msg} (apiBase: ${client.apiBase}; apiKey: ${client.apiKey ? "set" : "unset"})`,
    );
    throw typeof code === "number"
      ? (Object.assign(err, { code }) as Error & { code: number })
      : err;
  }
  if (!proofRes.ok) {
    const errBody = await proofRes.json().catch(() => ({}));
    throw new Error(
      `HTTP ${String(proofRes.status)}: ${JSON.stringify(errBody)} (apiBase: ${client.apiBase}; apiKey: ${client.apiKey ? "set" : "unset"})`,
    );
  }
};

/**
 * Publish a Trust402 listing.
 *
 * Generates a per-schema proof via prover.prove(), registers the
 * document, submits the proof, and returns a full listing with a
 * deterministic listingRoot identifier (Poseidon5 of schemaId,
 * commitment, price, did, salt).
 *
 * When `institutionalBinding` is set, also generates and submits a
 * listing-binding-v2 proof (listing integrity + membership). The API
 * accepts one proof per POST, so proofs are submitted sequentially.
 *
 * Circuit-agnostic: the caller chooses the circuitId and builds the
 * witness. Use the exported witness builders for known circuits.
 */
export const publish = async (
  client: LemmaClient,
  input: PublishInput,
): Promise<Listing> => {
  const [{ prover }, { documents }] = await Promise.all([
    import("@lemmaoracle/sdk"),
    import("@lemmaoracle/sdk"),
  ]);
  const { prove } = prover;
  const { register: registerDocument } = documents;

  const chainId = input.environment === "production" ? 8453 : 84532;

  // ── 0. Optional commitment signing (EIP-191 → randomness / salt) ──
  const signed =
    input.commitmentSigner !== undefined
      ? await signCommitment(input.commitmentSigner, input.commitment)
      : undefined;
  const randomness = signed?.randomness ?? "0x0";

  // ── 1. Compute docHash = Poseidon2(commitment, chainId) ──
  // Binding chainId into docHash makes Sandbox/Production documents distinct,
  // preventing INSERT OR IGNORE collisions when the same content is registered
  // on multiple chains.
  const docHash = bigintToHex(
    poseidon2([BigInt(input.commitment), BigInt(chainId)]),
  );

  // ── 2. Generate per-schema (content) proof ──
  const proof = await prove(client, {
    circuitId: input.circuitId,
    witness: input.witness,
  });

  // ── 2b. Optional listing-binding-v2 proof ──
  const binding =
    input.institutionalBinding !== undefined
      ? listingBindingV2({
          commitment: input.commitment,
          orgDid: input.institutionalBinding.orgDid,
          individualDid: input.institutionalBinding.individualDid,
          priceUsdc: input.price.amount,
          schemaId: input.circuitId,
          memberRoot: input.institutionalBinding.memberRoot,
          merklePath: input.institutionalBinding.merklePath,
          merkleIndices: input.institutionalBinding.merkleIndices,
          memberSalt: input.institutionalBinding.memberSalt,
          ...(signed !== undefined ? { salt: signed.randomness } : {}),
        })
      : undefined;

  const listingProof =
    binding !== undefined
      ? await prove(client, {
          circuitId: LISTING_BINDING_V2_CIRCUIT_ID,
          witness: binding.witness,
        })
      : undefined;

  // ── 3. Register document ──
  const _registerResult = await registerDocument(client, {
    docHash,
    schema: input.circuitId,
    cid: input.cid ?? "",
    issuerId: input.did,
    subjectId: input.did,
    chainId,
    commitments: {
      scheme: "poseidon" as const,
      root: docHash,
      leaves: [docHash],
      randomness,
    },
    revocation: { root: "" },
  });

  // ── 4. Submit proof(s) sequentially ──
  // Content proof first, then listing-binding-v2 when institutional.
  // SubmitProofRequest is one proof per call (spec unchanged).
  await submitProof(
    client,
    {
      docHash,
      circuitId: input.circuitId,
      proof: proof.proof,
      // Prefer prover public signals (multi-input circuits). Fall back to the
      // listing commitment when the SHA-256 prover path returns no signals.
      inputs: proof.inputs.length > 0 ? proof.inputs : [input.commitment],
    },
    input.environment,
  );

  if (listingProof !== undefined && binding !== undefined) {
    await submitProof(
      client,
      {
        docHash,
        circuitId: LISTING_BINDING_V2_CIRCUIT_ID,
        proof: listingProof.proof,
        inputs: listingProof.inputs.length > 0
          ? listingProof.inputs
          : [
              binding.listingRoot,
              binding.witness.commitment,
              binding.witness.orgDid,
              binding.witness.memberRoot,
              binding.witness.schemaId,
              binding.witness.priceUsdc,
            ],
      },
      input.environment,
    );
  }

  // ── 5. Compute listingRoot ──
  // With institutional binding: use the ZK-bound listingRoot (orgDid).
  // Without: client-side Poseidon5 with seller did (unchanged).
  const listingRootHex =
    binding !== undefined
      ? binding.listingRoot
      : (() => {
          const schemaIdScalar = toScalar(input.circuitId);
          const priceUsdc = toScalar(input.price.amount);
          const didScalar = toScalar(input.did);
          const salt = toScalar(randomHex(32));
          return bigintToHex(
            poseidon5([
              schemaIdScalar,
              BigInt(input.commitment),
              priceUsdc,
              didScalar,
              salt,
            ]),
          );
        })();

  const listing: Listing = Object.freeze({
    listingRoot: listingRootHex,
    schemaId: input.circuitId,
    commitment: input.commitment,
    did: input.did,
    price: input.price,
    cid: input.cid,
    perSchemaProof: {
      circuitId: input.circuitId,
      proof: proof.proof,
      inputs: proof.inputs.length > 0 ? proof.inputs : [input.commitment],
    },
    metadata: input.metadata,
    environment: input.environment,
    ...(signed !== undefined
      ? {
          signedCommitment: Object.freeze({
            signature: signed.signature,
            recoveredAddress: signed.recoveredAddress,
            randomness: signed.randomness,
          }),
        }
      : {}),
    createdAt: Date.now(),
  });

  // ── 6. Optional storefront upload (S2) ──
  // If a file is provided, auto-upload to POST /api/cards so the listing
  // is immediately visible to buyers. Skip when not provided (caller may
  // use list() separately or the dashboard handles its own upload).
  return input.file === undefined
    ? listing
    : Object.freeze({
        ...listing,
        cardId: (
          await list(client, {
            listing,
            file: input.file,
            category:
              input.category ??
              detectContentType({
                type: (input.file as { type?: string }).type ?? "",
                name: (input.file as { name: string }).name,
              }),
            priceUsdc: input.price.amount,
            environment: input.environment ?? "sandbox",
            payoutAddress: input.payoutAddress ?? "",
          })
        ).id,
      });
};

/* ------------------------------------------------------------------ */
/*  Content type detection utility (UI helper)                         */
/* ------------------------------------------------------------------ */

/** MIME type → content type detection (for browser File objects). */
const MIME_TO_CONTENT_TYPE: Readonly<Record<string, string>> = Object.freeze({
  "image/": "image",
  "video/": "other",
  "audio/": "audio",
  "text/csv": "dataset",
  "application/json": "code",
  "text/plain": "code",
  "text/html": "code",
  "text/javascript": "code",
  "text/typescript": "code",
  "application/xml": "code",
  "text/markdown": "document",
});

/** File extension → content type lookup. */
const EXT_TO_CONTENT_TYPE: Readonly<Record<string, string>> = Object.freeze({
  csv: "dataset",
  json: "code",
  jsonl: "code",
  md: "document",
  xml: "code",
  html: "code",
  htm: "code",
  js: "code",
  ts: "code",
  jsx: "code",
  tsx: "code",
  py: "code",
  rs: "code",
  go: "code",
  java: "code",
  sol: "code",
  vy: "code",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
  svg: "image",
});

/**
 * Detect content type from a browser File object.
 * Used by dashboard before publish to show a badge.
 */
export const detectContentType = (file: {
  readonly type: string;
  readonly name: string;
}): string =>
  MIME_TO_CONTENT_TYPE[file.type] ??
  Object.entries(MIME_TO_CONTENT_TYPE).find(
    ([key]) => key.endsWith("/") && file.type.startsWith(key),
  )?.[1] ??
  (EXT_TO_CONTENT_TYPE[
    file.name.split(".").at(-1)?.toLowerCase() ?? ""
  ] ?? "other");

/* ------------------------------------------------------------------ */
/*  list — upload listing to the Trust402 storefront (POST /api/cards) */
/* ------------------------------------------------------------------ */

/**
 * Input for `list()` — uploads the listing created by `publish()` to the
 * Trust402 dashboard storefront, making it visible to buyers.
 *
 * The `file` is the content being sold (stored in R2). `listing` is the
 * return value of `publish()`. `payoutAddress` is the seller's wallet
 * address for receiving x402 payments.
 */
export type ListInput = Readonly<{
  /** The listing object returned by `publish()`. */
  listing: Listing;
  /** Content file to upload (browser `File`, `Blob`, or `FileInput` object). */
  file: Blob | File | FileInput;
  /** Content category (e.g. "article", "code", "csv"). */
  category: string;
  /** Price in micro-USDC (6 decimals). Must match the listing price. */
  priceUsdc: number;
  /** Listing environment — determines billing network. */
  environment: "sandbox" | "production";
  /** Seller payout wallet address (0x-prefixed). Required when priceUsdc > 0. */
  payoutAddress: string;
}>;

/**
 * Upload a listing to the Trust402 storefront via `POST /api/cards`.
 *
 * `publish()` creates the ZK proof and computes `listingRoot` client-side;
 * `list()` uploads the file + listing metadata to the server so buyers can
 * discover and purchase it.
 *
 * Authentication: the client's `apiKey` is sent as `x-api-key` header.
 * The server resolves the account from the API key, so no browser session
 * is needed.
 */
export const list = async (
  client: LemmaClient,
  input: ListInput,
): Promise<{ id: string }> => {
  const url = `${client.apiBase}/api/cards`;
  const form = new FormData();

  // Convert FileInput to Blob for FormData. File and Blob pass through.
  const fileBlob =
    "body" in input.file
      ? new Blob([input.file.body], { type: input.file.type ?? "application/octet-stream" })
      : input.file;
  const fileName =
    "name" in input.file ? input.file.name : (fileBlob as File).name;
  form.append("file", fileBlob, fileName);
  form.append("category", input.category);
  form.append("price_usdc", String(input.priceUsdc));
  form.append("environment", input.environment);
  form.append("trust402_listing", JSON.stringify(input.listing));
  form.append("payout_address", input.payoutAddress);

  // Astro CSRF guard rejects cross-origin FormData POSTs without an
  // Origin header. Set it to the apiBase origin so server-side calls pass.
  // imperative: new URL() may throw synchronously — wrap in Promise to use
  // functional .catch() pattern instead of try-catch
  const origin = await new Promise<string | undefined>((resolve) => {
    // eslint-disable-next-line functional/no-try-statements
    try {
      resolve(new URL(client.apiBase).origin);
    } catch {
      resolve(undefined);
    }
  });

  const headers: Record<string, string> = {
    ...(client.apiKey !== undefined ? { "x-api-key": client.apiKey } : {}),
    ...(origin !== undefined ? { Origin: origin } : {}),
  };

  const res = await (client.fetcher ?? fetch)(url, {
    method: "POST",
    headers,
    body: form,
  });

  // imperative: guard clause with async body — no ternary can wrap await
  // eslint-disable-next-line functional/no-conditional-statements
  if (!res.ok) {
    const errBody = (await res
      .json()
      .catch((_err: unknown): Record<string, unknown> => ({}))) as Record<string, unknown>;
    throw new Error(
      `HTTP ${String(res.status)}: ${JSON.stringify(errBody)} (apiBase: ${client.apiBase}; apiKey: ${client.apiKey ? "set" : "unset"})`,
    );
  }

  const body = (await res.json()) as { id: string };
  return { id: body.id };
};
