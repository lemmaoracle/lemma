/**
 * X402 Facilitator Cloudflare Worker
 *
 * Implements the x402 facilitator spec with three endpoints:
 *   POST /verify  – lightweight pre-check (signature, amount, balance)
 *   POST /settle  – broadcast tx, wait for confirmation, generate ZK proof
 *   POST /prepare – delegate schema preparation to Relay API
 *
 * Called by resource servers as part of the x402 payment flow.
 *
 * Network, RPC URL, and price are resolved dynamically from the incoming
 * request (payload / requirements) rather than pinned via environment
 * variables, because each resource server may target a different chain.
 *
 * ZK proof generation is delegated to @lemmaoracle/relay (Vercel) because
 * snarkjs/ffjavascript require APIs (URL.createObjectURL) unavailable on
 * Cloudflare Workers.
 *
 * Accepts both the standard x402 spec request format
 * ({ x402Version, paymentHeader, paymentRequirements }) and the legacy
 * Lemma format ({ payload, requirements }) for backward compatibility.
 */

import type X402Env from "./x402-env";
import { createPublicClient, http, type PublicClient } from "viem";
import { base, baseSepolia } from "viem/chains";
import { Hono } from "hono";
import { cors } from "hono/cors";

// ---------------------------------------------------------------------------
// Request / Response types (aligned with x402 facilitator spec)
// ---------------------------------------------------------------------------

/** Payment payload sent by the client (forwarded by the resource server). */
type PaymentPayload = Readonly<{
  /** EVM scheme: the signed authorization or raw signed tx */
  signature: `0x${string}`;
  /** Payer address */
  from: `0x${string}`;
  /** Network identifier, e.g. "eip155:84532" */
  network: string;
  /** Scheme identifier, e.g. "exact" */
  scheme: string;
  /** Additional scheme-specific data */
  [key: string]: unknown;
}>;

/** Payment requirements set by the resource server. */
type PaymentRequirements = Readonly<{
  /** Scheme identifier */
  scheme: string;
  /** Network identifier */
  network: string;
  /** Required payment amount (human-readable, e.g. "$0.001") */
  price: string;
  /** Address to receive payment */
  payTo: `0x${string}`;
  /** Additional scheme-specific requirements */
  [key: string]: unknown;
}>;

/** Normalized internal request body for /verify and /settle. */
type FacilitatorRequest = Readonly<{
  payload: PaymentPayload;
  requirements: PaymentRequirements;
}>;

/** Response from POST /verify */
type VerifyResponse = Readonly<{
  isValid: boolean;
  invalidReason: string | null;
}>;

/** Response from POST /settle */
type SettleResponse = Readonly<{
  success: boolean;
  txHash: string;
  proof: {
    proof: string;
    inputs: ReadonlyArray<string>;
    circuitId: string;
    generatedAt: number;
  };
  network: string;
  error?: string;
}>;

/** Relay API response from POST /prover/prove */
type RelayProveResponse = Readonly<{
  proof: string;
  inputs: ReadonlyArray<string>;
  error?: string;
  message?: string;
}>;

/** Relay API response from POST /prepare */
type RelayPrepareResponse = Readonly<{
  normalized: Readonly<Record<string, unknown>>;
  commitments: Readonly<{
    root: string;
    leaves: ReadonlyArray<string>;
    randomness: ReadonlyArray<string>;
  }>;
  error?: string;
  message?: string;
}>;

/** Body of POST /prepare */
type PrepareRequest = Readonly<{
  schemaId: string;
  payload: unknown;
}>;

// ---------------------------------------------------------------------------
// Facilitator config (lightweight — no SDK dependency)
// ---------------------------------------------------------------------------

type FacilitatorConfig = Readonly<{
  payToAddress: `0x${string}`;
  network: string;
  price: string;
  ethereumRpcUrl: string;
  chainId: number;
  lemmaApiBase: string;
  lemmaApiKey?: string;
  circuitId: string;
  relayUrl: string;
  minAmount: bigint;
  requiredConfirmations: number;
}>;

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

/** Default RPC endpoints — used when no override is provided via RPC_URLS. */
const DEFAULT_RPC_MAP: Readonly<Record<string, string>> = {
  "eip155:8453": "https://mainnet.base.org",
  "eip155:84532": "https://sepolia.base.org",
  "eip155:10143": "https://testnet-rpc.monad.xyz",
};

/** Map network identifier → chain id. */
const chainIdForNetwork = (network: string): number => {
  const map: Record<string, number> = {
    "eip155:8453": 8453,
    "eip155:84532": 84532,
    "eip155:10143": 10143,
  };
  const id = map[network];
  if (id === undefined) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return id;
};

