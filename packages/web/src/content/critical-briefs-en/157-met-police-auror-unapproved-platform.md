---
brief_no: 157
title: "ロンドン警視庁：警官と職員が、承認されていない外部の基盤 Auror に自分で登録し、容疑者の個人情報を載せた(英 ICO の処分) — 外部の基盤が承認済みかを、使う時点で照合する層が無い"
title_en: "Metropolitan Police: Officers signed themselves up to Auror, an unapproved outside platform, and uploaded suspects' data (UK ICO action) — Nothing checks at the point of use whether a platform is approved"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [identity-auth]
incident_date: 2024-08-29
published: 2026-10-23
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["142-awa-bank-test-environment-repurposed-leak", "152-denmark-cpr-lawful-access-misuse"]
status: published
version: "1.0"
og_lead_ja: "ロンドン警視庁、未承認の外部基盤に約 500 アカウント・179 人分の個人情報（英 ICO）"
og_lead_en: "Met Police: about 500 accounts and data on 179 people on an unapproved platform (ICO)"
layout: "report"
og_kicker_ja: "情報管理の事例 · 未承認ツールの利用"
og_kicker_en: "DATA GOVERNANCE · UNAPPROVED TOOL"
og_headline_ja: "承認されていない外部の基盤に、\n警官が自分でアカウントを作った。\n<accent>179 人分の個人情報を掲載</accent>"
og_headline_en: "Officers signed themselves up\nto an unapproved outside platform.\n<accent>Data on 179 people uploaded.</accent>"
summary_labels: ["What happened", "How it spread", "The missing layer"]
key_figures:
  - value: "179"
    unit: "people"
    label: "People (shoplifting suspects) whose personal data was uploaded to Auror, three of them under 18. Besides names, some entries included dates of birth or addresses"
    tone: "alert"
  - value: "~500"
    unit: "accounts"
    label: "Accounts officers and staff created with Met email addresses, 375 of them actively used"
  - value: "2023-03 → 2024-09"
    label: "How long Auror was used without Met approval (per the ICO announcement)"
glossary:
  - term: "ICO"
    desc: "The UK Information Commissioner's Office, which oversees data protection."
  - term: "Auror"
    desc: "A cloud platform where retailers log crimes such as shoplifting and share them with police. In the UK it is run by Auror Europe Limited, a subsidiary of New Zealand's Auror. Police accounts are free."
  - term: "DPIA"
    desc: "A data protection impact assessment: evaluating risks and safeguards before introducing new processing of personal data. The law requires it for high-risk processing."
  - term: "Reprimand and enforcement notice"
    desc: "A reprimand formally censures past breaches. An enforcement notice orders action, with deadlines, on failures that are still ongoing."
insight:
  slug: "outside-platform-approval-not-checked-at-use"
  label: "Outside platform approval not checked at the point of use"
  quote: "Being able to sign up with a work email did not mean the organisation had approved the platform. That difference was asked neither when accounts were created nor when data was uploaded."
industries: ["public-sector", "retail"]
operations: ["disclosure", "approval"]
controls:
  - slug: "hold-unverified"
    item: "Do not upload personal data to an outside platform until it is checked as approved"
  - slug: "audit-trail"
    item: "Record what went to which platform, under which approval"
attack_method: "human-error"
impact: "Personal data on 179 people uploaded to an unapproved outside platform"
takeaway: "Whether the outside platform was approved was asked neither at sign-up nor at upload."
self_check: "Do you know which outside services have been signed up to with your organisation's email addresses?"
---

## 1. TL;DR

On October 14, 2026, the UK Information Commissioner's Office (ICO) announced a reprimand and enforcement notice against the Metropolitan Police Service (MPS). From March 2023 to September 2024, officers and staff used Auror, a retail crime intelligence platform the Met had not approved, creating about 500 accounts. In 2024, personal data on 179 shoplifting suspects was uploaded, three of them under 18.

Officers, encouraged by retailers, used QR codes sent by the operator to create their own accounts with Met email addresses. Some began after a former officer's account of it. By the Met's account, the site carried the Met's logo and statements that the Met was a customer, and its URL filter classed the site as professional services and did not block it (per the ICO).

The Met noticed through internal reports and blocked access, but data on 179 people had already been uploaded. What failed was the layer that checks, at sign-up and at upload, whether an outside platform is approved.

## 2. What happened

