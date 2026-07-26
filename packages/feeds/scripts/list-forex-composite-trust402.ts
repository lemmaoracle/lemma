#!/usr/bin/env -S npx tsx
/**
 * List today's (or DATE=) forex/composite/latest fetcher envelope on Trust402.
 *
 * Intended as a post-step after `forex-proof-pipeline.ts` (independent script).
 *
 * Run from packages/feeds:
 *   DRY_RUN=1 npx tsx scripts/list-forex-composite-trust402.ts
 *   LEMMA_API_KEY=... npx tsx scripts/list-forex-composite-trust402.ts
 *
 * Environment:
 *   DATE              — UTC YYYY-MM-DD (default: today). Past dates require archive.
 *   ARCHIVE_DIR       — envelope + listing receipts (default: .archives/forex-composite)
 *   FETCHER_URL       — fetcher Workers base (only if USE_FETCHER_WORKERS=1)
 *   USE_FETCHER_WORKERS=1 — call Workers `/fetch` instead of local fetchAndCommit
 *   LATEST_URL        — suite latest URL to fetch via fetcher
 *   LEMMA_API_BASE    — Trust402 / Lemma API base (default: https://trust402.lemma.workers.dev)
 *   LEMMA_API_KEY     — required unless DRY_RUN=1
 *   CIRCUIT_ID        — default data-commitment-v1.1
 *   FEED_MAX_DEPTH    — default 16
 *   DRY_RUN=1         — fetch/archive + validate leaves; skip publish + receipt
 *   TRUST402_DID      — seller DID (default: did:lemma:feeds-forex-composite)
 *   TRUST402_PRICE_USDC — micro-USDC (default: 0)
 *   TRUST402_ENV      — sandbox | production (default: sandbox)
 *   TRUST402_PAYOUT   — payout address when price > 0 and uploading file
 *   TRUST402_UPLOAD=0 — skip storefront file upload (proof + document only)
 */

import {
  DEFAULT_CIRCUIT_ID,
  DEFAULT_FETCHER_URL,
  DEFAULT_LATEST_URL,
  DEFAULT_MAX_DEPTH,
  listForexCompositeTrust402,
  utcDate,
} from "../src/list-forex-composite-trust402.js";

const dryRun = process.env["DRY_RUN"] === "1";
const apiKey = process.env["LEMMA_API_KEY"] ?? "";

const main = async (): Promise<void> => {
  const missingKey = !dryRun && apiKey === "";
  return missingKey
    ? Promise.reject(new Error("LEMMA_API_KEY not set (required unless DRY_RUN=1)"))
    : listForexCompositeTrust402({
        date: process.env["DATE"] ?? utcDate(),
        archiveDir:
          process.env["ARCHIVE_DIR"] ?? ".archives/forex-composite",
        fetcherUrl: process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL,
        latestUrl: process.env["LATEST_URL"] ?? DEFAULT_LATEST_URL,
        useFetcherWorkers: process.env["USE_FETCHER_WORKERS"] === "1",
        apiBase:
          process.env["LEMMA_API_BASE"] ?? "https://trust402.lemma.workers.dev",
        apiKey,
        circuitId: process.env["CIRCUIT_ID"] ?? DEFAULT_CIRCUIT_ID,
        maxDepth: Number(process.env["FEED_MAX_DEPTH"] ?? String(DEFAULT_MAX_DEPTH)),
        dryRun,
        did: process.env["TRUST402_DID"] ?? "did:lemma:feeds-forex-composite",
        priceUsdc: Number(process.env["TRUST402_PRICE_USDC"] ?? "0"),
        environment:
          process.env["TRUST402_ENV"] === "production" ? "production" : "sandbox",
        payoutAddress: process.env["TRUST402_PAYOUT"] ?? "",
        uploadFile: process.env["TRUST402_UPLOAD"] !== "0",
      }).then((result) => {
        console.log(`status:      ${result.status}`);
        console.log(`date:        ${result.date}`);
        console.log(`title:       ${result.title}`);
        console.log(`commitment:  ${result.commitment}`);
        console.log(`listingRoot: ${result.listingRoot ?? "(none)"}`);
        console.log(`cardId:      ${result.cardId ?? "(none)"}`);
        console.log(`envelope:    ${result.envelopePath}`);
        console.log(`receipt:     ${result.listingPath}`);
      });
};

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
