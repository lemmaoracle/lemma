/**
 * Lemma extension of @x402/core/server RouteConfig — v0.2
 *
 * v0.2 additions:
 *  - bazaarDescription         (1-sentence semantic-search-friendly description)
 *  - bazaarInputSchemaRef      (absolute URL of input JSON Schema)
 *  - bazaarOutputSchemaRef     (absolute URL of output JSON Schema)
 *
 * These three feed into the 402 challenge response's accepts[].extra.bazaar
 * payload that the CDP facilitator consumes for Discovery Layer indexing.
 *
 * Rationale:
 *   - CDP auto-indexes routes that settle with discoverable: true. The
 *     metadata it needs (description / category / tags / inputSchema /
 *     outputSchema) all travel through the 402 challenge extension input.
 *   - See outputs/bazaar-listings/handoff-2026-05-20-register-on-first-settle.md
 *     §1.2 for the primary-source derivation.
 */
import type { RouteConfig as BaseRouteConfig } from "@x402/core/server";

export interface LemmaRouteConfig extends BaseRouteConfig {
  /**
   * When true, the route is auto-registered in x402 Bazaar after the first
   * successful settle via the CDP facilitator.
   *
   * Important: only the CDP facilitator (api.cdp.coinbase.com/platform/v2/x402)
   * triggers indexing. The x402.org community facilitator does NOT index to
   * the CDP Discovery Layer. See packages/x402/src/README.md.
   *
   * When set true, `schema`, `bazaarCategory`, and `bazaarDescription` are
   * all required at runtime; the middleware throws at construction time if
   * any is missing. (Compile-time strict union enforcement is deferred to
   * v0.3.)
   *
   * Setting `discoverable: false` (or omitting it) leaves the route priced
   * but invisible to the public Discovery Layer — no Bazaar metadata is
   * injected into the 402 challenge.
   */
  discoverable?: boolean;

  /**
   * Schema identifier surfaced as Bazaar extension input `name`.
   * Convention: kebab-case + version suffix, e.g.
   *   "agent-identity-authority-v1"
   *   "inference-attestation-v1"
   *   "compliance-bundle-v1"
   *   "seal-identity-v1"
   */
  schema?: string;

  /**
   * Bazaar category. One of the 7 official categories.
   */
  bazaarCategory?:
    | "Inference"
    | "Data"
    | "Media"
    | "Search"
    | "Social"
    | "Infrastructure"
    | "Trading";

  /**
   * Free-form sub-tags surfaced as semantic-search hints on Bazaar.
   * Each tag must match /^[a-z0-9-]+$/.
   */
  bazaarSubTags?: readonly string[];

  // ── v0.2 additions ────────────────────────────────────────────────

  /**
   * 1-sentence human-readable description injected into the 402 challenge
   * extension input. Surfaced verbatim on Bazaar Discovery Layer search.
   *
   * Best practices (lemma-internal):
   *  - Start with "For AI agents that need to {verb} {noun}, ..." for
   *    semantic-search alignment.
   *  - <= 256 chars.
   *  - Mention the value prop (zero-knowledge, no raw data, etc.) in the
   *    first 80 chars where possible.
   *
   * Required when discoverable: true.
   */
  bazaarDescription?: string;

  /**
   * Absolute URL of the input JSON Schema (Draft 2020-12). Referenced from
   * the 402 extension input so callers can validate before paying.
   *
   * Production convention:
   *   https://schemas.lemma.frame00.com/suites/product-<a|b|c|d>-input.json
   */
  bazaarInputSchemaRef?: string;

  /**
   * Absolute URL of the output JSON Schema (Draft 2020-12).
   */
  bazaarOutputSchemaRef?: string;
}

/**
 * Type guard: narrows an arbitrary x402 config to a LemmaRouteConfig.
 */
export const isLemmaRouteConfig = (
  config: BaseRouteConfig
): config is LemmaRouteConfig =>
  "discoverable" in config ||
  "schema" in config ||
  "bazaarCategory" in config ||
  "bazaarSubTags" in config ||
  "bazaarDescription" in config ||
  "bazaarInputSchemaRef" in config ||
  "bazaarOutputSchemaRef" in config;

/** Fail helper: sync validation barrier — throw is the only call-site abort. */
const failConfigured = (message: string): never => {
  // imperative: sync validation barrier must throw — no functional alternative
  // eslint-disable-next-line functional/no-throw-statements
  throw new Error(message);
};

/**
 * Runtime validation for v0.2's "discoverable implies metadata" contract.
 *
 * Called by bazaarPaymentMiddleware at construction time. Throws synchronously
 * on misconfiguration so the failure surfaces at deploy time, not on first
 * incoming request.
 */
export const assertDiscoverableConfigured = (config: LemmaRouteConfig): void =>
  // imperative: void discards the throw-branch; eslint doesn't track never-return — no meaningful alternative
  // eslint-disable-next-line @typescript-eslint/no-meaningless-void-operator
  void (config.discoverable
    ? ((missing: ReadonlyArray<string>) =>
        missing.length > 0
          ? failConfigured(
              `[LemmaRouteConfig] discoverable: true requires ${missing.join(", ")}. ` +
                `See packages/x402/src/README.md for the discoverable contract.`,
            )
          : config.bazaarDescription && config.bazaarDescription.length > 256
            ? failConfigured(
                `[LemmaRouteConfig] bazaarDescription exceeds 256 chars (got ${String(config.bazaarDescription.length)}). ` +
                  `Bazaar search hits favour concise descriptions; trim before deploy.`,
              )
            : null)(
          (["schema", "bazaarCategory", "bazaarDescription"] as const).filter(
            (field) => !config[field],
          ),
        )
    : null);