---
brief_no: 66
title: "LiteLLM：一般ユーザーの権限のまま、AI ゲートウェイの管理者権限とサーバーでのコード実行に届く連鎖が報告された(Obsidian Security の研究)"
title_en: "LiteLLM: a low-privilege user could reach admin rights and code execution on the AI gateway, researchers report (Obsidian Security research)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["033-f5-bigip-edge-pivot", "064-salesloft-drift-oauth-salesforce", "046-servicenow-unauthenticated-api", "056-mchire-paradox-recruiting-auth", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "LiteLLM で、一般ユーザーの権限のまま管理者権限とサーバーでのコード実行に届く 3 件の脆弱性の連鎖を、Obsidian Security が報告"
og_lead_en: "Obsidian Security reports a chain of three LiteLLM flaws that let a low-privilege user reach admin rights and server-side code execution"
og_kicker_ja: "脆弱性の開示 · 権限昇格"
og_kicker_en: "VULNERABILITY · AI GATEWAY"
og_headline_ja: "一般ユーザーの権限で、\nゲートウェイの管理者に\n届く連鎖を研究者が報告。\n<accent>連鎖の評価は CVSS 9.9</accent>"
og_headline_en: "A low-privilege user\ncould reach gateway\nadmin, researchers say.\n<accent>Chain rated CVSS 9.9</accent>"
key_figures:
  - value: "9.9"
    label: "Severity (CVSS) of the three flaws chained together. This is Obsidian Security's assessment; the individual CVEs are 8.7–8.8"
    tone: "alert"
  - value: "02-19 → 04-25"
    label: "From Obsidian Security reporting to BerriAI to the release of v1.83.14-stable, which contains every fix that closes the chain"
  - value: "3"
    label: "Flaws in the chain (authorization bypass, privilege escalation, sandbox escape)"
glossary:
  - term: "AI gateway"
    desc: "A relay that brings an organization's AI use together. It handles connections to LLM providers, authorization, budgets, guardrails and audit logs in one place, and sits between agents and models. LiteLLM is an OSS gateway developed by BerriAI."
  - term: "proxy_admin"
    desc: "LiteLLM's administrator role. It can change settings such as keys, users and guardrails."
  - term: "Custom-code guardrail"
    desc: "A mechanism that runs code written by users on the gateway to inspect requests and responses."
insight:
  slug: "earlier-layer-assumed"
  label: "Assuming an earlier layer checked"
  quote: "Unless every privileged operation checks that the requester is allowed to perform it, apart from having passed an earlier layer, a request that gets past one layer also gets through every operation after it."
