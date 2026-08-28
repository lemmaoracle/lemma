---
brief_no: 137
title: "支払基金の「1 秒以上の目視」目標を、職員 290 人が自動遷移ツールで満たしていた — 記録された達成率は、実態より大きな数値で報告されていた"
title_en: "290 staff at Japan's Social Insurance Medical Fee Payment Fund met a \"one second on screen\" target with an auto-advance tool — the recorded achievement rate was reported higher than reality"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [identity-auth]
incident_date: 2025-01-28
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["124-wiser-medicare-ai-prior-authorization", "076-dillon-frt-wrongful-arrest"]
status: published
version: "1.0"
og_lead_ja: "支払基金の「1 秒以上の目視」目標、達成率は実態より大きく報告"
og_lead_en: "Staff met Japan's claims-Fund one-second target with a tool"
---

## 1. TL;DR

Japan's Social Insurance Medical Fee Payment Fund set a business target of reviewing 100% of the claims its AI sorting had narrowed down for human inspection — and measured that target by whether the claim had been on screen for at least one second. 290 staff met that threshold using a tool that pressed Enter automatically after a set interval. The Fund's internal investigation detected this. **What didn't work was a layer independently confirming that a log reading "displayed for at least one second" was proof a person had reviewed the content.**

## 2. What happened

- The Fund is the statutory body that reviews medical fee claims under Japan's public health insurance system and pays providers accordingly.
- In its current system, claims first pass computer checks — intake and administrative screening, the electronic fee schedule, and cross-checks. A first sorting stage then files them into three groups: claims a human inspects, claims routed to the AI, and claims whose disposition is clear. The AI itself (Minhash and Xgboost) operates at the second sorting stage. The share requiring human review had been narrowed from 20% at launch to 15% in October 2022 and 10% from October 2023.
- In normal operation, a reviewer inspects each claim on the review screen and presses a "confirmed" button or the Enter key, which marks the claim confirmed and advances to the next. For fiscal 2022 H2 and fiscal 2023, the Fund set a business target of a 100% human-inspection rate for claims flagged for visual review, measured by whether the claim had been displayed for at least one second.
- The tool in use pressed Enter automatically after a set number of seconds, advancing to the next claim. It was built with spreadsheet software already installed on the review terminals and spread through shared folders. Use began around June 2022.
- Through the nationwide survey and the interviews, 290 of the 3,630 staff who had ever performed review work — 8.0% — were confirmed to have used the tool at least once.
- Of the 290 users, 81 reported having left their desk while the tool ran. The Fund states that all 81 still performed visual inspection on computer-check-flagged claims and review work driven by extraction conditions — but that for 27 of those 81, some claims triggering neither had been marked confirmed by the tool alone, so the possibility that no visual inspection took place cannot be ruled out.

With the tool in the loop, the review record forms like this:

1. The computer checks and AI sorting narrow the claim down as one requiring visual inspection.
2. The tool presses Enter after a set interval and advances to the next claim. But **auto-advance halts on any claim carrying a computer-check or similar flag**. The claims that could be marked confirmed by the tool alone were those triggering neither a computer check nor an extraction condition.
3. The system logs that the screen was displayed for at least one second, and that log counts toward the inspection-rate numerator.
4. The log cannot distinguish whether a person looked at the content.

## 3. Timeline — disclosure and response

- 2024-11-13: The use of the tool came to light at the Kyushu review center. On the 14th, headquarters told staff nationwide to stop using it.
- 2024-11-15 to 25: An urgent survey on tool use ran nationwide, while headquarters obtained and tested the tool.
- 2024-12-02 onward: Judging the urgent survey insufficient, the Fund began interviews conducted by center directors (320 people).
- 2024-12-03 to 13: A nationwide web survey of all 3,630 staff who had ever performed review work.
- 2024-12-04: Situation reported to the Ministry of Health, Labour and Welfare. 12-16: reported to the board.
- Dated 2025-01-23: Disciplinary action issued — 1 suspension, 2 pay reductions, and 22 reprimands, 25 in total. A further 267 staff received a written caution.
- 2025-01-28: The Fund disclosed the matter at its January press conference (reported the following day, January 29).
- 2025-01-31: Health, Labour and Welfare Minister Fukuoka addressed the matter at the Ministry's regular press briefing.

> The breakdown warrants care. Of the 25 formal disciplinary actions, the two pay reductions — a section chief and a deputy section chief — were for failing to manage USB storage, not for supervisory responsibility over the auto-advance tool. The 22 reprimands went to those who built the tool, and the single suspension to a staff member who moved freeware onto a shared folder via a USB stick. The 267 who used the tool did not meet the threshold for formal discipline and received a written caution.

Responses and open points:

- The Fund noted that the tool halts on computer-check-flagged claims, and that all 81 who admitted leaving their desk still performed extraction-condition review work. It also reported no meaningful difference in average assessment results between staff who used the tool and those who did not.
- At the same time, the Fund acknowledged that it had described its progress against the business target to stakeholders using figures larger than reality, and said so was regrettable.
- The Minister called the situation "very regrettable," noting that experienced reviewers can judge a claim with only a handful of line items instantly and that some had questioned the necessity of the one-second rule — pointing to inadequate communication between the headquarters that set the rule and the front line.
- At the briefing, a reporter stated that the Fund had denied supervisory responsibility and declined to discipline its leadership, including its president. The Ministry said it would refrain from commenting on individual disciplinary decisions while directing the Fund to identify the cause and ensure recurrence prevention.
- At the time, the Fund was under discussion for a fundamental reorganization as the operating body for Japan's medical DX initiative, with the Minister to set overall policy — part of a broader push for national government governance. This incident surfaced in parallel with that debate.

