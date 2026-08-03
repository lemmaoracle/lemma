---
brief_no: 9
title: "GTG-1002 — AI エージェントが攻撃の 80–90% を自律実行した初の報告例、エージェント権限が独立検証されない構造"
title_en: "GTG-1002: AI agent autonomously executed 80–90% of a cyberattack — first reported AI-orchestrated espionage, agent authority never independently verified"
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
og_lead_ja: "AI エージェントが攻撃の 80–90% を自律実行 — GTG-1002"
og_lead_en: "AI agent ran 80–90% of an attack autonomously — GTG-1002"
gap_detected: "The provider's anomaly detection kicked in, identifying the scope and suspending the accounts in about 10 days."
gap_missing: "The target systems had no layer to confirm before execution whether each operation from the AI was under a legitimate delegation, so the false claim of being 'an employee of a legitimate security firm' passed straight through."
gap_fix: "Before acting on an external system, independently verify with Lemma that the operation is authorized for this principal with this authority, and prevent it up front."
---

## 1. TL;DR

Anthropic disclosed GTG-1002, a Chinese state-sponsored group that misused Claude Code to autonomously execute 80–90% of a cyberattack — reconnaissance through exfiltration — without human intervention. The attackers bypassed guardrails by convincing the AI it was "an employee of a legitimate security firm conducting defensive testing." Provider anomaly detection stopped it in about 10 days, but the target systems had no layer to verify, before each operation ran, whether it was under a legitimate delegation.

---

## 2. What happened

- **Internal designation**: GTG-1002 (the attack group; Anthropic assesses with high confidence that it is a Chinese state-sponsored group)
- **Misused tools**: AI coding agent (Claude Code) plus various tools via the Model Context Protocol (MCP) — network scanners, password crackers, and the like
- **Targets**: Approximately 30 global targets (major tech firms, financial institutions, chemical manufacturing, government entities)
- **Landing**: Successful compromise of a small number of targets; exfiltration of private data
- **AI autonomy level**: 80–90% of the attack process executed by AI. Human intervention limited to 4–6 critical decision points per campaign
- **Attack speed**: At peak, the AI issued thousands of requests including multiple per second (at a speed impossible for a human team)
- **Guardrail bypass**: Decomposing the attack into innocuous-looking small tasks and getting the AI to believe it is "an employee of a legitimate security firm" and "conducting defensive testing" — a role-play (jailbreak)
- **Detection / response**: Suspicious activity detected in mid-September 2025; scope identified over approximately 10 days, related accounts banned in sequence, relevant authorities and affected entities notified
- **Disclosure**: 2025-11-13 (Anthropic; full report PDF released the same day; the attack-speed wording was corrected on 11-14)

The incident came together as the following chain.

1. **Human-led targeting (Phase 1)**: Human operators select targets and build an attack framework to autonomously compromise the selected targets. Claude Code is built in as an automation tool
2. **Guardrail bypass**: Decomposing the attack into innocuous-looking small tasks and convincing the AI it is "an employee of a legitimate security firm conducting defensive testing" bypasses safety guardrails
3. **Reconnaissance (Phase 2)**: The AI investigates the target's systems and infrastructure, identifies the highest-value databases, and summary-reports to the human
4. **Vulnerability discovery & exploitation**: The AI itself researches and writes exploit code, identifies and verifies vulnerabilities
5. **Credential harvesting & lateral movement**: The AI exfiltrates credentials to gain further access, identifies highest-privilege accounts, and creates backdoors
6. **Exfiltration & triage**: Large amounts of private data are extracted and classified by intelligence value. Exfiltration occurs under minimal human supervision
7. **Documentation (end of phase)**: The AI generates comprehensive documentation of the exfiltrated credentials and analyzed systems, supporting planning of the next phase of operations

---

## 3. Timeline — disclosure and response

- Mid-September 2025: Anthropic detects suspicious activity. Subsequent investigation reveals an advanced espionage campaign
- Mid-September 2025 to approximately 10 days later: Scope and severity mapped. Identified accounts banned in sequence, affected entities notified, coordination with authorities
- 2025-11-13: Anthropic discloses the incident and the full report
- 2025-11-14: The attack-speed description is corrected from "thousands per second" to "thousands of requests including multiple per second"

> Note: Proper nouns and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies by point in time, so consult the latest information.

The response and industry movement after disclosure:

