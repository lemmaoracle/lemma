---
brief_no: 201
title: "永豊銀行：新しいネットバンキングの取引システムで、提供元の安全の設定が外部のハッカーに利用され、客がログインしていない口座から不正に送金された(同行の公表)"
title_en: "Bank SinoPac: On its new online banking transaction system, outside hackers exploited the vendor's security settings, and money was transferred out of accounts whose owners had not logged in (bank's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [code-provenance]
incident_date: 2026-11-03
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["135-zombie-cards-visa-contactless-expiry", "069-connectwise-cloud-backup-app-identity-credential-abuse", "162-hatena-police-impersonation-remote-transfer"]
status: draft
version: "1.0"
og_lead_ja: "台湾の永豊銀行で、新しいネットバンキングの取引システムの提供元の安全の設定が外部のハッカーに利用され、418 人の口座から 427 件・約 4,176 万台湾ドルが不正に送金された"
og_lead_en: "At Taiwan's Bank SinoPac, outside hackers exploited the vendor's security settings on a new online banking system, and NT$41.76 million left 418 customers' accounts in 427 transfers"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 委託先の製品の設定"
og_kicker_en: "CYBERATTACK · VENDOR SETTINGS"
og_headline_ja: "ログインしていない\n口座から、送金が\n通った。\n<accent>418 人・427 件</accent>"
og_headline_en: "Transfers left accounts\nwhose owners had not\nlogged in.\n<accent>418 customers, 427 transfers.</accent>"
key_figures:
  - value: "NT$41.76"
    unit: "million"
    label: "Transferred out of customers' accounts without authorisation (418 customers, 427 transfers of NT$10,000 to NT$100,000 each, most NT$100,000; bank's press conference via CNA). All of it was refunded the same day"
    tone: "alert"
  - value: "418 / 427"
    unit: "customers / transfers"
    label: "Affected customers and transfers (bank's press conference via CNA). The FSC first gave 419 customers and 427 transfers (Liberty Times, CNA)"
  - value: "09:29 → 13:47"
    label: "On 3 November, from the first customer complaints to the bank identifying the cause and pulling the new app (bank's press conference via CNA)"
glossary:
  - term: "New online banking (新網銀)"
    desc: "The transaction system behind Bank SinoPac's newly introduced online and mobile banking. According to the bank, it is a foreign vendor's product that no other financial institution in Taiwan has adopted."
  - term: "Non-designated transfer"
    desc: "A transfer to an account not registered in advance. Taiwanese banks set lower caps on these than on transfers to registered accounts; Bank SinoPac's guidance gives NT$50,000 per transfer and NT$100,000 per day for an ordinary account."
  - term: "F-ISAC"
    desc: "Taiwan's financial-sector information sharing and analysis centre for cybersecurity, through which financial institutions share information on attack methods."
insight:
  slug: "transfer-trusts-transaction-system-setting"
  stop: true
  label: "Customer authentication left to the transaction system's settings"
  quote: "Before executing a transfer out of an account, check the instruction against the bank's own record of the customer's authentication and the per-transfer cap, apart from the transaction system's settings."
