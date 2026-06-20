---
brief_no: 8
title: "公開 API 経由の Discord 20.5 億メッセージ scraping — 公開チャンネルデータが AI training dataset として再配布される構造"
title_en: "Discord 2.05 Billion Message Scraping via Public API — How Public Channel Data Gets Redistributed as AI Training Datasets"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-05-22
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory", "C-agent-governance"]
related_briefs: ["005-noroboto-lying-fonts", "006-google-api-key-revocation-lag"]
version: "1.0"
status: published
og_lead_ja: "公開 API 経由で 20.5 億メッセージが AI 学習データに再配布 — Discord スクレイピング"
og_lead_en: "2.05 billion public messages redistributed as AI training data — Discord scraping"
gap_detected: "Tech media detected the dataset's existence after the collection and publication had already happened, raising the issue with the industry."
gap_missing: "Before distribution there was no layer to confirm whether the data had been collected within the bounds of the terms of service, so data gathered for a use the terms prohibited was published as-is."
gap_fix: "Before distributing data or ingesting it into AI training, independently verify with Lemma where the data came from and under what usage conditions it was collected, and prevent it up front."
---

## TL;DR

A research team used Discord's public API to scrape 2.05 billion messages from 3,167 servers and published them as an arXiv paper and a JSON dataset anyone can download. Discord's terms explicitly ban using API-obtained messages for AI training and ban bulk scraping and redistribution. Technical access through a public API and the use-scope the terms permit are different things — yet nothing verified, before distribution, whether the dataset was collected within a lawful scope, so forbidden-use data can flow downstream into AI training. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Scale**: 2.05 billion messages (2,052,020,630), 3,167 servers, 4,735,057 people, covering 2015–2024
- **Discovery scope**: 10% of 31,673 public servers discovered via Discord's "Discovery" feature, selected at random (as of 2024-11-17)
- **Scraping party**: A 15-researcher team at the Federal University of Minas Gerais in Brazil
- **Distribution format**: arXiv paper (2502.00627) and a JSON dataset published online
- **Distribution purpose**: A research dataset for "research on mental health and politics" and "bot training"
- **Anonymization measures**: Username rewriting; ID and message hashing with truncation
- **Policy / terms position**:
  - Discord developer policy: "You must not use the content of messages obtained via the API to train machine-learning models or AI (including large language models)" and "You must not mine or scrape any data, content, or information available on or via Discord services"
  - Discord terms of service: includes an anti-scraping clause
- **Distribution reach**: Publicly downloadable via arXiv, with downstream flow to researchers and AI vendors established
- **Discord platform response**: No public statement confirmed at the time of disclosure (the company had previously considered legal action against a similar case, Spy Pet, as of April 2024)

This incident is treated not as a cybersecurity attack incident but as a "trust-layer-related risk event" prompted by a research-purpose terms violation. We position it as the first case in expanding the scope of Lemma Critical Brief — beyond attack incidents to trust-layer-related risk events of the AI era in general.

---

## 2. Timeline

- 2015–2024 (target period): Messages targeted for scraping accumulated on Discord public servers
- 2024-11-17: The research team uses Discord's "Discovery" feature to discover 31,673 public servers in total and selects 10% at random
- After 2024-11-17 (estimated): Scraping via the public API is conducted
- May 2025: The arXiv paper (2502.00627) and JSON dataset are published online
- 2025-05-22: 404 Media publishes the initial reporting, explicitly noting violations of Discord's terms of service and developer policy. Japanese-language outlets follow up the same day
- After May 2025: Cross-industry discussion proceeds in GenAI as an argument concerning training data provenance

---

## 3. Event Chain

1. **Research design**: A 15-researcher team at the Federal University of Minas Gerais in Brazil drafts a research project to distribute Discord public communication as a large-scale dataset
2. **Discovery scope mapping**: Via Discord's "Discovery" feature, the team discovers 31,673 public servers as of 2024-11-17, and selects 10% (3,167 servers) at random
3. **Scraping via public API**: Using the public API, the team collects 2.05 billion messages for the 2015–2024 period and data on 4,735,057 people
4. **Anonymization measures**: Username rewriting and ID-and-message hashing with truncation are claimed to have been implemented
5. **Distribution**: A paper is posted to arXiv; the dataset is published online as JSON files
6. **Policy collision**: Simultaneous violation of the Discord developer policy's ML / AI training use ban and anti-scraping clause, and the terms of service's anti-scraping clause
7. **Downstream flow availability**: Dataset distribution to downstream researchers and AI vendors is technically established via arXiv, forming a path for use as AI training data

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, for public channel data on a chat platform, **the attribute assertion that "the server is set to public" and the use-scope attribute assertion defined by terms are not independently attested, and flow downstream via the distribution layer**. A technically accessible public API, a use scope forbidden by terms (ML / AI training use, redistribution, scraping), and the absence of a layer that independently verifies "whether the collection scope complies with terms" at the point of dataset distribution coexist simultaneously.

Brief 005 (Noroboto) is a structure in which AI judgment's **input integrity** is forged; Brief 006 (Google API key revocation lag) is a structure in which a credential's **revocation attribute** is not independently verified; the present incident is positioned as a structure in which a dataset's **provenance and use-scope attributes** are not independently verified. The three share the common structure that "a trust assertion (in this incident, 'this dataset was collected under a lawful scope') is detached from the layer that verifies it."

