---
brief_no: 168
title: "グッドスマイルカンパニー：公式ショップの決済ページに不正なプログラムが置かれ、カード番号とセキュリティコードまで漏えいした可能性が示された — 決済ページで動くコードが承認されたものかを、カード情報の入力の前に確かめる層は公表からは見えない"
title_en: "Good Smile Company: An unauthorised program was placed on its official shop's payment page, and card numbers and security codes may have been exposed — No layer is visible that checks, before card entry, that the code running on the payment page was approved"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: []
incident_date: 2026-10-21
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["087-polymarket-frontend-supply-chain", "081-bybit-safe-wallet-ui-injection", "030-stripe-trusted-channel-skimmer"]
status: draft
version: "1.0"
og_lead_ja: "グッスマ公式ショップ：決済ページの不正プログラムで、カード全桁が漏えいの可能性"
og_lead_en: "Good Smile Company: a payment-page program may have exposed full card data"
industries: ["retail"]
attack_method: "privilege-abuse"
countries: ["jp"]
---

## 1. TL;DR

From 13:55 on 21 October to 07:00 on 23 October 2026, an unauthorised program sat on the credit-card payment page of the Good Smile Company official shop. The company's first notice on 23 October said card data was limited to the last four digits and expiry date. Its third and fourth notices (29 and 30 October) put <strong>2,800 users at possible exposure of cardholder name, full 16-digit number, expiry date and security code</strong>. The program on the payment page was identified on 28 October.

The intrusion was noticed: a contractor's call on the morning of 23 October revealed it, and the shop was closed at 07:00. That a program had been running on the payment page was not known until five days later. <strong>What is not visible in the disclosures is a layer that checks, when card data is entered, that the code making up the payment page is the approved code.</strong>

## 2. What happened