## 4. Why it wasn't stopped

The failure here is not that staff neglected their reviews, nor any sophistication in the tool. It is that **the business target was measured by a proxy for the act of inspection — elapsed display time — and that measurement was then reported upward as the record of having inspected**.

A proxy can be satisfied independently of whether the underlying judgment occurred. The Fund grouped the reasons given in interviews into four categories — meeting the target, work efficiency, review performance, and dissatisfaction with the target itself — and avoiding a missed target is the most heavily represented: "I was being coached by my supervisor because my one-second inspection rate wasn't reaching 100%." One who built the tool said, "once you cleared 90% they asked for 100%, and I built it without thinking it through." What they used was not sophisticated technology either — something buildable in the spreadsheet software already on the terminal.

Detection worked — within a month of the discovery at a single center, the Fund had swept 3,630 staff and identified 290 users, and by disclosure had pinned down 27 who might not have inspected at all. What didn't work sits earlier: a layer that, at the moment the record is written, confirms the record represents a human judgment. That is the **detection–proof gap**.

The Fund's own words state the consequence most clearly:

> For fiscal 2022 H2 and fiscal 2023, our business target was to conduct reliable review by using the AI claim-sorting function to narrow down claims for visual inspection, with a 100% rate of visual inspection on those claims. That we nonetheless described our progress against that target to stakeholders using figures larger than reality is deeply regrettable, and we apologize. (The Fund, 2025-01-28)

If a record is not backed by the act, the rate aggregated from those records does not represent the act either. Independently of whether the rule itself was sound, the same kind of bypass recurs under a different operating rule.

Placing human confirmation downstream of an AI pre-judgment is the same shape as [Brief 124](/critical/briefs/124-wiser-medicare-ai-prior-authorization/), where AI drives prior authorization while the final call stays with a person. A confirmation step downstream of an automated decision cannot be counted as a procedural safeguard unless its occurrence can be independently shown.

## 5. What proof would have changed

Using AI sorting to narrow down what a human inspects, then placing that inspection downstream, is a reasonable design. The question is how that act of inspection gets bound to evidence that is independently verifiable before the action is finalized, rather than to a proxy like elapsed time.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Proof of judgment before the action</strong>: for items flagged as requiring review, require the fact that a judgment was made as independent evidence before the claim is submitted or finalized.</li>
<li><strong>Separating proxy from judgment</strong>: never treat a proxy signal such as screen display time as equivalent to proof of the judgment itself. The proxy may be satisfied; the proof stands separately.</li>
<li><strong>Aggregates that trace back</strong>: make an aggregate such as an achievement rate traceable back to the evidence for each judgment that composes it, so the link to the act is not severed at the point of aggregation.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not judge whether the review function's targets or staffing levels were appropriate. Whether one second, or 100%, was the right threshold belongs to the design of the review system.</li>
<li>It does not evaluate whether individual disciplinary decisions were fair.</li>
<li>Proof can show that a judgment was actually made, not that the judgment was correct.</li>
</ul>

This is where it differs from an after-the-fact internal investigation. An investigation establishes what happened once a problem has surfaced, but it is no basis for distinguishing, as each claim is processed, whether that confirmation actually took place.

Detection and this layer are complements, not substitutes. The former sweeps for deviations after the fact and sizes the problem; the latter makes it verifiable, before a review is finalized, that a logged confirmation is backed by an act of confirmation.

## 6. Sources

- **Social Insurance Medical Fee Payment Fund (primary, official)**: "レセプト画面の自動遷移ツール," January press-conference material 5 (2025-01-28, 19 pages; covers the sequence of events, the nationwide survey results, and the disciplinary breakdown) — <https://www.ssk.or.jp/pressrelease/pressrelease_r06/press_070128_1.files/pressrelease_070128_1_5.pdf> (conference page: <https://www.ssk.or.jp/pressrelease/pressrelease_r06/press_070128_1.html>)
- **Ministry of Health, Labour and Welfare (primary, official press briefing transcript)**: "福岡大臣会見概要" (January 31, 2025) — <https://www.mhlw.go.jp/stf/kaiken/daijin/0000194708_00773.html>
- **Social Insurance Medical Fee Payment Fund (primary, official)**: "AI によるレセプト振分機能について," on the AI claim-sorting function — <https://www.ssk.or.jp/shinryohoshu/gyomuflow/ai_furiwake.html>
- **Tokyo Hoki Shuppan medical news (reporting)**: The Fund disciplined 290 staff and 2 managers after surveying 3,630 nationwide (February 2025) — <https://www.tkhs.co.jp/medical/news/detail.html?CMS_FRONT_INFO_ID=1942>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On making decisions verifiable, see [Pillar 02 — Verifiable AI](/pillars/#inference).

The Fund holds that the impact on review quality was limited, citing that the tool halts on computer-check-flagged claims and that assessment results showed no meaningful difference. This Brief addresses the structural link between record and act, not the conduct of individual staff.
