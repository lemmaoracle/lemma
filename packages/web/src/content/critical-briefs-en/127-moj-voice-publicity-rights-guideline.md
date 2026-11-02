---
brief_no: 127
title: "法務省：生成 AI の解釈指針で、声をパブリシティ権の保護対象と明記した(検討会の取りまとめ報告書)"
title_en: "Japan's Ministry of Justice: generative-AI guidance states that voice falls within publicity rights (study group final report)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["attribute-proof-bypass", "identity-auth"]
incident_date: 2026-07-27
published: 2026-08-07
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["105-japro-likeness-voice-ai-provenance", "117-speechify-voice-cloning-consent-checkbox", "054-sora2-ip-provenance-consent", "053-youtube-deepfake-likeness-provenance"]
status: published
gate: "none"
version: "1.0"
og_lead_ja: "法務省が「声」をパブリシティ権の保護対象と明記、生成AI の解釈指針を公表"
og_lead_en: "Japan's MOJ puts voice inside publicity rights in its generative-AI interpretation guidance"
layout: "report"
sections: "proof"
og_kicker_ja: "当局の指針 · 声のパブリシティ権"
og_kicker_en: "GOVERNMENT GUIDANCE · VOICE RIGHTS"
og_headline_ja: "声もパブリシティ権の\n保護対象と、法務省が明記。\n<accent>生成 AI の解釈指針</accent>"
og_headline_en: "Voice is within publicity\nrights, Japan's MOJ says.\n<accent>Guidance for generative AI</accent>"
key_figures:
  - value: "3"
    unit: "categories"
    label: "The infringement test that applies to name and likeness, held to apply to voice as well (Ministry of Justice report)"
    tone: "alert"
  - value: "5"
    unit: "sessions"
    label: "Study group meetings from 2026-04-24 to 07-27; the final report was approved at the last one"
  - value: "07-28"
    label: "The Japan Actors Union published its position, asking that prior consent before generation be stated in the final guidance"
glossary:
  - term: "Publicity rights"
    desc: "Rights concerning use of the customer-drawing power carried by \"likeness and the like\", such as a name or portrait. The report holds that voice is included in that phrase."
  - term: "Customer-drawing power"
    desc: "The power to promote sales of a product. The report recognises it where a voice actor's voice itself promotes sales."
  - term: "Interpretive guidance"
    desc: "An account of how existing frameworks are read. The report is not legislation and creates no new cause of action."
insight:
  slug: "remedy-after-generation"
  label: "Remedies that act after generation"
  quote: "Unless a use of someone's voice is checked against that person's consent before generation, whether consent existed becomes something to argue after the work has been distributed and monetised."
industries: ["ai", "media"]
operations: ["delivery"]
attack_method: "ai-misuse"
countries: ["jp"]
controls:
  - slug: "check-origin"
    item: "Tie each generated voice to the specific consent it was checked against: whose voice, what scope, until when"
  - slug: "hold-unverified"
    item: "Stop generated voices without a confirmed consent before distribution and monetization"
  - slug: "audit-trail"
    item: "Record when and by whom the consent was checked, in a form that cannot be rewritten later"
takeaway: "The Ministry of Justice report places voice within publicity rights and lets takedowns be demanded of platforms too. The remedies it sets out act once the work is out. Check the person's consent before generation."
self_check: "Before generating or publishing a person's voice, do you check that the use falls within what that person consented to?"
---

## 1. Summary

The report states that voice can fall within publicity rights, applies the same test used for name and likeness, and holds that a takedown can be demanded of the platform operator as well. The interpretive layer moved forward. Yet every remedy it sets out — damages, injunctions, takedowns — presumes the generated work already exists, and the report itself says the fit for generative AI is "not necessarily clear." <strong>Unless a use of someone's voice is checked against that person's consent before generation, whether consent existed becomes something to argue after the work has been distributed and monetised.</strong>

## 2. What got through

- **What got through**: The scenario the report addresses is a video or audio work made by using someone's voice without permission through generative AI, then posted, distributed and monetised. In that case, the report says, the voice becomes embedded in the work, and which existing category it falls under is not necessarily clear (Ministry of Justice report).
- **What the receiving side gets**: In general, a platform accepting a post receives the video or audio containing the generated voice, and nothing more. Whose consent, and which grant, the use rests on cannot be read from the work itself.
- **Remedies the report sets out**: Damages and injunctions, and for content on the internet, a takedown demand that can be made of the platform operator that manages and runs it. An injunction is framed as being "to remove an infringement now being carried out, or to prevent an infringement that would otherwise arise," so it starts from an infringing act (Ministry of Justice report).
- **Not disclosed**: The summary document (marked "in preparation" at the time of writing). The parties, post counts and revenue figures in the reported suit by a voice actor against a video-platform operator (this Brief could not confirm it from a primary source).

