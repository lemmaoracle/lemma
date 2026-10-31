---
brief_no: 165
title: "お名前.com デスクトップクラウド：顧客のサーバーに不正プログラムが置かれ、取引口座で身に覚えのない取引が報告された(GMO インターネット公表) — 正しいログイン情報による取引が本人の操作かを、実行の前に照合する層が見えない"
title_en: "Onamae.com Desktop Cloud: Malicious programs were placed on customer servers, and customers reported trades they did not make (GMO Internet) — No check, before execution, that a trade made with valid logins is the account holder's own is visible"
pillar: 04-regulatory-attribute
primary_category: identity-auth
secondary_categories: []
incident_date: 2026-10-20
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["075-klue-oauth-salesforce-credential-lifecycle", "059-vercel-contextai-oauth", "052-discord-age-verification-id-leak"]
status: draft
version: "1.0"
og_lead_ja: "お名前.com デスクトップクラウドに不正アクセス、身に覚えのない取引の報告"
og_lead_en: "Onamae.com Desktop Cloud breach: customer data taken, unauthorised trades reported"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "借りたデスクトップに\n置いたログイン情報で、\n身に覚えのない取引。\n<accent>26,739 件に影響の可能性</accent>"
og_headline_en: "Logins on rented PCs,\nand trades no one made.\n<accent>26,739 servers at risk.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "26,739"
    label: "Servers potentially affected (all plans). Not the number where access or data retrieval was confirmed"
    tone: "alert"
  - value: "10-20 → 10-21"
    label: "From confirming the malicious programs to shutting down servers on all plans"
  - value: "Undisclosed"
    label: "The number and value of unauthorised trades, and the intrusion route"
glossary:
  - term: "Desktop cloud"
    desc: "A service that rents a Windows desktop running on the provider's servers, used over the internet. Trading tools keep running even when the customer's own PC is off."
  - term: "Trading tools (MT4/MT5 and others)"
    desc: "Software used for FX and other trading. It stores the trading-account login and places orders."
  - term: "Session"
    desc: "The logged-in state. Until it is cut, operations continue without entering the password again."
insight:
  slug: "valid-login-not-holder"
  label: "Telling a valid login from the holder's own operation"
  quote: "The trading tools and the trading-account logins sat together in the rented environment. When information taken from there is used, what the counterparty sees is an operation with a valid login."
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "separate-approval"
    item: "Take the holder's approval for orders and withdrawals on a device separate from the environment where the trading tool runs"
  - slug: "hold-unverified"
    item: "Hold withdrawals and settings changes whose approval cannot be matched to the holder"
  - slug: "audit-trail"
    item: "Record which device and which approval each trade was executed with"
attack_method: "account-takeover"
impact: "26,739 servers potentially affected; customer information taken and some customers reported trades they did not make"
takeaway: "Trading tools and account logins sat together in a rented environment. Trades made with information taken from there look like valid logins to the counterparty."
self_check: "Do you take the holder's approval for orders and withdrawals through a path separate from the environment where the trading tool runs?"
countries: ["jp"]
---

## 1. TL;DR

On 20 October 2026, GMO Internet confirmed that a third party had placed malicious programs on some customers' server environments in Onamae.com Desktop Cloud, its rented desktop service. On 24 October it said a security problem existed in the service's system and that it had confirmed customer information was taken out. Customers kept trading tools and trading-account logins in this environment. Some customers have reported trades on their accounts that they did not make.

GMO Internet says logins stored on the servers may have been misused. When taken information is used, what the counterparty sees is an operation with a valid login. The intrusion route, the number and value of unauthorised trades, and the number of affected customers have not been disclosed.

The company began investigating after customer inquiries and shut down servers on all plans the day after confirming the malicious programs. But trades customers did not make had gone through at the counterparties (when is not disclosed). What failed was the layer that matches, before execution, a trade made with a valid login to the account holder.

## 2. What happened

