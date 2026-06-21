---
brief_no: 11
title: "SynthID 透かしが統計的に剥がされた — 成果物に埋めた来歴印は除去も偽造もされうる（Google DeepMind / Alosh Denny）"
title_en: "SynthID Watermark, Statistically Stripped — a provenance mark that can be removed and forged (Google DeepMind / Alosh Denny)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity"]
incident_date: 2026-03-05
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "005-noroboto-lying-fonts", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "SynthID 透かしが統計的に剥がされた — 成果物に埋めた来歴印は除去も偽造もされうる"
og_lead_en: "SynthID Watermark, Statistically Stripped — a provenance mark that can be removed and forged"
gap_detected: "The watermark and detection API still function as an initial filter that labels content at scale as 'likely AI-generated.'"
gap_missing: "Because the provenance mark is embedded in the artifact itself, observing enough of it lets an attacker statistically strip the mark or forge it onto something else."
gap_fix: "Before judging whether content is authentic, independently verify with Lemma, as a proof held outside the artifact, that it was created by a legitimate generating party, and prevent it up front."
---

## TL;DR

SynthID — Google DeepMind's watermark for AI-generated images — was reverse-engineered in March 2026 by researcher Alosh Denny using only a 2D Fourier transform and phase-coherence analysis (no neural networks, no proprietary access). It removes about 91% of the watermark while preserving image quality, and the same principle forges the mark onto non-AI images. Not an attack but a research demonstration, it shows that a mark embedded in the artifact can be statistically stripped or forged. Watermarking (detection) and cryptographic provenance (proof) are complements, not substitutes.

---

## 1. Incident Overview

- **Target system**: Google DeepMind SynthID (embeds an invisible watermark in AI-generated images and judges whether content is AI-generated via a detection API; targets Gemini-generated images)
- **Demonstrator**: Alosh Denny (independent researcher)
- **Form of disclosure**: Method, code, and results published on GitHub (`aloshdenny/reverse-SynthID`). A related `reverse-SynthID-text` targeting text-mode detection also exists. Discussion in technical communities (Hacker News, etc.)
- **Date**: 2026-03-05 (public disclosure, at the publication of Medium "How to Reverse SynthID (legally😉)." The first commit on GitHub was 2025-12-15; Hacker News discussion was around 2026-04-11)
- **Method**: No neural networks, no proprietary access used. Using 123,000 Gemini-generated images, the researcher observes that SynthID encodes at a fixed carrier frequency with constant phase. By averaging across many images, the frequency-domain signature of the watermark (the pattern equivalent to the key) is extracted; a phase-shift attack targets this frequency to nullify it
- **Result**: Approximately 91% of watermark energy removed; image quality almost intact (PSNR 43.5 dB / SSIM 0.997); reproducible at arbitrary resolution on Gemini images
- **Nature**: Not an attack incident (an event with a victim organization and damages) but a security-research demonstration of the structural limits of provenance marking
- **Core**: what secures the provenance assertion (is this AI-generated or not) is "a mark embedded in the artifact"; because the mark lives in the same signal space as the artifact, it stays detached from an independently verifying proof in a separate channel and can be extracted, removed, or forged

---

## 2. Timeline

- 2025-12-15: Alosh Denny opens the GitHub repository `aloshdenny/reverse-SynthID` privately (dev begins)
- 2026-03-05: Publicly discloses the reverse-engineering method in Medium "How to Reverse SynthID (legally😉)"
- Around 2026-04-11: Discussion expands on Hacker News (item 47709130); interest spreads across technical communities
- After April 2026: The existence of a SynthID-watermark bypass tool based on the method is reported in general media (MediaNama, etc.)
- 2026-08-02: The EU AI Act's mandatory watermarking of AI-generated content (transparency requirement) takes effect. The phase in which watermarking becomes a regulatory requirement and the phase in which its strip-ability is demonstrated overlap

> Note: Proper names and CVEs rest on primary sources (research institutions, GitHub Advisory, NVD, etc.), and since each implementation's response status varies over time, consult the latest information. This is a research / lab demonstration, not an attack incident, and the scale of harm and operational impact are not exaggerated.

---

## 3. Event Chain

