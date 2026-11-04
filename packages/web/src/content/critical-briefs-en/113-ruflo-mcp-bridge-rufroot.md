---
brief_no: 113
title: "Ruflo の MCP Bridge：認証の無い要求が高権限のツールを開き、修正の後も記憶の汚染が残りうると報告された(Noma Security の研究、CVE-2026-59726)"
title_en: "Ruflo's MCP Bridge: an unauthenticated request could open high-privilege tools, and memory poisoning can outlast the patch, researchers report (Noma Security research, CVE-2026-59726)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-28
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["066-litellm-ai-gateway-privilege-escalation", "088-kestra-auth-filter-bypass-rce", "046-servicenow-unauthenticated-api", "095-amazon-q-mcp-auto-execution", "073-shadowmq-pickle-zmq-pattern"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Ruflo の MCP Bridge で、認証の無い要求が高権限のツールを実行できる脆弱性（CVE-2026-59726）を Noma Security が報告。記憶の汚染は修正の後も残りうる"
og_lead_en: "Noma Security reports a Ruflo MCP Bridge flaw (CVE-2026-59726) that let unauthenticated requests run high-privilege tools; memory poisoning can outlast the patch"
og_kicker_ja: "脆弱性の開示 · エージェント基盤"
og_kicker_en: "VULNERABILITY · AGENT PLATFORM"
og_headline_ja: "認証の無い 1 つの要求が\n233 の高権限ツールを\n開くと研究者が報告。\n<accent>深刻度は CVSS 10.0</accent>"
og_headline_en: "Unauthenticated calls\ncould open 233 tools,\nresearchers report.\n<accent>Rated CVSS 10.0</accent>"
key_figures:
  - value: "10.0"
    unit: "CVSS"
    label: "Severity (CVE-2026-59726). Affects versions below 3.16.3; the default docker-compose setup exposed the MCP Bridge with no authentication"
    tone: "alert"
  - value: "233"
    label: "High-privilege tools callable through the unauthenticated MCP Bridge (shell execution, database operations, agent management, memory storage)"
  - value: "24"
    unit: "hours"
    label: "From responsible disclosure on 2026-06-30 to the full fix being merged and a security advisory issued"
glossary:
  - term: "MCP Bridge"
    desc: "The single path every tool call in Ruflo goes through. An Express.js server that accepts tool calls over HTTP at endpoints such as `POST /mcp`."
  - term: "Learning store (AgentDB pattern store)"
    desc: "Memory where an agent stores the patterns it has learned and uses them in later responses. Patterns that enter it remain even after the software is updated."
  - term: "Swarm"
    desc: "A unit in which multiple AI agents are launched together and work in coordination. Ruflo hosts these for Codex and Claude Code."
insight:
  slug: "patch-does-not-clean-memory"
  label: "Memory a patch does not restore"
  quote: "Unless every tool call and every memory write is checked against authorization each time, rather than against having arrived, writes that got through stay in memory after the entry point is closed and keep steering later responses."
industries: ["ai", "developers"]
controls:
  - slug: "verify-entry"
    item: "Do not run tool calls unauthenticated; check authorization on every call"
  - slug: "limit-and-revoke"
    item: "Do not bundle shell, key and database access in one bridge; grant each action separately"
  - slug: "check-origin"
    item: "Let only patterns whose origin has been confirmed be written to the agent's memory"
attack_method: "privilege-abuse"
takeaway: "Researchers reported that unauthenticated requests could reach high-privilege tools, including shell execution and memory writes. Check each tool call and each memory write against who is allowed to perform it."
self_check: "On your AI agent platform, do you check on every tool call that the caller is allowed to perform that operation?"
countries: ["global"]
---

## 1. Summary

According to Noma Security (Noma Labs), in the default setup of Ruflo (formerly Claude Flow), which hosts swarms of AI agents, the MCP Bridge was exposed to every network and passed incoming tool calls to execution with no authentication, no token and no header check. The callable tools include shell execution, database operations, launching agents and saving to memory. The maintainer shipped a fix and an advisory within 24 hours of disclosure, but that advisory states that poisoning already in the learning store is not undone by redeploying a patched version. Whether the flaw was exploited in the wild was not established at the time of disclosure. <strong>Unless every tool call and every memory write is checked against authorization each time, rather than against having arrived, writes that got through stay in memory after the entry point is closed and keep steering later responses.</strong>

## 2. What got through

- **What got through**: Unauthenticated `tools/call` requests arriving over the network went through as executions of high-privilege tools, including the shell-executing `terminal_execute` (Noma Security). A dangerous-operation blocklist exists in the autopilot flow, but the `/mcp` entry point does not pass through it, according to the report.
- **What reached the receiving side**: In general, an agent platform holds model providers' keys and compute, conversation data and the agents' memory in one place. Noma reports that a shell inside the container, each provider's keys passed as environment variables, attacker-controlled swarms launched with the victim's keys and compute, and conversation data in an unauthenticated internal database could all be reached. It also reports that poisoned patterns could be placed in the learning store to steer later AI responses toward the attacker's instructions, and calls this the core of the incident.
- **Not disclosed**: Whether the flaw was exploited in the wild, and the extent of any damage. Not established at the time of disclosure.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a tool runs and before anything is written to memory, the system checks that the requester is allowed to perform that operation now, apart from the request having arrived.

- **Who approves**: The operator of the agent platform. Which requester may use which tools (shell execution, keys, databases, saving to memory) is decided by records the operator keeps, not by whether a request can reach the network endpoint.
- **Where it is checked**: Just before the MCP Bridge passes a tool call to execution, and just before a pattern is written to the learning store. A call that cannot be checked is not run, and a pattern not tied to the record of an allowed requester is not admitted to memory.
- **What is recorded**: Which requester called which tool under which authorization, and which pattern entered memory as whose write, kept outside the container alone (Noma reports that a backdoor surviving restarts could be written into the container).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a tool runs or memory is written, that the requester is allowed to perform the operation, and keeping a record. Detection means researchers finding the flaw and reporting it. The dates are when reports, fixes and disclosure happened, not when anything was exploited.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before a tool runs or memory is written, check the requester's authorization</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unauthenticated requests were shown to reach<br>high-privilege tools and memory writes</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>Noma Labs reported it and the maintainer fixed it within 24 hours</div>
<div class="rx-g g1"><div class="t">06-30</div><b>Noma Labs reports to the maintainer</b></div>
<div class="rx-g g2"><div class="t">Within hours</div><b>First fix</b></div>
<div class="rx-g g3"><div class="t">Within 24 h</div><b>Full fix and advisory</b></div>
<div class="rx-g g4"><div class="t">07-28–29</div><b>Public disclosure and reporting</b></div>
</div>
</figure>

Responsible disclosure and the fix and advisory within 24 hours worked, and the fix closes the exposed entry point. What did not work is the layer before that, which checks the requester's authorization on every tool call and every memory write. As with [LiteLLM's privilege escalation](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/) (passing an earlier layer stood in for authorization), [the Kestra auth-filter bypass](/critical/briefs/088-kestra-auth-filter-bypass-rce/), [ServiceNow's unauthenticated API](/critical/briefs/046-servicenow-unauthenticated-api/), [Amazon Q's MCP auto-execution](/critical/briefs/095-amazon-q-mcp-auto-execution/) (an agent ran tool calls as they came) and [the ShadowMQ pickle/ZMQ pattern](/critical/briefs/073-shadowmq-pickle-zmq-pattern/) (what was brought in at run time persisted), requests that arrived were not tied to a check of authorization at that moment.

