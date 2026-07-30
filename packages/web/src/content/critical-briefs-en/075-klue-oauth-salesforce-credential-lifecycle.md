---
brief_no: 75
title: "失効されていない古い認証情報が、連携アプリ経由で Salesforce の大量取得につながった（Klue） — 無効化されないテスト認証情報と長命の OAuth トークンが、行動の前に検証されない構造（Huntress / ReliaQuest）"
title_en: "A Dormant, Un-Revoked Credential Turned a Trusted Integration into Mass Salesforce Extraction (Klue) — un-revoked test credentials and long-lived OAuth tokens that go unverified at the moment of action (Huntress / ReliaQuest)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["064-salesloft-drift-oauth-salesforce", "059-vercel-contextai-oauth", "029-github-dev-oauth-token", "006-google-api-key-revocation-lag", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "古いテスト認証情報の失効漏れで Salesforce が大量取得 — Klue"
og_lead_en: "Klue's un-revoked test credential led to mass Salesforce extraction"
gap_detected: "After discovery, integration shutdown and anomaly detection worked: Salesforce disabled the Klue integration app and stopped further extraction."
gap_missing: "There was no layer to verify before the action whether this credential or token rested on legitimate authorization for the operation at hand, so an un-revoked old credential and a long-lived OAuth token simply functioned as the bearer of strong authority."
gap_fix: "Before a credential or token touches customer data, independently verify with Lemma that this operation stays within legitimate authorization and rests on a still-valid credential, and prevent it up front."
---

## 1. TL;DR

A long-unused, old test credential remained valid in the backend of Klue, a competitive-intelligence SaaS, and became the entry point of the intrusion. After breaking in, the attacker planted a code update and collected the OAuth tokens that Klue customers use to integrate Klue with their own systems (Salesforce and the like). Authenticating as the customers' integration service account, the attacker extracted a large volume of CRM records via Salesforce's REST API over roughly 24 hours (an intensive burst of about 1,000 queries in 15 minutes, with extraction observed continuing for over 6 hours). Salesforce disabled the Klue integration app. The post-discovery integration shutdown and anomaly detection worked, but there was no layer to verify — before the action — whether "this credential or token rests on legitimate authorization for the operation at hand." A credential that should have been revoked lived on, and a long-lived OAuth token simply became the bearer of strong authority.

---

## 2. What happened

- **Target**: Klue (a competitive- and market-intelligence SaaS that customers use integrated with Salesforce and the like) and the customers' Salesforce environments queried through that integration.
- **Damage**: Salesforce CRM data from multiple Klue customer companies was extracted in volume. Affected companies are reported to include security firms (Huntress, HackerOne, Jamf, Recorded Future, Tanium, and others).
- **Initial intrusion (2026-06-11)**: A long-unused, **old test credential was still valid**, and the attacker abused it to break into Klue's backend.
- **The core of the abuse**: After the intrusion, the attacker planted a code update capable of collecting customers' OAuth tokens. These tokens are what Klue customers use to connect Klue to their own systems. The attacker authenticated as the customers' integration service account, generated OAuth tokens, and used an automated script to pull a large volume of CRM records via the Salesforce REST API (roughly 24 hours; a burst of about 1,000 queries in 15 minutes, with continuous extraction observed for over 6 hours).
- **Response**: Salesforce disabled the Klue (Klue Battlecards) integration on its own platform.
- **Attribution (unconfirmed)**: Huntress pointed to the involvement of an emerging extortion group, "Icarus," because a session identifier in the extortion email matched a dark-web leak identifier. Icarus publicly listed Klue on June 19. The modus operandi closely resembles the 2025–2026 third-party OAuth abuse campaigns (the series tied to ShinyHunters / UNC6395), but the responsible party is not confirmed as of this Brief.
- **Context**: The technique of stealing the OAuth tokens of a trusted third-party integration app and mass-querying Salesforce across tenants has recurred through 2025–2026.

The incident came together as the following chain.

