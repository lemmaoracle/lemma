#!/usr/bin/env node
/**
 * Register bank-account-change-v1 circuit with Lemma workers API.
 *
 * Pipeline: Pinata upload (WASM + zkey) → Lemma circuits.register
 *
 * Usage:  npx tsx scripts/register-circuit.ts
 *
 * Requires packages/bank-account-change/.env:
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

const CIRCUIT_ID = "bank-account-change-v1";
const SCHEMA = "bank-account-change-v1";

const WASM_PATH = path.join(PKG_ROOT, "circuits", "build", "bank-account-change_js", "bank-account-change.wasm");
const ZKEY_PATH = path.join(PKG_ROOT, "circuits", "build", "bank-account-change_final.zkey");

type PinataResponse = Readonly<{ IpfsHash: string; PinSize: number }>;

const uploadToPinata = (filePath: string, fileName: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), fileName);
  formData.append("pinataMetadata", JSON.stringify({
    name: fileName,
    keyvalues: { project: "lemma-bank-account-change", circuit: CIRCUIT_ID },
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
  description: "Bank-account change proof (ProofGate) — proves a pre-registered, role-holding vendor representative approved this old-to-new account change for this verifier and challenge, with the new account bound to the vendor legal name and bank evidence.",
  inputs: ["registryRoot", "credentialCommitment", "requiredRoleHash", "vendorId", "oldAccountHash", "newAccountHash", "isFirst", "audienceHash", "requestDigest", "requestReceivedAt", "challengeId", "challengeIssuedAt", "challengeExpiresAt", "policyHash", "bankEvidenceHash"],
  verifiers: [OFFCHAIN_VERIFIER],
  artifact: { location: { type: "ipfs", wasm: wasmUrl, zkey: zkeyUrl } },
});

const requireEnv = (): Promise<void> =>
  LEMMA_API_KEY && PINATA_API_KEY && PINATA_SECRET_API_KEY
    ? Promise.resolve()
    : Promise.reject(new Error("Missing env vars. Set LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY in packages/bank-account-change/.env"));

const requireArtifacts = (): Promise<void> =>
  fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH)
    ? Promise.resolve()
    : Promise.reject(new Error("Compiled circuit not found. Run `npm run build` in packages/bank-account-change/circuits first."));

const createLemmaClient = (): LemmaClient =>
  create(LEMMA_API_BASE
    ? { apiKey: LEMMA_API_KEY!, apiBase: LEMMA_API_BASE }
    : { apiKey: LEMMA_API_KEY! });

const main = async (): Promise<void> => {
  console.log("📝 Registering bank-account-change-v1 circuit...");
  await requireEnv();
  await requireArtifacts();

  console.log("1. Uploading artifacts to IPFS (Pinata)...");
  const [wasmUrl, zkeyUrl] = await Promise.all([
    uploadToPinata(WASM_PATH, "bank-account-change.wasm"),
    uploadToPinata(ZKEY_PATH, "bank-account-change_final.zkey"),
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
