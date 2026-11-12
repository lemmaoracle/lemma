---
brief_no: 203
title: "Railway：ビルド基盤の未知の脆弱性から入った攻撃者が、誤った OIDC の設定で得たクラウドの認証情報を経て、顧客の環境変数を復号した(Railway のインシデント報告)"
title_en: "Railway: An attacker who entered through an unknown build-infrastructure vulnerability reached cloud credentials through a misconfigured OIDC binding and decrypted customers' environment variables (Railway incident report)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-10-21
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "059-vercel-contextai-oauth", "007-pocketos-cursor-db-deletion"]
status: draft
version: "1.0"
og_lead_ja: "Railway で、ビルド基盤の脆弱性と誤った OIDC の設定を経て、最大で約 10 万のワークスペースの環境変数が復号された可能性がある"
og_lead_en: "At Railway, a build-infrastructure vulnerability and a misconfigured OIDC binding led to the possible decryption of environment variables in up to about 100,000 workspaces"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "サイバー攻撃事例 · クラウド基盤"
og_kicker_en: "CYBERATTACK · CLOUD PLATFORM"
og_headline_ja: "ビルド基盤から入り、\nOIDC の設定の誤りで\n変数の復号まで届いた。\n<accent>最大 約10万ワークスペース</accent>"
og_headline_en: "In through the builders,\npast a bad OIDC setting,\nto decrypted variables.\n<accent>Up to ~100,000 workspaces.</accent>"
key_figures:
  - value: "Up to 1.85"
    unit: "%"
    label: "Share of workspaces that could have had any environment variable decrypted (about 100,000; the logs identify environments, so this is an upper bound; Railway's incident report)"
    tone: "alert"
  - value: "353"
    unit: "builds"
    label: "Builds whose stored histories the attacker read from Temporal (sealed variables included; 20 October, 13:50 to 15:30 UTC)"
  - value: "About 740,000"
    unit: "USD"
    label: "Estimated unauthorised spend on the stolen keys (Railway's incident report)"
glossary:
  - term: "Environment variable"
    desc: "A setting passed to an application from outside. It often holds secrets such as API keys or database connection details. Railway stores them encrypted with a key per environment."
  - term: "OIDC trust configuration"
    desc: "A mechanism by which a job such as CI/CD exchanges a token showing its identity for a short-lived cloud credential. The conditions for which jobs may receive one are set on the cloud side."
  - term: "KMS (key management service)"
    desc: "A cloud service that holds encryption keys and encrypts and decrypts without letting the keys out. Railway encrypts each per-environment key with a root key inside the KMS."
insight:
  slug: "workload-credential-not-tied-to-deploy"
  stop: true
  label: "An issued credential shows no job"
  quote: "Before cloud credentials are issued to CI/CD, check which repository and which deployment the requesting job is for, against a deployment record rather than a match in the trust configuration."
