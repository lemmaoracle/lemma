---
brief_no: 149
title: "Revolut：イタリア政府の認証メール網から届いた開示要求に応じ、数か月にわたり顧客データを渡し続けた(PEC・伊検察が捜査中) — 国が配達を証明しても、要求者の権限を開示の前に確かめる層が無い"
title_en: "Revolut: It kept handing over customer data for months, answering disclosure requests that arrived through Italy's state-certified email network (PEC; Italian prosecutors investigating) — the state certifies delivery, but nothing verifies the requester's authority before the data goes out"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [attribute-proof-bypass, identity-auth]
incident_date: 2026-09-12
published: 2026-09-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["032-booking-payout-account-tampering", "126-starling-bank-sanctions-screening-partial-list"]
status: published
version: "1.0"
og_lead_ja: "Revolut：伊政府の認証メール網からの開示要求に数か月応じ続けた"
og_lead_en: "Revolut answered data requests from Italy's certified state email"
---

## 1. TL;DR

On September 12, 2026, Revolut acknowledged that it had disclosed customer information to a third party. The requests arrived over **PEC** (Posta Elettronica Certificata), Italy's state-run certified email network — the digital equivalent of registered post, carrying legal proof of delivery. They came from an Interior Ministry address (`pec.interno.it`), repeatedly, over a period of months, and were honored each time. With the state itself certifying delivery, the path was beyond question. **What didn't work was a layer that checks, before an irreversible action — handing over customer data — whether the person who wrote the request still holds the authority they claim.**

## 2. What happened

- On September 12, 2026, Revolut acknowledged that it had disclosed customer information to a third party, describing the incident as "a sophisticated external impersonation scam."
- The pathway was not a breach of Revolut's systems or an unauthorized login. It was **Revolut's response to disclosure requests arriving over PEC, Italy's state-run certified email network, from an Interior Ministry domain** (`pec.interno.it`). PEC is a government-supervised network used by Italian authorities, companies and citizens for official and legal correspondence — the digital equivalent of registered post.
- Per the notification emailed to affected customers and reviewed by reporters, the disclosed data covered names, dates of birth, addresses, email addresses, phone numbers and occupations, plus passport and driver's license copies. Verification selfies, account statements and transaction histories may also have been included. IBANs, account-opening dates, withdrawal records and crypto wallet reference numbers come from researcher ZachXBT's disclosure and some reporting.
- Revolut's notification states explicitly that "no biometric facial telemetry data was involved or compromised." It also says "Revolut systems and customer funds are unaffected," denying any theft of funds or breach of its core banking infrastructure.
- Revolut has described the number of affected customers only as "very limited," without disclosing a count, the countries involved, or the name of the impersonated agency.

Per what the investigations team at Duel learned from the attacker, published by Hudson Rock, the sequence unfolded as follows:

1. The attacker obtained credentials for a mailbox on the Italian Interior Ministry's domain (`pec.interno.it`). They initially claimed to have infected the machine themselves; Hudson Rock disputes this, having found roughly 300 already-compromised webmail logins on that domain, and assesses that the attacker most likely **purchased or reused circulating infostealer logs**.
2. The attacker tried forging court orders first, judged that this would not work against Revolut, and settled on Revolut Bank UAB, the Lithuania-based subsidiary — which **is legally obliged to answer a European Investigation Order**. The compliance obligation was the entry point, not an obstacle to work around.
3. Requests sent from that genuine mailbox arrived carrying PEC's proof of delivery. Revolut processed them as lawful disclosure demands and handed over the customer data. The attacker says this did not happen once — the requests kept arriving over a period of months, and kept being honored.
4. In one instance, the attacker claims, when they sent an incorrect document Revolut's support team guided them on how to correct it rather than treating the exchange as fraud.
5. Revolut later determined the requests were not genuine, blocked the email address, and alerted the impersonated agency, law enforcement, data protection authorities, and financial regulators.

