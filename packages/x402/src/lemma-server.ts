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
  SettleResultContext,
} from "@x402/core/server";
import type { LemmaConfig } from "./lemma-config.js";
import { createLemmaSubmissionHandler } from "./lemma-submission.js";
import { poseidon6 } from "poseidon-lite";

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

    // Register Lemma extension to enrich settlement response with proof data.
    // enrichSettlementResponse runs BEFORE createSettlementHeaders, so
    // extensions.lemma is included in the PAYMENT-RESPONSE header.
    this.registerExtension({
      key: "lemma",
      enrichSettlementResponse: async (
        _declaration: unknown,
        context: SettleResultContext,
      ): Promise<unknown> => {
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
          // The circuit expects specific inputs matching X402Payment circuit
          const txHash = (settlementResult.transaction ?? "").replace(/^0x/, "");
          const bn128Prime = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
          
          // Split 256-bit tx hash into 2 field elements (128-bit each)
          const txHashLow = txHash.length >= 32 
            ? (BigInt(`0x${txHash.slice(-32)}`) % bn128Prime).toString()
            : "0";
          const txHashHigh = txHash.length >= 64 
            ? (BigInt(`0x${txHash.slice(0, -32)}`) % bn128Prime).toString()
            : (BigInt(`0x${txHash}`) % bn128Prime).toString();
          
          // Recipient address (payTo) - split into low/high
          const payTo = (context.requirements.payTo ?? "").replace(/^0x/, "").padStart(40, "0");
          const recipientLow = (BigInt(`0x${payTo.slice(-16)}`) % bn128Prime).toString();
          const recipientHigh = (BigInt(`0x${payTo.slice(0, -16) || "0"}`) % bn128Prime).toString();
          
          // Amount (USDC has 6 decimals, x402 uses smallest unit)
          const amount = context.requirements.amount ?? "1000";
          
          // Timestamp - use current time for freshness
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const timestampMax = (parseInt(timestamp) + 3600).toString();
          
          // Min amount
          const minAmount = amount;
          
          // Commitment = Poseidon6(txHashPacked[0], txHashPacked[1], recipientLow, amount, timestamp, minAmount)
          const commitment = poseidon6([
            BigInt(txHashLow),
            BigInt(txHashHigh),
            BigInt(recipientLow),
            BigInt(amount),
            BigInt(timestamp),
            BigInt(minAmount),
          ]).toString();
          
          const witness = {
            txHashPacked: [txHashLow, txHashHigh],
            recipientLow,
            recipientHigh,
            amount,
            timestamp,
            minAmount,
            commitment,
            minAmountPublic: minAmount,
            timestampMax,
          };

          const proofOutput = await submissionHandler({
            docHash: txHash,
            schema: String(schema),
            issuerId: "lemma-x402",
            witness,
            metadata: {
              payer: settlementResult.payer,
              transaction: settlementResult.transaction,
              network: settlementResult.network,
            },
          });

          const extData = {
            proof: proofOutput.proof,
            inputs: proofOutput.inputs,
            circuitId: config.circuitId,
            generatedAt: Date.now(),
          };
          return extData;
        } catch (err) {
          // Non-fatal -- settlement succeeded even if proof submission fails.
          console.error("[Lemma] enrichSettlementResponse error:", err);
          return undefined;
        }
      },
    });
  }
}

export { LemmaResourceServer as x402ResourceServer };
