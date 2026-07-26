/**
 * Types for @lemmaoracle/feeds — pluggable data feed sources.
 *
 * Each feed source is a module that fetches data from an external API
 * and produces a data-commitment-v1 commitment.  Feed sources are
 * designed to be independently packageable so third parties can publish
 * their own feeds as npm packages that plug into the Lemma oracle.
 */

import type { FetchResult, FetcherConfig } from "@lemmaoracle/fetcher";
import type { LeafPreimage, InclusionProof } from "@lemmaoracle/sdk";

/**
 * A single data feed source.
 *
 * Implementations fetch data from an external source (REST API, WebSocket,
 * etc.) and return a FetchResult (`request` / `response` / `commitment`)
 * containing the canonicalised data and data-commitment-v1 commitment.
 *
 * The `id` field uniquely identifies the feed (e.g. "forex/frankfurter").
 * Feed IDs follow the pattern `{category}/{authority}` for namespace clarity.
 */
export type FeedSource = Readonly<{
  /** Unique feed identifier (e.g. "forex/frankfurter"). */
  readonly id: string;
  /** Human-readable label for logging / display. */
  readonly label: string;
  /** Category for grouping (e.g. `"forex"`, `"weather"`, `"crypto"`). */
  readonly category: string;
  /** Fetch data and return a committed result. */
  readonly fetch: (config?: FetcherConfig) => Promise<FetchResult>;
  /** Extract a unique document identifier from fetched data (e.g. date string). */
  readonly getDocumentId: (data: import("@lemmaoracle/sdk").Json) => string;
  /** Extra attributes for document registration. */
  readonly getAttributes?: (data: import("@lemmaoracle/sdk").Json) => Record<string, string>;
}>;

/**
 * Result of running a feed through the collector.
 */
export type FeedRunResult = Readonly<{
  /** Feed identifier. */
  feedId: string;
  /** When the run started (Unix ms). */
  startedAt: number;
  /** When the run completed (Unix ms). */
  completedAt: number;
  /** The fetch result from the feed source, or null on failure. */
  result: FetchResult | null;
  /** Error message if the run failed. */
  error: string | null;
}>;

/**
 * Subset of a source feed's CommitResult needed for composite proofs.
 */
export type SourceCommitment = Readonly<{
  root: string;
  randomness: string;
  leafPreimages: ReadonlyArray<LeafPreimage>;
  inclusionProofs: ReadonlyArray<InclusionProof>;
}>;

/**
 * Result of fetching the composite feed with full source commitments.
 */
export type CompositeFetchResult = Readonly<{
  feedId: string;
  date: string;
  base: string;
  /** Averaged scaled rates (already ×10^8 integers). */
  averagedRates: Readonly<Record<string, number>>;
  /** Source commitments keyed by source name. */
  sources: Readonly<Record<string, SourceCommitment>>;
  /** Source Merkle roots keyed by source name. */
  sourceRoots: Readonly<Record<string, string>>;
}>;
