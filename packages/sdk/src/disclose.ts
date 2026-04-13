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
import type { LemmaClient, SelectiveDisclosure } from "@lemmaoracle/spec";
import { reject } from "./internal.js";

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
  indexes: ReadonlyArray<number>;
  header: Uint8Array;
}>;

export type RevealOutput = Readonly<{
  disclosed: Readonly<Record<string, unknown>>;
  proof: Uint8Array;
  indexes: ReadonlyArray<number>;
  messages: ReadonlyArray<string>;
}>;

export type VerifyProofInput = Readonly<{
  proof: Uint8Array;
  publicKey: Uint8Array;
  messages: ReadonlyArray<string>;
  indexes: ReadonlyArray<number>;
  count: number;
  header: Uint8Array;
}>;

/* ------------------------------------------------------------------ */
/*  WASM Initialization                                                */
/* ------------------------------------------------------------------ */

// Track WASM initialization state
// eslint-disable-next-line functional/no-let
let wasmInitPromise: Promise<void> | null = null;

/**
 * Ensure WASM is initialized before any crypto operations.
 * Safe to call multiple times - will only initialize once.
 */
// eslint-disable-next-line functional/functional-parameters
export const ensureWasmInitialized: () => Promise<void> = async () => {
  // eslint-disable-next-line functional/no-conditional-statements
  if (wasmInitPromise === null) {
    // eslint-disable-next-line functional/no-expression-statements
    wasmInitPromise = initializeWasm();
  }
  // eslint-disable-next-line functional/no-expression-statements
  await wasmInitPromise;
};

// Start initialization eagerly (non-blocking)
// eslint-disable-next-line functional/no-expression-statements
void ensureWasmInitialized();

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
export const generateKeyPair = async (options: KeyGenOptions = {}): Promise<BbsKeyPair> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized();

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

/**
 * Issuer signs a set of attribute messages with their BBS+ secret key.
 */
export const sign = async (_client: LemmaClient, input: SignInput): Promise<SignOutput> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized();

  return input.messages.length === 0
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
};

/**
 * Verify a BBS+ signature against the issuer's public key.
 */
export const verify = async (_client: LemmaClient, signOutput: SignOutput): Promise<boolean> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized();

  return R.pipe(encodeMessages, (scalars) => {
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
};

/**
 * Holder creates a selective disclosure proof, choosing which
 * attribute indexes to reveal.
 */
export const reveal = async (_client: LemmaClient, input: RevealInput): Promise<RevealOutput> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized();

  return input.indexes.length === 0
    ? reject("indexes must not be empty")
    : R.pipe(encodeMessages, (scalars) => {
        const params = bbsPlusGenerateSignatureParamsG1(input.messages.length, input.header);

        // Build revealed messages map for the challenge contribution
        const revealedMsgs = new Map<number, Uint8Array>(
          R.map((idx: number) => [idx, scalars[idx] ?? new Uint8Array()] as const, [...input.indexes]),
        );

        // Initialize proof of knowledge protocol with empty blindings
        const protocol = bbsPlusInitializeProofOfKnowledgeOfSignature(
          input.signature,
          params,
          [...scalars],
          new Map<number, Uint8Array>(),
          new Set(input.indexes),
          true, // messages are already encoded as Uint8Array
        );

        // Generate challenge from protocol
        const challengeProver = generateChallengeFromBytes(
          bbsPlusChallengeContributionFromProtocol(protocol, revealedMsgs, params, true),
        );

        // Generate proof
        const proof = bbsPlusGenProofOfKnowledgeOfSignature(protocol, challengeProver);

        const revealedMessages: ReadonlyArray<string> = R.map(
          (i: number) => input.messages[i] ?? "",
          [...input.indexes],
        );
        const disclosed = messagesToDisclosedMap(input.messages, input.indexes);

        return {
          disclosed,
          proof,
          indexes: input.indexes,
          messages: revealedMessages,
        };
      })(input.messages);
};

/**
 * Verifier checks a selective-disclosure proof against the issuer's public key.
 */
export const verifyProof = async (
  _client: LemmaClient,
  input: VerifyProofInput,
): Promise<boolean> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized();

  return R.pipe(encodeMessages, (disclosedScalars) => {
    const params = bbsPlusGenerateSignatureParamsG1(input.count, input.header);

    // Populate revealed messages map
    const revealedMsgs = new Map<number, Uint8Array>(
      R.addIndex<number, readonly [number, Uint8Array]>(R.map)(
        (idx: number, i: number) => [idx, disclosedScalars[i] ?? new Uint8Array()] as const,
        [...input.indexes],
      ),
    );

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
  })(input.messages);
};

/**
 * Context from the signing / reveal flow needed to make the
 * SelectiveDisclosure envelope self-verifiable.
 */
export type RevealContext = Readonly<{
  /** Issuer BLS12-381 public key (96 bytes). */
  publicKey: Uint8Array;
  /** Header bytes used during BBS+ signing. */
  header: Uint8Array;
  /** Total number of messages in the original BBS+ signature. */
  count: number;
  /** Optional access condition for the returned SelectiveDisclosure. */
  condition?: Readonly<{ circuitId: string }>;
}>;

/**
 * Wrap a RevealOutput into the spec's SelectiveDisclosure envelope.
 *
 * The RevealContext supplies the issuer public key, header, and total
 * message count so that any third-party verifier can later call
 * `disclose.verifyProof` using only the data inside the envelope.
 */
export const toSelectiveDisclosure = (
  output: RevealOutput,
  context: RevealContext,
): SelectiveDisclosure => ({
  format: "bbs+",
  attributes: output.disclosed,
  proof: bytesToHex(output.proof),
  publicKey: bytesToHex(context.publicKey),
  indexes: output.indexes,
  count: context.count,
  header: bytesToHex(context.header),
  ...(context.condition ? { condition: context.condition } : {}),
});

/**
 * Reconstruct a VerifyProofInput from a persisted SelectiveDisclosure.
 *
 * This is the inverse of `toSelectiveDisclosure` — it converts the
 * hex-encoded envelope back into the binary form that `verifyProof`
 * expects, enabling any party to verify the BBS+ proof independently.
 */
export const fromSelectiveDisclosure = (
  sd: SelectiveDisclosure,
): VerifyProofInput => ({
  proof: hexToBytes(sd.proof),
  publicKey: hexToBytes(sd.publicKey),
  messages: R.pipe(
    Object.entries,
    R.sort<[string, unknown]>(R.comparator((a, b) => a[0] < b[0])),
    R.map(([k, v]: [string, unknown]) => `${k}:${String(v)}`),
  )(sd.attributes),
  indexes: [...sd.indexes],
  count: sd.count,
  header: hexToBytes(sd.header),
});

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  // eslint-disable-next-line functional/no-loop-statements, functional/no-let
  for (let i = 0; i < clean.length; i += 2) {
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
};
