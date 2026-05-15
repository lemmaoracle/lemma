# Provenance Verification Mini Demo — Spec v0.3

> Source: CTO design review 2026-05-15. Supersedes v0.2 (2026-05-03).
> Status: Signed off by Mayumi 2026-05-15. UTM campaign decision: rename to `ppsi_provenance` from v0.3.1 onward (no continuity period).
> Sign-off review fixes (2026-05-15): all §4 JA placeholders resolved; "987ms" replaced with "in under a second" / 「1秒以内」 in per-sample bullets (§3c result-panel illustration keeps 987ms / 423ms as example output); on-chain row visibility note added to §3e; sample id `agent_replay_attack` renamed to `agent_replay_duplicate` to match the operational-error framing required by §10.
> Changes from v0.2: business-scenario sample cards; stepped verification animation; liveness signals (real-time counters, jitter, session nonce, "0 bytes sent" badge, sub-progress, trace log); business-impact translation in result panel; counter-factual block for failure samples; trust badges section; JA locale; analytics events for the new interactions.

---

## 0. Honest status

v0.1 product is live at `demo.lemma.frame00.com` with mock verifier (Phase 1). v0.2 spec was drafted but not all items shipped — JP language deferred, Bazaar listing deferred.

This v0.3 spec covers the **storytelling redesign + JA simultaneous public release**, intended to ship with PPSI NPRM blog launch (GTM priority #1). The redesign converts the demo from "tech-correct, business-thin" to "30-second proof of commercial value".

Phase 2 (real cryptographic verification) is parallel work; this spec does not block it. The new UI accommodates both mock (Phase 1) and real (Phase 2) verifiers with the same stepped animation contract.

---

## 1. Strategic context

- v0.1 launched 2026-05-22 alongside microsite blog. Working, but result panel was a primitive checklist — non-technical visitors do not extract commercial intent.
- Microsite IA has matured (Pillars × Products × Use Cases) and the demo must funnel into all three layers.
- GTM #1 (PPSI NPRM 即応) drives JA-reader inflow. EN-only demo blocks 50%+ of incoming traffic from PPSI articles.
- Companion to `/services` refresh and PPSI blog launch. The three must ship in coordinated sequence.
- Slogan (unchanged): *Finds bugs ≠ proves decisions.*

---

## 2. Hosting / URL

- Parent: `demo.lemma.frame00.com`
- EN: `demo.lemma.frame00.com/` (root)
- **JA: `demo.lemma.frame00.com/ja/` (new in v0.3)**
- Architecture: static SPA (Astro), client-side verification, no server roundtrip
- Hosting: Cloudflare Pages
- Wildcard SSL: `*.demo.lemma.frame00.com` (still recommended for future subdomain demos)

Future subdomains (unchanged from v0.2):

| URL | Content | Phase |
|---|---|---|
| `issue.demo.lemma.frame00.com` | Bazaar issuance demo | post v0.3 |
| `agent.demo.lemma.frame00.com` | Agent-chain demo | post Trust402 public |
| `financial.demo.lemma.frame00.com` | Compliance industry cut | v0.4 |
| `manufacturing.demo.lemma.frame00.com` | Critical industry cut | v0.4 |

---

## 3. Page structure (single scroll page)

| Section | Content | New in v0.3? |
|---|---|---|
| Header | "Provenance verification" eyebrow + `Models change. Proofs remain.` + lang toggle | + lang toggle |
| Lead | "Verify that an AI output came from a specific model, with a specific input, under a specific policy." + tagline | unchanged |
| Sample chooser | 6 sample cards in business-scenario format (§3a) | rewritten |
| Verify button | "Verify" CTA | unchanged |
| Verification animation | Stepped 5-step reveal during verify (§3b) | **new** |
| Result panel | Pass/Fail + Pillar mapping + business impact translation (§3c) | rewritten |
| Counter-factual block | Fail samples only: "Without Lemma / With Lemma" 2-col (§3d) | **new** |
| Trust badges | Primitives / Regulatory / On-chain (§3e) | **new** |
| CTAs | Sales + Builder waitlist (§6) | unchanged copy, refined UTM |
| Footer | `Built for decisions that matter.` + microsite link + GitHub | + lang toggle |

### 3a. Sample card structure

Every sample card uses this layout. No exceptions.

```
┌─────────────────────────────────────────────┐
│ [INDUSTRY TAG]              [✓ Valid / ✗ Invalid]
│                                             │
│ Scenario:                                   │
│   1-2 sentence business scenario in plain   │
│   language. Mention concrete entities       │
│   (bank, manufacturer, etc.) and a concrete │
│   action (approval, shipment, payment).     │
│                                             │
│ Stakes (守るもの):                          │
│   • What's protected (privacy / trust / etc)│
│   • What's at risk if verification fails    │
│                                             │
│ Regulatory: [PPSI] [KYC/AML] [GDPR]         │
│ Primitives: [BBS+] [Groth16]                │
└─────────────────────────────────────────────┘
```

**Required fields per sample (EN + JA both must populate)**:
- `industry_tag`: locked vocabulary (`Banking & Finance` / `Manufacturing` / `Agent Economy`)
- `scenario_summary`: 30–60 words, business voice, concrete entities and action
- `stakes`: 2 bullets, ≤ 15 words each
- `regulatory_tags`: 1–3 tags from locked vocabulary (see §3e)
- `primitive_tags`: 1–3 tags from locked vocabulary
- `result_badge`: Valid | Invalid

### 3b. Verification animation (5 steps)

When user clicks Verify, the result panel reveals **stepwise**, not instantly. The visual contract below defines the stepped reveal; combine with §3f Liveness signals to prevent the animation from feeling pre-scripted.

| Step | Label (EN) | Label (JA) | Primitive | Target reveal time |
|---|---|---|---|---|
| 1 | Schema validation | スキーマ検証 | JSON Schema | 100ms after click |
| 2 | Cryptographic envelope | 暗号エンベロープ検証 | BBS+ over BLS12-381 | 300ms |
| 3 | Input commitment | 入力コミットメント | Poseidon over BN254 | 500ms |
| 4 | Output commitment | 出力コミットメント | Poseidon over BN254 | 700ms |
| 5 | Policy compliance proof | ポリシー証明 | Groth16 | 950ms |

Total animation duration: **~1000ms** for valid samples, **~400ms** for fail samples (animation halts at the failing step).

Each step shows:
- Step number and label
- Primitive name (compact, monospace)
- Status icon: pending → spinning → ✓ pass / ✗ fail
- Sub-label (one line, plain English/Japanese what was checked)

**Phase 1 (mock)**: timings are intentional UI delays.
**Phase 2 (real)**: real primitive timings drive the reveal; if total real time < 950ms, pad with reveal delays to maintain pacing. If > 1500ms, allow real timings to govern but show a "calculating proof…" intermediate state.

Visual treatment: progress bar across the top of the result panel, vertical stack of steps below. Color coding: cool blue for verifying, green for pass, red for fail. Failed step expands to show the failure reason inline.

### 3c. Result panel — business impact translation

After the 5-step animation completes, the result panel transitions to **business impact view**.

**Pass layout**:

```
✓ VERIFIED · 987ms · Browser-only · No data sent

What was cryptographically proven:
  Pillar 01 — Verifiable Origin    [✓ source registered]
  Pillar 02 — Verifiable AI         [✓ model registered]
  Pillar 03 — Agent Authority       [✓ within authority]
  Pillar 04 — Regulatory Attribute  [✓ proven without disclosure]

What this means in production:
  • {audit_response_compare}     ← per-sample copy
  • {privacy_preservation}        ← per-sample copy
  • {regulator_verifiability}     ← per-sample copy

[Sales CTA]   [Builder CTA]
```

Only the Pillars actually exercised by the sample are shown (1–4 of them). Each Pillar entry links to `/{locale}/pillars/{slug}/` on the microsite.

**Fail layout**:

```
✗ VERIFICATION FAILED · 423ms · Step {N} failed

What went wrong:
  Plain-language failure reason. One sentence.

[Counter-factual block — §3d]

[Sales CTA]   [Builder CTA]
```

**Required per-sample copy for §3c**:
Each sample (valid only) must supply:
- 3 "business impact" bullets, each ≤ 20 words
- Each bullet must contain a comparative or quantitative element (time, cost, scope)
- No vague claims ("better security", "improved compliance" — banned)

### 3d. Counter-factual block (fail samples only)

After the fail summary, render a 2-column block:

```
┌──────────────────────────────────┬──────────────────────────────────┐
│   Without provenance verification │   With Lemma                       │
├──────────────────────────────────┼──────────────────────────────────┤
│ ✗ {consequence 1}                 │ ✓ {outcome 1}                      │
│ ✗ {consequence 2}                 │ ✓ {outcome 2}                      │
│ ✗ {consequence 3}                 │ ✓ {outcome 3}                      │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Required per-sample copy**:
- 3 consequence/outcome pairs per fail sample (3 × 3 fail samples = 9 pairs total)
- Each consequence must be concrete and specific (not "bad things happen")
- No security-product framing — no "attack", "hacker", "malicious actor" (see §10)
- Quantify when possible ("3 weeks of compliance review later" > "later")

### 3e. Trust badges section

Static section between result panel and CTAs, always visible after first verify.

Three groups, horizontal rows:

```
Cryptographic primitives
  [Poseidon over BN254]  [BBS+ over BLS12-381]  [Groth16]

Regulatory alignment
  [PPSI]  [EUDR]  [CBAM]  [KYC/AML]  [GDPR]

On-chain anchoring
  [Base]  [Polygon]  [Monad]

  → Open spec on GitHub
```

> **On-chain row visibility**: build-time check against actual deployment state per §12 Q4. If zero chains are live at build time, the on-chain row is hidden entirely — do not render greyed-out badges. Base / Polygon / Monad above is the **target** set; real chip rendering depends on what the build-time check finds.

**Locked vocabulary**:
- Primitives: only the 3 above. Adding a primitive requires spec amendment.
- Regulatory: PPSI / EUDR / CBAM / KYC/AML / GDPR. Adding requires legal review (frame00).
- On-chain: only chains where Lemma contracts are **actually deployed at the time of badge rendering**. Build-time check required (Acceptance criteria §13).

Badges are visual chips, not links (avoids dead-link risk if a regulator's page moves).

### 3f. Liveness signals

The stepped animation (§3b) defines the visual contract. To prevent it from feeling "scripted", the following liveness signals are required. Each is implementable in Phase 1 (mock verifier) and continues to work in Phase 2 (real verifier) without UI change.

| Signal | v0.3.x | Implementation note |
|---|---|---|
| Real-time ms counter per step | 0.3.1 | `performance.now()` drives display; counter visibly increments per `requestAnimationFrame`. Final value freezes on step completion (e.g., `Step 2 ✓ in 287ms`). |
| Per-run timing jitter | 0.3.1 | Phase 1: add ±15–30ms random offset to each step's reveal time so re-running the same sample produces visibly different totals. Phase 2: real primitive timings used as-is. |
| Session nonce | 0.3.1 | `crypto.randomUUID()` generated at `verify_clicked`; first 8 chars displayed in result panel header (e.g., `session: a3b7-2f9c`). Different every run. |
| "0 bytes sent" persistent indicator | 0.3.1 | Always visible during verification (`🔒 0 bytes sent · browser-only` / 「🔒 通信ゼロ・ブラウザ内のみ」). Brief pulse animation on verification completion. |
| Step-internal sub-progress | 0.3.2 | Each step exposes 2–4 sub-stages with their own micro-progress (e.g., Step 2 BBS+: `Pairing 1/3 → 2/3 → 3/3`). Phase 1 uses scripted sequence; Phase 2 uses primitive's actual checkpoints. |
| Trace log (collapsible) | 0.3.2 | `Show trace ▾` toggle below the result panel. When open, reveals a monospace log strip with `[t=…ms] verifier.<op> → result` lines, populated live during verification. Toggle state persists across verify runs (component state, not localStorage). |

**Rejected signals (recorded for change history)**:
- Matrix-style byte stream — conflicts with §10 "measured, enterprise-readable" tone.
- CPU/memory percentage indicators — browser cannot expose true CPU%; would mislead.
- WASM-load indicator — only meaningful in Phase 2; defer to v0.5.
- Network icon strikethrough — overkill given the "0 bytes sent" badge already covers it.

**Accessibility**:
- Real-time counters: paused under `prefers-reduced-motion`. Show only the final value per step.
- Trace log: keyboard-toggleable (`Show trace ▾`). Each new log line emitted to the same ARIA live region as the step reveal — no second polite region.
- Timing jitter: never widen the total beyond §3b's stated budget by more than ±10%.

---

## 4. Six samples — required business-scenario data

For each sample, the following content is required in **both EN and JA**. Authoritative copy lives in `src/i18n/{en,ja}.json` under `samples.{sample_id}`.

### 4.1 `financial_valid_approval` (✓ Valid)

- **Industry tag**: Banking & Finance / 銀行・金融
- **Scenario (EN)**: A regional bank approves a ¥5,000,000 small-business loan. The applicant's exact income is never disclosed to the bank's AI; Lemma proves only that income exceeds the policy threshold and that the applicant is not on any AML watchlist.
- **Scenario (JA)**: 地方銀行が中小企業向けに ¥5,000,000 の融資を承認するシナリオ。借り手の正確な所得は AI に開示されない。Lemma は「所得が方針の閾値を上回る」「AML 該当者でない」ことだけを証明する。
- **Stakes (EN)**: Borrower privacy preserved · Regulatory audit trail produced
- **Stakes (JA)**: 借り手のプライバシー保護 / 監査トレース生成
- **Regulatory**: PPSI / KYC/AML / GDPR (EN); PPSI / KYC/AML / 個人情報保護法 (JA — local name first)
- **Primitives**: BBS+ / Groth16
- **Business impact (EN)**:
  - Audit response in under a second vs ~3 days of manual review
  - Borrower's income never disclosed to bank or regulator
  - Regulator can verify the proof directly, no trust required
- **Business impact (JA)**:
  - 監査対応は1秒以内、~3日の手作業レビューと比較
  - 借り手の所得は銀行にも規制当局にも非開示のまま
  - 規制当局が証明を直接検証可能、信頼前提が不要

### 4.2 `financial_tampered_output` (✗ Invalid)

- **Industry tag**: Banking & Finance / 銀行・金融
- **Scenario (EN)**: The same loan approval, but the approval document was edited after the AI signed it. Lemma detects the tampering before the document is presented to compliance.
- **Scenario (JA)**: 同じ融資承認だが、AI が署名した後で承認書類が編集された。Lemma はコンプライアンスチームに提示される前に改ざんを検出する。
- **Stakes (EN)**: Audit integrity · Bank liability
- **Stakes (JA)**: 監査の完全性 / 銀行の責任
- **Regulatory**: PPSI / KYC/AML
- **Primitives**: Poseidon
- **Counter-factual (EN)**:
  - Without: Tampered approval passes silently · Compliance discovers it weeks later · Bank faces regulatory penalty for non-compliant decision
  - With: Tampering detected in under a second · Cryptographic audit trail preserved · Regulator verifies the original AI-signed document
- **Counter-factual (JA)**:
  - Without: 改ざんされた承認が黙って通過 · コンプライアンスチームが数週間後に発見 · 銀行が不適合判断による規制ペナルティを負う
  - With: 1秒以内に改ざんを検出 · 暗号学的な監査トレースが保全 · 規制当局が AI 署名済みの原本を検証

### 4.3 `manufacturing_valid_process` (✓ Valid)

- **Industry tag**: Manufacturing / 製造業
- **Scenario (EN)**: A parts manufacturer ships a batch to an EU buyer. Lemma proves the production process conformed to the registered ESG/CBAM-compliant specification.
- **Scenario (JA)**: 部品メーカーが EU バイヤーにバッチを出荷。Lemma は生産工程が登録済みの ESG/CBAM 適合仕様に従ったことを証明する。
- **Stakes (EN)**: Supply-chain trust · EU import compliance
- **Stakes (JA)**: サプライチェーン信頼 / EU輸入適合
- **Regulatory**: EUDR / CBAM
- **Primitives**: Groth16
- **Business impact (EN)**:
  - CBAM proof generated at ship time vs ~2 weeks of compliance documentation
  - Process spec changes are tracked cryptographically, not by emails
  - Buyer verifies compliance independently, no auditor required
- **Business impact (JA)**:
  - CBAM 証明を出荷時に生成、コンプライアンス書類の ~2 週間と比較
  - 工程仕様の変更は暗号学的に追跡、メール往復ではない
  - バイヤーが独立して適合性を検証、監査人不要

### 4.4 `manufacturing_model_swap` (✗ Invalid)

- **Industry tag**: Manufacturing / 製造業
- **Scenario (EN)**: The same shipment, but a different AI inspection model was substituted between certification and shipment. Lemma detects the substitution via envelope signature mismatch.
- **Scenario (JA)**: 同じ出荷だが、認証から出荷の間に別の AI 検査モデルが置換された。Lemma はエンベロープ署名の不一致で置換を検出する。
- **Stakes (EN)**: Process trust · Recall liability
- **Stakes (JA)**: 工程信頼 / リコール責任
- **Regulatory**: EUDR / CBAM
- **Primitives**: BBS+ / Poseidon
- **Counter-factual (EN)**:
  - Without: Shipment proceeds with unverified model · Defect discovered after EU import · Recall cost + import-ban risk
  - With: Substitution detected before shipment · Original certified model required for re-issue · Recall avoided
- **Counter-factual (JA)**:
  - Without: 未検証モデルのまま出荷が進行 · 欠陥が EU 輸入後に発覚 · リコール費用＋輸入禁止リスク
  - With: 出荷前に置換を検出 · 再発行には認証済み原本モデルが必須 · リコールを回避

### 4.5 `agent_valid_chain_with_x402` (✓ Valid)

- **Industry tag**: Agent Economy / エージェント経済
- **Scenario (EN)**: An autonomous agent purchases an API service via x402 payment. Lemma proves the agent had delegation authority and that the payment receipt is genuine.
- **Scenario (JA)**: 自律エージェントが x402 決済を通じて API サービスを購入する。Lemma はエージェントに委任権限があったこと、および支払い証明が正規であることを証明する。
- **Stakes (EN)**: Delegation integrity · Payment receipt non-repudiation
- **Stakes (JA)**: 委任の完全性 / 支払い証明の非否認性
- **Regulatory**: (none — emerging space)
- **Primitives**: BBS+ / Groth16
- **Business impact (EN)**:
  - Multi-agent transaction verified in under a second; no manual equivalent exists
  - Delegation chain provable post-hoc, no agent-log scraping needed
  - x402 payment cryptographically linked to authorized action
- **Business impact (JA)**:
  - マルチエージェント取引を1秒以内に検証、手作業の代替手段はない
  - 委任チェーンを事後証明可能、エージェントログの走査が不要
  - x402 支払いを承認済み行動と暗号学的に紐付け

### 4.6 `agent_replay_duplicate` (✗ Invalid)

- **Industry tag**: Agent Economy / エージェント経済
- **Scenario (EN)**: The same proof is submitted twice across two settlement steps. Lemma detects the duplicate `proof_id` and rejects the second submission.
- **Scenario (JA)**: 同じ証明が2つの決済ステップで提出される。Lemma は重複した `proof_id` を検出し、2回目の提出を拒否する。
- **Stakes (EN)**: Settlement integrity · Double-spend prevention
- **Stakes (JA)**: 決済の完全性 / 二重支払い防止
- **Regulatory**: (none)
- **Primitives**: Poseidon
- **Counter-factual (EN)**: An "operational error" framing per §10 (a stuck retry loop, not a malicious actor). Sample id `agent_replay_duplicate` renamed from `agent_replay_attack` in sign-off review to match this framing — coordinate `samples.*` i18n keys and `utm_content=` values in the v0.3.1 implementation.
  - Without: Duplicate settlement passes · Funds double-deducted · Manual reconciliation required
  - With: Duplicate proof_id detected · Second settlement rejected · No reconciliation needed
- **Counter-factual (JA)**:
  - Without: 重複決済が通過 · 資金が二重控除 · 手作業による照合が必要
  - With: 重複した proof_id を検出 · 2 回目の決済を拒否 · 照合作業が不要

---

## 5. Verification engine

Unchanged from v0.2. Phase 2 swap-in (real primitives) is independent of v0.3 UI redesign.

| Primitive | Library (target) | Purpose |
|---|---|---|
| Poseidon over BN254 | `circomlibjs` | Hash commitment verification |
| BBS+ over BLS12-381 | `@mattrglobal/bbs-signatures` (WASM) | Selective disclosure verification |
| Groth16 | `snarkjs` | Policy compliance proof |

Performance budget:
- LCP < 2.5 s
- Verify (median, real primitives, Phase 2) < 500 ms
- **Stepped animation total: ~1000 ms** for valid, **~400 ms** for fail (UI pacing dominates Phase 1; primitive timing dominates Phase 2 if > 1000ms)
- Bundle < 500 KB gzipped (excl. WASM, lazy-loaded)

---

## 6. CTAs

Two side-by-side, shown for both pass and fail, after the trust-badges section.

| CTA | Position | Copy (EN) | Copy (JA) | Destination |
|---|---|---|---|---|
| Sales | Left | "Talk to us about your use case" | 「導入相談に進む」 | `lemma.frame00.com/{locale}/#contact` (UTM-tagged) |
| Builder waitlist | Right | "Join Trust402 waitlist" | 「Trust402 waitlist に登録」 | `tally.so/r/kd0bZR` (UTM-tagged) |

UTM convention (updated for v0.3):

```
?utm_source=demo
&utm_medium=web
&utm_campaign=ppsi_provenance        ← updated (was cyberlabs_response)
&utm_content=<sample_id>
&utm_term=<locale>                   ← new: en | ja
```

Voluntary email field after the result (unchanged): "Send me the verification report (optional)" / 「検証レポートをメールで受け取る (任意)」

### 6a. Language toggle

Top-right of header. Compact: `EN | 日本語`.
- Clicking toggles between `/` and `/ja/` paths.
- Currently selected sample (if any) preserved via URL hash: `/ja/#sample=financial_valid_approval`.
- Toggle visibility: always (desktop / mobile).

### 6b. JA localization rules

- **Currency**: Yen with full digit (`¥5,000,000`) in sample cards. Compact forms acceptable in result-panel bullets if space-constrained (`¥500万`).
- **Regulatory names**: Local name first, EN/international abbreviation in parens. E.g., `個人情報保護法 (APPI)`. PPSI / EUDR / CBAM stay as-is since they're US/EU regulations.
- **Tone**: です・ます調. No casual register. No overly formal 文語 style.
- **Verb selection**: 検証 for "verify (operation)", 証明 for "prove (cryptographic claim)", 確認 for "check (user-facing)". Do not use カタカナ "ベリファイ" / "プルーフ".
- **Industry vocabulary**: match `lemma/packages/web/src/i18n/ja.json` use-case page wording (grep before introducing new terms).
- **Numbers**: half-width digits with commas (`5,000,000`, not `５，０００，０００`).

---

## 7. Analytics

Events (additions marked `[new]`):

| Event | Properties |
|---|---|
| `demo_loaded` | referrer, utm_*, viewport, **`locale` [new]** |
| `language_toggled` `[new]` | from_locale, to_locale, time_since_load_ms |
| `sample_selected` | sample_id, **`locale` [new]** |
| `custom_uploaded` | file_size_bytes |
| `verify_clicked` | sample_id or "custom", locale |
| `verification_step_completed` `[new]` | sample_id, step_number, step_name, result, duration_ms |
| `verify_completed` | sample_id, result, total_duration_ms, primitives_verified[] |
| `result_shown` | result, time_to_result_ms |
| `counterfactual_shown` `[new]` | sample_id |
| `trust_badges_viewport_entered` `[new]` | (intersection observer) |
| `cta_clicked` | cta_type, result_at_click, locale, sample_id |
| `cta_outbound` | cta_type, outbound_url, locale |
| `report_email_submitted` | (voluntary; email handled separately) |

Platform: Plausible or Posthog self-hosted. No cookies. GA discouraged.

---

## 8. Privacy / security

Unchanged from v0.2:
- Verification fully client-side; uploaded files never leave the browser.
- No-cookie analytics.
- Voluntary email is the only PII field.
- HSTS, CSP, Subresource Integrity in production.

---

## 9. Accessibility / SEO

- WCAG 2.1 AA target.
- Full keyboard navigation, including language toggle.
- ARIA live region on result panel — announces each step completion. §3f trace-log lines, when enabled, emit into the same region.
- Stepped animation: respect `prefers-reduced-motion` — skip animations, show final state instantly.
- Liveness signals (§3f) under `prefers-reduced-motion`: real-time counters paused; only final per-step value shown. Timing jitter still applied (it does not animate, only varies the displayed final number).
- Pass / Fail uses icon + text in addition to color. Counter-factual columns use ✓/✗ icons in addition to color.
- Color contrast ≥ 4.5:1, including step icons and trust badges.

SEO meta:

- **EN** `<title>`: "Provenance verification — Lemma"
- **JA** `<title>`: 「来歴検証 — Lemma」
- **EN** `<meta description>`: "Models change. Proofs remain. Verify AI-output provenance with cryptographic primitives."
- **JA** `<meta description>`: 「モデルは変わる。証明は残る。暗号プリミティブによる AI 出力の来歴検証。」
- `<link rel="alternate" hreflang="...">` between `/` and `/ja/`.
- Canonical URLs per locale.
- `robots.txt`: index allowed.

---

## 10. Copy guardrails (extends v0.2)

**Must use (verbatim)**:
- Header standalone line (EN): "Models change. Proofs remain."
- Header standalone line (JA): 「モデルは変わる。証明は残る。」
- Footer (EN): "Built for decisions that matter."
- Footer (JA): 「決断が、決断であり続けるために。」
- Equation slogan (EN): "Finds bugs ≠ proves decisions."
- Equation slogan (JA): 「バグ検出 ≠ 判断の証明」

**Avoid**:
- "security", "cyber", "attack defense", "blockchain", "Web3" (EN); 「セキュリティ」「サイバー」「攻撃」「ブロックチェーン」「Web3」 (JA)
- Anthropic / OpenAI / CrowdStrike comparisons by name
- Pack names — plan names only (Civic / Critical / Compliance / Trust402)
- In counter-factual blocks: "hacker", "attacker", "malicious actor" — reframe as "operational error" / "untracked modification" / "duplicate submission"
- Hyperbole: "revolutionary", "game-changing", "world-class", etc.

**Tone**: measured, technical, enterprise-readable. Not hackathon. JA register: です・ます.

### 10a. Counter-factual copy template (new in v0.3)

Each counter-factual entry (in §4 fail samples) must pass this checklist:

- [ ] Specific entity referenced (bank, manufacturer, agent) — not "the user"
- [ ] Quantified consequence where possible (time / cost / scope)
- [ ] Concrete failure mode — not "something bad happens"
- [ ] No security-product framing (no attacker / hacker / malicious)
- [ ] Symmetric structure: "Without" line and "With" line address the same axis
- [ ] ≤ 15 words per line

---

## 11. Roadmap (revised)

| Version | When | Adds |
|---|---|---|
| v0.1 | shipped 2026-05-22 | Mock verifier, 6 samples, basic UI |
| **v0.3.1** | **2026-06 early** | Business scenario sample cards · JA simultaneous launch · Result panel business impact translation · Liveness signals tier 1 (real-time ms counter · timing jitter · session nonce · "0 bytes sent" indicator) |
| **v0.3.2** | **2026-06 mid** | Stepped verification animation · Counter-factual blocks · Trust badges section · Liveness signals tier 2 (step-internal sub-progress · trace log) |
| v0.3.3 | 2026-07 early | Scenario icons · Performance/cost panel (subject to verifiable stats) |
| v0.4 | 2026-09+ | Industry subdomain spin-offs · Bazaar listing CTA |
| v0.5 | post Phase 2 | Real cryptographic verifier swap-in · `$0.001/proof` mainnet CTA · WASM-load indicator |

v0.2 (Bazaar listing + JP) is **superseded by v0.3**.

---

## 12. Open questions

1. **Voluntary email auto-send**: Re-evaluate in v0.3.2 (still deferred).
2. **WASM library final selection**: Phase 2 dev call.
3. **Counter-factual "operational error" framing for `agent_replay_duplicate`** (formerly `agent_replay_attack`): confirm the wording reads natural (not euphemistic). Test with 2 internal readers before public.
4. **Trust badges — on-chain anchoring badges**: build-time check needed against actual deployment state. If no chains deployed, hide the row entirely (don't show greyed-out badges).
5. **Bilingual SEO**: hreflang setup and Cloudflare Pages routing nuance — verify on staging.
6. ~~**PPSI campaign UTM rename**~~ — Resolved at sign-off (2026-05-15): adopt `ppsi_provenance` from v0.3.1; no continuity period for `cyberlabs_response`.

---

## 13. Dev handoff requirements

- v0.3 spec at `lemma/packages/demo/docs/spec.md` (this file, post sign-off).
- Pinned versions in `package.json`.
- E2E: regression on all six samples in both EN and JA. Verify stepped animation timings, counter-factual rendering, language toggle round-trip.
- Lighthouse CI: performance and a11y on both locales.
- Build-time check: trust badges chain list reflects actual deployment state.
- Deploy v0.3.1 alongside PPSI NPRM blog launch.
- Feedback monitoring shift for first 7 days post each v0.3.x launch.

---

## 14. Brand / legal guardrails (selfcheck)

(unchanged from v0.2 except where extended above)

- No sales-taboo phrases.
- No Pack-as-product framing — plan tier references only.
- Tier-gating preserved: demo is free.
- Civic plan out of scope here (no Civic sample in this demo — covered in v0.4 industry subdomains).
- "Built for decisions that matter." / 「決断が、決断であり続けるために。」 reserved for footer (verbatim).
- "Models change. Proofs remain." / 「モデルは変わる。証明は残る。」 reserved for header standalone (verbatim).
- No Anthropic / OpenAI / CrowdStrike named comparisons.
- Sample data is synthetic; no customer-derived signal. Names of "the bank" / "the manufacturer" stay generic.
- Industry coverage stays balanced (2 samples × 3 industries).
- Privacy statement (client-side, no-cookie) in footer in both locales.
- Counter-factual copy reviewed against §10a checklist.

---

## Appendix A. v0.2 → v0.3 change summary (CTO review aid)

| Section | v0.2 state | v0.3 change | Rationale |
|---|---|---|---|
| 0 Honest status | "v0.1 mock, decisions deferred" | "v0.1 shipped, v0.3 redesign in flight" | Reality update |
| 1 Strategic context | "companion to blog launch" | + GTM #1 (PPSI) explicit | Funnel alignment |
| 2 Hosting / URL | EN only at root | + JA at `/ja/` | Audience reach |
| 3 Page structure | 6 sections | + 3 new: animation / counter-factual / trust badges | Storytelling |
| 3a Sample card | (informal) | Strict template, required fields | Consistency |
| 3b Step animation | none | 5-step reveal, ~1000ms pacing | "Crypto visible" |
| 3c Result panel | tech checklist | Pillar mapping + business impact bullets | Commercial value |
| 3d Counter-factual | none | 2-col fail block | Stakes visible |
| 3e Trust badges | none | 3 groups, locked vocab | Credibility |
| 3f Liveness signals | none | Real-time counters · jitter · nonce · "0 bytes sent" · sub-progress · trace log | Convey real computation, not scripted animation |
| 4 Samples | tech descriptions | Full business scenario data EN+JA | Decision-maker fit |
| 6a Language toggle | none | Top-right, hash-preserved | JA reach |
| 6b JA rules | none | Currency / regulator / tone | Localization quality |
| 7 Analytics | 9 events | + 4 events for new interactions | Funnel observability |
| 9 A11y | reduced-motion not specified | reduced-motion respected for animation | A11y compliance |
| 10 Copy guardrails | 3 rules | + counter-factual checklist + JA verbatim lines | Drift prevention |
| 11 Roadmap | v0.2 / v0.3 single | v0.3.1 / .2 / .3 phased | Realistic sequencing |

---

## Appendix B. Sequencing dependency (informational)

```
spec v0.3 sign-off
       │
       ├──→ v0.3.1 implementation brief (sample cards + JA + result panel)
       │           │
       │           └──→ Claude Code session in lemma/packages/demo/
       │                       │
       │                       └──→ v0.3.1 deploy (target: PPSI blog launch day)
       │
       ├──→ v0.3.2 implementation brief (animation + counter-factual + trust badges)
       │           │
       │           └──→ separate session, 2 weeks after v0.3.1
       │
       └──→ v0.3.3 (optional, art/copy polish)
```

Each v0.3.x is a separate PR. spec.md commits to lemma submodule once v0.3 is signed off; further versions amend in place.
