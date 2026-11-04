---
brief_no: 39
title: "Semantic Kernel：プロンプトインジェクションが、ホストでのコード実行に至りえた(Microsoft の開示)"
title_en: "Semantic Kernel: prompt injection could lead to code execution on the host (Microsoft disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "code-provenance"]
incident_date: 2026-05-07
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "003-starlette-badhost", "037-agent-config-auto-execution", "047-openclaw-agent-phishing"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Microsoft が Semantic Kernel の 2 件の脆弱性を開示し、修正版を出した。プロンプトインジェクションが、ホストでのコード実行や任意のファイルの書き込みに至りえた"
og_lead_en: "Microsoft disclosed and fixed two Semantic Kernel vulnerabilities through which prompt injection could lead to code execution or arbitrary file writes on the host"
og_kicker_ja: "脆弱性の開示 · AI エージェントの基盤"
og_kicker_en: "VULNERABILITY · AI AGENT FRAMEWORK"
og_headline_ja: "注入された一つの指示が\nホストでのコード実行に\n至りうると Microsoft。\n<accent>CVSS 10.0・2 件を修正</accent>"
og_headline_en: "One injected prompt could\nrun code on the host,\nMicrosoft discloses.\n<accent>CVSS 10.0, two CVEs fixed</accent>"
key_figures:
  - value: "10.0"
    label: "CVSS of CVE-2026-25592 (.NET SDK). Through an inadvertently exposed function, it could lead to arbitrary file writes and sandbox escape"
    tone: "alert"
  - value: "2"
    label: "Vulnerabilities Microsoft disclosed on 2026-05-07, one each in the .NET SDK and the Python SDK"
  - value: "27,000+"
    label: "GitHub stars for Semantic Kernel, an AI agent framework widely used in enterprises"
glossary:
  - term: "Semantic Kernel"
    desc: "Microsoft's AI agent framework. The LLM moves work forward by calling functions (plugins) the developer provides. It has .NET and Python SDKs."
  - term: "KernelFunction attribute"
    desc: "An attribute in the .NET SDK that makes a function callable by the LLM. A function carrying it can be called through model output."
  - term: "Prompt injection"
    desc: "A technique that slips commands into documents, search results or external data the AI reads, so the AI treats them as instructions."
insight:
  slug: "model-output-drives-function-call"
  label: "Function calls decided directly by model output"
  quote: "Unless the functions an agent calls and their arguments are checked before execution against a permitted scope managed apart from the model's output, instructions slipped into the input become operations on the host."
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "Execute an AI-invoked function only after confirming the call and its parameters are within authorized scope"
attack_method: "ai-misuse"
takeaway: "Microsoft disclosed that the functions and arguments an LLM could call were not checked before execution, so an injected instruction could lead to code execution on the host."
self_check: "Before an AI agent executes a function, do you check that the function and its arguments are within the permitted scope, apart from the model's output?"
countries: ["global"]
---

## 1. Summary

According to Microsoft, in the .NET SDK a file-download function was inadvertently exposed so the LLM could call it, and the model largely decided the destination path. In the Python SDK, in a configuration using the search plugin under default settings, a single crafted prompt could reach code execution on the host. Both share one point: model output, which instructions slipped into the input can sway, could directly drive functions that touch the host. Fixed versions were provided on the day of disclosure. <strong>Unless the functions an agent calls and their arguments are checked before execution against a permitted scope managed apart from the model's output, instructions slipped into the input become operations on the host.</strong>

## 2. What got through

- **What got through**: Calls to host-touching functions driven by LLM output. According to Microsoft, in the .NET SDK (CVE-2026-25592) `DownloadFileAsync` was inadvertently exposed as a `[KernelFunction]` the LLM could call directly. The destination path (`localFilePath`) was almost entirely under model control, with virtually no path validation. In the Python SDK (CVE-2026-26030), when the In-Memory Vector Store was used as the backend of the Search Plugin with default filter behavior, and an attacker had a prompt-injection path into the agent's input, a single crafted prompt could reach code execution on the host.
- **What reached the receiving side**: In general, an agent framework executes the function the model chose, with the arguments the model decided, as is. According to Microsoft, the .NET SDK issue could reach arbitrary file writes and sandbox escape, and the Python SDK issue could reach code execution on the host.
- **Not disclosed**: Cases of exploitation in the wild and any resulting harm. The number of affected users.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an agent executes a function, it checks that the function may be called in this context and that its arguments are within the permitted scope, apart from the model's output.

- **Who approves**: The developers and operators who build the agent in. They decide, apart from the model's output, the list of functions the LLM may call and the scope of each one's arguments (such as which paths may be written). Operations outside that scope are approved by a person.
- **Where it is checked**: Just before the framework moves the function the model chose into execution. It checks that the function is on the permitted list and the arguments are within the decided scope, and does not execute calls that cannot be checked.
- **What is recorded**: Which function was called, with which arguments, under which permission (or was stopped). Kept apart from the agent, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an agent executes a function, that the function and its arguments are within the permitted scope, and keeping a record. Detection means finding, disclosing and fixing vulnerabilities. The dates are when the issues were disclosed and fixed, not when the routes were used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before executing a function, check that the function and its arguments are within the permitted scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Injected instructions could get<br>host-touching functions called</span></div>
<div class="rx-zone det"><b>Detection · Microsoft disclosed and fixed it</b>Vulnerability disclosure, fixed versions</div>
<div class="rx-g g1"><div class="t">05-07</div><b>.NET SDK CVE-2026-25592 disclosed</b></div>
<div class="rx-g g2"><div class="t">05-07</div><b>Python SDK CVE-2026-26030 disclosed</b></div>
<div class="rx-g g3"><div class="t">05-07</div><b>Fixed in .NET 1.71.0</b></div>
<div class="rx-g g4"><div class="t">05-07</div><b>Fixed in Python 1.39.4</b></div>
</div>
</figure>

