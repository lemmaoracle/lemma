---
brief_no: 119
title: "警察庁：未成年の性的ディープフェイクの把握件数が、半年で昨年 1 年間を上回った(2026 年上半期の統計)"
title_en: "Japan's National Police Agency: Sexual-deepfake cases involving minors identified in six months passed all of last year (H1 2026 statistics)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["attribute-proof-bypass", "identity-auth"]
incident_date: 2026-08-03
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["105-japro-likeness-voice-ai-provenance", "053-youtube-deepfake-likeness-provenance", "050-grok-deepfake-consent-provenance", "054-sora2-ip-provenance-consent", "011-synthid-watermark-reverse-engineering"]
status: published
gate: "none"
version: "1.0"
og_lead_ja: "未成年の性的ディープフェイク、2026 年上半期に全国の警察が把握した事案は 123 件で、昨年 1 年間を上回った（警察庁）"
og_lead_en: "Police in Japan identified 123 sexual-deepfake cases involving minors in H1 2026, more than in all of last year (NPA)"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 性的ディープフェイク"
og_kicker_en: "AI CASE · SEXUAL DEEPFAKES"
og_headline_ja: "未成年の性的偽画像、\n半年で昨年 1 年を超す。\n<accent>警察庁が把握 123 件</accent>"
og_headline_en: "Japan's sexual deepfakes\nof minors pass last year.\n<accent>NPA: 123 cases in H1</accent>"
key_figures:
  - value: "123"
    unit: "cases"
    label: "Cases involving sexual deepfake images and videos of minors identified by police nationwide in January–June 2026, against 60 a year earlier (NPA)"
    tone: "alert"
  - value: "114"
    unit: "cases"
    label: "Cases identified across all of last year, passed in half the time (NPA)"
  - value: "83"
    unit: "cases"
    label: "Cases where the perpetrator was a classmate or a student at the same school, close to 70% (NPA)"
glossary:
  - term: "Sexual deepfake"
    desc: "A photo or video of a real person altered into sexual imagery, for example with generative AI."
  - term: "Public display"
    desc: "Placing material where an unspecified number of people can view it. Punishable under Japan's Act on Child Pornography."
  - term: "Referral to prosecutors"
    desc: "Police sending their case files to prosecutors. It does not mean guilt has been established."
insight:
  slug: "available-photo-is-not-consent"
  label: "An available photo is not authorization to generate"
  quote: "That a real person's photograph can be obtained does not authorize generating from it; unless the subject's authorization is checked before generation and publication, recipients cannot tell from the image whether it was made without permission."
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "check-origin"
    item: "Bind the source material and the person's consent to each generated image so recipients can check it"
  - slug: "hold-unverified"
    item: "Hold generation and publication until the person's consent is confirmed"
attack_method: "ai-misuse"
impact: "Police in Japan identified 123 sexual deepfake cases involving minors in six months (NPA)"
takeaway: "In the NPA's figures, close to 70% of perpetrators were students at the same school. Check the subject's own authorization before generating from, or publishing, a real person's photograph."
self_check: "Before generating from a real person's photograph, do you check that the person pictured authorized the use?"
countries: ["jp"]
---

## 1. Summary

According to the National Police Agency, nine in ten victims are junior- or senior-high students, and only 7 cases involved someone met through social media. The same day, it was reported that the Metropolitan Police Department had arrested a company employee for posting to a social-media message board sexual images made by altering photographs of real women with generative AI, and that a high-school student who commissioned the images would be referred to prosecutors. Statistics and investigation grasp harm after publication. <strong>That a real person's photograph can be obtained does not authorize generating from it; unless the subject's authorization is checked before generation and publication, recipients cannot tell from the image whether it was made without permission.</strong>

## 2. What got through

- **What got through**: Generating sexual images and videos from photographs of real people, and posting or sharing them. The NPA's statistics give the number of such cases police identified nationwide and the breakdown of victims and perpetrators. In the Metropolitan Police case reported the same day, images altered with generative AI were posted to a social-media message board where anyone could view them.
- **What the receiving side gets**: In general, a generation service receives the source photograph and the instruction, but not whether the person pictured agreed to the use. The place it is posted to receives only the image, and a recipient cannot tell from the image itself whether it was made from a real person's photograph without permission.
- **Relationship to the perpetrator**: Close to 70% of perpetrators were classmates or students at the same school as the victim (NPA). The source photographs are close at hand, and the places they are posted to are in everyday use.
- **Not disclosed**: For the cases in the statistics, the breakdown of generation tools and of posting and sharing venues. How the source photographs in the Metropolitan Police case were obtained is reported to be under investigation.

