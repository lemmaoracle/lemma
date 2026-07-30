---
brief_no: 99
title: "Agentjacking：偽のエラー報告 1 件を「解決手順」と信じ込み、AI コーディングエージェントが攻撃者のコマンドを実行した"
title_en: "Agentjacking: an AI coding agent trusted a single fake error report as its \"resolution steps\" and ran the attacker's commands"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-12
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "055-echoleak-m365-copilot-instruction-provenance", "047-openclaw-agent-phishing", "037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection"]
status: published
version: "1.0"
og_lead_ja: "Agentjacking — 偽のエラー報告 1 件を「解決手順」と信じ、AI コーディングエージェントが攻撃者のコマンドを実行した"
og_lead_en: "Agentjacking — one fake error report trusted as \"resolution steps,\" and an AI coding agent ran the attacker's commands"
gap_detected: "The detection chain worked — Tenet Threat Labs' research disclosure, the quantification of exposed organizations and success rate, the visibility of the technique across multiple outlets and research notes, and responsible disclosure to Sentry — making the risk externally visible."
gap_missing: "There is no layer that independently verifies — decoupled from how the content looks — before an agent turns an instruction derived from external data into action, whether that instruction (the error report) originates from the legitimate system and whether its execution is authorized."
gap_fix: "Before executing an instruction derived from external data, such as the resolution steps in error triage, verify the provenance of that instruction and the authorization of its execution — decoupled from how the content looks — and stop execution when no proof accompanies it, verified independently by Lemma, and prevent it up front."
---

## 1. TL;DR

Tenet Threat Labs disclosed a new attack it named "Agentjacking" that makes AI coding agents (Claude Code, Cursor, Codex) run an attacker's code on the developer's machine. Using nothing but Sentry's public API, the attacker sends a crafted error event into the error-monitoring service Sentry, planting in its message and context markdown indistinguishable from Sentry's own system templates and embedding commands such as `npx` under a fake "## Resolution" section. When the developer, as usual, asks the agent to triage "look into this error" via the Sentry MCP, the agent interprets these fake resolution steps as legitimate diagnostic steps and runs the commands. There is no jailbreak and no explicit "run this" instruction, and the developer never approves any code. Tenet confirmed that 2,388 organizations are exposed through the public Sentry API alone, observed agents at more than 100 organizations react to injected errors in a controlled environment, and measured an 85% execution success rate across mainstream AI coding assistants. What was missing is a layer that, before the agent turns an external input into action, independently verifies the origin and authenticity of that input (the error report).

---

## 2. What happened

