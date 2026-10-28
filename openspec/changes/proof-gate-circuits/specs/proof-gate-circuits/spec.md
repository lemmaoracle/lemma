## ADDED Requirements

### Requirement: Typed gate circuits over shared components

The proof-gate circuit family SHALL consist of shared components (boolean-checked fixed-depth
inclusion, ranged comparison, request digest, binding tag, per-challenge nullifier) plus one
SPECIFIC top-level circuit per gate. A predicate change SHALL mean a new top-level circuit and new
artifacts, never a witness-controlled bypass flag. Each final circuit SHALL have its own Groth16
setup and pinned vkey; library sharing SHALL NOT imply vkey sharing.

#### Scenario: Predicate change

- **WHEN** a gate needs a different authorization predicate
- **THEN** it is built as a new top-level circuit reusing shared components, with new artifacts

### Requirement: Agent gate fixed ABI

The `agent-gate-v1` circuit SHALL fix the witness layout, the 16-entry public-signal order
`[bindTag, nullifier, memberRoot, grantRoot, epoch, asOf, toolId, resourceId, actionId,
paramsHashLo, paramsHashHi, amount, challenge, audience, sessionHash, idCommitment]`.
Its field SHALL be the BN254 scalar field; hashes SHALL use Poseidon. The domain constants SHALL
be `DOM_MEMBER=101`, `DOM_GRANT=102`, `DOM_NODE=103`, `DOM_PK=104`, `DOM_REQ=105`,
`DOM_BIND=106`, and `DOM_NULL=107`, respectively for member leaves, grant leaves, tree nodes,
identity commitments, request digests, binding tags, and nullifiers. The member and grant tree
depths SHALL each be 20. A node SHALL be `Poseidon(DOM_NODE, left, right)`. The empty leaf slot
SHALL be the field value 0, SHALL be explicitly rejected as a leaf, and SHALL define the empty
subtree chain `E0 = 0`, `E_{i+1} = Poseidon(DOM_NODE, E_i, E_i)`.

The member leaf SHALL be `Poseidon(DOM_MEMBER, idCommitment, roleId)` and the grant leaf SHALL
be `Poseidon(DOM_GRANT, roleId, toolId, resourceId, actionId, maxPerAction, startTs, endTs)`.
Both leaves SHALL use ONE shared private `roleId` witness signal, coupling member and grant
inclusion. The identity commitment SHALL be `idCommitment = Poseidon(DOM_PK, agentSecret)`;
the verifier SHALL map its request actor to the expected public commitment through its own
directory. The private witness signals SHALL be `agentSecret`, `roleId`, `maxPerAction`,
`startTs`, `endTs`, `memberPathElements[20]`, `memberPathIndices[20]`,
`grantPathElements[20]`, and `grantPathIndices[20]`. Every path direction `b` SHALL satisfy
the explicit boolean constraint `b * (b - 1) === 0`.

The values `startTs`, `asOf`, `endTs`, `amount`, and `maxPerAction` SHALL each be range-checked
by `Num2Bits(64)`; `startTs <= asOf <= endTs` and `amount <= maxPerAction` SHALL be enforced
through `LessEqThan(64)`. An external 256-bit params hash SHALL enter as `paramsHashLo` and
`paramsHashHi`, where `lo = digest mod 2^128` and `hi = digest >> 128`; each limb SHALL be
range-checked by `Num2Bits(128)`, without a single mod-prime reduction.

The circuit SHALL compute `requestDigest = Poseidon(DOM_REQ, toolId, resourceId, actionId,
paramsHashLo, paramsHashHi, amount, challenge, audience, sessionHash, asOf, epoch)` from
public inputs only. It SHALL expose `bindTag = Poseidon(DOM_BIND, agentSecret, requestDigest)`
and `nullifier = Poseidon(DOM_NULL, agentSecret, epoch, challenge)` as public outputs. The
nullifier SHALL be scoped to `(epoch, challenge)`, permitting distinct concurrent challenges.
Every public input SHALL reach a secret-involving constraint through inclusion or the digest
and binding tag; the verifier SHALL establish the tag by proof verification against its own
assembled inputs, since it does not know `agentSecret`.
Tool, resource, action, amount, and params-hash limbs SHALL be public inputs bound by leaf equality,
range, and digest constraints — never witness-only values a prover can substitute while reusing a
request digest.

#### Scenario: Request substitution attempt

- **WHEN** a prover generates a fresh proof with a different tool, action, amount, or params hash
  against a verifier-assembled request
- **THEN** cryptographic verification against the verifier-assembled signals rejects

### Requirement: In-circuit soundness properties

Merkle path directions SHALL carry explicit boolean constraints; every compared integer SHALL be
range-checked before comparison; every hash SHALL carry a domain constant distinct across
leaf/node/identity/digest/bind/nullifier uses and across gates; the empty slot value 0 SHALL be
explicitly rejected as a leaf; every public input SHALL participate in a secret-involving constraint
via inclusion, the request digest, and the binding tag.

#### Scenario: SDK-bypassing witness

- **WHEN** a prover supplies non-bit path directions or an empty-slot leaf directly
- **THEN** the circuit constraints reject independently of any TypeScript validation

### Requirement: Possession model without fake signatures

