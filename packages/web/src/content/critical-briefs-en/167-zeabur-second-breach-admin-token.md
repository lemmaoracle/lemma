---
brief_no: 167
title: "Zeabur：開発プラットフォームが 2 か月で 2 度侵害され、「入れ替え済み」の後も期限なしの管理者トークンが使われた"
title_en: "Zeabur: A developer platform was breached twice in two months, and a no-expiry admin token was used after keys were declared rotated"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: []
incident_date: 2026-10-14
published: 2026-10-29
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["166-litellm-v1107-pypi-compromise", "059-vercel-contextai-oauth", "075-klue-oauth-salesforce-credential-lifecycle", "064-salesloft-drift-oauth-salesforce"]
status: draft
version: "1.0"
og_lead_ja: "Zeabur：「入れ替え済み」の後も、期限なしの管理者トークンが使われた"
og_lead_en: "Zeabur: a no-expiry admin token still worked after keys were declared rotated"
layout: "report"
sections: "proof"
gate: "disclosure"
victim_desk:
  ja: "Zeabur の利用者の方へ：損害の申し出（11 月 30 日まで）や移行のご相談は、Zeabur の案内とサポートへ。当サイトは Zeabur とは関係がありません。"
  en: "Zeabur users: for incident claims (by 30 November) or migration, see Zeabur's notice and contact its support. This site is not affiliated with Zeabur."
  url: "https://zeabur.com/blogs/migration-refunds-and-security-claims"
og_kicker_ja: "サイバー攻撃事例 · 権限の悪用"
og_kicker_en: "CYBERATTACK · PRIVILEGE ABUSE"
og_headline_ja: "「入れ替え済み」の後も、\n期限なしの管理者\nトークンが通った。\n<accent>環境変数 321 万件</accent>"
og_headline_en: "Keys \"rotated\", yet\nan admin token worked.\n<accent>3.2 million env variables read.</accent>"
key_figures:
  - value: "3,218,965"
    label: "Environment variables read from the platform database (plus data on 321,810 accounts)"
    tone: "alert"
  - value: "2024-01 → 2026-10"
    label: "From the no-expiry admin token's creation to its use by the attacker (it was not rotated after the August breach)"
  - value: "~36"
    unit: "hours"
    label: "From the first credential use to the start of the investigation after a user report, with no alerts (per Zeabur)"
insight:
  slug: "rotation-claimed-not-verified"
  label: "A no-expiry key missing from the rotation inventory"
  quote: "An admin key with no expiry becomes the next way in the moment it drops off the rotation inventory."
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "separate-approval"
    item: "After a breach, close out credential rotation only once it is matched against an inventory of admin credentials and someone other than the rotator confirms the old credentials no longer work"
  - slug: "hold-unverified"
    item: "Keep admin credentials whose expiry and scope cannot be checked from being usable from the public internet"
  - slug: "audit-trail"
    item: "Record which admin credential was used, when, from where and on what scope"
attack_method: "privilege-abuse"
impact: "3,218,965 environment variables and data on 321,810 accounts read; root logins to 101 GCP Dedicated Servers"
takeaway: "A no-expiry admin token still worked after keys were declared rotated. Declaring keys rotated is not enough: unless revocation is checked each time an old credential is used, a key with no expiry keeps working."
self_check: "Do you check, from an inventory, that you have no admin tokens or cloud keys without an expiry?"
countries: ["tw", "us"]
---

## 1. Summary

After its August breach, the developer platform Zeabur reported that "all internal admin keys have been disabled or rotated", but a no-expiry admin token and other credentials were outside that rotation. In October, that token and an old cloud key were used to get into the shared cluster and Dedicated Servers, and users' environment variables were read from the platform database. Zeabur is shutting down on 31 December. <strong>Declaring keys rotated is not enough: unless revocation is checked each time an old credential is used, a key with no expiry keeps working.</strong>

## 2. What got through

- **What got through**: Reading settings and running commands in the shared cluster's admin interface with a no-expiry admin token and an internal AWS key (from 14 October). Root logins to 101 Dedicated Servers starting from an old GCP service-account key. Reading the platform database with an internal read-only account (15 October, after the investigation had begun).
- **What reaches the receiving side**: In general, what reaches an admin API or a database is a request over a legitimate path with a valid credential. Zeabur says no alert fired for about 36 hours after first use because valid credentials and legitimate paths were used.
- **Not disclosed**: How the initial credentials were obtained (Zeabur names a possible link to a GitHub App private key leaked in August as a hypothesis, not confirmed), where the old GCP key leaked from, and who the attacker is. Zeabur says access logs are incomplete, so part of the impact cannot be confirmed.

