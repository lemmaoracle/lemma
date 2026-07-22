/**
 * Forex data feed — Frankfurter API.
 *
 * Fetches ECB reference exchange rates from the Frankfurter API
 * (https://api.frankfurter.app).  Free, no API key required.
 * Rates are updated daily around 14:15 CET.
 *
 * The feed produces a data-commitment-v1 commitment over the full API
 * response (amount, base, date, rates), which binds all rate pairs
 * into a single Merkle root.
 */

import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import type { Json } from "@lemmaoracle/sdk";
import type { FeedSource } from "../types.js";

// ── configuration ─────────────────────────────────────────────────────────

/** Default base currency. */
const DEFAULT_BASE = "USD";

/** Comma-separated list of symbols to fetch, or undefined for all. */
const DEFAULT_SYMBOLS: string | undefined = undefined;

/** Default fetcher Workers endpoint. */
const DEFAULT_FETCHER_URL = "https://fetcher.lemma.workers.dev";

// ── URL builder ───────────────────────────────────────────────────────────

const buildUrl = (base: string, symbols?: string): string => {
  const url = new URL("https://api.frankfurter.app/latest");
  url.searchParams.set("from", base);
  if (symbols) {
    for (const s of symbols.split(",").map((c) => c.trim())) {
      url.searchParams.append("symbols", s);
    }
  }
  return url.toString();
};

// ── feed source ───────────────────────────────────────────────────────────

/**
 * Frankfurter forex feed source.
 *
 * Fetches ECB reference rates via the deployed fetcher Workers
 * (https://fetcher.lemma.workers.dev).  The base currency and symbol filter
 * are read from environment variables at fetch time:
 *
 *   FETCHER_URL=https://fetcher.lemma.workers.dev
 *   FETCHER_API_KEY=...
 *   FOREX_BASE=JPY FOREX_SYMBOLS=USD,EUR tsx src/cli.ts forex/frankfurter
 */
export const frankfurterForex: FeedSource = {
  id: "forex/frankfurter",
  label: "ECB Reference Exchange Rates (via Frankfurter)",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return String(obj["date"] ?? "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates = (obj["rates"] as Readonly<Record<string, Json>>) ?? {};
    return {
      source: "frankfurter",
      base: String(obj["base"] ?? ""),
      date: String(obj["date"] ?? ""),
      amount: String(obj["amount"] ?? "1"),
      ...Object.fromEntries(
        Object.entries(rates).map(([k, v]) => [`rates.${k}`, String(v)]),
      ),
    };
  },

  fetch: async (_config?: FetcherConfig): Promise<FetchResult> => {
    const base: string = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const symbols: string | undefined =
      process.env["FOREX_SYMBOLS"] ?? DEFAULT_SYMBOLS;
    const fetcherUrl: string =
      process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL;
    const fetcherKey: string = process.env["FETCHER_API_KEY"] ?? "";

    const sourceUrl = buildUrl(base, symbols);
    const endpoint = `${fetcherUrl}/fetch?url=${encodeURIComponent(sourceUrl)}`;
    const headers: Record<string, string> = {};
    if (fetcherKey) headers["X-API-Key"] = fetcherKey;
    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      throw new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`);
    }
    return (await res.json()) as FetchResult;
  },
};
