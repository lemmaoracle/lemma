---
brief_no: 180
title: "Ibermutua：会社向けの週 1 回の通知メールに、他社の従業員の休業のデータが積み重なって届いた(スペイン AEPD の制裁)"
title_en: "Ibermutua: Weekly notification emails to employers carried other companies' employees' sick-leave data, piled up in the attachments (Spain AEPD sanction)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2024-07-15
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["151-toppan-sompo-japan-misdirected-zip", "134-tokyo-housing-supply-corp-label-misdirection", "156-asos-employee-impersonation-rogue-push"]
status: draft
version: "1.0"
og_lead_ja: "スペイン AEPD、Ibermutua に制裁。週 1 回の通知の添付に、他社の従業員の休業のデータが積み重なった"
og_lead_en: "Spain's AEPD sanctions Ibermutua after weekly employer emails carried other firms' staff sick-leave data"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "情報漏えい事例 · 配信の誤り"
og_kicker_en: "DATA LEAK · MISDELIVERY"
og_headline_ja: "週 1 回の通知に、\n他社の分が積み重なった。\n<accent>3,395 人分</accent>"
og_headline_en: "A weekly report piled up\nother firms' staff data.\n<accent>3,395 people</accent>"
key_figures:
  - value: "3,395"
    unit: "people"
    label: "Whose data reached other companies (Ibermutua's account, as cited in the AEPD decision)"
    tone: "alert"
  - value: "354"
    unit: "recipients"
    label: "Member companies and payroll advisory firms (asesorías) that received the data"
  - value: "€600K"
    label: "Fine (the proposed €1M, cut by 40% for admitting liability and paying early)"
glossary:
  - term: "Mutua (Social Security collaborating mutual)"
    desc: "In Spain, a mutual that works with Social Security to handle benefits such as workplace accidents and occupational illness. Companies join, and it manages their employees' benefit claims."
  - term: "AEPD"
    desc: "Spain's data protection authority. Under the GDPR it investigates complaints, opens sanction proceedings, and imposes fines and orders measures."
  - term: "Commenting out"
    desc: "Turning a line of code into a comment so it no longer runs. It has the same effect as deleting the line."
insight:
  slug: "content-assembled-not-matched"
  stop: true
  label: "Assembled contents not matched to the recipient"
  quote: "Before sending a notification, check that every person in the attachment belongs to the recipient company, using the data holder's membership records rather than the process that assembled it."
