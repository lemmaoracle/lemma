---
brief_no: 105
title: "芸能人・声優の肖像と声の無断利用が主要 SNS で 4 万件超、削除率 100% を達成したモデルも同じ人物で再投稿された（JAPRO 2025年度調査）"
title_en: "Over 40,000 unauthorized likeness and voice posts across major platforms — and a 100% takedown rate did not stop the same person's models from reappearing (JAPRO FY2025 survey)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance", "attribute-proof-bypass"]
incident_date: 2026-06-25
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["053-youtube-deepfake-likeness-provenance", "054-sora2-ip-provenance-consent", "050-grok-deepfake-consent-provenance", "011-synthid-watermark-reverse-engineering", "036-commonpool-training-data-pii"]
status: published
version: "1.0"
og_lead_ja: "JAPRO 2025年度調査 — 肖像・声の無断利用が4万件超、削除率100%でも同一人物のモデルが再投稿"
og_lead_en: "JAPRO FY2025 — 40,000+ unauthorized likeness/voice posts, and a 100% takedown rate did not stop reappearance"
gap_detected: "JAPRO による継続的な実態調査、主要 SNS と画像生成 AI プラットフォームの横断監視、削除対応の実証（対象20件の削除率100%）、業界174社への調査という検出の系列が機能し、被害が可視化された。削除申請の運用も個々の権利者にとって有効な救済である。"
gap_missing: "「この人物の肖像・声を使ってよいか」という許諾の問いを、生成物が作られる時点でその生成物に結び付け、受け手が独立に検証する層がない。削除は事後の個別操作であり、次の生成を成立させない構造にはならない（削除率100%の後も同一人物のモデルが再投稿された）。"
gap_fix: "肖像・声を素材とする生成の前に、その利用が権利者に認可された範囲に属すること、そして生成物に許諾の証明が改ざん耐性のある形で結び付いていることを、既定の許諾状態とは切り離して Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

On 2026-06-25 the Japan Publicity Right Protection Organization (JAPRO) published its FY2025 field survey: posts suspected of infringing likeness and publicity rights across major platforms exceeded 40,000, reaching roughly 335 million views. The heaviest finding is the takedown experiment — against 20 models using a certain actor's likeness, JAPRO **achieved a 100% takedown rate, and yet models of the same person were posted anew after the takedowns completed**. Detection and takedown both worked completely. What didn't exist was a layer that binds the consent status of a likeness or voice to a generated work at the moment it is created, so that a recipient can verify it independently. About 51% of agencies say they would allow use with prior review and consent — the willingness to grant permission exists, but there is no means to show it at generation time.

---

## 2. What happened

- **Subject**: the likenesses and voices of Japanese entertainers, voice actors, and others. The venues where suspected infringement was confirmed were major platforms (TikTok, X, YouTube) and image-generation AI platforms (sea art AI, PixAI).
- **Reporter**: the Japan Publicity Right Protection Organization (JAPRO; 特定非営利活動法人 肖像パブリシティ権擁護監視機構). Its "FY2025 survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI," published 2026-06-25. The survey was commissioned to and carried out by IPconnect, Inc. of the IPFORWARD group.
- **Survey period**: April 2025 to March 2026.
- **Survey methods**: internet survey, questionnaire and interview survey, and empirical testing of takedown responses.
- **Scale of posts**: suspected infringing posts on major platforms exceeded 40,000 in total, reaching roughly 335 million views.
- **Unauthorized use of voices**: numerous impersonation cases in multiple languages by overseas local accounts were confirmed.
- **Unauthorized creation of trained models**: on image-generation AI platforms, the unauthorized creation and publication of models (such as LoRA) trained on the likenesses of entertainers and others continued to be observed.
- **Takedown testing and reposting**: against 20 models (such as LoRA) using a certain actor's likeness, with the cooperation of a talent agency, takedown requests were filed from January to February 2026, achieving a 100% takedown rate (all 20 models taken down). **However, even after the takedowns were completed, a case was confirmed in which models of the same person were posted anew.** JAPRO concludes that a single round of takedowns is not the end, and that building a regular monitoring regime — including rapid response to reposting — is essential.
- **State of industry response (174 valid responses)**: agencies that "fully grasp" or "roughly grasp" suspected infringement cases = about 28%. Response guidelines: 1.1% already drawn up, about 52% considering, 46.6% none planned. On the other hand, regarding policy on the use of likeness and publicity rights, about 51% answered that they "would allow use with prior review and consent." The challenges to leveraging these assets were the development of contractual rules and ethical guidelines (over 90%), the difficulty of setting compensation (about 76%), and the risk of alteration (about 74%).

The cycle of infringement runs as follows.

