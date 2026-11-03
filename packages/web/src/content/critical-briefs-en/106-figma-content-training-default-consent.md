---
brief_no: 106
title: "Figma：AI の学習への利用が、個人・小規模チームでは既定でオン、エンタープライズでは既定でオフだった(同社の公開ドキュメント)"
title_en: "Figma: AI content training was on by default for individuals and small teams, and off for enterprise (Figma's documentation)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-11-21
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "079-common-crawl-training-data-live-secrets", "054-sora2-ip-provenance-consent", "052-discord-age-verification-id-leak"]
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
version: "1.0"
og_lead_ja: "Figma の公開ドキュメントによれば、AI の学習への利用は Starter・Professional で既定オン、Organization・Enterprise で既定オフ。2025-11-21 に集団訴訟が提起された"
og_lead_en: "Per Figma's documentation, AI content training is on by default for Starter and Professional and off for Organization and Enterprise; a class action was filed on 2025-11-21"
og_kicker_ja: "AI の事例 · 学習への利用の既定値"
og_kicker_en: "AI CASE · TRAINING DEFAULTS"
og_headline_ja: "AI の学習への利用は\n個人・小規模で既定オン。\n<accent>エンタープライズは既定オフ</accent>"
og_headline_en: "AI content training was\non by default for small\nteams and individuals.\n<accent>Off for enterprise</accent>"
key_figures:
  - value: "2"
    unit: "plans"
    label: "Plans on which AI content training is on by default (Starter, Professional); Organization and Enterprise are off by default (Figma's documentation)"
    tone: "alert"
  - value: "2024-08-15 → 2025-11-21"
    label: "From content training taking effect to the filing of the class action Khan v. Figma"
  - value: "4"
    unit: "theories"
    label: "Legal theories the plaintiffs advance; the core ones are breach of contract and trade secret misappropriation (the plaintiffs' claims)"
glossary:
  - term: "Content training"
    desc: "Figma's setting for using content such as design files to train the models behind its AI features. It is held by the team or organization administrator."
  - term: "Starter, Professional / Organization, Enterprise"
    desc: "Figma's plans. The first two are for individuals and small teams; the latter two are for organizations and large enterprises."
  - term: "AB 2013"
    desc: "California's generative-AI training-data transparency law, requiring developers to publish the sources and contents of their training data. In effect from 2026-01-01."
insight:
  slug: "default-is-not-consent"
  label: "A default is not consent to train"
  quote: "Unless consent to use entrusted content for training is checked before ingestion, separately from defaults and admin settings, content entrusted with consent and content entrusted without it cannot later be told apart in the training data."
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "hold-unverified"
    item: "Take content into training only when the authorized scope is confirmed, not because a default was on"
  - slug: "audit-trail"
    item: "Record the consent scope and the time of collection for each piece of data taken in"
impact: "AI content training on by default for two plans, Starter and Professional (Figma's documentation)"
takeaway: "Per Figma's documentation, whether content is used for training is set by plan defaults and admin settings. Check consent for that use before entrusted content goes into training."
self_check: "Before using entrusted data to train your own AI, do you check consent for that use separately from default settings?"
countries: ["us"]
---

## 1. Summary

According to the company's public documentation, the setting for using content in AI training is held by the team or organization administrator, and individual users cannot make an independent choice about their own content. The plaintiffs in a class action allege that, contrary to a long-standing representation that content would not be repurposed, the default settings and a policy change led to design files being used for training; the company denies this. The court has not yet ruled on which side is right. <strong>Unless consent to use entrusted content for training is checked before ingestion, separately from defaults and admin settings, content entrusted with consent and content entrusted without it cannot later be told apart in the training data.</strong>

## 2. What got through

