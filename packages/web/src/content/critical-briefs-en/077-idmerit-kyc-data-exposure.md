---
brief_no: 77
title: "IDMerit：本人確認のために集めた約10億件が、保護されないまま公開状態に置かれた — 本人性の証明と原本属性・AML 検証ログの保管が分離されない構造（Cybernews）"
title_en: "IDMerit: about a billion identity-verification records left publicly exposed — identity proof not separated from the storage of raw attributes and AML logs (Cybernews)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak", "034-ekyc-liveness-bypass", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "IDMerit が本人確認で集めた約10億件を保護なしで公開状態に放置"
og_lead_en: "IDMerit left about a billion identity-verification records publicly exposed without protection"
gap_detected: "Cybernews discovered the exposure and IDMerit closed the database the next day, cutting off the exposure."
gap_missing: "The function of having 'verified' identity was not separated from the practice of continuing to hoard the raw attributes used for that verification, so the verifier itself became the breach surface."
gap_fix: "Perform identity verification by proving only that 'this attribute is verified' with Lemma — without retaining or disclosing the originals — so the verifier never becomes the aggregation point, and prevent it up front."
---

## TL;DR

IDMerit, which provides identity verification (KYC) for financial services, left a MongoDB database exposed on the internet without protection, leaving about a billion personal records across 26 countries accessible to anyone. What was exposed included names, addresses, national ID numbers, dates of birth, phone numbers, emails, and communication metadata — plus the KYC / AML verification logs themselves. A Cybernews researcher discovered it on 2025-11-11 and IDMerit closed it the next day, but public disclosure came about 99 days later on 2026-02-18. The function of having "verified" identity was not separated from the practice of continuing to hoard the raw attributes used for that verification. To prove that someone had been verified, the verifier became a vast aggregation point for raw data, and that aggregation point became the breach surface itself. Detection — discovery and closure — functioned, but there was no layer placing "is this attribute proven without retaining or disclosing the originals?" as a design premise.

---

## 1. Incident overview

- **Target**: IDMerit (a California-based AI identity-verification provider supplying KYC / AML for financial services and fintech)
- **Scale of harm**: About a billion personal records (PII) exposed across 26 countries. Over 1TB in total. By country, the US is reported at about 203 million records and Mexico at about 124 million
- **Exposed data**: Names, addresses, national ID numbers, dates of birth, phone numbers, email addresses, communication metadata, and the **KYC / AML verification logs**
- **Cause**: A MongoDB database was left publicly accessible on the internet without authentication (exposure due to misconfiguration — not an external intrusion or broken encryption)
- **Discovery and response**: A Cybernews researcher discovered the exposure on 2025-11-11. IDMerit closed the database the next day. However, public disclosure came about 99 days later on 2026-02-18, and the gap between discovery and disclosure itself became a regulatory issue
- **Abuse risk**: Leaked identity-verification data becomes material for impersonation, credit fraud, SIM swapping (phone-number takeover), and targeted phishing. KYC data includes identity attributes that "cannot be re-issued once leaked," so the impact is long-lasting
- **Context**: The structure in which a vendor responsible for identity verification aggregates and retains, in vast quantities and across borders, the raw attributes used for that verification is increasing alongside the spread of regulation (KYC / AML mandates, age-verification mandates, etc.)
- **Core**: Because proving that someone was "verified" was not separated from hoarding the raw attributes used for that verification, the identity-verification provider itself became the aggregation point for raw data and thus the breach surface.

---

## 2. Timeline

- 2025-11-11: A Cybernews researcher discovers that IDMerit's MongoDB database is publicly accessible without authentication
- 2025-11-12: IDMerit closes the database (cutting off the exposure)
- 2025-11 to 2026-02: The gap between discovery and public disclosure (about 99 days) continues
- 2026-02-18: The exposure is publicly disclosed. The scale — about a billion records, 26 countries, including KYC / AML verification logs — is reported

