/**
 * Whitepaper §2.6 / §4.6 — BBS+ Selective Disclosure.
 *
 * Real BBS+ implementation using @grottonetworking/bbs-signatures
 * (IETF draft-irtf-cfrg-bbs-signatures-05).
 */
import { randomBytes } from "node:crypto";
import * as R from "ramda";
import {
  API_ID_BBS_SHAKE,
  bytesToHex,
  keyGen,
  messages_to_scalars,
  prepareGenerators,
  proofGen,
  proofVerify,
  publicFromPrivate,
  sign as bbsSign,
  verify as bbsVerify,
} from "@grottonetworking/bbs-signatures";
import type { LemmaClient, SelectiveDisclosure } from "@lemma/spec";
import { reject } from "./internal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BbsKeyPair = Readonly<{
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}>;

export type SignInput = Readonly<{
  messages: ReadonlyArray<string>;
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  header: Uint8Array;
  issuerId: string;
}>;

export type SignOutput = Readonly<{
  signature: Uint8Array;
  messages: ReadonlyArray<string>;
  publicKey: Uint8Array;
  header: Uint8Array;
  issuerId: string;
}>;

export type RevealInput = Readonly<{
  signature: Uint8Array;
  messages: ReadonlyArray<string>;
  publicKey: Uint8Array;
  disclosedIndexes: ReadonlyArray<number>;
  header: Uint8Array;
  presentationHeader?: Uint8Array;
}>;

export type RevealOutput = Readonly<{
  disclosed: Readonly<Record<string, unknown>>;
  proof: Uint8Array;
  disclosedIndexes: ReadonlyArray<number>;
  disclosedMessages: ReadonlyArray<string>;
}>;

export type VerifyProofInput = Readonly<{
  proof: Uint8Array;
  publicKey: Uint8Array;
  disclosedMessages: ReadonlyArray<string>;
  disclosedIndexes: ReadonlyArray<number>;
  totalMessageCount: number;
  header: Uint8Array;
  presentationHeader?: Uint8Array;
}>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const te = new TextEncoder();

const KEY_MATERIAL_BYTES = 40;

const encodeMessages = (msgs: ReadonlyArray<string>): ReadonlyArray<Uint8Array> =>
  R.map((m: string) => te.encode(m), [...msgs]);

/**
 * Convert an attribute object `{ age: 25, name: "John" }` to a
 * deterministically-sorted array of `"key:value"` strings.
 */
export const payloadToMessages = (
  payload: Readonly<Record<string, unknown>>,
): ReadonlyArray<string> => {
  const keys: ReadonlyArray<string> = Object.keys(payload);
  return R.pipe(
    R.sort<string>(R.comparator(R.lt)),
    R.map((k: string) => `${k}:${String(payload[k])}`),
  )(keys);
};

/**
 * Reconstruct a disclosed-attribute map from the original messages and
 * the indexes that were revealed.
 */
export const messagesToDisclosedMap = (
  messages: ReadonlyArray<string>,
  indexes: ReadonlyArray<number>,
): Readonly<Record<string, unknown>> =>
  R.reduce<number, Record<string, unknown>>(
    (acc, idx) => {
      const msg = messages[idx] ?? "";
      const colonPos = msg.indexOf(":");
      const key = colonPos === -1 ? msg : msg.slice(0, colonPos);
      const value = colonPos === -1 ? "" : msg.slice(colonPos + 1);
      return { ...acc, [key]: value };
    },
    {},
    [...indexes],
  );

/* ------------------------------------------------------------------ */
/*  Core functions                                                     */
/* ------------------------------------------------------------------ */

export type KeyGenOptions = Readonly<{
  keyInfo?: Uint8Array;
}>;

/**
 * Generate a BBS+ key pair (secret key: 32 bytes, public key: 96 bytes).
 */
