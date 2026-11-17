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
 * for the same domain — published in the record as `oid=` (added 2026-11
 * for the Proof Card issuer check; old `did=`-only records keep parsing).
 *
 * TXT contract:
 *   _lemma.<domain>  TXT  "v=lemma1 did=<poseidon-hex> [oid=<orgIdentityDocHash>] [verified=<iso8601>]"
 *
 * The run prints the live record (`did=` + `oid=`) after the pipeline so the
 * operator can cross-check what was committed. `oid=` is the docHash of the
 * domain's latest org-identity-v1 commitment (`packages/roles
 * seed:org-identity`) — the Proof Card issuer check (CLUBS 側・別 PR) follows
 * did → oid → proof, so a domain that wants to be trusted there must publish
 * both.
 *
 * `ORG_IDENTITY_DOC_HASH` (optional) pins the intended oid when the live TXT
 * does not carry `oid=` yet (e.g. seeding the document before the record goes
 * live): the registered attributes then carry `meta.oid` from the env, and
 * the recommended TXT line is printed for the operator to publish. If the
 * live record already carries a different `oid=`, the run fails (see
 * `resolveOid` in ../src/feeds/domain-dns.ts).
 *
 * Requires (secrets — run by the key holder, not committed):
 *   LEMMA_API_BASE        e.g. https://workers.lemma.workers.dev
 *   LEMMA_API_KEY         a key for the lemma-data scope
 *   LEMMA_DOMAIN          the domain to verify (e.g. example.com)
 *   HOLIDAYS_CIRCUIT_ID   the Merkle-inclusion circuit id (same as the other feeds)
 * Optional:
 *   FEED_MAX_DEPTH        Merkle depth, must match the circuit (default 16)
 *   DNS_SCHEMA            document schema (default dns-domain-verify.v1)
 *   LEMMA_DOH_URL         override the DoH resolver
 *   ORG_IDENTITY_DOC_HASH pin the intended oid= (org-identity docHash) when
 *                         the TXT record does not carry it yet
 *   DRY_RUN=1             fetch + commit only; no registration/submission
 */

import { domainDns } from "../src/feeds/domain-dns.js";
import {
  lemmaAnswer,
  lemmaTxtName,
  parseLemmaTxt,
  resolveOid,
  txtAnswers,
} from "../src/feeds/domain-dns.js";
import { runProofPipeline } from "../src/pipeline.js";

const required = (name: string): string => {
  const v = process.env[name];
  if (v === undefined || v === "") {
    console.error(`Missing required env: ${name}`);
    process.exit(2);
  }
  return v;
};

/**
 * Print the live TXT record (did + oid) for the operator. One extra DoH query,
 * uncommitted — the committed snapshot comes from the pipeline's own fetch.
 * Never throws: a display failure must not abort the seed.
 */
const printRecord = async (domain: string): Promise<string> => {
  const envOid = (process.env["ORG_IDENTITY_DOC_HASH"] ?? "").trim();
  const doh = process.env["LEMMA_DOH_URL"] ?? "https://cloudflare-dns.com/dns-query";
  const name = lemmaTxtName(domain);
  const url = `${doh}?name=${encodeURIComponent(name)}&type=TXT`;
  return fetch(url, { headers: { accept: "application/dns-json" } })
    .then((res) => res.json())
    .then((json) => parseLemmaTxt(lemmaAnswer(txtAnswers(json, name), domain), domain))
    .then((record) => {
      const live = record.orgIdentityDocHash;
      const effective = resolveOid(live, envOid);
      const lines = [
        `TXT _lemma.${domain}: did=${record.orgDid}` +
          ` oid=${effective ?? "(none — Proof Card の発行者確認には org-identity の docHash を oid= で公開してください)"}` +
          (record.verifiedAt === null ? "" : ` verified=${record.verifiedAt}`),
      ];
      if (live === null && effective !== null) {
        lines.push(
          `  ⚠ 権威 DNS に oid= がまだありません（snapshot は ORG_IDENTITY_DOC_HASH を代用）。` +
            `公開するレコード: "v=lemma1 did=${record.orgDid} oid=${effective}"` +
            (record.verifiedAt === null ? "" : ` verified=${record.verifiedAt}`),
        );
      }
      return lines.join("\n");
    })
    .catch(
      (e: unknown) =>
        `TXT _lemma.${domain}: 取得に失敗しました (${e instanceof Error ? e.message : String(e)})`,
    );
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

  const domain = required("LEMMA_DOMAIN");
  console.log(`Seeding domain verification for ${domain} (dryRun=${dryRun})`);
  const result = await runProofPipeline(domainDns, config);
  console.log(
    `\nDone: docHash=${result.docHash}  leaves=${result.leafCount}  ` +
      `proofs ✅ ${result.proofsOk} / ❌ ${result.proofsFail}`,
  );
  console.log(await printRecord(domain));
  if (result.proofsFail > 0) process.exit(1);
};

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
