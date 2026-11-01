---
brief_no: 169
title: "Binance：不正な出金の取引が通り、暗号資産が流出"
title_en: "Binance: Unauthorised withdrawal transactions went through, and crypto was taken"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-10-29
published: 2026-11-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["081-bybit-safe-wallet-ui-injection", "155-tving-developer-key-hardcoded-production-keys"]
status: draft
version: "1.0"
og_lead_ja: "Binance から約 63 億ドルが流出、秘密鍵の漏えいは見つかっていない"
og_lead_en: "About US$6.3 billion taken from Binance, with no sign the private keys leaked"
layout: "report"
sections: "proof"
gate: "signing"
victim_desk:
  ja: "Binance の利用者の方へ：ご自身の資産や出金の再開についての確認は、Binance の公式の告知とサポートへ。当サイトは Binance とは関係がありません。"
  en: "Binance users: for your own assets or when withdrawals resume, check Binance's official announcements and support. This site is not affiliated with Binance."
  url: "https://www.binance.com/en/support/announcement"
og_kicker_ja: "サイバー攻撃事例 · 不正な出金"
og_kicker_en: "CYBERATTACK · UNAUTHORISED WITHDRAWALS"
og_headline_ja: "鍵の漏えいは\n見つかっていない。\n出金は通った。\n<accent>約 63 億ドルが流出</accent>"
og_headline_en: "No sign the keys leaked.\nThe withdrawals went through.\n<accent>About $6.3 billion taken.</accent>"
key_figures:
  - value: "About 6.3"
    unit: "billion USD"
    label: "Crypto taken (Binance's estimate; about USD 6.36 billion at the time of each transfer per TRM Labs)"
    tone: "alert"
  - value: "About 20"
    unit: "minutes"
    label: "Time in which most of the outflow left (from 20:05 UTC on 29 October, TRM Labs)"
  - value: "10"
    unit: "chains"
    label: "Blockchains the funds left from (TRM Labs)"
insight:
  slug: "valid-signature-not-approved-request"
  label: "A valid signature vs an approved request"
  quote: "Even if the keys never leak, once someone reaches the place that can request withdrawals, withdrawals can go through with valid signatures."
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "separate-approval"
    item: "Before signing a withdrawal, check — somewhere other than the service that requested it — that a matching customer request or an approval by an authorised person exists"
  - slug: "hold-unverified"
    item: "Hold, unsigned, withdrawals with no matching request or approval, withdrawals over the limit, and unexpected kinds of signature"
  - slug: "audit-trail"
    item: "Record, outside the requesting service, which request or approval each signed withdrawal was based on"
attack_method: "privilege-abuse"
impact: "About USD 6.3 billion in crypto was taken (Binance's estimate; about USD 6.36 billion from ten chains per TRM Labs). About USD 2.7 billion was frozen, and Binance says it will cover the losses"
takeaway: "Even if the keys never leak, once someone reaches the place that can request withdrawals, withdrawals can go through with valid signatures."
self_check: "Before signing a withdrawal, do you check that a matching customer request or internal approval exists?"
countries: ["global"]
---

## 1. Summary

Binance's initial investigation pointed to a compromised DevOps engineer's laptop, from which an attacker reached a service container and submitted unauthorised withdrawal transactions; it later said it had found additional points of breach. The company says it has found no evidence that private keys leaked. TRM Labs puts the outflow at about USD 6.36 billion from ten chains, most of it within about 20 minutes. <strong>Even if the keys never leak, once someone reaches the place that can request withdrawals, withdrawals can go through with valid signatures.</strong>

## 2. What got through

- **What got through**: Withdrawals from Binance wallets. Binance says unauthorised withdrawal transactions were submitted. TRM Labs gives as the most likely explanation that the attacker "gained the ability to make Binance's hot wallet signing system sign transactions of its choosing across chains". On Ethereum, 50 EIP-7702 authorisations prepared in advance were sent in one transaction, moving the wallet's contents to an attacker contract; on the other nine chains the funds left through ordinary signed transfers (TRM Labs).
- **What reaches the receiving side**: In general, a blockchain executes any transaction signed with the right key. A valid signature does not show that the withdrawal was based on a customer request or an internal approval.
- **Not disclosed**: The root cause, how the intrusion happened, what the additional points of breach were, and where in the signing system the requests arrived.

## 3. What to check

