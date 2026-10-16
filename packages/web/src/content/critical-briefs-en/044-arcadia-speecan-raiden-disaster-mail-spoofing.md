---
brief_no: 44
title: "SpeeCAN RAIDEN：自治体の防災メール基盤に不正アクセス、同じころ同じ送信元ドメインの偽メールが登録者に届いた(アルカディア・自治体公表) — 届いた通知が自治体のものかを、送信元の表示とは別に確かめる層が無い"
title_en: "SpeeCAN RAIDEN: a municipal disaster-alert mail platform was breached, and around the same time fake mail from its sender domain reached registrants (Arcadia and municipal notices) — nothing lets a recipient check, beyond the sender display, that a notice came from the municipality"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-11
published: 2026-10-16
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "149-revolut-italy-government-mailbox-disclosure-requests", "091-photo-zip-authentication-laundering"]
status: published
version: "2.0"
og_lead_ja: "SpeeCAN RAIDEN 不正アクセス、防災メールと同じドメインから偽メール"
og_lead_en: "SpeeCAN RAIDEN breach: fake mail sent from the disaster-alert domain"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · EMAIL SPOOFING"
og_headline_ja: "防災メールと同じ\n送信元ドメインで、\n偽メールが届いた。\n<accent>36 自治体が配信を停止</accent>"
og_headline_en: "Fake mail came from the disaster alerts' own sender domain.\n<accent>36 municipalities halted alerts.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "≈ 3.136"
    unit: "million"
    label: "Email addresses possibly exposed (maximum estimate)"
    tone: "alert"
  - value: "36"
    unit: "municipalities"
    label: "Suspended the service (reported to MIC as of 21:00 on 13 October, per Kyodo)"
  - value: "10-11 → 10-13"
    label: "Two days from spotting the behaviour to the announcement"
glossary:
  - term: "Sender domain"
    desc: "The part of an email address after the “@”. The fake mail used raiden.ktaiwork.jp, the same as the disaster alerts."
  - term: "Email authentication"
    desc: "SPF, DKIM, DMARC and the like. They check that a message came through the domain's legitimate sending route, not who wrote it."
insight:
  slug: "sender-display-as-origin"
  label: "Notices taken as genuine by their sender display"
  quote: "A disaster alert's claim to be genuine rested on one display: the sender domain."
