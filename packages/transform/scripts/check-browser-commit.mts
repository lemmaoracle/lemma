import fs from "node:fs";
import { bytesToFieldElements, reduceElements } from "@lemmaoracle/content";
import { poseidon1, poseidon2 } from "poseidon-lite";

// clubsx matching.ts の純JS再実装と同型
const fileHash = (bytes: Uint8Array): bigint =>
  reduceElements(bytesToFieldElements(bytes), poseidon2);
const fileCommitment = (bytes: Uint8Array): bigint => poseidon1([fileHash(bytes)]);

const newPdf = new Uint8Array(fs.readFileSync("/root/demo-files/新日本の城ベスト30.pdf"));
const oldPdf = new Uint8Array(fs.readFileSync("/root/demo-files/日本の城ベスト30.pdf"));

const newCommit = fileCommitment(newPdf).toString();
const oldCommit = fileCommitment(oldPdf).toString();

console.log("新PDF commitment:", newCommit);
console.log("旧PDF commitment:", oldCommit);
console.log("");
console.log(
  "期待 outputCommitment (新PDF): 19288785797395689176758246838280509259336114684342916959617922103262908868684",
);
console.log("新PDF一致?", newCommit === "19288785797395689176758246838280509259336114684342916959617922103262908868684");
console.log("旧PDF≠新PDF?", newCommit !== oldCommit);
