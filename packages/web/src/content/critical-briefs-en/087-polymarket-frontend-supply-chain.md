---
brief_no: 87
title: "Polymarket：第三者ベンダーの依存から注入された JavaScript が、正規サイトで利用者に偽の承認を求めた(BleepingComputer ほかの報道)"
title_en: "Polymarket: JavaScript injected through a third-party vendor dependency asked users for fake approvals on the real site (BleepingComputer and others)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "081-bybit-safe-wallet-ui-injection", "004-megalodon-github-supply-chain", "059-vercel-contextai-oauth"]
status: "published"
gate: "signing"
version: "1.0"
og_lead_ja: "Polymarket：第三者依存への JS 注入で利用者に偽承認、約300万ドル流出（コントラクトは無傷）"
og_lead_en: "Polymarket: JS injected via a third-party dependency drove fake approvals, ~$3M drained (contracts intact)"
layout: "report"
sections: "proof"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規のサイトで、\n偽の承認を求められた。\n<accent>約 300 万ドルが流出</accent>"
og_headline_en: "A real site asked\nusers to approve fakes.\n<accent>About $3M drained.</accent>"
key_figures:
  - value: "~$3M"
    label: "Crypto assets (pUSD) drained from users' wallets (reporting)"
    tone: "alert"
  - value: "Under 15"
    unit: "accounts"
    label: "Accounts that made the fraudulent approval and lost funds (reporting)"
  - value: "~1,893"
    unit: "ETH"
    label: "What the stolen pUSD was swapped into, then bridged from Polygon to Ethereum (traced by PeckShield and Bubblemaps)"
glossary:
  - term: "Dependency component"
    desc: "A part, such as a script, supplied by a third-party vendor and loaded by a website's front end. Once loaded, it runs in the browser with the same rights as the site's own code."
  - term: "Wallet approval"
    desc: "Signing a transaction in a crypto wallet to authorize it. An approved transaction can move assets out of the wallet."
  - term: "pUSD"
    desc: "Polymarket's settlement stablecoin (Polymarket USD, USDC-collateralized). ParionUSD and ParyonUSD in some reporting refer to the same token."
insight:
  slug: "real-domain-unchecked-code"
  label: "Real domain, unchecked code"
  quote: "Even code served from the real domain can swap what users are asked to approve, unless the site checks, before asking for approval, that the code is what its operator shipped."