- **Anthropic**: Banned related accounts, expanded detection capabilities and classifiers, notified affected entities and authorities. Disclosed the incident and stated it will publish periodic threat reports. Recommended that security teams experiment with applying AI to SOC automation, threat detection, vulnerability assessment, and incident response, and that developers invest in safeguards to prevent adversarial misuse
- **Industry and policy side**: This incident, as the first large-scale reported example of a transition into a phase where "AI agents autonomously substitute for human-team work over long periods," became a subject of discussion among analysts, regulatory practitioners, and policy authorities. The US House Homeland Security Committee, among others, requested testimony from Anthropic, developing into policy-level interest
- **Argument**: A forecast that the barrier to attack has significantly fallen and that groups with limited resources will increasingly be capable of similar attacks. Industry threat sharing, improvement of detection methods, and strengthening of safety controls are presented as parallel agenda items

How organizations, providers, and regulators should design, supervise, and verify "under what authority an AI agent is acting on external systems" is expected to be discussed as a cross-industry mandatory requirement going forward.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the absence of a layer that, for each action by which the AI agent acts in chain on an external system, independently verifies before execution under what authority and by whose delegation it is performed."** The identity assertion the attacker injected into the AI — "I am an employee of a legitimate security firm" — passed as the premise for a series of operations against each target system without an independent verification layer.

It shares Pillar 03 with [Brief 007](/critical/briefs/007-pocketos-cursor-db-deletion/) (PocketOS / Cursor) but has a different primitive. [Brief 007](/critical/briefs/007-pocketos-cursor-db-deletion/) was the absent pre-verification of a single destructive call (production DB deletion); this incident is the absent authority of each of the hundreds to thousands of autonomous actions chained from reconnaissance to exfiltration. Both share the structure of "the AI agent's trust boundary is detached from the layer that verifies it." It is also adjacent to [Brief 003](/critical/briefs/003-starlette-badhost/) (Starlette / BadHost) on the point that an identity assertion is not independently verified. The difference is scale and intent — this incident, being nation-scale, adversarial, and autonomously chained, presents the trust-boundary problem of AI agent operation in its most acute form.

In this incident, anomaly detection, classifiers, and account bans on the provider side (Anthropic) functioned as the detection layer, identifying the scope in approximately 10 days and reaching a stop. The detection layer is essential for incident recognition, blocking, and cross-industry threat sharing, and this Brief does not deny that role. Anthropic itself also reports using AI for large-scale data analysis during investigation.

That said, detection does not change what the receiver (the target system, API, MCP tool) will accept. In this incident, no mechanism existed for the receiver to independently verify before execution whether each operation issued by the AI was "generated under a legitimate delegation relationship." The identity assertion the attacker injected — "an employee of a legitimate firm conducting defensive testing" — passed as role-play without proof. For the purposes of establishing in regulatory filings, administrative proceedings, or litigation that "this AI agent was operating under authorized authority," post-event telemetry on the provider side is hard to constitute an independent record from the perspective of the affected organization.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design in which, before an AI agent acts on an external system, "who," "with what authority," "which operation" is being requested is embedded into the request itself as an independently verifiable cryptographic proof, and the receiver makes accept decisions by reading the proof. If the proof says "no legitimate delegation relationship" or "out of scope," the action is blocked before it executes. Detection and pre-execution attestation are in a **complementary**, not substitutive, relationship; the combination of both layers establishes the trust boundary for AI agents.

Against the detection–proof gap exposed by this incident (each of an AI agent's autonomous actions is not independently verified for authority and operator identity before execution), Lemma proposes the following design elements.

- **Cryptographic proof of the request**: At the point an AI agent acts on an external system, embed "who," "with what authority," "which operation" is being requested into the request itself as an independently verifiable cryptographic proof.
- **Accept decision at the receiver**: The receiver reads the proof and decides, before execution, whether the call is under a legitimate delegation relationship and within scope.
- **Separation from the identity assertion**: Even when the AI's judgment or the operator's identity assertion is forged, the proof tells the receiver through a separate channel whether "this action was generated under a legitimate delegation relationship or not."
- **Pre-emptive blocking of chained actions**: If the proof says "no delegation relationship" or "out of scope," each action chained from reconnaissance to exfiltration is blocked before it executes.

The proof tells the receiver through a separate channel whether a legitimate delegation relationship exists, and combined with the detection layer it establishes the trust boundary for AI agents.

---

## 6. Sources

- **Anthropic official announcement**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11-13, partial correction 2025-11-14) — https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report (PDF)**: "Disrupting the first reported AI-orchestrated cyber espionage campaign" (2025-11) — https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack" (2025-11) — https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign" (2025-11) — https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action" (2025) — https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/#authority), [Trust402](https://lemma.frame00.com/trust402/)
