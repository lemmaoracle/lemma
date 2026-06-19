---
brief_no: 25
title: "MCP の設定→コマンド実行という設計と、供給網規模の RCE — 特定言語の実装バグではなく、対応言語を横断するリファレンス SDK の設計に内在"
title_en: "MCP Design: Config-to-Command Execution and Supply-Chain-Scale RCE — Not a single-language implementation bug but inherent in the reference SDK design across supported languages"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-04-20
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["003-starlette-badhost", "006-google-api-key-revocation-lag", "024-invisible-unicode-instruction-injection", "026-adaptive-ai-worm-runtime-exploit"]
version: "1.0"
status: draft
og_lead_ja: "エージェント基盤の信頼境界が、リファレンス実装の設計段階で検証されない構造"
og_lead_en: "Agent infrastructure trust boundaries, unverified at the reference implementation design level"
---

## TL;DR

In April 2026, OX Security disclosed that Anthropic's Model Context Protocol (MCP) official SDK contains a design-level issue in which configuration flows directly into command execution, enabling RCE. The issue is not a single-language bug but **inherent in the reference SDK's design across Python, TypeScript, Java, and Rust.** The reported impact spans over 150M cumulative downloads, 7,000+ publicly listed servers, and up to ~200K instances. Multiple independently reported CVEs trace to the same core issue (CVE-2026-30623 and others), and the CSA consolidated the picture under "MCP by Design: RCE Across the AI Agent Ecosystem." Anthropic did not alter the core architecture, characterizing the behavior as "expected." This Brief examines the structure in which agent-infrastructure trust boundaries — where configuration stops being merely accepted and starts being treated as authorized execution — propagate through the entire supply chain without independent verification at the reference-implementation design level.

Accepted the config ≠ authorized the execution

---

## 1. Incident Overview

- **Disclosure**: 2026-04, OX Security disclosed a design-level issue in the MCP official SDK ("The Mother of All AI Supply Chains"). CSA and multiple media outlets followed
- **Technical nature**: Not an implementation-specific bug, but an issue described as inherent in the MCP STDIO interface's design of "configuration flowing directly into command execution." Cross-cutting across supported languages (Python / TS / Java / Rust)
- **Reported impact**: Over 150M cumulative downloads, 7,000+ publicly listed servers, up to ~200,000 instances
- **Related CVEs (independently reported)**: MCP SDK command injection CVE-2026-30623, MCP Inspector CVE-2025-49596, LibreChat CVE-2026-22252, Cursor CVE-2025-54136, and others — organized as the same core issue series
- **Vendor response**: Anthropic did not alter the core architecture, and the behavior was reported to be characterized as "expected." The result: the reference implementation continues to propagate the same pattern

---

## 2. Timeline

- **2025–2026**: MCP spread rapidly as the de facto standard for agent interoperability. Individual vulnerabilities (Inspector, various server implementations) were reported intermittently
- **~2026-04-20**: OX Security disclosed the core SDK design issue. CSA consolidated the picture under "MCP by Design: RCE Across the AI Agent Ecosystem"
- **2026-04**: The Hacker News, Infosecurity Magazine, and others reported ("150M DL," "7,000+ servers," "up to 200,000 instances")
- **Thereafter**: CVEs rooted in the same core issue continued to be reported across implementations

---

## 3. Attack Vector

This Brief does not provide reproducible procedures. The structural outline below is for understanding the trust-boundary model only.

1. **Configuration acceptance**: MCP servers / clients accept externally sourced configuration — tool definitions, launch settings, and other composition data
2. **Direct config-to-execution coupling**: across the STDIO interface, accepted configuration flows directly into execution (command launch) without an independent authority verification step interposed
3. **Supply-chain propagation**: because this design is inherent in the reference SDK, every implementation built with the SDK (thousands to tens of thousands) inherits the same pattern. Consumers accept it under the implicit assumption that "the official SDK is safe"
4. **Exploitation realized**: any path that allows manipulation of configuration data can, through the direct config-to-execution coupling, realize RCE. Sensitive data, internal databases, API keys, and conversation histories become accessible
5. **Outcome**: fixing a single implementation does not close the issue; unless addressed at the design and reference-implementation level, the risk persists across the supply chain

---

## 4. Structural Argument

This incident is a representative case of a structure in which **agent-infrastructure trust boundaries are not independently verified at the reference-implementation design level.** "A configuration was accepted" and "that configuration is authorized for execution" are distinct judgments, but the direct config-to-execution coupling treats them as identical. Because the verification layer exists only outside the design, whether a given configuration rests on legitimate authority is never asked at the point of execution.