- **Subject**: AI coding agents that triage errors via the Sentry MCP server. The proof of concept succeeds on mainstream assistants including Claude Code, Cursor, and Codex.
- **Reporter**: research by Tenet Threat Labs (Tenet Security). The stage is Sentry (an application error- and performance-monitoring SaaS) and the Sentry MCP server that connects it to AI agents.
- **Underlying mechanism**: MCP (Model Context Protocol) is a standard for AI agents to read data from external services (here, Sentry) and work on it. The developer asks the agent to "look into and fix this error we're seeing in production," and the agent fetches the error event via the Sentry MCP and infers the cause.
- **Injection technique**: the attacker sends the error event using the public Sentry API (with an app's public ingest key, anyone can write from the outside). Planting markdown in the event's message field and context key names causes it — when the MCP returns it to the agent — to render as headings, code blocks, and tables, visually indistinguishable from Sentry's own templates. Into this the attacker places a fake `## Resolution` section, presenting commands such as `npx` as "recommended fix steps."
- **Core of the exploit**: no explicit "execute" and no jailbreak are needed. The developer's mundane triage request is itself the trigger, and the developer never once approves any code. The instruction arrives not in a chat box but as telemetry (an error report) the organization already trusts.
- **Chain of impact**: once execution succeeds, the full set of environment variables, Git credentials, private repository URLs, and the developer's identity can pass to the attacker. Exfiltration from the developer environment is reached without phishing or any prior server compromise.
- **Bypassing existing defenses**: in Tenet's tests, EDR, WAF, IAM, VPN, and Cloudflare did not react, and even explicitly writing "do not trust external data" into the system prompt did not stop execution.
- **Observed scale**: 2,388 organizations exposed through the public Sentry API alone. In controlled testing, agents at more than 100 organizations reacted to injected errors, with an 85% execution success rate across mainstream AI coding assistants.

The incident came together as the following chain.

1. **Injecting the error event**: the attacker uses the target app's public Sentry ingest key to send a crafted error event. It plants markdown in the message field and context key names and embeds commands such as `npx` into a fake `## Resolution` section.
2. **Mimicking legitimate templates**: when the Sentry MCP returns this event to the agent, the markdown renders as headings, code blocks, and tables, visually indistinguishable from Sentry's own diagnostic templates.
3. **A mundane triage request**: the developer asks the agent to "look into this production error." There is no explicit "execute" and no jailbreak.
4. **Acceptance as instruction**: the agent interprets the injected "resolution steps" as legitimate diagnostic steps and runs the presented commands. The developer has not approved any code.
5. **Exfiltration**: as an extension of that execution, environment variables, Git credentials, private repository URLs, and the developer's identity can be sent out. No phishing and no prior server compromise are involved.

---

## 3. Timeline — disclosure and response

- 2026-06-03: Tenet discloses the vulnerability to Sentry. Sentry responds the same day, and while acknowledging the issue, declines a fundamental fix, reportedly taking the position that it is "not a technically defensible matter."
- 2026-06-12: Tenet Threat Labs publishes the research "Agentjacking," presenting the technique, the scale of exposure, and the success rate.
- Mid-June 2026 onward: multiple outlets and research notes — The Hacker News, The New Stack, Dark Reading, Cloud Security Alliance, and others — pick it up, discussing it as a cross-industry structure in which "an agent receives instructions via trusted external data."

> Note: the technical facts are based on Tenet Threat Labs' disclosure and the research notes of The Hacker News, The New Stack, and the Cloud Security Alliance. The number of exposed organizations (2,388), success rate (85%), and number of reacting organizations (100+) are values observed in Tenet's controlled testing and do not indicate the number of real-world incidents. Sentry's response posture is per reporting at the time of disclosure. Refer to the latest primary sources.

The response and industry movement after disclosure:

- **Research (Tenet Threat Labs)**: presented Agentjacking not as a single vendor's bug but as a structural risk in which AI agents receive instructions via trusted external data. It recommends that developers and operators not treat external data sources connected to an agent as trusted, verify content returned from the MCP before execution, and minimize the privileges and environment handed to the agent.
- **Sentry**: responded the same day as the disclosure but, rather than fixing the problem fundamentally on the product side, is reported to have taken the position that, given the nature of the data that could be injected, it is "not a technically defensible matter." Error-monitoring services are designed to accept writes from the outside, and there is a structural circumstance that makes it hard to guarantee the authenticity of a body at ingest time.
- **Cross-industry**: The Hacker News, The New Stack, Dark Reading, and the Cloud Security Alliance positioned this as a new delivery surface for prompt injection (via trusted telemetry and integration data, not a chat box). The design that implicitly treats external data connected to an agent via MCP as a "trusted context" exists widely, not only in Sentry, and the need for a layer that verifies instructions within ingested data — together with their provenance — before execution was shared.

The absence of a layer that independently verifies, at the moment of execution, the provenance of the external data an agent ingests remains not a problem of a specific service but a cross-organizational operational challenge for anyone adopting AI agents that run by bundling external data sources via MCP.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the agent accepted the "resolution steps" contained within data fetched from an external service (the error report) as instructions to execute, without independently verifying their origin and authenticity before acting**. The agent treated it as "trustworthy because it is diagnostic data returned from Sentry," but did not distinguish "whether this event body was generated by the legitimate Sentry system or is an attacker's injection written from the outside." The basis for judgment was placed on how the data looks (markdown closely resembling Sentry's own templates), not on the provenance of the instruction.

This case is isomorphic to [Brief No.055](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) (EchoLeak, where the AI sent internal data out without verifying the origin of the instruction). In both, the agent executed and carried out instructions within the content it ingested without confirming their issuer. It matches [Brief No.047](/critical/briefs/047-openclaw-agent-phishing/) (OpenClaw, where an AI agent sent credentials out before verifying the sender) in that the agent proceeded to act before verifying the authenticity of external input. It is continuous with [Brief No.062](/critical/briefs/062-claude-code-github-action-bot-trust/) (Claude Code GitHub Action, where the agent performed privileged execution trusting a single issue claiming to be `[bot]`), in that it proceeds to privileged processing without verifying the input's issuer. It connects to [Brief No.024](/critical/briefs/024-invisible-unicode-instruction-injection/) (instruction injection via invisible Unicode) in that a divergence between what is visually / legitimately displayed and the instruction the agent actually reads was exploited. And it shares with [Brief No.095](/critical/briefs/095-amazon-q-mcp-auto-execution/) (Amazon Q, where a bundled MCP configuration was executed without verification) the structure in which an AI coding tool connects "input whose origin it cannot itself choose" to execution.

What is unique to this case is that the injection channel is neither a chat box nor a bundled file, but **operational data (telemetry) the organization already trusts**. Error monitoring is a trusted channel that development teams reference without suspicion. Precisely for that reason, an instruction slipped into it becomes a basis for execution as-is, unless it is verified at the moment it crosses the boundary. That a general admonition — "do not trust external data" — written into the system prompt still failed to stop execution is because, as long as trust/distrust is handled at the level of declaration, the provenance of each individual piece of data is not proven at the moment of action. The shared primitive is the same: **the execution of an instruction is decoupled from the layer that verifies that instruction's origin**.

Tenet's research disclosure, the quantification of exposed organizations and success rate, the visibility of the technique via multiple outlets and research notes, and responsible disclosure to Sentry — this detection chain is indispensable for raising awareness of the risk and considering countermeasures, and this Brief does not diminish that role. Efforts to monitor known injection patterns and filter suspicious error bodies also aid the response. Detection does play its part.

But detection provides no material to independently prove, **at the moment the agent accepts a set of resolution steps as an instruction**, whether the steps it is about to execute originate from the legitimate Sentry system or were injected by an attacker. The injected markdown is formally identical to Sentry's own templates, and detection that looks at how the content appears has no way to formally decide, before execution, that it is "an attacker's injection." Even if EDR, WAF, or IAM fires after the fact or at the periphery, it is too late once the command that sent out environment variables or credentials has run. As material for an audit to prove "was this command execution based on a legitimately authorized diagnostic procedure," the mere fact that "it was contained in data returned from Sentry" is not an independent trail of the instruction's provenance. This is a gap in a structurally independent layer, outside the reach of the detection layer.

---

## 5. What proof would have changed

Pre-action attestation closes this gap by inserting one step of provenance proof into the path where the agent turns an instruction derived from external data into action. Before executing a command, it verifies — decoupled from how the data looks — "does this instruction originate from a body generated by the legitimate system, and is it not externally injected content" and "is this execution authorized within this scope," and blocks execution beforehand when no proof accompanies it. In addition, narrowing the environment and privileges handed to the agent at execution time to the authorized minimum avoids full inheritance of credentials even if execution does occur. Pre-execution proof is not a substitute for detection but a **complement**, and the combination of both layers establishes the trust boundary of AI coding agents.

Against the detection-versus-proof gap this case exposed — the agent executes an instruction derived from external data decoupled from independent verification of its provenance, and moreover inherits the full environment — Lemma proposes a design that requires, before the agent turns an external input into action, the provenance of that input and the authorization of its execution as independently verifiable cryptographic proof.

- **Pre-action provenance/authorization proof (proof-as-auth)**: before executing an instruction derived from external data, such as the resolution steps of error triage, prove with a signature that "this instruction originates from a body generated by the legitimate system, and this execution is authorized within this scope." Do not make "it arrived via a trusted channel" the terminus of execution.
- **Binding instruction provenance**: verify the provenance of the data an agent ingests by tying it to its issuer (the legitimate service), distinguishing externally injected bodies from legitimately generated ones.
- **Scoped privileges and minimal environment**: minimize the environment and privileges the agent holds at execution time per operation, narrowing full inheritance of environment variables and Git credentials to the proven necessary scope. Do not let execution beyond the authorized scope succeed without proof.
- **Selective disclosure**: disclose only that "this execution satisfies the authorization schema," with minimal disclosure, keeping internal keys and credentials out of the environment.

Through this, a proof fixed at the moment of execution functions as a trail that is independently verifiable — before the agent turns external data into action — for "does this instruction have legitimate provenance, and is this execution authorized." Detection (after-the-fact disclosure, visibility of the technique, monitoring of injection patterns) works on post-discovery remediation; pre-execution proof (pre-execution provenance/authorization verification) works on independent verification of agent operations — each complementary.

---

## 6. Sources

- **Tenet Security (research, primary)**: “Agentjacking: Hijacking Coding Agents with Fake Sentry Errors” (2026-06) — <https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/>
- **The Hacker News**: “Agentjacking Attack Tricks AI Coding Agents Into Running Malicious Code” (2026-06) — <https://thehackernews.com/2026/06/agentjacking-attack-tricks-ai-coding.html>
- **The New Stack**: “A public Sentry key is all it takes to hijack Claude Code, Cursor, and Codex” (2026-06) — <https://thenewstack.io/agentjacking-sentry-mcp-attack/>
- **Cloud Security Alliance (research note)**: “Agentjacking: Sentry MCP Injection Hijacks AI Coding Agents” (2026-06) — <https://labs.cloudsecurityalliance.org/research/csa-research-note-agentjacking-sentry-mcp-20260614-csa-style/>
- **Dark Reading**: “Fake Bug Report Hijacks AI Coding Agents at Scale” (2026-06) — <https://www.darkreading.com/cyber-risk/fake-bug-report-hijacks-ai-coding-agents>
