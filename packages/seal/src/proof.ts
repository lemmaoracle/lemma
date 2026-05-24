/**
 * Seal proof generation and verification (v2: nullifier-based).
 *
 * Dashboard sign-in flow:
 *   1. The BFF issues a challenge `nonce`.
 *   2. The developer runs {@link generateSealProof} with their API key.
 *   3. The BFF verifies the proof, reads the `nullifier`, and resolves
 *      the caller's scope by matching it against registered key hashes.
 *
 * snarkjs is imported lazily so that consumers who only need the pure
 * bit helpers ({@link apiKeyToBits} etc.) do not pay for it.
 */

import type { CircuitSignals } from "snarkjs";
import { apiKeyToBits } from "./bits.js";
import type { SealArtifacts, SealProof, SealProofInput } from "./types.js";

/**
 * Generate a groth16 proof that the caller holds the API key behind a
 * registered `key_hash`, bound to the given challenge `nonce`.
 *
 * The returned `nullifier` is a per-session Poseidon fingerprint that
 * reveals neither the key nor its SHA-256 hash. The server resolves
 * identity by iterating registered key hashes and computing the
 * expected nullifier until a match is found.
 *
 * Requires the compiled circuit artifacts — build them with
 * `npm run build` in `packages/seal/circuits` (see the package README).
 */
export const generateSealProof = async (
  input: SealProofInput,
  artifacts: SealArtifacts,
): Promise<SealProof> => {
  const { groth16 } = await import("snarkjs");
  const witness: CircuitSignals = {
    keyBits: apiKeyToBits(input.apiKey).map(Number),
    nonce: input.nonce,
  };
  const { proof, publicSignals } = await groth16.fullProve(
    witness,
    artifacts.wasm,
    artifacts.zkey,
  );
  return {
    proof,
    publicSignals,
    // Public signals: [nullifier, nonce]
    nullifier: publicSignals[0] ?? "",
  };
};

/**
 * Verify a seal proof against the circuit verification key. Resolves to
 * the attested `nullifier` and `nonce` on success, or `null` if invalid.
 */
export const verifySealProof = async (
  proof: SealProof,
  verificationKey: Readonly<Record<string, unknown>>,
): Promise<Readonly<{ nullifier: string; nonce: string }> | null> => {
  const { groth16 } = await import("snarkjs");
  const ok = await groth16.verify(
    verificationKey,
    [...proof.publicSignals],
    proof.proof,
  );
  return ok
    ? {
        nullifier: proof.publicSignals[0] ?? "",
        nonce: proof.publicSignals[1] ?? "",
      }
    : null;
};
