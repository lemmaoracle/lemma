---
brief_no: 78
title: "TennCare Connect：自動適格判定が誤ったまま、数千人の Medicaid が違法に打ち切られた — 給付の打ち切りという不利益処分の前に、適格判定が独立検証されない構造（連邦地裁）"
title_en: "TennCare Connect: an automated eligibility system illegally cut thousands off Medicaid — eligibility decisions not independently verified before the adverse action of termination (federal court)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2024-08-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
version: "1.0"
og_lead_ja: "TennCare Connect の自動適格判定が誤判定のまま数千人を違法に打ち切り"
og_lead_en: "TennCare Connect's automated eligibility system illegally cut thousands off Medicaid"
gap_detected: "Appeals, administrative audits, and the class action with its judicial ruling are essential to remedying wrongful terminations, and in this case they functioned to establish illegality and drive correction."
gap_missing: "There was no layer to independently verify whether each decision was made under correct data, correct household composition, and correct authorization before the adverse action, so an automated system output 'ineligible' on faulty inputs and that flowed directly into termination."
gap_fix: "Before the adverse action of cutting off benefits, independently verify with Lemma the automated eligibility decision's inputs, household-composition assumptions, and authorization, and fix them as a tamper-evident record."
---

## 1. TL;DR

TennCare Connect, an eligibility system built by Deloitte and others on which Tennessee spent over $400 million, was supposed to automatically determine eligibility for Medicaid (TennCare) and the like from income and health information. In practice it sometimes failed to load the proper data, assigned recipients to the wrong household, and produced incorrect eligibility decisions. In August 2024, a federal district court (Middle District of Tennessee) ruled that defects in this automated decision-making illegally cut thousands of people off their benefits. Before the adverse action of termination, there was no layer to independently verify whether the automated decision had been made on correct data and correct household composition. The fact that the system output "ineligible" is no proof that the decision was made under correct inputs and authorization.

---

## 2. What happened

