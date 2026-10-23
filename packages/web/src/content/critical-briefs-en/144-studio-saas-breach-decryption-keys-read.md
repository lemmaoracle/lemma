---
brief_no: 144
title: "Studio：ノーコード Web 制作 SaaS のクラウド環境が侵害され、暗号化データの復号鍵も同時に読み出された(Studio 発表) — 委託先の環境で何が取得されたかを、預けた側が確かめる手段が無い"
title_en: "Studio: A no-code website-builder SaaS's cloud environment was breached, and the keys to decrypt its encrypted data were read in the same intrusion (Studio announcement) — Customers have no way to check what was taken from a provider's environment"
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
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "暗号化したデータと、\nそれを開く鍵が、\n同じ侵入で読まれた。\n<accent>利用企業のフォーム情報に波及</accent>"
og_headline_en: "Encrypted data and the keys that open it were read in the same intrusion.\n<accent>Customers' form data was affected.</accent>"
summary_labels: ["What happened", "Why customers could not see it", "The missing layer"]
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
  quote: "The keys that open the encrypted data could be read from the same environment as the data."
industries: ["supply-chain"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Hold reads of keys and data until checked against the permitted party and scope"
  - slug: "audit-trail"
    item: "Record what was read in a form the customer can see"
attack_method: "supply-chain"
takeaway: "Nothing checked, as entrusted data and the keys that open it were read, that the reader was a permitted party within a permitted scope."
self_check: "Do you keep a list of the keys and passwords you have entrusted to vendors?"
countries: ["jp"]
---

## 1. TL;DR

From 30 September to 1 October 2026, a third party exploited a vulnerability in some functions of Studio, a no-code website-building service, to enter the cloud environment of its operator, Studio Inc. What may have been exposed includes all registered users' account data (with hashed passwords), form submissions, and API keys and tokens for connected services, and the keys needed to decrypt encrypted data were read in the same intrusion. Studio published a first notice on 16 October and updated it on 18 October.

Storing data encrypted does not protect it if the key that opens it can be read from the same environment. Studio says it has no confirmation that data was actually retrieved, but is responding as if it had been. Downstream, the inquiry and form data of companies running their sites on Studio, including Link-U Group and Raksul, was affected. Customers have no record of their own to check what was read. Studio says the number of affected records will come in a follow-up.

Once the intrusion was confirmed, the response was quick. Studio confirmed it in an internal investigation on 13 October and fixed the vulnerability on 13–14 October. But confirmation came 12–13 days after the unauthorised access (30 September to 1 October). What did not work was a layer that checks, at the moment of reading, whether a read of entrusted data, keys and connected-service credentials is by a permitted party within a permitted scope.

## 2. What happened

- **Service**: Studio, a no-code website platform. Customer companies entrust site design, CMS content, form submissions and connected-service settings to Studio's cloud.
- **Nature of access**: a third party exploited a vulnerability in some Studio functions, reached the cloud environment and was able to retrieve data externally (Studio). The kind of vulnerability and the entry point are not disclosed.
- **Period**: the unauthorised access confirmed so far ran from 30 September to 1 October (JST). Studio says the state continued until it dealt with it on 14 October.
- **Data that may be affected**: all registered users' usernames, email addresses and hashed passwords; design-editor and CMS content; form submissions (including those in the trash, test submissions and submissions over plan limits; attachments by file name only); reCAPTCHA v3 settings, webhook URLs and live-preview URLs; API keys and tokens for connected services, passwords for protected pages, Google Sheets integration credentials and custom-proxy keys; and email, username and estimated country of Studio AI early-access applicants (December 2022 to August 2023), including people without accounts.
- **Keys**: the keys needed to decrypt encrypted data were read in the same unauthorised access, so form submissions, external-service API keys and tokens, Google Sheets integration credentials, custom-proxy keys, reCAPTCHA v3 settings and webhook URLs may have been seen even where stored encrypted (Studio).
- **Not confirmed**: actual retrieval of data, tampering or deletion. Secondary harm is under investigation. The number of affected users and records has not been published.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The irreversible steps were ② and ③: the entrusted data and the keys that open it were readable from the same environment. The entry point at ② has not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Customers</div><div class="no">1</div><b>Entrust site data, form submissions and connected-service credentials to Studio</b><p>Some of it was stored encrypted.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">2</div><b>Exploits a vulnerability in some functions and reaches the inside of the environment</b><p>30 September to 1 October. Entry point not disclosed.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">3</div><b>Reads the keys needed to decrypt encrypted data, from the same environment</b><p>Even encrypted data may have been seen.</p></div>
<div class="rx-step good"><div class="who">Studio</div><div class="no">4</div><b>Confirms the intrusion in an internal investigation and fixes the vulnerability</b><p>Confirmed 13 October; fixed 13–14 October.</p></div>
</div>
</figure>

**No published account shows that, at the moment of reading, customers could check on whose authority and how much was read.**

## 3. Timeline — disclosure and response

- **2026-09-30**: through 10-01, unauthorised access (the period confirmed so far).
- **2026-10-13**: Studio confirmed the intrusion in an internal investigation.
- **2026-10-13**: through 10-14, vulnerability fixed and the entry route closed.
- **2026-10-14**: the externally retrievable state ended; Google Sheets integration keys updated.
- **2026-10-16**: first notice; email to users who may be affected. Customer companies including Link-U Group (timely disclosure) and Raksul announced their own impact from that day.
- **2026-10-17**: encryption keys switched to new keys; guidance on reporting to the Personal Information Protection Commission for form users.
- **2026-10-18**: update revising the Google Sheets and custom-proxy steps and adding how reCAPTCHA v3 is handled (no blanket secret-key replacement requested).

> Facts here rest on Studio's official notice (first notice of 16 October, updated 18 October) and the official statements of customer companies. The entry point (which function, which vulnerability), what was actually retrieved, and the findings of an outside investigator have not been disclosed. "12–13 days" is the gap between the confirmed unauthorised access (30 September to 1 October) and the date of confirmation in the internal investigation (13 October); what triggered confirmation is not disclosed.

### Impact on customer companies

- **Link-U Group**: 7,663 records of personal information collected through its corporate site's inquiry form (as of 16 October). A leak is not confirmed but cannot be ruled out. Group services are said to be unaffected.
- **Raksul**: 6,412 form submissions from its websites (3 June 2024 to 15 October 2026), including names, organisations, phone numbers, email addresses and inquiry content. Member, order and payment data are outside scope. The count may not equal the number of individuals.

### After disclosure

- **Keys and credentials replaced**: encryption keys were switched on 17 October and re-encryption of earlier data is in progress. Credentials obtained by the third party, including some with permission to modify data, were invalidated, and the record of operations under them shows no changes or deletions to design-editor or CMS content (as of 18 October).
- **Requests to users**: change Studio passwords (not needed for Google- or Facebook-only login), change reused passwords, delete live-preview URLs (reissuing if needed). Per-feature emails cover switching API-integration keys, changing protected-page passwords, reconnecting Google Sheets, replacing custom-proxy keys and switching webhook destination URLs.
- **Reporting and investigation**: reports to the Personal Information Protection Commission and other authorities are under way; an outside specialist is being arranged.

## 4. Why it wasn't stopped

The failure is not a customer's mismanagement. Many companies entrusted site data, form submissions and connected-service credentials to the environment of one provider, and once that environment was breached none of them had a way to check what was read.

That is the **gap between detection and proof**. Once confirmed, the response was quick: Studio fixed the vulnerability within two days. But confirmation came 12–13 days after the access. What failed sits before that. "The data is encrypted" and "the key that opens it cannot be read from the same environment" are different facts, and here the keys were read in the same intrusion. Encryption does not stop retrieval by a party that can read the key from the same environment.

Studio's decision to respond as if the data had been taken is sound. The result, though, is that customers, unable to confirm what was taken, must change passwords, rotate keys and notify across the board. Studio itself cannot confirm whether anything was retrieved; Link-U writes that a leak "cannot be ruled out" and Raksul that data "may have leaked". Customers have no record of their own to check what was read.

The same structure appears in earlier Briefs. In [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/), an identity vendor's support environment went unnoticed for 18 months. In [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/), one integration's stolen OAuth tokens queried over 700 Salesforce environments. In each, the environment lies out of the customer's sight and no independent check sat at the moment of reading.

> "It was encrypted" and "the key cannot be read" are different facts. The first is recorded at storage; the second must be checked on every read.

## 5. How to counter this

**Today, customers cannot check from their side what was read in a provider's environment.** So treat the keys and credentials you entrusted as read and replace them, and ask next time for a way of entrusting data where the scope of any read can be stated. What customers can do at once is follow Studio's guidance to replace the API keys, webhook destinations, protected-page passwords and other items they had entrusted, and work out their own impact on personal data collected through forms. On the provider's side, keys need to be unreadable from the same environment as the data, and reads need to be recorded in a form customers can see.

### Industries and operations to watch

- **Industry · SaaS & service providers**: website, form and CMS services that hold many companies' data and connected-service credentials in one environment. One breach reaches every company that entrusted data.
- **Industry · Companies running their sites on SaaS**: inquiry-form personal data is stored on the SaaS side. As with Link-U Group and Raksul here, a company that was not itself breached still becomes the one that notifies and reports.
- **Operation · Lookup & data access**: reads of entrusted data and keys. Customers cannot see on whose authority, or how much, was read.
- **Operation · Connecting outside services**: registering API keys, tokens and webhook destinations with a SaaS. Credentials registered there can leave as they are when the SaaS is breached.

The same gap exists well beyond website building, at any organisation that entrusts data and integration credentials to an outside service. Whether what was entrusted has been read usually depends on waiting for the provider's investigation.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Encrypting stored data | Partly | The keys needed to decrypt it were read in the same intrusion, so even data stored encrypted may have been seen (Studio). |
| Hashing passwords | Partly | The password itself is not stored. Even so, Studio has asked users to change reused passwords. |
| Fixing and rotating keys after confirmation | Partly | The vulnerability was fixed on 13–14 October and keys switched on 17 October. The 12–13 days before confirmation, and whatever may already have been read, are not recovered. |
| Multi-factor authentication (MFA) on customer accounts | Not relevant | As disclosed, the intrusion exploited a vulnerability in some Studio functions; logins to customer accounts are not named as the route. |

### What is needed

1. **Make keys unreadable from the same environment as the data.** An environment holding ciphertext should not be able to read the key needed to decrypt it on its own. Reading a key is a separate permission from reading data.
2. **Check each read against the permitted party and scope.** Let reads of data, keys and connected-service credentials through only after they are matched against the permitted scope, and hold those that cannot be checked.
3. **Record whose data was read in a form customers can see.** Keep which permission each read relied on as a record separate from the provider's own operations, so customers can check it later. Then there is an answer other than "assume it was taken".

### Checklist

Three questions for companies about what they entrust to a SaaS

- If a provider is breached, is it decided which API keys, tokens, webhook destinations and integration credentials you replace first?
- Can you say which SaaS holds the personal data collected through your forms, and from when to when, including items in the trash and test submissions?
- If a provider's breach makes you the one who notifies and reports, can you produce the count and period yourself?

Note: even with keys kept apart from data and each read checked, a read passes when a permitted party's own credentials are stolen or when the permitted scope is too broad. The entry point has not been disclosed in this case; this Brief will be revised if a later notice discloses it.

## 6. Sources

- **Studio Inc. (primary, company notice)**: "[Important] Apology and request regarding information leak from unauthorised access" (2026-10-16 first notice, updated 10-18) — <https://studio.design/ja/whats-new/unauthorized-access-2026-10>
- **Link-U Group (primary, company timely disclosure)**: "Notice of possible leak of personal information following unauthorised access at Studio Inc." (2026-10-16) — <https://content.link-u.co.jp/irdata/news/ir-news_261016_01.pdf>
- **Raksul (primary, company notice)**: "Notice of unauthorised access to a cloud service we use" (2026-10-16) — <https://corp.raksul.com/news/press/261016raksul_studio/>

Only the parties' own notices, from Studio and its customer companies, serve as primary here; no independent third-party verification or English-language outside reporting has been found. Studio continues to update its notice, so the number of affected records, whether data was retrieved and the cause may change. Link-U and Raksul speak as customers about their own impact. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
