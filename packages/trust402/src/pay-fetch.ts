/**
 * x402 payment-aware fetch wrapper — signs EIP-3009 TransferWithAuthorization
 * payments with an injected EIP-1193 provider (browser wallet or viem WalletClient).
 *
 * Internal: not exported from the package index. Consumers use `create()`
 * which wires this in automatically when `getSigner` is provided.
 */
import type {
  ExactEvmAuthorization,
  PaymentPayload,
  PaymentRequirements,
  X402Network,
} from "./pay-types.js";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const USDC_ADDRESSES: Readonly<Record<X402Network, string>> = Object.freeze({
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
});

const X402_CHAIN_IDS: Readonly<Record<X402Network, number>> = Object.freeze({
  "base-sepolia": 84532,
  base: 8453,
});

const DEFAULT_MAX_AMOUNT_MICRO_USDC = 5000;

const CHAIN_METADATA: Readonly<
  Record<X402Network, Readonly<Record<string, unknown>>>
> = Object.freeze({
  "base-sepolia": {
    chainName: "Base Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },
  base: {
    chainName: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Eip1193Provider = Readonly<{
  request: (
    args: Readonly<{ method: string; params?: readonly unknown[] }>,
  ) => Promise<unknown>;
}>;

export type Signer = Readonly<{ provider: Eip1193Provider; address: string }>;

export type PayFetchOptions = Readonly<{
  getSigner: () => Promise<Signer>;
  maxAmountMicroUsdc?: number;
  onPayment?: (info: Readonly<{ amount: string; resource: string }>) => void;
}>;

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const requestUrl = (input: RequestInfo | URL): URL | null => {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  try {
    return new URL(
      raw,
      typeof location !== "undefined" ? location.href : undefined,
    );
  } catch {
    return null;
  }
};

const requestMethod = (
  input: RequestInfo | URL,
  init?: RequestInit,
): string => {
  const method =
    init?.method ??
    (typeof Request !== "undefined" && input instanceof Request
      ? input.method
      : "GET");
  return method.toUpperCase();
};

/** Requirements come from the X-PAYMENT-REQUIREMENTS header, falling back to the body's accepts. */
const parseRequirements = async (
  res: Response,
): Promise<PaymentRequirements | null> => {
  const header = res.headers.get("X-PAYMENT-REQUIREMENTS");
  if (header !== null) {
    try {
      return JSON.parse(header) as PaymentRequirements;
    } catch {
      // fall through to the body
    }
  }
  try {
    const body = (await res.clone().json()) as Readonly<{
      accepts?: ReadonlyArray<PaymentRequirements>;
    }>;
    return body.accepts?.find((r) => r.scheme === "exact") ?? null;
  } catch {
    return null;
  }
};

const isKnownNetwork = (network: string): network is X402Network =>
  network in X402_CHAIN_IDS;

const isPayable = (
  url: URL,
  method: string,
  body: BodyInit | null | undefined,
  reqs: PaymentRequirements,
  maxAmountMicroUsdc: number,
): boolean =>
  typeof location !== "undefined" &&
  url.origin === location.origin &&
  url.pathname.startsWith("/v1/") &&
  method === "POST" &&
  (body === undefined || typeof body === "string") &&
  Number(reqs.maxAmountRequired) <= maxAmountMicroUsdc &&
  isKnownNetwork(reqs.network) &&
  reqs.asset === USDC_ADDRESSES[reqs.network] &&
  Boolean(reqs.extra?.name) &&
  Boolean(reqs.extra?.version);

const randomNonce = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
};

const ensureChain = async (
  provider: Eip1193Provider,
  network: X402Network,
): Promise<void> => {
  const chainId = `0x${X402_CHAIN_IDS[network].toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (e: unknown) {
    const code = (e as Readonly<{ code?: unknown }> | null)?.code;
    if (code === 4902 || code === -32603) {
      const meta = CHAIN_METADATA[network];
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId, ...meta }],
      });
    } else {
      throw e;
    }
  }
};

const transferWithAuthorizationTypedData = (
  reqs: PaymentRequirements,
  network: X402Network,
  authorization: ExactEvmAuthorization,
): Readonly<Record<string, unknown>> => ({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  },
  primaryType: "TransferWithAuthorization",
  domain: {
    name: reqs.extra!.name,
    version: reqs.extra!.version,
    chainId: X402_CHAIN_IDS[network],
    verifyingContract: reqs.asset,
  },
  message: { ...authorization },
});

/* ------------------------------------------------------------------ */
/*  payFetch                                                           */
/* ------------------------------------------------------------------ */

/**
 * Wrap fetch with x402 payment handling: on a 402 challenge that passes all
 * guardrails, sign an EIP-3009 TransferWithAuthorization and retry exactly
 * once with the X-PAYMENT header. Anything else passes through untouched.
 */
export const payFetch = (options: PayFetchOptions): FetchLike =>
  async (input, init) => {
    const res = await fetch(input, init);
    if (res.status !== 402) return res;

    const url = requestUrl(input);
    if (url === null) return res;

    const reqs = await parseRequirements(res);
    if (reqs === null) return res;

    const maxAmount =
      options.maxAmountMicroUsdc ?? DEFAULT_MAX_AMOUNT_MICRO_USDC;
    if (
      !isPayable(url, requestMethod(input, init), init?.body, reqs, maxAmount)
    ) {
      return res;
    }
    const network = reqs.network;

    options.onPayment?.({
      amount: reqs.maxAmountRequired,
      resource: reqs.resource,
    });

    const signer = await options.getSigner();
    await ensureChain(signer.provider, network);
    // Re-resolve signer after chain switch — wallet providers (MetaMask)
    // may reset internal state during network transitions, making the
    // pre-switch provider reference stale for eth_signTypedData_v4.
    const freshSigner = await options.getSigner();
    const authorization: ExactEvmAuthorization = {
      from: freshSigner.address,
      to: reqs.payTo,
      value: reqs.maxAmountRequired,
      validAfter: "0",
      validBefore: String(
        Math.floor(Date.now() / 1000) + reqs.maxTimeoutSeconds,
      ),
      nonce: randomNonce(),
    };
    const typedData = transferWithAuthorizationTypedData(
      reqs,
      network,
      authorization,
    );
    const signature = String(
      await freshSigner.provider.request({
        method: "eth_signTypedData_v4",
        params: [freshSigner.address, JSON.stringify(typedData)],
      }),
    );

    const payment: PaymentPayload = {
      x402Version: 1,
      scheme: "exact",
      network,
      payload: { signature, authorization },
    };
    const headers = new Headers(init?.headers);
    headers.set("X-PAYMENT", btoa(JSON.stringify(payment)));
    return fetch(input, { ...init, headers });
  };
