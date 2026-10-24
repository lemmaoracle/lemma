---
brief_no: 160
title: "米ボルティモア市：取引先の社員を名乗る偽の担当者が取引先登録に加えられ、振込先が書き換えられた(市の監察官の報告) — 担当者の追加と振込先の変更を、取引先の登録済みの連絡先で照合する層が無い"
title_en: "City of Baltimore: A fake contact posing as a supplier's employee was added to the supplier's account, and its bank account was switched (city Inspector General report) — Nothing checks a new contact or a bank change with the supplier's registered contact"
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
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "偽の担当者が取引先登録に加えられ、\n振込先が書き換えられた。\n<accent>152 万ドルが別の口座へ</accent>"
og_headline_en: "A fake contact was added to a supplier account,\nand the bank account was switched.\n<accent>$1.52M went elsewhere.</accent>"
summary_labels: ["What happened", "Why it went through", "The missing layer"]
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
  quote: "The fake contact was added to the supplier's account without anyone checking with the supplier's registered contact. The bank change submitted from there passed two levels of approval."
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
takeaway: "A fake contact posing as a supplier's employee was added to its account without a check with the supplier, then switched the bank account. Nothing checked either step with the supplier's registered contact."
self_check: "When you add a new contact to a supplier's account, do you confirm it with that supplier's registered contact?"
countries: ["us"]
---

## 1. TL;DR

In February and March 2025 the City of Baltimore, Maryland, sent two payments totaling $1.52 million, owed to a supplier, to an account controlled by someone posing as one of the supplier's employees. The impostor first got added as a supplier contact in Workday, the city's procurement system, then submitted a bank change with a forged voided check; the account was switched on February 19 (city Inspector General report).

A city employee approved the new contact without contacting the supplier (Inspector General). Two more approved the bank change, but the rules at the time required neither a call to the supplier nor a list of its authorized signers.

On March 13 a bank alert tipped off the city and the second payment came back. About $0.8 million from the first had not been recovered at the time of the report. What failed was the layer that checks new contacts and bank changes with the supplier's registered contact.

## 2. What happened

- **Party**: The City of Baltimore's Department of Accounts Payable, under the Comptroller, which handles city payments. Since August 2022 the city has used Workday for procurement and supplier management; suppliers update contacts and bank accounts there. Contact requests are handled by the Bureau of Procurement and by Accounts Payable.
- **Who was impersonated**: A supplier employee. The name on the impostor's request matched that employee, who has no role in the supplier's finances. The email address given was not one the supplier issues to staff.
- **Loss**: $803,384.44 on February 21, 2025 and $721,236.60 on March 10, a total of $1,524,621.04, went to the impostor's account. The second came back. The first had not been recovered at the time of the report. The city filed an insurance claim. The supplier was paid again for both.
- **How it came to light**: On March 13, the bank holding the impostor's account called the city's bank about possible fraud, and the city's finance department was told.
- **Initial access**: How the impostor obtained the supplier employee's details has not been disclosed. The Comptroller's office initially told the press the impostor bypassed the city's geofencing with a Starlink IP address; city IT staff told the Inspector General Starlink played no part in the Workday access.

Per the Inspector General's report, the attack ran as follows.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain, as far as disclosed</span></div>
<p class="rx-ex-cap">The stopping points are ② and ③. Had the new contact and the bank change been checked with the supplier's registered contact, the payments in ④ would not happen. City approvals were in place at ② and ③.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Impostor</div><div class="no">1</div><b>Poses as a supplier employee and asks to be added as a contact</b><p>December 9, 2024. Used an email address the supplier does not issue.</p></div>
<div class="rx-step crit"><div class="who">City</div><div class="no">2</div><b>Approves the request and adds them to the supplier account</b><p>December 11. Some details on the request did not match the record.</p></div>
<div class="rx-step crit"><div class="who">Impostor, city</div><div class="no">3</div><b>Submits a bank change with a forged voided check; it is approved</b><p>One approved on January 10, 2025, then another. Both said they did not recall seeing the voided check. Workday records show city staff switching the account on February 19.</p></div>
<div class="rx-step crit"><div class="who">City</div><div class="no">4</div><b>Sends two payments, $1.52M in all, to the switched account</b><p>February 21 and March 10.</p></div>
<div class="rx-step good"><div class="who">Banks, city</div><div class="no">5</div><b>The receiving bank flags possible fraud</b><p>March 13. The second payment came back.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

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

