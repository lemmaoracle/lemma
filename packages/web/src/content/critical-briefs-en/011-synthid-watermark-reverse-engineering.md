---
brief_no: 11
title: "SynthID 透かし reverse-engineering — AI 生成コンテンツの来歴標識が統計的に剥がせる構造"
title_en: "SynthID Watermark Reverse-Engineering — How a Statistical Attack Strips the Provenance Mark from AI-Generated Content"
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
og_lead_ja: "AI 生成コンテンツの来歴透かしが統計的に剥がせる — SynthID リバースエンジニアリング"
og_lead_en: "A statistical attack strips the AI-content provenance mark — SynthID reverse-engineering"
---

## TL;DR

In March 2026, independent researcher Alosh Denny reverse-engineered Google DeepMind's watermark for AI-generated images, **SynthID**, and published the method and implementation on GitHub. The attack uses neither neural networks nor proprietary access — only a 2D Fourier transform and phase-coherence analysis (a phase-shift attack) over 123,000 Gemini-generated images — to remove **approximately 91%** of the watermark energy while preserving image quality almost entirely (PSNR 43.5 dB / SSIM 0.997, resolution-independent). This is not an attack on a specific organization but a security-research demonstration; nevertheless, it exposes a structure in which the design that secures the provenance of AI-generated content as "a mark embedded in the artifact" can have the mark itself statistically stripped or forged. This Brief addresses, from the perspective of Pillar 01 (Verifiable Origin), the non-bridgeability between watermarks (detection-style marking) and cryptographic provenance proofs.

---

## 1. Incident Overview

- **Target system**: Google DeepMind SynthID (embeds an invisible watermark in AI-generated images and judges whether content is AI-generated via a detection API; targets Gemini-generated images)
- **Demonstrator**: Alosh Denny (independent researcher)
- **Form of disclosure**: Method, code, and results published on GitHub (`aloshdenny/reverse-SynthID`). A related `reverse-SynthID-text` targeting text-mode detection also exists. Discussion in technical communities (Hacker News, etc.)
- **Date**: 2026-03-05 (public disclosure, at the publication of Medium "How to Reverse SynthID (legally😉)." The first commit on GitHub was 2025-12-15; Hacker News discussion was around 2026-04-11)
- **Method**: No neural networks, no proprietary access used. Using 123,000 Gemini-generated images, the researcher observes that SynthID encodes at a fixed carrier frequency with constant phase. By averaging across many images, the frequency-domain signature of the watermark (the pattern equivalent to the key) is extracted; a phase-shift attack targets this frequency to nullify it
- **Result**: Approximately 91% of watermark energy removed; image quality almost intact (PSNR 43.5 dB / SSIM 0.997); reproducible at arbitrary resolution on Gemini images
- **Nature**: Not an attack incident (an event with a victim organization and damages) but a security-research demonstration of the structural limits of provenance marking

---

## 2. Timeline

- 2025-12-15: Alosh Denny opens the GitHub repository `aloshdenny/reverse-SynthID` privately (dev begins)
- 2026-03-05: Publicly discloses the reverse-engineering method in Medium "How to Reverse SynthID (legally😉)"
- Around 2026-04-11: Discussion expands on Hacker News (item 47709130); interest spreads across technical communities
- After April 2026: The existence of a SynthID-watermark bypass tool based on the method is reported in general media (MediaNama, etc.)
- 2026-08-02: The EU AI Act's mandatory watermarking of AI-generated content (transparency requirement) takes effect. The phase in which watermarking becomes a regulatory requirement and the phase in which its strip-ability is demonstrated overlap

---

## 3. Event Chain

1. **Observation**: Identifies that SynthID encodes a fixed carrier frequency with constant phase across image populations. Because the watermark is consistent across outputs, a common frequency-domain signature appears across multiple images
2. **Key extraction**: Averages noise across many Gemini-generated images (123,000 in the demonstration) and isolates the common pattern — the watermark's signature. Statistically recovers "the equivalent of the key" without proprietary access
3. **Removal**: A phase-shift attack targets the specific frequency where the watermark resides and manipulates the phase to nullify the mark. Removes approximately 91% of watermark energy without giving visually noticeable damage to image quality
4. **Forging surface**: Once the watermark's signature is recovered, the inverse — injecting the watermark into non-AI-generated content (misattribution) — also holds by the same principle. As long as the presence / absence of the watermark is the criterion for authenticity, tampering in both directions becomes a threat

---

## 4. Structural Analysis

