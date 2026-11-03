---
brief_no: 175
title: "Storm-2657：米国の大学の職員のアカウントが乗っ取られ、人事システムで給与の振込先が書き換えられた(Microsoft の報告)"
title_en: "Storm-2657: Staff accounts at US universities were taken over and payroll deposits redirected in the HR system (Microsoft report)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-10-09
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "160-baltimore-workday-supplier-contact-bank-change", "164-capcom-id-password-change-ecommerce-mypage", "051-instagram-ai-support-takeover"]
status: draft
version: "1.0"
og_lead_ja: "米国の大学で職員のアカウントが乗っ取られ、Workday で給与の振込先が書き換えられた — Microsoft が Storm-2657 を報告"
og_lead_en: "Storm-2657: US university staff accounts taken over and payroll deposits redirected in Workday (Microsoft)"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "Microsoft の報告 · 給与の振込先"
og_kicker_en: "MICROSOFT REPORT · PAYROLL"
og_headline_ja: "大学の職員の人事の画面で、\n給与の振込先が変えられた。\n<accent>3 大学で 11 アカウント</accent>"
og_headline_en: "University staff payroll\nwas quietly redirected.\n<accent>11 accounts, 3 universities</accent>"
key_figures:
  - value: "11 accounts"
    label: "Staff accounts Microsoft observed as compromised since March 2025 (at three universities)"
    tone: "alert"
  - value: "~6,000"
    label: "Email accounts that received phishing sent from the compromised accounts (across 25 universities)"
  - value: "Undisclosed"
    label: "University names, losses, and how many deposits were actually redirected (not in Microsoft's report)"
glossary:
  - term: "Workday"
    desc: "A cloud service for HR, payroll, procurement and more. Staff can register and change the bank account for their salary in their own profile."
  - term: "Payroll pirate"
    desc: "Industry name for taking over an employee's account and changing their salary deposit to an attacker's account in the HR system."
  - term: "Inbox rule"
    desc: "A mailbox setting that automatically moves or deletes incoming mail that meets given conditions."
insight:
  slug: "payroll-change-not-tied-to-owner"
  label: "A payroll change not tied to the employee"
  quote: "Even when a login succeeds in the employee's name, a change to where their salary is paid cannot be confirmed as theirs unless it is approved with a key that was already theirs before the change."
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Approve salary deposit changes with the employee's key or contact registered before the change"
  - slug: "hold-unverified"
    item: "Hold deposit changes made right after a new authentication device is registered until they can be matched to the employee"
  - slug: "audit-trail"
    item: "Record whose deposit changed, approved by which device, and when"
attack_method: "account-takeover"
impact: "11 staff accounts at three universities were taken over and salary deposits redirected in the HR system (number changed and losses not disclosed)"
takeaway: "Staff accounts were taken over and salary deposits redirected. Confirm a deposit change only after it is approved with the employee's key registered before the change."
self_check: "When staff change their salary deposit account, is the change confirmed only after approval with a key or contact registered before the change?"
countries: ["us"]
---

## 1. Summary

What was changed was not a payment to a vendor but employees' own salary deposits. According to Microsoft, the attacker registered their own phone as an authentication device on the hijacked accounts and hid the change notification emails with inbox rules. The changes therefore arrived from the employee's own account, through the real screens. Microsoft says this does not represent a vulnerability in Workday's products. The universities and the losses have not been disclosed. <strong>Even when a login succeeds in the employee's name, a change to where their salary is paid cannot be confirmed as theirs unless it is approved with a key that was already theirs before the change.</strong>

## 2. What got through

- **What got through**: Changes to employees' salary deposit accounts in the HR system (Workday). The attacker signed in to Workday through single sign-on from hijacked staff accounts and changed the payroll bank account details (Microsoft).
- **Also on the same accounts**: Registering the attacker's phone number as a multi-factor authentication device (through the Workday profile or Duo settings), which Microsoft says let them keep access without further approval from the employee. Inbox rules were also created to hide or delete Workday's notifications of the change.
- **What reached the receiving side**: In general, the HR system sees a deposit change from a session signed in to the employee's account. A successful login does not show that the employee made the change.
- **Not disclosed**: The universities. The losses, and how many deposits were actually changed and salaries sent elsewhere. Whether any pay was recovered. Whether a check beyond login was required for the deposit change. The order and interval between registering the device and changing the deposit.

## 3. What to check

Whatever the route, the condition for telling them apart is that the side confirming a salary deposit change checks, before confirming, that the change is the employee's, using the key or contact the employee had registered before the change.

- **Who approves**: The employee, with a key (such as a passkey) or contact registered before the change, approving with the new deposit account shown. The approval is issued in a form that a newly added authentication device, or the screen that accepted the change, cannot produce.
- **Where it is checked**: The HR or payroll system that confirms deposit changes. Changes made right after a new authentication device is registered, or that do not match an approval, are held rather than confirmed, and matched to the employee before the next payroll cutoff.
- **What is recorded**: Whose deposit changed, through which step, approved by which device, and when it was confirmed.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a salary deposit change is confirmed, that it is the employee's, using a key registered before the change, and keeping a record. Detection means noticing the takeover or change afterwards. The dates of device registration and deposit change have not been disclosed. Dates shown are the period Microsoft gave and its publication date.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before confirming a deposit change, check it against the employee's existing key</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>11 accounts taken over at three universities<br>Salary deposits redirected (number not disclosed)</span></div>
<div class="rx-zone det"><b>Detection · worked afterwards</b>Microsoft investigates the takeovers and publishes the method and mitigations</div>
<div class="rx-g g1"><div class="t">2025-03 on</div><b>Staff accounts taken over</b></div>
<div class="rx-g g2"><div class="t">Date not disclosed</div><b>Attacker's phone registered as an authentication device</b></div>
<div class="rx-g g3"><div class="t">Date not disclosed</div><b>Deposit changed; notification emails hidden</b></div>
<div class="rx-g g4"><div class="t">10-09</div><b>Microsoft publishes its report</b></div>
</div>
</figure>

