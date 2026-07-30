---
brief_no: 76
title: "顔認証の「93% 一致」が、独立検証のないまま逮捕に直結した（Robert Dillon 誤認逮捕訴訟） — FRT の確率的一致が、逮捕という強制処分の前に独立裏付け・認可されなかった構造（ACLU 提訴）"
title_en: "A 93% Facial-Recognition 'Match' Led Straight to Arrest Without Independent Verification (Robert Dillon Wrongful Arrest Suit) — a probabilistic FRT match that was never independently corroborated or authorized before the coercive act of arrest (ACLU suit)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "identity-auth"]
incident_date: 2026-06-10
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety"]
status: published
version: "1.0"
og_lead_ja: "FRT の「93% 一致」が独立裏付けなく逮捕に直結 — Robert Dillon 誤認逮捕"
og_lead_en: "A 93% FRT 'match' drove arrest with no independent corroboration — Robert Dillon"
gap_detected: "FRT accuracy and bias evaluation, and after-the-fact error correction (the innocence coming to light, the lawsuit), functioned as a basis for technology selection, operational restrictions, and remedy for harm."
gap_missing: "For each individual '93% match' there was no layer to confirm whether independent corroboration (residence, distance, and the like) and authorization existed before the act of arrest, so a probabilistic candidate was treated as a positive identification."
gap_fix: "Before using an AI output in a coercive enforcement action such as arrest, independently verify with Lemma under what reliability conditions and with what independent corroboration and authorization the output is being used, and leave it as a tamper-evident record."
---

## 1. TL;DR

