## 1. Package Restructure

- [ ] 1.1 Create `packages/agent/normalize/` directory and move `src/` contents from `packages/agent/src/` to `packages/agent/normalize/src/`
- [ ] 1.2 Move `packages/agent/Cargo.toml` to `packages/agent/normalize/Cargo.toml`
- [ ] 1.3 Delete `packages/agent/DESIGN.md`
- [ ] 1.4 Update `packages/agent/scripts/build-wasm.sh` to target the new crate path (`packages/agent/normalize/`)
- [ ] 1.5 Verify WASM build succeeds from the new location (`wasm-pack build` produces `agent.wasm` and `agent.js`)
- [ ] 1.6 Run existing unit tests to confirm no behavioral regression

## 2. Circuit Directory Setup

- [ ] 2.1 Create `packages/agent/circuits/` directory with `src/`, `scripts/`, and `build/` subdirectories
- [ ] 2.2 Create `packages/agent/circuits/package.json` with `circomlib` and `snarkjs` dependencies (mirror trust402's `circuits/package.json`)
- [ ] 2.3 Run `npm install` in `packages/agent/circuits/`

## 3. Agent Identity Circuit

- [ ] 3.1 Create `packages/agent/circuits/src/agent-identity.circom` with the circuit template: private inputs (`normalizedCredential`, `issuerSignature`, `salt`), public inputs (`credentialCommitment`, `issuerPublicKey`, `nowSec`)
- [ ] 3.2 Implement Poseidon commitment computation for `credentialCommitment`
- [ ] 3.3 Implement issuer signature verification constraint (BBS+ or Poseidon MAC, per design decision)
- [ ] 3.4 Implement lifecycle validity constraints: `issuedAt <= nowSec`, `expiresAt > nowSec` (or absent), `revoked == false`
- [ ] 3.5 Define `component main` with correct public signal declarations

## 4. Circuit Build Pipeline

- [ ] 4.1 Create `packages/agent/circuits/scripts/build.sh` following the trust402 pattern: compile circom, generate Powers of Tau, Groth16 setup + contribution, export verification key
- [ ] 4.2 Run the build script and verify it produces: R1CS, WASM, zkey, and verification key JSON
- [ ] 4.3 Check constraint count is reasonable (compare with trust402's `role-spend-limit` circuit as a baseline)

## 5. Circuit Registration

- [ ] 5.1 Create `packages/agent/scripts/register-circuit.ts` following the x402 pattern: upload WASM and zkey to Pinata IPFS, call `circuits.register` from `@lemmaoracle/sdk`
- [ ] 5.2 Add `register:circuit` script entry to `packages/agent/package.json`
- [ ] 5.3 Verify registration succeeds (or validates against a mock API) and `circuits.getById("agent-identity-v1")` returns correct metadata

## 6. Integration Verification

- [ ] 6.1 Write a test that: normalizes a sample credential, constructs a witness for the `agent-identity-v1` circuit, and verifies the public outputs include a valid `credentialCommitment` and `issuerPublicKey`
- [ ] 6.2 Verify that `credentialCommitment` from the agent-identity circuit can be used as input to the trust402 `role-spend-limit-v1` circuit (type compatibility, field element range)
- [ ] 6.3 Run full test suite for `packages/agent` and confirm no regressions
