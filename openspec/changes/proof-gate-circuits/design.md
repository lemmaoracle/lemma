## Context

Materials reviewed in this checkout: `AGENTS.md`, `docs/architecture/{design-principles,fp,spec-sync}.md`,
`packages/verify/src/*.ts` (guardrail/prove/resolver/cache/settlement/types) and
`packages/verify/src/policy/*` (member-grant-v1 leaves/tree/decode), plus the `policy-sharing` change
(proposal/design/tasks/spec). The experimental `debug_gate2` ABI (24,500 constraints, 13 public signals)
and its measured gaps (templateId/amount witness-only, no bit constraints on path directions) are taken
from the `policy-sharing` design record and were not rerun here.

The hardened-gate design guidance (shared components + thin top-level circuits, bindTag technique,
verifier-assembled public inputs, fail-closed check order) informs this change, with one deliberate
supersession: the earlier "one universal top-level circuit" recommendation is replaced by the latest
product decision — Proof Gate types its gates, so each gate gets its OWN top-level circuit reusing
shared components. Library sharing never implies vkey sharing: Groth16 needs one setup and one pinned
vkey per final circuit.

## Goals / Non-Goals

**Goals:** Fixed, typed ABIs for three gates; a fully working agent-operation gate (compile, real
Groth16 prove/verify, negative attack tests, measured constraints/timings); internal-only TypeScript
scheme/tree/adapter modules; explicit verifier obligations and production gates.

**Non-Goals:** Implementing the transfer and account-change circuits (specified only); any new public
export from `@lemmaoracle/verify` (root or `/policy`); the `verify` -> `gate` rename; npm publishing;
registration/upload of artifacts; dashboard D1/challenge/history work (parallel lane, integrated later
by the parent); an unbounded generalized policy engine; changes to `packages/spec` or protocol specs.

## Decisions

### 1. One typed top-level circuit per gate, shared components underneath

- Shared: fixed-depth Merkle inclusion with boolean direction bits and domain-separated node hashing,
  range-checked integer comparison, request-digest and binding-tag construction, per-challenge nullifier.
- Specific: each gate fixes its grant-leaf vocabulary, its per-request public inputs, and its
  gate predicate. A predicate change means a new top-level circuit and artifact, never a witness-side
  bypass flag.
- Domain constants additionally separate the three gates at the cryptographic level: a leaf or digest
  computed for one gate is meaningless in another.

### 2. Agent-operation gate (`agent-gate-v1`) — implemented in this change

Pre-delegated grants: the issuer publishes member and grant trees; the agent holds a secret; each call
proves grant inclusion plus binding to the exact request the verifier is about to execute. No human
approval per call; no fake signatures (possession + trusted-root model, see §5).

Scheme (internal, unregistered; circuit id string `agent-gate-v1` names local artifacts only):

- Field: BN254 scalar. Hash: Poseidon (circomlib in-circuit, poseidon-lite off-circuit).
- Fixed depths: member tree 20, grant tree 20. Node: `Poseidon(DOM_NODE, left, right)`.
  Empty leaf slot is the field value 0 and is explicitly rejected; the empty subtree chain is
  `E0 = 0`, `E_{i+1} = Poseidon(DOM_NODE, E_i, E_i)`.
- Domain constants: `DOM_MEMBER=101`, `DOM_GRANT=102`, `DOM_NODE=103`, `DOM_PK=104`,
  `DOM_REQ=105`, `DOM_BIND=106`, `DOM_NULL=107`.
- Member leaf: `Poseidon(DOM_MEMBER, idCommitment, roleId)`.
- Grant leaf: `Poseidon(DOM_GRANT, roleId, toolId, resourceId, actionId, maxPerAction, startTs, endTs)`.
  `roleId` is ONE shared witness signal in both leaves (axis coupling; blocks member/grant mix-and-match).
- Identity: `idCommitment = Poseidon(DOM_PK, agentSecret)` (public input; the verifier maps its own
  request actor to the expected commitment via its own directory).
- Validity window and per-action limit are 64-bit (`Num2Bits(64)` on every compared value):
  `startTs <= asOf <= endTs`, `amount <= maxPerAction`, all via `LessEqThan(64)`.
- External 256-bit params hash enters as two range-checked 128-bit limbs
  (`lo = digest mod 2^128`, `hi = digest >> 128`, each `Num2Bits(128)`); never a single mod-prime
  reduction (collision/shape ambiguity).
