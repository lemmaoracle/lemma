---
brief_no: 77
title: "IDMerit：約10億件の KYC データ「露出」が係争に — 認証なしの公開 DB は見つかったが、それが誰の管理下のデータかを、いまも誰も証明できない（Cybernews 報道・IDMerit 否認）"
title_en: "IDMerit: the disputed billion-record KYC exposure — an unsecured database was found, but no one can prove whose data it was (Cybernews report, IDMerit denial)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation", "052-discord-age-verification-id-leak"]
status: published
version: "2.0"
og_lead_ja: "IDMerit 10億件露出の係争 — 帰属を誰も証明できない"
og_lead_en: "IDMerit's disputed billion-record exposure — custody no one can prove"
gap_detected: "Cybernews found the unauthenticated MongoDB and reported it; the database was closed the next day."
gap_missing: "No party — the companies, the researchers, or regulators — can verifiably prove whose custody the exposed data was under, or on what contract and legal basis it was held."
gap_fix: "Attach verifiable provenance to every KYC record — custodian, legal basis, contract layer — so that when an exposure surfaces, attribution and legality are settled by evidence, immediately."
---

> **Revision (v2.0 / 2026-07-03)**: The original version presented this as a confirmed exposure, following the Cybernews report. This version adds IDMerit's formal denial, presents both accounts, and reframes the analysis around the structural point: no one can verifiably prove custody of the exposed data. Figures that have not been independently verified are flagged.

---

## 1. TL;DR

