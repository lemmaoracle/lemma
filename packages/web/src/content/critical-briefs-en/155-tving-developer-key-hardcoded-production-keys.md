---
brief_no: 155
title: "TVING：開発者のキーで持ち出された開発プロジェクトの中に本番のキーがあり、利用者情報が流出した(韓国政府の調査結果)"
title_en: "TVING: Development projects taken with a developer key held production keys, and user data leaked (Korean government investigation)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: []
incident_date: 2026-05-29
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["144-studio-saas-breach-decryption-keys-read", "004-megalodon-github-supply-chain"]
status: published
version: "1.0"
og_lead_ja: "韓国の動画配信 TVING、開発者のキーから本番に入られ 3,954 万アカウントの情報が流出"
og_lead_en: "Korea's TVING: a developer key led into production and data on 39.5M accounts leaked"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · 認証情報の窃取"
og_kicker_en: "CYBERATTACK · CREDENTIAL THEFT"
og_headline_ja: "開発者のキーから、\nプロジェクトの中の本番のキーへ。\n<accent>3,954 万アカウントが流出</accent>"
og_headline_en: "From a developer key\nto production keys inside the projects.\n<accent>39.5M accounts leaked.</accent>"
key_figures:
  - value: "39.5M"
    unit: "accounts"
    label: "TVING accounts whose data the investigators confirmed leaked (including dormant, deleted and test accounts, and duplicates of the same person). The Personal Information Protection Commission will confirm the detailed scale"
    tone: "alert"
  - value: "43"
    unit: "keys"
    label: "Production access keys inside the 361 development projects taken (in source code and settings). Two of them were used in the attack"
  - value: "05-29 → 05-31"
    label: "From entry into the development environment to the bulk exfiltration of user data"
glossary:
  - term: "TVING"
    desc: "A South Korean video streaming (OTT) service."
  - term: "Development and production environments"
    desc: "The development environment stores source code for developers to work on together. The production environment is the cloud system that runs the service (AWS, per the findings). Both require an access key to enter."
  - term: "Access key"
    desc: "A secret string used to enter a system. Like a password, whoever holds it can act with the owner's rights."
  - term: "Virtual server"
    desc: "A server created and deleted on demand in the cloud. Anyone with the right to create one can also use it as a path for data."
  - term: "Joint public-private investigation team"
    desc: "The team formed by South Korea's Ministry of Science and ICT (MSIT) with the Korea Internet & Security Agency (KISA) and others."
insight:
  slug: "key-holder-not-tied-to-work"
  label: "Keys not tied to whose work they are for"
  quote: "The production keys let whoever held them through. Whose work each use was for was never asked."