Issuance SHALL mean inclusion in an issuer-trusted root and authentication SHALL mean secret
possession (`idCommitment = H(secret)`); no Poseidon MAC SHALL be represented as a signature. If
delegation or offline third-party verification is required later, it SHALL arrive as a real signature
scheme in a new circuit version.

#### Scenario: Grant check

- **WHEN** a proof is verified against verifier-assembled signals and a trusted snapshot root
- **THEN** acceptance attests possession plus inclusion plus request binding — never standalone
  authorization

### Requirement: Verifier-owned expectations and obligations

The verifier SHALL assemble the full public-input array from its own request bytes, clock, challenge,
audience, session, snapshot, and identity directory; SHALL pin the vkey by local hash; SHALL enforce
scope/epoch correspondence, freshness, rollback, challenge single-use, and nullifier replay rules;
and SHALL execute the exact bytes it hashed with no alternate path. Any failure, including
exceptions, SHALL reject. Proof cryptographic validity SHALL NOT be called authorization on its own.

#### Scenario: Submitter-supplied signal reuse

- **WHEN** a valid proof for request A is submitted with request B's execution bytes
- **THEN** verification against verifier-assembled signals for B rejects

### Requirement: Internal-only implementation, development-only artifacts

The agent-gate TypeScript modules SHALL live under `packages/verify/src/gate/` with NO re-export
from the package root or `/policy` barrel; generated circuit artifacts SHALL be gitignored and SHALL
never be registered, uploaded, or represented as a production trusted setup. The `verify` -> `gate`
rename SHALL NOT be performed by this change.

#### Scenario: Export audit

- **WHEN** the package public surface is inspected
- **THEN** no gate module, adapter, or circuit artifact path appears in any barrel export

### Requirement: Transfer and account-change specifications

The transfer gate SHALL bind the exact payee and amount and prove co-possession of maker and checker
secrets supplied by one prover, with an in-circuit not-equal constraint on their commitments. It
SHALL NOT claim two independent approvals or maker-checker separation. The account-change gate
SHALL bind the exact old and new account identifiers and enforce timestamp freshness:
`requestedAt <= asOf AND asOf - requestedAt <= 900` (0–900 seconds), with both values 64-bit
range-checked by `Num2Bits(64)`. `requestedAt` SHALL be a public input set by the verifier from its
own clock at challenge issuance; the circuit cannot attest clock honesty. This predicate SHALL NOT
be called step-up authentication. Each gate remains specified only; neither gate is implemented
or compiled by this change. Their witness and public ABIs remain undecided. This specification
SHALL NOT select a new signature scheme or commit to either future public ABI.

For `transfer-gate-v1`, the grant leaf SHALL be `Poseidon(DOM_T_GRANT, roleId, fromAccountId,
assetId, maxAmount, startTs, endTs)`. The maker member path SHALL share `roleId` with the grant;
the checker member path SHALL use the fixed checker role in the same member tree and epoch.
The request digest SHALL be `Poseidon(DOM_T_REQ, fromAccountId, toAccountId, assetId, amount,
challenge, audience, sessionHash, asOf, epoch)`. The circuit SHALL enforce
`amount <= maxAmount` with 64-bit range checks and SHALL equate `fromAccountId` and `assetId`
with their grant-leaf values. Its binding tag SHALL be
`Poseidon(DOM_T_BIND, makerSecret, checkerSecret, requestDigest)` and its nullifier SHALL
bind `(makerSecret, epoch, challenge)`. The trust anchor SHALL be issuer account and grant
roots retrieved or pinned by the verifier. The settlement rail SHALL execute the exact
`(from, to, asset, amount)` bytes the verifier hashed; verifier-owned expectations and rail-level
idempotency SHALL govern execution. A valid proof alone SHALL NOT authorize a transfer.
Before implementing independent approvals, the protocol SHALL require two separate holders to
sign approval over the same `(requestDigest, challenge, audience)` without handing both secrets
to one prover. Acceptance negative tests SHALL reject same-holder signatures and mismatched
digest, challenge, or audience. The independent-approval protocol SHALL be finalized before
implementation; this change SHALL NOT select its signature scheme or public ABI.

For `account-change-gate-v1`, the grant leaf SHALL be
`Poseidon(DOM_A_GRANT, roleId, scopeId, changeType, startTs, endTs)` with a short validity
window set by leaf values, not circuit constants (recommended at most 24 hours from issuance
to expiry). Old and new account identifiers SHALL enter as 256-bit hashes in 128-bit limb
pairs `oldAcctLo/Hi` and `newAcctLo/Hi`, each limb constrained by `Num2Bits(128)`. The
request digest SHALL bind `scopeId`, `changeType`, both old and new limb pairs, `requestedAt`,
`challenge`, `audience`, `sessionHash`, `asOf`, and `epoch`; its binding tag and per-challenge
nullifier SHALL follow the agent-gate formulas with account-gate domains. The trust anchor
for grant inclusion SHALL be the issuer-trusted root; the verifier SHALL apply the change to
the exact hashed values and atomically record `(challenge, nullifier)` with the mutation.
If step-up authentication is required, its separate trust anchor SHALL be a freshness-bearing
authentication fact issued by an external authenticator or IdP. The mechanism and protocol
SHALL be finalized before implementation, and acceptance negative tests SHALL reject absent,
stale, or mismatched authentication facts.

#### Scenario: Later implementation

- **WHEN** a follow-up change implements either specified gate
- **THEN** it reuses the shared components and arrives as its own artifact and circuit id
