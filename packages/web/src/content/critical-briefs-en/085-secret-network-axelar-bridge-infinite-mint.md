---
brief_no: 85
title: "Secret Network：偽のチャネルから届いた入金が検証されず、裏づけのない wrapped トークンが無限に発行された"
title_en: "Secret Network: Deposits From a Forged Channel Went Unverified, Letting Unbacked Wrapped Tokens Be Minted Without Limit"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-19
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge", "023-alephium-tokenbridge", "074-taiko-bridge-prover-key-leak"]
status: "published"
version: "1.0"
og_lead_ja: "Secret Network：偽チャネルからの入金が無検証で、裏づけのない wrapped トークンが無限 mint（約$4.67M）"
og_lead_en: "Secret Network: forged-channel deposits went unverified, minting unbacked wrapped tokens (~$4.67M)"
gap_detected: "A routine transfer failed for insufficient escrow balance, surfacing the anomaly, and the Axelar emergency committee disabled both the Secret and Secret-SNIP connections to stop further outflow."
gap_missing: "There was no layer that independently verified, before minting, that the message came from a legitimate channel and that a corresponding burn had occurred on the source chain, and because balances are encrypted, even the shortfall in backing went unobserved for about seven days."
gap_fix: "Make provenance proof a precondition for minting, so that any message not accompanied by cryptographic proof of its source channel and burn event never reaches issuance (mint/release)."
---

## TL;DR

On the IBC bridge connecting Secret Network and Axelar, about $4.67 million in assets was withdrawn despite there being no corresponding backing on the counterpart chain. The cryptography was not broken. The ICS-20 smart contract on the Secret side did not verify the "source IBC channel" of incoming token transfers, looking only at the denomination path. The attacker stood up their own single-validator Cosmos SDK chain, opened a new IBC channel to the vulnerable contract, and sent forged deposit packets — minting unbacked wrapped tokens on Secret without limit (infinite-mint) and swapping them for real assets over the legitimate Axelar IBC channel. Because Secret is a privacy chain with encrypted balances, the outflow went unnoticed for about seven days, surfacing only when a legitimate cross-chain transfer failed for "insufficient escrow balance." Axelar's emergency committee contained it by suspending the Secret/Secret-SNIP connections, but there had been no layer to independently verify, before minting, whether "this deposit came from a legitimate source channel." Detection and pre-execution proof are not substitutes but complements.

---

## 1. Incident overview

- **Subject**: The Cosmos IBC bridge connecting Secret Network and Axelar. The vulnerability was confined to the ICS-20 smart contract on the Secret side
- **Scale of loss**: About $4.67 million. The breakdown of the drained tokens is not disclosed in public information
- **Occurrence (estimated)**: The outflow is said to have begun around 2026-06-10. It went undetected for about seven days, and on 2026-06-19 Axelar suspended the connection (as noted below, the timeline varies across sources and should be finally confirmed in an official post-mortem)
- **Method**: infinite-mint (unlimited issuance of unbacked wrapped tokens). The attacker created their own single-validator Cosmos SDK chain, opened a new IBC channel to the vulnerable contract, and sent forged deposit packets. Bypassing verification of the source channel and the denomination path, they minted unbacked wrapped tokens on Secret and swapped them for real assets over the legitimate Axelar IBC channel
- **Root cause (as noted by external analysis)**: The ICS-20 contract on the Secret side did not verify the source IBC channel (provenance) of incoming token transfers, checking only the denomination path. Because the authenticity of the source was not verified, deposits from a channel the attacker had prepared were accepted as legitimate deposits
- **Why detection was delayed**: Because Secret is a privacy chain with encrypted balances, the illicit issuance and outflow were not made visible for about seven days. The anomaly surfaced only when a legitimate cross-chain transfer failed for insufficient escrow balance
- **Containment**: Axelar's emergency committee suspended the Secret/Secret-SNIP connections to prevent further outflow. It contacted the relevant exchanges and law enforcement and continued the investigation. By current findings, the rest of the Axelar network is said to be unaffected
- **Core**: The "deposit" that is the basis on which the receiving side mints wrapped tokens was accepted without its source channel's authenticity (provenance) being independently verified. Only the consistency of the denomination was checked; "where it came from" was not verified

---

## 2. Timeline

- Around 2026-06-10 (estimated): A forged deposit to the ICS-20 contract on the Secret side begins the infinite-mint, and unbacked wrapped tokens are swapped for real assets over the legitimate channel
- For about seven days: The outflow goes undetected due to balance encryption
- Around 2026-06-17 (estimated): A legitimate cross-chain transfer fails for insufficient escrow balance, and the anomaly surfaces
- 2026-06-19: Axelar's emergency committee suspends the Secret/Secret-SNIP connections. Contacts exchanges and law enforcement and begins an investigation

