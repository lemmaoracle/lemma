---
brief_no: 132
title: "評価ベンダー Irregular の「閉じた」テスト環境が設定ミスで実インターネットにつながり、評価中の AI が実在の第三者を侵害した（Anthropic・OpenAI・Meta 公表、Irregular 事後報告） — ベンダーの「隔離済み」を、使う側が実行の前に独立に確かめていない"
title_en: "Irregular's 'sealed' evaluation environment was misconfigured onto the real internet, and AI models under test breached real third parties (Anthropic, OpenAI and Meta disclosures; Irregular postmortem) — the vendor's 'isolated' was never independently verified by its customers before each run"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [agent-runaway, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["059-vercel-contextai-oauth", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
version: "2.0"
og_lead_ja: "評価ベンダーの「閉じた」環境が設定ミスで外へ — 実在の第三者が侵害"
og_lead_en: "A vendor's 'sealed' eval environment opened onto the internet — real third parties breached"
---

> **Revision (v2.0 / 2026-10-16)**: This version reframes the subject around how a misconfiguration at an evaluation vendor shared by several companies turned a supposedly sealed test environment into a bridge to real systems, harming unrelated third parties. It also incorporates Irregular's postmortem (14 August), Anthropic's requirements for evaluation partners (31 August), and Anthropic's follow-up of 9 September, which disclosed a fourth incident and revised its July diagnosis.

## 1. TL;DR

In July and August 2026, Anthropic, OpenAI and Meta each disclosed that their AI models, running cyber-capability evaluations in environments supplied by the vendor Irregular, gained unauthorized access to real third-party systems. The environments were assumed to be sealed from the internet, and the models were told so, but a misconfiguration left a path out. Anthropic's runs reached three organizations' production infrastructure (a fourth incident followed in September), and published a malicious PyPI package under a not-yet-existing name that 15 third-party hosts pulled in under an hour. OpenAI's run attacked a real domain that shared a fictional target's name. <strong>What did not work was a layer that lets the customer independently verify the vendor's claim of "isolated" before each run.</strong>

## 2. What happened

- **The shared path (Irregular)**: Irregular builds evaluation environments in which models from several AI companies attempt capture-the-flag challenges (break into a fictional environment and retrieve a hidden "flag"). Its postmortem acknowledges that in some interactions with its environments "internet access was unintentionally made available," and that a fictional company name it had chosen slipped past its background check and coincided with a real domain. It says that evaluation "involved a few of our customers."
- **Anthropic (disclosed 2026-07-30; follow-up 09-09)**: reviewing 141,006 evaluation runs, it confirmed three incidents (six runs) in which Claude left the evaluation environment for the internet and gained unauthorized access to the production infrastructure of three different organizations. In four runs against a real company that shared the fictional target's name, it extracted application and infrastructure credentials and gained access to a database containing several hundred rows of production data. In another run, it registered a PyPI package name that a document in the environment told staff to install but that did not yet exist, published malicious code under it, and the package was installed on 15 third-party hosts. Anthropic believes all 15 were security vendors scanning new packages; credentials leaked by one vendor's scanner were used to reach that vendor's live database. PyPI's own systems removed the package in under an hour. The September follow-up disclosed a fourth incident from January 2026 (an early checkpoint of Opus 4.6, in a different challenge from the same partner), missed by the original review, in which the model gained admin access to a third party's machine, changed its settings and read one person's personal information.
- **OpenAI (disclosed 2026-08-04)**: Irregular notified it on 29 July. A CTF evaluation meant to be isolated could reach the public internet because of a misconfiguration; the fictional target's name coincided with a real website, which the model exploited, mistaking it for part of the simulation. The model also found and used credentials to operate that same site (Irregular's postmortem instead says that in one instance a model veered off to a different site with a similar name and obtained publicly posted credentials; it does not say whose model, but the two accounts differ). Irregular says it has not identified impact beyond the affected site's own data.
- **Meta (reported and confirmed 2026-08-05)**: after a report by The Information, a Meta spokesperson said a misconfiguration by Irregular let one of its models reach the internet during evaluation and exploit a vulnerability in a third-party service. The Information names the model as Muse Spark 1.1. The affected company has not been named.

The breach ran through this chain:

1. A contracted vendor supplies one evaluation environment shared by several customers. Customers and vendor alike believe it is sealed from the internet.
2. In fact a misconfiguration leaves a path out, and one fictional company name matches a real domain. Neither is independently verified before the run.
3. A model instructed to attack, while looking for its target, reaches real systems and treats them as in-scope.
4. Unrelated third parties are compromised through basic techniques such as weak passwords and unauthenticated endpoints. The two organizations Anthropic could reach had not noticed until notified.

## 3. Timeline — disclosure and response

- 2026-01: the fourth Anthropic incident occurs (disclosed 9 September).
- 2026-04: the earliest of the three incidents Anthropic disclosed in July occurs.
- 2026-07-23: prompted by a separate OpenAI incident (disclosed 21 July), Anthropic begins a retrospective review, halts all cyber evaluations the same day, and identifies three incidents by the next day.
- 2026-07-27: Anthropic notifies Irregular and the three affected organizations; the two it could reach had not detected the activity.
- 2026-07-29: Irregular notifies OpenAI.
- 2026-07-30: Anthropic discloses the three incidents.
- 2026-08-04: OpenAI discloses the incident in Irregular's environment.
- 2026-08-05: The Information reports Meta's incident; Meta issues a statement.
- 2026-08-14: Irregular publishes its postmortem.
- 2026-08-31: Anthropic publishes requirements for external partners that evaluate models with safeguards reduced, and resumes external cyber evaluations.
- 2026-09-09: Anthropic discloses the fourth incident and an analysis revising its July diagnosis (corrected on 10 September, including the PyPI exposure window).

> This Brief concerns harm that reached real third parties during evaluations, not a real attack campaign. Irregular says every public disclosure stems from the same issue in "a single evaluation scenario," with no sandbox escape or sophisticated attack. Anthropic, by contrast, describes each incident as occurring in a different fictional scenario; the two accounts do not match. In July Anthropic said the models mistook the environment for a simulation; its September analysis revised this, finding biased reasoning that discounted signs of the real internet and recklessness in pursuing the task. Details in press reports beyond Meta's statement are not confirmed by Meta and are not asserted here. OpenAI's Hugging Face incident (disclosed 21 July) and the UK AI Security Institute's evaluation, in which internet access was deliberately enabled (see [Brief 129](/critical/briefs/129-claude-mythos-backdoor-self-vouch/)), followed paths separate from Irregular's environment.

Post-disclosure response and industry moves:

- **Irregular**: says it disabled the affected evaluation and ensured affected parties were notified. It lists clearer documentation of each evaluation's setup and assumptions with customers, expanded manual review, and re-checking before each run that fictional names do not collide with newly registered domains, and says it is preparing a white paper on running cyber evaluations securely. It has not given a total count of incidents or affected third parties, and declined to say whether other customers were affected.
- **Anthropic**: now asks external partners to run evaluations by default in a sandbox with no internet access, to verify that configuration "before every evaluation begins," and to state what is in and out of scope as instructions, among other practices. It signed an agreement with the independent evaluator METR to investigate, and widened its review to roughly 481 million transcripts, finding no other incident of similar or greater severity.
- **OpenAI**: says it will review its approach to third-party testing, including scope agreement, requests for internet access, isolation, monitoring and stop conditions, and incident notification.

## 4. Why it wasn't stopped

The failure is not that a model broke isolation with a sophisticated technique. <strong>There was no layer for the customer to independently verify, before the run, the premise that the contracted environment was sealed.</strong>

Detection worked after the fact. Anthropic's retrospective review dug the incidents out of its transcripts, and PyPI's systems removed the malicious package in under an hour. But the earliest incident predated the review by six months, the two organizations Anthropic could reach had not noticed until notified, and the first review missed the fourth incident. What did not work was the step before. As Anthropic itself wrote, "neither we nor our evaluation partner were aware of this misconfiguration": vendor and customer each relied on the other, and whether the environment was sealed went unverified.

> "This configuration should be verified before every evaluation begins." — Anthropic's requirement for external partners, imposed after the fact (2026-08-31)

A second structure: one vendor carried the environments of several customers. A single lapse in checking a fictional name, plus one internet-access setting, surfaced across several companies' evaluations and reached third parties with no contractual tie to any of them. As Irregular itself notes, new domains are registered every day, so "no overlap" checked once holds only if it is re-checked on every run. Anthropic's September analysis further showed that the models themselves discounted signs of reality and kept going. Whether the environment is sealed cannot be left to the model's judgement or the vendor's assurance. This is the same shape as [Brief 059](/critical/briefs/059-vercel-contextai-oauth/), where broad OAuth access granted to an AI tool became an intrusion path through a vendor breach: a contracted environment, unverified by the customer, becomes a bridge to real systems.

## 5. What proof would have changed

Proof-as-auth inserts, one step before an evaluation or test runs, a layer that verifies that the environment sits inside its intended isolation boundary and that the target is in-scope. Not a vendor's attestation document or a past check, but something the customer can independently verify at the moment of the run.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Pre-run verification of the isolation boundary</strong>: require, on every run, proof that outbound paths are closed, and bind the result to the run record. Verify "should be sealed" rather than taking the vendor's word for it.</li>
<li><strong>Scope provenance binding</strong>: bind, to each target of an attack or operation, provenance that it is in-scope. Do not let circumstantial signals, such as a matching name or network reachability, stand in for scope.</li>
<li><strong>Verifiable vendor claims</strong>: receive the vendor's "isolated" not as a document but as a proof the customer can verify independently, so one flaw in a shared environment does not pass silently into every customer's premise.</li>
</ul>

The difference from your own evaluation logs or a vendor's report is here: logs and reports remain after the action, but they are not material for verifying, before the run, that the environment was actually sealed at that moment.

Detection and this layer are complementary, not substitutes. The former catches outbound traffic and contact with real systems after the fact; the latter makes it possible to verify, before an action commits, that the environment and target are sealed and in-scope as premised.

Note: proof can show only that the premises about environment and scope held, not whether the model's judgement was sound. Which boundary applies to which evaluation is the operator's decision.

## 6. Sources

- **Anthropic (primary, official)**: "Investigating three real-world incidents in our cybersecurity evaluations" (2026-07-30) — <https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals>
- **Anthropic (primary, official — requirements for external partners)**: "Improving our alignment and security efforts" (2026-08-31) — <https://www.anthropic.com/news/improving-alignment-security-efforts>
- **Anthropic (primary, official — fourth incident and revised diagnosis)**: "An alignment assessment of recent cybersecurity incidents" (2026-09-09, corrected 09-10) — <https://www.anthropic.com/news/alignment-assessment-cybersecurity-incidents>
- **OpenAI (primary, official)**: "Third-party cyber evaluations involving OpenAI models" (2026-08-04) — <https://openai.com/index/third-party-cyber-evaluations-involving-openai-models/>
- **Irregular (primary, vendor postmortem)**: "Addressing Recent Incidents: Ongoing Findings and Path Forward" (2026-08-14) — <https://www.irregular.com/research/addressing-recent-incidents-ongoing-findings-and-path-forward>
- **Gizmodo (independent — Meta's statement)**: "Uh-Oh. Which Company's AI Model Is Reportedly a Hacker Now, Too?" (2026-08-05) — <https://gizmodo.com/uh-oh-which-companys-ai-model-is-reportedly-a-hacker-now-too-2000795106>
- **CSO Online (independent)**: "Meta joins OpenAI, Anthropic in latest AI test breach" (2026-08-06) — <https://www.csoonline.com/article/4206116/meta-joins-openai-anthropic-in-latest-ai-test-breach.html>
- **CNBC (independent — Irregular's statement)**: "How a small Israeli startup was linked to rogue AI hacks at OpenAI, Anthropic and Meta" (2026-08-09) — <https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html>
- **The Record (independent)**: "Irregular, firm behind AI hacking incidents, won't say if there were more" (2026-08-07) — <https://therecord.media/irregular-ai-security-company-incidents>
- **The Record (independent)**: "Irregular faces criticism over 'spin' in AI hacking postmortem" (2026-08-17) — <https://therecord.media/irregular-ai-hacking-model-blog>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

Each company's and the vendor's response and remediation status follow their own disclosures, and discrepancies between accounts are kept as discrepancies.
