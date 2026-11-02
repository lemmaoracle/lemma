---
brief_no: 77
title: "IDMerit: about a billion records apparently used for identity checks were reported found in a password-less database, IDMerit denied it, and whose data it was remains unsettled (Cybernews report, IDMerit denial)"
title_en: "IDMerit: about a billion records apparently used for identity checks were reported found in a password-less database, IDMerit denied it, and whose data it was remains unsettled (Cybernews report, IDMerit denial)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["086-sumsub-support-environment-breach", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: published
version: "3.1"
og_lead_ja: "IDMerit 10 億件露出の係争 — 誰のデータかを誰も記録で示せない"
og_lead_en: "IDMerit's disputed billion-record exposure — no one can show whose data it was"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報漏えい事例 · 帰属の係争"
og_kicker_en: "DATA EXPOSURE · DISPUTED CUSTODY"
og_headline_ja: "本人確認のデータが\n公開の DB で見つかった。\n誰のものかは決まらない。\n<accent>約 10 億件（報道の主張）</accent>"
og_headline_en: "Identity-check data was found in an open database. Whose it was is unsettled.\n<accent>About 1 billion records (as claimed).</accent>"
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
  quote: "Finding an open database does not settle whose data it was; without records of custody, notification and responsibility stay undecided."
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "minimize-data"
    item: "Agree by contract whether, where and for how long a vendor stores identity data, and check it against the register"
  - slug: "audit-trail"
    item: "Record which data is held, under whose custody, and where"
impact: "Reported exposure of about 1 billion records; custody disputed (figures unverified)"
takeaway: "Record, before placing data, whose custody it is in and under which contract, so you can answer from records when challenged."
self_check: "If someone said your users' data had been found exposed, could you answer from records whether it was in your custody?"
countries: ["us"]
---

