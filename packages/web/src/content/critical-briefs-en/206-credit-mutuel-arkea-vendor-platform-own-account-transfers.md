---
brief_no: 206
title: "Crédit Mutuel Arkéa：委託先のプラットフォームを経て入った攻撃者に、銀行の自己勘定から他行への送金を通された(同行の公表)"
title_en: "Crédit Mutuel Arkéa: Attackers who came in through a service provider's platform pushed transfers from the bank's own account to other banks (bank's disclosure)"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [code-provenance]
incident_date: 2026-11-04
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["201-bank-sinopac-vendor-setting-unauthorized-transfers", "081-bybit-safe-wallet-ui-injection", "204-ntt-data-stdirect-vendor-saas-admin-rights"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "ca36e6fe8d7d863b"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "フランスの Crédit Mutuel Arkéa で、委託先のプラットフォームを経て入った攻撃者が、銀行の自己勘定から他行へ送金した。同行は報道の 1 億 1,800 万ユーロについて、額は確認せず桁だけを認めた"
og_lead_en: "At France's Crédit Mutuel Arkéa, attackers who came in through a service provider's platform sent money from the bank's own account to other banks. The bank confirmed only the order of magnitude of the reported €118 million"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 委託先のプラットフォーム"
og_kicker_en: "CYBERATTACK · VENDOR PLATFORM"
og_headline_ja: "委託先を経て、\n銀行の自己勘定\nから送金が出た。\n<accent>約 1 億ユーロ規模</accent>"
og_headline_en: "Via a vendor's platform,\nmoney left the bank's\nown account.\n<accent>Around €100m in scale.</accent>"
key_figures:
  - value: "c. €100"
    unit: "million"
    label: "Scale of the money sent from the bank's own account. On the reported €118 million ($133 million), the bank did not confirm the amount and validated only the order of magnitude (bank's FAQ). AFP reported that the bank gave a provisional estimate of around €100 million"
    tone: "alert"
  - value: "11-02 → 11-04"
    label: "From the day blockchain investigator ZachXBT flagged suspicious crypto withdrawals to the day the bank disclosed the attack (Silicon.fr, CSO, bank's press release)"
glossary:
  - term: "Own account (compte propre)"
    desc: "The account a bank uses to settle its own funds, separate from customer accounts. According to Crédit Mutuel Arkéa, the attackers used this account to send money to other banks, and no customer account was used."
  - term: "Service provider (prestataire)"
    desc: "An outside company that handles part of a bank's operations or systems. The bank says the attackers reached it through the platform of one of its service providers, but it has not named the provider or described the platform."
  - term: "OFAC"
    desc: "France's police cybercrime investigation office (Office anticybercriminalité), to which the Paris prosecutor assigned the case."
insight:
  slug: "own-account-transfer-reached-via-vendor"
  stop: true
  label: "Own-account transfers reachable through a vendor's route"
  quote: "Before sending money from the bank's own account to another bank, check the instruction against the registered officer's approval, the registered payee and the cap, not against the route it arrived by."
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "verify-entry"
    item: "Before executing an instruction to transfer from the bank's own account, confirm that it is tied to a registered officer's approval, not just that it reached an internal system"
  - slug: "hold-unverified"
    item: "Hold, before execution, instructions not tied to a registered officer's approval, instructions to unregistered payees, and instructions over the per-transfer or daily cap"
  - slug: "audit-trail"
    item: "Keep, apart from the service provider's systems, a record of which route each own-account transfer arrived by, whose approval it passed and which payee it went to"
attack_method: "supply-chain"
impact: "Attackers who came in through a service provider's platform sent money from the bank's own account to other banks. The bank validated the order of magnitude of the reported €118 million but did not confirm the amount, and says customer assets were not affected"
takeaway: "Attackers who came in through a service provider's platform pushed transfers from the bank's own account to other banks. Execute own-account transfers only after checking them against the registered officer's approval, the payee and the cap, not the route they arrived by."
self_check: "Do you know whether transfers from your own accounts are checked against a registered officer's approval, for each route an instruction can arrive by, before they are executed?"
countries: ["fr"]
---

## 1. Summary

On 4 November 2026 the French banking group Crédit Mutuel Arkéa (parent of Crédit Mutuel de Bretagne, Crédit Mutuel du Sud-Ouest, Fortuneo and others) said an attack had allowed fraudulent transactions. According to the bank, the attackers used its own account to send money to other banks, and the funds may then have been converted into cryptocurrency. No customer account was used, and the bank says customer assets were not affected.

In an FAQ the same day, the bank said the attackers reached it directly through the platform of one of its service providers, and called it a sophisticated outside attack rather than human error. On the reported €118 million, it did not confirm the amount but validated the order of magnitude, and said part of the funds had been blocked. The provider's name and the details of the method have not been disclosed. The Paris prosecutor is investigating.

<strong>That a transfer instruction came from inside the bank's own systems does not show that a bank officer approved it.</strong>

## 2. What got through

- **What got through**: Transfers from the bank's own account to other banks. According to Crédit Mutuel Arkéa, the attackers used its own account to carry out transactions to other banks, and the money may then have been converted into cryptocurrency on specialised platforms. No customer account was used. After detection the bank temporarily suspended some transactions, and almost all resumed on the morning of 4 November.
- **What reached the accepting side**: In general, the step in which a bank executes a transfer to another bank receives from internal systems an instruction naming the source account, the payee and the amount. Whether the instruction passed an officer's approval arrives only as the verdict of the system that issued it. According to the bank, the attackers reached it directly through a service provider's platform.
- **Not disclosed**: The provider's name and the kind of platform. How the attackers got from the provider's platform to own-account transfers (the bank says it is working with the authorities to establish the origin and method of the attack). The number of transfers, the payees and the period. The final amount and the amount blocked. Some reports said Fortuneo was the way in; the bank denies this.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before money is sent from the bank's own account to another bank, the instruction is checked as having passed a registered officer's approval, against the approval record, the payee and the cap, apart from the verdict of the system it arrived from.

- **Who approves**: The bank's treasury officer. For each own-account transfer, they give an approval (such as a key held by each officer) in a form that the settings of the provider's or the bank's own systems alone cannot produce.
- **Where it is checked**: The step in which the bank executes a transfer to another bank. Whichever system an instruction arrives from, one not tied to a registered officer's approval, one to an unregistered payee, or one over the per-transfer or daily cap is held.
- **What is recorded**: Which route each own-account transfer arrived by, whose approval it passed and which payee it went to. It is kept apart from the provider's systems and used to establish the scope of the damage, to ask receiving banks to freeze funds and to report to the authorities and investigators.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking an own-account transfer instruction against the registered officer's approval, the payee and the cap before executing it, and keeping a record. Detection means noticing suspicious transactions, suspending some of them and blocking part of the funds. Dates rely on the bank's press release and FAQ and on reporting by Silicon.fr, CSO and AFP.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check an own-account transfer instruction against the officer's approval, the payee and the cap, apart from the issuing system's verdict, before executing it</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Transfers from the bank's own account to other banks<br>Around €100 million in scale (bank validated only the order of magnitude)</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Suspend some transactions, block part of the funds and pursue recovery</div>
<div class="rx-g g1"><div class="t">11-02</div><b>ZachXBT flags suspicious crypto withdrawals</b></div>
<div class="rx-g g2"><div class="t">11-04</div><b>The Paris prosecutor receives the bank's complaint and opens an investigation</b></div>
<div class="rx-g g3"><div class="t">11-04</div><b>The bank discloses the attack and resumes transactions step by step</b></div>
<div class="rx-g g4"><div class="t">11-04</div><b>An FAQ explains the service provider and the own account</b></div>
</div>
</figure>

According to the bank, its security systems quickly spotted the suspicious activity, suspended some transactions and blocked part of the funds. Even so, transfers on a scale reported at over €100 million left its own account for other banks. A case where transfers without the account holder's login went through via a new transaction system vendor's settings is [Bank SinoPac](/critical/briefs/201-bank-sinopac-vendor-setting-unauthorized-transfers/); one where code injected into a vendor's wallet interface got approval for a transaction different from the one displayed is [Bybit](/critical/briefs/081-bybit-safe-wallet-ui-injection/); and one where administrator rights were taken on a vendor's SaaS is [NTT DATA](/critical/briefs/204-ntt-data-stdirect-vendor-saas-admin-rights/). Here, money left the bank's own account via a service provider's platform.

## 4. What Lemma does

**Lemma builds the pre-execution check into the step in which a bank executes transfers from its own account to other banks.** It does not look for intrusions or attackers; it checks, before execution, that an instruction is tied to a registered officer's approval and is within the registered payees and the cap.

### Industries and operations to watch

- **Industry · Finance**: Banks, brokers and payment providers that run payments, treasury and transaction processing connected to outside providers' platforms. Once a provider's systems reach internal systems, a route towards own-account transfers can form.
- **Operation · Approval & sign-off**: Accepting and executing own-account transfer instructions (officer approval, payee registration, per-transfer and daily caps).

### Current controls vs Lemma

The route in this case is column 1 (attackers who came in through a service provider's platform send money from the bank's own account). Column 2 covers transfers made from the payment screen with an employee's stolen ID and password, and column 3 an officer who is deceived into making the transfer; nothing disclosed says either happened here.

| Control | Own-account transfers via a service provider's platform | Transfers with an employee's stolen ID and password | An officer deceived into transferring |
| --- | --- | --- | --- |
| Multi-factor authentication for employee logins | Partial | Effective | Not effective |
| Limits on provider connections (source and permission scoping) | Partial | Not applicable | Not applicable |
| Monitoring for unusual transactions | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Multi-factor authentication for employee logins confirms the person logging in, but whether the attackers here went through an employee login has not been disclosed. Limits on provider connections narrow what the provider can reach, but if a route towards transfers lies within that scope, it gets through. Monitoring, like the bank's detection here, spots and stops suspicious activity, but transfers go through until it notices. Lemma checks, before execution, not the system an instruction arrived from but whether it is tied to a registered officer's approval and is within the payees and the cap.

Note: Lemma's check works only when it is built into the step in which the bank executes own-account transfers and the officers' approval keys, payee registrations and caps are managed somewhere apart from the provider's systems. If an officer's key itself is stolen, only the payee and cap checks apply. A transfer an officer approves after being deceived goes through. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, nor does it recover funds already sent.

### Checklist

Three things to confirm about provider connections and own-account transfers

- Do you list the connections from service providers' platforms into your internal systems, and what each can reach, and review them regularly?
- Do you have a way to hold, before execution, a run of own-account transfers to payees you have not dealt with before in a short time?
- When you notice unauthorised transfers, can you ask the receiving banks to freeze funds and extract the affected transactions the same day?

## 5. Facts and timeline

- **Parties**: Crédit Mutuel Arkéa (Brest, France), a cooperative banking group made up of the Crédit Mutuel de Bretagne and Crédit Mutuel du Sud-Ouest federations, their local branches and some 40 subsidiaries including Fortuneo and Monext, with more than 5.8 million members and customers (bank). The service provider has not been named.
- **What happened**: According to the bank, an attack allowed fraudulent transactions. The attackers used the bank's own account to carry out transactions to other banks, and the money may then have been converted into cryptocurrency on specialised platforms. They reached the bank directly through the platform of one of its service providers, with no entry via Fortuneo. The bank called it a sophisticated outside attack, not human error.
- **Impact on customers**: According to the bank, no customer account was used and customer assets were not affected. Some transfers were executed late. The bank warned customers to watch for phishing exploiting the attack.
- **Amount**: On the reported €118 million ($133 million), the bank said it "does not confirm" the figure and "can simply validate the order of magnitude", adding that part of the funds had been blocked and recovery was under way. No final amount has been disclosed. AFP reported that on the evening of 4 November the bank gave a provisional estimate of around €100 million.
- **Crypto movements**: According to Silicon.fr, blockchain investigator ZachXBT on 2 November flagged suspicious withdrawals of over $106 million from accounts linked to crypto exchanges without naming a victim, and later raised the estimate to over $133 million. Naming Crédit Mutuel Arkéa as the victim was a presumed attribution. The bank has not taken up this estimate.

### Timeline

- **2026-11-02**: ZachXBT flags suspicious withdrawals from accounts linked to crypto exchanges without naming a victim (Silicon.fr, CSO).
- **2026-11-04**: In the morning, the Paris prosecutor's cybercrime section receives the bank's complaint, opens an investigation into organised attacks on an automated data-processing system and assigns it to OFAC (prosecutor to AFP).
- **2026-11-04**: At 13:00 the bank discloses the attack, saying it suspended some transactions after detection, informed the supervisory bodies and resumed transactions step by step during the morning.
- **2026-11-04**: The bank publishes an FAQ explaining the own-account transfers, the service provider's platform and the order of magnitude of the reported amount.

> The facts rely on Crédit Mutuel Arkéa's press release and FAQ (both 4 November, primary) and on reporting by AFP, Silicon.fr, CSO and FrenchWeb. The opening of the investigation relies on what the Paris prosecutor told AFP. The bank says it informed "the supervisory bodies" without naming them; no statement by the Banque de France or the ACPR could be confirmed. No customer notice from Fortuneo or Crédit Mutuel de Bretagne could be confirmed. When the attack began, the provider's name and the kind of platform, how the attackers got from it to own-account transfers, the number of transfers and the payees, and the final amount have not been disclosed. The crypto estimate is ZachXBT's, not the bank's. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of the bank or the provider. Written as of 12 November.

### After disclosure

- **Crédit Mutuel Arkéa**: Suspended some transactions and, after checks and stronger security measures, resumed almost all of them on the morning of 4 November. It is working with the judicial and police authorities to establish the origin and method of the attack, has blocked part of the funds and is pursuing recovery. It warned customers to watch for phishing.
- **Paris prosecutor**: The cybercrime section opened an investigation into organised attacks on an automated data-processing system and assigned it to OFAC (AFP).
- **Supervisors**: The bank says it informed the supervisory bodies after detection.

## 6. Sources

- **Crédit Mutuel Arkéa (Primary, company press release)**: 「Crédit Mutuel Arkéa annonce avoir été victime d'une attaque」 (2026-11-04, French) — [cm-arkea.com/…/04112026_-_communique_….pdf](https://www.cm-arkea.com/arkea/banque/upload/docs/application/pdf/2026-11/04112026_-_communique_-_le_credit_mutuel_arkea_annonce_avoir_ete_victime_dune_cyberattaque__2026-11-04_15-40-19_385.pdf)
- **Crédit Mutuel Arkéa (Primary, company FAQ)**: 「Informations complémentaires suite à l'attaque dont le Crédit Mutuel Arkéa a été victime」 (2026-11-04, French) — <https://www.cm-arkea.com/arkea/banque/assurances/pa_38386/fr/informations-complementaires-suite-a-l-attaque-dont-le-credit-mutuel-arkea-a-ete-victime>
- **AFP via Yahoo Finance France (Reporting)**: 「Crédit Mutuel Arkéa: cyberattaque pour près de 100 millions d'euros, enquête ouverte」 (2026-11-05, French) — <https://fr.finance.yahoo.com/actualites/cr%C3%A9dit-mutuel-ark%C3%A9a-victime-d-104933480.html>
- **AFP via DH (Reporting)**: 「Crédit Mutuel Arkéa : les questions en suspens après la cyberattaque」 (2026-11-05, French) — <https://www.dhnet.be/dernieres-depeches/2026/11/05/credit-mutuel-arkea-les-questions-en-suspens-apres-la-cyberattaque-67MPJWJ2UZBBHIKE46XTENGMGQ/>
- **Silicon.fr (Reporting)**: 「Crédit Mutuel Arkéa victime d'une cyberattaque : ce que l'on sait」 (2026-11-04, French) — <https://www.silicon.fr/cybersecurite-1371/credit-mutuel-arkea-victime-dune-cyberattaque-ce-que-lon-sait-du-detournement-presume-de-118-millions-e-230100>
- **Silicon.fr (Reporting)**: 「Ce que le Crédit Mutuel Arkéa confirme sur la cyberattaque dont il a été victime」 (2026-11-05, French) — <https://www.silicon.fr/cybersecurite-1371/ce-que-le-credit-mutuel-arkea-confirme-et-ne-confirme-pas-sur-la-cyberattaque-dont-il-a-ete-victime-230129>
- **CSO (Reporting)**: "French banking group hit by supply chain cyberattack" (2026-11-05) — <https://www.csoonline.com/article/4245357/french-banking-group-hit-by-supply-chain-cyberattack.html>
- **FrenchWeb (Reporting)**: 「Crédit Mutuel Arkéa confirme une cyberattaque, le montant du détournement reste à établir」 (2026-11-04, French) — <https://www.frenchweb.fr/credit-mutuel-arkea-confirme-une-cyberattaque-le-montant-du-detournement-reste-a-etablir/900000019>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
