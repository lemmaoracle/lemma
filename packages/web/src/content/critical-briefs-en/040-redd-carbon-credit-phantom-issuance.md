---
brief_no: 40
title: "Operation Greenwashing: carbon credits were issued and sold from forests allegedly not conserved (Brazil Federal Police, Mongabay)"
title_en: "Operation Greenwashing: carbon credits were issued and sold from forests allegedly not conserved (Brazil Federal Police, Mongabay)"
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
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "ブラジル連邦警察が Operation Greenwashing で 31 名を起訴。保全の実態がないとされる森林からクレジットが発行・販売されていた"
og_lead_en: "Brazil's Federal Police charged 31 people in Operation Greenwashing over credits issued and sold from forests allegedly not conserved"
og_kicker_ja: "環境属性の申告 · カーボンクレジット"
og_kicker_en: "ENVIRONMENTAL CLAIMS · CARBON CREDITS"
og_headline_ja: "保全の実態のない森から\nクレジットが出たと\n連邦警察が主張。\n<accent>31 名を起訴</accent>"
og_headline_en: "Credits from forests\nwith no conservation,\nBrazil police allege.\n<accent>31 people charged.</accent>"
key_figures:
  - value: "31"
    unit: "people"
    label: "Charged by the Federal Police in Operation Greenwashing on suspicion of fraud, land-grabbing and related crimes (2025-10)"
    tone: "alert"
  - value: "140,000+"
    unit: "ha"
    label: "Combined area of the two REDD+ projects concerned (Unitor and Fortaleza Ituxi)"
  - value: "2024-05 → 2025-10"
    label: "From Mongabay's investigative report to the Federal Police charges"
glossary:
  - term: "REDD+"
    desc: "A scheme that counts emissions avoided by reducing deforestation and forest degradation as credits."
  - term: "Carbon credit (voluntary carbon market)"
    desc: "Avoided or reduced emissions turned into a tradable unit. Companies use them to offset their own emissions."
  - term: "Baseline"
    desc: "The expected logging and emissions had the area not been conserved. Avoided emissions are counted from it."
  - term: "MRV"
    desc: "Measurement, reporting and verification. Includes satellite and remote-sensing monitoring of an area after issuance."
insight:
  slug: "self-declared-environmental-attribute"
  label: "Environmental attributes issued as declared"
  quote: "Without a check against source data held outside whoever made the declaration, declared conservation areas and avoided emissions are accepted as declared before issuance."
industries: ["finance", "public-sector"]
operations: ["approval"]
attack_method: "privilege-abuse"
controls:
  - slug: "ownership-check"
    item: "Check declared conservation area and logging volume against source data such as satellite imagery"
impact: "31 people charged by the Federal Police; the two projects cover more than 140,000 ha"
takeaway: "Declarations of conservation area and logging volume were accepted on the basis of land and environmental registrations, which the Federal Police said were falsified with the involvement of public servants."
self_check: "Before you accept a declaration of conservation or emission reductions, is there a mechanism that checks it against source data held outside the declarant (such as satellite observation)?"
countries: ["br"]
---

## 1. Summary

According to the Federal Police, credits were generated for these areas while timber illegally logged elsewhere was laundered as if it had a "legitimate origin." Land-grabbing, registering federally owned land and protected areas as one's own, ran in parallel, and the police say public servants at the land-reform agency, registry offices and the state environmental agency made the fraudulent registrations possible. These are the investigators' allegations and have not been established in court. The mismatch between declarations and reality became visible from outside, through investigative reporting, satellite-imagery analysis and the police investigation, after the credits had been sold. <strong>Without a check against source data held outside whoever made the declaration, declared conservation areas and avoided emissions are accepted as declared before issuance.</strong>

## 2. What got through

- **What got through**: According to the Federal Police, two things. First, the issuance and sale of credits based on declarations of conservation area, logging volume and similar data. Second, registrations claiming federally owned land and protected areas as one's own. The credits had been sold to Nestlé, Toshiba, Spotify, Boeing, PwC and others.
- **What reached the receiving side**: In general, credit issuance receives land registration, conservation area, baseline and logging volume as declared data, part of which is accepted on the basis of records held by the land-reform agency, registry offices and the state environmental agency. If those underlying records are themselves manipulated, the records available to the receiving side do not contradict one another.
- **Detection route**: Investigative reporting by Mongabay journalist Fernanda Wenzel (2024-05) and the satellite-imagery analysis CCCA conducted on its commission flagged a mismatch between declared logging volume and satellite estimates. The Federal Police then investigated. All of these acted after issuance and sale.
- **Not disclosed**: The sources reviewed give no confirmed figures for individual issuance lots, cancellations or buy-backs, and do not describe how the declarations were compared with which records during issuance. The charges are at the investigation stage; no one has been convicted.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that declared conservation area and logging volume, and the attribution of the area, are checked against source data held outside the declarant before credits are issued.

