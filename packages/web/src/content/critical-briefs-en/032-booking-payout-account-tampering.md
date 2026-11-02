---
brief_no: 32
title: "ポラリスHD・Booking.com：ホテルの受取口座が、正規の管理画面で第三者の口座に書き換えられ、1 ホテルで約 900 万円の損失が出た（同社開示）"
title_en: "Polaris Holdings / Booking.com: A hotel's payout account was switched to a third party's inside the legitimate admin screen, and one hotel lost about ¥9 million (company disclosure)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-05-23
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["149-revolut-italy-government-mailbox-disclosure-requests", "044-arcadia-speecan-raiden-disaster-mail-spoofing", "006-google-api-key-revocation-lag"]
version: "2.1"
status: published
og_lead_ja: "Booking.com でホテルの受取口座が書き換えられ、1 ホテルで約 900 万円の損失"
og_lead_en: "Booking.com payout account switched; one hotel lost about ¥9M"
layout: "report"
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "正規の管理画面で、\nホテルの受取口座が\n書き換えられた。\n<accent>約 900 万円の損失</accent>"
og_headline_en: "A hotel's payout account was switched in the real admin screen.\n<accent>About ¥9M lost.</accent>"
key_figures:
  - value: "≈ ¥9"
    unit: "million"
    label: "Loss at one hotel (as of disclosure)"
    tone: "alert"
  - value: "Several"
    unit: "hotels"
    label: "Had their payout account rewritten. At all but one, the fraudulent payout was prevented"
  - value: "05-23 → 05-28"
    label: "Five days from spotting the anomaly to disclosure"
glossary:
  - term: "Extranet"
    desc: "The admin site Booking.com provides to hotels."
  - term: "Authenticated session"
    desc: "The state after a successful login. Anything done in it looks like a legitimate action to the system."
insight:
  slug: "confirmed-by-login-alone"
  label: "Operations confirmed by login alone"
  quote: "A change to where the money goes, once confirmed on a logged-in session alone, cannot be told apart from a correct setting."
