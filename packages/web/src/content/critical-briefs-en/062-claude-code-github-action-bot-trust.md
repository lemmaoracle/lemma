---
brief_no: 62
title: "Claude Code GitHub Action：`[bot]` を名乗る 1 件の issue を信頼してエージェントが特権実行した — 起動者の権限と入力の出所が、実行の前に独立検証されない構造（GMO Flatt Security）"
title_en: "Claude Code GitHub Action: one issue claiming \"[bot]\" led the agent to privileged execution — the trigger's authority and input origin not verified before acting (GMO Flatt Security)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-04
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["037-agent-config-auto-execution", "029-github-dev-oauth-token", "048-trapdoor-ai-instruction-provenance", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "issue 1 件で AI エージェントにリポジトリを乗っ取られる — Claude Code GitHub Action"
og_lead_en: "One GitHub issue hijacks the repo via the agent — Claude Code GitHub Action"
gap_detected: "The vulnerability was reported through responsible disclosure, a patch was shipped quickly, and CI logs recorded the execution."
gap_missing: "There was no layer to check before action whether the party that triggered the agent held legitimate authority or whether the loaded content came from a trusted source, so a trigger claiming to be a `[bot]` and malicious instructions disguised as a request passed straight through."
gap_fix: "Before an agent acts with privilege, independently verify with Lemma that this trigger comes from a party with legitimate authority and this input originates from a trusted source, and prevent it up front."
---

## TL;DR

In June 2026, RyotaK (GMO Flatt Security) disclosed a flaw in the Claude Code GitHub Action: the trigger check unconditionally trusted any actor whose name ends in `[bot]`, so a single malicious issue could spoof the trigger, prompt-inject to exfiltrate credentials, and hijack the repository. Disclosure and a four-day patch cannot establish, before execution, whether the launcher holds legitimate authority or where the input comes from. What is structurally missing is a layer verifying the launcher's authority and the input's provenance before privileged execution. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Target**: Anthropic's Claude Code GitHub Action (claude-code-action), which embeds Claude in CI/CD to triage issues, apply labels, review pull requests, and run slash commands. By default it has read/write access to the repository's code, issues, PRs, discussions, and workflow files.
- **Identifier and severity**: 7.8 under CVSS 4.0. Fixed in claude-code-action v1.0.94. Anthropic paid a bug bounty.
- **Reporter and sequence**: Researcher RyotaK (GMO Flatt Security) reported the core bypass to Anthropic in January 2026. Anthropic fixed it within four days, with additional hardening through the spring. Public disclosure on 2026-06-04 (The Hacker News and others).
- **The core flaw (launcher authority)**: The trigger check (`checkWritePermissions`) **unconditionally trusted any actor whose name ends in `[bot]`** (on the assumption that a GitHub App is trusted, installed by an admin). But anyone can register a GitHub App, install it on their own repo, and use its installation token to create issues / PRs on any public repository. The Action saw "it's a bot" and let the attacker's content through. Tag mode had an extra human-confirmation check; agent mode did not, and was exposed.
- **The chain (input provenance)**: The attacker uses indirect prompt injection — planting instructions in an issue body disguised as an error message, tuned so Claude executes them while trying to "recover." The target is `/proc/self/environ` (environment variables containing secrets). Claude blocks a naive read, but the attacker routes around it and has the values written back into the issue to be retrieved.
- **Final reach**: The prize among the environment variables is the credential set that GitHub Actions requires for an OIDC token (a signed token proving "I am this workflow running in this repo"). Claude Code exchanges it with Anthropic's backend for an installation token for the Claude GitHub App, which has write access. Steal that credential and replay the exchange, and you hold write access to the target's code, issues, and workflows. Aim at the claude-code-action repository itself, and you can poison the Action that downstream consumers pull in.

---

## 2. Timeline

- 2026-01: RyotaK reports the core bypass to Anthropic. Anthropic fixes it within four days.
- 2026 spring: Additional hardening continues. The fixes converge in claude-code-action v1.0.94.
- 2026-06-04: The vulnerability details are published (GMO Flatt Security's research post, The Hacker News, and others).

> Note: This was handled as a coordinated disclosure (published after a fix was available). There is no public trace of "this exact path" poisoning Anthropic's own Action being used against a real-world target; RyotaK demonstrated it only on his own test repositories. That said, the same shape (AI issue triage + broad permissions + prompt injection) has produced real-world damage by other routes — e.g., the February 2026 case in which an npm publish token was stolen via Cline's claude-code-action workflow and a malicious version published. RyotaK has said he reported roughly 50 techniques for circumventing the permission system.

---

## 3. Attack vector

This incident stems from the launching actor's authority and the input's provenance not being independently verified before a privileged action. The path is as follows.

1. **Impersonating the launcher**: The attacker registers and installs their own GitHub App and uses its token to create an issue on the target public repository. The Action launches, trusting an actor whose name ends in `[bot]` (agent mode lacks the human-confirmation step).
2. **Prompt injection into the input**: The issue body is made to look like an error message, leading Claude to execute the embedded instructions as "recovery." What the human sees and what the AI reads as instructions diverge.
3. **Exfiltrating secrets**: Targeting `/proc/self/environ`, the guard is bypassed so the environment variables (including secrets) are written back into the issue.
4. **Stealing and replaying credentials**: The OIDC-token-exchange credential among the environment variables is stolen, the exchange is replayed, and a write-capable installation token is obtained.
5. **Downstream propagation**: Writes to the target's code, issues, and workflows. Aim at the claude-code-action repository itself, and you can poison the Action downstream consumers pull in (supply-chain propagation).

As a secondary path, Anthropic's example workflow shipped `allowed_non_write_users: "*"` (anyone can trigger — flagged as a risk in the docs too), and Claude posted task summaries into the **publicly visible** run-summary field, so repositories that copied it inherited the same hole. And an attacker without trigger rights could still slip a payload in as "trusted input" by editing a trusted user's issue after it triggered but before Claude read it.

---

## 4. Structural analysis

This incident belongs to the `agent-infrastructure` category of Pillar 03 (Agent Authority Proof). The central failure primitive is that **before the agent takes a privileged action (a broadly permissioned CI run), it does not independently verify "who launched the agent, and whether that launcher holds legitimate authority" or "whether the provenance of the input it loaded is trustworthy."** It mistook the `[bot]` name suffix for proof of authority and executed an unverified input (the issue body) as instructions in a privileged context. We note `identity-auth` (authentication of the launcher) and `ai-decision-integrity` (integrity of the input the AI reads) as secondary categories.

This is the same shape as Brief 037 (an AI coding agent auto-executed a repo-bundled config file without verification): **the agent acts with broad permissions without verifying the provenance of its launch or its input.** Where 037 was auto-execution of a bundled config and this is launch by an external issue, both share that "the authority to make the agent act is decoupled from independent verification of the launcher's and the input's legitimacy." It connects to Brief 048 (invisible instructions in AI instruction files) and Brief 024 (invisible-Unicode instruction injection) through the primitive of divergence between what the human sees and what the AI reads as instructions. It connects to Brief 029 (theft of an over-scoped OAuth token) in that the stolen token is not scoped to the action.

The point is not using AI as such. Embedding AI in CI is a productivity gain. What was missing is **a layer that, before the agent acts, independently verifies the launcher's authority and the input's provenance.** An agent holding real tokens and real tools can be pushed as far as its permissions allow. As long as prompt injection is unsolved, a design that presumes the input is trustworthy collapses at a single entry point.

---

## 5. The gap between detection and proof

Discovery of the vulnerability and coordinated disclosure, the rapid patch, and CI-log auditing all functioned here and are indispensable for deterring recurrence; this Brief does not negate that role. Anthropic fixed the core within four days and continued hardening.

At the same time, detection provides no material to independently establish — **before the action** — whether the actor that just launched the agent holds legitimate authority, or whether the input just loaded comes from a trustworthy source. A launch by an actor calling itself `[bot]` and an issue disguised as an error message are indistinguishable, to the system, from a legitimate trigger and legitimate input. After-the-fact log analysis reconstructs "what was executed," but not "was that execution authorized after independently verifying the launcher's authority and the input's provenance." A patch closes a specific hole, but the input-trust problem that is prompt injection remains unsolved.

Pre-execution attestation treats the agent's action as a privileged act and requires, before execution, an independently verifiable proof of "does the launcher hold legitimate authority" and "what source does the input derive from, and is it untampered." Make the launcher's authority attributes — not the `[bot]` name — and the input's provenance — not the look of the issue body — verifiable at the moment of the act, and privileged execution based on an unverified launch or input is blocked before the action. Further, an authorization like the OIDC token exchange can be replaced with a per-action-scoped proof that a replayed stolen credential cannot satisfy. Detecting the vulnerability (the detection-style "where is the hole") and proving authority and input ("was the action authorized after independently verifying the launcher's authority and the input's provenance") are not substitutes but **complements**.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **Anthropic**: Fixed the core within four days of the report and hardened through the spring; the fixes converge in claude-code-action v1.0.94. It advises users to audit workflows where non-write users or bots can launch Claude, to pass no secrets beyond the Anthropic API key and `GITHUB_TOKEN` when handling unverified input, and to remove tools and permissions usable for exfiltration.
- **Permission design for AI coding agents**: A setup where an agent holding real tokens and real tools runs on unverified input leads directly to privileged execution when independent verification of the launcher and the input is absent — for as long as prompt injection is unsolved. Casually copying the example config (`allowed_non_write_users: "*"`, output to the public summary field) widens the hole.
- **A cross-industry issue**: The same shape (AI issue triage + broad permissions + prompt injection) has produced real-world damage by other routes, such as the npm publish-token theft via Cline's workflow. Across agent infrastructure generally, a design requirement is emerging to independently verify "the launcher's authority" and "the input's provenance" before action.

The absence of a layer that independently verifies, before action, an agent's privileged execution based on an unverified launch or input is not a problem of a specific product; it remains a cross-organizational challenge for any organization embedding AI in CI or operations.

---

## 7. Lemma's analysis

Against the gap this incident exposed (the agent's launcher authority and input provenance are not independently verified before the action), Lemma proposes a design that records the agent's action as a privileged act and, before execution, verifies "who launched it, under what authority, and on what source of input" as an independently verifiable cryptographic proof.

- **Launcher authority proof**: Verify the authority attributes of the actor launching the agent as an independently verifiable proof — not a name suffix — and reject an unverified launch before the action.
- **Input provenance binding**: Bind the input the agent loads (issues, configs, data) to its source via a docHash, making the identity between what the human sees and what the AI interprets, and the presence of tampering, verifiable at the moment of the act.
- **Per-action scoped authorization**: Replace authorizations like the OIDC token exchange with a per-action-scoped, independently verifiable proof that a replayed stolen credential cannot satisfy (proof-as-auth).
- **Selective disclosure**: Without exposing internal implementation or secrets, disclose only the minimum — that "this execution was authorized after independently verifying the launcher's authority and the input's provenance."

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this agent's action rests on a launcher with legitimate authority and input from a trustworthy source," without depending on after-the-fact log reconciliation. Detection (after-the-fact vulnerability discovery and patching) works on closing holes; attestation (independent verification of authority and input at the moment of the act) works on establishing trust in agent execution — each complementary to the other.

For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **GMO Flatt Security (primary, researcher)**: RyotaK, "Poisoning Claude Code: One GitHub Issue to Break the Supply Chain" — <https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/>
- **The Hacker News**: "Claude Code GitHub Action Flaw Let One Malicious Issue Hijack Repositories" (2026-06-04) — <https://thehackernews.com/2026/06/claude-code-github-action-flaw-let-one.html>
- **Anthropic (primary, fix commit)**: claude-code-action fix commit (converging in v1.0.94) — <https://github.com/anthropics/claude-code-action/commit/1bbc9e7ff7d48e1299f7fa9698273d248e0cafea>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
