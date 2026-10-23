---
brief_no: 156
title: "ASOS：公式アプリの通知で、攻撃者の文面が顧客に届いた(同社の開示) — 顧客への一斉通知を、送る前に承認済みの配信と照合する層が見えない"
title_en: "ASOS: The attacker's message reached customers as an official app notification (company disclosure) — No layer is visible that checks a mass notification against an approved send before it goes out"
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
og_lead_ja: "英 ASOS、公式アプリに「Asos hacked」の不正な通知。社員のログイン情報も取られていた"
og_lead_en: "ASOS: a rogue \"Asos hacked\" app notification, and an employee login later disclosed as stolen"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 不正な通知"
og_kicker_en: "CYBERATTACK · ROGUE NOTIFICATION"
og_headline_ja: "公式アプリの通知で、\n攻撃者の文面が顧客に届いた。\n<accent>「Asos hacked」</accent>"
og_headline_en: "The attacker's message reached customers\nas an official app notification.\n<accent>\"Asos hacked\"</accent>"
summary_labels: ["What happened", "What is known", "The missing layer"]
key_figures:
  - value: "All"
    unit: "customers told to assume impact"
    label: "The UK National Cyber Security Centre (NCSC) advised every ASOS customer to assume they are affected, even without receiving the notification. How many received it, and how many were affected, has not been disclosed"
    tone: "alert"
  - value: "~10:00"
    label: "On October 6, when the unauthorised notification was sent to customers (per ASOS)"
  - value: "10-06 → 10-08"
    label: "From the unauthorised notification to ASOS explaining the route to customers (per press reports)"
glossary:
  - term: "ASOS"
    desc: "A UK online fashion retailer, listed on the London Stock Exchange."
  - term: "Push notification"
    desc: "A short message that arrives on a smartphone under an app's name. It is usually sent through an outside delivery service."
  - term: "Outside delivery service"
    desc: "An outside service a company uses to send email and app notifications to customers. ASOS has not said which service was involved."
insight:
  slug: "mass-notification-not-tied-to-approved-send"
  label: "Mass notifications not tied to an approved send"
  quote: "A notification went out in bulk under the official app's name from an outside service used for customer contact. The disclosures show no step checking it against an approved send before it went out."
industries: ["retail"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "Have someone other than the author confirm mass customer notifications, another way"
  - slug: "hold-unverified"
    item: "Do not send mass notifications that cannot be matched to an approved send"
attack_method: "impersonation"
impact: "The attacker's message reached customers as an official app notification, and names, contact details and more were accessed (NCSC, press)"
takeaway: "A mass notification went out under the official app's name. The disclosures show no step checking it against an approved send first."
self_check: "Do you know which accounts can send notifications to all your customers, and who holds them?"
---

## 1. TL;DR

On October 6, 2026, UK fashion retailer ASOS disclosed that an unauthorised notification had been sent to customers at around 10am that day. It said it was investigating unauthorised activity involving outside platforms it uses to communicate with customers, and that names and contact details may have been accessed. The notification was titled "Asos hacked" and linked to the Telegram messaging service (per press reports).

On October 8, ASOS told customers that an attacker had impersonated a trusted contact to obtain an employee's login, then used it to access information on third-party platforms (per press reports). How that login relates to the sending of the notification has not been disclosed.

ASOS said it immediately restricted access to the notification platforms, but the notification had already reached customers. What failed was the layer that checks a mass customer notification against an approved send before it goes out.

## 2. What happened

- **The company**: ASOS, a UK online fashion retailer.
- **What happened**: At around 10am on October 6, an unauthorised notification was sent to ASOS customers. ASOS said it was investigating unauthorised activity involving outside platforms it uses to communicate with customers (ASOS disclosure). The UK National Cyber Security Centre (NCSC) said some customers received a push notification from ASOS, and advised all ASOS customers to assume they are affected even if they did not receive it.
- **The notification**: Titled "Asos hacked", with a link to Telegram (per press reports). How many received it has not been disclosed; press reports said thousands.
- **The route**: Per ASOS's October 8 explanation, an unauthorised party impersonated a trusted contact to obtain login credentials, gained access to an employee account, and used those credentials to access information on third-party platforms ASOS uses (ASOS's explanation to customers, as quoted in press reports).
- **Not disclosed**: Whether those platforms are the ones that sent the notification, whether the login was used to send it, which employee and what rights, whether MFA was used, when access began, and how many customers' data was involved. ASOS has not named the platform.
- **Data accessed**: On October 6 ASOS said basic personal information such as names and contact details may have been accessed, and that it did not believe payment-card information or passwords were affected. The NCSC said ASOS had stated names and contact details had been accessed. ASOS's October 8 explanation listed names, delivery and email addresses, phone numbers and some non-personal account information (per press reports); the latter is understood to include search history (per press reports).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ②. Had mass customer notifications been checked against an approved send before going out, an unapproved one would not reach customers. Whether the login in ① was used for ②, and the order of ② and ③, have not been disclosed.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">1</div><b>Obtains an employee's login and accesses third-party platforms</b><p>By posing as a trusted contact (ASOS, October 8, per press). Whether these sent the notification is not disclosed.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">2</div><b>The attacker's message goes to customers as an official app notification</b><p>Around 10am, October 6.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">3</div><b>Accesses names, contact details and more</b><p>Payment cards and passwords said to be unaffected.</p></div>
<div class="rx-step"><div class="who">ASOS</div><div class="no">4</div><b>Restricts access to the notification platforms</b><p>When it noticed is not disclosed.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-10-06**: Around 10am, an unauthorised notification goes to customers. ASOS makes a disclosure. The NCSC publishes advice for customers. ASOS later apologises to customers directly and asks them not to click the link (per press).
- **2026-10-07**: The UK Information Commissioner's Office (ICO) issues a statement urging caution with links in such messages.
- **2026-10-08**: After a 48-hour investigation, ASOS explains the route and the data accessed to customers (per press).

