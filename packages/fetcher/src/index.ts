/**
 * @lemmaoracle/fetcher — OSS fetcher for Level 2 oracle data.
 *
 * Fetches external data sources, canonicalises the response with
 * canonical-sort-v1, and commits to it with data-commitment-v1.
 *
 * The canonicaliser and commitment scheme live in separate packages:
 *  - @lemmaoracle/canonical-sort  — canonical-sort-v1 (deterministic JSON)
 *  - @lemmaoracle/data-commitment — data-commitment-v1 (Poseidon Merkle)
 *
 * This package is the fetcher worker that ties them together.
 */
export { fetchAndCommit, fetchBatch } from "./fetch.js";
export type { FetchResult, FetcherConfig } from "./fetch.js";

// Re-export the underlying primitives for convenience
export { canonicalSort, canonicalize } from "@lemmaoracle/canonical-sort";
export { commitToData, verifyInclusion, extractPaths } from "@lemmaoracle/data-commitment";
export type { CanonicalOutput, Json } from "@lemmaoracle/canonical-sort";
export type { DataCommitment, DataLeafPreimage, PathValue } from "@lemmaoracle/data-commitment";
