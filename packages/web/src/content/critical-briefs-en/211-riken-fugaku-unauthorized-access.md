---
brief_no: 211
title: "理化学研究所「富岳」：公開ダッシュボードを足がかりに運用系システムへ侵入され、利用者のSSH秘密鍵が持ち出されたおそれ（理化学研究所の発表）"
title_en: "RIKEN 'Fugaku': Intruders used the public status dashboard to reach the operations network, and users' SSH private keys may have been taken (RIKEN announcement)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-11-10
published: 2026-11-19
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["144-studio-saas-breach-decryption-keys-read", "204-ntt-data-stdirect-vendor-saas-admin-rights"]
fact_check:
  by: "Claude Opus 5.5"
  at: 2026-11-26
  rev: "8ff645c3e139e6bf"
  ref: "https://github.com/lemmaoracle/lemma/pull/1218"
status: draft
draft_fixed:
  - date: 2026-11-26
    note: "Removed the metaphor in the 01 bold; added the 16 November date (#53)"
version: "1.0"
og_lead_ja: "理研の「富岳」で、公開ダッシュボードを足がかりに運用系へ侵入され、利用者最大4,597名分の情報とSSH秘密鍵が持ち出されたおそれが公表された"
og_lead_en: "At RIKEN's 'Fugaku', intruders used the public status dashboard to reach the operations network, and records for up to 4,597 users and their SSH private keys may have been taken"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "見るだけの画面が、\n運用系への入口になった。\n<accent>鍵まで持ち出されたおそれ</accent>"
og_headline_en: "A read-only page became\nthe way into operations.\n<accent>Users' keys may be taken.</accent>"
key_figures:
  - value: "4,597"
    unit: "users"
    label: "Users whose registered records were taken or may have been taken (Fugaku up to 4,222 plus Rikyu up to 375; as of the 16 November disclosure; RIKEN announcement)"
    tone: "alert"
  - value: "11-10 → 11-13"
    label: "Period during which the intruders were inside the operations network, entering via the public dashboard"
  - value: "04:30"
    label: "Time on 14 November when Fugaku's operations were stopped and outside access was cut off"
glossary:
  - term: "Fugaku"
    desc: "A supercomputer operated by RIKEN's Center for Computational Science (R-CCS). Successor to the K computer, in shared use since March 2021."
  - term: "Rikyu"
    desc: "A supercomputer for AI for Science development being built by RIKEN. Names and email addresses of its users registered in the user authentication system were also affected."
  - term: "SSH private key"
    desc: "One of the credentials used to connect to another computer over SSH. Possession itself acts as permission to connect, so a taken key can be used directly as a way in to its destination."
  - term: "Status dashboard"
    desc: "A public web page showing the machine's operating status. According to RIKEN, Fugaku's status page was used as the foothold into the operations network."
insight:
  slug: "keys-left-in-home-directories"
  stop: true
  label: "A key whose location is unknown cannot be revoked when it leaks"
  quote: "Keep a record of who placed each key for connecting outwards, where, and for what; check connections against it, and do not leave keys of people who no longer use the system."
