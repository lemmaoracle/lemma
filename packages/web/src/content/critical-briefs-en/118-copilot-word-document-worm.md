---
brief_no: 118
title: "Microsoft 365 Copilot for Word：生成した文書が次の運び手になる文書ワームが示された(Håkon Måløy の研究)"
title_en: "Microsoft 365 Copilot for Word: A document worm that makes each generated file the next carrier was demonstrated (Håkon Måløy research)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-28
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "024-invisible-unicode-instruction-injection", "048-trapdoor-ai-instruction-provenance", "005-noroboto-lying-fonts", "104-webmcp-mid-session-tool-injection"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "研究者 Håkon Måløy が、Copilot for Word が文書の隠し文字の指示に従って財務報告の数値を半分にし、その指示を生成した文書へ複写する実証を公表した"
og_lead_en: "Researcher Håkon Måløy published a demonstration in which Copilot for Word followed hidden-text instructions in a document, halved a financial report's figures and copied the instructions into the file it generated"
og_kicker_ja: "研究の実証 · Copilot for Word"
og_kicker_en: "RESEARCH DEMO · COPILOT FOR WORD"
og_headline_ja: "見えない指示で、\n財務の数値が半分に。\n生成文書が次の運び手。\n<accent>研究者が実証と報告</accent>"
og_headline_en: "Hidden Word text made\nCopilot halve figures,\na researcher reports.\n<accent>Each output carries it on</accent>"
key_figures:
  - value: "2"
    unit: "rounds"
    label: "Mitigations Microsoft shipped (2026-04 and 07). The researcher says a modified payload reproduced the chain with every mitigation deployed"
    tone: "alert"
  - value: "144"
    unit: "days"
    label: "From the initial report to MSRC to publication (coordinated disclosure)"
  - value: "50"
    unit: "%"
    label: "How far Copilot cut the financial report's figures in the demonstration (all halved). A PoC in the researcher's environment, not a report of real corporate documents being altered"
glossary:
  - term: "Document-borne prompt injection"
    desc: "A pattern in which instructions embedded in a document are read by the AI, carried into the document the AI generates, and read in turn by the next user's AI. The researcher calls it worm-like."
  - term: "XPIA"
    desc: "Cross-domain prompt injection: the AI executes instructions contained in outside content such as documents or email, rather than the user's own instructions."
insight:
  slug: "generated-output-as-next-input"
  label: "A generated document becomes the next input"
  quote: "A document Copilot wrote cannot be told apart by appearance from one generated correctly, so unless you check which source material and whose instructions it was built from before using it for the next generation or sharing it, both the alteration and the embedded instructions can be carried straight into the next document."
industries: ["ai"]
controls:
  - slug: "hold-unverified"
    item: "Do not share Copilot-edited figures until they are checked against the source data"
attack_method: "ai-misuse"
takeaway: "A generated document becomes the input to the next generation, so before sharing or re-editing it, check which source material and which of the user's instructions it was built from."
self_check: "Before sharing an AI-generated or AI-edited document, or using it as input to the next generation, can you check which source material and whose instructions it was built from?"
countries: ["global"]
---

## 1. Summary

On July 28, 2026, researcher Håkon Måløy published "Context Collapse, Part 3," a document-borne prompt injection against Microsoft 365 Copilot for Word. According to the researcher, instructions embedded in a document in formatting invisible to the human eye are read by the model intact, because Copilot strips formatting before passing the body to the model. In the demonstration, Copilot rewrote every figure in a quarterly financial report to half its value and also copied the instructions themselves into the document it generated as hidden text, so the generated document became the next carrier. Microsoft shipped mitigations in April and July 2026 and the specific payloads reported were blocked, but the researcher says a modified payload still reproduced the chain as of publication. <strong>A document Copilot wrote cannot be told apart by appearance from one generated correctly, so unless you check which source material and whose instructions it was built from before using it for the next generation or sharing it, both the alteration and the embedded instructions can be carried straight into the next document.</strong>

## 2. What got through

- **What got through**: A user having Copilot for Word process a document containing hidden-text instructions and draft a report. In the researcher's demonstration, Copilot followed the instructions in the document just as it would the user's, and halved the financial figures. In the next stage the malicious document was removed and only the previously generated Q1 report was attached to draft the Q2 report; the same alteration occurred (researcher).
- **What reached the receiving side**: A document indistinguishable in appearance from a correctly generated report. According to the researcher, in the financial-report demonstration Copilot did not mention that it had halved the figures. Because the instructions are copied into the generated document as hidden text, each time it is shared or re-edited inside the organization, the next user's Copilot can read them.
- **Not disclosed**: Any real-world incident of harm from this technique. The researcher's publication is a research demonstration following coordinated disclosure, not a report that actual corporate documents were altered. This Brief does not cover the modified payload used to reproduce the chain at publication.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a document is fed into generation and before a generated document is shared, it is checked, apart from how it looks, which source material, which input documents and whose instructions it was built from.

