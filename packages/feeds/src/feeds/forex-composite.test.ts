import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FetchResult } from "@lemmaoracle/fetcher";

const { frankfurterFetchMock, erApiFetchMock } = vi.hoisted(() => ({
  frankfurterFetchMock: vi.fn(),
  erApiFetchMock: vi.fn(),
}));

// Real commitDeep is covered in packages/sdk/src/commitments.test.ts; the
// contract pinned here is "what gets committed", not the poseidon output.
const { canonicalSortMock, commitDeepMock } = vi.hoisted(() => ({
  canonicalSortMock: vi.fn((value: unknown) => ({ canonical: JSON.stringify(value) })),
  commitDeepMock: vi.fn(() => ({ root: "commit-root", randomness: "commit-rand", leafPreimages: [], inclusionProofs: [] })),
}));

vi.mock("@lemmaoracle/sdk", () => ({
  canonicalSort: canonicalSortMock,
  commitDeep: commitDeepMock,
}));

vi.mock("./forex.js", () => ({
  frankfurterForex: { fetch: frankfurterFetchMock },
}));
vi.mock("./forex-er-api.js", () => ({
  erApiForex: { fetch: erApiFetchMock },
}));

import { forexComposite, fetchComposite } from "./forex-composite.js";

const src = (data: Record<string, unknown>, root: string) =>
  ({
    request: { url: "x", fetchedAt: 0, date: "2026-11-15" },
    response: { data, canonical: "{}" },
    commitment: {
      root,
      randomness: `rand-${root}`,
      leafPreimages: [`leaf-${root}`],
      inclusionProofs: [`proof-${root}`],
    },
  }) as unknown as FetchResult;

beforeEach(() => {
  frankfurterFetchMock.mockReset();
  erApiFetchMock.mockReset();
  canonicalSortMock.mockClear();
  commitDeepMock.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("forexComposite.getDocumentId", () => {
  it("returns data.date", () => {
    expect(forexComposite.getDocumentId({ date: "2026-11-15" })).toBe(
      "2026-11-15",
    );
  });

  it('returns "unknown" when date is absent', () => {
    expect(forexComposite.getDocumentId({})).toBe("unknown");
  });
});

describe("forexComposite.getAttributes", () => {
  const fixture = {
    base: "USD",
    date: "2026-11-15",
    rates: { JPY: 15000000000, EUR: 91000000 },
    sourceRoots: { frankfurter: "root-a", erApi: "root-b" },
  };

  it("returns the exact sorted key list with stringified values", () => {
    const attrs = forexComposite.getAttributes?.(fixture);
    expect(attrs).toBeDefined();
    expect(Object.keys(attrs ?? {}).sort()).toEqual([
      "base",
      "date",
      "rates.EUR",
      "rates.JPY",
      "source",
      "sourceRoot.erApi",
      "sourceRoot.frankfurter",
    ]);
    expect(attrs?.["source"]).toBe("forex-composite");
    expect(attrs?.["base"]).toBe("USD");
    expect(attrs?.["date"]).toBe("2026-11-15");
    expect(attrs?.["rates.JPY"]).toBe("15000000000");
    expect(attrs?.["rates.EUR"]).toBe("91000000");
    expect(attrs?.["sourceRoot.frankfurter"]).toBe("root-a");
    expect(attrs?.["sourceRoot.erApi"]).toBe("root-b");
  });

  it("emits no src_* attributes (er-api ToS guard)", () => {
    // ExchangeRate-API's Terms of Service forbid redistributing raw source
    // rates, so the composite may only reference the sources by their Merkle
    // roots (cryptographic hashes). No `src_*` attribute may ever be emitted.
    const attrs = forexComposite.getAttributes?.(fixture);
    expect(attrs).toBeDefined();
    expect(
      Object.keys(attrs ?? {}).some((k) => k.startsWith("src_")),
    ).toBe(false);
  });
});

describe("forexComposite.fetch", () => {
  it("averages over the currency intersection only, with Math.round", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    frankfurterFetchMock.mockResolvedValue(
      src(
        {
          date: "2026-11-15",
          base: "USD",
          rates: { JPY: 3, EUR: 5, GBP: 7 },
        },
        "root-a",
      ),
    );
    erApiFetchMock.mockResolvedValue(
      src(
        {
          date: "2026-11-14",
          base: "USD",
          rates: { JPY: 4, EUR: 5 },
        },
        "root-b",
      ),
    );

    const result = await forexComposite.fetch();

    const data = result.response.data as unknown as Readonly<
      Record<string, unknown>
    >;
    // JPY: (3 + 4) / 2 = 3.5 rounds to 4; GBP dropped (missing from B).
    expect(data["rates"]).toEqual({ JPY: 4, EUR: 5 });
    expect(data["type"]).toBe("forex-composite-v1");
    expect(data["sourceRoots"]).toEqual({
      frankfurter: "root-a",
      erApi: "root-b",
    });
    // Date is taken from source A's data.
    expect(data["date"]).toBe("2026-11-15");
    expect(result.commitment).toBeDefined();
    expect(result.commitment.root).toBe("commit-root");
    expect(frankfurterFetchMock).toHaveBeenCalledTimes(1);
    expect(erApiFetchMock).toHaveBeenCalledTimes(1);
    const captured = (commitDeepMock.mock.calls as unknown[][])[0]?.[0];
    expect(captured).toEqual({ type: "forex-composite-v1", date: "2026-11-15", base: "USD", sourceRoots: { frankfurter: "root-a", erApi: "root-b" }, rates: { JPY: 4, EUR: 5 } });
    expect(canonicalSortMock).toHaveBeenCalledWith(captured);
  });

  it('defaults base to "USD" when FOREX_BASE is unset', async () => {
    const prev = process.env["FOREX_BASE"];
    delete process.env["FOREX_BASE"];
    try {
      frankfurterFetchMock.mockResolvedValue(
        src({ date: "2026-11-15", rates: { JPY: 2 } }, "root-a"),
      );
      erApiFetchMock.mockResolvedValue(
        src({ date: "2026-11-15", rates: { JPY: 4 } }, "root-b"),
      );

      const result = await forexComposite.fetch();

      const data = result.response.data as unknown as Readonly<
        Record<string, unknown>
      >;
      expect(data["base"]).toBe("USD");
      expect(data["rates"]).toEqual({ JPY: 3 });
    } finally {
      if (prev === undefined) {
        delete process.env["FOREX_BASE"];
      } else {
        process.env["FOREX_BASE"] = prev;
      }
    }
  });

  it('uses FOREX_BASE for the merged base when set', async () => {
    vi.stubEnv("FOREX_BASE", "EUR");
    frankfurterFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { JPY: 2 } }, "root-a"),
    );
    erApiFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { JPY: 4 } }, "root-b"),
    );

    const result = await forexComposite.fetch();

    const data = result.response.data as unknown as Readonly<
      Record<string, unknown>
    >;
    expect(data["base"]).toBe("EUR");
    expect(data["rates"]).toEqual({ JPY: 3 });
  });

  it("rejects when the sources share no common currencies", async () => {
    frankfurterFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { JPY: 1 } }, "root-a"),
    );
    erApiFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { EUR: 2 } }, "root-b"),
    );

    await expect(forexComposite.fetch()).rejects.toThrow(
      "forex/composite: no common currencies between sources",
    );
  });
});

