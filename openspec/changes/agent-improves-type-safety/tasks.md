## 1. Custom Deserializer Infrastructure

- [ ] 1.1 Create `strict_u64` serde deserializer module that rejects fractional, negative, and overflow JSON numbers
- [ ] 1.2 Create `strict_optional_u64` serde deserializer for `Option<u64>` fields with same rejection semantics
- [ ] 1.3 Verify deserializers compile and reject `1.0`, `-1`, `null` (for required fields), and `18446744073709551616` in unit tests

## 2. Input Type Migration

- [ ] 2.1 Change `AgentFinancialAuthority.spend_limit` from `Option<f64>` to `Option<u64>` with `#[serde(deserialize_with = "strict_optional_u64")]`
- [ ] 2.2 Change `AgentLifecycle.issued_at` from `f64` to `u64` with `#[serde(deserialize_with = "strict_u64")]`
- [ ] 2.3 Change `AgentLifecycle.expires_at` from `Option<f64>` to `Option<u64>` with `#[serde(deserialize_with = "strict_optional_u64")]`
- [ ] 2.4 Change `ChainContext.chain_id` from `Option<f64>` to `Option<u64>` with `#[serde(deserialize_with = "strict_optional_u64")]`
- [ ] 2.5 Verify all input types compile after migration

## 3. Normalization Functions Update

- [ ] 3.1 Update `normalize_spend_limit` to accept `Option<u64>` and output `u64::to_string()` or `"unlimited"`
- [ ] 3.2 Update `normalize_timestamp` to accept `u64` instead of `f64` (remove float-to-int cast)
- [ ] 3.3 Update `normalize_optional_timestamp` to accept `Option<u64>` instead of `Option<f64>`
- [ ] 3.4 Update chain ID normalization in `normalize()` to use `u64::to_string()` instead of `f64::to_string()`
- [ ] 3.5 Verify `normalize()` produces identical output for the same input on wasm32 and x86_64

## 4. Validation Overhaul

- [ ] 4.1 Remove `fract()` and negative-check logic from `validate()` (now enforced by deserializer)
- [ ] 4.2 Add validation: `authority.roles` must be non-empty
- [ ] 4.3 Add validation: `spendLimit` must be ≤ 1,000,000,000,000 when present
- [ ] 4.4 Add validation: `currency` must match `^[A-Z]{3}$` regex pattern
- [ ] 4.5 Add validation: `expiresAt` must be > `issuedAt` when present (strengthen existing ≥ check)

## 5. Structured Error Types

- [ ] 5.1 Define `NormalizeError` enum with variants: `StringifyFailed`, `ParseFailed(String)`, `SerializeFailed(String)`
- [ ] 5.2 Define `ValidationError` enum with variants: `StringifyFailed`, `ParseFailed(String)`, `InvalidSchema(String)`, `EmptyAgentId`, `EmptySubjectId`, `EmptyRoles`, `SpendLimitExceeded`, `InvalidCurrency`, `InvalidTimestamp(String)`, `EmptyIssuerId`
- [ ] 5.3 Implement `Serialize` for both enums to produce `{"error": "..."}` or `{"valid": false, "error": "..."}` JSON
- [ ] 5.4 Replace all ad-hoc `serde_json::json!({...})` error construction in `normalize()` and `validate()` with enum variants

## 6. Build and Integration Verification

- [ ] 6.1 Run `wasm-pack build` and verify WASM artifact compiles without warnings
- [ ] 6.2 Run existing test suite and verify no regressions
- [ ] 6.3 Add integration test: feed a credential with `"spendLimit": 100.5` and verify deserialization rejection
- [ ] 6.4 Add integration test: verify normalized output is byte-identical between native Rust test and WASM invocation