industries: ["public-sector"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "verify-entry"
    item: "Count public pages and dashboards as entry points too, and check how far they connect into internal networks and administrative functions before publishing them"
  - slug: "limit-and-revoke"
    item: "Record the owner and location of keys used to connect outwards, and do not leave unused keys or the keys of people who have left; when a leak is suspected, revoke first, before checking whether the key still works"
  - slug: "audit-trail"
    item: "Keep records of when and to where each key was used, separately from the system the key was stored on, so that whether a connection attempt succeeded can be checked afterwards"
attack_method: "account-takeover"
impact: "Records for up to 4,597 users (Fugaku: names, email addresses and IDs for up to 4,222; Rikyu: names and email addresses for up to 375) and files from users' home directories, including SSH private keys, access keys and research data, were taken or may have been taken. The intruders used some of the obtained credentials to try connecting to other systems. No concrete evidence of research results leaking has been confirmed"
takeaway: "The public status dashboard became the way into the operations network. Count read-only pages as entry points and check what they connect to. When a key may be taken, revoke it before checking whether it still works."
self_check: "Do you know who keeps SSH private keys and access keys for connecting to outside systems, and where they keep them?"
countries: ["jp"]
search_title: "理研「富岳」不正アクセス：SSH鍵持ち出しの経緯と対策"
search_description: "理化学研究所の「富岳」で、公開ダッシュボードを足がかりに運用系へ侵入され、利用者最大4,597名分の情報とSSH秘密鍵が持ち出されたおそれ（理化学研究所の発表）。経緯と対策を整理。"
---

## 1. Summary

On 16 November 2026, RIKEN announced that the operations systems of the supercomputer "Fugaku", run by its Center for Computational Science, had been accessed without authorisation by an outside third party. According to RIKEN, from 10 to 13 November the intruders used a public web page showing Fugaku's operating status (a dashboard) as a foothold to enter the operations network. The specific method of entry is still under investigation.

Two kinds of information were taken, or may have been taken. The first is information registered in the user authentication system: for Fugaku, names, email addresses and IDs of up to 4,222 users; for "Rikyu", names and email addresses of up to 375 users — up to 4,597 users in total. The second is part of the files stored in users' home directories: credentials for connecting to supercomputers and services outside RIKEN (SSH private keys, access keys and the like) and research data stored by users. RIKEN has confirmed that the intruders used some of the obtained credentials to try connecting to other systems. No concrete evidence that research results leaked outside has been confirmed at this point.

RIKEN stopped Fugaku's operations at 04:30 on 14 November, cut off outside access, and invalidated all users' login public keys. It has asked users to invalidate, at each destination, the SSH private keys and other credentials they had stored on Fugaku, and to have them reissued.

<strong>Login screens are not the only screens that can be entered from outside. A public, read-only dashboard became the foothold for intruding into the operations network.</strong>

## 2. What got through

- **What got through**: Entry into the operations internal network using the public dashboard as a foothold, and unauthorised operation of several internal servers. On some of the entered servers, tampering such as the installation of unauthorised programs was also confirmed. The specific method of entry is under investigation.
- **What the receiving side sees**: In general, what reaches an internal server is a connection from inside the network and operations carrying valid credentials. Whether that connection came through a public page or was legitimate maintenance work cannot be told from the operation that arrives.
- **Connection attempts with taken keys**: According to RIKEN, the intruders used some of the obtained credentials to try connecting to other systems. Whether those connections succeeded, and whether there was secondary damage, is under investigation with the relevant organisations.
- **Not disclosed**: Where in the dashboard, and how, it was exploited (the specific method of entry is under investigation). The final extent of the files taken. Whether the affected files contained third parties' personal data (being checked). Whether the connection attempts with the stolen credentials succeeded.

## 3. Pre-execution check

Two conditions distinguish the cases regardless of route. One is checking, before publication, how far a public page connects into the inside. The other is checking keys used to connect outwards against records of their owners and locations, and revoking them as soon as a leak is suspected.

- **Who checks**: The people who manage the public pages and network configuration of the computing platform, and the people who manage users' keys. In ordinary times they keep records of how far each public page connects inside, and of who placed each key, where, and for what.
- **Checked against what**: For public pages, the record of the boundary between the public area and the operations network. For keys, the record of owner, location and destination, and the revocation status.
- **What happens when it does not match**: A connection that does not match the boundary record is not let inside. A connection with a key that is not in the record, or has been revoked, is not accepted at the destination.

Detection worked. Suspicious traffic was detected on 12 November and an investigation began together with the maintenance contractor; the unauthorised access was confirmed at 16:33 on 13 November, and the systems used for the entry were isolated that night. Even so, during the four days the intruders were inside, user records and keys may have been taken.

## 4. What Lemma does

**Lemma builds pre-execution checking into the management of keys used to connect outwards, and into the handling of connections that arrive from public pages into the inside.** It does not find intrusions; it checks, before execution, whether a presented key matches the record of its owner and revocation status, and whether a connection matches the record of the boundary.

### Industries and operations to watch

- **Industry · Public sector**: Research institutes, universities and others that operate computing platforms or shared-use systems and publish status and usage information externally. Users' home directories tend to hold keys for connecting to outside computing platforms.
- **Operation · Account administration**: Issuing and revoking users' keys and credentials, and collecting keys when use ends or a user leaves.
- **Operation · Data access**: Managing the boundary between public pages and dashboards and internal networks and administrative functions.

### How current measures differ from Lemma

This incident's routes are the first column (entry via the public dashboard) and the third column (connection attempts with taken keys). The second column (misuse of taken user records) has not been confirmed in what was announced.

| Measure | Entry via the public dashboard | Misuse of taken user records | Connections with taken keys |
| --- | --- | --- | --- |
| Separation and inspection of public pages and the inside | Partially | Does not work | Does not work |
| Revoking and reissuing keys | Does not work | Does not work | Partially |
| Multi-factor authentication at destinations | Does not work | Partially | Partially |
| **Lemma (pre-execution check)** | Partially | Does not work | Works |

Separating public pages from the inside narrows the entry itself, but a connection passes if the record of the separation and the actual configuration have drifted apart. Revoking keys is the decisive step for stopping a leaked key, but a key whose location is unknown is left out of the revocation. Multi-factor authentication at a destination can stop a connection by key alone, but passes if other credentials were taken together with the key. Lemma checks, before a connection is executed, whether the presented key matches the record of its owner, location and revocation status.

Note: Lemma's check works only where the receiving side checks, along with the presented key, the owner and revocation status. A direct connection with a taken SSH private key to a destination that has no such check does not pass through this check, and is dealt with by revoking and reissuing the key. Lemma does not close vulnerabilities in public dashboards, does not detect or prevent intrusions, and does not recover data that was taken. The table compares what is checked; it does not show what would have stopped this incident.

### Inspection checklist

Three items for organisations that operate computing platforms or shared-use systems

- Is there a record of who placed each SSH private key or access key for connecting outwards, where, and for what?
- Is there a record of having inspected whether public dashboards and status pages connect to internal networks or administrative screens?
- Are the keys and permissions of people who have left, or finished using the system, still in place? Is there a procedure to invalidate all of them when a leak is suspected?

## 5. Facts and timeline

- **Party**: RIKEN (Center for Computational Science). The users of "Fugaku", which the Center operates, and of "Rikyu", which it is building, were affected. Maintenance of the operations systems is outsourced.
- **What happened**: According to RIKEN, from 10 to 13 November an outside third party used the public Fugaku status dashboard as a foothold to enter the operations internal network and operated several internal servers without authorisation. Tampering was also confirmed on some of the entered servers. The specific method of entry is under investigation.
- **Information**: According to RIKEN, the affected information is what was registered in the user authentication system (Fugaku: names, email addresses and IDs of up to 4,222 users; Rikyu: names and email addresses of up to 375 users) and part of the files stored in users' home directories (credentials such as SSH private keys and access keys for connecting outside RIKEN, and research data). No concrete evidence that research results leaked has been confirmed, and whether the affected files contained third parties' personal data is being checked.
- **Impact**: RIKEN has confirmed that the intruders used some of the obtained credentials to try connecting to other systems. Whether there was secondary damage is under investigation. Fugaku's operations are stopped, and RIKEN plans to restart after taking preventive measures.
- **How it was noticed**: Maintenance of the operations systems is outsourced. After suspicious traffic was detected on 12 November, an investigation began together with the contractor, and the unauthorised access was confirmed at 16:33 on 13 November.

### Timeline

- **2026-11-10 to 11-13**: An outside third party uses the public dashboard as a foothold to enter the operations internal network and operates several servers without authorisation.
- **2026-11-12**: Suspicious traffic is detected; an investigation begins together with the maintenance contractor.
- **2026-11-13 16:33**: RIKEN confirms the unauthorised access.
- **2026-11-13 20:59**: Report to the Ministry of Education, Culture, Sports, Science and Technology. At 22:07 the systems used for the entry are isolated.
- **2026-11-14 04:30**: Fugaku's operations are stopped and outside access is cut off. At 20:20 the administrative keys are replaced.
- **2026-11-15 16:18**: Users are notified by email and all running and queued computing jobs are stopped. All users' login public keys are invalidated, and users are asked to invalidate the credentials they had stored on Fugaku. A report is made to the HPCI organisations at 10:51.
- **2026-11-16 17:55**: Report to the Personal Information Protection Commission. RIKEN announces the incident the same day.

> The facts in this Brief rest on RIKEN's announcement (primary). At the time of the announcement, the specific method of entry, the final extent of the files taken, whether third parties' personal data was included, and whether the connection attempts succeeded were under investigation or being checked. RIKEN states that newly found facts will be announced promptly. What has not been announced does not mean that no measures were in place. This Brief does not evaluate RIKEN's response. Written as of 19 November.

### Response after disclosure

- **RIKEN**: Stopped Fugaku's operations and cut off the route, isolated the systems used for the entry, replaced the administrative keys, and invalidated all users' login public keys. It reported to the Ministry of Education, Culture, Sports, Science and Technology, the HPCI organisations, and the Personal Information Protection Commission. As prevention, it lists dealing with the exploited software vulnerability, rebuilding the entered servers, reviewing the network configuration, and introducing state-of-the-art security measures using AI, and plans to restart operations after these are in place. It also states it will review the division of roles in the operations and maintenance structure for faster emergency response.

## 6. Sources

- **RIKEN (primary, the party's announcement)**: "Unauthorised access to the supercomputers 'Fugaku' and 'Rikyu' and the possibility of personal information leakage" (16 November 2026) — <https://www.riken.jp/pr/news/2026/20261116_2/index.html>
- **ITmedia NEWS (reporting)**: "Fugaku stopped after unauthorised access; research data and SSH keys for outside connections may have leaked; connection attempts to other systems confirmed" (17 November 2026) — <https://www.itmedia.co.jp/news/article/2611/17/2000003253/>
- **INTERNET Watch (reporting)**: "Unauthorised access to RIKEN's Fugaku operations system; users of Fugaku and Rikyu may have had personal information leaked" (17 November 2026) — <https://internet.watch.impress.co.jp/docs/news/2156895.html>

Reference: ["The last layer left for cyber defence in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
