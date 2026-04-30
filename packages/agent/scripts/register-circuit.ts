#!/usr/bin/env node
/**
 * Register agent-identity circuit with Lemma
 *
 * This script:
 * 1. Uploads agent-identity circuit WASM and zkey to Pinata
 * 2. Registers the circuit with Lemma SDK
 */

import { create, circuits } from "@lemmaoracle/sdk";
import type { LemmaClient, CircuitMeta } from "@lemmaoracle/spec";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(PKG_ROOT, "..", "..", ".env") });

const LEMMA_API_KEY = process.env.LEMMA_API_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const VERIFIER_ADDRESS =
  process.env.VERIFIER_ADDRESS ?? "0x0000000000000000000000000000000000000000";
const CHAIN_ID = Number(process.env.CHAIN_ID ?? 84532);

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
      project: "lemma-agent",
      circuit: "agent-identity",
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

const CIRCUIT_ID = "agent-identity-v1";

const createLemmaClient = (): LemmaClient =>
  create({
    apiBase: "https://workers.lemma.workers.dev",
    apiKey: LEMMA_API_KEY!,
  });

const registerCircuit = (client: LemmaClient, circuitMeta: CircuitMeta): Promise<CircuitMeta> =>
  circuits.register(client, circuitMeta);

const buildCircuitMeta = (wasmIpfsUrl: string, zkeyIpfsUrl: string): CircuitMeta => ({
  circuitId: CIRCUIT_ID,
  schema: "agent-identity-authority-v1",
  description: "Agent identity verification circuit — proves a credential was issued by a trusted authority and is currently valid",
  inputs: ["credentialCommitment", "issuerPublicKey", "nowSec"],
  verifiers: [
    {
      type: "onchain",
      address: VERIFIER_ADDRESS,
      chainId: CHAIN_ID,
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
    console.log("🚀 Starting agent-identity circuit registration...");
    await validateEnvironment();

    const wasmPath = path.join(
      PKG_ROOT,
      "circuits",
      "build",
      "agent-identity_js",
      "agent-identity.wasm",
    );
    const zkeyPath = path.join(PKG_ROOT, "circuits", "build", "agent-identity_final.zkey");

    console.log("1. Checking artifact files...");
    await Promise.all([checkFileExists(wasmPath), checkFileExists(zkeyPath)]);

    console.log("2. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, zkeyIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "agent-identity.wasm"),
      uploadFileToPinata(zkeyPath, "agent-identity_final.zkey"),
    ]);

    console.log("3. Registering circuit with Lemma...");
    const client = createLemmaClient();
    const circuitMeta = buildCircuitMeta(wasmIpfsUrl, zkeyIpfsUrl);
    const registeredCircuit = await registerCircuit(client, circuitMeta);

    console.log("\n✅ Circuit registered successfully!");
    console.log(`📝 Circuit ID: ${registeredCircuit.circuitId}`);
    console.log(`🔗 Schema: ${registeredCircuit.schema}`);
    console.log(`🏢 Verifier: ${VERIFIER_ADDRESS} (Chain: ${CHAIN_ID})`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 zKey IPFS: ${zkeyIpfsUrl}`);
    console.log("\n🎉 agent-identity circuit is now ready for use!");
  } catch (error: unknown) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));

    if (
      error instanceof Error &&
      (error.message.includes("already exists") || error.message.includes("409"))
    ) {
      console.log("\nℹ️  Circuit may already be registered. Checking...");
      try {
        const client = createLemmaClient();
        const existingCircuit = await circuits.getById(client, CIRCUIT_ID);
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

main();
