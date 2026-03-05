/**
 * @lemma/sdk — Public API surface.
 *
 * Whitepaper §4.11 — API Summary.
 */
export { create } from "./client";
export { define } from "./schema";
export { encrypt, decrypt } from "./crypto";
export { prepare } from "./prepare";
export * as disclose from "./disclose";
export * as prover from "./prover";

export * as documents from "./namespaces/documents";
export * as proofs from "./namespaces/proofs";
export * as schemas from "./namespaces/schemas";
export * as circuits from "./namespaces/circuits";
export * as generators from "./namespaces/generators";
export * as attributes from "./namespaces/attributes";

/* Re-export spec types for convenience */
export type {
  LemmaClient,
  LemmaClientConfig,
  SchemaMeta,
  CircuitMeta,
  GeneratorMeta,
  RegisterDocumentRequest,
  RegisterDocumentResponse,
  SubmitProofRequest,
  SubmitProofResponse,
  SelectiveDisclosure,
  VerifiedAttributesQueryRequest,
  VerifiedAttributesQueryResponse,
  CommitmentScheme,
  DocumentCommitments,
  Revocation,
  IssuerSignature,
  OnchainHook,
} from "@lemma/spec";
