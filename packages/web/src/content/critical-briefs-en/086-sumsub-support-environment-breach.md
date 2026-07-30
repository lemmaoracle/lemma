---
brief_no: 86
title: "Sumsub：本人確認を担う事業者の社内サポート環境に18か月気づかず侵入され、利用者の氏名・連絡先が露出した"
title_en: "Sumsub: An 18-Month Undetected Intrusion Into a Support Environment Exposed Customers' Names and Contact Details"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-02-04
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: "published"
version: "1.0"
og_lead_ja: "Sumsub：本人確認事業者のサポート環境に18か月気づかず侵入、氏名・連絡先が露出"
og_lead_en: "Sumsub: an 18-month undetected breach of a KYC vendor's support environment exposed names and contacts"
gap_detected: "An internal security review in January 2026 surfaced the breach retroactively, leading to notification of the affected customers."
gap_missing: "For roughly 18 months from intrusion to discovery, no one could continuously prove that an attacker was present in the support environment, and the identifying data retained for identity verification was exposed for a long period before any detection."
gap_fix: "Perform identity verification as an attribute proof with minimal disclosure, so that identifying data such as names and contact details is not concentrated and retained by an intermediary. Data that is not retained cannot leak."
---

## 1. TL;DR

Sumsub, a global identity-verification (KYC) vendor, disclosed unauthorized access to an internal support-related environment. In July 2024, an attacker sent a malicious attachment via a third-party support-ticket management platform and gained limited access to the internal support environment. What was exposed was primarily customers' names, with some records also containing email addresses or phone numbers. According to Sumsub, high-risk personal data such as biometric data, images of identity documents, banking/payment information, and government-issued ID information was neither accessed nor compromised, and there was no impact on the production identity-verification workflow, the customer-facing API, or the core infrastructure. The problem is that this intrusion went undetected for roughly 18 months (July 2024 to January 2026). On the periphery of a business whose job is to "prove attributes" — identity verification — customers' identifying data was retained in an internal environment and exposed for a long period before any detection. The reason harm can be minimized even when detection is delayed by 18 months is the existence of a design that minimizes retention and disclosure and proves attributes selectively.

---

## 2. What happened