## 3. Timeline — disclosure and response

- 2026-09-11: Revolut emailed a notification to affected customers.
- 2026-09-12: Researcher ZachXBT published that notification on Telegram, bringing the incident to light. Revolut acknowledged it in a statement to reporters the same day.
- 2026-09-15: Hudson Rock published Duel's findings alongside its own analysis, identifying the sending domain as `pec.interno.it` and reporting roughly 300 compromised credentials on it.
- 2026-09-16: The Financial Times reported its interview with the attacker. Italian officials confirmed investigations were under way. The same day, a threat actor using the moniker 'IAmNotAVillain' publicly demanded 6,000 XMR (about $3 million) within 24 hours, threatening to sell the data to other criminal groups otherwise.
- 2026-09-17: Prosecutors in Reggio Calabria were reported to have opened an inquiry, with Italy's National Anti-Mafia and Counter-Terrorism Directorate also working the case.

> On the limits of attribution: **Italian investigators have not established whether the compromised machine belonged to the Interior Ministry itself or to the Reggio Calabria prefecture** (a local arm of the ministry; both use `pec.interno.it`), nor whether the account was taken over or cloned. The duration is likewise unsettled — the attacker told Duel "five months," told the Financial Times they first made contact "a couple of months ago," and said "six months" in separate communications. This Brief therefore says "months." The figure of roughly 680 customers, and the characterization of them as crypto whales selected by on-chain analysis, is **the attacker's own claim to the Financial Times**; Revolut has not published a number. Those affected were reportedly concentrated in Switzerland and France, with residents of 31 other countries also included.

Response and industry reaction:

- Revolut blocked the email address used in the scam, contacted affected customers directly, and alerted the impersonated agency, law enforcement, data protection authorities, and financial regulators.
- Italy's postal police, state police, interior ministry and cyber security agency declined to comment, though officials confirmed investigations were under way. Italy's data protection authority opened checks immediately.
- On the ransom, Revolut says it "has not received any direct contact or demand from the individuals or group making these claims."
- In separate communications the attacker also claimed to have stolen more than 147GB of data from an Italian law enforcement agency; this is unverified.

## 4. Why it wasn't stopped

The failure here is not that the impersonation email was especially sophisticated, or that Revolut's technical defenses were weak. **The request was not even a forgery.** It genuinely arrived over a certified email network the Italian state runs and grants legal evidentiary weight, from a real Interior Ministry address. **The failure is that the decision to disclose rode on the state's certification of delivery, while no layer anywhere along the path independently checked whether the requester still held the authority they claimed.**

What PEC certifies is when a message was sent, from which address, and to whom it was delivered. That the person writing it works for the agency — let alone that they currently hold authority to demand a particular customer's particular data — lies outside what the certification covers. That is exactly where the attacker aimed. Having judged that forged court orders would not work, they moved to the Lithuanian entity bound to answer a European Investigation Order: not evading the obligation, but using it as the way in.

Detection did work — months late. Revolut eventually determined the requests were not genuine, blocked the address, and notified the authorities. In the meantime the requests kept going through, to the point where support staff reportedly helped correct a misfiled document. What didn't work was the step before that: there was nothing along the disclosure path for a human to find suspicious.

This shows the same pattern as [Brief 032](/critical/briefs/032-booking-payout-account-tampering/), where a payout account was altered from within a legitimate platform: looking legitimate is not the same as being authorized to trigger an action, and here the action is disclosure. [Brief 126](/critical/briefs/126-starling-bank-sanctions-screening-partial-list/), which also turned on a bank's disclosure judgment, addressed an incomplete sanctions list; this case differs in that the gap was not list completeness but the absence of a layer verifying the authority the request itself claims.

> "This incident involved the fraudulent misuse of an official, state-regulated legal communication channel to impersonate legitimate authority requests." — Revolut

## 5. What proof would have changed

