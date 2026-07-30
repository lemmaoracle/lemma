---
brief_no: 108
title: "AFX Trade：validator の署名鍵が侵害され、2/3 のクォーラムを「有効に」満たして $24.15M が払い出された"
title_en: "AFX Trade — compromised validator keys met the two-thirds quorum \"validly\" and released $24.15M"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-07-23
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["045-humanity-protocol-multisig-key-custody", "074-taiko-bridge-prover-key-leak", "103-ostium-oracle-signer-key-future-priced-data", "016-verus-ethereum-bridge", "001-kelpdao-rseth", "002-stakedao-vsdcrv"]
status: published
version: "1.0"
og_lead_ja: "AFX Trade — 侵害された署名が 2/3 クォーラムを満たし $24.15M 流出"
og_lead_en: "AFX Trade — compromised signatures met the 2/3 quorum, $24.15M gone"
gap_detected: "Blockaid detected the exploit at 2026-07-22 21:30 UTC, and Offchain Labs quickly established that the Arbitrum native bridge was intact and the event originated from a third-party bridge."
gap_missing: "It was verified that the required number of valid signatures was present, but not whether the keys producing those signatures were legitimate and uncompromised; signatures from compromised hot keys 'validly' met the ~2/3 quorum and the payout was finalized."
gap_fix: "Before a payout is finalized, require the legitimacy of the signer and key — decoupled from the validity of the signature and the satisfaction of the quorum — as an independently verifiable proof, and deny up front any payout not accompanied by that proof."
---

## 1. TL;DR

AFX Trade — a decentralized exchange offering USDC-denominated perpetual futures on Arbitrum — lost roughly $24.15 million (USDC) on 2026-07-22–23 after the validator signing keys of the bridge it operates were compromised. Five compromised hot-validator signatures "validly" met the bridge's required ~2/3 quorum, and the contract verified the signatures and executed the payout exactly as designed — Blockaid, too, states that "the on-chain logic was not broken"; what was broken was the management of the private keys that produce those signatures (the signature count, quorum ratio, and 200-second challenge window are per Blockaid's account). The quorum verified the number of signatures, but not whether the keys producing them were legitimate and uncompromised. What was missing is a layer that independently verifies the legitimacy of the signer and key, decoupled from the validity of the signature.

---

## 2. What happened

