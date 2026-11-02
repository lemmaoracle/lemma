---
brief_no: 105
title: "JAPRO：芸能人・声優の肖像と声の無断利用で、削除の後も同じ人物のモデルが新たに投稿されたと報告(2025 年度調査)"
title_en: "JAPRO: After takedowns, new models of the same actor's likeness were posted again (FY2025 survey on likeness and voice)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance", "attribute-proof-bypass"]
incident_date: 2026-06-25
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["053-youtube-deepfake-likeness-provenance", "054-sora2-ip-provenance-consent", "127-moj-voice-publicity-rights-guideline", "050-grok-deepfake-consent-provenance", "011-synthid-watermark-reverse-engineering", "036-commonpool-training-data-pii"]
status: published
gate: "none"
version: "1.0"
og_lead_ja: "JAPRO が 2025 年度の調査を公表。主要 SNS の肖像・声の侵害疑義投稿は延べ 4 万件超で、削除の後も同じ人物のモデルが新たに投稿された"
og_lead_en: "JAPRO's FY2025 survey: over 40,000 suspected infringing likeness and voice posts on major platforms, and new models of the same person posted after takedowns"
layout: "report"
sections: "proof"
og_kicker_ja: "実態調査 · 肖像と声の無断利用"
og_kicker_en: "SURVEY · UNAUTHORIZED LIKENESS & VOICE"
og_headline_ja: "削除の後も、同じ人物の\nモデルが再投稿と報告。\n<accent>疑義の投稿 延べ 4 万件超</accent>"
og_headline_en: "Same actor, new models\nafter takedowns: JAPRO\n<accent>40,000+ suspect posts</accent>"
key_figures:
  - value: "40,000"
    unit: "+"
    label: "Suspected infringing likeness and publicity-rights posts on major platforms (cumulative), with about 335 million views (JAPRO)"
    tone: "alert"
  - value: "100"
    unit: "%"
    label: "Takedown rate for requests against 20 models using a certain actor's likeness. After the takedowns, new models of the same person were posted"
  - value: "~51"
    unit: "%"
    label: "Share of agencies that \"would allow use with prior review and consent\" (174 valid responses)"
glossary:
  - term: "JAPRO"
    desc: "The Japan Publicity Right Protection Organization, a nonprofit on the rights-holder side that surveys suspected infringement of likeness and publicity rights in the age of generative AI each year."
  - term: "Publicity rights"
    desc: "Rights concerning use of the drawing power of a person's name, likeness and the like. The survey counts suspected infringement of these together with likeness rights."
  - term: "LoRA"
    desc: "An add-on model that teaches an image-generation AI a specific person's likeness or similar. The survey found such models of entertainers being created and published without permission."
insight:
  slug: "takedown-before-next-generation"
  label: "Takedown does not ask about the next generation's consent"
  quote: "Unless a use of someone's likeness or voice is checked against that person's consent before generation, the next model and the next post get through just the same after a takedown."
industries: ["media", "ai"]
operations: ["delivery"]
attack_method: "ai-misuse"
controls:
  - slug: "check-origin"
    item: "Before generating from a person's likeness or voice, check the material's provenance and the scope of permission"
  - slug: "hold-unverified"
    item: "Stop generation whose permission cannot be confirmed before it runs"
impact: "Over 40,000 suspected infringing likeness and publicity-rights posts (JAPRO)"
takeaway: "In JAPRO's survey, new models of the same person were posted even after a 100% takedown rate. Takedowns act on what already exists. Check the person's consent before a likeness or voice is used in generation."
self_check: "Before generating from a likeness or voice, or publishing a trained model, do you check that the use falls within what the person consented to?"
countries: ["jp"]
---

## 1. Summary

JAPRO's survey is not one incident but a count of a full year. It reports that models trained on entertainers' likenesses kept being created and published without permission on image-generation AI platforms, and that overseas accounts impersonated voices in many languages. In its takedown testing, every target model was removed, yet new models of the same person were posted afterwards. Meanwhile, about half of the agencies surveyed said they would allow use with prior review and consent. <strong>Unless a use of someone's likeness or voice is checked against that person's consent before generation, the next model and the next post get through just the same after a takedown.</strong>

## 2. What got through

- **What got through**: The scenarios the survey describes are the unauthorized creation and publication of models (such as LoRA) trained on entertainers' likenesses, posting images and video generated from those models to social platforms, multilingual impersonation of voices by overseas local accounts, and, after takedowns, new models of the same person being posted (JAPRO's survey).
- **What the receiving side gets**: In general, a platform accepting a post or a model upload receives the images, video, audio or model itself. Whose consent, and which grant, the use of that likeness or voice rests on cannot be read from what arrives.
- **Where takedown worked**: With a talent agency's cooperation, takedown requests were filed against 20 models using a certain actor's likeness, and all 20 were removed. Takedown acts on a model already published; it does not act before the next model is created and published. JAPRO concludes that a single round of takedowns is not the end, and that a regular monitoring regime, including rapid response to reposting, is essential.
- **Not disclosed**: The actor's name, how many new models were posted after the takedowns, and whether they came from the same creator as the removed ones. What checks platforms run when they accept posts or model uploads.

