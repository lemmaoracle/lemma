# @lemmaoracle/cauldron

TEE setup that runs Groth16 trusted-setup **phase 2 (`snarkjs zkey contribute`) inside AWS Nitro Enclaves**
and keeps the attestation document as evidence. Circuit builds (seal, mizudako, and others) share it.

As an alternative to an MPC ceremony, an attestation document signed by the AWS Nitro hypervisor shows that
the approved enclave produced the contribution. Trust in secret generation and disposal also requires
independently approved PCR measurements of the enclave code. The proof system stays **Groth16**.

## Three ways to install

1. **npm global install (recommended).** Circuit builds are shell scripts (`build.sh` and similar), so
   `npm i -g @lemmaoracle/cauldron` puts a `cauldron` command on `PATH`.
   The same command works from any repository and any circuit.

   ```bash
   # Circuit build.sh files in this repository call the same command.
   # If cauldron is not on PATH, the build stops there.
   cauldron phase2 --circuit "$BUILD_DIR/$CIRCUIT_NAME" --ptau "$PTAU"
   ```

2. **Copy and run (offline).** `scripts/cauldron.mjs` is a single file with no dependencies.
   Copy it into a circuit repository and run `node cauldron.mjs …`. No npm install.
3. **Workspace dependency.** Inside this monorepo, a pnpm workspace member can depend on
   `"@lemmaoracle/cauldron": "workspace:*"`.
   Nested packages such as `packages/seal/circuits`, and other repositories, cannot.

## Usage

The only required argument is `--circuit`. AWS credentials are not flags. Leave them to the environment the `aws` CLI already reads (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, plus `AWS_SESSION_TOKEN` for temporary credentials) or to a profile. Do not pass an SSH private key. Each run creates `lemma-tee-<run-id>`, deletes that key pair from AWS on exit, and shreds the local pem.

Before a real run, independently build and review the EIF and approve its PCR0/1/2
using the measurement steps below. The bundled `enclave/expected-pcrs.json` is
unmeasured, so `phase2` stops before making AWS calls until it is replaced with
approved measurements or a measured local manifest is supplied with `--golden`.
Offline `verify` enforces the same requirement. The parent's returned manifest
cannot provide this approval. `--dry-run` can still print the plan without measurements.

`--circuit` names `build/<name>.r1cs` and `build/<name>_0000.zkey`. The output is `build/<name>_final.zkey`. A bare name looks at `./build/<name>` first. A path ending in `.r1cs` or `_0000.zkey` is accepted too. When the neighboring `ptau/` directory contains exactly one `*_final.ptau`, phase 2 uses it for `snarkjs zkey verify`.

```bash
# From the circuit directory. Region, instance type, and enclave size stay at their defaults.
cauldron phase2 --circuit seal-identity
# Same thing: cauldron phase2 --circuit build/seal-identity
# When using an independently approved local manifest:
cauldron phase2 --circuit seal-identity --golden /path/to/approved-pcrs.json

# Print the steps only. This does not call AWS.
node cauldron.mjs phase2 --dry-run --circuit seal-identity

# Anyone can re-verify later. No AWS API.
# nonce = sha256(zkey_0000) || sha256(zkey_final). A hash of the input alone does not pass.
node cauldron.mjs verify --circuit seal-identity

# Clean up resources left by a failed run. A normal exit does not need this.
node cauldron.mjs teardown --run-id <id>
```

The default region is `us-east-1`, the parent is `m6i.xlarge` (4 vCPU / 16 GiB), and the enclave is 8192 MiB / 2 vCPU. Pass `--region`, `--instance-type`, `--enclave-memory-mb`, `--enclave-cpu`, or `--ptau` only when those defaults are wrong. Pass `--r1cs`, `--zkey-in`, and `--zkey-out` only when the filenames do not follow the convention.

Outputs: `zkey_final`, `zkey_final.attestation.cbor`, and `zkey_final.pcrs.json`.
Keep the attestation document and the PCR manifest next to the zkey (evidence anyone can re-verify).
Zkey transfer uses a 4-byte length prefix and rejects a frame over 1 GiB (expected zkeys are about 650 MB). The remote run waits at most 10 hours.

