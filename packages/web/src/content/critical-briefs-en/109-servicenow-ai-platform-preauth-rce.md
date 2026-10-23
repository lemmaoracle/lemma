---
brief_no: 109
title: "ServiceNow AI Platform：ログイン前に届くページの入力がサンドボックスを抜けてコード実行に至り、詳細の公開から 3 日で悪用の試行が観測された(CVE-2026-6875) — 入口がどこであれ、管理者の作成のような操作を、実行の前に誰に許されたかで確かめる層が無い"
title_en: "ServiceNow AI Platform: input to a page reachable before login escaped the sandbox to code execution, and exploitation attempts were seen three days after details went public (CVE-2026-6875) — No layer checks, before it runs, who authorised an action like creating an admin, whatever the entry point"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-17
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.0"
og_lead_ja: "ServiceNow CVE-2026-6875：ログイン前の 1 リクエストがサンドボックスを抜けてコード実行"
og_lead_en: "ServiceNow CVE-2026-6875: one request before login escapes the sandbox to code execution"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 脆弱性の悪用"
og_kicker_en: "CYBERATTACK · VULNERABILITY EXPLOIT"
og_headline_ja: "ログインの前に、\n管理者を作れる穴が\n業務基盤にあった。\n<accent>公開の 3 日後に悪用の試行</accent>"
og_headline_en: "A hole let anyone create an admin before logging in.\n<accent>Exploit attempts three days after disclosure.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "9.5"
    unit: "CVSS 4.0"
    label: "Severity (ServiceNow's score, Critical). No login needed"
    tone: "alert"
  - value: "04-01 → 07-13"
    label: "From the researcher's report to the advisory. Cloud instances were mitigated within 24 hours of the report"
  - value: "07-14 → 07-17"
    label: "From the researcher publishing details to the first exploitation attempts seen"
glossary:
  - term: "Sandbox"
    desc: "A restricted environment for running code received from outside. Escape it and the code can do anything the system can."
  - term: "Pre-auth entry point"
    desc: "A page or API reachable without logging in. A hole here lets anyone try an attack."
  - term: "MID Server"
    desc: "A relay server a ServiceNow customer runs inside its own network so the platform can talk to internal servers."
insight:
  slug: "reachability-as-permission"
  label: "Reach it and it runs"
  quote: "Once a value entered before login escaped the sandbox, every later action ran as legitimate processing, never asked who had authorised it."
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold actions that change permissions, such as creating an admin, until it is clear who authorised them"
  - slug: "audit-trail"
    item: "Record which permission allowed which action, outside the platform"
impact: "On unpatched instances, data could be read and admins created without logging in"
takeaway: "Nothing checked, before it ran, who had authorised an action like creating an admin, even when it came through a pre-login entry point."
self_check: "Do you know which entry points on your business platforms are reachable without login?"
countries: ["global"]
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against ServiceNow's advisory (KB3137947), the researcher's write-up and Defused's posts. Corrected: cloud instances got mitigations within 24 hours of the report (not "from April onward"); the researcher published details on July 14; and the advisory's wording ("not currently aware of exploitation against ServiceNow instances") is now kept separate from the statement given to the press. v1.1 (2026-09-01) had already changed Defused's first claim of "a different route from the public PoC" in line with its correction.

## 1. TL;DR

ServiceNow AI Platform had a flaw, CVE-2026-6875 (CVSS 4.0 score 9.5), that let input to a page reachable without logging in (`/assessment_thanks.do`) be evaluated as JavaScript, escape the sandbox and run arbitrary code. Searchlight Cyber reported it on April 1; ServiceNow mitigated its cloud instances within 24 hours and published an advisory on July 13. The researcher published details on the 14th, and exploitation attempts were seen on the 17th.

Code that escapes can read any table, create admins and run commands on the relay servers (MID Servers) customers place inside their own networks. To the platform, all of it runs as the system's own legitimate processing.

No actual compromise has been reported, but attempts against unpatched instances began three days after the details went public. What failed was the layer that checks, before it runs, who authorised a permission-changing action like creating an admin, whatever entry point it came through.

## 2. What happened

