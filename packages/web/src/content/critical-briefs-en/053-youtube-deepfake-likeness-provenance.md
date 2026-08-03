---
brief_no: 53
title: "偽の著名人が 2 億回見られても、肖像の来歴は誰も確かめていなかった — 肖像・音声の来歴が生成・公開の前に固定されない構造（YouTube）"
title_en: "200 Million Views of Fake Celebrities — The Likeness Provenance Gap Behind YouTube's Deepfake Detection"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "attribute-proof-bypass"]
incident_date: 2026-03-10
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "050-grok-deepfake-consent-provenance", "005-noroboto-lying-fonts"]
status: published
version: "1.0"
og_lead_ja: "偽著名人が 2 億回再生、肖像の来歴が固定されない — YouTube"
og_lead_en: "200M views of fake celebrities, likeness provenance gap — YouTube"
gap_detected: "Synthetic videos matching enrolled faces could be scanned and removed, and reporting and investigations made the scale of harm visible."
gap_missing: "There was no layer to confirm before generation or publication whether this likeness or voice had legitimate provenance with the person's consent, so synthetics lacking provenance went undistinguished before spreading."
gap_fix: "Before a high-risk action, independently verify with Lemma that this likeness or voice was generated with the person's consent and a verifiable provenance, and prevent it up front."
---

## 1. TL;DR

A campaign of AI scam ads impersonating celebrities on YouTube was, by one investigation, viewed about 200 million times. YouTube expanded an AI likeness-detection tool that scans uploaded videos for an enrolled face, but it works only after the synthetic clone has been made and spread. Because likeness and voice carry no consented provenance fixed before generation and publication, detection structurally trails the spread.

---

## 2. What happened

- **Subject**: Deepfake videos and ads impersonating celebrities on YouTube, and YouTube's AI likeness-detection tool
- **Scale of harm**: A campaign of deepfake scam ads impersonating celebrities was, by one investigation, viewed about 200 million times, as reported. YouTube removed more than 1,000 ads using fake celebrities (a 404 Media investigation was the catalyst). These became the backdrop for YouTube strengthening its likeness protections
- **Rollout of the detection tool**: YouTube expanded its AI likeness-detection tool in stages from an initial limited set of creators (the YouTube Partner Program): to politicians, government officials, and journalists in 2026-03; to major talent agencies (CAA, UTA, WME, etc.) and the celebrities they represent in 2026-04; and to all qualifying creators aged 18 and over (regardless of subscriber count or channel age) in 2026-05
- **How it works**: Similar to Content ID — a creator enrolls a face reference, the system scans uploaded videos for synthesis/alteration of the same face, and gives rights holders options to request removal or to flag it as a privacy violation

This incident stems from a structure in which the provenance and consent of likeness and voice are not fixed before generation and publication. The path by which the failure propagates into mass spread:

1. **Generation of a likeness with no provenance**: An attacker generates a synthetic video using a celebrity's face/voice without their consent. The output carries no verifiable provenance indicating whose likeness it used and under what consent
2. **Publication and distribution**: The synthetic video/ad is published and distributed on the platform. Because likeness provenance is not fixed, authenticity and the presence of consent cannot be independently confirmed at publication time
3. **Spread**: The synthetic media accumulates views and distribution, spreading at scale as scams or fake ads. Harm grows in proportion to the scale of spread
4. **Detection and removal**: A creator enrolls a face reference, the system scans uploads for synthesis, and they request removal. But this is an after-the-fact sequence operating only after the synthetic media was generated, published, and spread, and the views/harm already spread are hard to recover

---

## 3. Timeline — disclosure and response

- Through 2024: AI scam ads impersonating celebrities become a problem. A 404 Media investigation surfaces the ~200-million-view scale and the removal of 1,000+ fake ads, becoming the catalyst for YouTube's likeness measures
- 2024 to 2025: YouTube pilots the AI likeness-detection tool (creators in the YouTube Partner Program); built with CAA (partnership announced 2024-12)
- 2026-03-10: Likeness detection expanded to politicians, government officials, and journalists
- 2026-04: Expanded to major talent agencies (CAA, UTA, WME, etc.) and the celebrities they represent
- 2026-05: Expanded to all qualifying creators aged 18 and over (regardless of subscriber count or channel age)

> Note: The view count (~200 million) and the number of ads removed (1,000+) are tallies based on reporting and investigation, and the campaign's exhaustive scope varies by tally. This Brief does not describe any specific victim and focuses on the structure in which likeness provenance is not fixed.

The response and industry movement after disclosure:

- **YouTube / industry**: YouTube expanded AI likeness detection from public figures to all creators and partnered with talent agencies. While widening the net of detection and removal, a mechanism to fix likeness provenance before the generation and publication of synthetic media remains an issue independent of the detection layer. Extending likeness detection to voice is also planned
- **The provenance-and-consent question**: A mechanism to fix verifiable provenance and consent to likeness and voice — a person's own attributes — before generation and publication (content-provenance standards, consent tokenization, etc.) has surfaced as a complement to the after-the-fact nature of detection. That provenance which is strippable or added after the fact carries no real effect also echoes [Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/)
- **Cross-industry point**: There is growing discussion of shifting the center of gravity of platform trust design away from depending on post-distribution detection and removal, toward fixing the provenance and consent of likeness and voice in an independently verifiable form before generation and publication (provenance / pre-execution attestation)

