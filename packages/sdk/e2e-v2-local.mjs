import { poseidon4 } from "poseidon-lite";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);
const fieldHash = (name) => {
  const h = createHash("sha256").update(name, "utf8").digest("hex");
  const mb = (parseInt(h.slice(0, 2), 16) & 0x0f).toString(16).padStart(2, "0");
  return (BigInt(`0x${mb + h.slice(2)}`) % BN254_PRIME).toString();
};

const gate = { role: "admin", maxSpend: 1000 };
const root = "123456789012345678901234567890";
const spendLimit = "100";
const salt = "987654321";
const roleHash = fieldHash(gate.role);
const roleGateCommitment = poseidon4([
  BigInt(root), BigInt(roleHash), BigInt(spendLimit), BigInt(salt),
]).toString();

const witness = {
  credentialCommitment: root,
  roleHash,
  spendLimit,
  salt,
  requiredRoleHash: roleHash,
  maxSpend: gate.maxSpend.toString(),
  nowSec: Math.floor(Date.now() / 1000).toString(),
  roleGateCommitment,
  credentialCommitmentPublic: root,
};

const vkey = JSON.parse(await readFile("/tmp/v2-artifacts/rsl.vkey.json", "utf8"));
const wasmBytes = new Uint8Array(await readFile("/tmp/v2-artifacts/rsl.wasm"));
const zkeyBytes = new Uint8Array(await readFile("/tmp/v2-artifacts/rsl.zkey"));
const { groth16 } = await import("snarkjs");

console.log("proving (local wasm/zkey) …");
const t0 = Date.now();
const { proof, publicSignals } = await groth16.fullProve(witness, wasmBytes, zkeyBytes);
console.log(`proved in ${((Date.now() - t0) / 1000).toFixed(1)}s; publicSignals=${publicSignals.length}`);

console.log("verify(raw object):", await groth16.verify(vkey, publicSignals, proof));

// SDK wire format round-trip (prover.prove base64 → decode → verify)
const b64 = Buffer.from(JSON.stringify(proof)).toString("base64");
const decoded = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
console.log("verify(base64 round-trip):", await groth16.verify(vkey, publicSignals, decoded));
