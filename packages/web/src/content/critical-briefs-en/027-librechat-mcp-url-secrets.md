---
brief_no: 27
title: "LibreChat CVE-2026-32625 — ユーザーが指定する MCP サーバー URL が、サーバーの秘密情報を運び出す経路になった"
title_en: "LibreChat CVE-2026-32625 — User-Supplied MCP Server URLs as an Exfiltration Channel for Server Secrets"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-02
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "ユーザーが指定する MCP サーバー URL が、サーバーの秘密情報を運び出す経路に — LibreChat CVE-2026-32625 CVSS 9.6"
og_lead_en: "User-supplied MCP server URLs became an exfiltration channel for server secrets — LibreChat CVE-2026-32625 CVSS 9.6"
---

## TL;DR

On June 2, 2026, CVE-2026-32625 (CVSS 9.6, Critical) was published against LibreChat, a multi-provider AI chat platform. In versions ≤0.8.3, the MCP server integration resolves `${VAR}` placeholders inside user-supplied MCP server URLs against the server's own `process.env` during Zod schema validation. A low-privilege authenticated user registers an attacker-controlled domain URL embedding `${CREDS_KEY}` or `${MONGO_URI}` as an MCP server — and the LibreChat server sends encryption keys, JWT secrets, and DB connection strings to the attacker encoded in the request URL. No admin privileges are required; the installation's entire cryptographic foundation is compromised. This incident belongs to Pillar 03 (Agent Authority Proof) `agent-infrastructure` and illustrates that **configuration values describing where an agent connects are themselves unverified inputs interpreted in a privileged context.** Together with Brief 003 (MCP server authentication bypass), it forms a trust-boundary issue in the agent infrastructure layer.

Registered the server URL ≠ authorized the secrets access

---

## 1. Incident Overview

- **Target**: LibreChat (danny-avila/LibreChat) ≤0.8.3, MCP server integration
- **Identifier**: CVE-2026-32625 / GHSA-4pcc-j6m6-wcwx (CWE-200: Exposure of Sensitive Information to an Unauthorized Actor)
- **Severity**: CVSS 3.1 = 9.6 (Critical). `AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N` — network, low attack complexity, low privileges sufficient, no user interaction, scope changed
- **Published**: 2026-06-02 (via GitHub Security Advisory; CVE reserved 2026-03-12)
- **Root cause**: during schema validation of the user-supplied MCP server URL, `${VAR}`-form placeholders are expanded against the server's `process.env`. Environment-variable referencing — an operator-facing configuration feature — was active for all authenticated user input
- **Exfiltrated data**: `CREDS_KEY` / `CREDS_IV` (credential encryption keys), `JWT_SECRET`, `MONGO_URI`, etc. These constitute the installation's cryptographic material and DB connection information; exfiltration compromises all user data and the authentication foundation
- **Exploitation status**: CISA SSVC assessment: Exploitation: poc (proof-of-concept exists). Fixed in 0.8.4-rc1

---

## 2. Timeline

- 2026-03-12: CVE number reserved (GitHub assigner)
- 2026-06-02: GitHub Security Advisory (GHSA-4pcc-j6m6-wcwx) and CVE-2026-32625 published. Fix version 0.8.4-rc1 made available
- 2026-06-03: CISA assigned SSVC assessment (Exploitation: poc / Technical Impact: total)
- 2026-06-04: NVD analysis completed (CVSS 9.6 Critical confirmed)

---

## 3. Attack Vector

1. **Low-privilege account acquisition**: the attacker obtains a regular user account on the target LibreChat instance. Many public instances have self-signup enabled
2. **Malicious MCP server configuration**: registers an MCP server URL embedding `${CREDS_KEY}` / `${CREDS_IV}` / `${JWT_SECRET}` / `${MONGO_URI}` placeholders, pointed at an attacker-controlled domain
3. **Environment-variable expansion during validation**: the LibreChat server, during Zod schema validation of the URL, expands the placeholders against its own `process.env` values. No distinction exists between user input and operator configuration
4. **Exfiltration via connection**: the LibreChat server connects to the expanded URL, and the secrets are recorded in the attacker's server access logs as part of the URL
5. **Escalation to full compromise**: exfiltrated encryption keys enable decryption of stored credentials; the JWT secret enables token forgery; `MONGO_URI` enables direct database access

---

## 4. Structural Argument

