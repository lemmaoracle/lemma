---
brief_no: 172
title: "Illuminate Education：退職者の鍵で入られ、元の顧客の学区のデータまで流出した(米 FTC)"
title_en: "Illuminate Education: Attackers got in with a former employee's key, and data from former client school districts was exposed too (US FTC)"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [identity-auth]
incident_date: 2021-12-27
published: 2026-11-02
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["171-free-mobile-cnil-former-subscriber-retention", "142-awa-bank-test-environment-repurposed-leak", "013-coinbase-kyc-insider-breach", "141-idscan-net-drivers-license-dark-web-breach"]
status: draft
version: "1.0"
og_lead_ja: "米 FTC、Illuminate に命令。退職者の鍵で入られ、生徒 1,010 万人超の個人情報が流出したと主張"
og_lead_en: "FTC order against Illuminate: a former employee's key let attackers in; 10.1M+ students' data taken, FTC alleges"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "FTC の命令 · 生徒の個人情報"
og_kicker_en: "FTC ORDER · STUDENT DATA"
og_headline_ja: "退職者の鍵で入られ、\n元の顧客のデータも\n流出した。\n<accent>生徒 1,010 万人超</accent>"
og_headline_en: "A former employee's key\nopened the cloud.\n<accent>10.1M+ students' data.</accent>"
key_figures:
  - value: "10.1"
    unit: "million+"
    label: "Students whose personal information was taken (as alleged by the FTC)"
    tone: "alert"
  - value: "3.5 years"
    label: "From the departure of the admin key's owner to the intrusion (the key was neither disabled nor rotated)"
  - value: "~10 years old"
    label: "Age of the exposed data from a former client school district in New York (about 2011–2013)"
glossary:
  - term: "FTC"
    desc: "The US Federal Trade Commission. It acts against unfair or deceptive practices, including how companies handle personal data."
  - term: "IAM access key"
    desc: "A per-user key for operating the cloud (AWS). It lets programs act without going through a human login screen."
  - term: "Consent order"
    desc: "An order the FTC issues by agreement with a company. Each violation can bring a civil penalty."
insight:
  slug: "former-customer-data-in-scope"
  label: "Ended contracts, data still exposed"
  quote: "Personal data that is not deleted after a contract ends is taken just like current customers' data when someone gets into the system."
industries: ["public-sector"]
operations: ["data-access"]
controls:
  - slug: "minimize-data"
    item: "Set retention deadlines for data from ended contracts and data no longer used, delete it, and keep a register of what is held where"
  - slug: "limit-and-revoke"
    item: "Disable a departing employee's keys on their last day, and regularly sweep for unused keys"
  - slug: "audit-trail"
    item: "Record, apart from the reader, which key read whose data"
attack_method: "account-takeover"
impact: "Personal information of more than 10.1 million students was taken (as alleged by the FTC), including decade-old data from a former client school district"
takeaway: "The FTC alleges that, besides a former employee's key left active for three and a half years, the lack of retention limits and deletion rules, with data kept even where contracts required deletion, made the breach worse."
self_check: "Can you say which systems still hold data from ended contracts? Do you disable departing employees' keys on their last day?"
countries: ["us"]
---

## 1. Summary

The FTC's complaint alleges two things. One is the entry point: a cloud key with administrator rights, belonging to an employee who had left three and a half years earlier, was used without ever having been disabled or rotated. The other is retention: with no retention limits or deletion rules, data that contracts required to be deleted was kept, so old student data from former client school districts was part of the breach. The FTC says this retention failure "further exacerbated the severity" of the breach. <strong>Personal data that is not deleted after a contract ends is taken just like current customers' data when someone gets into the system.</strong>

## 2. What got through

