## Requirements

### Requirement: Integer-only deserialization for integer-domain fields
The system SHALL deserialize the following JSON fields as `u64` and reject any input that is not a non-negative integer: `identity` (no numeric fields), `authority` (no numeric fields), `financial.spendLimit`, `lifecycle.issuedAt`, `lifecycle.expiresAt`, `provenance.chainContext.chainId`.

#### Scenario: Valid integer input accepted
- **WHEN** a credential JSON contains `"spendLimit": 10000` (integer literal)
- **THEN** the deserializer accepts the value and the field is available as `u64`

#### Scenario: Fractional input rejected
- **WHEN** a credential JSON contains `"spendLimit": 100.5`
- **THEN** deserialization fails with an error message indicating a non-negative integer was expected

#### Scenario: Negative input rejected
- **WHEN** a credential JSON contains `"issuedAt": -1`
- **THEN** deserialization fails with an error message indicating a non-negative integer was expected

#### Scenario: Floating-point literal with zero fraction rejected
- **WHEN** a credential JSON contains `"spendLimit": 100.0`
- **THEN** deserialization fails with an error message indicating a non-negative integer was expected

#### Scenario: Overflow input rejected
- **WHEN** a credential JSON contains `"spendLimit": 18446744073709551616` (exceeds u64 max)
- **THEN** deserialization fails with an error message indicating a non-negative integer was expected

#### Scenario: Null input rejected
- **WHEN** a credential JSON contains `"issuedAt": null` for a required integer field
- **THEN** deserialization fails with an error indicating a non-negative integer was expected

### Requirement: Spend limit accepts optional integer
The `financial.spendLimit` field SHALL accept either an integer value or be absent. When absent, the default is `"unlimited"` in normalized output.

#### Scenario: Spend limit present as integer
- **WHEN** a credential contains `"spendLimit": 50000`
- **THEN** the field deserializes as `Some(50000u64)`

#### Scenario: Spend limit absent
- **WHEN** a credential omits the `spendLimit` field
- **THEN** the field deserializes as `None` and normalizes to `"unlimited"`

### Requirement: Timestamps accept u64 epoch seconds
The `lifecycle.issuedAt` and `lifecycle.expiresAt` fields SHALL accept non-negative integer epoch seconds as `u64`.

#### Scenario: Valid timestamp
- **WHEN** a credential contains `"issuedAt": 1714500000`
- **THEN** the field deserializes as `1714500000u64`

#### Scenario: Optional expiresAt absent
- **WHEN** a credential omits `expiresAt`
- **THEN** the field deserializes as `None` and normalizes to `"none"`

### Requirement: Chain ID accepts optional u64
The `provenance.chainContext.chainId` field SHALL accept either a non-negative integer or be absent.

#### Scenario: Chain ID present
- **WHEN** a credential contains `"chainId": 1`
- **THEN** the field deserializes as `Some(1u64)`

#### Scenario: Chain ID absent
- **WHEN** a credential omits `chainId`
- **THEN** the field deserializes as `None` and normalizes to `""`
