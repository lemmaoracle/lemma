---
brief_no: 41
title: "AOG Technics：偽造された耐空証明書付きで、6万点超の航空機エンジン部品が出回った — 耐空という規制属性を主張する証書の来歴が、受領の前に独立検証されない構造（SFO）"
title_en: "AOG Technics: over 60,000 aircraft engine parts circulated with forged airworthiness certificates — the provenance of the certificates asserting airworthiness is not independently verified before receipt (SFO)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-02-23
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "035-boeing-787-inspection-records", "019-construction-engineer-qualification-fraud", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "AOG Technics、偽造耐空証明書付きで6万点超の航空機エンジン部品が4年以上流通"
og_lead_en: "AOG Technics circulated 60,000+ aircraft engine parts with forged airworthiness certificates for over four years"
gap_detected: "Authenticity inquiries, Safran's report to authorities, CAA/FAA/EASA safety warnings, fleet groundings, and the SFO investigation made the scope of the fraud visible after the fact and contained it."
gap_missing: "There was no layer to independently verify before receipt whether 'this certificate was genuinely issued by the legitimate issuer for this part,' so the airworthiness attribute was accepted on the mere existence of a certificate."
gap_fix: "Before receipt, independently verify the certificate's provenance (issuer, subject, authenticity) with Lemma, and block acceptance if provenance cannot be confirmed — preventing it up front."
---

## 1. TL;DR

Parts trader AOG Technics, between 2019 and 2023, sold more than 60,000 aircraft engine parts (worth roughly GBP 6.9 million) accompanied by forged Authorised Release Certificates (ARCs) attesting airworthiness. Many were for CFM International's CFM56 engine (widely fitted on the Boeing 737 / Airbus A320). The discovery began when an airline queried Safran about a part's authenticity and the certificate was found to be fake. The UK CAA, US FAA, and Europe's EASA issued safety warnings, and many airlines — Delta, American, Southwest, and others — grounded affected aircraft. The regulatory attribute of airworthiness circulated for more than four years under a structure in which the provenance of the certificate asserting it cannot be independently verified before receipt. The existence of a certificate was severed from whether that certificate was genuine and actually backed the airworthiness of the subject part.

---

## 2. What happened

- **Subjects**: AOG Technics (a UK-based aircraft-parts trader) and the airlines and maintenance operators that purchased parts with forged certificates from it
- **Scale**: between January 2019 and July 2023, sold more than 60,000 aircraft engine parts (worth roughly GBP 6.9 million) accompanied by forged ARCs. Many were for the CFM56 engine (737 / A320)
- **Method**: the company's director (defendant Jose Alejandro Zamora Yrala) altered legitimate ARCs on his home PC and created fake shipping memos as if the parts had been bought directly from OEMs such as Safran. Posing as legitimate operators, he used signatures and emails under the names of fictitious employees (sales and quality-control staff)
- **Discovery**: in 2023, an airline queried Safran (a joint owner of CFM International) about a part's authenticity, and the certificate was found to be fake. Safran reported it to the authorities
- **Regulatory response**: the UK CAA, US FAA, and Europe's EASA issued safety warnings about AOG Technics parts. Delta, American, Southwest, TAP, Ryanair, WestJet, Virgin Australia, and others grounded affected aircraft
- **Damage**: estimated at over GBP 39.3 million in losses across airlines and manufacturers
- **Justice**: the UK SFO (Serious Fraud Office) investigated. Defendant Zamora pleaded guilty at Southwark Crown Court on 2025-12-01 and was sentenced on 2026-02-23 to 4 years and 8 months' imprisonment
- **Context**: a case of the structure in which regulatory attributes such as airworthiness, conformity, and qualification are accepted while the provenance of the documents asserting them cannot be independently verified at the point of receipt (same family as [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/) / 020 / 021 / 035)

The incident came together as the following chain.

