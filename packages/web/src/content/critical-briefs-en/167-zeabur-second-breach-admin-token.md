---
brief_no: 167
title: "Zeabur：開発プラットフォームが 2 か月で 2 度侵害され、期限なしの管理者トークンが 8 月の「全鍵を無効化・入れ替え済み」の後も有効だった — 長期有効の管理者資格情報が、使われるたびの有効性の証明なしに通用した"
title_en: "Zeabur: A developer platform was breached twice in two months, and a no-expiry admin token still worked after August's 'all keys disabled or rotated' — A long-lived admin credential worked without any proof of validity at each use"
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
og_lead_ja: "Zeabur：8 月の「全鍵を入れ替え済み」の後も、期限なしの管理者トークンが 10 月の侵害に使われた"
og_lead_en: "Zeabur: after August's 'all keys rotated', a no-expiry admin token was still in use in October"
industries: ["developers"]
operations: ["account-admin"]
attack_method: "privilege-abuse"
countries: ["us"]
---

## 1. TL;DR

The developer platform Zeabur was breached a second time on 14–15 October 2026, after an incident in August. According to its interim report of 19 October, the attacker used an internal AWS key, a shared-cluster admin token and an old GCP service-account key to enter the shared cluster and 101 GCP Dedicated Servers, and read 3,218,965 environment variables (321,810 accounts) from the platform database. The admin token was created in January 2024 with no expiry and written in plaintext to a configuration repository in January 2026. Zeabur's August report had said "all internal admin keys have been disabled or rotated"; Zeabur now says that statement was incomplete.

For about 36 hours between the first credential use and the start of the investigation, no alert fired; Zeabur attributes this to the attacker using valid credentials and legitimate access paths. Once a user report triggered the investigation, Zeabur revoked the admin tokens, rotated the login signing key and signed out all users the same day. <strong>What did not work was a layer that checks whether credentials declared rotated are really dead, and that checks the validity and scope of a no-expiry admin credential every time it is used.</strong>

## 2. What happened

- **Service**: Zeabur, an app deployment and hosting platform operated by Zeabur Inc., a Delaware corporation. Customers store their apps' environment variables (API keys, database credentials, signing keys) on the platform.
- **Path A (shared cluster)**: an internal AWS key and a shared-cluster admin token (created 10 January 2024, no expiry, written in plaintext to a private configuration repository on 20 January 2026). The cluster's admin interface was reachable from the public internet and allowed changing any service's settings and running commands in any container. On 15 October about 53 production secrets were read, including internal-network admin credentials, a database account and the GitHub App private key.
- **Path B (GCP Dedicated Servers)**: an old GCP service-account key whose source of leakage is unconfirmed. Zeabur assesses that it was used to read root passwords stored in plaintext in the servers' initialization settings. 101 servers (92 users) were accessed as root, 50 received persistent SSH keys, and 16 copies of customer disks were attached to 5 attacker-created VMs.
- **Database read**: on 15 October the attacker added a node to the internal network from a Path-B server using Path-A admin credentials, then read the platform database with an internal read-only account (16:10–16:47 UTC): 3,218,965 environment variables, 321,810 accounts. Commands were also run on 865 database services across 9 regions.
- **Unconfirmed**: how the initial credentials were obtained. Zeabur hypothesizes a link to the GitHub App private key leaked in August but has not confirmed it.

The chain was as follows.

1. In January 2024 a no-expiry shared-cluster admin token was created; in January 2026 it was written in plaintext to a configuration repository.
2. After the August incident, the AWS key and the admin token in that repository were not rotated.
3. On 14 October the attacker first used the AWS key (01:36 UTC) and the admin token (01:40 UTC). From 13:40 UTC, root logins to Dedicated Servers began via the old GCP key.
4. On 15 October the two paths met and the platform database was read from the internal network.
5. At 13:56 UTC on 15 October, a user report triggered the investigation.

The irreversible actions were steps 3 and 4. When a credential that should have been rotated still worked, no layer checked the validity of the admin authority being used.

## 3. Timeline — disclosure and response

- **2024-01-10**: Shared-cluster admin token created, no expiry.
- **2026-01-20**: Admin token written in plaintext to a configuration repository.
- **2026-08**: First incident. A report published on 7 September says every internal administrative key, database password and cache password was disabled or rotated.
- **2026-10-14**: Internal AWS key first used at 01:36 UTC, admin token at 01:40 UTC. Root logins to GCP Dedicated Servers begin at 13:40 UTC.
- **2026-10-15**: Investigation starts at 13:56 UTC after a user report. Admin interface restricted (14:43), admin tokens revoked (15:32; re-rotated 21:47), attacker network node removed (17:58), login signing key rotated and all users signed out (20:25), public SSH to GCP blocked (20:36). Last attacker activity 21:05 UTC (AWS).
- **2026-10-17**: Zeabur announces it is shutting down.
- **2026-10-19**: Zeabur publishes its interim report.