industries: ["public-sector", "finance"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "Attach proof that the municipality issued the notice"
  - slug: "hold-unverified"
    item: "Do not act on notices that cannot be verified"
  - slug: "audit-trail"
    item: "Check delivery instructions against what was authorised, and keep a record"
---

> **Revision (v2.0 / 2026-10-17)**: Restructured into the report layout, and §5 recast as "How to counter this". Arcadia's reports up to no. 11 were re-checked, and what has been disclosed about the entry route was added.

## 1. TL;DR

SpeeCAN RAIDEN, the platform many Japanese municipalities use to send disaster-alert email and phone or fax notices, suffered unauthorised access by a third party on 11 October 2026. Its operator, Arcadia, said up to about 3.136 million email addresses and other data may have leaked. Around the time of the announcement, mail posing as a credit-card company reached registrants, with a sender address on `@raiden.ktaiwork.jp`, the same domain the disaster alerts use. Its link to the breach has not been established.

Recipients had only the sender name and address to go on, and the address was on the same domain as the genuine alerts. Shizuoka City warned that blocking that sender would also block genuine disaster alerts.

Detection worked: Arcadia spotted the behaviour and closed the entry route with an emergency measure early the next morning. What did not work was a layer that lets a recipient check, apart from the sender display, that a notice came from the municipality.

## 2. What happened

- **System**: SpeeCAN RAIDEN, a mass-notification platform run by Arcadia (Minoh, Osaka). Municipalities use it for disaster-alert email and for phone and fax notices to residents without mobile phones. A 14 October update added traces of access on 119RAIDEN, a service for fire departments, and on NET119, which lets people with hearing or speech disabilities call 119 from a smartphone.
- **Data possibly exposed**: for SpeeCAN RAIDEN, contact names, email addresses, phone and fax numbers, contact persons, contract information and message text kept in delivery history (Arcadia says SpeeCAN RAIDEN handles no payment data). For NET119, users' names, dates of birth, sex, addresses, phone numbers, email addresses, fax numbers and more.
- **Maximum estimates**: SpeeCAN RAIDEN about 3.136 million email addresses, 105,000 phone numbers and 15,000 fax numbers; NET119 about 13,000 records; 119RAIDEN about 97,000 email addresses and more. Arcadia calls these "estimates only".
- **Municipalities**: Shizuoka City said it had established that the email addresses of 34,336 residents and the names, staff numbers and departments of 6,915 city staff had leaked (Arcadia describes the leak as possible). Saitama City cited 34,783 records and Yokosuka City about 59,000 people across four disaster and crime-prevention services as possibly exposed. Okayama City said about 4,500 disaster-mail subscribers, about 5,000 staff mobilisation contacts and about 350 dam-release contacts were registered.
- **Fake mail**: according to Shizuoka City, the subject was "<Important> Please confirm your usage", the sender name was a real credit-card company and the sender address was "…@raiden.ktaiwork.jp". The city says that domain is part of the genuine address its disaster mail uses, and that the message misused it to impersonate; it describes the mail as possibly related to the incident. Matsumoto and Yokosuka received similar reports from registrants, though Matsumoto says any link to the breach is unknown for now.
- **Entry route**: in its second report Arcadia said it had identified an unauthorised entry route from outside, and it shut down the two services that had served as the route: SpeeCAN RAIDEN on raiden3.ktaiwork.jp and the school-oriented Raiden School on s2.ktaiwork.jp. It set the source IP address to be refused. Its ninth report says no malicious program was found in the system and that it is also working on vulnerabilities. The method itself, such as which vulnerability was used or whether login credentials were stolen, has not been disclosed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">What was missing was at ④: a way to check that a notice came from the municipality. How ③ was sent (through the platform itself, or from outside with a forged sender) has not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Municipalities</div><div class="no">1</div><b>Hold registrants' contact details on a contractor's platform</b><p>Used for disaster-alert email, phone and fax.</p></div>
<div class="rx-step"><div class="who">Third party</div><div class="no">2</div><b>Accesses the platform without authorisation</b><p>The contact details may have left it.</p></div>
<div class="rx-step"><div class="who">Sender unknown</div><div class="no">3</div><b>Fake mail with the same domain in its sender address arrives</b><p>Arrived around the time of the announcement. Its link to the breach is not established.</p></div>
<div class="rx-step crit"><div class="who">Registrants</div><div class="no">4</div><b>Can only judge by appearance</b><p>The sender address is on the same domain as the genuine alerts.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-11**: At 16:30, Arcadia noticed behaviour suggesting unauthorized access.
- **2026-10-12**: At about 03:00, it closed the entry route as an emergency measure and began investigating the scope.
- **2026-10-13**: At about 10:30, Arcadia announced the access and possible leakage (per Saitama City). Part of SpeeCAN RAIDEN was suspended from 11:00.
- **2026-10-13**: At 12:50, a resident told Saitama City they had received suspicious mail with the system's name in the sender address. The city checked with Arcadia at 12:52 and learned of the access. Yokosuka City also learned of it after registrants asked about suspicious mail.
- **2026-10-13**: In the evening, Arcadia's second report said the entry route had been identified, the two services that served as the route had been shut down, and the source IP blocked.
- **2026-10-14**: Arcadia gave municipalities template wording to warn registrants. At 15:00 it announced traces on NET119 and 119RAIDEN. Shizuoka City published an example of the spoofed mail, and its mayor held an emergency press conference.
- **2026-10-15**: Arcadia said it had reported to the Personal Information Protection Commission and consulted police and regional government offices. The suspended servers came back around 15:00, and users were asked to change login passwords. The scope of the leak is still under investigation.
- **2026-10-16**: Arcadia's eleventh report said the entry route remains closed and the service is available as normal. It is preparing to report to the Personal Information Protection Commission on its customers' behalf (tenth report).

> Facts here rest on Arcadia's reports 1–11 and on notices from Saitama, Shizuoka, Yokosuka, Okayama and Matsumoto cities and Mori town. The method of intrusion and the data actually taken had not been disclosed at the time of writing. Counts are maximum estimates. How the fake mail was sent, whether through the platform itself or from outside with a forged sender, has not been disclosed either. All primary sources are self-disclosures by the operator and the municipalities that use it; no independent investigation had been published. Arcadia's notices do not give the total number of affected municipalities (Kyodo reports Arcadia as saying about 800 municipalities use the service).

### After disclosure

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

## 5. How to counter this

**With the right mechanism on both the sending and receiving side, this attack could be told apart.** If each notice carried proof that the municipality issued it, and recipients could check that proof, a fake would show up as fake even with a genuine-looking sender. That mechanism is needed both at the municipality that contracts out delivery and in the recipient's hands. What can be added today is a single place to check genuine notices, announced to registrants in advance. When fakes circulate, people can be pointed there instead of being told to block the sender.

### Industries and operations to watch

- **Industry · Government & public sector**: Municipalities that send disaster information, evacuation calls and staff mobilisation through a contracted mass-notification service. Recipients are expected to act at once.
- **Industry · Finance & FinTech**: Businesses that send transaction notices or identity checks by email or SMS through an outside delivery service. A fake notice from the same domain cannot be told apart by appearance.
- **Operation · Sending & delivery**: Contracting out mass delivery to registrants or customers. The platform's domain and addresses become the whole basis of looking genuine.

The same hole exists well beyond disaster alerts, in many organisations that send notices in their own name through an outside service. If the domain and address look genuine, recipients cannot tell the difference.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Email authentication (SPF, DKIM, DMARC) | Partial | For fake mail sent from outside with a forged sender, the receiving side may quarantine or reject it, depending on the domain's policy. Mail sent through the platform itself passes as a legitimate route. How this mail was sent has not been disclosed. |
| Blocking the sender / spam filtering | Ineffective | Stops the genuine disaster alerts along with the fakes, as Shizuoka City warned. |
| Telling people not to open links or attachments in suspicious mail | Partial | May help when, as here, the content plainly isn't a disaster alert (this round posed as a card company). A fake evacuation notice from the municipality cannot be told apart by appearance. |
| Suspending the delivery service | Partial | Stops anything going out through the platform, but also stops genuine alerts. Does nothing against fake mail sent from outside with a forged sender. |

### What is needed

1. **Attach proof that the municipality issued the notice.** The municipality attaches proof of issuer to each notice, made with its own key. The key is never given to the platform, so access to the platform's domain or addresses is not enough to produce it. The proof also covers the issue time and the recipient, so a genuine notice resent later does not pass.
2. **Give recipients a place to check before they act.** An official app or verification page checks the proof on a notice. A notice that fails is shown as not from the municipality, even if its sender display matches. Avoiding fakes no longer means blocking the sender.
3. **Require the contractor to check delivery instructions against what was authorised, and to record what was checked.** Before sending, confirm that an instruction reaching the platform lies within the authorised registrants, type and volume, and send nothing outside it. Keep the result in a form that can be checked outside the platform, so a compromised platform cannot rewrite it.

### Checklist

Three things to check for an organisation that sends notices in its own name through an outside service

- Which outside services send notices in your name, and on which domains? If one of them is compromised, how would a recipient tell real from fake?
- Who can instruct the delivery service, and for what scope? Can a mass delivery outside that scope be stopped before it goes out?
- When fake notices circulate, can you point registrants to a way of checking the genuine ones, instead of telling them to block the sender?

Note: the proof shows only that a notice came from a registered issuer; it does not prevent intrusion or the loss of contact details. And a recipient with no way to check it will still judge notices by appearance, as now.

## 6. Sources

- **Arcadia (primary, operator)**: “Response to unauthorized access to SpeeCAN RAIDEN” (Japanese) (2026-10-13–16, reports 1–11) — <https://raiden.site.ktaiwork.jp/archives/4597>
- **Shizuoka City (primary, municipal notice)**: notice on the leak and the suspicious mail confirmed (Japanese) — <https://www.city.shizuoka.lg.jp/s4268/s000286.html>
- **Saitama City (primary, municipal notice)**: possible personal-data leak from unauthorized access to the disaster-information delivery system, first report (Japanese) (2026-10-13) — <https://www.city.saitama.lg.jp/006/014/008/003/015/007/p134471.html>
- **Yokosuka City (primary, municipal notice)**: possible leak from the disaster and crime-prevention mail services (Japanese) (2026-10-13) — <https://www.city.yokosuka.kanagawa.jp/0525/nagekomi/20261013_roueinoosore.html>
- **Okayama City (primary, municipal notice)**: possible leak at the operator of the disaster mass-notification service (Japanese) (2026-10-13) — <https://www.city.okayama.jp/kurashi/cmsfiles/contents/0000086/86126/kouhourennraku.pdf>
- **Matsumoto City (primary, municipal notice)**: warning on unauthorized access to the Matsumoto Anshin Net mail system (Japanese) (2026-10-14) — <https://www.city.matsumoto.nagano.jp/soshiki/7/216138.html>
- **Mori Town Fire Department (primary, municipal notice)**: possible leak from the NET119 emergency-call service (Japanese) (2026-10-15) — <https://www.town.hokkaido-mori.lg.jp/soshiki/morimachishobohonbu/4690.html>
- **Kyodo News (report)**: “36 municipalities suspend service after unauthorized access to disaster-information provider” (Japanese) (2026-10-14) — <https://news.yahoo.co.jp/articles/effc2b930a84b5d738c637fda00800fac42d7d38>

References: Why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
