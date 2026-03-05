/**
 * Whitepaper §2.1 / §4.4 — Encrypted Documents and docHash.
 *
 * ECIES: ECDH (secp256k1) + HKDF-SHA256 + configurable AEAD (default: aes-256-gcm) + SHA3-256(docHash).
 * The holder's public key (secp256k1 compressed hex) and payload are used
 * to derive a shared key, encrypt the JSON payload, and produce docHash/CID.
 */

import { secp256k1 } from "@noble/curves/secp256k1";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { sha3_256 } from "@noble/hashes/sha3";
import { gcm } from "@noble/ciphers/aes";
import { randomBytes, bytesToHex, concatBytes } from "@noble/hashes/utils";
import * as R from "ramda";
import type { LemmaClient } from "@lemma/spec";

export type EncryptionAlgorithm =
  | "aes-256-gcm"; // default; additional algorithms reserved for future use

export type EncryptInput = Readonly<{
  payload: unknown;
  holderKey: string;
  algorithm?: EncryptionAlgorithm; // optional — defaults to "aes-256-gcm"
}>;

export type EncryptOutput = Readonly<{
  docHash: string;
  cid: string;
  encryptedDocBase64: string;
  algorithm: EncryptionAlgorithm; // encryption algorithm used (e.g., "aes-256-gcm")
}>;

export type DecryptInput = Readonly<{
  encryptedDocBase64: string;
  holderPrivateKey: string;
  algorithm?: EncryptionAlgorithm; // optional — needed for future algorithm support
}>;

export type DecryptOutput = Readonly<{
  payload: unknown;
}>;

// Base32 alphabet (RFC 4648, lowercased, no padding)
const BASE32_CHARS = "abcdefghijklmnopqrstuvwxyz234567";

type BitsState = Readonly<{
  bits: number;
  bitCount: number;
  resultChars: ReadonlyArray<string>;
}>;

const base32lower = (bytes: Uint8Array): string => {
  // Accumulate all bits and extract 5-bit groups
  type EncodeState = Readonly<{
    buffer: number;
    bufferBits: number;
    output: readonly string[];
  }>;

  const processByte = (state: EncodeState, byte: number): EncodeState => {
    const newBuffer = (state.buffer << 8) | byte;
    const newBufferBits = state.bufferBits + 8;

    // Extract as many 5-bit groups as possible using iteration
    const extractAllGroups = (
      buffer: number,
      bufferBits: number,
      output: readonly string[],
    ): readonly string[] => {
      const groups: string[] = [];
      let currentBuffer = buffer;
      let currentBits = bufferBits;

      while (currentBits >= 5) {
        const shift = currentBits - 5;
        const charIndex = (currentBuffer >> shift) & 0x1f;
        groups.push(BASE32_CHARS.charAt(charIndex));
        currentBuffer = currentBuffer & ((1 << shift) - 1);
        currentBits -= 5;
      }

      return [...output, ...groups];
    };

    const newOutput = extractAllGroups(newBuffer, newBufferBits, state.output);
    const remainingBits = newBufferBits % 5;
    const remainingBuffer = remainingBits > 0 ? newBuffer & ((1 << remainingBits) - 1) : 0;

    return {
      buffer: remainingBuffer,
      bufferBits: remainingBits,
      output: newOutput,
    };
  };

  const finalState = R.reduce<number, EncodeState>(
    processByte,
    { buffer: 0, bufferBits: 0, output: [] },
    Array.from(bytes),
  );

  // Add padding character for remaining bits
  const finalOutput = R.when(
    (state: EncodeState) => state.bufferBits > 0,
    (state: EncodeState) => ({
      ...state,
      output: [...state.output, BASE32_CHARS[(state.buffer << (5 - state.bufferBits)) & 0x1f]],
    }),
  )(finalState);

  return finalOutput.output.join("");
};

