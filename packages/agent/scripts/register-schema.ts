#!/usr/bin/env node
/**
 * Register agent-identity-v1 schema with Lemma
 *
 * This script:
 * 1. Uploads agent-identity-v1 WASM and JS to Pinata
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
      project: "lemma-agent-identity",
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
  id: "agent-identity-v1",
  description:
    "Generic agent identity schema — proves issuer-signed identity credential with authorization class (act/delegate) and action",
  normalize: {
    artifact: {
      type: "ipfs",
      wasm: wasmIpfsUrl,
      js: jsIpfsUrl,
    },
    hash: wasmHash,
    abi: {
      raw: {
        identity: "object",
      },
      norm: {
        "identity.issuer_id": "string",
        "identity.subject_id": "string",
        "identity.authorization_class": "string",
        "identity.action": "string",
        "identity.not_before": "string",
        "identity.expires_at": "string",
        "identity.metadata": "string",
      },
    },
  },
  metadata: {
    type: "agent-identity",
    version: "1.0.0",
    purpose: "Generic agent identity credential with authorization semantics",
    implementation: "rust-wasm",
    circuitReady: true,
    extensionPoints: {
      zkPredicates: [
        "isValidAt(credential, timestamp)",
        "isIssuedBy(credential, issuerId)",
        "isSubject(credential, subjectId)",
        "hasAuthorizationClass(credential, class)",
        "hasAction(credential, action)",
      ],
      circuitProvider: "groth16-bn254-snarkjs",
      circuitArtifactPlaceholder: "packages/agent/circuits/agent-identity-valid.circom",
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Main Execution Pipeline                                           */
/* ------------------------------------------------------------------ */

const main = async (): Promise<void> => {
  try {
    console.log("🚀 Starting agent-identity-v1 schema registration...");
    await validateEnvironment();

    const wasmPath = path.join(PROJECT_ROOT, "packages/agent/dist/wasm/agent.wasm");
    const jsPath = path.join(PROJECT_ROOT, "packages/agent/dist/wasm/agent.js");

    console.log("1. Checking artifact files...");
    await Promise.all([checkFileExists(wasmPath), checkFileExists(jsPath)]);

    console.log("2. Calculating WASM hash...");
    const wasmHash = await calculateWasmHash(wasmPath);

    console.log("3. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, jsIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "agent-identity.wasm"),
      uploadFileToPinata(jsPath, "agent-identity.js"),
    ]);

    console.log("4. Building schema metadata...");
    const schemaMeta = buildSchemaMeta(wasmHash, wasmIpfsUrl, jsIpfsUrl);

    console.log("5. Registering schema with Lemma...");
    const client = createLemmaClient();
    const registeredSchema = await registerSchema(client, schemaMeta);

    console.log("\n✅ Schema registered successfully!");
    console.log(`📝 Schema ID: ${registeredSchema.id}`);
    console.log(`📝 Description: ${registeredSchema.description}`);
    console.log(`🔗 WASM Hash: ${wasmHash}`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 JS IPFS: ${jsIpfsUrl}`);

    // Generate SQL file for backup/direct DB update
    const normalizeJson = JSON.stringify({
      artifact: {
        js: jsIpfsUrl,
        type: "ipfs",
        wasm: wasmIpfsUrl,
      },
      hash: wasmHash,
      abi: {
        norm: {
          "identity.issuer_id": "string",
          "identity.subject_id": "string",
          "identity.authorization_class": "string",
          "identity.action": "string",
          "identity.not_before": "string",
          "identity.expires_at": "string",
          "identity.metadata": "string",
        },
        raw: {
          identity: "object",
        },
      },
    });

    const sqlPath = path.join(PROJECT_ROOT, "../workers/__update_agent_identity.sql");
    fs.writeFileSync(
      sqlPath,
      `UPDATE schemas SET normalize_json = '${normalizeJson.replace(/'/g, "''")}' WHERE id = 'agent-identity-v1';`,
    );

    console.log(`\n📁 SQL backup generated: ${sqlPath}`);
    console.log("\n🎉 Agent identity schema is now ready for use!");
    console.log("\nNext steps:");
    console.log("  1. Test the schema with sample credentials");
    console.log("  2. Register circuits for verification");
    console.log("  3. Integrate with A2A flows");

  } catch (error: unknown) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

// Execute main function
main();