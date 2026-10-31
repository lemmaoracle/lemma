---
brief_no: 168
title: "グッドスマイルカンパニー：公式ショップの決済ページに不正なプログラムが置かれ、カード番号とセキュリティコードまで漏えいした可能性が示された — 決済ページで動くコードが承認されたものかを、カード情報の入力の前に照合する層は公表からは見えない"
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
og_headline_ja: "決済ページに\n不正なプログラム。\n気づいたのは5日後。\n<accent>2,800 人のカード全桁</accent>"
og_headline_en: "Payment page tampered,\nfound five days later.\n<accent>Full card data of 2,800 people.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "2,800"
    label: "People whose cardholder name, full 16-digit number, expiry date and security code may have been exposed"
    tone: "alert"
  - value: "About 41"
    unit: "hours"
    label: "How long the rogue program sat on the payment page (13:55 on 21 Oct to 07:00 on 23 Oct)"
  - value: "10-23 → 10-28"
    label: "From closing the site to finding the payment-page program"
glossary:
  - term: "Security code"
    desc: "The 3–4 digit number printed on a card, used online to show the payer holds the card. Card-industry rules say it must not be stored after payment."
  - term: "Payment page"
    desc: "The page on an online store where the customer enters card details and confirms payment."
  - term: "Administrator privileges"
    desc: "Rights to change the site's pages and settings. The company believes they were obtained by exploiting a vulnerability in its system."
insight:
  slug: "payment-page-code-not-verified"
  label: "Payment-page code not matched to an approved version"
  quote: "The site did not store full card numbers. Even so, the full number and security code may have been intercepted the moment customers typed them into the payment page."
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
takeaway: "The site did not store full card numbers, but a program placed on the payment page may have intercepted what customers typed. No layer that checks, before entry, that the page's code is the approved version is visible in the disclosures."
self_check: "Do you check that the scripts running on your payment page match the version you approved?"
countries: ["jp"]
---

## 1. TL;DR

From 13:55 on 21 October to 07:00 on 23 October 2026, an unauthorised program sat on the credit-card payment page of Good Smile Company's official online shop. In its first notice on 23 October the company said only the last four digits and expiry dates were exposed; in its third and fourth notices on 29 and 30 October it said 2,800 people's cardholder names, full 16-digit numbers, expiry dates and security codes may have been exposed.

The company does not store full card numbers or security codes. It believes the exposure came from the program placed on the payment page intercepting what customers typed. What customers saw was the usual payment screen, delivered by the genuine site.

The intrusion was noticed. It came to light on the morning of 23 October through the site's contractor, and the company closed the site an hour later, but the payment-page program was found five days after that. What did not work was a layer that checks, before card details are entered, that the code running on the payment page was approved.

## 2. What happened

- **Site**: Good Smile Company's official online shop. Orders paid through external services such as Amazon Pay and PayPal, and its Rakuten store, are said to be outside the scope.
- **Cause**: The company believes a vulnerability in part of the site's system was exploited and administrator privileges were obtained. It says this was not the recently reported PHP vulnerability.
- **Unauthorised access**: From around 15:00 on 19 October to just before 23:00 on 22 October (JST). Customer information recorded on the site was viewed several times.
- **Rogue program**: Placed on the credit-card payment page from 13:55 on 21 October to 07:00 on 23 October. The company believes information entered on the page was intercepted.
- **Full card data possibly exposed**: 2,800 people — cardholder name, 16-digit number, expiry date and security code. They include 384 who ordered by card in the period, those who tried to pay by card but did not complete, those who logged in and added items to the cart without going to payment, and 185 who changed the card for a pre-order.
- **What cannot be identified**: The site keeps no record of these operations, so it cannot tell those who tried to pay and did not complete from those who only added items to the cart (the company believes the latter had no card data exposed). Customers who tried and failed to change their card after ordering may also be affected but cannot be identified.
- **Partial card data possibly exposed**: Customers who had registered a card — the last four digits and expiry of 402,466 cards, excluding duplicates. Exposure of cardholder names and security codes has not been confirmed. The number of people is still being checked.
- **Order information possibly exposed**: Up to 202 of 7,774 unshipped orders (5,356 people) placed before about 23:00 on 22 October — name, address, phone number, email, order contents, amount and payment method. Because the 202 cannot be identified, all 5,356 have been contacted.
- **Not disclosed**: The type of vulnerability used to get in, whether the program ran in the browser or was a server-side change, where intercepted data was sent, the external investigators' findings, and any fraudulent card use.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it is ②. If the payment page's code is matched to the approved version, a planted program is not loaded before the entry in ③. The vulnerability in ① and the contents of the program in ② have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Gains admin rights through a vulnerability</b><p>From 15:00 on 10-19. Type not disclosed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">2</div><b>Places a program on the payment page</b><p>13:55 on 10-21.</p></div>
<div class="rx-step crit"><div class="who">Customer</div><div class="no">3</div><b>Enters card details on the usual screen</b><p>Possibly intercepted. 2,800 people.</p></div>
<div class="rx-step"><div class="who">Company</div><div class="no">4</div><b>Closes the site</b><p>07:00 on 10-23. Program found on 10-28.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-19**: Around 15:00, unauthorised access begins (until just before 23:00 on the 22nd).
- **2026-10-21**: At 13:55, the program is placed on the credit-card payment page.
- **2026-10-23**: Shortly after 06:00, the contractor's report reveals the unauthorised access; the site is closed at 07:00. First notice says only the last four digits and expiry were exposed. Reported to the Personal Information Protection Commission.
- **2026-10-26**: Second notice (addendum). The cause was not the PHP vulnerability; external-payment orders and the Rakuten store are outside the scope.
- **2026-10-28**: Shortly after 18:30, the program on the payment page is found.
- **2026-10-29**: Third notice: possible exposure of full card data and security codes (2,800 people), last four digits and expiry of 402,466 cards, and the order-information scope. Q&As for each group published.
- **2026-10-30**: Fourth notice (partial correction of the third). Order-information scope corrected; newly identified customers emailed early that morning.

