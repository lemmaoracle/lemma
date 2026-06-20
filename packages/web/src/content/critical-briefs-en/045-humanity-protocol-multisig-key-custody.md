---
brief_no: 45
title: "1 台のラップトップにあった鍵だけでマルチシグ閾値を超え、資金が流出した — 分散していたはずのマルチシグ承認が、単一の保管点の侵害で崩れた構造"
title_en: "When One Laptop Meets the Multisig Threshold — Distributed Approval Collapses to a Single Custody Point (Humanity Protocol)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-08
published: 2026-06-11
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["002-stakedao-vsdcrv", "001-kelpdao-rseth", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "1 台の端末から奪われた鍵がマルチシグ閾値を突破 — Humanity Protocol"
og_lead_en: "Keys stolen from one device clear the multisig threshold — Humanity Protocol"
gap_detected: "On-chain analysis, investigators' scrutiny of attribution, and response from exchanges and security firms made the fund movements and the structure of the breach externally visible."
gap_missing: "At the point of execution there was no layer to confirm whether the threshold-meeting set of signatures was an intentional approval by separate legitimate subjects, so formally meeting the threshold alone became the basis for execution."
gap_fix: "Before executing a fund movement or contract change, independently verify with Lemma that the approval is authorized by separate legitimate subjects at this scope, and prevent it up front."
---

## TL;DR

At Humanity Protocol, one developer's malware-infected laptop was enough for the seven private keys co-located on that device to be stolen at once, clearing the multisig threshold and draining over $32M. Onchain analysis, attribution scrutiny, and exchange response act only after funds move — after-the-fact detection. (This Brief makes no attribution.) What is structurally missing is a layer that verifies, at execution, whether the threshold-meeting signatures are a deliberate approval by separate legitimate parties; the threshold alone sufficed. Detection and pre-execution attestation of origin and authorization are complements, not substitutes.

---

## 1. Incident overview

- **The event**: On 2026-06-08 to 09, funds were drained from wallets associated with Humanity Protocol. Losses exceeded $32 million (reported as $32–36M), with roughly 17 wallets emptied.
- **Intrusion path (official account)**: According to founder Terence Kwok, the private keys of wallets managed by foundation members were compromised. The starting point was a malware infection on a developer's work laptop, from which seven valid private keys stored on a single device were stolen.
- **Clearing the threshold**: The stolen keys single-handedly met the approval thresholds of the Gnosis Safe on Ethereum (3 of 6) and on BNB Smart Chain (3 of 5). The attacker seized ProxyAdmin control.
- **What was lost**: 141.2M H was drained from the Ethereum bridge. A malicious contract upgrade minted over 100M new H (the mint chain varies across reports). H fell from about $0.70 to briefly $0.05 — an 80–90% drop within hours.
- **Attribution held open**: Onchain investigator ZachXBT noted the incident may have been staged. Whether it was an external attack or an inside job is unconfirmed, and this Brief does not assert one.
- **Response**: The project urged users to pause use of the cross-chain bridge and liquidity pools, and said it was working with security firms and exchanges.

---

## 2. Timeline

- 2026-06-08: A developer's work laptop is infected with malware; seven private keys are reportedly stolen from a single device.
- 2026-06-08 to 09: Funds are drained across Ethereum and BSC. ProxyAdmin is seized, the bridge is drained, and new tokens are minted via a malicious upgrade.
- 2026-06-09: The H token falls more than 80% within hours (briefly near $0.05). Roughly 17 wallets are emptied.
- Around 2026-06-09: The founder states the private keys were compromised. ZachXBT flags a possible staged incident. The project urges pausing the bridge and liquidity pools.

> Note: The total loss, the amount minted, and attribution (external attack vs. inside job) depend on the progress of the investigation, so this text gives ranges and asserts none of them.

---

## 3. The path from key compromise to fund movement

This incident stems from a structure in which the independence of distributed approval is never verified before execution. The path by which the failure propagates into a fund drain is as follows.

1. **The premise of approval**: A multisig (M-of-N) is built on the premise that funds move and contracts change only once approvals from a threshold number of independent key holders are gathered.
2. **Custody collapses to a point**: In reality, a threshold number of keys lived together on a single device / custody point. Approval authority that was supposed to be distributed was in a state where it could be seized all at once by compromising a single point.
3. **Formal satisfaction of the threshold**: When the stolen keys produce the required signatures, from the onchain vantage point a "legitimately threshold-met approval" is established. Whether each signature is a deliberate approval by a separate legitimate party is not independently verified at the moment of execution.
4. **Seizing authority and executing**: Holding ProxyAdmin, the attacker exercised the highest-level authority — a contract upgrade — in addition to withdrawing from the bridge, and even executed minting.
5. **Impact is fixed**: Once the drain and the minting are confirmed, the result is a token-price collapse, a pause of the bridge and pools, and exchange response — requiring a review of the entire prior approval structure (key custody and threshold design).

---

## 4. Structural analysis

This incident belongs to the `bridge-config-trust` category of Pillar 01 (Verifiable Origin). The central failure primitive is that **M-of-N distributed approval flows straight into execution on the formal satisfaction of the threshold alone, without independently proving each signature to be "a deliberate approval of this operation by a separate legitimate party."** If a threshold number of keys has collapsed onto a single custody point, whoever compromises that one point (or seizes it from the inside) can establish a "legitimate multi-party approval" all at once. We note `identity-auth` (authentication of the independence of the approving parties) as a secondary category.

Brief 002 (rewriting trust configuration with the deployer key), Brief 001 (tampering with KelpDAO's observation layer), Brief 023 (the guardian's key is intact, but the provenance of the signed event is unverified), and Brief 016 (the Merkle proof is valid, but the consistency of input/output amounts is unverified) differ in their subjects, but the shared primitive is the same: **the formal establishment of some approval or proof is decoupled from the layer that verifies the legitimacy behind it (who, what, with which authority).** What is distinctive here is that this gap occurred inside the very safety mechanism called "distributed approval." And whether attribution is an external attack or an inside job, the gap is the same: in an external attack, one compromised device collapses the threshold; in an inside job, the fact that the threshold does not guarantee independent agency is what gets exploited.

---

## 5. The gap between detection and proof

In this incident, the detection chain — onchain analysis (The Block and others), an investigator re-examining attribution (ZachXBT), and the response of exchanges and security firms — functioned, and the movement of funds and the structure were made visible from the outside. This is a typical success of detection, and this Brief does not negate the role of the detection layer. Detection is indispensable for tracing the drain, scrutinizing attribution, and identifying the scope of post-discovery remediation.

At the same time, detection provides no material to independently establish — **at the moment the approval executes** — whether the signatures that just met the threshold are a deliberate approval by separate legitimate parties. From onchain, it looks only like "a legitimately threshold-met approval"; whether the keys had collapsed onto a single custody point, and whether the signing parties were independent, can only be learned through after-the-fact offchain investigation. The price collapse and the exchange response, too, are after-the-fact chains that act once funds have moved. This is a structurally independent layer gap, outside the reach of the detection layer.

As things stand, across multisig operations as a whole, verification of the independence of approving parties still depends on trust in "a threshold of signatures was gathered," and is not yet treated as an independent layer. Pre-execution attestation closes this gap by inserting one step of proof — of party independence and operation scope — into the approval/execution path. Attestation is not a replacement for detection but its **complement**; the combination of the two layers establishes the trust boundary of approval authority.

---

## 6. Response and industry trends

- **Project response**: The project urged a pause of the bridge and liquidity pools and worked with security firms and exchanges. Private-key custody and multisig design became the points of contention.
- **Key management and operations**: The large losses of 2026 show a conspicuous pattern of stemming from key theft rather than code defects (e.g., the same year's Drift admin-key compromise that drained roughly $285 million). The very practice of concentrating a threshold number of keys onto a single custody point is being debated as a source of risk.
- **A shift in regulatory center of gravity**: The center of gravity of regulation is moving from data disclosure to proof of compliance. For approvals of fund movements and contract changes, the demand grows to show — in an independently verifiable form, before execution — the independence of the parties and the legitimacy of the operation, rather than the formal establishment of signatures.

The absence of a layer that independently verifies, at the moment of execution, the independence of approving parties and the operation scope is not a problem of a specific project; it remains a cross-organizational operational challenge for anyone who uses a multisig.

---

## 7. Lemma's analysis

Against the gap this incident exposed (the formal establishment of distributed approval flows straight into execution, decoupled from independent verification of party independence and operation legitimacy), Lemma proposes a design that requires, at the moment of approval and execution, an independently verifiable cryptographic proof that "this operation is authorized, with this scope, by separate legitimate parties."

- **Proof of approving-party independence**: Prove each signature that composes the threshold as an approval by a separate legitimate party. When a threshold number of keys has collapsed onto a single custody point, do not let it be established as an "independent multi-party approval."
- **Pre-authorization of operation scope (proof-as-auth)**: Bind operations such as seizing ProxyAdmin, upgrading a contract, and withdrawing from the bridge not with the presentation of a key but with a per-operation scoped authorization proof. Do not let the exercise of the highest authority succeed without proof.
- **Proof of custody separation**: Make it verifiable that the keys composing the threshold belong to independent custody and parties. Make a collapse of custody detectable before execution.
- **Selective disclosure**: Disclose only the minimum — that "the approval meets the legitimate threshold and independence requirements" — without exposing individual keys or internal configuration.

In this way, a proof fixed at the moment of execution functions as an independently verifiable trail of whether "this approval is an authorized operation by separate legitimate parties," before funds move. Detection (after-the-fact onchain analysis and attribution scrutiny) works on remediation after discovery; attestation (verification of party independence and operation authorization at the moment of approval) works on the independent verification of approval authority — each complementary to the other.

---

## 8. Sources

- **CoinDesk (primary reporting, onchain)**: "Humanity Protocol token crashes more than 80% after a $32 million private-key hack" (2026-06-09; loss scale, threshold breach, ProxyAdmin seizure) — <https://www.coindesk.com/tech/2026/06/09/humanity-protocol-token-crashes-more-than-80-after-a-usd32-million-private-key-hack>
- **The Block (onchain analysis)**: "Wallets linked to Humanity Protocol drained for over $32 million, token plunges 89%: onchain analyst" — <https://www.theblock.co/post/404053/humanity-protocol-exploit>
- **Decrypt (secondary)**: "Humanity Protocol Loses $36M After Private Keys 'Compromised,' Token Crashes 73%" — <https://decrypt.co/370485/humanity-protocol-loses-36m-after-private-keys-compromised-token-crashes-73>
- **crypto.news (secondary)**: "Humanity Protocol says attacker stole seven keys from one device" (one device, seven keys) — <https://crypto.news/humanity-protocol-says-attacker-stole-seven-keys-from-one-device/>
- **Bitcoin.com News (secondary, attribution held open)**: "Humanity Protocol Loses $32M in Private Key Hack as ZachXBT Calls Incident 'Possibly Staged'" — <https://news.bitcoin.com/humanity-protocol-exploit-zachxbt-staged/>
- **Chainalysis (reference, comparison case — Drift in §6)**: "Lessons from the Drift hack" (one of 2026's largest; admin-key compromise draining ~$285M; noted DPRK link) — <https://www.chainalysis.com/blog/lessons-from-the-drift-hack/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
