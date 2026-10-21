---
brief_no: 134
title: "東京都住宅供給公社：Excel 一覧から宛名ラベルを作る際に住棟・号室を誤った部分から取り、都営住宅の自治会長 770 名の氏名が別の住民に届いた(東京都発表) — 宛先と一覧の対応を、発送の前に確かめる層が無い"
title_en: "Tokyo Metropolitan Housing Supply Corporation: Address labels built from the wrong part of an Excel list sent the names of 770 public-housing residents' association heads to other residents (Tokyo Metropolitan Government announcement) — nothing checks, before dispatch, that the labels match the list"
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
og_lead_ja: "東京都住宅供給公社 誤送付 770 名：発送の前に宛先と一覧の対応を確かめる層が無かった"
og_lead_en: "Tokyo Metropolitan Housing Supply Corporation, 770 names misdirected: no check that labels matched the list before dispatch"
layout: "report"
og_kicker_ja: "人手の事故事例 · 誤送付"
og_kicker_en: "HUMAN ERROR · MISDIRECTED MAIL"
og_headline_ja: "宛名ラベルの住棟・号室が、\n一覧の誤った部分から取られた。\n<accent>770 名の氏名が別の住民に</accent>"
og_headline_en: "Address labels took building and unit numbers from the wrong part of the list.\n<accent>770 names reached other residents.</accent>"
summary_labels: ["What happened", "Why no one noticed", "The missing layer"]
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
  quote: "The address labels went all the way to dispatch without ever being matched to the source list."
