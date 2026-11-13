---
brief_no: 209
title: "シンガポールの石油化学会社：支払いの書類の食い違いに気づいたが、取引先の署名と社印のある偽の授権書を示され、カンボジアの新しい口座へ送金した(シンガポール警察の発表)"
title_en: "Singapore petrochemical firm: It spotted a discrepancy in the payment documents, but was shown a forged authorisation letter bearing the counterpart's signature and stamp, and paid a new account in Cambodia (Singapore Police Force release)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-10-13
published: 2026-11-13
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["184-singapore-commodity-trader-lookalike-supplier-email", "200-logix-aero-lookalike-domain-engine-sale-invoice", "174-mobile-alabama-arena-contractor-bank-change"]
status: draft
version: "1.0"
og_lead_ja: "シンガポールの石油化学会社、書類の食い違いに気づいたが偽の授権書を示され、カンボジアの口座へ 1,280 万ドルを送金"
og_lead_en: "A Singapore petrochemical firm spotted a discrepancy, then wired $12.8M to Cambodia on a forged authorisation letter"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · BEC SCAM"
og_headline_ja: "食い違いに気づいたが、\n偽の授権書で送金した。\n<accent>1,280 万ドル</accent>"
og_headline_en: "Spotted a discrepancy,\npaid on a forged letter.\n<accent>$12.8M wired.</accent>"
key_figures:
  - value: "$12.8M"
    label: "Sent to a new account in Cambodia on payment instructions said to come from the counterpart (Singapore Police Force release). The full amount was later traced and recovered"
    tone: "alert"
  - value: "10-01 → 10-13"
    label: "From the revised payment instructions arriving by email to the transfer to the new account (2026, police release)"
  - value: "10-13 → 10-26"
    label: "From the transfer to discovery, when the counterpart said the money had not arrived and the police received a report (police release)"
glossary:
  - term: "Business email compromise (BEC)"
    desc: "A scam in which emails impersonating a counterparty or executive ask for a payment or a change of bank account. The police release uses this term."
  - term: "Authorisation letter"
    desc: "A document in which a counterparty confirms payment instructions or the account to be paid. Here it bore the counterpart's company signature and stamp, and was later established to be fraudulent."
insight:
  slug: "discrepancy-checked-by-same-party"
  stop: true
  label: "A discrepancy checked with the instructing party's papers"
  quote: "Before paying a new account, check that account against the counterparty's registered contact details, not against papers supplied by the party giving the instructions."
