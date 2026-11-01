---
brief_no: 165
title: "お名前.com デスクトップクラウド：借りたサーバーに不正プログラム、取引口座で身に覚えのない取引"
title_en: "Onamae.com Desktop Cloud: Malicious programs on rented servers, and trades customers say they did not make"
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
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORISED ACCESS"
og_headline_ja: "借りたデスクトップに\n不正プログラム。\n身に覚えのない取引の報告\n<accent>26,739 件に影響の可能性</accent>"
og_headline_en: "Malicious programs on rented desktops.\nTrades customers say they did not make.\n<accent>26,739 servers potentially affected.</accent>"
key_figures:
  - value: "26,739"
    label: "Servers potentially affected (all plans). Not the number where unauthorised access or data retrieval was confirmed"
    tone: "alert"
  - value: "About ¥8"
    unit: "billion"
    label: "Amount demanded in the extortion email. The company says it will not pay"
  - value: "Undisclosed"
    label: "Number and value of the trades customers say they did not make, and the intrusion route"
insight:
  slug: "valid-login-not-holder"
  label: "A valid login versus the account holder's own order"
  quote: "A valid login is not proof that the account holder made the operation."
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "separate-approval"
    item: "The account holder approves withdrawals and changes of withdrawal destination on a device separate from the trading tool's environment"
  - slug: "hold-unverified"
    item: "The account holder sets the scope of orders delegated to the trading tool; orders outside it are held, not executed"
  - slug: "audit-trail"
    item: "Record which scope and which approval each trade was executed under"
attack_method: "account-takeover"
impact: "26,739 servers potentially affected. Customer information was taken out, and some customers reported trades they did not make"
takeaway: "If a valid login is enough for an order to go through, then once the environment storing that login is entered, the order cannot be told apart from the holder's own."
self_check: "Are limits on the orders you delegate to a trading tool set outside the tool's environment?"
countries: ["jp"]
---

## 1. Summary

Onamae.com Desktop Cloud is used to keep FX and other trading tools running, and the tools store trading-account logins. GMO Internet has confirmed unauthorised access to the service environment and the exfiltration of customer information, and since 21 October it has received reports from customers of trades they did not make. Those believed to be the attackers threaten to keep draining account balances with unauthorised orders. <strong>If a valid login is enough for an order to go through, then once the environment storing that login is entered, the order cannot be told apart from the holder's own.</strong>

## 2. What got through

- **What got through**: Trades that some customers say they did not make, on their trading accounts (reports from customers since 21 October). The number, value and timing have not been disclosed. The company's compensation covers trading losses and fees (fourth notice).
- **What reaches the receiving side**: In general, a trading tool connects to the securities or FX firm with the stored account login, and its orders arrive as operations made with a valid login. The company says the stored logins may have been obtained and misused (second notice).
- **Not disclosed**: The intrusion route, how the trades customers did not make were carried out, and how the securities and FX firms authenticate.

## 3. What to check

Whatever the route, the condition for telling them apart is that the side receiving orders checks, before execution and separately from the login, the scope the account holder set and the holder's approval.

- **Who sets the scope and approves**: The account holder. With a key on a device outside the trading tool's environment (such as their own smartphone), the holder sets the scope delegated to the tool (instruments, size, daily limit, expiry, no withdrawals), and approves each order beyond that scope and each withdrawal or change of withdrawal destination. When the tool trades automatically, approval is not required order by order, and orders within the scope go through.
- **Where it is checked**: The securities or FX firm's servers that execute orders and withdrawals. Operations that do not match the scope or an approval are held, not executed.
- **What is left**: A record of which scope and which approval each trade was executed under. It stays outside the compromised environment and can be used to recognise unauthorised trades and reconcile compensation.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an order or withdrawal is executed, that it is within the scope the holder set or approved by the holder, and keeping a record. Detection means noticing an intrusion after it happens.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the holder's scope and approval before execution</div>
<div class="rx-zone gapz"><b>In between</b><span>Whether orders before discovery<br>could be told apart is not known</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Investigate after inquiries and shut down all servers</div>
<div class="rx-g g1"><div class="t">Timing undisclosed</div><b>Customer information taken out</b></div>
<div class="rx-g g2"><div class="t">Reported from 10-21</div><b>Trades customers did not make</b></div>
<div class="rx-g g3"><div class="t">10-20</div><b>Malicious programs confirmed</b></div>
<div class="rx-g g4"><div class="t">10-21</div><b>All servers shut down</b></div>
</div>
</figure>

Shutting down all servers and asking securities and FX firms to block access were measures taken after discovery. Whether orders placed before discovery could be told apart on the receiving side is not known from the disclosures. That valid credentials can be misused is a point shared with the [Klue](/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/) case (Salesforce data was extracted, starting from a test credential that had not expired).

