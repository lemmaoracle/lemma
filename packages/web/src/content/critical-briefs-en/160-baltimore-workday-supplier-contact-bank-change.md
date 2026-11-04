---
brief_no: 160
title: "米ボルティモア市：取引先の社員を名乗る偽の担当者が取引先登録に加えられ、振込先が書き換えられた(市の監察官の報告)"
title_en: "City of Baltimore: A fake contact posing as a supplier's employee was added to the supplier's account, and its bank account was switched (city Inspector General report)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-02-21
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "米ボルティモア市、偽の担当者に取引先の振込先を書き換えられ 152 万ドルが別口座へ"
og_lead_en: "City of Baltimore: a fake supplier contact switched the bank account, and $1.52M went elsewhere"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "偽の担当者が取引先登録に加えられ、\n振込先が書き換えられた。\n<accent>152 万ドルが別の口座へ</accent>"
og_headline_en: "A fake contact was added to a supplier account,\nand the bank account was switched.\n<accent>$1.52M went elsewhere.</accent>"
key_figures:
  - value: "$1.52M"
    label: "Two payments owed to a supplier went to the fake contact's account. About $0.8M had not been recovered at the time of the report (city Inspector General)"
    tone: "alert"
  - value: "12-09 → 02-19"
    label: "From the fake contact's request to join the supplier account to the bank account being switched (city Inspector General)"
  - value: "2 levels"
    label: "of approval on the bank change. Checking with the supplier was not required by procedure (city Inspector General)"
glossary:
  - term: "Workday"
    desc: "A cloud service for HR and procurement. Since 2022 Baltimore has used it for suppliers to view invoices and payments and to update contacts and bank accounts."
  - term: "Voided check"
    desc: "A check marked VOID so it cannot be cashed. In the US it is often attached to bank-account registrations as proof of the account number."
  - term: "Office of the Inspector General (OIG)"
    desc: "An independent city office that investigates fraud and waste in city government and publishes public synopses of its findings."
insight:
  slug: "contact-added-without-supplier-check"
  label: "Contacts added without checking with the supplier"
  quote: "A request from someone added to a supplier account, even approved several times, cannot be told apart from the supplier's own unless it is checked with the supplier's registered contact."
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check with the supplier's registered contact even when adding a person to the supplier's account"
  - slug: "hold-unverified"
    item: "Do not pay to a bank change you could not confirm"
  - slug: "audit-trail"
    item: "Record who approved the change, and on what check"
attack_method: "impersonation"
impact: "$1.52M in supplier payments went to the fake contact's account; about $0.8M was not recovered"
takeaway: "A fake contact posing as a supplier's employee was added to its account without a check with the supplier, then switched the bank account. Activate a new contact and a bank change only once confirmed with the supplier's registered contact."
self_check: "When you add a new contact to a supplier's account, do you confirm it with that supplier's registered contact?"
countries: ["us"]
---

## 1. Summary

The city approved both the new contact and the bank change. But the rules at the time required neither a call to the supplier nor a list of its authorized signers (city Inspector General). Adding approvers does not help if the check does not go to the supplier's registered contact; an impostor passes as is. <strong>A request from someone added to a supplier account, even approved several times, cannot be told apart from the supplier's own unless it is checked with the supplier's registered contact.</strong>

## 2. What got through

- **What got through**: Adding a contact to the supplier's account in Workday, and the bank change that contact then submitted. A city employee approved the contact without contacting the supplier, and two more approved the bank change (city Inspector General).
- **What reached the receiving side**: In general, an action by someone added to the account arrives as the supplier's own. Supporting documents such as a forged voided check can also be indistinguishable from real ones to the approver. Here, both approvers said they did not recall seeing the voided check.
- **Not disclosed**: How the impostor obtained the supplier employee's details.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever adds a contact to a supplier account, and whoever activates a bank change, checks before it takes effect that the request came from the supplier, through the supplier's registered contact rather than the requester or a contact given in the request.

- **Who approves**: The supplier, through its registered contact, for adding a contact and for changing the bank account. The supplier has a list of authorized contacts (the Inspector General strongly recommended building one).
- **Where it is checked**: The part of the supplier system that activates a new contact and a bank change. Both are checked at one point before they take effect. A change that cannot be checked is not activated and is not used for payment.
- **What is recorded**: Whose request was checked by whom, through which contact, tied to the supplier's list of authorized contacts.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a new contact or a bank change takes effect, that the request came from the supplier through its registered contact, and keeping a record. Detection means noticing possible fraud after payment. The dates below are those confirmed or disclosed by the Inspector General and others.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not required by the rules at the time (Inspector General)</b>Check with the supplier's registered contact before it takes effect</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Two payments, $1.52M, to another account<br>The second came back to the city</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The receiving bank flags possible fraud</div>
<div class="rx-g g1"><div class="t">12-11</div><b>Fake contact added</b></div>
<div class="rx-g g2"><div class="t">02-19</div><b>Bank account switched</b></div>
<div class="rx-g g3"><div class="t">02-21, 03-10</div><b>Two payments</b></div>
<div class="rx-g g4"><div class="t">03-13</div><b>Bank alerts the city</b></div>
</div>
</figure>

