import { create, prover, verifier, circuits } from "@lemmaoracle/sdk";
import { poseidon4 } from "poseidon-lite";
import { createHash } from "node:crypto";

const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

const fieldHash = (name) => {
  const hash = createHash("sha256").update(name, "utf8").digest("hex");
  const maskedFirstByte = (parseInt(hash.slice(0, 2), 16) & 0x0f)
    .toString(16)
    .padStart(2, "0");
  return (BigInt(`0x${maskedFirstByte + hash.slice(2)}`) % BN254_PRIME).toString();
};

const CIRCUIT_ID = "role-spend-limit-v2";

const gate = { role: "admin", maxSpend: 1000 };
const commitOutput = {
  normalized: { financial: { spendLimit: "100" } },
  root: "123456789012345678901234567890",
  sectionHashes: {},
  salt: "987654321",
};

const roleHash = fieldHash(gate.role);
const spendLimit = commitOutput.normalized.financial.spendLimit;
const saltScalar = BigInt(commitOutput.salt).toString();
const nowSec = Math.floor(Date.now() / 1000).toString();
const roleGateCommitment = poseidon4([
  BigInt(commitOutput.root),
  BigInt(roleHash),
  BigInt(spendLimit),
  BigInt(saltScalar),
]).toString();

const witness = {
  credentialCommitment: commitOutput.root,
  roleHash,
  spendLimit,
  salt: saltScalar,
  requiredRoleHash: roleHash,
  maxSpend: gate.maxSpend.toString(),
  nowSec,
  roleGateCommitment,
  credentialCommitmentPublic: commitOutput.root,
};

const client = create({});

console.log(`1. proving ${CIRCUIT_ID} …`);
const t0 = Date.now();
const out = await prover.prove(client, { circuitId: CIRCUIT_ID, witness });
console.log(`   proved in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`   proof b64 length: ${out.proof.length}`);
console.log(`   publicSignals: ${JSON.stringify(out.inputs)}`);

console.log(`2. fetching vkey + verifying …`);
const meta = await circuits.getById(client, CIRCUIT_ID);
const vkeyUrl = meta.artifact?.location.vkey;
const vkey = await fetch(
  `https://gateway.pinata.cloud/ipfs/${vkeyUrl.slice("ipfs://".length)}`,
).then((r) => r.json());

const verified = await verifier.verify({
  alg: "groth16-bn254-snarkjs",
  inputs: {
    vkey,
    proof: JSON.parse(atob(out.proof)),
    publicSignals: out.inputs,
  },
});
console.log(`   verified: ${JSON.stringify(verified)}`);
