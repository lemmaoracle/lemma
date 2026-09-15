---
brief_no: 147
title: "GitSpawn: A Repository's Own Git Config Ran Code in Seven AI Coding Agents Before the User Approved Anything — リポジトリ由来の設定を実行してよいかを、サブプロセスを起こす前に確かめる層が無い"
title_en: "GitSpawn: A Repository's Own Git Config Ran Code in Seven AI Coding Agents Before the User Approved Anything — nothing checks whether a repo-supplied config may run before the subprocess starts"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-09-01
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint"]
status: published
version: "1.0"
og_lead_ja: "GitSpawn：AIコーディングエージェント7種、git設定でコード実行"
og_lead_en: "GitSpawn: seven AI coding agents run code via git config"
---

## 1. TL;DR

On September 1, 2026, security firm Manifold Security published a vulnerability class it named "GitSpawn." All seven major CLI-based AI coding agents tested — Claude Code, OpenAI Codex, Cursor, Goose, Qwen Code, Grok Build, and Hermes Agent — had a path where simply opening a repository could run code. The cause: the ordinary background git commands agents run at startup, such as `git status`, read a repository's own `.git/config` (specifically settings like `core.fsmonitor`, which Git uses to speed up file-change checks) without sanitizing it, and execute whatever command that config names. This happens outside the sandbox, as the developer, with no approval prompt — on some agents before the workspace-trust dialog appears, on one before the user has even authenticated. Four of the eight findings remained unpatched at publication. As of this writing (September 15, 2026), two of those four — Hermes Agent and Qwen Code — have shipped fixes; no fix could be confirmed for Grok Build or Claude Code's `ultrareview` path.

Detection worked. Researchers reproduced all eight findings with recorded proofs of concept, two received CVEs, and five overlapped with reports independently filed by other researchers. **What didn't work was a layer that checks, before that command runs, whether executing a repository's own configuration was ever authorized.**

---

## 2. What Happened

- **Affected products**: Claude Code, OpenAI Codex (CLI/Desktop), Cursor, Goose, Qwen Code, Grok Build, and Hermes Agent. Combined, five of these projects carry roughly half a million GitHub stars (Hermes Agent 237,000+, Claude Code 143,000+, Goose 54,000+, Qwen Code 27,000+, Grok Build 26,000+); Claude Code alone sees over 77 million npm downloads a month.
- **Discovered by**: Manifold Security (offensive security researcher Francisco Rosales), published September 1, 2026.
- **Findings**: 8 total. Two received CVEs — Goose (CVE-2026-72718, CVSS 7.0) and Hermes Agent (CVE-2026-71963, assigned by independent CNA VulnCheck). OpenAI separately published three CVEs of its own for Codex the same day, including CVE-2026-19592, crediting three unrelated research groups.
- **Still unpatched at publication**: Hermes Agent, Qwen Code, Grok Build, and a second path in Claude Code reached through `claude ultrareview` (which uses a different config key Manifold withheld to avoid enabling abuse). Of these, Hermes Agent landed a fix on September 2 and Qwen Code on September 12 (see timeline).

The attack chain:

1. An attacker prepares a repository that still has its `.git/config` intact and sets `core.fsmonitor` (or a similar key) to an arbitrary command. Because a normal `git clone` never carries this file, delivery relies on moving the directory itself — a zip file, shared drive, sync folder, or USB stick.
2. The victim opens that folder with an AI coding agent.
3. At startup, or before the first prompt, the agent runs ordinary background git commands like `git status` or `git diff` to learn the current branch and which files changed.
4. Refreshing Git's index for that command reads the repository's own `core.fsmonitor` setting and runs whatever it names.
5. The command executes outside the sandbox, as the user, with no approval prompt and nothing shown on screen — reaching SSH keys, cloud credentials in the environment, tokens in shell configuration, every repository on disk, and a foothold on the machine.

---

## 3. Timeline — Disclosure and Response

