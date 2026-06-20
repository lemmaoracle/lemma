---
brief_no: 20
title: "認証試験データの改ざんによる型式指定の取得 — 製品の規制適合属性が独立検証されないまま出荷に直結する構造"
title_en: "Tampered Certification Test Data Behind Type Designation — Product Regulatory-Conformance Attributes Asserted Without Independent Verification on the Path to Shipment"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2024-01-26
published: 2026-06-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["019-construction-engineer-qualification-fraud", "006-google-api-key-revocation-lag", "021-wirecard-balance-attestation"]
version: "1.0"
status: published
og_lead_ja: "認証試験データの改ざんで型式指定を取得し出荷に直結 — 型式指定不正"
og_lead_en: "Tampered certification test data reached type designation and shipment — type-designation fraud"
gap_detected: "Internal investigations, a third-party committee, and on-site inspections by the regulator could make the scope of the fraud and the affected vehicle models visible after the fact."
gap_missing: "There was no layer to confirm before type designation whether the submitted test data had been legitimately obtained under the prescribed conditions, so test data the company ran and submitted itself passed straight through."
gap_fix: "Before type designation, independently verify with Lemma that the product conforms to the standards under the prescribed test conditions, and prevent it up front."
---

## TL;DR

In January 2024, in a type-designation fraud, Japan's MLIT revoked the type designation of three models from a major automaker after the certification test data — the state's basis for confirming vehicles meet safety standards — was found falsified; similar irregularities surfaced across makers of cars, motorcycles, and industrial engines. Detection is after-the-fact: it cannot change whether the submitted data was legitimately obtained at application, and shipped vehicles are already in the market. What is missing is a layer that independently verifies conformity at application. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Most recent action**: January 2024, MLIT revokes the type designation of three vehicle models from a major automaker. On-site inspection identified additional irregularities not contained in the company's internal report
- **Structure of the framework**: type designation is the framework under which the state confirms that mass-produced vehicles and engines meet the Road Transport Vehicle Act's safety standards, enabling mass production and shipment. The basis of that confirmation is the certification test data the applicant (the maker) generates and submits itself
- **Cross-industry spread**: around the same period, on-site inspections at multiple makers of cars, motorcycles, and industrial machinery uncovered irregularities across several models and engines. In one case, a major industrial-machinery maker saw nearly the entire range of its industrial-engine designations revoked
- **Nature of the irregularities**: alterations or falsification of test conditions or measurement values for crash, emissions, fuel-economy, and output tests — touching safety standards and regulatory thresholds
- **Regulator response**: MLIT conducted on-site inspections and conformity-verification tests. In June 2024, announced the completion of technical verification across all affected vehicles and engines

---

## 2. Timeline

- 2023-12: certification-test irregularities are disclosed by the maker's internal investigation and a third-party committee
- 2024-01-16: MLIT announces its intention to revoke the type designation of three models. On-site inspection identifies new irregularities
- 2024-01-26: the three models' type designations are formally revoked
- First half of 2024: on-site inspection extends to multiple makers of cars, motorcycles, and industrial machinery. Irregularities are confirmed across multiple companies
- 2024-06-25: MLIT announces the completion of technical verification of conformity across all affected vehicles and engines

---

## 3. From Application to Shipment

This is not an external attack; it stems from an application structure in which a regulatory attribute is never independently verified. The failure propagates to shipment as follows.

1. **In-house testing**: the maker conducts in-house the certification tests required for the type-designation application (crash, emissions, fuel economy, output, and so on) and records the results as measurement data
2. **Data submission**: the applicant submits the measurement data to the regulator. Even if test conditions or measurement values were altered or falsified, the authenticity of the submitted data and the validity of the test conditions are not independently re-verified at the point of application
3. **Grant of type designation**: type designation is granted on the basis of the submitted data, enabling mass production and shipment. Downstream parties (dealers, buyers, parts suppliers) accept the asserted attribute — "this is a regulation-conformant type"
4. **Delayed discovery**: the divergence between the test-data claim and reality is not made visible after mass production begins. It surfaces only afterward through internal whistleblowing, third-party committees, or on-site inspection
5. **Impact realization**: once irregularities are confirmed, beyond type-designation revocation, shipment halt, conformity re-verification, and recall consideration, the vehicles and products already in the market require retrospective conformity verification

