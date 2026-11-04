---
brief_no: 41
title: "AOG Technics: aircraft engine parts circulated with forged airworthiness certificates (UK SFO)"
title_en: "AOG Technics: aircraft engine parts circulated with forged airworthiness certificates (UK SFO)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-02-23
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "035-boeing-787-inspection-records", "019-construction-engineer-qualification-fraud", "021-wirecard-balance-attestation"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "英 SFO によれば、AOG Technics が偽造された耐空証明書付きの航空機エンジン部品 6 万点超を販売。同社ディレクターに禁錮 4 年 8 月の判決"
og_lead_en: "According to the UK SFO, AOG Technics sold 60,000+ aircraft engine parts with forged airworthiness certificates; its director was sentenced to 4 years 8 months"
og_kicker_ja: "偽造の証明書 · 航空機の部品"
og_kicker_en: "FORGED CERTIFICATES · AIRCRAFT PARTS"
og_headline_ja: "偽造の耐空証明書つきで\nエンジン部品を販売と\nSFO が発表。\n<accent>6 万点超</accent>"
og_headline_en: "Engine parts sold with\nforged airworthiness\ncertificates, SFO says.\n<accent>60,000+ parts.</accent>"
key_figures:
  - value: "60,000+"
    unit: "parts"
    label: "Aircraft engine parts sold with forged ARCs (SFO, reporting)"
    tone: "alert"
  - value: "~6.9M"
    unit: "GBP"
    label: "Value of the parts sold with forged ARCs (SFO, reporting)"
  - value: "2019-01 → 2023-07"
    label: "Period during which parts with forged certificates were sold"
glossary:
  - term: "ARC (Authorised Release Certificate)"
    desc: "A certificate showing that a part meets airworthiness requirements and is fit for use. It travels with the part."
  - term: "Airworthiness"
    desc: "The state of an aircraft or part being fit to fly safely."
  - term: "OEM"
    desc: "The manufacturer of a part or engine. In this case, Safran (a joint owner of CFM International) among others."
  - term: "SFO (Serious Fraud Office)"
    desc: "The UK body that investigates and prosecutes serious fraud and corruption."
insight:
  slug: "certificate-accepted-on-appearance"
  label: "Certificates accepted on appearance"
  quote: "Without a step that checks a part's accompanying certificate against the records of the party said to have issued it, before the part is accepted, a well-formed certificate is accepted on its appearance alone."