- **Subject**: AFX Trade, a decentralized exchange offering USDC-denominated perpetual futures on Arbitrum. What was affected was the bridge AFX itself operates.
- **Amount lost**: roughly $24.15 million (24,150,000 USDC). The attacker moved it to Ethereum and swapped it into about 12,467 ETH. The drain corresponds to nearly the entirety of the protocol's TVL.
- **Date and time**: Blockaid detected the exploit at 2026-07-22 21:30 UTC. Reporting is dated 2026-07-23.
- **Method**: the attacker compromised the bridge's hot validator signing keys (keys held off-chain by the bridge operator / validators). With five hot-validator signatures they met the bridge's required ~2/3 quorum and got 24,150,000 USDC of payout approved. The contract verified the signatures and executed the payout after a 200-second challenge window (the signature count, quorum ratio, and the 200-second challenge window are per Blockaid's account).
- **Assessment of on-chain logic**: Blockaid assessed that the on-chain logic was not bypassed (it functioned as designed). The Arbitrum native bridge was unaffected, and the event was confined to the third-party bridge AFX operates (Offchain Labs co-founder Steven Goldfeder).

The incident came together as the following chain.

1. **Compromise of the hot validator signing keys**: the attacker compromises the validator signing keys of the bridge AFX operates (hot keys held off-chain). How the keys were compromised is not officially established.
2. **Meeting the quorum**: with the compromised keys the attacker generates five signatures and meets the bridge's required ~2/3 quorum. Each signature is cryptographically valid and passes the contract's signature verification.
3. **Payout execution exactly as designed**: the contract judges the payout valid and, after a 200-second challenge window, pays out 24,150,000 USDC to the attacker's wallet. The on-chain logic is not bypassed.
4. **Movement of assets**: the attacker bridges the USDC to Ethereum and swaps it into about 12,467 ETH, consolidating it into a single wallet. With the protocol's TVL nearly at capacity, most of it was drained.

---

## 3. Timeline — disclosure and response

- 2026-07 (before the attack): AFX's perpetual-futures trading volume spiked to a multi-month high in mid-July, and deposits (TVL) grew as well (DefiLlama).
- 2026-07-22 21:30 UTC: Blockaid detects an exploit against the bridge AFX operates. About $24.15 million USDC begins to drain.
- 2026-07-22 to 23: five hot-validator signatures meet the ~2/3 quorum, and 24,150,000 USDC of payout is approved. The contract executes the payout after a 200-second challenge window.
- 2026-07-23: the attacker moves the USDC to Ethereum and swaps it into about 12,467 ETH, consolidating it into a single wallet. An Offchain Labs co-founder states that "the Arbitrum native bridge has not been compromised" and "the event originated from a third-party protocol."

> Note: the technical facts are based on Blockaid's detection, the statement by an Offchain Labs co-founder, and on-chain records (Arbiscan) and reporting by established media (CoinDesk, crypto.news, and others). The details of how the keys were compromised (leak, theft, operational failure, etc.), the final post-mortem, and the status of asset recovery/compensation are unconfirmed as of this writing. Consult the latest primary sources.

The response and industry movement after disclosure:

- **Detection (Blockaid) / impact scoping (Offchain Labs)**: Blockaid detected the exploit at 07-22 21:30 UTC. Offchain Labs co-founder and CEO Steven Goldfeder stated that "the Arbitrum native bridge has not been compromised" and "the event originated from a third-party protocol," separating the risk of contagion to the wider L2 from the failure of an individual protocol.
- **AFX's response**: an outreach urging the attacker to return the funds has been reported. The detailed root cause of the key compromise, the final post-mortem, and any compensation plan are unpublished as of this writing.
- **Cross-industry point**: this case is a representative example of the continuing 2026 shift in the center of gravity of attacks — "not a smart-contract bug, but the compromise of off-chain components (key management, permission scope, verification logic)." CoinDesk positioned it, on the axis of attack class (the compromise of off-chain privilege/keys rather than a contract bug), as of the same type as April's Drift Protocol incident (about $285 million, on a different chain — Solana), which reached privileged access over months. Even when threshold signing is used, the design point is being reappraised that without a layer independently verifying the legitimacy of the signer and key before payout, a fake payout carrying the required number of valid signatures can pass straight through.

"How to independently verify, at the moment of payout, the legitimacy of the signer and key — in addition to satisfying the threshold signature" is expected to advance, prompted by this incident, as a requirement for bridge design.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the bridge's trust was established by "is the required number of valid signatures present," not by "are the keys producing those signatures legitimate and uncompromised."**  Each signature was valid, and the contract functioned as designed. What went unverified was the layer one step above the signature — the legitimacy of the signer and key.

What is specific to this incident is that **the quorum (the signature threshold) itself did not serve as a defense of the signer's legitimacy.** Threshold signing is a mechanism to prevent a single key compromise from approving a payout. But here, five signatures from compromised keys met the threshold "correctly" (the manner of each key's compromise is unconfirmed). The threshold verifies the number of signatures, but not whether the keys producing them share the same compromise exposure. Whereas [Brief No.045](/critical/briefs/045-humanity-protocol-multisig-key-custody/) ([Humanity Protocol](/critical/briefs/045-humanity-protocol-multisig-key-custody/), where the keys on a single laptop alone exceeded the threshold) showed that "a single custody point invalidates the threshold," this case shows the flip side of threshold signing: "if multiple keys are compromised together, the threshold passes correctly." The shared primitive is the same: **the validity of a signature (and the satisfaction of a required count) is independent of the legitimacy of the signer and key.**

It is a direct descendant of [Brief No.074](/critical/briefs/074-taiko-bridge-prover-key-leak/) ([Taiko bridge](/critical/briefs/074-taiko-bridge-prover-key-leak/), where the proof was verified correctly but the leak of a signer key let a fake withdrawal pass as "valid") and [Brief No.103](/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/) ([Ostium](/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/), where the compromise of a single oracle signer key let "future prices" be accepted with a valid signature), in the structure where cryptographic verification functioned but the legitimacy of the signer or key it presupposes was not independently confirmed. It connects with [Brief No.016](/critical/briefs/016-verus-ethereum-bridge/) ([Verus-Ethereum](/critical/briefs/016-verus-ethereum-bridge/)), [Brief No.001](/critical/briefs/001-kelpdao-rseth/) ([KelpDAO / rsETH](/critical/briefs/001-kelpdao-rseth/)), and [Brief No.002](/critical/briefs/002-stakedao-vsdcrv/) ([Stake DAO / vsdCRV](/critical/briefs/002-stakedao-vsdcrv/)) through the structure in which the verification and trust configuration a bridge relies on connects directly to the payout of assets.

Blockaid's detection of the attack and Offchain Labs' rapid scoping of the impact (the Arbitrum native bridge intact, the event originating from a third-party protocol) are indispensable to grasping the harm and limiting its spread, and this Brief does not deny that role. On-chain monitoring and coordination among the parties played a part in establishing the impact scope here too. Detection does play its part.

