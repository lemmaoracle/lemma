---
brief_no: 110
title: "ソースネクスト：会員情報取得 API が悪用され、最大 2,252 万件の会員情報が取得された可能性がある(ソースネクスト発表)"
title_en: "Sourcenext: A member-information API was abused, and up to 22.52 million member records may have been taken (Sourcenext announcement)"
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
og_lead_ja: "ソースネクスト、会員情報 API が悪用され、最大 2,252 万件が流出した可能性"
og_lead_en: "Sourcenext: member-information API abused; up to 22.52M records may have leaked"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 会員情報の流出"
og_kicker_en: "CYBERATTACK · DATA BREACH"
og_headline_ja: "会員情報を返す API で、\n登録情報が取られた。\n<accent>最大 2,252 万件が流出の可能性</accent>"
og_headline_en: "Registered data was pulled through a member-information API.\n<accent>Up to 22.52M records may have leaked.</accent>"
key_figures:
  - value: "Up to 22.52"
    unit: "million"
    label: "Member records that may have leaked (not a confirmed count)"
    tone: "alert"
  - value: "10-09 → 10-13"
    label: "About four days from the start of retrieval (about 10:00) to confirmation (about 09:00)"
  - value: "09:00 → 13:36"
    label: "13 October, from confirmation to containment"
glossary:
  - term: "API"
    desc: "An interface through which systems exchange data. A member-information API returns a member's registered data when called."
  - term: "Containment"
    desc: "Cutting off unauthorised access so the damage spreads no further."
  - term: "Credential stuffing"
    desc: "Trying leaked email-and-password pairs on other services' logins."
insight:
  slug: "retrieval-unchecked-per-call"
  label: "Retrieval not checked per call"
  quote: "Unless the range of a call is checked before the API returns data, a retrieval outside that range passes as the same function."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Stop retrievals beyond the permitted party, purpose and volume before they run"
  - slug: "audit-trail"
    item: "Record whose data was retrieved, separately from the caller"
impact: "Up to 22.52 million member records may have leaked"
takeaway: "Nothing checked, before the API returned data, whether a member-information call stayed within the permitted party, purpose and volume."
self_check: "If your API started returning member data in bulk, could you stop it before it was sent?"
countries: ["jp"]
---

## 1. Summary

As far as the disclosures show, what was used was the API's lawful function of returning member information. How authentication was passed and which vulnerability was used have not been disclosed, and about four days passed between the start of retrieval and confirmation. Once confirmed, the response was quick, and the company contained the access the same day. <strong>An API that returns member data, unless it checks the range of a call before returning, lets a retrieval outside that range pass as the same function.</strong>

## 2. What got through

- **What got through**: Retrieval of registered data through a call to the member-information API, beginning around 10:00 JST on 9 October 2026 (per Sourcenext).
- **What stopped it**: The company confirmed the unauthorised access at about 09:00 on 13 October and finished containing it by 13:36 that day, including blocking unauthorised external traffic. That was about four days after retrieval began.
- **What reached the receiving side**: In general, once a key or token passes, an API call arrives as a call that returns data as the function is built to. Whether the call is within the permitted party, purpose and volume cannot be told from the call itself.
- **Not disclosed**: How authentication was passed, which vulnerability was used, how passwords were stored (hashed or not), and whether the data has been misused. An outside forensic investigation is under way, so the actual count may change. The official notice says "member-information API" while the FAQ says "unauthorised access to servers"; the wording does not match.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever returns member data checks, before returning it and apart from the caller, that the API call is within the permitted party, purpose and volume.

- **Who approves**: The organisation that manages the member data. For each API that returns member data, it decides at grant who may pull which members and for what, and records it. It does not rely on the caller's own declaration.
- **Where it is checked**: Just before the API returns data. Caps are set on how many records one call and a period may return and on which members may be targeted, and a retrieval beyond the permitted range is held until it is checked.
- **What is recorded**: Which permission each call relied on and whose data was returned, kept apart from the caller's actions in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the API returns member data, that the call is within the permission, and keeping a record. Detection means noticing after the retrieval has happened. The dates below are when Sourcenext confirmed or disclosed a point, not when the retrieval took place (it began around 10:00 on 9 October).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before returning, check the call is within permission</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Up to 22,519,960 records<br>may have leaked (not a confirmed count)</span></div>
<div class="rx-zone det"><b>Detection · noticed about four days later</b>Confirm the access and contain it the same day</div>
<div class="rx-g g1"><div class="t">10-09</div><b>Retrieval through the API begins</b></div>
<div class="rx-g g2"><div class="t">10-13 09:00</div><b>Unauthorised access confirmed</b></div>
<div class="rx-g g3"><div class="t">10-13 13:36</div><b>Containment completed</b></div>
<div class="rx-g g4"><div class="t">10-15</div><b>Announced; password resets required</b></div>
</div>
</figure>

Detection worked, but it noticed about four days after retrieval began. Similar cases, where the retrieval route exists as a function and no independent check sat directly before execution, are [Denmark CPR](/critical/briefs/152-denmark-cpr-lawful-access-misuse/) and [McHire/Paradox.ai](/critical/briefs/056-mchire-paradox-recruiting-auth/).