- **What got through**: Making content that users entrusted, such as design files, subject to model training for AI features. According to Figma's public documentation, content training took effect on 2024-08-15, and is on by default for Starter and Professional and off by default for Organization and Enterprise (which cannot currently enable it).
- **What the receiving side gets**: In general, the side ingesting data for training receives the content and the state of the team's settings. Whether the person who entrusted the content consented to its use for training does not travel with the content. On Starter and Professional the setting is team-level, and individual users cannot make an independent choice about their own content (Figma's documentation).
- **Claims in the litigation**: The plaintiffs allege that users entrusted proprietary designs on the premise, as represented, that they would be used only to provide collaboration features, so repurposing them for training breaks the original agreement (breach of contract), and that competitive value was drawn from unreleased product plans and workflows in design files (trade secret misappropriation). Figma denies this, stating that it does not use customer information to train models without permission.
- **Not disclosed**: Which teams' content, and which content, was actually used for training. It is not in the materials consulted.

## 3. What to check

The condition that holds whatever the route is this: before entrusted content is ingested into training, check that the content carries the rights holder's consent to be used for training.

- **Who approves**: The rights holder of the content (the user who entrusted the design file, or their organization). That the default was on, or that an administrator did not turn it off, does not stand in for consent to that use.
- **Where the check happens**: Just before content is ingested into training data. Content whose consent cannot be checked is not ingested.
- **What remains**: A record of which content went in, under which scope of consent, and when. By the company's account, if an administrator turns the setting off later, the effect reaches subsequent new content and edits; the record keeps what was ingested before that traceable.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before entrusted content is ingested into training, consent for that use, and keeping a record. Detection means users noticing the repurposing after ingestion, and the issue being raised through lawsuits or reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check consent to train before ingestion</div>
<div class="rx-zone gapz"><b>What the plaintiffs allege</b><span>Entrusted design files<br>were used for training (alleged)</span></div>
<div class="rx-zone det"><b>Detection · worked after ingestion</b>Users' claims reached the court as a class action</div>
<div class="rx-g g1"><div class="t">2024-08-15</div><b>Content training takes effect</b></div>
<div class="rx-g g2"><div class="t">AFTERWARDS</div><b>Content of teams set on by default becomes subject to training</b></div>
<div class="rx-g g3"><div class="t">2025-11-21</div><b>A class action is filed</b></div>
<div class="rx-g g4"><div class="t">2026</div><b>In litigation; Figma denies</b></div>
</div>
</figure>

Use for training became a point of dispute in litigation after ingestion. Cases where being public and consent to train came apart include [the Discord message scraping](/critical/briefs/008-discord-scraping/), [personal data in the CommonPool training set](/critical/briefs/036-commonpool-training-data-pii/) and [live credentials in Common Crawl](/critical/briefs/079-common-crawl-training-data-live-secrets/). This case differs in that it concerns non-public content entrusted under a contract, not public data. Placing the check before use echoes [Sora 2 and Japanese IP](/critical/briefs/054-sora2-ip-provenance-consent/) (the switch from opt-out to opt-in).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before entrusted content is ingested into training data.** It does not make defaults or the state of a settings screen the condition for ingestion; before ingestion, it checks that the content carries consent to be used for training, and keeps a record.

### Industries and operations to watch

- **Industry · AI**: Organizations that use content entrusted by customers to train or improve their own AI features.
- **Operation · Disclosure & data release**: Passing entrusted content to their own or third-party model training.

### Current controls vs Lemma

This case's route is column 1 (ingesting entrusted content into training). Column 2 is how the substance of ingested content is handled; column 3 is showing, after ingestion, which content went in under which consent.

| Control | Ingesting entrusted content into training | Handling the substance of ingested content | Showing the scope of consent after ingestion |
| --- | --- | --- | --- |
| Admin setting (content training on/off) | Partial | Not relevant | Partial |
| De-identification and shielding of sensitive information | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not relevant | Effective |

By the company's account, the admin setting decides what is subject to ingestion at the team or organization level, and turning it off later affects subsequent new content and edits. De-identification and shielding of sensitive information concern how content is handled after ingestion; they do not decide whether the content may be used for training. Lemma checks consent to train before ingestion, and keeps which content went in, under which scope of consent, and when. It does not alter the substance of ingested content, and it does not delete data.

