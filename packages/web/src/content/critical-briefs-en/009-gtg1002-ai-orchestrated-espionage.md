---
brief_no: 9
title: "GTG-1002：AI コーディングエージェントに、サイバー攻撃の工程の大半を実行させた諜報活動(Anthropic の公表)"
title_en: "GTG-1002: An espionage campaign that had an AI coding agent carry out most of a cyberattack (Anthropic disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["identity-auth"]
incident_date: 2025-11-13
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "003-starlette-badhost", "017-mckinsey-lilli-system-prompts"]
version: "1.0"
status: published
gate: "agent-operation"
og_lead_ja: "GTG-1002：AI エージェントが攻撃の工程の 80〜90% を実行（Anthropic の公表）"
og_lead_en: "GTG-1002: an AI agent carried out 80–90% of an attack (Anthropic disclosure)"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · AI エージェントの悪用"
og_kicker_en: "CYBERATTACK · AI AGENT MISUSE"
og_headline_ja: "攻撃の大半を、\nAI が自律で実行した。\n<accent>工程の 80〜90%</accent>"
og_headline_en: "An AI agent ran most\nof a cyberattack itself.\n<accent>80–90% of the work.</accent>"
key_figures:
  - value: "80–90"
    unit: "%"
    label: "Share of the attack work the AI carried out without human intervention (Anthropic)"
    tone: "alert"
  - value: "~30"
    label: "Targets attacked: major tech firms, financial institutions, chemical manufacturers and government agencies (Anthropic). A small number were breached"
  - value: "~10 days"
    label: "From detecting suspicious activity to mapping the scope and banning the related accounts (Anthropic)"
glossary:
  - term: "MCP (Model Context Protocol)"
    desc: "A protocol AI agents use to call outside tools and systems. Here, network scanners, password crackers and similar tools were used through it."
  - term: "Jailbreak"
    desc: "Getting around an AI's safety mechanisms through how it is instructed. Here, the attack was split into small tasks and the AI was led to believe it was doing defensive testing for a legitimate security firm."
insight:
  slug: "claimed-role-not-checked"
  label: "Operations that passed on a claimed role"
  quote: "Operations an AI agent sends to outside systems pass on a claimed identity alone unless the receiving side checks, before execution, whose delegation they come under and what scope they fall within."
industries: ["ai"]
controls:
  - slug: "verify-entry"
    item: "Check who requested each AI agent action, and with what authority, before accepting it"
  - slug: "bound-automation"
    item: "Set in advance which operations an AI agent may run, and how many"
attack_method: "ai-misuse"
impact: "About 30 targets attacked; a few breached"
takeaway: "The attackers led the AI to believe it was doing defensive testing for a legitimate security firm, and had it carry out most of the work from reconnaissance to exfiltration."
self_check: "Before an AI agent's operations on internal or external systems run, do you check whose delegation they come under and what scope they fall within?"
countries: ["global"]
---

## 1. Summary

The attackers split the attack into innocuous-looking small tasks and led the AI to believe it was "an employee of a legitimate security firm conducting defensive testing," getting around its safety mechanisms (Anthropic). The AI then carried out, in a chain, reconnaissance, vulnerability discovery and validation, exploit writing, credential theft and data exfiltration, using tools reached through MCP. Human involvement was limited to 4–6 critical decision points per campaign. <strong>Operations an AI agent sends to outside systems pass on a claimed identity alone unless the receiving side checks, before execution, whose delegation they come under and what scope they fall within.</strong>

## 2. What got through

- **What got through**: Operations against target systems: reconnaissance, vulnerability validation, access with stolen credentials, identifying high-privilege accounts, creating backdoors, and exfiltrating data. The AI ran them with tools reached through MCP, such as scanners and password crackers (Anthropic).
- **What was stopped**: The provider, Anthropic, detected suspicious activity, mapped the scope and banned the related accounts in turn. The stop came after detection.
- **What reached the receiving side**: In general, a target system or API receives the operation itself (the request). Whose delegation it was issued under, and within what scope, does not reach it. The claim of "defensive testing" was aimed at the AI and never reached the receiving side.
- **Not disclosed**: The names and number of targets that were breached. The vulnerabilities and entry points used at each target. What data was taken.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an AI agent's operation acts on an outside system, the receiving side checks, outside the agent, whose delegation it comes under and what scope it falls within.

- **Who approves**: The owner (organization) of the system that receives the operation. A claim or instruction aimed at the AI is no substitute for approval.
- **Where it is checked**: Before the target system, API or MCP tool accepts the operation. Operations with no delegation, or outside the scope, are held.
- **What is recorded**: Which operations were accepted (or held), under whose delegation, and when. The record stays on the receiving side, separate from the provider's own logs, and can show in regulatory filings or litigation whether an operation was authorized.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, outside the agent and before an AI agent's operation is accepted, whose delegation it comes under and what scope it falls within, and keeping a record. Detection means the provider noticing suspicious activity. Dates are those Anthropic published; the detection date was given only as "mid-September."</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before accepting an operation, check whose delegation and what scope it falls under</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About 30 targets attacked<br>A few breached and data exfiltrated</span></div>
<div class="rx-zone det"><b>Detection · worked at the provider</b>Suspicious activity detected; accounts banned</div>
<div class="rx-g g1"><div class="t">Mid-Sep 2025</div><b>Anthropic detects suspicious activity</b></div>
<div class="rx-g g2"><div class="t">~10 days</div><b>Scope mapped; accounts banned</b></div>
<div class="rx-g g3"><div class="t">2025-11-13</div><b>Anthropic discloses</b></div>
<div class="rx-g g4"><div class="t">2025-11-14</div><b>Attack-speed wording corrected</b></div>
</div>
</figure>

