---
brief_no: 35
title: "検査は「完了」と記録されていたが、実施されていなかった — Boeing 787 で、記録の存在が実施の証明と取り違えられた"
title_en: "The Inspections Were Recorded as 'Complete' — But Never Performed. On the Boeing 787, the Existence of a Record Was Mistaken for Proof of the Act"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2024-05-06
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "検査は「完了」と記録されたが実施されていなかった — Boeing 787"
og_lead_en: "Inspections recorded as complete but never performed — Boeing 787"
gap_detected: "On the records the inspections were complete, so document audits and system-level checks were passed."
gap_missing: "There was no layer to confirm before shipment whether the inspection record was actually backed by a real inspection, so records with no underlying work passed as inspected."
gap_fix: "Before moving downstream, independently verify with Lemma that the inspected attribute is backed by a provenance of who actually inspected it and when, and prevent it up front."
---

## 1. TL;DR

Boeing voluntarily reported to the FAA that, on some 787 Dreamliners, mandatory wing-to-body-join safety inspections were recorded as complete while workers had never performed them. The records were in order, so document audits and system checks passed; the divergence surfaced only in a later investigation. What was missing was independent verification, when the record was generated, that it was backed by an actual inspection act; records with no underlying work passed downstream as "inspected."

---

## 2. What happened

