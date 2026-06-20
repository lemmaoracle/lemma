---
brief_no: 43
title: "自動運転の事故データと「人間より安全」の根拠が、自社申告のまま検証されていない — AI の走行判断と安全性属性の独立検証不在（Tesla FSD／NHTSA EA26002）"
title_en: "Self-Reported Autonomous-Driving Safety, Unverified — Tesla FSD Crash Data and Safety-Stat Methodology"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["attribute-proof-bypass"]
incident_date: 2026-03-18
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "021-wirecard-balance-attestation", "009-gtg1002-ai-orchestrated-espionage"]
version: "1.0"
status: published
og_lead_ja: "自動運転の事故データと安全性の根拠が自社申告のまま — Tesla FSD/NHTSA"
og_lead_en: "Tesla FSD crash data and safety stats, self-reported and unverified — Tesla FSD"
gap_detected: "Regulators' phased investigations, investigative reporting, and insider testimony made the driving-decision failures, under-reporting of crashes, and inflated statistics externally visible."
gap_missing: "At the point of continuing to drive or submitting data to regulators, there was no layer to confirm whether the premises of a decision (can the camera see) and the declared crash data and statistics reflected reality, so everything was accepted as the operator's self-declaration."
gap_fix: "Before continuing to drive or releasing safety data to regulators and the market, independently verify with Lemma that the decision's premises are met, the declaration is exhaustive, and the statistics follow their definitions, and prevent it up front."
---

## TL;DR

NHTSA escalated its probe into Tesla FSD's inability to handle reduced visibility, noting that data-labeling constraints may have under-reported crashes; Reuters separately found the "up to 10× safer than humans" claim rested on an asymmetric comparison inflating safety by roughly 3×. Investigation, reporting, and insider testimony surfaced it only after the fact. What is structurally missing is a layer that verifies, while driving and submitting data, whether a decision's premises and declared statistics reflect reality; all was self-reported. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Investigation upgrade**: 2026-03-18, NHTSA upgraded a Preliminary Evaluation (PE24031, opened 2024-10) to an Engineering Analysis (EA26002). Scope is 3,203,754 vehicles. An EA is typically the stage immediately before a recall
- **Failure on the driving-decision side**: NHTSA found that, in the crashes it reviewed, the system "failed to detect common road conditions that impair camera visibility and/or did not warn of degraded camera performance until just before the collision." Vehicles lost sight of, or never recognized, a vehicle directly ahead and collided
- **Scope**: 9 crashes related to reduced visibility (including 1 death and 1 injury) confirmed, with a further 6 under examination as possibly related
- **Failure on the reporting side (under-reporting)**: Tesla told NHTSA that "data-labeling constraints" meant it could not uniformly identify and analyze crashes that occurred while degradation detection was active. NHTSA stated this may have led to **under-reporting** of crashes for part of the period in scope
- **Inflation of the safety claim**: 2026-05-28, Reuters reported that Tesla's "up to 10× safer" claim rests on an asymmetric comparison — its own airbag-deployment crashes against all tow-away crashes in federal data. A University of Michigan researcher, correcting to a symmetric comparison, found the advantage shrinks to about 3×, and even that is unreliable given differences such as fleet age (Tesla average 4.1 years vs U.S. 12.8 years). Of 11 traffic-safety researchers who reviewed it, 10 assessed it as "misleading marketing"
- **Delayed data submission**: in a separate investigation, Tesla has repeatedly delayed submitting FSD driving-violation data (video, EDR, CAN bus)

---

## 2. Timeline

- Mid-2021: Tesla removes onboard radar and moves to a camera-only approach (reported as against the concerns of in-house engineers)
- 2023-11-28: a fatal crash involving FSD and reduced visibility occurs
- 2024-06-27: Tesla files the Standing General Order (SGO) report for that crash (about 7 months after it occurred)
- 2024-06-28: Tesla begins developing an update to the degradation-detection system. NHTSA states it does not know when, or to which vehicles, that update was deployed
- 2024-10: NHTSA opens Preliminary Evaluation PE24031 (4 crashes under reduced visibility, one of them a pedestrian fatality)
- 2025-08: NHTSA raises a separate investigation into Tesla's crash-reporting practices
- 2025-10: NHTSA opens a separate investigation, PE25012, into 58 driving violations (running red lights, entering oncoming lanes, etc.)
- 2026-03-18: NHTSA upgrades the investigation to Engineering Analysis EA26002 (about 3.2 million vehicles, 9 crashes including 1 death)
- 2026-05-28: Reuters reports the methodological flaw in Tesla's safety claim (roughly 3× inflation) and the distrust of in-house data labelers

