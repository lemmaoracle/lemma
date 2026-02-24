/**

* Whitepaper §2.4 / §4.8 — Local ZK proof generation.
* 
* Local-dev placeholder. Production would use snarkjs with wasm/zkey
* resolved from circuit metadata artifact.location.
*/
import { createHash } from "node:crypto";
import * as R from "ramda";
import type { LemmaClient } from "@lemma/spec";

export type ProveInput = Readonly<{
  circuitId: string;
  witness: Readonly<Record<string, unknown>>;
}>;

export type ProveOutput = Readonly<{
  proofBytes: string;
  publicInputs: ReadonlyArray<string>;
}>;

const sha256Base64 = (s: string): string => createHash("sha256").update(s).digest("base64");

export const prove = (_client: LemmaClient, input: ProveInput): Promise<ProveOutput> => {
  const proof = sha256Base64(`${input.circuitId}|${JSON.stringify(input.witness)}`);
  const attrRoot = R.prop("attr_commitment_root", input.witness);
  const publicInputs: ReadonlyArray<string> = typeof attrRoot === "string" ? [attrRoot] : [];
  return Promise.resolve({ proofBytes: proof, publicInputs });
};
