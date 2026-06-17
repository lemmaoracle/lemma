---
brief_no: 63
title: "信頼された連携アプリの OAuth トークンが盗まれ、数百の Salesforce 環境が横断照会された（Salesloft Drift） — 広範・永続の OAuth が、行動ごとにスコープ・失効検証されない構造（UNC6395）"
title_en: "One Stolen Integration's OAuth Tokens, Hundreds of Salesforce Tenants — The Salesloft Drift Breach (UNC6395)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2025-08-08
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["059-vercel-contextai-oauth", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "連携の OAuth 窃取で 700 超の Salesforce が横断照会 — Salesloft Drift"
og_lead_en: "Stolen integration OAuth tokens hit 700+ Salesforce tenants — Salesloft Drift"
---

## TL;DR

Connect a SaaS app to Salesforce and that integration holds OAuth tokens that read and write your Salesforce data on your behalf — convenient, but steal the token and the attacker is simply inside your Salesforce. And because the integration is installed at hundreds of companies, stealing the tokens in bulk means the damage does not stop at one tenant. In August 2025, the threat actor UNC6395 abused OAuth tokens held by the chatbot integration Salesloft Drift to query **hundreds (700+) of Salesforce environments**. The root cause traces to UNC6395 compromising Salesloft's GitHub account from March–June 2025, from which it reached Drift's AWS environment and obtained the customer-integration OAuth tokens. The attackers hunted Account, User, and Opportunity records and — especially — **secrets buried in Case (support ticket) data**: AWS access keys, Snowflake tokens, VPN credentials, passwords. Salesloft revoked the Drift tokens on August 20 and removed the integration from the Salesforce marketplace. We analyze this through Pillar 03 (Agent Authority Proof) as a structure in which **broad, persistent OAuth persists as "standing authority," never scoped or revocation-checked per action.** It is the ecosystem-scale version of Brief 059 (an "allow everything" OAuth to an AI tool became an intrusion path via a vendor breach), and connects to 029, 033, and 006.

---

## 1. Incident overview

- **Target**: Salesloft's Drift (a chatbot integration) and the customer organizations that connected Drift to Salesforce. The attacker abused the OAuth tokens Drift held to query each company's Salesforce.
- **Threat actor**: UNC6395 (the tracking name from Google Threat Intelligence Group [GTIG] / Mandiant). Distinct from ShinyHunters (UNC6040), tied to a separate Salesforce-related attack in June 2025.
- **Scale**: GTIG noted that 700+ organizations may have been affected. An extortion group claiming to be ShinyHunters asserted it stole 1.5 billion records from 760 companies via the compromised Drift OAuth tokens (an extortion claim, not independently confirmed).
- **Targeted data**: Beyond Account, User, and Opportunity, especially **secrets embedded in Case (support ticket) bodies** (AWS access keys, Snowflake tokens, VPN credentials, passwords). Customer contacts, ticket bodies, and account records were also exfiltrated.
- **Root cause**: UNC6395 gained unauthorized access to Salesloft's GitHub account from March–June 2025, pulling the contents of multiple repositories and adding a guest user and workflows. It further accessed Drift's AWS environment and obtained the OAuth tokens for Drift customers' integrations. This sequence is assessed as the origin of the later cross-tenant querying.
- **The core**: A Drift OAuth token means **broad, persistent authority** to connect to Salesforce on the user's behalf. Steal it and the attacker enters each company's Salesforce as a legitimate integration — and because the same integration is installed at hundreds of companies, the damage spread at ecosystem scale.

---

## 2. Timeline

- 2025-03–06: UNC6395 gains unauthorized access to Salesloft's GitHub account (pulling repositories, adding a guest user, setting up workflows). It further reaches Drift's AWS environment and obtains the customer-integration OAuth tokens.
- 2025-08-08–18: UNC6395 abuses the stolen Drift OAuth tokens to query hundreds of Salesforce environments, searching Cases and more for secrets.
- 2025-08-20: Salesloft revokes the active Drift tokens in coordination with Salesforce, removes the Drift integration from the Salesforce marketplace, and takes Drift temporarily offline.
- After: GTIG / Mandiant disclose it as UNC6395. Identification of affected organizations and rotation of potentially exposed credentials proceed.

> Note: The number of affected organizations is based on GTIG's "700+ potentially affected." The "760 companies, 1.5 billion records" is an extortion claim from the party calling itself ShinyHunters, not independently verified. This text avoids asserting scale and names its sources.

---

## 3. The path: a stolen integration token into each company's Salesforce

This incident shows a structure in which a trusted integration's broad, persistent OAuth chains, from a vendor-side compromise, into the entire deployed ecosystem. The path is as follows.

1. **A foothold on the vendor side (GitHub compromise)**: From March–June 2025, UNC6395 compromises Salesloft's GitHub account and builds a foothold via repository pulls and workflow setup. It then reaches Drift's AWS environment and obtains the integration OAuth tokens.
2. **Seizing the integration tokens**: The attacker seizes the OAuth tokens Drift holds. These tokens mean standing, broad authority to connect to Salesforce on the user's behalf.
3. **Cross-tenant querying of each company's Salesforce**: In August, the stolen tokens query hundreds of companies' Salesforce as a legitimate integration. As long as the token is valid, each company's defenses cannot distinguish it from normal integration access.
4. **Hunting secrets inside the CRM**: Beyond Account, User, and Opportunity, it searches for and collects the AWS keys, Snowflake tokens, VPN credentials, and passwords buried in Case bodies. The CRM had become a secondary store of secrets.
5. **Revocation and after-the-fact response**: Salesloft revokes the Drift tokens and removes the integration on August 20. This is an after-the-fact chain that acts once the tokens have been abused, followed by rotation of credentials that may have leaked.

---

## 4. Structural analysis

This incident belongs to the `agent-infrastructure` category of Pillar 03 (Agent Authority Proof). The central failure primitive is that **the OAuth granted to an integration persists as broad, persistent "standing authority" rather than as a "dynamic authority" scoped, authorized, and revocation-checked per action.** A Drift token holds broad authority to read and write Salesforce on the user's behalf, and once stolen becomes the entry point to each company. We note `identity-auth` (authorization of delegated authority) and `attribute-proof-bypass` (absence of independent verification of the token's validity / revocation attribute) as secondary categories.

