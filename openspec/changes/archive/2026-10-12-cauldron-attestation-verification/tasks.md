## Implementation

- [x] Add failing regression tests for Nitro payload certificates, CA ordering and independent PCR approval.
- [x] Correct certificate extraction and chain construction.
- [x] Enforce golden measurements before provisioning and during offline verification.
- [x] Record and validate all enclave image inputs.
- [x] Correct README security guarantees and measurement instructions.

## Validation

- [x] Run the cauldron test suite, syntax checks and attribution checks.
- [x] Synchronize the specification, review the diff and commit the fix.

Validation: 63 cauldron tests passed under Node 20.20.2 using a workspace-only
stdio harness for the managed runtime. Syntax and whitespace checks passed.
The attribution checker is absent on this branch; no third-party source was copied.
OpenSpec CLI is unavailable, so this change and spec sync were managed by hand.
EIF measurements and real AWS execution remain unperformed.
