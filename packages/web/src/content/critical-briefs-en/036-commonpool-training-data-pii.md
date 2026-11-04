---
brief_no: 36
title: "DataComp CommonPool：公開の AI 学習データに、パスポート・履歴書・顔が含まれていた(arXiv:2506.17185)"
title_en: "DataComp CommonPool: A public AI training dataset contained passports, résumés and faces (arXiv:2506.17185)"
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
search_title: "CommonPool の個人情報混入：AI 学習データの監査"
search_description: "公開 AI 学習データセット DataComp CommonPool に、パスポート・履歴書・顔など個人情報が含まれていた（研究チームの監査・arXiv:2506.17185）。何が起きたか、なぜ事後のフィルタで除ききれないか、対策を整理。"
og_lead_ja: "DataComp CommonPool の 128 億ペアの AI 学習データに、パスポート・履歴書・顔が含まれていたと研究チームが報告"
og_lead_en: "Researchers report that DataComp CommonPool's 12.8B training pairs contained passports, résumés and faces"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 学習データの個人情報"
og_kicker_en: "AI CASE · PERSONAL DATA IN TRAINING SETS"
og_headline_ja: "AI の学習データに、\n身分証や履歴書、顔。\n<accent>ぼかしを逃れた顔 800 超</accent>"
og_headline_en: "AI training data held\nIDs, résumés and faces.\n<accent>800+ faces evaded blurring</accent>"
key_figures:
  - value: "800+"
    unit: "faces"
    label: "Faces that escaped automatic blurring in a 0.1% sample; about 102 million estimated overall (the research team)"
    tone: "alert"
  - value: "12.8"
    unit: "billion pairs"
    label: "Image-text pairs in DataComp CommonPool (released 2023), built on material Common Crawl collected in 2014–2022"
  - value: "0.1%"
    label: "Share of the dataset the research team audited; thousands of valid ID documents and over 800 résumés and cover letters were found"
glossary:
  - term: "DataComp CommonPool"
    desc: "An AI training dataset of image-text pairs released in 2023; the successor to LAION-5B."
  - term: "Common Crawl"
    desc: "An effort that collects the public web at scale. CommonPool is built on material it collected in 2014–2022."
  - term: "PII string filter"
    desc: "A filter that searches text for personal data with a fixed format, such as email addresses or Social Security numbers, and removes it."
insight:
  slug: "public-is-not-consent"
  label: "Being public is not consent to train"
  quote: "Even when material is public, unless the provenance and consent to use it for training are checked before ingestion, personal data that later filters cannot fully remove stays in the dataset."
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "Check, before ingestion, that each item has the provenance and consent to be used for training"
impact: "In a 0.1% sample, over 800 faces had escaped automatic blurring (the research team's audit)"
takeaway: "The research team's audit found personal data that had slipped past after-the-fact filters such as face blurring. Check each item's provenance and consent before it goes into training data."
self_check: "Before ingesting data for training or analysis, do you check that each item has the provenance and consent for that use?"
countries: ["global"]
---

## 1. Summary

According to the research team's audit, image-text pairs collected from the public web included real people's ID documents, résumés and faces, and some faces had escaped the automatic blurring the curators applied. Filters for known PII strings such as email addresses were reportedly not applied. The scale is an estimate from a sample audit, not a full count. <strong>Even when material is public, unless the provenance and consent to use it for training are checked before ingestion, personal data that later filters cannot fully remove stays in the dataset.</strong>

## 2. What got through

