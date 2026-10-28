## Why

Proof Gate typed three execution gates (transfer, account-change, agent-operation), so one free-format
circuit no longer fits: each gate deserves a top-level circuit whose public inputs are exactly the values
its verifier reconstructs from its own request context. The agent-operation gate goes first because
pre-delegated agent grants are the fastest path to internal trial alongside LP + dashboard work.

## What Changes

- Add a `proof-gate-circuits` capability: shared circom components plus three gate-specific top-level
  circuits with fixed witness/public ABIs, trust anchors, and real-execution binding.
- Implement the agent-operation gate (`agent-gate-v1`) end to end inside `packages/verify` only:
  circuit source, internal TypeScript scheme/tree/adapter modules, build script, and real Groth16
  prove/verify tests including negative attack cases. No new package exports.
- Specify (without implementing) the transfer gate and the account-change gate: concrete witness/public
  ABI, per-gate predicates, trust anchor, and verifier obligations, so they can be built as separate
  artifacts later.
- Record the supersession of the earlier universal-top-level-circuit guidance: shared components with
  SPECIFIC top-level circuits, one Groth16 setup and vkey per circuit.

## Capabilities

### New Capabilities

- `proof-gate-circuits`: gate-typed circuit designs, the implemented agent-operation gate ABI and
  adapter, consumer (verifier) obligations, and production gates for all three circuits.

### Modified Capabilities

None. Existing `policy-sharing` requirements are neither changed nor duplicated; where this change
proposes a different leaf/tree encoding it is documented as a proposed difference, not a silent
protocol rewrite.

## Impact

- New files only under `packages/verify/circuits/` (circom sources, build script, internal docs) and
  `packages/verify/src/gate/` (internal modules plus co-located tests). No changes to
  `packages/verify/src/index.ts`, `packages/verify/src/policy/*`, or any other package.
- Necessary dependency change: `circomlib`, `snarkjs`, `@types/snarkjs` as `devDependencies` of
  `@lemmaoracle/verify` (circuit compile at build time, real prove/verify in tests only; never shipped).
- Generated artifacts (`circuits/build/`) are gitignored development-only fixtures and are never
  registered, uploaded, or represented as a production trusted setup.
- No commit, push, merge, publish, or `verify` -> `gate` rename (explicitly out of scope).
