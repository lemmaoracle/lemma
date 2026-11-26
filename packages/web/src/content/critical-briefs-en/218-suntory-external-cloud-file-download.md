---
brief_no: 218
title: "サントリー：グループが利用する外部クラウドサービスに不正アクセスがあり、個人情報を含むファイルが第三者にダウンロードされた(サントリーの公表)"
title_en: "Suntory: An external cloud service used by the group was accessed without authorisation, and files containing personal information were downloaded by a third party (Suntory's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-28
published: 2026-11-26
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["216-digital-agency-gss-file-sharing", "212-plaid-karte-server-flaw-db-credentials"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "7c36b1bb938c991c"
  ref: "https://github.com/lemmaoracle/lemma/pull/1215"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
version: "1.0"
og_lead_ja: "サントリーグループが利用する外部クラウドサービスに第三者が不正にアクセスし、従業員や採用の応募者など 7 区分の個人情報を含むファイルをダウンロードした"
og_lead_en: "A third party accessed an external cloud service used by the Suntory group without authorisation and downloaded files containing personal information in seven categories, including employees and recruitment applicants"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORISED ACCESS"
og_headline_ja: "業務のクラウドから、\nファイルが持ち出された。\n<accent>10万人超の個人情報</accent>"
og_headline_en: "Files were downloaded\nfrom a work cloud service.\n<accent>Data on 100,000+ people.</accent>"
key_figures:
  - value: "100,000+"
    unit: "people"
    label: "Sum of the seven categories confirmed as leaked (by 1 November, Suntory's disclosure). The largest is about 90,000 employees and others; overlap has not been disclosed"
    tone: "alert"
  - value: "10/28 → 10/29"
    label: "The day an anomaly on the cloud service was detected and the access cut off, and the day files were confirmed to contain personal information"
  - value: "11/2"
    label: "The day the case was disclosed and a preliminary report made to the Personal Information Protection Commission. The intrusion route and method have not been disclosed"
glossary:
  - term: "External cloud service"
    desc: "The term used in Suntory's disclosure. The name of the service is not given in the disclosure. Nikkei and NHK reported that a Microsoft cloud service used for work (Nikkei named Microsoft 365) was the target."
  - term: "Mal de Shine"
    desc: "Suntory's programme for experiencing its corporate activities. The email addresses of people registered as of the end of 2023 are one of the categories of leaked personal information."
insight:
  slug: "cloud-file-download-not-checked-against-role"
  stop: true
  label: "File downloads not checked against who handles the file"
  quote: "Before a file is downloaded from a work cloud service, check whether the person downloading it is someone who handles that file, against the record of assigned scope and normal use."
industries: ["manufacturing", "supply-chain"]
operations: ["data-access"]
controls:
  - slug: "verify-entry"
    item: "At the entry to the work cloud, confirm who is signing in and from which device, and stop access from unusual places or at unusual times"
  - slug: "minimize-data"
    item: "Do not leave finished files, such as contact lists or applicant data, on the work cloud, and narrow what is stored there"
  - slug: "limit-and-revoke"
    item: "Narrow the files each person can read to their assigned scope, and when an anomaly appears, stop the access at once and identify the files in scope"
  - slug: "audit-trail"
    item: "Keep a record of who downloaded which file and when, so the scope of a leak can be checked afterwards"
attack_method: "account-takeover"
impact: "A third party accessed an external cloud service used by the Suntory group without authorisation and downloaded files containing personal information. By 1 November, the personal information confirmed covered seven categories, including the names and email addresses of about 90,000 employees of the group, partner companies and others, 7,173 applicants for 2026 graduate recruitment and the email addresses of 7,323 people registered with a corporate-activity programme; together they exceed 100,000. Payment information such as credit card numbers was not included. The route and method of the intrusion have not been disclosed"
takeaway: "Unless someone confirms whether the person downloading a file is the one who handles it, a download by a third party who got in from outside cannot be told apart from everyday work. Before a download, check against the record of assigned scope and normal use whether that person handles the file, and record who downloaded what."
self_check: "Do you have a mechanism that checks, against a record, whether the person downloading a file from your work cloud is the one who handles it?"
countries: ["jp"]
search_title: "サントリー情報漏えい：外部クラウド不正アクセスで10万人超"
search_description: "サントリーは、グループが利用する外部クラウドサービスへの不正アクセスで、従業員や採用の応募者など7区分の個人情報を含むファイルがダウンロードされたと公表した（11月2日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 2 November 2026, Suntory announced that an external cloud service used by the group had been accessed without authorisation by a third party, and that files containing personal information had been downloaded. It detected an anomaly on 28 October, cut off the unauthorised access and identified the names of the leaked files. On 29 October, it confirmed that some of them contained personal information.

The personal information confirmed as leaked covers seven categories: employee contact details, as well as 7,173 applicants for 2026 graduate recruitment and the email addresses of 7,323 people registered with the corporate-activity programme "Mal de Shine", among others. Payment information was not included. The route and method of the intrusion have not been disclosed.

<strong>Unless someone confirms whether the person downloading a file is the one who handles it, a download by a third party who got in from outside cannot be told apart from everyday work.</strong>

## 2. What got through

- **What got through**: Downloads of files by a third party from an external cloud service used for work. Which account was used, and since when, has not been disclosed.
- **What reached the accepting side**: In general, what reaches a work cloud is the operation of a signed-in account opening and downloading a file. It does not show whether that operation is work within the account holder's assigned scope.
- **Personal information inside work files**: Contact details of employees and partners, applicants' registration data, home-delivery customers and more: the lists and records held in work files became the scope of the leak as they were.
- **Not disclosed**: The route and method of the intrusion. Which account, with which permissions, was used. When the unauthorised access began. How many files were downloaded. The name of the service is not given in the disclosure.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the person downloading a file is someone who handles that file.

- **Who issues the record**: The department that manages the work cloud. For each account, it records which folders and files the person handles as part of their role, and how much they normally download. For files handled by only a few people, such as recruitment or programme lists, it records who handles them.
- **Where it is checked**: The steps for downloading a file. Operations not tied to the assigned scope and normal use in the record are held. The check runs on a mechanism separate from the cloud accounts themselves.
- **What is recorded**: Who downloaded which file, and when, kept apart from the cloud so the scope of a leak can be checked afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a file is downloaded, whether that person handles the file, against the record of assigned scope and normal use, and keeping a record. Detection means noticing an anomaly on the external cloud service and cutting off the unauthorised access. Dates rely on Suntory's disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check against the record that the person downloading handles the file before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Downloads by a third party of files containing personal information<br>Seven categories of personal information confirmed by 1 November</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The anomaly detected and the unauthorised access cut off</div>
<div class="rx-g g1"><div class="t">10-28</div><b>An anomaly on the external cloud service is detected and the unauthorised access is cut off</b></div>
<div class="rx-g g2"><div class="t">10-28</div><b>An investigation begins and the names of the leaked files are identified</b></div>
<div class="rx-g g3"><div class="t">10-29</div><b>Some of the files are confirmed to contain personal information</b></div>
<div class="rx-g g4"><div class="t">11-02</div><b>Suntory discloses the case and makes a preliminary report to the Personal Information Protection Commission</b></div>
</div>
</figure>

Detection worked, and the unauthorised access was cut off on the day the anomaly was detected. Even so, the files had been downloaded before the cut-off. Cases where an outside mechanism used for work became the entry include [Digital Agency GSS](/critical/briefs/216-digital-agency-gss-file-sharing/) (access to files by someone who was not a recipient) and [Plaid KARTE](/critical/briefs/212-plaid-karte-server-flaw-db-credentials/) (theft of connection credentials).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for downloading files from a work cloud service.** It does not look for unauthorised access; it checks, before execution, whether a download rests on the account holder's assigned scope and normal use.

### Industries and operations to watch

- **Industry · Manufacturing & critical infrastructure**: Manufacturers whose many group companies and business partners exchange materials and lists on the same work cloud. One cloud holds information about employees, partners, customers and recruitment side by side.
- **Industry · Procurement & supply chain**: Companies that hold contact details for employees of partner companies and business partners. A leak at the company also becomes a leak of its partners' employees' information.
- **Operation · Data access & export**: Opening files stored on the work cloud, and downloading them.

### Current controls vs Lemma

The route in this case is column 1. Column 2 (a legitimate user downloading beyond their assigned scope) and column 3 (messages posing as the group, using leaked contact details) have not been disclosed as having happened in this case.

| Control | Downloads of files on the work cloud by someone who came in from outside | A legitimate user downloading files beyond their assigned scope | Messages pretending to be from the group, using leaked contact details |
| --- | --- | --- | --- |
| At the entry, confirm who is signing in and from which device | Partial | Not relevant | Not relevant |
| Do not leave finished lists on the cloud | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Partial | Partial | Not effective |

Confirming who signs in at the entry does not stop access that slips past the confirmation, or operations by legitimate users. Not leaving finished lists makes the scope of a leak smaller, but does not stop the download itself.

Note: Lemma's check works only when it is built into the steps for downloading files, and the record of assigned scope and normal use is managed apart from the cloud accounts. If the cloud's administrator permissions are taken over, files read by a route that skips the check bypass it. Messages using leaked contact details are dealt with by warning the people who receive them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, fix cloud settings or recover files that have leaked.

### Checklist

Three things to confirm about the files kept on the work cloud, the scope of downloads, and the record of them

- Is there a rule not to leave finished lists or applicant data on the work cloud? Do you know which folders hold personal information?
- Is it decided, for each account, which files it can download according to its assigned scope? Is there a mechanism to notice downloads in unusual amounts?
- Is there a record of who downloaded which file and when? When a leak is suspected, is it decided who stops which access, and where?

## 5. Facts and timeline

- **Party**: Suntory Holdings Limited (the disclosure page is on its website). A PDF with the same date is also posted on Suntory Beverage & Food's website.
- **What happened**: According to Suntory, an external cloud service used by the group was accessed without authorisation by a third party, and files were downloaded (the sequence from detection is in the timeline). The route and method of the intrusion have not been disclosed. Nikkei reported that Suntory Holdings had detected unauthorised access by a third party to Microsoft 365, the work software its staff use, and that the attacker had not been identified.
- **Information**: According to Suntory, the personal information confirmed by 1 November as leaked to a third party falls into the following seven categories. (1) Names and email addresses of about 90,000 employees of the Suntory group, partner companies and others. (2) Email addresses of 7,323 people registered with the corporate-activity programme "Mal de Shine" as of the end of 2023. (3) Recruitment-portal registration data (name, email address, phone number and so on) of 7,173 applicants for Suntory Holdings' 2026 graduate recruitment, business division open selection. (4) Names and phone numbers of 1,097 employees of the group and business partners stored on two company mobile phones of Suntory Beverage Solution. (5) Names, email addresses and phone numbers of 324 employees of Monte Bussan and partner companies. (6) Names and delivery-location information of 96 Izutsu Maisen home-delivery customers and delivery staff. (7) Names and job titles of 25 employees of business partners. Together the categories exceed 100,000 people, but the overlap between them has not been disclosed. Payment information such as credit card numbers was not included.
- **Impact**: According to Suntory, at this point no misuse of the personal information has been confirmed. It began contacting affected people individually on 2 November. Enquiries are handled through an enquiry form and a toll-free number (0120-050-310).
- **How it came to light**: Through the detection of an anomaly on the external cloud service on 28 October. Suntory says it has taken the measures needed to prevent further harm and continues to investigate.

### Timeline

- **2026-10-28**: Suntory detects an anomaly on the external cloud service, cuts off the unauthorised access and begins an investigation. It identifies the names of the leaked files.
- **2026-10-29**: Some of the leaked files are confirmed to contain personal information.
- **2026-11-01**: By this date, the personal information confirmed as leaked to a third party covers seven categories (the cut-off date of the disclosure's count).
- **2026-11-02**: Suntory discloses the case. It makes a preliminary report to the Personal Information Protection Commission and begins contacting affected people individually.

> The facts of this case rely on Suntory's 2 November disclosure (the primary source). The disclosure page refuses automated retrieval, so the categories, counts and dates were checked against its full text as opened in a browser on 26 November. The PDF has not been read. The disclosure gives no total; "exceed 100,000" is the sum of the seven categories (Nikkei and NHK reported about 100,000 people). The name of the service (a Microsoft cloud service) relies on reporting by Nikkei and NHK. No follow-up report was found as of a check on 26 November. Suntory continues to investigate. What has not been disclosed does not mean that no countermeasures were in place. This Brief does not evaluate any party's response. As of the 2 November disclosure.

### Response after disclosure

- **Suntory**: It is contacting affected people individually and has set up an enquiry contact (a form and a toll-free number). It continues to investigate and says it will promptly report any newly confirmed facts that should be disclosed.

## 6. Sources

- **Suntory Holdings (primary source, the disclosing party)**: "Apology regarding the leak of personal information due to unauthorised access to an external cloud service" (2 November 2026) — <https://www.suntory.co.jp/note/detail/261102_008203.html> (automated retrieval is refused; checked against the full text opened in a browser on 26 November 2026)
- **Suntory Beverage & Food (primary source, the disclosing party, PDF)**: PDF of the disclosure with the same date (2 November 2026) — <https://www.suntory.co.jp/softdrink/note/detail/pdf/20261102_j.pdf> (access was denied; not read)
- **Business+IT (report)**: Report on the unauthorised access to Suntory's external cloud and the seven categories of personal information (November 2026) — <https://www.sbbit.jp/article/cont1/188015>
- **Nikkei (report)**: "Suntory HD leaks personal information on 100,000 people through unauthorised access" (2 November 2026) — <https://www.nikkei.com/article/DGXZQOUC0254H0S6A101C2000000/>
- **MBS News (report)**: "Breaking: Unauthorised access to Suntory's cloud; information on recruitment applicants and others may have leaked" (2 November 2026) — <https://news.yahoo.co.jp/articles/42cc04368ed201764a33f42c92705b2892bb0b62>
- **NHK (report)**: "Suntory HD: personal information on about 100,000 people leaked through unauthorised access" (2 November 2026) — <https://news.web.nhk/newsweb/na/nd-20261102de69622>
- **ScanNetSecurity (report)**: "Unauthorised access to an external cloud service used by the Suntory group; download of files containing personal information confirmed" (6 November 2026) — <https://scan.netsecurity.ne.jp/article/2026/11/06/56687.html>

Reference: ["The last layer left for cyber defence in the age of AI"](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
