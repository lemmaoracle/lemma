---
brief_no: 120
title: "TikTok の AI ラベル 30 億件と、AI 生成の「司会者」550 本超の偽情報が同時に成立していた — ラベルの不在は、真正の証明にならない（C2PA / CNA 調査）"
title_en: "TikTok's 3 billion AI labels coexisted with a 550-video AI-presenter disinformation operation — the absence of a label is not proof of authenticity (C2PA / CNA)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-07-13
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance", "105-japro-likeness-voice-ai-provenance", "119-japan-sexual-deepfake-npa-h1-2026", "050-grok-deepfake-consent-provenance"]
status: published
version: "1.0"
og_lead_ja: "TikTok の AI ラベル30億件と、AI生成司会者550本超の偽情報が同時に成立"
og_lead_en: "TikTok's 3 billion AI labels coexisted with a 550-video AI-presenter disinformation network"
gap_detected: "A newsroom's artifact analysis identified the fabrication, and the two accounts it shared were terminated promptly by the platform."
gap_missing: "A layer that lets a viewer independently verify, at the moment of viewing, that a video's publisher is the real creator it claims to be."
gap_fix: "Require publisher and artifact provenance as independently verifiable proof, so viewers can separate out publications carrying no proof before they watch."
---

## 1. TL;DR

On July 13, 2026, **CNA** published an investigation into 30 **TikTok** accounts and more than 550 videos. 98% were assembled from AI-generated, manipulated, or copied female personas stitched to reused voices and recycled scripts; nearly nine in ten pushed false or misleading claims about Singapore and Malaysia, drawing more than 3 million views. Fifteen days later the C2PA announced TikTok's promotion to its Steering Committee, noting that TikTok has to date labeled over 3 billion pieces of content as AI-generated. The operation ran on a platform that had, by then, labeled content at that scale. Detection — labeling and takedown — worked. **What was missing is the layer that lets a viewer independently verify, at the moment of viewing, that a video's publisher is the real creator it claims to be.**

## 2. What happened

- CNA (Sophia Tay and CNA Verification) examined 30 TikTok accounts and found a factory-like system behind more than 550 videos. Published July 13, 2026; updated July 17.
- 98% were assembled by taking AI-generated, manipulated, or copied female personas and stitching them together with reused voices and recycled scripts.
- Nearly nine in ten videos pushed false or misleading claims about Singapore and Malaysia, drawing more than 3 million views in total. The videos span October 2025 to June 2026.
- Of the 550-plus, 94 videos consistently repeated the same false or misleading claims. Those 94 alone accounted for more than 1.6 million views — almost half the total in the investigation. Twenty-four accounts repeated the same talking points at staggered times.
- The most extreme claim was that Singapore's foreign minister Vivian Balakrishnan had unsuccessfully begged China and Indonesia not to let a new shipping route bypass Singapore's port. No such thing happened. That single fabrication was repeated over nearly two months and viewed more than 100,000 times.
- CNA sent questions to TikTok and shared examples of two accounts. A few days later both were terminated for breaking rules on "deceptive behaviour."
- On July 28, 2026, the C2PA (Coalition for Content Provenance and Authenticity) announced TikTok's upgrade from General Member to Steering Committee Member. The release states that TikTok has labeled over 3 billion pieces of content as AI-generated through a combination of Content Credentials, invisible watermarking, creator education, and labeling tools.

The disinformation succeeds through the following chain.

1. A female persona is produced by AI generation, manipulation, or copying. Whether the persona corresponds to a real person is not something a viewer can check.
2. Reused audio tracks and recycled scripts are stitched onto that persona, so the same talking point is delivered by different faces in different voices.
3. Twenty-four accounts repeat the same script at staggered times, producing the appearance of independent creators arriving separately at the same conclusion.
4. Recommendation and distribution deliver the claim to a viewer repeatedly, from different accounts. The repetition itself raises familiarity and, with it, plausibility.
5. At the moment of viewing there is no way to check whether the publisher is an independent, real creator. Any attempt at that check comes later, once a newsroom has analyzed the artifacts.

