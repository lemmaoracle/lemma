---
brief_no: 36
title: "128 億枚の AI 学習データに、パスポート・履歴書・顔が混入していた — 学習データの来歴と同意が、収集の時点で検証されていなかった"
title_en: "12.8 Billion Training Images Contained Passports, Résumés, and Faces — The Provenance and Consent of Training Data Were Never Verified at Collection"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-07-18
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
og_lead_ja: "128 億枚の AI 学習データに ID・履歴書・顔が混入 — DataComp CommonPool"
og_lead_en: "12.8B training images contained passports, résumés, faces — CommonPool"
gap_detected: "An independent researcher audit made the contamination visible, and improvements to automatic face blurring and PII detection filters were advanced."
gap_missing: "There was no layer to confirm at collection time whether each item had the provenance and consent to be used for training, and after-the-fact mechanical filters could not cover everything (a 0.1% sample alone leaked over 800 faces)."
gap_fix: "Rather than asking whether it is public, independently verify with Lemma that each item has the provenance and consent to be used for training, and prevent it up front."
---

## TL;DR

DataComp CommonPool, one of the largest public AI training datasets, was reported to contain large volumes of real individuals' personal data — passports, résumés, faces. Independent audit made it visible, but after-the-fact PII filtering cannot guarantee coverage: a 0.1% sample alone leaked over 800 faces. What was missing was a layer to confirm, at collection time, whether each item had the provenance and consent for training; instead it was fixed at scale and propagates downstream irrecoverably. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Target**: DataComp CommonPool (released 2023, 12.8 billion image-text pairs; built on material that Common Crawl web-scraped in 2014–2022; successor to LAION-5B)
- **Disclosure**: 2025-07-18, the research team's audit results (arXiv:2506.17185); reported by MIT Technology Review
- **Findings**: in an audit of 0.1% of the dataset, thousands of valid ID documents (credit cards, driver's licenses, passports, birth certificates) and over 800 résumés/cover letters (real existence confirmed via LinkedIn) were found; personal images are estimated to number in the hundreds of millions overall
- **Gaps in privacy measures**: the curators applied automatic face blurring, but over 800 faces escaped detection in the sample, with an estimated ~102 million faces missed overall; filters for known PII strings such as emails and SSNs were not applied
- **Propagation**: CommonPool is the successor to LAION-5B and sits in the lineage that trained Stable Diffusion, Midjourney, and others; PII contamination of downstream generative models and derivatives propagates with high likelihood
- **Positioning**: not an attack incident, but a trust-layer risk event of the AI era (the absence of provenance and consent in training data); a training-data-provenance case following Brief 008 (Discord scraping)

---

## 2. Chain of events

(This is not an attack but a risk event that exposed the absence of provenance and consent in training data. The confirmed structure is recorded below.)

- 2014–2022: Common Crawl broadly web-scrapes (images and text on the public web)
- 2023: DataComp CommonPool is released at 12.8 billion pairs, with privacy measures such as automatic face blurring applied
- 2025-07-18: the research team publishes the results of a 0.1% audit (arXiv:2506.17185), reporting the large-scale contamination by ID documents, résumés, and missed faces, and the overall estimates; reported by MIT Technology Review

---

## 3. Structure of the chain

1. **Indiscriminate collection**: broadly scrape the public web and collect image-text pairs at scale; the collection includes individuals' ID documents, résumés, and faces
2. **Absence of provenance/consent**: no provenance accompanies each piece of material as to "whose, under what consent, and within what scope of use" it was published, so there is no basis to judge fitness for training
3. **Incomplete after-the-fact filtering**: face blurring etc. is applied, but over 800 faces leaked in the sample alone and PII-string filtering was not applied; after-the-fact mechanical filtering cannot be comprehensive
4. **Dataset release**: released as 12.8 billion pairs, usable by anyone for training
5. **Downstream propagation**: PII propagates to successor/derivative models (the Stable Diffusion / Midjourney lineage) and is fixed in a form that is hard to recall

---

## 4. Structural analysis

This case belongs to the `training-data-provenance` category of Pillar 01 (Verifiable Origin). Secondary categories are `data-provenance` (the provenance of individual material) and `attribute-proof-bypass` (regulated personal data — ID documents and the like — ingested without any attribute verification of fitness for use).

The central failure primitive is that **the provenance of "from where, under whose consent, and within what scope of use" the training data was collected is not verified at the time of collection and release.** A dataset can say "collected from the public web," but whether each piece of material may be used for training (consent, regulated status, scope of use) does not accompany the data. Provenance and consent are missing yet fixed at massive scale, and after-the-fact filters like face blurring cannot guarantee coverage (over 800 faces leaked in a 0.1% sample).

This is the **sibling** of Brief 008 (scraping 2.05 billion Discord messages via the public API into an AI training dataset). 008 showed "publicly available ≠ consent for training use," and this case concretizes, at a scale of 12.8 billion, that "after-the-fact filtering of large-scale collection cannot prevent contamination by regulated personal data (ID documents, faces)." Both share the root that "if the provenance and consent of training data are not verified at the time of collection, they propagate downstream in a form that is hard to recall." It also connects to Brief 011 (SynthID, whose provenance markers on AI-generated outputs can be stripped) as a family of problems in which provenance is not independently verified across the entire AI lifecycle. For regulation (GDPR's personal data and right to be forgotten), deletion and correction from a dataset without provenance are effectively infeasible.

---

## 5. The detection–proof gap

The research team's audit, the curators' face blurring, and improving PII-detection filters are indispensable for reducing harm; this Brief does not dispute that role. Here, too, the problem was made visible by independent researchers' audit.

But detection / after-the-fact filtering does not decide "whether, at the time of collection, this material may be ingested for training" itself. Face blurring and PII detection try to mechanically remove material from the already-collected 12.8 billion pairs, but coverage is not guaranteed — as 800-plus faces leaked in a 0.1% sample. Detection is reactive to generation/collection, and once a dataset is released and has propagated to downstream models, recall is nearly impossible. What was missing is independent verification, at the time of collection, that "this material has the provenance and consent to be used for training" — a different track from after-the-fact PII detection. For regulatory response, too, from data without provenance one cannot prove "under whose consent and within what scope it may be used."

Pre-execution attestation places the ingestion of training data not in after-the-fact filtering but in "independent verification, at the time of collection, of whether each piece of material has the provenance and consent to be used for training." Material for which a proof of provenance/consent does not hold is rejected before it is ingested into the dataset. PII detection (the detection-style "search for contaminants after the fact") and pre-execution proof of provenance ("is this material fit to ingest?") are not substitutes but **complements**, and to prevent hard-to-recall downstream propagation, the weight shifts toward the latter.

---

## 6. Response and industry context

- **The research team / MIT Technology Review**: presented overall estimates from a 0.1% audit, pointed out the leakage past face blurring and the non-application of PII filters, and raised the downstream-propagation risk as the successor to LAION-5B
- **Cross-industry**: training data built on large-scale web scraping cannot comprehensively prevent contamination by regulated personal data via after-the-fact filtering. A mechanism to verify the provenance and consent of material at the time of collection, and a design ensuring the auditability of a dataset's composition (which material, with what provenance, is included), are increasingly demanded by both regulation (personal-data protection, right to be forgotten) and the model supply chain. A dataset without provenance is poorly suited to deletion, correction, or regulatory response.

The need to "ingest training data by whether it has provenance and consent, not by whether it is publicly available" is gaining weight through this case and Brief 008.

---

## 7. Lemma's analysis

Against the structure exposed here (the provenance and consent of training data are not verified at collection, and after-the-fact filtering cannot be comprehensive), Lemma proposes a design that places data ingestion not in after-the-fact PII detection but in "independent verification, at the time of collection, of whether each piece of material has the provenance and consent to be used for training." Material for which a proof of provenance/consent does not hold is rejected before ingestion, and the dataset's composition becomes auditable with provenance attached. The design philosophy of the verifiable-origin category — "publicly available ≠ has provenance and consent" — is what operates here. Read together with Brief 008 (Discord scraping) as the training-data-provenance lineage.

---

## 8. Sources

- **MIT Technology Review**: "A major AI training data set contains millions of examples of personal data" (2025-07-18; CommonPool's PII contamination, scale estimates, leakage past face blurring) — https://www.technologyreview.com/2025/07/18/1120466/a-major-ai-training-data-set-contains-millions-of-examples-of-personal-data/
- **Research paper (arXiv)**: "A Common Pool of Privacy Problems: Legal and Technical Lessons from a Large-Scale Web-Scraped Machine Learning Dataset" (arXiv:2506.17185, 2025-06) — https://arxiv.org/abs/2506.17185
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
