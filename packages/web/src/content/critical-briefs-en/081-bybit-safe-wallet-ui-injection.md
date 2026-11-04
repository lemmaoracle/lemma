---
brief_no: 81
title: "Bybit：Safe{Wallet} のフロントエンドに注入された JavaScript で、画面の表示と違う取引にマルチシグの承認が通った(Bybit の公表・Mandiant の調査)"
title_en: "Bybit: JavaScript injected into the Safe{Wallet} frontend got a multisig approval through for a transaction other than the one on screen (Bybit disclosure, Mandiant investigation)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2025-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["087-polymarket-frontend-supply-chain", "045-humanity-protocol-multisig-key-custody", "016-verus-ethereum-bridge", "067-syscoin-bridge-spv-proof-parsing", "004-megalodon-github-supply-chain"]
status: published
gate: "signing"
version: "1.0"
og_lead_ja: "Bybit：Safe{Wallet} のフロントエンドへの JS 注入で、マルチシグの承認が通り、約 15 億ドル相当の ETH が流出"
og_lead_en: "Bybit: JS injected into the Safe{Wallet} frontend got a multisig approval through, and ~$1.5B in ETH was drained"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 署名画面の改ざん"
og_kicker_en: "SUPPLY CHAIN · SIGNING UI TAMPERING"
og_headline_ja: "画面は通常の送金、\n署名したのは別の取引。\n<accent>約 15 億ドルが流出</accent>"
og_headline_en: "The screen showed\na routine transfer.\nThe signed one differed.\n<accent>~$1.5B drained.</accent>"
key_figures:
  - value: "~$1.5B"
    label: "Value of the drained ETH at the time (Bybit and FBI disclosures, reporting)"
    tone: "alert"
  - value: "~401,347"
    unit: "ETH"
    label: "Amount withdrawn from Bybit's ETH cold wallet"
  - value: "02-21 → 02-26"
    label: "From the drain to Mandiant confirming the compromise via a Safe{Wallet} developer machine"
glossary:
  - term: "Multisig"
    desc: "A wallet mechanism that executes a transaction once a set number (the threshold) of several keyholders have signed. Bybit used a Safe{Wallet} (formerly Gnosis Safe) multisig."
  - term: "Implementation contract"
    desc: "The contract that a Safe wallet (the proxy) delegates its logic to. If it is swapped, the wallet's entire behavior is replaced by the logic at the new address."
  - term: "delegatecall"
    desc: "A call that runs another contract's code with the caller's own authority and state. The transaction the signers were made to sign took this form and swapped the implementation contract for an attacker-controlled address."
insight:
  slug: "screen-differs-from-signed"
  label: "Signing content other than what the screen shows"
  quote: "Unless what is signed is checked separately from the screen, a transaction other than the one displayed gets through even when enough signers sign."