At the same time, detection does not provide material to independently establish — **at the moment that payout is finalized** — whether the signatures now meeting the 2/3 quorum come from legitimate, uncompromised keys or from hot keys compromised together. Signatures from compromised keys are cryptographically valid and pass the contract's signature verification and threshold check correctly. The 200-second challenge window, absent a separate independent basis for challenge (a proof of the signer's and key's legitimacy), lets a full set of valid signatures pass straight through. As material for an audit or regulatory report to establish "was this bridge's payout a legitimate approval by legitimate validators?", the mere fact that "the required number of valid signatures was present" is not an independent trail of the signer's and key's legitimacy. This is a gap in a structurally independent layer, outside the reach of the detection layer.

---

## 5. What proof would have changed

Pre-action attestation fills this gap by inserting a proof of the signer's and key's legitimacy one step into the path that approves a payout. Before a payout is finalized, it verifies — decoupled from the validity of the signature and the satisfaction of the quorum — "is the key producing this signature legitimate and uncompromised right now, and authorized for this scope?", and blocks the payout up front when no proof accompanies it. Threshold signing (the detection-side "the required number of signatures is present") and pre-action attestation of signer legitimacy ("are these keys legitimate right now?") are a **complement**, not a substitute, and the combination of the two layers establishes the bridge's trust boundary.

Against the detection–proof gap this event exposed (the required number of valid signatures present while the keys were compromised), Lemma proposes a design that requires the legitimacy of the signer and key — verifiable as cryptographic proof independent of the validity of the signature and the satisfaction of the quorum — before a payout is approved.

- **Pre-action proof of signer legitimacy (proof-as-auth)**: before a payout is finalized, prove — decoupled from the validity of the signature and the satisfaction of the threshold — that "the key producing this signature is legitimate and uncompromised right now, and authorized for this scope." Do not make "the required number of valid signatures is present" the terminus of approval.
- **Separating key possession from legitimacy**: do not reduce legitimacy to "holding the signing key"; bind the key to the execution environment / device (non-exportable credentials) and constrain it by scope and time. In this way, copying or exfiltrating the signing key alone cannot forge the legitimacy proof, narrowing the path by which the theft of multiple hot keys translates straight into forging a "valid quorum."
- **Making the basis for challenge independent**: make the challenge window function not only on the presence of valid signatures but on the proof of the signer's and key's legitimacy, denying up front any payout not accompanied by that proof.
- **Selective disclosure**: disclose at minimum only "this approval satisfies the signer-legitimacy requirement," keeping internal signing keys and credentials out of the environment.

That said, pre-action attestation is not a cure-all. The point of proof-as-auth is to close the theft paths for keys — leakage, interception, phishing — by not transmitting or server-storing keys, and to decouple legitimacy from the mere possession of a key. It does not unconditionally prevent the case where the signing environment itself is fully compromised at the execution-environment level. That is, this layer does not replace threshold signing; it works as a complementary layer atop it that reduces residual risk — by not letting the theft of a signing key translate into a "proof of legitimacy," it cuts the path by which a key compromise connects straight to forging a "valid quorum."

With this, a proof fixed at the moment of payout serves as an independently verifiable trail of "are these keys legitimate right now?", before asset movement is finalized. Detection (after-the-fact on-chain monitoring and impact scoping) works on containment after discovery; pre-action attestation (pre-approval verification of the signer and key) works on the independent verification of signer legitimacy — the two work complementarily.

---

## 6. Sources

- **CoinDesk (primary reporting)**: “Arbitrum-based AFX Trade drained of $24 million after bridge keys compromised” (2026-07-23; hot validator signatures, quorum, 200-second challenge window, Offchain Labs statement) — <https://www.coindesk.com/tech/2026/07/23/arbitrum-based-afx-trade-drained-of-usd24-million-after-bridge-keys-compromised>
- **crypto.news**: “AFX bridge exploit drains $24.15M USDC as attacker buys 12,467 ETH” (2026-07-23) — <https://crypto.news/afx-bridge-exploit-drains-24-15m-usdc-as-attacker-buys-12467-eth/>
- **Crypto Briefing**: “AFX Trade drained of $24M, offers hacker 30% bounty to return stolen funds” (2026-07-23) — <https://cryptobriefing.com/afx-trade-24m-exploit-hacker-bounty/>
- **Blockonomi**: “Dual Crypto Bridge Exploits Drain $31.6M Within Seven Hours” (2026-07-23; context of the same day's cluster of incidents) — <https://blockonomi.com/dual-crypto-bridge-exploits-drain-31-6m-within-seven-hours>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