## 3. What to check

The condition that holds whatever the scenario is this: before a person's voice is used to generate a work, and before that work is distributed or monetised, check that the use falls within the voice owner's own consent — whose voice, what scope, until when.

- **Who approves**: The owner of the voice. A machine judging whether two voices sound alike, or whose voice it is, is not the approval; the grant the owner issued is.
- **Where the check happens**: Just before a voice is used in generation, and just before the work is distributed or monetised. A work whose consent cannot be matched does not go on to distribution or monetisation.
- **What remains**: A record of which work rested on whose grant, and when and under whose issuance it was checked — in a form that shows "this use is covered by a grant" without handing over the person's whole consent record.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a voice is used in generation and distribution, that the use falls within the person's consent, and keeping a record. Detection means the rights holder finding the work once it is out and seeking a remedy. The lower row is the order in which the report's framework reaches a case.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · ahead of the report's remedies</b>Check against the person's consent before generation and distribution</div>
<div class="rx-zone gapz"><b>What the report set out</b><span>Voice can fall within publicity rights;<br>takedowns can be demanded of platforms</span></div>
<div class="rx-zone det"><b>Detection · acts once the work is out</b>The rights holder finds it and seeks damages and removal</div>
<div class="rx-g g1"><div class="t">GENERATE</div><b>Audio imitating the voice is made without consent being checked</b></div>
<div class="rx-g g2"><div class="t">PUBLISH</div><b>A work with that audio is posted, distributed and monetised</b></div>
<div class="rx-g g3"><div class="t">ASSESS</div><b>Only once a product exists can the test be applied</b></div>
<div class="rx-g g4"><div class="t">CLAIM</div><b>Damages and removal are sought; the work remains meanwhile</b></div>
</div>
</figure>

