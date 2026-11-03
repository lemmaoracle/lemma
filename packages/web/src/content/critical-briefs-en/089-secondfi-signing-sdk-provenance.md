---
brief_no: 89
title: "SecondFi：監査済みの署名コードが未監査の SDK に差し替えられ、署名のたびに秘密鍵を公開データから再構成できた(SecondFi の公表・Tibane Labs の解析)"
title_en: "SecondFi: Audited signing code was replaced by an unaudited SDK, and private keys could be reconstructed from public data on every signature (SecondFi disclosure, Tibane Labs analysis)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-06-23
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "045-humanity-protocol-multisig-key-custody", "030-stripe-trusted-channel-skimmer", "038-ironworm-npm-self-propagation"]
status: "published"
gate: "signing"
version: "1.0"
og_lead_ja: "SecondFi：署名器の nonce 導出の欠陥で、署名のたびに秘密鍵を公開データから再構成でき、約 1,600 万 ADA（約 240 万ドル）が流出"
og_lead_en: "SecondFi: a nonce-derivation flaw in the signer let private keys be rebuilt from public data on every signature; ~16M ADA (~$2.4M) drained"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 署名コードの差し替え"
og_kicker_en: "SUPPLY CHAIN · SIGNING CODE SWAP"
og_headline_ja: "署名のたびに秘密鍵が\n漏れていたと公表。\n<accent>約 240 万ドルが流出</accent>"
og_headline_en: "Each signature leaked\nthe private key,\nSecondFi says.\n<accent>~$2.4M drained.</accent>"
key_figures:
  - value: "~16M"
    unit: "ADA"
    label: "Amount drained (~$2.4M; SecondFi disclosure and reporting)"
    tone: "alert"
  - value: "374"
    unit: "addresses"
    label: "Addresses drained (171 + 203 across two groups)"
  - value: "06-08 → 06-21"
    label: "From the signing-code swap (per external analysis) to the start of the drains"
glossary:
  - term: "Nonce"
    desc: "A value mixed into each signature that must stay secret. The swapped signer is said to have dropped the per-key secret that a standard implementation mixes into each signature."
  - term: "Deterministic nonce derivation"
    desc: "Computing the nonce from fixed inputs rather than from randomness. Per SecondFi's disclosure, a flaw in this derivation let a value that should be secret be computed from public data."
  - term: "Software signer"
    desc: "The part of a wallet app that signs transactions with the user's private key."
insight:
  slug: "signing-code-not-audited-build"
  label: "Signing code that did not pass audit"
  quote: "Unless the code used for signing is checked against the audited build before signing, the key leaks through the signatures themselves, even when it is never stolen."
industries: ["finance", "supply-chain"]
controls:
  - slug: "ownership-check"
    item: "Confirm the signing code is the audited original before putting it into use"
attack_method: "supply-chain"
impact: "About 16M ADA drained from 374 addresses"
takeaway: "Per SecondFi, a nonce-derivation flaw in the signer let private keys be rebuilt from public data on every signature; external analysis says audited signing code had been swapped for an unaudited SDK. Before signing, check that the signing code is the audited build."
self_check: "When you replace a library used for signing or cryptography, do you check that it is the audited build before it goes to production?"
countries: ["global"]
---

## 1. Summary

No key was stolen, and no malware entered the wallet app. Per SecondFi's disclosure, a flaw in the software signer's deterministic nonce derivation meant that every time an affected address signed a transaction, its private key could be computed from published on-chain data alone. External analysis (Tibane Labs / The Block) says this signing code had been swapped from audited EMURGO signing code to an unaudited third-party SDK (the npm package "trantor"). To users, the wallet worked as usual and signatures were produced as usual. <strong>Unless the code used for signing is checked against the audited build before signing, the key leaks through the signatures themselves, even when it is never stolen.</strong>

## 2. What got through

- **What got through**: Signatures on affected addresses' transactions made by the swapped signer, and their submission to the network. Then, withdrawal transactions the attackers signed with private keys reconstructed from public data. Both were accepted as valid signatures by legitimate keys.
- **What reached the receiving side**: In general, a blockchain checks whether a signature is valid for the address's key. Which code produced the signature, and whether the nonce was generated safely, do not reach it. The attackers' transactions were signed with the reconstructed legitimate keys, so they cannot be told apart from the users' own. Per SecondFi, the vulnerability sits at the address level, so the compromise persists even if the same recovery phrase is imported into another wallet.
- **Not disclosed**: How, and on whose approval, the signing code was swapped. SecondFi's or EMURGO's position on the swap finding. EMURGO had not published a postmortem as of this Brief's writing.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before the signer starts signing, the code it uses is checked to be the same as the build that passed audit and was approved.

