---
brief_no: 151
title: "TOPPAN：手作業の送付で、損保ジャパンの契約者 177,426 名分のリストが別の保険会社向けの ZIP に紛れ込み、そのまま送られた(保険料控除証明書発行サービス) — 宛先と中身の対応を、送る前に確かめる層が無い"
title_en: "TOPPAN: During a manual send, a list of 177,426 Sompo Japan policyholders slipped into another insurer's ZIP and went out (insurance-premium deduction certificate service) — nothing checks that the contents match the recipient before the send"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2026-09-01
published: 2026-10-14
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["065-hokkaido-hospital-hdd-disposal", "137-ssk-receipt-review-screen-display-proof", "149-revolut-italy-government-mailbox-disclosure-requests"]
status: published
version: "2.0"
og_lead_ja: "TOPPAN、損保ジャパン契約者 17.7 万名分のリストを別の保険会社へ誤送付"
og_lead_en: "TOPPAN sent 177,426 Sompo Japan policyholder records to another insurer"
layout: "report"
og_kicker_ja: "情報漏えい事例 · 人の操作ミス"
og_kicker_en: "DATA LEAK · HUMAN ERROR"
og_headline_ja: "別の保険会社向けの\nファイルに、契約者の\nリストが紛れ込んだ。\n<accent>177,426 名分</accent>"
og_headline_en: "A policyholder list slipped into a file for another insurer.\n<accent>177,426 people.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "177,426"
    unit: "people"
    label: "Sompo Japan policyholders in the list sent to the wrong insurer (may include duplicates). Kana names, policy numbers and more"
    tone: "alert"
  - value: "17:15"
    label: "On the day of the mis-send (2026-09-01), when the receiving insurer queried the General Insurance Association of Japan"
  - value: "28"
    unit: "days"
    label: "From the mis-send to disclosure (09-29)"
glossary:
  - term: "Premium deduction certificate service"
    desc: "A shared service that issues non-life insurers' tax deduction certificates. TOPPAN runs it for 14 insurers."
  - term: "Drag and drop"
    desc: "Grabbing a file with the mouse and dropping it elsewhere. Drop it in the wrong place and the file ends up in an unintended folder or ZIP."
insight:
  slug: "contents-unchecked-before-send"
  label: "Contents not matched before sending"
  quote: "Only the operator's actions and eyes decided which company's data went to which recipient, and nothing matched contents against recipient before the send."
