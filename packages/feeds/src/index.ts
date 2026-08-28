/**
 * @lemmaoracle/feeds — pluggable data feed sources for Lemma Oracle.
 *
 * Each feed source fetches data from an external API and produces a
 * data-commitment-v1 commitment.  Feed sources are designed to be
 * independently packageable so third parties can create and publish
 * their own feeds.
 *
 * Current built-in feeds:
 *  - forex/frankfurter — ECB reference exchange rates
 *  - forex/er-api      — ExchangeRate-API free tier
 *  - forex/composite   — multi-source average
 *
 * Usage:
 *   import { feeds, runFeed } from "@lemmaoracle/feeds";
 *   const result = await runFeed("forex/frankfurter");
 */

// Re-export from fetcher for convenience
export type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";

// Own types
export type { FeedSource, FeedRunResult, SourceCommitment, CompositeFetchResult } from "./types.js";

// Feed registry
export { findFeed, listFeeds, runFeed } from "./registry.js";

// Individual feed sources
export { frankfurterForex } from "./feeds/forex.js";
export { erApiForex } from "./feeds/forex-er-api.js";
export { forexComposite, fetchComposite } from "./feeds/forex-composite.js";
export { jpHolidays } from "./feeds/jp-holidays.js";
export { jpPostalCodes } from "./feeds/jp-postal-codes.js";
export {
  domainDns,
  lemmaTxtName,
  concatTxtChunks,
  parseLemmaTxt,
  txtAnswers,
  lemmaAnswer,
  buildSnapshot as buildDomainVerifySnapshot,
} from "./feeds/domain-dns.js";
export type {
  DomainVerifyRecord,
  DomainVerifySnapshot,
} from "./feeds/domain-dns.js";

// Pipeline
export { runProofPipeline, runMultiPipeline, runAverageProofPipeline } from "./pipeline.js";
export type { PipelineConfig, PipelineResult, MultiPipelineResult } from "./pipeline.js";

// Trust402 listing (forex/composite daily snapshot)
export {
  listForexCompositeTrust402,
  listingTitle,
  utcDate,
  DEFAULT_LATEST_URL,
  DEFAULT_FETCHER_URL,
} from "./list-forex-composite-trust402.js";
export type {
  ListForexCompositeConfig,
  ListForexCompositeResult,
  ListingReceipt,
} from "./list-forex-composite-trust402.js";
