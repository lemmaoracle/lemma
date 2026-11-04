---
brief_no: 49
title: "Tesla Robotaxi：黒塗りだった事故の経緯を NHTSA に再提出し、遠隔運転手が起こした事故が含まれていた(Electrek・TechCrunch)"
title_en: "Tesla Robotaxi: Tesla refiled its once-redacted crash narratives with NHTSA, and some crashes turned out to be caused by remote teleoperators (Electrek, TechCrunch)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "attribute-proof-bypass", "ai-bias-harm"]
incident_date: 2026-05-15
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["043-tesla-fsd-self-reported-safety", "035-boeing-787-inspection-records", "012-williams-frt-wrongful-arrest"]
status: published
layout: "report"
sections: "proof"
gate: "none"
version: "1.0"
og_lead_ja: "Tesla が Robotaxi の事故の経緯の黒塗りを外して NHTSA に再提出し、Austin の 17 件のうち 2 件は遠隔運転手が起こしたと報じられた"
og_lead_en: "Tesla refiled its Robotaxi crash narratives with NHTSA unredacted; 2 of 17 Austin crashes were reported as caused by remote teleoperators"
og_kicker_ja: "AI の運転判断 · 制御の帰属"
og_kicker_en: "AI DRIVING · CONTROL ATTRIBUTION"
og_headline_ja: "黒塗りを外した記録で、\n遠隔運転手の事故が\n分かったと報道。\n<accent>17 件のうち 2 件</accent>"
og_headline_en: "Unredacted filings show\nteleoperators caused\ncrashes, reports say.\n<accent>2 of 17 crashes.</accent>"
key_figures:
  - value: "2"
    unit: "crashes"
    label: "Caused not by the autonomous system but by a human teleoperator driving remotely (per the unredacted refiling)"
    tone: "alert"
  - value: "17"
    unit: "crashes"
    label: "ADS crashes reported to NHTSA over the Austin Robotaxi test period (2025-07 to 2026-03)"
  - value: "~57,000"
    unit: "miles"
    label: "Miles per crash as of 2026-02 (14 crashes in ~800,000 miles, Electrek)"
glossary:
  - term: "ADS (Automated Driving System)"
    desc: "An automated driving system that makes driving decisions and operates the vehicle in place of a human driver."
  - term: "Teleoperator"
    desc: "A human driver who operates the car remotely, over a network, from outside the vehicle."
  - term: "Safety monitor"
    desc: "A person riding in the Robotaxi to oversee the drive. In this case, the monitor called in remote help after the ADS stopped."
  - term: "SGO (Standing General Order)"
    desc: "The order under which operators report to NHTSA crashes involving automated driving or driver-assistance systems."
  - term: "Confidential business information"
    desc: "Parts of a filing the operator designates to be withheld from public release. Here, it covered the crash narratives."
insight:
  slug: "self-reported-control-attribution"
  label: "Control attribution accepted as reported"
  quote: "Unless who was in control is recorded at the moment of handover, in a form that can be checked outside the operator, attribution in a crash record is accepted as the filer reports it."
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "audit-trail"
    item: "Record who was in control at the time of each crash so it can be checked externally"
impact: "2 of 17 crashes were caused by remote teleoperators"
takeaway: "Whether the autonomous system or a teleoperator was in control at each crash rested on records the operator wrote and filed with the regulator."
self_check: "When control passes from an automated system to a person, do you keep who is in control in a form that can be checked outside the operating side?"
countries: ["us"]
---

## 1. Summary

Until the redaction was lifted, outsiders could not tell which crashes involved autonomous driving and which involved a remote human. Control attribution and the crash narrative were written into records the operator produced and filed, and the operator also decided how much to disclose. Reporting on the teleoperator crashes followed the unredacted refiling. <strong>Unless who was in control is recorded at the moment of handover, in a form that can be checked outside the operator, attribution in a crash record is accepted as the filer reports it.</strong>

## 2. What got through

