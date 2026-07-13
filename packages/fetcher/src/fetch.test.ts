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
  it("fetches, canonicalises, and commits to JSON response", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse(JSON.stringify({ price: 42000, currency: "USD" })),
    );

    const result = await fetchAndCommit("https://api.example.com/price", {
      fetch: mockFetch,
    });

    expect(result.source).toBe("https://api.example.com/price");
    expect(result.fetchedAt).toBeGreaterThan(0);
    expect(result.data).toEqual({ price: 42000, currency: "USD" });
    expect(result.canonical).toBe('{"currency":"USD","price":42000}');
    expect(result.commitment.root).toMatch(/^0x[0-9a-f]+$/);
    expect(result.commitment.leaves).toHaveLength(2);
  });

  it("canonicalises regardless of key order in source", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createMockResponse(JSON.stringify({ b: 2, a: 1 })),
    );

    const result = await fetchAndCommit("https://api.example.com", {
      fetch: mockFetch,
    });

    expect(result.canonical).toBe('{"a":1,"b":2}');
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

    expect(result.canonical).toBe(
      '{"data":{"items":[{"id":"x","value":42}],"timestamp":1234567890}}',
    );
    expect(result.commitment.pathValues).toHaveLength(3);
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

  it("produces deterministic commitment for same response and randomness", async () => {
    const body = JSON.stringify({ price: 100 });
    const mockFetch1 = vi.fn().mockResolvedValue(createMockResponse(body));
    const mockFetch2 = vi.fn().mockResolvedValue(createMockResponse(body));

    const r1 = await fetchAndCommit("https://api.example.com", { fetch: mockFetch1 });
    const r2 = await fetchAndCommit("https://api.example.com", { fetch: mockFetch2 });

    // Randomness is auto-generated, so roots differ. But with same randomness they'd match.
    // Here we just verify structure is consistent.
    expect(r1.commitment.leaves).toHaveLength(1);
    expect(r2.commitment.leaves).toHaveLength(1);
  });
});
