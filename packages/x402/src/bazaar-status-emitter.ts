/**
 * Bazaar status emitter — abstract observability sink for the
 * `EXTENSION-RESPONSES` outcome returned by the CDP facilitator on settle.
 *
 * Default: console.info (JSON-line, log-aggregation-friendly).
 * Override via env LEMMA_BAZAAR_EMITTER:
 *   - "console" (default)
 *   - "noop"     (silent — useful in tests)
 *   - "datadog"  (TODO(W2): wire to Datadog metrics agent if/when available)
 *
 * Discovery failures are observability events, not payment events — they
 * never break settle. See bazaar-middleware.ts for the emission site.
 */
export interface BazaarStatusEvent {
  routePath: string;
  schema: string | undefined;
  category: string | undefined;
  /** "accepted" | "processing" | "rejected" | "unknown" */
  status: "accepted" | "processing" | "rejected" | "unknown";
  rawHeader: string;
  observedAt: string;
}

export interface BazaarStatusEmitter {
  emit(event: BazaarStatusEvent): void;
}

const createConsoleEmitter = (_opts?: undefined): BazaarStatusEmitter => ({
  emit: (event: BazaarStatusEvent): void => {
    // Single line, JSON-parseable for log aggregation.
    console.info(
      JSON.stringify({
        ts: event.observedAt,
        level: "info",
        msg: "bazaar_extension_response",
        route: event.routePath,
        schema: event.schema,
        category: event.category,
        status: event.status,
        raw: event.rawHeader,
      })
    );
  },
});

const createNoopEmitter = (_opts?: undefined): BazaarStatusEmitter => ({
  emit: (_event: BazaarStatusEvent): void => {
    /* intentionally empty */
  },
});

/**
 * Lazy singleton. Reads env at first call so tests can override before init.
 */
// imperative: lazy singleton with mutable cache — no functional alternative
// eslint-disable-next-line functional/no-let
let cached: BazaarStatusEmitter | undefined;

/**
 * Resolve the `LEMMA_BAZAAR_EMITTER` env var across Node, Workers, and
 * browser-like environments without taking a type-level dependency on
 * `@types/node`.
 */
const isNonEmptyString = (val: unknown): val is string =>
  typeof val === "string" && val.length > 0;

// imperative: env-accessing resolver — no functional alternative
const readEmitterEnv = (_opts?: undefined): string | undefined => {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fromProcess = proc?.env?.["LEMMA_BAZAAR_EMITTER"];
  const fromGlobal = (globalThis as { LEMMA_BAZAAR_EMITTER?: string }).LEMMA_BAZAAR_EMITTER;

  return isNonEmptyString(fromProcess)
    ? fromProcess
    : isNonEmptyString(fromGlobal)
      ? fromGlobal
      : undefined;
};

// imperative: lazy singleton getter with mutable state — no functional alternative
export const getBazaarStatusEmitter = (_opts?: undefined): BazaarStatusEmitter => {
  // eslint-disable-next-line functional/no-conditional-statements
  if (cached) return cached;

  const envValue = readEmitterEnv();

  // imperative: lazy singleton with mutable cache assignment — no functional alternative
  // eslint-disable-next-line functional/no-expression-statements
  cached = envValue === "noop"
    ? createNoopEmitter()
    : envValue === "console" || envValue === undefined
      ? createConsoleEmitter()
      : (() => {
          // Unknown emitter name — log once and fall back to console so we never
          // silently drop observability data due to a typo.
          console.warn(
            `[lemma:bazaar] unknown LEMMA_BAZAAR_EMITTER="${envValue}", falling back to console`
          );
          return createConsoleEmitter();
        })();

  return cached;
};

/**
 * Test-only setter. Lets unit tests inject a mock emitter and restore later
 * by passing `undefined`.
 */
export const setBazaarStatusEmitterForTesting = (
  emitter: BazaarStatusEmitter | undefined
): void => {
  // imperative: test-only mutable injection — no functional alternative
  // eslint-disable-next-line functional/no-expression-statements
  cached = emitter;
};

const STATUS_MAP: Readonly<Record<string, BazaarStatusEvent["status"]>> = {
  accepted: "accepted",
  processing: "processing",
  pending: "processing",
  rejected: "rejected",
  failed: "rejected",
};

/**
 * Parse the EXTENSION-RESPONSES header into a typed status.
 *
 * CDP's exact header format is not exhaustively documented; we look for
 * `status=<value>` and fall back to "unknown" for forward-compat. The raw
 * header is always preserved on the emitted event so downstream alerting
 * can react to undocumented variants.
 */
export const parseBazaarStatus = (
  headerValue: string
): BazaarStatusEvent["status"] => {
  const match = /(?:^|[\s,;])status\s*=\s*"?([a-z_-]+)?"?/i.exec(headerValue);
  return match?.[1]
    ? (STATUS_MAP[match[1].toLowerCase()] ?? "unknown")
    : "unknown";
};