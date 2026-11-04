---
brief_no: 128
title: "Claude Code・Gemini CLI・Codex：権限の無い issue が、既定の CI のワークフローを乗っ取りえた(Novee Security の報告)"
title_en: "Claude Code, Gemini CLI and Codex: an unprivileged GitHub issue could take over default CI workflows (Novee Security research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["062-claude-code-github-action-bot-trust", "095-amazon-q-mcp-auto-execution", "114-aws-kiro-self-rewriting-mcp-config", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Novee Security が Claude Code・Gemini CLI・Codex を各社の既定の構成のまま検証し、権限の無いアカウントが立てた GitHub の issue 1 件で、CI でのコードの実行や次のエージェントの実行の乗っ取りに至ったと Black Hat USA で公表した。CVE 2 本は修正済み"
og_lead_en: "Novee Security tested Claude Code, Gemini CLI and Codex in each vendor's default configuration and reported at Black Hat USA that a single GitHub issue from an unprivileged account led to code running in CI or to the next agent run being hijacked. Both CVEs are fixed"
og_kicker_ja: "研究の報告 · コーディングエージェント"
og_kicker_en: "RESEARCH · CODING AGENTS"
og_headline_ja: "既定の AI 3 種が\nissue 1 件で破られたと\nNovee が報告。\n<accent>CVE 2 本は修正済み</accent>"
og_headline_en: "Three coding agents fell\nto one GitHub issue,\nNovee reports.\n<accent>Two CVEs, both fixed</accent>"
key_figures:
  - value: "1"
    label: "GitHub issue needed as the starting point. Per Novee, any account with no repository privileges can open one"
    tone: "alert"
  - value: "3"
    label: "Coding agents tested in their default configuration (Claude Code, Gemini CLI, Codex)"
  - value: "2"
    label: "CVEs assigned (Gemini CLI, Claude Code), both fixed. Codex has neither a CVE nor a product-version patch"
glossary:
  - term: "Coding agent"
    desc: "An AI that takes a request, reads and writes code, and runs commands. Built into CI, it responds to issues and pull requests automatically."
  - term: "Harness"
    desc: "The code between the model and the real environment that decides which of the model's outputs actually run. Allowlists and command checks live here."
  - term: "CI"
    desc: "A mechanism that runs set jobs automatically when code changes or an issue is opened, such as GitHub Actions. It runs holding secrets and tokens."
  - term: "Allowlist"
    desc: "A list registered in advance of the commands or fetch destinations an agent may use."
insight:
  slug: "safe-mark-trusted-at-execution"
  label: "Execution that trusts an earlier stage's \"safe\" mark as is"
  quote: "Unless the origin and permitted scope of a value one stage marked \"safe\" are checked before a later stage acts on it with more authority, a single unprivileged input can reach CI secrets or the next run."
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Check the origin and permitted scope of a value marked \"safe\" before running it with stronger privileges"
attack_method: "ai-misuse"
takeaway: "Novee Security reported that in coding-agent harnesses, a later stage acted with more authority on a value an earlier stage had marked \"safe,\" without its origin and permitted scope being checked first."
self_check: "In AI agent workflows that outside users can trigger, do you check the input's origin and permitted scope, apart from the agent, before any privileged action?"
countries: ["global"]
---

## 1. Summary

Security firm Novee Security tested Anthropic's Claude Code, Google's Gemini CLI and OpenAI's Codex, each in the configuration the vendor ships by default, and presented the work at Black Hat USA on August 5, 2026. According to Novee, a single GitHub issue opened by an account with no privileges was enough to run code on the CI runners behind Anthropic's and Google's own repositories, and on OpenAI's repository it was enough to hijack the next agent run. Two CVEs came out of it, both fixed. CISA's records show no confirmed exploitation of either. What Novee pointed to as the common thread was not fooling a model, but that inside the harness around the agent, one stage marked a value "safe" and a later stage acted on it with more authority. <strong>Unless the origin and permitted scope of a value one stage marked "safe" are checked before a later stage acts on it with more authority, a single unprivileged input can reach CI secrets or the next run.</strong>

