---
brief_no: 159
title: "ZUU：社内のビジネスチャットで役員を装った第三者の送金指示に基づき、同日のうちに外部の口座へ振り込まれた(同社の開示・特別調査) — 送金の指示が本当にその役員から出たかを、振込の前に照合する層が無い"
title_en: "ZUU: A transfer instruction from someone posing as an executive in the company's business chat was paid out to an outside account the same day (company disclosure, special investigation) — Nothing checks, before paying, that an instruction really came from that executive"
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
og_kicker_ja: "サイバー攻撃事例 · ニセ社長詐欺"
og_kicker_en: "CYBERATTACK · CEO FRAUD"
og_headline_ja: "役員を装うチャットの指示で、\n同じ日に振り込まれた。\n<accent>9,600 万円が外部の口座へ</accent>"
og_headline_en: "A chat instruction from a fake executive\nwas paid the same day.\n<accent>¥96M paid out.</accent>"
summary_labels: ["What happened", "Why it went through", "The missing layer"]
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
  label: "Payment instructions that pass without proof of origin"
  quote: "The company disclosed that the payment followed its existing rules and processes. The later investigation cited poor application of those rules. No step checking, before paying, that the instruction really came from that executive is visible."
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "Confirm a payment instruction with the person who gave it, through a channel other than the one it arrived on"
  - slug: "hold-unverified"
    item: "Do not pay on an instruction whose origin cannot be confirmed"
  - slug: "audit-trail"
    item: "Record whose instruction was paid, and how it was confirmed"
attack_method: "impersonation"
impact: "A chat instruction from a fake executive sent ¥96M to an outside account (booked as an extraordinary loss)"
takeaway: "A chat instruction from a fake executive was paid to an outside account the same day. Nothing checked, before paying, that it really came from that executive."
self_check: "Can you confirm, before paying, that a payment instruction received by chat or email really came from that executive?"
countries: ["jp"]
---

## 1. TL;DR

On March 19, 2026, ZUU, listed on the Tokyo Stock Exchange Growth market, received a transfer instruction in its business chat from someone posing as an executive and paid ¥96 million to an outside account the same day. The company disclosed that the payment followed its existing rules and processes. It requested a recall and filed a police report, but called recovery extremely difficult.

The later special investigation cited poor understanding and application of the rules, and ZUU itself cites insufficient authenticity checks where the chat tool meets the payment process. Rules alone do not stop a disguised instruction if nothing checks where it came from.

ZUU suspected the instruction soon after paying and acted on it. The transfer still went through. What failed was the layer that checks, before paying, that an instruction really came from that executive.

## 2. What happened

- **Party**: ZUU, which runs financial media and finance businesses such as fundraising support. Listed on the TSE Growth market.
- **What happened**: On March 19, someone posing as an executive issued a fraudulent transfer instruction in the business chat ZUU used. It was processed under the company's existing rules and processes, and ¥96 million was paid from the company's account to an outside account the same day (March 27 disclosure).
- **How it came to light**: Soon after the transfer, doubts arose internally about the instruction's authenticity. After checking the facts, the company judged third-party fraud highly likely. It asked its bank for a recall and filed a police report, but called recovery extremely difficult.
- **Loss**: ¥96 million, booked as a "remittance fraud loss" in extraordinary losses for FY3/2026 (May 15 disclosure).
- **Investigation**: A special investigation by a law firm (April 3 to May 12) found no intentional wrongdoing by officers or staff; an outside third party was responsible.
- **Not disclosed**: Which chat service was used. Whether an executive's account was taken over or a fake account was created (the investigation cites insufficient vigilance against fake accounts and similar attacks). Who approved the payment. Whether the payee was new.

As far as disclosed, the attack ran as follows.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain, as far as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ②. Had the company checked, before paying, that the instruction really came from that executive, the transfer in ③ would not happen. The company says ② followed its existing rules.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Third party</div><div class="no">1</div><b>Poses as an executive in the business chat and orders a transfer</b><p>March 19. Fake account or takeover: not disclosed.</p></div>
<div class="rx-step crit"><div class="who">ZUU</div><div class="no">2</div><b>Processes it under existing rules and processes</b><p>The company says authenticity checks between the chat and the payment process were insufficient.</p></div>
<div class="rx-step crit"><div class="who">ZUU</div><div class="no">3</div><b>Pays ¥96M to an outside account</b><p>Same day.</p></div>
<div class="rx-step good"><div class="who">ZUU</div><div class="no">4</div><b>Suspects the instruction, requests a recall, reports to police</b><p>Soon after the transfer. Recovery described as extremely difficult.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-03-19**: A transfer instruction from a fake executive arrives in the business chat; ¥96 million is paid the same day. Doubts arise soon after.
- **2026-03-27**: ZUU discloses the incident.
- **2026-04-03**: A law firm begins a special investigation (through May 12).
- **2026-05-15**: ZUU discloses the investigation's findings, its prevention measures, and the ¥96 million extraordinary loss.

