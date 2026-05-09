## Context

The `packages/agent/circuits` directory contains the agent-identity circom circuit and its build artifacts (WASM, zkey, vkey). The circuit build script (`scripts/build.sh`) compiles the circuit and generates a Groth16 verification key, but there is no pipeline to:

1. Generate the Solidity Verifier contract from the verification key
2. Deploy that contract to target EVM networks
3. Register multiple on-chain verifier addresses with the Lemma API

The `packages/x402` package already demonstrates this pattern: it has a pre-generated `PaymentVerifier.sol`, a Foundry project (`foundry.toml` with RPC endpoints for `base_sepolia` and `monad_testnet`), and a deploy script (`DeployPaymentVerifier.s.sol`).

The current `register-circuit.ts` is hardcoded to a single verifier entry (`VERIFIER_ADDRESS` + `CHAIN_ID` env vars) and must be generalized to support multiple networks.

## Goals / Non-Goals

**Goals:**
- Generate the `Groth16Verifier` Solidity contract from `agent-identity_vkey.json` using snarkjs
- Set up a Foundry project within `packages/agent/circuits/` to compile and deploy the Verifier
- Deploy to `base_sepolia` (chain 84532) and `monad_testnet` (chain 10143)
- Modify `register-circuit.ts` to accept and register verifiers for multiple networks in a single invocation
- Follow the existing x402 deployment pattern for consistency

**Non-Goals:**
- Modifying the circom circuit itself
- Changing the Pinata upload flow or IPFS artifact handling
- Adding new networks beyond base_sepolia and monad_testnet (can be added later)
- Automating deployment in CI/CD (manual `forge script` for now)

## Decisions

### 1. Foundry project location: `packages/agent/circuits/` (root of circuits package)

Placing `foundry.toml` and `scripts/` at the circuits package root keeps deployment co-located with the circuit artifacts. The `build/` directory already contains the verifier key, and snarkjs can generate the Solidity file directly into `build/`.

**Alternative considered**: A separate `forge/` subdirectory. Rejected — adds unnecessary nesting; the x402 package puts `foundry.toml` at its root.

### 2. Verifier contract generation: snarkjs `zkey export solidityverifier`

Run `snarkjs zkey export solidityverifier` as part of the build script (or as a separate npm script) to produce `build/AgentIdentityVerifier.sol` from `agent-identity_final.zkey`. This mirrors how x402's `PaymentVerifier.sol` was generated.

**Alternative considered**: Manually copying the vkey JSON into a template. Rejected — snarkjs is already a dependency and generates the correct contract.

### 3. Deploy script: `scripts/DeployAgentIdentityVerifier.s.sol`

Follow the x402 pattern: a simple Forge script that reads `PRIVATE_KEY` from env, broadcasts, deploys `Groth16Verifier`, and logs the address. The contract class name in the generated Solidity is `Groth16Verifier`, same as x402.

### 4. Multi-network registration: array-driven verifier config in `register-circuit.ts`

Replace the single `VERIFIER_ADDRESS` / `CHAIN_ID` env vars with a `VERIFIER_NETWORKS` JSON env var (or multiple prefixed vars like `VERIFIER_ADDRESS_BASE_SEPOLIA`). The script reads the deployed addresses and builds the `verifiers` array with entries for each network.

**Alternative considered**: Running the script once per network. Rejected — the Lemma API's `verifiers` field is an array; a single registration with all networks is cleaner and avoids partial states.

**Chosen approach**: Use a `VERIFIER_NETWORKS` env var containing a JSON array:
```json
[
  {"chainId": 84532, "address": "0x..."},
  {"chainId": 10143, "address": "0x..."}
]
```
This is explicit, extensible, and avoids proliferating env vars. The old `VERIFIER_ADDRESS` / `CHAIN_ID` vars remain supported as a fallback for backward compatibility.

### 5. Foundry config mirrors x402

`foundry.toml` at `packages/agent/circuits/` with `src = "build"`, same RPC endpoints, same Etherscan config. Forge-std installed via `forge install`.

## Risks / Trade-offs

- **[Risk] Generated Solidity may not compile with `solc_version = 0.8.28`** → snarkjs generates contracts with `pragma solidity >=0.7.0 <0.9.0`, which is compatible. If issues arise, pin a compatible solc version.
- **[Risk] Same `Groth16Verifier` contract name across x402 and agent packages** → No conflict since they are in separate Foundry projects with separate `out/` directories.
- **[Risk] `VERIFIER_NETWORKS` JSON env var is more complex than simple env vars** → Acceptable trade-off for multi-network support; the script provides clear error messages on parse failure.
- **[Trade-off] Manual deployment vs. CI/CD** → Manual for now; CI integration can be added later when the deployment workflow is stable.
