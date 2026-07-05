/**
 * Tests for the byte → BN254 field-element normalizer.
 */
import { describe, it, expect } from "vitest";
import {
  bytesToFieldElements,
  fieldElementsToBytes,
  CHUNK_SIZE,
  BN254_PRIME,
} from "../src/normalizer.js";

const encoder = new TextEncoder();

describe("bytesToFieldElements", () => {
  it("converts empty input to a single padded chunk", () => {
    const result = bytesToFieldElements(new Uint8Array(0));
    expect(result).toHaveLength(1);
    // All bytes should be 0x1f (padLen=31)
    const expected = BigInt(
      "0x" + "1f".repeat(CHUNK_SIZE),
    );
    expect(result[0]).toBe(expected);
  });

  it("produces deterministic results for same input", () => {
    const data = encoder.encode("Hello, world!");
    const a = bytesToFieldElements(data);
    const b = bytesToFieldElements(data);
    expect(a).toEqual(b);
    expect(a).toHaveLength(1); // 13 bytes → 1 chunk + 18 padding bytes
  });

  it("produces different results for different input", () => {
    const a = bytesToFieldElements(encoder.encode("hello"));
    const b = bytesToFieldElements(encoder.encode("world"));
    expect(a).not.toEqual(b);
  });

  it("handles exactly one chunk (31 bytes)", () => {
    // 31 bytes of 'A' (0x41) → should get a full padding block (31 bytes of 0x1f)
    const data = new Uint8Array(CHUNK_SIZE);
    data.fill(0x41);
    const result = bytesToFieldElements(data);

    // 31 bytes exactly → padLen = 31 → adds full 31-byte padding block
    expect(result).toHaveLength(2);

    // First chunk: 31 × 0x41
    const firstChunk = BigInt("0x" + "41".repeat(CHUNK_SIZE));
    expect(result[0]).toBe(firstChunk);

    // Second chunk: 31 × 0x1f (PKCS7 full-block padding)
    const padChunk = BigInt("0x" + "1f".repeat(CHUNK_SIZE));
    expect(result[1]).toBe(padChunk);
  });

  it("handles multiple chunks (62 bytes → 3 chunks)", () => {
    // 62 bytes: 2 full chunks of data + 1 padding chunk
    const data = new Uint8Array(62);
    data.fill(0xaa);
    const result = bytesToFieldElements(data);

    // 62 % 31 = 0 → padLen = 31 → adds full padding block
    expect(result).toHaveLength(3);

    // All data chunks should be 31 × 0xaa
    const dataChunk = BigInt("0x" + "aa".repeat(CHUNK_SIZE));
    expect(result[0]).toBe(dataChunk);
    expect(result[1]).toBe(dataChunk);

    // Padding chunk
    const padChunk = BigInt("0x" + "1f".repeat(CHUNK_SIZE));
    expect(result[2]).toBe(padChunk);
  });

  it("handles partial final chunk (15 bytes → 2 chunks)", () => {
    // 15 bytes → padLen = 16 → 1 data chunk (31 bytes = 15 data + 16 padding)
    const data = new Uint8Array(15);
    data.fill(0x42);
    const result = bytesToFieldElements(data);
    expect(result).toHaveLength(1);
    // Should be < BN254_PRIME
    expect(result[0]).toBeLessThan(BN254_PRIME);
  });

  it("guarantees all elements are < BN254_PRIME", () => {
    // 31 bytes of 0xff = maximum possible chunk value
    const data = new Uint8Array(CHUNK_SIZE);
    data.fill(0xff);
    const result = bytesToFieldElements(data);
    for (const el of result) {
      expect(el).toBeLessThan(BN254_PRIME);
    }
  });
});

describe("fieldElementsToBytes", () => {
  it("round-trips: empty input", () => {
    const original = new Uint8Array(0);
    const elements = bytesToFieldElements(original);
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("round-trips: short string", () => {
    const original = encoder.encode("hello");
    const elements = bytesToFieldElements(original);
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("round-trips: exactly 31 bytes", () => {
    const original = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < CHUNK_SIZE; i++) original[i] = i;
    const elements = bytesToFieldElements(original);
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("round-trips: multi-chunk (100 bytes)", () => {
    const original = new Uint8Array(100);
    for (let i = 0; i < 100; i++) original[i] = (i * 7) % 256;
    const elements = bytesToFieldElements(original);
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("round-trips: binary data with all byte values", () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    const elements = bytesToFieldElements(original);
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("round-trips: large file (10KB)", () => {
    const original = new Uint8Array(10_000);
    for (let i = 0; i < original.length; i++) {
      original[i] = (i * 13 + 7) % 256;
    }
    const elements = bytesToFieldElements(original);
    expect(elements.length).toBe(Math.ceil((10_000 + (CHUNK_SIZE - (10_000 % CHUNK_SIZE))) / CHUNK_SIZE));
    const recovered = fieldElementsToBytes(elements);
    expect(recovered).toEqual(original);
  });

  it("rejects invalid padding", () => {
    // Create elements with bad padding
    const elements = bytesToFieldElements(encoder.encode("test"));
    // Corrupt the last element
    const corrupted = [...elements];
    corrupted[corrupted.length - 1] = BigInt(0);
    expect(() => fieldElementsToBytes(corrupted)).toThrow();
  });

  it("rejects elements >= BN254_PRIME", () => {
    expect(() => fieldElementsToBytes([BN254_PRIME])).toThrow();
  });
});

describe("deterministic encoding", () => {
  it("empty bytes always produce the same field elements", () => {
    const a = bytesToFieldElements(new Uint8Array(0));
    const b = bytesToFieldElements(new Uint8Array(0));
    expect(a).toEqual(b);
    // Specific expected value
    const padChunk = BigInt("0x" + "1f".repeat(CHUNK_SIZE));
    expect(a).toEqual([padChunk]);
  });

  it("padding is unique — different lengths produce different encodings", () => {
    // 30 'A' bytes vs 31 'A' bytes should have different final padding
    const data30 = new Uint8Array(30);
    data30.fill(0x41);
    const data31 = new Uint8Array(31);
    data31.fill(0x41);

    const elems30 = bytesToFieldElements(data30);
    const elems31 = bytesToFieldElements(data31);

    // 30 bytes: padLen=1 → single chunk, last byte = 0x01
    // 31 bytes: padLen=31 → two chunks, second is all 0x1f
    expect(elems30).not.toEqual(elems31);
  });

  it("trailing zeroes are preserved (not trimmed)", () => {
    const withZero = new Uint8Array([0x41, 0x00, 0x00]);
    const withoutZero = new Uint8Array([0x41]);

    expect(bytesToFieldElements(withZero)).not.toEqual(
      bytesToFieldElements(withoutZero),
    );
  });
});
