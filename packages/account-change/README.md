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
circuits/test/account-change.test.ts      positive + negative cases
circuits/scripts/build.sh                 compile + groth16 setup
scripts/register-circuit.ts               register with the Lemma API (wasm + zkey + vkey)
scripts/seed-demo-vendor.ts               TEST-ONLY demo vendor bundle (pnpm seed:demo-vendor)
demo-vendor.example.json                  committed example of one seed run (TEST-ONLY)
```

## 接続契約（CLUBS 側）

CLUBS 側の Proof Gate 統合がコーディングする共有リファレンス。CLUBS 側の
実装は別 PR（clubsx）で行う。**提出ページ（web UI）は後続の別タスク** —
この節はコア（回路・スクリプト・契約）だけを扱う。

### 公開シグナルの並び（18 本）

snarkjs の `publicSignals` は **出力3本 → `main { public [...] }` の宣言順**
（`circuits/test/account-change.test.ts` の `SIG` が同じ並びを押さえている。
食い違ったら回路が正）:

| index | signal | 種別 |
| ----- | ------ | ---- |
| 0 | `contextHash` | 出力（回路内導出・prover 供給ではない） |
| 1 | `attestationCommitment` | 出力 |
| 2 | `nullifier` | 出力（= Poseidon2(credentialCommitment, challengeId)） |
| 3 | `registryRoot` | GateInput |
| 4 | `credentialCommitment` | prover 選択（registryRoot に対する Merkle 包含で拘束） |
| 5 | `requiredRoleHash` | GateInput |
| 6 | `vendorId` | GateInput |
| 7 | `oldAccountHash` | GateInput（初回登録は 0） |
| 8 | `newAccountHash` | GateInput |
| 9 | `isFirst` | GateInput（= IsZero(oldAccountHash) に拘束） |
| 10 | `audienceHash` | GateInput |
| 11 | `requestDigest` | GateInput |
| 12 | `requestReceivedAt` | GateInput |
| 13 | `challengeId` | GateInput |
| 14 | `challengeIssuedAt` | GateInput |
| 15 | `challengeExpiresAt` | GateInput |
| 16 | `policyHash` | GateInput |
| 17 | `bankEvidenceHash` | ProvenInput（prover 供給・ゲートが実物確認する） |

### CLUBS 側エンドポイント（CLUBS 側で実装する）

- `GET /api/gate-card/{ref}` → 提出用ペイロード:

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
        "registryRoot": "<10進の体要素>",
        "vendorId": "<10進の体要素>",
        "requiredRoleHash": "<10進の体要素>",
        "audience": "<文字列>",
        "policy": "<文字列>",
        "requestCanonical": "<文字列>",
        "requestReceivedAt": 1760000000,
        "challengeId": "…",
        "challengeIssuedAt": 1760000000,
        "challengeExpiresAt": 1760100000,
        "isFirst": true
      }
    }
  }
  ```

  - `audience` / `policy` / `requestCanonical` は**文字列**で来る。プローバ側は
    SDK の `commitments.toScalar`（文字列 = SHA-256 mod r）で体要素に変えてから
    `audienceHash` / `policyHash` / `requestDigest` を組む。
  - `oldAccountHash` / `newAccountHash` は CLUBS から送られない。プローバ側が
    自分の入力から `Poseidon6(1101, bankCode, branchCode, accountType,
    accountNumber, holderNameHash)` で導出する（数値欄は固定幅10進として
    パース・口座名は両側で同じ正規化器にかける — 上の
    「Operational definitions」参照）。
- `POST /api/gate-card/{ref}` ボディ `{ proof, publicSignals }` →
  `{ ok: true }` または 4xx。`publicSignals` は上の並びのまま文字列配列。

### 2 段階検証（Gate policy どおり・消費の前後）

1. **stage 1 — 証明の検証**: `POST {workers}/v1/proofs/verify` に
   `{circuitId, proof, publicSignals}` → valid。
2. **stage 2 — 実物確認**: `bankEvidenceHash` を銀行側の証拠（新口座の
   入出金明細に付いたチャレンジコード）と突き合わせる。**チャレンジを消費する
   前に**行う（回路は hash を拘束するだけで真偽は証明しない）。
