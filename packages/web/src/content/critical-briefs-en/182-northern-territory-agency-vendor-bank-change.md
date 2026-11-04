---
brief_no: 182
title: "豪ノーザンテリトリー準州政府の機関：建設会社を装うメールで届いた振込先の変更により、支払いが別の口座へ送られた(豪連邦警察の発表)"
title_en: "Northern Territory Government agency, Australia: A bank-detail change emailed by a construction contractor impostor sent a payment to another account (AFP media release)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-11-07
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["158-portland-water-bureau-vendor-bank-change", "160-baltimore-workday-supplier-contact-bank-change", "174-mobile-alabama-arena-contractor-bank-change", "170-zephyr-energy-contractor-payment-diverted"]
status: draft
version: "1.0"
og_lead_ja: "豪ノーザンテリトリー準州政府の機関、建設会社を装うメールの振込先の変更で 358 万豪ドルを別の口座へ"
og_lead_en: "Northern Territory Government agency: A$3.58M paid to an account from a fake contractor's bank-detail change"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "建設会社を装うメールで、\n振込先が別の口座に。\n<accent>358 万豪ドル（警察）</accent>"
og_headline_en: "A fake builder's form\nredirected a payment.\n<accent>A$3.58M (AFP)</accent>"
key_figures:
  - value: "A$3.58M"
    label: "Paid by the agency to an account it believed was the contractor's (AFP media release)"
    tone: "alert"
  - value: "A$3.57M"
    label: "Recovered after quick action and preventative measures by the bank (AFP media release)"
  - value: "2024-11-07 → 2025-07-27"
    label: "From the fake email to the AFP announcing charges against a man in NSW"
glossary:
  - term: "Business email compromise (BEC)"
    desc: "A scam using email that poses as a business partner or colleague to request a bank-detail change or a transfer."
  - term: "Vendor identification form"
    desc: "A form a supplier uses to register its company details and the bank account it should be paid to."
  - term: "Australian Federal Police (AFP)"
    desc: "Australia's federal police, which investigates cybercrime and crime across state lines."
insight:
  slug: "vendor-form-account-not-approved"
  stop: true
  label: "Complete form, unapproved account"
  quote: "Before paying, check the new bank details on the form with the vendor's registered contact, not the email or form that arrived."
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check bank-detail changes sent in a vendor's name through the vendor's registered contact before using them for payment"
  - slug: "hold-unverified"
    item: "Hold payments to accounts that cannot be checked through the registered contact"
  - slug: "audit-trail"
    item: "Record which bank-detail changes were used for payment, who checked them, and how"
attack_method: "impersonation"
impact: "A$3.58M in agency funds was paid to an account set up by a contractor impostor (A$3.57M recovered)"
takeaway: "An email posing as a construction contractor carried a vendor form with altered bank details, and the agency paid A$3.58M to another account. Check bank-detail changes sent in a vendor's name through the vendor's registered contact before paying."
self_check: "When a bank-detail change arrives in a vendor's name, do you check it through that vendor's registered contact before using it for payment?"
countries: ["au"]
search_title: "豪NT準州政府の振込詐欺：358万豪ドルが別口座へ"
search_description: "豪ノーザンテリトリー準州政府の機関が、建設会社を装うメールの振込先の変更により 358 万豪ドル（約 3.5 億円相当）を別の口座へ支払った（豪連邦警察の発表）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

According to the Australian Federal Police (AFP), the agency received an email in the name of its construction contractor, with a completed vendor identification form carrying new bank details. The agency paid an account it believed belonged to the real contractor.

Other addresses from the company were copied in. The AFP alleges those addresses were created to make the scam look legitimate.

<strong>Even when a bank-detail change arrives complete and in a vendor's name, the payment goes to another account unless someone checks that the account was approved through the vendor's registered contact.</strong>

## 2. What got through

- **What got through**: A vendor identification form with updated bank details, emailed in the name of the agency's construction contractor. The agency then paid A$3,583,363 to an account it believed belonged to the legitimate contractor (AFP).
- **How the email looked**: According to the AFP, the sender appeared to copy in other email addresses from the construction company. Those addresses were allegedly created to make the scam appear legitimate.
- **What reached the receiving side**: In general, whoever processes vendor records sees the vendor's name, the form, the new bank account and the sender's address. If the name and form match the real vendor's, only the account and the sender differ.
- **Not disclosed**: The names of the agency and the contractor. The steps between receiving the form and paying, and the payment date. Whether there was one payment or several. The receiving bank and how it noticed. Any procedures the agency changed afterwards.

## 3. What to check

Whatever the route, the condition for telling them apart is that the vendor's approval of the bank-detail change on the form is checked with its registered contact, not the email or form that arrived, before paying.

