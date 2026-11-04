---
brief_no: 147
title: "GitSpawn：フォルダを開いただけで、主要な AI コーディングエージェントが攻撃者のコードを実行していた(Manifold Security の調査)"
title_en: "GitSpawn: Just opening a folder made major AI coding agents run an attacker's code (Manifold Security research)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-09-01
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "GitSpawn：AIコーディングエージェント7種、git設定でコード実行"
og_lead_en: "GitSpawn: seven AI coding agents run code via git config"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの脆弱性 · フォルダを開くだけで実行"
og_kicker_en: "AI AGENT FLAW · CODE RUNS ON OPEN"
og_headline_ja: "フォルダを開いただけで、\nAI エージェントが攻撃者のコードを動かした。\n<accent>調べた 7 種すべてで</accent>"
og_headline_en: "Just opening a folder\nmade AI coding agents run an attacker's code.\n<accent>All seven tested.</accent>"
key_figures:
  - value: "7 / 7"
    label: "AI coding agents tested in which merely opening a repository ran code (Manifold Security)"
    tone: "alert"
  - value: "4 / 8"
    label: "Vulnerabilities still unpatched at publication (Manifold Security)"
  - value: "Before approval"
    label: "Execution happened outside the sandbox, before the user approved workspace trust (Manifold Security)"
glossary:
  - term: "core.fsmonitor"
    desc: "A legitimate git setting that speeds up diff checks in large repositories. Git reads it from the repository's own .git/config and runs the command it names."
  - term: "Workspace trust"
    desc: "The prompt that asks a user whether code and settings in an opened folder may run. Here, execution finished before it."
insight:
  slug: "run-before-approval"
  label: "Config that ran before approval"
  quote: "Settings brought in from outside go through inside an ordinary operation unless the side that runs them checks, before running, where they came from and how far they may go."
industries: ["developers"]
controls:
  - slug: "check-origin"
    item: "Check that a repository's settings and code come from a verified publisher before an agent loads them"
  - slug: "limit-and-revoke"
    item: "Run an agent's startup processes within an explicit scope of settings it may trust"
  - slug: "hold-unverified"
    item: "Disable, by default and before running, repository settings whose origin is not confirmed"
attack_method: "ai-misuse"
impact: "Code ran in 7 AI coding agents"
takeaway: "The git operations an agent runs at startup executed a repository's own settings before the user approved anything."
self_check: "Before an AI coding agent runs the settings of a folder it has opened, does it check where they came from and how far they may go?"
countries: ["global"]
---

## 1. Summary

AI coding agents ran, at startup, commands written in a repository's own settings, outside the sandbox and before the user had approved trust. The ordinary git operations an agent issues to learn the current branch and changed files (such as `git status`) read the `core.fsmonitor` value in the repository's `.git/config` and run the command it names. <strong>Settings brought in from outside go through inside an ordinary operation unless the side that runs them checks, before running, where they came from and how far they may go.</strong>

## 2. What got through

- **What got through**: Running the command written in `core.fsmonitor` in the repository's own `.git/config`. Git read and ran the setting through the `git status` or `git diff` that an agent issues at startup or before the first prompt (Manifold Security).
- **What was stopped**: Nothing. An approval mechanism existed, but execution finished before it engaged (Manifold Security).
- **What reached the receiving side**: In general, git reads the settings in a repository's `.git/config` without checking where they came from. The subprocess an agent uses to call git in the background finishes before the agent's own permission controls engage.
- **How it was delivered**: A normal `git clone` does not carry the config file, so delivery relies on moving the directory itself: a zip file, shared drive, sync folder, or USB stick (Manifold Security).
- **What it reached**: The command runs as the user, with no approval prompt and nothing shown on screen, reaching SSH keys, cloud credentials in the environment, tokens in shell configuration, every repository on disk, and a foothold on the machine (Manifold Security).
- **Not disclosed**: The name of the config key behind Claude Code's `ultrareview` path (Manifold withheld it to avoid enabling abuse). Fixes for Grok Build and for Claude Code's `ultrareview` path could not be confirmed as of this writing.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an agent runs settings or code brought in from outside such as a repository, it checks outside the agent whether they come from a verified publisher and fall within the scope that may run.

