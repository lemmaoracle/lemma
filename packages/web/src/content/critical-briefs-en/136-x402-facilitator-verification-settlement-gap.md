---
brief_no: 136
title: "x402 決済のファシリテーター：検証・決済のルールへの違反が、調べた全社で報告された(EPFL などの研究、USENIX Security 2026)"
title_en: "x402 payment facilitators: violations of verification and settlement rules were reported at every one studied (EPFL et al., USENIX Security 2026)"
pillar: 03-agent-authority
primary_category: agent-payment-abuse
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-07-21
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["104-webmcp-mid-session-tool-injection", "047-openclaw-agent-phishing", "135-zombie-cards-visa-contactless-expiry"]
status: published
gate: "payment-instruction"
version: "1.0"
og_lead_ja: "x402 決済のファシリテーター 15 社すべてに、検証・決済のルールへの違反があると研究チームが報告"
og_lead_en: "Researchers report rule violations at all 15 x402 payment facilitators they studied"
layout: "report"
sections: "proof"
og_kicker_ja: "攻撃の実証 · エージェントの決済"
og_kicker_en: "ATTACK RESEARCH · AGENT PAYMENTS"
og_headline_ja: "決済の確定の前に、\nサービスが渡りうると報告。\n<accent>15 社すべてで違反</accent>"
og_headline_en: "Researchers: service may\ngo out before settlement.\n<accent>Violations at all 15</accent>"
key_figures:
  - value: "15"
    unit: "facilitators"
    label: "Major facilitators the researchers studied. All were reported to violate at least one of the eight rules the team defined"
    tone: "alert"
  - value: "31"
    unit: "vulnerabilities"
    label: "Distinct vulnerabilities consolidated from 49 violations (the researchers' assessment)"
  - value: "2"
    unit: "cases"
    label: "Free Shopping cases validated end to end. Ten more were classified as high-risk"
glossary:
  - term: "x402"
    desc: "A payment standard extending the HTTP 402 (Payment Required) status code, so that Web APIs and AI agents can pay per request for services."
  - term: "Facilitator"
    desc: "In x402, the shared middleware that verifies a client's signed payment payload and executes on-chain settlement. Merchants release service based on its response."
  - term: "Free Shopping"
    desc: "In the researchers' classification, a merchant releasing service before a single valid, non-replayed payment has settled."
insight:
  slug: "settlement-not-checked-before-release"
  label: "Service released on the intermediary's word"
  quote: "Unless settlement is checked independently of the intermediary's response before service is released, service can go out without payment ever arriving."
industries: ["finance", "ai"]
controls:
  - slug: "hold-unverified"
    item: "Do not deliver the service until settlement is confirmed"
countries: ["global"]
impact: "At least one rule violation at all 15 facilitators studied (as reported by the researchers)"
takeaway: "The researchers classified actual loss as turning on whether a merchant releases service without waiting for settlement."
self_check: "Before releasing service, do you check that payment has settled, independently of the response from the party mediating it?"
---

## 1. Summary

In x402, verification of payment and execution of on-chain settlement are delegated to shared intermediaries called facilitators, and merchants release service based on their responses. The researchers defined the verification and settlement rules those intermediaries should meet, tested real-world deployments, and reported paths by which service is released before payment settles. This is a research demonstration and does not assert real-world harm. <strong>Unless settlement is checked independently of the intermediary's response before service is released, service can go out without payment ever arriving.</strong>

## 2. What got through

