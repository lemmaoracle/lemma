---
brief_no: 174
title: "米モービル市：アリーナの施工会社を装う相手に、工事代金が別の口座へ送られた(市の公表と報道)"
title_en: "City of Mobile, Alabama: A payment meant for the arena contractor was sent to an impostor's account (city statements and press)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-10-02
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["158-portland-water-bureau-vendor-bank-change", "160-baltimore-workday-supplier-contact-bank-change", "163-liberty-lookalike-domain-vendor-payment", "170-zephyr-energy-contractor-payment-diverted"]
status: draft
version: "1.0"
og_lead_ja: "米アラバマ州モービル市、アリーナの施工会社を装う相手に 1,470 万ドルが送られる"
og_lead_en: "City of Mobile, Alabama: $14.7M meant for the arena contractor went to an impostor"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "施工会社を装う相手に、\n工事代金が送られた。\n<accent>1,470 万ドル</accent>"
og_headline_en: "A contractor impostor\ngot a city payment.\n<accent>$14.7M went elsewhere.</accent>"
key_figures:
  - value: "$14.7M"
    label: "City funds sent to the side of a party posing as the arena contractor (city statement)"
    tone: "alert"
  - value: "Late May → 10-02"
    label: "From the impostor's first contact with the Finance Department to the city's payment (press account of the council briefing)"
  - value: "10-02 → 10-16"
    label: "From the payment to the finance director finding the money was gone (press)"
glossary:
  - term: "B.L. Harbert International"
    desc: "An Alabama construction company building the City of Mobile's downtown arena (Regions Arena)."
  - term: "Secret Service"
    desc: "A US federal agency. Besides protecting officials, it investigates financial crimes."
insight:
  slug: "invoice-real-account-not-approved"
  stop: true
  label: "Real invoice, unapproved account"
  quote: "Before paying, check the destination account with the vendor's registered contact, not the email or call that made the request."
