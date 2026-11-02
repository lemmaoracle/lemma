---
brief_no: 159
title: "ZUU：社内のビジネスチャットで役員を装った第三者の送金指示に基づき、同日のうちに外部の口座へ振り込まれた(同社の開示・特別調査)"
title_en: "ZUU: A transfer instruction from someone posing as an executive in the company's business chat was paid out to an outside account the same day (company disclosure, special investigation)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-03-19
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "ZUU、ビジネスチャットで役員を装う送金指示に従い 9,600 万円を振込 — 同日のうちに外部の口座へ"
og_lead_en: "ZUU paid ¥96M on a business-chat instruction from a fake executive — the same day"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · ニセ社長詐欺"
og_kicker_en: "CYBERATTACK · CEO FRAUD"
og_headline_ja: "役員を装うチャットの指示で、\n同じ日に振り込まれた。\n<accent>9,600 万円が外部の口座へ</accent>"
og_headline_en: "A chat instruction from a fake executive\nwas paid the same day.\n<accent>¥96M paid out.</accent>"
key_figures:
  - value: "¥96M"
    label: "Paid to an outside account on the fake executive's instruction and booked as an extraordinary loss for FY3/2026. Recovery is described as extremely difficult (company disclosure)"
    tone: "alert"
  - value: "Same day"
    label: "March 19, 2026: from the chat instruction to the transfer (company disclosure)"
  - value: "127"
    unit: "cases"
    label: "CEO-impersonation fraud cases known to Japanese police in January–June 2026, with losses of about ¥3.88 billion (National Police Agency)"
glossary:
  - term: "Business chat"
    desc: "A chat service used for internal communication. ZUU has not said which service it used."
  - term: "Recall request (kumimodoshi)"
    desc: "Asking the receiving bank to return a transfer. Once the recipient withdraws the money, it is rarely returned."
  - term: "CEO fraud"
    desc: "Fraud in which someone poses as a company's executive to get staff to send money. Japan's National Police Agency reports cases from around January 2026."
insight:
  slug: "instruction-processed-without-origin-proof"
  label: "Payment instructions that pass without a check of their origin"
  quote: "A payment instruction processed under the rules still cannot be told apart from a faked one if its origin was not checked."
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "hold-unverified"
    item: "Do not pay on an instruction whose origin cannot be confirmed"
  - slug: "audit-trail"
    item: "Record whose instruction was paid, and how it was confirmed"
attack_method: "impersonation"
impact: "A chat instruction from a fake executive sent ¥96M to an outside account (booked as an extraordinary loss)"
takeaway: "A chat instruction from a fake executive was paid to an outside account the same day. Confirm, before paying, that an instruction came from the person who gave it, whichever way it arrived."
self_check: "Can you confirm, before paying, that a payment instruction received by chat or email really came from that executive?"
countries: ["jp"]
---

## 1. Summary

ZUU disclosed that the payment followed its existing rules and processes. The later special investigation cited poor understanding and application of the rules, and ZUU itself says authenticity checks were insufficient where the chat tool meets the payment process. The instruction was doubted soon after the transfer and the company moved to a recall and a police report, but recovery is described as extremely difficult. <strong>A payment instruction processed under the rules still cannot be told apart from a faked one if its origin was not checked.</strong>

## 2. What got through

- **What got through**: Processing of a transfer instruction from someone posing as an executive, received in the business chat, and the payment to an outside account. It was processed under the company's existing rules and processes and paid the same day (March 27 disclosure).
- **What reached the receiving side**: In general, an instruction received in chat arrives as a request from that executive's account. A taken-over genuine account and a fake account can both look, from the receiving side, like the executive's own instruction.
- **Not disclosed**: Which chat service was used. Whether an executive's account was taken over or a fake account was created (the investigation cites insufficient vigilance against fake accounts and similar attacks). Who approved the payment. Whether the payee was new.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever executes the payment checks, before paying, that the instruction came from the person who gave it, by a means other than the one it arrived on.

- **Who approves**: The executive named in the instruction. They approve the payment through a means other than the chat the instruction came in on (such as a phone number registered in advance), in a form a reply inside the chat cannot produce.
- **Where it is checked**: The process that executes the payment. Instructions arriving by chat, email or phone are all checked at one point before paying. An instruction that cannot be confirmed is held, not paid, and payments to a first-time payee are held until the check is done.
- **What is recorded**: Whose instruction was paid, and how it was confirmed, kept apart from the chat history in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before paying and by a means other than the one the instruction arrived on, that it came from the person who gave it, and keeping a record. Detection means noticing something is wrong after paying. The dates below are when ZUU confirmed or disclosed each point, not necessarily when the payment was made.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check where the instruction came from, by another means, before paying</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>¥96M paid to an outside account<br>The same day as the instruction</span></div>
<div class="rx-zone det"><b>Detection · worked after paying</b>The instruction is doubted soon after the transfer</div>
<div class="rx-g g1"><div class="t">03-19</div><b>Fake executive's order, paid the same day</b></div>
<div class="rx-g g2"><div class="t">03-27</div><b>ZUU discloses the outflow</b></div>
<div class="rx-g g3"><div class="t">04-03</div><b>Special investigation begins</b></div>
<div class="rx-g g4"><div class="t">05-15</div><b>Findings and prevention measures disclosed</b></div>
</div>
</figure>

