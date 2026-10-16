---
brief_no: 32
title: "ポラリスHD・Booking.com：ホテルの売上金を受け取る口座が、正規の管理画面で第三者の口座に書き換えられ、約 900 万円が送金された（同社開示） — 振込先の変更を、お金が動く前に別の人が確かめる仕組みが無い"
title_en: "Polaris Holdings / Booking.com: the bank account that receives a hotel's sales was switched to a third party's inside the legitimate admin screen, and about ¥9 million was paid out (company disclosure) — nothing has someone else confirm a payout-account change before money moves"
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
og_lead_ja: "Booking.com でホテルの受取口座が書き換えられ約900万円 — ポラリスHD"
og_lead_en: "Booking.com payout account switched, ¥9M lost — Polaris Holdings"
layout: "report"
key_figures:
  - value: "≈ ¥9"
    unit: "million"
    label: "Sales paid into the fraudulent account at one hotel (as of disclosure)"
    tone: "alert"
  - value: "Several"
    unit: "hotels"
    label: "Had their payout account rewritten. All but one were stopped before payout"
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
  quote: "Anyone who could log in could change where the money went, and the change took effect on the spot."
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
---

> **Revision (v2.0 / 2026-10-16)**: Restructured so general readers can follow it, and §5 recast as "How to counter this". Press coverage and industry research were re-checked.

## 1. TL;DR

<div class="rx-exsum"><ol>
<li><div class="lab">01<b>What happened</b></div><p>An outsider got into the Booking.com account used by hotel operator Polaris Holdings and, at several hotels, switched the bank account that receives sales to their own. At one hotel part of the sales was paid into that account, a loss of about ¥9 million. The other hotels stopped the payouts after the anomaly was spotted.</p></li>
<li><div class="lab">02<b>Why it looked normal</b></div><p>The change was made in the legitimate admin screen, as a logged-in action. To the system it was indistinguishable from a routine settings update.</p></li>
<li class="key"><div class="lab">03<b>The missing layer</b></div><p>Detection worked: spotting the anomaly kept the loss to one hotel. What failed was the layer in which someone other than the person making a payout-account change confirms it before money moves.</p></li>
</ol></div>

## 2. What happened

<div class="rx-facts"><dl>
<dt>Who</dt><dd>Polaris Holdings, a hotel operator. Its hotels were managed on the booking site Booking.com through a group-level account.</dd>
<dt>What was changed</dt><dd>The bank account Booking.com pays hotel sales into. Hotels register it in the admin screen; it was switched to a third party's account.</dd>
<dt>Loss</dt><dd>At one hotel, part of the sales it should have received went to the fraudulent account: about ¥9 million (as of disclosure). Accounts were also changed at several other hotels, but the payouts were stopped in time.</dd>
<dt>Impact on guests</dt><dd>Some guests received phishing messages. The company is examining two possibilities: booking data taken from the admin screen, or a leak from an external booking-management system.</dd>
<dt>How they got in</dt><dd>Under investigation and not disclosed. This Brief does not speculate.</dd>
<dt>Industry context</dt><dd>Booking.com's hotel admin site (the extranet) has long been a target. In November 2025 the security firm Sekoia documented emails posing as Booking.com that trick hotel staff into running malware and steal their admin logins. The stolen accounts were then used to send guests fake payment requests built on real booking data.</dd>
</dl></div>

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain of events, as far as disclosed</span></div>
<p class="rx-ex-cap">The point to stop it was ②, when the change took effect. At ③ Booking.com did nothing wrong.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Third party</div><div class="no">1</div><b>Gets into the group Booking.com account</b><p>Route under investigation.</p></div>
<div class="rx-step crit"><div class="who">Third party</div><div class="no">2</div><b>Rewrites the payout account in the real admin screen</b><p>Several hotels' accounts, switched to a third party's.</p></div>
<div class="rx-step"><div class="who">Booking.com</div><div class="no">3</div><b>Pays into the registered account as usual</b><p>One hotel's payout lands in the fraudulent account.</p></div>
<div class="rx-step good"><div class="who">Polaris</div><div class="no">4</div><b>Spots the anomaly and stops payouts</b><p>The other hotels' payouts are stopped.</p></div>
</div>
</figure>

