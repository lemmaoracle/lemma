---
brief_no: 202
title: "MetaMask Staking：報酬の受取先を一元で保管するインフラに不正アクセスがあり、一部のバリデーターの受取先が書き換えられた(MetaMask の公表)"
title_en: "MetaMask Staking: Unauthorised access to infrastructure that centrally stored reward recipient addresses led to some validators' recipients being altered (MetaMask disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-09-28
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "175-storm-2657-university-payroll-diversion", "196-bithumb-event-reward-btc-payout-error"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-27
  rev: "abadea7b8e086269"
  ref: "https://github.com/lemmaoracle/lemma/pull/1223"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Added when each figure was disclosed or reported (5 November, 1 October) (#53)"
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
  - date: 2026-11-27
    note: "Shortened the condition sentence in section 3 and moved the means below it"
version: "1.0"
og_lead_ja: "MetaMask Staking で、報酬の受取先を保管するインフラに不正アクセスがあり、一部のバリデーターの受取先が書き換えられて約 0.385 ETH の報酬が流れた"
og_lead_en: "At MetaMask Staking, unauthorised access to the infrastructure storing reward recipient addresses let an attacker alter some validators' recipients and divert about 0.385 ETH"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 受取先の書き換え"
og_kicker_en: "CYBERATTACK · PAYOUT REDIRECT"
og_headline_ja: "報酬の受取先が、\n保管先への不正アクセスで\n書き換えられた。\n<accent>約 0.385 ETH</accent>"
og_headline_en: "Reward payout addresses\nwere altered after a breach\nof where they were stored.\n<accent>About 0.385 ETH diverted.</accent>"
key_figures:
  - value: "c. 0.385"
    unit: "ETH"
    label: "Rewards diverted by the altered recipients (execution-layer rewards, separate from the ETH customers staked; as of the 5 November disclosure; MetaMask disclosure)"
    tone: "alert"
  - value: "09-28 → 11-05"
    label: "From MetaMask identifying the incident to disclosing the recipient changes (2026; MetaMask disclosure)"
  - value: "c. 523,000"
    unit: "ETH"
    label: "Stake held by the roughly 17,000 validators exited as a precaution (a researcher's estimate, not confirmed by MetaMask; as reported on 1 October; Decrypt)"
glossary:
  - term: "Validator"
    desc: "On Ethereum, a setup that stakes ETH as collateral to take part in confirming transactions and earns rewards for it. MetaMask Staking runs validators on behalf of clients and partners."
  - term: "Reward recipient (fee recipient)"
    desc: "The address that receives the rewards a validator earns for including transactions (execution-layer rewards). The validator operator sets it, and it is managed separately from the keys that withdraw the staked ETH."
insight:
  slug: "payout-recipient-taken-from-central-store"
  stop: true
  label: "A stored value becomes the payout recipient as is"
  quote: "Before a reward recipient is changed, check the new recipient against the customer's own record of the recipient they designated, not the value in a central store."
industries: ["finance"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Apply a change of reward recipient only when it matches the recipient record the customer designated and signed"
  - slug: "hold-unverified"
    item: "Hold, before it is used for payouts, any recipient change that is not tied to the customer's record, and have someone other than the person who made it confirm it"
  - slug: "audit-trail"
    item: "Record, apart from the store that holds recipients, who changed which recipient to what and when, and who approved it"
impact: "Some validators' reward recipients were altered and about 0.385 ETH in rewards was diverted; all affected validators were exited as a precaution (MetaMask disclosure)"
takeaway: "If a recipient in the central store is altered, rewards go straight to the new recipient. Apply a recipient change only after checking it against the record the customer designated."
self_check: "Do you know whether anything checks a new payout recipient, before it takes effect, against a record the customer designated rather than the value in the store?"
countries: ["us"]
---

## 1. Summary

On 28 September 2026, MetaMask identified unauthorised access to part of its infrastructure. For some validators operated by MetaMask Staking, the address that receives rewards (execution-layer rewards) was briefly altered, and about 0.385 ETH in rewards was diverted (MetaMask disclosure). The recipients were centrally stored in the infrastructure that was accessed.

MetaMask identified and fixed the change on the same day and, as a precaution, exited all affected validators. It says there is no evidence that the ETH customers staked (the principal) or the keys that withdraw it were compromised, and that wallets were not affected. How the access was gained has not been disclosed.

<strong>If a recipient in the central store is altered, rewards go straight to the new recipient.</strong>

## 2. What got through

- **What got through**: A change to reward recipients after unauthorised access to the infrastructure where they were centrally stored, and payment of rewards to those recipients (MetaMask disclosure).
- **What reached the accepting side**: In general, a validator pays rewards to whatever recipient the operator has set. Whether that recipient is the one designated by the customer who delegated the stake is not part of the setting.
- **Not disclosed**: How the access was gained and by whom. When the recipients were altered, and how many validators were affected. How many validators were exited and how much stake they held (only a researcher's estimate exists). Who could write to the recipient store, and whether changes went through an approval step. The terms of any compensation for diverted or missed rewards.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the new reward recipient is one specified by the customer who delegated the staking.

- **Who approves**: The customer who delegated the stake (an institution or a partner). The customer designates the reward recipient, signed with their own key, and any change is also issued as a designation they have signed. Being able to write to the operator's store is not enough to produce that designation.
- **Where it is checked**: The step that applies a recipient setting to validators (before it is used for reward payouts). A recipient that does not match the customer's designation is held before it is applied. The value in the store itself is also compared with the customer's designation each time it is applied.
- **What is recorded**: Who changed which validator's recipient to what and when, and which customer designation it rested on. Explanations and compensation for customers can then show which change departed from the designation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a new reward recipient against the customer's designated record before the change is applied, and keeping a record. Detection means noticing and fixing the change, and exiting validators. Dates rely on MetaMask's and Lido's disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a new recipient against the customer's designated record before applying it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Some validators' recipients were altered<br>About 0.385 ETH in rewards was diverted</span></div>
<div class="rx-zone det"><b>Detection · worked the same day</b>Notice and fix the change, and exit the affected validators</div>
<div class="rx-g g1"><div class="t">09-28</div><b>MetaMask identifies unauthorised access to part of its infrastructure</b></div>
<div class="rx-g g2"><div class="t">09-30</div><b>MetaMask and Lido disclose; validator exits begin</b></div>
<div class="rx-g g3"><div class="t">10-07</div><b>The last validators exit, per Lido's expectation</b></div>
<div class="rx-g g4"><div class="t">11-05</div><b>MetaMask discloses the recipient changes and about 0.385 ETH</b></div>
</div>
</figure>

Detection worked the same day. Even so, the altered recipients were used for payouts, and the operator ended up exiting all the affected validators it ran. A case where a payout account was changed through the genuine admin screen is [Polaris HD and Booking.com](/critical/briefs/032-booking-payout-account-tampering/), a case where payroll deposit details were changed from hijacked staff accounts is [Storm-2657](/critical/briefs/175-storm-2657-university-payroll-diversion/), and a case where an in-house input was credited as a payout as is is [Bithumb](/critical/briefs/196-bithumb-event-reward-btc-payout-error/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that applies reward recipient changes to validators.** It does not find unauthorised access; it checks, before the recipient is used for payouts, that a new recipient ties back to the customer's designation.

### Industries and operations to watch

- **Industry · Finance**: Staking operators, custodians and payment processors that set payout or reward recipients on customers' behalf, keep those values in one place and distribute them to many accounts or nodes.
- **Operation · Payee & bank-account changes**: Registering and changing recipients for rewards, dividends and sales proceeds.
- **Operation · Accounts & permissions**: Managing the accounts and routes that can write to the recipient store.

### Current controls vs Lemma

The route in this case is column 1. Nothing disclosed says column 2 (a change by an authorised in-house staff member) or column 3 (a change request from someone posing as the customer) happened here.

| Control | Alteration through unauthorised access to the store | Change by an authorised staff member | Change request from someone posing as the customer |
| --- | --- | --- | --- |
| Access control and MFA on the store | Partial | Not effective | Not effective |
| Two-person approval of recipient changes | Partial | Partial | Not effective |
| Monitoring and detection of payout destinations | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

Access control and MFA guard the way into the store but do not stop changes once that has been passed. Two-person approval works on changes that go through the approval step, but if the stored value is written directly there may be a route that skips it. Monitoring and detection notice after a payment to an altered recipient has happened; here it was noticed the same day, but rewards were diverted in between.

Note: Lemma's check works only when it is built into the step that applies recipients to validators, and the customer's designation is kept, signed with the customer's key, somewhere other than the operator's store. If the customer's key itself is stolen and a false designation is signed, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, nor does it get back diverted rewards.

### Checklist

Three things to confirm about systems that manage reward or payout recipients in one place

- Do you automatically compare where payments actually went with the registered recipients, so that a mismatch is noticed quickly?
- Do you list the accounts and routes that can write to the recipient store, and keep them to what is needed?
- Do you record, apart from the recipient store, who changed which recipient and when, and who approved it?

## 5. Facts and timeline

- **Parties**: Consensys Software Inc., which provides MetaMask (doing business as MetaMask; Texas, United States). The incident occurred at MetaMask Staking; Lido's forum refers to it as "MetaMask Staking (ex Consensys Staking)". MetaMask Staking is also one of Lido's node operators.
- **What happened**: According to MetaMask, on 28 September it identified unauthorised access to part of its infrastructure. An attacker briefly altered some validators' recipients, and about 0.385 ETH in rewards was diverted (separate from the ETH customers staked). In the analysis of researcher Kaden, of 19 validators that earned rewards, 18 paid them to a different address, about 0.36 ETH in total (Decrypt).
- **How it was found**: MetaMask gives neither the date the changes were found nor how they were noticed. Its first disclosure on 30 September did not mention the recipient changes and said only that it was responding to an incident affecting part of its infrastructure. How the access was gained is not stated, including in the 5 November update.
- **Impact and response**: MetaMask began exiting affected validators in coordination with clients and partners, and on 5 November said all had exited. It said it does not manage withdrawal keys on clients' behalf. It found no indication that wallets or wallet infrastructure were compromised, and said users' Secret Recovery Phrases and private keys were not compromised. Because of the exits, some customers saw temporary withdrawal delays, and some may have missed rewards. Researcher Kaden estimated that about 17,000 validators holding about 523,000 ETH were exited; MetaMask has not confirmed these figures (Decrypt).

### Timeline

- **2026-09-28**: MetaMask identifies unauthorised access to part of its infrastructure.
- **2026-09-30**: MetaMask discloses the incident and begins exiting affected validators. Lido discloses the precautionary exits of MetaMask Staking validators.
- **2026-10-01**: MetaMask updates that there is no indication wallets or customer funds were affected. A researcher's estimates (about 17,000 validators, about 523,000 ETH, about 0.36 ETH) are reported (Decrypt).
- **2026-10-07**: The last validators exit, per Lido's expectation (withdrawal completes later).
- **2026-10-23**: Lido governance enacts a proposal setting MetaMask Staking's target limit to zero, so that no new deposits are allocated to it.
- **2026-11-05**: MetaMask discloses the recipient changes, the roughly 0.385 ETH diverted, and that all affected validators have exited.

> The facts rely on MetaMask's disclosure (a single page combining the updates of 30 September, 1 October and 5 November), Lido's forum disclosure (both primary) and press reporting (Decrypt). MetaMask puts the diverted rewards at about 0.385 ETH; the researcher's analysis puts them at about 0.36 ETH. The number of validators exited and the stake they held are a researcher's estimate, not confirmed by MetaMask. The researcher's post on X could not be opened, and its content relies on Decrypt's article. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of MetaMask or Lido. Written as of 12 November.

### After disclosure

- **MetaMask**: Said it contained the unauthorised access and secured the affected systems, working with external security specialists. It said it is working directly with affected customers and partners to address any outstanding impact. It said wallet users need take no action, asked staking customers to follow guidance from MetaMask or their staking provider, warned against unsolicited messages, and said MetaMask will never ask for a Secret Recovery Phrase.
- **Lido**: Said no action is required from stETH holders, and that exiting and re-entering staking could take up to about 45 days because of the extended entry queue, with lost rewards and possible downtime penalties. It noted an ad hoc reserve fund of over 6,750 stETH.

## 6. Sources

- **MetaMask (Primary, company disclosure)**: "MetaMask user update on recent security incident" (2026-11-05, including the updates of 30 September and 1 October) — <https://metamask.com/news/user-update>
- **Lido (Primary, partner disclosure)**: "[Security Disclosure] MetaMask Staking Precautionary Out of Order Exits" (2026-09-30, including replies up to 23 October) — <https://research.lido.fi/t/security-disclosure-metamask-staking-precautionary-out-of-order-exits/11961>
- **MetaMask (Primary, terms of use)**: "Terms of Use" (operating company and address) — <https://metamask.com/terms-of-use>
- **Decrypt (Press)**: "MetaMask Exits Lido Validators Amid Infrastructure 'Security Incident'" (2026-10-01) — <https://decrypt.co/379800/metamask-exits-lido-validators-amid-infrastructure-security-incident>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
