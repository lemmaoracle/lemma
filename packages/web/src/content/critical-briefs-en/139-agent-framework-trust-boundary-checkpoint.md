---
brief_no: 139
title: "LangChain・LangGraph・CrewAI ほか：フレームワークの内部ロジックに、注入された内容が届く経路が示された(Check Point Research)"
title_en: "LangChain, LangGraph, CrewAI and more: Researchers showed how injected content can reach the trusted internal logic of agent frameworks (Check Point Research)"
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
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "脆弱性の開示 · エージェントフレームワーク"
og_kicker_en: "VULNERABILITY DISCLOSURE · AGENT FRAMEWORKS"
og_headline_ja: "6 つの主要\nフレームワークに、\n内部へ届く経路が 11 件。\n<accent>実地悪用の報告はない</accent>"
og_headline_en: "Six major agent frameworks,\n11 paths into their internals.\n<accent>No exploitation reported.</accent>"
key_figures:
  - value: "11"
    unit: "flaws"
    label: "Vulnerabilities in six agent frameworks that Check Point Research presented at Black Hat USA 2026. No in-the-wild exploitation has been reported"
    tone: "alert"
  - value: "6"
    unit: "frameworks"
    label: "LangChain, LangGraph, CrewAI, AutoGen, Microsoft Agent Framework and Google ADK"
  - value: "2025-11-19 → 2026-08-05"
    label: "From disclosing the three LangGraph issues to LangChain to presenting all 11 findings across six frameworks"
glossary:
  - term: "Checkpoint"
    desc: "A feature that saves an agent's mid-run state and loads it later to continue (rewind) from there."
  - term: "Deserialization"
    desc: "Turning saved data back into something a program can use. If the value being loaded is unsafe, its contents can be executed."
insight:
  slug: "internal-input-unchecked"
  label: "Provenance of values reaching internal logic"
  quote: "A value that reaches a framework's internal state or an exposed endpoint can pass straight into trusted processing unless its provenance and authorization are checked."
industries: ["ai", "developers"]
countries: ["global"]
controls:
  - slug: "check-origin"
    item: "Check the origin and integrity of internal state, such as checkpoints, before loading it"
  - slug: "verify-entry"
    item: "Check the authorization state of endpoints a deployment exposes, instead of relying on defaults"
takeaway: "No step has been disclosed that checks the provenance and authorization of a value before internal state is loaded or an endpoint is exposed."
self_check: "Before an agent framework loads internal state or exposes an endpoint, can you check the value's provenance and authorization?"
---

## 1. Summary

Researchers showed how injected content can reach trusted processing inside agent frameworks, such as loading saved state and the endpoints a deployment exposes. All of them are vulnerability classes whose fixes have been known for two decades: insecure deserialization, SSRF and path traversal. There is no report of in-the-wild exploitation. <strong>A value that reaches a framework's internal state or an exposed endpoint can pass straight into trusted processing unless its provenance and authorization are checked.</strong>

## 2. What got through

- **What got through**: Injected content passing into trusted internal logic. In LangGraph, researchers showed filter input to the checkpoint feature being inserted straight into a SQL query (CVE-2025-67644), unsafe msgpack deserialization when a checkpoint is loaded (CVE-2026-28277), and values interpolated into queries when Redis is the checkpoint store (CVE-2026-27022). In Microsoft Agent Framework, a checkpoint payload planted by one user executed when a different user rewound their own session. In Google ADK, a development HTTP API hidden from the app listing had no authentication by default, and on a default Cloud Run deployment it was reachable without credentials.
- **What reached the receiving side**: In general, a framework's internal logic accepts the state it loads, and calls to an exposed endpoint, as trusted operations. From the loading side or the receiving side, it cannot tell whether a value came from an authorized run or from input an attacker can control.
- **Not disclosed**: Whether any in-the-wild exploitation occurred (none is reported). For CVE-2026-28277, the vendor advisory presupposes privileged write access to stored checkpoints and states that no practical exploitation path in existing deployments is known. The chained remote code execution is Check Point Research's account.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the side that loads internal state or exposes an endpoint checks, before running it, the value's provenance and authorization against a record.

- **Who approves**: For state, the owner of the authorized run that wrote it. For an exposed endpoint, the person deploying it. The approval is given apart from the bytes of the state being loaded and from the deploy command's defaults.
- **Where it is checked**: Just before loading a checkpoint or a session. Just before opening an endpoint that a deployment exposes.
- **What is recorded**: Which state was loaded as coming from which run, and which endpoint was exposed under whose authorization. Kept apart from the framework.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking provenance and authorization, before loading state or exposing an endpoint, and keeping a record. Detection means finding and reporting a vulnerability. The dates below are the months of disclosure, fix release and presentation, as confirmed and published by each party.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before loading, check the state's provenance and authorization</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Paths were shown by which injected content<br>reaches loaded state and exposed endpoints</span></div>
<div class="rx-zone det"><b>Detection · researchers found and disclosed</b>Searched systematically, reported by responsible disclosure</div>
<div class="rx-g g1"><div class="t">2025-11</div><b>Three LangGraph issues disclosed</b></div>
<div class="rx-g g2"><div class="t">2026-02</div><b>Last fix released (langgraph 1.0.10)</b></div>
<div class="rx-g g3"><div class="t">2026-06</div><b>Technical write-up published</b></div>
<div class="rx-g g4"><div class="t">2026-08</div><b>All 11 presented at Black Hat</b></div>
</div>
</figure>

