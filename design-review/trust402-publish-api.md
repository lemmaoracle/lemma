# Trust402 Publish API — Design Document

## Overview

This document specifies the Trust402 Publish API layer: SDK proof orchestration, content-type registry, API endpoints, and dashboard publish flow. It bridges the gap between the existing circuits (blog-article-v1, content-commitment-v1, listing-binding-v1) and a functional seller experience.

## 1. SDK Proof Orchestration

### 1.1 New Namespace: `trust402`

A single top-level SDK namespace that hides the 2-proof complexity from users. Exported from `@lemmaoracle/sdk` as a new namespace — same pattern as `documents`, `proofs`, `schemas`, `circuits`.

```typescript
// packages/sdk/src/namespaces/trust402.ts
export const publish = (
  client: LemmaClient,
  input: Trust402PublishInput,
): Promise<Trust402Listing>;
```

**Principle**: users make one call. The orchestration is internal.

### 1.2 Public Types

```typescript
// Users identify content by file or by type+payload
type ContentInput =
  | Readonly<{ type: "file"; file: File }>
  | Readonly<{ type: "blog-article"; payload: BlogArticlePayload }>
  | Readonly<{ type: "generic"; mimeType: string; payload: Uint8Array | string }>;

type PriceInput = Readonly<{
  amount: number;     // in USDC smallest unit (6 decimals), e.g. 42000000 = $42.00
  currency: "USDC";
}>;

type IdentityInput = Readonly<{
  did: string;        // e.g. "did:ethr:0x..."
}>;

type Trust402PublishInput = Readonly<{
  content: ContentInput;
  price: PriceInput;
  identity: IdentityInput;
  metadata?: Readonly<{
    title?: string;
    version?: string;
    description?: string;
  }>;
  /** Salt for listing-binding proof. Auto-generated if omitted. */
  salt?: string;
}>;

type Trust402Listing = Readonly<{
  listingRoot: string;
  schemaId: string;           // per-schema circuit ID (e.g. "blog-article-v1")
  commitment: string;         // per-schema proof commitment (public output)
  price: PriceInput;
  cid?: string;               // IPFS CID (content-commitment paths only)
  perSchemaProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  listingBindingProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  metadata?: Readonly<{
    title?: string;
    version?: string;
    description?: string;
  }>;
  createdAt: number;          // unix timestamp ms
}>;
```

### 1.3 Internal Orchestration (`publish`)

The `publish` function chains 2 proofs transparently:

```
Step 0: selectCircuit(input.content) → { circuitId, schema, needsCID }
         Uses content-type registry (Section 2).

Step 1: Per-schema proof
         ├── buildPerSchemaWitness(content, circuit)
         ├── prover.prove(client, { circuitId, witness })
         ├── extract commitment from proof.publicSignals[0]
         └── proofs.submit(client, { docHash, circuitId, proof, inputs })

Step 2: Listing-binding proof
         ├── schemaId = toScalar(circuitId)
         ├── priceUsdc = toScalar(price.amount)
         ├── did = toScalar(identity.did)
         ├── salt = toScalar(salt ?? randomHex(32))
         ├── listingRoot = poseidon5(schemaId, commitment, priceUsdc, did, salt)
         ├── witness = { did, salt, listingRoot, perSchemaCommitment: commitment,
         │               schemaId, priceUsdc }
         ├── prover.prove(client, { circuitId: "listing-binding-v1", witness })
         └── proofs.submit(client, { docHash: listingRoot, circuitId: "listing-binding-v1", ... })

Step 3: Return Trust402Listing
```

**Key design decisions**:
- Uses existing `prover.prove()` (which handles snarkjs + fallback internally) — no need for Relay here since SDK runs client-side/browser
- `proofs.submit()` for Lemma registration — existing endpoint
- Position-independent public signal extraction: the per-schema commitment is always `publicSignals[0]` for both blog-article-v1 and content-commitment-v1
- For content-commitment-v1: additionally compute IPFS CID via application-layer hashing (SHA-256 of file bytes), stored as `cid` on the listing

### 1.4 Per-Schema Witness Builders

Each content type needs a witness builder that converts user input → circuit witness struct.

#### blog-article-v1 witness

