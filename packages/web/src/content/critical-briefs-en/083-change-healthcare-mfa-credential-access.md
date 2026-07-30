---
brief_no: 83
title: "Change Healthcare：MFA のない単一 Citrix アカウントへの侵入が、米国医療請求処理の 3 分の 1 を数週間停止させた — 「パスワードを知っている」ことと「正規の権限者である」ことを切り離す層がなく、盗まれた認証情報が正規アクセスと区別できなかった（UnitedHealth Group 議会証言）"
title_en: "Change Healthcare: a breach of a single Citrix account without MFA halted a third of US medical-claims processing for weeks — with no layer separating \"knows the password\" from \"is the legitimate authorized party,\" stolen credentials were indistinguishable from legitimate access (UnitedHealth Group congressional testimony)"
pillar: "04-regulatory-attribute"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass"]
incident_date: 2024-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["046-servicenow-unauthenticated-api", "057-deepseek-clickhouse-exposed-db", "056-mchire-paradox-recruiting-auth"]
status: published
version: "1.0"
og_lead_ja: "Change Healthcare：MFA なしの単一 Citrix アカウントへの侵入が米国医療請求の 3 分の 1 を数週間停止"
og_lead_en: "Change Healthcare: a breach of one Citrix account without MFA halted a third of US medical claims for weeks"
gap_detected: "At the ransomware-deployment stage the attack was detected and core systems were shut down; the intrusion path was identified and disclosed in congressional testimony, and the company moved on provider support and recovery."
gap_missing: "Because there was no MFA, the first malicious login to Citrix was outwardly indistinguishable from legitimate access, and there was no layer to independently prove at login time whether the login came from a legitimate authorized party."
gap_fix: "Independently verify the requester's authorization attributes with Lemma at the moment of the access request, replacing a design that gates on credential match alone, and prevent it up front."
---

## 1. TL;DR

In February 2024, the medical data processing company Change Healthcare (a UnitedHealth Group subsidiary) was breached by the AlphV/BlackCat ransomware group. The intrusion path was a malicious login with stolen credentials to a single account on a Citrix remote-access portal that had no multi-factor authentication (MFA) configured. Change Healthcare handles roughly a third (40–50%) of US health-insurance claims processing, and the system outage paralyzed prescription, billing, and eligibility-verification operations at pharmacies, hospitals, and physicians nationwide for weeks. Ultimately the medical records of over 100 million Americans were reportedly affected, making it the largest healthcare data breach in US history. A design in which "knowing the credentials" functioned as proof that "this person is a legitimate authorized party" made the ransomware intrusion indistinguishable from legitimate remote access.

---

## 2. What happened

- **Affected organization**: Change Healthcare (a UnitedHealth Group subsidiary; the largest medical-claims processing and health-information exchange network in the US)
- **Attacker**: The AlphV/BlackCat ransomware group (RansomHub later joined in separate extortion)
- **Intrusion path**: A malicious login with stolen credentials (ID and password) to a Citrix remote-desktop / VPN gateway portal that had no MFA configured
- **Operational impact**: The Change Healthcare outage rendered prescription-dispensing verification at pharmacies (chain and independent) nationwide, hospital insurance billing, and physician eligibility checks impossible or severely delayed for weeks. Some hospitals had to demand cash payment and could not verify prescription-drug stock
- **Impact scale (financial)**: The ransom UnitedHealth Group paid was approximately $22 million (a separate payment to RansomHub is also reported to have occurred later). Total losses including outage, recovery, and provider support are reported on the order of billions of dollars
- **Data impact**: The medical records, personal information, and insurance information of over 100 million Americans (up to 190 million in later estimates) may have been affected. The largest healthcare data breach in US history
- **Root cause (congressional testimony)**: UnitedHealth Group CEO Andrew Witty stated in congressional testimony (May 2024) that "a single Citrix account had no MFA configured" was the intrusion path
- **Structural point**: Credential authentication without MFA grants access to "someone who knows this password." It does not verify "whether the one who knows that password is the legitimate authorized party"

The incident came together as the following chain.

