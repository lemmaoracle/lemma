---
brief_no: 57
title: "認証のない AI バックエンドで、到達がそのまま全取得になった — データ基盤の到達と認可が分離されない構造（DeepSeek / ClickHouse）"
title_en: "Reachable Meant Readable — DeepSeek's Unauthenticated ClickHouse Backend Exposure"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2025-01-29
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["056-mchire-paradox-recruiting-auth", "013-coinbase-kyc-insider-breach", "036-public-training-dataset-pii", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "認証なしの AI バックエンド、到達＝全取得 — DeepSeek / ClickHouse"
og_lead_en: "No auth on the AI backend — reachable meant readable — DeepSeek"
gap_detected: "Continuous external attack-surface monitoring and responsible disclosure worked, so the exposure was remediated before evidence of exploitation spread."
gap_missing: "There was no layer to check before access whether the access rested on legitimate authority, and on an unauthenticated backend there was simply no means to tell whether a party that reached it was legitimate."
gap_fix: "Before a high-risk action, independently verify with Lemma that this party legitimately holds authority over data in this scope, and prevent it up front."
---

## TL;DR

Users of an AI service assume the chats they type are handled safely. But in January 2025, Wiz Research found that the AI company **DeepSeek** had a backend **ClickHouse database publicly exposed with no authentication.** Anyone could reach it over open ports (8123 / 9000), and it exposed **over a million log lines, plaintext chat history, API keys, secret tokens, and backend information.** We analyze this through Pillar 03 (Agent Authority Proof) as a structure in which **access to the AI service's sensitive data backend had no authentication or authority verification at all, so network reachability became full retrieval.** Wiz disclosed responsibly and DeepSeek remediated within about 30 minutes. The failure primitive is not one misconfiguration — it is that reachability and authorization on the data plane were not separated. It connects to Brief 056 (guessable credential plus missing authorization), 013 (raw PII kept for compliance becomes the breach surface), 036 (provenance/consent of AI training data), and 006 (the verification gap of a credential's revocation attribute).

---

## 1. Incident overview

- **Subject**: DeepSeek's (AI / LLM service) backend infrastructure
- **Discoverer**: Wiz Research (during a security assessment of external infrastructure)
- **Exposure point**: A ClickHouse instance publicly exposed with no authentication (`oauth2callback.deepseek.com:9000`, `dev.deepseek.com:9000`). The open ports were 8123 (HTTP) / 9000, and arbitrary SQL queries could be run via a web interface without authentication
- **What was exposed**: Over a million log lines (the `log_stream` table), plaintext user chat history, API keys, secret access tokens, backend operational metadata
- **Data range**: Logs accumulated from at least 2025-01-06 onward
- **Response**: Wiz disclosed responsibly to DeepSeek; DeepSeek remediated the exposure within about 30 minutes
- **The crux**: There was no authentication or authority verification for access to the sensitive-data backend; **reachability was retrieval**

> Note: This Brief does not assert the presence or absence of illicit retrieval by third parties; its object of analysis is the structure of absent authentication / authority verification.

---

## 2. Timeline

- 2025-01-06: The exposed database's logs accumulate from this date onward
- 2025-01: Wiz Research discovers two ClickHouse instances during an external-infrastructure assessment
- 2025-01-29: Wiz discloses responsibly to DeepSeek; DeepSeek remediates within about 30 minutes

---

## 3. How exposure propagates into "reachable = fully retrievable"

This incident stems from a structure in which reachability and authorization to the AI service's data backend are not separated.

1. **Unauthenticated external reach**: The ClickHouse instance was open externally on public ports (8123 / 9000), reachable over the network without authentication
2. **Absence of authority verification**: For the party that reached it, there was no verification of access authority to the data at all, allowing near-full-control operations
3. **Full retrieval of sensitive data**: Plaintext chat history, API keys, secret tokens, and backend information could be retrieved without further verification. Reachability becomes full retrieval
4. **Chain of secondary risk**: Exposed API keys and tokens can become the starting point for lateral movement and privilege escalation to other systems

---

## 4. Structural analysis

This incident belongs to the `identity-auth` category under Pillar 03 (Agent Authority Proof). The central failure primitive is that **for the AI service's sensitive-data backend, the accessing party's authentication and authority attributes go unverified, so network reachability connects directly to full retrieval.** As secondary we note `attribute-proof-bypass` (bypass of access-authority verification) and `data-provenance` (handling of chat history as sensitive data).