## 4. What Lemma does

**Lemma builds the check in section 3 into the side that executes orders and withdrawals.** It does not look for intrusions; it checks whether an incoming operation is within the scope the holder set, or approved by the holder.

### Industries and operations to watch

- **Industry · Finance**: Securities, FX and crypto firms that take orders from trading tools or APIs. When a tool arrives with a valid login, it looks the same as the holder.
- **Industry · IT services (providers)**: Businesses that host and run customers' trading tools, such as FX VPS and desktop cloud providers. Many customers' trading-account logins gather in their environment.
- **Users · Firms and individuals running trading tools in outside environments**: Account logins are stored inside rented servers or cloud environments.
- **Operation · Accounts & permissions**: Managing trading-account logins, sessions, withdrawal destinations and two-step verification settings.

### Current controls vs Lemma

| Control | Withdrawals and destination changes | Orders beyond the scope | Orders within the scope |
| --- | --- | --- | --- |
| Strong passwords, regular changes | Not effective | Not effective | Not effective |
| Two-step verification | Partial | Not effective | Not effective |
| Blocking and monitoring by securities and FX firms | Partial | Partial | Partial |
| Compensation for losses | Not relevant | Not relevant | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

This compares what happens once a login is stolen. A password lets the operation through as soon as it is stolen; two-step verification looks only at login; blocking and monitoring look for unusual behaviour. Lemma checks the operation itself rather than the login.

Note: Lemma's check works only where the securities or FX firm builds it in before executing orders and withdrawals, and the holder's key is outside the trading tool's environment. Orders within an automated-trading scope go through, as do operations when the approving device itself is taken over. The table compares what each control checks; it does not show whether anything would have stopped this case. Lemma does not detect or prevent intrusion or data exfiltration.

### Checklist

Three points for businesses that host trading tools and for securities and FX firms that accept trading accounts

- When a withdrawal destination or authentication setting changes, does a notice also reach a contact outside the trading tool's environment?
- When an outside environment hosting a trading tool is compromised, can logins and sessions from that environment be stopped at once?
- When an unauthorised trade is reported, can you provide the connection source and approval record for each trade to check compensation?

## 5. Facts and timeline

- **Service**: Onamae.com Desktop Cloud (GMO Internet). A service for renting Windows desktops on the provider's infrastructure.
- **Confirmed**: The company has confirmed a security problem in the service's system, unauthorised access to the service environment and the exfiltration of customer information (fourth notice). Malicious programs were placed in some customers' server environments. Analysis of devices received from customers has so far found no trace of malware infection or ransomware (fourteenth notice).
- **Information that may have been misused**: Information on the servers, including trading-account logins stored in trading tools. The company says payment data such as card details was not held on these servers.
- **Servers potentially affected**: 26,739 (all plans, second notice).
- **Extortion**: About ¥8 billion was demanded in an email on 21 October. The threats include continued unauthorised operation (draining balances with unauthorised orders) of customers' accounts at more than 70 securities and FX firms in Japan and abroad. The number is a claim by those believed to be the attackers.

### Timeline

- **2026-10-19**: Investigation begins after customer inquiries.
- **2026-10-20**: Malicious programs confirmed in some customers' server environments. New sign-ups and the control panel suspended.
- **2026-10-21**: Servers on all plans shut down from 04:00; first notice. Extortion email received the same day. From this day, reports of trades customers did not make are received.
- **2026-10-22**: Police consulted. 26,739 potentially affected servers disclosed.
- **2026-10-24**: Fourth notice says the security problem and the exfiltration have been confirmed. Payments to customers and compensation for losses from unauthorised trades decided.
- **2026-10-27**: Publication by those believed to be the attackers of material claimed to be company and customer information confirmed. A bounty (up to US$1 million) announced (submissions from 12:00 on the 28th).
- **2026-10-29**: Sixteenth notice. Bounty tip counts begin to be published as weekday 18:00 addenda (428 in total as of 18:00 on the 30th).
- **2026-10-30**: Instructions on payments and the replacement service start going to customers.

> Facts rest on GMO Internet and GMO Internet Group's official statements (up to the sixteenth notice and the 30 October notice to customers). What has not been disclosed does not mean no measure existed. As of 31 October, no later notice has disclosed the intrusion route.

### After disclosure

- **Requests to securities and FX firms**: Major exchanges and brokers were asked to block access via the service, cut all sessions and monitor unauthorised trades.
- **Compensation**: ¥5,000 to every customer. Customers whose information the company confirms was in published material receive an extra ¥10,000–25,000 per category (cap ¥3 million per publication). Realised losses from trades the company recognises as unauthorised are compensated. The replacement service is free for six months. The current system will not simply be restarted.

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
