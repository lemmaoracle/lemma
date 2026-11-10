---
brief_no: 199
title: "オンタリオ州の病院：退職した医師の AI 文字起こしツールが、招待の残っていた病院のオンライン会議に自動で参加し、患者の情報を記録した(IPC の書簡)"
title_en: "Ontario hospital: A former physician's AI transcription tool joined a hospital virtual meeting through an invite still in their calendar, and recorded patients' health information (IPC letter)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2024-09-23
published: 2026-11-10
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["157-met-police-auror-unapproved-platform", "172-illuminate-education-ftc-former-customer-data"]
status: draft
version: "1.0"
og_lead_ja: "オンタリオ州の病院で、退職した医師の AI 文字起こしツールが招待の残った会議に自動で参加し、患者 7 人の診断や治療の情報を記録した"
og_lead_en: "At an Ontario hospital, a former physician's AI transcription tool auto-joined a meeting through a leftover invite and recorded seven patients' diagnoses and treatment"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "医療情報の事例 · AI 文字起こし"
og_kicker_en: "HEALTH PRIVACY · AI SCRIBE"
og_headline_ja: "辞めた医師の AI が、\n残った招待で病院の\n会議に自動で入った。\n<accent>患者 7 人の情報</accent>"
og_headline_en: "A former doctor's AI scribe\njoined a hospital meeting\nthrough a leftover invite.\n<accent>Seven patients' records.</accent>"
key_figures:
  - value: "7"
    unit: "patients"
    label: "Patients discussed in the meeting and captured in the transcript (names, sex, physician's name, diagnoses, medical notes, treatment information; IPC letter)"
    tone: "alert"
  - value: "65"
    unit: "recipients"
    label: "Users on the list that automatically received a meeting summary and access to the transcript by email (53 confirmed deletion or non-receipt; 12 appear to have left the hospital)"
  - value: "2023-06 → 2024-09"
    label: "From the physician leaving the hospital, while the recurring meeting invite stayed in their personal calendar, to the AI tool joining the meeting"
glossary:
  - term: "AI scribe"
    desc: "A tool that uses AI to turn the speech in a meeting or consultation into text and produce a summary. Some read invitations in a calendar and join online meetings automatically as a participant."
  - term: "Health information custodian"
    desc: "Under Ontario's Personal Health Information Protection Act (PHIPA), an organisation such as a hospital that holds patients' information and is responsible for how it is handled. Breaches are reported to the province's Information and Privacy Commissioner (IPC)."
insight:
  slug: "meeting-invite-outlives-employment"
  stop: true
  label: "A meeting invite that outlives employment"
  quote: "Before a meeting where patient information is discussed begins, check the participant list against records of current staff and approved tools, not against the invite list."
industries: ["healthcare", "ai"]
operations: ["disclosure", "account-admin"]
controls:
  - slug: "verify-entry"
    item: "Route meetings where patient information is discussed through a lobby, and admit participants only after confirming they are current staff or an approved tool"
  - slug: "limit-and-revoke"
    item: "Remove people who leave or move from recurring meeting invites and shared calendars on the day they go"
  - slug: "minimize-data"
    item: "Discuss patient information only on tools the hospital has approved, and when it reaches an unapproved tool, ask the vendor directly for deletion"
  - slug: "audit-trail"
    item: "Record, for each meeting, whom (and which tool) was admitted against which roster, and where recordings went and whether deletion was confirmed"
attack_method: "human-error"
impact: "The names, diagnoses, treatment information and other details of seven patients were captured in an AI tool's transcript, and a summary and access to the transcript were emailed to 65 recipients (IPC letter)"
takeaway: "A meeting invite stayed in a former physician's personal calendar for over a year, and an AI transcription tool linked to that calendar joined the meeting automatically. Holding an invite link does not show employment. Check participants against staff records before patient information is discussed."
self_check: "Do you know who, and with which tools, can currently join your online meetings where patient information is discussed, apart from the invite list?"
countries: ["ca"]
---

## 1. Summary

