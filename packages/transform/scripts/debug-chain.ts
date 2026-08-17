/**
 * Debug script: CSV → JSON → PDF transform chain with ZK proofs.
 *
 * Demonstrates a 3-stage chain:
 *   Stage 1 (genesis): CSV bytes → parse → JSON bytes
 *   Stage 2 (chained): JSON bytes → format → pretty JSON bytes
 *   Stage 3 (chained): JSON bytes → render → PDF-like bytes
 *
 * Generates Groth16 proofs for each stage and verifies:
 *   1. Each stage's proof individually (transform-exec circuit)
 *   2. The chain binding (prevOutputCommitment === prev outputCommitment)
 *   3. Byte inclusion: a specific output commitment appears in the chain
 *
 * Usage: npx tsx scripts/debug-chain.ts
 */
import { buildGenesisRecord, buildChainedRecord, verifyChain } from "../src/index.js";
import { toWitnessInput, toPublicSignals } from "../src/index.js";
import type { ExecutionRecord } from "../src/index.js";
import { groth16 } from "snarkjs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CIRCUIT_DIR = resolve(import.meta.dirname, "../circuits/build");
const WASM_PATH = resolve(CIRCUIT_DIR, "transform-exec_js/transform-exec.wasm");
const ZKEY_PATH = resolve(CIRCUIT_DIR, "transform-exec_final.zkey");
const VKEY_PATH = resolve(CIRCUIT_DIR, "transform-exec_vkey.json");

// ── Transform functions ─────────────────────────────────────────

/**
 * Stage 1: CSV → JSON
 * Parses CSV (name,age,city) into JSON array.
 */
const csvToJson: (input: Uint8Array, args: unknown) => Uint8Array = (input) => {
  const text = new TextDecoder().decode(input);
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const records = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
  return new TextEncoder().encode(JSON.stringify(records));
};

/**
 * Stage 2: JSON → Pretty JSON (indent + sort keys)
 */
const prettyJson: (input: Uint8Array, args: unknown) => Uint8Array = (input, args) => {
  const data = JSON.parse(new TextDecoder().decode(input));
  const indent = (args as { indent?: number })?.indent ?? 2;
  return new TextEncoder().encode(JSON.stringify(data, null, indent));
};

/**
 * Stage 3: JSON → PDF-like bytes
 * Simulates PDF generation by prefixing with PDF header and wrapping in a
 * minimal PDF structure. Not a real PDF, but demonstrates binary output.
 */
const jsonToPdf: (input: Uint8Array, args: unknown) => Uint8Array = (input) => {
  const jsonText = new TextDecoder().decode(input);
  const pdfContent = `%PDF-1.4\n% Lemma Transform Proof\n${jsonText}\n%%EOF`;
  return new TextEncoder().encode(pdfContent);
};

// ── Proof helpers ───────────────────────────────────────────────

async function generateProof(
  witnessInput: Record<string, string>,
): Promise<{ proof: unknown; publicSignals: string[] }> {
  const wasm = readFileSync(WASM_PATH);
  const zkey = readFileSync(ZKEY_PATH);
  return groth16.fullProve(witnessInput, wasm, zkey);
}

async function verifyProof(
  proof: unknown,
  publicSignals: string[],
): Promise<boolean> {
  const vkey = JSON.parse(readFileSync(VKEY_PATH, "utf-8"));
  return groth16.verify(vkey, publicSignals, proof);
}

