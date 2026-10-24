---
brief_no: 158
title: "米ポートランド市：取引先を装う相手が、パスワード再設定のリンクで取引先登録に入り、工事代金を別の口座へ送らせた(米司法省ほか) — 新しい振込先を、取引先の登録済みの連絡先で照合してから払う層が無い"
title_en: "City of Portland: An impostor used a password-reset link to enter a contractor's supplier account and had a construction payment sent elsewhere (US DOJ and others) — Nothing checks a new bank account against the supplier's registered contact before paying"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2025-03-21
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "米ポートランド市、取引先を装う相手に振込先を変えられ浄水場の工事代金 670 万ドルが別口座へ"
og_lead_en: "City of Portland: a supplier's bank account was switched, and a $6.7M water-plant payment went elsewhere"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "取引先を装う相手に、\n振込先を書き換えられた。\n<accent>670 万ドルが別の口座へ</accent>"
og_headline_en: "Someone posing as a contractor\nswitched the bank account on file.\n<accent>$6.7M went elsewhere.</accent>"
summary_labels: ["What happened", "Why it went through", "The missing layer"]
key_figures:
  - value: "$6.7M"
    label: "A water-plant construction payment owed to the contractor, sent to an account named by the impostor (US DOJ)"
    tone: "alert"
  - value: "03-21 → 03-25"
    label: "From the city's transfer to the receiving bank flagging possible fraud (press, citing the city's affidavit)"
  - value: "All"
    unit: "recovered"
    label: "Returned to the city by the US Marshals Service in August 2025 (press)"
glossary:
  - term: "SAP Ariba"
    desc: "A cloud service for managing supplier records, invoices and payments. Portland rolled it out in February 2025 and required its contractors to use it."
  - term: "Password-reset link"
    desc: "A link sent when someone cannot log in, used to set a new password. Whoever receives it can get into the account."
  - term: "Civil forfeiture"
    desc: "A civil procedure that lets the government seize criminal proceeds and return them to victims without waiting for a criminal conviction."
insight:
  slug: "reset-link-to-requester"
  label: "A reset link reaches the requester"
  quote: "The emailed request to change the bank account was stopped by a check sent to the contact on file. The password-reset link for the supplier account that followed reached the requester, and the bank account was switched there."
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Before paying, check that a new bank account belongs to the supplier"
  - slug: "hold-unverified"
    item: "Do not activate changes that cannot be confirmed through the supplier's registered contact"
  - slug: "audit-trail"
    item: "Record who approved the change, and on what check"
attack_method: "impersonation"
impact: "A $6.7M water-plant payment went to an account named by someone posing as the contractor (later fully recovered)"
takeaway: "A password-reset link for the supplier account reached the impostor, and the bank account was switched. Nothing checked the new account against the supplier's registered contact before paying."
self_check: "When a supplier changes its bank account, do you confirm it through the supplier's registered contact before paying?"
countries: ["us"]
---

## 1. TL;DR

In March 2025 the City of Portland, Oregon, sent $6.7 million owed to the joint venture building its water filtration plant to an account named by someone posing as one of the contractor's employees. The impostor had changed the contractor's bank account in SAP Ariba, the city's supplier system (US DOJ; press citing the city's affidavit).

The city had not acted on an earlier emailed change after its check to the contact on file went unanswered. The impostor then asked for the password-reset link to be resent, and it reached the impostor. From there, the change looked like the contractor's own legitimate edit.

On March 25 the receiving bank flagged possible fraud and the city asked for the payment to be blocked; the funds were still in the receiving account, were seized in April and later fully returned. The March 21 transfer still went out. What failed was the layer that checks a new bank account against the supplier's registered contact before paying.

## 2. What happened