industries: ["developers", "ai"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "verify-entry"
    item: "Before CI/CD receives cloud credentials, check at the entry point which repository and which deployment the job is for"
  - slug: "limit-and-revoke"
    item: "Scope keys that can decrypt secrets to each calling service, and do not leave them on a machine's disk for long"
  - slug: "hold-unverified"
    item: "Hold, before execution, any decryption that cannot be tied to a deployment record or that spans many environments"
  - slug: "audit-trail"
    item: "Record, apart from the key service, which caller decrypted which environment's values for which job"
attack_method: "supply-chain"
impact: "Up to 1.85% of workspaces (about 100,000) could have had any environment variable decrypted (an upper bound). Linked-account tokens of 1,852 users were decrypted, and unauthorised spend on the stolen keys was estimated at about USD 740,000 (Railway's incident report)"
takeaway: "An attacker who entered through the build infrastructure obtained cloud credentials through a misconfigured CI/CD OIDC binding, pulled encrypted environment variables and decrypted them with the key management service. An issued credential does not show that the job using it is genuine. Check against the deployment record before issuing."
self_check: "Do you know the conditions under which your CI/CD can receive cloud credentials, down to which repository and which job?"
countries: ["us"]
---

## 1. Summary

At Railway (US), a development and hosting platform, an attacker used an unknown vulnerability in the build infrastructure to obtain a build credential, then got other builds' histories and a copy of the internal monorepo from Railway's Temporal cluster, which runs asynchronous tasks (Railway's incident report). Next, through an error in the CI/CD OIDC trust configuration, the attacker obtained a short-lived cloud credential. From there they took internal credentials, pulled encrypted environment variables from a database, and decrypted some of them with the key management service (KMS).

According to Railway, at most 1.85% of workspaces (about 100,000) could have had any environment variable decrypted. The logs identify environments, not individual variables, so this is an upper bound. Railway believes the attacker was after AI providers' API keys. The decrypted data included linked-account tokens of 1,852 users, and unauthorised spend on the stolen keys was estimated at about USD 740,000.

<strong>A credential issued correctly does not show that the job using it is genuine.</strong>

## 2. What got through

- **What got through**: Two operations. First, an OIDC exchange for CI/CD issued a short-lived cloud credential to the attacker (21 October, 03:26 UTC). Second, a longer-lived credential found on the disk of an orchestration machine was used to ask the KMS to decrypt environment variables, and the requests went through (the same day, 04:42 to 05:14 and 06:36 to 07:15 UTC). Before that, the build credential was accepted by the build Temporal instance as a trusted client, and the histories of 353 builds were read.
- **What reached the accepting side**: In general, the cloud side of an OIDC exchange receives a token showing the job's identity, and issues a credential if it matches the conditions of the trust configuration. If the conditions themselves are wrong, whether the job is the intended deployment does not reach it. The KMS receives a valid credential and a decryption request. It does not receive which deployment the decryption is for, or how many environments it spans.
- **Not disclosed**: The details of the build-infrastructure vulnerability and what exactly was wrong in the OIDC configuration (Railway says it is working with upstream on responsible disclosure of vulnerabilities in third-party software). Which cloud provider's KMS was involved. How many individual variables were decrypted (the logs work at the environment level). Who the attacker is (Railway filed a complaint with the FBI's IC3). A specialist forensics firm's investigation is ongoing.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before cloud credentials are issued and before secrets are decrypted, the request is checked as coming from a specific repository's specific deployment, against a deployment record kept apart from the trust configuration's match and the keys at hand.

- **Who approves**: The owner of the deployment at the company running the platform. They decide which job, from which repository and branch, may reach which cloud environment with which permissions, and keep this as a deployment record in a form that CI/CD and build credentials cannot produce.
- **Where it is checked**: In two places: the step that issues cloud credentials in an OIDC exchange, and the step that asks the KMS to decrypt. An exchange that matches the trust configuration but cannot be tied to the deployment record is held. A decryption with a valid key is held if it is for a deployment not in the record, or if it spans many customers' environments.
- **What is recorded**: Which job decrypted which environment's values, under which deployment record. It is kept apart from the key service, so it can later be established, more finely than by environment, whose values were decrypted.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before cloud credentials are issued and before environment variables are decrypted, which deployment the request is for, and keeping a record. Detection means noticing suspicious calls, cutting off credentials and evicting the attacker. Dates and times (UTC) rely on Railway's incident report.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check credential exchanges and decryptions against the deployment record before letting them through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Histories of 353 builds and a copy of the monorepo<br>Variables in up to 1.85% of workspaces (about 100,000) possibly decrypted</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Traced from an alert; builds halted; credentials and decryption cut off</div>
<div class="rx-g g1"><div class="t">10-20</div><b>A build credential is taken through a build-infrastructure vulnerability</b></div>
<div class="rx-g g2"><div class="t">10-21 03:26</div><b>Cloud credentials obtained through the wrong OIDC configuration</b></div>
<div class="rx-g g3"><div class="t">10-21 04:42</div><b>Decryption of environment variables via the KMS begins</b></div>
<div class="rx-g g4"><div class="t">10-21 07:14</div><b>Railway cuts off cloud credentials and decryption</b></div>
</div>
</figure>

Detection worked, and the credential used for decryption was cut off about 17 hours after the first alert. Even so, the OIDC exchange and the KMS decryption went through as valid credentials. A case where a CI/CD trust configuration let a bad job through by the correct procedure is [TanStack](/critical/briefs/014-tanstack-oidc-trusted-publisher/) (malicious packages signed under a legitimate OIDC publisher), and one where a way into a development platform opened from outside authentication is [Vercel](/critical/briefs/059-vercel-contextai-oauth/) (an employee's OAuth grant to an AI tool). [PocketOS](/critical/briefs/007-pocketos-cursor-db-deletion/) is a separate case, in which an AI agent called the same Railway's API and deleted a production database. Here, inside the platform, one credential led to the next, all the way to decrypting customers' secrets.

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that issues cloud credentials and the step that decrypts secrets.** It does not look for intrusions; it checks, before execution, which deployment's job an exchange or a decryption is for.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Hosting and CI/CD platforms that hold customers' applications and secrets, and the development teams that keep API keys there. Internal credentials at one platform reach many customers' secrets.
- **Industry · AI adoption (all industries)**: Companies that run applications and agents with AI providers' API keys in environment variables. Stolen keys lead straight to usage charges.
- **Operation · Accounts & permissions**: CI/CD OIDC trust configuration, service account permissions, and the lifetime of credentials kept on machines.
- **Operation · Data access**: Reading encrypted secrets and decrypting them in a key management service.

### Current controls vs Lemma

The route in this case went through all three columns (internal calls with the build credential, then the OIDC exchange, then decryption with a longer-lived key). The columns are divided by what is executed at each stage.

| Control | Internal calls with the build credential | Cloud credentials via the OIDC exchange | Decryption with a longer-lived key |
| --- | --- | --- | --- |
| Build isolation (a virtual machine per build) | Partial | Not effective | Not effective |
| Short-lived credentials | Not effective | Partial | Not effective |
| Limiting decryption scope per caller | Not effective | Not effective | Partial |
| **Lemma (pre-execution check)** | Partial | Effective | Effective |

Build isolation makes it harder for a build to reach the host machine, but here the isolation was partly escaped. Short-lived credentials shorten how long they work, but they are issued if the trust configuration is wrong, and the next credentials were taken within that time. Limiting decryption scope per caller still lets through decryption from a caller that needs it for its work, such as the orchestration machine. Lemma checks, before execution, not whether the credentials are valid but whether the exchange or decryption can be tied to the deployment record. Because the build credential was shared across many builds, the first column works only when each call carries a record of which build it is for.

Note: Lemma's check works only when it is built into the OIDC exchange and the KMS decryption, and the deployment record is managed apart from CI/CD and build credentials. It can be passed if the rights to create deployment records are taken too, or if a recorded deployment's job is itself hijacked. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, does not revoke keys, and does not recover unauthorised spend.

### Checklist

Three things to confirm about decrypting the secrets you hold

- Can you list which machines and services hold credentials that can decrypt secrets, and with what lifetime?
- Do you record decryption operations by caller and target environment, so you can establish later whose values were decrypted?
- Is there a set procedure for the order in which you replace your own API keys when secrets leak on the platform side?

## 5. Facts and timeline

- **Parties**: Railway (US; a development and hosting platform). The incident report was published on its blog on 10 November 2026, following the preliminary report of 22 October. A specialist forensics firm's investigation is ongoing.
- **What happened**: According to Railway, at 07:28 UTC on 20 October the attacker used an unknown vulnerability in the build infrastructure to partially escape filesystem isolation and obtained a credential that build servers use for a subset of internal systems. The build Temporal instance accepted this credential as a trusted client; the attacker read the histories of 353 builds (sealed variables included) and obtained a copy of the internal monorepo from caching snapshots. At 03:26 UTC on 21 October, through an error in the CI/CD OIDC trust configuration, they obtained a short-lived cloud credential, took internal credentials and an SSH key, and entered an orchestration machine. That machine's disk held a longer-lived credential able to decrypt environment variables. The attacker pulled encrypted variables from the database between 04:07 and 05:21 UTC (selecting variable names with regular expressions matching AI providers' keys), and decrypted some of them via the KMS between 04:42 and 05:14 and between 06:36 and 07:15 UTC.
- **How it was found**: An alert on anomalous API calls to the registry service that stores build artifacts paged the on-call engineer at 13:58 UTC on 20 October. Railway halted builds twice (17:03 UTC on 20 October and 07:22 UTC on 21 October), and at 07:14 UTC on 21 October disabled all active cloud credentials, revoked static credentials and disabled decryption. The attacker was evicted at 09:24 UTC. According to the incident report, the attacker had been creating dummy accounts since 18 October.
- **Impact and response**: At most 1.85% of workspaces (about 100,000) could have had any environment variable decrypted (an upper bound). The decrypted data included linked-account tokens (bring-your-own agent keys and GitHub OAuth tokens) of 1,852 users; Railway reset all of them and says it found no logins to Railway accounts with credentials taken in the incident. Unauthorised spend on the stolen keys was estimated at about USD 740,000; Railway is working with providers on refunds and says it will cover the costs for providers that decline. It says forensics did not indicate that customer databases were accessed.

### Timeline

- **2026-10-18**: The attacker begins creating dummy accounts (the early attempts were reportedly stopped by automated systems).
- **2026-10-20**: At 07:28 UTC, partial isolation escape through the build-infrastructure vulnerability; build credential obtained. Histories of 353 builds read between 13:50 and 15:30 UTC. Alert at 13:58 UTC. Builds halted at 17:03 UTC; build credential replaced at 17:28 UTC.
- **2026-10-21**: At 03:26 UTC, cloud credentials obtained through the wrong OIDC configuration. Decryption via the KMS from 04:42 UTC. Credentials and decryption cut off at 07:14 UTC. From 09:25 UTC, AI providers and others are asked to revoke keys. At 20:19 UTC, all user sessions and tokens invalidated; the first disclosure is published the same day.
- **2026-10-22**: Builds restored plan by plan (all by 22:49 UTC). New signups paused at 19:06 UTC. Preliminary report published.
- **2026-11-02**: New signups reopen.
- **2026-11-10**: Incident report published.

> The facts rely on Railway's incident report, preliminary report and first disclosure (all primary). Times are UTC. The preliminary report gives the time of awareness and the attack window differently from the incident report (it says Railway became aware at 19:53 UTC on 20 October and put the window's end at 03:32 UTC on 22 October); this Brief follows the incident report's times. The incident report cites Wiz's assessment that the attacker used a harness similar to ARTEX; this Brief does not cover that in detail. The details of the vulnerability, what was wrong in the configuration and the number of individual variables decrypted have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate Railway's response. Written as of 12 November.

