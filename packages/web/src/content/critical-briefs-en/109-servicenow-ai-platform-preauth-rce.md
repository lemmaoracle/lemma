---
brief_no: 109
title: "ServiceNow AI Platform：ログイン前に届くページの入力がサンドボックスを抜けてコード実行に至り、詳細の公開から 3 日で悪用の試行が観測された(CVE-2026-6875)"
title_en: "ServiceNow AI Platform: input to a page reachable before login escaped the sandbox to code execution, and exploitation attempts were seen three days after details went public (CVE-2026-6875)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-17
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.1"
og_lead_ja: "ServiceNow CVE-2026-6875：ログイン前の 1 リクエストがサンドボックスを抜けてコード実行"
og_lead_en: "ServiceNow CVE-2026-6875: one request before login escapes the sandbox to code execution"
layout: "report"
sections: "proof"
gate: "permission-change"
og_kicker_ja: "サイバー攻撃事例 · 脆弱性の悪用"
og_kicker_en: "CYBERATTACK · VULNERABILITY EXPLOIT"
og_headline_ja: "ログインの前に、\n管理者を作れる穴が\n業務基盤にあった。\n<accent>公開の 3 日後に悪用の試行</accent>"
og_headline_en: "A hole let anyone create an admin before logging in.\n<accent>Exploit attempts three days after disclosure.</accent>"
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
  quote: "Reaching an entry point and being allowed to act are separate facts; on a platform where reaching it counts as permission, a hole at the entry becomes full control."
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold actions that change permissions, such as creating an admin, until it can be confirmed who authorised them"
  - slug: "audit-trail"
    item: "Record which permission allowed which action, outside the platform"
impact: "On unpatched instances, data could be read and admins created without logging in"
takeaway: "Nothing checked, before it ran, who had authorised an action like creating an admin, even when it came through a pre-login entry point."
self_check: "Do you know which entry points on your business platforms are reachable without login?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. In v2.0 (2026-10-21) the facts were re-checked against ServiceNow's advisory (KB3137947), the researcher's write-up and Defused's posts: cloud instances got mitigations within 24 hours of the report (not "from April onward"), the researcher published details on July 14, and the advisory's wording ("not currently aware of exploitation against ServiceNow instances") is kept separate from the statement given to the press. v1.1 (2026-09-01) had already changed Defused's first claim of "a different route from the public PoC" in line with its correction.

## 1. Summary

ServiceNow's advisory says it is "not currently aware of exploitation against ServiceNow instances," and no actual compromise has been reported. Even so, exploitation attempts against instances that had not been patched began three days after the details went public. Whatever code gets through the entry point runs, from the platform's side, as the system's own legitimate processing. <strong>Reaching an entry point and being allowed to act are separate facts; on a platform where reaching it counts as permission, a hole at the entry becomes full control.</strong>

## 2. What got through

