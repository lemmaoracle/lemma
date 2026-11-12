---
brief_no: 204
title: "NTT データ STdirectServices：委託先 Securitize Japan の SaaS で、認証機能の脆弱性から管理者権限が不正に取得され、デジタル特典付き社債の購入者の情報が持ち出された(NTT データの第 2 報)"
title_en: "NTT DATA STdirectServices: At contractor Securitize Japan's SaaS, administrator rights were illicitly obtained through a flaw in the authentication function, and data on buyers of bonds with digital perks was taken (NTT DATA's second notice)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-29
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["154-yumirlink-cuenote-support-credential-db-export", "193-amadeus-system-account-airline-booking-data", "167-zeabur-second-breach-admin-token"]
status: draft
version: "1.0"
og_lead_ja: "NTT データの STdirectServices で、委託先 Securitize Japan の SaaS の管理者権限が不正に取得され、社債の購入者 111 名・2,678 名の情報が持ち出された"
og_lead_en: "At NTT DATA's STdirectServices, administrator rights at contractor Securitize Japan's SaaS were illicitly obtained, and data on 111 and 2,678 bond buyers was taken"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 委託先の SaaS"
og_kicker_en: "CYBERATTACK · CONTRACTOR SAAS"
og_headline_ja: "委託先の SaaS で、\n管理者権限が取られ、\n購入者の情報が出た。\n<accent>111 名・2,678 名</accent>"
og_headline_en: "Admin rights were seized\nat the contractor's SaaS,\nand bond buyers' data left.\n<accent>111 and 2,678 people.</accent>"
key_figures:
  - value: "111"
    unit: "people"
    label: "Bond buyers for two issuers whose names, addresses, phone numbers, email addresses, sex and dates of birth were illicitly obtained (data from a service NTT DATA provided individually before STdirectServices; NTT DATA's second notice)"
    tone: "alert"
  - value: "2,678"
    unit: "people"
    label: "Bond buyers for one issuer whose names in kana, bond quantities purchased and email addresses were illicitly obtained (NTT DATA's second notice)"
  - value: "10-29 → 11-02"
    label: "From the unauthorised access at the contractor's SaaS to NTT DATA's disclosure that a leak was confirmed (the number of issuer and financial institution staff affected is still under investigation)"
glossary:
  - term: "Bonds with digital perks"
    desc: "Retail bonds whose buyers can apply online for perks such as the issuer's products or experiences. According to Securitize, the Kintetsu Group Holdings bond is an ordinary book-entry bond, not a security token bond."
  - term: "STdirectServices"
    desc: "A digital securities platform provided by NTT DATA. According to NTT DATA, it supports the granting of perks to bond buyers and uses Securitize Japan's SaaS."
insight:
  slug: "admin-export-not-tied-to-issuer-request"
  stop: true
  label: "An admin export shows no issuer request"
  quote: "Before buyers' personal data is exported, check which issuer's perk procedure the export is for, against the issuer's record of requests rather than administrator rights."
industries: ["finance", "supply-chain"]
operations: ["data-access", "account-admin"]
controls:
  - slug: "limit-and-revoke"
    item: "Grant administrator rights on the contractor's SaaS with a scope and an expiry, and revoke those not in use"
  - slug: "minimize-data"
    item: "Do not leave buyer data for bonds whose perk procedures have ended on the contractor's SaaS"
  - slug: "hold-unverified"
    item: "Hold, before execution, any export of buyer data that cannot be tied to the issuer's record of requests"
  - slug: "audit-trail"
    item: "Record, apart from the contractor's SaaS, which rights read which issuer's buyer data under which request"
attack_method: "supply-chain"
impact: "Names, addresses, phone numbers, dates of birth and more of 111 bond buyers for two issuers, and names in kana, quantities purchased and email addresses of 2,678 buyers for one issuer, were illicitly obtained (NTT DATA, as of 2 November). Names and email addresses of issuer and financial institution staff were also taken; their number is under investigation"
takeaway: "At a contractor's SaaS, administrator rights were illicitly obtained through a flaw in the authentication function, and bond buyers' data was taken. Holding administrator rights does not show that an export rests on an issuer's request. Check exports against the issuer's record of requests before letting them through."
self_check: "Do you know how much of your customers' personal data remains in your contractor's service, and until when?"
countries: ["jp"]
search_title: "NTTデータ STdirect 漏えい：委託先 SaaS の経緯"
search_description: "NTT データの STdirectServices の委託先 Securitize Japan の SaaS で管理者権限が不正に取得され、社債の購入者 111 名・2,678 名の情報が持ち出された（第 2 報）。経緯と対策を整理。"
---

