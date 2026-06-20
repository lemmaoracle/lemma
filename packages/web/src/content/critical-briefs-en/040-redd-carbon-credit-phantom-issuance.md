---
brief_no: 40
title: "保全の実態がない森林から、カーボンクレジットが発行・販売されていた — 環境属性の裏づけデータが、発行時に独立検証されない構造（ブラジル Operation Greenwashing）"
title_en: "Phantom Carbon Credits — When an Environmental Attribute Is Issued Without Independent Verification of Its Underlying Data (Operation Greenwashing)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2025-10-14
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["021-wirecard-balance-attestation", "020-type-designation-conformity-fraud", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "保全の実態がない森林からクレジットが発行・販売 — Operation Greenwashing"
og_lead_en: "Carbon credits from forests with no real conservation — Operation Greenwashing"
gap_detected: "Investigative reporting, independent satellite imagery analysis, and federal police investigation made the gap between the claims and reality externally visible."
gap_missing: "At credit issuance time there was no layer to confirm whether the claimed conservation area and deforestation volumes reflected the true state of the source data, so operators' self-declarations were accepted as is."
gap_fix: "Before issuing or trading credits, independently verify with Lemma that this area is actually conserved and meets the methodology's requirements, and prevent it up front."
---

## TL;DR

Brazil's Federal Police charged 31 people as "Operation Greenwashing," over carbon credits generated from land with no real conservation and sold to majors including Nestlé and Boeing. Reporting, satellite analysis, and the police probe surfaced the divergence only after the credits had flowed into corporate disclosure — after-the-fact detection. What is structurally missing is a layer that verifies, at issuance, whether the declared conservation area and logging volume reflect the true source data; self-declaration was accepted as is. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Indictment**: 2025-10, Brazil's Federal Police, as Operation Greenwashing, indicted 31 people on suspicion of fraud and land-grabbing. It is described as the largest carbon-credit fraud investigated in the country to date
- **Target projects**: two REDD+ projects in Lábrea, Amazonas state (Unitor and Fortaleza Ituxi), together more than 140,000 hectares
- **How the attribute was presented**: the claim "the forest was conserved and emissions were avoided" was presented as credits based on declared data for land registration, conservation area, and avoided emissions
- **Core failure**: according to the Federal Police, while credits were generated for these areas, timber illegally logged elsewhere was laundered as if it had a "legitimate origin." Land-grabbing — registering federally owned land and protected areas as one's own — ran in parallel
- **Trigger for detection**: investigative reporting by Mongabay journalist Fernanda Wenzel (2024-05) and the satellite-imagery analysis CCCA conducted on its commission. The mismatch between declared logging volume and satellite estimates was flagged
- **Where the credits went**: credits had been sold to Nestlé, Toshiba, Spotify, Boeing, PwC, and others. One central figure, Ricardo Stoppe Júnior, was among Brazil's largest individual credit sellers and had promoted the business model in public venues including COP28
- **Complicit structure**: the Federal Police held that fraudulent registrations were made possible by the involvement of public servants at the land-reform agency (Incra), registry offices, and the Amazonas state environmental agency (Ipaam)

---

## 2. Timeline

- 2024-05: Mongabay reports that the two projects, Unitor and Fortaleza Ituxi, appear linked to the laundering of illegally logged timber. CCCA flags a mismatch with declared logging volume through satellite-imagery analysis
- 2024–2025: the Federal Police continues its investigation as Operation Greenwashing, examining the divergence between declarations (land registration, conservation area, logging volume) and reality, and the involvement of public servants
- 2025-10: the Federal Police indicts 31 people belonging to three interconnected groups on suspicion of fraud, land-grabbing, and related crimes
- 2025-11: the indictment is reported internationally. Incra and Ipaam state their cooperation with the investigation

> Note: confirmed figures for individual issuance lots, cancellations, and buy-backs depend on the progress of litigation and investigation and are not asserted here.

---

## 3. From Registration to Market Circulation

This event stems from an issuance structure in which an environmental attribute (forest conservation, carbon sequestration) is never independently verified. The failure propagates to the voluntary carbon market and corporate emissions disclosure as follows.

1. **Attribute claim**: the claim "we conserved the forest in a given area and avoided the emissions that would otherwise have occurred" is presented as declared data for land registration, conservation area, reference scenario (baseline), and logging volume
2. **Reliance on registration data**: part of the declared data is accepted on the basis of records held by the land-reform agency, registry offices, and the state environmental agency. Where those records themselves were manipulated complicitly, the divergence between declaration and source data is not independently re-verified at the point of issuance
3. **Tokenization and market entry**: credits are issued on the basis of the declarations and traded on the voluntary carbon market. Purchasing companies incorporate these credits into their disclosures as emissions offsets
4. **Delayed discovery**: the divergence between declaration and reality (the actual logging and land attribution visible from satellite) is not made visible in the ordinary issuance and audit cycle. It was first confirmed from outside only through external investigative reporting and independent satellite analysis
5. **Impact realization**: once fraud is confirmed, beyond cancellation of credits and criminal prosecution, retrospective re-verification of the offset claim is required for every company that purchased the credits and used them in disclosure

---

## 4. Structural Argument

This incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **an environmental-attribute claim — "a given forest was conserved and carbon was sequestered" — is accepted as credits while severed from independent verification of the provenance and authenticity of its underlying data.** Attributes such as "we conserved" and "we avoided emissions" are presented in the form of declared data on land registration, conservation area, and logging volume, but the authenticity of the source data (the actual forest state observed by satellite, the true attribution of the land) is not connected to a verification layer at the point of issuance. As long as the declared data is the trust terminus, the divergence between asserted attribute and reality cannot be made visible without that layer. `data-provenance` (the provenance of the source data for conservation area and logging volume) is noted as a secondary category.

The targets differ from Brief 021 (a financial attribute = asset existence), Brief 020 (a product's conformity attribute), and Brief 019 (a person's qualification attribute), but the shared primitive is the same: **an attribute assertion is decoupled from the layer that would verify it.** This case shows how attribute-proof bypass propagates simultaneously across "both the regulatory and the market side," in that the assertion complicitly co-opted public registration (land and environment) and flowed all the way into the voluntary carbon market and corporate emissions disclosure.

---

## 5. The detection–proof gap

Here, the detection chain — investigative reporting (Mongabay), independent satellite-imagery analysis (CCCA), and the Federal Police investigation — worked, and the divergence between asserted attribute and reality was ultimately made visible from outside. This is a textbook detection success, and this Brief does not dispute the role of the detection layer. Detection is indispensable for raising doubt, driving the investigation, and scoping remediation after discovery (identifying which credits to cancel).

Detection, however, cannot change whether "the declared conservation area and logging volume reflect the true state of the source data" at the moment credits are issued and purchased. Both investigative reporting and satellite analysis are after-the-fact chains that activated only after the credits had been issued and incorporated into major corporations' disclosures. Declaration-based issuance does not, on its own, serve as material to independently prove "the area was actually conserved at the time" in a company's emissions disclosure. This is a gap in a structurally independent layer, beyond detection's reach.

As things stand, across the operating model for the voluntary carbon market, independent verification of environmental attributes depends on trust in the registration data declared by operators and is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of attribute proof into the issuance / trading path. It is a complement to detection, not a substitute; together the two establish the trust boundary for credits.

---

## 6. Response and Industry Response

- **Investigation and regulation**: the Federal Police indicted 31 people as an organized-crime case. Incra and Ipaam stated their cooperation with the investigation. The complicit co-opting of public registration (land and environment) became a focal point that questions trust in public records themselves
- **Market and certification**: in the voluntary carbon market, methodologies are being tightened around baseline-setting, additionality, double-counting, and permanence, alongside strengthened after-the-fact monitoring (MRV) via satellite and remote sensing. These, however, center on post-issuance verification; the layer that independently verifies the authenticity of source data at the point of issuance remains thin
- **Shift in regulatory center of gravity**: the regulatory center of gravity is shifting from data disclosure to compliance proof. In corporate emissions disclosure (and related disclosure regulation), demand is growing to evidence the basis of credits used as offsets in an independently verifiable form, rather than as operator self-declaration

The absence of a layer that independently verifies the basis of environmental attributes at the point of issuance and trading remains not as one operator's problem but as an operational challenge spanning both the voluntary carbon market and the companies that incorporate it into disclosure.

---

## 7. Lemma's Analysis

For the gap exposed here — an environmental-attribute claim flowing straight to issuance, market, and disclosure while severed from independent verification of its underlying data's provenance — Lemma offers a design in which the basis of credits is committed at the point of issuance as independently verifiable cryptographic proofs, so that certification bodies, purchasing companies, and regulators can independently verify "this area is conserved in a way that meets the methodology's requirements" without the operator releasing its source data.

- **Issuer-signed attestations**: the origin of the source data (satellite-data providers, public registries) attests to observed values and attribution with an issuer signature. Rather than declarations forwarded by the operator, the proof is bound to the originator of the source data
- **Schema-bound proofs**: each proof is bound to the methodology / regulatory schema it satisfies (REDD+ methodology, additionality, baseline, disclosure standards), so certification bodies and regulators can verify directly against the schema
- **Selective disclosure**: only "the conservation area and avoided emissions meet the standard" is disclosed at minimum; coordinates, contracts, and operator-internal data never leave the operator
- **Original binding and validity**: bound to the satellite-observation and land-registration originals via docHash, proving existence and non-tampering. The trail to the source data at the time is fixed per issuance lot

A proof fixed at the point of issuance and trading then functions, years later when "was the area actually conserved at the time?" is asked, as an independently verifiable trail that discloses no source data. Detection (after-the-fact satellite monitoring, investigative journalism) serves remediation after discovery; pre-execution attestation (attribute verification at issuance) serves independent verification of environmental attributes — complementary layers.

---

## 8. Sources

- **Mongabay (investigative reporting, primary)**: Fernanda Wenzel, “Top brands buy Amazon carbon credits from suspected timber laundering scam” (2024-05) — <https://news.mongabay.com/2024/05/top-brands-buy-amazon-carbon-credits-from-suspected-timber-laundering-scam/>
- **Mongabay (follow-up)**: “Brazil charges 31 people in major carbon credit fraud investigation” (2025-11-04; Operation Greenwashing, Unitor / Fortaleza Ituxi, 140,000+ ha, involvement of Incra / Ipaam) — <https://news.mongabay.com/short-article/2025/11/brazil-charges-31-people-in-major-carbon-credit-fraud-investigation/>
- **Folha de S.Paulo (primary reporting)**: “PF aponta organização criminosa e indicia 31 em maior fraude com créditos de carbono já investigada” (2025-10) — <https://www1.folha.uol.com.br/ambiente/2025/10/pf-aponta-organizacao-criminosa-e-indicia-31-em-maior-fraude-com-creditos-de-carbono-ja-investigada.shtml>
- **Business & Human Rights Resource Centre (aggregated)**: “Brazil: Federal Police indicted 31 suspects for fraud and land-grabbing in massive criminal carbon credit scheme in the Amazon” — <https://www.business-humanrights.org/en/latest-news/brazil-federal-police-indicted-31-suspects-for-fraud-and-land-grabbing-in-massive-criminal-carbon-credit-scheme-in-the-amazon/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
