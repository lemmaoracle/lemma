---
brief_no: 65
title: "北海道の国立病院：廃棄を委託した電子カルテの HDD の一部が破砕されないまま流通し、ネットオークションで落札された(NHO 北海道医療センター・北海道がんセンター) — 委託した媒体が確かに壊されたかを、委託元が 1 台ずつ確かめる層が無い"
title_en: "NHO Hokkaido hospitals: some hard drives from retired electronic medical record systems, sent out for destruction, were never shredded and were won at online auction (NHO Hokkaido Medical Center, Hokkaido Cancer Center) — No layer lets the client confirm, drive by drive, that what it sent was destroyed"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-06-08
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["142-awa-bank-test-environment-repurposed-leak", "151-toppan-sompo-japan-misdirected-zip", "035-boeing-787-inspection-records"]
status: published
version: "2.0"
og_lead_ja: "「破砕したはず」のHDDが中古市場に — 患者18万人分流出（北海道の国立病院）"
og_lead_en: "Drives assumed shredded resurfaced online — 180,000+ patients (NHO Hokkaido)"
layout: "report"
og_kicker_ja: "情報漏えい事例 · 廃棄の不備"
og_kicker_en: "DATA LEAK · IMPROPER DISPOSAL"
og_headline_ja: "壊したはずの\n病院の HDD が\nネットで売られていた。\n<accent>患者約 17.9 万名分</accent>"
og_headline_en: "Hospital hard drives meant to be shredded were sold online.\n<accent>About 179,000 patients.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "≈ 179,000"
    unit: "patients"
    label: "Patients whose data was on the recovered drives (about 170,000 at the Medical Center and 8,800 at the Cancer Center)"
    tone: "alert"
  - value: "33"
    unit: "drives"
    label: "Drives holding medical-record data, found after recovering 90 drives listed online (press)"
  - value: "≈ 1"
    unit: "year"
    label: "From the buyers' report (2025-06) to disclosure (2026-06-08). The delay has not been explained"
glossary:
  - term: "Electronic medical records"
    desc: "Systems that store patients' clinical records electronically, including highly sensitive data such as diagnoses and test results."
  - term: "Physical destruction (shredding)"
    desc: "Crushing or drilling a hard drive so its data can't be read. A different method from wiping with software."
insight:
  slug: "destruction-taken-on-trust"
  label: "Destruction left to the contractor"
  quote: "The client left it to the contractor's work whether the drives it sent were really destroyed, never checking, and undestroyed drives reached the internet through resale."
industries: ["healthcare"]
attack_method: "human-error"
controls:
  - slug: "audit-trail"
    item: "Get photos or records showing each drive was destroyed, and check them"
  - slug: "separate-approval"
    item: "Have the client's staff witness the destruction"
impact: "Drives holding data on about 179,000 patients circulated online"
takeaway: "Nothing let the client confirm, drive by drive, that what it sent for destruction was destroyed."
self_check: "Can you show that each computer or disk you sent for disposal was actually destroyed, one by one?"
countries: ["jp"]
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Facts were re-checked against both hospitals' notices, the contractor's statement, the Ministry of Health's notice and Japanese press. The patient counts in the hospitals' notices (about 170,000 and 8,800) are now given, and figures not in the notices (drive counts, about 186,900 people, up to about 510,000) are marked as press reports. The earlier claim that a paper certificate of destruction was issued without shredding was removed as unverifiable in primary sources. English secondary reports were replaced with Japanese reporting.

## 1. TL;DR

On June 8, 2026, the National Hospital Organization's Hokkaido Medical Center and Hokkaido Cancer Center (Sapporo) disclosed that some hard drives from terminals they had sent out for disposal when replacing their electronic medical record systems had circulated outside without being shredded. They learned of it in June 2025 from two people who had won the drives at online auction (press). The recovered drives held information on about 179,000 patients across the two hospitals.

The contractor, Reprowork, says part of its destruction process may have been inadequate and the drives reached the auction via a recycling dealer. It also explained that drives before and after shredding were kept in identical containers (press). The hospitals did not confirm, drive by drive, that the drives were destroyed.

The buyers' report led to recovery, and the NHO filed a criminal complaint against the contractor. But this was noticed only after the drives had been resold. What failed was the layer that lets the client confirm, drive by drive, that what it sent was really destroyed.

