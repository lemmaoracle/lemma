---
brief_no: 93
title: "A7A5：ルーブル建てのステーブルコインが、制裁の指定の後も取引を伸ばしたと報告された(CertiK・Elliptic の分析)"
title_en: "A7A5: a ruble-backed stablecoin kept growing after sanctions designations, analytics firms report (CertiK / Elliptic)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2026-06-24
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation"]
status: published
gate: "payment-instruction"
version: "1.0"
og_lead_ja: "A7A5：ルーブル建てステーブルコインの累計取引額が、制裁の下でも 1,100 億ドルを超えたと CertiK が報告"
og_lead_en: "A7A5: CertiK reports a ruble-backed stablecoin passed $110B in cumulative transactions under sanctions"
layout: "report"
sections: "proof"
og_kicker_ja: "制裁の事例 · ステーブルコイン"
og_kicker_en: "SANCTIONS CASE · STABLECOIN"
og_headline_ja: "ルーブル建ての暗号資産、\n制裁下でも取引が増える。\n<accent>累計 1,100 億ドル超と報告</accent>"
og_headline_en: "A ruble stablecoin\ngrows under sanctions.\n<accent>CertiK: over $110B moved</accent>"
key_figures:
  - value: "$110B+"
    label: "A7A5's cumulative on-chain transactions, still growing under sanctions (CertiK)"
    tone: "alert"
  - value: "~43"
    unit: "%"
    label: "Share of the non-US-dollar stablecoin market (CertiK)"
  - value: "~$90B"
    label: "Estimated annual transaction volume (UK government)"
glossary:
  - term: "Stablecoin"
    desc: "A crypto asset whose value is pegged to a fiat currency or similar. A7A5 is pegged to the Russian ruble."
  - term: "SDN list"
    desc: "The list of sanctioned parties published by the US Treasury's Office of Foreign Assets Control (OFAC). Dealing with listed parties is prohibited under US sanctions."
  - term: "Self-hosted wallet"
    desc: "A wallet whose keys the user holds directly, without an exchange or other provider. Transfers can be sent and received without passing a provider's KYC."
insight:
  slug: "traceable-is-not-screened"
  label: "Traceable is not checked before receipt"
  quote: "That a transaction can be traced by anyone does not mean the counterparty's sanctions status was checked before it was accepted; without that check before execution, a transfer is identified only after it has settled."
industries: ["finance"]
controls:
  - slug: "ownership-check"
    item: "Check the sender's and the funds' sanctions status before a transfer is executed"
  - slug: "hold-unverified"
    item: "Stop a transaction whose attributes cannot be confirmed before it executes"
impact: "Over $110 billion moved on-chain under sanctions"
takeaway: "Anyone could trace the transactions on the public chain, but a sanctions designation does not undo transfers that have already settled. Check the counterparty's and the funds' sanctions status before accepting."
self_check: "Before accepting a crypto transfer, do you check whether the sender and the source of funds fall under sanctions?"
countries: ["ru", "kg"]
---

## 1. Summary

A7A5 was created in 2025 with the reported involvement of Ilan Shor and Promsvyazbank, a Russian state-owned bank serving the defense sector (per reporting and analytics firms). In August 2025 the US OFAC added the issuer and the main exchange to its sanctions list, and CertiK reported that the holder count kept rising under sanctions. The transaction history is traceable by anyone on the public chain, and analytics firms and authorities could identify the flows and the entities involved. But a sanctions designation does not undo transfers that have already settled. <strong>That a transaction can be traced by anyone does not mean the counterparty's sanctions status was checked before it was accepted; without that check before execution, a transfer is identified only after it has settled.</strong>

## 2. What got through

- **What got through**: On-chain transfers of A7A5, a ruble-backed stablecoin. The main venue was Grinex, an exchange reported to be the successor to the sanctioned Garantex (analytics firms and reporting). Transfers routed through offshore exchanges and self-hosted wallets are reported to have completed without passing a gate where onboarding KYC applies.
- **What the receiving side gets**: In general, the receiving side of an on-chain transfer gets the sending address and the amount; whether the sender is sanctioned or the source of funds is lawful is not part of the transaction data. KYC is a check at onboarding, and its result does not arrive with each later transfer.
- **What was learned afterward**: Analytics firms and authorities traced the flows on the public chain and identified the scale and the entities involved. Sanctions designations (SDN additions) and exchange designations do not undo transfers that have already settled.
- **Not disclosed**: Who sent and received individual transfers, and what checks the receiving side performed, and when.

## 3. What to check

The condition that holds whatever the route is this: before accepting a transfer, check whether the sender and the source of funds fall under sanctions, separately from whether the transaction can be traced.

