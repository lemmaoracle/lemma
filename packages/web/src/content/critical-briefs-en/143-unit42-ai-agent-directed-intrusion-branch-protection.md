---
brief_no: 143
title: "人間の攻撃者が指揮する複数のフロンティアAIエージェントが、企業ネットワークを10時間未満で侵害した(Unit 42調査) — その場で止まった工程は、行動の前に認可を要求する仕組みが働いた一箇所だけだった"
title_en: "A human attacker directing multiple frontier AI agents breached an enterprise network in under 10 hours (Unit 42) — the only step stopped in real time was the one place a pre-action authorization gate was enforced"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [identity-auth, agent-infrastructure]
incident_date: 2026-09-02
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["009-gtg1002-ai-orchestrated-espionage", "128-coding-agent-harness-authority-gap", "130-atlassian-rovo-instruction-provenance"]
status: published
version: "1.0"
og_lead_ja: "Unit 42、AIエージェント主導の侵入が10時間未満で完了と報告"
og_lead_en: "Unit 42: AI-agent-run intrusion completed in under 10 hours"
---

## 1. TL;DR

On September 2, 2026, Unit 42, Palo Alto Networks' threat intelligence arm, published its response to an incident in which a human attacker directed frontier AI models and attack-specific agentic frameworks to autonomously breach an enterprise network. Intrusion tradecraft that would normally take about two weeks by hand — over 50 MITRE ATT&CK techniques — was compressed into under 10 hours, with stolen tokens, credentials, and cloud keys used one after another to widen the breach. Detection worked as forensic reconstruction after the fact. **The only step stopped in real time, during those 10 hours, was the one place a pre-action authorization gate was enforced: branch protection, which blocked an attempted backdoor in Terraform.**

## 2. What happened

- On September 2, 2026, Unit 42 published a blog analyzing its response to an incident. The threat actor told Unit 42, during negotiations, that they had used frontier AI models and attack-specific agentic AI frameworks.
- The agents worked through the company's security layers methodically, each targeting a different layer of defense toward a shared goal. Unit 42 assessed the impact as being at the scale of a coordinated effort from multiple red teams, work that would normally take human operators around two weeks.
- The intrusion itself required no novel zero-day or elite tradecraft; what stood out, Unit 42 writes, was AI-assisted operational efficiency. The attacker left tactical execution to the agents, which monitored, evaluated, acted, and re-planned in real time, increasing speed throughout the attack chain.
- The attacker also directed an agent to leave behind an 80-page technical audit of the victim organization's security posture, detailing dozens of exploited findings.
- Unit 42 observed several indicators of AI use: parallel LLM calls to multiple frontier AI agents, structured Markdown files passing information between agents and sessions, and custom scripts — assessed with high confidence to be AI-generated based on UI elements — managing dynamic operations.

The attack proceeded in five stages.

1. **Infiltration and mapping**: The attacker breached a publicly accessible web service to tunnel into the network, then deployed an automated recon agent to map internal microservices.
2. **Secrets harvesting**: Sub-agents combed enterprise code repositories, extracting hard-coded tokens and service passwords.
3. **Privilege takeover**: Using the exposed tokens, the attacker infiltrated the secrets management system, harvesting master administrative credentials to seize root system access.
4. **Pipeline exploitation**: The attacker hijacked an enterprise code integration application via custom workflows to exfiltrate cloud access keys. An attempt to plant backdoors in Terraform configurations was stopped by enforced branch-protection controls.
5. **AI infrastructure hijacking**: Using the stolen cloud keys, the attacker turned the victim's AI endpoints into post-compromise infrastructure, using the victim's own compute power for future moves.

## 3. Timeline — disclosure and response

- (Undisclosed): The entire operation was completed in under 10 hours. The victim organization's name, industry, and the actual date of the attack are all undisclosed.
- 2026-09-02: Unit 42 publishes its findings.
- 2026-09-03: Unit 42 issues a correction clarifying the incident was an intrusion, not a ransomware attack.
- 2026-09-04: Minor clarifying copyedits.

> This brief treats Unit 42's self-published report (posted 2026-09-02, corrected 2026-09-03 and 2026-09-04) as its primary source. **Initial coverage framed this as a "ransomware attack," but Unit 42's September 3 correction clarified it was an intrusion, not a ransomware attack.** The attacker reportedly described its AI usage to Unit 42 "in negotiations," but the nature of any ransom demand, the victim's industry or size, and the attacker's identity remain undisclosed. This brief does not treat these as established facts and confines itself to the published technical chain and lessons.

Lessons Unit 42 drew from the incident:

