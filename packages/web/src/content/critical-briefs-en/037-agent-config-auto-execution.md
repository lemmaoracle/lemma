---
brief_no: 37
title: "AI コーディングエージェント：リポジトリに同梱の設定ファイルを自動で実行し、マルウェア Miasma に使われた(Adversa AI・StepSecurity)"
title_en: "AI coding agents: config bundled in repositories ran automatically and was used by the Miasma malware (Adversa AI, StepSecurity)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-05
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "027-librechat-mcp-url-secrets", "006-google-api-key-revocation-lag", "003-starlette-badhost", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "マルウェア Miasma がリポジトリに AI エージェントの設定ファイルを仕込み、プロジェクトを開いた開発者の環境で実行されたと報告。GitHub は Microsoft 系 4 組織の 73 リポジトリを無効化"
og_lead_en: "Miasma reportedly planted AI agent config files in repositories that ran when developers opened the project; GitHub disabled 73 repositories across four Microsoft organizations"
layout: "report"
sections: "proof"
og_kicker_ja: "AI エージェントの脆弱性 · 同梱設定の自動実行"
og_kicker_en: "AI AGENT FLAW · AUTO-RUN CONFIG"
og_headline_ja: "リポジトリ同梱の設定が、\n開くと実行されたと報告。\n<accent>73 件を無効化</accent>"
og_headline_en: "Config bundled in repos\nran on open, per reports.\n<accent>73 repos disabled</accent>"
key_figures:
  - value: "73"
    unit: "repos"
    label: "Repositories across four Microsoft organizations disabled by GitHub (StepSecurity)"
    tone: "alert"
  - value: "06-03 → 06-05"
    label: "Period in which Miasma's third wave used AI agent config files (safedep)"
  - value: "On open"
    label: "When the planted config ran: as a developer opened the project in an AI coding tool (safedep)"
glossary:
  - term: "MCP server"
    desc: "A server that connects an AI agent to external tools and data. If a project's config defines one, the agent starts it."
  - term: "Folder trust"
    desc: "The prompt asking the user whether an opened folder's config and code may run. Adversa AI reports that it defaulted to \"trust\" and that approving it auto-started project-defined MCP servers."
insight:
  slug: "bundled-config-runs-on-open"
  label: "Bundled config that runs just by opening"
  quote: "Opening a project or trusting a folder says nothing about where its bundled config came from. Unless the author and the allowed scope are checked before execution, planted config passes as an ordinary launch."
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Do not execute bundled config until its author and contents are checked"
attack_method: "ai-misuse"
impact: "73 repositories across 4 Microsoft orgs disabled"
takeaway: "AI agent config files planted in repositories reportedly ran when developers opened the project, with nothing checking where they came from."
self_check: "Before an AI coding agent loads config bundled in a repository, do you check its author and the scope it may run in?"
countries: ["global"]
---

## 1. Summary

Nothing beyond actions developers take every day was involved: opening a project and trusting a folder. The researchers at Adversa AI reported that major AI coding agents treat those actions as sufficient permission and automatically execute config bundled in a repository (agent settings, MCP server definitions, startup hooks). The vendor researchers safedep and StepSecurity report that the self-propagating malware Miasma used this pattern to steal credentials from developers who opened the project, and that GitHub disabled 73 repositories across four Microsoft organizations. The disabling came after the config had run. <strong>Opening a project or trusting a folder says nothing about where its bundled config came from. Unless the author and the allowed scope are checked before execution, planted config passes as an ordinary launch.</strong>

## 2. What got through

- **What got through**: AI coding agents loading and executing config bundled in a repository. According to safedep, Miasma's third wave planted Claude Code, Gemini CLI, and Cursor config files in repositories and ran a credential-stealing program as soon as a developer opened the project in an AI coding tool.
- **What the researchers reported**: Adversa AI reported a flaw in which an operation that looks like a harmless file copy rewrites the agent's own config so that attacker code runs at the next launch (SymJack), and a flaw in which approving folder trust starts a project-defined MCP server without explicit approval (TrustFall). It says neither the approval prompt nor the displayed file operation accurately conveys what will actually run.
- **What reached the receiving side**: In general, the agent receives the user's action of opening the project or trusting the folder, and the config files in the repository. Who wrote that config, and how much execution it is allowed, cannot be told from these.
- **What execution delivered**: According to the reports, the credentials available to the development environment for GitHub, npm, AWS, Azure, GCP, Vault, Kubernetes, and more. Miasma used them to place the same kind of config in other repositories and packages within reach, and spread (safedep, StepSecurity).
- **Not disclosed**: Which path infected each repository, how many credentials were stolen, and how far restoration has progressed. How each tool changed its folder-trust defaults or the automatic execution of bundled config could not be confirmed from this Brief's sources.