- **Who approves**: The provider that verified the sender's identity and sanctions status, and the party that, on that basis, issues the conclusion "not sanctioned" or "source of funds lawful." Being able to see the sending address is not an approval.
- **Where the check happens**: At the exchange or payment provider, before it accepts and settles the transfer. Only the conclusion is passed along, so the receiving side can check it without collecting the underlying personal attributes. Transfers that cannot be checked are held before execution.
- **What remains**: A record of which transfer was accepted, or stopped, on the basis of which conclusion, so the grounds for each acceptance can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the sender's and the funds' sanctions status before accepting a transfer, and keeping a record. Detection means identifying flows and entities by chain analysis after the transfer, and designating them. Dates are from authorities' and analytics firms' disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the sender's and the funds' sanctions status before accepting</div>
<div class="rx-zone gapz"><b>What was reported</b><span>Cumulative volume kept growing<br>after the designations</span></div>
<div class="rx-zone det"><b>Detection · worked after the transfers</b>Identified by chain analysis, then designated</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>A7A5 is created and begins circulating</b></div>
<div class="rx-g g2"><div class="t">2025-08-14</div><b>OFAC adds the issuer, Grinex and others to the SDN list</b></div>
<div class="rx-g g3"><div class="t">2026-04-23</div><b>The EU adopts its 20th sanctions package</b></div>
<div class="rx-g g4"><div class="t">2026-06</div><b>CertiK reports over $110B cumulative</b></div>
</div>
</figure>

