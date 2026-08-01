#!/usr/bin/env node
/**
 * Register org-identity-v1 circuit with Lemma workers API.
 *
 * Pipeline: Pinata upload (WASM + zkey) → Lemma circuits.register
 *
 * Usage:  npx tsx scripts/register-org-identity.ts
 *
 * Requires packages/roles/.env:
 *   LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY
 */
import { create, circuits } from "@lemmaoracle/sdk";
import type { LemmaClient, CircuitMeta, CircuitVerifier } from "@lemmaoracle/spec";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(PKG_ROOT, ".env") });

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const LEMMA_API_BASE = process.env.LEMMA_API_BASE;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const CIRCUIT_ID = "org-identity-v1";
const SCHEMA = "passthrough-v1";

const WASM_PATH = path.join(
  PKG_ROOT,
  "circuits",
  "build",
  "org-identity_js",
  "org-identity.wasm",
);
const ZKEY_PATH = path.join(
  PKG_ROOT,
  "circuits",
  "build",
  "org-identity_final.zkey",
);

type PinataResponse = Readonly<{ IpfsHash: string; PinSize: number }>;

const uploadToPinata = (filePath: string, fileName: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), fileName);
  formData.append("pinataMetadata", JSON.stringify({
    name: fileName,
    keyvalues: { project: "lemma-roles", circuit: CIRCUIT_ID },
  }));
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_API_KEY!,
    },
    body: formData,
  })
    .then((res) => res.ok ? res.json() : Promise.reject(new Error(`Pinata upload failed: ${res.status}`)))
    .then((data) => `ipfs://${(data as PinataResponse).IpfsHash}`);
};

const OFFCHAIN_VERIFIER: CircuitVerifier = { type: "offchain", alg: "groth16-bn254-snarkjs" };

const buildCircuitMeta = (wasmUrl: string, zkeyUrl: string): CircuitMeta => ({
  circuitId: CIRCUIT_ID,
  schema: SCHEMA,
  description:
    "Trust402 org-identity v1 — proves an institution's Poseidon secret-key holder committed a memberRoot for a verified domain at a specific timestamp. ZK proof of knowledge (PoK). Complements listing-binding-v2 by anchoring memberRoot to the org's Poseidon public key.",
  inputs: [
    "commitmentHash",
    "orgDid",
    "memberRoot",
    "domain",
    "timestamp",
  ],
  verifiers: [OFFCHAIN_VERIFIER],
  artifact: { location: { type: "ipfs", wasm: wasmUrl, zkey: zkeyUrl } },
});

const requireEnv = (): Promise<void> =>
  LEMMA_API_KEY && PINATA_API_KEY && PINATA_SECRET_API_KEY
    ? Promise.resolve()
    : Promise.reject(new Error("Missing env vars. Set LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY in packages/roles/.env"));

const requireArtifacts = (): Promise<void> =>
  fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH)
    ? Promise.resolve()
    : Promise.reject(new Error("Compiled circuit not found. Run `bash scripts/build.sh` in packages/roles/circuits first."));

const createLemmaClient = (): LemmaClient =>
  create(LEMMA_API_BASE
    ? { apiKey: LEMMA_API_KEY!, apiBase: LEMMA_API_BASE }
    : { apiKey: LEMMA_API_KEY! });

const main = async (): Promise<void> => {
  console.log("🔗 Registering org-identity-v1 circuit...");
  await requireEnv();
  await requireArtifacts();

  console.log("1. Uploading artifacts to IPFS (Pinata)...");
  const [wasmUrl, zkeyUrl] = await Promise.all([
    uploadToPinata(WASM_PATH, "org-identity.wasm"),
    uploadToPinata(ZKEY_PATH, "org-identity_final.zkey"),
  ]);
  console.log(`   wasm → ${wasmUrl}`);
  console.log(`   zkey → ${zkeyUrl}`);

  console.log("2. Registering circuit with Lemma...");
  const client = createLemmaClient();
  const registered = await circuits.register(client, buildCircuitMeta(wasmUrl, zkeyUrl));
  console.log(`✅ Registered: ${registered.circuitId} (schema: ${registered.schema})`);
};

main().catch((error: unknown) => {
  console.error("❌", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
