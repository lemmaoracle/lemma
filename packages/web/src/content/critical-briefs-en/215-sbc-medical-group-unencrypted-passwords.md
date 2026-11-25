---
brief_no: 215
title: "SBCメディカルグループ：海外からの77万回の攻撃でデータベースに到達され、暗号化していなかったパスワードを含む基本情報162万4,000人分が取得された(SBCメディカルグループの公表)"
title_en: "SBC Medical Group: Sustained attacks from overseas — 770,000 in all — reached a database, and basic information on 1,624,000 people, including passwords stored without encryption, was taken (SBC Medical Group's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-11-16
published: 2026-11-22
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["212-plaid-karte-server-flaw-db-credentials", "211-riken-fugaku-unauthorized-access"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-25
  rev: "53d65ddfcd4f418f"
  ref: "https://github.com/lemmaoracle/lemma/pull/1197"
status: draft
version: "1.0"
og_lead_ja: "SBCメディカルグループで、海外からの77万回の攻撃でデータベースに到達され、暗号化していなかったパスワードを含む基本情報162万4,000人分などが不正に取得された"
og_lead_en: "At SBC Medical Group, sustained attacks from overseas — 770,000 in all — reached a database, and basic information on 1,624,000 people, including passwords stored without encryption, was taken without authorisation"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORISED ACCESS"
og_headline_ja: "海外からの攻撃が、\nデータベースに届いた。\n<accent>パスワードは暗号化なし</accent>"
og_headline_en: "Attacks from overseas\nreached the database.\n<accent>Passwords had no encryption.</accent>"
key_figures:
  - value: "1,624,000"
    unit: "people"
    label: "People whose basic information was taken without authorisation. It includes names, gender, phone numbers, email addresses, passwords, addresses and dates of birth, and the passwords had been stored without encryption at the time (2010–2023; SBC Medical Group)"
    tone: "alert"
  - value: "770,000"
    label: "Sustained attacks a third party made from overseas in the late-night hours (SBC Medical Group). The method and route of the intrusion are under investigation"
  - value: "12,641"
    unit: "people"
    label: "People with bookings only whose information was taken through unauthorised logins to the admin console of Tribeau, an outside booking service (information on 6,804 people who had received treatments was also taken)"
glossary:
  - term: "Tribeau"
    desc: "An outside booking service used for bookings at 56 of the SBC Medical Group's clinics. On 16 November, unauthorised logins to its admin console were confirmed, and five of the group's accounts were entered."
  - term: "Passwords stored without encryption"
    desc: "In general, passwords are stored converted into a form that cannot be read as-is even if taken. According to SBC Medical Group, registered passwords had been stored without encryption at the time, so the passwords taken were in a form that could be tried, as they were, at other services."
insight:
  slug: "entry-attempts-not-checked-against-normal-use"
  stop: true
  label: "Attempts that line up on count, hour and origin are not normal use"
  quote: "Before access to a database and logins to an admin console are let through, check those attempts against the record of normal use (count, hour and origin)."
industries: ["healthcare", "supply-chain"]
operations: ["data-access", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Stop mass attempts at the entry by count, hour and origin, including late-night and overseas attempts, and count a contractor's admin console as an entry too"
  - slug: "limit-and-revoke"
    item: "Never store passwords in a form that can be read as-is, and when a leak is suspected, invalidate the passwords in scope and have them reset"
  - slug: "audit-trail"
    item: "Preserve a record of what was read, when and how much, so the scope of a leak can be checked afterwards"
attack_method: "account-takeover"
impact: "Basic information on 1,624,000 people (passwords had been stored without encryption), web booking applications for 255,416 people, enquiry-form consultations for 217,769 people, monitor-treatment information for 4,513 people, review information for 15,007 people, and about 20,000 staff account records were taken without authorisation (overlap between the categories is unknown, and the counts are not added together). At the contractor Tribeau, information on 12,641 people with bookings only and 6,804 people who had received treatments was also taken. No taking of medical records such as electronic charts has been confirmed"
takeaway: "770,000 attacks from overseas were not stopped at the entry and reached a database. Passwords stored without encryption become keys that can be tried at other services the moment they are taken. Check attempts at the entry against the record of normal use — count, hour and origin — before letting them through, and store passwords in a form that cannot be used as-is."
self_check: "Do you have a mechanism that stops mass login attempts at the entry, including late-night and overseas ones?"
countries: ["jp"]
search_title: "SBCメディカルグループ情報漏えい：パスワード暗号化せず保存"
search_description: "SBCメディカルグループは、海外からの77万回の攻撃でデータベースに到達され、暗号化していなかったパスワードを含む基本情報162万4,000人分などが不正に取得されたと公表した（11月19日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 16 November 2026, unauthorised access was confirmed to part of a database within the website system that SBC Medical Group — operator of Shonan Beauty Clinic and other clinics — manages and runs. According to SBC's disclosure of 19 November (its first report), a third party made sustained attacks from overseas in the late-night hours, 770,000 in all, and personal information of customers was taken without authorisation from a database SBC held on behalf of the group's clinics. On the same day it detected the access, SBC isolated the server in question from the network and cut off the attacker's access.

The information confirmed taken was disclosed by category. The largest, basic information, covers 1,624,000 people and includes passwords that had been stored without encryption, together with names, addresses and dates of birth. Web booking applications for 255,416 people, enquiry-form consultations for 217,769 people and about 20,000 staff account records were also in scope. Also on 16 November, unauthorised logins were confirmed to the admin console of Tribeau, an outside booking service, and information on 12,641 people with bookings only and 6,804 people who had received treatments was taken. No taking of medical records such as electronic charts has been confirmed at this point.

<strong>If attempts are not counted at the entry, attacks repeated over and over reach the database as they are — and a password stored in readable form becomes a key the moment it is taken.</strong>

## 2. What got through

- **What got through**: Two things. First, the sustained attacks from overseas in the late-night hours — 770,000 in all — where the accumulation of attacks that were not stopped led to the database being reached. Second, unauthorised logins to the admin console of the contractor Tribeau, where an attack that mechanically tried large numbers of ID and password combinations entered five of the group's accounts.
- **What reached the accepting side**: In general, a database or an admin console receives only the connection or login attempts themselves. It does not receive whether an attempt is for normal use (bookings, enquiries, clinic operations). Unless count, hour and origin are compared with the record of normal use, repeated attempts cannot be told apart from attempts made one at a time.
- **Passwords stored without encryption**: The information taken includes passwords that had been stored without encryption. A password becomes a key that can be tried at other services the moment it leaks. SBC calls on customers who use the same or a similar password at other services to change it, and says that where it judges the risk to be high, it may forcibly reset passwords.
- **Not disclosed**: The details of the method and route of the intrusion. The breakdown of the 770,000 attacks (what was tried, where, and how much). The route by which Tribeau's login information became known to a third party. The overlap between the categories' counts (no combined total has been disclosed). Whether the leaked information has been misused in secondary harm was unconfirmed at the time of the disclosure.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an attempt at the entry is let through, the attempt is checked against the record of normal use.

- **Who issues the record**: The components that run the website and database, and the outside booking service. For each kind of work — bookings, enquiries, clinic operations — they record when, from where and how much access is normal. For a contractor's admin console, the clinics that use it and the scope of operations are decided.
- **Where it is checked**: The steps for access to the database and for logins to the admin console. The check confirms whether an attempt's count, hour and origin are tied to normal use in the record; an attempt that is not is held. The check runs on a mechanism separate from the entry itself.
- **What is recorded**: Which attempts came, when and from where, and what was read. This is kept apart from the database, in a form that lets the scope of a leak be checked afterwards. SBC is preserving and analysing logs and is identifying the people in scope.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking an attempt against the record of normal use (count, hour and origin) before letting it through at the entry, and keeping a record. Detection means noticing the unauthorised access, isolating the server and cutting off the attacker's access. Dates rely on SBC Medical Group's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check attempts at the entry against the record of normal use before letting them through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A database reached through 770,000 sustained attacks from overseas<br>Personal information taken, including passwords without encryption</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Server isolated and the attacker's access cut off</div>
<div class="rx-g g1"><div class="t">11-16</div><b>Unauthorised access detected; the server in question is isolated</b></div>
<div class="rx-g g2"><div class="t">11-16</div><b>Reported to the Personal Information Protection Commission</b></div>
<div class="rx-g g3"><div class="t">11-16</div><b>Unauthorised logins to Tribeau's admin console also confirmed</b></div>
<div class="rx-g g4"><div class="t">11-19</div><b>SBC Medical Group publishes its first report</b></div>
</div>
</figure>

Detection worked, and on the same day it detected the access, SBC isolated the server and cut off the attacker's access. Even so, the accumulation of attacks that were not stopped reached the database, and information including passwords without encryption was taken. Cases where a contractor's service became the entry include [Plaid KARTE](/critical/briefs/212-plaid-karte-server-flaw-db-credentials/) (theft of connection credentials) and [RIKEN 'Fugaku'](/critical/briefs/211-riken-fugaku-unauthorized-access/) (keys taken out). Here, two entries were in scope: the company's own database and a contractor's admin console.

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for access to databases and for logins to admin consoles, including contractors'.** It does not look for unauthorised access; it checks, before execution, whether an attempt rests on normal use.

### Industries and operations to watch

- **Industry · Healthcare**: Clinics and medical institutions that keep customer information on bookings, consultations and treatments in a database for a long time. The fields are many, and information from old periods remains.
- **Industry · Procurement & supply chain**: Companies that hand customer touchpoints such as bookings to an outside service. A contractor's admin console is a place entered with the company's own accounts, and if that entry opens, the company's customers' information leaks.
- **Operation · Data access & export**: Access to, and reads of, customer information that stays in a database for a long time.
- **Operation · Accounts & permissions**: How customers' and staff passwords are stored, and who stops them, and where, when they leak.

### Current controls vs Lemma

The routes in this case are column 1 (a database reached through mass attempts from overseas) and column 2 (unauthorised logins to a contractor's admin console through mechanical attempts). Column 3 covers logins tried at other services with the passwords taken (which had no encryption); no secondary harm from this incident has been confirmed.

| Control | A database reached through mass attempts from overseas | Unauthorised logins to a contractor's admin console through mechanical attempts | Logins tried at other services with the passwords taken |
| --- | --- | --- | --- |
| Stop attempts at the entry when count, hour and origin line up | Partial | Partial | Not relevant |
| Multi-factor authentication on the admin console | Not relevant | Partial | Not relevant |
| Store passwords in a form that cannot be read as-is | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Partial | Partial | Not effective |

A mechanism that stops attempts at the entry narrows attempts that pass thresholds such as counts, but does not stop attempts that cannot be told apart from normal use. Multi-factor authentication on the admin console blocks a login with a password alone, but is not relevant to reaching a database. Storing passwords in an unreadable form reduces the harm when they are taken, but does not stop the reaching itself. Lemma checks, before execution, not whether an attempt is valid but whether it is tied to the record of normal use.

Note: Lemma's check works only when it is built into database access and admin console logins, and the record of normal use is managed apart from the entry itself. If the entry itself is taken over and the database is reached directly by a route that skips the check, the check is bypassed. Direct operations on other services with passwords taken also bypass it, and invalidating and resetting those passwords is the answer. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, fix how passwords are stored, invalidate leaked passwords or recover data already taken.

### Checklist

Three things to confirm about attempts at the entry, how passwords are stored, and customer data entrusted to contractors

- Do you have a mechanism that stops mass login attempts at the entry, including late-night and overseas ones? Are the rules for stopping by count or hour clear?
- Are customers' and staff passwords stored encrypted? Is anything left in a form that can be read as-is? When a leak happens, is it decided who stops which passwords, and where?
- Do you know which fields of customer data, and how much, you have entrusted to a contractor's service? When an incident happens at the contractor, is it decided what to tell customers, and when?

## 5. Facts and timeline

- **Parties**: SBC Medical Group (operates Shonan Beauty Clinic and other clinics) and TRIBEAU Inc., which runs Tribeau, an outside booking service. SBC held customers' information on behalf of the group's clinics.
- **What happened**: According to SBC, on 16 November it confirmed unauthorised access to part of a database within the website system it manages and runs. As to the cause, SBC says a third party made sustained attacks from overseas in the late-night hours, 770,000 in all. It says the details of the method and route of the intrusion will be announced once the findings of an outside specialist organisation are in. The same day, at Tribeau, unauthorised logins to the admin console were confirmed for bookings at 56 of the group's clinics, and an attack that mechanically tried large numbers of ID and password combinations entered five of the group's accounts.
- **Data**: According to SBC, the information taken without authorisation was disclosed by category. (1) Basic information (not including booking or treatment information) for 1,624,000 people: names, gender, phone numbers, email addresses, passwords, addresses, dates of birth, patient card numbers, member IDs and questionnaire answers (2010–2023). The passwords had been stored without encryption at the time. (2) Web booking applications made through affiliate advertising and similar, for 255,416 people (2007–2026). (3) Consultations via the enquiry form, for 217,769 people (2004–2026). Written into these enquiries were credit card details for 14 people, all confirmed to be in a state where no further payment could be made, because of expiry or similar. (4) Monitor-treatment information for 4,513 people (treatment details and the file names of image data; the images themselves are not included). (5) Review information for 15,007 people. Some people's information is limited to items that make identification difficult unless combined with other information — a patient card number only, or an email address without a name — disclosed by category, with the largest item at 1,030,349 people. About 20,000 staff account records (names, IDs, passwords and more) were also taken, and for 459 of the staff, bank account information, pension-related information, withholding tax certificates and dependent exemption declarations submitted when they joined were also in scope. The same person may appear in more than one category, and no combined total has been disclosed. At Tribeau, information on 12,641 people with bookings only (for 3 of them, message contents, dates of birth and gender were also taken) and 6,804 people who had received treatments was taken, and the free-text field at booking may contain notes about concerns or physical condition. It has been confirmed that the information taken is not linked to case or review information (including photographs) on Tribeau. Email addresses, addresses, credit card information, passwords and medical records such as electronic charts are not included.
- **Impact**: SBC warns that the leaked information may be misused and that suspicious emails, SMS messages or calls claiming to be from the group may arrive. It asks people not to respond to any contact that invokes treatment details or similar to demand money, and to contact its dedicated desk instead (0120-955-755, 10:00–19:00). No misuse or other secondary harm from this incident has been confirmed at this point.
- **How it was found**: SBC confirmed the unauthorised access on 16 November and, after detection, isolated the server in question from the network and cut off the attacker's access. It reported to the Personal Information Protection Commission the same day and says it is consulting the police and responding strictly. It is preserving and analysing logs and identifying the people in scope. As for Tribeau, according to TRIBEAU Inc.'s notice of 19 November, its monitoring system detected a suspected unauthorised login on 16 November.

### Timeline

- **2026-11-16**: SBC confirms unauthorised access to the database, isolates the server in question and cuts off the attacker's access. It reports to the Personal Information Protection Commission. Unauthorised logins to Tribeau's admin console are also confirmed.
- **2026-11-19**: SBC Medical Group publishes its first report.

> The facts rely on SBC Medical Group's first report (primary). The counts by category were also checked against the English-language release with the same content (BusinessWire). The breakdown of Tribeau's five accounts (four at Shonan Beauty Clinic, one at Ritz Cosmetic Surgery Tokyo) was also confirmed in transcriptions of the primary table. The facts on the Tribeau side were also checked against TRIBEAU Inc.'s notice (primary). No second report had been published as of 25 November. The details of the method and route of the intrusion, the breakdown of the 770,000 attacks, the route by which Tribeau's login information became known, and the overlap between the categories' counts have not been disclosed and are under investigation. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses. Written as of 22 November.

### After disclosure

- **SBC Medical Group**: Isolated the server in question from the network and cut off the attacker's access. It has reported to the Personal Information Protection Commission and is consulting the police. It is preserving and analysing logs and identifying those in scope. It calls on customers who use the same or a similar password at other services to change it, and says that where it judges the risk to be high, it may forcibly reset passwords. It has set up a dedicated desk (0120-955-755, 10:00–19:00).
- **TRIBEAU Inc.**: Deactivated the accounts that were logged into without authorisation, invalidated the passwords of the affected clinics' accounts and blocked communications from the attack source. It is contacting the people in scope individually by email or in-app message, and is consulting the police.

## 6. Sources

- **SBC Medical Group (Primary, company disclosure)**: 「SBCメディカルグループへの不正アクセス被害による個人情報流出に関するお詫びとお知らせ（第1報）」 (2026-11-19) — <https://sbc-holdings.com/ja/news/605>
- **SBC Medical Group Holdings (English release with the same content as the primary)**: "SBC Medical Group Reports Cybersecurity Incidents in Japan" (2026-11-19) — <https://ir.sbc-holdings.com/sbc-medical-group-reports-cybersecurity-incidents-in-japan/>
- **TRIBEAU Inc. (Primary, company disclosure)**: 「「トリビュー」管理アプリケーションへの不正アクセスによる個人情報流出のお詫びとお知らせ」 (2026-11-19) — <https://corp.tribeau.jp/1338/>
- **TechnoEdge (Reporting)**: Reporting on the unauthorised logins to Tribeau's admin console (2026-11-19)

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
