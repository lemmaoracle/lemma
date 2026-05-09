## ADDED Requirements

### Requirement: AgentCredential canonical type
The `AgentCredential` type SHALL include all fields defined in the `agent-identity-authority-v1` schema ABI's `abi.raw` and `abi.norm` structures. Each field SHALL have a JSDoc comment referencing its normalized path and the schema source repository at `https://github.com/lemmaoracle/lemma`.

#### Scenario: Type covers all raw ABI fields
- **WHEN** a developer inspects the `AgentCredential` type definition
- **THEN** it includes `identity` (agentId, subjectId, controllerId?, orgId?), `authority` (roles, scopes, permissions), `financial?` (spendLimit?, currency?, paymentPolicy?), `lifecycle` (issuedAt, expiresAt?, revoked?, revocationRef?), and `provenance` (issuerId, sourceSystem?, generatorId?, chainContext? with chainId? and network?)

#### Scenario: Type is self-documenting without access to Lemma monorepo
- **WHEN** a developer reads the `AgentCredential` type in the published `@lemmaoracle/agent` package
- **THEN** JSDoc comments reference the schema ID `agent-identity-authority-v1` and the source repository, making the type traceable without needing the private `@lemmaoracle/agent` build artifacts

### Requirement: credential factory function
The `credential` function SHALL accept a partial input object, fill defaults (`schema` from the `schemaId` parameter or `"agent-identity-authority-v1"`, `issuedAt` from `Date.now()`), validate the result, and return a `ValidationResult`.

#### Scenario: Create credential with all required fields
- **WHEN** `credential({ agentId: "agent-1", subjectId: "subject-1", roles: ["admin"], issuerId: "issuer-1" })` is called
- **THEN** the returned `ValidationResult` has `valid: true` and `credential.schema` equals `"agent-identity-authority-v1"` and `credential.lifecycle.issuedAt` is a positive integer

#### Scenario: Create credential with custom schema ID
- **WHEN** `credential({ agentId: "a", subjectId: "s", roles: ["admin"], issuerId: "i" }, { schemaId: "agent-identity-authority-v2" })` is called
- **THEN** the returned credential has `schema` equal to `"agent-identity-authority-v2"`

#### Scenario: Missing required fields returns validation errors
- **WHEN** `credential({ subjectId: "s", roles: ["admin"], issuerId: "i" })` is called (no `agentId`)
- **THEN** the returned `ValidationResult` has `valid: false` and `errors` contains an entry with `kind: "EmptyAgentId"`

### Requirement: validate function
The `validate` function SHALL accept a credential (type `unknown`) and return a `ValidationResult` indicating whether the credential conforms to the schema rules. It SHALL be pure, synchronous, and not throw.

#### Scenario: Valid credential passes validation
- **WHEN** `validate(cred)` is called with a credential containing all required fields and valid values
- **THEN** the returned `ValidationResult` has `valid: true` and `credential` equals the input

#### Scenario: Invalid spend limit fails validation
- **WHEN** `validate(cred)` is called with a credential where `financial.spendLimit` exceeds 1,000,000,000,000
- **THEN** the returned `ValidationResult` has `valid: false` and `errors` contains an entry with `kind: "SpendLimitExceeded"`

#### Scenario: Invalid currency code fails validation
- **WHEN** `validate(cred)` is called with `financial.currency` equal to `"usd"` (lowercase)
- **THEN** the returned `ValidationResult` has `valid: false` and `errors` contains an entry with `kind: "InvalidCurrency"`

#### Scenario: Expiration before issuance fails validation
- **WHEN** `validate(cred)` is called with `lifecycle.expiresAt` ≤ `lifecycle.issuedAt`
- **THEN** the returned `ValidationResult` has `valid: false` and `errors` contains an entry with `kind: "InvalidTimestamp"`

#### Scenario: validate with custom schema ID
- **WHEN** `validate(cred, { schemaId: "agent-identity-authority-v2" })` is called with a credential whose `schema` field is `"agent-identity-authority-v2"`
- **THEN** validation checks the schema field matches the provided `schemaId`

### Requirement: commit function
The `commit` function SHALL accept a `LemmaClient` and an `AgentCredential`, normalize the credential via SDK `normalize`, compute the sectioned Poseidon commitment matching `agent-identity.circom`, and return a `CommitOutput` containing both the normalized data and the commitment result.

#### Scenario: Commit produces sectioned Poseidon commitment
- **WHEN** `commit(client, credential)` is called with a valid `AgentCredential`
- **THEN** the returned `CommitOutput.normalized` contains the WASM-normalized credential, and `CommitOutput.root` equals the `Poseidon6(identityHash, authorityHash, financialHash, lifecycleHash, provenanceHash, salt)` commitment

#### Scenario: Commit section hashes match circuit expected values
- **WHEN** `commit(client, credential)` is called with the same input as `agent-identity.test.ts`'s `buildValidInput`
- **THEN** `CommitOutput.sectionHashes` contains `identityHash`, `authorityHash`, `financialHash`, `lifecycleHash`, `provenanceHash` that match the corresponding `toScalar(JSON.stringify(sectionObj))` values

#### Scenario: Commit fails for undefined schema
- **WHEN** `commit(client, credential)` is called but the schema has not been defined via `define()`
- **THEN** the function rejects with "Unknown schemaId"

### Requirement: SectionedCommitResult type
The `SectionedCommitResult` type SHALL contain `root: string` (the top-level Poseidon commitment), `sectionHashes: Readonly<Record<string, string>>` (per-section hashes keyed by section name), and `salt: string` (binding randomness).

#### Scenario: SectionedCommitResult from commit
- **WHEN** `commit(client, credential)` succeeds
- **THEN** the result includes `root`, `sectionHashes` with keys `"identityHash"`, `"authorityHash"`, `"financialHash"`, `"lifecycleHash"`, `"provenanceHash"`, and `salt`

### Requirement: ValidationError tagged union
The `ValidationError` type SHALL be a tagged union with `kind` discriminator and `message` field. The `kind` values SHALL include: `EmptyAgentId`, `EmptySubjectId`, `EmptyRoles`, `SpendLimitExceeded`, `InvalidCurrency`, `InvalidTimestamp`, `EmptyIssuerId`, `InvalidSchema`.

#### Scenario: Error with kind and message
- **WHEN** validation fails due to a missing `agentId`
- **THEN** the error has `kind: "EmptyAgentId"` and `message` containing "agentId"

### Requirement: Package publishes to npm
The `@lemmaoracle/agent` package SHALL be publishable to npm with `"private": true` removed from `package.json`, `main`, `types`, and `exports` fields pointing to compiled output, and `src/` TypeScript sources compiled to `dist/`.

#### Scenario: Package installs from npm
- **WHEN** a consumer runs `npm install @lemmaoracle/agent`
- **THEN** the package is installed and `import { AgentCredential, credential, validate, commit } from "@lemmaoracle/agent"` resolves successfully