- **The organisation**: The Metropolitan Police Service (MPS). The ICO acted under Part 3 of the Data Protection Act 2018, which covers processing for law enforcement.
- **Auror's status**: The Met had not procured, approved or adopted Auror as an organisation, and there was no contract or information-sharing agreement (per the ICO). An approval board on June 27, 2023 reviewed only the mobile app and approved it with caveats, but the app was blocked by the Met's own IT controls. The browser version officers actually used never went through any approval process (per the ICO).
- **The approval process**: No one from the data protection team attended the board. The person requesting approval decided whether a DPIA was needed, wrote that it was not, and this was not challenged. The board took the former officer's statement that the platform was already in use through a browser to mean it was approved, and did not check (per the ICO).
- **Accounts**: About 500 between March 2023 and September 2024, 375 of them active. Because people registered individually, the Met had no central record of use. The first use the Met knows of is January 2024, but the ICO says use from March 2023 is "possible".
- **What was uploaded**: Officers identified suspects they recognised in retailers' CCTV images and uploaded their details. Of the 179 people, 128 had names only, 49 names and dates of birth, and 2 also home addresses. A small number of entries referred to the use of facial recognition. 59 people were arrested, charged, convicted or circulated as wanted as a result of being identified on the platform (the Met's internal analysis, cited by the ICO).
- **The ICO's findings**: Sharing dates of birth and addresses when names would have done was unnecessary, and so unlawful. There were no appropriate technical or organisational measures, and no DPIA before high-risk processing. Measures to make sure only approved technology is used are still lacking, so the ICO issued an enforcement notice (per the ICO).
- **Reporting and notification**: No personal data breach report was submitted. The Met judged there was no high risk requiring notification to individuals (per the ICO).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, following the ICO notice</span></div>
<p class="rx-ex-cap">The stopping points are ② and ③. Had signing up with a work email and uploading personal data each been checked against whether the platform was approved, an unapproved platform would have been stopped.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Retailers / operator</div><div class="no">1</div><b>Recommend Auror to officers and send sign-up QR codes</b><p>By the Met's account, the site carried its logo.</p></div>
<div class="rx-step crit"><div class="who">Officers / staff</div><div class="no">2</div><b>Create their own accounts with Met email addresses</b><p>About 500. Wrongly told it was approved.</p></div>
<div class="rx-step crit"><div class="who">Officers / staff</div><div class="no">3</div><b>Upload suspects' names and other details</b><p>179 people in 2024.</p></div>
<div class="rx-step"><div class="who">Met</div><div class="no">4</div><b>An internal security incident is reported and access is blocked</b><p>Reported August 29, 2024; blocked September 26.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2023-03**: Auror is made available to officers (exact date unknown). The ICO says use from this point is possible but not proven.
- **2023-06-27**: An approval board reviews the Auror mobile app. The data protection team is not present.
- **2024-01**: The first use the Met knows of. Per the ICO announcement, data on the 179 people was uploaded between January and September.
- **2024-08-29**: The first security incident report: an officer had uploaded the names of suspects they recognised.
- **2024-09-26**: A second report notes the platform "has not been approved" by cyber security, and access is blocked the same day.
- **2024-10**: Staff are told to stop using it.
- **2024-12**: The ICO learns of it while talking with the Met's data protection officer about another matter.
- **2025-04-10**: The ICO opens a formal investigation.
- **2025-12-11**: The Met signs a formal contract with Auror.
- **2026-01-26**: Use resumes after a DPIA.
- **2026-09-23**: The ICO issues the reprimand and enforcement notice.
- **2026-10-14**: The ICO publishes it.

> The facts rest on the ICO's reprimand and enforcement notice (47 pages) and its announcement (both primary). The announcement ends the account and upload periods in September; parts of the notice say October. We could not find statements from the Met or Auror on the action. The notice does not say whether the uploaded data was deleted on Auror's side.

### After disclosure

- **The Met**: Accepted the provisional findings, including that governance at the time was insufficient. It set up a Commander-led Gold Group, had Auror remove the Met's logo (confirmed November 5, 2024) and asked Auror for the shared data. It found no retailer had used the data to ban anyone, take civil action or share it further (per the ICO).
- **Use since reinstatement**: Officers can only view; they cannot upload or enter free text. Training is required first, and the Met can audit use (per the ICO).
- **What the enforcement notice requires**: Within three months (then at least annually), identify unapproved outside platforms in use and review and revise the approval process. Within six months, assess and approve each one or block it technically, set standard controls for sharing with third parties, and review training. Within twelve months, test that the measures work. The Met must send the ICO periodic updates (per the ICO).

