---
brief_no: 134
title: "東京都住宅供給公社：Excel 一覧から宛名ラベルを作る際に住棟・号室を誤った部分から取り、都営住宅の自治会長 770 名の氏名が別の住民に届いた(東京都発表)"
title_en: "Tokyo Metropolitan Housing Supply Corporation: Address labels built from the wrong part of an Excel list sent the names of 770 public-housing residents' association heads to other residents (Tokyo Metropolitan Government announcement)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2026-09-28
published: 2026-10-20
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["151-toppan-sompo-japan-misdirected-zip", "065-hokkaido-hospital-hdd-disposal", "137-ssk-receipt-review-screen-display-proof"]
status: published
version: "1.0"
og_lead_ja: "東京都住宅供給公社が、自治会長 770 名の氏名を別の住民へ誤って送付"
og_lead_en: "Tokyo Housing Supply Corporation misdirected the names of 770 association heads"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "人手の事故事例 · 誤送付"
og_kicker_en: "HUMAN ERROR · MISDIRECTED MAIL"
og_headline_ja: "宛名ラベルの住棟・号室が、\n一覧の誤った部分から取られた。\n<accent>770 名の氏名が別の住民に</accent>"
og_headline_en: "Address labels took building and unit numbers from the wrong part of the list.\n<accent>770 names reached other residents.</accent>"
key_figures:
  - value: "770"
    unit: "names"
    label: "Residents' association heads whose names reached residents other than the intended recipients"
    tone: "alert"
  - value: "846"
    unit: "notices"
    label: "Misaddressed, out of 1,997 mailed (76 were returned)"
  - value: "09-28 → 10-13"
    label: "15 days from mailing until a recipient's call brought it to light"
glossary:
  - term: "Address label"
    desc: "A label printed with the recipient's address and name, stuck on the envelope. Here it was built from an Excel list."
  - term: "Policy partner organisation"
    desc: "A body that carries out Tokyo Metropolitan Government policy in partnership with it. The Corporation is one, and maintains Tokyo's public housing under contract."
insight:
  slug: "dispatched-without-list-match"
  label: "Dispatch never matched to the list"
  quote: "Unless address labels are matched to the source list, a wrong address cannot be seen by looking, and it goes out as it is."