- **Who approves**: For issuance, the side that sets the methodology's requirements and decides to issue (the certification and registry arrangements). For source data, the side that produces satellite observations and the public registry that records land attribution. The basis for a declaration is not supplied by the operator making it.
- **Where it is checked**: Just before credits are issued, and just before a registration of the area's attribution is accepted as a basis. Declared values are compared with the values recorded by the source of the data and checked against the methodology's requirements. Anything that cannot be checked is not issued until it can be.
- **What is recorded**: For each issuance lot, which declaration was checked against which source data and which methodology requirements before issuance. Kept outside both the declarant and the issuer, in a form that cannot be rewritten afterwards. It is what can be consulted years later when someone asks whether the area was actually conserved at the time.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before credits are issued, declared conservation area, logging volume and the area's attribution against source data held outside the declarant, and keeping a record. Detection means noticing after issuance and sale, from reporting, satellite analysis and investigation. Dates are when the outlets and investigators made them public.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check declarations and the area's attribution against source data before issuance</div>
<div class="rx-zone gapz"><b>What police and reporting described</b><span>Declared logging volume did not match satellite estimates (CCCA)<br>Credit generation alongside timber-origin laundering and fraudulent land registration (Federal Police)</span></div>
<div class="rx-zone det"><b>Detection · worked after issuance and sale</b>Reporting and satellite analysis flagged the mismatch; the Federal Police investigated and charged</div>
<div class="rx-g g1"><div class="t">2024-05</div><b>Mongabay report, CCCA analysis</b></div>
<div class="rx-g g2"><div class="t">2024–2025</div><b>Federal Police investigate</b></div>
<div class="rx-g g3"><div class="t">2025-10</div><b>31 people charged</b></div>
<div class="rx-g g4"><div class="t">2025-11</div><b>Reported internationally</b></div>
</div>
</figure>

Detection made the mismatch between declarations and reality visible from outside, and moves the investigation and the identification of credits to cancel forward. It works separately from a check before issuance. Cases where a self-declared attribute led directly to disclosure or acceptance include [Brief 021](/critical/briefs/021-wirecard-balance-attestation/) (a balance attribute), [Brief 020](/critical/briefs/020-type-designation-conformity-fraud/) (a product's conformity attribute) and [Brief 019](/critical/briefs/019-construction-engineer-qualification-fraud/) (a person's qualification attribute).

## 4. What Lemma does

**Lemma builds the pre-execution check into the side that issues credits and the side that accepts an area's registration as a basis.** It does not detect fraud or judge whether a conservation methodology is sound; it checks, outside the declarant, whether declared values match the values recorded by the source of the data and meet methodology requirements set in advance, and keeps a record. It can also show only that the requirements are met, without releasing internal data such as coordinates or contracts.

### Industries and operations to watch

- **Industry · Finance**: Organizations that issue, broker or trade products based on environmental attributes, such as carbon credits.
- **Industry · Public sector**: Agencies holding records used as a basis for issuance, such as land attribution or environmental permits.
- **Operations · Approval & sign-off**: Work that decides, on the basis of an operator's declaration, whether to issue or to accept a registration.

### Current controls vs Lemma

In this case, all three columns are routes described by the Federal Police and reporting.

| Control | Issuance based on declared conservation area and logging volume | Registration of the area's attribution | Sale of issued credits |
| --- | --- | --- | --- |
| Tighter methodologies (baseline, additionality, double-counting, permanence) | Partial | Not relevant | Not relevant |
| After-the-fact monitoring by satellite and remote sensing (MRV) | Partial | Not relevant | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Partial |

Tighter methodologies change the rules for what is counted; they do not check, before each issuance, that declared values match the source data. Satellite monitoring can find mismatches, but its weight falls after issuance. Lemma compares declared conservation area and logging volume with the values recorded by the side that produces the satellite observations, before issuance. For the area's attribution, it can check consistency with the registry's record, but if the registry record was itself falsified, it goes through. For sales, it can check before selling or buying whether a pre-issuance check record exists, but whether a trade without one is stopped depends on the trading procedure.

Note: Lemma's check works only when it is built into the issuance and registration-acceptance steps, and the sources of the data (the side producing satellite observations, the registry) record values outside the declaring operator. If the way a baseline or additionality is set is itself wrong, wrong results go through too. Where public records were rewritten with the involvement of public servants, the check reaches only as far as source data from another origin can be compared. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent fraud or intrusions.

### Checklist

Three things to confirm for organizations that issue or accept registrations based on declared environmental attributes

- Can you check an area's attribution not only against one registration record but also against a record from another origin?
- Can you confirm afterwards, for each issuance lot, which source data and which methodology requirements the issuance decision was based on?
- Do you keep declarations and check records outside the declarant, in a form that cannot be rewritten afterwards?