Whatever the route, the condition for telling them apart is that the signing side checks, before signing and somewhere other than the service that made the request, that the withdrawal is based on a customer request or an internal approval.

- **Who approves**: For customer withdrawals, the customer's request signed with a key on their own device. For internal fund movements, the approval of a person with authority and a limit. Both use keys separate from the requesting service and from developers' machines.
- **Where it is checked**: Inside the signing system (HSM or co-signer). Withdrawals with no matching request or approval, withdrawals over the limit, and unexpected kinds of signature (such as many delegations signed in advance) are held, unsigned.
- **What is left**: A record of which request or approval each signed withdrawal was based on, kept outside the requesting service.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before signing, that a withdrawal request is based on a customer request or an internal approval, and keeping a record. Detection means noticing an intrusion or outflow after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the request and approval behind it before signing</div>
<div class="rx-zone gapz"><b>In between</b><span>Most of the outflow<br>in about 20 minutes</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Stop withdrawals; issuers and others freeze funds</div>
<div class="rx-g g1"><div class="t">From 10-28</div><b>Attacker funds staged</b></div>
<div class="rx-g g2"><div class="t">10-29 20:05 UTC</div><b>Main outflow begins</b></div>
<div class="rx-g g3"><div class="t">From 10-29</div><b>Withdrawals stopped</b></div>
<div class="rx-g g4"><div class="t">10-29 to 10-30</div><b>About $2.7B frozen</b></div>
</div>
</figure>