1. **Collection of likenesses and voices**: publicly available images, video, and audio of entertainers and voice actors are collected without any check on permission.
2. **Creation and publication of trained models**: on image-generation AI platforms, models (such as LoRA) trained on a specific person's likeness are created and published without authorization. The model itself becomes an asset that can repeat generation without limit thereafter.
3. **Generation and posting**: images and video generated from the model are posted to platforms. As for voices, they spread in forms that include multilingual impersonation by overseas local accounts.
4. **Diffusion**: on major platforms, suspected infringing posts exceed 40,000 in total, reaching roughly 335 million views.
5. **Detection and takedown**: the rights-holder side detects the posts and models and files takedown requests. In JAPRO's testing, all 20 target models were successfully taken down (100% takedown rate).
6. **Reposting**: after the takedowns are completed, models of the same person are posted anew. The cycle returns to step 1 and continues.

---

## 3. Timeline — disclosure and response

- 2025-06-24: JAPRO publishes the industry's first large-scale field survey (the prior-year survey).
- 2025-04 to 2026-03: the FY2025 survey period. Suspected infringement cases on major platforms and image-generation AI platforms are continuously surveyed.
- 2026-01 to 2026-02: empirical testing of takedown responses. Takedown requests are filed against 20 models (such as LoRA) using a certain actor's likeness, achieving a 100% takedown rate. Afterward, new postings of models of the same person are confirmed.
- 2026-04: the Ministry of Justice establishes a "study group on the state of civil liability for the unauthorized use of likeness, voice, and the like."
- 2026-06-25: JAPRO publishes the FY2025 survey results. It also signals a policy of working in earnest on the protection of voice actors' rights through a newly established voice-actor division for this fiscal year.

> Note: the facts are based on JAPRO's publication (primary). JAPRO is an organization on the rights-holder side and is a survey body with a stake in the matter. As for the estimate of economic loss, JAPRO itself makes clear that it is a "conservative reference estimate" and "does not indicate the overall scale of likeness and publicity right infringement, nor the amount of damages in litigation," and lists what the calculation does not include: unconfirmed posts, already-deleted posts, reposts, services outside the survey's scope, unauthorized goods in physical space or on e-commerce, the whole of voice-actor and audio-AI-related harm, brand damage, survey-response costs, and so on. This Brief follows the same limitation. Some outlets have reported the survey period as "about two months from June," but the primary publication states April 2025 to March 2026. Consult the latest primary sources.

The response and industry movement after disclosure:

- **JAPRO's response**: it conducted the industry's first large-scale field survey in FY2024 and continued it in FY2025. This fiscal year it newly conducted empirical testing that makes the models at the root of infringement themselves the target of takedown. The survey is planned to continue annually. Through a newly established voice-actor division this fiscal year, it says it will work in earnest on the protection of voice actors' rights and, in cooperation with other related organizations, advance the shaping of the environment across the industry.
- **Positioning of the takedown testing**: the 100% takedown rate against 20 targets showed that the operation of takedowns itself works. At the same time, the confirmation of reposting after takedown showed that takedown is not a mechanism that stops generation. JAPRO points to the necessity of a regular monitoring regime that includes rapid response to reposting.
- **Industry response challenges**: in the responses of 174 companies, grasp of suspected infringement cases stood at about 28%, with many voices saying that full grasp is difficult in terms of resources. Response guidelines were 1.1% already drawn up, about 52% considering, 46.6% none planned, and, finding it hard to draw them up company by company, calls for an industry-wide set of guidelines are rising.
- **A positive stance toward leveraging these assets**: about 51% of agencies answered that they "would allow use with prior review and consent." The challenges are the development of contractual rules and ethical guidelines (over 90%), the difficulty of setting compensation (about 76%), and the risk of alteration (about 74%). There is demand not for prohibition but for managed use.
- **Institutional side**: in April 2026, the Ministry of Justice established a "study group on the state of civil liability for the unauthorized use of likeness, voice, and the like." On the voice-actor side there are also grassroots movements such as "NOMORE Unauthorized Generative AI," and the shape of voice rights is emerging as a point of contention.

The absence of a layer that fixes the consent status of a likeness or voice, at the moment of generation, in an independently verifiable form is not an operational problem of a specific platform, but remains a challenge that spans the businesses, rights holders, and distributors that use generative AI.

---

## 4. Why it wasn't stopped

The failure here is neither the volume of monitoring nor the operation of takedowns. **The consent status of an attribute — a likeness or a voice — is not bound to a generated work at the moment it is created, and whether permission exists can only be checked by hand after generation.** Even when that checking and takedown succeed, they merely remove individual posts and models; they do not form a structure that keeps the next generation from succeeding.

Detection worked. JAPRO's continuous field surveys, cross-cutting monitoring of major platforms and image-generation AI platforms, empirical takedown testing, and its survey of 174 companies are indispensable foundational data, and filing takedowns is a realistic remedy for individual rights holders. In this case, within its scope, it worked completely — **a 100% takedown rate was achieved. And still, models of the same person were posted anew.** Takedown is an after-the-fact operation acting on "generated works and models that already exist"; it is not a mechanism that resolves, before the next generation, the question "may this person's likeness and voice be used?" That JAPRO itself concludes a regular monitoring regime is essential is the operational expression of this asymmetry: monitoring keeps imposing costs on the rights-holder side, and none on the generation side.

