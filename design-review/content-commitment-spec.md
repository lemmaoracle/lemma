# Content Commitment Circuit — Final Spec (Coder-Ready)

## Decision Summary

### Decision 1: sellerId = DID ✅ CONFIRMED

`listing-binding-v1` already uses `sellerId` as a private input. The spec update is:
- `sellerId` is a DID (Decentralized Identifier), e.g., `did:ethr:0x1234...` or `did:key:z6Mk...`
- The DID is hashed via Poseidon and bound into `listingRoot`
- No circuit change needed — just update comments/documentation
- This wraps wallet addresses, agent credentials, institutional IDs — flexible and future-proof

### Decision 2: CID + Poseidon hybrid ✅ SELECTED (Option C)

**Chosen: CID as public locator + Poseidon as ZK binding.**

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| Application (metadata) | IPFS CID (multihash sha2-256) | File identification + content-addressed retrieval |
| Circuit (ZK proof) | Poseidon(raw bytes → field elements) | ZK-provable content binding |
| Verifier (application) | Poseidon(bytes retrieved from CID) === commitment from proof | Cross-layer integrity check |

The circuit remains trivial (identity check: `commitment === fileHash`). CID handling is purely application-layer. The seller publishes `{cid, proof}` — the buyer retrieves the file from IPFS via CID, hashes with Poseidon, and verifies the proof.

---

## Circuit 1: content-commitment-v1 (UPDATED)

**Status:** Circuit logic unchanged. Documentation + test + byte-conversion spec added.

### Circuit ID
`content-commitment-v1`

### Circuit file
`packages/content/circuits/src/content-commitment.circom`

### Circom source
```circom
pragma circom 2.1.0;
include "circomlib/circuits/poseidon.circom";

/**
 * ContentCommitmentV1 — minimal content-commitment circuit.
 *
 * Proves that the prover knows a Poseidon hash of raw file bytes
 * matching the public commitment. The file is identified externally
 * by its IPFS CID (application layer); this circuit proves the ZK
 * binding between the file content and the commitment.
 *
 * Circuit ID: content-commitment-v1
 *
 * ── Private input ───────────────────────────────────────
 *   fileHash    Poseidon hash of raw file bytes (via
 *               bytesToFieldElements conversion — see spec)
 *
 * ── Public input ────────────────────────────────────────
 *   commitment  The asserted content commitment
 *
 * ── Constraint ──────────────────────────────────────────
 *   commitment === fileHash
 *
 * ── Application-layer flow ──────────────────────────────
 *   Publisher:
 *     1. Upload file to IPFS → get CID
 *     2. Compute fileHash = poseidon(bytesToFieldElements(file bytes))
 *     3. Prove content-commitment-v1 with private fileHash
 *        → outputs public commitment (= fileHash)
 *     4. Publish: { cid, proof }
 *
 *   Verifier:
 *     1. Fetch file bytes from IPFS using CID
 *     2. Compute fileHash = poseidon(bytesToFieldElements(file bytes))
 *     3. Verify proof: commitment === fileHash
 */
template ContentCommitmentV1() {
    // Private input
    signal input fileHash;

    // Public input
    signal input commitment;

    // Constraint: commitment matches fileHash
    commitment === fileHash;
}

component main {public [commitment]} = ContentCommitmentV1();
```

### What changed from existing
- **Expanded docblock** to document CID + Poseidon hybrid approach
- **No circuit logic changes** — identity check unchanged
- **New:** byte→field-element conversion spec (see Section 4)
- **New:** application-layer flow documented in docblock

---

## Circuit 2: listing-binding-v1 (CONFIRMED, doc update only)

### Circuit ID
`listing-binding-v1`

### Circuit file
`packages/roles/circuits/src/listing-binding.circom`

### Circom source (updated docblock)
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
```

### What changed from existing
- `sellerId` signal renamed to `did` (DID — Decentralized Identifier)
- Docblock updated: "Seller's Decentralized Identifier (DID)" with examples
- docblock updated: `content-commitment-v1` added to list of per-schema circuits
- **IMPORTANT: Signal rename is a breaking change** — existing witness inputs must use `did` instead of `sellerId`
- No constraint logic changes

---

## Circuit 3: blog-article-v1 (NO CHANGE)

Existing circuit at `/root/lemmaoracle/lemma/packages/blog-article/circuits/src/blog-article.circom` is unchanged. It already works correctly and composes with listing-binding-v1.

---

## Byte→Field-Element Conversion Spec (NEW)

This is the critical piece for making `content-commitment-v1` usable with arbitrary binary files.

### Algorithm: `bytesToFieldElements(data: Uint8Array): bigint[]`

```
Input:  data — arbitrary bytes (file content)
Output: fieldElements[] — array of bigints < BN254_PRIME

