---
brief_no: 142
title: "阿波銀行：役目を終えたテスト環境が AI 活用の作業などに使われ続け、残っていた顧客・株主情報のべ 2 万 7,745 件が外部からの不正アクセスで漏えいした(同行発表)"
title_en: "Awa Bank: a test environment kept in use after its purpose ended, and 27,745 customer and shareholder records left in it leaked through outside access (bank disclosure)"
pillar: 01-verifiable-origin
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-03-24
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["077-idmerit-kyc-data-exposure", "086-sumsub-support-environment-breach", "006-google-api-key-revocation-lag"]
status: published
version: "2.1"
og_lead_ja: "阿波銀行、役目を終えたテスト環境への不正アクセスで顧客・株主情報 2.7 万件が漏えい"
og_lead_en: "Awa Bank: breach of a test environment past its purpose leaks 27,745 records"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORIZED ACCESS"
og_headline_ja: "役目を終えた\nテスト環境に残った\n顧客データが漏れた。\n<accent>のべ 2 万 7,745 件</accent>"
og_headline_en: "Customer data left in a test environment past its purpose leaked.\n<accent>27,745 records.</accent>"
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
  quote: "When an environment's use changes but it keeps its name \"test environment\", the data left in it and the way in from outside go unreviewed."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Don't let an environment whose use has changed be used until its data and access are re-checked"
  - slug: "minimize-data"
    item: "Inventory customer and shareholder data left in retired environments, and delete what is no longer used"
  - slug: "audit-trail"
    item: "Record which customer data is in which environment, and when it was deleted"
