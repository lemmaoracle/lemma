---
brief_no: 136
title: "x402 決済のファシリテーター 15 社すべてで違反が見つかった — 支払いの検証と決済の確定が、行動の前に結び付いていない"
title_en: "All 15 x402 payment facilitators were found in violation — payment verification is never bound to settlement before the action"
pillar: 03-agent-authority
primary_category: agent-payment-abuse
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-07-21
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["104-webmcp-mid-session-tool-injection", "047-openclaw-agent-phishing", "135-zombie-cards-visa-contactless-expiry"]
status: published
version: "1.0"
og_lead_ja: "x402 のファシリテーター 15 社すべてで違反、検証と決済確定が未結合"
og_lead_en: "All 15 x402 facilitators in violation; verification isn't bound to settlement"
---

## 1. TL;DR

In x402, the payment standard behind autonomous AI-agent transactions, **all 15 facilitators mediating those payments were found in violation** of the eight verification and settlement rules the researchers defined — 49 violations, consolidated into 31 distinct vulnerabilities, with two Free Shopping cases validated end to end. Detection worked. **What didn't work was a layer that independently binds "the payment proof was verified" to "settlement actually finalized" before a merchant acts.**

## 2. What happened

- x402 extends the HTTP 402 (Payment Required) status code so that Web APIs and autonomous AI agents can pay per request. Both the verification of a client's signed payment proof and the execution of on-chain settlement are delegated to a shared middleware layer: "facilitators."
- A team from EPFL and Zhejiang University, with an independent researcher (Qinying Wang, Yong Yang, Yuan Chen, Shouling Ji, Mathias Payer), ran the first systematic security study of the 15 major facilitators covering 99% of observed transactions and 98% of payment volume. Those 15 served over 60,000 sellers and 360,000 buyers.
- The team defined eight verification and settlement rules facilitators must satisfy, then tested real-world deployments. **All 15 violated at least one rule** — 49 violations in total, consolidated into 31 distinct vulnerabilities.
- The demonstrated scope is narrow. Two Free Shopping cases were validated end to end, and ten more classified as high-risk, where actual loss turns on whether a merchant releases service without waiting for settlement. Three Gas Abuse instances and one ERC-6492 asset-theft path were confirmed; for the latter, the controlled proof of concept induced a token approval only — **no funds were actually moved**.
- Concentration is high. Of the 53,576 merchant servers observed, only 3,629 (6.77%) connected to more than one facilitator — over 93% were bound exclusively to a single one. Coinbase alone processed 77.17 million transactions worth $26.85 million.

The violations map to four attack classes:

1. **Free Shopping** — a merchant releases service before a single valid, non-replayed payment has settled.
2. **Asset Theft** — an attacker gains a route to facilitator-held assets.
3. **Service Denial** — failing or resource-heavy settlements jam the facilitator's payment lane.
4. **Gas Abuse** — the facilitator ends up covering the attacker's execution costs.

## 3. Timeline — disclosure and response

- 2025-10-01 to 12-26: The team analyzed over 119 million Base and Solana transactions to measure x402 adoption and facilitator concentration.
- 2026-01: The researchers responsibly disclosed to 14 of the 15 facilitators.
- 2026-07-21: The paper, "When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments," was posted to arXiv and accepted to USENIX Security 2026.

> This Brief covers a research demonstration, not a real-world breach. The roughly $202,000 in gas and fees observed over the analysis window (about $5,800 of it tied to reverts) is a baseline operational measurement, not attack losses. The researchers ran no gas-drain or availability-degrading experiments. What was shown is that the paths exist, not the extent of real-world harm. The paper also anonymizes its per-facilitator violation table, so as a rule no vulnerability is attributed to a named facilitator — though some behavior is named, such as the Coinbase Flask SDK (≤ v0.2.1) returning the protected resource immediately after verification succeeds without gating on settlement. The researchers also note that passing their checks does not mean a facilitator is generally secure.

Points and response:

- Coinbase, PayAI, and Mogami collectively acknowledged six vulnerabilities, some fixed and others in progress — evidence that the protocol is capable of improvement.
- But with the report anonymized, merchants have no way to learn which violations their own facilitator carries. Their only basis for deciding remains the facilitator's response.

## 4. Why it wasn't stopped

The failure this research surfaced is not about the precision of cryptographic signature checks, nor about any single facilitator's engineering quality. It is that **no layer independently bound the fact that a facilitator verified a payment proof to the fact that settlement had actually finalized on-chain, before a merchant acted**.

x402 concentrates trust in the facilitator by design. Rather than checking on-chain state themselves, merchants decide whether to release service based on the facilitator's response. Detection worked — the researchers' semi-automated black-box tool surfaced violations across all 15. What didn't work sits earlier: a control that keeps service from being released until settlement is confirmed, guaranteed independently of the mediating layer's say-so. That two Free Shopping cases were reproduced end to end shows this **detection–proof gap** is not merely theoretical.

> "The payment proof was verified" and "settlement finalized" are two separate facts. In a design that infers the second from the first, one path that breaks the inference is enough for a merchant to hand over service without ever being paid.

The pattern of agents initiating their own payments echoes the mid-session authority drift covered in [Brief 104](/critical/briefs/104-webmcp-mid-session-tool-injection/). And [Brief 135](/critical/briefs/135-zombie-cards-visa-contactless-expiry/), where the value a terminal read was never collated against the issuer's signed record, points the same way. The common thread: the value the permitting party looks at is not bound to the record that would back it.

## 5. What proof would have changed

Proof up front replaces "release service because the facilitator said so" with "release service because settlement was independently verified." It does not raise any facilitator's implementation quality. It lets a merchant check, before acting, without depending on that quality.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Settlement proof before the action</strong>: before service is released, require the fact of settlement as proof independent of the mediating layer's response.</li>
<li><strong>Reserving and binding uniqueness</strong>: reserve and verifiably record nonces and transaction uniqueness, ruling out replay of the same payment proof before the action.</li>
<li><strong>Binding verification to settlement</strong>: let the merchant collate the outcome of payment-proof verification against the fact of settlement, rather than through a single facilitator response.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>Closing implementation bugs in individual facilitators is the work of those vendors and their auditors. This layer sits after that, so a merchant can still check before acting even when bugs remain.</li>
<li>It does not set gas economics or fee policy. The service-denial and gas-abuse paths themselves belong to the facilitator's resource design.</li>
<li>Proof can show that settlement finalized, not that the transaction was commercially sound.</li>
</ul>

This is where it differs from after-the-fact transaction records. A record persists after settlement, but it is no basis for judging, at the moment of action, whether service should have been released before settlement completed.

Detection and this layer are complements, not substitutes. The former surfaces rule violations and reduces the number of open paths; the latter makes it verifiable, before a transaction completes, that service is not released until settlement is confirmed.

## 6. Sources

- **arXiv (primary, paper)**: Wang, Yang, Chen, Ji, Payer, "When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments" (arXiv:2607.19545, 2026-07-21, accepted to USENIX Security 2026) — <https://arxiv.org/abs/2607.19545>
- **CryptoSlate (independent)**: "31 newly discovered vulnerabilities expose 99% of x402 crypto payments to asset theft and free shopping" — <https://cryptoslate.com/31-newly-discovered-vulnerabilities-expose-99-of-x402-crypto-payments-to-asset-theft-and-free-shopping/>
- **CryptoSlate (independent)**: "Coinbase and 14 other x402 facilitators failed security tests built for the coming AI-agent economy" — <https://cryptoslate.com/coinbase-and-14-other-x402-facilitators-failed-security-tests-built-for-the-coming-ai-agent-economy/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority). On binding proof into payments, see [Trust402](/trust402/).

Vendor remediation status reflects public statements; because the paper anonymizes its violation table, no vulnerability is mapped to a named facilitator here.