industries: ["manufacturing"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Use a new account in payment instructions only after confirming it through the counterparty's registered contact details, apart from the instruction email and any papers attached to it"
  - slug: "hold-unverified"
    item: "Hold payments whose documents show a discrepancy, and payments to a new account that cannot be confirmed through registered contact details"
  - slug: "audit-trail"
    item: "Record which instruction's account was checked by whom, through which contact details, before the transfer"
attack_method: "impersonation"
impact: "On payment instructions said to come from the counterpart, $12.8M was sent to a new account in Cambodia (the full amount was later traced and recovered)"
takeaway: "The company spotted a discrepancy in the payment documents, but relied on a forged authorisation letter supplied by the instructing party, and $12.8M went to a new account. Check a new account through the counterparty's registered contact details before using it for a transfer."
self_check: "When a counterparty's receiving account changes, do you know how that change is checked through registered contact details apart from the instruction email?"
countries: ["sg"]
---

## 1. Summary

According to the Singapore Police Force, on 1 October 2026 a Singapore-based petrochemical company received an email sent by its business counterpart with revised payment instructions naming a new bank account. The company identified a discrepancy in the payment documents, but the scammers furnished an authorisation letter bearing the counterpart's company signature and stamp, and on 13 October the company transferred the money to that account. The letter was later established to be fraudulent.

The fraud came to light on 26 October, when the counterpart said it had not received the payment, and the police received a report the same day. The police's Cyber Command worked with the Cambodian National Police and the bank OCBC, and the full amount was traced and recovered. Whether the email was spoofed or the counterpart's mailbox was compromised has not been disclosed.

<strong>When a discrepancy is checked with papers from the party that gave the instructions, the check never leaves that party's hands.</strong>

## 2. What got through

- **What got through**: A transfer made as a payment to the counterpart. It went to the new account named in the email of 1 October, which the police describe as a fraudulent bank account in Cambodia. The amount was $12.8M (Singapore Police Force release).
- **What reached the accepting side**: In general, the paying side receives payment instructions in the counterparty's name and papers setting out the account. According to the police, the company noticed a discrepancy in the documents, but the scammers furnished an authorisation letter bearing the counterpart's company signature and stamp. In general, a signature and stamp are marks on a document; they do not show that whoever sent it is the counterparty.
- **Not disclosed**: The names and countries of the company and the counterpart. Whether the email of 1 October was spoofed or sent from a compromised mailbox of the counterpart. What the discrepancy was. By what route the authorisation letter arrived, and whom the company asked and how. The purpose of the payment. When the recovered funds were returned to the company.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before the transfer, whether the counterparty approved the new account is checked through its registered contact details, not through the instruction email or papers supplied by the instructing party.

- **Who approves**: The counterparty. When it changes its receiving account, it approves the account through contact details registered beforehand (not those written in the instruction email or the authorisation letter) or a signature with its own key.
- **Where it is checked**: The approval step before the transfer is executed. If the account in the instructions differs from the registered one, the transfer is held until it can be checked against the counterparty's approval. When a discrepancy is found in the documents, it is also resolved through the same registered contact details.
- **What is recorded**: Which instruction's account was checked by whom, through which contact details, before it was used for the transfer. In recovery, investigation, insurance or audit, it shows what was checked before sending.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a new account in the instructions is used for a transfer, that it was approved through the counterparty's registered contact details, and recording it. Detection means learning after the transfer that the counterparty has not received the payment. Dates are in 2026, per the Singapore Police Force release.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the new account through the counterparty's registered contact details before the transfer</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A discrepancy was spotted, then a forged letter supplied<br>$12.8M sent to an account in Cambodia</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfer</b>The counterpart reports non-receipt and the police receive a report</div>
<div class="rx-g g1"><div class="t">10-01</div><b>Revised payment instructions arrive by email</b></div>
<div class="rx-g g2"><div class="t">10-13</div><b>$12.8M is sent to the new account</b></div>
<div class="rx-g g3"><div class="t">10-26</div><b>The counterpart's notice reveals the fraud; a report is made</b></div>
<div class="rx-g g4"><div class="t">Afterwards</div><b>Police and bank cooperation traces and recovers the full amount</b></div>
</div>
</figure>

Here the discrepancy was noticed before the transfer, but the material used to resolve it was an authorisation letter supplied by the party giving the instructions. Another Singapore case is [a commodity firm](/critical/briefs/184-singapore-commodity-trader-lookalike-supplier-email/) (2024; staff did not notice a lookalike supplier address, $42.3M went to Timor-Leste, and most of it was frozen). A case where the account in the papers themselves was rewritten is [Logix Aero](/critical/briefs/200-logix-aero-lookalike-domain-engine-sale-invoice/), and one where construction payments went to a party posing as the contractor is [Mobile, Alabama](/critical/briefs/174-mobile-alabama-arena-contractor-bank-change/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for changing a counterparty's receiving account and into the approval before a transfer to a new account.** It does not look for impersonating emails or forged papers; it checks, before the transfer, that the new account was approved through the counterparty's registered contact details.

### Industries and operations to watch

- **Industry · Manufacturing & critical infrastructure**: Companies that, like petrochemicals, buy and sell feedstock and products across borders and make large single payments. Payment instructions and papers setting out accounts arrive by email.
- **Operation · Payment & account changes**: Changes to a counterparty's receiving account and instructions naming a new account.
- **Operation · Approvals**: Confirmation and approval before a transfer when the documents show a discrepancy.

### Current controls vs Lemma

The route in this case runs through column 1 (payment instructions to a new account, said to come from the counterpart) and column 2 (a forged authorisation letter supplied to resolve the discrepancy). Whether the column 1 email was spoofed or sent from a compromised mailbox has not been disclosed. Column 3 covers a takeover of the counterparty's registered contact details themselves.

| Control | Instructions to pay a new account | Forged papers supplied as confirmation | Takeover of registered contact details |
| --- | --- | --- | --- |
| Sender checks (display, warnings) | Partial | Not effective | Not effective |
| Document checks (signature, stamp, discrepancies) | Partial | Not effective | Not effective |
| Tracing and recovery by banks and law enforcement after transfer | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Sender checks show no difference when the email comes from the counterparty's genuine mailbox. Document checks did find a discrepancy here, but once forged papers with a signature and stamp are supplied to resolve it, those papers pass. Tracing and recovery by banks and law enforcement reached the full amount this time, but they act after the transfer and do not stop it. Lemma checks not the marks on the papers but the new account, against the counterparty's approval through registered contact details, before the transfer.

Note: Lemma's check works only when it is built into the approval before the transfer and the counterparty's approval is received through registered contact details or a key managed apart from the instruction email and any attached papers. If the registered contact details themselves have been taken over, or the check uses contact details written in the instruction email or the authorisation letter, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusion or impersonation, and it does not trace or recover funds already sent.

### Checklist

Three things to confirm about transfers to counterparties

- When you find a discrepancy in payment documents, is there a procedure to hold the transfer until confirmation is complete?
- Is there a rule that papers bearing a counterparty's signature or stamp are not, on their own, enough to treat a new account as confirmed?
- If non-receipt is found after a transfer, is there a set procedure to report it at once to your bank and the police?

## 5. Facts and timeline

- **Parties**: A Singapore-based petrochemical company and its business counterpart (neither has been named).
- **What happened**: On 1 October, the company received an email sent by its business counterpart with revised payment instructions naming a new bank account. The police release describes the email as sent by the counterpart and does not say whether it was spoofed or sent from a compromised mailbox.
- **The discrepancy and the letter**: The company identified a discrepancy in the payment documents. The scammers furnished an authorisation letter bearing the counterpart's company signature and stamp. The letter was later established to be fraudulent.
- **The transfer**: On 13 October, the company transferred $12.8M to the new account. According to the police, it was a fraudulent bank account in Cambodia.
- **Discovery and recovery**: On 26 October, the counterpart said it had not received the payment, and the police received a report. The police's Cyber Command immediately engaged the Cambodian National Police (CNP) and coordinated recovery with OCBC. The full amount was traced and recovered.

### Timeline

- **2026-10-01**: The company receives an email sent by its counterpart with revised payment instructions naming a new account.
- **2026-10-13**: The company transfers $12.8M to the new account.
- **2026-10-26**: The counterpart reports non-receipt and the police receive a report. Cyber Command engages the Cambodian National Police and coordinates recovery with OCBC.
- **2026-10-29**: The Singapore Police Force announces the case and the recovery of the full amount.

> The facts rely on the Singapore Police Force release (primary). The names and countries of the company and the counterpart, whether the email was spoofed or sent from a compromised mailbox, what the discrepancy was, the route by which the authorisation letter arrived, the company's approval procedure, the date of recovery and when the funds were returned to the company have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response.

### After disclosure

- **Singapore Police Force (recovery)**: Said that Cyber Command, working with the Cambodian National Police and OCBC, traced and recovered the full amount.
- **Singapore Police Force (advice to businesses)**: Urged businesses to verify any new or sudden change in payment instructions by contacting the supplier or counterpart directly on an independently verified, trusted number, and never to rely solely on contact details provided in the same email chain. It also advised training staff who authorise or execute payments on BEC tactics, and using strong passwords, multi-factor authentication and email protection software that can detect spoofed emails.

## 6. Sources

- **Singapore Police Force (Primary, police release)**: "USD 12.8 Million Recovered From Business Email Compromise Scam Through Strong International Cooperation" (2026-10-29) — <https://www.police.gov.sg/media-hub/news/2026/10/20261029_usd_12_8_million_recovered_from_business_email_compromise_scam_through_strong>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
