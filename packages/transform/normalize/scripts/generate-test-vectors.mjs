/**
 * Generates ground-truth test vectors for the Rust normalizer from the JS
 * reference implementation (poseidon-lite + @lemmaoracle/content), so
 * `cargo test` can prove bit-exactness without a JS runtime.
 *
 * Also embeds the demo-file commitments from /root/demo-files (when present)
 * as the acceptance vector for the real xlsx→pdf transform.
 *
 * Run from packages/transform:  node normalize/scripts/generate-test-vectors.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { poseidon1, poseidon2 } from "poseidon-lite";
import { bytesToFieldElements, reduceElements } from "@lemmaoracle/content";

const fileHash = (bytes) =>
  reduceElements(bytesToFieldElements(bytes), poseidon2);
const fileCommitment = (bytes) => poseidon1([fileHash(bytes)]);
const sha256Int = (bytes) =>
  BigInt("0x" + createHash("sha256").update(bytes).digest("hex"));

const enc = new TextEncoder();

const poseidonVectors = [
  { fn: "poseidon1", inputs: ["0"], out: poseidon1([0n]).toString() },
  { fn: "poseidon1", inputs: ["1"], out: poseidon1([1n]).toString() },
  {
    fn: "poseidon1",
    // input above the BN254 prime (as produced by raw SHA-256 scalars)
    inputs: [(2n ** 256n - 1n).toString()],
    out: poseidon1([2n ** 256n - 1n]).toString(),
  },
  { fn: "poseidon2", inputs: ["1", "2"], out: poseidon2([1n, 2n]).toString() },
  {
    fn: "poseidon2",
    inputs: [(2n ** 248n - 1n).toString(), "12345678901234567890"],
    out: poseidon2([2n ** 248n - 1n, 12345678901234567890n]).toString(),
  },
];

const fileVectors = [
  new Uint8Array(0),
  enc.encode("hello world"),
  enc.encode("a".repeat(31)), // exact chunk boundary → full padding block
  new Uint8Array(1000).fill(0x42),
].map((bytes) => ({
  bytesHex: Buffer.from(bytes).toString("hex"),
  fileHash: fileHash(bytes).toString(),
  fileCommitment: fileCommitment(bytes).toString(),
}));

const argsVectors = [
  '{"source":"frame00-demo"}',
  "{}",
  "null",
  '{"indent":2}',
].map((canonical) => ({
  canonical,
  argsHash: poseidon1([sha256Int(enc.encode(canonical))]).toString(),
}));

const transformCode = enc.encode("frame00-demo:derive-reference");
const transformerId = sha256Int(transformCode).toString();

let demo = null;
try {
  const dir = "/root/demo-files";
  const input = new Uint8Array(
    fs.readFileSync(path.join(dir, "日本の城ベスト30.xlsx")),
  );
  const output = new Uint8Array(
    fs.readFileSync(path.join(dir, "日本の城ベスト30.pdf")),
  );
  demo = {
    inputPath: path.join(dir, "日本の城ベスト30.xlsx"),
    outputPath: path.join(dir, "日本の城ベスト30.pdf"),
    inputByteCount: input.length,
    outputByteCount: output.length,
    inputCommitment: fileCommitment(input).toString(),
    outputCommitment: fileCommitment(output).toString(),
  };
} catch {
  console.warn("demo files not readable — skipping demo vector");
}

const vectors = {
  poseidon: poseidonVectors,
  files: fileVectors,
  args: argsVectors,
  transformCode: {
    codeUtf8: "frame00-demo:derive-reference",
    transformerId,
  },
  demo,
};

const dest = path.join(
  fileURLToPath(new URL(".", import.meta.url)),
  "../tests/vectors.json",
);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(vectors, null, 2));
console.log(`wrote ${dest} (demo: ${demo ? "included" : "absent"})`);
