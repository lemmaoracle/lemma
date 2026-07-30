---
brief_no: 95
title: "Amazon Q Developer：リポジトリを開いただけで、同梱の MCP 設定が無検証で実行され、AWS 認証情報が持ち出された（CVE-2026-12957）"
title_en: "Amazon Q Developer: opening a repo auto-executed a bundled MCP config and exfiltrated AWS credentials (CVE-2026-12957)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-06-26
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "062-claude-code-github-action-bot-trust", "027-librechat-mcp-url-secrets", "059-vercel-contextai-oauth", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "Amazon Q — 同梱 .amazonq/mcp.json が無検証実行され AWS 認証情報が流出"
og_lead_en: "Amazon Q — a bundled .amazonq/mcp.json auto-ran and leaked AWS credentials"
gap_detected: "The detection chain worked — researcher disclosure, CVE assignment and CVSS scoring, the vendor fix (language server 1.65.0) and the AWS bulletin / GitHub Advisory entries — making the technique and its impact externally visible."
gap_missing: "There is no layer that independently verifies, at the moment the extension loads and starts a bundled config (an MCP server definition), whether it originates from a legitimate author and is within an authorized scope."
gap_fix: "Before starting an MCP server, verify the config's provenance and the launch's authorization scope — decoupled from the act of opening a folder — pass the minimum environment to the process, and stop the launch when no proof accompanies it, verified independently by Lemma to prevent it up front."
---

## 1. TL;DR

Just by opening a malicious repository in Visual Studio Code and enabling the AI coding assistant Amazon Q Developer extension, a developer could have an MCP server defined in the repository's bundled `.amazonq/mcp.json` auto-start with no confirmation — and, as an extension of that, have their AWS credentials exfiltrated. Wiz Research disclosed the flaw (CVE-2026-12957, 8.5 on CVSS 4.0 / 7.8 on CVSS 3.1). An MCP server is a local process that runs commands, and Amazon Q was starting it from a workspace file with no consent, no approval dialog, and no workspace-trust check. Because the started process inherited the developer's full environment (AWS access keys and session tokens, various API keys, the SSH-agent socket, and more), the path from `git clone` to cloud compromise completed with no clicks. The fix is in language server 1.65.0 (AWS recommends updating to the latest version). What was missing was a layer that verifies, before execution and separately from "opening the folder," whether the bundled config originates from a legitimate author and is within an authorized scope.

---

## 2. What happened

- **Subject**: the Amazon Q Developer extension (Visual Studio Code version), AWS's AI coding-assistance tool.
- **Identifier**: CVE-2026-12957 (GitHub Security Advisory: GHSA-xhcr-j4j9-3gh7). Found and reported by Wiz Research (Maor Dokhanian).
- **Severity**: High. 8.5 on CVSS 4.0 (GHSA); 7.8 on NVD's CVSS 3.1.
- **The premise**: MCP (Model Context Protocol) is a standard by which AI-assistance tools start local processes they call "MCP servers" to connect to databases, APIs, build tools, and so on. Because starting a server means running commands on the machine, the design premise is the user's explicit consent.
- **Root cause (a combination of two behaviors)**:
  - **Auto-execution without consent**: immediately after a folder was opened, the extension read `.amazonq/mcp.json` at the workspace root and started the MCP servers defined there — with no approval dialog and no workspace-trust check to stop execution in an untrusted folder.
  - **Full inheritance of environment variables**: the started process inherited the developer's environment variables wholesale. For a developer working with the cloud, that typically includes AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`), cloud-CLI tokens, API keys, and the SSH-agent socket.
- **Core of the exploit**: when these two combine, a single config file placed in a repository can run arbitrary commands with the developer's live cloud session attached. In Wiz's proof of concept, a command planted in `.amazonq/mcp.json` sent the result of `aws sts get-caller-identity` to an attacker server, demonstrating takeover of the AWS session with no action beyond opening the folder and enabling Amazon Q.
- **Chain of impact**: it does not stop at local arbitrary code execution — it can escalate to theft of cloud credentials, cloud persistence via a backdoor IAM user / access key, reaching internal services over an inherited VPN or network, and lateral movement using a developer with production access as a pivot.
- **Plausible delivery**: a malicious pull request to a popular repository, typosquatting, a poisoned dependency, or a fake job interview that has the target clone and run a "coding challenge" (a known DPRK-style tactic).
- **Exploitation status**: no report of in-the-wild exploitation; the CISA ADP entry also notes "no confirmed exploitation."

The incident came together as the following chain.

