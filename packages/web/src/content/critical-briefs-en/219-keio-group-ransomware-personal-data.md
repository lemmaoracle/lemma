---
brief_no: 219
title: "京王電鉄：グループのサーバーへのランサムウェア攻撃で、従業員などの個人情報の漏えいが確認され、顧客・取引先などの個人情報にも漏えいの可能性がある(京王電鉄の公表)"
title_en: "Keio Corporation: A ransomware attack on the group's servers led to confirmed leakage of personal information on employees and others, and personal information on customers, business partners and others may also have leaked (Keio Corporation's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [data-provenance]
incident_date: 2026-09-26
published: 2026-11-26
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["215-sbc-medical-group-unencrypted-passwords", "216-digital-agency-gss-file-sharing"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "766ae3d74f227119"
  ref: "https://github.com/lemmaoracle/lemma/pull/1219"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Cut overlapping explanations and shortened the text"
version: "1.0"
og_lead_ja: "京王電鉄のグループのサーバーへのランサムウェア攻撃で、従業員などの個人情報の漏えいが確認され、顧客・取引先などの個人情報にも漏えいの可能性がある"
og_lead_en: "A ransomware attack on Keio Corporation's group servers led to confirmed leakage of personal information on employees and others, and personal information on customers, business partners and others may also have leaked"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · ランサムウェア"
og_kicker_en: "CYBERATTACK · RANSOMWARE"
og_headline_ja: "ランサムウェアで、\n個人情報が漏れた。\n<accent>1,063万人に可能性</accent>"
og_headline_en: "Ransomware hit the group,\nand personal data leaked.\n<accent>About 10.63m may be exposed.</accent>"
key_figures:
  - value: "c. 10.63"
    unit: "million"
    label: "Customers, business partners and others whose data may have leaked (as of the 24 November disclosure, Keio Corporation). Also c. 360,000 applicants and c. 77,000 employees and others; counts do not simply add up"
    tone: "alert"
  - value: "c. 12,000"
    label: "Employees, former employees and dependants confirmed as leaked (as of the 24 November disclosure). Also c. 150 tenants and others, and c. 160 applicants"
  - value: "9/26 → 11/24"
    label: "From detecting the attack to submitting the final report to the Personal Information Protection Commission and disclosing the results. The attack route has not been disclosed"
glossary:
  - term: "Ransomware"
    desc: "In general, malicious software that makes the data on an organisation's servers or devices unusable and demands money in exchange for restoring it. It is often combined with taking data out and threatening to publish it."
  - term: "Preliminary and final reports"
    desc: "In general, when personal information leaks in Japan, a business first submits a preliminary report to the Personal Information Protection Commission, and then a final report based on the results of its investigation."
insight:
  slug: "bulk-personal-data-read-not-checked-against-business-record"
  stop: true
  label: "Bulk reads of personal data not compared with the business record"
  quote: "Before personal information is read out in bulk, check whether the person reading it is staying within the scope and volume set for their own company's business work, against the business record."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "minimize-data"
    item: "Do not keep personal information, such as copies of passports and identity documents, once the business task is done, and know what each company holds and where"
  - slug: "verify-entry"
    item: "At the entry to the group network, check the authentication of whoever connects, and count the links between group companies as entries too"
  - slug: "audit-trail"
    item: "Keep a record of who read which personal information and when, so the scope of a leak can be checked afterwards"
attack_method: "account-takeover"
impact: "Personal information on about 10.63 million customers, business partners and others of the Keio Group, about 360,000 people who applied for jobs, and about 77,000 employees, former employees and their dependants may have leaked. Leakage was confirmed for about 12,000 employees, former employees and their dependants, about 150 people such as tenants of rental properties, and about 160 people who applied for jobs. The information that may have leaked also includes about 1.6 million copies of passports of guests from overseas, credit card numbers, and about 46,000 identity documents. The route of the attack has not been disclosed. No secondary harm has been confirmed"
takeaway: "Unless someone confirms which company and which business task the person reading personal information in bulk is reading it for, an attacker's taking of data cannot be told apart from everyday business reads. Before a bulk read, check against the record whether the person reading is within the scope and volume of their own company's business work, and do not keep copies once the task is done."
self_check: "Do you have a mechanism that checks, against the business record, whether the person reading personal information in bulk is within the scope and volume of their own company's business work?"
countries: ["jp"]
search_title: "京王電鉄ランサムウェア：1,063万人に漏えいの可能性"
search_description: "京王電鉄は、グループのサーバーへのランサムウェア攻撃で、従業員など約1.2万人の個人情報の漏えいを確認し、顧客など約1,063万人に漏えいの可能性があると公表した（11月24日）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

In the early hours of 26 September 2026, Keio Corporation confirmed a ransomware attack on Keio Group servers and immediately took measures including cutting off the network. Sales systems at some group companies were disrupted, but railway operations were not. In its third report on 21 October, it said outside experts had reported that an organisation claiming to be behind the attack had published information it claimed to have stolen.

On 24 November, Keio Corporation submitted its final report to the Personal Information Protection Commission and disclosed the results of its investigation. The information that may have leaked includes about 1.6 million copies of passports of guests from overseas, among other things. The route of the attack has not been disclosed, and no secondary harm has been confirmed.

<strong>Unless someone confirms which company and which business task the person reading personal information in bulk is reading it for, an attacker's taking of data cannot be told apart from everyday business reads.</strong>

## 2. What got through

- **What got through**: Taking out personal information held inside the Keio Group network. From which servers, when and by what route the data was taken out has not been disclosed.
- **What reached the receiving side**: In general, what reaches a server holding files or databases is the read operation itself. It does not show which company and which business task the read is for.
- **A wide range of personal information**: The scope covers 47 companies, spanning railways and buses, real estate, hotels, construction and facilities, and a department store and supermarkets. The information that may have leaked includes My Number (Japan's individual number), passport copies, credit card numbers and identity documents.
- **Not disclosed**: The route and method of the attack (the second and third reports said the investigation of the route was continuing; the 24 November disclosure does not mention the route). The name of the organisation claiming to be behind the attack. Whether a ransom was demanded, and whether it was paid. Which personal information was held on which servers. The period over which data was taken out.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is whether the person reading is staying within the scope and volume set for their own company's business work.

- **Who issues the record**: The business systems of each company that holds personal information. For each task — reservations, contracts, recruitment, HR — it records which data is normally read, by whom and in what volume. When data passes between group companies, the recipient and the purpose are also recorded.
- **Where it is checked**: The steps for reading data out in bulk from servers that hold personal information. Reads not tied to a company, a task and a volume in the record are held. The check runs on a mechanism separate from the servers themselves.
- **What is recorded**: Who read which personal information, and when, kept apart from the servers so the scope of a leak can be checked afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a bulk read, whether the reader is within their own company's business scope and volume, against the business record, and keeping a record. Detection means noticing the ransomware attack and cutting off the network. Dates are the dates of Keio Corporation's disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosure</b>Check against the record that the reader is within their company's business scope and volume before letting it through</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Publication of information claimed to have been stolen<br>Leakage of personal information on employees and others, and possible leakage for customers and others</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The attack detected and the network cut off</div>
<div class="rx-g g1"><div class="t">09-26</div><b>Keio Corporation detects the attack and cuts off the network</b></div>
<div class="rx-g g2"><div class="t">10-16</div><b>It confirms a claim by an organisation claiming to be behind the attack that it published information</b></div>
<div class="rx-g g3"><div class="t">10-21</div><b>It receives a report from outside experts that the information was published</b></div>
<div class="rx-g g4"><div class="t">11-24</div><b>It submits its final report to the Personal Information Protection Commission and discloses the results</b></div>
</div>
</figure>

Detection worked, and the network was cut off on the day the attack was confirmed. Even so, the information claimed to have been stolen was published, and possible leakage covers about 10.63 million customers, business partners and others. Cases where outsiders reached information an organisation held include [SBC Medical Group](/critical/briefs/215-sbc-medical-group-unencrypted-passwords/) (passwords stored without encryption) and [Digital Agency GSS](/critical/briefs/216-digital-agency-gss-file-sharing/) (access by someone who was not a sharing recipient).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps for reading personal information out in bulk.** It does not look for attacks; it checks, before execution, whether a read rests on the record of company, task and volume.

### Industries and operations to watch

- **Industry · Services & retail**: Companies such as hotels, department stores, supermarkets and real-estate firms that hold personal information on many customers for reservations, memberships and contracts. Some information, such as passport copies and identity documents, tends to remain after the task is done.
- **Operation · Lookup & data access**: Reading the personal information each group company holds, and passing data between group companies.

### Current controls vs Lemma

What the disclosures confirm in this case falls under column 1. For column 2 (systems stopped), sales systems at some group companies were disrupted. For column 3 (contacts posing as the group), no secondary harm arising from this case has been confirmed.

| Control | Taking out personal information held inside the group network | Business systems stopped by ransomware | Contacts posing as the group, using leaked information |
| --- | --- | --- | --- |
| At the entry, check the authentication of whoever connects | Partial | Partial | Not relevant |
| Keep backups separately and segment the network | Not relevant | Partial | Not relevant |
| Do not keep personal information once the task is done | Partial | Not relevant | Partial |
| **Lemma (pre-execution check)** | Partial | Not effective | Not effective |

Authentication at the entry does not stop data being taken out by someone who has passed authentication. Separate backups and network segmentation speed up the resumption of business, but are not relevant to data being taken out. Not keeping personal information once the task is done makes the scope that can be taken smaller, but does not stop the taking itself.

Note: Lemma's check works only when it is built into the steps for reading personal information out in bulk, and the business record is managed apart from the servers. If server administrator privileges are seized and data is reached directly by a route that skips the check, the check is bypassed. Systems stopped by ransomware and contacts using leaked information are dealt with by backups and warnings to the people affected. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, restore systems that have stopped, or recover data that has been taken.

### Checklist

Three things to confirm about the scope of personal information held, the links between group companies, and the record of reads

- In your organisation, is there a set deadline for deleting personal information, such as copies of passports and identity documents, once the task is done?
- Do you know which group companies share which networks and servers?
- Is a record of who read which personal information and when kept apart from the servers?

## 5. Facts and timeline

- **Party**: Keio Corporation and the Keio Group. The 24 November disclosure lists 47 companies in scope: 8 in transport, 4 in real estate, 6 in hotels, 5 in construction and facilities, and 24 in lifestyle services.
- **What happened**: According to Keio Corporation, in the early hours of 26 September it confirmed a ransomware attack on Keio Group servers. Sales systems at some group companies were disrupted. Railway operations were not. In its second report on 16 October, it said it had confirmed that an organisation claiming to be behind the attack was claiming to have published part of the information held by the Keio Group. In its third report on 21 October, it said it had received a report from outside experts that information the organisation claimed to have stolen from the Keio Group had been published.
- **Information**: According to Keio Corporation, leakage was confirmed for about 150 people such as tenants of rental properties Keio Corporation owns (names, addresses and so on), about 160 people who applied for jobs in the Keio Group (names, addresses, phone numbers, application documents and so on), and about 12,000 employees, former employees and their dependants (names, HR information and so on). Personal information that may have leaked covers about 10.63 million customers, business partners and others of the Keio Group (names, addresses, phone numbers, email addresses, My Number, passports, credit card numbers, identity documents and so on), about 360,000 people who applied for jobs, and about 77,000 employees, former employees and their dependants (including My Number and HR information). The customer category includes 6 copies of My Number cards received by Keio Real Estate and Keio SC Creation, about 1.6 million records of guests from overseas who stayed at four hotels including Keio Plaza Hotel (passport copies), about 20,000 numbers of the Keio Credit Card for the Keio Department Store, and about 46,000 identity documents received by Keio Real Estate and ReBITA when real-estate sale or lease contracts were signed. The same person may appear in more than one category, so the counts do not simply add up.
- **Impact**: According to Keio Corporation, no secondary harm arising from this case, such as financial loss or other misuse, has been confirmed so far. It asks people to contact their card issuer if they see credit card charges they do not recognise, and to be careful of suspicious emails, text messages and phone calls that pose as the Keio Group or related parties. Keio Presso Inn has stopped taking new reservations and expects to resume in December.
- **How it came to light**: According to Keio Corporation, it detected the attack on the Keio Group network and immediately cut off the network to prevent the damage spreading. According to the 24 November disclosure, it promptly submitted a preliminary report to the Personal Information Protection Commission on the view that personal information may have leaked, then investigated the scope of the leak with the support of outside experts and submitted its final report.

### Timeline

- **2026-09-26**: In the early hours, Keio Corporation confirms a ransomware attack on Keio Group servers. It takes measures including cutting off the network and notifies the police. It issues its first notice, saying that no leakage of information had been confirmed at that point.
- **2026-09-28**: According to a report, Keio Corporation explains that two locations were hit — Keio Group servers and Keio Plaza Hotel servers — and that, as of noon that day, it had not confirmed a ransom demand.
- **2026-10-16**: Keio Corporation issues its second report (it confirms that the organisation claiming the attack says it has published part of the information).
- **2026-10-21**: Keio Corporation issues its third report (a report from outside experts that the information was published). It says it has reported to the Personal Information Protection Commission.
- **2026-11-24**: Keio Corporation submits its final report to the Personal Information Protection Commission and issues a notice on the leakage of personal information.

> The facts of this case rely on Keio Corporation's four disclosures (the primary sources). The 24 November disclosure is the fourth in the series, but its title is "Notice and apology regarding the leakage of personal information due to a ransomware attack" and it is not labelled "fourth report". The number of servers hit and the status of any ransom demand rely on Nikkei xTECH's report. Nikkei's report gives a cumulative total of about 11.08 million by adding up the category counts, but Keio Corporation says they do not simply add up. According to reports, an organisation calling itself the ransomware group "Qilin" listed Keio Corporation on its leak site, but Keio Corporation has not disclosed the organisation's name. The date of the preliminary report to the Personal Information Protection Commission has not been stated. What has not been disclosed does not mean that no countermeasures were in place. This Brief does not evaluate any party's response. As of 24 November.

### Response after disclosure

- **Keio Corporation**: It has set up a task force as a Keio Group-wide effort and is investigating the scope of the impact and working on recovery. It will contact people whose personal information was confirmed or possibly leaked individually as soon as the facts are confirmed. It has set up a Keio Group enquiry line (0120-089-925, 10:00–17:00, excluding weekends and public holidays). It says it will respond with advice from lawyers and outside experts. It says it will identify issues in its IT governance, review and strengthen its security measures, and work to prevent a recurrence.

## 6. Sources

- **Keio Corporation (primary source, the disclosing party)**: "Notice and apology regarding a system failure due to a ransomware attack" (26 September 2026) — <https://www.keio.co.jp/news/update/announce/nr260926v13404/>
- **Keio Corporation (primary source, the disclosing party)**: "Notice regarding a system failure due to a ransomware attack: second report" (16 October 2026) — <https://www.keio.co.jp/news/update/news_release/news_release2026/pdf/nr20261016_newsrelease.pdf>
- **Keio Corporation (primary source, the disclosing party)**: "Notice regarding a system failure due to a ransomware attack: third report" (21 October 2026) — <https://www.keio.co.jp/news/update/news_release/news_release2026/pdf/nr20261021_newsrelease.pdf>
- **Keio Corporation (primary source, the disclosing party)**: "Notice and apology regarding the leakage of personal information due to a ransomware attack" (24 November 2026) — <https://www.keio.co.jp/news/update/news_release/news_release2026/pdf/nr20261124_newsrelease.pdf>
- **Nikkei xTECH (press report)**: "Ransomware attack on the Keio Group: two servers hit, no ransom demand confirmed" (28 September 2026) — <https://xtech.nikkei.com/atcl/nxt/news/24/03397/>
- **Nikkei (press report)**: "Keio Corporation: personal information on up to 11.08 million people leaked, including customers' passport copies" (24 November 2026) — <https://www.nikkei.com/article/DGXZQOUC247GC0U6A121C2000000/>
- **Security Measures Lab (press report)**: "Ransomware group Qilin claims cyberattack on Keio Corporation" (16 October 2026) — <https://rocket-boys.co.jp/security-measures-lab/keio-qilin-ransomware-claim-leak-site-samples-20261016/>

Reference: ["The last layer left for cyber defence in the age of AI"](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