What differs from the other Briefs is that this incident is not a cybersecurity attack incident but a trust-layer risk event caused by a research-purpose terms violation. We position it as the first case in expanding the scope of Lemma Critical Brief — beyond attack incidents to trust-layer-related risk events of the AI era in general. The same-shape structure is expected to be referenced repeatedly going forward in discussions of data-perimeter risk in the public-channel settings of enterprise SaaS (Slack / Teams / Notion, etc.) and in arguments over GenAI vendors' training-data provenance accountability.

---

## 5. The detection–proof gap

In this incident, technology media centered on 404 Media detected the scraping and dataset publication and prompted cross-industry argument. This is a typical function of the detection layer, and this Brief does not deny the role of detection media and researchers. Detection remains essential for shaping the contours of an event, surfacing cross-industry argument, and prompting cross-organizational operational review.

That said, detection cannot reverse the state in which the dataset **has already been posted to arXiv and distributed as JSON**. Downstream researchers and AI vendors can download the dataset, and the path into AI training is not closed by detection alone. Even though there are violations of Discord's terms of service and developer policy, no technical access controls exist, and no mechanism for withdrawing a distributed dataset is established. Even if anonymization measures were applied, the regulatory compliance of the collection scope cannot be verified from the dataset alone.

For the purposes of establishing in regulatory filings, administrative proceedings, or enterprise AI-adoption due diligence that "the training data was collected under a lawful scope," when a dataset like this one flows into downstream AI training, an independent layer is required between detection scores and proof of dataset origin / scope. Pre-execution attestation stands in a **complementary**, not substitutive, relationship to detection; the combination of both layers establishes the trust boundary for AI training data.

---

## 6. Response and Industry Developments

- **404 Media** (initial reporting, 2025-05-22): Explicitly noted violations of Discord's terms of service and developer policy, presenting the problem to the industry. Raised the argument: "The researchers claim they anonymized the data, but no one likes the idea of their Discord messages being saved in public files online," and "It should be kept in mind that many Discord users are children"
- **Research team (Federal University of Minas Gerais)**: Stated that the purpose of dataset distribution is "to make it available for other research teams to use for research on mental health and politics or to train bots," and claimed that anonymization measures were implemented
- **Discord platform**: No official response confirmed at the time of disclosure. The company had previously considered legal action against a similar case, Spy Pet (April 2024, an operator that monitored over 600 million Discord users)
- **arXiv**: Training-data-dataset distribution policy on preprint platforms — including the dataset paper (2502.00627) — emerges as a cross-industry argument
- **Cross-industry argument**:
  - **GenAI vendors' training-data provenance accountability**: As an argument directly bearing on the EU AI Act's training-data documentation requirements and guidance such as the US NIST AI RMF, this incident provides a concrete case
  - **Reassessment of enterprise SaaS data perimeter**: The risk of third-party-scraping-mediated training-data inflow from public-channel settings of enterprise chat / collaboration tools such as Slack / Teams / Notion emerges as a primary area of concern at the CSO level
  - **ToS violation + anonymization claim + academic-research-purpose gray-zone regulation**: The legal positioning of the combination of public API + ToS violation + anonymization claim in the GDPR, US federal and state privacy laws, and Japan's Personal Information Protection Law enters the discussion among policy practitioners

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (a dataset's provenance and use-scope attributes flow downstream without independent verification), Lemma proposes a two-layer structure.

First, at the **dataset distribution layer**, a design that embeds the dataset's collection source, collection scope (compliant / in violation), and use conditions (no redistribution, no ML / AI training, etc.) as an independently verifiable cryptographic proof, and mandates proof attestation at the point of distribution. Downstream researchers and AI vendors can then independently verify, as verifiers, whether their own use case (e.g., ML training) is consistent with the dataset's collection scope.

Second, at the **AI training data audit layer**, a design that builds proof-mandatory verification into the AI vendor's training-data audit process, enabling independent verification of "what training data is this output based on" and "was that training data collected under a lawful scope" against AI model outputs. Enterprise CSOs are then able to exclude — as contract requirements at the AI-adoption decision point — training data with no proof or with proof of an unlawful scope.

The combination of the two layers is in a complementary, not substitutive, relationship to detection. Detection can retroactively capture the occurrence of scraping and the dataset's distribution but cannot control downstream flow of an already-distributed dataset. Pre-execution attestation establishes the trust boundary at the two layers: dataset distribution and AI training audit.

---

## 8. Sources

- **404 Media**: "Researchers Scrape 2 Billion Discord Messages and Publish Them Online" (2025-05-22, initial reporting, including technical description of violations of Discord's terms of service and developer policy) — https://www.404media.co/researchers-scrape-2-billion-discord-messages-and-publish-them-online/
- **arXiv research team paper**: "Discord Unveiled: A Comprehensive Dataset of Public Communication (2015–2024)" (2025, 15-researcher team at the Federal University of Minas Gerais in Brazil, primary source for the dataset distribution) — https://arxiv.org/pdf/2502.00627
- **Discord developer policy** official (the basis for the ML / AI training use ban and anti-scraping clause) — https://support-dev.discord.com/hc/ja/articles/8563934450327
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