// ── Main ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("═══ Transform Chain Debug Script ═══\n");

  // Input CSV data
  const csvData = new TextEncoder().encode(
    "name,age,city\nAlice,30,Tokyo\nBob,25,Osaka\nCharlie,35,Nagoya\n",
  );

  // Transform code bytes (for transformerId)
  const transformCode1 = new TextEncoder().encode("csv-to-json");
  const transformCode2 = new TextEncoder().encode("pretty-json");
  const transformCode3 = new TextEncoder().encode("json-to-pdf");

  // ── Stage 1: CSV → JSON (genesis) ──────────────────────────────
  console.log("▶ Stage 1: CSV → JSON (genesis)");
  const stage1 = await buildGenesisRecord(
    csvToJson,
    transformCode1,
    csvData,
    { delimiter: "," },
  );
  console.log("  inputCommitment:    ", stage1.record.inputCommitment.slice(0, 20) + "...");
  console.log("  outputCommitment:   ", stage1.record.outputCommitment.slice(0, 20) + "...");
  console.log("  prevOutputCommitment:", stage1.record.prevOutputCommitment.slice(0, 20) + "...");
  console.log("  inputBytes:         ", stage1.record.inputByteCount);
  console.log("  outputBytes:        ", stage1.record.outputByteCount);

  console.log("  → generating proof...");
  const proof1 = await generateProof(toWitnessInput(stage1));
  const valid1 = await verifyProof(proof1.proof, proof1.publicSignals);
  console.log("  ✓ proof valid:", valid1, "\n");

  // ── Stage 2: JSON → Pretty JSON (chained) ─────────────────────
  console.log("▶ Stage 2: JSON → Pretty JSON (chained)");
  // Input to stage 2 = output of stage 1
  const stage1Output = csvToJson(csvData, {});
  const stage2 = await buildChainedRecord(
    prettyJson,
    transformCode2,
    stage1Output,
    { indent: 2 },
    stage1.record.outputCommitment, // ← chain binding
  );
  console.log("  inputCommitment:    ", stage2.record.inputCommitment.slice(0, 20) + "...");
  console.log("  outputCommitment:   ", stage2.record.outputCommitment.slice(0, 20) + "...");
  console.log("  prevOutputCommitment:", stage2.record.prevOutputCommitment.slice(0, 20) + "...");
  console.log("  chain match:         ", stage2.record.prevOutputCommitment === stage1.record.outputCommitment);

  console.log("  → generating proof...");
  const proof2 = await generateProof(toWitnessInput(stage2));
  const valid2 = await verifyProof(proof2.proof, proof2.publicSignals);
  console.log("  ✓ proof valid:", valid2, "\n");

  // ── Stage 3: JSON → PDF (chained) ─────────────────────────────
  console.log("▶ Stage 3: JSON → PDF (chained)");
  const stage2Output = prettyJson(stage1Output, { indent: 2 });
  const stage3 = await buildChainedRecord(
    jsonToPdf,
    transformCode3,
    stage2Output,
    {},
    stage2.record.outputCommitment, // ← chain binding
  );
  console.log("  inputCommitment:    ", stage3.record.inputCommitment.slice(0, 20) + "...");
  console.log("  outputCommitment:   ", stage3.record.outputCommitment.slice(0, 20) + "...");
  console.log("  prevOutputCommitment:", stage3.record.prevOutputCommitment.slice(0, 20) + "...");
  console.log("  chain match:         ", stage3.record.prevOutputCommitment === stage2.record.outputCommitment);

  console.log("  → generating proof...");
  const proof3 = await generateProof(toWitnessInput(stage3));
  const valid3 = await verifyProof(proof3.proof, proof3.publicSignals);
  console.log("  ✓ proof valid:", valid3, "\n");

  // ── Chain verification ────────────────────────────────────────
  console.log("▶ Chain verification");
  const records: ExecutionRecord[] = [
    stage1.record,
    stage2.record,
    stage3.record,
  ];
  const chainValid = verifyChain(records);
  console.log("  ✓ chain valid:", chainValid);

  // ── Byte inclusion check ──────────────────────────────────────
  console.log("\n▶ Byte inclusion check (simulating UI verification)");
  // Customer uploads the final PDF bytes
  const finalPdfBytes = jsonToPdf(stage2Output, {});
  const { fileCommitment } = await import("../src/runner.js");
  const uploadedCommitment = fileCommitment(finalPdfBytes).toString();
  console.log("  uploaded commitment: ", uploadedCommitment.slice(0, 20) + "...");
  console.log("  stage3 outputCommit:", stage3.record.outputCommitment.slice(0, 20) + "...");

  const inclusionMatch = uploadedCommitment === stage3.record.outputCommitment;
  console.log("  ✓ byte inclusion verified:", inclusionMatch);

  // ── Summary ───────────────────────────────────────────────────
  console.log("\n═══ Summary ═══");
  console.log("  Stage 1 proof:    ", valid1 ? "✓ valid" : "✗ INVALID");
  console.log("  Stage 2 proof:    ", valid2 ? "✓ valid" : "✗ INVALID");
  console.log("  Stage 3 proof:    ", valid3 ? "✓ valid" : "✗ INVALID");
  console.log("  Chain binding:    ", chainValid ? "✓ valid" : "✗ BROKEN");
  console.log("  Byte inclusion:   ", inclusionMatch ? "✓ verified" : "✗ NOT FOUND");
  console.log("  Chain depth:      ", 3, "stages (a→b→c→d)");
  console.log("  Circuit:          transform-exec (831 constraints, PTAU 2^12)");
  console.log("");

  if (valid1 && valid2 && valid3 && chainValid && inclusionMatch) {
    console.log("✓ All checks passed — transform chain verified end-to-end.");
  } else {
    console.log("✗ Some checks failed — see above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
