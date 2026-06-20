---
brief_no: 3
title: "Starlette CVE-2026-48710 (BadHost) — HTTP Host ヘッダー操作による MCP server 認証回避"
title_en: "Starlette CVE-2026-48710 (BadHost) — MCP Server Authentication Bypass via HTTP Host Header Manipulation"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-27
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["004-megalodon-github-supply-chain"]
version: "1.0"
status: published
og_lead_ja: "Host ヘッダー操作で MCP server の認証を回避 — Starlette CVE-2026-48710 (BadHost)"
og_lead_en: "Host header manipulation bypassed MCP server auth — Starlette CVE-2026-48710 (BadHost)"
gap_detected: "The discoverer released an online scanning tool that identifies affected servers running vulnerable versions."
gap_missing: "Altering a single character in the request's destination information let an attacker slip past the authentication gate that should have stopped them, without ever confirming whose legitimate request it was before the action."
gap_fix: "Before accessing an external resource, independently verify with Lemma who issued the request, with what authority, and to what extent, and prevent it up front."
---

## TL;DR

Starlette CVE-2026-48710 (BadHost) was disclosed: a single-character insertion in the HTTP Host header diverges the router's resolved path from the path the middleware sees, slipping past path-based authentication. It propagates across most of the Python AI ecosystem — FastAPI, MCP servers, and more. A scanner for vulnerable versions is useful, but the path-based auth scheme itself never independently verifies the trust boundary, so a framework patch alone falls short. Missing was a layer verifying request origin and authority before the action. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident Overview

- **Vulnerability ID**: CVE-2026-48710 (also known as BadHost)
- **Disclosure date**: 2026-05-27
- **Discoverer**: X41 D-Sec (Markus Vervier)
- **Scope**: Starlette and Python packages built on it
  - Direct impact: FastAPI, vLLM, LiteLLM, Text Generation Inference
  - Indirect impact: Most OpenAI-compatible proxies, MCP servers, agent harnesses, evaluation dashboards, model management UIs
- **Download scale**: Starlette alone receives 325 million downloads per week (as of May 2026)
- **CVSS score**: 7/10. Both X41 D-Sec and Secwest assess this as significantly underestimating the severity
- **Fix release**: Patched in Starlette 1.0.1
- **Detection tool**: An online scanner for identifying affected servers is available at mcp-scan.nemesis.services

---

## 2. Timeline

- 2026-05-27: X41 D-Sec discloses CVE-2026-48710; Starlette 1.0.1 ships the same day
- 2026-05-27: Ars Technica publishes first reporting; GIGAZINE follows up in Japanese
- 2026-05-27: X41 D-Sec publishes the mcp-scan.nemesis.services online scanner
- 2026-05-27: Secwest publishes a comment noting that the CVSS rating is underestimated

---

## 3. Attack Vector

1. **Initial compromise**: The attacker sends a normal HTTP request to a public endpoint of a target MCP server or Starlette-based application, intentionally inserting a single character into the Host header
2. **Routing divergence**: Starlette's routing algorithm resolves endpoints based on the HTTP path. The `request.url.path` attribute provided to middleware and endpoints, however, is based on a "reconstructed URL" and does not match the path actually requested over HTTP
3. **Authentication bypass**: Path-based authentication middleware (controlling access to `/admin` and similar) reads `request.url.path`, while routing resolves endpoints against the actual HTTP path. The path the middleware lets through and the path the endpoint resolves to diverge, and the attacker reaches the protected endpoint without authentication
4. **Credential exfiltration**: From the now-authentication-bypassed MCP server, the attacker exfiltrates the credentials retained for external-resource access: API keys, tokens, SSH keys, database connection strings, and so on
5. **Lateral movement**: The exfiltrated credentials are used to pivot into connected external systems — cloud, databases, mail, IoT, industrial equipment

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, in the HTTP layer (Starlette) that powers AI agents, **the divergence between "the path the router resolves" and "the path the middleware sees" was left in place, detached from the authentication layer**. A design that does not independently verify the trust boundary inside the framework is broken by the minimal input manipulation of inserting a single character into the HTTP Host header.

