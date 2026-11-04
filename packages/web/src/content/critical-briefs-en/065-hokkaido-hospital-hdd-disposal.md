---
brief_no: 65
title: "北海道の国立病院：廃棄を委託した電子カルテの HDD の一部が破砕されないまま流通し、ネットオークションで落札された(NHO 北海道医療センター・北海道がんセンター)"
title_en: "NHO Hokkaido hospitals: some hard drives from retired electronic medical record systems, sent out for destruction, were never shredded and were won at online auction (NHO Hokkaido Medical Center, Hokkaido Cancer Center)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-06-08
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["142-awa-bank-test-environment-repurposed-leak", "151-toppan-sompo-japan-misdirected-zip", "035-boeing-787-inspection-records"]
status: published
version: "2.1"
og_lead_ja: "「破砕したはず」のHDDが中古市場に — 患者18万人分流出（北海道の国立病院）"
og_lead_en: "Drives assumed shredded resurfaced online — 180,000+ patients (NHO Hokkaido)"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報漏えい事例 · 廃棄の不備"
og_kicker_en: "DATA LEAK · IMPROPER DISPOSAL"
og_headline_ja: "壊したはずの\n病院の HDD が\nネットで売られていた。\n<accent>患者約 17.9 万名分</accent>"
og_headline_en: "Hospital hard drives meant to be shredded were sold online.\n<accent>About 179,000 patients.</accent>"
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
  quote: "Once an outsourced disposal job is finished, the client counts the drives as disposed of, and can no longer see whether each one was destroyed."
industries: ["healthcare"]
attack_method: "human-error"
controls:
  - slug: "minimize-data"
    item: "Make data on retired media unreadable before the media leaves your hands"
  - slug: "audit-trail"
    item: "Get photos or records showing each drive was destroyed, and match them against the number sent"