- **What got through**: Ingesting image-text pairs collected from the public web into a training dataset, and releasing it. After automatic face blurring, it was released as a dataset anyone could use for training (the research team's audit; reporting by MIT Technology Review).
- **What the receiving side gets**: In general, material collected from the web arrives with images and text, but not with provenance saying whose material it is, under what consent, and for what scope of use it was published. The ingesting side receives nothing on which to judge whether it may be used for training.
- **After-the-fact filters**: Automatic face blurring was applied, but over 800 faces in the sample escaped detection. Filters for known PII strings such as emails and Social Security numbers were not applied, the research team reports.
- **Not disclosed**: How much personal data actually reached downstream generative models and derivatives. The size of the problem across the whole dataset (estimated from a sample; not counted in full).

## 3. Pre-execution check

The condition that holds whatever the route is this: before material goes into a dataset, check that it has the provenance and consent to be used for training.

- **Who approves**: The owner of the material (the person pictured, or the owner of the document). Being public on the web does not stand in for permission to use it for training.
- **Where the check happens**: Just before material is ingested into the dataset. Material whose provenance and consent cannot be checked is not ingested.
- **What remains**: A record of which material went in under which provenance and consent, so that the relevant items can be traced when deletion or correction is requested.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before material goes into a dataset, the provenance and consent to use it for training, and keeping a record. Detection means finding personal data mixed in after ingestion; here, the research team's sample audit did that.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check each item's provenance and consent before ingestion</div>
<div class="rx-zone gapz"><b>What the research team reported</b><span>Unblurred faces, IDs and résumés<br>remained in the data</span></div>
<div class="rx-zone det"><b>Detection · the research audit worked</b>Audit a 0.1% sample and estimate the whole</div>
<div class="rx-g g1"><div class="t">2014–22</div><b>Common Crawl collects the public web at scale</b></div>
<div class="rx-g g2"><div class="t">2023</div><b>Faces auto-blurred; the dataset is released</b></div>
<div class="rx-g g3"><div class="t">DOWNSTREAM</div><b>Circulates in a form anyone can train on</b></div>
<div class="rx-g g4"><div class="t">2025-07</div><b>The audit results are reported</b></div>
</div>
</figure>

The research team's audit showed concretely what after-the-fact filters had failed to remove, but it found this after the dataset had been released. A case where being public and consent to train came apart is [the Discord message scraping](https://lemma.frame00.com/critical/briefs/008-discord-scraping/). The removable provenance mark on AI outputs echoes [the SynthID watermark removal](https://lemma.frame00.com/critical/briefs/011-synthid-watermark-reverse-engineering/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before material is ingested into a dataset.** It does not search for personal data after the fact; it checks, before ingestion, that the material has the provenance and consent to be used for training.

### Industries and operations to watch

- **Industry · AI**: Organizations that train models on material collected from the web, or that publish or provide training datasets.
- **Operation · Disclosure & data release**: Publishing or providing collected data as a dataset.

### Current controls vs Lemma

Column 1 is ingesting material into the dataset and column 2 is removing personal data from ingested material; in this case, both were passed.

| Control | Ingesting material (provenance and consent) | Removing personal data from ingested material |
| --- | --- | --- |
| Automatic face blurring | Not relevant | Partial |
| Known PII string filter | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

According to the research team, automatic face blurring was applied, but over 800 faces escaped detection in the sample alone, and filters for known PII strings were not applied. Both search ingested material for personal data and remove it; neither decides whether the material may be used for training. Lemma checks each item's provenance and consent before ingestion. It does not find personal data inside ingested material, and it does not delete data.

Note: Lemma's check works only when it is built in just before ingestion and each item's provenance and consent are issued and managed separately from the collector. Material that has provenance and consent passes this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm when ingesting data for training or analysis

- Do you select material by a criterion other than whether it is public?
- Do you record which material went into the dataset under which provenance and consent?
- When deletion or correction is requested, can you trace the relevant items within the dataset?

## 5. Facts and timeline

- **Target**: DataComp CommonPool, a training dataset of 12.8 billion image-text pairs released in 2023. It is built on material Common Crawl collected from the web in 2014–2022, and is the successor to LAION-5B.
- **Disclosure**: The research team published its audit paper (arXiv:2506.17185), and MIT Technology Review reported it on 2025-07-18.
- **What was found**: In an audit of 0.1% of the dataset, thousands of valid ID documents (credit cards, driver's licences, passports, birth certificates) and over 800 résumés and cover letters (real people confirmed via LinkedIn) were found, the research team reports.
- **Estimate**: The research team estimates that personal images number in the hundreds of millions across the whole dataset.
- **Privacy measures**: The curators applied automatic face blurring, but over 800 faces in the sample escaped detection, with about 102 million faces estimated to have been missed overall. Filters for known PII strings such as emails and Social Security numbers were not applied.
- **Impact**: CommonPool is the successor to LAION-5B and sits in the training lineage of Stable Diffusion, Midjourney and others. The research team and reporting point to the risk of personal data reaching downstream generative models and derivatives.

### Timeline

- **2014–2022**: Common Crawl collects images and text from the public web at scale.
- **2023**: DataComp CommonPool is released at 12.8 billion pairs, with measures such as automatic face blurring applied.
- **2025-06**: The research team's paper is published on arXiv (arXiv:2506.17185).
- **2025-07-18**: MIT Technology Review reports the ID documents, résumés and unblurred faces found, and the overall estimates.

> Proper names are based on primary sources (research institutions, etc.). This is a 0.1% sample audit and overall estimate by the research team; estimates are not treated as confirmed totals, and the scale is not exaggerated. This is not an attack but a case that brought the handling of provenance and consent in training data into view. This Brief does not blame any particular organization. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **The research team and reporting**: Estimated the whole from a sample audit, and pointed out the faces missed by blurring and the absence of PII string filtering. As the successor to LAION-5B, they flagged the risk of downstream spread.
- **Filter improvements**: Improvements to automatic face blurring and PII detection filters are under way.
- **Industry discussion**: For training data built on large-scale web collection, after-the-fact filters alone cannot fully remove personal data, and a composition that can trace which material went in with which provenance is increasingly demanded by both personal-data protection (such as the right to be forgotten) and the model supply chain. A dataset without provenance makes deletion and correction hard to honour.

## 6. Sources

- **MIT Technology Review**: "A major AI training data set contains millions of examples of personal data" (2025-07-18; CommonPool's PII contamination, scale estimates, leakage past face blurring) — https://www.technologyreview.com/2025/07/18/1120466/a-major-ai-training-data-set-contains-millions-of-examples-of-personal-data/
- **Research paper (arXiv)**: "A Common Pool of Privacy Problems: Legal and Technical Lessons from a Large-Scale Web-Scraped Machine Learning Dataset" (arXiv:2506.17185, 2025-06) — https://arxiv.org/abs/2506.17185

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
