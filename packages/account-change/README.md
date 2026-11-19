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

- **Role hash**: `requiredRoleHash = Poseidon1(toScalar("lemma:role:account-change"))`,
  where `toScalar` is the SDK's `commitments.toScalar` (for strings:
  SHA-256 of the UTF-8 bytes, mod r) — the same function production
  code already uses, so issuers and gates derive the identical value
  by construction. Golden value:
  `2666895405497814583936866908763331297856096727475110877642173956138533085004`
  (pinned by a test). Do not substitute the raw-bytes convention used
  by some circuit test helpers (UTF-8 bytes as a big-endian integer);
  it derives a different value. The value is a *policy* decision by
  the gate operator; changing it is a policy change and must be
  reflected in `policyHash`. Registry and gate must be configured
  with the same value — the test fixture uses this operational value.
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

`scripts/*.ts` are type-checked with `pnpm type-check` from the package
root (after a workspace `pnpm install` and building `@lemmaoracle/sdk` /
`@lemmaoracle/spec`).

## Layout

```
circuits/src/account-change.circom        the circuit
circuits/src/derivations.ts               TS mirror of the leaf/tree derivations (shared by test + seed)
circuits/src/prover.ts                    prover input build + the 18 expected public signals
circuits/test/account-change.test.ts      positive + negative cases
circuits/test/prover.test.ts              prover-input checks + a real proof (when built)
circuits/scripts/build.sh                 compile + groth16 setup
scripts/register-circuit.ts               register with the Lemma API (wasm + zkey + vkey)
scripts/seed-demo-vendor.ts               TEST-ONLY demo vendor bundle (pnpm seed:demo-vendor)
scripts/prove-account-change.ts           real Groth16 prover for a CLUBS proof card (pnpm prove)
demo-vendor.example.json                  committed example of one seed run (TEST-ONLY)
```

## Integration contract (CLUBS side)

The shared reference the CLUBS-side Proof Gate integration codes against.
The CLUBS-side implementation lives in a separate PR (clubsx). **The
submission page (web UI) is a follow-up task** — this section covers only
the core (circuit, scripts, contract).

### Public signal order (18 signals)

snarkjs `publicSignals` are ordered **3 outputs → declaration order in
`main { public [...] }`** (the `SIG` table in
`circuits/test/account-change.test.ts` pins the same order; if they
disagree, the circuit wins):

| index | signal | kind |
| ----- | ------ | ---- |
| 0 | `contextHash` | output (derived in-circuit; not prover-supplied) |
| 1 | `attestationCommitment` | output |
| 2 | `nullifier` | output (= Poseidon2(credentialCommitment, challengeId)) |
| 3 | `registryRoot` | GateInput |
| 4 | `credentialCommitment` | prover-chosen (bound by Merkle inclusion in `registryRoot`) |
| 5 | `requiredRoleHash` | GateInput |
| 6 | `vendorId` | GateInput |
| 7 | `oldAccountHash` | GateInput (0 for a first registration) |
| 8 | `newAccountHash` | GateInput |
| 9 | `isFirst` | GateInput (bound to IsZero(oldAccountHash)) |
| 10 | `audienceHash` | GateInput |
| 11 | `requestDigest` | GateInput |
| 12 | `requestReceivedAt` | GateInput |
| 13 | `challengeId` | GateInput |
| 14 | `challengeIssuedAt` | GateInput |
| 15 | `challengeExpiresAt` | GateInput |
| 16 | `policyHash` | GateInput |
| 17 | `bankEvidenceHash` | ProvenInput (prover-supplied; the gate verifies the original) |

### CLUBS-side endpoints (implemented on the CLUBS side)

