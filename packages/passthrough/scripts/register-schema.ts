#!/usr/bin/env node
/**
 * Register passthrough schema with Lemma
 *
 * This script:
 * 1. Uploads passthrough WASM and JS to Pinata
 * 2. Calculates WASM hash
 * 3. Registers the schema with Lemma SDK
 */

import { create, schemas } from "@lemmaoracle/sdk";
import type { LemmaClient, SchemaMeta } from "@lemmaoracle/spec";
import dotenv from "dotenv";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

// Load environment variables
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

/* ------------------------------------------------------------------ */
/*  Pinata Upload Functions (Functional Style)                        */
/* ------------------------------------------------------------------ */

type PinataUploadResponse = Readonly<{
  readonly IpfsHash: string;
  readonly PinSize: number;
  readonly Timestamp: string;
  readonly isDuplicate?: boolean;
}>;

const uploadToPinata = (filePath: string, fileName: string): Promise<PinataUploadResponse> => {
  const formData = new FormData();
  const file = fs.readFileSync(filePath);
  const blob = new Blob([file]);
  formData.append("file", blob, fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      project: "lemma-passthrough",
      timestamp: Date.now().toString(),
    },
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
    return Promise.reject(
      new Error("PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables are required"),
    );
  }
  return uploadToPinata(filePath, fileName)
    .then((response) => `ipfs://${response.IpfsHash}`)
    .catch((error) => Promise.reject(new Error(`Failed to upload ${fileName}: ${error.message}`)));
};

/* ------------------------------------------------------------------ */
/*  File Validation Functions                                         */
/* ------------------------------------------------------------------ */

const validateEnvironment = (): Promise<void> => {
  if (!LEMMA_API_KEY || !PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    return Promise.reject(
      new Error(
        "Missing required environment variables: LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY",
      ),
    );
  }
  return Promise.resolve();
};

const checkFileExists = (filePath: string): Promise<void> => {
  if (fs.existsSync(filePath)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error(`File not found: ${filePath}`));
};

/* ------------------------------------------------------------------ */
/*  Hash Calculation                                                  */
/* ------------------------------------------------------------------ */

const calculateWasmHash = (wasmPath: string): Promise<string> =>
  checkFileExists(wasmPath).then(() => {
    const wasmBuffer = fs.readFileSync(wasmPath);
    const hash = createHash("sha256");
    hash.update(wasmBuffer);
    return `0x${hash.digest("hex")}`;
  });

/* ------------------------------------------------------------------ */
/*  Schema Registration                                               */
/* ------------------------------------------------------------------ */

const createLemmaClient = (): LemmaClient =>
  create({
    apiBase: "https://workers.lemma.workers.dev",
    apiKey: LEMMA_API_KEY!,
  });

const registerSchema = (client: LemmaClient, schemaMeta: SchemaMeta): Promise<SchemaMeta> =>
  schemas.register(client, schemaMeta);

const buildSchemaMeta = (wasmHash: string, wasmIpfsUrl: string, jsIpfsUrl: string): SchemaMeta => ({
  id: "passthrough-v1",
  description: "Passthrough schema that returns input unchanged",
  normalize: {
    artifact: {
      type: "ipfs",
      wasm: wasmIpfsUrl,
      js: jsIpfsUrl,
    },
    hash: wasmHash,
    abi: {
      raw: { output: "bytes" },
      norm: { output: "bytes" },
    },
  },
  metadata: {
    type: "passthrough",
    version: "1.0.0",
    purpose: "Circuit compatibility when no transformation is needed",
    implementation: "rust-wasm",
  },
});

/* ------------------------------------------------------------------ */
/*  Main Execution Pipeline                                           */
/* ------------------------------------------------------------------ */

const main = async (): Promise<void> => {
  try {
    console.log("🚀 Starting passthrough schema registration...");
    await validateEnvironment();

    const wasmPath = path.join(PROJECT_ROOT, "packages/passthrough/dist/wasm/passthrough.wasm");
    const jsPath = path.join(PROJECT_ROOT, "packages/passthrough/dist/wasm/passthrough.js");

    console.log("1. Checking artifact files...");
    await Promise.all([checkFileExists(wasmPath), checkFileExists(jsPath)]);

    console.log("2. Calculating WASM hash...");
    const wasmHash = await calculateWasmHash(wasmPath);

    console.log("3. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, jsIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "passthrough.wasm"),
      uploadFileToPinata(jsPath, "passthrough.js"),
    ]);

    console.log("4. Registering schema with Lemma...");
    const client = createLemmaClient();
    const schemaMeta = buildSchemaMeta(wasmHash, wasmIpfsUrl, jsIpfsUrl);
    const registeredSchema = await registerSchema(client, schemaMeta);

    console.log("\n✅ Schema registered successfully!");
    console.log(`📝 Schema ID: ${registeredSchema.id}`);
    console.log(`🔗 WASM Hash: ${registeredSchema.normalize.hash}`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 JS IPFS: ${jsIpfsUrl}`);
    console.log("\n🎉 Passthrough schema is now ready for use!");
  } catch (error: unknown) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Execute main function
main();
