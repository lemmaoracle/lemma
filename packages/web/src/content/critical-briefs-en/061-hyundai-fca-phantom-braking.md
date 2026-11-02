---
brief_no: 61
title: "Hyundai: Driver-assist AI braked with no real danger, and cars were rear-ended (NHTSA recall report)"
title_en: "Hyundai: Driver-assist AI braked with no real danger, and cars were rear-ended (NHTSA recall report)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "ai-bias-harm"]
incident_date: 2026-05-22
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety", "012-williams-frt-wrongful-arrest"]
status: published
version: "1.0"
og_lead_ja: "AI の自動ブレーキが危険なく誤作動し追突を招く — Hyundai"
og_lead_en: "Driver-assist AI braked with no real threat, causing rear-end crashes — Hyundai"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "AI の安全機能の誤作動 · 自動ブレーキ"
og_kicker_en: "AI SAFETY FEATURE MALFUNCTION · AUTOMATIC BRAKING"
og_headline_ja: "危険がないのに、\nAI の自動ブレーキが作動した。\n<accent>人の運転に割り込む判断が、そのまま実行された</accent>"
og_headline_en: "With no real danger,\nthe AI's automatic braking activated.\n<accent>A decision cutting into human driving was executed as is.</accent>"
key_figures:
  - value: "421,078"
    unit: "vehicles"
    label: "Covered by the recall (NHTSA 26V316)"
    tone: "alert"
  - value: "376"
    unit: "reports"
    label: "Reports about Forward Collision-Avoidance (FCA) activation (2024-10-28 to 2026-04-27)"
  - value: "4"
    unit: "crashes"
    label: "Cases where a Hyundai was rear-ended; four injuries were also alleged (NHTSA recall report)"
glossary:
  - term: "Forward Collision-Avoidance (FCA)"
    desc: "A safety feature that perceives a lead vehicle or obstacle with a front camera and, when it judges a crash is imminent, brakes automatically."
  - term: "Phantom braking"
    desc: "Automatic braking that applies unintentionally when there is no danger."
  - term: "ODI (Office of Defects Investigation)"
    desc: "The part of the US NHTSA (the road safety agency of the Department of Transportation) that investigates vehicle defects."
insight:
  slug: "braking-without-check"
  label: "Braking with no danger"
  quote: "Without a check, before it runs, that an AI decision cutting into human driving is needed, a wrong decision executes as a legitimate safety feature."
industries: ["manufacturing"]
controls:
  - slug: "hold-unverified"
    item: "Run an automatic braking action that cuts into human driving only when its necessity has been checked before it runs"
  - slug: "audit-trail"
    item: "Record each braking decision and its telemetry in a form that cannot be rewritten afterwards"
attack_method: "ai-misuse"
impact: "4 rear-end crashes and 4 injuries alleged"
search_title: "Hyundai phantom braking recall"
search_description: "Hyundai recalled 421,078 vehicles for braking with no danger (NHTSA 26V316): what happened and what to do."
self_check: "Before an AI decision cuts into human driving, is there a mechanism that checks the action is needed?"
countries: ["us"]
---

## 1. Summary

A software fault could make the Forward Collision-Avoidance (FCA) automatic braking activate too early, even when there is no danger, and the vehicles were recalled. Detection, by gathering owner reports and complaints that lead to a recall, works after the activation. <strong>Without a check, before it runs, that an AI decision cutting into human driving is needed, a wrong decision executes as a legitimate safety feature.</strong>

## 2. What got through

- **What got through**: Automatic braking with no danger present. A software fault in the front (multi-function) camera can make FCA activate earlier than appropriate (NHTSA recall report). In four cases a Hyundai was rear-ended, and four injuries were alleged.
- **What reached the receiving side**: In general, the braking control executes the braking command FCA issues without knowing whether danger is actually imminent. A malfunction executes as a legitimate safety feature, and from the vehicle's side it cannot be told apart from a normal activation.
- **Detection route**: Owner reports, complaints to NHTSA, the ODI inquiry and the recall. All of them act after the harm and the reports.
- **Not disclosed**: The sources reviewed do not give the details of the conditions under which the fault occurs, whether the vehicle had another mechanism that could stop the activation, or a breakdown of the reports beyond the four rear-end crashes.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever executes an automatic braking action that cuts into human driving checks, before it runs and outside the camera and software that perceived and judged, that the activation is needed.

