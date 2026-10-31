---
brief_no: 167
title: "Zeabur：開発プラットフォームが 2 か月で 2 度侵害され、期限なしの管理者トークンが 8 月の「内部の管理鍵はすべて無効化または入れ替え済み」の後も有効だった — 長期有効の管理者資格情報が、使われるたびの有効性の証明なしに通用した"
title_en: "Zeabur: A developer platform was breached twice in two months, and a no-expiry admin token still worked after August's \"all internal admin keys have been disabled or rotated\" — A long-lived admin credential worked without any proof of validity at each use"
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
og_kicker_ja: "サイバー攻撃事例 · 権限の悪用"
og_kicker_en: "CYBERATTACK · PRIVILEGE ABUSE"
og_headline_ja: "「入れ替え済み」の後も、\n期限なしの管理者\nトークンが通った。\n<accent>環境変数 321 万件</accent>"
og_headline_en: "Keys \"rotated\", yet\nan admin token worked.\n<accent>3.2 million env variables read.</accent>"
summary_labels: ["What happened", "Why it got through", "The missing layer"]
key_figures:
  - value: "3,218,965"
    label: "Environment variables read from the platform database (plus data on 321,810 accounts)"
    tone: "alert"
  - value: "2024-01 → 2026-10"
    label: "From the no-expiry admin token's creation to its use by the attacker (it was not rotated after the August breach)"
  - value: "~36"
    unit: "hours"
    label: "From the first credential use to the start of the investigation after a user report, with no alerts (per Zeabur)"
glossary:
  - term: "Admin token"
    desc: "A string that lets its holder operate a cluster (the servers running apps) with admin rights, reading settings and running commands without a password. Zeabur's had no expiry."
  - term: "Service-account key"
    desc: "A key file that a program, not a person, uses to operate a cloud (here, GCP). It works until revoked."
  - term: "Environment variables"
    desc: "Settings passed to an app, often holding secrets such as API keys, database connection details and signing keys."
insight:
  slug: "rotation-claimed-not-verified"
  label: "\"All rotated\" was never checked"
  quote: "August's report said \"all internal admin keys have been disabled or rotated.\" The no-expiry admin token was outside that rotation and was used as-is in October."
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
takeaway: "A no-expiry admin token still worked after keys were declared rotated. No layer that checks, before use, that a rotation really took effect is visible in the disclosures."
self_check: "After rotating credentials following a breach, do you check that the old credentials really no longer work?"
countries: ["tw", "us"]
---

## 1. TL;DR

The developer platform Zeabur was breached a second time on 14–15 October 2026, after an incident in August. According to its interim report of 19 October, the attacker used an internal AWS key, a shared-cluster admin token and an old GCP service-account key to enter the shared cluster and 101 GCP Dedicated Servers, and read 3,218,965 environment variables and data on 321,810 accounts from the platform database. On 17 October Zeabur announced it will shut down on 31 December.

The admin token was created in January 2024 with no expiry and written in plaintext to a configuration repository in January 2026. Zeabur's August report said "all internal admin keys have been disabled or rotated", but this token and the AWS key were outside that rotation; Zeabur now says the statement was incomplete. For about 36 hours between the first use and the start of the investigation, no alerts fired. Zeabur says this was because the attacker used valid credentials and legitimate access paths.

Zeabur noticed the August breach and rotated keys. Even so, on 14 October the no-expiry admin token left out of that rotation got through. What failed was the layer that checks that credentials declared rotated really no longer work, and checks expiry and scope each time an admin credential is used.

## 2. What happened