The city learned of it from the receiving bank; the second payment came back, and the first had not been recovered at the time of the report. A similar case, where a payout account was switched in the legitimate admin screen, is [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that activates a new contact and a bank change.** It does not look for intrusions; it checks, before activation, that the request came from the supplier, through its registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Cities and public bodies with many suppliers. Supplier staff names are visible in public bids and contracts.
- **Operation · Account administration**: Adding people to supplier portals, and what they can do there.
- **Operation · Bank account changes**: Changes to a supplier's bank account, and the documents backing them (voided checks, bank letters).

### Current controls vs Lemma

The route in this case is column 1 (adding a contact) and column 2 (the bank change that contact submitted). Column 3 is where the supplier's registered contact itself has been taken over; whether that was so here has not been disclosed.

| Control | Adding a contact | Bank change | Supplier's registered contact itself taken over |
| --- | --- | --- | --- |
| Multiple approvers | Partial | Partial | Not effective |
| Supporting documents | Not relevant | Not effective | Not effective |
| Supplier self-service portal | Partial | Partial | Not effective |
| Bank fraud detection | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Adding approvers does not stop an impostor if no check with the supplier is required. The voided check was forged, and both approvers said they did not recall seeing it. A portal where suppliers enter their own details also makes input from someone added as a contact look like the supplier's. Bank detection brought the second payment back, but the alert came too late for the first. Lemma checks adding a contact and the bank change against the supplier's registered contact before they take effect.

Note: Lemma's check works only when it is built into the system that activates both new contacts and bank changes, every request is checked against the same registered contact, and that contact is managed apart from the system that receives the request. It passes if the supplier's registered contact itself has been taken over. The check protects where payments go; false invoice contents still need separate controls. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about supplier accounts

- Do you have, for each supplier, a list of people allowed to change its record?
- Do you check that the email address on a request to add a contact belongs to the supplier?
- When a bank account changes, are all registered supplier contacts notified?

## 5. Facts and timeline

- **Party**: The City of Baltimore's Department of Accounts Payable, under the Comptroller, which handles city payments. Since August 2022 the city has used Workday for procurement and supplier management; suppliers update contacts and bank accounts there. Contact requests are handled by the Bureau of Procurement and by Accounts Payable.
- **Who was impersonated**: A supplier employee. The name on the impostor's request matched that employee, who has no role in the supplier's finances. The email address given was not one the supplier issues to staff.
- **Loss**: $803,384.44 on February 21, 2025 and $721,236.60 on March 10, a total of $1,524,621.04, went to the impostor's account. The second came back. The first had not been recovered at the time of the report. The city filed an insurance claim. The supplier was paid again for both.
- **How it came to light**: On March 13, the bank holding the impostor's account called the city's bank about possible fraud, and the city's finance department was told.
- **Initial access**: How the impostor obtained the supplier employee's details has not been disclosed. The Comptroller's office initially told the press the impostor bypassed the city's geofencing with a Starlink IP address; city IT staff told the Inspector General Starlink played no part in the Workday access.

### Timeline

- **2024-12-09**: The impostor, posing as a supplier employee, asks to be added as a contact.
- **2024-12-11**: A city employee approves the request and adds the impostor to the supplier account. From that day the impostor tries several times to change the bank account.
- **2025-01-04**: The impostor submits a bank change with a forged voided check in the supplier's name.
- **2025-01-10**: A city employee approves the change submitted on January 7; another then approves it (date not given).
- **2025-01-31**: The impostor emails the city asking about an invoice and to switch the bank account (again on February 5).
- **2025-02-19**: After the impostor's emailed requests, Workday records show a city employee switching the supplier's bank account to the impostor's.
- **2025-02-21**: $803,384.44 goes to the impostor's account.
- **2025-03-10**: $721,236.60 goes out; it is later returned to the city.
- **2025-03-13**: The bank holding the impostor's account alerts the city's bank to possible fraud.
- **2025-03-19**: The Inspector General receives a complaint.
- **2025-07-31**: Accounts Payable responds to the Inspector General's report.
- **2025-08-27**: The Inspector General publishes a public synopsis.

> The facts rely on the Inspector General's public synopsis and Accounts Payable's response (both primary). The synopsis summarizes a fuller report given to city management. Its timeline graphic dates the request and the addition "Dec. 9, 2025" and "Dec. 11, 2025" and its text dates the voided check "January 4, 2024"; from the sequence, we read these as December 2024 and January 2025. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Inspector General**: Found Accounts Payable had no procedure for verifying supplier contacts and strongly recommended a list of authorized users for each supplier account. Controls created after similar cases in 2020 and 2022 were not being used (Comptroller's office leadership said they were not carried over to Workday). The Inspector General received the complaint about six days after the city learned of the fraud. Also called for staff training and rules requiring immediate reporting of suspected fraud. The matter was referred to law enforcement.
- **Accounts Payable**: Now requires cross-verification with supplier contacts for all banking changes. From August 2025 in Workday: a restricted role for sensitive supplier-profile updates, email alerts to all listed supplier contacts on pending changes, a 48-hour delay with layered reviews for bank-account changes, and flags for rapid, duplicate or unusual profile activity. Talks are under way to add bank-account validation tools.

## 6. Sources

- **City of Baltimore, Office of the Inspector General (Primary, public synopsis)**: "Public Synopsis of Case #25-0028-I: Fraudster Attempt to Divert $1.5Million of City Funds" (2025-08-27) — <https://s3.amazonaws.com/baltimorecity.gov.if-us-east-1/s3fs-public/2025-10/25-0028-I%20%20R.pdf>
- **City of Baltimore, Comptroller's Office, Accounts Payable (Primary, response to the OIG)**: "Agency Response to OIG Case #25-0028-I" (2025-07-31) — <https://s3.amazonaws.com/baltimorecity.gov.if-us-east-1/s3fs-public/2025-10/OTC%20Response_0.pdf>
- **The Record (Press)**: "Scammer steals $1.5 million from Baltimore by spoofing city vendor" (2025-08-29) — <https://therecord.media/scammer-steals-baltimore-city-impersonation-vendor>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
