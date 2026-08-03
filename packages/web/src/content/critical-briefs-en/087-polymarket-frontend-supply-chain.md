---
brief_no: 87
title: "Polymarket：正規サイトに信頼されたまま、第三者ベンダー経由で注入された JavaScript が利用者に偽の承認をさせた"
title_en: "Polymarket: Malicious JavaScript Injected via a Compromised Third-Party Vendor Tricked Users Into Approving Fraudulent Transactions"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "081-bybit-safe-wallet-ui-injection", "004-megalodon-github-supply-chain", "059-vercel-contextai-oauth"]
status: "published"
version: "1.0"
og_lead_ja: "Polymarket：第三者依存への JS 注入で利用者に偽承認、約300万ドル流出（コントラクトは無傷）"
og_lead_en: "Polymarket: JS injected via a third-party dependency drove fake approvals, ~$3M drained (contracts intact)"
gap_detected: "Polymarket's rapid disclosure, removal of the affected dependency, user notification and full reimbursement, and the fund tracing by PeckShield and Bubblemaps all operated."
gap_missing: "There was no layer that independently verified, before execution, whether the front-end code running in the user's browser carried the legitimate provenance distributed by Polymarket, so the approval target was swapped from inside the legitimate domain."
gap_fix: "Independently verify the provenance of the front-end code and the transaction being approved with Lemma before execution and approval, and do not start an approval session unless legitimate provenance is confirmed."
---

## 1. TL;DR

A user of the prediction-market platform Polymarket opened the legitimate site as usual, approved a transaction, and lost about $3 million worth of assets. Neither the smart contracts nor the backend were compromised. The attacker compromised a third-party vendor dependency component loaded by the front end and injected malicious JavaScript into Polymarket's legitimate site. That script ran in the user's browser and requested a fraudulent wallet approval in a form that looked, to the user, like a "legitimate operation." What was stolen was the platform's settlement stablecoin pUSD (Polymarket USD, USDC-collateralized), which was swapped into about 1,893 ETH and bridged from Polygon to Ethereum. The damage was confined to fewer than 15 accounts, but users had no means to confirm, before execution, whether "the front-end code now running in my browser is the legitimate one distributed by Polymarket." The post-discovery removal of the site dependency, user notification, and pledge of full reimbursement all functioned, but there was no layer that independently verified the provenance of the code before execution.

---

## 2. What happened

- **Subject**: The web front end of Polymarket (a crypto-based prediction-market platform) and its users' wallets
- **Scale of loss**: About $3 million worth of crypto assets. Fewer than 15 accounts were affected
- **Date of disclosure**: 2026-06-26 (disclosed by Polymarket; BleepingComputer and OffSeq Radar reported the same day, and Rescana published a structural analysis in late June 2026)
- **Origin of the compromise**: A third-party vendor dependency component (a software dependency) loaded by the front end was compromised. In MITRE ATT&CK this corresponds to T1195.002 (Supply Chain Compromise: Compromise Software Dependencies and Development Tools)
- **Core of the exploit**: Through the compromised dependency, malicious JavaScript was injected into Polymarket's legitimate site. When users visited the site, the script ran inside their browser and requested a fraudulent wallet approval in a form that looked like a "legitimate transaction" (T1059.007 JavaScript / T1189 Drive-by Compromise / T1566.002 phishing via service)
- **Flow of funds**: What was stolen was Polymarket's settlement stablecoin pUSD ([Polymarket USD](https://docs.polymarket.com/concepts/pusd), USDC-collateralized; some reporting also writes it as ParionUSD/ParyonUSD, but this refers to the same token). The attacker swapped it into about 1,893 ETH and bridged it from Polygon to Ethereum (traced by PeckShield and Bubblemaps)
- **Scope not compromised**: Polymarket's backend, servers, and smart contracts were not compromised. The damage was confined to the front end and user operations
- **Response**: Polymarket promptly removed the affected dependency from its systems and notified affected users. It pledged full reimbursement
- **Context**: The method is of the same type as Magecart-style JavaScript injection targeting e-commerce and crypto platforms, and no high-confidence attribution to a specific threat actor has been made

The incident came together as the following chain.