// Compute CIDv1-raw (IPFS-compatible content identifier)
const computeCidV1Raw = (content: Uint8Array): string => {
  // CIDv1-raw: version=1, codec=raw(0x55), hash=sha2-256(0x12), digest length=32
  const prefix = new Uint8Array([0x01, 0x55, 0x12, 0x20]);
  const digest = sha256(content);
  const cidBytes = concatBytes(prefix, digest);
  return "b" + base32lower(cidBytes);
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const processTriplet = (tripletIndex: number): string => {
    const i = tripletIndex * 3;
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;

    const hasB2 = i + 1 < bytes.length;
    const hasB3 = i + 2 < bytes.length;

    const c1 = chars[(b1 >> 2) & 0x3f];
    const c2 = chars[((b1 << 4) | (b2 >> 4)) & 0x3f];
    const c3 = hasB2 ? chars[((b2 << 2) | (b3 >> 6)) & 0x3f] : "=";
    const c4 = hasB3 ? chars[b3 & 0x3f] : "=";

    return `${c1}${c2}${c3}${c4}`;
  };

  const triplets = R.range(0, Math.ceil(bytes.length / 3));
  return R.pipe(R.map(processTriplet), R.join(""))(triplets);
};

const base64ToBytes = (str: string): Uint8Array => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const processQuad = (i: number): number[] => {
    const enc1 = chars.indexOf(str[i] ?? "");
    const enc2 = i + 1 < str.length ? chars.indexOf(str[i + 1] ?? "") : 0;
    const enc3 = i + 2 < str.length ? chars.indexOf(str[i + 2] ?? "") : 0;
    const enc4 = i + 3 < str.length ? chars.indexOf(str[i + 3] ?? "") : 0;

    const b1 = (enc1 << 2) | (enc2 >> 4);

    const maybeB2 = str[i + 2] !== "=" ? ((enc2 << 4) | (enc3 >> 2)) & 0xff : null;
    const maybeB3 = str[i + 3] !== "=" ? ((enc3 << 6) | enc4) & 0xff : null;

    return R.pipe(
      () => [b1],
      (bytes: number[]) =>
        R.when(
          () => maybeB2 !== null,
          (b) => [...b, maybeB2!],
          bytes,
        ),
      (bytes: number[]) =>
        R.when(
          () => maybeB3 !== null,
          (b) => [...b, maybeB3!],
          bytes,
        ),
    )();
  };

  const quads = R.range(0, Math.ceil(str.length / 4));
  const byteArray = R.chain((i) => processQuad(i * 4), quads);

  return Uint8Array.from(byteArray);
};

// Validate and normalize secp256k1 public key
// Accepts: 66-char hex (compressed, with or without 0x prefix)
const validateHolderKey = (holderKey: string): Uint8Array => {
  const stripPrefix = (key: string): string => (key.startsWith("0x") ? key.slice(2) : key);

  const isValidLength = R.either(
    (key: string) => key.length === 66,
    (key: string) => key.length === 68,
  );

  const normalizedKey = R.pipe(
    stripPrefix,
    R.when(
      (key: string) => !isValidLength(key),
      () => {
        throw new Error("Invalid secp256k1 public key");
      },
    ),
  )(holderKey);

  // Parse as hex string (without 0x prefix) or Uint8Array
  const keyBytes = Uint8Array.from(Buffer.from(normalizedKey, "hex"));

  // Validate the key is a valid point
  /* eslint-disable-next-line functional/no-try-statements --
   * Crypto boundary: validating cryptographic keys requires try-catch */
  try {
    secp256k1.ProjectivePoint.fromHex(keyBytes);
    return keyBytes;
  } catch {
    throw new Error("Invalid secp256k1 public key");
  }
};

