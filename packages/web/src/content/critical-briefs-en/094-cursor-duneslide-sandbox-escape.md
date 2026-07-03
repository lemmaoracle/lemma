---
brief_no: 94
title: "Cursor（DuneSlide）：Web や連携先に仕込まれた一つの指示が、AI エージェントのサンドボックスを外して任意コードを実行させた（CVE-2026-50548 / 50549）"
title_en: "Cursor (DuneSlide): a single injected prompt escaped the agent's sandbox and ran arbitrary commands (CVE-2026-50548 / 50549)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-07-01
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "039-semantic-kernel-prompt-injection-rce", "027-librechat-mcp-url-secrets", "048-trapdoor-ai-instruction-provenance", "058-langgraph-checkpoint-rce"]
status: published
version: "1.0"
og_lead_ja: "Cursor の DuneSlide — 一つの注入指示でサンドボックスが外れ RCE"
og_lead_en: "Cursor's DuneSlide — one injected prompt escapes the sandbox to RCE"
gap_detected: "The detection chain worked — researcher disclosure, CVE assignment and CVSS scoring, the vendor fix (Cursor 3.0) and advisory / NVD entries — making the technique and its blast radius externally visible."
gap_missing: "There is no layer that independently verifies, at the moment the agent acts, where a read-in instruction came from and whether the write it induces is within an authorized scope."
gap_fix: "Before an agent runs a terminal command or a write, verify the instruction's provenance and the write target's authorization scope — decoupled from the working_directory value or the symlink resolution result — and stop execution when no proof accompanies it, verified independently by Lemma to prevent it up front."
---

## TL;DR

A developer merely asking the AI code editor Cursor a normal question could pull in a hidden instruction slipped into web-search results or a connected service (an MCP server); the agent then acts on it — and, as an extension of that, the sandbox meant to fence in command execution is disabled, running arbitrary code on the developer's machine. The two flaws Cato AI Labs named "DuneSlide" (CVE-2026-50548 / CVE-2026-50549, both 9.8 on CVSS 3.1) reach the same move — "get one file written that shouldn't be writable, then use that write to disable the sandbox itself" — through two different holes. It is zero-click, needing no click or approval dialog; once the sandbox is off, the next command runs as the developer, reaching the machine and the cloud / SaaS the editor is signed into. The fix shipped in Cursor 3.0 (released 2026-04-02); there is no report of in-the-wild exploitation — this is a research disclosure. What was missing was a layer that verifies, before execution, where a read-in instruction came from and whether the write target is within an authorized scope. Detection and pre-execution proof are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: Cursor (an AI code editor). Its agent takes a user's request and runs terminal commands and file operations; the vendor says a majority of the Fortune 500 use it.
- **Identifiers / codename**: CVE-2026-50548 and CVE-2026-50549, named "DuneSlide" by Cato AI Labs.
- **Severity**: both 9.8 (Critical) on NVD's CVSS 3.1.
- **The premise**: since the 2.x line, Cursor runs the terminal commands an agent issues inside a sandbox (a mechanism that fences execution and limits what it can touch) by default. DuneSlide is a flaw that escapes that sandbox.
- **Entry point = prompt injection**: the attacker does not type into Cursor. They hide an instruction in what the agent reads on the user's behalf — a service connected via MCP, or a page returned by a web search. When the user asks a normal question, the hidden instruction is pulled in with it. Because no click or approval is needed, it is "zero-click."
- **The shared move**: both flaws follow the structure of "get one file written that shouldn't be writable, then use that write to disable the sandbox." The targets are the sandbox helper file itself (on macOS, `/Applications/Cursor.app/Contents/Resources/app/resources/helpers/cursorsandbox`) or a startup file such as `~/.zshrc`.
  - **CVE-2026-50548 (abusing configuration)**: the sandbox allows writes to a command's working folder. That folder can be set via the optional `working_directory` parameter of the `run_terminal_cmd` tool, and when the agent sets a non-default path, Cursor adds it to the write allowlist without validation. The injected instruction points this at a system file rather than the project.
  - **CVE-2026-50549 (abusing the safety check)**: before writing, Cursor resolves symlinks and checks that the actual write target is inside the project. The flaw is in the fallback. If the target does not exist, or the attacker removes read permission from a folder along the path, the check fails, and Cursor gives up and trusts the "in-project" path the link points to. The attacker crafts a link pointing outside the project, fails the check, and writes to the same sandbox helper file.
- **Impact**: once the sandbox is disabled, the next command runs as the developer. Beyond taking over the machine, it reaches the cloud and SaaS workspaces the editor is signed into. It all starts from "one instruction that looks harmless."
- **Exploitation status**: no report of in-the-wild exploitation; Cato presents it as research, not an active campaign. Public vulnerability records also note "no confirmed exploitation."