- **Who approves**: The side that sets the conditions for activating automatic braking (the design of the vehicle's safety function). An activation goes through when a condition showing it is needed is met, separate from the camera's own judgment.
- **Where it is checked**: Just before the automatic braking executes. Where perception and judgment complete inside the camera and software, check not only that internal judgment but a condition that can be checked from outside. An activation that cannot be checked is held and stopped until it can be.
- **What is recorded**: Which activation was taken (or held), on which condition, and the telemetry at that time. Kept outside the process that made the decision, in a form that cannot be rewritten afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the automatic braking runs and outside the camera's own judgment, that the activation is needed, and keeping a record. Detection means noticing after the activation, from reports and complaints. Dates are those each company or authority confirmed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before braking, check that the activation is needed, outside the camera's judgment</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Hard braking can apply with no danger<br>4 rear-end crashes and 4 injuries alleged</span></div>
<div class="rx-zone det"><b>Detection · worked after the activation</b>Owner reports and complaints were gathered and led to the recall</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>Owner survey surfaces a possible fault</b></div>
<div class="rx-g g2"><div class="t">2025-09</div><b>ODI opens an inquiry</b></div>
<div class="rx-g g3"><div class="t">2026-04-27</div><b>Reports reach 376</b></div>
<div class="rx-g g4"><div class="t">2026-05</div><b>Recall of 421,078 vehicles</b></div>
</div>
</figure>

Detection made visible how many occurred and led to the recall and the camera reflash. It works separately from a check before each activation. Another case where an AI decision led directly to an action that could not be undone, without an independent check, is [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (a facial-recognition match led directly to a compulsory administrative action).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that executes an AI decision cutting into human driving (automatic braking and the like).** It does not judge whether the perception or decision itself was right; before the action runs, it checks, outside the process that made the decision, whether the activation meets a condition set in advance, and keeps a record.

### Industries and operations to watch

- **Industry · Manufacturing**: Organizations that build automatic control functions that cut into human operation into vehicles or machinery.
- **Operations · Teams that build AI decisions into their work**: Work in which an AI decision cuts into an action while a human remains ultimately responsible.

### Current controls vs Lemma

The route in this case is an automatic braking activation that cuts into human driving.

| Control | Automatic braking that cuts into human driving | Understanding afterwards, from records |
| --- | --- | --- |
| Gathering owner reports and NHTSA complaints, and the recall | Not effective | Effective |
| Software update (camera reflash, retuning activation timing) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Partial | Effective |

Gathering reports and the recall are indispensable for grasping how many occurred, evaluating safety and preventing recurrence, but they act after the activation. A software update retunes activation timing and improves the distribution of decisions; it does not check each activation as needed before it runs. Lemma checks, before the activation and outside the process that made the decision, that a condition set in advance is met, and binds the decision and telemetry to a record at the moment of issuance. After the fact, the authenticity of the record can be confirmed.

Note: Lemma's check works only when it is built into the mechanism that executes automatic braking and the condition showing an activation is needed can be defined and managed outside the process that made the decision. If the condition itself is wrong, a wrong activation also goes through. Lemma does not fix errors in the camera's perception. How the necessity of braking could be checked in the short time before it runs is not clear from the sources reviewed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations whose products let an AI decision cut into human operation

- Before an automatic control action cuts into human driving or operation, do you check that it is needed?
- Do you record each automatic control decision and its telemetry in a form that cannot be rewritten afterwards?
- Beyond gathering malfunction reports, can you confirm afterwards whether each activation was warranted?

## 5. Facts and timeline

- **Subject**: Model-year 2025–2026 Hyundai Santa Cruz, Tucson, Tucson Hybrid and Tucson Plug-In Hybrid. 421,078 vehicles are covered by the recall.
- **Identifier**: NHTSA Recall 26V316 (Hyundai Motor America; Hyundai internal recall 302).
- **The fault**: A software fault in the front (multi-function) camera can make FCA activate earlier than appropriate, causing unintended automatic braking when no danger is present (so-called phantom braking).
- **Reports and harm**: 376 FCA-activation reports from 2024-10-28 to 2026-04-27. In four of them a Hyundai was rear-ended, and four injuries were alleged.
- **Remedy**: A reflash of the front camera, updating activation timing and the distance judgment to the lead vehicle to better match driver expectation. Dealer and owner notification is set for 2026-07-17.
- **How it came to light**: Hyundai first became aware of the potential fault through an owner survey in 2025-01. ODI opened an inquiry in 2025-09 into complaints about the Tucson's FCA, and Hyundai briefed ODI five times through 2026-05.

### Timeline

- **2024-10-28**: FCA-activation reports begin to accumulate (the start of the NHTSA reporting window).
- **2025-01**: Hyundai first becomes aware of the potential fault through an owner survey.
- **2025-09**: ODI opens an inquiry into complaints about the Tucson's FCA.
- **2026-04-27**: FCA-activation reports reach 376 (including 4 rear-end crashes and 4 injuries).
- **2026-05**: Hyundai recalls 421,078 vehicles (26V316).
- **2026-07-17**: Planned date for dealer and owner notification.

> The vehicle count (421,078), report count (376), rear-end crashes and injuries (four each), recall number (26V316) and affected models rest on the NHTSA recall report. This Brief does not blame Hyundai. What was not disclosed does not mean controls were absent.

### After disclosure

- **Hyundai / NHTSA**: Hyundai is remedying the fault with a front-camera reflash and plans to notify owners on 2026-07-17. ODI has reviewed the path to the recall through inquiries since 2025-09.
- **Scope of the remedy**: The remedy retunes activation timing and improves the distribution of decisions. It works separately from a check, before each activation, that the activation is needed.

## 6. Sources

- **NHTSA**: Recall Report 26V316 — Hyundai Motor America (primary data on the Forward Collision-Avoidance early activation, affected models, and counts) — <https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V316-9486.pdf>
- **Fox Business**: "Hyundai recalls over 421,000 vehicles to fix software bug causing unexpected braking" — <https://www.foxbusiness.com/lifestyle/hyundai-recalls-over-421000-vehicles-fix-software-bug-causing-unexpected-braking>
- **The Brake Report**: "Hyundai Recalls 421,078 Vehicles for Phantom Braking" (376 reports, the remedy, 26V316) — <https://thebrakereport.com/hyundai-tucson-santa-cruz-fca-recall-26v316/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
