/**
 * Bit-level conversions between API key strings, circuit witness
 * signals, and SHA-256 hashes. Pure and dependency-free.
 */

import type { Bit } from "./types.js";

/** The seal circuit's fixed pre-image length: a 64-byte ASCII API key. */
export const SEAL_KEY_BYTES = 64;

/** The seal circuit's pre-image bit length (512). */
export const SEAL_KEY_BITS = SEAL_KEY_BYTES * 8;

/**
 * Decompose a byte into 8 bits, most-significant-bit first — the bit
 * order circomlib's SHA-256 gadget expects.
 */
const byteToBits = (byte: number): ReadonlyArray<Bit> =>
  Array.from({ length: 8 }, (_, i): Bit => ((byte >> (7 - i)) & 1) as Bit);

/**
 * Convert a raw API key string into the `keyBits` witness signal — the
 * UTF-8 bytes of the key, MSB-first per byte.
 *
 * Throws if the key is not exactly {@link SEAL_KEY_BYTES} ASCII bytes,
 * since the circuit's pre-image length is fixed.
 */
export const apiKeyToBits = (apiKey: string): ReadonlyArray<Bit> => {
  const bytes = new TextEncoder().encode(apiKey);
  return bytes.length === SEAL_KEY_BYTES
    ? [...bytes].flatMap(byteToBits)
    : (() => {
        throw new Error(
          `seal: API key must be ${SEAL_KEY_BYTES} bytes, got ${bytes.length}`,
        );
      })();
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
    : (() => {
        throw new Error(`seal: keyHash must be 256 bits, got ${bits.length}`);
      })();
