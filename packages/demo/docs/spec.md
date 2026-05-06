# Provenance Verification Mini Demo — Spec v0.2

> Source: BizDev spec doc, 2026-05-03 (v0.2 draft).
> CTO confirmed: URL design (`demo.lemma.frame00.com`).
> Open questions still pending: hosting, analytics, library selection,
> contact form, report email, ETHGlobal demo overlap, i18n.

## 0. Honest status

ETHGlobal Trust402 demo (`lemmaoracle/trust402`, currently private) ships
once that repo goes public. Until then, this mini demo is the
enterprise-targeted, plan-positioning entry point. After ETHGlobal demo
is public, this one may be repositioned as the lightweight / industry
entry, or merged. Decision deferred to v0.3.

## 1. Strategic context

- 2026-04-30 Anthropic Claude Security pushed a code-vulnerability live demo.
- Risk: Lemma is read as the same category. We are not.
- This demo gives a 30-second proof point that **Lemma is the AI-output
  verification layer, not a cyber product**.
- Companion to the microsite blog launch (2026-05-22).
- Slogan: *Finds bugs ≠ proves decisions.*

## 2. Hosting / URL

- Parent: `demo.lemma.frame00.com` (Lemma demo property).
- This demo: root path of the parent.
- Architecture: static SPA, client-side verification, no server roundtrip.
- Hosting: **Cloudflare Pages** (confirmed).
- Languages: v0.1 EN only (confirmed).

Future subdomains (separate releases, not in this PR):

| URL | Content | Phase |
|---|---|---|
| `issue.demo.lemma.frame00.com` | Asset #4 / Bazaar issuance demo | Stage A 2026-06-12+ |
| `agent.demo.lemma.frame00.com` | Agent-chain demo | post ETHGlobal v0.3 |
| `financial.demo.lemma.frame00.com` | Compliance plan industry cut | v0.4 2026-09+ |
| `manufacturing.demo.lemma.frame00.com` | Critical plan industry cut | v0.4 2026-09+ |

Wildcard SSL: `*.demo.lemma.frame00.com` recommended.

## 3. Page structure (single scroll page)

| Section | Content |
|---|---|
| Header | "Provenance verification" title + `Models change. Proofs remain.` standalone line. |
| Lead | "Verify that an AI output came from a specific model, with a specific input, under a specific policy." |
| Sample chooser | 6 samples (3 industries × valid/invalid) + Custom upload |
| Verify button | "Verify" CTA |
| Result panel | Pass / Fail + per-primitive breakdown |
| CTAs | Sales (left) + Builder waitlist (right) |
| Footer | `Built for decisions that matter.` + microsite link + GitHub schema repo link |

### Result panel breakdown

Pass / Fail alone is a black box. We display **what was verified** so
the user can see the architecture:

| Field | Display |
|---|---|
| Overall result | ✓ Pass / ✗ Fail (icon + color, accessibility) |
| Verification time | e.g. `123 ms` |
| Schema validation | ✓/✗ + schema id |
| Cryptographic envelope verification | ✓/✗ + scheme (`BBS+ over BLS12-381` / `Groth16`) |
| Input commitment integrity | ✓/✗ + scheme (`Poseidon over BN254`) |
| Output commitment integrity | ✓/✗ + scheme |
| Policy compliance proof (if any) | ✓/✗ + `Groth16 verified against policy_ref` |
| Failure reason (Fail only) | Plain English, what failed |

## 4. Six samples (3 industries × valid/invalid)

| # | Sample | Industry | Result | Demonstrates |
|---|---|---|---|---|
| 1 | `financial_valid_approval` | Financial | ✓ Pass | All checks pass; BBS+ selective disclosure |
| 2 | `financial_tampered_output` | Financial | ✗ Fail (output_hash mismatch) | Output tampering caught by hash check |
| 3 | `manufacturing_valid_process` | Manufacturing | ✓ Pass | Groth16 policy compliance proof |
| 4 | `manufacturing_model_swap` | Manufacturing | ✗ Fail (model_hash mismatch) | Model-swap attack caught by envelope signature |
| 5 | `agent_valid_chain_with_x402` | Agent | ✓ Pass | Multi-agent chain + x402 payment_proof |
| 6 | `agent_replay_attack` | Agent | ✗ Fail (proof_id duplicated) | Replay attack caught by proof_id de-duplication |

All fixtures bundled at build time. Custom upload runs entirely
client-side; uploaded JSON never leaves the browser.

## 5. Verification engine (Phase 2)

| Primitive | Library (target) | Purpose |
|---|---|---|
| Poseidon over BN254 | `circomlibjs` | Hash commitment verification |
| BBS+ over BLS12-381 | `@mattrglobal/bbs-signatures` (WASM) | Selective disclosure verification |
| Groth16 | `snarkjs` | Policy compliance proof |

Performance budget:

- LCP < 2.5 s
- Verify (median) < 500 ms (Groth16 included)
- Bundle < 500 KB gzipped (excl. WASM, lazy-loaded)

