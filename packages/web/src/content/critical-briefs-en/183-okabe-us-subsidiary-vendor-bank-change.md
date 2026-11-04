---
brief_no: 183
title: "岡部：米国の子会社に、取引先の関係者を装うメールで支払先の変更が指示され、子会社が変更した先へ送金した(同社の開示)"
title_en: "Okabe: An email posing as a vendor's representative told a US subsidiary to change where it paid, and the subsidiary sent the money to the new payee (company disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-04-26
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["160-baltimore-workday-supplier-contact-bank-change", "176-modalis-subsidiary-vendor-email-takeover", "174-mobile-alabama-arena-contractor-bank-change", "158-portland-water-bureau-vendor-bank-change"]
status: draft
version: "1.0"
og_lead_ja: "岡部の米国子会社、取引先の関係者を装うメールで支払先を変更し 51.9 万ドルを送金 — 2020 年に続く 2 回目"
og_lead_en: "Okabe's US subsidiary changed a payee on an email posing as a vendor and sent $519K, a second case after 2020"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "取引先を装うメールで、\n支払先が変えられた。\n<accent>51.9 万ドルを送金</accent>"
og_headline_en: "A fake vendor email\nchanged the payee.\n<accent>$519K was sent.</accent>"
key_figures:
  - value: "$519K"
    label: "Total the US subsidiary sent to the payee it was told to switch to (November–December 2023, company disclosure)"
    tone: "alert"
  - value: "¥76M"
    label: "Extraordinary loss to be booked in Q1 of the fiscal year ending December 2024, as a remittance-fraud loss at an overseas subsidiary (company disclosure)"
  - value: "2020-11 → 2023-11"
    label: "From a similar case at another US subsidiary to the start of this one (company disclosure)"
glossary:
  - term: "Payee change instruction"
    desc: "A message asking that payments to a vendor go to a different bank account from now on. It may arrive in the vendor's name without coming from the vendor."
  - term: "Extraordinary loss"
    desc: "A one-off loss booked separately from ordinary business results. Here it is to be booked as a remittance-fraud loss at an overseas subsidiary."
insight:
  slug: "payee-change-not-approved-by-vendor"
  stop: true
  label: "Payee change not matched to vendor approval"
  quote: "Before transferring, check the payee change with the vendor's registered contact, not the email that instructed it."
industries: ["manufacturing", "supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Check a payee change received in a vendor's name with the vendor's registered contact before activating it"
  - slug: "hold-unverified"
    item: "Hold transfers to a new payee that cannot be checked with the registered contact"
  - slug: "audit-trail"
    item: "Record which payee change was activated, by whom, and through which contact it was checked"
attack_method: "impersonation"
impact: "A US subsidiary sent a total of $519K to a payee it switched to on an email posing as a vendor's representative"
takeaway: "An email posing as a vendor's representative told a US subsidiary to change the payee, and the subsidiary paid. Another US subsidiary had a similar case in 2020. Activate payee changes only after checking them with the vendor's registered contact."
self_check: "When a payee change arrives in a vendor's name, do you check it with that vendor's registered contact before sending money to the new account?"
countries: ["jp", "us"]
---

## 1. Summary

The instruction that reached the US subsidiary was not to pay, but to change where to pay. The transaction and the amount stay the same, and once the payee changes, the next transfer goes to the new account.

According to the company's disclosure, another US subsidiary had a similar case in 2020. Measures were taken afterwards, yet a similar instruction got a transfer through again.

<strong>Even when an instruction to change the payee arrives in a vendor's name, unless you check that the vendor approved the change through its registered contact, the next payment goes to the new account.</strong>

## 2. What got through

- **What got through**: An email instruction from a third party posing as a vendor's representative to change the payee, and transfers to the new payee. The US subsidiary OCM Manufacturing LLC (Pennsylvania) sent a total of $519,000 between November and December 2023 (Okabe disclosure).
- **What reached the paying side**: In general, a payee change arrives with the vendor's name, a contact's name and new bank details. The transaction and amount do not change, so reading the invoice does not tell you whether the instruction came from the vendor.
- **Not disclosed**: The vendor and the representative who were impersonated. Whether the email came from the vendor's address or a lookalike. The number, dates and amounts of the transfers. What prompted the realisation and when. Whether any funds were recovered. What the measures taken after 2020, and the improvements made after this case, consist of.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever pays a vendor checks, before transferring, that the payee change was approved by that vendor through its registered contact, not through the instructing email.

- **Who approves**: The vendor. When a payee is newly registered or changed, it approves the account through its registered contact. A contact given in the instructing email is not used.
- **Where it is checked**: Both the step that activates a payee change and the step before a transfer. Whatever channel the instruction arrives through, an account that does not match an approval is not activated. Transfers to it are held.
- **What is recorded**: Which vendor's payee change arrived through which channel, and who approved and activated it through which contact. When a similar instruction arrives later, this shows how earlier changes were checked.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before activating a payee change and before paying the new account, that the vendor approved it through its registered contact, and keeping a record. Detection means noticing after the transfer that the instruction was false. The transfer dates and the date it was noticed have not been disclosed. Months are from the company's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check the payee change with the vendor's registered contact before activating it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>An email posing as a vendor's representative instructed a payee change<br>The subsidiary sent a total of $519K</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfer</b>The instruction is suspected to be false; local investigators are consulted</div>
<div class="rx-g g1"><div class="t">2023-11</div><b>An email instructing a payee change arrives</b></div>
<div class="rx-g g2"><div class="t">2023-11 to 12</div><b>The subsidiary pays (number and dates not disclosed)</b></div>
<div class="rx-g g3"><div class="t">After the transfer</div><b>The instruction is suspected to be false</b></div>
<div class="rx-g g4"><div class="t">2024-04-26</div><b>The company discloses it</b></div>
</div>
</figure>

The instruction was found to be false only after the transfers. Similar cases, where a vendor's payee was redirected to an impostor, are the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a fake contact was added to a supplier account) and the [City of Mobile, Alabama](/critical/briefs/174-mobile-alabama-arena-contractor-bank-change/) (a contractor impostor corresponded for months). Another case at an overseas subsidiary of a Japanese company is [Modalis](/critical/briefs/176-modalis-subsidiary-vendor-email-takeover/) (an invoice came from the vendor's genuine email).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts payee changes and pays.** It does not look for spoofed emails; it checks, before the transfer, that the new payee was approved through the vendor's registered contact.