- **Service**: Onamae.com Desktop Cloud (GMO Internet, Japan), rented Windows desktops on which customers ran trading tools (MT4/MT5 and others) with their trading-account logins stored.
- **Method**: a third party placed malicious programs on some customers' server environments. GMO Internet says a security problem existed in its system and that it confirmed customer information was taken out.
- **Information possibly misused**: information stored on the servers, including trading-account logins saved in trading tools. Payment data, including card data, was not held on those servers.
- **Servers potentially affected**: 26,739 across all plans. GMO Internet Group says this is the number that could be affected, not the number where access or data retrieval was confirmed.
- **Unauthorised trades**: some customers reported trades they did not make.
- **Extortion**: a demand for about ¥8 billion in an email received on 21 October, which GMO Internet says it will not pay. The threats included continued unauthorised operation of accounts at more than 70 securities and FX firms. That figure is part of the threat as GMO recorded it, not a number GMO confirmed.
- **Not disclosed**: the intrusion route (under investigation with a security firm), the number and value of unauthorised trades, the number of affected customers, how exchanges and brokers authenticate, and the restart date.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it is just before ④. The intrusion route in ② has not been disclosed. ③ rests on customers' reports of trades they did not make and GMO Internet's statement that logins may have been misused.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Customer</div><div class="no">1</div><b>Keeps trading tools and logins in the rented environment</b><p>Trading-account logins are saved in the tool.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Places malicious programs and takes information out</b><p>26,739 servers potentially affected. Route not disclosed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Operates trading accounts with the logins</b><p>Trades customers did not make were reported. Counts and amounts not disclosed.</p></div>
<div class="rx-step crit"><div class="who">Counterparty</div><div class="no">4</div><b>Accepts it as a valid login</b><p>No means of matching the operation to the holder at execution is visible in the disclosures.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-19**: GMO Internet begins investigating after customer inquiries.
- **2026-10-20**: Malicious programs confirmed on some customers' servers; new sign-ups and the control panel suspended.
- **2026-10-21**: Servers on all plans shut down in turn from 04:00; first notice. Extortion email received the same day.
- **2026-10-22**: Police consulted. GMO Internet Group's second notice gives 26,739 potentially affected servers.
- **2026-10-23**: GMO Internet Group files a timely disclosure.
- **2026-10-24**: Fourth notice: security problem in the system and exfiltration of customer information confirmed. Payments to customers, compensation for realised losses from unauthorised trades and a replacement service decided. Government asked to apply active cyber defence.
- **2026-10-25**: Customers asked to help examine their own devices (analysis of devices received begins on the 26th).
- **2026-10-27**: At 12:30, publication of material claimed to be company and customer information confirmed (tenth notice). Additional payments and a bounty of up to US$1 million announced (twelfth notice).
- **2026-10-28**: Attacker site's domain confirmed taken down around 04:00 (thirteenth notice). Analysis of customers' devices finds no trace of malware infection or ransomware (fourteenth notice).
- **2026-10-29**: The group's white-hat team obtains information it believes may identify the perpetrator and passes it to police and others (fifteenth notice).
- **2026-10-30**: 428 bounty tips by 18:00 (sixteenth notice). Payment and replacement-service instructions start going to customers directly.

> The facts rest on GMO Internet and GMO Internet Group's official statements, up to the 30 October addendum to the sixteenth notice and the customer notice of the same day. The extortion content is the attacker's claim as GMO recorded it. As of 31 October, no follow-up has disclosed the intrusion route.

### After disclosure

- **Blocking and monitoring requested**: GMO Internet has asked major exchanges and brokers to block access via the service, force-close all sessions, and monitor and curb unauthorised trades.
- **Requests to customers**: change trading passwords from a device not used for trading, end active sessions, check history and balances, enable two-step verification.
- **Compensation**: ¥5,000 to every current customer regardless of loss, plus ¥10,000–25,000 per category of published data (cap ¥3 million per publication). Instructions for claiming realised losses recognised as unauthorised by 6 November. Replacement service free for six months.
- **Service**: the current system will not simply restart; the security platform is being rebuilt. No restart date. No impact on other group services has been confirmed.

## 4. Why it wasn't stopped

The failure here is not only that the rented environment was entered. No **layer that matches, before execution, a trade made with a valid login to the account holder** is visible in the disclosures.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means matching, before an order or withdrawal is executed, that "the holder of this account approved this operation", and keeping a record. Detection means noticing an intrusion after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible here</b>Match the operation to the holder's approval before execution</div>
<div class="rx-zone gapz"><b>Gap</b><span>Trades with a valid login<br>look the same to the counterparty</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Investigate from inquiries, shut down all servers</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Logins taken out</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Trades customers did not make</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Confirmed on 10-20</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>All servers down on 10-21</b></div>
</div>
</figure>

Detection worked: GMO Internet shut down all servers the day after confirming the malicious programs and asked counterparties to block access. But "operated with a valid login" and "operated by the account holder" are separate facts, and once the trading tool's own environment is entered, anything that tells them apart has to sit outside that environment. Which trades were the holder's own has to be worked out afterwards from trading records, and compensation for losses depends on that reconciliation.

