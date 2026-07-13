# @lemmaoracle/fetcher

OSS fetcher for Level 2 oracle data. Fetches external data sources, canonicalises the response, and commits to it with a Poseidon Merkle tree.

## Trust model

**Level 1** (self-attestation): Data provider publishes values directly. No verification.

**Level 2** (this package): Lemma fetches data from the source, canonicalises it with `canonical-sort-v1`, and commits to it with `data-commitment-v1`. The commitment binds the published data — post-hoc tampering is detectable. The fetcher is OSS so its implementation is auditable.

## Architecture

```
External source → fetcher (OSS, this package)
                     │
                     ├─ @lemmaoracle/canonical-sort   (canonical-sort-v1)
                     ├─ @lemmaoracle/data-commitment  (data-commitment-v1)
                     │
                     └─ Output: { data, canonical, commitment, randomness }
```

The canonicaliser and commitment scheme are separate packages so they can be reused independently of the fetcher.

## Usage

```typescript
import { fetchAndCommit, verifyInclusion } from "@lemmaoracle/fetcher";

// Fetch and commit
const result = await fetchAndCommit("https://api.example.com/price/BTC");

console.log(result.canonical);        // canonical JSON string
console.log(result.commitment.root); // 0x... (Merkle root)

// Verify a value is in the commitment (non-ZK)
const { pathValues, inclusionProofs, root, randomness } = result.commitment;
const idx = pathValues.findIndex(pv => pv.path === '$["data"]["price"]');
const proof = inclusionProofs[idx];

const ok = verifyInclusion(
  root, randomness,
  '$["data"]["price"]', 42000,
  proof.siblings, proof.indices,
);
```

## License

Apache-2.0
