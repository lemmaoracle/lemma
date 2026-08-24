// Verify the transform-exec E2E against the REGISTERED circuit (IPFS artifacts)
// via the SDK's prover.prove + verifier.verify — exactly what the browser runs.
import { readFile } from "node:fs/promises";
import {
  buildGenesisRecord,
  toWitnessInput,
  fileCommitment,
} from "@lemmaoracle/transform";
import {
  create,
  define,
  prover,
  verifier,
  schemas,
  circuits,
} from "@lemmaoracle/sdk";

const client = create({});

const encoder = new TextEncoder();

async function main() {
  const inputBytes = encoder.encode("日本の城ベスト30（基準データ）");
  const outputBytes = encoder.encode("派生データ: " + new TextDecoder().decode(inputBytes));

  console.log("1. build genesis record...");
  const transformCode = encoder.encode("frame00-demo:derive-reference");
  const transformFn = (_i, _a) => outputBytes;
  const wasmBytes = new Uint8Array(
    await readFile(
      new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url),
    ),
  );
  const { record, witness } = await buildGenesisRecord(
    wasmBytes,
    transformFn,
    transformCode,
    inputBytes,
    { source: "frame00-demo" },
  );
  console.log("   inputCommitment:", record.inputCommitment.slice(0, 20) + "...");

  console.log("2. normalize via define() (WASM from IPFS)...");
  const schemaMeta = await schemas.getById(client, "transform-exec-v1");
  const schema = await define(schemaMeta);
  const normalized = schema.normalize(record);
  console.log("   normalized inputByteCount:", normalized.inputByteCount, "(type", typeof normalized.inputByteCount + ")");

  console.log("3. prove via prover.prove (zkey/wasm from IPFS)...");
  const witnessInput = toWitnessInput({ record, witness });
  const { proof: proofB64, inputs } = await prover.prove(client, {
    circuitId: "transform-exec-v1",
    witness: witnessInput,
  });
  console.log("   proof (base64) length:", proofB64.length);
  console.log("   publicSignals count:", inputs.length);

  console.log("4. verify via verifier.verify (vkey from IPFS)...");
  const meta = await circuits.getById(client, "transform-exec-v1");
  const vkeyUrl = meta.artifact.location.vkey;
  const resolved = "https://gateway.pinata.cloud/ipfs/" + vkeyUrl.slice("ipfs://".length);
  const vkeyRes = await fetch(resolved);
  const vkey = await vkeyRes.json();
  const proofObj = JSON.parse(Buffer.from(proofB64, "base64").toString("utf8"));
  const { ok } = await verifier.verify({
    alg: "groth16-bn254-snarkjs",
    inputs: { vkey, proof: proofObj, publicSignals: [...inputs] },
  });
  console.log("   verified:", ok);

  console.log("\n=== RESULT:", ok ? "PASS ✅" : "FAIL ❌", "===");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
