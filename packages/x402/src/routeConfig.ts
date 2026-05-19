/**
 * Lemma extension of the x402 RouteConfig.
 *
 * Adds Bazaar-specific fields that are not present in the upstream type as of 2026-05.
 * Long-term we should upstream this via PR, but for MVP we extend locally.
 *
 * The upstream `RouteConfig` is exported from `@x402/core/server` (re-exported
 * by `@x402/hono`). If a future upstream PR adds `discoverable`, this extension
 * becomes a no-op.
 */
import type { RouteConfig as BaseRouteConfig } from "@x402/core/server";

/**
 * Lemma route configuration extending the upstream x402 RouteConfig with
 * Bazaar discoverability metadata and a schema identifier surfaced in the
 * Bazaar Discovery Layer.
 */
export interface LemmaRouteConfig extends BaseRouteConfig {
  /**
   * When true, the route is auto-registered in x402 Bazaar after the first
   * successful settle. See https://docs.cdp.coinbase.com/x402/bazaar.
   *
   * Defaults to false to preserve existing behaviour for routes that are
   * priced but not intended for the public discovery layer.
   */
  discoverable?: boolean;

  /**
   * Optional schema identifier for Bazaar metadata, e.g.
   * "agent-identity-authority-v1", "inference-attestation-v1",
   * "compliance-bundle-v1", "seal-identity-v1".
   *
   * Used by downstream tooling (`agentic.market` curated listings,
   * Lemma's own SDK clients) to bind the route to a known data shape.
   */
  schema?: string;

  /**
   * Optional Bazaar category override. Defaults inferred from the schema
   * when omitted. One of the 7 Bazaar categories:
   * "Inference" | "Data" | "Media" | "Search" | "Social" | "Infrastructure" | "Trading".
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
   * Optional free-form sub-tags surfaced as semantic-search hints on Bazaar.
   * Each tag must match /^[a-z0-9-]+$/.
   */
  bazaarSubTags?: readonly string[];
}

/**
 * Type guard: narrows an arbitrary x402 config to a LemmaRouteConfig.
 */
export const isLemmaRouteConfig = (
  config: BaseRouteConfig
): config is LemmaRouteConfig => {
  return (
    "discoverable" in config ||
    "schema" in config ||
    "bazaarCategory" in config ||
    "bazaarSubTags" in config
  );
};
