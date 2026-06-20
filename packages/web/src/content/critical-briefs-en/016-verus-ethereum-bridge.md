---
brief_no: 16
title: "Verus-Ethereum ブリッジ $11.58M 流出 — Merkle Proof は有効でも、入出力額の整合が検証されなかった"
title_en: "The Verus-Ethereum Bridge Hack ($11.58M) — A Valid Merkle Proof, But No Verification That the Source Amount Matched the Payout"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-18
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth", "002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "Merkle Proof は有効でも入出力額の整合が未検証 — Verus-Ethereum ブリッジ $11.58M"
og_lead_en: "Valid Merkle proof but no verification of source-vs-payout amount — Verus-Ethereum bridge ($11.58M)"
gap_detected: "Post-incident technical analysis and negotiation with the attacker recovered about 75% of the stolen funds (roughly 4,052 ETH)."
gap_missing: "All the cryptographic proofs of the transfer data were valid so verification passed, but the check confirming that the deposit and payout amounts matched was missing before payout, letting a $0.01 deposit withdraw $11.58M."
gap_fix: "Before a high-value payout, independently verify with Lemma that the payout amount matches the value actually deposited on the counterpart chain, and prevent it up front."
---

## TL;DR

In May 2026, about $11.58M was drained from the Verus-Ethereum bridge. The attacker composed a blob directing a massive payout against a $0.01-equivalent input, but its components — state root, Merkle Proof, and the rest — were all valid, so signature verification passed. Missing was a check that input matched payout, and anomaly detection firing afterward cannot stop an accepted payout. A valid Merkle Proof attests only inclusion, not that the value claim is correct. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Affected**: the Verus-Ethereum cross-chain bridge operated by the Verus Protocol
- **Loss**: approximately $11.58M (in ETH / tBTC / USDC)
- **Date**: 2026-05-18
- **Root cause**: both sides of the bridge performed their own verification, but no mandatory step verified that the source-chain input amount matched the Ethereum-side payout. The `checkCCEValues` function on the Ethereum side lacked this verification
- **Core of the abuse**: the transfer blob carried a fundamental mismatch between input and payout ($0.01-equivalent VRSC input vs. $11.58M-equivalent ETH / tBTC / USDC payout), but the blob's components (state root, related hashes, Merkle Proof) were all valid, so the Verus notary accepted and approved it
- **Analysis**: Halborn published a technical root-cause explanation
- **Aftermath**: under a negotiated bounty arrangement, the attacker returned about 75% of the proceeds (4,052.4 ETH) and kept about 1,350 ETH (~$2.8M) as a bounty
- **Context**: 2026 bridge-related exploits cumulatively reached ~$300M, per aggregate reporting

---

## 2. Timeline

- 2026-05-18: ~$11.58M drained from the Verus-Ethereum bridge. The attacker composes a massive payout against a $0.01-equivalent input
- 2026-05-18 onward: the attacker swaps the exfiltrated assets to ETH (reportedly about 5,402 ETH total). Reports describe an ongoing attack
- 2026-05-22 around: a negotiated bounty arrangement is reached. The attacker returns about 4,052.4 ETH (~75%) and keeps about 1,350 ETH as a bounty
- 2026-05 (same period): Halborn publishes a root-cause technical explanation

---

## 3. Attack Vector

1. **Composing a mismatched payload**: the attacker composes a cross-chain import payload directing an $11.58M-equivalent payout against a $0.01-equivalent VRSC input
2. **Valid cryptographic components**: the state root, hashes, and Merkle Proof corresponding to that blob are all valid. Cryptographic verification passes
3. **Missing value-integrity check**: `checkCCEValues` on the Ethereum side lacks source-amount verification, so the input/payout mismatch is not caught
4. **Acceptance by the notary**: with the blob's components valid, the Verus notary accepts and approves the payload
5. **Realization of the massive payout**: exploiting the absent integrity check, $11.58M-equivalent payout is realized against $0.01-equivalent input
6. **Asset movement**: the exfiltrated assets are swapped to ETH and other tokens. Approximately 75% is later returned under negotiation

---

## 4. Structural Argument

The incident belongs to the `bridge-config-trust` category of Pillar 01 (Verifiable Origin). The central failure primitive is that the cross-chain value claim ("source side contributed this much value for this import") was **not independently verified as the integrity of input vs. payout amount** apart from the validity of the cryptographic components (Merkle Proof and so on). A valid Merkle Proof shows "this blob is included in the state root"; it does not show "the payout amount matches the source-side input amount." `identity-auth` is noted as a secondary category.

