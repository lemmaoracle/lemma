---
brief_no: 31
title: "AI エージェントが初期侵入から情報持ち出しまでを実行した — 署名ベースの検出は、AI が標的ごとに作るツールを追えない(SHADOW-AETHER-040 / 064)"
title_en: "AI Agents Drove Intrusions From Initial Access to Exfiltration — Signature-Based Detection Cannot Track Tooling the AI Generates Per Target (SHADOW-AETHER-040 / 064)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "identity-auth"]
incident_date: 2026-05-11
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["009-gtg1002-ai-orchestrated-espionage", "026-adaptive-ai-worm-runtime-exploit", "007-pocketos-cursor-db-deletion"]
version: "1.0"
status: published
og_lead_ja: "AI が侵入から情報持ち出しまでを自律実行 — SHADOW-AETHER"
og_lead_en: "AI agents ran intrusions end to end — SHADOW-AETHER"
---

## TL;DR

On 2026-05-11, Trend Micro (TrendAI Research) disclosed **two campaigns in which agentic AI drove intrusion operations** (SHADOW-AETHER-040 / SHADOW-AETHER-064) against government and financial-sector organizations across Latin America. Trend Micro frames these as among the earliest observed cases of AI agents executing the chain from initial access through exfiltration. SHADOW-AETHER-040 (Spanish-speaking) has been active since late 2025 and compromised six Mexican government agencies between 2025-12-27 and 2026-01-04, running the full kill chain with AI-agent assistance. SHADOW-AETHER-064 (Portuguese-speaking) has targeted Brazilian financial institutions since April 2026. The decisive detail: rather than relying on off-the-shelf tooling, **the AI agent generated attack tools and scripts dynamically, per target**, lowering the catch rate of conventional detection that depends on the signatures of known tools. This case illustrates a structure in the `agent-runaway` category of Pillar 03 (Agent Authority Proof): **when the tools and operations being executed carry no stable signature, detection must give way to verifying the authorization and provenance of what is allowed to run.** It is a field-observed exemplar that extends Brief 009 (GTG-1002) and 026 (the adaptive AI worm).

---

## 1. Incident overview

- **Targets**: government and financial-sector organizations in Latin America (also aviation and retail)
- **Disclosure**: 2026-05-11, Trend Micro (TrendAI Research)
- **Campaigns**:
  - **SHADOW-AETHER-040** (Spanish-speaking): active since late 2025. Compromised six Mexican government agencies between 2025-12-27 and 2026-01-04, running the full kill chain (initial access → lateral movement → data theft) with AI-agent assistance.
  - **SHADOW-AETHER-064** (Portuguese-speaking): active since April 2026. Targeting Brazilian financial institutions; compromised vulnerable JBoss AS servers, planted webshells, and built SOCKS5 tunnels with tools such as Chisel.
- **Common ground**: both established tunnels into victim networks via ProxyChains and SSH, letting the AI agent attack the internal network directly. They shared Chisel / Neo-reGeorg / CrackMapExec / Impacket.
- **Core of the abuse**: the AI agent **generated attack tools and scripts dynamically** (SHADOW-AETHER-040 used an AI-generated Python backdoor, `implante_http`), evading detection that depends on the signatures of off-the-shelf tools.
- **How the agent was used**: SHADOW-AETHER-040 did not fully delegate to the AI but used it as a supervised assistant (pausing and correcting on deviation). Shodan and VulDB were connected to the AI to obtain attack-surface and vulnerability information. A dedicated folder per victim documented attack steps and collected intelligence in Markdown, serving as the AI's operational knowledge base so it could restore context and continue work.
- **Attribution**: the two are near-identical in tooling and tactics, but the language of scripts and binaries (Spanish vs. Portuguese) points to separate groups — a sign that AI-assisted attacks are spreading across multiple groups, not a single actor.

---

## 2. Timeline

- Late 2025: SHADOW-AETHER-040 begins operations (tracked by Trend Micro)
- 2025-12-27 to 2026-01-04: SHADOW-AETHER-040 compromises six Mexican government agencies, including cases reaching data theft with AI-agent assistance
- From 2026-04: SHADOW-AETHER-064 observed targeting Brazilian financial institutions
- 2026-05-11: Trend Micro (TrendAI Research) discloses both campaigns

---

## 3. Attack vector

1. **Initial access**: compromise a vulnerable public-facing server (JBoss AS for SHADOW-AETHER-064) and plant a webshell. Identify attack surface and vulnerabilities via Shodan / VulDB.
2. **Tunnel establishment**: build SOCKS5 tunnels with tools such as Chisel plus ProxyChains + SSH, so the AI agent reaches the victim's internal network directly.
3. **AI-driven dynamic tool generation**: rather than relying on off-the-shelf tools, the AI generates attack tools and scripts on the fly, tailored to the target environment (`implante_http`, etc.), evading signature-based detection.
4. **Maintaining working memory**: accumulate steps and collected intelligence in Markdown in a per-victim folder, letting the AI restore context and continue unfinished tasks.
5. **Kill-chain execution**: from initial access through lateral movement to data theft, progressing with AI-agent assistance. For SHADOW-AETHER-040, a human supervises and corrects on deviation.

