---
brief_no: 155
title: "TVING：開発者のキーで持ち出された開発プロジェクトの中に本番のキーがあり、利用者情報が流出した(韓国政府の調査結果) — キーの使用を、誰のどの作業かと照合する層が無い"
title_en: "TVING: Development projects taken with a developer key held production keys, and user data leaked (Korean government investigation) — Nothing checks each key use against whose work it is for"
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
og_kicker_ja: "サイバー攻撃事例 · 認証情報の窃取"
og_kicker_en: "CYBERATTACK · CREDENTIAL THEFT"
og_headline_ja: "開発者のキーから、\nプロジェクトの中の本番のキーへ。\n<accent>3,954 万アカウントが流出</accent>"
og_headline_en: "From a developer key\nto production keys inside the projects.\n<accent>39.5M accounts leaked.</accent>"
summary_labels: ["What happened", "Why detection didn't stop it", "The missing layer"]
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
  - slug: "audit-trail"
    item: "Record key issuance and use, with whose work it was, separately from the user"
attack_method: "account-takeover"
impact: "User data from 39.5M accounts (including duplicates) leaked"
takeaway: "Production keys could be used without being asked whose work they were for."
self_check: "Do you know whose work each of your production access keys is for?"
countries: ["kr"]
---

## 1. TL;DR

On September 3, 2026, South Korea's Ministry of Science and ICT (MSIT) published its investigation into the breach of the streaming service TVING. An attacker used a developer's access key to enter the development environment and took all 361 development projects. Inside them, in source code and settings, were 43 keys to the production environment. With two of them, the attacker entered production, obtained the database ID and password, and exfiltrated user data from 39.5 million accounts (including duplicates).

TVING stopped the first exfiltration attempt after an alert when database CPU hit 100%. The next day, the attacker created a virtual server in the cloud with a different key and exfiltrated through it. CPU stayed under 10%, and no alert fired.

Load monitoring stopped the first attempt. What was missing was a layer that checks, at each use of a production key, whose work it is being used for.

## 2. What happened

- **The company**: TVING, a South Korean video streaming service.
- **The investigation**: MSIT began on-site work with KISA on June 2 and formed a joint public-private team on June 3. It ran forensics on nine developer devices to learn how the key was stolen, and traced the path through logs from security equipment, databases and systems, splitting it into five stages (per MSIT).
- **Source code taken**: 361 development projects (30.35 GB), including recommendation and search, user management and authentication, and payments. The development environment was entered twice: 14 projects were taken the first time and all 361 the second. Two development keys were used (per MSIT).
- **User data taken**: 39.5 million accounts (22.06M active, 17.37M dormant or deleted, 0.11M test; including one person with up to 13 accounts). ID, one-way hashed password, name, phone, email, date of birth, Korea's identity-verification identifier (CI) and more, 20 items in all. Phone numbers (last four digits) and emails (the part before the @) were partly encrypted, but the key leaked too, so investigators treated them as plaintext (per MSIT).
- **Not determined**: How the first development key was stolen. Investigators examined phishing, malware, supply-chain attack, key sharing and vulnerabilities, and could not determine it (per MSIT).
- **Problems the investigators named** (per MSIT):
  - Production keys were written directly into source code (41) or kept in plaintext settings (3, one duplicate).
  - Every developer had access to every development project, so even one key reached all of them.
  - There was no procedure for issuing, using, changing or retiring keys, and no policy to control access by unauthorized parties (they cited source-IP limits and MFA as examples).
  - Monitoring relied on simple signals such as CPU load, with nothing to watch and block network and data flows. With it, they judged, the mass leak would not have happened.
  - A 2024 penetration test had found keys written into source code, but it had not been fixed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The path the investigators traced</span></div>
