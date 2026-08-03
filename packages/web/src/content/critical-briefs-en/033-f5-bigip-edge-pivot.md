---
brief_no: 33
title: "1 台のエッジ機器の侵害が、ドメイン全体の侵害に連鎖した — 社内で暗黙に信頼された F5 BIG-IP が、保存された資格情報ごと横展開の足場になった"
title_en: "One Edge Appliance Compromise Cascaded to Full Domain Takeover — An Implicitly Trusted F5 BIG-IP Became the Pivot, Along With the Credentials It Stored"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-22
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["006-google-api-key-revocation-lag", "029-github-dev-oauth-token", "003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "1 台のエッジ機器の侵害がドメイン全体へ連鎖 — F5 BIG-IP"
og_lead_en: "One edge-appliance compromise cascaded to full domain takeover — F5 BIG-IP"
gap_detected: "Threat research could make the attack chain visible, observe the exposure of vulnerable appliances, and identify what needed patching."
gap_missing: "At each stage of lateral movement there was no layer to confirm before the action whether the holder of the credential held authorization to take this action within this scope, so mere possession of stolen credentials passed as authority."
gap_fix: "Rather than possession of a key or credential, independently verify with Lemma that the action carries scoped authorization and provenance, and prevent it up front."
---

## 1. TL;DR

Microsoft Threat Intelligence published an attack in which compromising one internet-facing, end-of-life F5 BIG-IP cascaded into full Active Directory takeover. Threat research made the chain visible, but detection is reactive: by the time it fired, the stored credentials were already taken. What was missing was a layer to confirm, at each hop, whether the credential's holder had the authorization and provenance for this action within this scope; instead, mere possession of stolen credentials passed as authority.

---

## 2. What happened

- **Target**: enterprise environments (organizations with internet-facing F5 BIG-IP edge appliances)
- **Disclosure**: 2026-05-22, Microsoft Threat Intelligence published the attack chain
- **Initial access**: SSH to an F5 BIG-IP Virtual Edition (VE, 15.1.201000 — a cloud-deployment build commonly provisioned via Azure ARM templates / Terraform) on Azure. That version reached end-of-life on 2024-12-31 and was out of patch supply and support at the time of compromise.
- **Cascade**: compromised edge appliance → SSH to the first Linux host → lateral movement to an internal Atlassian Confluence server and Windows authentication infrastructure → domain-level compromise (Active Directory)
- **CVEs abused**:
  - **CVE-2025-53521** (F5 BIG-IP APM): disclosed as a DoS in 2025-10, reclassified as RCE (CVSS 9.8) in 2026-03. CISA added it to the KEV on 2026-03-27. Shadowserver observed over 17,000 vulnerable IPs at the time.
  - **CVE-2025-33073** (Windows SMB NTLM reflection): disclosed by RedTeam Pentesting / Synacktiv in 2025-06. It removes the admin-rights prerequisite and enables authenticated RCE as SYSTEM on any domain-joined machine where SMB signing is not enforced, with only network reachability and **any valid domain credential**.

The incident came together as the following chain.

1. **Initial access to the edge appliance**: establish SSH access to an internet-facing EOL F5 BIG-IP VE (targeting unpatched appliances via the associated CVE-2025-53521 RCE, etc.)
2. **Acquiring a trusted foothold**: obtain the credentials, certificates, and identity integrations stored on the appliance. Because the appliance is treated as highly trusted internally, the attacker gains internal reachability while staying low-visibility.
3. **Lateral movement to a Linux host**: move via SSH from the F5 BIG-IP (load balancer) to the first Linux host
4. **Expansion to internal services**: lateral movement to an internal Atlassian Confluence server and Windows authentication infrastructure
5. **Domain compromise**: use CVE-2025-33073 (SMB NTLM reflection) to achieve SYSTEM RCE with only valid domain credentials and no admin rights, reaching Active-Directory-level compromise

---

## 3. Timeline — disclosure and response

- 2024-12-31: F5 BIG-IP VE 15.1.x reaches EOL; out of patch supply and support thereafter
- 2025-06: CVE-2025-33073 (SMB NTLM reflection) disclosed by RedTeam Pentesting / Synacktiv
- 2025-10: CVE-2025-53521 disclosed as a DoS in F5 BIG-IP APM
- 2026-03: CVE-2025-53521 reclassified as RCE (CVSS 9.8)
- 2026-03-27: CISA adds CVE-2025-53521 to the KEV; Shadowserver observes over 17,000 vulnerable IPs
- 2026-05-22: Microsoft Threat Intelligence publishes the full chain of the multi-stage Linux intrusion starting from F5 BIG-IP (via F5 / Confluence)

> Note: proper names and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies by point in time, so consult the latest information.

The response and industry movement after disclosure:

- **Microsoft Threat Intelligence**: published the full attack chain and made explicit how the duality of the edge appliance (externally exposed, lightly monitored, highly trusted internally) amplifies a single compromise into a domain compromise.
- **F5 / CISA**: CVE-2025-53521 was reclassified from DoS to RCE (CVSS 9.8) and added to the CISA KEV. The problem of continuing to run EOL appliances (BIG-IP VE 15.1.x), which leaves exposure unpatchable, was re-recognized.
- **Cross-industry**: the premise of treating edge appliances, identity integrations, and stored credentials as "trusted devices inside the perimeter" becomes an amplifier of lateral movement. The argument is advancing to shift the center of gravity of enterprise identity design toward not equating possession of a credential with proof of authorization, and instead verifying scoped authorization and provenance per action (proof-as-auth / per-action attestation). Inventorying EOL appliances and configuration management of cloud deployments (ARM/Terraform) are also operational points.

---

## 4. Why it wasn't stopped

" The central failure primitive is that **each hop of lateral movement was accepted on implicit trust in network "position" and "stored credentials," rather than requiring authorization to be proven per action.**

The trust model of the edge appliance is the core. An appliance like BIG-IP is externally exposed yet treated internally as a "trusted device inside the perimeter," holding credentials, certificates, and identity integrations. This duality — easy to target from outside, strongly trusted on the inside — amplified a single compromise into a full domain compromise. What CVE-2025-33073 shows is that authentication inside the domain rests on the premise "holding a valid credential = a legitimate actor," and never requires the credential to prove, per action, **which action it may perform and under whose authorization.** Through reflection, mere possession of a credential converted instantly into SYSTEM privileges.

This is the same family as [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/) (the "revoked" state of a Google API key was not independently verified and remained valid after deletion): a credential's or attribute's state is made the premise of trust yet is never independently verified. It shares a root with [Brief 029](/critical/briefs/029-github-dev-oauth-token/) (github.dev's OAuth token was not scoped to the operation's target and was valid across all repositories) in that **a credential, once obtained, passes laterally without being bound to the scope of the action.** This case is a field instance of that primitive propagating across an enterprise's entire AD at a trust boundary close to physical — the edge appliance.

Microsoft Threat Intelligence's visualization of the attack chain, CISA's KEV addition, Shadowserver's exposure observations, and patching/replacing EOL appliances are indispensable for understanding the damage, containment, and prevention of recurrence; this Brief does not dispute that role. Identifying and patching exposed EOL appliances is the top-priority operational response.

But detection does not change "whether, at each hop, that action should be authorized" itself. The lateral movement here proceeded through legitimate SSH, valid domain credentials, and legitimate authentication flows, and each operation looks normal in isolation. Because the edge appliance is externally exposed and lightly monitored, detection fired late — by the time it was detected, credentials and certificates were already in the attacker's hands. What was missing is independent verification, at the moment of the action, of "does the holder of this credential have the authorization and provenance to perform this action, within this scope?" — a different track from network monitoring and after-the-fact log tracing. As NTLM reflection shows, as long as possession of a credential is equated with proof of authorization, detection can only be reactive to the compromise.

---

## 5. What proof would have changed

Pre-execution attestation inverts authentication from "do you hold a credential?" to "pre-execution verification of whether this action has scoped authorization and provenance." Instead of sending a key or a long-lived credential, it requires a verifiable, scoped, non-reusable proof per action, so that even with credentials stolen from the edge appliance or privileges gained via reflection, if the proof says "this action lacks legitimate authorization and provenance," execution is blocked in advance. Detection of credentials (the detection-style "is this a valid credential?") and pre-execution proof of the action ("does this action have authorization and provenance?") are not substitutes but **complements**.

Against the structure exposed here (each hop of lateral movement is accepted on positional trust and implicit trust in stored credentials, rather than per-action proof of authorization), Lemma proposes a design that inverts authentication from "possession of a credential" to "pre-execution proof of scoped authorization and provenance per action."

- **Invert possession into proof**: shift authentication from "do you hold a valid credential?" to "pre-execution verification of whether this action has legitimate authorization and provenance."
- **Scope per action**: instead of sending a key or a long-lived credential, require a verifiable, scoped, non-reusable proof per action, cutting off lateral reuse.
- **Eliminate positional trust**: do not rest on implicit trust in network "position" or stored credentials; verify authorization and provenance independently at each hop.
- **Block theft and reflection in advance**: even with credentials stolen from the edge appliance or privileges gained via reflection, if the proof reports missing legitimate authorization or provenance, reject execution in advance.

In this way, if a proof of legitimate authorization and provenance does not hold, the action is rejected in advance, and detection of credentials is complemented by proof beforehand.

---

## 6. Sources

- **Microsoft Security Blog (Microsoft Threat Intelligence)**: "From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence" (2026-05-22; full attack chain, initial access, lateral movement, CVEs) — https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/
- **CISA KEV**: CVE-2025-53521 (F5 BIG-IP APM, added 2026-03-27) — https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- **NVD**: CVE-2025-33073 (Windows SMB NTLM reflection) — https://nvd.nist.gov/vuln/detail/CVE-2025-33073

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/#authority), [Trust402](https://lemma.frame00.com/trust402/)