Detection worked. But a step that checks, at load time, the provenance of what the internal logic receives is not visible in the disclosures. A value marked "safe" by a framework or harness and then executed by a later stage with greater privilege recurs in [Brief 128](/critical/briefs/128-coding-agent-harness-authority-gap/) and [Brief 133](/critical/briefs/133-pyodide-sandbox-escape-seven-products/). A separate incident involving the same LangGraph checkpoint is covered in [Brief 058](/critical/briefs/058-langgraph-checkpoint-rce/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before a framework loads internal state or exposes an endpoint.** It does not look for the vulnerability itself; it checks the value's provenance and authorization against a record before the operation runs.

### Industries and operations to watch

- **Industry · AI & development**: Organizations building agents on agent frameworks such as LangChain.
- **Operation · Saving agent state and deploying**: Saving mid-run state with checkpoints and loading it back. Exposing an agent's endpoint with a deploy command.

### Current controls vs Lemma

The routes in this case are two: column 1 (loading internal state) and column 2 (calling an endpoint that a deployment exposes).

| Control | Loading internal state | Calling an exposed endpoint |
| --- | --- | --- |
| Applying the fixed version | Effective | Partial |
| Researcher testing and responsible disclosure | Partial | Partial |
| Audit logs after the fact | Partial | Not relevant |
| Exposing with default settings | Not relevant | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective |

Applying a fixed version closes the vulnerability that was shown. LangChain fixed all three LangGraph issues; Google shipped only a partial fix. Researcher testing and responsible disclosure reduce the number of paths, but do not stop a load before the next vulnerability class is reintroduced. Audit logs remain after a checkpoint is loaded, but are not material for deciding at load time whether it should have been loaded. Exposing with defaults left Google ADK reachable without credentials. Lemma checks the state's provenance and whether it was tampered with before loading, and checks an endpoint's authorization state instead of relying on defaults.

Note: Lemma's check works only when it is built into state loading and endpoint exposure, and the records of a state's origin and of authorization are managed apart from the framework. What the check can show is the provenance and integrity of the state being loaded, not whether the content an authorized run wrote was appropriate. It does not detect or fix individual CVEs, and does not prevent prompt injection from occurring. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations using agent frameworks

- Do you check the origin of internal state such as checkpoints, and whether it was tampered with, before loading it?
- Do you check the authorization state of endpoints a deployment exposes, instead of relying on defaults?
- Do you treat the points where attacker-controllable input reaches query construction or deserialization as outside the framework's trusted logic?

## 5. Facts and timeline

- **Researchers**: Check Point Research's Yarden Porat and Shahar Tal spent a year trying to break the frameworks enterprises build on, and presented 11 vulnerabilities across six of them at Black Hat USA 2026 (2026-08-05). The targets were LangChain, LangGraph, CrewAI, AutoGen, Microsoft Agent Framework and Google ADK, open-source and vendor frameworks widely used to build agents.
- **Real-world harm**: There is no report of in-the-wild exploitation. All findings came from researcher discovery and responsible disclosure; bounties were paid on the Microsoft and Google findings.
- **The three LangGraph issues**: Responsibly disclosed to LangChain in November 2025, with fixes released between December 2025 and February 2026 (advisories followed each release by days to a week). The Black Hat talk gathered those and the rest into a single shape.
- **The chain the researchers showed (LangGraph)**: (1) In the persistence layer (checkpoint feature), filter input to `get_state_history()` is inserted directly into a SQL query, enabling SQL injection on the SQLite side (CVE-2025-67644; NVD 7.8, GitHub 7.3; fixed in langgraph-checkpoint-sqlite 3.0.1). The cause is that filter *keys*, not just values, are interpolated into an f-string without validation. The vendor advisory adds that where an endpoint lets end users specify arbitrary filter keys, those users likely already have legitimate access to query the checkpoint database, in which case this may not constitute a privilege escalation. (2) The same checkpoint-loading path carries unsafe msgpack deserialization (CVE-2026-28277; NVD 7.2, GitHub 6.8; pip `langgraph` 1.0.9 and prior, fixed in 1.0.10). Check Point describes (1) and (2) chaining into remote code execution. The vendor advisory frames it as a "post-exploitation / defense-in-depth" issue that presupposes privileged write access to checkpoint bytes at rest, and states that LangGraph is not aware of a practical exploitation path in existing deployments. (3) Deployments using Redis as the checkpoint store carry the same injection class into Redis: filter keys and values are interpolated into RediSearch queries without escaping, allowing intended access controls to be bypassed (CVE-2026-27022; GitHub 6.5; fixed in npm `@langchain/langgraph-checkpoint-redis` 1.0.2).
- **The chain the researchers showed (Microsoft Agent Framework)**: Insecure deserialization in the checkpoint feature allowed a payload planted by one user to execute when a different user rewound their own session, granting the attacker a shell (found pre-GA, so no CVE was assigned).
- **The chain the researchers showed (Google ADK)**: A built-in development-assistant HTTP API, hidden from the app listing, has no authentication by default. An attacker opens a session, asks ADK to write an agent whose Python code runs at import time, then asks the server to run it; the code executes the moment the file is imported. `adk deploy cloud_run` publishes the same API, so on a default Cloud Run deployment it is reachable without credentials and reaches the environment's API keys and the container's GCP service account (no CVE assigned).
- **The researchers' view**: "Our research shows a deeper failure: in many agentic frameworks, prompt-controlled content can cross the boundary into trusted framework logic itself." (Yarden Porat and Shahar Tal, in the write-up accompanying their Black Hat talk). "A bug in an agent framework isn't a bug in one product — it's a bug in the layer a whole category of AI apps runs on. And the agent needs no dangerous tools to be turned against you: reading the wrong document is enough." (Shahar Tal, to The Register).

### Timeline

- **2025-11-19**: Check Point Research discloses the three LangGraph issues (CVE-2025-67644, CVE-2026-28277, CVE-2026-27022) to LangChain.
- **2025-12-09**: langgraph-checkpoint-sqlite 3.0.1 fixing CVE-2025-67644 is published to PyPI (advisory 12-10, NVD entry 12-11).
- **2026-02-05**: @langchain/langgraph-checkpoint-redis 1.0.2 fixing CVE-2026-27022 is published to npm (advisory 02-18, NVD entry 02-20).
- **2026-02-27**: pip langgraph 1.0.10 fixing CVE-2026-28277 is published (the advisory, GHSA-g48c-2wqr-h844, follows on 03-05).
- **2026-06-11**: Check Point Research publishes its technical write-up of the three LangGraph issues.
- **2026-08-05**: The full set of 11 findings across six frameworks is presented at Black Hat USA 2026. The Register (Jessica Lyons) reports the technical detail the same day.

> The Microsoft Agent Framework and Google ADK findings carry no CVE number; for those two, this brief relies on Check Point Research's disclosure and independent reporting (The Register). None of the three CVEs has a report of in-the-wild exploitation. Check Point Research itself notes that other researchers independently discovered CVE-2025-67644 and CVE-2026-28277. The disclosure timeline on Check Point's blog labels the msgpack issue CVE-2026-28227, but that identifier belongs to a different product (Discourse); the correct one is CVE-2026-28277. This Brief does not blame any vendor. What has not been disclosed does not mean there were no controls.

### After disclosure

- **LangChain**: Fixed all three LangGraph issues (langgraph-checkpoint-sqlite 3.0.1+, langgraph 1.0.10+, @langchain/langgraph-checkpoint-redis 1.0.2+). Its managed cloud offering (LangSmith Deployment, formerly LangGraph Platform) runs PostgreSQL, and so falls outside the SQLite/Redis path affected here.
- **Microsoft**: Acknowledged the finding, paid a $10,000 bounty, and fixed it. No CVE was issued because the framework was not generally available at the time. The company said it "released protections to harden the Agent Framework and prevent the concrete exploitation path demonstrated in the proof of concept," and that it "updated the specific checkpoint file with additional language to define the security boundary."
- **Google**: Initially declined to classify the behavior as a vulnerability, eventually shipped only a partial fix, issued no CVE, and paid a $3,133.70 bounty.

## 6. Sources
- **The Register (independent, first-hand interviews)**: Jessica Lyons, "Prompt injection isn't the bug, AI agent frameworks are" (2026-08-05) — <https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585>
- **Check Point Research (primary, research)**: Yarden Porat, "From SQLi to RCE — Exploiting LangGraph's Checkpointer" (2026-06-11) — <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **GitHub Security Advisories (primary, vendor)**: GHSA-g48c-2wqr-h844 (CVE-2026-28277; pip langgraph <= 1.0.9, fixed in 1.0.10) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844> / GHSA-9rwj-6rc7-p77c (CVE-2025-67644) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c> / GHSA-5mx2-w598-339m (CVE-2026-27022) — <https://github.com/langchain-ai/langgraphjs/security/advisories/GHSA-5mx2-w598-339m>
- **NVD (primary, CVE)**: CVE-2025-67644 — <https://nvd.nist.gov/vuln/detail/CVE-2025-67644> / CVE-2026-28277 — <https://nvd.nist.gov/vuln/detail/CVE-2026-28277> / CVE-2026-27022 — <https://nvd.nist.gov/vuln/detail/CVE-2026-27022>
- **Tenable (independent analysis)**: CVE-2025-67644 — <https://www.tenable.com/cve/CVE-2025-67644>

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)
