---
brief_no: 12
title: "Robert Williams wrongful arrest: A false facial-recognition match led all the way to an arrest (ACLU lawsuit and settlement)"
title_en: "Robert Williams wrongful arrest: A false facial-recognition match led all the way to an arrest (ACLU lawsuit and settlement)"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2020-01-09
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["061-hyundai-fca-phantom-braking", "005-noroboto-lying-fonts", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_lead_ja: "顔認識の誤った一致を起点に誤認逮捕、約 30 時間拘束 — Robert Williams 氏（米デトロイト）"
og_lead_en: "A false facial-recognition match led to the wrongful arrest of Robert Williams, held about 30 hours (Detroit)"
og_kicker_ja: "AI の判定 · 顔認識による誤認逮捕"
og_kicker_en: "AI DECISION · FACIAL RECOGNITION ARREST"
og_headline_ja: "顔認識の一致が、\n逮捕まで進んだ。\n<accent>約 30 時間の拘束</accent>"
og_headline_en: "A face-recognition match\nled to an arrest.\n<accent>Held about 30 hours</accent>"
key_figures:
  - value: "~30"
    unit: "hours"
    label: "How long Williams was held (January 2020)"
    tone: "alert"
  - value: "2024-06-28"
    label: "Settlement: arrests and photo lineups on FRT results alone banned; independent corroboration required"
  - value: "~200"
    unit: "algorithms"
    label: "Evaluated by NIST, which quantified false-positive bias across some groups (NISTIR 8280, 2019-12)"
glossary:
  - term: "Facial recognition technology (FRT)"
    desc: "Technology that compares a face image against photos in a database and returns similar candidates. It returns probabilistic candidates, not a confirmed identification."
  - term: "Photo lineup"
    desc: "An investigative step in which a witness is shown several face photos and asked to pick out someone they recognize."
  - term: "NISTIR 8280"
    desc: "The evaluation report on demographic effects in face recognition published by the US NIST in December 2019."
insight:
  slug: "ai-match-before-action"
  label: "A candidate, taken to action"
  quote: "An AI match is a probabilistic candidate; without a check, before action, for independent corroboration and approval, the candidate becomes the basis for an action that cannot be undone."
industries: ["public-sector", "ai"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "Do not proceed to arrest until the match is corroborated"
attack_method: "ai-misuse"
impact: "One man wrongfully arrested and held about 30 hours"
takeaway: "A facial-recognition match is a candidate, not an identification. Before an action such as an arrest, check that independent corroboration and approval exist."
self_check: "Before using an AI match in an action or decision, do you check that independent corroboration and approval exist?"
countries: ["us"]
---

## 1. Summary

An arrest on a theft charge started from a facial-recognition candidate produced by matching surveillance footage against driver's-license photos, and it later turned out to be a wrongful arrest. The ACLU lawsuit alleged that the match was treated as an identification without independent corroboration, and a 2024 settlement accepted a policy that bans arrests based on match results alone. <strong>An AI match is a probabilistic candidate; without a check, before action, for independent corroboration and approval, the candidate becomes the basis for an action that cannot be undone.</strong>

## 2. What got through

- **What got through**: The arrest, on a theft charge, of Williams, who had come up as a candidate in a facial-recognition match. Facial recognition technology (FRT) matched a still from 2018 surveillance footage at a Shinola store against a driver's-license database and returned a candidate; that candidate was used in a photo lineup, which led to the arrest in January 2020 (ACLU case summary). Williams was arrested in front of his home, in view of his family and neighbors, and held for about 30 hours.
- **What reached the receiving side**: In general, a match result arrives as a candidate face and a score. Unless the factors that lower reliability, such as the score and image quality, are shown at each stage of investigation, lineup and court, the receiving side cannot tell a candidate from an identification.
- **What the lawsuit alleged**: The ACLU alleged that the match result was carried into a photo lineup without independent corroborating evidence and treated as the basis for the arrest. The 2024 settlement includes a ban on arrests and lineups based on match results alone, and a duty of independent corroboration.
- **Not disclosed**: The match score and the name of the algorithm used. They are not in the sources reviewed.

## 3. Pre-execution check

The condition that holds regardless of the route is to check, before moving to an action on the basis of an AI match, that the result is tied to corroboration independent of the AI and to the approval of the person who authorizes the action.

- **Who approves**: The person who authorizes an action such as an arrest. They approve after looking at corroboration separate from the AI match. The match itself is no substitute for approval.
- **Where it is checked**: Before moving from a match to an action (a lineup or an arrest). Check that the match is tied to independent corroboration and approval; if it is not, hold.
- **What is recorded**: Which match was used, under which reliability conditions (score, image quality and so on), and with which corroboration and approval. In court or an audit, the basis for the action can be shown afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">Pre-execution check = before using an AI match in an action, check that it is tied to independent corroboration and approval, and keep a record. Detection = noticing the error after the action. Dates are those reported by the ACLU and the press.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · required by the 2024 settlement</b>Do not move to an arrest or lineup on a match alone; require independent corroboration</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Wrongful arrest starting from a face match<br>Held about 30 hours</span></div>
<div class="rx-zone det"><b>Detection · worked after the arrest</b>The lawsuit and settlement changed the policy</div>
<div class="rx-g g1"><div class="t">2018</div><b>Theft at a store; footage recorded</b></div>
<div class="rx-g g2"><div class="t">2020-01</div><b>Wrongful arrest; held about 30 hours</b></div>
<div class="rx-g g3"><div class="t">2021</div><b>ACLU files suit</b></div>
<div class="rx-g g4"><div class="t">2024-06-28</div><b>Settlement; restrictions accepted</b></div>
</div>
</figure>

The error was corrected only after the arrest and detention, through the lawsuit and settlement. Another case where an AI decision led directly to an action that could not be undone, without an independent check, is [Hyundai](/critical/briefs/061-hyundai-fca-phantom-braking/) (automatic braking activated with no danger). A case where the input to an AI was tampered with and the judgment distorted is [Noroboto](/critical/briefs/005-noroboto-lying-fonts/).

## 4. What Lemma does

**Lemma builds the check in section 3 into the step that moves from an AI match to an action.** It does not judge whether the match itself is right; before the action, and outside the AI, it checks that the result is tied to independent corroboration and approval, and keeps a record.

### Industries and operations to watch

- **Industry · Public sector**: Government bodies that use AI matches in actions that are hard to undo, such as arrests or benefit decisions.
- **Industry · AI adoption**: Organizations that build candidate-producing AI, such as facial recognition, into business decisions.
- **Operations · Approval**: Approving an action whose basis is an AI output.

### Current controls versus Lemma

The route in this case is column 1 (using an AI match as the basis for an arrest). Column 2 is the stage, after the action, of showing in court or an audit what the action was based on.

| Control | Using an AI match as the basis for an arrest | Showing the basis after the action |
| --- | --- | --- |
| Accuracy and bias evaluation (NIST and others) | Not effective | Not relevant |
| A photo lineup built on the match candidate | Not effective | Not relevant |
| A policy banning arrests on match results alone and requiring independent corroboration (2024 settlement) | Effective | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

Accuracy and bias evaluation underpins technology selection and operational limits, but it does not change whether each individual match was independently corroborated before an action. In this case the lineup was built on the match candidate and did not stop the arrest (as the ACLU alleged). The settlement policy bans arrests on match results alone, requires independent corroboration, and includes a duty to disclose reliability-lowering factors to investigators, the court and defense counsel. It is an operating rule, and it does not keep a record of the match outside the organization that took the action. Lemma checks, before the action and outside the AI, that the match is tied to independent corroboration and approval, and keeps which result was used under which conditions and approval.

Note: Lemma's check works only when it is built into the step that moves to an action, and corroboration and approval are managed outside the AI that produces the match. If the corroboration itself is wrong, this check can be passed. Lemma does not fix the accuracy or bias of the match. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that use AI matches in actions or decisions

- Before using an AI match in an action, do you check that independent corroboration exists?
- Do you pass reliability-lowering factors, such as the match score and image quality, to the person who approves the action?
- Do you keep a record that can show afterwards which match was used with which corroboration and approval?

## 5. Facts and timeline

- **Affected person**: Robert Williams (a Black American living in Michigan).
- **Investigating body**: Detroit Police Department.
- **AI system**: Facial recognition technology (FRT). It matched a still from 2018 surveillance footage at a Shinola store against a driver's-license database and returned Williams as a candidate. The match is a probabilistic score, not a confirmed identification.
- **Harm**: In January 2020 he was arrested in front of his home, in view of his family and neighbors, and held for about 30 hours.
- **Significance**: Regarded as the first publicly confirmed wrongful arrest caused by FRT in the United States. Several similar wrongful arrests have been reported since.
- **Technical background**: NIST's evaluation (NISTIR 8280, 2019-12) assessed about 100 developers and about 200 algorithms against more than 18 million images, and quantitatively showed bias in false positives across some race, age and sex groups in many algorithms.
- **Legal course**: The ACLU filed Williams v. City of Detroit, which was settled on 2024-06-28.

### Timeline

- **2018**: A theft occurs at a Shinola store, and surveillance footage is recorded.
- **2019-12**: NIST publishes NISTIR 8280 (FRVT Part 3: Demographic Effects).
- **2020-01**: The Detroit Police Department arrests Williams on the basis of an FRT match and holds him for about 30 hours (a wrongful arrest).
- **2021**: The ACLU files Williams v. City of Detroit.
- **2024-06-28**: A settlement is reached.
- **2024 onward**: The Detroit Police Department's use of FRT is reported to have shrunk substantially.

> The facts rest on the ACLU case summary and settlement summary, reporting by University of Michigan Law (Law Quadrangle) and Michigan Public, and NIST's evaluation. Statements about how the match was treated rest on the ACLU's allegations and the settlement terms. This Brief does not blame the police or any individual. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Detroit Police Department / settlement**: In the 2024-06-28 settlement, the department accepted a ban on arrests or photo lineups based on FRT results alone; a duty of independent corroborating evidence; a duty to disclose reliability-lowering factors of FRT searches to investigators, the court and defense counsel; and training on racial disparities in misidentification. It is described as the most stringent restriction in the country, and subsequent use is reported to have shrunk substantially.
- **ACLU / University of Michigan Law**: Led and documented the lawsuit and settlement, and set out the operating principle that FRT stays a "lead" and that corroboration by independent evidence is a precondition.
- **Regulatory and policy developments**: State-level limits on police use of FRT are being put in place.
- **Technical basis**: NISTIR 8280 continues to be cited as an evaluation that quantified false-positive bias across groups, and as a basis for operational limits.

## 6. Sources

- **ACLU**: "Williams v. City of Detroit" (case summary) — https://www.aclu.org/cases/williams-v-city-of-detroit-face-recognition-false-arrest
- **ACLU**: "Summary of Detroit Facial Recognition Settlement Agreement (Williams v. City of Detroit)" (2024, summary of settlement terms) — https://www.aclu.org/documents/summary-of-detroit-facial-recognition-settlement-agreement-williams-v-city-of-detroit
- **University of Michigan Law (Law Quadrangle)**: "Flawed Facial Recognition Technology Leads to Wrongful Arrest and Historic Settlement" (Winter 2024–2025) — https://quadrangle.michigan.law.umich.edu/issues/winter-2024-2025/flawed-facial-recognition-technology-leads-wrongful-arrest-and-historic
- **Michigan Public**: "'It didn't make sense at all': Wrongful facial recognition arrest in Detroit leads to landmark settlement" (2024-06-28) — https://www.michiganpublic.org/criminal-justice-legal-system/2024-06-28/it-didnt-make-sense-at-all-wrongful-facial-recognition-arrest-leads-to-landmark-settlement
- **NIST**: "Face Recognition Vendor Test (FRVT) Part 3: Demographic Effects" (NISTIR 8280, 2019-12) — https://nvlpubs.nist.gov/nistpubs/ir/2019/nist.ir.8280.pdf

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
