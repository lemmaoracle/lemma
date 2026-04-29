/**
 * Augmented paymentMiddleware -- decorates the original middleware with
 * automatic Lemma discovery metadata enrichment.
 *
 * Re-exported from root as paymentMiddleware. Same function signature as
 * the original from @x402/hono. Before delegating to the real middleware,
 * it enriches each route's .accepts[].extra with Lemma discovery metadata.
 *
 * Discovery metadata is resolved from:
 *   1. LEMMA_DISCOVERY_CONFIG env var (JSON string)
 *   2. LEMMA_CONFIG env var (JSON string) -- discovery field
 *   3. Explicit discovery config (if provided)
 */

import { paymentMiddleware as basePaymentMiddleware } from "@x402/hono";
import type { PaywallConfig, PaywallProvider } from "@x402/hono";
import type { x402ResourceServer, RoutesConfig } from "@x402/core/server";
import type { MiddlewareHandler } from "hono";
import type {
  LemmaDiscoveryConfig,
  LemmaRouteDiscovery,
} from "./lemma-config.js";

/** Resolve discovery config from env. */
const resolveDiscoveryConfig = (): LemmaDiscoveryConfig | undefined => {
  const raw =
    typeof process !== "undefined"
      ? (process.env.LEMMA_DISCOVERY_CONFIG ?? process.env.LEMMA_CONFIG)
      : undefined;

  return !raw
    ? undefined
    : (() => {
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          // If LEMMA_CONFIG, extract discovery sub-object; otherwise use root
          const discovery = (parsed.discovery ?? parsed) as Record<
            string,
            unknown
          >;

          return discovery.schemas || discovery.hints || discovery.routes
            ? ({
                schemas: discovery.schemas as string[] | undefined,
                hints: discovery.hints as
                  | Record<string, unknown>
                  | undefined,
                routes: discovery.routes as
                  | Record<string, LemmaRouteDiscovery>
                  | undefined,
              })
            : undefined;
        } catch {
          return undefined;
        }
      })();
};

/** Merge global discovery config with per-route overrides. */
const discoveryForRoute = (
  routePattern: string,
  config: LemmaDiscoveryConfig | undefined,
): Record<string, unknown> | undefined => {
  if (!config) return undefined;

  const global: Record<string, unknown> = {
    ...(config.schemas ? { schemas: config.schemas } : {}),
    ...(config.hints ?? {}),
  };

  const perRoute = config.routes?.[routePattern];

  const merged = {
    ...global,
    ...(perRoute?.schemas ? { schemas: perRoute.schemas } : {}),
    ...(perRoute?.hints ?? {}),
  };

  return Object.keys(merged).length > 0 ? merged : undefined;
};

/**
 * Augmented paymentMiddleware.
 *
 * Enriches routes with Lemma discovery metadata before delegating to the
 * real middleware. Signature is identical to the original:
 *
 *   paymentMiddleware(
 *     routes: RoutesConfig,
 *     server: x402ResourceServer,
 *     paywallConfig?: PaywallConfig,
 *     paywall?: PaywallProvider,
 *     syncFacilitatorOnStart?: boolean,
 *   ): MiddlewareHandler
 */
const paymentMiddleware = (
  routes: RoutesConfig,
  server: x402ResourceServer,
  paywallConfig?: PaywallConfig,
  paywall?: PaywallProvider,
  syncFacilitatorOnStart?: boolean,
): MiddlewareHandler => {
  const discoveryConfig = resolveDiscoveryConfig();

  // If no discovery config, delegate directly (no enrichment)
  if (!discoveryConfig) {
    return basePaymentMiddleware(
      routes,
      server,
      paywallConfig,
      paywall,
      syncFacilitatorOnStart,
    );
  }

  // Enrich each route with discovery metadata
  const enrichedRoutes: Record<string, unknown> = {};

  const routeKeys = Object.keys(routes);
  for (const routePattern of routeKeys) {
    const routeConfig = (routes as unknown as Record<string, Record<string, unknown>>)[
      routePattern
    ];
    const discovery = discoveryForRoute(routePattern, discoveryConfig);

    const enrichedRouteConfig = discovery
      ? {
          ...routeConfig,
          accepts: (
            (routeConfig?.accepts as ReadonlyArray<Record<string, unknown>>) ??
            []
          ).map((accept) => ({
            ...accept,
            extra: {
              ...((accept?.extra as Record<string, unknown>) ?? {}),
              lemma: {
                ...(((accept?.extra as Record<string, unknown>)?.lemma as
                  | Record<string, unknown>
                  | undefined) ?? {}),
                ...discovery,
              },
            },
          })),
        }
      : routeConfig;

    enrichedRoutes[routePattern] = enrichedRouteConfig;
  }

  return basePaymentMiddleware(
    enrichedRoutes as RoutesConfig,
    server,
    paywallConfig,
    paywall,
    syncFacilitatorOnStart,
  );
};

export { paymentMiddleware };
export { resolveDiscoveryConfig };
