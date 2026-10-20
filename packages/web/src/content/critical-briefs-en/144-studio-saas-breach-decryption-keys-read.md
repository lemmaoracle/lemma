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
industries: ["supply-chain"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Hold reads of keys and data until checked against the permitted party and scope"
  - slug: "audit-trail"
    item: "Record what was read in a form the customer can see"
attack_method: "supply-chain"
---

## 1. TL;DR

From 30 September to 1 October 2026, a third party exploited a vulnerability in some functions of Studio, a no-code website-building service, to enter the cloud environment of its operator, Studio Inc. Studio published a first notice on 16 October and updated it on 18 October. What may have been exposed includes all registered users' account data (with hashed passwords), form submissions, and API keys and tokens for connected services, and <strong>the keys needed to decrypt encrypted data were read in the same intrusion</strong>. Studio says it has no confirmation that data was actually retrieved, but is responding as if it had been.

Downstream, the inquiry and form data of companies running their sites on Studio, including Link-U Group and Raksul, was affected. Studio says the number of affected records will come in a follow-up. Once the intrusion was confirmed, the response was quick. Studio confirmed it in an internal investigation on 13 October and fixed the vulnerability on 13–14 October. But confirmation came 12–13 days after the unauthorised access (30 September to 1 October). <strong>What did not work was a layer that checks, at the moment of reading, whether a read of entrusted data, keys and connected-service credentials is by a permitted party within a permitted scope.</strong>

## 2. What happened

- **Service**: Studio, a no-code website platform. Customer companies entrust site design, CMS content, form submissions and connected-service settings to Studio's cloud.
- **Nature of access**: a third party exploited a vulnerability in some Studio functions, reached the cloud environment and was able to retrieve data externally (Studio). The kind of vulnerability and the entry point are not disclosed.
- **Period**: the unauthorised access confirmed so far ran from 30 September to 1 October (JST). Studio says the state continued until it dealt with it on 14 October.
- **Data that may be affected**: all registered users' usernames, email addresses and hashed passwords; design-editor and CMS content; form submissions (including those in the trash, test submissions and submissions over plan limits; attachments by file name only); reCAPTCHA v3 settings, webhook URLs and live-preview URLs; API keys and tokens for connected services, passwords for protected pages, Google Sheets integration credentials and custom-proxy keys; and email, username and estimated country of Studio AI early-access applicants (December 2022 to August 2023), including people without accounts.
- **Keys**: the keys needed to decrypt encrypted data were read in the same unauthorised access, so form submissions, external-service API keys and tokens, Google Sheets integration credentials, custom-proxy keys, reCAPTCHA v3 settings and webhook URLs may have been seen even where stored encrypted (Studio).
- **Not confirmed**: actual retrieval of data, tampering or deletion. Secondary harm is under investigation. The number of affected users and records has not been published.

The chain was as follows.

1. Customer companies had entrusted site data, form submissions and connected-service credentials to Studio's environment.
2. A third party exploited a vulnerability in some functions and reached the inside of the environment (30 September to 1 October).
3. The keys needed to decrypt encrypted data were read from the same environment.
4. On 13 October Studio confirmed the intrusion and fixed the vulnerability on 13–14 October.

The irreversible actions were steps 2 and 3. The entrusted data and the keys that open it were readable from the same environment, and no published account shows that, at the moment of reading, customers could check on whose authority and how much was read.

## 3. Timeline — disclosure and response

- **30 September – 1 October 2026**: unauthorised access (the period confirmed so far).
- **13 October**: Studio confirmed the intrusion in an internal investigation.
- **13–14 October**: vulnerability fixed and the entry route closed.
- **14 October**: the externally retrievable state ended; Google Sheets integration keys updated.
- **16 October**: first notice; email to users who may be affected. Customer companies including Link-U Group (timely disclosure) and Raksul announced their own impact from that day.
- **17 October**: encryption keys switched to new keys; guidance on reporting to the Personal Information Protection Commission for form users.
- **18 October**: update revising the Google Sheets and custom-proxy steps and adding how reCAPTCHA v3 is handled (no blanket secret-key replacement requested).

> Facts here rest on Studio's official notice (first notice of 16 October, updated 18 October) and the official statements of customer companies. The entry point (which function, which vulnerability), what was actually retrieved, and the findings of an outside investigator have not been disclosed. "12–13 days" is the gap between the confirmed unauthorised access (30 September to 1 October) and the date of confirmation in the internal investigation (13 October); what triggered confirmation is not disclosed.

Downstream impact can be seen in customer companies' official statements.

- **Link-U Group**: 7,663 records of personal information collected through its corporate site's inquiry form (as of 16 October). A leak is not confirmed but cannot be ruled out. Group services are said to be unaffected.
- **Raksul**: 6,412 form submissions from its websites (3 June 2024 to 15 October 2026), including names, organisations, phone numbers, email addresses and inquiry content. Member, order and payment data are outside scope. The count may not equal the number of individuals.

Response:

- **Keys and credentials replaced**: encryption keys were switched on 17 October and re-encryption of earlier data is in progress. Credentials obtained by the third party, including some with permission to modify data, were invalidated, and the record of operations under them shows no changes or deletions to design-editor or CMS content (as of 18 October).
- **Requests to users**: change Studio passwords (not needed for Google- or Facebook-only login), change reused passwords, delete live-preview URLs (reissuing if needed). Per-feature emails cover switching API-integration keys, changing protected-page passwords, reconnecting Google Sheets, replacing custom-proxy keys and switching webhook destination URLs.
- **Reporting and investigation**: reports to the Personal Information Protection Commission and other authorities are under way; an outside specialist is being arranged.

## 4. Why it wasn't stopped

The failure is not a customer's mismanagement. Many companies entrusted site data, form submissions and connected-service credentials to the environment of one provider, and once that environment was breached none of them had a way to check what was read.

That is the **gap between detection and proof**. Once confirmed, the response was quick: Studio fixed the vulnerability within two days. But confirmation came 12–13 days after the access. What failed sits before that. "The data is encrypted" and "the key that opens it cannot be read from the same environment" are different facts, and here the keys were read in the same intrusion. Encryption does not stop retrieval by a party that can read the key from the same environment.

Studio's decision to respond as if the data had been taken is sound. The result, though, is that customers, unable to confirm what was taken, must change passwords, rotate keys and notify across the board. Studio itself cannot confirm whether anything was retrieved; Link-U writes that a leak "cannot be ruled out" and Raksul that data "may have leaked". Customers have no record of their own to check what was read.

The same structure appears in earlier Briefs. In [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/), an identity vendor's support environment went unnoticed for 18 months. In [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/), one integration's stolen OAuth tokens queried over 700 Salesforce environments. In each, the environment lies out of the customer's sight and no independent check sat at the moment of reading.

> "It was encrypted" and "the key cannot be read" are different facts. The first is recorded at storage; the second must be checked on every read.

## 5. What proof would have changed

A single step could sit directly before each read in the provider's environment: confirming that the read is by a permitted party within a permitted scope. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Per-read proof of permission**: register, at grant, the party and scope for each read of data, keys and connected-service credentials as issuer-signed proof, and check each read against it before it runs. Reading a key is a separate permission from reading data.
- **Proof of key–data separation**: make it checkable on the read path that an environment holding ciphertext cannot read the key needed to decrypt it on its own.
- **Independent record visible to the customer**: keep which permission a read relied on, and whose data was read, as a record separate from the provider's own operations, so customers can audit it later.

</ul>

This differs from after-the-fact blocking, key rotation and notification. The detection layer and this layer are complementary, not substitutes: the former notices the intrusion, the latter lets a read beyond permission be checked before it runs and lets customers confirm whether data was taken.

Note: the proof shows only that a read lies within the registered permission and that key–data separation holds. It passes when a permitted party's own credentials are stolen or when the registered scope is too broad. What happens to data after it is taken is outside the proof.

## 6. Sources

- **Studio Inc. (primary, company notice)**: [Important] Apology and request regarding information leak from unauthorised access (first notice published 2026-10-16, updated 10-18) — <https://studio.design/ja/whats-new/unauthorized-access-2026-10>
- **Link-U Group (primary, company timely disclosure)**: Notice of possible leak of personal information following unauthorised access at Studio Inc. (2026-10-16) — <https://content.link-u.co.jp/irdata/news/ir-news_261016_01.pdf>
- **Raksul (primary, company notice)**: Notice of unauthorised access to a cloud service we use (2026-10-16) — <https://corp.raksul.com/news/press/261016raksul_studio/>

Only the parties' own notices, from Studio and its customer companies, serve as primary here; no independent third-party verification or English-language outside reporting has been found. Studio continues to update its notice, so the number of affected records, whether data was retrieved and the cause may change. Link-U and Raksul speak as customers about their own impact. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