- **Subject**: The internal support-related environment of Sumsub (Sum and Substance Ltd, a London-based identity-verification / KYC and AML vendor)
- **Scope of impact**: Unauthorized activity involving a limited number of customer accounts (the specific count is undisclosed, "limited number")
- **Disclosure date**: 2026-02-04 (Sumsub's official newsroom)
- **Point of entry**: In July 2024, an external attacker sent a malicious attachment via a third-party support-ticket management platform and gained limited unauthorized access to the internal support-related environment
- **Information exposed**: Primarily names. Some records contained an email address or a phone number (singly, or in combination)
- **Information not exposed (explicitly stated by Sumsub)**: Biometric data, images of identity documents, bank account / payment information, government-issued ID information, and other high-risk personal data were neither accessed nor compromised
- **Scope not affected**: The unauthorized activity was confined to the internal support-related environment and did not affect the production identity-verification workflow, the customer-facing API, or the core infrastructure. No trace of continued unauthorized activity since July 2024 has been detected
- **Detection delay**: The unauthorized activity was discovered retroactively during an internal security review conducted in January 2026. About 18 months elapsed from intrusion (July 2024) to discovery (January 2026)
- **Post-incident response**: Incident response began immediately upon discovery, independent forensic experts were engaged, and affected customers were notified directly. Access controls for technical support staff were reviewed, and monitoring and detection capabilities were strengthened

The incident came together as the following chain.

1. **Sending the malicious attachment**: An external attacker sends a ticket containing a malicious attachment to the third-party support-ticket management platform that Sumsub uses
2. **Limited access to the support environment**: Starting from the attachment, limited unauthorized access to the internal support-related environment is established. A peripheral environment separated from the production identity-verification systems, the customer-facing API, and the core infrastructure
3. **Exposure of identifying data**: The customers' identifying data retained in that environment (primarily names, some emails / phone numbers) is exposed. High-risk biometric data, ID images, financial data, and government IDs did not exist in a form accessible from that environment and were not compromised
4. **Prolonged invisibility**: The intrusion goes undetected for about 18 months (July 2024 to January 2026). No trace of continued activity is confirmed, but the initial access and data exposure went unnoticed for a long period
5. **Retroactive discovery and response**: Discovered during an internal security review in January 2026. Forensic engagement, individual notification of affected customers, review of support-staff access controls, and strengthened monitoring (an after-the-fact sequence that operates only after the intrusion has occurred)

---

## 3. Timeline — disclosure and response

- 2024-07: An external attacker sends a malicious attachment via a third-party support-ticket management platform. Gains limited unauthorized access to the internal support-related environment. Limited personal data, centered on names, is exposed
- After 2024-07: Sumsub has not detected any trace of continued unauthorized activity since that period
- 2026-01: An internal security review discovers the unauthorized activity retroactively (about 18 months after the intrusion)
- 2026-02-04: Sumsub discloses the security incident in its official newsroom. States that affected customers have been notified individually
- 2026-04: Prompted by observations from outside parties (Rekt and others), European media report further. Drew attention as exposure of French users' contact data (the detailed dates of notification are not stated in public information)

> Note: The facts draw on Sumsub's official security incident update (2026-02-04) as the primary source. The scope of exposed / non-exposed data, the intrusion path (a malicious support-ticket attachment), the absence of production impact, and the 18-month detection delay are based on the company's explicit statements. The number affected, the identification of affected customers, and the detailed dates of notification to users in each country are undisclosed / unstated in public information.

The response and industry movement after disclosure:

- **Sumsub**: Disclosed officially on 2026-02-04. Engaged forensics, directly notified affected customers, reviewed support-staff access controls, and strengthened monitoring and detection capabilities. Continues periodic audits for SOC 2 Type II, ISO/IEC 27001, and 27017/27018
- **Treatment of affected customers**: Sumsub states that "potentially affected customers were notified directly through their dedicated support managers. Customers who have not been contacted are not affected by this incident." Bitget, Bitpanda, Bybit, Huobi, and Wirex have been reported as Sumsub customers, but **which customers were affected is undisclosed**, and this does not indicate harm to any specific customer
- **Attention in Europe**: European media reported it as exposure of French users' contact data. The breach of an identity-verification vendor was discussed as a risk to the entire "KYC chain"
- **The regulatory clock**: In April 2026 the US FinCEN published an NPRM (Federal Register, with a comment period), presenting a proposed AML-related rule. As demands on vendors handling identity verification and AML intensify, the minimization, protection, and location management of the attribute data they hold became a shared point of discussion
- **Cross-industry point**: Even when the core systems of identity verification are hardened, if identifying data lingers in peripheral environments such as support, that becomes a surface for exposure. Minimizing retention of attribute data, verifiable management of its location, and access control of peripheral environments were re-recognized as points that determine the trust of KYC vendors

---

## 4. Why it wasn't stopped

The central failure primitive is that **on the peripheral environment of a vendor whose business is to "prove attributes (identity)," customers' identifying data was retained, and its compromise was exposed while remaining undetected for a long period**. Sumsub protected high-risk data (biometrics, ID images, government IDs) in production, and those were not compromised — the good side, where data separation by design worked. On the other hand, the internal support-related environment retained identifying data such as names and contact details, and that was compromised while invisible for about 18 months. The core of attribute proof was protected, but the identifying data that lingered on its periphery became the target of exposure.

This incident is in the same `kyc-aml-disclosure` lineage as [Brief No.077](/critical/briefs/077-idmerit-kyc-data-exposure/) (IDMerit, where about one billion records collected for identity verification were left publicly exposed without protection), [Brief No.013](/critical/briefs/013-coinbase-kyc-insider-breach/) (Coinbase, where raw KYC PII leaked via an insider), and [Brief No.052](/critical/briefs/052-discord-age-verification-id-leak/) (Discord, where 70,000 government IDs handed over to prove age leaked from a third party). All share the structure in which "attribute data collected and retained for identity verification is exposed outside its original verification purpose." What is distinctive about this incident is that (1) the exposure occurred not in the production verification systems but in a peripheral support environment, (2) high-risk data was separated and protected while identifying data lingered on the periphery, and (3) detection was delayed by about 18 months.

Trust in an identity-verification business depends not only on "being able to prove attributes" but also on "whether the attributes entrusted for proof can be placed under minimal retention and verifiable location management."

Sumsub's discovery through a retroactive security review, its engagement of independent forensics, its direct notification of affected customers, and its review of support-staff access controls and strengthening of monitoring and detection capabilities are indispensable for grasping the harm and preventing recurrence, and this Brief does not deny that role. In fact, these responses identified the scope of exposure (centered on names, with high-risk data uncompromised) and advanced notification of affected customers. Detection and the after-the-fact response did indeed function.

At the same time, in this incident detection itself failed to function for about 18 months. Until the trace of the intrusion was first found in a retroactive review, the identifying data retained in the support environment was exposed while invisible. Monitoring, the SOC, and intrusion detection are important, but as long as they depend on "when one can notice," exposure continues until one notices. What was missing is a design that limits the impact of exposure without depending on whether detection occurs — a layer that retains only the minimum necessary attributes, manages the location of the retained identifying data in a verifiable way, and proves attributes selectively. As material for proving, in regulatory reporting and audits, "where, how much, and to whom" the entrusted attributes were retained and accessible, the mere fact that the production systems were unharmed is not evidence of the location and minimization of the identifying data that lingered on the periphery.

Note that what Lemma proves is the fact of attribute verification and the provenance of location; it does not claim to prevent every breach. For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for design that verifies independently before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 5. What proof would have changed

Pre-execution attestation and selective disclosure of attributes narrow the attributes entrusted for identity verification down to "the minimum necessary for proof," and fix the location and access rights of the retained identifying data as tamper-proof provenance. Attributes are handled in a form that selectively discloses only "this attribute was verified," without broadly retaining or replicating the raw data. In this way, even if a peripheral environment such as support is compromised and detection is delayed, no meaningful linkage of identifying data lingers there. Strengthening detection (the detection-side "when one notices") and minimizing retention and proving attributes selectively (narrowing "what can be exposed in the first place") are not substitutes but **complements**, and only when the two overlap can the relationship of entrusting attributes for identity verification be placed in practice with confidence. Detection and proof are complementary, not substitutes.

Against the gap this incident exposed (detection delayed by 18 months, during which the identifying data lingering in the support environment was exposed), Lemma proposes the following design.

- **Selective proof of attributes**: Handle the attributes entrusted for identity verification not by broadly retaining or replicating raw data, but in a form that selectively discloses only "this attribute was verified," reducing the identifying data that can be exposed in the first place
- **Minimization of retention**: Lean toward a design that does not let identifying data unnecessary for verification linger in peripheral environments, structurally shrinking the surface of exposure in the event of a compromise
- **Fixing the provenance of location and access**: Fix the location and access rights of the entrusted attribute data as tamper-proof provenance, making "where, how much, and who could access" verifiable
- **Detection-independent harm containment**: Even when detection is delayed, ensure through minimized retention and selective disclosure that a compromise of a peripheral environment does not lead to a meaningful linkage of identifying data

Detection (after-the-fact forensics, notification, and strengthened access controls) works to remediate harm, while pre-execution proof and the minimization / selective disclosure of attributes (narrowing what can be exposed in the first place) work to establish trust in the relationship of entrusting attributes for identity verification — the two working complementarily.

---

## 6. Sources

- **Sumsub (official newsroom)**: “Security Incident Update” (2026-02-04) — <https://sumsub.com/newsroom/security-incident-update/>
- **Europe Infos**: “Identity-Check Vendor Sumsub Says Hack Went Undetected for 18 Months, Exposing French Users’ Contact Data” — <https://www.europe-infos.fr/english/8326/identity-check-vendor-sumsub-says-hack-went-undetected-for-18-months-exposing-french-users-contact-data/>
- **Fincrime Central**: “The Sumsub Incident and the Future of Cloud Compliance” — <https://fincrimecentral.com/sumsub-incident-cloud-aml-risk-management/>
- **CryptoTimes**: “Crypto KYC Gatekeeper Sumsub Hits Back After Rekt Raises Red Flags” (2026-04-15) — <https://www.cryptotimes.io/2026/04/15/crypto-kyc-gatekeeper-sumsub-hits-back-after-rekt-raises-red-flags/>

References: [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/), [Seal](https://lemma.frame00.com/seal/)