```typescript
// Internal helper — not exported
const buildBlogArticleWitness = (payload: BlogArticlePayload): Record<string, unknown> => {
  const authorHash = toScalar(payload.author);      // utf8(DID) → field element
  const published = BigInt(payload.published);       // unix timestamp
  const integrityHash = toScalar(payload.body);     // utf8(body) → field element
  const words = BigInt(payload.words);               // word count
  const langCode = langMap[payload.lang] ?? 0n;     // en→1, ja→2, ...
  const commitment = poseidon5([authorHash, published, integrityHash, words, langCode]);

  return {
    authorHash: authorHash.toString(),
    published: published.toString(),
    integrityHash: integrityHash.toString(),
    words: words.toString(),
    langCode: langCode.toString(),
    commitment: commitment.toString(),
  };
};
```

#### content-commitment-v1 witness

For generic files (image, video, CSV, code), use Poseidon hash of bytes via `bytesToFieldElements`:
- Split file into 31-byte chunks (31 bytes = 248 bits < BN254 prime)
- `poseidon2` fold iteratively: `Poseidon2(chunk[i], accumulator)`
- Then `Poseidon1(fileHash)` as the circuit constraint requires

```typescript
// Internal helper — not exported
const buildContentCommitmentWitness = (fileBytes: Uint8Array): Record<string, unknown> => {
  const fileHash = bytesToFieldElement(fileBytes);   // iterative Poseidon2 reduction
  const commitment = poseidon([fileHash]);            // Poseidon1 wrapping

  return {
    fileHash: fileHash.toString(),
    commitment: commitment.toString(),
  };
};
```

## 2. Content-Type Registry

### 2.1 Design

A simple registry that maps content types to per-schema circuits. Lives in `packages/sdk/src/namespaces/trust402.ts` as a private constant.

```typescript
type ContentMapping = Readonly<{
  circuitId: string;
  schema: string;            // schema for document registration
  /** Whether this path requires IPFS CID computation */
  needsCID: boolean;
}>;

const CONTENT_REGISTRY: Record<string, ContentMapping> = {
  "blog-article": {
    circuitId: "blog-article-v1",
    schema: "blog-article-v1",
    needsCID: false,
  },
  default: {
    circuitId: "content-commitment-v1",
    schema: "passthrough-v1",
    needsCID: true,
  },
};
```

### 2.2 MIME Type → Content Type Detection

For `ContentInput.type: "file"`, detect the content type from the File object:

```typescript
const MIME_TO_CONTENT_TYPE: Record<string, string> = {
  "image/": "image",
  "video/": "video",
  "text/csv": "csv",
  "application/json": "code",
  "text/plain": "code",
  "text/html": "code",
  "text/javascript": "code",
  "text/typescript": "code",
  "application/xml": "code",
  "text/markdown": "code",
};
```

All unmatched MIME types default to `"generic"` → content-commitment-v1. The mapping is internal and not part of the public API surface. File type-specific optimization (e.g., an `image-v1` circuit) can be added later without changing the public API.

### 2.3 Selection Logic

```typescript
const selectCircuit = (content: ContentInput): ContentMapping =>
  content.type === "blog-article"
    ? CONTENT_REGISTRY["blog-article"]
    : content.type === "file"
    ? detectCircuitFromFile(content.file)
    : CONTENT_REGISTRY.default;
```

### 2.4 Extensibility

Future per-schema circuits (e.g., `image-v1`, `code-v1`, `data-v1`) are added by:
1. Registering the circuit with Lemma API
2. Adding a mapping entry to `CONTENT_REGISTRY`
3. Adding a witness builder function
4. No public API changes required

## 3. Listing API Endpoints

### 3.1 Background

The web package (`packages/web`) is an Astro static site — no server-side logic. The Lemma Workers API (`workers.lemma.workers.dev`) is the authoritative backend. Trust402 listing CRUD should live alongside existing `/v1/` endpoints.

However, listing storage is fundamentally different from document/proof registration:
- Listings are **application-layer metadata** tied to proofs
- They need search/list capabilities (by seller DID, schema, price range, listingRoot)
- They are mutable (price updates, status changes)

**Decision**: Add Trust402 listing endpoints to the Lemma Workers API (`packages/workers`). The web dashboard calls these via client-side fetch + SDK.

