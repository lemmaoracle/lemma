# Trust402 Seller Circuit — Design Evaluation

## Summary

**Recommendation: Approach A — Thin routing circuit (`listing-binding-v1`)**

The monolithic `listing-commitment-v1` (Approach B) mixes marketplace semantics (price, seller, category taxonomy) with data authenticity (content hashing). This is the wrong abstraction. A listing circuit should not encode *what* the content is — that's the per-schema circuit's job. The analyst's criticism is correct.

The thin routing circuit (`listing-binding-v1`) delegates content verification to existing per-schema circuits (blog-article-v1, future code-v1, data-v1) and focuses solely on **listing integrity**: proving that a specific content commitment, schema, price, and seller are bound together into a single listing root.

This approach:
- Composes with **all existing and future** per-schema circuits
- Follows the same architectural pattern as `role-spend-limit-v1` (which references `credentialCommitment` across circuits)
- Is the **minimal change** (~300 constraints, single Poseidon(5))
- Tells a clean product narrative: "content authenticity" and "listing integrity" are separate provable claims

---

## 1. Approach A — Thin Routing Circuit (`listing-binding-v1`)

### 1.1 Circuit Design

```
Circuit ID:     listing-binding-v1
Hash:           Poseidon(5)
Private inputs: sellerId, salt
Public inputs:  listingRoot, perSchemaCommitment, schemaId, priceUsdc

Constraint:
    listingRoot = Poseidon(5)(
        schemaId,             // which schema (e.g., "blog-article-v1")
        perSchemaCommitment,  // commitment from per-schema circuit
        priceUsdc,            // listing price in USDC smallest unit
        sellerId,             // seller identifier (private)
        salt                  // binding randomness
    )
```

**Constraint count:** ~300 constraints (single Poseidon(5) instance).

### 1.2 How It Composes with blog-article-v1

```
Seller flow:
  ┌─────────────────────────────────────────────────────┐
  │ 1. Normalize content (blog article → 5 attributes)  │
  │ 2. Prove blog-article-v1: "I know preimage of C"    │
  │    → Public output: commitment C                     │
  │ 3. Prove listing-binding-v1: "listingRoot binds      │
  │    schema + C + price + seller"                     │
  │    → Public output: listingRoot                      │
  │ 4. Publish listing: {listingRoot, schema, price, C} │
  └─────────────────────────────────────────────────────┘

Buyer flow:
  ┌─────────────────────────────────────────────────────┐
  │ 1. Fetch listing metadata + both proofs             │
  │ 2. Verify blog-article-v1 proof: C is valid commit  │
  │ 3. Verify listing-binding-v1 proof:                 │
  │    → listingRoot binds C + schema + price            │
  │    → schema matches listing metadata                │
  │    → price matches listing metadata                 │
  │ 4. (optional) Verify agent-identity proof:          │
  │    → seller is legitimate                           │
  └─────────────────────────────────────────────────────┘
```

**Key property:** `perSchemaCommitment` is a public signal in the listing circuit, so the verifier can directly check `blog-article-v1.output.commitment === listing-binding-v1.input.perSchemaCommitment`. Cross-proof correlation is cryptographically enforced.

### 1.3 Circom Source

```circom
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
 * (blog-article-v1, future code-v1, data-v1, etc.). Seller identity
 * is proven separately by agent-identity-v1.
 *
 * Private inputs:
 *   sellerId        Seller identifier (privacy-preserved in the listing)
 *   salt            Binding randomness
 *
 * Public inputs:
 *   listingRoot          The asserted Poseidon5 listing commitment
 *   perSchemaCommitment  Commitment from the per-schema circuit
 *                        (e.g., blog-article-v1 commitment)
 *   schemaId             Schema identifier (e.g., hash("blog-article-v1"))
 *   priceUsdc            Price in USDC smallest unit (6 decimals)
 *
 * Constraint (single Poseidon5):
 *   listingRoot = Poseidon5(schemaId, perSchemaCommitment, priceUsdc, sellerId, salt)
 */
template ListingBinding() {
    // ── Private inputs ──────────────────────────────────────────────
    signal input sellerId;
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
    hasher.inputs[3] <== sellerId;
    hasher.inputs[4] <== salt;

    hasher.out === listingRoot;
}

component main {public [listingRoot, perSchemaCommitment, schemaId, priceUsdc]} =
    ListingBinding();
```

