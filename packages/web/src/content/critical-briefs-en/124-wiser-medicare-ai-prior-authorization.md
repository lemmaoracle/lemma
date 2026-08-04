---
brief_no: 124
title: "Medicare の AI 事前承認 WISeR：不承認は下されたが、その判定が根拠データに照らして独立に検証された証跡は残らない — 医師はハルシネーションを疑う"
title_en: "Medicare's WISeR AI prior authorization: denials were issued, but no record that the judgment was independently verified against the patient's own evidence"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2026-06-23
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["078-tenncare-connect-medicaid-eligibility", "012-williams-frt-wrongful-arrest", "060-withers-aberdeen-ai-hallucinated-precedent", "115-mobley-workday-ai-hiring-bias"]
status: published
version: "1.0"
og_lead_ja: "Medicare の AI 事前承認モデル WISeR、不承認をめぐり医師がAIハルシネーションを指摘"
og_lead_en: "Medicare's WISeR AI prior-authorization denials draw doctors' concerns of AI hallucinations"
gap_detected: "CMS requires that a final non-coverage determination be made by a licensed clinician, not a machine, and vendors say humans make the final call."
gap_missing: "No record survives showing that a denial — an adverse action — was independently verified and authorized against the patient's own evidence before it was issued."
gap_fix: "Require proof that a determination rests on the right patient's own evidence, as independently verifiable proof, and hold an adverse action before it becomes final when that proof is absent."
---

## 1. TL;DR

Since January 2026, US Medicare has piloted **WISeR**, an AI-assisted prior authorization model, across six states. On June 23, 2026, KFF Health News (via CBS) reported that doctors attribute some denials to AI hallucinations garbling clinical facts — a patient needing a neck injection denied because "the thoracic region" was ineligible; a patient documented four times as having no numbness denied for numbness. CMS requires a licensed clinician, not a machine, to make the final non-coverage call. The adjudicating layer was there. **What is not there is a record that, before the denial issued, the determination was independently verified against the patient's own evidence.**

## 2. What happened

- The subject is WISeR (Wasteful and Inappropriate Service Reduction), introduced into fee-for-service (Original) Medicare. It covers 13 services deemed vulnerable to fraud or misuse — skin and tissue substitutes, electrical nerve stimulator implants, knee arthroscopy for osteoarthritis, kyphoplasty for spinal fractures — across Arizona, New Jersey, Ohio, Oklahoma, Texas and Washington. Inpatient-only services, emergency services, and services where significant delay would pose substantial risk are excluded.
- Doctors and their staff say some denials look like AI hallucinations that garble or invent clinical information. At the University of Washington's medical system alone, nearly 100 patients were waiting earlier this year for epidural injections because of WISeR-related delays, per an April report from a US senator's office drawing on hospital association data.
- Per CMS's own announcement, model participants are paid based on their ability to reduce inappropriate utilization and lower Original Medicare spending, with payments adjusted against quality and process measures covering decision speed and stakeholder experience. Vendors say they have not heard of AI hallucinations.

A denial reaches the patient along this path.

1. A physician submits the supporting medical records to an online portal ahead of one of the 13 covered procedures.
2. AI and machine learning grant an "immediate yes" to requests meeting the program's criteria — one vendor puts this at about 88% of cases where the clinical data supports approval.
3. The rest go to review, and some come back denied on garbled clinical facts.
4. The patient faces delay, extra visits, or abandoning treatment, and appeals rise — with review costs accruing on the government's side as well.

## 3. Timeline — disclosure and response

- June 27, 2025 — CMS announces the WISeR model, stating explicitly that final determinations that a request does not meet coverage requirements will be made by licensed clinicians, not machines.
- Mid-January 2026 — the pilot launches in six states. Participants describe the rollout as "quicker than normal" (the outgoing CEO of the Ohio State Medical Association; the policy director of the Washington State Medical Association), and a vendor concedes an "aggressive rollout from the time of being notified to going live."
- April 2026 — Sen. Maria Cantwell's office publishes a snapshot report on WISeR drawing on hospital association data, including the roughly 100 patients waiting for epidural injections at the University of Washington.
- June 23, 2026 — KFF Health News (Darius Tahir, published by CBS News) reports the confusion, errors and delays, along with denials suspected of originating in AI hallucinations.

> This Brief does not adjudicate whether any individual case was an AI hallucination. CMS and the vendors state that humans make the final determination, and one vendor says it has not heard of hallucinations. Individual physicians' accounts are treated as the claims of interested parties. The senator's office report could not be retrieved directly at the time of writing, so its figures are cited via KFF Health News's reporting.

