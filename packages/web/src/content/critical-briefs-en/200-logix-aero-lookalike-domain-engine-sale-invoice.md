---
brief_no: 200
title: "Logix Aero：航空機エンジンの売買のメールに似せたドメインの相手が割り込み、契約書と請求書の口座が書き換えられて、代金が別の口座へ払われた(英国控訴院の判決)"
title_en: "Logix Aero: Lookalike domains cut into the emails of an aircraft engine sale, the bank details in the contracts and invoices were swapped, and the price was paid to another account (England and Wales Court of Appeal judgment)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-04-29
published: 2026-11-10
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["185-studco-fourth-circuit-ach-name-mismatch", "184-singapore-commodity-trader-lookalike-supplier-email", "170-zephyr-energy-contractor-payment-diverted"]
status: draft
version: "1.0"
og_lead_ja: "Logix Aero、エンジン 2 基の売買のメールに似せたドメインの相手が割り込み、書き換えた契約書の口座へ 824,900 ドルを払った"
og_lead_en: "Logix Aero paid $824,900 to an account written into contracts doctored by lookalike domains inside an engine deal"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE DOMAIN"
og_headline_ja: "エンジンの売買に\n割り込んだメールで、\n口座が書き換わった。\n<accent>82.5 万ドル</accent>"
og_headline_en: "Lookalike domains sat in\nan aircraft engine deal.\n<accent>$824,900 paid away.</accent>"
key_figures:
  - value: "$824,900"
    label: "Paid by the buyer to an account in Vietnam, believing it was the seller's (as found in the judgments). It had left the account before the fraud came to light"
    tone: "alert"
  - value: "07-29 → 08-21"
    label: "From the first email from a lookalike domain to payment into the swapped account (2024, as found in the judgments)"
  - value: "2025-05 → 2026-04"
    label: "From the High Court striking out the buyer's claim to the Court of Appeal dismissing the appeal"
glossary:
  - term: "LOI (letter of intent)"
    desc: "A document setting out the terms of a sale in advance. Here only some clauses, such as confidentiality, were binding, and it set out the seller's bank account."
  - term: "SPA (sale and purchase agreement)"
    desc: "The contract for the sale of each engine. It sets out the bank account for payment."
  - term: "Strike out"
    desc: "In English civil procedure, dismissing a claim before trial because it discloses no reasonable grounds."
insight:
  slug: "contract-account-swapped-in-thread"
  stop: true
  label: "An account swapped along with the papers"
  quote: "Before paying the price, check the account written in the contracts and invoices against the seller's registered account and contact details, not against the papers that arrived by email."