describe("fetchComposite", () => {
  it("rejects when the sources share no common currencies", async () => {
    frankfurterFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { JPY: 1 } }, "root-a"),
    );
    erApiFetchMock.mockResolvedValue(
      src({ date: "2026-11-15", rates: { EUR: 2 } }, "root-b"),
    );

    await expect(fetchComposite()).rejects.toThrow(
      "forex/composite: no common currencies between sources",
    );
  });

  it("returns feedId, averaged rates, sourceRoots, and full source commitments", async () => {
    vi.stubEnv("FOREX_BASE", "USD");
    frankfurterFetchMock.mockResolvedValue(
      src(
        {
          date: "2026-11-15",
          base: "USD",
          rates: { JPY: 3, EUR: 5, GBP: 7 },
        },
        "root-a",
      ),
    );
    erApiFetchMock.mockResolvedValue(
      src(
        {
          date: "2026-11-14",
          base: "USD",
          rates: { JPY: 4, EUR: 5 },
        },
        "root-b",
      ),
    );

    const result = await fetchComposite();

    expect(result.feedId).toBe("forex/composite");
    expect(result.date).toBe("2026-11-15");
    expect(result.base).toBe("USD");
    expect(result.averagedRates).toEqual({ JPY: 4, EUR: 5 });
    expect(result.sourceRoots).toEqual({
      frankfurter: "root-a",
      erApi: "root-b",
    });
    expect(result.sources.frankfurter).toEqual({
      root: "root-a",
      randomness: "rand-root-a",
      leafPreimages: ["leaf-root-a"],
      inclusionProofs: ["proof-root-a"],
    });
    expect(result.sources.erApi).toEqual({
      root: "root-b",
      randomness: "rand-root-b",
      leafPreimages: ["leaf-root-b"],
      inclusionProofs: ["proof-root-b"],
    });
  });
});
