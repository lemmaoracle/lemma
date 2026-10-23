---
brief_no: 163
title: "米テキサス州リバティ市：取引先に似せたドメインから、実際にある債務と同じ額の支払いの請求が届き、市はその請求に応じて送金した(市の声明) — 支払いの請求が本当にその取引先から出たかを、送金の前に照合する層が見えない"
title_en: "City of Liberty, Texas: A payment request for the exact amount the city really owed arrived from a domain made to look like the vendor's, and the city wired the money (city statement) — No check, before paying, that the request really came from that vendor is visible"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-10-14
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud"]
status: published
version: "1.0"
og_lead_ja: "米リバティ市、取引先に似せたドメインの請求に応じ約 60 万ドルを送金 — 債務の額は本物と同じだった"
og_lead_en: "City of Liberty, Texas, wired ~$600K on a lookalike-domain request that matched a real debt"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE DOMAIN"
og_headline_ja: "取引先に似せたドメインから、\n本物と同じ額の請求が届いた。\n<accent>約 60 万ドルを送金</accent>"
og_headline_en: "A lookalike domain sent a request\nfor the exact amount owed.\n<accent>About $600K wired.</accent>"
summary_labels: ["What happened", "Why it can't be told apart", "The missing layer"]
key_figures:
  - value: "~$600K"
    label: "Wired in response to a payment request impersonating a vendor (city statement)"
    tone: "alert"
  - value: "Same amount"
    label: "The city really owed the vendor exactly the amount requested, which shaped its view that the request was genuine (city statement)"
  - value: "After payment"
    label: "When the receiving bank alerted the city's bank to possible fraud (city statement)"
glossary:
  - term: "Lookalike domain"
    desc: "A domain (the part after @) altered by a character or so to resemble the real one. Hard to tell apart by sight."
  - term: "Wire transfer"
    desc: "A direct bank-to-bank payment. In the US it typically arrives the same day and is hard to reverse once sent."
insight:
  slug: "real-debt-fake-sender"
  label: "Real contents, fake sender"
  quote: "The amount requested matched a debt the city really owed. The more accurate the contents, the more genuine the request looked, No check of the sender before payment is visible in the disclosure."
industries: ["public-sector"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "Check payment requests with the vendor's registered contact, through a channel other than the email they came in"
  - slug: "hold-unverified"
    item: "Do not pay requests whose sender cannot be confirmed"
  - slug: "audit-trail"
    item: "Record which request was paid, and how it was confirmed"
attack_method: "impersonation"
impact: "About $600K wired in response to a request from a lookalike vendor domain"
takeaway: "A request for the exact amount of a real debt came from a domain made to look like the vendor's. No check, before paying, that it really came from that vendor is visible in the disclosure."
self_check: "Can you confirm, before paying, that a vendor's payment request really came from that vendor?"
countries: ["us"]
---

## 1. TL;DR

On October 14, 2026, the City of Liberty, Texas, announced it had wired about $600,000 in response to a payment request sent from a lookalike email domain impersonating a vendor. After the payment went through, the receiving bank alerted the city's bank to possible fraud.

The city really owed that vendor exactly the amount requested, and says the genuine debt shaped its initial view that the request was valid. When the contents are right, the sender's display alone cannot reveal the fake.

The receiving bank flagged possible fraud, but only after the money had gone. What is not visible is the layer that checks, before paying, that a payment request really came from that vendor.

## 2. What happened

- **Party**: The City of Liberty, Texas, northeast of Houston.
- **What happened**: A payment request arrived by email from a lookalike domain impersonating a real vendor the city owed. The city wired about $600,000 in response.
- **Why it was hard to spot**: The city had a legitimate outstanding obligation to the vendor in the amount of the transfer, which it says contributed to the initial assessment that the request was valid.
- **How it came to light**: After the payment went through, the receiving bank alerted the city's bank that the transfer appeared potentially fraudulent.
- **City systems**: The city says its internal network was not compromised; the incident appears to have been an isolated one from outside, using a domain designed to closely resemble the vendor's email address.
- **Not disclosed**: The transfer date, the vendor's name, whether the request named a new bank account, who approved it, and whether any money was recovered. How the attacker learned of the vendor and the amount owed (for example, whether the vendor's email was compromised). The city says it cannot give details during the investigation. No legitimate party, including the city, the vendor or the city's consultants, is suspected of wrongdoing.

