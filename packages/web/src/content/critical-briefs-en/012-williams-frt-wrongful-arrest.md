---
brief_no: 12
title: "Robert Williams 誤認逮捕 — 顔認識の AI 判定が独立検証なく行政の強制処分に直結した構造"
title_en: "The Robert Williams Wrongful Arrest — When an AI Face-Match Drove a Government Enforcement Action Without Independent Verification"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2020-01-09
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["005-noroboto-lying-fonts", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
og_lead_ja: "顔認識の AI 判定が独立検証なく強制処分に直結 — Robert Williams 誤認逮捕"
og_lead_en: "AI face-match drove enforcement with no independent verification — Robert Williams"
gap_detected: "Evaluations measuring facial-recognition accuracy and bias (such as NIST) functioned as a basis for technology selection and operational limits."
gap_missing: "For each individual match there was no layer to confirm whether independent corroboration and authorization existed before the act of arrest, so a probabilistic candidate was treated as a positive identification."
gap_fix: "Before using an AI judgment in a decision such as a coercive enforcement action, independently verify with Lemma under what reliability conditions and with what independent corroboration and authorization the output is being used, and prevent it up front."
---

## 1. TL;DR

The Detroit Police Department wrongfully arrested Robert Williams, a Black American, and held him roughly 30 hours on a false facial-recognition (FRT) match. The AI match — a probabilistic candidate from a surveillance still and a driver's-license photo — was treated as identification of the suspect without independent corroboration and drove the arrest directly: the first publicly confirmed FRT-induced wrongful arrest in the US. Accuracy and bias evaluations such as NIST's inform technology selection but cannot change whether each match was independently corroborated and authorized before action.

---

## 2. What happened

- **Affected party**: Robert Williams (a Black American, Michigan resident)
- **Government party**: Detroit Police Department
- **AI system**: Facial recognition technology (FRT). Matched a still frame from 2018 Shinola store surveillance footage against a driver's-license database and presented Williams as a candidate
- **Chain of failure**: The FRT match result was carried into a photo lineup without independent corroborating evidence and treated as the basis for the enforcement action (arrest)
- **Damage**: In January 2020, arrested in front of his home in view of family and neighbors and held for approximately 30 hours
- **Historical position**: Regarded as the first publicly confirmed FRT-induced wrongful arrest in the United States. Several similar wrongful arrests have since been reported
- **Technical background**: NIST's large-scale evaluation (NISTIR 8280, 2019-12) had quantitatively shown bias in false positives across some race, age, and sex groups in many algorithms
- **Legal outcome**: The ACLU filed Williams v. City of Detroit. The case was settled on 2024-06-28, with the Detroit Police Department accepting what is considered the most stringent FRT restriction policy in the country

The incident came together as the following chain.

1. **AI output generation**: FRT matches the surveillance still frame against the license photograph and outputs Williams as a candidate. The match is a probabilistic score, not a definitive identification
2. **Opacity of grounds**: The grounds for the match (score, image quality, reliability-degrading factors) were not structured to be sufficiently disclosed and verified at each stage of investigation, photo lineup, and judicial process
3. **Absence of independent verification**: The FRT output was carried into the photo lineup without independent corroborating evidence, and the AI's candidate presentation was treated as de facto identification
4. **Direct path to enforcement action**: An unverified AI output functioned as the basis for arrest — an irreversible government enforcement action. No independent human confirmation intervened before the action
5. **Amplification of structural bias**: The bias in false positives across groups that NIST had shown structurally raised the wrongful-arrest risk against specific populations

---

## 3. Timeline — disclosure and response

- 2019-12: NIST publishes FRVT Part 3: Demographic Effects (NISTIR 8280). Evaluates approximately 100 developers and approximately 200 algorithms against over 18 million images and quantifies bias in false positives across some groups
- 2018: A theft occurs at the Shinola store; surveillance footage is recorded
- 2020-01: The Detroit Police Department wrongfully arrests Williams on the basis of an FRT match and holds him for approximately 30 hours
- 2021: The ACLU files Williams v. City of Detroit
- 2024-06-28: Settlement is reached. The Detroit Police Department accepts the policy including a ban on arrests or photo lineups based on FRT results alone, mandatory independent corroboration, disclosure obligations, and training
- 2024 onward: The Detroit Police Department's FRT operation is significantly scaled back (reporting indicates that the number of operations and actionable leads has fallen notably)

> Note: Proper nouns and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies by point in time, so consult the latest information.

The response and industry movement after disclosure:

- **Detroit Police Department / settlement**: In the 2024-06-28 settlement, the department accepted a ban on arrests or photo lineups based on FRT results alone; mandatory independent corroborating evidence; an obligation to disclose reliability-degrading factors of FRT searches to investigation, the court, and defense counsel; and training on racial disparities in misidentification. It is considered the most stringent FRT restriction policy in the country, and subsequent operations have been significantly scaled back
- **ACLU / University of Michigan Law**: Led and recorded the litigation and settlement. Established the operational principle that FRT be kept to a "lead" and that corroboration by independent evidence be a precondition
- **Regulatory and policy developments**: State-level guardrails for police use of FRT are being put in place. The institutionalization of verification, disclosure, and authorization when government uses AI outputs in decision-making is advancing as a cross-public-sector argument
- **Technical basis**: NISTIR 8280 (2019-12), which quantified bias in false positives across groups, continues to be cited as technical grounding for operational restrictions

How government, when using AI outputs in enforcement actions, benefit decisions, and the like, should prove "under which verification and authorization the judgment was used" is expected to be discussed as a mandatory requirement of public-sector procurement and institutional design going forward.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the AI's judgment output (a probabilistic face match) being accepted as the de facto basis for a government enforcement action without an accompanying record that could independently prove its grounds, reliability, and verification state."**

It shares Pillar 02 with [Brief 005](/critical/briefs/005-noroboto-lying-fonts/) (Noroboto, font-impersonation-induced misdirection of AI document review) but addresses a different target. [Brief 005](/critical/briefs/005-noroboto-lying-fonts/) was a case in which AI **input** was tampered with and judgment was distorted; this incident is a case in which AI **output** flowed directly into downstream decisions without verification. Both share the structure that "an AI judgment is detached from the layer that independently verifies its grounds." It is also adjacent to [Brief 011](/critical/briefs/011-synthid-watermark-reverse-engineering/) (SynthID) on the point that authenticity of AI-related content or judgment is not independently verified (011 is the stripping of provenance marks; this incident is the absence of verification of judgment grounds).

This incident is not an attack incident; it is a trust-layer risk event in the public sector's use of AI (per the Methodology's scope expansion, in line with [Brief 008](/critical/briefs/008-discord-scraping/)'s position). As government use of AI outputs in decision-making expands, the case sits as a representative one in which the verifiability of judgment is being called into question as an institutional requirement.

FRT and its accuracy evaluation (NIST and others) have a certain role as a means of initial narrowing in government and investigation, and this Brief does not deny that role. Measurement of accuracy and bias (detection-style evaluation) is essential as a basis for technology selection and operational restrictions.

That said, accuracy scores and bias measurements do not change whether each individual judgment was "independently corroborated and authorized before action." In this incident, the fact that the FRT output was no more than a probabilistic candidate, its reliability-degrading factors, and the presence or absence of independent corroboration were not fixed as a verifiable record before the enforcement action. The remedies the settlement imposed — a ban on arrests based on FRT alone, mandatory independent corroboration, an obligation to disclose reliability factors — are precisely the requirement that "the use of AI outputs requires an independent record of verification and authorization." As material for establishing in regulatory reporting, judicial proceedings, or administrative audit that "this AI output was independently verified and authorized before action," accuracy scores themselves carry no independent attribution residue.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design in which, before an AI output is used in downstream decision-making, "which output," "under which reliability conditions," and "under which independent corroboration and authorization" it is used are fixed as an independently verifiable record. If the proof says "no independent corroboration" or "no authorization," the enforcement action based on that output is held off in advance. Accuracy evaluation (detection) and the record of verification and authorization (proof) are in a **complementary**, not substitutive, relationship.

Against the detection–proof gap exposed by this incident (an AI judgment output functions as the basis for a government enforcement action without being able to independently prove its grounds, verification state, and authorization), Lemma proposes the following design elements.

- **Fixing the conditions of output use**: At the point an AI output is used in downstream decision-making, fix "which output," "under which reliability conditions," and "under which independent corroboration and authorization" it was used as an independently verifiable cryptographic proof.
- **Hold-off decision before action**: If the proof says "no independent corroboration" or "no authorization," the enforcement action based on that output is held off in advance.
- **Tamper-evident record**: Lemma does not guarantee the fairness of the judgment itself, but it leaves the fact that the judgment was (or was not) independently verified and authorized before action as a tamper-evident record.
- **Built into procurement requirements**: As an audit and attribution layer, it can be built into public-sector procurement requirements via system integration.

This corresponds to an audit and attribution layer for the institutional fulfillment of accountability in government AI use, and combined with accuracy evaluation (detection) it establishes the trust boundary for the use of AI outputs.

---

## 6. Sources

- **ACLU**: "Williams v. City of Detroit" (case summary) — https://www.aclu.org/cases/williams-v-city-of-detroit-face-recognition-false-arrest
- **ACLU**: "Summary of Detroit Facial Recognition Settlement Agreement (Williams v. City of Detroit)" (2024, summary of settlement terms) — https://www.aclu.org/documents/summary-of-detroit-facial-recognition-settlement-agreement-williams-v-city-of-detroit
- **University of Michigan Law (Law Quadrangle)**: "Flawed Facial Recognition Technology Leads to Wrongful Arrest and Historic Settlement" (Winter 2024–2025) — https://quadrangle.michigan.law.umich.edu/issues/winter-2024-2025/flawed-facial-recognition-technology-leads-wrongful-arrest-and-historic
- **Michigan Public**: "'It didn't make sense at all': Wrongful facial recognition arrest in Detroit leads to landmark settlement" (2024-06-28) — https://www.michiganpublic.org/criminal-justice-legal-system/2024-06-28/it-didnt-make-sense-at-all-wrongful-facial-recognition-arrest-leads-to-landmark-settlement
- **NIST**: "Face Recognition Vendor Test (FRVT) Part 3: Demographic Effects" (NISTIR 8280, 2019-12) — https://nvlpubs.nist.gov/nistpubs/ir/2019/nist.ir.8280.pdf
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/verifiable-ai/), [Trust402](https://lemma.frame00.com/trust402/)
