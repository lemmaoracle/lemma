#!/usr/bin/env node
/**
 * Seed the TEST-ONLY demo vendor bundle for account-change-v1 (Proof Card).
 *
 * ⚠ TEST-ONLY — never use in production. Every key below is a fixed demo
 * default (or an env override intended for tests). The demo secret is
 * public knowledge by construction, so a proof made from it proves
 * nothing about a real holder — never point a production registry or a
 * real bank account at this bundle.
 *
 * The bundle is the shared contract between the gate (CLUBS) and a
 * partner-side prover:
 *
 *   - `registryRoot` / `vendorId` / `requiredRoleHash` configure the
 *     gate's demo registry (gate-fixed public inputs),
 *   - `credential` is what the prover side turns into a witness
 *     (recomputing `credentialCommitment` exactly as below),
 *   - `oldAccount` / `oldAccountHash` is the partner's INITIAL registered
 *     account: the gate records `oldAccountHash` until the first accepted
 *     change (`isFirst = 1` flips it to 0).
 *
 * Derivations — the circuit leaf layout, imported from the SINGLE SOURCE
 * shared with the circuit test (circuits/src/derivations.ts; the test
 * pins the values):
 *
 *   repSecret            = toScalar(DEMO_VENDOR_SECRET)
 *   credentialSalt       = toScalar(DEMO_VENDOR_SALT)
 *   vendorId             = Poseidon1(toScalar("lemma:vendor:demo"))
 *   roleHash             = Poseidon1(toScalar("lemma:role:" + DEMO_ROLE_NAME))
 *   requiredRoleHash     = Poseidon1(toScalar("lemma:role:account-change"))  (golden)
 *   legalNameHash        = toScalar(normalize(DEMO_LEGAL_NAME))
 *   holderNameHash       = toScalar(normalize(DEMO_OLD_HOLDER))
 *   credentialCommitment = Poseidon4(identityHash, authorityHash, lifecycleHash, credentialSalt)
 *     identityHash  = Poseidon2(vendorId, Poseidon1(repSecret))
 *     authorityHash = Poseidon2(roleHash, legalNameHash)
 *     lifecycleHash = Poseidon4(status, validFrom, validUntil, registeredAt)
 *   oldAccountHash       = Poseidon6(1101, bank, branch, type, number, holderNameHash)
 *
 * `toScalar` is the SDK's `commitments.toScalar` (strings: SHA-256 of the
 * UTF-8 bytes mod r) — the same function the gate and the prover side
 * use, so all sides derive identical values by construction.
 *
 * Name normalization: the circuit requires `holderNameHash ===
 * legalNameHash` (holder binding). This demo assumes the shared
 * normalizer `trim + ASCII uppercase` — the defaults ("Demo Vendor K.K."
 * and "DEMO VENDOR K.K.") normalize to the same string. Production sides
 * must agree on one normalizer (README「Operational definitions」);
 * this script fails fast if the two names normalize apart.
 *
 * `vendorId` is an opaque gate-fixed public input (arbitrary in the
 * circuit). The demo derives it deterministically as
 * `Poseidon1(toScalar("lemma:vendor:demo"))` so the bundle is stable.
 *
 * Timestamps (unix seconds, from DEMO_NOW in ms — default Date.now()):
 *   validFrom     = now − 30d
 *   validUntil    = now + 365d
 *   registeredAt  = now − 30d
 * The registry root changes on every run (lifecycleHash includes the
 * times) — re-run and re-configure the gate together.
 *
 * The Merkle tree is the test's depth-20 Poseidon2 tree (empty leaf 0)
 * with the single demo credential at index 0 — imported, not copied.
 *
 * Usage:  npx tsx scripts/seed-demo-vendor.ts
 * Env (all optional, fixed TEST defaults):
 *   DEMO_VENDOR_SECRET   default "demo-vendor-secret-1"
 *   DEMO_VENDOR_SALT     default "demo-vendor-salt-1"
 *   DEMO_ROLE_NAME       default "account-change" (→ roleHash == requiredRoleHash)
 *   DEMO_LEGAL_NAME      default "Demo Vendor K.K."
 *   DEMO_OLD_BANK        default "0001"
 *   DEMO_OLD_BRANCH      default "001"
 *   DEMO_OLD_TYPE        default "1"
 *   DEMO_OLD_NUMBER      default "1234567"
 *   DEMO_OLD_HOLDER      default "DEMO VENDOR K.K."
 *   DEMO_NOW             ms epoch (default Date.now())
 *
 * Writes `demo-vendor.example.json` at the package root (committed
 * example of one run) and prints the same JSON to stdout.
 */
