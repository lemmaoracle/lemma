---
brief_no: 194
title: "クラブツーリズム：予約システムのサーバへの不正アクセスで、緊急連絡先を含むインターネット会員の情報 約 432 万件が流出したおそれ(同社の公表)"
title_en: "Club Tourism: Unauthorised access to a reservation system server may have leaked about 4.32 million online members' records, including emergency contacts (company disclosure)"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [identity-auth]
incident_date: 2026-10-30
published: 2026-11-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["110-sourcenext-member-api-22m-records", "026-cmoa-member-data-system-logs", "171-free-mobile-cnil-former-subscriber-retention", "191-gmo-trustlogin-public-storage-customer-files"]
status: published
version: "1.0"
og_lead_ja: "クラブツーリズム、予約システムのサーバへの不正アクセスで、緊急連絡先を含むインターネット会員の情報 約 432 万件が流出したおそれ"
og_lead_en: "Club Tourism: unauthorised access to a reservation system server may have leaked about 4.32 million online members' records, including emergency contacts"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報漏えい事例 · 予約システム"
og_kicker_en: "DATA LEAK · RESERVATION SYSTEM"
og_headline_ja: "予約サイトの会員情報が、\n緊急連絡先まで含めて\n流出したおそれ。\n<accent>約 432 万件</accent>"
og_headline_en: "Member data, down to\nemergency contacts,\nmay have leaked.\n<accent>About 4.32 million records.</accent>"
key_figures:
  - value: "About 4.32M"
    unit: "records"
    label: "Online members' records that may have leaked (company's first notice). Customers who never registered as online members are not affected"
    tone: "alert"
  - value: "9"
    unit: "fields"
    label: "Fields concerned: name, nationality, sex, date of birth and age, address, phone, email, member ID and emergency contact. Passwords, passport, card and bank account data are not included"
  - value: "10-30 05:45 → 10-31"
    label: "From detecting the unauthorised access from outside and blocking the traffic to the first notice (company's first notice)"
glossary:
  - term: "Online member"
    desc: "A member registered in the company's online reservation system, with the name, contact details and date of birth used for booking tours and sending notices."
  - term: "Emergency contact"
    desc: "The person to contact if the member cannot be reached during a trip. The name and phone number registered belong to someone other than the member, such as a family member."
insight:
  slug: "member-read-not-tied-to-task"
  stop: true
  label: "A read of member data shows no task"
  quote: "Before member data is read, check which reservation or notification task the read is for, against the record of work requests rather than whether the server connection is allowed."
