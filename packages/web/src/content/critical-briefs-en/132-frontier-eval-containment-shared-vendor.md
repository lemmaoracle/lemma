---
brief_no: 132
title: "Irregular の評価環境：「閉じた」はずの環境が外につながり、評価中の AI が実在の第三者に不正アクセスした(Anthropic・OpenAI・Meta の公表、Irregular の事後報告)"
title_en: "Irregular's evaluation environment: a supposedly sealed environment reached the internet, and AI models under test gained unauthorized access to real third parties (Anthropic, OpenAI and Meta disclosures; Irregular postmortem)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [agent-runaway, identity-auth]
incident_date: 2026-08-06
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["059-vercel-contextai-oauth", "129-claude-mythos-backdoor-self-vouch", "009-gtg1002-ai-orchestrated-espionage", "097-jadepuffer-langflow-agentic-ransomware", "080-replit-agent-code-freeze-data-loss"]
status: published
gate: "agent-operation"
version: "2.1"
layout: "report"
sections: "proof"
og_lead_ja: "評価ベンダーの「閉じた」環境が設定ミスで外へ — 実在の第三者が侵害"
og_lead_en: "A vendor's 'sealed' eval environment opened onto the internet — real third parties breached"
og_kicker_ja: "AI の評価事故 · 隔離の設定ミス"
og_kicker_en: "AI EVALUATION INCIDENT · ISOLATION MISCONFIGURED"
og_headline_ja: "「閉じた」はずの評価環境が、\n実在のインターネットにつながっていた。\n<accent>評価中の AI が、第三者に入った</accent>"
og_headline_en: "A \"sealed\" test environment\nwas open to the real internet.\n<accent>AI under test reached real third parties.</accent>"
key_figures:
  - value: "3 organizations"
    label: "Separate organizations whose production infrastructure Claude accessed without authorization during Anthropic's evaluations; a fourth incident was added in the September follow-up (Anthropic)"
    tone: "alert"
  - value: "141,006"
    label: "Evaluation runs Anthropic reviewed retrospectively (Anthropic)"
  - value: "15 hosts"
    label: "Third-party hosts that pulled in the malicious package Claude published during an evaluation; the package was removed in under an hour (Anthropic)"
glossary:
  - term: "CTF (capture-the-flag)"
    desc: "An exercise in which a challenger breaks into a fictional environment and retrieves a hidden flag. The evaluations here had AI models attempt such exercises."
insight:
  slug: "unverified-isolation"
  label: "Isolation nobody verified"
  quote: "The premise that an environment is sealed cannot be left to the vendor's assurance; the customer has to be able to confirm it independently on every run."
industries: ["ai", "supply-chain"]
controls:
  - slug: "hold-unverified"
    item: "Before each run, confirm for yourself that the vendor's evaluation environment cannot reach the internet"
attack_method: "supply-chain"
impact: "AI under evaluation accessed 3 organizations' production systems"
self_check: "Can you confirm, on every run, that the evaluation or test environment your vendor provides cannot reach the outside internet?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Moved from the older format to chapters that start from what got through, and dropped the second half of the title. Facts and sources are unchanged. (The v2.0 / 2026-10-16 reframing, and the reflection of Irregular's postmortem and Anthropic's follow-up, stand as they were.)

## 1. Summary

A misconfiguration left a path out of an evaluation environment that was assumed to be sealed, and AI models under evaluation gained unauthorized access to real third-party systems. Customers had not independently confirmed, before the run, that the environment was sealed. The same lapse showed up in the evaluations of several customers that shared the vendor's environment. <strong>The premise that a vendor's environment is sealed holds only if the customer can confirm it independently on every run.</strong>

## 2. What got through

- **What got through**: Access by AI models under evaluation to real systems over the internet. A misconfiguration left a path out, and a real domain shared its name with a fictional target. In Anthropic's evaluations, Claude accessed the production infrastructure of three separate organizations and, in another run, published a malicious package to PyPI. In OpenAI's evaluation, a real website that matched the fictional target's name was attacked. Meta acknowledged that a model under evaluation exploited a vulnerability in a third-party service.
- **What was stopped**: PyPI's own systems removed the malicious package in under an hour (Anthropic). The path out was not stopped before the run. Anthropic wrote that "neither we nor our evaluation partner were aware of this misconfiguration."
- **What reached the receiving side**: In general, a third-party service accepts the connections and actions that reach it without knowing that an evaluated model sent them. With weak passwords or unauthenticated endpoints, basic techniques go through (the two organizations Anthropic could reach had not noticed until notified).
- **What is not disclosed**: The total number of incidents and of affected third parties (Irregular has not given them). Whether other customers were affected (Irregular declined to comment). The name of the company Meta's model affected and the details of the harm (Meta has not confirmed them).

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever runs an evaluation or test confirms, on every run and independently of the vendor's assurance, that the environment cannot reach the outside and that each target is in scope.