- **Service**: Zeabur is a developer platform for deploying and hosting apps (operated by Zeabur Inc., a Delaware corporation). Users store their apps' environment variables (API keys, database connection details, signing keys and so on) on the platform.
- **Path A (shared cluster)**: an internal AWS key and the shared-cluster admin token. The token was created on 10 January 2024 with no expiry and written in plaintext to a private configuration repository on 20 January 2026. The shared cluster's admin interface was reachable from the public internet and allowed reading every service's settings and running commands in any container. On 15 October about 53 production secrets were read, including internal-network admin credentials, database accounts and the GitHub App private key.
- **Path B (GCP Dedicated Servers)**: an old GCP service-account key (source of the leak not confirmed). Zeabur assesses that this key was used to read root passwords stored in plaintext in the servers' initialisation settings. That plaintext issue had been identified on 3 September but not fixed before the incident. 101 servers (belonging to 92 users) were logged into as root, and persistent SSH keys were added to 50.
- **Database read**: on 15 October, from a server entered via Path B, the attacker used internal-network admin credentials from Path A to add a node to the internal network, and read the platform database with an internal read-only account (16:10–16:47 UTC): 3,218,965 environment variables and data on 321,810 accounts (email addresses, usernames, phone numbers and more).
- **Backup keys**: the cluster's daily backups contained all secrets. A key rotated during the response at 15:40 UTC was captured by the 16:00 backup and used by the attacker at 20:30 UTC.
- **Not disclosed**: how the initial credentials were obtained (Zeabur names a possible link to the GitHub App private key leaked in August as an unconfirmed hypothesis), the source of the old GCP key, and who the attacker is. Zeabur says access logs for storage, GCP and GitHub are incomplete, so part of the scope cannot be confirmed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it is ②. If the post-August rotation had been closed out against an inventory of admin credentials, the no-expiry token would not get through at ③. How the initial credentials were obtained has not been confirmed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Zeabur</div><div class="no">1</div><b>Creates a no-expiry admin token</b><p>January 2024. Written in plaintext to the config repository in January 2026.</p></div>
<div class="rx-step crit"><div class="who">Zeabur</div><div class="no">2</div><b>Rotates keys after the August breach</b><p>"All rotated." The token and AWS key were left out.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Enters the shared cluster with the token and key</b><p>14 October, 01:40 UTC. No alerts for about 36 hours.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">4</div><b>Reads the database</b><p>15 October, after the investigation began. 3,218,965 environment variables.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024-01-10**: The shared-cluster admin token is created with no expiry.
- **2026-01-20**: The admin token is written in plaintext to the configuration repository.
- **2026-08**: First breach. The report published on 7 September says "all internal admin keys, database passwords and cache passwords have been disabled or rotated".
- **2026-10-14**: The internal AWS key is first used at 01:36 UTC and the admin token at 01:40 UTC. Root logins to GCP Dedicated Servers begin at 13:40 UTC.
- **2026-10-15**: The investigation starts at 13:56 UTC after a user report. Reading of production secrets (14:52–16:51), adding a node to the internal network (15:30) and reading the database (16:10–16:47) continue afterwards. Admin interface access restricted (14:43), admin token revoked (15:32), attacker's node removed (17:58), login signing key rotated and all users signed out (20:25). Last attacker activity at 21:05 UTC.
- **2026-10-17**: Shutdown announced.
- **2026-10-19**: Interim report published.
- **2026-10-22**: Guidance on migration, balance refunds and claims for losses from the breach (accepted until 30 November).

> Facts here rest on Zeabur's interim report (2026-10-19, to be updated), its August incident report, and its shutdown and migration/refund notices (all primary). How the initial credentials were obtained, the source of the old GCP key and the attacker have not been disclosed. As of 31 October, no update to the interim report has been published.

### After disclosure

- **Credential rotation**: the admin token, GitHub App private key, login signing key, Hetzner and DigitalOcean tokens (16 October, 01:09 UTC), 11,536 platform access tokens and 566 zSend API keys were revoked or rotated, and 24 AWS keys disabled. Zeabur stopped storing plaintext secrets in cluster backups and keeps backup keys separate from other secrets.
- **More detection**: alerts are being set up for anomalous admin access, commands inside containers, bulk reads of secrets or databases, new internal-network nodes and cloud-key use from unfamiliar locations.
- **Requests to users**: rotate every password and key stored on Zeabur, including for those who rotated after August, and treat data in database backups in the Taipei and Hong Kong regions as leaked.
- **Shutdown and claims**: from 1 December paid plans and Dedicated Servers stop renewing; on 31 December all services stop and data is deleted. Users who suffered losses from the breach can file a claim through support by 30 November (affected accounts and services, types of leaked keys, and third-party invoices or usage records for the incident period are required).

## 4. Why it wasn't stopped