## What happens

First, check that the local golden manifest has independently measured PCR0/1/2.
An absent, unmeasured or malformed manifest stops the run before provisioning.

1. Create a key pair (name `lemma-tee-<run-id>`), a security group, and an EC2 instance **from scratch**. The default instance is **`m6i.xlarge` (4 vCPU / 16 GiB)**. `t2` / `t3` / `t3a` / `t4g` / `a1` / `g5g` / `im4gn` / `is4gen`, bare metal, and `u-*` are rejected before launch. The subnet is an explicit public subnet of the default VPC (one whose route table sends traffic to an IGW), and `--associate-public-ip-address` assigns a public IPv4 address. If no such subnet exists, the run creates a dedicated VPC `10.66.0.0/16` and an IGW, and deletes them on exit. The security group is created in that VPC. The instance and the security group (and the VPC, subnet, and IGW when this run created them) are tagged `lemma-cauldron=<run-id>`.
2. Build the enclave image → `nitro-cli build-enclave` → **save the expected PCR0/1/2 measurements in the manifest**.
3. Start the enclave → send `zkey_0000` over vsock.
4. Inside the enclave: `zkey contribute` with a CSPRNG (entropy on snarkjs stdin, not `-e`) → fetch an NSM attestation document whose nonce is `sha256(zkey_0000) || sha256(zkey_final)`.
5. **Verify offline** the returned `zkey_final` and attestation (COSE_Sign1 / ES384 raw signature → certificate chain to the pinned root → PCR0/1/2 → golden PCRs → build-input hashes → nonce → timestamp). `zkey_out` is not written until verification passes.
6. **Teardown (also on failure, and even if only the key pair or security group was created)**: terminate the instance → wait until the ENI detaches → delete the key pair and security group.

## Trust-model limits

- **AWS Nitro is the root of trust** (a centralized place to put trust). Say so whenever this is explained externally.
- Verification checks **PCR0, PCR1, and PCR2**, not PCR0 alone (PCR0 cannot tell nested images apart).
  The host-written `pcrs.json` is that instance's own report of the EIF it built. The independent check is `enclave/expected-pcrs.json` in this repository (`--golden`).
- The nonce binds both the input and the output. The parent instance relays vsock, so an input-only hash lets it swap `zkey_final`.
  **Re-presenting an attestation for the same input and output zkeys is a valid binding** (outside the timestamp window, pass the original time with `--now`).
- The default root certificate is pinned by fingerprint in source. `--root-cert` is for tests: the PEM you pass becomes the new trust anchor.
- Certificates are checked for the CA bit and keyUsage, plus EKU and name constraints. An attestation leaf must not carry TLS serverAuth or clientAuth. Name constraints apply only when the CA includes the extension (the AWS root does not).
- Required memory is estimated as `zkey × 16 + 512 MiB`. If that exceeds `--enclave-memory-mb` (default 8192), phase 2 warns before it runs. The value reaches the remote `setup-and-run.sh` as `sudo env ENCLAVE_MEMORY_MB=…`. The in-enclave snarkjs heap is three quarters of that (6144 when memory is 8192), and contribution entropy is not placed on argv or in the environment. 650 MB-class zkeys are not yet measured on real Nitro hardware. The warning is an estimate and does not stop the run. When you raise memory, also raise `--instance-type` so the parent OS still has room.
- EIF metadata is not attested. Side channels are outside the threat model (same as the usual industry model).
- A public `snarkjs zkey beacon` contribution is deterministic once the beacon is
  published. It cannot restore secrecy if AWS or an enclave has retained the prior
  contribution secret. An AWS-independent secret-disposal guarantee requires an
  independent secret contribution whose secret is discarded.

## AWS permissions

