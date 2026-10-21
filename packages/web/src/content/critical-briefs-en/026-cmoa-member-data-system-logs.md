---
brief_no: 26
title: "コミックシーモア：会員情報を管理するシステムに不正アクセス、会員情報に続き一部のシステムログも閲覧・取得された(NTTソルマーレ第3報) — 取られたログに何が書かれていたかを、取られた後に調べるしかない"
title_en: "Comic C'moA: unauthorised access to the member-data system, and after the member data some system logs were also read and taken (NTT Solmare, third report) — what the stolen logs contained can only be worked out after they were taken"
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
og_kicker_ja: "サイバー攻撃事例 · 会員情報の流出"
og_kicker_en: "CYBERATTACK · DATA BREACH"
og_headline_ja: "会員情報に続き、\nシステムログも\n取られていた。\n<accent>件数は精査中、再開は未定</accent>"
og_headline_en: "After the member data, system logs were taken too.\n<accent>The count is still under review.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "The logs themselves became a leak whose scope cannot be stated without going through them again."
industries: ["media", "retail"]
operations: ["data-access"]
controls:
  - slug: "audit-trail"
    item: "Keep logs apart from member data, in a form that shows any tampering"
impact: "Five member-data fields and some system logs leaked"
takeaway: "What the stolen logs contained could only be worked out after they were taken."
self_check: "If your logs were taken, could you say right away what leaked?"
---

## 1. TL;DR

On 15 October 2026, NTT Solmare judged it highly likely that the servers of its e-book store Comic C'moA (コミックシーモア) had been accessed without authorisation, and shut the service down. The next day it confirmed unauthorised access to the member-data system and that email addresses, hashed passwords, dates of birth, sex and nicknames had leaked. Its third report, on 18 October, added that some system log files had also been read and taken. The count is still under review and no restart date has been set.

A system that stores member data has known fields; what logs hold depends on how they are written. The company is still going through the stolen logs to find out whether they contain member data. As far as the disclosures show, it could not say straight away that they did not. It says it has identified the entry route and attack method and is dealing with them, but has not said what they were.

The response was quick: the service was down the same day, and the third report, three days after the shutdown, said the route had been identified. What did not work was a layer that decides, and can check, what ends up in the logs before anyone takes them.

## 2. What happened

- **Operator and service**: NTT Solmare, which runs the Japanese e-book store Comic C'moA.
- **System breached**: the system that manages member data. Member data stored in it leaked to a third party (second report).
- **Member data leaked**: email address, hashed password, date of birth, sex and nickname. The company says card data is not held in the affected system and did not leak, and that no leak of purchase history, and no leak, loss or damage of users' "MY bookshelf", has been found so far.
- **Count**: still under review (third report). The company says it will contact affected members once confirmed.
- **System logs**: the third report said some system log files were also found to have been read and taken. The company is going through them to establish whether they contain member data. Which logs were taken, and what they held, has not been disclosed.
- **Entry route**: the third report says the company has "identified the entry route and attack method and is taking action", and that the cause has been identified. Neither the route nor the method has been disclosed (identified, not disclosed). The company says it is taking steps to prevent similar access and further damage.
- **Passwords**: the second report described the hashed passwords as "converted into a special string and encrypted"; the third changed this to "converted into a form whose original content cannot be read". The method has not been disclosed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">As far as the disclosures show, what was missing sits before ④: a way to decide, and check, what ends up in the logs before anyone takes them. The route and method at ② are said to be identified but have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">NTT Solmare</div><div class="no">1</div><b>Runs the member-data system and writes processing records to logs</b><p>What goes into the logs depends on how the system was built.</p></div>
<div class="rx-step"><div class="who">Third party</div><div class="no">2</div><b>Gains unauthorised access to the member-data system</b><p>Route and method identified, not disclosed.</p></div>
<div class="rx-step"><div class="who">Third party</div><div class="no">3</div><b>Takes member data and some system logs</b><p>Five member-data fields. The scope and contents of the logs are not disclosed.</p></div>
<div class="rx-step crit"><div class="who">NTT Solmare</div><div class="no">4</div><b>Goes through the stolen logs afterwards for member data</b><p>The count is under review; no restart date.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-15**: first report. The company judged it highly likely that its servers had been accessed without authorisation from outside, shut the service down at 11:35 and blocked the access.
- **2026-10-16**: it confirmed unauthorised access to the member-data system and the leak of member data to a third party, and published its second report. It said no new access or further damage had been seen.
- **2026-10-18**: the third report said the entry route and attack method had been identified and dealt with, and that some system log files had also been read and taken. Citing further safety work and coordination with relevant parties, it gave no restart date.
- **At writing (10-20)**: no fourth report. The count, the contents of the stolen logs and the entry route remain undisclosed.

> The facts here come from NTT Solmare's first to third reports. The company says it has identified the entry route and attack method but has not disclosed them. The number of members affected, the scope and contents of the stolen system logs, and the password hashing method have not been disclosed either. The investigation is being carried out with outside specialists; no independent third-party findings have been published.

### After disclosure

- **What users were asked to do**: anyone using the same email-and-password pair elsewhere was asked to change it there too. The company warned that the leaked data could be used in mail or phishing sites posing as the company.
- **Restart plan**: once safety is assured, the service will restart in stages, starting with web reading of purchased books. All members will be asked to reset their passwords on restart.

## 4. Why it wasn't stopped