- **What got through**: Two things. First, the handover of control from the ADS to a remote human driver, and the remote driving that followed. In one crash (2025-07), after the ADS stopped and the safety monitor called in remote help, the teleoperator drove up a curb and made contact with a metal fence. Second, the filing of crash records with NHTSA: Tesla had filed every crash narrative redacted as "confidential business information."
- **What reached the receiving side**: In general, what reaches the regulator under a crash-reporting regime is the record the operator produced. Whether the ADS, a teleoperator or the safety monitor was in control depends on the vehicle's logs and the operator's record-keeping. If the narrative is redacted, third parties cannot read the attribution.
- **Detection route**: Tesla's unredacted refiling on 2026-05-15 and the Electrek and TechCrunch reporting on it. Both act after the crashes and the initial reports.
- **Not disclosed**: The sources reviewed do not describe the procedure or authorization for handing control to a teleoperator, or why the redaction was lifted. No fault has been determined for individual crashes.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, when control passes from an automated system to a person, who received it and under what authorization is checked at that moment outside the operating process, and the records filed with the regulator are bound to that check.

- **Who approves**: The side that defines who may operate remotely and on what conditions (the design of operational safety). For crash records, the side that sets the reporting format and scope (the regulator's reporting regime and the operator's internal record definitions).
- **Where it is checked**: Just before a teleoperator takes control, and just before crash records are filed. The former checks that the person taking over is authorized; the latter that the control attribution written in the record matches the record made at handover. Anything that cannot be checked is held and not released until it can be.
- **What is recorded**: When control moved, from whom to whom, under what authorization, and the telemetry at the time. Kept outside the operating process, in a form that cannot be rewritten afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before control passes to a person and before crash records are filed, who was in control and under what authorization, outside the operating process, and keeping a record. Detection means noticing after the crashes and initial reports, from a refiling or reporting. Dates are those each company, authority or outlet confirmed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the handover of control, and the attribution in records filed, outside the operating process</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>2 of 17 crashes caused by teleoperators<br>Narratives had been filed redacted as confidential</span></div>
<div class="rx-zone det"><b>Detection · worked after the crashes and initial reports</b>The unredacted refiling and reporting revealed the teleoperator crashes</div>
<div class="rx-g g1"><div class="t">2025-07</div><b>Testing begins; teleoperator hits a fence</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>Teleoperator hits a barricade</b></div>
<div class="rx-g g3"><div class="t">2026-02</div><b>14 crashes reported cumulatively</b></div>
<div class="rx-g g4"><div class="t">2026-05-15</div><b>Refiled unredacted</b></div>
</div>
</figure>

Detection made the teleoperator crashes visible from outside. It works separately from a check before the handover and the filing. From the same operator, a case where crash data and safety figures rested on self-reporting is [Brief 043](/critical/briefs/043-tesla-fsd-self-reported-safety/) (the FSD reduced-visibility crash probe); a case where the existence of records was taken as evidence the work was done is [Brief 035](/critical/briefs/035-boeing-787-inspection-records/) (Boeing 787 inspection records).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that hands control to a person and the side that files crash records with the regulator.** It does not detect crashes or judge whether a driving decision was right or who was at fault; it checks, outside the operating process, whether the person who took control was authorized and whether the control attribution in the record filed matches the record made at handover, and keeps a record.

### Industries and operations to watch

- **Industry · AI adoption**: Organizations that run automated systems whose unresolved situations are taken over by remote people.
- **Operations · Disclosure & data release**: Work that releases crash records or narratives as reports to regulators or as public statements.

### Current controls vs Lemma

In this case, both columns are routes that got through.

| Control | Handover of control to a teleoperator | Crash records filed with the regulator (who was in control) |
| --- | --- | --- |
| Onboard safety monitor and calling in remote help | Partial | Not relevant |
| Vehicle-side logs | Not relevant | Partial |
| **Lemma (pre-execution check)** | Partial | Effective |

The onboard safety monitor connects to remote help when the ADS stops; it does not check from outside whether the person taking over is authorized. Vehicle-side logs are material for attribution, but what goes into the record depends on the operator's record-keeping. Lemma records who took control at handover and under what authorization, and checks before filing that the attribution in the record filed matches it. In the handover column, what Lemma checks is the authorization of the person taking over; it does not judge the safety of the remote driving itself.

Note: Lemma's check works only when it is built into the handover and filing steps, and the authorization conditions and handover records are managed outside the operating process. If an authorization condition is itself wrong, wrong results go through too. How much to disclose is for the filer and the regulator to decide; Lemma does not decide it. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that hand driving or operation between automated systems and people