1. **Documenting the regulatory attribute**: a part's airworthiness is attested by a document, the Authorised Release Certificate (ARC). The receiving side trusts the attribute of airworthiness on the strength of this certificate
2. **Forging the certificate**: AOG altered legitimate ARCs and attached fake shipping records and signatures of fictitious employees, as if bought directly from OEMs, to mimic a legitimate supply route
3. **Absence of independent provenance verification**: the receiving side (airlines, maintenance operators) had no means to independently verify the certificate's provenance (whether the legitimate issuer truly issued it for this part) at the point of receipt, and accepted the airworthiness attribute on the existence of the certificate
4. **Inflow into an irreversible domain**: with airworthiness unverified, parts circulated into a domain where they could be installed into the engines of operating aircraft. For more than four years, it went structurally unnoticed
5. **Discovery via after-the-fact inquiry**: the trigger was a manual authenticity inquiry (airline → Safran) — reliant on an accidental check rather than structural pre-verification

---

## 3. Timeline — disclosure and response

- 2019-01 to 2023-07: AOG Technics sells more than 60,000 engine parts (worth roughly GBP 6.9 million) accompanied by forged ARCs
- 2023: an airline queries Safran about a part's authenticity and the certificate is found to be fake. Safran reports it to the authorities; CAA/FAA/EASA issue safety warnings. Many airlines ground affected aircraft
- 2025-12-01: defendant Zamora pleads guilty at Southwark Crown Court
- 2026-02-23: the SFO announces a sentence of 4 years and 8 months' imprisonment

> Note: the facts in this Brief are based on the UK SFO's announcements and established media reporting. This Brief does not condemn the individual defendant's motives; it focuses on the structure in which the provenance of the certificate asserting the regulatory attribute of airworthiness is not independently verified before receipt. Amounts and part counts rely on, and cite, the authorities and reporting.

The response and industry movement after disclosure:

- **UK SFO**: investigated and prosecuted AOG Technics' sale of parts with forged certificates. Defendant Zamora pleaded guilty (2025-12-01) and was sentenced to 4 years and 8 months' imprisonment (announced 2026-02-23)
- **Regulators (CAA/FAA/EASA)**: issued safety warnings about AOG Technics parts and prompted cross-industry identification and removal of affected parts
- **OEMs and airlines**: discovery began with Safran's authenticity check. Delta, American, Southwest, and others grounded affected aircraft, and tracing and replacement of parts advanced across the industry
- **Cross-industry argument**: the absence of a mechanism to independently verify, at the point of receipt, the provenance of an airworthiness certificate (ARC) in the aircraft-parts supply chain was again called into question. A design that makes the provenance of issuer, subject, and authenticity verifiable — not the appearance of a document — is advancing as discussion, as a requirement for a safety-critical supply chain

"How to independently verify, before receipt, the provenance of the certificate asserting a regulatory attribute such as airworthiness or conformity" is expected, prompted by this case, to advance as discussion as an essential requirement for aircraft-parts supply chains and for the design of regulatory-attribute infrastructure.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the provenance of the certificate (ARC) asserting the regulatory attribute of airworthiness is not independently verified before receipt, and the attribute is accepted on the existence of the certificate alone"**. The existence of a certificate was severed from whether that certificate was genuine and actually backed the airworthiness of the subject part. As a secondary category, `data-provenance` is noted, in that the origin of the documents (certificates, shipping records) goes unverified.

