---
brief_no: 44
title: "SpeeCAN RAIDEN: a municipal disaster-alert mail platform was breached, and around the same time fake mail from its sender domain reached registrants (Arcadia and municipal notices)"
title_en: "SpeeCAN RAIDEN: a municipal disaster-alert mail platform was breached, and around the same time fake mail from its sender domain reached registrants (Arcadia and municipal notices)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-11
published: 2026-10-16
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "149-revolut-italy-government-mailbox-disclosure-requests", "091-photo-zip-authentication-laundering"]
status: published
version: "2.1"
og_lead_ja: "SpeeCAN RAIDEN 不正アクセス、基盤に置かれたバックドアから防災メールと同じドメインの偽メール 142 万通"
og_lead_en: "SpeeCAN RAIDEN breach: 1.42 million fake mails sent from the disaster-alert domain through a backdoor on the platform"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · EMAIL SPOOFING"
og_headline_ja: "防災メールと同じ\n送信元ドメインで、\n偽メールが届いた。\n<accent>36 自治体が配信停止</accent>"
og_headline_en: "Fake mail came from the\ndisaster alerts' own domain.\n<accent>36 municipalities halted.</accent>"
key_figures:
  - value: "≈ 3.136"
    unit: "million"
    label: "Email addresses possibly exposed (maximum estimate)"
    tone: "alert"
  - value: "36"
    unit: "municipalities"
    label: "Suspended the service (reported to MIC as of 21:00 on 13 October, per Kyodo)"
  - value: "06:26 → 23:40"
    label: "On 11 October, from the attacker's first access to detection through abnormal database load (the route was closed at 03:00 the next day; Arcadia's 12th report)"
glossary:
  - term: "Sender domain"
    desc: "The part of an email address after the “@”. The fake mail used raiden.ktaiwork.jp, the same as the disaster alerts."
  - term: "Email authentication"
    desc: "SPF, DKIM, DMARC and the like. They check that a message came through the domain's legitimate sending route, not who wrote it."
insight:
  slug: "sender-display-as-origin"
  stop: true
  label: "Notices taken as genuine by their sender display"
  quote: "Before a delivery is executed, check which municipality's request it serves, against the municipality's record of requests rather than a service-to-service key or a sending API account."
