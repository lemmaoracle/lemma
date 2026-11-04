---
brief_no: 43
title: "Tesla FSD: NHTSA escalated its reduced-visibility crash probe, and the safety figures were self-reported (NHTSA EA26002, Reuters)"
title_en: "Tesla FSD: NHTSA escalated its reduced-visibility crash probe, and the safety figures were self-reported (NHTSA EA26002, Reuters)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["attribute-proof-bypass", "ai-bias-harm"]
incident_date: 2026-03-18
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["061-hyundai-fca-phantom-braking", "012-williams-frt-wrongful-arrest", "021-wirecard-balance-attestation"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "none"
og_lead_ja: "Tesla FSD の視界低下の事故調査を NHTSA が引き上げ、安全の主張の比較を Reuters が報道"
og_lead_en: "NHTSA escalated its Tesla FSD reduced-visibility crash probe; Reuters reported on the safety-claim comparison"
og_kicker_ja: "AI の運転判断 · 安全の自己申告"
og_kicker_en: "AI DRIVING · SELF-REPORTED SAFETY"
og_headline_ja: "カメラの視界低下を\n検知しなかったと\nNHTSA が指摘。\n<accent>対象 約 320 万台</accent>"
og_headline_en: "FSD missed degraded\ncamera visibility,\nNHTSA says.\n<accent>About 3.2M vehicles.</accent>"
key_figures:
  - value: "3,203,754"
    unit: "vehicles"
    label: "Covered by NHTSA's Engineering Analysis (EA26002)"
    tone: "alert"
  - value: "9"
    unit: "crashes"
    label: "Related to reduced visibility (including 1 death and 1 injury); 6 more under examination as possibly related (NHTSA)"
  - value: "10 → ~3"
    unit: "×"
    label: "Tesla's \"up to 10× safer\", as corrected to a symmetric comparison by a University of Michigan researcher (Reuters)"
glossary:
  - term: "FSD (Full Self-Driving)"
    desc: "Tesla's driver-assistance feature. It perceives the surroundings from camera input and makes driving decisions."
  - term: "NHTSA"
    desc: "The US Department of Transportation's road safety agency. It investigates vehicle defects and seeks recalls."
  - term: "Engineering Analysis (EA)"
    desc: "The stage of an NHTSA defect investigation after a Preliminary Evaluation (PE); typically the stage immediately before a recall."
  - term: "SGO (Standing General Order)"
    desc: "The order under which operators report to NHTSA crashes involving automated driving or driver-assistance systems."
insight:
  slug: "self-reported-safety-figures"
  label: "Safety figures accepted as reported"
  quote: "Without a check outside whoever produced them, the premises of a decision to keep driving, and the crash records and safety figures released to regulators and markets, are accepted as reported."
industries: ["manufacturing", "ai"]
operations: ["disclosure"]
attack_method: "ai-misuse"
impact: "9 reduced-visibility crashes (1 death, 1 injury)"
takeaway: "Both the premises of the decision to keep driving and the crash records and safety figures that reached regulators and markets rested on the operator's own reporting."
self_check: "Before you release crash records or safety figures, is there a mechanism that checks they follow the counting definition and scope you set?"
countries: ["us"]
---

## 1. Summary

NHTSA found that, in the crashes it reviewed, FSD did not detect road conditions impairing camera visibility, or did not warn of degraded performance until just before the collision. Tesla told NHTSA that data-labeling constraints kept it from uniformly identifying crashes during active degradation detection; NHTSA said this may have led to under-reporting. Reuters reported separately on the comparison behind the safety claim. Regulatory investigation and investigative reporting work after the driving and the reports are accepted. <strong>Without a check outside whoever produced them, the premises of a decision to keep driving, and the crash records and safety figures released to regulators and markets, are accepted as reported.</strong>

## 2. What got through

- **What got through**: Two things. First, continuing to drive when camera visibility was degraded; per NHTSA, vehicles lost sight of, or never recognized, a vehicle directly ahead and collided. Second, the submission and publication of crash records and safety figures: crash records reached NHTSA as SGO reports, and the "up to 10× safer" claim reached the market.
- **What reached the receiving side**: In general, driving control runs on the system's own judgment that camera input is valid. The regulator evaluates starting from the crash data submitted. How the comparison population was chosen is decided inside the producer's own counting and is hard to see from the receiving side.
- **Detection route**: NHTSA's staged investigations (PE24031 → EA26002, plus PE25012 and the crash-reporting-practice investigation), Reuters' investigative reporting, and its interviews with in-house data labelers. All of them act after the driving and the reports.
- **Not disclosed**: The sources reviewed do not say when, or to which vehicles, the degradation-detection update Tesla began developing on 2024-06-28 was deployed (NHTSA says it does not know). Liability for individual crashes has not been determined.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the premises of a decision to keep driving, and the crash records and safety figures being released, are checked before the action or submission, outside the process that produced them.

- **Who approves**: For the driving decision, the side that sets the conditions under which input counts as valid (the design of the vehicle's safety function). For submission and publication, the side that sets reporting obligations, metric definitions and the comparison population (the regulator's reporting format and the operator's internal counting definitions).
- **Where it is checked**: Just before continuing to drive on input judged valid, and just before submitting crash records to the regulator or publishing safety figures. The former against a condition that can be checked from outside, not only the system's self-judgment; the latter against the source data and the definitions. Anything that cannot be checked is held and not released until it can be.
- **What is recorded**: Which decision or submission was made, on which conditions and definitions, and the telemetry at the time (video, EDR, CAN). Kept outside the processes that made the decision and did the counting, in a form that cannot be rewritten afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before continuing to drive or releasing crash records and safety figures, their premises and definitions outside the process that produced them, and keeping a record. Detection means noticing after the driving and the reports, from investigations and reporting. Dates are those each company, authority or outlet confirmed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the driving premises, and the records and figures released, outside the process that produced them</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>9 reduced-visibility crashes<br>Possible under-reporting for part of the period (NHTSA)</span></div>
<div class="rx-zone det"><b>Detection · worked after the driving and the reports</b>NHTSA escalated its investigation; Reuters reported on the safety-claim comparison</div>
<div class="rx-g g1"><div class="t">2024-06-27</div><b>SGO report filed for the fatal crash</b></div>
<div class="rx-g g2"><div class="t">2024-10</div><b>NHTSA opens PE24031</b></div>
<div class="rx-g g3"><div class="t">2026-03-18</div><b>Upgraded to EA26002</b></div>
<div class="rx-g g4"><div class="t">2026-05-28</div><b>Reuters reports</b></div>
</div>
</figure>

Detection made the driving-decision failures, the possible under-reporting and the asymmetric comparison visible from outside, and moved the investigation up a stage. It works separately from a check before the driving and the submission. Cases where an AI decision led directly to action without an independent check include [Brief 061](/critical/briefs/061-hyundai-fca-phantom-braking/) (automatic braking with no danger present); a case where self-reported figures led directly to disclosure is [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (a balance attribute flowing straight to disclosure and markets).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that executes AI decisions and the side that releases crash records and safety figures.** It does not judge whether perception was right or detect crashes; it checks, outside the process that produced them, whether the premises of a decision and the records and figures being released meet conditions and definitions set in advance, and keeps a record.

### Industries and operations to watch

- **Industry · Manufacturing**: Organizations that build automatic control functions that take over human driving or operation into vehicles or machinery.
- **Industry · AI adoption**: Organizations that show regulators and markets the safety of AI decisions using figures they count themselves.
- **Operations · Disclosure & data release**: Work that releases crash records or safety metrics as reports to regulators or as public statements.

### Current controls vs Lemma

In this case, all three columns are routes that got through.

| Control | Continuing to drive with degraded visibility | Crash records submitted to the regulator | Safety figures released to the market |
| --- | --- | --- | --- |
| Degradation-detection system update (development begun 2024-06-28) | Partial | Not relevant | Not relevant |
| Metric standardization and third-party verification (debate continues) | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Partial | Effective | Partial |

The degradation-detection update changes detection performance; it does not check each decision to keep driving from outside. Standardization and third-party verification rely heavily on the operator's self-reported data. Lemma binds crash records to the source data (video, EDR, CAN) and checks, before submission, that they follow the reporting definition and scope. For safety figures, it can check that they were counted according to the published definition, but it does not judge whether the choice of comparison population is sound.

Note: Lemma's check works only when it is built into the driving control or the submission and publication steps, and the conditions, definitions and source data are managed outside the processes that made the decision and did the counting. If a condition or definition is itself wrong, wrong results go through too. Finding crashes that were never labeled requires all the source data to be bound. How the driving premises could be checked in the short time while driving is not clear from the sources reviewed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that show the safety of AI decisions to outsiders through records and figures

- Do you check, before it runs and against a condition outside the deciding system, that the input an AI decision relies on is valid?
- Are the crash records you submit to regulators bound to the source data, so you can confirm afterwards which crashes were included?
- Do you keep decisions, crash records and telemetry in a form that cannot be rewritten afterwards?

## 5. Facts and timeline

- **Subject**: Tesla vehicles equipped with FSD. EA26002 covers 3,203,754 vehicles.
- **Identifier**: NHTSA Preliminary Evaluation PE24031 (opened 2024-10), upgraded on 2026-03-18 to Engineering Analysis EA26002.
- **What NHTSA found**: In the crashes it reviewed, the system "failed to detect common road conditions that impair camera visibility and/or did not warn of degraded camera performance until just before the collision." Vehicles lost sight of, or never recognized, a vehicle directly ahead and collided.
- **Crashes**: 9 crashes related to reduced visibility (including 1 death and 1 injury) confirmed, with a further 6 under examination as possibly related.
- **On reporting**: Tesla told NHTSA that "data-labeling constraints" meant it could not uniformly identify and analyze crashes that occurred while degradation detection was active. NHTSA stated this may have led to under-reporting of crashes for part of the period in scope.
- **The safety claim**: According to Reuters, Tesla's "up to 10× safer" claim rests on a comparison of its own airbag-deployment crashes against all tow-away crashes in federal data. A University of Michigan researcher, correcting to a symmetric comparison, found the advantage shrinks to about 3×, and even that is unreliable given differences such as fleet age (Tesla average 4.1 years vs U.S. 12.8 years). Of 11 traffic-safety researchers who reviewed it, 10 assessed it as "misleading marketing."
- **Data submission**: In a separate investigation, Tesla has repeatedly delayed submitting FSD driving-violation data (video, EDR, CAN bus).

### Timeline

- **Mid-2021**: Tesla removes onboard radar and moves to a camera-only approach (reported as against the concerns of in-house engineers).
- **2023-11-28**: A fatal crash involving FSD and reduced visibility occurs.
- **2024-06-27**: Tesla files the SGO report for that crash (about 7 months after it occurred).
- **2024-06-28**: Tesla begins developing an update to the degradation-detection system. NHTSA states it does not know when, or to which vehicles, that update was deployed.
- **2024-10**: NHTSA opens Preliminary Evaluation PE24031 (4 crashes under reduced visibility, one of them a pedestrian fatality).
- **2025-08**: NHTSA raises a separate investigation into Tesla's crash-reporting practices.
- **2025-10**: NHTSA opens a separate investigation, PE25012, into 58 driving violations (running red lights, entering oncoming lanes, etc.).
- **2026-03-18**: NHTSA upgrades the investigation to Engineering Analysis EA26002 (about 3.2 million vehicles, 9 crashes including 1 death).
- **2026-05-28**: Reuters reports on the method behind Tesla's safety-claim comparison and the distrust of in-house data labelers.

> The vehicle count (3,203,754), the crash counts (9, with 6 under examination), NHTSA's findings and the possibility of under-reporting rest on NHTSA's EA26002 opening notice; the safety-claim comparison and the researchers' assessment rest on Reuters' reporting. Final liability findings and the outcomes of disputes for individual crashes depend on the progress of investigation and litigation and are not asserted here. This Brief does not blame Tesla. What was not disclosed does not mean controls were absent.

### After disclosure

- **NHTSA**: Runs multiple parallel investigations into FSD / Autopilot and upgraded the reduced-visibility investigation to an EA. Delays in submitting crash data and driving-violation data have become a focal point in debates over the investigations' effectiveness.
- **Safety assurance and standards**: In autonomous-driving safety assurance, debate continues over presenting a safety case, third-party verification of crash and driving data, and standardizing metrics (aligning comparison populations and thresholds). These rely heavily on the operator's self-reported data.
- **Regulatory direction**: In autonomous driving and advanced driver assistance, demand is growing to require safety claims in a form that can be checked from outside, rather than as operator self-report.

## 6. Sources

- **NHTSA ODI (primary)**: Engineering Analysis EA26002 opening notice (upgrade from PE24031, scope 3,203,754 vehicles, degradation-detection failure, possibility of under-reporting) — <https://static.nhtsa.gov/odi/inv/2026/INOA-EA26002-10023.pdf>
- **Reuters (investigative reporting, primary)**: “Why Tesla's AI trainers don't trust its self-driving tech — or its safety stats” (2026-05-28; roughly 3× inflation of the safety claim, asymmetric comparison population, researcher assessment) — <https://www.reuters.com/investigations/why-teslas-ai-trainers-dont-trust-its-self-driving-tech-or-its-safety-stats-2026-05-28/>
- **Electrek (secondary)**: “Tesla is one step away from having to recall FSD in NHTSA visibility crash probe” (2026-03-19; details and timeline of EA26002) — <https://electrek.co/2026/03/19/nhtsa-upgrades-tesla-fsd-visibility-investigation-3-2-million-vehicles/>
- **Electrek (secondary)**: “Tesla's own AI trainers don't trust 'Full Self-Driving' or its safety stats, Reuters finds” (2026-05-28; summary of the Reuters investigation) — <https://electrek.co/2026/05/28/tesla-fsd-safety-stats-misleading-reuters-investigation/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
