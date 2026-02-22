/**

* Whitepaper §2.6 / §4.6 — BBS+ Selective Disclosure.
* 
* Local-dev placeholders. Production would use a real BBS+ library.
*/
import { createHash } from "node:crypto";
import * as R from "ramda";
import type { LemmaClient, SelectiveDisclosure } from "@lemma/spec";

export type SignInput = Readonly<{
payload: unknown;
issuerKey: string;
issuerId: string;
}>;

export type SignOutput = Readonly<{ signature: string }>;

export type RevealInput = Readonly<{
signedPayload: string;
attributes: ReadonlyArray<string>;
}>;

export type RevealOutput = Readonly<{
disclosed: Readonly<Record<string, unknown>>;
proof: string;
}>;

const sha256Hex = (s: string): string =>
createHash("sha256").update(s).digest("hex");

export const sign = async (
_client: LemmaClient,
input: SignInput,
): Promise<SignOutput> => {
const sig = sha256Hex(`${input.issuerKey}|${JSON.stringify(input.payload)}`);
return { signature: `bbs+:localdev:${input.issuerId}:${sig}` };
};

export const reveal = async (
_client: LemmaClient,
input: RevealInput,
): Promise<RevealOutput> => {
const disclosed = R.reduce<string, Record<string, unknown>>(
(acc, k) => ({ ...acc, [k]: `__disclosed__:${k}` }),
{},
[...input.attributes],
);
const proof = sha256Hex(
`${input.signedPayload}|${input.attributes.join(",")}`,
);
return { disclosed, proof: `bbs+-sd:localdev:${proof}` };
};

export const toSelectiveDisclosure = (
output: RevealOutput,
): SelectiveDisclosure => ({
format: "bbs+",
disclosedAttributes: output.disclosed,
proof: output.proof,
});
