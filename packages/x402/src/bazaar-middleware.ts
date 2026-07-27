/**
 * Lemma wrapper around the upstream x402 paymentMiddleware — v0.2
 *
 * v0.2 changes (vs v0.1 in lemma/#222):
 *   1. Inject Bazaar extension input into the 402 challenge's accepts[].extra
 *      so the CDP facilitator auto-indexes the route on first settle.
 *   2. Parse the settle response's EXTENSION-RESPONSES header and emit a
 *      structured BazaarStatusEvent for observability (independent of settle
 *      outcome — discovery failures never break payment).
 *   3. Validate the "discoverable implies metadata" contract at construction
 *      time (assertDiscoverableConfigured).
 *
 * Rationale:
 *   - outputs/bazaar-listings/handoff-2026-05-20-register-on-first-settle.md
 *   - lemma/#222 residual TODO 1/3
 */
import type { Context, MiddlewareHandler, Next } from "hono";
import { paymentMiddlewareFromConfig as upstreamPaymentMiddleware } from "@x402/hono";

import {
  assertDiscoverableConfigured,
  type LemmaRouteConfig,
} from "./routeConfig.js";
import {
  getBazaarStatusEmitter,
  parseBazaarStatus,
} from "./bazaar-status-emitter.js";

/**
 * Context variables set by the Bazaar middleware so downstream handlers and
 * settle hooks can read them without re-deriving from config.
 */
export interface BazaarContextVariables {
  "lemma:bazaar:discoverable": boolean;
  "lemma:bazaar:schema": string | undefined;
  "lemma:bazaar:category": LemmaRouteConfig["bazaarCategory"] | undefined;
  "lemma:bazaar:subTags": readonly string[] | undefined;
}

interface BazaarExtensionInput {
  /** Schema identifier, e.g. "agent-identity-authority-v1". */
  name: string;
  /** Human-readable 1-sentence description (semantic search hit). */
  description: string;
  /** One of the 7 Bazaar categories. */
  category: string;
  /** Free-form sub-tags. */
  tags: readonly string[];
  /** Absolute URL of input JSON Schema. */
  inputSchema?: string;
  /** Absolute URL of output JSON Schema. */
  outputSchema?: string;
}

const buildBazaarExtensionInput = (
  config: LemmaRouteConfig
): BazaarExtensionInput => {
  // assertDiscoverableConfigured has already guaranteed these are present
  // when discoverable: true; non-null assertions are safe here.
  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    name: config.schema!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    description: config.bazaarDescription!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    category: config.bazaarCategory!,
    tags: config.bazaarSubTags ?? [],
    inputSchema: config.bazaarInputSchemaRef,
    outputSchema: config.bazaarOutputSchemaRef,
  };
};

/**
 * Merge the Bazaar extension input into the upstream config's accepts[].extra.
 * Preserves any other extension already present (forward-compat with future
 * extensions like KYT, sanctions, etc.).
 */
const injectBazaarExtensionInput = (
  config: LemmaRouteConfig
): LemmaRouteConfig => {
  const bazaar = buildBazaarExtensionInput(config);

  // `accepts` may be undefined or an array per upstream type; we merge into
  // the first element (the active payment scheme).
  const acceptsRaw = (config as { accepts?: unknown }).accepts;
  const accepts: ReadonlyArray<{ extra?: Record<string, unknown> }> =
    Array.isArray(acceptsRaw) && acceptsRaw.length > 0
      ? (acceptsRaw as ReadonlyArray<{ extra?: Record<string, unknown> }>)
      : [{}];

  const head = accepts[0] ?? {};
  return {
    ...config,
    accepts: [
      {
        ...head,
        extra: { ...head.extra, bazaar },
      },
      ...accepts.slice(1),
    ],
  } as LemmaRouteConfig;
};

/**
 * Drop-in payment middleware for Bazaar-discoverable routes.
 *
 * @example
 * ```ts
 * app.use(
 *   "/v1/suites/inference/attest",
 *   bazaarPaymentMiddleware({
 *     accepts: [
 *       // standard x402 PaymentOption (recipient, amount, network, ...)
 *     ],
 *     discoverable: true,
 *     schema: "inference-attestation-v1",
 *     bazaarCategory: "Inference",
 *     bazaarDescription:
 *       "For AI agents running their own inference, generate a Groth16 attestation proving which model produced which output, anchored on Base mainnet. Lemma never sees raw data.",
 *     bazaarSubTags: ["verifiable-ai", "audit-trail", "claim-check"],
 *     bazaarInputSchemaRef: "https://schemas.lemma.frame00.com/bazaar/product-b-input.json",
 *     bazaarOutputSchemaRef: "https://schemas.lemma.frame00.com/bazaar/product-b-output.json",
 *   })
 * );
 * ```
 */
export const bazaarPaymentMiddleware = (
  config: LemmaRouteConfig
): MiddlewareHandler => {
  // Construction-time validation: fail fast if discoverable: true is missing
  // any of its required companion fields. Throws synchronously.
  assertDiscoverableConfigured(config);

  const enrichedConfig = config.discoverable
    ? injectBazaarExtensionInput(config)
    : config;

  const upstream = upstreamPaymentMiddleware(enrichedConfig);

  return async (c: Context, next: Next) => {
    // imperative: Hono middleware with request/response lifecycle — no functional alternative
    // eslint-disable-next-line functional/no-conditional-statements
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

    // eslint-disable-next-line functional/no-expression-statements, @typescript-eslint/no-unsafe-argument
    await upstream(c, next);

    // eslint-disable-next-line functional/no-conditional-statements, @typescript-eslint/no-unnecessary-condition
    if (config.discoverable && c.res) {
      // CDP returns Bazaar metadata processing status in EXTENSION-RESPONSES.
      // The header is absent for non-CDP facilitators (e.g. x402.org), in
      // which case we skip emission silently.
      const headerValue = c.res.headers.get("EXTENSION-RESPONSES");
      // eslint-disable-next-line functional/no-conditional-statements
      if (headerValue) {
        getBazaarStatusEmitter().emit({
          routePath: c.req.path,
          schema: config.schema,
          category: config.bazaarCategory,
          status: parseBazaarStatus(headerValue),
          rawHeader: headerValue,
          observedAt: new Date().toISOString(),
        });
      }

      // Always surface Bazaar metadata to clients via response headers for
      // transparent downstream consumption (`agentic.market` curated tooling).
      // eslint-disable-next-line functional/no-conditional-statements
      if (config.schema) c.header("X-Lemma-Bazaar-Schema", config.schema);
      // eslint-disable-next-line functional/no-conditional-statements
      if (config.bazaarCategory) {
        c.header("X-Lemma-Bazaar-Category", config.bazaarCategory);
      }
    }
  };
};
