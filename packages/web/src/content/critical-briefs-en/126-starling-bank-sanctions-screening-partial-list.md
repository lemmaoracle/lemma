---
brief_no: 126
title: "FCA が Starling Bank を £29m 制裁：自動サンクション照合は、2017 年以降ずっと制裁リストの一部としか突き合わせていなかった — 照合は動いていた"
title_en: "FCA fines Starling Bank £29m: since 2017, the automated sanctions screening had been matching customers against only a fraction of the list — the screening ran"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "identity-auth"]
incident_date: 2024-10-02
published: 2026-08-07
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["093-a7a5-stablecoin-sanctions-evasion", "086-sumsub-support-environment-breach", "077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "FCA が Starling Bank を £29m 制裁、自動サンクション照合は全リストの一部のみ"
og_lead_en: "FCA fines Starling Bank £29m — sanctions screening covered only a fraction of the list"
gap_detected: "The screening ran. Customers were matched every day, and the machinery was not missing."
gap_missing: "Whether that matching covered the whole sanctions list went unchecked, from 2017 until the bank noticed in January 2023, before any account was opened."
gap_fix: "Make which list a customer was matched against — and the result — checkable before an account is opened, and let an opening that carries no such proof be held."
analysis_lead_en: "What went unchecked is not whether the matching ran. It is whether that matching covered the whole of the sanctions list."
---

## 1. TL;DR

On 2 October 2024, the UK's Financial Conduct Authority announced a fine of **£28,959,426** against Starling Bank for financial crime failings in its financial sanctions screening. At the centre was a failure of matching: until the bank noticed in January 2023, its automated screening had, **since 2017, been matching customers against only a fraction of the full sanctions list**. Separately, in breach of a requirement it had agreed with the FCA not to open accounts for high-risk customers, it opened over 54,000 accounts for 49,000 such customers between September 2021 and November 2023. The screening layer existed and it ran. **What was missing is the layer that establishes, before an account is opened, that the matching covered the whole of the list.**

## 2. What happened

- Starling Bank is a UK digital bank that grew from roughly 43,000 customers in 2017 to 3.6 million in 2023. The FCA found that its measures against financial crime did not keep pace with that growth.
- In 2021, when the FCA reviewed financial crime controls at challenger banks, it identified serious concerns with the anti-money laundering and sanctions framework in place at Starling. The bank agreed to a requirement restricting it from opening new accounts for high-risk customers until this improved.
- Starling failed to comply, opening over 54,000 accounts for 49,000 high-risk customers between September 2021 and November 2023.
- In January 2023, Starling became aware that its automated screening system had, since 2017, only been screening customers against a fraction of the full list of those subject to financial sanctions. A subsequent internal review identified systemic issues in its financial sanctions framework. Starling has since reported multiple potential breaches of financial sanctions to the relevant authorities.
- The fine was £28,959,426. Starling agreed to resolve the matter and so qualified for a 30% discount; without it the figure would have been £40,959,426.

The failure took shape through the following chain.

1. Automated sanctions screening runs. The machinery is there, and customers are matched every day.
2. But what they are matched against is a fraction of the source list. A sanctioned party can clear the check.
3. High-risk customers, too, have accounts opened without those openings being checked against the agreed restriction.
4. The attribute — sanctioned, or high-risk — surfaces only after the account exists: when the bank notices internally, and when the regulator investigates.

## 3. Timeline — disclosure and response

- 2017: automated screening begins running against a fraction of the full sanctions list rather than the whole (discovered later). The bank has roughly 43,000 customers this year.
- 2021: the FCA reviews financial crime controls at challenger banks and identifies serious concerns with Starling's AML and sanctions framework. Starling agrees to a requirement restricting new accounts for high-risk customers.
- 2021-09 to 2023-11: in breach of that requirement, over 54,000 accounts are opened for 49,000 high-risk customers.
- 2023-01: Starling becomes aware that its screening covered only a fraction of the full list. A subsequent internal review identifies systemic issues in the sanctions framework.
- 2024-10-02: the FCA announces a fine of £28,959,426, after a 30% discount for early resolution.

> The figures, periods, and account counts in this Brief come from the FCA's press release. The Final Notice is published as an encrypted PDF and could not be read directly at the time of writing, so findings specific to that notice are not relied on here. Starling has accepted the FCA's findings and says it has begun remediation — an account from the party involved.

The response and industry movement after disclosure:

- The FCA's joint executive director of enforcement and market oversight commented on Starling's screening controls.

> Starling's financial sanction screening controls were shockingly lax. It left the financial system wide open to criminals and those subject to sanctions. It compounded this by failing to properly comply with FCA requirements it had agreed to, which were put in place to lower the risk of Starling facilitating financial crime.

- The FCA notes that this case took 14 months from opening to outcome, against an average of 42 months for comparable cases.
- Starling has reported potential sanctions breaches to the relevant authorities and says it is remediating its screening and related controls.

## 4. Why it wasn't stopped

The failure here is neither that the matching machinery was absent nor that a check was defeated. **There was no layer that established, before an account was opened, that the matching covered the whole of the sanctions list.**

The screening ran. Customers were matched every day. What was missing sits earlier — a form in which someone could establish, independently, whether what they were matched against was the whole of the source list, and whether that matching bore on the act of opening an account at all. Matching against a fragment does not establish the attribute, however cleanly it clears. And for roughly six years, from 2017 until January 2023, no one inside the bank noticed the state it was in.

> Matching means something only when it covers the whole of the source list. Against a fragment, clearing the check establishes nothing, and a sanctioned party surfaces only after the account exists.

The high-risk account openings have the same shape. The agreement not to open them existed; what did not exist was a form in which each opening could be checked against that agreement. As a structure in which a regulated attribute rides into a financial path without being independently checked, this shares a direction with [Brief 093](/critical/briefs/093-a7a5-stablecoin-sanctions-evasion/) (moving funds under sanctions), and it belongs to the KYC/AML cluster of [Brief 013](/critical/briefs/013-coinbase-kyc-insider-breach/) · [Brief 086](/critical/briefs/086-sumsub-support-environment-breach/) · [Brief 077](/critical/briefs/077-idmerit-kyc-data-exposure/), where the layer that verifies identity and attributes thins out.

## 5. What proof would have changed

Proof-as-auth inserts one step into the path ahead of the moment an account is opened: it fixes what the customer was matched against. It is not that a machine judges whether the match itself was right. It puts "which version, and which extent, of the list was this customer matched against" into a form in which the person on the receiving end can establish it — before the account exists, and without querying the issuer.

Lemma's design against this gap:

<ul class="bd-check">
<li><strong>The list it was matched against, fixed.</strong> Tie the result to the version and extent of the list actually used, and keep which list it rests on in a form that can be checked before the action.</li>
<li><strong>A record of the check.</strong> Keep when that binding was made, under whose issuance, and that it has not been altered since — tamper-evident, in a form that cannot be overturned later. The claim that the customer was screened stops being merely a claim.</li>
<li><strong>Agreed restrictions, bound to the act.</strong> Tie a restriction such as a high-risk designation to each individual account opening, so that compliance with the agreement survives as a verifiable fact rather than a stated policy.</li>
<li><strong>Only the result disclosed.</strong> Without handing over the list itself or the customer's sensitive data, make just the result — not sanctioned, within the agreed restriction — verifiable.</li>
</ul>

What this layer does not carry is worth stating as well.

<ul class="bd-limit">
<li>It does not vouch for the correctness or completeness of the list. Maintaining the source of record is the issuing authority's job.</li>
<li>Whether a result is sound is judged by a person, on the basis of that binding.</li>
<li>The gate on opening an account sits with the bank's own process; this layer supplies the material for that decision, no more.</li>
</ul>

This is also where it differs from an operator's own screening log. A log is something a party produces for itself; neither the regulator nor the counterparty can check it independently. Through the six years in which the matching covered a fragment, the logs would have accumulated normally.

Lemma does not replace sanctions screening products, nor does it detect financial crime. Screening, human review, and audit are complementary to this layer, not alternatives to it. The first catches known matches; the second closes one point before the account exists.

## 6. Sources

- **FCA (primary, announcement)**: "FCA fines Starling Bank £29m for failings in their financial crime systems and controls" (first published 2024-10-02) — <https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls>
- **FCA (primary, regulatory decision)**: Final Notice: Starling Bank Limited (2024) — <https://www.fca.org.uk/publication/final-notices/starling-bank-limited-2024.pdf>
- **Starling Bank (party statement)**: "Starling Bank response to FCA Final Notice" — <https://www.starlingbank.com/news/starling-bank-response-to-fca-final-notice/>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute) · [Brief 093 (moving funds under sanctions)](/critical/briefs/093-a7a5-stablecoin-sanctions-evasion/) · [Brief 013 (Coinbase insider KYC breach)](/critical/briefs/013-coinbase-kyc-insider-breach/)
