---
brief_no: 24
title: "不可視 Unicode による指示インジェクション — 目視と AI 入力の乖離"
title_en: "Invisible Unicode Instruction Injection — The Gap Between Human-Read and Model-Read Input"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2026-03-10
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["005-noroboto-lying-fonts", "003-starlette-badhost", "011-synthid-watermark-reverse-engineering", "025-mcp-stdio-config-to-command-rce", "026-adaptive-ai-worm-runtime-exploit"]
version: "1.0"
status: draft
og_lead_ja: "人が読む文字列とモデルが読む文字列が、検証層なしには一致を保証できない"
og_lead_en: "What humans read and what models read cannot be guaranteed identical without a verification layer"
---

## TL;DR

In 2026, the CSA (Cloud Security Alliance) AI Safety Initiative disclosed an instruction injection technique that embeds invisible Unicode characters into AI agent skills and tool definitions. Unicode Tag characters (U+E0000–U+E007F and related ranges) render as blank space — or nothing at all — in most editors and UIs, yet language models interpret them as meaningful content. An attacker can encode arbitrary instructions in these invisible characters and embed them inside skill files, tool descriptions, MCP metadata, and documents — within headings, at line endings, inside whitespace — entirely hidden from human review. In a related investigation, the Snyk ToxicSkills audit (2026-02) scanned 3,984 skills and found 36.82% with some security issue, 13.4% with critical issues, and 76 confirmed malicious payloads. This incident is the same primitive as Noroboto (No.005, lying fonts): **what a human reads ≠ what the model interprets**, realized through a different mechanism — invisible Unicode. This Brief examines the structure in which human review cannot serve as a safety guarantee when the origin and integrity of inputs reaching the AI are not independently verified.

What you saw ≠ what the model read

---

## 1. Incident Overview

- **Disclosure**: 2026, CSA AI Safety Initiative disclosed "Hidden Unicode Instruction Injection in AI Agent Skills." The researcher community (Embrace The Red, and others) reported the same class of technique
- **Technical nature**: Unicode Tag characters (U+E0000–U+E007F) are invisible to the human eye and to most editors, yet LLMs process them as semantic content. Arbitrary instructions are encoded in these invisible characters and embedded into skill files, tool descriptions, MCP metadata, and documents
- **Embedding locations**: headings, line endings, inside whitespace — positions undetectable during human review
- **Supply-chain corroboration (related investigation)**: Snyk ToxicSkills (2026-02) audited 3,984 skills, confirming 36.82% with issues, 13.4% with critical issues, and 76 malicious payloads. The audit quantified skills — reusable capability packages — as a supply-chain attack surface
- **Posture**: Not a specific incident of realized harm, but a technique disclosure and ecosystem audit. Demonstrates the limits of safety assurance predicated on human review

---

## 2. Timeline

- **2026-02-05**: Snyk published the ToxicSkills audit — 3,984 skills, 36.82% with some security issue, 13.4% critical, 76 malicious payloads confirmed
- **2026-03-10**: CSA AI Safety Initiative published the invisible Unicode instruction injection as a Research Note. Detection hooks (claude-hooks etc.) and mitigations began circulating in parallel
- **2026, ongoing**: Indirect prompt injection via skills / tool definitions / MCP metadata is taking shape as a principal input-integrity problem of the agent era

---

## 3. Attack Vector

This Brief does not provide reproducible payloads. The structural outline below is for understanding the threat model only.

1. **Encoding and embedding**: an attacker encodes arbitrary instructions in invisible Unicode characters and embeds them inside skill files, tool descriptions, documents, and the like
2. **Review evasion**: during distribution and onboarding, the characters do not render, so human review cannot detect the presence of malicious instructions. The assumption "what I see is safe" breaks down
3. **Model interpretation**: when the agent loads the skill or document, the model interprets the invisible characters as semantic content and may act on the embedded instructions
4. **Execution**: following the instructions, the agent may exfiltrate credentials, transmit data externally, perform out-of-scope operations, etc.
5. **Outcome**: because what the human reviewed and what the model followed have diverged, explaining or reproducing the behavior after the fact is difficult

---

## 4. Structural Argument

This incident is a representative case of a structure in which **the identity between what a human reads and what a model reads cannot be guaranteed without a verification layer.** Much AI safety assurance relies on "a human reviewed it," but if a gap can be manufactured between human perception and model interpretation, review ceases to function as a safety guarantee. The problem is not how the characters look; it is that the origin (where did this input come from?) and integrity (what was injected along the way?) of inputs reaching the AI are not independently verified.

