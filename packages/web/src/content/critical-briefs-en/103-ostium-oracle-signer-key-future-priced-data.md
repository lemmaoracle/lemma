---
brief_no: 103
title: "Ostium：オラクルの署名鍵が侵害され、未来日付の価格が有効な署名つきで受理された(CoinDesk ほかの報道)"
title_en: "Ostium: A compromised oracle signer key let future-dated prices be accepted with valid signatures (CoinDesk and others)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-07-15
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "067-syscoin-bridge-spv-proof-parsing", "001-kelpdao-rseth", "045-humanity-protocol-multisig-key-custody", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
gate: "payment-instruction"
version: "1.0"
og_lead_ja: "Ostium — オラクル署名鍵1本の侵害で「未来の価格」が有効署名で受理され $18M 流出"
og_lead_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · 署名鍵の侵害"
og_kicker_en: "CYBERATTACK · SIGNER KEY COMPROMISE"
og_headline_ja: "オラクルの署名鍵が侵害され、\n未来の価格が有効な署名で通った。\n<accent>最大約 1,800 万ドルが流出</accent>"
og_headline_en: "A compromised oracle signer key\nlet future prices pass with valid signatures.\n<accent>Up to ~$18M drained.</accent>"
key_figures:
  - value: "18"
    unit: "M USD"
    label: "USDC drained from the public liquidity vault (OLP), as confirmed by a co-founder. Some reports say up to about $24 million"
    tone: "alert"
  - value: "~5"
    unit: "min"
    label: "How long the attack lasted: 14:18 to 14:23 UTC (confirmed by a co-founder)"
  - value: "Within 1 hr"
    label: "From Ostium grasping the attack within minutes to halting all trading"
glossary:
  - term: "Oracle and signer key"
    desc: "An oracle brings information from outside the blockchain, such as prices, to programs on it. Each price report it delivers is signed with a signer key, and the receiving side verifies that the signature is correct."
  - term: "OLP vault"
    desc: "Ostium's public liquidity vault (the Ostium Liquidity Provider vault). Payouts for trades are drawn from it."
  - term: "Perpetual futures on real-world assets (RWA)"
    desc: "Futures with no expiry that track the price of real-world assets such as equities or commodities. Ostium offers them on Arbitrum."
insight:
  slug: "valid-signature-compromised-signer"
  label: "A valid signature, a compromised signer"
  quote: "An action that finalizes a payout on outside data goes through on a compromised key's signature unless, before it is finalized, it is checked not only that the signature is valid but also that the signer is legitimate right now and the data plausible."
industries: ["finance"]
controls:
  - slug: "hold-unverified"
    item: "Don't finalize payouts until the signer and the price data are confirmed legitimate"
attack_method: "account-takeover"
impact: "Up to roughly $18 million (USDC) drained"
takeaway: "One oracle signer key was compromised, and future-dated prices were accepted with valid signatures. Before outside prices are reflected in a payout, check the signer's legitimacy and the data's plausibility separately from the validity of the signature."
self_check: "Before a payout is finalized on a price from outside, do you have a mechanism that checks, separately from the signature, that the signer is still legitimate?"
countries: ["global"]
---

## 1. Summary

The attacker compromised an oracle signer key and submitted price reports carrying future-dated timestamps, signed with it. The signatures were valid and passed the protocol's signature verification. What the verification answered was "is this signature correct," not "is that signer legitimate and uncompromised right now" or "is that price data authentic and plausible." <strong>The validity of a signature is a different question from the legitimacy of the signer and the plausibility of the data; unless both are checked separately from the signature before a payout is finalized, a signature from a compromised key goes through.</strong>

## 2. What got through

- **What got through**: Payouts from the OLP vault based on future-dated price reports. The attacker made losing trades appear to be winning trades and, through delegated actions, ran roughly 20 loop trades, manufacturing fictitious profits without taking on real market exposure.
- **Signature verification**: It worked. The reports' signatures were valid, so they passed correctly.
- **What reached the receiving side**: In general, signature verification answers whether a report comes from a registered signer. Whether the signer is still legitimate and uncompromised, and whether the timestamp and price are plausible (not future-dated, consistent with the market), are different questions from the validity of the signature, and cannot be told from the signature.
- **Detection**: The security firm Blockaid detected the attack while it was in progress. Ostium grasped it within minutes and halted trading within an hour. On-chain anomaly monitoring also helped confine the loss to about five minutes.
- **Not disclosed**: How the signer key was compromised (leak, theft, custody failure, etc.). The confirmed total loss, the root cause, the final post-mortem and any compensation plan.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before outside data is reflected in a payout, it is checked, separately from the validity of the signature, not only that the signature is valid but also that the signer is legitimate, uncompromised and authorized for this scope right now, and that the data is authentic and within its plausibility bounds (timestamp consistency, acceptable price range).