industries: ["supply-chain", "manufacturing"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Use an account written in a contract or invoice for payment only after confirming it against the agreed account and through the counterparty's registered contact details"
  - slug: "hold-unverified"
    item: "Hold payments to an account that differs from the agreed one, or that cannot be confirmed through registered contact details"
  - slug: "audit-trail"
    item: "Record whose account, from which document, was checked by whom and by what means before payment"
attack_method: "impersonation"
impact: "The $824,900 price of two engines was paid to an account written into contracts and invoices doctored by a party using lookalike domains, and had been withdrawn before discovery (as found in the judgments)"
takeaway: "Emails impersonating both seller and buyer cut into a sale, and the bank details in signed contracts and invoices were swapped. Check an account written in the papers against the agreed account and the counterparty's registered contact details before paying."
self_check: "Do you know how you would find out, before paying, that the account in a contract or invoice differs from the one first agreed with the counterparty?"
countries: ["gb", "ie"]
---

## 1. Summary

During the purchase of two aircraft engines by Logix Aero of Ireland from Siam Aero of Thailand, a party using addresses that imitated each side's domain inserted itself into the email correspondence. It changed the bank details in the contracts (SPAs) and invoices the seller sent to its own account in Vietnam before passing them on, and on 21 August 2024 the buyer paid the price of $824,900 into that account (as found in the judgments). Unlike earlier Briefs, no notice of a changed account was sent; the account in the signed contracts themselves was rewritten.

According to the judgments, there was no evidence that either company's systems had been compromised, and how the fraudster obtained the first email is not known. The buyer sued the seller in England for its loss; the High Court struck out the claim, and on 29 April 2026 the Court of Appeal dismissed the appeal.

<strong>Contracts and invoices received by email, even with genuine signatures and layout, do not show that the account written in them belongs to the counterparty.</strong>

## 2. What got through

- **What got through**: Payment of the price of the two engines. On 21 August 2024 the buyer paid $824,900 into an account in Vietnam written in the signed contracts and invoices it had received by email. The seller's genuine account was in Thailand and was also set out in the LOI both companies signed in July (as found in the judgments).
- **What reached the accepting side**: In general, the paying side receives contracts and invoices sent in the name of the counterparty's contact. According to the judgments, the fraudster copied the text and attachments of genuine emails and changed only the bank details. The seller's genuine address ended ".com"; the fake one was the same except that it ended ".co". The buyer's email system automatically noted that email did not often arrive from that address.
- **Not disclosed**: How the fraudster obtained the genuine email of 29 July. Since when the fraudster had been watching the correspondence, after a domain imitating Sky Aero's was registered in June. Where the funds went from the Vietnamese account. The judgments say there was no evidence that either company's systems had been compromised.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before the price is paid, the account written in the contracts and invoices is checked, apart from the papers received by email, as being the agreed account or, if different, one the counterparty has approved.

- **Who approves**: The seller. It registers the account for receiving payment at the start of the deal and approves any change by a phone number registered beforehand or a signature with its own key. Contact details written in the email or its attachments are not used.
- **Where it is checked**: The approval step before the price is paid. The account in the contracts and invoices is compared with the registered account (here, the one set out in the LOI); if it differs, payment is held until it can be checked against the seller's approval.
- **What is recorded**: Whose account, from which document, was checked by whom and by what means before payment. In recovery, litigation or insurance, it shows what was checked before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the price is paid, the account in the papers against the agreed account and the seller's registered contact details. Detection means noticing the fraud after payment, when the seller says the money has not arrived. Dates are in 2024, as found in the High Court and Court of Appeal judgments.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · the payer's step</b>Check the account in the papers against the agreed account and the seller's registered contact details before paying</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Emails impersonating both seller and buyer<br>$824,900 to the swapped account</span></div>
<div class="rx-zone det"><b>Detection · worked after payment</b>The seller says by phone and WhatsApp that the money has not arrived</div>
<div class="rx-g g1"><div class="t">07-29</div><b>The first email arrives from a domain imitating the seller's</b></div>
<div class="rx-g g2"><div class="t">08-13</div><b>Contracts and invoices with swapped bank details reach the buyer</b></div>
<div class="rx-g g3"><div class="t">08-21</div><b>The buyer pays $824,900 into the Vietnamese account</b></div>
<div class="rx-g g4"><div class="t">Days later</div><b>The seller's message reveals the fraud; the funds have gone</b></div>
</div>
</figure>

The buyer saw an automatic note about the lookalike address, but it was a mechanism separate from any check before payment. Cases where a lookalike domain supplied the payment account include [Studco](/critical/briefs/185-studco-fourth-circuit-ach-name-mismatch/) (a fake supplier email changed the account, and a court held the receiving bank not liable) and [a Singapore commodity firm](/critical/briefs/184-singapore-commodity-trader-lookalike-supplier-email/) (a lookalike supplier address named a new account). A case where a payment meant for a genuine counterparty went to another account is [Zephyr Energy](/critical/briefs/170-zephyr-energy-contractor-payment-diverted/). Here, both seller and buyer were impersonated, and the account in the signed contracts themselves was rewritten.

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for registering and changing a counterparty's account and into the approval before the price is paid.** It does not look for impersonating emails; it confirms, before payment, that the account in the papers can be checked against the seller's approval.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: Companies that buy and sell high-value goods such as aircraft parts, engines and machinery across borders, exchanging terms and documents by email. Intermediaries are copied in too, so many addresses are involved.
- **Industry · Manufacturing & critical infrastructure**: Companies whose single payments for equipment or parts are large, and which pay on the account in contracts and invoices.
- **Operation · Payment & account changes**: Registering the account a counterparty receives payment into, and handling an account in the papers that differs from the registered one.
- **Operation · Approvals**: Approval before a large price is paid to an account for the first time.

### Current controls vs Lemma

The route in this case runs through column 1 (bank details in contracts and invoices rewritten mid-thread) and column 2 (payment to the swapped account). Column 3 covers papers sent from a counterparty's genuine mailbox after a takeover; the judgments say there was no evidence of that here.

| Control | Bank details rewritten in the papers | Payment to the swapped account | Takeover of the counterparty's mailbox |
| --- | --- | --- | --- |
| Sender checks (domain display, warnings) | Partial | Not relevant | Not effective |
| Payment approval (matching contract and invoice) | Not effective | Not effective | Not effective |
| Monitoring after transfer and recall requests | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

Sender checks flag a domain one character off through a display or warning, but when the text and attachments match the genuine ones, telling them apart is left to the recipient. Matching the contract against the invoice agrees when both have been rewritten the same way. Monitoring and recall requests after transfer do not reach funds that, as here, have already been withdrawn. Lemma confirms before payment not the content of the papers but whether the account can be checked against the seller's approval.

Note: Lemma's check works only when it is built into the approval before payment and the seller's approval is received through registered contact details or a key apart from the email that delivered the papers. If the registered contact details themselves have been changed, or the check uses contact details written in the received email, it can pass. If the counterparty's mailbox is taken over, it works when the check does not go through that mailbox, and can pass when it does. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusion or impersonation, and it does not recover funds already paid.

### Checklist

Three things to confirm about deals where terms and documents are exchanged by email

- Do you confirm, before signing papers, that the domain of a sender mid-deal is the same as at the start of the deal?
- When paying a large price to an account for the first time, do you hold payment until the account is confirmed through the counterparty's registered contact details?
- If fraud is found after payment, is there a set procedure to contact your bank, the receiving bank and law enforcement at once?

## 5. Facts and timeline

- **Parties**: Logix Aero Ireland Limited (Ireland; auxiliary power units and engine leasing) and Siam Aero Repair Company Limited (Thailand; aircraft teardown and parts sales). Staff of Sky Aeroservices SARL (France), which introduced the sale and tore down the aircraft, were also copied in.
- **The deal**: In a July 2024 LOI, the companies agreed the sale of two Pratt & Whitney 127 engines for a total of $935,000 (the price of one was later reduced in light of its condition). The LOI set out Siam Aero's bank details and chose English law.
- **What happened**: According to the judgments, three domains imitating those of Sky Aero, Siam Aero and Logix (sky-aero.net, siam-aero.co, logix-aero.co) were registered between 18 June and 31 July. After a genuine email from Siam Aero's representative on 29 July, a chasing email reached Logix from siam-aero.co the same day; from then on, both companies corresponded with the fraudster while believing they were writing to each other. The fraudster also replaced other copied recipients with fake addresses.
- **Documents rewritten**: The fraudster changed the bank details in the draft contracts Siam Aero sent (31 July) and in the signed contracts and invoices (13 August) to its own account at Vietcombank in Vietnam before passing them to Logix. The contracts Logix signed and returned were passed to Siam Aero with Siam Aero's bank details restored. On 22 August, Logix's proof of payment was also altered to show payment into Siam Aero's account before being passed to Siam Aero.
- **Payment and discovery**: On 21 August, believing it was paying Siam Aero, Logix paid a total of $824,900 into the Vietnamese account. Within days Siam Aero said by phone and WhatsApp that the money had not arrived and the fraud came to light, but the funds had already left the account.
- **Route of intrusion**: How the fraudster obtained the genuine email of 29 July is not known. According to two investigation reports cited by the High Court, there was no evidence that either company's systems had been compromised, nor that anyone connected to either sent the email to the fraudster. Sky Aero's email system could not be reviewed because its logs for the relevant months were missing.
- **The courts**: Logix sued in England, claiming among other things that Siam Aero had caused its loss by passing documents to the fraudster in breach of the LOI's confidentiality clause. The High Court (King's Bench Division) struck out the claim on 23 May 2025. On 29 April 2026 the Court of Appeal held that, even assuming a breach of the confidentiality clause, the loss was caused by the intervening fraud, and dismissed the appeal.

