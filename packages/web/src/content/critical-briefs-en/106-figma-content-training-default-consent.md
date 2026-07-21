---
brief_no: 106
title: "Figma：AI 学習は個人・小規模チームで既定オン、エンタープライズでは既定オフだった"
title_en: "Figma — AI content training defaulted on for individuals and small teams, and off for enterprise"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-11-21
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "079-common-crawl-training-data-live-secrets", "054-sora2-ip-provenance-consent", "052-discord-age-verification-id-leak"]
status: published
version: "1.0"
og_lead_ja: "Figma — AI 学習は個人・小規模で既定オン、エンタープライズで既定オフ（Khan v. Figma）"
og_lead_en: "Figma — AI training defaulted on for individuals/small teams, off for enterprise (Khan v. Figma)"
gap_detected: "The detection chain worked — Figma's explicit statement of the settings in public documentation, its explanation of de-identification and shielding of sensitive information, the administrator toggle, and the published list of third-party vendors — helping users grasp their situation and respond; visibility through litigation and reporting also prompts a reexamination of practice."
gap_missing: "There is no layer that independently establishes, at the moment content is ingested into training, whether consent was obtained for that use; content entrusted while the default was on is indistinguishable as training data from content entrusted after an admin explicitly switched it on, and turning it off later does not reach earlier ingestions."
gap_fix: "Before content is ingested into training, verify — decoupled from the default value or the administrator's configuration action, and independently through Lemma — that the use is authorized by the rights holder and that each ingested datum carries a proof of consent, and prevent it up front."
---

## TL;DR

The design tool Figma made "content training" (AI training on content) effective on 2024-08-15. According to the company's own public documentation, this setting is **on by default for the Starter and Professional plans** and **off by default for the Organization and Enterprise plans** (the latter cannot currently be switched on at all). In other words, for the same feature of the same product, paying enterprise customers were excluded from training by default, while individual designers and small teams were included by default. Moreover, this setting sits at the team/organization administrator level, so individual users cannot turn it off at their own discretion. On 2025-11-21 a class action, Khan v. Figma (3:25-cv-10054), was filed in the U.S. District Court for the Northern District of California. The complaint alleges that, although Figma had long represented that it would not repurpose users' content for other uses, the default settings and the underlying policy change resulted in customers' design files being used to train generative AI. The plaintiffs' framing sidesteps the copyright fair-use debate, resting instead on breach of contract (the destruction of the original agreement that content would be used only to provide collaboration features) and trade secret misappropriation (the extraction of competitive value from unpublished product plans and workflows contained in design files). Figma denies this, stating that it does not use customer information to train models without permission. This Brief does not adjudicate the merits of either party's claims. What remains as structure is that **the attribute of consent is reduced to "which way the default was tilted" and "whether an administrator opened some settings screen," and is not fixed at the moment of collection as an independently verifiable record.** Detection and pre-action proof are complementary, not substitutes.

---

## 1. Incident Summary

- **Subject**: Figma content such as design files (design files, layer properties, text, images), and the model training of the company's AI features that uses them
- **The actual settings (Figma official documentation)**: content training is on by default on the Starter plan, on by default on the Professional plan, and off by default on the Organization and Enterprise plans. For Organization / Enterprise, the documentation explicitly states it "cannot currently be enabled"
- **Effective date**: content training became effective on 2024-08-15. The company states that if an administrator switched it off on or after this date, subsequent new content and edits are not used for training
- **Location of the setting**: content training is a team/organization administrator setting. On Starter and Professional it is a team-level setting, and individual users cannot make an independent choice about their own content
- **Litigation**: Khan v. Figma, Inc. (U.S. District Court for the Northern District of California, 3:25-cv-10054). A class action filed on 2025-11-21. The complaint alleges that, contrary to the company's long-standing representation that it would not repurpose content for other uses, the default settings and the underlying policy change resulted in customers' design files being used to train generative AI
- **The plaintiffs' legal framing**: four theories that sidestep the fair-use debate. The core claims are (1) breach of contract = users entrusted their proprietary designs on the premise, as represented, that they would be used only to provide collaboration features, and repurposing them for AI training breaks the original agreement (regardless of whether any output reproduces something in recognizable form); (2) trade secret misappropriation = design files contain confidential product plans, workflows, and unreleased features, and using these to improve AI amounts to drawing competitive value from information for which users had taken reasonable measures to maintain secrecy
- **Figma's rebuttal**: the company denies the allegations, stating that it does not use customer information to train models without permission. Its public documentation explains that it de-identifies content and shields sensitive information, and that what the model learns is general design patterns and Figma-specific concepts and formats, not users' content or ideas themselves
- **Root cause**: the attribute of consent is not fixed at the moment of collection as an independently verifiable record. The presence or absence of consent is reduced to operational states such as "which way the default was tilted" and "whether an administrator reached the settings screen," and there is no means for a third party to verify after the fact whether "this content was used for training under consent"

---

## 2. Timeline

