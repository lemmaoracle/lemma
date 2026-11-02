---
brief_no: 135
title: "Visa の非接触カード：期限切れのカードを中継で期限内に見せ、決済を通せることが示された(USENIX Security 2026)"
title_en: "Visa contactless cards: An expired card was made to look valid through a relay and used to pay (USENIX Security 2026)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "2.1"
og_lead_ja: "期限切れの Visa の非接触カードが、中継で期限内に見せられ決済に通った — 米国の大手 5 行で試した研究"
og_lead_en: "Expired Visa contactless cards were made to look valid through a relay and passed at checkout — tested at five major US banks"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "攻撃の実証 · カード決済"
og_kicker_en: "ATTACK RESEARCH · CARD PAYMENTS"
og_headline_ja: "期限切れのカードが、\nまた決済に使えた。\n<accent>Visa の非接触で実証</accent>"
og_headline_en: "An expired card worked\nagain at checkout.\n<accent>Shown on Visa contactless.</accent>"
key_figures:
  - value: "1 of 4"
    label: "Card brands tested where the altered expiry got through: only the Visa configuration (researchers' tests)"
    tone: "alert"
  - value: "5"
    unit: "banks"
    label: "Major US banks tested. Some approved; others declined or asked for a replacement card (researchers' tests)"
  - value: "2025-05 → 2026-08"
    label: "From notifying Visa and the banks to publication. No mitigation had been confirmed at publication"
glossary:
  - term: "Contactless payment (EMV)"
    desc: "Paying by tapping a card on a terminal. Card and terminal talk over short-range radio (NFC), and the terminal asks the bank for approval."
  - term: "Relay"
    desc: "Placing devices between card and terminal to pass messages along. Here two phones did it, rewriting only the expiry value on the way."
  - term: "Issuer"
    desc: "The bank that issued the card. It makes the final decision to approve a payment."
insight:
  slug: "expiry-read-not-bound"
  label: "An expiry the terminal only reads"
  quote: "If the value the terminal reads is not bound to the issuer's record, a value rewritten on the way is used as is in the approval."
industries: ["finance", "retail"]
controls:
  - slug: "ownership-check"
    item: "At authorization, check the card's expiry and status against the issuer's record"
  - slug: "hold-unverified"
    item: "Do not approve transactions whose expiry does not match the record"
takeaway: "Whether the payment passed depended on whether the issuer checked the expiry the terminal read against its own record before approving."
self_check: "When you approve a card payment, do you check the expiry and card status against your own record, not the value the terminal sent?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. The fact corrections made in v2.0 (2026-10-25), such as the starting point being a physical expired card, five major US banks being tested, and $1, $100 and $500 payments being observed, still apply.

## 1. Summary

This is a research demonstration, and no real-world loss is claimed. In Visa's configuration the expiry the terminal reads was outside the card's signature, so rewriting it on the way left the card's other checks looking valid. Whether the payment went through depended on whether the issuing bank checked that card's status against its own record. <strong>If the value the terminal reads is not bound to the issuer's record, a value rewritten on the way is used as is in the approval.</strong>

## 2. What got through

- **What got through**: An authorization request for an expired Visa contactless card whose expiry value alone had been rewritten by a relay. In the researchers' tests, some banks approved it.
- **What was stopped**: The Mastercard, American Express and Discover configurations rejected the altered expiry. Of the five major US banks, those that checked that card's status against their own record declined or asked for a replacement card.
- **What reached the receiving side**: In general, a value the terminal reads that sits outside the card's signature can be rewritten on the way without the signature check noticing. If it is not bound to the value in another field of the authorization request, the rewritten value reaches the issuer in the same form as a correct one.
- **Not disclosed**: The number of cards or transactions tested, success rates, which banks approved, and whether Visa or the banks have mitigated it (none was confirmed at publication).

## 3. What to check

Whatever the route, the condition for telling them apart is that the issuer that approves a payment checks, before approving, the expiry and status in its own record of that card (number and generation), not the expiry the terminal sent.

- **Who approves**: The card issuer. The issuer makes the final decision, using its own record, which a terminal or relay cannot produce.
- **Where it is checked**: Just before the issuer approves a payment. The expiry the terminal read, the expiry in the authorization request and the card's status are checked against the record, and a transaction that does not match is not approved. The check is not skipped for speed or because of the terminal's decision.
- **What is recorded**: Which card's expiry and status were checked against which record, and whether the payment was approved or declined.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before approval, the expiry the terminal read against the issuer's record, and keeping a record. Detection means noticing an odd transaction or a relay afterwards. The dates below are when the researchers notified or published and the press reported, not necessarily when the tests took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · varied by bank</b>Before approval, check the card's status against your own record</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>An expired card<br>passed some banks' approval</span></div>
<div class="rx-zone det"><b>Detection · partial</b>Relay detection (RRP) was not enabled in the environment tested</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>Researchers notify Visa and banks</b></div>
<div class="rx-g g2"><div class="t">2025-12</div><b>Notified again</b></div>
<div class="rx-g g3"><div class="t">2026-08</div><b>Presented at USENIX Security</b></div>
<div class="rx-g g4"><div class="t">08-18</div><b>The Register reports it</b></div>
</div>
</figure>

