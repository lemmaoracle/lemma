# @lemmaoracle/fetcher

OSS fetcher for Level 2 oracle data. Fetches external data sources, canonicalises the response, and commits to it with a Poseidon Merkle tree.

## Trust model

**Level 1** (self-attestation): Data provider publishes values directly. No verification.

**Level 2** (this package): Lemma fetches data from the source, canonicalises it with `canonical-sort-v1`, and commits to it with `data-commitment-v1`. The commitment binds the published data — post-hoc tampering is detectable. The fetcher is OSS so its implementation is auditable.

## Architecture

```
External source → fetcher (OSS, this package)
                     │
                     ├─ canonical-sort-v1 (via SDK)
                     ├─ data-commitment-v1 (via SDK commitDeep)
                     │
                     └─ Output: { request, response, commitment }
```

The commitment binds `{ request: { url, fetchedAt, date }, response: { body } }`
so the upstream URL and fetch time (UTC ms + UTC `YYYY-MM-DD`) cannot be
swapped after the fact. `response.canonical` is still a sort of the body only.

## Usage

```typescript
import { fetchAndCommit } from "@lemmaoracle/fetcher";

// Fetch and commit
const result = await fetchAndCommit("https://api.example.com/price/BTC");

console.log(result.request.url);            // upstream URL
console.log(result.request.fetchedAt);      // Unix ms
console.log(result.request.date);           // UTC YYYY-MM-DD
console.log(result.response.canonical);     // canonical JSON string of body
console.log(result.commitment.root);        // 0x... (Merkle root)

// Inclusion paths are under the commitment envelope, e.g.:
//   $["request"]["url"]
//   $["response"]["body"]["price"]
```

## License

Apache-2.0