attack_method: "account-takeover"
impact: "27,745 customer and shareholder records leaked"
takeaway: "When an environment past its purpose stayed in use for other work, nothing re-checked the customer data left in it or the way in from outside at the point its use changed."
self_check: "Can you say for certain that no customer data remains in environments built for development or testing?"
countries: ["jp"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

## 1. Summary

According to Awa Bank, the test environment had not been retired after its development and testing purpose ended, and it stayed in use for work such as upgrading systems with AI. Customer data that should have been deleted was still there. It was separated from the systems that handle transactions, but anyone with the ID and password could get in from outside. <strong>When an environment's use changes but it keeps the name "test environment", the data left in it and the way in from outside go unreviewed and stay in use.</strong>

## 2. What got through

- **What got through**: Access from outside to the test environment using an ID, password and the like. Someone misused them to get in (per the bank's follow-up).
- **What was kept apart**: The environment was separated from the systems handling customer transactions (per the bank).
- **What reached the receiving side**: In general, getting in from outside with an ID and password arrives as legitimate use. Whether the party who got in is still someone who should be in that environment cannot be told from the login itself.
- **Not disclosed**: When the intrusion happened, and how the ID and password were obtained. The bank is investigating with the police.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, when an environment's use changes, whoever runs it decides afresh, apart from the previous use, which data may be in it and who may get in from outside, and checks what is left against that before it goes on being used.

- **Who approves**: The environment's owner (the side that manages the data). For each environment, the owner registers what it is for, which data may be in it, and who may get in from outside. When the use changes, a fresh approval for the new use is needed.
- **Where it is checked**: Just before the environment keeps being used, or starts to be used for new work. Check whether the data left in it falls within the registration and whether those who can get in from outside are the registered people. If not, don't allow use until the check is done.
- **What is recorded**: Each environment's purpose, the data placed in it, when it was deleted and who can get in from outside, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an environment goes on being used, the data left in it and who can get in from outside against the registered use, and keeping a record. Detection means noticing after the leak. The dates below are when the outside security firm and Awa Bank made contact, confirmed or disclosed a point, not when the intrusion happened.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>When the use changes, check the data left in it and the way in from outside</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>27,745 records leaked<br>5,271 include the account for dividend payments</span></div>
<div class="rx-zone det"><b>Detection · an outside party noticed</b>Learn of the leak from an outside firm and cut off access</div>
<div class="rx-g g1"><div class="t">03-24</div><b>Outside firm makes contact</b></div>
<div class="rx-g g2"><div class="t">03-25</div><b>Bank confirms the data is its own and cuts off access</b></div>
<div class="rx-g g3"><div class="t">04-03</div><b>First notice</b></div>
<div class="rx-g g4"><div class="t">06-03</div><b>Follow-up</b></div>
</div>
</figure>

Detection worked, but it was not the bank but an outside security firm that noticed, and only after the leak. A similar case, where user data was left in an environment outside the core of identity verification, is [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before an environment goes on being used, or starts being used for new work.** It does not look for intrusions; it checks, before use, whether the data left in the environment and who can get in from outside match the registered use.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Banks and other financial institutions holding large amounts of customer information. They increasingly build trial environments to improve efficiency and use AI.
- **Operation · Lookup & data access**: Copying customer data out of production for development, testing or analysis. Copied data tends to sit somewhere less protected than production.

### Current controls vs Lemma

The route in this case is column 1 (continued use of an environment whose use changed) and column 2 (getting in from outside with an ID and password). Column 3 is data left after development ends, one of the failings the bank admitted.

| Control | Continued use of an environment whose use changed | Getting in from outside with an ID and password | Data left after development ends |
| --- | --- | --- | --- |
| ID and password login | Not relevant | Not effective | Not relevant |
| Separation from transaction systems | Not relevant | Not relevant | Partial |
| Deleting data after development ends | Not relevant | Not relevant | Not effective |
| Intrusion monitoring | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial | Partial |

ID and password login did not hold, because someone misused them to get in. Separation from transaction systems protected transactions, but copied customer data stayed in the test environment. Deleting data after development ends did not happen; data that should have been deleted was not (per the bank). Intrusion monitoring noticed late, since it was an outside security firm that noticed, after the leak. Lemma checks, when the use changes, the data left in the environment and who can get in from outside against the registered use.

Note: Lemma's check works only when the owner registers each environment's purpose, permitted data and who can get in from outside, and the check is built into the approval for changing its use. If an ID and password used for the decided use are stolen, the data within that scope can still be read. If the registration is itself out of date or wrong, wrong use still goes through. Holding use until the check is done also slows fast-moving work such as AI trials. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about development, test and trial environments

- Can you list the development and test environments that hold production customer data?
- Who confirms that environments whose purpose has ended have actually been retired?
- Who can get into them from outside, and what besides an ID and password is checked?

## 5. Facts and timeline

- **Who**: Awa Bank, based in Tokushima, Japan.
- **Environment breached**: A test environment set up to develop and test the OA system, the bank's internal information-sharing system. It was separated from the systems handling customer transactions.
- **Leak**: 27,745 records in total. 10,872 corporate internet-banking clients as of October 2024 (name or company name, registered email). 11,122 shareholders as of March 31, 2021 (name or company name, address, shareholder number, shares held; 5,271 include the account for dividend payments). 5,751 other customers and contacts (mainly names or company names as of April 2021; 127 include addresses and deposit or loan transaction details). No PINs or passwords.
- **Cause**: Someone misused an ID, password and the like to get into the test environment from outside. How the credentials were obtained, and when the intrusion happened, have not been disclosed.
- **Failings the bank admitted**: (1) The environment should have been retired when its purpose ended but stayed in use for work such as upgrading systems with AI. (2) Customer data should have been deleted promptly after development ended but was not. (3) Protection against unauthorised access did not work well enough.
- **Discovery**: An alert from an outside security firm.
- **Secondary harm**: None confirmed as of June 3.

### Timeline

- **2026-03-24**: An outside security firm tells the bank its information may have leaked.
- **2026-03-25**: That night, the bank confirms the leaked data is its own and cuts off access to the environment.
- **2026-04-03**: First notice: 27,745 records leaked. The bank says it has reported to supervisors and consulted the police.
- **2026-06-03**: Follow-up: the direct cause, three failings in its controls, measures against recurrence and disciplinary action against executives.

> Facts rest on Awa Bank's first notice and follow-up (primary). When the intrusion happened and how the credentials were obtained have not been disclosed. The bank says it is still investigating with the police; as of October 2026 there has been no third notice. What has not been disclosed does not mean there were no controls.


### After disclosure

- **Awa Bank**: Will retire the test environment once the police investigation ends, and review all of its information systems.
- **Discipline**: The president and senior managing director voluntarily returned 30% of one month's pay, a managing director's pay was cut by the same, and staff involved were disciplined under internal rules.


## 6. Sources

- **Awa Bank (Primary, company disclosure, first notice)**: "Leak of customer information due to unauthorised access" (2026-04-03, Japanese) — <https://www.awabank.co.jp/kojin/news/2026/news20260403a/>
- **Awa Bank (Primary, company disclosure, follow-up)**: "Leak of customer information due to unauthorised access (follow-up)" (2026-06-03, Japanese) — <https://www.awabank.co.jp/kojin/news/2026/news20260603a/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
