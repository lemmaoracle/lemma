#!/usr/bin/env tsx
/**
 * Seed the jp-holidays dataset (W0).
 *
 * Runs the standard proof pipeline for the jp-holidays feed: fetch the CSV,
 * commit the compact structure, generate a Groth16 proof per leaf (~5), and
 * register the document + proofs on the Lemma API. This is the Node-side
 * proof generation the Workers cron cannot do (snarkjs does not run in
 * workerd). It is idempotent — re-running against an unchanged CSV re-registers
 * the same docHash (INSERT-OR-IGNORE) and re-verifies the same proofs.
 *
 * Run it once now (so the endpoint is not empty before the first cron) and
 * again whenever the Cabinet Office publishes a new year.
 *
 * Requires (secrets — run by the key holder, not committed):
 *   LEMMA_API_BASE        e.g. https://workers.lemma.workers.dev
 *   LEMMA_API_KEY         a key for the lemma-data scope
 *   HOLIDAYS_CIRCUIT_ID   the Merkle-inclusion circuit id (same as the forex feeds)
 * Optional:
 *   FEED_MAX_DEPTH        Merkle depth, must match the circuit (default 16)
 *   HOLIDAYS_SCHEMA       document schema (default canonical-sort-v1)
 *   JP_HOLIDAYS_URL       override the source CSV url
 *   DRY_RUN=1             fetch + commit only; no registration/submission
 */

import { jpHolidays } from "../src/feeds/jp-holidays.js";
import { runProofPipeline } from "../src/pipeline.js";

const required = (name: string): string => {
  const v = process.env[name];
  if (v === undefined || v === "") {
    console.error(`Missing required env: ${name}`);
    process.exit(2);
  }
  return v;
};

const main = async (): Promise<void> => {
  const dryRun = process.env["DRY_RUN"] === "1";

  const config = {
    apiBase: dryRun ? (process.env["LEMMA_API_BASE"] ?? "") : required("LEMMA_API_BASE"),
    apiKey: dryRun ? (process.env["LEMMA_API_KEY"] ?? "") : required("LEMMA_API_KEY"),
    circuitId: dryRun
      ? (process.env["HOLIDAYS_CIRCUIT_ID"] ?? "dry-run")
      : required("HOLIDAYS_CIRCUIT_ID"),
    schema: process.env["HOLIDAYS_SCHEMA"] ?? "canonical-sort-v1",
    maxDepth: Number(process.env["FEED_MAX_DEPTH"] ?? "16"),
    dryRun,
  };

  console.log(`Seeding jp-holidays (dryRun=${dryRun})`);
  const result = await runProofPipeline(jpHolidays, config);
  console.log(
    `\nDone: docHash=${result.docHash}  leaves=${result.leafCount}  ` +
      `proofs ✅ ${result.proofsOk} / ❌ ${result.proofsFail}`,
  );
  if (result.proofsFail > 0) process.exit(1);
};

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
