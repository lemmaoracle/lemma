#!/usr/bin/env -S npx tsx
/**
 * Forex Proof Pipeline entry point.
 *
 * Run from packages/feeds:
 *   cd /root/lemmaoracle/lemma/packages/feeds
 *   LEMMA_API_KEY=... npx tsx forex-proof-pipeline.ts
 *
 * Environment:
 *   LEMMA_API_KEY   — Lemma API key (required for submission)
 *   LEMMA_API_BASE  — Lemma API base URL (default: workers.lemma.workers.dev)
 *   FOREX_BASE      — Base currency (default: USD)
 *   DRY_RUN         — If "1", skip submission
 */

import { frankfurterForex, runProofPipeline } from "./src/index.js";

const API_KEY = process.env["LEMMA_API_KEY"];
const DRY_RUN = process.env["DRY_RUN"] === "1";

if (!DRY_RUN && !API_KEY) throw new Error("LEMMA_API_KEY not set (required for submission)");

console.log("=== Forex Proof Pipeline ===");
console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

const result = await runProofPipeline(frankfurterForex, {
  apiBase: process.env["LEMMA_API_BASE"] ?? "https://workers.lemma.workers.dev",
  apiKey: API_KEY ?? "",
  circuitId: "data-commitment-v1.1",
  schema: "clubs.nippo.v1",
  maxDepth: 16,
  wasmPath: "../../packages/data-commitment/circuits/build/data-commitment-v1_js/data-commitment-v1.wasm",
  zkeyPath: "../../packages/data-commitment/circuits/build/data-commitment-v1_final.zkey",
  dryRun: DRY_RUN,
});

if (result.proofsFail > 0) process.exit(1);
