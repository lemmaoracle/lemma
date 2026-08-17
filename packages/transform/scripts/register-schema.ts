#!/usr/bin/env node
/**
 * Register transform-exec-v1 schema with Lemma.
 *
 * This script:
 * 1. Uploads the normalize WASM + JS shim to Pinata (IPFS)
 * 2. Calculates the WASM binary SHA-256 hash
 * 3. Registers the schema via Lemma SDK's schemas.register
 *
 * The normalize WASM exports `normalize(rawJson) → normJson` in wasm-bindgen
 * format, canonicalizing ExecutionRecord fields to decimal strings (field
 * element representation for BN254 circuits).
 */
import { create, schemas } from "@lemmaoracle/sdk";
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/spec";
import dotenv from "dotenv";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

/* ── Pinata Upload ─────────────────────────────────────────────────── */

type PinataUploadResponse = Readonly<{
  readonly IpfsHash: string;
  readonly PinSize: number;
  readonly Timestamp: string;
}>;

const uploadToPinata = (filePath: string, fileName: string): Promise<PinataUploadResponse> => {
  const formData = new FormData();
  const file = fs.readFileSync(filePath);
  const blob = new Blob([file]);
  formData.append("file", blob, fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: { project: "lemma-transform", timestamp: Date.now().toString() },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({ cidVersion: 0 });
  formData.append("pinataOptions", options);

  return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET_API_KEY!,
    },
    body: formData,
  })
    .then((res: Response) =>
      res.ok ? res.json() : Promise.reject(new Error(`Pinata upload failed: ${res.status}`)),
    )
    .then((data: unknown) => data as PinataUploadResponse);
};

const uploadFileToPinata = (filePath: string, fileName: string): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    return Promise.reject(new Error("PINATA_API_KEY and PINATA_SECRET_API_KEY are required"));
  }
  return uploadToPinata(filePath, fileName)
    .then((r) => `ipfs://${r.IpfsHash}`)
    .catch((e) => Promise.reject(new Error(`Failed to upload ${fileName}: ${e.message}`)));
};

/* ── Hash Calculation ──────────────────────────────────────────────── */

const calculateWasmHash = (wasmPath: string): string => {
  const wasmBuffer = fs.readFileSync(wasmPath);
  const hash = createHash("sha256");
  hash.update(wasmBuffer);
  return `0x${hash.digest("hex")}`;
};

/* ── Schema Meta ───────────────────────────────────────────────────── */

const buildSchemaMeta = (wasmHash: string, wasmIpfsUrl: string, jsIpfsUrl: string): SchemaMeta => ({
  id: "transform-exec-v1",
  description:
    "Transform Execution Record — canonical normalized form of a verifiable file transformation execution proof with infinite-depth chaining",
  normalize: {
    artifact: {
      type: "ipfs",
      wasm: wasmIpfsUrl,
      js: jsIpfsUrl,
    },
    hash: wasmHash,
    abi: {
      raw: {
        transformerId: "string",
        runtime: "string",
        inputCommitment: "string",
        outputCommitment: "string",
        inputByteCount: "number",
        outputByteCount: "number",
        argsHash: "string",
        prevOutputCommitment: "string",
      },
      norm: {
        transformerId: "string",
        runtime: "string",
        inputCommitment: "string",
        outputCommitment: "string",
        inputByteCount: "string",
        outputByteCount: "string",
        argsHash: "string",
        prevOutputCommitment: "string",
      },
    },
  },
  metadata: {
    type: "transform-execution",
    version: "1.0.0",
    purpose: "Verifiable file transformation execution proof with chain binding",
    implementation: "rust-wasm",
    circuitReady: true,
    extensionPoints: {
      zkPredicates: [
        "inputCommitment === prevOutputCommitment",
        "outputCommitment === Poseidon1(outputFileHash)",
        "transformerId === sha256(transformCode)",
      ],
      circuitProvider: "groth16-bn254-snarkjs",
      circuitArtifactPath: "packages/transform/circuits/build/transform-exec_final.zkey",
    },
  },
});

/* ── Main ──────────────────────────────────────────────────────────── */

const main = async (): Promise<void> => {
  try {
    console.log("🚀 Starting transform-exec-v1 schema registration...");

    if (!LEMMA_API_KEY || !PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error("Missing required env vars: LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY");
    }

    const wasmPath = path.join(PROJECT_ROOT, "normalize/pkg/lemma_transform_bg.wasm");
    const jsPath = path.join(PROJECT_ROOT, "normalize/pkg/lemma_transform.js");

    console.log("1. Checking artifact files...");
    if (!fs.existsSync(wasmPath)) throw new Error(`WASM not found: ${wasmPath}`);
    if (!fs.existsSync(jsPath)) throw new Error(`JS shim not found: ${jsPath}`);

    console.log("2. Calculating WASM hash...");
    const wasmHash = calculateWasmHash(wasmPath);
    console.log(`   SHA-256: ${wasmHash}`);

    console.log("3. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, jsIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "lemma_transform_bg.wasm"),
      uploadFileToPinata(jsPath, "lemma_transform.js"),
    ]);
    console.log(`   WASM: ${wasmIpfsUrl}`);
    console.log(`   JS:   ${jsIpfsUrl}`);

    console.log("4. Registering schema via Lemma SDK...");
    const client = create({ apiKey: LEMMA_API_KEY });
    const schemaMeta = buildSchemaMeta(wasmHash, wasmIpfsUrl, jsIpfsUrl);
    const registered = await schemas.register(client, schemaMeta);

    console.log(`\n✅ Schema registered: ${registered.id}`);
    console.log(`🔗 WASM Hash: ${wasmHash}`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 JS IPFS:   ${jsIpfsUrl}`);
    console.log("\n🎉 transform-exec-v1 schema is ready!");
  } catch (error: unknown) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

main();
