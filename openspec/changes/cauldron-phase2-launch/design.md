## Context

Phase 2 runs `snarkjs zkey contribute` inside a Nitro Enclave on a fresh EC2
parent. The parent must be a non-burstable Nitro instance with at least 4
vCPUs for Intel/AMD, and the operator must SSH to a public IPv4 address.
`sudo` on Amazon Linux resets the environment, so enclave allocator settings
have to be command arguments.

## Goals / Non-Goals

- Goals: a parent AWS will actually start an enclave on; an explicit public
  subnet and public IPv4; enclave memory/CPU/timeout that survive `sudo`; a
  V8 heap that grows with that memory; teardown of any VPC this run created.
- Non-Goals: measuring PCR0/1/2. Those values come from `nitro-cli
  describe-eif` on a Nitro host and must stay `measured: false` until then.
  Inventing them would make the golden file a self-check.

## Decisions

### D1: `m6i.xlarge` is the default parent

4 vCPU / 16 GiB matches the existing allocator comment (2 vCPU and 8192 MiB
for the enclave, the rest for the parent). `t3.xlarge` is the same size and
is rejected by the Nitro Enclaves API. Families AWS documents as unsupported
(`t2`, `t3`, `t3a`, `t4g`, `a1`, `g5g`, `im4gn`, `is4gen`, `u-*`, bare metal)
are rejected before `RunInstances`.

### D2: reuse a public default-VPC subnet, otherwise create one

A subnet is public only when its route table (or the VPC main table) has
`0.0.0.0/0` to an `igw-`. `MapPublicIpOnLaunch` is not enough, so the launch
also sets `--associate-public-ip-address`. The security group is created in
that VPC. A dedicated network is `10.66.0.0/16` with subnet `10.66.1.0/24`,
tagged `lemma-cauldron=<run-id>`, and deleted only when this run created it.

### D3: integers cross `sudo` via `sudo env`

`--enclave-memory-mb` (default 8192, even, at least 1024), `--enclave-cpu`
(default 2), and `--client-timeout-ms` (default 8 hours, at most 24) are
interpolated only after they are checked to be positive integers. The remote
script turns memory into a heap with `enclaveHeapMb` (three quarters; 8192
stays 6144) and the client sends that integer as a JSON frame. The enclave
builds `NODE_OPTIONS` itself. Contribution entropy stays on snarkjs stdin.

### D4: circuit builds source `lemma_phase2`

Each Groth16 `build.sh` sources `packages/cauldron/scripts/phase2.sh` and
calls `lemma_phase2 <stem> <ptau>` after `groth16 setup`. The helper resolves
its own directory from `BASH_SOURCE` and runs `node cauldron.mjs phase2`.
Phase 1, including `powersoftau contribute` fallbacks, stays on the host.
Roles passes `--ptau` explicitly because one directory holds more than one
final ptau.

## Risks / Trade-offs

- A dedicated VPC needs create/delete permissions that the previous flow did
  not. Accounts that already have a public default subnet do not use them.
- The memory estimate is still `zkey × 16 + 512MiB` and does not block the
  run. 650MB-class zkeys are still unmeasured on real Nitro hardware.
- Golden PCRs remain a placeholder. `phase2` keeps warning and comparing
  only the host manifest until `measured` is set from a real EIF.
- Every circuit build now spends phase 2 on AWS. A build without
  credentials stops at `lemma_phase2`.
