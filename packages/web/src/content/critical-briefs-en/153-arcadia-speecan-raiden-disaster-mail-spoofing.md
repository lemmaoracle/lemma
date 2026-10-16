---
brief_no: 153
title: "SpeeCAN RAIDEN：自治体の防災メール基盤に不正アクセス、同じころ同じ送信元ドメインの偽メールが登録者に届いた(アルカディア・自治体公表) — 届いた通知が自治体のものかを、送信元の表示とは別に確かめる層が無い"
title_en: "SpeeCAN RAIDEN: a municipal disaster-alert mail platform was breached, and around the same time fake mail from its sender domain reached registrants (Arcadia and municipal notices) — nothing lets a recipient check, beyond the sender display, that a notice came from the municipality"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-11
published: 2026-10-16
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["091-photo-zip-authentication-laundering", "149-revolut-italy-government-mailbox-disclosure-requests"]
status: published
version: "1.0"
og_lead_ja: "SpeeCAN RAIDEN 不正アクセス、防災メールと同じドメインから偽メール"
og_lead_en: "SpeeCAN RAIDEN breach: fake mail sent from the disaster-alert domain"
---

## 1. TL;DR

SpeeCAN RAIDEN, the platform many Japanese municipalities use to send disaster-alert email and phone or fax notices, was accessed by a third party on 11 October 2026. Its operator, Arcadia, said up to about 3.136 million email addresses and other data may have leaked. Around the time of the announcement, registrants began receiving mail posing as a credit-card company, with a sender address on `@raiden.ktaiwork.jp`, the same domain the disaster alerts use. Its link to the breach has not been established. Shizuoka City warned that blocking that sender would also block genuine disaster alerts.

Detection worked: Arcadia spotted the behaviour and closed the entry route with an emergency measure within hours. <strong>What did not work was a layer that lets a recipient check, apart from the sender display, that a notice came from the municipality.</strong>

## 2. What happened

- **System**: SpeeCAN RAIDEN, a mass-notification platform run by Arcadia (Minoh, Osaka). Municipalities use it for disaster-alert email and for phone and fax notices to residents without mobile phones. A 14 October update added traces of access on 119RAIDEN, a service for fire departments, and on NET119, which lets people with hearing or speech disabilities call 119 from a smartphone.
- **Data possibly exposed**: for SpeeCAN RAIDEN, contact names, email addresses, phone and fax numbers, contact persons, contract information and message text kept in delivery history (Arcadia says SpeeCAN RAIDEN handles no payment data). For NET119, users' names, dates of birth, sex, addresses, phone numbers, email addresses, fax numbers and more.
- **Maximum estimates**: SpeeCAN RAIDEN about 3.136 million email addresses, 105,000 phone numbers and 15,000 fax numbers; NET119 about 13,000 records; 119RAIDEN about 97,000 email addresses and more. Arcadia calls these "estimates only".
- **Municipalities**: Shizuoka City said it had established that the email addresses of 34,336 residents and the names, staff numbers and departments of 6,915 city staff had leaked (Arcadia describes the leak as possible). Saitama City cited 34,783 records and Yokosuka City about 59,000 people across four disaster and crime-prevention services as possibly exposed. Okayama City said about 4,500 disaster-mail subscribers, about 5,000 staff mobilisation contacts and about 350 dam-release contacts were registered.
- **Fake mail**: according to Shizuoka City, the subject was "<Important> Please confirm your usage", the sender name was a real credit-card company and the sender address was "…@raiden.ktaiwork.jp". The city says that domain is part of the genuine address its disaster mail uses, and that the message misused it to impersonate; it describes the mail as possibly related to the incident. Matsumoto and Yokosuka received similar reports from registrants, though Matsumoto says any link to the breach is unknown for now.
- **Method of intrusion**: not disclosed. Arcadia says it identified and closed the entry route and blocked the source IP.

As far as the published record goes, the sequence runs as follows.

