---
brief_no: 5
title: "Noroboto 攻撃 — フォント偽装による AI 文書レビューの入力 integrity 偽装"
title_en: "Noroboto Attack — AI Document Review Input-Integrity Forgery via Embedded Lying Fonts"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2026-05-25
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["003-starlette-badhost", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "埋め込みフォント偽装で AI 文書レビューの入力を改ざん — Noroboto 攻撃"
og_lead_en: "Embedded font forgery silently rewrote what the AI read — Noroboto attack"
---

## TL;DR

In May 2026, Drew Miller, founder of Tritium Legal Technologies, disclosed the "Noroboto" attack technique. A malicious font embedded in a document intentionally shifts the correspondence between Unicode code points and rendered glyphs, deliberately decoupling what a human reads on screen from the string an AI processes internally. When abused in places where meaning changes substantially — governing law, monetary amounts, dates in contracts — the conclusion an AI document-review system reaches diverges from what a human would assume. The core of the attack is not AI inference but the text-extraction stage upstream of the AI, and the implicit assumption that "human-visible text equals AI-interpreted text" is broken. This incident is a representative case of the absence of an independent verification layer for AI judgment inputs.

---

## 1. Incident Overview

- **Attack technique name**: Noroboto (Lying Fonts attack)
- **Disclosure**: May 2026, Drew Miller (founder of Tritium Legal Technologies, with over a decade of experience as a corporate attorney and software developer)
- **Venue**: Tritium official blog, "Noroboto: Lying Fonts and Mitigation in Rust"
- **Scope**: Contract review, invoice processing, audit, bid-document verification, and any domain where AI makes decisions based on document content
- **Demonstration**: In Miller's testing, several AI platforms produced incorrect answers
- **Mitigation**: Miller published Rust-implementation mitigation code on the official blog

---

## 2. Timeline

- May 2026: Miller publishes the Noroboto attack and Rust-implementation mitigation on the Tritium official blog
- 2026-05-25: GIGAZINE publishes a Japanese explainer; cross-industry attention to input-integrity for AI document review follows
- After May 2026: Discussion of input-integrity verification requirements for organizations adopting AI in contract / invoice / audit domains proceeds in parallel

---

## 3. Attack Vector

1. **Initial preparation**: A malicious font is embedded in a document (PDF, etc.). The font intentionally shifts the correspondence between Unicode code points and rendered glyphs (instead of the "A" code mapping to the glyph "A", a different Unicode character is assigned the glyph "A")
2. **Surface deception**: When a human opens the document on screen, the font renders glyphs such as "Maryland," "200 million yen," or "2026-01-01." To human eyes, it looks normal
3. **AI extraction divergence**: When the AI (LLM, document-review platform, etc.) performs text extraction upstream of reading the document, it references the font's Unicode mapping and obtains a different internal string than the human-visible glyphs. Example: on screen, "Maryland" → internally to the AI, "Delaware"
4. **AI inference on tampered input**: The AI produces judgments, summaries, and answers based on the text it received (the tampered input). The conclusion a human would reach by visual inspection diverges from the conclusion the AI produces
5. **Targeted partial attack**: It is more severe when the malicious font is used in only part of the document. The AI cannot detect a whole-document anomaly and trusts the normal text-extraction result (partial rewrites such as human "200 million yen" / AI "100 million yen" are effective)

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, in AI judgment, **the implicit assumption that "what the document file displays on screen equals what is passed to the AI" was left unverified**. There is no problem with AI inference (model performance); the structural gap is the absence of a layer that independently verifies "what the AI is seeing" and "whether it matches what the human is seeing."

The primitive differs from Brief 003 (Starlette / BadHost) — the target here is the trust of document text rather than the trust of an HTTP request — but the underlying structure is shared: **a trust assertion is detached from the layer that verifies it**. It shares structural adjacency with Briefs 001 / 002 / 004 (independent verification of message origin or commit origin); the gap here is the absence of independent verification of input data origin / integrity.

---

## 5. The Structural Gap Detection Alone Cannot Close

Conventional detection-side AI safety has concentrated on output filtering (hallucination detection, ungrounded-judgment detection, harmful-content detection). These do not function well against the present incident. The AI is performing inference correctly on the input it received (the text written as "Delaware"), so anomaly is hard to detect at the output level.

The detection layer remains important for after-the-fact evaluation of AI judgment quality, and this Brief does not deny that role. That said, the accuracy of AI judgment when input integrity is compromised exists independently as a layer outside the reach of detection.

Pre-execution attestation adopts a structure that, before the AI generates a judgment, independently commits the equivalence between the input the AI is seeing and the input that "should be visible to a human." By embedding independent verification of font interpretation (Miller's proposed OCR-based re-verification, or audit of the Unicode-to-rendered-glyph correspondence) into the text-extraction layer upstream of passing the document to the AI, input integrity is guaranteed before AI judgment. Post-judgment detection and pre-judgment input attestation are in a **complementary**, not substitutive, relationship; the combination of both layers establishes the trust boundary for AI document review (for a more detailed argument on the relationship between detection and pre-execution attestation, see [The last layer left in AI-era cyber defense](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

- **Tritium Legal Technologies (Miller)**: Published the Rust-implementation mitigation code on the official blog. Proposed specific countermeasures: "do not unconditionally trust embedded fonts," "render alphanumerics with the font and OCR-verify against the expected string," and "three-way prior consistency verification of the text humans see, the Unicode characters inside the document file, and the text the AI actually processes"
- **AI document-review platforms**: Individual mitigations are limited at the time of disclosure (immediately post-publication). Cross-industry response from contract-review, invoice-processing, and audit-tool vendors is expected
- **Cross-industry argument**: As AI adoption expands in contract / invoice / audit domains, input-integrity verification of AI judgment emerges as a new mandatory requirement. The impact on AI document-review practice at law firms, accounting / audit firms, and financial institutions is significant

---

## 7. Lemma's Analysis

Against the structural gap exposed by this incident (no independent verification of input integrity for AI judgment), Lemma proposes a design that commits the input data the AI uses for judgment as an independently verifiable cryptographic proof, so that a verifier can independently verify the equivalence between "the input the AI is seeing" and "the input that should be visible to a human." Even when the input font is forged, the proof tells the verifier through a separate channel whether "this AI judgment is based on this input / and the input matches what is humanly visible / does not match." For design details see [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Tritium Legal Technologies official blog**: "Noroboto: Lying Fonts and Mitigation in Rust" by Drew Miller (2026-05, official blog, including the Rust-implementation mitigation code) — https://tritium.legal/blog/noroboto

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Book a Discovery Call →](https://tally.so/r/Pd2Rl5)
[Download the whitepaper →](https://tally.so/r/7RJXdR)
[Subscribe to the newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
