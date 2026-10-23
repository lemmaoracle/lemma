---
brief_no: 77
title: "IDMerit：本人確認に使われたとみられる約 10 億件がパスワードの無い DB で見つかったと報じられたが、IDMerit は否認し、帰属は確定しないまま(Cybernews 報道・IDMerit 否認) — 見つかったデータが誰の管理下にあったかを、記録で示せる層が無い"
title_en: "IDMerit: about a billion records apparently used for identity checks were reported found in a password-less database, IDMerit denied it, and whose data it was remains unsettled (Cybernews report, IDMerit denial) — No layer can show, from records, whose custody the data was in"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["086-sumsub-support-environment-breach", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: published
version: "3.0"
og_lead_ja: "IDMerit 10 億件露出の係争 — 誰のデータかを誰も記録で示せない"
og_lead_en: "IDMerit's disputed billion-record exposure — no one can show whose data it was"
layout: "report"
og_kicker_ja: "情報漏えい事例 · 帰属の係争"
og_kicker_en: "DATA EXPOSURE · DISPUTED CUSTODY"
og_headline_ja: "本人確認のデータが\n公開の DB で見つかった。\n誰のものかは決まらない。\n<accent>約 10 億件（報道の主張）</accent>"
og_headline_en: "Identity-check data was found in an open database. Whose it was is unsettled.\n<accent>About 1 billion records (as claimed).</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "≈ 1"
    unit: "billion"
    label: "Records said to contain sensitive personal data (Cybernews's claim, unverified). About 3 billion in total"
    tone: "alert"
  - value: "11-11 → 11-12"
    label: "From finding the password-less database to its closure (2025)"
  - value: "Dismissed"
    label: "Class action against IDMerit (filed 2026-03). Ended 06-03 without a ruling"
glossary:
  - term: "Data source"
    desc: "An outside holder of data, such as a telecom or public records, that an identity-verification company queries. Such companies connect to many sources to return a result."
  - term: "Custody"
    desc: "Whose control data is under, and who is responsible for protecting it. Breach notification and liability follow from custody."
  - term: "MongoDB"
    desc: "A widely used database. Depending on its settings, it can be readable from the internet without a password."
insight:
  slug: "custody-unprovable"
  label: "No one can show whose data it was"
  quote: "That an open database existed could be confirmed, but neither the side denying it nor the side reporting it could show from records whose custody the data was in."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "audit-trail"
    item: "Record which data is held, under whose custody, and where"
impact: "Reported exposure of about 1 billion records; custody disputed (figures unverified)"
takeaway: "Nothing could show, from records, whose custody the exposed data was in or under which contract it was held."
self_check: "If someone said your users' data had been found exposed, could you answer from records whether it was in your custody?"
countries: ["us"]
---

> **Revision (v3.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Cybernews's article (archived) and IDMerit's statement were re-read. Added: IDMerit acknowledged that ports associated with independent data sources "could have been open"; Cybernews's note (the finder was an outside contributor, and it learned of the payment exchange later); and the US class action's filing and dismissal. Sources suspected of being AI-generated, and a network of KYC blogs of unclear ownership, were removed. v2.0 (2026-07-03) had already recast the first version, which treated the exposure as established, as a dispute.

## 1. TL;DR

On February 18, 2026, security outlet Cybernews reported that about a billion records of personal data apparently used for identity verification (KYC) (about 3 billion records in total, across 26 countries) had been found in a password-less MongoDB database, and that it belonged to IDMerit. The database was found on November 11, 2025 and closed the day after notification. IDMerit denied it, saying it does not own, control or store customer data or the data held by independent data sources, and that there was no exposure in its environment.

IDMerit did, however, acknowledge that certain ports associated with independent data sources could have been open. Cybernews's basis for attribution was clues such as collection names and its team's belief; neither side has published records showing who owned the database.

The database was closed the day after notification, so detection worked. A class action filed in the US also ended in dismissal without a ruling. What failed was the layer that can show, from records, whose custody the data was in and under which contract it was held.

## 2. What happened

- **Who**: IDMerit, based in California, which connects to 440+ data sources in 180+ countries to provide identity verification by API (per the company).
- **Discovery**: An outside researcher working with Cybernews found a password-less MongoDB database on November 11, 2025. It was closed the day after notification, on November 12. Publication came on February 18, 2026.
- **Claimed scale (unverified)**: About 3 billion records; about 1 billion broken down by country and said to contain sensitive personal data, with the rest likely logs. About 1TB, 26 countries; about 203 million in the US and 124 million in Mexico, among others.
- **Data types (claimed)**: Names, addresses, dates of birth, national ID numbers, phone numbers, email addresses, gender, telecom metadata and more.
- **Basis for attribution**: Cybernews wrote that "our team believes the exposed database belongs to IDMerit", citing clues such as collection names in some countries ("idmtelco"). It did not publish hostnames or similar evidence directly identifying the owner.
- **IDMerit's denial**: It does not own, control or store customer data or data held by independent data sources. Its review found no exposure, vulnerability or unauthorised access in the IDMerit environment. It did acknowledge that certain ports associated with independent data sources could have been open, potentially exposing databases. It said that when it asked for the report it was asked for money, and suspected a ransom motive.
- **Cybernews's note**: The finder was an outside contributor, and Cybernews did not know until February 26 about the exchange between the finder and IDMerit over payment for the findings. Its internal researchers reviewed the technical material and found the findings legitimate.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ①. Had it been recorded, when the data was placed, whose custody it was in and under which contract, the dispute at ④ could have been settled from records.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Someone (disputed)</div><div class="no">1</div><b>Places data apparently used for identity checks in a database</b><p>IDMerit, or a data source?</p></div>
<div class="rx-step crit"><div class="who">Database</div><div class="no">2</div><b>Becomes readable from the internet without a password</b><p>About 3 billion records (claimed).</p></div>
<div class="rx-step"><div class="who">Researcher</div><div class="no">3</div><b>Finds and reports it; the database is closed next day</b><p>2025-11-11 → 11-12.</p></div>
<div class="rx-step crit"><div class="who">Parties</div><div class="no">4</div><b>Claims split over custody, and records can't settle it</b><p>Denial and rebuttal; lawsuit dismissed.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2025-11-11**: A researcher finds the password-less database and reports it.
- **2025-11-12**: The database is closed.
- **2026-02-18**: Cybernews publishes. The next day it retitles the piece "IDMerit data breach" and rewrites the database as "owned by IDMerit".
- **2026-02-20**: Biometric Update publishes IDMerit's denial.
- **2026-02-26**: Cybernews learns of the payment exchange between the finder and IDMerit (per its note).
- **2026-03-11**: A class action against IDMerit is filed in the US District Court for the Southern District of California.
- **2026-06-03**: The plaintiff voluntarily dismisses the case; no ruling was made.

> The figures and contents are Cybernews's claims and have not been independently verified. IDMerit's denial is not backed by records that outsiders can check either. As of October 2026, there has been no regulator finding and no disclosure identifying the database's owner. This Brief does not rule on either side's claims.

### After disclosure

- **Cybernews**: Maintained that the findings were legitimate, and noted that it does not sell fixes.
- **IDMerit**: Around the same time published blog posts on its no-storage design, without referring to the case directly.

## 4. Why it wasn't stopped

This case does not come down to one side being wrong. As identity-check data flows across vendors, data sources and the links between them, neither side could show from records whose custody the database that was found was in.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works when data is placed; detection works after an open database is found. Detection got the database closed, but does not decide whose data it was.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>When placing data, record whose custody and which contract</div>
<div class="rx-zone gapz"><b>The gap</b><span>The database closed,<br>but whose it was stays unsettled</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>A researcher finds it and gets it closed</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Database left open</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Researcher finds it</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Database closed</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Custody disputed</b></div>
</div>
</figure>

Detection worked: the database was closed the day after notification. But "an open database existed" can be confirmed while "whose custody the data was in" is a separate fact, and without records, neither the side denying it nor the side reporting it could show it. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/) (client end-users' contact details left outside the core at an identity-verification vendor).

## 5. How to counter this

**Be able to show, from records, whose custody identity-check data is in and where it is kept.** Identity-verification vendors connect to many data sources, and data flows across organisations. Those who outsource should set out in contracts whether the vendor, and the data sources beyond it, store the data and where, and ask for records. Then, if told your data was found, you can answer from records whether it was yours.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Financial institutions, payment and crypto businesses that outsource identity checks by API. Users' data also reaches the data sources beyond the vendor.
- **Operation · Lookup & data access**: Querying outside data sources about users for identity checks. Each query moves data across organisations.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| The vendor's "we don't store it" | Partial | It can account for the vendor's own environment, not the data sources beyond it. |
| Data-processing contracts (storage, location) | Partial | Even when set, without records outsiders can check, a dispute is not settled. |
| Checking databases' exposure settings | Partial | It finds open databases, but not whose they are. |
| Discovery and reporting by researchers | Partial | The database was closed the next day, but whose it was was never settled. |

### What is needed

1. **Know the data flow beyond your vendor.** Ask the vendor for a list of which data sources it queries and where data is stored, or not.
2. **Set storage and location in contracts and confirm them with records.** If data is not stored, ask for records showing that. If it is, set where and for how long.
3. **Record whose custody and which contract.** For each set of data, keep who controls it and on what basis it was entrusted, in a form that can later be shown to a third party: in other words, as proof. If challenged, you can answer at once whether it was yours.

### Checklist

Three things to confirm in an organisation that outsources identity checks

- Can you name the data sources your vendor queries and where data is stored?
- Do you confirm your vendor's "we don't store it" with records, not just the statement?
- If told your users' data had been found, could you answer from records whether it was in your custody?

Note: records do not settle a dispute if the records themselves can be falsified, so they must be kept in a form that can be checked independently of the parties. Asking for records from data sources beyond the vendor also makes contract negotiations heavier.

## 6. Sources

- **Cybernews (Primary, finder's report)**: "IDMerit data breach: 1 billion records of personal data exposed in KYC data leak" (2026-02-18) — access now restricted; archived 2026-02-22 · <https://web.archive.org/web/20260222075348/https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **US District Court (Primary, court docket)**: Andrizzi v. IDMerit LLC, No. 3:26-cv-01527 (S.D. Cal., filed 2026-03-11, dismissed 06-03) — <https://www.courtlistener.com/docket/72421353/andrizzi-v-idmerit-llc/>
- **US District Court (Primary, complaint)**: Complaint in Andrizzi v. IDMerit LLC (2026-03-11) — <https://storage.courtlistener.com/recap/gov.uscourts.casd.847125/gov.uscourts.casd.847125.1.0.pdf>
- **Biometric Update (Reporting, carries IDMerit's statement)**: "IDMerit disputes report of 1B records exposed in unsecured ID verification database" (2026-02-20) — updated 02-26 · <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News (Reporting, carries IDMerit's statement)**: "1 billion identity records exposed in ID verification data leak" (2026-03-11) — <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)

The facts of this case are disputed between the parties, and this Brief does not rule on either side's claims.
