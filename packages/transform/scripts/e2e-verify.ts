#!/usr/bin/env node
/**
 * E2E verification: transform-exec-v1 end-to-end pipeline.
 *
 * Pipeline:
 *   1. Build a genesis ExecutionRecord via the runner (JS transform)
 *   2. Normalize the record via the WASM normalizer
 *   3. Generate a Groth16 proof using snarkjs
 *   4. Verify the proof against the verification key
 *
 * This script proves the entire transform-exec-v1 stack works:
 *   normalize WASM → circuit proof → on-chain-verifiable result
 */
import { buildGenesisRecord, toWitnessInput, toPublicSignals } from "../src/index.js";
import { sha256Field } from "../src/index.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as snarkjs from "snarkjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

const encoder = new TextEncoder();

/* ── Load WASM normalizer ───────────────────────────────────────────── */

async function loadWasmNormalizer() {
  const wasmPath = path.join(PKG_ROOT, "normalize/pkg/lemma_transform_bg.wasm");
  const jsPath = path.join(PKG_ROOT, "normalize/pkg/lemma_transform.js");

  if (!fs.existsSync(wasmPath)) {
    throw new Error(`WASM not found at ${wasmPath}. Run 'wasm-pack build' first.`);
  }
  if (!fs.existsSync(jsPath)) {
    throw new Error(`JS shim not found at ${jsPath}`);
  }

  // Dynamic import of the wasm-bindgen JS shim (bundler target: the wasm
  // is imported statically by pkg/lemma_transform.js — no initSync needed)
  await import(jsPath);
  const wasmBytes = fs.readFileSync(wasmPath);
  return { bytes: new Uint8Array(wasmBytes) };
}

