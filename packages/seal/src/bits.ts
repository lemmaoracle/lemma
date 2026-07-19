/**
 * Bit-level conversions between secret strings, circuit witness
 * signals, and SHA-256 hashes. Pure and dependency-free.
 */

import type { Bit } from "./types.js";

/** The seal circuit's fixed pre-image length: a 64-byte ASCII secret. */
export const SEAL_SECRET_BYTES = 64;

/** The seal circuit's pre-image bit length (512). */
export const SEAL_SECRET_BITS = SEAL_SECRET_BYTES * 8;

/**
 * Decompose a byte into 8 bits, most-significant-bit first — the bit
 * order circomlib's SHA-256 gadget expects.
 */
const byteToBits = (byte: number): ReadonlyArray<Bit> =>
  Array.from({ length: 8 }, (_, i): Bit => ((byte >> (7 - i)) & 1) as Bit);

/** Raise a validation error at the API boundary. */
// imperative: pre-condition validation — no functional alternative for call-site abort
/* eslint-disable functional/no-throw-statements */
const raise = (message: string): never => {
  throw new Error(message);
};
/* eslint-enable functional/no-throw-statements */

/**
 * Convert a raw secret string into the `keyBits` witness signal — the
 * UTF-8 bytes of the secret, MSB-first per byte.
 *
 * Throws if the secret is not exactly {@link SEAL_SECRET_BYTES} ASCII bytes,
 * since the circuit's pre-image length is fixed.
 */
export const secretToBits = (secret: string): ReadonlyArray<Bit> => {
  const bytes = new TextEncoder().encode(secret);
  return bytes.length === SEAL_SECRET_BYTES
    ? [...bytes].flatMap(byteToBits)
    : raise(
        `seal: secret must be ${String(SEAL_SECRET_BYTES)} bytes, got ${String(bytes.length)}`,
      );
};

/**
 * Reassemble the circuit's 256-bit `keyHash` public output into the
 * lowercase hex `key_hash` string stored in the `api_keys` table.
 */
export const hashBitsToHex = (
  bits: ReadonlyArray<string | number>,
): string =>
  bits.length === 256
    ? BigInt(`0b${bits.map(String).join("")}`).toString(16).padStart(64, "0")
    : raise(`seal: keyHash must be 256 bits, got ${String(bits.length)}`);