The same `bridge-config-trust` category as Brief 001 (KelpDAO / rsETH) and Brief 002 (Stake DAO / vsdCRV), but a different primitive. Brief 001 was RPC manipulation of the DVN observation layer; Brief 002 was rewriting the trust source via the deployer key; this incident is the absent integrity check on the value claim. All three share the structure that "claims passed between chains are accepted while decoupled from a layer that independently verifies them." This case concretely illustrates the verifiable-origin category's core thesis — "cryptographically valid ≠ semantically correct" — with the extreme gap of $0.01 input → $11.58M payout.

---

## 5. The detection–proof gap

Bridge monitoring, anomaly detection, and post-hoc root-cause analysis (such as Halborn's) are indispensable for understanding impact, containment, recurrence discussion, and negotiated asset recovery. This Brief does not deny their role; about 75% was in fact recovered through post-hoc analysis and negotiation.

But detection does not change what the receiving side (the Ethereum-side contract, the notary) actually **accepts**. The blob's cryptographic components were all valid, so signature and Merkle Proof verification passed. What was missing was verification of "is the value claim semantically correct (does the input amount match the payout)?" — a separate question from cryptographic validity. Anomaly detection firing after a payout does not stop the payout that `checkCCEValues` accepted at the time. For regulatory reporting and audit, the validity of a Merkle Proof alone is not an independent evidentiary trail that "this cross-chain import was a legitimate value claim."

Pre-execution attestation takes the design choice of receiving the cross-chain value claim as an independently verifiable cryptographic proof on the receiving side, before execution, and verifying the integrity of "value actually contributed on the source side" against "payout amount." If the proof signals "input and payout amounts are inconsistent," the payout is blocked before it executes. Inclusion proofs via Merkle Proof (detection-style: "this blob exists") and pre-execution attestation of the value claim ("this payout matches the source-side input") are **complementary** rather than substitutes.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and Industry Response

- **Verus Protocol**: after the drain, reached a negotiated bounty arrangement with the attacker and received the return of about 4,052.4 ETH (~75%). The attacker retains about 1,350 ETH as a bounty
- **Halborn**: published the technical explanation of the root cause (missing source-amount verification in `checkCCEValues`) and the exploit procedure, surfacing the issue across the industry
- **Cross-industry framing**: 2026 bridge-related exploits cumulatively reached ~$300M per aggregate reporting, with attacks on cross-chain infrastructure continuing. Among bridge and lending operators, the realization re-emerged that verifying the validity of Merkle Proofs / signatures alone cannot guarantee value-claim integrity

How to independently verify the integrity of cross-chain value claims — as input/payout consistency, separate from the validity of cryptographic components — is the open question moving forward.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed here (the cross-chain value claim was not independently verified for input/payout integrity separately from the cryptographic validity of Merkle Proofs), Lemma proposes a design in which cross-chain value claims are received as independently verifiable cryptographic proofs on the receiving side, before execution, and the integrity of "value actually contributed on the source side" against "payout amount" is verified as a proof. Even if a Merkle Proof is formally valid, if the value-claim proof signals input/payout inconsistency, the payout is rejected before it executes. This is the design thinking of "cryptographically valid ≠ semantically correct" — the core of the verifiable-origin category. This incident is a case in which the failure mode anticipated by the existing reference implementation (pre-execution attestation of bridge provenance) has materialized as a recent real-world loss.

For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Halborn**: "Explained: The Verus-Ethereum Bridge Hack (May 2026)" (2026-05, root cause and exploit procedure) — https://www.halborn.com/blog/post/explained-the-verus-ethereum-bridge-hack-may-2026
- **CoinDesk**: "Verus-Ethereum bridge loses $11 million as hackers keep targeting cross-chain infrastructure" (2026-05-18) — https://www.coindesk.com/markets/2026/05/18/yet-another-crypto-bridge-falls-victim-to-an-usd11-million-hack
- **AMBCrypto**: "Verus-Ethereum bridge hack drains $11.58M - Why DeFi trust is eroding" (2026-05) — https://ambcrypto.com/verus-ethereum-bridge-hack-drains-11-58m-why-defi-trust-is-eroding/
- **Crypto Times**: "Verus Hacker Returns $8.5M After Bridge Exploit Deal" (2026-05-22, the bounty arrangement and return) — https://www.cryptotimes.io/2026/05/22/verus-hacker-returns-8-5m-after-bridge-exploit-deal/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
