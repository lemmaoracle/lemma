---
brief_no: 62
title: "Claude Code GitHub Action：名前が `[bot]` で終わる起動者を信頼し、issue からエージェントが特権で動きうると示された(GMO Flatt Security の研究)"
title_en: "Claude Code GitHub Action: trusting actors whose names end in `[bot]` let an issue drive the agent's privileged run (GMO Flatt Security research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-04
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["037-agent-config-auto-execution", "029-github-dev-oauth-token", "048-trapdoor-ai-instruction-provenance", "003-starlette-badhost"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Claude Code GitHub Action で、`[bot]` を名乗る issue からエージェントが特権で動きうると研究者が報告"
og_lead_en: "A researcher reports an issue posing as a `[bot]` could drive the Claude Code GitHub Action's privileged run"
og_kicker_ja: "脆弱性の開示 · AI エージェントの起動"
og_kicker_en: "VULNERABILITY DISCLOSURE · AI AGENT TRIGGER"
og_headline_ja: "bot を名乗る issue で、\nエージェントが特権で\n動きうると研究者が報告。\n<accent>CVSS 7.8・4 日で修正</accent>"
og_headline_en: "An issue posing as a bot\ncould steer the agent,\na researcher reports.\n<accent>CVSS 7.8, fixed in 4 days</accent>"
key_figures:
  - value: "7.8"
    label: "Severity under CVSS 4.0. The fixes converge in claude-code-action v1.0.94"
    tone: "alert"
  - value: "4"
    unit: "days"
    label: "From the researcher's report of the core bypass to Anthropic's fix (January 2026)"
  - value: "~50"
    unit: "techniques"
    label: "Ways of circumventing the permission system that RyotaK says he reported"
glossary:
  - term: "GitHub App and installation token"
    desc: "A GitHub App is an integration installed on repositories. The installation token issued per installation can create issues and PRs. Its actor name ends in `[bot]`."
  - term: "OIDC token"
    desc: "A signed token stating \"I am this workflow running in this repository.\" Claude Code exchanges it with Anthropic's backend for an installation token of the Claude GitHub App, which has write access."
  - term: "Indirect prompt injection"
    desc: "Planting instructions in documents or data an AI reads (here, an issue body) so that the AI executes them as instructions."
insight:
  slug: "name-suffix-as-authority"
  label: "Treating a name suffix as authority to trigger"
  quote: "Unless, before an agent runs with privilege, the authority of whoever triggered it and the origin of the input it reads are checked against separately managed records rather than a name or the look of the text, a trigger and instructions anyone can create become privileged operations as they are."
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "Confirm the triggering actor is really an authorized bot, not just named '[bot]'"
attack_method: "ai-misuse"
takeaway: "A researcher showed that trusting actors whose names end in [bot] let an issue from a GitHub App anyone can create drive the agent's privileged run."
self_check: "Before an AI agent runs with privilege, do you check that whoever triggered it holds legitimate authority against permission records rather than a name?"
countries: ["global"]
---

## 1. Summary

According to GMO Flatt Security researcher RyotaK, the trigger check in the Claude Code GitHub Action unconditionally trusted any actor whose name ends in `[bot]`. Anyone can register a GitHub App and use its token to create issues on any public repository, so an attacker's issue passes as "a bot trigger," and an agent with write access can execute the instructions planted in its body. The researcher demonstrated this on his own test repositories, and the fix was available before publication. <strong>Unless, before an agent runs with privilege, the authority of whoever triggered it and the origin of the input it reads are checked against separately managed records rather than a name or the look of the text, a trigger and instructions anyone can create become privileged operations as they are.</strong>

## 2. What got through

- **What got through**: Triggering the agent with an issue created by the attacker's own GitHub App. The trigger check (`checkWritePermissions`) took the `[bot]` name suffix as grounds for authority, and agent mode lacked the human confirmation that tag mode had (RyotaK). Then Claude could execute, as "recovery," instructions in an issue body disguised as an error message (RyotaK).
- **What reached the receiving side**: In general, an agent running in CI holds the secrets passed to the workflow and write access to the repository. In the researcher's report, having secrets in environment variables written back into the issue, stealing the credential used for the OIDC token exchange, and replaying the exchange reaches write access to the target's code, issues, and workflows. Aimed at the claude-code-action repository itself, it could poison the Action that downstream consumers pull in.
- **Secondary paths**: Anthropic's example workflow included `allowed_non_write_users: "*"` (anyone can trigger; flagged as a risk in the docs too), and Claude posted task summaries to the publicly visible run-summary field, so repositories that copied it inherited the same hole. An attacker without trigger rights could also slip content in as "trusted input" by editing a trusted user's issue after it triggered but before Claude read it (RyotaK).
- **Not disclosed**: Any use of this path against a real-world target. The researcher's write-up says the demonstration was limited to his own test repositories.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before an agent runs with privilege, whether whoever triggered it holds authority for that operation, and where the input it reads came from and whether it has changed since the trigger, are checked separately from a name or the look of the text.

- **Who approves**: The repository administrator, who decides which people and which installed Apps may trigger the agent. An actor's name suffix or the wording of an issue body is not used as approval.
- **Where it is checked**: Immediately before the agent moves to execution holding secrets and write access. Whether the triggering party is on the allowed list is checked against permission records, not a name. The input it reads is checked against the version at trigger time, and a trigger or input that cannot be checked is held until it is.
- **What is recorded**: Who triggered the agent, under what authority, and what it executed (or held) on which version of the input. Kept separately from the agent, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an agent runs with privilege, the authority of whoever triggered it and the origin of its input, and keeping a record. Detection means a researcher finding and reporting the bypass. Dates are those of the report, the fix, and publication, not of any use of the path.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the agent runs with privilege, check the trigger's authority and the input's origin</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A trigger claiming [bot] and instructions in an issue<br>were shown able to drive the agent's privileged run</span></div>
<div class="rx-zone det"><b>Detection · a researcher found it</b>RyotaK reported it and Anthropic fixed it</div>
<div class="rx-g g1"><div class="t">2026-01</div><b>RyotaK reports to Anthropic</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>Core fixed within four days</b></div>
<div class="rx-g g3"><div class="t">Spring 2026</div><b>Further hardening (in v1.0.94)</b></div>
<div class="rx-g g4"><div class="t">06-04</div><b>Published in research and press</b></div>
</div>
</figure>

Discovery of the flaw and publication after the fix worked, and Anthropic fixed it within four days of the report. CI logs let what was executed be traced afterwards. What was missing is the layer before that, which checks the trigger's authority and the input's origin. It has the same shape as [Brief 037](/critical/briefs/037-agent-config-auto-execution/), where an agent auto-executed a repo-bundled config, [Brief 048](/critical/briefs/048-trapdoor-ai-instruction-provenance/), where an AI read instructions invisible to humans, and [Brief 029](/critical/briefs/029-github-dev-oauth-token/), where a stolen token was not scoped to the action: the agent's privileged operation is not tied to a check of its trigger and input.

## 4. What Lemma does

**Lemma builds the check in section 03 in immediately before the agent moves to execution holding secrets and write access.** It does not detect malicious issues or prompt injection; before execution, it checks the authority of whoever triggered the agent and the version of the input it reads, separately from a name or the look of the text.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Development and operations teams that embed AI agents in CI/CD and have them triage issues, apply labels, and review PRs.
- **Industry · AI**: Organizations operating platforms where agents holding real tokens and tools run on input arriving from outside.
- **Operation · Agent runs triggered by issues and PRs**: Work in public repositories where issues or PRs created by outside people or Apps trigger the agent. The trigger check and the input read lead straight to operations with write access.

### Current controls vs Lemma

The core route in this case is the first column: a trigger by a party without authority. The second column is the post-trigger edit the researcher reported as a secondary path; the third compares the case where instructions are contained in input a legitimate trigger supplied.

| Control | Trigger by a party without authority (claiming `[bot]`) | Input slipped in after a legitimate trigger (editing the issue after it triggered) | Instructions in input supplied by a legitimate trigger |
| --- | --- | --- | --- |
| Trigger check by the `[bot]` name suffix (before the fix) | Not effective | Not relevant | Not relevant |
| Auditing workflows for who or what can trigger (Anthropic's recommendation) | Partial | Not relevant | Not relevant |
| Limiting secrets and exfiltration-capable tools and permissions when handling unverified input (Anthropic's recommendation) | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

The name-suffix check could be satisfied by the name of a GitHub App anyone can register (RyotaK). Auditing workflows finds and removes settings that let anyone trigger, but a hole in the check itself remains. Limiting secrets and tools narrows what can be reached in every column, but does not stop the trigger or the execution of instructions. Lemma checks the triggering party against the list the administrator allowed and the permission records, and checks the input against its version at trigger time, so a trigger by name alone, or input replaced after the trigger, is held before execution. On the other hand, if instructions are contained in the input a legitimate trigger supplied, the check matches and it passes. That column is covered in combination with limiting secrets and tools.

Note: Lemma's check works only when it is built into the step that triggers the agent, and the list of allowed triggers, the permission records, and the record of input versions are managed separately from the input the agent reads. If the key of an App or person the administrator allowed is stolen, or malicious instructions are executed within the allowed scope, it can pass. Lemma does not change claude-code-action's implementation and does not judge whether the content of the input is benign. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that trigger AI agents in CI/CD from issues and PRs

- Is the claude-code-action you use at or above the version where the fixes converged (v1.0.94)?
- Have you left in place settings copied from example workflows that let anyone trigger (such as `allowed_non_write_users: "*"`), or output to publicly visible fields?
- In workflows that handle unverified input, do you pass the agent only the secrets it needs (the Anthropic API key and `GITHUB_TOKEN`)?

## 5. Facts and timeline

- **Target**: Anthropic's Claude Code GitHub Action (claude-code-action), which embeds Claude in CI/CD to triage issues, apply labels, review PRs, and run slash commands. By default it has read/write access to the repository's code, issues, PRs, discussions, and workflow files.
- **Severity and fix**: 7.8 under CVSS 4.0. The fixes converge in claude-code-action v1.0.94. Anthropic paid a bug bounty.
- **Reporter**: GMO Flatt Security researcher RyotaK, who reported the core bypass to Anthropic in January 2026.
- **The researcher's report (trigger)**: The trigger check (`checkWritePermissions`) unconditionally trusted any actor whose name ends in `[bot]` (on the assumption that a GitHub App is trusted, installed by an admin). Anyone can register a GitHub App, install it on their own repository, and use its installation token to create issues or PRs on any public repository. Tag mode had an additional human-confirmation check; agent mode did not.
- **The researcher's report (input and reach)**: Instructions are planted in an issue body disguised as an error message, leading Claude to execute them as "recovery." Having secrets in environment variables written back into the issue, stealing the credential used for the OIDC token exchange, and replaying the exchange yields an installation token with write access.
- **Secondary paths (the researcher's report)**: Repositories that copied the example workflow's `allowed_non_write_users: "*"` and output to the public run-summary field inherited the same hole. Editing an issue after it triggered, before Claude read it, could slip content in as trusted input.

### Timeline

- **2026-01**: RyotaK reports the core bypass to Anthropic. Anthropic fixes it within four days.
- **Spring 2026**: Additional hardening continues; the fixes converge in claude-code-action v1.0.94.
- **2026-06-04**: The details are published (GMO Flatt Security's research post, The Hacker News, and others).

> This was handled as a coordinated disclosure, published after a fix was available. Facts about the technique follow GMO Flatt Security's research post and The Hacker News's coverage; the fix follows Anthropic's fix commit. There is no public trace of "this exact path" poisoning Anthropic's Action being used against a real-world target, and RyotaK says he demonstrated it only on his own test repositories. With the same shape of setup (AI issue triage, broad permissions, prompt injection), a February 2026 case in which an npm publish token was stolen via Cline's claude-code-action workflow and a malicious version published has been reported as a separate route. RyotaK says he reported roughly 50 techniques for circumventing the permission system. This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Anthropic**: Fixed the core within four days of the report and hardened through the spring; the fixes converge in claude-code-action v1.0.94. It advises users to audit workflows where non-write users or bots can trigger Claude, to pass no secrets beyond the Anthropic API key and `GITHUB_TOKEN` when handling unverified input, and to remove tools and permissions usable for exfiltration.
- **Example configurations**: Copying example settings as they are, such as `allowed_non_write_users: "*"` or output to publicly visible fields, was pointed out as something that can widen the hole.

## 6. Sources

- **GMO Flatt Security (primary, researcher)**: RyotaK, "Poisoning Claude Code: One GitHub Issue to Break the Supply Chain" — <https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/>
- **The Hacker News**: "Claude Code GitHub Action Flaw Let One Malicious Issue Hijack Repositories" (2026-06-04) — <https://thehackernews.com/2026/06/claude-code-github-action-flaw-let-one.html>
- **Anthropic (primary, fix commit)**: claude-code-action fix commit (converging in v1.0.94) — <https://github.com/anthropics/claude-code-action/commit/1bbc9e7ff7d48e1299f7fa9698273d248e0cafea>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