1. **Credential acquisition**: A Change Healthcare employee's Citrix account credentials (ID and password) were obtained by some means (phishing, infostealer, dark-web purchase, etc.) (the specific path has not been disclosed)
2. **Login to the Citrix portal**: Because no MFA was configured, remote access completes with the entry of an ID and password alone. The system cannot distinguish it from a "legitimate user's login"
3. **Lateral movement within the network**: The attacker enters the internal network as a user holding legitimate remote-access permissions. Through lateral movement, escalates privileges and expands access to critical systems
4. **Ransomware deployment**: Deploys and executes ransomware (AlphV/BlackCat) on core systems. Carries out data encryption and exfiltration
5. **Ransom demand and double extortion**: Demands a ransom conditioned on a decryption key for system recovery and on non-disclosure of the exfiltrated data. Even after the approximately $22 million payment, a separate group (RansomHub) retained the data and conducted secondary extortion

---

## 3. Timeline — disclosure and response

- **2024-02-12 (estimated)**: The attacker logs in to the MFA-less Citrix account with stolen credentials. Begins lateral movement within the network
- **2024-02-21**: Change Healthcare detects the ransomware attack. Shuts down core systems. Medical claims and prescription processing halt nationwide
- **2024-02-21 to March**: Pharmacies, hospitals, and physicians nationwide are affected by the outage. HHS (the US Department of Health and Human Services) announces an emergency response. The AHA (American Hospital Association) appeals to Congress citing catastrophic impact
- **March 2024 (estimated)**: AlphV/BlackCat receives the approximately $22 million ransom and then disbands the group. An affiliated group that retained the data reappears as RansomHub and separately extorts Change Healthcare
- **2024-05 (congressional testimony)**: UnitedHealth Group CEO Andrew Witty testifies before Senate and House committees. Officially acknowledges that "the MFA-less Citrix account was the intrusion path"
- **From 2024-10**: HHS discloses the affected count (initially over 100 million). As a final estimate, up to over 190 million may have been affected, as reported

> Note: This Brief is based on the UnitedHealth Group congressional testimony and HHS disclosures as primary sources. The intrusion date (2024-02-12) is an estimate, and the affected count has been updated by point in time of disclosure, so consult the latest information.

The response and industry movement after disclosure:

- **UnitedHealth Group / Change Healthcare**: Immediate system shutdown, establishment of an emergency funding-assistance program for providers (billions of dollars), and investigation and disclosure of the breach scope in parallel with recovery work
- **HHS (US Department of Health and Human Services)**: Issued emergency guidance. Temporary flexibility measures regarding application of HIPAA rules. Disclosure of the final affected count (over 100 million)
- **AHA (American Hospital Association)**: Appealed to Congress for emergency measures, citing "catastrophic and unprecedented" impact
- **Congress**: In May 2024, UnitedHealth Group CEO Andrew Witty testified before both Senate and House committees. Stated that the missing MFA was the intrusion path
- **AlphV/BlackCat**: Effectively disbanded after receiving approximately $22 million. According to a whistleblower, the ransom was monopolized by the group leader, and affiliates reorganized as RansomHub with the data
- **Industry argument**: Debate over the de facto mandating of MFA in healthcare IT accelerated. HHS began considering a revision to the HIPAA Security Rule (explicitly stating an MFA requirement). Attention to third-party vendor risk management for medical infrastructure increased

---

## 4. Why it wasn't stopped

The central **failure primitive is "authentication depended only on the knowledge check of 'do you know this password' and had no layer to independently prove whether the one entering this password is the legitimate authorized party."**

Password authentication is based on a "shared secret" model. The moment a password leaks, the people who know that password grow to two — the "legitimate user" and the "attacker" — and the system cannot distinguish either login. MFA is a design that sets up additional resistance against this problem by "also verifying factors other than the password (possession, biometrics)," but in this incident it was not configured on the external access gateway of medical infrastructure.

The distinctive point this incident shows in comparison with existing Briefs lies in **scale** and **infrastructure impact**. [Brief No.046](/critical/briefs/046-servicenow-unauthenticated-api/) (ServiceNow misconfiguration removed authentication), No.057 (DeepSeek ClickHouse unauthenticated exposure), and No.056 (McHire Paradox recruiting-AI lack of authentication) are all incidents in which "the authentication gate failed to function," but this incident differs in that "a login with credentials was made to a legitimate gate." The attack did not exploit a system flaw; it **broke the premise of authentication ("the one entering this password is the authorized party")**.