## 3. Pre-execution check

The condition that can be told apart whatever the route is this: before an agent loads and executes config bundled in a repository, check whether that config comes from its legitimate author and stays within the scope it is allowed to run in.

- **Who approves**: The legitimate author who wrote the config, and the user or organization that decides how much the agent may execute. Opening a project or trusting a folder does not stand in for this approval.
- **Where it is checked**: Before the agent loads bundled config and starts MCP servers or startup hooks. Config that cannot be checked is not executed until it can be.
- **What is kept**: A record of which config was executed (or held), on confirmation of which author, with which scope allowed. Later, legitimate operations can be shown apart from operations driven by planted config.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an agent executes bundled config, its author and the allowed scope, and keeping a record. Detection means finding and stopping things after execution, through researchers' reports or detection of malicious commits. Dates follow the timeline in section 05.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before executing bundled config, check its author and the allowed scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Planted config ran when the project was opened<br>Credentials were stolen and it spread to other repositories</span></div>
<div class="rx-zone det"><b>Detection · worked after execution</b>Malicious commits detected and 73 repositories disabled</div>
<div class="rx-g g1"><div class="t">Early 2026-05</div><b>TrustFall reported</b></div>
<div class="rx-g g2"><div class="t">2026-05-26</div><b>SymJack reported</b></div>
<div class="rx-g g3"><div class="t">2026-06-03</div><b>Miasma's third wave</b></div>
<div class="rx-g g4"><div class="t">2026-06-05</div><b>73 repositories disabled</b></div>
</div>
</figure>

