---
brief_no: 123
title: "BonkDAO：約 400 万ドルで議決権を買い、低投票率のガバナンスで約 2,000 万ドルの財庫を抜いた — コントラクトは設計どおり動いた"
title_en: "BonkDAO: about $4M bought the votes to drain a $20M treasury — the contracts worked exactly as designed"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-07-06
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["108-afx-trade-validator-key-quorum", "045-humanity-protocol-multisig-key-custody", "002-stakedao-vsdcrv", "067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "BonkDAO のガバナンス乗っ取りで財庫から約2,000万ドル流出、スマートコントラクトは正常動作"
og_lead_en: "BonkDAO governance attack drained about $20M; the smart contracts ran as designed"
gap_detected: "Proposal, vote and execution were all verifiable on-chain, and every contract-level check passed."
gap_missing: "Nothing established whether the decision authority behind that vote was legitimately held or simply bought for the occasion."
gap_fix: "Require that authority over a treasury-moving decision was legitimately established, as independently verifiable proof, and block execution that carries none."
---

## 1. TL;DR

On July 6, 2026, **BonkDAO** disclosed a treasury breach. An attacker spent about $4 million acquiring BONK voting power, passed a malicious governance proposal during a low-turnout period, and moved roughly 4.4 trillion BONK — about $20 million — from the treasury to a wallet under their control. The smart contracts behaved exactly as designed and every on-chain check passed. Verification worked. **What was missing is the layer that establishes whether the decision authority behind that vote was legitimately held — not merely that the vote passed.**

## 2. What happened

- The target was BonkDAO governance, which controls the BONK community treasury on Solana.
- The attacker accumulated BONK through exchanges to secure voting power, passed a malicious proposal during a period of low turnout, and transferred roughly 4.426 trillion BONK (about $20 million) to a wallet under their control.
- Immunefi's analysis frames low turnout as making influence relatively inexpensive to purchase, and records that no smart contract failed.

The attack succeeds through the following chain.

1. The attacker buys BONK via exchanges until they hold enough voting power to carry a vote (cost: about $4 million).
2. They time a proposal moving the treasury to their own wallet for a period when few are participating.
3. The formal weight of votes is satisfied, and the proposal passes.
4. The contract executes the passed proposal as designed, paying out about $20 million.

## 3. Timeline — disclosure and response

- 2026-07-06: BonkDAO discloses the treasury breach on X — roughly $20 million in BONK drained via a malicious governance proposal.
- 2026-07-06 to 07: the market reacts. crypto.news reports a fall of about 8.5% over 24 hours, to roughly $0.0000044; other outlets put the drop between 8% and over 9%.
- 2026-08-01: Crowdfund Insider reports Immunefi's analysis, citing the incident as an example of losses shifting from code defects to the operational and authority layer.

> The figures (about $20 million / roughly 4.426 trillion BONK / about $4 million to acquire) come from the DAO's disclosure and Immunefi's analysis. The reported price drop ranges from 8% to over 9% depending on outlet. BonkDAO has not published the technical detail of how the proposal passed, so whether a quorum threshold existed, and how concentrated the voting power was, are not public as of writing. The attacker's identity, and whether any of the assets can be recovered, remain open.

The response and industry movement after disclosure:

- BonkDAO reported the incident to law enforcement and is working with exchanges, bridges, and the Solana Foundation on forensics and recovery; it says it has identified the exchange wallets used to buy BONK ahead of the proposal.
- Immunefi points to Humanity Protocol's losses of over $30 million as the same pattern: there the breach came from a compromised team member's private key, and the contract code was likewise untouched.
- Across the firm's tally of hundreds of incidents from 2021 to 2025, a disproportionate share of losses traces to operational weaknesses — exchange custody and key management rather than contract code. For 2024–2025 alone, more than half the value lost across nearly 200 events came from above the contract layer.

## 4. Why it wasn't stopped

The failure here is neither a contract bug nor a miscounted vote. **There was no layer that independently established, before execution, whether the authority behind the passed decision was legitimately held.**

Proposal, vote, and execution were all verifiable on-chain. Verification worked. What was missing came earlier: a layer that distinguishes a vote whose weight is merely formally sufficient from one whose decision authority was legitimately held rather than bought for the occasion.

> The thinner participation gets, the cheaper a decisive bloc of votes becomes. A formally valid majority is not proof of legitimate consent.

This is the governance-vote counterpart of [Brief 108](/critical/briefs/108-afx-trade-validator-key-quorum/), where compromised signing keys satisfied a quorum "validly." The difference is that here nothing leaked: the decision authority itself was acquired on the market. The structure — control one configuration layer, the treasury, and the funds move — is continuous with [Brief 045](/critical/briefs/045-humanity-protocol-multisig-key-custody/), where keys on a single machine crossed a multisig threshold; Immunefi itself places the two incidents side by side.

## 5. What proof would have changed

Proof-as-auth inserts one layer into the path ahead of each execution that moves a treasury: an independent verification that the authority behind the decision was legitimately established. Rather than treating a formally valid majority as a stand-in for legitimacy, it establishes — before execution can proceed — whether the authority to make this decision was legitimately held.

Lemma's design against this primitive:

- **Prove decision authority up front.** Before a treasury-moving proposal executes, require proof that the decision authority is legitimately held.
- **Test participation, not just tallies.** Check the substance of participation and the legitimacy of how voting power was acquired, not only the formal weight of votes.
- **Scope high-impact actions.** Impose additional independent authorization on high-impact executions such as treasury transfers, rather than committing the full balance to a single governance path.
- **Bind provenance.** Tie proposal, vote, and execution provenance together in a form that cannot be altered after the fact.

Lemma is not a product that adjudicates governance, nor one that detects malicious proposals. Its scope is to verify independently, before execution, that authority over a treasury-moving decision was legitimately established, and to hold execution that carries no such proof. On-chain verifiability and monitoring (public proposals, voting records, post-hoc forensics) and pre-execution proof (an audit trail confirming the legitimacy of decision authority before execution) are complementary, not alternatives. The first supports tracing and accountability after a transfer; the second works on the space between a formally valid decision and a legitimate one — the one place verification structurally cannot reach. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for design detail, ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/); for scope, [Pillar 01 — Verifiable Origin](/pillars/#provenance).

## 6. Sources

- **crypto.news (independent reporting)**: Lawrence Mondal, "BonkDAO reveals $20M treasury raid after malicious governance attack" (2026-07-07) — <https://crypto.news/bonkdao-reveals-20m-dollars-treasury-raid-attack/>
- **Bitcoin.com News (independent reporting, figures)**: Jamie Redman, "BonkDAO Treasury Loses $20M in Malicious Governance Attack, BONK Slides 8%" (2026-07-06) — <https://news.bitcoin.com/bonkdao-treasury-loses-20m-in-malicious-governance-attack-bonk-slides-8/>
- **FinanceFeeds (independent reporting)**: "BonkDAO Hit by Governance Attack Draining $20 Million" (2026-07-06) — <https://financefeeds.com/bonkdao-hit-by-governance-attack-draining-20-million/>
- **Crowdfund Insider (independent analysis, reporting Immunefi's findings)**: Omar Faridi, "DeFi Exploits: Crypto Hacker Spends $4M To Drain $20M From BonkDAO's Treasury, No Smart Contract Failed" (2026-08-01) — <https://www.crowdfundinsider.com/2026/08/294550-defi-exploits-crypto-hacker-spends-4m-to-drain-20m-from-bonkdaos-treasury-no-smart-contract-failed/>

> BonkDAO's own disclosure was a post on X (@bonk_inu, 2026-07-06); this Brief cites it through the wording quoted by the outlets above. Immunefi's analysis is likewise referenced via the Crowdfund Insider report rather than the original.

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 01 — Verifiable Origin](/pillars/#provenance) · [Brief 108 (AFX validator keys and quorum)](/critical/briefs/108-afx-trade-validator-key-quorum/) · [Brief 045 (Humanity Protocol key custody)](/critical/briefs/045-humanity-protocol-multisig-key-custody/)