As far as disclosed, the attack ran as follows.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain, as far as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ②. Had the city checked, through a channel other than the email, that the request really came from the vendor, the transfer in ③ would not happen.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Third party</div><div class="no">1</div><b>Requests payment from a lookalike vendor domain</b><p>For the exact amount the city really owed.</p></div>
<div class="rx-step crit"><div class="who">City</div><div class="no">2</div><b>Judges the request genuine against the real debt</b><p>No check of the sender is visible in the disclosure.</p></div>
<div class="rx-step crit"><div class="who">City</div><div class="no">3</div><b>Wires about $600K</b><p>Date not disclosed.</p></div>
<div class="rx-step good"><div class="who">Bank</div><div class="no">4</div><b>The receiving bank flags possible fraud</b><p>After the payment went through.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **Transfer date (not disclosed)**: The city wires about $600,000 in response to the impersonated request. The receiving bank then alerts the city's bank to possible fraud.
- **2026-10-14**: The city issues a statement disclosing the incident.

> The facts rely on the City of Liberty's statement (primary). Press coverage repeats the statement; we found no further facts. The transfer date and recovery status have not been disclosed.

### After disclosure

- **City of Liberty**: Says it has strengthened its review of vendor payment verification procedures, filed an insurance claim and is cooperating with federal law enforcement. The Liberty Police Department is investigating with federal agencies.

## 4. Why it wasn't stopped

The failure was not a lack of attention to the contents. **The contents were right, and no check, before paying, that the request really came from that vendor is visible in the disclosure.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before paying and through a channel other than the email, that a payment request really came from that vendor, and keeping a record. Detection means noticing possible fraud after the payment.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible</b>Check the request's sender before paying</div>
<div class="rx-zone gapz"><b>Gap</b><span>About $600K<br>wired</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>The receiving bank flags possible fraud</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Lookalike-domain request</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Matches the real debt</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Wire transfer</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Bank alert</b></div>
</div>
</figure>

When the amount matches a real debt, no amount of scrutiny of the contents tells it apart; only checking the sender does. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/) (a hotel's payout account was switched in the legitimate admin screen).

## 5. How to counter this

**Pay a request only once the sender has been confirmed through the vendor's registered contact.** Check whether the contents are right and whether the sender is real separately. Then even a request for the exact amount owed does not get paid if it came from a lookalike domain. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Public sector**: Local governments whose vendors and payment amounts appear in council records and bids, so attackers may learn real debts (how they did here is not disclosed).
- **Operation · Approval**: Approving payments based on vendor requests.
- **Operation · Bank account changes**: Bank details named or changed alongside a payment request (not disclosed here).

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Checking the request's contents | Partial | The amount matched a real debt. The more accurate the contents, the more genuine it looks. |
| Checking the email sender | Partial | The domain was made to look like the real one. Hard to tell by sight. |
| Bank fraud detection | Partial | The receiving bank noticed only after the payment. |
| Insurance | Ineffective | May cover the loss, but does not stop the payment. |

### What is needed

1. **Confirm the sender through a channel other than the email.** Ask the vendor's registered contact whether it sent the request.
2. **Do not pay requests whose sender cannot be confirmed.** Even when the contents match a real debt, do not skip the check.
3. **Record which request was paid, and how it was confirmed.** Keep the result as proof, separate from the request email, so you can show insurers or investigators what was checked before paying.

### Checklist

Three things to confirm about vendor payment requests

- Do you check that the request's email domain matches the vendor's registered domain?
- Do you confirm requests through the registered contact, not a contact in the email itself?
- Do your procedures assume vendors and amounts owed can be learned from public records?

Note: if the vendor's registered contact itself is compromised, this check can be passed. The city has not disclosed the transfer date or how bank details were handled; we will revise this Brief if they become known.

## 6. Sources

- **City of Liberty (Primary, statement)**: "Press Release - 2026-10-14" (2026-10-14) — <https://www.cityofliberty.org/home-page/page/press-release-2026-10-14>
- **Click2Houston (Press)**: "City of Liberty loses $600,000 in fraudulent wire transfer after email impersonation scheme" (2026-10-14) — <https://www.click2houston.com/news/local/2026/10/14/city-of-liberty-loses-dollar600000-in-fraudulent-wire-transfer-after-email-impersonation-scam/>
- **Bluebonnet News (Press)**: "City of Liberty targeted in $600,000 payment fraud scheme" (2026-10-14) — <https://bluebonnetnews.com/2026/10/14/city-of-liberty-targeted-in-600000-payment-fraud-scheme/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
