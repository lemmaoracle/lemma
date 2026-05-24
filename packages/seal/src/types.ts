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
  /** Public signals: `[nullifier, nonce]` as decimal strings. */
  publicSignals: ReadonlyArray<string>;
  /**
   * Per-session Poseidon nullifier (decimal string). Unique to the
   * (api key, nonce) pair; reveals neither the key nor its hash.
   * The server resolves identity by matching this against expected
   * nullifiers computed from registered key hashes.
   */
  nullifier: string;
}>;