- **What got through**: On 27 December 2021 an attacker entered the company's AWS environment with a former employee's IAM access key (administrator rights). Using those rights, the attacker created a new user that could act in the environment without passing multi-factor authentication. For 13 days, undetected, the attacker reset database passwords, deleted resources and exfiltrated 787 SQL Server backups (as alleged by the FTC).
- **What is alleged about retention**: There were no retention limits or deletion rules, and student data was not deleted even where contracts required it. The company knew this as of 2021, and large amounts of unmanaged data remained. It began keeping a retention policy only in March 2022, after the breach (as alleged by the FTC).
- **What reaches the receiving side**: In general, the cloud environment receives operations from a valid key. Whether the key's owner has left, or whether the data being read should still be kept, cannot be told from the key's operations alone.
- **Not disclosed**: How the attacker obtained the former employee's key; how much of the total the former clients' data made up; the company's own account (the FTC's publications do not include it).

## 3. What to check

The condition that holds whatever the route is this: before personal data is read, check, apart from the reader, that the key's owner is still an authorised person, and that the data is within a current contract and its retention deadline.

- **Who approves**: The organisation holding the personal data. For each key it decides whose key it is and until when it can be used. For each kind of data and each client it decides how long to keep it, and records that in a register.
- **Where the check sits**: In front of reads of student data and its backups. Check the key owner's employment and the client's contract and retention deadline, and hold anything that falls outside until the check is done.
- **What is left behind**: A record of which key read whose data, kept in a form that later shows which districts must be told when there is a breach.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before student data is read, checking that the key's owner is still authorised and that the data is within its contract and retention deadline, and recording it. Detection = noticing after the read has happened. Dates come from the FTC's complaint and announcements.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before a read, check the key owner's employment and the data's retention deadline</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Personal data of 10.1M+ students<br>including former clients' data</span></div>
<div class="rx-zone det"><b>Detection · worked after 13 days</b>Noticed from an alert that sites went down</div>
<div class="rx-g g1"><div class="t">2021-12-27</div><b>Attacker gets in with a former employee's key</b></div>
<div class="rx-g g2"><div class="t">2022-01-08</div><b>Noticed from a site-outage alert</b></div>
<div class="rx-g g3"><div class="t">2025-12-01</div><b>FTC announces complaint and proposed order</b></div>
<div class="rx-g g4"><div class="t">2026-06-05</div><b>FTC finalises the order</b></div>
</div>
</figure>

The entry key and how long data is kept are separate controls; when one works, the gap in the other remains. A case where keeping former subscribers' data was found unlawful by a regulator is [Free Mobile and Free](/critical/briefs/171-free-mobile-cnil-former-subscriber-retention/); a case where customer data remained in an environment past its purpose is [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the check in section 03 in front of reads of student data.** It neither deletes data nor looks for intrusions; it checks, before execution, that the owner of the key used and the data's retention deadline are within what is allowed.

### Industries and operations to watch

- **Industry · Public sector**: providers that hold student data for schools and districts. They keep sensitive information such as grades, health and disability records, for many districts, over long periods.
- **Operation · Lookup & data access**: work that reads held data and backups with cloud keys. If a key is valid, what it can read is everything that remains.

### Current controls vs Lemma

The entry point in this case is column 2 (the former employee's key); the FTC alleges that column 1 (keeping former clients' data) made the breach worse. Column 3, the read, took the form of backups being exfiltrated.

| Control | Keeping former clients' data | Entry with a former employee's key | Reading student data |
| --- | --- | --- | --- |
| Set retention deadlines and delete | Effective | Not relevant | Partial |
| Disable keys on the last day of employment | Not relevant | Effective | Not relevant |
| Multi-factor authentication | Not relevant | Not effective | Not relevant |
| Anomaly detection and alerting | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Not relevant | Partial | Partial |

