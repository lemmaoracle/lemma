import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage } from "node:http";
import type { EnhancedRequest, HttpMethod } from "../../types/http.js";

const sdk = vi.hoisted(() => ({
  create: vi.fn(),
  getById: vi.fn(),
  define: vi.fn(),
  prepare: vi.fn(),
}));
vi.mock("@lemmaoracle/sdk", () => ({
  create: sdk.create,
  schemas: { getById: sdk.getById },
  define: sdk.define,
  prepare: sdk.prepare,
}));

const { prepareHandler } = await import("./prepare.js");

const makeRequest = (method: HttpMethod, body?: unknown): EnhancedRequest => ({
  req: {} as IncomingMessage,
  method,
  url: "/prepare",
  headers: {},
  body,
});

const invalidRequestBody = {
  error: "Bad request",
  expected: {
    apiBase: "string",
    apiKey: "string (optional)",
    input: { schemaId: "string", payload: "unknown" },
  },
};

const expectNoSdkCalls = (): void => {
  expect(sdk.create).not.toHaveBeenCalled();
  expect(sdk.getById).not.toHaveBeenCalled();
  expect(sdk.define).not.toHaveBeenCalled();
  expect(sdk.prepare).not.toHaveBeenCalled();
};

describe("prepareHandler", () => {
  beforeEach(() => {
    sdk.create.mockReset();
    sdk.getById.mockReset();
    sdk.define.mockReset();
    sdk.prepare.mockReset();
  });

  describe("method validation", () => {
    it("returns 405 for non-POST requests without calling the SDK", async () => {
      const response = await prepareHandler(
        makeRequest("GET", {
          apiBase: "https://api.example",
          input: { schemaId: "sch-1", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({
        status: 405,
        headers: { Allow: "POST" },
        body: { error: "Method not allowed" },
      });
      expectNoSdkCalls();
    });
  });

  describe("request body validation", () => {
    it("returns 400 when the body is undefined without calling the SDK", async () => {
      const response = await prepareHandler(makeRequest("POST", undefined));

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when the body is null without calling the SDK", async () => {
      const response = await prepareHandler(makeRequest("POST", null));

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when apiBase is missing without calling the SDK", async () => {
      const response = await prepareHandler(
        makeRequest("POST", { input: { schemaId: "sch-1", payload: {} } }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when schemaId is missing without calling the SDK", async () => {
      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          input: {},
        }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });

    it("returns 400 when payload is missing without calling the SDK", async () => {
      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          input: { schemaId: "sch-1" },
        }),
      );

      expect(response).toEqual({ status: 400, body: invalidRequestBody });
      expectNoSdkCalls();
    });
  });

  describe("prepare workflow", () => {
    it("prepares via the defined schema id on the happy path", async () => {
      const client = { apiBase: "https://api.example", apiKey: "k-1" };
      const meta = { id: "sch-meta" };
      const definedSchema = { id: "sch-defined" };
      sdk.create.mockReturnValue(client);
      sdk.getById.mockResolvedValue(meta);
      sdk.define.mockResolvedValue(definedSchema);
      sdk.prepare.mockResolvedValue({ docHash: "0xabc" });

      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          apiKey: "k-1",
          input: { schemaId: "sch-meta", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({ status: 200, body: { docHash: "0xabc" } });
      expect(sdk.create).toHaveBeenCalledTimes(1);
      expect(sdk.create).toHaveBeenCalledWith({
        apiBase: "https://api.example",
        apiKey: "k-1",
      });
      expect(sdk.getById).toHaveBeenCalledTimes(1);
      expect(sdk.getById).toHaveBeenCalledWith(client, "sch-meta");
      expect(sdk.define).toHaveBeenCalledTimes(1);
      expect(sdk.define).toHaveBeenCalledWith(meta);
      expect(sdk.prepare).toHaveBeenCalledTimes(1);
      expect(sdk.prepare).toHaveBeenCalledWith(client, {
        schema: "sch-defined",
        payload: { a: 1 },
      });
      const createOrder = sdk.create.mock.invocationCallOrder.at(0) ?? -1;
      const getByIdOrder = sdk.getById.mock.invocationCallOrder.at(0) ?? -1;
      const defineOrder = sdk.define.mock.invocationCallOrder.at(0) ?? -1;
      const prepareOrder = sdk.prepare.mock.invocationCallOrder.at(0) ?? -1;
      expect(createOrder).toBeGreaterThanOrEqual(0);
      expect(getByIdOrder).toBeGreaterThan(createOrder);
      expect(defineOrder).toBeGreaterThan(getByIdOrder);
      expect(prepareOrder).toBeGreaterThan(defineOrder);
    });

    it("passes apiKey as undefined when it is omitted from the body", async () => {
      const client = { apiBase: "https://api.example" };
      const meta = { id: "sch-meta" };
      const definedSchema = { id: "sch-defined" };
      sdk.create.mockReturnValue(client);
      sdk.getById.mockResolvedValue(meta);
      sdk.define.mockResolvedValue(definedSchema);
      sdk.prepare.mockResolvedValue({ docHash: "0xabc" });

      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          input: { schemaId: "sch-meta", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({ status: 200, body: { docHash: "0xabc" } });
      expect(sdk.create).toHaveBeenCalledTimes(1);
      expect(sdk.create).toHaveBeenCalledWith({
        apiBase: "https://api.example",
        apiKey: undefined,
      });
      expect(
        "apiKey" in (sdk.create.mock.calls.at(0)?.at(0) ?? {}),
      ).toBe(true);
    });
  });

  describe("failure mapping", () => {
    it("returns 502 when the schema fetch fails without defining or preparing", async () => {
      const client = { apiBase: "https://api.example", apiKey: "k-1" };
      sdk.create.mockReturnValue(client);
      sdk.getById.mockRejectedValue(new Error("schema not found"));

      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          apiKey: "k-1",
          input: { schemaId: "sch-meta", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({
        status: 502,
        body: { error: "Preparation failed", message: "schema not found" },
      });
      expect(sdk.create).toHaveBeenCalledTimes(1);
      expect(sdk.getById).toHaveBeenCalledTimes(1);
      expect(sdk.define).not.toHaveBeenCalled();
      expect(sdk.prepare).not.toHaveBeenCalled();
    });

    it("returns 502 with a stringified message for non-Error rejections", async () => {
      const client = { apiBase: "https://api.example", apiKey: "k-1" };
      sdk.create.mockReturnValue(client);
      sdk.getById.mockRejectedValue("boom");

      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          apiKey: "k-1",
          input: { schemaId: "sch-meta", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({
        status: 502,
        body: { error: "Preparation failed", message: "boom" },
      });
      expect(sdk.define).not.toHaveBeenCalled();
      expect(sdk.prepare).not.toHaveBeenCalled();
    });

    it("returns 502 when prepare itself rejects", async () => {
      const client = { apiBase: "https://api.example", apiKey: "k-1" };
      const meta = { id: "sch-meta" };
      const definedSchema = { id: "sch-defined" };
      sdk.create.mockReturnValue(client);
      sdk.getById.mockResolvedValue(meta);
      sdk.define.mockResolvedValue(definedSchema);
      sdk.prepare.mockRejectedValue(new Error("normalize failed"));

      const response = await prepareHandler(
        makeRequest("POST", {
          apiBase: "https://api.example",
          apiKey: "k-1",
          input: { schemaId: "sch-meta", payload: { a: 1 } },
        }),
      );

      expect(response).toEqual({
        status: 502,
        body: { error: "Preparation failed", message: "normalize failed" },
      });
      expect(sdk.create).toHaveBeenCalledTimes(1);
      expect(sdk.getById).toHaveBeenCalledTimes(1);
      expect(sdk.define).toHaveBeenCalledTimes(1);
      expect(sdk.prepare).toHaveBeenCalledTimes(1);
    });
  });
});
