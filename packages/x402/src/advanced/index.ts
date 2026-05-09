/**
 * @lemmaoracle/x402/advanced -- optional override hooks.
 *
 * Import from this path only if you need fine-grained control over:
 *   - Discovery metadata injection (configureLemmaDiscovery)
 *   - Lemma submission orchestration (createLemmaSubmissionHandler)
 *
 * For normal usage, import from "@lemmaoracle/x402" directly.
 */

// Discovery configuration override
export { resolveDiscoveryConfig } from "../lemma-discovery.js";

// Submission handler factory (for custom orchestration)
export { createLemmaSubmissionHandler } from "../lemma-submission.js";
export type { SubmissionContext } from "../lemma-submission.js";

// Config types
export type {
  LemmaConfig,
  LemmaDiscoveryConfig,
  LemmaRouteDiscovery,
} from "../lemma-config.js";
