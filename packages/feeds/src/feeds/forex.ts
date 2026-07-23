/**
 * Forex data feed — Frankfurter API.
 *
 * Fetches ECB reference exchange rates from the Frankfurter API
 * (https://api.frankfurter.app) via the fetcher Workers (fetch primitive).
 * Free, no API key required.  Rates are updated daily around 14:15 CET.
 *
 * The fetcher Workers returns raw JSON + its own commitment (float rates).
 * This feed scales rates by 10^8 (via Math.round(rate * 1e8)) and re-commits
 * with commitDeep({maxDepth: 16}) to match the forex-average-v1 circuit's
 * 16-level Poseidon tree.  Scaling happens in the feeds layer, not in the
 * fetcher — the fetcher is a pure fetch+commit primitive.
 */

import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import type { Json } from "@lemmaoracle/sdk";
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

const jsonString = (v: Json | undefined, fallback: string): string =>
  typeof v === "string"
    ? v
    : typeof v === "number" || typeof v === "boolean"
      ? String(v)
      : fallback;

const scaleRates = (
  rawRates: Readonly<Record<string, Json>>,
): Readonly<Record<string, number>> =>
  Object.fromEntries(
    Object.entries(rawRates).map(([ccy, rate]) => [ccy, scaleRate(Number(rate))]),
  );

// ── feed source ───────────────────────────────────────────────────────────

/**
 * Frankfurter forex feed source.
 *
 * Fetches ECB reference rates via the fetcher Workers (fetch primitive),
 * scales rates by 10^8, and commits locally with commitDeep.
 *
 * Environment variables:
 *   FETCHER_URL=https://fetcher.lemma.workers.dev
 *   FOREX_BASE=USD tsx src/cli.ts forex/frankfurter
 */
export const frankfurterForex: FeedSource = {
  id: "forex/frankfurter",
  label: "ECB Reference Exchange Rates (via Frankfurter)",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return jsonString(obj["date"], "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates = (obj["rates"] as Readonly<Record<string, Json>> | undefined) ?? {};
    return {
      source: "frankfurter",
      base: jsonString(obj["base"], ""),
      date: jsonString(obj["date"], ""),
      amount: jsonString(obj["amount"], "1"),
      ...Object.fromEntries(
        Object.entries(rates).map(([k, v]) => [`rates.${k}`, jsonString(v, "")]),
      ),
    };
  },

  fetch: (_config?: FetcherConfig): Promise<FetchResult> => {
    const base: string = process.env["FOREX_BASE"] ?? DEFAULT_BASE;
    const fetcherUrl: string =
      process.env["FETCHER_URL"] ?? DEFAULT_FETCHER_URL;

    // 1. Fetch raw data via fetcher Workers (fetch primitive)
    const sourceUrl = `https://api.frankfurter.app/latest?from=${base}`;
    const endpoint = `${fetcherUrl}/fetch?url=${encodeURIComponent(sourceUrl)}`;

    return fetch(endpoint).then((res) =>
      !res.ok
        ? Promise.reject(
            new Error(`fetcher: HTTP ${String(res.status)} from ${endpoint}`),
          )
        : res.json().then((body: unknown) => {
            const fetched = body as FetchResult;

            // 2. Extract raw rates from fetched data (fetcher returns float rates)
            const raw = fetched.data as Readonly<Record<string, Json>>;
            const rawRates =
              (raw["rates"] as Readonly<Record<string, Json>> | undefined) ?? {};
            const date = jsonString(raw["date"], "");
            const amount = Number(raw["amount"] ?? 1);

            // 3. Scale rates ×10^8 (feeds-layer responsibility, not fetcher's)
            const scaledRates = scaleRates(rawRates);

            // 4. Build normalized JSON + commit locally with scaled integers
            const normalized: Json = {
              base,
              date,
              amount,
              rates: scaledRates as unknown as Json,
            };

            const { canonical } = canonicalSort(normalized);
            const commitment = commitDeep(normalized, { maxDepth: 16 });

            return {
              source: "forex/frankfurter",
              fetchedAt: Date.now(),
              data: normalized,
              canonical,
              commitment,
            };
          }),
    );
  },
};
