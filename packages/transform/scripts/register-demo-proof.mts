// メタウォーター照合デモ：30.xlsx（旧）→ 30.pdf の transform 証明を Lemma に登録
// documents.register（docHash = outputCommitment＝PDF側）→ proofs.submit
import fs from "node:fs";
import { create, documents, proofs } from "@lemmaoracle/sdk";
import type { RegisterDocumentRequest } from "@lemmaoracle/spec";

const RESULT = JSON.parse(fs.readFileSync("/root/demo-files/proof-result.json", "utf8")) as {
  inputCommitment: string;
  outputCommitment: string;
  latestCommitment: string;
  publicSignals: string[];
  proof: string;
  verified: boolean;
};

const API_BASE = "https://workers.lemma.workers.dev";
const API_KEY = process.env.LEMMA_API_KEY!;

const client = create({ apiBase: API_BASE, apiKey: API_KEY });

// docHash = outputCommitment（PDF側）で引き当てる。
// getByDocHash は 0x+64hex（bytes32）を要求するため、BN254 フィールド要素を
// ゼロパディングした bytes32 hex に変換する。
const toBytes32Hex = (decimal: string): string =>
  "0x" + BigInt(decimal).toString(16).padStart(64, "0");

const docHash = toBytes32Hex(RESULT.outputCommitment);

async function main() {
  // ── documents.register ──
  const req: RegisterDocumentRequest = {
    schema: "transform-exec-v1",
    docHash,
    cid: "ipfs://demo/frame00/castle-best30", // 実コンテンツ取得は不要（コミットメント比較で照合）
    issuerId: "frame00",
    subjectId: "metawater-demo",
    commitments: {
      scheme: "poseidon",
      root: docHash, // outputCommitment をルートとして登録
      leaves: [RESULT.inputCommitment, RESULT.outputCommitment],
      randomness: "0",
    },
    attributes: {
      title: "日本の城ベスト30",
      inputCommitment: RESULT.inputCommitment,
      outputCommitment: RESULT.outputCommitment,
    },
    revocation: { scheme: "poseidon", root: "0" },
  };

  console.log("=== documents.register ===");
  console.log(`docHash (outputCommitment/PDF): ${docHash.slice(0, 24)}...`);
  console.log(`inputCommitment (old xlsx):     ${RESULT.inputCommitment.slice(0, 24)}...`);
  const docRes = await documents.register(client, req);
  console.log("register response:", JSON.stringify(docRes));

  // ── proofs.submit ──
  console.log("\n=== proofs.submit ===");
  const proofRes = await proofs.submit(client, {
    docHash,
    circuitId: "transform-exec-v1",
    proof: RESULT.proof,
    inputs: RESULT.publicSignals,
  });
  console.log("submit response:", JSON.stringify(proofRes));

  // ── 引き当て確認 ──
  console.log("\n=== proofs.getByDocHash（引き当て確認）===");
  const fetched = await proofs.getByDocHash(client, docHash);
  console.log("fetched:", JSON.stringify(fetched).slice(0, 600));

  console.log("\n=== DONE ===");
  console.log(`docHash=${docHash}`);
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
