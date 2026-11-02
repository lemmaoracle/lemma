---
brief_no: 55
title: "Microsoft 365 Copilot：メール 1 通に紛れた指示で、社内データが外へ送られうることが示された(Aim Labs)"
title_en: "Microsoft 365 Copilot: An instruction hidden in one email could make Copilot send internal data out (Aim Labs)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2025-06-11
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["047-openclaw-agent-phishing", "024-invisible-unicode-instruction-injection", "005-noroboto-lying-fonts", "027-librechat-mcp-url-secrets"]
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "メール 1 通で、\nAI が社内データを\n外へ送りえた。\n<accent>利用者の操作は不要</accent>"
og_headline_en: "One email could make\nCopilot send data out.\n<accent>Zero clicks.</accent>"
key_figures:
  - value: "9.3"
    unit: "CVSS"
    label: "Severity of CVE-2025-32711 (Critical), per Microsoft's advisory"
    tone: "alert"
  - value: "0"
    unit: "clicks"
    label: "It worked with no action by the victim (zero-click), per Aim Labs' demonstration"
  - value: "None"
    label: "Evidence of exploitation in the wild, per Microsoft. It was reported and fixed at the PoC stage"
glossary:
  - term: "XPIA classifier"
    desc: "The Cross-Prompt Injection classifier: a layer that looks for and suppresses instructions injected into content Copilot takes in."
  - term: "Zero-click"
    desc: "An attack that succeeds without the victim doing anything, such as clicking a link."
insight:
  slug: "data-as-instruction"
  label: "Instructions inside ingested data"
  quote: "A line inside data an AI takes in can be carried out just like the user's own command, unless its origin and authority are checked."
operations: ["data-access"]
version: "1.0"
og_lead_ja: "EchoLeak — メール 1 通に紛れた指示で、M365 Copilot が社内データを外へ送りうることが示された（Aim Labs）"
og_lead_en: "EchoLeak — an instruction hidden in one email could make M365 Copilot send internal data out (Aim Labs)"
industries: ["ai"]
controls:
  - slug: "ownership-check"
    item: "Confirm that instructions the AI follows actually come from the user"
attack_method: "ai-misuse"
takeaway: "An instruction hidden in one crafted email was shown to make Copilot send internal data out. Before sending, check that the instruction is the user's own command."
self_check: "Before an AI assistant reads internal data and sends it out, can you check that the instruction came from the user's own command?"
countries: ["global"]
---

## 1. Summary

Aim Labs demonstrated, and disclosed in June 2025, that one crafted email from an attacker, simply taken in by Copilot through its normal summarize-and-reference processing, could make Copilot send internal data within its access scope to the outside with no action by the user (EchoLeak). Copilot could not tell the instruction hidden in the email apart from data it was processing. Microsoft fixed it on the server side and says there is no evidence of exploitation in the wild. <strong>A line inside data an AI takes in can be carried out just like the user's own command, unless its origin and authority are checked.</strong>

## 2. What got through