### 3.2 Endpoint Specifications

All endpoints require `Authorization: Bearer <apiKey>`.

#### `POST /v1/trust402/listings` — Create a listing

```typescript
// Request
type CreateListingRequest = Readonly<{
  listingRoot: string;
  schemaId: string;
  commitment: string;
  price: PriceInput;
  cid?: string;
  perSchemaProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  listingBindingProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  metadata?: Readonly<{
    title?: string;
    version?: string;
    description?: string;
  }>;
  identity: IdentityInput;
  /** Testnet / production */
  network?: "testnet" | "production";
}>;

// Response
type CreateListingResponse = Readonly<{
  status: "created";
  listingRoot: string;
  createdAt: string;  // ISO 8601
}>;
```

Server-side validation:
- Verify both proofs via Lemma's proof verification
- Cross-check: `perSchemaCommitment` (public in listing-binding proof) === `commitment` (public in per-schema proof)
- Store listing metadata + proof references

#### `GET /v1/trust402/listings` — List/search listings

```typescript
// Query params (all optional)
type ListListingsQuery = Readonly<{
  did?: string;              // filter by seller DID (hashed)
  schema?: string;           // filter by schema circuitId
  network?: "testnet" | "production";
  minPrice?: number;
  maxPrice?: number;
  limit?: number;            // default 20, max 100
  offset?: number;           // default 0
}>;

// Response
type ListListingsResponse = Readonly<{
  results: ReadonlyArray<{
    listingRoot: string;
    schemaId: string;
    price: PriceInput;
    cid?: string;
    metadata?: Readonly<{
      title?: string;
      version?: string;
      description?: string;
    }>;
    createdAt: string;
  }>;
  hasMore: boolean;
}>;
```

**Privacy**: `did` is hashed server-side (keccak256). The endpoint accepts a hashed DID for filtering. Seller DIDs are NOT returned in the public listing response — only `listingRoot`, schema, price, CID (if applicable), and metadata.

#### `GET /v1/trust402/listings/:listingRoot` — Get a listing

```typescript
type GetListingResponse = Readonly<{
  listingRoot: string;
  schemaId: string;
  commitment: string;
  price: PriceInput;
  cid?: string;
  perSchemaProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  listingBindingProof: {
    circuitId: string;
    proof: string;
    inputs: ReadonlyArray<string>;
  };
  metadata?: Readonly<{
    title?: string;
    version?: string;
    description?: string;
  }>;
  createdAt: string;
}>;
```

Returns full listing including both proofs for buyer-side verification.

#### `POST /v1/trust402/listings/:listingRoot/verify` — Verify listing proofs

```typescript
// No request body needed — the listing's stored proofs are verified
type VerifyListingResponse = Readonly<{
  status: "valid" | "invalid";
  perSchemaVerified: boolean;
  bindingVerified: boolean;
  crossCheckPassed: boolean;
  details?: Readonly<{
    perSchemaError?: string;
    bindingError?: string;
    crossCheckError?: string;
  }>;
}>;
```

Server-side verification:
1. Verify per-schema proof → extract commitment
2. Verify listing-binding proof → extract perSchemaCommitment
3. Cross-check: commitment === perSchemaCommitment

### 3.3 SDK Client Methods (New)

Exposed under the `trust402` namespace in `@lemmaoracle/sdk`:

```typescript
export const list = (
  client: LemmaClient,
  query?: ListListingsQuery,
): Promise<ListListingsResponse> =>
  get<ListListingsResponse>(client)("/v1/trust402/listings")(query);

export const getById = (
  client: LemmaClient,
  listingRoot: string,
): Promise<GetListingResponse> =>
  get<GetListingResponse>(client)(
    `/v1/trust402/listings/${encodeURIComponent(listingRoot)}`,
  )();

export const verify = (
  client: LemmaClient,
  listingRoot: string,
): Promise<VerifyListingResponse> =>
  post<VerifyListingResponse>(client)(
    `/v1/trust402/listings/${encodeURIComponent(listingRoot)}/verify`,
  )({});
```

## 4. Publish Flow (User-Facing)

### 4.1 Dashboard Form Mapping

The existing non-functional `Trust402SellDashboardTemplate.astro` dashboard has these fields:

| Form Field | Maps to | Circuit/SDK Role |
|:--|:--|:--|
| File upload (drop zone) | `ContentInput` → content type detection | Selects per-schema circuit |
| Title | `metadata.title` | Stored in listing metadata |
| Version selector | `metadata.version` | Stored in listing metadata |
| Price per use | `PriceInput` | `priceUsdc` public input in listing-binding |
| Publish as (individual/institution) | `IdentityInput.did` | `did` private input in listing-binding |

### 4.2 Functional Dashboard Integration

```html
<!-- Script block in Trust402SellDashboardTemplate.astro -->
<script type="module">
  import { create, trust402 } from "@lemmaoracle/sdk";

  const client = create({ apiBase: "https://workers.lemma.workers.dev", apiKey: getUserApiKey() });

  const form = document.getElementById("db-form");
  const publishBtn = form.querySelector(".btn-primary");

  publishBtn.addEventListener("click", async () => {
    // 1. Gather form data
    const file = getFileFromDropzone();     // from file drop zone
    const title = form.querySelector("input[type='text']").value;
    const version = form.querySelector("select").value;
    const priceInput = form.querySelector(".price-in input");
    const priceAmount = parseFloat(priceInput.value);
    const publishAs = form.querySelector("select:last-of-type").value; // "you" | "inst"

    // 2. Resolve DID from publish-as selection
    const did = publishAs === "you"
      ? getUserDID()      // from wallet/identity
      : getInstitutionDID();

    // 3. Build content input
    const content = file
      ? { type: "file", file }
      : { type: "generic", mimeType: "text/csv", payload: csvContent };

    // 4. One call does everything
    publishBtn.disabled = true;
    publishBtn.textContent = "Generating proofs...";

    try {
      const listing = await trust402.publish(client, {
        content,
        price: { amount: Math.round(priceAmount * 1_000_000), currency: "USDC" },
        identity: { did },
        metadata: { title, version },
      });

      // 5. Refresh dashboard
      publishBtn.textContent = "✅ Published!";
      addListingToTable(listing);
    } catch (err) {
      publishBtn.disabled = false;
      publishBtn.textContent = "❌ Failed — retry";
    }
  });
</script>
```

### 4.3 Progressive States

The publish button transitions through states visible to the user:

```
"Generate proof & publish →"
  → "Computing commitment..."          (per-schema witness build)
  → "Generating content proof..."      (prover.prove for per-schema)
  → "Registering content proof..."     (proofs.submit)
  → "Generating listing proof..."      (prover.prove for listing-binding)
  → "Publishing..."                    (proofs.submit + POST listing)
  → "✅ Published!"                     (done)
  → "❌ Error: <message>"              (on failure, with retry)
```

### 4.4 Content Type Detection from File

When a file is dropped, the dashboard detects the content type client-side:

```typescript
const detectContentType = (file: File): string =>
  file.type.startsWith("image/") ? "image" :
  file.type.startsWith("video/") ? "video" :
  file.type === "text/csv" ? "csv" :
  file.type.includes("json") || file.type.includes("javascript") ||
  file.type.includes("xml") || file.type.includes("html") ? "code" :
  file.name.endsWith(".csv") ? "csv" :
  file.name.endsWith(".json") || file.name.endsWith(".jsonl") ? "code" :
  file.name.endsWith(".md") ? "code" :
  "generic";
```

The dashboard can show a small badge like "📄 CSV · content-commitment-v1" or "📝 Blog · blog-article-v1" next to the file drop zone after detection.

## 5. Public API Surface Summary

### 5.1 SDK Exports (New)

Added to `packages/sdk/src/index.ts`:

```typescript
export * as trust402 from "./namespaces/trust402.js";
```

And re-export types:

```typescript
export type {
  Trust402PublishInput,
  Trust402Listing,
  Trust402ListingsQuery,
  Trust402ListingsResponse,
  Trust402VerifyResponse,
} from "./namespaces/trust402.js";
```

### 5.2 SDK Namespace Surface

