---
brief_no: 168
title: "グッドスマイルカンパニー：公式ショップの決済ページに不正なプログラムが置かれ、カード番号とセキュリティコードまで漏えいした可能性が示された — 決済ページで動くコードが承認した版かを、カード情報の入力の前に照合する層は公表からは見えない"
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
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 決済ページの改ざん"
og_kicker_en: "CYBERATTACK · PAYMENT PAGE TAMPERING"
og_headline_ja: "決済ページに\n不正なプログラム。\n判明は閉鎖の5日後。\n<accent>2,800 人のカード全桁</accent>"
og_headline_en: "Payment page tampered;\nfound 5 days after shutdown.\n<accent>Full card data of 2,800 people.</accent>"
summary_labels: ["What happened", "Why it wasn't stopped", "What was missing"]
key_figures:
  - value: "2,800"
    label: "People whose cardholder name, full 16-digit number, expiry date and security code may have been exposed"
    tone: "alert"
  - value: "About 41"
    unit: "hours"
    label: "How long the rogue program sat on the payment page (13:55 on 21 Oct to 07:00 on 23 Oct)"
  - value: "10-23 → 10-28"
    label: "From closing the site to finding the payment-page program"
insight:
  slug: "payment-page-code-not-verified"
  label: "Payment-page code not matched to an approved version"
  quote: "Not storing full card numbers does not help once the payment page is rewritten: the number is read the moment it is typed."
industries: ["retail"]
controls:
  - slug: "ownership-check"
    item: "Match the scripts loaded on the payment page against an approved list and content, and do not load anything not on it"
  - slug: "separate-approval"
    item: "Apply changes to the payment page and its scripts through an approval separate from site administrator rights"
  - slug: "audit-trail"
    item: "Record which version of the payment page each payment action ran on, and who performed it"
attack_method: "privilege-abuse"
impact: "Full card data and security codes of 2,800 people, and the last four digits and expiry of 402,466 cards, may have been exposed"
takeaway: "The site did not store full card numbers, but a program placed on the payment page may have intercepted what customers typed. No layer that checks, before entry, that the page's code is still the approved version is visible in the disclosures."
self_check: "Do you check that the scripts running on your payment page match the version you approved?"
countries: ["jp"]
---

## 1. TL;DR

For about 41 hours from 21 to 23 October 2026, an unauthorised program sat on the credit-card payment page of Good Smile Company's official online shop, and 2,800 people's full card numbers and security codes may have been exposed (fourth notice). The company does not store full card numbers and believes the data was intercepted as customers typed it into the payment page.

The intrusion came to light through the site's contractor, and the site was closed an hour later. The program on the payment page was found five days after the closure.

No layer is visible in the disclosures that checks, before card details are entered, that the code running on the payment page is still the approved version.

## 2. What happened

- **Site**: Good Smile Company's official online shop. Its Rakuten store is outside the scope. Card data for external payments such as Amazon Pay and PayPal is also outside it, but order information is in scope whatever the payment method.
- **Cause**: The company believes a vulnerability in part of its system was exploited and administrator privileges were taken. It says this was not the recently reported PHP vulnerability.
- **Why data that was not stored still leaked**: Card-industry rules say security codes must not be stored after payment, and the company did not store them or full card numbers. It believes the planted program read them the moment they were typed into the payment page. Attacks of this type are commonly called e-skimming.
- **Full card data possibly exposed**: 2,800 people — 384 who ordered by card, 185 who changed the card for a pre-order, those who tried to pay but did not complete, and those who only added items to the cart. With no record of operations, the last two cannot be told apart, so cart-only customers, who likely had no card data exposed, were contacted too.
- **Partial card data**: The last four digits and expiry of 402,466 cards (excluding duplicates) registered by customers.
- **Order information**: Up to 202 viewed orders out of 7,774 orders from 5,356 people.
- **Not disclosed**: The type of vulnerability, whether the program ran in the browser or was a server-side change, where intercepted data was sent, and any fraudulent card use.

## 3. Timeline — disclosure and response

- **2026-10-19**: Around 15:00, unauthorised access begins (until just before 23:00 on the 22nd).
- **2026-10-21**: At 13:55, the program is placed on the payment page.
- **2026-10-23**: Shortly after 06:00, the contractor's report reveals the access; the site is closed at 07:00. First notice (only the last four digits and expiry).
- **2026-10-26**: Second notice: card data for external payments and the Rakuten store are outside the scope.
- **2026-10-28**: Shortly after 18:30, the program on the payment page is found.
- **2026-10-29**: Third notice discloses possible exposure of full card data and security codes; Q&As for each group published.
- **2026-10-30**: Fourth notice corrects the order-information scope.

> Facts rest on the company's official notices (first to fourth) and Q&As; "may have been exposed" is its wording. As of 31 October, no fifth notice has been published.

### After disclosure

