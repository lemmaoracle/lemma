---
brief_no: 48
title: "AI コーディングアシスタント宛ての指示ファイルに、見えない命令が仕込まれた — 来歴のない `.cursorrules` / `CLAUDE.md` を、AI が正規の指示として実行する構造（TrapDoor）"
title_en: "TrapDoor Plants Hidden Directives in AI Assistant Instruction Files Across npm, PyPI, and Crates.io"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["agent-infrastructure", "ai-decision-integrity", "model-supply-chain"]
incident_date: 2026-05-24
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "018-hackerbot-claw-ai-vs-ai", "024-invisible-unicode-instruction-injection", "028-npm-dependency-confusion-recon"]
status: published
version: "1.0"
og_lead_ja: "AI 指示ファイル（.cursorrules/CLAUDE.md）に隠し命令 — TrapDoor"
og_lead_en: "Hidden directives planted in AI instruction files — TrapDoor"
gap_detected: "Security firms and GitHub could detect and remove or reject the malicious packages and PRs containing hidden characters, and could publicize the technique."
gap_missing: "Before the AI read an instruction file and acted on it, there was no layer to confirm whether the instruction was placed by a legitimate author under legitimate authorization, so hidden commands were executed as is."
gap_fix: "Before the AI acts on an instruction, independently verify with Lemma that the instruction comes from this issuer under this authorization, and prevent it up front."
---

## 1. TL;DR

TrapDoor, disclosed by Socket, is a credential-stealing campaign whose distinctive technique plants invisible directives via zero-width Unicode in the AI-assistant instruction files (`.cursorrules`, `CLAUDE.md`), getting the AI to run a "security scan" and carry development secrets out. Scans and hidden-character warnings removed the malicious artifacts, but nothing checks, before the AI acts, whether an instruction comes from a legitimate author under legitimate authorization. Since what is shown diverges from what the AI ingests, detecting plausibility cannot reach this.

---

## 2. What happened

- **The campaign**: Tracked by Socket as TrapDoor. More than 34 packages and 384+ versions/artifacts spanning npm, PyPI, and Crates.io. It targets developers in the crypto, DeFi, Solana, and AI communities, stealing SSH keys, various wallets, AWS credentials, GitHub tokens, browser data, environment variables, and more.
- **Disclosure**: 2026-05-24, Socket Research Team. The earliest observed package is PyPI's `eth-security-auditor@0.1.0` (2026-05-22 20:20 UTC). Packages were published and updated in waves across the weekend from multiple accounts.
- **Per-ecosystem execution paths**: npm = a postinstall hook (shared payload `trap-core.js`, validates AWS/GitHub tokens via API, and moves laterally with SSH keys); PyPI = on import, fetches JavaScript from the attacker's GitHub Pages and runs it via `node -e`; Crates.io = a `build.rs` that, at build time, XOR-encrypts keystores and exfiltrates them to GitHub Gists.
- **The distinctive technique (the focus of this Brief)**: AI-targeted injection into `.cursorrules` / `CLAUDE.md`. These are legitimate files that give AI coding tools project-specific instructions, but the attacker plants directives hidden with zero-width Unicode characters that drive the AI assistant to perform "security scan" and similar tasks, steering it to discover and exfiltrate secrets. The attacker's GitHub Pages site also functions as HTML that prompts AI assistants to run a scan.
- **Slipped into the legitimate contribution flow**: The attacker account `ddjidd564` submitted PRs adding `.cursorrules` / `CLAUDE.md` — under innocuous framing like "dev standards and build verification" — to real projects including `browser-use`, `langchain`, `langflow`, `llama_index`, `MetaGPT`, and `OpenHands`. GitHub warned that those files contained hidden / bidirectional Unicode.
- **Attacker documents**: The same repository holds `AUDIT-MATRIX.md` (self-described "Universal AI Agent Extraction Framework"), which describes a "disguise layer" that makes credential theft look like innocuous tasks such as "security audit" and "wallet safety check." Campaign marker `P-2024-001`.

This incident stems from a structure in which the provenance and authorization of the instruction files an AI obeys are not independently verified before execution. The path by which the failure propagates into exfiltration of secrets is as follows.

