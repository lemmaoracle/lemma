## Why

Agent-identity circuit's Groth16 Verifier contract needs to be deployed on-chain so that on-chain verification can actually happen. Currently, `register-circuit.ts` only registers circuit metadata (IPFS artifacts + a single verifier entry) with the Lemma API, but there is no Foundry-based deployment pipeline to put the Verifier contract on any network. Supporting multiple target networks (base_sepolia + monad_testnet) from the start avoids rework and aligns with the x402 package's existing Foundry deployment pattern.

## What Changes

- Add a Foundry project under `packages/agent/circuits/forge/` (or a `foundry.toml` + deploy script at `packages/agent/circuits/`) to compile and deploy the snarkjs-generated `Groth16Verifier` Solidity contract
- Create a Forge deploy script (`DeployAgentIdentityVerifier.s.sol`) modeled after `packages/x402/scripts/DeployPaymentVerifier.s.sol`
- Configure `foundry.toml` with RPC endpoints and Etherscan verification for `base_sepolia` and `monad_testnet`
- Modify `register-circuit.ts` to support registering verifiers across multiple networks (currently hardcoded to a single `CHAIN_ID` / `VERIFIER_ADDRESS`)

## Capabilities

### New Capabilities
- `verifier-deploy`: Foundry-based compilation and deployment of the agent-identity Groth16 Verifier contract to target EVM networks
- `multi-network-registration`: Circuit registration that declares on-chain verifiers for multiple chains in a single run

### Modified Capabilities

## Impact

- **New files**: `foundry.toml`, `DeployAgentIdentityVerifier.s.sol`, `lib/` (forge-std) under `packages/agent/circuits/`
- **Modified files**: `packages/agent/scripts/register-circuit.ts` — `buildCircuitMeta` and `verifiers` array must accept multiple chain entries
- **Dependencies**: Requires `forge` CLI installed; `PRIVATE_KEY` env var for deployment; existing Pinata/Lemma API keys unchanged
- **Networks**: base_sepolia (chain 84532), monad_testnet (chain 10143)
