---
brief_no: 21
title: "Wirecard：残高を示す確認書類を、フィリピンの 2 行が偽造と通知し、同社は破綻を申請した(KPMG 特別監査・同社の開示)"
title_en: "Wirecard: two Philippine banks said the balance confirmations were forged, and the company filed for insolvency (KPMG special audit, company disclosure)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["kyc-aml-disclosure"]
incident_date: 2020-06-25
published: 2026-06-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "019-construction-engineer-qualification-fraud", "040-redd-carbon-credit-phantom-issuance", "006-google-api-key-revocation-lag", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
og_lead_ja: "Wirecard が 19 億ユーロは存在しない可能性が高いと開示し破綻を申請。残高を示す書類は、フィリピンの 2 行が偽造と通知"
og_lead_en: "Wirecard disclosed that EUR 1.9 billion likely did not exist and filed for insolvency; two Philippine banks said the balance documents were forged"
og_kicker_ja: "企業破綻の事例 · 残高確認書"
og_kicker_en: "CORPORATE COLLAPSE · BALANCE LETTERS"
og_headline_ja: "残高を示す書類は、\n偽造と銀行が通知。\nWirecard は破綻。\n<accent>19 億ユーロ不在と開示</accent>"
og_headline_en: "Banks said the balance\nletters were forged.\nWirecard collapsed.\n<accent>EUR 1.9B likely not there</accent>"
key_figures:
  - value: "EUR 1.9"
    unit: "billion"
    label: "Balance said to sit in escrow accounts, which Wirecard disclosed likely did not exist; about a quarter of its balance sheet"
    tone: "alert"
  - value: "~EUR 1.0"
    unit: "billion"
    label: "Overseas account balances whose existence KPMG's special audit could not confirm (2020-04)"
  - value: "06-16 → 06-25"
    label: "From the two banks' forgery notice to the insolvency filing (2020)"
glossary:
  - term: "Balance confirmation"
    desc: "A document from a bank stating an account's balance at a point in time. Audits use it as the basis for the existence of cash."
  - term: "Escrow (trust) account"
    desc: "An account held and managed by a third party (a trustee). Wirecard's EUR 1.9 billion was said to be held in such accounts."
  - term: "Forensic special audit"
    desc: "An investigation commissioned separately from the regular audit to examine suspect transactions or balances."
  - term: "Ad-hoc disclosure"
    desc: "Immediate publication of facts that may affect the share price, without waiting for periodic reporting."
insight:
  slug: "forwarded-letter-taken-as-balance"
  label: "A forwarded letter taken as an existing balance"
  quote: "However complete a balance confirmation looks, whether the issuing bank actually stated that balance cannot be confirmed from the contents of the letter that arrived."
