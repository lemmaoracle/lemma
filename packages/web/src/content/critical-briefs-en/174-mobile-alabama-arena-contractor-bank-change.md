---
brief_no: 174
title: "米モービル市：アリーナの施工会社を装う相手に、工事代金が別の口座へ送られた(市の公表と報道)"
title_en: "City of Mobile, Alabama: A payment meant for the arena contractor was sent to an impostor's account (city statements and press)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-10-02
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["158-portland-water-bureau-vendor-bank-change", "160-baltimore-workday-supplier-contact-bank-change", "163-liberty-lookalike-domain-vendor-payment", "200-logix-aero-lookalike-domain-engine-sale-invoice"]
status: published
version: "1.1"
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
  - value: "05-27 → 10-02"
    label: "From an email asking the Finance Department to change the contractor's account in the city's records to the city processing the payment request (press account of the mayor's remarks)"
  - value: "10-02 → 10-16"
    label: "From the city processing the payment request to the finance director finding the money was gone (press)"
glossary:
  - term: "B.L. Harbert International"
    desc: "An Alabama construction company building the City of Mobile's downtown arena (Regions Arena)."
  - term: "ACH"
    desc: "The US interbank system for electronic account transfers. A payment method separate from wire transfer."
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
takeaway: "A party posing as the arena contractor used lookalike-domain email to ask for the account in the city's records to be changed; months later, a request processed as a regular monthly arena payment sent $14.7M to its side. Check bank details sent in a vendor's name through the vendor's registered contact before paying."
self_check: "When bank details arrive in a vendor's name, do you check them through that vendor's registered contact before using them for payment?"
countries: ["us"]
search_title: "モービル市の振込詐欺：1,470万ドルが別口座へ送られた経緯"
search_description: "米アラバマ州モービル市で、アリーナの施工会社を名乗る相手の依頼により、1,470 万ドル（約 22 億円相当）が別の口座へ送られた（市の公表）。何が起きたか、なぜ通ったか、対策を整理。"
---

> **Revision (v1.1 / 2026-11-13)**: Added the 27 May email asking for the account to be changed, the lookalike domain, the number used for the verification call and the bank's processing on 5 October, from a press report of the mayor's remarks (FOX10, 6 November), and revised sections 1 to 5. Removed the personnel actions and the mayor's remarks assessing employees' checks. Added Logix Aero to the related Briefs.

## 1. Summary

According to press reports, on 27 May an email from someone posing as the arena contractor, B.L. Harbert International, asked the Finance Department to change the company's account in the city's records. The email's domain imitated the genuine one with characters added. On 2 October a request that looked like a regular monthly arena payment was processed, and on 5 October the bank processed the transfer, sending $14.7 million to the impostor's side. It came to light when the real contractor asked why it had not been paid.

According to the city, its IT systems were not compromised, and this was not the result of an employee clicking a bad link. According to the mayor, the person posed as a legitimate vendor and dealt with employees through emails, documents and phone calls. The city is working with the FBI and the Secret Service to recover the funds.

<strong>An email in a vendor's name, even with the genuine logo and phone number, does not show that the account or contact details written in it belong to the vendor.</strong>

## 2. What got through

- **What got through**: A request that looked like a regular monthly arena payment to the contractor, B.L. Harbert International. The city processed it on 2 October; according to the press, the bank processed the transfer on 5 October, and $14.7 million went to the fraudster's side (city statement; FOX10 report).
- **The earlier request**: According to a press report of the mayor's remarks, on 27 May an email reached the Finance Department asking the city to change the contractor's account in its records. The fraudster said the contractor had switched accounts while undergoing an audit, and also asked for payment to move from wire transfer to ACH (the press reports do not say when that request was made). The call to verify the change was made to the direct number listed in the email, not the preapproved vendor number. Citing the audit, the fraudster asked for copies of invoices the contractor had sent before, and the city provided them (press).
- **What reached the accepting side**: In general, the side accepting an account change sees the vendor's name, the sender's address, the new account and a contact for confirmation. According to the press, the emails carried the contractor's genuine logo, website address and phone number; only the domain differed, with characters added to the genuine one. The October request was processed as a regular monthly arena payment.
- **Not disclosed**: When the account in the city's records was changed, and whether the 2 October payment went to the account named in the 27 May email (the press reports do not connect the two). The receiving account and bank. How the fraudster learned of the contractor's logo and its dealings with the city. How much has been recovered.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever pays a vendor checks, before paying, that the destination account was approved by that vendor through its registered contact, not through the email or call that made the request.