industries: ["media", "developers"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "hold-unverified"
    item: "Hold high-impact production operations until they are checked against whose work they are for"
  - slug: "minimize-data"
    item: "Remove dormant and closed accounts' data from the production database once it no longer serves a purpose"
  - slug: "audit-trail"
    item: "Record key issuance and use, with whose work it was, separately from the user"
attack_method: "account-takeover"
impact: "User data from 39.5M accounts (including duplicates) leaked"
takeaway: "Production keys could be used without being asked whose work they were for."
self_check: "Do you know whose work each of your production access keys is for?"
countries: ["kr"]
---

## 1. Summary

On September 3, 2026, South Korea's Ministry of Science and ICT (MSIT) published its investigation into the breach of the streaming service TVING. An attacker used a developer's access key to enter the development environment and took all 361 development projects. Inside them, in source code and settings, were 43 keys to the production environment. With two of them, the attacker entered production and exfiltrated user data from 39.5 million accounts (including duplicates). The first attempt was stopped by a CPU alert; the next day the attacker created a virtual server with a different key and exfiltrated with no alert. <strong>Holding a key and using it for a given piece of work are separate facts, and if the second cannot be checked before use, whoever holds the key can carry out heavy production operations.</strong>

## 2. What got through

- **What got through**: Connecting to production with a production key, obtaining the database ID and password, creating a virtual server with a different key, and sending user data out from it (per MSIT's findings). From 19:00 to 22:20 on May 31, 24 GB was sent.
- **What was stopped**: The first exfiltration attempt on May 30 was stopped by TVING after an alert when database CPU reached 100%.
- **What reached the receiving side**: A production key lets its holder through with the owner's rights. Whose work the use is for is not part of the condition at the time of use.
- **Not disclosed**: How the first development key was stolen. Investigators examined phishing, malware, supply-chain attack, key sharing and vulnerabilities, and could not determine it.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, when a production key performs a high-impact operation (creating a virtual server, bulk-reading data), the use is checked before it happens against whose work it is for, separately from the fact of holding the key.

- **Who issues the work**: The person who requests and approves the work, managed apart from whoever holds the key.
- **Where it is checked**: The mechanism that carries out production operations. Even with a valid key, an operation not tied to a requested piece of work is stopped before it runs.
- **What is recorded**: Which key did what, for whose work, kept apart from the user in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a production key performs a high-impact operation, whose work the use is for, and keeping a record. Detection means noticing anomalies such as load and stopping them. The points to stop it were entering production and creating a server with another key.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · absent</b>Before use, check whose work it is</div>
<div class="rx-zone gapz"><b>The gap</b><span>Another key<br>created a server</span></div>
<div class="rx-zone det"><b>Detection · stopped the first</b>A CPU 100% alert halts the job</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Key taken</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Production entered</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>05-30 alert stops it</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>05-31 another key exfiltrates</b></div>
</div>
</figure>

Detection stopped the first attempt, but it watched only CPU load. On the second, CPU stayed under 10% and no alert fired. A similar case, where the keys to decrypt the data were read along with it, is [the Studio case](/critical/briefs/144-studio-saas-breach-decryption-keys-read/).

## 4. What Lemma does

**Lemma builds the check in 03 into the side that carries out production operations.** It does not find intrusions; it checks, before a key is used, whether the use ties to a requested piece of work.

### Industries and operations to watch

- **Industry · Media & content**: Video and music streaming services that hold member and payment data for years. The database here held data back to 2011, including dormant and deleted accounts.
- **Industry · Developers & agent operations**: Organisations with many developers, where keys easily end up on laptops or in code. Apart from the 43 keys in the projects, investigators found 37 development keys and 52 production keys on eight developers' devices.
- **Operation · Accounts & permissions**: The scope of rights given to developers and keys, and how keys are issued and retired.
- **Operation · Lookup & data access**: Bulk database reads, and where their ID and password are kept.

### Current controls vs Lemma

How the first key was stolen has not been determined. Column 1 is heavy operations with a production key (creating a virtual server, bulk reads); column 2 is where the developer's whole device is taken over and the work request is forged too.

| Control | Heavy operations with a production key | Work request also forged |
| --- | --- | --- |
| Revoking leaked keys | Partial | Not relevant |
| CPU load monitoring | Partial | Not relevant |
| Source restrictions and MFA | Partial | Not relevant |
| Penetration testing | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Not effective |

Revoking known keys helps, but there were 43 keys in the projects and the second attempt used a different one. CPU monitoring stopped the first attempt; on the second it stayed silent. Investigators said there was no access-control policy; source restrictions and MFA narrow the entry but don't ask what an entry is used for. A 2024 penetration test had found how keys were stored; finding it is not the same as preventing use. Lemma checks, before use, whether it ties to a requested piece of work.

Note: Lemma's check works only when it is built into the mechanism that carries out production operations and work requests are managed apart from whoever holds the key. It passes if the developer's own device is taken over and the work request is forged too. Investigators could not determine how the first development key was stolen; if follow-up reports reveal it, this Brief will be revised. The table compares what is checked; it does not show whether it would have stopped this case. What is not disclosed does not mean controls were absent. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about development and production keys

- Are production keys or database passwords left in plaintext in source code or config files?
- Can a single developer key reach every repository?
- Besides load monitoring, can you notice bulk reads or new virtual servers?

## 5. Facts and timeline

- **The company**: TVING, a South Korean video streaming service.
- **The investigation**: MSIT began on-site work with KISA on June 2 and formed a joint public-private team on June 3. It ran forensics on nine developer devices and split the path, traced through logs, into five stages (per MSIT).
- **Source code taken**: 361 development projects (30.35 GB), including recommendation and search, user management and authentication, and payments. The development environment was entered twice: 14 projects were taken the first time and all 361 the second. Two development keys were used.
- **User data taken**: 39.5 million accounts (22.06M active, 17.37M dormant or deleted, 0.11M test; including one person with up to 13 accounts). ID, one-way hashed password, name, phone, email, date of birth, Korea's identity-verification identifier (CI) and more, 20 items in all. Phone numbers (last four digits) and emails (the part before the @) were partly encrypted, but the key leaked too, so investigators treated them as plaintext.
- **Problems the investigators named**:
  - Production keys were written directly into source code (41) or kept in plaintext settings (3, one duplicate).
  - Every developer had access to every development project, so even one key reached all of them.
  - There was no procedure for issuing, using, changing or retiring keys, and no policy to control access by unauthorized parties (they cited source-IP limits and MFA as examples).
  - Monitoring relied on simple signals such as CPU load, with nothing to watch and block network and data flows. With it, they judged, the mass leak would not have happened.
  - A 2024 penetration test had found keys written into source code, but it had not been fixed.
- **Not disclosed**: How the first development key was stolen. The Personal Information Protection Commission says it will publish the detailed scale of personal data after its analysis.

### Timeline

- **2024**: A penetration test finds access keys written into source code. Per the investigators, it was not fixed.
- **2026-05-29**: From 14:42, the development environment is entered with its access key. From 15:15, production (AWS) is entered too.
- **2026-05-30**: From 09:22, a first exfiltration is attempted. At 18:00, database CPU reaches 100% and an alert fires. TVING sees it and stops the job. Per the investigators, the dedicated security unit and the CISO were told about 14 hours after this anomaly.
- **2026-05-31**: At 10:10, suspicion that production keys were stolen and data leaked reaches the information security team. From 19:00 to 22:20, user data is sent out through a virtual server created with a different key. Investigators found CPU stayed under 10% and judged the attacker held it down to avoid the alert.
- **2026-06-01**: At 15:08, TVING reports to KISA. TVING reported becoming aware at 15:09 on May 31, but investigators set it at 10:10 and found the 24 hours the law allows had passed.
- **2026-09-03**: MSIT publishes the findings.

> The facts rest on the joint team's findings published by MSIT on September 3 (primary), including times and counts. As of the findings, no harm to users or signs of sale on the dark web had been confirmed. What is not disclosed does not mean controls were absent.

### After disclosure

- **TVING**: Opened a damage-consultation line from June 3, and had a private security firm review the stolen source code for vulnerabilities (per MSIT).
- **MSIT**: Plans a fine for the late report. It will have TVING submit a prevention plan in September and inspect the October–December implementation from January 2027, ordering corrections where needed.

## 6. Sources

- **Ministry of Science and ICT, MSIT (Primary, government investigation)**: Findings on the TVING breach (2026-09-03, Korean) — <https://www.korea.kr/briefing/pressReleaseView.do?newsId=156780136>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
