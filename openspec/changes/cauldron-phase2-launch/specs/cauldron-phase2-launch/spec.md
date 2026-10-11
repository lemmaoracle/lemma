# cauldron-phase2-launch Specification

## ADDED Requirements

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
(`groth16 setup` and powers of tau) stays in the build script. Those
scripts MUST NOT invoke `snarkjs zkey contribute`. When `cauldron` is not
on `PATH`, the build MUST stop.

#### Scenario: A circuit build calls cauldron
- **WHEN** a circuit `build.sh` finishes `groth16 setup`
- **THEN** it runs `cauldron phase2` with `--circuit` and `--ptau`

#### Scenario: cauldron is not installed
- **WHEN** a circuit build reaches phase 2 and `cauldron` is not on `PATH`
- **THEN** the script exits because the command is missing