At a hospital in Ontario, Canada, on 23 September 2024, the AI transcription tool Otter.ai recorded a virtual hepatology rounds meeting attended by hospital physicians. The account belonged to a physician who had left the hospital in June 2023, and the tool had not been approved for use at the hospital. The personal health information of seven admitted patients receiving treatment was discussed, and after the meeting a summary and access to the transcript were emailed automatically to participants.

In a letter of 27 October 2025, the province's Information and Privacy Commissioner (IPC) set out what happened, based on the hospital's report. The physician had used their personal rather than their work email address in the meeting group, and the organiser had not removed them from the invite after they left. The tool they installed on their personal device in September 2024 joined through the invite still in their personal calendar. The IPC recommended, among other things, that the hospital ask the vendor for deletion itself, audit its offboarding, and enforce lobbies for virtual meetings.

<strong>A meeting invite stays in the calendar after its holder leaves, and keeps working as a right to join for any tool connected to that calendar.</strong>

## 2. What got through

- **What got through**: The AI transcription tool joining and recording the hospital's virtual hepatology rounds meeting, and the emailing afterwards of a summary and access to the transcript. According to the IPC letter, the tool read the link from the recurring invite in the former physician's personal calendar and recorded the meeting without notice. To the best of the hospital's knowledge, this was the only hospital meeting invite the tool accessed.
- **What reached the accepting side**: In general, an online meeting receives only the invite link and a participant's display name. It does not receive whether the holder of the link is still on staff, or whether it is a person or a recording tool. With the invite link, the meeting admits the holder as a participant.
- **Not disclosed**: The hospital's name. The meeting platform (Zoom, Teams or other) and whether a lobby was set. How many people attended, and how many of the 65 recipients were outside addresses. Whether the recording was deleted on Otter.ai's side (the physician did not respond to the request to ask for deletion, and the IPC recommended the hospital ask itself). What the hospital reported to the IPC by 27 January 2026.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is confirming, before a meeting where patient information is discussed begins, that each participant is current staff or a tool the hospital has approved, against a record kept apart from the invite list.

- **Who approves**: The department hosting the meeting, and HR or medical staff administration, which manage employment. For each meeting where patient information is discussed, they decide who may attend and which recording tools may be used, and keep this as a roster separate from the invite list. A person drops off the roster on the day they leave.
- **Where it is checked**: The step that admits participants (the lobby), and the point before patient information is first discussed. Each participant is matched against the staff record and the list of approved tools; one that does not match is held before admission. Holding the invite link is not taken in place of employment.
- **What is recorded**: For each meeting, whom (and which tool) was admitted against which roster. If a recording leaves the hospital, where it went and which patients to notify can be established from the hospital's own records.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking participants against records of current staff and approved tools before a meeting where patient information is discussed begins, and keeping a record. Detection means noticing the recording from the email that arrived after the meeting, cancelling the invite and asking for deletion. Dates rely on the IPC letter.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the meeting begins, check participants against records of current staff and approved tools</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Seven patients' information recorded<br>A summary and transcript access reached 65 recipients</span></div>
<div class="rx-zone det"><b>Detection · worked after the meeting</b>Noticed from the automatic email; invite cancelled and deletion requested</div>
<div class="rx-g g1"><div class="t">2023-06</div><b>The physician leaves the hospital (the invite stays)</b></div>
<div class="rx-g g2"><div class="t">2024-09</div><b>The physician installs the AI transcription tool on a personal device</b></div>
<div class="rx-g g3"><div class="t">2024-09-23</div><b>The tool joins, records and sends a summary</b></div>
<div class="rx-g g4"><div class="t">2024-12-17</div><b>The hospital reports to the IPC and notifies patients</b></div>
</div>
</figure>

It was noticed from the email that arrived after the recording. A case where information went onto an unapproved outside tool is the [Metropolitan Police](/critical/briefs/157-met-police-auror-unapproved-platform/) (an outside platform wrongly said to be approved), and one where a departed person's access remained is [Illuminate Education](/critical/briefs/172-illuminate-education-ftc-former-customer-data/) (a former employee's key). Here, a meeting invite left in a former physician's calendar was used for an AI tool to join more than a year later.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that admits participants to meetings where patient information is discussed.** It does not look for unapproved AI tools; it checks, before discussion begins, that each participant is current staff or an approved tool.