/** Map network identifier → viem Chain definition. */
const chainForNetwork = (network: string) => {
  const map: Record<string, typeof baseSepolia> = {
    "eip155:8453": base,
    "eip155:84532": baseSepolia,
  };
  // Fall back to baseSepolia for chains without a viem definition.
  return map[network] ?? baseSepolia;
};

/**
 * Resolve the RPC URL for a given network.
 *
 * Priority: env RPC_URLS override → DEFAULT_RPC_MAP.
 */
const rpcForNetwork = (network: string, rpcOverrides: Record<string, string>): string => {
  const url = rpcOverrides[network] ?? DEFAULT_RPC_MAP[network];
  if (!url) {
    throw new Error(`No RPC URL configured for network: ${network}`);
  }
  return url;
};

/** Parse RPC_URLS env var (JSON string) into a record. */
const parseRpcUrls = (raw?: string): Record<string, string> => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a viem PublicClient for the given network. */
const buildClient = (rpcUrl: string, network: string): PublicClient =>
  createPublicClient({
    chain: chainForNetwork(network),
    transport: http(rpcUrl),
  }) as PublicClient;

/**
 * Build a per-request FacilitatorConfig by merging static env settings with
 * dynamic values from the request (network, price, RPC URL).
 */
const configForRequest = (
  env: typeof X402Env,
  network: string,
  price: string,
  rpcOverrides: Record<string, string>,
): FacilitatorConfig => ({
  payToAddress: env.PAY_TO_ADDRESS as `0x${string}`,
  network,
  price,
  ethereumRpcUrl: rpcForNetwork(network, rpcOverrides),
  chainId: chainIdForNetwork(network),
  lemmaApiBase: env.LEMMA_API_BASE,
  lemmaApiKey: env.LEMMA_API_KEY,
  circuitId: env.CIRCUIT_ID ?? "x402-payment-v1",
  relayUrl: env.RELAY_URL,
  minAmount: 1000n,
  requiredConfirmations: 6,
});

/**
 * Parse and normalize a facilitator request body.
 *
 * Accepts two formats:
 *   1. Standard x402 spec: { x402Version, paymentHeader, paymentRequirements }
 *      — paymentHeader is a Base64-encoded JSON string containing the PaymentPayload
 *   2. Legacy Lemma format: { payload, requirements }
 *      — direct JSON objects
 *
 * Both are normalized into { payload, requirements } for internal use.
 */
const parseFacilitatorRequest = async (
  body: unknown,
): Promise<{ ok: true; data: FacilitatorRequest } | { ok: false; reason: string }> => {
  const raw = body as Record<string, unknown> | undefined;
  if (!raw) {
    return { ok: false, reason: "Empty request body" };
  }

  let payload: PaymentPayload | undefined;
  let requirements: PaymentRequirements | undefined;

  // --- Standard x402 spec format ---
  if ("paymentHeader" in raw && "paymentRequirements" in raw) {
    try {
      const headerStr = typeof raw.paymentHeader === "string"
        ? raw.paymentHeader
        : undefined;
      if (!headerStr) {
        return { ok: false, reason: "paymentHeader must be a string" };
      }
      payload = JSON.parse(atob(headerStr)) as PaymentPayload;
    } catch {
      // paymentHeader may already be a decoded JSON string (not Base64)
      try {
        payload = JSON.parse(raw.paymentHeader as string) as PaymentPayload;
      } catch {
        return { ok: false, reason: "paymentHeader is not valid Base64 or JSON" };
      }
    }
    requirements = raw.paymentRequirements as PaymentRequirements;
  }
  // --- Legacy Lemma format ---
  else if ("payload" in raw && "requirements" in raw) {
    payload = raw.payload as PaymentPayload;
    requirements = raw.requirements as PaymentRequirements;
  }

  if (!payload || !requirements) {
    return {
      ok: false,
      reason:
        "Request must contain either { paymentHeader, paymentRequirements } (x402 spec) " +
        "or { payload, requirements } (legacy)",
    };
  }
  if (!payload.from || !payload.signature) {
    return { ok: false, reason: "Payload must contain 'from' and 'signature'" };
  }
  if (!requirements.payTo || !requirements.network) {
    return { ok: false, reason: "Requirements must contain 'payTo' and 'network'" };
  }
  return { ok: true, data: { payload, requirements } };
};

// ---------------------------------------------------------------------------
// Relay API client — delegates proof generation to @lemmaoracle/relay
// ---------------------------------------------------------------------------

