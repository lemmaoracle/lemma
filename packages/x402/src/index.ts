/**
 * @lemmaoracle/x402 -- drop-in replacement for @x402/* on the resource server side.
 *
 * Re-exports the standard x402 integration surface (HTTPFacilitatorClient,
 * x402ResourceServer, paymentMiddleware, ExactEvmScheme, x402Client), with
 * automatic Lemma capability wired internally:
 *
 *   - x402ResourceServer is subclassed: auto-attaches Lemma onAfterSettle hook
 *     that orchestrates documents.register -> prover.prove -> proofs.submit.
 *
 *   - paymentMiddleware is decorated: auto-enriches routes with Lemma discovery
 *     metadata from LEMMA_DISCOVERY_CONFIG env var.
 *
 * Usage is identical to @x402/* -- just change the import source:
 *
 *   import { HTTPFacilitatorClient, x402ResourceServer,
 *            paymentMiddleware, ExactEvmScheme }
 *     from "@lemmaoracle/x402";
 *
 * For advanced tuning (custom discovery, custom submission handler), import
 * from "@lemmaoracle/x402/advanced".
 */

// Re-exports from @x402 (x402-compatible surface)
export { HTTPFacilitatorClient } from "@x402/core/server";

// Augmented versions (identical public API, internal Lemma wiring)
export { x402ResourceServer } from "./lemma-server.js";
export { paymentMiddleware } from "./lemma-discovery.js";

// Additional x402 re-exports
export { ExactEvmScheme } from "@x402/evm/exact/server";
export { x402Client } from "@x402/core/client";

// Types
export type { Network, PaymentRequirements, PaymentPayload } from "@x402/core/types";
export type { FacilitatorConfig } from "@x402/core/server";
export type { LemmaConfig } from "./lemma-config.js";