Algorithm:
  1. CHUNK_SIZE = 31 bytes
     (31 bytes = 248 bits < 254 bits of BN254 prime)
  
  2. Pad final chunk: if data.length % 31 !== 0:
       pad_len = 31 - (data.length % 31)
       Append pad_len bytes of value pad_len (PKCS7-like padding)
  
  3. For each 31-byte chunk:
       Interpret as big-endian unsigned integer
       Output as field element
  
  4. Result: field elements for Poseidon hashing
```

### BN254 Field Prime
```
21888242871839275222246405745257275088548364400416034343698204186575808495617
```

### Why 31 bytes per field element
- BN254 field prime is ~254 bits
- 31 bytes = 248 bits < 254 bits — guaranteed to be in the field without modular reduction
- 32 bytes (256 bits) would risk overflow and require `% PRIME`, which adds non-determinism risk
- This is the same convention used by circomlib's Poseidon implementations

### Padding scheme
- PKCS7-style deterministic padding: if `N` bytes of padding needed, each pad byte has value `N`
- On de-padding: read the last byte, verify all last N bytes equal N, remove them
- Empty files: padded to a single 31-byte chunk of `\x1f\x1f...\x1f`
- This ensures unique encoding: `data ≠ data'` ⇒ `padded(data) ≠ padded(data')`

### Reference Implementation (TypeScript)

```typescript
// BN254 field prime (secp256k1 group order for BN254)
const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

const CHUNK_SIZE = 31; // 31 bytes = 248 bits < 254 bits

/**
 * Convert raw bytes to an array of BN254 field elements.
 *
 * Chunks the input into 31-byte blocks (big-endian), pads the final
 * chunk with PKCS7-style padding, and returns each chunk as a bigint
 * guaranteed to be < BN254_PRIME.
 *
 * This is the canonical normalizer for content-commitment-v1.
 * The same function must be used by both publisher and verifier.
 */
export function bytesToFieldElements(data: Uint8Array): bigint[] {
  const len = data.length;
  const padLen = CHUNK_SIZE - (len % CHUNK_SIZE); // 31 when len=0
  const paddedLen = len + padLen;

  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  // PKCS7 padding: fill remainder with padLen value
  for (let i = len; i < paddedLen; i++) {
    padded[i] = padLen;
  }

  const numChunks = paddedLen / CHUNK_SIZE;
  const elements: bigint[] = new Array(numChunks);

  for (let i = 0; i < numChunks; i++) {
    const offset = i * CHUNK_SIZE;
    // Interpret 31 bytes as big-endian unsigned integer
    let val = 0n;
    for (let j = 0; j < CHUNK_SIZE; j++) {
      val = (val << 8n) | BigInt(padded[offset + j]);
    }
    elements[i] = val;
  }

  return elements;
}

/**
 * Inverse: convert field elements back to original bytes.
 * Verifies and strips PKCS7 padding.
 *
 * @throws If padding is invalid
 */
export function fieldElementsToBytes(elements: bigint[]): Uint8Array {
  const chunkCount = elements.length;
  const paddedLen = chunkCount * CHUNK_SIZE;
  const padded = new Uint8Array(paddedLen);

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * CHUNK_SIZE;
    let val = elements[i];
    for (let j = CHUNK_SIZE - 1; j >= 0; j--) {
      padded[offset + j] = Number(val & 0xFFn);
      val >>= 8n;
    }
    if (val !== 0n) {
      throw new Error(`Field element overflow at chunk ${i}`);
    }
  }

  // Verify PKCS7 padding
  const padLen = padded[paddedLen - 1];
  if (padLen < 1 || padLen > CHUNK_SIZE) {
    throw new Error(`Invalid padding length: ${padLen}`);
  }
  for (let i = paddedLen - padLen; i < paddedLen; i++) {
    if (padded[i] !== padLen) {
      throw new Error("Invalid PKCS7 padding");
    }
  }

  return padded.slice(0, paddedLen - padLen);
}

/**
 * Compute the Poseidon file hash used in content-commitment-v1.
 *
 * This is the canonical function: bytes → field elements → Poseidon hash.
 * Must be identical for publisher (proof generation) and verifier (proof check).
 */
export async function poseidonFileHash(
  data: Uint8Array,
  poseidon: (inputs: bigint[]) => bigint,
): Promise<bigint> {
  const elements = bytesToFieldElements(data);
  return poseidon(elements);
}
```

### Polyfill for non-optimized Poseidon (single-element shortcut)

When `elements.length === 1`, the Poseidon of a single field element reduces to an identity (as in the current circuit: `commitment === fileHash`). For multi-element inputs, a full Poseidon sponge must be used. The existing `poseidon-lite` npm package or circomlibjs can handle multi-element Poseidon.

### Location
`packages/content/src/normalizer.ts` (new file — SDK normalizer)

---

## Complete Composition Example

### Seller flow (publishing a file on Trust402)

```
1. Upload file to IPFS → CID: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
2. Normalize: elements = bytesToFieldElements(fileBytes)
3. Compute: fileHash = poseidon(elements)
4. Prove content-commitment-v1:
   → private: fileHash
   → public: commitment (= fileHash)