Note: Lemma's check works only when it is built in just before ingestion into training data and users' consent is issued and managed separately from the ingesting side's settings. Content that carries consent passes this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm for organizations that use entrusted content to train AI

- Do you record, per customer and separately from plan defaults, whether content may be used for training?
- Do you show the users who entrusted content how the training setting is configured?
- When use for training is turned off later, can you trace the content ingested before that?

## 5. Facts and timeline

- **Subject**: Figma content such as design files (design files, layer properties, text, images), and the model training of the company's AI features that uses it.
- **Settings (Figma's public documentation)**: Content training is on by default on Starter and Professional, and off by default on Organization and Enterprise. For Organization and Enterprise, it "cannot currently be enabled."
- **Effective date**: 2024-08-15. The company states that if an administrator switched it off on or after this date, subsequent new content and edits are not used for training.
- **Location of the setting**: A team/organization administrator setting. On Starter and Professional it is team-level, and individual users cannot make an independent choice about their own content.
- **Third-party vendors**: The company publishes a list of third-party vendors involved in processing (such as OpenAI).
- **Litigation**: Khan v. Figma, Inc. (U.S. District Court for the Northern District of California, 3:25-cv-10054), a class action filed on 2025-11-21.
- **The plaintiffs' claims**: Contrary to a long-standing representation that content would not be repurposed, the default settings and a policy change led to customers' design files being used to train generative AI. They advance four theories that sidestep the fair-use debate, centered on breach of contract and trade secret misappropriation.
- **Figma's account**: It denies the allegations, stating that it does not use customer information to train models without permission. Its documentation explains that it de-identifies content and shields sensitive information, and that what the model learns is general design patterns and Figma-specific concepts and formats, not users' content or ideas themselves.

### Timeline

- **2024-08-15**: Content training takes effect. On by default on Starter and Professional, off by default on Organization and Enterprise.
- **2025-11-21**: Khan v. Figma, Inc. (3:25-cv-10054) is filed in the U.S. District Court for the Northern District of California.
- **2026-01-01**: California's AB 2013 takes effect.
- **2026**: In litigation. Figma denies the allegations.

> The default values, effective date and location of the settings are based on Figma's own public documentation (primary). The factual allegations in the litigation are the plaintiffs' claims, not facts found by a court, and Figma denies them. This Brief does not judge the merits of either party's claims or legal liability, and does not blame Figma. Check the latest status of the litigation before publication. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **Figma's account**: Its documentation states the content-training default per plan and shows how administrators switch it. For data protection, it cites encryption at rest and in transit, access controls, a prohibition on third-party model providers using data to train their own models, and limits on vendors' data-retention periods. It states that data from Figma for Education and Figma for Government is not used for model training.
- **Litigation**: The plaintiffs seek damages and an order permanently enjoining use of the AI models. Figma denies the allegations.
- **Regulation**: California's AB 2013 took effect on 2026-01-01, requiring generative-AI developers to publish the sources and contents of their training data.

## 6. Sources

- **Figma (official documentation, primary)**: "Manage AI settings and content training for your team or organization" — <https://help.figma.com/hc/en-us/articles/17725942479127-Manage-AI-settings-and-content-training-for-your-team-or-organization>
- **Figma (official, primary)**: "Building Figma AI — Our approach" — <https://www.figma.com/ai/our-approach/>
- **Figma (official, primary)**: "AI Terms" — <https://www.figma.com/legal/ai-terms/>
- **Bloomberg Law**: "Figma Trained AI on User Data Without Consent, Class Action Says" — <https://news.bloomberglaw.com/litigation/figma-trained-ai-on-user-data-without-consent-class-action-says>
- **Law360 (case record)**: Khan v. Figma, Inc. (N.D. Cal., 3:25-cv-10054) — <https://www.law360.com/cases/69208e3cd222541266876e83>
- **Davis+Gilbert (AB 2013 takes effect)**: "AI Legal Updates: California's AI Training Data Transparency Law Takes Effect" — <https://www.dglaw.com/ai-legal-updates-californias-ai-training-data-transparency-law-takes-effect/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