```typescript
// packages/sdk/src/namespaces/trust402.ts

// Primary operation: publish a listing (2-proof orchestration)
export const publish: (
  client: LemmaClient,
  input: Trust402PublishInput,
) => Promise<Trust402Listing>;

// Query operations (thin wrappers around HTTP)
export const list: (
  client: LemmaClient,
  query?: Trust402ListingsQuery,
) => Promise<Trust402ListingsResponse>;

export const getById: (
  client: LemmaClient,
  listingRoot: string,
) => Promise<Trust402Listing>;

export const verify: (
  client: LemmaClient,
  listingRoot: string,
) => Promise<Trust402VerifyResponse>;

// Content type detection (utility, can be used before publish)
export const detectContentType: (file: File) => string;
```

### 5.3 Workers API Endpoints (New)

| Method | Path | Auth | Description |
|:--|:--|:--|:--|
| POST | `/v1/trust402/listings` | 🔑 | Create listing (validates both proofs) |
| GET | `/v1/trust402/listings` | 🔐 | List/search listings |
| GET | `/v1/trust402/listings/:listingRoot` | 🔐 | Get full listing (both proofs) |
| POST | `/v1/trust402/listings/:listingRoot/verify` | 🔐 | Verify listing proofs |

🔑 = API key required, 🔐 = public (no auth required — listings are discoverable)

### 5.4 No New Dependencies

The orchestration uses only existing SDK primitives:
- `prover.prove()` — local ZK proof generation
- `proofs.submit()` — proof registration with Lemma
- `toScalar` — field element conversion
- `poseidon5` / `poseidon` — from `poseidon-lite` (already a dependency)
- `randomHex` — from `platform.ts` (already internal)
- No new packages required

## 6. Implementation Order

### Phase 1: SDK Orchestration (packages/sdk)

1. Create `packages/sdk/src/namespaces/trust402.ts` with:
   - `CONTENT_REGISTRY` mapping
   - `selectCircuit()` internal
   - `buildBlogArticleWitness()` internal
   - `buildContentCommitmentWitness()` internal
   - `publish()` public function
   - `detectContentType()` public utility
2. Add `export * as trust402` to `packages/sdk/src/index.ts`
3. Add types to export list
4. Write tests: `trust402.test.ts`

### Phase 2: Workers API Endpoints (packages/workers)

1. Add Trust402 listing table (D1/SQLite)
2. Implement CRUD endpoints with proof validation
3. Implement search/list with pagination

### Phase 3: SDK Client Methods

1. Add `list`, `getById`, `verify` to `trust402` namespace
2. Write tests for client methods

### Phase 4: Dashboard Integration (packages/web)

1. Wire up `Trust402SellDashboardTemplate.astro` with functional script
2. Add content type detection badge
3. Add progressive publish state UI
4. Wire listing table to `trust402.list()` results

## 7. Design Rationale

**Why a new `trust402` namespace and not extend existing namespaces?**

Trust402 publish is a multi-step orchestration that composes `prover.prove` and `proofs.submit`. It's a higher-level abstraction, not a primitive. A dedicated namespace keeps the public API surface clean: primitives stay in `prover`/`proofs`, orchestration in `trust402`.

**Why `publish` and not `create`?**

`create` is already used for `create(client)` (LemmaClient creation). `publish` is domain-accurate — what the seller does is "publish a listing." One word, per design principle.

**Why internal content type registry and not exported?**

The registry maps content types to circuits. It's an internal implementation detail. Exporting it would widen visibility without user need — violates minimal-change principle. Users never call `CONTENT_REGISTRY["blog-article"]` — they call `trust402.publish(client, { content: { type: "blog-article", ... } })`.

**Why do proofs get submitted before returning to user?**

The `publish()` function must register both proofs with Lemma before returning the listing. This ensures the listing is immediately verifiable. If proofs were returned without registration, the seller would need to call `proofs.submit` themselves — defeating the single-call goal.

**Why store listings server-side (Workers API) rather than client-side?**

Listings are discoverable by buyers. They need a server-side store with search/list capabilities. Client-side-only storage (localStorage, etc.) cannot support agent discovery.

**Why `needsCID` flag in content registry?**

blog-article-v1 is a commitment to article attributes (not raw bytes), so IPFS CID is irrelevant. content-commitment-v1, conversely, works with raw file bytes that are naturally identified by CID. Future circuits may or may not need CID depending on their content model.