1. Municipalities held registrants' contact details on a contractor's notification platform.
2. A third party accessed that platform, and the contact details may have left it.
3. Around the time of the announcement, mail with the disaster-alert domain in its sender address reached registrants' inboxes (its link to the breach is not established).
4. Recipients had only the sender name and address to go on, and the address was on the same domain as the genuine alerts.

## 3. Timeline — disclosure and response

- **11 October (Sun), 16:30**: Arcadia noticed behaviour suggesting unauthorized access.
- **12 October (Mon, holiday), about 03:00**: it closed the entry route as an emergency measure and began investigating the scope.
- **13 October (Tue), about 10:30**: Arcadia announced the access and possible leakage (per Saitama City). Part of SpeeCAN RAIDEN was suspended from 11:00.
- **13 October, 12:50**: a resident told Saitama City they had received suspicious mail with the system's name in the sender address. The city checked with Arcadia at 12:52 and learned of the access. Yokosuka City also learned of it after registrants asked about suspicious mail.
- **13 October, evening**: Arcadia's second report said the entry route had been identified and the source IP blocked.
- **14 October**: Arcadia gave municipalities template wording to warn registrants. At 15:00 it announced traces on NET119 and 119RAIDEN. Shizuoka City published an example of the spoofed mail, and its mayor held an emergency press conference.
- **15 October**: Arcadia said it had reported to the Personal Information Protection Commission and consulted police and regional government offices. The suspended servers came back around 15:00, and users were asked to change login passwords. The scope of the leak is still under investigation.

> Facts here rest on Arcadia's reports 1–9 and on notices from Saitama, Shizuoka, Yokosuka, Okayama and Matsumoto cities and Mori town. The method of intrusion and the data actually taken had not been disclosed at the time of writing. Counts are maximum estimates. How the fake mail was sent, whether through the platform itself or from outside with a forged sender, has not been disclosed either.

Response after disclosure:

- **Suspended delivery**: according to Kyodo News, the Ministry of Internal Affairs and Communications said 36 municipalities had suspended the service as of 21:00 on 13 October. Yokosuka stopped four services and moved alerts to its social accounts and outdoor loudspeakers. Okayama said that while the service was down it could not send weather or evacuation notices to subscribers, or group messages to staff.
- **Warnings to registrants**: municipalities told registrants not to open links or attachments in suspicious mail. Shizuoka said the only thing it sends from `@raiden.ktaiwork.jp` is disaster information, and warned that blocking the suspicious sender or marking it as spam would also stop the city's disaster alerts.
- **Reporting**: Arcadia and Yokosuka City have announced reports to the Personal Information Protection Commission.

## 4. Why it wasn't stopped

The failure is not only the intrusion, nor a slow warning. **Nothing let a recipient check, apart from the sender display, that a notice came from the municipality.**

Detection worked. Arcadia closed the entry route with an emergency measure less than half a day after spotting the behaviour, and Saitama City confirmed with the operator two minutes after a resident asked. What did not work came earlier. A disaster alert's claim to be genuine rested on one display, the sender domain. Once mail carrying that domain arrived, recipients had nothing left to tell real from fake. Shizuoka's warning shows the structure: blocking the sender to stop the fakes also stops the real alerts.

Disaster alerts assume the recipient will act quickly. Evacuation notices, staff mobilisation and dam-release contacts leave little time to check. This round of fake mail posed as a card company. But as long as it arrives from the same domain, a fake evacuation notice would look no different.

> "@raiden.ktaiwork.jp" is part of the genuine sender address used by Shizuoka City's disaster mail. The mail confirmed this time misused it to impersonate, and was not sent by the credit-card company.
> — Shizuoka City (our translation)

The same structure appears in earlier Briefs. In [Photo ZIP](/critical/briefs/091-photo-zip-authentication-laundering/), mail routed through a legitimate delivery platform passed SPF, DKIM and DMARC; email authentication checks the route, not the author. In [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), disclosure requests arriving over a state-certified mail network were honoured because the route was genuine. In both, a genuine route stood in for a genuine author. The route of this round of fake mail has not been disclosed, but recipients were likewise left to take the sender display as genuine.

