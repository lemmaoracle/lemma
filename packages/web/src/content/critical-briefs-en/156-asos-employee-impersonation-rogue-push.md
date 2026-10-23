---
brief_no: 156
title: "ASOS：信頼できる相手を装った攻撃者に社員のログイン情報を取られ、公式アプリの通知で攻撃者の文面が顧客に届いた(同社の開示と顧客へのメール) — 顧客への一斉の通知を、承認された配信と送る前に照合する層が無い"
title_en: "ASOS: An attacker posing as a trusted contact obtained an employee's login, and the attacker's message reached customers as an official app notification (company disclosure and customer email) — Nothing checks a mass customer notification against an approved send before it goes out"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-06
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["154-yumirlink-cuenote-support-credential-db-export"]
status: published
version: "1.0"
og_lead_ja: "英 ASOS、社員のログイン情報を取られ公式アプリに「Asos hacked」の通知"
og_lead_en: "ASOS: a stolen employee login sent \"Asos hacked\" through the official app"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "公式アプリの通知で、\n攻撃者の文面が顧客に届いた。\n<accent>「Asos hacked」</accent>"
og_headline_en: "The attacker's message reached customers\nas an official app notification.\n<accent>\"Asos hacked\"</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "All"
    unit: "customers"
    label: "The scope the UK National Cyber Security Centre (NCSC) said should assume they are affected, even without receiving the notification. The number affected has not been disclosed"
    tone: "alert"
  - value: "10:00 → 15:15"
    label: "On October 6, from the unauthorised notification to ASOS's market announcement (UK time)"
  - value: "10-06 → 10-08"
    label: "From the unauthorised notification to ASOS explaining the route in an email to customers (per press reports)"
glossary:
  - term: "ASOS"
    desc: "A UK online fashion retailer, listed on the London Stock Exchange."
  - term: "Push notification"
    desc: "A short message that arrives on a smartphone under an app's name. It is usually sent through an outside delivery platform."
  - term: "Customer communication platform"
    desc: "An outside service a company uses to send email and app notifications to customers. ASOS has not said which platform was involved."
insight:
  slug: "mass-notification-not-tied-to-approved-send"
  label: "Mass notifications not tied to an approved send"
  quote: "From platforms reached with an employee's login, a notification could go to customers in bulk under the official app's name. Whether it was an approved send was not asked before it went out."
industries: ["retail"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "Have someone other than the author confirm mass customer notifications, another way"
  - slug: "hold-unverified"
    item: "Hold mass notifications that cannot be matched to an approved send"
attack_method: "impersonation"
impact: "The attacker's message reached customers as an official app notification, and names, contact details and more were accessed"
takeaway: "With an employee's login, a mass customer notification could be sent without being checked against an approved send."
self_check: "Do you know who holds accounts that can send notifications to all your customers?"
---

## 1. TL;DR

On October 6, 2026, UK fashion retailer ASOS announced that an unauthorised notification had been sent to customers at around 10am that day. It cited unauthorised activity on outside platforms it uses to communicate with customers, and said names and contact details may have been accessed. The notification was titled "Asos hacked" and linked to the Telegram messaging service (per press reports).

On October 8, ASOS told customers by email that an attacker had impersonated a trusted contact to obtain an employee's login, then used it to access information on third-party platforms (per press reports). To customers, the notification came under the official app's name and could not be told apart from a real one.

ASOS noticed and restricted access to the notification platforms. What failed was the layer that checks a mass customer notification against an approved send before it goes out.

## 2. What happened

- **The company**: ASOS, a UK online fashion retailer.
- **What happened**: At around 10am on October 6, an unauthorised notification was sent to ASOS customers, following unauthorised activity on outside platforms used to communicate with customers (ASOS market announcement). The UK National Cyber Security Centre (NCSC) said some customers received an app push notification and that all ASOS customers should assume they are affected, even if they did not receive it.
- **The notification**: Titled "Asos hacked", with a link to Telegram (per press reports). How many people received it has not been disclosed.
- **The route**: In an October 8 email to customers, ASOS said an unauthorised party impersonated a trusted contact to obtain login credentials, gained access to an employee account, and used those credentials to access information on third-party platforms ASOS uses (email as quoted in press reports).
- **Not disclosed**: Which platform, which employee and what rights, whether MFA was used, when access began, and how many customers' data was involved. ASOS has not named the platform.
- **Data accessed**: On October 6 ASOS said basic personal information such as names and contact details may have been accessed, and that it did not believe payment-card information or passwords were affected. The October 8 email said names, delivery and email addresses, phone numbers and some non-personal account information were accessed (per press reports); the latter is understood to include search history (per press reports).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ③. Had mass customer notifications been checked against an approved send before going out, an unapproved one would not reach customers, even with an employee's login. What happened between ② and ③, and the order of ③ and ④, have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">1</div><b>Impersonates a trusted contact and obtains an employee's login</b><p>ASOS email to customers (per press).</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Uses it to enter outside platforms for customer communication</b><p>The platform is not named.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Sends the attacker's message to customers as an official app notification</b><p>Around 10am, October 6.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">4</div><b>Accesses names, contact details and more</b><p>Payment cards and passwords said to be unaffected.</p></div>
<div class="rx-step"><div class="who">ASOS</div><div class="no">5</div><b>Restricts access to the notification platforms</b><p>When it noticed is not disclosed.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-06**: Around 10am, an unauthorised notification goes to customers. At 15:15, ASOS makes a market announcement. The NCSC publishes advice for customers. ASOS later apologises to customers directly and asks them not to click the link (per press).
- **2026-10-07**: The UK Information Commissioner's Office (ICO) issues a statement urging caution with links in such messages.
- **2026-10-08**: After a 48-hour investigation, ASOS emails customers explaining the route and the data accessed (per press).

> The unauthorised notification, the unauthorised activity on outside customer-communication platforms, and the data that may have been accessed rest on ASOS's market announcement and the NCSC advice (both primary). The route and the data described on October 8 come from ASOS's customer email as quoted in press reports; they are not in the market announcement. As of October 23, ASOS had made no further announcement.

### After disclosure

- **ASOS**: Restricted access to the notification platforms immediately and is working with internal and external advisers and authorities. It holds cyber and business continuity insurance and said it is too early to quantify the impact on trading. The October 8 email said affected platforms were locked down and security controls further strengthened (per press).
- **NCSC and ICO**: Urged customers not to click links in notifications or emails, and to change passwords only through the official site or app.

## 4. Why it wasn't stopped

This case was not only about an employee being deceived. From platforms reached with an employee's login, a notification could go to customers in bulk under the official app's name, and whether it was an approved send was not asked before it went out.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before a mass customer notification goes out, "is this an approved send?", and recording it. Detection means noticing after the notification has arrived.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before sending, check it is an approved send</div>
<div class="rx-zone gapz"><b>The gap</b><span>The attacker's message<br>reached customers</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Restricts access to the platforms</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Login taken</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>10-06 notification arrives</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Access restricted</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>15:15 announcement</b></div>
</div>
</figure>

Detection worked: ASOS restricted access and disclosed the same day. But it noticed after the notification had reached customers. "Can enter the platform with an employee's login" and "this send is approved" are separate facts, and the disclosures show no layer checking the first against the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Yumirlink's Cuenote FC](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/) (an email delivery provider's staff credentials were taken).