Change notifications go to the hijacked mailbox, so once inbox rules hide them they never reach the employee. Registration details being changed through real screens without checking the owner is common to [Booking.com payout account tampering](/critical/briefs/032-booking-payout-account-tampering/) (a hotel's payout account was changed in its admin screen) and the [City of Baltimore](/critical/briefs/160-baltimore-workday-supplier-contact-bank-change/) (a supplier's bank account was switched in Workday). Here the target was not a vendor but employees' own pay.

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that confirms salary deposit changes.** It does not look for intrusions; it checks, before confirming, that an incoming change was approved with a key the employee had registered before the change.

### Industries and operations to watch

- **Industry · Government & public sector**: Universities and public bodies where many staff can change their own salary deposit in a cloud HR system. Microsoft notes that any SaaS holding HR or payment and bank account information could be targeted the same way.
- **Operation · Bank account changes**: Registering and changing staff salary deposit accounts.
- **Operation · Accounts & permissions**: Registering and changing multi-factor authentication devices on staff accounts.

### Current controls vs Lemma

The route in this case is column 1 (salary deposit changes) and column 2 (authentication device registration). Column 3 covers the phishing emails sent from hijacked accounts to other staff and universities.

| Control | Salary deposit changes | Authentication device registration | Email sent from hijacked accounts |
| --- | --- | --- | --- |
| Phishing-resistant MFA (Microsoft's recommendation) | Partial | Partial | Partial |
| Email notifying a deposit change | Partial | Not applicable | Not applicable |
| Takeover detection and reverting changes | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not applicable |

Phishing-resistant MFA protects sign-in; it does not look at what happens after sign-in succeeds. Notification emails help the employee notice later, and if the receiving mailbox is hijacked, inbox rules can hide them. Detection and reverting act after the fact. Lemma checks the deposit change itself, not the sign-in, against the employee's existing key before it is confirmed. The same check can be built into device registration, but an employee's first registration, with no existing key, passes.

Note: Lemma's check works only when it is built into the HR or payroll system that confirms deposit changes, and the approving key was registered before the change and is separate from the screen accepting the change and from any newly added device. It passes if the existing key itself is stolen, and for changes HR staff make on an employee's behalf unless the check is built in there too. Takeovers and outgoing phishing are not stopped by this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about staff salary deposit changes

- Do you have a step that holds, before confirming, a deposit change made right after a new authentication device is registered?
- When a salary deposit changes, does a notice also reach a channel other than the employee's mailbox?
- Can you notice when an inbox rule that moves or deletes HR or payroll notices is created?

## 5. Facts and timeline

- **Reporter**: Microsoft Threat Intelligence, which tracks a financially motivated actor it calls Storm-2657.
- **Targets**: US organisations, especially higher education, aiming at HR SaaS profiles such as Workday. The universities have not been named.
- **What was confirmed**: Since March 2025, 11 compromised staff accounts at three universities. The compromised accounts were used to send phishing to nearly 6,000 email accounts across 25 universities (Microsoft).
- **How access was gained**: According to Microsoft, credentials were harvested through phishing emails. Some accounts had no multi-factor authentication; on others, MFA codes were intercepted.
- **In the HR system**: The attacker entered Workday through single sign-on and changed payroll bank account details. They registered their own phone numbers as MFA devices and used inbox rules to hide or delete Workday's change notifications (Microsoft).
- **On Workday**: Microsoft says the attacks do not represent any vulnerability in the Workday platform or products. Workday has published guidance for customers in its community (Microsoft).
- **Losses**: The losses and the number of deposits actually changed have not been disclosed.
- **A similar warning**: In July 2024, Washington State University urged all employees to check their deposit details after phishing gave scammers some employees' credentials and their Workday direct deposits were changed (university announcement). Neither source links that case to Storm-2657.

### Timeline

- **2024-07-01**: Washington State University warns that employees' salary deposits were changed and urges staff to check them (no link to Storm-2657 is stated).
- **2025-03**: Microsoft begins observing Storm-2657 taking over staff accounts (11 accounts at three universities).
- **First half of 2025**: A campaign targeting Workday profiles is observed (Microsoft).
- **2025-10-09**: Microsoft publishes its report on Storm-2657.

> The facts rely on Microsoft Threat Intelligence's report (primary). It gives the number of compromised accounts and universities but not the universities' names, the losses, or how many deposits were actually changed. Washington State University's announcement (primary) concerns a separate case of the same kind; no link to Microsoft's report is shown. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Microsoft**: Recommended passwordless, phishing-resistant MFA (FIDO2 keys, passkeys and similar). For compromised identities it recommended resetting credentials and revoking sessions, reviewing and re-registering MFA devices, reverting unauthorised payroll changes and removing malicious inbox rules, and it published hunting guidance.
- **Workday**: Published guidance for customers in its community (Microsoft).

## 6. Sources

- **Microsoft Threat Intelligence (Primary, research report)**: "Investigating targeted “payroll pirate” attacks affecting US universities" (2025-10-09) — <https://www.microsoft.com/en-us/security/blog/2025/10/09/investigating-targeted-payroll-pirate-attacks-affecting-us-universities/>
- **Washington State University (Primary, university announcement)**: "WSU employees urged to check direct deposit information" (2024-07-01) — a separate case of the same kind · <https://news.wsu.edu/news/2024/07/01/wsu-employees-urged-to-check-direct-deposit-information/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
