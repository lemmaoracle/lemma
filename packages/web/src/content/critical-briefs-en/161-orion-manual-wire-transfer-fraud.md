---
brief_no: 161
title: "Orion S.A.：社員が詐欺の標的になり、複数の送金が外部の口座へ出た(米 SEC 提出書類)"
title_en: "Orion S.A.: An employee was targeted by a criminal scheme, and multiple wire transfers went to outside accounts (US SEC filings)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-08-10
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "化学メーカー Orion、社員を狙った詐欺で複数の送金が外部の口座へ — 未回収の損失 5,920 万ドル"
og_lead_en: "Orion: a scheme targeting one employee sent multiple wires to outside accounts — a $59.2M unrecovered loss"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 送金詐欺"
og_kicker_en: "CYBERATTACK · WIRE FRAUD"
og_headline_ja: "社員を狙った詐欺で、\n送金が何度も外部へ出た。\n<accent>未回収 5,920 万ドル</accent>"
og_headline_en: "A scheme targeting one employee\nsent wires out again and again.\n<accent>$59.2M unrecovered.</accent>"
key_figures:
  - value: "$59.2M"
    label: "Booked in Q3 2024 as a loss for unrecovered fraudulently induced transfers (quarterly report)"
    tone: "alert"
  - value: "$9.2M"
    label: "Recovered in 2025 (€7.9M). Even with 2024 recoveries, most has not come back (annual report)"
  - value: "Q3 → 12-31"
    label: "From identifying a material weakness in manual wire controls to declaring it remediated (company reports)"
glossary:
  - term: "Orion S.A."
    desc: "A maker of carbon black, a raw material for tires and plastics. Incorporated in Luxembourg, with principal executive offices in Texas. Listed on the New York Stock Exchange."
  - term: "Form 8-K"
    desc: "A filing US-listed companies make with the SEC to report significant events as they happen."
  - term: "Material weakness"
    desc: "A deficiency in internal control over financial reporting serious enough that a material misstatement may not be prevented. Listed companies must disclose it."
insight:
  slug: "control-designed-but-not-operating"
  label: "Wire controls designed but not operating"
  quote: "Once a person follows the steps of a manual wire, a deceived request cannot be told apart from a proper one."
industries: ["manufacturing"]
operations: ["approval", "payment-change"]
controls:
  - slug: "hold-unverified"
    item: "Do not execute transfers not tied to a verified request"
  - slug: "audit-trail"
    item: "Record which request was paid, and how it was verified"
impact: "A scheme targeting an employee sent transfers to third-party accounts; $59.2M was booked as unrecovered (part later recovered)"
takeaway: "A scheme targeting one employee sent transfers out again and again. Execute a wire only once it is tied to a request verified as genuine."
self_check: "Do you verify that a manual wire request is genuine before executing it?"
countries: ["us"]
---

## 1. Summary

Orion reported a material weakness in its manual wire controls, which it believed were adequate as designed to prevent or detect unauthorized transfers but which did not operate effectively. The method has not been disclosed; the press calls it business email compromise, but the company's filings do not use the term. Orion identified the problem on August 10, and by then the wires had already gone out many times. <strong>Once a person follows the steps of a manual wire, a deceived request cannot be told apart from a proper one.</strong>

## 2. What got through

- **What got through**: An employee, not a named executive officer, was the target of a criminal scheme, and multiple fraudulently induced wires went to accounts controlled by unknown third parties (8-K of August 12, 2024).
- **A control that did not operate**: Orion reported that it believed its manual wire controls were adequate as designed to prevent or detect unauthorized transfers, but that they did not operate effectively (quarterly report).
- **What reached the receiving side**: In general, a wire made by a person following steps arrives as a proper wire once the employee has gone through them. Whether the request is genuine cannot be told from the wire itself.
- **Not disclosed**: The method (email, phone, who was impersonated). The total, number and dates of the transfers, and the destination countries. Whether the fraudulent transfers themselves were manual (the material weakness concerned controls over manual wires). The targeted employee's role. Which site was involved.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever executes a wire checks, before it goes out and by a means separate from the requester, that it is tied to a request verified as genuine.

- **Who approves**: The person responsible for the request at its origin. The approval is given by a means other than the channel the request arrived on, such as a contact registered in advance.
- **Where it is checked**: One point just before a manual wire is executed. A wire without a verification result cannot go out. No path is left for sending manual wires outside the system's payment flow.
- **What is recorded**: Which request was paid and how it was verified, kept with every transfer instead of waiting for a quarterly after-the-fact review.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a manual wire goes out, that it is tied to a request verified as genuine, and keeping a record. Detection means noticing fraud after the transfers. The dates below are when Orion confirmed or disclosed each point, not when the wires were sent.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Tie each wire to a verified request before it is executed</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Multiple wires to third-party accounts<br>$59.2M booked as unrecovered</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Identify the problem and pursue recovery</div>
<div class="rx-g g1"><div class="t">08-10</div><b>Problem identified</b></div>
<div class="rx-g g2"><div class="t">08-12</div><b>8-K filed</b></div>
<div class="rx-g g3"><div class="t">11-07</div><b>Loss and weakness disclosed</b></div>
<div class="rx-g g4"><div class="t">02-20</div><b>Declared remediated</b></div>
</div>
</figure>