This is the same `attribute-proof-bypass` as [Brief 020](/critical/briefs/020-type-designation-conformity-fraud/) (type designation: falsified certification test data, regulatory-conformance attribute flowing straight to shipment unverified), [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/) (national qualification: an engineer not meeting the practical-experience requirement deployed on site as qualified), and [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (Wirecard: a balance confirmation that falsely asserted "the balance exists at the bank" for a balance that did not exist) — all isomorphic in the structure where **a regulatory attribute (conformity, qualification, finances, airworthiness) is accepted while the provenance of the document or evidence asserting it goes unverified.** It connects directly to [Brief 035](/critical/briefs/035-boeing-787-inspection-records/) (Boeing 787: inspections recorded as "complete" that had not been performed) in that **the existence of a record or certificate is not proof of the reality it points to (the inspection being performed, the part being airworthy).**

This structure holds regardless of whether anyone maliciously forges a document — if the provenance of the certificate asserting the attribute cannot be independently verified at the point of receipt, then whether by forgery or by clerical error, an unverified attribute flows into an irreversible domain (operating aircraft, live practice, the market). The reason the forgery went unnoticed for more than four years in this case is precisely that this layer of independent verification was absent. The more an attribute is directly tied to safety, like airworthiness, the more the independent verification of the certificate's provenance — not the certificate's existence — is required as a precondition of circulation.

The authenticity inquiry, Safran's report, the CAA/FAA/EASA safety warnings, the grounding of affected aircraft, and the SFO's investigation and prosecution were essential to grasping, containing, and deterring the harm, and this Brief does not dispute that role. Through them, the fraud was stopped and accountability was imposed.

These detection and remediation steps, however, do not change the design itself of whether the receiving side "accepts the airworthiness attribute only after independently verifying the certificate's provenance." In this case, because the forged certificates bore a legitimate appearance, the attribute was accepted on the existence of the certificate and went structurally unnoticed for more than four years. What was missing was a layer to independently verify, before receipt, "is this certificate a genuine one, issued by the legitimate issuer for this part?" — verification of a different lineage from after-the-fact authenticity inquiry or grounding. That discovery depended on a manual, accidental inquiry shows its absence. As material to prove, in regulatory reporting or safety audits, "was this part backed by a genuine airworthiness certificate?", the mere fact that a certificate is in hand is not an independent trail of provenance — that certificate was itself a forgery.

---

## 5. What proof would have changed

Pre-execution attestation and provenance proof treat the regulatory attribute without severing it from the provenance of the document asserting it. Rather than "does the certificate exist," they confirm "is it a genuine one, issued by the legitimate issuer for this subject" as an independently verifiable proof before receipt, and block acceptance if provenance cannot be confirmed. Detection (after-the-fact inquiry, grounding, regulatory warning) and pre-receipt provenance proof of the attribute are a **complementary** relationship, not substitutes; only when the two overlap can safety-critical parts circulation be put into practice.

For the detection–proof gap exposed here (the provenance of the certificate asserting a regulatory attribute is not independently verified before receipt), Lemma offers a design that treats the confirmation of the attribute by tying it to the provenance of the document asserting it.

- **Provenance-based attribute proof**: rather than "does the certificate exist," confirm "is it a genuine one, issued by the legitimate issuer for this subject" as an independently verifiable proof before receipt, and block acceptance if provenance cannot be confirmed
- **Fixing issuance authenticity**: fix the issuer, the subject, and the fact of issuance as provenance that cannot be tampered with, so that mimicking a document's appearance does not establish the attribute
- **Selective disclosure**: without fully disclosing sensitive transaction information, disclose only the minimum — "this part is backed by a genuine airworthiness certificate" — reconciling independent verification with the confidentiality of commercial transactions
- **Cross-supply-chain verification**: make the attribute's provenance verifiable at each stage of the supply chain, stopping the inflow of fraud or clerical error into an irreversible domain

Against the regulatory-attribute-proof category's design thesis that "the existence of a certificate ≠ proof of the attribute's provenance," this case is an instance in which its anticipated failure mode materialized as more than four years of forged circulation in a safety-critical aircraft-parts supply chain. Detection (after-the-fact inquiry, grounding, regulatory warning, prosecution) serves remediation of harm; pre-receipt provenance proof (proof) of the attribute serves the establishment of supply-chain trust — each working complementarily.

---

## 6. Sources

- **UK SFO (GOV.UK, primary)**: "SFO secures 4-year prison sentence for aircraft parts fraud" (2026-02-23) — <https://www.gov.uk/government/news/sfo-secures-4-year-prison-sentence-for-aircraft-parts-fraud>
- **AeroTime**: "Fake aircraft parts fraudster jailed for $52M scam that grounded airline fleets" (2026-02) — <https://www.aerotime.aero/articles/fake-aircraft-parts-aog-technics>
- **Simple Flying**: "60,000 Fake Parts Sold: The True Scale Of The AOG Technics Fraud" — <https://simpleflying.com/60000-fake-parts-sold-true-scale-aog-technics-fraud/>
- **Reference implementation (GitHub)**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/#attribute), [Seal](https://lemma.frame00.com/seal/)
