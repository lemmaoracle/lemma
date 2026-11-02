---
brief_no: 104
title: "WebMCP：セッションの途中で差し替えたツールを、AI エージェントが呼びうることが示された(国立陽明交通大学の研究)"
title_en: "WebMCP: AI agents could be led to call a tool swapped in mid-session (National Yang Ming Chiao Tung University research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-04
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["099-agentjacking-sentry-mcp", "048-trapdoor-ai-instruction-provenance", "024-invisible-unicode-instruction-injection", "025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "WebMCP で、セッションの途中にツールを差し替える攻撃を研究者が公開。登録の競合で攻撃成功率 100%（3 モデル・統制環境）"
og_lead_en: "Researchers disclose mid-session tool injection against WebMCP: a registration race reached 100% attack success (three models, controlled setting)"
og_kicker_ja: "攻撃の研究 · AI エージェントのツール"
og_kicker_en: "ATTACK RESEARCH · AI AGENT TOOLS"
og_headline_ja: "セッション途中で\nツールを差し替えると、\nAI は気づかず呼んだ。\n<accent>成功率 100% と報告</accent>"
og_headline_en: "Tools swapped mid-session\nwere called by AI agents.\n<accent>Up to 100%, study reports.</accent>"
key_figures:
  - value: "100"
    unit: "%"
    label: "Success rate of registering under the same name before the legitimate tool (registration race), on all three models. Researchers' evaluation in a controlled setting, not real-world harm"
    tone: "alert"
  - value: "85"
    unit: "%"
    label: "Share of runs (maximum) in which attacks on how a tool is presented exfiltrated data while the original task still completed normally. It looks normal to the user"
  - value: "36–100% → 0%"
    label: "Attack success rate before and after enabling the researchers' two implemented defenses. Task completion stayed on par with the baseline"
glossary:
  - term: "WebMCP"
    desc: "An emerging mechanism that lets a website expose tools directly to an AI agent. Rather than driving the screen, the agent reads what it can do from the tools' metadata."
  - term: "readOnlyHint"
    desc: "A field in a tool's metadata, in which the tool itself declares that it only reads."
  - term: "Attack success rate (ASR)"
    desc: "In this study, the share of runs that called the malicious tool and sent task-relevant data to the attacker's endpoint."
insight:
  slug: "tool-identity-by-name-alone"
  label: "Tool identity decided by public name alone"
  quote: "As long as an agent picks the tools it calls by public name and the metadata's self-declaration alone, they can be replaced by something else with the same name."
industries: ["ai", "developers"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "Confirm the tool being called was really registered by that site"
attack_method: "ai-misuse"
takeaway: "Unless the origin of a tool is checked before the call, apart from its public name and its metadata's self-declaration, a different tool with the same name can be called."
self_check: "Before an AI agent calls a tool, can you check that the tool has the same origin as when the agent planned, apart from its public name?"
countries: ["global"]
---

## 1. Summary

A research team at National Yang Ming Chiao Tung University (Taiwan) showed, in a controlled setting, that on WebMCP a third-party script loaded into the same page can rewrite the set of tools an AI agent sees in the middle of a session. According to the researchers, attacks that manipulate which tools exist lose almost no success rate from older-generation models to the latest ones, so model updates do little to close them. When the researchers enabled their implemented defenses, the agent still called the malicious tool, yet no data reached the attacker. No exploitation or harm in the wild has been reported. <strong>As long as an agent picks the tools it calls by public name and the metadata's self-declaration alone, they can be replaced by something else with the same name.</strong>

## 2. What got through

- **What got through**: The agent calling a malicious tool and handing over data with that call. The researchers organize the attack into two families. Manipulating the existence of tools (Tool Hijacking) replaces the tools the agent sees, for example by deregistering a legitimate tool and registering again under the same name, or by registering under the same name before the legitimate tool does. Manipulating the interpretation of tools (Tool Framing) uses legitimate fields such as the tool name, `description`, `readOnlyHint` and `inputSchema` to make a malicious tool look like a mandatory workflow step or a safe read-only operation (the researchers' paper).
- **What reached the receiving side**: In general, an agent plans and chooses which tool to call from the names and metadata in the tool list. According to the researchers, the malicious tool carries the same public name as the legitimate one and is presented through legitimate fields, so the list's contents alone do not tell them apart. Setting `readOnlyHint=true` alone produced an average attack success rate of 87%.
- **Not disclosed**: Exploitation or harm in the wild (none reported). Reproducibility under Chrome's native WebMCP implementation (the researchers note it may vary with implementation details). Whether users can notice Tool Framing (no user study was conducted). How the two of the researchers' four design directions that were not evaluated would perform.

## 3. What to check

Whatever the route, the condition for telling them apart is that, just before the agent calls a tool, it checks that the tool has the same origin as when the agent planned and that this call is within the authorized scope, apart from the public name and the metadata's self-declaration.

- **Who approves**: The site that registered the tool states its identifier and origin (where the registering script came from). For high-impact calls such as payments or sending data out, the user approves. The approval is given apart from the contents of the tool list.
- **Where it is checked**: Just before the agent calls a tool and hands over data. If a tool is deregistered, replaced or has its metadata changed after planning, the plan is checked again.
- **What is recorded**: Which tool was registered, deregistered or replaced, from which origin, when, and under whose approval it was called. Kept apart from the agent.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a tool's identifier, origin and call scope before the agent calls it, and keeping a record. Detection means noticing attack techniques or a tool's suspicious behavior or traffic. The dates below are when the research was published and cited, and the results come from a controlled evaluation.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the call, check the tool's identifier and origin apart from its public name</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In a controlled setting, agents<br>called tools that had been swapped</span></div>
<div class="rx-zone det"><b>Detection · researchers classified and published it</b>Publishing techniques, inspecting behavior, observing traffic</div>
<div class="rx-g g1"><div class="t">06-04</div><b>Study published on arXiv</b></div>
<div class="rx-g g2"><div class="t">06-04</div><b>Four design directions proposed</b></div>
<div class="rx-g g3"><div class="t">06-04</div><b>Two defenses bring success to 0%</b></div>
<div class="rx-g g4"><div class="t">07</div><b>Cited in MCP security surveys</b></div>
</div>
</figure>

The researchers hold that research inspecting tool behavior before and after use (MCPShield) or observing runtime traffic (ShieldNet) does not directly reach the problem that a script on the same page can change the tools while a task is running. In that the agent acts on ingested content without checking its issuer, this case is in line with [Agentjacking (Brief 099)](/critical/briefs/099-agentjacking-sentry-mcp/), [TrapDoor (Brief 048)](/critical/briefs/048-trapdoor-ai-instruction-provenance/) and [instruction injection via invisible Unicode (Brief 024)](/critical/briefs/024-invisible-unicode-instruction-injection/); in that the design of agent infrastructure becomes the attack surface, it connects with [Brief 025](/critical/briefs/025-mcp-stdio-config-to-command-rce/), [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) and [Brief 094](/critical/briefs/094-cursor-duneslide-sandbox-escape/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before an agent calls a tool and hands over data.** It does not look for attack techniques; it checks the tool's identifier and origin, and the scope of the call, before the operation runs, apart from the public name and the metadata's self-declaration.

### Industries and operations to watch

- **Industry · AI & development**: Organizations whose websites expose tools to AI agents, or that let AI agents use a site's tools, especially where third-party scripts (CDNs, ad SDKs and the like) load into the same page.
- **Operation · Disclosure & data release**: Work in which an agent uses tools to send data out, such as generating and sending reports or making payments. In the study, task-relevant data and intermediate results were sent to the attacker's endpoint along with the call.

### Current controls vs Lemma

The routes the researchers showed are two: column 1 (manipulating the existence of tools) and column 2 (manipulating the interpretation of tools).

| Control | Manipulating existence (Tool Hijacking) | Manipulating interpretation (Tool Framing) |
| --- | --- | --- |
| Model updates | Not effective | Partial |
| Inspecting tool behavior and observing runtime traffic | Partial | Partial |
| Binding origin at registration and rejecting same-name registrations from another origin (researchers' defense) | Effective | Not relevant |
| Blocking calls to tools of third-party origin and limiting the arguments they receive (researchers' defense) | Not relevant | Effective |
| **Lemma (pre-execution check)** | Effective | Partial |

According to the researchers, attacks on the existence of tools lose almost no success rate from older-generation models (GPT-4o, Claude 3.5 Sonnet) to the latest ones, while the effectiveness of attacks that rely mainly on the description correlated with the model's semantic understanding. Behavior inspection and traffic observation help grasp and shrink the damage, but the researchers hold that they do not directly reach the problem of tools changing mid-task. The researchers' two defenses cut the attack success rate from 36–100% to 0%, and the researchers describe the mapping as non-overlapping: existence is handled by access control, interpretation by limiting data flow. Lemma checks a tool's identifier and origin against the plan and ties the call and the data handed over to the declared, authorized scope. Where an instruction sits in the description of a tool whose origin is legitimate, checking origin alone cannot tell it apart, so that cell is marked partial.

Note: Lemma's check works only when it is built into the agent's tool calls, and the records of a tool's identifier, origin and call scope are managed apart from the page's scripts and the tool list. What the check can show is the origin of the tool being called and whether the call is within the authorized scope; it does not show that the agent's judgment was not misled. If a user approves a high-impact call without checking its origin, it goes through. The table compares what each control checks; it does not show whether the study's evaluation would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that let AI agents use a site's tools

- When a tool is deregistered, replaced or has its metadata changed after planning, is there a mechanism that checks the agent's plan again?
- Do you limit the data handed to tools of third-party origin to the declared, authorized scope?
- Can you see, apart from the agent, a record of which tool was registered or replaced, from which origin, when, and when it was called?

## 5. Facts and timeline

- **Researchers**: Research by Lin-Fa Lee, Yi-Yu Chang, Chia-Mu Yu and Kuo-Hui Yeh of National Yang Ming Chiao Tung University (Hsinchu, Taiwan), "WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents," published 2026-06-04 as arXiv:2606.06387v1 [cs.CR]. They named the attack class "Mid-Session Tool Injection" (MSTI).
- **Subject**: WebMCP, an emerging protocol that lets a website expose structured tools directly to an AI agent. The agent grasps the available capabilities from the tools' metadata rather than by driving the screen.
- **Threat model (researchers' assumption)**: The attacker can compromise or inject the supply of a third-party script loaded into the victim site (a CDN, an ad SDK or any other JavaScript component on the same page). Whereas conventional third-party-script attacks aim to alter page content or exfiltrate DOM data, this threat model targets the agent's tool registry itself.
- **Evaluation environment**: Three models: GPT-5.4, Claude Opus 4.6 and Gemini 2.5-flash. Four scenarios of differing severity (knowledge-base search / business-report generation and sending / e-commerce payment / GPU driver update).
- **Key results**: The registration race (C3) hit 100% on all three models, and `AbortSignal` hijacking (C1) averaged 94%. In the Tool Framing family, `description` injection (C2) averaged 59% and the combined attack (C5) 61%. Isolating fields, `description` alone averaged 93%, `readOnlyHint=true` alone 87%, and the two combined 100% on all three models. In Tool Framing, the original task still completed normally in up to 85% of runs while data was exfiltrated.
- **Injection timing**: Tool Hijacking needs the injection to be complete before the agent's loop begins (100% at P1, 0% if it misses the first legitimate call), while Tool Framing worked better the earlier it landed before sensitive context entered (82% at S1, 28% just before the final action).
- **Researchers' defenses**: They implemented a defense that binds origin at registration and rejects a later same-name registration from a different origin (for Tool Hijacking), and one that blocks tool calls from a third-party origin and restricts the arguments it can receive (for Tool Framing), reducing the attack success rate from 36–100% to 0%, with task completion on par with the baseline. Even with the defenses enabled, the agent called the malicious tool in most trials, yet no data reached the attacker. The researchers put it as "whether the LLM is misled and whether data actually leaks are independent problems."
- **Real-world harm**: This is research in a controlled setting; no exploitation or harm in the wild had been reported as of this writing.

### Timeline

- **2026-06-04**: "WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents" (arXiv:2606.06387v1 [cs.CR]) is published on arXiv, presenting the MSTI taxonomy, a quantitative evaluation across three models and four scenarios, a field-level contribution analysis, an injection-timing analysis, and the implementation and evaluation of two baseline defenses.
- **2026-07**: In a survey of MCP security trends, the study is cited as a new attack surface: runtime manipulation of the tool surface (Adversa AI).

> This is research in a controlled setting. The experiments do not use Chrome's native WebMCP implementation but a `navigator.modelContext` API provided by the CDN-delivered `@mcp-b/global` polyfill, and the agent runs in a headless Node.js environment rather than under a real browser's full security model. The researchers themselves note that reproducibility under a native implementation may vary with implementation details. The facts in this Brief rest on the researchers' paper. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The researchers' design principles**: Holding that WebMCP's tool surface should be treated not as a neutral, static interface but as a security boundary, they set out four directions. (A) Tool identity and ownership: generate an immutable internal `tool_id` at registration and bind it to the origin, document, frame and supplying source of the registering script; the agent checks against the `tool_id`, not the public name. (B) Lifecycle and state consistency: deregistration, `AbortSignal`, replacement and metadata updates should invalidate an existing plan or force it to be checked again. (C) Capability and data-flow boundaries: require tools to declare their capabilities, data-access scope and destinations, and by default do not hand sensitive data to third-party tools. (D) Control through user authorization: record registrations, deregistrations, replacements, metadata changes and calls in a provenance log, and require explicit consent through the UI for high-risk actions such as payment, installation and sending data out.
- **The limits of model updates**: The researchers hold that mitigating attacks that abuse WebMCP's tool-registration mechanism is hard to achieve through model version updates alone.
- **Limitations of the research (stated by the researchers)**: The experiments use a polyfill and are not under a real browser's full security model. No user study was conducted. The defense evaluation covers only two of the four directions. The low task-completion rate for Tool Hijacking is a consequence of payload design; an attacker who knows the legitimate tool's specification and returns a normal response could raise completion sharply, making it even harder for users to notice.

## 6. Sources

- **arXiv (research, primary)**: Lin-Fa Lee, Yi-Yu Chang, Chia-Mu Yu, Kuo-Hui Yeh, "WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents," arXiv:2606.06387v1 [cs.CR] (2026-06-04) — <https://arxiv.org/abs/2606.06387>
- **W3C Web Machine Learning (WebMCP specification)**: "WebMCP" — <https://webmachinelearning.github.io/webmcp/>
- **Adversa AI (MCP security trends)**: "Top MCP security resources & CVEs July 2026" (2026-07) — <https://adversa.ai/blog/top-mcp-security-resources-july-2026/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
