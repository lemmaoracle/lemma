---
brief_no: 157
title: "ロンドン警視庁：「承認済み」と誤って伝わった外部の基盤に、警官らが容疑者の情報を載せた(英 ICO の処分)"
title_en: "Metropolitan Police: Officers put suspects' data on an outside platform wrongly said to be approved (UK ICO action)"
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
og_lead_ja: "ロンドン警視庁、「承認済み」と誤って伝わった外部基盤に 179 人分の個人情報（英 ICO）"
og_lead_en: "Met Police: data on 179 people put on a platform wrongly said to be approved (ICO)"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報管理の事例 · 未承認ツールの利用"
og_kicker_en: "DATA GOVERNANCE · UNAPPROVED TOOL"
og_headline_ja: "「承認済み」と誤って\n伝わった外部の基盤に、\n警官らが登録した。\n<accent>179 人分の個人情報を掲載</accent>"
og_headline_en: "Officers joined a platform\nwrongly said to be approved.\n<accent>Data on 179 people uploaded.</accent>"
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
  quote: "Being able to sign up to an outside platform with a work email does not mean the organisation approved it, and that difference stays invisible unless someone asks."
industries: ["public-sector", "retail"]
operations: ["disclosure", "approval"]
controls:
  - slug: "hold-unverified"
    item: "Do not upload personal data to an outside platform unless it can be confirmed as approved"
  - slug: "audit-trail"
    item: "Record what went to which platform, under which approval"
attack_method: "human-error"
impact: "Personal data on 179 people uploaded to an unapproved outside platform"
takeaway: "Whether the outside platform was approved was asked neither at sign-up nor at upload."
self_check: "Do you know which outside services have been signed up to with your organisation's email addresses?"
countries: ["gb"]
---

## 1. Summary

Officers and staff created accounts on Auror, a retail-crime information-sharing platform the Met had not approved, using their Met email addresses. By the Met's account, the site carried the Met's logo and said the Met was a customer. Per the ICO, the approval board reviewed only the mobile app, and the browser version actually used never went through any approval process. <strong>Being able to sign up to an outside platform with a work email does not mean the organisation approved it, and that difference stays invisible unless someone asks.</strong>

## 2. What got through

- **What got through**: Account sign-ups to the outside platform Auror with Met email addresses, and the upload of suspects' personal data to it (per the ICO).
- **What was not stopped / what stopped it**: The URL filter classed the site as professional services and did not block it (per the Met and the ICO). The Met noticed through an internal security incident report and blocked access on September 26, 2024 (per the ICO).
- **What reached the receiving side**: In general, a sign-up with a work email reaches the operator as a registration by that organisation's staff. Whether the organisation approved the platform cannot be told from the sign-up or from the upload.
- **Not disclosed**: Statements from the Met and Auror on the action; whether the uploaded data was deleted on Auror's side. Use from March 2023 is "possible" but not proven (per the ICO).

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever accepts outside sign-ups with work email, and uploads of personal data to outside platforms, checks before the sign-up or upload that the platform is on the organisation's approved list and that each field is needed for the purpose.

- **Who approves**: The organisation's information governance and security function. It keeps the list of approved outside platforms apart from whoever requests approval, and the requester alone does not decide whether a DPIA is needed.
- **Where it is checked**: At the entry for outside sign-ups with work email, and just before personal data leaves for an outside platform. Sign-ups and uploads to platforms not on the list do not go through, and whether each field is needed for the purpose is checked too.
- **What is recorded**: What went to which platform under which approval, kept on the organisation's side, apart from individual sign-ups.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before signing up to an outside platform or uploading personal data, that the platform is approved by the organisation, and keeping a record. Detection means noticing afterwards through an internal report. The dates below are when the Met and the ICO confirmed or disclosed each point, not when the sign-ups or uploads took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before use, check that the platform is approved</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>About 500 accounts<br>Data on 179 people uploaded</span></div>
<div class="rx-zone det"><b>Detection · noticed</b>Noticed through an internal incident report, then blocked</div>
<div class="rx-g g1"><div class="t">2024-08-29</div><b>First incident report</b></div>
<div class="rx-g g2"><div class="t">2024-09-26</div><b>Access blocked</b></div>
<div class="rx-g g3"><div class="t">2026-09-23</div><b>ICO issues its action</b></div>
<div class="rx-g g4"><div class="t">2026-10-14</div><b>ICO publishes it</b></div>
</div>
</figure>

