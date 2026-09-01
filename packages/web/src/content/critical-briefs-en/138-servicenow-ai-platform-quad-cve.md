---
brief_no: 138
title: "ServiceNow AI Platform で、未認証の 1 リクエストがコード実行・権限昇格・SQL 注入に届く脆弱性が 4 件開示された — 3 度目の開示でも、行動の前に認可を確かめる層が無い"
title_en: "Four unauthenticated flaws reaching code execution, privilege escalation, and SQL injection were disclosed in ServiceNow AI Platform — a third disclosure, still with no layer that checks authorization before the action"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-08-27
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["046-servicenow-unauthenticated-api", "109-servicenow-ai-platform-preauth-rce"]
status: published
version: "1.0"
og_lead_ja: "ServiceNow AI Platform、未認証で届く脆弱性が 4 件同時開示"
og_lead_en: "ServiceNow AI Platform: four unauthenticated flaws disclosed at once"
---

## 1. TL;DR

On August 27, 2026, ServiceNow disclosed four unauthenticated, exploitable vulnerabilities in its AI Platform. Three carry a ServiceNow-assigned CVSS of 10.0 — GraphQL code injection, improper access control in the image upload processor, and SQL injection through a dynamic schema ORDER BY clause — and the sandbox escape 8.7. The three require neither authentication nor user interaction. Detection and remediation were fast. **What was missing was a layer that independently verifies an unauthenticated request's authorization before it reaches code-execution or data-modification logic.**

## 2. What happened

- ServiceNow disclosed four vulnerabilities affecting multiple AI Platform (formerly Now Platform) releases in an August 27, 2026 security bulletin (KB3152242): CVE-2026-18885, CVE-2026-18886, CVE-2026-74820, and CVE-2026-6876.
- The three scored 10.0 require neither authentication nor user interaction and are remotely reachable over the network. For the fourth, the prose says an "unauthenticated user" could execute arbitrary code, while the vector ServiceNow assigned to the same flaw specifies `PR:L` (low privileges required) — the description and the vector do not agree.
- The three 10.0 flaws share the vector `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H` — network-reachable, low complexity, no privileges, no user interaction, high impact to both the vulnerable component and the systems connected to it. The 8.7 sandbox escape differs on two counts: privileges are `PR:L`, and no impact is recorded beyond the component itself (`SC:N/SI:N/SA:N`).
- ServiceNow applied fixes to hosted instances and released hotfixes for self-hosted and partner deployments across the Xanadu, Yokohama, Zurich, and Australia release families.
- The CVSS scores are ServiceNow's own. The company is the CVE Numbering Authority for its products, and since April 15, 2026 NIST has prioritized for enrichment the vulnerabilities that appear in CISA's Known Exploited Vulnerabilities catalog, affect federal government software, or are designated critical under Executive Order 14028, treating everything else as lowest priority and not enriching it immediately. No score cited here is an independent third-party assessment.

The attack can be assembled as follows.

1. An unauthenticated attacker sends a crafted request to the GraphQL Composite Data API (CVE-2026-18885, ServiceNow-scored 10.0). Improper input handling lets the injected code execute directly on the instance, reaching and modifying instance data.
2. In parallel, the system configuration image upload processor lacks proper access control, letting an unauthenticated user create or modify instance data and escalate privileges (CVE-2026-18886, 10.0).
3. User-supplied input is incorporated into a dynamically built schema ORDER BY clause without sanitization, making SQL injection against the underlying database reachable over HTTP(S) (CVE-2026-74820, 10.0).
4. Separately, a sandbox boundary can be crossed, reaching code execution (CVE-2026-6876, 8.7). ServiceNow's prose says this is reachable unauthenticated, but its vector requires low privileges; the two premises do not match.

## 3. Timeline — disclosure and response

- 2026-04-01: Searchlight Cyber reports CVE-2026-6875, an unauthenticated sandbox escape in the same platform, to ServiceNow.
- 2026-07-13: ServiceNow publishes the advisory for CVE-2026-6875 (ServiceNow-scored 9.5; every metric matches the three above except attack complexity, set to high).
- 2026-07, days after that advisory: threat intelligence firm Defused says it is observing in-the-wild exploitation of CVE-2026-6875. **It subsequently issued a correction, stating that the captured payload matched Searchlight Cyber's published proof-of-concept exploit.**
- 2026-08-27: ServiceNow publishes all four of the current CVEs in KB3152242 and ships hotfixes.

