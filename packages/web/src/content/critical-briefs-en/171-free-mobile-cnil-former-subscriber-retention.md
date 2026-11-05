---
brief_no: 171
title: "Free Mobile・Free：契約者の個人データに不正アクセスされ、退会者のデータの保管も違反と認定された(CNIL の制裁)"
title_en: "Free Mobile and Free: Subscribers' personal data was accessed, and keeping former subscribers' data was also found unlawful (CNIL sanction)"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [identity-auth]
incident_date: 2026-01-13
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak", "141-idscan-net-drivers-license-dark-web-breach", "110-sourcenext-member-api-22m-records"]
status: published
version: "1.0"
og_lead_ja: "Free Mobile・Free に CNIL が制裁、退会者のデータの保管も違反と認定"
og_lead_en: "CNIL fines Free Mobile and Free; keeping ex-subscribers' data also found unlawful"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 個人情報の流出"
og_kicker_en: "CYBERATTACK · DATA BREACH"
og_headline_ja: "契約者のデータに\n不正アクセス。\n<accent>2,400 万件の契約</accent>"
og_headline_en: "Subscriber data accessed.\n<accent>24 million contracts</accent>"
key_figures:
  - value: "24"
    unit: "million"
    label: "Subscriber contracts whose personal data was accessed (including IBANs)"
    tone: "alert"
  - value: "€42"
    unit: "million"
    label: "Total fines (FREE MOBILE €27M, FREE €15M)"
  - value: "6"
    unit: "months"
    label: "Deadline set for FREE MOBILE to sort and delete former subscribers' data"
glossary:
  - term: "CNIL"
    desc: "France's data protection authority (Commission nationale de l'informatique et des libertés). It sanctions GDPR violations."
  - term: "Storage limitation (GDPR Art. 5(1)(e))"
    desc: "The principle that personal data must not be kept in identifiable form longer than needed for its purpose."
  - term: "IBAN"
    desc: "An internationally used bank account number, used for direct debits."
insight:
  slug: "retained-data-in-scope"
  stop: true
  label: "Data kept though unused"
  quote: "Before reading subscriber data, check the read against the permitted range and the retention deadline, not the entry-point login."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "minimize-data"
    item: "Keep only the former-subscriber data you have a reason to keep, such as for accounting, with a deadline, and delete the rest"
  - slug: "verify-entry"
    item: "At remote-work entry points, confirm the person and device logging in rather than relying on a password alone"
  - slug: "audit-trail"
    item: "Record what former-subscriber data is kept and until when, and when it was deleted"
attack_method: "account-takeover"
impact: "Personal data of 24 million subscriber contracts (including IBANs) accessed; fines total €42 million"
takeaway: "CNIL found weak VPN authentication and ineffective detection, and that there was no way to sort former subscribers' data, which was kept without justification."
self_check: "Do you delete, on a set schedule, the items of former customers' data you have no reason to keep?"
countries: ["fr"]
---

## 1. Summary

In October 2024 an attacker got into both companies' information systems and accessed subscriber personal data (CNIL). CNIL found two different things in this sanction. One is the entry point and detection: authentication for the remote-work VPN was not robust enough, and detection of abnormal behaviour was ineffective.

The other is former subscribers' data: there was no way to sort it, and millions of pieces of data were kept without justification (FREE MOBILE only). Whether former subscribers' data was among what was accessed has not been disclosed.

<strong>Personal data you hold, even if unused, is within reach of anyone who gets into the system.</strong>

## 2. What got through

- **What got through**: In October 2024 an attacker got into both companies' information systems and accessed personal data relating to 24 million subscriber contracts (CNIL), including IBANs of individuals who were customers of both companies.
- **What was found about the entry point**: The VPN authentication procedure for remote work was not sufficiently robust, measures to detect abnormal behaviour on the information systems were ineffective, and certain basic security measures that could have made the attack harder were not in place (CNIL).
- **What reaches the receiving side**: In general, a login through the VPN arrives as a connection from a legitimate internal user. How much subscriber data that connection may read cannot be told from the login alone.
- **Not disclosed**: How the attacker got through the VPN (for example, how credentials were obtained), how the data was read out, whether former subscribers' data was included, how many years and how many records of former subscribers' data were kept, the split between the two companies, and the number of IBANs.

## 3. Pre-execution check

The condition that holds whatever the route is that a read of personal data is checked, apart from the reader and before it runs, against the permitted party, purpose and volume and the retention deadline.

- **Who approves**: The organisation that manages the personal data. For each kind of data, it decides and records the permitted party, purpose and range of reads, and the retention deadline. For former subscribers it keeps only items with a reason, such as accounting, with a deadline.
- **Where the check sits**: In front of reads of subscriber data. Cap the number of records and the range one read can reach. Hold reads beyond the permission or past the retention deadline until checked.
- **What is left behind**: A record of which permission each read relied on and whose data was read, kept apart from the reader's own actions in a form that can later be shown to a third party.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before subscriber data is read, checking that the read is within the permission and the retention deadline, and recording it. Detection = noticing after the read has happened. The dates below are the month of the intrusion and the dates of CNIL's procedure; the day of the intrusion has not been disclosed.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before a read, check it is within the permission and the retention deadline</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Personal data of 24 million contracts<br>including IBANs</span></div>
<div class="rx-zone det"><b>Detection · as found by CNIL</b>Detection of abnormal behaviour was ineffective</div>
<div class="rx-g g1"><div class="t">2024-10</div><b>Attacker gets into the information systems</b></div>
<div class="rx-g g2"><div class="t">2026-01-08</div><b>CNIL's restricted committee deliberates</b></div>
<div class="rx-g g3"><div class="t">2026-01-13</div><b>CNIL imposes the sanctions</b></div>
<div class="rx-g g4"><div class="t">2026-01-14</div><b>CNIL publishes</b></div>
</div>
</figure>