---

## 4. Why it wasn't stopped

The central **failure primitive is "likeness and voice — a person's own attributes — carry no verifiable provenance or consent fixed before generation and publication, so the authenticity and presence of consent of the synthetic media cannot be independently verified at publication time"** —

The crux is what the detection tool can and cannot do. YouTube's likeness detection, like Content ID, scans uploaded videos for an enrolled face. This is a powerful detection layer, but by nature it works "after the synthetic media has been made and uploaded." If likeness provenance were fixed at the moment of generation, one could ask at publication time "does this video carry provenance with the person's consent"; as it stands there is no such provenance, so detection can only trail the spread. The scale of 200 million views arises from the gap between the absence of provenance and the after-the-fact nature of detection.

It shares a root with [Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/) (SynthID's watermark can be statistically stripped, so the provenance marker on AI output fails to function): the output's provenance is not fixed in verifiable form. It is the platform-distribution and detection-side cross-section of [Brief 050](/critical/briefs/050-grok-deepfake-consent-provenance/) (at the moment of generation, the subject's consent and attributes are not verified, and the output carries no provenance), and it moves [Brief 005](/critical/briefs/005-noroboto-lying-fonts/)'s "divergence between display and substance" (font spoofing diverging what is seen from what the AI ingests) onto the authenticity of likeness. What this case shows is the limit of chasing synthetic media with detection alone, while likeness provenance is not fixed before generation and publication.

YouTube's AI likeness detection, partnership with talent agencies, removal of fake ads, and visibility through reporting are all indispensable for grasping, removing, and deterring harm; this Brief does not deny that role. Detecting and removing scams and fake ads, and building a flagging path for rights holders, are the highest-priority operational responses and should be strengthened.

At the same time, detection does not, **at the moment of generation and publication**, independently establish "does this video's likeness carry legitimate provenance with the person's consent." Likeness detection scans for "does it match an enrolled face," but that works after the synthetic media is uploaded. Watermarks can be stripped ([Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/)), and removal does not recover views already spread. What was missing is the at-generation-and-publication independent verification of "was this likeness/voice generated with the person's consent and accompanied by verifiable provenance," which is a separate track from after-the-fact scanning and removal. As long as detection is placed after generation and publication, the response can only trail the spread.

---

## 5. What proof would have changed

Pre-execution attestation and provenance binding close this gap by fixing verifiable provenance and consent to likeness and voice before generation and publication. By binding to the output, via docHash, a provenance indicating whose likeness it used and under what consent, and by making the publication path able to ask "does this carry provenance with the person's consent," synthetic media lacking provenance can be distinguished before spread. Detecting the synthetic media (the detection-style "does it match an enrolled face") and proving likeness provenance ("does it carry provenance with the person's consent") are not substitutes but **complements**.

Against the gap this incident exposed (the provenance and consent of likeness and voice are not fixed before generation and publication, and detection trails the spread), Lemma proposes a design that, before the act of generation and publication, fixes likeness provenance and consent as independently verifiable cryptographic proof.

- **Provenance binding of likeness**: Bind to the output, at the moment of generation, a provenance indicating whose likeness/voice it used and under what consent (docHash binding). Make after-the-fact stripping and forgery verifiable from the provenance side
- **Pre-execution attestation of consent**: Before generation and publication using a likeness/voice, require the person's consent as verifiable proof. Distinguish likeness use without consent before publication
- **Provenance lookup on the distribution path**: Make the platform's publication and distribution path able to query "does this video carry provenance with the person's consent," so synthetic media lacking provenance can be handled before spread
- **Complement to detection**: Distinguish, by evidence, legitimate synthesis/editing that carries provenance (consented parody, dubbing, etc.) from malicious synthesis that lacks it, complementing the after-the-fact nature of detection with up-front proof

Through this, provenance fixed at the moment of generation and publication functions as an independently verifiable trail for "does this likeness carry provenance with the person's consent," before spread. Detection and removal (after-the-fact scanning and removal) serve to remove and deter harm, while pre-execution attestation of provenance and consent (fixing before generation and publication) serves to distinguish synthetic media before the fact — each working complementarily.

---

## 6. Sources

- **Axios**: "YouTube expands deepfake detection tool to politicians and journalists" (2026-03-10; the expansion and mechanics of likeness detection) — <https://www.axios.com/2026/03/10/youtube-deepfake-detection-journalists-politicians>
- **TechCrunch**: "YouTube expands its AI likeness detection technology to celebrities" (2026-04-21; expansion to talent agencies and celebrities) — <https://techcrunch.com/2026/04/21/youtube-expands-its-ai-likeness-detection-technology-to-celebrities/>
- **Bitdefender (HotForSecurity)**: "YouTube's New AI Tool Fights Deepfakes—But Creators Still Need Real Protection" (the limits of detection; the scale of the scam campaign) — <https://www.bitdefender.com/en-us/blog/hotforsecurity/youtubes-new-ai-tool-fights-deepfakes-but-creators-still-need-real-protection>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/#provenance), [Trust402](https://lemma.frame00.com/trust402/)