> Note: The start date of the outflow (estimated 2026-06-10) and the discovery date (estimated around 2026-06-17) are estimates based on external analysis and reporting and vary across sources (the 2026-06-19 connection suspension is consistent across multiple sources). "Undetected for seven days," "infinite-mint with the source channel unverified," and "forged deposits from a single-validator Cosmos SDK chain" are points on which The Block and other external analyses agree. When the contract vulnerability was introduced is not identified in public information (the source verification appears to have been missing at the stage of the forked/custom ICS-20 implementation). For final confirmation of the scale, dates, and root cause, refer to the official post-mortem.

---

## 3. Attack vector

1. **Preparing a forged channel**: The attacker stands up their own single-validator Cosmos SDK chain and opens a new IBC channel to the vulnerable ICS-20 contract on the Secret side
2. **Sending forged deposit packets**: From the prepared channel, the attacker sends forged deposit (token transfer) packets to the vulnerable contract
3. **Absence of source verification**: The ICS-20 contract checks only the denomination path of the deposit and does not verify the authenticity of the source IBC channel. The deposit from the forged channel is accepted as a legitimate deposit
4. **Unbacked issuance (infinite-mint)**: In response to the accepted forged deposit, unbacked wrapped tokens are minted on Secret. No real asset exists to back the supply
5. **Swapping over the legitimate channel**: The issued, unbacked wrapped tokens are swapped for and withdrawn as real assets (about $4.67 million worth) over the legitimate Axelar IBC channel
6. **Invisible period**: Due to Secret's balance encryption, the outflow goes undetected for about seven days
7. **Discovery and containment**: A legitimate transfer fails for insufficient escrow balance, surfacing the issue. The Axelar emergency committee suspends the connection (an after-the-fact sequence that operates only after the issuance and outflow have occurred)

---

## 4. Structural analysis

This incident belongs to the `bridge-config-trust` category under Pillar 01 (Verifiable Origin). The central failure primitive is that **the "deposit" that is the basis on which the receiving side mints wrapped tokens was accepted without its source channel's authenticity (where it came from = provenance) being independently verified.** The contract checked the consistency of the denomination (what token it is) but did not check the authenticity of the source channel (whether it came from a legitimate bridge route). Because verification of provenance was missing, a deposit from a channel the attacker had prepared passed as a legitimate deposit and led directly to unbacked issuance.

