---
brief_no: 97
title: "JadePuffer：AI エージェントが侵入から認証情報の窃取・横展開・暗号化までを、その場で判断しながら自律実行したランサムウェア攻撃"
title_en: "JadePuffer: an LLM agent autonomously ran a ransomware attack — from breach to credential theft, lateral movement, and encryption — deciding on the fly"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "identity-auth"]
incident_date: 2026-07-03
published: 2026-07-07
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["031-vibe-hacking-shadow-aether", "009-gtg1002-ai-orchestrated-espionage", "026-adaptive-ai-worm-runtime-exploit", "066-litellm-ai-gateway-privilege-escalation", "046-servicenow-unauthenticated-api"]
status: published
version: "1.0"
og_lead_ja: "JadePuffer — LLM が侵入から暗号化まで自律実行した実地のランサムウェア"
og_lead_en: "JadePuffer — an LLM ran a real-world ransomware attack from breach to encryption"
gap_detected: "The detection chain worked — the 2025 disclosure and KEV listing of CVE-2025-3248, the mapping of exposed instances, and Sysdig's behavioral analysis and publication — making the technique and its impact externally visible."
gap_missing: "There is no layer that independently verifies, before execution and separately from how the generated attack code looks, the authority of the principal requesting each action the system accepts (code execution, config change, DB operation)."
gap_fix: "Before any potentially destructive operation, verify the requesting principal's authority — decoupled from the inference loop and from how the code looks — and stop execution when no proof accompanies it, verified independently by Lemma to prevent it up front."
---

## 1. TL;DR

The cloud security firm Sysdig reported a ransomware attack in which an actor it named JadePuffer had an LLM agent carry out everything from intrusion to extortion. After gaining a foothold through the unauthenticated code execution of the internet-exposed AI app-building platform Langflow (CVE-2025-3248, CVSS 9.8), the actor delegated reconnaissance, credential hunting, lateral movement, and encryption to the LLM, which generated and revised its procedures and code on the fly for each target, self-diagnosed failures, and chose its next action. The actor reached the production Nacos configuration platform, obtained admin privileges via an authentication bypass (CVE-2021-29441) and forgery with the default JWT signing key, encrypted 1,342 configuration items, and — with an encryption key that was never stored or transmitted — made recovery impossible. The problem is not "that AI can be used for attacks"; it is that the actions the attacker's LLM generated were not authorized or verified on the target system before execution, and could not be stopped up front.

---

## 2. What happened

