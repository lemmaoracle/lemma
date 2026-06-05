---
brief_no: 23
title: "Alephium TokenBridge で約 81.5 万ドル流出 — guardian の鍵は無事でも、署名対象のイベントの来歴が検証されなかった"
title_en: "The Alephium TokenBridge Exploit ($815K) — Guardian Keys Intact, But No Verification of the Provenance of the Events They Signed"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-30
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth", "002-stakedao-vsdcrv", "016-verus-ethereum-bridge"]
version: "1.0"
status: published
og_lead_ja: "guardian の鍵は無事でも、署名対象のイベントの来歴が検証されなかった — Alephium TokenBridge $815K 流出"
og_lead_en: "Guardian keys intact — but the provenance of the events they signed was never verified — Alephium TokenBridge $815K exploit"
---

## TL;DR

On 2026-05-30, Alephium's TokenBridge — a Wormhole fork — was exploited on both the Ethereum and BNB Chain sides. Approximately $815K in assets were drained, and 13.757 million wALPH were minted unbacked. The guardians' private keys were not compromised; no smart-contract bug was exploited. The attacker deployed a contract that emitted forged Wormhole messages via the LOG7 instruction, then exploited an off-chain vulnerability in the bridge backend to cause the guardians to "observe" and sign the forged events. The guardian signatures were valid; the VAAs were formally valid — but the events the guardians signed originated from the attacker's contract. The main drain completed in roughly 64 seconds. This incident is the most recent representative case in Pillar 01 (Verifiable Origin) `bridge-config-trust` illustrating that **signature validity and event provenance are separate concerns.** Together with Brief 001 (injecting forged data into the observation layer) and Brief 016 (valid Proofs with unverified value integrity), it forms the third failure primitive in the bridge trust layer.

Signature valid ≠ provenance verifiable

---

## 1. Incident Overview

- **Target**: Alephium TokenBridge (Wormhole fork, Ethereum / BNB Chain ↔ Alephium)
- **Loss**: approx. $815K (USDT / USDC / WETH / WBTC / WBNB) + 13.757M wALPH minted unbacked
- **Date**: 2026-05-30 (main drain 09:16:59–09:18:02 UTC, approx. 64 seconds)
- **Root cause**: per Alephium's post-incident statement, "an off-chain vulnerability in the bridge backend that could be triggered under specific edge cases." Neither guardian key compromise nor a smart-contract bug
- **Core exploitation**: a contract deployed by the attacker emitted forged Wormhole messages via the LOG7 instruction; the guardians observed and signed them as legitimate events. Six forged VAAs were used to execute `completeTransfer(bytes)`
- **Structural context**: the Alephium fork's guardian set is 4 nodes with quorum 3 (Wormhole proper: 19 nodes, quorum 13). The number of guardians that need to be made to observe forged events is structurally smaller
- **Detection**: Blockaid first detected and disclosed on May 30. SEAL 911 assisted the investigation
- **Aftermath**: on June 2, approx. 96.4% of unbacked wALPH (13.257M) was burned via a governance upgrade function. Roughly 500K wALPH had already entered liquidity pools before the burn and were unrecoverable. The bridge is paused; a compensation plan and full technical postmortem are forthcoming

---

## 2. Timeline