1. **Observation**: Identifies that SynthID encodes a fixed carrier frequency with constant phase across image populations. Because the watermark is consistent across outputs, a common frequency-domain signature appears across multiple images
2. **Key extraction**: Averages noise across many Gemini-generated images (123,000 in the demonstration) and isolates the common pattern — the watermark's signature. Statistically recovers "the equivalent of the key" without proprietary access
3. **Removal**: A phase-shift attack targets the specific frequency where the watermark resides and manipulates the phase to nullify the mark. Removes approximately 91% of watermark energy without giving visually noticeable damage to image quality
4. **Forging surface**: Once the watermark's signature is recovered, the inverse — injecting the watermark into non-AI-generated content (misattribution) — also holds by the same principle. As long as the presence / absence of the watermark is the criterion for authenticity, tampering in both directions becomes a threat
5. **Regulatory collision**: as watermarking is mandated as an institutional basis for authenticity (e.g. the EU AI Act's transparency requirement), the strip-ability and forge-ability above mean the premise "presence / absence of the watermark = truth of provenance" does not hold

---

## 4. Structural Analysis

This incident belongs to the `data-provenance` category of Pillar 01 (Verifiable Origin). The central **failure primitive is "embedding the provenance mark in the artifact itself (embedded provenance marking),"** and because the mark shares statistical properties with the artifact, it can be externally observed, extracted, removed, and forged. The provenance assertion (this image is / is not AI-generated) is detached from an independently verifying proof in a separate channel. Secondary tagging is `ai-decision-integrity`, recording the straddle with the verifiability of AI outputs (Pillar 02).

This incident follows Brief 008 (Discord scraping) as another instance of "trust-layer risk events that are not attack incidents" (per the Methodology's scope expansion). Where Brief 008 addressed the provenance of training data via a public API plus terms of service, this incident addresses the provenance mark of AI **outputs**. Both share the structure that "the provenance of data / content lacks an independent verification layer." It is also adjacent to Brief 005 (Noroboto, font-impersonation-induced misdirection of AI document review) on the point that an authenticity assertion about content is not independently verified. The two have a symmetry: the former concerns AI input, this incident concerns AI output.

---

## 5. The detection–proof gap

Watermarks and their detection APIs are useful for labeling AI-generated content, content moderation, and initial screening, and this Brief does not deny that role. At scale, watermarks have practical value as a layer for judging "AI-generated-ness."

That said, watermarks are a detection-style approach that embeds a mark inside the artifact, and as long as the mark exists in the same signal space as the artifact, with sufficient observation it can be statistically separated, removed, and forged. This incident demonstrates that structure. As long as the criterion by which the receiver judges "did this image really come from this model" is the presence / absence of the watermark, the attacker can both remove (erase provenance) and inject (forge provenance). Treating "no watermark = not AI-generated" or "watermark present = generated by this model" in regulatory reporting, litigation, or content-authenticity proofs carries no independent attribution residue. On the academic side as well, general-purpose watermark removal and forgery attacks (for example, UnMarker at USENIX Security 2025 and Warfare on arXiv) have been demonstrated in succession from 2023 through 2026; this incident is not an isolated case.

Pre-execution / pre-distribution attestation adopts a design in which content provenance is granted not as a mark embedded in the artifact but as an independently verifiable cryptographic proof from the generating subject (a signed manifest, a ZK origin proof) that the receiver verifies. The proof sits outside the artifact's signal space and is not an "embedded mark" extractable via statistical averaging. Watermarks (detection) and cryptographic provenance (proof) are in a **complementary**, not substitutive, relationship (for the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for proving legitimacy without handing over a key, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

- **Google DeepMind**: SynthID is offered as a watermarking technology for identification of AI-generated content. An official statement responding to this incident could not be independently confirmed via official channels (blog / press release). Some secondary reporting (techbuzz.ai, stork.ai, etc.) cites The Verge as the basis for stating that Google denied recognition of a SynthID compromise, but the cited article cannot be independently confirmed for this Brief and is therefore not treated as established. DeepMind's engagement with discussion of watermark robustness is a forward-looking point
- **Regulatory developments**: The EU AI Act's watermarking / transparency requirement for AI-generated content takes effect from 2026-08-02. The phase in which watermarking becomes a regulatory requirement and the phase in which its strip-ability and forge-ability are demonstrated overlap, and the premise itself that "mandating watermarks secures provenance" is being questioned. Academic reports indicate that only a portion of AI image generators implement sufficient watermarking
- **Academic developments**: Research on attacks against watermarks for generated content increased in 2025–2026. UnMarker (USENIX Security 2025) is regarded as the first general-purpose attack against defensive watermarks, and this incident sits as a concrete demonstration within that line

How the provenance of AI-generated content should be secured, and at which layer, has surfaced as a cross-industry argument as the regulatory mandating of watermarking and the demonstration of its strip-ability proceed in parallel.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (a mark embedded in the artifact shares the same signal space as the artifact and is therefore statistically strip-able and forge-able), Lemma proposes a design that fixes content provenance not as an embedded mark but as an independently verifiable cryptographic proof from the generating subject.

- **Cryptographic provenance proof (origin proof / proof-as-auth)**: the generating subject grants, as a signed manifest or ZK origin proof, that "this artifact was generated under a legitimate origin," and the receiver verifies the proof.
- **Placed outside the signal space**: the proof sits outside the artifact's signal space, leaving no "key" inside the artifact that averaging or frequency manipulation can extract.
- **Addresses tampering in both directions**: even if the mark is stripped, or forged onto non-legitimate content, the proof tells through a separate channel whether the origin is legitimate.
- **Selective disclosure**: without exposing internal information, disclose only the minimum — that "this artifact was generated under a legitimate origin."

Detection (after-the-fact watermark judgment and moderation) works on labeling AI-generated-ness; pre-execution attestation (independent verification of provenance) works on establishing content authenticity — each complementary to the other. For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Alosh Denny / reverse-SynthID (GitHub)**: SynthID watermark reverse-engineering method, implementation, and results (phase-shift attack, approximately 91% removal, PSNR 43.5 dB / SSIM 0.997). Published 2026-03. https://github.com/aloshdenny/reverse-SynthID
- **reverse-SynthID-text (GitHub)**: Related implementation targeting SynthID text detection. https://github.com/aloshdenny/reverse-SynthID-text
- **MediaNama**: "GitHub Tool Bypasses Google SynthID Watermark" (2026-04) — https://www.medianama.com/2026/04/223-google-gemini-synthid-ai-watermark-bypass/
- **arXiv 2310.07726**: Guanlin Lee et al., "Warfare: Breaking the Watermark Protection of AI-Generated Content" (2023-10, updated 2024-03) — general-purpose framework for watermark removal and forgery attacks (background literature). https://arxiv.org/abs/2310.07726
- **ACM CSAI'25**: "Insecure AI Image Watermarking — Is it Really Damaging The Future?" (2025, Proceedings of the 2025 9th International Conference on Computer Science and Artificial Intelligence) — qualitative study arguing that watermarks such as SynthID are removable and lack interoperability (background literature). https://dl.acm.org/doi/10.1145/3788149.3788154
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
