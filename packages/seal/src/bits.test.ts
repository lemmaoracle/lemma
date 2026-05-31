import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { secretToBits, hashBitsToHex, SEAL_SECRET_BITS } from "./bits.js";

/** SHA-256 digest of `value` as 256 bits, MSB-first per byte. */
const digestBits = (value: string): number[] =>
  [...createHash("sha256").update(value).digest()].flatMap((b) =>
    Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1),
  );

describe("secretToBits", () => {
  it("produces 512 bits for a 64-character secret", () => {
    expect(secretToBits("a".repeat(64))).toHaveLength(SEAL_SECRET_BITS);
  });

  it("decomposes bytes most-significant-bit first", () => {
    // 'A' = 0x41 = 0b01000001
    expect(secretToBits("A".repeat(64)).slice(0, 8)).toEqual([
      0, 1, 0, 0, 0, 0, 0, 1,
    ]);
  });

  it("rejects secrets that are not 64 bytes", () => {
    expect(() => secretToBits("too-short")).toThrow(/64 bytes/);
  });
});

describe("hashBitsToHex", () => {
  it("round-trips a SHA-256 digest through bit decomposition", () => {
    const secret = "0123456789abcdef".repeat(4);
    const expected = createHash("sha256").update(secret).digest("hex");
    expect(hashBitsToHex(digestBits(secret))).toBe(expected);
  });

  it("zero-pads short digests to 64 hex characters", () => {
    // A digest whose leading bits are zero must still render 64 chars.
    const bits = Array.from({ length: 256 }, (_, i) => (i < 16 ? 0 : 1));
    expect(hashBitsToHex(bits)).toHaveLength(64);
  });

  it("rejects bit arrays that are not length 256", () => {
    expect(() => hashBitsToHex([0, 1, 0])).toThrow(/256 bits/);
  });
});