industries: ["retail", "finance"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "Someone other than the person who made the change approves it through a separate path before it takes effect"
  - slug: "ownership-check"
    item: "Check the new account holder against the bank's own record"
  - slug: "hold-unverified"
    item: "Do not activate changes that cannot be checked"
  - slug: "audit-trail"
    item: "Record what was checked before it was let through"
attack_method: "account-takeover"
impact: "About ¥9M lost at one hotel"
takeaway: "Do not confirm a payout-account change on a logged-in session alone; activate it only after someone other than the person who made it approves it through a separate path."
self_check: "If your payout bank account were changed, could you check that someone other than the person who made the change approved it, before the first payment?"
countries: ["jp"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged.

## 1. Summary

Polaris Holdings says payout accounts at several hotels were switched, and that an early response prevented fraudulent payouts at the others. The switch was made in the legitimate admin screen, as a logged-in operation. To the system it looks like an ordinary settings change. <strong>A change to where the money goes, once confirmed on a logged-in session alone, cannot be told apart from a correct setting.</strong>

## 2. What got through

- **What got through**: A change to the bank account that receives a hotel's sales proceeds, in Booking.com's hotel admin site (the extranet). Polaris Holdings, which runs the hotels, managed its group's hotels through a group-level account. Payout accounts at several hotels were switched to a third party's.
- **Loss**: At one hotel, part of its receivables (money it was owed) was paid into the fraudulent account, a loss of about ¥9 million (at the time of disclosure). At several other hotels an early response, in the company's words, prevented fraudulent payouts.
- **What reached the receiving side**: In general, an operation made on a logged-in session (an authenticated session) looks to the system like a legitimate one. A payout-account change and a contact change arrive as the same kind of settings change. The payout itself is routine: money to the registered account.
- **Spillover to guests**: Phishing messages reached guests booked at some hotels. The company is looking into whether booking data taken from the admin screen was used, or whether it leaked from an external booking-management system.
- **Not disclosed**: How the attacker got in (under investigation at disclosure), and whether the payout to one hotel came before or after the anomaly was detected.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever applies a payout-account or bank-account change checks, before it takes effect, whether someone other than the person who made the change approved it through a path separate from the login.

- **Who approves**: A separate approver decided in advance. The approval is given in a form that the changing account's own path cannot produce. If it could be approved through the same path as the taken-over account, it would mean nothing.
- **Where it is checked**: The part of the system that applies payout-account and bank-account changes. Changes from the admin screen and from a supplier's request are both checked at one point before they take effect. A change that does not match an approval is not activated, and payments to that account are held until the check is done. The new account's holder is matched against the bank's own record.
- **What is recorded**: When, on whose approval, and to which account a change was let through, kept in a form a third party can verify later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before a payout-account change takes effect, whether another person approved it, and keeping a record. Detection means noticing after an anomaly surfaces. In between, the switched account is treated as a correct setting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Match the change to another person's approval before it takes effect</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Payout accounts switched at several hotels<br>About ¥9M lost at one</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Notice the account anomaly and stop the other fraudulent payouts</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Login</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>The payout-account change takes effect</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>The anomaly is noticed</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Other payouts are stopped</b></div>
</div>
</figure>

The anomaly was noticed after the change had taken effect. Other cases where "arrived through a legitimate route" stood in for "is a correct request" are [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), which answered disclosure requests that came through a national certified-mail network, and [SpeeCAN RAIDEN](/critical/briefs/044-arcadia-speecan-raiden-disaster-mail-spoofing/), where a fake email arrived from the genuine delivery domain.

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that applies payout-account and bank-account changes.** It does not look for intrusions; it confirms, before a change takes effect, that it rests on another person's approval. Because this change happened inside the booking site's admin screen, the place to build it in is the booking or payment service. What a user can add is a stop after the change and before the first payout (the hold in 03, and the checklist below).

### Industries and operations to watch

- **Industry · Services & retail**: Lodging, restaurant and retail businesses that receive sales proceeds through booking sites, e-commerce or payment providers. The payout-account setting sits in an external service's admin screen.
- **Industry · Finance & fintech**: Banks and payment providers that accept registration and changes of payout accounts. A payout account rewritten on the customer's side also arrives as a valid instruction.
- **Operation · Bank account changes**: Registering or changing your own or a counterparty's payout account. The result stays hidden until the next payment.
- **Operation · Accounts & permissions**: Managing accounts at external services and who can change what. The switch here was made from a taken-over account.

### Current controls vs Lemma

The route in this case is column 1 (a change to the payout account, made on a logged-in session in the admin screen). Column 2 is a supplier's request to change an account; column 3 is where the approver was fooled or the approval path was taken over. Whether either applied here has not been disclosed.

| Control | Logged-in change in the admin screen | A supplier's request to change an account | Approver fooled, or approval path taken over |
| --- | --- | --- | --- |
| Multi-factor authentication (MFA) | Partial | Not relevant | Not effective |
| Endpoint monitoring (EDR) | Partial | Not relevant | Not effective |
| Call-back confirmation | Not effective | Effective | Not effective |
| Email sender authentication (DMARC etc.) | Not relevant | Partial | Not relevant |
| Anomaly detection and early response | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

MFA works at the door, but because the route is undisclosed it is not known whether it mattered here, and once a device or a logged-in session is taken over it does not look at what is done afterwards. Endpoint monitoring might catch an infection like the one in Sekoia's example, but it cannot see settings changes made inside a booking site or external service. Call-back confirmation works when a supplier asks to change an account; when your own setting is rewritten, nobody gets a call. Detection works only once an anomaly surfaces.

Note: Lemma's check works only when it is built into the system that applies payout-account changes, changes from the admin screen and from requests pass the same check, and the approval path is separate from the system that receives the change. It passes if the approver is fooled or the approval path itself is taken over. Holding changes until checked also delays legitimate ones. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about bank-account changes

- Who can change a payout or bank account, and who other than the person who made a change is notified?
- Can you hold the first payment until someone other than the changer approves the change through a different channel from the one used to register it?
- Who matches the first payment after a change, within how many days, and can you stop the next transfer if it does not match?

## 5. Facts and timeline

- **Party**: Polaris Holdings (hotel operator). Its group hotels managed the booking site Booking.com through a group-level account.
- **What was changed**: The account into which Booking.com pays a hotel's sales proceeds. A setting the hotel registers in the admin screen.
- **Industry background**: The admin screens of hotels listed on Booking.com have long been targeted. Security firm Sekoia's November 2025 research found emails posing as Booking.com being used to get hotel staff to run malicious programs and steal admin-screen logins; guests were then lured, from the taken-over account's email or WhatsApp and with genuine booking details, to pages posing as a payment re-confirmation. Whether this case's intrusion route matches has not been disclosed.

### Timeline

- **2026-05-23**: Polaris spots an anomaly in its group Booking.com account and starts investigating.
- **Investigation**: Payout accounts at several hotels had been rewritten. At one hotel part of the receivables was paid into the fraudulent account, a loss of about ¥9 million; at the others an early response prevented fraudulent payouts.
- **2026-05-28**: Polaris discloses the unauthorised access. The travel-industry outlet TRAICY reports it the same day.
- **2026-06-02**: through 06-03, security outlets ScanNetSecurity and Security NEXT report it.

> The facts here rest on Polaris Holdings' disclosure of 28 May and the reporting on it. How the attacker got in, and whether guests' personal data leaked, were still under investigation at disclosure. What has not been disclosed does not mean there were no controls. The disclosure document has since been taken down from the company's site, so this Brief cites the press coverage.

### After disclosure

- **Polaris**: changed the passwords of every hotel's Booking.com-related accounts, requested the access logs, and acted to contain the damage. No credit-card data leak has been confirmed. It expects a minor impact on earnings.
- **Industry**: attacks on Booking.com's hotel admin site keep being disclosed in Japan as well. Most target guests with phishing; this case went a step further and rewrote the hotel's own money flow, turning the attack into a direct loss.

## 6. Sources

- **Polaris Holdings (Primary, company disclosure)**: “Notice of unauthorised access (Booking.com account)” (Japanese) (2026-05-28) — the document has since been taken down from the company's site
- **Security NEXT (Press)**: “Payout account details at lodging booking service tampered, fraudulent transfer — Polaris HD” (Japanese) (2026-06-03) — <https://www.security-next.com/185176>
- **TRAICY (Press)**: “Polaris HD suffers fraudulent transfer after unauthorised access to Booking.com; phishing messages to guests also confirmed” (Japanese) (2026-05-28) — <https://www.traicy.com/posts/20260528371641/>
- **ScanNetSecurity (Press)**: “Unauthorised access to Booking.com, sales payout account tampered; about ¥9 million lost” (Japanese) (2026-06-02) — <https://scan.netsecurity.ne.jp/article/2026/06/02/55403.html>
- **Sekoia (Industry research)**: “Phishing campaigns ‘I Paid Twice’ targeting Booking.com hotels and customers” (2025-11-06) — <https://www.sekoia.com/blog/phishing-campaigns-i-paid-twice-targeting-booking-com-hotels-and-customers>

References: Why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
