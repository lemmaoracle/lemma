# @lemmaoracle/agent

Agent Identity + Authority Credential schema for Lemma — implemented as a Rust WASM module with ZK identity-proof circuit.

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
pnpm build              # Build WASM via wasm-pack
pnpm type-check         # Type-check registration scripts
pnpm test               # Run Rust tests
pnpm register           # Register schema with Lemma
pnpm register:circuit   # Register circuit with Lemma
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

## ZK Circuit: `agent-identity-v1`

The `circuits/` directory contains the `agent-identity-v1` Groth16 circuit that proves an agent credential was issued by a trusted authority and is currently valid.

**Circuit signals:**

| Signal | Visibility | Description |
| :--- | :--- | :--- |
| `identityHash` | private | Poseidon hash of normalized identity fields |
| `authorityHash` | private | Poseidon hash of normalized authority fields |
| `financialHash` | private | Poseidon hash of normalized financial fields |
| `lifecycleHash` | private | Poseidon hash of normalized lifecycle fields |
| `provenanceHash` | private | Poseidon hash of normalized provenance fields |
| `salt` | private | Binding randomness |
| `issuerSecretKey` | private | Issuer's secret key for MAC verification |
| `mac` | private | Issuer's MAC over the credentialCommitment |
| `issuedAt` | private | Credential issuance timestamp |
| `expiresAt` | private | Credential expiration (0 = none) |
| `revoked` | private | Revocation flag (must be 0) |
| `credentialCommitment` | **public** | Poseidon commitment binding all credential fields |
| `issuerPublicKey` | **public** | Issuer's public key |
| `nowSec` | **public** | Current unix timestamp |

**Constraints:**
1. `credentialCommitment = Poseidon6(identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, salt)`
2. `issuerPublicKey = Poseidon1(issuerSecretKey)` — key derivation
3. `mac = Poseidon2(credentialCommitment, issuerSecretKey)` — issuer signature
4. `issuedAt <= nowSec` — credential has been issued
5. `revoked === 0` — not revoked
6. If `expiresAt != 0`: `nowSec < expiresAt` — not expired

Build the circuit:

```bash
cd packages/agent/circuits
npm run build
```

## License

MIT
