# account-change

ZK circuit for Lemma **ProofGate**: a cryptographic proof for a
bank-account change request (GENIAC design **v1.1**).

Circuit ID: `account-change-v1` · Circom + Groth16 / BN254

## Statement

> A representative who (a) is registered in the verifier's vendor
> registry *before* the change request was received, and (b) holds the
> account-change role, approves *this* old → new account change,
> for *this* verifier (audience) and *this* gate-issued challenge.
> The new account is held in the vendor's own registered legal name and
> is bound to bank-side account-control evidence.

## Bindings

| # | Binding | Mechanism |
|---|---------|-----------|
| 1 | Subject | Credential leaf inclusion in `registryRoot` (depth-20 Poseidon Merkle, boolean-constrained checker from `listing-binding`) + knowledge of the representative secret (`Poseidon1(secret)` inside the leaf) |
| 2 | Content | `oldAccountHash` / `newAccountHash` are gate-fixed public inputs; the prover opens `newAccountHash = Poseidon6(1101, bankCode, branchCode, accountType, accountNumber, holderNameHash)` from the real account fields |
| 3 | Holder | `holderNameHash === legalNameHash` (the legal name inside the registered credential). A leaked representative key cannot divert funds to a third-party-named account |
| 4 | Context | `contextHash` is derived **in-circuit** from its public components (audience, request digest, challenge window, registry root, policy hash) and is an output, never a prover-supplied input. `nullifier = Poseidon2(credentialCommitment, challengeId)` is the gate's audit-linkage key for a (credential, challenge) pair — Groth16 proofs are re-randomizable, so proof bytes cannot serve that role. It does **not** detect a resubmission under a *new* challenge for the same request; that is prevented by challenge consumption plus the gate's request record (see Gate policy) |
| 5 | Execution | Gate policy (below) |

Credential leaf (`leaf == credentialCommitment`), following the
`agent-identity` sub-hash layout:

```
identityHash  = Poseidon2(vendorId, Poseidon1(repSecret))
authorityHash = Poseidon2(roleHash, legalNameHash)
lifecycleHash = Poseidon4(status, validFrom, validUntil, registeredAt)
credentialCommitment = Poseidon4(identityHash, authorityHash, lifecycleHash, salt)
```

Time bindings (all 64-bit ranged):

```
validFrom <= challengeIssuedAt < challengeExpiresAt <= validUntil
registeredAt <= requestReceivedAt <= challengeIssuedAt
```

Every time value (private and public) is range-bound with
`Num2Bits(64)` before any comparison: without it, a field element of
the form `r-k` wraps through the comparators' internal decomposition
and reads as a very small timestamp.

`isFirst` is not a free flag: it must equal `IsZero(oldAccountHash)`.

## Operational definitions (normative for gate/registry implementers)

- **Role hash**: `requiredRoleHash = Poseidon1(toFieldElement("lemma:role:account-change"))`,
  where `toFieldElement` is the repo's string-to-field convention
  (UTF-8 bytes as a big-endian integer mod r, as in `blog-article`).
  The value is a *policy* decision by the gate operator; changing it
  is a policy change and must be reflected in `policyHash`. Registry
  and gate must be configured with the same value — the test fixture's
  `Poseidon1([777])` is not it.
- **Domain tags** (v1 assignments, to be promoted to a central
  registry): `1101` account tuple, `1102`/`1103` context branches.
  `attestationCommitment` (Poseidon5) and `nullifier` (Poseidon2) are
  currently untagged; they are registered here together with the
  tagged uses so a future registry can assign tags consistently.
- **requestDigest**: a digest of the change request as received,
  computed by the gate. If it is derived from a SHA-256 of the request
  bytes, the 256-bit value must be injected into the field with an
  injective multi-limb encoding — never by a plain `mod r` reduction,
  which does not preserve identity.
- **Normalization**: account fields are parsed as fixed-width decimals
  off-circuit (leading zeros preserved). The holder name must be
  normalized (kana width, legal-name form) by *one* shared normalizer
  used by both the registry (for `legalNameHash`) and the prover (for
  `holderNameHash`); that normalizer is not part of this package yet.
  A mismatch causes false rejections (an availability failure), not a
  soundness failure — but it must be specified before production use.
