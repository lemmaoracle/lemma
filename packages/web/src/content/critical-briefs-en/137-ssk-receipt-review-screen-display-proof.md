---
brief_no: 137
title: "支払基金のレセプト審査で、職員 290 人が自動遷移ツールを使っていた — 「画面を 1 秒以上表示した」記録は、人が確認したことの証明にならない"
title_en: "290 staff at Japan's claims-review fund used an auto-advance tool — a \"displayed for at least one second\" log is not proof a person reviewed it"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [identity-auth]
incident_date: 2025-01-29
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["124-wiser-medicare-ai-prior-authorization", "076-dillon-frt-wrongful-arrest"]
status: published
version: "1.0"
og_lead_ja: "支払基金の「画面 1 秒表示」記録は、目視確認の証明にならなかった"
og_lead_en: "A one-second on-screen log stood in for human review at Japan's claims fund"
---

## 1. TL;DR

At Japan's Social Insurance Medical Fee Payment Fund, claims flagged for human review by an AI-and-computer pre-check were logged as reviewed while staff ran a tool that advanced the screen automatically. A nationwide survey of 3,630 staff found 290 of them — 8.0% — had used it. The Fund's internal investigation detected this. **What didn't work was a layer independently confirming that a log reading "displayed on screen for at least one second" was proof a person had actually reviewed the content.**

## 2. What happened

- The Fund is the statutory body that reviews medical fee claims (レセプト) under Japan's public health insurance system and pays providers accordingly.
- In its current review system, claims first pass computer checks — intake and administrative screening, the electronic fee schedule, and cross-checks — then an AI sorting step files them into three groups: claims a human reviews, claims the AI sorts, and claims whose disposition is clear. The share requiring human review had been narrowed from 20% at launch to 10% from October 2023.
- Under the Fund's operating rules, a claim flagged for visual confirmation had to be displayed on a reviewer's screen for at least one second while the reviewer checked its content.
- Some staff created or used a tool that automatically advanced to the next screen once that interval had elapsed.

With the tool in the loop, the review record forms like this:

1. The pre-check and AI sorting flag the claim as requiring visual confirmation.
2. The confirmation screen appears on the reviewer's terminal.
3. The auto-advance tool moves to the next screen once the required interval passes.
4. The system logs that the screen was displayed for the required duration — a log that cannot distinguish whether a person looked at the content.

The Fund surveyed 3,630 staff nationwide and confirmed that 290 of them, 8.0%, had used such a tool at least once. Its internal investigation concluded that even those staff had still visually confirmed claims requiring particularly close attention.

## 3. Timeline — disclosure and response

- Dated 2025-01-23: Disciplinary action issued.
- 2025-01-29: The Fund announced the action — 290 staff and 2 managers, 292 people in total (25 formal disciplinary actions, 267 written cautions). The survey ran nationwide across November and December 2024.
- 2025-01-31: Health, Labour and Welfare Minister Fukuoka addressed the matter at the Ministry's regular press briefing.

