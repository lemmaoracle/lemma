---
brief_no: 185
title: "Studco：仕入先を装ったメールの口座へ代金が送られ、受取の銀行は責任を負わないとされた(米第 4 巡回区控訴裁判所の判決)"
title_en: "Studco: Payments went to an account named by a party posing as its supplier, and the receiving bank was held not liable (US Fourth Circuit ruling)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-03-26
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["163-liberty-lookalike-domain-vendor-payment", "176-modalis-subsidiary-vendor-email-takeover", "177-ovid-therapeutics-partner-email-compromise-payment", "174-mobile-alabama-arena-contractor-bank-change"]
status: draft
version: "1.0"
og_lead_ja: "米 Studco、仕入先を装ったメールの口座へ 4 回の ACH で 55.9 万ドル。控訴裁は、名義が違っても受取の銀行は責任を負わないと判断"
og_lead_en: "Studco: $559K went by ACH to an account named by a fake supplier; the Fourth Circuit held the receiving bank not liable for the name mismatch"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE DOMAIN"
og_headline_ja: "仕入先を装った口座へ\n4 回、代金が出た。\n<accent>55.9 万ドル、銀行は免責</accent>"
og_headline_en: "Paid to a fake supplier\naccount, four times.\n<accent>$559K; court clears bank</accent>"
key_figures:
  - value: "$559K"
    label: "Total of four ACH payments sent to what Studco believed was its supplier's account (court's account: $558,868.71). Not recovered"
    tone: "alert"
  - value: "10-01 → 11-21"
    label: "From the first email announcing the bank change to the receiving bank learning of the scam (2018, per the opinion)"
  - value: "03-26 → 10-06"
    label: "From the Fourth Circuit rejecting the receiving bank's liability to the Supreme Court denying review (2025)"
glossary:
  - term: "ACH"
    desc: "The US system through which banks process debits and credits electronically and automatically in bulk. Per the opinion, it handles over 33 billion transfers and over $86 trillion a year."
  - term: "UCC Article 4A, § 4A-207"
    desc: "The part of the Uniform Commercial Code governing funds transfers. Section 4A-207 covers payment orders whose beneficiary name and account number refer to different persons (misdescription of beneficiary). Virginia adopted it as § 8.4A-207."
  - term: "Certiorari denied"
    desc: "The US Supreme Court declining to review a lower court's decision, which then stands."
insight:
  slug: "receiving-bank-reads-the-number"
  stop: true
  label: "The receiving bank deposits by number"
  quote: "Before transferring to a changed account, check that account with the vendor's registered contact, not the email that delivered it."