> Facts here rest on Zeabur's interim report (19 October, to be updated), its August incident report and its shutdown announcement. How the initial credentials were obtained, the source of the old GCP key and the attacker's identity have not been disclosed. Zeabur states that neither the 16+ hours of attack activity on 14 October nor the roughly 36 hours from first credential use to investigation triggered an alert.

### Response

- **Credential rotation**: admin tokens, GitHub App key, login signing key, Hetzner and DigitalOcean tokens (01:09 UTC on 16 October), 11,536 platform access tokens and 566 zSend API keys revoked or rotated; 24 AWS keys disabled.
- **New detection**: alerts being built for anomalous admin access, in-container commands, bulk reads of secrets or databases, new internal network nodes, and cloud-key use from unfamiliar locations.
- **Ask to users**: replace every password and key stored on Zeabur, even if already replaced after August.
- **Shutdown**: the 17 October announcement stops some services from 1 December and all Dedicated Servers and shared clusters by 31 December. It says the two incidents this year made the shortcomings in security and operations clearer and that Zeabur decided to wind down after reassessing following the latest one. The interim report calls the shutdown "an operational decision".

## 4. Why it wasn't stopped

The failure is neither a slow response after the user report nor the attacker's sophistication. It is that nothing independently checked whether admin credentials declared rotated were actually dead. Zeabur itself puts the root cause in long-lived admin credentials stored in plaintext and usable from the public internet.

That is the **gap between detection and proof**. Containment after the report was fast: admin tokens revoked and all users signed out the same day. What failed sits before that. When the 7 September report said all internal admin keys were disabled or rotated, the AWS key and the no-expiry admin token in the configuration repository had not been. "We rotated it" is a statement; "it no longer works" is a fact that has to be checked at each use, not at each statement.

The no-expiry admin token worked for about two years and nine months without any evidence of validity, scope or revocation state. Zeabur explains the 36 hours without an alert by the attacker's use of valid credentials and legitimate paths. A valid credential carried nothing, at the moment of use, to show that the use was still authorised.

The same structure appears in earlier Briefs: [LiteLLM](/critical/briefs/166-litellm-v1107-pypi-compromise/) (an admin key pushed to a public repository in May and never revoked led to the October poisoned release) and [Klue](/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/) (an old test credential used for bulk extraction).

> "Rotated" is a statement at a point in time. "No longer works" is a fact to be checked at every use.

## 5. What proof would have changed

A single step could sit directly before an admin credential is used: confirming that the credential is valid now and permitted for this scope of operation. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Proof of validity at each use**: attach an issuer-signed validity period and scope to admin credentials, and check each use against them together with revocation state. A no-expiry credential does not pass unless its proof is renewed.
- **Independent confirmation of rotation**: for credentials declared rotated, keep a record that the old credentials are invalid, checkable separately from the operator's statement.
- **Scope limits**: register an admin credential's scope (cluster, region, operation type) at grant time, and stop out-of-scope use before it runs.

</ul>

> Note: the proof shows only that a credential is within its registered validity, scope and revocation state. It passes when the registered scope is too broad, or when a valid credential is stolen and used within its period. What happens to data after intrusion is outside the proof.

This differs from after-the-fact revocation, rotation and alerting. The detection layer and this layer are complementary, not substitutes: the former notices anomalous use; the latter lets use of admin authority that is neither valid nor permitted be checked before it runs, and makes a "rotated" statement verifiable.

## 6. Sources

- **Zeabur (primary, company interim report)**: "Zeabur October 2026 security incident" (published 2026-10-19, to be updated) — <https://zeabur.com/blogs/october-2026-security-incident>
- **Zeabur (primary, company report)**: "Zeabur August 2026 security incident" (published 2026-09-07; the "disabled or rotated" statement) — <https://zeabur.com/blogs/august-2026-security-incident>
- **Zeabur (primary, company announcement)**: "Zeabur is shutting down: what happens next" (2026-10-17) — <https://zeabur.com/blogs/zeabur-is-shutting-down>
- **Zeabur (primary, terms of service)**: company information (Zeabur Inc., Delaware) — <https://zeabur.com/docs/terms-of-service#company-information>
- **BleepingComputer (independent reporting)**: "Zeabur shutting down after second security breach in two months" (2026-10-20) — <https://www.bleepingcomputer.com/news/security/zeabur-shutting-down-after-second-security-breach-in-two-months/>

The skeleton of facts rests on Zeabur's interim report, which may be updated. How the initial credentials were obtained remains a Zeabur hypothesis. Japanese media and blogs are not used as sources.

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/), [Pillar 03 — Agent authority](/pillars/#authority)