## 3. What to check

Whatever the route, the condition for telling these apart is that the side receiving admin operations and data exports checks, before execution, the expiry, scope and revocation status of the credential used.

- **Who issues**: The side that issues admin credentials (the platform's administrators). Credentials are issued with an expiry and an allowed scope, and rotation and revocation status are kept in a single register.
- **Where it is checked**: At the cluster admin API and at the boundary where database contents and secrets are exported. Each time a credential is used, it is checked that it has not expired, is within scope and has not been revoked; requests that do not match are not executed.
- **What is left**: A record of which credential was used, when, from where and on what scope, so that after a breach it is possible to narrow down which values were read.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, each time an admin credential is used, that it is valid now and allowed for this scope of operation, and keeping a record. Detection means noticing abnormal use after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check expiry, scope and revocation at every use</div>
<div class="rx-zone gapz"><b>In between</b><span>After "all rotated", a no-expiry<br>token still got in</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Investigate after a user report and revoke</div>
<div class="rx-g g1"><div class="t">2026-08</div><b>"All rotated" reported</b></div>
<div class="rx-g g2"><div class="t">10-14</div><b>Token used</b></div>
<div class="rx-g g3"><div class="t">10-15</div><b>Investigation begins</b></div>
<div class="rx-g g4"><div class="t">10-15</div><b>Revocation and sign-out of all users</b></div>
</div>
</figure>

The token was revoked on the day the investigation began, but in the meantime the database was read, and a key rotated during the response was picked up by a backup and used. That admin keys can be used without having been revoked is a point shared with the [LiteLLM poisoned release](/critical/briefs/166-litellm-v1107-pypi-compromise/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the boundary that receives admin operations and data exports.** It does not look for intrusions; it checks that the credential on an incoming request is valid now and within the scope it was given.

### Industries and operations to watch

- **Industry · Developer services**: Hosting, CI and deployment providers that hold users' API keys and connection details. One admin credential reaches the secrets of many users.
- **Operation · Accounts & permissions**: Issuing, storing, rotating and revoking admin tokens, cloud keys and service-account keys, including how the scope of post-breach rotation is decided.

### Current controls vs Lemma

| Control | Reads and commands via the admin API | Database and secret exports | Server logins with a password |
| --- | --- | --- | --- |
| Rotating keys after a breach | Partial | Partial | Partial |
| Not storing secrets in plain text | Partial | Not relevant | Partial |
| Anomaly detection and alerts | Not effective | Partial | Not effective |
| Revocation and rotation after the investigation starts | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Rotation does not reach credentials missing from the inventory, and detection struggles to tell apart requests with valid credentials over legitimate paths. Only Lemma checks the expiry, scope and revocation status of a credential each time it is used.

Note: Lemma's check works only where it is built into the admin API and data-export boundary and credential issuance and revocation are kept in one register. It passes if a credential within its expiry is stolen and used within scope, or if the checking system itself is taken over. Server logins with a password are outside this check. The table compares what each control checks; it does not show whether anything would have stopped this case. Lemma does not detect or prevent intrusion.

### Checklist

Three points for your organisation to check about admin credentials

- After rotating credentials following a breach, do you test that the old values no longer give access?
- Do you check that no plain-text keys remain in backups or configuration repositories?
- Are admin interfaces and admin APIs kept unreachable directly from the public internet?

## 5. Facts and timeline

- **Service**: Zeabur is a developer platform for deploying and hosting apps (operated by Zeabur Inc., a Delaware corporation). Users store their apps' environment variables (API keys, database connection details, signing keys and so on) on the platform.
- **Path A (shared cluster)**: An internal AWS key and the shared cluster's admin token. The token was created with no expiry on 10 January 2024 and written in plain text to a private configuration repository on 20 January 2026. The shared cluster's admin interface was reachable from the public internet and allowed reading every service's settings and running commands in any container. On 15 October, about 53 production secrets were read (including internal-network admin credentials, database accounts and the GitHub App private key).
- **Path B (GCP Dedicated Servers)**: An old GCP service-account key (where it leaked from has not been confirmed). Zeabur assesses that this key was used to read root passwords stored in plain text in the Dedicated Servers' initial configuration. The plain-text issue had been identified on 3 September but was not fixed at the time of the incident. 101 servers (belonging to 92 users) were logged into as root, and persistent SSH keys were added to 50.
- **Database read**: On 15 October, from a server entered via path B, the attacker used internal-network admin credentials obtained via path A to add a node to the internal network, and read the platform database with an internal read-only account (16:10–16:47 UTC): 3,218,965 environment variables and data on 321,810 accounts (email addresses, usernames, phone numbers and so on).
- **Backup key**: The cluster's daily backups contained every secret. A key rotated at 15:40 UTC during the response was captured in the 16:00 backup and used by the attacker at 20:30 UTC.

### Timeline

- **2024-01-10**: The shared cluster's admin token is created with no expiry.
- **2026-01-20**: The admin token is written in plain text to a configuration repository.
- **2026-08**: First breach. The report published on 7 September says "all internal admin keys, database passwords and cache passwords have been disabled or rotated." Zeabur later acknowledged this statement was incomplete.
- **2026-10-14**: The internal AWS key is first used at 01:36 UTC and the admin token at 01:40 UTC. Root logins to GCP Dedicated Servers begin at 13:40 UTC.
- **2026-10-15**: At 13:56 UTC, an investigation begins after a user report. Production secrets are still read (14:52–16:51), a node is added to the internal network (15:30) and the database is read (16:10–16:47). Admin-interface access is restricted (14:43), the admin token revoked (15:32), the attacker's node removed (17:58), and the login signing key renewed with all users signed out (20:25). The attacker's last activity is at 21:05 UTC.
- **2026-10-17**: The shutdown is announced.
- **2026-10-19**: The preliminary report is published.
- **2026-10-22**: Guidance on migration, balance refunds and claims for breach damage (accepted until 30 November) is published.

> Facts rest on Zeabur's preliminary report (2026-10-19, to be updated), its August breach report, and its shutdown and migration/refund notices (all primary). What is not disclosed does not mean no measure was in place. As of 1 November, no follow-up to the preliminary report has been published.

### After disclosure

- **Credential rotation**: Revoked or rotated the admin token, the GitHub App private key, the login signing key, Hetzner and DigitalOcean tokens (01:09 UTC on 16 October), 11,536 platform access tokens and 566 zSend API keys, and disabled 24 AWS keys. Stopped putting plain-text secrets in cluster backups and stored the backup key separately from other secrets.
- **Added detection**: Setting up alerts for abnormal admin access, commands inside containers, bulk reads of secrets or the database, new internal-network nodes and cloud-key use from unfamiliar locations.
- **Requests to users**: Asks all users, including those who rotated after August, to rotate every password and key stored on Zeabur, and to treat database backups in the Taipei and Hong Kong regions as leaked.
- **Shutdown and claims**: Renewals of paid plans and Dedicated Servers stop from 1 December, and all services stop and data is deleted on 31 December. Users harmed by the breach are to file claims through support by 30 November (with the affected account and services, the type of leaked key, and third-party bills or usage records for the incident period).

## 6. Sources

- **Zeabur (Primary, interim report)**: "Zeabur October 2026 security incident (preliminary report)" (2026-10-19, to be updated) — <https://zeabur.com/blogs/october-2026-security-incident>
- **Zeabur (Primary, company disclosure)**: "Zeabur August 2026 security incident" (2026-09-07; the "disabled or rotated" statement) — <https://zeabur.com/blogs/august-2026-security-incident>
- **Zeabur (Primary, company disclosure)**: "Zeabur is shutting down: what happens next" (2026-10-17) — <https://zeabur.com/blogs/zeabur-is-shutting-down>
- **Zeabur (Primary, company disclosure)**: "Zeabur service migration, refunds, and security incident claims" (2026-10-22) — <https://zeabur.com/blogs/migration-refunds-and-security-claims>
- **Zeabur (Primary, terms of service)**: company information (Zeabur Inc., Delaware) — <https://zeabur.com/docs/terms-of-service#company-information>
- **BleepingComputer (Press)**: "Zeabur shutting down after second security breach in two months" (2026-10-20) — <https://www.bleepingcomputer.com/news/security/zeabur-shutting-down-after-second-security-breach-in-two-months/>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
