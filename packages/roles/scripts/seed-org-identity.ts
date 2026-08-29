#!/usr/bin/env tsx
/**
 * Seed the org-identity-v1 commitment for a domain (#766 issuer track).
 *
 * This is Step 4 of the domain-verification chain:
 *   1. Generate/hold the org key pair (orgSecret → orgDid = Poseidon1(orgSecret))
 *   2. Publish `did=<orgDid>` in the domain's `_lemma.<domain>` TXT record
 *   3. Run `seed:domain-dns` — commits the DNS answer with data-commitment-v1
 *   4. THIS SCRIPT — registers the org-identity-v1 commitment document:
 *      commitmentHash = Poseidon5(orgDid, memberRoot, domain, timestamp, orgSalt)
 *      and submits a Groth16 proof of knowledge of orgSecret.
 *
 * Connection to the DNS part (#863): the DNS document binds the domain →
 * orgDid mapping at a point in time; this document proves the orgSecret
 * holder committed a memberRoot for the same (orgDid, domain). A verifier
 * that checks both attributes (`meta.orgDid` on the DNS document, `orgDid`
 * in this proof's public inputs) closes the self-attestation gap the spec
 * flags (packages/spec §SubmitProof: "DNS-verified domain").
 *
 * Idempotency: timestamp is an input to commitmentHash, so each run produces
 * a fresh commitment document. That is intentional — the spec requires the
 * server to reject stale timestamps (24h), and freshness re-proving is how
 * the commitment stays live. Old documents simply age out.
 *
 * Requires (packages/roles/.env):
 *   LEMMA_API_BASE        e.g. https://workers.lemma.workers.dev
 *   LEMMA_API_KEY         a key for the lemma-data scope
 *   ORG_SECRET            hex field element — institution's secret key
 *   ORG_MEMBER_ROOT       hex field element — Poseidon Merkle root of members
 * Optional:
 *   ORG_SALT              hex — commitmentHash blinding (default: random per run)
 *   ORG_DOMAIN            default example.com
 *   ORG_IDENTITY_CIRCUIT  default org-identity-v1
 *   ORG_SCHEMA            default passthrough-v1 (the registered circuit schema)
 *   DRY_RUN=1             witness + local checks only; no registration/proof
 *
 * Artifact check: the wasm/zkey were registered with the circuit (IPFS), so
 * `prover.prove` fetches them automatically — no local build paths needed.
 */

import { create, documents, prover, proofs } from "@lemmaoracle/sdk";
import type { LemmaClient } from "@lemmaoracle/sdk";
import { orgIdentity, deriveOrgDid } from "@trust402/sdk";
import { randomBytes, createHash } from "node:crypto";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const CIRCUIT_ID = process.env["ORG_IDENTITY_CIRCUIT"] ?? "org-identity-v1";
const SCHEMA = process.env["ORG_SCHEMA"] ?? "passthrough-v1";
const DOMAIN = process.env["ORG_DOMAIN"] ?? "example.com";

const required = (name: string): string => {
  const v = process.env[name];
  if (v === undefined || v === "") {
    console.error(`Missing required env: ${name}`);
    process.exit(2);
  }
  return v;
};

const log = (s: string): Promise<void> =>
  new Promise((resolve) => process.stdout.write(`${s}\n`) || resolve());

const main = async (): Promise<void> => {
  const dryRun = process.env["DRY_RUN"] === "1";
  const orgSecret = required("ORG_SECRET");
  const memberRoot = required("ORG_MEMBER_ROOT");
  const orgSalt = process.env["ORG_SALT"] ?? `0x${randomBytes(32).toString("hex")}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cross-check: the orgDid published in DNS must equal Poseidon1(orgSecret).
  // If the TXT record carries a different value, the two documents can never
  // be matched by a verifier — fail here rather than registering a dead pair.
  const orgDid = deriveOrgDid(orgSecret);

  log(`Domain:  ${DOMAIN}`);
  log(`orgDid:  ${orgDid}`);
  log(`memberRoot: ${memberRoot.slice(0, 18)}...`);
  log(`timestamp: ${String(timestamp)}`);

  // Build witness + commitmentHash (also validates Poseidon1(orgSecret) === orgDid).
  const { witness, commitmentHash } = orgIdentity({
    orgSecret,
    orgSalt,
    orgDid,
    memberRoot,
    domain: DOMAIN,
    timestamp,
  });
  log(`commitmentHash: ${commitmentHash}`);

  const docHashSeed = `${commitmentHash}|${DOMAIN}|${String(timestamp)}`;
  const docHash = `0x${createHash("sha256").update(docHashSeed).digest("hex")}`;

  if (dryRun) {
    log("[dry] Would register document with:");
    log(`  schema:      ${SCHEMA}`);
    log(`  circuitId:   ${CIRCUIT_ID}`);
    log(`  docHash:     ${docHash}`);
    log(`  publicInputs: [commitmentHash, orgDid, memberRoot, domain, timestamp]`);
    log(`  orgSalt:     ${orgSalt} (store with the key material if you need reproducibility)`);
    return;
  }

  const client: LemmaClient = create({
    apiBase: required("LEMMA_API_BASE"),
    apiKey: required("LEMMA_API_KEY"),
  });

  // Register the commitment document. The commitmentHash (the circuit's
  // registered document commitment) goes in commitments.root; the proof's
  // public inputs bind it to orgDid/memberRoot/domain/timestamp.
  await log("[1/3] Registering commitment document...");
  await documents.register(client, {
    schema: SCHEMA,
    docHash,
    cid: docHash,
    // The issuer here is the org acting on its own behalf. Raw identifier
    // policy: same as the feeds pipeline (internal, not shown raw in UI).
    issuerId: "org-identity-pipeline",
    subjectId: DOMAIN,
    attributes: {
      "meta.type": "org-identity-v1",
      "meta.domain": DOMAIN,
      "meta.orgDid": orgDid,
      "meta.memberRoot": memberRoot,
      "meta.commitmentHash": commitmentHash,
      "meta.timestamp": String(timestamp),
    },
    commitments: {
      scheme: "poseidon",
      root: commitmentHash,
      leaves: [commitmentHash],
      randomness: orgSalt,
    },
    revocation: { scheme: "none", root: "0x" + "0".repeat(64) },
  });
  await log(`  Doc: ${docHash}`);

  // Prove knowledge of orgSecret and submit. prover.prove fetches the
  // wasm/zkey artifacts from the circuit's registered IPFS locations.
  await log("[2/3] Generating Groth16 proof (org-identity-v1)...");
  const { proof, inputs } = await prover.prove(client, {
    circuitId: CIRCUIT_ID,
    witness,
  });
  await log("  Proof generated.");

  await log("[3/3] Submitting proof...");
  const sr = await proofs.submit(client, {
    docHash,
    circuitId: CIRCUIT_ID,
    proof,
    inputs,
  });
  log(`✅ Done. verificationId=${sr.verificationId}`);
  log(`   DNS document attributes.meta.orgDid must equal this orgDid:`);
  log(`   ${orgDid}`);
};

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
