## Context

`packages/agent` currently provides a single Rust WASM crate that normalizes and validates agent identity credentials. The crate exports `normalize`, `validate`, and `process` — all pure functions operating on `AgentCredentialInput`. The entire source lives under `packages/agent/src/lib.rs`.

The existing `DESIGN.md` in `packages/agent/` conflates normalization documentation with package-level design and is stale (it describes the package before the type-safety improvements in the `agent-improves-type-safety` change). It should be removed; openspec artifacts now serve this purpose.

Downstream, `trust402/packages/roles` implements a `role-spend-limit-v1` Groth16 circuit that proves an agent holds a role and its spend limit is within a gate ceiling. However, this circuit assumes the credential it receives is authentic — there is no proof that the credential was issued by a legitimate authority. The `credentialCommitment` in trust402's circuit is a SHA-256 hash of `JSON.stringify(cred)`, which anyone can fabricate. This is the identity-authentication gap that `packages/agent` must close.

The x402 package already demonstrates the pattern: `packages/x402/circuits/payment.circom` lives as a peer to the x402 WASM schema, and a `register-circuit.ts` script uploads artifacts to IPFS and registers with the oracle.

## Goals / Non-Goals

**Goals:**

- Add a Groth16 circuit (`agent-identity-v1`) to `packages/agent` that proves a credential was issued by a trusted authority and is currently valid (not expired, not revoked).
- Restructure `packages/agent/src/` to `packages/agent/normalize/src/` so the normalization crate and the circuit module are peers under the same package.
- Delete `packages/agent/DESIGN.md`.
- Provide a build script for the circuit and a registration script that follows the x402 pattern (Pinata IPFS upload + `circuits.register`).
- Produce public outputs (`credentialCommitment`, `issuerPublicKey`) that downstream circuits can reference as trust anchors.

**Non-Goals:**

- Credential issuance, provisioning, or lifecycle management — these are use-case-layer concerns.
- Selective disclosure or revocation accumulators — deferred to future work.
- Modifying trust402's `role-spend-limit-v1` circuit or witness builder — that is trust402's responsibility, though this change enables it.
- Recursive proof composition (aggregating agent-identity proof into role-spend-limit proof in a single Groth16 proof) — future optimization.

## Decisions

### Decision 1: Issuer signature scheme — BBS+ Signatures on Poseidon commitments

**Choice**: Use BBS+ signatures where the issuer signs the Poseidon hash of the normalized credential. The circuit verifies the BBS+ signature against the issuer's public key.

**Rationale**: BBS+ supports signature verification inside a ZK circuit and is compatible with future selective disclosure (the signer commits to individual fields, and the prover can reveal subsets). Poseidon is already the hash function used in the x402 and trust402 circuits, keeping the proving stack consistent.

**Alternatives considered**:
- **EdDSA on Baby Jubjub**: Simpler circuit, but does not support selective disclosure. Would require a future migration when selective disclosure is added.
- **Poseidon MAC (symmetric)**: No issuer identity — a shared key does not establish who issued the credential. Fails the "who issued this?" trust requirement.
- **On-chain issuer registry check**: Would require an Ethereum view call inside the circuit, adding significant complexity and chain-specific coupling.

### Decision 2: Circuit structure — two-phase commitment

**Choice**: The `agent-identity-v1` circuit takes the **normalized** credential as input and produces a Poseidon commitment. The issuer's BBS+ signature is verified over this commitment. Public outputs are `credentialCommitment` (Poseidon hash) and `issuerPublicKey`.

**Rationale**: This creates a clean separation — normalization produces deterministic bytes, the circuit proves authenticity over those bytes. Downstream circuits bind to `credentialCommitment` without needing to understand the normalization internals.

```
normalize(cred) → normalized JSON string
                       │
                       ▼
Poseidon hash ──────→ credentialCommitment  (public output)
BBS+ verify ────────→ issuerPublicKey        (public output)
lifecycle check ────→ valid/not-revoked      (internal constraint)
```

