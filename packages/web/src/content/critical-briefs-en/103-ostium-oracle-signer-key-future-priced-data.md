---
brief_no: 103
title: "Ostium：オラクル署名鍵1本の侵害で、「未来の価格」が有効な署名付きで受理され $18M が払い出された"
title_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-07-15
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "067-syscoin-bridge-spv-proof-parsing", "001-kelpdao-rseth", "045-humanity-protocol-multisig-key-custody", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "Ostium — オラクル署名鍵1本の侵害で「未来の価格」が有効署名で受理され $18M 流出"
og_lead_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
gap_detected: "The detection chain worked — Blockaid detected the attack in progress, Ostium grasped it within minutes and halted trading within an hour, and it is coordinating with law enforcement, SEAL 911, and third-party experts — containing the spread of harm; on-chain anomaly monitoring also helped confine the loss to about five minutes."
gap_missing: "There is no layer that, at the moment a price report is reflected in a payout, independently establishes — decoupled from the validity of the signature — whether that signer is legitimate and uncompromised right now and whether the data is authentic and plausible (not future-dated, consistent with the market); a fake report carrying a valid signature passes signature verification correctly."
gap_fix: "Before a price report is reflected in a payout, verify — decoupled from the validity of the signature, and independently through Lemma — that the signer is legitimate, uncompromised, and authorized for this scope, and that the data is authentic and satisfies its plausibility bounds (timestamp consistency, acceptable price range), and prevent it up front."
---

## 1. TL;DR

On 2026-07-15, Ostium — a decentralized exchange offering real-world-asset (RWA) perpetual futures on Arbitrum — lost up to roughly $18 million (USDC) in an attack that turned its own price-feed infrastructure against it. The attacker compromised a single oracle signer key and submitted price reports carrying future-dated timestamps. The protocol verified those signatures correctly — the signatures were valid — but what it verified was "is the signature correct," not "is that signer legitimate and uncompromised" or "is that price data authentic and plausible." Through delegated actions the attacker ran roughly 20 loop trades, manufacturing fictitious profits without ever taking on real market risk, and drew payouts from the public liquidity vault (the OLP vault). The amount drained ranges from the roughly $18 million confirmed by a co-founder to as much as roughly $24 million in some reports. The event lasted about five minutes, from 14:18 to 14:23 UTC; the security firm Blockaid detected it while it was in progress, and Ostium grasped what was happening within minutes and halted trading within an hour. What was missing is a layer that, decoupled from the validity of the signature, independently establishes the legitimacy of the signer and the authenticity and plausibility of the data before a payout is finalized.

---

## 2. What happened

- **Subject**: Ostium, a decentralized exchange offering RWA-linked perpetual futures on Arbitrum. What was affected was the public liquidity vault (the Ostium Liquidity Provider vault, OLP).
- **Date and time**: 2026-07-15, roughly five minutes from 14:18 to 14:23 UTC. Co-founder Kaledora Kiernan-Linn confirmed the time window and the impact on the OLP.
- **Method**: the attacker compromised an oracle signer key. They submitted price reports with future-dated timestamps, making losing trades appear to be winning trades. Through delegated actions they ran roughly 20 loop trades, manufacturing fictitious profits without taking on real market exposure, and drew payouts from the vault.
- **Scale of the drain**: figures range by source, from the roughly $18 million (USDC) confirmed by a co-founder to as much as roughly $24 million in some reports. The roughly $18 million corresponds to about 28% of the protocol's TVL (roughly $63 million).
- **Detection and response**: the blockchain security firm Blockaid detected the attack while it was in progress. Ostium grasped what was happening within minutes and halted trading within an hour. It is coordinating with law enforcement, SEAL 911, and third-party security experts.

The incident came together as the following chain.

1. **Compromise of the oracle signer key**: the attacker compromises the signer key of the oracle used to supply Ostium's prices. How the key was compromised (leak, theft, custody failure, etc.) is not officially established.
2. **Submission of future-dated data**: with the compromised key, the attacker signs and submits price reports carrying future-dated timestamps. The signatures are valid and pass the protocol's signature verification.
3. **Generation of fictitious profits**: by getting ahead of future prices, the attacker makes losing trades appear to be winning trades. Through delegated actions they run roughly 20 loop trades, piling up fictitious profits without taking on real market risk.
4. **Payout from the vault**: payouts against the fictitious profits are drawn from the public liquidity vault (OLP). In about five minutes, up to roughly $18–24 million is drained.

---

## 3. Timeline — disclosure and response

