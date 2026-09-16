/**
 * @lemmaoracle/verify — Lemma's verification SDK.
 *
 * One surface for the prove + verify cycle against circuits:
 *
 *   - `prove` — generate a ZK proof for a circuit (sugar over `prover.prove`,
 *     with a CID-keyed caching fetcher for the wasm/zkey artifacts).
 *   - `guardrail` — circuit-agnostic ZK proof verification (the single proof
 *     gate any execution path can drop in).
 *   - `settlement` — on-chain settlement (着金) verification (future).
 *
 * `guardrail` takes `circuitId + proof + publicSignals`, resolves the
 * circuit's verification key, and verifies — with `throw` / return-error
 * semantics. It never interprets `publicSignals`; what those signals must
 * equal is a separate policy layer.
 */

export { guardrail, guardrailError } from "./guardrail.js";
export type { GuardrailError } from "./guardrail.js";
export { createCircuitResolver } from "./resolver.js";
export { prove } from "./prove.js";
export type { ProveConfig, ProveInput } from "./prove.js";
export { createCachingFetcher } from "./cache.js";
export type { CachingFetcherConfig } from "./cache.js";
export { settlement } from "./settlement.js";
export type {
  SettlementExpectation,
  SettlementResult,
} from "./settlement.js";
export type {
  CircuitResolver,
  GuardrailConfig,
  GuardrailOptions,
  GuardrailResult,
  ResolvedCircuit,
  Verifier,
} from "./types.js";
