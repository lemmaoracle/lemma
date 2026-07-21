/**
 * Forex data feed — ExchangeRate-API (open.er-api.com).
 *
 * Free tier — no API key required.  Returns ~166 currency pairs
 * updated daily.  The response shape differs from Frankfurter:
 * `base_code` instead of `base`, `time_last_update_utc` instead of
 * `date`, and flat `rates` object with currency codes as keys.
 *
 * Because the structure differs, the Merkle tree differs, producing
 * a distinct root and independent proof set from the Frankfurter feed.
 */

import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import type { Json } from "@lemmaoracle/sdk";
import type { FeedSource } from "../types.js";

// ── configuration ─────────────────────────────────────────────────────────

/** Default base currency. */
const DEFAULT_BASE = "USD";

/** Default fetcher Workers endpoint. */
const DEFAULT_FETCHER_URL = "https://fetcher.lemma.workers.dev";

// ── feed source ───────────────────────────────────────────────────────────

/**
 * ExchangeRate-API forex feed source.
 *
 * Fetches free-tier exchange rates via the deployed fetcher Workers.
 * Environment variables:
 *
 *   FOREX_BASE=USD tsx src/cli.ts forex/er-api
 */
export const erApiForex: FeedSource = {
  id: "forex/er-api",
  label: "ExchangeRate-API Free Tier",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return String(obj["time_last_update_utc"] ?? "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates = (obj["rates"] as Readonly<Record<string, Json>>) ?? {};
    return {
      source: "exchangerate-api",
      base: String(obj["base_code"] ?? ""),
      date: String(obj["time_last_update_utc"] ?? ""),
      ...Object.fromEntries(
        Object.entries(rates).map(([k, v]) => [`rates.${k}`, String(v)]),
      ),
    };
  },

  fetch: async (_config?: FetcherConfig): Promise<FetchResult> => {
    const base: string = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const fetcherUrl: string =
      process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL;

    const sourceUrl = `https://open.er-api.com/v6/latest/${base}`;
    const endpoint = `${fetcherUrl}/fetch?url=${encodeURIComponent(sourceUrl)}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`);
    }
    return (await res.json()) as FetchResult;
  },
};