1. **Placing the bundled config**: the attacker plants `.amazonq/mcp.json` at the root of a seemingly legitimate repository. Its contents take the form of an MCP server definition and include a command that runs on startup.
2. **Clone and open**: the victim clones the repository (via a malicious PR, typosquatting, etc.) and opens it in VS Code.
3. **Treating "opened" as authorization**: when the victim enables Amazon Q, the extension reads `.amazonq/mcp.json` and auto-starts the defined MCP server with no consent prompt.
4. **Execution with environment inheritance**: the started process runs the planted command while inheriting the developer's full environment (AWS credentials, CLI tokens, API keys, the SSH-agent socket).
5. **Exfiltrating credentials**: in the proof of concept, the result of `aws sts get-caller-identity` is sent out. The path from `git clone` to cloud-session takeover completes with no action beyond opening the folder.

---

## 3. Timeline — disclosure and response

- 2026-04-17: Wiz finds the vulnerability.
- 2026-04-20: reports to Amazon Security; Amazon confirms receipt.
- 2026-05-12: ships the fix via a language-server update.
- 2026-06-23: CVE-2026-12957 is assigned (GHSA-xhcr-j4j9-3gh7).
- 2026-06-26: Wiz Research publishes; AWS issues Security Bulletin 2026-047-AWS.

> Note: technical facts are based on Wiz Research's disclosure, AWS's security bulletin, and the GitHub Security Advisory. The fix shipped in 1.65.0 ahead of disclosure. Per AWS, the language server usually auto-updates and in most cases no extra user action is needed (if network configuration prevents auto-update, update to the latest version). Refer to the latest primary sources.

The response and industry movement after disclosure:

- **Vendor (AWS)**: fixed it in language server 1.65.0 and issued Security Bulletin 2026-047-AWS. The fixed version was changed to show a consent prompt before starting a workspace's MCP servers. The language server usually auto-updates and in most cases needs no extra user action (if auto-update is prevented, update to the latest version). AWS thanked Wiz for its cooperation.
- **Research (Wiz Research)**: recommends developers "be wary of unknown repositories," "carefully review MCP consent prompts," "inspect unexpected `.amazonq/` in a repository," and "audit MCP configs." It also raised three cross-cutting lessons: "workspace settings are attacker-controllable input," "convenience features tend to skip consent," and "full environment inheritance to child processes is an underrated risk."
- **Cross-industry**: Wiz framed this not as Amazon Q-specific but as a systemic "MCP auto-execution" risk also seen in Claude Code, Cursor, and Windsurf. Integrating VS Code's workspace-trust feature into the execution of workspace settings, and minimizing the environment passed to child processes, were shared as challenges common to AI coding tools.

The absence of a layer that independently verifies, at execution time, the authorization and provenance of a bundled config remains not a single-tool problem but a cross-organization operational challenge for anyone adopting AI coding tools that run under the developer's cloud session.

---

## 4. Why it wasn't stopped

The central failure primitive is that **when the AI-assistance tool executes a config bundled in the repository (an MCP server definition), it does not independently verify that config's authorization scope and provenance before acting, and treats "the user opened the folder" as sufficient authorization.** Opening a folder is no guarantee that a bundled config originates from a legitimate author or is safe. Any file that can exist in a repository should be treated as untrusted input, yet the extension connected `.amazonq/mcp.json` to execution with neither consent nor provenance verification.

This case is a named, real-product instance of [Brief 037](/critical/briefs/037-agent-config-auto-execution/) (an AI coding agent auto-executes a bundled config without verification). The structure 037 drew across SymJack / TrustFall (research) and Miasma (in the field) — "treating opened / trusted as authorization and executing the bundled config" — crystallized as a CVE in a single product, Amazon Q. [Brief 062](/critical/briefs/062-claude-code-github-action-bot-trust/) (the Claude Code GitHub Action, where the agent trusted a single issue claiming to be a `[bot]` and executed with privilege) aligns in that the agent proceeds to privileged execution without verifying the input's issuer. [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) (LibreChat, secrets leaked from a user-specified MCP URL) is continuous in that "config equals execution" holds through the same MCP mechanism. [Brief 059](/critical/briefs/059-vercel-contextai-oauth/) (an "allow all" OAuth handed to an AI tool became an intrusion path directly through a vendor breach) connects in that the cloud privileges a developer or agent holds are inherited and abused without per-action verification. The shared primitive is the same: **the execution of a config is decoupled from the layer that authorizes and verifies it.**

