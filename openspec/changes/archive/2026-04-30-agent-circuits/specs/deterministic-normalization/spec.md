## MODIFIED Requirements

### Requirement: Full normalization output is deterministic across platforms
Given the same JSON credential input, the `normalize()` function SHALL produce byte-identical output on all compilation targets (wasm32-unknown-unknown, x86_64, aarch64). The source file location changes from `packages/agent/src/lib.rs` to `packages/agent/normalize/src/lib.rs`; behavior is unchanged.

#### Scenario: Cross-platform consistency
- **WHEN** the same credential JSON is normalized on wasm32 and x86_64
- **THEN** the output strings are byte-identical