Vulnerability disclosure and the fixed versions worked, and the two known routes were closed. What did not work was the layer before that, which checks the function and arguments the LLM chose against the permitted scope before execution. In that the design of agent infrastructure turns external input into privileged execution, this matches [Brief 025, where MCP's standard design became a path for RCE](/critical/briefs/025-mcp-stdio-config-to-command-rce/), [Brief 027 on LibreChat](/critical/briefs/027-librechat-mcp-url-secrets/) and [Brief 003 on Starlette / BadHost](/critical/briefs/003-starlette-badhost/); in that the agent's action is not tied to a check before the action, it connects with [Brief 037, where a repository-bundled config was auto-executed](/critical/briefs/037-agent-config-auto-execution/) and [Brief 047 on OpenClaw](/critical/briefs/047-openclaw-agent-phishing/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before the agent framework moves a function into execution.** It does not look for prompt injection; it checks the function and arguments the model chose, before execution, against a permitted scope managed apart from the model's output.

### Industries and operations to watch

- **Industry · AI**: Organizations that, on an agent framework such as Semantic Kernel, let the LLM call functions touching file operations or code execution.
- **Industry · Developers**: Development teams building systems in which the agent reads input an attacker could write to, such as documents, search results or external data. The framework's default settings and the attribute that makes a function callable become, as is, the scope the LLM can call.

### Current controls vs Lemma

This incident's .NET SDK route falls in columns 1 and 2, and the Python SDK route in column 3.

| Control | Calling a function never meant to be exposed | Out-of-scope arguments to a callable function (such as the destination path) | Execution through a callable function's default processing (search filter) |
| --- | --- | --- | --- |
| Updating to the fixed versions | Partial | Partial | Partial |
| Minimizing the functions exposed to the LLM | Effective | Not relevant | Not relevant |
| Strictly validating arguments (such as paths) | Not relevant | Effective | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

Updating to the fixed versions closes the known routes, but if the next exposure happens through another function or another configuration, the same shape remains. Minimizing exposed functions and validating arguments are controls discussed as requirements for agent infrastructure, narrowing columns 1 and 2 respectively. Lemma checks the function the model chose against the permitted list, and its arguments against the decided scope, before execution, so a call to a function not on the list, or a write to a path outside the scope, stops before it runs. On the other hand, if a permitted function is called with in-scope arguments and the function's internal processing has a flaw, the check matches. How well it works depends on how finely the argument scope can be decided, so column 3 is marked partial.

Note: Lemma's check works only when it is built into the framework's function execution, and the list of callable functions and the argument scopes are managed apart from the model's output and the input the agent reads. If the permitted scope is set broadly, malicious calls within it go through. The check neither fixes flaws inside a function nor finds instructions in the input. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that let AI agents call functions

- Is the semantic-kernel you use on a fixed version (Python 1.39.4 or later, .NET 1.71.0 or later)?
- Do you know the list of functions the LLM can call, and keep functions that touch file operations or code execution to only those needed?
- Can you see, apart from the agent, a record of which functions the agent called and with which arguments?

## 5. Facts and timeline

- **Subject**: Microsoft Semantic Kernel (an AI agent framework; over 27,000 GitHub stars, widely used in enterprises). The .NET SDK and the Python SDK.
- **CVE-2026-25592 (.NET SDK, CVSS 10.0, sandbox escape)**: `DownloadFileAsync` was inadvertently exposed with a `[KernelFunction]` attribute, in a state where the LLM could call it directly. The destination path (`localFilePath`) was almost entirely under model control, with virtually no path validation, so it could lead to arbitrary file writes and sandbox escape (Microsoft).
- **CVE-2026-26030 (Python SDK, code execution on the host)**: when an agent used the In-Memory Vector Store as the backend of the Search Plugin with default filter behavior, and an attacker had a prompt-injection path into the agent's input, a single crafted prompt could reach code execution on the host (Microsoft).
- **Fix**: semantic-kernel 1.39.4 (Python) and 1.71.0 (.NET).
- **Framing (Microsoft's blog)**: presented as a case treating prompt injection not as an output-integrity problem but as an execution problem.

### Timeline

- **2026-05-07**: Microsoft disclosed two Semantic Kernel vulnerabilities (CVE-2026-25592 / CVE-2026-26030), announcing that prompt injection could lead to code execution and arbitrary file writes on the host.
- **2026-05-07**: Fixed versions (Python 1.39.4 / .NET 1.71.0) were provided.

> The facts in this Brief rest on the Microsoft Security Blog and the NVD CVE entries. CVSS values, conditions and fixed versions are as of disclosure. This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Microsoft**: disclosed the two vulnerabilities and provided fixed versions (Python 1.39.4 / .NET 1.71.0).
- **Design requirements**: minimizing the exposure of functions, strict validation of arguments and authorization before execution are discussed as requirements for agent infrastructure.

## 6. Sources

- **Microsoft Security Blog**: “When prompts become shells: RCE vulnerabilities in AI agent frameworks” (2026-05-07) — <https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/>
- **NVD**: CVE-2026-25592 (.NET Semantic Kernel SDK, sandbox escape) — <https://nvd.nist.gov/vuln/detail/CVE-2026-25592>
- **NVD**: CVE-2026-26030 (Python Semantic Kernel, RCE via In-Memory Vector Store) — <https://nvd.nist.gov/vuln/detail/CVE-2026-26030>
- **Reference implementation (GitHub)**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