- **Site**: the Good Smile Company official shop (e-commerce, Japan). Orders through external payment services (Amazon Pay, PayPal, etc.) and the Rakuten store are said to be unaffected.
- **Cause**: the company understands that a vulnerability in part of the site's system was exploited and administrator privileges obtained. It says this was not the recently reported PHP vulnerability. The class of the entry vulnerability is not disclosed.
- **Unauthorised access**: from shortly after 15:00 on 19 October to shortly before 23:00 on 22 October 2026 (JST). Customer information on the site was viewed several times.
- **Program on the payment page**: 13:55 on 21 October to 07:00 on 23 October. The company understands the exposure as interception of what customers typed on the payment page.
- **Possible exposure, full card data**: 2,800 users — cardholder name, 16-digit number, expiry date and security code. They include 384 who paid by card, people who tried to pay but did not finish, people who put items in the cart but did not proceed, and 185 who changed card details after a pre-order.
- **What cannot be identified**: the company kept no operation records, so it cannot tell those who tried to pay from those who only filled a cart (the latter are thought not to have exposed card data). People who tried but failed to change card details after ordering may also be exposed but cannot be identified.
- **Possible exposure, partial card data**: last four digits and expiry for 402,466 unique registered cards. Exposure of cardholder names and security codes has not been confirmed. The number of people is still being confirmed.
- **Possible exposure, order data**: up to 202 of 7,774 unshipped orders placed before about 23:00 on 22 October, belonging to 5,356 customers, all of whom were contacted because the 202 cannot be pinpointed. (The fourth notice corrected the third notice's "7,673 users".)

The chain was as follows.

1. A vulnerability in part of the site's system was exploited and administrator privileges obtained (access began shortly after 15:00 on 19 October).
2. An unauthorised program was placed on the card payment page (13:55, 21 October).
3. Card data typed on the payment page may have been intercepted by that program.
4. A contractor's call revealed the intrusion and the shop was closed (07:00, 23 October), which also stopped the program.
5. The program was identified (28 October), and the scope widened to full numbers and security codes.

The irreversible actions were steps 2 and 3. Nothing in the disclosures shows a way to check, at the moment of entry, that the code on the page was approved.

## 3. Timeline — disclosure and response

- **2026-10-19**: Unauthorised access begins shortly after 15:00 (until shortly before 23:00 on the 22nd).
- **2026-10-21**: 13:55, the program is placed on the card payment page.
- **2026-10-23**: Shortly after 06:00, a contractor's call reveals the intrusion. Shop closed at 07:00. First notice; report to the Personal Information Protection Commission. Card data described as last four digits and expiry only.
- **2026-10-26**: Second notice (added to the first): not the PHP vulnerability; external payments and the Rakuten store unaffected; all members to be emailed.
- **2026-10-28**: Shortly after 18:30, the program on the payment page is identified.
- **2026-10-29**: Third notice: possible exposure of full numbers and security codes (2,800 users), 402,466 last-four records, and order data.
- **2026-10-30**: Fourth notice (partial correction of the third): order-data scope corrected; newly identified customers emailed; Q&A published.

> Facts here rest on Good Smile Company's official notices (first to fourth) and Q&A. The class of the entry vulnerability, the program's content and destination, and any outside investigator's findings have not been disclosed. "Possible exposure" is the company's wording; no misuse has been disclosed. Parts of the fourth notice and the general Q&A still carry the pre-correction order-data wording; this Brief follows the corrected text.

Response:

- **Individual contact**: users with possible full card exposure and the 5,356 order-data customers have been emailed individually.
- **Remediation**: the suspected vulnerability was fixed from separately kept source code, and connection credentials between systems were invalidated and reissued. No date for reopening.
- **Reporting**: reported to the Personal Information Protection Commission; reports to card companies and the payment processor are still to come.

## 4. Why it wasn't stopped

What is not visible in the disclosures is a layer that checks, at the moment card data is entered, whether the code making up the payment page is approved. Whether the program ran in the browser or was a server-side change has not been disclosed.

That is the **gap between detection and proof**. The intrusion was noticed and the shop closed within an hour of the call. But that a program had run on the payment page for about 41 hours came to light five days after the closure, and until then the first notice described the card data as last four digits only. The page came from the legitimate site and looked like the usual checkout; that the page came from the right site and that the code on it is approved are different facts.

The same structure shows in scoping. With no operation records, the company cannot separate those who tried to pay from those who only filled a cart, and cannot identify those who tried to change card details. Nothing records which version of the code was running when a given person began to type.

The same structure appears in earlier Briefs: [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (third-party JavaScript injection prompted user approvals), [Bybit](/critical/briefs/081-bybit-safe-wallet-ui-injection/) (code injected into the signing interface, about $1.5 billion moved) and [Stripe](/critical/briefs/030-stripe-trusted-channel-skimmer/) (a trusted path used to deliver a card skimmer).

> "The page came from the legitimate site" and "the code on the page is approved" are different facts. The first is established at delivery; the second must be checked at every entry.

## 5. What proof would have changed

A single step could sit directly before card entry: confirming that the code now running on the payment page has an approved origin and content. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Proof of code origin**: register the code that makes up a payment page (browser scripts and server-side programs), at release, as proof of approved origin and content, and check each load against it. Code not in the registration can be stopped before it runs.
- **Proof of change approval**: treat a change to the payment page, or to code it loads, as an approval separate from administrator privileges. With administrator privileges stolen, a change without proof of approval does not take effect.
- **Independent record at the point of entry**: keep which version of the code was running on the screen where card entry began, separately from the site's own records, so the affected scope can be identified later.

</ul>

> Note: the proof shows only that running code matches a registered origin and content, and that changes went through approval. It passes when the approval authority itself is stolen or when the registered code is itself faulty. What happens to information once entered is outside the proof.

This differs from after-the-fact detection, closing the site and contacting users. The detection layer and this layer are complementary, not substitutes: the former notices the intrusion; the latter lets unapproved code on an entry screen be caught before entry and lets the affected scope be identified afterwards.

## 6. Sources

- **Good Smile Company (primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Fourth Update)" (2026-10-30; partial correction of the third update of 10-29) — <https://support.goodsmile.com/hc/en-us/articles/63718007508761>
- **Good Smile Company (primary, company notice)**: first notice (2026-10-23) with second notice added 10-26, Japanese — <https://support.goodsmile.com/hc/ja/articles/63547468806297>
- **Good Smile Company (primary, company Q&A)**: "Group B: Customers Whose Full Credit Card Information May Have Been Exposed" (published 2026-10-29, updated 10-30) — <https://support.goodsmile.com/hc/en-us/articles/63751588397849>

Only the company's own notices serve as primary here; no independent verification or English-language outside reporting has been found. The company continues to update its notices, so numbers, whether data was retrieved and the cause may change. Japanese media and blogs are not used as sources.

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/), [Pillar 01 — Verifiable origin](/pillars/#provenance)
