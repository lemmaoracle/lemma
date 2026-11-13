---
brief_no: 210
title: "電通デジタル TONARIWA：漏えいした認証情報による不正アクセスで管理アカウントの権限が広げられ、導入企業のエンドユーザーの個人情報が漏えいした(電通デジタルの第二報)"
title_en: "Dentsu Digital TONARIWA: Unauthorised access with leaked credentials widened an administrative account's permissions, and personal data of client companies' end users leaked (Dentsu Digital's second notice)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-11-10
published: 2026-11-13
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["204-ntt-data-stdirect-vendor-saas-admin-rights", "154-yumirlink-cuenote-support-credential-db-export"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-13
  rev: "b000be7b631ee4d5"
  ref: "https://github.com/lemmaoracle/lemma/pull/1164"
status: draft
version: "1.0"
og_lead_ja: "電通デジタルの TONARIWA で、漏えいした認証情報で管理アカウントに入られて権限が広げられ、導入企業 2 社の個人情報の漏えいが確認された"
og_lead_en: "At Dentsu Digital's TONARIWA, leaked credentials let a third party into an administrative account and widen its permissions, and leaks were confirmed at two client companies"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "漏れた認証情報で、\n管理アカウントの\n権限が広げられた。\n<accent>導入企業 2 社で漏えい</accent>"
og_headline_en: "With leaked credentials,\nan admin account's\npermissions were widened.\n<accent>Leaks at two client firms.</accent>"
key_figures:
  - value: "2"
    unit: "companies"
    label: "Client companies at which a leak of end users' personal data was confirmed (names and counts not disclosed; the count is still being determined; Dentsu Digital's second notice)"
    tone: "alert"
  - value: "11-10 → 11-12"
    label: "From Dentsu Digital confirming the unauthorised access and privilege escalation to its second notice disclosing that a leak was confirmed"
  - value: "c. 14:20"
    label: "Time on 11 November when Japan Post took its LINE account 'Yubinkyoku [Posukuma]' down for emergency maintenance"
glossary:
  - term: "TONARIWA"
    desc: "A marketing platform provided by Dentsu Digital. Japan Post used it to run surveys and manage responses on its LINE account 'Yubinkyoku [Posukuma]' (郵便局［ぽすくま］)."
  - term: "LINE Official Account integration token"
    desc: "In general, a key that an outside system uses to act as a LINE Official Account, for example to send messages. According to Dentsu Digital, TONARIWA's administrative account information includes access tokens for LINE Official Account integration, among other things."
insight:
  slug: "permission-widened-by-login-alone"
  stop: true
  label: "Admin permissions widened by a login alone"
  quote: "Before an administrative account's scope of operations is widened, check the change against the platform operator's record of approvals, kept apart from the credentials that were used."
industries: ["retail", "supply-chain"]
operations: ["account-admin", "delivery"]
controls:
  - slug: "limit-and-revoke"
    item: "Let changes to administrative account permissions through only after approval, hold client companies' LINE integration tokens with a narrow scope, and revoke them when a leak is suspected"
  - slug: "hold-unverified"
    item: "Hold, before execution, any permission change not tied to the record of approvals and any send not tied to a client company's sending plan"
  - slug: "audit-trail"
    item: "Record, apart from the platform, whose approval widened which account's permissions, and which client's plan each send rests on"
attack_method: "account-takeover"
impact: "At two client companies, a leak of end users' personal data (names, dates of birth, contact details and more) was confirmed (count still being determined; Dentsu Digital, as of 12 November). Administrative account information, including access tokens for LINE Official Account integration, is also in scope. Japan Post took its LINE account 'Yubinkyoku [Posukuma]' down"
takeaway: "A third party entered an administrative account with leaked credentials and widened its scope of operations. Being able to log in does not show that a permission change was approved. Check permission changes against the record of approvals before letting them through."
self_check: "On the platform you entrust with sending and customer management, do you know who approves, and through which approval, any widening of an administrative account's scope of operations?"
countries: ["jp"]
search_title: "電通デジタル TONARIWA 不正アクセスの経緯と対策"
search_description: "電通デジタルの TONARIWA で、漏えいした認証情報による不正アクセスと管理アカウントの権限昇格が確認され、導入企業 2 社で個人情報の漏えいが確認された（第二報）。日本郵便は LINE「郵便局［ぽすくま］」を止めた。経緯と対策を整理。"
---

## 1. Summary

On 10 November 2026, unauthorised access by a third party to an administrative account used in the system infrastructure of TONARIWA, the marketing platform provided by Dentsu Digital, was confirmed, together with privilege escalation (a widening of the scope of operations). According to Dentsu Digital's first notice (11 November), the access stemmed from leaked credentials. Possibly in scope are client companies' end users' names, dates of birth and contact details, and administrative account information including access tokens for LINE Official Account integration.

According to the second notice (12 November), logs showing data being taken out of part of the system infrastructure were found, and leaks of personal data were confirmed at two client companies. Their names and the number of records have not been disclosed; the count is still being determined. Dentsu Digital stopped and isolated all servers and is arranging the invalidation and reissue of LINE integration tokens. Japan Post, one client company, used TONARIWA for surveys and responses on its LINE account "Yubinkyoku [Posukuma]", and took the account down for emergency maintenance from about 14:20 on 11 November.

<strong>Where no separate approval is required, a change that widens an administrative account's scope of operations goes through on a login alone.</strong>

## 2. What got through

- **What got through**: A login to an administrative account used in TONARIWA's system infrastructure, and the widening of that account's scope of operations (privilege escalation). According to Dentsu Digital, the unauthorised access stemmed from leaked credentials. The second notice says logs showing data being taken out of part of the system infrastructure were found.
- **What reached the accepting side**: In general, an administrative function receives only a session holding valid credentials and the permission-change operation. It does not receive whether a platform operator approved the change. With widened permissions, the data of end users at several client companies, and the integration tokens that operate each company's LINE Official Account, can be reached.
- **Risk of sending**: In its first notice, Dentsu Digital said that because LINE Official Account integration data may have been included, it could not rule out the risk of unauthorised message sending by a third party. Nothing disclosed says unauthorised sending took place.
- **Not disclosed**: Where and how the credentials leaked. How the privileges were escalated and how far they reached. When, and how many times, data was taken out. How Dentsu Digital noticed on 10 November. The names of the two companies with confirmed leaks and the number of records. Whether Japan Post is one of the two. Whether integration tokens were actually taken.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an administrative account's scope of operations is widened, the change is checked against a record of approvals kept apart from the credentials used to log in.

- **Who approves**: The staff at Dentsu Digital, as platform operator, who approve permission changes. They set which account may perform which operations for how long, and issue approvals in a form the administrative account's credentials alone cannot produce. For sending, the client company that owns the LINE Official Account issues the sending plan.
- **Where it is checked**: First, the step at which the platform changes an administrative account's permissions. A change not tied to the record of approvals is held, and the account keeps its scope from before the change. Second, the step at which the platform sends from a client company's LINE Official Account. The send is checked as resting on a specific client's sending plan, and a send not tied to one is held. If integration tokens are taken and used without passing through the platform, this check is bypassed, so the scope in which tokens are held and the procedure for revoking them are needed separately.
- **What is recorded**: Whose approval widened which account's permissions, and when; and which client's plan each send rests on. These are kept apart from the platform, so client companies can check the impact on their own end users and LINE Official Accounts themselves.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a change against the record of approvals before an administrative account's scope of operations is widened, and keeping a record. Detection means noticing the unauthorised access and privilege escalation, revoking the credentials, and stopping and isolating all servers. Dates rely on the disclosures by Dentsu Digital and Japan Post.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a permission change against the record of approvals before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unauthorised access to an administrative account and privilege escalation<br>Personal data leaks at two client companies (count being determined)</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Credentials revoked, all servers stopped and isolated</div>
<div class="rx-g g1"><div class="t">11-10</div><b>Dentsu Digital confirms the unauthorised access and privilege escalation</b></div>
<div class="rx-g g2"><div class="t">11-11</div><b>Dentsu Digital publishes its first notice</b></div>
<div class="rx-g g3"><div class="t">11-11</div><b>Japan Post takes its LINE account down</b></div>
<div class="rx-g g4"><div class="t">11-12</div><b>Dentsu Digital discloses in its second notice that leaks are confirmed</b></div>
</div>
</figure>

Detection worked, and Dentsu Digital stopped and isolated all servers. Even so, the scope of the administrative account entered with leaked credentials had been widened, and leaks of personal data were confirmed at two client companies. Cases where administrator rights at a contractor's service read client companies' data include [NTT DATA STdirectServices](/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/) (administrator rights at the contractor's SaaS) and [Yumirlink](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/) (a delivery service's support staff credentials). Here, beyond the data, the integration tokens that operate client companies' LINE Official Accounts were also in scope.

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps at which the platform changes administrative account permissions and executes client companies' sends.** It does not look for unauthorised access; it checks, before execution, that a permission change rests on an approval and that a send rests on a client's plan.

### Industries and operations to watch

- **Industry · Services & retail**: Companies and organisations that run surveys, membership management and messaging on LINE Official Accounts. They entrust end users' names, dates of birth and contact details, and their LINE Official Account integration tokens, to an outside marketing platform.
- **Industry · Procurement & supply chain**: Companies that outsource the running of their LINE Official Accounts. One administrative account on the contractor's platform reaches several client companies' data and sending keys.
- **Operation · Accounts & permissions**: Granting, widening and revoking permissions on the platform's administrative accounts, and the scope and revocation of the integration tokens it holds.
- **Operation · Sending & delivery**: Sending messages to end users from client companies' LINE Official Accounts.

### Current controls vs Lemma

The route in this case is column 1 (widening the permissions of an administrative account entered with leaked credentials). Column 2 covers sends from the platform using widened permissions, and column 3 sends that bypass the platform using taken integration tokens; nothing disclosed says unauthorised sending happened in either case.

| Control | Widening permissions with leaked credentials | Sends from the platform with widened permissions | Sends bypassing the platform with taken integration tokens |
| --- | --- | --- | --- |
| Multi-factor authentication on administrative accounts | Partial | Partial | Not effective |
| Narrow scope for administrative account permissions | Partial | Partial | Not effective |
| Staff review before sending | Not effective | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Multi-factor authentication blocks a login with a password alone, but can be passed if the leaked credentials take the form of a session or a key. Narrowing permissions reduces what is reachable at first, but does not stop operations after the permissions have been escalated. Staff review before sending works for sends made from the platform's screens, but is passed where the side that widened the permissions can skip the review step altogether. Lemma checks, before execution, not whether the login is valid but whether a permission change and a send rest on an approval and a plan.

Note: Lemma's check works only when it is built into the platform's permission changes and send execution, and the record of approvals and client companies' sending plans are managed apart from the administrative account's credentials. If taken integration tokens are used to send directly on LINE's side, the send bypasses this check, and token scope and revocation are the answer. The check is also bypassed if the privilege escalation did not go through the permission-change procedure (for example, through a vulnerability). It can also pass if the credentials of the staff who issue approvals leak too. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, revoke tokens or recover data already taken.

### Checklist

Three things to confirm about LINE Official Accounts and end-user data entrusted to an outside platform

- Do you have your own procedure to revoke and reissue the LINE Official Account integration tokens you gave the outside platform?
- Do you record sends from the outside platform tied to your own sending plan, so you can check them yourself later?
- When the contractor reports a leak, can you identify the affected end users and fields from your own records?

## 5. Facts and timeline

- **Parties**: Dentsu Digital Inc. (provides the marketing platform TONARIWA) and its client companies. Japan Post has disclosed that it is a client company. According to Japan Post, it outsources part of the running of its LINE account "Yubinkyoku [Posukuma]" to Dentsu Digital and used TONARIWA to run surveys and manage responses.
- **What happened**: According to Dentsu Digital, on 10 November it confirmed that an administrative account used in TONARIWA's system infrastructure had been subject to unauthorised access by a third party stemming from leaked credentials, and to privilege escalation (a widening of the scope of operations). The second notice says logs showing data being taken out of part of the system infrastructure were found. The intrusion route and how the credentials leaked have not been disclosed.
- **Data**: According to Dentsu Digital, the scope covers end users' personal data handled by some client companies (attributes such as names, dates of birth and contact details) and TONARIWA's administrative account information (including access tokens for LINE Official Account integration). Payment-related data such as credit card and bank account details is not included. As of the second notice (12 November), leaks of personal data had been confirmed at two client companies, and the count is still being determined. Other client companies are being checked, and each will be contacted individually whether or not it is affected.
- **Impact**: Dentsu Digital says no misuse or abuse has been confirmed. Its first notice said that because LINE Official Account integration data may have been included, the risk of unauthorised message sending by a third party could not be ruled out. Japan Post says no illicit acquisition or misuse of the data has been confirmed, and took "Yubinkyoku [Posukuma]" down for emergency maintenance from about 14:20 on 11 November. No date for resumption has been given.
- **How it was found**: Dentsu Digital confirmed the unauthorised access and privilege escalation on 10 November. How it noticed has not been disclosed. Japan Post says it was contacted by Dentsu Digital.

### Timeline

- **2026-11-10**: Dentsu Digital confirms unauthorised access to a TONARIWA administrative account and privilege escalation.
- **2026-11-11**: In its first notice, Dentsu Digital discloses the suspension of TONARIWA and the possible leak of personal data and LINE integration tokens.
- **2026-11-11**: Japan Post takes "Yubinkyoku [Posukuma]" down for emergency maintenance from about 14:20 and discloses the unauthorised access to its contractor's platform.
- **2026-11-12**: In its second notice, Dentsu Digital discloses that leaks of personal data are confirmed at two client companies.

> The facts rely on Dentsu Digital's first and second notices and Japan Post's two disclosures (all primary). Dentsu Digital does not name its client companies, and whether Japan Post is one of the two companies with confirmed leaks cannot be read from either company's disclosures. No other disclosure by a TONARIWA client company has been confirmed. When the service was suspended, how the credentials leaked, how the privileges were escalated and whether integration tokens were actually taken have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses. Written as of 13 November.

### After disclosure

- **Dentsu Digital**: Revoked the credentials used in the unauthorised access, cut off the communication route, and stopped all servers to isolate the system. It has engaged an outside forensic investigator to analyse logs, and is contacting the client companies with confirmed leaks individually and coordinating towards a report to the Personal Information Protection Commission. It is arranging the invalidation and reissue of LINE-related credentials (including integration tokens) and will advise client companies individually on any steps they need to take. It says detailed investigation and recurrence prevention may take several months, and is building support that includes moving to an alternative environment or a successor system.
- **Japan Post**: Asks users to use its website while "Yubinkyoku [Posukuma]" is down, and says it will post any new information there.

## 6. Sources

- **Dentsu Digital (Primary, company disclosure)**: 「【第二報】当社が提供する「TONARIWA」における不正アクセスに伴う個人情報漏えいに関するお詫びとご報告」 (2026-11-12) — <https://www.dentsudigital.co.jp/news/updates/services/2026-1112-001112>
- **Dentsu Digital (Primary, company disclosure)**: 「当社が提供する「TONARIWA」における不正アクセスに伴う個人情報漏えいの可能性に関するお詫びとご報告」 (2026-11-11) — <https://www.dentsudigital.co.jp/news/updates/services/2026-1111-001111>
- **Japan Post (Primary, client company disclosure)**: 「LINEアカウント「郵便局［ぽすくま］」で利用する委託先のマーケティングプラットフォームにおける不正アクセスによる情報漏えいのおそれについて」 (2026-11-11) — <https://www.post.japanpost.jp/newsrelease/pressrelease/685401036.html>
- **Japan Post (Primary, client company disclosure)**: 「LINEアカウント「郵便局［ぽすくま］」の緊急メンテナンスのお知らせ」 (2026-11-11) — <https://www.post.japanpost.jp/newsrelease/pressrelease/1878079375.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
