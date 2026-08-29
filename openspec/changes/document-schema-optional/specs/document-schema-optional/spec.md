# document-schema-optional Specification

## ADDED Requirements

### Requirement: Document registration accepts an omitted schema
The `documents.register` endpoint MUST accept a request body without a
`schema` field, and MUST treat it as if `schema` were `"passthrough-v1"`.

#### Scenario: Registration without schema succeeds
- **WHEN** a registration request omits `schema` and all other required
  fields are valid
- **THEN** the document is registered with `schema_id = "passthrough-v1"`
  and the response is `201`

#### Scenario: Empty-string schema is treated as omitted
- **WHEN** a registration request carries `schema: ""`
- **THEN** the document is registered with `schema_id = "passthrough-v1"`

### Requirement: Explicit schemas keep registry validation
A request that explicitly provides a `schema` MUST still be validated
against the schemas registry; unknown schema ids MUST be rejected.

#### Scenario: Unknown explicit schema is rejected
- **WHEN** a registration request provides `schema: "does-not-exist.v1"`
- **THEN** the endpoint responds `400` with an "Unknown schema" error and
  no document row is written

#### Scenario: Registered explicit schema unchanged
- **WHEN** a registration request provides `schema: "canonical-sort-v1"`
- **THEN** the document is registered with `schema_id = "canonical-sort-v1"`

### Requirement: Hooks queue applies the same default
The hooks pre-registration validation MUST apply the same omitted-schema
defaulting so schema-less registrations with on-chain hooks are not
rejected at enqueue time.

#### Scenario: Schema-less registration with hooks enqueues
- **WHEN** a registration payload with hooks omits `schema`
- **THEN** the hooks queue accepts the payload with
  `schemaId = "passthrough-v1"`

### Requirement: Stored schema_id remains non-null
Every persisted document row MUST carry a non-null, non-empty
`schema_id`; defaulting MUST happen before insert.

#### Scenario: No NULL schema_id rows
- **WHEN** documents are registered with and without `schema`
- **THEN** all resulting rows have `schema_id` set to a registered schema id
