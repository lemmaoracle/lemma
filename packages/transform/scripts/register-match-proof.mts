// メタウォーター照合デモ（一致ケース）：(a).xlsx（最新）→ 新PDF の transform 証明を Lemma に登録
// documents.register（docHash = outputCommitment＝新PDF側）→ proofs.submit
import fs from "node:fs";
import { create, documents, proofs } from "@lemmaoracle/sdk";
import type { RegisterDocumentRequest } from "@lemmaoracle/spec";

const RESULT = JSON.parse(fs.readFileSync("/root/demo-files/proof-result-match.json", "utf8")) as {
  inputCommitment: string;
  outputCommitment: string;
  publicSignals: string[];
  proof: string;
  verified: boolean;
};

const API_BASE = "https://workers.lemma.workers.dev";
const API_KEY = process.env.LEMMA_API_KEY!;

const client = create({ apiBase: API_BASE, apiKey: API_KEY });

const toBytes32Hex = (decimal: string): string =>
  "0x" + BigInt(decimal).toString(16).padStart(64, "0");

const docHash = toBytes32Hex(RESULT.outputCommitment);

async function main() {
  console.log("=== documents.register ===");
  console.log(`docHash (新PDF outputCommitment): ${docHash.slice(0, 24)}...`);
  console.log(`inputCommitment ((a).xlsx 最新):  ${RESULT.inputCommitment.slice(0, 24)}...`);

  const req: RegisterDocumentRequest = {
    schema: "transform-exec-v1",
    docHash,
    cid: "ipfs://demo/frame00/castle-best30-match",
    issuerId: "frame00",
    subjectId: "metawater-demo",
    commitments: {
      scheme: "poseidon",
      root: docHash,
      leaves: [RESULT.inputCommitment, RESULT.outputCommitment],
      randomness: "0",
    },
    attributes: {
      title: "新日本の城ベスト30",
      inputCommitment: RESULT.inputCommitment,
      outputCommitment: RESULT.outputCommitment,
    },
    revocation: { scheme: "poseidon", root: "0" },
  };

  const docRes = await documents.register(client, req);
  console.log("register response:", JSON.stringify(docRes));

  console.log("\n=== proofs.submit ===");
  const proofRes = await proofs.submit(client, {
    docHash,
    circuitId: "transform-exec-v1",
    proof: RESULT.proof,
    inputs: RESULT.publicSignals,
  });
  console.log("submit response:", JSON.stringify(proofRes));

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
