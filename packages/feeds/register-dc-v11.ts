#!/usr/bin/env -S npx tsx
/**
 * Register data-commitment-v1.1 circuit with artifacts on workers API.
 *
 * Pipeline:
 *   1. Upload wasm/zkey/vkey to IPFS via Pinata
 *   2. Register circuit via circuits.register from @lemmaoracle/sdk
 *
 * Run from packages/feeds:
 *   cd /root/lemmaoracle/lemma/packages/feeds
 *   PINATA_API_KEY=... PINATA_SECRET_API_KEY=... LEMMA_API_KEY=... npx tsx scripts/register-dc-v11.ts
 *
 * Or source from blog-article .env
 */

import { create, circuits } from "../sdk/dist/index.js";
import type { CircuitVerifier, CircuitMeta } from "../sdk/dist/index.js";
import fs from "node:fs";
import path from "node:path";

// Load env from blog-article .env (has Pinata keys)
import { config } from "dotenv";
config({ path: path.resolve("..", "blog-article", ".env") });

// ── Config ────────────────────────────────────────────────────────────────

const {
  LEMMA_API_KEY,
  LEMMA_API_BASE = "https://workers.lemma.workers.dev",
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
} = process.env;

const CIRCUIT_ID = "data-commitment-v1.1";
const SCHEMA = "clubs.nippo.v1";

// Artifact paths (relative to monorepo root)
const MONOREPO = path.resolve("..", "..");
const WASM = path.join(MONOREPO, "packages/data-commitment/circuits/build/data-commitment-v1_js/data-commitment-v1.wasm");
const ZKEY = path.join(MONOREPO, "packages/data-commitment/circuits/build/data-commitment-v1_final.zkey");
const VKEY = path.join(MONOREPO, "packages/data-commitment/circuits/build/data-commitment-v1_vkey.json");

// ── Validate ──────────────────────────────────────────────────────────────

const fail = (msg: string): never => { console.error("❌", msg); process.exit(1); };

// ── Pinata upload ─────────────────────────────────────────────────────────

type PinataResponse = { IpfsHash: string; PinSize: number };

async function uploadToPinata(filePath: string, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), fileName);
  formData.append("pinataMetadata", JSON.stringify({
    name: fileName,
    keyvalues: { project: "lemma-data-commitment", circuit: CIRCUIT_ID },
  }));
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_API_KEY!,
    },
    body: formData,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${txt}`);
  }
  const data = await res.json() as PinataResponse;
  return `ipfs://${data.IpfsHash}`;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // Validate env
  if (!LEMMA_API_KEY) fail("LEMMA_API_KEY not set");
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) fail("PINATA_API_KEY / PINATA_SECRET_API_KEY not set");

  // Validate artifacts
  for (const [label, p] of [["wasm", WASM], ["zkey", ZKEY], ["vkey", VKEY]] as const) {
    if (!fs.existsSync(p)) fail(`${label} not found: ${p}`);
  }

  console.log(`🔏 Registering ${CIRCUIT_ID} circuit...`);
  console.log(`   API: ${LEMMA_API_BASE}`);

  // 1. Upload to Pinata
  console.log("1. Uploading artifacts to IPFS (Pinata)...");
  const [wasmUrl, zkeyUrl, vkeyUrl] = await Promise.all([
    uploadToPinata(WASM, "data-commitment-v1.wasm"),
    uploadToPinata(ZKEY, "data-commitment-v1_final.zkey"),
    uploadToPinata(VKEY, "data-commitment-v1_vkey.json"),
  ]);
  console.log(`   wasm → ${wasmUrl}`);
  console.log(`   zkey → ${zkeyUrl}`);
  console.log(`   vkey → ${vkeyUrl}`);

  // 2. Build CircuitMeta
  const offchainVerifier: CircuitVerifier = {
    type: "offchain",
    alg: "groth16-bn254-snarkjs",
  };

  const meta: CircuitMeta = {
    circuitId: CIRCUIT_ID,
    schema: SCHEMA,
    description:
      "Poseidon Merkle tree commitment over path-value pairs from arbitrary JSON. Proves that a specific (path, value) pair exists in the committed data without revealing the data itself. v1.1: 16-level tree, registered artifacts.",
    inputs: ["root", "randomness", "pathHash", "valueHash"],
    verifiers: [offchainVerifier],
    artifact: { location: { type: "ipfs", wasm: wasmUrl, zkey: zkeyUrl, vkey: vkeyUrl } },
  };

  // 3. Register
  console.log("2. Registering circuit...");
  const client = create({ apiBase: LEMMA_API_BASE, apiKey: LEMMA_API_KEY });
  const registered = await circuits.register(client, meta);
  console.log(`   ✅ Registered: ${registered.circuitId} (schema: ${registered.schema})`);

  console.log("\nDone. Verifiers can now use circuitId:", CIRCUIT_ID);
}

main().catch((e) => {
  console.error("❌", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
