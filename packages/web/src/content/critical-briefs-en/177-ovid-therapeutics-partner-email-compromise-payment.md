---
brief_no: 177
title: "Ovid Therapeutics：開発パートナーを装った相手へ、送金が出た(米 SEC 提出書類)"
title_en: "Ovid Therapeutics: A payment went to a party posing as a development partner (US SEC filings)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-11-12
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["176-modalis-subsidiary-vendor-email-takeover", "161-orion-manual-wire-transfer-fraud", "170-zephyr-energy-contractor-payment-diverted", "160-baltimore-workday-supplier-contact-bank-change"]
status: published
version: "1.0"
og_lead_ja: "米 Ovid Therapeutics、開発パートナー側のメールの乗っ取りで、パートナーを装った相手へ 180 万ドルを送金"
og_lead_en: "Ovid Therapeutics: after a partner's email was compromised, $1.8M went to a party posing as that partner"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · メールの乗っ取り"
og_kicker_en: "CYBERATTACK · EMAIL COMPROMISE"
og_headline_ja: "開発パートナーを装った\n相手へ、送金が出た。\n<accent>180 万ドル（のちに全額回収）</accent>"
og_headline_en: "Paid to an impostor\nposing as a dev partner.\n<accent>$1.8M, later recovered.</accent>"
key_figures:
  - value: "$1.8M"
    label: "Sent to a third party posing as a development partner, and recorded as a loss for July–September 2024 (company quarterly report)"
    tone: "alert"
  - value: "11-12 → 01-15"
    label: "From disclosure in the quarterly report to full recovery (2024 → 2025, company annual report)"
  - value: "Q3 → 12-31"
    label: "From assessing material weaknesses, including controls over changes to vendor payment information, to declaring them remediated (company reports)"
glossary:
  - term: "10-Q"
    desc: "The quarterly report a US listed company files with the SEC. The annual report is the 10-K."
  - term: "Business email compromise (BEC)"
    desc: "A scheme that takes over or imitates a vendor's or executive's email to request payments or account changes. The company's filings use this term."
  - term: "Material weakness"
    desc: "A deficiency in internal control over financial reporting that creates a reasonable possibility that a material misstatement will not be prevented or detected on time. Listed companies must disclose it."
insight:
  slug: "partner-mailbox-is-not-the-partner"
  stop: true
  label: "A partner's mailbox is not the partner"
  quote: "Before paying, check the change to the vendor's bank account with the vendor's registered contact, not the email that delivered it."
