---
brief_no: 32
title: "ポラリスHD・Booking.com：ホテルの売上金を受け取る口座が、正規の管理画面で第三者の口座に書き換えられ、1 ホテルで約 900 万円の損失が出た（同社開示） — 振込先の変更を、お金が動く前に別の人が確かめる仕組みが無い"
title_en: "Polaris Holdings / Booking.com: the bank account that receives a hotel's sales was switched to a third party's inside the legitimate admin screen, and one hotel lost about ¥9 million (company disclosure) — nothing has someone else confirm a payout-account change before money moves"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-05-23
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["149-revolut-italy-government-mailbox-disclosure-requests", "044-arcadia-speecan-raiden-disaster-mail-spoofing", "006-google-api-key-revocation-lag"]
version: "2.0"
status: published
og_lead_ja: "Booking.com でホテルの受取口座が書き換えられ約900万円の損失 — ポラリスHD"
og_lead_en: "Booking.com payout account switched, ¥9M lost — Polaris Holdings"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · アカウント乗っ取り"
og_kicker_en: "CYBERATTACK · ACCOUNT TAKEOVER"
og_headline_ja: "正規の管理画面で、\nホテルの受取口座が\n書き換えられた。\n<accent>約 900 万円の損失</accent>"
og_headline_en: "A hotel's payout account was switched in the real admin screen.\n<accent>About ¥9M lost.</accent>"
summary_labels: ["What happened", "Why it looked normal", "The missing layer"]
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
  quote: "A change to where the money goes went all the way through on a logged-in session alone."