industries: ["finance"]
operations: ["approval", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Before executing a transfer instruction, confirm on the bank's side that it is tied to a record of the customer's authentication, not just that the transaction system accepted it"
  - slug: "hold-unverified"
    item: "Hold, before execution, instructions not tied to an authentication record, instructions over the per-transfer or daily cap, and instructions from many accounts converging on one payee in a short time"
  - slug: "audit-trail"
    item: "Keep, apart from the transaction system, a record of which account's transfer passed which authentication and arrived from which transaction system"
attack_method: "supply-chain"
impact: "427 unauthorised transfers totalling NT$41.76 million left 418 customers' accounts for a single account at another bank (bank's press conference). The bank refunded the full amount and fees the same day"
takeaway: "On a new online banking transaction system, outside hackers exploited the vendor's security settings, and transfers went through from accounts whose owners had not logged in. Execute transfers only after checking them against the customer's authentication record and the cap, apart from the transaction system's settings."
self_check: "Do you know whether the check of customer authentication and the per-transfer cap before a transfer is executed is left solely to a vendor product's settings?"
countries: ["tw"]
---

## 1. Summary

On the morning of 3 November 2026, unauthorised transfers ran from customers' accounts at Taiwan's Bank SinoPac to a single account at another bank. At a press conference the bank put the damage at 418 customers, 427 transfers and NT$41.76 million in total, with each transfer between NT$10,000 and NT$100,000 and most at NT$100,000 (CNA). According to reports, the affected customers had not logged in to the new app, and the money left without SMS verification or facial recognition.

On 4 November the bank said outside hackers had exploited the vendor's security settings on the transaction system behind its new online banking. No other financial institution in Taiwan has adopted that system. The bank pulled the new app, refunded the full amount and fees the same day, and says it will claim damages from the vendor. Details of the method have not been disclosed, as the case is under judicial investigation.

<strong>That a transaction system accepted a transfer does not show that the account holder gave the instruction.</strong>

## 2. What got through

- **What got through**: Transfers out of customers' accounts. According to Bank SinoPac, outside hackers exploited the vendor's security settings on the new online banking transaction system, and money left customers' accounts without their knowledge. According to reports, the affected customers had not logged in to the new app and had passed no SMS verification or facial recognition (Economic Daily News). Every transfer went into the same account at Taipei Fubon Bank, which was frozen that morning (CNA, Liberty Times).
- **What reached the accepting side**: In general, the bank's account-keeping side that executes a transfer receives from the transaction system an instruction naming the source account, the payee and the amount. Whether the instruction passed customer authentication arrives only as the transaction system's own verdict. According to Bank SinoPac, the affected customers' national ID numbers all began with "P", because the hackers found valid accounts by random trial and error with a specific technique rather than by obtaining customer data in advance. No sign of a personal-data leak has been found.
- **Not disclosed**: The vendor's name and country. Which security setting was exploited, and how (the president said the bank knows the cause but cannot disclose it because the case is under judicial investigation; BusinessNext). How transfer instructions went through without a login or customer authentication. How the cap was handled (the bank's guidance caps transfers to unregistered accounts at NT$50,000 each, but according to reports most of these transfers were NT$100,000, and how they went through has not been disclosed). How widely the system is used (the bank and the FSC say no other financial institution in Taiwan has adopted it, while CNA reported that "five businesses in Taiwan use the system").

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a transfer out of an account is executed, the instruction is checked as having passed customer authentication, against the bank's own authentication record and the per-transfer cap, apart from the transaction system's verdict.

- **Who approves**: The account holder. Through the authentication at login or transfer (a registered device, SMS, facial recognition and the like), they give an approval for each transfer instruction in a form the transaction system's settings alone cannot produce.
- **Where it is checked**: The step in which the bank executes a transfer. Even when an instruction arrives from the transaction system, one not tied to an authentication record, or over the per-transfer or daily cap, is held. Instructions from many accounts converging on one payee in a short time are also held before execution.
- **What is recorded**: Which account's transfer passed which authentication and arrived from which transaction system. It is kept apart from the transaction system and used to establish the scope of the damage, to claim against the vendor and to report to the authorities.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a transfer instruction against the customer's authentication record and the per-transfer cap before executing it, and keeping a record. Detection means noticing unauthorised transfers from customer complaints, freezing the receiving account and stopping the transaction system. Times are for 3 November and rely on the bank's press conference (CNA).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check a transfer instruction against the customer's authentication record and the cap, apart from the transaction system's verdict, before executing it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>418 customers, 427 transfers, NT$41.76 million<br>All to one account at another bank</span></div>
<div class="rx-zone det"><b>Detection · worked the same day</b>Freeze the receiving account, pull the new app and refund everything</div>
<div class="rx-g g1"><div class="t">09:29</div><b>Customer complaints start arriving</b></div>
<div class="rx-g g2"><div class="t">10:30</div><b>Taipei Fubon Bank is told and freezes the receiving account</b></div>
<div class="rx-g g3"><div class="t">12:50</div><b>Report to the FSC's Banking Bureau</b></div>
<div class="rx-g g4"><div class="t">13:47</div><b>Cause identified and the new app pulled</b></div>
</div>
</figure>

Detection worked the same day: freezing the receiving account kept the money from leaving, and the bank refunded everything. Even so, 427 transfers went through in the roughly four hours between the first complaints and the system being stopped. A case where the result turned on whether the issuer checked the value a terminal read against its own record is [Visa contactless cards](/critical/briefs/135-zombie-cards-visa-contactless-expiry/); one where a vendor's app credential was used to act in customers' environments is [ConnectWise](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/); and one where fund moves went through from a remotely controlled PC is [Hatena](/critical/briefs/162-hatena-police-impersonation-remote-transfer/). Here, transfers without the account holder's login went through via a vendor product's settings.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side where the bank executes transfer instructions arriving from the transaction system.** It does not look for intrusions or hackers; it checks, before execution, that an instruction passed customer authentication and is within the cap.

### Industries and operations to watch

