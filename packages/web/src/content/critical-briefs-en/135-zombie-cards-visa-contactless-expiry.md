---
brief_no: 135
title: "Visa の非接触カード：期限切れのカードを中継で期限内に見せ、決済を通せることが示された(USENIX Security 2026) — 端末が読む有効期限を、発行者が自社の記録と照合する層が無い"
title_en: "Visa contactless cards: An expired card was made to look valid through a relay and used to pay (USENIX Security 2026) — Nothing has the issuer check the expiry the terminal reads against its own record"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "2.0"
og_lead_ja: "期限切れの Visa の非接触カードが、中継で期限内に見せられ決済に通った — 米国の大手 5 行で試した研究"
og_lead_en: "Expired Visa contactless cards were made to look valid through a relay and passed at checkout — tested at five major US banks"
layout: "report"
og_kicker_ja: "攻撃の実証 · カード決済"
og_kicker_en: "ATTACK RESEARCH · CARD PAYMENTS"
og_headline_ja: "期限切れのカードが、\nまた決済に使えた。\n<accent>Visa の非接触で実証</accent>"
og_headline_en: "An expired card worked\nagain at checkout.\n<accent>Shown on Visa contactless.</accent>"
summary_labels: ["What happened", "Why it can't be told apart", "The missing layer"]
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
  quote: "The expiry lives on the card, but in Visa's configuration it was not covered by the card's signature. If the value the terminal reads is not bound to the one the issuer holds, an expiry rewritten on the way goes straight through."
industries: ["finance", "retail"]
controls:
  - slug: "ownership-check"
    item: "At authorization, check the card's expiry and status against the issuer's record"
  - slug: "hold-unverified"
    item: "Do not approve transactions whose expiry does not match the record"
self_check: "When you approve a card payment, do you check the expiry and card status against your own record, not the value the terminal sent?"
countries: ["global"]
---

> **Revision (v2.0 / 2026-10-25)**: Restructured for general readers, with §5 rewritten as "How to counter this". Facts re-checked against the authors' summary and the USENIX abstract (the starting point is a physical expired card that was not destroyed; five major US banks were tested; the issue was observed on $1, $100 and $500 payments). The description of Lemma's design was removed.

## 1. TL;DR

At USENIX Security in August 2026, researchers at the University of Massachusetts Amherst showed that an expired Visa contactless card could be made to look unexpired through a relay between card and terminal, and used to pay. The starting point is a physical expired card that was not securely destroyed.

In Visa's configuration the expiry the terminal reads was not covered by the card's signature, so rewriting it on the way left the card's other checks looking valid. Whether the payment went through depended on whether the issuing bank checked that card's status against its own record.

The researchers notified Visa and the banks in May and December 2025, and no mitigation had been confirmed at publication. What was missing was a layer in which the issuer checks the expiry the terminal reads against its own record of that card.

## 2. What happened

- **Researchers**: Raja Hasnain Anwar, Gerard DeCunha and Muhammad Taqi Raza of the University of Massachusetts Amherst, in the paper "Zombie Cards Back Online" at USENIX Security 2026. This is a research demonstration, not a real-world loss.
- **Starting point**: A physical expired card that was not securely destroyed. The authors note expired cards are often discarded carelessly. It is not a remote attack on every cardholder.
- **Method**: Two phones formed a relay between card and terminal and rewrote only the expiry value the terminal reads. No specialized hardware was used, and it worked under ordinary in-store conditions.
- **Why it passed**: In Visa's configuration the expiry the terminal reads was outside the card's signature, so the card's cryptographic responses still looked valid. The issuer relied on a different expiry field in the authorization request, and the two values were not bound together.
- **Brands and banks**: The Mastercard, American Express and Discover configurations rejected the altered expiry. Across five major US banks, some approved while others declined or asked for a replacement card. The issue was observed on $1, $100 and $500 payments.
- **What the researchers did not do**: They did not break card cryptography or forge security responses, and are not releasing the relay code. Merchants were told in advance and every test charge was paid.