> Facts rest on Good Smile Company's official notices (first to fourth) and its Q&As. "May have been exposed" is the company's wording. Part of the uncorrected order-information text remains in the fourth notice; this Brief follows the corrected text. As of 31 October, no fifth notice has been published.

### After disclosure

- **Individual notices**: Emailed the 2,800 people whose full card data may have been exposed and the 5,356 whose order information may have been.
- **Fix**: Patched the suspected vulnerability using separately kept source code of the management system, and revoked and renewed all connection credentials between the system's components. No reopening date.
- **Card reissue**: Asks customers to check statements and consider reissuing cards, and says it is asking card companies not to charge customers reissue fees.
- **Reporting**: Reported to the Personal Information Protection Commission; reports to card companies and the payment processor are to follow.

## 4. Why it wasn't stopped

The failure here is not only that administrator privileges were taken. No **layer that checks, before card details are entered, that the code running on the payment page was approved** is visible in the disclosures.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means matching, each time the payment page opens, that "the code running now is the approved version", and keeping a record. Detection means noticing unauthorised access after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible here</b>Match the payment page's code to the approved version before entry</div>
<div class="rx-zone gapz"><b>Gap</b><span>Customers typed into the usual<br>screen from the genuine site</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Learn of the access from the contractor and close the site</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Program placed on the payment page</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>About 41 hours of possible interception</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Site closed on 10-23</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Program found on 10-28</b></div>
</div>
</figure>

Detection worked: the site was closed an hour after the report, which also stopped the program. But "the page came from the genuine site" and "the code on the page is the approved version" are separate facts; for about 41 hours before the closure nothing visible in the disclosures checked the second, and the program itself was found five days after the closure. With no record of operations, those affected cannot be narrowed down afterwards, so people who only added items to the cart were also notified. That separation is the **gap between detection and proof**, and it is a structural one.

The same structure appears in [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (JavaScript injected into the interface through a third party).

## 5. How to counter this

**Load the code on a payment page only after matching it to the version you approved.** Not storing full card numbers protects stored data, but not what is read off the screen at the moment of entry. Even if administrator rights are taken, keep unapproved changes from reaching the payment page, and make sure you notice at once if they do. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Services & retail**: Online stores that have customers type card numbers into their own site's pages. If the card fields sit on your own page rather than an external payment screen, tampering with the page becomes interception of the input.
- **Operation · Outsourced site development and maintenance**: When changes to the payment page and admin rights are left to a contractor. The question is whether the client knows who changed the payment page, and when.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Not storing full card numbers | Not relevant | The company did not store full numbers or security codes. It believes the exposure came from intercepting input. |
| Detecting access and closing the site | Partial | The site was closed an hour after the report, which stopped the program. It had run for about 41 hours before that. |
| Patching the vulnerability | Partial | The way in was closed. If another way in exists, admin rights can still rewrite the payment page. |
| Leaving the payment screen to an external processor | Partial | External-payment orders were outside the scope. Not taking card numbers on your own page narrows this path, but the part that sends customers to the external screen can still be rewritten. |

### What is needed

1. **Match the code the payment page loads against an approved list.** Keep a list of the scripts it loads and hashes of their content, and do not load anything missing from the list or whose content has changed. Browser mechanisms (CSP and Subresource Integrity) can cover part of this.
2. **Apply payment-page changes through an approval separate from admin rights.** Changes to the payment page and its scripts should not go live on site-admin rights alone, and you should be alerted if the version running in production differs from the approved one.
3. **Record which page version each payment ran on, and who made it.** Record the payment page's version and payment actions (starting entry, completing, changing the card) so that the customers affected can be narrowed down if something happens.

### Checklist

Three points for your organisation to check about payment-page code

- Does your organisation know the full list of scripts loaded on its payment page?
- If the payment page changes from the approved version, are you alerted the same day?
- Can your records tell customers who tried to pay from those who only added items to the cart?

Note: the check shows only that the code on the page matches the approved version and that changes went through approval. It passes if the approval rights themselves are taken or the approved version is flawed. Unauthorised access to the admin screens and the viewing of order information are not stopped by this layer. The vulnerability used and the program's contents have not been disclosed. If later notices reveal them, this Brief will be revised.

## 6. Sources

- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Fourth Update)" (2026-10-30; partial correction of the third notice of 10-29) — <https://support.goodsmile.com/hc/en-us/articles/63718007508761>
- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Updated October 26, 2026)" (first notice 2026-10-23, second notice 10-26) — <https://support.goodsmile.com/hc/en-us/articles/63547468806297>
- **Good Smile Company (Primary, Q&A)**: "Group B: Customers Whose Full Credit Card Information May Have Been Exposed" (published 2026-10-29, updated 10-31) — <https://support.goodsmile.com/hc/en-us/articles/63751588397849>
- **Good Smile Company (Primary, Q&A)**: "Frequently Asked Questions About Unauthorized Access and Information Exposure (All Customers)" (published 2026-10-29, updated 10-30) — <https://support.goodsmile.com/hc/en-us/articles/63753982590105>
- **Good Smile Company (Primary, company notice, Japanese)**: 「不正アクセスによるお客様情報流出の可能性について（第4報）」 (2026-10-30) — <https://support.goodsmile.com/hc/ja/articles/63718007508761>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
