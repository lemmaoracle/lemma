import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EnhancedRequest } from "../../types/http.js";

const verifyMock = vi.hoisted(() => vi.fn());
vi.mock("@lemmaoracle/sdk", () => ({ verifier: { verify: verifyMock } }));

const { verifyHandler } = await import("./verify.js");

const makeRequest = (overrides: Partial<EnhancedRequest>): EnhancedRequest => ({
  req: {} as EnhancedRequest["req"],
  method: "POST",
  url: "/verifier/verify",
  headers: {},
  ...overrides,
});

const invalidRequestBody = {
  error: "Bad request",
  expected: {
    input: {
      alg: "ProofAlgId",
      inputs: "Record<string, unknown>",
    },
  },
};

describe("verifyHandler", () => {
  beforeEach(() => {
    verifyMock.mockReset();
  });

  it("returns 405 for non-POST methods without calling verifier", async () => {
    const result = await verifyHandler(makeRequest({ method: "GET" }));
    expect(result).toEqual({
      status: 405,
      headers: { Allow: "POST" },
      body: { error: "Method not allowed" },
    });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns 400 when body is undefined", async () => {
    const result = await verifyHandler(makeRequest({ body: undefined }));
    expect(result).toEqual({ status: 400, body: invalidRequestBody });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns 400 when body has no input key", async () => {
    const result = await verifyHandler(makeRequest({ body: {} }));
    expect(result).toEqual({ status: 400, body: invalidRequestBody });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns 400 when input is null", async () => {
    const result = await verifyHandler(makeRequest({ body: { input: null } }));
    expect(result).toEqual({ status: 400, body: invalidRequestBody });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns 400 when input is missing inputs", async () => {
    const result = await verifyHandler(
      makeRequest({ body: { input: { alg: "groth16-bn254-snarkjs" } } }),
    );
    expect(result).toEqual({ status: 400, body: invalidRequestBody });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns 400 when input is missing alg", async () => {
    const result = await verifyHandler(
      makeRequest({ body: { input: { inputs: {} } } }),
    );
    expect(result).toEqual({ status: 400, body: invalidRequestBody });
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("forwards body.input to verifier.verify and returns its result", async () => {
    verifyMock.mockResolvedValue({ ok: true });
    const input = { alg: "groth16-bn254-snarkjs", inputs: { a: "1" } };
    const result = await verifyHandler(makeRequest({ body: { input } }));
    expect(result).toEqual({ status: 200, body: { ok: true } });
    expect(verifyMock).toHaveBeenCalledTimes(1);
    expect(verifyMock).toHaveBeenCalledWith({
      alg: "groth16-bn254-snarkjs",
      inputs: { a: "1" },
    });
  });

  it("returns 502 with the Error message when verification rejects", async () => {
    verifyMock.mockRejectedValue(new Error("pairing check failed"));
    const result = await verifyHandler(
      makeRequest({
        body: { input: { alg: "groth16-bn254-snarkjs", inputs: { a: "1" } } },
      }),
    );
    expect(result).toEqual({
      status: 502,
      body: { error: "Verification failed", message: "pairing check failed" },
    });
  });

  it("returns 502 with String(err) for non-Error rejections", async () => {
    verifyMock.mockRejectedValue("boom");
    const result = await verifyHandler(
      makeRequest({
        body: { input: { alg: "groth16-bn254-snarkjs", inputs: { a: "1" } } },
      }),
    );
    expect(result).toEqual({
      status: 502,
      body: { error: "Verification failed", message: "boom" },
    });
  });
});