export const generateKeyPair = async (
  options: KeyGenOptions = {},
): Promise<BbsKeyPair> => {
  const keyMaterial = new Uint8Array(randomBytes(KEY_MATERIAL_BYTES).buffer);
  const info = options.keyInfo ?? te.encode("lemma-bbs-key");
  const secretKey = await keyGen(keyMaterial, info, undefined, API_ID_BBS_SHAKE);
  const publicKey = publicFromPrivate(secretKey);
  return { secretKey, publicKey };
};

/**
 * Issuer signs a set of attribute messages with their BBS+ secret key.
 */
export const sign = async (
  _client: LemmaClient,
  input: SignInput,
): Promise<SignOutput> =>
  input.messages.length === 0
    ? reject("messages must not be empty")
    : messages_to_scalars(encodeMessages(input.messages), API_ID_BBS_SHAKE).then(
        async (scalars) => {
          const gens = await prepareGenerators(
            input.messages.length + 1,
            API_ID_BBS_SHAKE,
          );
          const signature = await bbsSign(
            input.secretKey,
            input.publicKey,
            input.header,
            scalars,
            gens,
            API_ID_BBS_SHAKE,
          );
          return {
            signature,
            messages: input.messages,
            publicKey: input.publicKey,
            header: input.header,
            issuerId: input.issuerId,
          };
        },
      );

/**
 * Verify a BBS+ signature against the issuer's public key.
 */
export const verify = async (
  _client: LemmaClient,
  signOutput: SignOutput,
): Promise<boolean> =>
  messages_to_scalars(
    encodeMessages(signOutput.messages),
    API_ID_BBS_SHAKE,
  ).then(async (scalars) => {
    const gens = await prepareGenerators(
      signOutput.messages.length + 1,
      API_ID_BBS_SHAKE,
    );
    return bbsVerify(
      signOutput.publicKey,
      signOutput.signature,
      signOutput.header,
      scalars,
      gens,
      API_ID_BBS_SHAKE,
    );
  });

/**
 * Holder creates a selective disclosure proof, choosing which
 * attribute indexes to reveal.
 */
export const reveal = async (
  _client: LemmaClient,
  input: RevealInput,
): Promise<RevealOutput> =>
  input.disclosedIndexes.length === 0
    ? reject("disclosedIndexes must not be empty")
    : messages_to_scalars(encodeMessages(input.messages), API_ID_BBS_SHAKE).then(
        async (scalars) => {
          const gens = await prepareGenerators(
            input.messages.length + 1,
            API_ID_BBS_SHAKE,
          );
          const ph = input.presentationHeader ?? new Uint8Array();
          const proof = await proofGen(
            input.publicKey,
            input.signature,
            input.header,
            ph,
            scalars,
            [...input.disclosedIndexes],
            gens,
            API_ID_BBS_SHAKE,
          );
          const disclosedMessages: ReadonlyArray<string> = R.map(
            (i: number) => input.messages[i] ?? "",
            [...input.disclosedIndexes],
          );
          const disclosed = messagesToDisclosedMap(input.messages, input.disclosedIndexes);
          return { disclosed, proof, disclosedIndexes: input.disclosedIndexes, disclosedMessages };
        },
      );

/**
 * Verifier checks a selective-disclosure proof against the issuer's public key.
 */
export const verifyProof = async (
  _client: LemmaClient,
  input: VerifyProofInput,
): Promise<boolean> =>
  messages_to_scalars(
    encodeMessages(input.disclosedMessages),
    API_ID_BBS_SHAKE,
  ).then(async (disclosedScalars) => {
    const gens = await prepareGenerators(
      input.totalMessageCount + 1,
      API_ID_BBS_SHAKE,
    );
    const ph = input.presentationHeader ?? new Uint8Array();
    return proofVerify(
      input.publicKey,
      input.proof,
      input.header,
      ph,
      disclosedScalars,
      [...input.disclosedIndexes],
      gens,
      API_ID_BBS_SHAKE,
    );
  });

/**
 * Wrap a RevealOutput into the spec's SelectiveDisclosure envelope.
 */
export const toSelectiveDisclosure = (output: RevealOutput): SelectiveDisclosure => ({
  format: "bbs+",
  disclosedAttributes: output.disclosed,
  proof: bytesToHex(output.proof),
});