- `GET /api/gate-card/{ref}` → the submission payload:

  ```json
  {
    "card": {
      "clubName": "…",
      "caseTitle": "…",
      "payeeName": "…",
      "runLabel": "…",
      "expiresAt": "…",
      "issuerDomain": "…",
      "gate": {
        "circuitId": "account-change-v1",
        "registryRoot": "<decimal field element>",
        "vendorId": "<decimal field element>",
        "requiredRoleHash": "<decimal field element>",
        "audience": "<string>",
        "policy": "<string>",
        "requestCanonical": "<string>",
        "requestReceivedAt": 1760000000,
        "challengeId": "…",
        "challengeIssuedAt": 1760000000,
        "challengeExpiresAt": 1760100000,
        "isFirst": true
      }
    }
  }
  ```

  - `audience` / `policy` / `requestCanonical` arrive as **strings**. The
    prover side converts them to field elements with the SDK's
    `commitments.toScalar` (string = SHA-256 mod r) and then builds
    `audienceHash` / `policyHash` / `requestDigest`.
  - `oldAccountHash` / `newAccountHash` are not sent from CLUBS. The
    prover side derives them from its own inputs as
    `Poseidon6(1101, bankCode, branchCode, accountType, accountNumber, holderNameHash)`
    (numeric fields are parsed as fixed-width decimals; the account name
    goes through the same normalizer on both sides — see "Operational
    definitions" above).
- `POST /api/gate-card/{ref}` with body `{ proof, publicSignals }` →
  `{ ok: true }` or 4xx. `publicSignals` is a string array in the order
  above.

### Two-stage verification (per Gate policy, around consumption)

1. **stage 1 — proof verification**: `POST {workers}/v1/proofs/verify`
   with `{circuitId, proof, publicSignals}` → valid.
2. **stage 2 — original-evidence check**: match `bankEvidenceHash`
   against the bank-side evidence (the challenge code attached to the
   new account's statement). Do this **before consuming the challenge**
   (the circuit only binds the hash; it does not prove its truth).
3. Once both pass, atomically consume the challenge, record the
   `nullifier`, and register **exactly** the account proven as
   `newAccountHash`.

### Operational order

1. `cd circuits && npm install && npm run build` — produces wasm / zkey /
   **`account-change_vkey.json`**
2. `npx tsx scripts/register-circuit.ts` — uploads **all 3 artifacts
   including the vkey** (wasm, zkey, vkey) to Pinata and calls
   `circuits.register`. Without the vkey, neither the workers
   `POST /v1/proofs/verify` nor the `@lemmaoracle/verify` resolver can
   obtain the verification key from `artifact.location.vkey`, and every
   proof fails verification (the script refuses to register without a
   vkey)
3. `pnpm seed:demo-vendor` → copy `registryRoot` / `vendorId` /
   `requiredRoleHash` / `oldAccountHash` from
   `demo-vendor.example.json` into the CLUBS-side environment variables
   (⚠ TEST-ONLY)
4. Issuer domain: publish `oid=<orgIdentityDocHash>` in the TXT record
   `_lemma.<domain>` and run `seed:domain-dns` from `packages/feeds`
   (until `oid=` reaches the TXT record, it can be pinned with
   `ORG_IDENTITY_DOC_HASH`); re-run `seed:org-identity` from
   `packages/roles` **within 24 hours** (issuer verification rejects
   stale timestamps)
5. Generate a proof for a CLUBS-issued card (next section) and submit it
   from the card page. CLUBS must run with `GATE_PSEUDO_PROOF=0` for the
   real path; while it is `1`, only pseudo proofs are accepted.

### Prover (first path: script)

`scripts/prove-account-change.ts` turns the demo bundle + a CLUBS proof
card + the vendor's new account + bank evidence into a real Groth16
proof. It refuses to write a proof whose 18 signals differ from the
values it derives, and verifies the result against the local vkey before
writing.

```sh
cd packages/account-change

# 1. get a card from CLUBS (a stopped payment's 証明を求める in prerelease)
#    → https://prerelease.clubs.place/api/gate-card/{ref}

# 2. prove
pnpm prove \
  --challenge https://prerelease.clubs.place/api/gate-card/{ref} \
  --number 7654321 \
  --out account-change-proof.json

# 3. either paste account-change-proof.json into /proof-card/{ref}
#    (「実証明 JSON を貼って送る」), or let the script post it:
pnpm prove --challenge … --number 7654321 --submit
```

Inputs:

- `--bundle` — `demo-vendor.example.json` (default). It carries the
  credential (secret, role, legal name, lifecycle, Merkle path) and the
  registered old account. If CLUBS was re-seeded, `registryRoot` changes
  and the script stops with the re-seed steps — request a new card.
- `--challenge` — the `GET /api/gate-card/{ref}` payload (a file, `-`
  for stdin, or a URL). Fixed inputs, the challenge window and the
  canonical request all come from here.
- `--bank/--branch/--type/--number/--holder` — the **new** account. The
  holder must normalize to the credential's legal name (holder binding);
  the default is that legal name.
- `--evidence` / `--evidence-hash` — the bank-side evidence. The default
  is the 照合番号 shown on the proof card (`displayedRefOf(ref)`: first
  10 alphanumerics, uppercase), hashed with `toScalar` — the same
  correspondence the pseudo flow used (`fieldScalarOf(bankEvidence)` on
  the CLUBS side). Pass `--evidence` to hash another text.
- `--out` — `{ circuitId, ref?, proof, publicSignals }` (the submission
  page and `POST /api/gate-card/{ref}` accept it as-is).
- `--no-verify` skips the local vkey check (not recommended);
  `--verbose` prints the proof JSON.

The pure input build and the gate/bundle cross-checks live in
`circuits/src/prover.ts` and are pinned by `circuits/test/prover.test.ts`
(the proof case runs when the circuit is built). `toScalar` is the SDK's
`commitments.toScalar`; the script asserts the local mirror agrees before
proving.

Browser-side proving (the vendor makes the proof in their own browser) is
future work: the same `buildProverInput` can feed a snarkjs-in-browser
prover once the wasm/zkey are served, but nothing in this package depends
on a Node-only API beyond file/CLI plumbing.

### Circuit registration (vkey required)

Server-side verification (the workers `POST /v1/proofs/verify` and
`@lemmaoracle/verify`) both obtain the Groth16 verification key from
`artifact.location.vkey`. **A circuit registered without its vkey can
produce proofs that all fail verification** (the generation and
verification keys diverge). `register-circuit.ts` uploads all three
artifacts together and stops with an explicit error when the vkey is
missing (run build.sh first).

### Demo vendor (TEST-ONLY)

```sh
pnpm seed:demo-vendor          # == npx tsx scripts/seed-demo-vendor.ts
# → writes demo-vendor.example.json and prints the same JSON to stdout
```

`demo-vendor.example.json` is ⚠ **test-only — never use in production**.
It is derived deterministically from fixed demo keys (e.g. the
`DEMO_VENDOR_SECRET` default `demo-vendor-secret-1`), so it cannot be
used for a production registry or real accounts. The derivations (leaf,
Merkle, account hash) use the **same shared module** as the circuit
tests (`circuits/src/derivations.ts`), so they cannot drift from the
tests.

Public values the CLUBS (gate) side fixes from this bundle:

| value | origin |
| --- | --- |
| `registryRoot` | root of a depth-20 Poseidon Merkle tree (a single leaf = credentialCommitment, at index 0) |
| `vendorId` | `Poseidon1(toScalar("lemma:vendor:demo"))` (a fixed demo tag; the circuit accepts any value) |
| `requiredRoleHash` | `Poseidon1(toScalar("lemma:role:account-change"))` (the golden value in the circuit tests; asserted by the script) |
| `oldAccountHash` | `Poseidon6(1101, …)` over the `oldAccount` fields — the gate records this as `oldAccountHash` until the first submission |

Environment variables (all with defaults; TEST-ONLY): `DEMO_VENDOR_SECRET` /
`DEMO_VENDOR_SALT` / `DEMO_ROLE_NAME` / `DEMO_LEGAL_NAME` / `DEMO_OLD_BANK` /
`DEMO_OLD_BRANCH` / `DEMO_OLD_TYPE` / `DEMO_OLD_NUMBER` / `DEMO_OLD_HOLDER` /
`DEMO_NOW` (ms; the time base). Times are `validFrom = now−30d` /
`validUntil = now+365d` / `registeredAt = now−30d` (unix seconds), so
**re-running changes registryRoot** — reconfigure the gate side after a
re-run. Name normalization is trim + ASCII uppercase (a demo convention;
combinations where `holderNameHash === legalNameHash` does not hold fail
at startup).
