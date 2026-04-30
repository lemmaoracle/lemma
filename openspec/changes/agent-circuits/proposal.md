## Why

`packages/agent` provides deterministic normalization for agent credentials, but normalization alone cannot prove that a credential was issued by a legitimate authority or that it has not been tampered with. Downstream consumers (e.g., trust402's role-spend-limit circuit) need a cryptographic guarantee that the agent identity underpinning their proofs is authentic. Without an identity-proof circuit in `packages/agent`, any consumer must either accept unauthenticated credentials (a security gap) or build its own identity-verification logic (a duplication and interoperability risk).

## What Changes

- **Restructure `packages/agent/src/` to `packages/agent/normalize/src/`** — the existing normalization crate becomes a sub-module, making room for the circuit module at the same level.
- **Add a ZK circuit (`agent-identity-v1`)** that proves: (1) a credential commitment was derived from a legitimately issued credential, (2) the credential has not been revoked, and (3) the credential is within its valid lifecycle window. The circuit consumes the normalized output from the normalization sub-module.
- **Delete `packages/agent/DESIGN.md`** — the file conflates normalization-only documentation with package-level design and is now stale; the openspec artifacts replace it.
- **Register the `agent-identity-v1` circuit** with the Lemma oracle via the existing `circuits.register` SDK path and Pinata IPFS upload.

## Capabilities

### New Capabilities
- `identity-proof-circuit`: A Groth16 circuit that proves an agent credential was issued by a trusted authority and is currently valid (not expired, not revoked). Produces public outputs (credentialCommitment, issuerPublicKey) that downstream circuits (e.g., trust402 role-spend-limit) can reference as trust anchors.
- `agent-package-restructure`: Reorganize the `packages/agent` crate layout so that `normalize/` is a sub-module and `circuit/` is a peer sub-module, with a top-level `lib.rs` that re-exports both.

### Modified Capabilities
- `deterministic-normalization`: The normalization crate path changes from `packages/agent/src/` to `packages/agent/normalize/src/`. The public API (`normalize`, `validate`, `process`) and behavior remain unchanged; only the file location changes.

## Impact

- **File layout**: `packages/agent/src/` → `packages/agent/normalize/src/`; new `packages/agent/circuit/` directory added.
- **Build pipeline**: The WASM build script (`scripts/build-wasm.sh`) must be updated to target the new crate path. A new build step is needed for the circom circuit compilation.
- **Cargo workspace**: `packages/agent/Cargo.toml` becomes a workspace or the crate root moves to `packages/agent/normalize/Cargo.toml`. A second crate at `packages/agent/circuit/` is not a Rust crate (circom outputs JS/WASM), so Cargo workspace changes are limited to the normalization crate path.
- **SDK consumers**: The `@lemma/agent` npm package continues to export `normalize`, `validate`, `process` from the same WASM module — no API break. The circuit artifact is a separate registration step, not a WASM export.
- **trust402 dependency**: trust402 can now reference the `agent-identity-v1` circuit's public outputs as a precondition for its own `role-spend-limit-v1` proofs, closing the identity-authentication gap.
- **Removed**: `packages/agent/DESIGN.md` deleted.