This incident belongs to the `data-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that the provenance of AI-generated content is secured as "a mark embedded in the artifact itself," and because the mark shares statistical properties with the artifact, it can be externally observed, extracted, removed, and forged. The provenance assertion (this image is / is not AI-generated) is detached from an independently verifying proof in a separate channel. Secondary tagging is `ai-decision-integrity`, recording the straddle with the verifiability of AI outputs (Pillar 02).

This incident follows Brief 008 (Discord scraping) as another instance of "trust-layer risk events that are not attack incidents" (per the Methodology's scope expansion). Where Brief 008 addressed the provenance of training data via a public API plus terms of service, this incident addresses the provenance mark of AI **outputs**. Both share the structure that "the provenance of data / content lacks an independent verification layer." It is also adjacent to Brief 005 (Noroboto, font-impersonation-induced misdirection of AI document review) on the point that an authenticity assertion about content is not independently verified. The two have a symmetry: the former concerns AI input, this incident concerns AI output.

---

## 5. The Structural Gap Detection Alone Cannot Close

Watermarks and their detection APIs are useful for labeling AI-generated content, content moderation, and initial screening, and this Brief does not deny that role. At scale, watermarks have practical value as a layer for judging "AI-generated-ness."

That said, watermarks are a detection-style approach that embeds a mark inside the artifact, and as long as the mark exists in the same signal space as the artifact, with sufficient observation it can be statistically separated, removed, and forged. This incident demonstrates that structure. As long as the criterion by which the receiver judges "did this image really come from this model" is the presence / absence of the watermark, the attacker can both remove (erase provenance) and inject (forge provenance). Treating "no watermark = not AI-generated" or "watermark present = generated by this model" in regulatory reporting, litigation, or content-authenticity proofs carries no independent attribution residue. On the academic side as well, general-purpose watermark removal and forgery attacks (for example, UnMarker at USENIX Security 2025 and Warfare on arXiv) have been demonstrated in succession from 2023 through 2026; this incident is not an isolated case.

Pre-execution / pre-distribution attestation adopts a design in which content provenance is granted not as a mark embedded in the artifact but as an independently verifiable cryptographic proof from the generating subject (a signed manifest, a ZK origin proof) that the receiver verifies. The proof sits outside the artifact's signal space and is not an "embedded mark" extractable via statistical averaging. Watermarks (detection) and cryptographic provenance (proof) are in a **complementary**, not substitutive, relationship (for the thesis on the relationship between detection and pre-execution attestation, see [The last layer left in AI-era cyber defense](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

- **Google DeepMind**: SynthID is offered as a watermarking technology for identification of AI-generated content. An official statement responding to this incident could not be independently confirmed via official channels (blog / press release). Some secondary reporting (techbuzz.ai, stork.ai, etc.) cites The Verge as the basis for stating that Google denied recognition of a SynthID compromise, but the cited article cannot be independently confirmed for this Brief and is therefore not treated as established. DeepMind's engagement with discussion of watermark robustness is a forward-looking point
- **Regulatory developments**: The EU AI Act's watermarking / transparency requirement for AI-generated content takes effect from 2026-08-02. The phase in which watermarking becomes a regulatory requirement and the phase in which its strip-ability and forge-ability are demonstrated overlap, and the premise itself that "mandating watermarks secures provenance" is being questioned. Academic reports indicate that only a portion of AI image generators implement sufficient watermarking
- **Academic developments**: Research on attacks against watermarks for generated content increased in 2025–2026. UnMarker (USENIX Security 2025) is regarded as the first general-purpose attack against defensive watermarks, and this incident sits as a concrete demonstration within that line

How the provenance of AI-generated content should be secured, and at which layer, has surfaced as a cross-industry argument as the regulatory mandating of watermarking and the demonstration of its strip-ability proceed in parallel.

---

## 7. Lemma's Analysis

Against the structural gap exposed by this incident (a mark embedded in the artifact shares the same signal space as the artifact and is therefore statistically strip-able and forge-able), Lemma proposes a design that fixes content provenance not as an embedded mark but as an independently verifiable cryptographic proof from the generating subject. The provenance proof is placed outside the artifact's signal space, and no "key" extractable via averaging or frequency manipulation is left inside the artifact. Even if the mark is stripped, the proof tells through a separate channel whether "this artifact was generated under a legitimate origin or not." For design details see [Bridge exploits in 2026: the case for verifiable origin proofs](https://lemma.frame00.com/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04) and [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Alosh Denny / reverse-SynthID (GitHub)**: SynthID watermark reverse-engineering method, implementation, and results (phase-shift attack, approximately 91% removal, PSNR 43.5 dB / SSIM 0.997). Published 2026-03. https://github.com/aloshdenny/reverse-SynthID
- **reverse-SynthID-text (GitHub)**: Related implementation targeting SynthID text detection. https://github.com/aloshdenny/reverse-SynthID-text
- **MediaNama**: "GitHub Tool Bypasses Google SynthID Watermark" (2026-04) — https://www.medianama.com/2026/04/223-google-gemini-synthid-ai-watermark-bypass/
- **arXiv 2310.07726**: Guanlin Lee et al., "Warfare: Breaking the Watermark Protection of AI-Generated Content" (2023-10, updated 2024-03) — general-purpose framework for watermark removal and forgery attacks (background literature). https://arxiv.org/abs/2310.07726
- **ACM CSAI'25**: "Insecure AI Image Watermarking — Is it Really Damaging The Future?" (2025, Proceedings of the 2025 9th International Conference on Computer Science and Artificial Intelligence) — qualitative study arguing that watermarks such as SynthID are removable and lack interoperability (background literature). https://dl.acm.org/doi/10.1145/3788149.3788154
