---
brief_no: 176
title: "モダリス：製造委託先の担当者の正規のメールから、実在の取引の請求が届き、子会社が犯人の口座へ送金した(同社の開示)"
title_en: "Modalis: An invoice for a real job arrived from a manufacturing contractor's genuine email account, and the subsidiary paid the fraudster's account (company disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-01-06
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["177-ovid-therapeutics-partner-email-compromise-payment", "163-liberty-lookalike-domain-vendor-payment", "170-zephyr-energy-contractor-payment-diverted", "159-zuu-business-chat-executive-impersonation-transfer"]
status: draft
version: "1.0"
og_lead_ja: "モダリスの子会社、乗っ取られた製造委託先のメールから届いた請求に応じ犯人の口座へ送金 — 最終の損失は 9 万ドル"
og_lead_en: "Modalis subsidiary paid a fraudster's account on an invoice sent from a contractor's hijacked email; final loss $90K"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 取引先のメールの乗っ取り"
og_kicker_en: "CYBERATTACK · VENDOR EMAIL HIJACK"
og_headline_ja: "取引先の正規のメールから、\n請求が届き、送金した。\n<accent>最終の損失 9 万ドル</accent>"
og_headline_en: "A real invoice came from\nthe vendor's own mailbox.\n<accent>Final loss: $90K.</accent>"
key_figures:
  - value: "$90K"
    label: "Final loss (about ¥14M), after bank refunds, a loss-sharing agreement with the contractor and insurance (company disclosure)"
    tone: "alert"
  - value: "Most"
    label: "Share of the transferred amount recovered. The amounts sent and recovered are not in the disclosure (company disclosure)"
  - value: "2023-11 → 2025-01"
    label: "From the payment request email (late November 2023) to disclosure"
glossary:
  - term: "Manufacturing contractor"
    desc: "An outside company contracted to manufacture a company's products or materials. Here, a company based in the US whose name is withheld in the disclosure (\"Company A\")."
  - term: "Email account takeover"
    desc: "A third party gets into someone's email account and can send and receive as that person. The emails come from the genuine address and the genuine mail server."
insight:
  slug: "genuine-mailbox-wrong-account"
  stop: true
  label: "Genuine mailbox, wrong account"
  quote: "Before transferring, check the bank account on the invoice against the vendor's registered account, not against the email that arrived."
industries: ["healthcare", "supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Match the invoice's bank account to the vendor's registered account, managed apart from email"
  - slug: "hold-unverified"
    item: "Hold transfers to accounts that cannot be matched to the registered account"
  - slug: "audit-trail"
    item: "Record which invoice was paid to which account, and how it was checked"
attack_method: "account-takeover"
impact: "A subsidiary paid a fraudster's account on an invoice from a vendor's email; after recovery, the final loss was $90K (about ¥14M)"
takeaway: "An invoice for a real job came from a manufacturing contractor's genuine email account. Before paying, check, apart from email, that the bank account matches the vendor's registered account."
self_check: "Even when an invoice comes from a vendor's genuine address, do you check before paying that the bank account matches that vendor's registered account?"
countries: ["jp", "us"]
---

## 1. Summary

The invoice came from the vendor contact's genuine email account, through the vendor's own mail server, not from a lookalike address. It billed for work that had actually been delivered; only the bank account was different.

It was noticed only after the vendor's accounting team billed again for the same job.

<strong>When an invoice comes from the vendor's genuine mailbox and describes a real transaction, no amount of reading the email or the invoice tells you whether the bank account belongs to the vendor.</strong>

## 2. What got through

- **What got through**: A transfer made on a payment request in the name of a vendor (a US-based manufacturing contractor, "Company A" in the disclosure). The accounting department, asked by the staff member who received it, paid the designated account, which belonged to the fraudster (Modalis disclosure).
- **What reached the paying side**: In general, a payment request arrives with the vendor's name, the transaction, the amount and a bank account. Here the sender's address and the sending mail server were also the vendor's genuine ones. The company infers that after taking over the account, the fraudster watched the correspondence for some time and understood the commercial terms, the relationship and the payment timing before sending.
- **Not disclosed**: The subsidiary's name and location. How Company A's account was taken over. The amount and date of the transfer, and the amount recovered. Whether the account on the invoice differed from earlier transactions. The loss-sharing ratio and the insurance payout. Investigators have not identified the fraudster.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before paying and apart from the email received, the bank account on the invoice is checked against that vendor's registered account.

- **Who approves**: The vendor. When an account is newly registered or changed, it approves through its registered contact. The vendor's email itself can be taken over, as here, so the approval comes through a channel other than email.
- **Where it is checked**: The step before accounting carries out the transfer. The bank account is matched to the vendor's registered account, separately from reviewing the invoice's contents (transaction and amount). Transfers to accounts that cannot be matched are held.
- **What is recorded**: Which invoice was paid to which account, and how it was checked, so you can show what was checked when dealing with bank refunds, loss-sharing talks with the vendor and insurance claims.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before the transfer and apart from email, the invoice's bank account to the vendor's registered account, and keeping a record. Detection means noticing after the transfer that the account was fake. The transfer date and the date it was noticed have not been disclosed. Months are from the company's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Before paying, match the bank account to the vendor's registered account</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>An invoice came from the vendor's genuine email<br>Accounting paid the fraudster's account</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfer</b>A second invoice prompts a check of the transfer; the account is frozen</div>
<div class="rx-g g1"><div class="t">2023-11</div><b>A payment request arrives from the hijacked email</b></div>
<div class="rx-g g2"><div class="t">Transfer</div><b>Accounting pays the designated account (date not disclosed)</b></div>
<div class="rx-g g3"><div class="t">Found</div><b>Company A's accounting bills again; the check reveals it</b></div>
<div class="rx-g g4"><div class="t">2025-01-06</div><b>The company discloses it</b></div>
</div>
</figure>

The fake account was found only after the transfer had gone through. Similar cases, where a payment to a vendor went to another account, are the [City of Liberty, Texas](/critical/briefs/163-liberty-lookalike-domain-vendor-payment/) (the request came from a lookalike vendor domain) and [Zephyr Energy](/critical/briefs/170-zephyr-energy-contractor-payment-diverted/) (a single contractor payment was diverted).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that pays vendors.** It does not look for hijacked mailboxes; it confirms, before the transfer, that the invoice's bank account is one that could be matched to the vendor's registered account.

### Industries and operations to watch

- **Industry · Healthcare**: Drug-discovery companies that outsource research and development manufacturing to overseas contractors, with frequent changes to specifications and terms and invoices that often arrive by email.
- **Industry · Supply chain**: Organisations that pay invoices emailed by contractors they have dealt with many times.
- **Operation · Bank account changes**: Registering and changing vendors' bank accounts (whether the invoice's account differed from earlier ones has not been disclosed).
- **Operation · Approval**: Transfers to vendors that accounting carries out at a staff member's request.

