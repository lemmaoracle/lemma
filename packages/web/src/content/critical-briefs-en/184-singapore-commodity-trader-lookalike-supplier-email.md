---
brief_no: 184
title: "シンガポールの商品取引会社：仕入先に似せたアドレスのメールに応じ、東ティモールの新しい口座へ送金した(シンガポール警察の発表)"
title_en: "Singapore commodity firm: Following an email from a lookalike supplier address, it paid a new account in Timor-Leste (Singapore Police Force release)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-07-19
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["163-liberty-lookalike-domain-vendor-payment", "170-zephyr-energy-contractor-payment-diverted", "177-ovid-therapeutics-partner-email-compromise-payment", "174-mobile-alabama-arena-contractor-bank-change"]
status: draft
version: "1.0"
og_lead_ja: "シンガポールの商品取引会社、仕入先に似せたアドレスのメールで東ティモールの新しい口座へ 4,230 万ドルを送金"
og_lead_en: "A Singapore commodity firm wired $42.3M to a new Timor-Leste account on a lookalike supplier email"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE EMAIL"
og_headline_ja: "仕入先に似せたメールで、\n新しい口座へ送金した。\n<accent>4,230 万ドル</accent>"
og_headline_en: "Paid a new account on a\nlookalike supplier email.\n<accent>$42.3M wired.</accent>"
key_figures:
  - value: "$42.3M"
    label: "Sent to a new account in Timor-Leste in response to an email posing as a supplier (Singapore Police Force release)"
    tone: "alert"
  - value: "07-19 → 07-23"
    label: "From the transfer to the firm learning of the fraud from the real supplier and reporting it to the police (police release)"
  - value: "07-23 → 07-24"
    label: "From the police report to word that $39M had been frozen in the Timor-Leste account (police release)"
glossary:
  - term: "Business email compromise (BEC)"
    desc: "A scam that uses emails posing as a business partner or executive to request a payment or an account change. The police release uses this term."
  - term: "I-GRIP"
    desc: "INTERPOL's Global Rapid Intervention of Payments, a mechanism for quickly stopping payments across borders. Launched in 2022 (INTERPOL)."
insight:
  slug: "new-account-lookalike-sender"
  stop: true
  label: "New account, lookalike sender"
  quote: "Before transferring, check the new account in the request with the supplier's registered contact, not the email that arrived."
