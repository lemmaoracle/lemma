/**
 * LemmaConfig -- configuration types for Lemma-x402 integration.
 *
 * Supports two injection paths:
 *   1. Env-based: LEMMA_CONFIG env var (JSON string)
 *   2. Explicit: passed directly to augmented x402ResourceServer constructor
 *
 * The augmented x402ResourceServer reads from explicit config first,
 * falling back to LEMMA_CONFIG env var if no explicit config is provided.
 */

/** Per-route discovery metadata applied to x402 route accepts[].extra. */
type LemmaRouteDiscovery = Readonly<{
  /** Schemas this route exposes for discovery */
  schemas?: ReadonlyArray<string>;
  /** Hints passed in the discovery extension (e.g. verifiable attributes) */
  hints?: Readonly<Record<string, unknown>>;
}>;

/** Global + per-route discovery configuration for auto-enrichment. */
type LemmaDiscoveryConfig = Readonly<{
  /** Global schema info applied to all routes */
  schemas?: ReadonlyArray<string>;
  /** Global hints applied to all routes */
  hints?: Readonly<Record<string, unknown>>;
  /** Per-route overrides (keyed by route path pattern, e.g. "GET /verify/:hash") */
  routes?: Readonly<Record<string, LemmaRouteDiscovery>>;
}>;

/** Configuration for Lemma-x402 integration. */
type LemmaConfig = Readonly<{
  /** Lemma API base URL (defaults to "https://workers.lemma.workers.dev" via @lemmaoracle/sdk) */
  apiBase?: string;
  /** Lemma API key (optional) */
  apiKey?: string;
  /** Circuit ID used for proof generation (defaults to "x402-payment-v1") */
  circuitId?: string;
  /** Relay URL for prover.prove (runs on Node.js, not Workers) */
  relayUrl?: string;
  /** Discovery configuration for auto-enriching x402 routes */
  discovery?: LemmaDiscoveryConfig;
}>;

/** LemmaConfig with defaults applied — all fields required. */
type ResolvedLemmaConfig = Readonly<
  & Omit<LemmaConfig, "apiBase" | "circuitId">
  & { readonly apiBase: string; readonly circuitId: string }
>;

export type {
  LemmaConfig,
  LemmaDiscoveryConfig,
  LemmaRouteDiscovery,
  ResolvedLemmaConfig,
};
