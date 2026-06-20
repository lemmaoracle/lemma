---
brief_no: 56
title: "採用 AI の「誰が正当か」を検証しないまま、6,400 万件に手が届いた — アクセス主体の権限属性が独立検証されない構造（McHire / Paradox.ai）"
title_en: "No Check on Who Was Authorized — 64 Million Records Within Reach in McDonald's McHire (Paradox.ai)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2025-06-30
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["057-deepseek-clickhouse-exposed-db", "013-coinbase-kyc-insider-breach", "034-ekyc-camera-feed-provenance", "022-onlyfake-ai-id-kyc-bypass"]
status: published
version: "1.0"
og_lead_ja: "採用 AI が権限を検証せず 6,400 万件に到達 — McHire / Paradox.ai"
og_lead_en: "Hiring AI: 64M records within reach, no authorization check — McHire"
gap_detected: "External researcher investigation and responsible disclosure surfaced the vulnerability, letting Paradox.ai fix it the same day and launch a bug bounty."
gap_missing: "There was no layer to check before access whether the accessing party held legitimate authority over a record, so guessable credentials and a sequential reference ID alone were enough to reach the records."
gap_fix: "Before a high-risk action, independently verify with Lemma that this requesting party legitimately holds authority over data in this scope, and prevent it up front."
---

## TL;DR

