## 1. Parent instance

- [x] 1.1 Default `--instance-type` to `m6i.xlarge`
- [x] 1.2 Reject burstable, bare-metal, and other families Nitro Enclaves will not start

## 2. Network

- [x] 2.1 Select a subnet with a default route to an internet gateway
- [x] 2.2 Launch with `--subnet-id` and `--associate-public-ip-address`
- [x] 2.3 Create and tear down a dedicated VPC when no public subnet exists

## 3. Enclave resources

- [x] 3.1 Pass memory, CPU, and client timeout through `sudo env`
- [x] 3.2 Size the snarkjs heap from enclave memory without putting entropy on argv
- [x] 3.3 Point the memory warning at `--enclave-memory-mb`

## 4. Validate

- [x] 4.1 `pnpm --filter @lemmaoracle/cauldron test`

## 5. Invocation

- [x] 5.1 Require only `--circuit`; derive r1cs, initial zkey, final zkey, and a sole final ptau
- [x] 5.2 Keep SSH keypairs disposable and out of the CLI arguments

## 6. Circuit builds

- [x] 6.1 Replace `snarkjs zkey contribute` in every circuit `build.sh` with `cauldron phase2`