At step 3 Booking.com made no mistake: it paid the account on file. <strong>The problem is that the change at step 2 was accepted as a legitimate one.</strong>

## 3. Timeline — disclosure and response

<ul class="rx-tl">
<li><time>2026-05-23</time><span>Polaris spots an anomaly in its group Booking.com account and starts investigating.</span></li>
<li><time class="nd">Investigation</time><span>Payout accounts at several hotels had been rewritten. About ¥9 million went to the fraudulent account at one hotel; the rest were stopped before payout.</span></li>
<li><time>2026-05-28</time><span>Polaris discloses the unauthorised access. The travel-industry outlet TRAICY reports it the same day.</span></li>
<li><time>2026-06-02–03</time><span>Security outlets ScanNetSecurity and Security NEXT report it.</span></li>
</ul>

<p class="rx-aside">The facts here rest on Polaris Holdings' disclosure of 28 May and the reporting on it. How the attacker got in, and whether guests' personal data leaked, were still under investigation at disclosure. The disclosure document has since been taken down from the company's site, so this Brief cites the press coverage.</p>

### After disclosure

- **Polaris**: changed the passwords of every hotel's Booking.com-related accounts, requested the access logs, and acted to contain the damage. No credit-card data leak has been confirmed. It expects a minor impact on earnings.
- **Industry**: attacks on Booking.com's hotel admin site keep being disclosed in Japan as well. Most target guests with phishing; this case went a step further and rewrote the hotel's own money flow, turning the attack into a direct loss.

## 4. Why it wasn't stopped

The failure here is not just that a password was stolen.

Login checks "is the person coming in the registered user?" It does not check what they do once inside. In security terms, the logged-in state is an "authenticated session", and anything done in it looks legitimate to the system. Changing a payout account is handled exactly like changing a contact address.

Detection worked. Polaris spotted the anomaly and stopped the other hotels' payouts. But detection works only once an anomaly surfaces, and one hotel's payout could not be stopped. The point to stop it was earlier: when the payout-account change took effect.

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

The distance between noticing an anomaly and confirming a change is right is what this Brief calls <strong>the detection–proof gap</strong>, and it is a structural one.

The same shape appears in [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), which answered disclosure requests arriving through a national certified-mail network, and in [SpeeCAN RAIDEN](/critical/briefs/044-arcadia-speecan-raiden-disaster-mail-spoofing/), whose genuine sending domain delivered fake mail. In each, "it came through the legitimate channel" stood in for "it is a legitimate request".

## 5. How to counter this

<p class="rx-lead"><strong>With the right mechanism, this attack could have been partly prevented.</strong> If a payout-account change does not take effect until another person confirms it through another channel, the rewrite stops there. But the change happened inside Booking.com's admin screen, so that mechanism has to be built into the booking platform. What users can add on their own side is a way to stop payment after a change and before the first payout.</p>

### Industries and operations to watch

<div class="rx-facts rx-scope"><dl>
<dt><span class="kk">Industry</span>Services &amp; retail</dt><dd>Lodging, restaurant and retail businesses that receive sales through booking sites, e-commerce platforms or payment processors. The payout account lives in an external service's admin screen.</dd>
<dt><span class="kk">Industry</span>Finance &amp; FinTech</dt><dd>Banks and payment providers that accept payee registrations and changes. A payee rewritten on the customer's side still arrives as a valid instruction.</dd>
<dt><span class="kk">Operation</span>Payee &amp; bank-account changes</dt><dd>Registering or changing a supplier's or your own receiving account. The result does not show until the next payment.</dd>
<dt><span class="kk">Operation</span>Accounts &amp; permissions</dt><dd>Managing external-service accounts and who can change what. This rewrite came from a hijacked account.</dd>
</dl></div>

The same hole exists in many organisations, not just hotels: finance changing a supplier's bank details, adding a payee in online banking, setting the receiving account on an e-commerce or payment service. In each, anyone who can log in can change it on the spot, and the result does not show until the next payment. And in many organisations, nobody owns this operation.

<div class="rx-facts"><dl>
<dt>Finance</dt><dd>Handles accounts and payments. Tends to see the change as "a systems issue".</dd>
<dt>IT</dt><dd>Manages accounts. Tends to see the change as "a business issue".</dd>
<dt>Business units</dt><dd>Sign up for and use booking sites and payment services day to day.</dd>
</dl></div>

