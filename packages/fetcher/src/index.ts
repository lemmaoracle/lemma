/**
 * @lemmaoracle/fetcher — OSS fetcher for Level 2 oracle data.
 *
 * Fetches external data sources, canonicalises the response with
 * canonical-sort-v1, and commits to it with data-commitment-v1.
 *
 * canonical-sort-v1 is resolved via the Lemma SDK schema registry.
 * data-commitment-v1.1 is resolved via the Lemma SDK circuit registry.
 * This package depends only on @lemmaoracle/sdk — no separate
 * canonical-sort or data-commitment packages are required.
 */
export { fetchAndCommit, fetchBatch } from "./fetch.js";
export type { FetchResult, FetcherConfig, FetchBatchResult } from "./fetch.js";

// Re-export the underlying primitives for convenience
export { commitDeep, canonicalSort, canonicalize, toScalar } from "@lemmaoracle/sdk";
export type { Json } from "@lemmaoracle/sdk";
export type { CommitResult, CommitDeepOptions } from "@lemmaoracle/sdk";