Entry-point authentication and how long data is kept are separate controls; when one works, the gap in the other remains. Cases where data collected for identity checks was still being kept include [Coinbase](/critical/briefs/013-coinbase-kyc-insider-breach/), [Discord](/critical/briefs/052-discord-age-verification-id-leak/) and [IDScan.net](/critical/briefs/141-idscan-net-drivers-license-dark-web-breach/).

## 4. What Lemma does

**Lemma builds the pre-execution check in front of reads of subscriber data.** It neither deletes data nor looks for intrusions; it checks, before execution, that a read is within the permission and the retention deadline.

### Industries and operations to watch

- **Industry · Services & retail**: services such as telecoms that hold bank details for large numbers of subscribers for monthly direct debits. Counting people who have left, the data held exceeds the number of current subscribers.
- **Operation · Lookup & data access**: work that pulls subscriber data through internal screens or remote connections. If the login alone decides how much a connection that got in can read, the readable range is all the data held.

### Current controls vs Lemma

The disclosed route in this case is column 2 (entry-point login); how the data was read (column 3) has not been disclosed. Column 1 is the retention issue CNIL found in the same decision; its relation to the scope of this breach has not been disclosed.

| Control | Keeping former subscribers' data | Entry-point login (remote-work VPN) | Reading subscriber data |
| --- | --- | --- | --- |
| Sorting and deleting former subscribers' data | Effective | Not relevant | Partial |
| Stronger VPN authentication | Not relevant | Partial | Not relevant |
| Detecting abnormal behaviour | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Not relevant | Not relevant | Partial |

Sorting and deleting former subscribers' data stops holding data with no reason to keep it and shrinks what can be read after a break-in, but does not stop reads of the current subscribers' data that is kept (CNIL ordered FREE MOBILE to finish within six months). Stronger VPN authentication narrows who can get in, but lets through anyone holding legitimate credentials. Detecting abnormal behaviour can work at both the entry and the read, but notices after the fact, and CNIL found it ineffective here. Lemma checks a read against the permission and the retention deadline before it runs.

Note: Lemma's check works only when it is built into the path through which subscriber data is read, with the permitted party, purpose and volume and the retention deadline managed apart from the reader. Reads from outside that path, such as reading the database directly, do not pass through it. Deleting data is the job of the organisation that holds it; Lemma does not reduce what is stored. How the attacker got through the entry point and how the data was read have not been disclosed; this Brief will be revised if a later report discloses them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three questions about subscriber data

- Can you say which systems still hold former customers' data, and which items?
- At remote-work entry points, do you confirm the person or device logging in, in addition to the password?
- If a large volume of subscriber data were about to be read at once, could you stop it before the read?

## 5. Facts and timeline

- **Authority's decision**: Deliberations SAN-2026-001 and SAN-2026-002 of CNIL's restricted committee (2026-01-08). Sanctions imposed on 2026-01-13, published on 2026-01-14.
- **Fines**: €27 million on FREE MOBILE and €15 million on FREE (€42 million in total). FREE MOBILE and FREE are each the controller for their own subscribers' data.
- **Incident**: In October 2024 an attacker got into both companies' information systems and accessed personal data relating to 24 million subscriber contracts, including IBANs of individuals who were customers of both companies. By publication, CNIL had received more than 2,500 complaints.
- **Security (GDPR Art. 32, both companies)**: The remote-work VPN authentication procedure was not sufficiently robust, and measures to detect abnormal behaviour were ineffective. Certain basic security measures that could have made the attack harder were not in place (as found by CNIL).
- **Notifying individuals (GDPR Art. 34, both companies)**: The notification email lacked information required by Art. 34(2), so individuals could not grasp the consequences or the steps open to them (as found by CNIL).
- **Storage limitation (GDPR Art. 5(1)(e), FREE MOBILE only)**: At inspection there was no way to sort former subscribers' data, and millions of pieces of data were kept without justification (as found by CNIL).

### Timeline

- **2024-10**: An attacker gets into both companies' information systems.
- **2026-01-08**: CNIL's restricted committee deliberates (SAN-2026-001 and 002).
- **2026-01-13**: CNIL sanctions both companies.
- **2026-01-14**: CNIL publishes.

> The facts here rest on CNIL's publication. The findings of violations are CNIL's; this Brief does not assess the companies' handling. CNIL's publication does not record either company's arguments. The entry route, how the data was read, whether former subscribers' data was included, and how long and how many records were kept have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **During the proceedings**: Both companies strengthened security, and FREE MOBILE began sorting former subscribers' data. It kept only data needed for accounting, for ten years, and deleted some of the excess (CNIL).
- **CNIL's orders**: Both companies must complete the new security measures within three months. FREE MOBILE must complete sorting and deleting the data within six months of notification of the decision.

## 6. Sources

- **CNIL (Primary, authority)**: "Data breach: FREE MOBILE and FREE fined €42 million" (2026-01-14) — <https://www.cnil.fr/en/sanction-free-2026>

This Brief uses only CNIL's publication as primary. The full decisions (SAN-2026-001 and 002) and the companies' own statements have not been checked. Press and commentary sites are not included as sources.