- **Target**: the bonding/grounding-confirmation inspection at the wing-to-body join of the Boeing 787 Dreamliner
- **Disclosure**: Boeing voluntarily reported to the FAA in April 2024; the FAA announced the opening of an investigation on 2024-05-06
- **Event**: mandatory inspections were recorded as complete, but workers had not actually performed some of them (falsified records)
- **Meaning of the inspection**: a safety inspection confirming the electrical bonding/grounding of the fasteners joining wing and fuselage, ensuring the airframe is properly grounded against currents such as lightning strikes
- **Scale**: per sources, roughly 450 aircraft were affected (about 60 of them within Boeing's production line)
- **Response**: the FAA required Boeing to re-inspect all 787s on the production line and to develop a plan for the in-service fleet
- **Positioning**: a textbook case of "the existence of a record ≠ proof of the act" in the high-assurance domain of aviation safety

The incident came together as the following chain.

1. **Mandatory inspection specified**: a mandatory inspection confirming bonding/grounding is specified at the 787's wing-to-body join
2. **Act omitted**: some workers did not perform the inspection
3. **Record falsified**: the unperformed inspection is recorded as "complete" (falsification of the inspection record)
4. **Attribute passes**: "inspected," a safety/regulatory attribute, is established on the existence of the record alone and passes the manufacturing/shipment process
5. **Discovery and remediation**: Boeing reports voluntarily, the FAA opens an investigation; on to re-inspection of all aircraft on the line and remediation of the in-service fleet

---

## 3. Timeline — disclosure and response

- 2024-04: Boeing voluntarily reports to the FAA that some 787 inspections recorded as complete may not have been performed
- 2024-05-06: the FAA announces the opening of an investigation; Boeing also acknowledges the falsification of inspection records by employees
- From 2024-05: Boeing re-inspects all 787s on the production line; a plan for the in-service fleet is required

> Note: proper names and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies by point in time, so consult the latest information.

The response and industry movement after disclosure:

- **Boeing / FAA**: starting from Boeing's voluntary report, the FAA opened an investigation; re-inspection of all 787s on the production line and a plan for the in-service fleet were required
- **Cross-industry**: across manufacturing, safety, and regulation, the structure of mistaking "the existence of a record" for "proof of performance/conformity" surfaces repeatedly (see [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/)/020/021). The more electronic records and traceability advance, the more the question becomes how to independently prove both the integrity of the record and the actuality of the act the record represents. In high-assurance domains (aviation, critical infrastructure, medical devices), the need for a mechanism that ties attributes to the provenance of the act is high.

The need to "prove the inspected/conformant attribute as the provenance of performance rather than the existence of a record" is gaining weight through this case and the broader run of falsification incidents.

---

## 4. Why it wasn't stopped

The central failure primitive is that **"inspected" — a safety/regulatory attribute — passed on the existence of a record alone, without independent evidence of the act (the actual performance) that establishes the attribute.** The record asserts "the inspection was completed," but whether that assertion is backed by actual performance cannot be verified from within the record. The authenticity of the attribute (inspected) is decoupled from the provenance of the act that produces it (who actually inspected, and when).

This is the same lineage as [Brief 020](/critical/briefs/020-type-designation-conformity-fraud/) (falsification of type-designation conformity-test data), 021 (forgery of Wirecard's balance confirmation), and 019 (misrepresentation of practical experience for a national qualification). All share the structure in which "an attribute required by regulation (conformity, asset existence, qualification, inspected) feeds directly downstream (shipment, disclosure, placement, operation) on the existence of a record or document alone, without independent verification." The weight of this case is that the primitive surfaced in **the extremely high-assurance domain of aviation safety**, at a scale of some 450 aircraft. The gap between an inspection record being electronically and formally in order, and the physical act of inspection having been performed, broke the premise of safety.

The FAA's investigation, Boeing's voluntary report and re-inspection, and the plan for the in-service fleet are indispensable for restoring safety; this Brief does not dispute that role. The response that, starting from a voluntary report, led to re-inspection of all aircraft on the line is important.

But detection/audit does not guarantee "whether a record is accompanied by performance" itself. On the record the inspection was complete, and it passed document audits and system checks. Only a later investigation revealed the divergence between record and performance. What was missing is independent verification, at the moment the record is generated, that "this inspection record is backed by an actual inspection act" — a different track from after-the-fact audit. For regulatory reporting, too, there is little independent trail beyond the record itself to later prove "was this aircraft actually inspected?"

---

## 5. What proof would have changed

Pre-execution attestation proves the "inspected" attribute not by the existence of a record but as "the provenance of when, by whom, and that the inspection act was actually performed." Before proceeding downstream (shipment, operation), if the attribute's proof is not backed by the provenance of performance, the attribute does not hold even when the record is formally in order. Audit of records (the detection-style "are the records all there?") and pre-execution proof of performance ("is the record backed by the actual act?") are not substitutes but **complements**.

Against the structure exposed here (regulatory/safety attributes pass on the existence of a record alone, without the provenance of performance), Lemma proposes a design that treats an attribute (inspected, conformant) not as the presence or absence of a record but as an independently verifiable proof of "the provenance that the act producing the attribute was actually performed."

- **Invert record into act**: treat "inspected/conformant" not as the presence or absence of a record but as independent verification of "the provenance that the act producing the attribute was actually performed."
- **Prove the provenance of performance**: tie the attribute to the provenance of who actually inspected and when, requiring as a proof that the record generation is accompanied by the act.
- **Block before proceeding downstream**: even when a record is formally in order, if a proof backed by the provenance of performance does not hold, do not establish the attribute and reject progression to shipment/operation in advance.
- **Complement to audit**: place audit of records (are they all there?) and pre-execution proof of performance (is it backed by the actual act?) side by side as separate tracks.

If a proof backed by the provenance of performance does not hold, the attribute is not established, and after-the-fact audit is complemented by proof beforehand. Read together with [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/)/020/021 as the "existence of a record ≠ proof of the reality" lineage.

---

## 6. Sources

- **The Seattle Times**: "FAA opens new investigation into Boeing 787 wing-to-body join work" (2024-05; inspection content, scale, FAA response) — https://www.seattletimes.com/business/boeing-aerospace/faa-opens-new-investigation-into-boeing-787-wing-to-body-join-work/
- **The Washington Post**: "FAA investigating whether Boeing falsified 787 inspections" (2024-05-06) — https://www.washingtonpost.com/transportation/2024/05/06/faa-boeing-787-inspections/
- **NPR**: "FAA is investigating Boeing for apparent missed inspections on 787 Dreamliner" (2024-05-06) — https://www.npr.org/2024/05/06/1249432229/faa-investigation-boeing-787-dreamliner
- **CBS News**: "FAA investigates Boeing for falsified records on some 787 Dreamliners" (2024-05) — https://www.cbsnews.com/news/boeing-787-dreamliners-faa-falsified-records/

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/#attribute), [Trust402](https://lemma.frame00.com/trust402/)
