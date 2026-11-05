---
brief_no: 154
title: "ユミルリンク：メール配信の Cuenote FC で、脆弱性からサポート担当者の認証情報を取られ、データベースからメールアドレスを含む情報が出力された(同社の第一報・第二報)"
title_en: "Yumirlink: In the Cuenote FC email delivery service, a vulnerability exposed support staff credentials and data including email addresses was output from databases (company's first and second reports)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-10-16
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["069-connectwise-cloud-backup-app-identity-credential-abuse", "144-studio-saas-breach-decryption-keys-read", "153-nec-contractor-osaka-university-shared-storage-leak"]
status: published
version: "1.1"
og_lead_ja: "メール配信の Cuenote FC に不正アクセス、メールアドレスを含む情報 延べ 5,162 万件超（第二報で 49 システムに拡大）"
og_lead_en: "Cuenote FC email delivery breached: over 51.6 million records with email addresses (49 systems in the second report)"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "メール配信サービスで、\nサポート担当者の\n認証情報が取られた。\n<accent>延べ 5,162 万件超</accent>"
og_headline_en: "Support staff credentials\nwere taken at an email\ndelivery service.\n<accent>Over 51.6 million records.</accent>"
key_figures:
  - value: "51.6M+"
    unit: "records"
    label: "Records containing email addresses confirmed output (51,628,280 cumulative; second report). Counts for 16 systems are still under investigation and may rise. The deduplicated number of people has not been disclosed"
    tone: "alert"
  - value: "49"
    unit: "systems"
    label: "Cuenote FC systems where output was confirmed, all single-customer systems (second report). Access was attempted on 81 systems; the 3 shared by several customers showed no trace of a leak"
  - value: "10-16 → 10-26"
    label: "From confirming the unauthorized access, through the first report (19 October, 5 systems), to the second report (49 systems)"
glossary:
  - term: "Cuenote FC"
    desc: "Yumirlink's email delivery service, used by companies and local governments to send member notices and newsletters in bulk. The \"dedicated ASP plan\" gives each customer its own system."
  - term: "Support and quality staff"
    desc: "Staff at the provider (Yumirlink) who handle customer inquiries and check quality on customer systems."
  - term: "Credentials"
    desc: "The ID, password and the like used to enter a system. If taken, they can be used with the owner's rights."
insight:
  slug: "provider-staff-login-not-tied-to-request"
  stop: true
  label: "Provider staff logins not tied to a request"
  quote: "Before provider staff enter a customer's system, check which customer's request the work is for, against the request record kept on the customer's side rather than the staff member's credentials."