import { toScalar } from "@lemmaoracle/sdk";
import { poseidon1 } from "poseidon-lite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  accountHashOf,
  credentialCommitmentOf,
  merklePathFor,
} from "../circuits/src/derivations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(PKG_ROOT, "demo-vendor.example.json");

// ── TEST-ONLY demo constants (fixed defaults; env overrides for tests) ─────

const env = (name: string, fallback: string): string => {
  const v = process.env[name];
  return v === undefined || v === "" ? fallback : v;
};

/** ⚠ TEST-ONLY demo secret — public by construction. Never production. */
const DEMO_VENDOR_SECRET = env("DEMO_VENDOR_SECRET", "demo-vendor-secret-1");
/** ⚠ TEST-ONLY demo salt. */
const DEMO_VENDOR_SALT = env("DEMO_VENDOR_SALT", "demo-vendor-salt-1");
/** ⚠ TEST-ONLY demo role. Must stay "account-change" for roleHash == requiredRoleHash. */
const DEMO_ROLE_NAME = env("DEMO_ROLE_NAME", "account-change");
/** ⚠ TEST-ONLY demo legal name. */
const DEMO_LEGAL_NAME = env("DEMO_LEGAL_NAME", "Demo Vendor K.K.");

/** Demo old account (the partner's INITIAL registered account). ⚠ TEST-ONLY. */
const DEMO_OLD_BANK = env("DEMO_OLD_BANK", "0001");
const DEMO_OLD_BRANCH = env("DEMO_OLD_BRANCH", "001");
const DEMO_OLD_TYPE = env("DEMO_OLD_TYPE", "1");
const DEMO_OLD_NUMBER = env("DEMO_OLD_NUMBER", "1234567");
const DEMO_OLD_HOLDER = env("DEMO_OLD_HOLDER", "DEMO VENDOR K.K.");

/** ⚠ TEST-ONLY demo clock (ms) — all credential times derive from it. */
const DEMO_NOW_MS = Number(env("DEMO_NOW", String(Date.now())));

// ── circuit constants ──────────────────────────────────────────────────────

const CIRCUIT_ID = "account-change-v1";
const CREDENTIAL_STATUS = 1;

/** Golden value pinned by circuits/test/account-change.test.ts. */
const REQUIRED_ROLE_HASH_GOLDEN =
  2666895405497814583936866908763331297856096727475110877642173956138533085004n;

// ── derivations ────────────────────────────────────────────────────────────

const ROLE_TAG = "lemma:role:";
const VENDOR_TAG = "lemma:vendor:";

/** The demo shared name normalizer: trim + ASCII uppercase (see header). */
const normalizeName = (name: string): string => name.trim().toUpperCase();

const roleHashOf = (roleName: string): bigint =>
  poseidon1([toScalar(`${ROLE_TAG}${roleName}`)]);

// ── main ───────────────────────────────────────────────────────────────────

type DemoVendorBundle = Readonly<{
  registryRoot: string;
  vendorId: string;
  requiredRoleHash: string;
  credential: Readonly<{
    repSecret: string;
    roleName: string;
    legalName: string;
    credentialStatus: number;
    validFrom: number;
    validUntil: number;
    registeredAt: number;
    credentialSalt: string;
    merklePath: ReadonlyArray<string>;
    merkleIndices: ReadonlyArray<string>;
  }>;
  oldAccount: Readonly<{
    bankCode: string;
    branchCode: string;
    accountType: string;
    accountNumber: string;
    holderName: string;
  }>;
  oldAccountHash: string;
  circuitId: string;
}>;

