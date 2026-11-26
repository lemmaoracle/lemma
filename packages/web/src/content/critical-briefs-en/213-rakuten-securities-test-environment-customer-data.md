---
brief_no: 213
title: "楽天証券：テスト環境で管理していた顧客の情報が、不正アクセスで外部に漏えいしたおそれがある(楽天証券の公表)"
title_en: "Rakuten Securities: Customer data held in a test environment may have leaked through unauthorised access (Rakuten Securities' disclosure)"
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
  at: 2026-11-20
  rev: "4cedd6f92027b023"
  ref: "https://github.com/lemmaoracle/lemma/pull/1185"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Explained branch and customer codes; added the 17 November date (#53)"
version: "1.0"
og_lead_ja: "楽天証券で、テスト環境のシステム内で管理していた顧客の情報が、第三者の不正アクセスで外部に漏えいしたおそれ"
og_lead_en: "At Rakuten Securities, customer data held in a test environment system may have leaked through unauthorised access by a third party"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · DATA LEAK"
og_headline_ja: "テスト環境にあった\n本番の顧客情報が\n外に漏れたおそれ。\n<accent>最大約 447 万口座</accent>"
og_headline_en: "Live customer data\nheld in a test environment\nmay have leaked.\n<accent>Up to c. 4.47m accounts.</accent>"
key_figures:
  - value: "c. 4.47m"
    unit: "accounts"
    label: "Accounts whose names, addresses, withdrawal bank accounts, declared income and financial assets and more may have leaked (maximum; includes closed accounts; as of the 17 November disclosure; Rakuten Securities)"
    tone: "alert"
  - value: "c. 11.25m"
    unit: "accounts"
    label: "Accounts whose per-account numbers (branch and customer codes) and login IDs may have leaked (maximum; the login ID is not the Rakuten ID; as of the 17 November disclosure; Rakuten Securities)"
  - value: "11-11 → 11-16"
    label: "From the day data in the test environment may have leaked to the day Rakuten Securities detected possible unauthorised access"
glossary:
  - term: "Test environment"
    desc: "An environment set up apart from production for developing and testing systems. Rakuten Securities told the press that it normally keeps only dummy data in its test environments."
  - term: "Masking"
    desc: "In general, replacing fields such as names and account numbers in test data with other characters so they cannot be read. Rakuten Securities told ITmedia NEWS that the customer data in this case was not masked."
  - term: "Branch and customer code"
    desc: "A number Rakuten Securities assigns to each account (部店・お客様コード). In this case, codes and login IDs for up to about 11.25 million accounts were in scope."
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
impact: "Names, addresses, withdrawal bank accounts, declared income and financial assets and more for up to about 4.47 million accounts, and branch and customer codes and login IDs for up to about 11.25 million accounts, may have leaked (includes closed accounts; Rakuten Securities, 17 November). The company says no leak of passwords or PINs, and no fraudulent trading arising from the incident, has been confirmed"
takeaway: "Customer data held in a test environment system may have leaked through unauthorised access. Even when a copy goes through formal procedures, check separately that its scope is only what the test needs. Before production data is copied into a test environment, check its scope and deletion date against the approved plan."
self_check: "Before production customer data is copied into a test environment, do you have a mechanism that checks the accounts, fields and deletion date against the approved test plan?"
countries: ["jp"]
search_title: "楽天証券の情報漏えいのおそれ：テスト環境の最大1,125万口座"
search_description: "楽天証券は、第三者の不正アクセスで、テスト環境で管理していた最大約447万口座の氏名・出金先口座などと、最大約1,125万口座のログインIDが漏えいしたおそれがあると公表した（11月17日）。経緯と対策を整理。"
---

## 1. Summary

According to Rakuten Securities, on 11 November 2026 part of the data held in a system in its test environment may have leaked outside through unauthorised access by a third party. For up to about 4.47 million accounts, the data includes names, dates of birth, addresses, phone numbers, email addresses, employers, withdrawal bank accounts, declared income and financial assets, holdings by product and last login dates. The company detected possible unauthorised access on 16 November, cut off access and made fixes. The cause and details of the unauthorised access are under investigation.

The company says no leak of the passwords and PINs needed to log in has been confirmed, and no unauthorised access or fraudulent trading arising from the incident has been confirmed. It told the press that, to test an upgrade of internal systems, it had copied part of its production customer data into the test environment for a period. The data was not masked (ITmedia NEWS), and the copy had gone through formal internal procedures, it said (ITmedia NEWS, J-CAST News).

<strong>If no step checks the scope of a copy, live customer data goes into the test environment unmasked.</strong>

## 2. What got through

- **What got through**: Copying part of the production customer data, unmasked, onto a test environment server to test an upgrade of internal systems (the company's account to the press, as reported). Then, on 11 November, part of the data held in a system in the test environment may have leaked outside (Rakuten Securities' disclosure).
- **What reached the accepting side**: In general, a job that copies data from production into a test environment receives only the procedural approval and the copy operation. Whether the number of accounts and the fields copied stay within what the test needs, and when the copy will be deleted, cannot be told from the copy operation itself. Copied data generally sits in a test environment with weaker protection than production.
- **Intrusion route**: Rakuten Securities says the cause and details of the unauthorised access are under investigation (primary disclosure). According to ITmedia NEWS, the company told it that security measures were in place but a vulnerability was exploited. Which vulnerability, and through which entry point, has not been disclosed.
- **Not disclosed**: The intrusion route and the vulnerability exploited. When the production customer data was copied into the test environment and how long it stayed there (the company declined to say, as reported). Which accounts and fields the test needed. What was taken on 11 November, and by which route. How the company noticed on 16 November. How many closed accounts are in scope.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before production customer data is copied into a test environment, the accounts and fields copied, the fields masked and the deletion date are checked against the approved test plan.

- **Who approves**: The side that manages the customer data (the owner of the production data). For each upgrade test, it decides which accounts and fields are needed to check which functions, which fields are masked and how long the copy may stay, and issues the approval separately from the staff who perform the copy.
- **Where it is checked**: First, just before data is copied from production into the test environment. The check confirms that the number of accounts and the fields fall within the approval and that the fields to be masked are masked; if they do not match, the copy is held before it runs. Second, on the approved deletion date. The test environment is checked against the record for remaining production data, and if any is left, the data owner is asked to delete it. A third party who enters the test environment and takes the copied data out is not stopped by this check.
- **What is recorded**: Which production data was placed in the test environment, on whose approval, from when until when, and when it was deleted. This is kept apart from the test environment, so that if a leak is suspected the affected accounts and fields can be identified from the record.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the scope and deletion date against the approved test plan before production customer data is copied into a test environment, and keeping a record. Detection means noticing possible unauthorised access, cutting off access and making fixes. Dates rely on Rakuten Securities' disclosure and its account to the press (as reported).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check scope and deletion date against the approved plan before copying production data</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Possible leak of data from the test environment<br>Names, withdrawal accounts and more for up to c. 4.47m accounts; login IDs and more for up to c. 11.25m</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Possible unauthorised access detected, cut off and fixed</div>
<div class="rx-g g1"><div class="t">11-11</div><b>Data in the test environment may have leaked</b></div>
<div class="rx-g g2"><div class="t">11-16</div><b>Rakuten Securities detects possible unauthorised access and cuts it off</b></div>
<div class="rx-g g3"><div class="t">11-17</div><b>Rakuten Securities discloses</b></div>
<div class="rx-g g4"><div class="t">11-18</div><b>The company tells the press why production data was used (as reported)</b></div>
</div>
</figure>

Detection worked, and Rakuten Securities noticed the possible unauthorised access and cut it off. But it noticed five days after the day the data may have leaked, and by then the test environment held unmasked production customer data (the company's account to the press). A case where customer data left in a test environment past its purpose leaked is [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/) (a test environment whose use changed). In October, Rakuten Securities was also affected when unauthorised access to a contractor's SaaS put data on buyers of digital-perk bonds in scope ([NTT DATA STdirectServices](/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/)).

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that copies production customer data into a test environment, and into the check on the approved deletion date.** It does not look for unauthorised access; it checks, before the copy, that the scope of the data and how long it stays fall within the approved test plan.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Securities firms, banks and other financial institutions holding personal data and withdrawal bank accounts for many accounts. They build test environments with every system upgrade or new feature.
- **Operation · Lookup & data access**: Copying production customer data out of production to test system upgrades or for analysis. Copied data tends to sit somewhere less protected than production.
- **Operation · Disclosure & data release**: Handing customer data to environments outside production, contractors or other systems. The person who decides the scope and time limit is not the person who does the handover.

### Current controls vs Lemma

The route in this case is column 1 (copying production customer data into the test environment) and column 2 (data being taken out of the test environment). Column 3 covers contacts that impersonate Rakuten Securities using leaked data, which the company has warned users about; no fraudulent trading arising from the incident has been confirmed.

| Control | Copying production customer data into the test environment | Data taken out of the test environment | Contacts impersonating Rakuten Securities using leaked data |
| --- | --- | --- | --- |
| Masking test data | Partial | Partial | Partial |
| Restricting test environment entry points and fixing vulnerabilities | Not relevant | Partial | Not relevant |
| Passkey login | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Not effective |

Masking reduces what can be read if copied data leaks, but needs a step that decides which fields to mask and applies it to every copy. Restricting entry points and fixing vulnerabilities reduces the chances of an outside intrusion, but does not change how much data is copied or for how long. Passkeys resist schemes that get users to enter passwords on fake sites, but do not stop calls or post that try to draw out personal details. Lemma does not guard entry points; it checks, before the copy, whether the scope and time limit of the copied data rest on an approval.

Note: Lemma's check works only when it is built into the step that copies data from production into a test environment, and approvals of test plans are managed apart from the staff who perform the copy. If the approved plan itself says to copy a wide scope unmasked, the check passes. If data is moved without going through the copy step (by another route), this check is bypassed. It does not stop a third party who has entered the test environment from taking data out. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and does not recover data already taken.

### Checklist

Three things to confirm about production customer data placed in development and test environments

- Do you keep a list of the test and staging environments that hold production customer data?
- Can you confirm from records that production data was deleted on the set date once a test ended?
- If a leak is suspected, can you identify the affected accounts and fields from the records made at the time of copying?

## 5. Facts and timeline

- **Parties**: Rakuten Securities, Inc. (an online brokerage).
- **What happened**: According to Rakuten Securities, on 16 November it detected possible unauthorised access by a third party to part of its systems, cut off access to the affected part and made fixes. Its investigation found that on 11 November part of the data held in a system in its test environment may have leaked outside. The cause and details of the unauthorised access are under investigation.
- **Why it was in the test environment**: Rakuten Securities told the press that an upgrade of internal systems required checking some functions with production data. It had copied part of the production customer data onto a test server for a period to run the tests, and according to ITmedia NEWS the data was not masked. The copy was not one staff member's decision but went through formal internal procedures, it said. Normally, it said, test environments hold only dummy data (ITmedia NEWS, J-CAST News). It declined to say when the data was copied or how long the work lasted.
- **Data**: According to Rakuten Securities, the scope covers the following data for customers, including closed accounts. (1) Branch and customer code, login ID, name, name in kana, date of birth, address, phone number, email address, employer, withdrawal bank account (institution, account number, holder), income and financial assets (as declared by the customer), holdings by product, last login date: up to about 4.47 million accounts. (2) Branch and customer code and login ID: up to about 11.25 million accounts. The login ID is not the Rakuten ID. According to J-CAST News, the company told it the two groups of accounts do not overlap (up to about 15.72 million accounts in total, as reported).
- **Impact**: Rakuten Securities says no leak of information needed for trading, including the passwords and PINs needed to log in, has been confirmed. As of 17 November, no unauthorised access or fraudulent trading thought to arise from the incident had been confirmed. The disclosure speaks of a "possible" leak, but according to J-CAST News the company said on 18 November that it had confirmed that information including personal data had in fact leaked outside.
- **How it was found**: Rakuten Securities detected possible unauthorised access on 16 November. How it noticed has not been disclosed.

### Timeline

- **2026-11-11**: Part of the data held in a system in Rakuten Securities' test environment may have leaked outside (Rakuten Securities).
- **2026-11-16**: Rakuten Securities detects possible unauthorised access by a third party to part of its systems, cuts off access and makes fixes.
- **2026-11-17**: Rakuten Securities discloses the possible data leak.
- **2026-11-18**: Rakuten Securities tells the press it had copied production customer data into the test environment to test an upgrade (as reported).

> The facts rely on Rakuten Securities' disclosure of 17 November (primary) and the company's answers to the press (ITmedia NEWS, J-CAST News). The reason production customer data was in the test environment, the masking, the procedures and the vulnerability come from answers to the press and are not in the company's disclosure. No disclosure on this incident by the Financial Services Agency or the Personal Information Protection Commission had been found as of 20 November, nor any follow-up notice from Rakuten Securities. The intrusion route, when and for how long production customer data was copied into the test environment, and the scope the test needed have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the company's response. Written as of 20 November.

### After disclosure

- **Rakuten Securities**: Says it has finished identifying affected customers and will notify them individually. According to ITmedia NEWS, it asks customers to check the "Notices" screen after logging in, and is notifying closed-account holders by some means. With the cooperation of relevant parties, it says it will investigate the cause and the extent of the impact, prevent recurrence and strengthen security.
- **Guidance to users**: The company says its emails contain no URLs and it never asks for personal or login details by phone. It asks users to watch for suspicious emails, SMS, calls and post impersonating Rakuten Securities or affiliated companies, and not to open URLs or enter or give personal details. It says it is making passkey (FIDO2) login mandatory, that more than 90% of customers who log in daily already use it, and asks those who have not set it up to do so. It also notes that customers can themselves temporarily suspend trading and withdrawals. The disclosure does not ask users to change their passwords.

## 6. Sources

- **Rakuten Securities (Primary, company disclosure)**: 「当社お客様の情報漏えいの可能性に関するお詫びとお知らせ」 (2026-11-17) — <https://www.rakuten-sec.co.jp/web/info/info20261117-02.html>
- **ITmedia NEWS (Press, interview with the company)**: 「楽天証券の大規模漏えい、なぜテスト環境に顧客情報が？ 「本番データでの確認が必要だった」」 (2026-11-18) — <https://www.itmedia.co.jp/news/article/2611/18/2000003302/>
- **J-CAST News (Press, interview with the company)**: 「楽天証券の情報漏えい、なぜテスト環境に顧客情報？ 「普段は保管せず」も...会社が明かした経緯」 (2026-11-18) — <https://www.j-cast.com/2026/11/18519264.html?p=all>
- **Impress Watch (Press)**: 「楽天証券に不正アクセス 最大1125万口座の情報漏えい可能性」 (2026-11-17) — <https://www.watch.impress.co.jp/docs/news/2157207.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
