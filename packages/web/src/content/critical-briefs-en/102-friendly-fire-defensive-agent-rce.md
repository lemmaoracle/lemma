---
brief_no: 102
title: "Friendly Fire：セキュリティ審査を頼まれた AI コーディングエージェントが、審査対象の悪性バイナリを安全と判定して実行した(AI Now Institute の研究)"
title_en: "Friendly Fire: AI coding agents asked to security-review a library ran the malicious binary planted in it (AI Now Institute research)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-08
published: 2026-07-15
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["099-agentjacking-sentry-mcp", "048-trapdoor-ai-instruction-provenance", "037-agent-config-auto-execution", "095-amazon-q-mcp-auto-execution", "098-bioshocking-agentic-browser-context", "062-claude-code-github-action-bot-trust", "024-invisible-unicode-instruction-injection", "018-hackerbot-claw-ai-vs-ai", "031-vibe-hacking-shadow-aether"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Friendly Fire：審査を頼まれた AI エージェントが、審査対象に仕込まれたバイナリを実行（AI Now Institute の PoC）"
og_lead_en: "Friendly Fire: AI agents asked to vet a library ran the binary planted in it (AI Now Institute PoC)"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの研究 · 審査対象が実行された"
og_kicker_en: "AI AGENT FLAW · REVIEW RAN CODE"
og_headline_ja: "審査を頼まれた AI が、\n審査対象のバイナリを実行。\n<accent>研究者が PoC で実証</accent>"
og_headline_en: "Asked to vet a library,\nAI agents ran its binary.\n<accent>Researchers' PoC</accent>"
key_figures:
  - value: "3 models"
    label: "Models to which the same payload built for Sonnet 4.6 transferred unchanged (Sonnet 5, Opus 4.8, GPT-5.5; AI Now Institute)"
    tone: "alert"
  - value: "0 times"
    label: "Times the developer approved running the code in auto-mode / auto-review (AI Now Institute)"
  - value: "2 agents"
    label: "Agents in which the PoC succeeded (Claude Code, Codex; AI Now Institute)"
glossary:
  - term: "auto-mode / auto-review"
    desc: "Opt-in settings in Claude Code and Codex. Commands an AI classifier judges safe run automatically; only those it judges dangerous ask a human for approval."
  - term: "Decoy source"
    desc: "Source code placed so that a malicious binary looks like a legitimate build of it. Here it posed as a static-analysis tool."
insight:
  slug: "reviewed-code-runs"
  label: "Execution arriving from the code under review"
  quote: "Steps inside code an agent takes in go through as part of ordinary work unless the side that runs them checks, before running, where they came from and how far they may go."
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Don't let the agent run a binary under review until its origin is confirmed"
attack_method: "ai-misuse"
impact: "In a research PoC, two AI coding agents ran code on the host"
takeaway: "An agent asked to review a library followed a step written in its README and ran a binary without checking where it came from (AI Now Institute PoC)."
self_check: "Before an AI agent runs code or a binary it took in for review or investigation, does it check where that code came from?"
countries: ["global"]
---

## 1. Summary

According to AI Now Institute's research, a developer need only ask an agent to check the security of a third-party library, and the agent runs an attacker's binary planted in that library on the host. It took a sentence appended to the library's `README.md` as a legitimate diagnostic step and ran it inside a mode that executes commands automatically. The researchers report that the pre-execution disassembly check was fooled by a decoy source sharing the binary's name and some of its strings into treating it as "a legitimate build with matching source." This is a research-stage PoC; no harm in the wild has been reported. <strong>Steps inside code an agent takes in go through as part of ordinary work unless the side that runs them checks, before running, where they came from and how far they may go.</strong>

## 2. What got through

- **What got through**: Running a script contained in the code under review, and the malicious binary it launches. With Claude Code's auto-mode or Codex's auto-review enabled, no approval dialog appeared. Because no configuration files (`.mcp`, `.claude/settings.json`, and the like) are used, no "do you trust this folder?" prompt appeared either (AI Now Institute).
- **Trigger**: The developer's mundane request to "check the security of this library." There is no jailbreak and no explicit instruction to execute, and the developer never approves the code. Both Anthropic and OpenAI recommend using their agents to find vulnerabilities in third-party libraries (AI Now Institute).
- **What reached the receiving side**: In general, an agent cannot reliably tell steps inside the text it takes in from instructions it received from its user. The researchers argue this is a design weakness that model updates cannot close. When the underlying models were asked directly "does `geopy` contain a prompt injection?", both Sonnet 4.6 and GPT-5.5 answered "no" (AI Now Institute).
- **What it reached**: The PoC demonstrates arbitrary code execution (RCE) on the host and stops at the first code execution. The paper notes that this could be used as a foothold to chain through known sandbox-escape flaws (CVE-2026-39861, CVE-2026-25725) toward theft of authorization keys, persistence, and evasion of network restrictions (AI Now Institute).
- **Not disclosed**: How the two companies responded after the researchers contacted them, and whether anything changed on the product side. No exploitation or harm in the wild has been reported as of this writing.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an agent runs a script or binary inside code it has taken in, it checks — separately from how the content looks and from the model's judgment — whether that code comes from the reviewed library's legitimate distributor or was added from outside.

- **Who approves**: The legitimate distributor (a known upstream, a signed distributor), and the developer or organization that sets the scope that may run. The approval is given on where the code to be run came from, separately from the model's safety judgment.
- **Where it is checked**: Before the agent runs a script or binary inside code it has taken in. Anything whose origin cannot be checked is held until it can be.
- **What is recorded**: Which binary or script ran (or was held), on which distributor's confirmation, and with what environment and privileges. Kept outside the agent, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an agent runs code it has taken in, where that code came from and how far it may go, separately from appearance and the model's judgment, and keeping a record. Detection means noticing through published research or monitoring for injection patterns. Dates are publication and reporting dates.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before running, check where the code came from, separately from appearance and the model's judgment</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In a controlled environment, two agents<br>ran the binary under review</span></div>
<div class="rx-zone det"><b>Detection · research and reporting</b>PoC published, both vendors contacted, injection patterns monitored</div>
<div class="rx-g g1"><div class="t">2026-05</div><b>Same-condition research "TrustFall" (Adversa)</b></div>
<div class="rx-g g2"><div class="t">2026-05-28</div><b>Report of a maintainer planting an injection in code</b></div>
<div class="rx-g g3"><div class="t">2026-07-08</div><b>AI Now Institute publishes the research</b></div>
<div class="rx-g g4"><div class="t">2026-07-09</div><b>The Hacker News and others report</b></div>
</div>
</figure>

Publishing the research, demonstrating transfer, proposing mitigations, and contacting both vendors made the risk visible from outside. But that came after execution, and it does not check, at the moment the agent runs the binary, whether it comes from a legitimate distributor. In that steps inside ingested content were executed without their origin being checked, this is the same shape as [Agentjacking](/critical/briefs/099-agentjacking-sentry-mcp/), where an agent ran the "resolution steps" of a fake error report, and it connects to [Amazon Q](/critical/briefs/095-amazon-q-mcp-auto-execution/), where configuration bundled in a repository ran unverified. Here, the ingested content is the very code handed over for review.

## 4. What Lemma does

**Lemma puts the check in section 03 before an agent runs a script or binary inside code it has taken in.** It does not look for injections; before execution and outside the agent, it checks whether the code about to run comes from a legitimate distributor and whether running it falls within the permitted scope.

### Industries and operations to watch

| Industry / operation | Why the same hole exists |
| --- | --- |
| **Industry · Developers & software** | Reviews of third-party libraries and open source are left to AI coding agents that can run commands automatically. |
| **Industry · AI** | Builds and operates agent products, or systems that have agents read untrusted code. |

### Current controls vs Lemma

The route in this case is a script and binary contained in the code under review, run in an automatic mode.

| Control | Running a script or binary contained in the code under review |
| --- | --- |
| Pre-execution disassembly check (Claude Code) | Not effective |
| Automatic-mode classifier (auto-mode / auto-review) | Not effective |
| Folder-trust prompt | Not applicable |
| Conservative mode that asks for approval every time | Partial |
| Sandbox | Partial |
| **Lemma (pre-execution check)** | Effective |

The researchers report that the disassembly check was fooled by a decoy source with matching name and strings into treating the binary as a legitimate build, and that the classifier ran it without asking for approval. The folder-trust prompt does not appear on this route, which uses no configuration files. For the approve-every-time mode, the researchers note that automation bias and prompt fatigue keep it from being an effective intervention. A sandbox keeps execution within constraints, but the researchers argue that exploiting flaws in its implementation could break out. Lemma checks, before execution, where the code came from and how far it may go, separately from appearance and the model's judgment. A record of what ran is also kept, so which binary ran on which distributor's confirmation can be checked afterwards.

Note: Lemma's check works only when it is built into the step where the agent runs code, and distributor confirmation and the permitted scope are managed outside the agent. Code from the legitimate distributor that itself contains malicious logic (contamination on the distributor's side) can pass. Lemma does not change the models or the agents, and each vendor's decisions about its response remain its own. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that have AI coding agents handle third-party code