industries: ["finance"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Don't send until the contents are matched to the recipient"
  - slug: "audit-trail"
    item: "Record which files were sent and what they were matched against"
attack_method: "human-error"
impact: "177,000 policyholders' data sent to another insurer"
takeaway: "Nothing checked, before the send, that the contents matched the recipient."
self_check: "Can you match files split by client against their recipients before sending?"
---

> **Revision (v2.0 / 2026-10-21)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". TOPPAN's and Sompo Japan's disclosures were re-read; the facts are unchanged.

## 1. TL;DR

On September 1, 2026, while running the insurance premium deduction certificate service it operates for non-life insurers, TOPPAN sent a list of 177,426 Sompo Japan policyholders to another insurer by mistake. With ZIP files for several insurers in the same folder, a drag-and-drop slip put Sompo Japan's file inside another insurer's ZIP. TOPPAN confirmed it was not an outside attack.

The ZIP's contents were not re-checked before sending. Only the operator's actions and eyes decided which company's data went to which recipient.

The receiving insurer noticed the same day and queried the General Insurance Association of Japan. By then, though, the list had already left the company. What failed was the layer that checks, separately from the operator's actions and before the send, that the contents match the recipient.

## 2. What happened

- **Service**: Operations for the insurance premium deduction certificate service, which 14 non-life insurers outsource to TOPPAN (per Sompo Japan).
- **What was mis-sent**: A list (CSV) of Sompo Japan policyholders who do not need a postcard certificate, sent to one other insurer.
- **Count and fields**: 177,426 people (may include the same policyholder more than once). Name in kana, policy number for deduction purposes, and a work ID. No kanji names, addresses, dates of birth, phone numbers, emails, card or bank details, or My Number.
- **Cause**: A manual operating slip and a gap in the checking procedure. With several insurers' ZIPs in the same folder, a drag and drop copied Sompo Japan's ZIP into another insurer's ZIP, and the contents were not re-checked before sending (per TOPPAN).
- **At the recipient**: TOPPAN says the data was promptly deleted at the recipient and no leak to third parties has been confirmed. Sompo Japan says it contacted the recipient and confirmed deletion, and no secondary leak or misuse has been confirmed.
- **Other mix-ups**: TOPPAN confirmed this was the only one in this delivery run.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ③. Checking, separately from the operator's actions, that the ZIP's contents belonged to that recipient would have stopped the send.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">TOPPAN</div><div class="no">1</div><b>Packs each insurer's list into a ZIP and puts them in one folder</b><p>Several insurers' files.</p></div>
<div class="rx-step crit"><div class="who">Operator</div><div class="no">2</div><b>A drag-and-drop slip puts Sompo Japan's file in another insurer's ZIP</b><p>2026-09-01.</p></div>
<div class="rx-step crit"><div class="who">Operator</div><div class="no">3</div><b>Sends it by file transfer without re-checking the contents</b><p>Delivered as the other insurer's.</p></div>
<div class="rx-step"><div class="who">Receiving insurer</div><div class="no">4</div><b>Notices the mix-up and queries the industry association</b><p>Same day, 17:15.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-09-01**: The mis-send happens during a manual transmission. At 17:15 the receiving insurer queries the General Insurance Association of Japan about another insurer's data mixed in.
- **2026-09-02**: The association asks TOPPAN to investigate, and the mix-up is identified. TOPPAN stops the file transfer service.
- **2026-09-29**: TOPPAN and Sompo Japan disclose on the same day.

> Facts rest on TOPPAN's and Sompo Japan's disclosures (both primary). How it happened, the cause and the measures appear only in TOPPAN's. The count and fields match in both. Statements on deletion and leaks are kept in each company's own words.

### After disclosure

- **TOPPAN**: Will attach files only through "choose file", add a checker separate from the operator to review every step, and match attachment size and timestamps against the source data. As a lasting fix, it will systematise the sending process.
- **Sompo Japan**: Is notifying affected policyholders individually by registered email, and by letter where no email is registered. It will press TOPPAN to carry out the measures and strengthen oversight of contractors.

## 4. Why it wasn't stopped

This case was not an outside attack, nor only one operator's carelessness. Only the operator's actions and eyes decided which company's data went to which recipient, and nothing matched contents against recipient before the send.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof works before sending; detection works after the recipient notices. Once sent, the data has left your hands.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before sending, match the contents to the recipient</div>
<div class="rx-zone gapz"><b>The gap</b><span>177,426 records<br>already outside</span></div>
<div class="rx-zone det"><b>Detection layer · noticed by recipient</b>The recipient spots the mix-up and asks</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Mixed into a ZIP</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Sent unchecked</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Recipient notices</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Sending stopped</b></div>
</div>
</figure>

Detection worked: the receiving insurer noticed the same day and queried the association. But it noticed after the send, and although "the operator sent this ZIP to this recipient" and "this ZIP's contents belong to this recipient" are separate facts, the first alone let the send through. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Tokyo Metropolitan Housing Supply Corporation's address labels](/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/) (no one other than the person who made them caught that the labels no longer matched the source list before shipping).

## 5. How to counter this

**Before sending, match the contents to the recipient, separately from the operator's actions.** Adding checkers still relies on human eyes. Record "whose data is this" for each file when it is created, match it automatically against the recipient just before sending, and don't send what doesn't match.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Insurers and others that handle large numbers of policyholders and outsource document production and mailing. At the contractor, several companies' data sits in front of the same operator.
- **Operation · Sending & delivery**: Manually sending files split by client. A wrong file name or location mixes in another company's data.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Operator's check before sending | Ineffective | The ZIP's contents were not re-checked before sending (per TOPPAN). |
| A checker separate from the operator | Partial | More chances to catch errors, but still relies on human eyes. |
| Matching size and timestamps | Partial | It can catch a whole ZIP slipping in, but does not directly show the contents belong to that recipient. |
| Systematising the sending process | Partial | Less manual work, but without matching contents to recipient, the error just moves elsewhere. |

### What is needed

1. **Record whose data each file is when it is created.** Make the owning company identifiable down to each file inside a ZIP.
2. **Match contents to recipient automatically just before sending.** Register which companies' data each recipient may receive, and stop sends that include non-matching files or files of unknown owner.
3. **Record what was matched before sending.** Keep the match results and what was sent, separately from the operator's activity log, in a form that can later be shown to a third party: in other words, as proof.

### Checklist

Three things to confirm in your organisation about sending data per client

- Are files split by client handled by the same person in the same place?
- Before sending, are the contents matched to the client by means other than human eyes?
- If a contractor does such sending for you, do you know its checking procedure?

Note: if the range registered for a recipient is itself wrong, a wrong send still goes through. Until a matching mechanism is in place, human checks such as a separate checker have to fill the gap.

## 6. Sources

- **TOPPAN (Primary, company disclosure)**: Notice on data mis-sent in the insurance premium deduction certificate service it operates (2026-09-29, Japanese) — <https://www.holdings.toppan.com/ja/info/toppan_info20260929.pdf>
- **Sompo Japan (Primary, company disclosure)**: Notice on data mis-sent by a contractor in the insurance premium deduction certificate service (2026-09-29, Japanese) — <https://www.sompo-japan.co.jp/-/media/SJNK/files/news/2026/20260929_1.pdf?la=ja-JP>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
