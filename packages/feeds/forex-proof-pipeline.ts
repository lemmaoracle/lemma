#!/usr/bin/env -S npx tsx
/**
 * Forex Proof Pipeline — multi-source entry point.
 *
 * Runs three feeds sequentially:
 *   1. forex/ecb (Frankfurter)     — source proofs
 *   2. forex/er-api (ExchangeRate) — source proofs
 *   3. forex/composite             — averaged rates, bound to source roots
 *
 * Run from packages/feeds:
 *   LEMMA_API_KEY=... npx tsx forex-proof-pipeline.ts
 *
 * Environment:
 *   LEMMA_API_KEY  — Lemma API key (required for submission)
 *   LEMMA_API_BASE — Lemma API base URL (default: workers.lemma.workers.dev)
 *   FOREX_BASE     — Base currency (default: USD)
 *   DRY_RUN        — If "1", skip submission
 */

import {
  frankfurterForex,
  erApiForex,
  forexComposite,
  runMultiPipeline,
} from "./src/index.js";

const API_KEY = process.env["LEMMA_API_KEY"];
const DRY_RUN = process.env["DRY_RUN"] === "1";

if (!DRY_RUN && !API_KEY) {
  throw new Error("LEMMA_API_KEY not set (required for submission)");
}

console.log("=== Forex Multi-Source Proof Pipeline ===");
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
console.log(`Feeds: forex/ecb, forex/er-api, forex/composite\n`);

const result = await runMultiPipeline(
  [
    frankfurterForex, // source A — Frankfurter (ECB)
    erApiForex,       // source B — ExchangeRate-API (free tier)
    forexComposite,   // product  — averaged rates, bound to A+B roots
  ],
  {
    apiBase:
      process.env["LEMMA_API_BASE"] ?? "https://workers.lemma.workers.dev",
    apiKey: API_KEY ?? "",
    circuitId: "data-commitment-v1.1",
    schema: "canonical-sort-v1",
    maxDepth: 16,
    dryRun: DRY_RUN,
  },
);

if (result.totalProofsFail > 0) process.exit(1);
