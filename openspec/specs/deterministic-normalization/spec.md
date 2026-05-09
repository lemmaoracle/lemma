## Requirements

### Requirement: Deterministic spend limit string output
The normalized `spendLimit` field SHALL always be a base-10 integer string (e.g., `"10000"`) or the literal `"unlimited"`. The output SHALL NOT contain decimal points, scientific notation, or leading zeros.

#### Scenario: Integer spend limit normalized to plain integer string
- **WHEN** the input credential has `spendLimit: 10000`
- **THEN** the normalized output contains `"spendLimit": "10000"`

#### Scenario: Spend limit of zero
- **WHEN** the input credential has `spendLimit: 0`
- **THEN** the normalized output contains `"spendLimit": "0"`

#### Scenario: Absent spend limit normalized to unlimited
- **WHEN** the input credential omits `spendLimit`
- **THEN** the normalized output contains `"spendLimit": "unlimited"`

#### Scenario: Large spend limit normalized without scientific notation
- **WHEN** the input credential has `spendLimit: 999999999999`
- **THEN** the normalized output contains `"spendLimit": "999999999999"` (not `"1e12"` or similar)

### Requirement: Deterministic timestamp normalization
The `normalize_timestamp` function SHALL produce identical ISO 8601 strings for identical `u64` inputs, regardless of compilation target or Rust version.

#### Scenario: Same timestamp produces same output
- **WHEN** `normalize_timestamp(1714500000u64)` is called
- **THEN** the result is always `"2024-04-30T18:00:00.000Z"`

#### Scenario: Zero epoch produces start-of-epoch string
- **WHEN** `normalize_timestamp(0u64)` is called
- **THEN** the result is `"1970-01-01T00:00:00.000Z"`

### Requirement: Deterministic chain ID string output
The normalized `chainId` field SHALL be the base-10 string of the `u64` value or an empty string when absent.

#### Scenario: Chain ID normalized to integer string
- **WHEN** the input has `chainId: 1`
- **THEN** the normalized output contains `"chainId": "1"`

#### Scenario: Absent chain ID normalized to empty string
- **WHEN** the input omits `chainId`
- **THEN** the normalized output contains `"chainId": ""`

### Requirement: Full normalization output is deterministic across platforms
Given the same JSON credential input, the `normalize()` function SHALL produce byte-identical output on all compilation targets (wasm32-unknown-unknown, x86_64, aarch64).

#### Scenario: Cross-platform consistency
- **WHEN** the same credential JSON is normalized on wasm32 and x86_64
- **THEN** the output strings are byte-identical