## 3. Timeline — disclosure and response

- 2025-10 to 2026-06: the period over which the 550-plus videos examined were posted.
- 2026-02: CNA publishes an earlier investigation showing similar narratives circulating on YouTube.
- 2026-07-13: CNA publishes the TikTok investigation (updated July 17).
- Around 2026-07-13: CNA sends TikTok questions and examples of two accounts. Both are terminated a few days later for "deceptive behaviour."
- 2026-07-28: The C2PA announces TikTok's Steering Committee membership, citing over 3 billion pieces of content labeled as AI-generated to date.

> Note: this Brief rests on two primary sources — CNA's investigation and the C2PA's official announcement. **CNA shared two accounts with TikTok, and both were terminated.** Enforcement worked completely on what was shared. The article does not state whether the remaining 28 accounts or the 550-plus videos were acted on, and it does not address whether provenance labels were present on the videos it examined. CNA could not identify an operator or paying client behind the operation, nor determine whether it was commercial or state-linked. This Brief is not a condemnation of a particular platform but an examination of a structure in which publisher provenance is never verified at the moment of viewing.

The response and industry movement after disclosure:

- A TikTok spokesperson said the accounts had broken rules on "deceptive behaviour," and that the platform constantly monitors for and removes accounts trying to "manipulate our systems or our community in order to influence public debate." TikTok's definition of deceptive behaviour spans covert influence operations, impersonation, spam, and fake reviews.
- C2PA Chair Clement Wolf said in the announcement that TikTok's "early and scaled implementation of Content Credentials demonstrates how provenance can deliver meaningful value in real-world environments." Content Credentials are positioned as a digital "nutrition label" for media, conveying a piece of content's origin and the changes made along the way.
- CNA identified the fabrication through artifacts: presenters' heads and torsos stayed almost motionless and pinned in place, both within a single video and across videos; lip-sync errors were common, consistent with audio produced separately and spliced onto the visuals; half the accounts that shared scripts also used the same audio tracks; and several accounts followed a naming template pairing a persona's moniker with a finance-related term while showing "burst posting."
- Experts offered a different reading. Associate Professor Saifuddin Ahmed of Nanyang Technological University described trying to spot AI artifacts as a "losing game," given rapid advances in deepfake technology. Inoculating people against the method rather than specific claims is more scalable, he argued: "the content changes, but the playbook doesn't."

## 4. Why it wasn't stopped

The failure here is not that labeling was absent, nor that removal failed to work. It is that **no layer let a viewer independently verify, at the moment of viewing, that a video's publisher was the real creator it claimed to be**.

Detection worked. The platform labeled over 3 billion pieces of content as AI-generated, rose to the steering committee of the provenance consortium, and terminated the two shared accounts within days. The newsroom analyzed 30 accounts and 550-plus videos and identified the fabrication from artifacts — pinned heads, lip-sync drift, shared audio tracks. What was missing came earlier: verification, at each of the individual viewings that accumulated into 3 million, that the publisher was an independent, real creator.

Artifact-based judgment is detection, not proof. Heads that do not move, lips that drift out of sync, voices that repeat — these cues depend on the current roughness of generation technology, and they disappear as it improves.

The same holds on the labeling side. A label attaches only when provenance metadata survives the path. The absence of a label is therefore not proof that content is not AI-generated, and adversarially produced content arrives carrying none. Three billion labels say something about three billion labeled items; they say nothing about everything else.

> Enforcement worked completely against what was shared. Both accounts CNA passed on were terminated within days. But that is an after-the-fact operation against individually reported targets; it does not become a structure that keeps the next 550 videos from succeeding. Against a system in which 24 accounts cycle the same script, per-item removal after the fact is not a design that keeps pace.