In the researchers' tests, the payment went through in this chain.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain to an approved payment, in the researchers' tests</span></div>
<p class="rx-ex-cap">The stopping point is ④. Had the issuer checked that card's expiry and status against its own record, the expiry rewritten at ③ would not have passed.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">1</div><b>Obtains an expired card that was not destroyed</b><p>A physical card is needed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">2</div><b>Builds a relay between card and terminal with two phones</b><p>No specialized hardware.</p></div>
<div class="rx-step crit"><div class="who">Relay</div><div class="no">3</div><b>Rewrites only the expiry the terminal reads</b><p>Outside the signature, so other checks look valid.</p></div>
<div class="rx-step crit"><div class="who">Issuer</div><div class="no">4</div><b>Some banks approve the payment</b><p>Banks that checked the card's status declined.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2025-05**: The researchers notify Visa and the relevant banks.
- **2025-12**: The researchers notify Visa and the banks again.
- **2026-08**: Presented at USENIX Security 2026. The Register reports it on 18 August.

> The facts rely on the paper's abstract and the authors' summary (primary). Press coverage repeats them. We do not claim real-world losses or victims. The number of cards or transactions tested and success rates were not published.

### After disclosure

- **Visa**: According to the authors' summary, the report passed initial triage and Visa's testing team was reproducing it. At publication neither Visa nor the notified banks had confirmed a mitigation for the expiry issue. No CVE had been assigned.
- **Researchers**: Recommended that issuers and networks enforce expiry consistently end to end and check the status of the specific card rather than only the account. The Relay Resistance Protocol, which can detect a relay, was not enabled on the cards and terminals tested.

## 4. Why it wasn't stopped

The failure was not that card cryptography was broken. **Payments were approved without the expiry the terminal read being checked against the issuer's record of that card.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before approval, that the expiry used for the decision matches the expiry of that card in the issuer's record. Detection means noticing an odd transaction afterwards.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · missing</b>Check the expiry the terminal read against the issuer's record</div>
<div class="rx-zone gapz"><b>Gap</b><span>An expired<br>card passes</span></div>
<div class="rx-zone det"><b>Detection layer · partial</b>Banks that checked the card's status declined</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Expired card</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Relay</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Expiry rewritten</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Approval</b></div>
</div>
</figure>

Banks that checked the card's status declined or asked for a replacement card. Banks that relied on the terminal's decision and skipped checks for speed let the rewritten expiry through. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [Google API keys](/critical/briefs/006-google-api-key-revocation-lag/) (keys that kept working for a while after revocation).

## 5. How to counter this

**At authorization, check the expiry and status against the issuer's own record of that card, not the expiry the terminal sent.** The value the terminal reads can be rewritten on the way. Checking against your own record before approving means an expired card does not pass even when made to look valid. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Finance**: Banks that issue cards and approve payments, where some processing relies on the terminal's decision for speed.
- **Industry · Retail**: Stores that accept contactless payments. Whether relay detection is enabled on a terminal is hard to see from the store.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Card cryptographic checks | Ineffective | The expiry was outside the signature, so the checks still looked valid. |
| Issuer authorization | Partial | Banks that checked the card's status declined, but some approved. |
| Relay detection (RRP) | Partial | Optional, and not enabled on the cards and terminals tested. |
| Disposing of expired cards | Partial | Reduces the entry point, but carelessly discarded cards remain. |

### What is needed

1. **At authorization, check the card's expiry and status against the issuer's record.** Confirm that this card number and generation is valid, not only that the account is.
2. **Do not approve transactions whose expiry does not match the record.** Do not skip the check because of the terminal's decision or processing speed.
3. **Put the expiry the terminal reads inside the signature.** On the network and terminal side, also enable relay detection.

### Checklist

Three things to confirm for organizations that approve or accept card payments

- At authorization, do you check the expiry against your own record rather than the value the terminal sent?
- Do you confirm that the specific card (number and generation) is valid, not only the account?
- Do you tell cardholders how to dispose of expired or replaced cards (cut through the chip and stripe, or return them through an approved channel)?

Note: the researchers started from a physical expired card; this is not a remote attack on every card. We will revise this Brief if Visa or the banks announce a mitigation.

## 6. Sources

- **USENIX Security 2026 (Research, primary)**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments" (2026-08) — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **Khwarizmi Lab (Research, primary, authors' summary)**: "Reviving expired cards for contactless payments" — <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register (Press)**: "Expired credit cards revived by researchers to make unauthorized payments" (2026-08-18) — <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)
