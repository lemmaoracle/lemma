---
brief_no: 151
title: "TOPPAN：手作業の送付で、損保ジャパンの契約者 177,426 名分のリストが別の保険会社向けの ZIP に紛れ込み、そのまま送られた(保険料控除証明書発行サービス)"
title_en: "TOPPAN: During a manual send, a list of 177,426 Sompo Japan policyholders slipped into another insurer's ZIP and went out (insurance-premium deduction certificate service)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: []
incident_date: 2026-09-01
published: 2026-10-14
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["065-hokkaido-hospital-hdd-disposal", "137-ssk-receipt-review-screen-display-proof", "149-revolut-italy-government-mailbox-disclosure-requests"]
status: published
version: "2.1"
og_lead_ja: "TOPPAN、損保ジャパン契約者 17.7 万名分のリストを別の保険会社へ誤送付"
og_lead_en: "TOPPAN sent 177,426 Sompo Japan policyholder records to another insurer"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "情報漏えい事例 · 人の操作ミス"
og_kicker_en: "DATA LEAK · HUMAN ERROR"
og_headline_ja: "別の保険会社向けの\nファイルに、契約者の\nリストが紛れ込んだ。\n<accent>177,426 名分</accent>"
og_headline_en: "A policyholder list slipped into a file for another insurer.\n<accent>177,426 people.</accent>"
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
  quote: "When only the operator's actions and eyes decide what goes to whom, a mismatch between contents and recipient shows up only after the send."
