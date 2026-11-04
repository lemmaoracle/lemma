---
brief_no: 133
title: "Pyodide のサンドボックス脱出：同じ経路が複数の製品で再現されうると示された(Cyera の研究、DEF CON 34)"
title_en: "Pyodide sandbox escape: the same path was shown to be reproducible across multiple products (Cyera research, DEF CON 34)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth, code-provenance]
incident_date: 2026-08-07
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["073-shadowmq-pickle-zmq-pattern", "094-cursor-duneslide-sandbox-escape", "109-servicenow-ai-platform-preauth-rce", "039-semantic-kernel-prompt-injection-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Pyodide を使う 7 製品で同じサンドボックス脱出が再現されうると Cyera が発表"
og_lead_en: "Cyera says one Pyodide sandbox escape is reproducible across seven products"
layout: "report"
sections: "proof"
og_kicker_ja: "実行環境の脆弱性 · サンドボックス脱出"
og_kicker_en: "RUNTIME FLAW · SANDBOX ESCAPE"
og_headline_ja: "モジュールを禁じても、\nホストへ抜けうると報告。\n<accent>7 製品・CVE 4 件</accent>"
og_headline_en: "Researchers: blocking\nmodules left a way out.\n<accent>7 products, 4 CVEs</accent>"
key_figures:
  - value: "7"
    unit: "products"
    label: "Products using Pyodide where Cyera showed the same sandbox escape could be reproduced"
    tone: "alert"
  - value: "4"
    unit: "CVEs"
    label: "CVEs assigned through the disclosures, rated CVSS 8.3–9.9 in Cyera's own writeup"
  - value: "9.9"
    label: "CVSS of n8n's CVE-2025-68668 (per Cyera), covering Python execution in its Code node"
glossary:
  - term: "Pyodide"
    desc: "A runtime that runs CPython on WebAssembly (WASM). Products embed it to run Python written by users or by AI."
  - term: "ctypes and Emscripten functions"
    desc: "ctypes is the standard Python module for working with C functions and memory. Emscripten is the toolchain that compiles C/C++ to WebAssembly and exposes functions to the embedding environment. In Cyera's report, these two became the path out to the host."
insight:
  slug: "blocked-modules-not-a-boundary"
  label: "Treating blocked modules as a boundary"
  quote: "Unless what a runtime can reach is checked, before code runs with host privileges, against a decided scope rather than a blocklist, isolation passes as appearance only."
industries: ["developers", "ai"]
countries: ["global"]
controls:
  - slug: "limit-and-revoke"
    item: "Fix what the execution environment can reach (files, processes, credentials) to its intended use"
  - slug: "hold-unverified"
    item: "Stop a run before it starts unless it is confirmed to be inside the isolation boundary"
impact: "Shown to be reproducible across seven Pyodide-based products; four CVEs assigned"
takeaway: "Cyera showed that isolation built only on blocking dangerous modules could be escaped to the host through ctypes and Emscripten functions."
self_check: "Before running untrusted code, do you check which host capabilities its runtime can reach?"
---

## 1. Summary

According to Cyera's researchers, products using Pyodide (Python on WebAssembly) treated blocking dangerous modules such as `os` and `subprocess` as isolation, while `ctypes` and Emscripten-exported functions remained reachable. From there, supposedly restricted Python could cross out of CPython-in-WASM into the JavaScript host. This is a research demonstration, not real-world harm at any product. <strong>Unless what a runtime can reach is checked, before code runs with host privileges, against a decided scope rather than a blocklist, isolation passes as appearance only.</strong>

## 2. What got through

- **What got through**: Use of `ctypes` and Emscripten-exported functions from inside restricted Python. The products' blocklists did not account for them, and from there the code could cross into the JS host (as reported by Cyera's researchers).
- **What was stopped**: Imports of dangerous modules. The blocking worked, but on its own it did not form a boundary (Cyera).
- **What reached the receiving side**: In general, once code inside a sandbox reaches the host, whatever the host environment can do becomes the impact. Cyera says that means filesystem, process, and environment APIs on Node.js; publishing tokens, signing keys, and source in CI/CD; and API credentials, internal services, and databases in AI-agent environments.
- **Not disclosed**: Whether this path was actually exploited at any product. This Brief covers a research demonstration and does not assert real damage at any product.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before untrusted code runs with host privileges, which host capabilities its runtime can reach (files, processes, credentials, exposed functions) is checked against a scope decided outside the runtime, not against a list of blocked modules.