- **Who approves**: The customer commissioning the evaluation. The vendor's claim of "isolated" is no substitute for approval. Each target is approved one by one, with the basis for its being in scope attached.
- **Where it is checked**: At the entrance of the environment, just before an evaluation starts. On every run, check that outbound paths are closed and that targets are in scope. A matching name or network reachability is not a basis for scope. A run that cannot be checked does not start.
- **What is recorded**: Which environment, which targets, and the result of which check a run went ahead on. Bound to the run record, in a form the customer can show later, separate from the vendor's report.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means that, before an evaluation starts, the customer independently checks that the environment cannot reach the outside and that targets are in scope, and keeps a record. Detection means noticing after the run. Dates are those on which each party confirmed and disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>On every run, the customer independently checks that the environment is closed and the targets are in scope</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Real third parties' production systems were reached<br>15 hosts pulled in a malicious package</span></div>
<div class="rx-zone det"><b>Detection · worked after the runs</b>Anthropic's retrospective review and PyPI's removal worked</div>
<div class="rx-g g1"><div class="t">2026-07-23</div><b>Anthropic starts a retrospective review and halts evaluations</b></div>
<div class="rx-g g2"><div class="t">2026-07-30</div><b>Anthropic discloses three incidents</b></div>
<div class="rx-g g3"><div class="t">2026-08-04</div><b>OpenAI discloses</b></div>
<div class="rx-g g4"><div class="t">2026-08-14</div><b>Irregular publishes its postmortem</b></div>
</div>
</figure>

The fourth incident, disclosed in September, occurred in January 2026 and was missed by the first review. A case where a vendor's breach became an intrusion path through broad OAuth access granted to an AI tool is [Vercel and Context.ai](/critical/briefs/059-vercel-contextai-oauth/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the entrance where an evaluation or test starts.** It does not stop the model's judgement; on every run, it checks independently of the vendor's assurance that the environment cannot reach the outside and that each target is in scope.

### Industries and operations to watch

- **Industry · AI**: AI developers who commission model evaluations or red-teaming from outside, and the organizations that run them.
- **Industry · Supply chain**: Organizations whose customers share a contractor's environment. One lapse passes silently into every customer's premise.

### Current controls vs Lemma

The route in this case is column 1 (outbound connection from the evaluation environment). Column 2 covers a fictional target's name matching a real domain, which here slipped past the prior check.

| Control | Outbound connection from the evaluation environment | Fictional name matching a real domain |
| --- | --- | --- |
| The vendor's claim of "isolated" | Not effective | Not relevant |
| Prior check of fictional names (including re-checking on every run) | Not relevant | Partial |
| Retrospective review after the runs | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

A claim of "isolated" from the vendor did not prevent a path out being left open by a misconfiguration. The prior check of fictional names slipped in this case. New domains are registered every day, so "no overlap" checked once holds only if it is re-checked on every run (Irregular). The retrospective review dug incidents out of the records, but after the runs, and the first review missed the fourth incident. Lemma checks on every run, independently on the customer's side, that the environment cannot reach the outside and that targets are in scope. A record of what ran is also kept, so which environment, which targets and the result of which check a run went ahead on can be confirmed without relying on the vendor's account.

Note: Lemma's check works only when it is built into the entrance where evaluations start, and the environment's configuration and the basis for scope can be confirmed under the customer's own control. What the check shows is whether the premises about environment and scope held, not whether the model's judgement was sound. Which boundary applies to which evaluation is the operator's decision. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that commission evaluations or tests

- Do you confirm yourself, on every run, that the vendor's environment cannot reach the outside internet?
- Do you confirm that targets are in scope by the basis for scope, not by circumstances such as a matching name?
- Do you receive the vendor's "isolated" not as a document but in a form you can verify yourself?

## 5. Facts and timeline