### Timeline

- **2024-06-18**: A domain imitating Sky Aero's (sky-aero.net) is registered.
- **2024-07-04**: Siam Aero signs the LOI (Logix on 9 July). The LOI sets out Siam Aero's bank details.
- **2024-07-29**: After a genuine email from Siam Aero's representative, the first fake email reaches Logix from siam-aero.co.
- **2024-07-31**: logix-aero.co is registered and the first fake email reaches Siam Aero. Siam Aero sends draft contracts (which reach the fraudster).
- **2024-08-05**: Draft contracts with swapped bank details reach Logix.
- **2024-08-13**: Signed contracts and invoices with swapped bank details reach Logix. Logix returns the contracts it has signed.
- **2024-08-21**: Logix pays a total of $824,900 into the Vietnamese account.
- **2024-09-26**: Logix obtains precautionary seizures of the engines from French commercial courts.
- **2024-10-23**: Logix issues proceedings in the English High Court.
- **2025-05-23**: The High Court strikes out the claim.
- **2026-02-05**: The Court of Appeal hears the appeal.
- **2026-04-29**: The Court of Appeal dismisses the appeal.

> The facts rely on the judgments of the English High Court ([2025] EWHC 1283 (KB)) and the Court of Appeal ([2026] EWCA Civ 510) (both primary). The High Court records that the facts were not in dispute. How the fraudster obtained the first email, since when it was watching the correspondence, and where the funds went from the Vietnamese account have not been disclosed. The courts' conclusion concerns whether the seller bears the buyer's loss. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses.

### After disclosure

- **Logix Aero**: Obtained precautionary seizures of the engines in France and sued in England. Its original claim suggested Siam Aero's complicity, an allegation dropped after a forensic investigation of the computer systems (Court of Appeal judgment).
- **Court of Appeal**: Dismissed the appeal unanimously. It found it unnecessary to decide the further grounds Siam Aero raised (such as that there was no breach of the confidentiality clause).

## 6. Sources

- **England and Wales Court of Appeal (Primary, judgment)**: "Logix Aero Ireland Limited v Siam Aero Repair Company Limited [2026] EWCA Civ 510" (2026-04-29) — <https://caselaw.nationalarchives.gov.uk/ewca/civ/2026/510>
- **High Court, King's Bench Division (Primary, judgment)**: "Logix Aero Ireland Limited v Siam Aero Repair Company Limited [2025] EWHC 1283 (KB)" (2025-05-23) — <https://caselaw.nationalarchives.gov.uk/ewhc/kb/2025/1283>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
