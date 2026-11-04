---
brief_no: 168
title: "グッドスマイルカンパニー：決済ページに不正なプログラム、カード番号とセキュリティコードが漏えいした可能性"
title_en: "Good Smile Company: A rogue program on the payment page, and card numbers and security codes may have been exposed"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: []
incident_date: 2026-10-21
published: 2026-11-02
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["087-polymarket-frontend-supply-chain", "081-bybit-safe-wallet-ui-injection", "030-stripe-trusted-channel-skimmer"]
status: published
version: "1.0"
og_lead_ja: "グッスマ公式ショップ：決済ページの不正プログラムで、カード全桁が漏えいの可能性"
og_lead_en: "Good Smile Company: a payment-page program may have exposed full card data"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "サイバー攻撃事例 · 決済ページの改ざん"
og_kicker_en: "CYBERATTACK · PAYMENT PAGE TAMPERING"
og_headline_ja: "決済ページに\n不正なプログラム。\n判明は閉鎖の5日後。\n<accent>2,800 人のカード全桁</accent>"
og_headline_en: "Payment page tampered;\nfound 5 days after shutdown.\n<accent>Full card data of 2,800 people.</accent>"
key_figures:
  - value: "2,800"
    label: "People whose cardholder name, full 16-digit number, expiry date and security code may have been exposed"
    tone: "alert"
  - value: "About 41"
    unit: "hours"
    label: "How long the rogue program sat on the payment page (13:55 on 21 Oct to 07:00 on 23 Oct)"
  - value: "402,466"
    unit: "cards"
    label: "Cards whose last four digits and expiry date may have been exposed (excluding duplicates)"
insight:
  slug: "payment-page-code-not-verified"
  label: "Payment page not checked for tampering before entry"
  quote: "What needs protecting is not the stored card number but the code of the page that receives the input."
industries: ["retail"]
controls:
  - slug: "ownership-check"
    item: "Match the scripts loaded on the payment page against an approved list and content, and do not load anything not on it"
  - slug: "audit-trail"
    item: "Record which version of the payment page each payment action ran on, and who performed it"
attack_method: "privilege-abuse"
impact: "Full card data and security codes of 2,800 people, and the last four digits and expiry of 402,466 cards, may have been exposed"
takeaway: "The site did not store full card numbers, but a program placed on the payment page may have intercepted what customers typed. No check is visible in the disclosures that the payment page had not been tampered with before entry."
self_check: "Does your organisation have a list of the scripts its payment page loads?"
countries: ["jp"]
---

## 1. Summary

The company did not store card numbers, but a program placed on its payment page may have read them the moment they were typed. It closed the site an hour after the intrusion came to light, but the program itself came to light only five days later. <strong>If a payment page is rewritten, card numbers can be read the moment they are typed, even when they are not stored.</strong>

## 2. What got through

- **What got through**: A rogue program running on the payment page. It sat there from 13:55 on 21 October to 07:00 on 23 October, and the company believes information entered on the payment page during that time was intercepted.
- **What reached the receiving side**: Customers' browsers received the usual payment screen from the genuine site. In general, neither the appearance nor the connection to the site shows that the code inside the page has been changed.
- **Not disclosed**: The type of vulnerability used to get in, whether the program ran in the browser or was a server-side change, where intercepted data was sent, and any fraudulent card use.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever serves the payment page matches the code running on it against the approved version before card details are entered.

- **Who approves**: The owner of the payment page (the online store). At release, it approves the scripts the payment page loads, and hashes of their content, with a key separate from site administrator rights.
- **Where it is checked**: The server that serves the payment page, and the customer's browser (CSP and Subresource Integrity). Code that does not match the approved version is not loaded.
- **What is recorded**: Which version of the payment page each payment action (starting entry, completing, changing the card) ran on. The customers affected can be narrowed down afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, each time the payment page opens, whether the code running matches the approved version, and keeping a record. Detection means noticing unauthorised access after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Match the payment page's code to the approved version before entry</div>
<div class="rx-zone gapz"><b>In between</b><span>Customers typed into the usual<br>screen from the genuine site</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The contractor reports the access; the site is closed</div>
<div class="rx-g g1"><div class="t">10-21</div><b>Program placed on the payment page</b></div>
<div class="rx-g g2"><div class="t">10-21 to 10-23</div><b>About 41 hours of possible interception</b></div>
<div class="rx-g g3"><div class="t">10-23</div><b>Site closed</b></div>
<div class="rx-g g4"><div class="t">10-28</div><b>Program found</b></div>
</div>
</figure>

