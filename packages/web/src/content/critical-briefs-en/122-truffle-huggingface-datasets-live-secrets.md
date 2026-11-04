---
brief_no: 122
title: "Hugging Face の公開データセット：学習データに、いまも有効な認証情報が残っていたと報告された(Truffle Security 調査)"
title_en: "Hugging Face public datasets: Training data still held working credentials, researchers report (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2026-06-01
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["079-common-crawl-training-data-live-secrets", "036-commonpool-training-data-pii", "008-discord-scraping"]
status: published
gate: "permission-change"
version: "1.0"
search_title: "Hugging Face の学習データ：生きた鍵22万件の調査"
search_description: "Truffle Security が Hugging Face の公開データセット 7.6PB を走査し、いまも有効な認証情報 221,303 件を見つけたと報告した。何が起きたか、なぜ通知の後も鍵が残るか、対策を整理。"
og_lead_ja: "Truffle Security が Hugging Face の公開データセット 7.6PB を走査し、いまも有効な認証情報 221,303 件を見つけたと報告"
og_lead_en: "Truffle Security reports it scanned 7.6 PB of Hugging Face public datasets and found 221,303 still-valid credentials"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 学習データの認証情報"
og_kicker_en: "AI CASE · SECRETS IN TRAINING DATA"
og_headline_ja: "公開データセットに、\n有効な認証情報が\n残っていたと報告。\n<accent>221,303 件</accent>"
og_headline_en: "Public AI datasets\nheld working keys,\nresearchers report.\n<accent>221,303 still valid.</accent>"
key_figures:
  - value: "221,303"
    label: "Credentials verified as still valid, found across 6,003 datasets (Truffle Security)"
    tone: "alert"
  - value: "7.6"
    unit: "PB"
    label: "Hugging Face public datasets scanned: about 815,000 repositories and 186.9 million files"
  - value: "44%"
    label: "Share of live keys that appeared in more than one dataset; 19,380 appeared in ten or more"
glossary:
  - term: "TruffleHog"
    desc: "Truffle Security's tool for finding credentials in files and repositories. In verification mode it queries each service to see whether a found key still authenticates."
  - term: "Live credential"
    desc: "An API key, token or login that verification confirmed still authenticates."
  - term: "Upstream corpus"
    desc: "A large body of web or code data, such as The Stack or Common Crawl, from which many datasets are derived."
insight:
  slug: "leaked-key-copied-downstream"
  label: "A leaked key is republished with every derivative"
  quote: "Unless the origin and terms of use of data are checked before a dataset is ingested or republished, a key leaked anywhere is republished with every derivative, and removing it from the original data leaves it in the copies."
industries: ["ai", "developers"]
operations: ["account-admin", "disclosure"]
controls:
  - slug: "hold-unverified"
    item: "Do not ingest data for training until its origin and terms of use are confirmed"
impact: "221,303 still-valid credentials remained in public datasets"
takeaway: "In Truffle Security's study, keys that stayed unrevoked after notice had been copied into derivative datasets. Check the origin and terms of use before ingesting or republishing a dataset."
self_check: "Before ingesting a dataset for training or republishing it, do you check its origin and terms of use?"
countries: ["global"]
---

## 1. Summary

According to Truffle Security's study, the Hugging Face platform was scanning public pushes and notifying authors of the keys it found. Even so, many keys stayed unrevoked after notice, and the same keys were copied again and again into datasets derived from upstream corpora. Most of the keys that could be traced had not been leaked by their owners but had been scraped in from someone else's corpus. The study is research, not a report of widespread exploitation. <strong>Unless the origin and terms of use of data are checked before a dataset is ingested or republished, a key leaked anywhere is republished with every derivative, and removing it from the original data leaves it in the copies.</strong>

## 2. What got through

