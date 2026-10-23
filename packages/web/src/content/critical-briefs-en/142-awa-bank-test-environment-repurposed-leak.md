---
brief_no: 142
title: "阿波銀行：役目を終えたテスト環境が AI 活用の作業などに使われ続け、残っていた顧客・株主情報のべ 2 万 7,745 件が外部からの不正アクセスで漏えいした(同行発表) — 環境の用途が変わったときに、残っているデータと外からの入口を確かめ直す層が無い"
title_en: "Awa Bank: a test environment kept in use for AI work and other tasks after its purpose ended, and 27,745 customer and shareholder records left in it leaked through outside access (bank disclosure) — No layer re-checks the data and the way in when an environment's use changes"
pillar: 01-verifiable-origin
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-03-24
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["077-idmerit-kyc-data-exposure", "086-sumsub-support-environment-breach", "006-google-api-key-revocation-lag"]
status: published
version: "2.0"
og_lead_ja: "阿波銀行、役目を終えたテスト環境への不正アクセスで顧客・株主情報 2.7 万件が漏えい"
og_lead_en: "Awa Bank: breach of a test environment past its purpose leaks 27,745 records"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORIZED ACCESS"
og_headline_ja: "役目を終えた\nテスト環境に残った\n顧客データが漏れた。\n<accent>のべ 2 万 7,745 件</accent>"
og_headline_en: "Customer data left in a test environment past its purpose leaked.\n<accent>27,745 records.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "27,745"
    unit: "records"
    label: "Customer and shareholder records leaked; 5,271 include the bank account for dividend payments"
    tone: "alert"
  - value: "03-24 → 03-25"
    label: "From an outside security firm's alert to the bank confirming the data was its own and cutting off access"
  - value: "3"
    unit: "failings"
    label: "Admitted by the bank: the environment was not retired, data was not deleted, and protection against unauthorised access did not work well enough"
glossary:
  - term: "Test environment"
    desc: "An environment kept apart from production for developing and testing systems. Production data is sometimes copied in for testing."
  - term: "OA system"
    desc: "The bank's internal information-sharing system. The breached environment was set up to develop and test it."
insight:
  slug: "retired-env-kept-data"
  label: "Data left in an environment past its purpose"
  quote: "A test environment past its purpose stayed in use for other work, still holding customer data it should have deleted, open from outside to anyone with an ID and password."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Don't let an environment whose use has changed be used until its data and access are re-checked"
  - slug: "audit-trail"
    item: "Record which customer data is in which environment, and when it was deleted"
attack_method: "account-takeover"
impact: "27,745 customer and shareholder records leaked"
takeaway: "When an environment past its purpose stayed in use for other work, nothing re-checked the customer data left in it or the way in from outside."
self_check: "Can you say for certain that no customer data remains in environments built for development or testing?"
countries: ["jp"]
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Awa Bank's first notice and follow-up were re-read; the facts are unchanged, and as of October 2026 there has been no third notice.

## 1. TL;DR

On April 3, 2026, Awa Bank (Tokushima, Japan) disclosed that a test environment for its internal information-sharing system (the OA system) had been accessed without authorisation, leaking 27,745 customer and shareholder records. It learned of the leak on March 24 from an outside security firm. A follow-up on June 3 gave the direct cause as someone misusing an ID, password and the like to get in from outside, and admitted failings in the bank's own controls.

The environment had not been retired after its development and testing purpose ended; it stayed in use for work such as upgrading systems with AI. Customer data that should have been deleted was still there. It was separated from the systems that handle transactions, but anyone with the ID and password could get in from outside.

It was not the bank but the outside firm that noticed, and only after the leak. What failed was the layer that re-checks the customer data left in an environment, and the way in from outside, when its use changes.

## 2. What happened