---

## 4. Structural Argument

The incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **a product's regulatory-conformance attribute is accepted while severed from independent verification of its basis.** The attribute "meets the standard" is presented as a type designation, a conformance certificate, an application form — but the authenticity of its basis, the certification test data, and the validity of the test conditions are not connected to a verification layer at the point of grant. Across much of the field, self-reporting and paper documents remain the operational shape, and the divergence between asserted attribute and reality cannot be made visible without that layer. `identity-auth` (the binding between the test originals and the applicant) is noted as a secondary category.

The primitive differs from Brief 019 (worker qualification — "is qualified") and Brief 006 (Google API key revocation lag — "has been revoked"), but the underlying structure is the same: **an attribute assertion is decoupled from the layer that would verify it.**

---

## 5. The detection–proof gap

Here, the detection chain — internal review, third-party committee, regulatory on-site inspection — worked, and the scope of irregularities and the affected models were made visible. This is a textbook detection success, and this Brief does not dispute the role of the detection layer. Detection is essential for scoping remediation after disclosure, recall judgments, and driving cross-industry operational review.

Detection, however, cannot change whether, at the point of application, the submitted test data was legitimately obtained under the prescribed test conditions. On-site inspection and verification tests are both after-the-fact; the vehicles and products mass-produced and shipped before disclosure are already in the market. Detection results do not, on their own, serve as material to prove "was properly conformant at the time of application" in regulatory reporting, administrative procedure, or litigation. This is a gap in a structurally independent layer, beyond detection's reach.

As things stand, across the operating model for product certification, independent verification of the test data at the point of application is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of attribute proof into the application / shipment path. It is a complement to detection, not a substitute; together the two establish the trust boundary for product conformity.

---

## 6. Response and Industry Response

- **MLIT**: conducted on-site inspections at multiple makers and conformity-verification tests, and announced the completion of technical verification across all affected vehicles and engines. Responded with type-designation revocation and shipment halt as institutional measures
- **Industry recognition**: certification-test irregularities are not confined to a single company but are reported on an ongoing basis as a structural problem across multiple automotive, motorcycle, and industrial-machinery operators. Development-schedule pressure, the independence of testing departments, and internal data-management practices have surfaced as topics

The absence of a layer that independently verifies the basis of a product's regulatory attribute (test data) at the point of application is surfacing not as one company's problem but as a cross-manufacturing operational challenge.

---

## 7. Lemma's Analysis

For the detection–proof gap exposed here — a product's regulatory-conformance attribute claim flowing straight to type designation and shipment while severed from independent verification of its basis — Lemma offers a design in which certification test results are committed as independently verifiable cryptographic proofs, so that regulators and trading partners can independently verify "met the standard under the prescribed test conditions" without the company releasing its original test records.

- **Schema-bound proofs**: each proof is bound to the regulatory schema it satisfies (safety standards, emissions regulations, etc.), letting auditors verify directly against the regulatory text
- **Selective disclosure**: BBS+ over BLS12-381 discloses only "met the standard under the prescribed test conditions" — the test originals and the detail of internal measurement data never leave the company
- **Original binding and validity**: committed with Poseidon over BN254; conformity and non-tampering proven with Groth16 (Circom circuits); bound to the test data originals via docHash

A proof fixed at the point of application then functions, years later when "was the standard met under the prescribed test conditions at the time?" is asked, as an independently verifiable trail that discloses no original data. Detection (after-the-fact on-site inspection) serves remediation after disclosure; pre-execution attestation (attribute verification at application) serves independent verification of conformity — complementary layers.

---

## 8. Sources

- **MLIT**: disclosure on irregularities in automakers' type-designation applications (2024, on-site inspection results, type-designation revocation, conformity verification) — https://www.mlit.go.jp/jidosha/jidosha_tk8_000023.html
- **MLIT**: disclosure on irregularities in type-designation applications (2024, three-model type-designation revocation) — https://www.mlit.go.jp/jidosha/jidosha_tk8_000020.html
- **Maker's own disclosure**: announcement on results of conformity verification (2024-06-25, completion of technical verification) — https://www.daihatsu.com/jp/news/2024/20240625-1.html
- **Trade media (secondary)**: reporting on type-designation revocation and re-acquisition for industrial engines (2024) — Nikkei xTECH

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
