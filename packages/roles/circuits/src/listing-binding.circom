pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";

/**
 * ListingBinding — proves listing integrity: that schema, content
 * commitment, price, and seller identity are bound together into
 * a single listingRoot.
 *
 * Circuit ID: listing-binding-v1
 *
 * This circuit is the thin routing layer for Trust402 listings.
 * Content authenticity is proven separately by per-schema circuits
 * (blog-article-v1, content-commitment-v1, future code-v1, data-v1, etc.).
 * Seller identity is proven separately by agent-identity-v1.
 *
 * Private inputs:
 *   did             Seller's Decentralized Identifier (DID).
 *                   E.g., did:ethr:0x1234..., did:key:z6Mk...
 *                   Poseidon(utf8(did)) is bound into listingRoot.
 *                   The DID itself is privacy-preserved in the listing.
 *   salt            Binding randomness
 *
 * Public inputs:
 *   listingRoot          The asserted Poseidon5 listing commitment
 *   perSchemaCommitment  Commitment from the per-schema circuit
 *                        (e.g., blog-article-v1 or content-commitment-v1)
 *   schemaId             Schema identifier (e.g., poseidon(utf8("blog-article-v1")))
 *   priceUsdc            Price in USDC smallest unit (6 decimals)
 *
 * Constraint (single Poseidon5):
 *   listingRoot = Poseidon5(schemaId, perSchemaCommitment, priceUsdc, did, salt)
 */
template ListingBinding() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input did;
    signal input salt;

    // ── Public inputs ───────────────────────────────────────────────
    signal input listingRoot;
    signal input perSchemaCommitment;
    signal input schemaId;
    signal input priceUsdc;

    // ── Listing integrity constraint ────────────────────────────────
    component hasher = Poseidon(5);
    hasher.inputs[0] <== schemaId;
    hasher.inputs[1] <== perSchemaCommitment;
    hasher.inputs[2] <== priceUsdc;
    hasher.inputs[3] <== did;
    hasher.inputs[4] <== salt;

    hasher.out === listingRoot;
}

component main {public [listingRoot, perSchemaCommitment, schemaId, priceUsdc]} =
    ListingBinding();
