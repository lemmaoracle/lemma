---
brief_no: 93
title: "A7A5：ルーブル建てステーブルコインが制裁下で累計 $110B を流した — 取引は誰でも追えるのに、送金主体の制裁属性を実行時に証明・遮断する層がない（CertiK / Elliptic）"
title_en: "A7A5: a ruble-backed stablecoin moved $110B under sanctions — fully traceable on-chain, yet nothing proves or blocks a sender's sanctions status at transaction time (CertiK / Elliptic)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2026-06-24
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "A7A5 が制裁下で累計 $110B — 追えても実行時に制裁属性を遮断できない"
og_lead_en: "A7A5 moved $110B under sanctions — traceable, yet no attribute stops it at transaction time"
gap_detected: "Transactions were fully visible on the public chain; analytics firms and authorities could trace the flows and identify the entities involved after the fact."
gap_missing: "No attribute travels with the transaction to verify — and block — at execution time whether the sender is sanctioned or the source of funds is lawful."
gap_fix: "Attach verifiable regulatory attributes to the sender and the source of funds so the counterparty and settlement infrastructure can verify a sanctions status and block out-of-scope transfers before execution, and prevent it up front."
---

## TL;DR

CertiK reported that the ruble-backed stablecoin A7A5 had moved more than $110 billion on-chain even while under sanctions. A7A5 was created in 2025 with the involvement of Ilan Shor and Promsvyazbank, a Russian state-owned bank serving the defense sector; the UK government estimates its annual transaction volume at roughly $90 billion. Even though the transaction history is fully traceable by anyone on the public chain, there was no attribute layer to prove and block, at the moment of the transaction, whether the counterparty is a sanctioned entity or a designated source of funds — so it could only be stopped by after-the-fact measures like sanctions designations and chain analysis. Settlement had already completed; visibility (detection) did not substitute for blocking beforehand (proof). This is a case of the detection-versus-proof gap in KYC / AML.

---

## 1. Incident overview

- **Subject**: A7A5 (a ruble-pegged stablecoin launched in January 2025). The issuer is Kyrgyzstan-based Old Vector LLC; the originating entity is A7 LLC.
- **Entities involved**: A7 LLC is reported to be 51% owned by Ilan Shor. Shor, a Moldovan national under UK sanctions, was convicted in 2017 in connection with the theft of about $1 billion from three Moldovan banks in 2014. The other major shareholder is reported to be Promsvyazbank (PSB), a Russian state-owned bank serving the defense sector (all per reporting and analytics firms).
- **Scale**: CertiK puts cumulative on-chain transactions above $110 billion, about 43% of the non-US-dollar stablecoin market. Holder wallets rose from roughly 13,000 in February 2025 to about 29,000 by May 2026. The UK government estimates annual volume at roughly $90 billion, and Elliptic reports peaks of about $1 billion moved per day. The primary venue is Grinex, an exchange reported to be the successor to the sanctioned Garantex.
- **Root cause (structural)**: A public chain provides visibility of the transaction (detection) but not a mechanism to prove and block, before execution, the regulatory attributes of the parties — is the counterparty sanctioned, is the source of funds lawful. KYC / AML rely on a one-time check at onboarding, and for transfers via offshore exchanges or between self-hosted wallets, that check does not travel with the transaction.
- **Core**: Whether a transaction is fully traceable and whether a party's sanctions attribute is verifiable at execution time are different questions. Visible or not, if it cannot be blocked at the moment of execution, settlement completes.

---

## 2. Timeline

- 2025-01: A7A5 is created and begins circulating.
- 2025-08-14: OFAC adds A7 LLC, Old Vector LLC, Grinex and other related entities (six in total) to the SDN list.
- 2026-04-08: FinCEN and OFAC propose a rule under the GENIUS Act framework requiring Permitted Payment Stablecoin Issuers (PPSIs) to maintain AML / CFT and sanctions-compliance programs (published in the Federal Register on 2026-04-10).
- 2026-04-23: The EU adopts its 20th sanctions package. The crypto measures take effect on 2026-05-24, banning Russia-established crypto-asset service providers (CASPs) as a class and designating Grinex and others.
- 2026-06: CertiK reports that, even under sanctions, A7A5's cumulative on-chain transactions passed $110 billion and its holder count grew.

