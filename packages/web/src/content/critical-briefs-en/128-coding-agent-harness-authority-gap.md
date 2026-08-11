---
brief_no: 128
title: "コーディングエージェント3種を既定構成で突破：harness が「安全」と印付けた値を、後段がより強い権限で実行した — issue 1 件で CI が乗っ取られる"
title_en: "Three coding agents broken in their default config: the harness marked a value safe, and a later stage acted on it with more authority"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["062-claude-code-github-action-bot-trust", "095-amazon-q-mcp-auto-execution", "114-aws-kiro-self-rewriting-mcp-config", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "コーディングエージェント3種を既定構成で突破 — issue 1 件で CI 乗っ取り"
og_lead_en: "Three coding agents broken in default config — one GitHub issue reaches CI"
gap_detected: "Detection worked. Each agent shipped an allowlist, command checks, and a sandbox — a layer that marks values safe was there by design."
gap_missing: "Nothing re-checked the provenance and authorization of that safe-marked value at the step where it became a privileged action."
gap_fix: "Insert one step, just before the action, that independently verifies where the value came from and what it is allowed to do."
analysis_lead_ja: "確かめられないのは、値が安全かどうかではない。安全と印付けたその値を、行動の一段手前で改めて確かめる層が在るか、である。"
analysis_lead_en: "The question isn't whether a value was marked safe. It's whether anything re-checks that value, independently, at the step where it becomes an action."
---

## 1. TL;DR

Novee Security attacked Anthropic's Claude Code, Google's Gemini CLI, and OpenAI's Codex — each in the configuration the vendor ships by default — and presented the work at Black Hat USA on August 5, 2026. A GitHub issue opened by an account with no repository privileges was enough to run code on the CI runners behind Anthropic's and Google's own coding-agent repositories; on OpenAI's, it was enough to hijack the next agent run. Two CVEs came out of it, both patched. What recurred was not a clever trick played on a model. **What failed was the step where one layer marked a value "safe" and a later layer acted on it with more authority — with nothing re-checking that value's provenance and authorization in between.**

## 2. What happened

- Novee tested each vendor's coding agent in its default CI workflow. The entry point was not "talking a model into something," but the harness — the code around the model that decides what actually runs. In all three cases, any GitHub user with no privileges could trigger it by opening an issue.
- **Gemini CLI** (CVE-2026-12537): an OS command injection in the container launcher, reached through a crafted `.gemini/.env` file, giving host-level code execution on a headless CI platform before the sandbox starts. In Novee's demonstration the executed code could read the parent process's environment directly (`/proc/$PPID/environ`) in the same PID namespace — no `unshare`, no `hidepid` in between — and the CI secrets sat there.
- **Gemini CLI's allowlist** (no CVE): registering `run_shell_command(echo)` in the config does not do what it looks like. Per Novee, the `(echo)` annotation is never parsed, stored, or enforced; `shell.ts` verifies only that the command is non-empty and returns without checking `coreTools`. Relatedly, Google's earlier advisory (GHSA-wpqr-6v78-jr5g, 2026-04-24, no CVE assigned) acknowledged that under `--yolo` the fine-grained allowlist was ignored altogether, and fixed it in 0.39.1 so the policy engine evaluates tool allowlisting under `--yolo` too. That advisory credits Novee's Elad Meged and Pillar Security's Dan Lisichkin as reporters.
- **Claude Code** (CVE-2026-54316): Novee ran three separate chains against `anthropics/claude-code` — Anthropic's own repo running Anthropic's own agent — and came away with the workflow's `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`. (1) The command validator strips single-quoted text before its 23 checks run — correct behavior for bash — so a payload placed in the value of `git push --receive-pack='sh -c "…"'` reached the runner untouched; to the validator it looks like a flag with an empty value. (2) `tac`, `rev`, and `fold` were hardcoded as read-only but never path-checked, allowing reads of `/proc/self/environ` whose results surfaced in public GitHub Actions summaries. (3) Because `huggingface.co` was pre-approved as a bare hostname for WebFetch, any path on that domain — including 64 attacker-created repositories, one per character — was auto-approved without a permission prompt and outside `--allowedTools` restrictions, turning Hugging Face's server-side download counter into a channel that leaked a key one character at a time.
- **Anthropic fixed all three rounds**: an explicit git-push allowlist (with most Bash tools removed), `display_report` turned off with output sanitized, and `huggingface.co` scoped to a docs path rather than a bare hostname. CVE-2026-54316 was assigned to the last of these, with the fix shipping in 2.1.163. Anthropic says exploitation required getting untrusted content into a Claude Code context. Novee summarizes the arc as "Three rounds. Each fix got more targeted and each attack got quieter, from a reverse shell, to a reversed secret in a log, to a download counter."
- **Codex**: neither a CVE nor a product-version patch. The `openai/codex` repository ran two Codex passes inside one job sharing a single checkout, with the attacker's issue body written to disk there. The first pass could write `AGENTS.md` — Codex's own default instruction file, loaded from disk on every invocation and injected as instructions — which the second pass then loads as its own. Making the first pass emit output that is no longer valid schema JSON, which the validation step correctly catches, is exactly what launched the second pass. OpenAI's position is that its sandbox behaved exactly as documented.

The attack holds together through this chain:

1. An unprivileged account places attacker-controlled input where the agent will read it — an issue, a repository-bundled file, content the agent is asked to summarize.
2. Part of the harness marks that input, or a value derived from it, as "validated / safe" (allowlist registration, quote stripping, a shared checkout).
3. A later part trusts that mark and acts on the value with more authority (launching a container, running a command, loading the next pass as instructions).
4. The result is host execution before the sandbox starts, exfiltration of CI secrets or an API key, or hijacking of the next agent run.

## 3. Timeline — disclosure and response

- 2026-04-24: Google publishes its advisory on Gemini CLI folder trust and tool allowlisting (GHSA-wpqr-6v78-jr5g). No CVE is assigned. The fixes ship in `@google/gemini-cli` 0.39.1 and `run-gemini-cli` 0.1.22, and the advisory states the impact "affects all Gemini CLI GitHub Actions."
- 2026-06-17: The Claude Code flaw (CVE-2026-54316 / GHSA-fg94-h982-f3mm) is published to the GitHub Advisory Database.
- 2026-06-24: The Gemini CLI container-launcher flaw (CVE-2026-12537 / GHSA-jj69-4grx-fqj5) is published; Google Cloud is the CNA.
- 2026-08-05: Novee presents the cross-vendor work at Black Hat USA; founding engineer Elad Meged lays out the details on the company blog the following day, August 6.
- 2026-08-07: The Hacker News confirms that CISA lists exploitation as none for both CVE records and that neither appears in CISA's Known Exploited Vulnerabilities catalog as of that date. Per the same report, a public GitHub repository describing itself as a reproduction lab for the Claude Code flaw has existed since June 18, but nothing shows either chain used against a target.

> This Brief covers research against default configurations, not a real-world breach. Fixes: Gemini CLI 0.39.1 / `run-gemini-cli` 0.1.22; Claude Code 2.1.163 (versions from 0.2.54 up to but excluding 2.1.163 were affected). The Codex chain has no product-version patch; OpenAI separated the two passes into different jobs and checkouts, moved them into read-only environments, and updated its guidance to treat repository instruction files as part of the untrusted input surface. **CVSS figures diverge by scorer, so no single number carries the severity.** For CVE-2026-12537, the CNA (Google Cloud) scores v4 10.0 (Critical) while NVD's own primary assessment is v3.1 7.8 (High). For CVE-2026-54316, the GitHub Advisory carries v4 6.0 (Moderate) while NVD's primary assessment is v3.1 9.1 (Critical) — not a like-for-like comparison.

Response and developments:

- All three vendors fixed or operationally mitigated the relevant path. The shared mitigation is to audit any workflow an outside user can trigger, and beyond that: do not let separate agents share a writable directory, and scope tokens to the permissions each task actually needs.
- The Codex change is a repository-level workflow fix plus a documentation update; it does not show that Codex itself now treats a writable instruction file differently.

## 4. Why it wasn't stopped

The failure here is not that a model was fooled, nor that any vendor lacked a checking layer. It is that **between the layer that marked a value "safe" and the layer that acted on it with more authority, nothing re-verified where that value came from or what it was allowed to do.**

The detection layer was there: allowlists, command checks, and sandboxes all exist by design. What failed sat in between — the layer that marks a value and the layer that trusts the mark and acts. In Gemini CLI, the fine-grained entry written into the allowlist is never checked at execution. Claude Code's validator strips quotes correctly for bash, but the stripped value then flows to a more privileged step. Codex trusts the first pass's output as its second pass's instructions. In each case the marking layer behaved correctly, and there was no layer to re-check the mark at the moment of action.

> The harness is the code between the model and the real world. What recurred there was a single shape: one part marked a value safe, and a later part acted on that value with more authority.

This shares its structure with [Brief 037](/critical/briefs/037-agent-config-auto-execution/) (a repository-bundled config executed without verification), [Brief 114](/critical/briefs/114-aws-kiro-self-rewriting-mcp-config/) (an agent made to rewrite its own MCP config), and [Brief 095](/critical/briefs/095-amazon-q-mcp-auto-execution/) (a bundled MCP config executed on opening a repository). The common thread: the agent's authority is not tied to where an instruction came from or what it is allowed to do.

## 5. What proof would have changed

Proof-as-auth inserts one step — between the layer that marks a value "safe" and the layer that acts on it — that independently verifies provenance and authorization. A machine does not judge whether the value's content is malicious. Instead, "where did this value come from, and is this action authorized for it" becomes something the acting side can verify before the action lands, without asking the issuer.

The design Lemma proposes for this gap:

<ul class="bd-check">
<li><strong>Authorization proof before the action</strong>: require, just before a privileged action (launching a container, running a command, loading instructions), a proof that the action is authorized within scope — re-checking at the moment of action rather than trusting an earlier mark.</li>
<li><strong>Provenance binding on inputs</strong>: bind provenance to the values an agent reads (issue text, bundled files, a prior pass's output), so input originating from an unprivileged account does not silently escalate into a privileged action.</li>
<li><strong>Scope fixed at runtime</strong>: verify the allowlist per action at execution time, not only at registration, so what is permitted cannot drift between the two.</li>
<li><strong>Selective disclosure of secrets</strong>: keep API keys and CI secrets off the agent's response path, presenting only the verification needed rather than the secret itself.</li>
</ul>

What this layer does not do:

<ul class="bd-limit">
<li>Judging whether an input is malicious remains the work of checks and scanners built on top of this binding.</li>
<li>Proof can show that an action was authorized; it cannot show that the model's reasoning was correct.</li>
<li>Placing a gate in a workflow is the operator's decision; this layer supplies the material for that decision.</li>
</ul>

This is where it differs from an internal audit log: a log is something a system emits for itself, and the counterparty or an auditor cannot independently confirm from it that an action was authorized.

Lemma does not detect prompt injection and does not correct a model's mistakes. Command checks, sandboxes, and allowlists are complementary to this layer, not alternatives to it. The former reject malicious input; the latter closes the single point where a value marked "safe" is acted on with more authority — before the action.

## 6. Sources

- **Novee Security (primary research)**: Elad Meged, "Black Hat 2026: If You Run These Automations, You're Exposed Too: Critical Flaws in Anthropic, Google, and OpenAI's Coding Agents" (published 2026-08-06; presented at Black Hat USA 2026-08-05) — <https://novee.security/blog/critical-flaws-in-anthropic-google-and-openais-coding-agents/>
- **GitHub Advisory Database (primary)**: CVE-2026-12537 / GHSA-jj69-4grx-fqj5 (CNA: Google Cloud, 2026-06-24) — <https://github.com/advisories/GHSA-jj69-4grx-fqj5>
- **Google (primary)**: Gemini CLI advisory on folder trust and tool allowlisting, GHSA-wpqr-6v78-jr5g (2026-04-24, no CVE assigned) — <https://github.com/google-github-actions/run-gemini-cli/security/advisories/GHSA-wpqr-6v78-jr5g>
- **Anthropic (primary)**: Claude Code security advisory GHSA-fg94-h982-f3mm (2026-06-17) — <https://github.com/anthropics/claude-code/security/advisories/GHSA-fg94-h982-f3mm>
- **NVD (primary)**: CVE-2026-54316 (NVD primary assessment v3.1 9.1, alongside the GitHub Advisory's v4 6.0) — <https://nvd.nist.gov/vuln/detail/CVE-2026-54316>
- **The Hacker News (independent reporting)**: Swati Khandelwal, "Claude Code and Gemini CLI Flaws Let a GitHub Issue Reach CI Workflow Secrets" (2026-08-07) — <https://thehackernews.com/2026/08/claude-code-and-gemini-cli-flaws-let.html>

References: On why after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/). On the design, see ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/); on scope, [Pillar 03 — Agent Authority](/pillars/#agent) · [Brief 095 (a bundled MCP config executed on opening a repository)](/critical/briefs/095-amazon-q-mcp-auto-execution/) · [Brief 114 (an agent made to rewrite its own MCP config)](/critical/briefs/114-aws-kiro-self-rewriting-mcp-config/)
