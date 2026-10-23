---
brief_no: 162
title: "はてな：警察を名乗る詐欺グループに経理部長の PC を遠隔操作され、社内で承認された資金移動を経て、会社の資金が外部の口座へ送られた(同社の開示・特別調査委員会) — 送金と資金移動を、理由の裏付けと照合してから実行する層が無い"
title_en: "Hatena: Scammers posing as police took remote control of the head of accounting's PC, and company funds moved through internally approved transfers to outside accounts (company disclosure, special investigation committee) — Nothing checks transfers and fund moves against a documented reason before executing them"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-04-20
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "はてな、警察を名乗る詐欺で経理部長の PC を遠隔操作され約 11 億 8,000 万円が流出"
og_lead_en: "Hatena: scammers posing as police remote-controlled a finance PC, and ¥1.18 billion flowed out"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 警察かたり詐欺"
og_kicker_en: "CYBERATTACK · POLICE IMPERSONATION"
og_headline_ja: "警察を名乗る電話から、\n経理の PC が遠隔操作された。\n<accent>約 11 億 8,000 万円が外部の口座へ</accent>"
og_headline_en: "A call from fake police\nput a finance PC under remote control.\n<accent>¥1.18 billion went out.</accent>"
summary_labels: ["What happened", "Why it went through", "The missing layer"]
key_figures:
  - value: "¥1.18B"
    label: "Sent over two days from the payment account to accounts named by the scammers (¥1,179.81 million; special investigation committee)"
    tone: "alert"
  - value: "¥940M"
    label: "Moved into the payment account in seven internal fund moves. Only the first ¥300M came with a stated reason and the director's approval (special investigation committee)"
  - value: "~23 hours"
    label: "From the first fraudulent transfer (April 20, 11:41) to a transfer failing because the bank had halted withdrawals (April 21, 10:53; special investigation committee)"
glossary:
  - term: "Remote desktop"
    desc: "Software for operating a PC over the internet from elsewhere. Once installed, the other party can see the screen and control the PC."
  - term: "Fund move"
    desc: "Moving money between a company's own accounts. Hatena regularly moved funds from its main account to an account used for payroll and other payments."
  - term: "Special investigation committee"
    desc: "An investigation panel of outside lawyers and others. Hatena's followed the Japan Federation of Bar Associations' guidelines for third-party committees."
insight:
  slug: "fund-move-approved-on-chat-text"
  label: "Fund moves approved on chat text alone"
  quote: "The first fund move was approved as payroll preparation; the rest followed without a stated reason, still passing through people who created, checked and approved them. A checker noticed something odd and asked, but no rule required a documented reason, and the process moved on."