## 1. Summary

On 29 October 2026, a third party gained unauthorised access to the SaaS of contractor Securitize Japan, which is used by STdirectServices, the digital securities platform provided by NTT DATA, and by other services. According to NTT DATA's second notice (2 November), administrator rights were illicitly obtained by exploiting a vulnerability in the system's authentication function, and information in the system was taken out. STdirectServices supports the granting of perks to bond buyers.

The data illicitly obtained comprises the names, addresses, phone numbers, email addresses, sex and dates of birth of 111 bond buyers for two issuers, and the names in kana, bond quantities purchased and email addresses of 2,678 buyers for one issuer. The 111 records come from a service NTT DATA provided individually before STdirectServices began. Names and email addresses of system users at issuers and financial institutions were also taken, and their number is under investigation. No misuse has been confirmed. Securitize Japan stopped the service, cut off the route and invalidated the illicitly obtained administrator rights.

<strong>A read with administrator rights goes through without a request from the party that entrusted the data, however those rights were obtained.</strong>

## 2. What got through

- **What got through**: Taking information out of Securitize Japan's SaaS using administrator rights. According to NTT DATA, the administrator rights were illicitly obtained by exploiting a vulnerability in the system's authentication function. The data taken includes buyer data handled by the service that preceded STdirectServices.
- **What reached the accepting side**: In general, a SaaS's administrative functions receive only a session holding administrator rights and the read or export operation. They do not receive which issuer's perk procedure the operation is for. With administrator rights, buyer data for several issuers is reachable at once.
- **Not disclosed**: The type of vulnerability in the authentication function, and whether it was already known. How far the administrator rights reached. Whether the data was taken in a single operation on 29 October. When and how Securitize Japan noticed. Why data from the earlier service remained in the same SaaS. The number of issuer and financial institution staff affected. Securitize Japan's own disclosure has not been confirmed.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before buyers' personal data is read or exported, the operation is checked as resting on a specific issuer's perk procedure, against the issuer's record of requests kept apart from administrator rights.

- **Who approves**: The issuer that entrusted the buyer data, and NTT DATA as the service provider. For each perk procedure they set which bond, which period and which fields are handled, and issue requests in a form the contractor's administrator rights alone cannot produce.
- **Where it is checked**: The step in the contractor's SaaS that executes reads and exports of buyer data. Even with administrator rights, an operation not tied to the record of requests, or one beyond the scope (issuer, count, fields), is held. Data for bonds whose procedures have ended cannot be read without a request.
- **What is recorded**: Which rights read which issuer's buyer data, under which request. It is kept apart from the contractor's SaaS, so issuers and the brokers that sold the bonds can check the impact on their own customers themselves.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before buyer data is exported, which issuer's perk procedure the operation is for, and keeping a record. Detection means noticing the unauthorised access, stopping the service and invalidating the administrator rights. Dates rely on the disclosures by NTT DATA, Kagome and JR West.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check an export against the issuer's perk procedure request before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Administrator rights illicitly obtained and data taken<br>111 and 2,678 buyers, plus staff (under investigation)</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Service stopped, route cut off, administrator rights invalidated</div>
<div class="rx-g g1"><div class="t">10-29</div><b>Unauthorised access at the contractor's SaaS</b></div>
<div class="rx-g g2"><div class="t">10-30</div><b>NTT DATA reports to the issuers</b></div>
<div class="rx-g g3"><div class="t">10-31</div><b>NTT DATA, issuers and a broker disclose</b></div>
<div class="rx-g g4"><div class="t">11-02</div><b>NTT DATA discloses that a leak is confirmed</b></div>
</div>
</figure>

Detection worked, and the issuers were told the next day. Even so, buyer data for several issuers was taken out together with administrator rights. Cases where rights on a provider's side read its customers' data include [Yumirlink](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/) (the provider's staff credentials) and [Amadeus](/critical/briefs/193-amadeus-system-account-airline-booking-data/) (the provider's system account), and a case where administrator credentials read a platform's database is [Zeabur](/critical/briefs/167-zeabur-second-breach-admin-token/). Here, even data from the earlier service could be read with the same SaaS's administrator rights.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side of the contractor's SaaS that executes reads and exports of buyer data.** It does not look for unauthorised access; it checks, before exporting, that the operation rests on an issuer's request.

