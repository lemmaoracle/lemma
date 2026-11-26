---
brief_no: 216
title: "デジタル庁 GSS：政府のファイル共有サービスで、正規の共有相手以外の者からのアクセスがあり、ファイルの一部が漏えいした可能性がある(デジタル庁の公表)"
title_en: "Digital Agency GSS: On the government file-sharing service, someone other than the intended recipients accessed files, and some of the uploaded files may have leaked (Digital Agency's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-11-12
published: 2026-11-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["211-riken-fugaku-unauthorized-access", "212-plaid-karte-server-flaw-db-credentials"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "c090d27ea9047290"
  ref: "https://github.com/lemmaoracle/lemma/pull/1221"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Band, label, 03, figure 1, takeaway and 01 bold name the opener (#53)"
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
  - date: 2026-11-27
    note: "Shortened the condition sentence at the start of section 3 and moved the means out"
version: "1.0"
og_lead_ja: "デジタル庁のガバメントソリューションサービス（GSS）のファイル共有サービスで、正規の共有相手以外の者からのアクセスがあり、アップロードされていたファイルの一部が漏えいした可能性がある"
og_lead_en: "On the file-sharing service of the Digital Agency's Government Solution Service (GSS), someone other than the intended recipients accessed files, and some of the uploaded files may have leaked"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORISED ACCESS"
og_headline_ja: "共有相手でない者が、\nファイルに届いていた。\n<accent>気づくまで3か月半</accent>"
og_headline_en: "Access came from outside\nthe intended recipients.\n<accent>Undetected for three and a half months.</accent>"
key_figures:
  - value: "7/30 → 11/12"
    label: "The period over which access to files by someone other than the intended recipients was confirmed (Digital Agency). The details of the period are under investigation"
    tone: "alert"
  - value: "11/12"
    label: "The day the Digital Agency detected the possibility of the access, began investigating, cut off communication with the outside and stopped providing the service"
  - value: "11/20"
    label: "The day the case was disclosed. The number and contents of the files, and the route of the access, have not been disclosed"
glossary:
  - term: "Government Solution Service (GSS)"
    desc: "A common work platform the Digital Agency provides to government agencies and other bodies that use GSS. Its file-sharing service shares large files, such as meeting materials, between users and with people outside the organisations, such as businesses."
  - term: "Intended recipients"
    desc: "The parties the sharer designated to share a file with."
insight:
  slug: "file-access-not-checked-against-sharing-recipient"
  stop: true
  label: "Files opened by someone who was not a recipient"
  quote: "Before a shared file is opened, check whether the person opening it is an intended recipient, against the record of the sharing's scope and period."
industries: ["public-sector"]
operations: ["data-access"]
controls:
  - slug: "verify-entry"
    item: "At the sharing entry, check whether the person accessing is an intended recipient, and review the recipients each time something is shared"
  - slug: "limit-and-revoke"
    item: "Narrow the scope and period of sharing, and when a leak is suspected, stop the sharing at once and identify what is in scope"
  - slug: "audit-trail"
    item: "Keep a record of who read which file and when, so the scope of a leak can be checked afterwards"
attack_method: "account-takeover"
impact: "On the file-sharing service provided under the Digital Agency's Government Solution Service (GSS), some of the uploaded files may have leaked to the outside. Access by someone other than the intended recipients was confirmed over the period from 30 July to 12 November 2026. The files that may have leaked are also assumed possibly to contain personal information. The number and contents of the files, and the route of the access, have not been disclosed. Provision of the service was stopped on 12 November"
takeaway: "If no one checks whether the person opening a file is an intended recipient, access by someone who is not a recipient goes through as it is. Before a file is opened, check whether the person opening it is an intended recipient against the record of the sharing's scope and period, and keep a record of who read what."
self_check: "When you share files with people outside your organisation, do you have rules for the recipients, the scope and the period?"
countries: ["jp"]
search_title: "デジタル庁GSS ファイル共有 漏えいの可能性：経緯と対策"
search_description: "デジタル庁は、ガバメントソリューションサービス（GSS）のファイル共有サービスで、正規の共有相手以外の者からのアクセスがあり、ファイルの一部が漏えいした可能性があると公表した（11月20日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 20 November 2026, the Digital Agency announced that, on the file-sharing service provided under the Government Solution Service (GSS) for government agencies, some of the uploaded files may have leaked to the outside. Access by someone other than the intended recipients was confirmed over the period from 30 July to 12 November of the same year.

The Digital Agency detected the possibility of the access on 12 November and began an investigation. Immediately after detection it cut off the service's communication with the outside, and it stopped providing the service the same day. Because the files that may have leaked are also assumed possibly to contain personal information, it reported the case promptly to the Personal Information Protection Commission. The number and contents of the files that may have leaked, and the route of the access, have not been disclosed. According to the Digital Agency, at the time of the announcement no secondary harm to personal information arising from this case had been confirmed.

<strong>Unless the person opening a file is checked as an intended recipient against the record of the sharing's scope and period, access by someone who is not a recipient goes through, indistinguishable from normal sharing.</strong>

## 2. What got through

- **What got through**: Access to shared files by someone other than the intended recipients. GSS file sharing is a service that can share files with people outside the organisations as well. The period before detection runs to three and a half months.
- **What reached the accepting side**: In general, what reaches a file-sharing mechanism is the operation of opening a file through a sharing link or an account. It does not show whether that operation is by the very recipient the sharer designated.
- **Disclosure while it is still only a "possibility of leakage"**: What leaked, and how much, is not yet known. The Digital Agency disclosed the case on the basis that the files "may also contain personal information".
- **Not disclosed**: The count and contents of the files that may have leaked (including whether personal information was actually in them). The route and method of the access by someone other than the intended recipients. Who accessed the files, and whether files were taken out. The details of the period over which the access took place.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the person opening the file is a legitimate share recipient.

- **Who issues the record**: The file-sharing mechanism. Each time a file is shared, it records who the intended recipients are, what scope is shared, and until when. For sharing with people outside the organisations, the result of checking the recipient is also kept in the record.
- **Where it is checked**: The steps for opening a shared file. Access not tied to an intended recipient in the record is held. The check runs on a mechanism separate from the sharing mechanism itself.
- **What is recorded**: Who read which file, and when. This is kept apart from the sharing mechanism, in a form that lets the scope of a leak be checked afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a shared file is opened, whether the person opening it is an intended recipient, against the record of the sharing's scope and period, and keeping a record. Detection means noticing the possibility of access by someone other than the intended recipients, cutting off communication with the outside and stopping provision of the service. Dates rely on the Digital Agency's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check that the person opening the file is an intended recipient, against the record of scope and period, before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Access by someone other than the intended recipients (30 July – 12 November)<br>The possibility that some of the files leaked</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Communication with the outside cut off and provision of the service stopped</div>
<div class="rx-g g1"><div class="t">07-30</div><b>The period of access by someone other than the intended recipients begins</b></div>
<div class="rx-g g2"><div class="t">11-12</div><b>The Digital Agency detects the possibility of the access and begins an investigation</b></div>
<div class="rx-g g3"><div class="t">11-12</div><b>Communication with the outside is cut off and provision of the service is stopped</b></div>
<div class="rx-g g4"><div class="t">11-20</div><b>The Digital Agency discloses the case</b></div>
</div>
</figure>

Detection worked, and the service was stopped the same day. Even so, the period over which access took place runs to three and a half months, and the scope of the files that may have leaked is not yet known. Cases where an outside mechanism or a public page became the entry include [RIKEN 'Fugaku'](/critical/briefs/211-riken-fugaku-unauthorized-access/) (a public page used to reach the operations network) and [Plaid KARTE](/critical/briefs/212-plaid-karte-server-flaw-db-credentials/) (theft of connection credentials).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for opening a shared file.** It does not look for unauthorised access; it checks, before execution, whether access rests on the intended recipients and the sharing record.

### Industries and operations to watch

- **Industry · Public sector**: Government agencies, municipalities and other bodies that share documents and meeting materials on a common platform. Because one sharing mechanism is used by many bodies, a gap in the entry check reaches a wide scope.
- **Industry · Procurement & supply chain**: Companies and bodies that share materials with businesses outside the organisation. The recipients are outside, and sharing can remain in place even after the person in charge on the other side changes.
- **Operation · Data access & export**: Opening shared files, and taking opened files outside.
- **Operation · Accounts & permissions**: The rules for a sharing's recipients, scope and period, and the operation that cuts sharing off.

### Current controls vs Lemma

The route in this case is column 1. Column 2 (an intended recipient opening files beyond the scope) and column 3 (shared files passed on from the recipient) have not been disclosed as having happened in this case.

| Control | Access to shared files by someone who is not an intended recipient | An intended recipient opening files beyond the scope of the sharing | Shared files being passed on from the recipient |
| --- | --- | --- | --- |
| At the entry, check whether the person accessing is an intended recipient | Partial | Not relevant | Not relevant |
| Narrow the scope and period of sharing, with rules for cutting sharing off | Partial | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Partial | Not effective |

Checking the recipient at the entry does not stop access that slips past the checking mechanism. Narrowing the scope and period makes the scope that could be seen smaller, but does not stop the access itself.

Note: Lemma's check works only when it is built into the steps for opening files, and the record of recipients, scope and period is managed apart from the sharing mechanism itself. If the sharing mechanism itself is taken over and files are reached directly by a route that skips the check, the check is bypassed. Files passed on from a recipient are dealt with through the sharing's scope and period. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, fix sharing settings or recover files that have leaked.

### Checklist

Three things to confirm about a sharing's recipients, scope and period, the contents of the files shared, and the record of reads

- When you share files with people outside your organisation, do you have rules for the recipients, the scope and the period? After sharing, do you review whether the recipients have changed?
- Do you check, before sending, that no personal information is mixed into the files you share? Is personal information getting into meeting materials without anyone noticing?
- Is there a record of who read which file and when? When a leak is suspected, is it decided who stops which sharing, and where?

## 5. Facts and timeline

- **Party**: The Digital Agency (provides GSS to government agencies and other bodies).
- **What happened**: According to the Digital Agency, on Thursday 12 November 2026 it detected the possibility that files had been accessed by someone other than the intended recipients, and began an investigation. The investigation so far has confirmed that the access took place over the period from Thursday 30 July to Thursday 12 November of the same year. The details of the period over which the access took place are still being investigated.
- **Information**: According to the Digital Agency, this case is disclosed because some of the files uploaded to the service may have leaked, and those files are also assumed possibly to contain personal information. The count and contents of the files that may have leaked have not been disclosed.
- **Impact**: The Digital Agency reported the case promptly to the Personal Information Protection Commission. At this point, no secondary harm to personal information arising from this case has been confirmed. The contact is the Ministerial Services Group, GSS Team (03-6866-0151).
- **How it came to light**: The Digital Agency detected the possibility of the access on 12 November (what followed is under Response after disclosure).

### Timeline

- **2026-07-30**: The start of the period over which access by someone other than the intended recipients was confirmed (through 12 November).
- **2026-11-12**: The Digital Agency detects the possibility of the access and begins an investigation. Immediately after detection it cuts off communication with the outside, and stops providing the service the same day (the date of the report to the Personal Information Protection Commission has not been disclosed).
- **2026-11-20**: The Digital Agency discloses the case.

> The facts of this case rely on the Digital Agency's announcement (the primary source). No second report had been published as of 23 November. The details of the period are said to be under investigation. What has not been disclosed does not mean that no countermeasures were in place. This Brief does not evaluate any party's response. As of 23 November.

### Response after disclosure

- **Digital Agency**: It cut off the service's communication with the outside and has since been preventing access from the outside. It stopped providing the service. It is investigating in cooperation with the police and others, with the help of an outside specialist firm. It reported the case to the Personal Information Protection Commission.

## 6. Sources

- **Digital Agency (primary source, the disclosing party)**: "On the possibility of leakage of files on the file-sharing service provided under the Government Solution Service" (20 November 2026) — <https://www.digital.go.jp/press/a966ee61-478c-4194-8f13-f97599fae986>

Reference: ["The last layer left for cyber defence in the age of AI"](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
