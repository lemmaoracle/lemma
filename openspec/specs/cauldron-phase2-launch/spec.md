# cauldron-phase2-launch Specification

## Purpose

`cauldron phase2` runs Groth16 phase 2 inside an AWS Nitro Enclave. The parent instance, the network, and the enclave size must be ones Nitro can actually start, and circuit builds call the global `cauldron` command.

## Requirements

### Requirement: Phase 2 takes the circuit and nothing else on the command line
`cauldron phase2` MUST require `--circuit` and MUST derive `<name>.r1cs`,
`<name>_0000.zkey`, and `<name>_final.zkey` from it. A bare name MUST
prefer `./build/<name>`. The command MUST NOT take an SSH private key.
AWS credentials stay with the AWS CLI. When exactly one `*_final.ptau`
sits beside the circuit, phase 2 MUST use it for `snarkjs zkey verify`.

#### Scenario: Bare circuit name
- **WHEN** `phase2` is invoked with `--circuit seal-identity` and
  `build/seal-identity.r1cs` exists
- **THEN** the initial zkey is `build/seal-identity_0000.zkey` and the
  output is `build/seal-identity_final.zkey`

#### Scenario: Missing circuit
- **WHEN** `phase2` is invoked without `--circuit` and without explicit
  r1cs and zkey paths
- **THEN** the command fails before creating EC2 resources

### Requirement: Phase 2 launches a Nitro-capable parent
`cauldron phase2` MUST default `--instance-type` to `m6i.xlarge` and MUST
reject instance families that cannot start Nitro Enclaves, including
burstable `t2` / `t3` / `t3a` / `t4g`, `a1`, `g5g`, `im4gn`, `is4gen`, `u-*`,
and bare metal, before calling `RunInstances`.

#### Scenario: Default parent is m6i.xlarge
- **WHEN** `phase2` is invoked without `--instance-type`
- **THEN** the parent instance type is `m6i.xlarge`

#### Scenario: Burstable parent is rejected
- **WHEN** `phase2` is invoked with `--instance-type t3.xlarge`
- **THEN** the command fails before creating EC2 resources

### Requirement: Phase 2 does not depend on a default VPC
`phase2` MUST launch into an explicit subnet that has a route to an
internet gateway and MUST request a public IPv4 address. When the region
has no such subnet, it MUST create a dedicated VPC and delete that VPC on
teardown. A default VPC that the run did not create MUST be left in place.

#### Scenario: Public subnet is explicit
- **WHEN** the region has a default VPC subnet whose route table sends
  `0.0.0.0/0` to an internet gateway
- **THEN** `RunInstances` receives that `--subnet-id` and
  `--associate-public-ip-address`, and teardown does not delete the VPC

#### Scenario: Missing public subnet creates a VPC
- **WHEN** the region has no default VPC or none of its subnets route to
  an internet gateway
- **THEN** the run creates a tagged VPC, subnet, and internet gateway,
  launches there, and teardown deletes those resources

### Requirement: Enclave size flags reach the allocator
`phase2` MUST pass `--enclave-memory-mb`, `--enclave-cpu`, and
`--client-timeout-ms` to the remote `setup-and-run.sh` with `sudo env`.
The in-enclave Node heap MUST be three quarters of the enclave memory
(8192 MiB yields 6144) and MUST be supplied as an integer header, not as a
free-form `NODE_OPTIONS` string. Contribution entropy MUST NOT appear on
the snarkjs argument vector.

#### Scenario: sudo does not drop the allocator settings
- **WHEN** phase 2 runs the remote setup script
- **THEN** the remote command sets `ENCLAVE_MEMORY_MB`, `ENCLAVE_CPU`, and
  `CLIENT_TIMEOUT_MS` via `sudo env`

#### Scenario: Default heap stays 6144
- **WHEN** enclave memory is 8192 MiB
- **THEN** the contribute header requests `--max-old-space-size=6144`

### Requirement: Circuit builds delegate phase 2
Every Groth16 circuit `build.sh` in this repository MUST run phase 2 by
invoking the global `cauldron` command (`cauldron phase2 --circuit …`).
The scripts MUST NOT source a path into `packages/cauldron`. Phase 1
(`groth16 setup` and powers of tau) stays in the build script. The default
path MUST NOT invoke `snarkjs zkey contribute`. When `cauldron` is not
on `PATH`, the build MUST stop. The x402 test script MAY set
`LEMMA_PHASE2=local` so CI can build a fixture zkey without AWS.

#### Scenario: A circuit build calls cauldron
- **WHEN** a circuit `build.sh` finishes `groth16 setup`
- **THEN** it runs `cauldron phase2` with `--circuit` and `--ptau`

#### Scenario: cauldron is not installed
- **WHEN** a circuit build reaches phase 2 and `cauldron` is not on `PATH`
- **THEN** the script exits because the command is missing

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
