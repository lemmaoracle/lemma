---
brief_no: 55
title: "命令の出所を検証しないまま、AI が社内データを送り出した — 取り込んだ命令の出所と権限が、行動の前に独立検証されない構造（EchoLeak / Microsoft 365 Copilot）"
title_en: "Internal Data Exfiltrated Without Verifying the Instruction's Origin — EchoLeak in Microsoft 365 Copilot (CVE-2025-32711)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2025-06-11
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["047-openclaw-agent-phishing", "024-invisible-unicode-instruction-injection", "005-noroboto-lying-fonts", "027-librechat-mcp-url-secrets"]
status: published
version: "1.0"
og_lead_ja: "命令の出所を検証せず AI が社内データを送出 — EchoLeak / M365 Copilot"
og_lead_en: "AI exfiltrated data without verifying the instruction's origin — EchoLeak"
gap_detected: "External research discovery and disclosure, together with deterrent layers such as the XPIA classifier, worked, so the vulnerability was surfaced and fixed before exploitation."
gap_missing: "There was no layer to independently verify before action whether an instruction the AI ingested was granted under legitimate authority, so directives embedded in data were executed as if they were legitimate commands."
gap_fix: "Before a high-risk action, independently verify with Lemma that this action stays within the bounds of legitimately granted commands and authority, and prevent it up front."
---

## 1. TL;DR

EchoLeak (CVE-2025-32711), disclosed by Aim Labs in June 2025, made Microsoft 365 Copilot exfiltrate sensitive internal data to an attacker's server with no user interaction (zero-click) — just one crafted email. Copilot could not distinguish an instruction smuggled into that email from data to be processed. However much after-the-fact detection like the XPIA classifier is strengthened, it cannot supply, at the moment the AI acts, an independent check that the ingested instruction's origin and authority are legitimate.

---

## 2. What happened

- **Subject**: Microsoft 365 Copilot (a RAG-based enterprise AI assistant spanning Outlook, SharePoint, OneDrive, Teams, etc.)
- **Identifier**: CVE-2025-32711. CVSS 9.3 (Critical)
- **Discovery and report**: Found by Aim Labs (Aim Security) and reported privately to the Microsoft Security Response Center (MSRC)
- **Nature of the attack**: **Zero-click.** It succeeds simply by Copilot ingesting one attacker-sent email through its normal summarize/reference processing; no action or click by the victim is required
- **Exfiltration scope**: Copilot's entire access scope (OneDrive files, SharePoint content, Teams messages, chat history, preloaded organizational data)
- **Exploitation in the wild**: Microsoft stated "no customer action required" and "no evidence of exploitation in the wild." This was reported and fixed at the responsible-disclosure (PoC) stage

> Note: This Brief does not assert the presence or absence of any specific exploitation; its object of analysis is the structure in which an AI assistant acts without verifying the origin of an instruction.

This incident stems from a structure in which the AI assistant does not independently verify the origin and authority of an ingested instruction before acting. The failure propagates as follows:

1. **Ingesting untrusted data**: Copilot processes incoming email and SharePoint content by joining them into the same context without separating trust boundaries. The attacker's email body enters the LLM context as "data to be processed"
2. **Conflating instruction and data (LLM Scope Violation)**: Because the LLM receives "trusted instructions" and "untrusted data" as the same token stream, it cannot distinguish an instruction embedded in the data from a legitimate command. The attacker's instruction becomes a target for execution
3. **Multi-layer bypass of defenses**: Detection/suppression layers — the Cross-Prompt Injection (XPIA) classifier, redaction of external links, Content-Security-Policy, Copilot's reference notation — are evaded via reference-style Markdown, auto-fetched images, abuse of the Microsoft Teams proxy, and so on
4. **Data exfiltration**: Copilot reads internal data within its own access scope and sends it to attacker control via a trusted domain. No victim action required
5. **Lack of visibility**: Because it is zero-click and uses legitimate paths, it rarely appears as an anomaly in ordinary usage logs. Discovery depends on external research and after-the-fact analysis

---

## 3. Timeline — disclosure and response

- 2025-01: Aim Labs builds a working PoC and reports it privately to MSRC
- Early spring 2025: Initial mitigations
- 2025-05: Microsoft rolls out a server-side fix
- 2025-06-11: The advisory and the attack-chain research are published (CVE-2025-32711); listed in that month's Patch Tuesday
- 2026 onward: Similar strains are reported in SharePoint / Copilot integrations, showing the AI-assistant trust-boundary problem is not a one-off

> Note: Proper names and CVEs rest on primary sources (research labs, GitHub Advisory, NVD, etc.); each implementation's remediation status varies over time, so consult the latest information. This case was demonstrated at the responsible-disclosure (PoC) stage by a research lab and does not assert harm in the wild.

The response and industry movement after disclosure:

- **Vendor response**: Microsoft assigned CVE-2025-32711 and fixed it server-side. It stated no customer action is required and that there is no evidence of exploitation in the wild
- **Shift in industry perception**: EchoLeak, as "the first real-world zero-click prompt injection in a production LLM system," updated enterprise-AI risk perception. The **architectural weakness** that an LLM treats trusted instructions and untrusted data as the same token stream became a focal point
- **Continuity**: In 2026 and beyond, similar strains have been reported in SharePoint / Copilot integrations — not a one-off bug, but an issue inherent to AI-assistant trust boundaries that keeps resurfacing
- **Shift in center of gravity**: The center of gravity of prompt-injection defense is shifting from detection by classifiers to the design of the agent's execution boundary itself (verifying the origin and authority of instructions)

The absence of a layer that independently verifies the origin and authority of an instruction at the moment of action is not one vendor's problem; it remains an operational issue spanning both the organizations deploying enterprise AI and the AI platform providers.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the AI agent does not independently verify the origin and authority of the ingested instruction before the action (reading internal data and sending it out).** The distinction "is the instruction contained in this email body a legitimately granted command, or merely untrusted data" is closed inside the system's self-judgment and is not independently verified before acting.

The target differs from [Brief 024](/critical/briefs/024-invisible-unicode-instruction-injection/) (instruction injection via invisible Unicode — a divergence between what a human reads and what the model reads) and [Brief 005](/critical/briefs/005-noroboto-lying-fonts/) (forging input integrity with lying fonts), but the shared primitive is the same: **a decision or action connects directly to execution and data exfiltration while decoupled from the layer that verifies it.** It is also the same shape as [Brief 047](/critical/briefs/047-openclaw-agent-phishing/) (an email-reading agent forwarded credentials before verifying the sender), where the crux is "**the agent acts before verification.**" What EchoLeak shows is that this primitive is not a research concern but materialized in production enterprise AI as a zero-click real-data leak.

Here the detection chain — Aim Labs' research, the MSRC report, Microsoft's server-side fix, and the existing XPIA classifier suppression layer — played a role. The vulnerability was made visible by external research and fixed before exploitation. This is a detection success, and this Brief does not deny the role of the detection layer. Detection is indispensable for raising suspicion, prompting fixes, and narrowing the blast radius.

But the problem here is that the XPIA classifier detection layer was **bypassed in multiple ways**, and that no matter how much the detection layer is strengthened, it does not provide the material to independently prove, **at the moment the AI acts, whether the origin and authority of the ingested instruction are legitimate.** A classifier is a probabilistic judgment, not proof that "this command was legitimately granted." As long as the attack uses legitimate domains and a zero-click path, after-the-fact detection and analysis become a trailing sequence that operates only after the data has already crossed the boundary. This is a structurally independent layer gap, outside the reach of detection.

At present, across the operating model of enterprise AI, independent verification of the origin and authority of the instructions an agent ingests depends on the model's self-judgment and trust in classifiers, and is not treated as an independent layer. Pre-execution attestation closes the gap by inserting one step into the agent's action path — an attribute proof that "this instruction was legitimately granted under this authority." It is a **complement** to, not a substitute for, detection; only with both in place is a trust boundary for the AI's actions established.

---

## 5. What proof would have changed

Against the gap EchoLeak exposed — an AI agent connecting directly to reading internal data and exfiltrating it without independently verifying, before acting, the origin and authority of the ingested instruction — Lemma proposes a design that fixes the basis for the agent's action as an independently verifiable cryptographic proof at that moment.

- **At-action attestation**: Before the agent accesses or sends data, prove with a signature that "this action is within the scope of a legitimately granted command/authority." The legitimacy of the command is fixed as proof at the moment of action, not as after-the-fact labeling
- **Provenance binding of instruction/data**: Bind ingested input (email, documents, etc.) to its original via docHash, making the distinction and origin of "data to be processed" vs "a command to execute" verifiable. An instruction embedded in untrusted data does not get promoted to a command without verification
- **Proof of authority scope**: Bind the agent's access authority (whose data, of what scope, and how far) as an attribute that is independently verifiable before acting
- **Selective disclosure**: Prove only that "the action was within the scope of authority," with minimal disclosure, without sending the internal data itself outside

Proof fixed at the moment of action functions as evidence that can be independently verified later — without disclosing the source data — when asked "was this exfiltration even based on a legitimate command in the first place." Detection (after-the-fact research and classifiers) contributes to shrinking the blast radius, while pre-execution attestation (verification at the moment of action) contributes to independently verifying the basis for the AI's action — each complementary.

---

## 6. Sources

- **Aim Labs (Aim Security)**: "Breaking down 'EchoLeak', the first zero-click AI vulnerability enabling data exfiltration from Microsoft 365 Copilot" (discovery, attack chain, LLM Scope Violation; 2025-06-11) — <https://www.aim.security/lp/aim-labs-echoleak-m365>
- **Microsoft MSRC**: "CVE-2025-32711 — M365 Copilot Information Disclosure Vulnerability" (official advisory, CVSS 9.3, server-side fix) — <https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711>
- **arXiv 2509.10540**: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System" — <https://arxiv.org/abs/2509.10540>
- **The Hacker News**: "Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction" (2025-06; technique and exfiltration scope) — <https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/verifiable-ai/), [Trust402](https://lemma.frame00.com/trust402/)
