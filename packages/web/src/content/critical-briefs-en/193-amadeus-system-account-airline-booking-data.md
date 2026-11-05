---
brief_no: 193
title: "Amadeus：航空会社の予約システムの提供元で、システムアカウントの認証情報による不正アクセスが約 3 年続き、JAL・ANA・キャセイなど複数社の予約情報が参照された(各社の公表)"
title_en: "Amadeus: At the airlines' reservation system provider, unauthorised access with a system account's credentials ran for about three years, and booking data of JAL, ANA, Cathay Pacific and others was viewed (airline disclosures)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-09-23
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["154-yumirlink-cuenote-support-credential-db-export", "069-connectwise-cloud-backup-app-identity-credential-abuse", "152-denmark-cpr-lawful-access-misuse", "172-illuminate-education-ftc-former-customer-data"]
status: draft
version: "1.0"
og_lead_ja: "Amadeus の予約システムで、システムアカウントの認証情報による不正アクセスが約 3 年続き、JAL 約 92,000 名・ANA 約 37,800 名などの予約情報が参照された"
og_lead_en: "At Amadeus, unauthorised access with a system account's credentials ran for about three years; booking data of about 92,000 JAL and 37,800 ANA customers was viewed"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · 委託先の認証情報"
og_kicker_en: "CYBERATTACK · VENDOR CREDENTIALS"
og_headline_ja: "予約システムの提供元で、\n正しい認証情報の照会が\n約 3 年通った。\n<accent>JAL・ANA ほか</accent>"
og_headline_en: "Valid credentials queried\nbookings for three years\nat the system provider.\n<accent>JAL, ANA, Cathay and more.</accent>"
key_figures:
  - value: "2023-08 → 2026-09"
    label: "Period during which unauthorised access with a system account's credentials ran in Amadeus's systems (Cathay Pacific's disclosure)"
    tone: "alert"
  - value: "About 92,000"
    unit: "customers"
    label: "JAL and JTA customers whose booking data shows signs of having been viewed (about 2,000 of them with email, phone and passport numbers too; JAL's disclosure)"
  - value: "About 37,800"
    unit: "customers"
    label: "ANA customers whose booking data shows signs of having been viewed (about 1,700 of them with passport and ticket numbers too; ANA's disclosure)"
glossary:
  - term: "Passenger service system"
    desc: "The system that handles an airline's reservations, ticketing and check-in together. Many airlines share a provider's system, such as Amadeus's."
  - term: "System account"
    desc: "An account used not by a person but by systems or services to connect to each other. Its credentials tend to stay in use for a long time and often lack the multi-factor authentication that a person's login has."
insight:
  slug: "system-account-query-not-tied-to-request"
  stop: true
  label: "A system account's query shows no request"
  quote: "Before reservation data is read, check which airline's work the query is for, against a record of requests rather than a system account's credentials."
industries: ["supply-chain", "retail"]
operations: ["data-access", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Let a query from a system account through only after checking at the entry point which airline's work it is for"
  - slug: "limit-and-revoke"
    item: "Give system account credentials an expiry and a scope, and revoke those unused or old"
  - slug: "hold-unverified"
    item: "Hold, before execution, any read of reservation data that cannot be tied to a record of requests"
  - slug: "audit-trail"
    item: "Record, apart from the provider's system, which account read which airline's bookings under which request"
attack_method: "account-takeover"
impact: "Booking data of about 92,000 JAL and JTA customers, about 37,800 ANA customers and about 53,000 Cathay Pacific bookings shows signs of having been viewed (airline disclosures). Card data and passwords were not included"
takeaway: "A system account's credentials at the reservation system provider were used for queries from outside for about three years. Valid credentials do not show that a query rests on a work request. Check reads against the record of requests before letting them through."
self_check: "Do you know which system accounts at your vendor can read your customer data, and under which requests?"
countries: ["es", "jp"]
search_title: "Amadeus 不正アクセス：JAL・ANA の予約情報の経緯"
search_description: "航空会社の予約システムを提供する Amadeus で、システムアカウントの認証情報による不正アクセスが約 3 年続き、JAL 約 92,000 名・ANA 約 37,800 名の予約情報が参照された（各社の公表）。経緯と対策を整理。"
---

## 1. Summary

In the systems of Amadeus (Spain), which provides passenger service systems to airlines, a third party used login credentials assigned to one of Amadeus's system accounts to access reservation data without authorisation (Cathay Pacific's disclosure). The access ran from August 2023 to September 2026. JAL and JTA say about 92,000 customers, ANA about 37,800 customers and Cathay Pacific about 53,000 bookings show signs of having been viewed.

Most of what was viewed was booking references, names, travel dates, routes and classes; a smaller part also included email addresses, phone numbers and passport numbers. Card data and passwords were not included. Amadeus says it became aware of a vulnerability in a "booking display environment", invalidated the credentials and strengthened monitoring. The airlines say their own systems were not affected.

<strong>A query with valid credentials goes through indefinitely, without showing whose work it is for.</strong>

## 2. What got through