industries: ["finance"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Don't send until the contents are matched to the recipient"
  - slug: "audit-trail"
    item: "Record which files were sent and what they were matched against"
attack_method: "human-error"
impact: "177,000 policyholders' data sent to another insurer"
takeaway: "Nothing checked, before the send and apart from the operator's actions, that the contents matched the recipient."
self_check: "Can you match files split by client against their recipients before sending?"
countries: ["jp"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

## 1. Summary

In work where several insurers' ZIPs sit in the same folder, only the operator's actions and eyes decided which company's data went to which recipient. The contents of the ZIP were not re-checked before sending (per TOPPAN). The receiving insurer noticed the mix-up the same day, but the list had already left the company. <strong>When only the operator's actions and eyes decide what goes to whom, a mismatch between contents and recipient shows up only after the send.</strong>

## 2. What got through

- **What got through**: Sompo Japan's data, in a ZIP sent as another insurer's delivery. With several insurers' ZIPs in the same folder, a drag-and-drop slip put Sompo Japan's data into another insurer's ZIP, and it was sent as it was through the file transfer service (per TOPPAN).
- **What stopped it**: The receiving insurer queried the General Insurance Association of Japan about the mix-up at 17:15 the same day. That was after the send.
- **What reached the receiving side**: In general, a file transfer arrives as an operation sending the ZIP the operator chose to the recipient the operator chose. Whether the ZIP's contents belong to that recipient cannot be told from the act of sending.
- **Scope of disclosure**: The count may include the same policyholder more than once and may fall after review (per TOPPAN and Sompo Japan).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the mechanism that sends the file checks, before sending and apart from the operator's actions, that the ZIP's contents belong to the recipient company.

- **Who approves**: The company that owns the data. For each recipient, it registers which companies' data may be received, instead of leaving it to the operator's actions and eyes.
- **Where it is checked**: The mechanism that sends files. Each file records, when it is created, whose data it is. Just before sending, the mechanism checks automatically, file by file inside the ZIP, that the owning company matches the recipient, and stops any send that includes non-matching files or files of unknown owner.
- **What is recorded**: What was matched before the send, with the result and what was sent. It is kept apart from the operator's activity log, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the send and apart from the operator's actions, that the ZIP's contents belong to the recipient company, and keeping a record. Detection means noticing after the send, such as the receiving side spotting it. The dates below are when each company confirmed or disclosed a point.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check, before sending, that the contents belong to the recipient company</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>177,426 policyholder records<br>went to another insurer</span></div>
<div class="rx-zone det"><b>Detection · the receiver noticed</b>The receiving side spots the mix-up and queries the association</div>
<div class="rx-g g1"><div class="t">09-01</div><b>Mixed in during a manual send</b></div>
<div class="rx-g g2"><div class="t">09-01 17:15</div><b>Receiver queries the association</b></div>
<div class="rx-g g3"><div class="t">09-02</div><b>TOPPAN stops the service</b></div>
<div class="rx-g g4"><div class="t">09-29</div><b>Both companies disclose</b></div>
</div>
</figure>

Detection worked: the receiving insurer noticed the same day and queried the association. But it noticed after the send. A similar case, where no one other than the operator could catch the mismatch between labels and the source list before mailing, is [Tokyo Housing Supply Corporation's address labels](/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the mechanism that sends files.** It does not look for intrusions; it checks, just before sending and apart from the operator's actions, that the ZIP's contents belong to the recipient company.

### Industries and operations to watch

- **Industry · Finance & FinTech**: Insurers and others that handle large numbers of policyholders and outsource document production and mailing. At the contractor, several companies' data sits in front of the same operator.
- **Operation · Sending & delivery**: Manually sending files split by client. A wrong file name or location mixes in another company's data.

### Current controls vs Lemma

The route in this case is column 1 (a manual send). Column 2 is the systematised sending process TOPPAN is moving to as a preventive measure; how errors would show up there has not been disclosed.

| Control | Manual send | Systematised sending process |
| --- | --- | --- |
| Operator's check before sending | Not effective | Not relevant |
| A checker separate from the operator | Partial | Not relevant |
| Matching size and timestamps | Partial | Not relevant |
| Systematising the sending process | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

The operator's check did not hold: the ZIP's contents were not re-checked before sending (per TOPPAN). A separate checker gives more chances to catch an error but still relies on human eyes. Matching size and timestamps can catch a whole ZIP slipping in, but does not directly show the contents belong to that recipient. Systematising reduces manual work, but without matching contents to recipient the error just moves elsewhere. Lemma matches each file's owner to the recipient just before the send.

Note: Lemma's check works only when it is built into the mechanism that sends files and the data owner registers, for each recipient, which companies' data may be received. If the range registered for a recipient is itself wrong, a wrong send still goes through. Until a matching mechanism is in place, human checks such as a separate checker have to fill the gap. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about sending data per client

- Are files split by client handled by the same person in the same place?
- Before sending, are the contents matched to the client by means other than human eyes?
- If a contractor does such sending for you, do you know its checking procedure?

## 5. Facts and timeline

- **Service**: Operations for the insurance premium deduction certificate service, which 14 non-life insurers outsource to TOPPAN (per Sompo Japan).
- **What was mis-sent**: A list (CSV) of Sompo Japan policyholders who do not need a postcard certificate, sent to one other insurer.
- **Count and fields**: 177,426 people (may include the same policyholder more than once). Name in kana, policy number for deduction purposes, and a work ID. No kanji names, addresses, dates of birth, phone numbers, emails, card or bank details, or My Number.
- **Cause**: A manual operating slip and a gap in the checking procedure. With several insurers' ZIPs in the same folder, a drag and drop copied Sompo Japan's ZIP into another insurer's ZIP, and the contents were not re-checked before sending (per TOPPAN).
- **At the recipient**: TOPPAN says the data was promptly deleted at the recipient and no leak to third parties has been confirmed. Sompo Japan says it contacted the recipient and confirmed deletion, and no secondary leak or misuse has been confirmed.
- **Other mix-ups**: TOPPAN confirmed this was the only one in this delivery run.

### Timeline

- **2026-09-01**: The mis-send happens during a manual transmission. At 17:15 the receiving insurer queries the General Insurance Association of Japan about another insurer's data mixed in.
- **2026-09-02**: The association asks TOPPAN to investigate, and the mix-up is identified. TOPPAN stops the file transfer service.
- **2026-09-29**: TOPPAN and Sompo Japan disclose on the same day.

> Facts rest on TOPPAN's and Sompo Japan's disclosures (both primary). How it happened, the cause and the measures appear only in TOPPAN's. The count and fields match in both. Statements on deletion and leaks are kept in each company's own words. What has not been disclosed does not mean there were no controls.

### After disclosure

- **TOPPAN**: Will attach files only through "choose file", add a checker separate from the operator to review every step, and match attachment size and timestamps against the source data. As a lasting fix, it will systematise the sending process.
- **Sompo Japan**: Is notifying affected policyholders individually by registered email, and by letter where no email is registered. It will press TOPPAN to carry out the measures and strengthen oversight of contractors.

## 6. Sources

- **TOPPAN (Primary, company disclosure)**: Notice on data mis-sent in the insurance premium deduction certificate service it operates (2026-09-29, Japanese) — <https://www.holdings.toppan.com/ja/info/toppan_info20260929.pdf>
- **Sompo Japan (Primary, company disclosure)**: Notice on data mis-sent by a contractor in the insurance premium deduction certificate service (2026-09-29, Japanese) — <https://www.sompo-japan.co.jp/-/media/SJNK/files/news/2026/20260929_1.pdf?la=ja-JP>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
