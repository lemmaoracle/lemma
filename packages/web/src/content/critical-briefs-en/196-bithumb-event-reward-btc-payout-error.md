---
brief_no: 196
title: "Bithumb：イベントの報酬をウォンでなくビットコインの単位で付与し、利用者の口座に記帳された(金融委員会の公表)"
title_en: "Bithumb: An event reward was paid in bitcoin instead of won and credited to users' accounts (FSC disclosures)"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: []
incident_date: 2026-02-06
published: 2026-11-10
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["085-secret-network-axelar-bridge-infinite-mint", "190-iwai-cosmo-tradeworks-admin-function-unintended-orders"]
status: draft
version: "1.0"
og_lead_ja: "韓国の暗号資産取引所 Bithumb、イベントの報酬 2,000 ウォンを 2,000 BTC として付与し、計 62 万 BTC が利用者の口座に記帳された"
og_lead_en: "Bithumb, a South Korean crypto exchange, paid a 2,000-won event reward as 2,000 BTC, crediting 620,000 BTC to users' accounts"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "支払いの事故 · 暗号資産取引所"
og_kicker_en: "PAYOUT ERROR · CRYPTO EXCHANGE"
og_headline_ja: "2,000 ウォンの報酬が、\n2,000 BTC として\n口座に記帳された。\n<accent>計 62 万 BTC</accent>"
og_headline_en: "A 2,000-won reward\nwent out as 2,000 BTC.\n<accent>620,000 BTC credited.</accent>"
key_figures:
  - value: "620,000"
    unit: "BTC"
    label: "Total BTC credited to users' accounts in error as an event reward (2,000 BTC each instead of 2,000 won; FSC)"
    tone: "alert"
  - value: "19:00 → 19:40"
    label: "From the payout to the end of blocking the affected users' trading and withdrawals (6 February 2026; FSC)"
  - value: "1,786"
    unit: "BTC"
    label: "Sold before recovery; about 93% recovered (as of 04:00 on 7 February; Bithumb's report via the FSC)"
glossary:
  - term: "Balance reconciliation"
    desc: "Comparing the total of users' balances in an exchange's ledger with the crypto assets the exchange actually holds (잔고대사). In the FSC's review, three of the five largest exchanges did this only once a day."
  - term: "DAXA"
    desc: "The Digital Asset eXchange Alliance, a self-regulatory body of South Korea's five largest crypto exchanges. It formed the emergency response team with the FSC and others and revised its internal-control rules."
insight:
  slug: "payout-credited-without-plan-and-reserve-check"
  stop: true
  label: "Payouts credited without checking the plan and reserves"
  quote: "Before a reward is credited to an account, check its unit and total against the approved payout plan and the assets the exchange actually holds."
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "bound-automation"
    item: "Let reward and refund payouts through only within the unit and total of the approved payout plan and the assets the exchange actually holds"
  - slug: "hold-unverified"
    item: "Hold, before crediting, any payout that does not match the plan or the holdings, and have someone other than the person who entered it confirm it"
  - slug: "audit-trail"
    item: "Record, apart from the payout system, who entered a payout with which unit and total, and who approved it"
attack_method: "human-error"
impact: "620,000 BTC was credited to users' accounts in error as an event reward, and 1,786 BTC was sold before recovery (about 93% recovered; FSC)"
takeaway: "An input with the wrong unit for an event reward was credited to accounts as is, in an amount beyond what the exchange held. Credit a payout only after checking its unit and total against the approved plan and actual holdings."
self_check: "Do you know whether anything checks the unit and total of a reward or refund against the approved plan and actual holdings before it is credited to users' accounts?"
countries: ["kr"]
---

## 1. Summary

At about 19:00 on 6 February 2026, Bithumb, a South Korean crypto exchange, paid a reward to 695 participants in a customer-acquisition event as 2,000 BTC each instead of 2,000 won (FSC). The payout totalled 620,000 BTC. Bithumb noticed 20 minutes later and had blocked the affected users' trading and withdrawals by 19:40.

Citing Bithumb's report, the Financial Services Commission (FSC) said that by 04:00 the next day 618,214 BTC (99.7%) had been recovered before being sold, and about 93% of the 1,786 BTC that had been sold had been recovered. The FSC, the Financial Supervisory Service (FSS) and others formed an emergency response team to review the exchanges, and on 6 April set out reconciliation of ledgers against actual holdings every five minutes, plus automatic validation and multi-level approval for payouts that involve manual work, such as event rewards.

