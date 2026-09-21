---
brief_no: 149
title: "Revolut：乗っ取られたイタリア内務省の実在メールアカウントから届く開示要求に、約5か月応じ続けた(Hudson Rock 調査) — ドメイン認証は通っても、要求者の権限を開示の前に確かめる層が無い"
title_en: "Revolut: For roughly five months it kept answering disclosure requests sent from a real, compromised Italian Ministry of the Interior mailbox (Hudson Rock analysis) — domain authentication passes, but nothing verifies the requester's authority before the data goes out"
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
og_lead_ja: "Revolut：乗っ取られた政府メールからの開示要求に5か月応じ続けた"
og_lead_en: "Revolut answered fake government data requests for five months"
---

## 1. TL;DR

On September 12, 2026, Revolut confirmed that it had handed customer data — passport and driver's license copies, verification selfies, IBANs, account statements, transaction histories — to a third party whose request arrived from a genuine government email domain. On September 15, research firm Hudson Rock reported that the sender was a real Italian Ministry of the Interior mailbox (`pec.interno.it`), taken over using credentials exposed by infostealer malware, and that the requests had been honored repeatedly across roughly five months. Domain authentication passed because the mail genuinely came from the agency's own infrastructure. **What didn't work was the layer that checks, before an irreversible action — handing over customer data — whether the person writing the request still holds the authority they claim.**

## 2. What happened

- On September 12, 2026, Revolut confirmed it had disclosed customer information to a third party, describing the incident as "a sophisticated external impersonation scam."
- The pathway was not a breach of Revolut's systems or an unauthorized login. It was **Revolut's own response to an information request that arrived from a genuine government email domain**.
- The data reportedly disclosed includes names, dates of birth, addresses, email addresses, phone numbers and occupations, along with passport and driver's license copies, verification selfies, IBANs, account-opening dates, account statements, withdrawal records, and transaction histories including cryptocurrency.
- Revolut says "Revolut systems and customer funds are unaffected," denying any theft of funds or breach of its core banking infrastructure.
- Revolut has described the number of affected customers only as "very limited," without disclosing an exact count, the country involved, or the name of the impersonated agency.

Per Hudson Rock's analysis, the sequence unfolded as follows:

1. The attacker obtained credentials for a mailbox used by an Italian Ministry of the Interior employee (`pec.interno.it`). Hudson Rock found roughly 300 already-compromised webmail logins on that domain in its database, and assesses that the attacker most likely **purchased or reused existing infostealer logs** rather than infecting those employees directly.
2. From that genuine mailbox, the attacker sent requests for customer information to Revolut Bank UAB, Revolut's Lithuania-based subsidiary. Because the mail originated on the agency's real infrastructure, domain authentication passed as legitimate.
3. Revolut processed the requests as lawful regulatory or law-enforcement disclosure demands and provided the customer data. This did not happen once — the requests **kept arriving across roughly five months, and kept being honored**.
4. In one instance, Hudson Rock reports, when the attacker sent an incorrect document, Revolut's support team guided them on how to correct it rather than treating the exchange as fraud.
5. Revolut later determined the requests were not genuine, blocked the email address, and alerted the impersonated agency, law enforcement, data protection authorities, and financial regulators.

## 3. Timeline — disclosure and response

- The exact date the first fraudulent request was sent has not been disclosed. Hudson Rock places it "roughly five months" earlier.
- 2026-09-12: Revolut publicly confirmed the incident.
- 2026-09-15: Hudson Rock published its analysis identifying the sender as a genuine `pec.interno.it` (Italian Ministry of the Interior) mailbox compromised via infostealer logs.
- 2026-09-17: A threat actor using the moniker 'IAmNotAVillain' was reported to have publicly demanded $3 million from Revolut. Revolut says it "has not received any direct contact or demand from the individuals or group making these claims." Italian police opened an investigation.

> Attributing the mailbox to the Italian Ministry of the Interior is **Hudson Rock's analysis**; Revolut has named neither the agency nor the country. On scale, Revolut says only "very limited," and the reported figure of roughly 680 customers — said to be cryptocurrency whales — comes from Hudson Rock's research and reporters' understanding, not from Revolut. This Brief treats both as attributed but unconfirmed.

Response and industry reaction:

- Revolut blocked the email address used in the scam and contacted affected customers directly.
- Revolut alerted the impersonated government agency, law enforcement, data protection authorities, and financial regulators.
- Italian police opened an investigation.
- Revolut states that its app and core banking infrastructure were not breached and that customer funds were unaffected.

## 4. Why it wasn't stopped

The failure here is not that the impersonation email was especially sophisticated, or that Revolut's technical defenses were weak. **The request was not even a forgery.** It came from the agency's real mail infrastructure, from a real account. SPF, DKIM, and DMARC all pass correctly. The failure is that this correctness speaks only to the path the message traveled, and **the disclosure decision was leaning on it**.

