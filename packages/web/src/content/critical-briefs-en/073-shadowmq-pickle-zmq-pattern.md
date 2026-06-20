---
brief_no: 73
title: "ShadowMQ：未認証 pickle を即実行する同一実装が AI 推論基盤に次々コピーされていた — 再利用でエコシステム規模に広がった構造（Oligo Security）"
title_en: "ShadowMQ: one unsafe pattern (unauthenticated ZMQ + pickle) copied across AI inference frameworks — the same flaw spread at ecosystem scale through reuse (Oligo Security)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2025-11-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["072-lerobot-pickle-grpc-rce", "058-langgraph-checkpoint-rce", "025-mcp-stdio-config-to-command-rce", "028-npm-dependency-confusion-recon", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "ShadowMQ：未認証 pickle の同一実装が AI 推論基盤に拡散した — 再利用でエコシステム規模に"
og_lead_en: "ShadowMQ: one unauthenticated ZMQ + pickle implementation, copied across inference stacks — at ecosystem scale"
gap_detected: "Oligo's and Orca's research disclosures, each vendor's CVE assignment and patches, and the known danger of pickle all worked — the after-the-fact detect/report/patch chain ran."
gap_missing: "There was only a layer that restored pickle arriving on an unauthenticated ZMQ socket without checking whether the sender or contents were legitimate, so arbitrary code ran the instant it was received — and the same implementation was copied across frameworks, spreading the flaw."
gap_fix: "Before deserializing, independently verify with Lemma that the input was legitimately brought across the trust boundary, and prevent it up front."
---

## TL;DR

Inference stacks that serve LLMs fast often connect internal processes with ZeroMQ (ZMQ) and exchange data via Python pickle — and if the socket is unauthenticated and the pickle is restored immediately, anyone who can reach it can execute code. In November 2025, Oligo Security disclosed, as "ShadowMQ," that this same implementation had been copied from Meta's Llama Stack across NVIDIA, Microsoft, Modular, vLLM, and SGLang. More than individual bugs, one trust-boundary-less implementation, reused across frameworks, spread the same flaw at ecosystem scale.

---

## 1. Incident overview

- **Target**: OSS frameworks that accelerate LLM inference, using ZeroMQ (ZMQ) for inter-process communication and passing data via Python pickle.
- **Disclosure**: Oligo Security systematized a set of same-shape vulnerabilities as "ShadowMQ" on 2025-11-14 (reported by The Hacker News and others). Same-shape CVEs have continued to be assigned since.
- **The shared failure primitive**: a ZMQ socket binds (often to all interfaces) with no authentication, and received data is immediately restored with `pickle.loads()`. Since pickle can execute arbitrary code on restore, an **unauthenticated attacker** who can reach the socket reaches RCE.
- **Spread (reuse of a same-shape implementation)**: from the attributed origin, Meta Llama Stack, a nearly identical unsafe implementation propagated to NVIDIA TensorRT-LLM, Microsoft Sarathi-Serve, Modular Max Server, vLLM, and SGLang. Brief 072's LeRobot (the same shape over gRPC) is the same lineage.
- **ShadowMQ CVEs (Oligo)**: Llama Stack **CVE-2024-50050**, vLLM **CVE-2025-30165**, NVIDIA TensorRT-LLM **CVE-2025-23254** (CVSS 9.3), Modular Max Server **CVE-2025-60455** (Sarathi-Serve: no CVE assigned). All are the same unauthenticated-ZMQ + `pickle.loads()` shape.
- **Distinguishing later / separate issues**: the same ZMQ/pickle RCE later appeared in SGLang as **CVE-2026-3059 / 3060** (CVSS 9.8, a separate Orca disclosure, 2026-03). By contrast, vLLM **CVE-2026-22778** (a video-processing heap overflow) and **CVE-2025-62164** (a `torch.load` tensor corruption, CVSS 8.8) are different-lineage vulnerabilities, not the ShadowMQ ZMQ/pickle pattern.
- **Blast radius**: inference foundations touch GPU, high privilege, model assets, and internal networks. RCE can lead to full compromise of the foundation, theft of models/data, and lateral movement.
- **Core**: more than an individual bug — **a trust-boundary-less implementation copied across frameworks spread the same flaw at ecosystem scale.** The assumption "received data = OK to execute" propagated through reuse.

---

## 2. Timeline