export const encrypt = (_client: LemmaClient, input: EncryptInput): Promise<EncryptOutput> => {
  const holderPubKeyHex = bytesToHex(validateHolderKey(input.holderKey));
  const payloadBytes = Buffer.from(JSON.stringify(input.payload), "utf8");

  // Determine algorithm (default to "aes-256-gcm")
  const algorithm = input.algorithm ?? "aes-256-gcm";

  // Generate ephemeral key pair
  const ephemeralPrivKey = secp256k1.utils.randomPrivateKey();
  const ephemeralPubKey = secp256k1.getPublicKey(ephemeralPrivKey, true);

  // ECDH: derive shared secret using holder's public key and ephemeral's private key
  // getSharedSecret returns the compressed public key of the shared point
  const sharedSecret = secp256k1.getSharedSecret(ephemeralPrivKey, holderPubKeyHex, true);
  const sharedX = sharedSecret.slice(1); // Skip the prefix byte (02 or 03), keep 32 bytes

  // HKDF-SHA256: IKM=sharedX, info="lemma-doc-encrypt", length=32
  const keyMaterial = hkdf(sha256, sharedX, undefined, "lemma-doc-encrypt", 32);

  // AES-256-GCM encryption (currently the only supported algorithm)
  const iv = randomBytes(12);
  const aesGcm = gcm(keyMaterial, iv);
  const ciphertext = aesGcm.encrypt(payloadBytes);

  // Wire format: ephemeralPubKey (33) || nonce (12) || ciphertext (variable)
  const encryptedDoc = concatBytes(ephemeralPubKey, iv, ciphertext);

  // docHash = SHA3-256(encryptedDoc)
  const docHash = `0x${bytesToHex(sha3_256(encryptedDoc))}`;

  // CIDv1-raw = b + base32lower(version||codec||sha256||digest)
  const cid = computeCidV1Raw(encryptedDoc);

  return Promise.resolve({
    docHash,
    cid,
    encryptedDocBase64: bytesToBase64(encryptedDoc),
    algorithm,
  });
};

export const decrypt = (input: DecryptInput): Promise<DecryptOutput> => {
  const encryptedDoc = base64ToBytes(input.encryptedDocBase64);

  // Determine algorithm (default to "aes-256-gcm" for backward compatibility)
  const algorithm = input.algorithm ?? "aes-256-gcm";

  // Currently only "aes-256-gcm" is supported
  if (algorithm !== "aes-256-gcm") {
    throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
  }

  // Parse wire format: first 33 bytes = ephemeralPubKey, next 12 = IV, rest = ciphertext
  /* eslint-disable-next-line functional/no-conditional-statements, functional/no-throw-statements --
   * Crypto boundary: input validation requires conditionals and error throwing */
  if (encryptedDoc.length < 45) {
    throw new Error("Encrypted document too short");
  }

  const ephemeralPubKey = encryptedDoc.slice(0, 33);
  const iv = encryptedDoc.slice(33, 45);
  const ciphertext = encryptedDoc.slice(45);

  // Validate ephemeral public key
  R.tryCatch(
    () => secp256k1.ProjectivePoint.fromHex(bytesToHex(ephemeralPubKey)),
    () => {
      throw new Error("Invalid ephemeral public key in encrypted document");
    },
  )();

  // Parse holder private key (remove 0x prefix if present)
  const holderPrivKeyBytes = R.pipe(
    (key: string) => (key.startsWith("0x") ? key.slice(2) : key),
    (hex: string) => Uint8Array.from(Buffer.from(hex, "hex")),
  )(input.holderPrivateKey);

  // ECDH: derive shared secret using ephemeral's public key and holder's private key
  const sharedSecret = secp256k1.getSharedSecret(holderPrivKeyBytes, ephemeralPubKey, true);
  const sharedX = sharedSecret.slice(1); // Skip the prefix byte, keep 32 bytes

  // HKDF-SHA256: same parameters as encrypt
  const keyMaterial = hkdf(sha256, sharedX, undefined, "lemma-doc-encrypt", 32);

  // AES-256-GCM decryption
  const aesGcm = gcm(keyMaterial, iv);
  const plaintext = aesGcm.decrypt(ciphertext);

  const payload = JSON.parse(Buffer.from(plaintext).toString("utf8"));

  return Promise.resolve({ payload });
};
