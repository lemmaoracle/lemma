---
brief_no: 58
title: "LangGraph：エージェントが保存した状態（チェックポイント）を読み込むときに、コードが実行される経路が示された(Check Point Research)"
title_en: "LangGraph: Researchers showed code running when an agent loads its saved state (Check Point Research)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "ai-decision-integrity"]
incident_date: 2026-06-12
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["139-agent-framework-trust-boundary-checkpoint", "027-librechat-mcp-url-secrets", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost", "037-agent-config-auto-execution"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "LangGraph のチェックポイントに 3 件の脆弱性、2 件の連鎖で遠隔コード実行"
og_lead_en: "Three LangGraph checkpoint flaws; two chain into RCE (Check Point)"
og_kicker_ja: "脆弱性の開示 · エージェント基盤"
og_kicker_en: "DISCLOSURE · AGENT CHECKPOINTS"
og_headline_ja: "チェックポイントの\n読み込みで、\nコードが実行される\n<accent>経路を研究者が報告</accent>"
og_headline_en: "Loading saved agent state\ncan run attacker code,\n<accent>researchers report.</accent>"
key_figures:
  - value: "3"
    unit: "flaws"
    label: "LangGraph vulnerabilities disclosed by Check Point Research's Yarden Porat. Two of them chain into remote code execution"
    tone: "alert"
  - value: "7.3"
    unit: "CVSS"
    label: "The highest severity of the three (CVE-2025-67644, SQL injection in the SQLite checkpointer)"
  - value: "2026-06-12"
    label: "Disclosure of all three, handled as coordinated disclosure with fixed versions already available"
glossary:
  - term: "Checkpoint"
    desc: "A feature that saves an agent's mid-run state and loads it when processing resumes. It works as the agent's \"memory.\""
  - term: "Deserialization"
    desc: "Turning saved data back into something a program can use. If the value being loaded is unsafe, its contents can be executed."
insight:
  slug: "self-state-unchecked"
  label: "Provenance of the state being loaded"
  quote: "A value an agent loads as its own saved state can pass straight into trusted processing, even if it was injected, unless its provenance and integrity are checked."
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "Before loading, confirm that a checkpoint is one the agent itself saved"
takeaway: "No step has been disclosed that checks a checkpoint's provenance and integrity before the state is loaded."
self_check: "Before an agent loads its saved state, can you check that the state was written by an authorized run and has not been tampered with?"
countries: ["global"]
---

## 1. Summary

Researchers at Check Point Research showed a path by which attacker code can run when an agent on LangGraph, LangChain's agent platform, loads its saved state (a checkpoint). A forged row slipped into a checkpoint query is loaded through the same path as legitimately saved state. Self-hosted deployments are affected, and all three issues have fixed versions. <strong>A value an agent loads as its own saved state can pass straight into trusted processing, even if it was injected, unless its provenance and integrity are checked.</strong>

## 2. What got through

- **What got through**: Querying and loading checkpoints. The researchers describe chaining SQL injection in the SQLite checkpointer, where filter keys are inserted into the query without validation (CVE-2025-67644), with unsafe msgpack deserialization when a checkpoint is loaded (CVE-2026-28277), to reach remote code execution. The precondition is that the app exposes `get_state_history()` and accepts a user-controlled filter input. In the Redis checkpointer, a query injection that can bypass access control was shown (CVE-2026-27022).
- **What reached the receiving side**: The agent loads the checkpoint rows a query returns as state it legitimately saved itself. From the loading side, it cannot tell whether a row was written by an authorized run or injected through the query. According to the researchers, on success the attacker reaches the LLM API keys, customer data and conversation history the agent handles, and credentials for external systems such as a CRM or internal APIs.
- **Not disclosed**: Whether any in-the-wild exploitation occurred. LangGraph frames CVE-2026-28277 as a "post-exploitation" issue that presumes write access to the checkpoint store. The chained remote code execution is Check Point Research's account.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the side loading the state checks, before loading it, which run the state came from and whether it was tampered with, against the record of how it was saved.

- **Who approves**: The owner of the authorized run that wrote the state. The approval is given apart from the bytes of the state being loaded.
- **Where it is checked**: Just before a checkpoint is loaded and restored into the runtime.
- **What is recorded**: Which state was loaded, when, and as written by which run. Kept apart from the checkpoint store.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking a state's provenance and integrity before loading a checkpoint, and keeping a record. Detection means finding, reporting and fixing a vulnerability. The order below follows what Check Point Research and LangGraph published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before loading, check the state's provenance and integrity</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>A forged row slipped into a query is loaded<br>through the same path as legitimate state</span></div>
<div class="rx-zone det"><b>Detection · researchers found and disclosed</b>Published as coordinated disclosure with fixed versions available</div>
<div class="rx-g g1"><div class="t">Before disclosure</div><b>Fixes for all three provided</b></div>
<div class="rx-g g2"><div class="t">2026-06-12</div><b>Check Point Research discloses the three</b></div>
<div class="rx-g g3"><div class="t">Same day</div><b>LangGraph says managed deployments are unaffected</b></div>
<div class="rx-g g4"><div class="t">After</div><b>Patching, authentication and least privilege recommended</b></div>
</div>
</figure>

Detection and fixing worked. But a step that checks, at load time, the provenance of the state an agent loads is not visible in the disclosures. Cases where data describing config or state on an agent platform is interpreted as-is in a privileged context also appear in [Brief 027](/critical/briefs/027-librechat-mcp-url-secrets/) (connection config) and [Brief 025](/critical/briefs/025-mcp-stdio-config-to-command-rce/). A later, broader presentation that includes the same LangGraph checkpoint is covered in [Brief 139](/critical/briefs/139-agent-framework-trust-boundary-checkpoint/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before an agent loads a checkpoint.** It does not look for the vulnerability itself; it checks, before loading, which run the state came from and whether it was tampered with, against a record.

### Industries and operations to watch

- **Industry · AI & development**: Organizations that self-host agent platforms such as LangGraph to build agents.
- **Operation · Saving agent state**: Saving mid-run state with checkpoints and loading it to resume processing or to look up history.

### Current controls vs Lemma

The routes in this case are two: column 1 (a checkpoint query that accepts filter input) and column 2 (loading the state the query returns).

| Control | Checkpoint query | Loading state |
| --- | --- | --- |
| Applying the fixed version | Effective | Effective |
| Authentication on the self-hosted server | Partial | Not relevant |
| Network segmentation | Partial | Not relevant |
| **Lemma (pre-execution check)** | Not relevant | Effective |

Applying the fixed versions closes the three issues that were shown. Authentication on the self-hosted server and network segmentation narrow who can send filter input, but do not change what a received query contains. Lemma does not touch how the query is built; before loading, it checks that the state was written by an authorized run and has not been tampered with.

Note: Lemma's check works only when it is built into checkpoint loading and the records of which run wrote a state are managed apart from the checkpoint store. What the check can show is the provenance and integrity of the state being loaded, not whether the content an authorized run wrote was appropriate. It does not detect or fix SQL injection or deserialization vulnerabilities. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in organizations that self-host agent platforms

- Before loading a checkpoint, do you confirm that it was saved by an authorized run and has not been tampered with?
- Do you avoid exposing, without authentication, endpoints like `get_state_history()` that query checkpoints from user input?
- Do you limit the API keys and external-system credentials held by the agent runtime to least privilege?

## 5. Facts and timeline

- **Researcher**: Check Point Research's Yarden Porat disclosed three LangGraph vulnerabilities on 2026-06-12, and published a same-day technical write-up including a demonstration of remote code execution chaining CVE-2025-67644 and CVE-2026-28277.
- **The three issues**: CVE-2025-67644 (CVSS 7.3) is SQL injection in the SQLite checkpointer; queries can be manipulated via metadata filter keys. Affects `langgraph-checkpoint-sqlite` < 3.0.1. CVE-2026-28277 (CVSS 6.8) is unsafe msgpack deserialization; when an attacker can modify checkpoint data, loading triggers object reconstruction. Affects `langgraph` ≤ 1.0.9. CVE-2026-27022 (CVSS 6.5) is RediSearch query injection in `@langchain/langgraph-checkpoint-redis` that can bypass access control. Affects < 1.0.2.
- **Scope**: Affected are self-hosted deployments that use the SQLite or Redis checkpointer and accept user-supplied filter input. LangChain's managed platform (LangSmith Deployment, on PostgreSQL) is stated to be unaffected.
- **LangGraph's framing**: It describes CVE-2026-28277 as a "post-exploitation" issue that presumes write access to the checkpoint store.
- **The researchers' view**: Check Point's point is that a classic vulnerability class, SQL injection, has greater impact when it fires inside a high-privilege, high-trust AI agent platform.

### Timeline

- **Before disclosure**: Fixes for all three were prepared, so the issues were handled as coordinated disclosure with fixed versions available.
- **2026-06-12**: Check Point Research's Yarden Porat discloses the three issues and publishes a technical write-up.
- **2026-06-12 (same day)**: The Hacker News and others report. LangGraph maintainers frame CVE-2026-28277 as post-exploitation and say the managed (LangSmith) configuration is unaffected.

> Some aggregator databases vary on related CVE numbers (e.g. pickle deserialization in a checkpoint caching layer). This text follows the GitHub Security Advisories and Check Point Research. Whether any in-the-wild exploitation occurred is not known from the disclosures above. This Brief does not blame any vendor. What has not been disclosed does not mean there were no controls.

### After disclosure

- **LangChain / LangGraph**: Fixed all three (`langgraph-checkpoint-sqlite` 3.0.1+, `langgraph` 1.0.10+, `@langchain/langgraph-checkpoint-redis` 1.0.2+).
- **Mitigations named in the disclosures**: Apply the latest fixes, implement authentication on self-hosted LangGraph servers, avoid long-lived static secrets, segment the network, and treat AI agents as privileged identities under least privilege.

## 6. Sources

- **Check Point Research (primary, researcher write-up)**: "From SQLi to RCE: Exploiting LangGraph's Checkpointer" (Yarden Porat, 2026-06) — <https://research.checkpoint.com/2026/from-sqli-to-rce-exploiting-langgraphs-checkpointer/>
- **Check Point Blog (primary, vendor)**: "When Your AI Agent's Memory Becomes a Security Liability" — <https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/>
- **GitHub Security Advisory**: CVE-2025-67644 (GHSA-9rwj-6rc7-p77c) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-9rwj-6rc7-p77c>
- **GitHub Security Advisory**: CVE-2026-28277 (GHSA-g48c-2wqr-h844) — <https://github.com/langchain-ai/langgraph/security/advisories/GHSA-g48c-2wqr-h844>
- **The Hacker News**: "LangGraph Flaw Chain Exposes Self-Hosted AI Agents to Remote Code Execution" (2026-06-12) — <https://thehackernews.com/2026/06/langgraph-flaw-chain-exposes-self.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
