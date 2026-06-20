---
brief_no: 32
title: "正規の予約プラットフォーム内で、売上金の受領口座が書き換えられた — 送金先変更が、資金移動の前に独立検証されなかった(Polaris Holdings / Booking.com)"
title_en: "Inside a Legitimate Booking Platform, the Payout Bank Account Was Silently Rewritten — The Change Was Not Independently Verified Before Funds Moved (Polaris Holdings / Booking.com)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-05-23
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["006-google-api-key-revocation-lag", "013-coinbase-kyc-insider-breach", "002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "売上金の受領口座が正規画面内で改ざん — Polaris / Booking.com"
og_lead_en: "Payout account silently rewritten in-platform — Polaris / Booking.com"
gap_detected: "Account anomalies could be detected, and using that as a starting point, transfers to other hotels were blocked and the damage contained."
gap_missing: "There was no layer to confirm before moving funds whether the payout-account change was based on legitimate authorization and a genuine account, so it passed straight through as an operation within an authenticated session."
gap_fix: "Before moving funds, independently verify with Lemma that the payout-account change was legitimately authorized and the destination account is genuine, and prevent it up front."
---

## TL;DR

At hotel operator Polaris Holdings, a compromised group Booking.com account let attackers rewrite multiple hotels' payout bank accounts from inside the legitimate console. Anomaly detection blocked later transfers, but fires only once an anomaly appears — the first fraudulent transfer was already complete. What was missing was a layer to confirm, before funds moved, whether the change was authorized and the destination genuine; the tampering passed straight through as an authenticated-session action. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Targets**: multiple hotels under the group Booking.com account of Polaris Holdings (a hotel operator)
- **Detection**: 2026-05-23, an anomaly in the group account was detected and an investigation opened
- **Damage**: payout bank accounts of multiple hotels were fraudulently rewritten to a third-party account. At one hotel, part of the receivables was transferred to the fraudulent account, a confirmed loss of about ¥9 million so far. The other hotels' transfers were blocked by early response.
- **Core**: not the common Booking.com phishing that targets guests' card data, but a B2B payment-path tampering that **rewrote the operator's payout destination from inside the legitimate extranet**
- **Intrusion path**: as of Polaris's disclosure, the access path and logs are still under investigation with Booking.com and the authorities. **The specific method of initial access is undetermined** (this Brief does not assert it).
- **Response**: reset passwords across all hotels; tracked the access path in cooperation with Booking.com and the authorities. No customer credit-card leak confirmed. Phishing messages aimed at guests were also reported, and whether personal data was exposed is under investigation.
- **Industry context**: campaigns targeting Booking.com partners are continuously observed (tracked by vendor research). Most are card phishing aimed at guests, but this case is a funds-direct variant via payout-account tampering.

---

## 2. Timeline

- 2026-05-23: Polaris Holdings detects an anomaly in its group Booking.com account and opens an investigation
- Found during investigation: payout bank accounts of multiple hotels rewritten to a third-party account. At one hotel, part of the receivables was fraudulently transferred, a loss of about ¥9 million. The other hotels were blocked before transfer.
- After detection: passwords reset across all hotels; access path and logs tracked in cooperation with Booking.com and the authorities. No card leak confirmed; personal-data exposure under investigation.
- Around 2026-05-28: the company's disclosure is also reported in English-language media

---

## 3. Attack vector

(The specific method of initial access is under investigation and undetermined. The confirmed chain of events is recorded below.)

1. **Account compromise**: a third party gains unauthorized access to Polaris's group Booking.com account (path under investigation)
2. **Payout-account tampering**: from inside the legitimate management console, the payout bank-account details of multiple hotels are rewritten to a third-party account
3. **Outflow of funds**: part of the receivables the operator should have collected is transferred to the rewritten payout account; about ¥9 million leaves at one hotel
4. **Partial block via early detection**: starting from the group-account anomaly detection, transfers at the other hotels are blocked
5. **Accompanying guest phishing**: guest-facing phishing — apparently using information from the compromised partner systems or external booking tools — is also reported

---

## 4. Structural analysis

This case is anchored in the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof) and is a boundary case that also intersects Pillar 01 (Verifiable Origin). Secondary categories are `data-provenance` (the provenance of the payout-destination instruction) and `identity-auth` (account compromise).

Two readings hold at once. **The P4 reading**: the payout bank account is an attribute asserting "this is the destination designated by the legitimate operator," and its authenticity should have been verified before the funds moved. The attacker could forge this attribute simply by overwriting it within an authenticated session — proof of the attribute's authenticity was never a precondition of the change operation. **The P1 reading**: the legitimacy and provenance of the payout-destination "instruction" (who changed it, under what legitimate authorization) was accepted without verification. Both converge on a single point: a high-impact change directly tied to the movement of funds was accepted on the strength of authentication at change-time alone, and the legitimacy of the change itself was never independently verified.

