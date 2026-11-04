---
brief_no: 8
title: "Discord: Messages from public servers were bulk-collected and published as a research dataset (404 Media)"
title_en: "Discord: Messages from public servers were bulk-collected and published as a research dataset (404 Media)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-05-22
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory", "C-agent-governance"]
related_briefs: ["005-noroboto-lying-fonts", "006-google-api-key-revocation-lag"]
version: "1.2"
status: published
og_lead_ja: "Discord：公開 API で集めた 20.52 億メッセージが、研究用のデータセットとして公開された（404 Media）"
og_lead_en: "Discord: 2.05 billion messages collected through the public API were published as a research dataset (404 Media)"
search_title: "Discord の20億メッセージ収集：経緯と対策"
search_description: "研究チームが Discord の公開 API で 3,167 サーバーの 20.52 億メッセージを集め、データセットとして公開した（404 Media）。何が起きたか、なぜ止まらなかったか、対策を整理。"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "データ利用の事例 · 一括収集と公開"
og_kicker_en: "DATA USE · BULK SCRAPING"
og_headline_ja: "公開サーバーの\nメッセージが一括収集され、\nデータセットとして公開。\n<accent>20.52 億メッセージ</accent>"
og_headline_en: "Messages on public\nservers were scraped\nand published online.\n<accent>2.05 billion messages</accent>"
key_figures:
  - value: "2.05B"
    unit: "messages"
    label: "Collected through the public API from 3,167 public servers and published in a form anyone can download (the research team's paper)"
    tone: "alert"
  - value: "4,735,057"
    unit: "users"
    label: "Users included in the dataset (covering 2015–2024)"
  - value: "10%"
    label: "Share chosen at random from the 31,673 public servers found through the Discovery feature (as of 2024-11-17)"
glossary:
  - term: "Scraping"
    desc: "Collecting data shown on a site or service in bulk with a program. Discord's developer policy and terms of service prohibit it."
  - term: "Developer policy"
    desc: "The rules developers using Discord's API must follow. It prohibits using messages obtained through the API to train machine-learning or AI models."
insight:
  slug: "terms-not-in-data"
  label: "Usage terms don't travel with the data"
  quote: "The usage terms of the source are not carried in the dataset itself, so unless they are checked before distribution or training, data for a use the terms prohibit passes downstream like any other data."
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "hold-unverified"
    item: "Do not publish the dataset until it is confirmed to be collected within the terms"
impact: "2.05 billion messages collected and published"
takeaway: "Messages collected through a public API were published as a dataset anyone can download. Check where the data came from and under what usage terms before distributing it or ingesting it for training."
self_check: "Before you distribute data collected from outside or use it for training, do you check where it came from and under what usage terms it was collected?"
countries: ["global"]
---

> **Revision (v1.2 / 2026-11-03)**: Moved from the older format to chapters that start from what got through, and dropped the second half and the figures from the title. Facts and sources are unchanged. (The v1.1 / 2026-10-17 correction of the total message count stands as it was.)

## 1. Summary

Being technically able to retrieve data through a public API is not the same as the use the terms allow. The research team says it anonymized the data, but the dataset was distributed with an arXiv paper in a form anyone can download, and 404 Media reported that this ran against Discord's terms of service and developer policy. The reporting came after publication, and reporting alone does not close the path by which a distributed dataset passes downstream. <strong>The usage terms of the source are not carried in the dataset itself, so unless they are checked before distribution or training, data for a use the terms prohibit passes downstream like any other data.</strong>

## 2. What got through

- **What got through**: Bulk retrieval of messages from public servers through the public API, and publication online as an arXiv paper (2502.00627) and a JSON dataset.
- **What reached the receiving side**: In general, a public API answers queries without telling what use they are for. For those who receive a distributed dataset, even with anonymization applied, whether the collection stayed within the terms cannot be told from the dataset alone.
- **What the terms say**: Discord's developer policy states "You must not use the content of messages obtained via the API to train machine-learning models or AI (including large language models)" and "You must not mine or scrape any data, content, or information available on or via Discord services." The terms of service also include a clause prohibiting scraping.
- **The research team's account**: It says the purpose of distribution is "to make it available for other research teams to use for research on mental health and politics or to train bots," and that it rewrote usernames and hashed and truncated IDs and messages.
- **Not disclosed**: An official statement from Discord (none confirmed at the time of publication), and whether the dataset was used downstream for AI training.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is checking, before data is distributed and before it is ingested for training, where it came from and under what usage terms it was collected, separately from the content of the data.

- **Who approves**: The party distributing the data. Before distribution, it states the source, how the data was collected, and the usage terms (whether redistribution and AI training are allowed). The terms themselves rest on the source platform's terms.
- **Where it is checked**: Just before a dataset is distributed, and just before the receiving side ingests it for training. It is checked whether the intended use (for example, machine learning) fits the terms under which the data was collected; if not, the data is not distributed or ingested.
- **What is recorded**: Which dataset was used for which purpose, after passing a check against which terms. Later, it can be traced where the training data came from.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before distribution or ingestion for training, the source of the data and its usage terms, and keeping a record. Detection means finding the publication after it happens. The dates below follow the disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the source and usage terms before distribution</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>2.05 billion messages published<br>in a form anyone can download</span></div>
<div class="rx-zone det"><b>Detection · worked after publication</b>404 Media reports it and sets out how it relates to the terms and policy</div>
<div class="rx-g g1"><div class="t">2024-11-17</div><b>10% of public servers chosen</b></div>
<div class="rx-g g2"><div class="t">From 11-17</div><b>Collected via the public API (estimated)</b></div>
<div class="rx-g g3"><div class="t">2025-05</div><b>Paper and dataset published</b></div>
<div class="rx-g g4"><div class="t">05-22</div><b>404 Media reports</b></div>
</div>
</figure>

