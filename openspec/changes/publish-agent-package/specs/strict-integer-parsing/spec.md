## ADDED Requirements

### Requirement: TypeScript validate enforces integer-domain rules
The `validate` function in `@lemmaoracle/agent` SHALL enforce the same integer-domain rules as the normalize WASM for `financial.spendLimit`, `lifecycle.issuedAt`, `lifecycle.expiresAt`, and `provenance.chainContext.chainId`: values must be non-negative integers within the u64 range. Non-integer, negative, or null values SHALL produce a `ValidationError` with an appropriate `kind`.

#### Scenario: Fractional spend limit rejected by validate
- **WHEN** `validate(cred)` is called with `financial.spendLimit: 100.5`
- **THEN** the result is `{ valid: false, errors: [{ kind: "SpendLimitExceeded", ... }] }`

#### Scenario: Negative issuedAt rejected by validate
- **WHEN** `validate(cred)` is called with `lifecycle.issuedAt: -1`
- **THEN** the result is `{ valid: false, errors: [{ kind: "InvalidTimestamp", ... }] }`

#### Scenario: Null issuedAt rejected by validate
- **WHEN** `validate(cred)` is called with `lifecycle.issuedAt: null`
- **THEN** the result is `{ valid: false, errors: [{ kind: "InvalidTimestamp", ... }] }`
