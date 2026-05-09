## ADDED Requirements

### Requirement: Generate Solidity Verifier from circuit artifacts
The build pipeline SHALL generate a `Groth16Verifier` Solidity contract from the `agent-identity_final.zkey` file using snarkjs `zkey export solidityverifier`. The output file SHALL be placed at `packages/agent/circuits/build/AgentIdentityVerifier.sol`.

#### Scenario: Successful Solidity generation
- **WHEN** the verifier generation command is run after circuit compilation
- **THEN** a file `build/AgentIdentityVerifier.sol` containing a `Groth16Verifier` contract is created in the circuits package

#### Scenario: Missing zkey file
- **WHEN** the verifier generation command is run but `agent-identity_final.zkey` does not exist
- **THEN** the command SHALL fail with a clear error message indicating the missing file

### Requirement: Foundry project for Verifier deployment
The `packages/agent/circuits/` directory SHALL contain a `foundry.toml` configured with `src = "build"`, RPC endpoints for `base_sepolia` and `monad_testnet`, and Etherscan verification settings for both networks.

#### Scenario: Foundry configuration present
- **WHEN** `forge build` is run from `packages/agent/circuits/`
- **THEN** the `Groth16Verifier` contract in `build/` compiles successfully

### Requirement: Deploy script for Verifier contract
A Forge script at `packages/agent/circuits/scripts/DeployAgentIdentityVerifier.s.sol` SHALL deploy the `Groth16Verifier` contract to a target network specified via the `--rpc-url` flag. The script SHALL read `PRIVATE_KEY` from the environment and log the deployed contract address.

#### Scenario: Deploy to base_sepolia
- **WHEN** `forge script DeployAgentIdentityVerifier --rpc-url base_sepolia --broadcast` is executed with a valid `PRIVATE_KEY`
- **THEN** the `Groth16Verifier` contract is deployed on base_sepolia and the address is logged

#### Scenario: Deploy to monad_testnet
- **WHEN** `forge script DeployAgentIdentityVerifier --rpc-url monad_testnet --broadcast` is executed with a valid `PRIVATE_KEY`
- **THEN** the `Groth16Verifier` contract is deployed on monad_testnet and the address is logged

#### Scenario: Missing PRIVATE_KEY
- **WHEN** the deploy script is run without the `PRIVATE_KEY` environment variable
- **THEN** the script SHALL fail with an error indicating the missing key