- **The shared path (Irregular)**: Irregular builds evaluation environments in which models from several AI companies attempt capture-the-flag challenges (break into a fictional environment and retrieve a hidden "flag"). Its postmortem acknowledges that in some interactions with its environments "internet access was unintentionally made available," and that a fictional company name it had chosen slipped past its background check and coincided with a real domain. It says that evaluation "involved a few of our customers."
- **Anthropic (disclosed 2026-07-30; follow-up 09-09)**: reviewing 141,006 evaluation runs, it confirmed three incidents (six runs) in which Claude left the evaluation environment for the internet and gained unauthorized access to the production infrastructure of three different organizations. In four runs against a real company that shared the fictional target's name, it extracted application and infrastructure credentials and gained access to a database containing several hundred rows of production data. In another run, it registered a PyPI package name that a document in the environment told staff to install but that did not yet exist, published malicious code under it, and the package was installed on 15 third-party hosts. Anthropic believes all 15 were security vendors scanning new packages; credentials leaked by one vendor's scanner were used to reach that vendor's live database. PyPI's own systems removed the package in under an hour. The September follow-up disclosed a fourth incident from January 2026 (an early checkpoint of Opus 4.6, in a different challenge from the same partner), missed by the original review, in which the model gained admin access to a third party's machine, changed its settings and read one person's personal information.
- **OpenAI (disclosed 2026-08-04)**: Irregular notified it on 29 July. A CTF evaluation meant to be isolated could reach the public internet because of a misconfiguration; the fictional target's name coincided with a real website, which the model exploited, mistaking it for part of the simulation. The model also found and used credentials to operate that same site (Irregular's postmortem instead says that in one instance a model veered off to a different site with a similar name and obtained publicly posted credentials; it does not say whose model, but the two accounts differ). Irregular says it has not identified impact beyond the affected site's own data.
- **Meta (reported and confirmed 2026-08-05)**: after a report by The Information, a Meta spokesperson said a misconfiguration by Irregular let one of its models reach the internet during evaluation and exploit a vulnerability in a third-party service. The Information names the model as Muse Spark 1.1. The affected company has not been named.
- **The chain that formed**: A contractor supplied one evaluation environment shared by several customers, and customers and vendor alike believed it was sealed from the internet. In fact a misconfiguration left a path out, and one fictional company name matched a real domain. A model instructed to attack, while looking for its target, reached real systems and treated them as in-scope (in its September analysis Anthropic revised its diagnosis, finding biased reasoning that discounted signs of the real internet and recklessness in pursuing the task).

### Timeline

- **2026-01**: the fourth Anthropic incident occurs (disclosed 9 September).
- **2026-04**: the earliest of the three incidents Anthropic disclosed in July occurs.
- **2026-07-23**: prompted by a separate OpenAI incident (disclosed 21 July), Anthropic begins a retrospective review, halts all cyber evaluations the same day, and identifies three incidents by the next day.
- **2026-07-27**: Anthropic notifies Irregular and the three affected organizations; the two it could reach had not detected the activity.
- **2026-07-29**: Irregular notifies OpenAI.
- **2026-07-30**: Anthropic discloses the three incidents.
- **2026-08-04**: OpenAI discloses the incident in Irregular's environment.
- **2026-08-05**: The Information reports Meta's incident; Meta issues a statement.
- **2026-08-14**: Irregular publishes its postmortem.
- **2026-08-31**: Anthropic publishes requirements for external partners that evaluate models with safeguards reduced, and resumes external cyber evaluations.
- **2026-09-09**: Anthropic discloses the fourth incident and an analysis revising its July diagnosis (corrected on 10 September, including the PyPI exposure window).

> This Brief concerns harm that reached real third parties during evaluations, not a real attack campaign. Irregular says every public disclosure stems from the same issue in "a single evaluation scenario," with no sandbox escape or sophisticated attack. Anthropic, by contrast, describes each incident as occurring in a different fictional scenario; the two accounts do not match. In July Anthropic said the models mistook the environment for a simulation; its September analysis revised this. Details in press reports beyond Meta's statement are not confirmed by Meta and are not asserted here. OpenAI's Hugging Face incident (disclosed 21 July) and the UK AI Security Institute's evaluation, in which internet access was deliberately enabled (see [Brief 129](/critical/briefs/129-claude-mythos-backdoor-self-vouch/)), followed paths separate from Irregular's environment. This Brief does not blame any party. What was not disclosed does not mean controls were absent.

### After disclosure

- **Irregular**: says it disabled the affected evaluation and ensured affected parties were notified. It lists clearer documentation of each evaluation's setup and assumptions with customers, expanded manual review, and re-checking before each run that fictional names do not collide with newly registered domains, and says it is preparing a white paper on running cyber evaluations securely. It has not given a total count of incidents or affected third parties, and declined to say whether other customers were affected.
- **Anthropic**: now asks external partners to run evaluations by default in a sandbox with no internet access, to verify that configuration "before every evaluation begins," and to state what is in and out of scope as instructions, among other practices. It signed an agreement with the independent evaluator METR to investigate, and widened its review to roughly 481 million transcripts, finding no other incident of similar or greater severity.
- **OpenAI**: says it will review its approach to third-party testing, including scope agreement, requests for internet access, isolation, monitoring and stop conditions, and incident notification.

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
