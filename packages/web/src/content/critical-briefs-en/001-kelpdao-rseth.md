---
brief_no: 1
title: "KelpDAO / rsETH 不正アンロック — DVN 観測層への RPC 改ざん攻撃"
title_en: "KelpDAO / rsETH Unauthorized Unlock — RPC Manipulation Attack on the DVN Observation Layer"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-04-18
published: 2026-05-29
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "DVN 観測層への RPC 改ざんで不正アンロック — KelpDAO / rsETH"
og_lead_en: "RPC manipulation on the DVN observation layer unlocked the bridge — KelpDAO / rsETH"
---

## TL;DR

On 2026-04-18, 116,500 rsETH ($292M, approx. ¥46B) was unauthorizedly unlocked on KelpDAO's cross-chain protocol. The attack originated from intrusion into LayerZero Labs' RPC cloud environment: internal RPC nodes were manipulated so that the message observations referenced by the LayerZero Labs DVN were forged. The DVN signing keys themselves were not compromised. Under a 1-of-1 single-DVN configuration, a legitimate signature over manipulated data carried sole approval authority, and a fraudulent cross-chain message was accepted. In May 2026, LayerZero Labs published an incident statement and follow-up update, naming the observation layer as an independent operational category.

---

## 1. Incident Overview

- **Impact**: 116,500 rsETH ($292M, approx. ¥46B) unauthorizedly unlocked
- **Target protocol**: KelpDAO (rsETH liquid restaking)
- **Underlying infrastructure**: Cross-chain messaging via LayerZero v2
- **Detection**: 2026-04-18
- **Attack origin (per LayerZero Labs' disclosure)**: Intrusion into the LayerZero Labs operations environment (during the 2026-03 timeframe; a social-engineering vector has been cited)
- **Manipulated assets**: LayerZero Labs' internal RPC cloud environment (multiple internal RPC nodes)
- **Assets NOT compromised**: The LayerZero Labs DVN signing keys themselves
- **Official disclosures**: The LayerZero Labs incident statement and the May follow-up update. These name the observation layer as an independent category, and announce that the LayerZero Labs DVN will refuse 1-of-1 signing configurations and that the v2 default will move to 3-of-3

---

## 2. Timeline

- 2026-03 (per LayerZero Labs' disclosure, estimated): The period in which intrusion into the LayerZero Labs operations environment, originating from a social-engineering vector, is cited
- 2026-04-18: 116,500 rsETH on KelpDAO unauthorizedly unlocked
- Around 2026-04-22: Industry incident response begins
- 2026-05: LayerZero Labs publishes its incident statement and follow-up update. Announces the observation layer as an independent category, the LayerZero Labs DVN's refusal of 1-of-1 configurations, and a default move to ≥3-of-3

---

## 3. Attack Vector

Chain of events, per LayerZero Labs' disclosure:

1. **Initial compromise**: Intrusion into the LayerZero Labs operations environment (a social-engineering vector is cited as the entry point)
2. **Lateral movement**: The intruder manipulates internal RPC nodes inside the LayerZero Labs RPC cloud environment
3. **Detection evasion (split observation surface)**: The manipulated internal RPC nodes return normal responses to monitoring tools while returning manipulated responses to the LayerZero Labs DVN signing service — a two-faced configuration
4. **Quorum coerced via DoS**: A DoS against external RPC providers eventually pushed the DVN signing service into a state where it referenced only the compromised internal RPC nodes (failover converged onto the poisoned RPC path)
5. **Legitimate signature over manipulated data**: The DVN runs its normal signing process over the manipulated data. The signing keys themselves are not under attack, but because the input data being signed has been forged, the result is a valid attestation over a fraudulent message
6. **Impact realization**: Under the 1-of-1 single-DVN configuration, this single attestation carries approval authority on the KelpDAO side, and 116,500 rsETH is realized as an unauthorized unlock

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, on a cross-chain bridge, **the verifier had no independent means of verifying the observation layer inputs it relies on to determine message origin.** The inputs to the observation layer — the RPC responses referenced by the LayerZero Labs DVN — were left in a state where they could be manipulated by a single entity, namely the RPC nodes inside the compromised operations environment.

The adjacent case of the same structure is the May **Stake DAO vsdCRV unauthorized mint** (Brief 002). The shared structure is that the trust configuration of a cross-chain bridge sits under the control of a single entity. The difference is that this incident distorted trust by manipulating the RPC observation layer the DVN reads from, while the Stake DAO incident distorted trust by directly rewriting the LayerZero v2 trust source via a deployer private key. Both reach the same structure from different vectors.

In its incident statement, LayerZero Labs signaled its intent to treat this structure as an independent operational category — the observation layer. Hardening the observation layer (quorum, redundancy, human review) and embedding independently verifiable cryptographic proof into the message itself are not opposing approaches but complementary ones (for the latter argument, see [Bridge exploits in 2026: the case for verifiable origin proofs](https://lemma.frame00.com/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04)).

---

## 5. The detection–proof gap

In this incident, the DVN signing keys themselves were not compromised, and the signing process was legitimate. The typical observation points on the detection side (anomalous use of signing keys, misbehavior of the signing service) are difficult to fire under this structure. The attack succeeded because the input data to the observation layer was manipulated; the signing process itself operated as specified.

This incident exposed a detection–proof gap that hardening the detection layer alone cannot close. A 99.7% anomalous confidence score is unlikely to fire in a case where, as here, a legitimate process produced a legitimate signature over manipulated inputs. This is not a deficiency in the detection tools or vendors; it indicates that between detection and proof — that is, establishing in regulatory filings, administrative proceedings, or litigation that an unauthorized authority was exercised — an independent layer is required. Detection remains an important layer, and in this incident it narrowed the post-event blast window and contributed to scoping the impact.

Pre-execution attestation is in a **complementary**, not competing, relationship with detection. By committing message origin in an independently verifiable form before a transaction, a two-stage configuration of detection + pre-execution attestation can establish the trust boundary. Even when the observation layer has been manipulated, an origin proof embedded in the message can tell the verifier through a separate channel whether the message came from a legitimate origin or not (for a more detailed argument on the relationship between detection and pre-execution attestation, see [The last layer left in AI-era cyber defense](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

LayerZero Labs (as of the 2026-05 incident statement):

- The LayerZero Labs DVN will, going forward, refuse to sign under a 1-of-1 configuration
- The LayerZero v2 default moves to ≥3-of-3 DVN configurations
- Full rebuild of the cloud environment, short-lived credentials, multi-person review for IAM changes
- Independent RPC source quorum mandated; redundancy across RPC providers, hosting environments, and regions
- Over four weeks, hands-on security-posture hardening was provided to several hundred industry partners, with further engagement planned

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (no independent verification of the observation layer inputs), Lemma proposes a design that embeds an independently verifiable cryptographic proof in the cross-chain message itself, so that the verifier can verify message origin independently of the observation layer inputs (RPC responses, config assertions). Even when the observation layer has been manipulated, the proof tells the verifier through a separate channel whether the message came from a legitimate origin or not. For design details see [Bridge exploits in 2026: the case for verifiable origin proofs](https://lemma.frame00.com/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Chainalysis blog**: "KelpDAO Bridge Exploit, April 2026" (independent analysis by a leading blockchain analytics firm, including on-chain traces) — https://www.chainalysis.com/blog/kelpdao-bridge-exploit-april-2026/
- **Halborn blog**: "Explained: The Kelp DAO Hack, April 2026" (technical analysis by a security audit firm, independent breakdown of the attack path) — https://www.halborn.com/blog/post/explained-the-kelp-dao-hack-april-2026
- **Galaxy Research analytical brief**: "KelpDAO LayerZero Exploit — DeFi Insights" (independent analysis) — https://www.galaxy.com/insights/research/kelpdao-layerzero-exploit-defi

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
