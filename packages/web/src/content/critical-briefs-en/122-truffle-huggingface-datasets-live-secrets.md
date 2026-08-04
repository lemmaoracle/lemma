---
brief_no: 122
title: "Hugging Face の学習データ 7.6PB に、生きた認証情報が 22 万件超あった — 検出も通知も届いていたのに、鍵は失効されなかった（Truffle Security 調査）"
title_en: "7.6 petabytes of Hugging Face training data held 221,303 live secrets — detected and notified, never revoked (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2026-06-01
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["079-common-crawl-training-data-live-secrets", "036-commonpool-training-data-pii", "008-discord-scraping"]
status: published
version: "1.0"
og_lead_ja: "Truffle Security が Hugging Face 公開データセット7.6PBを走査、生きた認証情報221,303件を検出"
og_lead_en: "Truffle Security scanned 7.6PB of Hugging Face datasets, found 221,303 live secrets"
gap_detected: "Hugging Face already scans public pushes with TruffleHog and emails the author when a verified secret appears — with automatic revocation for Enterprise organizations."
gap_missing: "Notification arrives but revocation does not, so the keys stay live. Once a secret enters training data it is copied into countless derivatives, and revoking the original leaves every copy intact."
gap_fix: "Require the origin and terms of use of data as independently verifiable proof, and block ingestion or republication of data that carries none."
---

## 1. TL;DR

On June 1, 2026, **Truffle Security** published a scan of every public dataset on Hugging Face — 7.6 petabytes across 186.9 million files — and found **221,303 still-valid credentials** across 6,003 datasets. One of them reached roughly 393 GB of personal data, covering what the firm estimates at about 3.7% of the global population. The platform was detecting and notifying all along. **What was missing is the layer that revokes after the notice — and, before that, verifies the provenance of data at ingestion.**

## 2. What happened

- Truffle Security scanned Hugging Face's public datasets end to end, flattening Parquet, Arrow, JSONL, archives and binaries into scannable text and running TruffleHog with verification on: roughly 815,000 dataset repositories, 186.9 million unique files, 7.6PB. That is about nineteen times the firm's previous largest scan (~400TB).
- The result: 221,303 live credentials across 6,003 datasets, including many that let someone push code into other people's environments — 349 GitHub personal access tokens (223 with full repo write, 130 able to rewrite CI workflows, 112 with `admin:org`, 110 able to publish packages), 318 Docker Hub tokens, 237 Hugging Face write tokens and 70 org-admin. npm and PyPI were checked specifically and returned zero live keys.
- Cloud-takeover material surfaced too: 8,557 GCP service-account keys across 3,811 projects, 8,594 working database logins, and 11,496 live AI provider keys across 1,210 datasets (OpenAI, Azure OpenAI, Anthropic, Gemini, Groq and more) — worth at least $920,000 a year in stealable inference.

The exposure becomes permanent through this chain.

1. A credential leaks somewhere — GitHub, the open web, a chat log.
2. It gets vacuumed into an upstream corpus such as The Stack or Common Crawl.
3. Every derivative and re-upload of that corpus republishes the same key. 44% of live secrets appear in more than one dataset; 19,380 appear in ten or more.
4. It is absorbed into training and folded into model weights. Unlike git, there is no history to rewrite.

## 3. Timeline — disclosure and response