- **Industry · Finance**: Banks, brokers and e-payment providers that build online and mobile banking on outside products, including foreign ones. Switching transaction systems moves customer authentication and cap decisions into the vendor product's settings.
- **Operation · Approval & sign-off**: Accepting and executing transfer instructions (customer authentication and per-transfer and daily caps).
- **Operation · Accounts & permissions**: The vendor product's security settings, and the binding of accounts to devices and authentication.

### Current controls vs Lemma

The route in this case is column 1 (transfers without the account holder's login, via a vendor product's settings). Column 2 covers transfers after a login with a stolen ID and password, and column 3 an account holder who is deceived into making the transfer; nothing disclosed says either happened here.

| Control | Transfers without a login, via a vendor product's settings | Transfers after a login with a stolen ID and password | An account holder deceived into transferring |
| --- | --- | --- | --- |
| Multi-factor authentication and facial recognition at login | Not effective | Effective | Not effective |
| Per-transfer and daily transfer caps | Partial | Partial | Partial |
| Monitoring for unusual activity (bursts of queries or transfers) | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Multi-factor authentication and facial recognition confirm the person logging in, but here transfers are reported to have gone through without a login. Caps limit the size of each transfer, but if the decision sits inside the same transaction system, it can fall away along with that system's settings (how the cap was handled here has not been disclosed). Monitoring, which the bank strengthened after the incident, finds and stops bursts of queries or transfers, but transfers go through until it notices. Lemma checks, before execution, not the transaction system's verdict but whether the instruction is tied to the customer's authentication record and is within the cap.

Note: Lemma's check works only when it is built into the step in which the bank executes transfers and the authentication records and caps are managed somewhere apart from the transaction system vendor's product. If stolen credentials pass customer authentication itself, only the cap check applies. A transfer the account holder authenticates after being deceived goes through. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, nor does it recover funds already sent.

### Checklist

Three things to confirm about switching transaction systems and executing transfers

- When you adopt or switch to a transaction system built on an outside product, do you list the security settings that affect transfers and confirm them yourselves before going live?
- Do you have a way to hold, before execution, transfers from many accounts converging on one payee in a short time?
- When you notice unauthorised transfers, can you contact the receiving bank and extract the affected transactions the same day?

## 5. Facts and timeline

- **Parties**: Bank SinoPac (永豐商業銀行, Taiwan; a wholly owned subsidiary of SinoPac Holdings). The vendor of the new online banking transaction system is described as a well-known foreign company, but its name and country have not been disclosed. The supervisor is the Banking Bureau of the Financial Supervisory Commission (FSC). The receiving account was at Taipei Fubon Bank.
- **What happened**: According to Bank SinoPac, outside hackers exploited the vendor's security settings on the new online banking transaction system, and money left customers' accounts without their knowledge. The bank's notice of 3 November and SinoPac Holdings' material announcement that day (18:10) had put the cause down to a program anomaly in the "new online banking transaction system". At its press conference the bank gave 418 customers, 427 transfers and NT$41.76 million in total (NT$10,000 to NT$100,000 each, most NT$100,000) (CNA). On 3 November the FSC had given 419 customers, 427 transfers and over NT$40 million (Liberty Times, CNA).
- **How accounts were picked**: According to Bank SinoPac, the affected customers' national ID numbers all began with "P", because the hackers found valid accounts by random trial and error with a specific technique rather than by obtaining customer data in advance. No sign of a personal-data leak has been found, and the bank has begun a review of its security and personal data. The Criminal Investigation Bureau received 68 reports by noon on 3 November, many from customers with ties to Yunlin County (CNA).
- **Caps**: The bank's guidance caps transfers to unregistered accounts from ordinary accounts and Type 1 and Type 2 digital accounts at NT$50,000 per transfer, NT$100,000 per day and NT$200,000 per month. According to reports most of these transfers were NT$100,000, and how they went through has not been disclosed (BusinessNext).
- **How widely the system is used**: Bank SinoPac said no other financial institution in Taiwan has adopted the transaction system. According to the Economic Daily News, the FSC took the same view. CNA reported that "five businesses in Taiwan use the system".

### Timeline

