---
brief_no: 170
title: "Zephyr Energy：契約先への支払い 1 件が、第三者の口座へ流用された(同社の開示)"
title_en: "Zephyr Energy: A single payment meant for a contractor was diverted to a third-party account (company disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-04-09
published: 2026-11-02
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["158-portland-water-bureau-vendor-bank-change", "163-liberty-lookalike-domain-vendor-payment", "032-booking-payout-account-tampering"]
status: draft
version: "1.0"
og_lead_ja: "英 Zephyr Energy、米子会社で契約先への支払い 1 件が流用され約 70 万ポンドが第三者の口座へ"
og_lead_en: "Zephyr Energy: one contractor payment at a US subsidiary diverted, ~£700K sent to a third-party account"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 支払いの流用"
og_kicker_en: "CYBERATTACK · PAYMENT DIVERSION"
og_headline_ja: "契約先への支払いが、\n別の口座へ送られた。\n<accent>約 70 万ポンド</accent>"
og_headline_en: "A contractor payment was\nsent to someone else.\n<accent>About £700K diverted.</accent>"
key_figures:
  - value: "~£700K"
    label: "Sent to a third-party account as a payment meant for a contractor (company disclosure)"
    tone: "alert"
  - value: "1 payment"
    label: "The number of payments diverted: a single payment to a contractor (company disclosure)"
  - value: "Undisclosed"
    label: "Method, payment date, discovery date, and whether funds were recovered (not in the company disclosure)"
glossary:
  - term: "RNS"
    desc: "The London Stock Exchange's regulatory news service, used by listed companies to disclose information that may affect their share price."
  - term: "Payment diversion"
    desc: "A payment meant for its intended recipient is sent to a different account. The method (altered invoice, hijacked correspondence and so on) varies by case."
insight:
  slug: "right-payee-not-checked"
  stop: true
  label: "Right payment, wrong recipient"
  quote: "Before paying, check the destination account against the vendor's registered account, not the payment request or invoice."