In June 2025, researchers Ian Carroll and Sam Curry found that the admin console of McDonald's AI recruitment platform McHire (Paradox.ai) could be entered with an abandoned test account whose username and password were both "123456," and that via an IDOR, incrementing applicant IDs reached up to 64 million records. The same-day fix and bug bounty — after-the-fact remediation — cannot reach a structure in which the accessing party's authority is not independently verified before access, so reachability became retrieval. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: McHire (McDonald's job-application platform) / Paradox.ai's AI recruiting chatbot "Olivia"
- **Discoverers**: Ian Carroll, Sam Curry (security researchers)
- **Entry point**: The admin login had a valid account with username and password both "123456" — a test account left abandoned since 2019
- **Lateral movement**: After entering the admin side, an IDOR vulnerability allowed sequential enumeration and retrieval of applicant IDs
- **Exposure scale**: Up to **64 million** application records — names, emails, phone numbers, interview (chat) transcripts, IP addresses, etc.
- **Response**: Paradox.ai disabled and fixed the account the day it was reported (2025-06-30) and opened a bug bounty. It stated only the researchers accessed any data, and only a small number of records
- **The crux**: Access to sensitive personal data passed with only a guessable credential and a reference ID; **the authority attribute of the accessing party was not independently verified**

> Note: This Brief does not assert the presence or absence of actual harm; its object of analysis is the structure of absent authority-attribute verification in AI-system data access.

---

## 2. Timeline

- 2025-06-30: Researchers Carroll and Curry access the McHire admin console with "123456," confirm record enumeration via IDOR, and report to Paradox.ai / McDonald's
- 2025-06-30: Paradox.ai disables and fixes the account the same day and opens a bug bounty
- Thereafter: Logged in the AI Incident Database as Incident #1179

---

## 3. How access propagates into "unverified retrieval"

This incident stems from a structure in which, for access to the data plane of an AI system, the party's authority attribute is not independently verified.

1. **Initial reach via credentials**: A valid session could be established to the admin interface with a guessable default credential (123456). Whether "this party holds admin authority" is effectively not verified
2. **Lateral movement via reference ID (IDOR)**: A direct object reference without an authorization check let one reach others' records simply by incrementing the applicant ID. Per-record authority verification is missing
3. **Reaching sensitive data = retrieving it**: Personal data — names, contacts, interview transcripts, IPs — could be enumerated and retrieved without further verification. Reachability becomes full retrieval
4. **Lack of visibility**: Because the access uses a legitimate path, illicit enumeration is recorded as ordinary access and is hard to detect as an anomaly

---

## 4. Structural analysis

This incident belongs to the `identity-auth` category under Pillar 03 (Agent Authority Proof). The central failure primitive is that **in access to an AI system's sensitive data, the party's authority attribute (who, and up to which records, is legitimate) is not independently verified, so reachability connects directly to retrieval.** As secondary we note `attribute-proof-bypass` (bypass of authority-attribute verification) and `data-provenance` (handling of application records as personal data).

It shares the primitive of missing authority/attribute verification with Brief 013 (the Coinbase KYC insider breach — raw PII whose storage is mandated by regulation became the breach surface). The new cross-section here is that in the domain of **an AI recruiting bot**, a non-human (system) identity's weak credential became the entry point to the personal data of tens of millions. Behind the appearance of "screening with the latest AI," the data-plane authorization relied on a classic access-control flaw. Where Brief 057 (DeepSeek) was "the absence of authentication itself," this case is "a guessable credential plus missing per-record authorization" — another manifestation of the same primitive.

---

## 5. The gap between detection and proof

Here the detection chain — external research by the researchers, responsible disclosure, Paradox.ai's same-day fix, and the bug bounty — functioned, and the vulnerability was made visible and remediated before exploitation spread. This is a detection/disclosure success, and this Brief does not deny its role.

But the problem is that no matter how well detection functions, it does not provide the material to independently prove, at the moment of access, "does the party making this access request hold legitimate authority over this record." Strengthening one guessable credential leaves the separate flaw of per-record authorization (IDOR) intact. "Logged in legitimately" or "referenced by ID" is not proof of "having legitimate authority." Because it is enumeration over a legitimate path, after-the-fact log analysis tends to become a trailing sequence that operates only after retrieval has occurred.

At present, in AI-service data access, authority-attribute verification is left to per-implementation access control and is not treated as an independent layer. Pre-execution attestation places, ahead of the sensitive-data access path, an attribute proof that "the requesting party legitimately holds the authority for this scope," and with selective disclosure makes authorization independently verifiable without exposing the personal data itself. Detection (external research, fixes) contributes to shrinking harm, while pre-execution attestation (authority verification at access time) contributes to independently verifying authorization — each **complementary**.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **Vendor response**: Paradox.ai disabled and fixed the account the day it was reported and opened a bug bounty, stating only the researchers accessed any data
- **Industry point**: With the rapid adoption of AI chatbots in recruiting / HR, the protection of **applicants' large-scale, sensitive personal data** and the credential management of system (non-human) identities have become focal points
- **Regulatory context**: From both the protection of applicants' personal data (national privacy laws) and accountability for AI-driven hiring processes, demand grows to make data-access authorization verifiable

A picture in which access to the personal data of tens of millions relied on a guessable credential and missing per-record authorization is not one vendor's misconfiguration; it remains an access-authorization design issue for every organization embedding AI into its operations.

---

## 7. Lemma's analysis

Against the gap McHire exposed — for access to an AI system's sensitive data, the party's authority attribute goes unverified and reachability connects directly to retrieval — Lemma proposes a design that fixes the basis for access as an independently verifiable cryptographic proof at that moment.

- **Pre-execution attestation of authority attributes**: Before accessing sensitive data, prove as an independently verifiable attribute that "the requesting party legitimately holds the authority for this scope (this set of records)." Guessable credentials or swapped reference IDs do not pass
- **Per-record authorization binding**: Bind reference IDs (object references) to the authority scope so that sequential ID enumeration does not pass without authorization
- **Selective disclosure**: Prove only that "the access was within the scope of authority," with minimal disclosure, without sending the applicants' personal data outside
- **Proof for non-human identity**: Treat system-account authority, too, as a verifiable attribute rather than a fixed credential

Proof fixed at the moment of action functions as evidence that can be independently verified later — without disclosing the personal data — when asked "was this access based on legitimate authority." Detection and disclosure (researcher investigation, fixes) contribute to shrinking harm, while pre-execution attestation (authority verification at access time) contributes to independently verifying authorization — each complementary.

For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Ian Carroll**: "Hacking McDonald's McHire / Paradox.ai" (the researchers' original account of the discovery and technique; 2025-06-30) — <https://ian.sh/mcdonalds>
- **AI Incident Database**: Incident #1179 (McHire / Paradox.ai) — <https://incidentdatabase.ai/cite/1179/>
- **CSO Online**: "McDonald's AI hiring tool's password '123456' exposed data of 64M applicants" (scale and timeline) — <https://www.csoonline.com/article/4020919/mcdonalds-ai-hiring-tools-password-123456-exposes-data-of-64m-applicants.html>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