<strong>Where a payout instruction is settled on the ledger alone, an input with the wrong unit, and an amount beyond actual holdings, are both credited to accounts as valid payouts.</strong>

## 2. What got through

- **What got through**: An event reward payout (crediting users' accounts). At about 19:00 on 6 February, in the course of paying the reward, 2,000 BTC each was paid instead of 2,000 won, totalling 620,000 BTC (FSC). Some users sold BTC from the credited balances. According to press reports, a staff member entered the payout unit as BTC instead of won.
- **What reached the accepting side**: In general, an exchange's ledger receives the destination account, the asset and the quantity. Whether the quantity matches the approved payout plan, or falls within what the exchange actually holds, is not part of the payout instruction. According to press reports, Bithumb's chief executive acknowledged before the National Assembly on 11 February that a cross-check between the amount to be paid and the company's holdings had not been in place, that the event design had not separated payouts into a capped account, and that the event ran while part of the functionality was missing midway through a migration to a new system.
- **Not disclosed**: Bithumb's input and approval steps for the payout (how many people checked it). How many users actually received BTC (695 users at 2,000 BTC each does not come to 620,000 BTC, and the reason has not been disclosed). How much remains unrecovered, and the total compensation. When the earlier mistaken payouts happened and how large they were. What the FSS inspection found, and the outcome of any sanctions.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a reward is credited to an account, the payout's unit and total are checked against the approved payout plan and against what the exchange actually holds. The question is not whether the staff member's input went through, but whether it falls within the plan and the holdings.

- **Who approves**: The department that set the payout plan, and an approver other than the person who enters it. The plan (asset, unit, amount per person, total and number of recipients) is signed and kept with the approver's key, and a payout goes through only when it is tied to that plan.
- **Where it is checked**: The step that credits the payout to the ledger (before users' balances increase). A payout whose unit or total does not match the plan, or that exceeds what the exchange actually holds, is held before crediting.
- **What is recorded**: Which plan a payout rested on, who entered which unit and total, and who approved it. Compensation, recovery and reports to the authorities can then show where the mismatch arose.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the unit and total against the payout plan and actual holdings before a reward is credited to an account, and keeping a record. Detection means noticing the mistaken payout, blocking trading and withdrawals on the affected accounts and recovering the assets. Dates and times rely on the FSC's releases.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a payout's unit and total against the plan and actual holdings before crediting</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>620,000 BTC credited to accounts<br>1,786 BTC sold before recovery</span></div>
<div class="rx-zone det"><b>Detection · worked after 20 minutes</b>Notice the mistaken payout, block trading and withdrawals on the affected accounts, and recover</div>
<div class="rx-g g1"><div class="t">02-06</div><b>About 19:00, a 2,000-won reward is paid as 2,000 BTC</b></div>
<div class="rx-g g2"><div class="t">02-06</div><b>Noticed at 19:20; trading and withdrawals blocked by 19:40</b></div>
<div class="rx-g g3"><div class="t">02-07</div><b>99.7% recovered; the authorities hold an emergency meeting</b></div>
<div class="rx-g g4"><div class="t">04-06</div><b>The authorities publish review findings and reforms</b></div>
</div>
</figure>

Detection worked after 20 minutes, and most of the BTC was taken back before it was sold. Even so, the payout was credited and 1,786 BTC was sold. A case where unbacked balances appeared on a ledger is [Secret Network](/critical/briefs/085-secret-network-axelar-bridge-infinite-mint/) (wrapped tokens issued from unverified deposits), and a case where trades went through a route that bypassed the customer's own authentication is [Iwai Cosmo Securities](/critical/briefs/190-iwai-cosmo-tradeworks-admin-function-unintended-orders/) (orders from a vendor's admin function). Here there was no attack; an in-house staff member's input was credited as is, as a valid payout.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that credits rewards and refunds to accounts.** It does not find errors after the fact; it checks, before crediting, that a payout's unit and total fall within the approved plan and actual holdings.

### Industries and operations to watch

- **Industry · Finance**: Crypto exchanges, securities firms, and points or prepaid operators, where a balance on the ledger can be traded or withdrawn as is. They make payouts involving manual work, such as rewards, campaigns, refunds and the return of misdirected deposits.
- **Operation · Approval & sign-off**: Approving the payout plan for rewards and refunds, and crediting users' accounts.

### Current controls vs Lemma

The route in this case is column 1 (an input with the wrong unit and total). Column 2 covers an approved plan that is itself wrong, and column 3 a staff member with the authority deliberately paying out differently from the plan; nothing disclosed says either happened here.

| Control | Input with the wrong unit or total | A plan that is itself wrong | Deliberate wrongful payout by an authorised staff member |
| --- | --- | --- | --- |
| Multi-level approval (a check by someone other than the person who entered it) | Partial | Partial | Partial |
| Periodic reconciliation of the ledger against actual holdings | Partial | Partial | Partial |
| Anomaly detection and blocking of trading and withdrawals on affected accounts | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Effective |

Multi-level approval works if the approver spots a wrong unit or total by eye, but passes if the approval screen does not show the difference from the plan. Reconciling the ledger against holdings once a day leaves a delay between an error and its discovery, and does not stop the crediting itself (the FSC has called for reconciliation every five minutes and automatic trading halts on large mismatches). Detection and blocking work after crediting; here the error was noticed in 20 minutes and blocked in 40, but some BTC was sold in between. Lemma checks, before crediting, not by an approver's eye or after-the-fact reconciliation but by whether the payout falls within a signed plan and actual holdings.

Note: Lemma's check works only when it is built into the step that credits payouts, the payout plan is signed with the key of an approver other than the person who enters it, and the exchange's actual holdings can be read apart from the ledger. A payout from a plan that is itself wrong but within holdings passes this check. It can also pass if the person who drafts the plan and the person who approves it collude. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not find and recover mistaken payouts, nor does it get back assets that have been sold.

### Checklist

Three things to confirm about payouts involving manual work, such as rewards and refunds

- Do you reconcile the total of ledger balances against actual holdings every few minutes, and can trading halt automatically on a large mismatch?
- Do you make payouts involving manual work, such as rewards, from a dedicated account kept apart from the company's own account?
- Do you record, apart from the payout system, who entered a payout with which unit and total, and who approved it?

## 5. Facts and timeline

- **Parties**: Bithumb (빗썸), a South Korean crypto exchange. Supervisors: the Financial Services Commission (FSC), the Financial Intelligence Unit (FIU) and the Financial Supervisory Service (FSS).
- **What happened**: According to the FSC, at about 19:00 on 6 February Bithumb paid a reward to 695 participants in a customer-acquisition event as 2,000 BTC each (about 197 billion won at the time) instead of 2,000 won. The payout totalled 620,000 BTC. According to press reports, a staff member entered the payout unit as BTC instead of won. The Korea Times reported that 249 users actually received BTC, and that Bithumb's BTC holdings at the end of the third quarter of 2025 were 175 BTC of its own and 42,619 BTC held for users. According to the same paper, the chief executive told the National Assembly that there had been two earlier, small mistaken payouts, both recovered.
- **How it was found**: Bithumb noticed the error at 19:20, began blocking trading and withdrawals on the affected users' accounts at 19:35 and finished at 19:40 (FSC). The chief executive told the National Assembly that an internal recheck caught it about 20 minutes later, and that the means to detect and alert on the rise in ledger figures had been lacking (press reports).
- **Impact and response**: Citing Bithumb's report, the FSC said that as of 04:00 on 7 February, 618,214 of the 620,000 BTC (99.7%) had been recovered before being sold, and about 93% of the 1,786 BTC sold had been recovered. According to the Korea Times, the BTC price on Bithumb fell about 17% to 81.1 million won, and Bithumb estimated losses to users who panic-sold at about 1 billion won. Bithumb announced compensation for users who sold cheaply in that window on 7 February, and on 8 February that it had restored the integrity of the BTC ledger (FSC). According to press reports, compensation is the full price difference plus 10%, and users who accessed the service in that window receive 20,000 won.
- **The authorities' review findings** (FSC, 6 April): The emergency response team reviewed the five largest exchanges from 10 February to 6 March. Three reconciled ledgers against actual holdings only once a day and had no mechanism to halt trading on a large mismatch. For "high-risk transactions" involving manual work, such as event rewards, two exchanges did not separate them from the company's own account, four had no system to validate actual payouts automatically against the approved payout plan, and four paid out on the approval of a single staff member or a single department head. The exchanges were not named. The FSC said the review revealed accumulated structural problems at the exchanges beyond the human error cited as the surface cause of the mistaken payout.

### Timeline

- **2026-02-06**: At about 19:00 Bithumb pays the event reward as 2,000 BTC per person (620,000 BTC in total). It notices at 19:20 and has blocked the affected users' trading and withdrawals by 19:40.
- **2026-02-07**: 99.7% recovered as of 04:00. The FSC, FIU and FSS hold an emergency meeting and form an emergency response team with DAXA. Bithumb announces compensation for users who sold cheaply.
- **2026-02-08**: The FSC chairman holds a review meeting and orders a review of internal controls at every exchange, focusing on verifying ledgers against holdings at payout, multiple confirmation steps and controls on human error.
- **2026-02-10**: The emergency response team's review and the FSS inspection of Bithumb begin.
- **2026-02-11**: Bithumb's chief executive apologises before the National Assembly and acknowledges that a cross-check against holdings had not been in place (press reports).
- **2026-03-06**: The review and the inspection end.
- **2026-04-06**: The FSC publishes the review findings for the five largest exchanges and reforms including five-minute reconciliation, automatic validation and multi-level approval for high-risk transactions.

> The facts rely on the FSC's releases (two on 9 February and one on 6 April; primary) and press reports (the Korea Times and Newsis). Bithumb's own notices could not be confirmed (the exchange's site could not be opened). The staff member's input error, the chief executive's statements to the National Assembly (including the earlier mistaken payouts), the price fall and the compensation terms rely on press reports. The number of users who actually received BTC (249 according to the Korea Times) is not in the FSC's releases, and why 695 users at 2,000 BTC each does not come to 620,000 BTC has not been disclosed. The FSC's 9 February release dates the emergency response team to 7 February, and its 6 April release to 8 February. The 6 April findings cover the five largest exchanges and do not name individual exchanges. Bithumb's approval steps for the payout and what the FSS inspection found have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of Bithumb or the authorities. Written as of 10 November.

### After disclosure

- **FSC, FSS and DAXA**: Every exchange must build a system that reconciles ledgers against actual holdings every five minutes, with criteria to halt trading automatically on large mismatches. External accounting firms' reviews move from quarterly to monthly, and disclosures extend to wallet and ledger holdings per asset. High-risk transactions such as event rewards are to use separate accounts, with validation that automatically rejects an input whose unit or total does not match the approved plan, a mandatory third-party check at the input stage, and encouragement of approval authority tiered by amount and multi-level approval. Self-regulatory rules were to be revised in April and systems in place by May, with the main points reflected in the second-phase crypto-asset legislation. The FSS said its inspection of Bithumb found problems across its internal controls and that it would start sanction proceedings once its legal review of breaches of the Virtual Asset User Protection Act is complete. As of 10 November, the outcome of any sanctions could not be confirmed.
- **Bithumb**: According to press reports, the chief executive apologised before the National Assembly, said the scope of relief would be set broadly, and said a 100 billion won customer protection fund would be created from company assets.

## 6. Sources

- **Financial Services Commission (Primary, regulator's release)**: 「「빗썸 비트코인 오지급」 관련 「긴급 점검회의」 개최」 (2026-02-09, Korean) — <https://www.fsc.go.kr/no010101/86228>
- **Financial Services Commission (Primary, regulator's release)**: 「빗썸 사태 관련 금융위원장 주재 「점검회의」」 (2026-02-09, Korean) — <https://www.fsc.go.kr/no010101/86229>
- **Financial Services Commission (Primary, regulator's release)**: 「이용자 자산에 대한 상시 점검 시스템을 구축하고 금융회사 수준으로 내부통제체계를 강화하겠습니다」 (2026-04-06, Korean) — <https://www.fsc.go.kr/no010101/86636>
- **The Korea Times (Press)**: "Bithumb's 620,000-bitcoin mishap exposes systemic internal control failure" (2026-02-08) — <https://www.koreatimes.co.kr/economy/cryptocurrency/20260208/bithumbs-620000-bitcoin-mishap-exposes-systemic-internal-control-failure>
- **The Korea Times (Press)**: "FSC, FSS criticized for missing Bithumb system flaw in 'ghost coin' case" (2026-02-19) — <https://www.koreatimes.co.kr/economy/cryptocurrency/20260219/fsc-fss-criticized-for-missing-bithumb-system-flaw-in-ghost-coin-case>
- **Newsis (Press)**: 「빗썸 대표 "피해구제 범위 폭넓게 적용할 것"…'유령코인' 사태에 고개(종합)」 (2026-02-11, Korean) — <https://www.newsis.com/view/NISX20260211_0003511435>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