## 2. What happened

- **Who**: The National Hospital Organization (NHO)'s Hokkaido Medical Center and Hokkaido Cancer Center in Sapporo.
- **Outsourcing**: When replacing their electronic medical record systems, they outsourced disposal of retired terminals to an outside waste contractor. According to the press, the Medical Center handed about 750 drives in March 2024, and the Cancer Center about 570 in November 2024, to the same contractor in Ishikari (Reprowork).
- **Circulation**: Some drives circulated outside without being properly shredded (per the hospitals). The contractor says part of its destruction process may have been inadequate and the drives went to online auction via a recycling dealer, and denies any intent (per the company).
- **Discovery**: In June 2025, two people who won drives at online auction reported finding what seemed to be Hokkaido Medical Center data (press).
- **Scale**: The NHO recovered 90 drives listed online, 33 of which held medical-record data (press). The recovered drives held about 170,000 Medical Center patients and about 8,800 Cancer Center patients (per the hospitals). The hospitals also gave a theoretical maximum based on total patient IDs (about 510,000 in the press), saying this does not mean all of them leaked.
- **Data**: Names, patient numbers, dates of birth, addresses, phone numbers, visit dates, departments, admission details, diagnoses, test results, allergies and parts of nursing records. No My Number, bank or card numbers.
- **Misuse**: No misuse or secondary harm has been reported (per the hospitals).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, from disclosures and press</span></div>
<p class="rx-ex-cap">The point to stop it was ②. Had the client confirmed with photos or records that each drive was destroyed, undestroyed drives would have been found before they got out.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Hospitals</div><div class="no">1</div><b>Outsource disposal of terminals retired in a records-system upgrade</b><p>2024.</p></div>
<div class="rx-step crit"><div class="who">Contractor</div><div class="no">2</div><b>Keeps drives before and after shredding in identical containers; some are not destroyed</b><p>Contractor's explanation (press).</p></div>
<div class="rx-step crit"><div class="who">Recycling dealer</div><div class="no">3</div><b>Undestroyed drives are resold and listed at online auction</b><p>Resold without checking (press).</p></div>
<div class="rx-step"><div class="who">Buyers</div><div class="no">4</div><b>Notice the data and contact the hospital</b><p>2025-06.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024-03**: Hokkaido Medical Center outsources disposal of about 750 drives (press).
- **2024-11**: Hokkaido Cancer Center outsources about 570 drives to the same contractor (press).
- **2025-06**: Two online-auction buyers report finding what seems to be hospital data (press).
- **2026-06-08**: The hospitals disclose. The NHO files a criminal complaint with Hokkaido police against the contractor under the Waste Management Act (press). The same day, the Ministry of Health tells prefectures to tighten measures against leaks when disposing of IT equipment.
- **2026-06-09**: The contractor publishes a statement acknowledging its processing may have been inadequate.
- **2026-06-29**: Data on 4,721 patients of another Sapporo hospital (Shin-Sapporo Houwakai Hospital) is reported found among the recovered drives.

> The hospitals' notices (primary) do not cover the contract dates and drive counts, the contractor's name, how it was discovered, the number of drives recovered or the criminal complaint; these rest on press reports and the contractor's statement. The press figure of about 186,900 people (patients and staff) does not match the hospitals' patient counts, and the gap is unexplained. Why it took about a year from discovery to disclosure has not been explained either. As of October 2026, no progress in the police investigation has been disclosed.

### After disclosure

- **Hospitals**: Will make reliable physical destruction on site the rule, require checks by more than one person, and tighten contractor selection and oversight.
- **Ministry of Health**: Told medical institutions to require witnessing of disposal and submission of photos of destroyed media or wipe logs, and to check before contracting whether work will be subcontracted.

## 4. Why it wasn't stopped

This case was not only one contractor's carelessness. Whether the drives were destroyed was left to the contractor's work, and the hospitals had no means of confirming, drive by drive, that they were.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before disposal is treated as done; detection works after a drive is found outside. In between, drives sent out are treated as "should be destroyed".</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Confirm, drive by drive, that media sent out was destroyed</div>
<div class="rx-zone gapz"><b>The gap</b><span>Undestroyed drives were<br>resold and listed online</span></div>
<div class="rx-zone det"><b>Detection layer · noticed by buyers</b>Buyers notice and tell the hospital</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Disposal outsourced</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Some not destroyed</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Sold online</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Buyers notice</b></div>
</div>
</figure>

