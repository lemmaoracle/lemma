#!/usr/bin/env -S npx tsx
/**
 * Forex Proof Pipeline — daily forex data → ZK proofs → Lemma submit
 *
 * Flow: fetch Frankfurter → commitment(maxDepth=16) → register document →
 *       generate Groth16 proof per rate → submit proof → counter ↑
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

import { commitToData } from "../data-commitment/dist/index.js";
import { create, proofs, documents } from "../sdk/dist/index.js";
import { groth16 } from "snarkjs";
import fs from "node:fs";
import { createHash } from "node:crypto";

// ── Config ────────────────────────────────────────────────────────────────

const API_BASE = process.env["LEMMA_API_BASE"] ?? "https://workers.lemma.workers.dev";
const API_KEY = process.env["LEMMA_API_KEY"];
const DRY_RUN = process.env["DRY_RUN"] === "1";
const FOREX_BASE = process.env["FOREX_BASE"] ?? "USD";
const CIRCUIT_ID = "data-commitment-v1.1";
const MAX_DEPTH = 16;
const SCHEMA = "clubs.nippo.v1";

const WASM_PATH = "../../packages/data-commitment/circuits/build/data-commitment-v1_js/data-commitment-v1.wasm";
const ZKEY_PATH = "../../packages/data-commitment/circuits/build/data-commitment-v1_final.zkey";

// ── Helpers ───────────────────────────────────────────────────────────────

const padToDepth = <T>(arr: readonly T[], depth: number, pad: T): T[] => {
  const out = [...arr];
  while (out.length < depth) out.push(pad);
  return out;
};

const sha256hex = (s: string): string =>
  "0x" + createHash("sha256").update(s).digest("hex");

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!DRY_RUN && !API_KEY) throw new Error("LEMMA_API_KEY not set (required for submission)");
  if (!fs.existsSync(WASM_PATH)) throw new Error(`WASM not found: ${WASM_PATH}`);
  if (!fs.existsSync(ZKEY_PATH)) throw new Error(`ZKEY not found: ${ZKEY_PATH}`);

  console.log("=== Forex Proof Pipeline ===");
  console.log("API:", API_BASE);
  console.log("Circuit:", CIRCUIT_ID, "Depth:", MAX_DEPTH);
  console.log("Mode:", DRY_RUN ? "DRY RUN" : "LIVE\n");

  // 1. Fetch forex data
  const url = `https://api.frankfurter.app/latest?from=${FOREX_BASE}`;
  console.log("[1/5] Fetching forex data...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const forexData = await res.json() as Record<string, unknown>;
  const rates = (forexData["rates"] as Record<string, number>) ?? {};
  console.log(`  Date: ${String(forexData["date"])}  Base: ${String(forexData["base"])}  Rates: ${Object.keys(rates).length}`);

  // 2. Create commitment
  console.log("[2/5] Creating data-commitment-v1...");
  const c = commitToData(forexData, undefined, MAX_DEPTH);
  console.log(`  Root: ${c.root}  Leaves: ${c.leaves.length}`);

  // 3. Register document (one per daily dataset)
  let docHash: string;
  if (!DRY_RUN) {
    console.log("[3/5] Registering document...");
    docHash = sha256hex(`${c.root}|${forexData["date"] as string}`);
    const client = create({ apiBase: API_BASE, apiKey: API_KEY! });
    const docResult = await documents.register(client, {
      schema: SCHEMA,
      docHash,
      cid: docHash,
      issuerId: "forex-pipeline",
      subjectId: `forex-${forexData["date"] as string}`,
      attributes: { source: "frankfurter", base: forexData["base"] as string },
      commitments: {
        scheme: "poseidon",
        root: c.root,
        leaves: c.leaves as readonly string[],
        randomness: c.randomness,
      },
      revocation: {
        scheme: "none",
        root: "0x" + "0".repeat(64),
      },
    });
    console.log(`  Doc registered: ${docResult.docHash.slice(0, 24)}...`);
  } else {
    docHash = sha256hex(`${c.root}|${forexData["date"] as string}`);
    console.log(`[3/5] [dry] Would register doc: ${docHash.slice(0, 24)}...`);
  }

  // 4. Load artifacts
  const wasmBuf = fs.readFileSync(WASM_PATH);
  const zkeyBuf = fs.readFileSync(ZKEY_PATH);

  // 5. Generate + submit proofs
  console.log(`[4/5] Generating ${c.pathValues.length} proofs...`);
  let ok = 0;
  let fail = 0;
  const totalStart = Date.now();

  for (let i = 0; i < c.pathValues.length; i++) {
    const pv = c.pathValues[i]!;
    const pre = c.leafPreimages[i]!;
    const inc = c.inclusionProofs[i]!;

    const t0 = Date.now();
    try {
      const witness = {
        root: BigInt(c.root),
        randomness: BigInt(c.randomness),
        pathHash: BigInt(pre.pathHash),
        valueHash: BigInt(pre.valueHash),
        siblings: padToDepth(inc.siblings, MAX_DEPTH, "0x0").map((s) => BigInt(s)),
        indices: padToDepth(inc.indices, MAX_DEPTH, 0),
      };

      const { proof, publicSignals } = await groth16.fullProve(witness, wasmBuf, zkeyBuf);
      const proofB64 = Buffer.from(JSON.stringify(proof)).toString("base64");

      if (!DRY_RUN) {
        const client = create({ apiBase: API_BASE, apiKey: API_KEY! });
        const sr = await proofs.submit(client, {
          docHash,
          circuitId: CIRCUIT_ID,
          proof: proofB64,
          inputs: publicSignals as readonly string[],
        });
        const ms = Date.now() - t0;
        console.log(`  ✅ [${i + 1}/${c.pathValues.length}] ${pv.path} = ${String(pv.value)} (${ms}ms) → ${sr.verificationId}`);
      } else {
        const ms = Date.now() - t0;
        console.log(`  ✅ [${i + 1}/${c.pathValues.length}] ${pv.path} = ${String(pv.value)} (${ms}ms) [dry]`);
      }
      ok++;
    } catch (e) {
      console.log(`  ❌ [${i + 1}/${c.pathValues.length}] ${pv.path}: ${e instanceof Error ? e.message : String(e)}`);
      fail++;
    }
  }

  // Summary
  console.log(`[5/5] Done. ✅ ${ok}  ❌ ${fail}  Total: ${((Date.now() - totalStart) / 1000).toFixed(1)}s`);
  console.log(`  Root: ${c.root}`);
  console.log(`  Doc:  ${docHash}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