## 4. What Lemma does

**Lemma builds the check in section 03 in just before the MCP Bridge passes a tool call to execution and just before a write to the learning store.** It does not look for flaws or suspicious requests; it checks, before execution and apart from the request having arrived, that the requester is allowed to perform the operation.

### Industries and operations to watch

- **Industry · AI**: Organizations that host swarms of AI agents and handle provider keys, compute, conversation data and agent memory in one place. Tool calls converge on a single path.
- **Industry · Developers & agent operations**: Development and operations teams that self-host an OSS orchestration platform such as Ruflo for Codex or Claude Code. Running the default setup as-is can leave the entry point open to the network.

### Current controls vs Lemma

The entry point here is column 1, running high-privilege tools through unauthenticated requests; column 2 is writing to memory through that route. Column 3 is patterns that entered the learning store before the fix going on to steer later responses.

| Control | Running high-privilege tools through unauthenticated requests | Writing to memory (the learning store) | Later responses steered by patterns that entered memory before the fix |
| --- | --- | --- | --- |
| Dangerous-operation blocklist in the autopilot flow (before the fix) | Not effective | Not effective | Not relevant |
| Updating to a fixed version (3.16.3 or later) | Partial | Partial | Not effective |
| Closing exposed ports and rotating provider keys (recommended) | Partial | Partial | Not effective |
| Auditing the learning store for injected entries (after the fact; recommended) | Not relevant | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

The blocklist sits in the autopilot flow, and the `/mcp` entry point did not pass through it (Noma Security). The fixed version listens on loopback by default, refuses to expose itself without a token and requires Bearer authentication, closing the reported entry point, but as the maintainer's advisory says, it does not undo poisoning already in place. Closing ports and rotating keys cuts the outside route and the use of stolen keys, but does not reach what remains in memory. An audit finds and removes injected entries afterwards, but does not stop the writes themselves. Lemma checks tool execution against whether the requester is allowed in the operator's records, so execution through unauthenticated requests stops before it runs. Memory writes not tied to the record of an allowed requester are also kept out, but whether a pattern written by an allowed requester is good or bad is not what the check looks at.

