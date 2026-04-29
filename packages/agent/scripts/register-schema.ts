#!/usr/bin/env node
/**
 * Register agent-identity-authority-v1 schema with Lemma
 *
 * This script:
 * 1. Uploads agent WASM and JS to Pinata
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
      project: "lemma-agent",
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
  id: "agent-identity-authority-v1",
  description:
    "Agent Identity + Authority Credential — represents agent identity, controller/org relationship, authority/scopes/roles, budget constraints, and lifecycle/provenance metadata",
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
        authority: "object",
        lifecycle: "object",
        provenance: "object",
      },
      norm: {
        "identity.agentId": "string",
        "identity.subjectId": "string",
        "identity.controllerId": "string",
        "identity.orgId": "string",
        "authority.roles": "string",
        "authority.scopes": "string",
        "authority.permissions": "string",
        "financial.spendLimit": "string",
        "financial.currency": "string",
        "financial.paymentPolicy": "string",
        "lifecycle.issuedAt": "string",
        "lifecycle.expiresAt": "string",
        "lifecycle.revoked": "string",
        "lifecycle.revocationRef": "string",
        "provenance.issuerId": "string",
        "provenance.sourceSystem": "string",
        "provenance.generatorId": "string",
        "provenance.chainId": "string",
        "provenance.network": "string",
      },
    },
  },
  metadata: {
    type: "agent-identity-authority",
    version: "1.0.0",
    purpose: "Agent identity and authority credential for Lemma ecosystem",
    implementation: "rust-wasm",
    circuitReady: false,
    extensionPoints: {
      zkPredicates: [
        "hasScope(credential, scopeName)",
        "belongsToOrg(credential, orgId)",
        "spendLimitAbove(credential, threshold)",
        "spendLimitBelow(credential, threshold)",
        "isValidAt(credential, timestamp)",
        "isNotRevoked(credential, revocationRoot)",
      ],
      circuitProvider: "groth16-bn254-snarkjs",
      circuitArtifactPlaceholder: "packages/agent/circuits/agent-verify.circom",
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Main Execution Pipeline                                           */
/* ------------------------------------------------------------------ */

const main = async (): Promise<void> => {
  try {
    console.log("🚀 Starting agent-identity-authority-v1 schema registration...");
    await validateEnvironment();

    const wasmPath = path.join(PROJECT_ROOT, "packages/agent/dist/wasm/agent.wasm");
    const jsPath = path.join(PROJECT_ROOT, "packages/agent/dist/wasm/agent.js");

    console.log("1. Checking artifact files...");
    await Promise.all([checkFileExists(wasmPath), checkFileExists(jsPath)]);

    console.log("2. Calculating WASM hash...");
    const wasmHash = await calculateWasmHash(wasmPath);

    console.log("3. Uploading artifacts to Pinata...");
    const [wasmIpfsUrl, jsIpfsUrl] = await Promise.all([
      uploadFileToPinata(wasmPath, "agent.wasm"),
      uploadFileToPinata(jsPath, "agent.js"),
    ]);

    console.log("4. Updating DB record with new WASM/JS IPFS hashes...");

    const normalizeJson = JSON.stringify({
      artifact: {
        js: jsIpfsUrl,
        type: "ipfs",
        wasm: wasmIpfsUrl,
      },
      hash: wasmHash,
      abi: {
        norm: {
          "identity.agentId": "string",
          "identity.subjectId": "string",
          "identity.controllerId": "string",
          "identity.orgId": "string",
          "authority.roles": "string",
          "authority.scopes": "string",
          "authority.permissions": "string",
          "financial.spendLimit": "string",
          "financial.currency": "string",
          "financial.paymentPolicy": "string",
          "lifecycle.issuedAt": "string",
          "lifecycle.expiresAt": "string",
          "lifecycle.revoked": "string",
          "lifecycle.revocationRef": "string",
          "provenance.issuerId": "string",
          "provenance.sourceSystem": "string",
          "provenance.generatorId": "string",
          "provenance.chainId": "string",
          "provenance.network": "string",
        },
        raw: {
          identity: "object",
          authority: "object",
          lifecycle: "object",
          provenance: "object",
        },
      },
    });

    const sqlPath = path.join(PROJECT_ROOT, "../workers/__update_agent.sql");
    fs.writeFileSync(
      sqlPath,
      `UPDATE schemas SET normalize_json = '${normalizeJson}' WHERE id = 'agent-identity-authority-v1';`,
    );

    console.log(`\n✅ Generated SQL file: ${sqlPath}`);
    console.log(
      "To update the remote database, run:",
    );
    console.log(
      "cd ../../../../workers && npx wrangler d1 execute lemma --file=__update_agent.sql --remote",
    );
    console.log(`\n🔗 WASM Hash: ${wasmHash}`);
    console.log(`📦 WASM IPFS: ${wasmIpfsUrl}`);
    console.log(`📦 JS IPFS: ${jsIpfsUrl}`);
    console.log("\n🎉 Agent schema is now ready for use!");
  } catch (error: unknown) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
};

// Execute main function
main();
