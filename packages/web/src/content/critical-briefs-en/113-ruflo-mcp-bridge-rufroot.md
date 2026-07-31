---
brief_no: 113
title: "Ruflo の MCP Bridge：一つの無認証リクエストが 233 の高権限ツールを開き、パッチ後も記憶の汚染が残る — 実行の前に、ツール呼び出しの認可と記憶の来歴が独立検証されない"
title_en: "Ruflo's MCP Bridge: one unauthenticated request opened 233 high-privilege tools, and the memory poisoning survives the patch — tool-call authorization and memory provenance are never verified before execution"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-28
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["066-litellm-ai-gateway-privilege-escalation", "088-kestra-auth-filter-bypass-rce", "046-servicenow-unauthenticated-api", "095-amazon-q-mcp-auto-execution", "073-shadowmq-pickle-zmq-pattern"]
status: published
version: "1.0"
og_lead_ja: "Ruflo MCP Bridge に無認証 RCE（CVE-2026-59726）、記憶汚染はパッチ後も残る"
og_lead_en: "Ruflo MCP Bridge unauthenticated RCE: memory poisoning survives the patch"
gap_detected: "The flaw was found through responsible disclosure and the maintainer shipped a patch and advisory within 24 hours."
gap_missing: "A layer that independently verifies, before execution, per-call tool-call authorization and the provenance and integrity of the agent's memory (learning store)."
gap_fix: "Prove tool-call authorization before execution and independently verify agent-memory provenance and integrity, excluding unauthenticated execution and the persistence of poisoning."
---

## 1. TL;DR

A maximum-severity flaw was found in the MCP Bridge of Ruflo (formerly Claude Flow — an orchestration platform that hosts swarms of AI agents for Codex and Claude Code, maintained by Reuven Cohen). Code-named RufRoot, CVE-2026-59726, CVSS 10.0, affecting versions below 3.16.3. The default docker-compose deployment exposes the MCP Bridge's `POST /mcp` and `POST /mcp/:group` on the network with no authentication, surfacing 233 high-privilege tools (shell execution, database operations, agent management, memory storage), including `terminal_execute`. An unauthenticated network attacker can call `terminal_execute` via `tools/call` and obtain a shell inside the container. The discovery is by Noma Security (Noma Labs); responsible disclosure was 2026-06-30, and the fix shipped within 24 hours. Detection and disclosure worked. **What was missing is the layer that independently verifies, before execution, whether a tool call is authorized and whether the poisoning left in the agent's memory has verified provenance and integrity.**

## 2. What happened

- The flaw was found by Noma Labs and published as CVE-2026-59726 (CVSS 10.0), affecting Ruflo below 3.16.3. The default docker-compose binds port 3001 to `0.0.0.0`, exposing the MCP Bridge (an Express.js server) on all network interfaces.
- The MCP Bridge is the single path through which every tool call in Ruflo flows, and it exposes 233 tools over HTTP with no authentication, no token, and no header check. The exposed tools include the shell-executing `terminal_execute`. A dangerous-operation blocklist exists in the autopilot flow, but the `/mcp` endpoint bypasses it entirely.
- Using the victim's own provider keys and compute, an attacker can spawn attacker-controlled swarms. The core of this incident is that the attacker can further inject poisoned patterns into the AgentDB learning store (pattern store), persisting a steer of future AI responses toward the attacker's instructions.

The attack succeeds through the following chain.

1. Reconnaissance: call `tools/list` without authentication to enumerate all 233 available tools.
2. Remote code execution: call `terminal_execute` via `tools/call` to obtain arbitrary shell commands inside the bridge container.
3. API key theft: because docker-compose passes each provider's keys as environment variables, read the container environment to harvest them.
4. Agent weaponization: with the victim's keys, call `swarm_init` and `agent_spawn` to launch attacker-controlled swarms.
5. Memory poisoning: inject poisoned patterns into the learning pipeline via `agentdb_pattern-store`, steering future responses toward the attacker's instructions. The poisoning can remain in the learning store after the patch.
6. Persistence: exfiltrate conversation data from an unauthenticated database on the internal network and write a backdoor into the container to maintain a foothold across restarts.

## 3. Timeline — disclosure and response

- 2026-06-30: Noma Labs discloses responsibly to the maintainer.
- 2026-06-30 (within hours of disclosure): the maintainer ships a fix. A full patch is merged and a security advisory issued within 24 hours.
- 2026-07-28 to 29: public disclosure and media reporting. Recorded as CVE-2026-59726 (CVSS 10.0).

> Note: the facts here rest on the discoverer's primary publication (Noma Security / Noma Labs) and reporting by established security media. Whether exploitation occurred in the wild, and the scale of any impact, is not fixed as of publication. This Brief does not condemn any specific operator's negligence; it focuses on the structure in which unauthenticated tool calls and the poisoning left in the learning store are not independently verified before execution. The CVE number, CVSS score, affected version, and tool count (233) rest on the primary publication.

Response and industry movement after disclosure are as follows.

- In the fix, the MCP Bridge binds to loopback by default and fails closed if a public bind is attempted without an auth token set. Bearer authentication, defaulting `terminal_execute` off, database authentication on boot, and read-only containers were introduced.
- The maintainer advised operators of exposed instances to immediately close the ports, rotate all provider keys, and audit the learning store (AgentDB pattern store) for injected entries. It states explicitly that a patched redeploy alone does not undo the poisoning.

## 4. Why it wasn't stopped

