---
brief_no: 54
title: "著作権キャラが、権利者が拒否するまで生成され続けた — キャラ生成の時点で、用いる素材の来歴・許諾が固定されない構造（OpenAI Sora 2 / CODA・日本政府）"
title_en: "Generated Until the Rightsholder Said No — The Consent-and-Provenance Gap Behind OpenAI Sora 2"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance", "attribute-proof-bypass"]
incident_date: 2025-10-15
published: 2026-06-13
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-public-training-dataset-pii", "011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance"]
status: published
version: "1.0"
og_lead_ja: "著作権キャラが事後 opt-out まで生成され続けた — Sora 2"
og_lead_en: "Copyrighted characters generated until opt-out — Sora 2"
gap_detected: "Per-output content-violation judgments and rights holders' after-the-fact objections could stop generations resembling protected works."
gap_missing: "There was no layer to confirm before generation whether this generation had the rights, consent, and provenance for the material it used, so permission checking was left to after-the-fact refusal (opt-out)."
gap_fix: "Before a high-risk action, independently verify with Lemma that this material has a licensed provenance for this use, and prevent it up front."
---

## TL;DR

In October 2025, OpenAI released the video generator Sora 2 with a policy under which copyrighted characters could be generated unless the rightsholder opted out. That inversion — use first, object later — spread videos including One Piece, Demon Slayer, and Pokémon; within about three days OpenAI reversed to opt-in, and CODA and the Japanese government requested correction. After-the-fact objection and output filters cannot reach a structure in which the material's rights, consent, and provenance were never fixed before generation. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: OpenAI's video generator "Sora 2" and its rights-management policy (opt-out at launch)
- **Policy at launch**: At the October 2025 release, Sora 2 could **generate videos including copyrighted characters unless the rightsholder explicitly opted out.** Right after launch, well-known works — Pikachu, SpongeBob, full-episode-style South Park, etc. — were easily generated
- **The reversal (about three days)**: As copyrighted-character videos spread right after launch, broad criticism erupted, including from the U.S. Motion Picture Association (MPA) and artists. Within about three days OpenAI announced a move to an **opt-in (prior-permission) model.** Generating copyrighted characters would require permission in advance; Sam Altman also mentioned finer control for rightsholders and revenue sharing with those who opt in. Characters such as Family Guy and South Park became content violations thereafter, and generation of specific individuals — Martin Luther King Jr. and others — was halted following objections from estates
- **Requests from Japanese IP / government**: CODA (the Content Overseas Distribution Association, including Studio Ghibli, Bandai Namco, Toei Animation, and others) then treated reproduction during training as potentially infringing and flagged outputs closely resembling One Piece, Demon Slayer, Pokémon, Mario, and the like. It noted that **opt-out inverts the burden of consent and runs counter to Japan's copyright principle (prior permission).** The Japanese government also formally requested that OpenAI refrain from potentially infringing acts and seek rightsholders' permission in advance
- **The crux**: Before adjudicating infringement output-by-output after the fact, **there was no layer to independently verify, before generation, the rights, consent, and provenance of the material used.** The reversal from opt-out to opt-in is an attempt to place that layer before generation

---

## 2. Timeline

- Late 2025-09 to early 2025-10: OpenAI releases Sora 2 with an opt-out policy. Right after launch, videos including copyrighted characters spread on social media, and criticism erupts from the MPA, artists, and others
- 2025-10 (about three days after launch): OpenAI announces a move to an opt-in (prior-permission) model for copyrighted characters; mentions revenue sharing. Generation of specific individuals (MLK Jr., etc.) is also halted following objections from estates
- Around 2025-10-15: CODA demands a stop to unauthorized use for training (Studio Ghibli, Bandai Namco, and others)
- 2025-10-16 to -23: The Japanese government formally requests that OpenAI seek rightsholders' permission in advance