[Brief 011 (SynthID watermarking)](/critical/briefs/011-synthid-watermark-reverse-engineering/) shows that a provenance mark embedded in the artifact can be both removed and forged. The failure primitive is shared with [Brief 053 (YouTube's fake celebrities)](/critical/briefs/053-youtube-deepfake-likeness-provenance/), where 200 million views accrued without likeness provenance ever being fixed before publication; [Brief 105 (JAPRO's likeness and voice survey)](/critical/briefs/105-japro-likeness-voice-ai-provenance/), where a 100% takedown rate still did not stop reappearance; and [Brief 119 (123 sexual-deepfake cases identified in Japan)](/critical/briefs/119-japan-sexual-deepfake-npa-h1-2026/), where the statistics showed the limits of after-the-fact enforcement. In each, whether output *looks authentic* and whether its publisher and provenance *are being verified now* are different questions.

## 5. What proof would have changed

Proof-as-auth inserts one layer ahead of each path by which a video reaches a viewer: an independent verification of publisher and artifact provenance. Instead of treating the presence or absence of a label as a stand-in for authenticity, it makes checkable whether this publication came, unaltered, from the creator it claims. If the answer is "no proof of provenance," a viewer can separate it out before receiving it as the work of an independent creator.

Lemma's design against this primitive:

- **Verify publisher provenance.** Bind a publication to the publisher's verifiable provenance rather than to an account name or the look of a persona. One operator standing up many personas does not pass as many independent creators.
- **Invert what a missing label means.** Replace the presumption "no label means not AI-generated" with the default "no proof of provenance means not independently confirmed," so that the absence of proof functions correctly as evidence.
- **Bind artifact integrity.** For artifacts assembled from separately produced audio, video, and script, bind the provenance of those components in tamper-evident form. Reused audio tracks and duplicated personas are separated out as lacking provenance correspondence.
- **Verify along the distribution path.** Build provenance verification into recommendation and distribution, separating out publications that lack proof before they line up in front of a viewer as "independent voices." Repetition never gets the chance to build familiarity.

Lemma is not a product that adjudicates whether information is true, nor one that detects the artifacts of AI generation. Its scope is to verify publisher and artifact provenance independently before a publication reaches a viewer, and to let viewers filter out publications that carry no proof. Detection (newsroom analysis, platform monitoring and removal, expanding labeling) and pre-execution proof (an audit trail that independently verifies publisher provenance before viewing) are complementary, not alternatives. The first grasps and contains circulation that has occurred; the second separates it out before it earns trust. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for design detail, ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/); for scope, [Pillar 01 — Verifiable Origin](/pillars/#provenance).

## 6. Sources

- **CNA (primary, investigation)**: Sophia Tay & CNA Verification, "AI-generated women are spreading disinformation about Singapore on TikTok" (2026-07-13, updated 2026-07-17) — <https://www.channelnewsasia.com/singapore/tiktok-ai-women-disinformation-deepfake-presenters-6250271>
- **C2PA / PR Newswire (primary, announcement)**: "C2PA Welcomes TikTok to Steering Committee, Advancing the Adoption of Content Credentials at a Global Scale" (2026-07-28) — <https://www.prnewswire.com/news-releases/c2pa-welcomes-tiktok-to-steering-committee-advancing-the-adoption-of-content-credentials-at-a-global-scale-302836730.html>
- **CNA (primary, related investigation)**: Renald Loh & CNA Verification, "Some 260 fake Jack Ma videos spreading falsehoods about Singapore on YouTube: CNA investigation" (2026-07-28) — <https://www.channelnewsasia.com/singapore/jack-ma-ai-deepfakes-youtube-disinformation-falsehoods-6273136>
- **CNA (primary, earlier investigation)**: "Singapore and PM Lawrence Wong targeted in AI-driven disinformation campaign on YouTube" (2026-02) — <https://www.channelnewsasia.com/singapore/lawrence-wong-disinformation-ai-youtube-campaign-chinese-fake-videos-5949266>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 01 — Verifiable Origin](/pillars/#provenance) · [Brief 011 (SynthID watermarking)](/critical/briefs/011-synthid-watermark-reverse-engineering/) · [Brief 053 (YouTube's fake celebrities)](/critical/briefs/053-youtube-deepfake-likeness-provenance/)