## 3. What to check

The condition that holds whatever the scenario is this: before a model using someone's likeness or voice is created and published, and before generated works are posted, check that the use falls within that person's consent — whose likeness or voice, what scope, until when.

- **Who approves**: The person whose likeness and voice it is, and the agency that holds those rights. Images or audio being public does not stand in for permission to use them for training or generation.
- **Where the check happens**: Just before a model trained on a likeness or voice is created and published, and just before a generated work is posted or distributed. What cannot be matched to a grant does not go on to publication or posting.
- **What remains**: A record of which model or work rested on whose grant, in a form that shows only "this use falls within the grant" without disclosing contract terms or compensation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a model using a likeness or voice is published and before a generated work is posted, that the use falls within the person's consent, and keeping a record. Detection means the rights-holder side finding what has been published or posted and requesting takedown; here, JAPRO's survey and takedown testing did that.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check against the person's consent before publication and posting</div>
<div class="rx-zone gapz"><b>What JAPRO reported</b><span>After all 20 were taken down,<br>new models of the same person were posted</span></div>
<div class="rx-zone det"><b>Detection · monitoring and takedowns worked</b>The rights-holder side finds posts and models and requests takedown</div>
<div class="rx-g g1"><div class="t">CREATE</div><b>Models trained on entertainers' likenesses are made and published without permission</b></div>
<div class="rx-g g2"><div class="t">POST</div><b>Generated images and video are posted, passing 40,000 in total</b></div>
<div class="rx-g g3"><div class="t">TAKEDOWN</div><b>2026-01 to 02: requests against 20 models; all removed</b></div>
<div class="rx-g g4"><div class="t">REPOST</div><b>After the takedowns, new models of the same person are posted</b></div>
</div>
</figure>

