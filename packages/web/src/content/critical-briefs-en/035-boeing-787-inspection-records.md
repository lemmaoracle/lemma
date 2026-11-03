---
brief_no: 35
title: "Boeing: told the FAA that some mandatory 787 inspections recorded as complete had not been performed (reporting)"
title_en: "Boeing: told the FAA that some mandatory 787 inspections recorded as complete had not been performed (reporting)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2024-05-06
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["041-aog-technics-forged-airworthiness-certificates", "020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "none"
og_lead_ja: "報道によれば、Boeing は 787 の主翼と胴体の接合部で、完了と記録された必須の検査の一部が実施されていなかったと FAA に報告。FAA が調査を開始"
og_lead_en: "According to reporting, Boeing told the FAA that some mandatory inspections at the 787 wing-to-body join, recorded as complete, had not been performed; the FAA opened an investigation"
og_kicker_ja: "検査の記録 · 航空機の製造"
og_kicker_en: "INSPECTION RECORDS · AIRCRAFT"
og_headline_ja: "未実施の検査が完了と\n記録されていたと\nBoeing が報告。\n<accent>約 450 機</accent>"
og_headline_en: "Inspections logged as\ndone were not performed,\nBoeing reported.\n<accent>~450 aircraft.</accent>"
key_figures:
  - value: "~450"
    unit: "aircraft"
    label: "787s said to be affected (per sources, reporting)"
    tone: "alert"
  - value: "~60"
    unit: "aircraft"
    label: "Of which, aircraft on Boeing's production line (reporting)"
  - value: "2024-04 → 05-06"
    label: "Boeing's report to the FAA → FAA announces investigation (reporting)"
glossary:
  - term: "Wing-to-body join"
    desc: "The section where an aircraft's wings are attached to the fuselage, joined by many fasteners."
  - term: "Bonding and grounding check"
    desc: "A safety inspection confirming that the join's fasteners are electrically connected, so the airframe is properly grounded against currents such as lightning strikes."
  - term: "FAA (Federal Aviation Administration)"
    desc: "The US authority that oversees the safety of aircraft manufacturing and operation."
insight:
  slug: "completion-record-without-act"
  label: "Completion records not tied to the act"
  quote: "Without a step that checks an inspection's completion record against the measurement or work records showing it was performed, before the item moves to the next stage, the record alone passes it as inspected."
industries: ["manufacturing"]
operations: ["approval"]
controls:
  - slug: "audit-trail"
    item: "Record who actually performed the inspection, when, and what was measured"
impact: "Roughly 450 aircraft affected (per sources)"
takeaway: "That some mandatory inspections recorded as complete had not been performed became visible through Boeing's report to the FAA (reporting)."
self_check: "When an inspection is recorded as complete, is there a mechanism that checks the record against the measurement records showing it was performed, before the item moves to the next stage?"
countries: ["us"]
---

## 1. Summary

According to reporting, Boeing told the FAA that some mandatory inspections at the wing-to-body join, recorded as complete, had in fact not been performed, and acknowledged that the records did not match what had happened. The inspection confirms the electrical bonding and grounding of the join's fasteners, so that the airframe is properly grounded against currents such as lightning strikes. The mismatch between record and act became visible not from the records but through Boeing's report. <strong>Without a step that checks a completion record against the measurement or work records showing the act, before the item moves to the next stage, the record alone passes it as inspected.</strong>

## 2. What got through

- **What got through**: According to reporting, mandatory inspections that had not been performed were recorded as "complete," and aircraft moved through production on those records. The inspection concerned is the bonding and grounding check at the 787 wing-to-body join.
- **What reached the receiving side**: In general, what reaches the next stage or the quality function is a record that the inspection was completed. If the record's fields are all filled in, the record alone makes it hard to tell whether the inspection actually took place.
- **Detection route**: In April 2024, Boeing voluntarily reported to the FAA that some inspections recorded as complete may not have been performed (reporting). The FAA announced an investigation on 2024-05-06.
- **Not disclosed**: The reporting reviewed does not describe which system produced the inspection records, which reviews they went through, or how the mismatch between record and act was found inside the company.

## 3. What to check

Whatever the route, the condition for telling them apart is that an inspection's completion record is checked, separately from the declaration of whoever recorded it, against the measurement or work records showing the inspection was performed, before the item moves to the next stage.

- **Who approves**: The person who performed the inspection and the equipment used to measure. They provide, as a measurement record, who measured which location, when, and with what result. The basis for completion is not supplied by the recording side's own declaration alone.
- **Where it is checked**: When an inspection is recorded as complete, and just before the aircraft is handed to the next stage or shipped. The completion record is compared with the measurement record. An inspection that cannot be checked is not treated as complete, and the item is not handed on, until it can be confirmed.
- **What is recorded**: For each aircraft, which inspection was marked complete, by whom, when, and on which measurement record. Kept outside the department that creates the records, in a form that cannot be rewritten afterwards. It is what lets the aircraft needing re-inspection be narrowed down.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an inspection is recorded as complete and the item is handed on, the completion record against the measurement records showing the act, and keeping a record. Detection means noticing after the records were made, from reports, investigation and re-inspection. Dates follow reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check completion records against measurement records before handing on</div>
<div class="rx-zone gapz"><b>What reporting described</b><span>Mandatory inspections recorded as complete<br>Boeing reported that some had not been performed</span></div>
<div class="rx-zone det"><b>Detection · worked after the records</b>Boeing reported to the FAA, the FAA opened an investigation, and re-inspection of aircraft on the line was required</div>
<div class="rx-g g1"><div class="t">Before 2024-04</div><b>Mandatory inspections recorded as complete</b></div>
<div class="rx-g g2"><div class="t">2024-04</div><b>Boeing reports to the FAA</b></div>
<div class="rx-g g3"><div class="t">2024-05-06</div><b>FAA announces investigation</b></div>
<div class="rx-g g4"><div class="t">From 2024-05</div><b>All 787s on the line re-inspected</b></div>
</div>
</figure>

Detection made the mismatch between record and act visible from outside, and moves re-inspection and the response for the in-service fleet forward. It works separately from a check before completion is recorded. Cases where an attribute required by regulation was accepted on the strength of the document asserting it include [Brief 041](/critical/briefs/041-aog-technics-forged-airworthiness-certificates/) (parts certificates), [Brief 020](/critical/briefs/020-type-designation-conformity-fraud/) (a product's conformity attribute), [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/) (a person's qualification attribute) and [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (a balance attribute).

## 4. What Lemma does

**Lemma builds the check in section 03 into the procedure that records an inspection as complete and the procedure that hands an aircraft to the next stage.** It does not detect inspection lapses or inspect aircraft; it checks, outside the department that creates the records, whether a completion record matches the measurement record of who measured what and when, and keeps a record. It can also show only that the check was completed, without releasing detailed information such as measured values.

### Industries and operations to watch

- **Industry · Manufacturing & critical infrastructure**: Organizations, such as aircraft manufacturers, that move safety-critical products to the next stage or to shipment on the basis of inspection records.
- **Operations · Approval & sign-off**: Work that decides, on the basis of inspection completion records, whether to hand a product to the next stage or ship it.

### Current controls vs Lemma

In this case, the route described by reporting is the first and second columns. The third column is the step after the mismatch is found.

| Control | Recording an inspection as complete | Handing to the next stage or shipment | Identifying aircraft that need re-inspection |
| --- | --- | --- | --- |
| Document and record review (are the records all there?) | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Partial | Effective | Partial |

Record review can find missing records or incomplete entries, but cannot tell whether a fully filled-in record is backed by an actual inspection. Lemma compares the completion record with the measurement record before handing on, and does not hand on an aircraft that cannot be checked. What it can check, though, is whether the records match, not whether the work itself was done correctly. For identifying aircraft that need re-inspection, the record of which inspection was marked complete on which measurement record can be traced, but inspections recorded before the check was built in have no such record.

Note: Lemma's check works only when it is built into the completion-recording and hand-off steps, and the measurement records are kept outside the side that creates the completion records. If the measurement record itself is wrong, wrong results go through too. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent fraud or intrusions.

### Checklist

Three things to confirm for organizations that move products to the next stage or to shipment on the basis of inspection records

- Is there a procedure that does not treat an inspection as complete, or hand the product on, until it can be checked against a measurement record?
- Can you confirm afterwards, for each product, which inspection was marked complete, by whom, when, and on which measurement record?
- When a mismatch between record and act is found, can you quickly narrow down from your records the products that need re-inspection?

## 5. Facts and timeline

- **Subject**: The bonding and grounding check at the wing-to-body join of the Boeing 787 Dreamliner.
- **Meaning of the inspection**: A safety inspection confirming the electrical bonding and grounding of the fasteners joining wing and fuselage, ensuring the airframe is properly grounded against currents such as lightning strikes.
- **What was reported**: According to reporting, some mandatory inspections recorded as complete had not actually been performed. Boeing voluntarily reported this to the FAA in April 2024 and acknowledged that the records did not match what had happened.
- **Scale**: Per sources, roughly 450 aircraft were affected (about 60 of them on Boeing's production line).

### Timeline

- **2024-04**: Boeing voluntarily reports to the FAA that some 787 inspections recorded as complete may not have been performed.
- **2024-05-06**: The FAA announces an investigation. Boeing acknowledges that inspection records did not match what had happened.
- **From 2024-05**: Boeing re-inspects all 787s on the production line. A plan for the in-service fleet is required.

> The facts rest on reporting by The Seattle Times, The Washington Post, NPR and CBS News. The aircraft count is a figure that reporting attributed to sources. This Brief does not discuss the motives of any individual involved in the records, nor does it assess the appropriateness of Boeing's or the FAA's response. What was not disclosed does not mean controls were absent.

### After disclosure

- **Boeing**: Reported voluntarily to the FAA and re-inspected all 787s on the production line (reporting).
- **FAA**: Announced an investigation on 2024-05-06, and required Boeing to re-inspect all 787s on the production line and to develop a plan for the in-service fleet (reporting).

## 6. Sources

- **The Seattle Times**: "FAA opens new investigation into Boeing 787 wing-to-body join work" (2024-05; inspection content, scale, FAA response) — https://www.seattletimes.com/business/boeing-aerospace/faa-opens-new-investigation-into-boeing-787-wing-to-body-join-work/
- **The Washington Post**: "FAA investigating whether Boeing falsified 787 inspections" (2024-05-06) — https://www.washingtonpost.com/transportation/2024/05/06/faa-boeing-787-inspections/
- **NPR**: "FAA is investigating Boeing for apparent missed inspections on 787 Dreamliner" (2024-05-06) — https://www.npr.org/2024/05/06/1249432229/faa-investigation-boeing-787-dreamliner
- **CBS News**: "FAA investigates Boeing for falsified records on some 787 Dreamliners" (2024-05) — https://www.cbsnews.com/news/boeing-787-dreamliners-faa-falsified-records/

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
