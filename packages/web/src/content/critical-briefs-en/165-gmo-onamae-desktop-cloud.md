---
brief_no: 165
title: "お名前.com デスクトップクラウド：顧客のサーバー環境に不正プログラムが置かれて情報が持ち出され、取引口座で身に覚えのない取引が報告された(GMO インターネット公表) — 正しい認証情報による取引が、口座の本人の操作かを、実行の前に確かめる層は公表からは見えない"
title_en: "Onamae.com Desktop Cloud: Malicious programs on customer server environments led to information being taken, and customers reported trades they did not make (GMO Internet) — No layer is visible that checks, before execution, that a trade made with valid credentials is the account holder's own"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: []
incident_date: 2026-10-20
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["075-klue-oauth-salesforce-credential-lifecycle", "059-vercel-contextai-oauth", "052-discord-age-verification-id-leak"]
status: draft
version: "1.0"
og_lead_ja: "お名前.com デスクトップクラウドに不正アクセス、顧客の情報が持ち出され、取引口座で身に覚えのない取引"
og_lead_en: "Onamae.com Desktop Cloud breached: customer information taken, unauthorised trades reported"
industries: ["finance", "developers"]
operations: ["account-admin"]
attack_method: "account-takeover"
impact: "26,739 servers potentially affected; customer information taken and some customers reported trades they did not make"
takeaway: "No layer is visible that checks, before execution, that a trade made with valid credentials is the account holder's own."
countries: ["jp"]
---

## 1. TL;DR

On 19 October 2026, after customer inquiries, GMO Internet began investigating its Onamae.com Desktop Cloud service, and on 20 October confirmed that a third party had placed malicious programs on some customers' server environments. On 24 October it said a security problem existed in the service's system and that it had confirmed unauthorised access to the environment and the exfiltration of customer information. Trading-account credentials stored on the servers may have been misused, and some customers reported trades on their accounts that they did not make. The intrusion route, the number and value of unauthorised trades, and the number of affected customers have not been disclosed.

The company shut down all servers the day after confirmation and asked exchanges and brokers to block access via the service and cut all sessions. <strong>What did not work was a layer that checks, before execution, that a trade made with valid credentials is the account holder's own.</strong> No such layer is visible in the disclosures.

## 2. What happened

- **Service**: Onamae.com Desktop Cloud (GMO Internet, Japan), rented Windows desktops on which customers ran trading tools (MT4/MT5 and others) with their trading-account logins stored.
- **Method**: a third party placed malicious programs on some customers' server environments. GMO Internet says a security problem existed in its system and that it confirmed customer information was taken out. The intrusion route is under investigation with a security firm and not disclosed.
- **Information possibly misused**: information stored on the servers, including trading-account logins saved in trading tools. Payment data, including card data, was not held on those servers.
- **Servers potentially affected**: 26,739 across all plans. GMO Internet Group says this is the number that could be affected, not the number where access or data retrieval was confirmed.
- **Unauthorised trades**: some customers reported trades they did not make. Counts and amounts not disclosed.
- **Extortion**: a demand for about ¥8 billion in an email dated 21 October, which GMO Internet says it will not pay. The threats included continued unauthorised operation of accounts at more than 70 securities and FX firms. That figure is part of the threat as GMO recorded it, not a number GMO confirmed.

The chain was as follows.

1. Customers kept trading tools and trading-account logins inside rented desktop environments.
2. A third party placed malicious programs on some server environments and took customer information out. The route is undisclosed.
3. Customers reported trades they did not make; GMO Internet says the stored logins may have been misused.
4. No means is visible in the disclosures for the counterparties to check, at the moment of execution, that a trade was the account holder's own.

## 3. Timeline — disclosure and response

- **2026-10-19**: GMO Internet begins investigating after customer inquiries.
- **2026-10-20**: Malicious programs confirmed on some customers' servers; new sign-ups and the control panel suspended.
- **2026-10-21**: All plans' servers shut down from 04:00; first notice. Extortion email dated the same day.
- **2026-10-22**: Police consulted. Second notice gives 26,739 potentially affected servers.
- **2026-10-23**: GMO Internet Group files a timely disclosure.
- **2026-10-24**: Fourth notice: security problem in the system and exfiltration of customer information confirmed. ¥5,000 to every current customer, compensation for realised losses from unauthorised trades, and a replacement service free for six months. Government asked to apply active cyber defence.
- **2026-10-25 – 26**: Customers asked to help examine their own devices; analysis of devices received begins.
- **2026-10-27**: At 12:30, publication of material claimed to be company and customer information confirmed (tenth notice). Additional payments of ¥10,000–25,000 per category of published data (cap ¥3 million) and a bounty of up to US$1 million announced (twelfth notice).
- **2026-10-28**: Attacker site's domain confirmed taken down around 04:00 (thirteenth notice). Bounty intake opens at 12:00. Analysis of customers' devices finds no trace of malware infection or ransomware (fourteenth notice).
- **2026-10-29**: The group's white-hat team obtains information it believes may identify the perpetrator and passes it to police (fifteenth notice).
- **2026-10-30**: 428 bounty tips by 18:00 (sixteenth notice). Payment and replacement-service instructions start going to customers.

