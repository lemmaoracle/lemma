import { describe, it, expect, vi, afterEach } from "vitest";
import { frankfurterForex } from "./forex.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("frankfurterForex.getDocumentId", () => {
  it("returns the date string", () => {
    expect(frankfurterForex.getDocumentId({ date: "2026-11-07" })).toBe(
      "2026-11-07",
    );
  });

  it('returns "unknown" when date is absent', () => {
    expect(frankfurterForex.getDocumentId({})).toBe("unknown");
  });
});

describe("frankfurterForex.getAttributes", () => {
  it("returns source/base/date/amount and flattens rates with string values", () => {
    const attrs = frankfurterForex.getAttributes?.({
      base: "USD",
      date: "2026-11-07",
      rates: { JPY: 150.5, EUR: 0.91 },
    });
    expect(attrs?.["source"]).toBe("frankfurter");
    expect(attrs?.["base"]).toBe("USD");
    expect(attrs?.["date"]).toBe("2026-11-07");
    expect(attrs?.["amount"]).toBe("1");
    expect(attrs?.["rates.JPY"]).toBe("150.5");
    expect(attrs?.["rates.EUR"]).toBe("0.91");
  });

  it("returns exactly the 4 base attributes when rates is absent", () => {
    const attrs = frankfurterForex.getAttributes?.({ date: "2026-11-07" });
    expect(attrs).toBeDefined();
    expect(Object.keys(attrs ?? {}).sort()).toEqual([
      "amount",
      "base",
      "date",
      "source",
    ]);
    expect(Object.keys(attrs ?? {})).toHaveLength(4);
    expect(attrs?.["source"]).toBe("frankfurter");
    expect(attrs?.["base"]).toBe("");
    expect(attrs?.["date"]).toBe("2026-11-07");
    expect(attrs?.["amount"]).toBe("1");
  });
});

describe("frankfurterForex.fetch", () => {
  it("fetches via the fetcher, scales rates by 1e8, and commits", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    const fetchMock = vi.fn(
      async (_url: string) =>
        new Response(
          JSON.stringify({
            response: {
              data: {
                base: "USD",
                date: "2026-11-07",
                amount: 1,
                rates: { JPY: 150.12345678, EUR: 0.91 },
              },
            },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await frankfurterForex.fetch();

    const expectedUrl = `https://fetcher.test/fetch?url=${encodeURIComponent(
      "https://api.frankfurter.app/latest?from=USD",
    )}`;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(expectedUrl);

    const data = result.response.data as unknown as Readonly<
      Record<string, unknown>
    >;
    const rates = data["rates"] as Readonly<Record<string, number>>;
    expect(rates["JPY"]).toBe(15012345678);
    expect(rates["EUR"]).toBe(91000000);
    expect(Number.isInteger(rates["JPY"])).toBe(true);
    expect(Number.isInteger(rates["EUR"])).toBe(true);

    expect(typeof result.commitment.root).toBe("string");
    expect(result.commitment.root.startsWith("0x")).toBe(true);
    expect(result.commitment.root.length).toBeGreaterThan(2);

    expect(result.request.url).toBe("forex/frankfurter");
    expect(typeof result.request.fetchedAt).toBe("number");
    expect(result.request.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(typeof result.response.canonical).toBe("string");
    expect(result.response.canonical.length).toBeGreaterThan(0);
    expect(result.response.canonical).not.toContain(" ");
  });

  it("rejects on non-ok fetcher responses", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );

    await expect(frankfurterForex.fetch()).rejects.toThrow(
      "fetcher: HTTP 500",
    );
  });

  it("rejects when the body has no response data", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    vi.stubEnv("FETCHER_URL", "https://fetcher.test");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    );

    await expect(frankfurterForex.fetch()).rejects.toThrow(
      "fetcher: missing response data",
    );
  });
});