industries: ["ai", "developers"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "For every privileged operation, check the requester's authorization in your own layer rather than assuming an earlier layer did"
  - slug: "limit-and-revoke"
    item: "Keep admin operations away from ordinary users and narrow permissions to what is needed"
attack_method: "privilege-abuse"
takeaway: "Researchers reported a chain in which a low-privilege user goes on to widen a key's scope, rewrite their own role and run code. For every privileged operation, check that it is allowed for that requester."
self_check: "Before a privileged operation such as changing a role or registering code, do you check that the requester is allowed to perform it, apart from having passed an earlier layer?"
countries: ["global"]
---

## 1. Summary

According to Obsidian Security, LiteLLM's authorization was split between a layer that decides which route a request may reach and the layer of each handler, and some sensitive handlers assumed "the route layer already screened this" and held no authorization of their own. The scope a caller specified when generating a key was stored without validation, so a low-privilege user could reach admin-only routes and go on to rewrite their own role and run code that administrators can register. No in-the-wild exploitation of this chain had been reported as of writing, and the fixes were available before the research was published. <strong>Unless every privileged operation checks that the requester is allowed to perform it, apart from having passed an earlier layer, a request that gets past one layer also gets through every operation after it.</strong>

## 2. What got through

- **What got through**: With low-privilege rights, generating a key whose scope was not validated, and reaching admin-only routes with it. Then, through a user-update handler with no field-level authorization, rewriting one's own role to administrator (`proxy_admin`), and running code on the server through the custom-code guardrail reachable on the admin path (Obsidian Security).
- **What reached the receiving side**: In general, an AI gateway holds model providers' API keys and the conversations passing through it in one place. Obsidian reports that a successful chain can reach the admin key (`LITELLM_MASTER_KEY`), database credentials, each provider's API keys, MCP and agent credentials, and the prompts and responses passing through. It also reports that a compromised gateway can rewrite responses between agent and model and make an agent (such as Claude Code in auto-approve mode) execute forged tool calls, and it demonstrated commands being run on a developer's machine.
- **Not disclosed**: Any case of this chain being used against a real target. None had been reported as of writing.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a privileged operation such as changing a role or registering code, the handler itself checks that the requester is allowed to perform it, apart from having passed an earlier layer and apart from the scope written in the key.

- **Who approves**: The gateway operator (the side that grants the administrator role). Who may perform admin operations, and what scope a key gets, is decided by records the operator keeps, not by values the requester specifies.
- **Where it is checked**: Just before each handler that runs a privileged operation. Having passed the route layer is not taken as grounds; each change to a role or permission field and each registration of a guardrail or callback checks the requester's rights. An operation that cannot be checked is not run.
- **What is recorded**: Who, under which rights, created a key with which scope, changed which role and registered which code, kept apart from the gateway's admin screen (Obsidian reports that malicious callbacks do not appear there).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, in the handler itself, before a role is changed or code is registered, that the requester is allowed to perform the operation, and keeping a record. Detection means researchers finding the chain and reporting it. The dates are when reports, fixes and publication happened, not when the chain was used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before a privileged operation, check the requester's rights in that handler</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With low-privilege rights,<br>admin rights and code execution were shown to be reachable</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>Obsidian Security reported it and BerriAI fixed it in stages</div>
<div class="rx-g g1"><div class="t">02-19</div><b>Obsidian reports to BerriAI</b></div>
<div class="rx-g g2"><div class="t">02-24</div><b>First fix</b></div>
<div class="rx-g g3"><div class="t">04-25</div><b>v1.83.14-stable closes the chain</b></div>
<div class="rx-g g4"><div class="t">06-11</div><b>Research published</b></div>
</div>
</figure>

Finding the flaws and publishing after the fixes worked, and BerriAI fixed them in stages after the report. Logs let you trace afterwards which endpoints were called. What did not work is the layer before that, which checks the requester's rights at every privileged operation. As with [the Salesloft Drift OAuth case](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (scope and revocation not checked per action), [the ServiceNow API](/critical/briefs/046-servicenow-unauthenticated-api/) (requester authentication left to a setting) and [F5 BIG-IP](/critical/briefs/033-f5-bigip-edge-pivot/) (a trusted edge device's compromise spreading with its stored credentials), privileged operations were not tied to a check of rights at the moment of the operation.

## 4. What Lemma does

**Lemma builds the check in section 03 in just before the handlers that run the gateway's privileged operations.** It does not look for flaws or suspicious calls; it checks, before execution and apart from having passed an earlier layer, that the requester is allowed to perform the operation.

### Industries and operations to watch

- **Industry · AI**: Organizations that bring their AI use together in an AI gateway and handle provider keys, budgets, guardrails and audit logs in one place. The gateway sits between agents and models.
- **Industry · Developers & agent operations**: Development and operations teams that self-host an OSS gateway such as LiteLLM and route agents or MCP through it.
- **Operation · Account & permission admin**: Generating keys, changing users' roles, registering guardrails and callbacks. An entry point open to ordinary users can become a route to admin operations.

### Current controls vs Lemma

The entry point of this chain is column 1, admin operations by a low-privilege user. Column 2 is what follows, registering and running code with admin rights, and column 3 is an agent's operations through a compromised gateway, as Obsidian demonstrated.