Detection worked, but it was neither the hospitals nor the contractor that noticed; it was members of the public who bought the drives. "Disposal was outsourced" and "each drive was destroyed" are separate facts, yet the first stood in for the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/) (customer data that should have been deleted left in a test environment past its purpose).

## 5. How to counter this

**Confirm that media sent out was destroyed with records for each drive, not the contractor's word.** The Ministry of Health, too, says to require witnessing of disposal and photos of destroyed media or wipe logs. Even when switching to on-site destruction, recording who destroyed which drive, and when, still matters.

### Industries and operations to watch

- **Industry · Healthcare**: Medical institutions that dispose of large amounts of equipment holding patient data, for example when upgrading record systems. Diagnoses and test results do great harm if leaked.
- **Operation · Equipment disposal**: Outsourcing disposal of PCs and servers. The contractor may subcontract further or resell.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Shredding terms in the contract | Partial | The contractor had agreed to shred, yet some drives were not destroyed. |
| Witnessing disposal | Partial | Witnessed drives can be confirmed, but witnessing hundreds is hard. |
| On-site physical destruction (new measure) | Partial | It avoids relying on a contractor, but without records of who destroyed which drive, the same difficulty remains. |
| Reports from buyers and others | Partial | It led to recovery, but the drives had already been resold. |

### What is needed

1. **Get evidence of destruction for each drive.** Receive each drive's serial number tied to photos after destruction or wipe logs, and match them against the number of drives sent.
2. **Don't treat unconfirmed drives as done.** Drives without complete evidence are not counted as disposed of; ask the contractor. Check before contracting whether work will be subcontracted.
3. **Record what was confirmed.** For each drive, keep who destroyed it, when and how, in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about equipment disposal

- Can you list, by serial number, each device you sent out for disposal?
- For each one, have you received photos of its destruction or wipe logs?
- Do you check before contracting that the contractor won't subcontract or resell?

Note: if the photos or logs themselves are faked, this check passes too. The more devices there are, the more work it takes to confirm each one.

## 6. Sources

- **Hokkaido Medical Center (Primary, hospital notice)**: Apology and report on the handling of personal information (2026-06-08, Japanese) — replaced 06-18 · <https://hokkaido-mc.hosp.go.jp/common/img/index/202608.pdf>
- **Hokkaido Cancer Center (Primary, hospital notice)**: Apology and report on the handling of personal information (2026-06-08, Japanese) — <https://hokkaido-cc.hosp.go.jp/news/nw1_00021.html>
- **Reprowork (Primary, contractor statement)**: Statement on the drives it handled for the two hospitals (2026-06-09, Japanese) — <http://www.reprowork.com/wpc/wp-content/uploads/2026/06/5888a1af3e2d274a353339ee1438c28c.pdf>
- **Ministry of Health, Labour and Welfare (Primary, notice)**: On thorough measures to prevent personal data leaks when disposing of IT equipment (2026-06-08, Japanese) — <https://www.mhlw.go.jp/hourei/doc/tsuchi/T260610G0070.pdf>
- **UHB (Reporting)**: Hard drives sent for shredding found at online auction (2026-06-08, Japanese) — <https://www.uhb.jp/news/single.html?id=59930>
- **NHK (Reporting)**: Possible leak of up to about 510,000 people's data at Hokkaido Medical Center and another hospital (2026-06-08, Japanese) — <https://news.web.nhk/newsweb/na/na-k10015144521000>
- **Kyodo News (Reporting, via Kyoto Shimbun)**: Data on 186,000 patients and others leaked (2026-06-08, Japanese) — <https://www.kyoto-np.co.jp/articles/-/1729121>
- **Hokkaido Shimbun (Reporting, interview with the contractor)**: Drives sold without confirming shredding; contractor cites "a careless mistake" (2026-06-09, Japanese) — <https://www.hokkaido-np.co.jp/article/1322847>
- **Hokkaido Shimbun (Reporting)**: 4,721 patients' data also on leaked drives from Shin-Sapporo Houwakai Hospital (2026-06-29, Japanese) — <https://www.hokkaido-np.co.jp/article/1331135/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
