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

import { fetchAndCommit } from "@lemmaoracle/fetch";
import type { FetcherConfig } from "@lemmaoracle/fetch";
import type { FeedSource } from "../types.js";

// ── configuration ─────────────────────────────────────────────────────────

/** Default base currency. */
const DEFAULT_BASE = "USD";

/** Comma-separated list of symbols to fetch, or undefined for all. */
const DEFAULT_SYMBOLS: string | undefined = undefined;

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
 * Fetches ECB reference rates.  The base currency and symbol filter
 * are read from environment variables at fetch time, so they can be
 * changed without modifying code:
 *
 *   FOREX_BASE=JPY FOREX_SYMBOLS=USD,EUR tsx src/cli.ts forex/frankfurter
 */
export const frankfurterForex: FeedSource = {
  id: "forex/frankfurter",
  label: "Frankfurter Forex (ECB reference rates)",
  category: "forex",

  fetch: async (config?: FetcherConfig): ReturnType<FeedSource["fetch"]> => {
    const base: string = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const symbols: string | undefined =
      process.env["FOREX_SYMBOLS"] ?? DEFAULT_SYMBOLS;

    const url = buildUrl(base, symbols);
    return fetchAndCommit(url, config);
  },
};
