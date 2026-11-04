---
brief_no: 42
title: "Waymo: robotaxis drove past stopped school buses (NHTSA)"
title_en: "Waymo: robotaxis drove past stopped school buses (NHTSA)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "ai-bias-harm"]
incident_date: 2025-12-05
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety", "012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Waymo の自動運転車が停止中のスクールバスの脇を通過し、NHTSA が調査、Waymo は 3,067 台のソフトウェアリコールを実施"
og_lead_en: "Waymo robotaxis drove past stopped school buses; NHTSA opened a probe and Waymo recalled software on 3,067 vehicles"
og_kicker_ja: "AI の運転判断 · 安全規則"
og_kicker_en: "AI DRIVING · SAFETY RULES"
og_headline_ja: "停止中のスクールバスの\n脇を止まらず通過し、\nNHTSA が調査。\n<accent>リコール 3,067 台</accent>"
og_headline_en: "Robotaxis passed\nstopped school buses;\nNHTSA investigates.\n<accent>3,067 vehicles recalled.</accent>"
key_figures:
  - value: "19"
    unit: "instances"
    label: "Passings logged by the Austin school district this school year (one just after a child crossed in front of the car)"
    tone: "alert"
  - value: "3,067"
    unit: "vehicles"
    label: "Covered by the voluntary software recall Waymo conducted with NHTSA (fifth-generation ADS)"
  - value: "22"
    unit: "reports"
    label: "Covered by NHTSA ODI's expanded probe (including collisions with fixed objects and running signals)"
glossary:
  - term: "ADS (Automated Driving System)"
    desc: "The self-driving system. It perceives the surroundings, makes driving decisions such as stopping or passing, and controls the car."
  - term: "NHTSA ODI"
    desc: "The Office of Defects Investigation of the US road safety agency (NHTSA). It investigates vehicle defects and leads to recalls."
  - term: "Stop arm"
    desc: "The stop sign a school bus swings out from its side while children board or alight. In the US, passing a stopped school bus is illegal."
  - term: "SGO (Standing General Order)"
    desc: "The order under which operators report to NHTSA crashes involving automated driving or driver-assistance systems."
insight:
  slug: "driving-decision-before-action"
  label: "Driving decisions not checked before the action"
  quote: "Without a check, before the action and outside the system that made it, a driving decision bound by a safety rule is carried out as the system's own internal judgment."
industries: ["ai"]
attack_method: "ai-misuse"
impact: "19 instances logged by the Austin school district this year"
takeaway: "Whether to stop for a stopped school bus was decided inside the system, and the incidents became visible only after the passing, through footage and district reports."
self_check: "Before an automated action bound by a safety rule runs, is there a mechanism that checks it against conditions outside the system that made the decision?"
countries: ["us"]
---

## 1. Summary

A Waymo robotaxi drove past a school bus that was stopped with red lights on and its stop arm out, without stopping. NHTSA ODI opened a probe after the footage, and Waymo identified the software fault, updated it, and conducted a voluntary software recall of 3,067 vehicles with NHTSA. The Austin school district says it saw incidents even after the update. Footage, district reports and crash reports all work after the passing. <strong>Without a check, before the action and outside the system that made it, a driving decision bound by a safety rule is carried out as the system's own internal judgment.</strong>

## 2. What got through

- **What got through**: The driving decision, in front of a stopped school bus (red lights on, stop arm deployed), to pass or not to remain stopped. In the US, passing a stopped school bus is illegal — a safety rule tied directly to children boarding and alighting.
- **What reached the receiving side**: In general, vehicle control runs on the system's own perception and its own application of the rule "I must stop." Passing is executed in the same form as ordinary driving.
- **Detection route**: Footage reported by the media, school district reports, and crash reports to NHTSA. All of them work after the passing.
- **Not disclosed**: The sources reviewed do not say where, between perception and applying the rule, the decision went wrong in each incident. Waymo's answers to the questions NHTSA asked it to answer by 2026-01-20, and the conclusions of the expanded probe, have not been published.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that a driving decision bound by a safety rule is checked before the action, against conditions outside the system that made it.

