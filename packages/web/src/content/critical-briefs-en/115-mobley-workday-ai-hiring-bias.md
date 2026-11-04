---
brief_no: 115
title: "Workday: A lawsuit alleges its AI applicant screening sorted candidates unfavorably by race, age and disability (Mobley v. Workday)"
title_en: "Workday: A lawsuit alleges its AI applicant screening sorted candidates unfavorably by race, age and disability (Mobley v. Workday)"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "076-dillon-frt-wrongful-arrest", "078-tenncare-connect-medicaid-eligibility", "056-mchire-paradox-recruiting-auth"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Workday の AI 応募者スクリーニングが人種・年齢・障害で応募者を不利に選別したとする集団訴訟で、連邦地裁が主張の一部の続行を認めた（2026-06-22）"
og_lead_en: "In a class action alleging Workday's AI applicant screening sorted candidates unfavorably by race, age and disability, a federal court allowed part of the claims to proceed (2026-06-22)"
og_kicker_ja: "AI の判定 · 採用の差別訴訟"
og_kicker_en: "AI DECISION · HIRING BIAS SUIT"
og_headline_ja: "AI の応募者選考で\n不利に選別されたと\n原告が主張。\n<accent>100 件超の求人で落選</accent>"
og_headline_en: "Applicants were screened\nout by AI, suit alleges.\n<accent>100+ rejections claimed</accent>"
key_figures:
  - value: "100+"
    unit: "openings"
    label: "Openings the lead plaintiff says he was rejected for at companies using Workday (plaintiff's allegation)"
    tone: "alert"
  - value: "Within 1"
    unit: "hour"
    label: "Time from applying to an automated rejection notice; some also arrived late at night (plaintiff's allegation)"
  - value: "2023-02 → 2026-06-22"
    label: "From filing to the federal court allowing the FEHA claims and part of the ADA claims to proceed"
glossary:
  - term: "Proxy"
    desc: "Information that is not a protected attribute such as race, age or disability, but tends to correlate with one. Plaintiffs allege that employment gaps and similar factors played this role."
  - term: "FEHA, ADA, ADEA"
    desc: "FEHA is the California Fair Employment and Housing Act, ADA the Americans with Disabilities Act, and ADEA the US Age Discrimination in Employment Act."
  - term: "Attorney-client privilege"
    desc: "A US legal principle that shields communications between a lawyer and a client from disclosure in litigation."
insight:
  slug: "ai-judgment-to-adverse-action"
  label: "An AI decision, taken straight to an adverse action"
  quote: "Without a check, before an AI decision is used against a person, for the decision's grounds and who reviewed it, only the outcome arrives, and the grounds cannot be shown afterwards."
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "audit-trail"
    item: "Record who reviewed each automated rejection, and how, before it is sent"
impact: "Lead plaintiff rejected for 100+ openings (alleged)"
takeaway: "If an AI decision is used to send applicants a rejection, check before sending which decision was used, on what grounds and with whose review, and keep a record."
self_check: "Before an AI decision is used against a person, do you check the decision's grounds and who reviewed it?"
countries: ["us"]
---

## 1. Summary

In a class action, plaintiffs allege that an AI applicant-screening service sorted candidates unfavorably on the basis of race, age and disability across its customers' hiring. In June 2026, the federal court rejected part of Workday's defense that it "merely provided a tool" and allowed part of the claims to proceed. The court has not yet decided whether discrimination occurred. <strong>Without a check, before an AI decision is used against a person, for the decision's grounds and who reviewed it, only the outcome arrives, and the grounds cannot be shown afterwards.</strong>

## 2. What got through

- **What got through**: Rejection notices sent to applicants. The plaintiff alleges he was rejected for more than 100 openings at companies using Workday's platform, receiving automated rejections within an hour of applying or in the middle of the night (plaintiff's allegations).
- **What reached the receiving side**: In general, what reaches an applicant is the outcome, not which decision was used or on what grounds. Plaintiffs allege that applicants were sorted through proxies, such as employment gaps, in ways that produced disadvantage correlated with protected attributes.
- **What was alleged and what the court decided**: On 2026-06-22, Judge Rita F. Lin held that Workday is not merely a "tool provider" but may fall within the reach of discrimination liability, and allowed the FEHA claims and part of the ADA proxy-discrimination claims to proceed. The ruling declined to dismiss those claims; it is not a finding that discrimination occurred.
- **Not disclosed**: The factors the decisions used, and whether a person or a separate layer reviewed a decision before a rejection was sent. They are not in the sources reviewed. A May 2026 order found Workday's bias-testing data protected by privilege, and its production to plaintiffs was not compelled.

