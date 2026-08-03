---
brief_no: 88
title: "Kestra：リクエストのパス末尾を「/configs」にするだけで認証が外れ、未認証のまま root でコードが実行できた"
title_en: "Kestra: Ending a Request Path With /configs Bypassed Authentication and Allowed Unauthenticated Code Execution as Root"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "066-litellm-ai-gateway-privilege-escalation", "027-librechat-mcp-url-secrets"]
status: "published"
version: "1.0"
og_lead_ja: "Kestra：パス末尾を /configs にするだけで認証回避、未認証 root RCE（CVSS 10.0）"
og_lead_en: "Kestra: a /configs path suffix bypasses auth — unauthenticated root RCE (CVSS 10.0)"
gap_detected: "It was disclosed early as CVE-2026-53576, and the CVSS 10.0 severity assessment, the fixed releases (1.0.45 / 1.3.21), and CISA ADP enrichment all operated."
gap_missing: "Authorization of the request was decided on a surface signal — whether the path ended in /configs — and there was no layer that independently verified, before execution, whether the request was truly meant to be public (the caller's authority)."
gap_fix: "Before privileged operations such as creating and executing a flow, independently verify the requesting party's authority with Lemma, decoupled from the formal judgment of the URL path, and block execution up front if no proof accompanies it."
---

## 1. TL;DR

On 2026-06-26, a vulnerability allowing unauthenticated arbitrary code execution as root (CVE-2026-53576, CVSS 10.0) was disclosed in Kestra, an orchestration platform that automatically runs data and workflows. Because the REST API's authentication filter was implemented to treat "a request whose path ends in `/configs` is the public instance-config endpoint" and skip authentication, an attacker could waltz through authentication simply by appending the string `configs` to the end of the path of an otherwise protected endpoint. The bypass also reaches the flow (workflow) create and execution-trigger routes, so an unauthenticated attacker could create and run a flow containing a Shell/Process task, and the task runs as root inside the container. Because the official `docker-compose.yml` mounts `/var/run/docker.sock`, container root could reach all the way to the host's Docker daemon. The fixes are 1.0.45 / 1.3.21. The problem is not the strength of the authentication algorithm; it is that authorization of the request was decided on a surface signal — "the string at the end of the path" — and was not independently verified before execution.

---

## 2. What happened

- **Subject**: Kestra (an open-source, event-driven orchestration platform). Used to automatically run data pipelines, workflows, and various jobs
- **Identifier**: CVE-2026-53576 (GitHub Security Advisory: GHSA-2q47-568g-9h4f)
- **Severity**: 10.0 (Critical) on CVSS 3.1. Vector `AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`. CWE-94 (code injection) + CWE-288 (authentication bypass via an alternate path). SSVC = Exploitation: PoC, Automatable: yes, Technical Impact: total
- **Disclosure date**: 2026-06-26 (assigned by GitHub_M, enriched by CISA ADP on 2026-06-29). As of this Brief's writing, this is at the stage of vulnerability disclosure, not a report of "exploitation in the wild"
- **Core of the exploit**: Kestra specifies resources via URL path segments chosen by the caller (e.g., `/api/v1/{tenant}/flows/{namespace}`). An attacker can completely bypass Basic authentication simply by choosing the string `configs` as the final path segment. Because the bypass reaches the flow-create / execution-trigger routes, an unauthenticated attacker creates and executes a flow containing a Shell or Process task
- **Chain of impact**: Tasks run as root inside the Kestra container. Because the official `docker-compose.yml` mounts `/var/run/docker.sock`, root inside the container reaches the host's Docker daemon and can lead to host-level compromise
- **Affected versions**: Below 1.0.45, and 1.1.0 or above but below 1.3.21. The fixed releases are 1.0.45 and 1.3.21

The incident came together as the following chain.

