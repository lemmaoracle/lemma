## Why

`cauldron phase2` cannot finish a Nitro Enclave contribute on a normal account.
The default parent is `t3.xlarge`, which AWS refuses for Nitro Enclaves, and
launch omits both the subnet and public IPv4 assignment, so a region without a
default VPC never becomes reachable over SSH. Enclave size flags exist only
inside `setup-and-run.sh`; `sudo` drops them, so the CLI's 8192 MiB warning
cannot be acted on.

## What Changes

- Default the parent to `m6i.xlarge` (4 vCPU / 16 GiB) and reject burstable,
  bare-metal, and other instance families Nitro Enclaves will not start
- Resolve a public subnet (a route to an internet gateway) and pass
  `--subnet-id` plus `--associate-public-ip-address`. Create a dedicated VPC
  when the region has no such subnet, and delete it on teardown
- Pass `ENCLAVE_MEMORY_MB`, `ENCLAVE_CPU`, and `CLIENT_TIMEOUT_MS` with
  `sudo env`, and size the in-enclave V8 heap to three quarters of that memory
- Leave `enclave/expected-pcrs.json` at `measured: false` until a real
  `nitro-cli describe-eif` is recorded
- Replace `snarkjs zkey contribute` in every circuit `build.sh` with
  `lemma_phase2` from `packages/cauldron/scripts/phase2.sh`. Phase 1 stays
  local

## Capabilities

### New Capabilities

- `cauldron-phase2-launch`: parent instance, network, and enclave resource
  selection for Groth16 phase 2 inside AWS Nitro Enclaves

### Modified Capabilities

(none)

## Impact

- `packages/cauldron` CLI, enclave client/server framing, and README
- Every Groth16 circuit `build.sh` now requires AWS credentials at phase 2
- Extra EC2 permissions when a dedicated VPC is created
- No change to attestation verification or the contribution-entropy rule
