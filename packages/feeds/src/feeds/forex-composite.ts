/**
 * Forex composite feed — multi-source average.
 *
 * Fetches Frankfurter + ExchangeRate-API independently via the fetcher
 * Workers, matches currency pairs, and commits to the arithmetic mean
 * using the SDK's commitDeep.
 *
 * ## Cryptographic binding design
 *
 * The Merkle tree commits to:
 *   - Averaged rates per currency (e.g. `rates.USD`)
 *   - Source roots (`sourceRoots.frankfurter`, `sourceRoots.erApi`)
 *
 * The binding chain for a verifier:
 *   1. Verify source-A proofs → root_A is authentic
 *   2. Verify source-B proofs → root_B is authentic
 *   3. Composite attributes reference both roots → binding established
 *   4. Per-currency source values in attributes allow average recomputation
 *   5. Recompute (srcA + srcB) / 2 → must match proved averaged rate
 *
 * Per-currency raw source values are stored ONLY in document attributes.
 */

import type { FetchResult } from "@lemmaoracle/fetcher";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import type { Json } from "@lemmaoracle/sdk";
import type { FeedSource } from "../types.js";

// ── configuration ─────────────────────────────────────────────────────────

const DEFAULT_BASE = "USD";
const DEFAULT_FETCHER_URL = "https://fetcher.lemma.workers.dev";

type SourceMeta = Readonly<{
  id: string;
  apiUrl: (base: string) => string;
}>;

const SOURCES: ReadonlyArray<SourceMeta> = [
  {
    id: "frankfurter",
    apiUrl: (base: string) => `https://api.frankfurter.app/latest?from=${base}`,
  },
  {
    id: "er-api",
    apiUrl: (base: string) => `https://open.er-api.com/v6/latest/${base}`,
  },
];

// ── source-value cache (for getAttributes, not in Merkle tree) ────────────

const sourceValueCache = new Map<
  string,
  Record<string, Record<string, number>>
>();

// ── helpers ───────────────────────────────────────────────────────────────

const fetchSource = async (
  fetcherUrl: string,
  sourceUrl: string,
): Promise<FetchResult> => {
  const endpoint = `${fetcherUrl}/fetch?url=${encodeURIComponent(sourceUrl)}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`);
  }
  return (await res.json()) as FetchResult;
};

const extractRates = (
  data: Json,
): Readonly<Record<string, number>> => {
  const obj = data as Readonly<Record<string, Json>>;
  const r = obj["rates"] as Readonly<Record<string, Json>> | undefined;
  return Object.fromEntries(
    Object.entries(r ?? {}).map(([k, v]) => [k, Number(v)]),
  );
};

// ── feed source ───────────────────────────────────────────────────────────

export const forexComposite: FeedSource = {
  id: "forex/composite",
  label: "Forex Composite (Frankfurter ⊕ ExchangeRate-API average)",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return String(obj["date"] ?? "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates = (obj["rates"] as Readonly<Record<string, Json>>) ?? {};
    const sourceRoots =
      (obj["sourceRoots"] as Readonly<Record<string, Json>>) ?? {};
    const date = String(obj["date"] ?? "");
    const srcVals = sourceValueCache.get(date) ?? {};

    const attrs: Record<string, string> = {
      source: "forex-composite",
      base: String(obj["base"] ?? ""),
      date,
      ...Object.fromEntries(
        Object.entries(sourceRoots).map(([k, v]) => [
          `sourceRoot.${k}`,
          String(v),
        ]),
      ),
    };

    for (const [ccy, val] of Object.entries(rates)) {
      attrs[`rates.${ccy}`] = String(val);
    }

    for (const [ccy, pair] of Object.entries(srcVals)) {
      for (const [src, val] of Object.entries(pair)) {
        attrs[`src_${src}_${ccy}`] = String(val);
      }
    }

    return attrs;
  },

  fetch: async (): Promise<FetchResult> => {
    const base = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const fetcherUrl = process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL;

    // 1. Fetch both sources in parallel via fetcher Workers
    const results: [FetchResult, FetchResult] = (await Promise.all(
      SOURCES.map((s) => fetchSource(fetcherUrl, s.apiUrl(base))),
    )) as [FetchResult, FetchResult];
    const srcA = results[0];
    const srcB = results[1];

    // 2. Extract rates and roots
    const ratesA = extractRates(srcA.data);
    const ratesB = extractRates(srcB.data);
    const rootA = (srcA.commitment as Record<string, unknown>)["root"] as string;
    const rootB = (srcB.commitment as Record<string, unknown>)["root"] as string;

    // 3. Currency intersection
    const currencies = Object.keys(ratesA).filter((c) => c in ratesB);
    if (currencies.length === 0) {
      throw new Error("forex/composite: no common currencies between sources");
    }

    // 4. Average + cache source values
    const averagedRates: Record<string, number> = {};
    const sourceValues: Record<string, Record<string, number>> = {};
    for (const ccy of currencies) {
      const v1 = ratesA[ccy]!;
      const v2 = ratesB[ccy]!;
      averagedRates[ccy] = (v1 + v2) / 2;
      sourceValues[ccy] = { frankfurter: v1, erApi: v2 };
    }

    const date = String(
      (srcA.data as Readonly<Record<string, Json>>)["date"] ?? "",
    );
    sourceValueCache.set(date, sourceValues);

    // 5. Build merged JSON + commit via SDK
    const merged: Json = {
      type: "forex-composite-v1",
      date,
      base,
      sourceRoots: { frankfurter: rootA, erApi: rootB },
      rates: averagedRates as unknown as Json,
    };

    const { canonical } = canonicalSort(merged);
    const maxDepth = Number(process.env["FEED_MAX_DEPTH"] ?? "16");
    const commitment = commitDeep(merged, { maxDepth });

    return {
      source: "forex/composite",
      fetchedAt: Date.now(),
      data: merged,
      canonical,
      commitment: commitment,
    };
  },
};