> Note: counts, transaction values, and shareholder structure rest on analytics firms such as CertiK and Elliptic and on reporting. Details of the originating and involved entities rely on third-party analysis, not on verifiable disclosure by the parties themselves. This Brief does not condemn any party's motives; it focuses on the structure in which regulatory attributes do not travel with the transaction.

---

## 3. Failure chain

1. **An attribute-free means of transfer**: a ruble-backed stablecoin was created, giving funds under sanction a way to move on-chain at a stable value.
2. **Bypassing the KYC gate**: routing through offshore exchanges and self-hosted wallets, transfers completed without passing a gate where onboarding KYC applies.
3. **Attributes not traveling**: because the sender's "sanctioned" attribute did not travel with the transaction data, the counterparty and the settlement infrastructure received it unable to distinguish it from a legitimate transfer.
4. **After-the-fact identification**: authorities and analytics firms could trace the flows on the public chain after the fact and infer the entities involved from patterns.
5. **Irreversible settlement**: sanctions designations (SDN additions) and exchange designations are after-the-fact measures and cannot undo the large transfers already settled.

---

## 4. Structural analysis

This case sits in Pillar 04 (Regulatory Attribute Proof), category `kyc-aml-disclosure`. The central failure primitive is the **absence of a regulatory-attribute proof that travels with the transaction**. KYC / AML remain a one-time check at onboarding, and later transfers carry no attribute for "is the counterparty sanctioned" or "is the source of funds lawful." So however visible a transaction is, there is no layer to verify and block it at the moment of execution. Secondary tagging notes `attribute-proof-bypass` for verified attributes circulating without traveling with the transaction, and `data-provenance` for the source and lineage of funds not accompanying it.

Brief 013 (Coinbase insider KYC leak), Brief 077 (IDMerit's exposure and unattributability), and Brief 086 (Sumsub support-environment breach) were all failures of *holding and protecting* KYC data. This case is the flip side: **the attribute that KYC supposedly established does not travel with later transactions** — a complementary side of the KYC / AML category. Brief 021 (Wirecard's forged balance attestations) is continuous with it, in that claims about attributes and attribution circulate unverified. Where bridge-configuration cases center on protocol vulnerabilities, this case shows not a protocol flaw but the missing design of the very layer that would put a regulatory attribute onto the transaction.

The effectiveness of sanctions is tested not by whether flows can be tallied after the fact, but by whether a counterparty's attribute can be verified and blocked at the moment the transaction occurs. The more transfers run through offshore routes and between self-hosted wallets, the wider the onboarding-KYC gap grows, reproducing transfers whose attributes never travel.

---

## 5. The detection-versus-proof gap

The visibility of a public chain is powerful for after-the-fact analysis. Analytics firms and authorities could fully trace A7A5's flows and identify their scale and the entities involved. **Detection worked.** This Brief does not diminish that.

But visibility does not prove the parties' attributes. Without an attribute proof to verify and block, at the moment of the transaction, whether the counterparty is sanctioned or the source of funds is lawful, settlement completes, and an after-the-fact designation cannot claw back what has already moved. The EU's 20th sanctions package and the AML / sanctions duties on issuers under the GENIUS Act push toward continuous monitoring and the ability to freeze or reject illicit transactions. But these strengthen surveillance and screening; they do not provide a layer that puts the regulatory attribute itself onto the transaction so it can be verified before execution. However fine the monitoring net, if the attribute is not on the transaction, the counterparty cannot verify the other side at the moment of execution.

Pre-execution attestation and verifiable provenance invert this structure. If the sender and the source of funds carry a verifiable reference to sanctions status and legality, the counterparty and the settlement infrastructure can verify the attribute before execution and block what is out of scope. Visibility of flows (detection) and proof of the attribute (proof) are not substitutes but **complements** — only together does the effectiveness of sanctions advance from after-the-fact tracing to pre-execution blocking.

On why after-the-fact tracing is not blocking beforehand, see [“The last layer left in AI-era cyber defense”](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05).

---

## 6. Response and industry context

