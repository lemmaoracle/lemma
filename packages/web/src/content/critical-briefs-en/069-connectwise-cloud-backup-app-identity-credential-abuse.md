---
brief_no: 69
title: "ConnectWise：ベンダーのアプリ資格情報が悪用されて顧客の Microsoft 365 テナントにサインインされ、同じ日にアプリ ID による管理者権限の自己付与も確認された(Huntress 調査・ConnectWise 発表) — 同意済みのアプリ ID による操作を、実行の前に「ベンダーが意図した操作か」確かめる層が無い"
title_en: "ConnectWise: A vendor's app credential was abused to sign in to customer Microsoft 365 tenants, and on the same day app identities were seen granting themselves Global Administrator (Huntress research, ConnectWise advisory) — No layer checks, before it runs, whether an action by a consented app identity is one the vendor intended"
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
og_lead_ja: "ConnectWise：ベンダーのアプリ ID が顧客テナントで自らを管理者に昇格させた"
og_lead_en: "ConnectWise: a vendor's app identity granted itself Global Administrator in customer tenants"
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
    label: "From discovery of the access to disabling the app identities. Self-granted admin rights on the 15th, in between"
  - value: "7"
    unit: "app identities"
    label: "Disabled by ConnectWise. Three services, including Cloud Backup, suspended"
glossary:
  - term: "Tenant"
    desc: "An organisation's own environment in Microsoft 365 (Entra ID). Users, apps and permissions are managed per tenant."
  - term: "App identity (service principal)"
    desc: "An identity that lets an app, not a person, sign in to a tenant. It holds the permissions an administrator consented to, and whoever holds its credential can act with them."
  - term: "Client assertion"
    desc: "A credential an app presents to prove it is itself, signed with a certificate key. No user password is involved."
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
---

## 1. TL;DR

In October 2026, credentials for ConnectWise applications, including Cloud Backup (formerly SkyKick), were abused to sign in to customers' Microsoft 365 (Entra ID) tenants. Huntress reported sign-in activity from the attacker's IP in about 1,000 tenants, more than 300 of them successful. On the same day, in some tenants, ConnectWise Cloud Management app identities granted themselves Global Administrator and added client secrets to other apps (Huntress does not tie this to the same attacker as the sign-ins). On 17 October ConnectWise disabled seven application identities and suspended Cloud Backup. How the credential was exposed is unknown, and the incident is ongoing.

The attacker used no customer password. It authenticated as an app the customer's administrator had consented to and obtained tokens from Microsoft Entra ID. From the customer's side, the app's own action and another party's action using its credential are indistinguishable at authentication.

The anomaly was noticed. ConnectWise discovered the unauthorised access on 14 October, and Huntress saw the behaviour in tenants it monitors. But the app identities were disabled only on 17 October, and on the 15th, in between, app identities still granted themselves administrator rights. What did not work was a layer that checks, before it runs, whether an action by a customer-consented app identity is one the vendor intended.

## 2. What happened

