---
brief_no: 169
title: "Binance：不正な出金の依頼が通り、約 63 億ドルの暗号資産が流出"
title_en: "Binance: Unauthorised withdrawal requests went through, and about US$6.3 billion in crypto was taken"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-10-29
published: 2026-11-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["081-bybit-safe-wallet-ui-injection", "166-litellm-v1107-pypi-compromise"]
status: draft
version: "1.0"
og_lead_ja: "Binance から約 63 億ドルが流出、秘密鍵の漏えいは見つかっていない"
og_lead_en: "About US$6.3 billion taken from Binance, with no sign the private keys leaked"
layout: "report"
sections: "proof"
gate: "signing"
victim_desk:
  ja: "Binance の利用者の方へ：ご自身の資産や出金の再開についての確認は、Binance の公式の案内とサポートへ。当サイトは Binance とは関係がありません。"
  en: "Binance users: for your own assets or when withdrawals resume, check Binance's official announcements and support. This site is not affiliated with Binance."
  url: "https://www.binance.com/en/support"
og_kicker_ja: "サイバー攻撃事例 · 権限の悪用"
og_kicker_en: "CYBERATTACK · PRIVILEGE ABUSE"
og_headline_ja: "鍵の漏えいは\n見つかっていない。\n出金は通った。\n<accent>約 63 億ドルが流出</accent>"
og_headline_en: "No sign the keys leaked.\nThe withdrawals went through.\n<accent>About $6.3 billion taken.</accent>"
key_figures:
  - value: "About 6.3"
    unit: "billion USD"
    label: "Crypto taken (TRM Labs estimate; about USD 6.36 billion at the time of each transfer)"
    tone: "alert"
  - value: "About 20"
    unit: "minutes"
    label: "How long the main outflow lasted (from 20:05 UTC on 29 October, TRM Labs)"
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
impact: "About USD 6.3 billion in crypto left from ten chains (TRM Labs estimate). About USD 2.7 billion was frozen, and Binance says it will absorb the losses"
takeaway: "Even if the keys never leak, once someone reaches the place that can request withdrawals, withdrawals can go through with valid signatures. Whether the origin of each request was checked before signing is not known from the disclosures."
self_check: "Before signing a withdrawal, do you check that a matching customer request or internal approval exists?"
countries: ["global"]
---

## 1. Summary

According to Binance, a compromised DevOps engineer's laptop let an attacker reach a service container and submit unauthorised withdrawal transactions. The company says it has found no evidence that private keys leaked. TRM Labs' analysis puts the outflow at about USD 6.3 billion from ten chains in roughly 20 minutes. <strong>Even if the keys never leak, once someone reaches the place that can request withdrawals, withdrawals can go through with valid signatures.</strong>

## 2. What got through

- **What got through**: Withdrawals from Binance wallets. Binance says unauthorised withdrawal transactions were submitted. TRM Labs assesses that the attacker "gained the ability to make Binance's hot wallet signing system sign transactions of its choosing across chains". On Ethereum, 50 EIP-7702 authorisations signed in advance by the hot wallet were sent in one transaction, moving the wallet's contents to an attacker contract; on the other nine chains the funds left through ordinary signed transfers (TRM Labs).
- **What reaches the receiving side**: In general, a blockchain executes any transaction signed with the right key. A valid signature does not show that the withdrawal was based on a customer request or an internal approval.
- **Not disclosed**: The root cause, how the intrusion happened, what the additional points of breach were, where in the signing system the requests arrived, and any limits on or replenishment of the hot wallet balance.

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
<div class="rx-zone gapz"><b>In between</b><span>In about 20 minutes,<br>funds left ten chains</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Stop deposits and withdrawals, ask for freezes</div>
<div class="rx-g g1"><div class="t">From 10-28</div><b>Attacker funds staged</b></div>
<div class="rx-g g2"><div class="t">10-29 20:05 UTC</div><b>Main outflow begins</b></div>
<div class="rx-g g3"><div class="t">From 10-29</div><b>Deposits and withdrawals stopped</b></div>
<div class="rx-g g4"><div class="t">10-29 to 10-30</div><b>About $2.7B frozen</b></div>
</div>
</figure>

