---
brief_no: 213
title: "楽天証券：テスト環境で管理していた顧客の情報が、不正アクセスで外部に持ち出された(楽天証券の公表)"
title_en: "Rakuten Securities: Customer data held in a test environment was taken outside through unauthorised access (Rakuten Securities' disclosure)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-11-11
published: 2026-11-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["142-awa-bank-test-environment-repurposed-leak", "204-ntt-data-stdirect-vendor-saas-admin-rights"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "41343369fc69ed91"
  ref: "https://github.com/lemmaoracle/lemma/pull/1221"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Explained branch and customer codes; added the 17 November date (#53)"
  - date: 2026-11-26
    note: "Updated to the 24 Nov second report (c. 4.41m records, c. 11.98m accounts)"
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
  - date: 2026-11-27
    note: "Shortened the condition sentence at the start of section 3 and moved the means out"
version: "1.0"
og_lead_ja: "楽天証券で、テスト環境のシステム内で管理していた顧客の情報が、第三者の不正アクセスで外部に持ち出された"
og_lead_en: "At Rakuten Securities, customer data held in a test environment system was taken outside through unauthorised access by a third party"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · DATA LEAK"
og_headline_ja: "テスト環境にあった\n本番の顧客情報が\n外に持ち出された。\n<accent>約 441 万件</accent>"
og_headline_en: "Live customer data\nheld in a test environment\nwas taken outside.\n<accent>c. 4.41m records.</accent>"
key_figures:
  - value: "c. 4.41m"
    unit: "records"
    label: "Records of personal data such as names and addresses that leaked (c. 3.22m account holders' accounts and c. 1.19m applicants without an account; may include duplicates; as of the 24 November second report; Rakuten Securities)"
    tone: "alert"
  - value: "c. 11.98m"
    unit: "accounts"
    label: "Accounts where only branch and customer codes and login IDs leaked (the login ID is not the Rakuten ID; as of the 24 November second report; Rakuten Securities)"
  - value: "11-11 → 11-16"
    label: "From the day data may have leaked to the day possible unauthorised access was detected (17 November first report)"
glossary:
  - term: "Test environment"
    desc: "An environment set up apart from production for developing and testing systems. Rakuten Securities told the press that it normally keeps only dummy data in its test environments."
  - term: "Masking"
    desc: "In general, replacing fields such as names and account numbers in test data with other characters so they cannot be read."
  - term: "Branch and customer code"
    desc: "A number Rakuten Securities assigns to each account (部店・お客様コード). According to the second report of 24 November, the leak was limited to these codes and login IDs for about 11.98 million accounts."
insight:
  slug: "production-copy-scope-unchecked"
  stop: true
  label: "Production data copied to test without a scope check"
  quote: "Before production customer data is copied into a test environment, check which accounts and fields are copied, which fields are masked and when the copy is deleted against the approved test plan."
industries: ["finance"]
operations: ["data-access", "disclosure"]
controls:
  - slug: "minimize-data"
    item: "Limit production data copied into test environments to the accounts and fields the test needs, mask names, account numbers and the like, and delete it when the test ends"
  - slug: "hold-unverified"
    item: "Hold, before execution, any copy of production data into a test environment that is not tied to an approved test plan"
  - slug: "audit-trail"
    item: "Record, apart from the environment, which production data was placed in a test environment, on whose approval, from when until when, and when it was deleted"
impact: "According to Rakuten Securities' second report (24 November), personal data such as names, dates of birth, addresses and phone numbers leaked for about 4.41 million records (about 3.22 million accounts of account holders and about 1.19 million records of people without an account), and per-account numbers (branch and customer codes) and login IDs alone leaked for about 11.98 million accounts. The company says no leak of passwords or PINs, and no unauthorised access to customer accounts or fraudulent trading arising from the incident, has been confirmed"
takeaway: "Even when a copy goes through formal procedures, check separately that its scope is only what the test needs. Before production data is copied into a test environment, check its scope and deletion date against the approved plan."
self_check: "Before production customer data is copied into a test environment, do you have a mechanism that checks the accounts, fields and deletion date against the approved test plan?"
countries: ["jp"]
search_title: "楽天証券の情報漏えい：テスト環境の約441万件・1,198万口座"
search_description: "楽天証券は第2報（11月24日）で、テスト環境から外部に持ち出された個人情報は約441万件、口座ごとの番号とログインIDに限った漏えいは約1,198万口座と公表した。経緯と対策を整理。"
---

## 1. Summary

In its first report of 17 November, Rakuten Securities disclosed that on 11 November 2026 part of the data held in a system in its test environment may have leaked outside through unauthorised access by a third party. According to its second report of 24 November, the personal data taken outside covers about 4.41 million records (about 3.22 million accounts of account holders and about 1.19 million records of people without an account). For these records, the company says it also confirmed leaks of seven items beyond those in the first report, such as gender and nationality. For about 11.98 million accounts, the leak was limited to branch and customer codes and login IDs. The company detected possible unauthorised access on 16 November, cut it off and made fixes. The cause and details of the unauthorised access are under investigation.

It says no leak of passwords or PINs, and no unauthorised access or fraudulent trading arising from the incident, has been confirmed. The company told the press that it had copied part of its production customer data into the test environment to test an upgrade, unmasked (ITmedia NEWS), and that the copy had gone through formal internal procedures (ITmedia NEWS, J-CAST News).

<strong>If no step checks the scope of a copy, live customer data goes into the test environment unmasked.</strong>

## 2. What got through

- **What got through**: Copying part of the production customer data, unmasked, onto a test environment server to test an upgrade of internal systems (the company's account to the press, as reported).
- **What reached the accepting side**: In general, a job that copies data from production into a test environment receives only the procedural approval and the copy operation. Whether the accounts and fields copied stay within what the test needs, and when the copy will be deleted, cannot be told from that. Copied data generally sits in a test environment with weaker protection than production.
- **Intrusion route**: According to ITmedia NEWS, the company told it that security measures were in place but a vulnerability was exploited.
- **Not disclosed**: The intrusion route and the vulnerability exploited. When the production customer data was copied into the test environment and how long it stayed there (the company declined to say, as reported). Which accounts and fields the test needed. By which route the data was taken. How the company noticed on 16 November. How many people the c. 4.41 million records represent once duplicates are removed.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the production data copied to the test environment is within the approved test plan.

- **Who approves**: The side that manages the customer data (the owner of the production data). For each upgrade test, it decides which accounts and fields are needed to check which functions, which fields are masked and how long the copy may stay, and issues the approval separately from the staff who perform the copy.
- **Where it is checked**: First, just before data is copied from production into the test environment. The check confirms that the number of accounts and the fields fall within the approval and that the fields to be masked are masked; if not, the copy is held. Second, on the approved deletion date. The test environment is checked against the record for remaining production data, and if any is left, the data owner is asked to delete it.
- **What is recorded**: Which production data was placed in the test environment, on whose approval, from when until when, and when it was deleted. This is kept apart from the test environment, so the affected accounts and fields can be identified later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the scope and deletion date against the approved test plan before production customer data is copied into a test environment, and keeping a record. Detection means noticing possible unauthorised access, cutting off access and making fixes. Dates and counts rely on Rakuten Securities' first and second reports.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check scope and deletion date against the approved plan before copying production data</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Data in the test environment taken outside<br>Personal data such as names and addresses: c. 4.41m records; login IDs and the like alone: c. 11.98m accounts (second report)</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Possible unauthorised access detected, cut off and fixed</div>
<div class="rx-g g1"><div class="t">11-11</div><b>Data in the test environment may have leaked</b></div>
<div class="rx-g g2"><div class="t">11-16</div><b>Rakuten Securities detects possible unauthorised access and cuts it off</b></div>
<div class="rx-g g3"><div class="t">11-17</div><b>Rakuten Securities discloses a possible leak (first report)</b></div>
<div class="rx-g g4"><div class="t">11-24</div><b>It discloses the counts of data taken outside (second report)</b></div>
</div>
</figure>

Detection worked, and the unauthorised access was cut off. But it was noticed five days after the day the data may have leaked, and by then the test environment held unmasked production customer data (the company's account to the press). A case where customer data left in a test environment past its purpose leaked is [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/) (a test environment whose use changed). In October, Rakuten Securities was also affected when unauthorised access to a contractor's SaaS put data on buyers of digital-perk bonds in scope ([NTT DATA STdirectServices](/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/)).

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that copies production customer data into a test environment, and into the check on the approved deletion date.** It does not look for unauthorised access; it checks, before the copy, that the scope of the data and how long it stays fall within the approved test plan.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Securities firms, banks and other financial institutions holding personal data and withdrawal bank accounts for many accounts. They build test environments with every system upgrade or new feature.
- **Operation · Lookup & data access**: Copying production customer data out of production to test system upgrades or for analysis.
- **Operation · Disclosure & data release**: Handing customer data to environments outside production, contractors or other systems. The person who decides the scope and time limit is not the one who hands it over.

### Current controls vs Lemma

The route in this case is columns 1 and 2. Column 3 (contacts impersonating Rakuten Securities using leaked data) is something the company has warned users about; no fraudulent trading arising from the incident has been confirmed.

| Control | Copying production customer data into the test environment | Data taken out of the test environment | Contacts impersonating Rakuten Securities using leaked data |
| --- | --- | --- | --- |
| Masking test data | Partial | Partial | Partial |
| Restricting test environment entry points and fixing vulnerabilities | Not relevant | Partial | Not relevant |
| Passkey login | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Not effective |

Masking reduces what can be read if data leaks, but needs a step that decides which fields to mask and applies it to every copy. Restricting entry points and fixing vulnerabilities reduces the chances of an intrusion, but does not change how much data is copied or for how long. Passkeys resist schemes that get users to enter passwords on fake sites, but do not stop calls or post that try to draw out personal details.

Note: Lemma's check works only when it is built into the step that copies data from production into a test environment, and approvals of test plans are managed apart from the staff who perform the copy. If the approved plan itself says to copy a wide scope unmasked, the check passes. If data is moved without going through the copy step (by another route), this check is bypassed. It does not stop a third party who has entered the test environment from taking data out. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and does not recover data already taken.

### Checklist

Three things to confirm about production customer data placed in development and test environments

- Do you keep a list of the test and staging environments that hold production customer data?
- Can you confirm from records that production data was deleted on the set date once a test ended?
- If a leak is suspected, can you identify the affected accounts and fields from the records made at the time of copying?

## 5. Facts and timeline

- **Parties**: Rakuten Securities, Inc. (an online brokerage).
- **What happened**: According to Rakuten Securities, on 16 November it detected possible unauthorised access by a third party to part of its systems, cut it off and made fixes. Its investigation found that on 11 November part of the data held in a system in its test environment may have leaked outside (first report, 17 November). In its second report of 24 November, it disclosed the counts and items of data taken outside. It says the cause and details are under investigation.
- **Why it was in the test environment**: Rakuten Securities told the press that an upgrade of internal systems required checking some functions with production data. It had copied part of the production customer data onto a test server for a period to run the tests, and according to ITmedia NEWS the data was not masked. The copy was not one staff member's decision but went through formal internal procedures, it said. Normally, it said, test environments hold only dummy data (ITmedia NEWS, J-CAST News).
- **Data**: According to Rakuten Securities' second report (24 November), the data taken outside is as follows. (1) Branch and customer code and login ID, plus personal data such as name, name in kana, date of birth, address and phone number: about 4.41 million records. Of these, about 3.22 million accounts are data on account holders and about 1.19 million records are data on people who had not opened an account (what they provided when applying), and the records may include duplicates (for example, where someone abandoned an application and applied again). For these c. 4.41 million records, the company says it confirmed leaks of seven items in addition to those in the first report (email address, employer, withdrawal bank account (institution, account number, holder), last login date and more): gender, nationality, fax number, deposit account details (Rakuten Securities' account details), account opening, receipt and closure status, account registration survey answers, and account registration status. Which items each record holds is not stated. Holdings by product (the number of accounts with assets held) cover about 1.68 million records, customer-declared income about 14,000 records and declared assets about 2.71 million records; the declarations are only the bracket number chosen, without detailed amounts. (2) Leak limited to branch and customer code and login ID: about 11.98 million accounts. The login ID is not the Rakuten ID. The first report of 17 November, including closed accounts, put (1) at up to about 4.47 million accounts and (2) at up to about 11.25 million accounts as a "possible leak".
- **Impact**: Rakuten Securities says no leak of information needed for trading, including the passwords and PINs needed to log in, has been confirmed. As of the second report of 24 November, no unauthorised access to customer accounts or fraudulent trading thought to arise from the incident had been confirmed. The first report spoke of a "possible" leak, but according to J-CAST News the company said on 18 November that it had confirmed that information including personal data had in fact leaked outside.
- **How it was found**: Through the detection of possible unauthorised access on 16 November.

### Timeline

- **2026-11-11**: Part of the data held in a system in Rakuten Securities' test environment may have leaked outside (Rakuten Securities' first report).
- **2026-11-16**: Rakuten Securities detects possible unauthorised access by a third party to part of its systems, cuts off access and makes fixes.
- **2026-11-17**: Rakuten Securities discloses the possible data leak (first report).
- **2026-11-18**: Rakuten Securities tells the press it had copied production customer data into the test environment to test an upgrade (as reported).
- **2026-11-24**: Rakuten Securities publishes its second report: personal data leaked for about 4.41 million records, and branch and customer codes and login IDs alone for about 11.98 million accounts.

> The facts rely on Rakuten Securities' first report of 17 November and second report of 24 November (primary) and the company's answers to the press (ITmedia NEWS, J-CAST News). The reason production customer data was in the test environment, the masking, the procedures and the vulnerability come from answers to the press and are not in the company's disclosure. No disclosure on this incident by the Financial Services Agency or the Personal Information Protection Commission had been found as of 20 November. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response. Written as of 20 November; the counts were updated to the second report on 26 November.

### After disclosure

- **Rakuten Securities**: Says it has finished identifying affected customers and will notify them individually. According to ITmedia NEWS, it asks customers to check the "Notices" screen after logging in, and is notifying closed-account holders by some means. It says it will investigate the cause and the extent of the impact, prevent recurrence and strengthen security.
- **Guidance to users**: The company says its emails contain no URLs and it never asks for personal or login details by phone. It asks users to watch for suspicious emails, SMS, calls and post impersonating Rakuten Securities or affiliated companies, and not to open URLs or enter or give personal details. It says it is making passkey (FIDO2) login mandatory, that more than 90% of customers who log in daily already use it, and asks those who have not set it up to do so. It also notes that customers can themselves temporarily suspend trading and withdrawals. The disclosure does not ask users to change their passwords.

## 6. Sources

- **Rakuten Securities (Primary, company disclosure)**: 「当社お客様の情報漏えいの可能性に関するお詫びとお知らせ」 (2026-11-17, first report) — <https://www.rakuten-sec.co.jp/web/info/info20261117-02.html>
- **Rakuten Securities (Primary, company disclosure)**: 「当社お客様の情報漏えいに関するお詫びとお知らせ（第2報）」 (2026-11-24) — <https://www.rakuten-sec.co.jp/web/info/info20261124-04.html>
- **ITmedia NEWS (Press, interview with the company)**: 「楽天証券の大規模漏えい、なぜテスト環境に顧客情報が？ 「本番データでの確認が必要だった」」 (2026-11-18) — <https://www.itmedia.co.jp/news/article/2611/18/2000003302/>
- **J-CAST News (Press, interview with the company)**: 「楽天証券の情報漏えい、なぜテスト環境に顧客情報？ 「普段は保管せず」も...会社が明かした経緯」 (2026-11-18) — <https://www.j-cast.com/2026/11/18519264.html?p=all>
- **Impress Watch (Press)**: 「楽天証券に不正アクセス 最大1125万口座の情報漏えい可能性」 (2026-11-17) — <https://www.watch.impress.co.jp/docs/news/2157207.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