The reporting showed that the collection and publication existed and widened the debate, but it came after the dataset had been posted to arXiv and distributed as JSON. A case of the same kind, where the receiving side treats what arrives without checking where it came from, is [Noroboto](/critical/briefs/005-noroboto-lying-fonts/) (disguised input read by AI).

## 4. What Lemma does

**Lemma builds the check in section 03 in just before a dataset is distributed and before it is ingested for training.** It does not look for scraping; it checks where the data came from and under what usage terms it was collected, before distribution or ingestion.

### Industries and operations to watch

- **Industry · AI**: AI companies and research institutions that gather training data from outside. A published dataset can be obtained by downstream researchers and AI companies, and explaining where training data came from (such as the EU AI Act's training-data documentation requirements) becomes an issue.
- **Operation · Disclosure and provision of information**: Publishing and distributing datasets, and accepting outside datasets. Whether the source's terms fit the intended distribution and training use.

### Current controls vs Lemma

The route in this case is column 1 (distributing a dataset for a use the terms prohibit). Column 2 is the stage where the receiving side ingests it for training; whether that happened here has not been disclosed.

| Control | Distributing a dataset for a use the terms prohibit | Ingesting a received dataset for training |
| --- | --- | --- |
| Prohibition in the terms of service and developer policy | Partial | Partial |
| Anonymization (rewriting usernames, hashing) | Not relevant | Not relevant |
| Detection by reporters and researchers | Partial | Not effective |
| **Lemma (pre-execution check)** | Partial | Effective |

The terms and policy define the prohibited uses, but no mechanism checks, at the public API's response or at the place of distribution, whether a use falls within them. Anonymization reduces how identifiable users are and does not bear on whether the collection stayed within the terms. Detection by reporters and researchers shows the dataset exists after publication, but does not stop an already-distributed dataset from passing downstream. Lemma checks the source and usage terms just before the distributing side and the receiving side act.

Note: Lemma's check works only when it is built in at the place of distribution, or just before the receiving side ingests data for training. If the distributing side publishes without using the check, nothing stops it before distribution, and only the receiving side's check remains. Lemma does not withdraw or delete data that has already been distributed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about distributing and accepting datasets

- Before you publish or distribute a dataset, do you confirm that the source's terms allow redistribution and use for AI training?
- For datasets you accept, do you receive a record of the source and usage terms, separately from the data?
- Do you record which dataset was used, under which terms, for which training, so it can be traced later?

## 5. Facts and timeline

- **Scale**: 2.05 billion messages (2,052,206,308), 3,167 servers, 4,735,057 people, covering 2015–2024.
- **Scope**: 10% chosen at random from the 31,673 public servers found through Discord's "Discovery" feature (as of 2024-11-17).
- **Collecting party**: A team of 15 researchers at the Federal University of Minas Gerais in Brazil.
- **Distribution format**: An arXiv paper (2502.00627) and a JSON dataset published online.
- **Distribution purpose**: A research dataset for research on mental health and politics and for bot training (the research team's account).
- **Anonymization**: Rewriting usernames, and hashing and truncating IDs and messages (the research team's account).
- **Position under the terms**: 404 Media reported that it ran against the developer policy's prohibition on use for machine-learning / AI training and on scraping, and the terms of service's prohibition on scraping.
- **Distribution reach**: Downloadable by anyone through arXiv, with a path to downstream researchers and AI companies.
- **Discord's response**: No official statement confirmed at the time of publication. The company had previously considered legal action against a similar case, Spy Pet, in April 2024.

### Timeline

- **2015–2024**: The messages later collected accumulated on Discord's public servers.
- **2024-11-17**: The research team finds 31,673 public servers through the Discovery feature and selects 10% at random.
- **After 2024-11-17 (estimated)**: Collection through the public API.
- **2025-05**: The arXiv paper (2502.00627) and the JSON dataset are published.
- **2025-05-22**: 404 Media reports it, noting that it runs against Discord's terms of service and developer policy. Japanese-language outlets follow up the same day.

> This case is treated not as an intrusion by an attack but as one about collection and publication for research. The facts rest on 404 Media's reporting, the research team's paper, and Discord's developer policy. The scale of harm is not exaggerated. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **404 Media** (2025-05-22): Set out how it relates to the terms and policy, and raised the points that "The researchers claim they anonymized the data, but no one likes the idea of their Discord messages being saved in public files online," and "It should be kept in mind that many Discord users are children."
- **Research team**: Said the purpose of distribution was research by other teams and bot training, and that anonymization had been applied.
- **Discord**: No official statement confirmed at the time of publication. It had previously considered legal action against Spy Pet (April 2024, an operator that monitored over 600 million Discord users).
- **Industry debate**: The accountability of generative-AI companies for where their training data came from (the EU AI Act's training-data documentation requirements, and guidance such as the US NIST AI RMF), and how the combination of a public API, terms, and an anonymization claim is positioned under the GDPR and national privacy laws, became points of debate.

## 6. Sources

- **404 Media**: "Researchers Scrape 2 Billion Discord Messages and Publish Them Online" (2025-05-22, initial reporting, including technical description of violations of Discord's terms of service and developer policy) — https://www.404media.co/researchers-scrape-2-billion-discord-messages-and-publish-them-online/
- **arXiv research team paper**: "Discord Unveiled: A Comprehensive Dataset of Public Communication (2015–2024)" (2025, 15-researcher team at the Federal University of Minas Gerais in Brazil, primary source for the dataset distribution) — https://arxiv.org/pdf/2502.00627
- **Discord developer policy** official (the basis for the ML / AI training use ban and anti-scraping clause) — https://support-dev.discord.com/hc/ja/articles/8563934450327
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