> The Fund's own PDF announcement ("Disciplinary action, dated January 23, 2025") has since been removed from its website and is no longer available as a primary source. The breakdown of those disciplined rests on the Ministry's press-briefing transcript (where the figures appear in reporters' questions) and on trade reporting. The "25 plus 267" and "290" figures appear inconsistent at first glance, but reconcile: the former is the total of 292 disciplined including 2 managers, the latter the count of staff confirmed to have used the tool — 292 = 290 + 2.

Responses and open points:

- The Minister called the situation "very regrettable," noting that experienced reviewers can judge a claim with only a handful of line items instantly and that some had questioned the necessity of the one-second rule — pointing to inadequate communication between the headquarters that set the rule and the front line.
- At the briefing, a reporter stated that the Fund had denied supervisory responsibility and declined to discipline its leadership, including its president. The Ministry said it would refrain from commenting on individual disciplinary decisions while directing the Fund to identify the cause and ensure recurrence prevention.
- At the time, the Fund was under discussion for a fundamental reorganization as the operating body for Japan's medical DX initiative, with the Minister to set overall policy — part of a broader push for national government governance. This incident surfaced in parallel with that debate.

## 4. Why it wasn't stopped

The failure here is not that staff neglected their reviews, nor any sophistication in the tool. It is that **a "reviewed" record could be produced from a proxy for human judgment — elapsed display time — rather than from the act of judgment itself**.

A proxy can be satisfied independently of whether the underlying judgment occurred. What staff used was not sophisticated technology, just a tool that automated screen advancement. Detection worked — the internal investigation swept 3,630 staff and identified 290 users. What didn't work sits earlier: a layer that, at the moment the record is written, confirms the record represents a human judgment. That is the **gap between detection and proof**.

The Fund's own reassurance — that staff still visually confirmed claims flagged for particular attention — carries the same structural limit. Because it rests on an after-the-fact internal investigation, there was never a way, at review time, to confirm independently of the display-time log that a person had rendered a judgment on any specific claim.

> The Minister pointed to a gap between the rule set by headquarters and what the front line judged necessary. But even granting the rule was sound, without a mechanism that independently binds "a review was logged" to "a review actually took place," the same kind of bypass recurs under a different operating rule.

Placing human confirmation downstream of an AI pre-judgment is the same shape as [Brief 124](/critical/briefs/124-wiser-medicare-ai-prior-authorization/), where AI drives prior authorization while the final call stays with a person. A confirmation step downstream of an automated decision cannot be counted as a procedural safeguard unless its occurrence can be independently shown.

## 5. What proof would have changed

Placing a human review step after AI sorting is a reasonable design. The question is how that act of review gets bound to evidence that is independently verifiable before the action is finalized, rather than to a proxy like elapsed time.

Lemma's design against this gap:

<ul class="bd-check">
<li><strong>Proof of judgment before the action</strong> — for items flagged as requiring review, require the fact that a judgment was made as independent evidence before approval or finalization.</li>
<li><strong>Separating proxy from judgment</strong> — never treat a proxy signal such as screen display time as equivalent to proof of the judgment itself. The proxy may be satisfied; the proof stands separately.</li>
<li><strong>Tamper-resistant review records</strong> — keep confirmation records that both the rule-setting body and the actual decision-maker can reference and neither can rewrite after the fact.</li>
</ul>

What this layer does not carry:

<ul class="bd-limit">
<li>It does not judge whether the review workflow's operating rules or staffing levels were appropriate. Whether one second was the right threshold belongs to the design of the review system.</li>
<li>It does not evaluate whether individual disciplinary decisions were fair.</li>
<li>Proof can show that a judgment was actually made, not that the judgment was correct.</li>
</ul>

This is where it differs from an after-the-fact internal investigation. An investigation establishes what happened once a problem has surfaced, but it is no basis for distinguishing, as each claim is processed, whether that confirmation actually took place.

Detection and this layer are complements, not substitutes. The former sweeps for deviations after the fact and sizes the problem; the latter makes it verifiable, before a review is finalized, that a logged confirmation is backed by an act of confirmation.

## 6. Sources

- **Ministry of Health, Labour and Welfare (primary, official press briefing transcript)**: "福岡大臣会見概要" (January 31, 2025) — <https://www.mhlw.go.jp/stf/kaiken/daijin/0000194708_00773.html>
- **Social Insurance Medical Fee Payment Fund (primary, official)**: "AI によるレセプト振分機能について" (on the AI claim-sorting function) — <https://www.ssk.or.jp/shinryohoshu/gyomuflow/ai_furiwake.html>
- **Tokyo Hoki Shuppan medical news (reporting)**: The Fund disciplined 290 staff and 2 managers after surveying 3,630 nationwide (February 2025) — <https://www.tkhs.co.jp/medical/news/detail.html?CMS_FRONT_INFO_ID=1942>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On making decisions verifiable, see [Pillar 02 — Verifiable AI](/pillars/#inference).

This document is a structural analysis of public information, not an audit, assessment, or recommendation regarding any specific organization. The Fund's own disciplinary-action PDF has been removed from its website; the breakdown of those disciplined rests on the ministerial press-briefing transcript and trade reporting.
