---
brief_no: 190
title: "岩井コスモ証券：委託先の管理機能から本人の意図しない売買注文が出された(同社と委託先の公表)"
title_en: "Iwai Cosmo Securities: Orders customers never placed went through a vendor's admin function (company and vendor disclosures)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-10-14
published: 2026-11-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["165-gmo-onamae-desktop-cloud", "032-booking-payout-account-tampering", "167-zeabur-second-breach-admin-token", "046-servicenow-unauthenticated-api"]
status: published
version: "1.1"
og_lead_ja: "岩井コスモ証券、委託先の管理機能への不正アクセスで 7 口座に意図しない売買注文、5 口座で約定"
og_lead_en: "Iwai Cosmo Securities: unintended orders in 7 accounts through a vendor's admin function; 5 executed"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "サイバー攻撃事例 · 証券取引"
og_kicker_en: "CYBERATTACK · SECURITIES"
og_headline_ja: "委託先の管理機能から、\n意図しない注文が通った。\n<accent>5 口座で約定</accent>"
og_headline_en: "Orders placed through a\nvendor's admin function.\n<accent>5 accounts executed.</accent>"
key_figures:
  - value: "7 → 5"
    unit: "accounts"
    label: "Accounts in which orders the customers never placed were entered, and accounts in which they executed (Iwai Cosmo Securities, second notice)"
    tone: "alert"
  - value: "4,975"
    unit: "customers"
    label: "Customers whose names, email addresses and other data were viewable by the attacker (4,611 in the first notice plus 364 found on re-examination)"
  - value: "About ¥50M"
    label: "Loss the vendor Trade Works expects from the incident (extraordinary loss in Q4 of the fiscal year ending December; not final)"
glossary:
  - term: "Passkey"
    desc: "A login method that confirms the person with the device's biometrics or similar instead of a password. Iwai Cosmo Securities says the unauthorized trades did not break passkey authentication."
  - term: "Timely disclosure"
    desc: "A listed company's publication, through the stock exchange's system (TDnet), of facts that affect investors' decisions. Trade Works' notices of 16 and 23 October are of this kind."
insight:
  slug: "order-without-account-holder"
  stop: true
  label: "Orders without the account holder"
  quote: "Before executing an order, check that it carries the account holder's key signature, against the account's own record, not from inside the admin function."
industries: ["finance"]
operations: ["account-admin", "approval"]
controls:
  - slug: "verify-entry"
    item: "Check at the entry point that an order or operation from an admin function is a request signed with the account holder's key"
  - slug: "limit-and-revoke"
    item: "Keep admin functions usable only from a restricted environment, with no route left open from outside"
  - slug: "hold-unverified"
    item: "Hold, before execution, any order that cannot be tied to the account holder's signature"
  - slug: "audit-trail"
    item: "Record, apart from the executing side, which key signed which order and through which route it was executed"
attack_method: "privilege-abuse"
impact: "Orders the customers never placed were entered in 7 accounts and executed in 5 (restored to the pre-trade state the same day). Names, email addresses and other data of 4,975 customers were viewable"
takeaway: "A vendor's admin function was usable from outside, and orders that passed through no customer authentication went through. Check that an order carries the account holder's key signature, against the account's own record, before executing it."
self_check: "Do you know whether the system that executes orders or transfers has any operation that can be run through a route without the account holder's authentication, such as an admin function or an operations console?"
countries: ["jp"]
search_title: "岩井コスモ証券の不正取引：委託先の管理機能と経緯"
search_description: "岩井コスモ証券で、委託先トレードワークスの管理機能への不正アクセスにより、7 口座で本人の意図しない売買注文が出され 5 口座で約定した（両社の公表）。何が起きたか、なぜ通ったか、対策を整理。"
---

> **Revision (v1.1 / 2026-11-09)**: Removed the count (accounts with executed trades) from the title and replaced one checklist item so it no longer repeats the cover self-check. Facts and sources are unchanged.

## 1. Summary

At the vendor Trade Works (TW, which operates and maintains the trading system under contract), one of the system's admin functions was usable from outside (TW's timely disclosure). The function should have been usable only from a restricted environment. Through it, a third party entered orders that Iwai Cosmo Securities' customers never placed in 7 accounts, and the orders executed in 5.

Customer logins were protected by multi-factor authentication and passkeys, and Iwai Cosmo Securities says passkey authentication was not broken. The executed trades were restored to the pre-trade state the same day, and no outflow of funds has been confirmed. Names, email addresses and other data of 4,975 customers were viewable by the attacker.

<strong>Even when the account holder's authentication is not broken, an order goes through if the system accepts orders from a route that passes through no such authentication.</strong>

## 2. What got through

