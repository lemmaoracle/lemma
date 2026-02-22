/**
 * @lemma/spec — Authoritative interface types shared by SDK and Workers.
 * MUST remain identical (or semver-compatible) across both repositories.
 *
 * Whitepaper reference: §2, §3, §4.
 */

/* ── Client ────────────────────────────────────────────────────────── */

export type LemmaClientConfig = Readonly<{
  apiBase: string;
  apiKey?: string;
}>;

export type LemmaClient = LemmaClientConfig & Readonly<{
  readonly fetchFn?: typeof fetch;
}>;

/* ── Schema / Circuit / Generator metadata ─────────────────────────── */

export type SchemaMeta = Readonly<{
  id: string;
  description?: string;
  [k: string]: unknown;
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
  publicInputs?: ReadonlyArray<string>;
  verifier?: Readonly<{
    type: "onchain" | "offchain";
    contractAddress?: string;
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

export type DocumentCommitments = Readonly<{
  scheme?: string;
  attrCommitmentRoot: string;
  [k: string]: unknown;
}>;

export type Revocation = Readonly<{
  scheme?: string;
  revocationRoot: string;
  [k: string]: unknown;
}>;

export type IssuerSignature = Readonly<{
  format: "bbs+" | "opaque";
  payload: string;
  issuerId: string;
}>;

export type OnchainHook = Readonly<{
  chainId: number;
  contractAddress: string;
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
  commitments: DocumentCommitments;
  revocation: Revocation;
  signature?: IssuerSignature;
  onchainHooks?: ReadonlyArray<OnchainHook>;
}>;

export type RegisterDocumentResponse = Readonly<{
  status: "registered";
  docHash: string;
  [k: string]: unknown;
}>;

/* ── Proofs ─────────────────────────────────────────────────────────── */

export type SelectiveDisclosure = Readonly<{
  format: "bbs+" | "opaque";
  disclosedAttributes: Readonly<Record<string, unknown>>;
  proof: string;
}>;

export type SubmitProofRequest = Readonly<{
  docHash: string;
  circuitId: string;
  proofBytes: string;
  publicInputs: ReadonlyArray<string>;
  selectiveDisclosure?: SelectiveDisclosure;
  verifyOnchain?: boolean;
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
  selectiveDisclosure?: SelectiveDisclosure;
}>;

export type VerifiedAttributesQueryResponse = Readonly<{
  results: ReadonlyArray<VerifiedAttributesQueryResponseItem>;
}>;

/* ── Generic error ─────────────────────────────────────────────────── */

export type ErrorResponse = Readonly<{ error: string }>;
