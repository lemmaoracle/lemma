/**
 * Whitepaper §2.6 / §4.6 — BBS+ Selective Disclosure.
 *
 * Real BBS+ implementation using @docknetwork/crypto-wasm WASM library
 * (IETF draft-irtf-cfrg-bbs-signatures).
 */
import { randomBytes } from "node:crypto";
import * as R from "ramda";
import {
  initializeWasm,
  bbsPlusGenerateSigningKey,
  bbsPlusGenerateSignatureParamsG1,
  bbsPlusGeneratePublicKeyG2,
  bbsPlusSignG1,
  bbsPlusVerifyG1,
  bbsPlusInitializeProofOfKnowledgeOfSignature,
  bbsPlusGenProofOfKnowledgeOfSignature,
  bbsPlusVerifyProofOfKnowledgeOfSignature,
  bbsPlusChallengeContributionFromProtocol,
  bbsPlusChallengeContributionFromProof,
  generateChallengeFromBytes,
} from "@docknetwork/crypto-wasm";
import type { LemmaClient, SelectiveDisclosure } from "@lemma/spec";
import { reject } from "./internal";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BbsKeyPair = Readonly<{
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}>;

// Slimmer SignInput - publicKey is derived from secretKey
export type SignInput = Readonly<{
  messages: ReadonlyArray<string>;
  secretKey: Uint8Array;
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
}>;

/* ------------------------------------------------------------------ */
/*  WASM Initialization                                                */
/* ------------------------------------------------------------------ */

// Initialize WASM once when the module loads
// eslint-disable-next-line functional/no-expression-statements
void initializeWasm();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const te = new TextEncoder();

const KEY_MATERIAL_BYTES = 32;

const encodeMessages = (msgs: ReadonlyArray<string>): ReadonlyArray<Uint8Array> =>
  R.map((m: string) => Uint8Array.from(Buffer.from(m, "utf-8")), [...msgs]);

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
/* eslint-disable @typescript-eslint/require-await -- Async for API consistency, WASM calls are sync */
export const generateKeyPair = async (options: KeyGenOptions = {}): Promise<BbsKeyPair> => {
  const info = options.keyInfo ?? te.encode("lemma-bbs-key");

  // Generate a 32-byte random seed
  const seed = randomBytes(KEY_MATERIAL_BYTES);

  // Generate signing key from seed
  const secretKey = bbsPlusGenerateSigningKey(seed);

  // Generate signature params for 1 message
  const params = bbsPlusGenerateSignatureParamsG1(1, info);

  // Generate public key from secret key
  const publicKey = bbsPlusGeneratePublicKeyG2(secretKey, params);

  return {
    secretKey,
    publicKey,
  };
};
/* eslint-enable @typescript-eslint/require-await */

/**
 * Issuer signs a set of attribute messages with their BBS+ secret key.
 */
export const sign = async (_client: LemmaClient, input: SignInput): Promise<SignOutput> =>
  input.messages.length === 0
    ? reject("messages must not be empty")
    : R.pipe(encodeMessages, (scalars) => {
        // Generate signature params based on message count
        const params = bbsPlusGenerateSignatureParamsG1(input.messages.length, input.header);

        // Sign the messages
        const signature = bbsPlusSignG1(
          [...scalars],
          input.secretKey,
          params,
          true, // messages are already encoded as Uint8Array
        );

        // Generate public key from secret key
        const publicKey = bbsPlusGeneratePublicKeyG2(input.secretKey, params);

        return {
          signature,
          messages: input.messages,
          publicKey,
          header: input.header,
          issuerId: input.issuerId,
        };
      })(input.messages);

/**
 * Verify a BBS+ signature against the issuer's public key.
 */