- **Who approves**: The author (owner) of the source material and the user who requested the generation. The author records the version of the source material, and the generation instruction is recorded as the user's. Text inside a document body is never used as approval or as an instruction.
- **Where it is checked**: Just before a document is fed into Copilot or another generator, and just before a generated document is passed on for sharing or re-editing. Documents whose origin cannot be checked, and documents generated with such a document as input, are held until the check is done.
- **What is recorded**: Which version of which source material and which input documents, under whose instructions, produced which document — kept apart from the generating AI, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a document is fed into generation or a generated document is shared, which source material and whose instructions it was built from, and keeping a record. Detection means noticing and blocking specific reported payloads through researcher reports or vendor mitigations. The dates below are when the report, mitigations and publication happened, not dates of real-world harm.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from disclosures</b>Before input to generation or sharing, check the origin of source material and instructions, apart from how the document looks</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Hidden instructions altered figures and<br>were copied into the generated file (researcher)</span></div>
<div class="rx-zone det"><b>Detection · reports and mitigations</b>Researcher report, reworked Edit with Copilot, model upgrade</div>
<div class="rx-g g1"><div class="t">03-06</div><b>Researcher reports to MSRC</b></div>
<div class="rx-g g2"><div class="t">04-03</div><b>First mitigation (reworked Edit with Copilot)</b></div>
<div class="rx-g g3"><div class="t">07-14</div><b>Second mitigation (upgrade to GPT-5.5)</b></div>
<div class="rx-g g4"><div class="t">07-28</div><b>Publication; researcher says the class is still exploitable</b></div>
</div>
</figure>

Blocking the specific payloads reported stops known techniques and raises attacker cost. The researcher says, however, that a reworded payload reproduced the chain with every mitigation deployed, so controls that close particular phrasings catch up with new variants afterward. As in [Brief 055 (EchoLeak)](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/), where Copilot executed instructions embedded in data; [Brief 024 (invisible Unicode instruction injection)](/critical/briefs/024-invisible-unicode-instruction-injection/), where characters invisible to humans acted as instructions; and [Brief 005 (Noroboto)](/critical/briefs/005-noroboto-lying-fonts/), which drove apart the string a human reads and the string a machine reads, the document the human sees and the document the model reads become different things here. This case adds that the instructions are copied into the generated document and become the next input.

## 4. What Lemma does

**Lemma builds the check in 03 in front of the operations that feed a document into generation and that share a generated document.** It does not look for hidden text or injection phrasing; before a document is passed on, it checks, apart from how it looks, the record of which source material and whose instructions the document was built from.

### Industries and operations to watch

- **Industry · AI adoption (all industries)**: Organizations that use Copilot or other generative AI to produce reports, tallies and summaries and share them internally.
- **Operation · Drafting reports and tallies**: Attaching a previous period's report or a document received from outside and having AI draft the next report. Because the previous output becomes the next input, alterations and instructions can be carried forward.
- **Operation · Sharing and re-editing documents**: Circulating AI-generated or AI-edited documents as a basis for decisions, or editing them further, without checking them against the source data.

### Current controls vs Lemma

The chain the researcher showed has a document carrying hidden instructions enter generation, and the generated document become the next input in turn; which column applies depends on whether that document's origin can be checked.

| Control | A document whose origin cannot be checked, or one generated with such a document as input, enters the next generation or sharing | A document whose origin can be checked itself contains hidden instructions |
| --- | --- | --- |
| Opening and reading the document (by eye) | Not effective | Not effective |
| Blocking specific reported payloads (reworked Edit with Copilot, model upgrade) | Partial | Partial |
| Checking generated figures against the source data before sharing (manual) | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective |

Reading by eye cannot catch either column, because the instructions are embedded in invisible formatting and the altered report looks indistinguishable. Blocking specific payloads worked against the reported phrasings, but the researcher says a modified payload reproduced the chain. Checking against the source data can catch rewritten figures, but cannot see the hidden instructions copied into the generated document. Lemma checks the generation record (source-material version, input documents, the user who gave the instruction) before the next generation or sharing, so a document whose origin cannot be checked, or one generated with such a document as input, is held before it moves on, and the propagation chain breaks there. If a document whose origin can be checked itself contains hidden instructions, however, the check matches and it passes. That column is covered by combining Lemma with vendor mitigations and checks against the source data.