- 2024-08-15: content training becomes effective. On by default on the Starter and Professional plans, off by default on the Organization and Enterprise plans
- 2025-11-21: Khan v. Figma, Inc. (3:25-cv-10054) is filed in the U.S. District Court for the Northern District of California. A class action centered on breach of contract, trade secret misappropriation, and related theories
- 2026: In litigation. Figma denies the allegations

> Note: The default values, effective date, and location of the settings are based on Figma's own public documentation (primary). The factual allegations in the litigation are the plaintiffs' claims, not facts found by a court. Figma denies them. This Brief does not adjudicate the merits of either party's claims or legal liability; it addresses the structure of the settings as can be confirmed from public information. Consult the latest status of the litigation before publication.

---

## 3. Chain of Events

1. **Entrustment of content by users**: a user entrusts proprietary design files (including layer properties, text, and images) to Figma on the premise that they are for providing collaboration features. The files may contain confidential product plans, workflows, and unreleased features
2. **Inclusion in training by default**: with content training becoming effective on 2024-08-15, teams on the Starter and Professional plans are included in training by default. The Organization and Enterprise plans are excluded by default
3. **Asymmetry in the location of the setting**: content training is a team/organization administrator setting, and individual users cannot make an independent choice about their own content. Unless an administrator reaches this setting, the default is maintained
4. **Use for model training**: the content that has been included is used to train the models of Figma's AI features. Third-party vendors (such as OpenAI) are involved in the processing
5. **Later dispute**: users come to recognize the repurposing, and a class action is filed on 2025-11-21. The dispute is placed not on whether any output reproduced something, but on the scope of the agreement at the time of entrustment and the extraction of competitive value from confidential information

---

## 4. Structural Analysis