And this case pairs with the simultaneously disclosed [Brief 094](/critical/briefs/094-cursor-duneslide-sandbox-escape/) (Cursor / DuneSlide). If 094 is the entry point of "treating an instruction inside external content the agent read as authorization," 095 is the entry point of "treating a config file bundled in the repository as authorization" — both structures in which an AI coding tool connects "input whose origin it cannot choose" to execution. Wiz, too, frames this not as Amazon Q-specific but as a cross-industry "MCP auto-execution" pattern seen in Claude Code (CVE-2025-59536 / CVE-2026-21852), Cursor (CVE-2025-54136), and Windsurf (CVE-2026-30615). That full environment inheritance (an implementation choosing the path of least resistance rather than least privilege) acted as an amplifier lifting local execution to cloud compromise is also a cross-cutting point, given that AI coding tools run under the developer's cloud session.

Here the detection chain worked and made the technique and its impact externally visible: the researcher disclosure (Wiz Research), CVE assignment and CVSS severity, the vendor fix (language server 1.65.0) with the AWS security bulletin, and the GitHub Security Advisory entry. This is a textbook detection success, and this Brief does not diminish the role of the detection layer. Detection is indispensable for publicizing the technique, identifying affected versions, and deciding on updates.

But detection is not the material that independently proves, **at the moment the extension loads and starts a bundled config**, whether "the config the extension is about to start is legitimately authorized and originates from a legitimate author." `.amazonq/mcp.json` has the same form as a legitimate config file, and the detection side has no formal way to judge it "malicious" before execution. The absence of a workspace-trust check makes opening the folder the terminus of authorization, never looking at the config's provenance or the executing principal's privileges. Even if anomaly detection fires after execution, it is too late once a process that ran while inheriting the environment variables has sent out the credentials. As material to prove in an audit that "this MCP server launch was by a legitimately authorized principal and config," the mere fact that "the user opened the folder" is not an independent record of the config's authorization or provenance. This is a structurally independent gap, out of the detection layer's reach.

---

## 5. What proof would have changed

Pre-execution attestation fills that gap by inserting one step of authorization / provenance proof into the path where the extension executes a bundled config. Before starting an MCP server, verify — decoupled from the act of opening the folder — "does this config originate from an authorized author / distributor, and is this launch authorized at this scope," and block the launch beforehand when no proof accompanies it. In addition, narrowing the environment passed to the started process to an authorized minimum avoids the full inheritance of credentials even if it does run. Pre-execution proof is not a substitute for detection but its **complement**, and the two together establish the AI coding tool's trust boundary.

Against the gap this case exposed — the AI-assistance tool executing a bundled config while decoupled from independent verification of its authorization and provenance, and inheriting the full environment — Lemma proposes a design that, before the tool executes a config, requires that the execution be authorized and carry legitimate provenance, as an independently verifiable cryptographic proof.

- **Proof-as-auth before the action**: before starting an MCP server or executing a bundled config, prove with a signature that "this launch is authorized for this config, this principal, at this scope." Do not make "opening the folder" the terminus of authorization.
- **Binding the config's provenance**: bind the config to be executed to its issuer (a legitimate author / distributor), verify its provenance, and distinguish an unauthorized config such as a `.amazonq/mcp.json` slipped into a repository from the authorization path.
- **Scoped privilege and a minimal environment**: minimize the environment and privileges passed to the started process per operation, narrowing full inheritance of AWS credentials or the SSH-agent socket to a proven necessary scope. Execution beyond the authorized scope does not proceed without proof.
- **Selective disclosure**: disclose only that "this launch satisfies the authorization schema," keeping internal keys and credentials out of the environment.

This lets a proof fixed at execution time function as an independently verifiable trail for "is this config legitimately authorized and does it carry legitimate provenance," before the tool executes the bundled config. Detection (after-the-fact disclosure, patching, vendor research) works for remediation once discovered, and pre-execution proof (authorization / provenance verification before execution) works for independent verification of tool operations — each complementary.

---

## 6. Sources

- **Wiz (research, primary)**: “MCP Auto-Execution: From Git Clone to Cloud Compromise in Amazon Q VS Code Extension” (2026-06-26) — <https://www.wiz.io/blog/amazon-q-vulnerability>
- **Amazon Web Services (vendor bulletin)**: Security Bulletin 2026-047-AWS — <https://aws.amazon.com/security/security-bulletins/2026-047-aws/>
- **GitHub Security Advisory**: GHSA-xhcr-j4j9-3gh7 (CVE-2026-12957) — <https://github.com/aws/language-servers/security/advisories/GHSA-xhcr-j4j9-3gh7>
- **The Hacker News**: “Amazon Q Developer Flaw Could Let Malicious Repos Run Code via MCP Configs” — <https://thehackernews.com/2026/06/amazon-q-developer-flaw-could-let.html>

References: [“The last layer left in AI-era cyber defense”](https://lemma.frame00.com/blog/detection-is-not-proof/), [“Proof-as-Auth: sign in without ever sending your key”](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/), [Trust402](https://lemma.frame00.com/trust402/)