- **What got through**: A merchant releasing service before a single valid, non-replayed payment had settled (Free Shopping, in the researchers' classification). The team validated two such cases end to end.
- **What reached the receiving side**: In general, x402 merchants do not check on-chain state themselves; they release service based on the facilitator's response. For ten high-risk cases, the researchers classified actual loss as turning on whether a merchant releases service without waiting for settlement.
- **Not disclosed**: Which facilitator carries which violation (the paper anonymizes its table, naming only some behavior). The extent of real-world harm (what the team showed is that the paths exist).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a merchant releases service, it checks that the payment has settled on-chain and has not been used before, independently of the facilitator's response.

- **Who approves**: The merchant releasing the service. What it checks is the fact that settlement finalized, not the intermediary's "verified" response.
- **Where it is checked**: Immediately before the protected resource or service is returned. The result of payment verification is matched against settlement; if settlement cannot be confirmed, service is held.
- **What is recorded**: Which payment check service was released (or held) on, and when. Later, it shows whether anything was handed over before payment arrived.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means a merchant checking, before releasing service, that payment has settled independently of the intermediary's response, and keeping a record. Detection means researchers finding violations through testing and reporting them. Dates are those of the analysis, disclosure, and paper.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before service is released, check settlement independently of the intermediary's response</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>At least one rule violation at all 15 (the researchers' assessment)<br>Two Free Shopping cases validated end to end</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>A semi-automated black-box tool surfaced violations across all 15</div>
<div class="rx-g g1"><div class="t">2025-10-01</div><b>Transaction analysis begins</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>Disclosed to 14 facilitators</b></div>
<div class="rx-g g3"><div class="t">2026-07-21</div><b>Paper posted to arXiv</b></div>
<div class="rx-g g4"><div class="t">After publication</div><b>Three vendors acknowledge six vulnerabilities</b></div>
</div>
</figure>

The researchers' testing surfaced violations at all 15. What was missing is the layer before that, which checks settlement before service is released. By design, x402 merchants decide based on the facilitator's response, and over 93% of the merchant servers observed were bound to a single facilitator (the researchers). It has the same shape as [Brief 104](/critical/briefs/104-webmcp-mid-session-tool-injection/) (WebMCP), where authority drifted mid-session, and [Brief 135](/critical/briefs/135-zombie-cards-visa-contactless-expiry/) (Visa contactless cards), where the value a terminal read was never checked against the issuer's record: the value the permitting party looks at is not tied to the record that would back it.

## 4. What Lemma does

**Lemma puts the pre-execution check immediately before a merchant releases service.** It does not fix facilitator implementations or detect violations; before service is released, it checks that payment has settled and has not been used before, independently of the intermediary's response.

### Industries and operations to watch

- **Industry · Finance & payments**: Businesses mediating per-request payments such as x402, and merchants accepting them to provide APIs or data.
- **Industry · AI**: Organizations providing or operating systems in which AI agents initiate their own payments to use services.

### Current controls vs Lemma

The route validated end to end in this case is the first column: releasing service before settlement. The second column compares other paths the researchers confirmed that load the facilitator's resources.

| Control | Releasing service before settlement (Free Shopping) | Load on facilitator resources (Service Denial, Gas Abuse) |
| --- | --- | --- |
| Payment verification by the facilitator | Partial | Not relevant |
| Rule-violation testing (such as the researchers' black-box tool) | Partial | Partial |
| Vendor fixes for vulnerabilities | Partial | Partial |
| Facilitator resource design (gas and fee policy) | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant |

Facilitators did verify payments, yet in the researchers' assessment all 15 violated at least one rule. Testing and fixes reduce the number of open paths, but the paper anonymizes its violation table, so merchants have no way to learn which violations their own facilitator carries. Lemma checks settlement and payment uniqueness before service is released, rather than relying on what the facilitator's response says. A record is also kept, so which payment check service was released on, and when, can be confirmed later.

Note: Lemma's check works only when it is built into the step where the merchant returns service, and settlement can be obtained through a path other than that facilitator's response. If settlement information comes only from the same intermediary's response, it can pass. Lemma does not close implementation bugs in facilitators, and has no part in gas or fee design. It can check whether settlement finalized, not whether the transaction was commercially sound. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that accept per-request payments such as x402

- Do you confirm, before releasing service, that the same payment has not been used before?
- Is service set to be withheld when settlement cannot be confirmed?
- Do you know which facilitators you connect to, and the status of their published fixes?

## 5. Facts and timeline

- **Standard**: x402, which extends the HTTP 402 (Payment Required) status code so that Web APIs and autonomous AI agents can pay per request. Both verification of a client's signed payment payload and execution of on-chain settlement are delegated to facilitators.
- **Researchers**: A team from EPFL and Zhejiang University, with an independent researcher (Qinying Wang, Yong Yang, Yuan Chen, Shouling Ji, Mathias Payer). Paper: "When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments."
- **Scope**: The 15 major facilitators covering 99% of observed transactions and 98% of payment volume, serving over 60,000 sellers and 360,000 buyers.
- **The researchers' assessment**: The team defined eight verification and settlement rules facilitators must satisfy and tested real-world deployments. All 15 violated at least one rule: 49 violations in total, consolidated into 31 distinct vulnerabilities.
- **Demonstrated scope**: Two Free Shopping cases validated end to end. Ten more were classified as high-risk, where actual loss turns on whether a merchant releases service without waiting for settlement. Three Gas Abuse instances and one ERC-6492 asset-theft path were confirmed; for the latter, the controlled PoC induced a token approval only, and no funds were actually moved.
- **Attack classes (researchers)**: Free Shopping (service released before payment settles), Asset Theft (a route to facilitator-held assets), Service Denial (failing or resource-heavy settlements jam the payment lane), and Gas Abuse (the facilitator ends up covering the attacker's execution costs).
- **Concentration**: Of the 53,576 merchant servers observed, only 3,629 (6.77%) connected to more than one facilitator; over 93% were bound exclusively to a single one. Coinbase alone processed 77.17 million transactions worth $26.85 million.

### Timeline

- **2025-10-01**: The team begins analyzing over 119 million Base and Solana transactions, through 12-26, to measure x402 adoption and facilitator concentration.
- **2026-01**: The researchers responsibly disclose to 14 of the 15 facilitators.
- **2026-07-21**: The paper is posted to arXiv and accepted to USENIX Security 2026.

> This Brief covers a research demonstration, not a real-world breach. The violations are assessed against rules and tests the researchers defined, and the researchers note that passing their checks does not mean a facilitator is generally secure. The roughly $202,000 in gas and fees observed over the analysis window (about $5,800 of it tied to reverts) is a baseline operational measurement, not attack losses. The researchers ran no gas-drain or availability-degrading experiments. The paper anonymizes its per-facilitator violation table, so as a rule no vulnerability is attributed to a named facilitator; some behavior is named, such as, according to the paper, the Coinbase Flask SDK (≤ v0.2.1) returning the protected resource immediately after verification succeeds without waiting for settlement. This Brief likewise does not map individual vulnerabilities to named facilitators, and vendor remediation status reflects public statements. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Coinbase, PayAI, and Mogami**: Collectively acknowledged six vulnerabilities, some fixed and others in progress.

## 6. Sources

- **arXiv (primary, paper)**: Wang, Yang, Chen, Ji, Payer, "When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments" (arXiv:2607.19545, 2026-07-21, accepted to USENIX Security 2026) — <https://arxiv.org/abs/2607.19545>
- **CryptoSlate (independent)**: "31 newly discovered vulnerabilities expose 99% of x402 crypto payments to asset theft and free shopping" — <https://cryptoslate.com/31-newly-discovered-vulnerabilities-expose-99-of-x402-crypto-payments-to-asset-theft-and-free-shopping/>
- **CryptoSlate (independent)**: "Coinbase and 14 other x402 facilitators failed security tests built for the coming AI-agent economy" — <https://cryptoslate.com/coinbase-and-14-other-x402-facilitators-failed-security-tests-built-for-the-coming-ai-agent-economy/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
