pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * ListingBindingV2 — proves listing integrity AND institutional membership
 * in a single proof.
 *
 * Circuit ID: listing-binding-v2
 *
 * Replaces the original listing-binding-v1 (listing integrity only).
 * Filename is listing-binding.circom; versioning lives in the circuit ID.
 *
 * Public inputs:
 *   listingRoot   — Poseidon5 listing commitment
 *   commitment    — content commitment (from any content circuit)
 *   orgDid        — institution's DID (field element)
 *   memberRoot    — Poseidon Merkle root of institution's members
 *   schemaId      — schema identifier (field element)
 *   priceUsdc     — price in micro-USDC
 *
 * Private inputs:
 *   authorDid — seller's personal DID (field element)
 *   salt          — binding randomness
 *   merklePath    — Merkle siblings (leaf → root)
 *   merkleIndices — direction bits (0 = left, 1 = right)
 *   memberSalt    — salt for the member's leaf
 *
 * Constraints:
 *   (1) listingRoot === Poseidon5(schemaId, commitment, priceUsdc, orgDid, salt)
 *   (2) memberRoot === MerkleVerify(Poseidon2(authorDid, memberSalt), ...)
 *   (3) No constraint on commitment contents — content circuit's job
 *
 * Tree depth nLevels is a compile-time parameter (default 20 = 2^20 leaves).
 */

// ── MerkleProofChecker (Poseidon2 nodes; quadratic Mux) ─────────────

template MerkleProofChecker(nLevels) {
    signal input leaf;
    signal input root;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];

    component hashers[nLevels];
    signal levelHashes[nLevels + 1];
    // Intermediate for quadratic mux: s * (sibling - current)
    signal muxDiff[nLevels];

    levelHashes[0] <== leaf;

    var i;
    for (i = 0; i < nLevels; i++) {
        // pathIndices must be boolean
        pathIndices[i] * (pathIndices[i] - 1) === 0;

        // s=0 → left=current, right=sibling
        // s=1 → left=sibling, right=current
        muxDiff[i] <== pathIndices[i] * (pathElements[i] - levelHashes[i]);

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== levelHashes[i] + muxDiff[i];
        hashers[i].inputs[1] <== pathElements[i] - muxDiff[i];

        levelHashes[i + 1] <== hashers[i].out;
    }

    levelHashes[nLevels] === root;
}

// ── ListingBindingV2 ────────────────────────────────────────────────

template ListingBindingV2(nLevels) {
    // ── Private inputs ──────────────────────────────────────────────
    signal input authorDid;
    signal input salt;
    signal input merklePath[nLevels];
    signal input merkleIndices[nLevels];
    signal input memberSalt;

    // ── Public inputs ───────────────────────────────────────────────
    signal input listingRoot;
    signal input commitment;
    signal input orgDid;
    signal input memberRoot;
    signal input schemaId;
    signal input priceUsdc;

    // ── (1) Listing integrity ───────────────────────────────────────
    component listingHasher = Poseidon(5);
    listingHasher.inputs[0] <== schemaId;
    listingHasher.inputs[1] <== commitment;
    listingHasher.inputs[2] <== priceUsdc;
    listingHasher.inputs[3] <== orgDid;
    listingHasher.inputs[4] <== salt;

    listingHasher.out === listingRoot;

    // ── (2) Membership inclusion ────────────────────────────────────
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== authorDid;
    leafHasher.inputs[1] <== memberSalt;

    component merkle = MerkleProofChecker(nLevels);
    merkle.leaf <== leafHasher.out;
    merkle.root <== memberRoot;

    var i;
    for (i = 0; i < nLevels; i++) {
        merkle.pathElements[i] <== merklePath[i];
        merkle.pathIndices[i] <== merkleIndices[i];
    }
}

// Default: 20 levels = 2^20 ≈ 1M max members.
component main {
    public [listingRoot, commitment, orgDid, memberRoot, schemaId, priceUsdc]
} = ListingBindingV2(20);