### Industries and operations to watch

- **Industry · Healthcare**: Hospitals and clinics that hold rounds, case conferences and multidisciplinary meetings online and discuss patients' names and diagnoses. Physicians and trainees come and go often, and recurring meeting invites may sit at personal addresses.
- **Industry · AI adoption (all industries)**: Organisations where staff can install, on their own, AI tools that join meetings and send recordings and summaries automatically.
- **Operation · Disclosure & data release**: Discussing patient information in meetings, and sending out the recordings and summaries.
- **Operation · Accounts & permissions**: Removing people from meeting invites and shared calendars when they leave or move.

### Current controls vs Lemma

The route in this case is column 1 (an AI tool joined automatically through an invite left in a former physician's personal calendar). Column 2 covers current staff bringing an unapproved recording tool into a meeting, and column 3 a current participant taking the content out themselves; nothing disclosed says either happened here.

| Control | AI tool joining through a departed person's invite | Unapproved tool brought in by current staff | Content taken out by a current participant |
| --- | --- | --- | --- |
| Removal from invites at departure | Effective | Not effective | Not effective |
| Meeting lobby (host admits by hand) | Partial | Partial | Not effective |
| On-site firewall blocking of AI tools | Not effective | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

Removal at departure closes this route if no invite remains, but while organisers manage invite lists by hand, a departed person's entry can stay (here it stayed for over a year). A lobby has the host admit participants one by one, but a display name alone does not show whether someone is still on staff. An on-site firewall stops use from inside the hospital, but does not reach a tool joining from a personal device off-site. Lemma checks, before discussion begins, not whether a participant holds the invite link but whether they match the records of current staff and approved tools.

Note: Lemma's check works only when it is built into meeting admission and the hospital keeps the staff record and the list of approved tools apart from the invite list. If a current participant records the meeting on their own device and passes it to an outside tool, it goes through. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or block unapproved tools, does not cancel invites or revoke access, and does not delete records held by an outside vendor.

### Checklist

Three things to confirm about online meetings where patient information is discussed

- When staff or physicians leave, is removal from recurring meeting invites an item in the offboarding procedure?
- When patient information reaches a tool you have not approved, do you have a procedure for the organisation, not the individual, to ask the vendor directly for deletion?
- When meeting recordings or summaries are sent automatically, do you record deletion confirmation for each recipient?

## 5. Facts and timeline

- **Parties**: A hospital in Ontario (the IPC does not name it), a health information custodian holding patients' information under PHIPA. The recording was made by the AI transcription tool Otter.ai; the account holder was a physician who left the hospital in June 2023. The supervising authority is the IPC.
- **What happened**: According to the IPC letter, on 23 September 2024 a virtual hepatology rounds meeting attended by hospital physicians was inadvertently recorded by Otter.ai. The tool integrates with Zoom, Google Meet and Microsoft Teams and can access meeting invitations stored in calendars; it had not been approved for use at the hospital. The physician installed it on their personal device in September 2024. The IPC names "two critical security gaps" that let the tool in: the physician used their personal rather than their work email address in the meeting group, contrary to hospital policy, and the organiser did not remove them from the invite after they left in June 2023. As a result they kept the meeting invite in their personal calendar for over a year after leaving. The recording came to light when a summary and access to the transcript were automatically emailed to participants, including the account holder, after the meeting.
- **Information recorded**: For seven patients who had been admitted and were receiving treatment: names, sex, physician's name, diagnoses, medical notes and treatment information.
- **Containment**: The hospital cancelled the meeting invite to the tool. Of the 65 users on the recipient list, 53 confirmed they had deleted the email or never received it; the remaining 12 appear to have left the hospital. It directed staff to remove the tool and similar tools from devices with access to hospital accounts, and told all staff that only approved technology and applications may be used. It received confirmation from the physician that they had removed hospital materials from their personal accounts and devices. It directed them to ask Otter.ai for deletion, but they did not respond. The physician had completed privacy training in 2021 and 2022, which did not cover AI tools.
- **Notification**: Five of the seven patients were notified by letter on 17 December 2024. The other two had died; for one, the notice went to the estate trustee, and for the other, with no known trustee, a copy was uploaded to the patient's electronic health record.
- **IPC recommendations**: That the hospital submit its own formal deletion request to Otter.ai (as custodian, it should have done so rather than rely on the physician). That it delete the email from the hospital accounts of the 12 unconfirmed recipients and follow up with any who received it at outside addresses. That it update its breach protocol so the Privacy Office contacts third parties directly and immediately for deletion in similar cases. That its acceptable use policy make clear that only hospital-approved devices, not personal ones, be used for hospital work. That it audit its offboarding to verify that all access to hospital information systems, including calendar invites, is revoked immediately on departure. That it technically enforce lobbies, with the host approving each participant, for virtual meetings where patient information is discussed. That its AI governance framework follow IPC guidance. That policies and training reflect that breaches may also lead to administrative monetary penalties under PHIPA.

### Timeline

- **2023-06**: The physician leaves the hospital. The organiser does not remove them from the recurring meeting invite, which stays in their personal calendar.
- **2024-09**: The physician installs Otter.ai on their personal device.
- **2024-09-23**: The tool joins and records the virtual hepatology rounds meeting. Afterwards, a summary and access to the transcript are emailed to participants.
- **2024-12-17**: The hospital reports the breach to the IPC and notifies five patients by letter.
- **2025-06**: The hospital revises its policy on the use of information and IT to address AI tools, and begins updated training for medical learners.
- **2025-10-27**: The IPC, by letter (HR24-00691), recommends further containment and remediation.
- **2026-01-27**: Deadline the IPC set for an update on the recommendations.
- **2026-04-27**: The IPC publishes the matter as a Case of Note, with key takeaways for all health information custodians.

> The facts rely on the IPC letter (HR24-00691) and its web page, and on the IPC's Case of Note (all primary). The letter summarises the hospital's report and does not name the hospital. The meeting platform, the number of attendees, the breakdown of the 65 recipients, whether Otter.ai deleted the recording, and what the hospital reported by the deadline have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of the hospital or the physician. Written as of 10 November.

### After disclosure

- **The hospital**: Blocked on-site use of AI scribe tools such as Otter.ai and deepseek.com through its firewall. Added AI tools and its AI use policy to privacy training, starting with medical learners in late June 2025 and other staff in autumn 2025, and said it will share the training with other hospitals. Revised its policy on the use of information and IT in June 2025, requiring among other things the use of approved IT resources only (AI tools included), and the review of meeting participant lists for unapproved AI tools or automated agents, removing them before patient information is discussed. Said it has an AI Governance Committee covering the procurement, implementation and use of AI tools, with the Privacy Office as a member.
- **IPC**: In its Case of Note of 27 April 2026, told all health information custodians that entering patient information into AI scribe tools they have not authorised is a privacy breach, that access including calendar invites should be revoked immediately on departure, and that meetings where patient information is discussed should use a lobby so that the host admits only authorised participants.

## 6. Sources

- **Information and Privacy Commissioner of Ontario (Primary, regulator's letter)**: "RE: Reported Breach HR24-00691" (2025-10-27) — <https://www.ipc.on.ca/en/media/5995/download>
- **Information and Privacy Commissioner of Ontario (Primary, regulator's publication)**: "IPC response to hospital privacy breach involving an AI scribes tool" (2025-10-27) — <https://www.ipc.on.ca/en/decisions/informal-resolution-high-profile-breaches/hospital-privacy-breach-involving-ai-scribes-tool>
- **Information and Privacy Commissioner of Ontario (Primary, regulator's publication)**: "Artificial intelligence gone wrong: Why custodians need strong AI frameworks and policies" (2026-04-27) — <https://www.ipc.on.ca/en/cases-of-note/artificial-intelligence-gone-wrong-why-custodians-need-strong-ai-frameworks-and-policies>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