Chain analysis identified A7A5's flows and the entities involved and led to sanctions designations, but it identified them after the transfers had settled. Cases about holding and protecting KYC data are [Coinbase's insider KYC leak](https://lemma.frame00.com/critical/briefs/013-coinbase-kyc-insider-breach/) (Brief 013), [IDMerit's exposure](https://lemma.frame00.com/critical/briefs/077-idmerit-kyc-data-exposure/) (Brief 077) and [the Sumsub support-environment breach](https://lemma.frame00.com/critical/briefs/086-sumsub-support-environment-breach/) (Brief 086); this case is the other side, where the attribute KYC established does not travel with later transactions. Claims about attributes circulating unchecked echo [Wirecard's forged balances](https://lemma.frame00.com/critical/briefs/021-wirecard-balance-attestation/) (Brief 021).

## 4. What Lemma does

**Lemma builds the check in section 3 into the procedure for accepting and settling a transfer.** It does not trace flows or compile sanctions lists; before acceptance, it checks that a verified conclusion of "not sanctioned" exists for the sender and the source of funds, and stops transfers that cannot be checked.

### Industries and operations to watch

- **Industry · Finance**: Crypto exchanges, stablecoin issuers and payment providers that accept crypto transfers, where onboarding KYC and the acceptance of each later transfer are separate procedures.

### Current controls vs Lemma

According to analytics firms and reporting, the main route in this case is column 2 (transfers via offshore exchanges and self-hosted wallets).

| Control | Accepting transfers at regulated exchanges and issuers | Transfers via offshore exchanges and self-hosted wallets |
| --- | --- | --- |
| KYC at onboarding | Partial | Not effective |
| Transaction monitoring and sanctions-list screening | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Partial |

KYC at onboarding is a check at account opening, and its result does not arrive with each later transfer. Monitoring and screening work inside regulated providers and do not reach transfers that never pass that gate. The EU's 20th sanctions package and the proposed rules for issuers under the GENIUS Act push toward this monitoring and toward the ability to freeze or reject illicit transactions. Lemma checks the conclusion about the sender and the source of funds before acceptance, stops transfers that cannot be checked, and keeps a record.

Note: Lemma's check works only when the accepting provider builds it into its procedure for accepting and settling transfers, and the conclusion is issued by a verifying provider separate from the sender. It does not act on exchanges that have not built it in, or on transfers that stay entirely between self-hosted wallets. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, nor does it determine whether a party is sanctioned.

### Checklist

Three items to confirm for providers that accept crypto transfers

- Do you have a procedure to check the sender's sanctions status for each transfer after onboarding as well?
- Do you have a procedure to hold, before settlement, a transfer whose sender and source of funds cannot be checked against sanctions?
- Do you record which transfer you accepted, or stopped, on the basis of which check?

## 5. Facts and timeline

- **Subject**: A7A5 (a ruble-pegged stablecoin launched in January 2025). The issuer is Kyrgyzstan-based Old Vector LLC; the originating entity is A7 LLC.
- **Entities involved**: A7 LLC is reported to be 51% owned by Ilan Shor. Shor, a Moldovan national under UK sanctions, was convicted in 2017 in connection with the theft of about $1 billion from three Moldovan banks in 2014. The other major shareholder is reported to be Promsvyazbank (PSB), a Russian state-owned bank serving the defense sector (all per reporting and analytics firms).
- **Scale**: CertiK puts cumulative on-chain transactions above $110 billion, about 43% of the non-US-dollar stablecoin market. Holder wallets rose from roughly 13,000 in February 2025 to about 29,000 by May 2026. The UK government estimates annual volume at roughly $90 billion, and Elliptic reports peaks of about $1 billion moved per day.
- **Venue**: The main venue is Grinex, an exchange reported to be the successor to the sanctioned Garantex (analytics firms and reporting).

### Timeline

- **2025-01**: A7A5 is created and begins circulating.
- **2025-08-14**: OFAC adds A7 LLC, Old Vector LLC, Grinex and other related entities (six in total) to the SDN list.
- **2026-04-08**: FinCEN and OFAC propose a rule under the GENIUS Act framework requiring Permitted Payment Stablecoin Issuers (PPSIs) to maintain AML / CFT and sanctions-compliance programs (published in the Federal Register on 2026-04-10).
- **2026-04-23**: The EU adopts its 20th sanctions package. The crypto measures take effect on 2026-05-24, banning Russia-established crypto-asset service providers (CASPs) as a class and designating Grinex and others.
- **2026-06**: CertiK reports that, even under sanctions, A7A5's cumulative on-chain transactions passed $110 billion and its holder count grew.

> Counts, transaction values, and shareholder structure rest on analytics firms such as CertiK and Elliptic and on reporting. Details of the originating and involved entities rely on third-party analysis, not on verifiable disclosure by the parties themselves. The characterization as sanctions evasion is that of authorities and analytics firms. This Brief does not judge any party's motives, nor does it assess the conduct of individual exchanges or users. What has not been disclosed does not mean there were no controls.

### After disclosure

- **OFAC** added A7 LLC, Old Vector LLC, Grinex and others to the SDN list on 2025-08-14, targeting the use of stablecoins for Russian sanctions evasion (Elliptic).
- **The EU**, in its 20th sanctions package (adopted 2026-04-23, crypto measures effective 2026-05-24), moved from individual designations toward a cross-sector framework, banning Russia-established CASPs as a class and prohibiting state-backed instruments before they reach scale; Grinex and others were designated, and Kyrgyzstan was activated under the anti-circumvention framework (Elliptic).
- **The US**: FinCEN and OFAC proposed a rule under the GENIUS Act requiring Permitted Payment Stablecoin Issuers to maintain an AML / CFT program, a sanctions-compliance program — the first time federal law explicitly mandates one — and the technical ability to freeze or reject illicit transactions (2026-04).
- **Industry discussion**: Interest is growing in the limits of onboarding-time KYC and in attributes that travel with the transaction (an expanded travel rule, on-chain attribute checks).

## 6. Sources

- **CertiK (over $110B cumulative; ~43% of the non-USD stablecoin market)**: “A7A5 Stablecoin Tops $110 Billion in Transactions Despite Sanctions” (FinanceFeeds, 2026-06) — <https://financefeeds.com/a7a5-stablecoin-tops-110-billion-in-transactions-despite-sanctions/>
- **Elliptic (issuer, shareholder structure, OFAC designations)**: “OFAC targets use of stablecoins for Russian sanctions evasion” — <https://www.elliptic.co/blog/ofac-targets-use-of-stablecoins-for-russian-sanctions-evasion>
- **Elliptic (cumulative transaction value)**: “A7A5: the ruble-backed stablecoin crosses $100 billion in transactions” — <https://www.elliptic.co/blog/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions>
- **Elliptic (EU 20th sanctions package)**: “The EU's 20th sanctions package targets the architecture of crypto sanctions evasion” — <https://www.elliptic.co/blog/eu-20th-sanctions-package-targets-the-architecture-of-crypto-sanctions-evasion>
- **Holland & Knight (AML / sanctions rules under the GENIUS Act)**: “FinCEN and OFAC Propose AML/Sanctions Rules for Stablecoin Issuers Under GENIUS Act” (2026-04) — <https://www.hklaw.com/en/insights/publications/2026/04/fincen-and-ofac-propose-aml-sanctions-rules-for-stablecoin-issuers>
- **Federal Register (PPSI AML / CFT and sanctions-program requirements)**: “Permitted Payment Stablecoin Issuer Anti-Money Laundering / Countering the Financing of Terrorism…” (2026-04-10) — <https://www.federalregister.gov/documents/2026/04/10/2026-06963/permitted-payment-stablecoin-issuer-anti-money-launderingcountering-the-financing-of-terrorism>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
