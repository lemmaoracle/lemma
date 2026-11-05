---
brief_no: 173
title: "Loblaw PC Optimum：退会した会員の購買の履歴などを残し続けていた(カナダ OPC の調査結果)"
title_en: "Loblaw PC Optimum: Purchase history and other data of closed accounts was kept (Canada OPC findings)"
pillar: 04-regulatory-attribute
primary_category: "kyc-aml-disclosure"
secondary_categories: [data-provenance]
incident_date: 2026-03-05
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["171-free-mobile-cnil-former-subscriber-retention", "142-awa-bank-test-environment-repurposed-leak", "052-discord-age-verification-id-leak"]
status: published
version: "1.0"
og_lead_ja: "カナダ OPC、Loblaw PC Optimum の退会後のデータ保存を認定。名前を外すだけでは匿名化に足りない"
og_lead_en: "Canada's OPC finds Loblaw PC Optimum kept closed-account data; removing names alone is not enough"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "調査結果 · 退会後の保存"
og_kicker_en: "PRIVACY FINDINGS · RETENTION"
og_headline_ja: "退会しても、\n購買の履歴は残った。\n<accent>会員 1,700 万人超</accent>"
og_headline_en: "Members left,\nbut purchase data stayed.\n<accent>17M+ members</accent>"
key_figures:
  - value: "17M+"
    label: "PC Optimum members (OPC)"
    tone: "alert"
  - value: "6"
    unit: "complaints"
    label: "Accepted by the OPC: members said they could not delete their account and purchase history"
  - value: "12"
    unit: "months"
    label: "Deadline, from the third-party report, to put the needed measures in place (Loblaw's commitment)"
glossary:
  - term: "OPC"
    desc: "The Office of the Privacy Commissioner of Canada. Under the private-sector privacy law (PIPEDA), it investigates complaints and issues findings and recommendations."
  - term: "Principle 4.5.3 (PIPEDA)"
    desc: "Personal information that is no longer needed for its purpose should be destroyed, erased, or made anonymous."
  - term: "Anonymization"
    desc: "Bringing retained data to a state where there is no serious possibility of re-identifying a person. Removing names alone may not achieve this."
insight:
  slug: "names-removed-not-anonymous"
  stop: true
  label: "What remains after names are removed"
  quote: "Before using data of members who have left, check each retained field against the reason and deadline set for it, not the keeper's explanation."
industries: ["retail"]
operations: ["data-access"]
controls:
  - slug: "minimize-data"
    item: "Keep only the fields from closed accounts that have a reason to stay, and assess whether people can still be traced once names are removed"
  - slug: "audit-trail"
    item: "Record, for each member, what was deleted and what was kept when the account was closed"
attack_method: "human-error"
impact: "Purchase history, usage records, IP addresses and other data of closed accounts were kept; the OPC found the anonymization insufficient"
takeaway: "The OPC found that deleting names and contact details on closure was not enough to anonymize the data. Loblaw disagrees, but agreed to a third-party assessment."
self_check: "For data kept from people who have left, do you assess whether the fields that remain after names are removed could re-identify someone?"
countries: ["ca"]
---

## 1. Summary

This is not a breach. It is a regulator's findings on how data of members who closed their accounts was handled. On closure, Loblaw deleted name, email, phone and address, and kept purchase history, usage records, public IP addresses, device information and more.

Canada's OPC found that removing names and contact details alone does not anonymize the data, and that this contravenes the principle on information that is no longer needed. Loblaw disagrees with that finding but agreed to a third-party assessment.

<strong>Deleting names and contact details does not always stop someone being traced if purchase history and IP addresses remain.</strong>

## 2. What got through

