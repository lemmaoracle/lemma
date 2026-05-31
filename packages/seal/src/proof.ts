/**
 * Seal proof generation and verification (v2: nullifier-based).
 *
 * Dashboard sign-in flow:
 *   1. The BFF issues a challenge `nonce`.
 *   2. The developer runs {@link prove} with their secret.
 *   3. The BFF verifies the proof, reads the `nullifier`, and resolves
 *      the caller's scope by matching it against registered key hashes.
 *
 * Both prove and verify delegate to `@lemmaoracle/sdk`, which handles
 * circuit artifact resolution and snarkjs orchestration. The vkey for
 * verification is resolved internally from the bundled JSON.
 */

import { create, prover, verifier } from "@lemmaoracle/sdk";
import { secretToBits } from "./bits.js";
import vkey from "./vkey.js";
import type { SealProof, SealProofInput } from "./types.js";

/** The circuit id under which seal v2 is registered with the Lemma API. */
export const SEAL_CIRCUIT_ID = "seal-identity-v1";

type VerifyResult = Readonly<{ nullifier: string; nonce: string }>;

/**
 * Generate a groth16 proof that the caller holds the secret behind a
 * registered `key_hash`, bound to the given challenge `nonce`.
 *
 * The returned `nullifier` is a per-session Poseidon fingerprint that
 * reveals neither the secret nor its SHA-256 hash. The server resolves
 * identity by iterating registered key hashes and computing the
 * expected nullifier until a match is found.
 *
 * Circuit artifacts (wasm, zkey) are resolved automatically via the
 * Lemma SDK from `circuitId: "seal-identity-v1"`. No local artifact
 * paths are required.
 */
export const prove = async (input: SealProofInput): Promise<SealProof> => {
  const client = create({});
  const witness = {
    keyBits: secretToBits(input.secret).map(Number),
    nonce: input.nonce,
  };
  const { proof, inputs } = await prover.prove(client, {
    circuitId: SEAL_CIRCUIT_ID,
    witness,
  });
  return {
    proof: JSON.parse(atob(proof)),
    publicSignals: inputs,
    nullifier: inputs[0] ?? "",
  };
};

/**
 * Verify a seal proof against the bundled circuit verification key.
 *
 * Resolves to the attested `nullifier` and `nonce` on success, or
 * `null` if invalid. Delegates to `@lemmaoracle/sdk` verifier.
 */
export const verify = async (
  proof: SealProof,
): Promise<VerifyResult | null> => {
  const { ok } = await verifier.verify({
    alg: "groth16-bn254-snarkjs",
    inputs: {
      vkey,
      proof: proof.proof,
      publicSignals: proof.publicSignals,
    },
  });
  return ok
    ? {
        nullifier: proof.publicSignals[0] ?? "",
        nonce: proof.publicSignals[1] ?? "",
      }
    : null;
};