- **2026-11-03**: Customer complaints start arriving at about 09:29; the bank starts its internal procedures at 10:00 and at about 10:30 tells Taipei Fubon Bank, which freezes the receiving account. At 12:00 it classes the case as a major incident and at 12:50 reports to the FSC's Banking Bureau (bank's press conference via CNA).
- **2026-11-03**: At 13:47 the bank identifies the cause and pulls the new app, after which no further attacks are seen. It refunds the full amount and fees (bank's press conference via CNA).
- **2026-11-03**: The bank posts a notice, and SinoPac Holdings files a material announcement at 18:10 (cause given as a program anomaly in the new online banking transaction system). The FSC gives 419 customers and 427 transfers (Liberty Times).
- **2026-11-04**: The bank says outside hackers exploited the vendor's security settings. The chairman and president apologise at a press conference and give 418 customers, 427 transfers and NT$41.76 million.
- **2026-11-05**: The FSC is reported to have asked the chairman and president to explain and to be reviewing outsourcing and internal controls (Economic Daily News).
- **2026-11-12**: Deadline for the bank's major-incident investigation report to the FSC (Liberty Times, Economic Daily News).

> The facts rely on Bank SinoPac's notice (3 November) and press release (4 November), SinoPac Holdings' material announcement (3 November) and the bank's FAQ guidance (all primary), and on reporting by CNA, Liberty Times, Economic Daily News and BusinessNext. The customer, transfer and amount figures and the times rely on reporting of the bank's press conference. All FSC statements rely on reporting; no FSC press release could be confirmed. The vendor's name and country, the security setting exploited, how transfers went through without a login or customer authentication, and how the cap was handled have not been disclosed. The explanation of 3 November (a program anomaly) differs from that of 4 November (hackers exploited the vendor's security settings). What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of the bank or the vendor. Written as of 12 November.

### After disclosure

- **Bank SinoPac**: Pulled the new app and directed customers to its previous app and ATMs. It says it has blocked the method used, tightened verification, brought in a third-party security team, shared the attack information with other institutions through F-ISAC, and strengthened monitoring to flag and stop bursts of queries and unusual transactions at once; it says it will claim damages from the vendor.
- **FSC**: Treated the case as a major incident, required an investigation report by 12 November and asked the chairman and president to explain. According to reports, it is reviewing outsourcing and internal controls and having F-ISAC run a correlation analysis, with any penalty awaiting the investigation's results (Economic Daily News).
- **Prosecutors**: The Taipei District Prosecutors Office is investigating the case as an offence of obstructing computer use (CNA).

## 6. Sources

- **Bank SinoPac (Primary, company disclosure)**: 「異常轉帳為供應商安全設定遭駭客利用資安事件 本行必確保客戶權益負全部責任」 (2026-11-04, Chinese) — <https://bank.sinopac.com/sinopacBT/about/news-center/news/content/20261104.html>
- **Bank SinoPac (Primary, company notice)**: 「永豐銀行聲明：帳戶款項已全數返還」 (2026-11-03, Chinese) — <https://bank.sinopac.com/sinopacBT/about/introduction/announcement/content/20261103162136250000000000000741.html>
- **Market Observation Post System, SinoPac Holdings (Primary, material announcement)**: 「永豐金控代子公司永豐銀行說明媒體報導」 (2026-11-03, Chinese) — [mopsov.twse.com.tw/mops/web/t05st01](https://mopsov.twse.com.tw/mops/web/t05st01) (query company code 2890, ROC year 115, month 11)
- **Bank SinoPac (Primary, company guidance)**: 「使用非約定轉帳服務，有金額限制嗎?」 (Chinese) — <https://bank.sinopac.com/searchmb/FAQ/content.aspx?sid=MMA&catID=%E8%A1%8C%E5%8B%95%E9%8A%80%E8%A1%8C&subCatID=%E6%9C%8D%E5%8B%99%E5%8A%9F%E8%83%BD&no=296>
- **CNA (Reporting)**: 「永豐銀新網銀APP釀資安危機 還原遭駭時間軸、向系統商求償」 (2026-11-04, Chinese) — <https://cna.com.tw/news/afe/202611040331.aspx>
- **Focus Taiwan (Reporting)**: "SinoPac still probing unauthorized transfer of NT$40 million: FSC" (2026-11-03) — <https://focustaiwan.tw/society/202611030027>
- **Focus Taiwan (Reporting)**: "No evidence of customer data leak in unauthorized transactions: SinoPac" (2026-11-04) — <https://focustaiwan.tw/society/202611040022>
- **Liberty Times (Reporting)**: 「永豐銀行異常轉帳出包 金管會：419人受影響、總金額約4千多萬」 (2026-11-03, Chinese) — <https://ec.ltn.com.tw/article/breakingnews/5628238>
- **Economic Daily News (Reporting)**: 「永豐銀遭駭案延燒！金管會找董總說明 查內控缺失」 (2026-11-05, Chinese) — <https://money.udn.com/money/story/5613/9860339>
- **BusinessNext (Reporting)**: 「永豐銀證實遭駭4,176萬元！總座稱「沒有損失，但有名譽損失」，沒登入App為何也遭盜轉？」 (2026-11-04, Chinese) — <https://www.bnext.com.tw/article/92920/sinopac-bank-online-banking-cyberattack-abnormal-transfers>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
