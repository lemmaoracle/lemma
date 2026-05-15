pragma circom 2.1.0;

include "circomlib/circuits/sha256/sha256.circom";

/**
 * SealIdentity — Proof-based sign-in for the Lemma developer dashboard.
 *
 * Proves knowledge of the pre-image of an API key hash without revealing
 * the key. The pre-image is the raw API key string; the hash is the
 * SHA-256 `key_hash` stored in the workers `api_keys` D1 table.
 *
 * This matches the hashing in workers `middleware/auth.ts`:
 *   key_hash = SHA-256( utf8_bytes(apiKey) )
 *
 * Lemma API keys are 32 random bytes rendered as a 64-character
 * lowercase hex string (see workers `generate_api_key.js`), so the
 * SHA-256 pre-image is exactly 64 ASCII bytes = 512 bits.
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
 *   keyHash[256]   SHA-256 digest bits. The dashboard BFF reassembles
 *                  these into the hex `key_hash` and looks it up in
 *                  `api_keys` to resolve the caller's `scope_id`.
 */
template SealIdentity(keyBytes) {
    var keyBitLen = keyBytes * 8;

    signal input keyBits[keyBitLen];
    signal input nonce;
    signal output keyHash[256];

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
    for (var i = 0; i < 256; i++) {
        keyHash[i] <== sha.out[i];
    }

    // Bind the challenge nonce into the constraint system. The squaring
    // is otherwise meaningless — its only purpose is to make `nonce` a
    // constrained public signal, so the verifier knows the proof was
    // generated for this specific challenge.
    signal nonceBinding;
    nonceBinding <== nonce * nonce;
}

component main {public [nonce]} = SealIdentity(64);
