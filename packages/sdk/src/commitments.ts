/**

* Whitepaper §2.3 — Commitments (Pedersen + Merkle placeholder).
*/
import { createHash, randomBytes } from "node:crypto";
import type { DocumentCommitments } from "@lemma/spec";
import type { Json } from "./internal";

export type PrepareInput<Raw> = Readonly<{
schema: string;
payload: Raw;
}>;

export type PrepareOutput<Norm> = Readonly<{
normalized: Norm;
commitments: DocumentCommitments & Readonly<{ randomness: string }>;
}>;

const sha256Hex = (s: string): string =>
createHash("sha256").update(s).digest("hex");

export const commitNormalized = (
normalized: Json,
): Readonly<{ attrCommitmentRoot: string; randomness: string }> => {
const randomness = randomBytes(32).toString("hex");
const root = sha256Hex(`${JSON.stringify(normalized)}|${randomness}`);
return { attrCommitmentRoot: `0x${root}`, randomness: `0x${randomness}` };
};
