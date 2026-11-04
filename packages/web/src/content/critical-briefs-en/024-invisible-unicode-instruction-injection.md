---
brief_no: 24
title: "AI エージェントのスキル：人の目に見えない Unicode の文字で、モデルが読む指示を埋め込む手法が開示された(CSA AI Safety Initiative)"
title_en: "AI agent skills: A technique that embeds model-read instructions in Unicode characters invisible to humans was disclosed (CSA AI Safety Initiative)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2026-03-10
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["005-noroboto-lying-fonts", "003-starlette-badhost", "011-synthid-watermark-reverse-engineering", "025-mcp-stdio-config-to-command-rce"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "CSA が、人の目に見えない Unicode の文字で、AI エージェントのスキルにモデルが読む指示を埋め込む手法を開示した"
og_lead_en: "CSA disclosed a technique that embeds model-read instructions in AI-agent skills using Unicode characters invisible to humans"
og_kicker_ja: "攻撃手法の開示 · AI エージェントのスキル"
og_kicker_en: "ATTACK RESEARCH · AI AGENT SKILLS"
og_headline_ja: "見えない文字の指示を、\n人は読めず AI は読む。\nCSA が手法を開示。\n<accent>人のレビューを素通り</accent>"
og_headline_en: "Invisible Unicode can\nhide instructions\nthe AI reads, CSA says.\n<accent>Human review misses them</accent>"
key_figures:
  - value: "76"
    unit: "payloads"
    label: "Malicious payloads Snyk confirmed in an audit of 3,984 skills (ToxicSkills, 2026-02). Not necessarily cases of this technique"
    tone: "alert"
  - value: "36.82"
    unit: "%"
    label: "Share of skills with some security issue in the same audit (Snyk)"
  - value: "13.4"
    unit: "%"
    label: "Share of skills with a critical issue in the same audit (Snyk)"
glossary:
  - term: "Unicode Tag characters"
    desc: "Characters in the range U+E0000–U+E007F. They do not render for the human eye or in most editors, yet language models process them as meaningful content (CSA)."
  - term: "Skill"
    desc: "A reusable capability package for an AI agent. Skills are distributed as skill files, tool descriptions and MCP metadata, and the agent loads them."
insight:
  slug: "human-read-vs-model-read"
  label: "What humans read vs what the model reads"
  quote: "The model reads characters the human eye cannot see, so unless the version passed to the model is checked against the version a human reviewed and against the legitimate distributor, input that passed review can still carry instructions nobody read."
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "Confirm the input the model reads matches what humans reviewed"
attack_method: "ai-misuse"
takeaway: "Invisible characters pass human review, so before a skill or tool definition reaches the model, check that it came from the legitimate distributor exactly as reviewed."
self_check: "Before an AI agent loads a skill or tool definition, can you check that it came from the legitimate distributor exactly as a human reviewed it?"
countries: ["global"]
---

## 1. Summary

CSA AI Safety Initiative disclosed that when instructions are encoded in Unicode characters that look like blank space to humans and most editors, and embedded in AI-agent skills or tool definitions, language models can read them as meaningful instructions. Placed inside headings, at line endings or inside whitespace, the characters do not render during human review at distribution and onboarding; the researcher community (Embrace The Red and others) reported the same class of technique. Much AI safety assurance relies on "a human reviewed it," but if a divergence can be made between human perception and model interpretation, passing review does not vouch for what the model read. <strong>The model reads characters the human eye cannot see, so unless the version passed to the model is checked against the version a human reviewed and against the legitimate distributor, input that passed review can still carry instructions nobody read.</strong>

## 2. What got through

- **What got through**: Human review, at distribution and onboarding, of skill files, tool descriptions, MCP metadata and documents containing invisible characters. Because the characters do not render, the reviewer cannot notice that instructions are embedded. When the agent loads the skill or document, the model interprets the invisible characters as meaningful content and may follow the embedded instructions (CSA).
- **What reached the receiving side**: In general, the model receives not the string a human saw on screen but the string itself, invisible characters included. In the flow CSA described, credential theft, external transmission and out-of-scope operations that follow the instructions can run as the agent's own operations. Because what the human reviewed and what the model followed diverge, explaining or reproducing "why it acted that way" afterward is difficult.
- **Not disclosed**: Any specific incident of real-world harm from this technique. CSA's publication is a technique disclosure, and Snyk's figures are results of an audit of skills in general.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, just before a skill or tool definition reaches the model, it is checked, apart from how it looks on screen, that it came from the legitimate distributor and has not changed from the version a human reviewed.

- **Who approves**: The distributor (issuer) of the skill or tool definition, and the person who reviewed it and decided to onboard it. The distributor signs each version it issues, and the onboarding side records the version it reviewed. Text inside the skill body is never used as approval.
- **Where it is checked**: Just before the agent loads a skill, tool definition or document and passes it to the model. Input whose distributor and version cannot be checked is held until the check is done.
- **What is recorded**: Which version from which distributor was reviewed and onboarded by whom and passed to the model, kept apart from the agent in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a skill or tool definition reaches the model, that it came from the legitimate distributor exactly as a human reviewed it, and keeping a record. Detection means noticing invisible characters or suspicious decode behavior. The dates below are when the audit and the disclosure were published, not when the technique was used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from disclosures</b>Before passing input to the model, check its distributor and that it matches the reviewed version, apart from how it looks</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A technique by which the model reads<br>instructions humans cannot see was disclosed</span></div>
<div class="rx-zone det"><b>Detection · audits and mitigations</b>Skill audits, stripping invisible characters, detection hooks</div>
<div class="rx-g g1"><div class="t">02-05</div><b>Snyk publishes the ToxicSkills audit</b></div>
<div class="rx-g g2"><div class="t">03-10</div><b>CSA publishes its Research Note</b></div>
<div class="rx-g g3"><div class="t">2026</div><b>Embrace The Red reports the same class of technique</b></div>
<div class="rx-g g4"><div class="t">2026–</div><b>Research on detection hooks and mitigations continues</b></div>
</div>
</figure>

Stripping invisible characters, flagging decode behavior and auditing skills stop known techniques and raise attacker cost. They work against known encodings, but when a new encoding or obfuscation appears, they catch up afterward. This case realizes the same pattern as [Noroboto](/critical/briefs/005-noroboto-lying-fonts/), where lying fonts decoupled on-screen text from the string the AI processes, through a different route: invisible Unicode. Through skills and metadata it also sits next to [BadHost](/critical/briefs/003-starlette-badhost/) at the input boundary of agent infrastructure.

## 4. What Lemma does

**Lemma builds the pre-execution check in front of the operation where an agent passes a skill or tool definition to the model.** It does not look for invisible characters; it checks, before passing the input, its distributor and that it matches the version a human reviewed, apart from how it looks.

### Industries and operations to watch

- **Industry · AI adoption (all industries)**: Organizations that have AI agents load skills, tool definitions or MCP metadata from outside distributors.
- **Industry · Developers & agent operations**: Development and operations teams that treat human review as the premise of safety when onboarding skills and tool definitions.
- **Operation · Onboarding skills and tool definitions**: Reviewing distributed skills and documents and having the agent load them. Instructions in the loaded string can lead to the agent's operations.

### Current controls vs Lemma

In the disclosed technique, skills or documents in which an attacker embedded invisible characters pass human review at distribution and onboarding; which column applies depends on who issued that version.

| Control | Version from an illegitimate distributor, or swapped after review | Invisible characters inside the reviewed version itself |
| --- | --- | --- |
| Human review (by eye) | Not effective | Not effective |
| Stripping invisible characters / flagging decode behavior (detection hooks, etc.) | Partial | Partial |
| Skill audits | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective |

Human review cannot notice embedded instructions in either column, because the characters do not render. Stripping or flagging invisible characters works against known encodings but catches up afterward with new encodings or obfuscation. Skill audits find and remove problematic skills, but do not look at versions loaded after the audit. Lemma checks the distributor's signature and the record of the reviewed version against the version passed to the model, so a version from an illegitimate distributor, or one that changed after review, is held before it reaches the model. If the reviewed version itself contains invisible characters, however, the check matches and the input passes. That column is covered by combining Lemma with stripping and audits.

Note: Lemma's check works only when it is built into loading skills and tool definitions, and the distributor's signing key and the record of the reviewed version are managed apart from the input the agent reads. If the legitimate distributor signed a version containing invisible characters, or a person reviewed and onboarded that version without noticing them, it passes the check. The table compares what each control checks; it does not show whether this technique would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm in organizations that have AI agents load skills or tool definitions

- Do you know which distributor each skill and tool definition your agents load came from?
- Before onboarding skills or documents, do you run them through a step that strips or flags invisible characters?
- Can you see, apart from the agent, a record of which skill versions the agent loaded and the operations it performed with them?

## 5. Facts and timeline

- **Disclosure**: CSA AI Safety Initiative disclosed it as "Hidden Unicode Instruction Injection in AI Agent Skills." The researcher community (Embrace The Red and others) also reported the same class of technique.
- **Technique**: Unicode Tag characters (U+E0000–U+E007F) do not render for the human eye or in most editors, yet language models process them as meaningful content. Arbitrary instructions are encoded in these characters and embedded in skill files, tool descriptions, MCP metadata and documents (CSA).
- **Where they are embedded**: Inside headings, at line endings, inside whitespace — positions human review cannot notice (CSA).
- **Related audit**: Snyk's ToxicSkills (2026-02) audited 3,984 skills and confirmed 36.82% with some security issue, 13.4% with critical issues, and 76 malicious payloads, quantifying skills — reusable capability packages — as a supply-chain attack surface.
- **Posture**: Not a specific incident of real-world harm, but a technique disclosure and an ecosystem audit.

### Timeline

- **2026-02-05**: Snyk publishes the ToxicSkills audit: of 3,984 skills, 36.82% with some security issue, 13.4% critical, 76 malicious payloads confirmed.
- **2026-03-10**: CSA AI Safety Initiative publishes invisible Unicode instruction injection as a Research Note. Detection hooks (claude-hooks, etc.) and mitigations follow.
- **2026, ongoing**: Indirect prompt injection via skills, tool definitions and MCP metadata is discussed as a principal input-integrity problem for agents.

> The facts of the technique rest on the CSA AI Safety Initiative Research Note and the Embrace The Red report, and the audit figures on Snyk's publication. This is a research demonstration of a technique, not a specific incident of real-world harm. Proper names follow primary sources; each implementation's response varies over time, so consult the latest information. This Brief does not include reproducible payloads. What has not been disclosed does not mean no controls were in place.

### After disclosure

- **Research / industry bodies**: CSA and the researcher community disclosed the technique and shared mitigations such as stripping invisible characters, input sanitization and skill audits.
- **Supply-chain awareness**: ToxicSkills and others quantitatively confirmed skills, tool definitions and MCP metadata as a supply-chain attack surface in the form of reusable "context," and distributor verification and management of skill origin are in demand.
- **Input integrity**: Interest is moving from safety assurance predicated on human review toward checking, separately, the origin and integrity of the inputs the AI actually processes.

## 6. Sources

Sources are drawn from published research and industry-body materials. Specific payloads that would aid reproduction are omitted.

- **CSA AI Safety Initiative (primary)**: "Hidden Unicode Instruction Injection in AI Agent Skills" (2026-03-10) — https://labs.cloudsecurityalliance.org/research/csa-research-note-unicode-instruction-injection-ai-skills-20/
- **Researcher disclosure (secondary)**: Embrace The Red "Scary Agent Skills: Hidden Unicode Instructions in Skills" (2026) — https://embracethered.com/blog/posts/2026/scary-agent-skills/
- **Supply-chain audit (primary)**: Snyk "ToxicSkills: Comprehensive Security Audit of AI Agent Skills" (2026-02-05, 3,984 skills, 36.82%, 13.4% CRITICAL, 76 malicious payloads) — https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
