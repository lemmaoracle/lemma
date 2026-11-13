import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProofAlgId } from "@lemmaoracle/spec";
import { verify } from "./verifier.js";

const { groth16Verify, whirVerify } = vi.hoisted(() => ({
  groth16Verify: vi.fn(),
  whirVerify: vi.fn(),
}));

vi.mock("snarkjs", () => ({ groth16: { verify: groth16Verify } }));
vi.mock("./whir-runtime.js", () => ({
  whir: { prove: vi.fn(), verify: whirVerify },
}));

beforeEach(() => {
  groth16Verify.mockReset();
  whirVerify.mockReset();
});

describe("verify groth16", () => {
  it("returns ok true when groth16 verification succeeds", async () => {
    const vkey = { protocol: "groth16" };
    const proof = { pi_a: ["1", "2"] };
    groth16Verify.mockResolvedValue(true);

    const result = await verify({
      alg: "groth16-bn254-snarkjs",
      inputs: { vkey, proof, publicSignals: ["1", "2"] },
    });

    expect(result).toEqual({ ok: true });
    expect(groth16Verify).toHaveBeenCalledTimes(1);
    expect(groth16Verify).toHaveBeenCalledWith(vkey, ["1", "2"], proof);
  });

  it("returns ok false when groth16 verification fails", async () => {
    groth16Verify.mockResolvedValue(false);

    const result = await verify({
      alg: "groth16-bn254-snarkjs",
      inputs: { vkey: { protocol: "groth16" }, proof: {}, publicSignals: ["1"] },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).toHaveBeenCalledTimes(1);
  });

  it("returns ok false without verifying when vkey is null", async () => {
    groth16Verify.mockResolvedValue(true);

    const result = await verify({
      alg: "groth16-bn254-snarkjs",
      inputs: { vkey: null, proof: {}, publicSignals: ["1"] },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).not.toHaveBeenCalled();
  });

  it("returns ok false without verifying when publicSignals is not an array", async () => {
    groth16Verify.mockResolvedValue(true);

    const result = await verify({
      alg: "groth16-bn254-snarkjs",
      inputs: { vkey: { protocol: "groth16" }, proof: {}, publicSignals: "1" },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).not.toHaveBeenCalled();
  });
});

describe("verify whir", () => {
  it("returns ok true when whir verification succeeds", async () => {
    const wasm = new Uint8Array([1, 2, 3]);
    const params = new Uint8Array([4, 5]);
    const proof = new Uint8Array([6]);
    whirVerify.mockResolvedValue(true);

    const result = await verify({
      alg: "whir-koalabear-solwhir",
      inputs: { wasm, params, proof, publicInputs: ["1"] },
    });

    expect(result).toEqual({ ok: true });
    expect(whirVerify).toHaveBeenCalledTimes(1);
    expect(whirVerify).toHaveBeenCalledWith(wasm, params, ["1"], proof);
  });

  it("returns ok false when whir verification fails", async () => {
    whirVerify.mockResolvedValue(false);

    const result = await verify({
      alg: "whir-koalabear-solwhir",
      inputs: {
        wasm: new Uint8Array([1]),
        params: new Uint8Array([2]),
        proof: new Uint8Array([3]),
        publicInputs: ["1"],
      },
    });

    expect(result).toEqual({ ok: false });
    expect(whirVerify).toHaveBeenCalledTimes(1);
  });

  it("returns ok false without verifying when params is a plain array", async () => {
    whirVerify.mockResolvedValue(true);

    const result = await verify({
      alg: "whir-koalabear-solwhir",
      inputs: {
        wasm: new Uint8Array([1]),
        params: [4, 5],
        proof: new Uint8Array([6]),
        publicInputs: ["1"],
      },
    });

    expect(result).toEqual({ ok: false });
    expect(whirVerify).not.toHaveBeenCalled();
  });
});

describe("verify dispatch", () => {
  it("returns ok false for groth16 alg with whir-shaped inputs", async () => {
    groth16Verify.mockResolvedValue(true);
    whirVerify.mockResolvedValue(true);

    const result = await verify({
      alg: "groth16-bn254-snarkjs",
      inputs: {
        wasm: new Uint8Array([1]),
        params: new Uint8Array([2]),
        proof: new Uint8Array([3]),
        publicInputs: ["1"],
      },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).not.toHaveBeenCalled();
    expect(whirVerify).not.toHaveBeenCalled();
  });

  it("returns ok false for whir alg with groth16-shaped inputs", async () => {
    groth16Verify.mockResolvedValue(true);
    whirVerify.mockResolvedValue(true);

    const result = await verify({
      alg: "whir-koalabear-solwhir",
      inputs: { vkey: { protocol: "groth16" }, proof: {}, publicSignals: ["1"] },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).not.toHaveBeenCalled();
    expect(whirVerify).not.toHaveBeenCalled();
  });

  it("returns ok false for an unknown alg", async () => {
    groth16Verify.mockResolvedValue(true);
    whirVerify.mockResolvedValue(true);

    const result = await verify({
      alg: "unknown-alg" as unknown as ProofAlgId,
      inputs: { vkey: { protocol: "groth16" }, proof: {}, publicSignals: ["1"] },
    });

    expect(result).toEqual({ ok: false });
    expect(groth16Verify).not.toHaveBeenCalled();
    expect(whirVerify).not.toHaveBeenCalled();
  });
});