(All times 2026-05-30 UTC, based on Alephium's official on-chain report)

- 02:36:23: Attacker purchased 485.19 wALPH via Uniswap Universal Router on Ethereum, using 0.01 ETH
- After 02:36: Moved wALPH to the Alephium chain via the legitimate bridge procedure (Ethereum-side burn → Alephium-side mint). Split ALPH into 5 / 150 / 130 and sent to a deployer wallet
- 06:30:47: Deployed a single-function contract that emits forged Wormhole messages via LOG7
- 07:00–09:00: A connectivity failure hit the bridge network, causing the system to switch to backup verification
- 09:16:59: Main attack began. 200,967.31 USDT drained on the Ethereum side
- 09:17:23–09:17:47: 0.335 WBTC, 17,594.63 USDC, 5.18 WETH drained sequentially
- 09:17:59: 13.757M wALPH minted unbacked
- ~09:18:02: BNB Chain side drained — 36,750.106 USDT + 24.39 WBNB (approx. 3 seconds after the Ethereum side completed)
- Same day: Blockaid detected and disclosed the attack. Initial reporting described it as "guardian key compromise," but both Alephium and Blockaid subsequently retracted that and corrected to "observation and signing of forged events"
- After May 30: Stolen assets were aggregated into ETH via Uniswap X / PancakeSwap / deBridge; a portion was mixed through Tornado Cash
- 06-02: 13.257M unbacked wALPH (approx. 96.4%) in attacker wallets burned via the `upgrade(bytes encodedVM)` governance function
- 06-03: Alephium published a complete on-chain breakdown. Compensation plan and technical postmortem to follow

---

## 3. Attack Vector

1. **Preparation as a legitimate user**: the attacker acquired wALPH from 0.01 ETH and moved it to the Alephium side via the legitimate bridge procedure. Nothing at this stage would trigger any check
2. **Installation of forged event source**: deployed a contract that emits Wormhole-format forged messages via the LOG7 instruction. The "format" of the event is indistinguishable from a legitimate one
3. **Backend degraded state**: the 07:00–09:00 connectivity failure caused the bridge system to switch to backup verification. Alephium's "specific edge case" is presumed to lie in this degraded path
4. **Guardian observation and signing**: the forged events were observed by the guardians as legitimate events, and quorum 3/4 signatures were achieved. Six forged VAAs were issued
5. **Execution of `completeTransfer`**: the formally valid VAAs were used to execute asset payouts on both Ethereum and BNB Chain, plus unbacked minting — all in roughly 64 seconds
6. **Laundering**: DEX swaps, cross-chain bridges, and Tornado Cash were combined to disperse and obfuscate the assets

---

## 4. Structural Argument

This incident belongs to the `bridge-config-trust` category of Pillar 01 (Verifiable Origin). The central failure primitive is that the guardian signature proves only "this event was observed" — it does not independently verify, as a precondition to signing, **which contract emitted the observed event and through which legitimate path.** `identity-auth` is noted as secondary.

Brief 001 (KelpDAO / rsETH), Brief 002 (Stake DAO / vsdCRV), and Brief 016 (Verus-Ethereum) share the same `bridge-config-trust` category but differ in primitive. Brief 001 injected forged data into the DVN observation layer (RPC manipulation); Brief 002 rewrote the trust source itself via the deployer key; Brief 016 passed cryptographically valid Proofs behind which value integrity was unverified; this incident involves **the observation target event itself being forged before the signers.** All four share the root structure: "claims passed between chains are accepted while decoupled from a layer that independently verifies them."

The contrast with Brief 001 is especially important. In Brief 001, the attacker DDoSed external nodes to force the observation system into a single point of failure. In this incident, the 07:00–09:00 connectivity failure likewise triggered a switch to backup verification — the same pattern of **the observation layer's trust collapsing at the moment the verification system degrades.** Additionally, a guardian set of 4 nodes with quorum 3 means, structurally, that a single backend bug needs to persuade fewer signers than Wormhole proper (19 nodes, quorum 13) — a textbook case of a fork not inheriting the upstream security assumptions.

---

## 5. The Structural Gap Detection Cannot Close

Blockaid's real-time detection and SEAL 911's investigation support were indispensable for damage assessment, bridge shutdown, unbacked-token burn, and fund tracing, and this Brief does not dispute their role. In this incident, detection-to-burn (96.4%) was achieved in three days.

Detection, however, does not change which events the guardians sign. In this incident, the guardian keys were intact, the signing process functioned normally, and the VAA format verification passed. What was absent was verification of the provenance of the event being signed — whether the event originated from a legitimate contract via a legitimate path — and this is separate from signature-validity verification. By the time detection fired, the main drain (64 seconds) was already complete, and roughly 500K wALPH had entered liquidity pools before the burn. For regulatory reporting and audit, the validity of a guardian signature alone does not, on its own, serve as an independent trail of event provenance.

Pre-execution attestation adopts a design that requires, before the guardian signs, an independently verifiable cryptographic proof of the observed event's emitter, path, and integrity. If the proof reports that "this event's source is not a registered legitimate contract," signing is blocked before it occurs. Signature-validity verification ("this guardian signed") and event-provenance pre-execution attestation ("the target of the signature arrived from a legitimate source") are not substitutes but **complements** (for the thesis on detection and pre-execution attestation, see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Response

- **Alephium**: paused the bridge on the day of the attack; burned 96.4% of unbacked wALPH on June 2 via governance upgrade; published a complete on-chain breakdown on June 3 and announced a compensation plan, a technical postmortem, and a restart timeline after an external security review. The root cause was identified as "an off-chain vulnerability in the bridge backend," and the vulnerability was stated to be fixed
- **Blockaid**: handled the initial detection and disclosure, and subsequently corrected the initial "guardian key compromise" framing to "observation and signing of forged events" after further forensics. The divergence between initial reporting and the confirmed cause illustrated that bridge-incident root-cause determination requires investigation of both on-chain data and off-chain systems
- **Cross-industry point**: bridge-related exploits in 2026 reportedly reached a cumulative $340M across 14 incidents, and the structural risk of Wormhole-architecture forks operating with smaller guardian sets than the upstream has been re-acknowledged

"How to independently verify the provenance of observed events before guardians sign them" is solidifying — through Briefs 001, 016, and now this incident — as a central design question for bridges.

---

## 7. Lemma's Analysis

For the structural gap exposed here — the validity of guardian signatures is verified, but the provenance of the events they sign is not independently verified — Lemma offers a design that verifies, before signing, the emitter and path of the events the bridge's observation layer receives, as independently verifiable cryptographic proofs. Even if a guardian signature is formally valid, if the event-provenance proof reports a forged source, signing and payout are rejected before they occur. The design philosophy of the Verifiable Origin category — "cryptographically valid ≠ provenance correct" — and its reference implementation are shown in the [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub). For the design background, see [What the 2026 Bridge Incidents Are Telling Us — On the Category of Verifiable Origin](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04).

---

## 8. Sources

- **Alephium**: "The Alephium Bridge Exploit: On-Chain Report" (2026-06-03, official on-chain breakdown, timeline, burn action) — https://alephium.org/news/post/the-alephium-bridge-exploit-on-chain-report/
- **The Defiant**: "Alephium Bridge Loses $815K to Forged Guardian Messages, Not Stolen Keys" (2026-05/06, cause-correction narrative, guardian-set comparison) — https://thedefiant.io/news/hacks/alephium-bridge-815k-forged-guardian-messages
- **The Crypto Times**: "Bridge Breach Unpacked: Alephium Traces $815K Hack Step by Step" (2026-06-03, detailed breakdown of the on-chain report) — https://www.cryptotimes.io/2026/06/03/bridge-breach-unpacked-alephium-traces-815k-hack-step-by-step/
- **AMBCrypto**: "$815K gone in 7 minutes – Inside Ethereum's Alephium TokenBridge exploit" (2026-05/06) — https://ambcrypto.com/815k-gone-in-7-minutes-inside-ethereums-alephium-tokenbridge-exploit/

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.