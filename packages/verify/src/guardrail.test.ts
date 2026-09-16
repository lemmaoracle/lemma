import { describe, expect, it, vi } from "vitest";
import { guardrail } from "./guardrail.js";
import type { CircuitResolver, Verifier } from "./types.js";

const okResolver: CircuitResolver = async (circuitId) => ({
  alg: "groth16-bn254-snarkjs",
  vkey: { fake: "vkey" },
});

const okVerify: Verifier = async () => ({ ok: true });
const failVerify: Verifier = async () => ({ ok: false });

describe("guardrail", () => {
  it("returns {ok:true} when verification passes", async () => {
    const result = await guardrail(
      { circuitId: "c1", proof: { p: 1 }, publicSignals: ["0x1"] },
      { resolveCircuit: okResolver, verify: okVerify },
    );
    expect(result).toEqual({ ok: true });
  });

  it("returns {ok:false, reason} when verification fails and throw is unset", async () => {
    const result = await guardrail(
      { circuitId: "c1", proof: {}, publicSignals: ["0x1"] },
      { resolveCircuit: okResolver, verify: failVerify },
    );
    expect(result.ok).toBe(false);
    expect("reason" in result && result.reason).toContain("c1");
  });

  it("rejects with a GuardrailError when throw:true and verification fails", async () => {
    await expect(
      guardrail(
        { circuitId: "c1", proof: {}, publicSignals: ["0x1"] },
        { resolveCircuit: okResolver, verify: failVerify, throw: true },
      ),
    ).rejects.toMatchObject({ name: "GuardrailError", circuitId: "c1" });
  });

  it("calls resolveCircuit with the circuitId", async () => {
    const spy = vi
      .fn<CircuitResolver>()
      .mockResolvedValue({ alg: "groth16-bn254-snarkjs", vkey: {} });
    await guardrail(
      { circuitId: "abc", proof: {}, publicSignals: [] },
      { resolveCircuit: spy, verify: okVerify },
    );
    expect(spy).toHaveBeenCalledWith("abc");
  });

  it("decodes a base64-encoded wire-format proof before verifying", async () => {
    const captured: { proof?: unknown } = {};
    const spyVerify: Verifier = async (input) => {
      captured.proof = (input.inputs as { proof?: unknown }).proof;
      return { ok: true };
    };
    const b64 = btoa(JSON.stringify({ pi_a: ["1", "2"], protocol: "groth16" }));

    await guardrail(
      { circuitId: "c1", proof: b64, publicSignals: ["0x1"] },
      { resolveCircuit: okResolver, verify: spyVerify },
    );

    expect(captured.proof).toEqual({ pi_a: ["1", "2"], protocol: "groth16" });
  });

  it("passes an already-decoded object proof through unchanged", async () => {
    const captured: { proof?: unknown } = {};
    const spyVerify: Verifier = async (input) => {
      captured.proof = (input.inputs as { proof?: unknown }).proof;
      return { ok: true };
    };

    await guardrail(
      { circuitId: "c1", proof: { pi_a: ["1", "2"] }, publicSignals: [] },
      { resolveCircuit: okResolver, verify: spyVerify },
    );

    expect(captured.proof).toEqual({ pi_a: ["1", "2"] });
  });

  it("returns {ok:false} when the verifier rejects (e.g. malformed proof)", async () => {
    const throwingVerify: Verifier = async () => {
      throw new Error("groth16 verify failed");
    };

    const result = await guardrail(
      { circuitId: "c1", proof: "not-valid-base64", publicSignals: ["0x1"] },
      { resolveCircuit: okResolver, verify: throwingVerify },
    );

    expect(result.ok).toBe(false);
  });
});