industries: ["supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Check a new account named in a payment request through the supplier's registered contact before paying it"
  - slug: "hold-unverified"
    item: "Hold transfers to new accounts that cannot be checked through the registered contact"
  - slug: "audit-trail"
    item: "Record which request's account was paid, who checked it, and how"
attack_method: "impersonation"
impact: "$42.3M went to a new account in Timor-Leste in response to an email posing as a supplier ($39M of it was frozen)"
takeaway: "An email from an address made to look like a supplier's asked for payment to a new overseas account, and $42.3M was sent. Check a new account named in a request through the supplier's registered contact before paying it."
self_check: "When a supplier asks to be paid into a new account, do you check that account through the supplier's registered contact before transferring?"
countries: ["sg"]
search_title: "シンガポールのBEC詐欺：4,230万ドル送金と回収の経緯"
search_description: "シンガポールの商品取引会社が、仕入先に似せたアドレスのメールに応じ、東ティモールの口座へ 4,230 万ドル（約 66 億円相当）を送金した（シンガポール警察）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

According to the police, the email appeared to come from a supplier and asked for payment for goods to a new account. The sender's address differed from the supplier's by one character, and staff did not notice. The firm found out only when the real supplier said it had not been paid. Most of the money was later frozen through cross-border cooperation, but the transfer itself went through. <strong>A payment to a new account goes through, even on a request from a lookalike address, unless the account is checked with the supplier's registered contact.</strong>

## 2. What got through

- **What got through**: A transfer made as payment to a supplier for goods. It went to a new account at a bank in Timor-Leste named in the email, and the amount was $42.3 million (Singapore Police Force release). INTERPOL describes the email as asking for a pending payment to be sent to a new account.
- **What reached the paying side**: In general, the paying side sees the supplier's name, the sender's address, what the payment is for and the destination account. An address that differs by one character is hard to spot from the display alone. According to the police, staff did not notice the difference.
- **Not disclosed**: The names of the firm and the supplier. Whether the requested amount matched a real transaction. Who approved the payment to the new account, and through what steps. How the fraudsters learned of the transaction and the supplier (whether the supplier's or the firm's email was compromised). How much was finally returned to the firm, and when.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever pays a supplier checks, before transferring, that a new account named in the request was approved by that supplier through its registered contact, not through the email that arrived.

- **Who approves**: The supplier. When a new account is used or an account is changed, it approves the account through its registered contact (not a contact given in the request's email).
- **Where it is checked**: The approval step before a transfer is executed. When the account in a request differs from the registered account, nothing is sent and the payment is held until it can be checked against the supplier's approval. This is checked separately from reviewing what the payment is for.
- **What is recorded**: Which request's account was used for a transfer, and who checked it through which contact. That record can show, for recovery, investigation, insurance or audit, what was checked before the money was sent.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before using a new account named in a request, that it was approved through the supplier's registered contact, and keeping a record. Detection means learning after the transfer that the supplier was never paid. Dates rely on the Singapore Police Force release.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the new account through the supplier's registered contact before transferring</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>$42.3M went to a new account<br>$39M was frozen</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfer</b>The real supplier reports non-payment; the firm reports to the police</div>
<div class="rx-g g1"><div class="t">07-15</div><b>An email arrives from a lookalike supplier address</b></div>
<div class="rx-g g2"><div class="t">07-19</div><b>The firm pays the new account</b></div>
<div class="rx-g g3"><div class="t">07-23</div><b>The real supplier's word reveals it; the firm reports</b></div>
<div class="rx-g g4"><div class="t">07-24</div><b>Funds frozen in the Timor-Leste account</b></div>
</div>
</figure>

The firm noticed four days after the transfer. A similar case of paying on a request from an address made to look like a vendor's is the [City of Liberty, Texas](/critical/briefs/163-liberty-lookalike-domain-vendor-payment/) (about $600,000 wired against a request matching a real debt). Here the amount was about 70 times larger, the request itself pointed to a new overseas account, and most of the money was frozen within days through cross-border cooperation. Other cases where a supplier payment went to another account are [Zephyr Energy](/critical/briefs/170-zephyr-energy-contractor-payment-diverted/) and [Ovid Therapeutics](/critical/briefs/177-ovid-therapeutics-partner-email-compromise-payment/) (a development partner's email was compromised).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that transfers money on payment requests.** It does not look for spoofed emails; it checks, before transferring, that the account named in a request was approved through the supplier's registered contact.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: Firms that pay large single amounts to overseas suppliers, as in commodity trading. Payment requests arrive by email, and destinations may cross borders.
- **Operation · Bank account changes**: A new account named alongside a payment request.
- **Operation · Approval**: Approving transfers to suppliers for goods.

### Current controls vs Lemma

The route in this case is column 1 (a request to pay a new account from an address made to look like the supplier's). Column 2 covers the same request arriving from the supplier's genuine, compromised email; nothing disclosed says that happened here. Column 3 covers a takeover of the supplier's registered contact itself.

| Control | Request from a lookalike address | Request from the supplier's genuine email | Takeover of the registered contact |
| --- | --- | --- | --- |
| Checking the sender's address (reading the display) | Partial | Not effective | Not effective |
| Reviewing what the payment is for | Partial | Partial | Not effective |
| Post-transfer freezing and recovery by banks and law enforcement | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Checking the sender's address can miss a one-character difference, and according to the police it was not noticed here; a compromised genuine mailbox shows no difference at all. Reviewing what the payment is for cannot easily tell a request apart if it follows a real transaction (the request's contents here were not disclosed). Freezing and recovery by banks and law enforcement act after the transfer and do not stop it (here most of the money was frozen after it was sent). Lemma checks the account named in the request, not the address or the payment's contents, against the supplier's approval through its registered contact, before transferring.

Note: Lemma's check works only when it is built into the approval step before a transfer and the supplier's approval comes through a registered contact or key managed apart from the request's email. It passes if the registered contact itself has been taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not freeze or recover funds already sent.

### Checklist

Three things to confirm about transfers to suppliers

- Do you hold the first transfer to an account in a different country or bank than before until the check is complete?
- Do you check the address of a payment-request email against the supplier's registered address with a system, not by eye?
- If a transfer is found to have gone to the wrong place, is there a set procedure to report it to the bank and the police immediately?

## 5. Facts and timeline

- **Party**: A commodity firm based in Singapore (name not disclosed).
- **What happened**: An email that appeared to come from a supplier asked for payment for goods to a new account at a bank in Timor-Leste. The sender's address differed from the supplier's by one character, and staff did not notice. The firm sent $42.3 million to that account.
- **How it was found**: The real supplier said it had not received the payment. The firm reported to the police the same day.
- **Impact and recovery**: The police engaged the Timor-Leste authorities and INTERPOL, and $39 million was frozen in the Timor-Leste account. The Timor-Leste authorities recovered over $2 million more and later arrested seven suspects in total. The police say the Anti-Scam Centre, working with the Timor-Leste authorities and INTERPOL, recovered over $40 million, and that steps are being taken to return the funds to the firm.

### Timeline

- **2024-07-15**: Staff at the firm receive an email that appears to come from a supplier, asking for payment to a new account in Timor-Leste.
- **2024-07-19**: The firm sends $42.3 million to that account.
- **2024-07-23**: The real supplier says it has not been paid. The firm reports to the police, who engage the Timor-Leste authorities and INTERPOL through I-GRIP.
- **2024-07-24**: The police Anti-Scam Centre is told that $39 million has been frozen in the Timor-Leste account.
- **2024-07-25**: The Timor-Leste authorities report arrests and the recovery of over $2 million.
- **2024-08-03**: The Singapore Police Force announces the case and the recovery.
- **2024-08-06**: INTERPOL announces the case and the recovery.

> The facts rely on the Singapore Police Force release (primary) and the INTERPOL release (primary). The date of word of the freeze follows the police release (July 24); the body of the INTERPOL release gives July 25. The names of the firm and the supplier, whether the requested amount matched a real transaction, the firm's approval steps, and how much was finally returned and when have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Singapore Police Force**: The Director of the Commercial Affairs Department said scams are a global threat that requires a global response, and thanked INTERPOL and the Timor-Leste authorities.
- **Timor-Leste authorities**: The Scientific Police Criminal Investigation, the National Intelligence Services, the Financial Intelligence Unit and other agencies investigated and arrested seven suspects in total (police release).
- **INTERPOL**: Describes I-GRIP as a mechanism that uses its member countries' police network to speed up requests for help in financial crime cases.

## 6. Sources

- **Singapore Police Force (Primary, police release)**: "International Cooperation Leading To The Biggest Recovery Of Over USD 40 Million Linked To Business Email Compromise Scam" (2024-08-03) — <https://www.police.gov.sg/media-hub/news/2024/20240803_international_cooperation_leading_to_the_biggest_recovery_of_over_usd_40_mil>
- **INTERPOL (Primary, INTERPOL release, French edition)**: "La police récupère plus de 40 millions d’USD à la suite d’une escroquerie internationale par courriel" (2024-08-06) — <https://www.interpol.int/fr/Actualites-et-evenements/Actualites/2024/La-police-recupere-plus-de-40-millions-d-USD-a-la-suite-d-une-escroquerie-internationale-par-courriel>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