### Industries and operations to watch

- **Industry · Finance**: Issuers of bonds with digital perks or digital securities, and the brokers and banks that sell them. They entrust buyers' names, addresses, dates of birth and quantities purchased to an outside platform for issuance and perk procedures.
- **Industry · Procurement & supply chain**: Companies that entrust customer data to a contractor that in turn uses another company's SaaS. One set of administrator rights on that SaaS reaches the data of several client companies.
- **Operation · Lookup & data access**: Reads and exports of buyer data from the contractor's SaaS.
- **Operation · Accounts & permissions**: Granting, scoping and revoking administrator rights on the contractor's SaaS, and handling data whose procedures have ended.

### Current controls vs Lemma

The route in this case is column 1 (exports with administrator rights illicitly obtained through a flaw in the authentication function). Column 2 covers a takeover of an issuer staff member's account, and column 3 an intrusion into a server and direct reading of the database; nothing disclosed says either happened here.

| Control | Export with illicitly obtained administrator rights | Takeover of an issuer staff account | Direct reading of the database |
| --- | --- | --- | --- |
| Vulnerability testing and fixing | Partial | Not effective | Partial |
| Multi-factor authentication on staff logins | Partial | Effective | Not effective |
| Scope and expiry on administrator rights | Partial | Not effective | Not effective |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Vulnerability testing and fixing closes known holes, but does not stop operations once the authentication function has been bypassed. Multi-factor authentication protects a person's login, but can be passed when the authentication function itself is exploited. A scope and an expiry on administrator rights narrow what they reach, but exports within that scope go through. Lemma checks, before execution, not whether the rights are valid but whether the export rests on an issuer's request.

Note: Lemma's check works only when it is built into the execution of reads and exports in the contractor's SaaS and the issuer's record of requests is managed apart from the contractor's administrator rights. If a server is breached and the database read directly, the data can be read without passing this check. If an issuer staff member's account is taken over and the request record is forged too, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not recover data already taken.

### Checklist

Three things to confirm about customer data entrusted to a contractor's service

- Do you know who, and which mechanisms, can export your customers' data from the contractor's service with administrator rights?
- Do you record exports at the contractor tied to your own requests, so you can check them yourself later?
- When the contractor reports a leak, can you identify the affected customers and fields from your own records the same day?

## 5. Facts and timeline

- **Parties**: NTT DATA Corporation (provides STdirectServices) and its contractor Securitize Japan (provides the SaaS). According to Securitize, the two companies provide STdirectServices jointly. Issuers Kagome and West Japan Railway (JR West) have disclosed, as has Rakuten Securities, which sold the bonds.
- **What happened**: According to NTT DATA, on 29 October a third party gained unauthorised access to Securitize Japan's SaaS; administrator rights were illicitly obtained by exploiting a vulnerability in the system's authentication function, and information in the system was taken out. Rakuten Securities gives the date of occurrence as 30 October. Kagome, JR West and Rakuten Securities say the cause and intrusion route are under investigation at NTT DATA's contractor.
- **Data**: According to NTT DATA, as of 2 November: (1) names, addresses, phone numbers, email addresses, sex and dates of birth of 111 bond buyers for two issuers; (2) names in kana, bond quantities purchased and email addresses of 2,678 buyers for one issuer; (3) names and email addresses of system users at issuers and financial institutions (number under investigation). (1) is data from a service NTT DATA provided individually before STdirectServices began. NTT DATA does not name the issuers. Kagome says 109 of the 5,472 buyers of its "Kagome 日本の野菜で健康応援債" issued in 2023 are affected, and JR West says two records of buyers of its 80th unsecured bond (issued 19 June 2024); in both cases the fields are the same as (1). Rakuten Securities says a cumulative 362 records are affected, covering buyers of the Kagome and JR West bonds and of Kintetsu Group Holdings' 135th unsecured bond (issued 24 July 2026; buyers of ¥1 million or more). Press reports say the 2,678 are buyers of the Kintetsu Group Holdings bond.
- **Impact**: NTT DATA says no misuse of the leaked data has been confirmed. Rakuten Securities says it was told that login IDs, passwords and information needed for trading are not included, and that no unauthorised access or trading attributable to the incident has been confirmed. The first notice said that, as no bond is currently eligible for perks, the suspension does not affect perk-granting work.
- **How it was found**: Kagome and JR West were told by NTT DATA on 30 October that information on the platform may have been taken out. When and how Securitize Japan noticed has not been disclosed.

