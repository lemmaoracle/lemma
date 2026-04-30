## Context

`packages/agent` is a Rust → WASM normalizer for agent credentials. It exposes three functions (`normalize`, `validate`, `process`) called from the Lemma SDK via `wasm-bindgen`. The current implementation represents all numeric fields as `f64` because JSON numbers are untyped and serde's default deserialization maps them to `f64`.

Current pain points:
1. `spend_limit: Option<f64>` accepts `1.5` (fractional cents) — semantically invalid for USD cents
2. `issued_at: f64` loses precision for timestamps beyond 2^53
3. `validate()` uses manual `fract() != 0.0` checks — fragile and incomplete
4. `normalize_spend_limit` outputs `f64::to_string()` — non-deterministic across Rust targets
5. `chain_id: Option<f64>` — chain IDs are always integers

## Goals / Non-Goals

**Goals:**
- Guarantee that integer-domain fields reject fractional values at deserialization time
- Produce fully deterministic normalization output regardless of compilation target
- Replace runtime validation of integer-ness with compile-time type enforcement
- Strengthen `validate()` to catch missing authority and out-of-range spend limits

**Non-Goals:**
- Changing the WASM ABI surface (`normalize`, `validate`, `process` signatures remain `JsValue → JsValue`)
- Supporting non-USD currencies with fractional units (future concern)
- Migrating to a different serialization format (staying with JSON)
- Adding circuit-level validation (circuit constraints are orthogonal)

## Decisions

### Decision 1: Custom serde deserializer for strict u64 parsing

Use a custom deserializer that calls `serde_json::Value::as_u64()` instead of the default `f64` deserialization. This rejects fractional numbers, negative numbers, and out-of-range values at parse time.

**Rationale:** The alternative — keeping `f64` and adding validation — leaves the type system unable to enforce integer-ness. Custom deserialization moves the invariant into the type, eliminating an entire class of bugs.

**Alternative considered:** A `try_from` conversion after deserialization. Rejected because it requires a separate validation pass and the `f64` type still leaks into business logic.

Implementation pattern:
```rust
mod strict_u64 {
    use serde::de::{self, Deserializer, Visitor};
    use std::fmt;

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
    where D: Deserializer<'de> {
        // Attempt u64 directly; reject if the JSON number is fractional
        let val = serde_json::Value::deserialize(deserializer)?;
        val.as_u64().ok_or_else(|| {
            de::Error::custom("expected a non-negative integer")
        })
    }
}
```

### Decision 2: Deterministic spend limit normalization

Replace `f64::to_string()` with `u64::to_string()` in `normalize_spend_limit`. Since the input is now `Option<u64>`, the normalized string is always a base-10 integer representation (e.g., `"10000"`) or `"unlimited"`.

**Rationale:** `u64::to_string()` is deterministic by definition — same input, same output, no platform variation.

### Decision 3: Timestamp as u64 epoch seconds

Change `issued_at: f64` → `issued_at: u64` and `expires_at: Option<f64>` → `expires_at: Option<u64>`. The `normalize_timestamp` function already truncates to integer seconds, so the type change has no semantic impact on output.

**Rationale:** Epoch timestamps are always non-negative integers. The `u64` type enforces this at deserialization, eliminating the `issued_at < 0.0` and `fract() != 0.0` checks in `validate()`.

### Decision 4: Structured error types

Define `NormalizeError` and `ValidationError` enums that implement `Serialize`. The WASM boundary still returns `JsValue`, but the internal error flow uses typed enums instead of ad-hoc JSON construction.

**Rationale:** Reduces stringly-typed error handling and makes it impossible to forget an error field. The `serde_json::to_string(&error)` at the boundary ensures consistent JSON output.

### Decision 5: Extended validation coverage

Add validation rules that `validate()` currently omits:
- `authority.roles` must contain at least one role
- `financial.spendLimit` must be ≤ 1,000,000,000,000 (1 trillion cents = $10B)
- `financial.currency` must be a 3-letter uppercase ISO code
- `lifecycle.expiresAt` must be > `lifecycle.issuedAt` (already partially checked, but only when `expiresAt` is present)

**Rationale:** These invariants are assumed by downstream consumers. Catching violations early prevents silent failures in dependent systems.

## Risks / Trade-offs

- **[Risk] Breaking change for callers passing fractional numbers** → Mitigation: The WASM ABI is internal to the Lemma SDK. SDK consumers pass JSON objects; the schema already specifies integer fields. Fractional inputs were always invalid — this change makes the rejection explicit.
- **[Risk] Custom deserializer maintenance burden** → Mitigation: The deserializer is ~20 lines and uses only `serde_json` primitives. No external crate needed.
- **[Risk] `u64` max (18.4e18) vs `f64` max for timestamps** → Mitigation: `u64` can represent timestamps up to year 584 billion — no practical limitation. The previous `f64` limit was 2^53 ≈ year 285 million.
- **[Trade-off] Rejecting `1.0` as input for integer fields** → This is intentional. JSON `1.0` and `1` are distinct tokens; accepting only the integer form enforces schema discipline.
