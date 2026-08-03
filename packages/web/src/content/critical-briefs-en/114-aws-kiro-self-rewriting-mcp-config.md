---
brief_no: 114
title: "AWS の Kiro：無害な要約依頼が、エージェントに自らの MCP 設定を書き換えさせ RCE に至る — 承認境界は、認可設定の自己改変を実行前に確かめない"
title_en: "AWS Kiro: a harmless summarize request makes the agent rewrite its own MCP config and reach RCE — the approval boundary never verifies self-modification of authorization settings before execution"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-07-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["095-amazon-q-mcp-auto-execution", "094-cursor-duneslide-sandbox-escape", "037-agent-config-auto-execution", "099-agentjacking-sentry-mcp", "098-bioshocking-agentic-browser-context"]
status: published
version: "1.0"
og_lead_ja: "AWS Kiro に RCE：エージェントが自らの MCP 設定を書き換える"
og_lead_en: "RCE in AWS Kiro: the agent rewrites its own MCP config"
gap_detected: "Prompt-injection detection and an approval dialog existed by design, and the vulnerability was fixed through responsible disclosure."
gap_missing: "A layer that independently verifies, by provenance and authorization, the agent's act of rewriting its own authorization settings before execution."
gap_fix: "Verify the write to settings-as-authorization, and the execution based on them, by provenance and authorization before execution — excluding execution based on self-modified settings as lacking authorization."
---

## 1. TL;DR

A remote code execution (RCE) vulnerability, CVE-2026-10591, was found in Kiro, AWS's agentic IDE. The research was published by Intezer in collaboration with Kodem Security. During a harmless request such as summarizing a web page, hidden text planted in the page (indirect prompt injection) steers Kiro into rewriting its own MCP configuration file (`~/.kiro/settings/mcp.json`). The configuration is reloaded automatically, and any command written into it runs on the developer's machine. Kiro's safety model rested on an approval boundary — a human clicking "allow" — but this vulnerability bypassed that approval without ever presenting it to the developer. Prompt-injection detection and an approval dialog existed by design. **Detection worked. What was missing is the layer that independently verifies, before execution, the agent's act of rewriting its own authorization settings.**

## 2. What happened

- The target is Kiro, AWS's agentic IDE. The vulnerability is tracked as CVE-2026-10591, and AWS published security bulletin 2026-037 on 2026-07-22. The research was conducted by Intezer together with Kodem Security.
- The root cause is that, unlike Kiro's other protected paths, the MCP configuration file `~/.kiro/settings/mcp.json` is not protected: Kiro can write to it on its own without user approval and reloads it automatically when it changes. The contents of this file are commands started on the host with the user's privileges.
- The attacker does not even need an exploit in Kiro itself to obtain arbitrary code execution on the developer's machine. It is enough for the attacker's text to reach the external content Kiro processes.

The attack succeeds through the following chain.

1. The developer makes an ordinary request to Kiro that pulls in external content ("summarize this documentation," for example).
2. Kiro fetches or searches the web, and one of the results contains the attacker's hidden instructions.
3. Those instructions make Kiro use its file-writing tool to rewrite `~/.kiro/settings/mcp.json`. This write happens without user approval.
4. Kiro reloads the configuration automatically and starts the malicious MCP server (that is, an arbitrary command). Code runs on the developer's machine the moment the folder is opened / the configuration changes.

## 3. Timeline — disclosure and response

- 2026-02-11: Intezer reports the issue to AWS via HackerOne (responsible disclosure).
- 2026-04-03: AWS replies that the fix has been deployed in the latest release; the researchers confirmed the fix in v0.11.130.
- 2026-07-20: Intezer publishes the joint research with Kodem Security.
- 2026-07-22: AWS assigns CVE-2026-10591 and publishes security bulletin 2026-037.