---

## 4. Structural analysis

This case belongs to the `agent-runaway` category of Pillar 03 (Agent Authority Proof). The central failure primitive is that **the tools and operations used in the attack are AI-generated per target and carry no stable signature, so the premise of detection — "match against known malicious artifacts" — breaks down.** Secondary categories are `agent-infrastructure` (the Shodan/VulDB and tunneling infrastructure wired into the AI) and `identity-auth`.

This is the same lineage as Brief 009 (GTG-1002) and 026 (the adaptive AI worm), in which the AI becomes the executing actor of the attack. 009 is Anthropic's disclosure of a state-sponsored actor abusing Claude Code (running 80–90% of the attack autonomously); 026 is a threat model that generates attack strategy at runtime. This case confirms that primitive **as multiple independent campaigns observed in the field by Trend Micro**, grounding 009/026 in real loss and compromise. In particular, the practice of generating tooling per target rather than reusing it undermines the very stability that detection relies on — IOCs, tool signatures, known TTPs — showing that defenders cannot enumerate "what is malicious" in advance.

The fact that SHADOW-AETHER-040 and 064 were near-identical apart from language also shows that AI-assisted attacks are not the exclusive province of a single advanced actor but are **spreading as an isomorphic operating model across distinct groups.** This is a signal that AI has changed the cost and reproducibility of attacks — a longer-reaching one than any single-vulnerability news item.

---

## 5. The detection–proof gap

Campaign identification, IOC provision, and MITRE ATT&CK mapping by threat researchers like Trend Micro are indispensable for understanding, containing, and hardening against the damage; this Brief does not dispute that role. Detailed TTPs and IOCs were published for this case as well.

But detection does not change "what is allowed to run in the environment" itself. The core of this case is that the tools the AI generates per target carry no stable signature, so IOCs and known-tool matching are inherently reactive. A generated backdoor or script becomes an IOC only once observed and analyzed — and a different one is generated for the next target. What was missing is independent, pre-execution verification of "is the operation or tool about to run in this environment one that is legitimately authorized and has confirmed provenance?" — a different track from detecting known artifacts. For audit, too, after a compromise there is little independent trail beyond reconciling logs with forensics to prove "which operation ran, under whose authorization, by which path."

Pre-execution attestation inverts detection from "matching known malicious artifacts" to "verifying, before execution, whether the operation or code about to run is authorized and carries provenance." Even when a tool is unknown or freshly generated, if the proof reports "this operation has no legitimately authorized provenance," execution is blocked in advance. Signature-based detection (the detection-style "is this known-malicious?") and pre-execution proof of operations (the "is this an authorized, provenanced execution?") are not substitutes but **complements** — and in a world where attack tooling is AI-generated and carries no signature, the weight shifts toward the latter.

---

## 6. Response and industry context

- **Trend Micro (TrendAI Research)**: identified and disclosed both campaigns, presented MITRE ATT&CK TTPs and IOCs, and committed to continued tracking. Framed them as among the earliest observed cases of AI agents executing the chain from initial access through exfiltration.
- **Cross-industry**: attackers' use of AI has long been predicted, but this case marks a turn from "prediction" to "observed as multiple independent campaigns." Evasion of signature detection via dynamic tool generation demonstrates, in the field, the limits of an IOC- and signature-centric defense model, and pushes the argument to shift defensive weight toward runtime authorization and provenance verification.
- **A note on positioning**: this case is a separate campaign from the state-sponsored AI-autonomous attack disclosed elsewhere (Brief 009 = GTG-1002). The two share the root of "the AI becoming the executing actor of the attack," but differ in actor, target, and disclosing party, so we link them as related.

---

## 7. Lemma's analysis

Against the structural problem exposed here (attack tools are AI-generated per target and carry no stable signature, so detection that relies on matching known artifacts is left reactive), Lemma proposes a design that inverts detection from "matching known malicious artifacts" to "pre-execution verification of the authorization and provenance of the operation or code about to run." Even when a tool is unknown, if the proof of the operation's authorization and provenance does not hold, execution is rejected in advance.

---

## 8. Sources

- **Trend Micro (TrendAI Research)**: "Vibe Hacking: Two AI-Augmented Campaigns Target Government and Financial Sectors in Latin America" (2026-05-11; campaign details, TTPs, IOCs, MITRE ATT&CK) — https://www.trendmicro.com/en_us/research/26/e/vibe-hacking-two-ai-augmented-campaigns-target-government-and-financial-sectors-in-latin-america.html
- **Dark Reading**: "LatAm Vibe Hackers Generate Custom Hacking Tools on the Fly" (2026-05) — https://www.darkreading.com/cloud-security/ai-agents-generate-custom-hacking-tools

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
