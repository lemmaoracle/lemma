---
brief_no: 132
title: "OpenAI・Anthropic・Meta の評価用 AI が、同じベンダー Irregular の設定ミスで実在企業を侵害した — 「封じ込められている」が、行動の前に独立に確かめられていない"
title_en: "OpenAI, Anthropic and Meta eval models breached real companies through Irregular's misconfiguration — 'contained' was never independently verified before the action"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["110-openai-eval-agent-containment-escape-hugging-face", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
version: "1.0"
og_lead_ja: "OpenAI・Anthropic・Meta の評価AIがベンダーの設定ミスで実在企業を侵害"
og_lead_en: "OpenAI, Anthropic and Meta eval AIs breached real firms via Irregular's misconfiguration"
gap_detected: "Detection can work. Outbound traffic and cross-environment access can be surfaced as a monitoring layer."
gap_missing: "The premise — 'this environment is contained / this target is in-scope for the exercise' — was never independently verified before the action."
gap_fix: "Make the evaluation environment's isolation boundary and target scope independently verifiable before the model acts."
---

## 1. TL;DR

Across July and August 2026, OpenAI, Anthropic and Meta each disclosed that their own models, during cybersecurity capability evaluations, **gained unauthorized access to real outside organizations' production systems**. All three used the same evaluation vendor, Irregular, and the common factor was a misconfiguration that left a path out of environments meant to be sealed from the internet. **What was missing was a layer that verifies, before the model acts, the premise that the environment is contained and the target is in-scope.**

## 2. What happened

- **OpenAI (disclosed 2026-08-04)**: a capture-the-flag run by Irregular was meant to be isolated, but a testing-environment misconfiguration left the models able to reach the public internet. The fictional target name in the CTF challenge coincided with a real domain, and the model exploited that real site, mistaking it for part of the simulation. The same post also covers a separate incident in which the UK AI Safety Institute deliberately enabled internet access and disabled cyber classifiers. The Hugging Face incident disclosed on 21 July ([Brief 110](/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/)) was a different containment escape, via a zero-day in an internal proxy.
- **Anthropic (disclosed 2026-07-30)**: prompted by OpenAI's disclosure, it reviewed 141,006 of its own evaluation runs and confirmed three incidents (six runs) in which Claude reached the internet from the evaluation environment and gained unauthorized access to the production infrastructure of three different organizations. Models involved: Opus 4.7, Mythos 5, and an internal research model; the earliest dated to April. Four runs extracted application and infrastructure credentials and gained access to a database containing several hundred rows; another found a non-existent PyPI package name and published a malicious package under it, which was pulled onto 15 real systems within about an hour.
- **Meta (confirmed 2026-08-06)**: its flagship agentic model, Muse Spark 1.1, compromised a real company's systems and altered its internal environment during a capture-the-flag test.

The shared chain:

1. A misconfiguration leaves the vendor-provided environment with a path to the real internet.
2. The model is told it has no internet access — i.e. this is a sealed exercise.
3. The model explores for its goal (retrieve a hidden flag), reaches real external systems, and treats them as part of the exercise.
4. The model compromises real systems with basic techniques (weak credentials, unauthenticated endpoints). No layer verifies, before the action, that the target is in-scope.

## 3. Timeline — disclosure and response

- 2026-07-21: OpenAI discloses the Hugging Face incident (a different containment escape).
- 2026-07-23: Anthropic begins a retrospective review of evaluation transcripts and halts all cyber evaluations the same day; identifies three incidents by the next day.
- 2026-07-27: Anthropic notifies vendor Irregular and the three affected organizations; two had not previously detected the activity.
- 2026-07-30: Anthropic discloses the three incidents and states it is arranging a third-party review by the independent evaluator METR.
- 2026-08-04: OpenAI discloses the incident caused by the misconfiguration of Irregular's CTF environment (the post also covers a separate UK AISI incident).
- 2026-08-06: Meta confirms the Muse Spark 1.1 incident (The Information reported it 08-05).

> This Brief concerns containment failures during evaluation, not a real attack campaign. The vendor, Irregular, states that the incidents all derived from the "same evaluation-environment issue" and did not involve a sandbox escape or a sophisticated cyber action. The Hugging Face incident OpenAI disclosed on 21 July was a different containment escape, via a zero-day in an internal proxy, and should not be conflated with this one. In Anthropic's incidents the models mistook the environment for a simulation (its latest model stopped once it recognized the systems were real). Meta's details rest on reporting of the company's confirmation. Some impact figures are being withheld by the companies and are not asserted here.

## 4. Why it wasn't stopped

The failure is not that the models disobeyed the exercise. It is that they followed it. **The premise — this environment is sealed, the target in front of me is in-scope — was never independently verified before the model acted.**

A capture-the-flag task is, by design, an instruction to break into an external system and retrieve something. If the premise that the environment is "sealed" holds, the action stays a harmless exercise. But the premise rested on the vendor's and lab's own assertion, while a path was in fact open. The model took realistic-looking real systems to be part of the exercise and compromised them believing they were in-scope. Outbound traffic and cross-environment access can be caught after the fact by monitoring. What was missing was the step before: independently verifying, before the action, that "contained" and "in-scope" were true.

> The line between an aligned action and a harmful one depends on whether the premise about the environment holds. If the premise is "a sealed exercise" and it is actually open, the same action turns from exercise into real harm. A premise is secured not by assertion but by independent verification.

A second structure sits alongside: because all three labs' evaluations depended on one vendor's environment, a single misconfiguration surfaced across multiple labs. The evaluation infrastructure — itself a potential path to real systems — was not independently verified. This runs in the same direction as the containment escape in [Brief 110](/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/) and the autonomously reasoning execution in [Brief 009](/critical/briefs/009-gtg1002-ai-orchestrated-espionage/). In each, the agent's action is not bound to the premise about environment and scope.

## 5. What proof would have changed

Proof-as-auth inserts, one step before a model takes an external action, a layer that verifies the target is in-scope and the environment is contained. It does not leave the model's situational awareness to the model. It makes scope and isolation boundary independently verifiable by the executing side before the action commits.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Scope provenance binding</strong>: bind, to each target in the evaluation environment, provenance of whether it is in- or out-of-scope, so a model does not carry a real system it has mistaken for in-scope into action.</li>
<li><strong>Pre-action verification of the isolation boundary</strong>: immediately before an action that reaches externally, require proof that the environment sits inside its intended isolation boundary — verifying "should be sealed" rather than asserting it.</li>
<li><strong>Scope pinning for evaluation infrastructure</strong>: pin the permissions and reach of vendor-provided evaluation environments to the intended exercise, so a misconfiguration does not become a path to the real internet.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>Detecting outbound traffic and anomalous reach is the job of monitoring and network controls. This layer sits before that, making scope and isolation boundary verifiable.</li>
<li>Proof can show only that the premises about environment and scope held — not the model's inner state or intent.</li>
<li>Which boundary applies to which evaluation is the operator's decision; this layer supplies the basis, not the decision.</li>
</ul>

The difference from your own evaluation logs is here: a log remains after the action, but it is not material for verifying, before the action, that the environment was actually contained.

Detection and this layer are complementary, not substitutes. The former catches outbound traffic after the fact; the latter makes it possible to verify, before an action commits, that the environment and target are sealed and in-scope as premised.

## 6. Sources

- **Anthropic (primary, official)**: "Investigating three real-world incidents in our cybersecurity evaluations" (2026-07-30) — <https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals>
- **OpenAI (primary, official)**: "Third-party cyber evaluations involving OpenAI models" (2026-08-04) — <https://openai.com/index/third-party-cyber-evaluations-involving-openai-models/>
- **OpenAI (primary, official — the separate Hugging Face incident)**: "Hugging Face model evaluation security incident" (2026-07-21) — <https://openai.com/index/hugging-face-model-evaluation-security-incident/>
- **CNBC (independent)**: Israeli startup Irregular linked to AI incidents at OpenAI, Anthropic, Meta (2026-08-09) — <https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html>
- **CSO Online (independent)**: "Meta joins OpenAI, Anthropic in latest AI test breach" (2026-08) — <https://www.csoonline.com/article/4206116/meta-joins-openai-anthropic-in-latest-ai-test-breach.html>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

This document is a structural analysis of public information, not an audit, assessment, or recommendation regarding any specific organization. Each company's response and remediation status follow its own disclosures, and the accounts are kept distinct.
