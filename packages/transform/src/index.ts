/**
 * @lemmaoracle/transform — Public API surface.
 *
 * ZK circuit for verifiable file transformation execution proof with
 * infinite-depth chaining.
 */

// Types
export type {
  ExecutionRecord,
  TransformWitness,
  TransformProofInput,
} from "./schema.js";

// Schema utilities
export { toPublicSignals, toPrivateInputs, toWitnessInput } from "./schema.js";

// Runner
export {
  fileHash,
  fileCommitment,
  sha256Field,
  computeArgsHash,
  buildGenesisRecord,
  buildChainedRecord,
  verifyChain,
} from "./runner.js";
export type { TransformFn } from "./runner.js";