Stopping withdrawals and freezing funds were measures taken after discovery. Executing signatures prepared in advance in one burst is, according to TRM Labs, a feature shared with the [Bybit](/critical/briefs/081-bybit-safe-wallet-ui-injection/) case (JavaScript injected into the signers' interface moved funds through a genuine multisig approval).

## 4. What Lemma does

**Lemma builds the check in section 3 into the signing system.** It does not look for intrusions; before signing, it checks whether an incoming withdrawal request is based on a customer request or an authorised approval.

### Industries and operations to watch

- **Industry · Finance**: Crypto exchanges, custodians and payment firms that take withdrawal requests automatically and sign them with hot wallets.
- **Industry · Developers & agent operations**: Organisations whose development or operations machines hold permissions that reach production services or signing systems.
- **Operation · Approval**: Approving withdrawals and fund movements, and managing their limits.

### Current controls vs Lemma

| Control | Withdrawals with no request or approval | Withdrawals over the limit | Manipulation of the signing system itself |
| --- | --- | --- | --- |
| Key custody (HSM, cold wallets) | Not relevant | Not relevant | Partial |
| Protecting development and operations machines (EDR, MFA) | Partial | Partial | Partial |
| Signing policy (MPC or multisig approval rules and limits) | Partial | Effective | Partial |
| Stopping withdrawals, freezing funds | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

This compares the case where the keys do not leak. Key custody protects the keys, machine protection guards the entry point, a signing policy enforces the rules and limits it was given, and stopping and freezing work after discovery. Lemma checks the origin of each request before signing and keeps the record outside the requesting service.

Note: Lemma's check works only where it is built into the signing system and the approval keys are separate from the requesting service and developers' machines. If the signing or checking system itself is manipulated, or the approval rights themselves are taken, it passes. If, as TRM Labs assesses, the signing system itself could be made to sign arbitrary transactions, that falls under the right-hand column. The table compares what each control checks; it does not show whether anything would have stopped this case. Lemma does not detect or prevent intrusion.

### Checklist

Three points for crypto exchanges, custodians and payment firms to check

- Are development and operations machines kept from reaching the services that can request withdrawals directly?
- Have you set limits on the hot wallet balance and on withdrawals per hour?
- Can unexpected kinds of signature request (such as many delegations signed in advance) be held without signing?

## 5. Facts and timeline

- **Exchange**: Binance, a crypto exchange.
- **Binance's account**: Its initial investigation said a compromised DevOps engineer's laptop let an attacker reach a service container and submit unauthorised withdrawal transactions, and that it has found no evidence of a private-key leak. It later said it had uncovered additional points of breach. Co-CEO Richard Teng said on X that the attacker did not simply use one engineer's permissions and that this was not a single "one-click" action, and that the investigation does not place blame on any individual (BleepingComputer). Binance has not published a root cause.
- **Outflow**: About USD 6.36 billion at the time of each transfer, from ten chains — Ethereum, Bitcoin, Tron, XRP Ledger, Solana, Arbitrum, Avalanche, Optimism, Base and Polygon (TRM Labs). Binance's estimate is about USD 6.3 billion and Chainalysis' about USD 6.4 billion, so estimates range from USD 6.3 to 6.4 billion by source.
- **Freezes**: Tether, Circle, Ripple and others froze about USD 2.67 billion in stablecoins, and Arbitrum's Security Council froze part of the rest (TRM Labs). Binance says about USD 3 billion has been frozen.
- **Covering losses**: Binance said it would cover the losses from part of SAFU (its user-protection fund), part of its futures insurance fund and company funds. On 31 October it said its top ten assets were fully backed again and about 90% of the overall impact was covered.
- **Attribution**: TRM Labs and Chainalysis attribute the theft to North Korea's TraderTraitor. On 31 October the FBI issued an alert, with the US Secret Service (USSS) and IRS Criminal Investigation (IRS-CI), attributing it to North Korea's TraderTraitor. Binance has not named any group in its announcements.

### Timeline

- **2026-10-28**: Attacker funds start moving from Tornado Cash to an operator wallet; staging began at least 36 hours before the theft (TRM Labs).
- **2026-10-29**: Most of the outflow in about 20 minutes from around 20:05 UTC; the Ethereum delegation transaction at 20:20 UTC (TRM Labs). Binance pauses withdrawals on some chains, then all withdrawals (deposits remain operational, Binance says). TRM Labs attributes the theft to TraderTraitor.
- **2026-10-30**: Binance sets out its initial findings (compromised laptop, service container, unauthorised withdrawal transactions) in official announcements, and in a follow-up says it found additional points of breach. Chainalysis attributes the theft to TraderTraitor.
- **2026-10-31**: Binance says about 90% of the impact is covered, publishes a Proof of Reserves snapshot, and aims to reopen withdrawals on Sunday 1 November. The FBI attributes the theft to North Korea (TraderTraitor).

> Facts rest on Binance's official announcements, TRM Labs' and Chainalysis' analyses and the FBI alert; the co-CEO's remarks are as quoted by the press from his X post. The root cause has not been disclosed. What is not disclosed does not mean no measure was in place. As of 1 November, Binance's announcements list showed no notice that withdrawals had reopened.

### After disclosure

- **Stopping and revoking**: Stopped withdrawals and revoked authorisations for the affected address; working with blockchain-intelligence firms and law enforcement.
- **Covering and reporting**: Published a Proof of Reserves snapshot on 31 October, with a full attestation expected around 3 November, and says it will publish a post-mortem on the root cause.

## 6. Sources

- **Binance (Primary, company announcement)**: "Security Incident Update" (2026-10-30) — <https://www.binance.com/en/support/announcement/detail/c5a8729a97ac486d963784d96c5642d7>
- **Binance (Primary, company announcement)**: "Security Incident Update #2" (2026-10-30) — <https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751>
- **Binance (Primary, company announcement)**: "Security Incident | Recovery Update #3" (2026-10-31) — <https://www.binance.com/en/support/announcement/detail/1fdf1f61559c401da0435895ffcccb62>
- **FBI (Primary, law-enforcement alert)**: "North Korea Responsible for $6 Billion+ Binance Attack" (2026-10-31) — <https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack>
- **TRM Labs (Independent analysis)**: "North Korea Steals USD 6.36 Billion From Binance in the Largest Hack in History" (2026-10-29) — <https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history>
- **Chainalysis (Independent analysis)**: "The $6.4 Billion Binance Hack: Tracing the North Korea Link" (2026-10-30) — <https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/>
- **BleepingComputer (Press)**: "Binance links $6.3 billion crypto theft to compromised DevOps laptop" (2026-10-30; quotes the co-CEO's X post) — <https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/>
- **TechCrunch (Press)**: "North Korean hackers blamed for stealing record $6.3B in Binance breach" (2026-10-30) — <https://techcrunch.com/2026/10/30/north-korean-hackers-blamed-for-stealing-record-6-3b-in-binance-breach/>
- **CNBC (Press)**: "Binance says 90% of $6.3 billion hack losses are now covered, plans to resume withdrawals Sunday" (2026-10-31) — <https://www.cnbc.com/2026/10/31/binance-hack-asset-coverage-withdrawals.html>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
