---
brief_no: 137
title: "社会保険診療報酬支払基金：レセプト審査の「1 秒以上の目視」の目標が、自動遷移ツールで満たされていた(支払基金公表)"
title_en: "Japan's Social Insurance Medical Fee Payment Fund: An auto-advance tool met the claims-review \"one second on screen\" target (Fund disclosure)"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [identity-auth]
incident_date: 2025-01-28
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["124-wiser-medicare-ai-prior-authorization", "076-dillon-frt-wrongful-arrest"]
status: published
gate: "none"
version: "1.0"
og_lead_ja: "支払基金は、レセプト審査の「1 秒以上の目視」の目標が自動遷移ツールで満たされ、達成状況を実態より大きな数値で説明していたと公表した"
og_lead_en: "The Fund disclosed that an auto-advance tool met its one-second review target and that it had reported progress with figures larger than reality"
layout: "report"
sections: "proof"
og_kicker_ja: "審査の事例 · 確認の記録"
og_kicker_en: "CLAIMS REVIEW · REVIEW RECORDS"
og_headline_ja: "1 秒以上の目視の目標が、\n自動遷移ツールで満たされた\n<accent>職員 290 人が使用と公表</accent>"
og_headline_en: "One-second review goal\nmet by auto-advance tool\n<accent>290 staff used it: Fund</accent>"
key_figures:
  - value: "290"
    unit: "staff"
    label: "Staff confirmed to have used the tool at least once: 8.0% of the 3,630 who had ever done review work (the Fund)"
    tone: "alert"
  - value: "27"
    unit: "staff"
    label: "Staff with some claims marked confirmed by the tool alone, for whom the Fund could not rule out that no visual inspection took place"
  - value: "100"
    unit: "%"
    label: "Target rate of visual inspection for flagged claims, measured by whether a claim was on screen for at least one second"
glossary:
  - term: "Receipt (claim)"
    desc: "A medical fee claim a provider submits under Japan's public health insurance. The Fund reviews it and pays the provider."
  - term: "AI sorting"
    desc: "The Fund's mechanism that, after computer checks, sorts claims into those a human inspects, those routed to the AI, and those whose disposition is clear. The share for human review had been narrowed to 10% from October 2023."
  - term: "Auto-advance tool"
    desc: "Something that pressed Enter automatically after a set number of seconds and moved to the next claim screen. It was built with spreadsheet software on the review terminals and spread through shared folders (the Fund)."
insight:
  slug: "display-time-is-not-review"
  label: "Display time is not a record of review"
  quote: "If a record of having reviewed rests only on how long a screen was displayed, neither that record nor the rate aggregated from it shows whether a person looked at the content."
industries: ["healthcare", "public-sector"]
operations: ["approval"]
controls:
  - slug: "audit-trail"
    item: "Record that a person actually reviewed the claim, not just that it was displayed"
impact: "290 staff used a tool that auto-pressed Enter (the Fund)"
takeaway: "In the Fund's disclosure, the visual-inspection target for claims review was measured by whether a screen stayed up for one second, and a tool that advanced screens automatically could meet it. Tie the review record to who reviewed what, separately from display time."
self_check: "In steps that require human review, is the \"confirmed\" record tied to who reviewed which content, rather than to how long a screen was displayed?"
countries: ["jp"]
---

## 1. Summary

For the claims its AI sorting had marked for human inspection, the Fund set a target for the rate of visual inspection and measured it by how long each screen was displayed. According to the Fund, a tool that advanced to the next screen after a set number of seconds also met that condition, and the resulting records were counted as visual inspection. The Fund's internal investigation swept tool use nationwide within about a month of learning of it at one center. <strong>If a record of having reviewed rests only on how long a screen was displayed, neither that record nor the rate aggregated from it shows whether a person looked at the content.</strong>

## 2. What got through

- **What got through**: The operation that marks a flagged claim "confirmed" and advances to the next screen. According to the Fund, the tool pressed Enter automatically after a set number of seconds and moved on to the next claim. Auto-advance halted on claims carrying a computer-check or similar flag; the claims that could be marked confirmed by the tool alone were those triggering neither a computer check nor an extraction condition.
- **What the receiving side gets**: The review system keeps a record that the screen was displayed for at least one second, and that record counts toward the inspection-rate numerator (the Fund). In general, a display-time record cannot distinguish whether a person looked at the content. The aggregated rate was used in describing progress to stakeholders.
- **Not disclosed**: How many claims were marked confirmed by the tool alone, and how large the difference was between the rate described and reality; this Brief has not been able to confirm either.

## 3. What to check

The condition that can be distinguished is this: before a claim is finalized as "confirmed," check that the confirmation is tied to which reviewer issued it and to the content of which claim.

