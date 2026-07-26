import { describe, it, expect, vi } from "vitest";
import { fetchAndCommit } from "./index.js";

// Mock fetch for testing
const createMockResponse = (body: string, ok: boolean = true): Response => {
  return {
    ok,
    status: ok ? 200 : 404,
    text: () => Promise.resolve(body),
  } as Response;
};

describe("fetchAndCommit", () => {
  it("fetches, canonicalises, and commits to JSON response with request provenance", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse(JSON.stringify({ price: 42000, currency: "USD" })),
    );

    const result = await fetchAndCommit("https://api.example.com/price", {
      fetch: mockFetch,
    });

    expect(result.request.url).toBe("https://api.example.com/price");
    expect(result.request.fetchedAt).toBeGreaterThan(0);
    expect(result.request.date).toBe(
      new Date(result.request.fetchedAt).toISOString().slice(0, 10),
    );
    expect(result.response.data).toEqual({ price: 42000, currency: "USD" });
    expect(result.response.canonical).toBe('{"currency":"USD","price":42000}');
    expect(result.commitment.root).toMatch(/^0x[0-9a-f]+$/);
    // data fields (2) + request.url + request.fetchedAt + request.date
    expect(result.commitment.leaves).toHaveLength(5);
    expect(result.commitment.leafPreimages.map((p) => p.name).sort()).toEqual([
      '$["request"]["date"]',
      '$["request"]["fetchedAt"]',
      '$["request"]["url"]',
      '$["response"]["data"]["currency"]',
      '$["response"]["data"]["price"]',
    ]);
  });

  it("canonicalises regardless of key order in source", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse(JSON.stringify({ b: 2, a: 1 })),
    );

    const result = await fetchAndCommit("https://api.example.com", {
      fetch: mockFetch,
    });

    expect(result.response.canonical).toBe('{"a":1,"b":2}');
  });

  it("handles nested objects and arrays", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse(
        JSON.stringify({
          data: {
            items: [{ id: "x", value: 42 }],
            timestamp: 1234567890,
          },
        }),
      ),
    );

    const result = await fetchAndCommit("https://api.example.com", {
      fetch: mockFetch,
    });

    expect(result.response.canonical).toBe(
      '{"data":{"items":[{"id":"x","value":42}],"timestamp":1234567890}}',
    );
    // nested data leaves (3) + request provenance (3)
    expect(result.commitment.leaves).toHaveLength(6);
  });

  it("rejects on HTTP error", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse("Not Found", false),
    );

    await expect(
      fetchAndCommit("https://api.example.com", { fetch: mockFetch }),
    ).rejects.toThrow("HTTP 404");
  });

  it("rejects on invalid JSON", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse("not json {{{"),
    );

    await expect(
      fetchAndCommit("https://api.example.com", { fetch: mockFetch }),
    ).rejects.toThrow("invalid JSON");
  });

  it("passes headers from config", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse('{"ok":true}'),
    );

    await fetchAndCommit("https://api.example.com", {
      fetch: mockFetch,
      headers: { Authorization: "Bearer token123" },
    });

    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com", {
      headers: { Authorization: "Bearer token123" },
    });
  });

  it("produces consistent leaf structure for same response shape", async () => {
    const body = JSON.stringify({ price: 100 });
    const mockFetch1 = vi.fn().mockResolvedValue(createMockResponse(body));
    const mockFetch2 = vi.fn().mockResolvedValue(createMockResponse(body));

    const r1 = await fetchAndCommit("https://api.example.com", { fetch: mockFetch1 });
    const r2 = await fetchAndCommit("https://api.example.com", { fetch: mockFetch2 });

    // Randomness is auto-generated, so roots differ. Structure is consistent.
    expect(r1.commitment.leaves).toHaveLength(4);
    expect(r2.commitment.leaves).toHaveLength(4);
  });

  it("derives UTC date from fetchedAt", async () => {
    const fixedNow = 1753531200000; // 2025-07-26T12:00:00.000Z
    vi.spyOn(Date, "now").mockReturnValue(fixedNow);
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse('{"ok":true}'),
    );

    const result = await fetchAndCommit("https://api.example.com", {
      fetch: mockFetch,
    });

    expect(result.request.fetchedAt).toBe(fixedNow);
    expect(result.request.date).toBe("2025-07-26");
    vi.restoreAllMocks();
  });
});
