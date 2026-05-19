/**
 * Lemma wrapper around the upstream x402 payment middleware.
 *
 * Forwards the call to the upstream middleware while:
 *   1. Attaching Bazaar discoverability metadata to the Hono context so the
 *      settle hook can register the route in the Discovery Layer on first call.
 *   2. Emitting Lemma-canonical response headers (e.g. X-Lemma-Bazaar-Schema)
 *      for downstream auditing.
 *
 * Implementation note: this wraps `paymentMiddlewareFromConfig` from
 * `@x402/hono`, which accepts a single `RouteConfig` (a valid `RoutesConfig`)
 * and builds the resource server from facilitator config. The upstream library
 * ignores unknown keys, so the extra Bazaar fields on `LemmaRouteConfig` are
 * passed through harmlessly; future versions may consume them.
 *
 * TODO(W1): wire the actual "register-on-first-settle" hook into Lemma's
 *           settle handler. See `onSettleSuccess` callback below.
 */
import type { Context, MiddlewareHandler, Next } from "hono";
import { paymentMiddlewareFromConfig as upstreamPaymentMiddleware } from "@x402/hono";

import type { LemmaRouteConfig } from "./routeConfig.js";

/**
 * Context variables set by the Bazaar middleware so downstream handlers
 * and settle hooks can read them without re-deriving from config.
 */
export interface BazaarContextVariables {
  "lemma:bazaar:discoverable": boolean;
  "lemma:bazaar:schema": string | undefined;
  "lemma:bazaar:category": LemmaRouteConfig["bazaarCategory"] | undefined;
  "lemma:bazaar:subTags": readonly string[] | undefined;
}

/**
 * Drop-in payment middleware for Bazaar-discoverable routes.
 *
 * @example
 * ```ts
 * app.use(
 *   "/v1/bazaar/inference/attest",
 *   bazaarPaymentMiddleware({
 *     accepts: {
 *       // standard x402 PaymentOption (recipient, amount, network, ...)
 *     },
 *     discoverable: true,
 *     schema: "inference-attestation-v1",
 *     bazaarCategory: "Inference",
 *     bazaarSubTags: ["verifiable-ai", "audit-trail", "claim-check"],
 *   })
 * );
 * ```
 */
export const bazaarPaymentMiddleware = (
  config: LemmaRouteConfig
): MiddlewareHandler => {
  // Forward the full config (including Bazaar fields the upstream ignores)
  // to the upstream middleware. A single RouteConfig is a valid RoutesConfig.
  const upstream = upstreamPaymentMiddleware(config);

  return async (c: Context, next: Next) => {
    if (config.discoverable) {
      c.set(
        "lemma:bazaar:discoverable",
        true satisfies BazaarContextVariables["lemma:bazaar:discoverable"]
      );
      c.set(
        "lemma:bazaar:schema",
        config.schema satisfies BazaarContextVariables["lemma:bazaar:schema"]
      );
      c.set(
        "lemma:bazaar:category",
        config.bazaarCategory satisfies BazaarContextVariables["lemma:bazaar:category"]
      );
      c.set(
        "lemma:bazaar:subTags",
        config.bazaarSubTags satisfies BazaarContextVariables["lemma:bazaar:subTags"]
      );
    }

    // Run upstream middleware (payment verification, settle, error handling).
    await upstream(c, next);

    // After the handler completes, surface Bazaar metadata as response headers
    // for transparent downstream consumption (e.g. `agentic.market` curated tooling).
    if (config.discoverable && c.res) {
      if (config.schema) c.header("X-Lemma-Bazaar-Schema", config.schema);
      if (config.bazaarCategory)
        c.header("X-Lemma-Bazaar-Category", config.bazaarCategory);
    }
  };
};

/**
 * Hook called by Lemma's settle pipeline on first successful settle of a
 * discoverable route. Registers the route with the CDP Bazaar Discovery
 * Layer if not already registered.
 *
 * TODO(W1): wire this into the settle path in Lemma Workers. The current
 *           upstream payment middleware calls a configurable callback after
 *           settle; pass this function in via `config.onSettleSuccess` once
 *           the exact callback name is confirmed.
 */
export const registerBazaarRouteOnFirstSettle = async (
  c: Context,
  ctx: {
    routePath: string;
    schema?: string;
    category?: string;
    subTags?: readonly string[];
  }
): Promise<void> => {
  // TODO(W1): replace with the actual CDP discovery push call. The CDP
  // facilitator currently auto-indexes any route that settles with
  // `discoverable: true`, so this hook may become a no-op + analytics emit only.
  console.info("[lemma:bazaar] would register route", ctx.routePath, ctx);
};
