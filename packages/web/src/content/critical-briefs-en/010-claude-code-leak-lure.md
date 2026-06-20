---
brief_no: 10
title: "Claude Code ソース流出便乗マルウェア — 信頼シグナルと GitHub Releases を配送路に転用した来歴偽装"
title_en: "Claude Code Source-Leak Lures — Weaponizing Trust Signals and GitHub Releases as a Provenance-Spoofed Delivery Channel"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-03-31
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["004-megalodon-github-supply-chain", "003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "信頼シグナルと GitHub Releases を配送路に転用 — Claude Code 流出便乗マルウェア"
og_lead_en: "Trust signals and GitHub Releases weaponized as a delivery channel — Claude Code leak lures"
gap_detected: "The leak source admitted the mistake and pulled the version, and analysis firms and the distribution platform were able to detect and remove the fakes."
gap_missing: "Those downloading had no layer to confirm at the point of acquisition whether the artifact was really built by a legitimate distributor, accepting it on the trust of a well-known brand name and the hosting site alone."
gap_fix: "Before running or installing, independently verify with Lemma that the artifact was built by a legitimate distributor, and prevent it up front."
---

## TL;DR

Anthropic's Claude Code npm package exposed roughly 512,000 lines of internal source via a packaging error that shipped a source map. Within 24 hours, an existing malware campaign pivoted to the leak, distributing the Vidar credential stealer from GitHub Releases via fake repositories disguised as "the leaked Claude Code." The attack exploited no vulnerability; it turned trust signals — a brand name and a hosting site — into a substitute for provenance, exploiting the absence of any layer that verifies artifact authenticity at acquisition. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Originating exposure**: Anthropic's npm publish of `@anthropic-ai/claude-code` v2.1.88 inadvertently shipped `cli.js.map` (Bun-generated, 59.8MB source map). `sourcesContent` exposed an internal TypeScript source tree of roughly 512,000 lines / 1,900 files (originating from a build artifact in a publicly accessible Cloudflare R2 bucket)
- **Cause**: `.npmignore` did not exclude `.map`, and Bun generates a full source map by default — a packaging error (not a sophisticated compromise)
- **Lure campaign**: An AI-themed lure-style malware distribution operation operational since February 2026. Reuses 25-plus software brands to deliver the same payload
- **Payload**: A Rust-built dropper (`TradeAI.exe` / `ClaudeCode_x64.exe`) deploys Vidar stealer v18.7 and the GhostSocks proxy. Vidar steals browser credentials, cryptocurrency wallets, session tokens, and the like with multi-threading; GhostSocks turns the victim endpoint into a SOCKS5 residential proxy
- **Delivery path**: GitHub Releases abused as a trusted distribution channel. 78–167MB trojan archives and disposable accounts repeatedly evade takedown
- **Secondary risk**: The leaked source itself carries long-term risk via vulnerability discovery, prompt-injection design blueprints, and exposure of agentic attack surface
- **Analysis / disclosure**: Trend Micro (2026-04-03, authors Jacob Santos / Sophia Nilette Robles / Jeffrey Francis Bonaobra)

---

## 2. Timeline

- February 2026: A lure-style malware campaign disguised as AI tools begins operation (`TradeAI.exe`, 18-plus specimens, impersonating Copilot, Cursor, and others)
- 2026-03-31: Anthropic's npm publish (v2.1.88) inadvertently ships the source map, exposing roughly 512,000 lines of source. Within hours, propagates as mirrors across thousands of GitHub repositories
- After 2026-03-31: Anthropic confirms this was human error, withdraws the affected version, issues DMCA / copyright takedowns to mirrors (states that no exposure of customer data or credentials)
- 2026-04-01: Within 24 hours of the leak, the existing campaign pivots to "leaked Claude Code." Distributes `ClaudeCode_x64.7z` / `ClaudeCode_x64.exe` via GitHub Releases
- 2026-04-03: Trend Micro publishes the analysis

---

## 3. Attack Vector

1. **Pre-existing infrastructure**: A lure-style campaign disguised as AI tools has been operational since February 2026. Centered on `TradeAI.exe`, it reuses multiple brands and maintains the infrastructure to deliver the same Rust-built infostealer
2. **Trust-signal trigger**: The Claude Code source leak on 2026-03-31 provides a high-attention, time-sensitive lure. Attackers immediately pivot the existing infrastructure
3. **Provenance spoofing**: Within 24 hours, fake GitHub repositories disguised as "the leaked Claude Code" are created. The brand name (Claude Code) and the distribution platform (GitHub Releases) — trust signals — are abused as substitutes for artifact provenance
4. **Payload delivery**: Victims fetch 78–167MB 7z archives from GitHub Releases. `ClaudeCode_x64.exe` (the Rust-built dropper) deploys Vidar stealer v18.7 and the GhostSocks proxy
5. **Impact realization**: Vidar exfiltrates browser credentials, cryptocurrency wallets, session tokens, and system information. GhostSocks turns the victim endpoint into a residential proxy used externally
6. **Evasion & persistence**: Disposable accounts and large trojan archives repeatedly evade GitHub takedown, with the campaign continuing while switching brands

---

## 4. Structural Analysis

This incident belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is the absence of a layer in which users and distribution platforms can independently verify, at the point of acquisition, that a downloaded artifact "really is Anthropic's Claude Code." The attackers did not exploit a vulnerability; they abused **the trust signals themselves** — the brand name and GitHub Releases — as substitutes for provenance. Secondary tagging is `identity-auth`.

It shares `code-provenance` with Brief 004 (Megalodon GitHub supply chain) but has a different primitive. Brief 004 was contamination via a legitimate process using stolen developer credentials (forging commit author origin); this incident is forgery of artifact origin via brand impersonation (forging the provenance of distributed artifacts). Both share the structure that "an artifact's origin is accepted without an independent verification layer." It is also adjacent to Brief 003 (Starlette / BadHost) on the point that identity / origin assertions are not independently verified. Note that this incident has a two-layer structure — the source of the leak (Anthropic-side packaging error) and the lure attack (third-party brand impersonation) — and shows that software vulnerabilities are not the only path; human and organizational gaps can become the starting point of material impact.

---

## 5. The detection–proof gap

In this incident, Anthropic confirmed the leak as human error and withdrew the affected version and issued DMCA takedowns; Trend Micro analyzed and disclosed the payload paths and IOCs of the lure campaign; distribution platforms also executed takedowns. The detection layer contributed to shaping the contours of the event, containment, and IOC sharing, and made the problem visible across the industry. This Brief does not deny the role of detection firms and platforms.

That said, detection does not change what the receiver (developers, CI/CD pipelines, endpoints acquiring artifacts) will accept. Attackers repeatedly evade takedowns via disposable accounts and brand switching, and after-the-fact detection and withdrawal cannot stop the moment of acceptance. Both for the leaked legitimate source and for malicious artifacts impersonating the brand, users had no means at the point of acquisition to independently verify "did this really come from a legitimate origin." For the purposes of establishing in regulatory filings or administrative proceedings whether "the distribution was legitimate," brand names and distribution-URL destinations carry no independent attribution residue.

Pre-execution attestation adopts a design in which an independently verifiable cryptographic proof of "generated and published by a legitimate origin (here, the official publisher)" is embedded into each artifact, and the receiver verifies the proof before executing or installing. If the proof says "no legitimate origin," the artifact is rejected before it executes. npm signatures and GitHub verified badges are conceptually in this direction, but as long as they depend on trust in the brand name or distribution channel, room for impersonation remains. Detection and pre-execution attestation are in a **complementary**, not substitutive, relationship.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and Industry Developments

- **Anthropic**: Confirmed the leak as human error, withdrew the affected npm version, issued DMCA / copyright takedowns to mirrors, stated that no customer data or credentials were exposed. This is the company's second source exposure in two months (following the earlier "Mythos"-related exposure)
- **Trend Micro**: Disclosed payloads, delivery paths, and IOCs of the lure campaign, and recommended that AI development tools be approved only via specified installation paths and that governance against agentic risk be applied as a control plane
- **GitHub (distribution platform)**: Executes takedowns of fake repositories and Releases. However, disposable accounts and brand switching enable repeated evasion to continue
- **Cross-industry argument**: That security incidents are not limited to software vulnerabilities; they can arise from human and organizational gaps (packaging-configuration errors, over-reliance on trust signals). Provenance verification at the distribution and acquisition of AI development tools surfaces as a common challenge

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (an acquired artifact's origin is accepted on the basis of brand name and distribution channel trust without independent verification), Lemma proposes a design that fixes, on each artifact, an independently verifiable cryptographic proof of "generated and published from a legitimate origin," so that the receiver verifies the proof before execution. Even when the brand name or distribution URL is forged, the proof tells the receiver through a separate channel whether "this artifact was generated under a legitimate publisher or not."

For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Trend Micro technical analysis**: "Weaponizing Trust Signals: Claude Code Lures and GitHub Release Payloads" (2026-04-03, authors Jacob Santos / Sophia Nilette Robles / Jeffrey Francis Bonaobra) — https://www.trendmicro.com/en_us/research/26/d/weaponizing-trust-claude-code-lures-and-github-release-payloads.html
- **Trend Micro follow-up**: "Claude Code Packaging Error Remains a Lure in an Active Campaign: What Defenders Should Do" (2026-04) — https://www.trendmicro.com/en_us/research/26/d/claude-code-remains-a-lure-what-defenders-should-do.html
- **PCMag**: "Anthropic Issues 8,000 Copyright Takedowns to Scrub Claude Code Leak" (2026-03) — https://www.pcmag.com/news/anthropic-issues-8000-copyright-takedowns-to-scrub-claude-code-leak
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