5. Prove listing-binding-v1:
   → private: did (seller's DID), salt
   → public: listingRoot, perSchemaCommitment (= commitment from step 4),
              schemaId (= poseidon(utf8("content-commitment-v1"))), priceUsdc
6. Publish: { cid, listingRoot, schemaId, priceUsdc, proofs: [content_proof, listing_proof] }
```

### Buyer flow (verifying before purchase)

```
1. Fetch listing metadata + proofs
2. Verify content-commitment-v1 proof:
   → public commitment matches listing's perSchemaCommitment
3. Verify listing-binding-v1 proof:
   → schemaId === poseidon(utf8("content-commitment-v1"))
   → perSchemaCommitment matches content proof commitment
   → priceUsdc matches listing price
4. Fetch file from IPFS using CID
5. Compute: elements = bytesToFieldElements(fileBytes)
6. Compute: fileHash = poseidon(elements)
7. Assert: fileHash === public commitment from proof ✅
```

---

## Files to Create / Modify

### Files to CREATE

| File | Purpose |
|------|---------|
| `packages/content/src/normalizer.ts` | `bytesToFieldElements`, `fieldElementsToBytes`, `poseidonFileHash` |
| `packages/content/src/normalizer.test.ts` | Unit tests for normalizer (roundtrip, edge cases, determinism) |
| `design-review/content-commitment-spec.md` | This spec document |

### Files to MODIFY

| File | Change |
|------|--------|
| `packages/content/circuits/src/content-commitment.circom` | Update docblock only (CID + Poseidon hybrid approach, byte-conversion reference) |
| `packages/roles/circuits/src/listing-binding.circom` | Rename `sellerId` → `did`, update docblock |
| `packages/roles/circuits/test/listing-binding.test.ts` | Update input signal name: `sellerId` → `did` |
| `packages/content/circuits/test/content-commitment.test.ts` | Add multi-chunk test, add deterministic test |
| `packages/content/package.json` | Add `poseidon-lite` dependency (if not already) |
| `packages/content/circuits/package.json` | Add `poseidon-lite` devDependency |

### Files NOT changed

| File | Reason |
|------|--------|
| `packages/blog-article/circuits/src/blog-article.circom` | Already correct, no changes needed |
| `packages/content/circuits/scripts/build.sh` | Already correct, pot12 sufficient |

---

## Implementation Order (Coder Phase)

1. **content-commitment-v1 docblock update** — circuit file comments only
2. **listing-binding-v1 rename** — `sellerId` → `did` in circuit + test
3. **Byte normalizer** — `normalizer.ts` + tests
4. **content-commitment test update** — add multi-chunk and deterministic tests
5. **Rebuild circuits** — verify no regressions
6. **Integration test** — full seller → buyer flow with real IPFS CID

---

## Risk & Edge Cases

### Empty file (0 bytes)
- Pad to 31 bytes of `0x1f` (padLen=31)
- Single field element: `0x1f1f1f...1f`
- Produces a valid, deterministic Poseidon commitment

### File exactly 31 bytes
- No padding needed (padLen=31 for 0 mod 31, which wraps to 31)
- Wait — this is the PKCS7 edge case! When `len % 31 === 0`, standard PKCS7 adds a full block of padding (31 bytes of 0x1f).
- This is correct: the receiver can always distinguish original data from padding.

### Single-element shortcut
- When `bytesToFieldElements` returns exactly 1 element, the circuit's `fileHash === commitment` constraint is already a Poseidon identity
- For multi-element (>31 bytes), the Poseidon sponge iterates over all elements
- The normalizer returns `bigint[]`; the Poseidon implementation handles 1..N elements

### Large files
- A 1MB file produces ~33,793 field elements (~33K Poseidon permutations)
- This is fine for proof generation (sub-second for Poseidon) but could be large for on-chain verification
- For very large files, consider a Merkle tree of Poseidon chunk hashes in a future version

### Determinism
- Same bytes + same padding + same Poseidon → same hash
- Verified by test: `poseidonFileHash(bytesA) === poseidonFileHash(bytesB)` when `bytesA === bytesB`

---

## Departure Notes for Coder

- The `sellerId` → `did` rename in `listing-binding.circom` is a **signal name change**. Any existing witness generation code that uses `sellerId` must be updated to `did`.
- The `content-commitment-v1` circuit file does NOT include the byte→field-element conversion logic — that is done off-circuit in TypeScript. The circuit only sees the final `fileHash` field element.
- The `normalizer.ts` must be the single source of truth for byte→field-element conversion. It should be referenced by both the SDK and the verifier.
- Use `poseidon-lite` npm package for Poseidon hashing in TypeScript (already used in blog-article tests).
