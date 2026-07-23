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
import type { CommitResult, Json } from "@lemmaoracle/sdk";
import type { FeedSource, CompositeFetchResult } from "../types.js";
import { frankfurterForex } from "./forex.js";
import { erApiForex } from "./forex-er-api.js";

// ── configuration ─────────────────────────────────────────────────────────

const DEFAULT_BASE = "USD";

// ── helpers ───────────────────────────────────────────────────────────────

const extractRates = (
  data: Json,
): Readonly<Record<string, number>> => {
  const obj = data as Readonly<Record<string, Json>>;
  const r = obj["rates"] as Readonly<Record<string, Json>> | undefined;
  return Object.fromEntries(
    Object.entries(r ?? {}).map(([k, v]) => [k, Number(v)]),
  );
};

const extractRoot = (result: FetchResult): string =>
  (result.commitment as CommitResult).root;

const extractRandomness = (result: FetchResult): string =>
  (result.commitment as CommitResult).randomness;

const extractLeafPreimages = (result: FetchResult) =>
  (result.commitment as CommitResult).leafPreimages;

const extractInclusionProofs = (result: FetchResult) =>
  (result.commitment as CommitResult).inclusionProofs;

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

    // NOTE: src_* attributes removed — er-api ToS prohibits redistribution
    // of raw source rates.  Only Merkle roots (hashes) are included.

    return attrs;
  },

  fetch: async (): Promise<FetchResult> => {
    const base = process.env["FOREX_BASE"] ?? DEFAULT_BASE;

    // 1. Fetch both sources in parallel (each commits locally)
    const [srcA, srcB] = await Promise.all([
      frankfurterForex.fetch(),
      erApiForex.fetch(),
    ]) as [FetchResult, FetchResult];

    // 2. Extract rates and roots
    const ratesA = extractRates(srcA.data);
    const ratesB = extractRates(srcB.data);
    const rootA = extractRoot(srcA);
    const rootB = extractRoot(srcB);

    // 3. Currency intersection
    const currencies = Object.keys(ratesA).filter((c) => c in ratesB);
    if (currencies.length === 0) {
      throw new Error("forex/composite: no common currencies between sources");
    }

    // 4. Average scaled rates (they're already scaled integers from source feeds)
    const averagedRates: Record<string, number> = {};
    for (const ccy of currencies) {
      const v1 = ratesA[ccy]!;
      const v2 = ratesB[ccy]!;
      averagedRates[ccy] = Math.round((v1 + v2) / 2);
    }

    const date = String(
      (srcA.data as Readonly<Record<string, Json>>)["date"] ?? "",
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
    const commitment = commitDeep(merged, { maxDepth }) as CommitResult;

    return {
      source: "forex/composite",
      fetchedAt: Date.now(),
      data: merged,
      canonical,
      commitment,
    };
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
export const fetchComposite = async (): Promise<CompositeFetchResult> => {
  const base = process.env["FOREX_BASE"] ?? DEFAULT_BASE;

  // 1. Fetch both sources in parallel (each commits locally)
  const [srcA, srcB] = await Promise.all([
    frankfurterForex.fetch(),
    erApiForex.fetch(),
  ]) as [FetchResult, FetchResult];

  // 2. Extract rates and commitments
  const ratesA = extractRates(srcA.data);
  const ratesB = extractRates(srcB.data);

  // 3. Currency intersection
  const currencies = Object.keys(ratesA).filter((c) => c in ratesB);
  if (currencies.length === 0) {
    throw new Error("forex/composite: no common currencies between sources");
  }

  // 4. Average scaled rates
  const averagedRates: Record<string, number> = {};
  for (const ccy of currencies) {
    const v1 = ratesA[ccy]!;
    const v2 = ratesB[ccy]!;
    averagedRates[ccy] = Math.round((v1 + v2) / 2);
  }

  const date = String(
    (srcA.data as Readonly<Record<string, Json>>)["date"] ?? "",
  );

  // 5. Build source commitments
  const sources = {
    frankfurter: {
      root: extractRoot(srcA),
      randomness: extractRandomness(srcA),
      leafPreimages: extractLeafPreimages(srcA),
      inclusionProofs: extractInclusionProofs(srcA),
    },
    erApi: {
      root: extractRoot(srcB),
      randomness: extractRandomness(srcB),
      leafPreimages: extractLeafPreimages(srcB),
      inclusionProofs: extractInclusionProofs(srcB),
    },
  };

  const sourceRoots = {
    frankfurter: extractRoot(srcA),
    erApi: extractRoot(srcB),
  };

  return {
    feedId: "forex/composite",
    date,
    base,
    averagedRates,
    sources,
    sourceRoots,
  };
};