> The unauthorised notification, the unauthorised activity on outside platforms, and the data that may have been accessed rest on ASOS's disclosure and the NCSC advice (both primary). The route and the data described on October 8 come from ASOS's explanation to customers as reported in the press; they are not in ASOS's disclosure.

### After disclosure

- **ASOS**: Restricted access to the notification platforms immediately and is working with internal and external advisers and authorities. It holds cyber and business continuity insurance and said it is too early to quantify the impact on trading. Its October 8 explanation said affected platforms were locked down and security controls further strengthened (per press).
- **NCSC and ICO**: Urged customers not to click links in notifications or emails. The ICO advised that anyone changing a password do it through the official site or app.

## 4. Why it wasn't stopped

The question here is not only how the employee login was protected. A notification went out in bulk under the official app's name from an outside service used for customer contact, and the disclosures show no step checking it against an approved send before it went out.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before a mass customer notification goes out, "is this on the company's schedule of approved sends?", and recording it. Detection means noticing unauthorised activity and stopping it.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · not visible</b>Before sending, check it is an approved send</div>
<div class="rx-zone gapz"><b>The gap</b><span>The attacker's message<br>reached customers</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>Restricts access to the platforms</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Login taken</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>10-06 notification arrives</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Access restricted</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>10-06 disclosure</b></div>
</div>
</figure>

Detection worked: ASOS restricted access and disclosed the same day, but the notification had already reached customers. "Can be sent from the outside delivery service" and "this send is approved" are separate facts, and the disclosures show no layer checking the first against the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Yumirlink's Cuenote FC](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/) (an email delivery provider's staff credentials were taken).

## 5. How to counter this

**Send mass customer notifications only when they match the company's schedule of approved sends.** Then a stolen login to the delivery service alone cannot get an unapproved notification to customers. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Services & retail**: E-commerce and retail that reach customers directly by app notification and email. The sender shows as the official name.
- **Operation · Sending & delivery**: Mass notifications and email from outside services used for marketing and customer contact.
- **Operation · Accounts & permissions**: Employee accounts that can enter delivery services, and how their logins are protected.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Staff training | Partial | Training alone cannot fully stop someone posing as a trusted contact. |
| MFA | Partial | ASOS has not said whether it was used. In general it guards the login, but not what is sent after. |
| Restricting access | Partial | It worked after the fact. The notification had already arrived. |
| Warnings to customers | Partial | They reduce harm after arrival, but don't stop arrival. |

### What is needed

1. **Separate the right to send mass notifications from the right to write them.** Whoever can write a notification should not be able to send it to every customer on their own.
2. **Send only what matches an approved send.** Do not send mass notifications that are not tied to a scheduled, approved send, even with a valid login.
3. **Record who sent what under which approval, separately from the delivery service.** Keep it in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about customer delivery services

- Can the person who writes a mass notification or email also send it alone?
- Do logins to delivery services require phishing-resistant MFA?
- When someone claiming to be a colleague or partner asks for login details, is there a step to confirm through another channel?

Note: if the approver's account is also taken over, this check can be passed. It also stops sending, not the reading of customer data held in the service. How the notification was sent has not been disclosed. If follow-up reports reveal it, this Brief will be revised.

## 6. Sources

- **ASOS (Primary, disclosure)**: "Update regarding cyber incident" (2026-10-06) — <https://www.investegate.co.uk/announcement/rns/asos--asc/update-regarding-cyber-incident-/9809595>
- **UK NCSC (Primary, public advisory)**: "Incident affecting ASOS customers" (2026-10-06) — <https://www.ncsc.gov.uk/news/incident-affecting-asos-customers>
- **UK ICO (Primary, statement)**: "ASOS statement" (2026-10-07) — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/asos-statement/>
- **The Guardian (Press)**: "Asos warns customer data may be compromised after ‘unauthorised’ app access" (2026-10-06) — <https://www.theguardian.com/business/2026/oct/06/asos-hack-notification-website-app>
- **The Guardian (Press, quoting ASOS's explanation to customers)**: "Asos says customers' names, contact details and search histories hacked" (2026-10-08) — <https://www.theguardian.com/business/2026/oct/08/asos-customer-data-accessed-hacker-posing-impersonated>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