### Industries and operations to watch

- **Industry · Manufacturing**: Companies with overseas manufacturing subsidiaries that pay suppliers of materials and parts directly. Whether the parent's procedures reach each local payment process can differ by subsidiary.
- **Industry · Supply chain**: Organisations that pay the same suppliers repeatedly.
- **Operation · Bank account changes**: Accepting and registering payee changes received in a vendor's name.
- **Operation · Approval**: Approving transfers to a changed payee.

### Current controls vs Lemma

The route in this case is column 1 (a payee change instructed by an email posing as a vendor's representative). Whether the email came from the vendor's address has not been disclosed. Column 2 is the case where the vendor's registered contact itself has been taken over; there is no disclosure that this happened here.

| Control | Payee change instructed by an email posing as a vendor's representative | Vendor's registered contact itself taken over |
| --- | --- | --- |
| Checking the invoice's contents (transaction, amount, timing) | Not effective | Not effective |
| Checking the email's sender (address, domain) | Partial | Not effective |
| Confirming the facts after the transfer | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective |

Checking the contents does not settle it: a payee change leaves the transaction and amount unchanged. Checking the sender can catch a lookalike address but not an email sent from the vendor's own account (which applied here has not been disclosed). Confirming the facts after the transfer led here to suspecting the instruction and consulting investigators, but it acts after the transfer, and whether funds were recovered has not been disclosed. Lemma checks the new payee, not the email or the invoice, against approval through the vendor's registered contact before paying.

Note: Lemma's check works only when it is built into the step that activates payee changes and the step before transfers, and when changes arriving by email, phone or paper all go through the same check. The contact used for approval is managed apart from the system that receives instructions. Where a parent and its subsidiaries run separate procedures, it is built into each subsidiary. It passes if the vendor's registered contact itself has been taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent spoofed emails.

### Checklist

Three things to confirm about vendor payee changes

- Is the procedure for accepting payee changes the same at every location, including overseas subsidiaries?
- Do you hold transfers right after a payee change until the check with the vendor is done?
- If an instruction is found to be false after a transfer, is there a set procedure to contact the bank and investigators immediately?

## 5. Facts and timeline

- **Party**: OCM Manufacturing LLC (Pennsylvania, building products manufacturing), a US subsidiary of Okabe Co., Ltd. (Tokyo Stock Exchange Prime market, code 5959).
- **What happened**: Between November and December 2023, emails from a third party posing as a vendor's representative instructed the subsidiary to change the payee, and the subsidiary sent a total of $519,000.
- **How it was found**: After the transfers, the company realised the instruction might be false and judged it was likely the victim of a crime. It immediately formed an internal team to establish the facts, consult and file a report with local investigators, investigate the cause and draw up measures against recurrence.
- **Loss**: An extraordinary loss of ¥76 million, as a remittance-fraud loss at an overseas subsidiary, is to be booked in the consolidated income statement for Q1 of the fiscal year ending December 2024.
- **The 2020 case**: In November 2020, a similar case occurred at another US subsidiary, Okabe Co., Inc. (Illinois), and ¥154 million was booked as an extraordinary loss for the fiscal year ending December 2021. The company says it took measures afterwards, but a similar loss has now occurred.

### Timeline

- **2020-11**: A similar case occurs at the US subsidiary Okabe Co., Inc.
- **FY ending December 2021**: A ¥154 million extraordinary loss is booked; measures against recurrence follow.
- **2023-11 to 12**: Emails from a third party posing as a vendor's representative instruct OCM Manufacturing to change the payee; it sends a total of $519,000.
- **After the transfers (date not disclosed)**: The instruction is suspected to be false; local investigators are consulted and a report is filed.
- **2024-04-26**: The company discloses the incident in a timely disclosure on the Tokyo Stock Exchange.

> The facts rely on Okabe's timely disclosure (primary). The impersonated vendor and how the email arrived have not been disclosed. Nor have the number and dates of transfers, what prompted the realisation, or whether funds were recovered. The contents of the measures taken after 2020 and of the improvements drawn up after this case have not been disclosed either. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Okabe**: Calls it deeply regrettable that two such cases occurred in about three years, and says it reviewed the measures taken after 2020, drew up improvements and put them into effect.

## 6. Sources

- **Okabe Co., Ltd. (Primary, timely disclosure)**: 「当社子会社における資金流出事案の発生並びに特別損失の計上に関するお知らせ」 (Notice of a loss of funds at a subsidiary and extraordinary loss, in Japanese, 2024-04-26) — <https://www2.jpx.co.jp/disc/59590/140120240426578022.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
