pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * BlogArticleV1 — commitment-opening circuit for blog article attributes.
 *
 * Proves that the prover knows a set of article attributes whose Poseidon
 * hash matches the public `commitment`. This is the simplest useful circuit:
 * a future version can layer range proofs (freshness), membership proofs
 * (trusted author set), or content-length bounds on top.
 *
 * Attributes (5 field elements):
 *   authorHash     poseidon(utf8(author DID))
 *   published      unix timestamp in seconds
 *   integrityHash  poseidon(utf8(article body))
 *   words          word count
 *   langCode       numeric ISO 639-1 (en=1, ja=2, …)
 *
 * Public inputs:
 *   commitment     poseidon(authorHash, published, integrityHash, words, langCode)
 */
template BlogArticleV1() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input authorHash;
    signal input published;
    signal input integrityHash;
    signal input words;
    signal input langCode;

    // ── Public input ────────────────────────────────────────────────
    signal input commitment;

    // ── Constraint: commitment == poseidon(all private inputs) ──────
    component hasher = Poseidon(5);
    hasher.inputs[0] <== authorHash;
    hasher.inputs[1] <== published;
    hasher.inputs[2] <== integrityHash;
    hasher.inputs[3] <== words;
    hasher.inputs[4] <== langCode;

    commitment === hasher.out;
}

component main {public [commitment]} = BlogArticleV1();
