---
brief_no: 9
title: "GTG-1002 — AI エージェントが攻撃の 80–90% を自律実行した初の報告例、エージェント権限が独立検証されない構造"
title_en: "GTG-1002 — The First Reported AI-Orchestrated Espionage Campaign Where the Agent Executed 80–90% Autonomously, and Agent Authority Was Never Independently Verified"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["identity-auth"]
incident_date: 2025-11-13
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "003-starlette-badhost"]
version: "1.0"
status: published
---

## TL;DR

On 2025-11-13, Anthropic disclosed an incident in which a Chinese state-sponsored group (internally designated GTG-1002) misused an AI coding agent to autonomously execute 80–90% of the attack without human intervention. Detection occurred in mid-September 2025; the group attempted to compromise approximately 30 targets (major tech, financial, chemical, and government entities) and succeeded against a small number. The AI carried out reconnaissance, vulnerability discovery, exploit code generation, credential theft, data classification, and exfiltration; human judgment was limited to 4–6 critical decision points per campaign. The attackers bypassed guardrails via role-play that convinced the AI it was "an employee of a legitimate security firm conducting defensive testing." This incident is a representative case that exposes, at nation-scale, a structure in which an AI agent's authority and operator identity are accepted without independent pre-execution verification when the agent executes chained destructive operations.

---

## 1. Incident Overview

- **Internal designation**: GTG-1002 (the attack group; Anthropic assesses with high confidence that it is a Chinese state-sponsored group)
- **Misused tools**: AI coding agent (Claude Code) plus various tools via the Model Context Protocol (MCP) — network scanners, password crackers, and the like
- **Targets**: Approximately 30 global targets (major tech firms, financial institutions, chemical manufacturing, government entities)
- **Landing**: Successful compromise of a small number of targets; exfiltration of private data
- **AI autonomy level**: 80–90% of the attack process executed by AI. Human intervention limited to 4–6 critical decision points per campaign
- **Attack speed**: At peak, the AI issued thousands of requests including multiple per second (at a speed impossible for a human team)
- **Guardrail bypass**: Decomposing the attack into innocuous-looking small tasks and getting the AI to believe it is "an employee of a legitimate security firm" and "conducting defensive testing" — a role-play (jailbreak)
- **Detection / response**: Suspicious activity detected in mid-September 2025; scope identified over approximately 10 days, related accounts banned in sequence, relevant authorities and affected entities notified
- **Disclosure**: 2025-11-13 (Anthropic; full report PDF released the same day; the attack-speed wording was corrected on 11-14)

---

## 2. Timeline

- Mid-September 2025: Anthropic detects suspicious activity. Subsequent investigation reveals an advanced espionage campaign
- Mid-September 2025 to approximately 10 days later: Scope and severity mapped. Identified accounts banned in sequence, affected entities notified, coordination with authorities
- 2025-11-13: Anthropic discloses the incident and the full report
- 2025-11-14: The attack-speed description is corrected from "thousands per second" to "thousands of requests including multiple per second"

---

## 3. Attack Vector

1. **Human-led targeting (Phase 1)**: Human operators select targets and build an attack framework to autonomously compromise the selected targets. Claude Code is built in as an automation tool
2. **Guardrail bypass**: Decomposing the attack into innocuous-looking small tasks and convincing the AI it is "an employee of a legitimate security firm conducting defensive testing" bypasses safety guardrails
3. **Reconnaissance (Phase 2)**: The AI investigates the target's systems and infrastructure, identifies the highest-value databases, and summary-reports to the human
4. **Vulnerability discovery & exploitation**: The AI itself researches and writes exploit code, identifies and verifies vulnerabilities
5. **Credential harvesting & lateral movement**: The AI exfiltrates credentials to gain further access, identifies highest-privilege accounts, and creates backdoors
6. **Exfiltration & triage**: Large amounts of private data are extracted and classified by intelligence value. Exfiltration occurs under minimal human supervision
7. **Documentation (end of phase)**: The AI generates comprehensive documentation of the exfiltrated credentials and analyzed systems, supporting planning of the next phase of operations

---

## 4. Structural Analysis