## 2. What got through

- **What got through**: Execution with more authority, starting from an issue opened by an unprivileged account. According to Novee, in Gemini CLI (CVE-2026-12537), an OS command injection in the container launcher, reached through a configuration file placed in the repository, ran code with host privileges before the sandbox started. Gemini CLI's allowlist did not check the fine-grained entries registered for a command at execution time (no CVE). In Claude Code (CVE-2026-54316), at three stages (the command validator, commands treated as read-only, and a fetch destination pre-approved by hostname alone), values each treated as "safe" were used for execution or outbound sending without being checked. In Codex, two runs inside one job shared the same checkout, and the second loaded as its own instructions the default instruction file (`AGENTS.md`) that the first had rewritten.
- **What reached the receiving side**: According to Novee, environment variables holding CI secrets, the workflow's `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`, and the instructions for the next agent run. Anthropic says exploitation required getting untrusted content into a Claude Code context.
- **Not disclosed**: How many workflows at organizations other than the three vendors' own repositories, using the same default configuration, were affected. This Brief does not include the details of the chains (the shape of the input or the sending technique).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an agent moves to a more privileged action (launching a container, running a command, loading instructions), it checks where the value used for that action came from and whether the action is within the permitted scope, apart from the "safe" mark an earlier stage applied.

- **Who approves**: The development teams that run agents in CI, and those who manage the workflows. In workflows outside users can trigger, they decide, apart from the agent, which inputs may lead to which actions. When input from an unprivileged account moves on to an action that touches secrets or changes the next run's instructions, a person approves it.
- **Where it is checked**: Just before the harness passes a value on to launching a container, running a command or the next run's instructions. The allowlist is checked per action at execution time, not only at registration. Values that cannot be checked are not passed on to the more privileged stage.
- **What is recorded**: Which input (an issue, a bundled file, a prior run's output) led to which action under which permission (or which actions were stopped). Kept apart from the agent, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a more privileged action, the value's origin and permitted scope, and keeping a record. Detection means finding, reporting and fixing vulnerabilities. The dates are when advisories and the research were published, not when the routes were used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before running with more authority, check the value's origin and permitted scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>One unprivileged issue could reach<br>CI secrets or the next run</span></div>
<div class="rx-zone det"><b>Detection · Novee reported, vendors fixed or mitigated</b>Vulnerability report, fixed version, publication</div>
<div class="rx-g g1"><div class="t">04-24</div><b>Google's allowlist advisory</b></div>
<div class="rx-g g2"><div class="t">06-17</div><b>Claude Code advisory</b></div>
<div class="rx-g g3"><div class="t">06-24</div><b>Gemini CLI CVE published</b></div>
<div class="rx-g g4"><div class="t">08-05</div><b>Novee presents at Black Hat</b></div>
</div>
</figure>

Each vendor had allowlists, command checks and sandboxes, and the researcher's reports and the fixes worked. What did not work was the layer before that, which checks a value's origin and permitted scope before a more privileged action, apart from the "safe" mark an earlier stage applied. It connects with [Brief 037, where a repository-bundled config was auto-executed](/critical/briefs/037-agent-config-auto-execution/), [Brief 114, where an agent was made to rewrite its own MCP config](/critical/briefs/114-aws-kiro-self-rewriting-mcp-config/) and [Brief 095, where a bundled MCP config ran just by opening a repository](/critical/briefs/095-amazon-q-mcp-auto-execution/), in that the agent's authority is not tied to where an instruction came from or what it is allowed to do.

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before the harness passes a value on to a more privileged action.** It does not judge whether input is malicious; it checks, before execution, the value's origin and whether the action is within the permitted scope, against permissions managed apart from the agent.

### Industries and operations to watch

- **Industry · Developers**: Development teams that let a coding agent respond to issues and pull requests in CI such as GitHub Actions. In workflows outside users can trigger, the agent's privileges extend to CI secrets and tokens.
- **Industry · AI**: Organizations that build coding agents and their CI workflows and ship them as default configurations.

### Current controls vs Lemma

This incident's Gemini CLI and Claude Code routes fall in column 1, and the Codex route in column 2. Column 3 is not a route in this incident.

| Control | Running a value an allowlist or check marked "safe" with more authority | A next run loading an instruction file a prior run wrote | Actions within the permitted scope that follow an injected instruction |
| --- | --- | --- | --- |
| Updating to fixed versions (Gemini CLI 0.39.1, Claude Code 2.1.163) | Partial | Not relevant | Not relevant |
| Separating workflows (separate jobs, separate checkouts, read-only) | Not relevant | Partial | Not relevant |
| Sandbox | Not effective | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Updating to fixed versions closes the known routes, but as Novee got separate chains through in three rounds, the same shape can remain at another stage. OpenAI separated the two runs into different jobs and checkouts on the repository side, but that does not show that Codex itself now treats a writable instruction file differently. In Gemini CLI, code ran before the sandbox started; in Codex, per OpenAI the sandbox behaved as documented while the next run was hijacked. Lemma checks the value's origin and permitted scope before a more privileged action, apart from the earlier stage's mark, and stops when it cannot be checked, so actions in columns 1 and 2 stop before they run. On the other hand, if actions following an injected instruction happen within the permitted scope, the check matches.

Note: Lemma's check works only when it is built into the harness's move to a more privileged action, and the permitted scope is managed apart from the input the agent reads. If the scope is set broadly, malicious actions within it go through. The check neither judges whether input is malicious, nor fixes flaws in the harness, nor shows that the model's reasoning was correct. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that run coding agents in CI

- Have you listed the workflows outside users can trigger through issues and the like, and are the agents they use on fixed versions?
- Do you keep separate agent runs from sharing the same writable directory, and scope tokens to the permissions each task needs?
- Can you see, apart from the agent, a record of which input led the agent to run which commands and touch which secrets?

## 5. Facts and timeline

- **Subject**: Anthropic's Claude Code, Google's Gemini CLI and OpenAI's Codex, each tested in the default CI workflow the vendor provides.
- **Identifiers**: CVE-2026-12537 (Gemini CLI, GHSA-jj69-4grx-fqj5) and CVE-2026-54316 (Claude Code, GHSA-fg94-h982-f3mm). Gemini CLI's allowlist was covered by an earlier advisory (GHSA-wpqr-6v78-jr5g, no CVE assigned). Codex has no CVE.
- **Severity**: Diverges by scorer. For CVE-2026-12537, the CNA (Google Cloud) scores v4 10.0 (Critical) while NVD's primary assessment is v3.1 7.8 (High). For CVE-2026-54316, the GitHub Advisory carries v4 6.0 (Moderate) while NVD's primary assessment is v3.1 9.1 (Critical). The scales differ, so no single number compares them.
- **Entry point (Novee)**: An issue opened by any GitHub user with no privileges. Issue text, repository-bundled files and fetched content that the agent reads.
- **Gemini CLI (Novee)**: An OS command injection in the container launcher ran code with host privileges before the sandbox started, and CI secrets could be read from the parent process's environment in the same namespace. The allowlist's fine-grained entries were neither parsed nor enforced.
- **Gemini CLI allowlist (Google's advisory)**: Google acknowledged that under `--yolo` the fine-grained allowlist was ignored, and fixed it in 0.39.1 so the policy engine evaluates the allowlist under `--yolo` too. The advisory credits Novee's Elad Meged and Pillar Security's Dan Lisichkin as reporters.
- **Claude Code (Novee)**: Novee ran three separate chains in three rounds against `anthropics/claude-code` and came away with the workflow's `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`. The stages were the command validator, commands registered as read-only, and `huggingface.co` pre-approved for WebFetch by hostname alone.
- **Codex (Novee)**: In the `openai/codex` repository, two Codex runs inside one job shared the same checkout, and the second loaded as its own instructions the `AGENTS.md` the first had rewritten.
- **Exploitation status**: According to The Hacker News, CISA lists exploitation as "none" for both CVE records, and neither appeared in the Known Exploited Vulnerabilities catalog as of 2026-08-07. A public repository describing itself as a reproduction lab for the Claude Code flaw has existed since June 18, but nothing shows it used against a target.

### Timeline

- **2026-04-24**: Google published its advisory on Gemini CLI folder trust and tool allowlisting (GHSA-wpqr-6v78-jr5g). The fixes shipped in `@google/gemini-cli` 0.39.1 and `run-gemini-cli` 0.1.22, and the advisory stated the impact "affects all Gemini CLI GitHub Actions."
- **2026-06-17**: The Claude Code flaw (CVE-2026-54316 / GHSA-fg94-h982-f3mm) was published to the GitHub Advisory Database.
- **2026-06-24**: The Gemini CLI container-launcher flaw (CVE-2026-12537 / GHSA-jj69-4grx-fqj5) was published. Google Cloud is the CNA.
- **2026-08-05**: Novee presented the cross-vendor work at Black Hat USA.
- **2026-08-06**: Novee founding engineer Elad Meged published the details on the company blog.
- **2026-08-07**: The Hacker News reported that CISA lists exploitation as "none" for both CVE records.

> The facts in this Brief rest on Novee Security's disclosure, Google's and Anthropic's advisories, the GitHub Advisory Database and NVD entries, and The Hacker News' reporting. The description of the chains and the summary of the arc are Novee's account; this is research against default configurations, not a real-world breach. This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Google**: fixed Gemini CLI's allowlist in 0.39.1 and `run-gemini-cli` 0.1.22.
- **Anthropic**: fixed all three rounds: an explicit git-push allowlist (with most Bash tools removed), `display_report` turned off with output sanitized, and `huggingface.co` scoped to a docs path. CVE-2026-54316 was assigned to the last chain, with the fix in 2.1.163 (versions from 0.2.54 up to but excluding 2.1.163 were affected).
- **OpenAI**: no product-version patch. On the repository side it separated the two runs into different jobs and checkouts, moved them into read-only environments, and updated its guidance to treat repository instruction files as part of the untrusted input surface. Its position is that its sandbox behaved as documented.
- **Shared mitigations**: auditing workflows outside users can trigger, not letting separate agents share a writable directory, and scoping tokens to the permissions each task needs.
- **Novee**: summarizes the arc as "Three rounds. Each fix got more targeted and each attack got quieter."

## 6. Sources

- **Novee Security (primary research)**: Elad Meged, "Black Hat 2026: If You Run These Automations, You're Exposed Too: Critical Flaws in Anthropic, Google, and OpenAI's Coding Agents" (published 2026-08-06; presented at Black Hat USA 2026-08-05) — <https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/>
- **GitHub Advisory Database (primary)**: CVE-2026-12537 / GHSA-jj69-4grx-fqj5 (CNA: Google Cloud, 2026-06-24) — <https://github.com/advisories/GHSA-jj69-4grx-fqj5>
- **Google (primary)**: Gemini CLI advisory on folder trust and tool allowlisting, GHSA-wpqr-6v78-jr5g (2026-04-24, no CVE assigned) — <https://github.com/google-github-actions/run-gemini-cli/security/advisories/GHSA-wpqr-6v78-jr5g>
- **Anthropic (primary)**: Claude Code security advisory GHSA-fg94-h982-f3mm (2026-06-17) — <https://github.com/anthropics/claude-code/security/advisories/GHSA-fg94-h982-f3mm>
- **NVD (primary)**: CVE-2026-54316 (NVD primary assessment v3.1 9.1, alongside the GitHub Advisory's v4 6.0) — <https://nvd.nist.gov/vuln/detail/CVE-2026-54316>
- **The Hacker News (independent reporting)**: Swati Khandelwal, "Claude Code and Gemini CLI Flaws Let a GitHub Issue Reach CI Workflow Secrets" (2026-08-07) — <https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