This incident is of the same type as Brief No.016 (Verus-Ethereum, where the Merkle proof was valid but the consistency of input and output amounts went unverified), Brief No.067 (Syscoin, where a parsing flaw in the SPV proof let a forged proof be accepted as "proof of a valid burn"), and Brief No.023 (Alephium, where the guardian's key was safe but the provenance of the signed event went unverified). In each, only a part (amount, format, event, channel) of "what actually happened on the counterpart chain" being passed across chains was verified, while the authenticity and provenance of the whole went independently unverified. This incident is the case in which the provenance dimension of "the deposit's source channel" was the part that was missing. It also connects to Brief No.074 (Taiko, where a leaked signing key let a proof be accepted without the signer's legitimacy being independently verified), in that the authenticity of the basis authorizing the cross-chain asset movement went independently unverified.

This incident has another layer. Due to Secret's privacy design (balance encryption), the illicit issuance and outflow went undetected for about seven days. This illustrates a structure that "strengthening detection" struggles to reach — no matter how much monitoring is thickened, if balances are encrypted, the anomaly is hard to see. That is precisely why a layer that independently verifies the deposit's provenance before issuance is needed. As secondary categories we note `identity-auth` (in that the forged channel passed as a legitimate source) and `data-provenance` (in that the backing of the wrapped token is the provenance of the underlying asset).

---

## 5. The gap between detection and proof

The suspension of the connection by the Axelar emergency committee, the contact with exchanges and law enforcement, the identification of the scope of harm, and the confirmation that the rest of the network was unaffected are indispensable for deterring further outflow and grasping the harm, and this Brief does not deny that role. In fact, these responses kept the loss to about $4.67 million, and the suspension stopped further issuance. Detection and after-the-fact response did indeed function.

At the same time, detection itself was doubly difficult in this case. First, unless the receiving side (the ICS-20 contract) changes "which deposits, from which source, it accepts," deposits from a forged channel will keep being accepted as legitimate deposits. Second, due to Secret's balance encryption, the illicit issuance and outflow were not made visible in the first place for about seven days. What was missing is a layer that independently verifies, before issuance, "whether this deposit came from a legitimate source channel" — a verification of a different kind from checking the consistency of the denomination. Even if anomaly detection fires after issuance — even had it been visible — it does not stop the unbacked issuance at the moment the contract accepted it. As material with which an audit could establish "whether this wrapped token was issued backed by a legitimate deposit," the mere fact that the denomination was consistent is not an independent record of the source's provenance.

Pre-execution attestation receives the cross-chain deposit, before the receiving side mints wrapped tokens, in an independently verifiable form, and — separately from the consistency of the denomination — verifies that "this deposit is a genuine one that came from a legitimate source channel." If the authenticity of the source cannot be confirmed, it blocks issuance up front even if the denomination is consistent. Formal acceptance (a detection-like "this deposit passes") and the pre-execution proof of the source channel's provenance ("this deposit came from a legitimate route") are not substitutes but **complements**, and only when the two overlap can the issuance and swapping of a cross-chain bridge be put into practice with confidence. Detection and proof are complementary, not substitutes.

For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for design that verifies independently before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **Axelar**: The emergency committee suspended the Secret/Secret-SNIP connections to prevent further outflow. It contacted the relevant exchanges and law enforcement and continued the investigation. By current findings, it stated that the rest of the Axelar network is unaffected
- **Secret Network**: External analysis points to the missing source-channel verification in the ICS-20 contract. The final confirmation of the root cause, scale, and timeline awaits an official post-mortem
- **External analysis (The Block and others)**: Agree on the infinite-mint method (forged deposits from a forged channel mint unbacked wrapped tokens → swapped for real assets over a legitimate channel) and on the roughly seven-day invisibility (balance encryption)
- **Cross-industry point**: Cross-chain bridge-related exploits in 2026 are said to have reached a cumulative $340.7M across 14 cases (PeckShield, as of 2026-06-01), all of which reduce to the same question of "how does the destination chain independently verify what actually happened on the counterpart chain (source, amount, event)." Even in a general-purpose cross-chain standard like IBC, it was re-recognized that having the receiving contract verify the authenticity of the source channel is the linchpin of bridge security

---

## 7. Lemma's analysis

Against the gap between detection and proof this case exposed (the provenance of the cross-chain deposit's source channel is not independently verified before wrapped tokens are minted), Lemma proposes the following design.

- **Pre-execution proof of deposit provenance**: Before the receiving side mints wrapped tokens, independently verify — separately from the consistency of the denomination — that the deposit's source channel is "a genuine one that came from a legitimate route," and reject issuance up front if it cannot be confirmed
- **Fixing source authenticity**: Fix the identity of the legitimate bridge route (channel) as tamper-proof provenance, and exclude deposits from a forged channel the attacker prepared from the issuance path
- **Defense that does not depend on visibility**: Even in an environment where balances are encrypted and after-the-fact anomaly detection is hard to apply, by verifying provenance before issuance, prevent the unbacked issuance during the invisible period from happening at all
- **Selective disclosure**: Without disclosing the internal state of the deposit route, prove with minimal disclosure only that "this deposit came from a legitimate source"

Detection (after-the-fact connection suspension, tracing, and containment) works to remediate harm, and pre-execution proof (independent verification of deposit provenance before issuance) works to establish trust in the cross-chain bridge; the two operate complementarily.

For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **The Block**: “Secret Network’s Axelar bridge drained for $4.67 million in infinite-mint exploit that went unnoticed for seven days” (2026-06) — <https://www.theblock.co/post/405459/secret-networks-axelar-bridge-drained-for-4-67-million-in-infinite-mint-exploit-that-went-unnoticed-for-seven-days>
- **crypto.news**: “Axelar shuts down Secret Network bridge routes after $4.7M exploit” (2026-06) — <https://crypto.news/axelar-shuts-down-secret-network-bridge-routes-after-4-7m-exploit/>
- **CryptoTimes**: “$4.67M Exploit Hits Axelar-Secret Network Bridge, Links Disabled” (2026-06-19) — <https://www.cryptotimes.io/2026/06/19/4-67m-exploit-hits-axelar-secret-network-bridge-links-disabled/>
- **Bitcoinist**: “Secret Network Bridge Exploited for $4.67M in Infinite-Mint Attack” (2026-06) — <https://bitcoinist.com/02-secret-network-axelar-bridge-drained-in-infinite-mint/>
- **BanklessTimes**: “Secret Network Bridge Exploit Drains $4.67M From Axelar Link” (2026-06-20) — <https://www.banklesstimes.com/articles/2026/06/20/secret-network-bridge-exploit-drains-4-67m-from-axelar-link/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