### After disclosure

- **Railway**: Each build now runs in a dedicated ephemeral virtual machine, with a credential that can only push a specific image to the registry. CI was rebuilt, with two-factor approval and biometrics in critical areas, plus logging and alerting. Every service account's permissions were reviewed, moving towards short-lived, narrowly scoped credentials. All encrypt and decrypt operations are now centrally audit-logged, no service other than the secrets service can reach the root keys, and each calling service may decrypt only what it needs.
- **Guidance to users**: Railway recommends rotating secrets stored on Railway before 21 October, removing public network access to databases, and checking GitHub and container registry audit logs. It asks users to report unauthorised charges through a form.
- **Authorities and providers**: Railway filed a complaint with the FBI's IC3 and is sharing what it knows with authorities and with providers whose customers were affected. It says it will publish indicators of compromise once law enforcement signs off.

## 6. Sources

- **Railway (Primary, company report)**: "Incident Report: October 21st Security Attack" (2026-11-10) — <https://blog.railway.com/p/incident-report-october-security-incident>
- **Railway (Primary, company report)**: "Preliminary Report: Oct 21st Security Incident" (2026-10-22) — <https://blog.railway.com/p/preliminary-report-october-security-incident>
- **Railway (Primary, company disclosure)**: "Security Disclosure: Wednesday October 21st" (2026-10-21) — <https://blog.railway.com/p/security-disclosure-wednesday-october-21st>
- **Railway Status (Primary, company status page)**: "Railway Platform Outage" (2026-10-21 to 23) — <https://status.railway.com/incident/QH8L8B3E>
- **Wiz (Analysis)**: "“Black October” for AI Developer Platforms" (2026-10-30) — <https://www.wiz.io/blog/black-october-for-ai-developer-platforms>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