Responding to lawful information requests from government agencies is a regulatory obligation for financial institutions, and it cannot be removed — the attacker chose that obligation as the way in. Where a proof step could be inserted is not in the decision of whether to disclose, but in verifying, against the issuing record, whether the requester still holds the authority they claim. A stolen mailbox does not come with a stolen proof of authority.

Lemma's proposed design for this gap:

- **Verify the requester's authority as a proof of attribute.** Not proof of delivery, but the agency, role, and authority the requester claims, verified as a proof checkable against the issuing record. Control of a mailbox is not possession of authority.
- **Bind the proof to a scope and expiry.** Tie the range the proof answers for (which customer, which category of data) and its valid period to the proof itself, so that a pathway which passed once does not become a universal key for months.
- **Separate the disclosure decision from authority verification.** Do not leave authority judgment solely to a staff member's visual review; make proof verification a required step in the disclosure workflow.

What it does not do:

- It does not prevent an employee's machine from being infected by infostealer malware. Endpoint defense and credential hygiene remain necessary.
- It does not remove the obligation to respond to genuinely lawful government requests. Legitimate requests still need to be honored, even with proof in place.
- It does not recover data that has already been disclosed.

This layer complements detection rather than replacing it. Detection catches a compromised account or a suspicious request after the fact. This layer lets an organization independently verify a requester's authority before taking an irreversible action — disclosing customer data.

## 6. Sources

- **Revolut (primary, company statement, quoted via TechCrunch)**: "Revolut confirms customer data breach through fake government requests" (2026-09-12) — <https://techcrunch.com/2026/09/12/revolut-confirms-customer-data-breach-through-fake-government-requests/>
- **Financial Times (primary, interview with the attacker; syndicated by the Irish Times)**: "Hackers say they breached Italian state email to target Revolut 'crypto whales'" (2026-09-16) — <https://www.irishtimes.com/business/2026/09/16/hackers-say-they-breached-italian-state-email-to-target-revolut-crypto-whales/>
- **Duel / Hudson Rock (attacker debrief and analysis, published on InfoStealers)**: "Revolut Hackers Used Infostealers for Elaborate Social Engineering" (2026-09-15) — <https://www.infostealers.com/article/revolut-hackers-used-infostealers-for-elaborate-social-engineering/>
- **Euronews (independent reporting on the Italian investigation)**: "Revolut hack: Criminals steal data of 700 European clients, demand $3m ransom" (2026-09-17) — <https://www.euronews.com/business/2026/09/17/revolut-hack-criminals-steal-data-of-700-european-clients-demand-3m-ransom>
- **SecurityWeek (independent reporting, follow-up)**: "Revolut Data Breach: 5 Months, 680 High-Profile Accounts, $3M Ransom" (2026-09-17) — <https://www.securityweek.com/revolut-data-breach-5-months-680-high-profile-accounts-3m-ransom/>
- **SecurityWeek (independent reporting)**: "Personal, Financial Info Exposed in Revolut Data Breach" (2026-09-14) — <https://www.securityweek.com/personal-financial-info-exposed-in-revolut-data-breach/>
- **Infosecurity Magazine (independent reporting)**: "Revolut Confirms Data Breach Through Fake Government Requests" (2026-09-14) — <https://www.infosecurity-magazine.com/news/revolut-data-breach-fake-government/>
- **BankInfoSecurity (independent reporting)**: "Revolut Reveals Data Breach Tied to Faked Official Request" (2026-09-14) — <https://www.bankinfosecurity.com/revolut-reveals-data-breach-tied-to-faked-official-request-a-32808>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute).

As of this writing Revolut has not published the number of affected customers, the countries involved, or the name of the impersonated agency. Italian investigators have not established which organisation's machine was compromised, whether the account was taken over or cloned, or how long the requests continued. The figure of roughly 680 customers is the attacker's claim to the Financial Times and has not been confirmed by Revolut.