Researchers' reports, detection of malicious commits, and the disabling of repositories all worked, and the techniques and infections became visible from outside. But the disabling came after the config had run and credentials had been stolen. Similar cases where config brought in from outside went straight to execution are [GitSpawn, where opening a folder made AI coding agents run code](/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/) (Brief 147); related are a user-specified MCP URL carrying out the server's secrets in [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/), MCP server authentication bypassed via the Host header in [Brief 003](/critical/briefs/003-starlette-badhost/), and an artifact that was malicious despite a valid signature in [Brief 014](/critical/briefs/014-tanstack-oidc-trusted-publisher/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the steps by which an agent executes bundled config.** It does not detect after infection; before execution, it checks whether the config comes from its legitimate author and stays within the allowed scope, and does not let through executions that cannot be checked.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Developers and organizations that open repositories received from outside with AI coding agents.
- **Industry · AI adoption (all industries)**: Organizations that use AI coding agents in development environments that hold credentials for cloud services and package publishing.

### Current controls vs Lemma

The route in this case is the agent executing bundled config when a project is opened, and the same kind of config being placed in other repositories with stolen credentials.

| Control | Executing bundled config (on opening a project) | Spread to other repositories via stolen credentials |
| --- | --- | --- |
| Folder-trust prompt (approval prompt) | Not effective | Not applicable |
| Signature checks | Not effective | Not effective |
| Detecting malicious commits and disabling repositories | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

In Adversa AI's report, approving the folder-trust prompt started MCP servers and did not accurately convey what would run. Signature checks only show that a repository is valid and cannot tell, before execution, whether the config will steal credentials; the spread passes through trusted publish and commit paths, so it passes signature checks. Detecting malicious commits and disabling repositories was how the incident was contained, stopping 73 repositories, but it worked after the config had run and credentials had been stolen. Lemma checks the author and the allowed scope before the agent executes bundled config. It does not revoke the stolen credentials themselves, so the spread column stays partial.

Note: Lemma's check works only when the agent builds the check into the step that loads bundled config, and confirmation of the legitimate author and the allowed scope are managed outside the agent. If a legitimate author's key is stolen and used to write the config, this check can be passed. It does not judge whether the config itself is safe. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that use AI coding agents

- Before an agent executes config bundled in a repository received from outside (agent settings, MCP server definitions, startup hooks), do you confirm its author?
- Is folder-trust approval set up so that it does not, by default, permit bundled config to run without showing what will run?
- Do you record, outside the agent, which config was executed on confirmation of which author?

## 5. Facts and timeline

- **Target**: AI coding agents that execute config bundled in repositories. Adversa AI reports confirming SymJack on Claude Code, Gemini CLI (Antigravity), Cursor, GitHub Copilot, Grok Build, and others, and TrustFall on Claude, Cursor, Gemini CLI, and GitHub Copilot.
- **Researchers' reports**: Adversa AI published TrustFall in early May 2026 and SymJack on May 26. Both concern a mismatch between the approvals and operations the user sees and what actually runs.
- **Real-world abuse**: On June 2, the Microsoft Security Blog published Miasma's credential-stealing technique. According to safedep, after spreading via npm preinstall hooks (first wave) and binding.gyp execution (second wave, Phantom Gyp), Miasma shifted in its third wave to planting AI agent config files in repositories. The reports say it fetches the Bun runtime to start a next-stage program, harvests credentials, and self-propagates.
- **Scale**: According to StepSecurity, on June 5, 2026, GitHub disabled 73 repositories across four Microsoft organizations (Azure, Azure-Samples, Microsoft, MicrosoftDocs). Microsoft explained that it had temporarily removed some repositories and would restore them in sequence after review.

### Timeline

- **Early 2026-05**: Adversa AI publishes TrustFall (approving folder trust auto-starts MCP servers).
- **2026-05-26**: Adversa AI publishes SymJack (the agent's config is rewritten and runs at launch).
- **2026-06-01 to 03**: Miasma spreads via npm preinstall hooks (first wave) and binding.gyp execution (second wave).
- **2026-06-02**: The Microsoft Security Blog publishes Miasma's credential-stealing technique via Red Hat's npm channel.
- **2026-06-03 to 05**: Miasma's third wave. It shifts to planting AI agent config files in repositories and stealing credentials as soon as a project is opened (safedep).
- **2026-06-05**: GitHub disables 73 repositories across four Microsoft organizations (StepSecurity).

> Because the infection path and restoration status of individual repositories depend on how the investigation progresses, this Brief does not assert them. The characterization of the techniques rests on the reports of Adversa AI, safedep, StepSecurity, and Microsoft; this Brief does not cover the views of each agent vendor. What has not been disclosed does not mean there were no controls.

### After disclosure

- **GitHub and Microsoft**: GitHub detected malicious commits and disabled repositories; Microsoft explained that it had temporarily removed some and would restore them after review.
- **AI coding tools**: Folder-trust defaults, the automatic execution of bundled config, and the handling of MCP server auto-start have become points of discussion.

## 6. Sources

- **Adversa AI (research, primary)**: "The approval prompt is lying: a critical coding agent security flaw" (SymJack, 2026-05-26, symlink spoofing overwrites agent config) — <https://adversa.ai/blog/the-approval-prompt-is-lying-to-you-symlink-rce-in-five-ai-coding-agents-claude-code-cursor-antigravity-copilot-grok-build/>
- **Adversa AI (research, primary)**: "TrustFall: coding agent security flaw enables one-click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot" (2026-05, folder-trust approval auto-starts MCP) — <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Microsoft Security Blog (primary)**: "Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign" (2026-06-02, Miasma's technique and credential theft) — <https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/>
- **StepSecurity (vendor research)**: "Miasma Worm Hits Microsoft Again: Azure Functions Action and 72 Other Repositories Disabled" (2026-06, 73 repositories across four Microsoft organizations disabled) — <https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents>
- **safedep (vendor research)**: "Miasma Worm Targets AI Coding Agents via GitHub Repos" (third wave, auto-execution via config injection of `.claude/settings.json` etc.) — <https://safedep.io/miasma-worm-ai-coding-agent-config-injection/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