The internal report worked and the Met blocked access, but it noticed after the uploads, and blocking took about a month more (the ICO says no explanation was given). A similar case, where an environment still holding customer data was kept in use for another purpose without anyone re-confirming it was allowed, is [the Awa Bank test environment](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the check in section 03 into outside sign-ups with work email and the point just before personal data leaves.** It does not look for intrusions; it checks, before the sign-up or upload, whether the platform is on the organisation's approved list.

### Industries and operations to watch

- **Industry · Public sector**: Police and local governments, where staff easily start using convenient outside services on their own. The ICO pointed out that this repeats the same type of case as Clearview AI, the facial-recognition matter for which it reprimanded the Met in 2021.
- **Industry · Services & retail**: Retailers that share crime information with police and government, and the companies that run the sharing platforms. Here the operator sent officers a QR code to register.
- **Operation · Disclosure**: Putting personal data on an outside platform. The ICO found it unlawful to share dates of birth and addresses when names would have done.
- **Operation · Approvals**: Approving a new tool. The requester alone decided whether a DPIA was needed, and no one from data protection was at the board.

### Current controls vs Lemma

The route in this case is column 1 (sign-ups to outside platforms with work email) and column 2 (uploading personal data to them). Column 3 is use from personal devices or personal accounts; whether that applied here has not been disclosed.

| Control | Sign-up to an outside platform with work email | Uploading personal data to the platform | Use from personal devices or accounts |
| --- | --- | --- | --- |
| Policy | Partial | Partial | Not relevant |
| URL filter | Not effective | Not relevant | Not relevant |
| Approval board | Partial | Not relevant | Not relevant |
| Internal incident reports | Not relevant | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

The ICO said the policy itself was appropriate, but it was not backed by technical measures or training. By the Met's account, the URL filter classed the site as professional services and did not stop it. The approval board reviewed only the mobile app, and the browser version used never went through the process. Internal incident reports noticed after uploads, and blocking took about a month. Lemma checks, before sign-up or upload, that the platform is on the approved list and that each field is needed for the purpose.

Note: Lemma's check works only when it is built into outside sign-ups with work email and the point just before personal data leaves, and the approved list is kept apart from whoever requests approval. Misuse inside an approved platform, or uploading fields that are not needed, is not stopped by this check alone. Use from personal devices or personal accounts bypasses the organisation's check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organisation about outside services

- Can anyone create accounts on outside services with an organisation email address?
- When approving a new tool, does only the requester decide whether an impact assessment is needed?
- Can you technically block traffic to services you have not approved?

## 5. Facts and timeline

- **The organisation**: The Metropolitan Police Service (MPS). The ICO acted under Part 3 of the Data Protection Act 2018, which covers processing for law enforcement.
- **Auror's status**: The Met had not procured, approved or adopted Auror as an organisation, and there was no contract or information-sharing agreement (per the ICO). An approval board on June 27, 2023 reviewed only the mobile app and approved it with caveats, but the app was blocked by the Met's own IT controls. The browser version officers actually used never went through any approval process (per the ICO).
- **The approval process**: No one from the data protection team attended the board. The person requesting approval decided whether a DPIA was needed, wrote that it was not, and this was not challenged. The board took the former officer's statement that the platform was already in use through a browser to mean it was approved, and did not check (per the ICO).
- **Accounts**: About 500 between March 2023 and September 2024, 375 of them active. Because people registered individually, the Met had no central record of use. The first use the Met knows of is January 2024, but the ICO says use from March 2023 is "possible".
- **What was uploaded**: Officers identified suspects they recognised in retailers' CCTV images and uploaded their details. Of the 179 people, 128 had names only, 49 names and dates of birth, and 2 also home addresses. A small number of entries referred to the use of facial recognition. 59 people were arrested, charged, convicted or circulated as wanted as a result of being identified on the platform (the Met's internal analysis, cited by the ICO).
- **The ICO's findings**: Sharing dates of birth and addresses when names would have done was unnecessary, and so unlawful. There were no appropriate technical or organisational measures, and no DPIA before high-risk processing. Measures to make sure only approved technology is used are still lacking, so the ICO issued an enforcement notice (per the ICO).
- **Reporting and notification**: No personal data breach report was submitted. The Met judged there was no high risk requiring notification to individuals (per the ICO).

### Timeline

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

> The facts rest on the ICO's reprimand and enforcement notice (47 pages) and its announcement (both primary). The announcement ends the account and upload periods in September; parts of the notice say October. We could not find statements from the Met or Auror on the action. The notice does not say whether the uploaded data was deleted on Auror's side. What has not been disclosed does not mean there were no controls.

### After disclosure

- **The Met**: Accepted the provisional findings, including that governance at the time was insufficient. It set up a Commander-led Gold Group, had Auror remove the Met's logo (confirmed November 5, 2024) and asked Auror for the shared data. It found no retailer had used the data to ban anyone, take civil action or share it further (per the ICO).
- **Use since reinstatement**: Officers can only view; they cannot upload or enter free text. Training is required first, and the Met can audit use (per the ICO).
- **What the enforcement notice requires**: Within three months (then at least annually), identify unapproved outside platforms in use and review and revise the approval process. Within six months, assess and approve each one or block it technically, set standard controls for sharing with third parties, and review training. Within twelve months, test that the measures work. The Met must send the ICO periodic updates (per the ICO).

## 6. Sources

- **ICO (Primary, reprimand and enforcement notice)**: "Metropolitan Police Service – Reprimand and Enforcement Notice" (2026-09-23) — <https://ico.org.uk/media2/a5tcelok/metropolitan-police-service-reprimand-and-enforcement-notice.pdf>
- **ICO (Primary, announcement)**: "ICO takes action against Metropolitan Police Service" (2026-10-14) — <https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/10/ico-takes-action-against-metropolitan-police-service-over-information-governance-failures/>
- **ICO (Primary, enforcement listing)**: "Metropolitan Police Service" (reprimand and enforcement notice, 2026-09) — <https://ico.org.uk/action-weve-taken/enforcement/2026/09/metropolitan-police-service-reprimand/>
- **Auror (Primary, operator announcement, background)**: "Auror rolls out across London to take on repeat offenders and organised retail crime" (2026-04-28) — <https://www.auror.co/media-center/auror-rolls-out-across-london-to-take-on-repeat-offenders-and-organised-retail-crime>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