industries: ["manufacturing", "finance"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Confirm a vendor's bank account change with the vendor through a registered contact other than the email that delivered it"
  - slug: "hold-unverified"
    item: "Hold payments to a changed account until the vendor's confirmation is in hand"
  - slug: "audit-trail"
    item: "Record which account change was used for payment, who checked it, and how"
attack_method: "impersonation"
impact: "$559K was sent in four ACH payments to an account named by a party posing as the supplier, and was not recovered (per the opinion)"
takeaway: "An email posing as a supplier changed the payee account, and four payments landed in someone else's account. The Fourth Circuit held the receiving bank liable only if it actually knew of the name–number mismatch. Check that name and account match before sending."
self_check: "When a vendor sends a bank account change, do you check that the account is the vendor's yourself, without relying on the receiving bank to match the name?"
countries: ["us"]
---

## 1. Summary

Each payment was deposited into the account number written on the payment order. The account belonged not to the supplier but to an individual customer of the receiving credit union.

Per the opinion, the credit union's system generated a name-mismatch warning for every deposit, but such warnings ran to hundreds or thousands a day and no one read them. The Fourth Circuit held that under the Uniform Commercial Code (UCC) a beneficiary's bank may rely on the account number and is not liable unless it actually knew that the name and number did not match. The Supreme Court declined review, so that holding stands.

<strong>A receiving bank may deposit by account number alone and will not necessarily stop a deposit when the name differs. Whether the name and account belong to the real vendor is for the paying side to check before sending.</strong>

## 2. What got through

- **What got through**: Four ACH transfers that Studco ordered as payment of invoices from its supplier, Olympic Steel. The beneficiary was named as "Olympic Steel Inc", and the account was one at 1st Advantage Federal Credit Union given in emails posing as the supplier. The total was $558,868.71 (per the opinion).
- **What reached the receiving side**: Per the opinion, the beneficiary's bank deposits ACH orders automatically by account number, without anyone reading the order. When the name differs from the account holder, its system generates a warning, but it notified no one, and the reports were not reviewed as a matter of course. On the paying side, per the opinion, emails in the name of the supplier's account manager announced a bank change and supplied new account details.
- **Not disclosed**: How Studco's email system was intruded upon. The date and amount of each of the four transfers (the opinion says payments began a few days after the first email). How the account change was registered and approved internally. What happened after remand, and whether Studco sought recovery from its own bank or others.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the paying side checks, before transferring, that a changed account is the vendor's, through the vendor's registered contact and not the email that arrived. It cannot rely on the receiving bank to match the name.

- **Who approves**: The vendor. It approves the account change through its registered contact. That contact is one registered beforehand, such as a registered phone number or a signature with the vendor's key, not the email that delivered the change or a number written in it.
- **Where it is checked**: The step that changes a payee account, and the approval before the first transfer to a changed account. Accounts that cannot be matched to the vendor's approval are held and not used for payment.
- **What is recorded**: Which account change was used for payment, who checked it, and how, so you can show what was checked before sending for recovery, investigation, insurance or litigation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a change to a vendor's bank account through a registered contact other than the email that delivered it before using it for payment. Detection means noticing the scheme after the transfer. The ruling dealt with the receiving bank's liability. Dates are in 2018, per the majority and concurring opinions.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · on the paying side</b>Check the account change with the vendor through a contact other than the email, then pay</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Emails posing as the supplier changed the account<br>$559K in four payments went to someone else</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfers</b>Mismatch warnings were generated but unread; the scam surfaced when the sender reported it</div>
<div class="rx-g g1"><div class="t">10-01</div><b>Emails posing as the supplier announce a bank change</b></div>
<div class="rx-g g2"><div class="t">10-04</div><b>A deposit report shows a name-mismatch warning</b></div>
<div class="rx-g g3"><div class="t">11-13</div><b>Last deposit (per the concurrence)</b></div>
<div class="rx-g g4"><div class="t">11-21</div><b>The receiving bank learns of the scam from Studco's president</b></div>
</div>
</figure>

The name mismatch was recorded by the receiving bank's system with each deposit, but it was not tied to any step that would stop a transfer. A similar case where a lookalike domain led to a payment is the [City of Liberty](/critical/briefs/163-liberty-lookalike-domain-vendor-payment/) (an invoice arrived from a domain made to look like a vendor's). Cases where email exchanges with a counterparty were taken over are [Modalis](/critical/briefs/176-modalis-subsidiary-vendor-email-takeover/) and [Ovid Therapeutics](/critical/briefs/177-ovid-therapeutics-partner-email-compromise-payment/) (a payment went to a party posing as a development partner).

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that changes a vendor's bank account and the approval before a transfer is carried out.** It does not look for intrusions or impersonating emails; it confirms on the paying side, before the transfer, that a changed account is one that could be matched to the vendor's approval.

### Industries and operations to watch

- **Industry · Manufacturing**: Companies that pay long-standing suppliers by ACH or transfer for each invoice. Per the opinion, the two companies had done business for over nine years.
- **Industry · Finance**: Banks and credit unions that, as the beneficiary's bank, deposit automatically by account number. Decide who looks at name-mismatch warnings, and when.
- **Operation · Bank account changes**: Registering and changing vendors' payee accounts.
- **Operation · Approval**: Approving the first transfer to a changed account.

### Current controls vs Lemma

The route in this case ran through column 1 (an account change delivered by emails posing as the supplier) and column 2 (transfers to the changed account), and ended in column 3 (deposit at the receiving bank) into an account in another name. Column 4 is the intrusion into the sender's email system that the court described.

| Control | Account change request | Transfer to the changed account | Deposit at the receiving bank | Intrusion into the sender's email |
| --- | --- | --- | --- | --- |
| Checking the sender (domain, signature) | Partial | Not applicable | Not applicable | Not effective |
| Transfer approval (checking the contents) | Not applicable | Partial | Not applicable | Not effective |
| Receiving bank's name matching (automatic warnings) | Not applicable | Not applicable | Partial | Not applicable |
| **Lemma (pre-execution check)** | Effective | Effective | Not applicable | Not effective |

Checking the sender is hard when a domain is made to resemble the real one. Transfer approval cannot tell a request apart by its contents when the beneficiary name and amount match a real transaction. As for the receiving bank's name matching, per the opinion the warnings were generated but no one was notified, and under the UCC the bank had no duty to check. Lemma does not work on the receiving bank's side and does not deal with the intrusion into the sender's email; it confirms on the paying side, before the transfer, that a changed account could be matched to the vendor's approval.

Note: Lemma's check works only when it is built into the step that changes accounts and the approval before transfer, with the vendor's approval received through a registered contact or key other than the email that delivered the change. It can be passed if the registered contact itself has been altered, or if the check uses a contact given in the change email. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about payments to vendors

- Do you have a step that holds the first payment to a newly changed account before it is carried out?
- Do you have a step that confirms a vendor's account change through a contact registered beforehand, not one given in the email that delivered it?
- If a scheme is found after a transfer, is there a set procedure to contact your bank, the receiving bank and law enforcement immediately?

