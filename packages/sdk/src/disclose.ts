/**
 * Whitepaper §2.6 / §4.6 — BBS+ Selective Disclosure.
 *
 * Real BBS+ implementation using @docknetwork/crypto-wasm WASM library
 * (IETF draft-irtf-cfrg-bbs-signatures).
 */
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
import { randomBytes, utf8ToBytes, hexToBytes, bytesToHex as platformBytesToHex } from "./platform.js";

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

/**
 * Lazy WASM initialization promise.
 * Created once and reused for all crypto operations.
 */
const wasmInitPromise: Promise<void> = initializeWasm();

/**
 * Ensure WASM is initialized before any crypto operations.
 * Safe to use multiple times - will only initialize once.
 */
export const ensureWasmInitialized: Promise<void> = wasmInitPromise;

// WASM is initialized lazily on first use (e.g. generateKeyPair, sign, etc.)
// to avoid triggering @docknetwork/crypto-wasm at module-load time,
// which would fail in browsers where Buffer is not yet polyfilled.

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const te = new TextEncoder();

const KEY_MATERIAL_BYTES = 32;

const encodeMessages = (msgs: ReadonlyArray<string>): ReadonlyArray<Uint8Array> =>
  R.map((m: string) => utf8ToBytes(m), [...msgs]);

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
  await ensureWasmInitialized;

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
 *
 * Performs BBS+ signing via the `@docknetwork/crypto-wasm` WASM module,
 * which is lazy-initialized on first use (see `ensureWasmInitialized`).
 * This function performs no network I/O; it is a local cryptographic
 * operation against the WASM boundary. The `_client` parameter is
 * accepted for forward-compatibility of the public signature and is not
 * read; it is retained so future versions may add client-bound behavior
 * without a breaking change.
 *
 * Whitepaper §2.6 / §4.6.
 */
export const sign = async (_client: LemmaClient, input: SignInput): Promise<SignOutput> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized;

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
 *
 * Performs BBS+ verification via the `@docknetwork/crypto-wasm` WASM
 * module, which is lazy-initialized on first use (see
 * `ensureWasmInitialized`). This function performs no network I/O; it
 * is a local cryptographic operation against the WASM boundary. The
 * `_client` parameter is accepted for forward-compatibility of the
 * public signature and is not read; it is retained so future versions
 * may add client-bound behavior without a breaking change.
 *
 * Whitepaper §2.6 / §4.6.
 */
export const verify = async (_client: LemmaClient, signOutput: SignOutput): Promise<boolean> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized;

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
 *
 * Performs BBS+ proof generation via the `@docknetwork/crypto-wasm`
 * WASM module, which is lazy-initialized on first use (see
 * `ensureWasmInitialized`). This function performs no network I/O; it
 * is a local cryptographic operation against the WASM boundary. The
 * `_client` parameter is accepted for forward-compatibility of the
 * public signature and is not read; its type is `LemmaClient | undefined`
 * intentionally — the high-level helper `createProof` calls
 * `reveal(undefined, ...)` since it has no client in scope. The
 * parameter is retained so future versions may add client-bound
 * behavior without a breaking change.
 *
 * Whitepaper §2.6 / §4.6.
 */
export const reveal = async (
  _client: LemmaClient | undefined,
  input: RevealInput,
): Promise<RevealOutput> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized;

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
 *
 * Performs BBS+ proof verification via the `@docknetwork/crypto-wasm`
 * WASM module, which is lazy-initialized on first use (see
 * `ensureWasmInitialized`). This function performs no network I/O; it
 * is a local cryptographic operation against the WASM boundary. The
 * `_client` parameter is accepted for forward-compatibility of the
 * public signature and is not read; it is retained so future versions
 * may add client-bound behavior without a breaking change.
 *
 * Whitepaper §2.6 / §4.6.
 */
export const verifyProof = async (
  _client: LemmaClient,
  input: VerifyProofInput,
): Promise<boolean> => {
  // Ensure WASM is initialized before any crypto operations
  // eslint-disable-next-line functional/no-expression-statements
  await ensureWasmInitialized;

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
/*  High-level helpers                                                 */
/* ------------------------------------------------------------------ */

export type CreateProofInput = Readonly<{
  /** Attribute keys to reveal. Resolved to indexes against `signed.messages`
   *  by matching the `"key"` prefix of each `"key:value"` message. */
  attributes: ReadonlyArray<string>;
  /** Output of `sign` — supplies signature, messages, public key, and header. */
  signed: SignOutput;
}>;

/**
 * High-level selective-disclosure helper.
 *
 * Wraps `reveal` → `toSelectiveDisclosure` so callers can think in terms of
 * attribute key names instead of message arrays and indexes. Reuses
 * `signed.messages` to avoid recomputing `payloadToMessages`. Pair with
 * `fromSelectiveDisclosure` + `verifyProof` on the verifier side.
 */
export const createProof = async (
  input: CreateProofInput,
): Promise<SelectiveDisclosure> => {
  const messages = input.signed.messages;

  const indexes = R.pipe(
    R.map((attr: string) =>
      messages.findIndex((m: string) => m.startsWith(`${attr}:`)),
    ),
    R.filter((i: number) => i >= 0),
  )([...input.attributes]);

  return indexes.length === 0
    ? reject("attributes must match at least one message key in signed.messages")
    : reveal(undefined, {
        signature: input.signed.signature,
        messages,
        publicKey: input.signed.publicKey,
        indexes,
        header: input.signed.header,
      }).then((revealed) =>
        toSelectiveDisclosure(revealed, {
          publicKey: input.signed.publicKey,
          header: input.signed.header,
          count: messages.length,
        }),
      );
};

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

const bytesToHex = platformBytesToHex;