This is the same primitive as Brief 059 (an "allow everything" OAuth granted to an AI tool became an intrusion path through a vendor breach). Where 059 was an OAuth to an AI productivity tool pivoting into a single company, this incident foregrounds — through the abuse of a trusted SaaS integration's OAuth at the ecosystem scale of hundreds of companies — that the damage from a standing token does not stay within one tenant. It connects to Brief 029 (theft of an over-scoped OAuth token at github.dev) in that the token is not scoped to the action, and to Brief 006 (credential revocation not independently verified, valid even after deletion) through the absence of independent verification of the revocation attribute. It connects to Brief 033 (lateral movement via positional trust and stored credentials) in that a trusted integration surface and stored secrets become a foothold for lateral movement.

The other layer this incident adds is that **the CRM had become a secondary store of secrets.** The AWS keys and VPN credentials pasted into support Cases accumulated with their origin, expiry, and scope unmanaged, so the compromise of an integration token converted into a chained leak of secrets. When broad integration authority and an accumulation of provenance-unmanaged secrets overlap, the theft of a single token expands into ecosystem-wide credential exposure.

---

## 5. The gap between detection and proof

GTIG / Mandiant's investigation, Salesloft's token revocation and integration removal, and each company's credential rotation are indispensable for grasping and deterring the damage, and this Brief does not negate that role. Token revocation and a coordinated response are an important check on the damage spreading further.

At the same time, detection provides no material to independently establish — **before the access executes** — whether the querying now being done with this token is within the bounds of its original authorization. Querying with a stolen Drift token is, in form, legitimate integration access, and as long as the token is valid each company's defenses cannot distinguish it from normal integration. After-the-fact log analysis reconstructs "which objects were queried," but is no material to independently verify before the action "whether that query was within the granted authorization and actually valid." Revocation acts after the compromise, and the provenance of the secrets accumulated in the CRM cannot be fixed retroactively.