Accepted ≠ authorized

Brief 003 (Starlette/BadHost, HTTP Host header manipulation bypassing MCP server authentication) belongs to the same Agent Infrastructure primitive; this case sits at the cluster's center because the trust-boundary issue manifests **not in an individual implementation but at the reference-design level.** The pattern seen in Brief 006 (Google API key revocation lag) — a vendor characterizing the behavior as "expected" — reappears here, underscoring the need for a layer on the consumer side that independently verifies trust boundaries.

---

## 5. The detection–proof gap

In this case, detection and disclosure by OX Security, CSA, and individual CVE reporters functioned effectively, making the supply-chain-wide issue visible. Vulnerability scanning, runtime monitoring, and supply-chain SBOMs are indispensable for impact scoping and remediation, and this Brief does not dispute their role.

Detection, however, cannot change the design itself — the direct config-to-execution coupling. When the vendor characterizes the behavior as "expected," consumers are left operating atop the vulnerable design. Runtime monitoring may catch indicators of abuse, but it does not provide material that independently proves, at the point of execution, that "this configuration rests on legitimate authority." This is a structurally independent gap beyond detection's reach.

As things stand, across the operational model for agent infrastructure, a layer that independently verifies configuration and composition against authority before execution is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of authority proof into the config-to-execution path. Pre-execution attestation is not a replacement for detection but a **complement**; together the two layers establish the trust boundary for agent infrastructure.

---

## 6. Response and Industry Response

- **Research / industry bodies**: OX Security's disclosure and CSA's consolidation positioned the MCP design-level issue as a supply-chain-wide topic. Multiple independent CVE reports corroborated the breadth of the same core issue
- **Vendor response**: The core architecture was not altered, and the behavior was reported to be characterized as "expected." The structure in which the reference implementation continues to propagate the same pattern remains
- **Consumer-side movement**: Practices that reinforce trust boundaries on the consumer side — MCP server / client privilege separation, configuration provenance verification, pre-execution scope checks — are spreading

The absence of a layer that independently verifies agent-infrastructure trust boundaries before execution is surfacing not as a single-vendor problem but as a cross-ecosystem operational challenge for MCP adopters.

---

## 7. Lemma's Analysis

Lemma itself participates in the MCP ecosystem and offers an MCP server (publicly listed on Smithery); this Brief does not repudiate MCP. The point is that the "agent-interoperability convenience" MCP spread has **not, as a standard, been accompanied by a layer that independently verifies trust boundaries.** Lemma offers a design that supplements that layer as Agent Authority Proof (Pillar 03).

- **Configuration and delegation trail**: tool definitions, launch configuration, and delegation relationships are issued with an issuer signature and committed with Poseidon over BN254. The configuration's provenance and version are fixed via docHash
- **Pre-execution authority verification**: instead of coupling configuration directly to execution, the system verifies — via Groth16 (Circom circuits) — that the configuration falls within the legitimate delegation scope before execution. Out-of-scope configurations are refused before execution
- **Selective disclosure**: BBS+ over BLS12-381 discloses only "this configuration rests on authorized delegation" to the verifying side. The full delegation chain and internal composition are not transmitted

Under this design, the config-to-execution path has one step of independent authority verification interposed. Detection (vulnerability scanning, runtime monitoring) serves post-disclosure remediation; pre-execution attestation (pre-execution authority verification) fixes the trust boundary — complementary layers.

Data doesn't move. Proofs do.

Models change. Proofs remain.

---

## 8. Sources

Sources are drawn from published research, industry-body materials, and regulatory reports. Details that would aid reproduction are omitted.

- **OX Security (primary research)**: "The Mother of All AI Supply Chains: Critical, Systemic Vulnerability at the Core of Anthropic's MCP" (2026-04) — https://www.ox.security/blog/the-mother-of-all-ai-supply-chains-critical-systemic-vulnerability-at-the-core-of-the-mcp/
- **CSA (primary, industry body)**: "MCP by Design: RCE Across the AI Agent Ecosystem" (2026-04-20) — https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-by-design-rce-ox-security-20260420-csa/
- **Press (secondary)**: The Hacker News "Anthropic MCP Design Vulnerability Enables RCE" (2026-04) — https://thehackernews.com/2026/04/anthropic-mcp-design-vulnerability.html / Infosecurity Magazine "Systemic Flaw in MCP Protocol Could Expose 150 Million Downloads"
- **CVE references (primary)**: CVE-2026-30623 (MCP SDK command injection, liteLLM advisory), and other CVEs in the same series

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
