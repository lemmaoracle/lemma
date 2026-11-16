import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage } from "node:http";
import type { EnhancedRequest, HttpMethod } from "../../types/http.js";

const sdk = vi.hoisted(() => ({
  create: vi.fn(),
  prove: vi.fn(),
}));
vi.mock("@lemmaoracle/sdk", () => ({
  create: sdk.create,
  prover: { prove: sdk.prove },
}));

const { proveHandler } = await import("./prove.js");

const makeRequest = (
  method: HttpMethod,
  body?: unknown,
  params?: Readonly<Record<string, string>>,
): EnhancedRequest => ({
  req: {} as IncomingMessage,
  method,
  url: "/prover/prove",
  headers: {},
  body,
  params,
});

const invalidRequestBody = {
  error: "Bad request",
  expected: {
    apiBase: "string",
    apiKey: "string (optional)",
    input: { circuitId: "string", witness: "Record<string, unknown>" },
    mode: '"sync" (default) | "async"',
  },
};

const expectNoSdkCalls = (): void => {
  expect(sdk.create).not.toHaveBeenCalled();
  expect(sdk.prove).not.toHaveBeenCalled();
};

describe("proveHandler", () => {
  beforeEach(() => {
    sdk.create.mockReset();
    sdk.prove.mockReset();
  });

  describe("method validation", () => {
    it("returns 405 for methods other than POST or GET without calling the SDK", async () => {
      // proveHandler dispatches on method: POST validates the body and
      // proves, GET polls a job id, anything else is 405 with
      // `Allow: "POST, GET"`.
      const response = await proveHandler(
        makeRequest("PUT", {
          apiBase: "https://api.example",
          input: { circuitId: "c-1", witness: {} },
        }),
      );

      expect(response).toEqual({
        status: 405,
        headers: { Allow: "POST, GET" },
        body: { error: "Method not allowed" },
      });
      expectNoSdkCalls();
    });

    it("returns 404 for GET without a known job id without calling the SDK", async () => {
      const response = await proveHandler(makeRequest("GET"));

      expect(response).toEqual({
        status: 404,
        body: { error: "Job not found" },
      });
      expectNoSdkCalls();
    });
  });

  describe("request body validation", () => {
    it("returns 400 when the body is undefined without calling the SDK", async () => {
      const response = await proveHandler(makeRequest("POST", undefined));

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when the body is null without calling the SDK", async () => {
      const response = await proveHandler(makeRequest("POST", null));

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when apiBase is missing without calling the SDK", async () => {
      const response = await proveHandler(makeRequest("POST", {}));

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when input is missing without calling the SDK", async () => {
      const response = await proveHandler(
        makeRequest("POST", { apiBase: "https://api.example" }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when circuitId is missing without calling the SDK", async () => {
      const response = await proveHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          input: {},
        }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when witness is missing without calling the SDK", async () => {
      const response = await proveHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          input: { circuitId: "c-1" },
        }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });
  });
});