1. **Placing instructions with no provenance**: The attacker places `.cursorrules` / `CLAUDE.md` in a repository — at the install time of a malicious package, or via a PR to a legitimate project. The contents include directives hidden with zero-width Unicode and, on screen, look like innocuous development guidelines.
2. **Trusted as "project-specific instructions"**: The AI coding assistant loads these files as the project's legitimate instructions. It mistakes "being bundled in the repository" for a guarantee that the instructions originate from a legitimate author and legitimate authorization.
3. **Executing the disguised task**: The hidden directives make the AI execute credential theft disguised as innocuous tasks like "security scan," "wallet safety check," or "cloud config verification" (corresponding to the attacker document's "disguise layer").
4. **Discovering and sending out secrets**: The execution searches for and collects the secrets the development environment can reach (SSH keys, cloud/GitHub credentials, wallets, environment variables) and sends them to the attacker infrastructure (GitHub Pages / Gists, etc.). The npm payload validates the AWS/GitHub tokens via API and moves laterally with SSH keys.
5. **Detection and disablement**: Once the malicious packages / PRs are detected, registry removal and PR rejection kick in. But this acts after the instructions could already be read and executed by the AI — an after-the-fact measure.

---

## 3. Timeline — disclosure and response

- 2026-05-22: The earliest observed package `eth-security-auditor@0.1.0` is published to PyPI (20:20 UTC). From then, it spreads in waves to npm, PyPI, and Crates.io from multiple accounts.
- 2026-05-24: Socket discloses TrapDoor, linking it as a single campaign from the overlap of cross-registry infrastructure and behavior.
- 2026-05 (same period): The attacker `ddjidd564` submits PRs adding `.cursorrules` / `CLAUDE.md` to real AI / developer-tooling projects. GitHub warns about hidden Unicode.
- Ongoing: Socket classifies all identified packages as malicious, reports them to each registry, and continues to monitor related packages and infrastructure.

> Note: The attacker document `AUDIT-MATRIX.md` itself states it is "a design document that is only partially implemented," so not everything described is necessarily live behavior. This text treats it only within the range consistent with the observed npm payload behavior, and asserts no unverified claims.

The response and industry movement after disclosure:

- **Vendors and platforms**: Socket classified all identified packages as malicious, reported them to each registry, and continues to monitor related infrastructure. GitHub warned that the PRs' `.cursorrules` / `CLAUDE.md` contained hidden / bidirectional Unicode, putting AI-instruction injection via the contribution flow on the detection radar.
- **The AI development environment question**: AI instruction files like `.cursorrules` / `CLAUDE.md` were re-recognized as deserving a trust boundary equal to code. A mechanism for an AI assistant to verify the provenance, authorization, and presence of hidden characters before it reads bundled instructions is raised as the challenge.
- **Cross-industry question**: Supply-chain attacks, starting from "package install," are spreading across the entire development workflow — AI assistant configuration, shell environments, Git hooks, SSH, browser profiles, cloud credentials, and wallets. The debate is shifting the center of gravity of AI dev-tool trust design toward not making the surface plausibility of instructions the endpoint of trust, but verifying the provenance and authorization of the instructions an AI obeys before execution (provenance / pre-execution attestation).

---

## 4. Why it wasn't stopped

The central **failure primitive is "the provenance and authorization of the instruction files an AI assistant obeys (`.cursorrules` / `CLAUDE.md`) are not independently verified before the AI reads and executes them"** — "Being bundled in the repository" and "looking like project-specific instructions" are no guarantee that the instructions originate from a legitimate author and legitimate authorization. Concealment via zero-width Unicode makes what is shown on screen diverge from what the AI actually reads, so even a human review misses it. We note `agent-infrastructure` (the AI-assistant configuration as infrastructure) and `ai-decision-integrity` (the AI's judgment steered by tampered instructions) as secondary categories.

The carriers of the supply-chain contamination (npm postinstall, PyPI import-time execution, Crates.io `build.rs`) are conventional, but what is new in this campaign is that **it placed the endpoint of the carriage at "the instruction files an AI assistant reads."** As in [Brief 037](/critical/briefs/037-agent-config-auto-execution/) (AI coding agents auto-executed bundled config without verification), it is the same mistake of "bundled == authorized," but here the execution target is not config but **natural-language instructions to the AI**, and even when those instructions are tampered with, the AI obeys them as legitimate guidelines. It is the supply-chain version of [Brief 018](/critical/briefs/018-hackerbot-claw-ai-vs-ai/) (rewriting a repository's CLAUDE.md to try to hijack a defending AI's instructions), and it connects the concealment technique of [Brief 024](/critical/briefs/024-invisible-unicode-instruction-injection/) (invisible Unicode making what a human sees diverge from the AI's input) to the provenance problem of instruction files. It also connects to [Brief 028](/critical/briefs/028-npm-dependency-confusion-recon/) (a package spoofing an internal scope exploited the build environment's provenance assumptions) in exploiting provenance assumptions. What this incident shows is that the AI development environment itself has become a target layer of supply-chain contamination — a direct line from the absence of provenance verification to real harm.

In this incident, the detection-and-remediation chain functioned — vendor research (Socket's cross-registry detection, an average of just under 6 minutes to detect new versions), reporting to and removal from the registries, and GitHub's warning about hidden Unicode plus PR rejection — and the techniques were made visible from the outside. This is a typical success of detection, and this Brief does not negate the role of the detection layer. Detection is indispensable for publishing the techniques, removing malicious packages, and scrutinizing the contribution flow.

At the same time, detection provides no material to independently establish — **at the moment the AI reads and executes the instructions** — whether the instruction file the AI is about to read is legitimately authorized and originates from a legitimate author. A registry scan sees only "is this package malicious," and a PR review sees only "is this change reasonable." Neither can distinguish, before the AI executes, the directives hidden in the instruction file with zero-width Unicode from the side of provenance. Removal and rejection, too, are after-the-fact chains that act once the instructions could already be read. This is a structurally independent layer gap, outside the reach of the detection layer.

---

## 5. What proof would have changed

Pre-execution attestation closes this gap by inserting one step — proof of the instructions' provenance and authorization — into the path by which the AI assistant reads an instruction file and executes the task. Even when what is shown diverges from what is real, by binding the instructions / artifacts to their issuer (the legitimate author / distributor) and verifying provenance via a docHash, instructions tampered with via zero-width Unicode, or slipped into a legitimate project without authorization, can be distinguished before execution as "lacking legitimate provenance / authorization." Detecting the surface plausibility of the instructions (the detection-style "does this content look reasonable") and attesting the instructions' provenance/authorization beforehand (the "do these instructions have a legitimate issuer / authorization") are not substitutes but **complements**.

Against the gap this incident exposed (the provenance and authorization of the instruction files an AI obeys are decoupled from the AI's execution), Lemma proposes a design that requires, before the AI assistant executes instructions / tasks, an independently verifiable cryptographic proof that the instructions are legitimately authorized and carry legitimate provenance.

- **Binding instruction provenance**: Bind the instruction files / artifacts to be executed to their issuer (the legitimate author / distributor) and verify provenance via a docHash. Make the divergence between what is shown and what is real — caused by zero-width Unicode — detectable before execution.
- **Pre-action authorization proof (proof-as-auth)**: Before the AI performs instruction-driven tasks (searching for secrets, sending them externally, destructive operations), prove with a signature that "this task is authorized, with this scope, to this party." Do not make "being bundled in the repository" the endpoint of authorization.
- **Scoped authority**: Minimize the authority given to the AI assistant per task, and do not let the collection / sending of secrets beyond the scope of authorization succeed without proof. Distinguish legitimate tasks from tasks driven by tampered instructions via the evidence trail.
- **Selective disclosure**: Disclose only the minimum — that "this task meets the authorization schema" — without letting internal keys or credentials leave the environment.

In this way, a proof fixed at the moment of execution functions as an independently verifiable trail of whether "these instructions are legitimately authorized and carry legitimate provenance," before the AI executes them. Detection (after-the-fact removal of malicious packages, PR rejection) works on remediation after discovery; attestation (provenance / authorization verification before execution) works on the independent verification of AI instructions — each complementary to the other.

---

## 6. Sources

- **Socket (research, primary)**: "TrapDoor Crypto Stealer Supply Chain Attack Hits 34 Packages and Hundreds of Versions Across npm, PyPI, and Crates.io" (2026-05-24; per-ecosystem execution paths, AI injection, attacker documents, IOCs) — <https://socket.dev/blog/trapdoor-crypto-stealer-npm-pypi-crates>
- **The Hacker News**: "TrapDoor Supply Chain Attack Spreads Credential-Stealing Malware via npm, PyPI, and CratesIO" (2026-05; overview, targets) — <https://thehackernews.com/2026/05/trapdoor-supply-chain-attack-spreads.html>
- **Phoenix Security**: "TrapDoor Supply Chain Campaign: Cross-Ecosystem Credential Theft and AI Assistant Poisoning via npm, PyPI, and Crates.io" (2026-05; synthesis of the AI-assistant poisoning) — <https://phoenix.security/trapdoor-supply-chain-ai-poisoning-npm-pypi-crates/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/), [Trust402](https://lemma.frame00.com/trust402/)
