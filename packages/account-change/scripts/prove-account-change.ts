#!/usr/bin/env node
/**
 * Generate a REAL Groth16 proof for `account-change-v1` (ProofGate).
 *
 * This is the first-path prover: a local script that takes the demo
 * vendor bundle, the CLUBS-issued proof card (`GET /api/gate-card/{ref}`),
 * the vendor's new account and the bank-side evidence, and writes the
 * `{ proof, publicSignals }` JSON that the CLUBS submission page posts.
 *
 * ⚠ TEST-ONLY: the demo bundle is derived from fixed public demo keys
 * (`pnpm seed:demo-vendor`). Never point this at a production registry or a
 * real bank account.
 *
 * Usage:
 *   cd packages/account-change
 *   pnpm prove \
 *     --challenge https://prerelease.clubs.place/api/gate-card/{ref} \
 *     --number 7654321
 *
 * All options:
 *   --challenge <url|file|->  proof card payload (required)
 *   --bundle <file>           vendor bundle (default: ./demo-vendor.example.json)
 *   --ref <ref>               card ref (derived from the URL / payload otherwise)
 *   --bank <digits>           new account bank code   (default 0001)
 *   --branch <digits>         new account branch code (default 001)
 *   --type <1|2>              new account type        (default 1)
 *   --number <digits>         new account number      (required)
 *   --holder <name>           new account holder (default: the bundle's legal name)
 *   --evidence <text>         bank-side evidence text to hash
 *                             (default: the 照合番号 shown on the card)
 *   --evidence-hash <dec>     bank evidence hash, already computed
 *   --out <file>              output JSON (default ./account-change-proof.json)
 *   --submit                  POST the proof to CLUBS after generating it
 *   --clubs-base <url>        CLUBS origin for --submit (default: the challenge URL's)
 *   --wasm/--zkey/--vkey <f>  circuit artifacts (default: circuits/build/…)
 *   --no-verify               skip the local vkey check (not recommended)
 *   --verbose                 print the full proof JSON (it contains the proof)
 *
 * Public signal order is the 18-signal contract pinned in the package
 * README; `circuits/src/prover.ts` builds the witness and the expected
 * signals, and the script refuses to write a proof whose signals differ.
 */
import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { groth16 } from "snarkjs";
import { toScalar } from "@lemmaoracle/sdk";
import {
  CIRCUIT_ID,
  SIGNALS_LENGTH,
  buildProverInput,
  displayedRefOf,
  gateViewOf,
  scalarOf,
  type DemoVendorBundle,
  type GateCardView,
} from "../circuits/src/prover.js";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_DIR = path.join(PKG_ROOT, "circuits", "build");

const USAGE = `Generate a real Groth16 proof for ${CIRCUIT_ID}.

  pnpm prove --challenge <url|file|-> --number <new account number> [options]

Run with --help for the full option list.`;

type Options = ReturnType<typeof parseOptions>;

const parseOptions = () =>
  parseArgs({
    allowPositionals: false,
    options: {
      challenge: { type: "string" },
      bundle: {
        type: "string",
        default: path.join(PKG_ROOT, "demo-vendor.example.json"),
      },
      ref: { type: "string" },
      bank: { type: "string", default: "0001" },
      branch: { type: "string", default: "001" },
      type: { type: "string", default: "1" },
      number: { type: "string" },
      holder: { type: "string" },
      evidence: { type: "string" },
      "evidence-hash": { type: "string" },
      out: { type: "string", default: "account-change-proof.json" },
      submit: { type: "boolean", default: false },
      "clubs-base": { type: "string" },
      wasm: {
        type: "string",
        default: path.join(BUILD_DIR, "account-change_js", "account-change.wasm"),
      },
      zkey: {
        type: "string",
        default: path.join(BUILD_DIR, "account-change_final.zkey"),
      },
      vkey: {
        type: "string",
        default: path.join(BUILD_DIR, "account-change_vkey.json"),
      },
      "no-verify": { type: "boolean", default: false },
      verbose: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  }).values;

const required = (v: string | undefined, name: string): string =>
  v !== undefined && v.trim() !== ""
    ? v
    : (() => {
        throw new Error(`${name} is required\n\n${USAGE}`);
      })();

const readText = async (source: string): Promise<string> => {
  if (source === "-") {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin)
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks).toString("utf8");
  }
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source, { redirect: "error" });
    if (!res.ok) throw new Error(`challenge fetch failed: ${res.status} ${res.statusText}`);
    return res.text();
  }
  return fs.readFileSync(path.resolve(source), "utf8");
};