- 2026-06-26: Manifold reports the Claude Code `core.fsmonitor` path; closed as a duplicate of a report filed the same day.
- 2026-06-29: The `core.fsmonitor` path is fixed in Claude Code 2.1.196 (no separate advisory published).
- 2026-07-07: Manifold reports the Qwen Code flaw to Alibaba's security response centre; accepted.
- 2026-07-13: Manifold reports the Goose flaw.
- 2026-07-14: Manifold reports the Grok Build flaw; closed as a duplicate of a July 1 report xAI had closed as "informative."
- 2026-07-15: Manifold reports the Claude Code `ultrareview` path; closed as a duplicate of an internal ticket.
- 2026-07-20: Manifold reports the Hermes Agent flaw; six contact attempts across five channels go untriaged.
- 2026-09-01: Manifold re-confirms all eight findings on current releases and publishes "GitSpawn." Goose (1.44.0) and Cursor are patched; OpenAI publishes three CVEs for Codex the same day, also patched. Hermes Agent (0.21.0), Qwen Code (0.22.3), Grok Build (1.0.13), and Claude Code's `ultrareview` path (2.1.252) are confirmed still vulnerable.
- 2026-09-02: The Hacker News reports the findings. The same day, Hermes Agent lands a fix (GHSA-7x36-8jrh-v4pw).
- 2026-09-03: CVE-2026-71963 is published. The GitHub Security Advisory (GHSA-cc88-9pxf-j2wv) records the affected range as 0.18.2 through 0.21.0, fixed in commit f6234d0.
- 2026-09-12: Qwen Code lands a fix (guarding the git calls the agent issues on its own initiative against config-named helper programs). Shipped in v0.23.4 on September 14.

> On the nature of this disclosure: five of the eight findings overlapped with reports independently filed by other researchers, one on the same day. Manifold has withheld the specific config key behind the still-unpatched `ultrareview` path to avoid enabling abuse.

Response and industry activity since publication:

- **Goose**: maintainers assigned CVE-2026-72718 (CVSS 4.0 base score 7.0) and shipped a fix in 1.44.0.
- **Claude Code**: the `core.fsmonitor` path was fixed in 2.1.196 without a dedicated advisory; the `ultrareview` path remained confirmed vulnerable at 2.1.252. Anthropic has disclosed pre-trust execution issues before, and its June CVE-2026-55607 covers fsmonitor execution during worktree operations; security firm Sonar reported a related sink in April 2025 that was partially mitigated by reordering the startup sequence.
- **OpenAI**: published three CVEs for Codex CLI/Desktop the same day, including CVE-2026-19592, and shipped fixes, crediting three unrelated research groups.
- **Qwen Code**: Alibaba's security response centre accepted the report on July 7 but the flaw remained unpatched as of September 1. A fix landed on September 12 and shipped in v0.23.4 on September 14.
- **Grok Build**: xAI closed an earlier July 1 report as "informative" and closed Manifold's report as a duplicate of it; unpatched as of September 1, and no fix could be confirmed as of this writing.
- **Hermes Agent**: six outreach attempts across five channels went untriaged; CVE-2026-71963 was assigned by VulnCheck rather than the vendor. A fix landed on September 2 and the CVE was published on September 3 (GHSA-cc88-9pxf-j2wv).

None of the eight findings appear in the U.S. CISA Known Exploited Vulnerabilities catalog (version 2026.09.01, 1,687 entries), and no source reports active exploitation.

---

## 4. Why It Wasn't Stopped

This failure is not one vendor's implementation mistake, nor a flaw in the models themselves. **It is that the ordinary git operations an agent runs automatically at startup executed a repository's own configuration without verifying it first.** Detection worked: researchers reproduced all eight findings with recorded proof, two received CVEs, and five overlapped with reports independently filed elsewhere — found from more than one direction, which is precisely what makes this pattern visible rather than obscure. **What didn't work was a layer confirming, before that command ran, that executing a repository's own configuration was ever authorized.**

