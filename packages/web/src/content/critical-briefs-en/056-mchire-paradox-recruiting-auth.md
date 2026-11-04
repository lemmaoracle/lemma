---
brief_no: 56
title: "McHire（Paradox.ai）：採用 AI の管理画面から、応募記録に手が届いたと研究者が報告(Ian Carroll・Sam Curry)"
title_en: "McHire (Paradox.ai): Researchers report reaching applicant records through the hiring AI's admin console (Ian Carroll, Sam Curry)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance", "ai-bias-harm"]
incident_date: 2025-06-30
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["057-deepseek-clickhouse-exposed-db", "013-coinbase-kyc-insider-breach", "022-onlyfake-ai-id-kyc-bypass"]
status: published
gate: "identity"
version: "1.0"
og_lead_ja: "研究者が、McHire（Paradox.ai）の管理画面に試験用アカウントで入り、最大 6,400 万件の応募記録に手が届いたと報告"
og_lead_en: "Researchers report entering McHire's (Paradox.ai) admin console with a test account and reaching up to 64 million applicant records"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の事例 · 採用 AI の権限"
og_kicker_en: "AI CASE · HIRING AI ACCESS"
og_headline_ja: "採用 AI の管理画面から\n応募記録に手が届いたと\n研究者が報告。\n<accent>最大 6,400 万件</accent>"
og_headline_en: "An admin login opened\napplicant records,\nresearchers report.\n<accent>Up to 64 million.</accent>"
key_figures:
  - value: "64"
    unit: "million"
    label: "Upper bound of applicant records the researchers report were within reach, including names, contact details and chat transcripts"
    tone: "alert"
  - value: "123456"
    label: "Username and password of a test account, reportedly left active since 2019, that let them in"
  - value: "Same day"
    label: "On the day of the report (2025-06-30), Paradox.ai disabled the account and fixed the issue"
glossary:
  - term: "IDOR"
    desc: "Insecure direct object reference: a flaw where swapping a record's ID returns that record without checking whether the requester may read it."
  - term: "Responsible disclosure"
    desc: "Telling the affected party about a flaw before making it public, giving them time to fix it."
insight:
  slug: "login-is-not-record-authority"
  label: "Getting in becomes the right to read"
  quote: "Unless whether a party may read a record is checked before the record is opened, separately from whether it logged in, one weak credential and a swapped ID are enough to reach other people's records."
industries: ["ai"]
operations: ["account-admin", "data-access"]
controls:
  - slug: "verify-entry"
    item: "At the admin entry, check unguessable credentials and per-record permissions"
  - slug: "limit-and-revoke"
    item: "Remove abandoned test accounts and bind record IDs to permissions"
impact: "Researchers report up to 64 million applicant records were within reach"
takeaway: "In the researchers' account, an abandoned test account opened the admin console, and swapping applicant IDs returned other people's records. Before a record is opened, check that the party holds authority over that record."
self_check: "Before a record is opened in an admin console, do you check that the party may read that record, separately from its login?"
countries: ["us"]
---

## 1. Summary

According to the researchers, the hiring AI's admin console still had a test account that had gone unused for years but remained active, and once inside, swapping the applicant ID returned other applicants' records. Outside researchers found the flaw and reported it, and the company fixed it the same day. Paradox.ai says only the researchers accessed any data. <strong>Unless whether a party may read a record is checked before the record is opened, separately from whether it logged in, one weak credential and a swapped ID are enough to reach other people's records.</strong>

## 2. What got through

- **What got through**: An admin login, followed by lookups of applicant records. According to Ian Carroll and Sam Curry, a test account whose username and password were both guessable let them into the admin console, and incrementing applicant IDs returned other applicants' records (IDOR).
- **What the receiving side gets**: In general, an admin console receives a session that passed login and the ID of the record to open. Whether that party may read that applicant's record cannot be told from the ID alone. Lookups over the legitimate path are logged in the same form as ordinary access.
- **Information within reach**: In the researchers' account, names, email addresses, phone numbers, interview (chat) transcripts, IP addresses and more.
- **Not disclosed**: Whether anyone other than the researchers accessed records (Paradox.ai says no one did). How the test account came to remain. Where and how per-record authority was meant to be decided.

## 3. Pre-execution check

The condition that holds whatever the route is this: before a record is opened, check whether the party may read that record, separately from whether it passed login.

- **Who approves**: The owner of the records (the hiring organization), which decides in advance which accounts may read which applicants' records, treating test and system accounts the same way.
- **Where the check happens**: Just before the admin console returns a record. A lookup with a swapped ID is checked at the same single point. A lookup that does not match the party's authority gets no record.
- **What remains**: A record of which party opened which record under which authority, so that whether a lookup was legitimate can be traced later without disclosing applicants' personal data.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">"Detection" versus a "pre-execution check"</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a record is opened, whether the party may read it, and keeping a record. Detection means finding a flaw after it already exists; here, the researchers' investigation and report did that. The dates below follow the disclosures.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the party's authority before a record is opened</div>
<div class="rx-zone gapz"><b>What the researchers reported</b><span>A test account got them in, and swapped IDs<br>reached other applicants' records</span></div>
<div class="rx-zone det"><b>Detection · research and report</b>The researchers find it and report to Paradox.ai and McDonald's</div>
<div class="rx-g g1"><div class="t">2019</div><b>A test account is created and left in place</b></div>
<div class="rx-g g2"><div class="t">2025-06-30</div><b>The researchers enter the admin console</b></div>
<div class="rx-g g3"><div class="t">06-30</div><b>They confirm records are reachable and report it</b></div>
<div class="rx-g g4"><div class="t">06-30</div><b>Paradox.ai disables the account and fixes it</b></div>
</div>
</figure>