- **Who approves**: A verified publisher, and the user or organization that sets the scope that may run. The approval is given on where the settings and code came from, separately from the workspace-trust approval.
- **Where it is checked**: Before the agent starts a subprocess. Settings in a repository whose origin cannot be confirmed are disabled by default and held until they can be.
- **What is recorded**: Which settings ran (or were held), on which publisher's confirmation, and when. Kept outside the agent, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, outside the agent and before it runs settings or code, where they came from and how far they may go, and keeping a record. Detection means being found after the run, through researchers' reproductions and reports. Dates are those each party confirmed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the settings run, check where they came from and how far they may go, outside the agent</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Code ran in all seven agents<br>4 of 8 unpatched at publication</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>All eight shown with reproductions</div>
<div class="rx-g g1"><div class="t">2026-06-26</div><b>First report (Claude Code)</b></div>
<div class="rx-g g2"><div class="t">2026-07-20</div><b>Last reports (Codex, Hermes Agent)</b></div>
<div class="rx-g g3"><div class="t">2026-09-01</div><b>Findings published</b></div>
<div class="rx-g g4"><div class="t">2026-09-12</div><b>Qwen Code lands a fix</b></div>
</div>
</figure>

All eight findings came with reproductions, two received CVEs, and five overlapped with reports filed independently elsewhere. They were found after execution, which is not a pre-execution check. The same shape appears in the eleven flaws disclosed across six agent frameworks ([Brief 139](/critical/briefs/139-agent-framework-trust-boundary-checkpoint/)): content arriving from outside is not checked before it reaches trusted internal logic. Here the content is a config file and the internal logic is spawning a subprocess.

## 4. What Lemma does

**Lemma puts the pre-execution check before an agent runs a repository's settings or code.** It does not stop the agent; before the settings run, it checks, outside the agent, whether they come from a verified publisher and fall within the scope that may run.

### Industries and operations to watch

- **Industry · Developers & software**: Developers and organizations that open folders received from outside (zip files, shared drives, sync folders, USB sticks) with an AI coding agent.

### Current controls vs Lemma

The route in this case is repository settings running through the git operations an agent issues at startup.

| Control | Settings run via startup git operations |
| --- | --- |
| Workspace-trust approval | Not effective |
| Sandbox | Not effective |
| Endpoint behavior detection (EDR, scanners) | Partial |
| Vendor fix (git calls no longer run config-named programs) | Partial |
| **Lemma (pre-execution check)** | Effective |

Execution finished before the workspace-trust approval. It happened outside the sandbox. Endpoint behavior detection sees familiar developer tooling doing familiar things and needs time to recognize a known pattern, so it is a layer that works after the fact. For vendor fixes, Goose, Cursor and OpenAI Codex were patched at publication, Hermes Agent and Qwen Code landed fixes afterwards, and fixes for Grok Build and for Claude Code's `ultrareview` path could not be confirmed. Lemma checks, before the settings run and outside the agent, where they came from and how far they may go. A record of what ran is also kept, so which settings ran on which publisher's confirmation can be checked afterwards.

Note: Lemma's check works only when it is built into the step where the agent loads settings or code, and publisher confirmation and the permitted scope are managed outside the agent. Settings written as a legitimate feature (`core.fsmonitor`) that fall within the permitted scope can pass. Lemma does not change Git itself, and each vendor's decisions about fixes and releases remain its own. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that use AI coding agents

- Before an agent loads the settings or code of a repository received from outside, do you check that they come from a verified publisher?
- Do you limit the processes an agent runs at startup to a scope of settings it may trust?
- Do you disable, by default and before running, repository settings whose origin is not confirmed?

## 5. Facts and timeline

