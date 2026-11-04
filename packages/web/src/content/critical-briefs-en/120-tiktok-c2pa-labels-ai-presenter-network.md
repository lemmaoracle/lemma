---
brief_no: 120
title: "TikTok：AI 生成の「司会者」が、シンガポールとマレーシアの偽情報を流していた(CNA 調査)"
title_en: "TikTok: AI-generated \"presenters\" pushed disinformation about Singapore and Malaysia (CNA investigation)"
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
og_lead_ja: "TikTok で AI 生成の「司会者」の偽情報動画 550 本超が 300 万回超再生されたと CNA が報告"
og_lead_en: "CNA reports 550+ TikTok videos with AI-generated presenters drew over 3 million views"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 偽情報の動画"
og_kicker_en: "AI CASE · DISINFORMATION VIDEOS"
og_headline_ja: "AI 生成の「司会者」が\n偽情報を流したと報告。\n<accent>再生は 300 万回超</accent>"
og_headline_en: "AI presenters pushed\nfalse claims, CNA says.\n<accent>Over 3M views.</accent>"
key_figures:
  - value: "550+"
    unit: "videos"
    label: "Videos examined across 30 accounts. 98% stitched AI-generated, manipulated or copied female personas to reused voices and scripts (CNA investigation)"
    tone: "alert"
  - value: "3M+"
    unit: "views"
    label: "Total views. Nearly nine in ten videos pushed false or misleading claims about Singapore and Malaysia (CNA investigation)"
  - value: "3B+"
    unit: "items"
    label: "Pieces of content TikTok has labeled as AI-generated to date (C2PA announcement)"
glossary:
  - term: "C2PA"
    desc: "Coalition for Content Provenance and Authenticity, an industry body advancing ways to show where content came from and how it was changed."
  - term: "Content Credentials"
    desc: "Information showing a piece of content's origin and the changes made along the way. The C2PA announcement calls it a digital \"nutrition label\" for media."
  - term: "Provenance"
    desc: "A record of who issued a piece of content and how it has been changed."
insight:
  slug: "no-label-not-authentic"
  label: "A missing label is not a mark of authenticity"
  quote: "A label attaches only when provenance metadata survives the path, so a missing label says nothing about whether the publisher is the creator it claims to be."
