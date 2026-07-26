/**
 * Forex composite feed — multi-source average.
 *
 * Fetches Frankfurter + ExchangeRate-API independently, matches currency
 * pairs, and commits to the arithmetic mean using the SDK's commitDeep.
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
 *   4. forex-average-v1 circuit verifies averageRate === (rateA + rateB) / 2
 *
 * Per the ExchangeRate-API Terms of Service, raw source rates are NOT
 * redistributed via attributes (no `src_*` attributes).  Only Merkle
 * roots (which are cryptographic hashes) are included.
 */

import type { FetchResult } from "@lemmaoracle/fetcher";
import { canonicalSort, commitDeep } from "@lemmaoracle/sdk";
import type { Json } from "@lemmaoracle/sdk";
import type { FeedSource, CompositeFetchResult } from "../types.js";
import { frankfurterForex } from "./forex.js";
import { erApiForex } from "./forex-er-api.js";

// ── configuration ─────────────────────────────────────────────────────────

const DEFAULT_BASE = "USD";

// ── helpers ───────────────────────────────────────────────────────────────

const jsonString = (v: Json | undefined, fallback: string): string =>
  typeof v === "string"
    ? v
    : typeof v === "number" || typeof v === "boolean"
      ? String(v)
      : fallback;

const extractRates = (
  data: Json,
): Readonly<Record<string, number>> => {
  const obj = data as Readonly<Record<string, Json>>;
  const r = obj["rates"] as Readonly<Record<string, Json>> | undefined;
  return Object.fromEntries(
    Object.entries(r ?? {}).map(([k, v]) => [k, Number(v)]),
  );
};

const averageRates = (
  ratesA: Readonly<Record<string, number>>,
  ratesB: Readonly<Record<string, number>>,
  currencies: ReadonlyArray<string>,
): Readonly<Record<string, number>> =>
  Object.fromEntries(
    currencies.map((ccy) => {
      const v1 = ratesA[ccy] ?? 0;
      const v2 = ratesB[ccy] ?? 0;
      return [ccy, Math.round((v1 + v2) / 2)];
    }),
  );

const requireCommonCurrencies = (
  ratesA: Readonly<Record<string, number>>,
  ratesB: Readonly<Record<string, number>>,
): Promise<ReadonlyArray<string>> => {
  const currencies = Object.keys(ratesA).filter((c) => c in ratesB);
  return currencies.length === 0
    ? Promise.reject(
        new Error("forex/composite: no common currencies between sources"),
      )
    : Promise.resolve(currencies);
};

// ── feed source ───────────────────────────────────────────────────────────

export const forexComposite: FeedSource = {
  id: "forex/composite",
  label: "Forex Composite (Frankfurter ⊕ ExchangeRate-API average)",
  category: "forex",

  getDocumentId: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    return jsonString(obj["date"], "unknown");
  },

  getAttributes: (data) => {
    const obj = data as Readonly<Record<string, Json>>;
    const rates =
      (obj["rates"] as Readonly<Record<string, Json>> | undefined) ?? {};
    const sourceRoots =
      (obj["sourceRoots"] as Readonly<Record<string, Json>> | undefined) ?? {};
    const date = jsonString(obj["date"], "");

    return {
      source: "forex-composite",
      base: jsonString(obj["base"], ""),
      date,
      ...Object.fromEntries(
        Object.entries(sourceRoots).map(([k, v]) => [
          `sourceRoot.${k}`,
          jsonString(v, ""),
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(rates).map(([ccy, val]) => [
          `rates.${ccy}`,
          jsonString(val, ""),
        ]),
      ),
      // NOTE: src_* attributes removed — er-api ToS prohibits redistribution
      // of raw source rates.  Only Merkle roots (hashes) are included.
    };
  },

  fetch: (_config?: import("@lemmaoracle/fetcher").FetcherConfig): Promise<FetchResult> => {
    const base = process.env["FOREX_BASE"] ?? DEFAULT_BASE;

    // 1. Fetch both sources in parallel (each commits locally)
    return Promise.all([frankfurterForex.fetch(), erApiForex.fetch()]).then(
      ([srcA, srcB]) => {
        // 2. Extract rates and roots
        const ratesA = extractRates(srcA.response.data);
        const ratesB = extractRates(srcB.response.data);
        const rootA = srcA.commitment.root;
        const rootB = srcB.commitment.root;

        // 3–4. Currency intersection + average scaled rates
        return requireCommonCurrencies(ratesA, ratesB).then((currencies) => {
          const averagedRates = averageRates(ratesA, ratesB, currencies);
          const date = jsonString(
            (srcA.response.data as Readonly<Record<string, Json>>)["date"],
            "",
          );

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
          const fetchedAt = Date.now();

          return {
            request: {
              url: "forex/composite",
              fetchedAt,
              date: new Date(fetchedAt).toISOString().slice(0, 10),
            },
            response: { data: merged, canonical },
            commitment,
          };
        });
      },
    );
  },
};

// ── composite fetch (for average proof pipeline) ──────────────────────────

/**
 * Fetch both source feeds and return composite data with full source
 * commitments (roots, randomness, leaf preimages, inclusion proofs).
 *
 * Used by `runAverageProofPipeline` to generate forex-average-v1 proofs
 * that verify `averageRate === (rateA + rateB) / 2` with Merkle inclusion
 * in both source trees.
 */
export const fetchComposite = (
  _?: undefined,
): Promise<CompositeFetchResult> => {
  const base = process.env["FOREX_BASE"] ?? DEFAULT_BASE;

  // 1. Fetch both sources in parallel (each commits locally)
  return Promise.all([frankfurterForex.fetch(), erApiForex.fetch()]).then(
    ([srcA, srcB]) => {
      // 2. Extract rates and commitments
      const ratesA = extractRates(srcA.response.data);
      const ratesB = extractRates(srcB.response.data);

      // 3–4. Currency intersection + average scaled rates
      return requireCommonCurrencies(ratesA, ratesB).then((currencies) => {
        const averagedRates = averageRates(ratesA, ratesB, currencies);
        const date = jsonString(
          (srcA.response.data as Readonly<Record<string, Json>>)["date"],
          "",
        );

        // 5. Build source commitments
        const sources = {
          frankfurter: {
            root: srcA.commitment.root,
            randomness: srcA.commitment.randomness,
            leafPreimages: srcA.commitment.leafPreimages,
            inclusionProofs: srcA.commitment.inclusionProofs,
          },
          erApi: {
            root: srcB.commitment.root,
            randomness: srcB.commitment.randomness,
            leafPreimages: srcB.commitment.leafPreimages,
            inclusionProofs: srcB.commitment.inclusionProofs,
          },
        };

        const sourceRoots = {
          frankfurter: srcA.commitment.root,
          erApi: srcB.commitment.root,
        };

        return {
          feedId: "forex/composite",
          date,
          base,
          averagedRates,
          sources,
          sourceRoots,
        };
      });
    },
  );
};