Note: Lemma's check works only when it is built in just before the MCP Bridge's execution and before writes to the learning store, and the records of who may use which tools are managed apart from values the requester can specify. It can be passed if an allowed requester's key or machine is stolen, or if code running inside the container opens a path that bypasses the check. Lemma does not delete patterns already in memory and does not rotate keys already exposed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that self-host an AI agent platform

- Have you updated Ruflo (formerly Claude Flow) to 3.16.3 or later and set the MCP Bridge to listen on loopback only?
- Do you keep a list of the model provider keys given to your agent platform, with a procedure to rotate them when exposure is suspected?
- Can you match the patterns in your agents' memory (learning store) against a record of who wrote them and when?

## 5. Facts and timeline

- **Subject**: The MCP Bridge of Ruflo (formerly Claude Flow — an orchestration platform that hosts swarms of AI agents for Codex and Claude Code, maintained by Reuven Cohen). Affects versions below 3.16.3.
- **Reporter**: Noma Security (Noma Labs). Code-named RufRoot, CVE-2026-59726, CVSS 10.0.
- **Researchers' report (exposure)**: The default docker-compose bound port 3001 to `0.0.0.0`, exposing the MCP Bridge (an Express.js server) on every network. `POST /mcp` and `POST /mcp/:group` exposed 233 tools with no authentication, no token and no header check. The dangerous-operation blocklist in the autopilot flow does not apply at the `/mcp` entry point.
- **Researchers' report (what could be reached)**: A shell inside the container, each provider's keys passed as environment variables, attacker-controlled swarms launched with the victim's keys, conversation data in an unauthenticated internal database, and writes to the container that survive restarts.
- **Researchers' report (memory poisoning)**: Poisoned patterns could be placed in the learning store (AgentDB pattern store) to steer later responses toward the attacker's instructions. The poisoning can remain in the learning store after the fix.
- **Exploitation**: Whether the flaw was exploited in the wild, and the scale of any impact, was not established at the time of disclosure.

### Timeline

- **2026-06-30**: Noma Labs discloses responsibly to the maintainer.
- **2026-06-30**: Within hours of disclosure, the maintainer ships a fix. A full fix is merged and a security advisory issued within 24 hours.
- **2026-07-28–29**: Public disclosure and media reporting (Noma Security's research published on 07-29). Recorded as CVE-2026-59726 (CVSS 10.0).

> The facts here rest on the discoverer's primary publication (Noma Security / Noma Labs) and reporting by security media. The CVE number, CVSS score, affected versions and tool count (233) rest on the primary publication. Whether the flaw was exploited in the wild, and the scale of any impact, was not established at the time of disclosure. This Brief does not assign fault to any specific operator, and does not include steps to reproduce the attack. What has not been disclosed does not mean no countermeasures were in place.

### Response after disclosure

- **Maintainer (fix)**: The MCP Bridge now binds to loopback by default and refuses to start (fail-closed) if a public bind is attempted without an auth token set. Bearer authentication, `terminal_execute` off by default, database authentication on boot and read-only containers were introduced.
- **Maintainer (advice to operators)**: Operators of exposed instances were advised to close the ports immediately, rotate all provider keys and audit the learning store (AgentDB pattern store) for injected entries. The advisory states explicitly that a patched redeploy alone does not undo the poisoning.

## 6. Sources

- Noma Security (Noma Labs), “RufRoot: The MCP Bridge Vulnerability That Turns Agents Into Rogue Admins (CVE-2026-59726)” (2026-07-29, primary) — <https://noma.security/blog/rufroot-the-mcp-bridge-vulnerability-that-turns-agents-into-rogue-admins-cve-2026-59726/>
- The Hacker News, “Ruflo MCP Flaw Lets Unauthenticated Attackers Run Commands and Poison AI Memory” (2026-07) — <https://thehackernews.com/2026/07/ruflo-mcp-flaw-lets-unauthenticated.html>
- Dark Reading, “Patch-Resistant RufRoot Flaw Enables Malicious AI Agent Swarms” (2026-07) — <https://www.darkreading.com/cyber-risk/patch-resistant-rufroot-flaw-malicious-ai-agent-swarms>
- SecurityWeek, “Critical Ruflo Flaw Lets Attackers Spawn Rogue AI Swarms” (2026-07) — <https://www.securityweek.com/critical-ruflo-flaw-lets-attackers-spawn-rogue-ai-swarms/>
- NVD, “CVE-2026-59726” (2026-07) — <https://nvd.nist.gov/vuln/detail/CVE-2026-59726>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
