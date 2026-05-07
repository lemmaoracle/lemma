# Proposal: Use-Cases & Pillars Web Integration

**Date:** 2026-05-07
**Author:** OpenClaw (based on discussion with Aggre & Mayumi)
**Approach:** Astro Content Collections with 3-layer Pillar architecture

---

## Why

The `posts/use-cases/` directory contains structured use-case documents that are currently inaccessible from the Lemma website. They need first-class pages with a clear information architecture: **Pillar Hub → Pillar → Use Case**. This 3-layer structure makes the reader's journey predictable and aligns CTAs with lead funnels.

## What's Changing

- Add `posts` repository as a git submodule or content source under `packages/web/`
- Define Astro Content Collections for `pillars` and `use-cases` with structured schemas
- Migrate each use case from `README.md` → `index.md` with frontmatter
- Build a **Pillar Hub** at `/pillars/` listing all 4 pillars
- Build **Pillar pages** at `/pillars/[slug]/` with a fixed 6-block template
- Build **Use Case pages** at `/use-cases/[slug]/` with section-based navigation
- Wire pillar-specific CTAs to existing lead funnels (Whitepaper DL, Trust402 Waitlist, Talk to Us)
- Add navigation links from Services and Blog pages

## 4 Pillars & Use Cases

### Pillar 1 ▸ Verifiable Origin（来歴証明）
- **訴求軸:** pre-execution attestation — 受け側が commit 前に origin を検証する
- **Sub-copy:** "Incident-grade Data Trust"
- **等式スローガン:** Cryptographically valid ≠ semantically right

### Pillar 2 ▸ Verifiable AI（AI出力の検証可能性）
- **訴求軸:** AI出力そのものを検証、判断の証拠保全 — "AIで防御を強化"でなく"AI出力を検証"
- **Sub-copy:** "Models change. Proofs remain." — pillar内で繰り返しanchor
- **等式スローガン:** Finds bugs ≠ proves decisions / AI-powered defense ≠ AI-output provenance

### Pillar 3 ▸ Agent Trust Chain（Trust402）
- **訴求軸:** Agent identity / role / spend control / on-chain attestation — x402経済のエージェント信頼基盤
- **Sub-copy:** "Agent Trust Chain"
- **等式スローガン:** Pays ≠ trustworthy / x402 makes agents pay. Lemma makes agent payments trustworthy.

### Pillar 4 ▸ Regulatory Attribute Proof（規制属性証明）
- **訴求軸:** 規制要件（KYC / AML / data residency / DPP / ESG）をプログラマブルな属性証明で満たす
- **Sub-copy:** なし（当面pillar名は内部運用語、公開タグライン化は外部公開時に再検討）
- **等式スローガン:** Compliance promised ≠ compliance proven（暫定）

## Pillar × CTA × Lead Funnel Mapping

| Pillar | Primary Reader | Primary CTA | Funnel |
|--------|---------------|-------------|--------|
| P1 Verifiable Origin | Bridge protocol (builder) / 金融機関 IT・SIer (enterprise) | Talk to us + secondary: Demo repo | Whitepaper DL (enterprise) + GitHub (builder) |
| P2 Verifiable AI | CISO・コンプラ責任者 (enterprise) | Talk to us | Whitepaper DL |
| P3 Agent Trust Chain | x402 / MCP builder | Join Trust402 waitlist (tally.so/r/kd0bZR) | — |
| P4 Regulatory Attribute Proof | Stablecoin issuer / fintech / 規制対応 (enterprise) | Download regulatory whitepaper (tally.so/r/xX0VYv) | — |

## Site Navigation Hierarchy

```
Top page
 └ /pillars/ (pillar hub — 4 problem-framed entries)
     └ /pillars/[slug]/ (pillar detail — 6-block template)
         └ /use-cases/[slug]/ (canonical use case asset)
 └ /blog/ /demo/ /schema/ /repo
 └ CTA (pillarごとに enterprise / builder を出し分け)
```

## Pillar Page 6-Block Template (fixed for all pillars)

1. **Problem Statement** (1 paragraph) — structural problem the pillar solves, ≤100 chars
2. **Why Now** (1 paragraph) — 1–2 regulatory/incident/market anchors
3. **How Lemma Fits** (3 bullet points) — ZK primitives by name (Poseidon / BBS+ / Groth16)
4. **Use Cases** (2–3 cards) — links to canonical use case pages
5. **Recent Thinking** (latest 3 blog posts) — auto-feed for freshness
6. **CTA** — pillar-specific primary + secondary

## Non-goals

- MDX interactivity in v1 (structural foundation only)
- Pitch-deck PDF/slide export
- Analytics tracking for section engagement
- Pillar 4 slug rename (keeping `regulatory-attribute-proof` as-is for now)