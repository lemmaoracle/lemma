/**
 * @lemmaoracle/data-commitment — data-commitment-v1 commitment scheme.
 *
 * Poseidon Merkle tree over path-value pairs from arbitrary JSON.
 *
 * Exports:
 *  - `commitToData` — compute commitment for a JSON value
 *  - `verifyInclusion` — non-ZK verification of a value in a commitment
 *  - `extractPaths` — extract path-value pairs from JSON
 *  - Types: DataCommitment, DataLeafPreimage, PathValue, Json
 */
export { commitToData, verifyInclusion, extractPaths } from "./commit.js";
export type {
  DataCommitment,
  DataLeafPreimage,
  PathValue,
} from "./types.js";
export type { Json } from "@lemmaoracle/canonical-sort";