industries: ["public-sector", "finance"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "Attach a signature that confirms the municipality issued the notice"
  - slug: "hold-unverified"
    item: "Do not act on notices that cannot be verified"
  - slug: "audit-trail"
    item: "Check delivery instructions against what was authorised, and keep a record"
attack_method: "impersonation"
impact: "36 municipalities suspended the service"
takeaway: "Nothing let recipients check, before acting and apart from the sender display, that a notice came from the municipality."
self_check: "Can people who receive notices in your name check they are genuine by something other than the sender address?"
countries: ["jp"]
---

> **Revision (v2.0 / 2026-10-17)**: Restructured into the report layout, and §5 recast as "How to counter this". Arcadia's reports up to no. 11 were re-checked, and what has been disclosed about the entry route was added.

> **Revision (restructured, 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

> **Revision (v2.1 / 2026-11-06)**: Arcadia's 12th report (19 October) disclosed the intrusion method (directory traversal on the media server → configuration file → service-to-service key → brute force on account IDs), its 17th report that 1,423,428 fake mails were sent through a backdoor on the platform, and its 25th report (2 November) a second wave on 22–23 October, so sections 01, 02 and 05 were rewritten. The band was rewritten as a pre-execution gate and 01 split into three paragraphs. The count estimates, gate and controls are unchanged.

## 1. Summary

SpeeCAN RAIDEN, the disaster-alert platform that municipalities use, was breached, and 1,423,428 fake mails carrying the same sender domain as the disaster alerts were sent to registrants through a backdoor placed on the platform (Arcadia's 12th and 17th reports). All the recipient had to go on was the sender name and the address as displayed, and the address was on the same domain as the genuine alerts.

The intruder obtained a configuration file through a directory traversal on the media server that serves attachments, and used the service-to-service login secret key inside it to log in by brute-forcing account IDs (12th report). On 22–23 October, fake mail was sent again, using a mail-sending API account leaked in the first intrusion and a URL parsing confusion vulnerability (25th report). Shizuoka City warns that blocking the sender also stops genuine disaster information.

<strong>If a notice's claim to be genuine rests on the sender display alone, recipients cannot tell a fake once one arrives with the same display.</strong>

## 2. What got through

- **What got through**: Delivery to registrants of mail posing as a credit-card company, with a sender address on the same `@raiden.ktaiwork.jp` domain as the disaster alerts. 1,423,428 messages were sent through a backdoor placed on the platform between 01:17 and 07:16 on 13 October (17th report); at least 869,575 went to addresses the company does not hold. On 22–23 October, mail was sent again from a leaked mail-sending API account (25th report).
- **Intrusion route** (12th report): Access began at 06:26 on 11 October, with repeated probing of the login screen, APIs and file server and login attempts. At 16:39 the configuration file (config.ini) was obtained through a directory traversal on the media server that serves attachments, exposing the service-to-service login secret key inside it. With that key, account IDs were brute-forced, and internal data was taken from the logged-in session. At 23:40 internal monitoring caught abnormal database load, and the route was closed at 03:00 on the 12th. At 17:05 on the 12th a malicious WordPress plugin (a backdoor) was found; it was used for the mail sent in the early hours of the 13th.
- **What was stopped**: Arcadia closed the entry route a little over three hours after detection and stopped the fake mail at 07:16 on the 13th. Saitama City confirmed with the operator two minutes after a resident asked.
- **What reached the receiving side**: In general, what reaches the person who receives mail is the sender name and the sender address as displayed. An address on the same domain cannot be told from a genuine notice by appearance. Fake mail sent from the platform itself also passes email authentication as a legitimate route. Disaster alerts assume the recipient will act quickly; evacuation notices, staff mobilisation and dam-release contacts leave little time to check.
- **Not disclosed**: The data actually taken (counts remain estimates). Which accounts were brute-forced. Where the recipient addresses the company does not hold came from. The results of the third-party vulnerability assessment and dark-web investigation. A final report.

> "@raiden.ktaiwork.jp" is part of the genuine sender address used by Shizuoka City's disaster mail. The mail confirmed this time misused it to impersonate, and was not sent by the credit-card company.
> — Shizuoka City (our translation)

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that a person who receives a notice and is about to act can check, before acting and apart from the sender display, that the municipality issued it.

- **Who approves**: The municipality that issues the notice. For each notice it sends, the municipality attaches a signature of the issuer, made with its own key. The key is never given to the platform, so access to the platform's domain or addresses is not enough to produce it. The signature also covers the issue time and the recipient, so a genuine notice resent later does not pass.
- **Where it is checked**: In two places. Before sending, the delivery platform checks that an instruction lies within the authorised registrants, type and volume, and sends nothing outside it. On the receiving side, an official app or verification page checks the signature before the person acts. A notice that fails is shown as not from the municipality, even if its sender display matches.
- **What is recorded**: The delivery instructions and the results of the check, kept in a form that can be checked outside the platform, so a compromised platform cannot rewrite them.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a delivery is executed, that it rests on the municipality's request, and before the recipient acts, that the notice was issued by the municipality, and keeping a record. Detection means noticing the unauthorised access or the unauthorised sending. Dates rely on Arcadia's 12th, 17th and 25th reports.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a delivery against the municipality's record of requests, and the notice before acting</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>1,423,428 fake mails through a backdoor on the platform<br>A second wave via the sending API on 22–23 October</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Abnormal database load detected; route closed at 03:00 the next day</div>
<div class="rx-g g1"><div class="t">10-11 06:26</div><b>Access begins; configuration file taken at 16:39</b></div>
<div class="rx-g g2"><div class="t">10-11 23:40</div><b>Detected; route closed at 03:00 the next day</b></div>
<div class="rx-g g3"><div class="t">10-13 01:17</div><b>Fake mail sent through the backdoor (stopped 07:16)</b></div>
<div class="rx-g g4"><div class="t">10-22 to 23</div><b>Second wave via the sending API (fixed 10:30 on the 23rd)</b></div>
</div>
</figure>

Other cases where a genuine route stood in for a genuine author are [Photo ZIP](/critical/briefs/091-photo-zip-authentication-laundering/) (mail routed through a legitimate delivery platform passed SPF, DKIM and DMARC) and [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/) (disclosure requests arriving over a state-certified mail network were honoured because the route was genuine). Here the fake mail was sent through a backdoor placed on the platform and, later, from a leaked sending API account (17th and 25th reports); recipients were likewise left with nothing but the sender display.

## 4. What Lemma does

**Lemma builds the pre-execution check into both the sending and the receiving side of notices.** It does not look for intrusions; it checks, before anyone acts, that a delivery instruction lies within what was authorised and that a notice reaching a person was issued by the municipality. The mechanism is needed both at the municipality that contracts out delivery and in the recipient's hands. What can be added today is a single place to check genuine notices, announced to registrants in advance.

### Industries and operations to watch

- **Industry · Government & public sector**: Municipalities that send disaster information, evacuation calls and staff mobilisation through a contracted mass-notification service. Recipients are expected to act at once.
- **Industry · Finance & FinTech**: Businesses that send transaction notices or identity checks by email or SMS through an outside delivery service. A fake notice from the same domain cannot be told apart by appearance.
- **Operation · Sending & delivery**: Contracting out mass delivery to registrants or customers. The platform's domain and addresses become the whole basis of looking genuine.

### Current controls vs Lemma

This fake mail falls under column 1 (a notice sent from the platform itself after an intrusion), per the 17th and 25th reports. Column 2 is a notice sent from outside with a forged sender; nothing disclosed says that happened here.

| Control | Notice sent from the platform | Notice sent from outside with a forged sender |
| --- | --- | --- |
| Email authentication (SPF, DKIM, DMARC) | Not effective | Partial |
| Blocking the sender / spam filtering | Not effective | Not effective |
| Telling people not to open links or attachments in suspicious mail | Partial | Partial |
| Suspending the delivery service | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective |

For fake mail sent from outside with a forged sender, email authentication may let the receiving side quarantine or reject it, depending on the domain's policy; mail sent through the platform itself passes as a legitimate route. Blocking the sender stops the genuine disaster alerts along with the fakes, as Shizuoka City warned. Telling people not to open links may help when, as here, the content plainly isn't a disaster alert (this round posed as a card company), but a fake evacuation notice from the municipality cannot be told apart by appearance. Suspending the service stops what goes out through the platform, and genuine alerts with it. Lemma checks, by signature and before the recipient acts, that the municipality issued the notice.

Note: Lemma's check works only when the municipality signs its notices, recipients have a way to check the signature, and the check of delivery instructions is managed apart from the platform. A recipient with no way to check will still judge notices by appearance, as now. The signature shows only that a notice came from a registered issuer; it does not prevent intrusion or the loss of contact details. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for an organisation that sends notices in its own name through an outside service

- Which outside services send notices in your name, and on which domains? If one of them is compromised, how would a recipient tell real from fake?
- Who can instruct the delivery service, and for what scope? Can a mass delivery outside that scope be stopped before it goes out?
- When fake notices circulate, can you point registrants to a way of checking the genuine ones, instead of telling them to block the sender?

## 5. Facts and timeline

- **System**: SpeeCAN RAIDEN, a mass-notification platform run by Arcadia (Minoh, Osaka). Municipalities use it for disaster-alert email and for phone and fax notices to residents without mobile phones. A 14 October update added traces of access on 119RAIDEN, a service for fire departments, and on NET119, which lets people with hearing or speech disabilities call 119 from a smartphone.
- **Data possibly exposed**: for SpeeCAN RAIDEN, contact names, email addresses, phone and fax numbers, contact persons, contract information and message text kept in delivery history (Arcadia says SpeeCAN RAIDEN handles no payment data). For NET119, users' names, dates of birth, sex, addresses, phone numbers, email addresses, fax numbers and more.
- **Maximum estimates**: SpeeCAN RAIDEN about 3.136 million email addresses, 105,000 phone numbers and 15,000 fax numbers; NET119 about 13,000 records; 119RAIDEN about 97,000 email addresses and more. Arcadia calls these "estimates only".
- **Municipalities**: Shizuoka City said it had established that the email addresses of 34,336 residents and the names, staff numbers and departments of 6,915 city staff had leaked (Arcadia describes the leak as possible). Saitama City cited 34,783 records and Yokosuka City about 59,000 people across four disaster and crime-prevention services as possibly exposed. Okayama City said about 4,500 disaster-mail subscribers, about 5,000 staff mobilisation contacts and about 350 dam-release contacts were registered.
- **Fake mail**: according to Shizuoka City, the subject was "<Important> Please confirm your usage", the sender name was a real credit-card company and the sender address was "…@raiden.ktaiwork.jp". The city says that domain is part of the genuine address its disaster mail uses, and that the message misused it to impersonate; it describes the mail as possibly related to the incident. Matsumoto and Yokosuka received similar reports from registrants, though Matsumoto says any link to the breach is unknown for now.
- **Entry route**: in its second report Arcadia said it had identified an unauthorised entry route from outside, and it shut down the two services that had served as the route: SpeeCAN RAIDEN on raiden3.ktaiwork.jp and the school-oriented Raiden School on s2.ktaiwork.jp. Its 12th report (a PDF of 19 October) disclosed the method. The media server that serves attachments had a directory traversal that reached internal URLs; internal source files were obtained, exposing the service-to-service login secret key in a configuration file. With that key, account IDs were brute-forced, and internal data was taken from the logged-in session. At 17:05 on the 12th a malicious plugin added to WordPress was found, and the owner and support console passwords were changed. On the 14th several rewrites were found in the raiden3 database and were corrected by hand at 09:30 on the 15th (no source code tampering was found). Traces were also found in the databases of NET119, the old 119RAIDEN and an internal accounting subsystem.
- **Route of the fake mail**: according to the 17th report, 1,423,428 messages were sent out through a malicious program (a backdoor) between 01:17 and 07:16 on 13 October, at least 869,575 of them to addresses the company does not hold. A mail-sending test (DKIM, DMARC and the like) ran at 00:10 on the 13th, and sending started at 01:17 in batches of five, eventually 1,000 (12th report). According to the 25th report, on 22–23 October the password of a mail-sending API account leaked in the first intrusion was brute-forced and the API was used from outside to send unauthorised mail. The API linkage was stopped at about 06:30 on the 22nd, but a URL parsing confusion vulnerability let it be used again; the vulnerability was fixed at about 10:30 on the 23rd. The API account and password will be changed before the linkage resumes.

### Timeline

- **2026-10-11**: At 06:26 the attacker's access begins, with repeated probing of the login screen, APIs and file server and login attempts. At 16:39 the configuration file (config.ini) is taken through a directory traversal. At 23:40 internal monitoring catches abnormal database load and the unauthorised access is detected (12th report; the first report had put the suspicious behaviour at 16:30).
- **2026-10-12**: At 03:00 the entry route is closed (the file server vulnerability fixed, among other steps) and the scope investigation begins. At 09:30 the database password is changed (briefly breaking external linkages, phone calls and auto-responses). At 15:20 a preliminary report goes to the Personal Information Protection Commission. At 17:05 a malicious WordPress plugin is found, and at 18:30 the owner and support console passwords are changed.
- **2026-10-13**: At 00:10 a mail-sending test (DKIM, DMARC and the like). At 01:17 fake mail starts going out through the backdoor (in batches of five, eventually 1,000). At 04:10 the volume reveals the backdoor. At 07:16 the unauthorised sending is stopped (1,423,428 messages in total; 17th report). At about 10:20 Arcadia announces the access and possible leak on its blog. From 11:00 raiden3 and s2 are suspended. The local police are consulted at 11:40 and JPCERT/CC at 13:54. At 17:00 the source IP is blocked. At 18:00 traces are found in the NET119 database.
- **2026-10-13**: At 12:50, a resident told Saitama City they had received suspicious mail with the system's name in the sender address. The city checked with Arcadia at 12:52 and learned of the access. Yokosuka City also learned of it after registrants asked about suspicious mail.
- **2026-10-13**: In the evening, Arcadia's second report said the entry route had been identified, the two services that served as the route had been shut down, and the source IP blocked.
- **2026-10-14**: At 08:30 traces are found in the databases of the old 119RAIDEN, NET119 and an internal accounting subsystem. Arcadia gives municipalities template wording to warn registrants, and at 15:00 announces the traces on NET119 and 119RAIDEN. At 22:50 several rewrites are found in the raiden3 database. Shizuoka City publishes an example of the spoofed mail, and its mayor holds an emergency press conference.
- **2026-10-15**: At 09:30 the tampered raiden3 data is corrected by hand; at 13:30 no source code tampering is confirmed. At 15:10 raiden3 and s2 come back, completing the restoration of all services, and users are asked to change login passwords. Arcadia says it has reported to the Personal Information Protection Commission and consulted police and regional government offices.
- **2026-10-16**: Arcadia's 11th report says the entry route remains closed and the service is available as normal, and fixes the NET119 count at 9,020. It is preparing to report to the Personal Information Protection Commission on its customers' behalf (10th report).
- **2026-10-19**: The 12th report publishes a PDF setting out the course of events and the method.
- **2026-10-21**: The 17th report gives the total of 1,423,428 fake mails and that at least 869,575 went to addresses the company does not hold. Users are asked to enable two-step login verification (20th and 22nd reports, 22–23 October).
- **2026-10-22 to 23**: Unauthorised mail is sent again from the leaked mail-sending API account. The API linkage is stopped at about 06:30 on the 22nd and the URL parsing confusion vulnerability fixed at about 10:30 on the 23rd (25th report). On the 23rd, a report and explanatory material are published as PDFs, and the leak report on behalf of customers is filed with the Personal Information Protection Commission (21st and 23rd reports).
- **2026-10-30**: Two-step login verification is added to the smartphone site (24th report).
- **2026-11-02**: The 25th report sets out the cause of the second wave and the response, and says a third-party vulnerability assessment and a dark-web investigation are under way.

> Facts here rest on Arcadia's reports 1–25, its 12th-report PDF and the report and explanatory material of 23 October, and on notices from Saitama, Shizuoka, Yokosuka, Okayama and Matsumoto cities and Mori town. The intrusion method and the route of the fake mail were disclosed in the 12th, 17th and 25th reports; the data actually taken remains an estimate, and the third-party findings and a final report have not been published. The first report's "suspicious behaviour at 16:30" and the 12th report's "detected at 23:40" are reconciled here to the 12th report's timeline. Counts are maximum estimates. What has not been disclosed does not mean there were no controls. Arcadia's notices do not give the total number of affected municipalities (Kyodo reports Arcadia as saying about 800 municipalities use the service). Written as of 6 November.

### After disclosure

- **Suspended delivery**: according to Kyodo News, the Ministry of Internal Affairs and Communications said 36 municipalities had suspended the service as of 21:00 on 13 October. Yokosuka stopped four services and moved alerts to its social accounts and outdoor loudspeakers. Okayama said that while the service was down it could not send weather or evacuation notices to subscribers, or group messages to staff.
- **Warnings to registrants**: municipalities told registrants not to open links or attachments in suspicious mail. Shizuoka said the only thing it sends from `@raiden.ktaiwork.jp` is disaster information, and warned that blocking the suspicious sender or marking it as spam would also stop the city's disaster alerts.
- **Reporting**: Arcadia reported to the Personal Information Protection Commission, JIPDEC's Privacy Mark centre, the Kinki Bureau of Telecommunications and the ISMS body, is in talks with Minoh police and Osaka prefectural police, and plans to file a criminal complaint (12th report). It filed the leak report on behalf of its customers with the Commission on 23 October (23rd report). Yokosuka City has also announced its report to the Commission.
- **Arcadia's preventive measures** (12th and 25th reports): vulnerability assessment and code review with an in-house LLM, an outside vulnerability assessment, a review of database access (per-service passwords and two-step verification), stronger automated monitoring and consideration of a SOC, a review of the configuration files for external linkages (X, Facebook, LINE, Area Mail and the like), two-step login verification, and a change of the mail-sending API account and password.

## 6. Sources

- **Arcadia (primary, operator)**: “Response to unauthorized access to SpeeCAN RAIDEN” (Japanese) (2026-10-13 to 11-02, reports 1–25) — <https://raiden.site.ktaiwork.jp/archives/4597>
- **Arcadia (primary, operator, 12th-report PDF)**: “The course of the unauthorized access and our response” (Japanese) (2026-10-19) — <https://raiden.site.ktaiwork.jp/wp-content/uploads/sites/2/2026/10/2026_10_19AccessIncident.pdf>
- **Arcadia (primary, operator, report)**: “On the possible leak of personal data through unauthorized access” (Japanese) (2026-10-23) — <https://raiden.site.ktaiwork.jp/wp-content/uploads/sites/2/2026/10/【報告書】不正アクセスによる個⼈情報漏えいの可能性に関して20261023.pdf>
- **Arcadia (primary, operator, explanatory material)**: “On the possible leak of personal data through unauthorized access” (Japanese) (2026-10-23) — <https://raiden.site.ktaiwork.jp/wp-content/uploads/sites/2/2026/10/【説明資料】不正アクセスによる個⼈情報漏えいの可能性に関して20261023.pdf>
- **Shizuoka City (primary, municipal notice)**: notice on the leak and the suspicious mail confirmed (Japanese) — <https://www.city.shizuoka.lg.jp/s4268/s000286.html>
- **Saitama City (primary, municipal notice)**: possible personal-data leak from unauthorized access to the disaster-information delivery system, first report (Japanese) (2026-10-13) — <https://www.city.saitama.lg.jp/006/014/008/003/015/007/p134471.html>
- **Yokosuka City (primary, municipal notice)**: possible leak from the disaster and crime-prevention mail services (Japanese) (2026-10-13) — <https://www.city.yokosuka.kanagawa.jp/0525/nagekomi/20261013_roueinoosore.html>
- **Okayama City (primary, municipal notice)**: possible leak at the operator of the disaster mass-notification service (Japanese) (2026-10-13) — <https://www.city.okayama.jp/kurashi/cmsfiles/contents/0000086/86126/kouhourennraku.pdf>
- **Matsumoto City (primary, municipal notice)**: warning on unauthorized access to the Matsumoto Anshin Net mail system (Japanese) (2026-10-14) — <https://www.city.matsumoto.nagano.jp/soshiki/7/216138.html>
- **Mori Town Fire Department (primary, municipal notice)**: possible leak from the NET119 emergency-call service (Japanese) (2026-10-15) — <https://www.town.hokkaido-mori.lg.jp/soshiki/morimachishobohonbu/4690.html>
- **Kyodo News (report)**: “36 municipalities suspend service after unauthorized access to disaster-information provider” (Japanese) (2026-10-14) — <https://news.yahoo.co.jp/articles/effc2b930a84b5d738c637fda00800fac42d7d38>

References: Why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