On 2026-02-18, Cybernews reported that an unauthenticated MongoDB had been publicly reachable, exposing what it says were about a billion sensitive personal records linked to KYC provider IDMerit (out of 3+ billion total records, across 26 countries, ~1TB — all Cybernews's claims, unverified). IDMerit denies it outright: it says it does not own, control or store customer data, found no exposure, vulnerability or unauthorized access, and suspects a ransom scheme after being asked for money in exchange for the incident report. The heart of this case is not the shouting match over whether a breach happened — it is that **no one can verifiably prove whose custody the exposed database was under**. Detection worked; proof of attribution does not exist. A high-purity example of the detection-versus-proof gap.

---

## 2. What happened

- **Report / discovery**: Cybernews researchers found the unauthenticated MongoDB on 2025-11-11 and notified IDMerit; the database was closed the next day. Public disclosure came on 2026-02-18
- **Cybernews's claims (unverified)**: of 3+ billion total records, roughly one billion contained sensitive personal data — names, addresses, dates of birth, national ID numbers, phone numbers, emails, gender, carrier metadata, and **KYC / AML verification logs** — across at least 26 countries, about 1TB, concentrated in the US, Mexico, the Philippines, Germany and Italy (reported figures: ~203M US, ~124M Mexico)
- **IDMerit's denial (formal response carried by Biometric Update)**: it is a SaaS company that "does not own, control or store customer data"; a comprehensive review of software, security controls, configuration and logs "identified no exposure, vulnerability or unauthorized access"; the data in question came from **independent data sources**, whose own reviews also found no breach; and when it requested the incident report, "the response was a demand for money," which it takes as a sign of a ransom-related scheme
- **Attribution was never firm**: even follow-on coverage (Fox News and others) describes the database as one researchers *believe* belongs to IDMerit
- **The actual dispute**: whether the database belonged to IDMerit, to an independent data source, or to some layer of the contracts between them **cannot be settled by any verifiable provenance or custody chain** — so neither the exposure claim nor the denial can be proven

The subject here is exposure-plus-unattributability, not proven abuse. Separating the undisputed core from the dispute:

1. **Undisputed (configuration)**: a database without authentication was reachable on the public internet — reachability equaled readability
2. **Undisputed (contents)**: it held a large volume of personal data described as KYC-related
3. **Disputed from here on**: who owned and operated the database — IDMerit, an independent data source, a subcontractor — cannot be established by externally verifiable evidence
4. **No provenance**: the data's legal basis and origin (consent, acquisition grounds, contract layer) cannot be reconstructed after the fact, because no provenance travels with it
5. **Result**: whether there was a breach, who is responsible, and how far the damage extends all remain hostage to self-attestation — and the denying side cannot prove its denial either

---

## 3. Timeline — disclosure and response

- 2025-11-11: Cybernews finds the unauthenticated MongoDB and notifies IDMerit
- 2025-11-12: the database is closed
- 2025-11 → 2026-02: ~99 days pass between discovery and public disclosure (a gap that is itself an issue)
- 2026-02-18: Cybernews publishes; Fox News, Panda Security and others follow
- Late 2026-02: IDMerit issues its denial. Industry outlets such as Biometric Update report the story as a **dispute**, not an established fact. A cluster of near-identical "fake news" pieces echoing IDMerit's rebuttal also appears, mostly on KYC-vendor blogs, without independent verification

> Note: record counts, country breakdowns and data contents all rest on Cybernews's claims and have not been independently verified. IDMerit's denial is equally unaccompanied by externally verifiable evidence. This Brief takes no position on which account is true; its subject is the structure in which neither side can prove its claim.

The response and industry movement after disclosure:

- **Cybernews** maintains its findings were legitimate and the database was downloadable by anyone
- **IDMerit** denies any breach, points to independent data sources, and alleges a ransom motive behind the report
- **Industry press**: Biometric Update and peers cover the story as a dispute. A set of near-identical pieces branding the report "fake news" appeared on KYC-vendor blogs and similar outlets — these too offer no independent verification, and so prove nothing either way
- **Regulatory angle**: opaque custody chains themselves complicate notification duties, supervision and liability allocation. The case is pushing the KYC / AML conversation from point-in-time verification toward provenance that travels with the data

---

## 4. Why it wasn't stopped

The failing primitive is the **absence of verifiable custody attribution**. KYC / AML operations handle bundles of attributes and provenance — whose data, on what legal basis, under which contract — but nothing proves custody, so the moment an exposure is alleged, no one can prove whose responsibility it is.

[Brief 013](/critical/briefs/013-coinbase-kyc-insider-breach/) (Coinbase insider KYC leak) and [Brief 086](/critical/briefs/086-sumsub-support-environment-breach/) (Sumsub support-environment breach) were failures of *holding and protecting* KYC data. This case fails one layer earlier: **it cannot even be proven whose custody the data was under.** [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (Wirecard's forged balance attestations) is continuous with it — claims about attributes and attribution circulating unverified. [Brief 052](/critical/briefs/052-discord-age-verification-id-leak/) showed verifiers becoming aggregation points for raw documents; here the uncertainty runs one level deeper — if an aggregation point existed, whose was it?

As KYC / AML and age-verification mandates spread, verification data flows across vendors, independent data sources and subcontractors, multiplying custody boundaries. Until proof travels with custody, every one of those boundaries can reproduce an exposure that no one can attribute.

**Detection worked.** Cybernews found the exposure, reported it, and the database was closed within a day. This Brief does not diminish that.

But detection does not prove attribution. No party can verifiably establish whose custody the exposed data was under, or on what contract and legal basis it was held. So IDMerit's denial and Cybernews's claim run on parallel tracks, and neither the breach, the responsibility, nor the blast radius can be settled. For regulators and auditors the situation is symmetric: even if the denial is true there is nothing to substantiate it, and even if the exposure is real there is no anchor for accountability — **whichever way it falls, the only certainty is the absence of proof.**

---

## 5. What proof would have changed

Pre-execution attestation and verifiable provenance invert this structure. If every KYC record carried a verifiable reference to its custodian, legal basis and contract layer, an exposure could be attributed the moment it surfaced, and disputes over responsibility and legality would be settled by evidence. Detection and proof of attribution are not substitutes but **complements** — only together do they replace the post-hoc shouting match with pre-established attribution.

The lesson precedes the breach question: **without provable custody and provenance, neither accountability nor rebuttal is possible.** If IDMerit's denial is true, no provenance exists to let outsiders verify it; if the exposure is real, the same absence blocks attribution. The stalemate is caused not by anyone's bad faith but by a missing proof layer.

- **Verifiable custody attribution**: attach a verifiable reference to custodian and contract layer to every KYC record, so "whose data" is settled the moment an exposure surfaces
- **Provenance of legal basis**: carve consent, acquisition grounds and retention terms into verifiable provenance, settling legality disputes by evidence
- **Verification without aggregation**: hand over only the independently verifiable conclusion — "this attribute is verified" — so neither verifiers nor data sources become unattributed aggregation points of raw attributes
- **Provable denial**: make "we do not store it" itself a provable statement — the proof layer defends the denying side too

---

## 6. Sources

- **Cybernews (original report)**: “IDMerit data breach: 1 billion records of personal data exposed in KYC data leak” (2026-02-18) — <https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **Biometric Update (carries IDMerit's formal response; covers the story as a dispute)**: “IDMerit disputes report of 1B records exposed in unsecured ID verification database” (2026-02) — <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News (follow-on; attributes the database to IDMerit as what researchers “believe”)**: “1 billion identity records exposed in ID verification data leak” (2026-02) — <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>
- **Panda Security (follow-on)**: “Over one billion customer records belonging to IDMerit users left unprotected online” (2026-02) — <https://www.pandasecurity.com/en/mediacenter/customer-records-idmerit-unprotected/>
- **Fincrime Central (follow-on)**: “IDMerit data breach: 1 billion records of personal data exposed in KYC data leak” (2026-02) — <https://fincrimecentral.com/idmerit-kyc-data-one-billion-records-exposed/>
- **KYC Finland (KYC-vendor blog echoing IDMerit's rebuttal; no independent verification)**: “Why IDMERIT Became a Target for Fake ‘Data of Billions Leaked’ Claims” — <https://www.kycfinland.com/blog/idmerit-became-target-fake-data-billions-leaked-claims/>
- **IDMerit official blog (contemporaneous post; does not address the incident directly)**: “IDMERIT’s Prevent Data Leaks with KYC Compliance Solutions” (2026-02-20) — <https://www.idmerit.com/blog/idmerits-prevent-data-leaks-with-kyc-compliance-solutions/>
- **Reference implementation (GitHub)**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

The facts of this case are disputed between the parties; this document does not adjudicate either side's claims.

References: [“The last layer left in AI-era cyber defense”](https://lemma.frame00.com/blog/detection-is-not-proof/), [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/), [Seal](https://lemma.frame00.com/seal/)
