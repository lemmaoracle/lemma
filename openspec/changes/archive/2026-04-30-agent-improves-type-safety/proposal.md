## Why

`packages/agent` `lib.rs` uses `f64` for all integer-domain fields (spend limit, timestamps, chain ID). This causes precision loss, non-deterministic string conversion, and manual integer validation. Fixing this now prevents reproducibility bugs in future circuit additions and cross-platform operation.

## What Changes

- **BREAKING**: Change integer-domain input fields from `f64` to `u64` (`issuedAt`, `expiresAt`, `chainId`, `spendLimit`)
- **BREAKING**: Change `normalize_spend_limit` output from `f64::to_string()` to deterministic integer string
- Reject non-integer JSON numbers at deserialization via custom serde deserializers (replacing manual `fract()` checks)
- Add missing validations to `validate()`: authority non-empty, spendLimit upper bound, currency format
- Unify error return types (JSON-string `JsValue` → structured `NormalizeError` / `ValidationError`)

## Capabilities

### New Capabilities
- `strict-integer-parsing`: Accept only integer JSON numbers and safely deserialize to `u64`. Rejects fractions, negatives, and overflows at the type level.
- `deterministic-normalization`: Full determinism guarantee for normalization output. Especially makes spend-limit string representation platform-independent.

### Modified Capabilities

(None — no existing specs in the lemma repository)

## Impact

- `packages/agent/src/lib.rs` — changes to all input types, normalization functions, and validation functions
- `packages/agent/Cargo.toml` — possible dependency addition for custom deserializers (may be handled with `serde_json` alone)

Note: downstream consumers (e.g., `@trust402/roles` witness builder, `role-spend-limit.circom`) are in a separate repository and out of scope for this change.