The same structure appears in [Klue](/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/) (an unexpired test credential used to extract Salesforce data).

## 5. How to counter this

**Take the holder's approval for orders and withdrawals through a path separate from the environment where the trading tool runs.** Then, even if logins are taken out along with the environment, a login alone no longer lets a trade through. If trading tools run in an outside environment, make sure logins and sessions from that environment can be cut all at once when it is compromised. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Finance**: securities, FX and crypto businesses that take orders from trading tools or APIs. A tool arriving with a valid login looks the same as the holder.
- **Industry · Finance (users)**: companies and individuals running trading tools on rented servers or cloud environments, with account logins stored inside.
- **Operation · Accounts & permissions**: managing trading-account logins, sessions, and withdrawal-destination and two-step settings.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Strong passwords, changed regularly | Not relevant | The logins stored in trading tools may have been taken out of the environment as they were. |
| Two-step verification | Partial | It protects login. If authentication passes in the same environment as the trading tool, it cannot tell the two apart once that environment is entered. Customers' settings were not disclosed. |
| Counterparties blocking and monitoring access | Partial | Requested after discovery. It does not reach trades made before that. |
| Compensation for losses | Not relevant | An after-the-fact remedy; it does not stop the trade. |

### What is needed

1. **Take the holder's approval through a separate path.** Take approval for orders and withdrawals on a device separate from the environment where the trading tool runs (such as the holder's own phone). Holding the login alone should not authorise an operation.
2. **Hold operations that cannot be matched.** Hold withdrawals, and changes to withdrawal destinations or authentication settings, whose approval cannot be matched to the holder.
3. **Record which approval each trade used.** Keep which device and which approval each trade was executed with, separately from the rented environment's own records and in a form that can be checked later: in other words, as proof. It becomes the basis for recognising unauthorised trades and reconciling compensation.

### Checklist

Three things to confirm in your organisation about trading accounts and the environments where trading tools run

- When withdrawal destinations or authentication settings change, does a notice also reach a contact outside the trading tool's environment?
- If an outside environment running trading tools is compromised, can you cut logins and sessions from that environment at once?
- For each trade, can you check later which device and which approval it was executed with?

Note: where a trading tool trades automatically, approval cannot be required for every order; in that case, limit approval to irreversible operations such as withdrawals and changes of withdrawal destination. If the device used for approval is itself taken over, this check passes too. The intrusion route has not been disclosed. If follow-up reports reveal it, this Brief will be revised.

## 6. Sources

- **GMO Internet (Primary, company notice)**: Fourth notice on the cyberattack against Onamae.com Desktop Cloud (2026-10-24, Japanese; security problem and exfiltration confirmed) — <https://internet.gmo/news/article/249/>
- **GMO Internet (Primary, company notices)**: Current response to the unauthorised access, notices 7, 10 and 12 (2026-10-26 – 27, Japanese) — <https://internet.gmo/news/article/253/> / <https://internet.gmo/news/article/256/> / <https://internet.gmo/news/article/258/>
- **GMO Internet (Primary, company notices)**: Same, notices 13 to 16 (2026-10-28 – 30, Japanese) — <https://internet.gmo/news/article/259/> / <https://internet.gmo/news/article/260/> / <https://internet.gmo/news/article/261/> / <https://internet.gmo/news/article/262/>
- **GMO Internet (Primary, company notice)**: Notice to customers on payments and the replacement service (2026-10-30, Japanese) — <https://internet.gmo/news/article/263/>
- **GMO Internet Group (Primary, company notice)**: Second notice and apology (2026-10-22, Japanese) — <https://group.gmo/info/alert/20261022/>
- **GMO Internet Group (Primary, timely disclosure)**: Unauthorised access to a consolidated subsidiary's service (2026-10-23, Japanese) — <https://ir.group.gmo/pdf/irlibrary/gmo_disclose_info20261023.pdf>
- **GMO Internet (Primary, timely disclosure)**: Payments and compensation for losses from unauthorised trades (2026-10-24, Japanese) — <https://internet.gmo/ir/pdf/irlibrary/gmointernet_j_disclose_20261024.pdf>
- **GMO Internet (Primary, timely disclosure)**: Response policy (2026-10-28, Japanese) — <https://internet.gmo/ir/pdf/irlibrary/gmointernet_j_disclose_20261028.pdf>
- **MLex (Press)**: "Japan's GMO Internet offers compensation after cyberattack" (2026-10-24) — <https://www.mlex.com/mlex/articles/2542176>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
