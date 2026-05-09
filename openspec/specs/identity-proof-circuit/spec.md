## ADDED Requirements

### Requirement: Agent identity proof circuit definition
|The system SHALL provide a Groth16 circuit (`agent-identity-v1`) that proves an agent credential was issued by a trusted authority and is currently valid.
|
|#### Scenario: Circuit with correct signal structure
|- **WHEN** the `agent-identity-v1` circuit is compiled
|- **THEN** it exposes private inputs: `normalizedCredential`, `issuerSignature`, `salt`
|- **AND** it exposes public inputs: `credentialCommitment`, `issuerPublicKey`, `nowSec`
|
|#### Scenario: Circuit ID registration
|- **WHEN** the circuit is registered with the Lemma oracle
|- **THEN** it is identified by the circuit ID `agent-identity-v1`
|
### Requirement: Credential commitment via Poseidon hash
|The circuit SHALL compute `credentialCommitment` as a Poseidon hash of the normalized credential fields, ensuring the commitment is SNARK-friendly and deterministic.
|
|#### Scenario: Deterministic commitment from normalized credential
|- **WHEN** the same normalized credential and salt are provided as private inputs
|- **THEN** the circuit computes the same `credentialCommitment` as a public output
|
|#### Scenario: Different credentials produce different commitments
|- **WHEN** two different normalized credentials are provided
|- **THEN** the resulting `credentialCommitment` values differ
|
### Requirement: Issuer signature verification
|The circuit SHALL verify that the credential was signed by the issuer identified by `issuerPublicKey`. The signature scheme SHALL be compatible with future selective disclosure.
|
|#### Scenario: Valid issuer signature passes verification
|- **WHEN** a credential signed by the issuer corresponding to `issuerPublicKey` is provided
|- **THEN** the signature verification constraint is satisfied
|
|#### Scenario: Invalid issuer signature fails verification
|- **WHEN** a credential signed by a different issuer is provided with a mismatched `issuerPublicKey`
|- **THEN** the circuit constraint fails and no valid proof can be generated
|
### Requirement: Lifecycle validity enforcement
|The circuit SHALL enforce that the credential is within its valid lifecycle window: issued before the current time, not expired, and not revoked.
|
|#### Scenario: Unexpired, non-revoked credential passes
|- **WHEN** a credential with `issuedAt <= nowSec`, `expiresAt > nowSec` (or `expiresAt` absent), and `revoked == false` is provided
|- **THEN** the lifecycle constraint is satisfied
|
|#### Scenario: Expired credential fails
|- **WHEN** a credential with `expiresAt <= nowSec` is provided
|- **THEN** the lifecycle constraint fails and no valid proof can be generated
|
|#### Scenario: Revoked credential fails
|- **WHEN** a credential with `revoked == true` is provided
|- **THEN** the lifecycle constraint fails and no valid proof can be generated
|
|#### Scenario: Not-yet-issued credential fails
|- **WHEN** a credential with `issuedAt > nowSec` is provided
|- **THEN** the lifecycle constraint fails and no valid proof can be generated
|
### Requirement: Circuit build script
|The system SHALL provide a build script that compiles the circom circuit, generates Powers of Tau, performs Groth16 setup and contribution, and exports the verification key.
|
|#### Scenario: Build script produces all required artifacts
|- **WHEN** the build script is executed
|- **THEN** it produces: R1CS file, WASM, zkey, and verification key JSON in the `circuits/build/` directory
|
### Requirement: Circuit registration with Lemma oracle
|The system SHALL provide a registration script that uploads the compiled circuit artifacts (WASM, zkey) to IPFS via Pinata and registers the circuit metadata with the Lemma oracle via `circuits.register`.
|
|#### Scenario: Successful registration
|- **WHEN** the registration script is executed with valid API keys
|- **THEN** the circuit artifacts are uploaded to IPFS and the circuit metadata is registered with the oracle
|- **AND** `circuits.getById("agent-identity-v1")` returns the registered metadata
|
|#### Scenario: Registration uses circuits.register not schemas.register
|- **WHEN** the registration script runs
|- **THEN** it calls `circuits.register` from the Lemma SDK, not `schemas.register`
|
### Requirement: Public output compatibility with downstream circuits
|The circuit's public outputs (`credentialCommitment`, `issuerPublicKey`) SHALL be consumable by downstream circuits (e.g., `role-spend-limit-v1`) as trust anchors. The `credentialCommitment` SHALL be a Poseidon field element compatible with BN254.
|
|#### Scenario: Downstream circuit references agent-identity commitment
|- **WHEN** a downstream circuit receives `credentialCommitment` and `issuerPublicKey` as public inputs from an `agent-identity-v1` proof
|- **THEN** the downstream circuit can use `credentialCommitment` as a binding constraint input without re-deriving it
