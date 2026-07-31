---
brief_no: 115
title: "Workday の AI 応募者スクリーニング差別訴訟：不利益処分は下されたが、その判定が独立に検証・認可されたかは残らない — Mobley v. Workday"
title_en: "AI applicant-screening discrimination suit against Workday: the adverse action was taken, but whether the decision was independently verified and authorized was never recorded — Mobley v. Workday"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "076-dillon-frt-wrongful-arrest", "078-tenncare-connect-medicaid-eligibility", "056-mchire-paradox-recruiting-auth"]
status: published
version: "1.0"
og_lead_ja: "Workday AI 採用差別訴訟：自動不採用の前に判定が独立検証・認可されたか残らない"
og_lead_en: "Workday AI hiring-bias suit: no record the decision was verified before rejection"
gap_detected: "The suspected discrimination surfaced from applicants' experience and statistics and advanced as a class action in 2026."
gap_missing: "A layer that verifies, before the adverse action of an automated rejection, that the decision was independently verified and authorized, and retains it as a record."
gap_fix: "Before the adverse action, fix as a tamper-evident record which decision was used, on what grounds and reliability conditions, and under what independent verification and authorization."
---

## 1. TL;DR

Mobley v. Workday, Inc. (N.D. Cal., No. 3:23-cv-00770) is a class action alleging that Workday's AI applicant screening sorted candidates unfavorably on the basis of race, age, and disability. The lead plaintiff, Derek Mobley — Black, over 40, living with anxiety and depression — alleges he was rejected for more than 100 openings at companies using Workday's platform, receiving automated rejections within an hour of applying or in the middle of the night (plaintiff's allegations). On June 22, 2026, Judge Rita F. Lin rejected Workday's defense that it "merely provided a tool" and allowed the core discrimination claims to proceed. The process for surfacing the suspected discrimination and bringing it to court worked. **Detection was working. What was missing is the layer that, before the adverse action of an automated rejection, verifies whether the decision was independently verified and authorized, and retains that as a record.**

## 2. What happened

- The suit is a class action alleging that Workday's AI applicant screening treated candidates unfavorably on the basis of race, age, and disability across its customers' hiring processes. The lead plaintiff is Derek Mobley.
- Plaintiffs allege that applicants were sorted through proxies — such as employment gaps — in ways that produced disadvantage correlated with protected attributes. The figures (over 100 rejections; automated rejections within an hour or late at night) are the plaintiff's allegations.
- On June 22, 2026, Judge Lin rejected part of Workday's defense, holding that Workday is not merely a "tool provider" but may fall within the reach of discrimination liability, and allowed the FEHA (California Fair Employment and Housing Act) claims and part of the ADA (Americans with Disabilities Act) proxy-discrimination claims to proceed.

The matter takes shape through the following chain.

1. Workday's AI screening automatically issues decisions (sorting, routing to rejection) on applications submitted to customer companies' openings.
2. Those decisions are alleged to have sorted applicants on factors including employment-gap proxies.
3. The adverse action of an automated rejection is issued to applicants without a record by which the decision's grounds, reliability, and independent corroboration can be verified.
4. The bias-testing data by which the decision's validity might be checked did not, as noted below, reach plaintiffs even in the litigation — the material for independently verifying the decision was shielded.

## 3. Timeline — disclosure and response

- 2023-02: Mobley files suit against Workday in federal district court (No. 3:23-cv-00770, N.D. Cal.).
- 2024 (around): at an early pleading stage, a ruling addresses whether Workday qualifies as an "agent," and plaintiffs are given leave to amend.
- May 2025: preliminary certification of a nationwide ADEA (Age Discrimination in Employment Act) collective is granted.
- 2026-05-29 (around): Magistrate Judge Laurel Beeler denies the motion to compel production of Workday's bias-testing data, finding it protected by attorney-client privilege (and separately denies compelling customers' applicant data as failing Rule 34's "control" requirement).
- 2026-06-22: Judge Rita F. Lin rejects part of Workday's defense and allows the FEHA claims and part of the ADA proxy-discrimination claims to proceed.

> Note: the facts here rest on federal-court orders, law-firm analyses, and established media reporting. The litigation is ongoing, and statements about the disadvantage applicants experienced and the manner of automated rejection include the plaintiff's allegations. The scope of any collective certification and the details of the figures include unsettled items to be verified. This Brief does not condemn any party; it focuses on the structure in which there is no way to prove, before the adverse action, that the decision was independently verified and authorized.

Response and industry movement after disclosure are as follows.

- The matter is in discovery, with continued disputes over the decision's grounds and the handling of the testing data.
- Judge Lin's June order is widely cited in HR and legal practice as a holding that a provider of AI screening may fall within the reach of discrimination liability beyond that of a "mere tool provider."

## 4. Why it wasn't stopped

The failure here is not that applicants responded inadequately, nor that any individual acted with malice. It is that nowhere along the path from an automated pass/fail decision to the adverse action (an automated rejection) was there a record — one that could later be established — of on what grounds, under what reliability conditions, and under whose independent verification and authorization that decision was made. Detection worked: the suspected discrimination surfaced from applicants' experience and statistics and rode the process of a class action. What was missing sits earlier — verification at the instant the rejection is finalized.

A decision looking legitimate and that decision being authorized for an adverse action right now are separate questions. The automated responses were fast, high-volume, and outwardly consistent. But speed and consistency are not proof that each individual decision was independently corroborated and authorized. And here, the bias-testing data by which the decision's validity might be checked was shielded by privilege, so the material for independent verification did not reach plaintiffs even procedurally. The outcome of the decision remains; the fact that the decision was verified and authorized (or was not) does not.

> The automated rejection is emblematic. The notice arrives, but on what grounds and reliability conditions, and under what independent verification, that single decision was made is shown neither to the person on the receiving end nor to the later proceedings. The outcome travels fast; the corroboration does not.

The same structure connects to [Brief 012 (Robert Williams wrongful arrest)](/critical/briefs/012-williams-frt-wrongful-arrest/) and [Brief 076 (Robert Dillon wrongful arrest)](/critical/briefs/076-dillon-frt-wrongful-arrest/), where a probabilistic AI output led straight to an irreversible coercive action without independent corroboration; to [Brief 078 (TennCare Connect eligibility determinations)](/critical/briefs/078-tenncare-connect-medicaid-eligibility/), where an administrative AI decision drove benefit denials; and to [Brief 056 (McHire applicant-data exposure)](/critical/briefs/056-mchire-paradox-recruiting-auth/), where attribution and authorization of decisions were at issue in hiring. Each shows that a decision "existing" and that decision being authorized for an adverse action right now are separate questions.

## 5. What proof would have changed

Proof-as-auth inserts a layer, ahead of the point where an automated decision is used for an adverse action (such as an automated rejection), that fixes as a tamper-evident record which decision was used, on what grounds and reliability conditions, and under what independent verification and authorization. Rather than letting a decision's speed and apparent consistency stand in for authorization, it checks — before the adverse action is finalized — whether this single decision is authorized for the adverse action. If the answer is "no independent corroboration" or "not authorized," the adverse action based on that decision is held in advance.

The design Lemma offers for this primitive is as follows.

- **Per-adverse-action authorization proof**: bind an action such as an automated rejection not to possession of a model's output, but to a verifiable proof that this action is independently verified and authorized now — excluding automatic application of an uncorroborated decision before the action.
- **Fixing decision grounds and reliability conditions**: fix, at the moment of the action and in verifiable form, which decision was made under which inputs, which proxies, and which reliability conditions — avoiding a state where only the outcome remains while the grounds cannot be reconstructed.
- **Making independent verification a record**: retain a record — establishable later by the affected party, auditors, and judicial process — of whether the decision was verified and authorized by a human or independent layer (or was not), and design against a state where the verifying material fails to reach the proceedings.
- **Selective adverse-action records**: keep a tamper-evident record of whose decision, and which decision, under what authorization, was used for an adverse action, so that if a dispute arises, the path and authorization state of the action can be independently shown.

Lemma is not a product that guarantees the fairness of a decision. Its scope is to retain, as a tamper-evident record, the fact that a decision was independently verified and authorized before it was used for an adverse action (or was not). Judgments of whether discrimination occurred, and of what is proper, are for process and law. Detection (catching suspected discrimination, statistical analysis, after-the-fact remedy through litigation) and pre-execution proof (a record that independently verifies a decision's corroboration and authorization before the action) are complements, not substitutes. See [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05) and [Verifiable AI](/pillars/verifiable-ai/).

## 6. Sources

- Seyfarth Shaw LLP, “Mobley v. Workday: Court Holds AI Service Providers Could Be Directly Liable for Employment Discrimination Under ‘Agent’ Theory” (2026-06) — <https://www.seyfarth.com/news-insights/mobley-v-workday-court-holds-ai-service-providers-could-be-directly-liable-for-employment-discrimination-under-agent-theory.html>
- Akin, “Court Allows Discrimination Claims Against AI Hiring Tool to Proceed (Mobley v. Workday, Inc.)” (AI Law and Regulation Tracker, 2026) — <https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/court-allows-discrimination-claims-against-ai-hiring-tool-to-proceed-or-mobley-v-workday-inc>
- Duane Morris LLP, “California Federal Court Clarifies Limits On AI Bias Testing And Applicant Data Disclosure In Mobley v. Workday” (Class Action Defense, 2026-06-02) — <https://blogs.duanemorris.com/classactiondefense/2026/06/02/california-federal-court-clarifies-limits-on-ai-bias-testing-and-applicant-data-disclosure-in-mobley-v-workday/>
- HR Executive, “Judge refuses to dismiss most Workday hiring bias allegations” (2026-06) — <https://hrexecutive.com/judge-refuses-to-dismiss-most-workday-hiring-bias-allegations/>
- Norton Rose Fulbright, “Behind the privilege shield: Safeguarding AI bias-testing data in employment decisions” (Inside Tech Law, 2026-06) — <https://www.insidetechlaw.com/blog/2026/06/behind-the-privilege-shield-safeguarding-ai-bias-testing-data-in-employment-decisions>
- Mobley v. Workday, Inc., No. 3:23-cv-00770 (N.D. Cal.) — case docket (primary) — <https://www.courtlistener.com/docket/66831340/mobley-v-workday-inc/>

References: [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Verifiable AI](/pillars/verifiable-ai/) · [Brief 012 (Robert Williams wrongful arrest)](/critical/briefs/012-williams-frt-wrongful-arrest/) · [Brief 076 (Robert Dillon wrongful arrest)](/critical/briefs/076-dillon-frt-wrongful-arrest/)
