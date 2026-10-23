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
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 会員情報の流出"
og_kicker_en: "CYBERATTACK · DATA BREACH"
og_headline_ja: "会員情報を返す API で、\n登録情報が取られた。\n<accent>最大 2,252 万件が流出の可能性</accent>"
og_headline_en: "Registered data was pulled through a member-information API.\n<accent>Up to 22.52M records may have leaked.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "That an API can return member data and that this call is permitted are different facts."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Stop retrievals beyond the permitted party, purpose and volume before they run"
  - slug: "audit-trail"
    item: "Record whose data was retrieved, separately from the caller"
impact: "Up to 22.52 million member records may have leaked"
takeaway: "Nothing checked, on each retrieval, whether a member-information API call stayed within the permitted party, purpose and volume."
self_check: "If your API started returning member data in bulk, could you stop it before it was sent?"
countries: ["jp"]
---

## 1. TL;DR

From around 10:00 JST on 9 October 2026, a third party accessed Sourcenext's member-information system and retrieved registered data through a member-information API. On 15 October the company said up to 22,519,960 member records may have leaked. Possible fields include email address, password, name, address, phone number and date of birth. Credit card data was not held in the affected system.

As far as the disclosures show, what was used was the API's lawful function: returning member information. How authentication was passed and which vulnerability was used are not disclosed. About four days passed between the start of retrieval and confirmation.

Once the access was confirmed, the response was quick. The company confirmed it around 09:00 on 13 October and completed containment by 13:36 that day. What did not work was a layer that checks, per call, whether a member-information API call stays within the right party, purpose and volume.

## 2. What happened

- **System**: the system that manages member information, covering Sourcenext service members registered as of 13:36 on 13 October.
- **Nature of access**: a third party retrieved registered data through a member-information API (official notice). The FAQ instead says "unauthorised access to servers the company manages" and does not mention an API. How authentication was passed and which vulnerability was used are not disclosed.
- **Scale**: up to 22,519,960 records, a possible leak, not a confirmed count. Not every field exists for every member.
- **Possible fields**: email address, password, name (including kana), address, gender, phone and fax numbers, date of birth, company name, job title, department, and system data such as subscribed services, registration date and last login.
- **Not included**: credit card data (not held in the system).
- **Not confirmed**: any misuse. How passwords were stored (hashed or not) is not disclosed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The irreversible action was the retrieval at ②. No published account shows that, at each call, anyone checked who was calling, for what, and at what volume. How ① was reached is not disclosed either.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Sourcenext</div><div class="no">1</div><b>An API that returns member information was usable by a third party</b><p>As far as the disclosures show. How it was reached is undisclosed.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">2</div><b>From about 10:00 on 9 October, retrieves registered data through it</b><p>Up to 22,519,960 records may have leaked.</p></div>
<div class="rx-step good"><div class="who">Sourcenext</div><div class="no">3</div><b>Confirms the access about 09:00 on 13 October and contains it by 13:36</b><p>Including blocking unauthorised external traffic.</p></div>
<div class="rx-step"><div class="who">Sourcenext</div><div class="no">4</div><b>Announces on 15 October and requires password resets</b><p>Reported to the Personal Information Protection Commission.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-09**: from about 10:00, unauthorised access began (as established later).
- **2026-10-13**: at about 09:00, Sourcenext confirmed the access; contained by 13:36.
- **2026-10-15**: announced; reported to the Personal Information Protection Commission; password resets required at login.
- **2026-10-16**: police consulted (per the FAQ).

> Facts here rest on Sourcenext's official notice and FAQ. "Four days" is the difference between start (about 10:00 on 9 October) and confirmation (about 09:00 on 13 October); what triggered confirmation is not disclosed. An outside forensic investigation is under way, so the method, the vulnerability and the actual count may change. The company also disclosed a 2023 breach in which unauthorised access through a vulnerability in part of its site's system led to tampering with a payment application, and personal data of about 120,000 people (including 112,132 credit-card records) may have leaked (official notice of 14 February 2023).

### After disclosure

- **Password invalidation**: passwords within the leak's scope are being invalidated in turn, with resets required at login (FAQ).
- **Fix**: the vulnerability in the affected system was fixed; other vulnerabilities are being checked.
- **Notification**: email to registered addresses and a dedicated contact line.
- **Guidance**: change reused passwords elsewhere and watch for spoofed email, SMS and calls.

## 4. Why it wasn't stopped

The failure is not only that a third party reached the member-information API. As far as the disclosures show, a lawful function, returning member information, was used for about four days with no check of who was calling, for what, and at what volume.

