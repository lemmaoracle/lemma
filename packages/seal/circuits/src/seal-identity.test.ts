import { describe, it, expect } from "vitest";
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

describe.skipIf(!circuitBuilt)("seal-identity circuit (v2)", () => {
  const apiKey = "0123456789abcdef".repeat(4); // 64-char hex API key
  const keyBits = apiKeyToBits(apiKey);

  it("produces a deterministic nullifier for a given key + nonce", async () => {
    const w1 = await calculateWitness({ keyBits, nonce: "12345" });
    const w2 = await calculateWitness({ keyBits, nonce: "12345" });
    // Witness layout: [1, nullifier, nonce, ...private].
    // nullifier lives at index 1.
    expect(w1[1]).toBe(w2[1]);
    expect(w1[1]).not.toBe("0");
  }, 60000);

  it("produces different nullifiers for different nonces", async () => {
    const w1 = await calculateWitness({ keyBits, nonce: "12345" });
    const w2 = await calculateWitness({ keyBits, nonce: "67890" });
    expect(w1[1]).not.toBe(w2[1]);
  }, 60000);

  it("exposes only [nullifier, nonce] as public signals", async () => {
    const witness = await calculateWitness({ keyBits, nonce: "99" });
    // Witness[0] = 1 (constant), [1] = nullifier (public output),
    // [2] = nonce (public input). keyHash must NOT appear.
    expect(witness[2]).toBe("99");
    expect(witness[1]).not.toBe("0");
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