This incident belongs to the `agent-infrastructure` category of Pillar 03 (Agent Authority Proof). The central failure primitive is that **the configuration value describing which external server an agent connects to is interpreted, as unverified user-supplied input, in the server's privileged context (`process.env`).** `identity-auth` is noted as secondary.

Brief 003 (Starlette/BadHost) shares the agent-infrastructure trust-boundary category but differs in direction. Brief 003 was a case where external HTTP Host header manipulation bypassed the **ingress** (authentication) of an MCP server; this incident is a case where the connection destination a user specifies becomes, on the **egress** side, a channel for exfiltrating secrets. What the two share is the structure in which the MCP agent-connection layer processes boundaries that conventional web applications had long established as input-validation targets (headers, user-supplied URLs) — now re-skinned as "agent configuration" and handled with privilege.

In the agent-infrastructure context, registering an MCP server is an authority act — it gives the agent new capabilities and new connection destinations. This incident shows that when that authority act is not verified for who authorized it and what scope of context it may access, a single configuration notation (placeholders) collapses the authority boundary.

---

## 5. The Structural Gap Detection Cannot Close

Vulnerability scanners, dependency audits, and egress monitoring are indispensable for addressing known CVEs and detecting anomalous communications, and this Brief does not dispute their role. This incident was also handled through the normal coordinated-disclosure path — advisory publication and same-day fix availability.

Detection, however, does not change the decision of which destination the server connects to and what it carries in that connection. The malicious communications in this incident are legitimate outbound HTTPS connections initiated by the LibreChat server itself. The destination is an attacker domain, but the communication pattern is indistinguishable from a normal MCP server connection attempt. The secrets travel inside the encrypted TLS URL path, making content inspection equally difficult to capture. What was absent was pre-execution verification of "who registered this MCP connection configuration, and what environmental context is it authorized to access" — and this is separate from communication monitoring. From an audit perspective as well, after exfiltration, no independent trail exists — beyond correlating access logs — to prove which secrets were sent, when, and through whose registered configuration.

Pre-execution attestation treats connection-destination registration on agent infrastructure as an authority act, and requires — before the configuration value is interpreted — an independently verifiable proof of "the registrant's authority" and "the scope of context the configuration may reference." If the proof reports that "this configuration references context (server environment variables) beyond the registrant's authority," the connection is blocked before execution (for the thesis on detection and pre-execution attestation, see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Response

- **LibreChat**: conducted coordinated disclosure via GitHub Security Advisory (GHSA-4pcc-j6m6-wcwx) and published fix version 0.8.4-rc1. The fix disables environment-variable expansion for user-supplied URLs
- **CISA / NVD**: SSVC assessment the day after publication (Exploitation: poc / Technical Impact: total); NVD analysis completed two days later — a fast cycle for an AI-infrastructure CVE
- **Cross-industry point**: AI chat and agent platforms with MCP integration became a CVE concentration area in 2026 (Brief 003 Starlette/BadHost, various MCP server authentication-absence survey reports, and others), and "at what trust level to treat agent-connection-layer configuration values" is emerging as a shared design challenge

With the spread of self-hosted AI platforms, this class of "configuration-value-mediated privileged-context access" is becoming a verification item for MCP client implementations generally — not specific to LibreChat.

---

## 7. Lemma's Analysis

For the structural gap exposed here — an agent's connection-destination configuration is interpreted in a privileged context without independent verification of the registrant's authority and the scope of context it may reference — Lemma offers a design that trails connection-destination registration and capability grants on agent infrastructure as authority acts, and verifies, before execution, "who authorized what, in what scope," as independently verifiable proofs. For the design philosophy of Agent Authority Proof, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) (Lemma).

---

## 8. Sources

- **GitHub Security Advisory**: "LibreChat Exfiltrates Server Secrets via MCP Server URL Injection" (GHSA-4pcc-j6m6-wcwx, 2026-06-02) — https://github.com/danny-avila/LibreChat/security/advisories/GHSA-4pcc-j6m6-wcwx
- **NVD**: CVE-2026-32625 (CVSS 9.6 Critical, analysis completed 2026-06-04) — https://nvd.nist.gov/vuln/detail/cve-2026-32625
- **CIRCL Vulnerability-Lookup**: CVE-2026-32625 (aggregated record including CISA SSVC assessment) — https://vulnerability.circl.lu/vuln/cve-2026-32625

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
