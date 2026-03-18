/**
 * @lemmaoracle/sdk — Public API surface.
 *
 * Whitepaper §4.11 — API Summary.
 */
export { create } from "./client.js";
export { define } from "./schema.js";
export { encrypt, decrypt } from "./crypto.js";
export { prepare } from "./prepare.js";
export * as disclose from "./disclose.js";
export * as prover from "./prover.js";
export * as queryParser from "./query-parser.js";

export * as documents from "./namespaces/documents.js";
export * as proofs from "./namespaces/proofs.js";
export * as schemas from "./namespaces/schemas.js";
export * as circuits from "./namespaces/circuits.js";
export * as generators from "./namespaces/generators.js";
export * as attributes from "./namespaces/attributes.js";

/* Re-export spec types for convenience */
export type {
  LemmaClient,
  LemmaClientConfig,
  SchemaMeta,
  NormalizeArtifact,
  CircuitMeta,
  CircuitVerifier,
  ProofAlgId,
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
} from "@lemmaoracle/spec";