> Note: final liability findings and the outcomes of disputes for individual crashes depend on the progress of investigation and litigation and are not asserted here.

---

## 3. How Driving Decisions and Safety Reporting Propagate to Regulation and Markets

This event stems from a structure in which the AI driving decision and the safety attributes are not independently verified. The failure propagates to regulatory disclosure and the markets as follows.

1. **Self-judgment of the driving decision**: FSD itself judges whether camera input is valid (not degraded) and continues driving as long as it deems the input valid. The very detection of "not seeing" is closed within the system's self-judgment and is not independently verified
2. **Self-reporting of crash records**: when a collision occurs, identifying and labeling which crashes happened "while degradation detection was active" depends on the operator's internal process. Labeling constraints can effectively shrink, on the operator's side, the population of crashes that reaches the regulator
3. **Flow into regulatory disclosure**: self-reported crash data is presented as reporting to the regulator (SGO and the like). The regulator must, at first, evaluate from the submitted data as its starting point
4. **Claim to the market**: a "safer" safety attribute constructed from self-reported data is presented to investors, users, and the market. Even when the choice of comparison population is asymmetric, it is hard to verify from outside
5. **Delayed discovery and impact realization**: the divergence in the validity of the driving decision, the completeness of the crash population, and the symmetry of the statistics is not made visible in the ordinary reporting cycle. It is first confirmed from outside only when regulatory investigation and investigative reporting activate after the fact, and once confirmed, retrospective re-verification is required for the entire prior reporting period

---

## 4. Structural Argument

This incident belongs to the `ai-decision-integrity` category of Pillar 02 (Verifiable AI). The central failure primitive is that **both the validity of the AI driving decision and the safety attributes derived from it are accepted as the operator's self-report, severed from independent verification.** On the driving-decision side, the validity of the premise "the camera input is valid" is closed within the system's self-judgment and is not independently verified before the action (continuing to drive). On the reporting side, the attribute construction — "which crashes to include in the population" and "what to compare against" — is left to the operator, and regulators and markets cannot re-verify that construction from outside. `attribute-proof-bypass` (the safety attribute presented to regulators and markets) is noted as a secondary category.

The targets differ from Brief 012 (a facial-recognition AI judgment flowing, without independent verification, straight to an administrative coercive measure), Brief 021 (a self-reported financial attribute flowing, without independent verification, straight to disclosure and markets), and Brief 009 (autonomous execution where agent authority is not independently verified), but the shared primitive is the same: **a decision or attribute assertion flows straight to action, disclosure, and markets while decoupled from the layer that would verify it.** This case shows the magnitude of AI-decision-integrity bypass in that the assertion flows simultaneously into both "a physical driving action directly affecting human safety" and "a safety claim presented to the public markets."

---

## 5. The detection–proof gap

Here, the detection chain — NHTSA's staged investigations (PE24031 → EA26002, plus PE25012 and the reporting-practice investigation), Reuters' investigative reporting, and the testimony of Tesla's in-house data labelers — worked, and the driving-decision failures, under-reporting, and statistical inflation were made visible from outside. This is a textbook detection success, and this Brief does not dispute the role of the detection layer. Detection is indispensable for raising doubt, driving the investigation, and judging whether a recall is required.

What matters here is that, while this case looks at first like an "AI perception" crash, the gap Lemma addresses is not perception accuracy itself. However much perception is improved, detection does not serve as material to independently prove "the basis of the driving decision (was camera input valid?)" and "whether the reported crash population and safety statistics reflect reality" **at the moment the vehicle keeps driving and at the moment the data is submitted to the regulator.** Both regulatory investigation and investigative reporting are after-the-fact chains that activate after the action and the report have been received by the market. This is a gap in a structurally independent layer, beyond detection's reach.

