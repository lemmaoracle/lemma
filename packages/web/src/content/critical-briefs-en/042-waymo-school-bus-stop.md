---
brief_no: 42
title: "Waymo：自動運転車が、停止中のスクールバスを止まらずに通り過ぎた — 走行判断が、安全に関わる行動の前に独立検証されない構造（NHTSA）"
title_en: "Waymo: the robotaxi drove past a stopped school bus — a driving decision not independently verified before a safety-critical action"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2025-12-05
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety", "012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
version: "1.0"
og_lead_ja: "自動運転車が停止中のスクールバスを止まらず通過 — Waymo"
og_lead_en: "A robotaxi drove past a stopped school bus — Waymo"
gap_detected: "Video footage, a school district report, and the NHTSA crash report made the incident visible after the fact, leading to investigation and recall."
gap_missing: "Before taking the action of driving past, there was no layer to independently confirm whether the bus ahead was stopped and the stopping obligation was met, so rule compliance was left to a judgment internal to the system."
gap_fix: "Before taking a safety-critical action such as a stopping obligation, independently verify with Lemma that the driving decision satisfies the safety rules, and prevent it up front."
---

## TL;DR

A Waymo robotaxi drove past a stopped school bus with red lights on and stop arm out, and NHTSA opened a probe. Footage, district reports, and crash reports made incidents visible, but all act after the action — and continued even after Waymo's fix and recall. What is structurally missing is a layer that verifies, before the car passes, that the bus is stopped and the duty to stop is met. That was left to the system's judgment. Detection and pre-execution attestation of origin and authorization are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: Waymo's self-driving vehicles (ADS-equipped robotaxis, operating in Atlanta, Austin, and elsewhere).
- **What happened**: Against a stopped school bus (red lights on, stop arm deployed), Waymo vehicles failed to stop and drove past, or did not remain stopped. In the U.S., passing a stopped school bus is illegal — a safety rule tied directly to children boarding and alighting.
- **Scale**: The Austin school district logged 19 instances this school year, one just after a child had crossed in front of the car; at least 6 more occurred in Atlanta in 2025. NHTSA ODI is also examining 22 reports including collisions with fixed and semi-fixed objects (gates, chains) and parked vehicles, and disregard of signal controls.
- **Response**: Waymo identified the software fault and deployed an update by 2025-11-17. In December 2025 it conducted a voluntary software recall (3,067 fifth-generation ADS vehicles) with NHTSA. The district reported, however, that incidents continued after the update.
- **The core**: The recall and software update are after-the-fact remediation. The issue is that **the safety-critical driving judgment — "the bus ahead is stopped and I am obligated to stop" — was not satisfied in an independently verifiable form before the car took the action of passing.**

---

## 2. Timeline

- 2025-10: NHTSA ODI opens a probe after footage (media reporting) of a Waymo vehicle passing a stopped school bus in Atlanta.
- 2025-11-17: Waymo says it identified the software fault and deployed an update.
- 2025-12-03: NHTSA sends Waymo a letter requesting answers to a set of questions by 2026-01-20.
- 2025-12: Waymo conducts a voluntary software recall (3,067 fifth-generation ADS vehicles) with NHTSA.
- After 2025-12: The Austin district reports incidents continued after the update.
- 2026: NHTSA expands the probe to 22 reports, including failures to remain stopped for buses with red lights and stop/crossing arms deployed, and collisions with fixed objects / running signals. Zoox is separately under investigation over two rear-end crashes from unexpected hard braking.

> Note: The recall count (3,067) and incident counts are based on the NHTSA recall document and reporting. To avoid confusion with Waymo's separate recall (~3,800 vehicles, over driving through flooded roads), this Brief is limited to the school-bus recall.

---

## 3. The chain: a safety-rule judgment unverified before the action

This incident stems from a self-driving system's driving decision not being independently verified before a safety-critical action. The path by which the failure propagates into a public-space event is as follows.

1. **Perceiving the situation**: The ADS perceives the bus ahead and its state (red lights, stop arm, children boarding/alighting). Perception and applying the rule "I must stop" are left to the system's internal judgment.
2. **Deciding the action**: The system decides to stop / pass and controls the car. Whether that decision "satisfies the duty to stop" is not independently verified from outside before the action.
3. **The rule-violating action**: It passes when obligated to stop. A public-safety rule tied directly to children boarding is violated as a physical action.
4. **After-the-fact detection**: The incident becomes visible through footage, district reports, and reports to NHTSA. This is an after-the-fact chain that acts after the action.
5. **Remediation and recurrence**: Waymo updates the software and issues a recall, but incidents were reported even after the update. Remediation is an after-the-fact correction of the judgment, not independent verification before each action.

---

## 4. Structural analysis

This incident belongs to the `ai-decision-integrity` category of Pillar 02 (Verifiable AI). The central failure primitive is that **a self-driving system's driving decision (here, applying the safety rule "the duty to stop for a stopped school bus") is not fixed as an independently verifiable trail before the car acts, and rule-satisfaction depends on the system's internal judgment and its after-the-fact detection.** We note `data-provenance` (the provenance of driving decisions and telemetry as a trail) as a secondary category.

