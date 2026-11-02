---
brief_no: 156
title: "ASOS：公式アプリの通知で、攻撃者の文面が顧客に届いた(同社の開示)"
title_en: "ASOS: The attacker's message reached customers as an official app notification (company disclosure)"
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
sections: "proof"
gate: "delivery"
og_kicker_ja: "サイバー攻撃事例 · 不正な通知"
og_kicker_en: "CYBERATTACK · ROGUE NOTIFICATION"
og_headline_ja: "公式アプリの通知で、\n攻撃者の文面が顧客に届いた。\n<accent>「Asos hacked」</accent>"
og_headline_en: "The attacker's message reached customers\nas an official app notification.\n<accent>\"Asos hacked\"</accent>"
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
  quote: "A mass notification that reaches customers under an official name, if it cannot be checked against an approved send beforehand, lets an attacker's message arrive as the same official notice."
industries: ["retail"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "hold-unverified"
    item: "Do not send mass notifications that cannot be matched to an approved send"
attack_method: "impersonation"
impact: "The attacker's message reached customers as an official app notification, and names, contact details and more were accessed (NCSC, press)"
takeaway: "If a mass notification cannot be checked against an approved send before it goes out, an attacker's message reaches customers as an official one."
self_check: "Do you know which accounts can send notifications to all your customers, and who holds them?"
countries: ["gb"]
---

## 1. Summary

ASOS said it was investigating unauthorised activity involving outside platforms it uses to communicate with customers, and in its October 8 explanation to customers said an attacker had impersonated a trusted contact to obtain an employee's login (per press reports). How that login relates to the sending of the notification has not been disclosed. The notification arrived under the official app's name, so the person receiving it has nothing to tell it from a genuine one. <strong>Being able to log in to a delivery service is not the same as the notification going out being an approved send; if the second cannot be checked before sending, an attacker's message reaches customers as an official notice.</strong>

## 2. What got through

- **What got through**: A mass notification sent under the official app's name from an outside service used for customer contact. At around 10am on October 6, a notification titled "Asos hacked", with a link to Telegram, reached customers (ASOS disclosure; press reports; details in 05).
- **What was stopped**: ASOS restricted access to the notification platforms immediately. The notification had already reached customers.
- **What reached the receiving side**: In general, a notification from an official app arrives under the official name. The person receiving it cannot tell, from how it looks, whether it is an approved send or something sent by someone who got into the delivery service.
- **Not disclosed**: Whether the outside platforms are the ones that sent the notification, whether the login was used to send it, which employee and what rights, whether multi-factor authentication (a setting that asks for a code in addition to the password) was used, when access began, and how many customers' data was involved. ASOS has not named the platform.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever sends a mass notification to customers checks, before sending, that it is in a send schedule approved inside the company, separately from the login of the person who wrote it.

- **Who approves**: The person who approves the send schedule, someone other than whoever can write the notification. Being able to log in to the delivery service does not count as approval.
- **Where it is checked**: The mechanism that carries out the mass send. Even with a valid login, a notification not tied to an approved schedule is stopped before it goes out.
- **What is recorded**: Who sent what, under which approval, kept apart from the delivery service in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a mass notification goes to customers, that it is an approved send, and keeping a record. Detection means noticing the unauthorised activity and stopping it. The dates below are when ASOS and public bodies confirmed or disclosed each point, not when the login was stolen or the notification was written.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check, before sending, that it is an approved send</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The attacker's message reached customers as an app notification<br>Names and contact details may have been accessed</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Restrict access to the notification platforms</div>
<div class="rx-g g1"><div class="t">10-06</div><b>Rogue notification reaches customers</b></div>
<div class="rx-g g2"><div class="t">10-06</div><b>ASOS discloses; NCSC advises</b></div>
<div class="rx-g g3"><div class="t">10-07</div><b>ICO issues a statement</b></div>
<div class="rx-g g4"><div class="t">10-08</div><b>ASOS explains the route to customers</b></div>
</div>
</figure>

Detection worked, and ASOS restricted access and disclosed the same day, but the notification had already reached customers. A similar case, where credentials of a person at the delivery side were stolen, is [Yumirlink's Cuenote FC](/critical/briefs/154-yumirlink-cuenote-support-credential-db-export/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that carries out mass notifications to customers.** It does not look for intrusions; it checks, before sending, whether the notification rests on an approved send.

### Industries and operations to watch

- **Industry · Services & retail**: E-commerce and retail businesses that reach customers directly through app notifications or email. The sender shows as the official name.
- **Operation · Delivery**: Mass notifications and email from outside delivery services used for marketing or customer contact.
- **Operation · Accounts & permissions**: The staff accounts that can get into a delivery service, and how their logins are protected.

### Current controls vs Lemma

How the notification was sent from the delivery service (whether the login was used to send it) has not been disclosed, so it is not known which column this case falls in. Column 1 is sending a mass notification, column 2 is reading customer data held in the delivery service (the data accessed is close to this), and column 3 is where the approver's own account has also been taken over.

| Control | Sending a mass notification | Reading customer data in the delivery service | Approver's account taken over |
| --- | --- | --- | --- |
| Staff training | Partial | Not relevant | Not relevant |
| Multi-factor authentication | Partial | Partial | Partial |
| Restricting access | Partial | Not relevant | Not relevant |
| Warnings to customers | Partial | Not relevant | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not effective | Not effective |

Training alone cannot fully stop someone posing as a trusted contact. ASOS has not said whether multi-factor authentication was used; in general it guards the login, but not what is sent after. Restricting access worked after the fact, but the notification had already arrived. Warnings to customers reduce harm after arrival but do not stop arrival. Lemma checks, before sending, whether it is an approved send.

Note: Lemma's check works only when it is built into the mechanism that carries out mass sends and approval is managed apart from whoever writes the notification. It passes if the approver's account is also taken over. The check stops sending; it does not stop customer data held in the service from being read. How the notification was sent has not been disclosed; if follow-up reports reveal it, this Brief will be revised. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about customer delivery services

- Can the person who writes a mass notification or email also send it alone?
- Do logins to delivery services require phishing-resistant MFA?
- When someone claiming to be a colleague or partner asks for login details, is there a step to confirm through another channel?

## 5. Facts and timeline

- **The company**: ASOS, a UK online fashion retailer.
- **What happened**: At around 10am on October 6, an unauthorised notification was sent to ASOS customers. ASOS said it was investigating unauthorised activity involving outside platforms it uses to communicate with customers (ASOS disclosure). The UK National Cyber Security Centre (NCSC) said some customers received a push notification from ASOS, and advised all ASOS customers to assume they are affected even if they did not receive it.
- **The notification**: Titled "Asos hacked", with a link to Telegram (per press reports). How many received it has not been disclosed; press reports said thousands.
- **The route**: Per ASOS's October 8 explanation, an unauthorised party impersonated a trusted contact to obtain login credentials, gained access to an employee account, and used those credentials to access information on third-party platforms ASOS uses (ASOS's explanation to customers, as quoted in press reports).
- **Not disclosed**: Whether those platforms are the ones that sent the notification, whether the login was used to send it, which employee and what rights, whether MFA was used, when access began, and how many customers' data was involved. ASOS has not named the platform.
- **Data accessed**: On October 6 ASOS said basic personal information such as names and contact details may have been accessed, and that it did not believe payment-card information or passwords were affected. The NCSC said ASOS had stated names and contact details had been accessed. ASOS's October 8 explanation listed names, delivery and email addresses, phone numbers and some non-personal account information (per press reports); the latter is understood to include search history (per press reports).

### Timeline

- **2026-10-06**: Around 10am, an unauthorised notification goes to customers. ASOS makes a disclosure. The NCSC publishes advice for customers. ASOS later apologises to customers directly and asks them not to click the link (per press).
- **2026-10-07**: The UK Information Commissioner's Office (ICO) issues a statement urging caution with links in such messages.
- **2026-10-08**: After a 48-hour investigation, ASOS explains the route and the data accessed to customers (per press).

> The unauthorised notification, the unauthorised activity on outside platforms, and the data that may have been accessed rest on ASOS's disclosure and the NCSC advice (both primary). The route and the data described on October 8 come from ASOS's explanation to customers as reported in the press; they are not in ASOS's disclosure. What has not been disclosed does not mean there were no controls.

### After disclosure

- **ASOS**: Restricted access to the notification platforms immediately and is working with internal and external advisers and authorities. It holds cyber and business continuity insurance and said it is too early to quantify the impact on trading. Its October 8 explanation said affected platforms were locked down and security controls further strengthened (per press).
- **NCSC and ICO**: Urged customers not to click links in notifications or emails. The ICO advised that anyone changing a password do it through the official site or app.

## 6. Sources

- **ASOS (Primary, disclosure)**: "Update regarding cyber incident" (2026-10-06) — <https://www.investegate.co.uk/announcement/rns/asos--asc/update-regarding-cyber-incident-/9809595>
- **UK NCSC (Primary, public advisory)**: "Incident affecting ASOS customers" (2026-10-06) — <https://www.ncsc.gov.uk/news/incident-affecting-asos-customers>
- **UK ICO (Primary, statement)**: "ASOS statement" (2026-10-07) — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/asos-statement/>
- **The Guardian (Press)**: "Asos warns customer data may be compromised after ‘unauthorised’ app access" (2026-10-06) — <https://www.theguardian.com/business/2026/oct/06/asos-hack-notification-website-app>
- **The Guardian (Press, quoting ASOS's explanation to customers)**: "Asos says customers' names, contact details and search histories hacked" (2026-10-08) — <https://www.theguardian.com/business/2026/oct/08/asos-customer-data-accessed-hacker-posing-impersonated>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
