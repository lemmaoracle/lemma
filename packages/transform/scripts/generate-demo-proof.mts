// メタウォーター照合デモ：30.xlsx（旧）→ 30.pdf の transform 証明を実ファイルで生成・検証
import fs from "node:fs";
import {
  buildGenesisRecord,
  toWitnessInput,
  toPublicSignals,
  fileCommitment,
  fileHash,
} from "@lemmaoracle/transform";
import {
  create,
  define,
  prover,
  verifier,
  schemas,
  circuits,
} from "@lemmaoracle/sdk";

const client = create({});
const FILES = "/root/demo-files";
const OLD_XLSX = `${FILES}/日本の城ベスト30.xlsx`;
const PDF = `${FILES}/日本の城ベスト30.pdf`;
const LATEST_XLSX = `${FILES}/日本の城ベスト30(a).xlsx`;

const read = (p: string) => new Uint8Array(fs.readFileSync(p));
const wasmBytes = new Uint8Array(
  fs.readFileSync(new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url)),
);
const enc = new TextEncoder();
const short = (h: string) => "0x" + h.slice(0, 24) + "...";

async function main() {
  const oldXlsx = read(OLD_XLSX);
  const pdf = read(PDF);
  const latestXlsx = read(LATEST_XLSX);

  // ── コミットメント（登録時 input / output と、照合時変数）──
  console.log("=== コミットメント ===");
  const inCommit = fileCommitment(oldXlsx).toString();
  const outCommit = fileCommitment(pdf).toString();
  const latestCommit = fileCommitment(latestXlsx).toString();
  console.log(`input  (30.xlsx 旧)      : ${short(inCommit)}  (${oldXlsx.length} bytes)`);
  console.log(`output (30.pdf)          : ${short(outCommit)}  (${pdf.length} bytes)`);
  console.log(`latest (30(a).xlsx 最新) : ${short(latestCommit)}  (${latestXlsx.length} bytes)`);
  console.log(`input vs latest 一致?    : ${inCommit === latestCommit}  ← ${inCommit === latestCommit ? "⚠ 一致（登録が(a)で作られていた）" : "✓ 不一致（想定どおり）"}`);
  console.log("");

  // ── buildGenesisRecord（input=旧xlsx, output=pdf）──
  console.log("=== buildGenesisRecord ===");
  const transformCode = enc.encode("frame00-demo:derive-reference");
  const transformFn = (_i: Uint8Array, _a: unknown): Uint8Array => pdf;
  const { record, witness } = await buildGenesisRecord(wasmBytes, transformFn, transformCode, oldXlsx, { source: "frame00-demo" });
  console.log(`inputCommitment  : ${short(record.inputCommitment)}`);
  console.log(`outputCommitment : ${short(record.outputCommitment)}`);
  console.log(`inputByteCount   : ${record.inputByteCount}`);
  console.log(`outputByteCount  : ${record.outputByteCount}`);
  console.log(`transformerId    : ${short(record.transformerId)}`);
  console.log(`prevOutputCommitment === inputCommitment (genesis) : ${record.prevOutputCommitment === record.inputCommitment}`);
  console.log("");

  // ── normalize ──
  console.log("=== normalize ===");
  const schemaMeta = await schemas.getById(client, "transform-exec-v1");
  const schema = await define(schemaMeta);
  const normalized = schema.normalize(record);
  console.log(`normalized.inputByteCount type: ${typeof normalized.inputByteCount} = ${normalized.inputByteCount}`);
  console.log("");

  // ── prove ──
  console.log("=== prove ===");
  const witnessInput = toWitnessInput({ record, witness });
  const { proof: proofB64, inputs } = await prover.prove(client, {
    circuitId: "transform-exec-v1",
    witness: witnessInput,
  });
  console.log(`proof base64 length: ${proofB64.length}`);
  console.log(`publicSignals count: ${inputs.length}`);
  console.log(`  inputs[2] (inputCommitment)  : ${short(inputs[2])}`);
  console.log(`  inputs[3] (outputCommitment) : ${short(inputs[3])}`);
  console.log("");

  // ── verify ──
  console.log("=== verify ===");
  const meta = await circuits.getById(client, "transform-exec-v1");
  const vkeyUrl = meta.artifact.location.vkey;
  const resolved = "https://gateway.pinata.cloud/ipfs/" + vkeyUrl.slice("ipfs://".length);
  const vkey = await (await fetch(resolved)).json();
  const proofObj = JSON.parse(Buffer.from(proofB64, "base64").toString("utf8"));
  const { ok } = await verifier.verify({
    alg: "groth16-bn254-snarkjs",
    inputs: { vkey, proof: proofObj, publicSignals: [...inputs] },
  });
  console.log(`verified: ${ok}`);
  console.log("");

  // ── 結果保存 ──
  const result = {
    inputCommitment: record.inputCommitment,
    outputCommitment: record.outputCommitment,
    latestCommitment: latestCommit,
    inputByteCount: record.inputByteCount,
    outputByteCount: record.outputByteCount,
    publicSignals: toPublicSignals(record),
    proof: proofB64,
    verified: ok,
  };
  fs.writeFileSync("/root/demo-files/proof-result.json", JSON.stringify(result, null, 2));
  console.log("=== 保存: /root/demo-files/proof-result.json ===");
  console.log(`RESULT: ${ok ? "PASS ✅" : "FAIL ❌"}`);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
