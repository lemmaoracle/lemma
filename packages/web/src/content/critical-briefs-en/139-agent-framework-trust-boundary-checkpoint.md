---
brief_no: 139
title: "LangChain・LangGraph・CrewAI など 6 つのエージェントフレームワークで 11 件の脆弱性が開示された — 注入された内容が、信頼された内部ロジックへ渡る前に確かめられていない"
title_en: "Eleven vulnerabilities were disclosed across six agent frameworks including LangChain, LangGraph, and CrewAI — injected content is never checked before it crosses into trusted framework logic"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [code-provenance]
incident_date: 2026-08-05
published: 2026-09-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["128-coding-agent-harness-authority-gap", "133-pyodide-sandbox-escape-seven-products", "039-semantic-kernel-prompt-injection-rce", "058-langgraph-checkpoint-rce"]
status: published
version: "1.0"
og_lead_ja: "LangChain・LangGraph ほか 6 フレームワークに 11 件の脆弱性"
og_lead_en: "11 flaws across six major agent frameworks (Check Point)"
---

## 1. TL;DR

At Black Hat USA 2026 on August 5, 2026, Check Point Research presented 11 vulnerabilities across six agent frameworks, among them LangChain, LangGraph, and CrewAI. The techniques are classes whose fixes have been known for two decades — insecure deserialization, SSRF, path traversal. There is no report of in-the-wild exploitation; every finding came from researcher discovery and responsible disclosure. Detection worked. **What was missing was a layer that independently verifies injected content before it crosses into the framework's own trusted internal logic.**

## 2. What happened

- Check Point Research's Yarden Porat and Shahar Tal spent a year trying to break the frameworks enterprises build on, and presented 11 vulnerabilities across six of them at Black Hat USA 2026 (2026-08-05).
- The targets were LangChain, LangGraph, CrewAI, AutoGen, Microsoft Agent Framework, and Google ADK — open-source and vendor frameworks widely used to build agents.
- There is no report of in-the-wild exploitation. All findings came from researcher discovery and responsible disclosure; bounties were paid on the Microsoft and Google findings.
- The three LangGraph issues were responsibly disclosed to LangChain in November 2025, with fixes released between December 2025 and February 2026 (advisories followed each release by days to a week). The Black Hat talk gathered those and the rest into a single shape.

The attack can be assembled as follows.

1. In LangGraph's persistence layer (checkpoint feature), filter input to `get_state_history()` is inserted directly into a SQL query, enabling SQL injection on the SQLite side (CVE-2025-67644; NVD 7.8, GitHub 7.3; fixed in langgraph-checkpoint-sqlite 3.0.1). The cause is that filter *keys*, not just values, are interpolated into an f-string without validation. The vendor advisory adds that where an endpoint lets end users specify arbitrary filter keys, those users likely already have legitimate access to query the checkpoint database, in which case this may not constitute a privilege escalation.
2. The same checkpoint-loading path carries unsafe msgpack deserialization (CVE-2026-28277; NVD 7.2, GitHub 6.8; pip `langgraph` 1.0.9 and prior, fixed in 1.0.10). Check Point describes 1 and 2 chaining into remote code execution. **The vendor advisory, however, frames it as a "post-exploitation / defense-in-depth" issue that presupposes privileged write access to checkpoint bytes at rest, and states that LangGraph is not aware of a practical exploitation path in existing deployments.**
3. Deployments using Redis as the checkpoint store carry the same injection class into Redis (CVE-2026-27022; GitHub 6.5; fixed in npm `@langchain/langgraph-checkpoint-redis` 1.0.2). Filter keys and values are interpolated into RediSearch queries without escaping, allowing intended access controls to be bypassed.
4. In Microsoft Agent Framework, insecure deserialization in the checkpoint feature allowed a payload planted by one user to execute when a different user rewound their own session, granting the attacker a shell (found pre-GA, so no CVE was assigned).
5. In Google ADK, a built-in development-assistant HTTP API — hidden from the app listing — has no authentication by default. An attacker opens a session, asks ADK to write an agent whose Python code runs at import time, then asks the server to run it; the code executes the moment the file is imported. `adk deploy cloud_run` publishes the same API, so on a default Cloud Run deployment it is reachable without credentials and reaches the environment's API keys and the container's GCP service account (no CVE assigned).

## 3. Timeline — disclosure and response

- 2025-11-19: Check Point Research discloses the three LangGraph issues (CVE-2025-67644, CVE-2026-28277, CVE-2026-27022) to LangChain.
- 2025-12-09: langgraph-checkpoint-sqlite 3.0.1 fixing CVE-2025-67644 is published to PyPI (advisory 12-10, NVD entry 12-11).
- 2026-02-05: @langchain/langgraph-checkpoint-redis 1.0.2 fixing CVE-2026-27022 is published to npm (advisory 02-18, NVD entry 02-20).
- 2026-02-27: pip langgraph 1.0.10 fixing CVE-2026-28277 is published (the advisory, GHSA-g48c-2wqr-h844, follows on 03-05).
- 2026-06-11: Check Point Research publishes its technical write-up of the three LangGraph issues.
- 2026-08-05: The full set of 11 findings across six frameworks is presented at Black Hat USA 2026. The Register (Jessica Lyons) reports the technical detail the same day.

> The Microsoft Agent Framework and Google ADK findings carry no CVE number; for those two, this brief relies on Check Point Research's disclosure and independent reporting (The Register). None of the three CVEs has a report of in-the-wild exploitation. Check Point Research itself notes that other researchers independently discovered CVE-2025-67644 and CVE-2026-28277. The disclosure timeline on Check Point's blog labels the msgpack issue CVE-2026-28227, but that identifier belongs to a different product (Discourse); the correct one is CVE-2026-28277.