- **Who approves**: The party that authorizes the price-report signers (the protocol's operations). Don't rest the signer's legitimacy only on holding a single key; make the authorization something that can be confirmed independently, so a compromised key alone does not finalize a payout.
- **Where it is checked**: Just before a price report is reflected in a payout. Don't make "it is signed with a registered key" the end point of acceptance. Before reflecting it, confirm the signer's authorization and the data's plausibility bounds. A report that cannot be confirmed is held and not reflected in a payout.
- **What is recorded**: Which signer's data was confirmed against which plausibility bounds, and whether the payout was finalized (or held). Internal signer keys and credentials stay outside the environment; only "this input meets the provenance and plausibility requirements" is shown.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the signer's legitimacy and the data's plausibility, separately from the validity of the signature, before a price report is reflected in a payout, and keeping a record. Detection means noticing after trading has progressed. The reports carry one date (2026-07-15); the attack lasted about five minutes, 14:18 to 14:23 UTC.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the signer and the data, separately from the signature, before a price report is reflected in a payout</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In about five minutes, up to ~$18–24M<br>left the OLP vault</span></div>
<div class="rx-zone det"><b>Detection · worked while it was under way</b>Blockaid detected it and Ostium halted trading</div>
<div class="rx-g g1"><div class="t">COMPROMISE</div><b>The oracle signer key is compromised (route undisclosed)</b></div>
<div class="rx-g g2"><div class="t">SUBMIT</div><b>A future-dated price carries a valid signature</b></div>
<div class="rx-g g3"><div class="t">PAYOUT</div><b>About 20 loop trades draw payouts from the vault</b></div>
<div class="rx-g g4"><div class="t">DETECT</div><b>Blockaid detects it; halted within an hour</b></div>
</div>
</figure>

Detection worked while the attack was under way and helped confine the loss to about five minutes. A case where the signature was valid but the signing side had been compromised is the [Taiko bridge](/critical/briefs/074-taiko-bridge-prover-key-leak/) (a leaked prover key let a fake withdrawal pass as valid).

## 4. What Lemma does

**Lemma builds the check in section 03 into the step that reflects outside data in a payout.** It is not a replacement for signature verification; after it, and before the payout, it checks, separately from the validity of the signature, whether the signer is legitimate, uncompromised and authorized right now and whether the data is within its plausibility bounds.

### Industries and operations to watch

- **Industry · Finance**: Protocols and exchanges that finalize payouts or settlements on oracle prices and signatures. Setups where a valid signature is the end point of acceptance.

### Current controls vs Lemma

The route in this case is column 1 (accepting a signed price report). Column 2 covers the spread of harm while trading proceeds after acceptance; here Blockaid's detection and the halt of trading worked.

| Control | Accepting a signed price report | Spread of harm while under way |
| --- | --- | --- |
| Signature verification | Not effective | Not relevant |
| On-chain anomaly monitoring and halting trading | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

Signature verification correctly passed reports with valid signatures. Whether the signer was compromised or the data was future-dated fakery cannot be told from the signature. On-chain anomaly monitoring and the halt of trading worked after the trades began producing anomalous results and helped confine the loss to about five minutes, but they do not work before the data is connected to a payout. Before a price report is reflected in a payout, Lemma checks, separately from the validity of the signature, that the signer is legitimate, uncompromised and authorized right now and that the data meets its plausibility bounds. A record is kept per payout, so which signer's data a payout was made on can be confirmed afterwards.

Note: Lemma's check works only when it is built into the mechanism that reflects price reports in payouts and the signer's authorization and the plausibility bounds are managed outside the signing key. If the authorization is managed in the same place as the compromised key or environment, the check can be passed. Fake data that stays within the plausibility bounds is not stopped by the bounds. How the signer key was compromised has not been disclosed. For the spread of harm while under way, Lemma checks each payout, so later payouts would not pass on the validity of the signature alone; whether that would have happened here has not been disclosed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that finalize payouts on outside data

- Before reflecting it, do you confirm that the data you accept is within its plausibility bounds (timestamp consistency, acceptable price range)?
- Is authorization something you can confirm separately from holding a key, so that one compromised signer key does not finalize a payout on the signature alone?
- Do you keep a record, checkable afterwards, of which signer's data a payout was finalized on?

## 5. Facts and timeline

- **Service**: Ostium, a decentralized exchange offering RWA-linked perpetual futures on Arbitrum. What was affected was the public liquidity vault (the Ostium Liquidity Provider vault, OLP).
- **Confirmed**: 2026-07-15, roughly five minutes from 14:18 to 14:23 UTC. Co-founder Kaledora Kiernan-Linn confirmed the time window and the impact on the OLP.
- **Method**: The attacker compromised an oracle signer key. They submitted price reports with future-dated timestamps, making losing trades appear to be winning trades. Through delegated actions they ran roughly 20 loop trades, manufacturing fictitious profits without taking on real market exposure, and drew payouts from the vault.
- **Scale of the drain**: Figures range by source, from the roughly $18 million (USDC) confirmed by a co-founder to as much as roughly $24 million in some reports. The roughly $18 million corresponds to about 28% of the protocol's TVL (roughly $63 million).
- **Detection and response**: The blockchain security firm Blockaid detected the attack while it was in progress. Ostium grasped it within minutes and halted trading within an hour. It said it is coordinating with law enforcement, SEAL 911 and third-party security experts.
- **Key compromise**: How the key was compromised (leak, theft, custody failure, etc.) is not officially established.

### Timeline

- **2026-07-15**: The attack occurs from 14:18 to 14:23 UTC. Within roughly five minutes, some 20 loop trades using future-dated price reports are executed and payouts are drawn from the OLP vault. Blockaid detects the in-progress attack; Ostium grasps it within minutes and halts all trading within an hour.
- **2026-07-15 to 16**: A co-founder confirms the time window and the OLP impact, and states that it is coordinating with law enforcement, SEAL 911 and third-party experts. The confirmed total loss, the root cause, the final post-mortem and any compensation plan are unpublished as of this point.

> The technical facts rely on Blockaid's detection, confirmation by an Ostium co-founder, and reporting by media (CoinDesk, Decrypt and others). The loss figure ranges by source from roughly $18 million to as much as roughly $24 million, and the root cause, including how the signer key was compromised, awaits the official post-mortem. Consult the latest primary sources. What was not disclosed does not mean controls were absent.

### After disclosure

- **Ostium**: Grasped the attack within minutes and halted all trading within an hour. A co-founder confirmed the time window (14:18 to 14:23 UTC) and the impact on the OLP vault, and stated that it is coordinating with law enforcement, SEAL 911 and third-party security experts. The confirmed total loss, the root cause of the key compromise, the final post-mortem and any compensation plan are unpublished as of this writing.
- **Blockaid**: The blockchain security firm detected and flagged the attack while it was in progress, leading to the halt of trading.
- **Context**: This case sits within the continuing 2026 line of DeFi attacks originating from oracles and signer keys.

## 6. Sources

- **CoinDesk (primary reporting)**: "Ostium loses $18 million in oracle attack that gamed its own price-feed infrastructure" (2026-07-15) — <https://www.coindesk.com/business/2026/07/15/ostium-suffers-usd18-million-exploit-as-oracle-attack-wave-continues-to-hit-defi>
- **crypto.news (Blockaid detection)**: "Blockaid uncovers $18M exploit that forces Ostium halt" (2026-07-15) — <https://crypto.news/blockaid-uncovers-18m-exploit-that-forces-ostium-halt/>
- **Decrypt**: "Another DeFi Exploit: Perp DEX Ostium Loses $18 Million in Oracle Attack" (2026-07-15) — <https://decrypt.co/373566/defi-exploit-ostium-oracle-hack>
- **The Defiant**: "Ostium Halts Trading After Oracle Exploit Drains up to $18M from Vault" (2026-07) — <https://thedefiant.io/news/hacks/ostium-halts-trading-after-oracle-exploit-drains-up-to-usd18m-from-vault>
- **CryptoSlate (method explainer)**: "How prices from the future fooled a crypto oracle into paying out up to $24 million" (2026-07) — <https://cryptoslate.com/how-prices-from-the-future-fooled-a-crypto-oracle-into-paying-out-up-to-24-million/>