## 5. Facts and timeline

- **Parties**: Studco Building Systems US, LLC, a metal fabricator in Webster, New York, and 1st Advantage Federal Credit Union in Newport News, Virginia. The supplier was Olympic Steel, Inc., in northern Ohio.
- **What happened**: Per the opinion, someone who had intruded into Studco's email system sent emails in the name of an Olympic account manager announcing a bank change and naming an account at 1st Advantage as the new payee. The emails came from olysteel.net, not Olympic's actual domain, olysteel.com. Studco sent its next four invoice payments to that account.
- **Receiving account**: The account belonged not to Olympic but to a longtime individual customer of 1st Advantage. Per the opinion, that customer had also been drawn into the scam through a job advertisement and believed the deposits and withdrawals were legitimate business.
- **The bank's system**: 1st Advantage's DataSafe system automatically generated a report with a warning for each ACH deposit whose beneficiary name differed from the account holder. Per the opinion, such warnings ran to hundreds or thousands a day, notified no one, and were not reviewed as a matter of course. The warnings for the four deposits were not read before the scam came to light.
- **Impact**: The FBI investigated and concluded the scam originated in the Near East or North Africa. The scammers were never identified and none of the money was recovered. Studco paid Olympic again for the four invoices and bore the loss (per the opinion).
- **Trial court**: The US District Court for the Eastern District of Virginia found for Studco on its misdescription (§ 8.4A-207) and bailment claims and awarded $558,868.71 plus attorneys' fees and costs. It denied punitive damages.
- **Court of appeals**: The majority held that a beneficiary's bank may rely on the account number and is not liable unless it had actual knowledge that the name and number did not match. It held that the trial court erred in treating what could have been known with due diligence as actual knowledge, rejected the bailment claim, and remanded with instructions to enter judgment for 1st Advantage.
- **Concurrence**: Judge Wynn agreed with the result but said a factfinder could infer that a bank employee gained actual knowledge of the mismatch, through an October investigation, before the two November deposits. He would instead rest on privity: Studco must seek recovery from its own bank and cannot recover directly from 1st Advantage.

### Timeline

- **2018-10-01**: An email in the name of an Olympic account manager announces a bank change. In response to a Studco employee's reply, the new account details arrive (per the opinion).
- **2018-10-04**: 1st Advantage's system automatically shows a name-mismatch warning on a deposit report (record cited in the concurrence).
- **2018-10-25**: Two overseas wire attempts from the receiving account trigger a US sanctions (OFAC) alert, and 1st Advantage cancels them (concurrence).
- **2018-11-05**: A further deposit reaches the receiving account (concurrence; the two November deposits exceeded $150,000).
- **2018-11-13**: The last deposit reaches the receiving account (concurrence).
- **2018-11-21**: 1st Advantage first learns of the scam from Studco's president (per the opinion).
- **2023-01-12**: The district court enters judgment for Studco.
- **2025-03-26**: The Fourth Circuit reverses (opinion amended on 2 April).
- **2025-04-22**: The Fourth Circuit denies rehearing (per the Supreme Court docket).
- **2025-10-06**: The Supreme Court denies Studco's petition for certiorari (No. 25-80).

> The facts rely on the US Court of Appeals for the Fourth Circuit's opinion (primary) and the US Supreme Court docket (primary). The events of 4 and 25 October and 5 and 13 November rely on the record cited in Judge Wynn's concurrence. The majority does not give these dates. How the email system was intruded upon and how the account change was handled internally have not been disclosed. The ruling's conclusion concerns the receiving bank's liability. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Fourth Circuit**: Reversed the district court and remanded with instructions to enter judgment for 1st Advantage, and affirmed the denial of punitive damages. Banking industry groups (The Clearing House, Nacha and credit union associations) had filed amicus briefs supporting 1st Advantage.
- **1st Advantage**: Per the opinion, in July 2019 it replaced the vendor of the system that monitored account activity and issued alerts with one offering broader coverage.
- **Studco**: Petitioned the Supreme Court, which denied review on 6 October 2025.

## 6. Sources

- **US Court of Appeals for the Fourth Circuit (Primary, opinion)**: "Studco Building Systems US, LLC v. 1st Advantage Federal Credit Union, Nos. 23-1148, 23-1766" (2025-03-26, amended 2025-04-02) — <https://www.ca4.uscourts.gov/opinions/231148.P.pdf>
- **Supreme Court of the United States (Primary, docket)**: "Docket No. 25-80, Studco Building Systems US, LLC v. 1st Advantage Federal Credit Union" (2025-10-06) — <https://www.supremecourt.gov/docket/docketfiles/html/public/25-80.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
