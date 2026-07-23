/**
 * Forex data feed — ExchangeRate-API (open.er-api.com).
 *
 * Free tier — no API key required.  Returns ~166 currency pairs
 * updated daily.  The response shape differs from Frankfurter:
 * `base_code` instead of `base`, `time_last_update_utc` instead of
 * `date`, and flat `rates` object with currency codes as keys.
 *
 * Fetches via the fetcher Workers (fetch primitive), then scales rates
 * by 10^8 and commits locally with commitDeep({maxDepth: 16}) to match
 * the forex-average-v1 circuit's 16-level Poseidon tree.
 */

import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import type { CommitResult, Json } from "@lemmaoracle/sdk";
import type { FeedSource } from "../types.js";

// ── configuration ─────────────────────────────────────────────────────────

/** Default base currency. */
const DEFAULT_BASE = "USD";

/** Default fetcher Workers endpoint. */
const DEFAULT_FETCHER_URL = "https://fetcher.lemma.workers.dev";

/** Scale factor for integer rates. */
const SCALE = 1e8;

// ── helpers ───────────────────────────────────────────────────────────────

const scaleRate = (rate: number): number => Math.round(rate * SCALE);

// ── feed source ───────────────────────────────────────────────────────────

/**
 * ExchangeRate-API forex feed source.
 *
 * Fetches free-tier exchange rates via the fetcher Workers (fetch primitive),
 * scales rates by 10^8, and commits locally with commitDeep.
 *
 * Environment variables:
 *   FETCHER_URL=https://fetcher.lemma.workers.dev
 *   FOREX_BASE=USD tsx src/cli.ts forex/er-api
 */
export const erApiForex: FeedSource = {
  id: "forex/er-api",
  label: "ExchangeRate-API Free Tier",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return String(obj["date"] ?? "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates = (obj["rates"] as Readonly<Record<string, Json>>) ?? {};
    return {
      source: "exchangerate-api",
      base: String(obj["base"] ?? ""),
      date: String(obj["date"] ?? ""),
      ...Object.fromEntries(
        Object.entries(rates).map(([k, v]) => [`rates.${k}`, String(v)]),
      ),
    };
  },

  fetch: async (_config?: FetcherConfig): Promise<FetchResult> => {
    const base: string = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const fetcherUrl: string =
      process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL;

    // 1. Fetch raw data via fetcher Workers (fetch primitive)
    const sourceUrl = `https://open.er-api.com/v6/latest/${base}`;
    const endpoint = `${fetcherUrl}/fetch?url=${encodeURIComponent(sourceUrl)}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`);
    }
    const fetched = (await res.json()) as FetchResult;

    // 2. Extract raw rates from fetched data
    const raw = fetched.data as Readonly<Record<string, Json>>;
    const rawRates = (raw["rates"] as Readonly<Record<string, Json>>) ?? {};
    const date = String(raw["time_last_update_utc"] ?? "");

    // 3. Scale rates ×10^8 (feeds-layer responsibility, not fetcher's)
    const scaledRates: Record<string, number> = {};
    for (const [ccy, rate] of Object.entries(rawRates)) {
      scaledRates[ccy] = scaleRate(Number(rate));
    }

    // 4. Build normalized JSON + commit locally with scaled integers
    const normalized: Json = {
      base,
      date,
      rates: scaledRates as unknown as Json,
    };

    const { canonical } = canonicalSort(normalized);
    const commitment = commitDeep(normalized, { maxDepth: 16 }) as CommitResult;

    return {
      source: "forex/er-api",
      fetchedAt: Date.now(),
      data: normalized,
      canonical,
      commitment,
    };
  },
};
