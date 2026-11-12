---
brief_no: 198
title: "英国歳入関税庁（HMRC）：児童手当の不正・誤りを探す渡航データとの突き合わせで、試行のあとに雇用の確認を外し、受給資格のある家族の支給まで止めた(会計検査院の報告)"
title_en: "HMRC: In matching Child Benefit claims against travel data to find fraud and error, it dropped the employment check after the pilot and suspended payments to eligible families too (National Audit Office report)"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [data-provenance]
incident_date: 2025-08-01
published: 2026-11-10
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["078-tenncare-connect-medicaid-eligibility", "124-wiser-medicare-ai-prior-authorization"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "889c9dd3301c3427"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "英国 HMRC が渡航データとの突き合わせで児童手当 23,794 件の支給を止め、59% は受給資格ありか雇用の確認で外れたと会計検査院が報告"
og_lead_en: "HMRC suspended 23,794 Child Benefit claims after matching them against travel data; 59% were confirmed eligible or cleared by an employment check, the NAO reports"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "データの突き合わせ · 給付の停止"
og_kicker_en: "DATA MATCHING · BENEFITS STOPPED"
og_headline_ja: "渡航データの一致で、\n英国の児童手当が\n止まった。\n<accent>23,794 件</accent>"
og_headline_en: "Travel-data matches\nstopped UK Child Benefit\nfor eligible families too.\n<accent>23,794 claims suspended.</accent>"
key_figures:
  - value: "23,794"
    unit: "claims"
    label: "Claims where enquiries were opened and payments suspended at the same time in the first rollout (August to October 2025; NAO)"
    tone: "alert"
  - value: "59"
    unit: "%"
    label: "Share of those confirmed eligible or removed by the employment check (14,156 claims, as of April 2026, NAO analysis). 38% (9,010) were confirmed fraudulent or incorrect"
  - value: "12 months → 5 years"
    label: "Period the matching treated as possible absence (pilot → first rollout). HMRC says this was not a planned change and it noticed only after the rollout began"
glossary:
  - term: "Child Benefit"
    desc: "A UK benefit HMRC pays to UK residents responsible for a child. It goes to around 6.9 million families, and spending was £13.3 billion in 2024-25. A claimant who no longer lives in the UK loses eligibility."
  - term: "PAYE check"
    desc: "A check of HMRC's Pay As You Earn records for evidence that the claimant kept working in the UK during the period the travel data showed them abroad. In the pilot it ran before an enquiry was opened and removed 12% of matches. Self-employed people do not appear in these records."
  - term: "DEA Board"
    desc: "The cross-government Debt and Fraud Information Sharing Review Board, which reviews data sharing under the Digital Economy Act and is co-chaired by the Cabinet Office and HM Treasury. It covers the legality of data sharing and data protection; it says detailed oversight of the processes that use the data is outside its remit."
insight:
  slug: "match-rule-changed-after-approval"
  stop: true
  label: "Matching conditions changed after approval"
  quote: "Before suspending a payment, check the travel-data match against the conditions approved for the pilot and against employment records."
industries: ["public-sector"]
operations: ["approval"]
controls:
  - slug: "bound-automation"
    item: "Keep what data matching can suspend within the approved conditions (period covered, data sources, exclusion checks), and seek approval again before changing them"
  - slug: "hold-unverified"
    item: "Do not suspend on a match alone; for matches that conflict with other records or await the claimant's reply, ask first and hold the suspension"
  - slug: "audit-trail"
    item: "Record, apart from the process itself, which conditions produced the match, who decided to suspend, and when the payment was reinstated and backdated"
attack_method: "human-error"
impact: "23,794 Child Benefit claims were suspended in the first rollout (August to October 2025); as of April 2026, 59% (14,156) had been confirmed eligible or removed by the employment check (NAO)"
takeaway: "After the pilot, HMRC dropped the employment check at working level, so travel-data matches alone suspended payments to eligible families too. Before suspending, check a match against the approved conditions and other records."
self_check: "Do you know whether processes that suspend payments or transactions on data-matching results still run under the same conditions as when they were approved?"
countries: ["gb"]
---

## 1. Summary

In August 2025 HM Revenue & Customs (HMRC) moved into full rollout an intervention that matched Home Office travel data against Child Benefit records, opened enquiries for claimants apparently abroad for 12 weeks or more, and suspended their payments at the same time. According to the National Audit Office (NAO), between the pilot (March to December 2024) and the rollout HMRC removed the step of checking employment records (PAYE) before opening an enquiry, and the matching period also widened from 12 months to five years. By October, 23,794 claims had been suspended.

In the NAO's analysis, as of April 2026, 59% of the 23,794 suspended claims had been confirmed eligible or removed by the employment check, while 38% were confirmed fraudulent or incorrect. The decision to remove the employment check was taken in May 2025 at a workshop of operational staff. HMRC accepts there were weaknesses in its oversight of the move from pilot to rollout; in October and November it reintroduced the employment check, reinstated 5,327 payments automatically and backdated them. Since March 2026 it has given claimants a month to respond before suspending payments.

<strong>A process that suspends payments on a data match alone runs without asking whether the conditions that produced the match are the ones that were approved.</strong>

## 2. What got through

- **What got through**: Opening enquiries and suspending Child Benefit payments on the basis of travel-data matches. According to the NAO, HMRC suspended payments as soon as it opened an enquiry and asked claimants for evidence of UK residency. HMRC told the NAO that it did not use automated decision-making to open enquiries, suspend payments or terminate eligibility, and that suspension relied on a manual intervention by staff using guidance.
- **What reached the accepting side**: In general, the process that receives matching results receives only the matched claimant and the period they appear to have been abroad. It does not receive which matching period produced the match, or whether the match conflicts with employment records. According to the NAO, the Home Office advised HMRC that the travel data could not be used in isolation to determine residency and were only a starting point for enquiries. The data come mainly from Advance Passenger Information (API), include trips that were cancelled, and do not include border control records of exits from the UK.
- **Conditions that changed**: According to the NAO, three things changed between the pilot and the first rollout. The upfront PAYE check was moved to the end of the process (temporary staff found it too complicated; staffing was the driver). The letter to claimants who had travelled to European Economic Area (EEA) countries became 14 pages with over 70 questions. The matching period widened from the previous 12 months to five years (HMRC says this was not a planned decision and it identified the change only after the rollout began).
- **Approval and notification**: According to the NAO, the decisions to remove the PAYE check and change the letter were taken at a May 2025 workshop of operations staff, operational analysts and policy staff, and HMRC said staff had felt empowered to make them at a working level. There was no Senior Responsible Owner or governance forum responsible for approving the move to business as usual. Neither the DEA Board approval nor the agreement with the Home Office required HMRC to notify process changes after the pilot, and HMRC did not alert the DEA Board to them before final approval in July 2025.
- **Not disclosed**: How long suspensions lasted (HMRC could not give the NAO average reinstatement times). The total amount backdated. How many claimants had travelled to EEA countries (HMRC believes it is the majority). Individual claimants' circumstances (the NAO did not look at individual claims).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a payment is suspended, the travel-data match is checked as having been produced under the approved conditions (matching period, data sources, employment check) and as not conflicting with other records such as employment.

- **Who approves**: The body that approved the matching conditions, and the person accountable for the intervention. When the matching period, data sources or exclusion checks change, an approval for the changed conditions is issued, separate from the approval given for the pilot.
- **Where it is checked**: The step in which an enquiry is opened and payment suspended. It confirms that the match was produced under the approved conditions; a match that conflicts with employment records, or falls outside the conditions, is held rather than suspended, and the claimant is asked first.
- **What is recorded**: Which conditions produced the match, who decided to suspend, and when the payment was reinstated and how much was backdated. It is kept apart from the process and used to count wrongful suspensions and the time taken to reinstate.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a match against the approved conditions and employment records before suspending a payment, and keeping a record. Detection means noticing problems from calls and MPs' enquiries after suspension and fixing the process. Dates and counts rely on the NAO report.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before suspending, check that the match was produced under the approved conditions and does not conflict with employment records</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>23,794 claims suspended<br>59% confirmed eligible or cleared by the employment check</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Rising calls, MPs and the media flag problems in mid-October; the process is fixed within 2 to 4 weeks</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>A working-level workshop decides to drop the employment check</b></div>
<div class="rx-g g2"><div class="t">2025-08</div><b>The first rollout begins</b></div>
<div class="rx-g g3"><div class="t">2025-10</div><b>23,794 claims suspended; new enquiries stopped at month end</b></div>
<div class="rx-g g4"><div class="t">2025-11</div><b>5,327 payments reinstated automatically and backdated</b></div>
</div>
</figure>

Detection worked, and HMRC changed the process within two to four weeks of problems emerging. Even so, 23,794 claims were suspended, and 59% of them were confirmed eligible or cleared by the employment check. Cases where an automated judgment stopped benefits are [TennCare Connect](/critical/briefs/078-tenncare-connect-medicaid-eligibility/) (defects in eligibility decisions cut people off Medicaid) and [WISeR](/critical/briefs/124-wiser-medicare-ai-prior-authorization/) (AI prior authorization leaves no record of which evidence a denial rested on). Here, the matching conditions approved for the pilot changed at working level before the rollout.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side where matching results suspend payments.** It does not look for fraud or error; before suspension, it checks that a match was produced under the approved conditions and does not conflict with other records.

### Industries and operations to watch

- **Industry · Public sector**: Departments and local authorities handling benefits, tax and grants that review eligibility by matching against other bodies' data. After a pilot is approved, processes tend to change for staffing or operational reasons.
- **Operation · Approval & sign-off**: Suspending payments, ending eligibility and demanding repayment on the basis of matching results.

### Current controls vs Lemma

The route in this case is columns 1 and 2 (with the employment check removed and the period widened, limitations of the travel data, such as cancelled trips and returns by land or sea, passed straight through to suspension). Column 3 covers a member of staff wrongly suspending an individual case; nothing disclosed says that happened here.

| Control | Bulk suspension under conditions changed after approval | Wrong matches from data limitations | Staff misjudgement in an individual case |
| --- | --- | --- | --- |
| Pilot and data-sharing approval (DEA Board) | Not effective | Partial | Not effective |
| Asking before suspending, with a response period | Effective | Effective | Partial |
| Caps on case numbers and full quality checks | Partial | Partial | Effective |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

The pilot and its approval confirm that data sharing is lawful, but according to the NAO the DEA Board's remit does not extend to detailed oversight of the processes using the data, and there was no requirement to notify it of post-pilot changes. Asking before suspending is the approach HMRC adopted for the second rollout; payments continue while it waits for a reply. Caps on case numbers (starting at 50 a week) and quality checks of every case by a separate team catch errors at a small scale. Lemma checks, before suspension, not whether the data are correct but whether a match was produced within the approved conditions and does not conflict with other records such as employment.

Note: Lemma's check works only when it is built into the step that suspends payments and the approved conditions are managed apart from the staff who run the process. Claimants who do not appear in the records used for the check, such as the self-employed, can pass without any conflict showing. It also passes when the travel data themselves are wrong within the approved conditions. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not decide eligibility, and it does not reinstate suspended payments.

### Checklist

Three things to confirm about processes that stop benefits or transactions on data matching

- Do you track, as often as you track suspensions, how many were later confirmed eligible?
- When you reinstate a suspended payment, do you record the time taken and the amount backdated?
- Do you test the enquiry letters you send to claimants with recipients before full rollout?

## 5. Facts and timeline

- **Parties**: HM Revenue & Customs (HMRC). The Home Office provided the travel data. The data sharing rests on the Digital Economy Act, was reviewed by the DEA Board and approved by the Cabinet Office. The investigation was by the National Audit Office (NAO).
- **Child Benefit**: Paid for around 11.7 million children in around 6.9 million families; spending was £13.3 billion in 2024-25, the largest benefit HMRC pays. HMRC estimated overpayments from fraud and error that year at £270 million (2.0% of spending). Continuing to claim after moving abroad without telling HMRC is one of the main causes.
- **Pilot** (March to December 2024): A random sample of 200,000 claimants was matched against Home Office airline data, and matches apparently abroad for 12 weeks or more were returned to HMRC. The PAYE check removed 12% of matches, and HMRC opened enquiries and suspended payments for 3,656 claimants. It assessed 61% of enquiries as ineligible and estimated it prevented around £15 million in incorrect payments.
- **First rollout** (August to October 2025): HMRC received 40,537 matches from the Home Office and opened enquiries and suspended payments for 23,794. In the NAO's analysis (as of April 2026): 9,010 confirmed ineligible (38%), 8,829 confirmed eligible (37%), 5,327 removed by the PAYE check (22%) and 628 in progress (3%). Around 800 were Northern Ireland residents; people returning across the land border via Ireland were flagged as possibly abroad.
- **NAO's assessment**: The NAO says weaknesses in governance and risk management meant HMRC made changes for the first rollout that compromised delivery and performance, suspending payments for more eligible claimants than it needed to. HMRC's internal audit (December 2025) found key decisions were made at inappropriate levels without sufficient oversight, scrutiny and challenge, with no due consideration of risk appetite or formal risk assessment.
- **Impact on claimants**: Between August 2025 and February 2026 HMRC handled over 22,500 calls from claimants. By mid-November 2025 around 40% of eligible claimants had their payments reinstated automatically. As of April 2026 HMRC had paid £3,200 of compensation to 51 claimants. HMRC calculates gross savings of £60 million from the first rollout.

### Timeline

- **2021**: HMRC begins talks with the Home Office on using travel data in Child Benefit enquiries.
- **2024-01**: The Cabinet Office approves the pilot (on the DEA Board's recommendation of November 2023).
- **2024-03 to 12**: Pilot. After the PAYE check, HMRC opens enquiries and suspends payments for 3,656 claimants.
- **2025-05**: A working-level workshop decides to remove the PAYE check and lengthen the letter for EEA travellers.
- **2025-07**: Following the DEA Board's recommendation, the move to business as usual receives final approval. The post-pilot changes are not notified to the DEA Board.
- **2025-08**: The first rollout begins, scaling up from mid-September to 1,400 to 5,200 enquiries a week.
- **2025-10**: Problems emerge in mid-October through rising calls, MPs and the media; at month end HMRC stops opening new enquiries and applies a simplified PAYE check to all open enquiries. Enquiries total 23,794.
- **2025-11**: By mid-November 5,327 payments are reinstated automatically and backdated. HMRC's Accounting Officer writes to the Chair of the Treasury Committee acknowledging the impact and setting out steps to strengthen the process.
- **2025-12**: The internal audit reports, and data sharing with the Home Office restarts with ferry and Channel Tunnel data added.
- **2026-03**: The second rollout begins, with a month to respond before suspension, the upfront PAYE check reinstated and new enquiries capped at 50 a week.
- **2026-06-24**: The NAO publishes its report.

> The facts rely on the NAO report (24 June 2026; primary) and its press release. Counts are the NAO's analysis of HMRC management information, have not been audited, and may change as Mandatory Reconsiderations and appeals conclude. The NAO compares matches investigated rather than enquiries opened, so its figures differ from HMRC's published ones. The letter from HMRC's Accounting Officer to the Treasury Committee itself could not be confirmed; this Brief relies on the NAO report's account of it. Counts reported in the media are not used. How long suspensions lasted and the total backdated have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate HMRC's response. Written as of 10 November.

### After disclosure

- **HMRC**: For the second rollout it gives claimants a month to respond before suspension, simplified letters and evidence requirements (GP and school letters are no longer needed), and from April 2026 accepts evidence online. It reinstated the upfront PAYE check, removed Northern Ireland claimants travelling to Ireland and added sea and rail travel data. New enquiries were initially capped at 50 a week with every case quality-checked by a separate team (100 a week from the second half of April), and decisions to raise volumes rest with a new Child Benefit compliance working group. Following its internal audit, it plans formal risk assessments and a process template for new compliance work using data.
- **DEA Board**: Has introduced an annual check on bodies operating data-sharing agreements, including declaring any variations.
- **NAO's recommendations**: Identify the staffing an intervention needs and reassess risks, costs and benefits if it is not available; articulate the level of risk HMRC is willing to accept; use metrics that track claimant experience alongside compliance; design processes that let eligible claimants prove eligibility efficiently; and share lessons across government.

## 6. Sources

- **National Audit Office (Primary, audit report)**: "HMRC's use of travel data to tackle fraud and error in Child Benefit payments" (HC 31, 2026-06-24) — <https://www.nao.org.uk/wp-content/uploads/2026/06/HMRCs-use-of-travel-data-to-tackle-fraud-and-error-in-child-benefit-payments.pdf>
- **National Audit Office (Primary, report page)**: "HMRC's use of travel data to tackle fraud and error in Child Benefit payments" (2026-06-24) — <https://www.nao.org.uk/reports/hmrcs-use-of-travel-data-to-tackle-fraud-and-error-in-child-benefit-payments/>
- **National Audit Office (Primary, press release)**: "HMRC must apply lessons from innovative attempts to reduce Child Benefit fraud and error" (2026-06-24) — <https://www.nao.org.uk/press-releases/hmrc-must-apply-lessons-from-innovative-attempts-to-reduce-child-benefit-fraud-and-error/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
