---
brief_no: 78
title: "TennCare Connect: Defects in automated eligibility decisions illegally cut people off Medicaid (federal court ruling, reporting)"
title_en: "TennCare Connect: Defects in automated eligibility decisions illegally cut people off Medicaid (federal court ruling, reporting)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2024-08-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "報道によれば、米テネシー州中部地区の連邦地裁は、適格判定システム TennCare Connect の不具合により、数千人の Medicaid の給付が違法に打ち切られたと判断した（2024 年 8 月）"
og_lead_en: "According to reporting, the federal district court for the Middle District of Tennessee ruled that defects in the TennCare Connect eligibility system illegally cut thousands of people off Medicaid (August 2024)"
og_kicker_ja: "自動の判定 · 公共の給付"
og_kicker_en: "AUTOMATED DECISION · MEDICAID"
og_headline_ja: "自動の適格判定で、\n数千人の給付が\n違法に打ち切られたと\n<accent>連邦地裁が判断</accent>"
og_headline_en: "An automated eligibility\ncheck cut thousands off\nMedicaid illegally,\n<accent>a federal court ruled</accent>"
key_figures:
  - value: "Thousands"
    label: "People the federal court found were illegally cut off from benefits (reporting)"
    tone: "alert"
  - value: "$400M+"
    label: "What Tennessee spent on TennCare Connect (reporting)"
  - value: "2020 → 2024-08"
    label: "Class action filed → federal court ruling (reporting)"
glossary:
  - term: "Medicaid"
    desc: "The US program that pays medical costs from public funds for people who meet conditions such as income. It is run state by state."
  - term: "TennCare / TennCare Connect"
    desc: "TennCare is Tennessee's Medicaid program. TennCare Connect is the system that automatically determines eligibility from income and health information."
  - term: "Eligibility determination"
    desc: "Deciding whether an applicant or recipient meets the conditions for benefits. It depends on inputs such as household composition and income."
insight:
  slug: "automated-eligibility-before-termination"
  label: "A decision, taken straight to termination"
  quote: "Without a step that checks, before an action that is hard to undo such as a termination, that an automated decision's inputs and assumptions match the source records, the decision passes as the basis for the action even on wrong inputs."