## 4. Why it wasn't stopped

This case was not about missing policy. Whether the outside platform was approved was asked neither when accounts were created nor when personal data was uploaded.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof here means checking, before signing up to an outside platform and uploading personal data, "is this platform approved by the organisation?", and recording it. Detection means noticing through internal reports after the data is uploaded.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Before use, check the platform is approved</div>
<div class="rx-zone gapz"><b>The gap</b><span>Data on 179 people<br>uploaded</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>An internal report leads to a block</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Accounts created</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Personal data uploaded</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>08-29 incident report</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>09-26 blocked</b></div>
</div>
</figure>

Internal reporting worked and the Met blocked access, but it noticed after data was uploaded, and blocking took about another month (the ICO said no explanation was given). "Could sign up with a Met email" and "is a platform the Met approved" are separate facts, and the ICO notice shows no layer checking the first against the second. That distance is the **detection–proof gap**, and it is a structural one.

The same structure appears in [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/) (an environment still holding customer data stayed in other use without anyone re-confirming it should).

## 5. How to counter this

**When staff sign up to an outside platform, and when they upload personal data to it, check that the platform is approved by the organisation.** Then a handy outside service can spread on the front line without data going to an unapproved platform. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · Government & public sector**: Police forces and local governments where staff readily start using handy outside services. The ICO called it a repeat of the type of incident behind its December 2021 reprimand of the Met over Clearview AI facial recognition.
- **Industry · Services & retail**: Retailers that share crime intelligence with police and government, and the companies running the sharing platforms. Here the operator sent officers sign-up QR codes.
- **Operation · Disclosure & data release**: Uploading personal data to outside platforms. The ICO found sharing dates of birth and addresses, when names would have done, unlawful.
- **Operation · Approval & sign-off**: Approving new tools. Only the requester decided whether a DPIA was needed, and data protection staff were absent from the board.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Policy | Partial | The ICO said the policy itself was appropriate, but it was not backed by technical measures or training. |
| URL filter | Ineffective | By the Met's account, the site was classed as professional services and was not stopped. |
| Approval board | Partial | It reviewed only the mobile app; the browser version used never went through the process. |
| Internal incident reports | Partial | They noticed after uploads, and blocking took about a month. |

### What is needed

1. **Limit outside sign-ups with work email to approved services.** Do not let sign-ups to services off the approved list go through on an individual's judgement.
2. **Before personal data goes to an outside platform, check that the platform is approved and that each field is needed for the purpose.** Here the ICO judged dates of birth and addresses were not needed.
3. **Keep, on the organisation's side, what went to which platform under which approval.** Here individual sign-ups left no record, and even when use began could not be confirmed. Keep it in a form that can be checked later: in other words, as proof.

### Checklist

Three things to confirm in your organisation about outside services

- Can anyone create accounts on outside services with an organisation email address?
- When approving a new tool, does only the requester decide whether an impact assessment is needed?
- Can you technically block traffic to services you have not approved?

Note: misuse inside an approved platform, or uploading fields that are not needed, is not stopped by this check alone. Use from personal devices or personal accounts bypasses the organisation's check.

## 6. Sources

- **ICO (Primary, reprimand and enforcement notice)**: "Metropolitan Police Service – Reprimand and Enforcement Notice" (2026-09-23) — <https://ico.org.uk/media2/a5tcelok/metropolitan-police-service-reprimand-and-enforcement-notice.pdf>
- **ICO (Primary, announcement)**: "ICO takes action against Metropolitan Police Service" (2026-10-14) — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/ico-takes-action-against-metropolitan-police-service-over-information-governance-failures/>
- **ICO (Primary, enforcement listing)**: "Metropolitan Police Service" (reprimand and enforcement notice, 2026-09) — <https://ico.org.uk/action-weve-taken/enforcement/2026/09/metropolitan-police-service-reprimand/>
- **Auror (Primary, operator announcement, background)**: "Auror rolls out across London to take on repeat offenders and organised retail crime" (2026-04-28) — <https://www.auror.co/media-center/auror-rolls-out-across-london-to-take-on-repeat-offenders-and-organised-retail-crime>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
