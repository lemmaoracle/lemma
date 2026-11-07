---
brief_no: 191
title: "GMOトラスト・ログイン：ロゴ配信用の公開領域に顧客情報のファイルが置かれ、約 9 年にわたり外部から取得できた(同社の公表)"
title_en: "GMO Trust Login: Files holding customer data sat in a public storage area used for logo delivery and were retrievable from outside for about nine years (company disclosures)"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [data-provenance]
incident_date: 2026-09-14
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["153-nec-contractor-osaka-university-shared-storage-leak", "144-studio-saas-breach-decryption-keys-read", "172-illuminate-education-ftc-former-customer-data", "141-idscan-net-drivers-license-dark-web-breach"]
status: draft
version: "1.0"
og_lead_ja: "GMOトラスト・ログイン、公開領域に置かれた顧客情報のファイルが約 9 年取得可能に。2,492 社・45,030 人"
og_lead_en: "GMO Trust Login: customer files in a public storage area were retrievable for about nine years; 2,492 companies, 45,030 people"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報漏えい事例 · 公開ストレージ"
og_kicker_en: "DATA LEAK · PUBLIC STORAGE"
og_headline_ja: "公開領域に置かれた\n顧客のファイルが、\n約 9 年取得できた。\n<accent>45,030 人</accent>"
og_headline_en: "Customer files sat in a\npublic storage area\nfor about nine years.\n<accent>45,030 people.</accent>"
key_figures:
  - value: "45,030"
    unit: "people"
    label: "People whose names, email addresses, employee numbers and other data sat in retrievable files (2,492 companies; duplicate email addresses excluded; company's third notice)"
    tone: "alert"
  - value: "2017-11 → 2026-09"
    label: "From the switch to a public area to the blocking of retrieval (about nine years; third-party retrieval confirmed in logs only from 8 June 2021)"
  - value: "09-14 → 09-15"
    label: "From the outside researcher's report (17:48) to the end of blocking (16:00 the next day; company's third notice)"
glossary:
  - term: "Public area"
    desc: "The part of cloud storage configured to be readable from outside without authentication, used to serve a site's images and the like. The company had set part of its storage this way to deliver logo images."
  - term: "Signed link"
    desc: "A URL for retrieving a file that carries an expiry and a signature against tampering; it stops working after the expiry. On 16 September the company switched retrieval links to signed ones that expire after one hour."
insight:
  slug: "public-area-file-type-unchecked"
  stop: true
  label: "Temporary files in a public area"
  quote: "Before placing a file in a public area, check its type and contents against the storage rules for that type (public scope and retention), not against the judgement of whoever places it."
industries: ["developers"]
operations: ["data-access", "disclosure"]
controls:
  - slug: "minimize-data"
    item: "Keep personal data out of temporary and error files from bulk operations; hold them in a private location only while needed and delete them on a deadline"
  - slug: "limit-and-revoke"
    item: "Limit public areas to approved file types, stop file listing, and give retrieval links a signature and an expiry"
  - slug: "hold-unverified"
    item: "Do not place in a public area any file that cannot be checked against the storage rules"
  - slug: "audit-trail"
    item: "Record, apart from the placing system, which file was placed in a public area by whom and under which rule"
attack_method: "human-error"
impact: "Files holding names, email addresses, employee numbers and other data of 2,492 companies and 45,030 people were retrievable from outside for about nine years (third-party retrieval confirmed from June 2021)"
takeaway: "Temporary files holding personal data and a contract file sat in a public area used for logo delivery, where anyone could list and retrieve them. Check a file against the storage rules for its type before placing it in a public area."
self_check: "Does the system that places files know whether any temporary file or file holding personal data sits in a public area?"
countries: ["jp"]
search_title: "GMOトラスト・ログイン漏えい：公開領域と9年の経緯"
search_description: "GMOトラスト・ログインで、ロゴ配信用の公開領域に置かれた顧客情報のファイルが約 9 年外部から取得でき、2,492 社・45,030 人に影響した（同社の第三報）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

At GMO GlobalSign's identity management service GMO Trust Login, files holding customer data sat in the public area of storage used to deliver logo images (the company's third notice). They were temporary files from bulk operations and a contract file, and anyone could list them and retrieve them one by one. The retrieval links carried neither a signature nor an expiry.

The files were retrievable from around 14 November 2017, and access logs confirm retrieval by third parties from 8 June 2021; no logs exist from before then. The company learned of it from an outside researcher's report and blocked retrieval on 15 September 2026. 2,492 companies and 45,030 people were affected; passwords and multi-factor authentication data were not included.

<strong>A system that places files in a public area also serves temporary files holding personal data, unless it checks the type of file it places.</strong>