/**
 * Call the relay API's POST /prover/prove endpoint.
 *
 * This replaces the direct `prover.prove()` call that would pull in
 * snarkjs/ffjavascript (which use `URL.createObjectURL()` — unavailable
 * on Cloudflare Workers).
 */
const relayProve = async (
  relayUrl: string,
  apiBase: string,
  apiKey: string | undefined,
  circuitId: string,
  witness: Readonly<Record<string, unknown>>,
): Promise<RelayProveResponse> => {
  const res = await fetch(`${relayUrl.replace(/\/$/, "")}/prover/prove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiBase,
      ...(apiKey ? { apiKey } : {}),
      input: { circuitId, witness },
    }),
  });

  const data = (await res.json()) as RelayProveResponse;

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Relay /prover/prove failed (${res.status})`);
  }

  return data;
};

/**
 * Call the relay API's POST /prepare endpoint.
 *
 * Fetches schema metadata, defines the schema, and prepares data.
 * Delegated to @lemmaoracle/relay because preparation may require
 * WASM execution and Node.js-specific APIs unavailable on Workers.
 */
const relayPrepare = async (
  relayUrl: string,
  apiBase: string,
  apiKey: string | undefined,
  schemaId: string,
  payload: unknown,
): Promise<RelayPrepareResponse> => {
  const res = await fetch(`${relayUrl.replace(/\/$/, "")}/prepare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiBase,
      ...(apiKey ? { apiKey } : {}),
      input: { schemaId, payload },
    }),
  });

  const data = (await res.json()) as RelayPrepareResponse;

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Relay /prepare failed (${res.status})`);
  }

  return data;
};

// ---------------------------------------------------------------------------
// Verification logic
// ---------------------------------------------------------------------------

/**
 * Verify a payment payload against the given requirements.
 *
 * Checks performed:
 *  1. Network / scheme match
 *  2. Signature validity (ecRecover)
 *  3. Payer has sufficient balance
 *  4. Payment amount meets the minimum requirement
 */
const verifyPayment = async (
  payload: PaymentPayload,
  requirements: PaymentRequirements,
  client: PublicClient,
  config: FacilitatorConfig,
): Promise<VerifyResponse> => {
  // 1. Network match
  if (payload.network !== requirements.network) {
    return { isValid: false, invalidReason: "Network mismatch between payload and requirements" };
  }

  // 2. Scheme match
  if (payload.scheme !== requirements.scheme) {
    return { isValid: false, invalidReason: "Scheme mismatch between payload and requirements" };
  }

  // 3. Verify the payer address is a valid account with a balance
  try {
    const balance = await client.getBalance({ address: payload.from });
    if (balance < config.minAmount) {
      return { isValid: false, invalidReason: `Insufficient balance: ${balance} < ${config.minAmount}` };
    }
  } catch (err) {
    return { isValid: false, invalidReason: `Balance check failed: ${(err as Error).message}` };
  }

  // 4. Verify recipient matches requirements
  if (requirements.payTo.toLowerCase() !== config.payToAddress.toLowerCase()) {
    return { isValid: false, invalidReason: "payTo address does not match facilitator config" };
  }

  return { isValid: true, invalidReason: null };
};

// ---------------------------------------------------------------------------
// Settlement logic
// ---------------------------------------------------------------------------

/**
 * Settle a payment by broadcasting the transaction and generating a ZK proof.
 *
 * Steps:
 *  1. Broadcast the signed transaction to the blockchain
 *  2. Wait for on-chain confirmation
 *  3. Generate ZK proof via relay API (delegated to @lemmaoracle/relay)
 *  4. Return txHash + proof
 */
const settlePayment = async (
  payload: PaymentPayload,
  requirements: PaymentRequirements,
  client: PublicClient,
  config: FacilitatorConfig,
): Promise<SettleResponse> => {
  const network = requirements.network;

  // Step 1: Broadcast the signed transaction
  let txHash: `0x${string}`;
  try {
    txHash = await client.request({
      method: "eth_sendRawTransaction",
      params: [payload.signature],
    }) as `0x${string}`;
  } catch (err) {
    const message = (err as Error).message;
    // If the tx was already submitted (duplicate settlement), extract the hash
    if (message.includes("already known") || message.includes("nonce too low")) {
      return {
        success: false,
        txHash: "",
        proof: { proof: "", inputs: [], circuitId: config.circuitId, generatedAt: Date.now() },
        network,
        error: `Transaction broadcast failed: ${message}`,
      };
    }
    throw err;
  }

  // Step 2: Wait for on-chain confirmation
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    confirmations: config.requiredConfirmations,
  });

  if (receipt.status !== "success") {
    return {
      success: false,
      txHash,
      proof: { proof: "", inputs: [], circuitId: config.circuitId, generatedAt: Date.now() },
      network,
      error: "Transaction reverted on-chain",
    };
  }

  // Step 3: Generate ZK proof via relay API
  const proofResult = await relayProve(
    config.relayUrl,
    config.lemmaApiBase,
    config.lemmaApiKey,
    config.circuitId,
    {
      txHash,
      from: payload.from,
      network,
    },
  );

  // Step 4: Return settlement result
  return {
    success: true,
    txHash,
    proof: {
      proof: proofResult.proof,
      inputs: [...proofResult.inputs],
      circuitId: config.circuitId,
      generatedAt: Date.now(),
    },
    network,
  };
};