---

## 2. Timeline

- 2026-02-19: Cato AI Labs reports both flaws.
- ~2026-02-23: per Cato, Cursor initially declined the report on the grounds that "the threat model does not cover abuse of MCP servers (including standard ones such as the official Linear workspace)."
- 2026-02-26: Cato re-escalates; Cursor reopens and triages.
- 2026-04-02: Cursor 3.0, containing the fix, is released (all versions below 3.0 are affected).
- 2026-06-05: CVE identifiers are assigned.
- 2026-07-01: Cato AI Labs publishes as "DuneSlide." Cursor publishes its own advisory for the symlink flaw (GHSA-3v8f-48vw-3mjx), and the NVD record goes public.

> Note: technical facts are based on Cato AI Labs' disclosure, Cursor's GitHub Security Advisory, and the NVD entry. The fix shipped in 3.0 ahead of disclosure, and no in-the-wild exploitation has been confirmed. Refer to the latest primary sources.

---

## 3. Attack path: how one instruction disables the sandbox

This case stems from a structure in which the agent does not independently verify, before acting, "where the instruction it read came from" and "whether the write is authorized." The zero-click path to RCE runs as follows.

1. **Planting the instruction**: the attacker hides an invisible instruction in content the agent reads on the user's behalf — data from an MCP-connected service, or a page returned by a web search.
2. **Riding a normal request**: the developer asks Cursor a normal question. The hidden instruction is pulled in with it, and the agent treats it as an instruction to itself. No click or approval has occurred so far.
3. **Getting one un-writable file written**: the injected instruction has the agent set `working_directory` to a non-default system path (50548), or fail the check via a symlink pointing outside the project (50549). Either way, Cursor permits the write.
4. **Disabling the sandbox**: the write target is the sandbox helper file itself or a startup file such as `~/.zshrc`. The moment it is overwritten, subsequent commands run outside the sandbox.
5. **Running as the developer**: the next command after disabling runs with the developer's own privileges. It can escalate to taking over the machine and reaching the cloud / SaaS the editor is signed into.

---

## 4. Structural analysis

This case sits in Pillar 03 (Agent Authority Proof), category `agent-infrastructure`. The central failure primitive is that **the agent does not independently verify, before acting, where an externally read-in instruction came from and the authorization scope of the write it performs on that instruction.** Prompt injection succeeds because the agent never checks whether "the string I am reading now is an authorized instruction originating from a legitimate requester." And the sandbox escape succeeds because the basis for permitting a write rests on surface signals the attacker can steer — "what did the agent specify in `working_directory`," "did symlink resolution succeed" — rather than an independent verification of "is this write authorized for this target." Two missing verifications — the instruction's provenance and the write's authorization — combine so that one instruction becomes RCE. Secondary tagging notes `ai-decision-integrity` for the agent acting on an injected instruction without verifying it, and `identity-auth` for the authorization of the executing principal and the write target.

This case is a sequel in the same line as Brief 037 (an AI coding agent auto-executes a bundled config without verification). Where 037 was the structure of "treating a config placed in a repository as authorized because it was opened or trusted," DuneSlide treats an instruction inside external content the agent read as authorization, and skips the write target's authorization as an extension of that — the entry point widening from config files to read-in content. Brief 039 (Semantic Kernel, where prompt injection turned into host RCE) and Brief 048 (invisible commands planted in AI instruction files) align in that the provenance of the input the AI reads is not verified before it connects to execution. Brief 027 (LibreChat, secrets leaked from a user-specified MCP URL) and Brief 058 (an AI agent's own checkpoint went unverified and its loading server was hijacked) are continuous in that, in agent infrastructure, "missing input verification equals execution." The shared primitive is the same: **the execution of an instruction or a write is decoupled from the layer that authorizes and verifies it.**

Cato notes it is disclosing similar flaws in other coding agents and that the problem is structural, not a pile of one-offs. Indeed Cursor itself has seen CurXecute (CVE-2025-54135, 2025-08), MCPoison (CVE-2025-54136), and CVE-2026-26268 (2026-02) — flaws that start from poisoned input and end in code execution, each breaking a different guardrail one at a time. The 2.x sandbox was the answer to the prior wave, and DuneSlide is the flaw that removes that answer. The structural implication is not to add one more guardrail, but to require a layer that independently verifies the authorization of instructions and writes before the agent acts.

---

## 5. The detection-versus-proof gap

Here the detection chain worked and made the technique and its scope externally visible: the researcher disclosure (Cato AI Labs), CVE assignment and CVSS severity, and the vendor fix (Cursor 3.0) with its own advisory and NVD entry. This is a textbook detection success, and this Brief does not diminish the role of the detection layer. Detection is indispensable for publicizing the technique, identifying affected versions, and deciding on patching.