## 3. What to check

The condition that holds whatever the route is this: before generating from a real person's photograph, and before the output is published, check that the person pictured authorized the use, separately from whether the material can be obtained.

- **Who approves**: The person pictured. A photograph being on the internet or social media does not stand in for agreement to its use in generation.
- **Where the check happens**: Just before generation, and just before posting or sharing. Generation and publication that cannot be matched to the subject's authorization are held before they succeed.
- **What remains**: A record of which source material and which authorization each output rests on, in a form that shows authorization exists without handing over the subject's identity or contact details, so that checking authorization does not mean collecting data on people who may be harmed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the subject's authorization before generating from, or publishing, a real person's photograph, and keeping a record. Detection means grasping the harm after publication; here, the NPA's statistics and police investigation did that.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the pictured person's authorization before generation and publication</div>
<div class="rx-zone gapz"><b>What the NPA reported</b><span>Cases identified in six months<br>passed all of last year</span></div>
<div class="rx-zone det"><b>Detection · statistics and investigation worked</b>Cases identified; creator and commissioner charged</div>
<div class="rx-g g1"><div class="t">SOURCE</div><b>Photos of a real person exist online or on social media</b></div>
<div class="rx-g g2"><div class="t">GENERATE</div><b>Altered into sexual images with a generative AI service</b></div>
<div class="rx-g g3"><div class="t">POST</div><b>Placed on a message board where anyone can view them</b></div>
<div class="rx-g g4"><div class="t">08-03</div><b>NPA publishes the first-half statistics</b></div>
</div>
</figure>