- **What got through**: Evaluation of a parameter on `/assessment_thanks.do`, reachable before login, and what the escaped code did: reading data, creating admins and running commands on MID Servers. The value is evaluated as JavaScript as part of a data query; it should run inside a sandbox, but a mechanism for loading another script let it step outside the limits (per the researcher).
- **What reached the receiving side**: In general, an action by code that has escaped the sandbox arrives as the platform's own legitimate processing. From the side of the action, you cannot tell who authorised an admin being created.
- **What was stopped**: Cloud instances were mitigated within 24 hours of the report (per ServiceNow). The fixed releases immediately apply a "single expression only" restriction (Guarded Script) to pre-login traffic.
- **Not disclosed**: Any actual compromise (none reported, and the CVE is not in CISA's Known Exploited Vulnerabilities catalog as of 2026-10-20), and when the self-hosted fixes arrived (reports disagree: June or July 13).

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever carries out a permission-changing action, such as creating an admin, checks before it runs who authorised that action, whichever entry point it came through.

- **Who approves**: Whoever decides permissions, such as the platform's administrators. Who may create admins, grant roles or run commands on internal servers, and within what scope, is decided outside the platform.
- **Where it is checked**: One point just before a permission-changing action runs. Whether the entry point is before or after login, it passes the same check. An action that does not match a permission is stopped, not run.
- **What is recorded**: Which permission allowed which action, by whom, kept apart from the platform in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a permission-changing action runs, who authorised it, and keeping a record. Detection means noticing after attempts or anomalies surface. The dates below are when ServiceNow, the researcher and Defused reported or disclosed each point, not necessarily when exploitation became possible.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check who authorised a permission-changing action before it runs</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>On unpatched instances, data could be read<br>and admins created without logging in</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Attempts were observed and fixed releases applied</div>
<div class="rx-g g1"><div class="t">04-01</div><b>Searchlight Cyber reports</b></div>
<div class="rx-g g2"><div class="t">07-13</div><b>Advisory published</b></div>
<div class="rx-g g3"><div class="t">07-14</div><b>Researcher publishes details</b></div>
<div class="rx-g g4"><div class="t">07-17</div><b>Exploitation attempts seen</b></div>
</div>
</figure>

Detection worked. The patch closed the entry hole, but a patch closes the hole that was found, not the next one. A similar case where authentication came off with a single setting is [ServiceNow's unauthenticated API](/critical/briefs/046-servicenow-unauthenticated-api/) (customer instance data was queried).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that carries out permission-changing actions.** It does not look for holes or intrusions; it checks, before the action runs and whatever the entry point, whether it rests on a permission.

### Industries and operations to watch

- **Industry · AI adoption (cross-industry)**: Organisations that run IT, HR and customer-service work on a business platform such as ServiceNow. Business data and connections into internal systems gather on the platform.
- **Operation · Accounts & permissions**: Creating admin accounts and the platform's connections to internal servers. In this case both could be reached from a single request before login.

### Current controls vs Lemma

The route in this case is column 1 (a permission-changing action arriving through an entry point before login). Column 2 is where code runs in a position to rewrite the permission check itself; whether that was so here has not been disclosed.

| Control | Permission-changing action through a pre-login entry point | Rewriting the permission check itself |
| --- | --- | --- |
| Applying fixed releases | Partial | Not relevant |
| Login and multi-factor authentication (MFA) | Not relevant | Not relevant |
| Sandbox | Not effective | Not relevant |
| Monitoring admin creation and connections | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not effective |

Applying fixed releases closes the hole that was found, but not the window before patching or the next hole. Login and multi-factor authentication do not bear on this route, because the entry point was before login. The sandbox had a way out of its limits. Monitoring admin creation and connections can notice, but only after the admin exists. Lemma checks permission-changing actions before they run, whatever the entry point, against whether they were authorised.

Note: Lemma's check works only when it is built in just before permission-changing actions such as creating an admin, granting a role or running a command on an internal server, and the record of permissions is managed apart from the platform. If code that got through the entry point runs where it can rewrite the permission check itself, this check can be broken too. Placing the check outside the platform makes it stronger, but also adds work to legitimate admin tasks. Reading data is not itself covered by this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about business platforms (cloud or self-run)

- Have you closed the entry points reachable without login that you do not use?
- When a new admin account is created, who gets notified?
- When a critical vulnerability is announced, is there a set number of days within which fixes are applied?

## 5. Facts and timeline

- **Target**: ServiceNow AI Platform, which runs companies' IT, HR and customer-service work. According to the company, more than 85% of the Fortune 500 use it.
- **Flaw**: CVE-2026-6875. A parameter on `/assessment_thanks.do`, reachable before login, is evaluated as JavaScript as part of a data query. The evaluation happens inside a sandbox, but a mechanism for loading another script let code step outside its limits.
- **Severity**: CVSS 4.0 score 9.5 (Critical, scored by ServiceNow). Attack complexity is rated High.
- **What it allows**: Reading any table, creating admins, and running commands on the MID Servers inside the customer's network (per the researcher).
- **Fix**: Cloud instances were mitigated within 24 hours of the report. The July 13 advisory lists fixed releases for each family (Zurich, Yokohama, Australia, Brazil). The fix immediately applies a "single expression only" restriction (Guarded Script) to pre-login traffic.
- **Exploitation**: Attempts were seen from July 17. Defused says the payload it captured matched the researcher's published validation payload (its first claim of "a different route" was corrected on the 20th). No actual compromise has been reported, and the CVE is not in CISA's Known Exploited Vulnerabilities catalog (as of 2026-10-20).

### Timeline

- **2026-04-01**: Searchlight Cyber reports to ServiceNow, which deploys mitigations to all cloud instances within 24 hours.
- **2026-07-13**: ServiceNow publishes its advisory (KB3137947) with fixed releases: "We are not currently aware of exploitation against ServiceNow instances."
- **2026-07-14**: Searchlight Cyber publishes technical details.
- **2026-07-17**: Exploitation attempts begin to be seen (press reports).
- **2026-07-18**: Defused posts on X, saying the route differs from the researcher's published PoC.
- **2026-07-20**: Defused corrects this: the captured payload matched the published one. ServiceNow tells the press it has not observed evidence the activity relates to instances it hosts. Canada's Centre for Cyber Security adds the exploitation reports to its advisory.

> Facts rest on ServiceNow's advisory, Searchlight Cyber's research and Defused's posts (all primary), and on press reports. Reports disagree on when self-hosted fixes arrived (June or July 13). As of October 2026, no actual compromise, KEV listing or Japanese government alert has been found. What has not been disclosed does not mean there were no controls.

### After disclosure

- **SecurityWeek**: Reported that the attempts may have come from members of the security industry looking for vulnerable systems.
- **ServiceNow**: Guarded Script applies to pre-login traffic immediately, and to logged-in traffic on cloud instances over about four weeks. On self-hosted instances, admins move through the phases by hand.

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