> The facts rely on the Inspector General's public synopsis and Accounts Payable's response (both primary). The synopsis summarizes a fuller report given to city management. Its timeline graphic dates the request and the addition "Dec. 9, 2025" and "Dec. 11, 2025" and its text dates the voided check "January 4, 2024"; from the sequence, we read these as December 2024 and January 2025.

### After disclosure

- **Inspector General**: Found Accounts Payable had no procedure for verifying supplier contacts and strongly recommended a list of authorized users for each supplier account. Controls created after similar cases in 2020 and 2022 were not being used (Comptroller's office leadership said they were not carried over to Workday). The Inspector General received the complaint about six days after the city learned of the fraud. Also called for staff training and rules requiring immediate reporting of suspected fraud. The matter was referred to law enforcement.
- **Accounts Payable**: Now requires cross-verification with supplier contacts for all banking changes. From August 2025 in Workday: a restricted role for sensitive supplier-profile updates, email alerts to all listed supplier contacts on pending changes, a 48-hour delay with layered reviews for bank-account changes, and flags for rapid, duplicate or unusual profile activity. Talks are under way to add bank-account validation tools.

## 4. Why it wasn't stopped

The failure was not a lack of approvals. **Both the new contact and the bank change were approved, but no procedure required checking with the supplier's registered contact.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking with the supplier's registered contact that adding a contact and changing the bank account really came from that supplier, and keeping a record. Detection means noticing possible fraud after payment.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check contacts and bank changes with the supplier</div>
<div class="rx-zone gapz"><b>Gap</b><span>$1.52M to<br>another account</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>The receiving bank flags possible fraud</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>12-11 fake contact added</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>02-19 bank switched</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>02-21, 03-10 payments</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>03-13 bank alert</b></div>
</div>
</figure>

The city learned of it from the receiving bank; the second payment came back, the first did not. Unless the check goes to the supplier's registered contact, adding approvers does not stop an impostor. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/) (a hotel's payout account was switched in the legitimate admin screen).

## 5. How to counter this

**Activate a new contact on a supplier account, and any bank change, only once confirmed with the supplier's registered contact**, never with the requester or a contact given in the request. Then using a supplier employee's name is not enough to become a contact or change where money goes. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Public sector**: Cities and public bodies with many suppliers. Supplier staff names are visible in public bids and contracts.
- **Operation · Account administration**: Adding people to supplier portals, and what they can do there.
- **Operation · Bank account changes**: Changes to a supplier's bank account, and the documents backing them (voided checks, bank letters).

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Multiple approvers | Partial | Two staff approved the bank change. Without a required check with the supplier, an impostor still passes. |
| Supporting documents | Ineffective | The voided check was forged; both approvers said they did not recall seeing it. Documents can be forged. |
| Supplier self-service portal | Partial | Suppliers enter their own details, but anyone added as a contact also looks like the supplier. |
| Bank fraud detection | Partial | The second payment came back. The alert came too late for the first. |

### What is needed

1. **Treat adding a contact as seriously as a bank change.** Check with the supplier's registered contact before adding anyone to a supplier account.
2. **Activate a bank change only when confirmed with the supplier's registered contact.** Do not decide on a contact given in the request or on attached documents alone.
3. **Record who approved the change, and on what check.** Tie it to the supplier's list of authorized contacts and keep it as proof, so you can later show whose request was checked by whom.

### Checklist

Three things to confirm about supplier accounts

- Do you have, for each supplier, a list of people allowed to change its record?
- Do you check that the email address on a request to add a contact belongs to the supplier?
- When a bank account changes, are all registered supplier contacts notified?

Note: if the supplier's registered contact itself is compromised, this check can be passed. And it protects where payments go; false invoice contents still need separate controls.

## 6. Sources

- **City of Baltimore, Office of the Inspector General (Primary, public synopsis)**: "Public Synopsis of Case #25-0028-I: Fraudster Attempt to Divert $1.5Million of City Funds" (2025-08-27) — <https://s3.amazonaws.com/baltimorecity.gov.if-us-east-1/s3fs-public/2025-10/25-0028-I%20%20R.pdf>
- **City of Baltimore, Comptroller's Office, Accounts Payable (Primary, response to the OIG)**: "Agency Response to OIG Case #25-0028-I" (2025-07-31) — <https://s3.amazonaws.com/baltimorecity.gov.if-us-east-1/s3fs-public/2025-10/OTC%20Response_0.pdf>
- **The Record (Press)**: "Scammer steals $1.5 million from Baltimore by spoofing city vendor" (2025-08-29) — <https://therecord.media/scammer-steals-baltimore-city-impersonation-vendor>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