industries: ["public-sector"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Do not dispatch until the labels are matched to the source list"
  - slug: "audit-trail"
    item: "Record the match result separately from the operator's actions"
attack_method: "human-error"
impact: "Names of 770 association heads reached other residents"
takeaway: "Match address labels to the source list before dispatch, by someone other than the operator."
self_check: "Can you match address labels against the source list before shipping?"
countries: ["jp"]
---

## 1. Summary

It was not a cyberattack. When building address labels from an Excel list, staff took the building and unit numbers from the wrong part of the list and attached the labels as they were. Each label still looked like a proper address; only matching it against the source list would show the error. It came to light through a call from a resident who received one. <strong>Unless address labels are matched to the source list before dispatch, a wrong address cannot be seen by looking, and it goes out as it is.</strong>

## 2. What got through

- **What got through**: Mailing of notices with address labels built from an Excel list. 846 of the 1,997 notices mailed were misaddressed (per Tokyo Metropolitan Government).
- **What reached the receiving side**: In general, a label arrives looking like a proper address. The dispatch step does not look at whether the label matches a row of the source list.
- **Information involved**: The names of 770 residents' association heads of Tokyo public housing. The release does not say addresses leaked.
- **Not disclosed**: Which column was mistaken, whether any step matched the labels to the source list, and whether there was secondary leakage or misuse.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever dispatches notices from address labels matches each label's destination to a row of the source list, just before dispatch, by a means other than the operator's eyes.

- **Who approves**: Someone other than the operator who made the labels, or a system. It holds, in a list decided in advance, the scope of the mailing (which notice goes to which recipients).
- **Where it is checked**: Directly before dispatch. It mechanically matches each label's destination to its row in the source list and looks for destinations outside the scope. What does not match is not sent, and dispatch is held until the match is done.
- **What is recorded**: When, against which list, and which labels were matched and let through; and what did not match, and why. Kept apart from the operator's actions, in a form a third party can later be shown.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching each label's destination to the source list before dispatching notices with those labels, and keeping a record. Detection means noticing after a misdelivery. The dates below are when Tokyo Metropolitan Government and the Corporation confirmed or announced each point, not when the labels were made.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the announcement</b>Match each destination to the source list before dispatch</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>846 notices misaddressed<br>770 reached other residents</span></div>
<div class="rx-zone det"><b>Detection · learned afterwards</b>It came to light through a call from a resident who received one</div>
<div class="rx-g g1"><div class="t">Before dispatch</div><b>Labels made (date not disclosed)</b></div>
<div class="rx-g g2"><div class="t">09-28</div><b>Notices mailed</b></div>
<div class="rx-g g3"><div class="t">10-13</div><b>A resident's call brings it to light</b></div>
<div class="rx-g g4"><div class="t">10-16</div><b>Corporation and Housing Policy HQ announce</b></div>
</div>
</figure>

Detection worked, but only 15 days after mailing. A similar case, where the contents of a manually assembled ZIP were not rechecked before sending, is [TOPPAN and Sompo Japan](/critical/briefs/151-toppan-sompo-japan-misdirected-zip/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that dispatches notices from address labels.** It does not look for intrusions; it checks, before dispatch, that each label's destination matches a row of the source list.

### Industries and operations to watch

- **Industry · Government & public sector**: Municipalities and affiliated bodies that mail notices to residents or associations in bulk from a roster or list. Notices carry names, roles and other details meant only for the addressee.
- **Operation · Sending & delivery**: Building addresses from a list, then enclosing, labelling and mailing. An address error does not show until the item has arrived.

The same hole exists wherever mail is produced from a roster: mail-merge addresses, labels built from a spreadsheet, dispatch data prepared by a contractor. In each, shifting one reference in the list shifts every row, and the result still looks plausible to the person who made it.

### Current controls vs Lemma

The route in this case is dispatch with address labels built from a list. The table compares how each control works on this route.

| Control | Dispatch with labels built from a list |
| --- | --- |
| Visual checks by multiple staff (the Corporation's prevention plan) | Partial |
| Spot checks | Partial |
| Personal-data handling training | Partial |
| Email misdelivery-prevention tools | Not relevant |
| **Lemma (pre-execution check)** | Effective |

Visual checks by multiple staff give more chances to notice, but what was compared with what is not recorded, and plausible-looking addresses can still be missed. Spot checks catch it easily when every row shifted the same way; when only some rows shifted, they pass unless they fall into the sample. Training raises care, but reference mix-ups happen even when people are careful. Email misdelivery-prevention tools check email recipients and have nothing to do with paper mail. Lemma matches each label's destination to its row in the source list before dispatch, by someone or something other than the operator.

Note: Lemma's check works only when it is built into the dispatch step and the source list is managed apart from the work of making the labels. If the source list itself is wrong, or if items are mixed up at the enclosing or labelling stage after the match, it still goes through. Holding dispatch until every item is matched also delays mailings. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for work that produces mail from a roster or list

- Can each row of the address labels or dispatch data be traced back to the row of the source list it was built from?
- Before dispatch, does someone or something other than the person who made the labels match every address against the source list? If they do not match, can dispatch be stopped?
- Is the fact of the match, and what was compared with what, kept as a record rather than in the checker's memory?

## 5. Facts and timeline

- **Work**: mailing a notice to residents' association heads of Tokyo public housing. The Corporation, a policy partner organisation of the Tokyo Metropolitan Government, maintains the public housing under contract.
- **Content**: the notice "Change to the drain-pipe cleaning application method". Labels were wrong, so notices reached residents of other buildings and units.
- **Count**: 846 of 1,997 notices were misaddressed; 76 were returned and 770 reached someone other than the intended recipient.
- **Information involved**: the names of 770 residents' association heads. The release does not say addresses leaked.
- **The error**: when building address labels from an Excel list, the building and unit numbers were quoted from the wrong part of the list. Which column was mistaken is not disclosed.

### Timeline

- **2026-09-28**: notices mailed.
- **2026-10-13**: a resident who received a misdirected notice contacted the Corporation; the error came to light.
- **2026-10-16**: the Housing Policy Headquarters and the Corporation announced it.

> Facts here rest on the Tokyo Metropolitan Government press release. The error is described only as quoting the building and unit number "from the wrong part of the list"; which column was mistaken is not given. Figures for mailings, misdirected items and names are the published values and have not been independently verified. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Individual contact**: the Corporation is contacting association heads and affected recipients individually to apologise and explain.
- **Prevention**: stronger checks by multiple staff members.

From mailing to discovery was 15 days; from discovery to announcement, 3. The signal came from the recipient side, not the sender.

## 6. Sources

- **Tokyo Metropolitan Government, Housing Policy Headquarters (primary, municipal release)**: "On the leak of personal information" (Japanese) (2026-10-16) — <https://www.metro.tokyo.lg.jp/information/press/2026/10/2026101605>

Only the parties' own release serves as primary here; no independent third-party verification or English-language outside reporting has been found, and this is a single source. Japanese media and blogs are not used as sources.

References: [The last layer left for cyber defense in the age of AI](/blog/detection-is-not-proof/). The pillar view is [Pillar 01](/pillars/#provenance).