### 1.4 Integration Surface

| Concern | Approach A | Approach B |
|---|---|---|
| Proofs to generate (seller) | 2 (per-schema + listing) | 1 |
| Proofs to verify (buyer) | 2-3 (per-schema + listing + optional identity) | 1 |
| New circuit constraints | ~300 | ~300–500 |
| Reuses blog-article-v1? | Yes, fully | No |
| Works with future schemas? | Yes, no circuit changes | No, new circuit per schema |
| SDK impact | Seller SDK orchestrates 2 proof generations | Seller SDK orchestrates 1 |

**The 2-proof overhead is acceptable** because:
1. Blog-article-v1 proofs are cached (content doesn't change)
2. Listing proofs are generated once per listing
3. Proof generation is sub-second for Poseidon-only circuits
4. The composability gain far outweighs the marginal proof generation cost

---

## 2. Approach B — Revised Monolithic `listing-commitment-v1`

### 2.1 Design

```
Template: ListingCommitment()
Hash:     Poseidon(N) where N depends on content schema
Private:  contentField1, contentField2, ..., sellerId, priceUsdc, salt
Public:   listingRoot, schemaId

Constraint:
    root = Poseidon(N)(...all content fields..., sellerId, priceUsdc, salt)
```

### 2.2 Evaluation

**Circuit complexity:**
- Blog article: Poseidon(8) — 5 content fields + sellerId + priceUsdc + salt
- Each content type needs its own N

**Integration surface:**
- Single proof covers everything — simpler SDK surface
- But: must re-implement content normalization INSIDE the listing builder
- Breaks the clean separation between content schemas and marketplace logic

**Composability:**
- Zero composability with existing per-schema circuits
- blog-article-v1 is already deployed; Approach B would orphan it
- Each new content type requires a new circuit (code-v1, data-v1, etc.)
- This is the exact anti-pattern the analyst criticized

**Trust402 narrative:**
- "One proof to rule them all" sounds simpler
- But conflates two distinct claims: "this content is authentic" and "this is a valid listing"
- Buyers should be able to verify authenticity independently of purchasing

### 2.3 Why Approach B Is Rejected

1. **Orphans existing circuits** — blog-article-v1 is deployed and works. Approach B replaces it rather than composing with it.
2. **No schema extensibility** — every new content type requires a new monolithic circuit. Approach A makes listing a generic layer that works with any per-schema circuit.
3. **Violates separation of concerns** — content authentication ≠ marketplace listing. These are distinct claims, proven by different entities, at different times.
4. **Design principle violation** — "Minimal change" is violated: Approach B requires replacing working circuits with larger ones. Approach A adds a ~300-constraint circuit that composes with what exists.

---

## 3. Approach C — Hybrid (Evaluated and Rejected)

**Idea:** Listing circuit with a generic "content digest" field (injecting the per-schema commitment as a single field element), keeping everything in one proof.

This is essentially Approach A collapsed into one proof — the listing circuit re-proves the per-schema commitment inside itself. This:
- Duplicates constraints (per-schema verification runs twice: once standalone, once inside listing)
- Violates "minimal change" and composability
- Creates a maintenance burden: every per-schema circuit change requires updating the listing circuit

**Rejected** for the same reasons as B, plus constraint duplication.

---

## 4. Concrete Implementation Plan

### 4.1 New Circuit

**Location:** `packages/roles/circuits/src/listing-binding.circom`

> Why `packages/roles/`? The `role-spend-limit-v1` circuit already lives here as the Trust402 gate circuit. The listing-binding circuit is the seller-side counterpart — both are Trust402 marketplace circuits. Co-locating them keeps Trust402 circuit concerns in one package.

### 4.2 Files to Create

| File | Purpose |
|---|---|
| `packages/roles/circuits/src/listing-binding.circom` | Circuit source |
| `packages/roles/circuits/test/listing-binding.test.ts` | Witness + proof generation tests |

### 4.3 Files to Modify

| File | Change |
|---|---|
| `packages/roles/circuits/scripts/build.sh` | Add listing-binding compilation step alongside role-spend-limit |

### 4.4 Build Script Pattern

Follow the existing `packages/roles/circuits/scripts/build.sh` pattern. Listing-binding needs:
- `pot12` (2^12 constraints — same as role-spend-limit, both use Poseidon + minimal comparators and fit comfortably)
- Groth16 setup
- Verification key export

### 4.5 Schema Registration (Lemma API)

After building, register with Lemma:
```typescript
await circuits.register(client, {
  circuitId: "listing-binding-v1",
  schema: "trust402-listing",
  description: "Trust402 listing integrity — binds content commitment + seller + price",
  // ... artifact URIs
});
```

### 4.6 SDK Changes (noted for awareness, out of scope for circuit design)

Seller SDK must:
1. Call `prepare` for per-schema circuit (blog-article-v1) → witness + proof
2. Call `prepare` for listing-binding-v1, passing `perSchemaCommitment` from step 1
3. Bundle both proofs in the listing

---

## 5. Comparison Matrix

| Dimension | Approach A (Thin routing) | Approach B (Revised monolithic) |
|---|---|---|
| Circuit constraints | ~300 | ~300–500 (varies by content type) |
| Proof size (Groth16) | 2 proofs (per-schema + listing) | 1 proof |
| Reuses blog-article-v1 | ✅ Fully | ❌ Orphans it |
| New content schemas | Zero circuit changes needed | New circuit per content type |
| SDK complexity | 2 prepare() calls | 1 prepare() call |
| Seller privacy | sellerId private in listing | sellerId private in listing |
| Content verification | Delegated to per-schema circuits | Baked into listing circuit |
| Architectural alignment | Composable, layered, pattern-consistent | Monolithic, conflates concerns |
| Launch narrative | "Prove your content is real, then prove it's listed" | "One proof covers everything" |
| Design principles | ✅ Minimal change, no widened visibility | ❌ Replaces working circuits |

---

## 6. Risk Assessment

### 6.1 Cross-proof Correlation Risk

**Risk:** Buyer receives two proofs (blog-article-v1 + listing-binding-v1) but the attacker substitutes a different per-schema proof.

**Mitigation:** The `perSchemaCommitment` is a **public signal** in the listing circuit. The buyer verifies:
```
blog-article-v1_proof.publicOutputs.commitment === listing-binding-v1_proof.publicInputs.perSchemaCommitment
```
This is a direct equality check in the verifier — no cryptographic trick needed. The commitment is bound into the listingRoot by the circuit constraint, so it cannot be swapped without invalidating the listing proof.

### 6.2 Seller Identity Risk

**Risk:** `sellerId` is private but unauthenticated. Anyone can claim any sellerId.

**Mitigation:** Seller identity is proven separately via the `agent-identity-v1` circuit. The listing circuit does not need to verify identity — it only needs to bind the listing to an identifier. The protocol layer (buyer) verifies:
1. `agent-identity-v1` proof → seller has valid credential → produces `credentialCommitment`
2. `listing-binding-v1` proof → listing binds to `sellerId`
3. Protocol checks: `sellerId` derivation from `credentialCommitment`

This is identical to how `role-spend-limit-v1` references `credentialCommitment` as a cross-circuit trust anchor.

### 6.3 Price Manipulation Risk

**Risk:** Seller lists at one price, generates proof at a different (lower) price, shows proof at lower price to bypass checks.

**Mitigation:** `priceUsdc` is a **public input** of the listing circuit. The verifier checks that the public `priceUsdc` matches the listing metadata. Any mismatch means the proof is invalid for that listing metadata. The seller cannot change the price after proof generation without generating a new proof.

### 6.4 Schema Mismatch Risk

**Risk:** Listing claims `schemaId: "blog-article-v1"` but the per-schema proof is from a different circuit.

**Mitigation:** The buyer's verifier checks that the per-schema proof's `circuitId` matches the listing's `schemaId`. This is an application-level check, not a circuit constraint — which is correct, because circuit constraints should not encode which circuits exist (that would be unbounded and break composability).

---

## 7. Decision

**Adopt Approach A — Thin routing circuit (`listing-binding-v1`).**

This is the minimal change that achieves the goal. It composes with existing circuits, follows established architectural patterns, and tells a clear product story: content authenticity and listing integrity are separate, independently verifiable claims.

The marginal cost of generating/verifying 2 proofs (per-schema + listing) instead of 1 is negligible (~300 extra constraints per listing at setup time, sub-second additional verification). The architectural benefits — composability, schema extensibility, and reuse of deployed circuits — decisively outweigh this cost.