- **What got through**: Uploading data containing valid credentials to public datasets, and republishing it through derivatives and re-uploads. According to Truffle Security, keys leaked on GitHub, the open web, chat logs and elsewhere, entered upstream corpora such as The Stack and Common Crawl, and were republished in each dataset derived from them.
- **What the receiving side gets**: In general, the side ingesting a dataset receives the files and the dataset's name and download count, but not where the data inside came from or on what terms it was published. In general, each service that accepts a key receives the key itself, not who is using it.
- **The key owners**: Of the Hugging Face tokens Truffle Security could trace, about 700 had been scraped in from someone else's corpus; 63 were leaked by the token's own owner. The firm says a notification only helps if someone acts on it, and the rate of action falls well short of 100%.
- **Not disclosed**: Whether the keys found were actually misused (Truffle Security says this is not a report of widespread exploitation). The names of individuals, companies and datasets. The contents of the repositories whose scans did not complete.

## 3. Pre-execution check

The condition that holds whatever the route is this: before a dataset is ingested for training or republished, check the origin and terms of use of its data.

- **Who approves**: The owner of the data's origin. A dataset's name or download count does not stand in for its origin and terms of use.
- **Where the check happens**: Just before a dataset is ingested for training, and just before it is republished as a derivative. Data whose origin and terms of use cannot be checked is not ingested or republished.
- **What remains**: A record of which data went into the dataset under which origin and terms, so that when a key is found later, the derivatives it was copied into can be traced.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the origin and terms of use of data before a dataset is ingested or republished, and keeping a record. Detection means finding keys in data after publication and notifying someone; here, the platform's scanning and notification, and Truffle Security's study, did that.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check data origin and terms of use before ingestion or republication</div>
<div class="rx-zone gapz"><b>What Truffle Security reported</b><span>Keys unrevoked after notice<br>were copied into derivative datasets</span></div>
<div class="rx-zone det"><b>Detection · scanning and notification worked</b>Scan public pushes and notify the author</div>
<div class="rx-g g1"><div class="t">LEAK</div><b>A key leaks on GitHub, the web or in a chat log</b></div>
<div class="rx-g g2"><div class="t">UPSTREAM</div><b>It enters a corpus such as The Stack or Common Crawl</b></div>
<div class="rx-g g3"><div class="t">DERIVATIVES</div><b>Each derivative or re-upload republishes the same key</b></div>
<div class="rx-g g4"><div class="t">2026-06</div><b>Truffle Security publishes its scan results</b></div>
</div>
</figure>