This incident is in the same self-driving cluster as Brief 049 (Tesla Robotaxi), but a different cross-section. 049 addressed **control attribution and the provenance of records** at the time of a crash (who/what was in control, are the records authentic). This incident addresses a case where the controlling agent is clearly the ADS, yet **the driving decision itself is not independently verified, before the action, against the safety rule.** It is the same shape as Brief 012 (a facial-recognition determination led directly to a coercive administrative disposition without independent verification), moving "an AI decision leads directly to an irreversible public-space action without independent verification" into self-driving. It connects to Brief 043 (a safety attribute left as self-attestation, unverified) in that the safety claim/decision sits outside independent verification.

That incidents continued after the software update sharpens the point. Remediation is an after-the-fact correction of the decision model — a separate chain from a layer that independently verifies, before each action, that "this action now satisfies the safety rule." An update may improve the decision distribution, but without independent verification before each action, the residual incidents can only be caught inside the detect-and-remediate loop.

---

## 5. The gap between detection and proof

NHTSA ODI's investigation, the district's reports, analysis of onboard telemetry, and Waymo's software update and recall are indispensable for grasping the harm, evaluating safety, and preventing recurrence, and this Brief does not negate that role. Making incidents visible and remediating them is the basis on which society evaluates self-driving safety.

At the same time, detection provides no material to independently establish — **before the action** — whether the driving decision about to be taken satisfies the safety rule. Passing a stopped school bus is an action the system executed as a legitimate driving decision, indistinguishable in its communications and controls from normal operation. After-the-fact telemetry analysis reconstructs "what happened," but not "was that decision independently verified to satisfy the rule before the action." A recall and a model update also correct the decision distribution after the fact, not independently before each action. That incidents continued after the update shows the detect-and-remediate loop alone cannot stop residual risk before the action.

Pre-execution attestation flips a safety-critical driving decision from "verify it by telemetry after the fact" to "fix the satisfaction of the safety rule to an independently verifiable trail before the action." Bind the judgment "I satisfied the duty to stop for a stopped school bus" to a tamper-resistant provenance at the moment of the act, so that whether each action satisfied the rule can be independently verified without depending on after-the-fact record-keeping or remediation. Detecting crashes/violations (the detection-style "what happened") and proving the driving decision ("was that action independently verified to satisfy the safety rule before the action") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **Waymo / NHTSA**: Waymo identified the software fault and issued an update and a voluntary recall. NHTSA ODI expanded its probe in 2026, continuing to cover failures to remain stopped for school buses and collisions with fixed objects / running signals. Zoox is separately under investigation over rear-end crashes from unexpected hard braking.
- **The limits-of-remediation question**: That incidents were reported after the software update raises the need to distinguish after-the-fact correction of the decision model from independent verification before each action.
- **A cross-industry issue**: There is a move to shift the center of gravity of trust design — not relying solely on the operator's after-the-fact telemetry and remediation, but fixing safety-critical driving decisions to an independently verifiable trail at the moment of the act (provenance / pre-execution attestation).

The structure in which an AI's driving decision leads directly to action without independent verification, in the irreversible space of public roads, is not a problem of a specific company; it remains a trust-design challenge for the whole social deployment of self-driving.

---

## 7. Lemma's analysis

Against the gap this incident exposed (a self-driving system's driving decision is not independently verified before a safety-critical action), Lemma proposes a design that fixes, at the moment of the decision/act, its satisfaction and authorization as an independently verifiable cryptographic proof.

- **Provenance binding of the driving decision**: Tie safety-critical driving decisions (satisfying the duty to stop, etc.) to a tamper-resistant provenance at the moment of the act, making "was this action independently verified to satisfy the safety rule" verifiable after the fact.
- **Record authenticity proof**: Bind driving decisions and telemetry at the moment of issuance via a docHash, making authenticity verifiable without depending on after-the-fact record-keeping.
- **Independent-verification gate on decisions**: Aim for a design in which a safety-critical action executes not on internal judgment alone, but only when an independently verifiable proof of rule-satisfaction is met.
- **Selective disclosure**: Without exposing the internal perception model or implementation, disclose only the minimum — that "this action met the safety-rule verification condition" — reconciling independent verification with the protection of sensitive information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this driving decision satisfied the safety rule before the action," without depending on after-the-fact remediation. Detection (after-the-fact reports, telemetry, recalls) works on social evaluation and remediation; attestation (independent verification of the decision at the moment of the act) works on proving rule-satisfaction — each complementary to the other.

---

## 8. Sources

- **TechCrunch**: "Waymo to issue software recall over how robotaxis behave around school buses" (2025-12-05) — <https://techcrunch.com/2025/12/05/waymo-to-issue-software-recall-over-how-robotaxis-behave-around-school-buses>
- **CBS News**: "Waymo recalls more than 3,000 vehicles over faulty software following school bus violations" — <https://www.cbsnews.com/news/waymo-recall-3000-vehicles-software-school-bus/>
- **CBS News**: "U.S. expands investigation into Waymo over robotaxis driving around stopped school buses" — <https://www.cbsnews.com/news/waymo-investigation-nhtsa-robotaxis-passing-school-bus>
- **NHTSA**: Standing General Order ADS Incident Reports (primary data of the ADS crash-reporting program) — <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
