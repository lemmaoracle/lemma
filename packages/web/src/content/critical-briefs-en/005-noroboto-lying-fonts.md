---
brief_no: 5
title: "Noroboto：埋め込みフォントの偽装で、AI の文書レビューに別の文章を読ませうることが示された(Tritium Legal Technologies)"
title_en: "Noroboto: Embedded \"lying fonts\" could make an AI document review read different text (Tritium Legal Technologies)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2026-05-25
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["024-invisible-unicode-instruction-injection", "003-starlette-badhost", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "Noroboto — 埋め込みフォントの偽装で、人が画面で読む文章と AI が抽出する文字列を別にできることを、Tritium Legal Technologies のミラー氏が公開した"
og_lead_en: "Noroboto — Tritium Legal Technologies' Drew Miller showed that an embedded font can make the text a person reads on screen differ from the string an AI extracts"
og_kicker_ja: "攻撃の実証 · AI の文書レビュー"
og_kicker_en: "ATTACK RESEARCH · AI DOCUMENT REVIEW"
og_headline_ja: "偽装フォントで、\nAI が別の文章を\n読むと研究者が報告。\n<accent>画面では正常に見える</accent>"
og_headline_en: "Lying fonts made AI\nread different text,\na researcher reports.\n<accent>Looks normal on screen.</accent>"
key_figures:
  - value: "Maryland → Delaware"
    label: "An example of what a person sees on screen versus the string the AI extracts. The glyphs render normally"
    tone: "alert"
  - value: "3"
    unit: "texts"
    label: "The texts Miller proposed checking for a match in advance (what is visible on screen, the Unicode string in the file, and the text the AI processes)"
  - value: "05-25"
    label: "The day GIGAZINE published a Japanese explainer. The technique was disclosed in May 2026 (Tritium's official blog)"
glossary:
  - term: "Embedded font"
    desc: "A font shipped inside a document file such as a PDF, so the text displays the same way even where the reader lacks that typeface."
  - term: "Code point and glyph"
    desc: "A code point is the number Unicode assigns to a character. A glyph is the shape drawn on screen. The font decides which shape is drawn for each number."
  - term: "Text extraction"
    desc: "Pulling the string out of a file before an AI or a document-review system reads it. It reads the character numbers in the file, not how they look on screen."
insight:
  slug: "rendered-vs-extracted-text"
  label: "On-screen text vs the string the AI reads"
  quote: "An AI reads the string extracted from the file, not the glyphs on screen, so unless that string is checked against the text a person sees, the AI can base its judgment on different text even in a document a person has looked over."
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "Confirm the text the AI extracted matches what a human sees on screen"
attack_method: "ai-misuse"
takeaway: "An embedded lying font can make the on-screen text and the string the AI reads differ, so check that they match before using the AI's conclusion."
self_check: "When an AI reviews a document, can you check, before using its conclusion, that the string it reads matches the text a person sees on screen?"
countries: ["global"]
---

## 1. Summary

Drew Miller, founder of Tritium Legal Technologies, showed that a font embedded in a document can shift the mapping between Unicode code points and the glyphs drawn on screen, so that the text a person reads on screen and the string an AI extracts become different. In Miller's testing, some AI platforms returned incorrect answers. Because the AI reasons correctly over the string it receives, output-side detection is unlikely to work. <strong>An AI reads the string extracted from the file, not the glyphs on screen, so unless that string is checked against the text a person sees, the AI can base its judgment on different text even in a document a person has looked over.</strong>

## 2. What got through

- **What got through**: The AI's reading of the document, and the summaries, judgments and answers based on it. A person who opens the document sees normal text, while the AI receives a different string from the code points the font points to. In the example given in the research, where the screen shows "Maryland," the AI reads "Delaware" (Miller).
- **What reached the receiving side**: In general, the person who uses an AI's summary or judgment receives only the AI's conclusion. From the conclusion alone, you cannot tell that it came from a different string rather than the text the person saw. The research points out that rewriting only part of a document is more severe, because it hardly shows up as a whole-document anomaly.
- **Not disclosed**: The names and number of the AI platforms that answered incorrectly, and whether there has been any real-world harm. This is a researcher's demonstration.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, just before the AI's conclusion is used for a decision, it is checked, apart from how the document looks, whether the string the AI processed matches the text a person sees on screen.

- **Who approves**: The person who makes a decision using the AI's review. They see the result of matching the string the AI processed against the on-screen text, apart from the AI's output, and approve. Text inside the AI's summary is never used as approval.
- **Where it is checked**: Just before the document's text is passed to the AI, and just before the AI's summary or judgment is used for approval. A conclusion from a document whose match cannot be checked is not used until the check is done.
- **What is recorded**: Which string from which document was passed to the AI, how its match with the on-screen text was checked, and on whose approval the conclusion was used, kept apart from the AI in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the AI's conclusion is used for a decision, that the string the AI processed matches the text a person sees on screen, and keeping a record. Detection means noticing incorrect answers or ungrounded judgments on the output side. The dates below are when the research and the explainer were published, not when the technique was used.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before using the AI's conclusion, check that the string it read matches the on-screen text</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In testing, some AI platforms<br>returned incorrect answers</span></div>
<div class="rx-zone det"><b>Detection · disclosure and awareness</b>Publishing the research, explainer articles, output-side detection</div>
<div class="rx-g g1"><div class="t">2026-05</div><b>Miller discloses the technique</b></div>
<div class="rx-g g2"><div class="t">2026-05</div><b>Rust mitigation code in the same post</b></div>
<div class="rx-g g3"><div class="t">05-25</div><b>GIGAZINE publishes a Japanese explainer</b></div>
<div class="rx-g g4"><div class="t">05-25 on</div><b>Taken up as an issue for AI document review</b></div>
</div>
</figure>

Output-side detection (of hallucinations and ungrounded judgments) is still needed as a layer that inspects the quality of AI judgments after the fact. But the AI here reasons correctly over the string it received, so looking at the output alone, it is hard to notice that the input differs from the text a person saw. This case achieves, through fonts, the same pattern as [invisible Unicode instruction injection](/critical/briefs/024-invisible-unicode-instruction-injection/), which used characters invisible to people to separate what a person sees from what the model reads.

## 4. What Lemma does

**Lemma builds the pre-execution check into the operation that uses an AI's summary or judgment for a decision such as an approval.** It does not look for font forgery; before the conclusion is used, it checks that the match between the string the AI processed and the on-screen text has been checked, and that there is approval to use the conclusion, and it keeps a record.

### Industries and operations to watch

- **Industry · AI adoption (cross-sector)**: Organizations that have AI review or summarize documents received from outside. The research names contract review, invoice processing, audit, bid-document verification and other areas where AI makes judgments based on document content.
- **Operations · Approval**: Using an AI's summary or judgment to approve contracts or payments. If the string the AI read differs from the on-screen text, the basis for approval shifts.

### Current controls vs Lemma

The route in this case is a chain from column 1 (taking text from the document into the AI) to column 2 (approval using the AI's conclusion).

| Control | Taking text from the document into the AI | Approval using the AI's conclusion |
| --- | --- | --- |
| A person reviewing the document on screen | Not effective | Partial |
| Output-side detection (hallucinations, ungrounded judgments) | Not relevant | Not effective |
| Not trusting embedded fonts unconditionally, re-reading glyphs and matching (Miller's proposal) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Not effective | Effective |

A person's on-screen review cannot spot the forgery at the intake stage, because the glyphs render normally. If a person reads the AI's conclusion against the original, they may notice the difference, but a rewrite of only part of a document is easy to miss. Output-side detection rarely fires, because the AI reasons correctly over the string it received. Miller's proposed countermeasures (not trusting embedded fonts unconditionally; rendering characters with the font, reading them back with OCR and matching against the expected string; and matching in advance the text visible on screen, the Unicode string in the file and the text the AI processes) aim to find the forgery at the intake stage, and how far they work depends on the implementation. Lemma does not stop the intake itself; it ties the operation that uses the AI's conclusion for approval to the result of the match check and to the approval. A conclusion with no record of that check is held before it is used for approval.

Note: Lemma's check works only when it is built into the operation that uses the AI's conclusion for approval, and the result of the mechanism that checks the match (such as re-reading glyphs) and the approval keys are managed apart from the documents the AI reads. Lemma does not find font forgery itself. If the match check misses the forgery, its result passes the check. If the person approves without looking at the match result, it passes. The table compares what each control checks; it does not show whether this case would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that have AI review documents received from outside

- Do you treat embedded fonts in documents received from outside as not trusted unconditionally?
- Before using an AI's summary or judgment for approval, do you check the key figures, names and dates against the original on screen?
- Can you see a record of the string the AI processed, and the approval based on it, apart from the AI?

## 5. Facts and timeline

- **Research**: Noroboto (the Lying Fonts attack), disclosed by Drew Miller, founder of Tritium Legal Technologies (with over a decade of experience as a corporate attorney and software developer). It is a researcher's demonstration, not a count of real-world incidents.
- **Venue**: Tritium's official blog, "Noroboto: Lying Fonts and Mitigation in Rust."
- **The technique in outline**: A font embedded in a document (a PDF, etc.) shifts the mapping between Unicode code points and the glyphs drawn on screen. A person sees normal text, while a different string comes out when the AI extracts the text. It is more severe when used in only part of a document (Miller). A partial rewrite, such as the AI reading "100 million yen" where the screen shows "200 million yen," is given as an example.
- **Demonstration**: In Miller's testing, some AI platforms returned incorrect answers.
- **Areas expected to be affected**: Contract review, invoice processing, audit, bid-document verification and other areas where AI makes judgments based on document content.
- **Proposed countermeasures**: Miller published mitigation code implemented in Rust on the official blog.

### Timeline

- **2026-05**: Miller publishes the Noroboto technique and a mitigation implemented in Rust on Tritium's official blog.
- **2026-05-25**: GIGAZINE publishes a Japanese explainer, and it is taken up as an input issue for AI document review.

> Names and the technique are based on Drew Miller's disclosure on the Tritium Legal Technologies official blog. This Brief treats the matter as a researcher's demonstration (the Lying Fonts attack) and does not exaggerate real-world impact. Each implementation's response varies over time, so consult the latest information. This Brief does not describe how to build a lying font. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Tritium Legal Technologies (Miller)**: Published mitigation code implemented in Rust on the official blog and proposed "do not unconditionally trust embedded fonts," "render alphanumerics with the font and confirm with OCR that they match the expected string," and "verify in advance that the text a person sees on screen, the Unicode string inside the document file, and the text the AI actually processes all match."
- **AI document-review platforms**: Individual vendors' responses cannot be confirmed from this Brief's sources.

## 6. Sources

- **Tritium Legal Technologies official blog**: "Noroboto: Lying Fonts and Mitigation in Rust" by Drew Miller (2026-05, official blog, including the Rust-implementation mitigation code) — https://tritium.legal/blog/noroboto
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
