---
brief_no: 66
title: "一般ユーザー権限のまま、AI ゲートウェイの管理者権限とサーバーのコード実行に到達できた（LiteLLM） — 権限チェックの各層が互いの検証を前提にし、行動の前に認可が独立検証されない構造（LiteLLM / Obsidian Security）"
title_en: "LiteLLM AI Gateway: from low-privilege user to admin and RCE — authorization not independently verified before action (Obsidian Security)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["033-f5-bigip-edge-pivot", "064-salesloft-drift-oauth-salesforce", "046-servicenow-unauthenticated-api", "056-mchire-paradox-recruiting-auth", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
status: draft
version: "1.0"
og_lead_ja: "一般ユーザーが管理者権限と RCE に到達 — LiteLLM ゲートウェイの連鎖"
og_lead_en: "Low-priv user to admin and RCE — the LiteLLM gateway chain"
gap_detected: "Responsible disclosure, staged patches, and after-the-fact logs of which endpoints were hit were all recorded and communicated."
gap_missing: "There was no layer to check before an operation whether the call was permitted for that party, so each stage trusted the previous one and authorization checks were bypassed."
gap_fix: "Before a privileged operation, independently verify with Lemma that this operation is permitted for this party within the authority granted to it, and prevent it up front."
---

## TL;DR

LiteLLM — the leading OSS AI gateway consolidating internal AI use — let a low-privilege user reach admin and remote code execution on the server, a chain of three vulnerabilities Obsidian Security disclosed. Responsible disclosure and after-the-fact logs cannot confirm, before an operation, whether a call is permitted for that party. Authorization was split across a route layer and a handler layer, each assuming the other had checked, with no layer verifying authorization at the moment of the action. Detection and pre-execution attestation are complements, not substitutes.

---

## 1. Incident overview