## 2. What got through

- **What got through**: Placement of files holding customer data in a public area, and their retrieval from outside. The files were templates and error files from bulk operations (registering custom attributes, setting passwords on users' behalf, adding members in bulk) and a contract file (company's third notice). The company says they "may have been obtained for improper purposes".
- **What reached the accepting side**: In general, public-area storage receives only the name and contents of a file placed in it. It does not tell a delivery image from a temporary file holding personal data. According to the company, its regular diagnostics covered applications and servers, not storage.
- **Not disclosed**: The cloud provider and the kind of storage. How many files were actually retrieved, and whether retrieval was confirmed for each company. Who retrieved them and why. The circumstances of the missing logs before June 2021. The contents of the researcher's report.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a file is placed in a public area, its type and contents are checked against storage rules (public scope and retention by type) kept apart from the judgement of whoever places it.

- **Who approves**: The side that owns the storage rules (service design and security). It decides which file types may be public and for how long, and limits delivery to a dedicated mechanism that handles approved types only.
- **Where it is checked**: The placing step, before the application writes to the public area. If the type or contents do not match the rules, the file goes to a private location or is held. This is checked on every placement, apart from configuration inspections.
- **What is recorded**: Which file was placed in a public area by whom and under which rule. That record can show what was there, for scoping a leak and for reports to customers and the regulator.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a file's type and contents against the storage rules before placing it in a public area, and keeping a record. Detection means noticing the files already there, through an outside report or an inspection. Dates rely on the company's third notice.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the file's type and contents against the storage rules before placing it in a public area</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Files of 2,492 companies and 45,030 people<br>retrievable for about nine years</span></div>
<div class="rx-zone det"><b>Detection · worked on an outside report</b>A researcher reports; retrieval is blocked by the next day</div>
<div class="rx-g g1"><div class="t">2017-11</div><b>Part of the storage is switched to a public area</b></div>
<div class="rx-g g2"><div class="t">2021-06</div><b>First day on which logs confirm third-party retrieval</b></div>
<div class="rx-g g3"><div class="t">09-14</div><b>An outside researcher reports</b></div>
<div class="rx-g g4"><div class="t">09-15</div><b>Retrieval is blocked</b></div>
</div>
</figure>

It was noticed about nine years after the switch to a public area, through an outside researcher's report rather than the company's own inspections. Cases where files were taken from shared cloud storage include [NEC and Osaka University](/critical/briefs/153-nec-contractor-osaka-university-shared-storage-leak/); a case where a cloud environment was breached and even decryption keys were read is [Studio](/critical/briefs/144-studio-saas-breach-decryption-keys-read/); a case where data that had never been deleted was exposed is [Illuminate Education](/critical/briefs/172-illuminate-education-ftc-former-customer-data/); and a case where identity-check images were sold is [IDScan.net](/critical/briefs/141-idscan-net-drivers-license-dark-web-breach/). Here there was no intrusion: files placed in a public area could simply be retrieved.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that writes files to a public area.** It does not look for retrievals; it checks, before placement, that a file's type and contents match the storage rules.

### Industries and operations to watch

- **Industry · Developers and SaaS**: Companies that hold customer data and use public cloud storage to deliver images or documents. Temporary and error files from bulk operations can end up in the same storage as delivery files.
- **Operation · Data access**: Storing templates, error files and contract files from bulk operations.
- **Operation · Disclosure**: Placing files in a public area used for delivery.

### Current controls vs Lemma

The route in this case is column 1 (files holding personal data placed in a public area). Column 2 covers a public area whose listing is hidden but whose retrieval links are guessed and used one by one. Column 3 covers an insider taking files out of a private location; nothing disclosed says that happened here.

| Control | Placement in a public area | Guessed retrieval links | Removal by an insider |
| --- | --- | --- | --- |
| Regular inspection of storage public scope | Partial | Not effective | Not effective |
| Signatures and expiries on retrieval links | Not effective | Effective | Not effective |
| Stopping file listing in public areas | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Not effective | Not effective |

Regular inspection does nothing for files placed between inspections, and according to the company its diagnostics did not cover storage. Signatures and expiries do nothing in a public area whose listing is visible (the company switched to signed links on 16 September). Stopping the listing does not stop retrieval of a file whose name is known (the company stopped listing at the affected location on 25 September and across all storage on 6 October). Lemma checks a file's type and contents against the storage rules before placement, instead of searching for files after they are placed.

Note: Lemma's check works only when it is built into the step that writes to a public area and the storage rules are managed apart from the placing system. Removal from a private location, or a mistake in the rules themselves, can pass this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not delete files already retrieved.

### Checklist

Three things to confirm about public storage