## 5. How to counter this

**Before a mass customer notification goes out, check it against an approved send.** Then a stolen employee login alone cannot get an unapproved notification to customers. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Services & retail**: E-commerce and retail that reach customers directly by app notification and email. Messages arrive under the official name, so customers cannot tell them apart.
- **Operation · Sending & delivery**: Mass notifications and email from outside platforms used for marketing and customer contact.
- **Operation · Accounts & permissions**: Employee accounts that can enter delivery platforms, and how their logins are protected.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Staff training | Partial | Training alone cannot fully stop someone posing as a trusted contact. |
| MFA | Partial | ASOS has not said whether it was used. It guards the login, but not what is sent after. |
| Restricting access | Partial | It worked after the fact. The notification had already arrived. |
| Warnings to customers | Partial | They reduce harm after arrival, but don't stop arrival. |

### What is needed

1. **Separate the right to send mass notifications from the right to write them.** Whoever can write a notification should not be able to send it to every customer on their own.
2. **Check each send against an approved send before it goes out.** Do not send mass notifications that are not tied to a scheduled, approved send, even with a valid login.
3. **Record who sent what under which approval, separately from the delivery platform.** Keep it in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about customer delivery platforms

- Can the person who writes a mass notification or email also send it alone?
- Do logins to delivery platforms require phishing-resistant MFA?
- When someone claiming to be a colleague or partner asks for login details, is there a step to confirm through another channel?

Note: if the approver's account is also taken over, this check can be passed. It also stops sending, not the reading of customer data held on the platform. Details of the route have not been disclosed. If follow-up reports reveal them, this Brief will be revised.

## 6. Sources

- **ASOS (Primary, market announcement)**: "Update regarding cyber incident" (2026-10-06) — <https://www.investegate.co.uk/announcement/rns/asos--asc/update-regarding-cyber-incident-/9809595>
- **UK NCSC (Primary, public advisory)**: "Incident affecting ASOS customers" (2026-10-06) — <https://www.ncsc.gov.uk/news/incident-affecting-asos-customers>
- **UK ICO (Primary, statement)**: "ASOS statement" (2026-10-07) — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/asos-statement/>
- **The Guardian (Press)**: "Asos warns customer data may be compromised after ‘unauthorised’ app access" (2026-10-06) — <https://www.theguardian.com/business/2026/oct/06/asos-hack-notification-website-app>
- **The Guardian (Press, quoting the customer email)**: "Asos says customers' names, contact details and search histories hacked" (2026-10-08) — <https://www.theguardian.com/business/2026/oct/08/asos-customer-data-accessed-hacker-posing-impersonated>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