- **Affected products**: Seven major AI coding agents: Claude Code, OpenAI Codex (CLI/Desktop), Cursor, Goose, Qwen Code, Grok Build, and Hermes Agent. Combined, five of these projects carry roughly half a million GitHub stars (Hermes Agent 237,000+, Claude Code 143,000+, Goose 54,000+, Qwen Code 27,000+, Grok Build 26,000+); Claude Code alone sees over 77 million npm downloads a month.
- **Discovered by**: Manifold Security (offensive security researcher Francisco Rosales), published September 1, 2026.
- **Findings**: 8 total. Two received CVEs: Goose (CVE-2026-72718, CVSS 7.0) and Hermes Agent (CVE-2026-71963, assigned by independent CNA VulnCheck). OpenAI separately published four CVEs for Codex the same day (CVE-2026-19590, 19591, 19592 and 19593); three of them are execution sinks from repository config (19590 a Git hook, 19592 `core.fsmonitor`, 19593 a diff filter), while 19591 is a different class. The Hacker News says they came from three unrelated groups of researchers.
- **Still unpatched at publication**: Hermes Agent, Qwen Code, Grok Build, and a second path in Claude Code reached through `claude ultrareview` (which uses a different config key Manifold withheld to avoid enabling abuse). Of these, Hermes Agent landed a fix on September 2 and Qwen Code on September 12 (see timeline).
- **How the run proceeds (Manifold Security)**: (1) An attacker prepares a repository that still has its `.git/config` intact and sets `core.fsmonitor` (or a similar key) to an arbitrary command. (2) The victim opens that folder with an AI coding agent. (3) At startup, or before the first prompt, the agent runs ordinary background git commands like `git status` or `git diff`. (4) Refreshing Git's index for that command reads the repository's own `core.fsmonitor` setting and runs whatever it names. (5) The command executes outside the sandbox, as the user, with no approval prompt and nothing shown on screen.
- **Manifold's view of the cause**: It says the vulnerability is not in the model or in anything new, but in the ordinary subprocess an agent spawns at session startup. `core.fsmonitor` is a legitimate Git feature, not a bug.

### Timeline

- 2026-06-26: Manifold reports the Claude Code `core.fsmonitor` path; closed as a duplicate of a report filed the same day.
- 2026-06-29: The `core.fsmonitor` path is fixed in Claude Code 2.1.196 (no separate advisory published).
- 2026-07-07: Manifold reports the Qwen Code flaw to Alibaba's security response centre; accepted.
- 2026-07-08: Manifold reports the Cursor flaw; closed as a duplicate of another researcher's earlier report (later patched).
- 2026-07-13: Manifold reports the Goose flaw.
- 2026-07-14: Manifold reports the Grok Build flaw; closed as a duplicate of a July 1 report xAI had closed as "informative."
- 2026-07-15: Manifold reports the Claude Code `ultrareview` path; closed as a duplicate of an internal ticket.
- 2026-07-20: Manifold reports the OpenAI Codex flaw; closed as a duplicate (later patched).
- 2026-07-20: Manifold reports the Hermes Agent flaw; six contact attempts across five channels go untriaged.
- 2026-09-01: Manifold re-confirms all eight findings on current releases and publishes "GitSpawn." Goose (1.44.0) and Cursor are patched; OpenAI publishes four CVEs for Codex the same day (CVE-2026-19590 through 19593), also patched. Hermes Agent (0.21.0), Qwen Code (0.22.3), Grok Build (1.0.13), and Claude Code's `ultrareview` path (2.1.252) are confirmed still vulnerable.
- 2026-09-02: The Hacker News reports the findings. The same day, Hermes Agent lands a fix (commit f6234d0).
- 2026-09-03: CVE-2026-71963 is published. The GitHub Security Advisory (GHSA-cc88-9pxf-j2wv) records the affected range as 0.18.2 through 0.21.0, fixed in commit f6234d0.
- 2026-09-12: Qwen Code lands a fix (guarding the git calls the agent issues on its own initiative against config-named helper programs). Shipped in v0.23.4 on September 14.

