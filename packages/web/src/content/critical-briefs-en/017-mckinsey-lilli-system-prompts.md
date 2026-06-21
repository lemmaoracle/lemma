---
brief_no: 17
title: "McKinsey Lilli のシステムプロンプト書き換え可能性 — AI の挙動を統治する層に完全性も来歴もなかった"
title_en: "McKinsey Lilli's Writable System Prompts — The Layer Governing the AI's Behavior Had No Integrity or Provenance"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["identity-auth", "agent-runaway"]
incident_date: 2026-02-28
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["005-noroboto-lying-fonts", "009-gtg1002-ai-orchestrated-espionage", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "AI の挙動を統治する層に完全性も来歴もなかった — McKinsey Lilli システムプロンプト"
og_lead_en: "The layer governing the AI's behavior had no integrity or provenance — McKinsey Lilli"
gap_detected: "After being notified, McKinsey fixed the unauthenticated endpoint and took the development environment offline within hours."
gap_missing: "Because output looks normal on the surface even when the instructions governing the AI's behavior are rewritten, users had no layer to confirm whether a response was based on legitimate untampered instructions, and automated scanners could not detect this intrusion path either."
gap_fix: "Before the AI produces output, independently verify with Lemma that the response was generated under legitimate, authorized, untampered instructions, and prevent it up front."
---

## TL;DR

In February 2026, an autonomous AI agent run by red-team firm CodeWall, under responsible disclosure, reached full read/write access to the production database behind McKinsey's internal generative-AI platform "Lilli," from zero credentials. The most significant exposure: the system prompts governing Lilli's behavior were all writable. Because output looks normal even when those instructions are rewritten, users cannot judge whether a response rests on legitimate, untampered instructions, and silent tampering slips past detection. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Affected**: McKinsey & Company's internal generative-AI platform "Lilli" (publicly launched in July 2023; in daily use by 72% of the firm's employees)
- **Demonstrating party**: the red-team security firm CodeWall, using an autonomous offensive AI agent (per CodeWall's own blog claim, reported by The Register)
- **Premise**: started from zero credentials and zero internal knowledge. Conducted under McKinsey's published responsible-disclosure policy (HackerOne) and within those guardrails
- **Intrusion path**: discovered public API specifications across more than 200 endpoints, 22 of which had no authentication. One of them wrote a user-search query to the DB; values were parameterized, but JSON keys were directly concatenated into SQL — producing a SQL injection where the JSON key surfaced inside the DB error message (OWASP ZAP did not detect this)
- **Reach**: full read/write access to the production database in under two hours, without human intervention. Reachable from there: 46.5 million chat messages (strategy, M&A, client-facing — all in plaintext), 728,000 files (including sensitive client data), 57,000 user accounts, and **95 system prompts governing Lilli's behavior (all writable)**
- **Most significant primitive**: with SQLi as read/write, the system prompts could be silently rewritten, tampering with Lilli's answer content, guardrails, and citation behavior
- **Response**: CodeWall discovered the SQLi in late February, disclosed the full attack chain on March 1. By the following day McKinsey had remediated the unauthenticated endpoints, taken the development environment offline, blocked the public API specifications, and patched the identified issues within hours. The firm stated there was no evidence that customer data or sensitive information had been accessed by CodeWall or any third party
- **Public disclosure**: 2026-03-09 (The Register / CodeWall blog)
- **Core**: the system prompts governing the AI's behavior and its outputs had no independent verification of integrity or provenance, so users could not distinguish a silent rewrite from authentic output

---

## 2. Timeline

- 2023-07: McKinsey launches Lilli internally
- 2026-02: CodeWall's autonomous AI agent begins red-teaming with no credentials. Maps the attack surface and finds 22 unauthenticated endpoints
- Late 2026-02: SQL injection discovered. About 15 iterations expose the query structure and reach real data such as employee identifiers. Full read/write access to the production DB in under two hours
- 2026-03-01: CodeWall discloses the full attack chain to McKinsey
- Around 2026-03-02: McKinsey remediates the unauthenticated endpoints, takes development offline, blocks public API specifications. All identified issues patched within hours
- 2026-03-09: The Register and the CodeWall blog publish

> Note: proper nouns and CVE identifiers are based on primary sources (research labs, the GitHub Advisory Database, NVD, and the like); each implementation's remediation status varies over time, so consult the latest information. This case was a red-team demonstration under responsible disclosure, not an attack that caused real-world harm — it should not be overstated.

---

## 3. Chain of Events (Method Breakdown)

1. **Autonomous target selection**: CodeWall's agent proposes McKinsey as a target itself, on the basis of the published responsible-disclosure policy and a recent Lilli update
2. **Attack-surface mapping**: from zero credentials, discovers more than 200 endpoints and retrieves the public API specifications. 22 endpoints have no authentication
3. **SQLi discovery**: values were parameterized, but JSON keys were directly concatenated into SQL. The agent identifies the SQLi from the JSON key appearing inside the DB error message (OWASP ZAP did not detect it)
4. **Iterative structural exposure**: using the error messages as cues, ~15 iterations resolve the query structure and reach real data
5. **Reach full read/write**: in under two hours, full read/write on the production DB. Reachable: 46.5M chat messages, 728K files, 57K accounts, 95 system prompts
6. **Possibility of tampering with the governance layer**: because the access was read/write, Lilli's behavior-governing system prompts could be silently rewritten, tampering with answers, guardrails, and citation behavior (the most significant primitive)

---

## 4. Structural Argument

The incident belongs to the `ai-decision-integrity` category of Pillar 02 (Verifiable AI). The central **failure primitive is "the layer governing the AI's (Lilli's) judgment — the system prompts — and the outputs that follow had no mechanism to independently verify integrity or provenance."** Because the prompts were writable and any rewrite could not be independently verified, even silent tampering of the chatbot's answers, guardrails, and citation behavior could not be distinguished from authentic output by the tens of thousands of consultants relying on it. `identity-auth` (unauthenticated endpoints) and `agent-runaway` (autonomous offensive AI agent) are noted as secondary categories.

The same Pillar 02 as Brief 005 (Noroboto, AI document review misdirected via font impersonation), but a different target. Brief 005 turned AI judgment by **tampering with input**; this incident is the absent integrity / provenance of the **governing instructions (system prompts) and outputs** of the AI. Both share the structure that "AI judgment is decoupled from a layer that independently verifies the authenticity of its grounds." Adjacent to Brief 009 (GTG-1002) on a different primitive — that an autonomous AI agent executed reconnaissance through exfiltration without human intervention — and this incident shows that "autonomization on the attacker side" has materialized as a red-team demonstration. Like Brief 008 (Discord scraping) and Brief 011 (SynthID), this case is a non-attack trust-layer risk event accompanied by responsible disclosure.

---

## 5. The detection–proof gap

Vulnerability scanning, WAFs, and SOC monitoring are useful for discovering unauthenticated endpoints and anomalous access of the kind in this case, and this Brief does not deny that role. McKinsey in fact patched everything within hours of disclosure. That said, automated scanners (OWASP ZAP) did not detect this SQLi — detection is not omnipotent.

The deeper issue is that detection does not independently guarantee "whether the AI's output, or the instructions governing it, are authentic." If a system prompt is rewritten, Lilli's output looks normal on the surface. If users (the consultants) have no way to judge "is this answer based on the legitimate, untampered instruction set?", silent tampering slips past detection. For regulatory reporting, audit, and litigation, access logs and after-the-fact vulnerability patching are not independent evidentiary trails for "the AI's output was produced under legitimate governance instructions."

Pre-execution attestation takes the design choice of binding the instructions governing the AI's behavior (system prompts and the like) and the outputs to "produced under legitimate, authorized, untampered instructions" as an independently verifiable cryptographic proof, so users and auditors can verify the authenticity of the output. If the instructions are rewritten, the proof becomes inconsistent and tampered outputs can be distinguished from authentic ones. Vulnerability detection and integrity proof of the outputs / governance instructions are **complementary** rather than substitutes.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and Industry Response

- **McKinsey**: under responsible disclosure, remediated unauthenticated endpoints, took the development environment offline, and blocked the public API specifications within hours. Stated that there was no evidence of access to customer data or sensitive information by CodeWall or any third party
- **CodeWall**: published the capabilities of the autonomous offensive AI agent. The CEO warned that "attackers will conduct the same kind of indiscriminate attacks with the same techniques and strategies," surfacing the concern about financially motivated actors weaponizing AI agents
- **Cross-industry framing**: in production use of generative-AI platforms, (1) authentication and API exposure management, (2) the integrity and provenance of the system prompts governing the AI's behavior, and (3) autonomization of attacker-side AI agents have surfaced simultaneously. "How to prove the authenticity of the AI's outputs and governance instructions" emerges as a new requirement for enterprise AI adoption

How operators and auditors should independently verify the layer governing the AI's judgment and the authenticity of its outputs is the open question for enterprise AI operations moving forward.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed here (no mechanism independently verifies the integrity and provenance of the system prompts governing the AI's behavior and the AI's outputs), Lemma proposes a design that binds the AI's governance instructions and outputs to "produced under legitimate, authorized, untampered instructions" as an independently verifiable cryptographic proof.

- **Proof on the governance instructions**: bind a cryptographic proof to the governance instructions (system prompts and the like) attesting that they are legitimate, authorized, and untampered.
- **Proof propagated to the output**: accompany each output with an independently verifiable proof that it was generated under those instructions.
- **Making tampering visible**: even if the system prompts are silently rewritten, the proof signals the inconsistency through a separate channel.
- **Authenticity judgment**: users and auditors can distinguish tampered outputs from authentic ones.

Lemma does not deny vulnerability detection or access control; it provides a complementary layer of "proof of authenticity for the AI's outputs and governance instructions" alongside detection.

For the design and its scope, see [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/verifiable-ai/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **The Register**: "AI agent hacked McKinsey chatbot for read-write access" (2026-03-09) — https://www.theregister.com/2026/03/09/mckinsey_ai_chatbot_hacked/
- **CodeWall official blog**: "How We Hacked McKinsey's AI Platform" (2026-03, the primary claim of the attack chain and reach) — https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform
- **BankInfoSecurity**: "Autonomous Agent Hacked McKinsey's AI in 2 Hours" (2026-03) — https://www.bankinfosecurity.com/autonomous-agent-hacked-mckinseys-ai-in-2-hours-a-31007
- **Outpost24**: "How an AI Agent Hacked McKinsey's AI Platform" (2026-03, technical commentary) — https://outpost24.com/blog/ai-agent-hacked-mckinsey-ai-platform/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
