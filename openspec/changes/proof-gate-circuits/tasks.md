## 1. Spec record

- [x] 1.1 Create the `proof-gate-circuits` change (proposal/design/tasks/spec) before implementation.
- [x] 1.2 Validate strict: `openspec validate --all --strict --json` passes.

## 2. Agent-operation circuit (`agent-gate-v1`)

- [x] 2.1 Write `packages/verify/circuits/src/common.circom` (boolean-checked inclusion path,
      ranged comparison, digest/bind/nullifier helpers) and `src/agent-gate-v1.circom` per design §2.
- [x] 2.2 Write `packages/verify/circuits/scripts/build.sh`: circom compile, `r1cs info`, local ptau
      reuse-or-generate (development-only), Groth16 setup plus single local contribution, vkey export,
      stage timings. Artifacts under gitignored `circuits/build/`.
- [x] 2.3 Add `packages/verify/circuits/.gitignore` (`build/`, `node_modules/`) and `README.md`
      (circuit id, ABI order, domain constants, artifact paths, consumer obligations pointer).
- [x] 2.4 Add `circomlib`, `snarkjs`, `@types/snarkjs` as `devDependencies` of `@lemmaoracle/verify`
      (necessary dependencies for compile + tests; never shipped).

## 3. Internal TypeScript modules (`packages/verify/src/gate/`, no barrel exports)

- [x] 3.1 `scheme.ts`: domain constants, depths, bit widths, field/range validation, canonical types.
- [x] 3.2 `tree.ts`: domain-separated fixed-depth-20 tree builder plus inclusion check (no changes to
      `src/policy/*`).
- [x] 3.3 `adapter.ts`: pure internal `witness(...)` / `signals(...)` converters with fail-closed
      validation (never fetch, never infer digests/clocks/identity).
- [x] 3.4 `adapter.test.ts`: leaf/tree vectors, round-trips, and boundary rejections.

## 4. Real execution and attack tests

- [x] 4.1 Run the full pipeline: circom compile -> r1cs/wasm -> Groth16 setup -> `fullProve` ->
      `verify`; record constraint count and stage timings honestly.
- [x] 4.2 `circuit.test.ts`: valid proof verifies; negative cases reject (wrong tool/resource/action,
      over-limit amount, expired/not-yet-valid window, tampered params limbs, wrong challenge,
      audience, session, epoch, roots, idCommitment, non-bit path direction, tampered sibling).
- [x] 4.3 Mutation coverage: every public input flipped individually must fail verification; consumer
      replay test (verifier-assembled vs submitter-supplied signals) must reject reuse.
- [x] 4.4 Run `type-check`, `lint`, and the full `packages/verify` test suite green.

## 5. Handoff (no publish, no rename)

- [x] 5.1 Report exact commands, exit codes, raw results, constraints/timings, artifact paths,
      modified files, pending production gates, and the proposed public API separately.
- [x] 5.2 Leave the dashboard lane untouched; expose only internal module entry points for later
      parent-side integration.

## 6. Audit follow-up (independent review 2026-10-28)

- [x] 6.1 Correct transfer co-possession and account-change timestamp-freshness claims; record
      protocol and acceptance-test prerequisites for independent approvals and step-up.
- [x] 6.2 Reject malformed adapter and Merkle-path runtime inputs without throwing; cover with
      targeted tests while preserving the valid witness and signal ABI.
- [x] 6.3 Make the spec self-contained by inlining agent-gate constants, witness, formulas, widths,
      and ABI, plus transfer/account trust anchors, execution binding, and future acceptance gates;
      leave `design.md` untouched.
