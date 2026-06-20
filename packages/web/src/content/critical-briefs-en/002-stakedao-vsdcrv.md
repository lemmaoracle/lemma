---
brief_no: 2
title: "Stake DAO vsdCRV 不正ミント — デプロイヤー鍵による LayerZero v2 信頼設定書き換え"
title_en: "Stake DAO vsdCRV Unauthorized Mint — LayerZero v2 Trust Source Rewriting via Deployer Key"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-27
published: 2026-05-29
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth"]
version: "1.0"
status: published
og_lead_ja: "デプロイヤー鍵で LayerZero 信頼設定を書き換え不正ミント — Stake DAO vsdCRV"
og_lead_en: "Deployer key rewrote LayerZero v2 trust config to mint tokens — Stake DAO vsdCRV"
gap_detected: "Security firm Blockaid detected the attack in real time, within minutes, which led to rapid containment."
gap_missing: "The configuration of which senders to trust was itself rewritten with the attacker's key, so there was no layer to confirm the origin before accepting the forged request."
gap_fix: "Before minting assets, independently verify with Lemma that the message comes from a legitimate origin, and prevent it up front."
---

## TL;DR

On Stake DAO vsdCRV, the attacker used the compromised deployer private key to rewrite the LayerZero v2 trust source to a contract they controlled, then minted 5.4 trillion vsdCRV from a forged message. Blockaid detected the attack within minutes, enabling containment, but detection cannot change what the bridge will accept. The configuration that anchors trust was rewritable by a single key, and no layer independently verified message origin before acceptance. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Impact**: 5.4 trillion vsdCRV unauthorizedly minted on Arbitrum. A portion swapped to 43.781 ETH (approx. $91K) and bridged to Ethereum
- **Target protocol**: Stake DAO (vsdCRV governance derivative token)
- **Underlying infrastructure**: Cross-chain messaging via LayerZero v2
- **Detection**: 2026-05-27, real-time detection by Blockaid
- **Compromised asset**: The Stake DAO deployer private key
- **Scope**: Contained to Arbitrum. Boosted Yields, Liquid Lockers, Votemarket, and Stake DAO lending on Morpho were not affected
- **Ongoing matter**: The asdCRV Llamalend market on Arbitrum is being wound down

---

## 2. Timeline

- 2026-05-27 (early): The attacker uses the Stake DAO deployer private key to rewrite the LayerZero v2 configuration, then sends a forged message that mints 5.4 trillion vsdCRV on Arbitrum
- 2026-05-27: Blockaid detects the ongoing exploit in real time and publishes the attack flow
- 2026-05-27: PeckShield Alert analyzes the exfiltration path, including the swap and bridge
- 2026-05-28: Stake DAO publishes an initial statement. Contributors protect the mainnet-side vsdCRV backing assets and pause the vsdCRV bridge
- 2026-05-29: The Stake DAO team publishes preliminary investigation results, confirming that impact is contained to Arbitrum and that core protocols including Boosted Yields are not affected. Investigation continues in coordination with law enforcement and security partners

---

## 3. Attack Vector

1. **Initial compromise**: The Stake DAO deployer private key is compromised. The exact path was not publicly disclosed at the time of writing
2. **Trust source rewriting**: Using the compromised deployer key, the attacker modifies the LayerZero v2 configuration. By design, vsdCRV on Arbitrum trusts only cross-chain messages sent from the legitimate Ethereum-side contract; the attacker rewrites that trusted source pointer to a contract they themselves deployed
3. **Forged messages**: The attacker emits forged cross-chain messages from their contract to vsdCRV on Arbitrum
4. **Impact realization**: vsdCRV on Arbitrum accepts the forged messages, and 5.4 trillion vsdCRV is unauthorizedly minted. A portion is swapped on DEX to 43.781 ETH (approx. $91K) and bridged to Ethereum
5. **Containment**: The Stake DAO team swiftly protects the mainnet-side vsdCRV backing assets and pauses the vsdCRV bridge, containing impact to Arbitrum. The attacker could not seize the backing assets

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, on a cross-chain bridge, **the very configuration that anchors trust is left rewritable by a single key**. The trusted source pointer for vsdCRV under LayerZero v2 is implemented as config that the contract owner — in this case, the holder of the deployer private key — can modify, and there is no independent verification layer over the config itself. The receiving contract (vsdCRV on Arbitrum) is designed to trust the legitimate sender that the config points to, so once the config was rewritten, the forged messages were accepted exactly as specified.

A same-structure case is the April **KelpDAO / rsETH unauthorized unlock** (Brief 001). The two incidents compare as follows:

| Aspect | KelpDAO / rsETH (2026-04) | Stake DAO (2026-05) |
| --- | --- | --- |
| Initial compromise | Intrusion into the LayerZero Labs operations environment (a social-engineering vector is cited) | Stake DAO deployer private key |
| Manipulated layer | The DVN observation layer (the content of RPC responses) | The LayerZero v2 trust source configuration itself |
| Form of tampering | Distorting observed results | Rewriting the trusted source pointer |
| DVN signing key | Not compromised | Not applicable (the rewrite alone is sufficient) |
| Bridge defense failure point | 1-of-1 DVN configuration | Single-key concentration over the trust source pointer |
| Shared structure | Cross-chain message trust has a concentration point in config or the observation layer, and that point is controllable by a single entity | Same |

Both incidents reach the same structure from different vectors. Following the KelpDAO incident, LayerZero Labs named the observation layer an independent category and announced policy changes including the DVN's refusal of 1-of-1 configurations and a move to 3-of-3 by default. Those defensive measures did not cut off the present incident's vector, which directly rewrites the LayerZero v2 configuration itself.

---

## 5. The detection–proof gap

In this incident, Blockaid detected the attack in real time within minutes, which enabled the Stake DAO team to act quickly on containment (protecting backing assets and pausing the vsdCRV bridge). The detection layer demonstrably worked to limit the spread of damage, and this Brief does not deny the role of detection vendors.

That said, detection does not change what the bridge will accept. Once a forged message reaches vsdCRV on Arbitrum, the bridge accepts it in accordance with its config (the trusted source pointer the attacker rewrote). The structural layer boundary remains: detection cannot stop acceptance itself.

For the purposes of establishing in regulatory filings, administrative proceedings, or litigation that an unauthorized authority was exercised — in cases like this one, where a configuration rewrite was carried out through a legitimate process (LayerZero v2 accepted a config change from the attacker's key) — an independent layer is required between detection scores and proof. Post-event detection and pre-execution attestation, which attaches independently verifiable evidence to the message itself before the event, are not substitutes but complements; a design that combines both layers to establish the trust boundary is the structural response required.

---

## 6. Response and Industry Developments

Stake DAO (2026-05-28 to 29):

- Protected the mainnet-side vsdCRV backing assets, putting them out of reach of the attacker
- Paused the vsdCRV bridge, containing impact to Arbitrum
- Confirmed that Boosted Yields, Liquid Lockers, Votemarket, and Stake DAO lending on Morpho were not affected
- The asdCRV Llamalend market on Arbitrum is being wound down
- Continuing investigation in coordination with law enforcement and security partners

Industry response:

- Blockaid: Real-time detection of the ongoing exploit and public disclosure of the attack flow
- PeckShield Alert: Independent analysis of the swap and bridge paths
- The naming of the observation layer as an independent category and the strengthening of DVN configurations announced by LayerZero Labs after the KelpDAO incident did not directly cut off the present incident's vector (direct config rewrite), but they had laid groundwork across the industry for the structural argument that cross-chain trust configurations concentrate around single keys

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (cross-chain message trust configurations have a concentration point in the config layer, and that point is controllable by a single entity), Lemma proposes a design that embeds an independently verifiable cryptographic proof in the cross-chain message itself, so that the verifier can verify message origin independently of the config layer. Even when the config has been rewritten, the proof tells the verifier through a separate channel whether the message came from a legitimate origin or not. This is the design philosophy of "cryptographically valid ≠ provenance correct" — the core of the verifiable-origin category.

---

## 8. Sources

- **Stake DAO official statement (initial)** (2026-05-27, Stake DAO official X post) — "We are aware of the ongoing situation. Please do not interact with vsdCRV." The first acknowledgment. There was no standalone official blog post; X served as the primary statement channel. https://x.com/StakeDAOHQ/status/2059586800255910039
- **Stake DAO official statement (follow-up)** (2026-05-28, Stake DAO official X post) — Preliminary investigation; disclosure of the deployer private key compromise; protection of mainnet-side backing assets; pause of the vsdCRV bridge; containment to Arbitrum; confirmation that Boosted Yields, Liquid Lockers, Votemarket, and Stake DAO lending on Morpho were not affected. https://x.com/StakeDAOHQ/status/2059938235724320959
- **Blockaid threat intelligence (real-time detection)** (2026-05-27, Blockaid official X post) — Real-time detection of the ongoing exploit; disclosure of the 5.4 trillion vsdCRV mint and the swap to ETH; on-chain evidence of malicious peer deployment, the setPeer call, and the mint transaction. There was no standalone official blog post; X served as the primary statement channel. https://x.com/blockaid_/status/2059573118927049152
- **PeckShield Alert analysis** (2026-05-27, PeckShield Alert official X post) — Independent confirmation of the 5.4 trillion vsdCRV mint and the swap to 43.781 ETH (approx. $91K); analysis of the swap path via Curve / KyberSwap and the bridge to Ethereum. There was no standalone official blog post; X served as the primary statement channel. https://x.com/PeckShieldAlert/status/2059578749352640679
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
