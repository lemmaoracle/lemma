# @lemmaoracle/data-commitment

data-commitment-v1 — Poseidon Merkle tree commitment over path-value pairs from arbitrary JSON.

## What it does

Extracts all scalar path-value pairs from a JSON value, builds a Poseidon Merkle tree, and produces a commitment root.  Enables verification that a specific value exists in the committed data.

## Architecture

```
JSON value
    │
    ├─ extractPaths()     — deep path-value extraction (bracket notation)
    ├─ valueForHash()      — type-tagged hashing (prevents number/string collision)
    ├─ Poseidon3 leaves   — poseidon3([toScalar(path), toScalar(value), randomness])
    └─ Poseidon2 Merkle   — root = commitment
```

## Type tagging

Values are type-tagged before hashing to prevent collisions:

| Type | Tag | Example |
|------|-----|---------|
| `number` (integer) | raw | `42` |
| `number` (float) | `f:` | `f:3.14` |
| `string` | `s:` | `s:hello` |
| `null` | `z:` | `z:null` |
| `boolean` | `b:` | `b:true` |

## Path format

Bracket notation with JSON-escaped keys:

```
$["data"]["price"]           — object access
$["items"][0]["id"]           — array index + object access
$["a.b"]                      — literal key "a.b" (no collision with $["a"]["b"])
```

## Circuit

`circuits/data-commitment-v1.circom` — ZK circuit for Merkle inclusion verification.  Uses `MerkleProofChecker` (inlined, same as agent-identity-valid.circom).  Default: 16 levels (2^16 max leaves).

## Usage

```typescript
import { commitToData, verifyInclusion } from "@lemmaoracle/data-commitment";

const result = commitToData({ price: 42000, currency: "USD" });
// result.root — 0x... (Merkle root)
// result.randomness — 0x... (blinding)
// result.inclusionProofs — Merkle proofs for each leaf

// Verify a value is in the commitment (non-ZK)
const idx = result.pathValues.findIndex(pv => pv.path === '$["price"]');
const proof = result.inclusionProofs[idx];
const ok = verifyInclusion(
  result.root, result.randomness,
  '$["price"]', 42000,
  proof.siblings, proof.indices,
);
```

## License

Apache-2.0