> Note: The facts in this Brief are based on reporting by the discoverer, Cybernews, and established media. Record counts and the per-country breakdown rely on reporting; we avoid assertion and make the sources explicit. This Brief does not condemn the operator's motives but focuses on the structure in which identity proof is not separated from the storage of raw attributes.

---

## 3. Event Chain

1. **Mass aggregation of attributes**: For identity verification, IDMerit aggregated and retained raw attributes such as national ID numbers, dates of birth, faces, and communication metadata, on the scale of about a billion records across 26 countries
2. **No separation of proof and storage**: To produce the result that "this person is verified" (the KYC / AML verification log), the practice was to continue retaining the raw attributes themselves used in verification; the issuance of the proof was not separated from the storage of the originals
3. **Exposure of the aggregation point**: The MongoDB database was left publicly accessible without authentication, and the aggregation point became, as is, an externally accessible breach surface
4. **Leakage of irreversible attributes**: Identity attributes that cannot be re-issued (national ID numbers, dates of birth, etc.) were exposed, directly tied to long-term risks such as impersonation and SIM swapping
5. **Delayed disclosure**: After discovery and closure, there was a gap of about 99 days before public disclosure, delaying the point at which affected individuals could begin to respond

---

## 4. Structural analysis

This incident belongs to the `kyc-aml-disclosure` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive lies in the point that **the function of "proving" the attribute of identity is not separated from the practice of "retaining" the raw attributes used for that proof.** To produce the result that "this person is verified," the verifier became a vast aggregation point for raw data including national ID numbers and faces, and that aggregation point became the breach surface as is, due to misconfiguration. Secondary tagging notes `attribute-proof-bypass` for the point that the retained raw attributes leaked outside the individual's control, and `data-provenance` for the point that the attributes' provenance and retention period are not verified.

It is in the same lineage as Brief 013 (Coinbase's insider-routed KYC data leak) and Brief 052 (70,000 IDs leaked from Discord's age-verification vendor 5CA), and this incident is the large-scale, international version of those. Brief 052 was a case where "to verify the single attribute of age, a third party stored the raw IDs wholesale," and this incident is isomorphic in primitive in that "to verify identity, raw attributes were stored en masse in an irreproducible form." It is adjacent to Brief 034 (eKYC liveness bypass) on the structure in which identity attributes are accepted and retained as raw originals. Furthermore, the gap of about 99 days from discovery and closure to public disclosure connects to Brief 006 (a Google API key that remained valid for 23 minutes after deletion — a lag in revocation and remediation) on the point that **the timing of remediation leaves an attackable window.**

This incident is not an attack incident but a trust-layer risk event in the infrastructure that handles regulatory attributes. As KYC / AML and age-verification mandates spread worldwide, it is structurally unavoidable that the vendor responsible for verification becomes an aggregation point for raw attributes. Unless there is a design that can prove only "this attribute is verified" without retaining or disclosing the originals, the very fulfillment of the verification obligation creates new leakage risk.

---

## 5. The detection–proof gap

Cybernews's discovery of the exposure, IDMerit's closure the next day, and the reporting on the scope of impact are essential for grasping and cutting off the harm, and this Brief does not deny that role. The exposure was discovered and cut off.

That said, discovery and closure of the exposure do not change the design itself of "how much raw attribute data the verifier retains and aggregates in order to prove identity." In this incident, to produce the KYC / AML verification log showing that someone had been verified, raw attributes were retained en masse, and that aggregation point became the breach surface. What was missing was the design premise of "is this attribute proven without retaining or disclosing the originals?" — and this is a separate class of problem from detecting and closing the exposure after the fact. If discovery comes after the exposure, the possibility that data was accessed in the interim cannot be undone by closure. As material for establishing in regulatory reporting and audit that "we fulfilled the identity-verification obligation without unnecessarily retaining individuals' attributes," the mere fact that verification logs exist is not evidence that the originals were handled minimally — rather, the verification logs themselves had leaked.