The takedown testing showed that takedown operations work, but only after the models had been published. JAPRO calls for regular monitoring because takedown does not reach the point before the next model is created and published. Checking consent before generation and publication runs in the same direction as [the YouTube fake-celebrity videos](https://lemma.frame00.com/critical/briefs/053-youtube-deepfake-likeness-provenance/), [Sora 2](https://lemma.frame00.com/critical/briefs/054-sora2-ip-provenance-consent/), on moving permission ahead of generation, and [the Ministry of Justice guidance](https://lemma.frame00.com/critical/briefs/127-moj-voice-publicity-rights-guideline/) that places voice within publicity rights.

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before a model using a likeness or voice is published and a generated work is posted.** It does not find and remove similar faces or voices; it makes which of the person's grants a use rests on checkable by the receiving side, before publication and posting.

### Industries and operations to watch

- **Industry · Media & content**: Agencies that hold the likeness and voice rights of entertainers and voice actors, and social platforms that accept image, video and audio posts.
- **Industry · AI**: Services that generate images or audio, and image-generation AI platforms that accept uploads of trained models (such as LoRA).
- **Operation · Sending & delivery**: Posting and distributing generated works, and publishing trained models.

### Current controls vs Lemma

In the scenarios the survey describes, what got through was in columns 1 and 2; takedown requests worked in column 3.

| Control | Creating and publishing a trained model | Posting a generated work | Removing what has been published or posted |
| --- | --- | --- | --- |
| Rights-holder monitoring (finding posts and models) | Not relevant | Not relevant | Partial |
| Takedown requests | Not relevant | Not relevant | Effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not relevant |

Monitoring finds what has been published or posted and points to what to take down; in the survey, only about 28% of agencies said they grasped the cases. Takedown requests worked on all 20 targets in the testing, but they remove models that already exist; they do not stop the next model from being created and published. Lemma checks the person's consent before publication and posting, but it does not find published material or delete data, so it plays no part in takedowns. Monitoring and takedowns and Lemma complement each other; neither replaces the other.

Note: Lemma's check works only when it is built in just before a model is published and a generated work is posted, and the person's consent is issued and managed separately from whoever generates the work. Use within the scope of a grant passes this check. Works made on services that have not built in the check can still circulate without it. The table compares what each control checks; it does not show whether the scenarios in the survey would have been stopped. Lemma does not detect or prevent intrusions, and it does not replace legal protection.

### Checklist

Three items to confirm for the use of your talent's likenesses and voices

- Do you record, for each likeness and voice, to whom you granted use, in what scope, and until when?
- Can you show the scope of a grant to users and platforms without disclosing contract terms or compensation?
- As a service accepting trained models or generated works, can you stop items whose consent cannot be matched before they are published?

## 5. Facts and timeline

- **Subject**: The likenesses and voices of Japanese entertainers, voice actors and others. Suspected infringement was confirmed on major platforms (TikTok, X, YouTube) and image-generation AI platforms (sea art AI, PixAI).
- **Reporter**: The Japan Publicity Right Protection Organization (JAPRO; 特定非営利活動法人 肖像パブリシティ権擁護監視機構). Its "FY2025 survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI," published 2026-06-25. The survey was commissioned to and carried out by IPconnect, Inc. of the IPFORWARD group.
- **Survey period and methods**: April 2025 to March 2026. Internet survey, questionnaire and interview survey, and empirical testing of takedown responses.
- **Scale of posts**: Suspected infringing posts on major platforms exceeded 40,000 in total, with about 335 million views.
- **Unauthorized use of voices**: Numerous multilingual impersonation cases by overseas local accounts were confirmed.
- **Unauthorized trained models**: On image-generation AI platforms, the unauthorized creation and publication of models (such as LoRA) trained on the likenesses of entertainers and others continued to be observed.
- **Takedown testing and reposting**: With a talent agency's cooperation, takedown requests were filed from January to February 2026 against 20 models (such as LoRA) using a certain actor's likeness, and all 20 were removed (100% takedown rate). Even after the takedowns were completed, a case was confirmed in which new models of the same person were posted.
- **State of industry response (174 valid responses)**: About 28% of agencies "fully grasp" or "roughly grasp" suspected infringement cases. Response guidelines: 1.1% drawn up, about 52% considering, 46.6% none planned. On the use of likeness and publicity rights, about 51% answered that they "would allow use with prior review and consent." The challenges to such use were developing contractual rules and ethical guidelines (over 90%), the difficulty of setting compensation (about 76%), and the risk of alteration (about 74%).

### Timeline

- **2025-06-24**: JAPRO publishes its prior-year large-scale field survey.
- **2025-04 to 2026-03**: The FY2025 survey period, covering suspected infringement on major platforms and image-generation AI platforms.
- **2026-01 to 2026-02**: Empirical takedown testing. Requests against 20 models; all removed. New postings of models of the same person are then confirmed.
- **2026-04**: The Ministry of Justice establishes a "study group on the state of civil liability for the unauthorized use of likeness, voice, and the like."
- **2026-06-25**: JAPRO publishes the FY2025 results and signals a policy of working on voice actors' rights through a newly established voice-actor division.

> The facts are based on JAPRO's publication (primary). Counts and percentages are JAPRO's; JAPRO is an organization on the rights-holder side and a survey body with a stake in the matter. On its estimate of economic loss, JAPRO itself states that it is a "conservative reference estimate" that "does not indicate the overall scale of likeness and publicity right infringement, nor the amount of damages in litigation," and lists what it excludes: unconfirmed posts, already-deleted posts, reposts, services outside the survey's scope, unauthorized goods in physical space or on e-commerce, the whole of voice-actor and audio-AI-related harm, brand damage, survey-response costs, and so on. This Brief follows the same limitation. Some outlets reported the survey period as "about two months from June," but the primary publication states April 2025 to March 2026. This Brief does not blame any particular platform or organization. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **JAPRO**: It conducted a large-scale field survey in FY2024 and continued in FY2025. This year it newly tested takedowns that target the models at the root of infringement. The survey is planned to continue annually; through its new voice-actor division it says it will work on voice actors' rights and, with related organizations, on the environment across the industry.
- **Industry challenges**: Among the 174 respondents, grasp of suspected infringement stood at about 28%, with many saying full grasp is hard in terms of resources. Finding guidelines hard to draw up company by company, calls for industry-wide guidelines are rising, JAPRO reports.
- **Stance toward use**: About 51% of agencies said they "would allow use with prior review and consent," pointing to demand for managed use rather than prohibition.
- **Institutional side**: In April 2026 the Ministry of Justice set up its study group. On the voice-actor side there are grassroots movements such as "NOMORE Unauthorized Generative AI," and the shape of voice rights has become a point of discussion.

## 6. Sources

- **JAPRO (primary)**: Japan Publicity Right Protection Organization (特定非営利活動法人 肖像パブリシティ権擁護監視機構), "FY2025 survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI" (2026-06-25) — <https://prtimes.jp/main/html/rd/p/000000024.000164682.html>
- **JAPRO (organization, primary)**: Japan Publicity Right Protection Organization (特定非営利活動法人 肖像パブリシティ権擁護監視機構) — <https://www.japrpo.or.jp/>
- **JAPRO (prior-year survey, primary)**: "First survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI" (2025-06-24, PDF) — <https://www.japrpo.or.jp/img/pressrelease20250624.pdf>
- **IPconnect (survey contractor)**: IPconnect, Inc. — <https://ipconnect.co.jp/>
- **Siliconera (developments over voice rights)**: "Japan May Introduce 'Voice Rights' to Protect Against Unauthorized AI Usage" — <https://www.siliconera.com/japan-may-introduce-voice-rights-to-protect-against-unauthorized-ai-usage/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