> The facts rely on ZUU's disclosures of March 27 and May 15 (both primary). The investigation report itself has not been published. ZUU says it had already begun reviewing its cash-management and payment-approval process, and the incident happened partway through that review.

### After disclosure

- **ZUU (done)**: Moved all internal communication to Slack with mandatory SSO and two-factor authentication. Required multiple approvers for transfers and began, provisionally, confirming first-time payees in advance. Broke up a concentration of bank-account administrator rights and removed unneeded accounts.
- **ZUU (planned)**: Make confirmation by phone, in person or online mandatory for large transfers. Revise accounting rules and add staff, including at the accounting-lead level. Set security standards covering group companies and contractors. Executives are returning part of their pay, and the CEO will directly oversee accounting and finance for now.
- **Causes cited by the investigation**: Weak internal controls over payment approval and withdrawals (poor understanding and inconsistent application of the rules, and a cashier lacking accounting experience), understaffed accounting, insufficient attention to internal-audit findings, and insufficient vigilance against fake accounts and insufficient measures for the business chat.
- **Industry**: Japan's National Police Agency reports CEO fraud since around January 2026, in which emails posing as executives get staff to set up social-media groups, disclose account balances and then send money: 127 cases and about ¥3.88 billion in losses in January–June.

## 4. Why it wasn't stopped

The failure was not a lack of internal rules. **There were rules, but nothing in front of the payment checked that the instruction really came from that executive.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before paying and by a means other than the one the instruction came in on, that it really came from that executive, and keeping a record. Detection means noticing something is wrong after paying.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · did not work</b>Check where the instruction came from, before paying</div>
<div class="rx-zone gapz"><b>Gap</b><span>¥96M to an<br>outside account</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>The instruction is doubted soon after paying</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Fake executive's order</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Processed under existing rules, per ZUU</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>03-19 transfer</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Doubt, recall request</b></div>
</div>
</figure>

The instruction was doubted soon after the transfer, and the company moved quickly to a recall and a police report, but the money was already in the outside account. Instructions arrive by chat; payments run through the company's process. Between the two, checking the instruction's origin did not work well enough (company disclosure). That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [the Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/) (a pre-recorded video call faked the CFO and ordered transfers).

## 5. How to counter this

**Pay on an instruction only once you have confirmed it came from the person who gave it, however it arrived**: by chat, email or phone. Then faking an executive's name or account is not enough to move money. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Finance**: Companies with heavy money flows, where accounting staff pay out on executives' instructions.
- **Operation · Approval**: Transfers made on an executive's or manager's instruction, and their approval.
- **Operation · Bank account changes**: Payments to first-time payees, or to new payees in a hurry.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Internal payment rules | Partial | Rules existed but were not consistently applied (special investigation). Whether they covered checking an instruction's origin is not disclosed. |
| Multiple approvers | Partial | More approvers looking at the same instruction can still pass a faked one. |
| Two-factor authentication, SSO | Partial | Protects real accounts from takeover. Instructions from fake accounts still have to be told apart. |
| Recall and police report | Ineffective | After-the-fact remedies that do not stop the transfer. Recovery is described as extremely difficult. |

### What is needed

1. **Confirm with the person who gave the instruction, by a different means.** Do not verify a chat instruction inside the same chat.
2. **Do not pay on instructions you cannot confirm.** Never skip the check, least of all when an instruction urges speed or secrecy.
3. **Record whose instruction was paid, and how it was confirmed.** Keep the result as proof, separate from the chat history, so the instruction's origin can be shown to a third party later.

### Checklist

Three things to confirm about payment instructions

- Is there a step to confirm, outside the chat, a payment instruction received in internal chat?
- Do you hold payments to first-time payees until the check is done?
- Can the same person both create and approve a transfer?

Note: if the instructing person's device or channels are also compromised, this check can be passed. And it protects where an instruction came from; the real person giving a wrong instruction still needs separate controls.

## 6. Sources

- **ZUU (Primary, disclosure)**: "Notice of the occurrence of a fund outflow incident" (in Japanese) (2026-03-27) — <https://zuu.co.jp/files/topics/7799_ext_01_0.pdf>
- **ZUU (Primary, disclosure)**: "Notice of the results of the special investigation into the fund outflow incident and prevention measures" (in Japanese) (2026-05-15) — <https://zuu.co.jp/files/topics/7811_ext_01_0.pdf>
- **ZUU (Primary, disclosure)**: "Notice of extraordinary loss for FY3/2026 and differences between forecast and results" (in Japanese) (2026-05-15) — <https://zuu.co.jp/files/topics/7812_ext_01_0.pdf>
- **National Police Agency of Japan (Primary, statistics)**: "Threats in cyberspace in the first half of 2026", column on CEO fraud (in Japanese) — <https://www.npa.go.jp/publications/statistics/cybersecurity/data/R8kami/R08_kami_cyber_jousei.pdf>
- **ScanNetSecurity (Press)**: Report on ZUU's disclosure (in Japanese) (2026-04-14) — <https://scan.netsecurity.ne.jp/article/2026/04/14/55055.html>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
