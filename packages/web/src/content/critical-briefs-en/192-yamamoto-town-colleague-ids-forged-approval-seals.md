---
brief_no: 192
title: "山元町：職員が他の職員の ID で庁内フォルダに入り、公印と上司の印影で未決裁の文書を決裁済みとして使った(町の公表)"
title_en: "Yamamoto Town: An employee entered shared folders with colleagues' IDs and used the official seal and forged superiors' seals to pass unapproved documents as approved (town disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth]
incident_date: 2026-07-31
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["190-iwai-cosmo-tradeworks-admin-function-unintended-orders", "152-denmark-cpr-lawful-access-misuse", "157-met-police-auror-unapproved-platform", "134-tokyo-housing-supply-corp-label-misdirection"]
status: draft
draft_fixed:
  - date: 2026-11-08
    note: "“The approver’s own record” → “the approver’s own key signature” (11 places)"
version: "1.0"
og_lead_ja: "宮城県山元町、職員が他の職員の ID で庁内フォルダに不正アクセスし、公印と偽造した印影で未決裁の文書を決裁済みとして使用。免職"
og_lead_en: "Yamamoto Town, Japan: an employee used colleagues' IDs on shared folders and forged seals to pass unapproved documents as approved; dismissed"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "内部不正事例 · 自治体"
og_kicker_en: "INSIDER MISUSE · MUNICIPALITY"
og_headline_ja: "他の職員の ID と、\n上司の印影で、\n文書が決裁済みになった。\n<accent>職員を免職</accent>"
og_headline_en: "Colleagues' IDs and forged\nseals made unapproved\ndocuments approved.\n<accent>Employee dismissed.</accent>"
key_figures:
  - value: "2"
    unit: "contractors"
    label: "Contractors handed contracts bearing the official seal (the mayor's seal) used without the required procedure (construction and outsourced work; town disclosure)"
    tone: "alert"
  - value: "2"
    unit: "superiors"
    label: "Superiors whose seals were forged (one forged seal was used to pass an unapproved document as approved)"
  - value: "06 → 10"
    label: "From the unauthorized access with colleagues' IDs (June–July 2026) to the dismissal (16 October) and the disclosure (20 October)"
glossary:
  - term: "Approval (kessai)"
    desc: "The procedure by which an authorised person approves a document's contents. In Japanese local government it is usually shown by the approver's seal impression on the document."
  - term: "Official seal"
    desc: "A seal such as the mayor's seal that the organisation affixes to contracts and notices to show they are its own act. Its use requires a procedure."
insight:
  slug: "seal-is-not-approver"
  stop: true
  label: "A seal does not show the approver"
  quote: "Before using an approved document or a contract bearing the official seal, check that the approval carries the approver's own key signature, against the approval record rather than the seal on the paper."
industries: ["public-sector"]
operations: ["approval", "data-access"]
controls:
  - slug: "verify-entry"
    item: "Let operations on shared folders and approval systems through only when they are signed with the ID owner's own key, such as a staff card or biometrics"
  - slug: "limit-and-revoke"
    item: "Give the official seal and approval rights only to people who have gone through the procedure, and leave no way to use another employee's device or ID"
  - slug: "hold-unverified"
    item: "Hold, before issue and use, any approved document or contract that does not carry the approver's own key signature"
  - slug: "audit-trail"
    item: "Record, apart from the document, who approved or sealed which document from which device and ID"
attack_method: "privilege-abuse"
impact: "Data in the town's shared and personal folders was viewed and deleted with colleagues' IDs, contracts bearing the official seal were handed to 2 contractors, and an unapproved document was used as approved under a forged seal (town disclosure)"
takeaway: "Colleagues' IDs and devices opened the shared folders, and the official seal and forged seals passed an unapproved document as approved. Give an approval or a seal effect only after checking the approver's own key signature."
self_check: "Do you know whether an approval seal or the official seal on a document ties to a record signed with the approver's own key (who, when, from which device)?"
countries: ["jp"]
search_title: "山元町職員の不正アクセスと印影偽造：公表の経緯"
search_description: "宮城県山元町で、職員が他の職員の ID で庁内フォルダに不正アクセスし、公印と上司の印影を偽造して未決裁の文書を決裁済みとして使った（町の公表・免職）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

An employee of Yamamoto Town, Miyagi Prefecture, entered the town's shared folders and other employees' personal folders with colleagues' IDs and passwords in June and July 2026, and viewed and deleted data (town disclosure). The employee also used other employees' terminals without permission and entered the town hall at night and on holidays.