- **Who approves**: The side that sets the conditions that create a duty to stop (red lights, stop arm, children boarding) and the actions allowed at that point (the design of the vehicle's safety functions and the operating rules).
- **Where it is checked**: In front of a stopped school bus, just before a decision to pass or move off is handed to control — against conditions that can be checked from outside, not only the system's self-judgment. When it cannot be checked, the car stays stopped.
- **What is recorded**: Which decision was made, on which conditions, and the telemetry at the time. Kept outside the system that made the decision, in a form that cannot be rewritten afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before passing or moving off, whether the decision meets the conditions of the duty to stop, outside the system that made it, and keeping a record. Detection means noticing after the passing, from footage and reports. Dates are those each company, authority or outlet confirmed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a decision to pass or move off outside the system that made it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>19 instances in Austin this school year<br>Incidents after the update (district report)</span></div>
<div class="rx-zone det"><b>Detection · worked after the passing</b>NHTSA opened a probe from footage and district reports, and later widened it</div>
<div class="rx-g g1"><div class="t">2025-10</div><b>NHTSA ODI opens a probe</b></div>
<div class="rx-g g2"><div class="t">2025-11-17</div><b>Waymo updates its software</b></div>
<div class="rx-g g3"><div class="t">2025-12</div><b>Voluntary recall of 3,067 vehicles</b></div>
<div class="rx-g g4"><div class="t">2026</div><b>NHTSA expands the probe</b></div>
</div>
</figure>

Detection made the passings in front of stopped school buses visible from outside and led to the probe and the recall. It works separately from a check before the action. In the same self-driving cluster, [Brief 049](/critical/briefs/049-tesla-robotaxi-control-attribution/) (Tesla Robotaxi) covers who was in control at the time of a crash and the provenance of the records, and [Brief 043](/critical/briefs/043-tesla-fsd-self-reported-safety/) covers safety figures accepted as reported. A case where an AI determination led directly to a public-space action without an independent check is [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (a facial-recognition match that led to a wrongful arrest).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that hands AI driving decisions to control.** It does not judge whether perception was right or detect violations; it checks, outside the system that made it, whether a decision on an action bound by a safety rule meets conditions set in advance, and keeps a record. It can show only that the conditions were met, without exposing the internal perception model or implementation.

### Industries and operations to watch

- **Industry · AI adoption**: Organizations that run systems, such as self-driving, in which AI decisions lead directly to physical actions in public spaces.
- **Operations · Automated actions bound by safety rules**: Work in which the system's decision executes actions — stopping, passing, moving off — that cannot be undone if the rule is not met.

### Current controls vs Lemma

In this case, both columns are routes that got through.

| Control | The decision to pass a stopped school bus | A record of the decision and its conditions |
| --- | --- | --- |
| Software update and voluntary recall (2025-11 to 12) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Effective |

The software update changes the tendency of the decisions; it does not check each decision to pass from outside. The district says it saw incidents even after the update. Lemma checks a decision to pass or move off against the set conditions before handing it to control, and keeps, outside the system that made it, which decision met which conditions.

Note: Lemma's check works only when it is built into the driving-control steps and the conditions of the duty to stop are managed outside the system that made the decision. If the perception that feeds the conditions is itself wrong, a wrong decision goes through too. Which conditions could be checked, and how, in the short time while driving is not clear from the sources reviewed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations whose AI decisions carry out actions in public spaces

- Before an action bound by a safety rule, do you check, outside the deciding system, whether the decision meets the rule's conditions?
- Is there a rule that keeps the action stopped when it cannot be checked?
- Do you keep decisions, and the conditions and telemetry at the time, in a form that cannot be rewritten afterwards?

## 5. Facts and timeline

- **Subject**: Waymo's self-driving vehicles (ADS-equipped robotaxis operating in Atlanta, Austin and elsewhere).
- **What happened**: Against a stopped school bus (red lights on, stop arm deployed), Waymo vehicles failed to stop and drove past, or did not remain stopped.
- **Scale**: The Austin school district logged 19 instances this school year, one just after a child had crossed in front of the car. At least 6 more occurred in Atlanta in 2025. NHTSA ODI is also examining 22 reports, including collisions with fixed and semi-fixed objects (gates, chains, etc.) and parked vehicles, and disregard of signal controls.
- **Response**: Waymo said it identified the software fault and deployed an update by 2025-11-17. In 2025-12 it conducted a voluntary software recall of 3,067 fifth-generation ADS vehicles with NHTSA. The district says it saw multiple incidents even after the update.

### Timeline

- **2025-10**: NHTSA ODI opens a probe after footage (media reporting) of a Waymo vehicle passing a stopped school bus in Atlanta.
- **2025-11-17**: Waymo says it identified the software fault and deployed an update.
- **2025-12-03**: NHTSA sends Waymo a letter asking it to answer a set of questions by 2026-01-20.
- **2025-12**: Waymo conducts a voluntary software recall of 3,067 fifth-generation ADS vehicles with NHTSA.
- **After 2025-12**: The Austin district reports incidents continued after the update.
- **2026**: NHTSA widens the probe to cover failures to remain stopped for school buses with stop and crossing arms deployed, and 22 reports including collisions with fixed objects and running signals. Zoox is separately under investigation over two rear-end crashes from unexpected hard braking.

> The recall count (3,067) and the incident counts rest on the NHTSA recall document and reporting. To avoid confusion with Waymo's separate recall (about 3,800 vehicles, over driving through flooded roads), this Brief is limited to the school-bus recall. The cause and the timing of the update rest on Waymo's account; incidents after the update rest on the district's reports. The investigation is ongoing, and no conclusion is asserted here. This Brief does not blame Waymo. What was not disclosed does not mean controls were absent.

### After disclosure

- **Waymo / NHTSA**: Waymo identified the software fault, updated it and conducted a voluntary recall. NHTSA ODI widened its probe in 2026 and continues to cover failures to remain stopped for school buses and reports including collisions with fixed objects and running signals.
- **Incidents after remediation**: That incidents were reported after the software update has raised the need to separate correcting the decision model after the fact from checking each action before it is taken.
- **Industry debate**: There is debate about not relying only on the operator's after-the-fact telemetry and remediation to evaluate self-driving safety, and instead keeping safety-critical driving decisions as records that can be checked from outside at the time of the action.

## 6. Sources

- **TechCrunch**: "Waymo to issue software recall over how robotaxis behave around school buses" (2025-12-05) — <https://techcrunch.com/2025/12/05/waymo-to-issue-software-recall-over-how-robotaxis-behave-around-school-buses>
- **CBS News**: "Waymo recalls more than 3,000 vehicles over faulty software following school bus violations" — <https://www.cbsnews.com/news/waymo-recall-3000-vehicles-software-school-bus/>
- **CBS News**: "U.S. expands investigation into Waymo over robotaxis driving around stopped school buses" — <https://www.cbsnews.com/news/waymo-investigation-nhtsa-robotaxis-passing-school-bus>
- **NHTSA**: Standing General Order ADS Incident Reports (primary data of the ADS crash-reporting program) — <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