**Alternatives considered**:
- **Signing the raw credential**: Non-deterministic serialization would cause the same credential to have different commitments on different platforms. Normalization first ensures commitment determinism.
- **Signing individual fields**: More granular but increases circuit size significantly (each field needs its own Poseidon input). The hash-then-sign pattern is standard and efficient.

### Decision 3: Package layout — `normalize/` and `circuits/` as peers

**Choice**:
```
packages/agent/
├── normalize/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          (existing normalization code, unchanged API)
├── circuits/
│   ├── package.json        (circomlib, snarkjs)
│   ├── src/
│   │   └── agent-identity.circom
│   ├── scripts/
│   │   └── build.sh
│   └── build/              (compiled artifacts)
├── scripts/
│   ├── build-wasm.sh       (updated path: targets normalize/)
│   └── register-circuit.ts (new: circuit registration via SDK)
├── Cargo.toml              (workspace root, or removed if single crate)
└── package.json            (npm package for WASM artifact)
```

**Rationale**: Mirrors the trust402 pattern (`packages/roles/circuits/`) and the x402 pattern (`packages/x402/circuits/`). The normalization crate is a self-contained Rust project; the circuit is a self-contained circom project. They are peers under the same package because they serve the same domain (agent identity).

**Alternatives considered**:
- **Separate `packages/agent-circuit`**: Over-fragmentation — the circuit and normalization are tightly coupled (the circuit consumes the normalized form). Keeping them in one package makes the relationship explicit.
- **Rust workspace with `agent-normalize` and `agent-circuit` crates**: The circuit is circom, not Rust, so a Cargo workspace would only contain the normalization crate. Not worth the added config for a single Rust crate.

### Decision 4: Lifecycle validation inside the circuit

**Choice**: The circuit includes constraints verifying that `issuedAt <= nowSec` and `(expiresAt == 0 OR nowSec <= expiresAt)` and `revoked == false`. These checks are in addition to the BBS+ signature verification.

**Rationale**: Even a legitimately issued credential can become invalid after expiration or revocation. Including lifecycle checks in the circuit means the proof itself is only valid while the credential is live. Without this, an expired credential could still produce a valid proof.

**Alternatives considered**:
- **Off-chain lifecycle check only**: The verifier would need to separately check expiration, adding a trust assumption that the verifier is honest and timely. In-circuit enforcement is stronger.
- **Revocation accumulator**: More scalable for large-scale revocation (e.g., a Merkle tree of revoked credentials), but adds significant complexity. Deferred to future work. For now, `revoked` is a boolean field in the credential.

## Risks / Trade-offs

**[Risk] BBS+ circuit complexity** → The BBS+ signature verification circuit is significantly larger than the role-spend-limit circuit. This increases proof generation time. Mitigation: Start with a simplified issuer-verification approach (Poseidon MAC with issuer public key as a private input, verified via a Poseidon-based commitment opening) if BBS+ proves too complex for the MVP timeline. The circuit can be upgraded to BBS+ later without changing the public output interface.

**[Risk] Credential format coupling** → The circuit commits to the normalized form, which means any change to the normalization schema would invalidate existing proofs. Mitigation: The `schema` field is part of the normalized output and is included in the commitment. A schema version change produces a different commitment, making version transitions explicit.

**[Risk] Revocation freshness** → The `revoked` boolean is static in the credential. If an issuer revokes a credential after it was issued, the holder still possesses the old credential with `revoked: false`. Mitigation: This is a known limitation. Future work includes a revocation accumulator (on-chain Merkle root of revoked credentials) that the circuit can check against. For MVP, the issuer is trusted to issue new credentials with `revoked: true` and the verifier can optionally query the issuer's revocation endpoint.

**[Trade-off] `credentialCommitment` as Poseidon vs SHA-256** → trust402 currently uses SHA-256 for `credentialCommitment`. Switching to Poseidon in the agent circuit means trust402 must also switch to Poseidon (or use a Poseidon↔SHA-256 bridge) for the commitments to match. Mitigation: Poseidon is the standard for ZK circuits (SNARK-friendly). The SHA-256 approach in trust402 was a placeholder that should be replaced regardless. This change provides the correct primitive.