- **Fix**: Patched the suspected vulnerability and revoked and renewed all connection credentials between the system's components. No reopening date.
- **Notices and reporting**: Emailed affected customers individually and reported to the Personal Information Protection Commission. Says it is asking card companies not to charge customers reissue fees.

## 4. Why it wasn't stopped

Customers typed into the usual payment screen, delivered by the genuine site. Neither its appearance nor the connection to the site shows that the code inside the page has been changed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means matching, each time the payment page opens, that the code running matches the approved version, and keeping a record. Detection means noticing unauthorised access after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible here</b>Match the payment page's code to the approved version before entry</div>
<div class="rx-zone gapz"><b>Gap</b><span>Customers typed into the usual<br>screen from the genuine site</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Learn of the access from the contractor and close the site</div>
<div class="rx-g g1"><div class="t">10-21</div><b>Program placed on the payment page</b></div>
<div class="rx-g g2"><div class="t">10-21 to 10-23</div><b>About 41 hours of possible interception</b></div>
<div class="rx-g g3"><div class="t">10-23</div><b>Site closed</b></div>
<div class="rx-g g4"><div class="t">10-28</div><b>Program found</b></div>
</div>
</figure>

What detection caught was the unauthorised access, not the change to the payment page. That separation is the **gap between detection and proof**. The same structure appears in [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (JavaScript injected into the interface through a third party) and in [Stripe's repurposed API](/critical/briefs/030-stripe-trusted-channel-skimmer/) (a trusted API used to deliver card-skimming code).

## 5. How to counter this

**To prevent payment-page tampering (e-skimming), load the code on a payment page only after matching it to the version you approved.** Start by asking your contractor or web agency for a list of the scripts your payment page loads.

### Industries and operations to watch

- **Industry · Services & retail**: Online stores with card fields on their own pages. Tampering with the page becomes interception of the input.
- **Operation · Outsourced site development and maintenance**: When changes to the payment page and admin rights are left to a contractor.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Not storing full card numbers | Not relevant | Input may have been intercepted as it was typed. |
| Detecting access and closing the site | Partial | It works after the intrusion, not before card entry. |
| Patching the vulnerability | Partial | Admin rights taken another way would allow the same. |
| Leaving the payment screen to an external processor | Partial | External-payment card data was outside the scope here. But the buttons and links that lead to the external screen sit on your own page and can be rewritten. |

### What is needed

1. **Match the code you load against an approved list.** List the scripts and hashes of their content, and do not load anything missing from the list or changed. CSP and Subresource Integrity can cover part of this.
2. **Apply payment-page changes through an approval separate from admin rights, and detect tampering.** Be alerted if the page or its files in production differ from the approved version. PCI DSS v4.0.1 Requirements 6.4.3 and 11.6.1 have required authorisation of payment-page scripts and tamper detection since March 2025, so these numbers are a shared reference with contractors and processors.
3. **Record which page version each payment ran on, and who made it.** Record starting entry, completing and changing the card, so affected customers can be narrowed down later.

### Checklist

Four points for your organisation to check about payment-page tampering on your online store

- Does your organisation know the full list of scripts loaded on its payment page?
- Are changes to the payment page kept from going live on site-admin rights alone?
- If the payment page changes from the approved version, are you alerted the same day?
- Can your records tell customers who tried to pay from those who only added items to the cart?

Note: the check shows only that the running code matches the approved version. If the approval rights themselves are taken, a rogue version also passes, and order information viewed through the admin screens is not protected.

## 6. Sources

- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Fourth Update)" (2026-10-30; partial correction of the third notice of 10-29) — <https://support.goodsmile.com/hc/en-us/articles/63718007508761>
- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Updated October 26, 2026)" (first notice 2026-10-23, second notice 10-26) — <https://support.goodsmile.com/hc/en-us/articles/63547468806297>
- **Good Smile Company (Primary, Q&A)**: "Group B: Customers Whose Full Credit Card Information May Have Been Exposed" (published 2026-10-29, updated 10-31) — <https://support.goodsmile.com/hc/en-us/articles/63751588397849>
- **Good Smile Company (Primary, Q&A)**: "Frequently Asked Questions About Unauthorized Access and Information Exposure (All Customers)" (published 2026-10-29, updated 10-31) — <https://support.goodsmile.com/hc/en-us/articles/63753982590105>
- **PCI Security Standards Council (Primary, standards body)**: "Coffee with the Council Podcast: Guidance for PCI DSS E-commerce Requirements Effective After 31 March 2025" (2025-03-26) — Requirements 6.4.3 and 11.6.1 take effect · <https://blog.pcisecuritystandards.org/coffee-with-the-council-podcast-guidance-for-pci-dss-e-commerce-requirements-effective-after-31-march-2025>
- **Good Smile Company (Primary, company notice, Japanese)**: 「不正アクセスによるお客様情報流出の可能性について（第4報）」 (2026-10-30) — <https://support.goodsmile.com/hc/ja/articles/63718007508761>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
