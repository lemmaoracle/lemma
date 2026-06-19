---
brief_no: 13
title: "Coinbase KYC データ内部漏洩 — 規制が要求する生 PII の保管が、内部買収で漏洩面に転化した構造"
title_en: "The Coinbase KYC Insider Breach — When Regulation-Mandated Storage of Raw PII Becomes the Breach Surface"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth"]
incident_date: 2025-05-15
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["006-google-api-key-revocation-lag", "002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "規制が要求する生の個人情報の保管が内部買収で漏洩面化 — Coinbase KYC"
og_lead_en: "Regulation-mandated raw PII storage became the breach surface via insider — Coinbase KYC"
---

## TL;DR

In May 2025, Coinbase disclosed an incident in which overseas-outsourced customer-support personnel (in India) had been bribed and had exfiltrated and externally sold the KYC data of at least 69,461 customers. The exfiltrated data included names, addresses, phone numbers, email addresses, masked SSNs, bank account identifiers, government-issued ID images, and balance / transaction snapshots; passwords, private keys, and funds were not exfiltrated. The attackers demanded a $20M ransom on May 11; Coinbase refused and offered a $20M bounty instead, and estimated remediation costs at $180M–$400M in a Form 8-K filed with the SEC. This incident is a representative case of the detection–proof gap in Pillar 04 (Regulatory Attribute Proof) in which KYC / AML regulation requires operators to collect and store raw PII and that stored attribute data itself becomes the breach surface for insider threats.

---

## 1. Incident Overview

- **Affected organization**: Coinbase (a US-regulated cryptocurrency exchange)
- **Attacker**: Attackers who bribed overseas-outsourced customer-support personnel (primarily in India). Accessed via internal support tools
- **Method**: The bribed personnel obtained customer data from internal tools (including by photographing) and sold it to attackers for small amounts per record (reported at approximately $200)
- **Affected scale**: At least 69,461 individuals (under approximately 1% of monthly transacting users)
- **Exfiltrated data**: Names, email addresses, mailing addresses, phone numbers, masked SSNs (last 4 digits), bank account identifiers, government-issued ID images, snapshots of balances and transaction history
- **Not exfiltrated**: Passwords, seed phrases / private keys, funds (Coinbase Prime was not affected)
- **Extortion**: On 2025-05-11, the attackers demanded a $20M ransom (in BTC). Coinbase refused payment and offered a $20M bounty
- **Regulatory disclosure / costs**: On 2025-05-15, filed Form 8-K with the SEC. Estimated remediation and reimbursement costs at $180M–$400M
- **Response**: Reimbursement of defrauded customers, establishment of new US-based support facilities, identity-theft protection and credit monitoring offered to affected customers

---

## 2. Timeline

- 2024-09 to 2024-12: Unauthorized acquisition of customer data by outsourced support personnel begins (the Maine breach notification records the breach date as 2024-12-26)
- 2024-12 to 2025-05: Data continues to be acquired and sold over several months
- 2025-05-11: The attackers demand a $20M ransom. Coinbase recognizes the insider abuse
- 2025-05-15: Coinbase publishes an official statement (refusing payment, offering a $20M bounty). On the same day, files Form 8-K with the SEC, disclosing the $180M–$400M remediation cost estimate
- Around 2025-05-21: The affected count (at least 69,461) and the categories of exfiltrated data are confirmed in reporting

---

## 3. Attack Vector

1. **Regulatory data accumulation (premise)**: In compliance with KYC / AML regulation, Coinbase collected and stored customers' raw PII (government-issued ID images, SSNs, bank information, etc.). This accumulated as a byproduct of attribute verification required by regulation
2. **Insider recruitment**: The attackers bribed outsourced support personnel (overseas) with money. Insiders with legitimate operational access permissions were selected as the path
3. **Authorized-access exfiltration**: The bribed personnel accessed customer data through internal support tools within the scope of their legitimate permissions and exfiltrated it externally by photographing and similar means
4. **Monetization**: The acquired data was sold to the attackers (reported at approximately $200 per record). The attackers aggregated the data
5. **Extortion**: Using the aggregated data as leverage, the attackers demanded a $20M ransom. Threatened public disclosure
6. **Impact realization**: KYC data of over 69,461 individuals reached the attackers, becoming material for secondary social engineering, impersonation, and fund fraud. Funds and private keys were not directly exfiltrated, but the leakage of attribute data became the starting point for downstream harm

---

## 4. Structural Analysis

This incident belongs to the `kyc-aml-disclosure` category of Pillar 04 (Regulatory Attribute Proof). The central failure primitive is that regulation (KYC / AML) requires operators to collect and store customers' raw PII, and that stored attribute data itself became the breach surface via insiders with legitimate access permissions. The attack did not exploit a vulnerability; it exploited legitimate operational access and the fact of "data existing" itself. Secondary tagging is `identity-auth`.

It shares Pillar 04 with Brief 006 (Google API key revocation lag) but has a different primitive. Brief 006 was the lag problem in which an attribute proof (credential) is not revoked when it should be; this incident is the leakage at storage of raw data collected for attribute verification. Both share the point that "the trust of a regulatory attribute breaks at structural weaknesses in the layer that secures it." It is also adjacent to Brief 002 (Stake DAO, identity / authority in the cryptocurrency domain) on the context of the trust boundary in regulated operators. This incident is an attack incident and shows the limits of a design that operates KYC as a "promise" — collecting raw PII and protecting it.

---

## 5. The detection–proof gap

Insider threat detection, anomalous access detection, DLP, and third-party governance are essential for early discovery and containment of leakage via insiders such as in this incident, and this Brief does not deny that role. Coinbase recognized the wrongdoing and moved on disclosure, the bounty, and reorganization of its support setup — outcomes of detection and response functioning as well.

That said, detection does not change the fact that "data is stored." Under a design that satisfies KYC / AML by collecting and storing raw PII, that attribute data is always reachable to insiders with legitimate access permissions, and once bribery or misuse succeeds, detection can only contain after the fact. As long as regulatory compliance is operated as a promise that "the operator collects raw PII and protects it properly," the very existence of the data to be protected continues to be the breach surface. As material for establishing in regulatory reporting and audit that "attribute verification was performed appropriately and completed with minimal disclosure," logs of raw PII storage are inseparable from leakage risk.

Attribute attestation adopts a design in which attribute verification (KYC passage, permitted jurisdiction, non-sanctioned status, age, etc.) is received by the verifying party as an independently verifiable cryptographic proof (a ZK attribute proof) without retaining raw PII. The verifying party can confirm "this user satisfies KYC / holds the permitted attribute" via the proof, without warehousing government-issued ID images or SSNs themselves. By structurally reducing the accumulation of raw PII that would constitute the breach surface, even when insider bribery succeeds, the data that can leak is structurally reduced. Detection (insider monitoring and the like) and attribute attestation (attribute proof) are in a **complementary**, not substitutive, relationship.

---

## 6. Response and Industry Developments

- **Coinbase**: Refused to pay the ransom and offered a $20M bounty to identify the attackers. Filed Form 8-K with the SEC, disclosing the $180M–$400M remediation cost estimate. Reimbursed defrauded customers, established new US-based support facilities, and offered identity-theft protection and credit monitoring to affected customers
- **Regulatory and legal developments**: Disclosure under US securities and data-protection regulation (8-K) and state-level breach notifications (Maine, etc.) proceeded in parallel. Multiple class-action suits have been filed, with the KYC data storage responsibility of regulated operators emerging as a point of dispute
- **Cross-industry argument**: The insider threat in the supply chain — including outsourced support — and the honeypot problem produced by regulation-mandated storage of raw PII were re-recognized across cryptocurrency and fintech. Design arguments for shifting KYC from "store and protect" to "do not store but prove" emerged

How "to satisfy regulatory attribute verification without storing raw PII" is expected to be discussed as a point of design and procurement for regulated operators going forward.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (raw PII collected and stored for KYC / AML compliance becomes the breach surface via legitimate-access insider threats), Lemma proposes a design in which attribute verification is not "protected by the verifying party while it retains raw PII" but is instead "received by the verifying party as a proof, without the verifying party receiving raw PII." A user presents regulatory attributes — KYC passage, permitted jurisdiction, non-sanctioned status, age, and the like — as an independently verifiable cryptographic proof (a ZK attribute proof), and the operator verifies only the fact that "the attribute is satisfied" without warehousing government-issued ID images or SSNs themselves. By structurally reducing the accumulation of raw PII that could leak, even when insider bribery succeeds, the scope of exfiltration is bounded. Lemma does not substitute for regulatory compliance; it provides the layer that operates compliance not as a "promise" but as a "proof."

---

## 8. Sources

- **Coinbase official statement**: "Protecting Our Customers - Standing Up to Extortionists" (2025-05-15, refusing the ransom, offering the $20M bounty) — https://www.coinbase.com/blog/protecting-our-customers-standing-up-to-extortionists
- **TechCrunch**: "Coinbase says its data breach affects at least 69,000 customers" (2025-05-21, affected count and exfiltrated data categories) — https://techcrunch.com/2025/05/21/coinbase-says-its-data-breach-affects-at-least-69000-customers/
- **Bitdefender (HotForSecurity)**: "Data Breach at Coinbase Exposes Information of Nearly 70,000 Customers" (2025-05, method and data categories) — https://www.bitdefender.com/en-us/blog/hotforsecurity/data-breach-at-coinbase-exposes-information-of-nearly-70-000-customers
- **SecurityInfoWatch**: "Coinbase Reveals Insider Bribery Scheme Led to Data Breach, Potential $400M Cost" (2025-05, Form 8-K and remediation cost estimate) — https://www.securityinfowatch.com/cybersecurity/article/55290995/coinbase-reveals-insider-bribery-scheme-led-to-data-breach-potential-400m-cost
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