## 5. Facts and timeline

- **Subject**: Two REDD+ projects in Lábrea, Amazonas state (Unitor and Fortaleza Ituxi), together more than 140,000 hectares.
- **Investigation**: In 2025-10, Brazil's Federal Police, as Operation Greenwashing, charged 31 people belonging to three interconnected groups on suspicion of fraud, land-grabbing and related crimes. It is described as the largest carbon-credit fraud investigated in the country to date.
- **Federal Police allegations**: While credits were generated for these areas, timber illegally logged elsewhere was laundered as if it had a "legitimate origin." Land-grabbing, falsely registering federally owned land and protected areas as one's own, ran in parallel.
- **Public agencies**: The Federal Police held that fraudulent registrations were made possible by the involvement of public servants at the land-reform agency (Incra), registry offices and the Amazonas state environmental agency (Ipaam).
- **What was declared**: The claim "the forest was conserved and emissions were avoided" was presented as credits based on declared data for land registration, conservation area and avoided emissions.
- **Trigger for detection**: Investigative reporting by Mongabay journalist Fernanda Wenzel (2024-05) and the satellite-imagery analysis CCCA conducted on its commission, which flagged a mismatch between declared logging volume and satellite estimates.
- **Buyers**: Credits had been sold to Nestlé, Toshiba, Spotify, Boeing, PwC and others. Ricardo Stoppe Júnior, described as one of the central figures, was among Brazil's largest individual credit sellers and had promoted the business model in public venues including COP28.

### Timeline

- **2024-05**: Mongabay reports that the two projects, Unitor and Fortaleza Ituxi, appear linked to the laundering of illegally logged timber. CCCA flags a mismatch with declared logging volume through satellite-imagery analysis.
- **2024–2025**: The Federal Police continues its investigation as Operation Greenwashing, examining the mismatch between declarations (land registration, conservation area, logging volume) and reality, and the involvement of public servants.
- **2025-10**: The Federal Police charges 31 people belonging to three interconnected groups on suspicion of fraud, land-grabbing and related crimes.
- **2025-11**: The charges are reported internationally. Incra and Ipaam state their cooperation with the investigation.

> The methods alleged, the involvement of public servants and the charges rest on the Federal Police's account as reported by Folha de S.Paulo and Mongabay. The charges are at the investigation stage; no one has been convicted. Confirmed figures for individual issuance lots, cancellations and buy-backs depend on the progress of litigation and investigation and are not asserted here. This Brief does not attribute fault to the companies that bought the credits. What was not disclosed does not mean controls were absent.

### After disclosure

- **Investigation**: The Federal Police charged 31 people as an organized-crime case. Incra and Ipaam stated their cooperation with the investigation. The alleged misuse of public registration (land and environment) became a focal point that questions trust in public records.
- **Market and certification**: In the voluntary carbon market, methodologies are being tightened around baseline-setting, additionality, double-counting and permanence, alongside strengthened after-the-fact monitoring (MRV) via satellite and remote sensing. These center on post-issuance verification.
- **Disclosure expectations**: In corporate emissions disclosure, demand is growing to evidence the basis of credits used as offsets in a form that can be checked from outside, rather than as operator self-declaration.

## 6. Sources

- **Mongabay (investigative reporting, primary)**: Fernanda Wenzel, “Top brands buy Amazon carbon credits from suspected timber laundering scam” (2024-05) — <https://news.mongabay.com/2024/05/top-brands-buy-amazon-carbon-credits-from-suspected-timber-laundering-scam/>
- **Mongabay (follow-up)**: “Brazil charges 31 people in major carbon credit fraud investigation” (2025-11-04; Operation Greenwashing, Unitor / Fortaleza Ituxi, 140,000+ ha, involvement of Incra / Ipaam) — <https://news.mongabay.com/short-article/2025/11/brazil-charges-31-people-in-major-carbon-credit-fraud-investigation/>
- **Folha de S.Paulo (primary reporting)**: “PF aponta organização criminosa e indicia 31 em maior fraude com créditos de carbono já investigada” (2025-10) — <https://www1.folha.uol.com.br/ambiente/2025/10/pf-aponta-organizacao-criminosa-e-indicia-31-em-maior-fraude-com-creditos-de-carbono-ja-investigada.shtml>
- **Business & Human Rights Resource Centre (aggregated)**: “Brazil: Federal Police indicted 31 suspects for fraud and land-grabbing in massive criminal carbon credit scheme in the Amazon” — <https://www.business-humanrights.org/en/latest-news/brazil-federal-police-indicted-31-suspects-for-fraud-and-land-grabbing-in-massive-criminal-carbon-credit-scheme-in-the-amazon/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
