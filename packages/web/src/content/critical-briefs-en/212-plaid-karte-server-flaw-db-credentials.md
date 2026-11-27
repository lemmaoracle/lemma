---
brief_no: 212
title: "プレイド KARTE：サーバーの脆弱性から接続用の認証情報が盗まれ、データベースから利用企業の顧客データなどが読み出された(プレイドの公表)"
title_en: "Plaid KARTE: Connection credentials were stolen through a server vulnerability, and client companies' customer data and more were read out of databases (Plaid's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-11-13
published: 2026-11-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["210-dentsu-digital-tonariwa-admin-privilege-line-tokens", "204-ntt-data-stdirect-vendor-saas-admin-rights"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-27
  rev: "16282ae939025a2e"
  ref: "https://github.com/lemmaoracle/lemma/pull/1223"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Band, 03 opening and figure 1 now name the reader and the client's job (#53)"
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
  - date: 2026-11-27
    note: "Shortened the condition sentence in section 3 and moved the means below it"
version: "1.0"
og_lead_ja: "プレイドの KARTE で、サーバーの脆弱性から接続用の認証情報が盗まれ、メールアドレス 79,249 件と外部連携の認証情報、利用企業の顧客データの一部が漏えいした"
og_lead_en: "At Plaid's KARTE, connection credentials were stolen through a server vulnerability, and 79,249 email addresses, integration credentials and part of client companies' customer data leaked"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 委託先の SaaS"
og_kicker_en: "CYBERATTACK · CONTRACTOR SAAS"
og_headline_ja: "サーバーの穴から、\n認証情報が盗まれ、\n顧客データが漏れた。\n<accent>メール 79,249 件ほか</accent>"
og_headline_en: "A server flaw gave away\ndatabase credentials,\nand client data got out.\n<accent>79,249 emails and more.</accent>"
key_figures:
  - value: "79,249"
    unit: "addresses"
    label: "KARTE account email addresses whose leak was confirmed (counts for the other leaked data still being investigated; Plaid)"
    tone: "alert"
  - value: "08:59 → 15:23"
    label: "On 13 November, from detecting the unauthorised access to finishing containment, including cutting off traffic (the access took place in the early hours of the same day)"
  - value: "331,586"
    unit: "records"
    label: "Member records disclosed by the client company Hankyu Hanshin Hotels (the maximum identified so far; may include former members; 16 November)"
glossary:
  - term: "KARTE"
    desc: "A customer experience platform provided by Plaid. Client companies use it for web and app tracking, sending email and other messages, and operations in an admin console. According to Plaid, client companies can import their own member data and more through a feature called 'linking tables' (紐付けテーブル)."
  - term: "Connection credentials"
    desc: "In general, the IDs, passwords or keys a system uses to connect to a database or similar."
insight:
  slug: "db-credential-read-not-tied-to-client-job"
  stop: true
  label: "A read with connection credentials does not show a client's request"
  quote: "Before a client company's customer data is read out in bulk, check which client company, and which of its jobs, the reader is reading for, against the record of client companies' jobs, not against the connection credentials."
industries: ["retail", "supply-chain"]
operations: ["data-access", "account-admin"]
controls:
  - slug: "limit-and-revoke"
    item: "Narrow what each job's database connection credentials can read, and revoke integration credentials when a leak is suspected"
  - slug: "minimize-data"
    item: "Import only the customer data fields that are needed from client companies, and keep nothing once an integration or contract has ended"
  - slug: "hold-unverified"
    item: "Hold, before execution, any bulk read of customer data not tied to the record of a client company's job"
  - slug: "audit-trail"
    item: "Record, apart from the database, which credentials read which client company's data, and as which job"
attack_method: "supply-chain"
impact: "79,249 email addresses registered as KARTE accounts, credentials used to integrate with outside services (secret keys, access tokens and more), and part of the customer data client companies imported leaked (counts for the latter two still being investigated; Plaid, 16 November). On the client side, Hankyu Hanshin Hotels disclosed up to 331,586 records, among others. All KARTE services are suspended"
takeaway: "Holding connection credentials does not show that a read is a client company's job. Check a read against the record of which client company and which job it serves before letting it through."
self_check: "Do you know what customer data you have entrusted to an outside service, how long it stays there, and which credentials can read it?"
countries: ["jp"]
search_title: "プレイド KARTE 不正アクセス：漏えいの経緯と対策"
search_description: "プレイドの KARTE で、サーバーの脆弱性から接続用の認証情報が盗まれ、メールアドレス 79,249 件や外部連携の認証情報、利用企業の顧客データの一部が漏えいした（プレイド・11 月 16 日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

In the early hours of 13 November 2026, a third party gained unauthorised access to KARTE, the customer experience platform provided by Plaid. According to Plaid's disclosure of 16 November, the third party exploited a vulnerability in the company's servers to steal connection credentials and read data out of databases and other stores to an outside location, and also accessed the admin console from accounts taken over with the stolen credentials. Plaid detected the access the same day and shut down all KARTE services in stages.

The leak was confirmed for 79,249 KARTE account email addresses, credentials used to integrate with outside services, and part of the data client companies had imported; counts for the latter two are still being investigated. On the client side, Hankyu Hanshin Hotels disclosed up to 331,586 records, and en Inc. disclosed counts for en TENSHOKU and more.

<strong>If a database checks only the connection credentials, a read by whoever stole them simply goes through.</strong>

## 2. What got through

- **What got through**: Reads of data from databases and other stores using stolen connection credentials, and access to the admin console from taken-over accounts.
- **What reached the accepting side**: In general, a database receives only valid connection credentials and a read command. It does not receive which client company and which job (tracking, sending, matching member data and so on) the read is for. From one platform's databases, customer data imported by multiple client companies can be reached.
- **Integration credentials**: The leaked credentials include the secret keys and access tokens used to integrate with outside services. Plaid has asked client companies with integrations configured to invalidate the relevant credentials promptly. Nothing disclosed says these credentials were misused.
- **Not disclosed**: The type of server vulnerability exploited and which server it was on. Which databases were read, and how often and how much. What kind of accounts were taken over, and what was done in the admin console. What mechanism produced the 08:59 detection.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether whoever reads customer data in bulk is reading it as part of a client company's processing.

- **Who issues the record**: The KARTE components that run jobs such as tracking, sending and matching member data. For each job, they record which client company's data, and what scope of it, will be read. Client companies decide which data to import and how long to use it.
- **Where it is checked**: The step at which client companies' customer data is read out of a database in bulk. A read not tied to a client's job and scope in the record is held. The check runs on a server separate from the connection credentials, with a separate key.
- **What is recorded**: Which credentials read which client company's data, as which job, and when. This is kept apart from the platform, so client companies can check for themselves which fields were affected.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before client companies' customer data is read out in bulk, which client company and which of its jobs the reader is reading for, against the record of client companies' jobs, and keeping a record. Detection means noticing the unauthorised access, invalidating the stolen credentials, shutting services down and cutting off traffic from the attack source. Dates and times rely on the disclosures by Plaid and client companies.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check which client company's job the reader is reading for, against the job record, before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Theft of connection credentials, and reads from databases and other stores<br>Leak of 79,249 email addresses, integration credentials and part of customer data</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Credentials invalidated, all services shut down and traffic cut off</div>
<div class="rx-g g1"><div class="t">11-13</div><b>Access in the early hours; Plaid detects it at 08:59</b></div>
<div class="rx-g g2"><div class="t">11-13</div><b>Containment finished by about 15:23</b></div>
<div class="rx-g g3"><div class="t">11-15</div><b>Client companies receive Plaid's report of a leak</b></div>
<div class="rx-g g4"><div class="t">11-16</div><b>Plaid discloses that a leak is confirmed</b></div>
</div>
</figure>

Detection worked, and the incident was contained the same day. Even so, data had already been read out using the stolen connection credentials. Cases where client companies' data was read at a contractor's service include [Dentsu Digital TONARIWA](/critical/briefs/210-dentsu-digital-tonariwa-admin-privilege-line-tokens/) (privilege escalation on an administrative account entered with leaked credentials) and [NTT DATA STdirectServices](/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/) (administrator rights obtained through a flaw in the authentication function).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps at which client companies' customer data is read from the platform's databases and exported from the admin console.** It does not look for unauthorised access; it checks, before execution, which client company and which job a read or export rests on.

### Industries and operations to watch

- **Industry · Services & retail**: Companies that import member data, purchase histories and contact details into an outside customer experience or marketing platform for tracking and sending. Client companies in hotels, retail and recruitment services have disclosed leaks.
- **Industry · Procurement & supply chain**: Companies that hand the use of customer data, and sending, to an outside service.
- **Operation · Data access & export**: Bulk reads of client companies' customer data from the platform's databases, and exports from the admin console.
- **Operation · Accounts & permissions**: The scope and revocation of database connection credentials, admin console accounts, and the secret keys and access tokens used to integrate with outside services.

### Current controls vs Lemma

The route in this case is column 1. For column 2 (exports from the admin console with taken-over accounts), access to the admin console was disclosed, but what, if anything, was exported has not been. For column 3 (direct operations on outside services with leaked integration credentials), nothing disclosed says these were misused.

| Control | Reads from databases with stolen connection credentials | Exports from the admin console with taken-over accounts | Direct operations on outside services with leaked integration credentials |
| --- | --- | --- | --- |
| Narrow what connection credentials can read | Partial | Not relevant | Not effective |
| Multi-factor authentication on the admin console | Not relevant | Partial | Not effective |
| Import fewer fields | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Partial | Effective | Not effective |

Narrowing credentials shrinks what they can reach, but does not stop reads within that scope. Multi-factor authentication on the admin console is not relevant to direct database connections. Importing fewer fields reduces what is exposed, but does not stop reads of data that remains. Social Interior says it is looking into how past data remained on KARTE's side after its contract ended.

Note: Lemma's check works only when it is built into database reads and admin console exports, and the record of client companies' jobs is managed outside the server that holds the connection credentials. If a vulnerability lets the server itself be taken over and the database is reached directly by a route that skips the check, the check is bypassed. Direct operations on outside services with leaked integration credentials are dealt with by invalidating those credentials. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, fix vulnerabilities, revoke credentials or recover data already read out.

### Checklist

Three things to confirm about customer data and integration credentials entrusted to an outside platform

- When you end an integration or contract with an outside service, do you have a procedure to confirm that the customer data you entrusted has been deleted?
- Do you have your own procedure to invalidate and reissue the integration secret keys and access tokens registered with an outside service?
- When the contractor reports a leak, can you identify the affected customers and fields from your own records?

## 5. Facts and timeline

- **Parties**: PLAID, Inc. (provides the customer experience platform KARTE) and its client companies. On the client side, Hankyu Hanshin Hotels, en Inc., Social Interior (subsclife by TOKYOROOMS), Onward Holdings and others have disclosed leaks caused by the unauthorised access to KARTE.
- **What happened**: According to Plaid, a third party exploited a server vulnerability to steal connection credentials and read data out of databases and other stores to an outside location. Using the stolen credentials, they took over Plaid's accounts and also accessed the admin console (the sequence is in the timeline).
- **Data**: According to Plaid, the leak was confirmed for 79,249 email addresses registered as KARTE accounts; for credentials used to integrate KARTE with outside services (secret keys, access tokens and more); and for part of the data client companies imported to use their own member data and more in KARTE (including data imported through the linking tables feature). Counts for the latter two are still being investigated; the fields imported differ by client company and may include personal data. Plaid is also checking the impact on other data.
- **Client disclosures**: Hankyu Hanshin Hotels put the total at 331,586 records of Members' Club member data, including names, ages, addresses, phone numbers and email addresses (the maximum identified so far, which may fall after review and may include former members; 16 November). en Inc. put it at 545 records for en TENSHOKU (user ID, gender, age and prefecture-level address) and 12,474 corporate accounts for MIDDLE NO TENSHOKU (registered email addresses) (as of 18 November). Social Interior put it at 28,517 records of names, email addresses and LINE user IDs for subsclife by TOKYOROOMS (corrected from 29,194 in its second notice; 19 November). Onward Holdings has not given a count.
- **Impact**: All KARTE services, including tracking, sending and admin console operations, have been suspended since 13 November, with no date set for resumption. Hankyu Hanshin Hotels says it has received no reports of specific harm. Plaid warns of suspicious emails claiming to come from it.
- **How it was found**: Plaid detected the unauthorised access at 08:59 on 13 November. Hankyu Hanshin Hotels received a report of suspected unauthorised access from Plaid on 13 November (the reports of a leak are in the timeline).

### Timeline

- **2026-11-13**: In the early hours, a third party exploits a server vulnerability to steal connection credentials and reads data out of databases and other stores. Plaid detects it at 08:59.
- **2026-11-13**: Plaid invalidates the stolen credentials, begins shutting down all KARTE services in stages from about 14:27, and by about 15:23 finishes cutting off traffic from the attack source and other containment. The same day, it discloses the detection and the suspension.
- **2026-11-15**: Hankyu Hanshin Hotels and Social Interior receive Plaid's report of a leak.
- **2026-11-16**: Plaid discloses that it has confirmed the leak of 79,249 email addresses and more. Hankyu Hanshin Hotels discloses its leak.
- **2026-11-18**: en Inc. and Onward Holdings disclose their leaks.
- **2026-11-19**: In its second notice, Social Interior corrects its count to 28,517.

> The facts rely on Plaid's two disclosures and the disclosures by Hankyu Hanshin Hotels, en Inc., Social Interior and Onward Holdings (all primary). Many other client companies have also disclosed leaks; this Brief names only those whose primary disclosures could be read. Plaid has not disclosed the names of its client companies or the counts of integration credentials and customer data. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses. Written as of 20 November.

### After disclosure

- **Plaid**: It says no new unauthorised access has been confirmed since the cut-off. It has contacted the affected client companies individually, reported to the Personal Information Protection Commission and consulted the police. It plans a forensic investigation and an outside security assessment towards resuming service, and says it will set out and publish recurrence prevention measures based on the findings.
- **Client companies**: en Inc. ended its external integration with KARTE, invalidated the credentials it was aware of, contacted affected customers individually and reported to the Personal Information Protection Commission. Onward Holdings disconnected the affected service from its network. Social Interior sent apology emails to the affected addresses on 18 November.

## 6. Sources

- **Plaid (Primary, company disclosure)**: 「不正アクセスによる個人情報を含む可能性のある情報等の漏えいに関するお詫びとお知らせ」 (2026-11-16) — <https://plaid.co.jp/news/20261116/>
- **Plaid (Primary, company disclosure)**: 「当社サービスへの不正アクセスに関するご報告」 (2026-11-13, updated 11-16) — <https://plaid.co.jp/news/20261113/>
- **Hankyu Hanshin Hotels (Primary, client company disclosure)**: 「【お詫びとお知らせ】当社が利用するコミュニケーションツール「KARTE」への不正アクセスによる個人情報の漏えいについて」 (2026-11-16) — <https://www.hankyu-hotel.com/topics/2026/GPDetailPage>
- **en Inc. (Primary, client company disclosure)**: 「当社が利用する外部サービス「KARTE」への不正アクセスによるお客様情報の漏えいに関するお詫びとお知らせ」 (2026-11-18) — <https://corp.en-japan.com/newsrelease/2026/46717.html>
- **Social Interior (Primary, client company disclosure)**: 「【第二報】外部サービス「KARTE」への不正アクセスに伴うお客様情報漏えいのお詫びとご報告」 (2026-11-19) — <https://subsclife.com/feature/2026111602>
- **Onward Holdings (Primary, client company disclosure)**: 「[重要] 委託先システム「KARTE」への不正アクセスに伴う情報漏えいに関するお詫びとお知らせ」 (2026-11-18) — <https://www.onward-hd.co.jp/release/2026/20261118.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
