---
brief_no: 214
title: "米クランベリー町：土地の購入代金が、偽の振込の指示で別の口座へ送られた(町の公表・警察署長の説明)"
title_en: "Cranbury Township, New Jersey: The purchase price for land was wired to another account on fraudulent wiring instructions (township statements and police chief's remarks)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-09-28
published: 2026-11-20
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["174-mobile-alabama-arena-contractor-bank-change", "200-logix-aero-lookalike-domain-engine-sale-invoice"]
status: draft
version: "1.0"
og_lead_ja: "米ニュージャージー州クランベリー町、土地の購入の代金約 2,600 万ドルが偽の振込の指示で送られ、1,730 万ドル近くが凍結された"
og_lead_en: "Cranbury Township, New Jersey wired about $26M for a land purchase on fraudulent instructions; nearly $17.3M has been frozen"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 偽の振込指示"
og_kicker_en: "CYBERATTACK · FAKE WIRE DETAILS"
og_headline_ja: "土地の代金が、\n偽の振込の指示で\n送られた。\n<accent>約 2,600 万ドル</accent>"
og_headline_en: "A town's land payment\nfollowed fake wiring\ninstructions.\n<accent>About $26M sent away.</accent>"
key_figures:
  - value: "~$26M"
    label: "Township funds for a land purchase to meet affordable housing obligations, sent by wire transfer (township statement)"
    tone: "alert"
  - value: "~$17.3M"
    label: "Assets frozen by investigators (township statement). How much will return to the township is unknown; the rest appears to have been dispersed across multiple accounts (police chief's statement)"
  - value: "09-28 → 11-06"
    label: "From the wire transfer to the township telling residents. The police chief says an earlier announcement risked letting the perpetrators move the funds"
glossary:
  - term: "Affordable housing"
    desc: "Housing priced for low- and moderate-income households. New Jersey municipalities carry obligations to provide a set number of units, and buy land and take other steps to meet them."
  - term: "Wiring instructions"
    desc: "In a property closing or similar payment, the message giving the bank, account number and account name the money should go to. In the US, fraud that delivers fake instructions just before closing is well known."
  - term: "Township Committee"
    desc: "The governing body of a New Jersey township. The mayor is chosen from among its members."
insight:
  slug: "closing-wire-instructions-unverified"
  stop: true
  label: "Wiring instructions that arrive before closing"
  quote: "Before wiring money for a land purchase, check the account in the wiring instructions with the receiving side's registered contact, not the channel the instructions came through."