- **Subject**: TennCare Connect (Tennessee's Medicaid [TennCare] eligibility system; contracted to Deloitte and others, build cost over $400 million)
- **Affected parties**: TennCare and other recipients and applicants. The class action filed in 2020 represents adults and children who were cut off from benefits
- **Government party**: The State of Tennessee (which operates TennCare). The system was built and operated by Deloitte and other system integrators
- **Chain of failure**: The system (1) sometimes failed to load the proper data, (2) assigned recipients to the wrong household, and (3) produced incorrect eligibility decisions — these compounded so that people who were in fact eligible were automatically judged "ineligible"
- **Direct path to adverse action**: The incorrect automated decision flowed directly into termination of benefits (an adverse action). The action preceded any recognition of the error and any appeal by the recipient
- **Judicial ruling**: In August 2024, the federal district court for the Middle District of Tennessee ruled that defects in TennCare Connect illegally cut thousands of people off their benefits (the class action filed in 2020)
- **Context**: Deloitte-run Medicaid eligibility systems operating in multiple states have been flagged for the same kinds of errors. As the automation of public-benefit eligibility decisions spreads, the verifiability of those decisions is becoming an institutional issue

The incident came together as the following chain.

1. **Automated decision generation**: TennCare Connect automatically determines eligibility from income and health information. The decision depends on the input data and on assumptions about household composition
2. **Input deficiency**: The system fails to load the proper data, or assigns the recipient to the wrong household, so processing proceeds while the inputs that underpin the decision remain in an erroneous state
3. **Absence of independent verification**: There was no layer to independently verify, before the adverse action, whether the decision was based on correct data and correct household composition, so an erroneous decision was treated as the conclusion "ineligible"
4. **Direct path to adverse action**: The incorrect automated decision flowed directly into termination of benefits. An irreversible action with direct bearing on people's lives preceded the recipient's involvement and confirmation
5. **Belatedness of remedy**: In a structure where the error is contested only once the recipient notices the termination and files an appeal, remediation always lagged behind the action

---

## 3. Timeline — disclosure and response

- 2019–2020: Wrongful terminations and ineligibility determinations surface around TennCare Connect's eligibility decisions
- 2020: A class action representing adults and children cut off from benefits is filed
- 2024-08: The federal district court for the Middle District of Tennessee rules that defects in the automated decision-making illegally cut thousands of people off their benefits
- 2024 onward: Errors in the same kind of system that Deloitte operates across multiple states are flagged cross-cuttingly by reporting and specialist institutions

> Note: The facts in this Brief are based on the federal district court's ruling and established media and specialist reporting (KFF Health News and others). Confirm the latest status of post-judgment disputes and remediation before publication. This Brief is not a condemnation of any specific vendor's motives; it focuses on the structure in which a decision is not independently verified before an adverse action.

The response and industry movement after disclosure:

- **Judiciary**: The federal district court for the Middle District of Tennessee ruled that defects in TennCare Connect illegally cut thousands of people off their benefits (2024-08, the class action filed in 2020)
- **Specialist reporting (KFF Health News and others)**: Reported cross-cuttingly that the Medicaid eligibility systems Deloitte operates across multiple states suffer from the same kinds of errors, making it visible as a structural issue
- **Institutional design issue**: When automating public-benefit eligibility decisions, requirements to verify and record whether a decision was made under correct inputs and authorization before an adverse action are emerging as an issue for procurement and operational standards
- **System integrators' responsibility**: There is growing pressure on the SI vendors that deliver the same kind of system to multiple governments to build the verifiability of decisions and attribution into the design

How government, when using automated eligibility decisions for adverse actions, should prove "under which inputs and authorization the decision was made" is expected, in the wake of this incident, to be discussed as a mandatory requirement of public-sector procurement and institutional design.

---

## 4. Why it wasn't stopped

Here the central **failure primitive is "the output of an automated eligibility decision is accepted as the basis for an adverse action without an accompanying record that can independently prove its inputs, household composition, and authorization"** — and the irreversible action of terminating benefits was built on top of it.

The primitive is isomorphic to [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/) (the Robert Williams wrongful arrest). 012 is a public-sector AI-judgment case in which "a probabilistic FRT output flowed directly into arrest without independent corroboration," and this incident is the same structure in which "an automated eligibility decision flowed directly into termination of benefits without independent verification." In both, a government AI / algorithmic judgment flows directly into an irreversible action while detached from the layer of independent verification. It connects to [Brief 035](/critical/briefs/035-boeing-787-inspection-records/) (where inspections on the Boeing 787 were recorded as "complete" but had not been performed) on the point that **a record that "the system output a conclusion" is no proof that the conclusion rests on correct grounds.**

This incident is not an attack incident; it is a trust-layer risk event in the public sector's use of AI / algorithms (per the Methodology's scope expansion, in line with [Brief 012](/critical/briefs/012-williams-frt-wrongful-arrest/)'s position). As the automation of benefit eligibility decisions spreads, it is a representative case in which the layer that can prove whether a decision was independently verified and authorized before an adverse action is being called into question as an institutional requirement. Because system integrators deliver the same kind of system to multiple governments, building verification and attribution requirements in at the procurement stage is the realistic adoption path. Lemma does not guarantee the correctness or fairness of the decision itself; its scope is to leave the fact that the decision was (or was not) independently verified and authorized before the adverse action as a tamper-evident record.

The appeals mechanism, administrative audits, and this case's class action and judicial ruling are essential to remedying wrongful terminations, and this Brief does not deny their role. The litigation established illegality and moved toward correction.

That said, appeals and litigation do not change the design itself of whether a decision was "independently verified and authorized before the adverse action." In this incident, the automated system output "ineligible" on faulty inputs and wrong household assignment, and that flowed directly into termination. What was missing was a layer to independently verify, before the action, whether "this decision was made under correct data, correct household composition, and correct authorization" — a verification on a different track from after-the-fact appeals. If remediation comes after the action, the loss of benefits in the interim (such as a break in access to medical care) cannot be undone. As material for establishing in regulatory reporting, administrative audit, or judicial proceedings that "this termination was based on correct grounds and authorization," a record that the system merely output "ineligible" is no attribution that the decision was based on correct inputs.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design in which, before an automated decision is used in an adverse action, "on which inputs," "under which household-composition assumptions," and "under which independent verification and authorization" the decision was made are fixed as an independently verifiable record. If the proof says "input deficiency," "no basis for household assignment," or "no authorization," the termination based on that decision is held off in advance. After-the-fact detection and remediation (detection) and the pre-action independent verification of the decision (proof) are in a **complementary**, not substitutive, relationship.

Against the detection–proof gap exposed by this incident (the output of an automated eligibility decision functions as the basis for an adverse action without being able to independently prove its inputs and authorization), Lemma proposes a design that, at the point a decision is used in an action, fixes "on which inputs," "under which assumptions," and "under which independent verification and authorization" the decision was made as a tamper-evident record. Its design elements are as follows.

- **Fixing inputs and assumptions**: Record the input data and household-composition assumptions the automated decision used as a snapshot at decision time, in an independently verifiable form.
- **Proving authorization state**: Leave a record that can independently prove — separately from the basis for the action — whether the decision was made under correct authorization (or with none).
- **Pre-action gate**: Adopt a design in which, if the proof says "input deficiency," "no basis for household assignment," or "no authorization," the termination based on that decision is held off in advance.
- **Building into procurement**: This corresponds to an audit and attribution layer for the institutional fulfillment of accountability in government AI / algorithm use, and it can be built into public-sector procurement requirements via system integration.

Lemma does not guarantee the correctness or fairness of the decision itself, but it leaves the fact that the decision was (or was not) independently verified and authorized before the adverse action as a tamper-evident record. Detection (appeals, audits, after-the-fact remediation) works to remedy errors, and pre-execution attestation (a record that independently verifies the decision's inputs and authorization before the adverse action) works to establish trust before the action is taken — the two operate complementarily. For the design details, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation, see the [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub). For the design and its scope, see also [Pillar 02 — Verifiable AI](https://lemma.frame00.com/pillars/#inference).

---

## 6. Sources

- **Gizmodo**: “Judge Rules $400 Million Algorithmic System Illegally Denied Thousands of People's Medicaid Benefits” (2024-08) — <https://gizmodo.com/judge-rules-400-million-algorithmic-system-illegally-denied-thousands-of-peoples-medicaid-benefits-2000492529>
- **KFF Health News**: “Medicaid for Millions in America Hinges on Deloitte-Run Systems Plagued by Errors” — <https://kffhealthnews.org/news/article/medicaid-deloitte-run-eligibility-systems-plagued-by-errors/>
- **Texas Dentists for Medicaid Reform**: “Judge Rules Thousands Illegally Booted off Tennessee Medicaid by Deloitte System Similar to Texas” (2024) — <https://www.tdmr.org/judge-rules-thousands-illegally-booted-off-tennessee-medicaid-by-deloitte-system-similar-to-texas/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
