#!/usr/bin/env tsx
/**
 * Seed the jp-postal-codes dataset (W0).
 *
 * Runs the standard proof pipeline for the jp-postal-codes feed: download the
 * ZIP from Japan Post, extract the CSV, commit the compact structure, generate
 * a Groth16 proof per leaf (~4), and register the document + proofs on the
 * Lemma API. This is the Node-side proof generation the Workers cron cannot do
 * (snarkjs does not run in workerd). It is idempotent — re-running against an
 * unchanged ZIP re-registers the same docHash (INSERT-OR-IGNORE) and
 * re-verifies the same proofs.
 *
 * Run it once now (so the endpoint is not empty before the first cron) and
 * again whenever Japan Post publishes an update.
 *
 * Requires (secrets — run by the key holder, not committed):
 *   LEMMA_API_BASE              e.g. https://workers.lemma.workers.dev
 *   LEMMA_API_KEY               a key for the lemma-data scope
 *   POSTAL_CODES_CIRCUIT_ID     the Merkle-inclusion circuit id (data-commitment-v1.1)
 * Optional:
 *   FEED_MAX_DEPTH              Merkle depth, must match the circuit (default 16)
 *   POSTAL_CODES_SCHEMA         document schema (default canonical-sort-v1)
 *   JP_POSTAL_CODES_URL         override the source ZIP url
 *   DRY_RUN=1                   fetch + commit only; no registration/submission
 */

import { jpPostalCodes } from "../src/feeds/jp-postal-codes.js";
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
    apiBase: dryRun
      ? (process.env["LEMMA_API_BASE"] ?? "")
      : required("LEMMA_API_BASE"),
    apiKey: dryRun
      ? (process.env["LEMMA_API_KEY"] ?? "")
      : required("LEMMA_API_KEY"),
    circuitId: dryRun
      ? (process.env["POSTAL_CODES_CIRCUIT_ID"] ?? "dry-run")
      : required("POSTAL_CODES_CIRCUIT_ID"),
    schema: process.env["POSTAL_CODES_SCHEMA"] ?? "canonical-sort-v1",
    maxDepth: Number(process.env["FEED_MAX_DEPTH"] ?? "16"),
    dryRun,
  };

  console.log(`Seeding jp-postal-codes (dryRun=${dryRun})`);
  const result = await runProofPipeline(jpPostalCodes, config);
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