> Note: the facts here rest on primary sources (Intezer's research, AWS security bulletin 2026-037). No in-the-wild exploitation has been reported; the demonstration is a researcher proof of concept (PoC). No monetary loss or scope is established, and this Brief does not assert a magnitude. This Brief focuses not on condemning any single attacker or a particular vendor, but on the structure in which an agent rewrites its own authorization settings from external content in the middle of a harmless task.

Response and industry movement after disclosure are as follows.

- AWS fixed the vulnerability (the fix was confirmed in v0.11.130 of the 0.11 line) and recommends that Kiro users update to the latest version.
- Intezer and Kodem conclude that the approval boundary must be enforced at the platform level on the actions that matter, not inside the model's judgment or in prompts the model can be talked out of.

## 4. Why it wasn't stopped

The failure here is not that prompt injection could not be fully prevented. In an LLM, where data is instructions, injection itself is a known, unsolved class of issues. The failure sits one step further: the write in which the agent rewrites its own authorization settings, and the execution based on them, were never independently verified before the action.

Kiro's safety model was placed on an approval boundary — "risky operations happen only when a human clicks allow." But in this vulnerability, the very configuration file that decides authorization could be rewritten by the agent without approval. The developer approved only the "fetch a URL" action — harmless and expected — and consented to none of the file write, the MCP server creation, or the code execution. The approval dialog, as a form of detection, never asked the thing that mattered — "does this write actually hold this authorization, right now?" — before execution.

> A warning pop-up about the configuration change was shown in some cases. But per Intezer, the configuration was reloaded regardless of the user's response. The warning gives the appearance of detection but does not stop execution. An approval boundary becomes a boundary only when the thing it checks is independently verified before execution.

The same structure is, in effect, the "self-modify the settings from the outside" version of [Brief 095](/critical/briefs/095-amazon-q-mcp-auto-execution/), where in the same vendor lineage a command based on MCP configuration was auto-executed in Amazon Q. It connects to [Brief 037](/critical/briefs/037-agent-config-auto-execution/), where an agent's configuration change leads straight to execution, and to [Brief 099](/critical/briefs/099-agentjacking-sentry-mcp/) and [Brief 098](/critical/briefs/098-bioshocking-agentic-browser-context/), where external context drives an agent's actions. Each shows that a configuration or input looking like "a legitimate file, a legitimate fetch result" and the execution based on it being authorized right now are separate questions.

## 5. What proof would have changed

The approval boundary — a human clicking allow — is nullified when an agent self-modifies its own authorization settings from external content in the middle of a harmless task. Detection — prompt-injection detection, the approval dialog — can be deceived, and the warning can be bypassed. What works is a layer that independently verifies, per action and before execution, the write to settings and the execution based on those settings. Rather than letting the appearance of a presented configuration file stand in for trust, it checks — before the action completes — "is this write authorized, in this scope, right now?" and "does this execution rest on settings with authorized provenance?" If the answer is "not authorized" or "provenance unknown," the write and the execution are held in advance.

The design Lemma offers for this primitive is as follows.

- **Verification of settings-as-authorization writes**: bind writes and changes to the MCP configuration or execution-adjacent paths not to static trust in the file's location, but to an independently verifiable proof of being authorized for that write now — cutting off, before execution, the path by which an agent rewrites its own authorization boundary without approval.
- **Per-action proof-as-auth**: bind execution based on settings to the provenance and authorization state of those settings, so that execution based on settings self-modified from external content in the middle of a harmless task is excluded, before execution, as lacking authorization.
- **Separation and minimal environment for execution paths**: separate writes to execution-adjacent settings from ordinary file edits and confine them to a least-privilege environment, so a write does not translate into unauthorized execution.
- **Selective record of modifications**: retain a tamper-evident record of which settings were rewritten, under what provenance and authorization, and when they led to execution — so the origin of an execution and its authorization state can be independently established after the fact.

Lemma is not a product that eliminates prompt injection itself, nor one that substitutes for the model's judgment. Its scope is to verify provenance and authorization before writes to settings and the execution based on them occur, excluding execution based on self-modified settings before execution. Detection (catching injection, the approval dialog, after-the-fact fixes) and pre-execution proof (a record that independently verifies provenance and authorization before the write and the execution) are complements, not substitutes. The former works on catching and fixing what happened; the latter on establishing authorization before harm occurs. See [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05) and [Agent Authority](/pillars/#authority).

## 6. Sources

- Intezer Research, “When the AI Edits Its Own Trust Boundary: Remote Code Execution Vulnerability in AWS's Agentic IDE” (2026-07-20, updated 07-23) — <https://research.intezer.com/blog/2026/07/remote-code-execution-kiro/>
- AWS Security Bulletin, “AWS-2026-037: Issue with Kiro” (2026-07-22) — <https://aws.amazon.com/security/security-bulletins/2026-037-aws/>
- Kodem Security, “AWS Kiro Agentic IDE RCE via Prompt Injection and MCP Config” (2026-07) — <https://www.kodemsecurity.com/resources/aws-kiro-agentic-ide-rce-prompt-injection-mcp-config-vulnerability>
- The Hacker News, “AWS Kiro Flaw Let Poisoned Web Page Trigger Remote Code Execution” (2026-07) — <https://thehackernews.com/2026/07/aws-kiro-flaw-let-poisoned-web-page.html>

References: [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Agent Authority](/pillars/#authority) · [Brief 095 (Amazon Q MCP auto-execution)](/critical/briefs/095-amazon-q-mcp-auto-execution/) · [Brief 037 (agent config auto-execution)](/critical/briefs/037-agent-config-auto-execution/)
