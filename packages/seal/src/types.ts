/**
 * @lemmaoracle/seal — public types for generating dashboard sign-in proofs.
 */

import type { Groth16Proof } from "snarkjs";

/** A single bit (0 or 1). */
export type Bit = 0 | 1;

/** Inputs required to generate a seal sign-in proof. */
export type SealProofInput = Readonly<{
  /** The raw API key string — a 64-character lowercase hex string. */
  apiKey: string;
  /** The dashboard-issued challenge nonce, as a decimal string. */
  nonce: string;
}>;

/** Filesystem paths (or URLs) of the compiled circuit artifacts. */
export type SealArtifacts = Readonly<{
  /** Path/URL to `seal-identity.wasm`. */
  wasm: string;
  /** Path/URL to `seal-identity_final.zkey`. */
  zkey: string;
}>;

/** A groth16 proof together with its public signals. */
export type SealProof = Readonly<{
  /** The groth16 proof object (snarkjs shape). */
  proof: Groth16Proof;
  /** Public signals: the 256 `keyHash` bits followed by `nonce`. */
  publicSignals: ReadonlyArray<string>;
  /** The SHA-256 `key_hash` (64-char hex) this proof attests to. */
  keyHash: string;
}>;
