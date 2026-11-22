import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, proveMock, verifyMock } = vi.hoisted(() => ({
  createMock: vi.fn(() => ({})),
  proveMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock("@lemmaoracle/sdk", () => ({
  create: createMock,
  prover: { prove: proveMock },
  verifier: { verify: verifyMock },
}));

import { prove, verify, SEAL_CIRCUIT_ID } from "./proof.js";
import vkey from "./vkey.js";
import type { SealProof } from "./types.js";

const SECRET = "0".repeat(64);
const NONCE = "12345678901234567890";

const PROOF_OBJECT = {
  pi_a: ["1", "2", "1"],
  pi_b: [
    ["3", "4"],
    ["5", "6"],
    ["1", "0"],
  ],
  pi_c: ["7", "8", "1"],
  protocol: "groth16",
  curve: "bn254",
};

const proofBase64 = (): string => btoa(JSON.stringify(PROOF_OBJECT));

type ProveSecondArg = {
  circuitId: string;
  witness: { keyBits: ReadonlyArray<number>; nonce: string };
};

type VerifyArg = {
  alg: string;
  inputs: { vkey: unknown; proof: unknown; publicSignals: unknown };
};

const secondArg = (): ProveSecondArg =>
  proveMock.mock.calls[0][1] as ProveSecondArg;

const verifyArg = (): VerifyArg => verifyMock.mock.calls[0][0] as VerifyArg;

const sealProofFixture = (): SealProof =>
  ({
    proof: PROOF_OBJECT,
    publicSignals: ["111", "222"],
    nullifier: "111",
  }) as unknown as SealProof;

beforeEach(() => {
  createMock.mockClear();
  createMock.mockReturnValue({});
  proveMock.mockReset();
  verifyMock.mockReset();
});

describe("prove", () => {
  it("calls create exactly once with an empty config", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    await prove({ secret: SECRET, nonce: NONCE });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({});
  });

  it("passes the created client as the first argument to prover.prove", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    await prove({ secret: SECRET, nonce: NONCE });

    expect(proveMock).toHaveBeenCalledTimes(1);
    const client = createMock.mock.results[0]?.value as Record<string, never>;
    expect(proveMock.mock.calls[0]?.[0]).toBe(client);
  });

  it("pins the seal circuit id literal", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    await prove({ secret: SECRET, nonce: NONCE });

    expect(SEAL_CIRCUIT_ID).toBe("seal-identity-v2.2");
    expect(secondArg().circuitId).toBe("seal-identity-v2.2");
  });

  it("builds keyBits MSB-first with length 512", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    await prove({ secret: SECRET, nonce: NONCE });

    const { keyBits } = secondArg().witness;
    expect(keyBits).toHaveLength(512);
    expect([...keyBits].slice(0, 16)).toEqual([
      0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
    ]);
  });

  it("passes the nonce through unchanged into the witness", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    await prove({ secret: SECRET, nonce: NONCE });

    expect(secondArg().witness.nonce).toBe(NONCE);
  });

  it("returns the decoded proof, public signals, and nullifier", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: ["111", "222"] });

    const result = await prove({ secret: SECRET, nonce: NONCE });

    expect(result.proof).toEqual(PROOF_OBJECT);
    expect(result.publicSignals).toEqual(["111", "222"]);
    expect(result.nullifier).toBe("111");
  });

  it("falls back to an empty nullifier when public signals are empty", async () => {
    proveMock.mockResolvedValue({ proof: proofBase64(), inputs: [] });

    const result = await prove({ secret: SECRET, nonce: NONCE });

    expect(result.publicSignals).toEqual([]);
    expect(result.nullifier).toBe("");
  });

  it("propagates prover.prove rejections unchanged", async () => {
    const failure = new Error("prover boom");
    proveMock.mockRejectedValue(failure);

    await expect(prove({ secret: SECRET, nonce: NONCE })).rejects.toBe(failure);
  });
});

describe("verify", () => {
  it("verifies with groth16 alg and the bundled vkey object", async () => {
    verifyMock.mockResolvedValue({ ok: true });

    await verify(sealProofFixture());

    expect(verifyMock).toHaveBeenCalledTimes(1);
    expect(verifyArg().alg).toBe("groth16-bn254-snarkjs");
    expect(verifyArg().inputs.vkey).toBe(vkey);
  });

  it("forwards the exact proof and public signals to the verifier", async () => {
    verifyMock.mockResolvedValue({ ok: true });
    const fixture = sealProofFixture();

    await verify(fixture);

    expect(verifyArg().inputs.proof).toBe(fixture.proof);
    expect(verifyArg().inputs.publicSignals).toBe(fixture.publicSignals);
    expect(verifyArg().inputs.publicSignals).toEqual(["111", "222"]);
  });

  it("resolves nullifier and nonce from public signals on ok", async () => {
    verifyMock.mockResolvedValue({ ok: true });

    const result = await verify(sealProofFixture());

    expect(result).toEqual({ nullifier: "111", nonce: "222" });
  });

  it("resolves null when verification fails", async () => {
    verifyMock.mockResolvedValue({ ok: false });

    const result = await verify(sealProofFixture());

    expect(result).toBeNull();
  });

  it("falls back to empty strings when public signals are empty", async () => {
    verifyMock.mockResolvedValue({ ok: true });
    const fixture = {
      proof: PROOF_OBJECT,
      publicSignals: [],
      nullifier: "",
    } as unknown as SealProof;

    const result = await verify(fixture);

    expect(result).toEqual({ nullifier: "", nonce: "" });
  });

  it("does not touch the proving path", async () => {
    verifyMock.mockResolvedValue({ ok: true });

    await verify(sealProofFixture());

    expect(createMock).not.toHaveBeenCalled();
    expect(proveMock).not.toHaveBeenCalled();
  });

  it("propagates verifier.verify rejections unchanged", async () => {
    const failure = new Error("verifier boom");
    verifyMock.mockRejectedValue(failure);

    await expect(verify(sealProofFixture())).rejects.toBe(failure);
  });
});