> The facts rely on Manifold Security's disclosure and on the reporting and vulnerability records that carried it. Five of the eight findings were closed as duplicates — four of reports other researchers had independently filed, one of an internal ticket; one of those arrived the same day as Manifold's. Manifold has withheld the specific config key behind the still-unpatched `ultrareview` path to avoid enabling abuse. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Goose**: maintainers assigned CVE-2026-72718 (CVSS 4.0 base score 7.0) and shipped a fix in 1.44.0.
- **Claude Code**: the `core.fsmonitor` path was fixed in 2.1.196 without a dedicated advisory; the `ultrareview` path remained confirmed vulnerable at 2.1.252. Anthropic has disclosed pre-trust execution issues before, and its June CVE-2026-55607 covers fsmonitor execution during worktree operations; security firm Sonar reported the same sink (`core.fsmonitor`) in April 2026 that was partially mitigated by reordering the startup sequence.
- **OpenAI**: published three CVEs for Codex CLI/Desktop the same day, including CVE-2026-19592, and shipped fixes, crediting three unrelated research groups.
- **Qwen Code**: Alibaba's security response centre accepted the report on July 7 but the flaw remained unpatched as of September 1. A fix landed on September 12 and shipped in v0.23.4 on September 14.
- **Grok Build**: per Manifold Security's disclosure, xAI closed an earlier July 1 report as "informative" and closed Manifold's report as a duplicate of it; unpatched as of September 1, and no fix could be confirmed as of this writing.
- **Hermes Agent**: per Manifold Security's disclosure, six outreach attempts across five channels went untriaged; CVE-2026-71963 was assigned by VulnCheck rather than the vendor. A fix landed on September 2 and the CVE was published on September 3 (GHSA-cc88-9pxf-j2wv).

None of the eight findings appear in the U.S. CISA Known Exploited Vulnerabilities catalog (version 2026.09.14, 1,710 entries), and no source reports active exploitation.

## 6. Sources

- **Manifold Security (primary, original research)**: "GitSpawn: A Single Flaw Lets Untrusted Repos Run Code in Claude Code, Codex, Cursor, and Grok" (2026-09-01) — <https://www.manifold.security/blog/ai-coding-agents-git-hijack>
- **The Hacker News (independent reporting)**: "Malicious .git Configs Can Make Claude, Codex, Cursor, and Other AI Agents Run Attacker Code" (2026-09-02, Swati Khandelwal) — <https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-r5pp-p5r8-466r" (Goose, CVE-2026-72718) — <https://github.com/aaif-goose/goose/security/advisories/GHSA-r5pp-p5r8-466r>
- **CVE.org (primary, vulnerability record)**: "CVE-2026-71963" (Hermes Agent, assigned by VulnCheck) — <https://www.cve.org/CVERecord?id=CVE-2026-71963>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-cc88-9pxf-j2wv" (Hermes Agent, CVE-2026-71963, published 2026-09-03) — <https://github.com/advisories/GHSA-cc88-9pxf-j2wv>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-26wp-42v3-96xp" (OpenAI Codex, CVE-2026-19592, published 2026-09-01) — <https://github.com/advisories/GHSA-26wp-42v3-96xp>
- **Sonar (independent analysis)**: "Arbitrary code execution and Claude Code CLI: How Claude executed code before you click 'trust'" (2026-04-30, Yaniv Nizry; earlier report of the same sink) — <https://www.sonarsource.com/blog/claude-arbitrary-code-execution/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)

Patch status starts from Manifold Security's September 1, 2026 re-verification and is updated against the public record as of this writing (September 15, 2026): a GitHub Security Advisory for Hermes Agent, and the public repository history for Qwen Code. For Grok Build and Claude Code's `ultrareview` path, neither a vendor advisory nor a record of a fix could be confirmed.