### Timeline

- **2023-02-21**: Kagome issues its bond with digital perks, "Kagome 日本の野菜で健康応援債".
- **2024-06-19**: JR West issues its 80th unsecured bond.
- **2026-07-24**: Kintetsu Group Holdings issues its 135th unsecured bond. Securitize announced the day before that it provides STdirectServices with NTT DATA.
- **2026-10-29**: Unauthorised access occurs at Securitize Japan's SaaS (NTT DATA). Rakuten Securities gives the date as 30 October.
- **2026-10-30**: Kagome and JR West are told by NTT DATA.
- **2026-10-31**: NTT DATA discloses the suspension of STdirectServices (first notice; the contractor is not named). Kagome, JR West and Rakuten Securities disclose.
- **2026-11-02**: In its second notice, NTT DATA names the contractor as Securitize Japan and discloses that a leak is confirmed.

> The facts rely on NTT DATA's first and second notices, the disclosures of Kagome, JR West and Rakuten Securities, and Securitize's press release (all primary). Securitize Japan's own disclosure of this incident has not been confirmed. NTT DATA dates the unauthorised access to 29 October, Rakuten Securities to 30 October. NTT DATA does not name the issuers; the sum of the Kagome (109) and JR West (2) figures matches the 111 in (1), but NTT DATA's disclosure does not state that correspondence. That the 2,678 are Kintetsu Group Holdings bond buyers rests on press reports. Press reports say other clients of Securitize Japan, such as Sony Bank and Marui Group, have also disclosed an impact; this Brief does not cover them in detail. The type of vulnerability, the scope of the administrator rights and how Securitize Japan noticed have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the companies' responses. Written as of 12 November.

### After disclosure

- **Securitize Japan**: Stopped the service, cut off the route of unauthorised access and invalidated the illicitly obtained administrator rights (NTT DATA's second notice).
- **NTT DATA**: Stopped STdirectServices and reported to the issuers and financial institutions concerned. It continues the investigation with Securitize Japan, will work on preventing recurrence, including checking the contractor's security measures and reviewing its own contractor management, and will decide on resumption after confirming the necessary safety measures.
- **Kagome, JR West and Rakuten Securities**: Rakuten Securities, which sold the bonds, is contacting affected buyers individually. They warn of suspicious emails, SMS and calls impersonating them. Kagome says it reported to the Personal Information Protection Commission and other bodies.

## 6. Sources

- **NTT DATA (Primary, company disclosure)**: 「STdirectServicesのサービス停止についてのお知らせ（第2報）」 (2026-11-02) — <https://www.nttdata.com/global/ja/news/release/2026/110200/>
- **NTT DATA (Primary, company disclosure)**: 「STdirectServicesのサービス停止についてのお知らせ」 (2026-10-31) — <https://www.nttdata.com/global/ja/news/release/2026/103101/>
- **Kagome (Primary, issuer disclosure)**: 「当社デジタル特典付き社債を購入されたお客様の個人情報漏えいの可能性と当社の対応について」 (2026-10-31) — <https://www.kagome.co.jp/s3-contents/notification/20261031054555.pdf>
- **West Japan Railway (Primary, issuer disclosure)**: 「外部サービスへの不正アクセスによる投資家様情報漏えいの可能性について」 (2026-10-31) — <https://www.westjr.co.jp/press/article/2026/10/31/page_31177.html>
- **Rakuten Securities (Primary, broker disclosure)**: 「外部サービス提供元への不正アクセスによるお客様情報漏えいの可能性について」 (2026-10-31) — <https://www.rakuten-sec.co.jp/web/info/info20261031-01.html>
- **Securitize Japan (Primary, company press release)**: 「Securitize、近鉄グループホールディングス株式会社によるデジタル特典付個人向け社債「Les Saveurs 志摩 運行記念債」の発行に際し、NTTデータとプラットフォームを提供」 (2026-07-23) — <https://securitize.co.jp/news-press-releases/press-releases/kintetsu_ntt/>
- **INTERNET Watch (Press)**: 「デジタル証券などを提供するSecuritize Japanに不正アクセス、NTTデータなど委託元各社が情報を公開」 (2026-11-06) — <https://internet.watch.impress.co.jp/docs/news/2154378.html>
- **TECH+ (Mynavi, Press)**: 「NTTデータ委託先への不正アクセス、楽天証券や近鉄など影響を受けた企業一覧」 (2026-11-02) — <https://news.mynavi.jp/article/20261102-5242219/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