The other point specific to this case is that the market's intent is visible. About 51% of agencies answered they "would allow use with prior review and consent." They do not want to prohibit; they want to grant permission. Yet guidelines already drawn up stood at 1.1%, and the leading challenges were contractual rules and ethical guidelines (over 90%) and the difficulty of setting compensation (about 76%). The shared primitive: **the creation of a generated work is decoupled from the layer that verifies the consent status of its source material.**

This incident is a repetition — on the Japanese, TikTok side — of Brief No.053 ([YouTube deepfake likeness provenance](/critical/briefs/053-youtube-deepfake-likeness-provenance/)); with Brief No.054 ([Sora 2 × Japanese IP](/critical/briefs/054-sora2-ip-provenance-consent/), the opt-out-to-opt-in flip) it shows the same direction — moving the verification layer before generation — from a different angle. It also connects to Brief No.050 ([Grok deepfake consent and age attributes](/critical/briefs/050-grok-deepfake-consent-provenance/)), Brief No.011 ([reverse-engineering the SynthID watermark](/critical/briefs/011-synthid-watermark-reverse-engineering/)), and Brief No.036 ([CommonPool training-data PII](/critical/briefs/036-commonpool-training-data-pii/)) in that provenance and consent cannot be fully guaranteed by after-the-fact detection.

---

## 5. What proof would have changed

Pre-action attestation fills this gap by inserting a proof of the consent attribute one step into the path by which a generated work is created. At the moment of generation, it verifies whether "the use of this likeness, this voice belongs to the range authorized by the rights holder," and blocks generation up front when no proof accompanies it. Alternatively, it binds the proof of permission to the generated work in a tamper-resistant form, so that recipients (platforms, advertisers, viewers) can verify it independently. The former acts on the generation side, the latter on the distribution side. Given that about 51% of agencies answered they "would allow use with prior review and consent," what is needed is not a prohibition of use but a form that can mechanically show that permission was granted. Pre-action attestation is a **complement** to detection, not a substitute, and the combination of the two layers establishes the trust boundary of likeness and voice use.

Lemma proposes a design that requires, at the moment a generated work is created, the consent attribute of the source material as an independently verifiable cryptographic proof, and binds that proof to the generated work.

- **Pre-generation consent-attribute proof**: before generation that uses a likeness or voice as source material, verify that "the use of this person's likeness and voice belongs to the range authorized by the rights holder." Do not make "it has not yet been taken down" or "it has not yet been detected" the condition for permitting generation.
- **Binding provenance to the generated work**: bind the provenance and consent proof of the source material to the generated work in a tamper-resistant form, so that each stage of distribution (platforms, advertisers, viewers) can verify it independently. Judge by the presence of a consent proof, not by whether a watermark can be detected.
- **Provenance of trained models**: for models (such as LoRA) trained on a specific person's likeness as well, verify the consent status of the training material at the moment of creation, so that an unauthorized model does not become an asset that can repeat generation without limit thereafter.
- **Selective disclosure**: disclose at minimum only that "this use satisfies the range of permission," without disclosing contract terms, compensation, or the rights holder's internal information. This reconciles the non-disclosure of compensation setting — which about 76% of agencies raised as a challenge — with the provability of permission.

With this, a proof fixed at the moment of generation makes "was this generated work made from permitted source material?" function as a trail that is independently verifiable at each stage of distribution. It also shifts the locus of the burden from a structure in which the rights-holder side keeps bearing monitoring costs to one in which the generation side and distribution side present proof. Detection (after-the-fact monitoring, takedown requests, field surveys) works on remediation after the fact, while pre-action proof (pre-generation consent verification and binding provenance to the generated work) works on the independent verification of use — the two work complementarily.

---

## 6. Sources

- **JAPRO (primary)**: Japan Publicity Right Protection Organization (特定非営利活動法人 肖像パブリシティ権擁護監視機構), "FY2025 survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI" (2026-06-25) — <https://prtimes.jp/main/html/rd/p/000000024.000164682.html>
- **JAPRO (organization, primary)**: Japan Publicity Right Protection Organization (特定非営利活動法人 肖像パブリシティ権擁護監視機構) — <https://www.japrpo.or.jp/>
- **JAPRO (prior-year survey, primary)**: "First survey of the actual state of cases suspected of infringing likeness and publicity rights in the age of generative AI" (2025-06-24, PDF) — <https://www.japrpo.or.jp/img/pressrelease20250624.pdf>
- **IPconnect (survey contractor)**: IPconnect, Inc. — <https://ipconnect.co.jp/>
- **Siliconera (developments over voice rights)**: "Japan May Introduce 'Voice Rights' to Protect Against Unauthorized AI Usage" — <https://www.siliconera.com/japan-may-introduce-voice-rights-to-protect-against-unauthorized-ai-usage/>

References: for the detection-vs-attestation thesis, ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05). For the design and its scope, [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).