- **What got through**: Copilot reading internal data and sending it out. The attacker's email body entered the LLM context as "data to be processed", and the instruction inside it became something to carry out. Copilot read internal data within its own access scope and sent it to the attacker's control by way of a trusted domain (Aim Labs' demonstration).
- **Controls that did not stop it**: Detection and suppression layers, namely the XPIA classifier, redaction of external links, Content-Security-Policy and Copilot's reference notation, were evaded through reference-style Markdown, automatically fetched images, abuse of the Microsoft Teams proxy and similar means (Aim Labs).
- **What reached the receiving side**: In general, an AI assistant reading data and sending it out arrives as an operation based on the user's request. From the side that hands over the data, it cannot be told whether the operation came from the user's command or from text inside an email it took in.
- **Reach**: Copilot's entire access scope (OneDrive files, SharePoint content, Teams messages, chat history and preloaded organizational data).
- **Not disclosed**: Whether it was exploited in the wild. Microsoft says there is no evidence of exploitation in the wild. Because it is zero-click and uses legitimate paths, it rarely shows up as an anomaly in ordinary usage logs (Aim Labs).

## 3. What to check

Whatever the route, the condition for telling them apart is that, just before an AI assistant reads internal data and sends it out, it is checked, apart from how the content looks, whether that operation came from the user's own command or from text inside data it took in.

- **Who approves**: The user. The operation that sends data out, and the instruction behind it, are shown on a screen apart from the emails and documents the AI reads, and the user approves them. Text inside ingested data is never used as approval.
- **Where it is checked**: Just before the AI assistant reads internal data and sends it out. A send based on an instruction whose origin and authority cannot be checked is held until the check is done.
- **What is recorded**: Which data was sent, on which instruction, on whose approval and to where, kept apart from the AI in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an AI assistant sends internal data out, the origin and authority of the instruction, and keeping a record. Detection means noticing an injected instruction, for example with a classifier. The dates below are when it was reported, fixed and disclosed, not necessarily when it was demonstrated.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before sending internal data, check the origin and authority of the instruction</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In the demonstration, one email's instruction<br>sent internal data out</span></div>
<div class="rx-zone det"><b>Detection · evaded in the demonstration</b>XPIA classifier, link redaction, CSP</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>Aim Labs reports to MSRC</b></div>
<div class="rx-g g2"><div class="t">2025-05</div><b>Microsoft fixes the server side</b></div>
<div class="rx-g g3"><div class="t">2025-06-11</div><b>Advisory and research published</b></div>
<div class="rx-g g4"><div class="t">2025-06</div><b>Listed in Patch Tuesday</b></div>
</div>
</figure>

Like [OpenClaw](/critical/briefs/047-openclaw-agent-phishing/), where an email-reading agent forwarded credentials before checking the sender, this is a case of an agent acting before the check. It also connects to [instruction injection with invisible Unicode](/critical/briefs/024-invisible-unicode-instruction-injection/) and [lying fonts](/critical/briefs/005-noroboto-lying-fonts/), where what a person reads and what the model reads diverge: in each, content that was taken in leads to action without a check.

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before an AI assistant reads internal data and sends it out.** It does not look for intrusions or injections; it checks, before running and apart from how the content looks, the origin and authority of the instruction behind the operation.

### Industries and operations to watch

- **Industry · AI**: Organizations that deploy AI assistants spanning email, documents and chat, and the companies that provide such AI.
- **Operation · Lookup & data access**: Having an AI summarize or reference incoming email and shared documents. Text inside an email from the outside can lead to the AI reading data and sending it out.

### Current controls vs Lemma

The route in this case is a chain from column 1 (taking in an email from the outside) to column 2 (reading internal data and sending it out).

| Control | Taking in an email from the outside | Reading internal data and sending it out |
| --- | --- | --- |
| The model telling commands apart from data | Not effective | Not relevant |
| XPIA classifier (detecting injected instructions) | Partial | Not relevant |
| External link redaction and Content-Security-Policy | Not relevant | Partial |
| **Lemma (pre-execution check)** | Not effective | Effective |

The model receives trusted commands and ingested data as the same token stream, so it could not tell an instruction embedded in the data apart (Aim Labs). The XPIA classifier is a layer that looks for and suppresses injected instructions, but it judges by probability and was evaded in the demonstration. Link redaction and CSP narrow where data can be sent, but they were evaded through automatically fetched images and the Teams proxy. Lemma does not stop the intake itself; it ties the operation that sends internal data out to a check of the instruction's origin and authority. A record of what ran is also kept, so which data was sent, on which instruction and on whose approval can be confirmed without relying on the AI's account.

Note: Lemma's check works only when it is built into the AI assistant's operations that read and send data, and the user's commands and authority are managed apart from the data the AI reads. If the user approves a send without looking at where the instruction came from, it gets through. A send through a legitimate domain is hard to tell apart by destination alone. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that deploy AI assistants

- Are emails and documents from the outside that the AI assistant takes in treated the same as the user's commands?
- Can you see a record of the data the AI assistant read and sent, and the instruction behind it, separately from the AI?
- Have you limited the internal data the AI assistant can access to what the work needs?

## 5. Facts and timeline

- **Subject**: Microsoft 365 Copilot (a RAG-based enterprise AI assistant spanning Outlook, SharePoint, OneDrive, Teams and more).
- **Identifier**: CVE-2025-32711. CVSS 9.3 (Critical).
- **Discovery and report**: Found by Aim Labs (Aim Security) and reported privately to the Microsoft Security Response Center (MSRC).
- **Nature of the attack**: Zero-click. It succeeds simply by Copilot taking in one attacker-sent email through its normal summarize-and-reference processing; no action by the victim is needed.
- **The chain the researchers showed**: Copilot joins incoming email and SharePoint content into the same context without separating trust boundaries. The LLM receives commands and data as the same token stream and cannot tell an instruction embedded in the data apart from a legitimate command (Aim Labs calls this an LLM Scope Violation). After evading the detection and suppression layers, Copilot reads internal data within its own access scope and sends it out by way of a trusted domain.
- **Exploitation in the wild**: Microsoft stated "no customer action required" and "no evidence of exploitation in the wild". This was reported and fixed at the responsible-disclosure (PoC) stage.

### Timeline

- **2025-01**: Aim Labs builds a working PoC and reports it privately to MSRC.
- **Early spring 2025**: Initial mitigations are put in place.
- **2025-05**: Microsoft rolls out a server-side fix.
- **2025-06-11**: The advisory and the attack-chain research are published (CVE-2025-32711), and it is listed in that month's Patch Tuesday.
- **2026 onward**: Similar strains are reported in SharePoint and Copilot integrations and elsewhere.

> Proper names and the CVE rest on primary sources (the research lab, Microsoft's advisory and the paper). Each implementation's remediation status changes over time, so consult the latest information. This case was demonstrated at the responsible-disclosure (PoC) stage by a research lab and does not show harm in the wild. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Microsoft**: Assigned CVE-2025-32711 and fixed it on the server side. It said no customer action is required and that there is no evidence of exploitation in the wild.
- **Research**: The paper (arXiv 2509.10540) positioned this as "the first real-world zero-click prompt injection in a production LLM system". The point that an LLM treats trusted commands and ingested data as the same token stream became a focus.
- **Continued reports**: In 2026 and beyond, similar strains have been reported in SharePoint and Copilot integrations and elsewhere. The discussion of prompt-injection defense is widening from detection by classifiers to the design of the agent's execution boundary (checking the origin and authority of instructions).

## 6. Sources

- **Aim Labs (Aim Security)**: "Breaking down 'EchoLeak', the first zero-click AI vulnerability enabling data exfiltration from Microsoft 365 Copilot" (discovery, attack chain, LLM Scope Violation; 2025-06-11) — <https://www.aim.security/lp/aim-labs-echoleak-m365>
- **Microsoft MSRC**: "CVE-2025-32711 — M365 Copilot Information Disclosure Vulnerability" (official advisory, CVSS 9.3, server-side fix) — <https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711>
- **arXiv 2509.10540**: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System" — <https://arxiv.org/abs/2509.10540>
- **The Hacker News**: "Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction" (2025-06; technique and exfiltration scope) — <https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