- **Who approves**: The operator who embeds and deploys the runtime, deciding which capabilities each piece of code may have. A setting that says "dangerous modules are blocked" is not an approval.
- **Where it is checked**: Immediately before code moves to execution with host privileges. What is checked is the set of capabilities the runtime exposes to the host, not whether imports are allowed. If anything beyond the decided scope is exposed, the run is held.
- **What is recorded**: Which code ran (or was held), under which scope, and when. Later, it shows what ran in which runtime.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before untrusted code runs with host privileges, what its runtime can reach against a decided scope, and keeping a record. Detection means researchers finding and reporting the escape path. Dates are those of CVE assignment, the talk, and coverage.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before code moves to execution, check which host capabilities the runtime can reach</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Shown able to cross to the host with dangerous modules still blocked<br>Four CVEs (CVSS 8.3–9.9, per Cyera)</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>Cyera presented it as a path common to seven products</div>
<div class="rx-g g1"><div class="t">2025</div><b>n8n's CVE-2025-68668 assigned</b></div>
<div class="rx-g g2"><div class="t">2026-08-07</div><b>Cyera presents at DEF CON 34</b></div>
<div class="rx-g g3"><div class="t">2026-08-10</div><b>eSecurity Planet reports it</b></div>
<div class="rx-g g4"><div class="t">After disclosure</div><b>n8n moves Python to an external runner</b></div>
</div>
</figure>

The blocking of dangerous modules worked. But the WASM that Pyodide runs on only protects its own linear memory; it does not close off capabilities the embedding environment intentionally exposes (Cyera). Dangerous calls and anomalous process creation can be caught afterwards by monitoring. What was missing is the layer before that, which checks what the runtime can reach. Cyera's report suggests that the premise "Python import restrictions = a boundary" was shared across multiple independent products. It has the same shape as [Brief 073](/critical/briefs/073-shadowmq-pickle-zmq-pattern/) (ShadowMQ), where the same dangerous implementation was copied across AI inference platforms, and [Brief 094](/critical/briefs/094-cursor-duneslide-sandbox-escape/) (Cursor), where a single instruction took the sandbox off: execution is not tied to a check of the isolation scope.

## 4. What Lemma does

**Lemma puts the pre-execution check immediately before untrusted code moves to execution with host privileges.** It does not build a sandbox or judge whether code is dangerous; before execution, it checks that the capabilities the runtime exposes to the host fall within the scope the operator decided.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Developers and organizations running user-written code in WebAssembly runtimes such as Pyodide, in workflow automation, spreadsheets, or CI/CD.
- **Industry · AI**: Organizations operating agent platforms that run AI-generated code inside a sandbox, with paths outside the runtime to API credentials and internal services.

### Current controls vs Lemma

The route in this case is the first column: crossing from restricted Python to the host. The second column compares what can be reached after crossing.

| Control | Crossing from restricted Python to the host (`ctypes`, Emscripten functions) | What can be reached after crossing (files, processes, credentials) |
| --- | --- | --- |
| Blocking dangerous modules (`os`, `subprocess`, etc.) | Not effective | Not relevant |
| Monitoring dangerous calls and anomalous process creation | Partial | Partial |
| Maintainer design changes (n8n moved Python execution to an external runner) | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

Blocking dangerous modules did not account for `ctypes` and Emscripten functions (Cyera), and what can be reached after crossing does not change with the blocklist. Monitoring catches dangerous calls and anomalous process creation afterwards; it does not act before the crossing. Maintainer responses split by product: n8n moved Python execution to an external runner, but there was also archiving and the position that isolation should be enforced at deployment, leaving a part to the deploying side. Lemma checks the capabilities the runtime exposes to the host, not whether imports are allowed, before execution. Signing keys and API credentials need not pass straight into the runtime; only what is needed can be handed over. A record of each run is also kept, so what ran in which runtime can be confirmed later.

