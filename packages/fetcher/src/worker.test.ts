import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FetchResult } from "./fetch.js";

vi.mock("./fetch.js", () => ({ fetchAndCommit: vi.fn() }));

import worker from "./worker.js";
import { fetchAndCommit } from "./fetch.js";

const mockedFetchAndCommit = vi.mocked(fetchAndCommit);

const PRICE_URL = "https://api.example.com/price";

const fixture: FetchResult = {
  request: { url: PRICE_URL, fetchedAt: 1753531200000, date: "2025-07-26" },
  response: {
    data: { price: 42000, currency: "USD" },
    canonical: '{"currency":"USD","price":42000}',
  },
  commitment: {
    root: "0xabc",
    leaves: ["0x01"],
    randomness: "0x02",
    depth: 0,
    inclusionProofs: [],
    leafPreimages: [],
  },
};

describe("worker", () => {
  beforeEach(() => {
    mockedFetchAndCommit.mockReset();
  });

  it("GET /health returns ok JSON with CORS headers and skips auth", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/health"),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ ok: true, service: "fetcher" });
    expect(response.headers.get("Content-Type")).toMatch(/^application\/json/);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("OPTIONS /fetch returns 204 with empty body without auth", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/fetch", { method: "OPTIONS" }),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("GET /fetch without url returns 400", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/fetch"),
      {},
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Missing 'url' parameter" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("POST /fetch with {} body returns 400", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
      {},
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Missing 'url' parameter" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("returns 401 when key is configured and no X-API-Key header is sent", async () => {
    const response = await worker.fetch(
      new Request(`https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}`),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("returns 401 when the X-API-Key header is wrong", async () => {
    const response = await worker.fetch(
      new Request(`https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}`, {
        headers: { "X-API-Key": "wrong" },
      }),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("returns the fixture with correct key and default maxDepth", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request(`https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}`, {
        headers: { "X-API-Key": "secret" },
      }),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledTimes(1);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 16 });
  });

  it("open mode (undefined key) proceeds without a header", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request(`https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}`),
      {},
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 16 });
  });

  it("open mode (empty key) proceeds without a header", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request(`https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}`),
      { FETCHER_API_KEY: "" },
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 16 });
  });

  it("runs auth before the 404 fallback", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/nope"),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Unauthorized" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("returns 404 with path for unknown routes when authed", async () => {
    const response = await worker.fetch(
      new Request("https://fetcher.test/nope", {
        headers: { "X-API-Key": "secret" },
      }),
      { FETCHER_API_KEY: "secret" },
    );
    expect(response.status).toBe(404);
    const body = (await response.json()) as unknown;
    expect(body).toEqual({ error: "Not found", path: "/nope" });
    expect(mockedFetchAndCommit).not.toHaveBeenCalled();
  });

  it("parses GET maxDepth as a number", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request(
        `https://fetcher.test/fetch?url=${encodeURIComponent(PRICE_URL)}&maxDepth=4`,
      ),
      {},
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 4 });
  });

  it("parses POST JSON body url and maxDepth", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request("https://fetcher.test/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: PRICE_URL, maxDepth: 8 }),
      }),
      {},
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 8 });
  });

  it("defaults POST maxDepth to 16 when omitted", async () => {
    mockedFetchAndCommit.mockResolvedValue(fixture);
    const response = await worker.fetch(
      new Request("https://fetcher.test/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: PRICE_URL }),
      }),
      {},
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(body).toEqual(fixture);
    expect(mockedFetchAndCommit).toHaveBeenCalledWith(PRICE_URL, { maxDepth: 16 });
  });
});
