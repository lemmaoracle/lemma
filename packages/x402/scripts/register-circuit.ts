#!/usr/bin/env node
/**
 * Register x402 payment circuit with Lemma
 *
 * This script:
 * 1. Uploads payment circuit WASM and zkey to Pinata
 * 2. Registers the circuit with Lemma SDK using the deployed verifier contract
 */

import { create, circuits } from "@lemmaoracle/sdk";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/spec";
import dotenv from "dotenv";
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

// Verifier contract address from deployment (Base Sepolia)
const VERIFIER_ADDRESS_BASE_SEPOLIA = "0x291e98af209557ecFB77b477228AD3623b6989E7";
const CHAIN_ID_BASE_SEPOLIA = 84532; // Base Sepolia
// Verifier contract address from deployment (Monad Testnet)
const VERIFIER_ADDRESS_MONAD_TESTNET = "0x8BA44D7F46aA1fd075b1C89399112B374A27A455";
const CHAIN_ID_MONAD_TESTNET = 10143; // Monad Testnet

/* ------------------------------------------------------------------ */
/*  Pinata Upload Functions                                           */
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
      project: "lemma-x402",
      circuit: "payment",
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
/*  Circuit Registration                                              */
/* ------------------------------------------------------------------ */

const createLemmaClient = (): LemmaClient =>
  create({
    apiBase: "https://workers.lemma.workers.dev",
    apiKey: LEMMA_API_KEY!,
  });

const registerCircuit = (client: LemmaClient, circuitMeta: CircuitMeta): Promise<CircuitMeta> =>
  circuits.register(client, circuitMeta);

const buildCircuitMeta = (wasmIpfsUrl: string, zkeyIpfsUrl: string): CircuitMeta => ({
  circuitId: "x402-payment-v1",
  schema: "passthrough-v1",
  description: "x402 payment circuit for Monad Testnet",
  inputs: ["amount", "recipient", "nonce"],
  verifiers: [
    {
      type: "onchain",
      address: VERIFIER_ADDRESS_BASE_SEPOLIA,
      chainId: CHAIN_ID_BASE_SEPOLIA,
      alg: "groth16-bn254-snarkjs",
    },
    {
      type: "onchain",
      address: VERIFIER_ADDRESS_MONAD_TESTNET,
      chainId: CHAIN_ID_MONAD_TESTNET,
      alg: "groth16-bn254-snarkjs",
    },
  ],
  artifact: {
    location: {
      type: "ipfs",
      wasm: wasmIpfsUrl,
      zkey: zkeyIpfsUrl,
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Main Execution Pipeline                                           */
/* ------------------------------------------------------------------ */

const main = async (): Promise<void> => {
  try {
    console.log("🚀 Starting x402 payment circuit registration...");
    await validateEnvironment();

    const wasmPath = path.join(PROJECT_ROOT, "packages/x402/build/payment_js/payment.wasm");
    const zkeyPath = path.join(PROJECT_ROOT, "packages/x402/build/payment_final.zkey");

    console.log("1. Checking artifact files...");
    await Promise.all([checkFileExists(wasmPath), checkFileExists(zkeyPath)]);

    console.log("2. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, zkeyIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "payment.wasm"),
      uploadFileToPinata(zkeyPath, "payment_final.zkey"),
    ]);

    console.log("3. Registering circuit with Lemma...");
    const client = createLemmaClient();
    const circuitMeta = buildCircuitMeta(wasmIpfsUrl, zkeyIpfsUrl);
    const registeredCircuit = await registerCircuit(client, circuitMeta);

    console.log("\n✅ Circuit registered successfully!");
    console.log(`📝 Circuit ID: ${registeredCircuit.circuitId}`);
    console.log(`🔗 Schema: ${registeredCircuit.schema}`);
    console.log(`🏢 Verifier: ${VERIFIER_ADDRESS_BASE_SEPOLIA} (Chain: ${CHAIN_ID_BASE_SEPOLIA})`);
    console.log(`🏢 Verifier: ${VERIFIER_ADDRESS_MONAD_TESTNET} (Chain: ${CHAIN_ID_MONAD_TESTNET})`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 zKey IPFS: ${zkeyIpfsUrl}`);
    console.log("\n🎉 x402 payment circuit is now ready for use!");
  } catch (error: unknown) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));

    // Check if circuit already exists
    if (
      error instanceof Error &&
      (error.message.includes("already exists") || error.message.includes("409"))
    ) {
      console.log("\nℹ️  Circuit may already be registered. Checking...");
      try {
        const client = createLemmaClient();
        const existingCircuit = await circuits.getById(client, "x402-payment-v1");
        console.log("   ✅ Circuit already exists:", existingCircuit.circuitId);
        console.log("   🔗 Existing verifier:", existingCircuit.verifiers?.[0]?.address);
        console.log("   📦 Existing WASM IPFS:", existingCircuit.artifact?.location.wasm);
      } catch (checkError) {
        console.error(
          "   ❌ Circuit check failed:",
          checkError instanceof Error ? checkError.message : String(checkError),
        );
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Execute main function
main();