- **Scope of products**: ConnectWise Cloud Backup (formerly SkyKick) and ConnectWise Cloud Management Microsoft 365 apps, installed with administrator consent in MSP and customer tenants.
- **Credential abuse**: per Huntress, a Cloud Backup app credential (a client assertion) was used to sign in to customer tenants. No customer password was needed; the attacker authenticated as the app and obtained tokens from Microsoft Entra ID.
- **Scale**: Huntress confirmed unauthorised sign-ins in 162 tenants on 16 October and 173 later. On 17 October it reported attacker-IP sign-in activity in about 1,000 tenants, with more than 300 succeeding. The credential works wherever the app is consented, so real exposure may be larger.
- **Second wave**: a targeted attempt against 16 tenants in policy, national security, trade and critical minerals mostly failed because the app was not installed.
- **ConnectWise response**: at 07:00 UTC on 17 October it disabled seven application identities, revoked related certificates and suspended Cloud Backup; SaaS Security and Cloud Management, which integrate with Cloud Backup, were suspended as a precaution. It said disabling does not reverse changes already made inside a tenant, and that previously issued access tokens may remain usable until they expire (company advisory).
- **Microsoft's view**: in a post on X on 17 October, Microsoft Threat Intelligence called it an "active supply chain attack" through a compromised trusted OAuth app. As reported by THN, it also pointed to abuse of permissions customers had granted, such as `Directory.ReadWrite.All`.
- **Route in**: how the credential reached the attacker is unknown. ConnectWise says a product vulnerability "has not been established".

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The irreversible steps were ③ and ④. Their basis was the consent at ①, and no published account shows a way for the customer to check, at the moment of each action, whether it was one the vendor intended. Huntress does not tie ③ to the same attacker as ④.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Customer admin</div><div class="no">1</div><b>Consents to ConnectWise apps and grants permissions</b><p>Installed in MSP and customer tenants.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Obtains the Cloud Backup app identity's credential</b><p>Route unknown.</p></div>
<div class="rx-step crit"><div class="who">App identity</div><div class="no">3</div><b>From 01:58 UTC on 10-15, assigns itself roles</b><p>In one customer tenant it becomes Global Administrator and adds credentials to other apps.</p></div>
<div class="rx-step crit"><div class="who">Attacker's IP</div><div class="no">4</div><b>From 06:13 UTC on 10-15, authenticates as the app and works through tenants</b><p>Obtains Graph tokens. Activity in about 1,000 tenants, 300+ successful.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **13–14 October 2026**: password spraying from one IP against four law-firm tenants (no successful user sign-ins seen).
- **14 October**: ConnectWise discovered the unauthorised access (company advisory).
- **15 October**: from 01:58 UTC, ConnectWise Cloud Management service principals assigned themselves directory roles in about 50 monitored tenants. At 03:44–03:49 in one tenant, the ConnectWise Cloud Management MS Teams app became Global Administrator and a Python script added client secrets to two other apps. From 06:13 to 08:34 the same IP authenticated as the app and obtained Graph tokens.
- **16 October**: Huntress published; 162 tenants confirmed. ConnectWise published its advisory (17:47 UTC). Huntress removed an unauthorised credential from its own app in a partner tenant.
- **17 October**: ConnectWise began containment at 05:00 UTC and at 07:00 disabled seven application identities and suspended Cloud Backup. Microsoft Threat Intelligence posted a warning on X. Huntress reported about 1,000 tenants with activity.
- **19–20 October**: Huntress and ConnectWise continued to update. As of ConnectWise's update at 00:45 UTC on 20 October, all three services remained suspended.

> Facts here rest on Huntress, a researcher publishing its own findings, and ConnectWise's official advisory. Microsoft's view rests on its Threat Intelligence post on X and The Hacker News; the point about `Directory.ReadWrite.All` rests on THN's report. Unconfirmed or unknown: how the credential was exposed; whether a product vulnerability contributed (ConnectWise says this "has not been established"); whether the role self-assignment was run by the same attacker as the sign-ins (Huntress does not link them). Graph directory reads leave no audit record, so access cannot be ruled out. Huntress is both the researcher and a party monitoring affected tenants, and its own app was also targeted. ConnectWise keeps updating its advisory on the same page; what is cited here is as of its update at 00:45 UTC on 20 October.

### After disclosure

- **ConnectWise**: disabled the app identities, revoked related certificates and suspended Cloud Backup, SaaS Security and Cloud Management. It says disabling does not reverse changes already made, and issued tokens may remain usable until they expire.
- **Huntress**: recommended disabling the apps and reviewing credentials, roles and audit logs. In a partner tenant it removed an unauthorised credential added to its own app.
- **Todyl**: reported that tokens already issued can stay valid for up to 90 minutes after an app is disabled.

## 4. Why it wasn't stopped

The failure is neither weak customer passwords nor a customer mistake. An app identity customers had consented to authenticated as the app and carried out administrative actions, role assignment and credential addition, with no check, before they ran, that they were the vendor's intended operations.