Orion identified the problem on August 10 and moved to recover funds, but the wires had already gone out. A similar case, where a finance employee sent money on a faked CFO's instruction, is [the Hong Kong deepfake meeting fraud](/critical/briefs/084-hong-kong-deepfake-video-call-fraud/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that executes manual wires.** It does not look for intrusions; it checks, before a wire goes out, that it is tied to a request verified as genuine.

### Industries and operations to watch

- **Industry · Manufacturing**: Companies with many overseas sites and suppliers that make cross-border transfers by hand.
- **Operation · Approval**: Manual wires made by staff on request, and their approval.
- **Operation · Bank account changes**: Transfers to first-time recipients, or to new accounts named in a hurry.

### Current controls vs Lemma

Because the method, and whether the fraudulent transfers themselves were manual, have not been disclosed, it is not known which column this case falls in. Column 1 is a manual wire made by an employee on request; column 2 is a wire to a first-time recipient or a new account named in a hurry; column 3 is where the requester's own channel has been taken over.

| Control | Manual wire | Wire to a new account | Requester's channel taken over |
| --- | --- | --- | --- |
| Wire approval steps | Partial | Partial | Not effective |
| Management sub-certifications (quarterly) | Not effective | Not effective | Not effective |
| Employee training | Partial | Partial | Not effective |
| Recovery and insurance | Not effective | Not effective | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

The company believes the approval steps were adequate as designed, but says they did not operate. Quarterly reviews act after the fact, not before a transfer. Training makes deception harder, but does not stop a deceived employee's steps. Recovery and insurance are after-the-fact remedies that do not stop the transfer; part was recovered by 2025. Lemma ties the wire to a request verified by a means separate from the requester before it is executed.

Note: Lemma's check works only when it is built in just before manual wires are executed, no path remains to send wires outside the system's payment flow, and the means used for verification is separate from the channel the request arrives on. It passes if the requester's own channel has been taken over. Because the method has not been disclosed, this Brief limits itself to countermeasures that work whatever the route; we will revise it if the method becomes known. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about manual wires

- Is there any path for manual wires outside the system's payment flow?
- Is there a step to verify a wire request by a means other than the one it arrived on?
- Can one employee's judgment alone send several wires in a short time?

## 5. Facts and timeline

- **Party**: Orion S.A., a carbon black maker. Incorporated in Luxembourg; principal executive offices in Spring, Texas, per its SEC filings. Listed on the NYSE.
- **Loss**: $59.2 million booked in Q3 2024 for unrecovered transfers; $55.7 million net of recoveries in the 2024 annual report. $9.2 million (€7.9 million) recovered in 2025. Investigation fees were $3.6 million in 2024 and $2.3 million in 2025.
- **Systems**: No unauthorized access to data or systems was found, and operations were not affected.

### Timeline

- **2024-08-10**: Orion determines an employee was targeted and multiple wires went to third-party accounts.
- **2024-08-12**: Files an 8-K, expecting a charge of about $60 million absent further recoveries.
- **2024-11-07**: The Q3 report books a $59.2 million loss and discloses a material weakness in manual wire controls, concluding disclosure controls were not effective at September 30.
- **2025-02-20**: The 2024 annual report puts the loss at $55.7 million net of recoveries and says the weakness was remediated by year-end.
- **2026-02-17**: The 2025 annual report discloses a $9.2 million recovery.

> The facts rely on Orion's SEC filings (the 8-K, the Q3 2024 10-Q, and the 2024 and 2025 10-Ks; all primary). The "business email compromise" label comes from the press; the company has not confirmed it. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Orion**: Added controls over cash disbursements, strengthened management's quarterly sub-certifications, expanded employee training and encouraged early escalation. The audit committee engaged a third party to investigate. At December 31, 2024, the company concluded the controls had operated long enough to call the weakness remediated.
- **Recovery**: Working with law enforcement and pursuing recovery through all legal means, including insurance.

## 6. Sources

- **Orion S.A. (Primary, SEC 8-K)**: "Form 8-K, Item 8.01 Other Events" (2024-08-12) — <https://www.sec.gov/Archives/edgar/data/1609804/000095014224002170/eh240519238_8k.htm>
- **Orion S.A. (Primary, SEC 10-Q)**: "Quarterly Report for the period ended September 30, 2024" (2024-11-07) — <https://www.sec.gov/Archives/edgar/data/1609804/000160980424000033/oec-20240930.htm>
- **Orion S.A. (Primary, SEC 10-K)**: "Annual Report for the year ended December 31, 2024" (2025-02-20) — <https://www.sec.gov/Archives/edgar/data/1609804/000160980425000007/oec-20241231.htm>
- **Orion S.A. (Primary, SEC 10-K)**: "Annual Report for the year ended December 31, 2025" (2026-02-17) — <https://www.sec.gov/Archives/edgar/data/1609804/000162828026008601/oec-20251231.htm>
- **The Record (Press)**: "Carbon black supplier Orion loses $60 million in business email compromise scam" (2024-08-13) — <https://therecord.media/orion-carbon-black-bec-scam-millions>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