The test the report sets out turns on use "solely for the purpose of exploiting the customer-drawing power the voice carries," and that purpose can only be judged once a product exists. Check consent before generation and there are fewer cases left to argue afterwards about which category a work falls under. This runs in the same direction as [JAPRO's survey](https://lemma.frame00.com/critical/briefs/105-japro-likeness-voice-ai-provenance/), where a 100% takedown rate still left a fresh model of the same person being posted, [Speechify](https://lemma.frame00.com/critical/briefs/117-speechify-voice-cloning-consent-checkbox/), where consent was alleged to rest on a single checkbox, and [Sora 2](https://lemma.frame00.com/critical/briefs/054-sora2-ip-provenance-consent/), on moving permission ahead of generation.

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before a voice is used in generation and distribution.** It does not judge whether voices sound alike, and it does not find and remove works; it makes which of the owner's grants a use rests on checkable before distribution and monetisation, by the receiving side and without querying the issuer.

### Industries and operations to watch

- **Industry · AI**: Services that generate speech sounding like a real person from that person's voice.
- **Industry · Media & content**: Platforms and producers that distribute and monetise video or audio containing voices.
- **Operation · Sending & delivery**: Posting, distributing and monetising works that contain generated voice.

### Current controls vs Lemma

The scenario the report addresses spans all three columns. The remedies it sets out act mainly in the third (once the work is out).

| Control | Using a voice in generation (before generation) | Distributing and monetising the work | Removing or correcting once it is out |
| --- | --- | --- | --- |
| Claim for damages | Not relevant | Not relevant | Partial |
| Injunction and takedown demand (including of platforms) | Not relevant | Partial | Effective |
| Operator's own consent-management log | Partial | Not effective | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not relevant |

Damages correct harm after it has spread; they do not take the work out of circulation. An injunction aims to remove an infringement now being carried out and to prevent future ones, but it starts from an infringing act. An operator's consent-management log is something the party collecting the grants produces for itself; neither the rights holder nor the platform can check it independently. Lemma checks the person's consent before generation and distribution, but it does not detect or remove works, so it plays no part in takedowns once a work is out. The report's remedies and Lemma are complementary, not alternatives.

Note: Lemma's check works only when it is built in just before a voice is used in generation and distribution, and the person's consent is issued and managed separately from whoever generates the work. Generation within the scope of a grant passes this check. Whether voices sound alike is for a person to weigh, under the test the report sets out. Stopping distribution is the platform's own process; Lemma supplies the material for that decision, no more. The table compares what each control checks; it does not show whether the report's scenario would be stopped. Lemma does not detect or prevent intrusions, and it does not replace legal protection.

### Checklist

Three items to confirm for generating and distributing works that use a person's voice

- Do you record, for each work, which grant it rests on: whose voice, what scope, until when?
- Can you stop a work whose consent check has not cleared before distribution and monetisation?
- Do you keep when, and under whose issuance, consent was checked, in a form the rights holder or platform can confirm separately from your own account?

## 5. Facts and timeline

- **Authority**: Japan's Ministry of Justice. The final report of the Study Group on Civil Liability for the Unauthorized Use of Likeness, Voice and the Like, subtitled "interpretive guidance on infringement of publicity rights by generative AI." The report itself is dated August 2026; a summary document was still marked "in preparation" at the time of writing.
- **Treatment of voice**: The report takes up directly whether voice falls within "likeness and the like" as used in the Supreme Court's Pink Lady judgment. It cites the judicial research official's commentary on that judgment, which treats the phrase as covering information identifying the person — "a signature, an autograph, a voice, a pen name, a stage name, and so on" — and so states plainly that voice is protected by publicity rights. The study group supported that reading, while noting the qualification that what falls within the phrase must be something that can be called a symbol of the individual's personality.
- **Test for infringement**: The same three categories that apply to name and likeness apply to voice: using the voice itself as a product to be appreciated in its own right; attaching the voice to a product in order to differentiate it; and using the voice as advertising for a product. Infringement arises where the use can be said to be solely for the purpose of exploiting the customer-drawing power the voice carries. Where a voice actor's voice itself promotes sales, that power is recognised.
- **Fit for generative AI**: Where a video or audio work is made by using someone's voice without permission through generative AI, the voice becomes embedded in the work, and — in the report's words — whether that amounts to "attaching" under the second category, or falls under the first or under "and so on," is not necessarily clear.
- **Remedies**: The report addresses damages and injunctions for infringement of publicity rights, and holds that for content on the internet a takedown may be demanded "of the platform operator that manages and runs it" as well. An injunction is framed as being "to remove an infringement now being carried out, or to prevent an infringement that would otherwise arise."
- **Background**: A voice actor is reported to have sued the operator of a video platform seeking removal of videos that mimicked their voice with generative AI. This Brief could not confirm that suit from a primary source and so does not go into its particulars.

### Timeline

- **2026-04-24**: First session of the study group.
- **2026-05-28 / 06-25 / 07-13**: Sessions two through four.
- **2026-07-27**: Fifth session. The final report is approved.
- **2026-07-28**: The Japan Actors Union publishes its position on the guidance.
- **August 2026**: The report itself is published, subtitled "interpretive guidance on infringement of publicity rights by generative AI."

> The interpretation, the test, and the account of remedies drawn on here come from the text of the Ministry of Justice's final report, read directly. The interpretation is the study group's; this Brief offers no legal judgment of its own. The individual lawsuit that has been reported could not be confirmed from either a filing or a statement by the parties, so this Brief does not name anyone or go into post counts or revenue figures. The report is interpretive guidance; it is not legislation, and it creates no new cause of action. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Japan Actors Union**: It welcomed the effort to clarify how the existing frameworks — publicity rights, personality rights, and unfair competition law — reach unauthorized use by generative AI, while asking that the final guidance state prior consent before generation, user responsibility, platform obligations, and protection regardless of commercial intent.
- **Unfair competition law**: The report does not treat it as a direct subject, but notes its position, on the ground that recognising the difference in scope matters.

## 6. Sources

- **Ministry of Justice, Japan (primary, study group final report)**: "Study Group on Civil Liability for the Unauthorized Use of Likeness, Voice and the Like — Final Report: Interpretive Guidance on Infringement of Publicity Rights by Generative AI" (August 2026) — <https://www.moj.go.jp/content/001468286.pdf>
- **Ministry of Justice, Japan (primary, study group proceedings)**: sessions one (24 April 2026) through five (27 July 2026) — <https://www.moj.go.jp/MINJI/minji07_00400.html>
- **Japan Actors Union (stakeholder body, official position)**: "The Union's view: on the Ministry of Justice guidance concerning infringement of publicity rights by generative AI" (2026-07-28) — <https://www.nippairen.com/about/post-moj-guideline-2026.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
