#!/usr/bin/env tsx
/**
 * Seed a DNS domain-verification document (identity/dns feed).
 *
 * Runs the standard proof pipeline for the domain-dns feed: query the
 * domain's `_lemma.<domain>` TXT record via DNS-over-HTTPS, commit the
 * compact structure, generate a Groth16 proof per leaf (~6), and register
 * the document + proofs on the Lemma API. Idempotent — re-running against
 * an unchanged record re-registers the same docHash (INSERT-OR-IGNORE),
 * so periodic freshness re-verification does not grow the registry.
 *
 * This is the Level-2 layer of issuer verification (#766): the commitment
 * binds the queried domain, the DNS answer, and the fetch time. Consumers
 * match `attributes["meta.orgDid"]` against an org-identity-v1 commitment
 * for the same domain.
 *
 * Requires (secrets — run by the key holder, not committed):
 *   LEMMA_API_BASE        e.g. https://workers.lemma.workers.dev
 *   LEMMA_API_KEY         a key for the lemma-data scope
 *   LEMMA_DOMAIN          the domain to verify (e.g. frame00.com)
 *   HOLIDAYS_CIRCUIT_ID   the Merkle-inclusion circuit id (same as the other feeds)
 * Optional:
 *   FEED_MAX_DEPTH        Merkle depth, must match the circuit (default 16)
 *   DNS_SCHEMA            document schema (default dns-domain-verify.v1)
 *   LEMMA_DOH_URL         override the DoH resolver
 *   DRY_RUN=1             fetch + commit only; no registration/submission
 */

import { domainDns } from "../src/feeds/domain-dns.js";
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
    schema: process.env["DNS_SCHEMA"] ?? "dns-domain-verify.v1",
    maxDepth: Number(process.env["FEED_MAX_DEPTH"] ?? "16"),
    dryRun,
  };

  console.log(
    `Seeding domain verification for ${required("LEMMA_DOMAIN")} (dryRun=${dryRun})`,
  );
  const result = await runProofPipeline(domainDns, config);
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