Once confirmed, the response was quick: the company contained the access the same day. But confirmation came about four days after retrieval began. What failed sits before that. That an API can return member data and that this call is permitted are different facts, and in what has been published nothing checks the latter directly before the call. A store of more than 20 million records stayed retrievable for about four days.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof works before a call executes; detection works after the access is noticed. Here, about four days lay between them.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent here</b>Before retrieval, check the call is within permission</div>
<div class="rx-zone gapz"><b>The gap</b><span>Retrieval goes through.<br>No one has noticed yet</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>Notice the access and contain it</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>The API is called</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Registered data is returned</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Confirmed about four days later</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Contained the same day</b></div>
</div>
</figure>

The distance between noticing unauthorised access and confirming that a call is permitted is what this Brief calls the **gap between detection and proof**.

The response, blocking, fixing, invalidating passwords and investigating, is necessary but works after retrieval. Invalidating passwords lowers the value of what was taken; it does not protect the moment of taking.

The same structure appears in earlier Briefs. In [Denmark CPR](/critical/briefs/152-denmark-cpr-lawful-access-misuse/), lawful access pulled about 8.8 million people's data with no check of volume or purpose. In [McHire/Paradox.ai](/critical/briefs/056-mchire-paradox-recruiting-auth/), a recruiting AI's API exposed 64 million records. In each, the retrieval route exists as a function, so no independent check sat directly before execution.

## 5. How to counter this

**Even while the entry route is undisclosed, an organisation can decide, and check, whom an API returns data to, for what, and how much.** An API that returns member data does exactly that once a call gets through. Decide who may call it and for what, cap how much it can return per call and per period, and stop retrievals beyond that before they run. Then, whatever the route, what can be taken stops at the cap, and you can say afterwards what was taken.

### Industries and operations to watch

- **Industry · Services & retail**: software and online-shop services that manage large numbers of members by email and password. The more members, the larger the impact of a leak.
- **Operation · Lookup & data access**: work that pulls member data through APIs or admin screens. If getting through is all that decides how much a call can take, large retrievals pass as normal use of the function.

The same gap exists at most services with members. Many guard the API's entrance, but few watch, as it happens, how many records a call that got through is taking, and for what.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| API authentication (caller keys and tokens) | Partly | It narrows who can call. How authentication was passed here is undisclosed, and it does not look at how many records a successful call takes. |
| Detecting and blocking the intrusion | Partly | Containment came the same day as confirmation, but confirmation came about four days after retrieval began, and what was taken in between is not recovered. |
| Invalidating and resetting passwords | Partly | It blocks logins with the stolen passwords, not on other services where the same password was reused. |
| Fixing the vulnerability | Partly | It blocks re-entry through this hole. It does not look at how many records a call arriving by another route takes. |

### What is needed

1. **Decide, at grant, who may call and for what, and record it.** For each API that returns member data, decide who may pull which members and for what purpose, and keep that in a form each call can be checked against.
2. **Cap volume and targets, and stop retrievals beyond them before they run.** Set how many records a call, and a period, may return, and which members may be targeted. Hold calls that exceed them until they are checked.
3. **Record whose data was taken, separately from the caller.** Keep which permission each call relied on, and whose data was returned, as a record apart from the caller's actions, so you can state the scope from your own records afterwards.

### Checklist

Three questions about APIs that return member data

- Can you list the APIs that return member data? For each, is it settled who calls it and for what?
- Is there a cap on how many records one call, and one day of calls, can return? When it is exceeded, who is told, and can retrieval be stopped?
- Can you state which members' data was taken without relying on the caller's own records?

Note: this still passes when a legitimate party misuses its access within range, or when data is taken a little at a time under the cap. Caps can also stop or delay legitimate bulk processing. The method and vulnerability used here are undisclosed; this Brief will be revised if a later report discloses them.

## 6. Sources

- **Sourcenext (primary, company notice)**: "Apology and notice on customer information leak from unauthorised access to our site" (2026-10-15) — <https://www.sourcenext.com/support/i/2026/1015_info/>
- **Sourcenext (primary, company FAQ)**: "Frequently asked questions on the information leak" — no date on the page; it describes the 16 October police consultation as done. <https://www.sourcenext.com/support/i/2026/1015_1/>
- **Sourcenext (primary, company notice, earlier incident)**: "Apology and notice on the 2023 personal-information leak" (2023-02-14) — <https://www.sourcenext.com/support/i/2023/0214_info/>

Only the parties' own official notices serve as primary here; no independent third-party verification or English-language outside reporting has been found. The method and vulnerability are undisclosed, and the notice ("member-information API") and the FAQ ("unauthorised access to servers") word the access differently. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/). The pillar view is [regulatory attribute proof](/pillars/#attribute).
