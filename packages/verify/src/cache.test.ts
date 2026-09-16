import { afterEach, describe, expect, it, vi } from "vitest";
import { createCachingFetcher } from "./cache.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createCachingFetcher", () => {
  it("serves a second request for the same CID from cache", async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (input: unknown) => {
      calls.push(String(input));
      return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
    }) as unknown as typeof fetch;

    const fetcher = createCachingFetcher();
    const r1 = await fetcher("https://gateway.pinata.cloud/ipfs/QmABC12345678901234567890");
    const r2 = await fetcher("https://ipfs.io/ipfs/QmABC12345678901234567890");

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(calls.length).toBe(1); // second CID hit the cache, no fetch
  });

  it("passes through non-IPFS and non-GET requests", async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (input: unknown) => {
      calls.push(String(input));
      return new Response("ok", { status: 200 });
    }) as unknown as typeof fetch;

    const fetcher = createCachingFetcher();
    await fetcher("https://workers.lemma.workers.dev/v1/circuits/x");
    await fetcher("https://gateway.pinata.cloud/ipfs/QmXYZ12345678901234567890", {
      method: "POST",
      body: "x",
    });

    expect(calls.length).toBe(2); // both passed through uncached
  });

  it("does not cache failed responses", async () => {
    const calls: string[] = [];
    globalThis.fetch = vi.fn(async (input: unknown) => {
      calls.push(String(input));
      return new Response("nf", { status: 404 });
    }) as unknown as typeof fetch;

    const fetcher = createCachingFetcher();
    const r1 = await fetcher("https://gateway.pinata.cloud/ipfs/QmMISS12345678901234567890");
    const r2 = await fetcher("https://gateway.pinata.cloud/ipfs/QmMISS12345678901234567890");

    expect(r1.status).toBe(404);
    expect(r2.status).toBe(404);
    expect(calls.length).toBe(2); // 404 is not cached → both hit the network
  });
});