> Facts here rest on GMO Internet and GMO Internet Group's official statements up to the 30 October addendum to the sixteenth notice. The intrusion route, unauthorised trade counts and amounts, affected customer numbers and the restart date are undisclosed. The extortion content, including "more than 70", is the attacker's claim as recorded by GMO. None of the statements describe the counterparties' authentication.

### Response

- **Blocking and monitoring requested**: GMO Internet has asked major exchanges and brokers to block access via the service, force-close all sessions, and monitor and curb unauthorised trades.
- **Requests to customers**: change trading passwords from a device not used for trading, end active sessions, check history and balances, enable two-step verification.
- **Compensation**: ¥5,000 to every current customer regardless of loss; instructions for claiming realised losses by 6 November.
- **Service**: the current system will not simply restart; the security platform is being rebuilt. No restart date. No impact on other group services has been confirmed.

## 4. Why it wasn't stopped

What was missing is a layer that checks, before execution, that a trade made with valid credentials is the account holder's own. GMO Internet acknowledges a security problem in its own system. Separate from the layer that keeps intruders out, the question is whether anything stops trades made with credentials taken from a rented environment.

That is the **gap between detection and proof**. Discovery came from customer inquiries, and GMO Internet shut down all servers the next day and asked counterparties to block access. But when a trading tool arrives with the right login, what the counterparty sees is an operation with valid credentials. Whether it is the account holder's or made with taken information is not distinguishable at that moment by any mechanism visible in the disclosures. GMO's request that customers enable two-step verification suggests some accounts lacked it, but the disclosures do not say so.

As a result, which trades were the holder's own has to be worked out afterwards from trading records, and compensation for losses recognised as unauthorised depends on that reconciliation.

The same structure appears in earlier Briefs: [Klue](/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/) (an unexpired test credential used to extract Salesforce data) and [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/) (a broadly scoped OAuth grant as the entry point).

> "Made with valid credentials" and "made by the account holder" are different facts. The first is visible at every operation; the second must be checked at every operation.

## 5. What proof would have changed

A single step could sit directly before an operation on a trading account: confirming that the operation falls within a registered principal and device scope. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Proof of permission per operation**: for each order or withdrawal, register the operating principal and device scope at grant time as issuer-signed proof, and check it before execution. Holding the login alone does not authorise an operation.
- **Proof of principal separate from credentials**: keep proof of who is operating separate from passwords and sessions, so that taken credentials alone do not let an operation through.
- **Independent record visible to the counterparty**: record which permission each executed operation relied on, separately from the rented environment's own records, as a basis for recognising unauthorised trades and reconciling compensation.

</ul>

> Note: the proof shows only that an operation is within a registered permission. It passes when a permitted device itself is taken over or the registered scope is too broad. Preventing intrusion, finding malicious programs and dealing with the attacker are outside the proof.

This differs from after-the-fact blocking, compensation and investigation. The detection layer and this layer are complementary, not substitutes: the former notices the intrusion and limits its spread; the latter lets operations that cannot be shown to be the holder's own be stopped before they run.

## 6. Sources

- **GMO Internet (primary, company notice)**: fourth notice on the cyberattack against Onamae.com Desktop Cloud (2026-10-24; security problem and exfiltration confirmed) — <https://internet.gmo/news/article/249/>
- **GMO Internet (primary, company notices)**: current response, notices 7 (10-26), 10 (10-27), 12 (10-27) — <https://internet.gmo/news/article/253/> / <https://internet.gmo/news/article/256/> / <https://internet.gmo/news/article/258/>
- **GMO Internet (primary, company notices)**: notices 13 and 14 (10-28), 15 (10-29), 16 (10-29, updated 10-30) — <https://internet.gmo/news/article/259/> / <https://internet.gmo/news/article/260/> / <https://internet.gmo/news/article/261/> / <https://internet.gmo/news/article/262/>
- **GMO Internet Group (primary, company notice)**: second notice (2026-10-22) — <https://group.gmo/info/alert/20261022/>
- **GMO Internet Group (primary, timely disclosure)**: unauthorised access to a consolidated subsidiary's service (2026-10-23) — <https://ir.group.gmo/pdf/irlibrary/gmo_disclose_info20261023.pdf>
- **GMO Internet (primary, timely disclosure)**: payments and compensation for losses from unauthorised trades (2026-10-24) — <https://internet.gmo/ir/pdf/irlibrary/gmointernet_j_disclose_20261024.pdf>
- **GMO Internet (primary, timely disclosure)**: response policy (2026-10-28) — <https://internet.gmo/ir/pdf/irlibrary/gmointernet_j_disclose_20261028.pdf>
- **MLex (independent reporting)**: "Japan's GMO Internet offers compensation after cyberattack" (2026-10-24) — <https://www.mlex.com/mlex/articles/2542176>

The company's official statements are the primary source; no independent verification has been found, and MLex is the only English-language outside report. The intrusion route, unauthorised trade counts and amounts, and affected customer numbers are undisclosed and may change. Japanese media and blogs are not used as sources.

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/), [Pillar 03 — Agent authority](/pillars/#authority)
