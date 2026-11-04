---
brief_no: 6
title: "Google の API キー：削除の後も、しばらく認証に通ったと報告された(Aikido)"
title_en: "Google API keys: Deleted keys kept authenticating for a while, a security firm reported (Aikido)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-21
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost", "005-noroboto-lying-fonts", "019-construction-engineer-qualification-fraud", "020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "Google の API キーが、削除の後も最長約 23 分、認証に通ったと Aikido が報告した"
og_lead_en: "Aikido reported that Google API keys kept authenticating for up to about 23 minutes after deletion"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "研究者の計測 · API キー"
og_kicker_en: "RESEARCH · API KEYS"
og_headline_ja: "削除した API キーが、\n23 分ほど通ったと報告。\n<accent>Google の API キー</accent>"
og_headline_en: "Deleted Google API keys\nworked up to 23 minutes,\n<accent>Aikido reports.</accent>"
key_figures:
  - value: "23"
    unit: "min"
    label: "Longest time after deletion until the last successful authentication (Aikido's 10 runs)"
    tone: "alert"
  - value: "16"
    unit: "min"
    label: "Median in the same runs. The shortest was about 8 minutes (Aikido's measurements)"
  - value: "~5"
    unit: "sec"
    label: "Time for deletion to take effect on Google service account keys. New-format Gemini API keys took about 1 minute (Aikido's measurements)"
glossary:
  - term: "API key"
    desc: "A string that identifies the caller of a service's API. Whoever holds it can use the API just like the owner."
  - term: "Key deletion (revocation)"
    desc: "Making a key unusable, for example in a management console. Calls with a deleted key should be refused by the receiving side."
  - term: "Eventual consistency"
    desc: "A change spreads across many servers bit by bit and they agree only after a while. Until then, different servers can give different answers."
insight:
  slug: "revocation-not-yet-propagated"
  label: "Between deletion and arrival"
  quote: "A deleted key still gets calls through until the deletion has reached every server that receives it."
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "limit-and-revoke"
    item: "Confirm before each use that a deleted API key is revoked"
takeaway: "After the deletion was done, the key kept working until the deletion reached the receiving servers (Aikido's measurements)."
self_check: "After deleting a leaked key, do you confirm for yourself that the key no longer gets through?"
countries: ["global"]
---

## 1. Summary

This is a security firm's measurement, and the results rest on Aikido's report. Deleting a key in the console sends that change out to Google's many servers in stages, and servers it had not yet reached still accepted the deleted key. Depending on the key type, keys kept working for anything from a few seconds to over 20 minutes. <strong>A deleted key still gets calls through until the deletion has reached every server that receives it.</strong>

## 2. What got through

- **What got through**: API calls made with a Google API key that had been deleted in the console. In Aikido's tests, they still authenticated after deletion.
- **What ended quickly**: In Aikido's measurements, Google service account keys stopped working in about 5 seconds, and new-format Gemini API keys in about 1 minute.
- **What reaches the receiving side**: In general, a server the deletion has not yet reached receives a deleted key in the same form as a valid one. Aikido attributes the lag to the deletion spreading in stages (eventual consistency).
- **Not disclosed**: Whether any leaked key was actually used during the window after deletion; the date Aikido reported to Google; any explanation from Google of how the lag works.

## 3. Pre-execution check

The condition that tells the cases apart, whatever the route, is that the side receiving a key checks, before letting a call through, whether the key is now revoked against the record kept by the side that recorded the deletion.

- **Who issues the approval**: The key's owner (the developer who deleted it) and the side that issued the key. Whether a key is revoked is decided by the record of the deletion, not by the state each receiving server holds.
- **Where to check**: Just before a call made with the key is accepted and carried out. A key in the deletion record is not let through, whichever server receives it.
- **What remains**: A record of which key's call was checked against the revocation record as of when, and whether it was let through or refused.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a call with the key is let through, whether the key is revoked against the record, and keeping a record. Detection means noticing a leak or the lag after deletion afterwards. Below is the general flow from a leak to a call getting through, not the steps of Aikido's tests.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from disclosures</b>Before letting a call through, check the revocation record</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A deleted key<br>worked up to about 23 minutes</span></div>
<div class="rx-zone det"><b>Detection · seen by measurement</b>Aikido's measurements showed the lag after deletion</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>A key leaks</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>The leak is noticed and the key deleted</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>The deletion spreads in stages</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>A server not yet reached lets it through</b></div>
</div>
</figure>

