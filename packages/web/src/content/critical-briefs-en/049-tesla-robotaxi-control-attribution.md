---
brief_no: 49
title: "「自律走行」の事故記録が、自社の黒塗りと自己申告のまま検証されていなかった — 制御主体の帰属と走行判断の来歴が独立検証されない構造（Tesla Robotaxi / NHTSA）"
title_en: "Tesla Robotaxi Crash Records — Control Attribution and Narrative Provenance Left Self-Reported"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-05-15
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["043-tesla-fsd-self-reported-safety", "035-boeing-787-inspection-records", "012-williams-frt-wrongful-arrest"]
status: published
version: "1.0"
og_lead_ja: "「自律走行」事故の制御帰属と記録の来歴が自己申告 — Tesla Robotaxi"
og_lead_en: "Crash control attribution left self-reported — Tesla Robotaxi"
---

## TL;DR

When you hear that "a self-driving car crashed," you naturally picture a mistake by the autonomous system. But on 15 May 2026, Tesla unredacted the Robotaxi crash narratives it had filed with the federal regulator (NHTSA), revealing that at least 2 of the 17 Austin crashes were caused not by the autonomous system but by **the human teleoperators driving the cars remotely**. Tesla had also redacted every crash narrative as a "trade secret" — unlike peers such as Waymo and Zoox, which filed readable accounts. The structural problem: for each crash, **the attribution of "who or what was in control at that moment" and the provenance of the crash record itself remained self-reported and self-redacted under Tesla's own control, never independently verified.** We analyze this through Pillar 02 (Verifiable AI) as a structure in which control attribution and driving-decision provenance go unverified, framed as a division of labor with detection and disclosure. It connects to Briefs 043, 035, and 012.

---

## 1. Incident overview

- **Subject**: Tesla's Robotaxi (2026 Model Y operating in Austin, equipped with the ADS autonomous driving system, in the safety-monitor-onboard operating phase)
- **Unredaction**: On 2026-05-15, Tesla refiled its NHTSA submissions and disclosed the crash narratives. Previously it had redacted all of them as "confidential business information," in contrast to Waymo, Zoox, and others who filed readable accounts
- **Data scope**: 17 unique ADS crashes over the Austin Robotaxi test period (2025-07 to 2026-03). Each involved a 2026 Model Y with ADS engaged and a safety monitor onboard
- **Teleoperator-caused crashes**: 2 were caused not by the autonomous system but by a human driver operating the car remotely. In one (2025-07), after the ADS stopped and the safety monitor called in remote help, the teleoperator drove up a curb and made contact with a metal fence at ~8 mph (the only injury in this dataset — a minor injury that did not require hospitalization). In the other (2026-01), a teleoperator drove into a temporary construction barricade at ~9 mph
- **Frequency context**: As of 2026-02 the Austin fleet had driven ~800,000 miles and reported 14 crashes to NHTSA — about 1 per 57,000 miles, roughly 4× Tesla's own benchmark for human drivers (about 1 minor collision per 229,000 miles), as reported
- **The crux**: That a crash record exists and was reported to the regulator does not mean **the attribution of "who/what was in control" and the record's authenticity** were independently verified. Both the control attribution and the scope of disclosure depended, for the time being, on Tesla's self-reporting and self-redaction

---

## 2. Timeline

- 2025-07: Robotaxi testing begins in Austin; ADS crashes are reported to NHTSA thereafter. A teleoperator hits a fence (1 minor injury, no hospitalization)
- 2025-12: NHTSA separately opens a preliminary evaluation of FSD (58 consumer complaints: running red lights, crossing into oncoming lanes, etc.) (EA26002 / Brief 043 territory)
- 2026-01: A teleoperator hits a barricade at ~9 mph
- 2026-02: The Austin fleet has driven ~800,000 miles and reported 14 crashes cumulatively (~1 per 57,000 miles)
- 2026-05-15: Tesla refiles with the crash narratives unredacted. 2 of the 17 turn out to be teleoperator-caused