Stopping deposits and withdrawals and asking for freezes were measures taken after discovery. Whether the origin of each request was checked before signing is not known from the disclosures. That what the signing side saw and what was actually signed can differ is a point shared with the [Bybit](/critical/briefs/081-bybit-safe-wallet-ui-injection/) case (JavaScript injected into the signers' interface moved funds through a genuine multisig approval).

## 4. What Lemma does

**Lemma builds the check in section 3 into the signing system.** It does not look for intrusions; before signing, it checks whether an incoming withdrawal request is based on a customer request or an authorised approval.

### Industries and operations to watch

- **Industry · Finance**: Crypto exchanges, custodians and payment firms that take withdrawal requests automatically and sign them with hot wallets.
- **Industry · Developers & agent operations**: Organisations whose development or operations machines hold permissions that reach production services or signing systems.
- **Operation · Approval**: Approving withdrawals and fund movements, and managing their limits.

### Current controls vs Lemma

| Control | Withdrawals with no request or approval | Withdrawals over the limit | Manipulation of the signing system itself |
| --- | --- | --- | --- |
| Strict private-key custody (HSM, cold wallets) | Not relevant | Not relevant | Partial |
| Protecting development and operations machines (EDR, MFA) | Partial | Partial | Partial |
| Stopping deposits and withdrawals, freezing funds | Partial | Partial | Partial |
| Covering losses | Not relevant | Not relevant | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

This compares the case where the keys do not leak. Key custody protects the keys, machine protection guards the entry point, and stopping and freezing work after discovery. Only Lemma checks the origin of the request itself before signing.

Note: Lemma's check works only where it is built into the signing system and the approval keys are separate from the requesting service and developers' machines. If the signing or checking system itself is manipulated, or the approval rights themselves are taken, it passes. The table compares what each control checks; it does not show whether anything would have stopped this case. Lemma does not detect or prevent intrusion.

### Checklist

Three points for crypto exchanges, custodians and payment firms to check

- Are development and operations machines kept from reaching the services that can request withdrawals directly?
- Have you set limits on the hot wallet balance and on withdrawals per hour?
- Can unexpected kinds of signature request (such as many delegations signed in advance) be held without signing?

## 5. Facts and timeline

- **Exchange**: Binance, a crypto exchange.
- **Binance's account**: Its initial investigation said a compromised DevOps engineer's laptop let an attacker reach a service container and submit unauthorised withdrawal transactions, and that it has found no evidence of a private-key leak. It later said it had uncovered additional points of breach; co-CEO Richard Teng said the attacker did not simply use one engineer's permissions and that this was not a single "one-click" action. Binance has not published a root cause.
- **Outflow**: About USD 6.36 billion at the time of each transfer, from ten chains — Ethereum, Bitcoin, Tron, XRP Ledger, Solana, Arbitrum, Avalanche, Optimism, Base and Polygon (TRM Labs). Binance's estimate is about USD 6.3 billion.
- **Freezes**: Tether, Circle, Ripple and others froze about USD 2.67 billion in stablecoins, and Arbitrum's Security Council froze part of the rest (TRM Labs). Binance says about USD 3 billion has been frozen.
- **Covering losses**: Binance said it would cover the losses from SAFU (its user-protection fund) and company funds. On 31 October it said its top ten assets were fully backed again and about 90% of the overall impact was covered.
- **Attribution**: TRM Labs and Chainalysis attribute the theft to North Korea's TraderTraitor. According to CNBC, the FBI said on 31 October that it had determined North Korea was responsible. Binance has not named any group.

### Timeline

- **2026-10-28**: Attacker funds start moving from Tornado Cash to an operator wallet; staging began at least 36 hours before the theft (TRM Labs).
- **2026-10-29**: Main outflow in about 20 minutes from around 20:05 UTC; the Ethereum delegation transaction at 20:20 UTC (TRM Labs). Binance pauses withdrawals on some chains, then all deposits and withdrawals.
- **2026-10-30**: Binance gives its initial findings (compromised laptop, service container, unauthorised withdrawal transactions). TRM Labs and Chainalysis attribute the theft to TraderTraitor.
- **2026-10-31**: Binance says about 90% of the impact is covered and aims to reopen withdrawals on Sunday 1 November. The FBI attributes the theft to North Korea (CNBC).

> Facts rest on Binance's statements as quoted by the press and on TRM Labs' and Chainalysis' analyses. Binance's own statements were posted on X, so the reports quoting them are cited instead. The root cause has not been disclosed. What is not disclosed does not mean no measure was in place. As of 1 November, the reopening of withdrawals had not been confirmed.

### After disclosure

- **Stopping and revoking**: Stopped deposits and withdrawals and revoked authorisations for the affected address; working with blockchain-intelligence firms and law enforcement.
- **Covering and reporting**: Absorbing the losses itself, and says it will publish an updated Proof of Reserves once remediation is complete.

## 6. Sources

- **TRM Labs (Independent analysis)**: "North Korea Steals USD 6.36 Billion From Binance in the Largest Hack in History" (2026-10-29) — <https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history>
- **BleepingComputer (Press)**: "Binance links $6.3 billion crypto theft to compromised DevOps laptop" (2026-10-30) — <https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/>
- **TechCrunch (Press)**: "North Korean hackers blamed for stealing record $6.3B in Binance breach" (2026-10-30) — <https://techcrunch.com/2026/10/30/north-korean-hackers-blamed-for-stealing-record-6-3b-in-binance-breach/>
- **CNBC (Press)**: "Binance hack: Investigators in a 'cat and mouse game' to recover $6.3 billion in stolen funds" (2026-10-30) — <https://www.cnbc.com/2026/10/30/binance-hack-stolen-crypto-recovery.html>
- **CNBC (Press)**: "Binance says 90% of $6.3 billion hack losses are now covered, plans to resume withdrawals Sunday" (2026-10-31) — <https://www.cnbc.com/2026/10/31/binance-hack-asset-coverage-withdrawals.html>

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/)