- **Attestation scope**: `attestationCommitment` does not include
  `requestReceivedAt`; a downstream consumer that needs the receipt
  time must read it from the gate's request record, not from the
  attestation.

## Gate policy (off-circuit, part of the design)

The circuit alone is not acceptance. The gate must:

1. Fix every GateInput itself (registry root at challenge issuance,
   account hashes from the stopped request and its own current records,
   request digest, timestamps, policy hash) — never take them from the
   prover.
2. Deliver the challenge only via the contact channel registered
   *before* the change request. Knowing the challenge is not evidence
   of identity; key possession is.
3. Verify the bank evidence itself (`bankEvidenceHash` is a
   prover-supplied ProvenInput; the circuit binds its hash into the
   attestation but does not prove its truth).
4. Judge expiry at the gate-recorded submission time. Set
   `challengeExpiresAt` so it also encodes any procedural waiting
   period (e.g. the month-end payment procedure's rule that a change
   is only reflected after a waiting period counted from the
   registration date) — the circuit has no separate hook for it.
5. Record the `nullifier` only when a submission is accepted; retries
   for the same challenge before acceptance are allowed. At commit
   time, re-check root freshness / revocation epoch and challenge
   expiry, consume the challenge atomically together with registering
   **exactly** the account whose hash was proven, and keep comparing
   that hash in downstream payment checks.

## What this does not prove

- That the account exists on the bank's ledger — the evidence source
  carries that truth.
- That the representative was not deceived into approving.
- That the initial registry enrollment was correct. Security moves
  from "doubt every monthly email" to "make enrollment and key custody
  strict".
- Privacy is not an adoption claim. Public signals are for off-chain
  gate verification only: an unsalted account hash is brute-forceable
  and **must not be published on-chain**. The same applies to
  `bankEvidenceHash`: if the underlying evidence is a low-entropy
  value (e.g. a short code in a transaction memo), its hash in the
  public signals is brute-forceable too, so archived public signals
  can leak the evidence preimage. A salted-commitment variant for
  external Proof Cards is future work.
- Key possession is `Poseidon1(secret)` (the `agent-identity`
  precedent), not a signature scheme. For production use with real
  bank accounts, plan a migration to signature-based authorization
  (EdDSA over the context) so approvals are non-repudiable
  authorizations rather than key-possession proofs.

## v1.1 changes (self-review of v1)

- `contextHash` changed from a prover-supplied public input to an
  in-circuit derivation (output).
- Registration-time ordering (`registeredAt <= requestReceivedAt`)
  is now constrained, not just stated in prose.
- `bankEvidenceHash` reclassified from GateInput to ProvenInput with
  an explicit two-step gate check.
- `isFirst` bound to `IsZero(oldAccountHash)`.
- Merkle checker: boolean-constrained quadratic-mux version only.
- Role checked against a gate-fixed `requiredRoleHash` public input
  (the `role-spend-limit` pattern) instead of a magic constant.
- Credential leaf layout fully specified.
- Nullifier's role corrected: deduplication key, not replay
  prevention by itself.

## Post-review fixes (Kilo review of PR #1171)

- Root `pnpm-lock.yaml` updated with this package's importer (CI was
  failing at `pnpm install`).
- All time values are now `Num2Bits(64)` range-bound before
  comparison (field-wrap values `r-k` previously slipped through the
  ordering checks).
- Circuit header documents the prover-selected (`credentialCommitment`)
  and gate-derived (`isFirst`) public inputs.
- Tests: build-artifact skip guard (sibling pattern), non-zero-index
  Merkle path, time-window / revocation / cross-vendor negatives,
  verify-level tampering of more public signals, and the field-wrap
  regression cases.

## Build & test

```sh
cd circuits
npm install
npm run build   # requires circom; uses cauldron phase2 like sibling packages
npm test        # skips with a notice when build artifacts are absent
```

`scripts/register-circuit.ts` is type-checked with
`npm run typecheck` from the package root (after a workspace
`pnpm install` and building `@lemmaoracle/sdk` / `@lemmaoracle/spec`).

## Layout

```
circuits/src/account-change.circom   the circuit
circuits/test/account-change.test.ts positive + negative cases
circuits/scripts/build.sh                 compile + groth16 setup
scripts/register-circuit.ts               register with the Lemma API
```
