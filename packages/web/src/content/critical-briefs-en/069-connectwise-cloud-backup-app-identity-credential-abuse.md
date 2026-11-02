---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用されて顧客の Microsoft 365 テナントにサインインされ、同じ日にアプリ ID による管理者権限の自己付与も確認された(Huntress 調査・ConnectWise 発表)"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants, and on the same day an app identity was seen granting itself Global Administrator in some tenants (Huntress research, ConnectWise advisory)"
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
sections: "proof"
gate: "permission-change"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "ベンダーのアプリとして、\n顧客の Microsoft 365 に\nサインインされた。\n<accent>約 1,000 テナントで活動、300 超で成功</accent>"
og_headline_en: "Attackers signed in to customers' Microsoft 365 as a vendor's app.\n<accent>About 1,000 tenants, 300+ successful.</accent>"
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
  quote: "Consent given once to an app cannot tell whether an action by whoever holds that app identity's credential is one the vendor intended."
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
self_check: "Do you know which apps you have installed, and what permissions each one holds?"
countries: ["us"]
---

## 1. Summary

The attacker used no customer password; it authenticated as an app a customer's administrator had consented to. How the credential was exposed is unknown, and the incident is ongoing (as of 20 October 2026). On the same day, in two customer tenants, the identity of another ConnectWise app made itself Global Administrator (Huntress does not tie it to the same attacker as the sign-ins). <strong>Consent given once to an app cannot tell whether an action by whoever holds that app identity's credential is one the vendor intended.</strong>

## 2. What got through

- **What got through**: Authentication as a consented app identity (signing in to customer tenants with the Cloud Backup app identity's credential), and an app identity making itself Global Administrator and adding credentials to other apps (Cloud Management's Teams app, on 15 October, in two customer tenants).
- **What was stopped**: Authentication after ConnectWise disabled seven app identities on 17 October. Changes already made are not reversed, and issued tokens may remain usable until they expire (ConnectWise advisory).
- **What reached the receiving side**: In general, authentication with an app identity's credential needs no customer password and arrives as a legitimate action by the app, within the permissions the app holds. At the time of authentication it cannot be told apart from an action by another party that holds the credential.
- **Not disclosed**: How the credential was exposed (unknown), whether a product vulnerability contributed ("has not been established", per ConnectWise), and whether the self-granted admin rights and the sign-ins were the same attacker.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever accepts an app identity's actions checks, before the action runs and separately from the credential, that it is a kind of action allowed at install.

- **Who approves**: The tenant administrator (the installing side). At install, decide by kind of action what an app identity may do: for example, reading backup data is allowed; self-assigning directory roles or adding credentials to other apps is not. The breadth of consented permissions alone does not draw this line.
- **Where it is checked**: The part of the tenant that accepts administrative actions. Actions that change permissions, such as role assignment or adding credentials, are checked against the decided scope and refused if outside it. Whether they came from the registered execution environment is also checked, separately from the credential.
- **What is recorded**: Which permission each action relied on. What was held and what was let through is kept apart from the app, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an app identity's action runs, whether it falls within the scope allowed, and keeping a record. Detection means noticing a difference in behaviour after the action. The dates below are those given in the ConnectWise and Huntress disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before it runs, check that the action is within the allowed scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Sign-in activity in about 1,000 tenants<br>Admin rights self-granted in two customer tenants</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>Spot the odd behaviour and disable the app identities</div>
<div class="rx-g g1"><div class="t">10-14</div><b>ConnectWise discovers the access</b></div>
<div class="rx-g g2"><div class="t">10-15</div><b>An app identity self-grants admin rights</b></div>
<div class="rx-g g3"><div class="t">10-16</div><b>Huntress and ConnectWise disclose</b></div>
<div class="rx-g g4"><div class="t">10-17</div><b>Seven app identities disabled</b></div>
</div>
</figure>