1. **Compromise of a third-party dependency**: A vendor-provided dependency component loaded by Polymarket's front end is compromised by the attacker. Polymarket's own codebase and servers are not compromised
2. **JS injection into the legitimate site**: Via the compromised dependency, malicious JavaScript is delivered onto Polymarket's legitimate domain. From the user's perspective, the site remains legitimate
3. **In-browser execution**: When a user visits Polymarket, the injected script runs in their browser. Simply reaching and operating the site is enough to be affected (drive-by)
4. **Fake approval request**: The script requests a fraudulent wallet approval (transaction signature) in a form that looks, to the user, like a "legitimate transaction." The user approves it, believing it to be an operation on the legitimate site
5. **Theft of assets**: The approved transaction withdraws pUSD from the user's wallet
6. **Swapping and bridging of funds**: The attacker swaps the pUSD into about 1,893 ETH and bridges it from Polygon to Ethereum to consolidate the funds
7. **Response**: Polymarket removes the affected dependency and notifies users and pledges full reimbursement. PeckShield and Bubblemaps trace the funds (an after-the-fact sequence that operates after the approval has gone through)

---

## 3. Timeline — disclosure and response

- Before 2026-06-26 (estimated): The third-party vendor dependency loaded by the front end is compromised, and malicious JavaScript is injected into the legitimate site
- 2026-06-26: The injected script runs in users' browsers, fewer than 15 accounts perform fraudulent wallet approvals, and about $3 million worth is drained. The pUSD is swapped into about 1,893 ETH and bridged Polygon→Ethereum
- 2026-06-26: Polymarket discloses the case. BleepingComputer and OffSeq Radar report it. Polymarket pledges removal of the affected dependency and full reimbursement
- Late June 2026: Rescana publishes a supply-chain structural analysis (citing the tracing by PeckShield and Bubblemaps)

> Note: The scale and attribution draw on Polymarket's disclosure and external analyses (Rescana, BleepingComputer, PeckShield, Bubblemaps). This Brief records the values confirmable as of the time of investigation, avoids assertion, and makes the sources explicit. The stablecoin stolen is Polymarket's settlement pUSD (Polymarket USD, USDC-collateralized); ParionUSD/ParyonUSD in some reporting is a naming variation referring to the same token.

The response and industry movement after disclosure:

- **Polymarket**: Disclosed the case and removed the affected third-party dependency from its systems. Notified affected users and pledged full reimbursement. Confirmed that the backend and smart contracts were not compromised
- **Rescana**: Published a supply-chain structural analysis, presenting a mapping to MITRE ATT&CK (T1195.002 and others) and a generalization of third-party dependency risk
- **PeckShield / Bubblemaps**: Traced the flow of funds, including the pUSD→ETH swap and the Polygon→Ethereum bridge
- **Cross-industry point**: Because DeFi and crypto platforms have many third-party dependencies and user operations are mediated via web wallets, continuous auditing of front-end dependencies, integrity verification of delivered code, and user education (distinguishing suspicious approval requests) were again shared as points of defense

"How to independently verify, before execution and separately from the legitimacy of the domain, the provenance of the code riding on a web front end" is expected to advance as a point of DeFi front-end design discussion in the wake of this case.

---

## 4. Why it wasn't stopped

The central failure primitive is that **while it could be confirmed that the front-end code running in the user's browser was "delivered from the legitimate domain," whether "that code was the legitimate one distributed by Polymarket (its provenance)" was not independently verified before execution**. The legitimacy of the domain (TLS, the look of the URL) does not guarantee the provenance of the code riding on it. The attacker did not need to break the cryptography or Polymarket's servers, and instead intervened in "the provenance of the delivered code" — the third-party dependency mixed into the front end.