> Note: Most crashes were minor and attributed to other drivers, and Tesla's tally is reported to show no serious fault by the autonomous system. This Brief does not aim to adjudicate fault; it addresses the structure in which control attribution and record provenance go unverified. NHTSA's investigations and evaluations are ongoing separately.

---

## 3. Chain of events: control attribution and record provenance left unverified

This incident stems from a structure in which, at the time of a crash, the attribution of control and the provenance of the crash record are not independently verified outside the operator's own control. The path by which the failure propagates into "unverifiability":

1. **Handover of control**: In situations the autonomous system (ADS) cannot resolve, control is handed to a remote human driver or safety monitor. The timing, agent, and decision of the handover depend on the vehicle's own logs
2. **The crash occurs**: A crash happens, including during post-handover remote driving. Whether each crash was "due to an ADS decision" or "due to remote human operation" is left to after-the-fact record-keeping
3. **Self-reported record**: Control attribution and crash narrative are authored by the operator (Tesla) and reported to the regulator. The record's authenticity and completeness cannot be independently reconstructed from outside
4. **Self-redaction of the record**: The crash narrative is redacted as a "trade secret," so third parties cannot verify the details, including control attribution. Whether to disclose also depends on the operator's judgment
5. **After-the-fact disclosure**: Under regulatory and public pressure the redaction is lifted, and the teleoperator-caused crashes come to light. But this is an after-the-fact sequence that operates only after the crash and the initial report

---

## 4. Structural analysis

This incident belongs to the `ai-decision-integrity` category under Pillar 02 (Verifiable AI). The central failure primitive is that **the autonomous system's driving decisions and the attribution of "who/what was in control" at the time of a crash are not fixed as independently verifiable evidence at the moment of action, and instead depend on after-the-fact self-reporting and self-redaction.** As secondary we note `data-provenance` (the provenance of the crash record as evidence) and `attribute-proof-bypass` (the attribute "this was autonomous driving" goes unverified).

The phrase "a self-driving crash" obscures the attribution of control. As 2 of these were remote human driving, in an operation where control moves among the ADS, a remote human, and a safety monitor, "what was driving at that moment" is the premise of any safety assessment. Yet that attribution depends on the vehicle's logs and the operator's record-keeping, and cannot be independently reconstructed from outside. The existence of a crash record is not authentic proof of attribution.

It is adjacent to Brief 043 (the crash data and the "safer than humans" basis for autonomous driving remain self-reported and unverified) — a different cross-section, the provenance of the records, from the same operator. It is the same shape as Brief 035 (at Boeing 787, the existence of inspection records was mistaken for proof of inspection), moved onto autonomous-driving control attribution: **the existence of a record is not authentic proof of the fact recorded.** It also connects to Brief 012 (a facial-recognition AI determination led directly to a coercive administrative action without independent verification), in that an AI determination connects directly to safety or sanction while lacking independent verification. What this case shows is the consequence, in the public-space AI decisions of autonomous driving, of leaving control attribution and record provenance unverified.

---

## 5. The gap between detection and proof

Crash reports to NHTSA, regulatory investigations and preliminary evaluations, visibility through reporting, and Tesla's own lifting of the redaction are all indispensable for grasping harm, assessing safety, and preventing recurrence; this Brief does not deny that role. Filing and disclosing crash records are the foundation on which society assesses the safety of autonomous driving.

At the same time, detection and disclosure do not in themselves independently establish "who/what was in control at that moment" or "does this record reflect the facts without tampering." The crash report is authored by the operator, and the operator also decides the scope of narrative disclosure. As the teleoperator cause became known only after the redaction was lifted, the truth of control attribution depended on record-keeping and disclosure decisions. What was missing is "is this crash's control attribution and driving decision fixed in independently verifiable evidence at the moment of action," which is a separate track from after-the-fact reporting and disclosure. As long as the existence of a record is equated with proof of attribution, verification can only trail behind disclosure decisions.