The researchers' investigation and report showed the flaw concretely and led to a same-day fix, but they found it after the flaw already existed. A case where reads happened with no authority check is [the DeepSeek database](https://lemma.frame00.com/critical/briefs/057-deepseek-clickhouse-exposed-db/) (exposed without authentication). The point that stored personal data itself became the breach surface echoes [the Coinbase KYC breach](https://lemma.frame00.com/critical/briefs/013-coinbase-kyc-insider-breach/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before the admin console returns a record.** It does not find intrusions or flaws; it checks, before a record is opened, whether the party holds authority over that record.

### Industries and operations to watch

- **Industry · AI**: AI services that collect applicants' personal data at scale, such as hiring chatbots, and the organizations that deploy them.
- **Operation · Accounts & permissions**: Issuing and reviewing admin-console accounts, and the credentials of test and system accounts.
- **Operation · Lookup & data access**: Opening an applicant's record by ID in an admin console.

### Current controls vs Lemma

Column 1 is getting into the admin console, and column 2 is opening a record by ID once inside. In the researchers' account, this case went through both columns.

| Control | Admin console login | Record lookup by ID |
| --- | --- | --- |
| Outside researchers' investigation and report, and a bug bounty | Partial | Partial |
| Reviewing admin accounts and disabling test accounts | Effective | Not relevant |
| Per-record authority checks inside the application | Not relevant | Effective |
| **Lemma (pre-execution check)** | Not relevant | Effective |

Research and reporting find flaws and prompt fixes, but they work after the flaw already exists. Reviewing accounts removes a leftover test account from the entry, but leaves the separate flaw of swapped IDs. Per-record authority checks are the layer the researchers' second finding points to; where they work, records the party has no authority over are not returned. Lemma checks the party's authority before a record is returned, separately from the application. If it shows only that a lookup was within the party's authority, applicants' personal data need not leave the system.

Note: Lemma's check works only when it is built in just before records are returned, and which party may read which records is managed separately from the application. If the credentials of an account that does hold authority over those records are guessed or stolen, the lookup can pass this check. Finding and disabling weak credentials is the job of account reviews; Lemma does not replace them. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three items to confirm about admin consoles that hold applicants' or other personal data

- Do you review admin-console accounts regularly and disable unused test accounts?
- Do you test, before release, that a lookup with a swapped ID returns no record the party lacks authority over?
- Do you record which party opened which record under which authority?

## 5. Facts and timeline

- **Target**: McHire (McDonald's job-application platform) and Paradox.ai's AI recruiting chatbot "Olivia."
- **Discoverers**: Ian Carroll and Sam Curry (security researchers).
- **Entry**: In the researchers' account, the admin login had a valid account whose username and password were both "123456," reportedly a test account left in place since 2019.
- **Record lookups**: Once inside the admin console, an IDOR let them retrieve records by incrementing applicant IDs, the researchers report.
- **Scale**: Up to 64 million application records, including names, email addresses, phone numbers, interview (chat) transcripts and IP addresses (the researchers' account and CSO Online).
- **Company's account**: Paradox.ai says only the researchers actually accessed any data, and that they viewed only a small number of records.

### Timeline

- **2019**: The test account is reportedly created and remains active afterward.
- **2025-06-30**: Ian Carroll and Sam Curry enter the McHire admin console, confirm that applicant records are reachable, and report it to Paradox.ai and McDonald's.
- **2025-06-30**: Paradox.ai disables and fixes the account the same day and opens a bug bounty.
- **Thereafter**: The case is logged in the AI Incident Database as Incident #1179.

> The technique and figures rest on the researchers' account (Ian Carroll) and press coverage. The 64 million is the upper bound of records said to be within reach, not a count of records retrieved. Who accessed data and how many records were viewed rest on Paradox.ai's account. This Brief does not assert whether harm occurred and does not blame Paradox.ai or McDonald's. What has not been disclosed does not mean no measures were in place.

### Response after disclosure

- **Paradox.ai**: Disabled and fixed the account on the day of the report and opened a bug bounty. Says only the researchers accessed any data.
- **Record**: The AI Incident Database logged the case as Incident #1179.

## 6. Sources

- **Ian Carroll**: "Hacking McDonald's McHire / Paradox.ai" (the researchers' original account of the discovery and technique; 2025-06-30) — <https://ian.sh/mcdonalds>
- **AI Incident Database**: Incident #1179 (McHire / Paradox.ai) — <https://incidentdatabase.ai/cite/1179/>
- **CSO Online**: "McDonald's AI hiring tool's password '123456' exposed data of 64M applicants" (scale and timeline) — <https://www.csoonline.com/article/4020919/mcdonalds-ai-hiring-tools-password-123456-exposes-data-of-64m-applicants.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