Note: Lemma's check works only when it is built into the step that starts the runtime, and the allowed scope of capabilities is managed outside the runtime. If the capabilities a runtime exposes cannot be listed completely, or malicious code runs within the allowed scope, it can pass. Lemma does not change Pyodide or any product, and does not judge whether the code itself is benign. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that run untrusted code in a runtime

- Is the runtime's isolation also carried by a mechanism other than blocking dangerous modules (such as separation into another process or runner)?
- Do you hand that runtime only the signing keys and API credentials it needs?
- Have you checked how the maintainers of the products you use have responded (fixes, design changes, archiving), and decided what your deployment must cover?

## 5. Facts and timeline

- **Affected products**: Seven products using Pyodide (Python on WebAssembly). The principal ones are **n8n** (workflow automation, CVE-2025-68668, CVSS 9.9), **Grist** (spreadsheet/DB, CVE-2026-24002, CVSS 9.1), **Cohere Terrarium** (sandboxed execution for AI-generated code, CVE-2026-61522, CVSS 9.3), and **Hugging Face smolagents** (AI-agent framework, CVE-2026-10613, CVSS 8.3). Related concerns were also identified in langchain-sandbox, stlite, and cibuildwheel (Cyera).
- **Presented by**: Cyera researchers Vladimir Tokarev and Saar Pearl, in the DEF CON 34 talk "Sandcastles, not Sandboxes".
- **The researchers' report**: Each product blocked dangerous modules such as `os` and `subprocess` as its isolation, but did not account for `ctypes` and functions exported by Emscripten, from which code could cross out of CPython-in-WASM into the JS host.
- **In n8n (Cyera)**: The Code node runs Python via Pyodide on Node.js. The escape could reach the n8n service process and the credentials for connected integrations.
- **Scope of impact (Cyera)**: The host environment determines impact: on Node.js, filesystem/process/env APIs; in CI/CD, publishing tokens, signing keys, and source; in AI-agent environments, API credentials, internal services, and databases.

### Timeline

- **2025**: CVE-2025-68668 is assigned to the n8n flaw.
- **2026-08-07**: At DEF CON 34, Cyera presents a Pyodide sandbox escape common to seven products, with four CVEs.
- **2026-08-10**: eSecurity Planet reports on it.
- **After disclosure**: n8n moves Python execution to an external runner; other products' responses split.

> This Brief concerns a research demonstration, not real-world harm. "Reproducible across seven products" is the researchers' finding, based on Cyera's presentation and four CVEs, and does not assert real damage at any product. n8n's CVE carries a 2025 number, but the cross-product picture was presented at DEF CON 34 (2026-08-07). CVSS scores here follow Cyera's own writeup. For CVE-2026-24002, NVD assigns 9.6 and the CNA (GitHub) 9.0, so the score differs by source. CVE-2026-61522 and CVE-2026-10613 were, at the time of writing, in neither NVD nor the GitHub Advisory Database. What has not been disclosed does not mean there were no controls.

### After disclosure

- **n8n**: Moved Python execution to an external runner.
- **Other maintainers**: Responses split by product, across architectural changes, archiving, and the position that isolation should be enforced at deployment. Remediation status varies by product.

## 6. Sources

- **Cyera Research (primary, research)**: "Sandcastles, not Sandboxes: How One Architectural Flaw Exposed Seven Products" (DEF CON 34, 2026-08) — <https://www.cyera.com/research/sandcastles-not-sandboxes-how-one-architectural-flaw-exposed-seven-products>
- **NVD (primary, CVE)**: CVE-2025-68668 (n8n) — <https://nvd.nist.gov/vuln/detail/CVE-2025-68668> / CVE-2026-24002 (Grist) — <https://nvd.nist.gov/vuln/detail/CVE-2026-24002>
- **eSecurity Planet (independent)**: "DEF CON 34: One Pyodide Flaw Exposed Seven Products" (2026-08-10) — <https://www.esecurityplanet.com/threats/def-con-34-one-pyodide-flaw-exposed-seven-products/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
