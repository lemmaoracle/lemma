## ADDED Requirements

### Requirement: SDK normalize function
The SDK SHALL provide a `normalize` function that returns only the normalized data without computing a Merkle-tree commitment. It SHALL accept the same `PrepareInput<Raw>` type as `prepare`.

#### Scenario: Normalize returns typed normalized data
- **WHEN** `normalize<Raw, Norm>(client, { schema: "agent-identity-authority-v1", payload: cred })` is called after `define(schemaMeta)`
- **THEN** the returned `Norm` object contains the WASM-normalized fields, identical to what `prepare` would produce as `result.normalized`

#### Scenario: Normalize rejects for unknown schema
- **WHEN** `normalize(client, { schema: "nonexistent", payload: {} })` is called without a prior `define()`
- **THEN** the function rejects with "Unknown schemaId: nonexistent. Call define() first."

#### Scenario: Normalize does not compute commitments
- **WHEN** `normalize` is called
- **THEN** no Poseidon Merkle tree is built, no `randomBytes` is called, and no `CommitResult` is produced — only the WASM `normalize` function is invoked

#### Scenario: prepare is equivalent to normalize + commitMerkle
- **WHEN** `prepare(client, input)` and `normalize(client, input)` are called with the same input
- **THEN** `prepare`'s `normalized` field equals `normalize`'s return value, and `prepare` additionally computes the Merkle commitment

### Requirement: normalize exported from SDK index
The `normalize` function SHALL be exported from `@lemmaoracle/sdk` alongside `prepare`.

#### Scenario: Import normalize from SDK
- **WHEN** a consumer writes `import { normalize } from "@lemmaoracle/sdk"`
- **THEN** the import resolves to the `normalize` function
