---
brief_no: 65
title: "「破砕した」という前提のまま、患者 18 万人分の HDD が中古市場に流れた（北海道の国立病院） — 機微媒体の廃棄が、独立検証可能な破壊証跡として固定されない構造（NHO 北海道医療センター・北海道がんセンター）"
title_en: "Assumed Shredded, Sold Online — 180,000+ Patients' Drives Slipped Through (NHO Hokkaido Hospitals)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-06-08
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["035-boeing-787-inspection-records", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "「破砕したはず」のHDDが中古市場に — 患者18万人分流出（北海道の国立病院）"
og_lead_en: "Drives assumed shredded resurfaced online — 180,000+ patients (NHO Hokkaido)"
---

## TL;DR

Hand old hard drives to a disposal vendor "on the assumption they'll be shredded" — many organizations do it routinely. But if no one independently confirms the shredding, drives still full of data can end up on the secondhand market. In June 2026, the National Hospital Organization's (NHO) Hokkaido Medical Center and Hokkaido Cancer Center disclosed that HDDs containing electronic medical records had circulated externally. In March 2024 they had entrusted destruction of roughly 750 drives to a waste-disposal vendor in Ishikari (Reprowork), which appears to have let drives go without confirming they were shredded (the vendor explained that pre- and post-shredding drives were kept in same-shaped containers and the work area was poorly separated). It came to light when someone who won an HDD at online auction in June 2025 reported that it held the hospital's data. The 33 drives recovered (31 from the Medical Center, 2 from the Cancer Center) held personal data — names, addresses, medical conditions — of at least **186,900 patients and staff** (potentially up to 510,000). NHO filed a criminal complaint with Hokkaido Police for suspected violation of the Waste Management Act; no misuse has been confirmed. We analyze this through Pillar 04 (Regulatory Attribute Proof) as a structure in which **the "destroyed (disposal complete)" attribute of sensitive media is never fixed as an independently verifiable trail** — the entruster had no way to independently verify the *claim* that the drives were shredded and could only trust the claimant. This Brief does not censure any party. Sibling of Brief 035; connects to 013, 006, and 021.

---

## 1. Incident overview

- **Subject**: NHO Hokkaido Medical Center and Hokkaido Cancer Center (Sapporo). An incident over the disposal of HDDs that had stored electronic medical records and the like.
- **Entrustment**: In March 2024, alongside an electronic-medical-record system upgrade at the two hospitals, NHO entrusted destruction and disposal of roughly 750 HDDs containing personal data to "Reprowork," a waste-disposal vendor in Ishikari.
- **What happened**: The vendor appears to have let the drives go without confirming they had been shredded. It explained to NHO that "pre- and post-shredding HDDs were managed in same-shaped containers, and the separation of the work area was insufficient." As a result, drives full of data circulated externally (online auctions, etc.).
- **How it came to light**: In June 2025, a member of the public who had won an HDD at online auction noticed it contained Hokkaido Medical Center's data and reported it.
- **Scale**: 33 HDDs were recovered (31 from the Medical Center, 2 from the Cancer Center). The personal data — names, addresses, medical conditions — covered at least 186,900 patients and staff collected up to 2024, with potential impact up to 510,000. During recovery, a separate leak of Hokkaido prefectural government HDDs also came to light.
- **Response**: On June 8, 2026, NHO filed a criminal complaint against the vendor with Hokkaido Police for suspected violation of the Waste Management Act. No misuse of the data has been confirmed.
- **The core**: Having entrusted disposal, and that the drives were contractually due to be destroyed, **does not mean it was independently verified that they were actually shredded.** The destruction attribute depended on the vendor's self-report and a presumption, and — never independently confirmed from outside — the data-laden drives converted into a circulation surface.

---

## 2. Timeline

- 2024-03: Alongside an electronic-medical-record upgrade at the two hospitals, NHO entrusts destruction/disposal of roughly 750 HDDs containing personal data to the Ishikari waste-disposal vendor "Reprowork." The personal data was collected up to 2024.
- 2025-06: A member of the public who won an HDD at online auction reports that it appears to hold Hokkaido Medical Center's data — the trigger for discovery.
- 2026-06-08: NHO discloses the incident, identifying 33 recovered drives and at least 186,900 affected people (up to 510,000), and files a criminal complaint against the vendor with Hokkaido Police for suspected Waste Management Act violation. No misuse confirmed.

> Note: The affected counts (≈186,900 / up to 510,000), the number of drives (33), the vendor (Reprowork), the sequence, and the criminal complaint are based on NHO's disclosure and reporting (HTB, Hokkaido Shimbun, UHB, Yomiuri, Kyodo; in English, DataBreaches.Net / The Star / Japan Today / Xinhua). This Brief does not aim to assign degrees of fault; it addresses the absence of independent verification of destruction.

---

## 3. The chain: an "assumed destroyed" premise converts, unverified, into circulation

This incident stems from the destruction attribute of sensitive media not being fixed as an independently verifiable trail at the moment of disposal. The path is as follows.

1. **Entrusting disposal**: The hospital entrusts destruction/disposal of the HDDs to a vendor. They are handed over as items contractually due to be destroyed.
2. **Destruction as a premise**: The premise "we entrusted it, so it was destroyed" is set. Whether it was actually shredded depends on the vendor's work and self-report; the entruster has no mechanism to verify it independently.
3. **Chained handoffs**: The vendor lets the drives go without confirming shredding (pre- and post-shred media mixed in the same containers, with insufficient separation, by its own account). At each link of the chain, no independent "destroyed" trail is carried forward.
4. **Conversion into a circulation surface**: Drives full of data circulate on the secondhand market (online auctions, etc.). The media were not destroyed, and the stored electronic medical records and the like went outside in a readable state.
5. **After-the-fact discovery**: A buyer's report brings it to light, and recovery, the criminal complaint, and scoping of the impact proceed. This is an after-the-fact chain that acts once the media have circulated.

---

## 4. Structural analysis

This incident belongs to the `attribute-proof-bypass` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that **the "destroyed (disposal complete)" attribute of sensitive media is not fixed as an independently verifiable trail at the moment of disposal, and depends on the vendor's work and self-report.** We note `data-provenance` (the provenance of the media and data through the disposal chain) as a secondary category. The existence of a disposal contract or a destruction certificate is not independent proof that the drives "were actually shredded." Trust is placed not in the claim "we shredded it" but in the claimant, with no means to verify the claim independently. A paper destruction certificate is no substitute, since it can be issued even when nothing was shredded — the absence of "trust in the claim, not the claimant."

This incident is the same shape as Brief 035 (on the Boeing 787, inspections were recorded as "complete" but had not been performed). Where 035 is "the existence of a record ≠ proof of performance," this is "entrusting disposal / the premise of destruction ≠ the act of shredding" — two cross-sections of the same primitive. In both, **the record or premise of a fact (an inspection performed / media destroyed) is mistaken for genuine independent verification of that fact.** It connects to Brief 013 (regulation-mandated storage of raw personal data turned into a leak surface via an insider) in that highly sensitive personal data turns into a leak surface somewhere in its lifecycle without independent verification. It connects to Brief 006 (credential revocation not independently verified, valid even after deletion) through the primitive that "the end of the lifecycle (revocation / destruction) is not independently verified." It is the same shape as Brief 021 (the existence of a balance-confirmation certificate mistaken for independent verification of the assets' existence) in the gap between a certificate/premise and independent verification.

What this incident foregrounds is the layer of **the end of the data lifecycle.** Organizations focus on controlling collection, storage, and access, while independent verification of "it was destroyed" tends to be left to trust in the vendor and a paper certificate. When destruction is not independently verified, the sensitive information that was supposed to be protected converts into a circulation surface at the very end of the lifecycle — even when no one attacked it. This absence of end-of-lifecycle verification was exposed in the most sensitive data of all: medical information.

---

## 5. The gap between detection and proof

The buyer's report, recovery, the criminal complaint, and scoping of the impact are indispensable for grasping and deterring the damage, and this Brief does not negate that role. Response after discovery and root-cause analysis are an important check on similar incidents.

At the same time, detection provides no material to independently establish — **at the moment of disposal** — whether the media just entrusted were actually destroyed. A disposal contract and a destruction certificate record the premise that destruction took place, but do not independently underwrite the act of shredding itself. Here, the absence of destruction was learned only after the data-laden drives surfaced on the market and a buyer reported it — and disclosure took about a year after that report. What was missing is a mechanism to fix, at the moment of disposal, an independently verifiable trail that "this medium was indeed destroyed," and to carry it forward through each link of the disposal chain — a chain separate from after-the-fact discovery and the complaint. Once media have circulated, neither the absence of destruction nor the provenance of which medium leaked, when, and where can be fixed retroactively.

Pre-execution attestation flips the disposal of sensitive media from "trust the vendor" to "bind the fact of destruction to an independently verifiable trail at the moment of disposal." Fix each medium's destruction as a tamper-resistant trail (proof-of-destruction) tied to its time, place, and target, and make it verifiable at each handoff in the disposal chain (hospital → disposal vendor → recycler), and the circulation of a medium lacking a "destroyed" trail can be detected before the handoff. Detecting the absence of destruction (the detection-style "did it surface on the market") and proving destruction ("can this medium be independently verified to have been destroyed") are not substitutes but **complements** (for verifying provenance independently at the moment of the act, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the detection-and-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **NHO / the two hospitals**: Disclosed the incident and scoped the impact (33 recovered drives, ≈186,900 people, up to 510,000). Filed a criminal complaint against the vendor with Hokkaido Police for suspected Waste Management Act violation. No misuse confirmed so far.
- **Separating "the claim" from "the claimant"**: The essence is that the entruster had no means to independently verify the claim "we shredded it" — whether destruction actually happened came down to trusting the vendor (the claimant). What is needed is not trust in the claimant but a trail that verifies the claim itself.
- **The limits of paper certificates**: Data-destruction certificates exist in practice, but this incident shows that "a certificate can be issued even when nothing was shredded." A paper certificate does not independently underwrite the fact of shredding and does not withstand forgery or hollowing-out. What is needed is a destruction trail as an unforgeable cryptographic proof.
- **Insourcing the shredder is not the point**: A move toward operating shredders in-house as a preventive measure is understandable, but hospitals should focus on their core work (care); taking on shredding operations is beside the point. With an unforgeable proof of destruction, the certainty of destruction can be guaranteed while keeping the work outsourced.
- **A whole-lifecycle issue**: Medical data is highly sensitive with a long store→use→dispose lifecycle. This incident is at the "disposal" stage, but "no unauthorized access during storage" and "no tampering in transit" share the same structure, and demand for independently verifiable provenance at each stage is large.
- **Toward prevention as standard equipment**: This time a buyer's report enabled recovery, but there is no guarantee of recovery next time. The direction is to equip "a verifiable proof that destruction occurred" preventively as standard, rather than relying on after-the-fact response — consistent with regulation's center of gravity shifting from "submitting records" to "independently verifiable proof."

The absence of a layer that fixes the destruction of sensitive media as an independently verifiable trail at the moment of disposal is not a problem of a specific hospital or vendor; it remains a challenge common to every organization that holds sensitive information and outsources its disposal.

---

## 7. Lemma's analysis

Against the gap this incident exposed (the destruction attribute of sensitive media is not independently verified at the moment of disposal), Lemma proposes a design that fixes the fact of disposal — the end of the lifecycle — as an independently verifiable cryptographic proof at the moment of the act.

- **Provenance binding of a destruction trail (proof-of-destruction)**: Bind each medium's destruction, via a docHash, to its time and target, making "this medium was indeed destroyed" independently verifiable as an **unforgeable cryptographic proof.** Leave a trail tied to the fact of destruction itself — not a disposal contract or a paper certificate (issuable without shredding). This guarantees the certainty of destruction while keeping the work outsourced, without a hospital insourcing a shredder.
- **Chain-of-custody verification**: At each handoff in the disposal chain (entruster → disposal vendor → recycler), make the presence of a destruction trail verifiable, and screen out the circulation of a medium lacking a "destroyed" trail before the handoff.
- **Pre-execution attestation of the attribute**: Present the attribute "this medium has been destroyed" not as trust in the claimant but as an independently verifiable trail (verification of the claim itself), binding disposal completion to a verification condition.
- **Extension to the whole lifecycle**: The same independent-verification design applies not only to disposal but to storage (no unauthorized access) and transit (no tampering). The more sensitive and long-retained the medical data, the greater the value of provenance proof at each stage.
- **Selective disclosure**: Without exposing the contents of the stored data, disclose only the minimum — that "this medium met the destruction verification condition" — reconciling independent verification with privacy protection.

In this way, a proof fixed at the moment of disposal functions as an independently verifiable trail of whether "this sensitive medium was indeed destroyed," without depending on after-the-fact discovery. Detection (after-the-fact reporting, recovery, the complaint) works on correcting the damage; attestation (independent verification of destruction at the moment of disposal) works on establishing trust at the end of the data lifecycle — each complementary to the other. For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and the [use-case index](https://lemma.frame00.com/solutions/use-cases/).

---

## 8. Sources

- **NHO Hokkaido Medical Center (primary, official)**: "Apology and report on the handling of personal information" (June 8, 2026) — <https://hokkaido-mc.hosp.go.jp/common/img/index/202608.pdf>
- **DataBreaches.Net**: "JP: Hokkaido hospitals data leak may hit 510k, HDDs sold online blamed" (2026-06-08) — <https://databreaches.net/2026/06/08/jp-hokkaido-hospitals-data-leak-may-hit-510k-hdds-sold-online-blamed/>
- **The Star (Malaysia)**: "Improper hard drive disposal triggers major data breach at Hokkaido hospitals" (2026-06-09) — <https://www.thestar.com.my/aseanplus/aseanplus-news/2026/06/09/improper-hard-drive-disposal-triggers-major-data-breach-at-hokkaido-hospitals>
- **Japan Today (English)**: "Data on 510,000 people linked to Hokkaido hospitals possibly leaked online" — <https://japantoday.com/category/national/data-on-510-000-people-linked-to-hokkaido-hospitals-possibly-leaked-online>

---

## 9. About Brief distribution

The Lemma Critical Brief is a threat-intelligence brief published by Lemma. This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization. If you use it as a reference for decision-making, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
