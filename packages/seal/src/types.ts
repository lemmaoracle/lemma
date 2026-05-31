/**
 * @lemmaoracle/seal — public types for generating dashboard sign-in proofs.
 */

import type { Groth16Proof } from "snarkjs";

/** A single bit (0 or 1). */
export type Bit = 0 | 1;

/** Inputs required to generate a seal sign-in proof. */
export type SealProofInput = Readonly<{
  /** The raw secret — a 64-character lowercase hex string. */
  secret: string;
  /** The dashboard-issued challenge nonce, as a decimal string. */
  nonce: string;
}>;

/** A groth16 proof together with its public signals. */
export type SealProof = Readonly<{
  /** The groth16 proof object (snarkjs shape). */
  proof: Groth16Proof;
  /** Public signals: `[nullifier, nonce]` as decimal strings. */
  publicSignals: ReadonlyArray<string>;
  /**
   * Per-session Poseidon nullifier (decimal string). Unique to the
   * (secret, nonce) pair; reveals neither the secret nor its hash.
   * The server resolves identity by matching this against expected
   * nullifiers computed from registered key hashes.
   */
  nullifier: string;
}>;