v0.1 ships verification keys / circuit refs in-bundle. v0.2 may fetch
them from the Asset #1 schema repo at runtime.

## 6. CTAs

Two side-by-side, shown for both pass and fail:

| CTA | Position | Copy | Destination |
|---|---|---|---|
| Sales (enterprise) | Left | "Talk to us about your use case" | contact form (UTM-tagged) |
| Builder waitlist | Right | "Join Trust402 waitlist" | `tally.so/r/kd0bZR` (UTM-tagged) |

No email gate before the demo. Voluntary email field after the result:
"Send me the verification report (optional)".

Avoid the sales-taboo phrases listed in §10.

## 7. Analytics

Events:

| Event | Properties |
|---|---|
| `demo_loaded` | referrer, utm_*, viewport |
| `sample_selected` | sample_id |
| `custom_uploaded` | file_size_bytes (no contents) |
| `verify_clicked` | sample_id or "custom" |
| `verify_completed` | sample_id, result, duration_ms, primitives_verified[] |
| `result_shown` | result, time_to_result_ms |
| `cta_clicked` | cta_type ("sales" / "waitlist"), result_at_click |
| `cta_outbound` | cta_type, outbound_url |
| `report_email_submitted` | (voluntary; email handled separately) |

UTM convention on every outbound:

```
?utm_source=demo
&utm_medium=web
&utm_campaign=cyberlabs_response
&utm_content=<sample_id_or_industry>
```

Platform: Plausible or Posthog self-hosted (no cookie banner). GA is
discouraged. Final pick is dev's call.

## 8. Privacy / security

- Verification fully client-side; uploaded files never go to a server (stated in footer + README).
- No-cookie analytics.
- Voluntary email is the only PII field.
- HSTS, CSP, Subresource Integrity enabled in production.

## 9. Accessibility / SEO

- WCAG 2.1 AA target.
- Full keyboard navigation.
- ARIA live region on result panel.
- Pass / Fail uses icon + text in addition to color.
- Color contrast ≥ 4.5:1.
- `<title>`: "Provenance verification — Lemma".
- `<meta description>`: "Models change. Proofs remain. Verify AI-output provenance with cryptographic primitives."
- Canonical URL set.
- `robots.txt`: index allowed, `/api/*` disallowed.

## 10. Copy guardrails

**Must use:**

- Header standalone line: "Models change. Proofs remain."
- Footer: "Built for decisions that matter."
- Equation slogan: "Finds bugs ≠ proves decisions."

**Avoid:**

- "security", "cyber", "attack defense", "blockchain", "Web3"
- Anthropic / OpenAI / CrowdStrike comparisons by name
- Pack names (only plan names: Civic / Critical / Compliance / Trust402)

**Tone:** measured, technical, no hyperbole. Enterprise-readable, not
hackathon.

## 11. Roadmap

| Version | When | Adds |
|---|---|---|
| v0.1 | 2026-05-22 | Root path, 6 samples + custom upload + 2 CTAs (UI + mock verifier) |
| v0.1.x | following 2 weeks | Real cryptographic verification swap-in |
| v0.2 | 2026-06 mid | Bazaar listing CTA (Asset #4 Stage A); JP language |
| v0.3 | 2026-07 mid | Mainnet `$0.001/proof` CTA; ETHGlobal demo cross-link |
| v0.4 | 2026-09+ | Industry subdomain spin-offs |

## 12. Open questions (carry-over)

1. Hosting: Cloudflare Pages confirmed; wildcard SSL still pending.
2. Analytics: Plausible vs Posthog — dev/C decision.
3. Final WASM library selection — dev decision.
4. Contact form: existing Tally vs new — marketing decision.
5. Report-email auto-send: v0.1 or v0.2 — dev/C decision.
6. ETHGlobal demo integration — re-evaluate after public.
7. i18n: confirmed EN-only for v0.1.

## 13. Dev handoff requirements

- Spec doc shipped at `docs/spec.md` (this file).
- Pinned versions in `package.json`; SBOM generation TBD.
- E2E: regression on all six samples' pass/fail.
- Lighthouse CI gating performance and accessibility.
- Deploy on 2026-05-22 alongside microsite blog launch.
- Feedback monitoring shift for first 7 days post-launch.

## 14. Brand / legal guardrails (selfcheck)

- No sales-taboo phrases (security product / attack defense / vendor comparison / Pack-only mentions).
- No Pack-as-product framing — only plan tier references where applicable.
- Tier-gating preserved: demo is free; upper-tier surfaces deferred.
- Civic plan out of scope here.
- "Built for decisions that matter." reserved for the footer (verbatim).
- "Models change. Proofs remain." reserved for the header standalone line.
- No Anthropic / OpenAI / CrowdStrike named comparisons.
- Sample data is synthetic; no customer-derived signal.
- Industry coverage stays balanced across the three verticals.
- Privacy (client-side, no-cookie analytics) stated in footer.
