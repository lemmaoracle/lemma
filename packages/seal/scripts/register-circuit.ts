#!/usr/bin/env node
/**
 * Register the seal-identity circuit with the Lemma workers API.
 *
 * Pipeline:
 *   1. Upload the compiled .wasm / .zkey artifacts to IPFS via Pinata.
 *   2. Build a CircuitMeta (schema: passthrough-v1, off-chain verifier).
 *   3. Register it via `circuits.register` from @lemmaoracle/sdk.
 *
 * Run:  npx tsx scripts/register-circuit.ts
 *
 * Requires:
 *   - packages/seal/.env  (copy from .env.example, fill in real keys)
 *   - a compiled circuit  (`npm run build` in circuits/)
 */

import { create, circuits } from "@lemmaoracle/sdk";
import type {
  LemmaClient,
  CircuitMeta,
  CircuitVerifier,
} from "@lemmaoracle/spec";
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

const CIRCUIT_ID = "seal-identity-v1";
const SCHEMA = "passthrough-v1";

const WASM_PATH = path.join(
  PKG_ROOT,
  "circuits",
  "build",
  "seal-identity_js",
  "seal-identity.wasm",
);
const ZKEY_PATH = path.join(
  PKG_ROOT,
  "circuits",
  "build",
  "seal-identity_final.zkey",
);

/* ── Pinata (IPFS) upload ─────────────────────────────────────────── */

type PinataResponse = Readonly<{ IpfsHash: string; PinSize: number }>;

const uploadToPinata = (filePath: string, fileName: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), fileName);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: fileName,
      keyvalues: { project: "lemma-seal", circuit: CIRCUIT_ID },
    }),
  );
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_API_KEY!,
    },
    body: formData,
  })
    .then((res: Response) =>
      res.ok
        ? res.json()
        : Promise.reject(new Error(`Pinata upload failed: ${res.status}`)),
    )
    .then((data: PinataResponse) => `ipfs://${data.IpfsHash}`);
};

/* ── CircuitMeta ──────────────────────────────────────────────────── */

// Off-chain verification is the primary path for seal — proofs are
// checked by the dashboard BFF, not an on-chain contract, so no verifier
// address or chainId is required.
const OFFCHAIN_VERIFIER: CircuitVerifier = {
  type: "offchain",
  alg: "groth16-bn254-snarkjs",
};

const buildCircuitMeta = (wasmUrl: string, zkeyUrl: string): CircuitMeta => ({
  circuitId: CIRCUIT_ID,
  schema: SCHEMA,
  description:
    "Seal — proves knowledge of a Lemma API key pre-image (SHA-256) without revealing the key. Powers Proof-based dashboard sign-in.",
  inputs: ["keyHash", "nonce"],
  verifiers: [OFFCHAIN_VERIFIER],
  artifact: { location: { type: "ipfs", wasm: wasmUrl, zkey: zkeyUrl } },
});

/* ── Pre-flight checks ────────────────────────────────────────────── */

const requireEnv = (): Promise<void> =>
  LEMMA_API_KEY && PINATA_API_KEY && PINATA_SECRET_API_KEY
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          "Missing env vars. Copy .env.example to .env and set " +
            "LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY.",
        ),
      );

const requireArtifacts = (): Promise<void> =>
  fs.existsSync(WASM_PATH) && fs.existsSync(ZKEY_PATH)
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          "Compiled circuit not found. Run `npm run build` in " +
            `packages/seal/circuits first.\n  expected: ${WASM_PATH}\n` +
            `            ${ZKEY_PATH}`,
        ),
      );

const createLemmaClient = (): LemmaClient =>
  create(
    LEMMA_API_BASE
      ? { apiKey: LEMMA_API_KEY!, apiBase: LEMMA_API_BASE }
      : { apiKey: LEMMA_API_KEY! },
  );

/* ── Main ─────────────────────────────────────────────────────────── */

const main = async (): Promise<void> => {
  console.log("🔏 Registering seal-identity circuit...");
  await requireEnv();
  await requireArtifacts();

  console.log("1. Uploading artifacts to IPFS (Pinata)...");
  const [wasmUrl, zkeyUrl] = await Promise.all([
    uploadToPinata(WASM_PATH, "seal-identity.wasm"),
    uploadToPinata(ZKEY_PATH, "seal-identity_final.zkey"),
  ]);
  console.log(`   wasm → ${wasmUrl}`);
  console.log(`   zkey → ${zkeyUrl}`);

  console.log("2. Registering circuit with Lemma...");
  const client = createLemmaClient();
  const registered = await circuits.register(
    client,
    buildCircuitMeta(wasmUrl, zkeyUrl),
  );

  console.log(
    `✅ Registered circuit: ${registered.circuitId} (schema: ${registered.schema})`,
  );
};

main().catch((error: unknown) => {
  console.error("❌", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