## 3. Pre-execution check

The condition that holds regardless of the route is to check, before an AI decision is used to return an adverse outcome to a person (such as a rejection), that the decision is tied to a record of its grounds and to the approval of the person who reviewed it.

- **Who approves**: The hiring staff who decide an action such as a rejection. They approve after looking at the grounds, separately from the AI decision. A decision looking fast and consistent is no substitute for approval.
- **Where it is checked**: Before a rejection based on an AI decision is sent. Check that the decision is tied to a record of its grounds and to approval; if it is not, hold.
- **What is recorded**: Which decision was used, with which inputs and conditions, and under whose review. In an audit or litigation, the basis for the action can be shown afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">Pre-execution check = before using an AI decision for a rejection, check that it is tied to a record of its grounds and the reviewer's approval, and keep a record. Detection = noticing a problem after the rejection, through complaints or analysis. Dates are those given in court orders and law-firm analyses.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from what was disclosed</b>Whether grounds and review were checked before rejections were sent</div>
<div class="rx-zone gapz"><b>What was alleged</b><span>Rejected for 100+ openings<br>Automated rejections within an hour or late at night (plaintiff's allegation)</span></div>
<div class="rx-zone det"><b>Detection · worked after the rejections</b>An applicant's complaint reached the court as a class action</div>
<div class="rx-g g1"><div class="t">2023-02</div><b>Mobley files suit</b></div>
<div class="rx-g g2"><div class="t">2025-05</div><b>ADEA collective preliminarily certified</b></div>
<div class="rx-g g3"><div class="t">2026-05-29</div><b>Motion to compel testing data denied</b></div>
<div class="rx-g g4"><div class="t">2026-06-22</div><b>Part of the claims allowed to proceed</b></div>
</div>
</figure>

The suspected disadvantage was taken up only after rejections arrived, through litigation. Other cases where an AI output allegedly led straight to harm to a person without independent corroboration are the wrongful arrests of [Robert Williams](/critical/briefs/012-williams-frt-wrongful-arrest/) and [Robert Dillon](/critical/briefs/076-dillon-frt-wrongful-arrest/) (facial recognition) and [TennCare Connect](/critical/briefs/078-tenncare-connect-medicaid-eligibility/) (benefit-eligibility decisions). In hiring, there is [McHire](/critical/briefs/056-mchire-paradox-recruiting-auth/) (applicant-data exposure).

## 4. What Lemma does

**Lemma builds the check in section 3 into the step that sends a rejection based on an AI decision.** It does not judge whether the decision itself is fair; before the rejection is sent, and outside the AI, it checks that the decision is tied to a record of its grounds and the reviewer's approval, and keeps a record.

### Industries and operations to watch

- **Industry · AI adoption**: Companies that build AI screening into sorting applicants or routing pass/fail decisions, and the vendors that provide it.
- **Operations · Approval**: Approving an action such as a rejection whose basis is an AI decision.

### Current controls versus Lemma

The route in this case is column 1 (sending applicants a rejection based on an AI decision). Column 2 is the stage, after the rejection, of showing in an audit or litigation which decision was used under whose review.

| Control | Sending applicants a rejection based on an AI decision | Showing the decision's grounds and review after the rejection |
| --- | --- | --- |
| Bias testing of the model (evaluating group-level tendencies) | Partial | Partial |
| A practice of having a person review the decision before a rejection is sent | Effective | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

Bias testing underpins choosing and revising a model, but it does not change whether each individual decision was reviewed before it was sent. In this case, Workday's bias-testing data was found protected by privilege and was not produced to plaintiffs in the litigation. A human-review practice acts on the step before sending, but the record of the review stays inside the organization that runs it. Lemma checks, before sending and outside the AI, that the decision is tied to a record of its grounds and to approval, and keeps which decision was used under which conditions and review.

Note: Lemma's check works only when it is built into the step that sends a rejection, and the record of grounds and the approval are managed outside the AI that produces the decision. If the reviewer does not notice bias in a decision, this check can be passed. Lemma does not guarantee that a decision is fair, nor does it judge whether discrimination occurred. The table compares what each control checks; it does not show whether this case would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that use AI decisions in hiring or other actions

- Do you pass the inputs and factors an AI decision used (including information that can act as a proxy) to the person who approves the action?
- When an applicant or other person complains, do you have a record that shows which decision was used for that one case, under whose review?
- When you use AI screening from an outside vendor, have you decided which side keeps the record of decisions and approvals?

## 5. Facts and timeline

- **Case**: Mobley v. Workday, Inc. (N.D. Cal., No. 3:23-cv-00770).
- **Lead plaintiff**: Derek Mobley (alleges he is Black, over 40, and living with anxiety and depression).
- **Subject of the suit**: Workday's AI applicant screening. A class action alleging it treated candidates unfavorably on the basis of race, age and disability across its customers' hiring.
- **Plaintiff's allegations**: Rejected for more than 100 openings, receiving automated rejections within an hour of applying or late at night. Alleges sorting through proxies such as employment gaps.
- **Court's ruling**: On 2026-06-22, Judge Lin rejected part of Workday's defense and allowed the FEHA claims and part of the ADA proxy-discrimination claims to proceed.
- **Current stage**: The case is in discovery, with continued disputes over the decision's grounds and the handling of the testing data.

### Timeline

- **2023-02**: Mobley files suit against Workday in federal district court (No. 3:23-cv-00770, N.D. Cal.).
- **2024 (around)**: At an early pleading stage, a ruling addresses whether Workday qualifies as an "agent," and plaintiffs are given leave to amend.
- **2025-05**: Preliminary certification of a nationwide ADEA collective is granted.
- **2026-05-29 (around)**: Magistrate Judge Laurel Beeler denies the motion to compel production of Workday's bias-testing data, finding it protected by attorney-client privilege, and separately denies compelling customers' applicant data as failing Rule 34's "control" requirement.
- **2026-06-22**: Judge Rita F. Lin rejects part of Workday's defense and allows the FEHA claims and part of the ADA claims to proceed.

> The facts rest on federal-court orders, law-firm analyses and media reporting. The litigation is ongoing, and statements about the disadvantage applicants experienced and the manner of automated rejection include the plaintiff's allegations. The court has not yet decided whether discrimination occurred. The scope of the collective certification and the details of the figures include unsettled points. This Brief does not blame Workday or the hiring companies. What has not been disclosed does not mean there were no controls.

### Response after disclosure

- **Litigation**: The case is in discovery, with continued disputes over the decision's grounds and the handling of the testing data.
- **HR and legal practice**: Judge Lin's June order is widely cited as a holding that a provider of AI screening may fall within the reach of discrimination liability beyond that of a "mere tool provider."

## 6. Sources

- Seyfarth Shaw LLP, “Mobley v. Workday: Court Holds AI Service Providers Could Be Directly Liable for Employment Discrimination Under ‘Agent’ Theory” (2026-06) — <https://www.seyfarth.com/news-insights/mobley-v-workday-court-holds-ai-service-providers-could-be-directly-liable-for-employment-discrimination-under-agent-theory.html>
- Akin, “Court Allows Discrimination Claims Against AI Hiring Tool to Proceed (Mobley v. Workday, Inc.)” (AI Law and Regulation Tracker, 2026) — <https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/court-allows-discrimination-claims-against-ai-hiring-tool-to-proceed-or-mobley-v-workday-inc>
- Duane Morris LLP, “California Federal Court Clarifies Limits On AI Bias Testing And Applicant Data Disclosure In Mobley v. Workday” (Class Action Defense, 2026-06-02) — <https://blogs.duanemorris.com/classactiondefense/2026/06/02/california-federal-court-clarifies-limits-on-ai-bias-testing-and-applicant-data-disclosure-in-mobley-v-workday/>
- HR Executive, “Judge refuses to dismiss most Workday hiring bias allegations” (2026-06) — <https://hrexecutive.com/judge-refuses-to-dismiss-most-workday-hiring-bias-allegations/>
- Norton Rose Fulbright, “Behind the privilege shield: Safeguarding AI bias-testing data in employment decisions” (Inside Tech Law, 2026-06) — <https://www.insidetechlaw.com/blog/2026/06/behind-the-privilege-shield-safeguarding-ai-bias-testing-data-in-employment-decisions>
- Mobley v. Workday, Inc., No. 3:23-cv-00770 (N.D. Cal.) — case docket (primary) — <https://www.courtlistener.com/docket/66831340/mobley-v-workday-inc/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
