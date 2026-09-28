#!/usr/bin/env node
/**
 * Register role-spend-limit-v2 circuit (vkey-bundled) for the browser verify demo.
 *
 * Pipeline: Pinata upload (wasm + zkey + vkey) → Lemma circuits.register
 *
 * Reads creds from packages/blog-article/.env (LEMMA_API_KEY, PINATA_API_KEY,
 * PINATA_SECRET_API_KEY). Artifacts come from the trust402 roles circuits build.
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
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const CIRCUIT_ID = "role-spend-limit-v2";
const SCHEMA = "passthrough-v1";

const BUILD_DIR = "/root/trust402/packages/roles/circuits/build";
const WASM_PATH = path.join(
  BUILD_DIR,
  "role-spend-limit-v2_js",
  "role-spend-limit-v2.wasm",
);
const ZKEY_PATH = path.join(BUILD_DIR, "role-spend-limit-v2_final.zkey");
const VKEY_PATH = path.join(BUILD_DIR, "role-spend-limit-v2_vkey.json");

type PinataResponse = Readonly<{ IpfsHash: string; PinSize: number }>;

const uploadToPinata = (filePath: string, fileName: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(filePath)]), fileName);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: fileName,
      keyvalues: { project: "lemma", circuit: CIRCUIT_ID },
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
    .then((res) =>
      res.ok
        ? (res.json() as Promise<PinataResponse>)
        : Promise.reject(new Error(`Pinata upload failed: ${res.status}`)),
    )
    .then((data) => `ipfs://${data.IpfsHash}`);
};

const OFFCHAIN_VERIFIER: CircuitVerifier = {
  type: "offchain",
  alg: "groth16-bn254-snarkjs",
};

const buildCircuitMeta = (
  wasmUrl: string,
  zkeyUrl: string,
  vkeyUrl: string,
): CircuitMeta => ({
  circuitId: CIRCUIT_ID,
  schema: SCHEMA,
  description:
    "Combined hasRole + spendLimitBelow predicate with cross-proof correlation via credentialCommitment (vkey-bundled for offchain verification)",
  inputs: [
    "requiredRoleHash",
    "maxSpend",
    "nowSec",
    "roleGateCommitment",
    "credentialCommitmentPublic",
  ],
  verifiers: [OFFCHAIN_VERIFIER],
  artifact: { location: { type: "ipfs", wasm: wasmUrl, zkey: zkeyUrl, vkey: vkeyUrl } },
});

const requireEnv = (): Promise<void> =>
  LEMMA_API_KEY && PINATA_API_KEY && PINATA_SECRET_API_KEY
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          "Missing env vars (LEMMA_API_KEY, PINATA_API_KEY, PINATA_SECRET_API_KEY) in packages/blog-article/.env",
        ),
      );

const requireArtifacts = (): Promise<void> =>
  [WASM_PATH, ZKEY_PATH, VKEY_PATH].every((p) => fs.existsSync(p))
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          `Artifacts missing. Expected wasm/zkey/vkey under ${BUILD_DIR} (run build-v2.sh first)`,
        ),
      );

const main = async (): Promise<void> => {
  await requireEnv();
  await requireArtifacts();

  console.log("1. Uploading wasm + zkey + vkey to Pinata ...");
  const [wasmUrl, zkeyUrl, vkeyUrl] = await Promise.all([
    uploadToPinata(WASM_PATH, "role-spend-limit-v2.wasm"),
    uploadToPinata(ZKEY_PATH, "role-spend-limit-v2_final.zkey"),
    uploadToPinata(VKEY_PATH, "role-spend-limit-v2_vkey.json"),
  ]);
  console.log(`   wasm → ${wasmUrl}`);
  console.log(`   zkey → ${zkeyUrl}`);
  console.log(`   vkey → ${vkeyUrl}`);

  console.log("2. Registering circuit ...");
  const client = create({ apiKey: LEMMA_API_KEY });
  const registered = await circuits.register(client, buildCircuitMeta(wasmUrl, zkeyUrl, vkeyUrl));
  console.log(`   ✅ registered: ${registered.circuitId} (schema ${registered.schema})`);
};

main().catch((error: unknown) => {
  console.error("❌", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