- **Who approves**: The side that commissions the audit and receives its results (those responsible for the wallet's development and security). It registers the audited build as the one allowed into the signer. A developer's own decision to replace a dependency SDK is not this approval.
- **Where it is checked**: Before a release that changes the signer's code goes to production, and before the signer starts signing. If the code does not match the registered build (for example, it has been replaced by an SDK that was not audited), the release is held and signing does not start.
- **What is recorded**: Which build was approved, by whom, on which audit, and which release shipped with which approved build. Afterwards, it is possible to trace which address's signatures were made by which version of the code.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the signer signs, the code it uses against the build that passed audit and was approved, and keeping a record. Detection means noticing after the drains. The 06-08 swap is per external analysis; other dates are those each party disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before signing, check that the signing code is the audited build</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Private keys could be rebuilt on every signature;<br>~16M ADA drained from 374 addresses</span></div>
<div class="rx-zone det"><b>Detection · worked after the drains</b>Root cause, fund evacuation, recovery fund, external audits</div>
<div class="rx-g g1"><div class="t">06-08</div><b>Signing code is swapped for an unaudited SDK (external analysis)</b></div>
<div class="rx-g g2"><div class="t">06-21</div><b>Two attacker groups begin automated drains</b></div>
<div class="rx-g g3"><div class="t">06-25</div><b>SecondFi discloses the root cause</b></div>
<div class="rx-g g4"><div class="t">06-27</div><b>Tibane Labs publishes its forensic report</b></div>
</div>
</figure>

Detection worked after the drains and carried forward identifying the attackers' addresses, evacuating ~129M ADA and setting up recovery, but it does not stop keys from being reconstructed from signatures already made. A case where something at the root of a signing system was trusted without its origin being checked is [Taiko](/critical/briefs/074-taiko-bridge-prover-key-leak/) (a prover's signing key leaked into a public repository). A case where the origin of packages reaching production became the issue is [IronWorm](/critical/briefs/038-ironworm-npm-self-propagation/) (an npm worm that republished itself with stolen credentials).

## 4. What Lemma does

**Lemma puts the check in section 03 at the step where signer code goes to production and the step where the signer starts signing.** It does not replace external audits or key custody; on top of them, it checks that the code used for signing is the same as the build that passed audit and was approved. It does not judge whether the code itself is safe.

### Industries and operations to watch

- **Industry · Finance**: Services, such as crypto wallets, that produce transaction signatures with users' private keys.
- **Industry · Supply chain**: Organizations that rely on third-party SDKs or libraries for signing or cryptography.

### Current controls vs Lemma

The route in this case runs from column 1 to column 2. If it is not stopped at column 1, the withdrawals in column 2 pass as valid signatures by legitimate keys. Column 3 is containment after the drains.

| Control | Signing with the swapped build | Withdrawals with reconstructed keys | Containment after the drains |
| --- | --- | --- | --- |
| External audit of the original signing code | Not effective | Not effective | Not relevant |
| Custody that keeps keys from being stolen | Not relevant | Not effective | Not relevant |
| Root-cause analysis and fund evacuation | Not relevant | Not effective | Effective |
| **Lemma (pre-execution check)** | Effective | Not effective | Partial |

The external audit covers the original EMURGO signing code that was audited, but per external analysis, what entered the production signer was an SDK that had not been audited. Key custody covers routes where keys are stolen, but here the keys were computed from signatures and public data. Root-cause analysis and fund evacuation carried forward deterring further outflows and recovery, but do not stop keys from being reconstructed from signatures that already leaked. Lemma checks, before the signer starts signing, that the code it uses is the approved build. It does not reach withdrawals the attackers sign on their own side with reconstructed keys. A record of which address's signatures were made by which build is kept, so it can also help scope the damage.

Note: Lemma's check works only when it is built into the release procedure and the signer's start-up, and the record of audited builds is managed separately from the development path that changes the code. If the audited build itself has a flaw, or the approver approves a build that was not audited, this check can be passed. How the swap happened has not been disclosed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for services that rely on third-party SDKs or libraries for signing or cryptography

- Before the signer starts signing, do you check that the code it uses is the same as the approved build?
- Do you keep a traceable record of whose approval brought in each change to signing-related dependencies (SDKs, libraries)?
- Can you identify addresses whose keys may have leaked from which build of the code signed for them?

## 5. Facts and timeline