Setting retention deadlines and deleting stops holding data with no reason to keep it and shrinks what is exposed after a break-in (the FTC's order requires deleting unneeded data and following a published retention schedule). Disabling keys on the last day would make this key unusable. Multi-factor authentication was bypassed here: with administrator rights, the attacker created a new user that did not pass it (as alleged by the FTC). Anomaly detection, according to the FTC, did not flag use of the former employee's key, and the company noticed only after sites went down. Lemma checks, before a read, the key owner's employment and the data's retention deadline.

Note: Lemma's check works only when it is built into the path through which student data and backups are read, and the key owners' employment and each data set's contract and retention deadline are managed apart from the reader. If administrator rights are used to change the checked path itself, or storage is read directly, the check is not passed through. Deleting data is the job of the organisation that holds it; Lemma does not reduce what is stored. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three questions about personal data you hold for clients

- Can you say which systems and backups still hold data from clients whose contracts have ended?
- Do you disable departing employees' cloud keys on their last day, and regularly sweep for unused keys?
- If data past its retention deadline, or from an ended contract, were about to be read, could you stop it before the read?

## 5. Facts and timeline

- **Company**: Illuminate Education, Inc., which provides cloud education software to schools and districts. An indirect subsidiary of Renaissance Learning since April 2022 (FTC complaint).
- **Data held**: Students' names, student IDs, dates of birth, email addresses, usernames and passwords, attributes such as race and home language, disability and special-education information, and disciplinary records. Stored unencrypted until at least January 2022 (as alleged by the FTC).
- **Entry point**: The key used was an IAM access key with administrator rights, belonging to an employee who left in April 2018; it was neither disabled nor rotated at departure or in the three and a half years after (as alleged by the FTC).
- **Breach**: For 13 days, undetected, the attacker exfiltrated 787 SQL Server backups, and the personal information of more than 10.1 million students was exposed. The company paid a ransom in exchange for the data, but not all of it was returned (as alleged by the FTC).
- **Retention**: With no retention limits or deletion rules, student data was not deleted even where contracts required it. The breach included 2018–2019 data from an Illinois district that never put the product into use, and roughly 2011–2013 data from a former client district in New York. The FTC says this made the breach more severe (FTC complaint, paragraphs 22–23).
- **Notification**: The first notifications went out from March to July 2022. In October 2023 about 387,000 more students were newly identified as affected. The FTC says the lack of a data inventory hampered notifying districts (as alleged by the FTC).

### Timeline

- **2018-04**: The key's owner leaves the company.
- **2020-01**: An outside assessment flags weaknesses including IAM practices (as alleged by the FTC).
- **2021-12-27**: The attacker gets in with the former employee's key.
- **2022-01-08**: A site-outage alert leads to discovery, and the attacker's access is cut off.
- **2022-03**: The company begins keeping a retention policy.
- **2023-10**: About 387,000 more students are newly identified as affected.
- **2025-12-01**: The FTC announces its complaint and proposed order (2–0).
- **2026-06-05**: After public comment, the FTC finalises a modified order (2–0).

> The facts here rest on the FTC's complaint and announcements. The complaint states the FTC's allegations; this Brief does not assess the company's handling. The FTC's publications do not include the company's account. How the former employee's key was obtained, and how much of the total the former clients' data made up, have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The FTC's order (final on 2026-06-05)**: Do not misrepresent data security or how quickly breaches will be notified. Delete personal information not reasonably needed for products or services, and stop collecting or keeping it. Publish and follow a retention schedule that gives the reasons and deletion timeframes. Put a comprehensive information security program in place. Notify the FTC when reporting a breach to other government bodies. Each violation can bring a civil penalty.
- **The company's response (per the FTC complaint)**: After the breach it began putting in place a retention policy, a data inventory and threat detection.

## 6. Sources

- **FTC (Primary, authority)**: "FTC Takes Action Against Education Technology Provider for Failing to Secure Students' Personal Data" (2025-12-01) — <https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-takes-action-against-education-technology-provider-failing-secure-students-personal-data>
- **FTC (Primary, complaint)**: "Illuminate Education: Complaint" (File No. 222-3105) — <https://www.ftc.gov/system/files/ftc_gov/pdf/2223105illuminatecomplaint.pdf>
- **FTC (Primary, authority)**: "FTC Gives Final Approval to Order Against Illuminate Settling Allegations It Failed to Secure Students' Personal Data" (2026-06-05) — <https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-gives-final-approval-order-against-illuminate-settling-allegations-it-failed-secure-students>

Only the FTC's announcements and complaint are used as primary sources. The full text of the final order and the company's own statements have not been checked. Press and commentary sites are not included as sources.
