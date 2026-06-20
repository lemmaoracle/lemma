---
brief_no: 15
title: "GitHub 内部リポジトリ侵害 — マーケット掲載 18 分の毒入り VS Code 拡張が開発者の信頼面を突いた"
title_en: "The GitHub Internal Repository Breach — A Poisoned VS Code Extension, Live for 18 Minutes, Exploited the Developer Trust Surface"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-18
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "010-claude-code-leak-lure"]
version: "1.0"
status: published
og_lead_ja: "マーケット掲載 18 分の毒入り VS Code 拡張で開発者を突破 — GitHub 内部侵害"
og_lead_en: "A poisoned VS Code extension lived 18 minutes on the marketplace — GitHub internal breach"
gap_detected: "GitHub detected the unauthorized access the next day, rotated critical credentials the same day, and identified and disclosed the scope (internal repositories only, no customer impact)."
gap_missing: "There was no way to tell a poisoned version listed as a legitimate extension on the legitimate marketplace apart before install, relying only on trust signals like signing and listing, and the stolen credentials were static and reusable from another environment as-is."
gap_fix: "Before pulling in a development tool, independently verify with Lemma that the extension is an untampered artifact produced from a legitimate build path, and prevent it up front."
---

## TL;DR

In May 2026, the attack group TeamPCP listed a trojanized Nx Console VS Code extension on the official marketplace for just 18 minutes, exfiltrated credentials from GitHub employee endpoints that installed it, and cloned about 3,800 internal repositories. It sat there as a legitimate extension and passed the trust signals of signing and listing, so there was no way to tell it apart before install — a trusted distribution path does not guarantee an untampered build output. After-the-fact detection and pre-execution attestation that independently verifies origin and authorization before acting are complementary, not substitutes.

---

## 1. Incident Overview

- **Affected**: GitHub (its own internal repositories)
- **Attacker**: TeamPCP (also tracked as UNC6780), a supply-chain attack group targeting open-source security utilities and AI middleware
- **Entry point**: a trojanized version (v18.95.0) of the legitimate Nx Console extension (`nrwl.angular-console`). The malicious version was live on the VS Code Marketplace for approximately 18 minutes between 12:30 and 12:48 UTC on 2026-05-18
- **Exfiltration targets**: 1Password vaults, Anthropic Claude Code settings, and npm / GitHub / AWS credentials / access tokens, all extracted from local IDE environments
- **Impact**: approximately 3,800 GitHub internal repositories cloned and exfiltrated. The data was posted for sale on criminal forums for over $50,000
- **Scope (per GitHub)**: customer repositories, Enterprise accounts, and user data unaffected. Exfiltration limited to GitHub internal repositories, with the ~3,800-count claim consistent with the investigation
- **Detection and response**: GitHub detected the intrusion on 2026-05-19, immediately initiated IR and rotated critical secrets. On 2026-05-26, released GHES 3.20.3 with a precautionary signing-key rotation
- **Adjacent activity**: TeamPCP also compromised Aqua Trivy, Checkmarx KICS, LiteLLM, Telnyx SDK, TanStack (Brief 014), and Mistral AI. Same actor as Brief 014, part of one developer-trust-surface campaign

---

## 2. Timeline

- 2026-05-18 12:30–12:48 UTC: trojanized Nx Console v18.95.0 listed on the VS Code Marketplace (~18 minutes). Employee endpoints are compromised during this window and credentials exfiltrated
- 2026-05-18 onward: exfiltrated credentials are used to clone approximately 3,800 GitHub internal repositories
- 2026-05-19: GitHub detects the unauthorized access, opens IR, and rotates critical secrets the same day
- 2026-05-20 around: GitHub publicly states it "detected and contained an employee-endpoint compromise via a malicious VS Code extension." TeamPCP posts the internal repository data for sale on the dark web / criminal forums (over $50,000)
- 2026-05-26: GHES 3.20.3 released, precautionary signing-key rotation

---

## 3. Attack Vector

1. **Poison the trust surface**: publish a trojanized version of the legitimate Nx Console extension to the VS Code Marketplace, exploiting the everyday trust developers place in the marketplace and the extension itself
2. **Short listing window**: keep the malicious version live for only ~18 minutes, creating a window that review / takedown is unlikely to catch
3. **Local-environment credential exfiltration**: from the IDE local environment, collect 1Password vaults, Claude Code settings, and npm / GitHub / AWS credentials / tokens. Extensions have broad access to local secrets inside the IDE by design
4. **Lateral movement**: use the exfiltrated GitHub credentials to access internal repositories
5. **Mass cloning**: clone and exfiltrate approximately 3,800 GitHub internal repositories
6. **Monetization**: post the exfiltrated data for sale on criminal forums for over $50,000

---

## 4. Structural Argument

