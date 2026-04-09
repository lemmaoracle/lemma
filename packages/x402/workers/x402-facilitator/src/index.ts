/**
 * X402 Facilitator Cloudflare Worker
 *
 * This worker hosts the Lemma x402 facilitator service that:
 * 1. Accepts x402 payment requests
 * 2. Generates ZK proofs for payment transactions
 * 3. Submits proofs to Lemma API with disclosure.condition
 * 4. Returns condition-satisfied responses to clients
 */

import type X402Env from "./x402-env";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import type {
  Disclosure,
  X402FacilitatorConfig,
} from "../../src/types.js";
import {
  createX402Facilitator,
  buildDisclosure,
} from "../../src/index.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as R from "ramda";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Response from Lemma query */
type LemmaQueryResponse = Readonly<{
  results: ReadonlyArray<unknown>;
  hasMore: boolean;
}>;

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

const FACILITATOR_CONFIG: X402FacilitatorConfig = R.always({
  payToAddress: "0x" as `0x${string}`,
  network: "eip155:84532",
  price: "$0.001",
  ethereumRpcUrl: "https://sepolia.base.org",
  chainId: 84532,
  lemmaApiBase: "https://workers.lemma.workers.dev",
  circuitId: "x402-payment-v1",
  minAmount: 1000n,
  requiredConfirmations: 6,
  maxProofAge: 3600,
  ipfsGateway: "https://ipfs.io/ipfs/",
})();

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: X402Env }>();

// CORS middleware
app.use("/*", cors({
  origin: "*",
  credentials: true,
}));

// ---------------------------------------------------------------------------
// Facilitator Setup
// ---------------------------------------------------------------------------

// Create facilitator for proof generation
const facilitator = createX402Facilitator(FACILITATOR_CONFIG);

// x402 payment middleware
app.use(
  "/verify/:hash",
  async (c, next) => {
    const facilitatorClient = new HTTPFacilitatorClient({
      url: "https://x402.org/facilitator",
    });

    const server = new x402ResourceServer(facilitatorClient);
    server.register("eip155:84532", new ExactEvmScheme());

    const middleware = paymentMiddleware(
      {
        "GET /verify/:hash": {
          accepts: [
            {
              scheme: "exact",
              price: "$0.001",
              network: "eip155:84532",
              payTo: FACILITATOR_CONFIG.payToAddress as `0x${string}`,
            },
          ],
          description: "Verified provenance attributes with payment proof",
          mimeType: "application/json",
          extensions: {
            lemmaAttestation: {
              schema: "blog-article",
              verifiable: [
                "author",
                "published",
                "integrity",
                "words",
                "lang",
              ],
            },
          },
        },
      },
      server,
    );

    return middleware(c, next);
  },
);

// ---------------------------------------------------------------------------
// Proof Generation Endpoint
// ---------------------------------------------------------------------------

/**
 * Generate a payment proof for a given transaction hash.
 * Called after x402 payment is confirmed to create the ZK proof.
 *
 * POST /proof/generate
 * Body: { txHash: string }
 */
app.post("/proof/generate", async (c) => {
  const { txHash } = await c.req
    .json<{ txHash: string }>()
    .then(R.defaultTo({ txHash: "0x" }));

  if (txHash === "0x") {
    return c.json(R.defaultTo({ error: "txHash is required" }), 400);
  }

  const disclosure = await facilitator
    .generateDisclosure(txHash as `0x${string}`)
    .catch((err: Error) =>
      c.json(R.assoc("error", err.message, { error: "Proof generation failed" }), 500 as const),
    );

  return c.json({ disclosure });
});

// ---------------------------------------------------------------------------
// Query Endpoint with Condition
// ---------------------------------------------------------------------------

/**
 * Query Lemma API with payment proof condition.
 * Proves payment was made to access disclosed attributes.
 *
 * POST /query
 * Body: { docHash?: string, txHash?: string, ... }
 */
app.post("/query", async (c) => {
  const body = await c.req
    .json<Record<string, unknown>>()
    .then(R.defaultTo({}));

  // Get transaction hash from request
  const txHash = R.pathOr("0x", ["txHash"], body) as string;

  // Generate or retrieve payment proof
  const disclosure = R.cond<string, Promise<Disclosure>>([
    [R.equals("0x"), R.always(facilitator.getEmptyDisclosure())],
    [R.T, async (tx: string) => facilitator.generateDisclosure(tx as `0x${string}`)],
  ])(txHash);

  // Query Lemma API with condition
  const lemmaBase = FACILITATOR_CONFIG.lemmaApiBase.replace(/\/$/, "");
  const queryBody = {
    ...body,
    disclosure: await disclosure,
  };

  const response = await fetch(`${lemmaBase}/verified-attributes/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(FACILITATOR_CONFIG.lemmaApiKey
        ? { "X-Api-Key": FACILITATOR_CONFIG.lemmaApiKey }
        : {}),
    },
    body: JSON.stringify(queryBody),
  });

  if (!response.ok) {
    const error = await response.text();
    return c.json(
      { error, disclosureError: R.cond([
        [R.equals(403), R.always("condition_not_met")],
        [R.T, R.always("unknown_error")],
      ])(response.status) },
      response.status as 500,
    );
  }

  const data = (await response.json()) as LemmaQueryResponse;

  return c.json({
    results: data.results,
    hasMore: data.hasMore,
  });
});

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

app.get("/", (c) =>
  c.json({
    service: "lemma-x402-facilitator",
    version: "0.1.0",
    circuitId: FACILITATOR_CONFIG.circuitId,
    network: FACILITATOR_CONFIG.network,
  }),
);

export default app;