- AI agents reduce the time between steps in the attack flow, since they are designed to parse raw tool output and act on it immediately.
- AI agents leave recognizable indicators — structured Markdown, Python caches, and paired asset folders among them, per Unit 42.
- Attackers can use AI agents to build and maintain redundant persistence in parallel across SSH keys, serverless functions, container restart policies, cloud identities, and CI/CD pipelines.
- Attackers can hijack a victim's own AI tools as post-compromise infrastructure, hiding command traffic among expected traffic and shifting compute cost onto the victim.

## 4. Why it wasn't stopped

This incident's failure is neither an unknown vulnerability nor elite tradecraft. **Across most of the chain, a stolen token, credential, or cloud key being formally "valid" was the sole basis on which the next action was allowed — no layer independently re-verified that action's legitimacy each time.**

Detection worked as forensic reconstruction after the fact. Unit 42 was able to reassemble the attack chain hour by hour from traces left in structured Markdown and custom scripts. But while the attack was under way, only one of the five stages was stopped in real time: branch protection, which blocked the attempted backdoor in the Terraform configuration. Every other stage — secrets harvesting, privilege takeover, exfiltrating cloud keys, hijacking AI infrastructure — went through on the strength of one fact alone: the stolen token or key was formally valid.

> "The attacker left tactical execution to AI agents that monitored, evaluated, acted and re-planned in real time, increasing speed throughout the attack chain." — from Unit 42's blog.

Branch protection worked for a simple reason: it didn't ask whether a valid credential was presented, but whether multiple parties could confirm, before the change was made, that this actor was allowed to make it. None of the other four stages had an equivalent layer — the formal validity of a stolen key or token alone carried the attacker from the secrets manager all the way to hijacking AI infrastructure.

The same shape appears in [Brief 009](/critical/briefs/009-gtg1002-ai-orchestrated-espionage/), a state-linked campaign in which an AI agent autonomously executed 80-90% of the attack, and in [Brief 128](/critical/briefs/128-coding-agent-harness-authority-gap/), where coding agents in their default configuration reached CI execution from a single unauthorized instruction.

## 5. What proof would have changed

Proof before the fact replaces "the token, credential, or cloud key is valid" with "this action, by this actor, at this moment, was independently verified as authorized" as the basis for allowing the next step. It does not stop AI agents from making attack execution faster. It keeps that speed from bypassing per-action authorization.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Proof of authorization per action</strong>: separate "the token, credential, or cloud key is formally valid" from "this request, at this moment, comes from a party legitimately entitled to take this action."</li>
<li><strong>Consistent enforcement of pipeline provenance protection</strong>: extend the kind of pre-action authorization gate that branch protection provided in this incident — the only one that worked — across every stage an agent can reach, not just CI/CD and IaC changes, but access to the secrets manager and cloud infrastructure as well.</li>
<li><strong>Authorization for calls into AI infrastructure itself</strong>: gate access to an organization's own AI endpoints and model invocations on more than API key validity — verify the caller is a legitimate internal system.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not substitute for the technical fixes to the initial access route itself — patching and vulnerability management for the public-facing web service.</li>
<li>It does not prove how the tokens and credentials first leaked — the pre-intrusion hygiene issue of hard-coding them into repositories.</li>
<li>It does not substitute for attacker attribution, legal response, or handling of any ransom negotiation.</li>
</ul>

The difference from forensic reconstruction is here: traces in Markdown and scripts remain after the attack, and being able to reassemble the intrusion chain from them is not the same as stopping the next action the moment it happens.

Detection and this layer are complementary, not substitutes. The former surfaces the chain of AI-driven activity after the fact; the latter makes "a valid key is not the same as being allowed to act" something verifiable before the next stage proceeds.

## 6. Sources

- **Unit 42 / Palo Alto Networks (primary, self-published research)**: "An AI-Assisted Cyber Attack: Inside a Unit 42 Investigation" (published 2026-09-02, corrected 2026-09-03/09-04) — <https://unit42.paloaltonetworks.com/ai-assisted-cyber-attack-inside-a-unit-42-investigation/>
- **The Register (independent)**: "AI agents carried out every step of this ransomware attack – then left the victim an 80-page security audit" (2026-09-02) — <https://www.theregister.com/security/2026/09/02/ai-agents-carried-out-every-step-of-this-ransomware-attack-then-left-the-victim-an-80-page-security-audit/5294009>
- **Cybernews (independent)**: "AI agents speed ransomware breach to under 10 hours" — <https://cybernews.com/security/ai-agents-ransomware-attack-security-audit/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

Figures and the sequence of events are based on Unit 42's self-published report (2026-09-02, corrected 2026-09-03/09-04). The victim organization's name, industry, the actual date of the attack, and the attacker's identity remain undisclosed as of this writing.