The measurements made the lag after deletion visible, but they do not change the lag itself. A similar case, where something that should have stopped working kept passing for a time, is [Visa's expired cards](https://lemma.frame00.com/critical/briefs/135-zombie-cards-visa-contactless-expiry/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that receives calls made with a key, just before they are carried out.** It does not look for leaks or bad calls; it checks, before letting a call through, that the key received is not one in the deletion record.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Developers and organisations that call Google Cloud APIs such as Gemini, BigQuery and Maps with API keys. Keys can leak through code, logs, screen sharing and the like.
- **Operation · Accounts & permissions**: Deleting leaked keys and how they are handled afterwards. The moment the deletion is done is easily treated as the moment the key stopped working.

### Current controls vs Lemma

This case's route is column 1 (calls with a deleted key). Column 2 is the earlier stage, where the key leaks.

| Control | Calls with a deleted key | Where the key leaks |
| --- | --- | --- |
| Deleting the key in the console | Partial | Not relevant |
| Key types where deletion takes effect quickly (service account keys etc.) | Partial | Not relevant |
| Reviewing requests per credential | Partial | Not relevant |
| Leak detection (automated tools etc.) | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

Deleting a key stops it eventually, but in Aikido's measurements old Gemini API keys took up to about 23 minutes. Service account keys and similar stopped in seconds to about a minute, but still worked in between. Reviewing requests per credential, which Aikido recommends, lets you notice use but does not stop calls that get through. Leak detection helps notice a leak early and has nothing to do with the lag after deletion. Lemma checks the key against the revocation record before letting a call through.

Note: Lemma's check works only when the side receiving keys (the API provider, or a service that issues and accepts its own keys) builds the check in before letting calls through and manages the revocation record apart from the receiving servers. A caller of Google's APIs cannot build it into Google's servers on its own. If the revocation record itself is updated late, calls pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organisations that issue or use API keys

- Do your procedures treat deleting a leaked key as a task during which the key may still work, not as instant?
- Do you watch for requests made with the key during the time after deletion?
- In services where you issue and accept your own keys, is a deleted key refused on every server?

## 5. Facts and timeline

- **Who measured**: Joe Leon of security firm Aikido security, who published the results on Aikido's official blog as "Google API keys keep working after you delete them long enough to be exploited". This is a researcher's measurement, not a real-world loss.
- **Scope**: Google API keys in general (Gemini, BigQuery, Maps and other Google Cloud APIs).
- **Results**: Time after deletion until the last successful authentication: shortest about 8 minutes, median about 16 minutes, longest about 23 minutes (10 runs over 2 days).
- **Test conditions**: After creating and deleting a key, 3–5 calls per second were sent continuously and the time of the last successful authentication was recorded. Five more runs were made across three regions: US East, Western Europe and Southeast Asia.
- **Differences by key type**: Old Gemini API keys up to about 23 minutes, new-format Gemini API keys about 1 minute, Google service account keys about 5 seconds.
- **Impact**: For Gemini projects, uploaded files and cached conversation content are said to be extractable.
- **Billing**: In April 2026 Google revised its billing policy and introduced tiered usage limits, with a specification that raises the cap automatically from $250 USD to $100K USD under certain conditions.

### Timeline

- **2026-04**: Google revises its billing policy and introduces tiered usage limits.
- **2026-05**: Aikido publishes the technical details and test results on its official blog, including the report to Google and the response.
- **2026-05-21**: The Register reports "Threat hunters find Google API keys still usable 23 minutes after deletion".
- **2026-05-22**: GIGAZINE reports it in Japanese.

> Names and measured values rely on Aikido security's official blog (test data from Joe Leon) and The Register's reporting. Revocation behaviour differs by key type and implementation and changes over time, so check the latest information. We treat this as a researcher's measurement and do not claim the scale of real-world losses. What is not disclosed does not mean no control existed.

### After disclosure

- **Aikido security**: Published the technical details and test results on its official blog. It recommended checking request activity per credential under "Enabled APIs and services" in the Google Cloud console, and says deleting a leaked Google API key should be treated not as instant but as "a task that takes about 30 minutes". Noting that speed differs by key type, it raised the point that faster revocation is technically possible.
- **Google**: According to Aikido, Google closed the report as "will not fix", "working as intended" and "not a security issue". According to The Register, Google had not answered its request for comment at the time of writing.

## 6. Sources

- **Aikido security technical analysis**: "Google API keys keep working after you delete them long enough to be exploited" by Joe Leon (2026-05, Aikido official blog, including measurement data across 10 trials over 2 days, technical detail, and the report-to-Google history) — https://www.aikido.dev/blog/google-api-keys-deletion
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
