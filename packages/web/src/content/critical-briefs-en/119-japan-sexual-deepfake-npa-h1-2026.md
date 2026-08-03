---
brief_no: 119
title: "性的ディープフェイクの相談が半年で 123 件、前年通年を超えた — 実在の人物から作られた画像に、来歴を確かめる層がない（警察庁）"
title_en: "Japan logged 123 sexual-deepfake reports in six months, passing all of last year — no layer verifies the provenance of images made from real people"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["attribute-proof-bypass", "identity-auth"]
incident_date: 2026-08-03
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["105-japro-likeness-voice-ai-provenance", "053-youtube-deepfake-likeness-provenance", "050-grok-deepfake-consent-provenance", "054-sora2-ip-provenance-consent", "011-synthid-watermark-reverse-engineering"]
status: published
version: "1.0"
og_lead_ja: "性的ディープフェイク相談、2026年上半期123件で前年通年超え — 警察庁公表"
og_lead_en: "Sexual-deepfake reports in Japan hit 123 in H1 2026, passing all of last year — NPA figures"
gap_detected: "Statistics collection, intake of reports, and investigation made the harm visible and brought charges — including against the person who commissioned the images."
gap_missing: "A layer that lets a recipient independently verify, at generation and at publication, whether use of a real person's likeness was authorized by that person."
gap_fix: "Require the subject's authorization as independently verifiable proof before likeness-based generation, and refuse generation and publication that carry no proof."
---

## 1. TL;DR

On August 3, 2026, Japan's National Police Agency reported 123 tips and consultations about sexual deepfake images and videos of minors in January–June 2026 — double the 60 recorded in the same period last year, and past the 114 recorded across all of last year in half the time. Nine in ten victims are junior- and senior-high students, and in 83 cases (close to 70%) the perpetrator was a classmate or a student at the same school. The same day, the Metropolitan Police Department arrested a 32-year-old company employee on suspicion of violating the Act on Child Pornography (public display) and of defamation, for using generative AI to turn photographs of real women into sexual images and posting them; a 17-year-old high-school student who commissioned the images is to be referred to prosecutors. Detection — statistics and investigation — worked. **What was missing is the layer that verifies, at generation and at publication, whether use of a real person's likeness was authorized by that person.**

## 2. What happened

- Per the NPA's August 3, 2026 announcement, tips and consultations about sexual deepfake images and videos of minors totaled 123 for January–June 2026, against 60 in the same period a year earlier — and past the 114 for all of last year.
- By victim: 79 junior-high students (the largest group), 38 senior-high students, 3 elementary students, 3 unknown. Nine in ten are junior- or senior-high students.
- By perpetrator: 83 cases involved a classmate or a student at the same school — close to 70% — against 7 involving someone met through social media. The harm is occurring inside close relationships.
- The same day, the Metropolitan Police Department arrested a 32-year-old company employee resident in Hyogo Prefecture for using generative AI to turn photographs of real women into sexual images and posting them to a social-media group. The charges are violation of the Act on Child Pornography (public display) and defamation. He is reported to have created roughly 300 images and posted between 100 and 200 of them.
- Victims include several women in their twenties, among them track-and-field athletes, and a woman in her forties whose photograph — taken when she was a junior-high student — was used as source material. In every case the source was a real photograph the subject had published or had taken in some other context.
- The suspect had a paid subscription to a generative AI site at roughly ¥3,000 a month. The generative capability itself is available to anyone as a commercial service.
- A 17-year-old high-school student in Kagoshima Prefecture is reported to have posted a woman's photograph on social media and commissioned the images; police indicated he would be referred to prosecutors the same day. That charges against the commissioning party were handled in parallel is a structurally notable feature of this case.

The harm arises through the following chain.

1. A real person has photographs taken or published in some other context — a competition record, a school event, a social-media post.
2. Those photographs are acquired as source material. At acquisition, no step verifies the subject's authorization.
3. They are altered into sexual images using a commercial generative AI service. At generation, again, no step verifies the subject's authorization.
4. The result is posted to a social-media group. The recipient cannot tell from the image itself whether it was made without authorization from a real person's photograph.
5. Awareness of the harm begins only when the subject or someone around them notices and files a report. That is the stage at which the statistics register it.

## 3. Timeline — disclosure and response

- 2025-12-18: The NPA publishes statistics on sexual deepfake harm to those under 18 for the first time, showing that more than half of perpetrators were connected to the same school, and releases awareness material on preventing both victimization and offending.
- 2026-08-03: The NPA reports 123 tips and consultations for January–June 2026 — double the 60 in the same period last year, and past the 114 for all of last year in half the time.
- 2026-08-03: The Metropolitan Police Department arrests a 32-year-old company employee on suspicion of violating the Act on Child Pornography (public display) and of defamation, and indicates that the 17-year-old who commissioned the images will be referred to prosecutors.

> Note: the facts here come from wire-service and national-newspaper reporting of the NPA's announcement. The person arrested is, as of writing, a suspect and not a convicted party. Individual names and details that could identify victims are omitted, as they are not needed for the structural analysis. This Brief is not a condemnation of an individual case but an examination of a structure in which the provenance of material generated from a real person is never verified at generation or at publication.

Response and industry movement after publication:

