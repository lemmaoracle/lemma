---
brief_no: 37
title: "AI コーディングエージェントが、リポジトリ同梱の設定ファイルを無検証で自動実行した — 承認プロンプトや署名検査では届かない、エージェントの権限・来歴の落差"
title_en: "When the Assistant Becomes the Trigger — AI Coding Agents Auto-Execute Project-Local Config (SymJack / TrustFall + Miasma)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-05
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "027-librechat-mcp-url-secrets", "006-google-api-key-revocation-lag", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "AI コーディングエージェントが同梱設定を無検証で自動実行 — SymJack / Miasma"
og_lead_en: "AI coding agents auto-execute project-local config — SymJack / Miasma"
gap_detected: "The malicious commits could be detected, and GitHub was able to disable 73 repositories across 4 Microsoft-affiliated organizations at once."
gap_missing: "Before the agent executed the bundled config, there was no layer to confirm whether the config came from a legitimate author and stayed within an authorized scope, so an opened or trusted action became the basis for execution itself."
gap_fix: "Before the agent executes a bundled config, independently verify with Lemma that the operation is authorized for this subject at this scope and carries legitimate provenance, and prevent it up front."
---

## 1. TL;DR

SymJack and TrustFall — flaws letting AI coding agents (Claude Code, Cursor, Gemini CLI) auto-execute repository-bundled config without checking its contents or origin — were weaponized by the self-propagating malware Miasma. GitHub disabled 73 Microsoft-org repositories, but only after the config had executed and credentials were stolen. What was missing was a layer to confirm, before execution, whether the config came from a legitimate author within an authorized scope; instead an "opened / trusted" action became the basis for execution.

---

## 2. What happened

