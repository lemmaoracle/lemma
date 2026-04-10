/**
 * X402 Facilitator Cloudflare Worker
 *
 * Implements the x402 facilitator spec with two endpoints:
 *   POST /verify  – lightweight pre-check (signature, amount, balance)
 *   POST /settle  – broadcast tx, wait for confirmation, generate ZK proof
 *
 * Called by resource servers as part of the x402 payment flow.
 */

import type X402Env from "./x402-env";
import {
  facilitator as createFacilitator,
  defaultConfig,
  type Config,
} from "@lemmaoracle/x402";
import { createPublicClient, http, type PublicClient } from "viem";
import { baseSepolia } from "viem/chains";
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

/** Body of POST /verify and POST /settle */
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map network id → chain id. */
const chainIdForNetwork = (network: string): number => {
  const map: Record<string, number> = {
    "eip155:84532": 84532,
    "eip155:8453": 8453,
  };
  return map[network] ?? 84532;
};

/** Build a viem PublicClient for the given RPC URL. */
const buildClient = (rpcUrl: string, chainId: number): PublicClient =>
  createPublicClient({
    chain: chainId === 84532 ? baseSepolia : baseSepolia,
    transport: http(rpcUrl),
  }) as PublicClient;

/** Build Config from env bindings. */
const configFromEnv = (env: typeof X402Env): Config =>
  defaultConfig({
    payToAddress: env.PAY_TO_ADDRESS as `0x${string}`,
    ethereumRpcUrl: env.ETHEREUM_RPC_URL,
    lemmaApiBase: env.LEMMA_API_BASE,
    lemmaApiKey: env.LEMMA_API_KEY,
  });

/** Parse and validate a facilitator request body. */
const parseFacilitatorRequest = async (
  body: unknown,
): Promise<{ ok: true; data: FacilitatorRequest } | { ok: false; reason: string }> => {
  const req = body as FacilitatorRequest | undefined;
  if (!req?.payload || !req?.requirements) {
    return { ok: false, reason: "Request must contain 'payload' and 'requirements'" };
  }
  if (!req.payload.from || !req.payload.signature) {
    return { ok: false, reason: "Payload must contain 'from' and 'signature'" };
  }
  if (!req.requirements.payTo || !req.requirements.network) {
    return { ok: false, reason: "Requirements must contain 'payTo' and 'network'" };
  }
  return { ok: true, data: req };
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
  config: Config,
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
 *  3. Generate ZK proof via X402Payment circuit
 *  4. Return txHash + proof
 */
const settlePayment = async (
  payload: PaymentPayload,
  _requirements: PaymentRequirements,
  client: PublicClient,
  config: Config,
): Promise<SettleResponse> => {
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
        network: config.network,
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
      network: config.network,
      error: "Transaction reverted on-chain",
    };
  }

  // Step 3: Generate ZK proof using X402Payment circuit
  const fac = createFacilitator(config);
  const disclosure = await fac.generateDisclosure(txHash);

  // Step 4: Return settlement result
  return {
    success: true,
    txHash,
    proof: {
      proof: disclosure.proof,
      inputs: [...disclosure.inputs],
      circuitId: disclosure.condition?.circuitId ?? config.circuitId,
      generatedAt: Date.now(),
    },
    network: config.network,
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
  const config = configFromEnv(c.env);
  const client = buildClient(config.ethereumRpcUrl, chainIdForNetwork(payload.network));

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
  const config = configFromEnv(c.env);
  const client = buildClient(config.ethereumRpcUrl, chainIdForNetwork(payload.network));

  try {
    const result = await settlePayment(payload, requirements, client, config);
    return c.json<SettleResponse>(result, result.success ? 200 : 500);
  } catch (err) {
    return c.json<SettleResponse>(
      {
        success: false,
        txHash: "",
        proof: { proof: "", inputs: [], circuitId: config.circuitId, generatedAt: Date.now() },
        network: config.network,
        error: `Settlement error: ${(err as Error).message}`,
      },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

app.get("/", (c) => {
  const config = configFromEnv(c.env);
  return c.json({
    service: "lemma-x402-facilitator",
    version: "0.2.0",
    circuitId: config.circuitId,
    network: config.network,
    endpoints: ["/verify", "/settle"],
  });
});

export default app;