- Have you decided which file types may sit in a public area and for how long, and does the placing system check against that?
- Is there a mechanism that deletes temporary and error files from bulk operations on a deadline, so none remain holding personal data?
- Do regular diagnostics cover the public scope of storage, not only applications and servers?

## 5. Facts and timeline

- **Party**: GMO GlobalSign K.K. (GMO Trust Login, an identity management and single sign-on service).
- **What happened**: According to the company, part of its storage was used as a public area to deliver logo images, and templates and error files from bulk operations and a contract file sat there. Anyone could list the files and retrieve them one by one, and the retrieval links had no signature or expiry. Regular diagnostics covered applications and servers, not storage.
- **How it was found**: At 17:48 on 14 September 2026, an outside security researcher reported it through the company's vulnerability reporting channel. The company blocked retrieval in stages from about 23:45 that day until 16:00 on 15 September.
- **Impact and response**: 2,492 companies and 45,030 people were affected (duplicate email addresses excluded): 2,184 companies whose bulk-operation files held personal data, 217 whose billing contacts were included, and 91 that could not be identified because their administrator accounts had been deleted; 44,836 people from bulk-operation files and 194 billing contacts. The data included email addresses, names, names of connected services, custom attributes such as employee numbers and departments, and contract information (company IDs, licence counts, usage status, cancellation dates, and billing contacts' names, addresses, phone numbers and email addresses). Login passwords, secret questions, multi-factor authentication data, passwords for connected services and credit card data were not included. No secondary harm had been confirmed as of 30 October. The final report to the Personal Information Protection Commission is planned for 12 November. Since 7 October the company has been telling customers that they, too, may need to report.

### Timeline

- **Around 2017-11-14**: Part of the storage is switched to a public area for delivering logo images. From then on, files placed there are retrievable from outside.
- **2021-06-08**: First day on which access logs confirm retrieval by third parties. No logs survive from before this.
- **2026-09-14**: At 17:48 an outside security researcher reports through the vulnerability reporting channel. Blocking of retrieval begins at about 23:45.
- **2026-09-15**: Blocking is complete at 16:00.
- **2026-09-16**: First notice (provisionally 2,007 companies and 37,747 people). Retrieval links are switched to signed links that expire after one hour.
- **2026-09-24**: Files holding customer data are deleted. Listing at the affected location is stopped on the 25th, and all file-handling features are reviewed on the 30th.
- **2026-10-02**: All storage is inventoried and automated monitoring begins. Listing is stopped across all storage on the 6th.
- **2026-10-07**: Follow-up notice. The company begins emailing customers about reporting to the Personal Information Protection Commission, and says an outside specialist firm's findings will be reported in late October.
- **2026-10-30**: Third notice (2,492 companies and 45,030 people; cause; measures; final report planned for 12 November).

> The facts rely on the company's first, follow-up and third notices (primary). The counts are the final figures from the third notice, up from the provisional figures in the first (2,007 companies and 37,747 people) because of files missed in the initial investigation, an error in the matching criteria, and the addition of billing contacts and unidentifiable accounts. The cloud provider, the number of files actually retrieved, who retrieved them and why, and the contents of the researcher's report have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response.

### After disclosure

- **GMO GlobalSign**: It has completed the blocking and deletion of files, signed links, the stop on listing, a review of all file-handling features, and an inventory of storage with automated monitoring. Going forward it says it will make storage private by default and limit delivery to a dedicated mechanism for approved types only, check data type, storage location, access, retention and deletion when designing features, automatically inspect public areas for prohibited files (by 30 November), run outside diagnostics twice a year, set retention periods by type with automatic deletion, and make a common file-handling component mandatory (by 31 January 2027). It warns customers about suspicious contacts citing contract renewals, licence overruns or account verification.
- **Customers (user companies)**: Depending on the data they entrusted, they may need to report to the Personal Information Protection Commission; the company has been sending guidance since 7 October.

## 6. Sources

- **GMO GlobalSign (Primary, first notice)**: 「【重要】GMOトラスト・ログインにおけるお客様情報の漏えいに関するお知らせとお詫び（第一報）」 (2026-09-16) — <https://news.trustlogin.com/20260916>
- **GMO GlobalSign (Primary, follow-up notice)**: 「【重要】GMOトラスト・ログインにおけるお客様情報の漏えいに関するお知らせとお詫び（続報）」 (2026-10-07) — <https://news.trustlogin.com/20261007-1>
- **GMO GlobalSign (Primary, third notice)**: 「【重要】GMOトラスト・ログインにおけるお客様情報の漏えいに関するお詫びとお知らせ（第三報）」 (2026-10-30) — <https://news.trustlogin.com/20261030>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