1. **Public determination by path suffix**: Kestra's REST API authentication filter `@Filter("/api/v1/**")` judges a path ending in `/configs` to be the public config endpoint and skips authentication
2. **Spoofing the trailing segment**: Because Kestra handles resources via caller-specified URL path segments, an attacker bypasses Basic authentication simply by appending the string `configs` to the final segment of an otherwise protected path
3. **Reaching protected routes**: The bypass reaches flow-create (workflow creation) and execution-trigger (execution trigger). These privileged operations can be reached while unauthenticated
4. **Creating and executing a malicious flow**: The attacker creates a flow containing a Shell or Process task and triggers its execution
5. **Execution as root**: The created task runs as root inside the Kestra container
6. **Reaching the host**: Because the official `docker-compose.yml` mounts `/var/run/docker.sock`, container root can operate the host's Docker daemon and can escalate to host-level compromise

---

## 3. Timeline — disclosure and response

- 2026-06-09: CVE-2026-53576 is reserved (dateReserved)
- 2026-06-26: Disclosed as GitHub Security Advisory GHSA-2q47-568g-9h4f. Also registered in NVD (CVSS 10.0). Fixed releases 1.0.45 / 1.3.21 are provided
- 2026-06-29: CISA ADP (Vulnrichment) enriches the SSVC (Exploitation: PoC, Automatable: yes, Technical Impact: total)
- As of this Brief's writing: NVD is "Undergoing Analysis." Watch for confirmed reports of exploitation in the wild

> Note: The technical facts are based on the GitHub Security Advisory (GHSA-2q47-568g-9h4f) and the NVD/CIRCL registrations. What is public as of this Brief's writing is vulnerability disclosure and a PoC-stage assessment; it does not assert large-scale exploitation in the wild. Refer to the latest primary sources.

The response and industry movement after disclosure:

- **Kestra (kestra-io)**: Published GitHub Security Advisory GHSA-2q47-568g-9h4f and provided fixed releases 1.0.45 / 1.3.21. Fixed the authentication filter's path judgment
- **NVD / CIRCL**: Registered CVE-2026-53576 at CVSS 10.0. Classified as CWE-94 (code injection) + CWE-288 (authentication bypass via an alternate path)
- **CISA ADP (Vulnrichment)**: Enriched the SSVC (Exploitation: PoC, Automatable: yes, Technical Impact: total). Made visible that automated exploitation is easy and the technical impact is total
- **Operational point**: Because the official `docker-compose.yml` mounts `/var/run/docker.sock` in the default configuration, container compromise can connect directly to host compromise. Minimizing the socket mount, tightening container privileges, and immediately updating versions were shared as emergency responses
- **Cross-industry point**: For orchestration / agent platforms, the design of "not making the authentication decision depend on surface attributes of the request that an attacker can manipulate," and the independent verification of authority per action, were re-recognized as the points that determine the platform's safety

---

## 4. Why it wasn't stopped

The central failure primitive is that **authorization of the request was decided on a surface signal — "the string at the end of the path" — and it did not independently verify, before execution, whether the request was truly meant to be public (whether the caller had authority)**. The authentication filter judged "this path is public, so let it through," but it did not check "does this caller have authority to execute this flow-create / execution-trigger." The basis for authorization was placed not in verifiable proof of authority, but in the appearance of a URL that the attacker is free to choose.