The failure here is not only that the attacker got in, nor only that the count is not yet known. As far as the disclosures show, **What the stolen logs contained could only be worked out after they were taken.**

The response was quick. The company shut the service down at 11:35 on the day it judged access likely, confirmed the leak the next day, and in its third report, three days after the shutdown, said it had identified the route and method. But by the shutdown the member data and logs had already been taken, and when the intrusion began has not been disclosed. What did not work came earlier. Where fields are fixed by design, the leaked fields can be named at once; the second report listed five for member data. Logs are written as a record of processing, and user identifiers or parts of user input can slip into them. As of the third report, the company is still checking whether the logs held member data. The logs themselves have become a leak whose scope cannot be stated without going through them again.

Logs generally have a second job as evidence of what happened. Whether the stolen logs were such records has not been disclosed, but scoping damage usually depends on access records. What has been disclosed is that the logs were "read and taken", not that they were altered. Even so, records kept where the attacker could reach cannot, on their own, show that they are unchanged since they were written. They need a form that can be checked from outside the breached environment.

> In addition to the leaked member data announced previously, some system log files were also found to have been read and taken, and we are going through those logs to determine whether they contain member data.
> — NTT Solmare (third report)

Logs as a leak path have come up before. In [DeepSeek](/critical/briefs/057-deepseek-clickhouse-exposed-db/), an unauthenticated database exposed more than a million lines of logs and plaintext chat history. How much of the entry route gets disclosed varies by company: in [SpeeCAN RAIDEN](/critical/briefs/044-arcadia-speecan-raiden-disaster-mail-spoofing/), Arcadia named the two services, and their hosts, that served as the route (the method was not disclosed), while here the company has said only that it has identified the route and method and is dealing with them. Even while the route is unknown, an organisation can decide what goes into its logs and where they are kept.

## 5. How to counter this

**Even without knowing the entry route, you can reduce what leaks through logs.** There is no need to wait for a route to be disclosed. Decide what goes into the logs and keep member data out. Keep the logs apart from the member-data system, in a form that shows any tampering. Then, if they are taken, you can say what leaked without going through them from scratch, and you can present what you kept as evidence.

### Industries and operations to watch

- **Industry · Media & content**: e-books, video, games and other services that manage large numbers of members by email and password. The more members, the larger the impact of a leak.
- **Industry · Services & retail**: online stores with sign-up and login. The same email and password are often used on other services.
- **Operation · Lookup & data access**: work that looks up member data or logs for operations and incident response. Whatever the logs hold is what can leak.

The same gap exists at most services with members. Many protect the database, but few can list what their logs contain.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Protecting the member database (access control, encryption) | Partly | It protects what is inside the database, not what has been written out to logs. |
| Hashing passwords | Partly | The password itself is not stored, but depending on the method, common passwords can still be recovered. The method used here has not been disclosed. |
| Detecting the intrusion and shutting the service down | Partly | It stops the damage spreading. It does not recover data already taken or the contents of stolen logs. |
| Resetting all members' passwords on restart | Partly | It blocks logins to this service, not to other services where the same pair was reused. |

### What is needed

1. **Decide what goes into the logs, and keep member data out.** Do not write email addresses, dates of birth or user input to logs as they are. If an investigation needs to tell users apart, use substituted values. When what is written is fixed, a stolen log does not have to be re-examined to say what leaked.
2. **Keep logs apart from the member-data system.** In the same environment, one intrusion reaches both. Ship logs out as they are written, to a store that cannot be deleted or altered from the original environment.
3. **Make it possible to check from outside that kept logs are as written.** Take a digest (hash) of each batch of logs and record it outside the breached environment. If the logs used in an investigation match it, you can show they were not altered after they were taken.

### Checklist

Three questions for services that handle member data

- Do your system logs contain email addresses, dates of birth or user input? Can you list what they contain?
- Are your logs kept in the same environment as the member-data system? Could an attacker who reaches it delete or alter them?
- If you are breached, how will you show that the logs used in the investigation have not been altered?

Note: changing what logs contain or where they are kept does not stop an intrusion into the member-data system itself. The entry route has not been disclosed in this case; this Brief will be revised if a later report discloses it.

## 6. Sources

- **NTT Solmare (primary, operator)**: "『コミックシーモア』会員情報の流出に関するご報告(第3報)" (2026-10-18) — <https://www.nttsolmare.com/press/2026/1016-1.html>
- **NTT Solmare (primary, operator)**: "『コミックシーモア』会員情報の流出に関するお詫びとお願い(第2報)" (2026-10-16) — <https://www.nttsolmare.com/press/2026/1016.html>
- **NTT Solmare (primary, operator)**: "『コミックシーモア』の緊急メンテナンスについて(初報)" (2026-10-15) — <https://www.nttsolmare.com/press/2026/0616-1.html>
- **ITmedia NEWS (press)**: "コミックシーモア、会員のメールアドレスや生年月日など流出 件数は精査中" (2026-10-16) — <https://www.itmedia.co.jp/news/article/2610/16/2000002345/>
- **Denfaminicogamer (press)**: "「コミックシーモア」停止続く、再開日時は未定。不正アクセスの原因は特定済み" (2026-10-19) — <https://news.denfaminicogamer.jp/news/261019p>

References: Why logs on a breached host are not evidence — ["An audit trail for MCP tool calls that anyone can check afterwards"](/blog/mcp-tool-call-audit-trail/); why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