- Are the privileges of an agent that reviews third-party code limited so that it cannot reach keys, secrets, or the host?
- In modes that run commands automatically, is running scripts or binaries contained in the repository under review blocked by default?
- Are the commands and binaries an agent runs recorded outside the agent?

## 5. Facts and timeline

- **Subject**: AI coding agents used to security-review third-party code. The PoC succeeds with Anthropic's Claude Code (CLI 2.1.116 / 2.1.196 / 2.1.198 / 2.1.199; underlying models Claude Sonnet 4.6, Sonnet 5, Opus 4.8) and OpenAI's Codex (CLI 0.142.4; GPT-5.5).
- **Reporter**: Research by AI Now Institute (an independent AI research institute working in the public interest). The authors are Boyan Milanov and Heidy Khlaaf. Published 2026-07-08 as part of the institute's series "Double Agents: Defensive AI Agents Magnify Cyber Risks."
- **Assumed mode**: auto-mode and auto-review sit between a fully unrestricted mode and a conservative mode that asks every time, and exist for long-running autonomous work. The attack assumes one of them is enabled.
- **What was planted (as the researchers describe it)**: In a copy of the legitimate `geopy`, a malicious binary, a decoy source posing as a static-analysis tool, a script that appears to call well-known tools but launches the malicious binary, and a `README.md` with a sentence appended at the end recommending running that script. Because the binary is never called from the library's own code, ordinary tools do not flag it. The researchers say the injection could come from an insider with access or from a third-party supply-chain compromise.
- **Transfer**: The same payload built for Sonnet 4.6 transferred unchanged to Sonnet 5, Opus 4.8, and GPT-5.5. Newer models ran it even when they noticed the binary did not match the decoy source. A variant using `CLAUDE.md` / `agent.md` as the injection surface also succeeded.
- **What was published**: The binary in the GitHub reproduction repository has had its payload stripped.