- Do you check, before handing over control, that the person operating remotely is allowed to operate that vehicle or machine?
- Can you confirm afterwards that "who was in control" in crash records filed with regulators is bound to the record made at handover?
- Do you keep handover records and records from the time of each crash outside the operating process, in a form that cannot be rewritten afterwards?

## 5. Facts and timeline

- **Subject**: Tesla's Robotaxi operating in Austin (2026 Model Y, equipped with an ADS, operated with a safety monitor onboard).
- **Data scope**: 17 unique crashes involving the ADS over the Austin Robotaxi test period (2025-07 to 2026-03).
- **What was confirmed**: 2 of the 17 were caused not by the autonomous system but by a human driver operating the car remotely. In one (2025-07), after the ADS stopped and the safety monitor called in remote help, the teleoperator drove up a curb and made contact with a metal fence at ~8 mph (the only injury in this dataset; minor, no hospitalization). In the other (2026-01), a teleoperator drove into a temporary barricade at ~9 mph.
- **Filing of records**: Tesla had previously filed every crash narrative with NHTSA redacted as "confidential business information." Waymo, Zoox and others filed readable accounts.
- **Frequency**: According to Electrek, as of 2026-02 the Austin fleet had driven ~800,000 miles and reported 14 crashes to NHTSA, about 1 per 57,000 miles, roughly 4× Tesla's own benchmark for human drivers (about 1 minor collision per 229,000 miles).

### Timeline

- **2025-07**: Robotaxi testing begins in Austin; ADS crashes are reported to NHTSA thereafter. A teleoperator hits a fence (1 minor injury, no hospitalization).
- **2026-01**: A teleoperator hits a temporary barricade at ~9 mph.
- **2026-02**: The Austin fleet has driven ~800,000 miles, with 14 crashes reported cumulatively (~1 per 57,000 miles, Electrek).
- **2026-05-15**: Tesla refiles the crash narratives unredacted. Electrek and TechCrunch report that 2 of the 17 were caused by teleoperators.

> The two teleoperator crashes and the history of redacted filings rest on Electrek and TechCrunch reporting of 2026-05-15; mileage and crash frequency rest on Electrek's reporting of 2026-02-17. Most crashes were reported as minor and attributed to other drivers, and Tesla's tally is reported to show no serious fault by the autonomous system. This Brief does not adjudicate fault and does not blame Tesla. NHTSA's investigations and evaluations continue separately. What was not disclosed does not mean controls were absent.

### After disclosure

- **Tesla**: On 2026-05-15, lifted the redaction on its crash narratives, aligning with the disclosure level of Waymo, Zoox and others.
- **NHTSA**: Continues to assess autonomous-driving safety (for its FSD investigations, see [Brief 043](/critical/briefs/043-tesla-fsd-self-reported-safety/)).
- **Industry question**: In autonomous-driving crash reporting, how to check control attribution (ADS / remote human / safety monitor) and record authenticity from outside has surfaced as a cross-regulatory, cross-industry question. In operations that include teleoperation, records of control attribution are an especially central point.

## 6. Sources

- **Electrek**: "Tesla finally reveals what happened in 17 'Robotaxi' crashes" (2026-05-15; unredaction of narratives, 2 teleoperator-caused crashes, the trade-secret designation) — <https://electrek.co/2026/05/15/tesla-unredacts-robotaxi-crash-narratives-nhtsa/>
- **TechCrunch**: "Tesla reveals two Robotaxi crashes involving teleoperators" (2026-05-15; teleoperator-caused crashes, NHTSA filings) — <https://techcrunch.com/2026/05/15/tesla-reveals-two-robotaxi-crashes-involving-teleoperators/>
- **Electrek**: "Tesla 'Robotaxi' adds 5 more crashes in Austin in a month — 4x worse than humans" (2026-02-17; ~800k miles, 14 crashes, ~1 per 57k miles, ~4× human benchmark) — <https://electrek.co/2026/02/17/tesla-robotaxi-adds-5-more-crashes-austin-month-4x-worse-than-humans/>
- **NHTSA**: Standing General Order ADS Incident Reports (primary data of the autonomous-driving crash reporting regime) — <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
