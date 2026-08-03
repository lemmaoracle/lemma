---
brief_no: 118
title: "Copilot for Word の文書ワームが、生成された文書を次の運び手に変えた — 編集後の文書が元データを反映しているかを、受け手が確かめられない"
title_en: "A Copilot for Word document worm turned each generated file into the next carrier — recipients cannot verify the edited document reflects the source data"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-28
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "024-invisible-unicode-instruction-injection", "048-trapdoor-ai-instruction-provenance", "005-noroboto-lying-fonts", "104-webmcp-mid-session-tool-injection"]
status: published
version: "1.0"
og_lead_ja: "Copilot for Word に文書伝播型プロンプト注入、生成文書が次の運び手になる"
og_lead_en: "Copilot for Word document-borne prompt injection; each generated file becomes the next carrier"
gap_detected: "Microsoft confirmed the behavior after the researcher's report and shipped two mitigations, in April and July. The individual payloads were blocked."
gap_missing: "A layer that lets a recipient independently verify that a Copilot-edited document was generated from the source data and the operator's instructions."
gap_fix: "Require a document's generation history as independently verifiable proof, so recipients can separate out alterations that carry no proof."
---

## 1. TL;DR

On July 28, 2026, researcher Håkon Måløy published "Context Collapse, Part 3," a document-borne prompt injection against Microsoft 365 Copilot for Word. An attacker embeds instructions in a Word document as white text on a white background in a tiny font. Because Copilot strips formatting — color, font size — before passing the body to the language model, the instructions are invisible to the human and fully legible to the model. In the demonstration, Copilot followed those instructions and halved every numerical value in quarterly financial reports — and **copied the attack prompt itself into the generated document as hidden text, turning that document into the next carrier**. Microsoft shipped two mitigations, in April and July 2026, and the specific payloads were blocked. **What was missing is the layer that lets a recipient independently verify that a Copilot-edited document was generated from the source data as instructed.**

## 2. What happened

- The reporter is independent researcher Håkon Måløy. Publication came 144 days after the initial report, as a coordinated disclosure with the Microsoft Security Response Center (MSRC).
- Malicious instructions are embedded as white text on a white background at font size 8. Copilot for Word strips color and font before passing the body to the model, so hidden text reaches the model as plain text while remaining invisible to the human eye.
- Stage 1 establishes the foothold the moment Copilot processes a malicious document. Stage 2 is propagation: Copilot writes the entire attack prompt into the generated document as the same hidden text, turning that file into a new attack vector.
- In the demonstration, with a malicious document attached, Copilot halved every numerical value in Q1 and Q2 financial reports. The researcher deliberately included an instruction to highlight the changes, to show how unobtrusive the attack otherwise is.
- Microsoft shipped two mitigations: a reworked "Edit with Copilot" experience in April 2026 and a model upgrade to GPT-5.5 in July. The researcher states that each closed a specific payload but not the vulnerability class, and that with a modified payload the complete attack chain reproduced with all mitigations deployed.

The attack succeeds through the following chain.

1. The attacker embeds instructions in a document that looks like ordinary business material, as white-on-white text in a tiny font. Nothing is visible on the recipient's screen.
2. The user has Copilot process the document. The stripped body arrives at the model with the instructions intact, and Copilot executes them.
3. Copilot alters the output as instructed — halving financial figures, in the demonstration. The altered document is indistinguishable in appearance from a legitimate one.
4. At the same time, Copilot copies the attack prompt into the generated document as hidden text. Each time that file is shared or re-edited inside the organization, the chain repeats.

## 3. Timeline — disclosure and response

- 2026-03-06: Måløy reports to MSRC with reproduction steps and PoC prompts.
- 2026-03-09: MSRC acknowledges receipt.
- 2026-03-31: Microsoft confirms the behavior.
- 2026-04-03: First mitigation ships — a reworked "Edit with Copilot" experience.
- 2026-04-09: The original prompt is mitigated; the researcher finds a new XPIA (cross-prompt injection) variant.
- 2026-07-14: Second mitigation ships — a model upgrade to GPT-5.5.
- 2026-07-15: The attack reproduces on GPT-5.6; publication is postponed again.
- 2026-07-28: Publication. The researcher states the vulnerability class remains exploitable as of that date.

> Note: the facts here come from the researcher's own published write-up and subsequent reporting by established outlets. This is a coordinated-disclosure research demonstration, not a confirmed real-world compromise. The altered financial figures are a PoC in the researcher's environment; no report claims that actual corporate documents were altered. This Brief is not a condemnation of a particular product but an examination of a structure in which the provenance of a generated document is never verified on the recipient's side.

Response and industry movement after publication:

- Both Microsoft mitigations work by blocking prompts that *look* malicious, which the researcher characterizes as not removing the class.
- The researcher states that no comprehensive mitigation for this category exists as of publication.
- Coverage has framed the finding as self-propagating, worm-like behavior, and taken up the point that ordinary enterprise document workflows can serve as the propagation path.

## 4. Why it wasn't stopped

The failure here is not weak filtering, nor user carelessness. It is that **no layer let a recipient independently verify** that a document Copilot generated or edited was built from the source data and the operator's instructions. A financial report with every figure halved is, in appearance, wholly indistinguishable from a correctly generated one.

Detection worked. The researcher identified the behavior and reported it; Microsoft confirmed it and shipped two mitigations; the specific payloads were blocked. What was missing came earlier — a layer that, when a document is placed in front of the model, separates instructions by whose authority they carry, and a layer that lets the recipient check what the finished document was generated from. Stripping formatting before handing text to the model is correct as a feature, but the consequence is that the document the human sees and the document the model reads are different artifacts.

> Blocking prompts that look malicious is detection, not proof. Rewording leaves a way through — and the researcher did reproduce the chain with every mitigation deployed. What needs closing is not a particular phrasing but the path by which instructions reach execution without their origin being verified.

The same structure runs through [Brief 055 (EchoLeak — instruction provenance in M365 Copilot)](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/), where instructions embedded in a document were executed without their origin being checked; [Brief 024 (invisible Unicode instruction injection)](/critical/briefs/024-invisible-unicode-instruction-injection/), where characters invisible to humans functioned as instructions; and [Brief 005 (lying fonts)](/critical/briefs/005-noroboto-lying-fonts/), which drove apart the string a human reads and the string a machine reads. In each, whether content *looks right* and whether it *carries verified provenance* are different questions.

## 5. What proof would have changed

Proof-as-auth inserts one layer into the path ahead of each act of generating, editing, and handing on a document: an independent verification of its provenance. Instead of treating correct appearance as a stand-in for correct content, it makes checkable which source material and whose authority a document was generated from. If the answer is "provenance unknown," the recipient can separate that document out before relying on it.

Lemma's design against this primitive:

- **Bind provenance to the output.** Attach to each generated or edited document, in tamper-evident form, the source material it was built from and the instructions it was built under. A document with altered figures fails to correspond to its source material and is separated out on the recipient's side.
- **Separate instructions by authority.** Distinguish strings contained in a document's body from instructions the user supplied, by origin of authority, so document-borne strings cannot execute with the user's authority by construction.
- **Verify source integrity.** Bind the source material behind a report or a calculation by hash, so it is verifiable that what the output referenced was not itself altered.
- **Verify along the distribution path.** Build provenance verification into the path along which documents are shared and re-edited, stopping a document with no provenance before it becomes the input to the next generation. That is where the propagation chain breaks.

Lemma is not a product that detects prompt injection, nor one that guarantees model output quality. Its scope is to verify a generated document's provenance independently before it becomes the basis for a decision or is distributed further, and to exclude documents lacking provenance up front. Detection (research identification, vendor mitigations, blocking injection patterns) and pre-execution proof (an audit trail that independently verifies provenance before generation and receipt) are complementary, not alternatives. The first contains known attacks; the second establishes trust before an alteration can pass as fact. For design detail see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for scope, [Pillar 01 — Verifiable Origin](/pillars/verifiable-origin/).

## 6. Sources

- **Håkon Måløy (primary)**: "Context Collapse, Part 3 — AI Worming through Word" (2026-07-28) — <https://enklypesalt.com/posts/context-collapse-part3-ai-worming-through-word/>
- The Register, "Word worm crawls into Copilot, spreads chaos" (2026-07-29) — <https://www.theregister.com/security/2026/07/29/word-worm-crawls-into-copilot-spreads-chaos/5280588>
- iTnews, "Microsoft can't kill dogged researcher's Copilot for Word worm" (2026-07) — <https://www.itnews.com.au/news/microsoft-cant-kill-dogged-researchers-copilot-for-word-worm-627830>
- Malwarebytes, "Hidden prompt turns Microsoft Copilot into an AI worm" (2026-07) — <https://www.malwarebytes.com/blog/ai/2026/07/hidden-microsoft-copilot-ai-worm>
- CyberInsider, "Microsoft Copilot for Word vulnerable to self-propagating worm-like attack" (2026-07) — <https://cyberinsider.com/microsoft-copilot-for-word-vulnerable-to-self-propagating-worm-like-attack/>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) · [Pillar 01 — Verifiable Origin](/pillars/verifiable-origin/) · [Brief 055 (EchoLeak — instruction provenance in M365 Copilot)](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) · [Brief 024 (invisible Unicode instruction injection)](/critical/briefs/024-invisible-unicode-instruction-injection/)