industries: ["media"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "Check, before distribution, that a video's publisher is the creator it claims to be"
attack_method: "ai-misuse"
impact: "550+ misleading videos drew over 3 million views"
takeaway: "CNA found many accounts running AI-generated personas on the same scripts. Check the publisher and the video's provenance before distribution."
self_check: "Before distributing or citing a video, do you check its publisher and provenance, separately from the account name and how it looks?"
countries: ["sg", "my"]
---

## 1. Summary

According to the investigation, the videos were built from AI-generated, manipulated or copied female personas stitched to reused voices and scripts, and multiple accounts repeated the same talking points at staggered times. The fabrication was identified by a newsroom analyzing artifacts such as pinned heads and lip-sync drift; the operator has not been identified. The operation ran on a platform where AI labeling was already happening at scale. <strong>A missing label does not show that a publisher is the creator it claims to be, and without a way to check that before distribution, one operator looks like many independent voices.</strong>

## 2. What got through

- **What got through**: Posting videos of AI-generated, manipulated or copied female personas, and their delivery to viewers through recommendation and distribution. Twenty-four accounts repeated the same talking points at staggered times, so viewers received the same claim repeatedly from different accounts (CNA investigation).
- **What the receiving side gets**: In general, the side accepting an upload receives an account and video data; that alone does not show whether the person on screen is real or whether the publisher is an independent creator. A label attaches only when provenance metadata survives the path.
- **Not disclosed**: Whether the videos examined carried provenance labels. Whether action was taken on the 28 accounts beyond the two CNA shared, or on the videos. The operator or paying client, and whether the operation was commercial or state-linked (CNA did not identify or determine these).

## 3. Pre-execution check

The condition that holds whatever the route is this: before a video lines up in front of viewers, check that the publication was issued, unaltered, by the creator it claims, separately from the account name or how the persona looks.

- **Who approves**: The creator who issued the video, with the record of issuance bound to the creator's key. The account name, the persona's appearance and the presence or absence of a label do not stand in for it.
- **Where the check happens**: In recommendation and distribution, just before a video lines up in front of viewers. A video whose provenance cannot be matched is not treated as the work of an independent creator. For videos stitched from audio, video and script, the correspondence of each component's provenance is checked too.
- **What remains**: A record of which video was distributed on the basis of which publisher's provenance, in a form where several personas set up by one operator are not counted as independent creators.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the publisher and the video's provenance before the video is distributed to viewers, and keeping a record. Detection means finding out afterwards that circulating videos were fabricated; here, a newsroom's artifact analysis did that. The date is when CNA published its investigation.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the publisher and the video's provenance before distribution</div>
<div class="rx-zone gapz"><b>What was reported</b><span>Videos of AI-generated personas<br>arrived again and again on one script</span></div>
<div class="rx-zone det"><b>Detection · newsroom analysis worked</b>Fabrication identified from artifacts; two accounts shared</div>
<div class="rx-g g1"><div class="t">PRODUCE</div><b>Voice and script stitched onto an AI persona</b></div>
<div class="rx-g g2"><div class="t">POST</div><b>24 accounts repeat the same talking points</b></div>
<div class="rx-g g3"><div class="t">DELIVER</div><b>Recommendation brings it from different accounts</b></div>
<div class="rx-g g4"><div class="t">07-13</div><b>CNA publishes its investigation</b></div>
</div>
</figure>

The newsroom identified the fabrication from artifacts such as pinned heads, lip-sync drift and shared audio tracks, but only after the views had accumulated, and those cues depend on the current roughness of generation technology. Other cases where provenance was not checked before generation or publication are [SynthID watermarking](https://lemma.frame00.com/critical/briefs/011-synthid-watermark-reverse-engineering/) (a mark embedded in the output can be removed or forged), [YouTube's fake celebrities](https://lemma.frame00.com/critical/briefs/053-youtube-deepfake-likeness-provenance/) and [JAPRO's likeness and voice survey](https://lemma.frame00.com/critical/briefs/105-japro-likeness-voice-ai-provenance/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before a video lines up in front of viewers.** It does not judge whether information is true or detect the artifacts of AI generation; it checks, before distribution, that the publication was issued, unaltered, by the creator it claims.

### Industries and operations to watch

- **Industry · Media & content**: Video platforms, news and other businesses that show received videos to people under a publisher's name.
- **Operation · Sending & delivery**: Recommending and distributing videos, and citing videos in reporting.

### Current controls vs Lemma

The route in this case is column 1 (recommendation and distribution, where a video reaches viewers as the work of an independent creator). Column 2 is judging whether the claims a video carries are false, which corresponds to the content CNA reported as false or misleading.

| Control | Recommendation and distribution (is the publisher the creator it claims?) | Judging whether claims are true |
| --- | --- | --- |
| AI-generated labels (Content Credentials, invisible watermarking) | Partial | Not relevant |
| Artifact analysis (pinned heads, lip-sync drift, shared audio) | Partial | Not relevant |
| Monitoring and terminating accounts that break the rules | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not relevant |

An AI-generated label attaches only when provenance metadata survives the path, and adversarially produced videos arrive carrying none. Artifact analysis and account termination find and stop videos and accounts after they have circulated; here, the two accounts CNA shared were terminated within days. Lemma checks, before distribution, a publication against the publisher's provenance rather than an account name or a persona's appearance, so one operator standing up many personas does not pass as many independent creators. It does not judge whether a claim is false.

Note: Lemma's check works only when it is built into recommendation and distribution and creators keep a record of issuance under their own keys. False claims published by a creator who does have provenance pass this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm when distributing or citing videos you receive

- Do you treat a video without a label as one whose provenance has not been confirmed?
- Do you have a way to avoid counting several accounts set up by one operator as independent creators?
- Do you keep a record of which video you distributed or cited on the basis of which provenance?

## 5. Facts and timeline

- **Who investigated**: CNA (Sophia Tay and CNA Verification). It examined 30 TikTok accounts and found a factory-like system behind more than 550 videos. The videos span October 2025 to June 2026.
- **How the videos were made**: 98% were assembled from AI-generated, manipulated or copied female personas stitched together with reused voices and recycled scripts.
- **Claims and views**: Nearly nine in ten videos pushed false or misleading claims about Singapore and Malaysia, drawing more than 3 million views in total.
- **Repetition**: Of the 550-plus, 94 videos consistently repeated the same false or misleading claims and alone accounted for more than 1.6 million views, almost half the total in the investigation. Twenty-four accounts repeated the same talking points at staggered times.
- **Most extreme claim**: That Singapore's foreign minister Vivian Balakrishnan had unsuccessfully begged China and Indonesia not to let a new shipping route bypass Singapore's port. CNA's investigation says no such thing happened. That single fabrication was repeated over nearly two months and viewed more than 100,000 times.
- **Artifacts**: Presenters' heads and torsos stayed almost motionless and pinned in place, within a single video and across videos; lip-sync errors were common; half the accounts that shared scripts also used the same audio tracks; and several accounts followed a naming template pairing a persona's moniker with a finance-related term while showing "burst posting" (CNA investigation).
- **Labeling**: According to the C2PA announcement, TikTok has labeled over 3 billion pieces of content as AI-generated through a combination of Content Credentials, invisible watermarking, creator education and labeling tools.

### Timeline

- **2026-02**: CNA publishes an earlier investigation showing similar narratives circulating on YouTube.
- **2026-07-13**: CNA publishes the TikTok investigation (updated July 17). Around publication it sends TikTok questions and examples of two accounts; a few days later both are terminated for breaking rules on "deceptive behaviour."
- **2026-07-28**: The C2PA announces TikTok's upgrade from General Member to Steering Committee Member.

> The facts here rest on CNA's investigation and the C2PA's official announcement. CNA shared two accounts with TikTok, and both were terminated. The article does not state whether the remaining 28 accounts or the 550-plus videos were acted on, and it does not address whether provenance labels were present on the videos it examined. CNA could not identify an operator or paying client, nor determine whether the operation was commercial or state-linked. This Brief does not blame any particular company. What has not been disclosed does not mean there were no controls.

### After disclosure

- **TikTok**: A spokesperson said the accounts had broken rules on "deceptive behaviour," and that the platform constantly monitors for and removes accounts trying to "manipulate our systems or our community in order to influence public debate." TikTok's definition of deceptive behaviour spans covert influence operations, impersonation, spam and fake reviews.
- **C2PA**: Chair Clement Wolf said in the announcement that TikTok's "early and scaled implementation of Content Credentials demonstrates how provenance can deliver meaningful value in real-world environments."
- **Expert view**: Associate Professor Saifuddin Ahmed of Nanyang Technological University described trying to spot AI artifacts as a "losing game," given rapid advances in deepfake technology. Inoculating people against the method rather than specific claims is more scalable, he argued: "the content changes, but the playbook doesn't."

## 6. Sources

- **CNA (primary, investigation)**: Sophia Tay & CNA Verification, "AI-generated women are spreading disinformation about Singapore on TikTok" (2026-07-13, updated 2026-07-17) — <https://www.channelnewsasia.com/singapore/tiktok-ai-women-disinformation-deepfake-presenters-6250271>
- **C2PA / PR Newswire (primary, announcement)**: "C2PA Welcomes TikTok to Steering Committee, Advancing the Adoption of Content Credentials at a Global Scale" (2026-07-28) — <https://www.prnewswire.com/news-releases/c2pa-welcomes-tiktok-to-steering-committee-advancing-the-adoption-of-content-credentials-at-a-global-scale-302836730.html>
- **CNA (primary, related investigation)**: Renald Loh & CNA Verification, "Some 260 fake Jack Ma videos spreading falsehoods about Singapore on YouTube: CNA investigation" (2026-07-28) — <https://www.channelnewsasia.com/singapore/jack-ma-ai-deepfakes-youtube-disinformation-falsehoods-6273136>
- **CNA (primary, earlier investigation)**: "Singapore and PM Lawrence Wong targeted in AI-driven disinformation campaign on YouTube" (2026-02) — <https://www.channelnewsasia.com/singapore/lawrence-wong-disinformation-ai-youtube-campaign-chinese-fake-videos-5949266>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
