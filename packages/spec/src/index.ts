/**
 * @lemmaoracle/spec — Authoritative interface types shared by SDK and Workers.
 * MUST remain identical (or semver-compatible) across both repositories.
 *
 * Whitepaper reference: §2, §3, §4.
 */

/* ── Client ────────────────────────────────────────────────────────── */

export type LemmaClientConfig = Readonly<{
  apiBase: string;
  apiKey?: string;
}>;

export type LemmaClient = LemmaClientConfig &
  Readonly<{
    readonly fetcher?: typeof fetch;
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
}>;

export type CircuitMeta = Readonly<{
  circuitId: string;
  schema: string;
  description?: string;
  inputs?: ReadonlyArray<string>;
  verifier?: Readonly<{
    type: "onchain" | "offchain";
    address?: string;
    chainId?: number;
    [k: string]: unknown;
  }>;
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
  issuerId: string;
  subjectId: string;
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
}>;

export type SubmitProofRequest = Readonly<{
  docHash: string;
  circuitId: string;
  proof: string;
  inputs: ReadonlyArray<string>;
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
  query: string;
  mode: "natural" | "structured";
  attributes?: ReadonlyArray<Readonly<{ name: string; value: unknown }>>;
  proof?: Readonly<{ required: boolean; type?: "zk-snark" | "opaque" }>;
  targets?: Readonly<{ schemas?: ReadonlyArray<string> } & Record<string, unknown>>;
}>;

export type VerifiedAttributesQueryResponseItem = Readonly<{
  docHash: string;
  schema: string;
  issuerId: string;
  subjectId: string;
  attributes: Readonly<Record<string, unknown>>;
  proof?: Readonly<{ status?: string; circuitId?: string } & Record<string, unknown>>;
  disclosure?: SelectiveDisclosure;
}>;

export type VerifiedAttributesQueryResponse = Readonly<{
  results: ReadonlyArray<VerifiedAttributesQueryResponseItem>;
}>;

/* ── Generic error ─────────────────────────────────────────────────── */

export type ErrorResponse = Readonly<{ error: string }>;
