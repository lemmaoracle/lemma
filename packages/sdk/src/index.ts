/**
 * @lemmaoracle/sdk — Public API surface.
 *
 * Whitepaper §4.11 — API Summary.
 *
 * Note: Natural language query parsing has been extracted to @lemmaoracle/parser.
 */
export { create } from "./client.js";
export { define } from "./schema.js";
export { encrypt, decrypt, derivePublicKey } from "./crypto.js";
export { commit, poseidon, toScalar } from "./commitments.js";
export { prepare, normalize } from "./prepare.js";
export type { PrepareInput } from "./prepare.js";
export type { PrepareOutput } from "./commitments.js";
export type { SchemaDef } from "./schema.js";
export * as disclose from "./disclose.js";
export * as prover from "./prover.js";
export type { ProveOutput } from "./prover.js";
export * as verifier from "./verifier.js";
export type { VerifyInput, VerifyOutput } from "./verifier.js";

export * as documents from "./namespaces/documents.js";
export * as proofs from "./namespaces/proofs.js";
export * as schemas from "./namespaces/schemas.js";
export * as circuits from "./namespaces/circuits.js";
export * as generators from "./namespaces/generators.js";
export * as attributes from "./namespaces/attributes.js";
export * as trust402 from "./namespaces/trust402.js";

/* Re-export spec types for convenience */
export type {
  Trust402PublishInput,
  Trust402Listing,
} from "./namespaces/trust402.js";

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
  InclusionProof,
  LeafPreimage,
  Revocation,
  IssuerSignature,
  OnchainHook,
} from "@lemmaoracle/spec";