- June 1, 2026 — Truffle Security (Dylan Ayrey and the firm's research team) publishes the findings.
- Before publication — the highest-impact findings, including the exposure behind the 393 GB of personal data, went to the affected parties and their providers first, and publication was held until the most critical confirmed receipt.

> This is research, not a report of widespread exploitation. No individuals, companies or datasets are named. Live keys were verified against each provider, and the cited figures are verified ones. Impact was checked from metadata only; no stored data was read, copied or modified. About 670,000 of the roughly 815,000 target repositories finished cleanly, so the numbers are a floor for that range.

Response and industry movement since disclosure:

- Hugging Face already scans public pushes with TruffleHog and emails the author when a verified secret appears. For Enterprise organizations, an HF token pushed to a public repo or bucket is auto-revoked on the spot.
- Hugging Face CTO Julien Chaumond contributed native storage-bucket scanning support to TruffleHog. Truffle says a post-contribution scan has already surfaced a large volume of new keys, with a follow-up to come.
- What the study measured, though, is the gap past that notice — the share of keys that stay live because they were detected and reported but never revoked. Of 763 traceable Hugging Face write and org-admin tokens, 700 arrived scraped in from someone else's corpus; only 63 were self-leaked by the owner.

## 4. Why it wasn't stopped

The failure here is not the absence of detection. Detection and notification both happened. The failure is that keys were not revoked after the notice, and that nothing verified provenance before the data was ingested.

Truffle names the gap directly: a notification only helps if someone acts on it, and the rate of action falls well short of 100%.

> "Detected, notified, but never revoked" is most of why so many of these keys were still live.

Training data is the least revocable leak there is. Git history can be force-pushed away. A training set has no undo. One Infura key, pasted once into a ChatGPT conversation, was captured by the WildChat chat-log dataset and copied into 1,131 datasets across 10,162 file locations; revoking it at the source does nothing about the other 1,130 copies. The leak propagates on its own.

This is the Hugging Face dataset counterpart of the structure shown in [Brief 079](/critical/briefs/079-common-crawl-training-data-live-secrets/) (live credentials in Common Crawl), at greater scale. Publication is not consent to ingestion — the same argument as [Brief 036](/critical/briefs/036-commonpool-training-data-pii/) (personal data in training sets), deepened here by copies that replicate themselves.

## 5. What proof would have changed

Pre-execution proof inserts itself just ahead of the training pipeline. Before ingestion, verify the data's provenance — where it came from, and on what terms it may be published and used — and let nothing without proof pass downstream.

- **Provenance proof before ingestion.** Require proof of origin and terms of use for each item before training on a corpus or republishing it. What has no proof is not ingested.
- **Independent verification of issuer and origin.** Confirm where data came from independently, rather than trusting a dataset's name or download count.
- **Cut contamination downstream.** Reject data lacking provenance, or carrying secrets, before it is copied into derivatives. Once replication starts, revocation only reaches the original.
- **Credential lifecycle.** Treat leaked keys as things to revoke, not hide. Proof binds to the fact of revocation too.

Lemma is not a secret-scanning product, nor one that detects leaks. Its scope is to verify origin and terms of use before data is ingested, and to make ingestion or republication without proof separable. Secret scanning and notification (TruffleHog sweeps, platform auto-revocation, key rotation) and pre-execution proof (an audit trail verifying provenance before ingestion) are complementary, not alternatives. The first finds keys already leaked; the second closes what detection structurally cannot — ingestion and replication that persist after something was detected and reported. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for scope, [Pillar 01 — Verifiable Origin](/pillars/#provenance).

## 6. Sources

- **Truffle Security (primary, the research itself)**: Dylan Ayrey, "Scanning 7.6 Petabytes of HuggingFace Training Data for Secrets" (2026-06-01) — <https://trufflesecurity.com/blog/scanning-7-6-petabytes-of-ai-training-data-for-secrets>
- **Hugging Face (primary, response)**: "Security & secrets" (documentation) — <https://huggingface.co/docs/hub/en/security-secrets>
- **Hugging Face (primary, partnership)**: "Truffle Security × Hugging Face partnership" — <https://huggingface.co/blog/trufflesecurity-partnership>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 01 — Verifiable Origin](/pillars/#provenance) · [Brief 079 (live credentials in Common Crawl)](/critical/briefs/079-common-crawl-training-data-live-secrets/) · [Brief 036 (personal data in training sets)](/critical/briefs/036-commonpool-training-data-pii/)