- **Who approves**: The vendor. When an account is registered or changed, it approves the account through its registered contact. A contact given in the email or form is not used.
- **Where it is checked**: Both the step that accepts a vendor form and changes the bank details, and the approval step before payment. An account that does not match the vendor's approval is not activated, and payments to it are held. This is separate from reviewing the form's contents or the look of the email.
- **What is recorded**: Which vendor's bank-detail change arrived from which address, and who checked it with which contact before using it for payment. That record is reviewed before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before using a bank-detail change for payment, that it was approved through the vendor's registered contact, and keeping a record. Detection means noticing a fraudulent transaction after the payment. The sequence relies on the AFP media release. The payment date and the date the bank noticed have not been disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check bank-detail changes through the vendor's registered contact before paying</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A$3,583,363 paid to another account<br>A$3,571,760 recovered</span></div>
<div class="rx-zone det"><b>Detection · worked after the payment</b>A bank reports a suspected BEC incident and quick action recovers most of the money</div>
<div class="rx-g g1"><div class="t">2024-11-07</div><b>An email and form in the contractor's name arrive</b></div>
<div class="rx-g g2"><div class="t">Afterwards</div><b>The agency pays another account</b></div>
<div class="rx-g g3"><div class="t">2024-11</div><b>A bank reports; the AFP investigates</b></div>
<div class="rx-g g4"><div class="t">Afterwards</div><b>The bank's action recovers most funds</b></div>
</div>
</figure>

It was the bank, after the payment had gone through, that noticed. Similar cases, where a vendor's payments were pointed at an impostor, are the [Portland Water Bureau](/critical/briefs/158-portland-water-bureau-vendor-bank-change/) (bank details switched via a password-reset link), the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a fake contact was added to a supplier's account) and the [City of Mobile](/critical/briefs/174-mobile-alabama-arena-contractor-bank-change/) (an arena payment went to a contractor impostor).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts vendors' bank-detail changes and uses them for payment.** It does not look for intrusions; it checks, before paying, that the destination account was approved through the vendor's registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Government agencies, local governments and public bodies that pay large sums to construction and other contractors. Contractor names are often public through tenders and contract notices.
- **Operation · Bank account changes**: Vendor forms and bank-detail changes that arrive in a vendor's name.
- **Operation · Account and record admin**: Changing vendor records (company details, contacts, accounts).

### Current controls vs Lemma

The route in this case is column 1 (a bank-detail change form sent in the vendor's name from lookalike addresses). Column 2 covers a takeover of the vendor's registered contact itself; nothing disclosed says that happened here.

| Control | Bank-detail form from lookalike addresses | Takeover of the vendor's registered contact |
| --- | --- | --- |
| Reviewing the email's appearance and the form's contents | Not effective | Not effective |
| Detection and recovery by the bank | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective |

Reviewing the email and the form is hard to rely on here: according to the AFP, the sender appeared to copy in other company addresses created for the scam (police also allege a business resembling the real contractor was registered). Detection and recovery by the bank brought back A$3,571,760 of A$3,583,363 in this case, but it acts after the payment and does not help if noticed too late. Lemma checks the destination account, not the look of the email or form, against the vendor's approval through its registered contact before paying.

Note: Lemma's check works only when it is built into both the step that accepts vendor forms and the approval step before payment, and the contact used for approval is managed apart from the system that takes changes. Forms arriving by email and changes arriving by any other route go through the same check. It passes if the registered contact itself has been taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not recover funds.

### Checklist

Three things to confirm about vendor bank-detail changes and payments

- Do you confirm bank-detail changes through the vendor's registered contact, not a contact given in the email sent in the vendor's name?
- Do you hold payments made right after bank details change until the check is complete?
- If a payment is found to have gone to the wrong place, is there a set procedure to contact the bank and police immediately?

## 5. Facts and timeline

- **Party**: An agency of the Northern Territory Government, Australia (the AFP did not name the agency). The vendor was a construction contractor, also not named.
- **Loss**: The agency paid A$3,583,363 to an account it believed belonged to the legitimate contractor. After quick action and preventative measures by the bank, A$3,571,760 was recovered (AFP).
- **What was confirmed**: According to the AFP, the email to the agency carried a completed vendor identification form with updated bank details. Other company addresses were copied in. The AFP alleges those addresses were created to make the scam appear legitimate.
- **Investigation**: The AFP charged a 38-year-old man from Lurnea, NSW, with dealing with proceeds of crime worth A$1 million or more. Police will allege he registered a business resembling the legitimate contractor, opened the receiving account and withdrew cash on several occasions. These are allegations (AFP).

### Timeline

- **2024-11-07**: The agency receives an email it believes is from its construction contractor, with a vendor form carrying updated bank details (AFP).
- **Afterwards**: The agency pays A$3,583,363 to an account it believes is the contractor's (AFP; date not disclosed).
- **2024-11**: A bank reports a suspected BEC incident and the AFP opens an investigation (AFP).
- **2025-07-23**: Having traced a phone number linked to the vendor form, the AFP searches the man's home and seizes devices and company documents (AFP).
- **2025-07-24**: The man appears in Liverpool Local Court and is granted conditional bail (AFP).
- **2025-07-27**: The AFP announces the charge.

> The amounts paid and recovered, the email and form, and the course of the investigation rely on the AFP media release (primary). The charge reflects police allegations and has not been decided by a court. The agency's and contractor's names, the payment date, and the bank's name and how it noticed have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Australian Federal Police**: Advises confirming any request to change bank details by calling the party on a number you have previously used or independently verified, not a number in the suspicious email, and reporting to your bank and the police immediately if you have fallen victim.
- **Court**: The man was due to appear in Campbelltown Local Court on 17 September 2025 (AFP).

## 6. Sources

- **Australian Federal Police (Primary, police media release)**: "Alleged scammer charged in NSW over $3.5 million fleeced from government agency" (2025-07-27) — <https://www.afp.gov.au/news-centre/media-release/alleged-scammer-charged-nsw-over-35-million-fleeced-government-agency>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
