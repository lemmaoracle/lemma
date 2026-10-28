# Proof Gate circuits (internal, unregistered)

Development-only circuit sources for the Proof Gate typed execution gates.
Nothing here is registered, uploaded, or published. The Groth16 setup in
`build/` is a single machine-local contribution: it MUST NEVER be represented
as a production trusted setup.

## Circuits

| Circuit id (local) | File | Status |
|---|---|---|
| `agent-gate-v1` | `src/agent-gate-v1.circom` | IMPLEMENTED, proven, tested |
| `transfer-gate-v1` | specified in `openspec/changes/proof-gate-circuits/design.md` §3 | specified only |
| `account-change-gate-v1` | specified in `openspec/changes/proof-gate-circuits/design.md` §4 | specified only |

Shared components live in `src/common.circom` (boolean-checked inclusion
path, ranged comparison, range check, non-empty leaf). Each gate freezes its
own domain constants, depths, and widths; a predicate change is a new circuit
id and new artifacts.

## agent-gate-v1 ABI (frozen)

Field: BN254 scalar. Hash: Poseidon (circomlib in-circuit, poseidon-lite
off-circuit; both ends MUST agree on preimage order — see pinned tests).

- Depths: member 20, grant 20. Widths: timestamps/amounts 64-bit, params-hash
  limbs 128-bit.
- Domains: member=101, grant=102, node=103, pk=104, req=105, bind=106, null=107.
- Member leaf: `Poseidon(101, idCommitment, roleId)`.
- Grant leaf: `Poseidon(102, roleId, toolId, resourceId, actionId, maxPerAction, startTs, endTs)`.
- Identity: `idCommitment = Poseidon(104, agentSecret)` (possession, not a signature).
- Node: `Poseidon(103, left, right)`; empty chain `E0 = 0`, `E_{i+1} = H(E_i, E_i)`;
  slot value 0 is a valid tree entry (revoked slot) that the circuit rejects.
- Request digest: `Poseidon(105, toolId, resourceId, actionId, paramsHashLo,
  paramsHashHi, amount, challenge, audience, sessionHash, asOf, epoch)`.
- `bindTag = Poseidon(106, agentSecret, requestDigest)` (public output).
- `nullifier = Poseidon(107, agentSecret, epoch, challenge)` (public output).
- Params split: `lo = sha256(canonicalRequestBytes) mod 2^128`,
  `hi = sha256(canonicalRequestBytes) >> 128`. Canonical bytes are the
  verifier's exact execution bytes (UTF-8, fixed normalization — the verifier
  owns this spec).

Witness record keys for `fullProve` (private; the adapter builds these):

    agentSecret, roleId, maxPerAction, startTs, endTs,
    memberPathElements[20], memberPathIndices[20],
    grantPathElements[20], grantPathIndices[20]

Public signals, on-wire order (16; asserted against the artifact in tests):

    [bindTag, nullifier, memberRoot, grantRoot, epoch, asOf, toolId,
     resourceId, actionId, paramsHashLo, paramsHashHi, amount, challenge,
     audience, sessionHash, idCommitment]

`fullProve` input = the 14 public inputs (all but the two outputs) PLUS the
witness record above (all values as decimal strings; path arrays as string
arrays; indices as "0"/"1", leaf-to-root, 0 = current node left).

## Internal TypeScript entry points (no barrel exports)

Import by direct module path only; these MUST NOT be re-exported until human
API approval:

- `packages/verify/src/gate/scheme.ts` — constants, leaf/digest/tag hashes,
  `signalNames` order, validation helpers.
- `packages/verify/src/gate/tree.ts` — `memberTree` / `grantTree` builders and
  `memberHolds` / `grantHolds` inclusion checks.
- `packages/verify/src/gate/adapter.ts` — `witness(input)` (submitter side) and
  `signals(input)` (verifier side) pure converters. Neither fetches nor infers
  digests, clocks, or identity.

## Build

    cd packages/verify/circuits && bash scripts/build.sh

Prerequisites: `circom` binary, `pnpm install` at repo root. Reuses a local
`pot15_final.ptau` copy when present (`PTAU_SRC` override), else generates one
locally (measurement use only, not a ceremony). Prints stage timings and
artifact digests. Output (gitignored):

    build/agent-gate-v1.r1cs
    build/agent-gate-v1_js/agent-gate-v1.wasm
    build/agent-gate-v1_final.zkey
    build/agent-gate-v1_vkey.json

## Tests

The normal `pnpm --filter @lemmaoracle/verify test` suite runs unit tests and
excludes `src/gate/circuit.test.ts`. It needs no circuit artifacts, so the
normal CI test job can run without a circuit build.

Developers can explicitly run the real Groth16 tests after building the local
artifacts:

    cd packages/verify/circuits && bash scripts/build.sh
    pnpm --filter @lemmaoracle/verify test:gate-crypto

These artifacts are development-only, gitignored, and absent from normal CI.
The crypto test fails if its WASM, zkey, or vkey is missing.

Measured (2026-10-28, this machine): 30,424 constraints / 30,467 wires /
85 private / 14 public + 2 outputs; setup+contribute ~23.5s; fullProve ~3.3s;
verify ~22ms. Re-measure, do not trust: run the build and
`pnpm --filter @lemmaoracle/verify test:gate-crypto`.

## Trust anchor and verifier obligations (summary)

Issuance = inclusion in issuer-published roots delivered as retrieved-or-pinned
data; the circuit proves inclusion, never root legitimacy. The verifier MUST:
pin the vkey by local hash; rebuild all 14 inputs from its OWN request
bytes/clock/challenge/audience/session/snapshot/identity directory; enforce
scope/epoch correspondence, freshness, rollback, challenge single-use, and
nullifier replay rules; execute the exact bytes it hashed with no alternate
path. Any failure (including exceptions) rejects. Proof validity alone is not
authorization. Full normative list: openspec design §6.
