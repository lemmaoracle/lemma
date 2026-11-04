---
brief_no: 26
title: "コミックシーモア：会員情報を管理するシステムに不正アクセス、会員情報に続き一部のシステムログも閲覧・取得された(NTTソルマーレ第3報)"
title_en: "Comic C'moA: unauthorised access to the member-data system, and after the member data some system logs were also read and taken (NTT Solmare, third report)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-15
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["044-arcadia-speecan-raiden-disaster-mail-spoofing", "057-deepseek-clickhouse-exposed-db", "152-denmark-cpr-lawful-access-misuse"]
status: published
version: "1.0"
og_lead_ja: "コミックシーモア不正アクセス、会員情報に続きシステムログも流出"
og_lead_en: "Comic C'moA breach: system logs taken along with member data"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 会員情報の流出"
og_kicker_en: "CYBERATTACK · DATA BREACH"
og_headline_ja: "会員情報に続き、\nシステムログも\n取られていた。\n<accent>件数は精査中、再開は未定</accent>"
og_headline_en: "After the member data, system logs were taken too.\n<accent>The count is still under review.</accent>"
key_figures:
  - value: "5"
    unit: "fields"
    label: "Member data confirmed leaked (count still under review)"
    tone: "alert"
  - value: "10-15 → 10-18"
    label: "From service shutdown to the third report, which disclosed the route identified and the logs taken"
  - value: "TBD"
    label: "Service restart date (as of 20 October)"
glossary:
  - term: "System log"
    desc: "Files that servers and applications write as a record of processing. Depending on what they are designed to write, user identifiers or parts of user input can end up in them."
  - term: "Hashed password"
    desc: "A password stored not as-is but transformed so it cannot be reversed. Depending on the method, common passwords can still be recovered by matching against the hashes."
  - term: "Credential stuffing"
    desc: "Trying leaked email-and-password pairs on other services' logins."
insight:
  slug: "logs-checked-after-theft"
  label: "Logs whose contents are checked only after theft"
  quote: "If what goes into the logs is not decided before they are written, the scope of stolen logs can only be worked out after the theft."
industries: ["media", "retail"]
operations: ["data-access"]
controls:
  - slug: "audit-trail"
    item: "Keep logs apart from member data, in a form that shows any tampering"
impact: "Five member-data fields and some system logs leaked"
takeaway: "If what goes into logs is not decided before they are written, what stolen logs contained can only be worked out afterwards."
self_check: "Do you know whether your system logs contain member information?"
countries: ["jp"]
---

## 1. Summary

In its third report, NTT Solmare said some system log files had also been read and taken, and that it is going through them to see whether they contain member data. For a system that stores member data, the fields it holds are fixed by design. Logs can change in content depending on how they are written. On what has been disclosed, it could not yet be said that the stolen logs held no member data. <strong>If what goes into the logs is not decided before they are written, the scope of stolen logs can only be worked out after the theft.</strong>

## 2. What got through

- **What got through**: Unauthorised access to the member-data system, and the reading and taking of member data and some system logs (NTT Solmare, second and third reports).
- **What reached the receiving side**: In general, logs are written automatically by systems as a record of processing, and what goes into them is fixed by design. Whether what was written includes member data cannot be told from the act of writing.
- **As disclosed**: The logs are said to have been "read and taken"; the company has not said they were altered.
- **Not disclosed**: The entry route and method (identified, not disclosed), when the intrusion began, the scope and contents of the stolen logs, the count, the password hashing method, and any independent third-party findings.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the mechanism that writes logs checks what it writes against a list of allowed fields decided in advance, and that kept logs can be checked against a record outside the breached environment to see that they are as written.

- **Who approves**: The person responsible on the operating side. They decide in advance, and register, a list of fields that may go into logs (excluding member data).
- **Where it is checked**: The mechanism that writes logs. Fields not on the list (email addresses, dates of birth, user input) are not written. Logs are shipped out as soon as they are written, and a digest (hash) of each batch is recorded outside the breached environment.
- **What is recorded**: The decision on which fields go into logs, and the digest of each batch. They let you state the scope of stolen logs and show, from the outside record, that nothing was altered after they were taken.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking what is about to be written to logs against the allowed fields, and keeping a digest of what was written outside. Detection means noticing after unauthorised access has happened. The dates below are when NTT Solmare confirmed or disclosed each point, not when the intrusion or the taking happened.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check against the allowed fields before logs are written</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Five member-data fields and some system logs taken<br>Count under review · restart date undecided</span></div>
<div class="rx-zone det"><b>Detection · fast</b>Service shut down the day it judged access highly likely</div>
<div class="rx-g g1"><div class="t">10-15</div><b>Service shut down (first report)</b></div>
<div class="rx-g g2"><div class="t">10-16</div><b>Leak of five member-data fields confirmed (second report)</b></div>
<div class="rx-g g3"><div class="t">10-18</div><b>Taking of some system logs disclosed (third report)</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>Count and restart date undecided</b></div>
</div>
</figure>

Logs becoming the place data leaks from also shows up in [DeepSeek](/critical/briefs/057-deepseek-clickhouse-exposed-db/), where over a million rows of logs and plaintext chat history were exposed from an unauthenticated database.

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that writes and keeps logs.** It does not look for intrusions; it checks, before logs are written, against the allowed fields, and checks kept logs against a record outside the breached environment.

### Industries and operations to watch