The failure here is not the attacker's sophistication. It is that there was no **layer that checks that admin credentials declared rotated really no longer work**.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means matching, before an admin credential is used, that "this credential is valid now and permitted for this scope of operation", and keeping a record. Detection means noticing anomalous use after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent here</b>Match expiry, scope and revocation status at each use</div>
<div class="rx-zone gapz"><b>Gap</b><span>After "all rotated",<br>the no-expiry token still worked</span></div>
<div class="rx-zone det"><b>Detection layer · noticed after ~36 hours</b>Investigate after a user report, then revoke</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>"All rotated" in August</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Token used on 10-14</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Investigation starts 10-15</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Revoked; all users signed out</b></div>
</div>
</figure>

The token was revoked and the attacker's node removed on the day the investigation began, but the database was read in the meantime and a key rotated during the response was used via a backup. "Rotated" is a statement made at one point in time; "the old credential no longer works" is a fact at each use. That separation is the **gap between detection and proof**, and it is a structural one.

The same structure appears in the [LiteLLM poisoned release](/critical/briefs/166-litellm-v1107-pypi-compromise/) (an admin key written to a public repository was used without having been revoked).

## 5. How to counter this

**After a breach, close out rotation only once it is matched against an inventory of admin credentials and the old credentials are shown not to work.** Do not keep no-expiry admin credentials in the first place, and keep them unusable from the public internet. Even when the source of a leak is unknown, a credential that does not work does no damage.

### Industries and operations to watch

- **Industry · Developer services**: hosting, CI and deployment providers that hold users' API keys and connection details. A single admin credential can reach many users' secrets.
- **Operation · Accounts & permissions**: issuing, storing, rotating and revoking admin tokens, cloud keys and service-account keys, including deciding the scope of rotation after a breach.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Rotating keys after a breach | Partial | Keys were rotated in August, but the AWS key and admin token in the configuration repository were left out. |
| Not storing secrets in plaintext | Partial | A migration began on 3 October but had not been merged at the time of the incident. Even without plaintext, a valid no-expiry token still works. |
| Anomaly detection and alerts | Ineffective | Per Zeabur, valid credentials and legitimate paths were used, and no alerts fired for about 36 hours. |
| Revocation and rotation after the investigation began | Partial | Revoked the same day, but the database was read in the meantime and a rotated key was used via a backup. |

### What is needed

1. **Close out rotation against an inventory.** After a breach, list admin tokens, cloud keys, service-account keys and values inside configuration repositories and backups, and mark rotation done only after someone other than the rotator confirms the old credentials no longer work.
2. **Keep no admin credential without expiry and scope.** Give admin credentials an expiry and a scope of permitted operations, and keep them unusable from the public internet. Once expired, they should not work unless renewed.
3. **Record each use.** Keep which admin credential was used, when, from where and on what scope, in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about admin credentials

- Do you confirm from an inventory that no admin token or cloud key lacks an expiry?
- For credentials rotated after a breach, do you test that the old values can no longer access anything?
- Do you confirm that no plaintext keys remain in backups or configuration repositories?

Note: if a valid credential is stolen and used within its validity period, or its scope is too broad, it passes this check. How the initial credentials were obtained here has not been confirmed, and it cannot be said that this mechanism would have stopped the path through the old GCP key. If follow-up reports reveal more, this Brief will be revised.

## 6. Sources

- **Zeabur (Primary, interim report)**: "Zeabur October 2026 security incident (preliminary report)" (2026-10-19, to be updated) — <https://zeabur.com/blogs/october-2026-security-incident>
- **Zeabur (Primary, company disclosure)**: "Zeabur August 2026 security incident" (2026-09-07; the "disabled or rotated" statement) — <https://zeabur.com/blogs/august-2026-security-incident>
- **Zeabur (Primary, company disclosure)**: "Zeabur is shutting down: what happens next" (2026-10-17) — <https://zeabur.com/blogs/zeabur-is-shutting-down>
- **Zeabur (Primary, company disclosure)**: "Zeabur service migration, refunds, and security incident claims" (2026-10-22) — <https://zeabur.com/blogs/migration-refunds-and-security-claims>
- **Zeabur (Primary, terms of service)**: company information (Zeabur Inc., Delaware) — <https://zeabur.com/docs/terms-of-service#company-information>
- **BleepingComputer (Press)**: "Zeabur shutting down after second security breach in two months" (2026-10-20) — <https://www.bleepingcomputer.com/news/security/zeabur-shutting-down-after-second-security-breach-in-two-months/>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