Pre-execution attestation treats an integration's authority not as "broad, persistent consent" but as an authorization scoped per action and independently verifiable. Verify each operation the integration performs against Salesforce — against the bounds of the grantor's authorization and the token's validity — at the moment of the act, and bind the secrets stored in the CRM to their origin and expiry as provenance, and out-of-bounds querying with a stolen token, or use of a revoked credential, can be screened out before the action. Detecting the compromise (the detection-style "what was queried") and proving authority and validity ("was that query within the authorization and actually valid") are not substitutes but **complements** (for verifying provenance and authorization independently at the moment of the act, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the detection-and-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **Salesloft / Salesforce**: Salesloft revoked the active Drift tokens on August 20, removed the Drift integration from the Salesforce marketplace, and took Drift temporarily offline. GTIG / Mandiant investigated and disclosed it as UNC6395.
- **Inventorying OAuth integrations**: There is a recommended move to inventory the OAuth scopes granted to trusted SaaS integrations and shift broad, persistent grants to per-action-scoped, revocable authorizations — treating integration tokens not as "standing authority" but as objects of monitoring and revocation.
- **Secrets inside the CRM**: A practice of not pasting secrets into support Cases (and detecting it), plus provenance and expiry management of stored credentials, becomes a focus — cutting off the structure in which the CRM becomes a secondary store of secrets.
- **A cross-industry issue**: This incident is a large-scale instance of a repeatable pattern — vendor breach → integration OAuth token theft → lateral movement into the deployed ecosystem (the same shape as Brief 059) — and raises the need to verify trusted third-party integrations per action, in the same risk class as a traditional cloud provider.

The absence of a design that treats broad, persistent integration OAuth not as "standing authority" but as "an authorization scoped per action, with revocation reflected immediately," is not a problem of a specific vendor; it remains a cross-organizational challenge for any organization that makes heavy use of SaaS integrations.

---

## 7. Lemma's analysis

Against the gap this incident exposed (broad, persistent integration OAuth persists as standing authority, never scoped, authorized, or revocation-checked per action), Lemma proposes a design that backs an integration's or agent's action not with "the presentation of a token" but with "a proof of authorization scoped per action and independently verifiable."

- **Per-action scoped authorization (proof-as-auth)**: Independently verify each operation the integration performs against Salesforce, at the moment of the act, against the bounds of the grantor's authorization and current validity. Replace the reuse of broad consent with a per-operation proof.
- **Immediate reflection of revocation**: Make the validity attribute of tokens and credentials independently verifiable, so revocation is reflected immediately in the action decision (screening out querying with a stolen token before the action; connects to the revocation lag of Brief 006).
- **Provenance binding of secrets**: Bind credentials stored in a CRM and the like to their origin and expiry as provenance, suppressing the accumulation and reuse of provenance-less secrets.
- **Selective disclosure**: Without exposing internal data, disclose only the minimum — that "this operation is within the grantor's authorization and is actually valid" — reconciling independent verification with the protection of sensitive information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this integration's operation rests on an authorization within bounds and on an actually valid token," without depending on after-the-fact log reconciliation. Detection (after-the-fact investigation, revocation, rotation) works on correcting the damage; attestation (independent verification of authority and validity at the moment of the act) works on establishing trust in integration access — each complementary to the other. For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Google Cloud / GTIG (primary, investigation)**: "Data Theft from Salesforce Instances via Salesloft Drift" (UNC6395, OAuth token theft and impact scope) — <https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift>
- **The Hacker News**: "GitHub Account Compromise Led to Salesloft Drift Breach" (2025-09, root cause = GitHub compromise) — <https://thehackernews.com/2025/09/github-account-compromise-led-to.html>
- **The Hacker News**: "Salesloft Takes Drift Offline After OAuth Token Theft Hits Hundreds of Organizations" (2025-09) — <https://thehackernews.com/2025/09/salesloft-takes-drift-offline-after.html>
- **AppOmni**: "Salesloft Drift–Salesforce Breach (UNC6395): Why Salesforce OAuth Integrations are a Growing Risk" — <https://appomni.com/blog/drift-breach-salesforce-unc6395-saas-prevention/>

---

## 9. About Brief distribution

The Lemma Critical Brief is a threat-intelligence brief published by Lemma. This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization. If you use it as a reference for decision-making, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