- **Who approves**: The vendor. When an account is newly registered or changed, it approves the account through its registered contact. Numbers or addresses given in the request's emails, documents or calls are not used.
- **Where it is checked**: Both the step that accepts a vendor's bank details and the approval step before payment. Whatever route the details arrive by, they go through the same check. An account that does not match the approval is not activated, and payments to it are held. This is checked separately from reviewing the invoice.
- **What is recorded**: Which vendor's bank details arrived by which route, and who checked them through which contact before they were used for payment. That record is reviewed before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before using a vendor's bank details for payment, that they were approved through the vendor's registered contact, and keeping a record. Detection means noticing after the payment that the money never arrived. Dates are in 2026 and rely on press reports of the mayor's and finance director's remarks to the council and to reporters.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check bank details through the vendor's registered contact before paying</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>$14.7M went to the fraudster's side<br>City IT systems not compromised (mayor)</span></div>
<div class="rx-zone det"><b>Detection · worked after the payment</b>The contractor asks about nonpayment; the finance director finds the money gone</div>
<div class="rx-g g1"><div class="t">05-27</div><b>A lookalike-domain email asking for an account change reaches the Finance Department</b></div>
<div class="rx-g g2"><div class="t">10-02</div><b>The city processes a request that looks like a monthly payment</b></div>
<div class="rx-g g3"><div class="t">10-07</div><b>The contractor asks why it has not been paid</b></div>
<div class="rx-g g4"><div class="t">10-16</div><b>The finance director finds the money is gone</b></div>
</div>
</figure>

The city noticed only after the payment had gone through. A case where a lookalike-domain email named another account is [Logix Aero](/critical/briefs/200-logix-aero-lookalike-domain-engine-sale-invoice/) (a party inside a sale's emails rewrote the account in the contracts and invoices). Here, the payer was a local government, a request to change the account in the vendor's records came first, and a request that looked like a regular monthly payment was processed later. Cases where a vendor's payments were pointed at someone posing as the vendor also include the [Portland Water Bureau](/critical/briefs/158-portland-water-bureau-vendor-bank-change/) (bank details switched via a password-reset link) and the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a fake contact was added to a supplier's account).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that accepts vendors' bank details and uses them for payment.** It does not look for intrusions; it checks, before paying, that the destination account was approved through the vendor's registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Local governments and public bodies that pay large monthly amounts to contractors on big projects. Contractor names and project progress are public.
- **Operation · Bank account changes**: Registering and changing bank details and payment methods that arrive in a vendor's name.
- **Operation · Approval**: Approving payments against invoices.

### Current controls vs Lemma