Pre-execution attestation and selective disclosure design identity verification separately from the retention and disclosure of raw attributes. The verifier hands over only conclusions such as "this person is verified," "age meets the requirement," and "not on a sanctions list" as independently verifiable proofs, without retaining or aggregating national ID numbers or faces themselves. By separating the proof of the attribute from the storage of the originals (the breach surface), the verification obligation is fulfilled without creating an aggregation point. Detection of the exposure and attribute proof that holds no originals are in a **complementary**, not substitutive, relationship; only when the two overlap can identity verification be placed with confidence on cross-border operations.

For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for the design that proves only attributes without sending the originals, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **IDMerit**: Closed the database upon being notified of the exposure. Public disclosure came about 99 days after discovery
- **Cybernews**: Discovered and reported the exposure, making visible the scale (about a billion records, 26 countries, KYC / AML verification logs) and the gap from discovery to disclosure
- **Regulatory issue**: Leakage of identity-verification data is directly tied to impersonation, credit fraud, SIM swapping, and the like, and because it includes attributes that cannot be re-issued, the impact is prolonged. The delay from discovery to disclosure became an issue from the standpoint of various countries' data-protection and notification obligations
- **Cross-industry argument**: As KYC / AML and age-verification mandates spread, the structure in which the vendor responsible for verification becomes an aggregation point for raw attributes is being questioned. Design that separates the proof of the attribute from the storage of the originals, in which the verifier does not retain the originals (selective disclosure, minimization), is advancing in discussion as a requirement that reconciles the verification obligation with privacy

How "to fulfill the identity-verification obligation without unnecessarily retaining and aggregating raw attributes" is expected to advance in discussion as an essential requirement of KYC / AML infrastructure design, prompted by this incident.

---

## 7. Lemma's analysis

Against the detection–proof gap exposed by this incident (identity proof not separated from the storage of raw attributes, with the verifier becoming the breach surface), Lemma proposes a design that handles attribute verification separately from the retention and disclosure of the originals.

- **Attribute proof by selective disclosure**: Hand over only conclusions such as "this person is verified," "age meets the requirement," and "not on a sanctions list" as independently verifiable proofs, without disclosing or retaining national ID numbers or faces themselves
- **Verification that does not aggregate originals**: Eliminate the premise that the verifier becomes an aggregation point for raw attributes, and let the proof of the attribute stand on a separate track from the storage of raw data
- **Verification of attribute provenance and retention**: Make verifiable what provenance the attribute has and over what period and scope it is retained, curbing unnecessary retention and cross-border aggregation at the design stage
- **Verifiability of remediation**: Leave verifiable evidence that revocation and deletion took effect for certain, so that the gap from discovery to remediation does not remain as an attackable window

Against the design philosophy of the regulatory-attribute-proof category that "proof of an attribute ≠ retention of the raw attribute," this incident is a case where its anticipated failure mode materialized as an exposure on the scale of about a billion records. Detection (after-the-fact discovery and closure) works to cut off harm, and attribute proof that holds no originals works to reconcile the identity-verification obligation with privacy — each in a complementary way.

For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Seal](https://lemma.frame00.com/seal/).

---

## 8. Sources

- **Cybernews (discoverer)**: "IDMerit data breach: 1 billion records of personal data exposed in KYC data leak" (2026-02-18) — <https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **Panda Security**: "Over one billion customer records belonging to IDMerit users left unprotected online" (2026-02) — <https://www.pandasecurity.com/en/mediacenter/customer-records-idmerit-unprotected/>
- **Fincrime Central**: "IDMerit data breach: 1 billion records of personal data exposed in KYC data leak" (2026-02) — <https://fincrimecentral.com/idmerit-kyc-data-one-billion-records-exposed/>
- **Reference implementation (GitHub)**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