This incident belongs to the `training-data-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that **for the content used in training, the attribute of consent is not fixed at the moment of collection as an independently verifiable record, but is reduced to the operational states of the default value and the administrator's configuration action.** As secondary categories we add `data-provenance`, in that the provenance of the scope of use of the entrusted content cannot be traced, and `attribute-proof-bypass`, in that the rights attribute of consent is not verified before use.

This incident is connected to Brief No.008 ([Discord scraping](/critical/briefs/008-discord-scraping/)), Brief No.036 ([CommonPool training-data PII](/critical/briefs/036-commonpool-training-data-pii/)), and Brief No.079 ([live credentials in Common Crawl](/critical/briefs/079-common-crawl-training-data-live-secrets/)) through the structure in which the provenance and consent of training data are not settled at the moment of collection. There is, however, a decisive difference. What 008, 036, and 079 dealt with was the question "may data that is public be ingested for the reason that it is public?" What this case deals with is **non-public content that a customer in a contractual relationship entrusted for a specific purpose.** The point of dispute is not "public ≠ consent" but "entrustment ≠ consent to repurposing." For this reason the dispute moves from copyright and fair use to contract and trade secrets. It shares a common direction with Brief No.054 ([Sora 2 × Japanese IP](/critical/briefs/054-sora2-ip-provenance-consent/), the reversal from opt-out to opt-in): re-placing the verification layer before use rather than after. It is adjacent to Brief No.052 ([ID leak at Discord's age-verification vendor](/critical/briefs/052-discord-age-verification-id-leak/)) in that the handling of an attribute and its proof are not separated.

What is specific to this incident is that **for the same feature of the same product, the default value was tilted in opposite directions depending on the customer segment.** Organization and Enterprise are off by default (and cannot currently be enabled); Starter and Professional are on by default. This asymmetry is explicitly stated in Figma's own public documentation and is an undisputed fact. The structure that can be read from this is that consent is determined not by "what the user agreed to" but by "which contract segment they belong to and whether an administrator reached the settings screen." Customers with bargaining power are given protection by default; users without it are not. The shared primitive is the same: **the use of data is decoupled from the layer that verifies consent to that use.**

---

## 5. The Detection–Proof Gap

Figma's series of transparency measures — the explicit statement of the settings in public documentation, the explanation of de-identification and the shielding of sensitive information, the provision of an administrator toggle, and the publication of a list of third-party vendors — are indispensable for users to grasp their situation and respond, and this Brief does not deny that role. Visibility through litigation and reporting also functions as an occasion to reexamine industry-wide practice. Detection and disclosure do play their part.

At the same time, these do not provide material to independently establish — **at the moment this content is ingested into training** — whether "this content now being used for training was one for which consent to that use was obtained." Content entrusted while the setting was on by default and content entrusted after an administrator explicitly switched it on are indistinguishable as training data. Even if the setting is turned off later, by the company's own account the effect reaches subsequent new content and edits, and does not retroactively negate an earlier ingestion. As material for an audit to establish "was this training data collected under consent?", the facts "the default was on at the time" and "the administrator did not turn it off" are not an independent record of consent. That the litigation adopts a breach-of-contract and trade-secret framing reflects precisely this point — that even if one detects what an output reproduced, the scope of the agreement at the time of entrustment cannot be settled. This is a gap in a structurally independent layer, outside the reach of the detection and disclosure layer.

Pre-action attestation fills this gap by inserting one step of proof of the consent attribute into the path by which content is ingested into training. Before ingestion, it verifies — decoupled from the default value or the state of the settings screen — "is the use of this content, for this purpose, authorized by the rights holder?", and it blocks ingestion up front when no proof accompanies it. On top of that, if each ingested datum is bound to a proof of consent in a tamper-resistant form, a third party can later verify that "this training data belongs to the authorized scope." This is not a mechanism to prohibit use, but a mechanism to separate authorized use from unauthorized use at the moment of collection rather than in later litigation. Pre-action attestation is a **complement** to detection, not a substitute, and the combination of the two layers establishes the trust boundary of training-data collection.

---

## 6. Response and Industry Context

- **Figma's explanation**: the company's public documentation states the default value of content training per plan and shows the administrator's toggle procedure. For data protection, it cites encryption at rest and in transit, access controls, a prohibition on third-party model providers using data to train their own models, and limits on vendors' data-retention periods. It states that for model training it de-identifies content and shields sensitive information, and that what is learned is general design patterns and Figma-specific concepts and formats, not users' content or ideas themselves. It states that data from Figma for Education and Figma for Government is not used for model training
- **Denial in the litigation**: Figma denies the allegations, stating that it does not use customer information to train models without permission. The plaintiffs seek damages and an order permanently enjoining use of the infringing AI models
- **Shift in legal framing**: in recent training-data litigation, including this case, the dispute is shifting from the copyright and fair-use debate over "what an output reproduced" to **the provenance of the dataset** — where the training corpus came from, how it was constructed, and whether records exist showing the chain of rights and control. The breach-of-contract and trade-secret framing is one form of this shift
- **Cross-industry point**: inclusion in training by default is not a design specific to Figma; a similar structure has been pointed out across multiple platforms. In addition, California's generative-AI training-data transparency law (AB 2013) took effect on 2026-01-01, imposing on developers an obligation to publish the sources and contents of their training data. The broader the transparency obligation grows, the greater the need for a record that can distinguish "was disclosed" from "was collected under consent"

The absence of a layer that verifies, at the moment of collection and independently of default values and configuration actions, the consent status of the content ingested into training is not a problem of a particular product's settings design, but remains a challenge that cuts across any operator that uses customer content to improve its own AI.

---

## 7. Lemma's Analysis

Against the detection–proof gap this event exposed (consent reduced to the operational states of the default value and the administrator's action, and not fixed as a record at the moment of collection), Lemma proposes a design that requires, before content is ingested into training, consent to that use as an independently verifiable cryptographic proof.

- **Consent-attribute proof before ingestion**: before ingesting content into training, verify that "the use of this content, for this purpose, is authorized." Do not make "the default was on" or "the administrator did not turn it off" the condition permitting ingestion
- **Provenance binding to training data**: bind each ingested datum, in a tamper-resistant form, to a proof of the scope of consent and the point in time of acquisition. Put it in a state where a third party can later verify that "this training data belongs to the authorized scope," eliminating the need to reconstruct "the settings state at the time" during a dispute
- **Consistency independent of contract segment**: by tying the proof of consent to the data itself rather than to the contract segment or the administrator's operation history, resolve by design the structure in which the level of protection is split by default value between customers with bargaining power and users without it
- **Selective disclosure**: disclose at minimum only that "this ingestion satisfies the consent schema," without disclosing the content itself, product plans, unreleased features, or other trade secrets. Reconcile compliance with transparency obligations and the maintenance of confidentiality

With this, a proof fixed at the moment of collection makes "was this training data acquired under consent?" function as an independently verifiable trail before ingestion, rather than in later litigation. Detection (after-the-fact disclosure, visibility of settings, dispute through litigation) works on remediation after discovery; pre-action attestation (pre-ingestion consent verification and provenance binding) works on the independent verification of training-data collection — the two work complementarily.

---

## 8. Sources

- **Figma (official documentation, primary)**: "Manage AI settings and content training for your team or organization" — <https://help.figma.com/hc/en-us/articles/17725942479127-Manage-AI-settings-and-content-training-for-your-team-or-organization>
- **Figma (official, primary)**: "Building Figma AI — Our approach" — <https://www.figma.com/ai/our-approach/>
- **Figma (official, primary)**: "AI Terms" — <https://www.figma.com/legal/ai-terms/>
- **Bloomberg Law**: "Figma Trained AI on User Data Without Consent, Class Action Says" — <https://news.bloomberglaw.com/litigation/figma-trained-ai-on-user-data-without-consent-class-action-says>
- **Law360 (case record)**: Khan v. Figma, Inc. (N.D. Cal., 3:25-cv-10054) — <https://www.law360.com/cases/69208e3cd222541266876e83>
- **Davis+Gilbert (AB 2013 takes effect)**: "AI Legal Updates: California's AI Training Data Transparency Law Takes Effect" — <https://www.dglaw.com/ai-legal-updates-californias-ai-training-data-transparency-law-takes-effect/>

---

## 9. About this Brief's distribution

This material is a structured analysis of public information and is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