Response and industry movement since disclosure:

- CMS says the goal is "to reduce inappropriate care without delaying appropriate care," with decisions returned within 72 hours and clean claims paid within 15 days. In practice, "six- to eight-week delays" (a Tulsa radiologist) and payment backlogs are reported, with a vendor executive acknowledging in an April webinar a large payment backlog stretching back to January.
- CMS acknowledged that it has accounted for the rise in appeals and the associated costs. It says there are "currently no changes" contemplated for the list of covered services, but that it continues to assess whether changes are warranted.
- The director of the CMS Innovation Center also acknowledged that "the percentage of providers committing waste, fraud, and abuse is small."

## 4. Why it wasn't stopped

The failure here is not that an AI can be wrong. It is that when a denial — an adverse action — issues, no record survives showing the determination was independently verified and authorized against the patient's own evidence beforehand.

Human final judgment is written into the design. CMS requires a licensed clinician to make the non-coverage determination, and vendors describe it the same way. On paper, the verifying layer existed. But when a physician submits the same record four times and the misreading does not reverse, that layer is not operating effectively ahead of the action. What failed is not the presence of adjudication but the verification that reconciles a determination against its evidence before the action.

> A denial is an action. Without a record independently confirming, before that action, that the determination rests on the right patient's right record, the error executes first, as a decision already imposed.

The payment design can widen this gap. When payment is tied to reduced utilization and lower spending, the legitimacy of the determination has to be carved out as an independent record, or there is no way to demonstrate the neutrality of the incentive after the fact. This descends directly from [Brief 078](/critical/briefs/078-tenncare-connect-medicaid-eligibility/), where TennCare's automated eligibility determinations terminated Medicaid coverage while wrong, and it shares the structure of public-sector AI judgments that go unverified before action. The issue is not the "fairness" of the determination but the single point shown in [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (facial recognition and a wrongful arrest): a determination is not independently verified and authorized before a coercive action.

## 5. What proof would have changed

Where does pre-execution proof insert itself into the path a denial travels? Before the action becomes final, requiring a record that the determination was applied to the right patient, against the right evidence, according to the stated criteria.

- **A record before the determination is acted on.** Before an adverse action is finalized, record that the determination was independently verified and authorized against the underlying evidence.
- **Bind the determination to the evidence.** Tie it to the patient record actually consulted, making misreadings — the wrong anatomical region, findings that contradict the file — detectable before the action.
- **Provenance of the decision.** Record the path from the AI's recommendation to the human's final call in a form that cannot be altered afterward, so that "a clinician decided" survives as a verifiable fact rather than a stated policy.
- **Separate from the incentive.** Even where payment tracks reductions, carve out the record of a determination's legitimacy as an independently verifiable object.

Lemma is not a product that determines medical necessity, nor one that detects AI errors. Its scope is to verify independently, before an adverse action becomes final, that the determination rests on the underlying evidence, and to make it possible to hold actions that carry no proof. Improving AI accuracy and human final review (clinician review, appeals, after-the-fact correction) and pre-execution proof (a record reconciling determination against evidence before the action) are complementary, not alternatives. The first corrects errors afterward; the second closes the space between "a determination was issued" and "a determination was independently verified and authorized against the evidence" — the one place detection structurally does not fill. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for scope, [Pillar 02 — Verifiable AI](/pillars/#inference).

## 6. Sources

- **KFF Health News / CBS News (independent reporting)**: Darius Tahir, "Medicare's AI push snarls patients and doctors in errors and delays" (2026-06-23) — <https://www.cbsnews.com/news/medicare-ai-program-wiser-prior-authorization-errors-delays/>
- **CMS (primary, announcement)**: "CMS Launches New Model to Target Wasteful, Inappropriate Services in Original Medicare" (2025-06-27) — <https://www.cms.gov/newsroom/press-releases/cms-launches-new-model-target-wasteful-inappropriate-services-original-medicare>
- **CMS (primary, operational guide)**: "WISeR Model provider/supplier guide" — <https://www.cms.gov/priorities/innovation/files/wiser-provider-supplier-guide.pdf>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 02 — Verifiable AI](/pillars/#inference) · [Brief 078 (TennCare automated eligibility)](/critical/briefs/078-tenncare-connect-medicaid-eligibility/) · [Brief 012 (facial recognition wrongful arrest)](/critical/briefs/012-williams-frt-wrongful-arrest/)