- **What went through**: Processing a member's account closure. Name, email, phone and address were deleted, and the email was replaced with a dummy address. Loyalty data, usage data (login status, hashed email, public IP address, pages viewed, device and browser, and more) and historical transaction data (product, quantity, amount, date, store, and more) were kept (OPC).
- **Why it was kept (Loblaw's explanation)**: Data analytics, program decisions, developing new products and services, and analyzing customer trends (OPC).
- **What the receiving side sees**: In general, a closure process ends once set fields are deleted. Whether the remaining fields can identify someone is not visible from the deleting step alone.
- **Not disclosed**: How long retained data is kept, how many accounts were closed, how much data was retained, and who the third-party assessor is and when it will report.

## 3. Pre-execution check

The condition that holds regardless of route: before fields kept after closure are used, check them against the reason and deadline set for each field, and against an assessment, made separately from the keeper, of whether they can re-identify anyone.

- **Who approves**: The organization that manages the personal information. It decides which fields to keep, for what, and until when. Whether the data counts as anonymized is assessed by someone other than the keeper (in this case's recommendation, a third party).
- **Where to check**: Before the data kept after closure is used, for analytics or anything else. Check that the retained fields are within the decided scope and deadline.
- **What is recorded**: For each member, what was deleted and what was kept at closure, in a form that lets manual errors be found later. Per the OPC, one complainant's name ended up in a dummy address.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Figure 1</span><span class="rx-ex-t">Detection vs. a pre-execution check</span></div>
<p class="rx-ex-cap">Pre-execution check = before data kept after closure is used, checking that the field is within its reason and deadline and cannot identify anyone, and recording the result. Detection = finding out later through member complaints or a regulator's investigation. The dates below are the month complaints started and the date of the OPC findings.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not visible from the disclosure</b>Before using retained data, check its reason, deadline, and whether it can identify anyone</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Purchase history and IP addresses kept after closure<br>Removing names alone found not enough</span></div>
<div class="rx-zone det"><b>Detection · found through complaints and investigation</b>The OPC investigates after member complaints</div>
<div class="rx-g g1"><div class="t">2024-05</div><b>The OPC starts receiving complaints</b></div>
<div class="rx-g g2"><div class="t">Investigation</div><b>Six complaints accepted and investigated</b></div>
<div class="rx-g g3"><div class="t">2026-03-05</div><b>The OPC issues its findings</b></div>
<div class="rx-g g4"><div class="t">After</div><b>Loblaw agrees to a third-party assessment</b></div>
</div>
</figure>

A regulator also examined how former customers' data was kept in [Free Mobile and Free](/critical/briefs/171-free-mobile-cnil-former-subscriber-retention/) (CNIL found keeping former subscribers' data unlawful). Data left behind in an environment past its purpose is the case of [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/).

## 4. What Lemma does

**Lemma builds the pre-execution check in front of where retained data is used.** It does not delete or anonymize data. Before execution, it checks that a read of retained data is within the decided reason, deadline and scope, and keeps a record.

### Industries and operations to watch

- **Industry · Services and retail**: Retailers and services that hold purchase history and usage records for a long time through points or membership programs. Counting people who have left, they hold more data than their active members.
- **Operation · Lookups and access**: Using purchase history that includes closed accounts for analytics or product development.

### Current controls vs Lemma

Two columns were at issue in this case. Column 1 is what is kept after closure. Column 2 is whether people can be traced from the data once names are removed (the OPC's anonymization finding).

| Control | Data kept after closure | Data after names are removed (can people be traced?) |
| --- | --- | --- |
| Deleting name and contact details on closure (Loblaw's process) | Partial | Not effective |
| Deleting on or shortly after closure (one of the OPC's recommendations) | Effective | Effective |
| Third-party assessment of anonymization (one of the OPC's recommendations; Loblaw agreed) | Not relevant | Partial |
| Annual review of login credentials (PCid) | Partial | Not relevant |
| **Lemma (pre-execution check)** | Not relevant | Partial |

Per the OPC, deleting name and contact details on closure is not enough on its own to anonymize (it cited combining public IP addresses with transaction records, email domains that remained, a manual error, and more). Deleting on or shortly after closure removes the retained data itself. A third-party assessment looks, separately from the keeper, at whether there is a serious possibility of re-identification, but its result and the measures that follow are still to come. The login-credential review deletes credentials when no other account uses them, and does not reach purchase history. Lemma checks that reads of retained data stay within the decided scope and keeps a record of who read what (the OPC said access controls over retained data were insufficiently documented).

Note: Lemma's check works only when it is built into the path that reads retained data, with the allowed purpose, scope and deadline managed separately from the reader. Reads from outside that path do not go through it. Deleting or anonymizing data is the job of the organization that holds it; Lemma does not reduce what is stored. The table compares what each control checks; it does not show whether anything happened or was stopped in this case. Lemma does not detect or prevent intrusions.

### Checklist

Three things to check in your organization about data of people who have left

- Can you say in which systems, in which fields, and until when data of people who have left is kept?
- Do you assess, separately from the keeper, whether fields that remain after names are deleted could re-identify someone?
- Do you confirm that the fields deleted on closure are gone, including from backups?

## 5. Facts and timeline

- **How it started**: From May 2024, the OPC received complaints about closing PC Optimum accounts, which appeared linked to a boycott that started on Reddit. The OPC accepted six complaints. All said the members could not delete their account and purchase history, and that their inquiries went unanswered (OPC).
- **The program**: PC Optimum is run by President's Choice Services Inc., a subsidiary of Loblaws Inc. It has more than 17 million members (OPC).
- **Deleted on closure**: Name, email, phone and address. The email is replaced with a dummy address (Loblaw's explanation).
- **Kept after closure**: Loyalty data; usage data (login and registration status, hashed email, public IP address, login frequency, duration and time, pages viewed, links clicked, grocery store ID, points balance, marketing consent status, and device type, browser and app version); historical transaction data (product ID, quantity, amount, lane and transaction numbers, date, merchant and store ID); customer support logs; and PCid login credentials (email and password). Card-only members have no usage data collected (OPC).
- **Handling inquiries (Principle 4.10)**: Deletion requests took an unreasonable time and some inquiries went unanswered (May to July 2024). The OPC found a contravention and considered it resolved after Loblaw improved its procedures, trained staff and confirmed deletions to the complainants.
- **Card-only members closing (Principle 4.4)**: Asking a card-only member to create an online account was found not well-founded. Loblaw called it a miscommunication and updated its procedures and website.
- **Retention schedules (Principles 4.5.2 and 4.5.3)**: Support logs need a retention schedule, and inactive PCids with no other active account will be reviewed at least once a year and deleted. The OPC considered this resolved.
- **Anonymization (Principle 4.5.3)**: The OPC found that stripping names, phone numbers and email addresses alone is insufficient, found a contravention, and considered it conditionally resolved. Its reasons: public IP addresses cross-referenced with transactions can approximate location; email domains were sometimes retained, contrary to Loblaw's representations; transaction data can be re-identifiable for some people; a manual error put a complainant's name into a dummy address and Loblaw did not detect it; Loblaw did not show that identifiers are removed from backups; retained data is not aggregated or perturbed; and access controls were insufficiently documented (OPC).

### Timeline

- **2024-05**: The OPC starts receiving complaints about closing PC Optimum accounts.
- **2024-05 to 07**: Deletion requests were delayed and some inquiries went unanswered (OPC finding).
- **2026-03-05**: The OPC issues its findings (PIPEDA Findings #2026-001).

> The facts here rest on the OPC findings. The contraventions are the OPC's findings; this Brief does not assess the company's handling. Loblaw disagrees with the anonymization finding. According to the company, the retained data is no longer associated with an identifiable person. How long data is kept, how many accounts were closed, and the result of the third-party assessment have not been disclosed. What has not been disclosed does not mean there were no controls.

### After disclosure

- **OPC recommendations**: Have an independent third party assess the anonymization so there is no serious possibility of re-identification, or delete the account information on closure or shortly after.
- **Loblaw**: It disagreed with the finding and said the retained data is not associated with an identifiable person. It agreed to a third-party assessment, to give the OPC a summary report, and to put the needed measures in place within 12 months of the report. It also committed to an annual PCid review and to stronger training (OPC).

## 6. Sources

- **Office of the Privacy Commissioner of Canada (OPC, primary, regulator)**: "PIPEDA Findings #2026-001" (2026-03-05) — <https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2026/pipeda-2026-001/>

Only the OPC findings are used as a primary source. Loblaw's own statements and the third-party assessment report have not been checked. Media and commentary sites are not cited.