industries: ["finance", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "Check that the code running in the browser is what Polymarket shipped"
attack_method: "supply-chain"
impact: "About $3 million worth of assets stolen"
takeaway: "JavaScript injected through a third-party vendor dependency asked users for fake approvals on the real site. Before asking for approval, check that the code running in the browser and the transaction to be approved are legitimate."
self_check: "Before asking users for an approval, do you check that the code running in their browser is what you shipped?"
countries: ["global"]
---

## 1. Summary

The attacker compromised a third-party vendor dependency loaded by Polymarket's front end and injected JavaScript into the real site. When users opened the real site, the script ran in their browser and requested a fraudulent wallet approval that looked like a legitimate transaction. Polymarket's backend, servers and smart contracts were not compromised. <strong>Even code served from the real domain can swap what users are asked to approve, unless the site checks, before asking for approval, that the code is what its operator shipped.</strong>

## 2. What got through

- **What got through**: Users' fraudulent wallet approvals (transaction signatures). Users approved, believing it was an operation on the real site, and the approved transactions withdrew pUSD from their wallets.
- **What was not compromised**: Polymarket's backend, servers and smart contracts. The harm stayed within the front end and users' operations (Polymarket).
- **What reached the receiving side**: In general, a browser runs a script served from the real domain as that site's code. What users see is the site's screen and the wallet's approval screen. Whether the code asking for approval is what the operator shipped cannot be told from the screen.
- **Not disclosed**: Which vendor's dependency was compromised, and how. When the injection began and how long the script ran (reporting estimates "before 2026-06-26"). Attribution: no high-confidence attribution to a specific actor has been made.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before asking users for approval, the site checks, separately from whether the domain is real, that the code running in the browser is what its operator shipped and that the transaction to be approved was created through the legitimate business flow.

- **Who approves**: The site operator. It registers the code it ships as its own, and registers only the approved versions of third-party dependencies.
- **Where it is checked**: Before asking a user's wallet for approval. An approval request from code that does not match the registration is not started. The transaction to be approved is also checked, separately from what the screen shows, for whether it came through the legitimate flow.
- **What is recorded**: Which code, at which version, asked for approval of which transaction. It shows only that "this code is what the operator shipped," without disclosing the whole delivery pipeline.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before asking users for approval, that the code running in the browser and the transaction to be approved are legitimate, and keeping a record. Detection means noticing after the approvals and the drain. Dates are those each party disclosed or published. The date the dependency was compromised has not been disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before asking for approval, check that the code and the transaction are legitimate</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About $3M drained<br>from under 15 accounts</span></div>
<div class="rx-zone det"><b>Detection · worked after the drain</b>Remove the dependency and trace the funds</div>
<div class="rx-g g1"><div class="t">Before 06-26</div><b>A third-party dependency is compromised (estimated)</b></div>
<div class="rx-g g2"><div class="t">06-26</div><b>Fake approvals are requested on the real site</b></div>
<div class="rx-g g3"><div class="t">06-26</div><b>Polymarket discloses and removes the dependency</b></div>
<div class="rx-g g4"><div class="t">06-29</div><b>Rescana publishes its analysis</b></div>
</div>
</figure>

Detection worked after the drain and carried forward the scoping of the damage and per-account reimbursement. A similar case, where what the approval screen showed and what was actually approved diverged, is [Bybit](/critical/briefs/081-bybit-safe-wallet-ui-injection/) (JavaScript injected into the Safe{Wallet} front end). A case where code riding on a trusted channel was contaminated is [the skimmer using Stripe's trusted channel](/critical/briefs/030-stripe-trusted-channel-skimmer/).

## 4. What Lemma does

**Lemma puts the check in section 03 at the step where users are asked for approval.** It does not replace checking that the domain is real; on top of that, before asking for approval, it checks that the code running in the browser is what the operator shipped and that the transaction to be approved came through the legitimate flow.

### Industries and operations to watch

- **Industry · Finance**: Services, such as crypto exchanges and prediction markets, that ask users' wallets for approval from a web front end.
- **Industry · Supply chain**: Websites whose front end loads dependency components supplied by third-party vendors.
- **Operation · Approvals**: Asking users to approve (sign) a transaction.

### Current controls vs Lemma

The route in this case is column 1 (the wallet approval requested by code injected into the real site). Column 2 is understanding the damage after the drain; here, removing the dependency and tracing the funds worked.

| Control | Approval requested by injected code | Understanding the damage after the drain |
| --- | --- | --- |
| Domain legitimacy (TLS, how the URL looks) | Not effective | Not relevant |
| Users checking the approval screen | Not effective | Not relevant |
| Removing the dependency and tracing funds | Not effective | Effective |
| **Lemma (pre-execution check)** | Effective | Partial |

Domain legitimacy shows where the site is, not whether the code riding on it is what the operator shipped. Users operated a real-looking screen on the real domain, and the object of approval was swapped from inside the site. Removing the dependency and tracing the funds carried forward the scoping of the damage and per-account reimbursement, but did not stop the withdrawals once the approvals went through. Lemma checks, before asking for approval, that the code running in the browser is what the operator shipped and that the transaction came through the legitimate flow. A record of which code asked for which approval is kept, so it can also help in understanding the damage afterwards.

Note: Lemma's check works only when it is built into the mechanism that asks users for approval, and the registration of shipped code and approved dependencies is managed outside the delivery path. If the registration itself is compromised, or malicious code sits inside an approved version of a dependency, this check can be passed. How the dependency was compromised has not been disclosed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that ask users for approval from a web front end

- Before asking for approval, do you check that the code running in users' browsers is what you shipped (including approved versions of third-party dependencies)?
- Do you check, separately from what the screen shows, that the transaction to be approved came through the legitimate business flow?
- Do you limit the third-party dependencies your front end loads to approved versions, and notice when they change?

## 5. Facts and timeline

- **Service**: The web front end of Polymarket (a crypto-based prediction-market platform) and its users' wallets.
- **Scale of loss**: About $3 million worth of crypto assets. Fewer than 15 accounts were affected.
- **Origin of the compromise**: A third-party vendor dependency component (a software dependency) loaded by the front end was compromised. This corresponds to MITRE ATT&CK T1195.002 (Supply Chain Compromise: Compromise Software Dependencies and Development Tools) (Rescana).
- **Method**: Through the compromised dependency, JavaScript was injected into Polymarket's real site. When users visited, the script ran in their browser and requested a fraudulent wallet approval that looked like a legitimate transaction (T1059.007 JavaScript, T1189 Drive-by Compromise, T1566.002 phishing via service; Rescana).
- **Flow of funds**: What was stolen was Polymarket's settlement stablecoin pUSD ([Polymarket USD](https://docs.polymarket.com/concepts/pusd), USDC-collateralized). The attacker swapped it into about 1,893 ETH and bridged it from Polygon to Ethereum (traced by PeckShield and Bubblemaps).
- **Not compromised**: Polymarket's backend, servers and smart contracts.
- **Context**: The method is the same type as Magecart-style JavaScript injection aimed at e-commerce and crypto platforms, and no high-confidence attribution to a specific actor has been made.

### Timeline

- **Before 2026-06-26 (estimated)**: A third-party vendor dependency loaded by the front end is compromised, and JavaScript is injected into the real site.
- **2026-06-26**: The injected script runs in users' browsers; fewer than 15 accounts make fraudulent approvals and about $3 million worth is drained. The pUSD is swapped into about 1,893 ETH and bridged from Polygon to Ethereum.
- **2026-06-26**: Polymarket discloses the case. BleepingComputer and OffSeq Radar report it. Polymarket announces removal of the affected dependency and full reimbursement.
- **2026-06-29**: Rescana publishes a structural analysis of the supply chain (citing the tracing by PeckShield and Bubblemaps).

> The scale and attribution draw on Polymarket's disclosure and external analyses (Rescana, BleepingComputer, PeckShield, Bubblemaps). This Brief records the values confirmable at the time of investigation and makes the sources explicit. The stolen stablecoin is Polymarket's settlement pUSD (Polymarket USD, USDC-collateralized); ParionUSD and ParyonUSD in some reporting are naming variations of the same token. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Polymarket**: Disclosed the case and removed the affected third-party dependency from its systems. Notified affected users and announced full reimbursement. Confirmed that the backend and smart contracts were not compromised.
- **Rescana**: Published a structural analysis of the supply chain, mapping it to MITRE ATT&CK (T1195.002 and others) and generalizing the risk of third-party dependencies.
- **PeckShield / Bubblemaps**: Traced the flow of funds, including the pUSD-to-ETH swap and the Polygon-to-Ethereum bridge.
- **Industry point**: Because DeFi and crypto platforms have many third-party dependencies and users' operations pass through web wallets, continuous auditing of front-end dependencies, integrity checks of shipped code, and user awareness (how to spot suspicious approval requests) were again shared as points of defense.

## 6. Sources

- **Rescana**: “Polymarket Supply-Chain Attack Analysis: $3 Million Cryptocurrency Theft via Compromised Third-Party Dependency” (2026-06-29) — <https://www.rescana.com/post/polymarket-supply-chain-attack-analysis-3-million-cryptocurrency-theft-via-compromised-third-party-dependency>
- **BleepingComputer**: “Polymarket customers lose $3 million in supply chain attack” (2026-06-26) — <https://www.bleepingcomputer.com/news/security/polymarket-customers-lose-3-million-in-supply-chain-attack/>
- **Decrypt**: “Polymarket to Refund Users After Scammers Swipe Millions in Website Exploit” (2026-06) — <https://decrypt.co/372129/polymarket-refund-users-scammers-swipe-millions-website-exploit>
- **The Next Web**: “Polymarket confirms hackers stole $3 million from users after third-party vendor was compromised” (2026-06) — <https://thenextweb.com/news/polymarket-hack-3-million-stolen-third-party-breach>
- **TechRadar Pro**: “Prediction market giant Polymarket hit by cyberattack…” (2026-06) — <https://www.techradar.com/pro/security/prediction-market-giant-polymarket-hit-by-cyberattack-with-company-confirming-user-funds-stolen-here-is-what-we-know>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
