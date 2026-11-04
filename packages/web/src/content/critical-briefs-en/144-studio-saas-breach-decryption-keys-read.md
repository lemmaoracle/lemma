---
brief_no: 144
title: "Studio：ノーコード Web 制作 SaaS のクラウド環境が侵害され、暗号化データの復号鍵も同時に読み出された(Studio 発表)"
title_en: "Studio: A no-code website-builder SaaS's cloud environment was breached, and the keys to decrypt its encrypted data were read in the same intrusion (Studio announcement)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-09-30
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["086-sumsub-support-environment-breach", "064-salesloft-drift-oauth-salesforce", "057-deepseek-clickhouse-exposed-db"]
status: published
version: "1.0"
og_lead_ja: "Studio：委託先 SaaS の侵害で、暗号化データの復号鍵も読まれ、利用企業のフォーム情報に波及した"
og_lead_en: "Studio: a SaaS breach read the decryption keys too, reaching customer companies' form data"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "暗号化したデータと、\nそれを開く鍵が、\n同じ侵入で読まれた。\n<accent>利用企業のフォーム情報に波及</accent>"
og_headline_en: "Encrypted data and the keys that open it were read in the same intrusion.\n<accent>Customers' form data was affected.</accent>"
key_figures:
  - value: "All"
    unit: "users"
    label: "Registered users whose account data may have leaked (count not disclosed)"
    tone: "alert"
  - value: "09-30 → 10-13"
    label: "From the unauthorised access to confirmation in an internal investigation: 12–13 days"
  - value: "7,663"
    unit: "records"
    label: "Form data at one customer, Link-U Group. Raksul: 6,412"
glossary:
  - term: "Decryption key"
    desc: "The key that turns encrypted data back into readable form. Whoever holds it can read data that was stored encrypted."
  - term: "API key / token"
    desc: "A string used to connect to an outside service on your behalf. Whoever holds it can connect to that service as a legitimate integration."
  - term: "Webhook URL"
    desc: "The address that receives a notification when, for example, a form is submitted. If it becomes known, fake notifications can be sent to it."
insight:
  slug: "keys-beside-data"
  label: "Keys kept beside the data"
  quote: "Encrypted data is not protected from anyone who can read it, as long as the key that opens it can be read from the same environment."
