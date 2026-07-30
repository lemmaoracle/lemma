---
brief_no: 39
title: "Semantic Kernel：プロンプトインジェクションが、ホストのコード実行（RCE）に変わった — エージェントが呼べる関数とパラメータが、実行の前に認可・検証されない構造（CVE-2026-25592／CVE-2026-26030）"
title_en: "Semantic Kernel: Prompt Injection Turned Into Host-Level Remote Code Execution — the functions and parameters an agent can call are not authorized or verified before execution (CVE-2026-25592 / CVE-2026-26030)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "code-provenance"]
incident_date: 2026-05-07
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "003-starlette-badhost", "037-agent-config-auto-execution", "047-openclaw-agent-phishing"]
status: published
version: "1.0"
og_lead_ja: "Semantic Kernel で、プロンプトインジェクションがホストの RCE に直結した"
og_lead_en: "In Semantic Kernel, prompt injection led directly to host-level RCE"
gap_detected: "Vulnerability scanning, CVE disclosure, and patching could identify and close the known exploitation paths."
gap_missing: "The functions and parameters an LLM can call were driven directly by (injectable) model output, without independently verifying before execution whether 'this call is authorized and scoped.'"
gap_fix: "Before moving a function to execution, independently verify with Lemma that the call falls within the range of permitted authority, and prevent it up front."
---

## 1. TL;DR

Two vulnerabilities were found in Microsoft's AI agent framework Semantic Kernel that could turn prompt injection directly into host-level remote code execution (RCE) or arbitrary file writes; they were disclosed on 2026-05-07. The .NET SDK's CVE-2026-25592 (CVSS 10.0) inadvertently exposed `DownloadFileAsync` as a `[KernelFunction]` that the LLM could call directly, with the destination path (`localFilePath`) almost entirely under model control and without path validation. The Python SDK's CVE-2026-26030 allowed a single injected prompt to reach host-level RCE in a configuration that uses the In-Memory Vector Store as a Search Plugin under default settings. The functions an agent can call, and their parameters, were driven directly by model output (injectable input) without independently verifying before execution whether "this call is authorized and scoped." Detection and patching worked, but there was no layer authorizing the call before the action.

---

## 2. What happened

- **Target**: Microsoft Semantic Kernel (an AI agent framework; over 27,000 GitHub stars, widely used in enterprises). .NET SDK and Python SDK
- **Disclosure**: 2026-05-07, Microsoft disclosed two vulnerabilities (patched)
- **CVE-2026-25592 (.NET SDK, CVSS 10.0, sandbox escape)**: `DownloadFileAsync` was inadvertently exposed with a `[KernelFunction]` attribute, in a state where the LLM could call it directly. The destination path (`localFilePath`) was almost entirely under model control, with virtually no path validation, so it could lead to arbitrary file writes and sandbox escape
- **CVE-2026-26030 (Python SDK, host RCE)**: when an agent uses the In-Memory Vector Store as the backend of the Search Plugin with default filter behavior, and an attacker has a prompt-injection path into the agent's input, a single crafted prompt could reach host-level RCE. A case that reclassifies prompt injection from "an output-integrity problem" to "an execution problem"
- **Core of the exploit**: in both cases, the functions an LLM could call (and their parameters) were not authorized, scoped, or verified before execution. Injectable model output could directly drive host-touching functions
- **Patch**: fixed in semantic-kernel 1.39.4 (Python) and 1.71.0 (.NET)
- **Context**: in 2026, cases keep being reported in AI agent frameworks where the design of tool / function calling becomes a path that turns prompt injection into execution (RCE)

The incident came together as the following chain.

1. **Inadvertent function exposure**: a host-touching function such as `DownloadFileAsync` is inadvertently exposed as a `[KernelFunction]`, in a state callable by the LLM
2. **Model-controlled parameters**: the call's parameters (such as the destination path) are almost entirely under model control, with virtually no path validation or scope restriction
3. **Establishing an injection path**: an attacker has a prompt-injection path into the agent's input (documents, search results, external data, etc.)
4. **From injection to execution**: a single crafted prompt makes the agent call the exposed function and, exploiting the model-controlled parameters and the absence of validation, reaches host-level RCE and arbitrary file writes
5. **Spread of impact**: because the framework is widely used, this can propagate laterally to agent implementations with the same kind of configuration (before patching)

---

## 3. Timeline — disclosure and response

- 2026-05-07: Microsoft disclosed two Semantic Kernel vulnerabilities (CVE-2026-25592 / CVE-2026-26030), announcing that prompt injection could lead to RCE and arbitrary file writes
- 2026-05-07: fixed versions (Python 1.39.4 / .NET 1.71.0) were provided
- From 2026-05 onward: the tool-calling design of AI agent frameworks was discussed across the industry as a structural issue that becomes a path from injection to execution

> Note: the facts in this Brief are based on the Microsoft Security Blog and NVD / CVE entries. CVSS values, conditions, and affected versions are as of disclosure, and the sources are stated explicitly.

The response and industry movement after disclosure:

- **Microsoft**: disclosed the two vulnerabilities and provided fixed versions (Python 1.39.4 / .NET 1.71.0), making visible the path by which prompt injection can lead to execution (RCE)
- **Scope of impact**: Semantic Kernel is widely used, and caution was urged for agent implementations with the same kind of configuration (exposure of host-touching functions, model-controlled parameters, absence of validation)
- **Cross-industry argument**: it was shared, along with cases from multiple frameworks, that in AI agent infrastructure the design of tool / function calling is becoming the largest attack surface that "turns injection into execution." The view of treating prompt injection as a problem of "execution authorization" rather than "output integrity" has spread
- **Design requirements**: minimizing the exposure scope of functions, strict validation of parameters, and pre-execution authorization verification are being discussed as essential requirements for agent infrastructure

"How to authorize, scope, and prove the functions and authority an agent can call, before execution" is expected, prompted by this incident, to be discussed as an essential requirement of agent infrastructure design.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the functions an LLM can call, and their parameters, are driven directly by injectable model output without independently verifying before execution whether the call is authorized and scoped"**. Prompt injection looks like an input-side problem, but the actual harm arose because "the injected instruction could directly execute host-touching functions."

This is the same `agent-infrastructure` as [Brief 025](/critical/briefs/025-mcp-stdio-config-to-command-rce/) (MCP's standard design became a path for broad RCE), [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) (server secrets leaked from a user-specified MCP URL in LibreChat), and [Brief 003](/critical/briefs/003-starlette-badhost/) (MCP authentication bypassed via Host-header manipulation in Starlette / BadHost); all share the structure in which **the design of agent infrastructure (tool calling, configuration handling) turns external input into privileged execution.** It also connects to [Brief 037](/critical/briefs/037-agent-config-auto-execution/) (an AI coding agent auto-executing a repository-bundled config file without verification) and [Brief 047](/critical/briefs/047-openclaw-agent-phishing/) (OpenClaw, an agent sending credentials outside the company before verifying the sender), in that **the agent's action is decoupled from authorization verification before the action.** This incident concretely showed that the view of "prompt injection = an output problem" becomes "an execution problem when there is no authorization for the call."

The safety of agent infrastructure depends not on whether the model behaves cleverly, but on whether the functions and authority the model can call are independently authorized and scoped before execution. On the premise that injection cannot be fully prevented, the question is whether a boundary can be drawn so that injected output does not reach privileged execution.

Vulnerability scanning, CVE disclosure, and patching are indispensable for closing known paths, and this Brief does not dispute their role. In this case too, prompt disclosure and the provision of fixed versions closed the known exploitation paths.

At the same time, detection and patching do not change the design itself — namely, "which functions, under which authorization, the agent can call." In this case, host-touching functions were callable by the LLM, and the parameters were model-controlled and unvalidated, so injected output reached execution directly. What was missing was a layer that independently verifies before execution whether "this function call is authorized and scoped in this context, right now," and this is a problem of a different lineage than closing individual paths with patches. When the next unknown exposure appears (a different function, a different configuration), the same structure can be exploited again. As material for proving in regulatory reporting or audits whether "this agent's privileged operation was carried out within the authorized scope," the fact that it has been patched does not by itself constitute a record of authorization at each point of execution.

---

## 5. What proof would have changed

Pre-execution attestation, before the agent executes a function, independently verifies outside the inference loop whether "this call is authorized in this context and under this authority, right now," and blocks the execution itself if there is no authorization. Rather than possession of a key or token, by proving and authorizing only the scope needed for each action, it keeps injected output from reaching host-touching functions directly. Vulnerability detection and pre-execution proof of authorization are not substitutes but **complements**; only when the two overlap can AI agents be placed into enterprise production with confidence.

Against the detection–proof gap this incident exposed (the functions and parameters an LLM can call are not authorized or verified before execution), Lemma offers a design that ties an agent's function execution to independent authorization verification before execution.

- **Pre-execution authorization enforcement boundary**: before executing a function, independently verify outside the inference loop whether "this call is authorized in this context and under this authority, right now," and structurally block the execution if there is no authorization
- **Authorization without sending keys or tokens**: drop the premise of giving the agent a bearer of broad authority, and move toward a Proof-as-Auth design that proves and authorizes only the scope needed for each action
- **Least privilege and function scope**: minimize the exposure scope of host-touching functions, and tie the range of parameters to authorization, so that injected output does not reach privileged functions directly
- **Provenance of actions**: leave a tamper-evident provenance of which function was called under which authorization, enabling after-the-fact audit and proof

Against the design philosophy of the Agent Authority Proof category — "injection cannot be fully prevented, but execution authorization can be separated" — this incident is a case where its assumed failure mode materialized as a CVSS 10.0 RCE. Detection (vulnerability scanning, patching) works on blocking known paths, and pre-execution attestation (independent verification of authorization before execution) works on establishing trust in agent operation, each complementarily.

---

## 6. Sources

- **Microsoft Security Blog**: “When prompts become shells: RCE vulnerabilities in AI agent frameworks” (2026-05-07) — <https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/>
- **NVD**: CVE-2026-25592 (.NET Semantic Kernel SDK, sandbox escape) — <https://nvd.nist.gov/vuln/detail/CVE-2026-25592>
- **NVD**: CVE-2026-26030 (Python Semantic Kernel, RCE via In-Memory Vector Store) — <https://nvd.nist.gov/vuln/detail/CVE-2026-26030>
- **Reference implementation (GitHub)**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/), [Trust402](https://lemma.frame00.com/trust402/)