### Current controls vs Lemma

The route in this case is column 1 (an invoice for a real transaction from the vendor's genuine email). Column 2 is the case where the vendor's registered account itself has been altered.

| Control | Invoice for a real transaction from the vendor's genuine email | Vendor's registered account itself altered |
| --- | --- | --- |
| Checking the invoice's contents (transaction, amount, timing) | Not effective | Not effective |
| Checking the email's sender (address, domain) | Not effective | Not effective |
| Two-factor authentication on your own email | Not applicable | Not applicable |
| Checking after the transfer, and the bank freezing the account | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective |

Checking the contents does not settle it: the invoice was for work actually delivered, so the more accurate it was, the more genuine it looked. Checking the sender cannot tell it apart, because the email came from the vendor's genuine account and mail server. Two-factor authentication on your own email, which the company lists among its measures, protects your own accounts; the account taken over was the vendor's. Checking after the transfer and freezing the account led to recovering most of the amount here, but it acts after the transfer. Lemma checks the bank account, not the email or the invoice's contents, against the vendor's registered account before paying.

Note: Lemma's check works only when it is built into the step before the transfer and the vendor's registered account is kept apart from the invoice email. It passes if the registered account itself has been altered. The same applies if account changes are approved through the hijacked email. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent email account takeovers.

### Checklist

Three things to confirm about invoices that vendors send by email

- Do you confirm the registration or change of a vendor's account with that vendor through a channel other than email (such as a registered phone number)?
- Do you have a step that stops, before the transfer, an invoice whose bank account differs from the registered account?
- If an account is found to be fake after a transfer, is there a set procedure to contact both the sending and the receiving bank immediately?

## 5. Facts and timeline

- **Party**: A subsidiary of Modalis Therapeutics (Tokyo Stock Exchange Growth market, code 4883). The disclosure does not name the subsidiary or its location.
- **Vendor**: A US-based manufacturing contractor ("Company A" in the disclosure). The company says there had been several transactions before the incident, with frequent exchanges about changes to specifications and terms.
- **What happened**: Work was ordered from Company A in early 2023 and actually delivered in late August; in late November a payment request arrived by email in Company A's name. Company A's contact's official email account had been taken over by some means, and the fraudster sent it from Company A's mail server. The accounting department paid the designated account.
- **How it was found**: Company A's accounting department billed again for the same transaction; the company checked the transfer and found the destination was the fraudster's account.
- **Recovery and loss**: The company contacted the local authorities and both banks and succeeded in having the fraudster's account frozen. After several months, the banks refunded what they could recover. After talks with Company A, both sides agreed to share the loss in a set ratio, and an electronic-fraud insurance claim was partly paid. The final loss was $90,000 (about ¥14 million), expected to be booked as an extraordinary loss for the fiscal year ending December 2024.
- **Personal data**: The company says customer information it holds was not leaked.

### Timeline

- **Early 2023**: The subsidiary orders work from Company A.
- **Late August 2023**: Company A delivers.
- **Late November 2023**: A payment request arrives from Company A's hijacked email; accounting pays the designated account.
- **Discovery date (not disclosed)**: Company A's accounting bills again; checking the transfer shows the destination was the fraudster's account. The account is frozen.
- **2025-01-06**: The company discloses the incident in a timely disclosure on the Tokyo Stock Exchange.

> The facts rely on Modalis's timely disclosure (primary). The disclosure gives the year once, with the order in early 2023, and we read the months of delivery and the payment request as falling in the same year. That the fraudster watched the correspondence is the company's inference. The amount transferred, the amount recovered, the loss-sharing ratio and the insurance payout have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Modalis**: Says it will enforce password protection and two-factor authentication on its email and other communication tools, and, allowing for the same thing happening on the vendor's side, confirm through more than one channel when sending money and review its internal transfer process. It says it keeps discussing electronic-fraud countermeasures with its banks and frequently receives approaches that appear to be fraud aimed at it. Investigators are working on the case but have found no strong leads to the fraudster.

## 6. Sources

- **Modalis Therapeutics (Primary, timely disclosure)**: 「当社子会社における資金流出被害の発生と特損計上に関するお知らせ」 (Notice of loss of funds at a subsidiary and extraordinary loss, in Japanese, 2025-01-06) — <https://www2.jpx.co.jp/disc/48830/140120241227545975.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