- **Who approves**: The staff member assigned to review. How long a screen was displayed, or that Enter was pressed, does not stand in for that person having reviewed the content.
- **Where the check happens**: Just before a flagged claim is finalized as confirmed and the next screen opens. A confirmation that cannot be tied to that reviewer and that claim is not counted as confirmed.
- **What remains**: A record of which claim was marked confirmed, by whom, against which content, in a form where an aggregate such as an achievement rate traces back to each confirmation that composes it.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a claim is finalized as confirmed, which reviewer the confirmation came from and which claim it covers, and keeping a record. Detection means establishing the facts of tool use afterwards; here, the Fund's urgent survey, interviews and nationwide survey did that.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check who confirmed what before the claim is finalized</div>
<div class="rx-zone gapz"><b>What the Fund disclosed</b><span>Display-time records counted as inspection,<br>and progress was described with larger figures</span></div>
<div class="rx-zone det"><b>Detection · the internal investigation worked</b>From one center's discovery, tool use was swept nationwide</div>
<div class="rx-g g1"><div class="t">SORT</div><b>Computer checks and AI sorting narrow down claims for visual inspection</b></div>
<div class="rx-g g2"><div class="t">ADVANCE</div><b>The tool presses Enter after a set interval and moves to the next screen</b></div>
<div class="rx-g g3"><div class="t">COUNT</div><b>The "displayed for at least one second" record counts toward the rate</b></div>
<div class="rx-g g4"><div class="t">SURVEY</div><b>2024-11-13: found at the Kyushu review center; a nationwide survey follows</b></div>
</div>
</figure>

The internal investigation identified the tool's users and the staff for whom missing inspection could not be ruled out, but only after the records had piled up. What the check addresses sits earlier: distinguishing, at the moment a record is written, whether it represents a human review. Placing human confirmation downstream of an AI judgment is the same shape as [Brief 124](https://lemma.frame00.com/critical/briefs/124-wiser-medicare-ai-prior-authorization/), where AI drives prior authorization while the final call stays with a person.

## 4. What Lemma does

**Lemma builds the check in section 3 into the point just before a claim is finalized as confirmed.** It does not find tool use afterwards; it makes which reviewer and which claim a "confirmed" record rests on checkable before finalization and at the point of aggregation.

### Industries and operations to watch

- **Industry · Healthcare**: Bodies that review medical fee claims and pay providers, and review steps where a person confirms downstream of AI sorting.
- **Industry · Public sector**: Public bodies that describe progress against business targets to stakeholders using aggregates of records.
- **Operation · Approval**: Review and approval steps finalized through human confirmation, and the aggregation of their completion rates.

### Current controls vs Lemma

In this case, claims could be marked confirmed by the tool alone in column 2; in column 1, the flag halted auto-advance.

| Control | Marking confirmed (flagged claims) | Marking confirmed (unflagged claims) | Aggregating and reporting the inspection rate |
| --- | --- | --- | --- |
| Measuring display time (at least one second) | Not effective | Not effective | Not effective |
| Halting auto-advance on flags | Effective | Not effective | Not relevant |
| **Lemma (pre-execution check)** | Partial | Partial | Effective |

Display-time measurement is satisfied even when a tool advances the screen, and it does not distinguish whether a person looked. The flag halted auto-advance on claims with a computer check, but did not act on claims that triggered nothing. Lemma ties a confirmed record to the reviewer and to the claim's content, and lets an aggregate trace back to each record. It cannot check whether the reviewer actually read the content, so the confirmation columns are marked "Partial."

Note: Lemma's check works only when it is built in just before a claim is finalized as confirmed, and the key the reviewer uses to confirm is managed separately from the terminal or tool that operates the screen. If the act of confirming under the reviewer's own authority is itself automated, it passes this check. The table compares what each control checks; it does not show whether this case would have been stopped. Lemma does not detect or prevent intrusions, nor does it judge target-setting, staffing, or whether a judgment's content was correct.

### Checklist

Three items to confirm for review and approval steps that require human confirmation

- Is the "confirmed" record tied to who confirmed and to the content reviewed, rather than to display time or the number of key presses?
- Can an aggregate such as a completion rate be traced back to each confirmation record that composes it?
- Is it built so that tools or macros that advance confirmation automatically are not counted as confirmation?

## 5. Facts and timeline

