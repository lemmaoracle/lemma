---
brief_no: 135
title: "Visa の EMV 非接触カードで、期限切れでも決済が通りうることが示された — 端末が読む有効期限が、発行者の署名済み記録と照合されていない"
title_en: "Expired Visa EMV contactless cards were shown to pass at checkout — the expiry the terminal reads is never collated against the issuer's signed record"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "Visa の EMV 非接触で期限切れカードの決済が通りうる、有効期限が未照合"
og_lead_en: "Expired Visa EMV contactless cards can pass; the terminal's expiry isn't bound to the record"
gap_detected: "Detection can work. Anomalous transactions and use of expired cards can be surfaced as an after-the-fact monitoring layer."
gap_missing: "The expiry the terminal used to decide was never collated against the issuer's signed record."
gap_fix: "Before a transaction settles, collate the attribute the terminal decides on against the issuer's signed original, cryptographically bound."
---

## 1. TL;DR

At USENIX Security 2026, researchers showed that Visa contactless cards would **pass at checkout even when expired**. EMV contactless transactions are only selectively authenticated, and the expiry the terminal reads is not covered by the card's signature. The value the terminal sees sits in a different data field from the one the issuer uses, and the two were not cryptographically bound. **What was missing was a layer that collates the expiry the terminal used against the issuer's signed record.**

## 2. What happened

- Researchers at the University of Massachusetts Amherst (Raja Hasnain Anwar and colleagues) showed, in a paper titled "Zombie Cards Back Online," a way to make an expired contactless card appear valid and pass a purchase.
- EMV contactless has the card and terminal communicate directly over NFC, linked to a payment network, bank, and issuer. The transaction flow is selectively authenticated: some data is sent in plaintext and only later linked to cryptographic verification (Offline Data Authentication and issuer cryptograms).
- That structure allowed man-in-the-middle interference using smartphones acting as NFC proxies. The researchers made an expired contactless card appear valid and completed purchases.
- The terminal evaluates processing restrictions on the Application Expiration Date, but the issuer relies on an expiry in a different field of the online authorization request. These should be cryptographically bound; in Visa's implementation they are not. An attacker between card and terminal altered only what the terminal sees, while the card's normal checks still looked valid.
- Mastercard, American Express, and Discover configurations resisted; Visa contactless cards did not. Success also depended on the bank — some tested banks succumbed, others did not.

The chain:

1. The attacker interposes as an NFC proxy between card and terminal.
2. The expiry — sent in plaintext, not bound by signature — is altered only in what the terminal sees.
3. With the card's normal cryptographic checks still looking valid, the terminal proceeds as if the card were valid.
4. Because the issuer's decision rests on a different field and varies by bank, the transaction passes through the collation gap.

## 3. Timeline — disclosure and response

- 2025-05: the researchers notify Visa and the relevant banks of the findings.
- 2025-12: the researchers notify Visa and the banks again.
- 2026-08: presented at USENIX Security 2026. **Neither Visa nor the notified banks have confirmed mitigating the expiry issue.**

> This Brief concerns a research demonstration, not real-world harm. The mechanism, scope (Visa contactless configurations affected; Mastercard/Amex/Discover resistant), and disclosure timeline follow the USENIX presentation, the authors' summary, and independent reporting. No specific loss or victim is asserted. Success also depends on the bank's handling.

Points and response:

- The crux is that the terminal and issuer rely on the expiry in different data fields, and the two are not cryptographically bound.
- Implementation choices (selective authentication for backward compatibility and speed) left a gap in collating the attribute.

## 4. Why it wasn't stopped

The failure is not that the cryptography itself was broken. **The expiry the terminal used to decide was never collated against the issuer's signed record.**

Contactless transactions are only selectively authenticated. For speed and backward compatibility, some data is sent in plaintext and not bound to the later cryptographic verification. The value the terminal reads as the expiry is not covered by the signature and sits in a different field from the one the issuer uses. A man in the middle altered only what the terminal sees and had it proceed as a "valid card" while the card's normal checks still looked valid. Anomalous transactions and use of expired cards can be caught after the fact by monitoring. What was missing was the step before: collating the attribute the terminal decides on against the issuer's signed original.

> An attribute (an expiry) means something different depending on whether it is bound to the signed original. If the value the terminal reads and the value the issuer signed remain different while processing proceeds, the terminal accepts "valid" without checking. An attribute's correctness is secured not by the terminal being able to read it, but by collation against the signed original.

This runs in the same direction as [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/), where a credential stayed valid after revocation, and [Brief 032](/critical/briefs/032-booking-payout-account-tampering/), where a payout account was altered inside a legitimate platform. In each, an attribute an action relies on settles without being collated against the signed original.

## 5. What proof would have changed

Proof-as-auth inserts, one step before a transaction settles, a layer that collates the attribute the terminal decides on against the issuer's signed original. It does not look at whether the card is genuine. It makes it possible for the executing side to verify, before the transaction settles, that the expiry the terminal read matches the record the issuer signed.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Collating the attribute against the signed original</strong>: cryptographically bind the attribute the terminal decides on (such as expiry) to the issuer's signed record, and check the match before the transaction. Do not treat "the terminal can read it" as a substitute for correctness.</li>
<li><strong>A pre-action collation gate</strong>: immediately before a consequential action like payment, require proof that the relied-upon attribute has been collated against the original — filling the selective-authentication gap with collation.</li>
<li><strong>Attribute integrity binding</strong>: bind plaintext fields to the signed original, so a value altered in the middle does not carry into the decision.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>Detecting anomalous transactions and use of expired cards is the job of monitoring and fraud detection. This layer sits before that, making it possible to verify the attribute was collated against the original.</li>
<li>Proof can show only that an attribute matched the signed original — not whether the payment decision itself was right.</li>
<li>Which attributes get collation is the payment designer's decision; this layer supplies the basis, not the decision.</li>
</ul>

The difference from after-the-fact transaction records is here: a record remains after the transaction, but it is not material for verifying, before the transaction, that the attribute it relied on matched the original.

Detection and this layer are complementary, not substitutes. The former catches anomalous transactions after the fact; the latter makes it possible to verify, before a transaction settles, that the attribute an action relies on has been collated against the signed original.

## 6. Sources

- **USENIX Security 2026 (primary, research)**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments" — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **Authors' summary (primary, research)**: "Reviving expired cards for contactless payments" (Khwarizmi Lab) — <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register (independent)**: "Expired credit cards revived by researchers to make unauthorized payments" (2026-08-18) — <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute).

Mitigation status is unconfirmed as of publication.
