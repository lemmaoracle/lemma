---
brief_no: 158
title: "City of Portland: A supplier's bank account was switched by an impostor, and a $6.7M water-plant payment was sent elsewhere"
title_en: "City of Portland: A supplier's bank account was switched by an impostor, and a $6.7M water-plant payment was sent elsewhere"
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
sections: "proof"
gate: "account-change"
og_kicker_ja: "サイバー攻撃事例 · 振込先の変更"
og_kicker_en: "CYBERATTACK · BANK ACCOUNT CHANGE"
og_headline_ja: "取引先を装う相手に、\n振込先を書き換えられた。\n<accent>670 万ドルが別の口座へ</accent>"
og_headline_en: "Someone posing as a contractor\nswitched the bank account on file.\n<accent>$6.7M went elsewhere.</accent>"
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
  quote: "Once a bank account change arrives as the supplier's own action, it cannot be told apart from a change that passed the check that stopped the emailed request."
industries: ["public-sector"]
operations: ["payment-change", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Before paying, check a new bank account against the supplier's registered contact"
  - slug: "hold-unverified"
    item: "Do not activate changes that cannot be confirmed through the supplier's registered contact"
  - slug: "audit-trail"
    item: "Record who approved the change, and on what check"
attack_method: "impersonation"
impact: "A $6.7M water-plant payment went to an account named by someone posing as the contractor (later fully recovered)"
takeaway: "A password-reset link for the supplier account reached the impostor, and the bank account was switched. Activate a bank account change only once it is confirmed through the supplier's registered contact, whatever path it arrives by."
self_check: "When a supplier changes its bank account, do you confirm it through the supplier's registered contact before paying?"
countries: ["us"]
---

## 1. Summary

When the impostor first emailed a request to change the bank account, the city sent a check to the contact on file; it went unanswered, so nothing was changed. The impostor then asked for the supplier account's password-reset link to be resent, and it reached the impostor, not the employee. <strong>Once a bank account change arrives as the supplier's own action, it cannot be told apart from a change that passed the check that stopped the emailed request.</strong>

## 2. What got through

- **What got through**: A change of the supplier's bank account in the supplier system (SAP Ariba). Posing as an MWH employee, the impostor used a reset link to enter the supplier profile and add a new account. The city paid $6.7 million to the account on file (US DOJ; ENR, citing the city attorney's affidavit).
- **What was stopped**: In February 2025, an emailed bank-change request with a bank account confirmation letter attached was stopped when the city sent a check to the contact on file, got no answer, and made no change.
- **What reached the receiving side**: In general, a change made through a reset link arrives as the supplier's own edit after logging in. Whether the link reached the supplier or the requester cannot be told from the receiving side.
- **Who was impersonated**: A proposal manager at MWH, listed as the contract contact in the city's vendor database (press, citing the city's lawsuit). The city does not believe the employee committed the theft; the name was used.
- **Not disclosed**: Whether the impostor had broken into the contractor's email (ENR says the case probably started with an email breach through phishing; speculation), and whether the reset link went to an address imitating the contractor's. No arrests had been made as of September 2025.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever activates a supplier's bank account matches the change to the supplier's request, through the registered contact rather than any address the requester supplies, before it takes effect.

- **Who approves**: The supplier. The change is approved through the contact registered in advance (not a contact written in the requesting email). A reset link goes only to that registered contact.
- **Where it is checked**: The part of the supplier system that activates a bank account. Emailed requests, the supplier's own edits in a portal, and edits after a password reset are all checked at one point before activation. A change that does not match an approval is not activated, and payments to that account are held until the check is done.
- **What is recorded**: Which supplier's bank change came through which path, and who approved it through which contact. The record is looked at before paying.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means matching, before a bank change takes effect, whether the supplier requested it, through the registered contact, and keeping a record. Detection means noticing possible fraud after the transfer. The dates below follow press reports.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Match the change to the registered contact before it takes effect</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>$6.7M went to another account<br>Later returned in full</span></div>
<div class="rx-zone det"><b>Detection · worked</b>The receiving bank flags possible fraud; the city asks to block the payment</div>
<div class="rx-g g1"><div class="t">2025-02</div><b>Emailed request stopped by a check</b></div>
<div class="rx-g g2"><div class="t">2025-02 to 03</div><b>Bank account switched via reset link</b></div>
<div class="rx-g g3"><div class="t">03-21</div><b>$6.7M transferred</b></div>
<div class="rx-g g4"><div class="t">03-25</div><b>Receiving bank flags possible fraud</b></div>
</div>
</figure>

The first emailed request was stopped by a check with the contact on file, but nothing says where the reset link was sent was checked. The money came back through the receiving bank's alert and the seizure; the transfer itself went through. A similar case, where a payout account was switched in the legitimate admin screen, is [Polaris Holdings / Booking.com](/critical/briefs/032-booking-payout-account-tampering/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that activates a supplier's bank account change.** It does not look for intrusions; it confirms, before activation, that the change rests on the supplier's request, through the registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Cities and public bodies with many contractors and large payments. Contractor and contact names are visible in public bids and contracts.
- **Industry · Construction**: Large projects run long chains of payments from owners and general contractors. Pauses and restarts are often public.
- **Operation · Bank account changes**: Changes to a supplier's bank account, and resets of a supplier's login.

### Current controls vs Lemma