industries: ["public-sector", "healthcare"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "Do not cut off benefits until the decision is confirmed to rest on correct data and household"
impact: "Thousands illegally cut off from benefits, a federal court found (reporting)"
takeaway: "Before cutting off benefits on an automated eligibility decision, check that the inputs and household assumptions it used match the source records."
self_check: "Before stopping benefits or services on an automated decision, do you check that the inputs and assumptions it used match the source records?"
countries: ["us"]
---

## 1. Summary

TennCare Connect, an eligibility system built by Deloitte and others on which Tennessee spent over $400 million, automatically determines eligibility for Medicaid and other programs from income and health information. According to reporting, the system sometimes failed to load the proper data, assigned recipients to the wrong household, and produced incorrect eligibility decisions. In August 2024, the federal district court for the Middle District of Tennessee ruled that these defects illegally cut thousands of people off their benefits (reporting). <strong>Without a step that checks, before an action that is hard to undo such as a termination, that an automated decision's inputs and assumptions match the source records, the decision passes as the basis for the action even on wrong inputs.</strong>

## 2. What got through

- **What got through**: Terminating Medicaid benefits on the basis of TennCare Connect's automated decision of "ineligible." According to reporting, the system (1) sometimes failed to load the proper data, (2) assigned recipients to the wrong household, and (3) produced incorrect eligibility decisions. The federal court ruled that these defects illegally cut thousands of people off their benefits (in a class action filed in 2020).
- **What reached the receiving side**: In general, what reaches the step that carries out a termination is the decision "ineligible." The decision alone does not show which inputs, and which assumptions about household composition, it was made on.
- **How it was detected**: According to reporting, the errors were contested only after the terminations, when recipients appealed and a class action was filed in 2020.
- **Not disclosed**: The reporting reviewed does not say which data failed to load or by what route, what review steps existed before termination, or the status of disputes and remediation after the ruling.

## 3. What to check

The condition that holds regardless of the route is to check, before cutting off benefits on an automated decision, that the inputs and household-composition assumptions the decision used match the source records.

- **Who approves**: The person who decides on the termination, and the source records for the inputs the decision used (records of income, household and so on). The origin of the inputs is shown separately from the system that makes the decision. The decision itself is no substitute for approving the termination.
- **Where it is checked**: Before moving from a decision to a termination. Compare the inputs and household assumptions the decision used against the source records; if any input does not match or was not loaded, hold the termination until it can be confirmed.
- **What is recorded**: Which decision was used for the termination, on which inputs and household assumptions, and under whose approval. It gives a trail for tracing the basis of the termination later, in an appeal or an audit.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">Pre-execution check = before cutting off benefits on an automated decision, check the inputs and household assumptions it used against the source records, and keep a record. Detection = noticing the error after the termination, through appeals or litigation. Dates follow reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible from what was disclosed</b>Before terminating on a decision, check its inputs and household assumptions against the source records</div>
<div class="rx-zone gapz"><b>Federal court ruling (reporting)</b><span>Defects in automated eligibility decisions<br>illegally cut thousands off their benefits</span></div>
<div class="rx-zone det"><b>Detection · worked after the terminations</b>Contested through recipients' appeals and a class action; the federal court ruled</div>
<div class="rx-g g1"><div class="t">2019–2020</div><b>Wrongful terminations surface</b></div>
<div class="rx-g g2"><div class="t">2020</div><b>Class action filed</b></div>
<div class="rx-g g3"><div class="t">2024-08</div><b>Federal court rules</b></div>
<div class="rx-g g4"><div class="t">2024 onward</div><b>Errors in similar systems in other states reported</b></div>
</div>
</figure>

The errors were contested only after the terminations, through appeals and litigation. The benefits and the access to medical care lost in the meantime cannot be undone afterwards. A case where an AI match led to an action that could not be undone without independent corroboration is [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (a wrongful arrest from facial recognition). A case where a record of "complete" passed without being checked against what it rested on is [Brief 035](/critical/briefs/035-boeing-787-inspection-records/) (Boeing 787 inspection records).

## 4. What Lemma does

**Lemma builds the check in section 3 into the step that cuts off benefits on an automated decision.** It does not decide whether the decision itself is correct or fair; outside the system that makes the decision, it checks that the inputs and household assumptions the decision used match the source records, and keeps a record.

### Industries and operations to watch

- **Industry · Public sector**: Government bodies that use automated decisions in actions that are hard to undo, such as terminating benefits, and the vendors contracted to run those systems.
- **Industry · Healthcare**: Organizations that decide medical benefits or coverage eligibility through automated decisions.
- **Operations · Approval**: Deciding to terminate benefits on the basis of a decision.

### Current controls versus Lemma

The route reported in this case is column 1 (terminating benefits on an automated decision). Column 2 is the stage, after the termination, of showing what it was based on.

| Control | Terminating benefits on an automated decision | Showing the basis of the decision after termination |
| --- | --- | --- |
| Appeals process (contesting after the termination) | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

Appeals are a path to correcting a wrongful termination, but the action goes ahead until the recipient notices it and appeals. Lemma, before the termination, compares the inputs and household assumptions the decision used against the source records, and does not proceed to termination on a decision that cannot be checked. Because it keeps which decision was used on which inputs and assumptions, the basis can be traced afterwards.

Note: Lemma's check works only when it is built into the step that moves to termination, and the source records for the inputs are managed outside the system that makes the decision. If the source records themselves are wrong, the wrong data also passes. Lemma does not fix the decision rules or their correctness or fairness. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent fraud or intrusions.

### Checklist

Three things to confirm for organizations that use automated decisions in actions such as terminating benefits

- Before acting on a decision, do you check that the inputs and assumptions it used, such as household, match the source records?
- Do you have a step that keeps a decision with unloaded inputs or mismatched assumptions from being used in an action until it can be confirmed?
- Do you keep a record that can show afterwards which decision was used in an action, on which inputs and assumptions, and under whose approval?

## 5. Facts and timeline

- **Subject**: TennCare Connect (the eligibility system for Tennessee's Medicaid program, TennCare). Built and operated by Deloitte and others; the state spent over $400 million on it (reporting).
- **Affected people**: TennCare and other recipients and applicants. The class action filed in 2020 represents adults and children who were cut off from benefits.
- **Defects reported**: The system sometimes failed to load the proper data, assigned recipients to the wrong household, and produced incorrect eligibility decisions.
- **Court ruling**: In August 2024, the federal district court for the Middle District of Tennessee ruled that defects in TennCare Connect illegally cut thousands of people off their benefits (reporting).
- **Other states**: KFF Health News reported that Medicaid eligibility systems Deloitte runs in multiple states have been flagged for the same kinds of errors.

### Timeline

- **2019–2020**: Wrongful terminations and ineligibility decisions surface around TennCare Connect's eligibility determinations.
- **2020**: A class action representing adults and children cut off from benefits is filed.
- **2024-08**: The federal district court for the Middle District of Tennessee rules that defects in the automated decisions illegally cut thousands of people off their benefits.
- **2024 onward**: Errors in similar systems across multiple states are reported (KFF Health News).

> The facts rest on reporting by Gizmodo, KFF Health News and Texas Dentists for Medicaid Reform. The characterization "illegally" rests on the federal court ruling as reported. The status of disputes and remediation after the ruling has not been confirmed. This Brief does not blame the state, the contracted vendors or any individual. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Judiciary**: The federal district court for the Middle District of Tennessee ruled that defects in TennCare Connect illegally cut thousands of people off their benefits (2024-08, in the class action filed in 2020; reporting).
- **Reporting**: KFF Health News reported that Medicaid eligibility systems Deloitte runs in multiple states have been flagged for the same kinds of errors.

## 6. Sources

- **Gizmodo**: “Judge Rules $400 Million Algorithmic System Illegally Denied Thousands of People's Medicaid Benefits” (2024-08) — <https://gizmodo.com/judge-rules-400-million-algorithmic-system-illegally-denied-thousands-of-peoples-medicaid-benefits-2000492529>
- **KFF Health News**: “Medicaid for Millions in America Hinges on Deloitte-Run Systems Plagued by Errors” — <https://kffhealthnews.org/news/article/medicaid-deloitte-run-eligibility-systems-plagued-by-errors/>
- **Texas Dentists for Medicaid Reform**: “Judge Rules Thousands Illegally Booted off Tennessee Medicaid by Deloitte System Similar to Texas” (2024) — <https://www.tdmr.org/judge-rules-thousands-illegally-booted-off-tennessee-medicaid-by-deloitte-system-similar-to-texas/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