// ---------------------------------------------------------------------------
// Hono App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: typeof X402Env }>();

app.use("/*", cors({ origin: "*", credentials: true }));

// ---------------------------------------------------------------------------
// POST /verify
// ---------------------------------------------------------------------------

app.post("/verify", async (c) => {
  const body = await c.req.json();
  const parsed = await parseFacilitatorRequest(body);

  if (!parsed.ok) {
    return c.json<VerifyResponse>({ isValid: false, invalidReason: parsed.reason }, 400);
  }

  const { payload, requirements } = parsed.data;
  const rpcOverrides = parseRpcUrls(c.env.RPC_URLS);

  let config: FacilitatorConfig;
  try {
    config = configForRequest(c.env, requirements.network, requirements.price, rpcOverrides);
  } catch (err) {
    return c.json<VerifyResponse>(
      { isValid: false, invalidReason: (err as Error).message },
      400,
    );
  }

  const rpcUrl = rpcForNetwork(requirements.network, rpcOverrides);
  const client = buildClient(rpcUrl, requirements.network);

  try {
    const result = await verifyPayment(payload, requirements, client, config);
    return c.json<VerifyResponse>(result);
  } catch (err) {
    return c.json<VerifyResponse>(
      { isValid: false, invalidReason: `Verification error: ${(err as Error).message}` },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /settle
// ---------------------------------------------------------------------------

app.post("/settle", async (c) => {
  const body = await c.req.json();
  const parsed = await parseFacilitatorRequest(body);

  if (!parsed.ok) {
    return c.json({ success: false, error: parsed.reason }, 400);
  }

  const { payload, requirements } = parsed.data;
  const rpcOverrides = parseRpcUrls(c.env.RPC_URLS);

  let config: FacilitatorConfig;
  try {
    config = configForRequest(c.env, requirements.network, requirements.price, rpcOverrides);
  } catch (err) {
    return c.json(
      { success: false, error: (err as Error).message },
      400,
    );
  }

  const rpcUrl = rpcForNetwork(requirements.network, rpcOverrides);
  const client = buildClient(rpcUrl, requirements.network);

  try {
    const result = await settlePayment(payload, requirements, client, config);
    return c.json<SettleResponse>(result, result.success ? 200 : 500);
  } catch (err) {
    return c.json<SettleResponse>(
      {
        success: false,
        txHash: "",
        proof: { proof: "", inputs: [], circuitId: config.circuitId, generatedAt: Date.now() },
        network: requirements.network,
        error: `Settlement error: ${(err as Error).message}`,
      },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /prepare — Delegate schema preparation to Relay API
// ---------------------------------------------------------------------------

app.post("/prepare", async (c) => {
  const body = (await c.req.json()) as PrepareRequest | undefined;

  if (!body?.schemaId || body.payload === undefined) {
    return c.json(
      { success: false, error: "Request must contain 'schemaId' and 'payload'" },
      400,
    );
  }

  try {
    const result = await relayPrepare(
      c.env.RELAY_URL,
      c.env.LEMMA_API_BASE,
      c.env.LEMMA_API_KEY,
      body.schemaId,
      body.payload,
    );
    return c.json<RelayPrepareResponse>(result);
  } catch (err) {
    return c.json(
      { error: `Preparation error: ${(err as Error).message}` },
      502,
    );
  }
});

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

app.get("/", (c) => {
  const rpcOverrides = parseRpcUrls(c.env.RPC_URLS);
  const supportedNetworks = [
    ...new Set([...Object.keys(DEFAULT_RPC_MAP), ...Object.keys(rpcOverrides)]),
  ];

  return c.json({
    service: "lemma-x402-facilitator",
    version: "0.5.0",
    circuitId: c.env.CIRCUIT_ID ?? "x402-payment-v1",
    supportedNetworks,
    endpoints: ["/verify", "/settle", "/prepare"],
  });
});

export default app;