const refFromUrl = (source: string): string | undefined => {
  const m = /\/api\/gate-card\/([^/?#]+)/.exec(source);
  return m?.[1] ? decodeURIComponent(m[1]) : undefined;
};

const originOf = (source: string): string | undefined =>
  /^https?:\/\//i.test(source) ? new URL(source).origin : undefined;

/** The SDK's toScalar is the contract; make sure our mirror is the same. */
const assertScalarParity = (): void => {
  for (const sample of ["", "lemma:role:account-change", "clubs-gate", "123"]) {
    const sdk = toScalar(sample).toString();
    const local = scalarOf(sample).toString();
    if (sdk !== local)
      throw new Error(
        `toScalar parity check failed for ${JSON.stringify(sample)}: ` +
          `sdk=${sdk} local=${local} — do not prove with a diverged scalar.`,
      );
  }
};

const main = async (): Promise<void> => {
  const opts: Options = parseOptions();
  if (opts.help) {
    console.log(USAGE);
    return;
  }
  const challengeSource = required(opts.challenge, "--challenge");
  const accountNumber = required(opts.number, "--number (new account number)");

  const bundle = JSON.parse(fs.readFileSync(path.resolve(opts.bundle), "utf8")) as DemoVendorBundle;
  const challengeRaw = JSON.parse(await readText(challengeSource)) as unknown;
  const gate: GateCardView = gateViewOf(challengeRaw);
  const ref = opts.ref ?? refFromUrl(challengeSource) ?? gate.ref ?? undefined;

  const evidenceHash = opts["evidence-hash"];
  const evidenceText =
    evidenceHash !== undefined
      ? undefined
      : opts.evidence !== undefined
        ? opts.evidence
        : ref !== undefined
          ? displayedRefOf(ref)
          : undefined;
  if (evidenceHash === undefined && evidenceText === undefined)
    throw new Error(
      "bank evidence is required: pass --evidence <text> or --evidence-hash <decimal> " +
        "(or a --ref so the 照合番号 can be hashed)",
    );

  assertScalarParity();

  const { input, expectedPublicSignals, derivation } = buildProverInput({
    bundle,
    gate,
    account: {
      bankCode: opts.bank,
      branchCode: opts.branch,
      accountType: opts.type,
      accountNumber,
      ...(opts.holder !== undefined ? { holderName: opts.holder } : {}),
    },
    ...(evidenceHash !== undefined
      ? { bankEvidenceHash: evidenceHash }
      : { bankEvidenceText: evidenceText }),
  });

  if (!fs.existsSync(opts.wasm)) throw new Error(`wasm not found: ${opts.wasm}`);
  if (!fs.existsSync(opts.zkey)) throw new Error(`zkey not found: ${opts.zkey}`);
  if (!opts["no-verify"] && !fs.existsSync(opts.vkey))
    throw new Error(
      `vkey not found: ${opts.vkey}\n` +
        "Build the circuit first (cd circuits && npm install && npm run build), " +
        "or pass --no-verify (the CLUBS stage-1 check will fail without a matching vkey).",
    );

  console.log(`circuit   ${CIRCUIT_ID}`);
  console.log(`ref       ${ref ?? "(unknown)"}`);
  if (evidenceText !== undefined) console.log(`evidence  ${JSON.stringify(evidenceText)} (hashed)`);
  console.log(`new acct  ${opts.bank}-${opts.branch}-${opts.type} ****${accountNumber.slice(-4)}`);

  const { proof, publicSignals } = await groth16.fullProve(input, opts.wasm, opts.zkey);

  if (publicSignals.length !== SIGNALS_LENGTH)
    throw new Error(
      `snarkjs returned ${publicSignals.length} public signals, expected ${SIGNALS_LENGTH}`,
    );
  const mismatches = expectedPublicSignals
    .map((want, i) => (String(publicSignals[i]) === want ? null : i))
    .filter((i): i is number => i !== null);
  if (mismatches.length > 0)
    throw new Error(
      `public signals do not match the prover derivation at index ` +
        `${mismatches.join(", ")} — refusing to write a divergent proof`,
    );

  if (!opts["no-verify"]) {
    const vkey = JSON.parse(fs.readFileSync(opts.vkey, "utf8")) as object;
    const valid = await groth16.verify(vkey, publicSignals, proof);
    if (!valid)
      throw new Error(
        "local verification failed: the artifacts do not match the circuit " +
          "(rebuild wasm/zkey/vkey together)",
      );
    console.log("verify    ok (local vkey)");
  }

  const output = {
    circuitId: CIRCUIT_ID,
    ...(ref !== undefined ? { ref } : {}),
    proof,
    publicSignals,
  };
  fs.writeFileSync(path.resolve(opts.out), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`wrote     ${path.resolve(opts.out)}`);
  console.log(`nullifier ${derivation.nullifier}`);
  console.log(`new acct  ${derivation.newAccountHash} (hash)`);
  if (opts.verbose) console.log(JSON.stringify(output, null, 2));

  if (opts.submit) {
    if (ref === undefined) throw new Error("--submit needs a ref (pass --ref or a challenge URL)");
    const base = (opts["clubs-base"] ?? originOf(challengeSource) ?? "").replace(/\/+$/, "");
    if (!base) throw new Error("--submit needs --clubs-base when the challenge came from a file");
    const res = await fetch(`${base}/api/gate-card/${encodeURIComponent(ref)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        proof: JSON.stringify(proof),
        publicSignals,
      }),
      redirect: "error",
    });
    const text = await res.text();
    console.log(`submit    ${res.status} ${text}`);
    if (!res.ok) process.exitCode = 1;
  }
};

main().catch((e: unknown) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
});