Closing the site also stopped the program, but what was noticed was the unauthorised access, not the change to the payment page. Code that reaches the screen being rewritten is an issue shared with [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (JavaScript injected into the interface through a third party) and [Stripe's repurposed API](/critical/briefs/030-stripe-trusted-channel-skimmer/) (a trusted API used to deliver card-skimming code).

## 4. What Lemma does

**Lemma builds the pre-execution check into the system that serves the payment page.** It does not look for intrusions; it confirms that the page code being served now is the approved version.

### Industries and operations to watch

- **Industry · Services & retail**: Online stores with card fields on their own pages. Tampering with the page becomes interception of the input.
- **Operation · Outsourced site development and maintenance**: When changes to the payment page and admin rights are left to a contractor.

### Current controls vs Lemma

It has not been disclosed whether the route in this incident was a script swap or a server-side rewrite of the page. The third column (a flaw in the approved version itself) is not the route here; it is a comparison for a different situation.

| Control | Scripts swapped or added | Page rewritten on the server | A flaw in the approved version itself |
| --- | --- | --- | --- |
| Not storing full card numbers | Not relevant | Not relevant | Not relevant |
| Detecting access and closing the site | Partial | Partial | Not relevant |
| Patching the vulnerability | Partial | Partial | Not relevant |
| Leaving the payment screen to an external processor | Partial (embedded) / Effective (redirect, where the page has no card field) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective (if the approval key is held separately) | Effective (if the approval key is held separately) | Not effective |

Not storing full card numbers protects stored data, and detection and closure work after the fact. Lemma checks the code running on the page itself, before card details are entered. PCI DSS v4.0.1 Requirements 6.4.3 and 11.6.1 have also required authorisation of payment-page scripts and tamper detection since March 2025.

Note: Lemma's check works only when it is built into the system that serves the payment page and the approval key is held separately from site administrator rights. It passes if the approval rights themselves are taken or the checking system itself is rewritten. The company believes administrator privileges were taken; in a server-side rewrite, the list or hashes the check relies on could be rewritten with the same privileges, so the check does not work unless the approval key is held elsewhere. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three points for your organisation to check about payment-page tampering on your online store

- Are changes to the payment page kept from going live on site-admin rights alone?
- If the payment page changes from the approved version, are you alerted the same day?
- Can your records tell customers who tried to pay from those who only added items to the cart?

## 5. Facts and timeline

- **Site**: Good Smile Company's official online shop. Its Rakuten store is not included. The company says no exposure has been confirmed for payments made through Amazon Pay or PayPal; order information, however, is in scope whatever the payment method.
- **Cause**: The company believes a vulnerability in part of its system was exploited and administrator privileges were taken. It says this was not the recently reported PHP vulnerability.
- **Why data that was not stored still leaked**: Card-industry rules (per the PCI SSC FAQ) say security codes, which are authentication data, must not be stored after authorisation, and the company did not store them or full card numbers. It believes the exposure came from information entered on the payment page being intercepted. Attacks of this type are commonly called e-skimming.
- **Full card data possibly exposed**: 2,800 people — 384 who ordered by card, 185 who changed the card for a pre-order, those who tried to pay but did not complete, and those who only added items to the cart. With no record of operations, the last two cannot be told apart, so cart-only customers, who likely had no card data exposed, were contacted too. Customers who tried to change their card after ordering but did not complete it may also have had data exposed; the company says it likewise has no record and cannot identify them (fourth notice).
- **Partial card data**: The last four digits and expiry of 402,466 cards (excluding duplicates) registered by customers.
- **Order information**: Up to 202 viewed orders out of 7,774 orders from 5,356 people.

### Timeline

- **2026-10-19**: Around 15:00, unauthorised access begins (until just before 23:00 on the 22nd).
- **2026-10-21**: At 13:55, the program is placed on the payment page.
- **2026-10-23**: Shortly after 06:00, the contractor's report reveals the unauthorised access; the site is closed at 07:00. First notice (only the last four digits and expiry).
- **2026-10-26**: Second notice (addendum to the first).
- **2026-10-28**: Shortly after 18:30, the program on the payment page is found.
- **2026-10-29**: Third notice discloses possible exposure of full card data and security codes (order-information scope corrected in the fourth notice on the 30th).

> Facts rest on the company's official notices (first to fourth) and Q&As; "may have been exposed" is its wording. What has not been disclosed does not mean no measure was in place. As of 2 November, no fifth notice has been published.

### After disclosure

- **Fix**: Patched the suspected vulnerability and revoked and renewed all connection credentials between the system's components. No reopening date.
- **Notices and reporting**: Emailed affected customers individually and reported to the Personal Information Protection Commission. Says it is asking card companies not to charge customers reissue fees.

## 6. Sources

- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Fourth Update)" (2026-10-30; partial correction of the third notice of 10-29) — <https://support.goodsmile.com/hc/en-us/articles/63718007508761>
- **Good Smile Company (Primary, company notice)**: "Notice of Possible Exposure of Customer Information Due to Unauthorized Access (Updated October 26, 2026)" (first notice 2026-10-23, second notice 10-26) — <https://support.goodsmile.com/hc/en-us/articles/63547468806297>
- **Good Smile Company (Primary, Q&A)**: "Group B: Customers Whose Full Credit Card Information May Have Been Exposed" (published 2026-10-29; content checked 11-02) — <https://support.goodsmile.com/hc/en-us/articles/63751588397849>
- **Good Smile Company (Primary, Q&A)**: "Frequently Asked Questions About Unauthorized Access and Information Exposure (All Customers)" (published 2026-10-29; content checked 11-02) — <https://support.goodsmile.com/hc/en-us/articles/63753982590105>
- **PCI Security Standards Council (Primary, standards body)**: "Coffee with the Council Podcast: Guidance for PCI DSS E-commerce Requirements Effective After 31 March 2025" (2025-03-26) — Requirements 6.4.3 and 11.6.1 take effect · <https://blog.pcisecuritystandards.org/coffee-with-the-council-podcast-guidance-for-pci-dss-e-commerce-requirements-effective-after-31-march-2025>
- **PCI Security Standards Council (Primary, standards body)**: FAQ 1533, "For PCI DSS, why is storage of sensitive authentication data (SAD) after authorization not permitted even when there are no primary account numbers (PANs) in an environment?" — security codes must not be stored after authorisation · <https://www.pcisecuritystandards.org/faqs/1533>
- **Good Smile Company (Primary, company notice, Japanese)**: 「不正アクセスによるお客様情報流出の可能性について（第4報）」 (2026-10-30) — <https://support.goodsmile.com/hc/ja/articles/63718007508761>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
