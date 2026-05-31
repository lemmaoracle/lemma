/**
 * @lemmaoracle/seal — ZK auth circuit for Lemma dashboard sign-in.
 *
 * `seal` lets a developer prove they hold a valid Lemma API key
 * without revealing it — or even *which* key. The dashboard BFF issues
 * a challenge nonce; the developer generates a proof whose public
 * output is a per-session Poseidon nullifier. The nullifier is unique
 * to the (secret, nonce) pair but reveals nothing about the secret or
 * its SHA-256 hash, so proofs cannot be correlated across sessions.
 *
 * The dashboard resolves identity by iterating registered `key_hash`
 * values and computing the expected nullifier until a match is found.
 *
 * The circuit (`circuits/src/seal-identity.circom`, v2) is registered
 * with the Lemma workers API as a normal circuit resource. This
 * package is a reference definition: it is published for developers
 * to generate proofs and is not imported by workers or the dashboard
 * at runtime.
 */

export type { Bit, SealProof, SealProofInput } from "./types.js";

export {
  SEAL_SECRET_BYTES,
  SEAL_SECRET_BITS,
  secretToBits,
  hashBitsToHex,
} from "./bits.js";

export { prove, verify, SEAL_CIRCUIT_ID } from "./proof.js";

export { sealVkey } from "./vkey.js";

/** The schema the seal circuit is registered against. */
export const SEAL_SCHEMA = "passthrough-v1";
