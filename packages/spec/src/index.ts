/**
 * @lemmaoracle/spec — Authoritative interface types shared by SDK and Workers.
 * MUST remain identical (or semver-compatible) across both repositories.
 *
 * Whitepaper reference: §2, §3, §4.
 */

/* ── Client ────────────────────────────────────────────────────────── */

export type LemmaClientConfig = Readonly<{
  apiBase?: string;
  apiKey?: string;
  defaultChainId?: number; // Default chain ID for operations (optional)
}>;

export type LemmaClient = Readonly<{
    apiBase: string;
    apiKey?: string;
    defaultChainId?: number;
    fetcher?: typeof fetch;
  }>;

/* ── Schema / Circuit / Generator metadata ─────────────────────────── */

export type SchemaMeta = Readonly<{
  id: string;
  description?: string;
  normalize: NormalizeArtifact;
  [k: string]: unknown;
}>;

export type NormalizeArtifact = Readonly<{
  artifact: {
    readonly type: "ipfs" | "https";
    readonly wasm: string;
    readonly js: string; // wasm-bindgen JS shim URL (required for instantiation)
  };
  hash: string;
  abi?: {
    readonly raw: Record<string, string>;
    readonly norm: Record<string, string>;
  };
}>;

export type CircuitArtifactLocation = Readonly<{
  type: "ipfs" | "https";
  wasm: string;
  zkey: string;
  vkey?: string;
}>;

export type ProofAlgId = "groth16-bn254-snarkjs"; // snarkjs — pA/pB/pC + uint[N] pubSignals

export type CircuitVerifier = Readonly<{
  type: "onchain" | "offchain";
  address?: string;
  chainId?: number;
  alg?: ProofAlgId; // ← これだけ
  [k: string]: unknown;
}>;

export type CircuitMeta = Readonly<{
  circuitId: string;
  schema: string;
  description?: string;
  inputs?: ReadonlyArray<string>;
  verifiers?: ReadonlyArray<CircuitVerifier>;
  artifact?: Readonly<{ location: CircuitArtifactLocation }>;
  [k: string]: unknown;
}>;

export type GeneratorMeta = Readonly<{
  generatorId: string;
  schema: string;
  description?: string;
  language?: string;
  source?: Readonly<{ type: "url"; uri: string }>;
  inputsSpec?: Readonly<Record<string, unknown>>;
  outputsSpec?: Readonly<Record<string, unknown>>;
  [k: string]: unknown;
}>;

/* ── Document registration ─────────────────────────────────────────── */

export type CommitmentScheme = "poseidon" | "poseidon2" | "rescue-prime" | "sha256-placeholder";

export type DocumentCommitments = Readonly<{
  scheme: CommitmentScheme;
  root: string;
  leaves: ReadonlyArray<string>;
  randomness: string; // bytes32 hex - blinding factor for hiding property
}>;

/**
 * Inclusion proof for a single leaf within an accumulator.
 *
 * For tree-based accumulators (Poseidon Merkle, Verkle, etc.)
 * `siblings[i]` is the co-path hash at depth i and
 * `indices[i]` encodes position (0 = left, 1 = right for binary trees).
 */
export type InclusionProof = Readonly<{
  siblings: ReadonlyArray<string>;
  indices: ReadonlyArray<number>;
}>;

/**
 * The pre-image components that were hashed to produce a single leaf.
 * Scheme-agnostic: any commitment scheme produces leaves from (name, value, blinding).
 */
export type LeafPreimage = Readonly<{
  /** Attribute name (original string, e.g. "task_bucket") */
  name: string;
  /** Attribute value (original type preserved: string or number) */
  value: string | number;
  /** name  encoded as a field element / hash input (hex) */
  nameHash: string;
  /** value encoded as a field element / hash input (hex) */
  valueHash: string;
  /** Blinding / randomness encoded as a field element / hash input (hex) */
  blindingHash: string;
}>;

export type Revocation = Readonly<{
  scheme?: string;
  root: string;
  [k: string]: unknown;
}>;

export type IssuerSignature = Readonly<{
  format: "bbs+" | "opaque";
  payload: string;
  issuerId: string;
}>;

export type OnchainHook = Readonly<{
  chainId: number;
  address: string;
  method: string;
  mode?: "after-registry";
  payload?: "registry-public-inputs";
  [k: string]: unknown;
}>;

export type RegisterDocumentRequest = Readonly<{
  schema: string;
  docHash: string;
  cid: string;
  /** Issuer identifier (DID, address, or any string). Hashed to bytes32 via keccak256 for on-chain storage. */
  issuerId: string;
  /** Subject/holder identifier (DID, address, or any string). Hashed to bytes32 via keccak256 for on-chain storage. */
  subjectId: string;
  chainId?: number; // Primary chain for document registration (optional)
  attributes?: Readonly<Record<string, unknown>>;
  commitments: DocumentCommitments;
  revocation: Revocation;
  signature?: IssuerSignature;
  hooks?: ReadonlyArray<OnchainHook>;
}>;

export type RegisterDocumentResponse = Readonly<{
  status: "registered";
  docHash: string;
  [k: string]: unknown;
}>;