The platform's scanning and Truffle Security's study counted valid keys concretely, but they found them after the datasets had been published and copied. A case where Truffle Security counted valid credentials in a public corpus is [live credentials in Common Crawl](https://lemma.frame00.com/critical/briefs/079-common-crawl-training-data-live-secrets/). The point that being public is not the same as being fit to train on echoes [personal data in training sets](https://lemma.frame00.com/critical/briefs/036-commonpool-training-data-pii/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before a dataset is ingested or republished.** It does not search data for keys or revoke keys; it checks the origin and terms of use of the data before ingestion.

### Industries and operations to watch

- **Industry · AI**: Organizations that train models on public datasets, or that publish or redistribute datasets.
- **Industry · Developers & agent operations**: Developers who issue and use API keys and tokens. A leaked key can be copied into datasets its owner does not know about.
- **Operation · Disclosure & data release**: Publishing or republishing collected data as a dataset.
- **Operation · Accounts & permissions**: Issuing and revoking keys.

### Current controls vs Lemma

Column 1 is finding keys and notifying someone, column 2 is making keys unusable, and column 3 is ingesting or republishing a dataset. In Truffle Security's account, column 1 worked, but many keys were never revoked and kept being copied through column 3.

| Control | Finding and notifying keys | Revoking keys | Ingesting or republishing a dataset (origin and terms of use) |
| --- | --- | --- | --- |
| Secret scanning of public pushes, with author notification | Partial | Partial | Not relevant |
| Auto-revocation of Hugging Face tokens in Enterprise organizations | Partial | Partial | Not relevant |
| **Lemma (pre-execution check)** | Not relevant | Not relevant | Effective |

Scanning and notification find keys that were pushed and tell the author, but for keys scraped in from someone else's corpus, the author is not the key's owner. Revocation moves forward only when the person notified acts. Auto-revocation is limited to Hugging Face tokens in Enterprise organizations. Neither decides whether a dataset may be ingested. Lemma checks the origin and terms of use of data before ingestion or republication. It does not find keys, revoke them, or delete data.

Note: Lemma's check works only when it is built in just before a dataset is ingested or republished and the data's origin and terms of use are issued and managed separately from the collector. Data that has an origin and terms of use passes this check even if it contains keys. Finding and revoking leaked keys is the job of secret scanning and the key owner's own process; Lemma does not replace them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm about the datasets you use for training or distribution, and about your own keys

- Do you select datasets to ingest by a criterion other than their name or download count?
- Do you record which data went into a dataset under which origin and terms?
- When you are told one of your keys was found in public data, have you decided who carries it through to revocation?

## 5. Facts and timeline

- **Target**: Every public dataset on Hugging Face: about 815,000 repositories, 186.9 million files and 7.6 PB, about nineteen times Truffle Security's previous largest scan (~400 TB).
- **Method**: Parquet, Arrow, JSONL, archives and binaries were flattened into scannable text and TruffleHog was run in verification mode, Truffle Security reports.
- **What was found**: 221,303 still-valid credentials across 6,003 datasets. One of them could reach about 393 GB of personal data (by the firm's estimate, about 3.7% of the world's population), the firm reports.
- **Breakdown**: 349 GitHub personal access tokens (223 with full repo write, 130 able to rewrite CI, 112 with `admin:org`, 110 able to publish packages), 318 Docker Hub tokens, and 787 Hugging Face tokens (237 with write, 70 org-admin). 8,557 GCP service-account keys (3,811 projects), 8,594 working database logins, and 11,496 AI provider keys (1,210 datasets; OpenAI, Azure OpenAI, Anthropic, Gemini, Groq and others). npm and PyPI were checked specifically and returned no valid keys.
- **Replication**: 44% of live keys appeared in more than one dataset, and 19,380 in ten or more. In one reported example, an Infura key pasted once into a ChatGPT conversation passed through the WildChat chat-log dataset and was copied into 1,131 datasets across 10,162 file locations.
- **Impact**: Inference that could be run with the leaked AI provider keys is estimated at no less than about $920,000 a year (Truffle Security).
- **Platform measures**: Hugging Face already scans public pushes with TruffleHog and notifies the author on detection. For Enterprise organizations, a Hugging Face token pushed to a public repo or bucket is auto-revoked on the spot.

### Timeline

- **2024-09-04**: Hugging Face announces secret scanning through its partnership with TruffleHog.
- **Before publication**: Truffle Security sends the highest-impact findings (including the exposure behind the ~393 GB of personal data) to the affected parties and providers first, and holds publication until the most critical have confirmed receipt.
- **2026-06-01**: Truffle Security (Dylan Ayrey and the firm's research team) publishes its findings.

> This is research, not a report of widespread exploitation. No individuals, companies or datasets are named. Valid keys were verified against each provider, and the figures are verified ones. Reach was checked from metadata only; no data was read, copied or modified. About 670,000 of the roughly 815,000 target repositories were scanned to completion, so the figures are a lower bound for that subset. The counts and the notification picture come from Truffle Security's report. This Brief does not blame key owners or the platform. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **Hugging Face**: CTO Julien Chaumond contributed native storage-bucket scanning support to TruffleHog.
- **Truffle Security**: Says a scan after that contribution has surfaced a large volume of new keys, and plans a follow-up report.

## 6. Sources

- **Truffle Security (primary, the research itself)**: Dylan Ayrey, "Scanning 7.6 Petabytes of HuggingFace Training Data for Secrets" (2026-06-01) — <https://trufflesecurity.com/blog/scanning-7-6-petabytes-of-ai-training-data-for-secrets>
- **Hugging Face (primary, response)**: "Secrets Scanning" (Hub documentation) — <https://huggingface.co/docs/hub/en/security-secrets>
- **Hugging Face (primary, partnership)**: Luc Georges, "Hugging Face partners with TruffleHog to Scan for Secrets" (2024-09-04) — <https://huggingface.co/blog/trufflesecurity-partnership>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