But detection is not the material that independently proves, **at the moment the agent follows that instruction and performs that write**, "is the instruction the agent just read an authorized one originating from a legitimate requester" or "is the write it is about to perform authorized for this target." Prompt injection is neither a malware signature nor a known attack pattern; it is a natural-language instruction blended into legitimate content, and the detection side has no formal way to judge it "malicious" before execution. The sandbox's write permission, too, flips on surface signals — the `working_directory` value or whether symlink resolution succeeded — and never looks at authorization for the target itself. Even if anomaly detection fires after execution, the developer-privilege command that runs after the sandbox is off does not stop. This is a structurally independent gap, out of the detection layer's reach.

Pre-execution attestation fills that gap by inserting one step of authorization / provenance proof into both the path where the agent acts on a read-in instruction and the path that permits a write. For instructions, "does this instruction originate from an authorized requester's intent"; for writes, "is a write to this target within an authorized scope" — verified independently of the `working_directory` value or the symlink resolution result, and blocking execution beforehand when no proof accompanies it. Pre-execution proof is not a substitute for detection but its **complement**, and the two together establish the agent's trust boundary.

On why after-the-fact detection is not proof, see [“The last layer left in AI-era cyber defense”](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); on the design of independent verification before an action, see [“Proof-as-Auth: sign in without ever sending your key”](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry context

- **Vendor (Cursor)**: initially declined the report on the grounds that "the threat model does not cover abuse of MCP servers," but after re-escalation triaged it and fixed both flaws in 3.0 (2026-04-02); it published its own advisory (GHSA-3v8f-48vw-3mjx) for the symlink flaw.
- **Research (Cato AI Labs)**: says it is disclosing similar flaws in other coding agents and that the problem is structural, posing to the industry the question of "once you ship agents that read the web, will you make treating all input as hostile the default, or keep chasing patches?"
- **Cross-industry**: how to handle "inputs the agent cannot choose the origin of" — MCP-connected services and web-search results — before connecting them to execution. It again showed that one-off guardrails like approval prompts and sandboxes can be removed by a single write from an injected instruction.

The absence of a layer that independently verifies, at execution time, the provenance of the instructions an agent reads and the authorization of the writes those instructions induce remains not a single-tool problem but a cross-organization operational challenge for anyone adopting AI agents that read external content.

---

## 7. Lemma's analysis

Against the gap this case exposed — the agent executing while decoupling the provenance of the instruction it read and the authorization of the write target from independent verification — Lemma proposes a design that, before the agent performs an operation, requires that the operation be authorized and carry legitimate provenance, as an independently verifiable cryptographic proof.

- **Proof-as-auth before the action**: before an agent runs a terminal command or writes a file, prove with a signature that "this operation is authorized for this principal, at this scope." Do not make the `working_directory` value or the symlink resolution result the terminus of write permission.
- **Authorization-scope verification for the write target**: base the permission to write on a per-target authorization-scope proof, not on the surface of path specification or link resolution the attacker can steer. Writes to "out-of-project, privileged targets" such as the sandbox helper file or startup files do not proceed without proof.
- **Binding the instruction's provenance**: bind the instruction the agent bases its action on to its origin (a legitimate requester, trusted input), distinguishing an injection blended into external content from the authorization path.
- **Selective disclosure**: disclose only that "this operation satisfies the authorization schema," keeping internal keys and credentials out of the environment.

This lets a proof fixed at execution time function as an independently verifiable trail for "is this instruction legitimately authorized, and is this write within an authorized scope," before the agent acts. Detection (after-the-fact disclosure, patching, vendor research) works for remediation once discovered, and pre-execution proof (authorization / provenance verification before execution) works for independent verification of agent operations — each complementary.

For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Cato Networks (research, primary)**: “DuneSlide: Two Critical RCE Vulnerabilities in Cursor” — <https://www.catonetworks.com/blog/duneslide-two-critical-rce-vulnerabilities/>
- **The Hacker News**: “Critical Cursor Flaws Could Let Prompt Injection Escape Sandbox and Run Commands” (2026-07-01) — <https://thehackernews.com/2026/07/critical-cursor-flaws-could-let-prompt.html>
- **CSO Online**: “Sandbox bypass flaws in Cursor IDE highlight prompt injection as an RCE vector” — <https://www.csoonline.com/article/4191923/sandbox-bypass-flaws-in-cursor-ide-highlight-prompt-injection-as-an-rce-vector.html>
- **Cursor (vendor advisory)**: GHSA-3v8f-48vw-3mjx (CVE-2026-50549, the symlink-verification fallback) — <https://github.com/cursor/cursor/security/advisories/GHSA-3v8f-48vw-3mjx>
- **NVD**: CVE-2026-50549 — <https://nvd.nist.gov/vuln/detail/CVE-2026-50549>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