<strong>Between the three, no one has the job of asking "is this payout change really right?"</strong> Here, a single rewrite moved about ¥9 million.

### Do today's controls close it?

| Control | Here | Why |
| --- | --- | --- |
| Multi-factor authentication (MFA) | <span class="bx-st no">Ineffective</span> | Checks who comes in, not what they do after. Passes when a stolen login is reused or the device is hijacked. |
| Endpoint monitoring (EDR) | <span class="bx-st no">Ineffective</span> | Watches the organisation's own devices; cannot see settings changed inside a booking site or other external service. |
| Call-back verification | <span class="bx-st part">Partial</span> | Works when a supplier asks to change its account. When your own settings are rewritten, as here, nobody gets a call. |
| Email authentication (DMARC etc.) | <span class="bx-st na">Not relevant</span> | Reduces email spoofing, but has nothing to do with this rewrite. |

<section class="rx-box"><div class="rx-ex-h"><span class="rx-ex-no">Controls</span><span class="rx-ex-t">What is needed</span></div>
<ol class="num">
<li><b>Someone other than the changer confirms it.</b> A payout change does not take effect from a logged-in action alone. Before it does, confirm that a designated second approver has approved it through a channel separate from the login. If approval can come through the same channel as the hijacked account, it is worthless.</li>
<li><b>Confirm the new account really is yours.</b> Back up the account holder's name with the bank's own check. This works even if the approver is fooled.</li>
<li><b>Hold what cannot be confirmed, and record what was.</b> Changes that cannot be confirmed stay on hold, and payments to that account stop. Keep when, on whose approval, and to which account a change was let through, in a form you can later show a third party — that is, as proof.</li>
</ol>
</section>

<div class="bx-checklist"><div class="rx-ex-h"><span class="rx-ex-no">Check</span><span class="rx-ex-t">Checklist</span></div><p class="rx-box-cap">Three things to confirm in your organisation about payout changes</p><ul>
<li>Which accounts can change the receiving or payee account? When one is changed, who other than the person who changed it is notified?</li>
<li>Can you hold the first payment in or out until someone other than the changer confirms the change by a different means than the one used to register it?</li>
<li>Who reconciles the first receipt or payment after a change, and within how many days? If it does not match, can you stop the next transfer?</li>
</ul></div>

<p class="rx-aside">Note: this still fails if the approver is tricked into approving, or if the approval channel is also hijacked. Holding changes until confirmed also delays legitimate ones.</p>

## 6. Sources

<ol class="rx-srcs">
<li><span class="ty">Company disclosure</span><span class="bs"><b>Polaris Holdings</b> "Notice of unauthorised access (Booking.com account)" (Japanese)<span class="meta">2026-05-28 · the document has since been taken down from the company's site</span></span></li>
<li><span class="ty">Press</span><span class="bs"><b>Security NEXT</b> "Payout account details at lodging booking service tampered, fraudulent transfer — Polaris HD" (Japanese)<span class="meta">2026-06-03 · <a href="https://www.security-next.com/185176">security-next.com/185176</a></span></span></li>
<li><span class="ty">Press</span><span class="bs"><b>TRAICY</b> "Polaris HD suffers fraudulent transfer after unauthorised access to Booking.com; phishing messages to guests also confirmed" (Japanese)<span class="meta">2026-05-28 · <a href="https://www.traicy.com/posts/20260528371641/">traicy.com/posts/20260528371641</a></span></span></li>
<li><span class="ty">Press</span><span class="bs"><b>ScanNetSecurity</b> "Unauthorised access to Booking.com, sales payout account tampered; about ¥9 million lost" (Japanese)<span class="meta">2026-06-02 · <a href="https://scan.netsecurity.ne.jp/article/2026/06/02/55403.html">scan.netsecurity.ne.jp/article/2026/06/02/55403</a></span></span></li>
<li><span class="ty">Industry research</span><span class="bs"><b>Sekoia</b> "Phishing campaigns 'I Paid Twice' targeting Booking.com hotels and customers"<span class="meta">2025-11-06 · <a href="https://www.sekoia.com/blog/phishing-campaigns-i-paid-twice-targeting-booking-com-hotels-and-customers">sekoia.com/blog/…</a></span></span></li>
</ol>

References: Why after-the-fact detection is not proof — ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/).