## 5. What proof would have changed

There is no need to stop entrusting delivery to a single platform. The step proof would add is not another sender display. It is a check, independent of the delivery route, that lets the recipient confirm a notice came from this municipality.

The design Lemma offers against this gap is as follows.

- **Bind the issuer to the notice itself**: the municipality attaches proof of issuer to each notice, made with its own key. The key is held by the municipality and never by the platform, so access to the platform's domain or addresses is not enough to produce it. The proof also covers the issue time and the recipient, so a genuine notice lifted from delivery history cannot be resent later and pass.
- **Let recipients check before acting**: an official municipal app or verification page checks the proof on a notice. A notice that fails is shown as not from the municipality, even if its sender display matches the genuine one. For recipients who check, avoiding fakes no longer means blocking the whole domain, real alerts included.
- **Check delivery instructions against the municipality's authorisation**: in case fake mail goes out through the platform itself, check before delivery that an instruction reaching the platform lies within what the municipality allowed (target registrants, type, volume), and do not send anything outside it. The check must be verifiable outside the platform, so that a compromised platform cannot skip it.

This differs from after-the-fact detection. Detection works from odd behaviour or residents' reports; by then the fake mail is already in inboxes. Proof asks about the issuer of each message as it arrives. The detection layer and this layer are complementary, not substitutes.

Note: the proof shows only that a notice came from a registered issuer; it does not prevent intrusion or the loss of contact details. And a recipient with no way to check it will still judge notices by appearance, as now.

## 6. Sources

- **Arcadia (primary, operator)**: "Response to unauthorized access to SpeeCAN RAIDEN" (reports 1–9, 13–15 October 2026; Japanese) — <https://raiden.site.ktaiwork.jp/archives/4597>
- **Shizuoka City (primary, municipal notice)**: notice on the leak and the suspicious mail confirmed (Japanese) — <https://www.city.shizuoka.lg.jp/s4268/s000286.html>
- **Saitama City (primary, municipal notice)**: possible personal-data leak from unauthorized access to the disaster-information delivery system, first report (13 October 2026; Japanese) — <https://www.city.saitama.lg.jp/006/014/008/003/015/007/p134471.html>
- **Yokosuka City (primary, municipal notice)**: possible leak from the disaster and crime-prevention mail services (13 October 2026; Japanese) — <https://www.city.yokosuka.kanagawa.jp/0525/nagekomi/20261013_roueinoosore.html>
- **Okayama City (primary, municipal notice)**: possible leak at the operator of the disaster mass-notification service (13 October 2026; Japanese) — <https://www.city.okayama.jp/kurashi/cmsfiles/contents/0000086/86126/kouhourennraku.pdf>
- **Matsumoto City (primary, municipal notice)**: warning on unauthorized access to the Matsumoto Anshin Net mail system (14 October 2026; Japanese) — <https://www.city.matsumoto.nagano.jp/soshiki/7/216138.html>
- **Mori Town Fire Department (primary, municipal notice)**: possible leak from the NET119 emergency-call service (15 October 2026; Japanese) — <https://www.town.hokkaido-mori.lg.jp/soshiki/morimachishobohonbu/4690.html>
- **Kyodo News (report)**: "36 municipalities suspend service after unauthorized access to disaster-information provider" (14 October 2026; Japanese) — <https://news.yahoo.co.jp/articles/effc2b930a84b5d738c637fda00800fac42d7d38>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving where a message came from, see [Pillar 01 — Verifiable Origin](/pillars/#provenance).

All primary sources are self-disclosures by the operator and the municipalities that use it; no independent investigation had been published at the time of writing. Arcadia's notices do not give the total number of affected municipalities (Kyodo reports Arcadia as saying about 800 municipalities use the service).