industries: ["manufacturing", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "Check with the issuer that a part's certificate was genuinely issued by it"
  - slug: "hold-unverified"
    item: "Do not install parts whose certificates cannot be confirmed"
attack_method: "supply-chain"
impact: "Over 60,000 parts sold with forged certificates"
takeaway: "The forged certificates arrived with the parts in a legitimate-looking form; the forgery came to light when an airline asked Safran whether a part was genuine (SFO, reporting)."
self_check: "Before you accept a part, is there a mechanism that checks whether its accompanying certificate exists in the records of the party said to have issued it?"
countries: ["gb"]
---

## 1. Summary

According to the SFO and reporting, the company's director altered legitimate certificates and attached shipping memos making it look as if the parts had been bought directly from OEMs, along with signatures and emails in the names of fictitious employees, to pose as a legitimate supplier. The forgery came to light when an airline asked Safran whether a part was genuine; the UK CAA, US FAA and Europe's EASA issued safety warnings, and many airlines took affected aircraft out of service. That the certificates were not genuine became visible from outside, after the sales, when the party said to have issued them was asked. <strong>Without a step that checks a part's accompanying certificate against the records of the party said to have issued it, before the part is accepted, a well-formed certificate is accepted on its appearance alone.</strong>

## 2. What got through

- **What got through**: According to the SFO and reporting, the sale of aircraft engine parts accompanied by forged ARCs. The parts came with fake shipping memos making it look as if they had been bought directly from OEMs, and with signatures and emails from fictitious employees (sales and quality-control staff). Many were for the CFM56 engine (widely fitted on the Boeing 737 / Airbus A320).
- **What reached the receiving side**: In general, when a part is received, a certificate such as an ARC and shipping records arrive with it. If the certificate and the shipping records are fabricated together, the documents in the receiving side's hands do not contradict one another.
- **Detection route**: In 2023, an airline asked Safran whether a part was genuine, and the certificate was found to be fake. Safran reported it to the authorities, and the CAA, FAA and EASA issued safety warnings. All of these acted after the sales.
- **Not disclosed**: The sources reviewed do not describe how the companies that received the parts checked the certificates, or how many of the parts with forged certificates were installed on aircraft.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the issuer, the subject part and the fact of issuance on a part's accompanying certificate are checked, separately from the seller's documents, against the records of the party said to have issued it, before the part is accepted.

- **Who approves**: The side that issues the certificate (the ARC issuer, the OEM). The issuer provides, as its own record, which certificate it issued for which part. The basis for a certificate is not supplied by the side selling the part.
- **Where it is checked**: Just before a part is accepted, and just before it is installed on an aircraft. The entries on the certificate received are compared with what the issuer recorded. A part that cannot be checked is not accepted or installed until it can be.
- **What is recorded**: For each part, which certificate it was accepted with and which issuer record that certificate was checked against. Kept outside both the seller and the receiver, in a form that cannot be rewritten afterwards. It is what lets affected parts be traced when a safety warning is issued.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a part is accepted, its accompanying certificate against the records of the party said to have issued it, and keeping a record. Detection means noticing after the sales, from inquiries, reports to authorities, safety warnings and investigation. Dates follow the SFO's announcement and reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the certificate against the issuer's records before acceptance</div>
<div class="rx-zone gapz"><b>What the SFO and reporting described</b><span>Altered legitimate ARCs and fake shipping memos implying purchase from OEMs<br>Signatures and emails in the names of fictitious employees</span></div>
<div class="rx-zone det"><b>Detection · worked after the sales</b>An airline's inquiry revealed the forgery; authorities issued safety warnings and the SFO investigated and prosecuted</div>
<div class="rx-g g1"><div class="t">2019-01 → 2023-07</div><b>Parts sold with forged ARCs</b></div>
<div class="rx-g g2"><div class="t">2023</div><b>Inquiry to Safran, safety warnings</b></div>
<div class="rx-g g3"><div class="t">2025-12-01</div><b>Guilty plea</b></div>
<div class="rx-g g4"><div class="t">2026-02-23</div><b>Sentenced to 4 years 8 months</b></div>
</div>
</figure>

Detection made the parts with forged certificates visible from outside, and moves the identification and replacement of affected parts and the investigation forward. It works separately from a check before acceptance. Cases where an attribute required by regulation was accepted on the strength of the document asserting it include [Brief 020](/critical/briefs/020-type-designation-conformity-fraud/) (a product's conformity attribute), [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/) (a person's qualification attribute) and [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (a balance attribute); a case where records did not match reality is [Brief 035](/critical/briefs/035-boeing-787-inspection-records/) (inspection records).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts parts and into the installation procedure.** It does not detect forgery or inspect the condition of parts; it checks, outside the seller, whether the issuer, the subject part and the fact of issuance on a certificate received match the issuer's records, and keeps a record. It can also show only that the check was completed, without releasing sensitive information such as trading terms.

### Industries and operations to watch

- **Industry · Manufacturing & critical infrastructure**: Organizations, such as aircraft operators and maintenance providers, that use safety-critical parts on the basis of the parts' certificates.
- **Industry · Procurement & supply chain**: Organizations that buy certified parts through traders or brokers rather than directly from the manufacturer.
- **Operations · Approval & sign-off**: Work that decides, on the basis of a certificate received, whether to accept or install a part.

### Current controls vs Lemma

In this case, the route described by the SFO and reporting is the first column. The second and third columns are steps after acceptance.

| Control | Accepting parts with certificates | Installing on aircraft | Identifying affected parts after a safety warning |
| --- | --- | --- | --- |
| Document inspection on receipt (certificate format and entries) | Partial | Partial | Not relevant |
| Ad hoc inquiries to the issuer (OEM) | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Partial |

Document inspection can find missing or inconsistent entries, but cannot tell whether a certificate copying a legitimate format is genuine. Inquiries to the issuer were the route by which the forgery came to light here, but whether to ask is left to judgment part by part and person by person. Lemma compares a certificate received with the issuer's records before acceptance and does not accept one that cannot be checked. At installation, it can check before installing whether a check record exists, but whether a part without one is stopped depends on the maintenance procedure. For identifying affected parts, the record of which part was accepted with which certificate can be traced, but parts accepted before the check was built in have no such record.

Note: Lemma's check works only when it is built into the acceptance and installation steps, and the certificate's issuer records, outside the selling side, which certificate it issued for which part. If the issuer's own record is wrong, wrong results go through too. What can be checked is whether a certificate matches the record, not the physical condition of the part. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent fraud or intrusions.

### Checklist

Three things to confirm for organizations that accept and install certified parts

- Is there a procedure that keeps a part that cannot be checked out of stock and off aircraft until it can be confirmed?
- Can you confirm afterwards, for each part, which certificate and which check result it was accepted with?
- When a safety warning is issued, can you quickly identify from your records the parts accepted from the supplier concerned?

## 5. Facts and timeline

- **Subjects**: AOG Technics (a UK-based aircraft-parts trader) and the airlines and maintenance operators that purchased parts with forged certificates from it.
- **Scale**: Between January 2019 and July 2023, more than 60,000 aircraft engine parts (worth roughly GBP 6.9 million) were sold accompanied by forged ARCs. Many were for the CFM56 engine (737 / A320).
- **Method**: According to the SFO and reporting, the company's director (Jose Alejandro Zamora Yrala) altered legitimate ARCs on his home PC and created fake shipping memos as if the parts had been bought directly from OEMs such as Safran. Using signatures and emails under the names of fictitious employees (sales and quality-control staff), he posed as a legitimate operator.
- **Discovery**: In 2023, an airline asked Safran (a joint owner of CFM International) whether a part was genuine, and the certificate was found to be fake. Safran reported it to the authorities.
- **Regulatory response**: The UK CAA, US FAA and Europe's EASA issued safety warnings about AOG Technics parts. Delta, American, Southwest, TAP, Ryanair, WestJet, Virgin Australia and others took affected aircraft out of service.
- **Losses**: Losses across airlines and manufacturers are estimated at over GBP 39.3 million.
- **Justice**: The UK SFO investigated. Defendant Zamora pleaded guilty at Southwark Crown Court on 2025-12-01 and was sentenced on 2026-02-23 to 4 years and 8 months' imprisonment.

### Timeline

- **2019-01 → 2023-07**: AOG Technics sells more than 60,000 engine parts (worth roughly GBP 6.9 million) accompanied by forged ARCs.
- **2023**: An airline asks Safran whether a part is genuine, and the certificate is found to be fake. Safran reports it to the authorities; the CAA, FAA and EASA issue safety warnings. Many airlines take affected aircraft out of service.
- **2025-12-01**: Defendant Zamora pleads guilty at Southwark Crown Court.
- **2026-02-23**: The SFO announces a sentence of 4 years and 8 months' imprisonment.

> The method and the sentence rest on the UK SFO's announcement and reporting by established outlets. Amounts and part counts rely on the authorities and reporting. This Brief does not discuss the individual defendant's motives, nor does it attribute fault to the airlines and maintenance operators that received the parts. What was not disclosed does not mean controls were absent.

### After disclosure

- **UK SFO**: Investigated and prosecuted AOG Technics' sale of parts with forged certificates. Defendant Zamora pleaded guilty (2025-12-01) and was sentenced to 4 years and 8 months' imprisonment (announced 2026-02-23).
- **Regulators (CAA, FAA, EASA)**: Issued safety warnings about AOG Technics parts and prompted cross-industry identification and removal of affected parts.
- **OEMs and airlines**: Discovery began with the inquiry to Safran. Delta, American, Southwest and others took affected aircraft out of service, and tracing and replacement of parts advanced across the industry.

## 6. Sources

- **UK SFO (GOV.UK, primary)**: "SFO secures 4-year prison sentence for aircraft parts fraud" (2026-02-23) — <https://www.gov.uk/government/news/sfo-secures-4-year-prison-sentence-for-aircraft-parts-fraud>
- **AeroTime**: "Fake aircraft parts fraudster jailed for $52M scam that grounded airline fleets" (2026-02) — <https://www.aerotime.aero/articles/fake-aircraft-parts-aog-technics>
- **Simple Flying**: "60,000 Fake Parts Sold: The True Scale Of The AOG Technics Fraud" — <https://simpleflying.com/60000-fake-parts-sold-true-scale-aog-technics-fraud/>
- **Reference implementation (GitHub)**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
