---
brief_no: 134
title: "東京都住宅供給公社：Excel 一覧から作った宛名ラベルの列が誤り、都営住宅の自治会長 770 名の氏名が別の住民に届いた — 発送の前に、宛先と一覧の対応が確かめられなかった誤送付"
title_en: "Tokyo Metropolitan Housing Supply Corporation: A wrong column in an Excel-built label list sent the names of 770 public-housing residents' association heads to other residents — A misdirected mailing, with no check before dispatch that the labels matched the list"
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
industries: ["public-sector"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Do not dispatch until the labels are matched to the source list"
  - slug: "audit-trail"
    item: "Record the match result separately from the operator's actions"
attack_method: "human-error"
impact: "Names of 770 association heads reached other residents"
---

## 1. TL;DR

On 28 September 2026, the Tokyo Metropolitan Housing Supply Corporation mailed 1,997 copies of a notice about a change in how to apply for drain-pipe cleaning to the residents' association heads of Tokyo public housing complexes. In 846, the address was wrong, and 770 reached residents other than the intended recipients. What arrived was the names of 770 public-housing residents' association heads. The Corporation and the Tokyo Housing Policy Headquarters announced it on 16 October. It was not a cyberattack. When building address labels from an Excel list, staff took the building and unit numbers from the wrong part of the list and attached the labels without noticing.

Detection worked, but only through a resident's call. <strong>What did not work was a layer that checks, apart from the operator and directly before dispatch, that destination and list match.</strong> It surfaced 15 days after mailing.

## 2. What happened

- **Work**: mailing a notice to residents' association heads of Tokyo public housing. The Corporation, a policy partner organisation of the Tokyo Metropolitan Government, maintains the public housing under contract.
- **Content**: the notice "Change to the drain-pipe cleaning application method". Labels were wrong, so notices reached residents of other buildings and units.
- **Count**: 846 of 1,997 notices were misaddressed; 76 were returned and 770 reached someone other than the intended recipient.
- **Information involved**: the names of 770 residents' association heads. The release does not say addresses leaked.
- **Not addressed**: the release does not mention secondary leakage or misuse.

The chain was as follows.

1. Address labels were made from an Excel list of complex, address and name.
2. Building and unit numbers were taken from the wrong part of the list.
3. The error went unnoticed and the labels were attached.
4. The mailed notices reached residents other than the intended recipients.

The irreversible action was step 4, dispatch. It rested on labels built with a wrong column, and apart from the operator's own eyes nothing checked at dispatch whether the labels matched the source list.

## 3. Timeline — disclosure and response

- **28 September 2026 (Mon)**: notices mailed.
- **13 October (Tue)**: a resident who received a misdirected notice contacted the Corporation; the error came to light.
- **16 October**: the Housing Policy Headquarters and the Corporation announced it.

> Facts here rest on the Tokyo Metropolitan Government press release. The error is described only as quoting the building and unit number "from the wrong part of the list"; which column was mistaken is not given. Figures for mailings, misdirected items and names are the published values and have not been independently verified.

Response:

- **Individual contact**: the Corporation is contacting association heads and affected recipients individually to apologise and explain.
- **Prevention**: stronger checks by multiple staff members.

From mailing to discovery was 15 days; from discovery to announcement, 3. The signal came from the recipient side, not the sender.

## 4. Why it wasn't stopped

The failure is neither operator skill nor outside attack. Dispatch ran with no means of checking that the label content matched the source list.

That is the **gap between detection and proof**. Detection worked, but as a resident's call 15 days after mailing. What failed sits before that. Directly before dispatch, nothing checked, apart from the operator's eyes and memory, whether these labels matched the list.

The Corporation's prevention plan is stronger checking by multiple staff. More checkers help, but they do not leave a verifiable record that a check happened or what was compared with what. A human check remains the checker's memory and the fact of having checked.

The same structure appears in earlier Briefs. In [TOPPAN and Sompo Japan](/critical/briefs/151-toppan-sompo-japan-misdirected-zip/), the contents of a manually assembled ZIP were not rechecked before sending. In [the review-screen check at the payment fund](/critical/briefs/137-ssk-receipt-review-screen-display-proof/), the act of checking did not serve as evidence of execution. In [the Hokkaido hospital HDDs](/critical/briefs/065-hokkaido-hospital-hdd-disposal/), media left the building with the premise unverified. In each, no independent check sat directly before execution.

> "Checked" and "checkable" are different facts. The first lives in memory; the second is recorded before the action.

## 5. What proof would have changed

A single step could sit directly before dispatch: confirming that each label's destination corresponds to the matching row of the source list. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Proof that destination matches content**: attach to each label row provenance proof of which row of the source list it was built from, and make the match against the source list checkable directly before dispatch.
- **Pre-action authorisation**: register in advance the scope of a mailing (type of notice and range of recipients) and make dispatch containing out-of-scope destinations blockable before it runs.
- **Independent record**: keep the result of the check and which proof the dispatch relied on as a record separate from the operator's actions, so it can be audited later.

</ul>

This differs from after-the-fact contact and stronger staff checking. The detection layer and this layer are complementary, not substitutes: the former notices that an error happened, the latter lets a mailing that could be an error be checked before it runs.

Note: the proof shows only that a label was built from that row of the registered list and that the destination is within the registered scope. It passes when the source list itself is wrong or when the registered scope is wrong. Handling after receipt is outside the proof.

## 6. Sources

- **Tokyo Metropolitan Government, Housing Policy Headquarters (primary, municipal release)**: On the leak of personal information (2026-10-16) — <https://www.metro.tokyo.lg.jp/information/press/2026/10/2026101605>

Only the parties' own release serves as primary here; no independent third-party verification or English-language outside reporting has been found, and this is a single source. Japanese media and blogs are not used as sources.

References: why after-the-fact detection is not proof is covered in [the last layer left in AI-era cyber defense](/blog/detection-is-not-proof/). The pillar view is [regulatory attribute proof](/pillars/#attribute).
