---
brief_no: 72
title: "ロボット制御フレームワークが、未認証の通信で受け取ったデータを検証せず実行した（Hugging Face LeRobot） — OSS のロボット基盤が、出所を検証しないデータを deserialize（pickle）した時点でコード実行に至る trust boundary 不在の構造（Hugging Face / CVE-2026-25874）"
title_en: "Hugging Face LeRobot: a robotics framework executed untrusted data received over an unauthenticated channel — deserializing (pickle) unverified data leads straight to code execution (CVE-2026-25874)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance"]
incident_date: 2026-04-28
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["058-langgraph-checkpoint-rce", "068-universal-robots-polyscope-command-injection", "070-unitree-shared-key-robot-identity", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost"]
status: draft
version: "1.0"
og_lead_ja: "未認証 gRPC で受けた pickle が即コード実行 — Hugging Face LeRobot"
og_lead_en: "Pickle over an unauthenticated gRPC channel = instant RCE — LeRobot"
gap_detected: "The CVE-2026-25874 assignment and disclosure, verification of the affected range (v0.4.3–0.5.1), the known danger of pickle deserialization, and the planned 0.6.0 fix all worked."
gap_missing: "Nothing checked the origin or authorization of data arriving over an unauthenticated, non-TLS gRPC channel before deserializing it (pickle), so an unauthenticated reach became an RCE wired straight into the robot's joint control."
gap_fix: "Before deserializing, independently verify with Lemma that the input was legitimately brought across the trust boundary, and prevent it up front."
---

## TL;DR

An AI that drives a robot runs as a conversation over the network between an inference server and the robot itself. In April 2026, **CVE-2026-25874 (CVSS 9.8)** was disclosed in **LeRobot**, Hugging Face's OSS robot-learning framework: it deserializes (pickle) data received in that conversation without checking its contents. Over a **gRPC channel with no authentication and no TLS**, an unauthenticated attacker can run arbitrary commands on the host just by sending a crafted payload — and that path leads straight to the robot's joint control. There was no trust boundary verifying the origin or authorization of received data; code execution happened at the moment of deserialization.

---

## 1. Incident overview

- **Target**: LeRobot, Hugging Face's OSS robot-learning/control framework. In async inference, the PolicyServer (which computes the policy) and the robot client (the robot itself) communicate over gRPC.
- **Disclosure**: published as CVE-2026-25874 in late April 2026 (NVD published 04-23; press coverage 04-27 to 28). Found and PoC-published by Valentin Lobstein ("chocapikk"). Explained by The Hacker News / Resecurity / Cloud Security Alliance. CWE-502 (deserialization of untrusted data).
- **Vulnerability**: the PolicyServer / robot client run `pickle.loads()` on data received over gRPC **with no authentication and no TLS** (`add_insecure_port()`). Since pickle can execute arbitrary code on restore, this reaches unauthenticated remote code execution. CVSS 3.1 = 9.8 (CVSS 4.0 = 9.3).
- **What it required**: reaching the PolicyServer's network port. No authentication is demanded. "If you can reach it you reach the deserialize, and the deserialize is code execution."
- **Blast radius**: LeRobot, in GPU-backed inference, often touches high privilege, robot hardware, internal networks, datasets, and expensive compute. RCE means full system compromise and data theft — plus a **physical-safety risk that connects directly to the robot's joint-control path.**
- **Affected versions**: v0.4.3 verified vulnerable in the wild in the default async-inference PolicyServer config. NVD scopes the impact **through 0.5.1**; each release with the same `lerobot.async_inference.policy_server` restores untrusted gRPC input via pickle. No fixed release as of writing (0.6.0 is planned, replacing pickle with safetensors/JSON).
- **Mitigations**: replace pickle with safe alternatives (JSON, native protobuf fields, safetensors); move `add_insecure_port()` to `add_secure_port()` + TLS; enforce a gRPC interceptor + token authentication on all receives.
- **Core**: the framework had no layer (trust boundary) verifying "is the received data from a legitimate sender, with legitimate contents," and the point where deserialize equals code execution was reachable unauthenticated and unverified.

---

## 2. Timeline

- (prior): LeRobot's async-inference PolicyServer / robot client run `pickle.loads()` on data received over gRPC with no auth and no TLS.
- ~2026-04-23 to 28: CVE-2026-25874 is published (NVD 04-23; press 04-27/28). Researchers verify v0.4.3 vulnerable in the wild. Multiple security outlets / research bodies publish technical explainers.
- After: replacing pickle with safe alternatives, adding TLS and authentication, and access control via a gRPC interceptor become talking points.

> Note: This Brief covers the CVE-2026-25874 vulnerability and the underlying structure of "deserializing unverified data = code execution." Regardless of whether in-the-wild exploitation is confirmed as of writing, the focus is the framework's absent trust boundary. The shared-shape case across AI coding / inference infrastructure is Brief 073 (the ShadowMQ pattern).

---

## 3. The chain: if you can reach it, the deserialize becomes code execution

This incident shows a structure in which a robot framework reaches code execution at deserialization, without verifying the origin or authorization of received data. The path is as follows.

1. **Unauthenticated reach**: the attacker reaches the gRPC port the LeRobot PolicyServer listens on. The channel has neither TLS nor authentication (`add_insecure_port()`).
2. **Receiving unverified data**: the PolicyServer accepts the sent data without verifying "is the sender legitimate, are the contents legitimate."
3. **Deserialize = code execution**: it restores the received data with `pickle.loads()`. Since pickle can execute arbitrary code mid-restore, host commands run at this point (CVE-2026-25874).
4. **Spread to the control path**: because the PolicyServer / robot client sit on the policy-compute and robot-control path, the RCE can spread — beyond data theft — to the physical motion of the robot's joint control.
5. **Mitigation**: replacing pickle, adding TLS and authentication, and access control via an interceptor sever the path that reaches deserialize unverified (an after-the-fact, perimeter sequence).

---

## 4. Structural analysis

This incident belongs to Pillar 03 (Agent Authority Proof). The central failure primitive is that **an OSS robot framework had no trust boundary verifying the origin or authorization of received data, and reached code execution at the moment of deserialization (pickle).** Pickle is a format in which "restoring data" and "executing code" are inseparable, so restoring unauthenticated, unverified input directly ties network reach to code execution. We note `agent-infrastructure` (robot inference/control infrastructure) as primary, and `identity-auth` (the unauthenticated channel) and `code-provenance` (the origin of received data/code is not verified) as secondary.

It shares a root with Brief 058 (LangGraph — a server taken over by loading persistent state [a checkpoint] without verifying provenance or integrity), differing in that it shows the **deserialize-of-unverified-data = code-execution** primitive on the **robot's inference/control path** rather than on agent state. It forms an embodied-agent cluster with Brief 068 (an industrial robot that never verifies a command sender's authority before physical motion) and Brief 070 (humanoid/quadruped robots with no per-device identity), all sharing the structure in which "input/identity leading to robot action is not independently verified before motion." It shares a shape with Brief 025 (MCP's default design becoming a broad RCE route via config → command execution) and Brief 003 (authentication bypassed via Host-header manipulation), in that infrastructure input paths pass to the privileged side without verification.

What this incident throws into relief is that **the more an OSS framework spreads through the ecosystem, the more its absent trust boundary spreads too.** If a foundation many robot implementations depend on — like LeRobot — is designed to deserialize unverified data, the same flaw reaches every dependent. Only once a foundation independently verifies, before deserialization, "is the received data from a legitimate sender with legitimate contents," can robots built on OSS be safely placed in the field.

---

## 5. The gap between detection and proof

Publishing the CVE, replacing pickle with safe alternatives, adding TLS and authentication, and network segmentation are indispensable for deterring exposure, and this Brief does not negate that role. Patching and least privilege are an important check that severs the unauthenticated reach.

At the same time, network monitoring and patches are no material for the foundation to independently verify — **before the deserialize** — "is the data just received from a legitimate sender, with legitimate contents." The core of this incident is that no layer verified the origin or authorization of received data, and the deserialize was itself code execution. After-the-fact log analysis reconstructs "which connection arrived," but is no material to independently verify, before execution, "was that payload of legitimate origin and content." Once pickle executes code mid-restore, the compromise at that moment and the robot's physical motion cannot be retroactively undone.

Pre-execution attestation takes the design choice of treating the data a foundation receives not as "it arrived over the network" but as "something of legitimate origin/authorization, independently verifiable." If inference/control input is verified against the sender's authorization and the content's origin before the deserialize, and received in a safe (no-code-execution) format, then unauthenticated reach alone does not run code. Detecting reach (the detection-style "who arrived") and proving the input's origin/authorization ("is it a legitimate sender's legitimate content") are **complements**, not substitutes; only where the two overlap can OSS-based robot and inference foundations be safely placed in the field.

---

## 6. Response and industry trends

- **LeRobot / community**: the recommended direction is to replace pickle with safe formats (JSON, native protobuf fields, safetensors) and to introduce `add_secure_port()` + TLS and a gRPC interceptor with token authentication. No fixed release as of writing; the 0.6.0 plan replaces pickle.
- **The trust boundary of OSS foundations**: it was shared among inference/robot-infrastructure operators that a design "deserializing received data without verifying it" ties network reach directly to code execution. The basic principle: do not use an execution-bearing format like pickle at an untrusted boundary.
- **Connection to physical safety**: because RCE reaches the robot's inference/control path, a cyber compromise turning into a physical-motion safety risk was emphasized as a cyber-physical-specific point.
- **A cross-industry issue**: the same "unauthenticated channel + pickle" is not unique to LeRobot but a pattern spreading across inference frameworks (Brief 073 = ShadowMQ). How to design and verify an OSS foundation's trust boundary has become an ecosystem-scale challenge.

The absence of a design that verifies received data before deserializing it is not a problem of a specific OSS; it is increasingly shared as a cross-organizational challenge for any organization building on AI inference / robot foundations.

---

## 7. Lemma's analysis

Against the detection–proof gap this incident exposed (an OSS foundation reaching deserialize = code execution without verifying the origin or authorization of received data), Lemma proposes a design that backs the input a foundation receives not with "it arrived" but with "something of legitimate origin/authorization, independently verifiable."

- **Proof of input origin/authorization (proof-as-auth)**: independently verify inference/control input against the sender's authorization and the content's origin, before processing (deserialize/execution). Replace "the fact it arrived over the network" with a per-input proof.
- **Making the trust boundary explicit**: at an untrusted boundary, do not use an execution-bearing format (pickle, etc.); presume safe formats and independent verification. Do not tie reach directly to execution (connecting to the unverified-state load of Brief 058).
- **Integrity of the control path**: make the input/origin of the path reaching the robot's joint control independently verifiable, rejecting unverified payloads before they turn into physical motion (connecting to the embodied-agent authorization of Briefs 068 and 070).
- **Selective disclosure**: without exposing internal data, disclose only the minimum — that "this input is of legitimate origin/authorization" — reconciling independent verification with the protection of operational information.

In this way, a proof fixed at the moment of the act functions as an independently verifiable trail of whether "this input is of legitimate origin/authorization," without depending on after-the-fact log reconciliation. Detection (after-the-fact analysis, patching) works on correcting exposure; pre-execution attestation (independent verification of origin/authorization before processing) works on establishing trust in OSS foundations and robots — each complementary to the other.

---

## 8. Sources

- **The Hacker News**: "Critical CVE-2026-25874 Leaves Hugging Face LeRobot Open to Unauthenticated RCE" (2026-04) — <https://thehackernews.com/2026/04/critical-cve-2026-25874-leaves-hugging.html>
- **Resecurity**: "CVE-2026-25874: Hugging Face LeRobot Unauthenticated RCE via Pickle Deserialization" — <https://www.resecurity.com/blog/article/cve-2026-25874-hugging-face-lerobot-unauthenticated-rce-via-pickle-deserialization>
- **Cloud Security Alliance (Lab Space)**: "LeRobot CVE-2026-25874: Unauthenticated RCE via Pickle" (2026-04-29) — <https://labs.cloudsecurityalliance.org/research/csa-research-note-lerobot-cve-2026-25874-unauth-rce-20260429/>
- **NVD**: CVE-2026-25874 (CVSS 3.1 9.8 / 4.0 9.3; affected through 0.5.1) — <https://nvd.nist.gov/vuln/detail/CVE-2026-25874>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
