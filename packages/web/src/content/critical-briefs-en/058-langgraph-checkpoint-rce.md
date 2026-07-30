---
brief_no: 58
title: "AI エージェントが自分の記憶（チェックポイント）を検証せず読み込み、サーバーを乗っ取られた — エージェントの永続状態が、ロードの前に来歴も完全性も独立検証されない構造（LangGraph）"
title_en: "From State Store to RCE — When an AI Agent Trusts Its Own Checkpoint (LangGraph)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-12
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["027-librechat-mcp-url-secrets", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost", "037-agent-config-auto-execution"]
status: published
version: "1.0"
og_lead_ja: "エージェントが自分のチェックポイントを検証せず読み込み RCE — LangGraph"
og_lead_en: "An agent loads its own checkpoint unverified → RCE — LangGraph"
gap_detected: "Vulnerability scanners, dependency audits, and egress monitoring worked, so all three issues were handled as coordinated disclosure with fixed versions already available."
gap_missing: "There was no layer to check before reconstruction whether the state being reloaded was legitimate self-state, written under proper authority and free of tampering, so injected forged rows were reloaded through the same path as legitimate state."
gap_fix: "Before a high-risk action, independently verify with Lemma that this checkpoint originates from authorized execution and is free of tampering, and prevent it up front."
---

## 1. TL;DR

In June 2026, Yarden Porat (Check Point Research) disclosed LangGraph vulnerabilities: chaining CVE-2025-67644 (SQL injection in the SQLite checkpointer) with CVE-2026-28277 (unsafe msgpack deserialization) achieves remote code execution. The attacker slips a forged row into the checkpoint (the agent's "memory"), and the moment the agent deserializes that state back unverified, arbitrary code runs. Vulnerability scanners and patching cannot reach a structure in which the agent reconstructs its own persistent state in a privileged context without verifying provenance or integrity.

---

## 2. What happened

- **Subject**: Self-hosted LangGraph (LangChain's stateful / multi-agent platform). Deployments using the SQLite or Redis checkpointer that accept a user-supplied `filter` input are affected
- **Identifiers and severity**:
  - CVE-2025-67644 (CVSS 7.3) — SQL injection in the SQLite checkpointer; queries can be manipulated via metadata filter keys (`_metadata_predicate()` interpolates filter keys directly into an f-string without validation). Affects `langgraph-checkpoint-sqlite` < 3.0.1
  - CVE-2026-28277 (CVSS 6.8) — unsafe msgpack deserialization; loading a checkpoint reconstructs objects when an attacker can modify the checkpoint data. Affects `langgraph` ≤ 1.0.9
  - CVE-2026-27022 (CVSS 6.5) — RediSearch query injection in `@langchain/langgraph-checkpoint-redis`; can bypass access control. Affects < 1.0.2
- **The chain**: CVE-2025-67644 and CVE-2026-28277 chain into RCE. Preconditions: the app exposes the `get_state_history()` endpoint and accepts a user-controlled filter input
- **Bounded scope**: LangChain's managed platform (LangSmith Deployment, on PostgreSQL) is not affected. The vulnerabilities are limited to self-hosted deployments
- **Exfiltration / reachable targets**: On success — the LLM API keys, customer data, conversation history the agent handles, and credentials for external systems (CRM, internal APIs). LangGraph frames CVE-2026-28277 as "post-exploitation," a threat model that presumes write access to the checkpoint store
- **Exploitation status**: All three patched. Fixed in `langgraph-checkpoint-sqlite` 3.0.1+, `langgraph` 1.0.10+, and `@langchain/langgraph-checkpoint-redis` 1.0.2+

The chained RCE works on self-hosted deployments that expose `get_state_history()` and accept a user-controlled filter. The path:

1. **Prepare the payload**: The attacker prepares a msgpack payload containing instructions that execute arbitrary code
2. **Inject a forged row via SQL injection**: A malicious filter parameter exploits the SQL injection in the SQLite checkpointer, making the query return a "forged checkpoint row" whose `checkpoint` column holds attacker-controlled serialized data
3. **Trigger deserialization**: As the app processes the query result, it deserializes that malicious checkpoint BLOB
4. **Code execution**: The unsafe msgpack deserialization runs the attacker's payload on the server (RCE)
5. **Expansion into the privilege context**: Secrets reachable from the agent runtime (LLM API keys, conversation history) and credentials for systems the runtime can reach (CRM, internal APIs) are exposed

Check Point's point is that a classic vulnerability class — SQL injection — **gains force when it fires inside a high-privilege, high-trust AI agent platform.**

---

## 3. Timeline — disclosure and response

- 2026-06-12: Check Point Research's Yarden Porat discloses the three vulnerabilities, with a same-day technical write-up including a proof-of-concept of the chained RCE
- Same day: The Hacker News and others report. LangGraph maintainers frame CVE-2026-28277 as post-exploitation and note the managed (LangSmith) configuration is unaffected
- All handled as coordinated disclosure with patches available

> Note: Some aggregator databases vary on related CVE numbers (e.g. pickle deserialization in a checkpoint caching layer). This text follows the primary GitHub Security Advisories and Check Point Research.

The response and industry movement after disclosure:

- **LangChain / LangGraph**: Disclosed all three with patches and provided fixed versions. Frames CVE-2026-28277 as post-exploitation (presuming write access to the checkpoint store) and notes the managed configuration (LangSmith Deployment) is unaffected
- **Recommended mitigations**: Apply the latest patches, implement authentication on self-hosted LangGraph servers, avoid long-lived static secrets, segment the network, and **treat AI agents as privileged identities under least privilege (PoLP)**
- **Cross-industry point**: MCP and agent platforms have become a CVE-dense area in 2026 ([Brief 003](/critical/briefs/003-starlette-badhost/) Starlette/BadHost, [Brief 025](/critical/briefs/025-mcp-stdio-config-to-command-rce/) the MCP reference SDK, [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) LibreChat), and "at what trust level to handle the data layer specific to agent platforms (connection config, persistent state, memory)" has surfaced as a shared design problem

With the spread of self-hosted agent platforms, "verifying the provenance and integrity of the state/memory store" is becoming a verification item for stateful agent implementations in general, not specific to LangGraph.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the agent interprets its own persistent state (the checkpoint) in a privileged runtime context without verifying its provenance and integrity."** A checkpoint is the agent's "memory," and on resume the agent reads it back as legitimate self-state. But with no layer that verifies, before execution, "when, under whose authority, and tamper-free this state was written," a forged row injected into the state store converts straight into code execution.

As in [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) (LibreChat), it is a structure in which "data that describes config/state is interpreted unverified in a privileged context" on an agent platform. In 027, a user-specified **connection config** was expanded in a privileged context (`process.env`); here, the agent's own **persistent state** is reconstructed into the runtime without verification — both cases share that "a data layer specific to agent platforms (config / state) passes straight through the input-validation boundary that traditional web apps had established, wearing the agent's skin." Where [Brief 003](/critical/briefs/003-starlette-badhost/) (Starlette/BadHost) addressed the **entrance** of a connection (auth bypass) and [Brief 025](/critical/briefs/025-mcp-stdio-config-to-command-rce/) (the MCP SDK design) an RCE path inherent in the reference implementation, this case highlights that no trust boundary is drawn around the **origin of the agent's state.**

In the agent-platform context, writing and reading back a checkpoint is equivalent to "handing the agent its past decisions and privilege context." When that hand-off happens without verifying the state's authorship and integrity, a single state-store layer collapses the authority boundary.

Vulnerability scanners, dependency audits, egress monitoring, and prompt CVE patching all functioned here. All three were handled as coordinated disclosure with patches available, and this Brief does not deny the role of the detection layer or patch operations.

At the same time, detection does not change the judgment of "may the agent trust the state it is reading back right now as legitimate self-state." The exploitation happens inside the agent's own legitimate query and deserialization against its checkpoint store. As traffic, it is indistinguishable from the agent's normal operation, and the injected forged row is read back via the same path as "correctly saved state." Pattern-matching for SQL injection plugs individual entrances, but it provides no material to establish the provenance and integrity of the state — "under whose authority, and tamper-free, was this state written." From an audit standpoint, too, evidence that independently shows "which state was reconstructed into the runtime, when, by whose write" rarely survives beyond reconciling app logs.

After-the-fact detection and remediation by vulnerability scanners and dependency audits (detection), and independently verifying the authorship and integrity of the state before the checkpoint is read back (pre-execution attestation), are **complements**, not substitutes: the former works on discovering known vulnerabilities and applying patches, the latter on breaking the chain by which an injected forged state is read back as legitimate self-state and converts into code execution.

---

## 5. What proof would have changed

Pre-execution attestation treats reading the agent's state back as an authority-bearing action, and requires, before the state is reconstructed, an independently verifiable proof of the state's authorship (which agent / run wrote it) and integrity (no tampering). If the proof does not satisfy "this checkpoint derives from an authorized run and is untampered," the state load is blocked before execution.

Against the gap this incident exposed — the agent reconstructs its own persistent state into a privileged context without verifying provenance and integrity — Lemma proposes a design that records the writing and reading-back of state as authority-bearing actions and requires an independently verifiable proof before reconstruction.

- **Binding state authorship**: Bind a checkpoint to "which agent, which run, under what authority" wrote it, fixing the authorization of the write as a verifiable attribute
- **Pre-execution integrity verification**: Before the state is reconstructed into the runtime, cryptographically verify it is untampered; an injected forged row cannot be read back through the same path as legitimate self-state
- **Reading-back as an authority-bearing action**: Treat a state load as an authority-bearing action rather than mere I/O — if the proof does not satisfy "this checkpoint derives from an authorized run and is untampered," it is blocked before execution
- **Selective disclosure**: Prove only that "the state was legitimately written and is untampered," with minimal disclosure, without exposing the state's contents (conversation history, secrets) outside

After-the-fact detection by vulnerability scanners and dependency audits (detection), and independently verifying the authorship and integrity of state before it is read back (pre-execution attestation), work as complements, not substitutes.

---

## 6. Sources

- **Check Point Research (primary, researcher write-up)**: "From SQLi to RCE: Exploiting LangGraph's Checkpointer" (Yarden Porat, 2026-06) — <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **Check Point Blog (primary, vendor)**: "When Your AI Agent's Memory Becomes a Security Liability" — <https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/>
- **GitHub Security Advisory**: CVE-2025-67644 (GHSA-9rwj-6rc7-p77c) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c>
- **GitHub Security Advisory**: CVE-2026-28277 (GHSA-g48c-2wqr-h844) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844>
- **The Hacker News**: "LangGraph Flaw Chain Exposes Self-Hosted AI Agents to Remote Code Execution" (2026-06-12) — <https://thehackernews.com/2026/06/langgraph-flaw-chain-exposes-self.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/), [Trust402](https://lemma.frame00.com/trust402/)