industries: ["retail", "finance"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "separate-approval"
    item: "Someone other than the person who made the change confirms it"
  - slug: "ownership-check"
    item: "Confirm the new account really belongs to you"
  - slug: "hold-unverified"
    item: "Hold changes that cannot be confirmed"
  - slug: "audit-trail"
    item: "Record what was confirmed before it was let through"
attack_method: "account-takeover"
impact: "About \u00a59M lost at one hotel"
takeaway: "Nothing had someone else confirm a payout-account change before money moved."
---

> **Revision (v2.0 / 2026-10-16)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Press coverage and industry research were re-checked.

## 1. TL;DR

An outsider got into the Booking.com account used by hotel operator Polaris Holdings and, at several hotels, switched the bank account that receives sales to their own. At one hotel part of its receivables (money it was owed) was paid into that account, a loss of about ¥9 million. At the other hotels, fraudulent payouts were prevented through what the company calls an early response.

The change was made in the legitimate admin screen, as a logged-in action. To the system it was indistinguishable from a routine settings update.

Detection worked: detection and an early response kept the loss to one hotel. What failed was the layer in which someone other than the person making a payout-account change confirms it before money moves.

## 2. What happened

- **Who**: Polaris Holdings, a hotel operator. Its hotels were managed on the booking site Booking.com through a group-level account.
- **What was changed**: The bank account Booking.com pays hotel sales into. Hotels register it in the admin screen; it was switched to a third party's account.
- **Loss**: At one hotel, part of its receivables (money it was owed) was paid into the fraudulent account: a loss of about ¥9 million (as of disclosure). Accounts were also changed at several other hotels, but an early response prevented fraudulent payouts there.
- **Impact on guests**: Some guests received phishing messages. The company is examining two possibilities: booking data taken from the admin screen, or a leak from an external booking-management system.
- **How they got in**: Under investigation and not disclosed. This Brief does not speculate.
- **Industry context**: Booking.com's hotel admin site (the extranet) has long been a target. In November 2025 the security firm Sekoia documented emails posing as Booking.com that trick hotel staff into running malware and steal their admin logins. Guests were then contacted by email from the hijacked account or over WhatsApp, with real booking details attached, and led to a page posing as a re-check of their payment details.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ②, when the change took effect. The payment at ③ itself followed the registered details. The disclosure does not say whether ④ came before or after ③.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Third party</div><div class="no">1</div><b>Gets into the group Booking.com account</b><p>Route under investigation.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">2</div><b>Rewrites the payout account in the real admin screen</b><p>Several hotels' accounts, switched to a third party's.</p></div>
<div class="rx-step"><div class="who">Booking.com</div><div class="no">3</div><b>Pays into the registered account as usual</b><p>One hotel's payout lands in the fraudulent account.</p></div>
<div class="rx-step good"><div class="who">Polaris</div><div class="no">4</div><b>Detects the anomaly and prevents payouts at the other hotels</b><p>Through what the company calls an early response.</p></div>
</div>
</figure>

The payment at step 3 was a normal payment to the registered account. **The problem is that the change at step 2 was accepted as a legitimate one.**

## 3. Timeline — disclosure and response

- **2026-05-23**: Polaris spots an anomaly in its group Booking.com account and starts investigating.
- **Investigation**: Payout accounts at several hotels had been rewritten. At one hotel part of the receivables was paid into the fraudulent account, a loss of about ¥9 million; at the others an early response prevented fraudulent payouts.
- **2026-05-28**: Polaris discloses the unauthorised access. The travel-industry outlet TRAICY reports it the same day.
- **2026-06-02–03**: Security outlets ScanNetSecurity and Security NEXT report it.

> The facts here rest on Polaris Holdings' disclosure of 28 May and the reporting on it. How the attacker got in, and whether guests' personal data leaked, were still under investigation at disclosure. The disclosure document has since been taken down from the company's site, so this Brief cites the press coverage.

### After disclosure

- **Polaris**: changed the passwords of every hotel's Booking.com-related accounts, requested the access logs, and acted to contain the damage. No credit-card data leak has been confirmed. It expects a minor impact on earnings.
- **Industry**: attacks on Booking.com's hotel admin site keep being disclosed in Japan as well. Most target guests with phishing; this case went a step further and rewrote the hotel's own money flow, turning the attack into a direct loss.

## 4. Why it wasn't stopped

The failure here is not just that someone got into the account. It is that no layer had another person confirm a payout change before it took effect.

Login checks "is the person coming in the registered user?" It does not check what they do once inside. In security terms, the logged-in state is an "authenticated session", and anything done in it looks legitimate to the system. Changing a payout account is handled exactly like changing a contact address.

Detection worked. Polaris detected the anomaly, and fraudulent payouts at the other hotels were prevented. But detection works only once an anomaly surfaces. Even so, one hotel's payout went through; the disclosure does not say whether before or after detection. The point to stop it was earlier: when the payout-account change took effect.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The detection–proof gap</span></div>
<p class="rx-ex-cap">Proof acts before a change takes effect; detection acts after an anomaly surfaces. In between, the rewritten account is treated as a valid setting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Confirm the change is right before it takes effect</div>
<div class="rx-zone gapz"><b>The gap</b><span>The change is live.<br>No one has noticed yet</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>Notice the surfaced anomaly and stop it</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Login</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Payout change accepted</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Anomaly spotted</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Other payouts stopped</b></div>
</div>
</figure>

The distance between noticing an anomaly and confirming a change is right is what this Brief calls **the detection–proof gap**, and it is a structural one.

The same shape appears in [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), which answered disclosure requests arriving through a national certified-mail network, and in [SpeeCAN RAIDEN](/critical/briefs/044-arcadia-speecan-raiden-disaster-mail-spoofing/), whose genuine sending domain delivered fake mail. In each, "it came through the legitimate channel" stood in for "it is a legitimate request".

## 5. How to counter this

**With the right mechanism, this attack could have been partly prevented.** If a payout-account change does not take effect until another person confirms it through another channel, the rewrite stops there. But the change happened inside Booking.com's admin screen, so that mechanism has to be built into the booking platform. What users can add on their own side is a way to stop payment after a change and before the first payout: have someone other than the changer receive change notifications, and if a change is not recognised, ask the platform to stop payment.

### Industries and operations to watch

- **Industry · Services & retail**: Lodging, restaurant and retail businesses that receive sales through booking sites, e-commerce platforms or payment processors. The payout account lives in an external service's admin screen.
- **Industry · Finance & FinTech**: Banks and payment providers that accept payee registrations and changes. A payee rewritten on the customer's side still arrives as a valid instruction.
- **Operation · Payee & bank-account changes**: Registering or changing a supplier's or your own receiving account. The result does not show until the next payment.
- **Operation · Accounts & permissions**: Managing external-service accounts and who can change what. This rewrite came from a hijacked account.

The same hole exists in many organisations, not just hotels: finance changing a supplier's bank details, adding a payee in online banking, setting the receiving account on an e-commerce or payment service. In each, anyone who can log in can change it on the spot, and the result does not show until the next payment. And often no one has been made its owner.

- **Finance**: Handles accounts and payments. Tends to see the change as “a systems issue”.
- **IT**: Manages accounts. Tends to see the change as “a business issue”.
- **Business units**: Sign up for and use booking sites and payment services day to day.

**Between the three, no one has the job of asking “is this payout change really right?”** Here, one hotel alone lost about ¥9 million.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Multi-factor authentication (MFA) | Partial | Works at the door. The route in has not been disclosed, so whether it would have helped here is unknown. It is bypassed when the device or the logged-in session itself is hijacked, and it does not look at what is done after login. |
| Endpoint monitoring (EDR) | Partial | May detect an endpoint infection like the one Sekoia describes, but cannot see settings changed inside a booking site or other external service. |
| Call-back verification | Ineffective | Works when a supplier asks to change its account. When your own settings are rewritten, as here, nobody gets a call. |
| Email authentication (DMARC etc.) | Not relevant | Reduces email spoofing, but has nothing to do with this rewrite. |

### What is needed

1. **Someone other than the changer confirms it.** A payout change does not take effect from a logged-in action alone. Before it does, confirm that a designated second approver has approved it through a channel separate from the login. If approval can come through the same channel as the hijacked account, it is worthless.
2. **Confirm the new account really is yours.** Back up the account holder's name with the bank's own check. This works even if the approver is fooled.
3. **Hold what cannot be confirmed, and record what was.** Changes that cannot be confirmed stay on hold, and payments to that account stop. Keep when, on whose approval, and to which account a change was let through, in a form you can later show a third party — that is, as proof.

### Checklist

Three things to confirm in your organisation about payout changes

- Which accounts can change the receiving or payee account? When one is changed, who other than the person who changed it is notified?
- Can you hold the first payment in or out until someone other than the changer confirms the change by a different means than the one used to register it?
- Who reconciles the first receipt or payment after a change, and within how many days? If it does not match, can you stop the next transfer?

Note: this still fails if the approver is tricked into approving, or if the approval channel is also hijacked. Holding changes until confirmed also delays legitimate ones.

## 6. Sources

- **Polaris Holdings (Company disclosure)**: “Notice of unauthorised access (Booking.com account)” (Japanese) (2026-05-28) — the document has since been taken down from the company's site
- **Security NEXT (Press)**: “Payout account details at lodging booking service tampered, fraudulent transfer — Polaris HD” (Japanese) (2026-06-03) — <https://www.security-next.com/185176>
- **TRAICY (Press)**: “Polaris HD suffers fraudulent transfer after unauthorised access to Booking.com; phishing messages to guests also confirmed” (Japanese) (2026-05-28) — <https://www.traicy.com/posts/20260528371641/>
- **ScanNetSecurity (Press)**: “Unauthorised access to Booking.com, sales payout account tampered; about ¥9 million lost” (Japanese) (2026-06-02) — <https://scan.netsecurity.ne.jp/article/2026/06/02/55403.html>
- **Sekoia (Industry research)**: “Phishing campaigns ‘I Paid Twice’ targeting Booking.com hotels and customers” (2025-11-06) — <https://www.sekoia.com/blog/phishing-campaigns-i-paid-twice-targeting-booking-com-hotels-and-customers>

References: Why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
