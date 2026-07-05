/**
 * Circuit test: content-commitment-v1.
 *
 * Tests witness generation and Groth16 proof verification.
 * Uses the byte→field-element normalizer + iterative Poseidon(2)
 * reduction to compute fileHash, then Poseidon(1) for commitment.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { groth16 } from "snarkjs";
import * as path from "node:path";
import * as fs from "node:fs";
import { poseidon1, poseidon2 } from "poseidon-lite";
import { bytesToFieldElements, reduceElements, contentCommitment } from "../../src/normalizer.js";

const CIRCUITS_DIR = path.resolve(import.meta.dirname, "..");
const BUILD_DIR = path.join(CIRCUITS_DIR, "build");
const CIRCUIT_NAME = "content-commitment";
const WASM_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
const ZKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_final.zkey`);
const VKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_vkey.json`);

/** Canonical fileHash = iterative Poseidon2 reduction of field elements */
function fileHash(bytes: Uint8Array): bigint {
  const elements = bytesToFieldElements(bytes);
  return reduceElements(elements, poseidon2);
}

describe("ContentCommitmentV1", () => {
  let vkey: object;

  beforeAll(async () => {
    vkey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
  }, 30000);

  it("generates and verifies a valid Groth16 proof (single element)", async () => {
    const data = new TextEncoder().encode("Hello");
    const fh = fileHash(data); // private input
    const commitment = contentCommitment(data, poseidon1, poseidon2); // public input

    const { proof, publicSignals } = await groth16.fullProve(
      { fileHash: fh.toString(), commitment: commitment.toString() },
      WASM_PATH,
      ZKEY_PATH,
    );

    const isValid = await groth16.verify(vkey, publicSignals, proof);
    expect(isValid).toBe(true);
    expect(publicSignals).toHaveLength(1);
    expect(publicSignals[0]).toBe(commitment.toString());
  }, 30000);

  it("generates and verifies a valid Groth16 proof (multi-element, 100 bytes)", async () => {
    const data = new Uint8Array(100);
    for (let i = 0; i < 100; i++) data[i] = (i * 13 + 7) % 256;
    const fh = fileHash(data);
    const commitment = contentCommitment(data, poseidon1, poseidon2);

    const { proof, publicSignals } = await groth16.fullProve(
      { fileHash: fh.toString(), commitment: commitment.toString() },
      WASM_PATH,
      ZKEY_PATH,
    );

    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
  }, 30000);

  it("generates and verifies a valid Groth16 proof (empty file)", async () => {
    const data = new Uint8Array(0);
    const fh = fileHash(data);
    const commitment = contentCommitment(data, poseidon1, poseidon2);

    const { proof, publicSignals } = await groth16.fullProve(
      { fileHash: fh.toString(), commitment: commitment.toString() },
      WASM_PATH,
      ZKEY_PATH,
    );

    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);
  }, 30000);

  it("rejects tampered commitment in proof verification", async () => {
    const data = new TextEncoder().encode("Hello");
    const fh = fileHash(data);
    const commitment = contentCommitment(data, poseidon1, poseidon2);

    const { proof } = await groth16.fullProve(
      { fileHash: fh.toString(), commitment: commitment.toString() },
      WASM_PATH,
      ZKEY_PATH,
    );

    // Verify with correct commitment → pass
    expect(await groth16.verify(vkey, [commitment.toString()], proof)).toBe(true);

    // Verify with wrong commitment → fail
    const wrong = poseidon1([1n]);
    expect(await groth16.verify(vkey, [wrong.toString()], proof)).toBe(false);
  }, 30000);

  it("witness generation rejects mismatched commitment", async () => {
    const data = new TextEncoder().encode("Hello");
    const fh = fileHash(data);

    await expect(
      groth16.fullProve(
        { fileHash: fh.toString(), commitment: "999999999" },
        WASM_PATH,
        ZKEY_PATH,
      ),
    ).rejects.toThrow();
  }, 30000);

  it("deterministic: same bytes produce same commitment", () => {
    const data = new TextEncoder().encode("deterministic test");
    const c1 = contentCommitment(data, poseidon1, poseidon2);
    const c2 = contentCommitment(data, poseidon1, poseidon2);
    expect(c1).toBe(c2);
  });

  it("different bytes produce different commitment", () => {
    const c1 = contentCommitment(new TextEncoder().encode("content A"), poseidon1, poseidon2);
    const c2 = contentCommitment(new TextEncoder().encode("content B"), poseidon1, poseidon2);
    expect(c1).not.toBe(c2);
  });
});
