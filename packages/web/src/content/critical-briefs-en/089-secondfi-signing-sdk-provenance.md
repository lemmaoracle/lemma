---
brief_no: 89
title: "SecondFi：監査済みの署名コードが未監査の SDK に差し替えられ、署名のたびに秘密鍵が公開データから再構成できた"
title_en: "SecondFi: Audited Signing Code Was Replaced by an Unaudited SDK, Letting Private Keys Be Reconstructed From Public Data on Every Signature"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-06-23
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "045-humanity-protocol-multisig-key-custody", "030-stripe-trusted-channel-skimmer", "038-ironworm-npm-self-propagation"]
status: "published"
version: "1.0"
og_lead_ja: "SecondFi：未監査SDKへの差し替えで、署名のたびに秘密鍵を公開データから再構成（約240万ドル流出）"
og_lead_en: "SecondFi: an unaudited SDK swap let private keys be rebuilt from public data (~$2.4M drained)"
gap_detected: "SecondFi identified the root cause, and the isolation of the two attacker groups' addresses, the emergency evacuation of ~129M ADA, the establishment of a recovery fund, and the request for an external audit all operated."
gap_missing: "There was no layer that, before execution, independently verified whether the cryptographic code entering production signing carried a legitimately audited provenance (i.e., had not been swapped), so unaudited code ran as the signer."
gap_fix: "Before signing, independently verify with Lemma that the cryptographic code entering the signer carries a legitimately audited provenance, and do not execute the signature if that provenance cannot be confirmed."
---

## TL;DR

Users of the Cardano wallet SecondFi (formerly Yoroi, of the EMURGO lineage) lost about 16M ADA (about $2.4M) to consecutive drains on June 21-23, affecting 374 addresses. No keys were stolen, and no malware entered the wallet app. According to SecondFi's investigation, a flaw in the software signer's "deterministic nonce derivation" meant that every time an affected address signed a transaction, its private key could be mathematically reconstructed from on-chain public data alone. External analysis (Tibane Labs / The Block) notes that this signing code had been swapped on June 8 from the audited EMURGO signing code to an unaudited third-party SDK (the npm package "trantor"). The after-the-fact address identification, fund freezing (evacuating ~129M ADA), recovery fund, and external audit all worked — but there was no layer that, before execution, independently verified whether the cryptographic code entering production signing carried a legitimately audited provenance. Detection and pre-execution proof are not substitutes but complements.

---

## 1. Incident overview