- 2026-07-15 14:18–14:23 UTC: the attack occurs. Within a roughly five-minute window, some 20 loop trades using future-dated price reports are executed, and payouts are drawn from the OLP vault.
- 2026-07-15: Blockaid detects and flags the in-progress attack. Ostium grasps it within minutes and halts all trading within an hour.
- 2026-07-15 to 16: a co-founder confirms the time window and the OLP impact, and states that it is coordinating with law enforcement, SEAL 911, and third-party experts. However, the confirmed total loss, the root cause (how the key was compromised), the final post-mortem, and any compensation plan are unpublished as of this point.

> Note: the technical facts are based on Blockaid's detection, confirmation by an Ostium co-founder, and reporting by established media (CoinDesk, Decrypt, and others). The loss figure ranges by source from roughly $18 million to as much as roughly $24 million, and the root cause — including how the signer key was compromised — awaits the official post-mortem as of this writing. Consult the latest primary sources.

The response and industry movement after disclosure:

- **Ostium's response**: grasped the attack within minutes and halted all trading within an hour. A co-founder confirmed the time window of the event (14:18–14:23 UTC) and the impact on the OLP vault, and stated that it is coordinating with law enforcement, SEAL 911, and third-party security experts. However, the confirmed total loss, the root cause of the key compromise, the final post-mortem, and any compensation plan are unpublished as of this writing.
- **Detection (Blockaid)**: the blockchain security firm Blockaid detected and flagged the attack while it was in progress, leading to the halt of trading.
- **Cross-industry point**: this case sits within the continuing 2026 line of DeFi attacks originating from oracles and signer keys. Even when the cryptographic verification (signature, proof) itself functions, unless the legitimacy of the signer and the authenticity of the external data that the verification presupposes are independently confirmed, a fake input carrying a valid signature can connect directly to the payout of assets. The need for a layer that, in addition to verifying the signature, independently verifies the legitimacy of the signer and the plausibility of the data before payout is coming to be shared across the industry.

The absence of a layer that verifies, at the moment of payout, the legitimacy of the signer and the authenticity of external data — independently of the validity of the signature — is not a problem of a specific protocol, but remains a cross-protocol operational challenge for protocols that rely on external oracles.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the protocol's trust was established by "is the price report correctly signed," not by "is that signer legitimate and uncompromised" or "is that data authentic and plausible."** The signatures were valid. What went unverified was the layer one step above the signature — the legitimacy of the signer and the authenticity of the data.

This incident is a direct descendant of [Brief No.074](/critical/briefs/074-taiko-bridge-prover-key-leak/) ([Taiko bridge](/critical/briefs/074-taiko-bridge-prover-key-leak/), where the proof was verified correctly but the leak of a signer key let a fake withdrawal pass as "valid"). In both, cryptographic verification (signature, proof) functioned correctly, but the "legitimacy of the signer or prover" that the verification presupposes was not independently confirmed. This case repeats that on the price-oracle surface. It connects to [Brief No.067](/critical/briefs/067-syscoin-bridge-spv-proof-parsing/) ([Syscoin bridge](/critical/briefs/067-syscoin-bridge-spv-proof-parsing/), where a fake proof was interpreted as "valid") and [Brief No.001](/critical/briefs/001-kelpdao-rseth/) ([KelpDAO / rsETH](/critical/briefs/001-kelpdao-rseth/), where the RPC of the observation layer was tampered with and a trusted input was faked) through the structure in which the authenticity of the external input a protocol relies on is not independently verified. It shares with [Brief No.045](/critical/briefs/045-humanity-protocol-multisig-key-custody/) ([Humanity Protocol](/critical/briefs/045-humanity-protocol-multisig-key-custody/), where the keys on a single laptop alone exceeded the threshold) the point that the custody and legitimacy of keys becomes a single point of failure for asset movement. It is adjacent to [Brief No.023](/critical/briefs/023-alephium-tokenbridge/) ([Alephium](/critical/briefs/023-alephium-tokenbridge/)) and [Brief No.016](/critical/briefs/016-verus-ethereum-bridge/) ([Verus-Ethereum](/critical/briefs/016-verus-ethereum-bridge/)) in that inputs that passed valid verification were faked on the surface of input-output consistency.

What is specific to this incident is that the attack **turned the protocol's own price-feed infrastructure against it, and moreover the verification layer never asked about the plausibility of "future prices" — data that should not exist even when the signature is valid.** Signature verification answered "is this report from a registered signer," but it did not answer "is this signer legitimate and uncompromised right now" or "are this timestamp and price plausible." The shared primitive is the same: **the validity of a signature is independent of the legitimacy of the signer and the authenticity of the data.**