The failure here is not that the flaw was found late, nor that no patch was produced. It is that there was no layer to independently verify, before execution, whether a tool call was authorized right now, and the provenance and integrity of any poisoning injected into the agent's memory. Detection worked: the flaw was found through responsible disclosure, the fix shipped within 24 hours, and an advisory was published. What was missing sits earlier — authorization verification at the instant a tool call completes, and provenance verification of the patterns written into the learning store.

An unauthenticated `tools/call` was indistinguishable from a legitimate tool call along the path. A request that reached the bridge was passed straight to `executeTool()` whatever its origin, and high-privilege tools including `terminal_execute` ran as-is. The fact that a call arrived stood in for permission to execute, and whether that call was actually authorized for this operation, right now, was never asked before execution. And once a poisoned pattern is written, it remains in the learning store even after the flaw itself is patched. Simply patching the software does not guarantee restoring trust against memory poisoning left inside the AI system.

> That the poisoning survives the patch is what separates this incident from an ordinary one-time RCE. Detection and the patch close the exposed execution path. But the patterns left in the learning store keep steering future responses toward the attacker's instructions, and the provenance and integrity of that memory remain unverified. What remains after the path is closed is memory of unknown provenance.

The same structure connects to [Brief 066 (LiteLLM AI gateway privilege escalation)](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/), [Brief 088 (Kestra auth-filter bypass RCE)](/critical/briefs/088-kestra-auth-filter-bypass-rce/), and [Brief 046 (ServiceNow unauthenticated API)](/critical/briefs/046-servicenow-unauthenticated-api/), where a privilege boundary passed unverified before execution; to [Brief 095 (Amazon Q MCP auto-execution)](/critical/briefs/095-amazon-q-mcp-auto-execution/), where an agent executed a tool call without verification; and to [Brief 073 (ShadowMQ pickle/ZMQ pattern)](/critical/briefs/073-shadowmq-pickle-zmq-pattern/), where poisoning was brought in at execution time and persisted. Each shows that a call arriving on the path, an action being authorized right now, and that memory carrying correct provenance are separate questions.

## 5. What proof would have changed

Proof-as-auth inserts a layer, ahead of each individual action in which an agent calls a tool or writes to memory, that independently verifies the authorization state and the memory's provenance. Rather than letting the fact that a call arrived stand in for permission to execute, it checks — before the action completes — whether this call is authorized for this operation, in this scope, right now. If the answer is "not authorized" or "provenance unknown," the execution and the write are held in advance. Because a pattern's provenance is verified before it enters the learning store, poisoning is separated out before execution regardless of whether a patch is present.

The design Lemma offers for this primitive is as follows.

- **Per-action authorization proof**: bind a `tools/call` not to network reachability, but to an independently verifiable proof of being authorized for the operation now. An unauthenticated tool call does not complete before execution.
- **Agent-memory provenance and integrity verification**: admit into the learning store (AgentDB and the like) only patterns that have passed provenance verification. Injected poisoned patterns are separated out before the write as lacking provenance, and do not persist after the patch.
- **Least privilege and secret separation**: separate shell execution, keys, and database access under per-action authorization rather than bundling them into a single bridge — cutting off, by design, the path where one unauthenticated request reaches every privilege.
- **Selective execution records**: retain a tamper-evident record of which tool was called under what authorization, and which pattern entered memory with what provenance, so the execution path and memory provenance can be independently established after the fact.

Lemma is not a product that patches the flaw itself, nor one that closes an exposed endpoint. Its scope is to verify authorization and provenance before tool calls and memory writes occur, excluding the passage of unauthenticated execution and poisoned patterns before execution. Detection (finding the flaw, patching, closing the path) and pre-execution proof (a record that independently verifies authorization and memory provenance before execution) are complements, not substitutes. The former serves catching and closing the exposed path; the latter serves cutting off, before execution, the memory poisoning that persists after the patch. See [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05) and [Agent Authority](/pillars/agent-authority-proof/).

## 6. Sources

- Noma Security (Noma Labs), “RufRoot: The MCP Bridge Vulnerability That Turns Agents Into Rogue Admins (CVE-2026-59726)” (2026-07-29, primary) — <https://noma.security/blog/rufroot-the-mcp-bridge-vulnerability-that-turns-agents-into-rogue-admins-cve-2026-59726/>
- The Hacker News, “Ruflo MCP Flaw Lets Unauthenticated Attackers Run Commands and Poison AI Memory” (2026-07) — <https://thehackernews.com/2026/07/ruflo-mcp-flaw-lets-unauthenticated.html>
- Dark Reading, “Patch-Resistant RufRoot Flaw Enables Malicious AI Agent Swarms” (2026-07) — <https://www.darkreading.com/cyber-risk/patch-resistant-rufroot-flaw-malicious-ai-agent-swarms>
- SecurityWeek, “Critical Ruflo Flaw Lets Attackers Spawn Rogue AI Swarms” (2026-07) — <https://www.securityweek.com/critical-ruflo-flaw-lets-attackers-spawn-rogue-ai-swarms/>
- NVD, “CVE-2026-59726” (2026-07) — <https://nvd.nist.gov/vuln/detail/CVE-2026-59726>

References: [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Agent Authority](/pillars/agent-authority-proof/) · [Brief 095 (Amazon Q MCP auto-execution)](/critical/briefs/095-amazon-q-mcp-auto-execution/) · [Brief 066 (LiteLLM privilege escalation)](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)