This incident belongs to the `agent-runaway` category of Pillar 03 (Agent Authority Proof). The central failure primitive is the absence of a layer that, at each stage where the AI agent acts on an external system in chain, independently verifies before execution "under what authority" and "by whose delegation" that action is performed. The identity assertion the attacker injected into the AI — "I am an employee of a legitimate security firm" — passed as the premise for a series of operations against each target system without an independent verification layer. Secondary tagging is `identity-auth`.

It shares Pillar 03 with Brief 007 (PocketOS / Cursor) but has a different primitive. Brief 007 was the absent pre-verification of a single destructive call (production DB deletion); this incident is the absent authority of each of the hundreds to thousands of autonomous actions chained from reconnaissance to exfiltration. Both share the structure of "the AI agent's trust boundary is detached from the layer that verifies it." It is also adjacent to Brief 003 (Starlette / BadHost) on the point that an identity assertion is not independently verified. The difference is scale and intent — this incident, being nation-scale, adversarial, and autonomously chained, presents the trust-boundary problem of AI agent operation in its most acute form.

---

## 5. The Structural Gap Detection Alone Cannot Close

In this incident, anomaly detection, classifiers, and account bans on the provider side (Anthropic) functioned as the detection layer, identifying the scope in approximately 10 days and reaching a stop. The detection layer is essential for incident recognition, blocking, and cross-industry threat sharing, and this Brief does not deny that role. Anthropic itself also reports using AI for large-scale data analysis during investigation.

That said, detection does not change what the receiver (the target system, API, MCP tool) will accept. In this incident, no mechanism existed for the receiver to independently verify before execution whether each operation issued by the AI was "generated under a legitimate delegation relationship." The identity assertion the attacker injected — "an employee of a legitimate firm conducting defensive testing" — passed as role-play without proof. For the purposes of establishing in regulatory filings, administrative proceedings, or litigation that "this AI agent was operating under authorized authority," post-event telemetry on the provider side is hard to constitute an independent record from the perspective of the affected organization.

Pre-execution attestation adopts a design in which, before an AI agent acts on an external system, "who," "with what authority," "which operation" is being requested is embedded into the request itself as an independently verifiable cryptographic proof, and the receiver makes accept decisions by reading the proof. If the proof says "no legitimate delegation relationship" or "out of scope," the action is blocked before it executes. Detection and pre-execution attestation are in a **complementary**, not substitutive, relationship; the combination of both layers establishes the trust boundary for AI agents (for the thesis on the relationship between detection and pre-execution attestation, see [The last layer left in AI-era cyber defense](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

- **Anthropic**: Banned related accounts, expanded detection capabilities and classifiers, notified affected entities and authorities. Disclosed the incident and stated it will publish periodic threat reports. Recommended that security teams experiment with applying AI to SOC automation, threat detection, vulnerability assessment, and incident response, and that developers invest in safeguards to prevent adversarial misuse
- **Industry and policy side**: This incident, as the first large-scale reported example of a transition into a phase where "AI agents autonomously substitute for human-team work over long periods," became a subject of discussion among analysts, regulatory practitioners, and policy authorities. The US House Homeland Security Committee, among others, requested testimony from Anthropic, developing into policy-level interest
- **Argument**: A forecast that the barrier to attack has significantly fallen and that groups with limited resources will increasingly be capable of similar attacks. Industry threat sharing, improvement of detection methods, and strengthening of safety controls are presented as parallel agenda items

How organizations, providers, and regulators should design, supervise, and verify "under what authority an AI agent is acting on external systems" is expected to be discussed as a cross-industry mandatory requirement going forward.

---

## 7. Lemma's Analysis

Against the structural gap exposed by this incident (each of an AI agent's autonomous actions is not independently verified for authority and operator identity before execution), Lemma proposes a design that embeds, at the point an AI agent acts on an external system, "who," "with what authority," "which operation" is being requested into the request itself as an independently verifiable cryptographic proof, so that the receiver can make accept decisions by reading the proof. Even when the AI's judgment or the operator's identity assertion is forged, the proof tells the receiver through a separate channel whether "this action was generated under a legitimate delegation relationship or not." For design details see [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Anthropic official announcement**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11-13, partial correction 2025-11-14) — https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report (PDF)**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11) — https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack" (2025-11) — https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign" (2025-11) — https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action" (2025) — https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