Financial institutions operate under KYC/AML obligations to respond to lawful information requests from government and law-enforcement bodies. That obligation does not change. What was missing is a means, built into the disclosure pathway, of checking each individual request — is the person who wrote this an official of that agency, and do they still hold the authority to demand this customer's data of this kind? — against the issuing record rather than against the request's appearance.

Detection did not work. For five months the requests kept going through, to the point where support staff helped correct a misfiled document. That is another way of saying there was nothing along the path for a human to find suspicious. Blocking and notification did eventually happen — after the customer data had already left.

This shows the same pattern as [Brief 032](/critical/briefs/032-booking-payout-account-tampering/), where a payout account was altered from within a legitimate platform: looking legitimate is not the same as being authorized to trigger an action, and here the action is disclosure. Within the same kyc-aml-disclosure category, [Brief 126](/critical/briefs/126-starling-bank-sanctions-screening-partial-list/) addressed an incomplete sanctions list; this case differs in that the gap was not list completeness but the absence of a layer verifying the authority the request itself claims.

> "Revolut recently identified a sophisticated external impersonation scam where an unauthorised third party utilised a legitimate government agency domain email to submit fraudulent requests for information." — Revolut

## 5. What proof would have changed

Responding to lawful information requests from government agencies is a regulatory obligation for financial institutions, and it cannot be removed. Where a proof step could be inserted is not in the decision of whether to disclose, but in verifying, against the record, whether the requester still holds the authority they claim. A stolen mailbox does not come with a stolen proof of authority.

Lemma's proposed design for this gap:

- **Verify the requester's authority as a proof of attribute.** Rather than relying on the sending domain's appearance or its authentication result, verify the agency, role, and authority the requester claims as a proof checkable against the issuing record. Control of a mailbox is not possession of authority.
- **Bind the proof to a scope and expiry.** Tie the range the proof answers for (which customer, which category of data) and its valid period to the proof itself, so that a pathway which passed once does not become a universal key for five months.
- **Separate the disclosure decision from authority verification.** Do not leave authority judgment solely to a staff member's visual review; make proof verification a required step in the disclosure workflow.

What this does not do:

- It does not prevent an employee's machine from being infected by infostealer malware. Endpoint defense and credential hygiene remain necessary.
- It does not remove the obligation to respond to genuinely lawful government requests. Legitimate requests still need to be honored, even with proof in place.
- It does not recover data that has already been disclosed.

This layer complements detection rather than replacing it. Detection catches a compromised account or a suspicious request after the fact. This layer lets an organization independently verify a requester's authority before taking an irreversible action — disclosing customer data.

## 6. Sources

- **Revolut (primary, company statement, quoted via TechCrunch)**: "Revolut confirms customer data breach through fake government requests" (2026-09-12) — <https://techcrunch.com/2026/09/12/revolut-confirms-customer-data-breach-through-fake-government-requests/>
- **Hudson Rock (primary, the researching firm's own publication)**: "Revolut Hackers Used Infostealers for Elaborate Social Engineering" (2026-09-15) — <https://www.infostealers.com/article/revolut-hackers-used-infostealers-for-elaborate-social-engineering/>
- **SecurityWeek (independent reporting, follow-up)**: "Revolut Data Breach: 5 Months, 680 High-Profile Accounts, $3M Ransom" (2026-09-17) — <https://www.securityweek.com/revolut-data-breach-5-months-680-high-profile-accounts-3m-ransom/>
- **SecurityWeek (independent reporting)**: "Personal, Financial Info Exposed in Revolut Data Breach" (2026-09-14) — <https://www.securityweek.com/personal-financial-info-exposed-in-revolut-data-breach/>
- **Infosecurity Magazine (independent reporting)**: "Revolut Confirms Data Breach Through Fake Government Requests" (2026-09-14) — <https://www.infosecurity-magazine.com/news/revolut-data-breach-fake-government/>
- **BankInfoSecurity (independent reporting)**: "Revolut Reveals Data Breach Tied to Faked Official Request" (2026-09-14) — <https://www.bankinfosecurity.com/revolut-reveals-data-breach-tied-to-faked-official-request-a-32808>
- **Malwarebytes (independent analysis)**: "Revolut gave customer IDs and financial data to a government impostor" (2026-09-14) — <https://www.malwarebytes.com/blog/news/2026/09/revolut-gave-customer-ids-and-financial-data-to-a-government-impostor>

The name and country of the impersonated agency, the number of affected customers, and the exact date the first fraudulent request was sent have not been disclosed by Revolut as of this writing. The attribution to a genuine Italian Ministry of the Interior mailbox, and the figure of roughly 680 customers, come from Hudson Rock's research and reporters' understanding; Revolut has confirmed neither. This Brief treats both as attributed but unconfirmed.

This material is a structural analysis of public information, not an audit, diagnosis, or recommendation for any specific organization.

References: On detection versus proof, see ["The Last Layer Left for AI-Era Cyber Defense"](https://lemma.frame00.com/blog/detection-is-not-proof/). Design context: [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/#attribute).