The anomaly was noticed. ConnectWise discovered the access on 14 October, and Huntress told the self-elevation apart partly by user agent (Python-urllib rather than the vendor's .NET SDK). But even after that, administrator grants went through until the apps were disabled. What failed sits before that. An app credential gives its holder the app's permissions as they stand. From the customer's side, the app's own action and another party's action using its credential are indistinguishable at authentication.

The response also works afterwards. Disabling the apps and Huntress's recommendations (disable apps, review credentials, roles and audit logs) are necessary but act after the actions ran. Todyl reports that tokens already issued can stay valid for up to 90 minutes after an app is disabled. ConnectWise likewise says issued tokens may remain usable until they expire.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof acts before an action runs; detection acts after an anomaly surfaces. In between, the app identity's actions are treated as legitimate, as consented.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check before it runs that the action is within the permitted scope</div>
<div class="rx-zone gapz"><b>The gap</b><span>The role grant went through.<br>The app identity is still live</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Spot the odd behaviour and disable the app</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Authenticates as the app</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Self-assigned role goes through</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Anomaly spotted</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>App identities disabled</b></div>
</div>
</figure>

"The app was consented to" and "this action is one the app intends" are different facts. The first is recorded at install; the second must be checked each time. That distance is what this Brief calls the **gap between detection and proof**, and it is a structural gap.

The same structure appears in earlier Briefs. In [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/), an "allow all" OAuth grant to an AI tool was the entry point. In [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/), stolen OAuth tokens queried over 700 Salesforce environments. In each, a consented non-human identity was used with no independent check directly before the action.

## 5. How to counter this

**Even if a vendor app's credential gets out, the customer side can narrow what it lets through.** Without knowing how the credential was exposed, there are things to check from today. Decide at install which actions each app identity may take, and hold actions that change permissions, such as role assignment or adding credentials, for a check before they run. Keep what was held and what was let through somewhere separate from the app.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: MSPs, and organisations that hand Microsoft 365 backup or management to an outside service. Vendor apps are sometimes consented to with tenant-wide permissions.
- **Operation · Accounts & permissions**: Managing the apps installed in a tenant and the permissions they hold. The actions here came not from a user but from a consented app identity.

The same hole exists in many organisations that entrust tenant permissions to outside services. Backup, security and management SaaS ask for broad permissions by the nature of the job. Once consent is given, often no one, on either the customer's or the vendor's side, has the job of checking each later action.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| User multi-factor authentication (MFA) | Not relevant | The attacker used no user password; it authenticated as the app and obtained tokens. |
| Reviewing consent at install | Partial | Can narrow how broad the app's permissions are. Within them, any action passes for whoever holds the credential. |
| Monitoring sign-ins and audit logs | Partial | Huntress spotted the self-elevation by its user agent. But that comes after the action, and Graph directory reads leave no audit record. |
| Vendor disabling the app identities | Partial | Stops further authentication. Changes already made are not reversed, and issued tokens may remain usable until they expire. |

### What is needed

1. **Decide at install which actions an app identity may take.** For example, reading backup data is allowed; self-assigning directory roles or adding credentials to other apps is not. Decide by kind of action; the breadth of consented permissions alone does not draw this line.
2. **Hold permission-changing actions for a check before they run.** When a role assignment or credential addition comes from an app identity, check it against the decided scope and refuse it if it falls outside. Also check, separately from the credential, that it came from the registered execution environment.
3. **Record which permission each action relied on, separately from the app.** Keep what was held and what was let through somewhere apart from the app's own records, in a form you can later show a third party — that is, as proof.

### Checklist

Three things to confirm in your organisation about apps consented in your tenant

- Can you list the third-party apps consented in your tenant and the permissions each holds?
- When an app identity assigns itself a role or adds credentials to another app, who is notified?
- When a vendor discloses a compromise, is there a set procedure and owner for disabling that app and checking issued tokens, added credentials and assigned roles?

Note: this still fails if the registered execution environment itself is compromised, or if an action within the decided scope is misused, and a loosely decided scope passes loosely. Holding permission-changing actions for a check also delays the vendor's legitimate ones.

## 6. Sources

- **ConnectWise (Primary, company advisory)**: "Cloud Backup (formerly known as SkyKick) Service Interruption" (2026-10-16) — updated through 10-20 · <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence (Primary, post on X)**: Post on the compromise of the ConnectWise Cloud Backup OAuth app (2026-10-17) — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress (Primary, researcher's own publication)**: "Vendor credential enables unauthorized access" (2026-10-16) — updated through 10-19 · <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News (Independent reporting)**: "ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants" (2026-10-18) — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl (Independent analysis)**: "Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App" (2026-10-16) — updated 10-19 · <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>
- **The Hacker News (Independent reporting)**: "Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants" (2026-10-17) — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
