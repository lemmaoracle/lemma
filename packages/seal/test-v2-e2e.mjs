/**
 * End-to-end test: proof generation → verification → nullifier matching
 */
import { writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { groth16 } from 'snarkjs';
import { secretToBits } from './dist/bits.js';
import { poseidon3 } from 'poseidon-lite/poseidon3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = "d681b592fae17d7e432d8654495112498349548b6561bc0dc05267113b65ad3b";
const NONCE = "12345";

console.log("=== Seal v2 End-to-End Test ===\n");

// 1. Convert API key to bits
console.log("1. Converting API key to bits...");
const keyBits = secretToBits(API_KEY).map(Number);
console.log("   ✓ keyBits length:", keyBits.length);
console.log("   ✓ First 8 bits:", keyBits.slice(0, 8));

// 2. Generate proof
console.log("\n2. Generating proof...");
const wasmPath = path.join(__dirname, "circuits/build/seal-identity_js/seal-identity.wasm");
const zkeyPath = path.join(__dirname, "circuits/build/seal-identity_final.zkey");

const t0 = performance.now();
const { proof, publicSignals } = await groth16.fullProve(
  { keyBits, nonce: NONCE },
  wasmPath,
  zkeyPath
);
const t1 = performance.now();
console.log(`   ✓ Proof generated in ${(t1 - t0).toFixed(0)}ms`);
console.log("   ✓ publicSignals:", publicSignals);
console.log("   ✓ Number of public signals:", publicSignals.length);

const nullifier = publicSignals[0];
const nonceOut = publicSignals[1];
console.log("   ✓ nullifier:", nullifier);
console.log("   ✓ nonce:", nonceOut);

// 3. Verify proof
console.log("\n3. Verifying proof...");
const vkeyPath = path.join(__dirname, "src/vkeys/seal-identity-v1.json");
const vkey = JSON.parse(await readFile(vkeyPath, 'utf-8'));

const t2 = performance.now();
const valid = await groth16.verify(vkey, publicSignals, proof);
const t3 = performance.now();
console.log(`   ✓ Verification: ${valid} (${(t3 - t2).toFixed(2)}ms)`);

if (!valid) {
  console.log("\n❌ Proof verification failed!");
  process.exit(1);
}

// 4. Compute expected nullifier from key_hash (JS-side)
console.log("\n4. Computing expected nullifier from key_hash...");

// First, compute SHA-256 of API key to get key_hash
const apiKeyAscii = Buffer.from(API_KEY, 'ascii');
const sha256Hash = createHash('sha256').update(apiKeyAscii).digest();
const keyHashHex = sha256Hash.toString('hex');
console.log("   ✓ SHA-256(api_key):", keyHashHex);

// Check if this matches what's in the DB
const expectedKeyHash = "09a1789a65354d2848f31001b6e8406c07800905a37bbae26042970d78d33aad";
console.log("   ✓ Expected key_hash:", expectedKeyHash);
console.log("   ✓ Match:", keyHashHex === expectedKeyHash ? "YES" : "NO");

// Split into hi/lo (128 bits each)
const hashBig = BigInt('0x' + keyHashHex);
const hi = (hashBig >> 128n) & ((1n << 128n) - 1n);
const lo = hashBig & ((1n << 128n) - 1n);
console.log("\n   hi (128 bits):", hi.toString());
console.log("   lo (128 bits):", lo.toString());
console.log("   nonce:", NONCE);

// 5. Compute Poseidon nullifier (JS-side)
console.log("\n5. Computing Poseidon(hi, lo, nonce)...");
const jsNullifier = poseidon3([hi, lo, BigInt(NONCE)]);
console.log("   ✓ JS nullifier:", jsNullifier.toString());
console.log("   ✓ Circuit nullifier:", nullifier);
console.log("   ✓ Match:", BigInt(nullifier) === jsNullifier ? "YES ✓" : "NO ❌");

if (BigInt(nullifier) !== jsNullifier) {
  console.log("\n⚠️  NULLIFIER MISMATCH DETECTED!");
  console.log("   This means the circuit and JS compute different values.");
  console.log("   Check if keyHash conversion is consistent.");
  process.exit(1);
}

// 6. Summary
console.log("\n=== Summary ===");
console.log("✓ API key → bits conversion");
console.log("✓ Proof generation");
console.log("✓ Proof verification");
console.log("✓ Nullifier consistency (circuit ↔ JS)");
console.log("\n✅ All checks passed!\n");