1. **Abuse of an un-revoked credential**: A long-unused, old test credential remained valid, and the attacker used it to break into the Klue backend. The credential lifecycle (revocation, expiry) was not operated.
2. **Planting collection code**: The attacker plants a code update capable of collecting customers' OAuth tokens. The interior of a trusted integration app is repurposed as a path for token collection.
3. **Authenticating as the customer service account**: With the collected information, the attacker authenticates as the customers' Klue integration service account and generates OAuth tokens.
4. **Mass querying with a long-lived token**: Using the generated and collected OAuth tokens as the bearer, the attacker extracts a large volume of CRM records via the Salesforce REST API with an automated script (roughly 24 hours, a burst of about 1,000 queries in 15 minutes, continuous over 6 hours).
5. **Cross-tenant damage**: Salesforce data from multiple Klue customer companies is pulled across tenants.
6. **Detection and containment**: Anomalous querying is detected, and Salesforce disables the Klue integration app (an after-the-fact chain that acts once the token has been exercised).

---

## 3. Timeline — disclosure and response

- 2026-06-11: The Klue backend is breached by abusing an un-revoked old test credential. A code update for collecting OAuth tokens is planted.
- 2026-06-11 onward: The attacker authenticates as the customers' integration service account, generates OAuth tokens, and mass-extracts CRM via the Salesforce REST API over roughly 24 hours.
- 2026-06-19: The extortion group Icarus publicly lists Klue on a leak site and claims to have exfiltrated Salesforce data from multiple Klue partner companies.
- 2026-06 (around): Salesforce disables the Klue integration app. Several security companies are reported as affected.
- 2026-06-22: Major media report widely on the incident (including the scope of damage, the technique, and the uncertainty of attribution).

> Note: The facts in this Brief are based on Salesforce's response, analysis by Huntress / ReliaQuest and others, and reporting by established media. Attribution (Icarus) is at the investigation stage and is not asserted. Note that the dates of initial intrusion (6-11), public listing (6-19), and the reporting wave (6-22) coexist, and sources are made explicit.

The response and industry movement after disclosure:

- **Salesforce**: Disabled the Klue (Klue Battlecards) integration on its own platform, curbing the spread of impact.
- **Huntress / ReliaQuest and others**: Conducted analysis of the attack and scoping of the damage. Huntress pointed to the involvement of the extortion group Icarus while showing that the technique closely resembles past third-party OAuth abuse campaigns (attribution at the investigation stage).
- **Affected companies**: Salesforce data of Klue customers, including several security companies, was reported to be affected.
- **A cross-industry issue**: Salesforce cross-tenant querying via theft of a trusted third-party integration app's OAuth tokens has recurred through 2025–2026. Minimizing long-lived tokens, lifecycle management of tokens and credentials (reliable revocation of dormant and expired ones), and authorization verification at the moment of exercise have been re-recognized as essential requirements for operating SaaS integrations.
- **Credential hygiene**: Reliable revocation of disused test credentials and periodic inventorying have been shared as the operational practice for cutting off initial intrusion.


How to independently verify the credentials and tokens of SaaS integrations as legitimate authorization at the moment of exercise, separately from formal validity, is expected to advance — prompted by this incident — as an essential requirement of integration design.

---

## 4. Why it wasn't stopped

The central failure primitive is that **a credential or OAuth token, merely by being "held," was allowed to exercise strong authority, with no layer to verify before the action whether "it rests on legitimate authorization for the operation at hand."** Concretely, two gaps overlapped. First, an old test credential that should have been revoked remained valid without revocation and became the entry point of the intrusion (absence of credential-lifecycle verification). Second, the collected OAuth token functioned as a long-lived bearer, allowing mass querying of Salesforce without asking each time whether the holding party was legitimate (the conflation of token with authority).