- **Party**: The City of Portland, Oregon. A joint venture of MWH Constructors and Kiewit (MWH-Kiewit) is building the Water Bureau's Bull Run Filtration Project, a roughly $2.1 billion plant.
- **Who was impersonated**: A proposal manager at MWH, listed as the contract contact in the city's vendor database (press, citing the city's lawsuit). The city does not believe the employee committed the theft; the name was used.
- **Loss**: A $6.7 million construction payment went to an account named by the impostor. On April 16, 2025, the FBI seized $6,748,680 still in that account (US DOJ). In August the US Marshals Service returned the funds to the city (press).
- **Receiving account**: An attorney trust account in the name of a New York law firm. The city briefly sued the firm, then dropped the suit after the firm showed it was also a victim (press).
- **Initial access**: Whether the impostor had broken into the contractor's email has not been disclosed. ENR says the case probably started with an email breach through phishing (speculation). No arrests had been made as of September 2025.

The attack ran as follows (per ENR, citing the city attorney's affidavit).

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain, as far as disclosed</span></div>
<p class="rx-ex-cap">The stopping point is ③. Had the link's destination, or the new bank account, been checked against the supplier's registered contact, the transfer in ④ would not happen. The check in ① worked.</p>
<div class="rx-chain">
<div class="rx-step good"><div class="who">City</div><div class="no">1</div><b>Checks an emailed bank-change request with the contact on file</b><p>February 2025. A bank account confirmation letter was attached. The check went unanswered, and the city made no change.</p></div>
<div class="rx-step crit"><div class="who">Impostor</div><div class="no">2</div><b>Told to use SAP Ariba, asks for the reset link to be resent</b><p>Asked for it to go to an address that looked like the same one.</p></div>
<div class="rx-step crit"><div class="who">Impostor</div><div class="no">3</div><b>Uses the link to enter the supplier profile and adds a new account</b><p>The link reached the impostor, not the employee.</p></div>
<div class="rx-step crit"><div class="who">City</div><div class="no">4</div><b>Sends $6.7M to the account on file</b><p>March 21. Settlement date March 25.</p></div>
<div class="rx-step good"><div class="who">Banks, city</div><div class="no">5</div><b>The receiving bank flags possible fraud; the city asks to block the payment</b><p>March 25. The funds were still in the receiving account.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2025-02**: The city rolls out SAP Ariba and requires contractors to use it. The same month, an email in an MWH employee's name asks to change the bank account. The city sends a check to the contact on file; it goes unanswered, and no change is made. The impostor then asks for the reset link to be resent, and the city sends it.
- **2025-03-21**: The city transfers $6.7 million. Settlement date is March 25.
- **2025-03-24**: The impostor emails that the bank details were wrong and asks to switch to another account. ENR says this attempted switch apparently set off the fraud alarm.
- **2025-03-25**: Chase, the receiving bank, alerts Wells Fargo, the city's bank, to possible fraud. The city's deputy controller orders the payment rejected or blocked.
- **2025-04-02**: The impostor starts calling the city to ask about the payment (10 calls in all).
- **2025-04-04**: The Water Bureau confirms the MWH employee was impersonated.
- **2025-04-16**: The FBI obtains a warrant and seizes $6,748,680.
- **2025-05-23**: The US Attorney's Office for the District of Oregon announces a civil forfeiture action.
- **2025-08**: The US Marshals Service returns the funds to the city.

> The February requests and the March 21–25 events rely on ENR's reporting of the city attorney's affidavit; we have not seen the affidavit itself. The February change (an impostor accessed a payment system and changed the bank account) and the seizure amount and date rely on the US DOJ release (primary). Whether the link went to an address imitating the contractor's has not been disclosed. The DOJ dates the change to February; ENR's sequence puts the link and the change about two weeks before March 21, possibly in early March.

### After disclosure

- **City of Portland**: Sued the New York law firm holding the receiving account to keep the funds from moving, then dropped the suit after the firm cooperated with the FBI and showed it was also a victim (press). The mayor said fast action by local and federal law enforcement stopped the transfer "before it landed in the wrong hands" (press).
- **US DOJ**: Urged victims of similar scams to contact law enforcement without delay, noting the recovery was possible only because the city reported it.

## 4. Why it wasn't stopped

The failure was neither in spotting the email nor in the bank's detection. **An operation that switched the supplier's bank account took effect, and was used for payment, without being checked against the supplier's registered contact.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before paying, that a new bank account really belongs to the supplier, through the supplier's registered contact, and keeping a record. Detection means noticing possible fraud after the transfer.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent</b>Check a new account with the supplier before paying</div>
<div class="rx-zone gapz"><b>Gap</b><span>$6.7M went to<br>another account</span></div>
<div class="rx-zone det"><b>Detection layer · worked</b>The receiving bank flags possible fraud</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Reset link to the impostor</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Bank account switched</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>03-21 transfer</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>03-25 bank alert</b></div>
</div>
</figure>

The first emailed request was stopped by a check with the contact on file, but nothing says where the reset link was sent was checked, and a change made through it is indistinguishable from the supplier's own edit. The money came back through the receiving bank's alert and the seizure; the transfer itself went through. That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/) (a hotel's payout account was switched in the legitimate admin screen).

## 5. How to counter this

**Activate a supplier's bank account change only once it is confirmed through the supplier's registered contact, whatever path it arrives by**: an emailed request, a supplier's own edit in a portal, or an edit after a password reset. Then an impostor who obtains a login still cannot redirect payments. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · Public sector**: Cities and public bodies with many contractors and large payments. Contractor and contact names are visible in public bids and contracts.
- **Industry · Construction**: Large projects run long chains of payments from owners and general contractors. Pauses and restarts are often public.
- **Operation · Bank account changes**: Changes to a supplier's bank account, and resets of a supplier's login.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Check with the contact on file | Partial | Worked on the emailed request. Nothing says the reset link's destination was checked. |
| Supplier self-service portal | Partial | Suppliers enter their own details, but an impostor with the login also looks like the supplier. |
| Bank fraud detection | Partial | The receiving bank's alert and the seizure brought the money back. It does not stop the transfer. |
| Staff training | Partial | Staff caught the first request. Training does not cover every other path in the process. |

### What is needed

1. **Put bank changes and login resets through the same check.** Activate either only when confirmed through the supplier's registered contact. Never send to an address the requester supplies.
2. **Check that a new account belongs to the supplier before paying.** Match the account holder to the supplier before any payment.
3. **Record who approved the change, and on what check.** Look at that record before paying, and pay only to accounts that carry it. Keep it in a form a third party can verify later, as proof.

### Checklist

Three things to confirm about supplier bank accounts

- Can a reset of a supplier's login be sent anywhere other than the registered contact?
- Do you hold payments to a newly changed account until the check is done?
- Do you confirm bank changes through the registered contact, not a contact found in the email that asked for the change?

Note: if the supplier's registered contact itself is compromised, this check can be passed. And it protects where payments go; an impostor falsifying what an invoice asks for still needs separate controls.

## 6. Sources

- **US Attorney's Office, District of Oregon (Primary)**: "United States Files Forfeiture Action to Recover $6.7 Million in Stolen Funds" (2025-05-23) — <https://www.justice.gov/usao-or/pr/united-states-files-forfeiture-action-recover-67-million-stolen-funds>
- **ENR (Press, citing the city attorney's affidavit)**: "How Portland, Ore., Recovered a Stolen $6.7M Payment Meant for MWH-Kiewit" (2025-09-19) — <https://www.enr.com/articles/61379-how-portland-ore-recovered-a-stolen-67m-payment-meant-for-mwh-kiewit>
- **Willamette Week (Press, citing the city's lawsuit)**: "Feds Investigate $6.7 Million in Stolen Vendor Payments From Bull Run Filtration Project" (2025-04-23) — <https://www.wweek.com/news/city/2025/04/23/feds-investigating-67-million-in-allegedly-stolen-vendor-payments-from-bull-run-filtration-project/>
- **Willamette Week (Press)**: "City Recovers $6.7 Million From Scam That Targeted the Water Bureau" (2025-08-29) — <https://www.wweek.com/news/city/2025/08/29/city-recovers-67-million-from-scam-that-targeted-the-water-bureau/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