> Note: The "opt-out to opt-in reversal" and "halting generation of specific individuals" are based on OpenAI's statements and international reporting. The specific composition of the training data and individual permission status are limited in public information, and we do not assert them here. Interpretation of Japanese copyright law and the final judgment of infringement are left to rightsholders, authorities, and the courts.

---

## 3. Chain of events: generating while the premise of consent is inverted

This incident stems from a structure in which the rights, consent, and provenance of material are not independently verified before generation. The path by which the failure propagates into large-scale rights-infringement concern:

1. **Training and generation with unverified provenance**: Copyrighted works may be in the training data, but their provenance and permission are not fixed in verifiable form. The generative AI does not show, from the provenance side, whose copyrighted work the output derives from and how much
2. **Inverting the burden of consent**: Because the default is "generatable unless refused (opt-out)," a rightsholder must preemptively object to keep their work from being used. Confirmation of permission is left not to before generation but to the rightsholder's after-the-fact objection
3. **Generation and spread**: Videos including copyrighted characters are easily generated and spread at scale on social media. The judgment of infringement is made after generation and spread
4. **After-the-fact objection and correction**: Rightsholders, governments, and industry object, the platform reverses the policy (to opt-in), and specific generation is halted. But this is an after-the-fact sequence operating only after mass generation and spread, and the output already spread cannot be fully recovered

---

## 4. Structural analysis

This incident belongs to the `data-provenance` category under Pillar 01 (Verifiable Origin). The central failure primitive is that **in the training and generation of generative AI, the rights, consent, and provenance of the material used are not fixed in independently verifiable form before generation, and confirmation of permission is left to after-the-fact opt-out (objection).** As secondary we note `training-data-provenance` (the provenance/consent of training data) and `attribute-proof-bypass` (rights/permission as an attribute presumed without provenance).

The crux is the order of "who bears the burden of consent." Opt-out says "you may use it unless refused," shifting confirmation of permission onto the rightsholder's after-the-fact action. By contrast, Japan's copyright principle requires prior permission (opt-in) and has no mechanism by which after-the-fact objection averts infringement. What CODA pointed out is exactly this inversion of order. Without a layer that confirms rights and provenance before generation, infringement can only be asked after generation and spread, and the response trails. OpenAI's reversal from opt-out to opt-in is nothing other than a move to place the confirmation layer before generation.

It shares a root with Brief 008 (data from public channels redistributed as AI training data while public ≠ consent): "being public/obtainable" is not proof of "being usable for training/generation." It is the generation-and-output-side cross-section of Brief 036 (personal data mixed into a top-tier public training dataset, with provenance/consent unverified at collection), and it connects to Brief 011 (the provenance marker on AI output can be stripped) and 053 (likeness provenance not fixed before generation), in that the output's provenance is not fixed in verifiable form. What this case shows is the consequence of generative AI producing copyrighted works while lacking up-front verification of rights, consent, and provenance — and its reach is especially large for Japanese IP, where prior permission is the principle.

---

## 5. The gap between detection and proof

Output-by-output content-violation adjudication, rightsholder objections, the platform's policy reversal (opt-out to opt-in), halting specific generation, and industry/government pressure are all indispensable for grasping, deterring, and correcting harm; this Brief does not deny that role. A flagging channel for rightsholders and stopping violating output are important operational responses.

At the same time, after-the-fact adjudication of output does not, **at the moment of generation**, independently establish "does this generation carry the rights, consent, and provenance of the material used." The opt-out model permits generation unless the rightsholder preemptively refuses, pushing the judgment to after the fact. A content-violation filter scans for "does this output resemble a known protected work," but that works after generation and spread. What was missing is the at-generation independent verification of "does this generation carry the rights, consent, and provenance of the material it uses," which is a separate track from after-the-fact adjudication and objection. As long as confirmation of permission is placed after generation, the response can only trail the spread. Japan's prior-permission principle can be seen as an institutional expression of this "confirm before generation" requirement.

