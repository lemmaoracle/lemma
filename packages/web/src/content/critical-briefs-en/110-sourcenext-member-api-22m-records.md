---
brief_no: 110
title: "ソースネクスト：会員情報取得 API が悪用され、最大 2,252 万件の会員情報が取得された可能性がある(ソースネクスト発表) — 取得の量と用途を、呼び出しのたびに確かめる層が無い"
title_en: "Sourcenext: A member-information API was abused, and up to 22.52 million member records may have been taken (Sourcenext announcement) — No layer checks the volume and purpose of each call as it runs"
pillar: 04-regulatory-attribute
primary_category: identity-auth
secondary_categories: [kyc-aml-disclosure]
incident_date: 2026-10-09
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["152-denmark-cpr-lawful-access-misuse", "056-mchire-paradox-recruiting-auth", "142-awa-bank-test-environment-repurposed-leak"]
status: published
version: "1.0"
og_lead_ja: "ソースネクスト 最大2,252万件：会員情報 API の取得の量と用途を確かめる層が無かった"
og_lead_en: "Sourcenext, up to 22.52 million records: no check on the volume and purpose of member-information API calls"
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Stop retrievals beyond the permitted party, purpose and volume before they run"
  - slug: "audit-trail"
    item: "Record whose data was retrieved, separately from the caller"
impact: "Up to 22.52 million member records may have leaked"
---

## 1. TL;DR

From around 10:00 JST on 9 October 2026, a third party accessed Sourcenext's member-information system and retrieved registered data through a member-information API. On 15 October the company said up to 22,519,960 member records may have leaked. Possible fields include email address, password, name, address, phone number and date of birth. Credit card data was not held in the affected system.

About four days passed between the start of retrieval and confirmation. Once the access was confirmed, the response was quick. The company confirmed it around 09:00 on 13 October and completed containment by 13:36 that day. <strong>What did not work was a layer that checks, per call, whether a member-information API call stays within the right party, purpose and volume.</strong>

## 2. What happened

- **System**: the system that manages member information, covering Sourcenext service members registered as of 13:36 on 13 October.
- **Nature of access**: a third party retrieved registered data through a member-information API (official notice). The FAQ instead says "unauthorised access to servers the company manages" and does not mention an API. How authentication was passed and which vulnerability was used are not disclosed.
- **Scale**: up to 22,519,960 records, a possible leak, not a confirmed count. Not every field exists for every member.
- **Possible fields**: email address, password, name (including kana), address, gender, phone and fax numbers, date of birth, company name, job title, department, and system data such as subscribed services, registration date and last login.
- **Not included**: credit card data (not held in the system).
- **Not confirmed**: any misuse. How passwords were stored (hashed or not) is not disclosed.

The chain was as follows.

1. As far as the disclosures show, an API that returns member information was usable by a third party (how it was reached is undisclosed).
2. From around 10:00 on 9 October, a third party used it to retrieve registered data.
3. Around 09:00 on 13 October the company confirmed the access and by 13:36 had completed containment, including blocking unauthorised external traffic.

The irreversible action was step 2, the retrieval. It rested on an API designed to return member data, and no published account shows that, at each call, anyone checked who was calling, for what, and at what volume.

## 3. Timeline — disclosure and response

- **9 October 2026, about 10:00**: unauthorised access began (as established later).
- **13 October, about 09:00**: Sourcenext confirmed the access; contained by 13:36.
- **15 October**: announced; reported to the Personal Information Protection Commission; password resets required at login.
- **16 October**: police consulted (per the FAQ).

> Facts here rest on Sourcenext's official notice and FAQ. "Four days" is the difference between start (about 10:00 on 9 October) and confirmation (about 09:00 on 13 October); what triggered confirmation is not disclosed. An outside forensic investigation is under way, so the method, the vulnerability and the actual count may change. The company also disclosed a 2023 breach in which unauthorised access through a vulnerability in part of its site's system led to tampering with a payment application, and personal data of about 120,000 people (including 112,132 credit-card records) may have leaked (official notice of 14 February 2023).

Response:

- **Password invalidation**: passwords within the leak's scope are being invalidated in turn, with resets required at login (FAQ).
- **Fix**: the vulnerability in the affected system was fixed; other vulnerabilities are being checked.
- **Notification**: email to registered addresses and a dedicated contact line.
- **Guidance**: change reused passwords elsewhere and watch for spoofed email, SMS and calls.

## 4. Why it wasn't stopped

The failure is not only that a third party reached the member-information API. As far as the disclosures show, a lawful function, returning member information, was used for about four days with no check of who was calling, for what, and at what volume.

That is the **gap between detection and proof**. Once confirmed, the response was quick: the company contained the access the same day. But confirmation came about four days after retrieval began. What failed sits before that. That an API can return member data and that this call is permitted are different facts, and in what has been published nothing checks the latter directly before the call. A store of more than 20 million records stayed retrievable for about four days.

The response, blocking, fixing, invalidating passwords and investigating, is necessary but works after retrieval. Invalidating passwords lowers the value of what was taken; it does not protect the moment of taking.

The same structure appears in earlier Briefs. In [Denmark CPR](/critical/briefs/152-denmark-cpr-lawful-access-misuse/), lawful access pulled about 8.8 million people's data with no check of volume or purpose. In [McHire/Paradox.ai](/critical/briefs/056-mchire-paradox-recruiting-auth/), a recruiting AI's API exposed 64 million records. In each, the retrieval route exists as a function, so no independent check sat directly before execution.

> "The API can return member data" and "this call is permitted" are different facts. The first is fixed at design; the second must be checked on every call.

## 5. What proof would have changed

A single step could sit directly before each API call: confirming that it lies within the permitted party, purpose and volume. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Per-call proof of permission**: register, at grant, who may call the API, for what purpose and over which range of members, as issuer-signed proof, and check each call against it before it runs.
- **Binding to volume and target**: make retrieval beyond the permitted range (count, out-of-scope members) blockable before it executes.
- **Independent record**: keep which permission a call relied on, and whose data was pulled, as a record separate from the caller's actions, so it can be audited later.

</ul>

This differs from after-the-fact detection and blocking. The detection layer and this layer are complementary, not substitutes: the former notices unauthorised access, the latter lets a call that could exceed permission be checked before it runs.

Note: the proof shows only that a call lies within the registered permission. It passes when a legitimate party misuses its access within range, or when the registered range itself is wrong. What happens to data after it is taken is outside the proof.

## 6. Sources

- **Sourcenext (primary, company notice)**: Apology and notice on customer information leak from unauthorised access to our site (2026-10-15) — <https://www.sourcenext.com/support/i/2026/1015_info/>
- **Sourcenext (primary, company FAQ)**: Frequently asked questions on the information leak (no date on the page; it describes the 16 October police consultation as done) — <https://www.sourcenext.com/support/i/2026/1015_1/>
- **Sourcenext (primary, company notice, earlier incident)**: Apology and notice on the 2023 personal-information leak (2023-02-14) — <https://www.sourcenext.com/support/i/2023/0214_info/>

Only the parties' own official notices serve as primary here; no independent third-party verification or English-language outside reporting has been found. The method and vulnerability are undisclosed, and the notice ("member-information API") and the FAQ ("unauthorised access to servers") word the access differently. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/). The pillar view is [regulatory attribute proof](/pillars/#attribute).
