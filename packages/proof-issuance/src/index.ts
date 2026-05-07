/**
 * @lemmaoracle/proof-issuance
 *
 * Proof Issuance API — x402/Bazaar product concept demo.
 *
 * Re-exports the public surface for consumers.
 */

// Server
export { createApp, app } from "./server/app.js";

// Library
export { issueProof, issueProofWithPayment, isSupportedSchema } from "./lib/proof-engine.js";
export { buildDiscoveryExtension } from "./lib/discovery.js";

// Types
export type {
  ProofIssueRequest,
  ProofResponse,
  ModelAttestation,
  InputAttestation,
  OutputAttestation,
  DecisionContext,
  CryptographicEnvelope,
  BaseAttributes,
  HealthResponse,
  DiscoveryExtension,
} from "./lib/types.js";