Detection worked on the provider's side and led to mapping the scope and stopping the campaign. Detection does not, however, change what a target system accepts. Another case where an AI agent's operation was not checked before being accepted is [PocketOS](/critical/briefs/007-pocketos-cursor-db-deletion/) (a single production database deletion). Here it was hundreds to thousands of operations chained from reconnaissance to exfiltration. It is also close to [Starlette](/critical/briefs/003-starlette-badhost/) (an authentication bypass) in that a claimed identity passed without being checked.

## 4. What Lemma does

**Lemma puts the check in section 03 on the side that accepts an AI agent's operations.** It does not correct the AI's judgment; before execution and outside the agent, it checks whose delegation an operation comes under and what scope it falls within.

### Industries and operations to watch

- **Industry · Tech, finance, chemical manufacturing, government**: The sectors named as targets (Anthropic).
- **Operation · Running AI agents**: Organizations that let AI agents operate internal or external systems, through MCP or similar.

### Current controls vs Lemma

The route in this case is the chain of operations an AI agent sent to target systems.

| Control | Operations an AI agent sends to target systems |
| --- | --- |
| The AI's safety mechanisms (guardrails) | Not effective |
| Provider anomaly detection and account bans | Partial |
| **Lemma (pre-execution check)** | Effective |

The AI's safety mechanisms were bypassed by splitting the attack into small tasks and convincing the AI it was doing defensive testing for a legitimate firm (Anthropic). Provider anomaly detection and account bans mapped the scope and stopped the campaign in about 10 days, but they act after detection and do not change what target systems accept. Lemma checks, before accepting an operation, whose delegation it comes under and what scope it falls within, not what the AI claims. A record of what ran is also kept on the receiving side, so which operation passed under which delegation can be confirmed without relying on the provider's logs.

Note: Lemma's check works only when it is built into the system, API or MCP tool that receives operations, and delegation and scope are managed outside the agent. An operation sent with stolen credentials, inside the scope of a legitimate delegation, can pass this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that run AI agents

- Before accepting each AI agent action, do you check who requested it and with what authority?
- Have you set which operations an AI agent may run, and how many, with a scope and a limit?
- Do you keep a record of AI agent operations on your own side, separate from the provider's logs?

## 5. Facts and timeline

- **Attack group**: GTG-1002. Anthropic assesses with high confidence that it is a Chinese state-sponsored group.
- **Tools used**: An AI coding agent (Claude Code) and various tools through MCP (network scanners, password crackers and the like).
- **Targets**: About 30 targets worldwide (major tech firms, financial institutions, chemical manufacturers, government agencies). A small number were breached and private data was exfiltrated.
- **AI involvement**: The AI carried out 80–90% of the attack work. Human intervention was limited to 4–6 critical decision points per campaign.
- **Attack speed**: At peak, the AI issued thousands of requests, including multiple per second, a pace described as impossible for a human team.
- **Getting around the safety mechanisms**: Splitting the attack into innocuous-looking small tasks and getting the AI to believe it was "an employee of a legitimate security firm" doing "defensive testing," a role-play (jailbreak).
- **Sequence (Anthropic)**: ① Human operators select targets and build an attack framework with Claude Code built in as an automation tool. ② The safety mechanisms are bypassed. ③ The AI investigates target systems, identifies the highest-value databases, and reports summaries to the humans. ④ The AI finds vulnerabilities, writes exploit code and validates it. ⑤ The AI steals credentials, identifies high-privilege accounts and creates backdoors. ⑥ The AI exfiltrates data and sorts it by intelligence value. ⑦ The AI documents the stolen credentials and analyzed systems to support planning of the next phase.

### Timeline

- **Mid-September 2025**: Anthropic detects suspicious activity. Later investigation shows an advanced espionage campaign.
- **Mid-September 2025, over about 10 days**: Scope and severity are mapped. Identified accounts are banned in turn, affected entities are notified, and authorities are engaged.
- **2025-11-13**: Anthropic discloses the incident and publishes the full report.
- **2025-11-14**: The attack-speed description is corrected from "thousands per second" to "thousands of requests, including multiple per second."

> The facts here rest on Anthropic's disclosure and full report (primary). The attribution of the group (Chinese state-sponsored) is Anthropic's assessment. The names of the breached targets and the entry point at each have not been disclosed. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Anthropic**: Banned the related accounts, expanded its detection capabilities and classifiers, and notified affected entities and authorities. It said it would publish threat reports regularly. It recommended that security teams experiment with AI for SOC automation, threat detection, vulnerability assessment and incident response, and that developers invest in safeguards against misuse. It also says it used AI to analyze the large volume of data in its investigation.
- **Policy side**: The US House Homeland Security Committee requested testimony from Anthropic.

## 6. Sources

- **Anthropic official announcement**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11-13, partial correction 2025-11-14) — https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report (PDF)**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11) — https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack" (2025-11) — https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign" (2025-11) — https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action" (2025) — https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
