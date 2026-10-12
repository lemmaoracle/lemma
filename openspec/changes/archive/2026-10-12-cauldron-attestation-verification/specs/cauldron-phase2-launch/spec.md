## ADDED Requirements

### Requirement: Attestation follows the Nitro document format
Verification MUST read certificate and cabundle from the CBOR payload and MUST
verify the original COSE_Sign1 signature. It MUST accept an empty unprotected
header and construct a valid leaf-to-root chain from AWS's root-first cabundle.

#### Scenario: Standard Nitro attestation
- **WHEN** an attestation has an empty unprotected header and a signed payload containing a valid certificate and root-first CA bundle
- **THEN** certificate and signature validation succeeds without adding header certificates

### Requirement: Golden PCR policy is independent and mandatory
Phase2 and offline verify MUST require a local golden manifest with measured
PCR0/1/2. Missing, unmeasured or malformed golden measurements MUST fail closed.
Phase2 MUST validate this policy before making AWS calls. A golden field from
the parent manifest MUST NOT satisfy this requirement.

#### Scenario: Unmeasured bundled manifest
- **WHEN** phase2 uses the bundled golden manifest with measured false
- **THEN** it exits before resolving an AMI or creating AWS resources

#### Scenario: Parent supplies its own golden values
- **WHEN** the parent manifest contains matching golden values but no independent measured local golden manifest is available
- **THEN** offline verification fails

### Requirement: Build-input checks cover the complete enclave application
The build-input manifest MUST hash Dockerfile, package.json, package-lock.json,
requirements.txt, .dockerignore, serve.mjs, attest.py, frame.mjs and entry.sh.
Unless explicitly skipped, verification MUST reject absent or incomplete build
input hashes. Skipping build checks MUST NOT skip golden PCR validation.

#### Scenario: Runtime source changes
- **WHEN** serve.mjs or another copied enclave runtime file changes
- **THEN** its recorded build-input hash no longer matches the local source

### Requirement: Public beacon does not replace secret destruction
Documentation MUST NOT claim that an honest public beacon makes a compromised
TEE contribution safe. A trust guarantee independent of AWS MUST require an
independent secret contribution whose secret is discarded.

#### Scenario: Contribution secret is retained
- **WHEN** an adversary retains the contribution delta before a public deterministic beacon
- **THEN** the documentation recognizes that the final delta can also be computed