impact: "Drives holding data on about 179,000 patients circulated online"
takeaway: "Nothing had the client check, before counting the drives as disposed of, that each one was destroyed."
self_check: "Can you show that each computer or disk you sent for disposal was actually destroyed, one by one?"
countries: ["jp"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. The re-check of facts done in v2.0 (2026-10-21), against both hospitals' notices, the contractor's statement, the Ministry of Health's notice and Japanese press, carries over as it was.

## 1. Summary

The contractor says part of its destruction process may have been inadequate, and that the drives went to online auction via a recycling dealer. It also explained that drives from before and after shredding were kept in containers of the same shape (press). The hospitals learned of it only after the drives were resold, from the people who won them. <strong>Once an outsourced disposal job is finished, the client counts the drives as disposed of, and can no longer see whether each one was destroyed.</strong>

## 2. What got through

- **What got through**: The completion of disposal of the drives sent out. As the contractor's work ended, they were treated as disposed of. Drives that were not shredded went through a recycling dealer to online auction.
- **What stopped it**: Two auction winners noticed the data and contacted the hospital (June 2025, press). The drives were recovered, and the NHO filed a criminal complaint against the contractor.
- **What reached the receiving side**: In general, what reaches the client from a contractor is a report that processing is done. A record showing each drive was destroyed does not arrive unless it is asked for. If drives from before and after shredding sit in containers of the same shape, they cannot be told apart from outside (contractor's account, press).
- **Not disclosed**: Whether the client had a step to confirm each drive's destruction, why it took about a year from discovery to disclosure, how the police investigation is going, and the drive counts and contract dates (not in the hospitals' notices; they rest on press reports and the contractor's statement).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the client that outsourced disposal checks, for each drive it sent, a record showing it was destroyed (its serial number, and a photo after destruction or a wipe log), against the number of drives sent, before counting it as disposed of.

- **Who approves**: The client (the hospital). It keeps a list of serial numbers of the drives it sent, and approves on receiving a record for each drive, not on the contractor's declaration.
- **Where it is checked**: At one point, before a drive is removed from the asset register as disposed of. Drives without complete records are not counted as disposed of; the contractor is asked. Whether work will be subcontracted is checked before contracting.
- **What is recorded**: Who destroyed which drive, when and how, kept apart from the contractor's report in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before counting drives as disposed of, a record of each drive's destruction against the number sent, and keeping a record. Detection means noticing after the drives turn up outside. The dates below are when each party confirmed or disclosed a point, not when the drives went unshredded.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before counting as disposed of, match a record of each drive's destruction</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unshredded drives circulated outside<br>About 179,000 patients on the recovered ones</span></div>
<div class="rx-zone det"><b>Detection · buyers noticed</b>Auction buyers notice and tell the hospital</div>
<div class="rx-g g1"><div class="t">2024</div><b>Disposal is outsourced</b></div>
<div class="rx-g g2"><div class="t">2025-06</div><b>Buyers contact the hospital</b></div>
<div class="rx-g g3"><div class="t">2026-06-08</div><b>Hospitals disclose</b></div>
<div class="rx-g g4"><div class="t">2026-06-09</div><b>Contractor issues a statement</b></div>
</div>
</figure>

Detection worked, but it was members of the public who won the drives, not the hospital or the contractor, who noticed. A similar case, where customer data that should have been deleted was left in an environment that had finished its purpose, is [the Awa Bank test environment](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that counts drives as disposed of.** It does not look for intrusions; before the drives are counted as disposed of, it checks that a record of each drive's destruction is on hand against the number sent.

### Industries and operations to watch

- **Industry · Healthcare**: Medical institutions that dispose of large amounts of equipment holding patient data, for example when upgrading record systems. Diagnoses and test results do great harm if leaked.
- **Operation · Equipment disposal**: Outsourcing disposal of PCs and servers. The contractor may subcontract further or resell.

### Current controls vs Lemma

The route in this case is column 1 (drives remain unshredded in the contractor's process). Column 2 is the handover to subcontracting or resale, where resale was reported here. Column 3 is where the photos or logs themselves are faked; whether that happened here has not been disclosed.

| Control | Left unshredded in the contractor's process | Handover to subcontracting or resale | Faked photos or logs |
| --- | --- | --- | --- |
| Shredding terms in the contract | Partial | Not relevant | Not relevant |
| Witnessing disposal | Partial | Not relevant | Not relevant |
| On-site physical destruction (new measure) | Partial | Not relevant | Not relevant |
| Reports from buyers and others | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

The shredding terms in the contract did not stop it: the contractor had agreed to shred, yet some drives were not destroyed. Witnessed drives can be confirmed, but witnessing hundreds is hard. On-site destruction avoids relying on a contractor, but without records of who destroyed which drive, the same difficulty remains. Reports from buyers led to recovery, but the drives had already been resold. Lemma does not count drives as disposed of until a destruction record for each is on hand against the number sent.

Note: Lemma's check works only when it is built into the procedure that counts drives as disposed of, and the list of serial numbers of drives sent is kept on the client's side. If the photos or logs themselves are faked, the check passes too. The more drives there are, the more work it takes to confirm each one. Subcontracting and resale are not stopped by receiving records; a separate step before contracting is needed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about equipment disposal

- Can you list, by serial number, each device you sent out for disposal?
- For each one, have you received photos of its destruction or wipe logs?
- Do you check before contracting that the contractor won't subcontract or resell?

## 5. Facts and timeline

- **Who**: The National Hospital Organization (NHO)'s Hokkaido Medical Center and Hokkaido Cancer Center in Sapporo.
- **Outsourcing**: When replacing their electronic medical record systems, they outsourced disposal of retired terminals to an outside waste contractor. According to the press, the Medical Center handed about 750 drives in March 2024, and the Cancer Center about 570 in November 2024, to the same contractor in Ishikari (Reprowork).
- **Circulation**: Some drives circulated outside without being properly shredded (per the hospitals). The contractor says part of its destruction process may have been inadequate and the drives went to online auction via a recycling dealer, and denies any intent (per the company).
- **Discovery**: In June 2025, two people who won drives at online auction reported finding what seemed to be Hokkaido Medical Center data (press).
- **Scale**: The NHO recovered 90 drives listed online, 33 of which held medical-record data (press). The recovered drives held about 170,000 Medical Center patients and about 8,800 Cancer Center patients (per the hospitals). The hospitals also gave a theoretical maximum based on total patient IDs (about 510,000 in the press), saying this does not mean all of them leaked.
- **Data**: Names, patient numbers, dates of birth, addresses, phone numbers, visit dates, departments, admission details, diagnoses, test results, allergies and parts of nursing records. No My Number, bank or card numbers.
- **Misuse**: No misuse or secondary harm has been reported (per the hospitals).

### Timeline

- **2024-03**: Hokkaido Medical Center outsources disposal of about 750 drives (press).
- **2024-11**: Hokkaido Cancer Center outsources about 570 drives to the same contractor (press).
- **2025-06**: Two online-auction buyers report finding what seems to be hospital data (press).
- **2026-06-08**: The hospitals disclose. The NHO files a criminal complaint with Hokkaido police against the contractor under the Waste Management Act (press). The same day, the Ministry of Health tells prefectures to tighten measures against leaks when disposing of IT equipment.
- **2026-06-09**: The contractor publishes a statement acknowledging its processing may have been inadequate.
- **2026-06-29**: Data on 4,721 patients of another Sapporo hospital (Shin-Sapporo Houwakai Hospital) is reported found among the recovered drives.

> The hospitals' notices (primary) do not cover the contract dates and drive counts, the contractor's name, how it was discovered, the number of drives recovered or the criminal complaint; these rest on press reports and the contractor's statement. The press figure of about 186,900 people (patients and staff) does not match the hospitals' patient counts, and the gap is unexplained. Why it took about a year from discovery to disclosure has not been explained either. As of October 2026, no progress in the police investigation has been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Hospitals**: Will make reliable physical destruction on site the rule, require checks by more than one person, and tighten contractor selection and oversight.
- **Ministry of Health**: Told medical institutions to require witnessing of disposal and submission of photos of destroyed media or wipe logs, and to check before contracting whether work will be subcontracted.

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