- **Subject**: an internet-exposed Langflow instance (a Python open-source platform for building LLM-driven apps and agent workflows) was the initial intrusion point, from which the actor reached the victim organization's production servers (MySQL and the Alibaba Nacos configuration platform).
- **Threat actor**: an actor Sysdig tracks as JadePuffer. It used an LLM as the execution engine of the attack.
- **Initial-access identifier**: CVE-2025-3248 (CVSS 9.8), an unauthenticated code-execution flaw in Langflow. Successful exploitation runs arbitrary Python code on the host where Langflow runs.
- **Published**: 2026-07-03 (Sysdig's report). The campaign was observed over several weeks.
- **Core of the technique**: the actor delegated reconnaissance, credential hunting, lateral movement, and encryption to the LLM, which generated and revised its procedures and code on the fly for each target. The payloads retained natural-language comments stating the rationale for each action, indicating they were LLM-generated.
- **Lateral movement and encryption**: after breaching Langflow, the LLM searched the system for secrets (API keys, cloud credentials, crypto wallets, config files, DB credentials) and dumped Postgres. It scanned the internal address space and reachable services and planted a cron job for persistence. It then reached the production MySQL and Nacos, obtaining admin privileges via Nacos's authentication bypass (CVE-2021-29441), token forgery using the default JWT signing key, and direct injection of a backdoor admin into the DB.
- **Damage**: it encrypted 1,342 Nacos configuration items and created an extortion table listing the ransom demand, payment address, and contact email. The encryption key was randomly generated but never stored or transmitted, making data recovery effectively impossible.

The incident came together as the following chain.

1. **Intrusion via unauthenticated code execution**: exploit an internet-exposed Langflow instance with CVE-2025-3248 to obtain arbitrary Python code execution on the host.
2. **LLM reconnaissance and secret hunting**: the LLM searches for API keys, cloud credentials, crypto wallets, config files, and DB credentials and dumps Postgres. It scans reachable internal addresses and services and looks for a MinIO address to extract additional credentials.
3. **Persistence**: it plants a cron job on the Langflow server to secure continued access.
4. **Lateral movement to production**: with a payload containing root credentials, it connects to the production server holding MySQL and the Nacos configuration platform.
5. **Taking Nacos over multiple paths**: exploiting the authentication bypass (CVE-2021-29441), forging valid tokens with Nacos's known default JWT signing key, and directly injecting a backdoor admin into the Nacos backing DB via root DB access.
6. **Real-time adaptation**: the LLM adjusted its payload to pass login verification, checked for the presence of a User Defined Function (UDF) that could lead to OS command execution, issued a completion marker, and then deployed the ransomware. It escalated stepwise from row-level deletion to deleting the entire schema, narrating its own rationale.
7. **Encryption and extortion**: it encrypted 1,342 Nacos configuration items and created an extortion table listing the ransom demand, payment address, and contact. The encryption key was never stored or transmitted, making recovery impossible.

---

## 3. Timeline — disclosure and response

- 2025-04: the unauthenticated code-execution flaw CVE-2025-3248 in Langflow is disclosed.
- Early 2025-05: CISA confirms in-the-wild exploitation and adds the flaw to the Known Exploited Vulnerabilities (KEV) catalog.
- Over several weeks: JadePuffer runs this campaign starting from exposed Langflow. Sysdig observes, across multiple sessions weeks apart, the LLM reading the target's text and choosing actions.
- 2026-07-03: Sysdig publishes its analysis of the campaign.

> Note: the technical facts and figures (1,342 encrypted configuration items, the exploited CVEs, the chain of technique) are based on Sysdig's analysis report and reporting relaying it. CVE-2025-3248, exploited for initial access, is a known flaw disclosed and KEV-listed in 2025; the novelty of this case lies in "an LLM agent autonomously carrying out the execution of the attack." Refer to the latest primary sources.

The response and industry movement after disclosure:

- **Sysdig**: analyzed and published the JadePuffer campaign. It observed, across multiple sessions, the LLM reading the target's context and adapting its actions, and warned that exposed application servers, unhardened configuration stores, and internet-facing DB admin accounts are the first surfaces to be targeted.
- **CVE-2025-3248 (Langflow)**: disclosed in 2025 and already added to CISA KEV. Updating to the fixed version and cutting off the exposure surface are the widely communicated responses.
- **Nacos**: the authentication bypass (CVE-2021-29441) and the widely known default JWT signing key were exploited. Changing the default signing key, hardening authentication, and keeping the management surface off the public internet were shared as operational points.
- **Cross-industry**: Sysdig notes that LLM agents lower the barrier to malicious operations — an attack now succeeds with "a capable model" rather than "a capable human." Because attackers can combine known techniques at near-zero cost to hit neglected platforms, this kind of campaign is expected to grow in volume and breadth as agentic tooling matures.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the actions the attacker's LLM generated and revised on the fly by reading the target's state were not independently verified on the target system — "may this principal perform this action" — before execution, and could not be stopped up front.** Each step of the attack was not a pre-written fixed script but was dynamically assembled by the LLM according to the information the target returned, so detection premised on matching known patterns is inherently one step behind.

This case is in the same lineage as [Brief 009](/critical/briefs/009-gtg1002-ai-orchestrated-espionage/) (GTG-1002, the first report of an AI agent autonomously carrying out 80–90% of a cyber attack) and [Brief 031](/critical/briefs/031-vibe-hacking-shadow-aether/) (an AI agent carrying out everything from initial intrusion to data exfiltration), in which AI takes on the execution of the attack itself. The differentiator is that, where GTG-1002 centers on espionage and No. 031 on the dynamic generation of attack tools, this case is **autonomous ransomware (extortion) in the field** — a real-world record of an LLM rewriting code per target, self-diagnosing failures, and choosing and narrating the stage of destruction itself. The "runtime generation" that [Brief 026](/critical/briefs/026-adaptive-ai-worm-runtime-exploit/) (an autonomous AI worm, a threat model that generates attack strategy at runtime) presented as a research model was observed here as real damage. That the initial intrusion is Langflow's unauthenticated code execution (CVE-2025-3248), and that the lateral-movement target Nacos was taken over via a default JWT signing key and an authentication bypass, connect — as with [Brief 066](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/) (LiteLLM, reaching AI-gateway admin and code execution while holding only ordinary privileges) and [Brief 046](/critical/briefs/046-servicenow-unauthenticated-api/) (ServiceNow, unauthenticated querying via a single setting) — to the platform trait in which "reach equals execution" and the pre-action authority-verification layer is missing.

In an era where agents autonomously generate their actions, defenders cannot keep up merely by matching "how the attack code looks." Whether the actor generating the action is a human or an LLM, only when the authority of the principal requesting each "action" the system accepts is independently verified outside the inference loop — and the record of that action is retained tamper-resistantly — can a platform be safely placed into production use.

The early CVE disclosure (the 2025 disclosure and KEV listing of CVE-2025-3248), the mapping of exposed instances, and Sysdig's behavioral analysis and publication are indispensable for shrinking the exposure surface and prioritizing the response, and this Brief does not diminish that role. Detecting known exploitation patterns and ransomware artifacts also aids early discovery of harm. Detection does play its part.

But here the attack code was newly generated by the LLM per target and rewritten in response to failures. As Sysdig notes, the LLM acts by reading the free-form context the target presents, which is hard for a scanner's pattern-matching to capture. Detection that depends on signatures or patterns is inherently one step behind a novel artifact not yet observed. What was missing is a layer that independently verifies, before execution, the authority of the principal requesting each action the system accepts (code execution, config change, DB operation) and blocks it when no proof of authority accompanies it — verification on a separate track from detection that discerns the contents of attack code. In addition, as material to prove in an after-the-fact audit that "this chain of destructive operations was by a legitimately authorized principal," the mere fact that operations were recorded in system logs is not an independent record of the action's principal and authority.

---

## 5. What proof would have changed

Pre-execution attestation independently verifies, before a potentially destructive operation (code execution, encryption of a config, schema deletion), the authority of the principal requesting it — decoupled from the inference loop and from how the code looks. When no proof of authority accompanies it, execution is blocked beforehand even if the action was newly generated. Alongside this, recording the provenance of executed actions tamper-resistantly enables after-the-fact proof and disambiguation. Detecting attack code (the detection-flavored "this looks malicious") and pre-execution proof of authority per action ("this principal holds the authority to perform this operation") are **complements**, not substitutes; only when the two overlap can an environment where autonomous agents generate actions be safely put into production.

Against the detection-versus-proof gap this case exposed — the actions an LLM generates run without independent verification of the principal's authority before execution — Lemma proposes the following design.

- **Pre-execution proof of authority per action**: before a potentially destructive operation such as code execution, a config change, or a DB operation, independently verify the authority of the principal requesting it, decoupled from the inference loop and from how the code looks, and reject execution beforehand when no proof accompanies it (proof-as-auth).
- **A deterministic boundary outside the inference loop**: whether the actor generating an action is a human or an LLM, place the authorization of the actions the system accepts not on the model's output itself but on an external, deterministic verification layer.
- **Tamper-resistant recording of action provenance**: fix the provenance of executed actions tamper-resistantly, making it possible to prove after the fact "which principal, with what authority, executed what."
- **Selective disclosure**: prove only that "this principal holds the authority to perform this operation," with minimal disclosure, without revealing the principal's authority attributes themselves.

Detection (after-the-fact exploitation detection, vulnerability patching, mapping the exposure surface) works to remediate harm; pre-execution proof (independent verification of authority before a destructive operation) works to establish trust in an autonomous-agent environment — each complementary.

---

## 6. Sources

- **Sysdig**: “JadePuffer: agentic ransomware for automated database extortion” — <https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion>
- **SecurityWeek**: “Agentic AI Used to Conduct Ransomware Attack via Langflow” (2026-07-03) — <https://www.securityweek.com/agentic-ai-used-to-conduct-ransomware-attack-via-langflow/>
- **NVD**: CVE-2025-3248 (Langflow unauthenticated code execution) — <https://nvd.nist.gov/vuln/detail/CVE-2025-3248>