`ec2:CreateKeyPair` / `DeleteKeyPair` / `CreateSecurityGroup` / `DeleteSecurityGroup` /
`AuthorizeSecurityGroupIngress` / `RunInstances` / `TerminateInstances` / `DescribeInstances` /
`DescribeSecurityGroups` / `DescribeNetworkInterfaces` / `DescribeVpcs` / `DescribeSubnets` /
`DescribeRouteTables` / `DescribeInternetGateways` / `CreateVpc` / `DeleteVpc` / `CreateSubnet` /
`DeleteSubnet` / `ModifySubnetAttribute` / `CreateInternetGateway` / `DeleteInternetGateway` /
`AttachInternetGateway` / `DetachInternetGateway` / `CreateRoute` / `ssm:GetParameter`.
Accounts whose default VPC already has a public subnet do not use `CreateVpc` or the calls after it. The instance has no IAM role. IMDS cannot be disabled entirely because cloud-init injects the per-run SSH key through it; only IMDSv2 is enabled with a hop limit of 1. An attacker who already controls the parent can therefore read instance metadata (it holds no credentials), while the enclave still has no path to it. KMS is not required (the design holds no key).
`verify` needs no AWS permissions at all.

## Root certificate used for verification

`certs/aws-nitro-root.pem` is the official **AWS_NitroEnclaves_Root-G1** (subject: `CN=aws.nitro-enclaves`).
Source: <https://aws-nitro-enclaves.amazonaws.com/AWS_NitroEnclaves_Root-G1.zip>
(the public CA named in the AWS document "Verifying the root of trust").
SHA-256 fingerprint: `64:1A:03:21:A3:E2:44:EF:E4:56:46:31:95:D6:06:31:7E:D7:CD:CC:3C:17:56:E0:98:93:F3:C6:8F:79:BB:5B`

## Rebuilding the EIF and checking PCRs

`enclave/expected-pcrs.json` stays `measured: false` with PCR0/1/2 set to `null` until it is measured. Passing that file as `--golden` fails verification (a placeholder is not accepted as an expected value).

1. Review all enclave image inputs: `Dockerfile`, `package.json`, `package-lock.json`, `requirements.txt`, `.dockerignore`, `serve.mjs`, `attest.py`, `frame.mjs`, and `entry.sh`. `verify` requires their SHA-256 hashes in the parent manifest and compares them with the local `enclave/` directory. These host-reported hashes do not replace independently approved PCRs. `--skip-build-check` skips only the hash comparison and still requires golden PCR verification.
2. Image inputs are pinned. The base is `node:20.20.2-alpine3.22@sha256:8f47899606d000b0704e992f927fe7335adcd0d6c98851600072fb6e14a13e60`. apk pins `python3=3.12.15-r0`, `py3-pip=25.1.1-r0`, and `socat=1.8.1.3-r0`. npm uses the vendored `package-lock.json` via `npm ci`. pip uses `==` and `--require-hashes` from `requirements.txt`.
3. On a Nitro Enclaves instance, run `docker build` and `nitro-cli build-enclave` in the same order as `enclave/setup-and-run.sh`, and read PCR0/1/2 from `nitro-cli describe-eif`.
4. After independently approving the measured EIF, write those 96 hex digits into `pcrs` in a local golden manifest (or `enclave/expected-pcrs.json`) and set `measured` to `true`. Record the hashes of the reviewed build inputs in `build.inputs` with `hash-build-inputs.mjs`. Rebuild and approve new measurements whenever the image inputs change. Do not promote the production parent's returned PCR manifest to golden approval without an independent check.
5. `cauldron verify --attestation … --pcrs … --zkey-in … --zkey-out … --golden enclave/expected-pcrs.json` checks both the host manifest and the golden file against the attestation PCRs.

Looking only at the manifest the host returned is that parent instance comparing itself with itself. Both `phase2` and `verify` reject an absent, malformed or unmeasured local golden manifest. A `golden` field in the parent's manifest is ignored as a source of approval.

## Tests

`pnpm --filter @lemmaoracle/cauldron test` (vitest; it does not call real AWS.
COSE_Sign1 verification is checked with a chain generated by openssl).
