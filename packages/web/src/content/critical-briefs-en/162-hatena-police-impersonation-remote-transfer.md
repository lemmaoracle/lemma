---
brief_no: 162
title: "Hatena: A call from fake police led to remote control of the head of accounting's PC, and funds left through internal fund moves (company disclosure, special investigation committee)"
title_en: "Hatena: A call from fake police led to remote control of the head of accounting's PC, and funds left through internal fund moves (company disclosure, special investigation committee)"
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
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 警察かたり詐欺"
og_kicker_en: "CYBERATTACK · POLICE IMPERSONATION"
og_headline_ja: "警察を名乗る電話から、\n経理の PC が遠隔操作された。\n<accent>約 11 億 8,000 万円が外部の口座へ</accent>"
og_headline_en: "A call from fake police\nput a finance PC under remote control.\n<accent>¥1.18 billion went out.</accent>"
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
  quote: "A transfer or fund move that can be executed on the text of a request cannot stop a request that has been faked, however many people approve it."
industries: ["media"]
operations: ["approval", "account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Do not execute transfers or fund moves that cannot be matched to a documented reason"
  - slug: "audit-trail"
    item: "Record which request was executed, and what it was checked against"
attack_method: "impersonation"
impact: "The head of accounting's PC was remote-controlled, and about ¥1.18 billion went to outside accounts (booked as an extraordinary loss)"
takeaway: "Scammers posing as police remote-controlled the head of accounting's PC, and funds left through internally approved fund moves. Execute transfers and fund moves only after matching them against a documented reason."
self_check: "Do you check transfers and internal fund moves against a documented reason before executing them?"
countries: ["jp"]
---

## 1. Summary

The head of accounting received a call from scammers posing as police on a personal phone, and was told to install remote-desktop software on the work PC as "cooperation with the investigation." The payment account allowed one account to create and approve a transfer from start to finish. On the company's own fund moves, the first was approved as payroll preparation and the rest followed without a stated reason, still passing through people who created, checked and approved them. The bank queried suspicious transfers on the first day, but the query was read against the approved explanation, and the restriction placed that night was lifted by a phone call. <strong>A transfer or fund move that can be executed on the text of a request cannot stop a request that has been faked, however many people approve it.</strong>

## 2. What got through

- **What got through**: Transfers from the payment account to outside accounts, and fund moves between the company's own accounts, made while the work PC was under remote control. One account created and approved the transfers from start to finish, and at the two-factor step the head of accounting was called in to operate it (special investigation committee).
- **What was noticed**: At 13:34, the accounting staff member checking fund moves noticed falling balances and an unfamiliar payee and asked about them. The head of accounting replied "I'll explain later," and the fund move went ahead. No rule required a documented reason for fund moves. On the first evening, the bank also queried the director in charge about suspicious transfers.
- **What reached the receiving side**: In general, a fund move that has passed through approval, or a transfer that has passed the real person's authentication, arrives as a legitimate request. Whether the request has been faked cannot be told from its text and its approval path.
- **Not confirmed**: No sign of personal or customer data being taken. The report says it cannot rule out that the scammers saw information on screen during remote control.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever executes a transfer or fund move checks, before executing it, that the request has a documented reason separate from the text of the request (an invoice, a payroll schedule), by a path other than the person who made the request.

- **Who approves**: A person other than the requester, looking at the supporting document rather than the text of the request. One account cannot both create and approve.
- **Where it is checked**: One point just before transfers and fund moves are executed. Online-banking approval and the internal fund-move workflow both pass the same check. A request that does not match its support is not executed, and limits are set.
- **What is recorded**: Which request was executed and what it was checked against. When the bank queries activity, answer from that record and the account statement.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching a transfer or fund move against a documented reason before it is executed, and keeping a record. Detection means noticing unusual deposits and withdrawals. The dates below follow the special investigation committee's report, not necessarily the day Hatena confirmed or disclosed each point.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Match transfers and fund moves against a documented reason before executing</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About ¥1.18 billion went to outside accounts<br>¥940 million in internal fund moves</span></div>
<div class="rx-zone det"><b>Detection · partly worked</b>The bank queries suspicious transfers and halts withdrawals the next day</div>
<div class="rx-g g1"><div class="t">04-20</div><b>PC under remote control; transfers begin</b></div>
<div class="rx-g g2"><div class="t">04-20</div><b>The bank queries the director in charge</b></div>
<div class="rx-g g3"><div class="t">04-20 night</div><b>Restriction lifted by a phone call</b></div>
<div class="rx-g g4"><div class="t">04-21</div><b>Withdrawals halted; a transfer fails</b></div>
</div>
</figure>

The bank's query and restriction came early, but it took about 23 hours for withdrawals to stop. When a checker notices something and asks, a process with no rule requiring support moves on with "I'll explain later." A similar case where a faked request led to repeated transfers is the [Hong Kong deepfake-meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/) (a finance employee made 15 transfers on the instructions of a faked CFO).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that executes transfers and fund moves.** It does not look for intrusions; it checks, before execution and by a path other than the requester's, that the request has a documented reason.

### Industries and operations to watch

- **Industry · Media and internet services**: Mid-sized listed companies with small accounting teams, where authority concentrates in the accounting lead.
- **Operation · Approval**: Approval of fund moves between accounts and transfers requested in internal chat.
- **Operation · Account administration**: Rights and limits for each online-banking account, and reviewing them.

### Current controls vs Lemma

The routes in this case are column 1 (transfers to outside accounts) and column 2 (fund moves between the company's own accounts). Column 3 is the remote control of the work PC, which was the way in.

| Control | Transfers to outside accounts | Fund moves between own accounts | Remote control of the work PC |
| --- | --- | --- | --- |
| Split of create, check, approve | Not effective | Partial | Not relevant |
| Online-banking two-factor authentication | Partial | Not relevant | Not relevant |
| Internal log monitoring | Not relevant | Not relevant | Partial |
| Bank fraud detection | Partial | Not relevant | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

One account could create and approve the transfers from start to finish, so the split did not apply. Fund moves passed through creation, checking and approval, but no rule required support when the checker asked. Two-factor authentication passed because the deceived employee operated it. Log monitoring recorded the remote-desktop launch but did not detect it. The bank queried on day one, restricted that night and halted withdrawals the next day, but its query was read against the approved explanation and the restriction was lifted. Lemma checks against the supporting document, not the text of the request, before execution.

Note: Lemma's check works only when it is built into the system that executes transfers and fund moves and the supporting documents are managed apart from the requester. If the supporting documents themselves are forged, this check can be passed. And it guards the exit for funds; remote control of a work PC still has to be prevented separately, for example by restricting applications. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about transfers and fund moves

- Can one online-banking account both create and approve a transfer?
- Do internal fund moves between your own accounts require a documented reason?
- When the bank queries activity, is there a step to check the account statement directly?

## 5. Facts and timeline

- **Party**: Hatena, which runs blogging and other internet services and a manga viewer for publishers. Listed on the TSE Growth market.
- **What happened**: On the morning of April 20, scammers posing as police called the head of accounting's personal phone, said the head of accounting was a suspect in a money-laundering case, and forbade telling family members. On a video call they showed what they said were police and prosecutor IDs, said the president and the director in charge were also under investigation, and framed every later instruction as "cooperating with the investigation."
- **Remote control**: At 10:39 the head of accounting installed and ran remote-desktop software on the work PC as instructed; from then the scammers operated the PC directly. Its launch was logged internally but not detected. Nothing restricted unapproved applications.
- **Transfers**: The scammers created transfers in the payment account and called the head of accounting in to complete the two-factor step at approval, with the explanation that the money was going to a frozen account and would come back. Transfers ran from ¥99.99 million at 11:41 until 10:22 the next day.
- **Loss**: ¥1,179.81 million went out; ¥940 million moved between the company's own accounts. Hatena booked ¥1,221 million in extraordinary losses for FY7/2026, including investigation costs.

### Timeline

- **2026-04-20**: 8:02, the scammers call the head of accounting. 10:39, remote desktop installed. 11:41, first fraudulent transfer. 13:13, the director in charge approves a fund move in internal chat. After 16:00, the bank tells the director of three suspicious ¥99.99 million transfers. Fund moves and transfers continue into the night; at 19:52, on the scammers' instructions, the head of accounting calls the bank and an account restriction is lifted.
- **2026-04-21**: Fund moves and transfers continue after 10:00. 10:53, a transfer fails because the bank has halted withdrawals. 11:08, the head of accounting realizes it is fraud and calls the police.
- **2026-04-24**: Hatena discloses the outflow (up to about ¥1.1 billion).
- **2026-05-07**: Discloses the special investigation committee.
- **2026-06-12**: Books ¥1,179 million as an extraordinary loss and revises its full-year forecast to a net loss.
- **2026-07-24**: Publishes the committee's report (disclosure version).
- **2026-07-31**: Discloses prevention measures.

> The facts rely on Hatena's disclosures and the special investigation committee's report (disclosure version; both primary). The report reconstructs events from interviews with the head of accounting and from PC, call and chat records. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Hatena**: Clarified rules for moving funds between its own accounts, requiring multi-step workflow approval and supporting documents in advance. In online banking, request and approval rights will not sit with the same person, approval environments are tightly limited, per-account limits are kept minimal, and automatic notifications are used. Remote-desktop tools are restricted, and training on police-impersonation and similar scams continues. Executives are returning part of their pay.
- **Causes cited by the committee**: Beyond the head of accounting putting "cooperation" ahead of company rules: an online-banking setting that let one person create and approve transfers (contrary to the company's accounting rules), no approval limit, no review of account rights, no transaction notifications, no supporting documents needed for fund moves, and accounting reliant on a few individuals. The committee says a setting that kept one person from completing a transfer alone at the payment bank would have prevented the loss.

## 6. Sources

- **Hatena (Primary, disclosure)**: "Notice of the occurrence of a fund outflow incident" (in Japanese) (2026-04-24) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2794871/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of establishment of a special investigation committee" (in Japanese) (2026-05-07) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2799999/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of extraordinary loss, deferred tax assets and revised full-year forecast" (in Japanese) (2026-06-12) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2834801/00.pdf>
- **Hatena (Primary, disclosure with the special investigation committee's report, disclosure version)**: "Notice of publication of the investigation report and partial voluntary return of executive pay" (in Japanese) (2026-07-24) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2856001/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of prevention measures" (in Japanese) (2026-07-31) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2859090/00.pdf>
- **Hatena (Primary, disclosure)**: "Notice of differences between forecast and results for FY7/2026, extraordinary loss and reversal of deferred tax assets" (in Japanese) (2026-09-11) — <https://ssl4.eir-parts.net/doc/3930/tdnet/2883672/00.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