The primitive differs from Brief 001 (KelpDAO / rsETH) and Brief 002 (Stake DAO) — the target here is an HTTP request rather than a cross-chain message — but the underlying structure is the same: **a trust assertion (path-based authentication in this case) is detached from the layer that verifies it**. The earlier Briefs concerned the trust source for cross-chain messages; this incident concerns the trust source for HTTP paths. Both share the structure of absent independent verification at the trust boundary.

---

## 5. The detection–proof gap

The mcp-scan.nemesis.services scanner X41 D-Sec released identifies affected servers by detecting the vulnerable version. This is detection of "whether the vulnerability is present," and it is operationally useful. This Brief does not deny the role of detection vendors.

That said, the root cause is that the path-based authentication scheme itself does not independently verify the trust boundary. The Starlette 1.0.1 patch corrects the specific divergence, but in a world where AI agents access external resources over HTTP, a higher-level trust-boundary verification — one that does not rely on framework-side bug fixes — is essential.

Reframed in pre-execution attestation terms, the requirement is a design that embeds "agent / authenticated subject / delegated scope" into the HTTP request itself as an independently verifiable cryptographic proof. Rather than letting the framework determine what to accept, a separate channel proves what should be accepted. The severity X41 D-Sec characterized as "underestimated at CVSS 7" derives, essentially, from the scale of this structural absence.

In a case like this Host-header authentication bypass, after-the-fact detection and correction (detection) and pre-execution attestation — independently verifying origin and authorization before the action — **complements**, not substitutes for, one another (the core of the brand). Proving that an MCP server's request is legitimate before it reaches an external resource does not replace the work of detecting vulnerable versions; it functions alongside it.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and Industry Developments

- **Starlette**: Released version 1.0.1 with the BadHost fix. Restores consistency between `request.url.path` and the actual HTTP path
- **X41 D-Sec**: Released mcp-scan.nemesis.services, providing a cross-AI-agent-ecosystem scanning channel
- **Secwest**: Publicly raised concern over the CVSS rating
- Products built on FastAPI, vLLM, LiteLLM, or Text Generation Inference need immediate dependency updates. As X41 D-Sec's "severity is extremely high" assessment indicates, organizations operating MCP servers in particular need a comprehensive reassessment of exposure

The "data at risk" categories X41 D-Sec enumerated illustrate the reach of this incident: biopharma AI (clinical trial databases, M&A data, SSRF), identity verification (face analysis, KYB, live PII, internal codebases), IoT and industrial equipment (pivot-via-SSH, RCE), mail and SaaS, HR and recruiting, CMS and marketing, document management, cloud monitoring, cybersecurity (asset inventory, live nuclear-scanner access), and personal health and financial data. The reach reinforces the current reality that MCP servers are being positioned as "the hinge into all enterprise data."

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (the absence of a layer that places agent / authenticated subject / delegated scope onto the HTTP request itself as a proof), Lemma proposes a design that embeds, at the point an agent makes an HTTP request to an external resource, an independently verifiable cryptographic proof of "who," "with what authority," "up to where," "against which resource" — so that the receiver can make accept decisions by reading the proof, not the config or the path. Even if a path-resolution bug exists in the framework, the proof tells the receiver through a separate channel whether the request was generated under a legitimate delegation relationship or not.

For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **CVE-2026-48710 official record** (MITRE CVE) — Description of the BadHost vulnerability and CVSS rating. https://www.cve.org/CVERecord?id=CVE-2026-48710
- **X41 D-Sec advisory and MCP scanner** (X41 D-Sec official) — The public mcp-scan.nemesis.services scanner and the technical advisory. https://mcp-scan.nemesis.services/
- **Starlette 1.0.1 release notes** (framework official, GitHub release) — Patch landing for BadHost. https://github.com/Kludex/starlette/releases/tag/1.0.1
- **Ars Technica analysis**: "Millions of AI agents imperiled by critical vulnerability in open source package" (2026-05-27, independent reporting) — https://arstechnica.com/information-technology/2026/05/millions-of-ai-agents-imperiled-by-critical-vulnerability-in-open-source-package/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
