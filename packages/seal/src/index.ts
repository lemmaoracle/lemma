/**
 * @lemmaoracle/seal — ZK auth circuit for Lemma dashboard sign-in.
 *
 * `seal` lets a developer prove knowledge of their Lemma API key
 * without revealing it. The dashboard BFF issues a challenge nonce, the
 * developer generates a proof, and the BFF resolves the attested
 * SHA-256 `key_hash` to a `scope_id`.
 *
 * The circuit (`circuits/src/seal-identity.circom`) is registered with
 * the Lemma workers API as a normal circuit resource. This package is a
 * reference definition: it is published for developers to generate
 * proofs and is not imported by workers or the dashboard at runtime.
 */

export type {
  Bit,
  SealArtifacts,
  SealProof,
  SealProofInput,
} from "./types.js";

export {
  SEAL_KEY_BYTES,
  SEAL_KEY_BITS,
  apiKeyToBits,
  hashBitsToHex,
} from "./bits.js";

export { generateSealProof, verifySealProof } from "./proof.js";

/** The circuit id under which seal is registered with the Lemma API. */
export const SEAL_CIRCUIT_ID = "seal-identity-v1";

/** The schema the seal circuit is registered against. */
export const SEAL_SCHEMA = "passthrough-v1";
