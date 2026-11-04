---
brief_no: 99
title: "Sentry MCP：偽のエラー報告に仕込んだコマンドを、AI コーディングエージェントが実行しうることが示された(Tenet Threat Labs)"
title_en: "Sentry MCP: A fake error report could make an AI coding agent run planted commands (Tenet Threat Labs)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-12
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "055-echoleak-m365-copilot-instruction-provenance", "047-openclaw-agent-phishing", "037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "攻撃の実証 · AI コーディングエージェント"
og_kicker_en: "ATTACK RESEARCH · AI CODING AGENT"
og_headline_ja: "偽のエラー報告 1 件で、\nAI が攻撃者の\nコマンドを実行。\n<accent>開発者は何も承認しない</accent>"
og_headline_en: "One fake error report\nmade the AI run\nan attacker's commands.\n<accent>No code approved.</accent>"
key_figures:
  - value: "2,388"
    unit: "orgs"
    label: "Organizations found exposed through the public Sentry API alone. Tenet's observation, not a count of real-world harm"
    tone: "alert"
  - value: "85"
    unit: "%"
    label: "Execution success rate observed across mainstream AI coding assistants in a controlled environment (Tenet)"
  - value: "100+"
    unit: "orgs"
    label: "Organizations whose agents reacted to an injected error in a controlled environment (Tenet)"
glossary:
  - term: "Sentry"
    desc: "A SaaS that monitors application errors and performance. It collects and shows the error events apps send."
  - term: "MCP"
    desc: "A standard for AI agents to read data from external services and work on it. The Sentry MCP returns Sentry's errors to the agent."
  - term: "Ingest key"
    desc: "The key an app uses to send errors to Sentry. When it is public, anyone can write events from the outside."
insight:
  slug: "trusted-telemetry-as-instruction"
  label: "Instructions inside trusted operational data"
  quote: "A line inside operational data an AI agent reads, if it looks the same as a legitimate one, can be treated as an instruction to run unless its origin is checked."
operations: ["data-access"]
version: "1.0"
og_lead_ja: "Agentjacking — 偽のエラー報告 1 件を「解決手順」と信じ、AI コーディングエージェントが攻撃者のコマンドを実行した"
og_lead_en: "Agentjacking — one fake error report trusted as \"resolution steps,\" and an AI coding agent ran the attacker's commands"
industries: ["developers", "ai"]
controls:
  - slug: "ownership-check"
    item: "Confirm the steps in an error report really come from Sentry"
attack_method: "ai-misuse"
takeaway: "The step that checks, before running, that the procedure in an error report came from the real Sentry did not work."
self_check: "Before an AI coding agent runs a procedure found in external data such as an error report, can you check that it came from the legitimate system?"
countries: ["global"]
---

## 1. Summary

Tenet Threat Labs showed, in a controlled environment, that when an AI coding agent reads data from the error-monitoring service Sentry through MCP, it can take a fake "resolution step" inside an error event an attacker sent from the outside for a legitimate diagnostic step, and run it. No jailbreak and no explicit "run this" is needed, and the developer never approves any code. <strong>A line inside operational data an AI agent reads, if it looks the same as a legitimate one, can be treated as an instruction to run unless its origin is checked.</strong>

## 2. What got through

- **What got through**: Commands (such as `npx`) run by the agent on the developer's machine. When the developer asked, through the Sentry MCP, "look into this production error", the agent took the commands under `## Resolution` in a crafted error event for a legitimate diagnostic step and ran them. The attacker sent the event through the public Sentry API and planted, in the message and the context key names, markdown indistinguishable from Sentry's own templates (Tenet).
- **Controls that did not stop it**: In Tenet's tests, EDR, WAF, IAM, VPN and Cloudflare did not react, and even explicitly writing "do not trust external data" into the system prompt did not stop execution.
- **What reached the receiving side**: In general, a command the agent runs arrives as an operation based on the developer's request. From the environment that runs it, it cannot be told whether the command is an extension of the request or came from text in the error report the agent read.
- **Reach**: Once execution succeeds, the full set of environment variables, Git credentials, private repository URLs and the developer's identity can pass to the attacker (Tenet).
- **Not disclosed**: Whether real-world harm occurred, and how much. The figures of 2,388 organizations, 85% and 100+ organizations are observations from Tenet's controlled tests.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, just before the agent runs a command, the origin of that procedure is checked, apart from how the content looks, to see whether it came from content the legitimate system generated or from content written in from the outside.