- **Who**: Awa Bank, based in Tokushima, Japan.
- **Environment breached**: A test environment set up to develop and test the OA system, the bank's internal information-sharing system. It was separated from the systems handling customer transactions.
- **Leak**: 27,745 records in total. 10,872 corporate internet-banking clients as of October 2024 (name or company name, registered email). 11,122 shareholders as of March 31, 2021 (name or company name, address, shareholder number, shares held; 5,271 include the account for dividend payments). 5,751 other customers and contacts (mainly names or company names as of April 2021; 127 include addresses and deposit or loan transaction details). No PINs or passwords.
- **Cause**: Someone misused an ID, password and the like to get into the test environment from outside. How the credentials were obtained, and when the intrusion happened, have not been disclosed.
- **Failings the bank admitted**: (1) The environment should have been retired when its purpose ended but stayed in use for work such as upgrading systems with AI. (2) Customer data should have been deleted promptly after development ended but was not. (3) Protection against unauthorised access did not work well enough.
- **Discovery**: An alert from an outside security firm.
- **Secondary harm**: None confirmed as of June 3.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ②. Re-checking the customer data left in it and the way in from outside when its use changed would have been the chance to delete the data and close the door.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Awa Bank</div><div class="no">1</div><b>Builds an environment to develop and test the OA system, and puts customer data in it</b><p>Separated from transaction systems.</p></div>
<div class="rx-step crit"><div class="who">Awa Bank</div><div class="no">2</div><b>Keeps using it for AI work and more after its purpose ends</b><p>Customer data is not deleted.</p></div>
<div class="rx-step crit"><div class="who">Unknown party</div><div class="no">3</div><b>Misuses an ID and password to get in from outside</b><p>When, and how the credentials were obtained, not disclosed.</p></div>
<div class="rx-step"><div class="who">Outside security firm</div><div class="no">4</div><b>Tells Awa Bank its data may have leaked</b><p>2026-03-24.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-03-24**: An outside security firm tells the bank its information may have leaked.
- **2026-03-25**: That night, the bank confirms the leaked data is its own and cuts off access to the environment.
- **2026-04-03**: First notice: 27,745 records leaked. The bank says it has reported to supervisors and consulted the police.
- **2026-06-03**: Follow-up: the direct cause, three failings in its controls, measures against recurrence and disciplinary action against executives.

> Facts rest on Awa Bank's first notice and follow-up (primary). When the intrusion happened and how the credentials were obtained have not been disclosed. The bank says it is still investigating with the police; as of October 2026 there has been no third notice.

### After disclosure

- **Awa Bank**: Will retire the test environment once the police investigation ends, and review all of its information systems.
- **Discipline**: The president and senior managing director voluntarily returned 30% of one month's pay, a managing director's pay was cut by the same, and staff involved were disciplined under internal rules.

## 4. Why it wasn't stopped

This case was not about a sophisticated intrusion. A test environment past its purpose stayed in use for other work, still holding customer data it should have deleted, open from outside to anyone with an ID and password.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works when an environment's use changes; detection works after a leak surfaces. In between, the environment keeps the name "test environment" while holding customer data and a way in from outside.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Re-check the data and the way in when an environment's use changes</div>
<div class="rx-zone gapz"><b>The gap</b><span>Customer data stayed,<br>the door stayed open</span></div>
<div class="rx-zone det"><b>Detection layer · noticed by outsiders</b>Learn of the leak from outside and cut access</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>The environment's use changes</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Someone gets in from outside</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>An outside alert arrives</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Access cut off</b></div>
</div>
</figure>

Detection worked, but it was an outside security firm, not the bank, that noticed, and only after the leak. "It is a test environment" and "it holds no customer data and has no way in from outside" are separate facts, yet while the name stayed the same, the second was never re-checked. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/) (users' contact details left in a support environment outside the verification core).

## 5. How to counter this

**When an environment's use changes, re-check the data in it and the way in from outside.** As a rule, don't put production customer data in development or test environments; if you must, set a date to delete it. Retire environments whose purpose has ended, and if one stays in use, decide afresh, as a new use, which data may be there and who may get in.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Banks and other financial institutions holding large amounts of customer information. They increasingly build trial environments to improve efficiency and use AI.
- **Operation · Lookup & data access**: Copying customer data out of production for development, testing or analysis. Copied data tends to sit somewhere less protected than production.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| ID and password login | Ineffective | Someone got in by misusing an ID, password and the like. |
| Separation from transaction systems | Partial | Transactions were protected, but copied customer data stayed in the test environment. |
| Deleting data after development ends | Ineffective | Data that should have been deleted was not (per the bank). |
| Intrusion monitoring | Partial | An outside security firm noticed, and only after the leak. |

### What is needed

1. **For each environment, decide and record what it is for and which data may be in it.** If production customer data is used, set a date to delete it too.
2. **When the use changes, don't allow use until data and access are re-checked.** Retire environments whose purpose has ended. To use one for other work, decide its permissions and data afresh as a new use.
3. **Record what was checked.** Keep each environment's purpose, the data placed in it, when it was deleted and who can get in from outside, in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about development, test and trial environments

- Can you list the development and test environments that hold production customer data?
- Who confirms that environments whose purpose has ended have actually been retired?
- Who can get into them from outside, and what besides an ID and password is checked?

Note: even with use and data re-checked, a stolen ID and password for the decided use can still expose the data within that scope. Re-checking also slows fast-moving work such as AI trials.

## 6. Sources

- **Awa Bank (Primary, company disclosure, first notice)**: "Leak of customer information due to unauthorised access" (2026-04-03, Japanese) — <https://www.awabank.co.jp/kojin/news/2026/news20260403a/>
- **Awa Bank (Primary, company disclosure, follow-up)**: "Leak of customer information due to unauthorised access (follow-up)" (2026-06-03, Japanese) — <https://www.awabank.co.jp/kojin/news/2026/news20260603a/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
