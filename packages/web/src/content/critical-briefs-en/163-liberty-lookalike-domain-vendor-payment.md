---
brief_no: 163
title: "米リバティ市：取引先に似せたドメインから本物と同じ額の請求が届き、市が送金した(市の声明)"
title_en: "City of Liberty, Texas: A lookalike vendor domain sent a request for the exact amount owed, and the city paid it (city statement)"
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
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE DOMAIN"
og_headline_ja: "取引先に似せたドメインから、\n本物と同じ額の請求が届いた。\n<accent>約 60 万ドルを送金</accent>"
og_headline_en: "A lookalike domain sent a request\nfor the exact amount owed.\n<accent>About $600K wired.</accent>"
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
  quote: "When the amount requested matches a debt that is really owed, no amount of scrutiny of the contents shows whether the sender is genuine."
industries: ["public-sector"]
operations: ["approval", "payment-change"]
controls:
  - slug: "hold-unverified"
    item: "Do not pay requests whose sender cannot be confirmed"
  - slug: "audit-trail"
    item: "Record which request was paid, and how it was confirmed"
attack_method: "impersonation"
impact: "About $600K wired in response to a request from a lookalike vendor domain"
takeaway: "A request for the exact amount of a real debt came from a domain made to look like the vendor's. Before paying, confirm that it really came from that vendor, through the vendor's registered contact."
self_check: "Can you confirm, before paying, that a vendor's payment request really came from that vendor?"
countries: ["us"]
---

## 1. Summary

The city really owed that vendor exactly the amount requested, and says the genuine debt shaped its initial view that the request was valid. The receiving bank flagged possible fraud only after the payment had gone through. <strong>When the amount requested matches a debt that is really owed, no amount of scrutiny of the contents shows whether the sender is genuine.</strong>

## 2. What got through

- **What got through**: A wire transfer made on a payment request that arrived by email from a lookalike vendor domain. The city wired about $600,000 (City of Liberty statement).
- **What reached the receiving side**: In general, a payment request arrives as an amount, a vendor name and a sender display. When the amount matches a real debt, the contents cannot tell it apart. A lookalike domain is hard to spot by sight.
- **Not disclosed**: The transfer date, the vendor's name, whether the request named a new bank account, who approved it, and whether any money was recovered. How the attacker learned of the vendor and the amount owed (for example, whether the vendor's email was compromised). The city says it cannot give details during the investigation.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever wires money on a payment request checks, before paying and through a channel other than the email, that the request really came from that vendor, using the vendor's registered contact.

- **Who approves**: The vendor. It confirms that it sent the request through the contact registered in advance (not a contact written in the request email).
- **Where it is checked**: The approval step before the payment is carried out. Whether the contents are right and whether the sender is real are checked separately. A request whose sender cannot be confirmed is held, not paid.
- **What is recorded**: Which request was paid, and through which contact it was confirmed, so you can show insurers or investigators what was checked before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means confirming, before wiring money on a payment request and through a channel other than the email, that the request really came from that vendor, and keeping a record. Detection means noticing possible fraud after the payment. The transfer date has not been disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before paying, confirm the sender through the registered contact</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About $600K was wired<br>The amount matched a real debt</span></div>
<div class="rx-zone det"><b>Detection · worked</b>After the payment, the receiving bank flags possible fraud</div>
<div class="rx-g g1"><div class="t">Request</div><b>Arrives from a lookalike domain</b></div>
<div class="rx-g g2"><div class="t">Payment</div><b>About $600K wired (date not disclosed)</b></div>
<div class="rx-g g3"><div class="t">Alert</div><b>The receiving bank flags it</b></div>
<div class="rx-g g4"><div class="t">10-14</div><b>The city issues a statement</b></div>
</div>
</figure>

Detection worked, but only after the payment had gone through. A similar case, where being "from a legitimate route" stood in for "being a correct operation", is [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/) (a hotel's payout account was switched in the legitimate admin screen).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that wires money on a payment request.** It does not look for intrusions; it confirms, before the payment, that the request is one that could be confirmed through the vendor's registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Local governments whose vendors and payment amounts appear in council records and bids, so attackers may learn real debts (how they did here is not disclosed).
- **Operation · Approval**: Approving payments based on vendor requests.
- **Operation · Bank account changes**: Bank details named or changed alongside a payment request (not disclosed here).

### Current controls vs Lemma

The route in this case is column 1 (a request from a lookalike domain). Column 2 is where the request names a new bank account; whether it did here has not been disclosed. Column 3 is where the vendor's registered contact itself has been taken over.

| Control | Request from a lookalike domain | Request naming a new bank account | Vendor's registered contact taken over |
| --- | --- | --- | --- |
| Checking the request's contents | Partial | Partial | Not effective |
| Checking the email sender | Partial | Partial | Not effective |
| Bank fraud detection | Partial | Partial | Partial |
| Insurance | Not effective | Not effective | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Checking the contents did not settle it, because the amount matched a real debt and the more accurate the contents, the more genuine the request looked. Checking the email sender is hard when the domain is made to look like the real one. Bank detection noticed only after the payment. Insurance may cover the loss but does not stop the payment. Lemma checks the sender, not the contents, against the registered contact before paying.

Note: Lemma's check works only when it is built into the approval step before payment and the vendor's registered contact is managed apart from the request email. It passes if the vendor's registered contact itself has been taken over. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about vendor payment requests

- Do you check that the request's email domain matches the vendor's registered domain?
- Do you confirm requests through the registered contact, not a contact in the email itself?
- Do your procedures assume vendors and amounts owed can be learned from public records?

## 5. Facts and timeline

- **Party**: The City of Liberty, Texas, northeast of Houston.
- **What happened**: A payment request arrived by email from a lookalike domain impersonating a real vendor the city owed. The city wired about $600,000 in response.
- **Why it was hard to spot**: The city had a legitimate outstanding obligation to the vendor in the amount of the transfer, which it says contributed to the initial assessment that the request was valid.
- **How it came to light**: After the payment went through, the receiving bank alerted the city's bank that the transfer appeared potentially fraudulent.
- **City systems**: The city says its internal network was not compromised; the incident appears to have been an isolated one from outside, using a domain designed to closely resemble the vendor's email address. No legitimate party, including the city, the vendor or the city's consultants, is suspected of wrongdoing.

### Timeline

- **Transfer date (not disclosed)**: The city wires about $600,000 in response to the impersonated request. The receiving bank then alerts the city's bank to possible fraud.
- **2026-10-14**: The city issues a statement disclosing the incident.

> The facts rely on the City of Liberty's statement (primary). Press coverage repeats the statement; we found no further facts. The transfer date and recovery status have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **City of Liberty**: Says it has strengthened its review of vendor payment verification procedures, filed an insurance claim and is cooperating with federal law enforcement. The Liberty Police Department is investigating with federal agencies.

## 6. Sources

- **City of Liberty (Primary, statement)**: "Press Release - 2026-10-14" (2026-10-14) — <https://www.cityofliberty.org/home-page/page/press-release-2026-10-14>
- **Click2Houston (Press)**: "City of Liberty loses $600,000 in fraudulent wire transfer after email impersonation scheme" (2026-10-14) — <https://www.click2houston.com/news/local/2026/10/14/city-of-liberty-loses-dollar600000-in-fraudulent-wire-transfer-after-email-impersonation-scam/>
- **Bluebonnet News (Press)**: "City of Liberty targeted in $600,000 payment fraud scheme" (2026-10-14) — <https://bluebonnetnews.com/2026/10/14/city-of-liberty-targeted-in-600000-payment-fraud-scheme/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