This incident shares its root with [Brief No.030](/critical/briefs/030-stripe-trusted-channel-skimmer/) (the Magecart case in which Stripe's trusted API infrastructure was repurposed for the delivery and storage of card-skimming code). In both, "the provenance of the code riding on a trusted channel" was contaminated, and malicious code reached users via a route that looked legitimate. With [Brief No.081](/critical/briefs/081-bybit-safe-wallet-ui-injection/) (Bybit, where JS injection into the Safe{Wallet} front end left signers unable to confirm "what they were signing"), it forms two sides of the same coin: the content displayed in the signing/approval UI and the object actually signed/approved diverged without being independently verified on the user's side. With [Brief No.004](/critical/briefs/004-megalodon-github-supply-chain/) (Megalodon, where malicious code was mixed into legitimate distribution artifacts via the GitHub supply chain), it connects through the structure of mixing malicious code into legitimate artifacts from the development/distribution upstream. With [Brief No.059](/critical/briefs/059-vercel-contextai-oauth/) (where OAuth handed to an AI tool became a direct intrusion path through a vendor compromise), it is adjacent in that trust in a third-party vendor became the propagation path of the compromise.

Polymarket's rapid disclosure, removal of the affected dependency, user notification and pledge of full reimbursement, and the fund tracing by PeckShield and Bubblemaps are indispensable for grasping, containing, and remediating the harm, and this Brief does not deny that role. In fact, the scoping of the damage and the per-account reimbursement were carried forward by this detection and analysis. Detection did indeed function.

At the same time, detection does not change "what is executed and what is approved" on the receiving side (the user's browser that runs the front-end code, the person being asked to approve). The user operated a legitimate-looking UI on a legitimate domain, but had no means to confirm, before execution, whether "the front-end code now running is the legitimate one distributed by Polymarket." The malicious JS swapped the approval target from inside the legitimate site, outside the user's confirmation actions. The legitimacy of the domain proves "where the site is," but not "the provenance of the code riding on it." What was missing is a layer that, before the front-end code executes, independently verifies "whether this code carries the legitimate provenance distributed by Polymarket." Even if after-the-fact detection fires for fund tracing and reimbursement, it does not stop the withdrawal at the moment the approval goes through.

---

## 5. What proof would have changed

Pre-execution attestation fixes the provenance of the front-end code running in the user's browser and of the transaction being signed/approved, before execution and approval, as cryptographic proof that can be independently verified. It attests in advance that the delivered code "carries legitimate provenance," and does not start an approval session unless that provenance is confirmed. Without separating the confirmation of the legitimate domain (the detection-style "the site looks real") from the pre-execution attestation of the delivered code's provenance ("the code I am executing is the legitimate artifact"), and only when the two overlap, can asset operations across a web front end be placed on practical footing with confidence. Detection and pre-execution proof are not substitutes but **complements**.

Against the gap between detection and proof this case exposed (even on a legitimate domain, the provenance of the delivered front-end code is not independently verified before execution and approval), Lemma proposes the following design.

- **Provenance proof of delivered code**: Fix the fact that the front-end code running in the user's browser "is a legitimate artifact" as a provenance proof that can be independently verified before execution, and exclude tampered/injected code in advance
- **Fixing the provenance of the approval target**: Attest in advance, independently of the UI display, that the transaction being signed/approved "was generated through a legitimate business flow," and detect divergence between the display and the approval target before execution
- **Domain legitimacy ≠ code provenance**: Do not conflate the fact that "the site is a legitimate domain" with the fact that "the code riding on it carries legitimate provenance," and make the latter the object of pre-execution attestation
- **Selective disclosure**: Without disclosing the entire delivery pipeline, prove with minimal disclosure only that "this code carries legitimate provenance"

Detection (after-the-fact dependency removal, fund tracing, reimbursement) works toward remediation of harm, and pre-execution attestation (independent verification, before execution and approval, of the provenance of the code and the approval target) works toward establishing trust in asset operations across a web front end; the two operate complementarily.

---

## 6. Sources

- **Rescana**: “Polymarket Supply-Chain Attack Analysis: $3 Million Cryptocurrency Theft via Compromised Third-Party Dependency” (2026-06-29) — <https://www.rescana.com/post/polymarket-supply-chain-attack-analysis-3-million-cryptocurrency-theft-via-compromised-third-party-dependency>
- **BleepingComputer**: “Polymarket customers lose $3 million in supply chain attack” (2026-06-26) — <https://www.bleepingcomputer.com/news/security/polymarket-customers-lose-3-million-in-supply-chain-attack/>
- **Decrypt**: “Polymarket to Refund Users After Scammers Swipe Millions in Website Exploit” (2026-06) — <https://decrypt.co/372129/polymarket-refund-users-scammers-swipe-millions-website-exploit>
- **The Next Web**: “Polymarket confirms hackers stole $3 million from users after third-party vendor was compromised” (2026-06) — <https://thenextweb.com/news/polymarket-hack-3-million-stolen-third-party-breach>
- **TechRadar Pro**: “Prediction market giant Polymarket hit by cyberattack…” (2026-06) — <https://www.techradar.com/pro/security/prediction-market-giant-polymarket-hit-by-cyberattack-with-company-confirming-user-funds-stolen-here-is-what-we-know>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/#provenance), [Seal](https://lemma.frame00.com/seal/)