industries: ["media"]
operations: ["approval", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "Check transfers and fund moves against a documented reason, by a means separate from the requester"
  - slug: "hold-unverified"
    item: "Do not execute transfers or fund moves that cannot be matched to a documented reason"
  - slug: "audit-trail"
    item: "Record which request was executed, and what it was checked against"
attack_method: "impersonation"
impact: "The head of accounting's PC was remote-controlled, and about ¥1.18 billion went to outside accounts (booked as an extraordinary loss)"
takeaway: "Scammers posing as police remote-controlled the head of accounting's PC, and funds left through internally approved fund moves. Nothing checked transfers and fund moves against a documented reason before executing them."
self_check: "Do you check transfers and internal fund moves against a documented reason before executing them?"
countries: ["jp"]
---

## 1. TL;DR

On April 20, 2026, the head of accounting at Hatena, listed on the TSE Growth market, was persuaded by scammers posing as police to install remote-desktop software on a work PC as "cooperation with an investigation." The scammers used it to send about ¥1.18 billion to outside accounts over two days (company disclosure, special investigation committee report).

At the bank used for payments, the head of accounting's online-banking login alone could create and approve transfers, with no limit. Internal fund moves refilled it: the director approved the first ¥300 million as "payroll preparation," and the rest followed without a stated reason, ¥940 million in all.

The bank queried a director on the first evening, but the query was read against the approved fund move. A restriction the bank placed that night was lifted by a call the head of accounting made on the scammers' instructions, and withdrawals were halted only the next morning. What failed was the layer that checks transfers and fund moves against a documented reason before executing them.

## 2. What happened

- **Party**: Hatena, which runs blogging and other internet services and a manga viewer for publishers. Listed on the TSE Growth market.
- **What happened**: On the morning of April 20, scammers posing as police called the head of accounting's personal phone, said the head of accounting was a suspect in a money-laundering case, and forbade telling family members. On a video call they showed what they said were police and prosecutor IDs, said the president and the director in charge were also under investigation, and framed every later instruction as "cooperating with the investigation."
- **Remote control**: At 10:39 the head of accounting installed and ran remote-desktop software on the work PC as instructed; from then the scammers operated the PC directly. Its launch was logged internally but not detected. Nothing restricted unapproved applications.
- **Transfers**: The scammers created transfers in the payment account and called the head of accounting in to complete the two-factor step at approval, with the explanation that the money was going to a frozen account and would come back. Transfers ran from ¥99.99 million at 11:41 until 10:22 the next day.
- **Loss**: ¥1,179.81 million went out; ¥940 million moved between the company's own accounts. Hatena booked ¥1,221 million in extraordinary losses for FY7/2026, including investigation costs.
- **The checker's question**: At 13:34, the accounting staff member checking fund moves noticed falling balances and an unfamiliar payee and asked about them. The head of accounting replied "I'll explain later," and the fund move went ahead. No rule required a documented reason for fund moves.
- **Data**: No sign of personal or customer data being taken. The report says it cannot rule out that the scammers saw information on screen during remote control.

Per the special investigation committee's report, the attack ran as follows.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain, as far as disclosed</span></div>
<p class="rx-ex-cap">The stopping points are ③ and ④. Had transfers and fund moves been checked against a documented reason before executing, money would not leave even with the PC under remote control. The bank's query and restriction in ⑤ came early, but the query was read against the approved explanation and the restriction was lifted.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Scammers</div><div class="no">1</div><b>Call posing as police and demand "cooperation"</b><p>April 20, 8:02, to a personal phone.</p></div>
<div class="rx-step crit"><div class="who">Head of accounting</div><div class="no">2</div><b>Installs remote-desktop software on the work PC</b><p>10:39. The scammers operate the PC from then on.</p></div>
<div class="rx-step crit"><div class="who">Scammers</div><div class="no">3</div><b>Send transfers out of the payment account</b><p>One account could create and approve, with no limit.</p></div>
<div class="rx-step crit"><div class="who">Company</div><div class="no">4</div><b>Fund moves created, checked and approved</b><p>The director approved the first ¥300M as "payroll preparation." Six more followed without a stated reason: ¥940M in all.</p></div>
<div class="rx-step good"><div class="who">Bank</div><div class="no">5</div><b>Queries suspicious transfers; halts withdrawals the next day</b><p>Query on the 20th after 16:00. The night restriction was lifted by a call at 19:52. A transfer at 10:53 on the 21st failed on the halt.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-04-20**: 8:02, the scammers call the head of accounting. 10:39, remote desktop installed. 11:41, first fraudulent transfer. 13:13, the director in charge approves a fund move in internal chat. After 16:00, the bank tells the director of three suspicious ¥99.99 million transfers. Fund moves and transfers continue into the night; at 19:52, on the scammers' instructions, the head of accounting calls the bank and an account restriction is lifted.
- **2026-04-21**: Fund moves and transfers continue after 10:00. 10:53, a transfer fails because the bank has halted withdrawals. 11:08, the head of accounting realizes it is fraud and calls the police.
- **2026-04-24**: Hatena discloses the outflow (up to about ¥1.1 billion).
- **2026-05-07**: Discloses the special investigation committee.
- **2026-06-12**: Books ¥1,179 million as an extraordinary loss and revises its full-year forecast to a net loss.
- **2026-07-24**: Publishes the committee's report (disclosure version).
- **2026-07-31**: Discloses prevention measures.

> The facts rely on Hatena's disclosures and the special investigation committee's report (disclosure version; both primary). The report reconstructs events from interviews with the head of accounting and from PC, call and chat records.

### After disclosure

- **Hatena**: Clarified rules for moving funds between its own accounts, requiring multi-step workflow approval and supporting documents in advance. In online banking, request and approval rights will not sit with the same person, approval environments are tightly limited, per-account limits are kept minimal, and automatic notifications are used. Remote-desktop tools are restricted, and training on police-impersonation and similar scams continues. Executives are returning part of their pay.
- **Causes cited by the committee**: Beyond the head of accounting putting "cooperation" ahead of company rules: an online-banking setting that let one person create and approve transfers (contrary to the company's accounting rules), no approval limit, no review of account rights, no transaction notifications, no supporting documents needed for fund moves, and accounting reliant on a few individuals. The committee says a setting that kept one person from completing a transfer alone at the payment bank would have prevented the loss.

## 4. Why it wasn't stopped

The failure was not just a matter of spotting a fake call. **Both transfers and internal fund moves could be executed on the wording of a request alone, with no layer checking a documented reason.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before a transfer or fund move is executed and by a means separate from the requester, that the request has a documented reason that can be matched, and keeping a record. Detection means noticing unusual account activity.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check transfers and fund moves against a documented reason</div>
<div class="rx-zone gapz"><b>Gap</b><span>¥1.18B to<br>outside accounts</span></div>
<div class="rx-zone det"><b>Detection layer · partly worked</b>The bank queries suspicious transfers and halts withdrawals</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>04-20 remote control</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Transfers and fund moves</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>04-20 bank query</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>04-21 withdrawals halted</b></div>
</div>
</figure>

The bank's query and restriction came early, yet about 23 hours passed before withdrawals stopped. When a checker notices something odd but no rule requires a documented reason, "I'll explain later" moves the process on, and however many approval steps there are, a disguised request goes through. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [the Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/) (a finance employee made 15 transfers on a faked CFO's instruction).

## 5. How to counter this

**Execute transfers and internal fund moves only when they match a documented reason.** Check by a means separate from the requester, against the supporting record (an invoice, a payroll schedule), not the wording of the request. Then even if staff are deceived or a PC is taken over, money without a documented reason does not move. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Media and internet services**: Mid-sized listed companies with small accounting teams, where authority concentrates in the accounting lead.
- **Operation · Approval**: Approval of fund moves between accounts and transfers requested in internal chat.
- **Operation · Account administration**: Rights and limits for each online-banking account, and reviewing them.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Split of create, check, approve | Partial | Fund moves passed through creation, checking and approval. A checker noticed and asked, but no rule required a documented reason. |
| Online-banking two-factor authentication | Partial | The deceived employee completed it. The real person's action passes authentication. |
| Internal log monitoring | Partial | The remote-desktop launch was logged but not detected. |
| Bank fraud detection | Partial | Queried on day one, restricted that night, halted the next day. The query was read against the approved explanation, and the restriction was lifted. |

### What is needed

1. **Require a documented reason that can be matched for every transfer and fund move.** Match it against a record separate from the request, such as an invoice or a payment schedule.
2. **Make unmatched transfers and fund moves impossible to execute.** Remove settings that let one account create and approve, and set limits.
3. **Record which request was executed, and what it was checked against.** Answer bank inquiries from that record and the account statement. Keep the record as proof.

### Checklist

Three things to confirm about transfers and fund moves

- Can one online-banking account both create and approve a transfer?
- Do internal fund moves between your own accounts require a documented reason?
- When the bank queries activity, is there a step to check the account statement directly?

Note: if the supporting documents themselves are forged, this check can be passed. And it guards the exit for funds; remote control of a work PC still has to be prevented separately, for example by restricting applications.

## 6. Sources

- **Hatena (Primary, disclosure)**: "Notice of the occurrence of a fund outflow incident" (in Japanese) (2026-04-24) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2794871/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of establishment of a special investigation committee" (in Japanese) (2026-05-07) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2799999/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of extraordinary loss, deferred tax assets and revised full-year forecast" (in Japanese) (2026-06-12) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2834801/00.pdf>
- **Hatena (Primary, disclosure with the special investigation committee's report, disclosure version)**: "Notice of publication of the investigation report and partial voluntary return of executive pay" (in Japanese) (2026-07-24) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2856001/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of prevention measures" (in Japanese) (2026-07-31) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2859090/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of differences between forecast and results for FY7/2026, extraordinary loss and reversal of deferred tax assets" (in Japanese) (2026-09-11) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2883672/00.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
