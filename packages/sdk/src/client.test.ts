import { describe, it, expect } from "vitest";
import { create } from "./client.js";

describe("create", () => {
  it("returns a LemmaClient with apiBase and apiKey", () => {
    const client = create({
      apiBase: "http://localhost:8787",
      apiKey: "test-key",
    });
    expect(client.apiBase).toBe("http://localhost:8787");
    expect(client.apiKey).toBe("test-key");
  });

  it("allows omitting apiKey", () => {
    const client = create({ apiBase: "http://localhost:8787" });
    expect(client.apiKey).toBeUndefined();
  });

  it("includes fetcher when provided", () => {
    const mockFetcher = () => Promise.resolve(new Response());
    const client = create({ apiBase: "http://localhost:8787" }, mockFetcher);
    expect(client.fetcher).toBe(mockFetcher);
  });

  it("does not include fetcher when not provided", () => {
    const client = create({ apiBase: "http://localhost:8787" });
    expect(client.fetcher).toBeUndefined();
  });
});