The NPA's statistics and the Metropolitan Police investigation made visible the breakdown of victims, the relationship of perpetrators to them, and even who commissioned the images, but all of it was grasped after generation and publication had happened. Other cases where authorization for a likeness or its provenance was not checked before generation or publication are [JAPRO's likeness and voice survey](https://lemma.frame00.com/critical/briefs/105-japro-likeness-voice-ai-provenance/), [YouTube's fake celebrities](https://lemma.frame00.com/critical/briefs/053-youtube-deepfake-likeness-provenance/) and [Grok's deepfake consent](https://lemma.frame00.com/critical/briefs/050-grok-deepfake-consent-provenance/). That a provenance mark embedded in the output could be removed echoes [SynthID watermark removal](https://lemma.frame00.com/critical/briefs/011-synthid-watermark-reverse-engineering/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before generating from a real person's photograph, and just before the output is posted or shared.** It does not judge whether an image is fake or file takedown requests on anyone's behalf; it checks, before they succeed, that generation and publication carry the pictured person's own authorization.

### Industries and operations to watch

- **Industry · AI**: Services that generate images or videos depicting real people from their photos or videos.
- **Operation · Disclosure & data release**: Venues that accept posts and shares of user-made images and videos and show them to an unspecified audience.

### Current controls vs Lemma

The pattern in this case is column 1 (generating from a real person's photograph) and column 2 (posting or publishing the output).

| Control | Generating from a real person's photograph | Posting or publishing the output |
| --- | --- | --- |
| NPA awareness material on preventing victimization and offending | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

The awareness material targets the statistical finding that most perpetrators are students at the same school, and is not built into the act of generating or posting itself. Lemma checks the pictured person's authorization before generation. A check before posting can hold images that carry no authorization record, but it does not judge whether an image without a record was made from a real person. Nor does Lemma find or remove images already published.

Note: Lemma's check works only when it is built into the generation service or the posting venue and the subject's authorization is issued and managed separately from the person requesting generation. It does not act on images made by a service without the check and posted to a venue without it. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm for generating from and publishing real people's photographs

- Do you bind to each output a record of which source material and which authorization it was made from?
- Can you hold publication of output whose subject's authorization cannot be matched, before it is published?
- When a report comes in, can you trace the source material and authorization record for the output concerned?

## 5. Facts and timeline

- **Announcement**: Published by the NPA on 2026-08-03. Police nationwide identified 123 cases involving sexual deepfake images and videos of minors in January–June 2026, double the 60 in the same period a year earlier and past the 114 for all of last year.
- **Victims**: 79 junior-high students (the largest group), 38 senior-high students, 3 elementary students, 3 unknown. Nine in ten are junior- or senior-high students (NPA).
- **Perpetrators**: 83 cases involved a classmate or a student at the same school, close to 70%, against 7 involving someone met through social media (NPA).
- **Case reported the same day**: The Metropolitan Police Department had arrested a company employee (32) on suspicion of violating the Act on Child Pornography (public display) and of defamation, for using generative AI to turn photographs of real women into sexual images and posting them to a social-media message board where anyone could view them. The suspect reportedly said he had altered roughly 300 images, posted between 100 and 200 of them, and that half had been commissioned by a high-school student.
- **Source material and the law applied**: The source images were real photographs that existed on the internet and social media, some reportedly taken from material third parties had uploaded illegally. For one victim, a photograph from her junior-high years was used, which is why the Act on Child Pornography applied. How the images were obtained is reported to be under investigation.
- **Generation tool**: The suspect reportedly had a paid subscription to a generative AI site at roughly ¥3,000 a month.
- **Commissioning**: Police said a 17-year-old high-school student, who is reported to have posted a woman's photograph on social media and commissioned the images, would be referred to prosecutors on the same two charges.

### Timeline

- **2025-12-18**: The NPA publishes statistics on sexual deepfake harm to those under 18 for the first time (79 consultations for January–September 2025), showing that more than half of perpetrators were connected to the same school, and releases awareness material on preventing both victimization and offending.
- **2026-08-02**: The Metropolitan Police Department has arrested the company employee (32) by this date (reported August 3).
- **2026-08-03**: The NPA reports 123 identified cases for January–June 2026.

> The facts here rest on the NPA's announcement and on wire-service and national-newspaper reporting of it. Case counts and breakdowns are the NPA's. The person arrested is, as of writing, a suspect and not a convicted party. Individual names, places of residence, details that could identify people who were harmed, and how the images were made are omitted. This Brief does not blame any particular person or organization. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The law applied**: Japan has no standalone statute directly punishing sexual deepfakes; the Metropolitan Police case, too, is charged through a combination of existing law, the Act on Child Pornography (public display) and defamation.
- **Liability for the commissioning party**: The high-school student who commissioned the images is also to be referred to prosecutors, showing responsibility being extended beyond whoever executed the generation. Both are after-the-fact attributions of responsibility.
- **Awareness**: Since December 2025 the NPA has published awareness material aimed at both potential victims and potential offenders, a response to the statistical finding that most perpetrators are students at the same school.

## 6. Sources

- **Kyodo News (NPA announcement)**: "AI sexual images: 123 cases in the first half — NPA, double the same period last year" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/3391e8359190c7cb5db0bc47b157f0e4fea06679>
- **Kyodo News (follow-up)**: "123 AI sexual-image cases identified in the first half" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/20e637db28766a6adfc159421c098f63de852e14>
- **Nikkei (independent reporting)**: "'Deepfake' obscene images allegedly made with AI — company employee arrested" (2026-08-03, in Japanese) — <https://www.nikkei.com/article/DGXZQOUD030GY0T00C26A8000000/>
- **TBS NEWS DIG (JNN, independent reporting)**: "Photos of a real track-and-field athlete altered with generative AI — 'sexual deepfake' images allegedly posted to social media" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/43ce4783439f6729e44dceb82e72d6857782a35f>
- **Asahi Shimbun (independent reporting)**: "Junior-high gym clothes altered into nudes with AI, allegedly posted to social media — company employee arrested" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/e842e8e563ba2c9264178daf0282c869a2dfd83a>
- **National Police Agency (primary, awareness material)**: "Awareness material for preventing sexual deepfake harm to children" (2025-12-18, in Japanese) — <https://www.npa.go.jp/newlyarrived/2025/20251218001.html>
- **Jiji Press (first release of the 2025 statistics)**: "79 consultations involving under-18s over sexual fake imagery; more than half within schools — NPA discloses for the first time" (2025-12-18, in Japanese) — <https://www.jiji.com/jc/article?k=2025121800120&g=soc>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