The route in this case is column 2 (a change in the portal after a password reset). The first emailed request is column 1, and it was stopped by a check. Column 3 is where the registered contact itself has been taken over; whether that was so here has not been disclosed.

| Control | Emailed change request | Portal change after a password reset | Registered contact itself taken over |
| --- | --- | --- | --- |
| Check with the contact on file | Effective | Not effective | Not effective |
| Supplier self-service portal | Not relevant | Not effective | Not effective |
| Bank fraud detection | Partial | Partial | Partial |
| Staff training | Partial | Partial | Not effective |
| **Lemma (pre-execution check)** | Effective | Effective | Not effective |

A check with the contact on file worked on the emailed request, but it does not cover the reset link unless the link's destination uses it too. A self-service portal makes the input of whoever has the login look like the supplier's own. Bank detection and staff training work only in limited places, and in this case the transfer itself was not stopped. Lemma checks the bank change itself against the registered contact before it takes effect.

Note: Lemma's check works only when it is built into the system that activates bank accounts, every change — by email, in the portal, after a password reset — passes the same check, and the contact used for approval is managed apart from the system that receives the change. It passes if the registered contact itself has been taken over. The check protects where payments go; an impostor falsifying what an invoice asks for still needs separate controls. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about supplier bank accounts

- Can a reset of a supplier's login be sent anywhere other than the registered contact?
- Do you hold payments to a newly changed account until the check is done?
- Do you confirm bank changes through the registered contact, not a contact found in the email that asked for the change?

## 5. Facts and timeline

- **Party**: The City of Portland, Oregon. A joint venture of MWH Constructors and Kiewit (MWH-Kiewit) is building the Water Bureau's Bull Run Filtration Project, a roughly $2.1 billion plant.
- **Loss**: A $6.7 million construction payment went to an account named by the impostor. On April 16, 2025, the FBI seized $6,748,680 still in that account (US DOJ). In August the US Marshals Service returned the funds to the city (press).
- **Receiving account**: An attorney trust account in the name of a New York law firm. The city briefly sued the firm, then dropped the suit after the firm showed it was also a victim (press).

### Timeline

- **2025-02**: The city rolls out SAP Ariba and requires contractors to use it. The same month, an email in an MWH employee's name asks to change the bank account. The city sends a check to the contact on file; it goes unanswered, and no change is made. The impostor then asks for the reset link to be resent, and the city sends it.
- **2025-03-21**: The city transfers $6.7 million. Settlement date is March 25.
- **2025-03-24**: The impostor emails that the bank details were wrong and asks to switch to another account. ENR says this attempted switch apparently set off the fraud alarm.
- **2025-03-25**: Chase, the receiving bank, alerts Wells Fargo, the city's bank, to possible fraud. The city's deputy controller orders the payment rejected or blocked.
- **2025-04-02**: The impostor starts calling the city to ask about the payment (10 calls in all).
- **2025-04-04**: The Water Bureau confirms the MWH employee was impersonated.
- **2025-04-16**: The FBI obtains a warrant and seizes $6,748,680.
- **2025-05-23**: The US Attorney's Office for the District of Oregon announces a civil forfeiture action.
- **2025-08**: The US Marshals Service returns the funds to the city.

> The February requests and the March 21–25 events rely on ENR's reporting of the city attorney's affidavit; we have not seen the affidavit itself. The February change (an impostor accessed a payment system and changed the bank account) and the seizure amount and date rely on the US DOJ release (primary). Whether the link went to an address imitating the contractor's has not been disclosed. What has not been disclosed does not mean there were no controls. The DOJ dates the change to February; ENR's sequence puts the link and the change about two weeks before March 21, possibly in early March.

### After disclosure

- **City of Portland**: Sued the New York law firm holding the receiving account to keep the funds from moving, then dropped the suit after the firm cooperated with the FBI and showed it was also a victim (press). The mayor said fast action by local and federal law enforcement stopped the transfer "before it landed in the wrong hands" (press).
- **US DOJ**: Urged victims of similar scams to contact law enforcement without delay, noting the recovery was possible only because the city reported it.

## 6. Sources

- **US Attorney's Office, District of Oregon (Primary)**: "United States Files Forfeiture Action to Recover $6.7 Million in Stolen Funds" (2025-05-23) — <https://www.justice.gov/usao-or/pr/united-states-files-forfeiture-action-recover-67-million-stolen-funds>
- **ENR (Press, citing the city attorney's affidavit)**: "How Portland, Ore., Recovered a Stolen $6.7M Payment Meant for MWH-Kiewit" (2025-09-19) — <https://www.enr.com/articles/61379-how-portland-ore-recovered-a-stolen-67m-payment-meant-for-mwh-kiewit>
- **Willamette Week (Press, citing the city's lawsuit)**: "Feds Investigate $6.7 Million in Stolen Vendor Payments From Bull Run Filtration Project" (2025-04-23) — <https://www.wweek.com/news/city/2025/04/23/feds-investigating-67-million-in-allegedly-stolen-vendor-payments-from-bull-run-filtration-project/>
- **Willamette Week (Press)**: "City Recovers $6.7 Million From Scam That Targeted the Water Bureau" (2025-08-29) — <https://www.wweek.com/news/city/2025/08/29/city-recovers-67-million-from-scam-that-targeted-the-water-bureau/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