- In-circuit request digest over PUBLIC inputs only:
  `requestDigest = Poseidon(DOM_REQ, toolId, resourceId, actionId, paramsHashLo, paramsHashHi,
  amount, challenge, audience, sessionHash, asOf, epoch)`.
- `bindTag = Poseidon(DOM_BIND, agentSecret, requestDigest)` (public output). Every public input
  reaches a secret-involving constraint through the digest and this tag; the verifier cannot recompute
  the tag (it lacks the secret) and establishes it purely through cryptographic verification against
  verifier-assembled inputs.
- `nullifier = Poseidon(DOM_NULL, agentSecret, epoch, challenge)` (public output): single use is
  scoped to (epoch, challenge), not one-per-epoch, so concurrent distinct requests are not rejected.

Witness (private): `agentSecret, roleId, maxPerAction, startTs, endTs`,
`memberPathElements[20], memberPathIndices[20], grantPathElements[20], grantPathIndices[20]`.
All direction signals carry explicit `b * (b - 1) === 0` boolean constraints.

Public signals (16): `[bindTag, nullifier, memberRoot, grantRoot, epoch, asOf, toolId, resourceId,
actionId, paramsHashLo, paramsHashHi, amount, challenge, audience, sessionHash, idCommitment]`.
The exact on-wire order is asserted by the adapter tests against the compiled artifact.

Why this closes the measured `debug_gate2` gaps: tool/resource/action/amount are PUBLIC inputs with
leaf-equality and range constraints (no witness-only template/amount substitution); path directions
are bit-constrained in-circuit (SDK bypass impossible); all hashes are domain-separated; the digest
binds the exact request bytes the verifier hashed itself.

### 3. Transfer gate (`transfer-gate-v1`) — specified, not implemented

Co-possession predicate (maker + checker secrets held by one prover, no bypass flag; maker and checker
commitments must differ via an in-circuit not-equal constraint). This proves co-possession of two
secrets, not two independent human approvals or maker-checker separation: one prover supplies both.

- Grant leaf: `Poseidon(DOM_T_GRANT, roleId, fromAccountId, assetId, maxAmount, startTs, endTs)`.
- Member inclusions: maker path (shared `roleId` with the grant) and checker path (fixed checker role
  in the same member tree/epoch).
- Request digest binds the EXACT payee and amount:
  `Poseidon(DOM_T_REQ, fromAccountId, toAccountId, assetId, amount, challenge, audience, sessionHash,
  asOf, epoch)`; `amount <= maxAmount` (64-bit ranged); `fromAccountId`/`assetId` equal the grant leaf.
- `bindTag = Poseidon(DOM_T_BIND, makerSecret, checkerSecret, requestDigest)`; nullifier over
  (makerSecret, epoch, challenge).
- Trust anchor: issuer account/grant roots as retrieved-or-pinned data; execution binding: the
  settlement rail executes the exact (from, to, asset, amount) bytes the verifier hashed. The proof
  never authorizes on its own: verifier-owned expectations plus rail-level idempotency decide.

**TODO / proposal — independent approvals:** If the product requires genuine two-party independence,
two separate holders must each sign an approval over the same (requestDigest, challenge, audience),
and verification must not require handing both secrets to one prover. The protocol is to be finalized
before implementation; this change selects neither a signature scheme nor a public ABI. Acceptance
negative tests must reject same-holder signatures and digest, challenge, or audience mismatches before
any implementation task proceeds.

### 4. Account-change gate (`account-change-gate-v1`) — specified, not implemented

Short-lived changes (payout account, admin contact) with an in-circuit timestamp-freshness predicate
and exact old/new binding. Timestamp freshness is not step-up authentication.

- Grant leaf: `Poseidon(DOM_A_GRANT, roleId, scopeId, changeType, startTs, endTs)` with a short window
  (recommended <= 24 h issuance-to-expiry; enforced by leaf values, not by circuit constants).
- Old and new account identifiers enter as 256-bit hashes in 128-bit limb pairs
  (`oldAcctLo/Hi`, `newAcctLo/Hi`, each `Num2Bits(128)`).
- Timestamp freshness in-circuit: `requestedAt <= asOf AND asOf - requestedAt <= 900` (0–900 seconds).
  Both `requestedAt` and `asOf` are 64-bit range-checked with `Num2Bits(64)`. `requestedAt` is a
  public input the verifier sets from its own clock at challenge issuance. The circuit cannot prove
  clock honesty; the verifier's clock obligations remain in §6.