Pre-execution attestation and provenance binding close this gap by inserting one step — verification of the material's rights, consent, and provenance — into the output path of the generative AI. By fixing the provenance of training data and outputs via docHash, bound to their rightsholders and permissions, and making it possible to ask before generation "does this material carry permitted provenance for this use," generation lacking permission can be distinguished before spread. Detecting the output (the detection-style "does this output resemble a protected work") and the pre-execution attestation of the material's rights and provenance ("does this generation carry permitted provenance") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **OpenAI**: Reversed its launch opt-out policy to opt-in (prior permission) for copyrighted characters within about three days. Mentioned finer control for rightsholders and revenue sharing with those who opt in. Also halted generation of specific individuals
- **Japanese IP / government**: CODA demanded a stop to unauthorized use for training and noted that opt-out runs counter to the prior-permission principle. The Japanese government formally requested correction from OpenAI. The U.S. MPA also criticized the opt-out policy
- **The provenance-and-permission question**: A mechanism to fix, in verifiable form before generation and publication, the provenance/permission of training data and the rights attributes of outputs has surfaced as a complement to the limits of after-the-fact adjudication. Especially in jurisdictions where prior permission is the principle, the design question of "is opt-out enough" has come to the fore
- **Cross-industry point**: There is growing discussion of shifting the center of gravity of generative-AI trust design away from depending on post-output filters and rightsholders' after-the-fact objections, toward fixing the confirmation of rights, consent, and provenance in an independently verifiable form before generation (provenance / pre-execution attestation)

---

## 7. Lemma's analysis

Against the gap this incident exposed (the rights, consent, and provenance in the training and generation of generative AI are left not to before generation but to after-the-fact objection), Lemma proposes a design that, before the act of generation, fixes the rights, consent, and provenance of the material as independently verifiable cryptographic proof.

- **Provenance binding**: Bind training data and outputs to their rightsholders, permissions, and origins, and fix provenance via docHash. Make which material an output derives from, and under what permission, verifiable against after-the-fact stripping and forgery
- **Pre-execution attestation of permission (implementing opt-in)**: Before generation using a copyrighted work, require the rightsholder's permission as verifiable proof. Make "it is permitted," not "it has not been refused," the condition for generation
- **Selective disclosure of rights attributes**: Prove only the rights attribute "this material is permitted for this use" with minimal disclosure, without sending the rightsholder's sensitive contract information outside the environment. Mechanisms like revenue sharing with opt-in rightsholders can also be made verifiable, bound to the permission evidence
- **Scoped generation**: Bind the generative AI's output to the scope of permission, so generation from material lacking permission cannot succeed without proof

Through this, proof of provenance and permission fixed at the moment of generation functions as an independently verifiable trail for "does this generation carry permitted provenance," before spread. Detection and after-the-fact response (output filters, policy reversal, halting generation) serve to deter and correct harm, while pre-execution attestation of provenance and permission (fixing before generation) serves to distinguish generation lacking permission before the fact — each working complementarily.

---

## 8. Sources

- **The Register**: "Japan asks OpenAI to keep Sora 2's hands off anime IP" (2025-10-15; the CODA / Japanese-government requests, spread of copyrighted characters) — <https://www.theregister.com/2025/10/15/japan_openai_copyrighted_anime/>
- **Copyright Lately**: "Sora, Not Sorry: OpenAI Backtracks on Opt-Out Copyright Policy" (the opt-out-to-opt-in reversal, halting specific generation, the revenue-sharing mention) — <https://copyrightlately.com/openai-backtracks-sora-opt-out-copyright-policy/>
- **EU IP Helpdesk (European Commission)**: "Japanese government requests OpenAI avoid copyright infringement (Sora 2)" (2025-10-23; the Japanese government's formal request) — <https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/japanese-government-requests-openai-avoid-copyright-infringement-sora-2-us-federal-judge-dismisses-2025-10-23_en>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
