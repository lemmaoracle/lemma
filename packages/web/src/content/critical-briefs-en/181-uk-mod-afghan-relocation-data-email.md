---
brief_no: 181
title: "英国防省：申請者の一部の名前のつもりで、アフガニスタンの移住の申請の案件管理のファイルが、正規のシステムの外へメールで送られた(議会での政府の説明)"
title_en: "UK Ministry of Defence: An Afghan relocation casework file, believed to hold some applicants' names, was emailed outside authorised systems (government statement to Parliament)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2025-07-15
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["151-toppan-sompo-japan-misdirected-zip", "134-tokyo-housing-supply-corp-label-misdirection", "180-ibermutua-aepd-weekly-report-cross-company-data"]
status: draft
version: "1.0"
og_lead_ja: "英国防省、アフガニスタンの移住の申請者 18,714 人分の情報が入ったファイルを正規のシステムの外へ送っていた"
og_lead_en: "UK MoD emailed a file holding 18,714 Afghan relocation applicants' data outside authorised systems"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "情報漏えい事例 · 中身の取り違え"
og_kicker_en: "DATA LEAK · WRONG CONTENTS"
og_headline_ja: "150 人の名前のつもりで\n送ったファイルに、\n<accent>18,714 人分（英政府）</accent>"
og_headline_en: "Meant to send 150 names,\nthe file held far more.\n<accent>18,714 people (UK gov)</accent>"
key_figures:
  - value: "18,714"
    unit: "people"
    label: "Afghan applicants whose data was in the file (applications up to 2022-01-07, per the government)"
    tone: "alert"
  - value: "150"
    unit: "people"
    label: "Applicants whose names the sender believed were being sent (per the government)"
  - value: "2022-02 → 2023-08"
    label: "About 18 months from the email to ministers learning of it"
glossary:
  - term: "ARAP"
    desc: "The Afghan Relocations and Assistance Policy, which takes applications to relocate to the UK from Afghans who worked for the UK. The file was used for casework on those applications."
  - term: "Casework file"
    desc: "A list for tracking each application (a spreadsheet, per the government). Besides names, it can hold columns such as contact details and family members."
  - term: "Superinjunction"
    desc: "A court order that bars not only reporting but also reporting that the order exists. Here it ran from 2023-09-01 to 2025-07-15."
insight:
  slug: "contents-differ-from-intent"
  stop: true
  label: "A file that differs from what the sender thinks"
  quote: "Before sending outside, check the file's record count and fields against the scope the data holder approved, not the sender's own judgement."