industries: ["supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "hold-unverified"
    item: "Hold payments until the destination account can be matched to the vendor's registered details"
  - slug: "audit-trail"
    item: "Record which payment went to which account, and how it was checked"
attack_method: "impersonation"
impact: "A single contractor payment was diverted, sending about £700K to a third-party account"
takeaway: "One payment meant for a genuine contractor went to a third-party account. Before paying, check that the destination account matches the vendor's registered details."
self_check: "Before paying a vendor, do you check that the destination account matches that vendor's registered account?"
countries: ["gb", "us"]
---

## 1. Summary

At a US subsidiary, a payment meant for a genuine contractor was sent to a third-party account (company disclosure).

The company says it uses industry-standard practices for its technology and payment systems. Neither the method nor the stage at which the payment was pointed at another account has been disclosed.

<strong>Even when a payment rests on a genuine transaction, it goes to another account unless someone checks that the destination account belongs to that vendor.</strong>

## 2. What got through

- **What got through**: A transfer carried out as a payment to a contractor. It went to a third-party account; about £700,000 was sent (Zephyr Energy disclosure).
- **What reached the paying side**: In general, the side making a payment sees the vendor's name, the amount and the destination account. If the account has been swapped but the name and amount match a real transaction, the contents cannot tell it apart.
- **Not disclosed**: The method and the route of intrusion. The payment date and the date of discovery. The names of the contractor and of the receiving account. Which subsidiary. Whether any funds were recovered. Whether any data was taken. The company describes the incident as "highly sophisticated".

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is checking the destination account against the vendor's registered account before paying.

- **Who approves**: The vendor. When an account is newly registered or changed, it approves that account through its registered contact (not a contact written in the payment request or invoice).
- **Where it is checked**: The approval step before the payment is carried out. Whether the destination account belongs to the vendor is checked separately from the contents (name and amount). A payment whose account cannot be matched to the registered account is held.
- **What is recorded**: Which payment went to which account, and how it was checked, so you can show what was checked before paying for recovery, investigation or insurance.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching the destination account to the vendor's registered account before paying, and keeping a record. Detection means noticing the diversion after the payment. The payment date and the date of discovery have not been disclosed. The date shown is the company's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before paying, match the destination account to the vendor's registered account</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A single contractor payment was diverted<br>About £700K went to a third-party account</span></div>
<div class="rx-zone det"><b>Detection · worked after the payment</b>The diversion is noticed and reported to law enforcement</div>
<div class="rx-g g1"><div class="t">Payment</div><b>One payment to a contractor (date not disclosed)</b></div>
<div class="rx-g g2"><div class="t">Diversion</div><b>Sent to a third-party account</b></div>
<div class="rx-g g3"><div class="t">Discovery</div><b>Reported to law enforcement (date not disclosed)</b></div>
<div class="rx-g g4"><div class="t">04-09</div><b>The company discloses it</b></div>
</div>
</figure>

The diversion was noticed only after the payment had gone through. Similar cases, where a payment to a genuine vendor went to another account, are the [Portland Water Bureau](/critical/briefs/158-portland-water-bureau-vendor-bank-change/) (it acted on a request to change a vendor's bank account) and the [City of Liberty, Texas](/critical/briefs/163-liberty-lookalike-domain-vendor-payment/) (it paid a request from a lookalike vendor domain).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that pays vendors.** It does not look for intrusions; it confirms, before the payment, that the destination account is one that could be matched to the vendor's registered account.

### Industries and operations to watch

- **Industry · Supply chain**: Organisations that pay substantial single amounts to subsidiaries' or sites' contractors.
- **Operation · Bank account changes**: Registering and changing vendors' bank accounts (whether a change request was involved here has not been disclosed).
- **Operation · Approval**: Approving payments to contractors.

### Current controls vs Lemma

The route in this case is the destination account of a contractor payment. At what stage the account was swapped (an invoice, an account-change request, or inside the payment system) has not been disclosed, so the table has a single column.

| Control | Destination account of a contractor payment |
| --- | --- |
| Checking the payment's contents (name and amount) | Not effective |
| Recovery through banks and law enforcement | Partial |
| **Lemma (pre-execution check)** | Effective |

Checking the contents does not settle it, because the payment was for a genuine contractor and the name and amount cannot tell it apart. Recovery through banks and law enforcement is under way, but it acts after the payment, and whether any funds were recovered has not been disclosed. Lemma checks the destination account, not the contents, against the vendor's registered account before paying.

Note: Lemma's check works only when it is built into the approval step before payment, and the vendor's registered account and contact are managed apart from the payment request or invoice. If the registered account or contact itself has been altered, the check can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about payments to vendors

- When a vendor's account is registered or changed, do you confirm it with the vendor through the registered contact?
- Do you have a step that stops, before execution, a payment whose destination differs from the registered account?
- If a diversion is found after payment, is there a set procedure to contact the bank immediately?

## 5. Facts and timeline

- **Party**: Zephyr Energy plc, a UK oil and gas company listed on the London Stock Exchange's AIM. One of its US subsidiaries was targeted.
- **What happened**: A single payment meant for a contractor was diverted, and about £700,000 was sent to a third-party account. The company calls it a "highly sophisticated" cybersecurity incident.
- **Company practices**: The company says it uses industry-standard practices for its technology and payment systems.
- **Company systems**: A leading cybersecurity consultant assessed its IT systems; the company says the incident is contained and operations continue as normal.
- **Impact**: The board says the company has more than sufficient working capital and does not expect this isolated matter to affect ongoing operations.

### Timeline

- **Payment date (not disclosed)**: A single payment to a contractor is sent to a third-party account.
- **Discovery date (not disclosed)**: The company notices the diversion and notifies law enforcement.
- **2026-04-09**: The company discloses the incident through a London Stock Exchange regulatory announcement (RNS 7163Z).

> The facts rely on Zephyr Energy's disclosure (primary). Press coverage (TechCrunch, The Register) repeats the disclosure; we found no further facts. Statements in the coverage that an invoice's bank details were altered, or that this was a typical business email compromise, are inferences. The company has not disclosed the method. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Zephyr Energy**: Says it notified law enforcement immediately on discovery and is working with the corresponding banks and consultants to recover the diverted funds. It says it has added further security layers (details not disclosed). Its consultants continue to monitor its systems.

## 6. Sources

- **Zephyr Energy plc (Primary, regulatory announcement)**: "Cybersecurity incident" (RNS 7163Z, 2026-04-09) — <https://polaris.brighterir.com/public/zephyr_energy/news/rns_widget/story/xo91ymx>
- **TechCrunch (Press)**: "Hacker stole £700,000 from U.K. energy company by redirecting payment" (2026-04-09) — <https://techcrunch.com/2026/04/09/hacker-stole-700000-from-u-k-energy-company-by-redirecting-payment/>
- **The Register (Press)**: "Zephyr Energy loses £700K to contractor payment fraud" (2026-04-09) — <https://www.theregister.com/security/2026/04/09/zephyr-energy-loses-700k-to-contractor-payment-fraud/5226395>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