- **Target**: LiteLLM (BerriAI's OSS AI gateway / proxy). It aggregates connections to LLM providers, authorization, budgets, guardrails, and audit logs, and also operates as a gateway for MCP / agents.
- **Disclosing party**: Obsidian Security (the chain research). The guardrail sandbox escape (corresponding to CVE-2026-40217) was independently reported earlier by X41 D-Sec (2026-04-08, CVE unassigned at the time). VulnCheck assisted with assigning CVE-2026-47101 / 47102.
- **Vulnerabilities**: a chain of three (individual CVEs are CVSS 8.7–8.8; the combined 9.9 is Obsidian's assessment)
  - **CVE-2026-47101** (authz bypass): key-management endpoints such as `/key/generate` store the caller-supplied `allowed_routes` without validating it. A low-privilege user can issue a key specifying `["/*"]` and reach admin-only routes.
  - **CVE-2026-47102** (privilege escalation): `/user/update` and `/user/bulk_update` lack field-level authorization, so the caller can rewrite `user_role` and escalate themselves to `proxy_admin`.
  - **CVE-2026-40217** (sandbox escape / RCE): custom-code guardrails run user code via `exec()` while leaving `__builtins__` intact, so `__import__`, `open`, and the like remain available, reaching server-side code execution.
- **Blast radius**: because the gateway sits at the chokepoint of the AI stack, a successful chain can reach the admin key (`LITELLM_MASTER_KEY`), DB credentials, each model provider's API keys, MCP / agent credentials, and the conversational content passing through (prompts, responses, and any PII or secrets mixed in).
- **Man-in-the-Gateway**: the graver issue is not "being able to read" but "being able to operate." A compromised gateway can alter requests and responses between agent and model and make an agent (e.g. Claude Code in auto-approve mode) execute forged tool calls. Obsidian demonstrated a reverse shell returning to a developer's machine when the user merely typed `hello`.
- **Fix**: BerriAI fixed it incrementally; the chain is closed from `v1.83.14-stable` (released 2026-04-25) onward.
- **Core**: authorization was split across a route layer and a handler layer, but each layer assumed "the previous one already checked," and **at the moment of the action it never independently verified whether this caller truly holds the authorization to perform this operation.**

---

## 2. Timeline

- 2026-02-19: Obsidian Security reports the three vulnerabilities to BerriAI (via email / Huntr, per the disclosure policy).
- 2026-02-24: a first fix adds a `proxy_admin` check to guardrail CRUD and clears `__builtins__` at `exec()` time (PR #22095).
- 2026-04-09–15: blocks non-admin setting of `allowed_routes` (PR #25445), adds field-level authorization (PR #25541), and replaces guardrails with a RestrictedPython sandbox (PR #25818).
- 2026-04-10: CVE-2026-40217 (the guardrail sandbox issue) is published.
- 2026-04-22–25: `v1.83.10-stable` (privesc fix, sandbox) ships, followed by `v1.83.14-stable` (the remaining `allowed_routes` bypass fix).
- 2026-05-20: VulnCheck assigns CVE-2026-47101 (authz bypass) and CVE-2026-47102 (privesc).
- 2026-06-11: Obsidian Security publishes the research (the full chain and the Man-in-the-Gateway demonstration).

> Note: This Brief covers the three-CVE privilege-escalation chain (CVE-2026-47101 / 47102 / 40217); no in-the-wild exploitation of this chain has been reported as of writing. Separately, LiteLLM has an unrelated CVE-2026-42271 (a command-injection RCE via the MCP preview, fixed in v1.83.7) that **has** been exploited in the wild and is listed in CISA KEV; secondary reports that cite "a different CVE number" or "confirmed exploitation" usually refer to 42271. The two are distinct vulnerabilities; to avoid conflation, this Brief's analysis is limited to the former chain (42271 is also closed by updating to `v1.83.14-stable` or later).

---

## 3. The path: once the gate is broken, each layer follows in chain

This incident shows a structure in which the two-layer authorization, each layer assuming the other had verified, lets the rest follow once the first gate is passed — a low-privilege user reaching server-side code execution. The path is as follows.

1. **Breaking the route gate (CVE-2026-47101)**: a low-privilege user issues a virtual key via `/key/generate` specifying `allowed_routes: ["/*"]`. The proxy stores the value without validation; route permissions that should derive from the role are instead "granted" by the key's `allowed_routes` as a fallback, reaching admin-only routes that should be out of reach.
2. **An undefended handler layer**: once past the route gate, some sensitive endpoints assume "the route gate already screened this" and hold no authorization of their own.
3. **Privilege escalation (CVE-2026-47102)**: because `/user/update` lacks field-level authorization, the user rewrites the `user_role` on their own record to `proxy_admin` and escalates.
4. **Server-side code execution (CVE-2026-40217)**: the custom-code guardrail reachable via the admin path runs `exec()` with `__builtins__` intact, reaching arbitrary code execution. Even over MCP (stdio), obtaining `proxy_admin` is effectively server-side code execution.
5. **Expansion to Man-in-the-Gateway**: registering a malicious callback via RCE lets the attacker read and rewrite every request/response flowing through the gateway — injecting forged tool calls into the agent, swapping the very context the auto-approve safety judgment runs on, and making the agent execute locally.

---

## 4. Structural analysis

This incident belongs to Pillar 03 (Agent Authority Proof). The central **failure primitive is "authorization split across a route layer and a handler layer, each layer assuming the previous one had verified, never independently verifying the caller's authorization at the moment of the action."** `allowed_routes`, a constraint meant to *narrow* a key, in implementation inverted into a *grant beyond the role*, so a single bypass chained into privilege escalation and code execution. We note `identity-auth` (per-call authorization) as primary, and `agent-infrastructure` (the AI gateway as infrastructure) and `attribute-proof-bypass` (the absence of independent verification of role/route attributes) as secondary.

It is in the same proof-as-auth lineage as Brief 064 (a trusted integration's OAuth never scope- or revocation-checked per action). Where 064 was "standing authority" stolen and spread across an ecosystem, this incident differs in that **the authorization check itself leaned on assumptions across layers and was broken from the inside.** It shares a root with Brief 046 (a ServiceNow unauthenticated API that never proved the requester's authorization before execution) and Brief 056 (a recruiting AI that never verified the accessing party's authority attributes) in not independently verifying, before the action, "may this party perform this operation." It connects to Brief 027 (secrets leaked via a user-specified MCP URL in LibreChat) and Brief 062 (a Claude Code GitHub Action that ran privileged work without verifying input claiming to be `[bot]`) in that AI infrastructure passes input/identity to the privileged side without verifying its provenance. It is closest to Brief 033 (the compromise of an implicitly trusted F5 BIG-IP edge appliance cascading, with its stored credentials, into full-domain lateral movement): the two share a category profile (Pillar 03 / identity-auth · agent-infrastructure · attribute-proof-bypass) and the structure in which **breaching a single "trusted point" on the infrastructure cascades, pulling stored credentials along** — the gateway being that point in LiteLLM, the edge appliance in 033.

What this incident throws into particular relief is that **the gateway's position itself becomes the threat surface.** Because the gateway sits between agent and model, a takeover lets an attacker not only "read" but "operate" the agent's execution flow. Beyond exposing keys and secrets, the steering of the agent's actions passes to the attacker. The authority of AI infrastructure can be safely placed under real workloads only once it is treated not as the nominal presentation of a token or role, but as an authorization independently verifiable per action.

---

## 5. The gap between detection and proof

Responsible disclosure of the vulnerabilities, BerriAI's incremental fixes, updating to `v1.83.14-stable`, and inventorying admin roles, guardrails, and callbacks are indispensable for deterring and remediating the damage, and this Brief does not negate that role. Patching and rotating credentials are an important check that cuts off exposure.

At the same time, detection and patches are no material for independently establishing — **before the operation executes** — whether this call is an operation permitted to its caller. The core of this incident is that each layer assumed "an earlier layer checked," and no authorization verification existed at the moment of the action. Log analysis reconstructs after the fact "which endpoint was hit," but is no material for independently verifying, before the action, "was that call within the authorization granted to the caller." In Man-in-the-Gateway in particular, the callback never appears in the admin UI, and the altered tool call looks like a legitimate response to the downstream agent. After-the-fact reconciliation can barely tell them apart.

Pre-execution attestation takes the design choice of treating each operation of an agent or gateway not as "the presentation of a role or token" but as "a proof of authorization scoped per action and independently verifiable." If privileged operations — registering a guardrail, changing an authority field, making a tool call — are verified at the moment of the act against the bounds of the grantor's authorization, then even after the route gate is passed once, the handler-side operation cannot proceed without a proof of authorization. Detection (after-the-fact investigation, patching, inventory) and proof of authorization (independent verification at the moment of the act) are **complements**, not substitutes; only where the two overlap can an AI gateway be safely placed under audit, regulation, and real workloads.

For the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05).

---

## 6. Response and industry trends

- **BerriAI / LiteLLM**: fixed incrementally on report — adding a `proxy_admin` check to guardrails and clearing `__builtins__` at `exec()`, blocking non-admin `allowed_routes`, adding field-level authorization, and migrating to a RestrictedPython sandbox — closing the chain in `v1.83.14-stable`.
- **Recommendations for self-hosters**: update to `v1.83.14-stable` or later; re-verify `proxy_admin` holders (treat them as equivalent to host-level access); inventory registered custom-code guardrails and callbacks (reconciling callbacks that never appear in the admin UI); rotate provider API keys, DB credentials, and MCP tokens.
- **The authority boundary of AI infrastructure**: this incident again pressed the point of defense in depth — "a route-layer check is one layer of authorization, not the whole authorization model." It was shared that administrative operations such as introducing guardrails or changing authority fields should require admin authorization at the handler, not the route.
- **A cross-industry issue**: beyond the reality that the AI stack inherits old web defects (the same shape as Obsidian's Langflow / Flowise research), the gateway's position becoming a threat surface that goes beyond "reading" to "steering" entered the discussion. It is recommended that relays placed between agent and model be limited to trusted paths, avoiding unknown third-party relays.

The absence of a design that treats the authority check not as "an assumption that an earlier layer checked" but as "a proof of authorization independently verified per action" is not a problem of a specific OSS; it is increasingly shared as a cross-organizational challenge for any organization operating AI gateways or agent infrastructure.

---

## 7. Lemma's analysis

Against the gap this incident exposed (authority leaning on assumptions across layers, never independently verified at the moment of the action), Lemma proposes a design that backs the actions of agents and gateways not with "the presentation of a role or token" but with "a proof of authorization scoped per action and independently verifiable."

- **Per-action scoped authorization (proof-as-auth)**: independently verify privileged operations (guardrail registration, authority-field changes, tool calls) at the moment of the act against the bounds of the grantor's authorization. Replace "the fact that the route gate was passed" with a per-operation proof.
- **Eliminating cross-layer assumptions**: break the chained premise that "an earlier layer already checked," so each operation demands a proof of authorization at its own layer — closing, before the action, the path by which a single bypass chains into privilege escalation and code execution.
- **Integrity of the gateway path**: make the provenance and integrity of requests/responses flowing between agent and model independently verifiable, so altered tool calls and invisible callbacks are rejected before a downstream agent accepts them (connecting to the input-identity verification of Brief 062 and the MCP path of Brief 027).
- **Selective disclosure**: without exposing internal data, disclose only the minimum — that "this operation is within the grantor's authorization" — reconciling independent verification with the protection of sensitive information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this gateway / agent operation is within the authorization," without depending on after-the-fact log reconciliation. Detection (after-the-fact investigation, patching, inventory) works on remediating the damage; pre-execution attestation (independent verification of authorization at the moment of the act) works on establishing trust in AI infrastructure — each complementary to the other.

For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Obsidian Security (primary, research)**: "Breaking LiteLLM: From Low-Privilege User to Admin and RCE (CVE-2026-47101, CVE-2026-47102, CVE-2026-40217)" (2026-06-11; the full chain, disclosure timeline, Man-in-the-Gateway demonstration) — <https://www.obsidiansecurity.com/blog/litellm-privilege-escalation-rce>
- **X41 D-Sec (primary, independent report)**: "X41-2026-001 LiteLLM" (sandbox escape in the guardrail `/guardrails/test_custom_code`, published 2026-04-08, CVE unassigned at the time) — <https://www.x41-dsec.de/lab/advisories/x41-2026-001-litellm/>
- **NVD**: CVE-2026-40217 (guardrail sandbox escape) — <https://nvd.nist.gov/vuln/detail/CVE-2026-40217>
- **The Hacker News**: "LiteLLM Vulnerability Chain Lets Low-Privilege Users Take Over AI Gateway Servers" (2026-06) — <https://thehackernews.com/2026/06/litellm-vulnerability-chain-lets-low.html>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