> **Revision (v3.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

> **Revision (v3.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Cybernews's article (archived) and IDMerit's statement were re-read. Added: IDMerit acknowledged that ports associated with independent data sources "could have been open"; Cybernews's note (the finder was an outside contributor, and it learned of the payment exchange later); and the US class action's filing and dismissal. Sources suspected of being AI-generated, and a network of KYC blogs of unclear ownership, were removed. v2.0 (2026-07-03) had already recast the first version, which treated the exposure as established, as a dispute.

## 1. Summary

IDMerit denied that it owns, controls or stores customer data or the data held by independent data sources, and said there was no exposure in its own environment. It did, however, acknowledge that certain ports associated with independent data sources could have been open. Cybernews's basis for attribution was clues such as collection names and its team's belief; neither side has published records showing who owned the database. <strong>If you cannot show from records whose custody found data was in, closing the database does not settle who must notify, or who is responsible.</strong>

## 2. What got through

- **What got through**: Personal data apparently used for identity verification was placed in a password-less MongoDB database and kept readable from the internet (per Cybernews). Whether the party that placed it was IDMerit or a data source is disputed.
- **What was stopped**: The database was closed the day after the researcher's notification (November 12, 2025).
- **What reached the receiving side**: In general, identity-check data flows across vendors, data sources and the links between them. When an open database is found, whose custody it is in cannot be told from the database itself.
- **Not disclosed**: Records, such as hostnames, that directly identify the database's owner; how the ports IDMerit acknowledged could have been open relate to the database that was found; any regulator finding. The figures and contents are Cybernews's claims and have not been independently confirmed.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever places data checks, before placing it, whose custody the data is in and under which contract it was entrusted, against the ledger kept by the party that entrusted it, and records where it was placed.

- **Who approves**: The party that entrusted the data (such as a financial institution that outsources identity checks). For the vendor and the data sources beyond it, it sets by contract which data may be stored (or not) and where, and keeps that in a ledger. It does not rely on the vendor's own "we don't store it" statement.
- **Where it is checked**: The mechanism that places and stores data (the procedures that create or copy a database). It refuses to place data under a custodian or location that is not in the ledger.
- **What is recorded**: For each set of data, who controls it, the basis it was entrusted on (the contract), and where and for how long it was placed, kept in a form that can be shown to a third party later, so that you can answer from records whether it was yours when challenged.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before data is placed, whose custody and which contract it falls under against the ledger, and keeping a record. Detection means noticing after an open database is found. The dates below are when the researcher, Cybernews or the court confirmed or disclosed a point, not when data was placed in the database.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before placing, check whose custody and which contract against the ledger</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The database was closed,<br>but whose it was stays unsettled</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>A researcher finds it and gets it closed</div>
<div class="rx-g g1"><div class="t">2025-11-11</div><b>Researcher finds the database</b></div>
<div class="rx-g g2"><div class="t">11-12</div><b>Database closed</b></div>
<div class="rx-g g3"><div class="t">2026-02-18</div><b>Cybernews publishes</b></div>
<div class="rx-g g4"><div class="t">06-03</div><b>Class action dismissed</b></div>
</div>
</figure>

Detection worked, and the database was closed the day after notification. But "an open database existed" and "whose custody the data was in" are separate facts, and without records neither the side denying it nor the side reporting it could show the second. A similar case, where personal data was left outside the core, is [Sumsub](/critical/briefs/086-sumsub-support-environment-breach/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that places and stores data.** It does not look for intrusions; before the data is placed, it checks the custodian and contract against the ledger and keeps that record in a form a third party can verify later.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Financial institutions, payment and crypto businesses that outsource identity checks by API. Users' data also reaches the data sources beyond the vendor.
- **Operation · Lookup & data access**: Querying outside data sources about users for identity checks. Each query moves data across organisations.

### Current controls vs Lemma

The route in this case is column 1 (placing and storing data), but who placed it has not been disclosed. Column 2 is deciding whose data it is after an open database is found, which is the heart of this dispute. Column 3 is storage at the data sources beyond the vendor; it is close to the ports IDMerit acknowledged could have been open, but their relation to the database found has not been disclosed.

| Control | Placing and storing data | Identifying the owner after an open database is found | Storage at data sources beyond the vendor |
| --- | --- | --- | --- |
| The vendor's "we don't store it" | Partial | Not relevant | Not effective |
| Data-processing contracts (storage, location) | Partial | Not effective | Partial |
| Checking databases' exposure settings | Not relevant | Not effective | Not relevant |
| Discovery and reporting by researchers | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

The vendor's statement can account for the vendor's own environment, not the data sources beyond it. Contracts, even when set, do not settle a dispute without records outsiders can check. Checking exposure settings finds open databases, but not whose they are. Researchers' discovery and reporting got the database closed the next day, but whose it was was never settled. Lemma checks custodian and contract against the ledger before placing, and keeps a record you can answer from when challenged.

Note: Lemma's check works only when it is built into the mechanism that places and stores data and the ledger is managed apart from the party placing the data. Records do not settle a dispute if the records themselves can be falsified, so they must be kept in a form that can be checked independently of the parties. Asking for records from data sources beyond the vendor also makes contract negotiations heavier. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in an organisation that outsources identity checks

- Can you name the data sources your vendor queries and where data is stored?
- Do you confirm your vendor's "we don't store it" with records, not just the statement?
- If told your users' data had been found, could you answer from records whether it was in your custody?

## 5. Facts and timeline

- **Who**: IDMerit, based in California, which connects to 440+ data sources in 180+ countries to provide identity verification by API (per the company).
- **Discovery**: An outside researcher working with Cybernews found a password-less MongoDB database on November 11, 2025. It was closed the day after notification, on November 12. Publication came on February 18, 2026.
- **Claimed scale (unverified)**: About 3 billion records; about 1 billion broken down by country and said to contain sensitive personal data, with the rest likely logs. About 1TB, 26 countries; about 203 million in the US and 124 million in Mexico, among others.
- **Data types (claimed)**: Names, addresses, dates of birth, national ID numbers, phone numbers, email addresses, gender, telecom metadata and more.
- **Basis for attribution**: Cybernews wrote that "our team believes the exposed database belongs to IDMerit", citing clues such as collection names in some countries ("idmtelco"). It did not publish hostnames or similar evidence directly identifying the owner.
- **IDMerit's denial**: It does not own, control or store customer data or data held by independent data sources. Its review found no exposure, vulnerability or unauthorised access in the IDMerit environment. It did acknowledge that certain ports associated with independent data sources could have been open, potentially exposing databases. It said that when it asked for the report it was asked for money, and suspected a ransom motive.
- **Cybernews's note**: The finder was an outside contributor, and Cybernews did not know until February 26 about the exchange between the finder and IDMerit over payment for the findings. Its internal researchers reviewed the technical material and found the findings legitimate.

### Timeline

- **2025-11-11**: A researcher finds the password-less database and reports it.
- **2025-11-12**: The database is closed.
- **2026-02-18**: Cybernews publishes. The next day it retitles the piece "IDMerit data breach" and rewrites the database as "owned by IDMerit".
- **2026-02-20**: Biometric Update publishes IDMerit's denial.
- **2026-02-26**: Cybernews learns of the payment exchange between the finder and IDMerit (per its note).
- **2026-03-11**: A class action against IDMerit is filed in the US District Court for the Southern District of California.
- **2026-06-03**: The plaintiff voluntarily dismisses the case; no ruling was made.

> The figures and contents are Cybernews's claims and have not been independently verified. IDMerit's denial is not backed by records that outsiders can check either. As of October 2026, there has been no regulator finding and no disclosure identifying the database's owner. This Brief does not rule on either side's claims. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Cybernews**: Maintained that the findings were legitimate, and noted that it does not sell fixes.
- **IDMerit**: Around the same time published blog posts on its no-storage design, without referring to the case directly.

## 6. Sources

- **Cybernews (Primary, finder's report)**: "IDMerit data breach: 1 billion records of personal data exposed in KYC data leak" (2026-02-18) — access now restricted; archived 2026-02-22 · <https://web.archive.org/web/20260222075348/https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **US District Court (Primary, court docket)**: Andrizzi v. IDMerit LLC, No. 3:26-cv-01527 (S.D. Cal., filed 2026-03-11, dismissed 06-03) — <https://www.courtlistener.com/docket/72421353/andrizzi-v-idmerit-llc/>
- **US District Court (Primary, complaint)**: Complaint in Andrizzi v. IDMerit LLC (2026-03-11) — <https://storage.courtlistener.com/recap/gov.uscourts.casd.847125/gov.uscourts.casd.847125.1.0.pdf>
- **Biometric Update (Reporting, carries IDMerit's statement)**: "IDMerit disputes report of 1B records exposed in unsecured ID verification database" (2026-02-20) — updated 02-26 · <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News (Reporting, carries IDMerit's statement)**: "1 billion identity records exposed in ID verification data leak" (2026-03-11) — <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)

The facts of this case are disputed between the parties, and this Brief does not rule on either side's claims.
