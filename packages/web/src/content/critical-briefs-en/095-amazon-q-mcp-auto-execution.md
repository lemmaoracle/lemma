---
brief_no: 95
title: "Amazon Q Developer：リポジトリを開いただけで、同梱の MCP 設定が起動し、AWS 認証情報が持ち出されえた(Wiz Research の報告)"
title_en: "Amazon Q Developer: opening a repo could auto-start its bundled MCP config and expose AWS credentials (Wiz Research report)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-06-26
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "027-librechat-mcp-url-secrets", "059-vercel-contextai-oauth", "094-cursor-duneslide-sandbox-escape"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Wiz Research が Amazon Q Developer の VS Code 拡張の脆弱性（CVE-2026-12957）を報告し、言語サーバー 1.65.0 で修正された。リポジトリに同梱された MCP の設定が同意の確認なしに起動し、開発者の AWS の認証情報に届きえた"
og_lead_en: "Wiz Research reported a vulnerability in the Amazon Q Developer VS Code extension (CVE-2026-12957), fixed in language server 1.65.0, through which an MCP config bundled in a repository could start with no consent prompt and reach the developer's AWS credentials"
og_kicker_ja: "脆弱性の報告 · AI コーディング支援"
og_kicker_en: "VULNERABILITY · AI CODING TOOL"
og_headline_ja: "リポジトリを開くだけで\n同梱の MCP 設定が動くと\nWiz Research が報告。\n<accent>CVSS 8.5・1.65.0 で修正</accent>"
og_headline_en: "Opening a repo could run\nits bundled MCP config,\nWiz Research reports.\n<accent>CVSS 8.5, fixed in 1.65.0</accent>"
key_figures:
  - value: "8.5"
    label: "CVSS 4.0 score of CVE-2026-12957 in the GitHub Security Advisory. 7.8 (High) on NVD's CVSS 3.1"
    tone: "alert"
  - value: "2"
    label: "Behaviors Wiz Research named as the root cause: auto-starting without consent, and handing over the full set of environment variables"
  - value: "1.65.0"
    label: "The language server version with the fix. It shipped on 2026-05-12, ahead of publication (2026-06-26)"
glossary:
  - term: "Amazon Q Developer"
    desc: "AWS's AI coding-assistance tool. This case concerns its Visual Studio Code extension."
  - term: "MCP"
    desc: "Model Context Protocol. A standard by which AI-assistance tools start local processes called \"MCP servers\" to connect to databases, APIs, build tools and so on. Starting a server means running commands on the machine."
  - term: "Workspace trust"
    desc: "A VS Code feature that stops execution driven by a folder's settings when the folder is not trusted."
  - term: "Environment variables"
    desc: "Settings values passed to a process. For developers who work with the cloud, they often hold AWS access keys and session tokens, API keys and the like."
insight:
  slug: "workspace-open-as-consent"
  label: "Opening a folder becomes consent to launch"
  quote: "Unless, before a process is started from a config bundled in a repository, the config's origin and the scope of the launch are checked apart from the fact that a folder was opened, a single config file can run commands while holding the developer's credentials."