3. 通ったら、チャレンジを原子的に消費し、`nullifier` を記録し、
   `newAccountHash` として証明された口座**ちょうど**を登録する。

### 運用手順

1. `cd circuits && npm install && npm run build` — wasm / zkey /
   **`account-change_vkey.json`** が出る
2. `npx tsx scripts/register-circuit.ts` — **vkey を含む3点**（wasm・zkey・
   vkey）を Pinata に上げて `circuits.register`。vkey が無いと workers の
   `POST /v1/proofs/verify` も `@lemmaoracle/verify` のリゾルバも
   `artifact.location.vkey` から検証鍵を取れず、証明がすべて検証で落ちる
   （スクリプトは vkey 無しで登録しない）
3. `pnpm seed:demo-vendor` → `demo-vendor.example.json` の
   `registryRoot` / `vendorId` / `requiredRoleHash` / `oldAccountHash` を
   CLUBS 側の環境変数へ（⚠ TEST-ONLY）
4. 発行元ドメイン: TXT `_lemma.<domain>` に `oid=<orgIdentityDocHash>` を載せて
   `packages/feeds` の `seed:domain-dns`（TXT に `oid=` が届く前は
   `ORG_IDENTITY_DOC_HASH` で pin できる）、`packages/roles` の
   `seed:org-identity` は **24時間以内の再実行**（timestamp が古くなると
   発行者確認が stale を拒否する）

### 回路の登録（vkey 必須）

サーバー側検証（workers `POST /v1/proofs/verify` と `@lemmaoracle/verify`）は
どちらも `artifact.location.vkey` を見て Groth16 の検証鍵を取りに行く。
**vkey を登録し忘れた回路は、証明を作れてもすべて検証で落ちる**（生成と検証で
鍵が食い違うため）。`register-circuit.ts` は3点を一緒に上げ、vkey が無ければ
明示的なエラーで止まる（build.sh を先に回すこと）。

### デモベンダー（TEST-ONLY）

```sh
pnpm seed:demo-vendor          # == npx tsx scripts/seed-demo-vendor.ts
# → demo-vendor.example.json に書き出し、同じ JSON を stdout にも出す
```

`demo-vendor.example.json` は⚠ **テスト専用・本番では絶対に使わない**。
固定のデモ鍵（`DEMO_VENDOR_SECRET` 既定 `demo-vendor-secret-1` 等）から
決定的に作るので、本番のレジストリや実在の口座には使えない。
導出（leaf・Merkle・口座 hash）は回路テストと**同じ共有モジュール**
（`circuits/src/derivations.ts`）を使うので、テストと食い違わない。

CLUBS（ゲート）側がこのバンドルから固定する公開値:

| 値 | 由来 |
| --- | --- |
| `registryRoot` | 深さ20の Poseidon Merkle（リーフ1枚 = credentialCommitment・index 0）の根 |
| `vendorId` | `Poseidon1(toScalar("lemma:vendor:demo"))`（デモ用の固定タグ・回路は任意値） |
| `requiredRoleHash` | `Poseidon1(toScalar("lemma:role:account-change"))`（回路テストのゴールデン値・スクリプトが assert する） |
| `oldAccountHash` | `oldAccount` 欄からの `Poseidon6(1101, …)` — ゲートは初回受け付けまでこれを `oldAccountHash` として記録する |

環境変数（すべて既定値つき・TEST-ONLY）: `DEMO_VENDOR_SECRET` /
`DEMO_VENDOR_SALT` / `DEMO_ROLE_NAME` / `DEMO_LEGAL_NAME` / `DEMO_OLD_BANK` /
`DEMO_OLD_BRANCH` / `DEMO_OLD_TYPE` / `DEMO_OLD_NUMBER` / `DEMO_OLD_HOLDER` /
`DEMO_NOW`（ms・時刻の基準）。時刻は `validFrom = now−30d` /
`validUntil = now+365d` / `registeredAt = now−30d`（unix 秒）なので、
**再実行すると registryRoot が変わる** — 再実行したらゲート側も一緒に
設定し直す。名前の正規化は trim + ASCII uppercase（デモの約束。
`holderNameHash === legalNameHash` が成立しない組み合わせは起動時に落ちる）。