industries: ["public-sector"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Check bank details sent in a vendor's name through the vendor's registered contact before using them for payment"
  - slug: "hold-unverified"
    item: "Hold payments to accounts that cannot be checked through the registered contact"
  - slug: "audit-trail"
    item: "Record which bank details were used for payment, who checked them, and how"
attack_method: "impersonation"
impact: "$14.7M in city funds went to a party posing as the arena contractor"
takeaway: "A party posing as the arena contractor dealt with the Finance Department for months, then used a payment request built from a genuine invoice to send $14.7M to another account. Check bank details sent in a vendor's name through the vendor's registered contact before paying."
self_check: "When bank details arrive in a vendor's name, do you check them through that vendor's registered contact before using them for payment?"
countries: ["us"]
search_title: "モービル市の振込詐欺：1,470万ドルが別口座へ送られた経緯"
search_description: "米アラバマ州モービル市で、アリーナの施工会社を名乗る相手の依頼により、1,470 万ドル（約 22 億円相当）が別の口座へ送られた（市の公表）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

According to the mayor, the person posed as a legitimate vendor and dealt with employees over months through emails, documents and phone calls. According to the city, its IT systems were not compromised, and this was not the result of an employee clicking a bad link. According to press reports, the payment request was built from a genuine invoice's details. It looked like a routine monthly arena payment. <strong>Even when a payment request carries the same contents as a genuine invoice, it goes to another account unless someone checks that the destination account was approved through the vendor's registered contact.</strong>

## 2. What got through

- **What got through**: A payment request that looked like a regular monthly payment to the arena contractor, B.L. Harbert International. The city processed it on October 2, and $14.7 million went to the fraudster's side (city statement; FOX10 report of the council briefing).
- **The earlier request**: According to the press report, in late May someone posing as a B.L. Harbert representative asked the Finance Department to take note of the company's banking information. Over the following months the person built rapport with employees and had a genuine invoice sent to them. The mayor said the invoice helped the request pass supervisory review (press).
- **What reached the paying side**: In general, the side processing a payment sees the vendor's name, the invoice contents, the amount and the destination account. If the name and contents match a real transaction, only the destination differs. The mayor said "the only difference was where it was going" (press).
- **Not disclosed**: Whether the vendor's bank details were changed in the city's vendor records after the May request, or a different account appeared only in the payment request. The receiving account and bank. Whether any funds were recovered. What the city's new safeguards are.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever pays a vendor checks, before paying, that the destination account was approved by that vendor through its registered contact, not through the email or call that made the request.

- **Who approves**: The vendor. When an account is newly registered or changed, it approves the account through its registered contact (not a contact given in the request's emails, documents or calls).
- **Where it is checked**: Both the step that accepts a vendor's bank details and the approval step before payment. Whatever route the details arrive by, they go through the same check. An account that does not match the approval is not activated, and payments to it are held. This is checked separately from reviewing the invoice.
- **What is recorded**: Which vendor's bank details arrived by which route, and who checked them through which contact before they were used for payment. That record is reviewed before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before using a vendor's bank details for payment, that they were approved through the vendor's registered contact, and keeping a record. Detection means noticing after the payment that the money never arrived. The sequence from May to October 16 relies on press reports of the council briefing.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check bank details through the vendor's registered contact before paying</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>$14.7M went to the fraudster's side<br>City IT systems not compromised (mayor)</span></div>
<div class="rx-zone det"><b>Detection · worked after the payment</b>The contractor asks about nonpayment; the finance director finds the money gone</div>
<div class="rx-g g1"><div class="t">Late May</div><b>An impostor passes on banking information</b></div>
<div class="rx-g g2"><div class="t">Following months</div><b>A genuine invoice reaches the impostor</b></div>
<div class="rx-g g3"><div class="t">10-02</div><b>The city processes the payment</b></div>
<div class="rx-g g4"><div class="t">10-16</div><b>The finance director finds out</b></div>
</div>
</figure>

According to the press report, the contractor asked about nonpayment on October 7 and followed up on October 13. The loss was noticed only after the payment had gone through. Similar cases, where a vendor's payments were pointed at someone posing as the vendor, are the [Portland Water Bureau](/critical/briefs/158-portland-water-bureau-vendor-bank-change/) (bank details switched via a password-reset link) and the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a fake contact was added to a supplier's account).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts vendors' bank details and uses them for payment.** It does not look for intrusions; it checks, before paying, that the destination account was approved through the vendor's registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Local governments and public bodies that pay large monthly amounts to contractors on big projects. Contractor names and project progress are public.
- **Operation · Bank account changes**: Registering and changing bank details that arrive in a vendor's name.
- **Operation · Approval**: Approving payments against invoices.

### Current controls vs Lemma

The route in this case is column 1 (the May request to note banking information) and column 2 (a payment request built from a genuine invoice's details). Whether the city's vendor records were changed has not been disclosed. Column 3 covers a takeover of the vendor's registered contact itself; nothing disclosed says that happened here.

| Control | Request to note banking information | Payment request built from a genuine invoice | Takeover of the vendor's registered contact |
| --- | --- | --- | --- |
| Reviewing invoice contents (supervisory review) | Not relevant | Not effective | Not effective |
| IT system defences | Not relevant | Not relevant | Not relevant |
| Recovery through banks and law enforcement | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Reviewing the invoice cannot tell the request apart, because it was built from a genuine invoice's details (the mayor said the genuine invoice helped it pass review, per the press). IT defences do not apply to this route, since the mayor says the systems were not compromised; a takeover of the vendor's contact also happens outside the city's systems. Recovery through banks and law enforcement acts after the payment, and whether any funds were recovered has not been disclosed. Lemma checks the destination account, not the invoice contents, against the vendor's approval through its registered contact before paying.

Note: Lemma's check works only when it is built into both the step that accepts bank details and the approval step before payment, and the contact used for approval is managed apart from the system that takes requests. Bank details arriving by email, document or phone all go through the same check. It passes if the registered contact itself has been taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about vendor accounts and payments

- When someone asks for a copy of an invoice in a vendor's name, do you confirm they are the vendor's registered contact before sending it?
- Do you hold payments made right after new bank details arrive until the check is complete?
- If a payment is found to have gone to the wrong place, is there a set procedure to contact the bank and law enforcement immediately?

## 5. Facts and timeline

- **Party**: The City of Mobile, Alabama. B.L. Harbert International is building its arena (Regions Arena). The mayor said large projects like the $300 million arena attract fraud (press).
- **Loss**: $14.7 million in city funds went to a fraudulent entity (city). The city says its reserves and other contingencies mean there is no effect on its financial stability, services or capital project timelines.
- **What was confirmed**: According to the mayor, the person posed as a legitimate vendor and dealt with employees through emails, documents and phone calls. The city's IT systems were not compromised, and it was not the result of an employee clicking a bad link. The mayor says nothing suggests an "inside job".
- **Employees**: The city terminated one employee and placed two on paid administrative leave pending further investigation. It will not release their names or positions, citing their safety (city).

### Timeline

- **2026-05 (late)**: Someone posing as a B.L. Harbert representative asks the Finance Department to take note of the company's banking information (press).
- **Following months**: The person builds rapport with employees and has a genuine invoice sent to them (press).
- **2026-08**: A different group's attempt directs money to a false account; employees notice within two days and the city recovers the funds (mayor, press).
- **2026-10-02**: The city processes a payment request that looks like a regular monthly arena payment (press).
- **2026-10-07**: B.L. Harbert asks why it has not been paid, and follows up on October 13 (press).
- **2026-10-16**: The finance director finds the money is gone (press). The city notified the FBI and the Secret Service (city).
- **2026-10-20**: The city announces that $14.7 million was moved to a fraudulent entity.
- **2026-10-26**: The mayor issues an update on the investigation.
- **2026-10-27**: The mayor and the finance director brief the City Council (press).

> The $14.7 million figure, the notification of law enforcement, the statement that IT systems were not compromised, and the personnel actions rely on the city's statements (primary). The sequence from late May, the events of October 2, 7, 13 and 16, and the August attempt rely on FOX10's report of the mayor's and finance director's council briefing. They are not confirmed in city documents. Whether the vendor's bank details were changed in the city's records after the May request has not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **City of Mobile**: Says it will keep working with the FBI and the Secret Service to recover the funds and pursue those responsible. The mayor says final judgment is reserved until independent investigations are complete.
- **City procedures**: According to the press report, the city added safeguards around changes to vendor payment information, which the mayor said would have prevented this fraud (press). Details have not been disclosed.
- **City Council**: A councilman proposed a temporary committee of outside experts, such as certified public accountants, to review city policies. The Finance Committee is due to meet on November 11 and 17 (press).

## 6. Sources

- **City of Mobile (Primary, city statement)**: "City targeted in criminal financial scheme" (2026-10-20) — <https://www.cityofmobile.gov/news/city-targeted-in-criminal-financial-scheme/>
- **City of Mobile (Primary, mayor's statement)**: "Mayor Cheriogotis releases update on ongoing fraud investigation" (2026-10-26) — <https://www.cityofmobile.gov/news/mayor-cheriogotis-releases-update-on-ongoing-fraud-investigation/>
- **FOX10 News (Press, report of the council briefing)**: "$14.7 million fraud against Mobile was months in the making, city officials say" (2026-10-27) — <https://www.fox10tv.com/2026/10/27/147-million-fraud-against-mobile-was-months-making-city-officials-say/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
