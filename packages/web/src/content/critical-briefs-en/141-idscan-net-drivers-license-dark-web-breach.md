---
brief_no: 141
title: "IDScan.net：本人確認のために窓口へ渡した運転免許証のスキャン画像が、1 億 5,300 万件超ダークウェブで売られていた — 確認は一度で終わるが、画像は残り続ける"
title_en: "IDScan.net: More than 153 million scanned driver's licenses handed over at counters were being sold on the dark web — the check ends in a moment, the image does not"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [kyc-aml-disclosure, data-provenance]
incident_date: 2026-09-01
published: 2026-09-04
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["052-discord-age-verification-id-leak", "077-idmerit-kyc-data-exposure", "086-sumsub-support-environment-breach", "034-ekyc-liveness-bypass"]
status: published
version: "1.0"
og_lead_ja: "IDScan.net、運転免許証 1.5 億件超がダークウェブで検索可能に"
og_lead_en: "IDScan.net: 153M+ scanned driver's licenses sold on the dark web"
---

## 1. TL;DR

A dark web service called Nexus offered more than 153 million North American driver's licenses as searchable, timestamped scan images. Brian Krebs and researcher Zach Edwards found their own licenses in it and matched the timestamps to moments they had handed a license across a counter, pointing to identity verification vendor IDScan.net as the source. The FBI opened a case the same day; Nexus went offline hours later. **What was missing is a layer letting the person handing over an ID check how long the scanned original stays, and with whom.**

## 2. What happened

- Nexus was advertised on August 31, 2026 on the Russian-language cybercrime forum "Exploit," with the seller claiming to hold "digital scans of identity documents on more than 170 million people in North America."
- Listed totals were more than 153 million driver's licenses, over 10 million ID cards, more than 3 million travel documents and international IDs, and over 579,000 medical cards. Krebs observed the driver's license count rise by nearly 400,000 in the 24 hours after launch, suggesting freshly stolen data was still being uploaded.
- The seller claimed to have "been continuously exfiltrating new data for over a year into our private database." That is the seller's assertion and has not been independently confirmed.
- A single record could hold up to six images: the front and back of a license in three versions each — a basic scan plus infrared and ultraviolet — with the date and time appended to the filenames.

The source was identified through the following chain.

1. Krebs searched his own license on Nexus and found records for himself and his mother. The two had handed their licenses to a Hertz rental-car representative at the same time.
2. The image timestamps matched that handover.
3. Researcher Zach Edwards found his own record as well. Edwards had not rented a car in Vegas, but had handed over his license at a TSA checkpoint, at a marijuana dispensary in the city, and at his hotel, the Aria.
4. What these share is in-person document verification with infrared and ultraviolet scanning. IDScan.net says its systems perform more than 21 million verifications monthly at more than 20,000 locations worldwide, and in August 2022 announced an ID verification agreement with Planet 13's dispensaries.
5. IDScan.net's Jillian Kossman told Krebs only that "at this point I'm not able to share any additional information, but the updates you have provided have been welcome, and helpful to our team's investigation."
6. Caesars Entertainment, listed as a client on IDScan.net's own site, said that "Caesars has not been a client of IDScan.net and has not used VeriScan since February 2025, despite IDScan.net listing them as a client on their website."
7. The FBI's New Orleans field office told Krebs on September 1 that it had opened a formal investigation into a suspected breach involving IDScan.net.

## 3. Timeline — disclosure and response

- 2026-08-31: Nexus is advertised on the "Exploit" cybercrime forum. A source alerts Krebs.
- 2026-09-01: Krebs publishes his findings. The same day, the FBI's New Orleans field office tells him it has opened a formal investigation.
- 2026-09-01: Within hours of publication, the Nexus login page is replaced with "This service is no longer available" and the site goes down.
- 2026-09-02: TechCrunch adds independent reporting, finding the driver's license of U.S. Secretary of Defense Pete Hegseth among the records. The Department of Defense says it is "aware of these reports and is evaluating them"; the FBI says it is "looking into the incident."

> The source attribution rests on independent verification by Krebs and Edwards — finding their own and family members' license records and matching the image timestamps to actual handovers — not on any admission by IDScan.net. Every figure here is the count Nexus itself listed, not an independently verified number of real records. As of this writing (2026-09-04), IDScan.net has published no statement confirming a breach or its scope.

The response and industry movement since publication:

- The FBI opened an investigation led by its New Orleans field office, with cyber-division staff briefing Krebs.
- IDScan.net has said only that it is investigating, and has published nothing on whether or how far it was breached. The URL of its press release announcing the Planet 13 agreement does not respond to automated retrieval as of this writing.
- Caesars Entertainment, listed as a client, disputed the listing itself, saying it is not a customer.
- Nexus took itself offline, but whether the already-exfiltrated data resurfaces through another channel is unknown as of this writing.

## 4. Why it wasn't stopped

This wasn't broken cryptography or a simple misconfiguration. **A one-time check of an ID at a counter had been replaced by the accumulation, over years, of original document images down to infrared and ultraviolet — with no way for the person who handed the ID over, or the business that asked for it, to check where those images live, for how long, or who can reach them.**

What the counter needs is a momentary judgment: this person holds this document and meets the condition. What actually gets generated and stored is the original image that judgment rested on. The judgment ends; the image carries no expiry. That Krebs and Edwards could find handovers from years earlier, timestamped, is itself evidence that the images outlived the checks that produced them.

Detection worked. Researchers pointed to the source within days using their own documents, the FBI opened a case the same day, and Nexus went down hours after publication. What failed is the layer before that: between the moment of handover and the moment a breach becomes public, neither the individual nor the client business could independently confirm who had access.

> "Caesars has not been a client of IDScan.net and has not used VeriScan since February 2025, despite IDScan.net listing them as a client on their website." — Caesars Entertainment. Even the client list published by a company whose business is verifying identity had been left standing, out of date and unchecked.

[Brief 052](/critical/briefs/052-discord-age-verification-id-leak/), where government ID handed over to prove age surfaced through a third party, and [Brief 077](/critical/briefs/077-idmerit-kyc-data-exposure/) and [Brief 086](/critical/briefs/086-sumsub-support-environment-breach/), on exposure inside the companies holding KYC data, are the same failure in other sectors: a design in which proving something requires handing over the original.

## 5. What proof would have changed

The purpose of an identity check is the judgment — this person meets this condition — not the original document that judgment rested on. Proof before the fact inserts that distinction into the path, replacing what the counter receives: a copy of the original becomes a checkable proof of an attribute.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Issue the attribute, not the document</strong>: make what each check generates a proof of the attribute in question — an age threshold met, a document shown to be authentic — rather than an image of the original.</li>
<li><strong>Bind scope and expiry</strong>: bind what the proof answers, and for how long, into the proof itself, so nothing equivalent to the original persists once the check is done.</li>
<li><strong>Verify the recipient's standing</strong>: make it verifiable whether the party receiving a proof is still an authorized recipient, so a relationship that has ended does not keep being treated as current.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not recover images that have already leaked or remove data circulating on the dark web.</li>
<li>It does not prevent a breach from happening. Detection, disclosure, and law enforcement response remain the work of people and authorities.</li>
<li>Proof can show what was handed over as the basis of a check; it does not remove the cases where a counter has a business reason to ask for the original itself.</li>
</ul>

Detection and this layer are complementary, not substitutes. The former establishes the scope of a leak after it happens; the latter makes "no pile of original images accumulating with each check" something you can confirm before the next counter opens. Keeping the exposable surface small is also what buys the time detection needs.

## 6. Sources

- **Krebs on Security (primary, original investigative reporting)**: Brian Krebs, "FBI Probes Service Selling 153M+ Drivers Licenses" (2026-09-01) — <https://krebsonsecurity.com/2026/09/fbi-probes-service-selling-153m-drivers-licenses/>
- **TechCrunch (independent)**: "It sure looks like hackers breached a major ID card verification service" (2026-09-02) — <https://techcrunch.com/2026/09/02/it-sure-looks-like-hackers-breached-a-major-id-card-verification-service/>
- **IDScan.net (primary, company statement)**: "Business risk skyrockets as ID fraud rises, according to 2025 ID Fraud Report" (2025-05-28; source of the 21M-verifications, 20,000-locations figures) — <https://idscan.net/press-release/2025-id-fraud-report/>
- **IDScan.net (primary, company statement)**: "World's largest cannabis dispensary, Planet 13, partners with IDScan.net for ID verification" (2022-08-04) — <https://idscan.net/press-release/planet-13-partners-with-idscan-net/> (the origin does not respond to automated retrieval; archived copy: <http://web.archive.org/web/20260902204050/https://idscan.net/press-release/planet-13-partners-with-idscan-net/>)

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On proving attributes, see [Pillar 04 — Regulatory Attribute Proof](/pillars/#attribute).

All figures are the counts Nexus itself listed and have not been independently verified. The attribution of the source to IDScan.net rests on independent verification by Krebs and Edwards; the company has published nothing on whether or how far it was breached as of this writing.
