---
brief_no: 133
title: "同じ Pyodide サンドボックス脱出が 7 製品で再現されうることが示された — 「隔離されている」という前提が、独立に検証されていない"
title_en: "One Pyodide sandbox escape was shown to reproduce across seven products — the premise 'it's isolated' was never independently verified"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth, code-provenance]
incident_date: 2026-08-07
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["073-shadowmq-pickle-zmq-pattern", "094-cursor-duneslide-sandbox-escape", "109-servicenow-ai-platform-preauth-rce", "039-semantic-kernel-prompt-injection-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
version: "1.0"
og_lead_ja: "同一のPyodideサンドボックス脱出が7製品で再現、隔離の前提が未検証"
og_lead_en: "One Pyodide sandbox escape reproduced across seven products; isolation premise unverified"
gap_detected: "Detection can work. Dangerous module calls and anomalous process creation can be surfaced as a monitoring layer."
gap_missing: "The premise — 'it's isolated by the sandbox' — was never independently verified before execution."
gap_fix: "Before code runs with host privileges, independently verify that the isolation boundary actually holds."
---

## 1. TL;DR

At DEF CON 34 (August 2026), researchers showed that seven products using Pyodide (Python on WebAssembly) had **left a path out to the host while assuming that blocking dangerous modules made a sandbox**. Because `ctypes` and Emscripten-exported functions remained reachable, supposedly restricted Python could cross into the JavaScript host. The disclosures became four CVEs, spanning workflow automation through CI/CD. **What was missing was a layer that independently verifies, before code runs, the premise that it is isolated by the sandbox.**

## 2. What happened

- Cyera researchers Vladimir Tokarev and Saar Pearl reported a Pyodide sandbox escape common to seven products (talk: "Sandcastles, not Sandboxes"). Each blocked dangerous modules like `os` and `subprocess` to feign isolation, but did not account for `ctypes` and functions exported by Emscripten, from which restricted Python could cross out of CPython-in-WASM into the JS host.
- The disclosures became four CVEs, rated 8.3–9.9 in Cyera's own writeup.
- The host environment determines impact: on Node.js, filesystem/process/env APIs; in CI/CD, publishing tokens, signing keys, and source; in AI-agent environments, API credentials, internal services, and databases.

Principal targets:

1. **n8n** (workflow automation, CVE-2025-68668, CVSS 9.9): its Code node ran Python via Pyodide on Node.js; the escape could reach the n8n service process and credentials for connected integrations. n8n moved Python execution to an external runner.
2. **Grist** (spreadsheet/DB, CVE-2026-24002, CVSS 9.1): the runtime behind Python formulas.
3. **Cohere Terrarium** (sandboxed execution for AI-generated code, CVE-2026-61522, CVSS 9.3).
4. **Hugging Face smolagents** (AI-agent framework, CVE-2026-10613, CVSS 8.3).
5. Related concerns were also identified in langchain-sandbox, stlite, and cibuildwheel. Maintainer responses varied — architectural changes, archiving, and the position that isolation should be enforced at deployment.

## 3. Timeline — disclosure and response

- 2026-08-07 (DEF CON 34): Cyera presents the cross-product Pyodide sandbox escape, with four CVEs.
- After disclosure: n8n isolated Python execution to an external runner; other products' responses split across architectural change, archiving, and deployment-level mitigation.

> This Brief concerns a research demonstration, not real-world harm. "Reproducible across seven products" is a structural finding based on Cyera's presentation and four CVEs, and does not assert real damage at any product. n8n's CVE carries a 2025 number, but the cross-product picture was presented at DEF CON 34 (2026-08-07). CVSS scores here follow Cyera's own writeup. For CVE-2026-24002, NVD assigns 9.6 and the CNA (GitHub) 9.0, so the score differs by source. CVE-2026-61522 and CVE-2026-10613 were, at the time of writing, in neither NVD nor the GitHub Advisory Database.

Points and response:

- That responses split by product is itself the point: the premise "Python import restrictions = a complete boundary" was shared across multiple independent products.
- Severity is decided by the host: the same escape can reach signing keys in CI/CD or customer data in an AI-agent environment.

## 4. Why it wasn't stopped

The failure is not that some one product carried a bug of its own. **The premise — it is isolated by the sandbox — was never independently verified before code ran.** The same assumption was shared across seven products.

Blocking dangerous modules produces an apparent boundary. But the WASM that Pyodide runs on only protects its own linear memory; it does not close off capabilities the embedding environment intentionally exposes (`ctypes`, Emscripten functions). Supposedly restricted Python used those exposed capabilities to cross to the host. Dangerous module calls and anomalous process creation can be caught after the fact by monitoring. What was missing was the step before: verifying, before code runs, that this isolation boundary actually holds.

> Isolation means something different depending on whether it actually holds. The appearance of "we blocked the dangerous modules" is not the same as the fact of "it cannot cross to the host." A boundary is secured not by appearance but by independent verification.

This shares its structure with [Brief 073](/critical/briefs/073-shadowmq-pickle-zmq-pattern/), where the same unauthenticated-pickle implementation was copied across AI inference platforms, and [Brief 094](/critical/briefs/094-cursor-duneslide-sandbox-escape/), where a single instruction escaped the sandbox to run arbitrary code. In each, execution is not bound to whether the isolation boundary holds.

## 5. What proof would have changed

Proof-as-auth inserts, one step before code runs with host privileges, a layer that checks the isolation boundary actually holds. It does not look at whether dangerous modules were blocked. It makes it possible for the executing side to verify, independently and before execution commits, that this run sits inside the intended isolation boundary.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Pre-execution verification of the isolation boundary</strong>: immediately before untrusted code runs with host privileges, require proof that the run sits inside the intended isolation boundary — verifying "should be isolated" rather than trusting the appearance.</li>
<li><strong>Capability scope pinning</strong>: pin the capabilities the runtime can reach (filesystem, process, credentials) to the intended use, so an exposed secondary function does not become a crossing path.</li>
<li><strong>Selective disclosure of secrets</strong>: rather than passing CI/CD signing keys or an agent environment's API credentials straight into the runtime, present only the verification needed.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>Detecting dangerous module calls and anomalous process creation is the job of monitoring and scanners. This layer sits before that, making the isolation boundary verifiable.</li>
<li>Proof can show only that a run sat inside the intended boundary — not whether the code itself is benign.</li>
<li>Which boundary applies to which run is the operator's decision; this layer supplies the basis, not the decision.</li>
</ul>

The difference from your own execution logs is here: a log remains after the run, but it is not material for verifying, before the run, that it sat inside the isolation boundary.

Detection and this layer are complementary, not substitutes. The former catches dangerous calls after the fact; the latter makes it possible to verify, before execution commits, that a run sits inside the intended isolation boundary.

## 6. Sources

- **Cyera Research (primary, research)**: "Sandcastles, not Sandboxes: How One Architectural Flaw Exposed Seven Products" (DEF CON 34, 2026-08) — <https://www.cyera.com/research/sandcastles-not-sandboxes-how-one-architectural-flaw-exposed-seven-products>
- **NVD (primary, CVE)**: CVE-2025-68668 (n8n) — <https://nvd.nist.gov/vuln/detail/CVE-2025-68668> / CVE-2026-24002 (Grist) — <https://nvd.nist.gov/vuln/detail/CVE-2026-24002>
- **eSecurity Planet (independent)**: "DEF CON 34: One Pyodide Flaw Exposed Seven Products" (2026-08-10) — <https://www.esecurityplanet.com/threats/def-con-34-one-pyodide-flaw-exposed-seven-products/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

Maintainer remediation status varies by product.