- **Industry · Media & content**: E-books, video, games and other services that manage many members by email address and password. The more members, the larger the impact of a leak.
- **Industry · Services & retail**: Online stores with sign-up and login. The same email and password are often used on other services.
- **Operation · Lookups & reads**: Work that reads member data and logs for operations or incident response. What stays in logs becomes, as it is, what can leak.

### Current controls vs Lemma

The route in this case has not been disclosed. Column 1 is member data written into logs; column 2 is stolen logs being altered afterwards (here, the company says "read and taken", with no alteration disclosed); column 3 is the intrusion into the member-data system itself.

| Control | Member data written into logs | Stolen logs altered afterwards | Intrusion into the member-data system |
| --- | --- | --- | --- |
| Protecting the member database (access control, encryption) | Not effective | Not relevant | Partial |
| Hashing passwords | Not relevant | Not relevant | Partial |
| Intrusion detection and shutting the service down | Partial | Not relevant | Partial |
| Resetting all members' passwords on restart | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Protecting the database guards what is inside it, not what has been written out to logs. Hashing does not store the password itself, but depending on the method it can still be recovered, and the method here has not been disclosed. Detection and shutdown stop the damage spreading, but do not recover data already taken or the contents of stolen logs. A password reset for all members blocks logins to this service, not to other services where the same pair was reused. Lemma checks fields before logs are written and checks digests of kept logs against an outside record.

Note: Lemma's check works only when it is built into the mechanism that writes logs and digests of each batch are recorded outside the breached environment. If member data is mixed into the allowed list, it passes. If logs were altered before the digest was taken, the alteration cannot be shown. The intrusion into the member-data system itself is not prevented. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about services that handle member data

- If your logs were taken, could you say right away what leaked?
- Are your logs kept in the same environment as the member-data system? Could an attacker who reaches it delete or alter them?
- If you are breached, how will you show that the logs used in the investigation have not been altered?

## 5. Facts and timeline

- **Operator and service**: NTT Solmare, which runs the Japanese e-book store Comic C'moA.
- **System breached**: the system that manages member data. Member data stored in it leaked to a third party (second report).
- **Member data leaked**: email address, hashed password, date of birth, sex and nickname. The company says card data is not held in the affected system and did not leak, and that no leak of purchase history, and no leak, loss or damage of users' "MY bookshelf", has been found so far.
- **Count**: still under review (third report). The company says it will contact affected members once confirmed.
- **System logs**: the third report said some system log files were also found to have been read and taken. The company is going through them to establish whether they contain member data. Which logs were taken, and what they held, has not been disclosed.
- **Entry route**: the third report says the company has "identified the entry route and attack method and is taking action", and that the cause has been identified. Neither the route nor the method has been disclosed (identified, not disclosed). The company says it is taking steps to prevent similar access and further damage.
- **Passwords**: the second report described the hashed passwords as "converted into a special string and encrypted"; the third changed this to "converted into a form whose original content cannot be read". The method has not been disclosed.

> 前回発表いたしました流出した会員情報に加え、一部のシステムログファイルにつきましても閲覧・取得されたことが判明したことから、会員情報の有無を確認するため当該ログの精査を行っております。
> — NTT Solmare (third report, original Japanese)

### Timeline

- **2026-10-15**: first report. The company judged it highly likely that its servers had been accessed without authorisation from outside, shut the service down at 11:35 and blocked the access.
- **2026-10-16**: it confirmed unauthorised access to the member-data system and the leak of member data to a third party, and published its second report. It said no new access or further damage had been seen.
- **2026-10-18**: the third report said the entry route and attack method had been identified and dealt with, and that some system log files had also been read and taken. Citing further safety work and coordination with relevant parties, it gave no restart date.
- **At writing (10-20)**: no fourth report. The count, the contents of the stolen logs and the entry route remain undisclosed.

> The facts here come from NTT Solmare's first to third reports. The company says it has identified the entry route and attack method but has not disclosed them. The number of members affected, the scope and contents of the stolen system logs, and the password hashing method have not been disclosed either. The investigation is being carried out with outside specialists; no independent third-party findings have been published. What has not been disclosed does not mean there were no controls.

### After disclosure

- **What users were asked to do**: anyone using the same email-and-password pair elsewhere was asked to change it there too. The company warned that the leaked data could be used in mail or phishing sites posing as the company.
- **Restart plan**: once safety is assured, the service will restart in stages, starting with web reading of purchased books. All members will be asked to reset their passwords on restart.

## 6. Sources

- **NTT Solmare (primary, operator)**: "『コミックシーモア』会員情報の流出に関するご報告(第3報)" (2026-10-18) — <https://www.nttsolmare.com/press/2026/1016-1.html>
- **NTT Solmare (primary, operator)**: "『コミックシーモア』会員情報の流出に関するお詫びとお願い(第2報)" (2026-10-16) — <https://www.nttsolmare.com/press/2026/1016.html>
- **NTT Solmare (primary, operator)**: "『コミックシーモア』の緊急メンテナンスについて(初報)" (2026-10-15) — <https://www.nttsolmare.com/press/2026/0616-1.html>
- **ITmedia NEWS (press)**: "コミックシーモア、会員のメールアドレスや生年月日など流出 件数は精査中" (2026-10-16) — <https://www.itmedia.co.jp/news/article/2610/16/2000002345/>
- **Denfaminicogamer (press)**: "「コミックシーモア」停止続く、再開日時は未定。不正アクセスの原因は特定済み" (2026-10-19) — <https://news.denfaminicogamer.jp/news/261019p>

References: ["An audit trail for MCP tool calls that anyone can check afterwards"](/blog/mcp-tool-call-audit-trail/); ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