- **What got through**: Queries of reservation data held in Amadeus's systems. According to Cathay Pacific, they were made by a third party using login credentials assigned to Amadeus's system account, from August 2023 to September 2026. In its statement, Amadeus says it became aware of a vulnerability affecting a travel booking display environment, and that certain booking-display data was accessible through it.
- **What reached the accepting side**: In general, a shared reservation system receives only a system account's credentials and the query itself (a booking reference or a name). It does not receive which airline's work the query is for (ticketing, check-in, customer service). If the credentials are valid, the connection is accepted as legitimate, even for three years.
- **Not disclosed**: How the credentials were obtained (the relation between the vulnerability and the credentials). The role and scope of the system account. How many queries were made and how many bookings were viewed in total. When Amadeus became aware (the disclosure dates differ by airline). How the viewed data was used (the airlines say no misuse has been confirmed).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before reservation data is read, the query is checked as resting on a specific airline's work request, against a record of requests kept apart from the system account's credentials.

- **Who approves**: The airline that owns the data. For each kind of work (ticketing, check-in, customer service) it sets the scope of queries (which bookings, which period, which fields) and issues requests in a form the provider's system account cannot produce.
- **Where it is checked**: The step in the provider's system that accepts and executes a query. Even with valid credentials, a query not tied to the record of requests, or one beyond the scope (count, period, fields), is held. This is checked on every query, apart from the credentials' expiry.
- **What is recorded**: Which account read which airline's bookings, under which request. It is kept apart from the provider's system, so each airline can check the impact on its own customers itself.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before reservation data is read, which airline's work the query is for, and keeping a record. Detection means noticing the unauthorised access and invalidating the credentials. Dates rely on the disclosures by Cathay Pacific, JAL and ANA.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a query against the airline's record of work requests before reading</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About three years of unauthorised access<br>About 92,000 JAL, 37,800 ANA customers and 53,000 Cathay bookings</span></div>
<div class="rx-zone det"><b>Detection · worked after about three years</b>Credentials invalidated, vulnerability fixed, airlines notified</div>
<div class="rx-g g1"><div class="t">2023-08</div><b>Unauthorised access with the system account's credentials begins</b></div>
<div class="rx-g g2"><div class="t">2026-09</div><b>End of the access period</b></div>
<div class="rx-g g3"><div class="t">10-23 to 28</div><b>Amadeus notifies JAL, Cathay and others</b></div>
<div class="rx-g g4"><div class="t">10-28 to 30</div><b>JAL, ANA and Cathay disclose</b></div>
</div>
</figure>

It was noticed after about three years, and the airlines say their own systems were not affected. Cases where a provider's or vendor's credentials went through without showing which customer's request they served include [Yumirlink](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/) (the provider's staff credentials) and [ConnectWise](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/) (a vendor's app credentials). A case where a lawful lookup right pulled large volumes of data is [Denmark's CPR](/critical/briefs/152-denmark-cpr-lawful-access-misuse/), and one where a former employee's key stayed active is [Illuminate Education](/critical/briefs/172-illuminate-education-ftc-former-customer-data/). Here, one provider's system account read the bookings of several airlines over three years.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side of the provider's system that accepts and executes queries of reservation data.** It does not look for unauthorised access; it checks, before reading, that a query rests on an airline's work request.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: Companies that hold reservation, customer or inventory data in a provider's system shared by several companies. One system account at the provider reaches every company's data.
- **Industry · Retail & services**: Airlines, travel and hospitality businesses that leave their reservation systems to an outside provider, holding passport numbers and contact details for customers.
- **Operation · Data access**: Queries and exports of reservation data from the provider's system.
- **Operation · Accounts & permissions**: Issuing, expiring and revoking system account credentials.

### Current controls vs Lemma

