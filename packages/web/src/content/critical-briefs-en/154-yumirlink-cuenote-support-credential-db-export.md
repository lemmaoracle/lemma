---
brief_no: 154
title: "ユミルリンク：メール配信の Cuenote FC で、脆弱性からサポート担当者の認証情報を取られ、データベースからメールアドレスを含む情報が出力された(同社第一報)"
title_en: "Yumirlink: In the Cuenote FC email delivery service, a vulnerability exposed support staff credentials and data including email addresses was output from databases (company's first report)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-16
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["069-connectwise-cloud-backup-app-identity-credential-abuse", "144-studio-saas-breach-decryption-keys-read", "153-nec-contractor-osaka-university-shared-storage-leak"]
status: published
version: "1.0"
og_lead_ja: "メール配信の Cuenote FC に不正アクセス、メールアドレスを含む情報 延べ約 900 万件"
og_lead_en: "Cuenote FC email delivery breached: about 9 million records with email addresses"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "メール配信サービスで、\nサポート担当者の\n認証情報が取られた。\n<accent>延べ約 900 万件が出力</accent>"
og_headline_en: "Support staff credentials were taken at an email delivery service.\n<accent>About 9 million records output.</accent>"
key_figures:
  - value: "~9M"
    unit: "records"
    label: "Records containing email addresses that Yumirlink estimates were output (cumulative, including duplicates). The deduplicated number of people has not been disclosed"
    tone: "alert"
  - value: "5"
    unit: "systems"
    label: "Single-customer (dedicated ASP plan) Cuenote FC systems managed by Yumirlink where unauthorized access and data output were confirmed. Which customers they belong to has not been disclosed"
  - value: "10-16 → 10-19"
    label: "From confirming the unauthorized access to the first public report"
glossary:
  - term: "Cuenote FC"
    desc: "Yumirlink's email delivery service, used by companies and local governments to send member notices and newsletters in bulk. The \"dedicated ASP plan\" gives each customer its own system."
  - term: "Support and quality staff"
    desc: "Staff at the provider (Yumirlink) who handle customer inquiries and check quality on customer systems."
  - term: "Credentials"
    desc: "The ID, password and the like used to enter a system. If taken, they can be used with the owner's rights."
insight:
  slug: "provider-staff-login-not-tied-to-request"
  label: "Provider staff logins not tied to a request"
  quote: "A provider staff login, merely held, can open several systems without anyone knowing which customer's request the work is for."
