// 城デモ：正しい docHash フロー
// docHash = encrypt(witness).docHash（registration address）
// commitments = prepare() の戻り値（Merkle root over normalized record）
// proof は outputCommitment を公開入力として bind
import fs from "node:fs";
import {
  buildGenesisRecord,
  toWitnessInput,
} from "@lemmaoracle/transform";
import {
  create,
  schemas,
  define,
  prepare,
  encrypt,
  derivePublicKey,
  prover,
  documents,
  proofs,
} from "@lemmaoracle/sdk";

const client = create({
  apiBase: "https://workers.lemma.workers.dev",
  apiKey: process.env.LEMMA_API_KEY!,
});

const FILES = "/root/demo-files";
const OLD_XLSX = `${FILES}/日本の城ベスト30.xlsx`;
const PDF = `${FILES}/日本の城ベスト30.pdf`;

// デモ用 holder 秘密鍵（example-mw と同じ）
const HOLDER_PRIV_KEY =
  process.env.DEMO_HOLDER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const read = (p: string) => new Uint8Array(fs.readFileSync(p));
const enc = new TextEncoder();
const short = (h: string) => "0x" + h.slice(0, 16) + "...";

async function main() {
  const oldXlsx = read(OLD_XLSX);
  const pdf = read(PDF);
  const wasmBytes = new Uint8Array(
    fs.readFileSync(
      new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url),
    ),
  );

  // ── 1. buildGenesisRecord ──
  console.log("=== 1. buildGenesisRecord ===");
  const transformCode = enc.encode("frame00-demo:derive-reference");
  const transformFn = (_i: Uint8Array, _a: unknown): Uint8Array => pdf;
  const { record, witness } = await buildGenesisRecord(
    wasmBytes,
    transformFn,
    transformCode,
    oldXlsx,
    { source: "frame00-demo" },
  );
  console.log(`inputCommitment : ${short(record.inputCommitment)}`);
  console.log(`outputCommitment: ${short(record.outputCommitment)}`);

  // ── 2. witness 構築 ──
  console.log("\n=== 2. witness ===");
  const witnessInput = toWitnessInput({ record, witness });

  // ── 3. encrypt(witness) → docHash（registration address）──
  console.log("\n=== 3. encrypt(witness) → docHash ===");
  const holderPubKeyHex = derivePublicKey(HOLDER_PRIV_KEY);
  const encrypted = await encrypt(client, {
    payload: witnessInput,
    holderKey: holderPubKeyHex,
  });
  const docHash = encrypted.docHash;
  console.log(`docHash (encrypt result): ${docHash.slice(0, 20)}...`);
  console.log(
    `docHash ≠ outputCommitment: ${docHash !== record.outputCommitment}`,
  );

  // ── 4. prepare → commitments（Merkle root over record）──
  console.log("\n=== 4. prepare → commitments ===");
  const schemaMeta = await schemas.getById(client, "transform-exec-v1");
  await define(schemaMeta);
  const prep = await prepare(client, {
    schema: "transform-exec-v1",
    payload: record,
  });
  console.log(`commitments.root: ${prep.commitments.root.slice(0, 20)}...`);
  console.log(`commitments.leaves: ${prep.commitments.leaves.length}`);
  console.log(
    `root ≠ outputCommitment: ${prep.commitments.root !== record.outputCommitment}`,
  );

  // ── 5. prover.prove ──
  console.log("\n=== 5. prover.prove ===");
  const { proof: proofB64, inputs } = await prover.prove(client, {
    circuitId: "transform-exec-v1",
    witness: witnessInput,
  });
  console.log(`proof length: ${proofB64.length}`);
  console.log(`public signals: ${inputs.length}`);

  // ── 6. documents.register ──
  console.log("\n=== 6. documents.register ===");
  const docRes = await documents.register(client, {
    schema: "transform-exec-v1",
    docHash,
    cid: encrypted.cid,
    issuerId: "frame00",
    subjectId: "castle-demo",
    commitments: prep.commitments, // prepare() の戻り値（正しい Merkle コミットメント）
    attributes: {
      title: "日本の城ベスト30",
      inputCommitment: record.inputCommitment,
      outputCommitment: record.outputCommitment,
    },
    revocation: { scheme: "poseidon", root: "0" },
  });
  console.log(`register: ${JSON.stringify(docRes)}`);

  // ── 7. proofs.submit ──
  console.log("\n=== 7. proofs.submit ===");
  const proofRes = await proofs.submit(client, {
    docHash,
    circuitId: "transform-exec-v1",
    proof: proofB64,
    inputs,
  });
  console.log(`submit: ${JSON.stringify(proofRes)}`);

  // ── 8. 照合 ──
  console.log("\n=== 8. 照合 ===");
  const fetched = await proofs.getByDocHash(client, docHash);
  const toHex = (d: string) => "0x" + BigInt(d).toString(16).padStart(64, "0");
  console.log(`fetched.circuitId: ${fetched.circuitId}`);
  console.log(`fetched.status: ${fetched.status}`);
  console.log(`fetched.outputCommitment: ${toHex(fetched.inputs[3])}`);
  console.log(
    `outputCommitment === record.outputCommitment: ${
      toHex(fetched.inputs[3]).toLowerCase() ===
      "0x" + BigInt(record.outputCommitment).toString(16).padStart(64, "0").toLowerCase()
    }`,
  );

  console.log("\n=== DONE ===");
  console.log(`docHash=${docHash}`);
  console.log(`commitments.root=${prep.commitments.root}`);
  console.log(`outputCommitment=${record.outputCommitment}`);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