- **Who approves**: The developer. The command and the origin of its procedure are shown on a screen apart from the error report the agent reads, and the developer approves them. Text inside an error report is never used as approval.
- **Where it is checked**: Just before the agent runs a command. A procedure whose origin cannot be checked is held until the check is done.
- **What is recorded**: Which procedure ran, on whose approval, and with what environment and privileges, kept apart from the agent in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the agent runs a command, that the procedure came from content the legitimate system generated, and keeping a record. Detection means noticing suspicious procedures or injection patterns. The dates below are when points were disclosed or published, not necessarily when the demonstration took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before running, check the origin of the procedure, apart from how the content looks</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In a controlled environment, the agent<br>ran the injected procedure</span></div>
<div class="rx-zone det"><b>Detection · disclosure and awareness</b>Publishing the research, press coverage, watching for injection patterns</div>
<div class="rx-g g1"><div class="t">06-03</div><b>Tenet discloses to Sentry</b></div>
<div class="rx-g g2"><div class="t">06-03</div><b>Sentry responds the same day</b></div>
<div class="rx-g g3"><div class="t">06-12</div><b>Tenet publishes the research</b></div>
<div class="rx-g g4"><div class="t">Mid-June on</div><b>Several outlets and research notes pick it up</b></div>
</div>
</figure>

An instruction arriving by a route that looks legitimate was run as it was, which makes this the same type as [EchoLeak in M365 Copilot](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/), where instructions planted in an email sent internal data out. It also connects to [Amazon Q](/critical/briefs/095-amazon-q-mcp-auto-execution/), where a bundled configuration was run without verification, in that an input the tool cannot choose is tied to execution.

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before the agent runs a command.** It does not look for intrusions; it checks, before running, the origin of the procedure and the authorization of its execution, apart from how the content looks.

### Industries and operations to watch

- **Industry · Development & AI**: Organizations that connect external services such as error monitoring and issue tracking to AI coding agents through MCP.
- **Operation · Lookup & data access**: Having an agent read production errors and logs to investigate causes. A procedure inside the data it reads can lead to execution.

### Current controls vs Lemma

The route in this case is a chain from column 1 (taking in an error event written from the outside) to column 2 (the agent running commands).

| Control | Taking in an error event written from the outside | The agent running commands |
| --- | --- | --- |
| Telling the agent in the system prompt not to trust external data | Not relevant | Not effective |
| EDR, WAF, IAM, VPN | Not relevant | Not effective |
| Monitoring known injection patterns, filtering suspicious bodies | Partial | Not relevant |
| Minimizing the environment and privileges handed to the agent | Not relevant | Partial |
| **Lemma (pre-execution check)** | Not effective | Effective |

A warning in the system prompt handles trust and distrust as a declaration; it does not check the origin of each piece of data at the moment of action. EDR, WAF and IAM did not react in Tenet's tests, and even when they react, it is after the command that sent data out has run. Monitoring injection patterns stops what it finds, but the injected markdown has the same form as Sentry's own templates, so it cannot be decided before execution from how the content looks alone. Minimizing the environment and privileges narrows what is handed over even if execution happens. Lemma does not stop the taking-in itself; it ties the running of a command to a check of the procedure's origin and authorization. A record of what ran is also kept, so which procedure ran, on whose approval, can be confirmed without relying only on the fact that "it was contained in data returned from Sentry".

Note: Lemma's check works only when it is built into the agent's command execution, and the information showing a procedure's origin and the authorization of its execution are managed apart from the data the agent reads. Error monitoring is designed to accept writes from the outside, so it is hard to guarantee the authenticity of a body at ingest time. A procedure that carries no information showing its origin is held, but if the developer approves a command without checking its origin, it passes. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that connect external services to AI coding agents