This incident is isomorphic to [Brief No.003](/critical/briefs/003-starlette-badhost/) (Starlette / BadHost, where an MCP server's authentication was bypassed by manipulating the Host header). Both have the structure where "the authentication decision depends on a surface attribute of the request under the attacker's control (Host header / path suffix), and authority was not independently verified before the action." It connects to [Brief No.046](/critical/briefs/046-servicenow-unauthenticated-api/) (ServiceNow, where a single configuration switched authentication off and customer instances were queried while unauthenticated) in that the presence or absence of authentication toggled on a surface configuration/decision, and unauthenticated reach became a privileged operation directly. It is of the same lineage as [Brief No.066](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/) (LiteLLM, reaching the AI gateway's admin privileges and server code execution while remaining an ordinary user) and [Brief No.027](/critical/briefs/027-librechat-mcp-url-secrets/) (LibreChat, where server secrets leaked from a user-specified MCP URL), in that on orchestration / gateway infrastructure "reach equals execution" and the layer that verifies authority in advance was missing.

An orchestration platform like Kestra is a layer that concentrates "the authority to execute actions" for software agents and data pipelines, and once its authorization is broken, all the execution authority the platform bundles passes to the attacker.  Only when the authority of the party requesting each "action" of creating and executing a flow is independently verified can an orchestration platform be placed into practical use with confidence.

The early disclosure of the vulnerability, the severity assessment via CVSS/SSVC, the provision of fixed releases (1.0.45 / 1.3.21), and the enrichment by CISA ADP are indispensable for grasping the scope of impact and judging emergency patch application, and this Brief does not deny that role. Signature-based detection and WAF rules also contribute to observing known bypass patterns. Detection certainly plays its part.

At the same time, detection does not itself change "which requests the receiving side (the Kestra authentication filter that processes the request, the runtime that executes the flow) accepts, and with whose authority." In this incident, a request with the path suffix `configs` passed the authentication filter's judgment legitimately, so an unauthenticated request reached flow-create / execution-trigger. What was missing is a layer that independently verifies, before execution, "does this caller have authority to perform this privileged operation," and this is verification of a different lineage from the formal judgment of the path. Even if anomaly detection fires after execution, the root execution at the moment the filter accepted it is not stopped. As material for proving in an audit "whether this flow execution was by a legitimate, authorized party," the mere fact that the request passed the authentication filter does not constitute an independent record of the caller's authority.

---

## 5. What proof would have changed

Pre-execution attestation confirms, before a privileged operation (creating and executing a flow), the authority of the party requesting it in an independently verifiable form, decoupled from the formal judgment of the path. If proof of authority does not accompany the request, it blocks execution up front no matter what path the request has. Passing the authentication filter (the detection-like "this path goes through") and pre-execution attestation of the caller's authority ("this party has authority to execute this flow") are not substitutes but **complements**, and only when the two overlap can automatic execution on an orchestration platform be put into practical use with confidence. Detection and proof are complementary, not substitutes.

Against the gap between detection and proof this incident exposed (authorization of the request decided on the string at the end of the path, with authority not independently verified before the action), Lemma proposes the following design.

- **Per-action pre-execution attestation of authority**: Before privileged operations such as creating and executing a flow, independently verify the authority of the party requesting it, decoupled from the formal judgment of URL paths or headers, and reject execution up front if proof does not accompany it (proof-as-auth)
- **No reliance on surface signals**: Place the basis for authorization not in surface attributes the attacker is free to choose, such as path suffixes and headers, but in verifiable proof of authority
- **Fixing the provenance of executables**: Fix the provenance of the executed flow / task in a tamper-proof form, and exclude unauthenticated, injected executables from the authorization path
- **Selective disclosure**: Without disclosing the party's authority attributes themselves, prove with minimal disclosure only that "this party has authority to perform this operation"

Detection (after-the-fact patch application, anomaly detection, severity assessment) works to remediate harm, and pre-execution attestation (independent verification of authority before the privileged operation) works to establish trust in the orchestration platform; the two operate complementarily.

---

## 6. Sources

- **GitHub Security Advisory**: GHSA-2q47-568g-9h4f “Kestra: Unauthenticated RCE via /configs path-suffix auth-filter bypass” — <https://github.com/kestra-io/kestra/security/advisories/GHSA-2q47-568g-9h4f>
- **NVD**: CVE-2026-53576 — <https://nvd.nist.gov/vuln/detail/cve-2026-53576>
- **CIRCL Vulnerability-Lookup**: CVE-2026-53576 (CVSS 10.0, SSVC, CWE-94/288) — <https://vulnerability.circl.lu/vuln/cve-2026-53576>
- **Help Net Security**: context of agentic AI security failures (OWASP, 2026-06-11) — <https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/#authority), [Trust402](https://lemma.frame00.com/trust402/)