The route in this case is column 1 (the 27 May request to change the account in the city's records) and column 2 (a request that looked like a regular monthly arena payment). It has not been reported when the city's records were changed after the request. Column 3 covers a request sent from the vendor's genuine mailbox after a takeover; according to the press, the email here came from a lookalike domain.

| Control | Request to change the account in the city's records | Request that looked like a monthly payment | Takeover of the vendor's mailbox |
| --- | --- | --- | --- |
| Sender checks (domain display, warnings) | Partial | Not relevant | Not effective |
| Reviewing invoice contents (supervisory review) | Not relevant | Not effective | Not effective |
| Recovery through banks and law enforcement | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

Sender checks flag a domain with added characters through a display or warning, but when the logo and phone number match the genuine ones, telling them apart is left to the recipient. Reviewing the invoice is unlikely to tell the request apart, because it looked like a regular monthly arena payment and copies of genuine invoices had reached the fraudster. Recovery through banks and law enforcement acts after the payment, and how much has been recovered has not been disclosed. Lemma checks the destination account, not the invoice contents, against the vendor's approval through its registered contact before paying.

Note: Lemma's check works only when it is built into both the step that accepts bank details and the approval step before payment, and the contact used for approval is registered apart from the requesting email. If confirmation uses a number written in the requesting email, or the registered contact itself has been changed, it can pass. If the vendor's mailbox is taken over, it works when confirmation does not go through that mailbox, and can pass when it does. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusion or impersonation, and it does not recover funds already sent.

### Checklist

Three things to confirm about vendor accounts and payments

- When someone asks for a copy of an invoice in a vendor's name, do you confirm they are the vendor's registered contact before sending it?
- Do you hold payments made right after new bank details arrive until the check is complete?
- If a payment is found to have gone to the wrong place, is there a set procedure to contact the bank and law enforcement immediately?

## 5. Facts and timeline

- **Party**: The City of Mobile, Alabama. B.L. Harbert International is building its arena (Regions Arena). The mayor said large projects like the $300 million arena attract fraud (press).
- **Loss**: $14.7 million in city funds went to a fraudulent entity (city). The city says its reserves and other contingencies mean there is no effect on its financial stability, services or capital project timelines.
- **What was confirmed**: According to the mayor, the person posed as a legitimate vendor and dealt with employees through emails, documents and phone calls. The city's IT systems were not compromised, and it was not the result of an employee clicking a bad link. The mayor says nothing suggests an "inside job".
- **The account-change request**: According to the press, the 27 May email asked for the account in the city's records to be changed. The fraudster said the contractor had switched accounts while undergoing an audit, and also asked for payment to move from wire transfer to ACH (the press reports do not say when that request was made). The email's domain had characters added to the genuine one, while the logo, website address and phone number matched the genuine ones. The call to verify the change was made to the direct number listed in the email (mayor's remarks, press).
- **Route of intrusion**: According to the city, its IT systems were not compromised. According to the press, the fraudster asked for the invoice copies citing the audit, and the city provided them. How the fraudster learned of the contractor's dealings with the city has not been disclosed.

### Timeline

- **2026-05-27**: An email reaches the Finance Department asking for the contractor's account in the city's records to be changed (press).
- **Following months**: The fraudster builds rapport with employees and, citing the audit, asks for copies of the contractor's past invoices, which the city provides (press).
- **2026-08**: A different group's attempt (over $900,000) directs money to a false account; employees notice within two days and the city recovers the funds (mayor, press).
- **2026-10-02**: The city processes a request that looks like a regular monthly arena payment (press).
- **2026-10-05**: The bank processes the transfer (press).
- **2026-10-07**: B.L. Harbert asks why it has not been paid, and follows up on 13 October (press).
- **2026-10-16**: The finance director finds the money is gone (press). The city notified the FBI and the Secret Service (city).
- **2026-10-20**: The city announces that $14.7 million was moved to a fraudulent entity.
- **2026-10-26**: The mayor issues an update on the investigation.
- **2026-10-27**: The mayor and the finance director brief the City Council (press).
- **2026-11-06**: The mayor describes the sequence, including the 27 May email, to reporters (press).

> The $14.7 million figure, the notification of law enforcement and the statement that IT systems were not compromised rely on the city's statements (primary). The events of 2, 7, 13 and 16 October rely on FOX10's report of the mayor's and finance director's council briefing (27 October). The 27 May email, the lookalike domain, the verification call, the processing on 5 October and the size of the August attempt rely on FOX10's report of the mayor's remarks (6 November). None of these is confirmed in city documents. When the account in the city's records was changed, and which account received the 2 October payment, have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the city's response.

### After disclosure

- **City of Mobile**: Says it will keep working with the FBI and the Secret Service to recover the funds and pursue those responsible. The mayor says final judgment is reserved until independent investigations are complete.
- **City procedures**: According to the press, the city added safeguards around changes to vendor payment information. Some transactions now need further verification up to the finance director, and payments over $1 million are made by hand-delivered cheque (press).
- **City Council**: A council member proposed a temporary committee of outside experts, such as certified public accountants, to review city policies. The Finance Committee is due to meet on 11 and 17 November (press).

## 6. Sources

- **City of Mobile (Primary, city statement)**: "City targeted in criminal financial scheme" (2026-10-20) — <https://www.cityofmobile.gov/news/city-targeted-in-criminal-financial-scheme/>
- **City of Mobile (Primary, mayor's statement)**: "Mayor Cheriogotis releases update on ongoing fraud investigation" (2026-10-26) — <https://www.cityofmobile.gov/news/mayor-cheriogotis-releases-update-on-ongoing-fraud-investigation/>
- **FOX10 News (Press, report of the council briefing)**: "$14.7 million fraud against Mobile was months in the making, city officials say" (2026-10-27) — <https://www.fox10tv.com/2026/10/27/147-million-fraud-against-mobile-was-months-making-city-officials-say/>
- **FOX10 News (Press)**: Report on the mayor's briefing to reporters (2026-11-06) — <https://www.fox10tv.com/2026/11/06/employees-mobile-fraud-case-should-have-spotted-subtle-differences-email-addresses-mayor-says/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