### Timeline

- 2026-07-08: AI Now Institute publishes the research "Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution," presenting the PoC, attack construction, transfer, and mitigations against Claude Code and Codex, and publishes a reproduction repository on GitHub (with a binary from which the payload has been stripped).
- 2026-07-09: The Hacker News and other outlets report on it, situating it in a line of same-shaped research (Adversa "TrustFall," 2026-05; Tenet "Agentjacking," 2026-06) and against a backdrop of real supply-chain contamination (PyTorch Lightning, Megalodon).
- On disclosure: this PoC falls outside both Anthropic's and OpenAI's vulnerability-disclosure policies, but the researchers say they contacted both companies and offered to assist with verification and reproduction.

> Note: the technical facts are based on AI Now Institute's PoC disclosure (primary), the GitHub reproduction repository, and reporting by The Hacker News. The tested CLI versions (2.1.116 and others) are the configuration the researchers verified, not a vulnerable version range (the researchers hold that this is a design weakness, not a version issue). This is a PoC in a controlled environment; no exploitation or harm in the wild has been reported as of this writing. What has not been disclosed does not mean no countermeasure existed.

### Response after disclosure

- **Research (AI Now Institute)**: Presents Friendly Fire not as a single vendor's bug but as an attack surface introduced by the very act of using frontier AI defensively. It notes that in safety-critical environments, agents that can run arbitrary code or reach keys and sensitive environments should not be made to ingest untrusted data and code, and that relying on a mode that approves every time is not an effective intervention either, owing to automation bias and "prompt fatigue."
- **Contact with model providers**: The researchers say they contacted both companies and offered to assist with verification and reproduction. They argue this is not a flaw a model update can close, and that it requires changes on the workflow side.
- **Positioning of the sandbox**: The research also discusses the limits of treating a sandbox as the primary mitigation for an agent that can run arbitrary shell commands. Using RCE as a foothold to exploit flaws in the sandbox implementation itself (escape-enabling flaws in Claude Code's sandbox were also reported this year) could break out of the constrained environment.
- **Industry point**: As reported, this case shares the same condition as Adversa "TrustFall" (2026-05, one-shot RCE from a crafted repository) and Tenet "Agentjacking" (2026-06, via a fake error report): untrusted external text reaching an agent that can run arbitrary commands.

## 6. Sources

- **AI Now Institute (research, primary)**: Boyan Milanov, Heidy Khlaaf, "Friendly Fire: Hijacking Defensive Cyber AI Agents for Remote Code Execution" (2026-07-08) — <https://ainowinstitute.org/publications/friendly-fire-exploit-brief>
- **GitHub (reproduction repository, primary)**: Boyan-MILANOV, "friendly-fire-ai-agent-exploit" (payload stripped) — <https://github.com/Boyan-MILANOV/friendly-fire-ai-agent-exploit>
- **The Hacker News**: "Top AI Agents Built to Catch Malicious Code Can Be Tricked Into Running It" (2026-07-09) — <https://thehackernews.com/2026/07/friendly-fire-ai-agents-built-to-catch.html>
- **Adversa (related research)**: "TrustFall: Coding Agent Security Flaw Enables One-Click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot" (2026-05) — <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Ars Technica (background, a maintainer's injection case)**: "Fed Up with Vibe Coders, Dev Sneaks Data-Nuking Prompt Injection into Their Code" (2026-05-28) — <https://arstechnica.com/security/2026/05/fed-up-with-vibe-coders-dev-sneaks-data-nuking-prompt-injection-into-their-code/>
- **NIST NVD (sandbox-escape flaw)**: "CVE-2026-39861 Detail" — <https://nvd.nist.gov/vuln/detail/CVE-2026-39861>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