- Japan has no standalone statute directly punishing sexual deepfakes; this case, like others, is charged through a combination of existing law — the Act on Child Pornography (public display) and defamation. A gap remains between the shape of the harm and the shape of the statutes.
- Handling the commissioning party's liability in parallel signals an emerging practice of extending responsibility beyond whoever executed the generation. But this too is after-the-fact attribution, not a mechanism that prevents the generation from succeeding.
- Since December 2025 the NPA has published awareness material aimed at both potential victims and potential offenders, distributed through schools — a response calibrated to the statistical finding that most perpetrators are students at the same school.

## 4. Why it wasn't stopped

The failure here is not only a gap in the law, nor slowness in investigation. It is that at neither point — when a real person's photograph becomes source material, nor when the generated image reaches a recipient — was there **a layer that independently verified whether the use was authorized by the subject**.

Detection worked. The NPA built the statistics, took in reports, and made visible both the breakdown of victims and the relationship of perpetrators to them. Investigators arrested the creator and extended liability to the person who commissioned the work. What was missing came earlier — verification, at the instant a competition photograph or a school-event photograph is taken up as source material, and at the instant an altered image is posted, that the use falls within what was authorized.

> That nine in ten victims are junior- and senior-high students, and close to 70% of perpetrators are students at the same school, shows this is not remote offending by anonymous attackers. The source photographs are close at hand, the generative capability costs a few thousand yen a month, and the destination is a space in everyday use. There is a limit to how far after-the-fact enforcement reaches.

The same structure runs through [Brief 105 (JAPRO's likeness and voice survey)](/critical/briefs/105-japro-likeness-voice-ai-provenance/), where a 100% takedown rate still did not stop the same person's models from reappearing; [Brief 053 (YouTube's fake celebrities)](/critical/briefs/053-youtube-deepfake-likeness-provenance/), where likeness provenance was never fixed before generation and publication; and [Brief 050 (Grok's deepfake consent)](/critical/briefs/050-grok-deepfake-consent-provenance/), where a default permission state passed as proof of consent. [Brief 011 (SynthID watermarking)](/critical/briefs/011-synthid-watermark-reverse-engineering/) shows that a provenance mark embedded in the artifact can be both removed and forged. In each, whether output *looks authentic* and whether use of its source material *is authorized now* are different questions.

## 5. What proof would have changed

Proof-as-auth inserts one layer into the path ahead of each act of generating from a real person: an independent verification of the subject's authorization. Instead of leaving takedown requests and after-the-fact enforcement as the only remedy, it asks — before generation succeeds — whether this person's likeness may be used for this purpose. If the answer is "no proof of authorization," both generation and publication are held up front.

Lemma's design against this primitive:

- **Verify authorization before generation.** Bind likeness-based generation to a verifiable authorization issued by the subject rather than to the mere availability of source material. Requests carrying no proof are separated out before generation succeeds.
- **Bind provenance to the output.** Attach the source material's origin and the authorization's provenance to the output itself, in tamper-evident form, so a recipient can independently check whether the image was made from authorized material.
- **Selective disclosure of the attribute.** Make "this use is authorized" provable on its own, without handing over the subject's identity or contact details, so that verifying authorization does not require accumulating the victim's data.
- **Verify along the distribution path.** Build provenance verification into the posting and sharing path, stopping output that lacks proof of authorization before it reaches a public surface — placing verification where publication succeeds, rather than at after-the-fact removal.

Lemma is not a product that judges whether output is fake, nor one that files takedown requests. Its scope is to verify the subject's authorization independently before likeness-based generation and publication succeed, and to exclude output lacking proof. Detection (statistics, intake of reports, investigation and charges, takedown requests) and pre-execution proof (an audit trail that independently verifies authorization before generation and publication) are complementary, not alternatives. The first grasps and remedies harm that has occurred; the second establishes trust before harm can occur. For design detail see ["Proof-as-Auth: sign in without sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for scope, [Pillar 01 — Verifiable Origin](/pillars/verifiable-origin/).

## 6. Sources

- **Kyodo News (NPA announcement)**: "AI sexual images: 123 cases in the first half — NPA, double the same period last year" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/3391e8359190c7cb5db0bc47b157f0e4fea06679>
- **Kyodo News (follow-up)**: "123 AI sexual-image cases identified in the first half" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/20e637db28766a6adfc159421c098f63de852e14>
- **Nikkei**: "'Deepfake' obscene images allegedly made with AI — company employee arrested" (2026-08-03, in Japanese) — <https://www.nikkei.com/article/DGXZQOUD030GY0T00C26A8000000/>
- **TBS NEWS DIG (JNN)**: "Photos of a real track-and-field athlete altered with generative AI — 'sexual deepfake' images allegedly posted to social media" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/43ce4783439f6729e44dceb82e72d6857782a35f>
- **Asahi Shimbun**: "Junior-high gym clothes altered into nudes with AI, allegedly posted to social media — company employee arrested" (2026-08-03, in Japanese) — <https://news.yahoo.co.jp/articles/e842e8e563ba2c9264178daf0282c869a2dfd83a>
- **National Police Agency (primary, awareness material)**: "Awareness material for preventing sexual deepfake harm to children" (2025-12-18, in Japanese) — <https://www.npa.go.jp/newlyarrived/2025/20251218001.html>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 01 — Verifiable Origin](/pillars/verifiable-origin/) · [Brief 105 (JAPRO's likeness and voice survey)](/critical/briefs/105-japro-likeness-voice-ai-provenance/) · [Brief 011 (SynthID watermarking)](/critical/briefs/011-synthid-watermark-reverse-engineering/)
