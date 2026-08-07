---
brief_no: 124
title: "Medicare の AI 事前承認 WISeR：不承認は下されたが、どの記録に照らした判定かは残らない — 医師はハルシネーションを疑う"
title_en: "Medicare's WISeR AI prior authorization: denials were issued, but no record of which patient file each judgment was checked against"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2026-06-23
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["078-tenncare-connect-medicaid-eligibility", "012-williams-frt-wrongful-arrest", "060-withers-aberdeen-ai-hallucinated-precedent", "115-mobley-workday-ai-hiring-bias"]
status: published
version: "1.1"
og_lead_ja: "Medicare の AI 事前承認モデル WISeR、不承認をめぐり医師がAIハルシネーションを指摘"
og_lead_en: "Medicare's WISeR AI prior-authorization denials draw doctors' suspicions of AI hallucination"
gap_detected: "The adjudicating layer existed on paper. CMS requires that a final non-coverage determination be made by a licensed clinician, not a machine, and vendors say the same."
gap_missing: "Which patient file each determination was checked against leaves no record verifiable before the action — not within what the published operational guide describes."
gap_fix: "Fix which file and which issuer a determination was checked against, before the action, and make denials that carry no such proof holdable."
analysis_lead_en: "What cannot be checked is not whether the file was consulted. It is which patient's file, and which record, that determination was checked against."
---

## 1. TL;DR

Since January 2026, US Medicare has piloted **WISeR**, an AI-assisted prior-authorization model, across six states. On June 23, 2026, KFF Health News (via CBS) reported that doctors attribute some denials to AI hallucinations garbling clinical facts — a patient needing a neck injection denied because "the thoracic region" was ineligible; a patient whose records stated four times that there was no numbness, denied on the grounds of numbness. CMS requires a licensed clinician, not a machine, to make the final non-coverage call. The adjudicating layer was there, on paper. **What was missing is the layer that establishes, before a denial is issued, which patient file that determination was checked against.**

## 2. What happened

- The subject is WISeR (Wasteful and Inappropriate Service Reduction), introduced into fee-for-service (Original) Medicare. It covers 13 services deemed vulnerable to fraud or misuse — skin and tissue substitutes, electrical nerve stimulator implants, knee arthroscopy for osteoarthritis, and kyphoplasty for spinal fractures — across Arizona, New Jersey, Ohio, Oklahoma, Texas, and Washington. Inpatient-only services, emergency services, and services for which delay would pose a substantial risk are excluded.
- Doctors and their staff say some denials look like AI hallucinations that garble or invent clinical information. Earlier this year, nearly 100 patients at the University of Washington's medical system alone were reported to be waiting for epidural injections because of WISeR-related delays, according to an April report from a US senator's office drawing on hospital association data.
- Per CMS's own announcement, model participants are paid based on their ability to reduce inappropriate utilization and lower Original Medicare spending, adjusted for quality and process measures covering decision speed and stakeholder experience. One vendor — the CEO of Humata Health — says he is not aware of any such hallucinations.

A denial reaches the patient through the following chain.

1. A physician submits the supporting medical records to an online portal ahead of one of the 13 covered procedures.
2. AI and machine learning grant an "immediate yes" to requests meeting the program's criteria — one vendor puts this at about 88% of cases where the clinical data supports approval.
3. The rest go to review, and some come back denied on garbled clinical facts.
4. The patient faces delay, extra visits, or giving up on treatment; appeals rise, and review costs accrue on the government's side as well.

## 3. Timeline — disclosure and response

- 2025-06-27: CMS announces the WISeR model, stating explicitly that final determinations that a request does not meet coverage requirements will be made by licensed clinicians, not machines.
- 2026-01 (mid-month): the pilot launches in six states. The outgoing CEO of the Ohio State Medical Association calls the rollout "quicker than normal" for the federal government; the policy director of the Washington State Medical Association says doctors "just sort of had to figure it out." A vendor concedes an "aggressive rollout from the time of being notified to going live."
- 2026-04: Sen. Maria Cantwell's office publishes a snapshot report on WISeR drawing on hospital association data, including the roughly 100 patients waiting for epidural injections at the University of Washington.
- 2026-06-23: KFF Health News (Darius Tahir, published by CBS News) reports the confusion, errors, and delays, along with denials that doctors suspect originated in AI hallucinations.

> This Brief does not adjudicate whether any individual case was an AI hallucination. CMS and the vendors state that humans make the final determination, and one vendor says he is not aware of any hallucinations. Individual physicians' accounts are treated as accounts from parties with a direct stake. The senator's office report could not be retrieved directly at the time of writing, so its figures are cited via KFF Health News's reporting.

The response and industry movement after disclosure:

- CMS says the goal is "to reduce inappropriate care without delaying appropriate care," with decisions returned within 72 hours.
- What the field reports does not match. Clean claims are supposed to be paid within 15 days, according to physicians on the ground, but "six- to eight-week delays" (a Tulsa radiologist) are what they report seeing. At an April briefing, the vendor holding the Arizona contract also acknowledged a large payment backlog stretching back to January.
- Appeals are reported to be rising, and CMS said it had factored in changes in the volume of appeals and the associated costs. It says there are "currently no changes" contemplated for the list of covered services, but that it continues to assess whether changes are warranted.
- The director of the CMS Innovation Center also acknowledged that "the percentage of providers committing waste, fraud, and abuse is small."

## 4. Why it wasn't stopped

The failure here is neither that an AI can be wrong nor that human review was absent from the design. **Which patient file, and which record, each determination was made against was never kept in a form anyone could check before the action became final.**

Human final judgment is written into the design. CMS requires a licensed clinician to make the non-coverage determination, and vendors describe it the same way. On paper, the adjudicating layer existed. What was missing came earlier — a form in which a third party could establish, before the action becomes final, which record the determination was actually made against. When a physician states the same fact four times in the record and the misreading is not corrected, nothing remains to substantiate the account that the file was consulted at all.

> A denial is an action. Without a record of which file that determination was checked against, the account that it was checked stays an account — and the error takes effect first, as an adverse action already imposed.

The payment design can widen this gap. When payment is tied to reduced utilization and lower spending, the record of which file a determination rests on has to be carved out independently of the paying party, or there is nothing left to audit how determinations were issued. This descends directly from [Brief 078](/critical/briefs/078-tenncare-connect-medicaid-eligibility/), where erroneous automated eligibility determinations cut off Medicaid coverage, and it shares the structure of public-sector AI judgments that go unverified before action. The issue is not the "fairness" of the determination but the single point shown in [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (facial recognition and a wrongful arrest): that a determination is not independently verified and authorized before a coercive action follows.

## 5. What proof would have changed

Proof-as-auth inserts one step into the path ahead of each act of finalizing an adverse determination: it fixes what the determination was checked against. A machine does not adjudicate whether the check itself was correct. It puts "which patient, and which record, was this determination made against" into a form the receiving side can establish — before the action becomes final, and without querying the issuer.

Lemma's design against this gap:

<ul class="bd-check">
<li><strong>Fix what was checked against.</strong> Before an adverse action is finalized, tie the determination to the patient record actually consulted, and keep which record it rests on in a form checkable ahead of the action.</li>
<li><strong>A record of the check.</strong> Keep when, under whose issuance, and untampered that binding was made, in a form that cannot be overturned later. The account that the file was consulted stops being merely an account.</li>
<li><strong>Provenance of the decision path.</strong> Record the path from the AI's recommendation to the human's final call in a form that cannot be altered afterward. Once the time of approval is on record, review time per case becomes a checkable fact.</li>
<li><strong>Audit independent of the payer.</strong> Even where payment tracks reductions, carve out the record of which file a determination rests on so it can be audited independently of the paying party.</li>
</ul>

What it does not carry is worth stating too.

<ul class="bd-limit">
<li>Whether a misreading occurred is judged by a person, on the basis of that binding.</li>
<li>Provenance shows when an approval was performed, not whether the reviewer read the record.</li>
<li>The gate sits with the payer; this layer supplies the material for that decision, no more.</li>
</ul>

This is also where it differs from your own audit log. A log is something you produce for yourself; the party on the receiving end of the action cannot check it independently.

The two reported cases differ in kind. A denial said to have cited the thoracic region against a request for a neck injection is one the submitting side can reconcile against its own filing, so with the binding fixed it can be contested before the action. If, on the other hand, a determination contradicted findings stated repeatedly in the record, that concerns the reading of the record itself, and it falls outside the scope of pre-execution proof — a layer that depends on the same reading reproduces the same error. What carries that case is accuracy work, human review, and appeals.

Lemma is not a product that determines medical necessity, nor one that detects AI errors. Accuracy work and human final review are complementary to this layer, not alternatives to it. The first corrects errors afterward; the second closes one point before the action becomes final.

## 6. Sources

- **KFF Health News / CBS News (independent reporting)**: Darius Tahir, "Medicare's AI push snarls patients and doctors in errors and delays" (2026-06-23) — <https://www.cbsnews.com/news/medicare-ai-program-wiser-prior-authorization-errors-delays/>
- **CMS (primary, announcement)**: "CMS Launches New Model to Target Wasteful, Inappropriate Services in Original Medicare" (2025-06-27) — <https://www.cms.gov/newsroom/press-releases/cms-launches-new-model-target-wasteful-inappropriate-services-original-medicare>
- **CMS (primary, operational guide)**: "WISeR Model Provider and Supplier Operational Guide" — <https://www.cms.gov/priorities/innovation/files/wiser-provider-supplier-guide.pdf>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 02 — Verifiable AI](/pillars/#inference) · [Brief 078 (TennCare automated eligibility)](/critical/briefs/078-tenncare-connect-medicaid-eligibility/) · [Brief 012 (facial recognition wrongful arrest)](/critical/briefs/012-williams-frt-wrongful-arrest/)