In the HIPAA context, access to PHI (protected health information) should be limited to "authorized parties with a legitimate operational need," but there was no layer to independently verify the authorization attribute for PHI access, and with the intruder indistinguishable from legitimate access, that constraint did not function.

Detection functioned in this incident as well. Change Healthcare detected the attack at the ransomware-deployment stage and shut down core systems. Post-incident forensics identified the intrusion path, it was made explicit in congressional testimony, and cross-industry provider support and recovery work proceeded. This Brief does not deny the role of incident detection, containment, and forensics.

That said, detection does not change the very structure in which "a login with credentials can succeed at a legitimate gate." The first malicious login to the Citrix portal was outwardly indistinguishable from legitimate remote access — because there was no MFA, a "legitimate user's login" and a "login with stolen credentials" have the same appearance. By the time detection fired, the attacker had already been moving laterally within the network for about 9 days (intrusion February 12, detection February 21). As long as there was no layer to independently prove at login time "whether this login came from a legitimate authorized party," detection can only contain after the fact.

---

## 5. What proof would have changed

Pre-execution attestation adopts a design that combines the knowledge proof of "knowing the password" with an independent attribute proof of "this person is the legitimate authorized party." At the moment of the access request, it verifies the requester's identity provenance and authorization attributes as a pre-execution attestation, replacing a design that gates on credential match alone. With this, even if credentials leak, access does not succeed unless the requester can prove a legitimate authorization attribute. Detection (ransomware detection, lateral-movement monitoring, and the like) and pre-execution attestation (attribute proof) are in a **complementary**, not substitutive, relationship.

Against the detection–proof gap exposed by this incident (a credential match did not function as proof of an authorized party, and the breach login was indistinguishable from legitimate access), Lemma proposes the following.

- **Attribute proof of the access request**: At login, confirm in advance, as an independently verifiable cryptographic proof, "whether this access requester holds a legitimate authorization attribute (operational need, employment relationship, the provenance of delegated authority)"
- **Separation of credential knowledge from authority**: Treat the proof of "knowing the password" and the proof of "being the legitimate authorized party" as separate propositions, and set up a layer that independently verifies the latter
- **Provenance chain for PHI access**: Leave a provable record, at the moment of the access request, of "whether access to medical records is by someone holding legitimate operational authority." Implement HIPAA's "Minimum Necessary" principle as pre-execution proof rather than after-the-fact self-declaration
- **Selective disclosure**: Without disclosing the access requester's full personal information, prove only that "this party holds the access-authorization attribute for this system"

Detection (incident detection, containment) and pre-execution attestation (independent verification of the access authorization attribute) are complements, not substitutes; without denying after-the-fact detection, they place a gate at the front of the design that does not depend on credential match alone. For the design and its scope, see [Pillar 04 — Regulatory Attribute Proof](https://lemma.frame00.com/pillars/regulatory-attribute-proof/) and [Seal](https://lemma.frame00.com/seal/).

---

## 6. Sources

- **UnitedHealth Group congressional testimony (primary)**: Testimony by CEO Andrew Witty before the US Senate Finance Committee and House Energy and Commerce Committee (around 2024-05-01, 05-08). Stated the MFA-less Citrix account as the intrusion path — https://www.finance.senate.gov/hearings/hacking-americas-health-care-assessing-the-change-healthcare-cyber-attack-and-whats-next (Witty testimony PDF: https://www.finance.senate.gov/imo/media/doc/0501_witty_testimony.pdf)
- **HHS (US Department of Health and Human Services)**: Breach notification and disclosure of the affected count (from 2024-10). Change Healthcare Breach Substitute Notice
- **AHA (American Hospital Association)**: "Change Healthcare Cyberattack" (from 2024-02) — https://www.aha.org/change-healthcare-cyberattack
- **Wired**: "The Change Healthcare Hack: How It Happened and What It Means" (2024)
- **CISA / FBI joint advisory**: Technical advisory on the AlphV/BlackCat ransomware group (2024-02-27) — https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-353a

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
