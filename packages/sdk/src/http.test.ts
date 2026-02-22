import { describe, it, expect, vi } from "vitest";
import type { LemmaClient } from "@lemma/spec";
import { get, post } from "./http";

const makeMockClient = (response: { status: number; body: unknown }): LemmaClient => ({
  apiBase: "http://localhost:8787",
  apiKey: "test-key",
  fetchFn: vi.fn().mockResolvedValue({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: () => Promise.resolve(response.body),
  }) as unknown as typeof fetch,
});

describe("http helpers", () => {
  it("get sends GET with api key header", async () => {
    const client = makeMockClient({ status: 200, body: { id: "s1" } });
    const result = await get<{ id: string }>(client)("/v1/schemas/s1")();
    expect(result).toEqual({ id: "s1" });
    expect(client.fetchFn).toHaveBeenCalledWith(
      "http://localhost:8787/v1/schemas/s1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("post sends POST with JSON body", async () => {
    const client = makeMockClient({ status: 200, body: { status: "registered" } });
    const result = await post<{ status: string }>(client)("/v1/documents")({ docHash: "0x1" });
    expect(result.status).toBe("registered");
  });

  it("rejects on non-ok response", async () => {
    const client = makeMockClient({ status: 404, body: { error: "Not Found" } });
    await expect(get(client)("/v1/schemas/unknown")()).rejects.toThrow("HTTP 404");
  });
});
