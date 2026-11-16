# bank-account-change

ZK circuit for Lemma **ProofGate**: a cryptographic proof for a
bank-account change request (GENIAC design **v1.1**).

Circuit ID: `bank-account-change-v1` · Circom + Groth16 / BN254

## Statement

> A representative who (a) is registered in the verifier's vendor
> registry *before* the change request was received, and (b) holds the
> bank-account-change role, approves *this* old → new account change,
> for *this* verifier (audience) and *this* gate-issued challenge.
> The new account is held in the vendor's own registered legal name and
> is bound to bank-side account-control evidence.

## Bindings

| # | Binding | Mechanism |
|---|---------|-----------|
| 1 | Subject | Credential leaf inclusion in `registryRoot` (depth-20 Poseidon Merkle, boolean-constrained checker from `listing-binding`) + knowledge of the representative secret (`Poseidon1(secret)` inside the leaf) |
| 2 | Content | `oldAccountHash` / `newAccountHash` are gate-fixed public inputs; the prover opens `newAccountHash = Poseidon6(1101, bankCode, branchCode, accountType, accountNumber, holderNameHash)` from the real account fields |
| 3 | Holder | `holderNameHash === legalNameHash` (the legal name inside the registered credential). A leaked representative key cannot divert funds to a third-party-named account |
| 4 | Context | `contextHash` is derived **in-circuit** from its public components (audience, request digest, challenge window, registry root, policy hash) and is an output, never a prover-supplied input. `nullifier = Poseidon2(credentialCommitment, challengeId)` is the gate's stable deduplication key — Groth16 proofs are re-randomizable, so proof bytes cannot serve that role |
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

`isFirst` is not a free flag: it must equal `IsZero(oldAccountHash)`.

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
4. Judge expiry at the gate-recorded submission time.
5. At commit time, re-check root freshness / revocation epoch and
   challenge expiry, consume the challenge atomically together with
   registering **exactly** the account whose hash was proven, and keep
   comparing that hash in downstream payment checks.

## What this does not prove

- That the account exists on the bank's ledger — the evidence source
  carries that truth.
- That the representative was not deceived into approving.
- That the initial registry enrollment was correct. Security moves
  from "doubt every monthly email" to "make enrollment and key custody
  strict".
- Privacy is not an adoption claim. Public signals are for off-chain
  gate verification only: an unsalted account hash is brute-forceable
  and **must not be published on-chain**. A salted-commitment variant
  for external Proof Cards is future work.

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

## Build & test

```sh
cd circuits
npm install
npm run build   # requires circom; uses cauldron phase2 like sibling packages
npm test
```

## Layout

```
circuits/src/bank-account-change.circom   the circuit
circuits/test/bank-account-change.test.ts positive + negative cases
circuits/scripts/build.sh                 compile + groth16 setup
scripts/register-circuit.ts               register with the Lemma API
```
