---
brief_no: 94
title: "Cursor（DuneSlide）：仕込まれた指示が、AI エージェントのサンドボックスを外しえた(Cato AI Labs の報告)"
title_en: "Cursor (DuneSlide): an injected instruction could escape the AI agent's sandbox (Cato AI Labs report)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-07-01
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "039-semantic-kernel-prompt-injection-rce", "027-librechat-mcp-url-secrets", "048-trapdoor-ai-instruction-provenance", "058-langgraph-checkpoint-rce"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Cato AI Labs が Cursor の 2 件の脆弱性（DuneSlide）を報告し、Cursor 3.0 で修正された。Web や連携先に仕込まれた指示が、エージェントのサンドボックスを外し、任意のコマンドの実行に至りえた"
og_lead_en: "Cato AI Labs reported two Cursor vulnerabilities (DuneSlide), fixed in Cursor 3.0, through which instructions planted on the web or in connected services could escape the agent's sandbox and run arbitrary commands"
og_kicker_ja: "脆弱性の報告 · AI コードエディタ"
og_kicker_en: "VULNERABILITY · AI CODE EDITOR"
og_headline_ja: "仕込まれた一つの指示が\nサンドボックスを外しうると\nCato AI Labs が報告。\n<accent>CVSS 9.8・2 件を修正</accent>"
og_headline_en: "One injected prompt could\nescape Cursor's sandbox,\nCato AI Labs reports.\n<accent>CVSS 9.8, two CVEs fixed</accent>"
key_figures:
  - value: "9.8"
    label: "NVD CVSS 3.1 score of both CVE-2026-50548 and CVE-2026-50549. Both Critical"
    tone: "alert"
  - value: "2"
    label: "Vulnerabilities Cato AI Labs reported under the name \"DuneSlide,\" each reaching writes outside the sandbox through a different hole"
  - value: "3.0"
    label: "The Cursor version with the fix (released 2026-04-02). All versions below 3.0 are affected"
glossary:
  - term: "Cursor"
    desc: "An AI code editor. Its agent takes a user's request and runs terminal commands and file operations."
  - term: "Sandbox"
    desc: "A mechanism that fences in command execution and limits what it can touch. Since the 2.x line, Cursor runs the terminal commands its agent issues inside one by default."
  - term: "MCP"
    desc: "A mechanism for AI agents to connect to external services and tools. The agent reads the data the connected service returns."
  - term: "Prompt injection"
    desc: "A technique that slips commands into documents, search results or external data the AI reads, so the AI treats them as instructions."
insight:
  slug: "agent-chosen-path-grants-write"
  label: "Write permission decided directly by what the agent specifies"
  quote: "Unless the place an agent writes to is checked before execution against a scope decided apart from what the agent specifies or how a link resolves, a single instruction slipped into what it reads can rewrite the safeguard itself."
industries: ["developers", "ai"]
controls:
  - slug: "ownership-check"
    item: "Confirm where an instruction the agent read came from before it acts on it"
attack_method: "ai-misuse"
takeaway: "Cato AI Labs reported that the agent's write targets were not checked apart from what the agent specified or how a link resolved, so an injected instruction could escape the sandbox."
self_check: "Before an AI agent writes to a file, do you check that the target is within the permitted scope, apart from what the agent specified?"
countries: ["global"]
---

## 1. Summary

According to Cato AI Labs, the attacker does not type into Cursor. They hide an instruction in what the agent reads on the user's behalf (data from an MCP-connected service, or a page returned by a web search), and when the user asks a normal question, the instruction is pulled in with it. Both flaws get one file written that should not be writable and use that write to disable the sandbox, with no click or approval needed. There is no report of in-the-wild exploitation; this is a research disclosure. <strong>Unless the place an agent writes to is checked before execution against a scope decided apart from what the agent specifies or how a link resolves, a single instruction slipped into what it reads can rewrite the safeguard itself.</strong>

## 2. What got through