The primitive is the same shape as [Brief 064](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (Salesloft Drift — a trusted integration's OAuth tokens stolen and hundreds of Salesforce environments cross-queried), and this incident is a recurrence of it. What separates 064 from this incident is the angle of differentiation — here the **absence of lifecycle verification, namely that "a credential that should have been revoked lived on,"** clearly appears as another core. On this point it connects directly to [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/) (the revocation lag where a Google API key stayed valid for 23 minutes after deletion). It further shares its root with [Brief 059](/critical/briefs/059-vercel-contextai-oauth/) (an "allow everything" OAuth handed to an AI tool became an intrusion path through a vendor breach) and [Brief 029](/critical/briefs/029-github-dev-oauth-token/) (a one-click theft of an OAuth token at github.dev), in the structure where **a long-lived, broad OAuth token becomes the bearer of strong authority without authorization verification at the moment of exercise**. It is adjacent to [Brief 013](/critical/briefs/013-coinbase-kyc-insider-breach/) (the insider-routed leak of Coinbase KYC data) in that held authority and data are not independently verified at the moment of exercise or exfiltration.

A trusted integration app supports business productivity, but once its interior is compromised it becomes a single aggregation point that is repurposed along with the customers' authority. Unless holding a token is separated from that token resting on legitimate authorization for the operation at hand, SaaS integrations cannot be placed with confidence at the front line of sensitive data.

Detection of anomalous query patterns, Salesforce's disabling of the Klue integration app, and the analysis and scoping of the damage by Huntress / ReliaQuest and others are indispensable for grasping and containing the damage, and this Brief does not negate that role. Disabling the integration stopped further extraction.

At the same time, detection does not change what the receiving side (the Salesforce API, the side that accepts the integration) itself accepts — "which token, as whose authorization, it accepts." In this incident the collected OAuth token was formally valid and was authenticated as the customer's service account, so verification on the API side passed. What was missing was a layer to independently verify, before the action, whether "this credential or token rests on legitimate authorization for the operation at hand — is it not an old credential that should have been revoked, is the token holder legitimate," and this is a verification on a separate track from the formal validity of a bearer token. Even if anomaly detection fires during or after the mass querying, each operation for which the token was accepted is not stopped. As material to prove, in regulatory reporting or audit, "whether this CRM extraction rested on authorization by a legitimately authorized party, within a valid expiry," the mere fact that the token was formally valid is not an independent evidentiary trail of the legitimacy of authorization.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design that, before executing each operation, confirms in an independently verifiable form — without relying on a long-lived bearer token — that "this party holds the authorization to perform this operation now, under a valid scope and expiry." A revoked or dormant credential becomes unusable at the moment of verification, and if authorization cannot be confirmed the operation is blocked up front. Anomaly detection (detection — after-the-fact shutdown and analysis) and pre-execution attestation of authorization at the moment of exercise (proof) are not substitutes but **complements**, and only when the two overlap can SaaS integrations be put forward with confidence at the front line of sensitive data.

Against the detection–proof gap this incident exposed (credentials and OAuth tokens are not independently verified as legitimate authorization at the moment of exercise), Lemma proposes a design that handles authorization in an independently verifiable form before executing each operation.

- **Per-action pre-execution attestation of authorization**: Without relying on a long-lived bearer token, verify before the operation that "this party holds the authorization to perform this operation now, under a valid scope and expiry," and block it if it cannot be confirmed.
- **Authorization without sending a key or token**: Remove the premise of having the token itself shared or held, leaning toward a Proof-as-Auth design that proves only authorization without ever sending a key, so that a stolen bearer does not become a pass for broad authority.
- **Credential-lifecycle verification**: Tie the validity of credentials and tokens not to whether they are held but to a verifiable expiry and state, making revoked or dormant credentials unusable at the moment of verification.
- **Least privilege and selective disclosure**: Authorize only the scope an operation needs, and disclose at minimum only that "this operation is authorized" without fully exposing internal state.

Against the design philosophy of the Agent Authority Proof category — that "holding ≠ legitimate authorization" — this incident is a case in which the failure mode it anticipates materialized as a real, large-scale data extraction. Detection (after-the-fact integration shutdown and analysis) works on correcting the damage; pre-execution attestation (independent verification of authorization at the moment of exercise) works on establishing trust in SaaS integrations — each complementary to the other.

---

## 6. Sources

- **The Hacker News**: “Salesforce Disables Klue App Integration After OAuth Token Abuse Exposes Customer Data” (2026-06) — <https://thehackernews.com/2026/06/salesforce-disables-klue-app.html>
- **TechCrunch**: “Klue hack results in data breach at several cybersecurity firms” (2026-06-22) — <https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/>
- **ReliaQuest**: “Threat Spotlight: Integration Abused in CRM Data Theft” (2026-06) — <https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/>
- **CSO Online**: “Klue breach exposed Salesforce CRM data through stolen OAuth tokens” (2026-06) — <https://www.csoonline.com/article/4187907/klue-breach-exposed-salesforce-crm-data-through-stolen-oauth-tokens.html>
- **Salesforce Ben**: “Another OAuth Hack: Salesforce Disables Third-Party App as CRM Data Exposed Again” (2026-06) — <https://www.salesforceben.com/another-oauth-hack-salesforce-disables-third-party-app-as-crm-data-exposed-again/>
- **Reference implementation (GitHub)**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/), [Trust402](https://lemma.frame00.com/trust402/)