- **OFAC** added A7 LLC, Old Vector LLC, Grinex and others to the SDN list on 2025-08-14, targeting the use of stablecoins for Russian sanctions evasion.
- **The EU**, in its 20th sanctions package (adopted 2026-04-23, crypto measures effective 2026-05-24), moved from individual designations toward a cross-sector framework, banning Russia-established CASPs as a class and prohibiting state-backed instruments before they reach scale; Grinex and others were designated, and Kyrgyzstan was activated under the anti-circumvention framework.
- **The US**: FinCEN and OFAC proposed a rule under the GENIUS Act requiring Permitted Payment Stablecoin Issuers to maintain an AML / CFT program, a sanctions-compliance program — the first time federal law explicitly mandates one — and the technical ability to freeze or reject illicit transactions (2026-04).
- **Cross-industry**: interest is growing in the limits of onboarding-time KYC and in attributes that travel with the transaction (an expanded travel rule, on-chain attribute proof). The recognition that visibility alone cannot achieve regulatory aims is surfacing as the next design problem beyond stronger monitoring.

---

## 7. Lemma's analysis

This case shows that transparency (detection) alone cannot achieve regulatory aims. On-chain visibility is powerful for after-the-fact analysis, but the effectiveness of sanctions is tested at the moment a transaction occurs; if the counterparty's attribute cannot be verified and blocked there, settlement goes through however visible it is.

- **An attribute proof that travels with the transaction**: attach a verifiable reference to sanctions status and legality to the sender and the source of funds, so the counterparty can verify before execution
- **Verification that is not one-time**: move KYC from "check once and done" to "a proof travels per transaction," carrying the attribute into transfers after onboarding
- **Verification without aggregating originals**: hand over only the conclusion — "this party is not sanctioned," "the source of funds is lawful" — as an independently verifiable proof, so the verifier does not become an aggregation point for raw attributes
- **Verifiability of pre-execution blocking**: leave verifiable evidence that an out-of-scope transaction stopped before execution, so responsibility and legality are settled by evidence rather than by after-the-fact tracing

Against the design philosophy of the regulatory-attribute-proof category that "visibility of a transaction ≠ proof of a party's attribute," this case is one where the anticipated failure mode materialized at the scale of $110 billion cumulative under sanctions. Visibility of flows (after-the-fact detection) works for analysis and designation, and attribute proof (pre-execution blocking) works for the effectiveness of sanctions — each in a complementary way.

For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **CertiK (over $110B cumulative; ~43% of the non-USD stablecoin market)**: “A7A5 Stablecoin Tops $110 Billion in Transactions Despite Sanctions” (FinanceFeeds, 2026-06) — <https://financefeeds.com/a7a5-stablecoin-tops-110-billion-in-transactions-despite-sanctions/>
- **Elliptic (issuer, shareholder structure, OFAC designations)**: “OFAC targets use of stablecoins for Russian sanctions evasion” — <https://www.elliptic.co/blog/ofac-targets-use-of-stablecoins-for-russian-sanctions-evasion>
- **Elliptic (cumulative transaction value)**: “A7A5: the ruble-backed stablecoin crosses $100 billion in transactions” — <https://www.elliptic.co/blog/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions>
- **Elliptic (EU 20th sanctions package)**: “The EU's 20th sanctions package targets the architecture of crypto sanctions evasion” — <https://www.elliptic.co/blog/eu-20th-sanctions-package-targets-the-architecture-of-crypto-sanctions-evasion>
- **Holland & Knight (AML / sanctions rules under the GENIUS Act)**: “FinCEN and OFAC Propose AML/Sanctions Rules for Stablecoin Issuers Under GENIUS Act” (2026-04) — <https://www.hklaw.com/en/insights/publications/2026/04/fincen-and-ofac-propose-aml-sanctions-rules-for-stablecoin-issuers>
- **Federal Register (PPSI AML / CFT and sanctions-program requirements)**: “Permitted Payment Stablecoin Issuer Anti-Money Laundering / Countering the Financing of Terrorism…” (2026-04-10) — <https://www.federalregister.gov/documents/2026/04/10/2026-06963/permitted-payment-stablecoin-issuer-anti-money-launderingcountering-the-financing-of-terrorism>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
