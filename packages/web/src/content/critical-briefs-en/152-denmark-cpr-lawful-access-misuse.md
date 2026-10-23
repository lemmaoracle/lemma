---
brief_no: 152
title: "デンマーク CPR：民間企業 1 社の正規の照会権限が悪用され、約 880 万人分の氏名・住所・CPR 番号が引き出された(デンマーク研究・教育・デジタル化省発表) — 照会の権限はあっても、照会のたびに対象が許された範囲かを確かめる層が無い"
title_en: "Denmark CPR: One private company's lawful lookup access was abused to pull names, addresses and CPR numbers for about 8.8 million people (Danish digitalisation ministry) — the access was lawful, but nothing checked each lookup's targets against what was permitted"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [identity-auth]
incident_date: 2026-10-05
published: 2026-10-14
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["149-revolut-italy-government-mailbox-disclosure-requests", "142-awa-bank-test-environment-repurposed-leak"]
status: published
version: "1.0"
og_lead_ja: "デンマーク CPR、民間企業の正規権限の悪用で約 880 万人分の氏名・住所・番号が流出"
og_lead_en: "Denmark CPR: a company's lawful access was abused to pull data on 8.8 million people"
industries: ["public-sector"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Stop lookups that go beyond the permitted scope"
  - slug: "audit-trail"
    item: "Record whose lookup retrieved what"
attack_method: "privilege-abuse"
impact: "Names, addresses and CPR numbers of about 8.8 million people retrieved"
takeaway: "Access was granted, but nothing checked each lookup against the permitted scope."
countries: ["dk"]
---

## 1. TL;DR

On October 5, 2026, Denmark's Ministry of Science, Higher Education and Digital Affairs (FUDM) announced that one private company's lawful lookup access to the CPR, the national population register, had been abused to pull names, addresses and CPR numbers for about 8.8 million people. This was not a break-in to the CPR system but searches made through the company's lawful access. Private firms may only receive data on people they have identified individually in advance, yet the CPR office says the lookups far exceeded the firm's customer base (reported), and records came back for about 80% of the register's roughly 11 million entries. **Detection worked, but only through the bill, after the lookups were over. What didn't work was a layer that independently checks, at each lookup, that its targets fall within what was permitted.**

## 2. What happened

- **System**: The CPR (Det Centrale Personregister), Denmark's population register. It holds about 11 million records, including residents, people who have died and people who have moved abroad.
- **Private-sector access**: Under section 38 of the CPR Act, private companies with a legitimate interest may receive CPR data on a larger, delimited group of people that the company has identified individually in advance (by personal number, date of birth and name, or name and address). The company must also be entitled to receive the data under the GDPR and the Danish Data Protection Act. Section 38(2) sets out which data types they may receive.
- **What happened**: Unauthorized persons (uvedkommende) abused one Danish company's lawful access to search the CPR and obtained names, addresses, CPR numbers and more for about 8.8 million people. FUDM says the lookups stayed within the data types that private companies may access.
- **Scope**: About 8.8 million people, including living, emigrated and deceased people. For people registered with name-and-address protection, names and addresses were not included.
- **Method**: Not disclosed by authorities. In its report to the Danish Data Protection Agency, the CPR office says the company states it did not make the lookups itself and that the company's IT appears to have been compromised (obtained by TV 2 through a records request). A self-described attacker told the newspaper Politiken he used a former employee's password; this has not been verified.
- **Company**: Authorities have not named the company. The company has confirmed to the press that its lookup access was abused. The actor has not been identified.

The incident unfolded as follows.

1. One private company held lawful lookup access under section 38 of the CPR Act.
2. Unauthorized persons used that company's access to search the CPR.
3. The lookups ran within the data types private companies may receive and returned records on about 8.8 million people.
4. On the evening of October 2, the CPR administration noticed irregular activity during September while invoicing.

## 3. Timeline — disclosure and response

- **Around 2026-09-10**: Access through the company's lookup credentials begins (documents obtained by TV 2 through a records request).
- **Around 2026-09-20**: Access stops. The CPR office's report says preliminary findings suggest it ended on this date (same).
- **2026-10-02 (Fri), evening**: The CPR administration notices irregular September activity while invoicing. The company's access is closed the same day (same). Over the weekend, it establishes unauthorized access to data on about 8.8 million people.
- **2026-10-03 (Sat), evening**: Officers from the National Unit for Special Crime (NSK) visit the company to secure evidence (TNW).
- **2026-10-05 (Mon)**: FUDM and the CPR administration announce the incident, stating that the company's access had been stopped and the matter reported to the Danish Data Protection Agency (Datatilsynet).
- **2026-10-06 (Tue)**: At a press briefing, officials say there were well over 14 million lookup attempts, about 8.8 million of which returned a record; that the count can run that high because non-existent CPR numbers can also be looked up; and that the activity came to light through billing the company (TV 2).

> The facts in this Brief rest on the official notices of FUDM and the CPR administration. The period and counts of lookups, the billing trigger and the contents of the CPR office's report are not in the written notices; they come from officials' statements at the briefing and documents TV 2 obtained through a records request, as reported by TV 2. The NSK visit on Saturday evening is as described by TNW. FUDM notes that further investigation may refine the details.

Response after disclosure:

- **Investigation**: Police are investigating with the relevant authorities. The investigation is at an early stage and it is not yet possible to say who is behind it. According to reports, no one has been identified or charged, and police are contacting forces in other countries.
- **Prevention and review**: FUDM says it has already started measures to prevent similar incidents, and the minister has ordered a thorough security review of the CPR system. Reports say no deadline was set. On October 9, the ministry also wrote to the 1,039 companies with CPR access, tightening security rules, including a requirement to have a security officer (reported).
- **Public guidance**: Never give passwords or other confidential information by phone or email, even if the other party appears to know your name, address and CPR number.
- **CPR numbers as proof**: According to reports, the head of the Danish Agency for Civil Security (Styrelsen for Samfundssikkerhed) told companies and authorities to stop accepting a CPR number alone as proof of identity.

## 4. Why it wasn't stopped

This was not a break-in to the CPR system, and authorities have not disclosed how the company's access was taken over. The failure, **as far as has been published, was that lawfully granted lookup access was used without anything checking, at each lookup, that its targets fell within what was permitted.**

The CPR Act does not give private firms unlimited lookups. They may receive data only on a delimited group of people they have identified individually in advance. Even so, records came back on about 8.8 million of the register's roughly 11 million entries, including the dead and those who have moved abroad. In its report, the CPR office wrote that the number of lookups far exceeded the company's customer base, and at the briefing officials said non-existent CPR numbers could also be looked up. No mechanism has been described that compared lookup targets with the scope permitted at grant. However the access was taken over, a layer asking whether each target was in scope would have limited what could be pulled.

Detection worked, but late. The administration noticed during invoicing and established the scale over a weekend. According to reports, though, the lookups had stopped around September 20, some 12 days earlier. Cutting access, investigating, writing to 1,039 companies and reviewing the whole system are necessary, but they either act after the lookups have run or strengthen controls on the caller's side. The warning not to rely on a CPR number alone limits what can be done with identifiers already taken; it does not protect the moment they are taken.

The same structure appears in earlier Briefs. At [Revolut](/critical/briefs/149-revolut-italy-government-mailbox-disclosure-requests/), disclosure requests arriving through the state's certified email network were answered for months without the requester's authority being verified. At [Awa Bank](/critical/briefs/142-awa-bank-test-environment-repurposed-leak/), an environment whose development and testing purpose had ended kept being used for other work, and no one re-checked whether it should still hold customer data. In each case, the legitimacy of the channel or environment stood in for checking legitimacy at the moment of use.

> "I can confirm that it is during invoicing on Friday evening that a very, very large amount is billed, which alerts you that there has been very large activity during September." — Mikkel Leihardt, department head (afdelingschef) at FUDM (TV 2)

## 5. What proof would have changed

Private-sector CPR lookups are a legitimate mechanism the law allows, and there is no need to end them. Where a proof step could be inserted is not in whether the company has access, but in confirming, before any record is returned, that this lookup's target is within the group the company identified in advance.

Lemma's proposed design for this gap:

- **Make the permitted scope a condition of each lookup.** At grant, the CPR administration issues the company a permission proof covering its legitimate interest, permitted data types and a cap tied to its declared customer base. The company registers a commitment to the set of people it has identified in advance, updated only through a separately authenticated step. Each lookup must prove the target is in that set, and within the cap, before any record is returned; numbers outside the set, including non-existent ones, return nothing.
- **Stop out-of-scope lookups before they return.** Block lookups for individuals outside the registered set, or volumes beyond the declared cap, before any record is returned. The stop comes at the lookup, not at billing.
- **Record each lookup apart from the caller.** Keep a record, separate from the caller's own actions, of which permission proof each lookup relied on and whose data was returned, so it can be audited later.

This is where it differs from after-the-fact detection. Detection notices from a bill or irregular activity once the lookups have happened. A proof asks whether a lookup's target is within what was permitted before the record is returned. This layer complements detection rather than replacing it.

Note: a proof shows only that a lookup falls within the registered scope. Misuse within that scope, or a takeover of the registration step itself, will still pass.

## 6. Sources

- **Danish Ministry of Science, Higher Education and Digital Affairs, FUDM (primary, official notice)**: "Omfattende uautoriseret adgang til borgeres CPR-oplysninger" (Extensive unauthorised access to citizens' CPR data, 2026-10-05, in Danish) — <https://fudm.dk/aktuelt/pressemeddelelser/2026/oktober/omfattende-uautoriseret-adgang-til-borgeres-cpr-oplysninger/>
- **CPR administration (primary, official notice)**: "Omfattende uautoriseret adgang til borgeres CPR-oplysninger" (2026-10-05, in Danish) — <https://www.cpr.dk/cpr-nyt/nyhedsarkiv/2026/okt/omfattende-uautoriseret-adgang-til-borgeres-cpr-oplysninger>
- **TV 2 (independent reporting, including documents obtained through a records request)**: "Nye detaljer om cpr-skandale – hacker var over alle bjerge" (2026-10-09, in Danish) — <https://nyheder.tv2.dk/business/2026-10-09-nye-detaljer-om-cpr-skandale-hacker-var-over-alle-bjerge>
- **TV 2 (independent reporting, live blog)**: "Cpr-numre kompromitteret" (2026-10-05 to 10, in Danish) — <https://nyheder.tv2.dk/live/samfund/2026-10-05-uvedkommende-har-faaet-adgang-til-88-millioner-cpr-numre>
- **The Next Web (independent reporting, citing TV 2)**: "Denmark's CPR breach: 14 million lookups in ten days, found through a bill" (2026-10-06) — <https://thenextweb.com/news/denmark-cpr-breach-8-8-million-records>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute).

As of this writing, authorities have not named the company, and the actor has not been identified. The period and counts of lookups, the billing trigger and the contents of the CPR office's report come from press reports and do not appear in the written notices.
