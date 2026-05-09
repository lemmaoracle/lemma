## ADDED Requirements

### Requirement: Normalization crate moved to sub-directory
|The existing normalization Rust crate SHALL be relocated from `packages/agent/src/` to `packages/agent/normalize/src/`. The `Cargo.toml` SHALL be moved to `packages/agent/normalize/Cargo.toml`.
|
|#### Scenario: Crate compiles from new location
|- **WHEN** `cargo build` is run from `packages/agent/normalize/`
|- **THEN** the crate compiles successfully and produces the same WASM output
|
|#### Scenario: Public API unchanged
|- **WHEN** the WASM is built from the new location
|- **THEN** it exports `normalize`, `validate`, and `process` with the same signatures and behavior
|
### Requirement: Circuit directory as peer to normalization
|A `packages/agent/circuits/` directory SHALL be created with the same structure as `packages/x402/circuits/` and `trust402/packages/roles/circuits/`.
|
|#### Scenario: Circuit directory structure
|- **WHEN** the package is restructured
|- **THEN** `packages/agent/circuits/` contains: `package.json` (with `circomlib` and `snarkjs` dependencies), `src/` (for `.circom` files), `scripts/build.sh`, and a `build/` output directory
|
### Requirement: WASM build script updated for new crate path
|The `scripts/build-wasm.sh` script SHALL target the normalization crate at its new location (`packages/agent/normalize/`).
|
|#### Scenario: Build script targets correct directory
|- **WHEN** `scripts/build-wasm.sh` is executed
|- **THEN** it runs `wasm-pack build` from `packages/agent/normalize/` and outputs to `packages/agent/dist/wasm/`
|
### Requirement: DESIGN.md removed
|The `packages/agent/DESIGN.md` file SHALL be deleted.
|
|#### Scenario: DESIGN.md no longer exists
|- **WHEN** the package restructure is complete
|- **THEN** `packages/agent/DESIGN.md` does not exist
|
### Requirement: Build artifacts excluded from version control
|The `packages/agent/` directory SHALL include a `.gitignore` file that excludes build artifacts: `circuits/build/`, `circuits/node_modules/`, `target/`, `dist/`, `pkg/`, and `node_modules/`.
|
|#### Scenario: Circuit build directory is ignored
|- **WHEN** the circom circuit is compiled and produces files under `circuits/build/`
|- **THEN** `git status` does not list any files under `circuits/build/`
|
|#### Scenario: Cargo target directory is ignored
|- **WHEN** `cargo build` produces files under `normalize/target/`
|- **THEN** `git status` does not list any files under `target/`
|
## MODIFIED Requirements
|
### Requirement: Deterministic spend limit string output
|The normalized `spendLimit` field SHALL always be a base-10 integer string (e.g., `"10000"`) or the literal `"unlimited"`. The output SHALL NOT contain decimal points, scientific notation, or leading zeros. This requirement is unchanged in behavior; the modification is that the source file location moves from `packages/agent/src/lib.rs` to `packages/agent/normalize/src/lib.rs`.
|
|#### Scenario: Integer spend limit normalized to plain integer string
|- **WHEN** the input credential has `spendLimit: 10000`
|- **THEN** the normalized output contains `"spendLimit": "10000"`
|
|#### Scenario: Spend limit of zero
|- **WHEN** the input credential has `spendLimit: 0`
|- **THEN** the normalized output contains `"spendLimit": "0"`
|
|#### Scenario: Absent spend limit normalized to unlimited
|- **WHEN** the input credential omits `spendLimit`
|- **THEN** the normalized output contains `"spendLimit": "unlimited"`
|
|#### Scenario: Large spend limit normalized without scientific notation
|- **WHEN** the input credential has `spendLimit: 999999999999`
|- **THEN** the normalized output contains `"spendLimit": "999999999999"` (not `"1e12"` or similar)