- **What got through**: Execution of trade orders. On 14 October 2026, orders the customers never placed were entered through TW's admin function in 7 accounts and executed in 5 (Iwai Cosmo Securities' second notice; TW's disclosure of 23 October). TW says the third party "used the function to make unauthorized trades". The stocks and amounts have not been disclosed.
- **What reached the accepting side**: In general, an order management system receives the account number, the stock, the quantity and whether to buy or sell. An order from the admin function does not pass through the customer's login route (multi-factor authentication and passkey). Iwai Cosmo Securities says the attacker "exploited a system vulnerability and mounted a brute-force attack". What the brute force targeted has not been disclosed.
- **Not disclosed**: The kind and role of the admin function. The target of the brute-force attack. The stocks, the order amounts and the executed amounts. Whether the attacker profited from the trades. Any report to the police. The results of the third-party inspection TW is conducting.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a trade order is executed, the order is checked as carrying a signature by the account holder's key, against the account's own record kept apart from the system that entered it. The question is not whether a login happened, but whether the holder signed this order.

- **Who approves**: The account holder. An order is entered as a request signed with the key on the holder's device (a passkey). An operation from an admin function goes through only when it ties to that signature.
- **Where it is checked**: The execution step, before the order management system sends the order to the market. If an order carries no signature by the holder, execution is held. This is checked apart from the admin function's settings and from restrictions on connection sources.
- **What is recorded**: Which order was signed with whose key and executed through which route. That record can show, for restoration, compensation or a report to the regulator, whether the order was the holder's request.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before sending a trade order to the market, that it carries the account holder's key signature, against the account's own record, and keeping a record. Detection means finding the unauthorized access, blocking it and reversing the executed trades. Dates rely on the disclosures by Iwai Cosmo Securities and Trade Works.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check an order for the holder's key signature before executing it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unintended orders in 7 accounts<br>Executed in 5 accounts</span></div>
<div class="rx-zone det"><b>Detection · worked the same day</b>Unauthorized access detected and blocked; trades restored to the pre-trade state the same day</div>
<div class="rx-g g1"><div class="t">10-14</div><b>Orders entered through the admin function; 5 accounts execute</b></div>
<div class="rx-g g2"><div class="t">10-14</div><b>Unauthorized access detected; blocked and restored</b></div>
<div class="rx-g g3"><div class="t">10-16</div><b>Both companies publish first notices (4,611 customers' data leaked)</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>Second notice: 4,975 customers and the unauthorized trades</b></div>
</div>
</figure>

Detection worked the same day, and the executed trades were reversed the same day. The orders still reached the market. Cases where an operation went through a legitimate admin screen or an operations channel include [Polaris Holdings and Booking.com](/critical/briefs/032-booking-payout-account-tampering/) (a payout account rewritten) and [Zeabur](/critical/briefs/167-zeabur-second-breach-admin-token/) (an admin token with no expiry). A case where an endpoint configured to require no authentication was queried from outside is [ServiceNow](/critical/briefs/046-servicenow-unauthenticated-api/), and a case where trades the holders did not recognise were reported in trading accounts is [Onamae.com Desktop Cloud](/critical/briefs/165-gmo-onamae-desktop-cloud/). Here, orders reached the market through the vendor's admin function while the customers' logins stayed unbroken.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that sends trade orders to the market.** It does not look for unauthorized access; it checks, before execution, that an order carries the account holder's key signature.

### Industries and operations to watch

- **Industry · Finance**: Firms that have a vendor operate their securities, FX or crypto-asset trading systems. Admin functions and operations channels reach orders and accounts through a route separate from the customer's login.
- **Operation · Account administration**: Operations on accounts from admin functions and operations channels.
- **Operation · Approval**: Execution of trade orders.

### Current controls vs Lemma

The route in this case is column 1 (orders from an admin function that was usable from outside). Column 2 covers orders placed after a customer's own login is taken over; nothing disclosed says that happened here. Column 3 covers an operations staff member using the admin function's rights without a request from the holder.

| Control | Orders from an admin function usable from outside | Takeover of the holder's login | Abuse of rights by operations staff |
| --- | --- | --- | --- |
| Multi-factor authentication and passkeys at login | Not effective | Effective | Not effective |
| Restricting where the admin function can be used from | Effective | Not effective | Not effective |
| Detecting and blocking unauthorized access; reversing executed trades | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Effective |

Multi-factor authentication and passkeys protect only the login route and do nothing for orders from the admin function (here, passkey authentication was not broken). Restricting where the admin function can be used from stops use from outside but does nothing against a login takeover or abuse of rights inside (TW put such restrictions in place after the incident). Detection and blocking act after the unauthorized access, and reversal acts after execution; neither stops an order from reaching the market (here the trades were reversed the same day). Lemma checks, before execution, not the connection source or the strength of the login but whether the order carries the holder's key signature. Even if a password or a code is stolen, the signature of the key on the holder's device cannot be produced.

Note: Lemma's check works only when it is built into the step that sends orders to the market, the key sits on the holder's device, and no signing service at the vendor signs in the holder's place. It passes if the holder's device or key itself is taken over, or if an attacker's key is registered to the account. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not reverse executed trades.

### Checklist

Three things to confirm about the system that executes orders or transfers

- Can you record orders entered from an admin function or an operations channel separately from the holder's own orders, and review them afterwards?
- Do you inspect with the vendor, at a set interval, that admin functions are usable only from a restricted environment?
- Is there a procedure to hold, before execution, an order that cannot be tied to the holder's signature?

## 5. Facts and timeline

- **Parties**: Iwai Cosmo Securities (online trading service "Cosmo Net Trade") and Trade Works Co., Ltd. (Tokyo Stock Exchange Standard Market, 3997), which provides the trading system and operates and maintains it under contract.
- **What happened**: According to TW, a configuration flaw in one of the admin functions of the system it provides left a function that should be usable only from a restricted environment usable from outside. A third party accessed the system through it and entered orders. According to Iwai Cosmo Securities, orders the customers never placed were entered in 7 accounts and executed in 5.
- **How it was found**: On 14 October 2026, Iwai Cosmo Securities detected unauthorized access by a third party and notified TW. TW detected it the same day and suspended the admin function, invalidated the illegitimate connections and blocked traffic from the attack source.
- **Impact and response**: The executed trades were restored to the pre-trade state the same day, and the customers bore no financial burden. No unauthorized outflow of funds has been confirmed. Names, email addresses and other data of 4,975 customers (4,611 in the first notice plus 364 found on re-examination) were viewable. Passwords were not included, and none were confirmed taken. TW expects a loss of about ¥50 million, to be booked as an extraordinary loss in the fourth quarter of the fiscal year ending December 2026, and expects its cyber insurance to apply. No similar event has been confirmed in the systems TW provides to other financial institutions.

### Timeline

- **2026-10-14**: Iwai Cosmo Securities and TW detect the unauthorized access. TW suspends the admin function and blocks the traffic. Orders the customers never placed are entered in 7 accounts and execute in 5. Iwai Cosmo Securities contacts the affected customers and restores the accounts to the pre-trade state.
- **2026-10-16**: Iwai Cosmo Securities publishes its first notice (4,611 customers; names, email addresses and other data). TW's timely disclosure says a configuration flaw in one of the admin functions was exploited and that no passwords were confirmed taken.
- **2026-10-20**: Iwai Cosmo Securities publishes its second notice (4,975 customers; unintended orders in 7 accounts, executed in 5; TW's measures).
- **2026-10-21**: Iwai Cosmo Securities publishes a report (the attacker exploited a vulnerability and mounted a brute-force attack; passkey authentication was not broken; 5 unauthorized executions).
- **2026-10-22 to 23**: Parts of Iwai Cosmo Securities' website become unavailable during maintenance for vulnerability countermeasures.
- **2026-10-23**: TW publishes a progress disclosure (a function that should be usable only from a restricted environment was usable from outside; expected loss of about ¥50 million; cyber insurance).

> The facts rely on Iwai Cosmo Securities' notices (first, second and the report of 21 October) and Trade Works' timely disclosures (16 and 23 October). The second notice gives orders in 7 accounts and executions in 5; the 21 October report says "5 unauthorized executions". The kind of admin function, the target of the brute-force attack, the stocks and amounts, any report to the police and the results of the third-party inspection have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate either company's response.

### After disclosure

- **Iwai Cosmo Securities**: In the second notice it said the first notice left out the unauthorized trades so as not to invite similar attacks while countermeasures were under way, and apologised for the delay. It contacted the affected customers individually and opened a help desk.
- **Trade Works**: It permanently closed the function to use from outside, and put in place restrictions on connection sources, stronger detection and blocking of unauthorized access, and expanded monitoring. It says it is continuing a system-wide inspection with a third-party organisation's expertise and will revise its security reporting standards and information-sharing arrangements. It will disclose the loss again once the amount is final.

## 6. Sources

- **Iwai Cosmo Securities (Primary, news release, first notice)**: 「外部委託先への不正アクセスに伴うお客様情報の漏洩について」 (2026-10-16) — <https://www.iwaicosmo.co.jp/news/2026/10161410.html>
- **Iwai Cosmo Securities (Primary, notice, second notice)**: 「外部委託先への不正アクセスに伴うお客様情報の漏洩について(第2報)」 (2026-10-20) — <https://www.iwaicosmo.co.jp/info/2026/10201710.html>
- **Iwai Cosmo Securities (Primary, online trading notice)**: 「不正アクセスによる個人情報漏洩および不正取引に関するご報告」 (2026-10-21) — <https://www.iwaicosmo.net/info/post_499.html>
- **Iwai Cosmo Securities (Primary, notice)**: 「ホームページの不具合お詫び」 (2026-10-23) — <https://www.iwaicosmo.co.jp/info/2026/10231710.html>
- **Trade Works (Primary, timely disclosure)**: 「当社が提供するシステムへの不正アクセスに関するお知らせ」 (2026-10-16) — <https://www.release.tdnet.info/inbs/140120261016552448.pdf>
- **Trade Works (Primary, timely disclosure)**: 「（開示事項の経過）当社が提供するシステムへの不正アクセスに関するお知らせ」 (2026-10-23) — <https://www.release.tdnet.info/inbs/140120261023555541.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