The route in this case is column 1 (queries with the provider's system account credentials). Column 2 covers a takeover of an airline employee's account, and column 3 a query by the provider's own staff within their rights; nothing disclosed says either happened here.

| Control | Provider's system account credentials | Takeover of an airline employee's account | Query by the provider's own staff |
| --- | --- | --- | --- |
| Regular rotation and revocation of credentials | Partial | Not effective | Not effective |
| Multi-factor authentication on employee logins | Not effective | Effective | Not effective |
| Monitoring and detection on access logs | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Effective |

Regular rotation shortens how long stolen credentials work, but they pass until the next rotation (here the access ran for about three years). Multi-factor authentication protects a person's login but is often absent on system account connections. Monitoring and detection notice after the query, and here that took about three years. Lemma checks, before reading, not whether the credentials are valid but whether the query rests on a work request.

Note: Lemma's check works only when it is built into query execution in the provider's system and the record of work requests is managed apart from the provider's system accounts. If an employee's account is taken over and the request record is forged too, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not recover data already viewed.

### Checklist

Three things to confirm about customer data held in a vendor's system

- Do you know the scope (count, period, fields) of your customer data that the vendor's system accounts can read?
- Do you record the vendor's queries tied to your own work requests, so you can check them yourself later?
- When the vendor suffers unauthorised access, can you establish the impact on your customers from your own records, without waiting for the vendor's report?

## 5. Facts and timeline

- **Parties**: Amadeus IT Group, S.A. (Spain; provides passenger service systems to airlines) and the airlines using its systems. This Brief relies on the disclosures it confirmed: Japan Airlines (JAL) and Japan Transocean Air (JTA), All Nippon Airways (ANA), and Cathay Pacific. Press reports say Korean Air, Asiana Airlines, Singapore Airlines, Malaysia Airlines and others have also disclosed an impact.
- **What happened**: According to Cathay Pacific, in Amadeus's systems a third party using login credentials assigned to Amadeus's system account accessed reservation data without authorisation between August 2023 and September 2026. In its statement, Amadeus says it became aware of a vulnerability affecting a travel booking display environment through which certain booking-display data was accessible, that there is no evidence payment or financial data was accessed, and that there are no indications of exploitation for ransomware.
- **How it was found**: JAL and JTA were told by Amadeus on 23 October. Cathay was notified on 28 October and received details on the 29th. ANA says it was told by Amadeus (no date given). Amadeus's statement does not say when it became aware.
- **Impact and response**: JAL and JTA say that, among booking records held in the vendor's system from 10 August 2023 to 23 September 2026, about 90,000 customers' booking references, names, travel dates, routes and classes, and about 2,000 customers' email addresses, phone numbers, passport numbers, nationality and mileage numbers in addition, show signs of having been viewed; no card numbers or passwords leaked, and no misuse or operational impact has been confirmed. ANA says that, of about 37,800 customers who booked in the same period, about 36,100 had names, booking references, travel dates, routes and classes viewed, and about 1,700 also had email addresses, phone numbers, passport numbers, nationality, mileage numbers, ticket numbers and seat numbers viewed; it was told the credentials concerned have been invalidated and monitoring strengthened. Cathay says about 53,000 bookings were affected, mostly booking references, names and flight details, with a smaller subset possibly including email, phone, travel document and frequent flyer numbers; Amadeus reset passwords and enhanced monitoring, and has found no evidence of misuse. All three say their own systems were not affected.

### Timeline

- **2023-08**: Unauthorised access with the system account's credentials begins in Amadeus's systems (start of the period given in Cathay Pacific's disclosure).
- **2026-09-23**: End of the period of booking records covered by JAL and ANA. Cathay's disclosure puts the access up to September 2026.
- **Early October 2026**: Amadeus issues its statement (dated only "October 2026").
- **2026-10-23**: JAL and JTA are told by Amadeus.
- **2026-10-28**: JAL and JTA disclose. Amadeus notifies Cathay.
- **2026-10-29**: Amadeus gives Cathay further details. ANA discloses that some booking data shows signs of having been viewed through unauthorised access to Amadeus's systems (numbers still being verified).
- **2026-10-30**: ANA discloses the numbers and data items. Cathay discloses.

> The facts rely on the disclosures of JAL and JTA, ANA and Cathay Pacific, and on Amadeus's statement (all primary). On the means of access, Cathay writes of "login credentials assigned to its system account" while Amadeus writes of "a vulnerability affecting a travel booking display environment"; how the two relate has not been disclosed. The impact on other airlines rests on press reports and is not covered in detail here. The total number of bookings viewed, the number of queries and the date Amadeus became aware have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses. Written as of 5 November.

### After disclosure

- **Amadeus**: Says it fixed the vulnerability, enhanced monitoring and detection, and is in direct dialogue with customers and authorities. In its report to Cathay it says it contained the incident, including a password reset.
- **JAL, JTA and ANA**: Are contacting affected customers in turn, by the email address given at booking and other means, and warn of suspicious emails, calls, fake sites and social media advertisements impersonating them.
- **Cathay Pacific**: Informed the relevant authorities, is analysing the data received from Amadeus, and will notify affected customers individually.

## 6. Sources

- **Japan Airlines and Japan Transocean Air (Primary, company disclosure)**: 「Amadeus社が提供する旅客サービスシステムへの不正アクセスについて」 (2026-10-28) — <https://www.jal.co.jp/ja-jp/news/general/2026/other/261028.html>
- **All Nippon Airways (Primary, company disclosure)**: 「Amadeus社 旅客サービスシステムへの不正アクセスについて」 (2026-10-30) — <https://www.ana.co.jp/ja/jp/special-notice/001612.html>
- **Cathay Pacific (Primary, company disclosure)**: "Personal data security incident involving a third-party service provider" (2026-10-30) — <https://www.cathaypacific.com/cx/en_HK/latest-news/security-and-operational-changes/personal-data-security.html>
- **Amadeus (Primary, company statement)**: "Amadeus statement" (October 2026) — <https://amadeus.com/amadeus-statement-oct>
- **Aviation Wire (Press)**: 「JALとJTA、アマデウス不正アクセスで予約情報9.2万人対象 クレカやパスワード流出なし」 (2026-10-28) — <https://www.aviationwire.jp/archives/353202>
- **Aviation Wire (Press)**: 「ANA、アマデウス不正アクセスで予約情報参照か」 (2026-10-29) — <https://www.aviationwire.jp/archives/353245>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