The central failure primitive is that **the platform trusted "an operation performed by an authenticated session" and did not independently verify whether that operation (the payout-destination change) was legitimately authorized and based on an authentic attribute.** This is the same family as Brief 006 (the "revoked" attribute of a Google API key was not independently verified and remained valid after deletion): an attribute's state is made the premise of trust yet is never independently verified. It shares a root with Brief 002 (rewriting trust configuration via a deployer key) in that **rewriting the trust configuration itself from within legitimate authority drains funds**. Unlike common Booking.com phishing (which targets guests' cards), this case strikes **the operator's funds-routing configuration value**, showing how tampering with business data on a SaaS platform converts directly into monetary loss.

---

## 5. The detection–proof gap

Anomaly detection, password resets, and cooperation with authorities and the platform are indispensable for understanding the damage, halting its spread, and tracing the path; this Brief does not dispute that role. Here, too, detection was the starting point that blocked transfers at the other hotels and limited the damage.

But detection does not change "whether the payout-destination change should be accepted before the funds move" itself. The tampering went through a legitimate authenticated session and looks normal as an extranet operation. Because detection only fires once an anomaly appears, the first fraudulent transfer (about ¥9 million) was already complete. What was missing is independent verification, at the moment of change, of "is this payout-account change based on legitimate authorization and an authentic attribute?" — a different track from account monitoring and after-the-fact log tracing. For audit, too, after the outflow there is little independent trail beyond reconciling the platform's access logs to prove "when, under whose authorization, and to which account it was changed."

Pre-execution attestation requires, before execution, that a payout-account change directly tied to the movement of funds present both "the changer's legitimate authorization" and "the authenticity of the new payout-destination attribute" as independently verifiable proof. Even within an authenticated session, if the proof reports "this change lacks legitimate authorization" or "this payout destination is not established as an authentic attribute," the change and the subsequent transfer are blocked in advance. Detection of account compromise (the detection-style "is this suspicious access?") and pre-execution proof of the change ("is this payout-destination change authorized and authentic?") are not substitutes but **complements**.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry context

- **Polaris Holdings**: after detecting the anomaly, reset passwords across all hotels and tracked the access path and logs in cooperation with Booking.com and the authorities. Continuing to investigate the scope of damage. No card leak confirmed.
- **Cross-industry**: campaigns targeting Booking.com partners are continuously tracked by vendor research, and most are phishing aimed at guests' card data. This case is an extension of that line, but in striking the operator's **payout account — a funds-routing configuration** — it converts the damage into the operator's direct loss. The question of how to independently verify, at change-time, changes to operational data on SaaS/platforms (payout destinations, contact details, permission settings) is coming to the fore.

The need to treat configuration changes directly tied to the movement of funds "not as operations of an authenticated session but as proofs of authorization and attribute authenticity" is expected to be re-recognized across lodging, e-commerce, and platform operators in the wake of this case.

---

## 7. Lemma's analysis

Against the structure exposed here (a payout-account change directly tied to the movement of funds is accepted on authentication at change-time alone, with no independent verification of authorization and attribute authenticity), Lemma proposes a design that treats high-impact attribute changes as independently verifiable proof before execution. By verifying — before the funds move — both the authenticity of the payout-account attribute (P4) and the legitimate provenance of the change instruction (P1) as a proof, a change that lacks legitimate authorization and authenticity is rejected in advance even within an authenticated session.

For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Polaris Holdings**: disclosure regarding unauthorized access (2026-05; group Booking.com account compromise, payout-account tampering, loss amount, response) — company IR disclosure
- **TipRanks**: "Polaris Holdings Probes Booking.com Breach After Fraudulent Hotel Transfers" (2026-05) — https://www.tipranks.com/news/company-announcements/polaris-holdings-probes-booking-com-breach-after-fraudulent-hotel-transfers
- **The Globe and Mail**: "Polaris Holdings Probes Booking.com Breach After Fraudulent Hotel Transfers" (2026-05) — https://www.theglobeandmail.com/investing/markets/markets-news/Tipranks/2193582/polaris-holdings-probes-booking-com-breach-after-fraudulent-hotel-transfers/
- **Sekoia.io**: "Phishing campaigns 'I Paid Twice' targeting Booking.com hotels and customers" (2026; context on partner-compromise campaigns) — https://blog.sekoia.io/phishing-campaigns-i-paid-twice-targeting-booking-com-hotels-and-customers/

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