<p class="rx-ex-cap">The stopping points are ② and ④. Had each use of a production key been checked against whose work it was for, a key with no requested work behind it could not enter production or create a server. How ①'s key was stolen has not been determined.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Enters development with a developer's key and takes all 361 projects</b><p>May 29. How the key was stolen is not determined. Even one key could reach them all (per investigators).</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">2</div><b>Enters production with a key found there and obtains the database ID and password</b><p>Kept in plaintext, investigators said.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">3</div><b>Tries a first exfiltration</b><p>May 30. Stopped after a CPU 100% alert.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">4</div><b>Creates a virtual server with another key and sends 24 GB out</b><p>May 31. No alert; the server was later deleted.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2024**: A penetration test finds access keys written into source code. Per the investigators, it was not fixed.
- **2026-05-29**: From 14:42, the development environment is entered with its access key. From 15:15, production (AWS) is entered too.
- **2026-05-30**: From 09:22, a first exfiltration is attempted. At 18:00, database CPU reaches 100% and an alert fires. TVING sees it and stops the job. Per the investigators, the dedicated security unit and the CISO were told about 14 hours after this anomaly.
- **2026-05-31**: At 10:10, suspicion that production keys were stolen and data leaked reaches the information security team. From 19:00 to 22:20, user data is sent out through a virtual server created with a different key. Investigators found CPU stayed under 10% and judged the attacker held it down to avoid the alert.
- **2026-06-01**: At 15:08, TVING reports to KISA. TVING reported becoming aware at 15:09 on May 31, but investigators set it at 10:10 and found the 24 hours the law allows had passed.
- **2026-09-03**: MSIT publishes the findings.

> The facts rest on the joint team's findings published by MSIT on September 3 (primary), including times and counts. The Personal Information Protection Commission says it will publish the detailed scale of personal data after its analysis. As of the findings, no harm to users or signs of sale on the dark web had been confirmed.

### Response

- **TVING**: Opened a damage-consultation line from June 3, and had a private security firm review the stolen source code for vulnerabilities (per MSIT).
- **MSIT**: Plans a fine for the late report. It will have TVING submit a prevention plan in September and inspect the October–December implementation from January 2027, ordering corrections where needed.

## 4. Why it wasn't stopped

This case was not only about a stolen key. The production keys let whoever held them through, and whose work each use was for was never asked.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before a production key performs a high-impact operation, "whose work, for which task, is this?", and recording it. Detection means noticing operations from symptoms such as load.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before use, check whose work it is</div>
<div class="rx-zone gapz"><b>The gap</b><span>Another key<br>created a server</span></div>
<div class="rx-zone det"><b>Detection layer · stopped the first</b>A CPU 100% alert halts the job</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Key taken</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Production entered</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>05-30 alert stops it</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>05-31 another key exfiltrates</b></div>
</div>
</figure>

Detection stopped the first attempt, but it watched only CPU load. "Holding a key" and "this person is using it for this work" are separate facts, and no layer checked the first against the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [the Studio case](/critical/briefs/144-studio-saas-breach-decryption-keys-read/) (the keys to decrypt the data were read along with it).

## 5. How to counter this

**Each time a production key performs a high-impact operation (creating servers, bulk-reading data), check whose work it is for.** Then a key lifted from code cannot carry out operations with no requested work behind them. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Media & content**: Video and music streaming services that hold member and payment data for years. The database here held data back to 2011, including dormant and deleted accounts.
- **Industry · Developers & agent operations**: Organisations with many developers, where keys easily end up on laptops or in code. Apart from the 43 keys in the projects, investigators found 37 development keys and 52 production keys on eight developers' devices.
- **Operation · Accounts & permissions**: The scope of rights given to developers and keys, and how keys are issued and retired.
- **Operation · Lookup & data access**: Bulk database reads, and where their ID and password are kept.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Revoking leaked keys | Partial | Known keys stop. But there were 43 keys in the projects, and the second attempt used a different key from the first. |
| CPU load monitoring | Partial | It stopped the first attempt. The second stayed under 10% CPU and no alert fired. |
| Source restrictions and MFA | Partial | Investigators said there was no access-control policy. These narrow the entry but don't ask what an entry is used for. |
| Penetration testing | Partial | The 2024 test found how keys were stored. Finding it is not the same as preventing use. |

### What is needed

1. **Keep keys out of code and tie them to an owner and assignment.** Developer keys should reach only the projects they work on (least privilege, as the investigators said).
2. **Check each high-impact production operation against whose work it is before letting it through.** Creating virtual servers or bulk-reading databases should not go through without a linked work request, even with a valid key, and allowed uses should be time-limited.
3. **Record key issuance and use separately from the user.** Keep which key did what, for whose work, in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about development and production keys

- Are production keys or database passwords left in plaintext in source code or config files?
- Can a single developer key reach every repository?
- Besides load monitoring, can you notice bulk reads or new virtual servers?

Note: if a developer's own device is taken over and the work request is forged too, this check can be passed. Investigators could not determine how the first development key was stolen. If follow-up reports reveal it, this Brief will be revised.

## 6. Sources

- **Ministry of Science and ICT, MSIT (Primary, government investigation)**: Findings on the TVING breach (2026-09-03, Korean) — <https://www.korea.kr/briefing/pressReleaseView.do?newsId=156780136>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
