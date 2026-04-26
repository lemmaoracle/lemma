/**
 * Augmented x402ResourceServer -- subclass of the original with automatic
 * Lemma hook wiring.
 *
 * Re-exported from root as x402ResourceServer. Users instantiate it identically
 * to the original: new x402ResourceServer(facilitatorClient). The Lemma
 * onAfterSettle hook is auto-attached in the constructor.
 *
 * Config is resolved from:
 *   1. Explicit LemmaConfig passed as second constructor argument
 *   2. LEMMA_CONFIG env var (JSON string)
 *   3. Individual env vars: LEMMA_API_BASE, LEMMA_API_KEY, LEMMA_CIRCUIT_ID, LEMMA_RELAY_URL
 */

import {
  x402ResourceServer as BaseResourceServer,
} from "@x402/core/server";
import type {
  FacilitatorClient,
  AfterSettleHook,
  SettleResultContext,
} from "@x402/core/server";
import type { LemmaConfig } from "./lemma-config.js";
import { createLemmaSubmissionHandler } from "./lemma-submission.js";

/**
 * Resolve LemmaConfig from available sources.
 *
 * Priority: explicit config -> LEMMA_CONFIG env JSON -> individual env vars.
 */
const resolveLemmaConfig = (
  explicit?: LemmaConfig,
): LemmaConfig | undefined => {
  const fromExplicit = explicit;
  const fromEnv = resolveFromEnv();
  return fromExplicit ?? fromEnv;
};

/** Read LEMMA_CONFIG env var as JSON and parse it. */
const resolveFromEnv = (): LemmaConfig | undefined => {
  const raw =
    typeof process !== "undefined"
      ? process.env.LEMMA_CONFIG
      : undefined;

  const jsonStr = raw;

  return !jsonStr
    ? resolveFromIndividualEnvVars()
    : (() => {
        try {
          const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
          const apiBase = parsed.apiBase as string | undefined;
          return apiBase
            ? ({
                apiBase,
                apiKey: parsed.apiKey as string | undefined,
                circuitId:
                  (parsed.circuitId as string) ?? "x402-payment-v1",
                relayUrl: parsed.relayUrl as string | undefined,
                discovery:
                  parsed.discovery as LemmaConfig["discovery"] | undefined,
              })
            : resolveFromIndividualEnvVars();
        } catch {
          return resolveFromIndividualEnvVars();
        }
      })();
};

/** Fallback to individual env vars. */
const resolveFromIndividualEnvVars = (): LemmaConfig | undefined => {
  const env = typeof process !== "undefined" ? process.env : {};
  const apiBase = env.LEMMA_API_BASE;
  return apiBase
    ? {
        apiBase,
        apiKey: env.LEMMA_API_KEY,
        circuitId: env.LEMMA_CIRCUIT_ID ?? "x402-payment-v1",
        relayUrl: env.LEMMA_RELAY_URL,
      }
    : undefined;
};

/**
 * Augmented version of x402ResourceServer.
 *
 * Subclasses the original to auto-attach Lemma hooks. The subclass does NOT
 * change the public API -- it only adds internal wiring in the constructor.
 *
 * @param facilitatorClient - x402 facilitator client(s)
 * @param lemmaConfig - Optional explicit Lemma configuration
 */
class LemmaResourceServer extends BaseResourceServer {
  constructor(
    facilitatorClient?: FacilitatorClient | FacilitatorClient[],
    lemmaConfig?: LemmaConfig,
  ) {
    super(facilitatorClient);

    const config = resolveLemmaConfig(lemmaConfig);
    // No Lemma config available -- skip wiring (fallback: delegate to base class only)
    if (!config) return;

    const submissionHandler = createLemmaSubmissionHandler(config);

    // Auto-attach the Lemma submission hook via onAfterSettle
    const lemmaAfterSettle: AfterSettleHook = async (
      context: SettleResultContext,
    ): Promise<void> => {
      try {
        const settlementResult = context.result;

        // Build submission context from settlement data
        const docHash =
          (context.requirements.extra?.docHash as string) ??
          settlementResult.transaction ??
          "unknown";

        const schema =
          (context.requirements.extra?.schema as string) ??
          "default";

        // Extract payment details for proof witness
        const witness = {
          amount: context.requirements.amount ?? "1000",
          docHash,
          transaction: settlementResult.transaction,
        };

        await submissionHandler({
          docHash,
          schema: String(schema),
          issuerId: "lemma-x402",
          witness,
          metadata: {
            payer: settlementResult.payer,
            transaction: settlementResult.transaction,
            network: settlementResult.network,
          },
        });
      } catch (err) {
        // Submission errors are non-fatal -- the settlement succeeded.
        console.error("[Lemma] Submission handler error:", err);
      }
    };

    this.onAfterSettle(lemmaAfterSettle);
  }
}

export { LemmaResourceServer as x402ResourceServer };
