# @lemma/agent

Agent Identity + Authority Credential schema for Lemma — implemented as a Rust WASM module.

## Schema: `agent-identity-authority-v1`

Represents a verifiable credential with these field groups:

- **Identity**: `agentId`, `subjectId`, `controllerId`, `orgId`
- **Authority**: `roles`, `scopes`, `permissions`
- **Financial**: `spendLimit`, `currency`, `paymentPolicy`
- **Lifecycle**: `issuedAt`, `expiresAt`, `revoked`, `revocationRef`
- **Provenance**: `issuerId`, `sourceSystem`, `generatorId`, `chainContext`

## Build

```bash
cd packages/agent
pnpm build          # Build WASM via wasm-pack
pnpm type-check     # Type-check registration scripts
pnpm test           # Run Rust tests
```

## Registration

First build the WASM, then register with Lemma:

```bash
LEMMA_API_KEY=<key> PINATA_API_KEY=<key> PINATA_SECRET_API_KEY=<secret> pnpm register
```

## Usage with Lemma SDK

The WASM schema is loaded and executed by the Lemma SDK's `define()` function, which:
1. Downloads the WASM blob (from IPFS or HTTPS)
2. Instantiates the wasm-bindgen JS shim
3. Calls `normalize(input)` to canonicalize credential data
4. Calls `validate(input)` for structural validation

```typescript
import { create, schemas } from "@lemmaoracle/sdk";

const client = create({ apiBase: "...", apiKey: "..." });

// Register the schema
await schemas.register(client, {
  id: "agent-identity-authority-v1",
  description: "Agent Identity + Authority Credential",
  normalize: {
    artifact: { type: "ipfs", wasm: "ipfs://...", js: "ipfs://..." },
    hash: "0x...",
    abi: {
      raw: { identity: "object", authority: "object", ... },
      norm: { "identity.agentId": "string", ... },
    },
  },
  metadata: { type: "agent-identity-authority", version: "1.0.0", ... },
});
```

## Example Credential Payload

```json
{
  "schema": "agent-identity-authority-v1",
  "identity": {
    "agentId": "did:example:agent-42",
    "subjectId": "0x1234567890ABCDEF1234567890ABCDEF12345678",
    "controllerId": "did:example:controller-1",
    "orgId": "org:lemma-labs"
  },
  "authority": {
    "roles": [
      { "name": "operator" },
      { "name": "validator" }
    ],
    "scopes": [
      { "name": "read:data" },
      { "name": "write:data" }
    ],
    "permissions": [
      { "resource": "api", "action": "invoke" },
      { "resource": "ledger", "action": "query" }
    ]
  },
  "financial": {
    "spendLimit": 10000,
    "currency": "USD",
    "paymentPolicy": "pre-authorized"
  },
  "lifecycle": {
    "issuedAt": 1714000000,
    "expiresAt": 1745536000,
    "revoked": false,
    "revocationRef": "rev-list:123"
  },
  "provenance": {
    "issuerId": "did:example:issuer-org",
    "sourceSystem": "lemma-admin",
    "generatorId": "gen:v1.0",
    "chainContext": {
      "chainId": 8453,
      "network": "base"
    }
  }
}
```

## Example Normalized Output

The `normalize` function canonicalizes all fields:

```json
{
  "schema": "agent-identity-authority-v1",
  "identity": {
    "agentId": "did:example:agent-42",
    "subjectId": "0x1234567890abcdef1234567890abcdef12345678",
    "controllerId": "did:example:controller-1",
    "orgId": "org:lemma-labs"
  },
  "authority": {
    "roles": "operator,validator",
    "scopes": "read:data,write:data",
    "permissions": "api:invoke,ledger:query"
  },
  "financial": {
    "spendLimit": "10000",
    "currency": "USD",
    "paymentPolicy": "pre-authorized"
  },
  "lifecycle": {
    "issuedAt": "2024-04-25T01:46:40.000Z",
    "expiresAt": "2025-04-25T01:46:40.000Z",
    "revoked": "false",
    "revocationRef": "rev-list:123"
  },
  "provenance": {
    "issuerId": "did:example:issuer-org",
    "sourceSystem": "lemma-admin",
    "generatorId": "gen:v1.0",
    "chainId": "8453",
    "network": "base"
  }
}
```

## Future: ZK Circuit Integration

Designed for future circuit integration. Planned predicates:

| Predicate | Description |
| :--- | :--- |
| `hasScope(normalized, scopeName)` | Prove agent holds a scope |
| `belongsToOrg(normalized, orgId)` | Prove agent belongs to an org |
| `spendLimitAbove(normalized, threshold)` | Prove spend limit > threshold |
| `spendLimitBelow(normalized, threshold)` | Prove spend limit < threshold |
| `isValidAt(normalized, timestamp)` | Prove validity at a time |
| `isNotRevoked(normalized, root)` | Prove non-revocation |

All normalized fields are flat strings — easy to encode as circuit field elements.

## License

MIT