> This timeline treats ServiceNow's own bulletin (KB3152242) as primary, with technical detail drawn from that bulletin and independent analysis (IONIX). As noted above, the CVSS scores are ServiceNow's own and carry no independent NVD assessment. The claim that it is "not currently aware" of exploitation is ServiceNow's own; no independent third-party confirmation was available at the time of writing. The Hacker News reported that it found no public exploit code for the three maximum-severity flaws as of August 28, 2026.

Response and developments:

- ServiceNow states that hosted-customer remediation is complete, and offers patched versions for self-hosted and partner deployments. For self-hosted instances, the decision and the work remain with the customer.
- The Hacker News covered the advisory the next day (2026-08-28) and SecurityWeek a few days later (2026-08-31). Both note that the three 10.0 flaws are reachable without authentication or user interaction, and The Hacker News also flags the mismatch between prose and vector on the fourth.

## 4. Why it wasn't stopped

This incident's failure is neither slow patching nor unusually sophisticated bugs. **Across multiple entry points into the platform — the GraphQL API, the image upload processor, dynamic query construction, and the sandbox boundary — no layer consistently verified a request's authorization before it reached code-execution or data-modification logic.**

Detection worked. All four were found before publication, hotfixes were ready alongside the advisory, and hosted instances were already patched (no finder is named for this set of four). What was missing sat one step earlier: a way to confirm, as a platform-wide boundary rather than a per-feature implementation detail, whether a request was authenticated and within its intended scope. Where every new entry point adds one more verification implementation, a single gap in one of them is itself unauthenticated reach.

On the same AI Platform, [Brief 046](/critical/briefs/046-servicenow-unauthenticated-api/) covered unauthenticated access from a misconfiguration, and [Brief 109](/critical/briefs/109-servicenow-ai-platform-preauth-rce/) covered unauthenticated sandbox-escape-to-code-execution (CVE-2026-6875). This is the third disclosure. Each vulnerability is independent, but the recurring shape is the same: as new functionality ships, nothing outside the feature itself confirms that reaching it is authorized, and individual input-validation and access-control gaps accumulate.

> Whether exploitation was observed is a separate question from that shape. The reported in-the-wild exploitation of July's CVE-2026-6875 was later corrected, with the captured payload attributed to a published proof of concept. The absence of exploitation evidence does not weaken the fact that unauthenticated entry points keep being found.

## 5. What proof would have changed

Proof before the action replaces "was this entry point's validation written correctly?" with "could this request's authorization be independently verified?" as the basis for running platform functionality. Rather than requiring every entry point to be written correctly, it inserts a step that can be checked before the action even where they are not.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Authorization proof before the action</strong>: independently verify and prove a request's authorization before it reaches platform functionality (APIs, upload processors, query construction).</li>
<li><strong>Applied as a boundary</strong>: apply that proof as a platform-wide boundary rather than leaving it to per-feature implementation, so adding entry points does not add checks to get right.</li>
<li><strong>Provenance binding</strong>: bind the provenance of the resulting action — code execution, data modification — to the authorization proof that permitted it.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not detect or patch the individual CVEs. That is the vendor's and the researchers' work.</li>
<li>It does not substitute for or guarantee ServiceNow's internal implementation. This layer sits after that, keeping an implementation gap from turning unauthenticated reach into an action.</li>
<li>Proof can show only that a request is authorized — not that an authorized user's action was appropriate.</li>
</ul>

The difference from your own access logs is here: a log remains after the request is processed, but it is not material for deciding, at the time of the action, whether that request should have been processed.

Detection and this layer are complementary, not substitutes. The former finds vulnerabilities and reduces the number of entry points; the latter makes "functionality does not run until authorization is verified" something you can check before the next entry point is found.

## 6. Sources

- **ServiceNow (primary, official)**: "August 2026 CVE Advisory Notification" (KB3152242, 2026-08-27) — <https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB3152242>
- **The Hacker News (independent)**: "Three CVSS 10.0 ServiceNow Flaws Could Let Unauthenticated Attackers Execute Code and SQL" (2026-08) — <https://thehackernews.com/2026/08/three-cvss-100-servicenow-flaws-could.html>
- **SecurityWeek (independent)**: "ServiceNow Patches 3 Critical Code Injection Vulnerabilities" — <https://www.securityweek.com/servicenow-patches-3-critical-code-injection-vulnerabilities/>
- **IONIX Threat Center (independent analysis)**: CVE-2026-18885 — <https://www.ionix.io/threat-center/cve-2026-18885/> / CVE-2026-74820 — <https://www.ionix.io/threat-center/cve-2026-74820/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

All CVSS scores here are ServiceNow's own, assigned as the CNA for its products; no independent NVD assessment accompanies them. Exploitation status reflects the company's own statement.