## 4. What Lemma does

**Lemma builds the check in section 03 in front of the API that returns member data.** It does not look for intrusions; it checks, before returning, whether the call is within the permitted party, purpose and volume.

### Industries and operations to watch

- **Industry · Services & retail**: software and online-shop services that manage large numbers of members by email and password. The more members, the larger the impact of a leak.
- **Operation · Lookup & data access**: work that pulls member data through APIs or admin screens. If getting through is all that decides how many records a call can take, large retrievals pass as normal use of the function.

### Current controls vs Lemma

The route in this case is column 1 (calls to the member-information API). Column 2 is logging in with stolen passwords, which happens after the retrieval.

| Control | Calls to the member-information API | Logging in with stolen passwords |
| --- | --- | --- |
| API authentication (caller keys and tokens) | Partial | Not relevant |
| Detecting and blocking the intrusion | Partial | Not relevant |
| Invalidating and resetting passwords | Not relevant | Partial |
| Fixing the vulnerability | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not relevant |

API authentication narrows who can call, but how authentication was passed here is undisclosed, and it does not look at how many records a successful call takes. Detecting and blocking contained the access the same day it was confirmed, but confirmation came about four days after retrieval began, and what was taken in between is not recovered. Invalidating and resetting passwords blocks logins with the stolen passwords, not on other services where the same password was reused, and it does not protect the moment of taking. Fixing the vulnerability blocks re-entry through this hole, not how many records a call arriving by another route takes. Lemma checks the call against the permission before returning.

Note: Lemma's check works only when it is built in front of the API that returns member data and the permissions for who may call, for what and how much are managed apart from the caller. It passes when a legitimate party misuses its access within range, or when data is taken a little at a time under the cap. Caps can also stop or delay legitimate bulk processing. The method and vulnerability used here are undisclosed; this Brief will be revised if a later report discloses them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three questions about APIs that return member data

- Can you list the APIs that return member data? For each, is it settled who calls it and for what?
- Is there a cap on how many records one call, and one day of calls, can return? When it is exceeded, who is told, and can retrieval be stopped?
- Can you state which members' data was taken without relying on the caller's own records?

## 5. Facts and timeline

- **System**: the system that manages member information, covering Sourcenext service members registered as of 13:36 on 13 October.
- **Nature of access**: a third party retrieved registered data through a member-information API (official notice). The FAQ instead says "unauthorised access to servers the company manages" and does not mention an API. How authentication was passed and which vulnerability was used are not disclosed.
- **Scale**: up to 22,519,960 records, a possible leak, not a confirmed count. Not every field exists for every member.
- **Possible fields**: email address, password, name (including kana), address, gender, phone and fax numbers, date of birth, company name, job title, department, and system data such as subscribed services, registration date and last login.
- **Not included**: credit card data (not held in the system).

### Timeline

- **2026-10-09**: from about 10:00, unauthorised access began (as established later).
- **2026-10-13**: at about 09:00, Sourcenext confirmed the access; contained by 13:36.
- **2026-10-15**: announced; reported to the Personal Information Protection Commission; password resets required at login.
- **2026-10-16**: police consulted (per the FAQ).

> Facts here rest on Sourcenext's official notice and FAQ. "Four days" is the difference between start (about 10:00 on 9 October) and confirmation (about 09:00 on 13 October); what triggered confirmation is not disclosed. An outside forensic investigation is under way, so the method, the vulnerability and the actual count may change. What has not been disclosed does not mean there were no controls. The company also disclosed a 2023 breach in which unauthorised access through a vulnerability in part of its site's system led to tampering with a payment application, and personal data of about 120,000 people (including 112,132 credit-card records) may have leaked (official notice of 14 February 2023).

### After disclosure

- **Password invalidation**: passwords within the leak's scope are being invalidated in turn, with resets required at login (FAQ).
- **Fix**: the vulnerability in the affected system was fixed; other vulnerabilities are being checked.
- **Notification**: email to registered addresses and a dedicated contact line.
- **Guidance**: change reused passwords elsewhere and watch for spoofed email, SMS and calls.

## 6. Sources

- **Sourcenext (primary, company notice)**: "Apology and notice on customer information leak from unauthorised access to our site" (2026-10-15) — <https://www.sourcenext.com/support/i/2026/1015_info/>
- **Sourcenext (primary, company FAQ)**: "Frequently asked questions on the information leak" — no date on the page; it describes the 16 October police consultation as done. <https://www.sourcenext.com/support/i/2026/1015_1/>
- **Sourcenext (primary, company notice, earlier incident)**: "Apology and notice on the 2023 personal-information leak" (2023-02-14) — <https://www.sourcenext.com/support/i/2023/0214_info/>

Only the parties' own official notices serve as primary here; no independent third-party verification or English-language outside reporting has been found. The method and vulnerability are undisclosed, and the notice ("member-information API") and the FAQ ("unauthorised access to servers") word the access differently. Japanese media and blogs are not used as sources.

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)