industries: ["public-sector"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Don't send a file outside until its record count and fields are checked against what is meant to be sent"
  - slug: "audit-trail"
    item: "Record which file went out, on whose approval, and what it was checked against"
attack_method: "human-error"
impact: "Data on 18,714 Afghan relocation applicants was emailed outside authorised systems"
takeaway: "Check a file's record count and fields before it leaves, apart from what the sender believes it holds."
self_check: "Before casework data leaves your organisation, can you check the file's record count and fields apart from the sender's own judgement?"
countries: ["gb"]
---

## 1. Summary

The sender believed they were sending the names of 150 applicants. What went out was the casework file itself. It held applicants' names and contact details and, in some cases, family members (per the government). The government called it a serious departmental error in clear breach of strict data protection protocols. It came to light about 18 months later, when some people's details appeared online. <strong>When a file holds more than the sender thinks, the difference shows up only after it is out, unless its records and fields are checked before sending.</strong>

## 2. What got through

- **What got through**: In February 2022, a Defence official emailed an ARAP casework file outside authorised government systems. The sender believed it held the names of 150 applicants; the file held data on 18,714 people (per the government).
- **What reached the receiving side**: In general, an email arrives as an operation sending the file the sender chose to the recipient the sender chose. How many people and which fields the file holds cannot be told from the act of sending.
- **How it came to light**: In mid-August 2023, details of nine people from the file appeared online and ministers at the time learned of the loss (per the government), about 18 months after the email.
- **Not disclosed**: The recipient, why the file differed from what was intended, and how it spread after the send. Because the safety of the people affected is at stake, this Brief does not go into individuals or the content of applications.

## 3. What to check

Whatever the route, the condition for telling them apart is that the file's record count and fields are checked against the approved scope, not the sender's own judgement, before the file is sent out.

- **Who approves**: The organisation that holds the data. It decides which fields of the casework data, how many records, and which recipients may receive them. The sender's judgement alone does not decide.
- **Where it is checked**: Where casework data is exported, and where it leaves the organisation. Just before sending, the mechanism reads the file's record count, columns and source dataset. It checks them against the approved scope (here, "the names of 150 applicants") and holds a send that does not match.
- **What is recorded**: Which file went out, on whose approval, and what it was checked against, kept so that data found outside later can be traced to the send it came from.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a file leaves, that its record count and fields match what is meant to be sent, and keeping a record. Detection means noticing after the send, such as when data is found outside. The dates below are from the government's statement.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before sending, check that records and fields match what is meant to be sent</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A file believed to hold 150 names<br>held data on 18,714 people</span></div>
<div class="rx-zone det"><b>Detection · about 18 months later</b>Some details appear online and ministers learn of the loss</div>
<div class="rx-g g1"><div class="t">2022-02</div><b>The file is emailed</b></div>
<div class="rx-g g2"><div class="t">2023-08</div><b>Some details appear online</b></div>
<div class="rx-g g3"><div class="t">2023-09-01</div><b>High Court grants a superinjunction</b></div>
<div class="rx-g g4"><div class="t">2025-07-15</div><b>Order lifted; statement to Parliament</b></div>
</div>
</figure>

Detection worked, but about 18 months after the send. Other cases where what was sent differed from what the sender intended are [TOPPAN's mixed-in ZIP](/critical/briefs/151-toppan-sompo-japan-misdirected-zip/) and [Tokyo Housing Supply Corporation's address labels](/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the route by which casework data is exported and sent out.** It does not look for intrusions; just before sending, and apart from the sender's judgement, it checks that the file's record count and fields match the approved contents.

### Industries and operations to watch

- **Industry · Public sector**: Bodies that track applications or benefits in lists and exchange names with partner agencies and supporters. Besides names, the lists carry columns such as contact details and family members.
- **Operation · Sending & delivery**: Taking part of a list and emailing it outside. If the whole list goes instead of the extract, the difference cannot be seen at a glance.

### Current controls vs Lemma

The route in this case is column 1 (a file larger than intended). Column 2 is the case where the contents are right but the recipient is wrong; the recipient in this case has not been disclosed.

| Control | File with more records or fields than intended | Right contents to the wrong recipient |
| --- | --- | --- |
| Handling rule: don't send outside authorised systems | Partial | Partial |
| Sender's own check before sending | Not effective | Partial |
| Recipient warnings and send-undo | Not relevant | Partial |
| Automated outbound scanning by count of personal data | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Partial |

A handling rule sets the route, but per the government the file was sent outside it. The sender's check does not look for differences inside the file while the sender believes it holds 150 names. Recipient warnings help with a wrong recipient but say nothing about the size of the contents. Automated scanning by count can catch a send containing a lot of personal data, but does not know how many records were approved. Lemma checks the approved contents (record count, fields, source) against the file's actual contents just before sending.

Note: Lemma's check works only when it is built in where casework data is exported or where it leaves the organisation, and the data holder registers which fields, how many records and which recipients may go out. A send made outside that route does not pass through it. Whether it applies when data is sent outside authorised systems, as here, depends on where it sits. If the registered scope is itself wrong, a wrong send still goes through. Lemma does not delete or recall data that has already gone out. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about sending application or case lists outside

- Are files exported from casework data blocked from being sent outside the agreed route?
- When sending outside, are columns the recipient does not need (contact details, family members and so on) removed at export?
- If data is found outside, is there a record to trace which file went out, when and on whose approval?

## 5. Facts and timeline

- **What was sent**: An ARAP casework file (a spreadsheet) holding data on 18,714 Afghans who applied to the Ex Gratia scheme or ARAP on or before 7 January 2022: applicants' names and contact details and, in some cases, family members. In a small number of cases, names of MPs, senior military officers and government officials were noted as supporting applications (per the government).
- **How it was sent**: A Defence official emailed it outside authorised government systems, believing it held the names of 150 applicants. The government called it a serious departmental error in clear breach of strict data protection protocols (per the government).
- **After it came to light**: The department removed the material online, ran an internal investigation, and reported to the Metropolitan Police and the Information Commissioner. The Met decided no criminal investigation was needed (per the government).
- **Superinjunction**: On the previous government's application, the High Court granted a superinjunction on 1 September 2023. Eight media organisations and their journalists were served, and the order's existence could not be reported. On 15 July 2025 the High Court ruled, in light of an independent review, that there was no tenable basis to keep it, and it was lifted at noon that day (per the government).
- **Relocation**: In autumn 2023 the Afghanistan Response Route (ARR) was set up for people in the file who were not eligible for ARAP but were judged at highest risk of reprisal. It was first aimed at about 200 principals and had grown to nearly 3,000 by early 2024. At the time of the statement, about 900 principals and 3,600 family members were in Britain or in transit, at a cost of £400 million (per the government).
- **Independent review**: In early 2025 the Defence Secretary commissioned an independent review by a former senior civil servant (the Rimmer Review), which reported to ministers in June. Per the government, it found it unlikely that being in the file alone would lead to reprisal, while not ruling out risk.

### Timeline

- **2022-02**: The ARAP casework file is emailed outside authorised government systems.
- **2023-08**: Details of nine people from the file appear online and ministers learn of the loss. Removal, internal investigation, and reports to the Met and the ICO.
- **2023-09-01**: The High Court grants a superinjunction.
- **Autumn 2023**: The ARR is set up.
- **2025-06**: The independent review reports to ministers.
- **2025-07-15**: The superinjunction is lifted and the Defence Secretary makes a statement to the House of Commons. The ARR is closed.

> Facts rest on the Defence Secretary's statement to the House of Commons on 15 July 2025 (primary). The error is described, as in the statement, as a departmental error; this Brief does not go into the individual official. Because the safety of the people affected is at stake, details that could identify individuals or the content of applications are left out. The statement does not describe the recipient, why the file differed from what the sender intended, or the checks before sending. What has not been disclosed does not mean there were no controls.

### After disclosure

- **UK government**: The Defence Secretary apologised on behalf of the government. The ARR makes no new offers and is closed; about 600 existing invitations to people still in Afghanistan will be honoured. ARAP stopped taking new applications on 1 July 2025 (per the government).
- **Information Commissioner (ICO)**: Per the government, it has continued to work with the department since the report.

## 6. Sources

- **UK Ministry of Defence (Primary, government statement to Parliament)**: "Oral statement on Afghan data breach" (2025-07-15) — <https://www.gov.uk/government/speeches/oral-statement-on-afghan-data-breach>

This Brief uses only the government's statement to Parliament as primary. The public version of the independent review and the ICO's own statements have not been checked. Press and commentary sites are not included as sources.

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
