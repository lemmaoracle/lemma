# packages/agent — Design Note

## Why `packages/agent`

- Short, descriptive package name consistent with existing conventions (`spec`, `sdk`, `mcp`, `passthrough`).
- The domain concept is "agent identity + authority credential" — `agent` captures the primary entity.
- Follows `@lemma/agent` naming (`passthrough` uses `@lemma/passthrough`).
- No naming conflict anywhere in the monorepo.

## Relationship to `packages/passthrough`

`packages/agent` is modeled directly on `packages/passthrough`:

| Aspect           | `passthrough`                       | `agent`                                |
| :--------------- | :---------------------------------- | :------------------------------------- |
| Language         | Rust                                | Rust                                   |
| Runtime          | WASM (wasm-pack, wasm-bindgen)      | WASM (wasm-pack, wasm-bindgen)         |
| Dependencies     | `wasm-bindgen`, `js-sys`            | `wasm-bindgen`, `js-sys`, `serde`, `serde_json` |
| Build            | `./scripts/build-wasm.sh`           | `./scripts/build-wasm.sh`              |
| Registration     | Pinata IPFS + SDK register          | Pinata IPFS + SDK register             |
| TS config        | `rootDir: "scripts"`                | `rootDir: "scripts"`                   |
| Exports          | `normalize`, `validate`, `process`  | `normalize`, `validate`, `process`     |
| `normalize`      | Identity (passthrough)              | Full canonicalization (strings, arrays, timestamps) |
| `validate`       | Always true                         | Structural + semantic validation       |

## Package structure (after rebuild)

```
packages/agent/
├── Cargo.toml              # Rust crate config
├── Cargo.lock
├── package.json            # npm package (WASM artifact + scripts)
├── tsconfig.json           # TypeScript only for scripts/
├── README.md
├── DESIGN.md
├── src/
│   └── lib.rs              # Rust WASM: normalize, validate, process
├── scripts/
│   ├── build-wasm.sh       # wasm-pack build + rename
│   └── register-schema.ts  # Pinata upload + SDK schema registration
├── target/                 # Rust build artifacts
└── dist/
    └── wasm/
        ├── agent.wasm      # Renamed from lemma_agent_bg.wasm
        ├── agent.js        # Renamed from lemma_agent.js
        └── *.d.ts          # Auto-generated TypeScript declarations
```

## WASM interface (contract with Lemma SDK)

```rust
#[wasm_bindgen]
pub fn normalize(input: JsValue) -> JsValue;  // JSON string in → normalized JSON string out
#[wasm_bindgen]
pub fn validate(input: JsValue) -> JsValue;   // JSON string in → {"valid":true} or {"valid":false,"error":"..."}
#[wasm_bindgen]
pub fn process(input: JsValue) -> JsValue;    // { result: ..., valid: ... }
```

## Normalization details

| Field group | Raw form | Normalized form |
| :--- | :--- | :--- |
| `identity.agentId` | any string | trimmed; hex addresses → lowercase |
| `identity.subjectId` | any string | trimmed; hex addresses → lowercase |
| `identity.controllerId` | string \| undefined | "" if absent |
| `identity.orgId` | string \| undefined | "" if absent |
| `authority.roles` | `[{name:...}]` | sorted, deduped, comma-joined names |
| `authority.scopes` | `[{name:...}]` | sorted, deduped, comma-joined names |
| `authority.permissions` | `[{resource,action}]` | sorted, deduped "resource:action" |
| `financial.spendLimit` | number \| undefined | decimal string or "unlimited" |
| `financial.currency` | string \| undefined | string, default "USD" |
| `financial.paymentPolicy` | string \| undefined | string, default "" |
| `lifecycle.issuedAt` | number | ISO 8601 UTC string |
| `lifecycle.expiresAt` | number \| undefined | ISO 8601 or "none" |
| `lifecycle.revoked` | boolean \| undefined | "true" \| "false" |
| `lifecycle.revocationRef` | string \| undefined | string, default "" |
| `provenance.*` | strings \| undefined | trimmed, default "" |

## MVP vs Later

### MVP (delivered)
- Rust WASM: `normalize`, `validate`, `process`
- serde-based JSON parsing and output
- Full canonicalization (sorted+deduped arrays, timestamp→ISO8601, hex→lowercase)
- Pinata IPFS registration script
- Lemma SDK-compatible `SchemaMeta` shape
- ABI with `raw` and `norm` field mappings for future circuits

### Phase 2 (extensions, not yet implemented)
- ZK circuits (`circom`/`groth16`) proving predicates on normalized fields
- Circuit artifact registration via Lemma `circuits.register`
- `selectiveDisclosure` support for partial credential revelation
- Revocation accumulator integration
