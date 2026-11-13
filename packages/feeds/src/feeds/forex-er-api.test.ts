import { describe, it, expect, vi, afterEach } from "vitest";
import { erApiForex } from "./forex-er-api.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("erApiForex.id", () => {
  it('is "forex/er-api"', () => {
    expect(erApiForex.id).toBe("forex/er-api");
  });
});

describe("erApiForex.getDocumentId", () => {
  it("returns the date string", () => {
    expect(erApiForex.getDocumentId({ date: "2026-11-07" })).toBe("2026-11-07");
  });

  it('returns "unknown" when date is absent', () => {
    expect(erApiForex.getDocumentId({})).toBe("unknown");
  });
});

describe("erApiForex.getAttributes", () => {
  it("returns source/base/date and flattens rates with string values", () => {
    const attrs = erApiForex.getAttributes?.({
      base: "USD",
      date: "Sat, 08 Nov 2025 00:00:01 +0000",
      rates: { JPY: 150.5, EUR: 0.91 },
    });
    expect(attrs?.["source"]).toBe("exchangerate-api");
    expect(attrs?.["base"]).toBe("USD");
    expect(attrs?.["date"]).toBe("Sat, 08 Nov 2025 00:00:01 +0000");
    expect(attrs?.["rates.JPY"]).toBe("150.5");
    expect(attrs?.["rates.EUR"]).toBe("0.91");
  });

  it("returns exactly base/date/source with empty fallbacks when rates is absent", () => {
    const attrs = erApiForex.getAttributes?.({ date: "2026-11-07" });
    expect(attrs).toBeDefined();
    expect(Object.keys(attrs ?? {}).sort()).toEqual([
      "base",
      "date",
      "source",
    ]);
    expect(Object.keys(attrs ?? {})).toHaveLength(3);
    expect(attrs?.["source"]).toBe("exchangerate-api");
    expect(attrs?.["base"]).toBe("");
    expect(attrs?.["date"]).toBe("2026-11-07");
  });
});

describe("erApiForex.fetch", () => {
  it("fetches via the fetcher, scales rates by 1e8, and commits", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    const upstreamDate = "Sat, 08 Nov 2025 00:00:01 +0000";
    const fetchMock = vi.fn(
      async (_url: string) =>
        new Response(
          JSON.stringify({
            response: {
              data: {
                time_last_update_utc: upstreamDate,
                rates: { JPY: 150.12345678, EUR: 0.91 },
              },
            },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await erApiForex.fetch();

    const expectedUrl = `https://fetcher.test/fetch?url=${encodeURIComponent(
      "https://open.er-api.com/v6/latest/USD",
    )}`;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(expectedUrl);

    const data = result.response.data as unknown as Readonly<
      Record<string, unknown>
    >;
    expect(data["base"]).toBe("USD");
    expect(data["date"]).toBe(upstreamDate);

    const rates = data["rates"] as Readonly<Record<string, number>>;
    expect(rates["JPY"]).toBe(15012345678);
    expect(rates["EUR"]).toBe(91000000);
    expect(Number.isInteger(rates["JPY"])).toBe(true);
    expect(Number.isInteger(rates["EUR"])).toBe(true);

    expect(typeof result.commitment.root).toBe("string");
    expect(result.commitment.root.startsWith("0x")).toBe(true);
    expect(result.commitment.root.length).toBeGreaterThan(2);

    expect(result.request.url).toBe("forex/er-api");
    expect(typeof result.request.fetchedAt).toBe("number");
    expect(result.request.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(typeof result.response.canonical).toBe("string");
    expect(result.response.canonical.length).toBeGreaterThan(0);
    expect(data).toEqual({
      base: "USD",
      date: upstreamDate,
      rates: { EUR: 91000000, JPY: 15012345678 },
    });
    expect(result.response.canonical).toBe(
      '{"base":"USD","date":"Sat, 08 Nov 2025 00:00:01 +0000","rates":{"EUR":91000000,"JPY":15012345678}}',
    );
  });

  it("honours FOREX_BASE=EUR in the URL and normalized base", async () => {
    vi.stubEnv("FOREX_BASE", "EUR");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    const fetchMock = vi.fn(
      async (_url: string) =>
        new Response(
          JSON.stringify({
            response: {
              data: {
                time_last_update_utc: "Sat, 08 Nov 2025 00:00:01 +0000",
                rates: { USD: 1.08 },
              },
            },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await erApiForex.fetch();

    const expectedUrl = `https://fetcher.test/fetch?url=${encodeURIComponent(
      "https://open.er-api.com/v6/latest/EUR",
    )}`;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(expectedUrl);

    const data = result.response.data as unknown as Readonly<
      Record<string, unknown>
    >;
    expect(data["base"]).toBe("EUR");
  });

  it("rejects on non-ok fetcher responses", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );

    await expect(erApiForex.fetch()).rejects.toThrow("fetcher: HTTP 500");
  });

  it("rejects when the body has no response data", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    );

    await expect(erApiForex.fetch()).rejects.toThrow(
      "fetcher: missing response data",
    );
  });
});