The idea of pre-execution attestation inverts safety assessment from "trust the records submitted and disclosed after the fact" to "are the handover of control and the driving decisions fixed as independently verifiable evidence at the moment of action." By binding the switching of the controlling agent (ADS / remote human / safety monitor) and each decision to tamper-resistant provenance at the moment of action, "what was in control at the time of this crash" can be independently verified without depending on after-the-fact record-keeping or disclosure scope. Detecting a crash (the detection-style "did a crash occur") and proving control attribution and decision provenance ("what was in control, under what authorization, at that moment") are not substitutes but **complements**.

---

## 6. Response and industry trends

- **Tesla / NHTSA**: On 2026-05-15 Tesla lifted the redaction on its crash narratives, aligning to the disclosure level of Waymo, Zoox, and others. NHTSA continues to assess autonomous-driving safety, including its preliminary evaluation of FSD (opened 2025-12)
- **The record-provenance question**: In autonomous-driving crash reporting, how to independently verify control attribution (ADS / remote human / monitor) and record authenticity has surfaced as a cross-regulatory, cross-industry issue. The need to distinguish a record's "existence" and "filing" from "independent verification" of the recorded facts has been re-recognized
- **Cross-industry point**: There is growing discussion of shifting the center of gravity of autonomous-driving trust design away from depending on the operator's self-reporting for safety claims and crash records, toward fixing the handover of control and driving decisions in independently verifiable evidence at the moment of action (provenance / pre-execution attestation). In operations that include teleoperation, evidencing control attribution becomes an especially central point

---

## 7. Lemma's analysis

Against the gap this incident exposed (control attribution and driving-decision provenance are not independently verified at the moment of action and depend on after-the-fact self-reporting and self-redaction), Lemma proposes a design that fixes provenance and authorization as independently verifiable cryptographic proof at the moment of the decision or action.

- **Provenance-binding of control attribution**: Bind the handover of control (ADS ↔ remote human ↔ monitor) and each driving decision to tamper-resistant provenance at the moment of action, making "what was in control, under what authorization, at that moment" independently verifiable after the fact
- **Proof of record authenticity**: Bind crash records and telemetry to their issuance moment via docHash, making authenticity verifiable without depending on after-the-fact record-keeping or disclosure scope. Separate a record's "existence" from "proof" of the fact
- **Pre-execution attestation of attributes**: Present the attribute "this drive was autonomous / was remote-human" as independently verifiable evidence rather than self-reporting
- **Selective disclosure**: Reconcile trade secrets with independent safety verification — disclose only that "control attribution and record authenticity meet the verification conditions" without exposing sensitive internal information

Through this, proof fixed at the moment of action functions as an independently verifiable trail for "what was in control at the time of this crash, and is this record authentic," without depending on after-the-fact disclosure decisions. Detection and disclosure (after-the-fact reporting and unredaction) serve as the foundation for social assessment, while pre-execution attestation (fixing provenance and authorization at the moment of action) serves the independent verification of control attribution and records — each working complementarily.

---

## 8. Sources

- **Electrek**: "Tesla finally reveals what happened in 17 'Robotaxi' crashes" (2026-05-15; unredaction of narratives, 2 teleoperator-caused crashes, the trade-secret designation) — <https://electrek.co/2026/05/15/tesla-unredacts-robotaxi-crash-narratives-nhtsa/>
- **TechCrunch**: "Tesla reveals two Robotaxi crashes involving teleoperators" (2026-05-15; teleoperator-caused crashes, NHTSA filings) — <https://techcrunch.com/2026/05/15/tesla-reveals-two-robotaxi-crashes-involving-teleoperators/>
- **Electrek**: "Tesla 'Robotaxi' adds 5 more crashes in Austin in a month — 4x worse than humans" (2026-02-17; ~800k miles, 14 crashes, ~1 per 57k miles, ~4× human benchmark) — <https://electrek.co/2026/02/17/tesla-robotaxi-adds-5-more-crashes-austin-month-4x-worse-than-humans/>
- **NHTSA**: Standing General Order ADS Incident Reports (primary data of the autonomous-driving crash reporting regime) — <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