industries: ["supply-chain", "public-sector"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold provider staff logins until they are matched to a customer's request"
  - slug: "audit-trail"
    item: "Record which request led into which customer's system, separately from the provider"
attack_method: "account-takeover"
impact: "51,628,280 cumulative records with email addresses output from 49 systems (16 systems still under investigation; second report). In the customer management system, 190 contract records were viewable"
takeaway: "Check a provider staff login against the customer request it is for before letting it in."
self_check: "Do you know whether your email delivery provider's staff can view or export your recipient list?"
countries: ["jp"]
---

> **Revision (v1.1 / 2026-11-05)**: Yumirlink's second report (26 October) raised the systems with confirmed output from 5 to 49 and the records from about 9 million to 51,628,280, and disclosed unauthorized logins using session data, reads of other systems' data and a detailed timeline, so the cover, 01, 02 and 05 were rewritten. The band was rewritten as a pre-execution gate and 01 split into three paragraphs.

## 1. Summary

In the Cuenote FC email delivery service, a library vulnerability exposed support and quality staff credentials, and a malicious program output data from databases (Yumirlink's first and second reports). The second report raised the systems with confirmed output to 49 and the records containing email addresses to 51,628,280 cumulative. Counts for 16 systems are still under investigation and may rise.

What was taken was not a customer's staff credentials but the provider's. According to the second report, the attackers used them to attempt authentication to other systems, read other systems' data through the malicious program, and logged in without authorization using session data taken at login. Of the 81 systems where access was attempted, the 3 shared by several customers showed no trace of a leak, and output was confirmed on 49 of the 78 single-customer systems.

<strong>A provider staff login, merely held, can open several systems without anyone knowing which customer's request the work is for.</strong>

## 2. What got through

- **What got through**: Authentication with the provider's support and quality staff credentials (including attempts on other systems), and data output from databases by a malicious program (first report). The second report added reads of other systems' data through the malicious program and unauthorized logins using session data taken at login (on 45 newly confirmed systems: 44 Cuenote FC and 1 Cuenote BASE).
- **What reached the receiving side**: In general, authentication with valid credentials arrives as the genuine staff member's own action. Which customer's request that staff member entered for cannot be told from the fact that authentication passed. A login with stolen session data arrives as the continuation of a genuine login.
- **Not disclosed**: Which library was vulnerable, when the intrusion began (the published timeline starts with the confirmation on 16 October), how many staff and what rights they had, whether MFA was used, which customers the 49 systems belong to, what the address-book attributes contained (they differ by customer, and the company says it will report once the investigation is complete), and the deduplicated number of people.

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
<div class="rx-zone gapz"><b>What was confirmed</b><span>Over 51.6 million records output from 49 systems<br>Unauthorized logins with session data too</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>Notice the access and cut the servers off</div>
<div class="rx-g g1"><div class="t">10-16</div><b>Access confirmed, servers cut off</b></div>
<div class="rx-g g2"><div class="t">10-18</div><b>All systems in the data centre stopped; sources restricted</b></div>
<div class="rx-g g3"><div class="t">10-19</div><b>First report (5 systems)</b></div>
<div class="rx-g g4"><div class="t">10-26</div><b>Second report (49 systems)</b></div>
</div>
</figure>

Detection worked: Yumirlink cut the servers off and removed the staff information from other systems. Even so, by the second report the systems with confirmed output had grown from the first report's 5 to 49. A similar case, where a vendor's credentials let operations on a customer's tenant go through, is the [ConnectWise app identity](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/). Brief 069 is about an app changing its permissions; this one is about a human staff login spreading to systems it was not assigned to.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side where provider staff enter a customer's system.** It does not look for intrusions; it checks, before entry, whether the authentication rests on a customer's request.

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

Fixing the vulnerability closes the entry, but does not change what someone holding credentials is allowed to do. Customer MFA does not touch this route, because what was taken were the provider's staff credentials; according to the second report, logins with stolen session data also went through, and those inherit the state after MFA. Source restrictions narrow the customer's entrance (on 18 October the company added source restrictions to consoles and APIs that had none), but whether they stop the provider staff's authentication cannot be told from the disclosures. Detection noticed after the output had happened in the access logs.

Note: Lemma's check works only when it is built into the part that accepts authentication and authorization on the customer's system, and the record of requests is kept apart from the provider. If a malicious program on the server reads the database directly, data can be output without passing this check; it cannot be said that this mechanism would have stopped the more than 51.6 million records here. Misuse within an assigned customer's request also passes. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about SaaS that holds your data, such as email delivery

- Have you limited the admin console and API to your own IP addresses, rather than leaving them open to all?
- Does your recipient list carry fields you don't need for delivery, such as names, industry or internal IDs?
- Is there an agreement that the provider will tell you, after an incident, whether you were affected?

## 5. Facts and timeline

- **The service**: Cuenote FC is an email delivery service companies and local governments use to send newsletters and notices in bulk. The first report named five systems managed by Yumirlink on the "dedicated ASP plan", which gives each customer its own system. The second report says access was attempted on 81 systems; output was confirmed on 49 single-customer systems, and the 3 systems shared by several customers showed no trace of a leak. In the customer management system Cuenote BASE, a vulnerability left 190 contract records (company name, name, phone, email address) viewable. The company says its other services (SR-S, SMS, Auth, Survey, Push and safety confirmation) were not affected.
- **The route**: Through a library vulnerability, attackers obtained support and quality staff credentials for the service. They installed a malicious program and output data from databases, and used the staff credentials to attempt authentication to other systems (first report). The second report newly confirmed, on 45 systems, reads of other systems' data through the malicious program and unauthorized logins using session data taken at login.
- **What was output**: Information including email addresses, 51,628,280 records cumulative (second report; 16 systems still under investigation). The deduplicated number of people has not been disclosed. Cuenote FC stores recipient email addresses with attributes used for merging and filtering such as names, prefectures and dates of birth (the address book, which differs by customer), delivery logs, sign-up page and My Page records, and the customer's own staff details (name, email address, address, phone). Some customer and municipal disclosures list names, company names, industry and internal ID numbers.
- **Customer and municipal disclosures**: Dai Nippon Printing (honto) was told that newsletter subscribers' name, email address and ID number may have leaked. Saitama Prefecture said data on 669 parties in a newsletter run by its contractor may have leaked. NTTPC said no impact was confirmed but could not be ruled out. Others said no leak was confirmed.
- **Yumirlink's response**: It immediately cut the affected servers off the network, built and applied a fix for the vulnerability, and removed the staff information from other systems. It set up continuous monitoring for malicious programs and restricted source IP addresses for consoles and APIs. It reported to the Metropolitan Police, the Personal Information Protection Commission and JIPDEC, and is investigating with outside experts. It contacted the 42 newly affected customers by 12:30 on 26 October (second report).

### Timeline

- **2026-10-16**: At 06:49 Yumirlink staff notice an anomaly in their own account on "system 01". At 10:10 the company identifies an attack through a library vulnerability and blocks access from suspicious IP addresses. At 20:10 it confirms records of other users' data being viewed in Cuenote BASE and stops the system; at 20:46 it applies the fix (second report).
- **2026-10-17**: At 04:43 it confirms a malicious program on "system 02" and stops it. At 12:58 it identifies the attack method, and begins checking all systems and asking an outside security firm for help (second report).
- **2026-10-18**: It confirms malicious programs on "systems 03 to 05" and an unauthorized login to "system 04" with a support and quality account, stops them, and begins deleting those accounts. At 14:15 it stops all systems in the same data centre as a precaution, temporarily blocks overseas access, adds source restrictions to consoles and APIs that had none, and at 20:20 establishes continuous monitoring for malicious programs (second report). From around 14:15, San-yo Shimbun's news-alert emails can no longer be delivered (per San-yo Shimbun).
- **2026-10-19**: It reports to the Metropolitan Police cyber desk and the Personal Information Protection Commission. It posts a notice on its support site and files its first report at 17:05 (5 systems; about 9 million records estimated). At 19:05 it adds Cuenote FC and the five dedicated-ASP-plan systems to the version on its own site.
- **2026-10-20**: It restarts the systems stopped as a precaution and reports to JIPDEC. At 21:29 it confirms unauthorized access to "system 08" via "system 03". Saitama Prefecture, NTTPC, municipalities and others disclose the impact on their users. Oe Town in Yamagata adds at 11:00 the same day that no leak was confirmed.
- **2026-10-21**: Dai Nippon Printing discloses a possible leak of honto customer data. Yumirlink adds precautionary source restrictions to Cuenote SR-S servers that had none.
- **2026-10-22**: It begins a retrospective review of login and operation records on all systems.
- **2026-10-25**: At 21:45 it confirms unauthorized access and data output records on 42 more systems and begins assessing the impact.
- **2026-10-26**: It contacts the 42 newly affected customers by 12:30 and files its second report at 17:00 (49 systems; 51,628,280 records; 190 Cuenote BASE records).

> The facts rest on Yumirlink's first and second reports and on customer and municipal disclosures (all primary). Yumirlink's first report says in its body that taking the data out "was confirmed", while its heading speaks of "systems that may have leaked". It says the staff credentials were "used" only for the attempts on other systems; for the data output it says a malicious program was installed. The second report describes, for the 45 newly confirmed systems, reads through the malicious program and unauthorized logins with session data. When the intrusion began has not been disclosed. What has not been disclosed does not mean there were no controls. Written as of 5 November.

### After disclosure

- **Yumirlink**: Lists fixing the vulnerability, deleting the staff credentials, setting up detection of malicious programs and restricting source IP addresses for login screens and APIs as preventive measures. It says it does not currently accept settings that allow access to the admin console and API from any source. It plans to report to IPA once the full picture and cause are established, and says it has confirmed neither publication of the leaked data nor misuse. It warns of spam impersonating third parties sent from its own domain. The impact on earnings is under review.
- **Customers and municipalities**: Some paused and resumed delivery, and some cut their link to the delivery system. They warn about spoofed email.

## 6. Sources

- **Yumirlink (Primary, timely disclosure)**: Report on unauthorized access to our systems (second report) (2026-10-26, Japanese) — <https://www.release.tdnet.info/inbs/140120261026556277.pdf>
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
