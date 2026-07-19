/**
 * Byte → BN254 field-element normalizer for content-commitment-v1.
 *
 * Converts arbitrary binary data into an array of field elements
 * suitable for Poseidon hashing, using 31-byte big-endian chunks
 * with PKCS7 padding.
 *
 * This is the canonical normalizer — both publisher and verifier
 * MUST use exactly this function to ensure deterministic hashing.
 *
 * ## Design
 *
 * - CHUNK_SIZE = 31 bytes (248 bits) < BN254 field prime (254 bits)
 *   This guarantees each chunk fits in the field without modular reduction.
 *
 * - PKCS7 padding: if N bytes of padding are needed (1 ≤ N ≤ 31),
 *   each pad byte has value N. This ensures unique encoding.
 *
 * - Special case: when data.length % 31 === 0, a full block of 31
 *   padding bytes (0x1f) is appended. This follows standard PKCS7.
 *
 * - Empty files (0 bytes) produce a single chunk of 31 × 0x1f.
 */

/** BN254 field prime (alt_bn128 curve order). */
export const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

/** Chunk size in bytes: 31 bytes = 248 bits < 254-bit field prime. */
export const CHUNK_SIZE = 31;

/**
 * Convert raw bytes to an array of BN254 field elements.
 *
 * Uses 31-byte big-endian chunks with PKCS7 padding.
 * Each returned bigint is guaranteed to be < BN254_PRIME.
 */
export function bytesToFieldElements(data: Uint8Array): bigint[] {
  const len = data.length;
  const padLen = CHUNK_SIZE - (len % CHUNK_SIZE);
  const paddedLen = len + padLen;

  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  // PKCS7 padding
  for (let i = len; i < paddedLen; i++) {
    padded[i] = padLen;
  }

  const numChunks = paddedLen / CHUNK_SIZE;
  const elements: bigint[] = new Array(numChunks);

  for (let i = 0; i < numChunks; i++) {
    const offset = i * CHUNK_SIZE;
    let val = 0n;
    for (let j = 0; j < CHUNK_SIZE; j++) {
      const byte = padded[offset + j];
      if (byte === undefined) throw new Error("unreachable: padded index out of bounds");
      val = (val << 8n) | BigInt(byte);
    }
    elements[i] = val;
  }

  return elements;
}

/**
 * Extract a bigint into CHUNK_SIZE bytes (big-endian) into a Uint8Array
 * at the given offset. Throws if the value is too large.
 */
// imperative: byte-level buffer mutation — no functional alternative for Uint8Array writes
function writeBigEndian(
  value: bigint,
  buf: Uint8Array,
  offset: number,
): void {
  let val = value;
  for (let j = CHUNK_SIZE - 1; j >= 0; j--) {
    buf[offset + j] = Number(val & 0xffn);
    val >>= 8n;
  }
  return val !== 0n
    ? void raise(
        `Field element overflows ${String(CHUNK_SIZE)} bytes at offset ${String(offset)}`,
      )
    : undefined;
}

/** Raise a validation error — used at API boundaries. */
// imperative: pre-condition validation — no functional alternative for call-site abort
/* eslint-disable functional/no-throw-statements */
function raise(message: string): never {
  throw new Error(message);
}
/* eslint-enable functional/no-throw-statements */

/**
 * Convert field elements back to original bytes.
 * Verifies and strips PKCS7 padding.
 *
 * @throws If padding is invalid or any field element overflows CHUNK_SIZE bytes.
 */
export function fieldElementsToBytes(elements: readonly bigint[]): Uint8Array {
  const chunkCount = elements.length;
  const paddedLen = chunkCount * CHUNK_SIZE;
  const padded = new Uint8Array(paddedLen);

  for (let i = 0; i < chunkCount; i++) {
    const element = elements[i];
    if (element === undefined) {
      throw new Error(`Missing element at index ${i}`);
    }
    if (element >= BN254_PRIME) {
      throw new Error(`Field element at index ${i} exceeds BN254 prime`);
    }
    writeBigEndian(element, padded, i * CHUNK_SIZE);
  }

  // Verify PKCS7 padding
  const padLen = padded[paddedLen - 1];
  if (padLen === undefined || padLen < 1 || padLen > CHUNK_SIZE) {
    throw new Error(`Invalid PKCS7 padding length: ${padLen}`);
  }
  for (let i = paddedLen - padLen; i < paddedLen; i++) {
    const byte = padded[i];
    if (byte === undefined) throw new Error("unreachable: padded index out of bounds");
    if (byte !== padLen) {
      throw new Error("Invalid PKCS7 padding bytes");
    }
  }

  return padded.slice(0, paddedLen - padLen);
}

/**
 * Reduce an array of field elements to a single field element
 * using iterative Poseidon(2) hashing:
 *
 *   acc = elements[0]
 *   for i = 1..n-1: acc = Poseidon2(acc, elements[i])
 *
 * This is the canonical reduction for content-commitment-v1.
 * It is chosen over fixed-arity Poseidon(N) because file sizes
 * vary widely and circomlib only provides Poseidon up to arity 16.
 *
 * The circuit itself is an identity check (commitment === fileHash) —
 * this reduction happens off-circuit in the SDK/normalizer.
 */
export const reduceElements = (
  elements: readonly bigint[],
  poseidon2: (inputs: [bigint, bigint]) => bigint,
): bigint => {
  const first = elements[0];
  return first === undefined || elements.length === 0
    ? 0n
    : elements.slice(1).reduce(
        (acc: bigint, elem: bigint): bigint => poseidon2([acc, elem]),
        first,
      );
};

/**
 * Compute the fileHash for content-commitment-v1.
 *
 * Canonical flow: bytes → fieldElements → reduceElements(fieldElements, poseidon2).
 *
 * Uses iterative Poseidon(2) reduction so any file size works.
 * This is the PRIVATE input to the circuit (fileHash).
 *
 * @param data - Raw file bytes
 * @param poseidon2 - Poseidon(2) hash function from poseidon-lite
 */
export function poseidonFileHash(
  data: Uint8Array,
  poseidon2: (inputs: [bigint, bigint]) => bigint,
): bigint {
  const elements = bytesToFieldElements(data);
  return reduceElements(elements, poseidon2);
}

/**
 * Compute the PUBLIC commitment for content-commitment-v1.
 *
 * The circuit does: commitment === Poseidon1(fileHash).
 * This function mirrors that: poseidonFileHash(bytes) → poseidon1(result).
 *
 * @param data - Raw file bytes
 * @param poseidon1 - Poseidon(1) hash function from poseidon-lite
 * @param poseidon2 - Poseidon(2) hash function from poseidon-lite
 */
export function contentCommitment(
  data: Uint8Array,
  poseidon1: (inputs: [bigint]) => bigint,
  poseidon2: (inputs: [bigint, bigint]) => bigint,
): bigint {
  return poseidon1([poseidonFileHash(data, poseidon2)]);
}