industries: ["finance", "healthcare"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Hold a send until every person in the attachment is matched to the recipient company"
  - slug: "minimize-data"
    item: "Limit the fields in routine notifications to what the receiving company needs for its procedures"
  - slug: "audit-trail"
    item: "Record, for each send, which recipient got whose data and what it was checked against"
attack_method: "human-error"
impact: "Sick-leave and benefit data on 3,395 other companies' employees reached 354 recipients"
takeaway: "Even when the recipient is right, a change in how contents are assembled can deliver other companies' data. Match every person in an attachment to the recipient company before sending."
self_check: "In routine sends, do you check before sending that every person in an attachment belongs to the recipient company?"
countries: ["es"]
---

## 1. Summary

The weekly notification that the employer portal sends automatically carried, one after another, the Excel files built earlier in the same day's run for other companies. No one sent to the wrong address: each email went to the address that company had set.

By Ibermutua's account, as cited in the AEPD decision, one line of code was commented out during a change to the process, and the Excel attachment was no longer reset for each notification.

<strong>Even when the recipient is right, a change in how the contents are assembled lets other companies' data ride along in the same send.</strong>

## 2. What got through

- **What went through**: The routine scheduled send, in which the notification process (Ibermutua's "notificador") builds an Excel file per each company's settings and emails it to the configured address. After the change, the line that reset the attachment no longer ran, and each notification also carried the Excel files built earlier in that day's run for other recipients (Ibermutua's account, as cited by the AEPD).
- **What the receiving side sees**: In general, the receiving company gets the usual notification, from the usual sender, at its registered address. Whether the attachment holds only its own employees is not visible until it is opened.
- **How it was found**: On 2024-07-15, one user company told Ibermutua that its weekly notification included data on people outside the company (same source).
- **Not disclosed**: When the change went in, how many runs it affected, and what testing was done before the change.

## 3. Pre-execution check

The condition that holds regardless of route: before sending, and separately from the process that assembled it, check that every person in the attachment belongs to the recipient company.

- **Who approves**: The party holding the data (here, Ibermutua). It registers which company may receive which employees' data, from its membership and benefit records. This is not decided in the processing code.
- **Where to check**: Just before each notification goes out. For each attachment, check that each person's employer matches the recipient company. Hold any notification that includes someone who does not match or whose employer is unknown. Among the measures it ordered, the AEPD also cites mechanisms that link the people in the data to the entities entitled to see it.
- **What is recorded**: For each send, which recipient got whose data and what it was checked against, kept in a form that lets results be compared before and after a change to the process.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before a notification is sent, checking that every person in the attachment belongs to the recipient company, and recording it. Detection = finding out after the send, for example when a recipient notices and reports it. The dates below are those given in the AEPD decision.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible from the disclosure</b>Before sending, check that the people in the attachment belong to the recipient company</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>To 354 recipients<br>Sick-leave and benefit data on 3,395 people</span></div>
<div class="rx-zone det"><b>Detection · a recipient reported it</b>A receiving company noticed other firms' staff data and reported it</div>
<div class="rx-g g1"><div class="t">Change</div><b>A line in the notification process is commented out</b></div>
<div class="rx-g g2"><div class="t">2024-07-15</div><b>A user company tells Ibermutua</b></div>
<div class="rx-g g3"><div class="t">2024-07-17</div><b>Ibermutua notifies the AEPD</b></div>
<div class="rx-g g4"><div class="t">2024-09-06</div><b>Deletion confirmed by all 354 recipients</b></div>
</div>
</figure>

Detection worked. A receiving company noticed and reported it, and Ibermutua notified the AEPD two days later. But it was noticed after delivery. Contents that did not match the recipient also came to light only after sending in [TOPPAN](/critical/briefs/151-toppan-sompo-japan-misdirected-zip/) (a policyholder list slipped into another insurer's ZIP during a manual send) and [the Tokyo housing corporation's address labels](/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/). Unapproved content went out through a legitimate notification system in [ASOS](/critical/briefs/156-asos-employee-impersonation-rogue-push/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the system that sends notifications.** It does not find intrusions or code errors. Just before sending, and separately from the processing code, it checks that every person in the finished attachment belongs to the recipient company.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Insurers and mutuals that handle benefits for member companies' employees and send each company routine reports. One run builds many companies' files in sequence.
- **Industry · Healthcare**: Organizations that report sick leave, illness or accidents to employers and others. If it reaches the wrong party, special-category data leaves the organization.
- **Operation · Sending & delivery**: Routine notifications and reports whose contents are assembled automatically per recipient. A change to the process can alter the contents while the recipients stay the same.

### Current controls vs Lemma

This case took the route in column 1 (a routine send by a changed process). Column 2 is a mistake in registering or changing the recipient address, which was not the route here.

| Control | Routine send by a changed process | Registering or changing the recipient address |
| --- | --- | --- |
| Thorough testing of every change (Ibermutua's post-incident measure) | Partial | Not relevant |
| No multiple attachments per email (same) | Partial | Not relevant |
| Matching attachment ID to the recipient user (same) | Partial | Not relevant |
| Pre-send test on a sample of 20 (same) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial |

All four are measures Ibermutua told the AEPD it put in place after the incident. Testing each change and testing a sample add chances to catch an error, but errors outside what was tested still pass. Blocking multiple attachments and matching attachment IDs catch the shape seen here, where whole files for other companies were added, but not a single file with other companies' people mixed into its rows. Lemma matches each person's employer in the attachment against the recipient company. If the address itself is registered wrongly, the company and the contents still match, so it helps only as far as it can check who approved the registration change.

Note: Lemma's check works only when it is built into the sending system and the party holding the data registers, apart from the processing code, which company may receive which people's data. If that registered mapping is wrong, a wrong send also passes. Lemma does not delete data or retrieve it from recipients. Limiting the fields in a notification is the job of the organization holding the data (in setting the fine, the AEPD also weighed the amount of data sent per person). The table compares what each control checks; it does not show whether anything would have been stopped in this case. Lemma does not detect or prevent intrusions.

### Checklist

Three things to check in your organization about routine sends whose contents are assembled per recipient

- When you change the sending process, do you compare the number of attachments and people per recipient before and after the change?
- Are the fields in routine notifications limited to what the receiving company needs for its procedures?
- For sends that carry health-related data, do you record for each send which recipient got whose data?

## 5. Facts and timeline

- **Organization**: Ibermutua (Social Security collaborating mutual no. 274). It handles benefits for employees of member companies and payroll advisory firms (asesorías) and runs the portal "Ibermutua Digital Empresas/Asesorías" (AEPD).
- **The send**: User companies can receive their employees' benefit status by email on a configurable schedule, such as weekly. The notification process builds an Excel file and attaches it to an email to the configured address. It sends an average of 250,000 notifications a month (Ibermutua's account, as cited by the AEPD).
- **Cause**: During a change to the notification process, the line that reset the Excel attachment for each notification was commented out and did not run. Each notification also carried the Excel files built earlier in the same day's run for other recipients. Ibermutua described it as a human error in programming (AEPD).
- **Data sent**: Data on 3,395 people reached 354 recipients (member companies and advisory firms): name, NIF/NIE, Social Security number, age, sex, employer, occupation code, whether there was sick leave and its start and end dates, days on leave and expected days, reason for return, type of benefit and its calculation base, cost of the case, whether it was a commuting or traffic accident, and more (Ibermutua's account, as cited by the AEPD).
- **The AEPD's finding**: The AEPD said the data included health data on leave for illness or accidents (a special category under GDPR Article 9), and that the amount of data per person was large. It considered the post-incident measures basic security measures for sends of this scale, said it would have been reasonable to have a control to prevent or detect sending errors, and found a breach of GDPR Article 5(1)(f) (integrity and confidentiality) (AEPD).
- **Complaints**: From August to October 2024, people who had been informed by Ibermutua's DPO filed eight complaints in total with the AEPD (AEPD).

### Timeline

- **2024-07-15**: A user company tells Ibermutua that its weekly notification includes data on people from other companies.
- **2024-07-17**: Ibermutua notifies the AEPD of the breach.
- **2024-08-01**: Complaints to the AEPD begin (seven by 09-06, one more on 10-21).
- **2024-09-06**: Deletion confirmed by all 354 recipients (Ibermutua's account).
- **2025-02-03**: The AEPD opens sanction proceedings and proposes a €1,000,000 fine.
- **2025-02-17**: Ibermutua admits liability, waives administrative appeal, and pays €600,000.
- **Afterwards**: The AEPD issues its decision ending the proceedings, confirming the breach and ordering measures.

> The facts here rest on the AEPD decision (PS-00540-2024, file EXP202412881). The cause and the measures are Ibermutua's account as cited in the decision. The breach is the AEPD's finding. Ibermutua admitted liability and paid the fine. This Brief does not assess the company's handling beyond that. The decision itself is undated in its text (payment was on 2025-02-17). When the change went in, how many runs it affected, and whether recipients made any further use of the data have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Ibermutua (post-incident measures)**: Fixed the error and tests every change thoroughly. Blocks multiple attachments in one email and stops the send if found. Checks before sending that the attachment ID belongs to the recipient user, and aborts on a mismatch. Tests each batch on a sample of 20 before sending. Asked all 354 recipients to delete the data and obtained confirmation, and informed the people affected by email or post. It plans to move to download links with access records (its account, as cited by the AEPD).
- **AEPD order**: Within three months of the decision becoming final, Ibermutua must inform the AEPD that it has adopted measures such as limiting the number of attachments, mechanisms linking the people in the data to the entities entitled to see it, and pre-send testing.

## 6. Sources

- **Spanish Data Protection Agency (AEPD, primary, regulator)**: "Resolución de terminación del procedimiento por reconocimiento de responsabilidad y pago voluntario" (PS-00540-2024, EXP202412881, Spanish) — <https://www.aepd.es/documento/ps-00540-2024.pdf>
- **Economist & Jurist (Press)**: "Ibermutua, sancionada con 600.000 euros por filtrar datos personales de más de 3.000 personas por error" (2025-03-12, Spanish) — <https://www.economistjurist.es/actualidad-juridica/ibermutua-sancionada-con-600-000-euros-por-filtrar-datos-personales-de-mas-de-3-000-personas-por-error/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
