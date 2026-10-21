---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用されて顧客の Microsoft 365 テナントにサインインされ、同じ日にアプリ ID による管理者権限の自己付与も確認された(Huntress 調査・ConnectWise 発表) — 同意済みのアプリ ID による操作を、実行の前に「ベンダーが意図した操作か」確かめる層が無い"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants, and on the same day an app identity was seen granting itself Global Administrator in some tenants (Huntress research, ConnectWise advisory) — No layer checks, before it runs, whether an action by a consented app identity is one the vendor intended"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-10-15
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["059-vercel-contextai-oauth", "064-salesloft-drift-oauth-salesforce", "075-klue-oauth-salesforce-credential-lifecycle"]
status: published
version: "1.0"
og_lead_ja: "ConnectWise：ベンダーのアプリ ID が一部の顧客テナントで自らを管理者に昇格させた"
og_lead_en: "ConnectWise: a vendor's app identity granted itself Global Administrator in some customer tenants"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "ベンダーのアプリとして、\n顧客の Microsoft 365 に\nサインインされた。\n<accent>約 1,000 テナントで活動、300 超で成功</accent>"
og_headline_en: "Attackers signed in to customers' Microsoft 365 as a vendor's app.\n<accent>About 1,000 tenants, 300+ successful.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "~1,000"
    unit: "tenants"
    label: "Customer tenants with sign-in activity from the attacker's IP (300+ successful)"
    tone: "alert"
  - value: "10-14 → 10-17"
    label: "From discovery of the access to disabling the app identities. Self-granted admin rights in some tenants on the 15th, in between"
  - value: "7"
    unit: "app identities"
    label: "Disabled by ConnectWise. Three services, including Cloud Backup, suspended"
glossary:
  - term: "Tenant"
    desc: "An organisation's own environment in Microsoft 365 (Entra ID). Users, apps and permissions are managed per tenant."
  - term: "App identity (service principal)"
    desc: "An identity that lets an app, not a person, sign in to a tenant. It holds the permissions an administrator consented to, and whoever holds its credential can act with them."
  - term: "Token"
    desc: "A time-limited pass issued after authentication. Disabling an app may not stop tokens already issued until they expire."
insight:
  slug: "consent-reused-for-every-action"
  label: "Consent reused as the basis for every action"
  quote: "Consent given once at install was used as the basis for later administrative actions, without being checked each time they ran."