Robert Dillon, a Florida resident, was wrongfully arrested on theft charges in August 2024 as the wrong person whom facial recognition (FRT) had flagged as a "93% match." The crime scene he was supposedly matched to was in a city more than 300 miles from his home — a place he had never even visited. On June 10, 2026, the ACLU and others filed suit in federal district court on his behalf, arguing that police relied on a probabilistic AI match result while failing to adequately consider evidence of his innocence. This is reported to be at least the 15th publicly known FRT-induced wrongful arrest in the US. The core of this incident is that the FRT output — no more than a probabilistic candidate — functioned as the de facto basis for arrest, an irreversible coercive enforcement action, without any way to prove its reliability, independent corroboration, or authorization state. The same structure as [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (the Robert Williams wrongful arrest) recurred in a different jurisdiction with a different party.

---

## 2. What happened

- **Affected party**: Robert Dillon (age 52, resident of Fort Myers, Florida)
- **Government party**: Florida police (the law-enforcement agency that executed the arrest). The suit was filed in the US District Court for the Middle District of Florida
- **AI system**: Facial recognition technology (FRT). Matched a suspect captured in store surveillance footage in Jacksonville Beach against Dillon at "93% match"
- **Chain of failure**: The FRT match result was treated as suspect identification without passing through verification by independent corroborating evidence, and became the basis for the arrest. The matched crime scene was more than 300 miles from his residence, a place he had never visited
- **Damage**: Wrongfully arrested in August 2024. He was unconnected to the crime, and the charge could have been cleared early had there been a basic cross-check of residence and movements
- **Lawsuit**: On June 10, 2026, the ACLU and the law firm Hoguet Newman Regal & Kenney filed suit on his behalf. The complaint argues that police relied on an error-prone AI match result and failed to adequately consider evidence of innocence (residence, distance, and the like)
- **Historical position**: There are at least 15 publicly known FRT-induced wrongful arrests in the US. A woman eight months pregnant wrongfully arrested on carjacking charges, and a case where the person's height differed greatly from the person in the surveillance footage, are among those commonly reported for an absence of basic corroboration checks
- **Policy developments**: More than 20 cities and jurisdictions ban police use of FRT. In Detroit and Indiana, operations restricting arrests based solely on a face match and a photo lineup have been introduced

The incident came together as the following chain.

1. **AI output generation**: FRT matches the suspect in the surveillance footage against Dillon at "93% match." This is a probabilistic score, not a definitive identification
2. **Opacity of grounds**: The meaning of the match score, reliability-degrading factors such as image quality and shooting conditions, and the uncertainty of the candidate were not fixed in a verifiable form at each stage of investigation and the arrest decision
3. **Absence of independent verification**: A cross-check against basic corroboration such as residence, mobility, and distance (more than 300 miles) could have made the contradiction clear, but a probabilistic AI match was treated as de facto identification
4. **Direct path to enforcement action**: An unverified AI output functioned as the basis for arrest — an irreversible coercive enforcement action. No independent human confirmation sufficiently intervened before the action
5. **Context of structural bias**: FRT has repeatedly been reported to have bias in false positives across groups, and operations that act on probabilistic outputs without corroboration structurally raise the risk of misidentification for specific populations (the recurrence of at least 15 wrongful arrests is a manifestation of this)

---

## 3. Timeline — disclosure and response

- 2024-08: Florida police wrongfully arrest Dillon on theft charges based on an FRT "93% match." The matched scene is Jacksonville Beach, more than 300 miles from his residence
- 2024–2026: It becomes clear that he was unconnected to the crime, and the dispute over the charge continues
- 2026-06-10: The ACLU and Hoguet Newman Regal & Kenney file suit on his behalf in the US District Court for the Middle District of Florida, arguing reliance on FRT and an absence of corroboration review
- 2026-06 (around the filing): Reporting positions this case as "at least the 15th" FRT wrongful arrest, and debate over restricting police FRT operations reignites

> Note: The facts in this Brief are based on the ACLU's announcement, reporting on the complaint, and established media. The litigation is pending, and claims about the conduct of police include the plaintiff's allegations. This Brief is not a condemnation of the parties' motives or conduct; it focuses on the structure in which an AI output was not independently verified and authorized before a coercive enforcement action.

The response and industry movement after disclosure:

- **ACLU / Hoguet Newman Regal & Kenney**: Represent Dillon and filed suit in federal district court. Arguing reliance on FRT and an absence of independent corroboration review, they seek to establish the operational principle that AI outputs be kept to a "lead" and corroborated by independent evidence
- **Recurrence of wrongful arrests**: There are at least 15 publicly known FRT wrongful arrests in the US. The misidentification of a pregnant woman, the misidentification of a person of greatly differing height, and others share an absence of basic corroboration checks
- **Movement toward operational restrictions**: More than 20 cities and jurisdictions ban police FRT use. Detroit and Indiana restrict arrests based solely on a face match and a photo lineup. State-level guardrails are being put in place
- **Institutional-design argument**: The institutionalization of verification, disclosure, and authorization when AI outputs are used for government enforcement actions and benefit decisions is advancing as a cross-public-sector argument. FRT's bias in false positives across groups continues to be cited as the technical grounding for the danger of acting on probabilistic outputs without corroboration


How government, when using AI outputs in enforcement actions, should prove "under which verification and authorization the judgment was used" is expected, on the occasion of this incident, to be discussed as a mandatory requirement of public-sector procurement and institutional design.

---

## 4. Why it wasn't stopped

The central **failure primitive is "accepting the AI's judgment output (a probabilistic face match) as the de facto basis for arrest, a coercive enforcement action, without a record that could prove its grounds, reliability, independent corroboration, and authorization"**.

The primitive is nearly identical to [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (the Robert Williams wrongful arrest, Detroit 2020). 012 is regarded as the first publicly confirmed FRT wrongful arrest in the US, and in the 2024 settlement the Detroit Police Department accepted a ban on arrests based on FRT alone, mandatory independent corroboration, and an obligation to disclose reliability-degrading factors. This incident shows that the requirement that remedy indicated — that the use of AI outputs requires an independent record of verification and authorization — is still unmet in another jurisdiction. It is also connected to [Brief 043](/critical/briefs/043-tesla-fsd-self-reported-safety/) (Tesla FSD's self-reported safety) and [Brief 049](/critical/briefs/049-tesla-robotaxi-control-attribution/) (Tesla Robotaxi's control attribution and self-redaction of records) through the structure in which **an AI judgment or record flows directly into a serious downstream decision while detached from the layer of independent verification**. Just as 043/049 were structures in which "the act itself (self-reporting, self-redaction) is absent of verification," this incident is likewise a structure in which "the operation of acting on a probabilistic output without corroboration" is itself absent of verification.

This incident is not an attack incident; it is a trust-layer risk event in the public sector's use of AI (per the Methodology's scope expansion, in line with [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/)'s position). As the situations in which government uses AI outputs for enforcement actions and benefit decisions expand, the case sits as a representative one in which the layer that can prove whether a judgment was independently verified and authorized before action is being called into question as an institutional requirement. Lemma does not guarantee the fairness of the judgment itself; its scope is to leave the fact that the judgment was (or was not) independently verified and authorized before action as a tamper-evident record.

FRT and its accuracy evaluation have a certain role as a means of initial narrowing in investigation, and this Brief does not deny that role. Measurement of accuracy and bias (detection-style evaluation) is important as a basis for technology selection and operational restrictions.

That said, accuracy scores and a match rate such as "93%" do not change whether each individual judgment was "independently corroborated and authorized before the act of arrest." In this incident, the fact that the FRT output was no more than a probabilistic candidate, its reliability-degrading factors, and the presence or absence of independent corroboration (residence, distance, and the like) were not fixed as a verifiable record before the enforcement action. The remedies the [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) settlement imposed — a ban on arrests based on FRT alone, mandatory independent corroboration, disclosure of reliability factors — are precisely the requirement that "the use of AI outputs requires an independent record of verification and authorization." As material for establishing in regulatory reporting, judicial proceedings, or administrative audit that "this AI output was independently verified and authorized before action," the match score itself carries no independent attribution residue.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design in which, before an AI output is used in downstream decision-making such as an enforcement action, "which output," "under which reliability conditions," and "under which independent corroboration and authorization" it is used are fixed as an independently verifiable record. If the proof says "no independent corroboration" or "no authorization," the enforcement action based on that output is held off in advance. Accuracy evaluation (detection) and the record of verification and authorization (proof) are in a **complementary**, not substitutive, relationship.

Against the detection–proof gap exposed by this incident (an AI judgment output functions as the basis for a government enforcement action without being able to independently prove its grounds, verification state, and authorization), Lemma proposes a design that, at the point an AI output is used in downstream decision-making, fixes the conditions of its use as an independently verifiable cryptographic proof.

- **Pre-execution attestation of output use**: fix "which output," "under which reliability conditions," and "under which independent corroboration and authorization" it is used as an independently verifiable record before the enforcement action; if corroboration or authorization is absent, the action is withheld
- **Tamper-evident record**: leave the fact that the judgment was (or was not) independently verified and authorized before action as a record that cannot be altered after the fact
- **Does not guarantee fairness, but satisfies accountability**: Lemma does not guarantee the fairness of the judgment itself, but corresponds to an audit/attribution layer for the institutional fulfillment of accountability in government AI use, and can be built into public-sector procurement via system integration
- **Selective disclosure**: without fully exposing source data or internal state, disclose only that "this output was used under independent corroboration and authorization"

Detection (measuring FRT accuracy, after-the-fact error correction) works to grasp and remedy harm, while pre-execution attestation (a record that independently verifies an AI output's corroboration and authorization before the enforcement action) works to establish trust before the judgment is acted on — the two are complementary. For details of the design, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for a reference implementation, see the [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub). For the design and its scope, see also [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/verifiable-ai/).

---

## 6. Sources

- **CBS News**: “Florida man blames wrongful arrest on ‘error-prone’ AI facial recognition” (2026-06) — <https://www.cbsnews.com/news/lawsuit-wrongful-arrest-ai-facial-recognition/>
- **WUSF**: “How an AI facial recognition tool led to a Florida man's wrongful arrest” (2026-06-18) — <https://www.wusf.org/courts-law/2026-06-18/ai-facial-recognition-tool-led-to-florida-man-wrongful-arrest-lawsuit>
- **Common Dreams**: “Florida Man's Wrongful Arrest Suit Highlights Dangers of AI Facial Recognition in Policing” (2026-06) — <https://www.commondreams.org/news/police-facial-recognition>
- **University of Michigan Law (Law Quadrangle, Williams precedent)**: “Flawed Facial Recognition Technology Leads to Wrongful Arrest and Historic Settlement” (Winter 2024–2025) — <https://quadrangle.michigan.law.umich.edu/issues/winter-2024-2025/flawed-facial-recognition-technology-leads-wrongful-arrest-and-historic>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