industries: ["public-sector"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Do not dispatch until the labels are matched to the source list"
  - slug: "audit-trail"
    item: "Record the match result separately from the operator's actions"
attack_method: "human-error"
impact: "Names of 770 association heads reached other residents"
takeaway: "Nothing checked, apart from the operator and before dispatch, that the labels matched the source list."
self_check: "If address labels no longer matched the source list, would you catch it before shipping without relying on someone's eyes?"
---

## 1. TL;DR

On 28 September 2026, the Tokyo Metropolitan Housing Supply Corporation mailed 1,997 copies of a notice about a change in how to apply for drain-pipe cleaning to the residents' association heads of Tokyo public housing complexes. In 846, the address was wrong, and 770 reached residents other than the intended recipients. What arrived was the names of 770 public-housing residents' association heads. The Corporation and the Tokyo Housing Policy Headquarters announced it on 16 October.

It was not a cyberattack. When building address labels from an Excel list, staff took the building and unit numbers from the wrong part of the list and attached the labels without noticing. Each label still looked like a proper address; only matching it against the source list would show the error. It was a resident, not the Corporation, who noticed, 15 days after mailing.

What did not work was a layer that checks, apart from the operator and directly before dispatch, that destination and list match.

## 2. What happened

- **Work**: mailing a notice to residents' association heads of Tokyo public housing. The Corporation, a policy partner organisation of the Tokyo Metropolitan Government, maintains the public housing under contract.
- **Content**: the notice "Change to the drain-pipe cleaning application method". Labels were wrong, so notices reached residents of other buildings and units.
- **Count**: 846 of 1,997 notices were misaddressed; 76 were returned and 770 reached someone other than the intended recipient.
- **Information involved**: the names of 770 residents' association heads. The release does not say addresses leaked.
- **The error**: when building address labels from an Excel list, the building and unit numbers were quoted from the wrong part of the list. Which column was mistaken is not disclosed.
- **Not addressed**: the release does not mention secondary leakage or misuse.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of the misdirection, as far as disclosed</span></div>
<p class="rx-ex-cap">The irreversible step was ④, dispatch. The announcement does not say whether any step between ③ and ④ checked the labels against the source list.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Corporation</div><div class="no">1</div><b>Builds address labels from an Excel list</b><p>The list holds complex, address and name.</p></div>
<div class="rx-step"><div class="who">Corporation</div><div class="no">2</div><b>Quotes building and unit numbers from the wrong part</b><p>Which column was mistaken is not disclosed.</p></div>
<div class="rx-step"><div class="who">Corporation</div><div class="no">3</div><b>Attaches the labels without noticing</b><p>Each label looks like a proper address.</p></div>
<div class="rx-step crit"><div class="who">Corporation</div><div class="no">4</div><b>Mails the notices</b><p>846 misaddressed; 770 reach other residents.</p></div>
</div>
</figure>

Dispatch rested on labels built from the wrong part of the list. **The problem is that those labels went through to dispatch at step 4 without being matched to the source list.**

## 3. Timeline — disclosure and response

- **2026-09-28**: notices mailed.
- **2026-10-13**: a resident who received a misdirected notice contacted the Corporation; the error came to light.
- **2026-10-16**: the Housing Policy Headquarters and the Corporation announced it.

> Facts here rest on the Tokyo Metropolitan Government press release. The error is described only as quoting the building and unit number "from the wrong part of the list"; which column was mistaken is not given. Figures for mailings, misdirected items and names are the published values and have not been independently verified.

### After disclosure

- **Individual contact**: the Corporation is contacting association heads and affected recipients individually to apologise and explain.
- **Prevention**: stronger checks by multiple staff members.

From mailing to discovery was 15 days; from discovery to announcement, 3. The signal came from the recipient side, not the sender.

## 4. Why it wasn't stopped

The failure is neither operator skill nor outside attack. Dispatch ran with no means of checking that the label content matched the source list.

That is the **gap between detection and proof**. It was a resident, not the Corporation, who noticed, calling 15 days after mailing. What failed sits before that. As far as the announcement shows, nothing directly before dispatch checked, apart from the operator's eyes and memory, whether these labels matched the list.

The Corporation's prevention plan is stronger checking by multiple staff. More checkers help, but they do not leave a verifiable record that a check happened or what was compared with what. A human check remains the checker's memory and the fact of having checked.

The same structure appears in earlier Briefs. In [TOPPAN and Sompo Japan](/critical/briefs/151-toppan-sompo-japan-misdirected-zip/), the contents of a manually assembled ZIP were not rechecked before sending. In [the review-screen check at the payment fund](/critical/briefs/137-ssk-receipt-review-screen-display-proof/), the act of checking did not serve as evidence of execution. In [the Hokkaido hospital HDDs](/critical/briefs/065-hokkaido-hospital-hdd-disposal/), media left the building with the premise unverified. In each, no independent check sat directly before execution.

> "Checked" and "checkable" are different facts. The first lives in memory; the second is recorded before the action.

## 5. How to counter this

**Operator mistakes cannot be eliminated, but a wrong label can be stopped before dispatch.** Keep a record of which row of the source list each label was built from, and just before dispatch match the labels against the list by a means other than the operator's eyes. Do not send what does not match. When label-making or dispatch is handed to a system or an AI agent, put the same match in front of dispatch.

### Industries and operations to watch

- **Industry · Government & public sector**: Municipalities and affiliated bodies that mail notices to residents or associations in bulk from a roster or list. Notices carry names, roles and other details meant only for the addressee.
- **Operation · Sending & delivery**: Building addresses from a list, then enclosing, labelling and mailing. An address error does not show until the item has arrived.

The same hole exists wherever mail is produced from a roster: mail-merge addresses, labels built from a spreadsheet, dispatch data prepared by a contractor. In each, shifting one reference in the list shifts every row, and the result still looks plausible to the person who made it.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Visual checks by multiple staff (the Corporation's prevention plan) | Partial | More chances to notice. But what was compared with what is not recorded, and plausible-looking addresses can still be missed. |
| Spot checks | Partial | Easy to catch when every row shifted the same way. When only some rows shifted, they pass unless they fall into the sample. |
| Personal-data handling training | Partial | Raises care. Reference mix-ups happen even when people are careful. |
| Email misdelivery-prevention tools | Not relevant | They check email recipients and have nothing to do with paper mail. |

### What is needed

1. **Build addresses tied to rows of the source list.** Record, for each label, which row of the list it came from. Reduce manual choice of which column to reference, and make every label traceable back to its row.
2. **Before dispatch, match every item by a means other than the operator.** Mechanically match each label's destination to its row in the source list, and confirm no destination falls outside the mailing's scope (which notice goes to which recipients). Do not dispatch until the match is done.
3. **Record the match separately from the operator's actions.** Keep when, against which list, and which labels were matched and let through, in a form you can later show a third party. Hold what does not match, and record why.

### Checklist

Three things to confirm for work that produces mail from a roster or list

- Can each row of the address labels or dispatch data be traced back to the row of the source list it was built from?
- Before dispatch, does someone or something other than the person who made the labels match every address against the source list? If they do not match, can dispatch be stopped?
- Is the fact of the match, and what was compared with what, kept as a record rather than in the checker's memory?

Note: this still fails if the source list itself is wrong, or if items are mixed up at the enclosing or labelling stage after the match. Holding dispatch until every item is matched also delays mailings.

## 6. Sources

- **Tokyo Metropolitan Government, Housing Policy Headquarters (primary, municipal release)**: "On the leak of personal information" (Japanese) (2026-10-16) — <https://www.metro.tokyo.lg.jp/information/press/2026/10/2026101605>

Only the parties' own release serves as primary here; no independent third-party verification or English-language outside reporting has been found, and this is a single source. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/). The pillar view is [Pillar 01 — provenance proof](/pillars/#provenance).