As things stand, across the operating model for autonomous-driving safety assurance, independent verification of the validity of the driving decision and of the safety attributes depends on trust in the operator's self-reported telemetry, crash labels, and statistics, and is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of attribute proof into the driving-decision and reporting / disclosure path. It is a complement to detection, not a substitute; together the two establish the trust boundary for safety attributes.

---

## 6. Response and Industry Response

- **Regulation and investigation**: NHTSA runs multiple parallel investigations into FSD / Autopilot and upgraded the reduced-visibility investigation to an EA. The operator's delays in submitting crash data and driving-violation data have become a focal point in debates over the investigation's effectiveness
- **Safety assurance and standards**: in autonomous-driving safety assurance, debate continues over presenting a safety case, third-party verification of crash and driving data, and standardizing metrics (aligning comparison populations and thresholds). These, however, rely heavily on the operator's self-reported data, and the layer that independently verifies the completeness and authenticity of source data at the point of reporting remains thin
- **Shift in regulatory center of gravity**: the regulatory center of gravity is shifting from data disclosure to compliance proof. In autonomous driving and advanced driver assistance, demand is growing to require safety claims in an independently verifiable form rather than as operator self-report

The absence of a layer that independently verifies, at the point of action and reporting, the validity of the driving decision and the basis of the safety attributes remains not as one company's problem but as an operational challenge spanning both the operators deploying autonomous driving and the regulators and markets supervising it.

---

## 7. Lemma's Analysis

For the gap exposed here — the AI driving decision and the safety attributes flowing straight to action, disclosure, and markets while severed from independent verification of their basis — Lemma offers a design in which the basis of the decision and the crash / driving records are committed, at that moment, as independently verifiable cryptographic proofs, so that regulators and third-party verifiers can independently verify "the basis was met at the time / the record is complete" without the operator releasing its source data.

- **Decision-time attestation**: the premises of the decision to continue driving (e.g., the perception-input validity check passed) are attested with a signature at the moment of the decision. The validity of the premise is fixed as a proof at the time of action, not as after-the-fact labeling
- **Original binding and completeness of records**: crash and driving telemetry (video, EDR, CAN) is bound to the originals via docHash, making non-tampering — and the absence of arbitrary dropouts from the population — verifiable. "Which crashes to include" is not closed within the operator's internal process
- **Schema-bound proofs**: each proof is bound to the regulatory schema it satisfies (reporting obligations, metric definitions, comparison populations), so the regulator can verify directly against the schema
- **Selective disclosure**: only "the given metric is met as defined" is disclosed at minimum; driving video and source data that could identify individuals never leave the operator

A proof fixed at the point of action and reporting then functions, years later when "was the basis of the decision met at the time?" and "is the report complete?" are asked, as an independently verifiable trail that discloses no source data. Detection (after-the-fact regulatory investigation, investigative reporting) serves remediation after discovery; pre-execution attestation (verification at the time of action and reporting) serves independent verification of the driving decision and the safety attributes — complementary layers.

---

## 8. Sources

- **NHTSA ODI (primary)**: Engineering Analysis EA26002 opening notice (upgrade from PE24031, scope 3,203,754 vehicles, degradation-detection failure, possibility of under-reporting) — <https://static.nhtsa.gov/odi/inv/2026/INOA-EA26002-10023.pdf>
- **Reuters (investigative reporting, primary)**: “Why Tesla's AI trainers don't trust its self-driving tech — or its safety stats” (2026-05-28; roughly 3× inflation of the safety claim, asymmetric comparison population, researcher assessment) — <https://www.reuters.com/investigations/why-teslas-ai-trainers-dont-trust-its-self-driving-tech-or-its-safety-stats-2026-05-28/>
- **Electrek (secondary)**: “Tesla is one step away from having to recall FSD in NHTSA visibility crash probe” (2026-03-19; details and timeline of EA26002) — <https://electrek.co/2026/03/19/nhtsa-upgrades-tesla-fsd-visibility-investigation-3-2-million-vehicles/>
- **Electrek (secondary)**: “Tesla's own AI trainers don't trust 'Full Self-Driving' or its safety stats, Reuters finds” (2026-05-28; summary of the Reuters investigation) — <https://electrek.co/2026/05/28/tesla-fsd-safety-stats-misleading-reuters-investigation/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
