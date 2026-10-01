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
 *
 * The conversion is expressed functionally: immutable byte arrays are
 * built with spread / `Array.from`, chunked with `slice`, and folded
 * with `reduce` — no loops, no `let`, no in-place writes. The single
 * imperative boundary is the `raise` helper: sync API validation must
 * abort the call site, and its `eslint-disable` is narrowly scoped to
 * that one helper (same convention as `packages/seal/src/bits.ts` and
 * `packages/sdk/src/crypto.ts`).
 */

/** BN254 field prime (alt_bn128 curve order). */
export const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

/** Chunk size in bytes: 31 bytes = 248 bits < 254-bit field prime. */
export const CHUNK_SIZE = 31;

/** Raise a validation error — used at API boundaries. */
// imperative: pre-condition validation — no functional alternative for call-site abort
/* eslint-disable functional/no-throw-statements */
const raise = (message: string): never => {
  throw new Error(message);
};
/* eslint-enable functional/no-throw-statements */

/**
 * Abort (raise) when `condition` holds, otherwise fall through.
 *
 * Expressed as a conditional *expression* rather than an `if` statement so
 * the validation guards in this module stay free of imperative flow.
 */
const raiseWhen = (condition: boolean, message: string): void => {
  const _aborted = condition ? void raise(message) : undefined;
};

/**
 * Convert raw bytes to an array of BN254 field elements.
 *
 * Uses 31-byte big-endian chunks with PKCS7 padding.
 * Each returned bigint is guaranteed to be < BN254_PRIME.
 */
export const bytesToFieldElements = (data: Uint8Array): bigint[] => {
  const len = data.length;
  const padLen = CHUNK_SIZE - (len % CHUNK_SIZE);
  const padBytes: ReadonlyArray<number> = Array.from(
    { length: padLen },
    (_byte: unknown): number => padLen,
  );
  const padded: ReadonlyArray<number> = [...data, ...padBytes];
  const numChunks = padded.length / CHUNK_SIZE;

  return Array.from({ length: numChunks }, (_chunk: unknown, i: number): bigint => {
    const offset = i * CHUNK_SIZE;
    return padded
      .slice(offset, offset + CHUNK_SIZE)
      .reduce(
        (acc: bigint, byte: number): bigint => (acc << 8n) | BigInt(byte),
        0n,
      );
  });
};

/**
 * Convert field elements back to original bytes.
 * Verifies and strips PKCS7 padding.
 *
 * @throws If padding is invalid or any field element overflows CHUNK_SIZE bytes.
 */
export const fieldElementsToBytes = (elements: readonly bigint[]): Uint8Array => {
  const chunkCount = elements.length;
  const paddedLen = chunkCount * CHUNK_SIZE;

  const bytes: ReadonlyArray<number> = elements.flatMap(
    (element: bigint, i: number): ReadonlyArray<number> => {
      raiseWhen(
        element >= BN254_PRIME,
        `Field element at index ${String(i)} exceeds BN254 prime`,
      );
      // Mirrors the original byte-by-byte shift loop: after extracting
      // CHUNK_SIZE bytes the remaining value must be zero.
      raiseWhen(
        element >> BigInt(8 * CHUNK_SIZE) !== 0n,
        `Field element overflows ${String(CHUNK_SIZE)} bytes at offset ${String(i * CHUNK_SIZE)}`,
      );
      return Array.from(
        { length: CHUNK_SIZE },
        (_byte: unknown, j: number): number =>
          Number((element >> BigInt(8 * (CHUNK_SIZE - 1 - j))) & 0xffn),
      );
    },
  );

  // Verify PKCS7 padding
  const lastByteIndex = paddedLen - 1;
  const padLen =
    bytes[lastByteIndex] ??
    raise(`Invalid PKCS7 padding length: ${String(bytes[lastByteIndex])}`);
  raiseWhen(
    padLen < 1 || padLen > CHUNK_SIZE,
    `Invalid PKCS7 padding length: ${String(padLen)}`,
  );
  const allPadBytes = bytes.slice(paddedLen - padLen);
  const _paddingVerified = allPadBytes.every(
    (byte: number): boolean => byte === padLen,
  )
    ? undefined
    : raise("Invalid PKCS7 padding bytes");

  return Uint8Array.from(bytes.slice(0, paddedLen - padLen));
};

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
export const poseidonFileHash = (
  data: Uint8Array,
  poseidon2: (inputs: [bigint, bigint]) => bigint,
): bigint => {
  const elements = bytesToFieldElements(data);
  return reduceElements(elements, poseidon2);
};

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
export const contentCommitment = (
  data: Uint8Array,
  poseidon1: (inputs: [bigint]) => bigint,
  poseidon2: (inputs: [bigint, bigint]) => bigint,
): bigint => poseidon1([poseidonFileHash(data, poseidon2)]);