industries: ["supply-chain"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Hold reads of keys and data until they are confirmed against the permitted party and scope"
  - slug: "audit-trail"
    item: "Record what was read in a form the customer can see"
attack_method: "supply-chain"
takeaway: "Customers could not see any step that checked, before the entrusted data and the keys that open it were read, that the reader was a permitted party within a permitted scope."
self_check: "Do you keep a list of the keys and passwords you have entrusted to vendors?"
countries: ["jp"]
---

## 1. Summary

The keys needed to decrypt the data stored encrypted were read in the same unauthorised access. Studio's operator says it cannot confirm that data was retrieved but is responding as if it had been. Downstream, the form and inquiry data of companies running their sites on the service was affected, and customers, unable to check what was read, had to change passwords and replace keys across the board. **Encrypted data is not protected from anyone who can read it, as long as the key that opens it can be read from the same environment.**

## 2. What got through

- **What got through**: reads, from the cloud environment, of data and of the keys needed to decrypt encrypted data. A third party exploited a vulnerability in some functions, reached the environment and could retrieve data externally (Studio). The keys were read in the same unauthorised access.
- **What stopped it**: Studio confirmed the intrusion in an internal investigation on 13 October, fixed the vulnerability on 13–14 October and closed the entry route. The externally retrievable state ended on 14 October.
- **How it looks to the receiving side**: in general, reading keys and data from inside an environment arrives as a read by the environment's own legitimate mechanisms. If data and keys sit in the same environment, reading a key is not told apart from reading data.
- **Not disclosed**: the kind of vulnerability and the entry point (which function, which vulnerability), what was actually retrieved, secondary harm, the findings of an outside investigator, the number of affected users and records, and what triggered confirmation.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever lets data and decryption keys be read checks, before the read and apart from the authority held inside the environment, that the read is within the permitted party and scope.

- **Who approves**: The organisation that entrusted the data (the customer company). Apart from the provider's operators, it decides when entrusting who may read which data and keys and within what scope, and records it. It does not rely only on authority inside the provider's environment.
- **Where it is checked**: Just before data and keys are read. Reading a key is a separate permission from reading data, so that an environment holding ciphertext cannot read the decryption key on its own. A read beyond the permitted scope is held until it is checked.
- **What is recorded**: Which permission each read relied on and whose data was read, kept apart from the provider's own operations, visible to the customer and able to be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before data and keys are read, that the read is within a permitted party and scope, and keeping a record. Detection means noticing after the read has happened. The dates below are when Studio confirmed or disclosed a point, not when the reads took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible in the disclosures</b>Before the read, check it is within a permitted party and scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The keys that open encrypted data<br>were read in the same intrusion</span></div>
<div class="rx-zone det"><b>Detection · noticed 12–13 days later</b>Confirmed in an internal investigation; vulnerability fixed</div>
<div class="rx-g g1"><div class="t">09-30 – 10-01</div><b>Unauthorised access (period confirmed)</b></div>
<div class="rx-g g2"><div class="t">10-13</div><b>Intrusion confirmed internally</b></div>
<div class="rx-g g3"><div class="t">10-14</div><b>Externally retrievable state ends</b></div>
<div class="rx-g g4"><div class="t">10-16</div><b>First notice published</b></div>
</div>
</figure>

Detection worked, but it came 12–13 days after the access. Earlier cases where the environment lay out of the customer's sight and no independent check sat at the moment of reading include [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/) (an identity vendor's support environment went unnoticed for 18 months) and [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (one integration's stolen OAuth tokens queried over 700 Salesforce environments).

## 4. What Lemma does

**Lemma builds the check in section 03 in front of the reads of data and keys.** It does not look for intrusions; it checks, before the read, whether it is within the permitted party and scope, and keeps the record apart from the provider's operations, in a form the customer can see.

### Industries and operations to watch

- **Industry · SaaS & service providers**: website, form and CMS services that hold many companies' data and connected-service credentials in one environment. One breach reaches every company that entrusted data.
- **Industry · Companies running their sites on SaaS**: inquiry-form personal data is stored on the SaaS side. As with Link-U Group and Raksul here, a company that was not itself breached still becomes the one that notifies and reports.
- **Operation · Lookup & data access**: reads of entrusted data and keys. Customers cannot see on whose authority, or how much, was read.
- **Operation · Connecting outside services**: registering API keys, tokens and webhook destinations with a SaaS. Credentials registered there can leave as they are when the SaaS is breached.

### Current controls vs Lemma

The route in this case is column 1 (reads of keys and data from the same environment). Column 2 is the customer checking, after a read, what was read. Column 3 is theft of a permitted party's own credentials; whether that happened here is not disclosed.

| Control | Reads of keys and data from the same environment | Checking after a read what was read | Theft of a permitted party's credentials |
| --- | --- | --- | --- |
| Encrypting stored data | Partial | Not relevant | Not relevant |
| Hashing passwords | Partial | Not relevant | Not relevant |
| Fixing and rotating keys after confirmation | Partial | Not relevant | Not relevant |
| Multi-factor authentication (MFA) on customer accounts | Not relevant | Not relevant | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Encrypting stored data: the keys needed to decrypt it were read in the same intrusion, so even data stored encrypted may have been seen (Studio). Hashing passwords: the password itself is not stored, but Studio has asked users to change reused passwords. Fixing and rotating keys: the vulnerability was fixed on 13–14 October and keys switched on 17 October, but the 12–13 days before confirmation, and whatever may already have been read, are not recovered. MFA on customer accounts: as disclosed, logins to customer accounts are not named as the route. Lemma checks reads of data and keys against a record of permitted parties and scope before the read, and keeps the record in a form the customer can see.

Note: Lemma's check works only when it is built into the mechanism that lets data and keys be read, keys cannot be read from the same environment as the data on their own, and the permission record is managed apart from the provider's operations and visible to the customer. It passes when a permitted party's own credentials are stolen or when the permitted scope is too broad. The entry point is not disclosed in this case, so it cannot be said that this would have stopped it. The table compares what each control checks; it does not show whether the control stopped this case. Lemma does not detect or prevent intrusions. This Brief will be revised if a later notice discloses the entry point.

### Checklist

Three questions for companies about what they entrust to a SaaS

- If a provider is breached, is it decided which API keys, tokens, webhook destinations and integration credentials you replace first?
- Can you say which SaaS holds the personal data collected through your forms, and from when to when, including items in the trash and test submissions?
- If a provider's breach makes you the one who notifies and reports, can you produce the count and period yourself?

## 5. Facts and timeline

- **Service**: Studio, a no-code website platform. Customer companies entrust site design, CMS content, form submissions and connected-service settings to Studio's cloud.
- **Nature of access**: a third party exploited a vulnerability in some Studio functions, reached the cloud environment and was able to retrieve data externally (Studio). The kind of vulnerability and the entry point are not disclosed.
- **Period**: the unauthorised access confirmed so far ran from 30 September to 1 October (JST). Studio says the state continued until it dealt with it on 14 October.
- **Data that may be affected**: all registered users' usernames, email addresses and hashed passwords; design-editor and CMS content; form submissions (including those in the trash, test submissions and submissions over plan limits; attachments by file name only); reCAPTCHA v3 settings, webhook URLs and live-preview URLs; API keys and tokens for connected services, passwords for protected pages, Google Sheets integration credentials and custom-proxy keys; and email, username and estimated country of Studio AI early-access applicants (December 2022 to August 2023), including people without accounts.
- **Keys**: the keys needed to decrypt encrypted data were read in the same unauthorised access, so form submissions, external-service API keys and tokens, Google Sheets integration credentials, custom-proxy keys, reCAPTCHA v3 settings and webhook URLs may have been seen even where stored encrypted (Studio).
- **Not confirmed**: actual retrieval of data, tampering or deletion. Secondary harm is under investigation. The number of affected users and records has not been published.

### Timeline

- **2026-09-30**: through 10-01, unauthorised access (the period confirmed so far).
- **2026-10-13**: Studio confirmed the intrusion in an internal investigation.
- **2026-10-13**: through 10-14, vulnerability fixed and the entry route closed.
- **2026-10-14**: the externally retrievable state ended; Google Sheets integration keys updated.
- **2026-10-16**: first notice; email to users who may be affected. Customer companies including Link-U Group (timely disclosure) and Raksul announced their own impact from that day.
- **2026-10-17**: encryption keys switched to new keys; guidance on reporting to the Personal Information Protection Commission for form users.
- **2026-10-18**: update revising the Google Sheets and custom-proxy steps and adding how reCAPTCHA v3 is handled (no blanket secret-key replacement requested).

> Facts here rest on Studio's official notice (first notice of 16 October, updated 18 October) and the official statements of customer companies. The entry point (which function, which vulnerability), what was actually retrieved, and the findings of an outside investigator have not been disclosed. "12–13 days" is the gap between the confirmed unauthorised access (30 September to 1 October) and the date of confirmation in the internal investigation (13 October); what triggered confirmation is not disclosed. That something is not disclosed does not mean there was no control.

### Impact on customer companies

- **Link-U Group**: 7,663 records of personal information collected through its corporate site's inquiry form (as of 16 October). A leak is not confirmed but cannot be ruled out. Group services are said to be unaffected.
- **Raksul**: 6,412 form submissions from its websites (3 June 2024 to 15 October 2026), including names, organisations, phone numbers, email addresses and inquiry content. Member, order and payment data are outside scope. The count may not equal the number of individuals.

### After disclosure

- **Keys and credentials replaced**: encryption keys were switched on 17 October and re-encryption of earlier data is in progress. Credentials obtained by the third party, including some with permission to modify data, were invalidated, and the record of operations under them shows no changes or deletions to design-editor or CMS content (as of 18 October).
- **Requests to users**: change Studio passwords (not needed for Google- or Facebook-only login), change reused passwords, delete live-preview URLs (reissuing if needed). Per-feature emails cover switching API-integration keys, changing protected-page passwords, reconnecting Google Sheets, replacing custom-proxy keys and switching webhook destination URLs.
- **Reporting and investigation**: reports to the Personal Information Protection Commission and other authorities are under way; an outside specialist is being arranged.

## 6. Sources

- **Studio Inc. (primary, company notice)**: "[Important] Apology and request regarding information leak from unauthorised access" (2026-10-16 first notice, updated 10-18) — <https://studio.design/ja/whats-new/unauthorized-access-2026-10>
- **Link-U Group (primary, company timely disclosure)**: "Notice of possible leak of personal information following unauthorised access at Studio Inc." (2026-10-16) — <https://content.link-u.co.jp/irdata/news/ir-news_261016_01.pdf>
- **Raksul (primary, company notice)**: "Notice of unauthorised access to a cloud service we use" (2026-10-16) — <https://corp.raksul.com/news/press/261016raksul_studio/>

Only the parties' own notices, from Studio and its customer companies, serve as primary here; no independent third-party verification or English-language outside reporting has been found. Studio continues to update its notice, so the number of affected records, whether data was retrieved and the cause may change. Link-U and Raksul speak as customers about their own impact. Japanese media and blogs are not used as sources.

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