`core.fsmonitor` is a legitimate Git feature, not a bug — a performance setting for large repositories that Git reads from the repository's own `.git/config`. An agent running `git status` or `git diff` at startup to learn the current branch and changed files is unremarkable and correct behavior on its own. The problem is that this background call ran before the workspace-trust dialog was accepted, and on some agents before authentication, without stripping the repository's configuration. The approval mechanism existed; execution simply finished before it engaged.

This pattern was common to all seven agents. The vulnerability is not in the model or in anything novel — it sits in the ordinary subprocess an agent spawns at session startup to work out where it is. That is what makes this an industry-wide oversight rather than a single vendor's error.

> "The vulnerability is not in the model, or in anything new. It is in the ordinary plumbing underneath, the subprocess an agent spawns at session startup to work out where it is." — Manifold Security

---

## 5. What Proof Would Have Changed

If the party receiving a repository could verify its configuration and code provenance before execution, this path would not exist. Pre-action attestation requires that, before an agent spawns a subprocess, the claim "this repository's configuration comes from a verified publisher" be checked as evidence independent of the workspace-trust dialog or approval prompt. Without that proof, automatic execution against a repository carrying unverified configuration is denied by default.

Lemma's proposed design against this gap:

- **Pre-execution proof of code provenance**: let an agent cryptographically confirm, before reading a repository's commits or config files, that they trace back to a verified publisher or build pipeline.
- **Scoped authorization for subprocess execution**: constrain background git operations an agent runs at startup to an explicitly bounded set of trusted configuration values.
- **Deny-by-default for unverified config**: repository-local settings such as `.git/config` whose provenance cannot be proven are disabled by default before execution.

What this does not cover:

- **Fixing Git itself**: `core.fsmonitor` is legitimate functionality; Lemma does not change Git's implementation.
- **Vendor patching**: shipping and timing fixes remains each agent vendor's own responsibility.

This differs from post-hoc scanners and EDR (endpoint detection and response — security software that watches for unusual behavior on a device): EDR sees "familiar developer tooling doing familiar things" and needs time to recognize a known pattern. Pre-action attestation checks provenance before the action occurs. Detection and this layer are complementary, not substitutes — one finds abnormal behavior after the fact, the other confirms before the action that execution rests on verified provenance.

---

## 6. Sources

- **Manifold Security (primary, original research)**: "GitSpawn: A Single Flaw Lets Untrusted Repos Run Code in Claude Code, Codex, Cursor, and Grok" (2026-09-01) — <https://www.manifold.security/blog/ai-coding-agents-git-hijack>
- **The Hacker News (independent reporting)**: "Malicious .git Configs Can Make Claude, Codex, Cursor, and Other AI Agents Run Attacker Code" (2026-09-02, Swati Khandelwal) — <https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-r5pp-p5r8-466r" (Goose, CVE-2026-72718) — <https://github.com/aaif-goose/goose/security/advisories/GHSA-r5pp-p5r8-466r>
- **CVE.org (primary, vulnerability record)**: "CVE-2026-71963" (Hermes Agent, assigned by VulnCheck) — <https://www.cve.org/CVERecord?id=CVE-2026-71963>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-cc88-9pxf-j2wv" (Hermes Agent, CVE-2026-71963, published 2026-09-03) — <https://github.com/advisories/GHSA-cc88-9pxf-j2wv>
- **Sonar (independent analysis)**: "Arbitrary Code Execution in Claude Code" (April 2026, earlier report of a related sink) — <https://www.sonarsource.com/blog/claude-arbitrary-code-execution/>

References: On the relationship between detection and proof, see ["The Last Layer Left in AI-Era Cyber Defense"](/blog/detection-is-not-proof/). Design details: [Agent Authority](/pillars/#authority).

Patch status starts from Manifold Security's September 1, 2026 re-verification and is updated against the public record as of this writing (September 15, 2026): a GitHub Security Advisory for Hermes Agent, and the public repository history for Qwen Code. For Grok Build and Claude Code's `ultrareview` path, neither a vendor advisory nor a record of a fix could be confirmed.