industries: ["developers", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Don't start a repo-bundled MCP config until its author and scope are confirmed"
attack_method: "supply-chain"
takeaway: "Wiz Research reported that the Amazon Q Developer extension started an MCP config bundled in a repository with no consent, on the strength of a folder being opened, and handed it the developer's full set of environment variables."
self_check: "Before an AI coding tool starts a process from a repository's config, can you check where that config came from and the scope of the credentials passed to it?"
countries: ["global"]
---

## 1. Summary

According to Wiz Research, when a developer opened a malicious repository in Visual Studio Code and enabled the Amazon Q Developer extension, the MCP server defined in the repository's bundled `.amazonq/mcp.json` started with no approval dialog and no workspace-trust check. Because the started process inherited the developer's full set of environment variables, it could reach their AWS credentials. AWS fixed it in language server 1.65.0, which now asks for consent before starting. There is no report of in-the-wild exploitation; this is a research disclosure. <strong>Unless, before a process is started from a config bundled in a repository, the config's origin and the scope of the launch are checked apart from the fact that a folder was opened, a single config file can run commands while holding the developer's credentials.</strong>

## 2. What got through

- **What got through**: Starting a local process from an MCP config bundled in a repository. According to Wiz Research, right after a folder was opened, the extension read `.amazonq/mcp.json` in the workspace and started the MCP servers defined there. There was no consent prompt and no check to stop execution in an untrusted folder.
- **What reached the receiving side**: According to Wiz Research, the started process inherited the developer's environment variables wholesale. For developers who work with the cloud, that often includes AWS credentials (access key, secret and session token), cloud-CLI tokens, API keys and the SSH-agent socket. In Wiz's demonstration, a planted command sent the AWS session's identity information to an external server, showing that the AWS session could be taken over with no action beyond opening the folder and enabling Amazon Q. Wiz says this can also lead to persistence in the cloud, reaching internal services, and lateral movement using a developer with production access as a foothold.
- **Not disclosed**: The number of affected users. Whether any repository actually used this route before the fix (there is no report of exploitation).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an AI coding tool starts a process from a repository's config, it checks the config's origin, the scope of the launch and the scope of the credentials passed, apart from the fact that a folder was opened.

- **Who approves**: The development teams that use the AI coding tool, and those who manage the development environment. They decide which MCP configs may be started and where they may come from, apart from what is in the repository. Launches from configs outside that scope are approved by a person.
- **Where it is checked**: Just before the extension starts an MCP server. It checks that the config comes from an approved source and that the launch and the environment passed are within the decided scope, and does not start what cannot be checked. Opening a folder is not treated as approval to launch.
- **What is recorded**: Which process was started from which config, with which environment (which credentials were passed), or which launch was stopped. Kept apart from the tool, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an MCP server starts, the config's origin and the scope of the launch and of the environment passed, and keeping a record. Detection means finding, reporting and fixing vulnerabilities. The dates are when the issue was reported, fixed and published, not when the route was used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before launch, check the config's origin and the scope of the environment passed</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A bundled config could start with no consent<br>and reach the developer's credentials</span></div>
<div class="rx-zone det"><b>Detection · Wiz Research reported, AWS fixed</b>Vulnerability report, fix shipped, publication</div>
<div class="rx-g g1"><div class="t">04-20</div><b>Wiz reports to Amazon</b></div>
<div class="rx-g g2"><div class="t">05-12</div><b>Language-server fix ships</b></div>
<div class="rx-g g3"><div class="t">06-23</div><b>CVE ID assigned</b></div>
<div class="rx-g g4"><div class="t">06-26</div><b>Wiz publishes, AWS bulletin</b></div>
</div>
</figure>

The researcher's report and the shipped fix worked, and the known route was closed before publication. What did not work was the layer before that, which checks a launch from a bundled config against the config's origin and the scope of the launch. It connects with [Brief 037, which looked across auto-execution of bundled configs](/critical/briefs/037-agent-config-auto-execution/), and [Brief 062 on the Claude Code GitHub Action, where an agent trusted an issue claiming to be a `[bot]` and acted with privilege](/critical/briefs/062-claude-code-github-action-bot-trust/), in that the origin of the input is not checked before it connects to execution; with [Brief 027 on LibreChat, where server secrets leaked from a user-specified MCP URL](/critical/briefs/027-librechat-mcp-url-secrets/), in that an MCP config turns directly into execution; and with [Brief 059, where broad OAuth permissions given to an AI tool became an intrusion path](/critical/briefs/059-vercel-contextai-oauth/), in that the developer's cloud privileges are inherited without a per-action check. [Brief 094 on Cursor (DuneSlide)](/critical/briefs/094-cursor-duneslide-sandbox-escape/), disclosed around the same time, enters through instructions in external content the agent read; this case enters through a config bundled in the repository.

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before the extension starts an MCP server.** It does not look for malicious configs; it checks, before execution, the origin of the config about to be started and the scope of the launch and the environment passed, against permissions managed apart from what is in the repository.

### Industries and operations to watch

- **Industry · Developers**: Development teams that use an AI coding tool such as Amazon Q Developer in environments holding cloud credentials, and that have occasion to open unfamiliar repositories (outside pull requests, dependencies, code handed over as a hiring exercise, and so on).
- **Industry · AI**: Organizations that build and ship AI tools that start processes such as MCP servers from repository or workspace settings.

### Current controls vs Lemma

This incident's route falls in columns 1 and 2. Column 3 is not a route in this incident.

| Control | Starting a process from a bundled config with no consent | Handing the started process the full set of credentials | Malicious behavior within a config the user consented to |
| --- | --- | --- | --- |
| Updating to the fixed version (language server 1.65.0, consent before launch) | Partial | Partial | Not effective |
| Workspace trust (stops execution in untrusted folders) | Partial | Not relevant | Not effective |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

The fixed version asks for consent before launch, so nothing starts without consent. But it is the user who reads the prompt and decides, and once they consent, no change to what is passed to the started process has been disclosed. Workspace trust stops execution in untrusted folders, but does not stop configs in trusted folders and does not look at the scope of the environment passed. Lemma checks the config's origin and the scope of the launch before execution against permissions managed apart from what is in the repository, and stops when it cannot be checked, so the launch in column 1 stops before it runs. The scope of credentials passed can also be part of the check, but narrowing the environment is up to the tool's implementation, so column 2 is "Partial." If malicious behavior happens within a permitted config, the check matches.

Note: Lemma's check works only when it is built into the extension's process for starting MCP servers, and the configs and sources that may be started, and the environment that may be passed, are managed apart from what is in the repository. If the scope is set broadly, malicious launches within it go through. The check neither finds malicious configs nor fixes flaws in the extension. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that use AI coding tools

- Is the Amazon Q Developer language server you use on a fixed version (1.65.0 or later)?
- Do you know whether the repositories you open contain MCP configs (such as `.amazonq/`)?
- Can you see, apart from the tool, a record of the processes the AI coding tool started and the credentials passed to them?

## 5. Facts and timeline

- **Subject**: the Amazon Q Developer extension (Visual Studio Code version), AWS's AI coding-assistance tool.
- **Identifiers**: CVE-2026-12957 (GitHub Security Advisory: GHSA-xhcr-j4j9-3gh7). Found and reported by Wiz Research (Maor Dokhanian).
- **Severity**: High. 8.5 on CVSS 4.0 (GHSA); 7.8 on NVD's CVSS 3.1.
- **Root cause (Wiz Research)**: two behaviors combined. First, right after a folder was opened, the extension read `.amazonq/mcp.json` in the workspace and started the MCP servers defined there with no consent prompt. Second, the started process inherited the developer's environment variables wholesale.
- **Impact (Wiz Research)**: not limited to local arbitrary code execution; it can lead to theft of cloud credentials, persistence in the cloud, reaching internal services over an inherited VPN or network, and lateral movement using a developer with production access as a foothold.
- **Plausible entry points**: a malicious pull request to a popular repository, a look-alike repository name, a poisoned dependency, or a fake job interview that has the target clone a "coding challenge."
- **Exploitation status**: no report of in-the-wild exploitation. The CISA ADP entry also notes "no confirmed exploitation."

### Timeline

- **2026-04-17**: Wiz found the vulnerability.
- **2026-04-20**: Wiz reported it to Amazon Security, and Amazon confirmed receipt.
- **2026-05-12**: the fix shipped through a language-server update.
- **2026-06-23**: CVE-2026-12957 was assigned (GHSA-xhcr-j4j9-3gh7).
- **2026-06-26**: Wiz Research published, and AWS issued Security Bulletin 2026-047-AWS.

> The facts in this Brief rest on Wiz Research's disclosure, AWS's security bulletin and the GitHub Security Advisory entry. The fix was available in 1.65.0 before disclosure. Per AWS, the language server usually updates automatically and in most cases no extra user action is needed (if network configuration prevents auto-update, update to the latest version). This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **AWS**: fixed it in language server 1.65.0 and issued Security Bulletin 2026-047-AWS. The fixed version asks for consent before starting a workspace's MCP servers. AWS thanked Wiz for its cooperation.
- **Wiz Research**: recommended that developers be wary of unknown repositories, review MCP consent prompts carefully, inspect unexpected `.amazonq/` directories in a repository, and audit MCP configs. It also drew three lessons: "workspace settings are attacker-controllable input," "convenience features tend to skip consent," and "full environment inheritance to child processes is an underrated risk." Wiz frames this not as specific to Amazon Q but as an "MCP auto-execution" pattern also seen in Claude Code (CVE-2025-59536 / CVE-2026-21852), Cursor (CVE-2025-54136) and Windsurf (CVE-2026-30615).

## 6. Sources

- **Wiz (research, primary)**: “MCP Auto-Execution: From Git Clone to Cloud Compromise in Amazon Q VS Code Extension” (2026-06-26) — <https://www.wiz.io/blog/amazon-q-vulnerability>
- **Amazon Web Services (vendor bulletin)**: Security Bulletin 2026-047-AWS — <https://aws.amazon.com/security/security-bulletins/2026-047-aws/>
- **GitHub Security Advisory**: GHSA-xhcr-j4j9-3gh7 (CVE-2026-12957) — <https://github.com/aws/language-servers/security/advisories/GHSA-xhcr-j4j9-3gh7>
- **The Hacker News**: “Amazon Q Developer Flaw Could Let Malicious Repos Run Code via MCP Configs” — <https://thehackernews.com/2026/06/amazon-q-developer-flaw-could-let.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