- **Target**: ServiceNow AI Platform, which runs companies' IT, HR and customer-service work. According to the company, more than 85% of the Fortune 500 use it.
- **Flaw**: CVE-2026-6875. A parameter on `/assessment_thanks.do`, reachable before login, is evaluated as JavaScript as part of a data query. The evaluation happens inside a sandbox, but a mechanism for loading another script let code step outside its limits.
- **Severity**: CVSS 4.0 score 9.5 (Critical, scored by ServiceNow). Attack complexity is rated High.
- **What it allows**: Reading any table, creating admins, and running commands on the MID Servers inside the customer's network (per the researcher).
- **Fix**: Cloud instances were mitigated within 24 hours of the report. The July 13 advisory lists fixed releases for each family (Zurich, Yokohama, Australia, Brazil). The fix immediately applies a "single expression only" restriction (Guarded Script) to pre-login traffic.
- **Exploitation**: Attempts were seen from July 17. Defused says the payload it captured matched the researcher's published validation payload (its first claim of "a different route" was corrected on the 20th). No actual compromise has been reported, and the CVE is not in CISA's Known Exploited Vulnerabilities catalog (as of 2026-10-20).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The attack as the researcher showed it</span></div>
<p class="rx-ex-cap">The patch closes the entry hole. There is also a stopping point at ④: check who authorised a permission-changing action before it runs, and getting through the hole does not mean full control.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Sends a crafted value to a page reachable before login</b><p><code>/assessment_thanks.do</code></p></div>
<div class="rx-step"><div class="who">Platform</div><div class="no">2</div><b>Evaluates the value as JavaScript</b><p>Inside the sandbox.</p></div>
<div class="rx-step crit"><div class="who">Attacker's code</div><div class="no">3</div><b>Uses script loading to step outside the sandbox</b><p>Runs without restrictions.</p></div>
<div class="rx-step crit"><div class="who">Attacker's code</div><div class="no">4</div><b>Reads data, creates admins, runs commands on MID Servers</b><p>Runs as legitimate processing.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-04-01**: Searchlight Cyber reports to ServiceNow, which deploys mitigations to all cloud instances within 24 hours.
- **2026-07-13**: ServiceNow publishes its advisory (KB3137947) with fixed releases: "We are not currently aware of exploitation against ServiceNow instances."
- **2026-07-14**: Searchlight Cyber publishes technical details.
- **2026-07-17**: Exploitation attempts begin to be seen (press reports).
- **2026-07-18**: Defused posts on X, saying the route differs from the researcher's published PoC.
- **2026-07-20**: Defused corrects this: the captured payload matched the published one. ServiceNow tells the press it has not observed evidence the activity relates to instances it hosts. Canada's Centre for Cyber Security adds the exploitation reports to its advisory.

> Facts rest on ServiceNow's advisory, Searchlight Cyber's research and Defused's posts (all primary), and on press reports. Reports disagree on when self-hosted fixes arrived (June or July 13). As of October 2026, no actual compromise, KEV listing or Japanese government alert has been found.

### After disclosure

- **SecurityWeek**: Reported that the attempts may have come from members of the security industry looking for vulnerable systems.
- **ServiceNow**: Guarded Script applies to pre-login traffic immediately, and to logged-in traffic on cloud instances over about four weeks. On self-hosted instances, admins move through the phases by hand.

## 4. Why it wasn't stopped

This case was not a failure of customer care, nor only of slow patching. Once a value entered before login escaped the sandbox, reading data and creating admins went through as the platform's legitimate processing, never asked who had authorised them.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before an action runs; detection works after attempts or anomalies surface. In between, actions by code that got through the entry point are treated as legitimate processing.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before a permission-changing action runs, check who authorised it</div>
<div class="rx-zone gapz"><b>The gap</b><span>Unpatched, an admin gets created.<br>Three days from disclosure to attempts</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Spot the attempts and apply the fix</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>A crafted value reaches the entry point</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Admin creation goes through</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Attempts noticed</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Fix applied</b></div>
</div>
</figure>