- **What got through**: Writes by the agent to files outside the project. According to Cato AI Labs, in CVE-2026-50548, when the agent set a command's working folder to a non-default path, Cursor added that path to the write allowlist without validation. In CVE-2026-50549, when the step that checks, before writing, whether a link's actual destination is inside the project failed, Cursor trusted the "in-project" path the link pointed to (Cursor's advisory also describes this as a flaw in the fallback of link validation). The write targets were the sandbox helper file and files read when the shell starts.
- **What reached the receiving side**: In general, commands that run outside the sandbox run with the developer's own privileges. According to Cato AI Labs, once the sandbox is disabled, the next command runs as the developer, and beyond taking over the machine it can reach the cloud and SaaS workspaces the editor is signed into.
- **Not disclosed**: The number of affected users. The details of the similar flaws in other coding agents that Cato AI Labs says it is disclosing.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before an agent writes to a file, it checks that the target is within the permitted scope, apart from the path the agent specified or the result of link resolution.

- **Who approves**: The development teams that use the agent, and those who manage the editor. They decide the scope the agent may write to (such as inside the project) apart from what the agent specifies. Writes outside that scope, especially to the editor's own files or startup files, are approved by a person.
- **Where it is checked**: Just before the editor moves the agent's writes or commands into execution. It checks that the target is within the decided scope, and does not execute writes that cannot be checked. When the check fails, it does not fall back to trusting the original specification.
- **What is recorded**: Which instruction the agent acted on, and which writes or commands it performed under which permission (or which were stopped). Kept apart from the agent, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an agent writes, that the target is within the permitted scope, and keeping a record. Detection means finding, reporting and fixing vulnerabilities. The dates are when the issues were reported, fixed and published, not when the routes were used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before writing, check that the target is within the permitted scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Injected instructions could get writes<br>outside the sandbox through</span></div>
<div class="rx-zone det"><b>Detection · Cato AI Labs reported, Cursor fixed</b>Vulnerability report, fixed version, publication</div>
<div class="rx-g g1"><div class="t">02-19</div><b>Cato AI Labs reports both flaws</b></div>
<div class="rx-g g2"><div class="t">04-02</div><b>Cursor 3.0 with the fix</b></div>
<div class="rx-g g3"><div class="t">06-05</div><b>CVE IDs assigned</b></div>
<div class="rx-g g4"><div class="t">07-01</div><b>Published as DuneSlide</b></div>
</div>
</figure>

The researcher's report and the fixed version worked, and the two known routes were closed before publication. What did not work was the layer before that, which checks the agent's write targets before execution against a scope decided apart from what the agent specifies. It connects with [Brief 037, where a repository-bundled config was auto-executed](/critical/briefs/037-agent-config-auto-execution/), [Brief 039 on Semantic Kernel, where prompt injection could lead to code execution on the host](/critical/briefs/039-semantic-kernel-prompt-injection-rce/) and [Brief 048, where invisible commands were planted in AI instruction files](/critical/briefs/048-trapdoor-ai-instruction-provenance/), in that the origin of the input the AI reads is not checked before it connects to execution; and with [Brief 027 on LibreChat](/critical/briefs/027-librechat-mcp-url-secrets/) and [Brief 058 on LangGraph](/critical/briefs/058-langgraph-checkpoint-rce/), in that input turns directly into execution in agent infrastructure.

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before the editor moves the agent's writes or commands into execution.** It does not look for prompt injection; it checks the agent's write targets, before execution, against a permitted scope managed apart from what the agent specifies.

### Industries and operations to watch

- **Industry · Developers**: Development teams that let the agent in an AI code editor such as Cursor run terminal commands and write files. The agent's privileges extend to the developer's own and to the clouds they are signed into.
- **Industry · AI**: Organizations that build and ship agents reading input whose origin the agent cannot choose, such as MCP-connected services and web-search results.

### Current controls vs Lemma

This incident's CVE-2026-50548 route falls in column 1, and the CVE-2026-50549 route in column 2. Column 3 is not a route in this incident.

| Control | Writes outside the scope through what the agent specifies (such as the working folder) | Writes outside the scope through a failed safety check | Writes or commands within the scope, driven by an injected instruction |
| --- | --- | --- | --- |
| Updating to the fixed version (Cursor 3.0) | Partial | Partial | Not relevant |
| Sandbox (default fence around commands) | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Updating to the fixed version closes the two known routes, but if another hole is found, the same shape remains. The sandbox is meant to stop writes outside the scope, but here its permission decision relied on what the agent specified and on the result of link resolution, so a single write could remove it. Lemma checks the write target before execution against a scope managed apart from what the agent specifies, and stops when it cannot be checked, so writes in columns 1 and 2 stop before they run. On the other hand, if writes or commands following an injected instruction happen within the permitted scope, the check matches.

Note: Lemma's check works only when it is built into the editor's execution of the agent's writes and commands, and the scope that may be written to is managed apart from what the agent specifies and the input the agent reads. If the scope is set broadly, malicious writes within it go through. The check neither finds instructions in the input nor fixes flaws in the editor. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that use agents in AI code editors

- Is the Cursor you use on a fixed version (3.0 or later)?
- Do you know the external input the agent reads (MCP-connected services, web search), and keep connections to only those needed?
- Can you see, apart from the agent, a record of the commands the agent ran and the files it wrote?

## 5. Facts and timeline

- **Subject**: Cursor (an AI code editor). Since the 2.x line, it runs the terminal commands its agent issues inside a sandbox by default.
- **Identifiers**: CVE-2026-50548 and CVE-2026-50549, named "DuneSlide" by Cato AI Labs.
- **Severity**: both 9.8 (Critical) on NVD's CVSS 3.1.
- **Entry point (Cato AI Labs)**: instructions hidden in what the agent reads on the user's behalf, such as data from MCP-connected services or web-search results. "Zero-click," needing no click or approval.
- **CVE-2026-50548 (Cato AI Labs)**: when the agent set the working folder of a terminal command to a non-default path, Cursor added that path to the write allowlist without validation.
- **CVE-2026-50549 (Cato AI Labs, Cursor's advisory)**: in the fallback when the step that checks a link's destination before writing failed, Cursor trusted the in-project path the link pointed to.
- **Impact (Cato AI Labs)**: once the sandbox is disabled, the next command runs as the developer and can reach the machine and the cloud / SaaS the editor is signed into. All versions below 3.0 are affected.
- **Exploitation status**: no report of in-the-wild exploitation. Cato AI Labs presents it as research, not an active campaign, and public vulnerability records also note "no confirmed exploitation."

### Timeline

- **2026-02-19**: Cato AI Labs reported both flaws to Cursor.
- **~2026-02-23**: According to Cato AI Labs, Cursor initially declined the report on the grounds that "the threat model does not cover abuse of MCP servers (including standard ones such as the official Linear workspace)."
- **2026-02-26**: Cato AI Labs escalated again, and Cursor reopened the report and began triage.
- **2026-04-02**: Cursor 3.0, containing the fix, was released.
- **2026-06-05**: CVE identifiers were assigned.
- **2026-07-01**: Cato AI Labs published the flaws as "DuneSlide." Cursor published its advisory for the link flaw (GHSA-3v8f-48vw-3mjx), and the NVD record went public.

> The facts in this Brief rest on Cato AI Labs' disclosure, Cursor's GitHub Security Advisory and the NVD entry. The account of how the report was received is Cato AI Labs' description. This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Cursor**: fixed both flaws in 3.0 (2026-04-02) and published an advisory (GHSA-3v8f-48vw-3mjx) for the link flaw.
- **Cato AI Labs**: says it is disclosing similar flaws in other coding agents and argues the problem is structural, posing to the industry the question of "once you ship agents that read the web, will you make treating all input as hostile the default, or keep chasing patches?"

## 6. Sources

- **Cato Networks (research, primary)**: “DuneSlide: Two Critical RCE Vulnerabilities in Cursor” — <https://www.catonetworks.com/blog/duneslide-two-critical-rce-vulnerabilities/>
- **The Hacker News**: “Critical Cursor Flaws Could Let Prompt Injection Escape Sandbox and Run Commands” (2026-07-01) — <https://thehackernews.com/2026/07/critical-cursor-flaws-could-let-prompt.html>
- **CSO Online**: “Sandbox bypass flaws in Cursor IDE highlight prompt injection as an RCE vector” — <https://www.csoonline.com/article/4191923/sandbox-bypass-flaws-in-cursor-ide-highlight-prompt-injection-as-an-rce-vector.html>
- **Cursor (vendor advisory)**: GHSA-3v8f-48vw-3mjx (CVE-2026-50549, the symlink-verification fallback) — <https://github.com/cursor/cursor/security/advisories/GHSA-3v8f-48vw-3mjx>
- **NVD**: CVE-2026-50549 — <https://nvd.nist.gov/vuln/detail/CVE-2026-50549>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