- (prior): multiple inference frameworks adopt the same-shape implementation of restoring data received over an unauthenticated ZMQ socket with `pickle.loads()` (origin attributed to Meta Llama Stack).
- 2025-11-14: Oligo Security discloses the set of same-shape vulnerabilities as "ShadowMQ," showing the same pattern reaching NVIDIA, Microsoft, Modular, and vLLM from the Llama Stack origin (CVE-2024-50050).
- 2026-03: the same ZMQ/pickle RCE is separately disclosed in SGLang as CVE-2026-3059 / 3060 (CVSS 9.8, Orca Security). The reuse pattern keeps materializing.
- After: replacing pickle with safe alternatives, minimizing ZMQ socket authentication / bind scope, and making the untrusted boundary explicit are shared among inference-foundation operators.

> Note: This Brief analyzes the "pattern" of the same-shape vulnerabilities bundled as ShadowMQ, not a condemnation of any individual framework's actors. Names and CVEs are based on primary sources (research bodies, GitHub Advisory, NVD); each implementation's patch status varies by time, so consult the latest per-vendor information.

---

## 3. Attack vector: a pickle received on an unauthenticated socket runs the instant it arrives

This incident has the same path shared across multiple frameworks. The representative path — unauthenticated ZMQ + pickle — is shown.

1. **Unauthenticated reach**: the attacker reaches the inference foundation's ZMQ socket. The socket has no authentication and is often bound to all network interfaces.
2. **Receiving unverified data**: the socket accepts the sent data without verifying "is the sender legitimate, are the contents legitimate."
3. **Deserialize = code execution**: it immediately restores the received data with `pickle.loads()`. Since pickle can execute arbitrary code mid-restore, host commands run at this point (e.g. TensorRT-LLM CVE-2025-23254; later SGLang CVE-2026-3059 / 3060).
4. **Seizing the foundation**: because inference foundations touch high privilege, GPU, model assets, and internal networks, the RCE spreads to full compromise, model/data theft, and lateral movement.
5. **Spread via reuse**: because the same-shape implementation is copied across multiple frameworks, the same path works across foundations (spread as a pattern).

---

## 4. Structural analysis

This incident belongs to the `agent-infrastructure` category of Pillar 03 (Agent Authority Proof). The central failure primitive is that **a trust-boundary-less implementation — restoring data received over an unauthenticated ZMQ socket with `pickle.loads()` without verifying it — was copied across frameworks and spread the same flaw at ecosystem scale.** Pickle makes "restore" and "execute" inseparable, so using it at an untrusted boundary ties socket reach directly to code execution. We note `code-provenance` (the origin of the reused code / received data is not verified) and `identity-auth` (the unauthenticated channel) as secondary.

Brief 072 (LeRobot — the same "unauthenticated + pickle" shape over gRPC) is the robot-framework version of this pattern; this Brief is its inference-foundation, cross-cutting version. It shares a root with Brief 058 (LangGraph — deserializing persistent state without verifying provenance or integrity) in the **deserialize-of-unverified-data = code-execution** primitive. It is nearly identical to Brief 025 (MCP's default design becoming a broad RCE route — inherent in the reference design, not a single implementation) in the structure where **a design/implementation pattern spreads the same flaw across products.** It connects to Brief 028 (a dependency impersonating an internal scope that exploited the build environment's provenance assumption) in that a flaw propagates through reuse/dependency, and to Brief 003 (authentication bypassed via Host-header manipulation) in that an input path passes to the privileged side without verification.

What this incident shows in particular is that **an OSS foundation's absent trust boundary is amplified through "reuse."** Every time a convenient implementation is copied, its assumption (received data = OK to execute) travels with it. Only once a foundation has a design that independently verifies "is the received data of legitimate origin/content" before execution can inference foundations be safely built on at ecosystem scale.

---

## 5. The gap between detection and proof

Publishing each CVE, replacing pickle, reviewing ZMQ authentication / bind scope, and network segmentation are indispensable for deterring exposure, and this Brief does not negate that role. Patching and least privilege are an important check that severs the unauthenticated reach.

At the same time, network monitoring and patches are no material for the foundation to independently verify — **before execution** — "is the data just received from a legitimate sender, with legitimate contents." The core of this incident is that no layer verified the origin or authorization of received data, the deserialize was itself code execution, and — moreover — this **spread cross-cuttingly through reuse.** After-the-fact log analysis reconstructs "what arrived on which socket," but is no material to independently verify, before execution, "was that payload of legitimate origin and content." Because the same-shape implementation reaches multiple foundations, a single detection pattern cannot cover the whole.