Detection worked: Huntress told the self-elevation apart using clues such as an unusual user agent. But it came after the action, and administrator grants went through until the apps were disabled. Similar cases, where a consented app or OAuth token was the way in, are [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/) (an "allow all" OAuth grant to an AI tool as the entry point) and [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (stolen OAuth tokens used to query over 700 Salesforce environments).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side of the tenant that accepts administrative actions.** It does not look for intrusions; it checks, before the action runs, whether an app identity's action falls within the kinds allowed at install.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: MSPs, and organisations that hand Microsoft 365 backup or management to an outside service. Backup and management SaaS often ask for tenant-wide permissions.
- **Operation · Accounts & permissions**: Managing the apps installed in a tenant and the permissions they hold. The actions here came not from a user but from a consented app identity.

### Current controls vs Lemma

The route in this case is column 1 (authentication as a consented app identity) and column 2 (an app identity's permission-changing actions). Column 3 is where an action within the allowed scope is misused; whether that applied here has not been disclosed.

| Control | Authentication as a consented app identity | An app identity's permission-changing actions | Misuse of an action within the allowed scope |
| --- | --- | --- | --- |
| User multi-factor authentication (MFA) | Not relevant | Not relevant | Not relevant |
| Reviewing consent at install | Not relevant | Partial | Not effective |
| Monitoring sign-ins and audit logs | Partial | Partial | Partial |
| Vendor disabling the app identities | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Partial | Effective | Not effective |

MFA is not relevant to this route: the attacker used no user password; it authenticated as the app and obtained tokens. Reviewing consent can narrow how broad the app's permissions are, but within them any action passes for whoever holds the credential. Monitoring: Huntress used a differing user agent as a clue, but that alone is not conclusive; it comes after the action, and directory reads leave no audit record. Disabling stops further authentication, but changes already made are not reversed and issued tokens may remain usable until they expire. Lemma checks permission-changing actions against the allowed scope before they run.

Note: Lemma's check works only when the allowed actions for each app identity are decided by kind, the check is built into the part of the tenant that accepts administrative actions, and information on the registered execution environment is managed separately from the credential. It passes if the registered execution environment itself is compromised, or if an action within the decided scope is misused, and a loosely decided scope passes loosely. Holding permission-changing actions for a check also delays the vendor's legitimate ones. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about apps consented in your tenant

- Do you regularly review for apps no longer in use, or permissions broader than needed?
- When an app identity assigns itself a role or adds credentials to another app, who is notified?
- When a vendor discloses a compromise, is there a set procedure and owner for disabling that app and checking issued tokens, added credentials and assigned roles?

## 5. Facts and timeline

- **Scope of products**: ConnectWise's Cloud Backup (formerly SkyKick) and Cloud Management Microsoft 365 apps, installed with administrator consent in MSP and customer tenants.
- **Credential abuse**: the Cloud Backup app identity's credential was used to sign in to customer tenants (Huntress). No customer password was needed; tokens were obtained as the app.
- **Scale**: on 17 October Huntress reported attacker-IP sign-in activity in about 1,000 tenants, with more than 300 succeeding (162 tenants were confirmed as of the 16th). The credential works wherever the app is consented, so real exposure may be larger.
- **Self-granted admin rights**: on 15 October, in two customer tenants, the identity of Cloud Management's Microsoft Teams app made itself Global Administrator and added credentials to other apps.
- **ConnectWise response**: on 17 October it disabled seven app identities, revoked related certificates and suspended three services including Cloud Backup. Disabling does not reverse changes already made, and issued tokens may remain usable until they expire (company advisory).
- **Route in**: unknown. A product vulnerability "has not been established" (ConnectWise).

### Timeline

- **2026-10-14**: ConnectWise discovered the unauthorised access (company advisory).
- **2026-10-15**: at about 03:44 UTC, in one customer tenant, Cloud Management's Teams app made itself Global Administrator and added credentials to two apps. From 06:13 to 08:34 UTC, the attacker's IP authenticated as the Cloud Backup app.
- **2026-10-16**: Huntress published (162 tenants). ConnectWise published its advisory.
- **2026-10-17**: ConnectWise disabled seven app identities and suspended Cloud Backup. Microsoft Threat Intelligence posted a warning on X. Huntress reported about 1,000 tenants with activity.
- **2026-10-19**: Huntress confirmed the same self-granting of admin rights in a second customer tenant. Updates continued into 10-20; as of 00:45 UTC on 20 October, all three services remained suspended.

> Facts here rest on Huntress, a researcher publishing its own findings, and ConnectWise's official advisory. Unconfirmed: how the credential was exposed, whether a product vulnerability contributed, and whether the self-granted admin rights and the sign-ins were the same attacker. Huntress also monitors affected tenants, and its own app was targeted. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Huntress**: recommended disabling the apps and reviewing credentials, roles and audit logs.
- **Todyl**: reported that tokens already issued can stay valid for up to 90 minutes after an app is disabled.

## 6. Sources

- **ConnectWise (Primary, company advisory)**: "Cloud Backup (formerly known as SkyKick) Service Interruption" (2026-10-16) — updated through 10-20 · <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence (Primary, post on X)**: Post on the compromise of the ConnectWise Cloud Backup OAuth app (2026-10-17) — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress (Primary, researcher's own publication)**: "Vendor credential enables unauthorized access" (2026-10-16) — updated through 10-19 · <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News (Independent reporting)**: "Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants" (2026-10-17) — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>
- **The Hacker News (Independent reporting)**: "ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants" (2026-10-18) — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl (Independent analysis)**: "Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App" (2026-10-16) — updated 10-19 · <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>

References: [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