industries: ["retail"]
operations: ["data-access", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Let a connection to a server or admin console through only after checking at the entry point which work request it serves"
  - slug: "minimize-data"
    item: "Keep data about people other than the member, such as emergency contacts, only for the period of the trip, and delete it afterwards"
  - slug: "hold-unverified"
    item: "Hold, before execution, any read of member data that cannot be tied to a work request"
  - slug: "audit-trail"
    item: "Record, apart from the reservation system, who read which member's which fields under which request"
impact: "About 4.32 million online members' records (name, nationality, sex, date of birth, address, phone, email, member ID and emergency contact) may have leaked; passwords, passport, card and bank account data are not included"
takeaway: "Unauthorised access to a reservation system server may have leaked not only members' own data but their emergency contacts too. Let reads of member data through only after checking them against the record of work requests, and keep other people's contact details only as long as needed."
self_check: "Do you know how much data about people other than the member (emergency contacts, travel companions) your reservation or membership system holds, and under which work requests it can be read?"
countries: ["jp"]
search_title: "クラブツーリズム不正アクセス：432万件の経緯"
search_description: "クラブツーリズムで、予約システムのサーバへの不正アクセスにより、緊急連絡先を含むインターネット会員の情報約 432 万件が流出したおそれ（同社の第1信）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

At 05:45 on 30 October 2026, Club Tourism detected unauthorised access from outside to part of its servers (the company's first notice). After blocking the traffic and investigating, it confirmed that some of the online members' data registered in its online reservation system may have leaked. About 4.32 million records are concerned.

The fields are name, nationality, sex, date of birth and age, address, phone number, email address, member ID and emergency contact. Login passwords, passport data, credit card data and bank account numbers are not included. The company says it identified and fixed the intrusion route and method, but has not disclosed what they were. It took its website down, consulted the police, and reported to the Personal Information Protection Commission and its supervisory authority.

<strong>Member data in a reservation system, the member's own and other people's contact details alike, can be taken in a single access unless the read is checked against a request.</strong>

## 2. What got through

- **What got through**: Unauthorised access from outside to part of the servers, and a read of online members' data (company's first notice). The company says the data "may have" leaked; it does not say that removal was confirmed.
- **What reached the accepting side**: In general, a reservation system server receives only the connection's authentication and the read command. It does not receive which task the read serves: processing a booking, sending notices or handling an enquiry. The member's own data and the emergency contact the member registered (another person's contact details) are read together as one member record.
- **Not disclosed**: The intrusion route and method (the company says it identified and fixed them). When the unauthorised access began and how long it lasted. Whether removal was confirmed and what was actually taken. How many people other than members are in the emergency contacts. The role of the affected server (which part of the reservation system).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before member data is read, the read is checked as resting on a specific reservation or notification task, against a record of work requests kept apart from whether the server connection is allowed.

- **Who approves**: The side that uses member data for its work (booking, notices, enquiries). For each task it sets the scope of reads (which members, which fields, how many records) and issues requests in a form that anyone able to connect to the server cannot produce.
- **Where it is checked**: The step in the reservation system that accepts and executes a read of member data. Even when the connection is allowed, a read not tied to the record of requests, or beyond the scope, is held. Fields about other people, such as emergency contacts, are returned only to requests for tasks that need them during the trip.
- **What is recorded**: Who read which member's which fields under which request. It is kept apart from the reservation system, so that the scope of a leak can be established and the members and their emergency contacts informed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a read of member data against the record of work requests before it runs, and keeping a record. Detection means noticing the unauthorised access and blocking the traffic. Dates rely on the company's first notice and the parent company's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a read of member data against the record of work requests before executing it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About 4.32 million records may have leaked<br>Emergency contacts included</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Unauthorised access detected, traffic blocked, server isolated</div>
<div class="rx-g g1"><div class="t">10-30 05:45</div><b>Unauthorised access detected; traffic blocked</b></div>
<div class="rx-g g2"><div class="t">10-30</div><b>Server isolated; website taken down</b></div>
<div class="rx-g g3"><div class="t">10-31</div><b>First notice (about 4.32 million records)</b></div>
<div class="rx-g g4"><div class="t">11-01</div><b>Parent company KNT-CT discloses</b></div>
</div>
</figure>

Detection worked: the company blocked the traffic and isolated the server. Even so, about 4.32 million records may have leaked. Cases where large volumes of member data were taken through unauthorised access to a system managing it include [Sourcenext](/critical/briefs/110-sourcenext-member-api-22m-records/) (a member-data API) and [Comic Cmoa](/critical/briefs/026-cmoa-member-data-system-logs/). A case where the retention of former customers' data was found at fault is [Free Mobile](/critical/briefs/171-free-mobile-cnil-former-subscriber-retention/), and one where customer files sat in a public storage area is [GMO Trust Login](/critical/briefs/191-gmo-trustlogin-public-storage-customer-files/). Here, the data of people other than the members, the emergency contacts they registered, fell within the same scope.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side of the reservation system that accepts and executes reads of member data.** It does not look for unauthorised access; it checks, before execution, that a read rests on a booking or notification task.

### Industries and operations to watch

- **Industry · Retail & services**: Travel, hospitality and event businesses whose membership reservation systems also hold contact details of people other than the member, such as emergency contacts and travel companions. Member counts are large, and one read can cover a wide scope.
- **Operation · Data access**: Reads and exports of member data.
- **Operation · Accounts & permissions**: Rights to connect to servers and admin consoles, and management of connection sources.

### Current controls vs Lemma

The route in this case is column 1 (unauthorised access to the server from outside), though the intrusion route and method have not been disclosed. Column 2 covers a takeover of a staff member's account, and column 3 removal by an insider within their rights; nothing disclosed says either happened here.

| Control | Unauthorised access to the server from outside | Takeover of a staff account | Removal by an insider |
| --- | --- | --- | --- |
| Restricting connections from outside (source restrictions and the like) | Partial | Not effective | Not effective |
| Multi-factor authentication on staff logins | Not effective | Effective | Not effective |
| Detecting and blocking unauthorised access | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Effective |

Restricting connections from outside narrows the entry point, but the intrusion route here has not been disclosed, so which entry was used is unknown. Multi-factor authentication protects a person's login but is often absent on direct server connections. Detection and blocking worked here, but after the read (the possibility of a leak remained). Lemma checks, before execution, not whether the connection is allowed but whether the read rests on a work request.

Note: Lemma's check works only when it is built into read execution in the reservation system and the record of work requests is managed apart from the rights to connect to the server. If the server is breached and the database read directly, data can be read without passing this check. The route here has not been disclosed, and it cannot be said that this mechanism would have stopped it. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not recover leaked data.

### Checklist

Three things to confirm about reservation and membership systems

- Have you decided which fields about people other than the member (emergency contacts, travel companions) you hold, and for how long?
- Do you record reads of member data tied to booking or notification requests, with limits on record counts and fields?
- After unauthorised access, can you establish from your own records which members' which fields were read?

## 5. Facts and timeline

- **Party**: Club Tourism Co., Ltd. (travel; a group company of KNT-CT Holdings).
- **What happened**: According to the company's first notice, on 30 October 2026 unauthorised access from outside to part of its servers meant that some of the customer data it holds may have leaked. The data concerned is that of online members registered in its online reservation system: name (kanji and kana), nationality, sex, date of birth and age, address, phone number, email address, member ID and emergency contact, about 4.32 million records. Login passwords, passport data, credit card data and bank account numbers are not included, and customers who never registered as online members are not affected.
- **How it was found**: At 05:45 on 30 October, the company detected unauthorised access from outside. It began investigating at once, blocked the traffic at the affected point and put the necessary security measures in place.
- **Impact and response**: It isolated the affected server and blocked traffic from the attack source. It says it identified the intrusion route and method, fixed the problem, and checked the scope of impact and for similar events. It took its website down to prevent further harm and to investigate (to be restored once safety is reconfirmed). As of 31 October, no specific secondary harm attributable to the incident had been confirmed. It consulted the police and reported to the Personal Information Protection Commission and its supervisory authority. It will contact affected customers in turn.

### Timeline

- **2026-10-30**: At 05:45, unauthorised access from outside is detected. Traffic is blocked and the server isolated. Further investigation confirms that some customer data may have leaked. The website is taken down.
- **2026-10-31**: First notice (about 4.32 million records; fields concerned and excluded; no secondary harm confirmed; police consulted and authorities notified).
- **2026-11-01**: The parent company, KNT-CT Holdings, discloses the incident as a personal data leak through unauthorised access at a group company and says it will strengthen its management of group companies.

> The facts rely on Club Tourism's first notice (31 October) and KNT-CT Holdings' disclosure (1 November), both primary. The company says the data "may have" leaked; it has not disclosed whether removal was confirmed, the intrusion route and method, the duration of the access, or the server's role. The first notice says only that the website is "currently" down, so this Brief places the shutdown on the day of detection. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response. Written as of 5 November.

### After disclosure

- **Club Tourism**: Is contacting affected customers in turn. It says it will never ask customers, by phone, email, SMS or post, for card numbers, bank account details, PINs, IDs and passwords or My Number in connection with the incident, and warns of suspicious contacts. It recommends changing any password reused on other services and enabling multi-factor authentication. It opened a dedicated help desk, open on weekends and holidays through November.
- **KNT-CT Holdings**: Says it will strengthen its management of group companies.

## 6. Sources

- **Club Tourism (Primary, company disclosure)**: 「不正アクセスによる個人情報漏えいに関するお詫びとお知らせについて （第１信）」 (2026-10-31) — <https://www.club-tourism.co.jp/jpn/news/2026/1031/>
- **KNT-CT Holdings (Primary, parent company disclosure)**: 「グループ会社における不正アクセスによる個人情報漏えいに関するお詫びとお知らせ」 (2026-11-01) — <https://www.kntcthd.co.jp/ja/release/2026/20261101.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