- **Organization**: The Social Insurance Medical Fee Payment Fund (the Fund), the statutory body that reviews medical fee claims under Japan's public health insurance system and pays providers accordingly.
- **Mechanism**: In the current system, claims first pass computer checks — intake and administrative screening, the electronic fee schedule, and cross-checks. A first sorting stage then files them into three groups: claims a human inspects, claims routed to the AI, and claims whose disposition is clear. The AI itself (Minhash and Xgboost) operates at the second sorting stage. The share requiring human review had been narrowed from 20% at launch to 15% in October 2022 and 10% from October 2023.
- **Business target**: In normal operation, a reviewer inspects each claim on the review screen and presses a "confirmed" button or the Enter key, which advances to the next. For fiscal 2022 H2 and fiscal 2023, the Fund set a target of a 100% visual-inspection rate for flagged claims, measured by whether the claim had been displayed for at least one second.
- **Tool**: It pressed Enter automatically after a set number of seconds, advancing to the next claim. It was built with spreadsheet software already installed on the review terminals and spread through shared folders. Use began around June 2022.
- **Confirmed**: Through the nationwide survey and interviews, 290 of the 3,630 staff who had ever performed review work (8.0%) were confirmed to have used the tool at least once. Of these, 81 reported having left their desk while it ran. The Fund states that all 81 still performed visual inspection on computer-check-flagged claims and extraction-condition review work, but that for 27 of them, some claims triggering neither had been marked confirmed by the tool alone, so the possibility that no visual inspection took place cannot be ruled out.
- **Reasons for use**: The Fund grouped the reasons given in interviews into four categories: meeting the target, work efficiency, review performance, and dissatisfaction with the target.
- **Discipline**: Dated 2025-01-23, formal discipline for 25 staff (1 suspension, 2 pay reductions, 22 reprimands), and written cautions for a further 267. According to the Fund's material, the two pay reductions concerned the management of USB storage, not supervisory responsibility for the auto-advance tool.

### Timeline

- **2024-11-13**: Tool use comes to light at the Kyushu review center. On the 14th, headquarters tells staff nationwide not to use it.
- **2024-11-15 to 25**: An urgent nationwide survey on tool use runs, while headquarters obtains and tests the tool.
- **2024-12-02 onward**: Judging the urgent survey insufficient, the Fund begins interviews by center directors (320 people: tool users, builders and others).
- **2024-12-03 to 13**: A nationwide web survey of all 3,630 staff who had ever performed review work.
- **2024-12-04**: Situation reported to the Ministry of Health, Labour and Welfare. On 12-16, reported to the board.
- **2025-01-23**: Disciplinary action issued.
- **2025-01-28**: The Fund discloses the matter at its January press conference.
- **2025-01-31**: Minister Fukuoka addresses the matter at the Ministry's regular press briefing.

> The facts are based on the Fund's press-conference material and its description of AI sorting (primary), and the Ministry's summary of the Minister's press briefing (primary). Counts, percentages and the disciplinary breakdown are from the Fund's disclosure. This Brief does not evaluate the conduct of individual staff or whether disciplinary decisions were fair; it addresses the link between a record of confirmation and the act of confirming. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **The Fund**: Headquarters told staff nationwide to stop using the tool and ran the surveys. The Fund noted that the tool halts on computer-check-flagged claims and reported no meaningful difference in average assessment results between staff who used the tool and those who did not. At the same time, it acknowledged that it had, as a result, described its progress against the business target to stakeholders using figures larger than reality, calling this "deeply regrettable" and apologizing.
- **Ministry of Health, Labour and Welfare**: The Minister called the situation "very regrettable," noting that experienced reviewers can judge a claim with only a handful of line items instantly and that some had questioned the one-second rule, and pointed to the possibility of inadequate communication between the headquarters that set the rule and the front line. The Ministry said it would direct the Fund to identify the cause and ensure recurrence prevention.

## 6. Sources

- **Social Insurance Medical Fee Payment Fund (primary, official)**: "レセプト画面の自動遷移ツール," January press-conference material 5 (2025-01-28, 19 pages; covers the sequence of events, the nationwide survey results, and the disciplinary breakdown) — <https://www.ssk.or.jp/pressrelease/pressrelease_r06/press_070128_1.files/pressrelease_070128_1_5.pdf> (conference page: <https://www.ssk.or.jp/pressrelease/pressrelease_r06/press_070128_1.html>)
- **Ministry of Health, Labour and Welfare (primary, official press briefing transcript)**: "福岡大臣会見概要" (January 31, 2025) — <https://www.mhlw.go.jp/stf/kaiken/daijin/0000194708_00773.html>
- **Social Insurance Medical Fee Payment Fund (primary, official)**: "AI によるレセプト振分機能について," on the AI claim-sorting function — <https://www.ssk.or.jp/shinryohoshu/gyomuflow/ai_furiwake.html>
- **Tokyo Hoki Shuppan medical news (reporting)**: The Fund disciplined 290 staff and 2 managers after surveying 3,630 nationwide (February 2025) — <https://www.tkhs.co.jp/medical/news/detail.html?CMS_FRONT_INFO_ID=1942>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