The same employee handed contracts bearing the official seal (the mayor's seal), used without the required procedure, to two contractors, forged the seals of two superiors, and used one of them to pass an unapproved document as approved. Revenue stamps were forged too. The town dismissed the employee as of 16 October and reprimanded a section chief and a team leader for supervisory responsibility.

<strong>A seal impression or an official seal does not show that the person who pressed it is the approver.</strong>

## 2. What got through

- **What got through**: Two things. One is access to shared folders and personal folders with other employees' IDs and passwords (viewing, operating on and deleting data). The other is the issue and use of documents bearing the official seal and forged seals: contracts with the official seal reached two contractors, and an unapproved document was used as an approved one (town disclosure).
- **What reached the accepting side**: In general, a shared folder receives only an ID and a password, not who is at the terminal. The recipient of a contract or an approved document receives only the seal impression, not whether the approver pressed it. According to the town, the seals were forged, and revenue stamps were forged by scanning stamps from stamped documents and altering them.
- **Not disclosed**: What the viewed and deleted data contained (whether it included personal data). Whether the deleted data was recovered. Who received the contracts, and their contents and amounts. What kind of document was passed as approved. How it came to light. Any report to the police. Motive. Specific measures to prevent recurrence.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before an approved document or a contract bearing the official seal is used, the approval is checked as carrying the approver's own key signature, against an approval record kept apart from the seal on the paper.

- **Who approves**: The approver (the person with approval authority, and the custodian of the official seal). Approvals and seal use are recorded as operations signed with a key only the person holds (a staff card or biometrics). The seal impression is only a copy of that record.
- **Where it is checked**: The step that issues a document, and the step that uses an approved document in the next procedure. If the approval does not carry the approver's own key signature, issue and use are held. Access to shared folders is likewise let through only after checking against the ID owner's own key. An ID and password, even if known, do not stand in for that key.
- **What is recorded**: Who approved or sealed which document, when, and from which device and ID. That record can show, for explanations to counterparties, disciplinary action or a criminal complaint, whether the approval was the approver's own.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking an approved document or a sealed document for the approver's own key signature before using it, and keeping a record. Detection means noticing the unauthorized access or the forgery afterwards. Dates rely on the town's disclosure (how it came to light is not disclosed).</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check approvals and seals for the approver's own key signature before using the document</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Sealed contracts reached two contractors<br>An unapproved document was used as approved</span></div>
<div class="rx-zone det"><b>Detection · how is not disclosed</b>The town establishes the facts and disciplines the employee as of 16 October</div>
<div class="rx-g g1"><div class="t">06</div><b>Shared folders entered with colleagues' IDs</b></div>
<div class="rx-g g2"><div class="t">07</div><b>Town hall entered at night; colleagues' terminals used</b></div>
<div class="rx-g g3"><div class="t">10-16</div><b>Dismissal, and reprimands for supervisors</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>The town discloses</b></div>
</div>
</figure>

How it came to light has not been disclosed. Cases where legitimate rights or an operations channel were used without the person's request include [Iwai Cosmo Securities](/critical/briefs/190-iwai-cosmo-tradeworks-admin-function-unintended-orders/) (orders through a vendor's admin function) and [Denmark's CPR](/critical/briefs/152-denmark-cpr-lawful-access-misuse/) (misuse of a lawful lookup right). A public-sector case where a procedure went ahead without the approval status being conveyed is the [Metropolitan Police](/critical/briefs/157-met-police-auror-unapproved-platform/) (a platform wrongly conveyed as "approved"), and a case at a municipal housing corporation where mailing labels went astray is the [Tokyo Metropolitan Housing Supply Corporation](/critical/briefs/134-tokyo-housing-supply-corp-label-misdirection/). Here, both the use of IDs without the owner's authentication and seals without the approver went through.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that receives and uses approved documents and documents bearing the official seal.** It does not tell genuine seals from forged ones; it checks, before issue and use, that the approval carries the approver's own key signature.

### Industries and operations to watch

- **Industry · Local government and public bodies**: Organisations that give contracts and documents effect through paper approvals and an official seal. Shared folders are often reachable with an ID and a password alone.
- **Operation · Approval**: Circulating documents for approval, affixing the official seal, issuing contracts.
- **Operation · Data access**: Shared folders and employees' personal folders.

### Current controls vs Lemma

The route in this case covers both column 1 (use of colleagues' IDs and terminals) and column 2 (forged seals and unauthorised use of the official seal). Column 3 covers an approver who improperly approves under their own authority; nothing disclosed says that happened here.

| Control | Use of colleagues' IDs and terminals | Forged seals and unauthorised official seal | Improper approval by the approver | 
| --- | --- | --- | --- |
| Authentication by ID and password | Not effective | Not effective | Not effective |
| Locking the official seal and keeping a usage log | Not effective | Partial | Not effective |
| Visual check of seal impressions | Not effective | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

An ID and password let through anyone who knows them and show nothing about who is at the terminal (here colleagues' IDs and terminals were used). Locking the seal and keeping a usage log leave no trace when the procedure is skipped (the town says the seal was used "without permission, neglecting the procedure"). A visual check cannot easily tell a seal scanned from paper from a genuine one. Lemma checks, before a document is used, not the seal or the ID but whether the approval carries the approver's own key signature.

Note: Lemma's check works only when approvals and seal use are recorded as operations signed with the person's own key, and the check is built into the step that uses the document. An approver who approves improperly under their own authority, or anyone holding the person's key itself, can pass this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions or unauthorised entry, and it does not recover deleted data.

### Checklist

Three things to confirm about approvals and shared folders

- Do you use approved documents and documents bearing the official seal only when tied to a record signed with the approver's own key (who, when, from which device)?
- Is access to shared and personal folders tied to the person's own device or multi-factor authentication, not only to an ID and a password?
- Is there a procedure to record and review entry to the building and folder access outside working hours?

## 5. Facts and timeline

- **Party**: Yamamoto Town, Miyagi Prefecture (the mayor's administrative departments).
- **What happened**: According to the town, a clerk (26) in the mayor's administrative departments, in June and July 2026, repeatedly accessed the town's shared folders outside working hours from his own terminal with other employees' IDs and passwords, and viewed and operated on data. He also used other employees' terminals without permission and, with their IDs and his own, repeatedly accessed shared folders and personal folders and viewed, deleted and otherwise handled data. In the July case involving another employee's terminal, he entered the town hall at night through a ground-floor door he had unlocked in advance, and on a holiday had another employee on holiday duty unlock the door and entered after that employee had left. He also used the official seal (the mayor's seal) without permission, neglecting the procedure, and handed contracts bearing it to two contractors for construction and outsourced work. He forged the seals of two superiors and used one of them to pass an unapproved document as approved. He forged revenue stamps by scanning the stamp from a stamped document and altering it, and used the forged stamps to falsify documents submitted by contractors.
- **How it was found**: Not disclosed.
- **Impact and response**: The town found the conduct fell under Article 29(1), items 1 (breach of the duty to obey laws), 2 (breach of duties of office) and 3 (misconduct unbecoming a servant of the whole community) of the Local Public Service Act, and dismissed the employee as of 16 October. For supervisory responsibility it reprimanded a section-chief-level employee (56) and a team leader (48). The contents of the viewed and deleted data, and the counterparties and amounts of the contracts, have not been disclosed.

### Timeline

- **June–July 2026**: Outside working hours, repeatedly accesses shared folders from his own terminal with other employees' IDs and passwords, and views and operates on data.
- **July 2026**: Enters the town hall at night and on a holiday, uses other employees' terminals without permission, and views, deletes and otherwise handles data in shared and personal folders.
- **Dates not disclosed**: Unauthorised use of the official seal and issue of contracts, forgery of two superiors' seals, use of an unapproved document, forgery of revenue stamps.
- **2026-10-16**: The town dismisses the employee and reprimands the section chief and the team leader.
- **2026-10-20**: The town discloses the action under its publication standards. The mayor apologises and commits to compliance and discipline.

> The facts rely on the town's disclosure (primary; "Disciplinary action against Yamamoto Town employees, case 2"). The disclosure states the facts as grounds for the action; it does not state what the data contained, the counterparties and amounts of the contracts, how the conduct came to light, any report to the police, or specific measures to prevent recurrence. It also gives no dates for the seal forgery and the use of the official seal. The first case disclosed the same day is a separate matter. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the town's response or the employee.

### After disclosure

- **Yamamoto Town**: The mayor apologised for the two cases as a "betrayal of the townspeople" and said the town would enforce compliance and discipline to restore trust. For supervisory responsibility, the employees concerned were also disciplined.

## 6. Sources

- **Yamamoto Town (Primary, disclosure page)**: 「山元町職員の懲戒処分等を公表します」 (2026-10-20) — <https://www.town.yamamoto.miyagi.jp/soshiki/1/22474.html>
- **Yamamoto Town (Primary, disclosure PDF)**: 「山元町職員の懲戒処分等の公表（２件目）」 (2026-10-20) — <https://www.town.yamamoto.miyagi.jp/uploaded/attachment/21914.pdf>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
