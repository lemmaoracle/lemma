## Why

`@lemmaoracle/agent` is currently a private package that bundles schema WASM, circuit artifacts, and registration scripts — but exports no TypeScript API. Downstream packages (`@trust402/roles`, future agent integrators) must duplicate the `AgentCredential` type and hand-author credential JSON with no validation. The SDK's `prepare` function computes commitments exclusively via a flat Poseidon Merkle tree, which cannot produce the sectioned `Poseidon6` commitment that `agent-identity.circom` expects. However, extending `prepare` to support multiple commitment strategies would change `PrepareOutput` and `DocumentCommitments` (an API-contract type in `@lemmaoracle/spec`), with cascading impact on Relay, x402, and the Workers API.

## What Changes

- **BREAKING**: Change `@lemmaoracle/agent` from `"private": true` to a published npm package, adding a `src/` directory with TypeScript types and functions (`credential`, `validate`, `commit`) that mirror the normalize WASM's validation rules and the circuit's commitment scheme
- Add `AgentCredential` canonical type aligned to the `agent-identity-authority-v1` schema ABI, with JSDoc referencing the schema ID and source repository
- Add `credential()` factory function that builds a validated credential from partial input (fills defaults: `schema`, `issuedAt`)
- Add `validate()` pure sync function that validates a credential against schema rules (mirrors the normalize WASM's checks: required fields, u64 ranges, currency format, timestamp bounds)
- Add `commit()` function in `@lemmaoracle/agent` that normalizes a credential via SDK `normalize` and computes the sectioned Poseidon commitment matching `agent-identity.circom`
- Add `normalize` function to SDK — a lightweight version of `prepare` that returns only the normalized data without computing a Merkle-tree commitment. This allows `@lemmaoracle/agent` to avoid the wasted Merkle computation when it only needs the normalized output for its own commitment scheme
- Add `computeCredentialCommitment` helper in `@lemmaoracle/agent` that implements the sectioned Poseidon commitment scheme (`Poseidon6` with section hashes) used by `agent-identity.circom`

## Capabilities

### New Capabilities
- `agent-credential-api`: The `credential()`, `validate()`, and `commit()` functions plus canonical `AgentCredential` / `ValidationResult` / `SectionedCommitResult` types exported from `@lemmaoracle/agent`
- `sdk-normalize`: The `normalize` function in `@lemmaoracle/sdk` that returns only normalized data (without commitment computation), enabling consumers to apply their own commitment schemes

### Modified Capabilities
- `strict-integer-parsing`: The `validate()` function in `@lemmaoracle/agent` enforces the same integer-domain rules in TypeScript, providing client-side pre-validation before WASM normalization
- `deterministic-normalization`: The `credential()` factory produces output that, when normalized, yields deterministic results — because required fields are always populated and default values are consistent

## Impact

- **`@lemmaoracle/agent`**: New `src/` directory with `types.ts`, `credential.ts`, `validate.ts`, `commit.ts`, `index.ts`; `package.json` changes: remove `"private": true`, add `"main"/"types"/"exports"`, add `vitest` devDependency; new dependency on `poseidon-lite`
- **`@lemmaoracle/sdk`**: Add `normalize` function (lightweight version of `prepare` that skips commitment computation); no changes to `PrepareOutput`, `CommitResult`, `DocumentCommitments`, or `prepare`
- **`@lemmaoracle/relay`**: No changes
- **`@trust402/roles`**: Can now import `AgentCredential` type directly from `@lemmaoracle/agent`; can use `credential()` to build validated credentials; can use `commit()` for circuit-compatible commitments
