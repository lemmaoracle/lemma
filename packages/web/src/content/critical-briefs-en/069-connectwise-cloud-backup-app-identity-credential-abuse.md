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
industries: ["supply-chain"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold app-identity actions until they are checked against the permitted scope"
  - slug: "audit-trail"
    item: "Record which permission each action relied on, separately from the app"
attack_method: "supply-chain"
impact: "Sign-in activity in about 1,000 tenants, more than 300 successful"
---

## 1. TL;DR

In October 2026, credentials for ConnectWise applications, including Cloud Backup (formerly SkyKick), were abused to sign in to customers' Microsoft 365 (Entra ID) tenants. Huntress reported sign-in activity from the attacker's IP in about 1,000 tenants, more than 300 of them successful. On the same day, in some tenants, ConnectWise Cloud Management app identities granted themselves Global Administrator and added client secrets to other apps (Huntress does not tie this to the same attacker as the sign-ins). On 17 October ConnectWise disabled seven application identities and suspended Cloud Backup. How the credential was exposed is unknown, and the incident is ongoing.

The anomaly was noticed. ConnectWise discovered the unauthorised access on 14 October, and Huntress saw the behaviour in tenants it monitors. But the app identities were disabled only on 17 October, and on the 15th, in between, app identities still granted themselves administrator rights. <strong>What did not work was a layer that checks, before it runs, whether an action by a customer-consented app identity is one the vendor intended.</strong>

## 2. What happened

- **Scope of products**: ConnectWise Cloud Backup (formerly SkyKick) and ConnectWise Cloud Management Microsoft 365 apps, installed with administrator consent in MSP and customer tenants.
- **Credential abuse**: per Huntress, a Cloud Backup app credential (a client assertion) was used to sign in to customer tenants. No customer password was needed; the attacker authenticated as the app and obtained tokens from Microsoft Entra ID.
- **Scale**: Huntress confirmed unauthorised sign-ins in 162 tenants on 16 October and 173 later. On 17 October it reported attacker-IP sign-in activity in about 1,000 tenants, with more than 300 succeeding. The credential works wherever the app is consented, so real exposure may be larger.
- **Second wave**: a targeted attempt against 16 tenants in policy, national security, trade and critical minerals most failed because the app was not installed.
- **ConnectWise response**: at 07:00 UTC on 17 October it disabled seven application identities, revoked related certificates and suspended Cloud Backup; SaaS Security and Cloud Management, which integrate with Cloud Backup, were suspended as a precaution. It said disabling does not reverse changes already made inside a tenant, and that previously issued access tokens may remain usable until they expire (company advisory).
- **Microsoft's view**: in a post on X on 17 October, Microsoft Threat Intelligence called it an "active supply chain attack" through a compromised trusted OAuth app. As reported by THN, it also pointed to abuse of permissions customers had granted, such as `Directory.ReadWrite.All`.

The chain was as follows.

1. Tenant administrators had consented to ConnectWise apps and granted them permissions.
2. By some route, the Cloud Backup app identity's credential reached an attacker (route unknown).
3. From 01:58 UTC on 15 October, in some tenants, Cloud Management app identities assigned themselves directory roles; in one customer tenant one became Global Administrator and added credentials to other apps.
4. From 06:13 UTC the same day, the attacker's IP authenticated as the Cloud Backup app, obtained Graph tokens and worked through tenants in sequence.

Huntress does not tie step 3 to the same attacker as step 4.

The irreversible actions were steps 3 and 4. Their basis was the consent an administrator once gave the app, and no published account shows that, at the time of each action, a customer could check whether it was the vendor's intended operation or who was running it.

## 3. Timeline — disclosure and response

- **13–14 October 2026**: password spraying from one IP against four law-firm tenants (no successful user sign-ins seen).
- **14 October**: ConnectWise discovered the unauthorised access (company advisory).
- **15 October**: from 01:58 UTC, ConnectWise Cloud Management service principals assigned themselves directory roles in about 50 monitored tenants. At 03:44–03:49 in one tenant, the ConnectWise Cloud Management MS Teams app became Global Administrator and a Python script added client secrets to two other apps. From 06:13 to 08:34 the same IP authenticated as the app and obtained Graph tokens.
- **16 October**: Huntress published; 162 tenants confirmed. ConnectWise published its advisory (17:47 UTC). Huntress removed an unauthorised credential from its own app in a partner tenant.
- **17 October**: ConnectWise began containment at 05:00 UTC and at 07:00 disabled seven application identities and suspended Cloud Backup. Microsoft Threat Intelligence posted a warning on X. Huntress reported about 1,000 tenants with activity.
- **19–20 October**: Huntress and ConnectWise continued to update. As of ConnectWise's update at 00:45 UTC on 20 October, all three services remained suspended.

> Facts here rest on Huntress, a researcher publishing its own findings, and ConnectWise's official advisory. Microsoft's view rests on its Threat Intelligence post on X and The Hacker News. Unconfirmed or unknown: how the credential was exposed; whether a product vulnerability contributed (ConnectWise says this "has not been established"); whether the role self-assignment was run by the same attacker as the sign-ins (Huntress does not link them). Graph directory reads leave no audit record, so access cannot be ruled out.

## 4. Why it wasn't stopped

The failure is neither weak customer passwords nor a customer mistake. An app identity customers had consented to authenticated as the app and carried out administrative actions, role assignment and credential addition, with no check, before they ran, that they were the vendor's intended operations.

That is the **gap between detection and proof**. The anomaly was noticed. ConnectWise discovered the access on 14 October, and Huntress told the self-elevation apart partly by user agent (Python-urllib rather than the vendor's .NET SDK). But even after that, administrator grants went through until the apps were disabled. What failed sits before that. An app credential gives its holder the app's permissions as they stand. From the customer's side, the app's own action and another party's action using its credential are indistinguishable at authentication.

The response also works afterwards. Disabling the apps and Huntress's recommendations (disable apps, review credentials, roles and audit logs) are necessary but act after the actions ran. Todyl reports that tokens already issued can stay valid for up to 90 minutes after an app is disabled. ConnectWise likewise says issued tokens may remain usable until they expire.

The same structure appears in earlier Briefs. In [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/), an "allow all" OAuth grant to an AI tool was the entry point. In [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/), stolen OAuth tokens queried over 700 Salesforce environments. In each, a consented non-human identity was used with no independent check directly before the action.

> "The app was consented to" and "this action is one the app intends" are different facts. The first is recorded at install; the second must be checked each time.

## 5. What proof would have changed

A single step could sit directly before each app-identity action: confirming that the action lies within the scope permitted for that app and comes from the registered executing party. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Registered action scope**: register, at install, the kinds of actions each app identity may perform as issuer-signed proof (for example, reading backup data allowed; self-assigning directory roles or adding credentials to other apps not allowed), and check each action against it before it runs.
- **Proof of executing party**: beyond the credential, make it checkable per action that the call came from the registered execution environment.
- **Independent record**: keep which permission an action relied on, and what was done, as a record separate from the app's own actions, so it can be audited later.

</ul>

This differs from after-the-fact detection and disabling apps. The detection layer and this layer are complementary, not substitutes: the former notices anomalies, the latter lets an action beyond permission be checked before it runs.

Note: the proof shows only that an action lies within the registered scope and comes from the registered party. It passes when the registered environment itself is compromised or when an in-scope action is misused, and a loosely registered scope passes loosely.

## 6. Sources

- **ConnectWise (primary, company advisory)**: Cloud Backup (formerly known as SkyKick) Service Interruption (2026-10-16, updated through 10-20) — <https://www.connectwise.com/company/trust/advisories>
- **Microsoft Threat Intelligence (primary, post on X)**: post on the compromise of the ConnectWise Cloud Backup OAuth app (2026-10-17) — <https://x.com/MsftSecIntel/status/2111358888125878426>
- **Huntress (primary, researcher's own publication)**: Vendor credential enables unauthorized access (published 2026-10-16, updated through 10-19) — <https://www.huntress.com/blog/vendor-credential-enables-unauthorized-access>
- **The Hacker News (independent reporting)**: ConnectWise Suspends Cloud Backup After Attackers Compromise Microsoft 365 Tenants (2026-10-18) — <https://thehackernews.com/2026/10/connectwise-suspends-cloud-backup-after.html>
- **Todyl (independent analysis)**: Investigation: Unauthorized Access Through the ConnectWise Cloud Backup Microsoft 365 App (2026-10-16, updated 10-19) — <https://www.todyl.com/blog/investigation-unauthorized-access-through-the-connectwise-cloud-backup-microsoft-365-app>
- **The Hacker News (independent reporting)**: Hackers Use Compromised ConnectWise Credential to Sign In to 173 Microsoft 365 Tenants (2026-10-17) — <https://thehackernews.com/2026/10/hackers-use-compromised-connectwise.html>

Huntress is both the researcher and a party monitoring affected tenants, and its own app was also targeted. ConnectWise keeps updating its advisory on the same Trust Center page; what is cited here is as of its update at 00:45 UTC on 20 October. Microsoft's point about `Directory.ReadWrite.All` rests on THN's report.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/).