Brief 036 (PII in public training data) addresses the provenance/consent layer of data, but this case differs in cross-section: it is the **operational data of a running AI service** that was exposed. It shares the "absence of authority verification" primitive with Brief 056 (McHire), but whereas McHire was a guessable credential plus IDOR, DeepSeek is the more fundamental absence of **authentication itself.** It illustrates a pattern in which, as AI companies prioritize scale, data-backend reach control and authorization are exposed without being separated.

---

## 5. The gap between detection and proof

Here the detection chain — Wiz Research's external scan and responsible disclosure, DeepSeek's prompt remediation — functioned, and the exposure was fixed before evidence of exploitation spread. It is an example of continuous external attack-surface monitoring working, and this Brief does not deny its role.

But the problem is that even when an external scan can "detect" the exposure, that operates after the fact, after the exposure already exists; it is not a layer that proves, at the moment of access, "is this access based on legitimate authority." On a backend with no authentication, there is simply no means to distinguish whether the party that reached it is legitimate. "The port was open / not open" is an object of detection, but not proof of "legitimate access."

At present, in AI-service data backends, examples abound where reach control (network) and authorization (who can access what) are operated without being separated. Pre-execution attestation places, ahead of the data-backend access path, an attribute proof that "the party legitimately holds the authority for this scope," structurally separating reachability from authorization. Detection (external scans, disclosure) contributes to shrinking harm, while pre-execution attestation (authority verification at access time) contributes to independently verifying authorization — each **complementary**.

---

## 6. Response and industry trends

- **Discovery and fix**: Following Wiz Research's responsible disclosure, DeepSeek remediated the exposure within about 30 minutes
- **Industry point**: In a fast-growing AI service, the basic operational-security fact that a backend for extremely sensitive data such as chat history could be exposed with no authentication became a focal point again
- **Secondary risk**: Because exposed API keys and secret tokens can be a starting point for lateral movement and privilege escalation, the importance of secret management and rotation was re-recognized
- **Geopolitical / regulatory context**: Overlapping with debates over national regulation and usage restrictions around DeepSeek, it heightened interest in AI-service data protection and governance

A picture in which reachability and authorization to the sensitive-data backend are not separated is not one vendor's misconfiguration; it remains an operational-security issue for AI services as a whole that prioritize scale.

---

## 7. Lemma's analysis

Against the gap DeepSeek exposed — access to the AI service's sensitive-data backend with no authentication or authority verification, where reachability connects directly to full retrieval — Lemma proposes a design that fixes the basis for access as an independently verifiable cryptographic proof at that moment.

- **Pre-execution attestation of authority attributes**: Before accessing the data backend, prove as an independently verifiable attribute that "the party legitimately holds the authority for this scope." Unauthenticated network reach alone does not pass
- **Separating reachability from authorization**: Structurally separate network reachability from authorization to the data, so an open port does not immediately become full retrieval
- **Handling of secrets**: Do not hold or expose API keys and tokens in plaintext; move to proof-based authorization (send a proof, not the key)
- **Selective disclosure**: Prove only that "the access was within the scope of authority," without exposing the sensitive data itself, such as chat history

Proof fixed at the moment of action functions as evidence that can be independently verified later — without disclosing the sensitive data — when asked "was this access legitimate." Detection (external scans, disclosure) contributes to shrinking harm, while pre-execution attestation (authority verification at access time) contributes to independently verifying authorization — each complementary.

---

## 8. Sources

- **Wiz Research**: "Wiz Research Uncovers Exposed DeepSeek Database Leaking Sensitive Information, Including Chat History" (primary — the original account of the discovery; 2025-01) — <https://www.wiz.io/blog/wiz-research-uncovers-exposed-deepseek-database-leak>
- **BleepingComputer**: "DeepSeek exposes database with over 1 million chat records" (ports, exposed content, remediation) — <https://www.bleepingcomputer.com/news/security/deepseek-exposes-database-with-over-1-million-chat-records/>
- **The Register**: "DeepSeek database left open, exposing sensitive info" (2025-01-30; timeline) — <https://www.theregister.com/2025/01/30/deepseek_database_left_open/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
