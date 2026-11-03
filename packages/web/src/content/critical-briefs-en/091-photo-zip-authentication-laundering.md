---
brief_no: 91
title: "Photo ZIP：Calendly の通知を経由した偽の連絡が SPF・DKIM・DMARC を通り、ホテルの受付に届いたと報告された(Microsoft の研究)"
title_en: "Photo ZIP: fake messages relayed through Calendly notifications passed SPF, DKIM and DMARC and reached hotel front desks (Microsoft research)"
pillar: "01-verifiable-origin"
primary_category: "identity-auth"
secondary_categories: ["code-provenance", "attribute-proof-bypass"]
incident_date: 2026-06-25
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "064-salesloft-drift-oauth-salesforce", "062-claude-code-github-action-bot-trust", "047-openclaw-agent-phishing"]
status: "published"
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "Microsoft によれば、Calendly の通知を経由した偽の連絡が SPF・DKIM・DMARC を通ってホテルの受付に届き、写真に見せかけたファイルから Node.js のバックドア TonRAT が入った"
og_lead_en: "Per Microsoft, fake messages relayed through Calendly notifications passed SPF, DKIM and DMARC, reached hotel front desks, and a file posing as a photo installed the Node.js backdoor TonRAT"
og_kicker_ja: "フィッシング · 宿泊業の受付"
og_kicker_en: "PHISHING · HOTEL FRONT DESKS"
og_headline_ja: "認証を通った偽の連絡が\nホテルの受付に届いたと\nMicrosoft が報告。\n<accent>3 つの認証を通過</accent>"
og_headline_en: "Fake guest emails passed\nSPF, DKIM and DMARC,\nMicrosoft reports.\n<accent>Hotels in Europe, Asia</accent>"
key_figures:
  - value: "3"
    unit: "checks"
    label: "Email authentication checks passed (SPF, DKIM, DMARC). The mail was sent from Calendly's infrastructure (Microsoft)"
    tone: "alert"
  - value: "3"
    unit: "languages"
    label: "Lure languages observed. Japanese was the most common, along with Danish and Dutch (Microsoft)"
  - value: "2"
    unit: "waves"
    label: "Stages of activity observed. It began in April 2026, and delivery via Calendly was added in late May (Microsoft)"
glossary:
  - term: "SPF, DKIM and DMARC"
    desc: "Mechanisms by which the receiving side judges whether a mail was sent from the legitimate sending infrastructure of the domain it claims and was not altered in transit. They judge the sending path, not who wrote the text."
  - term: "Authentication laundering"
    desc: "Microsoft's name for the technique of relaying an attacker-made mail through a legitimate service's sending infrastructure so that it passes email authentication."
  - term: "LNK file"
    desc: "A Windows shortcut file. Opening it runs the command or program it points to. Under default settings its extension is hidden, so it can be made to look like an image or other file."
insight:
  slug: "authenticated-path-as-author"
  label: "Treating authentication of the sending path as confirmation of the author"
  quote: "Unless, before a message is handled as a booking or guest communication, whether its author is the counterparty it claims to be is checked against records managed separately from authentication of the sending path, a mail that merely passed through legitimate sending infrastructure becomes a trusted communication as it is."