| Control | Admin operations by a low-privilege user (widening a key's scope, rewriting a role) | Registering and running code with admin rights | Agent operations driven by responses a compromised gateway rewrote |
| --- | --- | --- | --- |
| Screening at the route layer (before the fix) | Not effective | Not relevant | Not relevant |
| Updating to a fixed version (v1.83.14-stable or later) | Partial | Partial | Partial |
| Inventorying admin roles, guardrails and callbacks (after the operation; recommended) | Not effective | Not effective | Partial |
| Limiting relays between agent and model to trusted paths (recommended) | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Screening at the route layer could be satisfied by a key whose scope was not validated (Obsidian Security). Updating to a fixed version closes the three reported routes, but if another handler with the same assumption remains, it does not close that one. An inventory finds and removes escalated users and registered code or callbacks afterwards, but does not stop the operations themselves. Limiting relays to trusted paths avoids unknown third-party relays, but does not help if a gateway you trusted is taken over. Lemma checks widening a key's scope or rewriting a role against whether the requester is allowed to do so in the operator's records, so admin operations by a low-privilege user stop before execution. Code registered by a requester who is allowed as an administrator matches the check and goes through; whether that code escapes the sandbox is not what the check looks at.

Note: Lemma's check works only when it is built into each handler that runs the gateway's privileged operations, and the records of roles and rights are managed apart from values the requester can specify. It can be passed if an administrator's key or machine is stolen, or if code running on the gateway opens a path that bypasses the check. Lemma does not judge whether the content of responses flowing through the gateway is good or bad, and does not rotate keys already exposed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that self-host an AI gateway

- Is your AI gateway on a version that contains the fixes for the reported flaws (for LiteLLM, v1.83.14-stable or later)?
- Do you keep a list of users who hold the administrator role (such as `proxy_admin`) and treat it with the same weight as host access?
- Do you compare the registered custom-code guardrails and callbacks against a list kept apart from the admin screen?

## 5. Facts and timeline

- **Subject**: LiteLLM (an OSS AI gateway / proxy developed by BerriAI). It aggregates connections to LLM providers, authorization, budgets, guardrails and audit logs, and also works as a gateway for MCP and agents.
- **Reporter**: Obsidian Security (published the research on the chain). The guardrail sandbox escape (corresponding to CVE-2026-40217) was independently reported earlier by X41 D-Sec (2026-04-08, no CVE assigned at the time). VulnCheck assisted with assigning CVE-2026-47101 / 47102.
- **Researchers' report (three flaws)**: The individual CVEs are CVSS 8.7–8.8; the 9.9 for the chain is Obsidian's assessment.
  - **CVE-2026-47101 (authorization bypass)**: Key-management endpoints such as `/key/generate` stored the caller-specified scope of routes a key may reach (`allowed_routes`) without validating it. Route permissions should come from the role, but the key's scope acted as a grant, and a low-privilege user reached admin-only routes.
  - **CVE-2026-47102 (privilege escalation)**: The user-update endpoints (`/user/update`, `/user/bulk_update`) had no field-level authorization, so a caller could rewrite their own role to `proxy_admin`.
  - **CVE-2026-40217 (sandbox escape)**: The custom-code guardrail ran user code without restricting the runtime's standard features, leading to code execution on the server.
- **Researchers' report (handler layer)**: Once past the route layer, some sensitive endpoints assumed the route layer had screened the request and held no authorization of their own.
- **Researchers' report (Man-in-the-Gateway)**: Registering a malicious callback through code execution lets an attacker read and rewrite the requests and responses flowing through the gateway. Obsidian demonstrated injecting forged tool calls into an agent so that commands ran on a developer's machine.
- **Fix**: BerriAI fixed the flaws in stages; the chain is closed from `v1.83.14-stable` (released 2026-04-25), which contains every fix.

### Timeline

- **2026-02-19**: Obsidian Security reports the three flaws to BerriAI (by email / Huntr, per the disclosure policy).
- **2026-02-24**: First fix. A `proxy_admin` check is added to creating and changing guardrails, and the code runtime is restricted (PR #22095).
- **2026-04-08**: X41 D-Sec publishes the guardrail sandbox escape (no CVE assigned at the time).
- **2026-04-09–15**: Non-admin setting of `allowed_routes` is blocked (PR #25445), field-level authorization is added (PR #25541), and guardrails move to a RestrictedPython sandbox (PR #25818).
- **2026-04-10**: CVE-2026-40217 (the guardrail sandbox issue) is published.
- **2026-04-22–25**: `v1.83.10-stable` (privilege-escalation fix, sandbox) is released, followed by `v1.83.14-stable` (fix for the remaining `allowed_routes` bypass).
- **2026-05-20**: VulnCheck assigns CVE-2026-47101 (authorization bypass) and CVE-2026-47102 (privilege escalation).
- **2026-06-11**: Obsidian Security publishes the research (the full chain and the Man-in-the-Gateway demonstration).

> This Brief covers the privilege-escalation chain of three flaws (CVE-2026-47101 / 47102 / 40217) that Obsidian Security described; no in-the-wild exploitation of this chain had been reported as of writing. Separately, LiteLLM has an unrelated CVE-2026-42271 (command injection via the MCP preview, fixed in v1.83.7), which has been exploited in the wild and is listed in CISA KEV. Secondary reports that mention "a different CVE number" or "confirmed exploitation" usually refer to 42271. The two are distinct flaws, and this Brief's analysis is limited to the former chain (42271 is also closed by updating to `v1.83.14-stable` or later). The facts of the technique rest on Obsidian Security's research and X41 D-Sec's report, and this Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **BerriAI / LiteLLM**: Fixed the flaws in stages after the report: adding a `proxy_admin` check to guardrails and restricting the runtime, blocking non-admin setting of `allowed_routes`, adding field-level authorization and moving to a RestrictedPython sandbox, closing the chain in `v1.83.14-stable`.
- **Recommendations for self-hosters (Obsidian Security)**: Update to `v1.83.14-stable` or later; review who holds `proxy_admin` (treat it as equivalent to host access); inventory registered custom-code guardrails and callbacks (comparing them against callbacks that do not appear in the admin screen); rotate provider API keys, database credentials and MCP tokens.
- **The question of authority boundaries**: The defense-in-depth point that "a route-layer check is one layer of authorization, not the whole authorization model" was raised, along with the view that admin operations such as introducing guardrails or changing permission fields should require admin authorization in the handler, not at the route.
- **Industry questions**: Beyond the AI stack inheriting old web defects (the same shape as Obsidian's Langflow and Flowise research), the gateway's position becoming a threat surface that goes beyond "reading" to "steering" was raised. It is recommended that relays placed between agent and model be limited to trusted paths, avoiding unknown third-party relays.

## 6. Sources

- **Obsidian Security (primary, research)**: "Breaking LiteLLM: From Low-Privilege User to Admin and RCE (CVE-2026-47101, CVE-2026-47102, CVE-2026-40217)" (2026-06-11; the full chain, disclosure timeline, Man-in-the-Gateway demonstration) — <https://www.obsidiansecurity.com/blog/litellm-privilege-escalation-rce>
- **X41 D-Sec (primary, independent report)**: "X41-2026-001 LiteLLM" (sandbox escape in the guardrail `/guardrails/test_custom_code`, published 2026-04-08, CVE unassigned at the time) — <https://www.x41-dsec.de/lab/advisories/x41-2026-001-litellm/>
- **NVD**: CVE-2026-40217 (guardrail sandbox escape) — <https://nvd.nist.gov/vuln/detail/CVE-2026-40217>
- **The Hacker News**: "LiteLLM Vulnerability Chain Lets Low-Privilege Users Take Over AI Gateway Servers" (2026-06) — <https://thehackernews.com/2026/06/litellm-vulnerability-chain-lets-low.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
