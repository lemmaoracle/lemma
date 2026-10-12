## Context

Nitro COSE unprotected headers are empty. The certificate and root-first cabundle
are in the signed CBOR payload. A valid signature authenticates the measured
enclave, but the parent cannot decide which measurements the verifier trusts.

## Decisions

- Parse the payload for the signing certificate, verify its certificate chain
  and the original COSE signature, and only then consume PCRs, nonce and time.
- Reverse the AWS cabundle for leaf-to-root checks, checking that the root-first
  entry is the configured trust anchor and excluding its duplicate from the path.
- Require a local golden manifest with `measured: true` and valid PCR0/1/2.
  Parent manifest fields cannot supply the golden policy. Preflight this before
  AWS API calls, with the same policy in offline verify.
- Include every Docker COPY input and .dockerignore in build hashes. Keep the
  explicit skip-build-check option, which never skips golden verification.
- Preserve the unmeasured golden placeholder until a real EIF is independently
  measured. A public deterministic beacon cannot replace secret destruction.

## Risks / Non-Goals

This intentionally rejects previously accepted host-only bundles. Measuring EIF
PCRs and running a real AWS enclave are deployment tasks; values are not invented.
Phase 1 remains outside this phase 2 attestation protocol.
