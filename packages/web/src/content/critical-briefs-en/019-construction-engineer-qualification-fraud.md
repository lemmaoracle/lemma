---
brief_no: 19
title: "国家資格の実務経験を満たさない技術者の現場配置 — 有資格者配置における規制属性の独立検証不在"
title_en: "Unqualified Engineers Placed Under National-License Claims — Regulatory Attributes Asserted Without Independent Verification at the Point of Assignment"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth"]
incident_date: 2024-12-20
published: 2026-06-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["006-google-api-key-revocation-lag", "005-noroboto-lying-fonts", "020-type-designation-conformity-fraud", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
og_lead_ja: "国家資格の実務経験を満たさない技術者の現場配置 — 有資格者配置の独立検証不在"
og_lead_en: "Engineers placed under national-license claims they didn't meet — qualified-worker fraud"
gap_detected: "Internal investigations, a third-party committee, and administrative audits could make the scope of the fraudulent acquisitions and the placement record visible after the fact."
gap_missing: "There was no layer to confirm before placement whether each engineer was a qualified holder meeting the requirements, so self-reported work experience passed straight through."
gap_fix: "Before placement, independently verify with Lemma that the engineer validly holds the required national license and meets the requirements, and prevent it up front."
---

## TL;DR

In December 2024, Japan's MLIT issued an administrative instruction against a construction operator for placing employees who held national construction-management licenses obtained without the required practical experience on sites that mandate qualified workers. Self-reported experience is not re-verified at issuance, and with no layer to confirm qualification before placement, the gap between the asserted attribute and reality surfaces only through after-the-fact detection — internal review or audit — years late, which cannot change whether the engineer was properly qualified at assignment. After-the-fact detection and pre-execution attestation that independently verifies origin and authorization before acting are complementary, not substitutes.

---

## 1. Incident Overview

- **Most recent action**: December 2024, an administrative instruction by an MLIT regional bureau under Article 28(1) of the Construction Business Act (a mid-to-large road-paving contractor)
- **Grounds**: violation of Article 15(2) — placing a person who did not meet qualification requirements as a dedicated engineer at a business office
- **Nature of the licenses**: mainly Class 1 Landscaping and Class 1 Civil Engineering construction management licenses obtained without sufficient practical experience, via duplicated experience periods or inclusion of ineligible periods (multiple individuals)
- **The company's account**: described as a misunderstanding of the practical-experience requirements rather than intentional fraud
- **Landmark precedent**: group companies of a major electronics maker (disclosed by MLIT, August 2021). 390 employees took the examination and obtained construction management licenses without sufficient experience; 13 obtained the supervising-engineer certificate. Unqualified employees may have been placed as chief engineers and the like on up to 2,422 projects (150 of them with contract value of ¥5M or more), and 58 as dedicated engineers at business offices. The improper acquisitions ran from around 2000 to 2021
- **Regulatory frame**: in July 2021 MLIT amended the "Standards for Disciplinary Action against Improper Conduct by Construction Operators," setting a business-suspension order of 30 days or more for placing a fraudulently qualified person as a chief or supervising engineer

---

## 2. Timeline

- 2020-08: MLIT establishes a study group on preventing examination fraud
- 2020-11: the study group issues recommendations, including stricter disciplinary action
- 2021-07-26: amendment to the disciplinary-action standards published, strengthening business-suspension orders for contractors placing fraudulently qualified persons
- 2021-08-31: MLIT discloses the major electronics maker's group self-investigation (390 / 13, up to 2,422 placements) and its own response (license revocation, 3-year examination ban, disciplinary action, designation suspension)
- 2024-12-20: a regional bureau issues an administrative instruction against a mid-to-large road-paving contractor under Article 28(1)
- 2025-01: trade media report the recent case, framing national-license fraud as an ongoing structural problem

---

## 3. From Acquisition to Assignment

This is not an external attack; it stems from an operating structure in which a regulatory attribute is never independently verified. The failure propagates to on-site assignment as follows.

1. **Self-reported experience**: the candidate self-reports practical experience when sitting the examination or applying for the supervising-engineer certificate. Duplicated years or ineligible periods can enter here
2. **License acquisition**: on the basis of the reported experience, the candidate passes the examination and obtains the construction management license / supervising-engineer certificate. The actual existence of the experience is not independently re-verified at issuance
3. **Registration and assignment**: the acquired license is used to place the person as a dedicated, chief, or supervising engineer on site. The prime contractor, client, and auditor accept the asserted attribute — "this person is qualified"
4. **Delayed discovery**: the divergence between the asserted attribute and its basis (practical experience) is invisible at the point of assignment. It surfaces only afterward — through a whistleblower, self-investigation, or regulatory audit — sometimes after ten to twenty-odd years
5. **Impact realization**: once fraud is confirmed, beyond license revocation, examination bans, disciplinary action, and designation suspension, the many projects previously staffed require retrospective verification of qualification compliance

---

## 4. Structural Argument

The incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **a regulatory attribute (a national license) is accepted while severed from independent verification of its basis.** The attribute "holds a license" is presented as a roster entry, a certificate, an application form — but the actual existence of its basis, the practical experience, is not connected to a verification layer at the point of assignment. The divergence between the asserted attribute and reality cannot be made visible without that layer. `identity-auth` (the binding between the person and the asserted attribute) is noted as a secondary category.

The primitive differs from Brief 006 (Google API key revocation lag) — here the attribute is "is qualified," there it is "has been revoked" — but the underlying structure is the same: **an attribute assertion is decoupled from the layer that would verify it.** It is also adjacent to Brief 003 (Starlette/BadHost) and Brief 005 (Noroboto), which concern authentication and input-integrity assertions left unverified, across the cross-cutting layer of regulatory-attribute lifecycle.

---

## 5. The detection–proof gap

Here, the detection chain — internal review, third-party committee, regulatory audit — worked, and the scope of fraudulent acquisition and the placement record were made visible. This is a textbook detection success, and this Brief does not dispute the role of the detection layer. Detection remains essential for scoping remediation after disclosure, designing preventive measures, and driving cross-industry operational review.

Detection, however, cannot change whether, at the point of assignment, this engineer met the requirements. Self-investigation and audit are both after-the-fact; the projects carried out between assignment and discovery are already complete. Detection and audit results do not, on their own, serve as material to prove "was properly qualified at the time of assignment" in regulatory reporting, administrative procedure, or litigation. This is a gap in a structurally independent layer, beyond detection's reach.

As things stand, across the operating model for qualification checks, independent verification of the attribute at the point of assignment is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of attribute proof into the assignment path. It is a complement to detection, not a substitute; together the two establish the trust boundary for qualified-worker placement.

---

## 6. Response and Industry Response

- **MLIT**: following the study group on examination fraud (established August 2020, recommendations November 2020), it amended the disciplinary standards in July 2021, setting a business-suspension order of 30 days or more for contractors placing fraudulently qualified persons as chief or supervising engineers. In the landmark case it responded with license revocation, a 3-year examination ban, disciplinary action, and designation suspension; in the most recent case, an administrative instruction was issued in December 2024
- **Industry recognition**: national-license fraud is not confined to a single company but is reported on an ongoing basis as a structural problem spanning multiple operators. Much of the discovery traces to a misunderstanding of the practical-experience requirements, or to preventive measures not being shared across group companies

The absence of a layer that independently verifies the certainty of an attribute's basis (practical experience) at the point of assignment is surfacing not as one company's problem but as an industry-wide operational challenge.

---

## 7. Lemma's Analysis

For the detection–proof gap exposed here — a regulatory attribute claim flowing straight to on-site assignment while severed from independent verification of its basis — Lemma offers a design in which an engineer's qualification attribute is committed as an independently verifiable cryptographic proof, so that a prime contractor, client, or auditor can independently verify "was placed as a qualified person meeting the requirements" without seeing the person's full history.

- **Issuer-signed credentials**: licensing bodies and registries issue licenses and practical-experience records with issuer signatures
- **Selective disclosure**: BBS+ over BLS12-381 discloses only that "the required national license is held, valid, and meets the requirements" — never the detail of the person's history or experience
- **Validity and revocation**: committed with Poseidon over BN254; validity and non-revocation proven with Groth16 (Circom circuits); bound to the source records via docHash

A proof fixed at the point of assignment then functions, years later when "was a qualified person placed at the time?" is asked, as an independently verifiable trail that discloses no sensitive personal information. Detection (after-the-fact audit) serves remediation after disclosure; pre-execution attestation (attribute verification at assignment) serves independent verification of the legitimacy of placement — complementary layers.

---

## 8. Sources

- **MLIT (Kanto Regional Bureau)**: "Disciplinary action against a construction operator" (2024-12-20, administrative instruction under Article 28(1) of the Construction Business Act; grounds: violation of Article 15(2)) — https://www.ktr.mlit.go.jp/kisha/kisha_01991.pdf
- **MLIT**: disclosure on deficiencies in practical experience for the skills examination (2021-08-31; self-investigation results 390 / 13, up to 2,422 placements; MLIT's response) — https://www.mlit.go.jp/report/press/tochi_fudousan_kensetsugyo13_hh_000001_00068.html
- **MLIT**: "Amendment of the Standards for Disciplinary Action against Improper Conduct by Construction Operators" (2021-07-26; business-suspension order of 30 days or more for contractors placing fraudulently qualified persons) — https://www.mlit.go.jp/report/press/tochi_fudousan_kensetsugyo13_hh_000001_00064.html
- **Trade media (secondary)**: ongoing reporting on national-license fraud in construction (January 2025 and after) — Nikkei xTECH

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