industries: ["supply-chain"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold app-identity actions until they are checked against the permitted scope"
  - slug: "audit-trail"
    item: "Record which permission each action relied on, separately from the app"
attack_method: "supply-chain"
impact: "Sign-in activity in about 1,000 tenants, more than 300 successful"
takeaway: "Nothing checked, before they ran, whether administrative actions by a consented app identity were ones the vendor intended."
self_check: "If a consented app granted itself administrator rights, could you stop it before it ran?"
first_step: "In the Entra ID admin centre, list the third-party apps consented in your tenant and the permissions each holds. If you use ConnectWise apps, check audit logs from 14 October for role assignments and added credentials."
---

## 1. TL;DR

In October 2026, credentials for ConnectWise applications, including Cloud Backup (formerly SkyKick), were abused to sign in to customers' Microsoft 365 tenants. Huntress reported sign-in activity from the attacker's IP in about 1,000 tenants, more than 300 of them successful. On the same day, in two customer tenants, the identity of another ConnectWise app made itself Global Administrator (Huntress does not tie this to the same attacker as the sign-ins). How the credential was exposed is unknown, and the incident is ongoing.

The attacker used no customer password; it authenticated as an app the customer's administrator had consented to. At authentication, the app's own action and another party's action using its credential look the same.

ConnectWise discovered the unauthorised access on 14 October, yet on the 15th, before the app identities were disabled on the 17th, the self-granted administrator rights went through. What did not work was a layer that checks independently, before it runs, whether an action by a consented app identity is one the vendor intended.

## 2. What happened

- **Scope of products**: ConnectWise's Cloud Backup (formerly SkyKick) and Cloud Management Microsoft 365 apps, installed with administrator consent in MSP and customer tenants.
- **Credential abuse**: the Cloud Backup app identity's credential was used to sign in to customer tenants (Huntress). No customer password was needed; tokens were obtained as the app.
- **Scale**: on 17 October Huntress reported attacker-IP sign-in activity in about 1,000 tenants, with more than 300 succeeding (162 tenants were confirmed as of the 16th). The credential works wherever the app is consented, so real exposure may be larger.
- **Self-granted admin rights**: on 15 October, in two customer tenants, the identity of Cloud Management's Microsoft Teams app made itself Global Administrator and added credentials to other apps.
- **ConnectWise response**: on 17 October it disabled seven app identities, revoked related certificates and suspended three services including Cloud Backup. Disabling does not reverse changes already made, and issued tokens may remain usable until they expire (company advisory).
- **Route in**: unknown. A product vulnerability "has not been established" (ConnectWise).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Events as far as disclosed</span></div>
<p class="rx-ex-cap">③ and ④ are actions by different apps, and Huntress does not tie them to the same attacker. Both went through on the basis of the consent at ①, unchecked.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Customer admin</div><div class="no">1</div><b>Consents to ConnectWise apps and grants permissions</b><p>Installed in MSP and customer tenants.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Obtains the Cloud Backup app identity's credential</b><p>Route unknown.</p></div>
<div class="rx-step crit"><div class="who">Cloud Management app identity</div><div class="no">3</div><b>On 10-15, makes itself Global Administrator</b><p>In two customer tenants, adds credentials to other apps.</p></div>
<div class="rx-step crit"><div class="who">Attacker's IP</div><div class="no">4</div><b>The same day, authenticates as the Cloud Backup app and works through tenants</b><p>Obtains tokens.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-14**: ConnectWise discovered the unauthorised access (company advisory).
- **2026-10-15**: at about 03:44 UTC, in one customer tenant, Cloud Management's Teams app made itself Global Administrator and added credentials to two apps. From 06:13 to 08:34 UTC, the attacker's IP authenticated as the Cloud Backup app.
- **2026-10-16**: Huntress published (162 tenants). ConnectWise published its advisory.
- **2026-10-17**: ConnectWise disabled seven app identities and suspended Cloud Backup. Microsoft Threat Intelligence posted a warning on X. Huntress reported about 1,000 tenants with activity.
- **2026-10-19**: Huntress confirmed the same self-granting of admin rights in a second customer tenant. Updates continued into 10-20; as of 00:45 UTC on 20 October, all three services remained suspended.

> Facts here rest on Huntress, a researcher publishing its own findings, and ConnectWise's official advisory. Unconfirmed: how the credential was exposed, whether a product vulnerability contributed, and whether the self-granted admin rights and the sign-ins were the same attacker. Huntress also monitors affected tenants, and its own app was targeted.

### After disclosure

- **Huntress**: recommended disabling the apps and reviewing credentials, roles and audit logs.
- **Todyl**: reported that tokens already issued can stay valid for up to 90 minutes after an app is disabled.

## 4. Why it wasn't stopped

The failure is neither weak customer passwords nor a mistake. An app credential gives its holder the app's permissions as they stand, and role assignment and credential additions went through with no check before they ran that they were operations the vendor intended.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof acts before an action runs; detection acts after an anomaly surfaces. In between, the app identity's actions are treated as legitimate, as consented.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check before it runs that the action is within the permitted scope</div>
<div class="rx-zone gapz"><b>The gap</b><span>The role grant went through.<br>The app identity is still live</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Spot the odd behaviour and disable the app</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>App identity holds consented permissions</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Self-assigned role goes through</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Anomaly spotted</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>App identities disabled</b></div>
</div>
</figure>

Detection worked: Huntress told the self-elevation apart using clues such as an unusual user agent. But it came after the action, and administrator grants went through until the apps were disabled. "The app was consented to" and "this action is one the vendor intends" are different facts: the first is recorded at install, the second must be checked each time. That distance is the **gap between detection and proof**, and it is a structural gap.

The same structure appears in [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/) (an "allow all" OAuth grant to an AI tool as the entry point) and [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (stolen OAuth tokens used to query over 700 Salesforce environments).

## 5. How to counter this

**Even if a vendor app's credential gets out, the customer side can narrow what it lets through.** Even without knowing how the credential was exposed, decide at install which actions each app identity may take, and hold actions that change permissions, such as role assignment or adding credentials, for a check before they run. Keep what was held and what was let through somewhere separate from the app.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: MSPs, and organisations that hand Microsoft 365 backup or management to an outside service. Backup and management SaaS often ask for tenant-wide permissions.
- **Operation · Accounts & permissions**: Managing the apps installed in a tenant and the permissions they hold. The actions here came not from a user but from a consented app identity.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| User multi-factor authentication (MFA) | Not relevant | The attacker used no user password; it authenticated as the app and obtained tokens. |
| Reviewing consent at install | Partial | Can narrow how broad the app's permissions are. Within them, any action passes for whoever holds the credential. |
| Monitoring sign-ins and audit logs | Partial | Huntress used a differing user agent as a clue, but that alone is not conclusive. It comes after the action, and directory reads leave no audit record. |
| Vendor disabling the app identities | Partial | Stops further authentication. Changes already made are not reversed, and issued tokens may remain usable until they expire. |

### What is needed

1. **Decide at install which actions an app identity may take.** For example, reading backup data is allowed; self-assigning directory roles or adding credentials to other apps is not. Decide by kind of action: the breadth of consented permissions alone does not draw this line.
2. **Hold permission-changing actions for a check before they run.** Check role assignments and credential additions from an app identity against the decided scope, and refuse those outside it. Also check, separately from the credential, that they came from the registered execution environment.
3. **Record which permission each action relied on, separately from the app.** Keep what was held and what was let through in a form you can later show a third party — that is, as proof.

### Checklist

Three things to confirm in your organisation about apps consented in your tenant

- Can you list the third-party apps consented in your tenant and the permissions each holds?
- When an app identity assigns itself a role or adds credentials to another app, who is notified?
- When a vendor discloses a compromise, is there a set procedure and owner for disabling that app and checking issued tokens, added credentials and assigned roles?

Note: this still fails if the registered execution environment itself is compromised, or if an action within the decided scope is misused, and a loosely decided scope passes loosely. Holding permission-changing actions for a check also delays the vendor's legitimate ones. How the credential was exposed has not yet been disclosed; this Brief will be revised if follow-up reports reveal it.

## 6. Sources

- **ConnectWise (Primary, company advisory)**: "Cloud Backup (formerly known as SkyKick) Service Interruption" (2026-10-16) — updated through 10-20 · <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence (Primary, post on X)**: Post on the compromise of the ConnectWise Cloud Backup OAuth app (2026-10-17) — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress (Primary, researcher's own publication)**: "Vendor credential enables unauthorized access" (2026-10-16) — updated through 10-19 · <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News (Independent reporting)**: "Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants" (2026-10-17) — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>
- **The Hacker News (Independent reporting)**: "ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants" (2026-10-18) — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl (Independent analysis)**: "Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App" (2026-10-16) — updated 10-19 · <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