Response and developments:

- LangChain fixed all three LangGraph issues (langgraph-checkpoint-sqlite 3.0.1+, langgraph 1.0.10+, @langchain/langgraph-checkpoint-redis 1.0.2+).
- Microsoft acknowledged the finding, paid a $10,000 bounty, and fixed it. No CVE was issued because the framework was not generally available at the time. The company said it "released protections to harden the Agent Framework and prevent the concrete exploitation path demonstrated in the proof of concept," and that it "updated the specific checkpoint file with additional language to define the security boundary."
- Google initially declined to classify the behavior as a vulnerability, eventually shipped only a partial fix, issued no CVE, and paid a $3,133.70 bounty.
- LangChain's managed cloud offering (LangSmith Deployment, formerly LangGraph Platform) runs PostgreSQL, and so falls outside the SQLite/Redis path affected here.

## 4. Why it wasn't stopped

This incident's failure is neither that the bugs were hard to find nor that fixes were slow. **Vulnerability classes with fixes known for two decades — insecure deserialization, SSRF, path traversal — were reintroduced into the frameworks' own internal logic (state management, checkpoint loading, built-in APIs), with no layer independently verifying the provenance and integrity of what crossed into them.**

Detection worked. Check Point Research found the issues systematically — two of them reached independently by other researchers — reported them through responsible disclosure, and most vendors fixed them. What was missing was not a way to prevent prompt injection itself, but a layer that independently verifies injected content before it crosses into the framework's trusted internal logic: state persistence, session rewind, deployment commands.

> "Our research shows a deeper failure: in many agentic frameworks, prompt-controlled content can cross the boundary into trusted framework logic itself." — Yarden Porat and Shahar Tal, in the write-up accompanying their Black Hat talk
>
> "A bug in an agent framework isn't a bug in one product — it's a bug in the layer a whole category of AI apps runs on. And the agent needs no dangerous tools to be turned against you: reading the wrong document is enough." — Shahar Tal, to The Register

Google ADK's handling sharpens the gap further. The company initially declined to classify the behavior as a vulnerability at all, and its eventual fix was only partial: found, but still not treated as a boundary. The same shape — a value marked "safe" by a framework or harness that a later stage then executes with greater privilege — recurs in [Brief 128](/critical/briefs/128-coding-agent-harness-authority-gap/) and [Brief 133](/critical/briefs/133-pyodide-sandbox-escape-seven-products/). A separate incident involving the same LangGraph checkpoint is covered in [Brief 058](/critical/briefs/058-langgraph-checkpoint-rce/).

## 5. What proof would have changed

Proof before the action replaces "did the framework treat this value as safe?" with "could this value's provenance and integrity be independently verified?" as the basis for running internal logic. It does not eliminate the vulnerability classes. It keeps injected content off the trusted path even where they remain.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Provenance proof for state</strong>: before loading framework internal state (checkpoints, sessions), independently verify and prove that it originates from an authorized run and has not been tampered with.</li>
<li><strong>Authorization check for what gets published</strong>: independently confirm the authorization state of the endpoints created by deploy and publish commands, rather than relying on defaults.</li>
<li><strong>Treat the crossing as outside the boundary</strong>: treat the point where attacker-controllable input reaches query construction or deserialization as outside the framework's trusted logic.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not detect or fix the individual CVEs. That is the researchers' and the vendors' work.</li>
<li>It does not prevent prompt injection from occurring; it starts from the researchers' own premise — design for it happening.</li>
<li>Proof can show the provenance and integrity of the state being loaded, not whether the content an authorized run wrote was appropriate.</li>
</ul>

The difference from your own audit logs is here: a log remains after a checkpoint is loaded, but it is not material for deciding, at load time, whether that checkpoint should have been loaded.

Detection and this layer are complementary, not substitutes. The former finds vulnerability classes and reduces the number of paths; the latter makes "internal logic does not receive a value until its provenance is verified" something you can check before the next class is reintroduced.

## 6. Sources

- **The Register (independent, first-hand interviews)**: Jessica Lyons, "Prompt injection isn't the bug, AI agent frameworks are" (2026-08-05) — <https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585>
- **Check Point Research (primary, research)**: Yarden Porat, "From SQLi to RCE — Exploiting LangGraph's Checkpointer" (2026-06-11) — <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **GitHub Security Advisories (primary, vendor)**: GHSA-g48c-2wqr-h844 (CVE-2026-28277; pip langgraph <= 1.0.9, fixed in 1.0.10) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844> / GHSA-9rwj-6rc7-p77c (CVE-2025-67644) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c> / GHSA-5mx2-w598-339m (CVE-2026-27022) — <https://github.com/langchain-ai/langgraphjs/security/advisories/GHSA-5mx2-w598-339m>
- **NVD (primary, CVE)**: CVE-2025-67644 — <https://nvd.nist.gov/vuln/detail/CVE-2025-67644> / CVE-2026-28277 — <https://nvd.nist.gov/vuln/detail/CVE-2026-28277> / CVE-2026-27022 — <https://nvd.nist.gov/vuln/detail/CVE-2026-27022>
- **Tenable (independent analysis)**: CVE-2025-67644 — <https://www.tenable.com/cve/CVE-2025-67644>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

For CVE-2026-28277, the vendor advisory frames the issue as defense-in-depth presupposing privileged write access to stored checkpoints, and states that no practical exploitation path in existing deployments is known. The chained execution is Check Point Research's account.
