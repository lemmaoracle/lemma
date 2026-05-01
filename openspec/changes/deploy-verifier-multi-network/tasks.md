## 1. Generate Solidity Verifier Contract

- [ ] 1.1 Add `generate-solidity` npm script to `packages/agent/circuits/package.json` that runs `snarkjs zkey export solidityverifier build/agent-identity_final.zkey build/AgentIdentityVerifier.sol`
- [ ] 1.2 Run the script to generate `build/AgentIdentityVerifier.sol` and verify the file contains a `Groth16Verifier` contract

## 2. Set Up Foundry Project

- [ ] 2.1 Create `foundry.toml` at `packages/agent/circuits/` with `src = "build"`, `out = "out"`, `libs = ["lib"]`, `solc_version`, optimizer settings, and RPC endpoints for `base_sepolia` and `monad_testnet` (mirroring x402 config)
- [ ] 2.2 Add Etherscan verification config for both networks in `foundry.toml`
- [ ] 2.3 Run `forge install forge-std` in `packages/agent/circuits/` to set up `lib/forge-std`
- [ ] 2.4 Run `forge build` to verify the generated Solidity compiles successfully

## 3. Create Deploy Script

- [ ] 3.1 Create `packages/agent/circuits/scripts/DeployAgentIdentityVerifier.s.sol` following the x402 `DeployPaymentVerifier.s.sol` pattern: import `Groth16Verifier` from `../build/AgentIdentityVerifier.sol`, read `PRIVATE_KEY` from env, deploy via `vm.startBroadcast`
- [ ] 3.2 Add `deploy:base-sepolia` and `deploy:monad-testnet` npm scripts to `packages/agent/circuits/package.json` that run the appropriate `forge script` commands with `--rpc-url` and `--broadcast`

## 4. Multi-Network Registration in register-circuit.ts

- [ ] 4.1 Add `VerifierNetworkEntry` type (`Readonly<{ chainId: number; address: string }>`) and a `parseVerifierNetworks` function that reads and validates `VERIFIER_NETWORKS` JSON env var
- [ ] 4.2 Implement fallback logic: if `VERIFIER_NETWORKS` is not set, derive a single-entry array from `VERIFIER_ADDRESS` / `CHAIN_ID` for backward compatibility; if both are set, `VERIFIER_NETWORKS` takes precedence
- [ ] 4.3 Refactor `buildCircuitMeta` to accept a `ReadonlyArray<VerifierNetworkEntry>` and build the `verifiers` array with one entry per network
- [ ] 4.4 Update the success log output to print all registered verifier addresses and chain IDs
- [ ] 4.5 Verify the script still works with legacy `VERIFIER_ADDRESS` / `CHAIN_ID` env vars (backward compat)

## 5. Integration Verification

- [ ] 5.1 Verify `forge build` compiles without errors in `packages/agent/circuits/`
- [ ] 5.2 Run `register-circuit.ts` with `VERIFIER_NETWORKS` set to a test JSON array and confirm the correct `verifiers` array is built (dry-run / log check)
