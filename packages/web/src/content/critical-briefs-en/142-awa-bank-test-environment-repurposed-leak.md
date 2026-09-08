---
brief_no: 142
title: "阿波銀行のテスト環境に外部から不正アクセスがあり、顧客・株主情報のべ2万7,745件が漏えいした — テスト環境という位置づけは、使われ方が変わっても証明し直されることがなかった"
title_en: "An outside party accessed Awa Bank's test environment, leaking 27,745 records of customer and shareholder data — a 'test environment' label was never re-verified as its actual use changed"
pillar: 01-verifiable-origin
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-03-24
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["077-idmerit-kyc-data-exposure", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "阿波銀行、テスト環境への不正アクセスで2.7万件漏えい"
og_lead_en: "Awa Bank: test-environment breach leaks 27,745 records"
---

## 1. TL;DR

On June 3, 2026, Awa Bank, a regional bank headquartered in Tokushima, published the results of its investigation into a leak of 27,745 customer and shareholder records disclosed in April. The source was an environment built for developing and testing the bank's internal information-sharing system, which was never decommissioned after that work finished and kept being used for AI-driven system upgrades instead. The leak was not caught by the bank's own detection; an outside security firm reported it. **What was missing was a layer that independently re-verifies, once an environment built for one purpose shifts to another, whether it should still hold customer data and remain reachable from outside.**

## 2. What happened

- On March 24, 2026, an outside security firm contacted Awa Bank about a possible leak of the bank's data.
- The following night, March 25, the bank confirmed the leaked data was its own and moved to contain the breach, including blocking the unauthorized access route.
- The source was a test environment built for developing and testing the bank's internal information-sharing system ("OA system").
- In its first report on April 3, 2026, the bank confirmed a leak of 27,745 customer and shareholder records in total: 10,872 records of corporate internet-banking customers as of October 2024 (name or company name, registered email address); 11,122 shareholder records as of March 31, 2021 (name or company name, address, shareholder number, shares held — 5,271 of which include the bank account number used for dividend payments); and 5,751 other customer/related-party records (mostly names or company names as of April 2021, 127 of which also include the address and deposit/loan transaction details). The bank stated no PINs or passwords were included.
- In a follow-up report on June 3, 2026, the bank published its findings on the cause. The direct cause was "someone using an ID and password illegitimately to access the test environment from outside," and the bank acknowledged failures in its own governance as well.

The sequence that led to the leak runs as follows.

1. A test environment is built to develop and test the bank's internal information-sharing system.
2. After that development and testing purpose is complete, the environment is not decommissioned and instead continues to be used for AI-driven system upgrade work.
3. Customer data stored in the environment, which should have been deleted once development was complete, is left in place.
4. With the environment's safeguards against unauthorized access not functioning adequately, someone uses an ID and password illegitimately to access it from outside.
5. Awa Bank does not detect this itself; an outside security firm's report on March 24, 2026 is what surfaces it.

## 3. Timeline — disclosure and response

- 2021-03-31: Reference date for the leaked shareholder records.
- 2024-10: Reference date for the leaked corporate internet-banking customer records.
- (Date unknown): Someone uses an ID and password illegitimately to access the test environment from outside. Neither the date of intrusion itself nor how the credentials were obtained has been disclosed as of this writing.
- 2026-03-24: An outside security firm contacts Awa Bank about a possible leak.
- 2026-03-25: The bank confirms the leaked data is its own and implements containment, including blocking the access route.
- 2026-04-03: First report published, confirming the leak of 27,745 customer and shareholder records.
- 2026-06-03: Follow-up report published, with the cause investigation (three governance failures, below) and officer sanctions.

> The figures in this brief are drawn from Awa Bank's own first report (2026-04-03) and follow-up report (2026-06-03). Neither report discloses when the intrusion actually occurred or how the credentials reached a third party. **The identity of the "someone" and the timing of the intrusion remain unidentified and undisclosed; this brief does not treat these as established facts and confines itself to what has been published — the circumstances of discovery, the number of records, the three causes, and the sanctions.**

Response after disclosure:

- President Takehisa Fukunaga and Senior Managing Director Masahiro Yamashita each voluntarily returned 30% of one month's compensation. Managing Director Hiroaki Mikawa had 30% of one month's compensation reduced. Involved staff were also disciplined under internal rules.
- The bank plans to decommission the test environment once the police investigation concludes, and says it will review all of its internal information systems.
- No secondary damage has been confirmed as of this writing.

## 4. Why it wasn't stopped

This incident's failure is neither a sophisticated intrusion technique nor some unusual flaw in how IDs and passwords were managed. **Once an environment built for development and testing shifted to a different purpose — AI-driven system upgrades — nobody independently re-verified whether it should still hold customer data and remain reachable from outside.**

Detection worked. But it wasn't Awa Bank's own detection — it was a report from an outside security firm. What was missing sat one step earlier: a layer that re-verifies authorization and data retention every time an environment's purpose changes.

> "This test environment should have been decommissioned once the system development, testing and similar purposes were complete, but it continued to be used thereafter for work such as AI-driven system enhancement." "The customer data and similar records stored in this test environment should have been deleted promptly once system development and the like were complete, but they had not been deleted after completion." "In this test environment, the mechanism to prevent unauthorized access was not functioning adequately." — the three governance failures the bank disclosed.

The three failures reduce to one structure. The test-environment designation was correct when the environment was built. But it kept that designation long after its purpose was served, even as its actual use shifted to something else — AI-driven system enhancement. Once the designation and the reality diverge, and nothing catches that divergence to re-examine authorization and data retention, holding a valid ID and password becomes the sole basis for allowing access from outside.

The same shape appears where a KYC verification vendor's database sat exposed until outside researchers found it in [Brief 077](/critical/briefs/077-idmerit-kyc-data-exposure/), and where credential revocation didn't happen at the speed the situation required in [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/).

## 5. What proof would have changed

Proof before the fact replaces "a valid ID and password were presented" with "the environment's current purpose and the data it holds were verified to match what is currently authorized" as the basis for granting access. It does not stop a development or test environment from being repurposed. It keeps that repurposing from going unproven while external access remains open.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Proof of purpose</strong>: make an environment's designated purpose — development/testing, or ongoing use handling production-equivalent data — independently re-verifiable as its actual use changes.</li>
<li><strong>Proof of data retention</strong>: continuously verify, for as long as data is retained in an environment, whether that retention still matches the environment's current purpose.</li>
<li><strong>Provenance of access</strong>: separate "holding a valid ID and password" from "this access is legitimate given the current purpose," and record that as the provenance of the action.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not substitute for the technical fixes to the access route itself — patching, network isolation, and the like.</li>
<li>It cannot prove how the ID and password reached a third party; that route itself remains undisclosed as of this writing.</li>
<li>It does not substitute for after-the-fact governance remedies such as officer sanctions or reporting to regulators.</li>
</ul>

The difference from a post-incident governance review is here: a review happens after the problem surfaces, but it gives no way to catch, at the moment it happens, that an environment's purpose has quietly changed.

Detection and this layer are complementary, not substitutes. The former surfaced the leak — in this case, through an outside report. The latter makes it possible to re-verify authorization and data retention the moment an environment's purpose changes, before the next repurposing happens unproven.

## 6. Sources

- **Awa Bank (primary, official disclosure, first report)**: "Notice regarding a leak of customer information due to unauthorized access" (2026-04-03) — <https://www.awabank.co.jp/kojin/news/2026/news20260403a/>
- **Awa Bank (primary, official disclosure, follow-up)**: "Notice regarding a leak of customer information due to unauthorized access (follow-up)" (2026-06-03) — <https://www.awabank.co.jp/kojin/news/2026/news20260603a/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On identity and authorization, see [Pillar 01 — Proof of Origin](/pillars/#provenance).

Figures and the sequence of events are based on Awa Bank's own first and follow-up reports. The actual date of intrusion and how the ID and password reached a third party remain undisclosed by the bank as of this writing.