- **The shared failure**: An AI coding agent treats "the user opened the project / trusted the folder" as sufficient authorization and automatically executes bundled configuration (the agent's settings, MCP server definitions, startup hooks).
- **SymJack (research, Adversa AI, 2026-05-26)**: Through symbolic-link spoofing, an operation that looks to the user like a harmless file copy actually overwrites the agent's own configuration file, causing attacker code to run at the next launch. Confirmed on Claude Code, Gemini CLI (Antigravity), Cursor Agent CLI, GitHub Copilot CLI, Grok Build, and OpenAI Codex CLI.
- **TrustFall (research, Adversa AI, disclosed 2026-05)**: The moment the folder-trust prompt (defaulting to "trust") is approved, a project-defined MCP server auto-starts without explicit approval, reaching one-click remote code execution.
- **Miasma third wave (real-world, 2026-06-03 to 05)**: The self-propagating malware Miasma planted `.claude/settings.json`, `.gemini/settings.json`, and Cursor configuration files in repositories and executed a credential-stealing payload the moment a developer opened the project in an AI coding tool. It fetches the Bun runtime to launch a second-stage payload, harvests credentials for GitHub, npm, AWS, Azure, GCP, Vault, Kubernetes, and more, and self-propagates.
- **Real-world scale**: On 2026-06-05, GitHub disabled 73 repositories across four Microsoft organizations (Azure, Azure-Samples, Microsoft, MicrosoftDocs). Miasma is a variant of Mini Shai-Hulud, open-sourced by TeamPCP.

This event originates in a structure where the agent does not independently verify bundled config before acting. The path by which the failure propagates into credential theft and lateral movement is as follows.

1. **Planting the bundled config**: An attacker plants agent configuration (`.claude/settings.json`, etc.), MCP server definitions, and startup hooks in a repository — or, via symlink spoofing, makes the display diverge from the substance (the write target).
2. **Treating "open / trust" as authorization**: A developer opens the project in an AI coding tool, or approves a folder-trust prompt. The agent treats this as sufficient authorization and automatically loads and executes the bundled config. The approval prompt does not accurately convey "what will be executed."
3. **Execution and theft**: Executing the config launches the credential-stealing payload. After fetching the Bun runtime and starting a second-stage payload, the credentials accessible to the development environment (GitHub, npm, cloud, Vault, Kubernetes, etc.) are harvested.
4. **Self-propagation**: Using the stolen credentials, the same kind of config is planted in other repositories and packages reachable from that environment, propagating through trusted publish and commit paths. One infected machine spreads to the whole organization.
5. **Detection and disabling**: When malicious commits are detected, the platform disables repositories en masse. But this is an after-the-fact measure that acts only after the config has executed and credentials have been stolen.

---

## 3. Timeline — disclosure and response

- Early 2026-05: Adversa AI discloses TrustFall (approving folder trust auto-starts the MCP server for one-click RCE).
- 2026-05-26: Adversa AI publishes SymJack (symlink spoofing overwrites agent config to run at launch). Reproduced on major agentic CLIs.
- 2026-06-01 to 03: Miasma spreads via npm preinstall hooks (first wave) and binding.gyp execution (second wave, Phantom Gyp).
- 2026-06-03 to 05: Miasma's third wave. It shifts to planting AI agent configuration files in repositories and executing credential theft the moment a project is opened.
- 2026-06-05: GitHub disables 73 repositories across four Microsoft organizations. Microsoft temporarily removed some repositories and explained it would restore them in sequence after review.
- 2026-06: Miasma infection via Red Hat's official npm channel is also confirmed, widening the wave.

> Note: Because the infection path and restoration status of individual repositories depend on the progress of investigation, this Brief does not assert them.

The response and industry movement after disclosure:

- **Vendors and platforms**: GitHub detected malicious commits and disabled repositories en masse; Microsoft temporarily removed some and explained it would restore them after review. Among AI coding tool vendors, the defaults for folder trust, the auto-execution of bundled config, and the handling of MCP server auto-start have become points of contention.
- **Research and standards**: The industry-wide premise that "presenting an approval prompt = informed consent" has been challenged from the research side (Adversa AI). Aligning the display of an operation the agent executes with its substance, and minimizing the authorization scope of project-local config, are raised as issues.
- **Shift in the center of gravity of regulation**: The center of gravity of regulation is shifting from data disclosure to compliance proof. For autonomously operating agents, the demand is intensifying to show that an operation was legitimately authorized in a form that is independently verifiable before the action — not in after-the-fact logs.

The absence of a layer that independently verifies the authorization and provenance of an agent's bundled config at the moment of execution is not a problem of a specific tool, but an operational challenge that remains across every organization adopting AI coding agents.

---

## 4. Why it wasn't stopped

The central failure primitive is that **when an agent executes bundled configuration or actions, it does not independently verify the authorization scope and provenance of that config before acting**. "The user opened the project / trusted the folder" is no guarantee that the bundled config is safe or originates from the legitimate author. Neither the approval prompt (TrustFall) nor the displayed file operation (SymJack) accurately conveys what will actually be executed. Informed consent requires an accurate picture of what the operation does, yet the agent's trust boundary lacks it.

[Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) (a user-specified MCP URL carrying out the server's secrets), [Brief 003](/critical/briefs/003-starlette-badhost/) (MCP server auth bypass via Host-header manipulation), and [Brief 014](/critical/briefs/014-tanstack-oidc-trusted-publisher/) (a valid signature whose artifact is still malicious) differ in target, but share the same primitive: **the execution of some operation or config is decoupled from the layer that authorizes and verifies it**. What this incident shows is the direct line from a design gap to real harm — latent flaws disclosed in research (SymJack / TrustFall) weaponized at Microsoft scale by real-world malware (Miasma's third wave). It has also been suggested that the credentials used in the May infection were not fully rotated, contributing to Miasma's resurgence — connecting to the absence of independent verification of credential revocation attributes ([Brief 006](/critical/briefs/006-google-api-key-revocation-lag/)).

In this event, the detection sequence functioned — research disclosure (Adversa AI), platform abuse response (GitHub disabling 73 repositories), and vendor research — and the techniques and infections were made externally visible. This is a textbook detection success, and this Brief does not deny the role of the detection layer. Detection is indispensable for publicizing techniques, identifying the scope of infection, and disabling and remediating.

At the same time, detection is no material for independently establishing — **at the moment the agent loads and executes the bundled config** — whether that config is legitimately authorized and originates from the legitimate author. Signature checks can only see "the repository is valid," and the approval prompt can only see "the user opened / trusted." Neither can distinguish, before execution, whether the config will steal credentials. Platform disabling, too, is an after-the-fact sequence that acts only after the config has executed. This is a structurally independent gap that lies outside the reach of the detection layer.

As it stands, across the entire operating model of AI coding agents, independent verification of the authorization and provenance of bundled config depends on trust in the act of "the user opened / trusted," and is not yet treated as an independent layer. Pre-execution attestation closes this gap by interposing one step of authority proof into the path by which an agent executes config and actions. Pre-execution attestation is not a replacement for detection but a **complement**; the combination of both layers establishes the trust boundary of agent operations.

---

## 5. What proof would have changed

For the gap this event exposed — an agent executing bundled config decoupled from independent verification of its authorization and provenance — Lemma presents a design that requires, before an agent executes an operation, an independently verifiable cryptographic proof that the operation is authorized and carries legitimate provenance.

- **Proof-as-auth before the action**: Before the agent executes bundled config, starts an MCP server, or performs a destructive operation, it proves with a signature that "this operation is authorized, for this principal, in this scope." It does not make "the user opened / trusted" the endpoint of authorization.
- **Binding config to provenance**: The config and artifact to be executed are tied to their issuer (the legitimate author / distributor), and provenance is verified by docHash. The divergence between display and substance (such as a symlink's write target) is made detectable before execution.
- **Scoped authority**: The authority granted to the agent is minimized per operation, and execution beyond the authorized scope cannot succeed without proof. Legitimate agent operations are distinguished, by trail, from operations driven by attacker-planted config.
- **Selective disclosure**: Only "this operation satisfies the authorization schema" is disclosed minimally; internal keys and credentials never leave the environment.

In this way, a proof fixed at the moment of execution functions as an independently verifiable trail of "is this operation legitimately authorized, and does it carry legitimate provenance," before the agent executes the bundled config. Detection (after-the-fact disabling and vendor research) works on post-discovery remediation; pre-execution proof (pre-execution verification of authority and provenance) works on independent verification of agent operations — the two complement each other.

---

## 6. Sources

- **Adversa AI (research, primary)**: "The approval prompt is lying: a critical coding agent security flaw" (SymJack, 2026-05-26, symlink spoofing overwrites agent config) — <https://adversa.ai/blog/the-approval-prompt-is-lying-to-you-symlink-rce-in-five-ai-coding-agents-claude-code-cursor-antigravity-copilot-grok-build/>
- **Adversa AI (research, primary)**: "TrustFall: coding agent security flaw enables one-click RCE in Claude, Cursor, Gemini CLI and GitHub Copilot" (2026-05, folder-trust approval auto-starts MCP) — <https://adversa.ai/blog/trustfall-coding-agent-security-flaw-rce-claude-cursor-gemini-cli-copilot/>
- **Microsoft Security Blog (primary)**: "Preinstall to persistence: Inside the Red Hat npm Miasma credential-stealing campaign" (2026-06-02, Miasma's technique and credential theft) — <https://www.microsoft.com/en-us/security/blog/2026/06/02/preinstall-persistence-inside-red-hat-npm-miasma-credential-stealing-campaign/>
- **StepSecurity (vendor research)**: "Miasma Worm Hits Microsoft Again: Azure Functions Action and 72 Other Repositories Disabled" (2026-06, 73 repositories across four Microsoft organizations disabled) — <https://www.stepsecurity.io/blog/miasma-worm-hits-microsoft-again-azure-functions-action-and-72-other-repositories-disabled-after-supply-chain-attack-targeting-ai-coding-agents>
- **safedep (vendor research)**: "Miasma Worm Targets AI Coding Agents via GitHub Repos" (third wave, auto-execution via config injection of `.claude/settings.json` etc.) — <https://safedep.io/miasma-worm-ai-coding-agent-config-injection/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/), [Trust402](https://lemma.frame00.com/trust402/)