Pre-execution attestation takes the design choice of treating the input a foundation receives not as "it arrived on the socket" but as "something of legitimate origin/authorization, independently verifiable," and at an untrusted boundary receiving it in a safe, no-execution format. Shared as a foundation's standard pattern, the unsafe assumption is not carried even when reused. Detecting reach (the detection-style "what arrived") and proving the input's origin/authorization ("is it a legitimate sender's legitimate content") are **complements**, not substitutes; only where the two overlap can inference foundations be safely built on at ecosystem scale (for the detection-vs-attestation thesis, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for verifying origin/authorization before processing, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05)).

---

## 6. Response and industry trends

- **Each framework / community**: the recommended direction is to replace pickle with safe formats and review ZMQ socket authentication / bind scope (avoiding all-interface exposure). Fixes to individual CVEs continue in SGLang, vLLM, and others.
- **Oligo Security**: systematized the same-shape vulnerabilities as ShadowMQ and made the pattern reaching Meta, NVIDIA, Microsoft, and others visible, showing the problem is "the assumption of a reused design," not "an individual bug."
- **The trust boundary of OSS foundations**: the basic principles — do not use an execution-bearing format (pickle) at an untrusted boundary, and verify the origin/authorization of received data before execution — were raised as a design requirement for inference foundations.
- **A cross-industry issue**: that reuse of a convenient implementation spreads the flaw along with its assumption (the same shape as Briefs 025 and 028) was shared as a risk specific to the AI-foundation ecosystem. How to design and verify a foundation's trust boundary, and make it withstand reuse, is the challenge.

The structure in which the assumption "execute received data without verifying it" spreads through reuse is not a problem of a specific framework; it is increasingly shared as a cross-cutting challenge for the AI inference-foundation ecosystem.

---

## 7. Lemma's analysis

Against the detection–proof gap this incident exposed (a trust-boundary-less implementation spreading through reuse, with deserialize-of-unverified-data = code-execution present cross-cuttingly), Lemma proposes a design that backs the input a foundation receives not with "it arrived" but with "something of legitimate origin/authorization, independently verifiable."

- **Proof of input origin/authorization (proof-as-auth)**: independently verify the inter-process / network input a foundation receives against the sender's authorization and the content's origin, before processing (deserialize/execution). Replace "the fact it arrived on the socket" with a per-input proof.
- **Making the trust boundary withstand reuse**: at an untrusted boundary, do not use an execution-bearing format; share "a safe format + independent verification" as the foundation's standard pattern, so the unsafe assumption is not carried when copied (connecting to Briefs 025 and 072).
- **Cross-cutting integrity**: close, uniformly with input origin/authorization proofs, the path that works even when the same-shape implementation reaches multiple foundations. Do not rely on a single detection pattern.
- **Selective disclosure**: without exposing internal data, disclose only the minimum — that "this input is of legitimate origin/authorization" — reconciling independent verification with the protection of operational information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this input is of legitimate origin/authorization," without depending on after-the-fact log reconciliation. Detection (after-the-fact analysis, patching) works on correcting exposure; pre-execution attestation (independent verification of origin/authorization before processing) works on establishing trust in the AI inference-foundation ecosystem — each complementary to the other. For the design and its scope, see [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/agent-authority-proof/) and [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Oligo Security (primary, pattern disclosure)**: "ShadowMQ: How Code Reuse Spread Critical Vulnerabilities Across the AI Ecosystem" (2025-11; Llama Stack origin, propagation to 5 frameworks, CVE-2024-50050 / 2025-30165 / 2025-23254 / 2025-60455) — <https://www.oligo.security/blog/shadowmq-how-code-reuse-spread-critical-vulnerabilities-across-the-ai-ecosystem>
- **The Hacker News**: "Researchers Find Serious AI Bugs Exposing Meta, Nvidia, and Microsoft Inference Frameworks" (2025-11) — <https://thehackernews.com/2025/11/researchers-find-serious-ai-bugs.html>
- **NVD**: CVE-2025-23254 (NVIDIA TensorRT-LLM, ShadowMQ, CVSS 9.3) — <https://nvd.nist.gov/vuln/detail/CVE-2025-23254>
- **Orca Security (later / separate disclosure)**: "Pickle in the Pipeline: Critical RCE Vulnerabilities in SGLang's LLM Serving Framework" (SGLang CVE-2026-3059 / 3060, 2026-03) — <https://orca.security/resources/blog/sglang-llm-framework-rce-vulnerabilities/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