industries: ["supply-chain", "public-sector"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold provider staff logins until they are matched to a customer's request"
  - slug: "audit-trail"
    item: "Record which request led into which customer's system, separately from the provider"
attack_method: "account-takeover"
impact: "About 9 million records with email addresses output (estimate)"
takeaway: "Check a provider staff login against the customer request it is for before letting it in."
self_check: "Do you know whether your email delivery provider's staff can view or export your recipient list?"
countries: ["jp"]
---

## 1. Summary

What was taken was not a customer's staff credentials but the provider's. The attackers also tried to use them to authenticate to other systems (per Yumirlink). Passing authentication and being allowed to do the work are different things. <strong>A provider staff login, merely held, can open several systems without anyone knowing which customer's request the work is for.</strong>

## 2. What got through

- **What got through**: Authentication with the provider's support and quality staff credentials (including attempts on other systems), and data output from databases by a malicious program (per Yumirlink).
- **What reached the receiving side**: In general, authentication with valid credentials arrives as the genuine staff member's own action. Which customer's request that staff member entered for cannot be told from the fact that authentication passed.
- **Not disclosed**: Which program was vulnerable, when the intrusion began, how many staff and what rights they had, whether MFA was used, whether the data output used the staff credentials, whether the attempts on other systems succeeded, which customers the five systems belong to, and the deduplicated number of people.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that when provider staff enter a customer's system, the work is checked, apart from the authentication passing, against which customer's request it is for, before entry, using a record of requests kept on the customer's side.

- **Who approves**: The customer who makes the request. The request for work is issued on the customer's side with a ticket number or the like, and given a time limit, in a form the provider's staff cannot produce.
- **Where it is checked**: The part of the customer's system that accepts authentication and authorization. Authentication not tied to a request is not let in even if the password is right, and what is let in is time-limited.
- **What is recorded**: Which request led into which customer's system, and when, kept apart from the provider's own records in a form the customer can match later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before provider staff enter a system, which customer's request the work is for, and keeping a record. Detection means noticing unauthorized access after it happens. The dates below are when each party confirmed or disclosed a point, not when the access or output took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before entry, match the work to a customer's request</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About 9 million records estimated output from five systems<br>Attempts on other systems too</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>Notice the access and cut the servers off</div>
<div class="rx-g g1"><div class="t">10-16</div><b>Access confirmed, servers cut off</b></div>
<div class="rx-g g2"><div class="t">10-19</div><b>First report</b></div>
<div class="rx-g g3"><div class="t">10-20</div><b>Customers and municipalities disclose impact</b></div>
<div class="rx-g g4"><div class="t">10-21</div><b>Dai Nippon Printing discloses a possible leak</b></div>
</div>
</figure>

Detection worked: Yumirlink cut the servers off and removed the staff information from other systems. A similar case, where a vendor's credentials let operations on a customer's tenant go through, is the [ConnectWise app identity](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/). Brief 069 is about an app changing its permissions; this one is about a human staff login spreading to systems it was not assigned to.

## 4. What Lemma does

**Lemma builds the check in section 03 into the side where provider staff enter a customer's system.** It does not look for intrusions; it checks, before entry, whether the authentication rests on a customer's request.

### Industries and operations to watch

- **Industry · Government & public sector**: Local governments that send notices and business newsletters through outside delivery services. When a contractor holds the contract, it is hard for the government to see where the recipient list sits and on which plan.
- **Industry · Procurement & supply chain**: Companies that entrust member and customer newsletters to a delivery SaaS, sometimes syncing names and internal IDs for delivery.
- **Operation · Accounts & permissions**: Managing provider staff accounts placed in your delivery environment, and source settings for the admin console and API.

### Current controls vs Lemma

The route here touches both column 1 (authentication with provider staff credentials) and column 2 (a malicious program reading the database), but whether the data output used the credentials has not been disclosed. Column 3 is the customer's own entrance (the admin console and API source settings).

| Control | Authentication with staff credentials | Direct reads of the database | The customer's own entrance |
| --- | --- | --- | --- |
| Fixing the vulnerability | Not effective | Partial | Not relevant |
| Customer MFA | Not relevant | Not relevant | Partial |
| Restricting admin console and API sources | Partial | Not relevant | Partial |
| Detecting unauthorized access | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Not relevant |

Fixing the vulnerability closes the entry, but does not change what someone holding credentials is allowed to do. Customer MFA does not touch this route, because what was taken were the provider's staff credentials. Source restrictions narrow the customer's entrance, but whether they stop the provider staff's authentication cannot be told from the disclosures. Detection noticed after the output had happened in the access logs.

Note: Lemma's check works only when it is built into the part that accepts authentication and authorization on the customer's system, and the record of requests is kept apart from the provider. If a malicious program on the server reads the database directly, data can be output without passing this check; it cannot be said that this mechanism would have stopped the roughly 9 million records here. Misuse within an assigned customer's request also passes. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about SaaS that holds your data, such as email delivery

- Have you limited the admin console and API to your own IP addresses, rather than leaving them open to all?
- Does your recipient list carry fields you don't need for delivery, such as names, industry or internal IDs?
- Is there an agreement that the provider will tell you, after an incident, whether you were affected?

## 5. Facts and timeline

- **The service**: Cuenote FC is an email delivery service companies and local governments use to send newsletters and notices in bulk. Five systems managed by Yumirlink on the "dedicated ASP plan", which gives each customer its own system, were affected (per Yumirlink).
- **The route**: Through a program vulnerability, attackers obtained support and quality staff credentials for the service. They installed a malicious program and output data from databases, and used the staff credentials to attempt authentication to other systems (per Yumirlink).
- **What was output**: Information including email addresses, about 9 million records cumulative (estimate). The deduplicated number of people has not been disclosed. Some customer and municipal disclosures list names, company names, industry and internal ID numbers.
- **Customer and municipal disclosures**: Dai Nippon Printing (honto) was told that newsletter subscribers' name, email address and ID number may have leaked. Saitama Prefecture said data on 669 parties in a newsletter run by its contractor may have leaked. NTTPC said no impact was confirmed but could not be ruled out. Others said no leak was confirmed.
- **Yumirlink's response**: It immediately cut the affected servers off the network, built and applied a fix for the vulnerability, and removed the staff information from other systems. It reported to investigators and is investigating with outside experts. Its support site says customers must now register source IP addresses for the admin console and API.

### Timeline

- **2026-10-16**: Early morning, Yumirlink staff confirm unauthorized access on some systems. The servers are immediately cut off the network.
- **2026-10-18**: From around 14:15, San-yo Shimbun's news-alert emails can no longer be delivered (per San-yo Shimbun). In its second notice the next day, the paper linked this to its delivery contractor, Yumirlink.
- **2026-10-19**: Yumirlink posts a notice on its support site and files its first report at 17:05. At 19:05 it adds Cuenote FC and the five dedicated-ASP-plan systems to the version on its own site.
- **2026-10-20**: Saitama Prefecture, NTTPC, municipalities and others disclose the impact on their users. Oe Town in Yamagata adds at 11:00 the same day that no leak was confirmed.
- **2026-10-21**: Dai Nippon Printing discloses a possible leak of honto customer data.

> The facts rest on Yumirlink's first report and on customer and municipal disclosures (all primary). Yumirlink's report says in its body that taking the data out "was confirmed", while its heading speaks of "systems that may have leaked". It says the staff credentials were "used" only for the attempts on other systems; for the data output it says a malicious program was installed. As of October 23, no second report had been issued. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Yumirlink**: Lists fixing the vulnerability, deleting the staff credentials and setting up detection of malicious programs as preventive measures. It says it does not currently accept settings that allow access to the admin console and API from any source. The impact on earnings is under review.
- **Customers and municipalities**: Some paused and resumed delivery, and some cut their link to the delivery system. They warn about spoofed email.

## 6. Sources

- **Yumirlink (Primary, timely disclosure)**: Report on unauthorized access to our systems (first report) (2026-10-19, Japanese) — <https://www.release.tdnet.info/inbs/140120261019553124.pdf>
- **Yumirlink (Primary, company disclosure)**: Report on unauthorized access to our systems (first report, 19:05 update) (2026-10-19, Japanese) — <https://www.cuenote.jp/information/news/unauthorizedaccess.html>
- **Yumirlink (Primary, support site)**: Cuenote ASP service: report on unauthorized access (service status) (2026-10-19, Japanese) — <https://cuenote.ne.jp/2026/10/20260619.html>
- **Dai Nippon Printing (Primary, customer disclosure)**: Possible leak of customer data due to unauthorized access at an outside contractor (2026-10-21, Japanese) — <https://www.2dfacto.co.jp/pdf/honto_20261021_001.pdf>
- **NTTPC (Primary, customer disclosure)**: Possible leak of email addresses and other data following unauthorized access at Yumirlink (2026-10-20, Japanese) — <https://www.nttpc.co.jp/press/info/2026/10/202610201600.html>
- **Saitama Prefecture (Primary, municipal disclosure)**: Possible personal data leak following unauthorized access at Yumirlink (2026-10-20, Japanese) — <https://www.pref.saitama.lg.jp/a0903/news/page/news2026102001.html>
- **Oe Town (Primary, municipal disclosure)**: Unauthorized access at the company running the town's registered email system (2026-10-20, Japanese) — at 11:00 added that no leak was confirmed · <https://www.town.oe.yamagata.jp/news/2001>
- **San-yo Shimbun (Primary, customer disclosure)**: Suspension of email delivery services (second notice) and unauthorized access at a contractor (2026-10-19, Japanese) — <https://c.sanyonews.jp/release/2026/10/20261019230413.html>
- **NHK (Press)**: Email delivery company for businesses and local governments breached, 9 million records may have leaked (2026-10-19, Japanese) — <https://news.web.nhk/newsweb/na/nd-20261019de61855>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
