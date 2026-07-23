#!/usr/bin/env -S npx tsx
/**
 * Forex Proof Pipeline — multi-source entry point.
 *
 * Source feeds: data-commitment-v1 proofs (per-leaf inclusion)
 * Composite feed: forex-average-v1 proofs (average rate verification)
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
  runProofPipeline,
  runAverageProofPipeline,
} from "./src/index.js";

const API_KEY = process.env["LEMMA_API_KEY"];
const DRY_RUN = process.env["DRY_RUN"] === "1";
const API_BASE = process.env["LEMMA_API_BASE"] ?? "https://workers.lemma.workers.dev";

if (!DRY_RUN && !API_KEY) {
  throw new Error("LEMMA_API_KEY not set (required for submission)");
}

console.log("=== Forex Multi-Source Proof Pipeline ===");
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
console.log(`Feeds: forex/frankfurter, forex/er-api, forex/composite\n`);

// Source feeds: data-commitment-v1 proofs
const sourceConfig = {
  apiBase: API_BASE,
  apiKey: API_KEY ?? "",
  circuitId: "data-commitment-v1.1" as const,
  schema: "canonical-sort-v1",
  maxDepth: 16,
  dryRun: DRY_RUN,
};

console.log(`\n── Source A: forex/frankfurter ──`);
const resultA = await runProofPipeline(frankfurterForex, sourceConfig);

console.log(`\n── Source B: forex/er-api ──`);
const resultB = await runProofPipeline(erApiForex, sourceConfig);

// Composite: forex-average-v1 proofs
const averageConfig = {
  apiBase: API_BASE,
  apiKey: API_KEY ?? "",
  circuitId: "forex-average-v1" as const,
  schema: "canonical-sort-v1",
  maxDepth: 16,
  dryRun: DRY_RUN,
};

console.log(`\n── Composite: forex/composite (forex-average-v1) ──`);
const resultC = await runAverageProofPipeline(forexComposite, averageConfig);

const totalFail = resultA.proofsFail + resultB.proofsFail + resultC.proofsFail;
if (totalFail > 0) process.exit(1);
