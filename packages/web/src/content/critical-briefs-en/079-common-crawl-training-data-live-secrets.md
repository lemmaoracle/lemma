---
brief_no: 79
title: "Common Crawl：LLM の学習に使われる公開コーパスに、約1.2万件の「生きた」認証情報が混入していた — 学習データの来歴が取り込みの前に検証されない構造（Truffle Security）"
title_en: "Common Crawl: about 12,000 live credentials embedded in a public corpus used to train LLMs — training-data provenance not verified before ingestion (Truffle Security)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["code-provenance", "data-provenance"]
incident_date: 2025-02-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["036-commonpool-training-data-pii", "008-discord-scraping", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "Common Crawl の学習コーパスに約 1.2 万件の「生きた」認証情報が混入"
og_lead_en: "Common Crawl: ~12,000 live credentials embedded in an LLM training corpus"
gap_detected: "Truffle Security's scan detected about 12,000 live credentials, and outreach to affected vendors plus the revocation/rotation of thousands of keys were carried out."
gap_missing: "There was no layer to prove, before ingestion, what a corpus contains and under what provenance and consent it sits, and after-the-fact scanning and revocation could not undo the propagation into trained models."
gap_fix: "Rather than asking whether it is public, independently verify with Lemma the provenance and composition of a corpus (origin, consent, absence of known dangerous material) before ingestion, and prevent it up front."
---

## 1. TL;DR

Truffle Security scanned the December 2024 archive of Common Crawl (267 million pages, 400 TB) — a public corpus widely used to train LLMs — and detected about 12,000 (11,908) live credentials: API keys, passwords, and tokens that actually authenticate successfully. Keys for AWS, Mailchimp, Slack, GitHub and others were included, and 219 distinct secret types were confirmed. 63% of the secrets found were duplicated across multiple pages; one WalkScore API key appeared 57,029 times across 1,871 subdomains. Common Crawl is used to train models from OpenAI, Google, Meta, Anthropic, DeepSeek and others, showing that live credentials and insecure code can become training material as-is. What a corpus contains (its provenance) was not verified before ingestion. After-the-fact scanning and revocation worked, but there was no layer to prove the provenance of training data before ingestion.

---

## 2. What happened

- **Target**: the December 2024 archive of Common Crawl (267 million web pages, 400 TB), used to train many LLMs including those from OpenAI, Google, Meta, Anthropic, and DeepSeek
- **Findings**: Truffle Security scanned it with TruffleHog and detected about 12,000 (11,908) live credentials. "Live" refers only to those confirmed by automatic verification to actually authenticate successfully
- **Contents**: AWS root keys, Mailchimp API keys, Slack webhooks, GitHub tokens, and more; 219 distinct secret types were confirmed, the most common being Mailchimp API keys
- **High duplication**: 63% of the secrets found were duplicated across multiple pages; one WalkScore API key appeared 57,029 times across 1,871 subdomains
- **Response**: Truffle Security contacted affected vendors and helped revoke/rotate thousands of keys
- **Context**: ingesting training data without verifying its provenance and composition before ingestion shows, from the credential side, the same structure that [Brief 036](/critical/briefs/036-commonpool-training-data-pii/) (PII in CommonPool) showed — "public ≠ consent" and "after-the-fact filters cannot be comprehensive"

The incident came together as the following chain.

1. **Ingestion without provenance verification**: collect "technically public" web data into a training corpus without verifying, before ingestion, what it contains (its provenance and composition)
2. **Live credentials enter**: about 12,000 API keys, passwords, and tokens that actually authenticate successfully enter the corpus; many are duplicated across multiple pages, increasing the density of contamination
3. **Propagation to training**: LLMs that use the corpus for training can take live credentials and insecure code (hardcoded credentials) as training material as-is
4. **Limits of after-the-fact filtering**: even if scanning/removal is attempted after ingestion, comprehensively removing them from a massive corpus is hard, and the contamination can remain in the trained artifact
5. **Reactivity of remediation**: even revoking/rotating keys after discovery cannot fully undo what has already entered training and distribution paths

---

## 3. Timeline — disclosure and response

- 2024-12: Common Crawl collects the archive in question (267 million pages, 400 TB)
- 2025-02: Truffle Security publishes the scan results, reporting about 12,000 live credentials, 219 distinct secret types, and 63% duplication
- 2025-02 onward: Truffle Security contacts affected vendors and helps revoke/rotate thousands of keys

> Note: the facts in this Brief are based on Truffle Security's research report and established media (BleepingComputer / The Hacker News / IT Pro, etc.). Counts and duplication rates are values as of the time of the research, and their sources are made explicit. This Brief is not a condemnation of any particular user of the training data; it focuses on the structure in which the provenance of training data is not verified before ingestion.

The response and industry movement after disclosure:

- **Truffle Security**: published the scan results, making visible about 12,000 live credentials, 219 distinct secret types, and 63% duplication; contacted affected vendors and helped revoke/rotate thousands of keys
- **Users of the training data**: for businesses that use Common Crawl for training (OpenAI, Google, Meta, Anthropic, DeepSeek, etc. are cited as users), the issue is that ingestion without provenance verification can bring insecure code and credentials into training
- **Regulatory trends**: the EU AI Act's framework for general-purpose AI models moves toward publishing training-data summaries and copyright-compliance policies, with obligations phased in during 2026. Explainability of the provenance and composition of training data is increasingly demanded institutionally
- **Cross-industry**: the limits of ingesting without questioning provenance, consent, or safety on the grounds that data is "public" have now been shown from the credential side following PII (036), and pre-ingestion provenance verification is being discussed as a requirement of training infrastructure

How to "verify and prove the provenance and composition of training data before ingestion" is expected to be discussed as an essential requirement of AI training-infrastructure design, prompted by this case and [Brief 036](/critical/briefs/036-commonpool-training-data-pii/).

---

## 4. Why it wasn't stopped

The central **failure primitive is "what a training corpus contains (its provenance/composition) is not verified before ingestion"**. Being "public" does not mean it "may be used for training" or that it "contains nothing dangerous," yet because it was ingested without provenance verification, something clearly dangerous — live credentials — entered the corpus. As secondary, `code-provenance` is added because the contaminants are credentials and insecure code, and `data-provenance` because the origin and consent of the data are not verified.

This is the sibling of [Brief 036](/critical/briefs/036-commonpool-training-data-pii/) (training data in CommonPool contaminated with IDs, résumés, faces), and this case is its credential version. Where 036 showed "public ≠ consent" from the privacy (PII) side, this case shows the same "ingestion without provenance verification" from the security (live credentials) side. It shares the same root with [Brief 008](/critical/briefs/008-discord-scraping/) (Discord scraping via the public API), in the structure of mass ingestion without questioning provenance or consent on the grounds that data is "public." Furthermore, the fact that post-discovery key revocation only works after the fact connects to [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/) (Google API key revocation lag) in that **the timing of remediation leaves an irreversible window**.

This case is not an attack incident but a trust-layer risk event for AI training infrastructure. Without a layer to verify and prove the provenance of training data before ingestion, dangerous material (credentials, non-consented PII, poisoned code) is ingested into the trained artifact for the sole reason that it is "public," and after-the-fact filters cannot cover it. The trust of the trained artifact rests on whether the corpus's provenance can be proven before ingestion.

Truffle Security's scanning and detection, outreach to affected vendors, and support for key revocation/rotation are indispensable for grasping and reducing harm; this Brief does not dispute that role. The live credentials were detected, and a substantial number were revoked.

But after-the-fact scanning and revocation do not change the design itself of "whether, before ingestion, the provenance and composition are verified." In this case, live credentials entered a corpus ingested without provenance verification and could already ride the training and distribution paths. What was missing is a layer to prove, before ingestion, "what this corpus contains and under what provenance and consent it sits" — a different track of verification from post-ingestion scanning. If scanning comes after ingestion, the possibility that it has already propagated into trained artifacts cannot be undone by rotation. As evidence in training-data audit and compliance (publishing training-data summaries, etc.) that "this trained artifact is based on a corpus whose provenance contains no dangerous or non-consented data," the mere fact that a scan was performed after the fact does not amount to a pre-ingestion record of provenance.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design that confirms, before a corpus is ingested for training, its provenance and composition (origin, consent, absence of known dangerous material) as an independently verifiable proof. If the proof says "provenance unknown," "no consent," or "contains a known secret," ingestion of that corpus is held or excluded up front. After-the-fact scanning (detection) and pre-ingestion proof of provenance (proof) are not substitutes but **complements**, and only when the two overlap can a trained artifact be placed confidently into operations and products.

Against the detection–proof gap exposed here (the provenance and composition of training data are not verified or proven before ingestion), Lemma proposes a design that handles provenance in an independently verifiable form before data is ingested for training.

- **Pre-ingestion proof of provenance**: confirm a corpus's origin, consent, and absence of known dangerous material as an independently verifiable proof before ingestion, and hold or exclude ingestion if it cannot be confirmed
- **Tamper-resistant record of provenance**: record which data was used for training, under what provenance and consent, as a record that cannot later be tampered with, making the composition of the trained artifact explainable
- **Designing in "public ≠ ingestible"**: do not treat "technically public" as the basis for ingestion; place proof of provenance, consent, and safety as the precondition for ingestion
- **Verifiability of remediation**: make it verifiable that revocation/exclusion took effect reliably when contamination is found, narrowing the gap of after-the-fact remediation

Against the design philosophy of the verifiable-origin category — "public ≠ proof of provenance" — this case is an instance in which the failure mode it anticipates surfaced as the entry of live credentials into a training corpus. Detection (after-the-fact scanning and revocation) works to reduce harm, and pre-ingestion proof of provenance (proof) works to establish the trust of the trained artifact — each complementary to the other.

---

## 6. Sources

- **Truffle Security (research source)**: “Research finds 12,000 'Live' API Keys and Passwords in DeepSeek's Training Data” (2025-02) — <https://trufflesecurity.com/blog/research-finds-12-000-live-api-keys-and-passwords-in-deepseek-s-training-data>
- **BleepingComputer**: “Nearly 12,000 API keys and passwords found in AI training dataset” (2025-02) — <https://www.bleepingcomputer.com/news/security/nearly-12-000-api-keys-and-passwords-found-in-ai-training-dataset/>
- **The Hacker News**: “12,000+ API Keys and Passwords Found in Public Datasets Used for LLM Training” (2025-02) — <https://thehackernews.com/2025/02/12000-api-keys-and-passwords-found-in.html>
- **IT Pro**: “12,000 API keys and passwords were found in a popular AI training dataset” (2025-02) — <https://www.itpro.com/security/12-000-api-keys-and-passwords-were-found-in-a-popular-ai-training-dataset-experts-say-the-issue-is-down-to-poor-identity-management>
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/#provenance)
