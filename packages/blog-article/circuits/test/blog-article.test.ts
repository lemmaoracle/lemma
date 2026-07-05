/**
 * Circuit test: witness generation + proof verification for BlogArticleV1.
 */
import { describe, it, beforeAll, expect } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { groth16 } from "snarkjs";
import { poseidon5 } from "poseidon-lite";

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

function toFieldElement(s: string): bigint {
  const bytes = new TextEncoder().encode(s);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex) % BN254_PRIME;
}

function langToCode(lang: string): number {
  const map: Record<string, number> = { en: 1, ja: 2, zh: 3, ko: 4, es: 5, fr: 6, de: 7, pt: 8, ru: 9, ar: 10 };
  return map[lang] ?? 0;
}

const CIRCUITS_DIR = path.resolve(import.meta.dirname, "..");
const BUILD_DIR = path.join(CIRCUITS_DIR, "build");
const CIRCUIT_NAME = "blog-article";
const WASM_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
const ZKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_final.zkey`);
const VKEY_PATH = path.join(BUILD_DIR, `${CIRCUIT_NAME}_vkey.json`);

describe("BlogArticleV1 circuit", () => {
  let vkey: object;

  beforeAll(async () => {
    vkey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
  }, 30000);

  it("generates a valid witness and verifies a proof", async () => {
    const author = "did:example:alice";
    const body = "Zero-knowledge proofs allow one party to prove to another that a statement is true.";
    const published = 1775001600n;
    const words = 14n;
    const lang = "en";

    const authorHash = toFieldElement(author);
    const integrityHash = toFieldElement(body);
    const langCode = BigInt(langToCode(lang));
    const commitment = poseidon5([authorHash, published, integrityHash, words, langCode]);

    const input = {
      authorHash: authorHash.toString(),
      published: published.toString(),
      integrityHash: integrityHash.toString(),
      words: words.toString(),
      langCode: langCode.toString(),
      commitment: commitment.toString(),
    };

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      WASM_PATH,
      ZKEY_PATH,
    );

    const isValid = await groth16.verify(vkey, publicSignals, proof);
    expect(isValid).toBe(true);
    expect(publicSignals).toHaveLength(1);
    expect(publicSignals[0]).toBe(commitment.toString());
  }, 30000);

  it("rejects a proof with tampered public signal", async () => {
    const authorHash = toFieldElement("did:example:alice");
    const integrityHash = toFieldElement("Test body");
    const published = 1775001600n;
    const words = 2n;
    const langCode = 1n;
    const commitment = poseidon5([authorHash, published, integrityHash, words, langCode]);

    const input = {
      authorHash: authorHash.toString(),
      published: published.toString(),
      integrityHash: integrityHash.toString(),
      words: words.toString(),
      langCode: langCode.toString(),
      commitment: commitment.toString(),
    };

    const { proof, publicSignals } = await groth16.fullProve(input, WASM_PATH, ZKEY_PATH);

    // Verify with correct commitment → pass
    expect(await groth16.verify(vkey, publicSignals, proof)).toBe(true);

    // Verify with wrong commitment → fail
    const wrong = poseidon5([authorHash, published + 1n, integrityHash, words, langCode]);
    expect(await groth16.verify(vkey, [wrong.toString()], proof)).toBe(false);
  }, 30000);

  it("deterministic: same inputs produce same commitment", () => {
    const a = toFieldElement("did:example:alice");
    const b = toFieldElement("Hello, world!");
    const c1 = poseidon5([a, 1775001600n, b, 2n, 1n]);
    const c2 = poseidon5([a, 1775001600n, b, 2n, 1n]);
    expect(c1).toBe(c2);
  });
});