Banks that checked the card's status against their record declined; where the terminal's decision was relied on, the rewritten expiry went through. A similar case, where a key kept working for a while after revocation, is [Google API keys](/critical/briefs/006-google-api-key-revocation-lag/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the point just before the issuer approves a payment.** It does not look for intrusions or relays; it checks, before approval, that the expiry the terminal read matches the expiry and status of that card in the issuer's record.

### Industries and operations to watch

- **Industry · Finance**: Banks that issue cards and approve payments, where some processing relies on the terminal's decision for speed.
- **Industry · Retail**: Stores that accept contactless payments. Whether relay detection is enabled on a terminal is hard to see from the store.

### Current controls vs Lemma

The route in this case is column 1 (an authorization request with an expiry rewritten by a relay). Column 2 is the entry point: getting hold of an expired card that was not disposed of.

| Control | Authorization request with an expiry rewritten by a relay | Getting hold of an expired card |
| --- | --- | --- |
| Card cryptographic checks | Not effective | Not relevant |
| Issuer authorization (when it checks the card's status) | Partial | Not relevant |
| Relay detection (RRP) | Partial | Not relevant |
| Disposing of expired cards | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

Card cryptographic checks still looked valid because the expiry was outside the signature. Issuer authorization declined at banks that checked the card's status, but some approved. Relay detection is optional and was not enabled on the cards and terminals tested. Disposing of expired cards reduces the entry point, but carelessly discarded cards remain. Lemma checks the expiry the terminal read against the issuer's own record before approval.

Note: Lemma's check works only when it is built into the issuer's approval decision and the record is managed by the issuer, apart from the terminal and any relay. If the issuer's record itself is stale or wrong, it passes. Putting the expiry inside the signature and enabling relay detection are measures on the network and terminal side, outside this check. The researchers started from a physical expired card; this is not a remote attack on every card. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions. We will revise this Brief if Visa or the banks announce a mitigation.

### Checklist

Three things to confirm for organizations that approve or accept card payments

- At authorization, do you check the expiry against your own record rather than the value the terminal sent?
- Do you confirm that the specific card (number and generation) is valid, not only the account?
- Do you tell cardholders how to dispose of expired or replaced cards (cut through the chip and stripe, or return them through an approved channel)?

## 5. Facts and timeline

- **Researchers**: Raja Hasnain Anwar, Gerard DeCunha and Muhammad Taqi Raza of the University of Massachusetts Amherst, in the paper "Zombie Cards Back Online" at USENIX Security 2026. This is a research demonstration, not a real-world loss.
- **Starting point**: A physical expired card that was not securely destroyed. The authors note expired cards are often discarded carelessly. It is not a remote attack on every cardholder.
- **Method**: Two phones formed a relay between card and terminal and rewrote only the expiry value the terminal reads. No specialized hardware was used, and it worked under ordinary in-store conditions.
- **Why it passed**: In Visa's configuration the expiry the terminal reads was outside the card's signature, so the card's cryptographic responses still looked valid. The issuer relied on a different expiry field in the authorization request, and the two values were not bound together.
- **Brands and banks**: The Mastercard, American Express and Discover configurations rejected the altered expiry. Across five major US banks, some approved while others declined or asked for a replacement card. The issue was observed on $1, $100 and $500 payments.
- **What the researchers did not do**: They did not break card cryptography or forge security responses, and are not releasing the relay code. Merchants were told in advance and every test charge was paid.

### Timeline

- **2025-05**: The researchers notify Visa and the relevant banks.
- **2025-12**: The researchers notify Visa and the banks again.
- **2026-08**: Presented at USENIX Security 2026. The Register reports it on 18 August.

> The facts rely on the paper's abstract and the authors' summary (primary). Press coverage repeats them. We do not claim real-world losses or victims. The number of cards or transactions tested and success rates were not published. What is not disclosed does not mean no control existed.

### After disclosure

- **Visa**: According to the authors' summary, the report passed initial triage and Visa's testing team was reproducing it. At publication neither Visa nor the notified banks had confirmed a mitigation for the expiry issue. No CVE had been assigned.
- **Researchers**: Recommended that issuers and networks enforce expiry consistently end to end and check the status of the specific card rather than only the account. The Relay Resistance Protocol, which can detect a relay, was not enabled on the cards and terminals tested.

## 6. Sources

- **USENIX Security 2026 (Research, primary)**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments" (2026-08) — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **Khwarizmi Lab (Research, primary, authors' summary)**: "Reviving expired cards for contactless payments" — <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register (Press)**: "Expired credit cards revived by researchers to make unauthorized payments" (2026-08-18) — <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)