industries: ["finance"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "Confirm balance letters directly with the issuing bank"
attack_method: "impersonation"
impact: "A EUR 1.9 billion balance disclosed as likely nonexistent"
takeaway: "The existence of cash balances rested on confirmation documents said to come from banks, and the two Philippine banks said those documents were forged."
self_check: "Before you accept a balance or asset confirmation, do you check whether the issuing financial institution actually issued it, separately from the letter that arrived?"
countries: ["de"]
---

## 1. Summary

The cash was said to sit in escrow accounts at two Philippine banks (BDO and BPI), and its existence was shown through balance-confirmation letters in those banks' names. According to press reports and the Wikipedia summary, the letters reached the auditor via a third party, and the auditor relied on them without confirming directly with the banks. KPMG's special audit and investigative reporting made the divergence between claim and reality visible from outside only after years of disclosures had been accepted by the market. The criminal proceedings were reported at the stage of suspicion, and this Brief does not describe any verdict. <strong>However complete a balance confirmation looks, whether the issuing bank actually stated that balance cannot be confirmed from the contents of the letter that arrived.</strong>

## 2. What got through

- **What got through**: The presentation of cash balances in escrow accounts through balance-confirmation letters in the banks' names, and their disclosure, on that basis, in audited financial statements. On 2020-06-16, the two Philippine banks notified the auditor EY that the documents purporting to show the EUR 1.9 billion balance were "spurious."
- **What the receiving side gets**: In general, what reaches an auditor confirming a balance is a document in the bank's name, with its format, signature and amount. When the document arrives via a third party, whether the issuing bank actually issued it is not contained in the document itself. Press reports and the Wikipedia summary say EY did not confirm directly with the banks and relied on the forwarded documents.
- **Regulatory reach**: According to the Wikipedia summary, regulator BaFin's powers extended only to the company's banking subsidiary, not to the payments parent or to accounting practice.
- **Not disclosed**: Who produced the confirmation documents at which stage, and by what route they reached the auditor. Which periods' disclosures relied on which documents.

## 3. Pre-execution check

The condition that holds whatever the route is this: before an audit opinion or a disclosure, the side accepting a balance checks whether the issuing bank actually issued the confirmation, separately from the letter that arrived.

- **Who approves**: The financial institution holding the asset (the issuing bank). The issuer states, under its own signature, that the balance is at or above a threshold. It is not issued as a document forwarded via a trustee or agent, or as something the disclosing company asserts about itself.
- **Where the check happens**: Before the balance is accepted in the audit, and before it is disclosed in the financial statements. Check the issuer's signature and the point in time the balance refers to. If it cannot be checked, the letter is not accepted as the basis for the balance's existence, however complete it looks. It can also show only that the balance is at or above the threshold, without releasing account numbers or transaction details.
- **What remains**: A record of which balance was checked against which issuer's signature, and when, before it was accepted. Kept in a form that auditors, regulators and counterparties can show years later when someone asks whether the balance existed at the time.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a balance is accepted as the basis for an audit or a disclosure, whether the issuing bank issued the confirmation, separately from the letter that arrived, and keeping a record. Detection means noticing later, through a special audit, investigative reporting or a notice from the bank. Dates are when the audit report, notices and disclosures came out.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the issuing bank's signature, separately from the letter, before accepting it</div>
<div class="rx-zone gapz"><b>What the audit, the banks and the company stated</b><span>Existence of about EUR 1.0 billion in overseas balances could not be confirmed (KPMG)<br>The balance documents were forged (the two Philippine banks)</span></div>
<div class="rx-zone det"><b>Detection · worked after years of disclosure</b>Reporting and a special audit showed the divergence; the banks' notice settled it</div>
<div class="rx-g g1"><div class="t">2020-04-28</div><b>KPMG special audit report</b></div>
<div class="rx-g g2"><div class="t">2020-06-16</div><b>Two banks tell EY the documents are forged</b></div>
<div class="rx-g g3"><div class="t">2020-06-22</div><b>Disclosure: balance likely does not exist</b></div>
<div class="rx-g g4"><div class="t">2020-06-25</div><b>Insolvency filing</b></div>
</div>
</figure>

Detection is essential for raising the question, driving the investigation and scoping remediation after discovery. But investigative reporting and the special audit both worked after the letters had been accepted and the disclosures had reached the market. Detection does not change whether, at the moment of acceptance, the letter reflects a balance the issuing bank actually stated. Cases where a declared attribute was accepted without being checked include [type-designation conformity fraud](/critical/briefs/020-type-designation-conformity-fraud/), [falsified engineer qualifications](/critical/briefs/019-construction-engineer-qualification-fraud/) and [carbon credit issuance](/critical/briefs/040-redd-carbon-credit-phantom-issuance/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that accepts a balance as the basis for an audit or a disclosure.** It does not find forged documents; it checks, before acceptance, whether the balance was stated under the issuing financial institution's signature, and keeps a record. It can also show only that the balance is at or above a threshold, without the account originals leaving the company.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Payment companies, banks, businesses that hold funds, and the audit firms that audit them. The existence of balances is accepted as a premise for financial statements, listed disclosures and counterparty credit.
- **Operations · Disclosure & data release**: Work that presents asset balances to regulators and markets as audited financial statements or ad-hoc disclosures.

### Current controls vs Lemma

This case falls under both columns: the confirmation letters were accepted (column 1), and those balances were disclosed in audited financial statements (column 2).

| Control | Accepting a balance confirmation forwarded via a third party | Disclosing an audited balance |
| --- | --- | --- |
| Reviewing the letter that arrived (format, signature, amount) | Not effective | Not relevant |
| Direct confirmation with the issuing bank | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial |

Reviewing the letter does not work because, however complete it looks, it does not contain whether the issuer actually issued it. Direct confirmation works when the contact is the genuine bank's channel, but if the contact details came from the letter or the third party, it passes through the same route. Lemma checks the issuer's signature, not the letter, before acceptance. For disclosure, it can check whether a balance being disclosed has a check record, but whether a balance without one is left out of the disclosure depends on the disclosure procedure.

Note: Lemma's check works only when the issuing financial institution states balances under its signature and the check is built into the audit and disclosure steps. Procedures that accept only paper remain outside the check. If an incorrect balance is signed inside the issuing bank, signature checks cannot tell. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent fraud or intrusions.

### Checklist

Three things to confirm for organizations that accept asset balances as the basis for an audit or a disclosure

- Do your procedures receive balance confirmations directly from the issuing financial institution, not via a third party?
- Do you choose the contact for confirming with the issuer from your own separate records, not from the contact details on the letter that arrived?
- Do you record, in a form you can show later, which balance was accepted on the basis of which issuer's confirmation?

## 5. Facts and timeline

- **Company**: Wirecard AG, a DAX-listed payments major based in Munich, Germany. It filed for insolvency on 2020-06-25.
- **What was confirmed**: Of the EUR 1.9 billion said to be held in escrow (trust) accounts, the company stated in its 2020-06-22 ad-hoc disclosure that it "likely does not exist." This equals about one-quarter of the group's balance sheet.
- **How the balances were shown**: The existence of cash balances was shown through balance-confirmation letters in the names of two Philippine banks (BDO and BPI). On 2020-06-16, the two banks notified EY that those documents were forged.
- **Audit**: EY was the long-time auditor. Press reports and the Wikipedia summary say that, for these balances, EY did not confirm directly with the banks and relied on forwarded confirmation documents.
- **Special audit**: KPMG's special audit, which the company commissioned in 2019-10, stated in its 2020-04 report that it could not confirm the existence of about EUR 1.0 billion in overseas account balances.
- **Regulation**: According to the Wikipedia summary, BaFin's powers extended only to the company's banking subsidiary, not to the payments parent or to accounting practice.
- **Investigation**: Munich prosecutors investigated the executives, and CEO Markus Braun was reported arrested on suspicion of false accounting and market manipulation.

### Timeline

- **2019-10**: Wirecard, in response to external accounting questions, commissions a forensic special audit from KPMG.
- **2020-04-28**: KPMG's special audit report is published, stating that the existence of about EUR 1.0 billion in overseas account balances could not be confirmed.
- **2020-06-05**: Munich prosecutors open an investigation of CEO Markus Braun and other executives; the headquarters is searched.
- **2020-06-16**: The two Philippine banks (BPI and BDO) notify EY that the documents purporting to show the EUR 1.9 billion balance are "spurious."
- **2020-06-18**: Wirecard announces that EUR 1.9 billion is "missing." COO Jan Marsalek is suspended.
- **2020-06-19**: Braun resigns as CEO.
- **2020-06-22**: An ad-hoc disclosure states that the balance "likely does not exist."
- **2020-06-23**: Braun is arrested on suspicion of false accounting and market manipulation.
- **2020-06-25**: Wirecard AG files for insolvency.

> The facts rest on KPMG's special audit report, the company's disclosures, the Wikipedia summary and reporting by the Financial Times, CNN Business and Reuters. That the documents were forged is the two Philippine banks' notice, and the executives' arrests were reported as based on suspicion. Statements about audit procedures rest on press reports and the summary; this Brief does not find fault with the audit firm or any individual. What was not disclosed does not mean controls were absent.

### After disclosure

- **Investigation and the company**: Munich prosecutors investigated the executives and arrested the CEO. Wirecard went through insolvency and delisting. BaFin's powers not extending to the payments parent became a focal point in debates over European capital-market supervision.
- **Audit and governance**: The effectiveness of confirming balances directly with banks, reliance on confirmation documents routed through third parties, and the limits of internal controls and external audit were debated as an international corporate-governance question.
- **Policy direction**: Demand to show asset existence and reserves in a form that can be checked from outside, rather than as self-reported documents, is growing in both finance and crypto.

## 6. Sources

- **KPMG special audit report (primary)**: "Report concerning the Independent Special Investigation — Wirecard AG, Munich" (2020-04-28, on the inability to confirm the existence of overseas account balances) — https://www.wirecard.com/uploads/Bericht_Sonderpruefung_KPMG_EN_200501_Disclaimer.pdf
- **Wikipedia (secondary, aggregated history)**: "Wirecard scandal" (EUR 1.9 billion, escrow accounts, role of EY and BaFin, course of insolvency) — https://en.wikipedia.org/wiki/Wirecard_scandal
- **Press (secondary)**: chronology of the June 2020 collapse (forgery notice from the two Philippine banks, executive resignations and arrests, insolvency filing) — Financial Times / CNN Business / Reuters

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
