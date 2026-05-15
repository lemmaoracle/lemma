import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = path.resolve(__dirname, "../build");
const WASM = path.join(BUILD_DIR, "seal-identity_js", "seal-identity.wasm");

// These tests exercise the compiled circuit. They are skipped unless the
// circuit has been built (`npm run build`), so `npm test` stays green on
// machines without the circom toolchain.
const circuitBuilt = fs.existsSync(WASM);

// 64-char ASCII API key -> 512 input bits, MSB-first per byte.
const apiKeyToBits = (apiKey: string): number[] =>
  [...new TextEncoder().encode(apiKey)].flatMap((byte) =>
    Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1),
  );

const calculateWitness = async (
  input: Record<string, unknown>,
): Promise<string[]> => {
  const { wtns } = await import("snarkjs");
  const wtnsPath = path.join(BUILD_DIR, "test-witness.wtns");
  await wtns.calculate(input, WASM, wtnsPath);
  const json = await wtns.exportJson(wtnsPath);
  fs.unlinkSync(wtnsPath);
  return json.map((v: bigint) => v.toString());
};

describe.skipIf(!circuitBuilt)("seal-identity circuit", () => {
  const apiKey = "0123456789abcdef".repeat(4); // 64-char hex API key
  const keyBits = apiKeyToBits(apiKey);
  const expectedHash = createHash("sha256").update(apiKey).digest("hex");

  it("computes SHA-256 of the API key pre-image", async () => {
    const witness = await calculateWitness({ keyBits, nonce: "12345" });
    // Witness layout: [1, keyHash[0..255], nonce, ...private/internal].
    const hashBits = witness.slice(1, 257);
    const hex = BigInt(`0b${hashBits.join("")}`).toString(16).padStart(64, "0");
    expect(hex).toBe(expectedHash);
  }, 60000);

  it("rejects a witness whose keyBits are not boolean", async () => {
    const tampered = [...keyBits];
    tampered[0] = 2;
    await expect(
      calculateWitness({ keyBits: tampered, nonce: "1" }),
    ).rejects.toThrow();
  }, 60000);
});

describe.runIf(!circuitBuilt)("seal-identity circuit (not built)", () => {
  it("is skipped until the circuit is compiled", () => {
    expect(circuitBuilt).toBe(false);
  });
});