industries: ["public-sector"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "Confirm the account in wiring instructions received before closing through the receiving side's registered contact before using it"
  - slug: "hold-unverified"
    item: "Hold large wires to accounts that cannot be confirmed through the registered contact"
  - slug: "audit-trail"
    item: "Record which wiring instructions' account was used, who confirmed it, and how"
attack_method: "impersonation"
impact: "About $26M in township funds for a land purchase went out on fraudulent wiring instructions; nearly $17.3M has been frozen"
takeaway: "As the township prepared to close on land for affordable housing, fraudulent wiring instructions arrived, and about $26M was sent to the account they named. Check wiring instructions received before closing with the receiving side's registered contact before using them."
self_check: "When wiring instructions arrive before a large closing, do you check the account with the receiving side's registered contact before sending the money?"
countries: ["us"]
search_title: "米クランベリー町 2,600万ドル送金詐欺の経緯と対策"
search_description: "米ニュージャージー州クランベリー町が、土地の購入代金約2,600万ドルを偽の振込の指示で送り、1,730万ドル近くが凍結された（町の公表）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. Summary

On 28 September 2026, Cranbury Township in New Jersey (population about 4,000) wired about $26 million meant for buying land to meet its affordable housing obligations, and the money was stolen (township statement). According to a local newspaper, the police chief said the township had received fraudulent wiring instructions as it prepared to close on the property.

The township told residents on 6 November. A task force led by the township police and the county prosecutor's office, with state and federal agencies, is investigating and has frozen nearly $17.3 million in assets. The police chief believes the rest has been dispersed across multiple accounts. Whom the instructions imitated and how they arrived have not been disclosed while the investigation continues.

<strong>If wiring instructions are not checked with a contact on file, the money goes straight to the account they name.</strong>

## 2. What got through

- **What got through**: A wire transfer of about $26 million, the purchase price for land for affordable housing. The township sent it on 28 September and the funds were stolen (township statement).
- **What arrived first**: According to MyCentralJersey, the police chief told the 9 November committee meeting that the township had received fraudulent wiring instructions as it prepared to close on the property. In whose name, and by what means, they arrived has not been disclosed.
- **What reached the accepting side**: In general, the paying side in a property closing receives the bank, account number and account name, sent in the name of the seller or a closing agent. Because they arrive just before closing, they tend to be handled in a rush to send the money.
- **Not disclosed**: The land and the seller. Whom the instructions imitated. How they arrived, and how they were created or altered. What checks were made before the wire. When, and by whom, the fraud was noticed. The receiving account and bank. How much will return to the township.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before wiring money for a land purchase, the payer checks that the account in the wiring instructions was approved by the receiving side, separately from the channel the instructions came through.

- **Who approves**: The receiving side (the seller or a closing agent). It registers the destination account at the start of the closing process and approves any change through a contact registered in advance. Phone numbers or addresses written in the instructions are not used.
- **Where it is checked**: The approval step before the wire is sent. The account in the instructions is compared with the registered account; if it differs, the wire is held until it can be checked against the receiving side's approval.
- **What is recorded**: Which wiring instructions' account was used, and who confirmed it through which contact. In freezing, recovery and insurance claims, the payer can show what was confirmed before the money went.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before wiring money for a land purchase, the account in the wiring instructions with the receiving side's registered contact. Detection means acting on a report of possible fraud after the wire, through investigation and freezing. Dates are in 2026 and rely on township statements and a local newspaper's report of the police chief's remarks.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the account in the instructions with the receiving side's registered contact before wiring</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A wire of about $26M was stolen<br>Nearly $17.3M frozen</span></div>
<div class="rx-zone det"><b>Detection · worked after the wire</b>Police reach Town Hall about six minutes after the alert and call the FBI</div>
<div class="rx-g g1"><div class="t">Before closing</div><b>Fraudulent wiring instructions arrive as the closing is prepared</b></div>
<div class="rx-g g2"><div class="t">09-28</div><b>The township wires about $26M</b></div>
<div class="rx-g g3"><div class="t">After discovery</div><b>Investigators trace the funds and freeze nearly $17.3M</b></div>
<div class="rx-g g4"><div class="t">11-06</div><b>The township tells residents</b></div>
</div>
</figure>

The township learned of the fraud only after the wire had gone. A local government that paid someone posing as a vendor is the [City of Mobile](/critical/briefs/174-mobile-alabama-arena-contractor-bank-change/) (an email posing as the contractor changed the account in the city's records). A case where the account in sale documents was rewritten is [Logix Aero](/critical/briefs/200-logix-aero-lookalike-domain-engine-sale-invoice/) (a party using lookalike domains rewrote the account in contracts and invoices). Here, it was not a regular monthly payment: the whole amount went in one wire on instructions received before a one-off land closing.

## 4. What Lemma does

**Lemma builds the pre-execution check into the approval before money for a closing is wired.** It does not look for fake instructions; it checks, before the wire, that the account in the instructions was approved through the receiving side's registered contact.

### Industries and operations to watch

- **Industry · Public sector**: Local governments and public bodies that buy land or buildings and send the closing money in one payment. Meeting agendas and public plans can reveal from outside when, and for what, a closing is due.
- **Operation · Bank account changes**: Instructions naming the destination account, and notices changing it, that arrive before a closing.
- **Operation · Approval**: Approving a single large wire to a party paid for the first time.

### Current controls vs Lemma

The route in this case is column 1 (wiring instructions received before closing) and column 2 (the wire to the account they named). How the instructions arrived has not been disclosed. Column 3 covers instructions sent from the receiving side's genuine mailbox after a takeover; whether that happened here has not been disclosed.

| Control | Wiring instructions received before closing | Wire to the account in the instructions | Takeover of the receiving side's mailbox |
| --- | --- | --- | --- |
| Sender checks (domain display, warnings) | Partial | Not relevant | Not effective |
| Wire approval (matching amount to closing documents) | Not effective | Not effective | Not effective |
| Bank check of the payee name | Not relevant | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Partial |

Sender checks flag lookalike domains and the like through a display or warning, but do not work when instructions come by phone or on paper, or from a genuine account. Matching the amount to the closing documents agrees when the amount and the counterparty's name are genuine. A bank's payee-name check flags an account name that differs from the party in the instructions, but does not work when the account name has been made to look similar or the wire is sent without looking at the result. Lemma checks not how the instructions look but whether the account can be matched to the receiving side's approval, before the wire.

Note: Lemma's check works only when it is built into the approval before the wire, and the receiving side's approval comes through a contact or key registered at the start of the closing, separate from the channel that delivered the instructions. If confirmation uses a contact written in the instructions, or the registered contact itself has been changed, it can pass. If the receiving side's mailbox is taken over and the contact used for confirmation is that mailbox, it can pass. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusion or impersonation, and it does not recover funds already sent.

### Checklist

Three things to confirm about wires for land and building closings

- Do you register the destination account and the receiving side's contact at the start of the closing process?
- When account instructions or changes arrive just before closing, is there a procedure to hold the wire until they are confirmed through the registered contact?
- If possible fraud is found after a wire, is there a set procedure to contact your bank, the receiving bank and law enforcement immediately?

## 5. Facts and timeline

- **Party**: Cranbury Township, Middlesex County, New Jersey. Population about 4,000 (press).
- **Loss**: A wire transfer of about $26 million, meant for buying land to meet affordable housing obligations, was stolen (township). The township calls it a "sophisticated financial theft".
- **Method**: According to MyCentralJersey, the police chief said the township had received fraudulent wiring instructions as it prepared to close on the property. How they arrived and whom they imitated have not been disclosed.
- **Route of intrusion**: Under investigation. The township says it cannot share details while the investigation is active. Whether township IT systems or email were compromised has not been disclosed.
- **Discovery**: According to MyCentralJersey, police reached Town Hall about six minutes after being alerted to possible fraud, and the police chief's first call was to the FBI. Who raised the alert, and when, has not been disclosed.
- **Frozen and remaining funds**: Investigators have frozen nearly $17.3 million in assets (township). The police chief believes the frozen funds are the largest identifiable portion of the stolen money and that the rest has been dispersed across multiple accounts, transactions and other channels (police chief's statement). MyCentralJersey puts the remainder at about $9 million and roughly $8.7 million; WHYY reports the police chief putting it at about $9 million.
- **Insurance**: The township is working with its insurers on possible recovery (township). WHYY reports that the Wall Street Journal reported a policy covering this type of loss up to $5 million.

### Timeline

- **Before closing**: Fraudulent wiring instructions reach the township as it prepares to close on the land (police chief's remarks, local newspaper).
- **2026-09-28**: The township wires about $26 million and the funds are stolen (township).
- **After discovery**: The police chief directs township employees not to discuss the investigation publicly; the directive later extends to the mayor and the committee (police chief's statement).
- **2026-11-06**: The township discloses the theft in an official statement and a letter from the mayor to residents, including the freezing of nearly $17.3 million.
- **2026-11-09**: The police chief issues a statement. At that day's committee meeting, the chief describes the fraudulent wiring instructions (local newspaper), and the committee introduces ordinances creating assistant township administrator and assistant chief financial officer posts.
- **2026-11-11**: The mayor says the township is compiling an FAQ from residents' questions and setting up a section of its website for updates.

> The date and size of the wire, the purpose of the funds, the investigative set-up, the freezing of nearly $17.3 million and the committee's measures rely on the township's official statement and the mayor's letter (6 November, primary). The view of the frozen and remaining funds and the confidentiality directive rely on the police chief's statement (9 November, primary). The fraudulent wiring instructions, the police arriving in about six minutes and the call to the FBI rely on a local newspaper's report of the chief's remarks at the committee meeting (MyCentralJersey, 10 November) and are not confirmed in township documents. Whom the instructions imitated, how they arrived, the land and the seller, and the receiving account have not been disclosed. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the township's response.

### After disclosure

- **Investigation**: A multi-agency task force led by the township police and the Middlesex County Prosecutor's Office, with state and federal agencies, is tracing the funds and pursuing those involved (township, police chief). According to the local newspaper, subpoenas are still being issued.
- **Timing of disclosure**: The police chief says the timing and content of the release were the chief's own decision, and that an earlier public statement could have let the perpetrators move the funds (police chief's statement).
- **Township measures**: The committee introduced ordinances creating assistant township administrator and assistant chief financial officer posts, and considered a resolution appointing the municipal accounting firm PKF O'Connor Davies for financial consulting (township). According to the local newspaper, the affordable housing plan will continue on a revised schedule.

## 6. Sources

- **Cranbury Township (Primary, official statement)**: "CRANBURY TOWNSHIP OFFICIAL STATEMENT- November 6, 2026" (2026-11-06) — <https://www.cranburytownship.org/m/newsflash/Home/Detail/119>
- **Cranbury Township (Primary, mayor's letter)**: "A Message to Cranbury Township Residents- November 6, 2026" (2026-11-06) — <https://www.cranburytownship.org/m/newsflash/Home/Detail/120>
- **Cranbury Township Police Department (Primary, police chief's statement)**: "Statement from the Chief of Police" (2026-11-09) — <https://www.cranburytownship.org/m/newsflash/Home/Detail/121>
- **Cranbury Township (Primary, mayor's update)**: "Mayor's Update- November 11, 2026" (2026-11-11) — <https://www.cranburytownship.org/m/newsflash/Home/Detail/123>
- **MyCentralJersey (Press, report of the committee meeting)**: "Cranbury $26M theft began with fraudulent wire instructions" (2026-11-10) — <https://www.yahoo.com/news/us/articles/where-cranburys-missing-9m-police-144027105.html>
- **WHYY (Press)**: "Cyberthieves trick a Central Jersey town into wiring them $26 million, mayor says" (2026-11-13) — <https://whyy.org/articles/cranbury-township-new-jersey-cybertheft-wire/>
- **Patch (Press)**: "$26M Wire Theft Hits Middlesex Co. Town; $17.3M Frozen So Far" (2026-11-09) — <https://patch.com/new-jersey/southbrunswick/26m-wire-transfer-theft-hits-middlesex-co-town-officials-reveal>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
