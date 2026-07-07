/**
 * Trust402 client factory — wraps @lemmaoracle/sdk's create() with:
 *   - default apiBase = https://trust402.lemma.workers.dev
 *   - automatic x402 payment handling when getSigner is provided
 *
 * When getSigner is omitted, the client uses plain fetch (no x402).
 */
import { create as lemmaCreate } from "@lemmaoracle/sdk";
import type { LemmaClient, LemmaClientConfig } from "@lemmaoracle/spec";
import type { Signer } from "./pay-fetch.js";
import { payFetch } from "./pay-fetch.js";

export type ClientConfig = LemmaClientConfig &
  Readonly<{
    /** EIP-1193 signer provider (browser wallet or viem WalletClient). */
    getSigner?: () => Promise<Signer>;
    /** Called when a 402 payment is initiated. */
    onPayment?: (info: Readonly<{ amount: string; resource: string }>) => void;
    /** Max payment in micro-USDC the fetcher will accept (default 5000 = $0.005). */
    maxAmountMicroUsdc?: number;
  }>;

const DEFAULT_API_BASE = "https://trust402.lemma.workers.dev";

export const create = (config: ClientConfig): LemmaClient => {
  const {
    getSigner,
    onPayment,
    maxAmountMicroUsdc,
    apiBase,
    ...rest
  } = config;

  const fetcher =
    getSigner !== undefined
      ? payFetch({ getSigner, onPayment, maxAmountMicroUsdc })
      : undefined;

  return lemmaCreate(
    { ...rest, apiBase: apiBase ?? DEFAULT_API_BASE },
    fetcher,
  );
};
