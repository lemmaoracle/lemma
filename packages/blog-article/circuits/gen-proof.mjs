
import { groth16 } from "snarkjs";
import { poseidon5 } from "poseidon-lite";
import { readFileSync, writeFileSync } from "fs";

const BN254_PRIME = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

function toFieldElement(s) {
  const bytes = new TextEncoder().encode(s);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return BigInt("0x" + hex) % BN254_PRIME;
}

const CIRCUIT_DIR = "/root/lemmaoracle/lemma/packages/blog-article/circuits";
const WASM = `${CIRCUIT_DIR}/build/blog-article_js/blog-article.wasm`;
const ZKEY = `${CIRCUIT_DIR}/build/blog-article_final.zkey`;
const VKEY_PATH = `${CIRCUIT_DIR}/build/blog-article_vkey.json`;

const authorHash = toFieldElement("did:example:alice");
const integrityHash = toFieldElement("Zero-knowledge proofs allow one party to prove to another that a statement is true.");
const published = 1775001600n;
const words = 14n;
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

console.log("Generating proof...");
const { proof, publicSignals } = await groth16.fullProve(input, WASM, ZKEY);

console.log("Public signals:", JSON.stringify(publicSignals));

const vkey = JSON.parse(readFileSync(VKEY_PATH, "utf-8"));
const isValid = await groth16.verify(vkey, publicSignals, proof);
console.log("Local verify:", isValid);

writeFileSync("/tmp/test-proof.json", JSON.stringify(proof));
writeFileSync("/tmp/test-public.json", JSON.stringify(publicSignals));
writeFileSync("/tmp/test-commitment.txt", commitment.toString());
console.log("Done. Proof size:", JSON.stringify(proof).length, "bytes");