The detection-and-response sequence — Blockaid's in-progress detection, Ostium's rapid halt of trading (grasped within minutes, halted within an hour), and coordination with law enforcement, SEAL 911, and third-party experts — is indispensable to containing the spread of harm, and this Brief does not deny that role. On-chain anomaly monitoring played a part here too in confining the loss to about five minutes. Detection does play its part.

At the same time, detection does not provide material to independently establish — **at the moment that payout is finalized** — whether the price report about to be accepted is authentic data from a legitimate, uncompromised signer, or future-dated fake data signed with a compromised key. The fake report carries a valid signature and passes signature verification correctly. On-chain monitoring detected the trades only after they began producing anomalous results; it did not prove the authenticity of the input before that input was connected to a payout. As material for an audit to establish "was this payout from the vault based on authentic price data whose provenance was verified?", the single fact "it is a report from a registered signer that passed signature verification" is not an independent trail of the data's authenticity and the signer's legitimacy. This is a gap in a structurally independent layer, outside the reach of the detection layer.

---

## 5. What proof would have changed

Pre-action attestation fills this gap by inserting a proof of provenance and signer legitimacy one step into the path by which external data is connected to a payout. Before a price report is reflected in a payout, it verifies — decoupled from the validity of the signature — "is this signer legitimate and uncompromised right now, and authorized for this scope?" and "is this data authentic and does it satisfy the plausibility bounds (timestamp consistency, acceptable price range)?", and it blocks the payout up front when no proof accompanies it. Pre-action attestation is a **complement** to detection, not a substitute, and the combination of the two layers establishes the trust boundary of an oracle-dependent protocol.

Against the detection–proof gap this event exposed (a valid signature accompanying a compromised signer and future-dated fake data), Lemma proposes a design that requires the legitimacy of the signer and the authenticity of the data — verifiable as cryptographic proof independent of the validity of the signature — before external data is connected to a payout.

- **Pre-action proof of signer legitimacy (proof-as-auth)**: before a price report is reflected in a payout, prove — decoupled from the validity of the signature — that "this signer is legitimate and uncompromised right now, and authorized for this scope." Do not make "it is signed with a registered key" the terminus of acceptance.
- **Verification of data provenance and plausibility bounds**: before reflecting the data being accepted, verify that it has authentic provenance and satisfies the plausibility bounds (timestamp consistency, acceptable price range). Exclude up front inputs that should not exist even when the signature is valid, such as future-dated ones or those diverging from the market.
- **Eliminating single-key dependence**: do not reduce the legitimacy of the signer to the possession of a single key; replace authorization with an independently verifiable proof so that a key compromise does not translate straight into the forgery of a valid signature.
- **Selective disclosure**: disclose at minimum only "this input satisfies the provenance and plausibility requirements," keeping internal signer keys and credentials out of the environment.

With this, a proof fixed at the moment of payout serves as an independently verifiable trail of "is this signer legitimate?" and "is this data authentic and plausible?", before an external input is reflected in asset movement. Detection (after-the-fact on-chain anomaly monitoring and halting of trading) works on containment after discovery; pre-action attestation (pre-reflection verification of the signer and the data) works on the independent verification of oracle inputs — the two work complementarily.

---

## 6. Sources

- **CoinDesk (primary reporting)**: "Ostium loses $18 million in oracle attack that gamed its own price-feed infrastructure" (2026-07-15) — <https://www.coindesk.com/business/2026/07/15/ostium-suffers-usd18-million-exploit-as-oracle-attack-wave-continues-to-hit-defi>
- **crypto.news (Blockaid detection)**: "Blockaid uncovers $18M exploit that forces Ostium halt" (2026-07-15) — <https://crypto.news/blockaid-uncovers-18m-exploit-that-forces-ostium-halt/>
- **Decrypt**: "Another DeFi Exploit: Perp DEX Ostium Loses $18 Million in Oracle Attack" (2026-07-15) — <https://decrypt.co/373566/defi-exploit-ostium-oracle-hack>
- **The Defiant**: "Ostium Halts Trading After Oracle Exploit Drains up to $18M from Vault" (2026-07) — <https://thedefiant.io/news/hacks/ostium-halts-trading-after-oracle-exploit-drains-up-to-usd18m-from-vault>
- **CryptoSlate (method explainer)**: "How prices from the future fooled a crypto oracle into paying out up to $24 million" (2026-07) — <https://cryptoslate.com/how-prices-from-the-future-fooled-a-crypto-oracle-into-paying-out-up-to-24-million/>
