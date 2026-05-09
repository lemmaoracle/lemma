## ADDED Requirements

### Requirement: credential factory produces normalization-compatible output
The `credential` factory function SHALL produce output that, when passed through the normalize WASM, yields deterministic results — because all required fields are populated, default values are consistent, and optional absent fields use the same defaults as the WASM.

#### Scenario: Factory output normalizes deterministically
- **WHEN** `credential({ agentId: "a", subjectId: "s", roles: ["admin"], issuerId: "i" })` produces a credential and that credential is normalized by the WASM
- **THEN** the normalized output is byte-identical across invocations with the same input

#### Scenario: Absent financial section defaults match WASM defaults
- **WHEN** `credential` is called without `financial` fields
- **THEN** the factory populates `financial.spendLimit` as undefined (normalizes to `"unlimited"`), `financial.currency` as `"USD"`, and `financial.paymentPolicy` as `""` — matching the WASM's default behavior
