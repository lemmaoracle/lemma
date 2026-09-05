#!/usr/bin/env node
/**
 * BBS+ Selective Disclosure end-to-end verification (debug).
 *
 * Generates a development-only BBS+ key pair, signs sample attributes,
 * selectively discloses a subset, and verifies the proof via the
 * SelectiveDisclosure envelope round-trip.
 *
 * Keys printed here are DEBUG ONLY — do not use in production.
 * Production issuers must inject secretKey via Workers secrets.
 *
 * Run (from monorepo root):
 *   node --import tsx/esm packages/sdk/scripts/verify-disclose-e2e.ts
 */
import { create } from "../src/client.js";
import {
  generateKeyPair,
  sign,
  createProof,
  fromSelectiveDisclosure,
  toSelectiveDisclosure,
  verifyProof,
  payloadToMessages,
  reveal,
} from "../src/disclose.js";
import { bytesToHex } from "../src/platform.js";

const ISSUER_ID = "lemma-debug-bbs-issuer";
const REVEAL_ATTRS = ["category", "event"] as const;

const samplePayload = {
  case_id: "case-2026-0904-001",
  event: "contribution.submitted",
  timestamp: "2026-09-04T11:30:00Z",
  category: "secret_input",
  subject: "mizudako-contributor-1",
} as const;

const log = (msg: string): void => {
  // eslint-disable-next-line functional/no-expression-statements -- script CLI output
  console.log(msg);
};

const fail = (step: string, detail: string): never => {
  // eslint-disable-next-line functional/no-expression-statements -- script CLI output
  console.error(`FAIL [${step}]: ${detail}`);
  // eslint-disable-next-line functional/no-expression-statements -- script exit
  process.exit(1);
};

const main = async (): Promise<void> => {
  log("═══════════════════════════════════════════════════");
  log("  BBS+ Selective Disclosure E2E (debug keys)");
  log("═══════════════════════════════════════════════════\n");

  const client = create({ apiBase: "http://localhost:8787" });
  const header = new TextEncoder().encode(ISSUER_ID);

  // ── Step 1: Key pair ──────────────────────────────────────────────
  log("Step 1: generateKeyPair...");
  const kp = await generateKeyPair({ keyInfo: header });
  const secretHex = bytesToHex(kp.secretKey);
  const publicHex = bytesToHex(kp.publicKey);

  if (kp.secretKey.length !== 32) {
    fail("generateKeyPair", `secretKey length ${kp.secretKey.length}, expected 32`);
  }
  if (kp.publicKey.length !== 96) {
    fail("generateKeyPair", `publicKey length ${kp.publicKey.length}, expected 96`);
  }

  log(`  ✓ secretKey: ${kp.secretKey.length} bytes`);
  log(`  ✓ publicKey: ${kp.publicKey.length} bytes (G2)`);
  log(`  secretKey (hex): ${secretHex}`);
  log(`  publicKey (hex): ${publicHex}`);
  log(`  secretKey prefix: ${secretHex.slice(0, 16)}…`);
  log(`  publicKey prefix: ${publicHex.slice(0, 16)}…\n`);

  // ── Step 2: Sign ──────────────────────────────────────────────────
  log("Step 2: sign sample attributes...");
  const messages = payloadToMessages(samplePayload);
  log(`  messages (${messages.length}): ${JSON.stringify(messages)}`);

  const signed = await sign(client, {
    messages,
    secretKey: kp.secretKey,
    header,
    issuerId: ISSUER_ID,
  });
  log(`  ✓ signature: ${signed.signature.length} bytes`);
  log(`  ✓ signed.publicKey: ${signed.publicKey.length} bytes\n`);

  // ── Step 3: Selective disclosure via createProof ──────────────────
  log(`Step 3: createProof (reveal: ${REVEAL_ATTRS.join(", ")})...`);
  const sd = await createProof({
    attributes: [...REVEAL_ATTRS],
    signed,
  });
  log(`  ✓ format: ${sd.format}`);
  log(`  ✓ disclosed attributes: ${JSON.stringify(sd.attributes)}`);
  log(`  ✓ indexes: ${JSON.stringify(sd.indexes)}`);
  log(`  ✓ count: ${sd.count}`);
  log(`  ✓ proof hex length: ${sd.proof.length}\n`);

  // ── Step 4: verifyProof via fromSelectiveDisclosure ───────────────
  log("Step 4: verifyProof(fromSelectiveDisclosure(sd))...");
  const verifyInput = fromSelectiveDisclosure(sd);
  const verified = await verifyProof(client, verifyInput);
  if (!verified) {
    fail("verifyProof", "verified === false");
  }
  log(`  ✓ verified: ${verified}\n`);

  // ── Step 5: Envelope round-trip (to → from → verify) ──────────────
  log("Step 5: toSelectiveDisclosure → fromSelectiveDisclosure round-trip...");
  // Re-derive RevealOutput path to exercise toSelectiveDisclosure explicitly
  const revealed = await reveal(client, {
    signature: signed.signature,
    messages,
    publicKey: signed.publicKey,
    indexes: sd.indexes,
    header,
  });
  const sd2 = toSelectiveDisclosure(revealed, {
    publicKey: signed.publicKey,
    header,
    count: messages.length,
  });
  const verified2 = await verifyProof(client, fromSelectiveDisclosure(sd2));
  if (!verified2) {
    fail("envelope-round-trip", "verified === false after to/from");
  }
  log(`  ✓ envelope attributes match: ${JSON.stringify(sd2.attributes)}`);
  log(`  ✓ envelope verified: ${verified2}\n`);

  // ── Summary ───────────────────────────────────────────────────────
  log("═══════════════════════════════════════════════════");
  log("  RESULT: ALL STEPS PASSED");
  log("═══════════════════════════════════════════════════");
  log("");
  log("DEBUG KEYS (do not commit to production secrets):");
  log(`secretKey=${secretHex}`);
  log(`publicKey=${publicHex}`);
};

main().catch((err: unknown) => {
  // eslint-disable-next-line functional/no-expression-statements -- script CLI output
  console.error("Unhandled error:", err);
  // eslint-disable-next-line functional/no-expression-statements -- script exit
  process.exit(1);
});