A recall request and a police report are remedies after the payment; they do not stop the transfer itself. A similar case, where a pre-recorded video call faked the CFO and ordered transfers, is [the Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that executes payments.** It does not look for intrusions; it confirms, before paying, that an incoming payment instruction rests on the approval of the person who gave it.

### Industries and operations to watch

- **Industry · Finance**: Companies with heavy money flows, where accounting staff pay out on executives' instructions.
- **Operation · Approval**: Transfers made on an executive's or manager's instruction, and their approval.
- **Operation · Bank account changes**: Payments to first-time payees, or to new payees in a hurry.

### Current controls vs Lemma

The route in this case is column 1 (an instruction received in chat, processed under the rules and paid). Column 2 covers payments to a first-time payee, which has not been disclosed as applying here. Column 3 is where the instructing person's own device or channels are also compromised, which has not been disclosed either.

| Control | Processing an instruction received in chat | Payment to a first-time payee | Instructing person's channels also taken over |
| --- | --- | --- | --- |
| Internal payment rules | Partial | Partial | Not effective |
| Multiple approvers | Partial | Partial | Not effective |
| Two-factor authentication, SSO | Partial | Not relevant | Not effective |
| Recall and police report | Not effective | Not effective | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Rules existed but were not consistently applied (special investigation); whether they covered checking an instruction's origin is not disclosed. More approvers looking at the same instruction can still pass a faked one. Two-factor authentication and SSO protect real accounts from takeover, but instructions from fake accounts still have to be told apart. A recall and a police report are remedies after the payment and do not stop it; recovery is described as extremely difficult. Lemma confirms the instruction with the person who gave it, by another means, before paying.

Note: Lemma's check works only when it is built into the process that executes payments, instructions by chat, email or phone all pass the same check, and the contact used for approval is managed apart from the means that carries the instruction. It passes if the instructing person's device or channels are also compromised. The check protects where an instruction came from; the real person giving a wrong instruction still needs separate controls. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about payment instructions

- Is there a step to confirm, outside the chat, a payment instruction received in internal chat?
- Do you hold payments to first-time payees until the check is done?
- Can the same person both create and approve a transfer?

## 5. Facts and timeline

- **Party**: ZUU, which runs financial media and finance businesses such as fundraising support. Listed on the TSE Growth market.
- **What happened**: On March 19, someone posing as an executive issued a fraudulent transfer instruction in the business chat ZUU used. It was processed under the company's existing rules and processes, and ¥96 million was paid from the company's account to an outside account the same day (March 27 disclosure).
- **How it came to light**: Soon after the transfer, doubts arose internally about the instruction's authenticity. After checking the facts, the company judged third-party fraud highly likely. It asked its bank for a recall and filed a police report, but called recovery extremely difficult.
- **Loss**: ¥96 million, booked as a "remittance fraud loss" in extraordinary losses for FY3/2026 (May 15 disclosure).
- **Investigation**: A special investigation by a law firm (April 3 to May 12) found no intentional wrongdoing by officers or staff; an outside third party was responsible.

### Timeline

- **2026-03-19**: A transfer instruction from a fake executive arrives in the business chat; ¥96 million is paid the same day. Doubts arise soon after.
- **2026-03-27**: ZUU discloses the incident.
- **2026-04-03**: A law firm begins a special investigation (through May 12).
- **2026-05-15**: ZUU discloses the investigation's findings, its prevention measures, and the ¥96 million extraordinary loss.

> The facts rely on ZUU's disclosures of March 27 and May 15 (both primary). The investigation report itself has not been published. ZUU says it had already begun reviewing its cash-management and payment-approval process, and the incident happened partway through that review. What has not been disclosed does not mean there were no controls.

### After disclosure

- **ZUU (done)**: Moved all internal communication to Slack with mandatory SSO and two-factor authentication. Required multiple approvers for transfers and began, provisionally, confirming first-time payees in advance. Broke up a concentration of bank-account administrator rights and removed unneeded accounts.
- **ZUU (planned)**: Make confirmation by phone, in person or online mandatory for large transfers. Revise accounting rules and add staff, including at the accounting-lead level. Set security standards covering group companies and contractors. Executives are returning part of their pay, and the CEO will directly oversee accounting and finance for now.
- **Causes cited by the investigation**: Weak internal controls over payment approval and withdrawals (poor understanding and inconsistent application of the rules, and a cashier lacking accounting experience), understaffed accounting, insufficient attention to internal-audit findings, and insufficient vigilance against fake accounts and insufficient measures for the business chat.
- **Industry**: Japan's National Police Agency reports CEO fraud since around January 2026, in which emails posing as executives get staff to set up social-media groups, disclose account balances and then send money: 127 cases and about ¥3.88 billion in losses in January–June.

## 6. Sources

- **ZUU (Primary, disclosure)**: "Notice of the occurrence of a fund outflow incident" (in Japanese) (2026-03-27) — <https://zuu.co.jp/files/topics/7799_ext_01_0.pdf>
- **ZUU (Primary, disclosure)**: "Notice of the results of the special investigation into the fund outflow incident and prevention measures" (in Japanese) (2026-05-15) — <https://zuu.co.jp/files/topics/7811_ext_01_0.pdf>
- **ZUU (Primary, disclosure)**: "Notice of extraordinary loss for FY3/2026 and differences between forecast and results" (in Japanese) (2026-05-15) — <https://zuu.co.jp/files/topics/7812_ext_01_0.pdf>
- **National Police Agency of Japan (Primary, statistics)**: "Threats in cyberspace in the first half of 2026", column on CEO fraud (in Japanese) — <https://www.npa.go.jp/publications/statistics/cybersecurity/data/R8kami/R08_kami_cyber_jousei.pdf>
- **ScanNetSecurity (Press)**: Report on ZUU's disclosure (in Japanese) (2026-04-14) — <https://scan.netsecurity.ne.jp/article/2026/04/14/55055.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
