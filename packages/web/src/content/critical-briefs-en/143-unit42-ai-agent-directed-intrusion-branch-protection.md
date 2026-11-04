---
brief_no: 143
title: "非公表の企業：攻撃者が指揮する複数の AI エージェントに、ネットワークを侵害された(Unit 42 の調査)"
title_en: "Undisclosed enterprise: A network breached by multiple AI agents directed by a human attacker (Unit 42 investigation)"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [identity-auth, agent-infrastructure]
incident_date: 2026-09-02
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["009-gtg1002-ai-orchestrated-espionage", "128-coding-agent-harness-authority-gap", "130-atlassian-rovo-instruction-provenance"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "インシデント調査 · AI エージェントの攻撃"
og_kicker_en: "INCIDENT RESPONSE · AI-AGENT INTRUSION"
og_headline_ja: "攻撃者が AI に任せ、\n10 時間未満で侵害した。\n<accent>止まったのは 1 か所</accent>"
og_headline_en: "AI agents breached\na network in <10 hours.\n<accent>One step was stopped.</accent>"
key_figures:
  - value: "<10"
    unit: "hours"
    label: "Time to complete the intrusion. Unit 42 assessed it as work that would take human operators about two weeks"
    tone: "alert"
  - value: "50+"
    label: "MITRE ATT&CK techniques used (Unit 42)"
  - value: "1"
    unit: "step"
    label: "The only step stopped in real time: branch protection blocked the Terraform change (Unit 42)"
glossary:
  - term: "Branch protection"
    desc: "A code-repository setting that keeps changes without the required approvals out of the main branches."
  - term: "Terraform"
    desc: "A tool that describes cloud configuration as code and builds infrastructure from it. Changing the configuration code changes the infrastructure."
  - term: "Secrets management"
    desc: "A system that stores passwords, tokens, and keys in one place and hands them to other systems."
insight:
  slug: "valid-key-not-authorization"
  label: "A valid key is not permission to act"
  quote: "Even a stolen key or token passes any step that has no per-action authorization check, as long as it is formally valid."
version: "1.0"
og_lead_ja: "Unit 42、AIエージェント主導の侵入が10時間未満で完了と報告"
og_lead_en: "Unit 42: AI-agent-run intrusion completed in under 10 hours"
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "Check per action not only that a token or key is valid, but that this actor may take this action"
  - slug: "bound-automation"
    item: "Keep the agent within an allowed scope and limit at each stage it can reach"
attack_method: "ai-misuse"
impact: "Breach completed in under 10 hours"
takeaway: "Of five stages, the only one stopped in real time was where branch protection required approval before the change."
self_check: "Even if a stolen key or token is valid, is there a step that checks, before the operation, whether this actor may perform it?"
countries: ["global"]
---

## 1. Summary

A human attacker directed frontier AI models and attack-specific agentic frameworks and completed an intrusion into an enterprise network in under 10 hours. Stolen tokens, credentials, and cloud keys were used one after another, from breaking into the secrets manager to hijacking the AI infrastructure. The only thing stopped in real time was an attempted backdoor in the Terraform configuration, blocked by branch protection (Unit 42). <strong>Even a stolen key or token passes any step that has no per-action authorization check, as long as it is formally valid.</strong>

## 2. What got through

- **What went through**: Breaking into the secrets manager with stolen tokens, harvesting administrative credentials, and seizing root access. Hijacking an internal code-integration application and exfiltrating cloud access keys. Turning the victim's AI endpoints into attack infrastructure with the stolen cloud keys (Unit 42).
- **What was stopped**: Planting a backdoor in the Terraform configuration. Enforced branch protection stopped it (Unit 42).
- **What reaches the receiving side**: In general, the secrets manager and the cloud receive a request carrying a valid token or key. Whether that key was stolen, and whether the actor may take the action, cannot be told from the key's validity.
- **Not disclosed**: The victim's name and industry, the date of the attack, the attacker's identity, and the nature of any ransom demand. How the public web service was breached.

## 3. Pre-execution check

The condition that holds whatever the route is to check, before each action and separately from whether a key or token is valid, whether this actor may take this action.

- **Who approves**: A person with the authority to allow the operation. Important operations on the secrets manager, cloud configuration, and AI infrastructure are approved separately from holding a key.
- **Where the check happens**: Just before the secrets manager, the cloud, configuration code, or AI infrastructure accepts an operation. The same place branch protection sat in this incident, applied to the other stages too.
- **What remains**: A record of which operation, by which actor, on whose approval. The chain can later be shown to a third party.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before accepting an operation, checking separately from key validity whether this actor may perform it, and keeping a record. Detection = finding the chain from traces after the attack. The date of the attack was not disclosed; dates are when Unit 42 published and corrected its report.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · worked in one place</b>The Terraform change was stopped by approval before the change. Checks at other stages cannot be seen in the disclosures</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With stolen keys, 4 of 5 stages went through<br>Only the Terraform change was stopped</span></div>
<div class="rx-zone det"><b>Detection · after the intrusion</b>The attack chain was reconstructed from traces of AI use</div>
<div class="rx-g g1"><div class="t">Undisclosed</div><b>Intrusion (under 10 hours)</b></div>
<div class="rx-g g2"><div class="t">09-02</div><b>Unit 42 publishes its investigation</b></div>
<div class="rx-g g3"><div class="t">09-03</div><b>Corrected: an intrusion, not ransomware</b></div>
<div class="rx-g g4"><div class="t">09-04</div><b>Minor copyedits</b></div>
</div>
</figure>

The one place that held did not ask whether the key was valid; it asked for approval before the change. The same shape appears in [GTG-1002](/critical/briefs/009-gtg1002-ai-orchestrated-espionage/), where an AI agent autonomously executed 80–90% of a campaign, and in [coding-agent authority](/critical/briefs/128-coding-agent-harness-authority-gap/), where coding agents in their default configuration reached CI execution from a single unauthorized instruction.

## 4. What Lemma does

**Lemma builds the pre-execution check in front of the operations an agent can reach.** It does not find intrusions; before each operation, it checks whether this actor may perform it, separately from whether the key is valid.

### Industries and operations to watch

- **Industry · AI**: Organizations with their own AI endpoints or model invocations, which stolen cloud keys can turn into attack infrastructure.
- **Operation · Accounts & permissions**: Secrets management, cloud administrator rights, and configuration-code changes — the stages that went through on key validity alone in this incident.

### Current controls vs Lemma

The route in this case is column 1 (operations on the secrets manager, cloud, and AI infrastructure with stolen keys or tokens). Column 2 (changing the Terraform configuration) is the stage that was stopped in real time.

| Control | Operations on secrets manager, cloud, and AI infrastructure with stolen keys | Changing the Terraform configuration |
| --- | --- | --- |
| Checking token and key validity | Not effective | Not effective |
| Branch protection (approval before the change) | Not relevant | Effective |
| Analyzing traces of AI use (after the fact) | Not effective | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective |

Checking token and key validity passes a stolen key as long as it is formally valid; that alone carried the attacker from the secrets manager to hijacking the AI infrastructure (Unit 42). Branch protection asked for approval before the change rather than for a key, so it stopped the Terraform backdoor, but it does not reach stages outside the code repository. Trace analysis reconstructed the chain from structured Markdown and scripts, but after the attack. Lemma places the same kind of pre-action approval check that branch protection provided on secrets-manager, cloud, and AI-infrastructure operations as well.

Note: Lemma's check works only when it is built in just before the secrets manager, the cloud, and AI infrastructure accept operations, and approvals are managed separately from the agent and from keys that can be stolen. If the approver's own credentials are stolen too, this check can be passed. The initial intrusion from the public web service, and tokens written into code repositories (pre-intrusion hygiene), are outside this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about the stages an AI agent can reach

- Do you check separately that a key or token is valid and that this actor may perform this operation?
- Do you require approval before the operation, like branch protection, for secrets-manager and cloud administrative operations too?
- Do you allow calls to your own AI endpoints based not only on API key validity but on the caller being a legitimate internal system?

## 5. Facts and timeline

- **Disclosure**: On September 2, 2026, Unit 42 (Palo Alto Networks) published a blog analyzing its response to an incident. The attacker told Unit 42, during negotiations, that it had used frontier AI models and attack-specific agentic AI frameworks.
- **Scale**: The agents each targeted a different layer of defense toward a shared goal. Unit 42 assessed the work as matching a coordinated effort by multiple red teams, about two weeks of human effort (over 50 MITRE ATT&CK techniques).
- **Method**: No novel zero-day or elite tradecraft was needed; what stood out was AI-assisted operational efficiency, Unit 42 writes. The agents monitored, evaluated, acted, and re-planned in real time.
- **What was left behind**: The attacker had an agent produce an 80-page technical audit of the victim's security posture (dozens of exploited findings) and left it for the victim.
- **Indicators of AI use**: Parallel LLM calls to multiple frontier AI agents, structured Markdown passing information between agent sessions, and scripts assessed with high confidence to be AI-generated based on UI elements (Unit 42).
- **Five stages**: (1) Breached a public web service and mapped internal microservices with a recon agent. (2) Sub-agents extracted hard-coded tokens and passwords from code repositories. (3) Used stolen tokens to enter the secrets manager, harvest administrative credentials, and seize root. (4) Hijacked an internal code-integration application and exfiltrated cloud access keys; an attempted backdoor in the Terraform configuration was stopped by enforced branch protection. (5) Used the stolen cloud keys to turn the victim's AI endpoints into post-compromise infrastructure.

### Timeline

- **Undisclosed**: The whole operation is completed in under 10 hours. The victim's name, industry, and the date of the attack are undisclosed.
- **2026-09-02**: Unit 42 publishes its investigation.
- **2026-09-03**: A correction clarifies it was an intrusion, not a ransomware attack.
- **2026-09-04**: Minor copyedits.

> This Brief treats Unit 42's self-published report (posted 2026-09-02, corrected 2026-09-03 and 2026-09-04) as its primary source. Initial coverage framed this as a "ransomware attack," but Unit 42's September 3 correction clarified it was an intrusion, not a ransomware attack. The attacker reportedly described its AI use "in negotiations," but the nature of any ransom demand, the victim's industry or size, and the attacker's identity are undisclosed. This Brief does not treat these as facts. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Unit 42**: Drew these lessons. AI agents shorten the time between attack steps. AI agents leave recognizable traces such as structured Markdown, Python caches, and paired asset folders. Attackers can build redundant persistence in parallel across SSH keys, serverless functions, container restart policies, cloud identities, and CI/CD. Attackers can hijack a victim's own AI tools as post-compromise infrastructure, hiding command traffic among normal traffic and shifting compute cost onto the victim.

## 6. Sources

- **Unit 42 / Palo Alto Networks (primary, self-published research)**: "An AI-Assisted Cyber Attack: Inside a Unit 42 Investigation" (published 2026-09-02, corrected 2026-09-03/09-04) — <https://unit42.paloaltonetworks.com/ai-assisted-cyber-attack-inside-a-unit-42-investigation/>
- **The Register (independent)**: "AI agents carried out every step of this ransomware attack – then left the victim an 80-page security audit" (2026-09-02) — <https://www.theregister.com/security/2026/09/02/ai-agents-carried-out-every-step-of-this-ransomware-attack-then-left-the-victim-an-80-page-security-audit/5294009>
- **Cybernews (independent)**: "AI agents speed ransomware breach to under 10 hours" — <https://cybernews.com/security/ai-agents-ransomware-attack-security-audit/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