/* eslint-disable @typescript-eslint/require-await -- Async for API consistency, WASM calls are sync */
export const verify = async (_client: LemmaClient, signOutput: SignOutput): Promise<boolean> =>
  R.pipe(encodeMessages, (scalars) => {
    const params = bbsPlusGenerateSignatureParamsG1(signOutput.messages.length, signOutput.header);

    const result = bbsPlusVerifyG1(
      [...scalars],
      signOutput.signature,
      signOutput.publicKey,
      params,
      true, // messages are already encoded as Uint8Array
    );

    return result.verified;
  })(signOutput.messages);
/* eslint-enable @typescript-eslint/require-await */

/**
 * Holder creates a selective disclosure proof, choosing which
 * attribute indexes to reveal.
 */
export const reveal = async (_client: LemmaClient, input: RevealInput): Promise<RevealOutput> =>
  input.disclosedIndexes.length === 0
    ? reject("disclosedIndexes must not be empty")
    : R.pipe(encodeMessages, (scalars) => {
        const params = bbsPlusGenerateSignatureParamsG1(input.messages.length, input.header);

        // Build revealed messages map for the challenge contribution
        const revealedMsgs = new Map<number, Uint8Array>();
        for (const idx of input.disclosedIndexes) {
          revealedMsgs.set(idx, scalars[idx]!);
        }

        // Initialize proof of knowledge protocol with empty blindings
        const protocol = bbsPlusInitializeProofOfKnowledgeOfSignature(
          input.signature,
          params,
          [...scalars],
          new Map<number, Uint8Array>(),
          new Set(input.disclosedIndexes),
          true, // messages are already encoded as Uint8Array
        );

        // Generate challenge from protocol
        const challengeProver = generateChallengeFromBytes(
          bbsPlusChallengeContributionFromProtocol(protocol, revealedMsgs, params, true),
        );

        // Generate proof
        const proof = bbsPlusGenProofOfKnowledgeOfSignature(protocol, challengeProver);

        const disclosedMessages: ReadonlyArray<string> = R.map(
          (i: number) => input.messages[i] ?? "",
          [...input.disclosedIndexes],
        );
        const disclosed = messagesToDisclosedMap(input.messages, input.disclosedIndexes);

        return {
          disclosed,
          proof,
          disclosedIndexes: input.disclosedIndexes,
          disclosedMessages,
        };
      })(input.messages);

/**
 * Verifier checks a selective-disclosure proof against the issuer's public key.
 */
/* eslint-disable @typescript-eslint/require-await -- Async for API consistency, WASM calls are sync */
export const verifyProof = async (
  _client: LemmaClient,
  input: VerifyProofInput,
): Promise<boolean> =>
  R.pipe(encodeMessages, (disclosedScalars) => {
    const params = bbsPlusGenerateSignatureParamsG1(input.totalMessageCount, input.header);

    const revealedMsgs = new Map<number, Uint8Array>();

    // Populate revealed messages map
    for (let i = 0; i < input.disclosedIndexes.length; i++) {
      const idx = input.disclosedIndexes[i]!;
      const scalar = disclosedScalars[i]!;
      revealedMsgs.set(idx, scalar);
    }

    // Generate challenge from proof
    const challengeVerifier = generateChallengeFromBytes(
      bbsPlusChallengeContributionFromProof(input.proof, revealedMsgs, params, true),
    );

    const result = bbsPlusVerifyProofOfKnowledgeOfSignature(
      input.proof,
      revealedMsgs,
      challengeVerifier,
      input.publicKey,
      params,
      true, // messages are already encoded as Uint8Array
    );

    return result.verified;
  })(input.disclosedMessages);
/* eslint-enable @typescript-eslint/require-await */

/**
 * Wrap a RevealOutput into the spec's SelectiveDisclosure envelope.
 */
export const toSelectiveDisclosure = (output: RevealOutput): SelectiveDisclosure => ({
  format: "bbs+",
  disclosedAttributes: output.disclosed,
  proof: bytesToHex(output.proof),
});

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

// Helper function for hex conversion
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
