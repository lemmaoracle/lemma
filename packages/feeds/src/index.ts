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
 *
 * Usage:
 *   import { feeds, runFeed } from "@lemmaoracle/feeds";
 *   const result = await runFeed("forex/frankfurter");
 */

// Re-export from fetch for convenience
export type { FetchResult, FetcherConfig } from "@lemmaoracle/fetch";

// Own types
export type { FeedSource, FeedRunResult } from "./types.js";

// Feed registry
export { findFeed, listFeeds, runFeed } from "./registry.js";

// Individual feed sources
export { frankfurterForex } from "./feeds/forex.js";
