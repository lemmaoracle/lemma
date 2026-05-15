/**
 * Seal proof generation and verification.
 *
 * Dashboard sign-in flow:
 *   1. The BFF issues a challenge `nonce`.
 *   2. The developer runs {@link generateSealProof} with their API key.
 *   3. The BFF runs {@link verifySealProof} and reads the attested
 *      `keyHash` to resolve the caller's scope.
 *
 * snarkjs is imported lazily so that consumers who only need the pure
 * bit helpers ({@link apiKeyToBits} etc.) do not pay for it.
 */

import type { CircuitSignals } from "snarkjs";
import { apiKeyToBits, hashBitsToHex } from "./bits.js";
import type { SealArtifacts, SealProof, SealProofInput } from "./types.js";

/** Number of `keyHash` bits at the head of the public signal vector. */
const KEY_HASH_BITS = 256;

/**
 * Generate a groth16 proof that the caller knows the API key whose
 * SHA-256 hash is `keyHash`, bound to the given challenge `nonce`.
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
    keyHash: hashBitsToHex(publicSignals.slice(0, KEY_HASH_BITS)),
  };
};

/**
 * Verify a seal proof against the circuit verification key. Resolves to
 * the attested `keyHash` and `nonce` on success, or `null` if invalid.
 */
export const verifySealProof = async (
  proof: SealProof,
  verificationKey: Readonly<Record<string, unknown>>,
): Promise<Readonly<{ keyHash: string; nonce: string }> | null> => {
  const { groth16 } = await import("snarkjs");
  const ok = await groth16.verify(
    verificationKey,
    [...proof.publicSignals],
    proof.proof,
  );
  return ok
    ? {
        keyHash: hashBitsToHex(proof.publicSignals.slice(0, KEY_HASH_BITS)),
        nonce: proof.publicSignals[KEY_HASH_BITS] ?? "",
      }
    : null;
};
