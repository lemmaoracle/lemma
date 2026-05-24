pragma circom 2.1.0;

include "circomlib/circuits/sha256/sha256.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

/**
 * SealIdentity — Proof-based sign-in for the Lemma developer dashboard.
 *
 * **v2 (nullifier)** — Replaces the v1 `keyHash` public output with a
 * per-session Poseidon nullifier. The `keyHash` is now an intermediate
 * signal that never appears in public signals, so neither the verifier
 * nor any network observer can link proofs to a specific API key or
 * correlate a user across sessions.
 *
 * Proves: "I hold the API key whose SHA-256 hash is registered in
 * `api_keys`," without revealing which key.
 *
 * The nullifier is derived as:
 *   nullifier = Poseidon(keyHash_hi, keyHash_lo, nonce)
 *
 * where `keyHash_hi` and `keyHash_lo` are the upper and lower 128 bits
 * of the SHA-256 digest, interpreted as BN254 field elements. Because
 * `nonce` is unique per session, the nullifier is unique per session —
 * even if the same API key generates two proofs in a row, the nullifiers
 * are unrelated.
 *
 * The dashboard BFF verifies the proof, then iterates over registered
 * `key_hash` values in D1, computing the expected nullifier for each
 * until it finds a match (O(N), Poseidon is ~300 constraints but
 * sub-millisecond in JS). This preserves the "key holder proves
 * identity" invariant while removing `keyHash` from the wire entirely.
 *
 *
 * Private input:
 *   keyBits[512]   Bit decomposition of the 64-byte ASCII API key,
 *                  most-significant-bit first within each byte.
 *
 * Public input:
 *   nonce          Dashboard-issued challenge nonce. Bound into the
 *                  constraint system so a proof cannot be replayed
 *                  against a different challenge.
 *
 * Public output:
 *   nullifier      Poseidon-keyed session nullifier. Unique per
 *                  (key, nonce) pair, reveals nothing about the key
 *                  or its hash.
 */
template SealIdentity(keyBytes) {
    var keyBitLen = keyBytes * 8;

    signal input keyBits[keyBitLen];
    signal input nonce;
    signal output nullifier;

    // Constrain every pre-image bit to be boolean. Without this a
    // malicious prover could feed non-binary field values into the
    // SHA-256 gadget and forge a witness.
    for (var i = 0; i < keyBitLen; i++) {
        keyBits[i] * (keyBits[i] - 1) === 0;
    }

    // SHA-256 over the API key bytes. circomlib's Sha256 handles message
    // padding internally; a 512-bit pre-image spans two 512-bit blocks.
    component sha = Sha256(keyBitLen);
    for (var i = 0; i < keyBitLen; i++) {
        sha.in[i] <== keyBits[i];
    }

    // keyHash is an intermediate signal — never exposed publicly.
    signal keyHash[256];
    for (var i = 0; i < 256; i++) {
        keyHash[i] <== sha.out[i];
    }

    // Split the 256-bit keyHash into two 128-bit field elements.
    // Bits2Num expects LSB-first input; keyHash is MSB-first (SHA-256
    // convention), so we reverse the bit order on connection.
    component hiBits = Bits2Num(128);
    component loBits = Bits2Num(128);
    for (var i = 0; i < 128; i++) {
        hiBits.in[i] <== keyHash[127 - i];
        loBits.in[i] <== keyHash[255 - i];
    }

    // Per-session nullifier: Poseidon(keyHash_hi, keyHash_lo, nonce).
    // Adds ~300 constraints (vs ~30,000 for an extra SHA-256).
    component hash = Poseidon(3);
    hash.inputs[0] <== hiBits.out;
    hash.inputs[1] <== loBits.out;
    hash.inputs[2] <== nonce;

    nullifier <== hash.out;

    // Bind the challenge nonce into the constraint system. The squaring
    // is otherwise meaningless — its only purpose is to make `nonce` a
    // constrained public signal, so the verifier knows the proof was
    // generated for this specific challenge.
    signal nonceBinding;
    nonceBinding <== nonce * nonce;
}

component main {public [nonce]} = SealIdentity(64);