Detection worked: ServiceNow mitigated cloud instances within 24 hours of the report, and Defused caught attempts three days after the details went public. But a patch closes the hole that was found, and although "it reached the entry point" and "this action is authorised" are separate facts, on this platform the first stood in for the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [ServiceNow's unauthenticated API](/critical/briefs/046-servicenow-unauthenticated-api/) (one setting removed authentication and customer instance data was queried).

## 5. How to counter this

**Close the entry holes, and stop what gets through with permissions.** Apply the fixed releases and reduce the entry points reachable before login. Beyond that, check before they run who authorised permission-changing actions, such as creating an admin or running commands on internal servers, whatever entry point they came through. When the next hole is found, it will not reach full control.

### Industries and operations to watch

- **Industry · AI adoption (cross-industry)**: Organisations that run IT, HR and customer-service work on a business platform like ServiceNow. Business data and connections to internal systems gather there.
- **Operation · Accounts & permissions**: Creating admin accounts and connecting the platform to internal servers. Here, both could be reached from a single request before login.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Applying fixed releases | Partial | It closes the hole that was found, but not the window before patching or the next hole. |
| Login and multi-factor authentication (MFA) | Not relevant | The entry point was before login. |
| Sandbox | Ineffective | There was a way out of its limits. |
| Monitoring admin creation and connections | Partial | It can notice, but only after the admin exists. |

### What is needed

1. **Apply fixes and reduce pre-login entry points.** On self-hosted instances, move through the Guarded Script phases yourself. Turn off unused public pages and guest traffic.
2. **Check permission-changing actions before they run, whatever the entry point.** For admin creation, role grants and commands on internal servers, match who is acting under which permission, and do not let it through if that cannot be matched.
3. **Record which permission allowed which action, outside the platform.** Keep what was stopped and what was let through in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about business platforms (cloud or self-run)

- Have you closed the entry points reachable without login that you do not use?
- When a new admin account is created, who gets notified?
- When a critical vulnerability is announced, is there a set number of days within which fixes are applied?

Note: if code that got through the entry point runs where it can rewrite the permission check itself, this check can be broken too. Placing the check outside the platform makes it stronger, but also adds work to legitimate admin tasks.

## 6. Sources

- **ServiceNow (Primary, vendor advisory)**: "CVE-2026-6875 - Sandbox Escape in ServiceNow AI Platform" (2026-07-13) — <https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB3137947>
- **Searchlight Cyber (Primary, researcher's write-up)**: "Smashing the ServiceNow Sandbox: Pre-Authentication RCE" (2026-07-14) — <https://slcyber.io/research-center/smashing-the-servicenow-sandbox-pre-authentication-rce/>
- **Defused (Primary, post on X)**: Exploitation attempts observed (2026-07-18) — <https://x.com/DefusedCyber/status/2078418391321219448>
- **Defused (Primary, post on X)**: Correction that the payload matched the public PoC (2026-07-20) — <https://x.com/DefusedCyber/status/2079231498109235248>
- **NVD (Primary, vulnerability database)**: CVE-2026-6875 (2026-07-13) — <https://nvd.nist.gov/vuln/detail/CVE-2026-6875>
- **Canadian Centre for Cyber Security (Primary, advisory)**: "ServiceNow security advisory (AV26-693)" (2026-07-14) — updated 07-20 · <https://cyber.gc.ca/en/alerts-advisories/servicenow-security-advisory-av26-693>
- **BleepingComputer (Reporting)**: "Critical ServiceNow code execution flaw now exploited in attacks" (2026-07-20) — <https://www.bleepingcomputer.com/news/security/critical-servicenow-code-execution-flaw-now-exploited-in-attacks/>
- **Help Net Security (Reporting)**: "ServiceNow pre-auth RCE exploited in the wild (CVE-2026-6875)" (2026-07-20) — <https://www.helpnetsecurity.com/2026/07/20/servicenow-cve-2026-6875-exploited/>
- **SecurityWeek (Reporting)**: "Exploitation of ServiceNow Vulnerability Seen Days After Disclosure" (2026-07-21) — <https://www.securityweek.com/exploitation-of-servicenow-vulnerability-seen-days-after-disclosure/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
