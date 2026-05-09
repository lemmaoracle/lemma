## ADDED Requirements

### Requirement: Multi-network verifier configuration
`register-circuit.ts` SHALL support registering circuit verifiers for multiple networks in a single invocation. The `verifiers` array in the circuit metadata SHALL include an entry for each target network.

#### Scenario: Register with multiple networks via VERIFIER_NETWORKS
- **WHEN** the `VERIFIER_NETWORKS` environment variable is set to a valid JSON array of `{chainId, address}` objects
- **THEN** the script SHALL build a `verifiers` array containing one entry per network, each with `type: "onchain"`, the provided `address`, `chainId`, and `alg: "groth16-bn254-snarkjs"`

#### Scenario: Backward compatibility with single-network env vars
- **WHEN** `VERIFIER_NETWORKS` is not set but `VERIFIER_ADDRESS` and `CHAIN_ID` are set
- **THEN** the script SHALL register a single verifier entry using those values, preserving existing behavior

#### Scenario: Both VERIFIER_NETWORKS and legacy vars set
- **WHEN** both `VERIFIER_NETWORKS` and `VERIFIER_ADDRESS`/`CHAIN_ID` are set
- **THEN** `VERIFIER_NETWORKS` SHALL take precedence; legacy vars SHALL be ignored

### Requirement: VERIFIER_NETWORKS parsing validation
The script SHALL validate the `VERIFIER_NETWORKS` JSON structure before registration. Each entry MUST contain `chainId` (number) and `address` (string starting with `0x`).

#### Scenario: Invalid JSON in VERIFIER_NETWORKS
- **WHEN** `VERIFIER_NETWORKS` contains invalid JSON
- **THEN** the script SHALL reject with a descriptive error message indicating the parse failure

#### Scenario: Missing required fields in network entry
- **WHEN** a network entry in `VERIFIER_NETWORKS` lacks `chainId` or `address`
- **THEN** the script SHALL reject with a descriptive error message indicating which field is missing

### Requirement: Deployment output integration
The script SHALL print the deployed verifier addresses and chain IDs for all registered networks upon successful registration.

#### Scenario: Successful multi-network registration output
- **WHEN** registration completes with verifiers on base_sepolia and monad_testnet
- **THEN** the console output SHALL list each verifier's address and chain ID
