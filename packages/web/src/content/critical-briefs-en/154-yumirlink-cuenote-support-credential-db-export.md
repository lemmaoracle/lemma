---
brief_no: 154
title: "ユミルリンク：メール配信の Cuenote FC で、脆弱性からサポート担当者の認証情報を取られ、データベースからメールアドレスを含む情報が出力された(同社第一報) — 運営会社の担当者の認証を、どの利用企業の依頼の作業かと照合する層が無い"
title_en: "Yumirlink: In the Cuenote FC email delivery service, a vulnerability exposed support staff credentials and data including email addresses was output from databases (company's first report) — Nothing checks a provider staff login against which customer's request it is for"
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
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "メール配信サービスで、\nサポート担当者の\n認証情報が取られた。\n<accent>延べ約 900 万件が出力</accent>"
og_headline_en: "Support staff credentials were taken at an email delivery service.\n<accent>About 9 million records output.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
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
  quote: "The provider's staff credentials, not tied to any customer's request for work, were also used in attempts to authenticate to other systems."
industries: ["supply-chain", "public-sector"]
operations: ["account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Hold provider staff logins until they are matched to a customer's request"
  - slug: "audit-trail"
    item: "Record which request led into which customer's system, separately from the provider"
attack_method: "account-takeover"
impact: "About 9 million records with email addresses output (estimate)"
takeaway: "The disclosures show no step that checks a provider staff login against which customer's request it is for."
self_check: "Do you know whether your email delivery provider's staff can view or export your recipient list?"
---

## 1. TL;DR

On October 19, 2026, Yumirlink disclosed unauthorized access to part of its Cuenote FC email delivery service, with personal data taken out. Through a program vulnerability, attackers obtained support and quality staff credentials, installed a malicious program and output data from databases — about 9 million records with email addresses across five single-customer systems, by the company's estimate.

The credentials belonged to the provider's staff, not to a customer. The attackers also tried them on other systems, and Yumirlink says it removed the staff information from other systems.

Yumirlink noticed early on October 16, and its access logs showed the data had already been output. What failed was the layer that checks a provider staff login against which customer's request it is for.

## 2. What happened

- **The service**: Cuenote FC is an email delivery service companies and local governments use to send newsletters and notices in bulk. Five systems managed by Yumirlink on the "dedicated ASP plan", which gives each customer its own system, were affected (per Yumirlink).
- **The route**: Through a program vulnerability, attackers obtained support and quality staff credentials for the service. They installed a malicious program and output data from databases, and used the staff credentials to attempt authentication to other systems (per Yumirlink).
- **Not disclosed**: Which program was vulnerable, when the intrusion began, how many staff and what rights they had, whether MFA was used, whether the data output used the staff credentials, whether the attempts on other systems succeeded, and which customers the five systems belong to.
- **What was output**: Information including email addresses, about 9 million records cumulative (estimate). The deduplicated number of people has not been disclosed. Some customer and municipal disclosures list names, company names, industry and internal ID numbers.
- **Customer and municipal disclosures**: Dai Nippon Printing (honto) was told that newsletter subscribers' name, email address and ID number may have leaked. Saitama Prefecture said data on 669 parties in a newsletter run by its contractor may have leaked. NTTPC said no impact was confirmed but could not be ruled out. Others said no leak was confirmed.
- **Yumirlink's response**: It immediately cut the affected servers off the network, built and applied a fix for the vulnerability, and removed the staff information from other systems. It reported to investigators and is investigating with outside experts. Its support site says customers must now register source IP addresses for the admin console and API.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ④. Had each provider staff login been matched to which customer's request it was for, authentication to systems with no request would not go through. Whether the attempts on other systems succeeded, and how ③'s output was done, have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Exploits a program vulnerability</b><p>Which program has not been disclosed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">2</div><b>Obtains support and quality staff credentials</b><p>The provider's staff.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">3</div><b>Installs a malicious program and outputs data from databases</b><p>Five systems, about 9 million records (estimate).</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">4</div><b>Tries other systems with the staff credentials</b><p>Whether it succeeded has not been disclosed.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-16**: Early morning, Yumirlink staff confirm unauthorized access on some systems. The servers are immediately cut off the network.
- **2026-10-18**: From around 14:15, San-yo Shimbun's news-alert emails can no longer be delivered (per San-yo Shimbun). In its second notice the next day, the paper linked this to its delivery contractor, Yumirlink.
- **2026-10-19**: Yumirlink posts a notice on its support site and files its first report at 17:05. At 19:05 it adds Cuenote FC and the five dedicated-ASP-plan systems to the version on its own site.
- **2026-10-20**: Saitama Prefecture, NTTPC, municipalities and others disclose the impact on their users. Oe Town in Yamagata adds at 11:00 the same day that no leak was confirmed.
- **2026-10-21**: Dai Nippon Printing discloses a possible leak of honto customer data.

> The facts rest on Yumirlink's first report and on customer and municipal disclosures (all primary). Yumirlink's report says in its body that taking the data out "was confirmed", while its heading speaks of "systems that may have leaked". It says the staff credentials were "used" only for the attempts on other systems; for the data output it says a malicious program was installed. As of October 23, no second report had been issued.

### After disclosure

- **Yumirlink**: Lists fixing the vulnerability, deleting the staff credentials and setting up detection of malicious programs as preventive measures. It says it does not currently accept settings that allow access to the admin console and API from any source. The impact on earnings is under review.
- **Customers and municipalities**: Some paused and resumed delivery, and some cut their link to the delivery system. They warn about spoofed email.

## 4. Why it wasn't stopped

This case was not only about a vulnerability. The provider's staff credentials, once taken, were also used in attempts to authenticate to other systems, without being tied to any customer's request for work.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before provider staff enter a system, that "this customer has requested this work", and recording that. Detection means noticing after unauthorized access has happened.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before entering, match the login to a customer's request</div>
<div class="rx-zone gapz"><b>The gap</b><span>Logins to other systems<br>were attempted</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Spots the access and cuts the servers off</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Credentials taken</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Tried on other systems</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Noticed 10-16</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Staff info removed</b></div>
</div>
</figure>

Detection worked: Yumirlink cut the servers off and removed the staff information from other systems. But "holding provider staff credentials" and "this customer has requested this work" are separate facts, and the disclosures show no layer matching the first to the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [ConnectWise's app identities](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/) (a vendor's credential let operations in customer tenants go through); there an app changed permissions, here a person's staff login reached toward systems outside its assignment.

## 5. How to counter this

**Each time provider staff enter a customer's system, match it to which customer's request the work is for.** Then stolen credentials alone cannot open systems with no request. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Government & public sector**: Local governments that send notices and business newsletters through outside delivery services. When a contractor holds the contract, it is hard for the government to see where the recipient list sits and on which plan.
- **Industry · Procurement & supply chain**: Companies that entrust member and customer newsletters to a delivery SaaS, sometimes syncing names and internal IDs for delivery.
- **Operation · Accounts & permissions**: Managing provider staff accounts placed in your delivery environment, and source settings for the admin console and API.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Fixing the vulnerability | Partial | It closes the entry, but fixing it alone does not change what a credential holder is allowed to do. |
| Customers' MFA | Not relevant | The credentials taken were the provider's staff credentials. |
| Restricting source IPs for the admin console and API | Partial | It narrows the customer-side entry. Whether it would stop provider staff logins is not clear from the disclosures. |
| Intrusion detection | Partial | It noticed after the access logs showed the output had happened. |

### What is needed

1. **Tie staff logins to the customers and work they are assigned.** Do not keep staff information on every system at all times. Removing it from other systems, as Yumirlink did, points this way.
2. **Match each entry to a customer's request before letting it through.** Refuse logins not tied to a request, such as an inquiry number, even with the right password, and time-limit the ones allowed.
3. **Record which request led into which customer's system.** Keep it separately from the provider, in a form customers can check later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about SaaS that holds your data, such as email delivery

- Have you limited the admin console and API to your own IP addresses, rather than leaving them open to all?
- Does your recipient list carry fields you don't need for delivery, such as names, industry or internal IDs?
- Is there an agreement that the provider will tell you, after an incident, whether you were affected?

Note: if a malicious program on the server reads the database directly, data can be output without passing this check; it cannot be said that this mechanism would have stopped the roughly 9 million records here. Misuse within an assigned customer's request also passes. How the data was output and whether the attempts on other systems succeeded have not been disclosed yet. If follow-up reports reveal them, this Brief will be revised.

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