- **Service**: User wallets of SecondFi (a Cardano light wallet, formerly Yoroi; EMURGO is one of Cardano's three founding entities).
- **Scale of loss**: About 16M ADA (about $2.4M equivalent) drained from 374 addresses, across four consecutive wallet drains.
- **Root cause (SecondFi's disclosure)**: A flaw in the software signer's deterministic nonce derivation. Every time an affected address signed, enough information leaked to reconstruct its private key from on-chain public data. The vulnerability exists at the address level, so the compromise persists even if the same recovery phrase is imported into a different wallet.
- **Origin finding (external analysis)**: Tibane Labs / The Block say the signing code in question was swapped on 2026-06-08 from audited EMURGO signing code to an unaudited third-party SDK (the npm package "trantor"). Because it dropped the per-key secret a standard implementation mixes into each signature, a value that should stay secret became computable from public transaction data alone.
- **Attackers**: SecondFi identified two groups. One drained 171 addresses in two waves; the other swept 203 addresses separately. About 4.02M ADA remains in an identified aggregation wallet under monitoring.

### Timeline

- **2026-06-08**: According to external analysis (Tibane Labs / The Block), the audited EMURGO signing code is swapped for an unaudited third-party SDK (the npm package "trantor").
- **2026-06-21 to 23**: Two attacker groups execute automated drains. About 16M ADA is drained from 374 addresses (171 + 203).
- **Around 2026-06-23**: The consecutive drains become apparent. SecondFi moves into maintenance mode and begins containment.
- **2026-06-25**: SecondFi publishes an investigation update, announcing the root cause (a deterministic nonce derivation flaw exposing private keys at the address level), the identification of two attacker groups, the evacuation of ~129M ADA, and a recovery fund.
- **2026-06-27**: Tibane Labs publishes a forensic report pointing to the signing-code swap (the unaudited SDK "trantor").
- **Thereafter**: Audits by external security firms and a recovery program proceed (maintenance continues as of this Brief's writing).

> The root cause (the deterministic nonce derivation flaw, address-level private-key exposure) is based on SecondFi's disclosure. The finding that the signing code was swapped to an unaudited SDK ("trantor") on 2026-06-08 comes from external analysis (Tibane Labs' 2026-06-27 forensic report / The Block). Tibane Labs develops a competing wallet of its own, so its finding is treated alongside SecondFi/EMURGO's official positions. EMURGO had not published a postmortem as of this Brief's writing. Refer to the latest primary sources for scale and dates. What has not been disclosed does not mean there were no controls.

### After disclosure

- **SecondFi / EMURGO**: Disclosed the root cause. Evacuated ~129M ADA to an independent third-party custodian and set up a dedicated recovery fund. Engaged multiple external security firms for audits and remains in maintenance mode. Stated a goal of returning assets within about two weeks.
- **Warnings to users**: Do not restore an affected address's recovery phrase into another wallet (the compromise persists at the address level). Avoid withdrawing staking rewards (mempool monitoring can expose funds). Wait for the official recovery process and apply via the support portal.
- **External analysis (Tibane Labs / The Block)**: In its 2026-06-27 forensic report, Tibane Labs pointed to the signing-code swap and explained technically that the signer had dropped the per-key secret.
- **Industry point**: For wallet signers, confirming the origin of cryptographic code put into production (pinning provenance in CI/CD, detecting dependency swaps, checking against audited builds) was raised as a point of discussion.

## 6. Sources

- **The Block**: "SecondFi maps recovery path after $2.4 million Cardano wallet exploit, aims to return funds within two weeks" (2026-06) — <https://www.theblock.co/post/406457/secondfi-maps-recovery-path-after-2-4-million-cardano-wallet-exploit-aims-to-return-funds-within-two-weeks>
- **AMBCrypto**: "Cardano wallet exploit: SecondFi traces attack to private key flaw, warns users not to restore seed phrases" (2026-06-25) — <https://ambcrypto.com/cardano-wallet-exploit-secondfi-traces-attack-to-private-key-flaw-warns-users-not-to-restore-seed-phrases/>
- **crypto.news**: "SecondFi keeps two-week recovery plan after $2.4M Cardano wallet exploit" (2026-06) — <https://crypto.news/secondfi-keeps-two-week-recovery-plan-after-2-4m-cardano-wallet-exploit/>
- **Crypto Briefing**: "SecondFi wallet vulnerability drains $2.4M in Cardano assets" (2026-06) — <https://cryptobriefing.com/secondfi-wallet-vulnerability-cardano-drain/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