industries: ["retail"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "Even when a mail passes authentication, confirm it really came from the booking party"
attack_method: "impersonation"
takeaway: "Per Microsoft, fake booking messages relayed through Calendly notifications passed SPF, DKIM and DMARC and reached hotel front desks as legitimate mail."
self_check: "Before acting on a booking or guest message, do you check that its author is the counterparty it claims to be against records separate from the email authentication result?"
countries: ["global"]
---

## 1. Summary

On 2026-06-25, the Microsoft Defender Security Research Team disclosed "Photo ZIP," a campaign targeting hotels and accommodations in Europe and Asia. According to Microsoft, the attacker created notifications with the mechanisms of the scheduling service Calendly; because the mail was sent from Calendly's infrastructure, it passed the recipient's SPF, DKIM, and DMARC and reached front desks as "Booking Manager (via Calendly)." Opening a file posing as a photo ran the backdoor TonRAT on a legitimate Node.js runtime, and Microsoft confirmed intrusions at multiple organizations. The ultimate objective has not been confirmed. <strong>Unless, before a message is handled as a booking or guest communication, whether its author is the counterparty it claims to be is checked against records managed separately from authentication of the sending path, a mail that merely passed through legitimate sending infrastructure becomes a trusted communication as it is.</strong>

## 2. What got through

- **What got through**: Delivery of notification mail the attacker created with Calendly's mechanisms. Because the mail was actually sent from Calendly's infrastructure, SPF, DKIM, and DMARC all passed it as legitimate, and the sender name displayed was "Booking Manager (via Calendly)" (Microsoft). The body contained a link that went through Calendly and Google redirects to the attacker's domain. The lures were guest complaints, bedbug reports, and the like, and those in Japanese were the most common (Microsoft).
- **What reached the receiving side**: In Microsoft's report, the link downloads a ZIP file; opening the LNK file inside that looks like a photo leads, via PowerShell, to fetching a legitimate Node.js runtime from nodejs.org, on which the implant TonRAT runs. TonRAT persists in two registry locations and communicates with the attacker's domains. After compromise, establishing communication, forced shutdowns, and compiling executables were observed. Reservation and front-desk machines (with device names containing `reception-`, `frontdesk-`, `accueil`, `recepcja`, and so on) were selectively targeted.
- **Not disclosed**: The number of organizations intruded upon and the breakdown by country, the ultimate objective, and attribution to a known actor. From the effort invested in obfuscation and persistence, Microsoft assesses it as a staging phase for later activity.

## 3. What to check

Whatever the route, the condition for telling them apart is that, before a message is handled as a booking or guest communication and its links or attachments are opened, whether its author is the counterparty it claims to be is checked separately from authentication of the sending path.

- **Who approves**: The accommodation's reservations administrator, who decides which booking sites, scheduling services, and counterparties' messages are accepted as booking or guest communications, and which records those messages are tied to. The displayed sender name and a passed email authentication are not used as approval.
- **Where it is checked**: On the front-desk machine, immediately before a message is shown as a booking communication and its links or attachments become openable. Whether the message is tied to the records of a party it was decided to accept (such as a booking site's reservation number or a counterparty's registered key) is checked; a message that cannot be checked is not handled as a booking communication, and its links and attachments are held until the check is done.
- **What is recorded**: Which message was checked against which party's records and accepted (or held). Kept separately from the mail infrastructure, in a form that can be shown later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a message is handled as a booking or guest communication, whether its author is the counterparty it claims to be, and keeping a record. Detection means Microsoft observing the activity and publishing indicators of compromise and mitigations. Dates follow Microsoft's report.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before handling it as a booking message, check the author against records separate from the sending path</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Fake messages that passed email authentication reached front desks<br>and intrusions were confirmed at multiple organizations</span></div>
<div class="rx-zone det"><b>Detection · Microsoft observed it</b>Published indicators of compromise and mitigations</div>
<div class="rx-g g1"><div class="t">2026-04</div><b>Activity begins (Wave 1)</b></div>
<div class="rx-g g2"><div class="t">Late 2026-05</div><b>Delivery via Calendly added</b></div>
<div class="rx-g g3"><div class="t">Wave 2</div><b>File names and stages change</b></div>
<div class="rx-g g4"><div class="t">06-25</div><b>Microsoft discloses</b></div>
</div>
</figure>

Email authentication worked and correctly judged that the mail was sent from Calendly's infrastructure. Microsoft observed the activity and published indicators of compromise and mitigations. What was missing is the layer before that, which checks whether the author is the counterparty it claims to be. It has the same shape as [Brief 030](/critical/briefs/030-stripe-trusted-channel-skimmer/), where trusted API infrastructure was used for card theft, [Brief 064](/critical/briefs/064-salesloft-drift-oauth-salesforce/), where a trusted integration's OAuth was abused, and [Brief 062](/critical/briefs/062-claude-code-github-action-bot-trust/), where a `[bot]` claim was taken as authority to trigger: a legitimate path or claimed name stands in for checking who wrote the content.

## 4. What Lemma does

**Lemma builds the check in section 03 in immediately before the front desk handles a message as a booking or guest communication.** It does not detect malicious mail or files; it checks, separately from the email authentication result, whether a message is tied to the records of a party it was decided to accept.

### Industries and operations to watch

- **Industry · Services & retail (accommodation)**: Reservations and front desks at hotels and accommodations that receive messages with photos and documents every day from booking sites, scheduling services, and guests.
- **Operation · Receiving booking and guest messages**: Work in which notifications arriving via outside services are opened as booking communications and the next task starts from their links or attachments. The sender name and the email authentication result easily become the basis of trust as they are.

### Current controls vs Lemma

The core route in this case is the first column: a fake message that went through a legitimate service's notifications and passed email authentication. The second column compares the stage where a file posing as a photo is opened on the front-desk machine; the third, persistence and communication after it is opened.

| Control | Fake message via a legitimate service that passed email authentication | A file posing as a photo is opened | Persistence and communication after opening |
| --- | --- | --- | --- |
| Email authentication by SPF, DKIM and DMARC | Not effective | Not relevant | Not relevant |
| Alerting staff to mail named "Booking Manager (via Calendly)" and checking the final destination of redirects (Microsoft's recommendation) | Partial | Not relevant | Not relevant |
| Showing known file extensions, restricting LNK execution, ASR rules (Microsoft's recommendation) | Not relevant | Partial | Not relevant |
| SIEM/EDR rules for unusual placement and outbound communication of a legitimate runtime (Node.js), and registering the published IoCs (Microsoft's recommendation) | Not relevant | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Not relevant | Not relevant |

Email authentication correctly judged that the mail was sent from Calendly's infrastructure, so on this route it could not separate out the fake message (Microsoft). Alerting staff and checking redirects stop it when a person notices, but cannot be relied on once the claimed name or wording changes. Showing extensions and restricting LNK files narrow the stage of opening the file, and detection rules and IoCs give clues for noticing activity after it is opened. Lemma checks whether a message is tied to the records of a party it was decided to accept, so a message that merely arrived from Calendly's infrastructure is held before it is handled as a booking communication. On the other hand, it does not judge file contents or programs running on the machine, so the second and third columns are covered in combination with controls on the machine side.

Note: Lemma's check works only when it is built into the front desk's systems, booking sites and counterparties send messages tied to their own records, and those records are managed separately from the mail body and the sender name. If the account or key of a legitimate booking site or counterparty is stolen, or a link or attachment is planted in a legitimate message tied to the records, it can pass. Lemma does not change the mail infrastructure or Calendly's mechanisms, and does not judge whether mail or files are benign. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm at hotel and accommodation reservations and front desks

- Have all front-desk staff been told about mail with sender names that go through scheduling or booking services, such as "Booking Manager (via Calendly)"?
- On front-desk machines, are known file extensions shown and the execution of LNK files restricted?
- Is there a procedure to confirm booking and guest messages through a registered route, such as the booking site's admin screen, rather than from links or attachments in the mail?

## 5. Facts and timeline

- **Reporting party**: The Microsoft Defender Security Research Team (Parth Jomadkar), which published a technical report and indicators of compromise (C2 domains, hashes, and so on) on 2026-06-25.
- **Target**: Hotels and accommodations in Europe and Asia. Machines of reservation and front-desk staff were selectively targeted (Microsoft).
- **Scale**: Microsoft confirmed intrusions at multiple organizations. The number of organizations and breakdown by country have not been disclosed.
- **Delivery**: The attacker created notifications with Calendly's mechanisms and put a link going through Calendly and Google redirects in the body. The mail was sent from Calendly's infrastructure and passed SPF, DKIM, and DMARC. The sender name was "Booking Manager (via Calendly)." Microsoft calls this authentication laundering.
- **Activity on the machine (Microsoft's report)**: Opening the LNK file that looks like a photo inside the ZIP has obfuscated PowerShell fetch a legitimate Node.js (v24.13.0) into user space, on which the JavaScript implant TonRAT runs. TonRAT persists in two registry locations and communicates with the attacker's domains.
- **Lures**: Guest complaints, bedbug reports, and the like. Japanese was the most common language, with Danish and Dutch also observed. `accueil`, `recepcja`, and so on are reported as patterns of targeted device names.
- **Attribution and objective**: Not attributed to a known actor. The ultimate objective has not been confirmed; Microsoft assesses it as a staging phase for later activity.

### Timeline

- **2026-04**: "Photo ZIP" activity begins (Wave 1). File names start with `IMG-`.
- **Late 2026-05**: Delivery through Calendly's notification mechanisms and Google redirects is added.
- **Wave 2**: File names change to start with `PHOTO-`, and a stage that compiles a .NET DLL on the machine and domains behind Cloudflare are added.
- **2026-06-25**: The Microsoft Defender Security Research Team publishes its report and indicators of compromise.

> The facts of this case follow observation and disclosure by Microsoft threat intelligence; The Hacker News, SC Media, and Security Measures Lab relay that report. We do not go beyond the disclosure on the details of TonRAT's communication. For the number of organizations intruded upon, the breakdown by country, and the latest indicators of compromise, refer to Microsoft's primary disclosure. This Brief does not include reproduction steps. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Microsoft**: As mitigations, recommended alerting all staff to mail with the sender name "Booking Manager (via Calendly)," checking the final destination of redirects, showing known file extensions, restricting LNK execution and ASR rules, adding SIEM/EDR rules for unusual placement and outbound communication of a legitimate runtime (Node.js), and registering the published indicators of compromise, and pointed to related Microsoft Defender alerts.

## 6. Sources

- **Microsoft Security Blog (research, primary)**: "Photo ZIP campaign targeting hospitality industry delivers Node.js implant for persistent access" (Microsoft Defender Security Research Team / Parth Jomadkar, 2026-06-25) — <https://www.microsoft.com/en-us/security/blog/2026/06/25/photo-zip-campaign-targeting-hospitality-industry-delivers-node-js-implant-persistent-access/>
- **The Hacker News**: "Microsoft Warns of Photo ZIP Phishing Campaign Targeting Hotels with Node.js Implant" — <https://thehackernews.com/2026/06/microsoft-warns-of-photo-zip-phishing.html>
- **SC Media**: "Photo-themed phishing campaign targets European and Asian hotels with Node.js implant" — <https://www.scworld.com/brief/photo-themed-phishing-campaign-targets-european-and-asian-hotels-with-node-js-implant>
- **Security Measures Lab (Japanese commentary)**: "Microsoft discloses the 'Photo ZIP campaign'" (2026-06-30) — <https://rocket-boys.co.jp/security-measures-lab/hotel-frontdesk-phishing-node-backdoor/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