/* ── Main ──────────────────────────────────────────────────────────── */

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  transform-exec-v1 E2E Verification");
  console.log("═══════════════════════════════════════════════════\n");

  // ── Step 1: Build genesis ExecutionRecord ──────────────────────────
  console.log("Step 1: Build genesis ExecutionRecord (JS transform)...");

  const transformCode = encoder.encode("function transform(input) { return 'out:' + input; }");
  const inputBytes = encoder.encode("hello-transform-world");
  const args = { format: "json", indent: 2 };

  // Simple JS transform function
  const transformFn = (input: Uint8Array): Uint8Array => {
    const decoded = new TextDecoder().decode(input);
    return encoder.encode(`out:${decoded}`);
  };

  const wasm = await loadWasmNormalizer();
  const { record, witness } = await buildGenesisRecord(
    wasm.bytes,
    transformFn,
    transformCode,
    inputBytes,
    args,
  );

  console.log("  ✓ ExecutionRecord built:");
  console.log(`    transformerId:        ${record.transformerId}`);
  console.log(`    runtime:              ${record.runtime}`);
  console.log(`    inputCommitment:      ${record.inputCommitment}`);
  console.log(`    outputCommitment:     ${record.outputCommitment}`);
  console.log(`    inputByteCount:       ${record.inputByteCount}`);
  console.log(`    outputByteCount:      ${record.outputByteCount}`);
  console.log(`    argsHash:             ${record.argsHash}`);
  console.log(`    prevOutputCommitment: ${record.prevOutputCommitment}`);

  // Verify genesis binding
  if (record.prevOutputCommitment !== record.inputCommitment) {
    throw new Error("Genesis binding failed: prevOutputCommitment !== inputCommitment");
  }
  console.log("  ✓ Genesis binding verified (prevOutputCommitment === inputCommitment)\n");

  // ── Step 2: Normalize via WASM ──────────────────────────────────────
  console.log("Step 2: Normalize ExecutionRecord via WASM normalizer...");

  const rawJson = JSON.stringify(record);
  console.log(`  Raw JSON: ${rawJson.substring(0, 80)}...`);

  const { normalize } = await import(
    path.join(PKG_ROOT, "normalize/pkg/lemma_transform_bg.js")
  );
  const normalizedJson = normalize(rawJson);
  const normalized = JSON.parse(normalizedJson);

  console.log("  ✓ Normalized via WASM:");
  console.log(`    transformerId:        ${normalized.transformerId}`);
  console.log(`    runtime:              ${normalized.runtime}`);
  console.log(`    inputCommitment:      ${normalized.inputCommitment}`);
  console.log(`    outputCommitment:     ${normalized.outputCommitment}`);
  console.log(`    inputByteCount:       ${normalized.inputByteCount}`);
  console.log(`    outputByteCount:      ${normalized.outputByteCount}`);
  console.log(`    argsHash:             ${normalized.argsHash}`);
  console.log(`    prevOutputCommitment: ${normalized.prevOutputCommitment}`);

  // Verify normalization preserves values
  const checks: Array<[string, string, string]> = [
    ["transformerId", normalized.transformerId, record.transformerId],
    ["runtime", normalized.runtime, record.runtime],
    ["inputCommitment", normalized.inputCommitment, record.inputCommitment],
    ["outputCommitment", normalized.outputCommitment, record.outputCommitment],
    ["argsHash", normalized.argsHash, record.argsHash],
    ["prevOutputCommitment", normalized.prevOutputCommitment, record.prevOutputCommitment],
  ];

  for (const [name, norm, orig] of checks) {
    if (norm !== orig) {
      throw new Error(`Normalization mismatch for ${name}: ${norm} !== ${orig}`);
    }
  }
  console.log("  ✓ All fields match between raw and normalized\n");

  // ── Step 3: Generate Groth16 proof ─────────────────────────────────
  console.log("Step 3: Generate Groth16 proof...");

  const zkeyPath = path.join(PKG_ROOT, "circuits/build/transform-exec_final.zkey");
  const vkeyPath = path.join(PKG_ROOT, "circuits/build/transform-exec_vkey.json");

  if (!fs.existsSync(zkeyPath)) {
    throw new Error(`ZKEY not found: ${zkeyPath}. Run 'pnpm build:circuit' first.`);
  }
  if (!fs.existsSync(vkeyPath)) {
    throw new Error(`VKEY not found: ${vkeyPath}`);
  }

  const witnessInput = toWitnessInput({ record, witness });
  console.log("  Witness input:");
  for (const [k, v] of Object.entries(witnessInput)) {
    console.log(`    ${k}: ${v}`);
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    witnessInput,
    path.join(PKG_ROOT, "circuits/build/transform-exec_js/transform-exec.wasm"),
    zkeyPath,
  );

  console.log("  ✓ Proof generated");
  console.log(`    Public signals: ${JSON.stringify(publicSignals)}`);

  // Verify public signals match the record
  // Note: values larger than the BN254 prime are automatically reduced mod p
  // by the circuit. We compare with modular arithmetic.
  const BN254_P = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
  const expectedSignals = toPublicSignals(record);
  for (let i = 0; i < expectedSignals.length; i++) {
    const expected = BigInt(expectedSignals[i]) % BN254_P;
    const actual = BigInt(publicSignals[i]);
    if (actual !== expected) {
      throw new Error(
        `Public signal mismatch at index ${i}: got ${actual}, expected ${expected} (mod p)`,
      );
    }
  }
  console.log("  ✓ Public signals match ExecutionRecord\n");

  // ── Step 4: Verify proof ───────────────────────────────────────────
  console.log("Step 4: Verify Groth16 proof...");

  const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"));
  const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  if (!isValid) {
    throw new Error("Proof verification FAILED");
  }

  console.log("  ✓ Proof verified successfully!\n");

  // ── Summary ────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("  ✅ E2E PASSED — transform-exec-v1 pipeline complete");
  console.log("═══════════════════════════════════════════════════");
  console.log(`
  Pipeline summary:
    1. ✓ Genesis ExecutionRecord built (JS transform)
    2. ✓ Normalized via WASM (lemma_transform_bg.wasm)
    3. ✓ Groth16 proof generated (transform-exec circuit)
    4. ✓ Proof verified (snarkjs.groth16.verify)

  Schema:    transform-exec-v1
  Circuit:   transform-exec (Groth16/BN254)
  Normalizer: lemma-transform (Rust → WASM, wasm-bindgen)
`);
}

main().catch((e) => {
  console.error("\n❌ E2E FAILED:", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
