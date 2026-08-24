// メタウォーター照合デモ（一致ケース）：(a).xlsx（最新基準）→ 新PDF の transform 証明を実ファイルで生成・検証
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
const INPUT_XLSX = `${FILES}/日本の城ベスト30(a).xlsx`; // 最新の基準データ
const NEW_PDF = `${FILES}/新日本の城ベスト30.pdf`; // (a) を反映した新PDF

const read = (p: string) => new Uint8Array(fs.readFileSync(p));
const wasmBytes = new Uint8Array(
  fs.readFileSync(new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url)),
);
const enc = new TextEncoder();
const short = (h: string) => "0x" + h.slice(0, 24) + "...";

async function main() {
  const inputXlsx = read(INPUT_XLSX);
  const newPdf = read(NEW_PDF);

  console.log("=== コミットメント ===");
  const inCommit = fileCommitment(inputXlsx).toString();
  const outCommit = fileCommitment(newPdf).toString();
  console.log(`input  ((a).xlsx 最新) : ${short(inCommit)}  (${inputXlsx.length} bytes)`);
  console.log(`output (新PDF)          : ${short(outCommit)}  (${newPdf.length} bytes)`);

  // ── buildGenesisRecord（input=(a).xlsx, output=新PDF）──
  console.log("=== buildGenesisRecord ===");
  const transformCode = enc.encode("frame00-demo:derive-reference");
  const transformFn = (_i: Uint8Array, _a: unknown): Uint8Array => newPdf;
  const { record, witness } = await buildGenesisRecord(
    wasmBytes,
    transformFn,
    transformCode,
    inputXlsx,
    { source: "frame00-demo" },
  );
  console.log(`inputCommitment  : ${short(record.inputCommitment)}`);
  console.log(`outputCommitment : ${short(record.outputCommitment)}`);
  console.log(`inputByteCount   : ${record.inputByteCount}`);
  console.log(`outputByteCount  : ${record.outputByteCount}`);
  console.log(`transformerId    : ${short(record.transformerId)}`);
  console.log(`prevOutputCommitment === inputCommitment (genesis) : ${record.prevOutputCommitment === record.inputCommitment}`);

  // ── normalize ──
  console.log("=== normalize ===");
  const schemaMeta = await schemas.getById(client, "transform-exec-v1");
  const schema = await define(schemaMeta);
  const normalized = schema.normalize(record);
  console.log(`normalized.inputByteCount type: ${typeof normalized.inputByteCount} = ${normalized.inputByteCount}`);

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

  // ── 結果保存 ──
  const result = {
    inputCommitment: record.inputCommitment,
    outputCommitment: record.outputCommitment,
    inputByteCount: record.inputByteCount,
    outputByteCount: record.outputByteCount,
    publicSignals: toPublicSignals(record),
    proof: proofB64,
    verified: ok,
  };
  fs.writeFileSync("/root/demo-files/proof-result-match.json", JSON.stringify(result, null, 2));
  console.log("=== 保存: /root/demo-files/proof-result-match.json ===");
  console.log(`RESULT: ${ok ? "PASS ✅" : "FAIL ❌"}`);
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