- **Subject**: User wallets of SecondFi (a Cardano light wallet, formerly Yoroi; EMURGO is one of Cardano's three founding entities)
- **Scale of loss**: About 16M ADA (about $2.4M equivalent) drained from 374 addresses. It occurred across four consecutive wallet drains
- **Date**: 2026-06-21 to 23. SecondFi disclosed the root cause in an investigation update on 2026-06-25
- **Root cause (SecondFi's disclosure)**: A flaw in the software signer's deterministic nonce derivation. Every time an affected address signed, enough information leaked to reconstruct its private key from on-chain public data. The vulnerability exists at the address level, so the compromised state persists even if the same recovery phrase is imported into a different wallet
- **Provenance finding (external analysis)**: Tibane Labs / The Block note that the signing code in question was swapped on 2026-06-08 from the audited EMURGO signing code to an unaudited third-party SDK (the npm package "trantor"). Because it dropped the per-key secret that a standard implementation should mix into each signature, a value that should remain secret became computable from public transaction data alone
- **Attackers**: SecondFi identified two groups. One drained 171 addresses in two waves; the other swept 203 addresses separately. About 4.02M ADA remains in an identified aggregation wallet under monitoring
- **Containment / response**: As an emergency measure, ~129M ADA was evacuated to an independent third-party custodian. A dedicated recovery fund was established, and multiple external security firms were engaged for audits. The platform remains in maintenance mode. Users were warned not to "restore the recovery phrase into another wallet" and to "avoid withdrawing staking rewards (mempool monitoring can expose funds)"
- **Core**: It was not independently verified before execution whether the cryptographic code entering production signing carried a legitimately audited provenance (i.e., had not been swapped); as a result, unaudited code ran as the signer, and private keys became reconstructable from public data

---

## 2. Timeline

- 2026-06-08: According to external analysis (Tibane Labs / The Block), the audited EMURGO signing code is swapped for an unaudited third-party SDK (the npm package "trantor")
- 2026-06-21 to 23: Two attacker groups execute automated drains. About 16M ADA is drained from 374 addresses (171 + 203)
- Around 2026-06-23: The consecutive drains become apparent. SecondFi moves into maintenance mode and begins containment
- 2026-06-25: SecondFi discloses an investigation update. It announces the root cause (a deterministic nonce derivation flaw exposing private keys at the address level), the identification of two attacker groups, the evacuation of ~129M ADA, and the establishment of a recovery fund
- 2026-06-27: Tibane Labs publishes a forensic report, presenting the signing-code swap (the unaudited SDK "trantor") as a provenance finding
- Thereafter: Audits by external security firms and a recovery program proceed (maintenance continues as of this Brief's writing)

> Note: The root cause (the deterministic nonce derivation flaw, address-level private-key exposure) is based on SecondFi's disclosure. The provenance finding that the signing code was swapped to an unaudited SDK ("trantor") on 2026-06-08 comes from external analysis (Tibane Labs' 2026-06-27 forensic report / The Block). Tibane Labs develops a competing wallet of its own, so given that conflict of interest, we treat its claims alongside SecondFi/EMURGO's official positions. EMURGO has not published a postmortem as of this Brief's writing. Refer to the latest primary sources for scale and dates.

---

## 3. Attack vector

1. **Signing-code swap**: The audited EMURGO signing code is swapped on 2026-06-08 for an unaudited third-party SDK (the npm package "trantor") (per external analysis). The provenance of the code entering the production signer changed
2. **Loss of the per-key secret**: The swapped signer drops the per-key secret (nonce) that a standard implementation should mix into each signature. Deterministic nonce derivation makes a value that should remain secret computable from public data
3. **Information leakage through signing**: Every time an affected address signs a transaction, enough information to reconstruct its private key leaks on-chain
4. **Private-key reconstruction**: Attackers mathematically reconstruct affected addresses' private keys from published on-chain data. The vulnerability is at the address level, so the compromise persists even if the same phrase is moved to a different wallet
5. **Automated draining**: Two attacker groups run automated sweeps on June 21-23, draining ~16M ADA from 374 addresses
6. **Containment and recovery**: SecondFi moves into maintenance mode, evacuates ~129M ADA to an independent custodian, establishes a recovery fund, and engages external audits (an after-the-fact sequence that operates only after the signatures have leaked)

---

## 4. Structural analysis

This incident belongs to the `code-provenance` category under Pillar 01 (Verifiable Origin). The central failure primitive is that **it was not independently verified, before execution, whether the cryptographic code entering production signing carried a legitimately audited provenance (i.e., had not been swapped)**. The deterministic nonce derivation flaw itself is the proximate cause, but what brought that flaw into the production signer was a break in provenance — the audited code being replaced by an unaudited SDK. From the user's point of view, the wallet kept operating as legitimate. Which provenance of code lived inside the signer was not verified on each signature.

This incident connects by provenance with Brief No.074 (Taiko, where a prover's signing key leaked into a public repository, decoupling a proof's formal validity from the signer's legitimacy). If 074 is the absence of provenance for "the custody state of a signing key as a trust anchor," this incident is the absence of provenance for "the cryptographic code that does the signing itself." In both, the root of the signing system was trusted without its provenance being independently verified. It is adjacent to Brief No.045 (Humanity Protocol, where a key placed in a single custody point moved funds past the multisig threshold) in that a trust anchor around signing and keys authorized a fund movement without independent verification. It shares the same `code-provenance` lineage with Brief No.030 (Stripe, where the provenance of code riding a trusted channel was tainted) and Brief No.038 (IronWorm, where an npm worm that republished itself with stolen credentials siphoned developers' keys), in that code/packages reaching production were executed without their provenance being verified.

As secondary categories, we note `identity-auth` (the leaked private keys collapsed the basis for identity and asset control) and `bridge-config-trust` (the trust configuration around signing and keys). The correctness of a cryptographic implementation such as deterministic nonces matters as a precondition, but only once that implementation is independently verified before execution as "code with a legitimately audited provenance" can wallet signing be placed with confidence on the asset-management front line.

---

## 5. The gap between detection and proof

SecondFi's identification of the root cause, the isolation of the two attacker groups' addresses, the emergency evacuation of ~129M ADA, the establishment of a recovery fund, the engagement of external security firms for audits, and the concrete warnings to users (do not restore the phrase; do not withdraw staking rewards) are indispensable for grasping, containing, and remediating the harm, and this Brief does not deny that role. In fact, this detection and analysis stood up a framework to deter further outflows and to recover. Detection did indeed work.

At the same time, detection does not change what code the receiving side (the signer that produces signatures, and the users and network that trust those signatures) actually signs with. In this incident, even though the code that entered the signer was an unaudited SDK, the wallet operated as legitimate and signatures were generated as usual. What was missing was a layer that, before signing, independently verifies "does the cryptographic code now signing carry a legitimately audited provenance — has it been swapped?" — a verification on a separate track from the execution of the signature itself. Even if anomaly detection fires after the drain, it does not stop the reconstruction of private keys from the information leaked on every signature. As material for proving in an audit "were this wallet's signatures generated by audited, legitimate code," the mere fact that the wallet operated normally is not an independent record of the signing code's provenance.

Pre-execution attestation fixes the provenance of the cryptographic code entering production signing, before signing, in an independently verifiable form. It attests beforehand that the signer is "code with a legitimately audited provenance," and does not execute the signature if that provenance cannot be confirmed. Only by not separating the confirmation of the wallet's normal operation (the detection-style "the app is running fine") from the pre-execution attestation of the signing code's provenance (the proof that "the implementation doing the signing is the audited, legitimate one"), and by letting the two overlap, can wallet signing be placed with confidence in real operations. Detection and proof are complementary, not substitutes.

For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for design that verifies independently before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **SecondFi / EMURGO**: Disclosed the root cause (the deterministic nonce derivation flaw, address-level private-key exposure). Evacuated ~129M ADA to an independent custodian and established a recovery fund. Engaged multiple external security firms for audits and continues in maintenance mode. Stated a goal of returning assets within about two weeks. Note that EMURGO has not published a formal postmortem as of this Brief's writing
- **Warnings to users**: Do not restore an affected address's recovery phrase into another wallet (the compromise persists at the address level). Avoid withdrawing staking rewards (mempool monitoring can expose funds). Wait for the official recovery process and apply via the support portal
- **External analysis (Tibane Labs / The Block)**: In a 2026-06-27 forensic report, Tibane Labs noted the provenance whereby the audited EMURGO signing code was swapped on 2026-06-08 for an unaudited third-party SDK (the npm package "trantor"). It technically explained that the signer had dropped the per-key secret. However, Tibane Labs develops a competing wallet of its own, so given that conflict of interest, we treat its account alongside the official positions
- **Cross-industry point**: At the wallet's signer — the layer most dependent on trust — provenance verification of the cryptographic code put into production (signing/provenance fixing in CI/CD, detection of dependency swaps, attestation of audited builds) was reaffirmed as the first line of defense

How to independently verify, before execution, the provenance of the cryptographic code entering production signing is expected to advance as a discussion point in wallet and signing-infrastructure design in the wake of this incident.

---

## 7. Lemma's analysis

Against the gap this incident exposed (the provenance of the cryptographic code entering production signing is not independently verified before execution), Lemma proposes the following design.

- **Provenance proof of signing code**: Fix, as an independently verifiable provenance proof before signing, that the cryptographic code entering the wallet's signer is "a build with a legitimately audited provenance," and exclude swapped, unaudited code before execution
- **Provenance fixing of dependency swaps**: Fix changes to signing-related dependencies and SDKs as tamper-proof provenance, cutting off the path by which an unaudited swap reaches the production signer
- **Normal operation ≠ code provenance**: Do not separate the fact that "the wallet is operating normally" from the fact that "the implementation doing the signing carries a legitimate provenance," and make the latter the subject of pre-execution attestation
- **Selective disclosure**: Without disclosing the signing implementation or the entire build pipeline, prove with minimal disclosure only that "this signer carries an audited, legitimate provenance"

Detection (after-the-fact root-cause identification, fund evacuation, compensation, audits) works toward remediating harm, and pre-execution attestation (independent verification of the signing code's provenance before signing) works toward establishing trust in wallet signing; the two are complementary. For the design and its scope, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **The Block**: "SecondFi maps recovery path after $2.4 million Cardano wallet exploit, aims to return funds within two weeks" (2026-06) — <https://www.theblock.co/post/406457/secondfi-maps-recovery-path-after-2-4-million-cardano-wallet-exploit-aims-to-return-funds-within-two-weeks>
- **AMBCrypto**: "Cardano wallet exploit: SecondFi traces attack to private key flaw, warns users not to restore seed phrases" (2026-06-25) — <https://ambcrypto.com/cardano-wallet-exploit-secondfi-traces-attack-to-private-key-flaw-warns-users-not-to-restore-seed-phrases/>
- **crypto.news**: "SecondFi keeps two-week recovery plan after $2.4M Cardano wallet exploit" (2026-06) — <https://crypto.news/secondfi-keeps-two-week-recovery-plan-after-2-4m-cardano-wallet-exploit/>
- **Crypto Briefing**: "SecondFi wallet vulnerability drains $2.4M in Cardano assets" (2026-06) — <https://cryptobriefing.com/secondfi-wallet-vulnerability-cardano-drain/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
