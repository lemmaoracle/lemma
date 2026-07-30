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
gap_detected: "Post-incident monitoring narrowed down the shape of the damage and helped identify the affected scope."
gap_missing: "Because both the signing key and the procedure were legitimate, there was no layer to confirm whether the signed data itself was genuine before approval, so tampered input received a valid approval."
gap_fix: "Before moving assets, independently verify with Lemma that the message comes from a legitimate origin, and prevent it up front."
---

## 1. TL;DR

On KelpDAO / rsETH, LayerZero Labs' internal RPC nodes were manipulated so the DVN signed forged observations, unlocking 116,500 rsETH (approx. ¥46B). The signing keys were never stolen; only the observation-layer inputs the approval relied on were swapped. Because the signature and process were legitimate, detection that watches for anomalous key use is unlikely to fire. What was missing was a layer to independently verify those inputs before approval — detection and pre-execution attestation are complements, not substitutes.

---

## 2. What happened

- **Impact**: 116,500 rsETH ($292M, approx. ¥46B) unauthorizedly unlocked
- **Target protocol**: KelpDAO (rsETH liquid restaking)
- **Underlying infrastructure**: Cross-chain messaging via LayerZero v2
- **Detection**: 2026-04-18
- **Attack origin (per LayerZero Labs' disclosure)**: Intrusion into the LayerZero Labs operations environment (during the 2026-03 timeframe; a social-engineering vector has been cited)
- **Manipulated assets**: LayerZero Labs' internal RPC cloud environment (multiple internal RPC nodes)
- **Assets NOT compromised**: The LayerZero Labs DVN signing keys themselves
- **Official disclosures**: The LayerZero Labs incident statement and the May follow-up update. These name the observation layer as an independent category, and announce that the LayerZero Labs DVN will refuse 1-of-1 signing configurations and that the v2 default will move to 3-of-3

The attack came together as the following chain, per LayerZero Labs' disclosure.

1. **Initial compromise**: Intrusion into the LayerZero Labs operations environment (a social-engineering vector is cited as the entry point)
2. **Lateral movement**: The intruder manipulates internal RPC nodes inside the LayerZero Labs RPC cloud environment
3. **Detection evasion (split observation surface)**: The manipulated internal RPC nodes return normal responses to monitoring tools while returning manipulated responses to the LayerZero Labs DVN signing service — a two-faced configuration
4. **Quorum coerced via DoS**: A DoS against external RPC providers eventually pushed the DVN signing service into a state where it referenced only the compromised internal RPC nodes (failover converged onto the poisoned RPC path)
5. **Legitimate signature over manipulated data**: The DVN runs its normal signing process over the manipulated data. The signing keys themselves are not under attack, but because the input data being signed has been forged, the result is a valid attestation over a fraudulent message
6. **Impact realization**: Under the 1-of-1 single-DVN configuration, this single attestation carries approval authority on the KelpDAO side, and 116,500 rsETH is realized as an unauthorized unlock

---

## 3. Timeline — disclosure and response

- 2026-03 (per LayerZero Labs' disclosure, estimated): The period in which intrusion into the LayerZero Labs operations environment, originating from a social-engineering vector, is cited
- 2026-04-18: 116,500 rsETH on KelpDAO unauthorizedly unlocked
- Around 2026-04-22: Industry incident response begins
- 2026-05: LayerZero Labs publishes its incident statement and follow-up update. Announces the observation layer as an independent category, the LayerZero Labs DVN's refusal of 1-of-1 configurations, and a default move to ≥3-of-3

LayerZero Labs' published response (as of the 2026-05 incident statement):

- The LayerZero Labs DVN will, going forward, refuse to sign under a 1-of-1 configuration
- The LayerZero v2 default moves to ≥3-of-3 DVN configurations
- Full rebuild of the cloud environment, short-lived credentials, multi-person review for IAM changes
- Independent RPC source quorum mandated; redundancy across RPC providers, hosting environments, and regions
- Over four weeks, hands-on security-posture hardening was provided to several hundred industry partners, with further engagement planned

> Note: Names, dates, and loss figures are based on primary sources — the official LayerZero Labs incident statement and the independent analyses (Chainalysis, Halborn, Galaxy Research, etc.). Each implementation's remediation status varies over time, so consult the latest information.

---

## 4. Why it wasn't stopped

The failure here is neither signing-key management nor detection accuracy. **The observation-layer inputs a cross-chain bridge's verifier relies on to determine message origin had no layer of independent verification.** The RPC responses the LayerZero Labs DVN reads were left in a state where a single entity — the RPC nodes inside the compromised operations environment — could manipulate them.

Detection worked — post-incident monitoring narrowed the blast window and helped scope the impact. What didn't work sits in front of it. The signing keys were not compromised and the signing process was legitimate, so the typical detection observation points (anomalous key use, signing-service misbehavior) see nothing. A "99.7% anomalous" confidence score is unlikely to fire when a legitimate process signs manipulated inputs. This is not a deficiency of the detection tools; it means the layer that independently confirms "is the data being signed genuine?" before approval was missing — between detection and proof (establishing in regulatory filings, administrative proceedings, or litigation that an unauthorized authority was exercised).

The adjacent case of the same structure is the May **Stake DAO vsdCRV unauthorized mint** (Brief 002). What they share is a cross-chain bridge whose trust configuration sits under a single entity's control; this incident reached that structure via RPC manipulation of the DVN observation layer, the Stake DAO incident via direct rewriting of the trust source with a deployer private key.

In its incident statement, LayerZero Labs positioned this structure as an independent operational category — the observation layer. Hardening it (quorum, redundancy, human review) and embedding independently verifiable cryptographic proof into the message itself are complementary, not opposing, approaches.

---

## 5. What proof would have changed

Pre-execution attestation is in a **complementary**, not competing, relationship with detection. By committing message origin in an independently verifiable form before a transaction, a two-stage configuration of detection + pre-execution attestation can establish the trust boundary. Even when the observation layer has been manipulated, an origin proof embedded in the message can tell the verifier through a separate channel whether the message came from a legitimate origin or not.

Lemma's design answers this incident's gap — absent independent verification of observation-layer inputs — by embedding origin proof in the message itself and decoupling the accept decision from the observation layer.

- **Origin provenance binding**: The cross-chain message itself carries an independently verifiable cryptographic proof that it "came from a legitimate origin," so the verifier can verify origin without relying on RPC responses or config assertions.
- **Proof-as-auth before the action**: The proof is verified before assets move, establishing the trust boundary ahead of acceptance rather than through after-the-fact anomaly detection.
- **Independence from the observation layer**: Even when the observation layer has been manipulated, the proof tells the verifier through a separate channel whether the message came from a legitimate origin or not.
- **Complement to detection**: The blast window that detection narrowed and the prior origin guarantee the proof provides function as a two-stage configuration, not opposing approaches.

This is the design philosophy of "cryptographically valid ≠ provenance correct" — the core of the verifiable-origin category — and it complements, rather than replaces, the detection layer.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05). For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 6. Sources

- **Chainalysis blog**: "KelpDAO Bridge Exploit, April 2026" (independent analysis by a leading blockchain analytics firm, including on-chain traces) — https://www.chainalysis.com/blog/kelpdao-bridge-exploit-april-2026/
- **Halborn blog**: "Explained: The Kelp DAO Hack, April 2026" (technical analysis by a security audit firm, independent breakdown of the attack path) — https://www.halborn.com/blog/post/explained-the-kelp-dao-hack-april-2026
- **Galaxy Research analytical brief**: "KelpDAO LayerZero Exploit — DeFi Insights" (independent analysis) — https://www.galaxy.com/insights/research/kelpdao-layerzero-exploit-defi
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>