const main = (): void => {
  console.error("⚠ TEST-ONLY — never use in production — demo vendor bundle (fixed demo keys).");

  const repSecret = toScalar(DEMO_VENDOR_SECRET);
  const credentialSalt = toScalar(DEMO_VENDOR_SALT);

  // Gate-fixed public inputs of the demo registry.
  const vendorId = poseidon1([toScalar(`${VENDOR_TAG}demo`)]); // documented constant
  const requiredRoleHash = roleHashOf("account-change");
  if (DEMO_ROLE_NAME !== "account-change") {
    console.error(
      `⚠ DEMO_ROLE_NAME="${DEMO_ROLE_NAME}" != "account-change": the credential's ` +
        `roleHash will NOT match the gate's requiredRoleHash — proofs for this ` +
        `bundle will fail the authority check (use only for negative tests).`,
    );
  }
  if (requiredRoleHash !== REQUIRED_ROLE_HASH_GOLDEN) {
    console.error(
      `❌ requiredRoleHash mismatch: got ${requiredRoleHash}, expected the golden value ` +
        `pinned by the circuit test. toScalar or the role definition changed — ` +
        `that is a policy change (see README「Operational definitions」).`,
    );
    process.exit(1);
  }

  // Holder binding: both name hashes come from the shared normalizer and
  // must agree, or the circuit could never prove a change for this bundle.
  const legalNameHash = toScalar(normalizeName(DEMO_LEGAL_NAME));
  const holderNameHash = toScalar(normalizeName(DEMO_OLD_HOLDER));
  if (legalNameHash !== holderNameHash) {
    console.error(
      `❌ holder binding impossible: normalize("${DEMO_LEGAL_NAME}") and ` +
        `normalize("${DEMO_OLD_HOLDER}") differ. The circuit requires ` +
        `holderNameHash === legalNameHash — fix DEMO_LEGAL_NAME / DEMO_OLD_HOLDER ` +
        `(demo normalizer: trim + ASCII uppercase).`,
    );
    process.exit(1);
  }

  const nowSec = Math.floor(DEMO_NOW_MS / 1000);
  const DAY = 24 * 60 * 60;
  const validFrom = nowSec - 30 * DAY;
  const validUntil = nowSec + 365 * DAY;
  const registeredAt = nowSec - 30 * DAY;

  const credentialCommitment = credentialCommitmentOf({
    repSecret,
    vendorId,
    roleHash: roleHashOf(DEMO_ROLE_NAME),
    legalNameHash,
    credentialStatus: BigInt(CREDENTIAL_STATUS),
    validFrom: BigInt(validFrom),
    validUntil: BigInt(validUntil),
    registeredAt: BigInt(registeredAt),
    credentialSalt,
  });

  const merkle = merklePathFor(new Map([[0, credentialCommitment]]), 0);

  const oldAccountHash = accountHashOf({
    bankCode: BigInt(DEMO_OLD_BANK),
    branchCode: BigInt(DEMO_OLD_BRANCH),
    accountType: BigInt(DEMO_OLD_TYPE),
    accountNumber: BigInt(DEMO_OLD_NUMBER),
    holderNameHash,
  });

  const bundle: DemoVendorBundle = {
    registryRoot: merkle.root.toString(),
    vendorId: vendorId.toString(),
    requiredRoleHash: requiredRoleHash.toString(),
    credential: {
      repSecret: repSecret.toString(),
      roleName: DEMO_ROLE_NAME,
      legalName: DEMO_LEGAL_NAME,
      credentialStatus: CREDENTIAL_STATUS,
      validFrom,
      validUntil,
      registeredAt,
      credentialSalt: credentialSalt.toString(),
      merklePath: merkle.path,
      merkleIndices: merkle.indices,
    },
    oldAccount: {
      bankCode: DEMO_OLD_BANK,
      branchCode: DEMO_OLD_BRANCH,
      accountType: DEMO_OLD_TYPE,
      accountNumber: DEMO_OLD_NUMBER,
      holderName: DEMO_OLD_HOLDER,
    },
    oldAccountHash: oldAccountHash.toString(),
    circuitId: CIRCUIT_ID,
  };

  const json = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(OUT_PATH, json, "utf8");

  console.log(json);
};

main();
