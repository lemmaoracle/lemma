# @lemmaoracle/x402

[![npm version](https://img.shields.io/npm/v/@lemmaoracle/x402)](https://www.npmjs.com/package/@lemmaoracle/x402)
[![License](https://img.shields.io/npm/l/@lemmaoracle/x402)](https://github.com/lemmaoracle/lemmaoracle/blob/main/LICENSE)

Drop-in replacement for `@x402/*` with automatic [Lemma](https://lemma.frame00.com) discovery and zero-knowledge proof submission.

## Overview

Switch your x402 imports from `@x402/*` to `@lemmaoracle/x402` and get automatic ZK proof generation on every settlement. The package adds Lemma discovery metadata and proof submission without changing your existing x402 integration code.

## Install

```bash
npm install @lemmaoracle/x402 @lemmaoracle/sdk
```

> `@lemmaoracle/sdk` is a required peer dependency.

## Quick Start

```typescript
import { Hono } from "hono";
import {
  HTTPFacilitatorClient,
  x402ResourceServer,
  paymentMiddleware,
  ExactEvmScheme,
} from "@lemmaoracle/x402";

const app = new Hono();
const facilitator = new HTTPFacilitatorClient();

// Pass LemmaConfig to enable proof generation; omit to use as plain @x402/* wrapper
const server = new x402ResourceServer(facilitator, {
  apiKey: "your-lemma-api-key",
  discovery: { schemas: ["dev:document:v1"] },
});

app.use(
  "/verify/:hash",
  paymentMiddleware(
    {
      "GET /verify/:hash": {
        price: "$0.01",
        network: "base-sepolia",
        resource: "verification-api",
        scheme: ExactEvmScheme,
        paysTo: "0xYourAddress",
      },
    },
    server,
  ),
);

app.get("/verify/:hash", async (c) => {
  return c.json({ verified: true, hash: c.req.param("hash") });
});
```

## How it works

After each x402 settlement, the augmented `x402ResourceServer` automatically triggers a `onAfterSettle` hook that registers the payment as a Lemma document, generates a ZK proof via a Node.js relay, and submits the proof to the Lemma oracle. Proof data is included in the settlement response header.

## Exports

**Re-exports from `@x402/*`** — `HTTPFacilitatorClient`, `ExactEvmScheme`, `x402Client`, plus associated types (`Network`, `PaymentRequirements`, `PaymentPayload`, `FacilitatorConfig`).

**Augmented exports** — `x402ResourceServer` (auto-attaches Lemma hook), `paymentMiddleware` (auto-enriches routes with discovery metadata).

**Advanced** (`@lemmaoracle/x402/advanced`) — `createLemmaSubmissionHandler`, `resolveDiscoveryConfig`, for custom orchestration. See `LemmaConfig` type for all configuration options.

## ZK Circuit

This package includes a [Circom circuit](https://github.com/lemmaoracle/lemma/blob/main/packages/x402/circuits/README.md) (`circuits/payment.circom`) that generates a Groth16 proof of a valid x402 payment. Commitment: `Poseidon6(txHashLow, txHashHigh, recipientLow, amount, timestamp, minAmount)`.

## Development

```bash
pnpm install
pnpm build          # compile TypeScript
pnpm build:circuit  # build the Circom circuit
pnpm test           # run tests
pnpm register       # register circuit with Lemma (requires env vars)
```

## License

Apache-2.0