The incident belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that the legitimate-marketplace listing and distribution path for a developer tool (an IDE extension) functioned as a trust premise without guaranteeing "this extension version is a safe, intended artifact." That extensions have broad access to local secrets inside the IDE turned the breach directly into credential exfiltration. `identity-auth` (lateral movement using exfiltrated GitHub credentials) is noted as a secondary category.

This sits alongside Brief 014 (the TanStack OIDC trusted-publisher compromise) as the same actor's (TeamPCP) developer-trust-surface campaign — the two should be read together. Brief 014 is a hijack of the package-publishing path (the OIDC identity); this incident is abuse of an IDE extension as a distribution path. Both share the structure that "the distribution and publishing paths developers trust are decoupled from any layer that independently verifies artifact integrity." It is also adjacent to Brief 004 (Megalodon, falsifying commit author origins) and Brief 010 (Claude Code impersonation, abusing a brand trust signal).

---

## 5. The detection–proof gap

GitHub detected on the following day and moved that same day to IR and secret rotation, identifying the scope (internal repositories only; no customer impact) and publishing it. The detection / containment layer is indispensable for scoping and bounding impact, and this Brief does not deny that role.

But detection does not change "which extension version the receiver accepts and installs" or "how broadly an installed extension can reach local secrets." The malicious version was listed in the legitimate marketplace as a legitimate extension and passed through trust signals — listing and signing. The 18-minute listing window let installations complete before review and takedown caught up. Worse, many of the exfiltrated credentials were reusable static tokens — once pulled from the endpoint, they could be replayed from a different environment. For regulatory reporting and audit, a marketplace listing or a signature alone is not an independent evidentiary trail that "this extension was a legitimate, untampered artifact."

Pre-execution attestation changes the structure in two directions: (1) attach an independently verifiable build-provenance proof — "produced from a legitimate origin and build path" — to the extension or tool artifact, and verify it on the receiving side **before installation**; (2) replace developer-environment authentication with key-less proofs that leave no reusable static tokens on the endpoint. The first rejects the trojanized version on proof inconsistency at install time rather than after the fact; the second makes "credentials" exfiltrated from an endpoint non-replayable from another environment. Detection (post-hoc extension takedown, IR) and pre-execution attestation (artifact provenance + key-less authentication) are **complementary** rather than substitutes.

---

## 6. Response and Industry Response

- **GitHub**: detection and IR on 2026-05-19, critical secrets rotated same day. Stated that exfiltration was limited to internal repositories with no customer impact. On 2026-05-26, GHES 3.20.3 released with a precautionary signing-key rotation
- **VS Code / extensions ecosystem**: marketplace listing review / takedown processes, and the access scope extensions have to local IDE secrets, surfaced as topics. Organizational extension-installation policies emerge as an urgent gap
- **Cross-industry framing**: part of TeamPCP's wider developer-trust-surface campaign (Aqua Trivy, Checkmarx KICS, LiteLLM, Telnyx SDK, TanStack, Mistral AI, and others). With attacks on developer infrastructure itself concentrated in 2026, "compromise-assumed" management of developer-environment secrets (minimizing static tokens) and artifact-provenance verification surface as shared agenda items

How distribution and publishing paths that developers trust (extensions, packages, brands) guarantee artifact integrity is the open question moving forward.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed here (the legitimate distribution path for developer tools does not guarantee artifact integrity, and reusable tokens on the endpoint are exfiltrated and replayed), Lemma proposes a two-direction design. First, fix "produced from a legitimate origin and build path" to extensions and tool artifacts as an independently verifiable build-provenance cryptographic proof, so the receiver verifies the proof **before execution** and can reject a trojanized version listed in the legitimate marketplace regardless of signature. Second, replace developer-environment authentication with key-less proofs that leave no reusable static tokens on the endpoint, so credentials exfiltrated from an endpoint cannot be replayed from another environment. Lemma does not substitute for marketplace review or detection; it provides a complementary layer of artifact-provenance proof and key-less authentication alongside the distribution-path trust signals.

---

## 8. Sources

- **Help Net Security**: "TeamPCP breached GitHub's internal codebase via poisoned VS Code extension" (2026-05-20) — https://www.helpnetsecurity.com/2026/05/20/github-breached-teampcp/
- **The Hacker News**: "GitHub Internal Repositories Breached via Malicious Nx Console VS Code Extension" (2026-05, extension name, listing window, exfiltration targets) — https://thehackernews.com/2026/05/github-internal-repositories-breached.html
- **Sophos**: "GitHub internal repositories breached" (2026-05, method and response) — https://www.sophos.com/en-us/blog/github-internal-repositories-breached
- **Infosecurity Magazine**: "GitHub Confirms Breach of Internal Repositories Via Malicious VS Code Extension" (2026-05, GitHub's public statement and scope) — https://www.infosecurity-magazine.com/news/github-confirms-breach-vs-code/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