Invisible ≠ absent

Brief 005 (Noroboto, lying fonts that decouple "on-screen text" from "the string the AI processes") belongs to the same primitive; this case realizes it through **invisible Unicode** — a different mechanism. Together they form a linked pair in the input-integrity cluster. Through the skills/metadata vector, this case also sits adjacent to Brief 003 (BadHost) and the MCP design issue (separate Brief) at the agent-infrastructure input boundary.

---

## 5. The Structural Gap Detection Cannot Close

For this class of technique, detection-side measures — invisible-character stripping, programmatic flagging of decode behavior, skill audits — have been proposed and shared alongside the research. These measures raise attacker cost and block known patterns, and this Brief does not dispute their role.

Detection, however, cannot itself independently prove, after the fact, that "the input the human reviewed and the input the model actually interpreted were identical." Stripping invisible characters is effective against known encodings, but it is not a layer that guarantees the origin and integrity of the input. When a new encoding or obfuscation emerges, detection is again reactive. This is a structurally independent gap beyond detection's reach.

As things stand, across the operational model for AI input verification, a layer that independently fixes the origin and integrity of the input the model interprets is not yet treated as a distinct layer. Pre-execution attestation closes the gap by inserting one step of provenance and integrity proof into the input ingestion path. Detection finds and removes dangerous inputs; pre-execution attestation fixes, independently of content inspection, that "the input the model processed reached it from a legitimate origin, unaltered." The two are complementary (for more on the relationship between detection and pre-execution attestation, see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Response

- **Research / industry bodies**: CSA and the researcher community disclosed the technique and shared mitigations — invisible-character stripping, input sanitization, skill audits
- **Supply-chain awareness**: skills / tool definitions / MCP metadata were quantitatively confirmed (ToxicSkills and others) as a supply-chain attack surface in the form of reusable "context." Demand for distribution-source verification and skill origin management is rising
- **Shifting center of gravity for input integrity**: interest is moving from safety assurance predicated on human review toward independent verification of the origin and integrity of the inputs the AI actually processes

The absence of a layer that independently verifies the origin and integrity of inputs reaching the AI is surfacing not as a single-tool problem but as an operational challenge spanning agents, RAG, and the skill supply chain.

---

## 7. Lemma's Analysis

For the structural gap exposed here — the identity between human-read and model-read input cannot be guaranteed without a verification layer — Lemma offers a design in which the origin and integrity of inputs reaching the AI are committed as independently verifiable cryptographic proofs.

- **Fixing input origin**: skills, tool definitions, documents, and other inputs are issued with a distributor (issuer) signature and bound to the original via docHash. At ingestion, the system verifies that the input arrived from a legitimate origin
- **Integrity proof**: the ingested input is committed with Poseidon over BN254, and the identity between the version the human reviewed and the version the model processes is proved via Groth16 (Circom circuits). Tampering — including invisible characters — surfaces as a mismatch against the commitment
- **Selective disclosure**: BBS+ over BLS12-381 discloses only "this input reached the model from a legitimate origin, unaltered" to the verifying side. The full input content need not be transmitted

Under this design, even invisible tampering like Unicode injections surfaces as an inconsistency the moment it is checked against the human-reviewed version. Detection (invisible-character stripping, audits) blocks known techniques; pre-execution attestation (origin and integrity fixing) provides independent verification of input identity — complementary layers.

Models change. Proofs remain.

For the design and scope, see the use cases [AI Document Isolation — Let AI Use Documents, Never Touch Raw Data](https://lemma.frame00.com/ja/solutions/use-cases/ai-document-isolation/) and [RAG Content Provenance](https://lemma.frame00.com/ja/solutions/use-cases/rag-content-provenance/), and [Pillar 02 — Verifiable AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/).

---

## 8. Sources

Sources are drawn from published research and industry-body materials. Specific payloads that would aid reproduction are omitted.

- **CSA AI Safety Initiative (primary)**: "Hidden Unicode Instruction Injection in AI Agent Skills" (2026-03-10) — https://labs.cloudsecurityalliance.org/research/csa-research-note-unicode-instruction-injection-ai-skills-20/
- **Researcher disclosure (secondary)**: Embrace The Red "Scary Agent Skills: Hidden Unicode Instructions in Skills" (2026) — https://embracethered.com/blog/posts/2026/scary-agent-skills/
- **Supply-chain audit (primary)**: Snyk "ToxicSkills: Comprehensive Security Audit of AI Agent Skills" (2026-02-05, 3,984 skills, 36.82%, 13.4% CRITICAL, 76 malicious payloads) — https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