/* ── Proofs ─────────────────────────────────────────────────────────── */

export type SelectiveDisclosure = Readonly<{
  format: "bbs+" | "opaque";
  attributes: Readonly<Record<string, unknown>>;
  proof: string;
  /** Issuer BLS12-381 public key (hex). Required for BBS+ proof verification. */
  publicKey: string;
  /** Indexes of disclosed messages within the original signed message array. */
  indexes: ReadonlyArray<number>;
  /** Total number of messages in the original BBS+ signature. */
  count: number;
  /** Header bytes used during BBS+ signing (hex). */
  header: string;
  /**
   * Optional access condition. When set, callers must supply a valid ZK proof
   * satisfying this circuit to read the selective disclosure data.
   */
  condition?: Readonly<{ circuitId: string }>;
}>;

export type SubmitProofRequest = Readonly<{
  docHash: string;
  circuitId: string;
  proof: string;
  inputs: ReadonlyArray<string>;
  chainId?: number; // Target chain for on-chain verification (optional)
  disclosure?: SelectiveDisclosure;
  onchain?: boolean;
}>;

export type SubmitProofResponse = Readonly<{
  status: "received" | "verified" | "onchain-verified" | "rejected";
  verificationId: string;
  [k: string]: unknown;
}>;

/* ── Verified attributes query ─────────────────────────────────────── */

export type VerifiedAttributesQueryRequest = Readonly<{
  /** Filter by specific document hash (optional). */
  docHash?: string;
  attributes: ReadonlyArray<
    Readonly<{
      name: string;
      operator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
      value: unknown;
    }>
  >;
  proof?: Readonly<{ required: boolean; type?: "zk-snark" | "opaque" }>;
  targets?: Readonly<
    {
      schemas?: ReadonlyArray<string>;
      chainIds?: ReadonlyArray<number>;
    } & Record<string, unknown>
  >;
  /**
   * Opt-in disclosure access. Provide a ZK proof satisfying any condition
   * attached to stored disclosures. Without this field, disclosures are
   * never returned (privacy-by-default).
   */
  disclosure?: Readonly<{
    proof: string;
    inputs: ReadonlyArray<string>;
  }>;
  /** Maximum number of results per page (1–200, default 50). */
  limit?: number;
  /** Number of results to skip for pagination (default 0). */
  offset?: number;
}>;

export type VerifiedAttributesQueryResponseItem = Readonly<{
  docHash: string;
  schema: string;
  issuerId: string;
  subjectId: string;
  chainId?: number; // Chain ID for cross-chain source identification
  attributes: Readonly<Record<string, unknown>>;
  proof?: Readonly<
    { status?: string; circuitId?: string; chainId?: number } & Record<string, unknown>
  >;
  disclosure?: SelectiveDisclosure | null;
  /** Present when the caller's proof did not satisfy the stored disclosure condition. */
  disclosureError?: "condition_not_met";
}>;

export type VerifiedAttributesQueryResponse = Readonly<{
  results: ReadonlyArray<VerifiedAttributesQueryResponseItem>;
  /** Whether more results exist beyond the current page. */
  hasMore: boolean;
}>;

/* ── Generic error ─────────────────────────────────────────────────── */

export type ErrorResponse = Readonly<{ error: string }>;

/* ── Bazaar product schemas ────────────────────────────────────────── */

/**
 * The four Lemma × x402 Bazaar products. Each ships an input and an output
 * JSON Schema (Draft 2020-12) under `packages/spec/schemas/suites/`.
 *
 *  - product-a — Agent Identity Issuance
 *  - product-b — Inference Attestation API
 *  - product-c — Compliance Bundle (Basic)
 *  - product-d — ZK Proof Sign-in (Proof-as-Auth)
 */
export type BazaarProduct = "product-a" | "product-b" | "product-c" | "product-d";

/** Input/output JSON Schema file pair for a Bazaar product. */
export type BazaarSchemaPair = Readonly<{
  /** Schema file describing the request body. */
  input: string;
  /** Schema file describing the response body. */
  output: string;
}>;

/**
 * Maps each Bazaar product to its input/output JSON Schema file name
 * (relative to `packages/spec/schemas/suites/`). Load a schema with an import
 * attribute, e.g.
 *
 * ```ts
 * import schema from "@lemmaoracle/spec/schemas/suites/product-a-input.json" with { type: "json" };
 * ```
 *
 * TODO(W1): the canonical Bazaar discovery identifier surfaced via
 * `LemmaRouteConfig.schema` (e.g. "inference-attestation-v1") is finalised
 * alongside the 5/20 RouteConfig decision.
 */
export const BAZAAR_SCHEMA_FILES = {
  "product-a": { input: "product-a-input.json", output: "product-a-output.json" },
  "product-b": { input: "product-b-input.json", output: "product-b-output.json" },
  "product-c": { input: "product-c-input.json", output: "product-c-output.json" },
  "product-d": { input: "product-d-input.json", output: "product-d-output.json" },
} as const satisfies Readonly<Record<BazaarProduct, BazaarSchemaPair>>;