- Request digest binds (scopeId, changeType, old/new limbs, requestedAt, challenge, audience,
  sessionHash, asOf, epoch); bindTag and per-challenge nullifier as in §2 with account-gate domains.
- Execution binding: the verifier applies the change to the exact hashed values and records
  (challenge, nullifier) atomically with the mutation.

**TODO / proposal — step-up authentication:** If the product requires step-up, the gate needs
verification of a freshness-bearing authentication fact issued by an external authenticator/IdP,
separate from the timestamp predicate. The mechanism and protocol must be finalized before
implementation, with acceptance negative tests for absent, stale, or mismatched authentication facts.

### 5. No signatures in v1 circuits (possession + trusted root)

A "Poseidon signature" (`s = Poseidon(x, m, r)` with `pk = Poseidon(x)`) is a MAC, not a signature:
verification needs `x`, so it adds no delegation, no third-party verifiability, and no security beyond
the knowledge-of-`x` constraint it duplicates. These circuits therefore use possession
(`idCommitment = H(secret)` + inclusion of a commitment-bearing leaf in an issuer-trusted root) and
put issuance entirely in the issuer tree: being granted means being included. If delegation or
offline third-party verification becomes a requirement, the documented upgrade path is EdDSA over
BabyJubjub in a new circuit version — never a MAC relabeled as a signature.

### 6. What the circuit cannot prove (consumer obligations, normative)

The circuit proves relations between witness and public inputs only. The verifier MUST, fail-closed
and in order (any failure, including exceptions, means reject): check formats (exact signal count,
`0 <= v < r` decimal canonical form, stated bit widths); pin the vkey by hashing its bytes against a
locally built-in approved hash and mapping `vkeyHash -> (gate, ABI revision, domain constants)`;
take (roots, epoch) from its trusted snapshot and check scope/epoch correspondence, freshness
(max staleness), and rollback policy; check `asOf` against its own clock within a fixed skew bound;
REBUILD the full public-input array from its own request bytes/clock/challenge/audience/session
(never pass a submitter-supplied array to verification except for the two outputs, which are
established cryptographically); verify the proof; atomically consume the server challenge and record
the nullifier together with the side effect; execute the exact bytes it hashed with no alternate
execution path. The circuit cannot prove clock correctness, snapshot latestness, routing to the right
backend, or that the side effect actually happened.

### 7. Relation to `policy-sharing` member-grant-v1 (proposed differences, not rewrites)

`member-grant-v1` (Poseidon2/Poseidon7 leaves, Poseidon2 nodes, depth 20, `empty = Poseidon1(0)`,
day-granularity window, amount in witness) is unchanged by this change. The agent gate proposes a
different, hardened encoding and documents the delta: domain constants on every hash; empty slot = 0
with explicit rejection; 64-bit unix-second window; tool/resource/action/amount as bound public
inputs; digest-then-bindTag request binding; per-(epoch, challenge) nullifier. Migration, if ever,
means a new scheme id and new artifacts — never reinterpreting existing roots under new rules.

## Risks / Trade-offs

- Development-only trusted setup: the local Groth16 setup in `circuits/build/` uses a single
  machine-generated contribution. It MUST never be presented as a production ceremony; production
  needs independent phase-2 participants and published transcripts, tracked as an explicit gate.
- Agent secret compromise authorizes everything in the grant's scope until the next epoch removes the
  leaf; theft is undetectable in-circuit. Mitigation is operational (short epochs, secret hygiene),
  not cryptographic.
- Availability vs fail-closed: if snapshot distribution stalls past max staleness, the gate stops.
  The staleness bound is a business decision this change does not make.
- Groth16 proofs may be re-randomizable: replay detection keys on (challenge, nullifier), never on
  proof bytes.

## Migration Plan

No migration: all files are new, all exports unchanged, artifacts gitignored. The dashboard lane
consumes the frozen agent-gate ABI (signal order, witness layout, domain constants, depth) via the
internal adapter modules and the circuits README; public API proposals stay separate until human
approval. Transfer and account-change circuits each become their own artifact/circuit-id task reusing
the shared components.

## Open Questions

Human decisions still required: production trusted-setup ceremony; snapshot distribution, freshness
bounds, and cross-organization read authorization (shared with `policy-sharing`); the eventual public
API surface (`witness`/`signals` shapes, naming, versioning); whether transfer/account gates need
delegation signatures (EdDSA) or stay possession-based.
