---
brief_no: 217
title: "ニトリ：同社が管理するシステムに第三者が不正にアクセスし、サーバー上の会員情報や注文情報が外部に流出した可能性がある(ニトリホールディングスの公表)"
title_en: "Nitori: A third party gained unauthorised access to a system the company manages, and member and order information held on its servers may have leaked to the outside (Nitori Holdings' disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-11-06
published: 2026-11-26
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["110-sourcenext-member-api-22m-records", "215-sbc-medical-group-unencrypted-passwords"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "2f229f69e71d3dd1"
  ref: "https://github.com/lemmaoracle/lemma/pull/1216"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text and the cover period figure"
version: "1.0"
og_lead_ja: "ニトリホールディングスが管理するシステムに第三者が不正にアクセスし、サーバー上の会員情報や注文情報など、最大3,762万件の個人情報が外部に流出した可能性がある"
og_lead_en: "A third party gained unauthorised access to a system Nitori Holdings manages, and up to 37.62 million records of personal information held on its servers, including member and order information, may have leaked to the outside"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 不正アクセス"
og_kicker_en: "CYBERATTACK · UNAUTHORISED ACCESS"
og_headline_ja: "不正アクセスで、\n会員情報が流出の可能性。\n<accent>最大3,762万件</accent>"
og_headline_en: "Unauthorised access to a system:\nmember data may have leaked.\n<accent>Up to 37.62 million records.</accent>"
key_figures:
  - value: "Up to 37.62"
    unit: "million records"
    label: "Records of personal information that may have leaked (as of the 9 November disclosure, Nitori Holdings). A count of records, not people; it may change as the investigation continues"
    tone: "alert"
  - value: "Oct → 11/6"
    label: "When third-party access may have taken place (mid to late October, found by later log analysis), and the day the access was confirmed and cut off"
  - value: "11/9"
    label: "The day the case was disclosed. The intrusion route is under investigation; the system that was accessed has not been named"
glossary:
  - term: "Up to 37.62 million records"
    desc: "No breakdown by category, and no overlap in terms of people, has been disclosed. The combination of information differs from customer to customer (Nitori Holdings)."
  - term: "Nitori official shop"
    desc: "The store Nitori runs on e-commerce malls (online marketplaces where many stores sell). Order data placed through it, as well as through Nitori's own online store, Nitori Net, is covered."
insight:
  slug: "bulk-read-not-checked-against-business-scope"
  stop: true
  label: "Reads of personal data not compared with business use"
  quote: "Before personal information is returned from a server, check whether the person reading it is staying within the scope and volume set for their business work, against the business's lookup record."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "verify-entry"
    item: "Know the accounts and routes into the systems that hold member and order information, and check authentication and permissions at the entry"
  - slug: "minimize-data"
    item: "Delete member and order information the business no longer uses once a set period has passed, or store it separately, rather than gathering too much in one place"
  - slug: "audit-trail"
    item: "Keep a record of who read how much personal information and when, apart from the servers, so the scope of a leak can be checked afterwards"
impact: "Up to 37.62 million records of personal information that Nitori Holdings holds on its servers (as of the 9 November disclosure) may have leaked to the outside. They cover the names, addresses, phone numbers, dates of birth and more of individual members and product buyers, the company names and contact-person details of corporate members, and online order data. Login passwords and credit card information are not included. The intrusion route is said to be under investigation"
takeaway: "Unless who is reading how much is compared with what the business uses, a third party's reads cannot be told apart from everyday lookups. Before personal information is returned, check against the record whether the person reading it is within the scope and volume set for the business, and record who read it."
self_check: "Do you have a mechanism that checks operations reading customers' personal information in bulk against the scope and volume set for the business?"
countries: ["jp"]
search_title: "ニトリ不正アクセス：最大3,762万件流出の可能性と経緯"
search_description: "ニトリホールディングスは、同社が管理するシステムへの第三者の不正アクセスで、会員情報や注文情報など最大3,762万件が外部に流出した可能性があると公表した（11月9日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 9 November 2026, Nitori Holdings announced that, through unauthorised access by a third party to a system the company manages, member and order information held on its servers may have leaked to the outside. It covers the names, addresses and more of individual members and product buyers, the contact details of corporate members, and online order data. Login passwords and credit card information are not included.

The company confirmed the unauthorised access on 6 November and cut it off immediately; later log analysis found that access may also have taken place from mid to late October. It says it has dealt with the vulnerable points and strengthened its monitoring, and is investigating the cause, the intrusion route, the scope of impact and any secondary harm.

<strong>Unless who is reading how much personal information is compared with what the business uses, a third party's reads cannot be told apart from everyday business lookups.</strong>

## 2. What got through

- **What got through**: Unauthorised access by a third party to a system Nitori Holdings manages. Which system was entered, and by what route, has not been disclosed; the intrusion route is said to be under investigation.
- **What reached the accepting side**: In general, what reaches a system holding personal information is the connection and the read request themselves. It does not show whether that request is a lookup within the scope set for the business.
- **Disclosure while it is still only a "possibility of leakage"**: What was actually taken out is not yet settled. The company is continuing log analysis and data matching on the scope of impact and the count.
- **Not disclosed**: The name and role of the system that was accessed. The intrusion route and method. What the vulnerable points the company says it has dealt with were. The details of the access from mid to late October. Whether information was actually taken out. Who the attacker is, and whether there was any demand for money.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the person reading is staying within the scope and volume set for their business work.

- **Who issues the record**: The business side that handles member and order information. For each business, such as stores, online sales and the corporate desk, it records which categories of information are normally looked up, in what units and how much, and the accounts and routes into the system.
- **Where it is checked**: The steps for reading personal information from a server and returning it. Reads whose scope and volume are not tied to a business lookup in the record are held. The check runs on a mechanism separate from the system that holds the personal information.
- **What is recorded**: Who read which categories of information, how much, and when, kept apart from the servers so the scope of a leak can be checked afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before personal information is returned from a server, whether the reader is within the scope and volume set for the business, against the business's lookup record, and recording who read it. Detection means noticing the unauthorised access, cutting it off and beginning an investigation. Dates rely on Nitori Holdings' disclosure.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check against the record that the reader is within the business's scope and volume before returning data</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unauthorised access by a third party to a system the company manages<br>The possibility that up to 37.62 million records on its servers leaked</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The unauthorised access was confirmed and that access was cut off</div>
<div class="rx-g g1"><div class="t">Mid–late Oct</div><b>The period in which access by a third party may have taken place (found by later log analysis)</b></div>
<div class="rx-g g2"><div class="t">11-06</div><b>The unauthorised access comes to light and that access is cut off</b></div>
<div class="rx-g g3"><div class="t">11-06</div><b>An investigation into the cause, intrusion route and scope begins with outside specialist bodies</b></div>
<div class="rx-g g4"><div class="t">11-09</div><b>Nitori Holdings discloses the case</b></div>
</div>
</figure>

Detection worked, and the unauthorised access was cut off on the day it came to light. Even so, access may also have taken place earlier, from mid to late October, and the scope that may have leaked reaches up to 37.62 million records. Cases where large amounts of member information were obtained from outside include [SourceNext](/critical/briefs/110-sourcenext-member-api-22m-records/) (misuse of a member-information API) and [SBC Medical Group](/critical/briefs/215-sbc-medical-group-unencrypted-passwords/) (a database reached by sustained attacks from overseas).

## 4. What Lemma does


**Lemma builds the pre-execution check into the steps for reading personal information from a server and returning it.** It does not look for unauthorised access; it checks, before execution, whether a read rests on the lookup scope and volume set for the business.

### Industries and operations to watch

- **Industry · Services & retail**: Retailers that hold store, online and corporate member information and order information within one group over long periods. Member numbers are large, and reaching a single system can mean a large count.
- **Operation · Lookup & data access**: Looking up member and order information in business work such as stores, online sales and the corporate desk, and reading that information out in bulk.

### Current controls vs Lemma

The route in this case is column 1 (which entry was used is under investigation). Column 2 (reads beyond the business scope by a legitimate account) and column 3 (contacts using leaked information while posing as the company or a delivery firm) have not been disclosed as having happened in this case (on column 3, Nitori Holdings has issued a warning).

| Control | Access by a third party to a system, and reads of personal information on its servers | Reads beyond the scope of the business by an account with legitimate permissions | Contacts using leaked information while posing as the company or a delivery firm |
| --- | --- | --- | --- |
| Authentication and access control at the entry | Partial | Not relevant | Not relevant |
| Monitoring and log analysis | Partial | Partial | Not relevant |
| Holding less personal information, and storing it separately | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Partial | Partial | Not effective |

Authentication and access control at the entry have no bearing on reads by a connection already past the entry. Monitoring and log analysis give clues, but by the time access is noticed the reads have happened. Holding less personal information makes a leak smaller, but does not stop the reads themselves.

Note: Lemma's check works only when it is built into the steps for reading and returning personal information, and the record of the business's lookup scope and volume is managed apart from the system that holds the personal information. If the system itself is taken over and a database or files are reached directly by a route that skips the check, the check is bypassed. Contacts that use leaked information happen outside the company; warnings and the enquiry desk deal with them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, fix vulnerable points or recover information that has leaked.

### Checklist

Three things to confirm about the entry to systems holding personal information, how much information is held, and the record of reads

- In your organisation, do you keep a list of the systems that hold member and order information, and of the accounts and routes that can get into them?
- Do you delete member and order information the business no longer uses once a set period has passed, or store it separately?
- Do you keep a record of who read how much personal information and when, apart from the servers? When a leak is suspected, is there a set procedure for identifying the people affected and contacting them?

## 5. Facts and timeline

- **Party**: Nitori Holdings Co., Ltd. (Nitori Group). The disclosure appears as a notice on the online store Nitori Net and as a PDF in the company's news.
- **What happened**: According to Nitori Holdings, on Friday 6 November 2026 it confirmed unauthorised access by a third party to a system the company manages. It immediately cut off that access and, in cooperation with outside specialist bodies, began investigating the cause, the intrusion route and the scope of impact. Log analysis and other work carried out after it came to light found that access by a third party may also have taken place before that date, from mid to late October; the details are under investigation.
- **Information**: According to Nitori Holdings, up to 37.62 million records of personal information the company holds on its servers may have leaked to the outside. They cover, for individual members and buyers of products in the Nitori Group: member number, name (including the phonetic reading), email address, address, phone number, date of birth and gender. For corporate members: member number, company name, department, representative's name, company address and phone number, and the contact person's name, email address and phone number. And order data for the company's products placed through Nitori Net and the Nitori official shop on e-commerce malls. Credit card information and login passwords are not within this leak. The scope of impact and the count may change as the investigation continues.
- **Impact**: Nitori Holdings says the personal information that may have leaked could be misused in spoofed emails, phishing scams, suspicious phone calls and the like, and asks people to be careful with contacts posing as the company, delivery firms, e-commerce malls and others, and not to open links or attachments they do not recognise. It says it never asks for passwords, credit card numbers, PINs or similar by email or phone. Whether there is secondary harm is under investigation. The contact is the Customer Consultation Office (0120-209-993, 10:00–20:00).
- **How it came to light**: How it noticed has not been disclosed. The company says it has dealt with the vulnerable points and finished strengthening its monitoring. It is reporting to and consulting the Personal Information Protection Commission, the police and other relevant bodies.

### Timeline

- **2026-10 mid to late**: The period in which access by a third party may have taken place (found by log analysis and other work after it came to light on 6 November; the details are under investigation).
- **2026-11-06**: Nitori Holdings confirms unauthorised access by a third party to a system the company manages, and cuts it off. It begins an investigation with outside specialist bodies.
- **2026-11-09**: Nitori Holdings discloses the case (the date of the report to the Personal Information Protection Commission has not been disclosed).

> The facts of this case rely on Nitori Holdings' disclosure of 9 November 2026 (the primary source). The notice on Nitori Net and the PDF in Nitori Holdings' news have the same content, and both were checked. The disclosure is not labelled as a first report, and no follow-up was found in a search of news reports on 26 November. The cause, the intrusion route, the scope of impact and whether there is secondary harm are said to be under investigation. What has not been disclosed does not mean that no countermeasures were in place. This Brief does not evaluate any party's response. Written as of the 9 November disclosure.

### Response after disclosure

- **Nitori Holdings**: It continues to cut off access from the attacker and to investigate with outside specialist bodies. It will contact the customers concerned in turn by email or post. Based on the findings, it says it will review access control, authentication and permission management, monitoring and the like, and put measures in place to prevent a recurrence.

## 6. Sources

- **Nitori Holdings (primary source, the disclosing party)**: "Apology and notice regarding possible leakage of personal information due to unauthorised access to our system" (9 November 2026) — <https://www.nitori-net.jp/ec/notices/info261109/>
- **Nitori Holdings (primary source, PDF with the same content)**: "Apology and notice regarding possible leakage of personal information due to unauthorised access to our system" (9 November 2026) — <https://www.nitorihd.co.jp/news/items/2b702dbe4d438f7fef74945d68e5bd27_3.pdf>
- **Impress Watch (report)**: "Nitori: personal information of up to 37.62 million records may have leaked; unauthorised access" (9 November 2026) — <https://www.watch.impress.co.jp/docs/news/2154952.html>
- **Netshop Tantosha Forum (report)**: "Nitori: up to 37.62 million records may have leaked through unauthorised access from outside" (11 November 2026) — <https://netshop.impress.co.jp/n/2026/11/11/17020>

Reference: ["The last layer left for cyber defence in the age of AI"](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