industries: ["finance", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "Do not sign until the content to be signed is checked, by a path other than the UI, to match what the screen shows"
attack_method: "supply-chain"
impact: "~401,347 ETH (~$1.5B) drained"
takeaway: "JavaScript injected into the Safe{Wallet} frontend showed signers a routine transfer while making them sign a transaction that swapped the wallet's implementation. Before signing, check what is signed separately from the screen."
self_check: "Before signing, do you check, by a path other than the screen, that the content of the transaction matches what the screen shows?"
countries: ["global"]
---

## 1. Summary

The cryptography was not broken. The attacker compromised a Safe{Wallet} developer's machine and injected JavaScript into the frontend. Bybit's signers saw a routine transfer to a warm wallet on screen. What they were actually made to sign was a transaction that swapped Safe's implementation contract for an attacker-controlled address; each signer approved through the legitimate procedure, and the multisig threshold was met. <strong>Unless what is signed is checked separately from the screen, a transaction other than the one displayed gets through even when enough signers sign.</strong>

## 2. What got through

- **What got through**: A multisig approval (transaction signatures) on Bybit's ETH cold wallet. The signers approved believing it was a routine transfer, and the signatures that met the threshold swapped the implementation contract that Safe's proxy points to. The ETH in the wallet was then withdrawn.
- **What reached the receiving side**: In general, what a multisig contract checks is that the set number of legitimate keys signed the transaction. What the signers saw on screen when they approved does not reach the contract. On the signers' side, whether what the screen displays is the same as the bytes actually being signed cannot be told from the screen.
- **Not disclosed**: The specific route by which the developer machine was compromised. Details of how the injected code was (reportedly) built to run only on Bybit's screens. How much of the drained funds could be frozen.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before signing, the content of the transaction is checked against the intended approval flow, separately from the screen that asks for the signature.

- **Who approves**: The business side that originates the transaction (here, the side that decided on the transfer to the warm wallet). It registers which destination and which operation, outside the screen that asks for signatures.
- **Where it is checked**: Before the signers sign. The bytes to be signed are checked against the registered content; if they do not match (a different destination, or an unplanned operation such as swapping the implementation), signing does not start. What the screen displays is not used as the basis of the check.
- **What is recorded**: Which transaction was checked against which registration, and who signed it (or stopped it). It shows only that "this transaction was created through the legitimate approval flow," without disclosing the whole internal business flow.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before the signers sign, the content of the transaction against the intended approval flow, separately from the screen, and keeping a record. Detection means noticing after the signatures passed and the funds were withdrawn. Dates are those each party disclosed. The date the developer machine was compromised is estimated.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before signing, check what is signed, separately from the screen</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Signatures meeting the threshold swapped the implementation;<br>~401,347 ETH drained</span></div>
<div class="rx-zone det"><b>Detection · worked after the drain</b>Disclosure, forensics, fund tracing, blacklisting</div>
<div class="rx-g g1"><div class="t">02-21 (est.)</div><b>A developer machine is compromised and JavaScript is injected</b></div>
<div class="rx-g g2"><div class="t">02-21</div><b>Signers approve a transaction that looks like a routine transfer</b></div>
<div class="rx-g g3"><div class="t">02-21</div><b>Bybit's CEO discloses the breach</b></div>
<div class="rx-g g4"><div class="t">02-26</div><b>Mandiant confirms the compromise via the developer machine</b></div>
</div>
</figure>

Detection worked after the drain and carried forward fund tracing, cross-exchange blacklisting and a partial freeze, but it does not stop the withdrawal once the signatures pass. A similar case, where what the approval screen showed and what was actually approved diverged, is [Polymarket](/critical/briefs/087-polymarket-frontend-supply-chain/) (JavaScript injected through a third-party vendor dependency). A case where how multisig keys were held became the issue is [Humanity Protocol](/critical/briefs/045-humanity-protocol-multisig-key-custody/).

## 4. What Lemma does

**Lemma puts the check in section 03 at the step where signers sign.** It does not replace the multisig threshold or the signers' review of the screen; on top of them, it checks, separately from the screen that asks for signatures, that the bytes to be signed were created through the intended approval flow.

### Industries and operations to watch

- **Industry · Finance**: Services, such as crypto exchanges and asset custodians, that approve large movements from multisig wallets.
- **Industry · Supply chain**: Organizations that rely on a third-party service's frontend for their signing or approval screens.
- **Operation · Approvals**: Several people signing or approving a transaction after viewing it on screen.

### Current controls vs Lemma

The route in this case is column 1 (multisig signatures on content other than what the screen showed). Column 2 is understanding the damage after the drain; here, fund tracing and blacklisting worked.

| Control | Signing content other than what the screen shows | Understanding the damage after the drain |
| --- | --- | --- |
| Multisig threshold (several signers) | Not effective | Not relevant |
| Signers reviewing the screen | Not effective | Not relevant |
| Fund tracing and blacklisting | Not effective | Effective |
| **Lemma (pre-execution check)** | Effective | Partial |

The multisig threshold shows that the set number of legitimate keyholders signed, not that what they signed was what they intended. The signers reviewed the screen, but the display and the bytes to be signed were swapped outside that review. Fund tracing and blacklisting carried forward understanding and containing the damage, but did not stop the withdrawal once the signatures passed. Lemma checks, before signing, that the bytes to be signed were created through the intended approval flow. A record of which transaction was checked against which registration is kept, so it can also help in understanding the damage afterwards.

Note: Lemma's check works only when it is built into the signing procedure, and the registration and check of transactions run on a path separate from the screen that asks for signatures. If the registration itself is compromised, or the path that displays the check's result is also swapped by the same attacker, this check can be passed. How the developer machine was compromised has not been disclosed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that approve large movements from multisig wallets

- Before signing, do you check that the transaction to be signed contains only the destination and operation registered through the legitimate approval flow?
- Do you notice when the code that serves your signing screen (including third-party services) changes from the approved version?
- Do you keep a traceable record of who signed which transaction, checked against which registration?

## 5. Facts and timeline

- **Service**: Bybit's (a crypto exchange) ETH cold wallet, using a Safe{Wallet} (formerly Gnosis Safe) multisig.
- **Scale of loss**: About 401,347 ETH (~$1.4–1.5B at the time). Described as the largest single-incident crypto theft on record.
- **Origin of the compromise**: A Safe{Wallet} developer's machine was compromised, and JavaScript was injected into the frontend code (Safe{Wallet} and Mandiant investigation, as reported).
- **Method**: When the signers approved in the Safe interface, the screen displayed a routine ETH transfer (a regular move to a warm wallet). The injected code changed what they were actually made to sign into a `delegatecall` that swapped Safe's implementation contract for an attacker-controlled address. The injected code was reportedly built to run only on Bybit's wallet screens.
- **What was confirmed**: Several signers each approved through the legitimate procedure and met the threshold. The strength of the cryptographic signatures was not the problem. The signatures that met the threshold swapped the implementation, the ETH in the wallet was withdrawn, and the destinations were dispersed across multiple hops.
- **Attribution**: The FBI announced that North Korea's Lazarus Group (also known as TraderTraitor) was responsible.

### Timeline

- **2025-02-21 (estimated, just before the attack)**: A Safe{Wallet} developer's machine is compromised, and JavaScript is injected into the frontend.
- **2025-02-21**: Bybit's signers approve a transaction that appeared to be a routine move to the warm wallet. The attacker withdraws the ETH.
- **2025-02-21 (same day)**: Bybit CEO Ben Zhou discloses the breach on X (formerly Twitter). Bybit pledges to compensate customers from its own assets.
- **2025-02-21 to 22**: Elliptic and Chainalysis begin fund tracing. Exchanges and blockchain parties advance address blacklisting.
- **2025-02-26**: Mandiant confirms the Safe{Wallet} supply-chain compromise via the developer machine.
- **Early 2025-03**: The FBI announces that North Korea's Lazarus Group (TraderTraitor) was responsible. Sanctions against the related addresses advance.

> Proper nouns and attribution are recorded with the disclosures of Mandiant, the FBI and the exchange as primary sources. This Brief is based on the values confirmable at the time of research and names the sources for scale and method; please also consult the latest primary information. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Bybit**: CEO Ben Zhou issued a statement the same day, pledged to compensate all customers from its own assets, and carried out the reimbursement.
- **Safe{Wallet} (Gnosis Safe)**: Paused the service, identified and removed the compromised portion of the frontend, and audited related infrastructure.
- **Mandiant (Google Cloud)**: As the forensics lead, confirmed the compromise path from the developer machine to the JavaScript injected into the frontend.
- **FBI**: Announced that North Korea's Lazarus Group (TraderTraitor) was responsible.
- **Cross-industry**: Fund tracing by Elliptic and Chainalysis, address blacklisting at major exchanges, and sanctions on related addresses by the U.S. Treasury's OFAC advanced, and a portion of the drained funds was frozen.
- **Industry point**: As a large case that made a multisig wallet's interface the target of a supply-chain attack, displaying transactions directly on hardware wallets and checking what is signed separately from the screen were raised as points of discussion.

## 6. Sources

- **Bybit official statement**: CEO Ben Zhou's posts on X (formerly Twitter) (2025-02-21) and the official Bybit blog
- **Mandiant (Google Cloud)**: technical analysis report on the Safe{Wallet} supply-chain compromise (published around 2025-02-26). Reporting on Mandiant's forensic findings — https://thehackernews.com/2025/03/safewallet-confirms-north-korean.html
- **FBI official statement**: "North Korea Responsible for $1.5 Billion Bybit Hack" (2025-03) — https://www.fbi.gov/investigate/cyber/alerts/2025/north-korea-responsible-for-1-5-billion-bybit-hack
- **Elliptic**: fund-tracing report (2025-02 to 03)
- **Chainalysis**: blockchain analysis report (2025-02 to 03)
- **Unchained / The Block / CoinDesk, etc.**: reporting on the incident's course (2025-02-21 onward)

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