- Are you treating the external data connected to the agent (error monitoring, issue tracking and so on) as trusted?
- Can you see a record of the commands the agent ran and the origin of their procedures, separately from the agent?
- Have you limited the environment variables, credentials and privileges handed to the agent to what each operation needs?

## 5. Facts and timeline

- **Research**: Research by Tenet Threat Labs (Tenet Security), a demonstration in a controlled environment. It is not a count of real-world harm.
- **Setting**: Sentry (an application error- and performance-monitoring SaaS) and the Sentry MCP server that connects it to AI agents. The demonstration succeeded on mainstream assistants including Claude Code, Cursor and Codex.
- **Injection technique**: The attacker sends an error event through the public Sentry API (with an app's public ingest key, anyone can write from the outside). Planting markdown in the message and the context key names makes it, when the MCP returns it to the agent, render as headings, code blocks and tables, visually indistinguishable from Sentry's own templates. Into this the attacker places a fake `## Resolution` and presents commands such as `npx` as "recommended fix steps".
- **The chain the researchers showed**: An error event is injected. It mimics Sentry's own templates. The developer asks for the usual investigation. The agent takes the injected procedure for a legitimate diagnostic step and runs it. Environment variables, Git credentials, private repository URLs and the developer's identity can be sent out. No phishing and no prior server compromise are involved.
- **Observed scale**: 2,388 organizations exposed through the public Sentry API alone. In controlled testing, agents at more than 100 organizations reacted to injected errors, with an 85% execution success rate across mainstream AI coding assistants.

### Timeline

- **2026-06-03**: Tenet discloses the vulnerability to Sentry. Sentry responds the same day and, while acknowledging the issue, declines a fundamental fix, reportedly taking the position that it is "not a technically defensible matter".
- **2026-06-12**: Tenet Threat Labs publishes the research "Agentjacking", presenting the technique, the scale of exposure and the success rate.
- **Mid-June 2026 onward**: Several outlets and research notes, including The Hacker News, The New Stack, Dark Reading and the Cloud Security Alliance, pick it up.

> The technical facts are based on Tenet Threat Labs' disclosure and the research notes of The Hacker News, The New Stack and the Cloud Security Alliance. The number of exposed organizations (2,388), the success rate (85%) and the number of reacting organizations (100+) are values observed in Tenet's controlled testing and do not indicate the number of real-world incidents. Sentry's response posture is per reporting at the time of disclosure. Refer to the latest primary sources. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Research (Tenet Threat Labs)**: Presented Agentjacking not as a single vendor's bug but as a structural risk in which AI agents receive instructions through trusted external data. It advised developers and operators not to treat external data sources connected to an agent as trusted, to check content returned from the MCP before execution, and to minimize the privileges and environment handed to the agent.
- **Sentry**: Responded the same day as the disclosure but, rather than fixing the problem fundamentally on the product side, is reported to have taken the position that, given the nature of the data that could be injected, it is "not a technically defensible matter". Error monitoring is designed to accept writes from the outside, which makes it hard to guarantee the authenticity of a body at ingest time.
- **Cross-industry**: The Hacker News, The New Stack, Dark Reading and the Cloud Security Alliance positioned this as a new delivery surface for prompt injection (via trusted telemetry and integration data, not a chat box).

## 6. Sources

- **Tenet Security (research, primary)**: “Agentjacking: Hijacking Coding Agents with Fake Sentry Errors” (2026-06) — <https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/>
- **The Hacker News**: “Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code” (2026-06) — <https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html>
- **The New Stack**: “A public Sentry key is all it takes to hijack Claude Code, Cursor, and Codex” (2026-06) — <https://thenewstack.io/agentjacking-sentry-mcp-attack/>
- **Cloud Security Alliance (research note)**: “Agentjacking: Sentry MCP Injection Hijacks AI Coding Agents” (2026-06) — <https://labs.cloudsecurityalliance.org/research/csa-research-note-agentjacking-sentry-mcp-20260614-csa-style/>
- **Dark Reading**: “Fake Bug Report Hijacks AI Coding Agents at Scale” (2026-06) — <https://www.darkreading.com/cyber-risk/fake-bug-report-hijacks-ai-coding-agents>