industries: ["healthcare"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Confirm changes to a vendor's bank account with the vendor through a registered contact other than its email"
  - slug: "hold-unverified"
    item: "Hold payments to a changed account until the vendor's confirmation is in hand"
  - slug: "audit-trail"
    item: "Record which change was used for payment, who checked it, and how"
attack_method: "impersonation"
impact: "$1.8M was sent to a third party posing as a development partner (fully recovered in January 2025)"
takeaway: "A development partner's email was compromised and a payment went to a party posing as that partner. Check changes to a vendor's bank account through a registered contact other than its email before using them."
self_check: "When a vendor sends a bank account change, do you check it through a registered contact other than that vendor's email before paying?"
countries: ["us"]
---

## 1. Summary

The mailbox that was taken over belonged not to the company but to one of its development partners. A payment then went to a party posing as that partner.

The company assessed that it had material weaknesses in its readiness for impersonation and in its controls over changes to vendor payment information, and reported that because of them it did not identify the scheme and the payment went through. The funds were fully recovered in January 2025.

<strong>Once a vendor's own mailbox is taken over, a payment request sent from it cannot be told apart from a genuine request from that vendor.</strong>

## 2. What got through

- **What got through**: A transfer carried out as a payment to a development partner. The recipient was a third party posing as that partner, and the amount was $1.8 million (company quarterly report).
- **What reached the paying side**: In general, when a vendor's email is compromised, the paying side receives requests from the usual address, or as a continuation of an existing thread. Neither the sender nor the wording tells them apart from a genuine request. The company names controls over changes to vendor payment information among its weaknesses.
- **Not disclosed**: The development partner's name. The transfer date and the date of discovery. By what route, and how, the payment information changed (whether a change request arrived by email). The payment method (ACH or wire). How the funds came back (from a frozen account, or through insurance).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever pays a vendor checks, before paying, that the change to its bank account was approved by that vendor through its registered contact, not through the email that delivered it.

- **Who approves**: The vendor. It approves the account change through its registered contact. That contact must be something other than the email that delivered the change (a registered phone number, a signature with the vendor's key, and so on), because the email itself may be compromised.
- **Where it is checked**: The step that changes vendor payment information, and the approval before the first payment to a changed account. Changes that cannot be matched to the vendor's approval are held and not used for payment.
- **What is recorded**: Which change was used for payment, who checked it, and how, so you can show what was checked before paying for recovery, investigation, insurance or audit.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a change to a vendor's bank account through a registered contact other than the vendor's email before using it for payment. Detection means noticing the scheme after the transfer. The transfer date and the date of discovery have not been disclosed. Dates shown are those the company reported.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the account change through a contact other than the vendor's email, then pay</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A partner's email was compromised<br>$1.8M sent to the impostor</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfer</b>The scheme is noticed; the bank and law enforcement are contacted</div>
<div class="rx-g g1"><div class="t">2024 Q3</div><b>Transfer to a party posing as the partner (date not disclosed)</b></div>
<div class="rx-g g2"><div class="t">Discovery</div><b>Bank and law enforcement contacted (date not disclosed)</b></div>
<div class="rx-g g3"><div class="t">11-12</div><b>Disclosed in the quarterly report and recorded as a loss</b></div>
<div class="rx-g g4"><div class="t">01-15</div><b>Fully recovered (2025)</b></div>
</div>
</figure>

The scheme was noticed only after the transfer had gone through. Similar cases, where a payment meant for a genuine vendor went to another account, are [Zephyr Energy](/critical/briefs/170-zephyr-energy-contractor-payment-diverted/) (a single contractor payment was diverted) and the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a supplier's contact and bank details were rewritten). [Orion](/critical/briefs/161-orion-manual-wire-transfer-fraud/) also reported a material weakness in its wire transfer controls.

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that changes vendor payment information and the approval before a payment is carried out.** It does not look for intrusions or impersonating emails; it confirms, before the payment, that a changed account is one that could be matched to the vendor's approval.

### Industries and operations to watch

- **Industry · Healthcare and pharma**: Organisations that outsource development or clinical trials to partners and pay substantial amounts at contract milestones.
- **Operation · Bank account changes**: Registering and changing vendor payment information (the control the company named as a weakness).
- **Operation · Approval**: Approving ACH and wire transfers to vendors.

### Current controls vs Lemma

The route in this case began with the takeover of a development partner's email and ended with a transfer to a party posing as that partner. The filings do not describe in detail how the change to payment information arrived, so the table separates the change from the payment and also shows the email takeover itself.

| Control | Change to vendor payment information | Payment to the changed account | Takeover of the vendor's own email |
| --- | --- | --- | --- |
| Staff training (awareness of impersonation) | Partial | Partial | Not effective |
| Transfer approval (checking the contents) | Not applicable | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Training helps people notice unusual requests, but requests from a genuine, compromised address are hard to spot. Transfer approval cannot tell a request apart by its contents when the name and amount match a real transaction. The company says it strengthened both as part of its remediation. Lemma does not deal with the takeover of the vendor's email; it confirms, before paying, that a changed account could be matched to the vendor's approval.

Note: Lemma's check works only when it is built into the step that changes payment information and the approval before payment, and the vendor's approval is received through a registered contact or key other than the email that delivered the change. It passes if that email is the only registered contact. It also passes if the registered contact itself has been altered. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about payments to vendors

- Do you have a step that holds the first payment to a newly changed account before it is carried out?
- When a vendor tells you something was wrong with its email, do you have a step to review payments and accounts for that vendor?
- If a scheme is found after a transfer, is there a set procedure to contact the bank and law enforcement immediately?

## 5. Facts and timeline

- **Party**: Ovid Therapeutics Inc., a biopharmaceutical company based in New York that develops treatments for brain conditions. Listed on Nasdaq.
- **What happened**: A business email compromise occurred at one of its development partners, and $1.8 million was sent to a third party posing as that partner. The company reported the matter to the US Secret Service and the FBI.
- **Company assessment**: Management concluded that disclosure controls were not effective as of 30 September 2024, and assessed material weaknesses in readiness for impersonation and in controls over changes to vendor payment information. The company says these led it not to identify and prevent the scheme.
- **Discovery**: In the quarterly report, the company says it discovered the fraud itself and promptly contacted its bank and law enforcement. In the annual report, it says it was notified of a business email compromise affecting a development collaborator. It says it has found no evidence of further fraudulent activity.
- **Impact**: $1.8 million was recorded as a loss for July–September 2024. The full amount was recovered on 15 January 2025 and recorded as a gain for January–March 2025.

### Timeline

- **2024 Q3 (date not disclosed)**: $1.8 million is sent to a third party posing as a development partner.
- **Discovery date (not disclosed)**: The company notices the scheme and contacts its bank and law enforcement.
- **2024-11-12**: The company discloses it in its quarterly report (10-Q) and records a loss. It said it believed the receiving account had been frozen and was seeking to confirm information that the account may have been blocked under US sanctions (OFAC).
- **2024-12-31**: The date as of which the company declared the material weaknesses remediated (per the annual report).
- **2025-01-15**: The company recovers the full $1.8 million.
- **2025-03-11**: The company reports the full recovery and the remediation in its annual report (10-K).

> The facts rely on Ovid Therapeutics' SEC filings (primary). The filings do not name the development partner. The transfer date and the date of discovery have not been disclosed. Nor have how the payment information changed or how the funds came back. The material weaknesses are management's own assessment. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Ovid Therapeutics (quarterly report)**: Said it was working with law enforcement and the banks involved to recover the funds and was assessing recovery under its insurance. Its remediation steps included additional investigative and confirming procedures, a redesign of vendor information change controls, new controls over the approval and review of ACH and wire transfers, training on impersonation, and regular reporting to the Audit Committee.
- **Ovid Therapeutics (annual report)**: Said it hired a finance leader experienced in cyber risk, increased finance team training, and strengthened controls over vendor information changes and the review and approval of disbursements, and declared the weaknesses remediated as of 31 December 2024.

## 6. Sources

- **Ovid Therapeutics Inc. (Primary, SEC filing)**: "Form 10-Q for the quarterly period ended September 30, 2024" (2024-11-12) — <https://www.sec.gov/Archives/edgar/data/1636651/000162828024046868/ovid-20240930.htm>
- **Ovid Therapeutics Inc. (Primary, SEC filing)**: "Form 10-K for the fiscal year ended December 31, 2024" (2025-03-11) — <https://www.sec.gov/Archives/edgar/data/1636651/000162828025011844/ovid-20241231.htm>
- **Ovid Therapeutics Inc. (Primary, SEC filing)**: "Form 10-Q for the quarterly period ended March 31, 2025" (2025-05-13) — <https://www.sec.gov/Archives/edgar/data/1636651/000162828025024913/ovid-20250331.htm>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