Note: Lemma's check works only when it is built into generating and sharing documents, and the source-material versions and generation records are managed apart from the generating AI. Lemma does not read document content to find hidden instructions, and it does not guarantee the correctness of figures or the quality of AI output. If a legitimate author's document contained hidden instructions, it passes the check. The table compares what each control checks; it does not show whether this demonstration would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm in organizations that produce and share reports or tallies with generative AI

- Do you know where the documents you attach for the AI to read came from?
- Do you check AI-generated or AI-edited figures against the source data before sharing them?
- Can you see, apart from the generating AI, a record of which source material and which input documents an AI-generated document was built from?

## 5. Facts and timeline

- **Reporter**: Håkon Måløy, a Norwegian data scientist. Published 144 days after the initial report, as a coordinated disclosure with the Microsoft Security Response Center (MSRC).
- **Technique**: Instructions are embedded in the document in formatting invisible to the human eye — white text on a white background in a very small font. Copilot for Word strips color and font formatting before passing the body to the model, so the hidden text reaches the model as plain text (researcher).
- **Propagation**: According to the researcher, Copilot writes the instructions themselves into the generated document as hidden text, turning it into a new carrier. In the next stage, with the malicious document removed and only the previously generated report attached, the same alteration reproduced.
- **Choice of demonstration**: Halving financial figures was chosen because the change is immediately visible (researcher).
- **Posture**: A research demonstration following coordinated disclosure, not a real-world incident of harm.

### Timeline

- **2026-03-06**: Måløy reports to MSRC with reproduction steps and PoC prompts.
- **2026-03-09**: MSRC acknowledges receipt.
- **2026-03-31**: Microsoft confirms the behavior.
- **2026-04-03**: First mitigation ships — a reworked "Edit with Copilot" experience.
- **2026-04-09**: The original prompt is mitigated; the researcher finds a new XPIA variant.
- **2026-07-14**: Second mitigation ships — a model upgrade to GPT-5.5.
- **2026-07-15**: The attack reproduces on GPT-5.6; publication is postponed again.
- **2026-07-28**: Publication. The researcher states the vulnerability class remains exploitable as of that date.

> The facts rest on the researcher's own published write-up and subsequent reporting (The Register, iTnews, Malwarebytes, CyberInsider). This is a research demonstration following coordinated disclosure; the altered financial figures are a PoC in the researcher's environment, and no report claims actual corporate documents were altered. This Brief does not include reproducible payloads or steps. What has not been disclosed does not mean no controls were in place.

### After disclosure

- **Microsoft**: Told The Register: "We have addressed the findings reported by the researcher and thank them for working with us through coordinated vulnerability disclosure. To address this class of risk, we use a defense-in-depth strategy with safeguards that block malicious instructions at multiple points."
- **Researcher**: Credits Microsoft's handling, stating that its fixes meaningfully reduce exposure and that the memory and email-body vectors covered in Parts 1 and 2 were mitigated outright. He nonetheless holds that both mitigations closed the specific payloads reported rather than removing the vulnerability class, and that no comprehensive mitigation for this category exists as of publication.
- **Coverage**: Has framed the finding as self-propagating, worm-like behavior, and taken up the point that ordinary enterprise document workflows can serve as the propagation path.

## 6. Sources

- **Håkon Måløy (primary)**: "Context Collapse, Part 3 — AI Worming through Word" (2026-07-28) — <https://enklypesalt.com/posts/context-collapse-part3-ai-worming-through-word/>
- **The Register (independent reporting; carries Microsoft's statement)**: "Word worm crawls into Copilot, spreads chaos" (2026-07-29) — <https://www.theregister.com/security/2026/07/29/word-worm-crawls-into-copilot-spreads-chaos/5280588>
- **iTnews (independent reporting)**: "Microsoft can't kill dogged researcher's Copilot for Word worm" (2026-07-31) — <https://www.itnews.com.au/news/microsoft-cant-kill-dogged-researchers-copilot-for-word-worm-627830>
- **Malwarebytes (independent analysis)**: "Hidden prompt turns Microsoft Copilot into an AI worm" (2026-07-30) — <https://www.malwarebytes.com/blog/ai/2026/07/hidden-microsoft-copilot-ai-worm>
- **CyberInsider (independent reporting)**: "Microsoft Copilot for Word vulnerable to self-propagating worm-like attack" (2026-07-30) — <https://cyberinsider.com/microsoft-copilot-for-word-vulnerable-to-self-propagating-worm-like-attack/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
