---
brief_no: 21
title: "残高確認書の偽造による資産実在性の主張 — 金融属性が独立検証されないまま開示・市場に直結した構造（Wirecard）"
title_en: "Forged Balance Confirmations Asserting Asset Existence — A Financial Attribute Asserted Without Independent Verification, Reaching Disclosure and Markets (Wirecard)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["kyc-aml-disclosure"]
incident_date: 2020-06-25
published: 2026-06-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "019-construction-engineer-qualification-fraud", "006-google-api-key-revocation-lag", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "残高確認書の偽造で資産の存在属性が独立検証されず — Wirecard"
og_lead_en: "Forged balance confirmations went unverified, reaching disclosure — Wirecard"
---

## TL;DR

In June 2020, German listed payments giant Wirecard AG announced that EUR 1.9 billion — about one-quarter of its balance sheet — "likely did not exist," and on June 25 it filed for insolvency. The funds were said to be held in escrow (trust) accounts at two banks in the Philippines (BDO and BPI), but on June 16 both banks notified Wirecard's auditor EY that the documents supporting those balances were forged. The funds did not exist. Wirecard's financial attribute — "the cash balance exists / has been audited" — had for years been presented through balance-confirmation letters purportedly issued by the banks, accepted by the auditor, regulators, and markets, but the authenticity of those originals was never independently verified. KPMG's special audit, which Wirecard itself commissioned in October 2019, reported in April 2020 that it could not confirm the existence of about EUR 1.0 billion in overseas account balances; only then was the divergence between asserted attribute and reality made visible from outside. This Brief examines the structure by which the financial attribute "an audited balance exists" flowed straight to regulatory disclosure and the public markets, severed from independent verification of its basis (the balance confirmations and account originals). This Brief analyzes a widely reported and investigated overseas case structurally, through the lens of independent verification of regulatory attributes. It treats the roles of auditors, regulators, and detection as a division of labor, not as a target of criticism.

---

## 1. Incident Overview

- **Insolvency**: 2020-06-25, Wirecard AG (Munich, DAX-listed payments major) files for insolvency
- **Scale of the gap**: EUR 1.9 billion said to be held in escrow (trust) accounts did not exist. This equals about one-quarter of the group's balance sheet
- **How the attribute was presented**: the existence of cash balances was presented through balance-confirmation letters in the names of two Philippine banks (BDO and BPI)
- **Who verified the attribute**: long-time auditor EY relied on those balances as the basis of its audit opinion. EY did not directly confirm with the banks; it relied on the confirmation letters as forwarded
- **Trigger for detection**: KPMG's special audit, which Wirecard itself commissioned in October 2019, reported in April 2020 that it could not confirm the existence of about EUR 1.0 billion in overseas account balances. On June 16, 2020, the two Philippine banks notified EY that the confirmation documents were forged
- **Limits of the regulator**: regulator BaFin's powers extended only to Wirecard's banking subsidiary, not to the payments parent or to accounting practice

---

## 2. Timeline

- 2019-10: Wirecard, in response to external accounting questions, commissions a forensic special audit from KPMG
- 2020-04-28: KPMG's special audit report is published, stating that the existence of about EUR 1.0 billion in overseas account balances could not be confirmed
- 2020-06-05: Munich prosecutors open an investigation of CEO Markus Braun and other executives; the headquarters is searched
- 2020-06-16: the two Philippine banks (BPI and BDO) notify EY that the documents purporting to show the EUR 1.9 billion balance are "spurious" — forged
- 2020-06-18: Wirecard announces that EUR 1.9 billion is "missing." COO Jan Marsalek is suspended
- 2020-06-19: Braun resigns as CEO
- 2020-06-22: ad-hoc disclosure states that the balance "likely does not exist"
- 2020-06-23: Braun is arrested on suspicion of false accounting and market manipulation
- 2020-06-25: Wirecard AG files for insolvency

---

## 3. From Confirmation to Disclosure

This event stems from a confirmation structure in which a regulatory attribute (asset existence) is never independently verified. The failure propagates to regulatory disclosure and the markets as follows.

1. **Balance claim**: cash balances in escrow accounts are presented through balance-confirmation letters purportedly issued by the banks. The letters may pass through a third party (trustee or agent) before reaching the auditor
2. **Reliance on the paper**: the auditor accepts the existence of the balance based on the forwarded confirmation letter rather than confirming directly with the bank. The authenticity of the original and the legitimacy of the issuer are not independently re-verified at this point
3. **Flow into regulatory disclosure**: the attribute "an audited cash balance exists" is presented to regulators and markets as listed disclosure and financial statements. Investors, counterparties, and rating agencies accept the asserted attribute
4. **Delayed discovery**: the divergence between the paper's claim and the account's reality is not made visible in the ordinary audit cycle. It is first confirmed from outside only through investigative journalism and a separately commissioned special audit
5. **Impact realization**: once forgery is confirmed, beyond insolvency, delisting, and criminal proceedings, retrospective verification of asset existence is required for the entire prior disclosure period

---

## 4. Structural Argument

The incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **a financial attribute claim — "the asset exists and has been audited" — is accepted while severed from independent verification of its basis.** The attribute "the balance exists" is presented as a balance-confirmation letter or an audited financial statement, but the authenticity of its basis — the account original and the issuing bank's legitimacy — is not connected to a verification layer at the point of disclosure. As long as a forwarded PDF is the trust terminus, the divergence between asserted attribute and reality cannot be made visible without that layer. `kyc-aml-disclosure` (financial-institution disclosure attributes) is noted as a secondary category.

The targets differ from Brief 019 (a person's qualification attribute), Brief 020 (a product's conformity attribute), and Brief 006 (revocation attribute), but the shared primitive is the same: **an attribute assertion is decoupled from the layer that would verify it.** This case shows the magnitude of attribute-proof bypass when the assertion flows all the way into regulatory disclosure and the public markets.

---

## 5. The Structural Gap Detection Cannot Close

Here, the detection chain — sustained investigative reporting and a special audit by KPMG — worked, and the divergence between asserted attribute and reality was ultimately made visible from outside. This is a textbook detection success, and this Brief does not dispute the role of the detection layer. Detection is essential for raising the question, driving the investigation, and scoping remediation after disclosure.

Detection, however, cannot change whether, at the moment the confirmation letter is accepted, that letter reflects a legitimate balance at the issuing bank. Investigative reporting and special audits are both after-the-fact chains that activate only after years of disclosure have been received by the market. Paper-based confirmation does not, on its own, serve as material to independently prove "the balance existed at the time" in regulatory disclosure or audit opinions. This is a gap in a structurally independent layer, beyond detection's reach.

As things stand, across the operating model for financial compliance, independent verification of asset existence still depends on trust in forwarded confirmation letters and is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of attribute proof into the confirmation / disclosure path. It is a complement to detection, not a substitute; together the two establish the trust boundary for asset existence (for more on the relationship between detection and pre-execution attestation, see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Response

- **Regulatory and criminal**: Munich prosecutors charged executives and arrested the CEO. Wirecard went through insolvency and delisting. BaFin's powers not extending to the payments parent became a focal point in debates over European capital-market supervision
- **Audit and governance**: the effectiveness of directly confirming balances with banks, reliance on confirmation letters routed through third parties, and the limits of internal controls and external audit became a widely discussed international corporate-governance question
- **Shift in regulatory center of gravity**: the regulatory center of gravity is shifting from data disclosure to compliance proof. Demands to evidence asset existence and proof of reserves in an independently verifiable form, rather than self-reported documents, are growing in both finance and crypto

The absence of a layer that independently verifies the basis of asset existence — a financial attribute — at the point of confirmation and disclosure surfaces not as one company's problem but as a cross-industry operational challenge in finance.

---

## 7. Lemma's Analysis

For the structural gap exposed here — a claim of asset existence flowing straight to regulatory disclosure and the markets while severed from independent verification of its basis — Lemma offers a design in which balance and reserve confirmations are committed as independently verifiable cryptographic proofs, so that auditors, regulators, and counterparties can independently verify "the asset exists at or above the threshold" without the company releasing its account originals.

- **Issuer-signed attestations**: the financial institution holding the asset (the issuer) attests to the existence of the balance with an issuer signature. Rather than paper routed through a third party, the proof is bound to the issuer
- **Schema-bound proofs**: each proof is bound to the regulatory schema it satisfies (disclosure standard, reserve requirements, etc.), letting auditors and regulators verify directly against the regulatory text
- **Selective disclosure**: BBS+ over BLS12-381 discloses only that "the balance exists at or above the threshold" — account numbers and transaction details never leave the company
- **Original binding and validity**: committed with Poseidon over BN254; existence and non-tampering proven with Groth16 (Circom circuits); bound to the balance originals via docHash

A proof fixed at the point of confirmation and disclosure then functions, years later when "did the asset exist at the time?" is asked, as an independently verifiable trail that discloses no original data. Detection (after-the-fact special audits, investigative journalism) serves remediation after disclosure; pre-execution attestation (attribute verification at confirmation) serves independent verification of asset existence — complementary layers. For the design and scope, see the use cases [Financial Data Exfiltration](https://lemma.frame00.com/ja/solutions/use-cases/financial-data-exfiltration/) and [KYC/AML Selective Disclosure](https://lemma.frame00.com/ja/solutions/use-cases/kyc-aml-selective-disclosure/), and [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/).

---

## 8. Sources

- **KPMG special audit report (primary)**: "Report concerning the Independent Special Investigation — Wirecard AG, Munich" (2020-04-28, on the inability to confirm the existence of overseas account balances) — https://www.wirecard.com/uploads/Bericht_Sonderpruefung_KPMG_EN_200501_Disclaimer.pdf
- **Wikipedia (secondary, aggregated history)**: "Wirecard scandal" (EUR 1.9 billion, escrow accounts, role of EY and BaFin, course of insolvency) — https://en.wikipedia.org/wiki/Wirecard_scandal
- **Press (secondary)**: chronology of the June 2020 collapse (forgery notice from the two Philippine banks, executive resignations and arrests, insolvency filing) — Financial Times / CNN Business / Reuters

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
