import fs from "node:fs";
import { buildGenesisRecord } from "@lemmaoracle/transform";
import { create, schemas, define, prepare } from "@lemmaoracle/sdk";

const client = create({
  apiBase: "https://workers.lemma.workers.dev",
  apiKey: process.env.LEMMA_API_KEY!,
});
const FILES = "/root/demo-files";
const read = (p: string) => new Uint8Array(fs.readFileSync(p));
const enc = new TextEncoder();

async function main() {
  const oldXlsx = read(`${FILES}/日本の城ベスト30.xlsx`);
  const pdf = read(`${FILES}/日本の城ベスト30.pdf`);
  const wasmBytes = new Uint8Array(
    fs.readFileSync(new URL("../normalize/pkg/lemma_transform_bg.wasm", import.meta.url)),
  );

  const transformCode = enc.encode("frame00-demo:derive-reference");
  const transformFn = (_i: Uint8Array, _a: unknown): Uint8Array => pdf;
  const { record } = await buildGenesisRecord(wasmBytes, transformFn, transformCode, oldXlsx, {
    source: "frame00-demo",
  });

  const schemaMeta = await schemas.getById(client, "transform-exec-v1");
  const schema = await define(schemaMeta);
  const prep = await prepare(client, { schema: "transform-exec-v1", payload: record });

  console.log("normalized keys:", Object.keys(prep.normalized).join(", "));
  console.log("commitments.root:", prep.commitments.root);
  console.log("commitments.leaves:", prep.commitments.leaves.length);
  console.log("commitments.randomness:", prep.commitments.randomness.slice(0, 20) + "...");
  console.log("depth:", prep.depth);
  console.log("");
  console.log("record.outputCommitment:", record.outputCommitment);
  console.log("root === outputCommitment?", prep.commitments.root === record.outputCommitment);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
