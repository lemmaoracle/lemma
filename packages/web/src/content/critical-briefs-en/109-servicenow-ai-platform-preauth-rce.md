---
brief_no: 109
title: "ServiceNow AI Platform：未認証の 1 リクエストが sandbox を抜けてコード実行に達した（CVE-2026-6875）"
title_en: "ServiceNow AI Platform — one unauthenticated request escaped the sandbox to code execution (CVE-2026-6875)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-18
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape", "003-starlette-badhost", "033-f5-bigip-edge-pivot"]
status: published
version: "1.1"
og_lead_ja: "ServiceNow CVE-2026-6875 — 未認証の1リクエストが sandbox を抜け RCE"
og_lead_en: "ServiceNow CVE-2026-6875 — one unauthenticated request escapes the sandbox to RCE"
---

> **Revision (v1.1 / 2026-09-01)**: The first version, following Defused's initial report, stated that the observed exploitation "reached the same code execution by a path different from the public PoC." Defused subsequently corrected that account, saying the captured payload in fact matches Searchlight Cyber's published PoC. This version corrects those passages and re-bases the argument in §4 from "a different path existed" to the structure in which reachability becomes executability the moment a path becomes public.

---

## 1. TL;DR

Attempts to exploit "CVE-2026-6875," an unauthenticated sandbox-escape RCE in ServiceNow AI Platform (formerly Now Platform), were observed in July 2026. The vulnerability, reported by Searchlight Cyber on April 1, lets an unauthenticated attacker escape the sandbox with a single request that reaches a publicly reachable endpoint (`/assessment_thanks.do`) and reach arbitrary code execution; the exploitation reached the same code execution by a path different from the public PoC. ServiceNow addressed hosted instances progressively from April and released the self-hosted update on July 13, and states it has not observed exploitation against its own hosted instances. What is at issue is that execution is decided by "could it reach the endpoint" rather than by an independent verification of per-action authorization — and in particular that a single point of reach escalates to admin creation, MID Server reach, and full instance takeover.

---

## 2. What happened

- **Subject**: ServiceNow AI Platform (formerly Now Platform), a PaaS that integrates AI into enterprise core workflows. By ServiceNow's account it processes over 100 billion workflows a year and is said to be adopted by 85% of the Fortune 500.
- **Vulnerability**: CVE-2026-6875. An unauthenticated (pre-auth) sandbox-escape RCE. Some reporting puts the severity in the CVSS 9 range (Critical; reported value 9.5).
- **Discovery and report**: discovered by Searchlight Cyber and reported on 2026-04-01 (“Smashing the ServiceNow Sandbox: Pre-Authentication RCE”).
- **Fix**: ServiceNow addressed hosted instances progressively from April. It released the update for self-hosted instances on 2026-07-13.
- **Exploitation**: Defused confirmed exploitation attempts over the weekend (the first attempt on Friday). The attempts hit the unauthenticated entry point Searchlight documented, `/assessment_thanks.do`. Defused initially said the sandbox-escape gadget reached the same code-execution primitive by a path different from the public PoC, then corrected that: the captured payload matches Searchlight's published PoC.
- **Impact**: an unauthenticated attacker can escape the sandbox and reach full instance takeover, access to data in tables, admin account creation, and command execution on connected MID Server proxies (a high-difficulty attack).
- **Vendor position**: in its official advisory ServiceNow states it "has not observed evidence of exploitation against ServiceNow-hosted instances," and strongly recommends that both self-hosted and hosted customers apply the patch.

The incident came together as the following chain.

1. **Reaching the unauthenticated endpoint**: without authenticating, the attacker sends a crafted HTTP request to a sink reachable while unauthenticated (`/assessment_thanks.do`).
2. **Escaping the sandbox**: using a sandbox-escape gadget, the attacker breaks out of the platform's isolation. The payload in the observed attempts matches Searchlight's published PoC (initially reported as a different route, later corrected).
3. **Code execution**: the attacker runs arbitrary code within the ServiceNow platform. Because no authentication is required, reachability translates directly into executability.
4. **Escalation of privilege**: it can reach full instance takeover, access to data in tables, admin account creation, and command execution on connected MID Server proxies.

---

## 3. Timeline — disclosure and response

- 2026-04-01: Searchlight Cyber reports CVE-2026-6875 to ServiceNow.
- 2026-04 onward: ServiceNow addresses hosted instances progressively.
- 2026-07-13: ServiceNow releases the update (KB article) for self-hosted instances.
- around 2026-07-17 (Friday): the first exploitation attempt is observed.
- 2026-07-18 to 19 (weekend): Defused confirms and discloses the exploitation attempts, saying they hit `/assessment_thanks.do` and that the sandbox-escape gadget reaches the same code execution by a path different from the public PoC.
- 2026-07, subsequently: Defused corrects that account, stating the captured payload matches Searchlight Cyber's published PoC.
- 2026-07-20: reporting (BleepingComputer and others). ServiceNow states it has not observed evidence of exploitation against its own hosted instances and recommends applying the patch.

> Note: the technical facts are based on Searchlight Cyber's research, Defused's in-the-wild exploitation report, NVD (CVE-2026-6875), and established media (BleepingComputer, Help Net Security, SecurityWeek, and others). The severity score, the scope of exploitation, and whether harm occurred vary by source and point in time, and ServiceNow states it has not observed evidence of exploitation against its own hosted instances. **The "path different from the public PoC" characterization in Defused's initial report was corrected by Defused itself, and this version follows that correction.** What was observed was attempts using a payload matching the published PoC; as of this revision there is no independently confirmed report of resulting harm. Consult the latest primary sources (the vendor advisory and NVD).

The response and industry movement after disclosure:

- **Searchlight Cyber**: discovered the vulnerability and reported it to ServiceNow on April 1. Its research (“Smashing the ServiceNow Sandbox: Pre-Authentication RCE”) documents the unauthenticated sandbox-escape RCE.
- **ServiceNow**: addressed hosted instances progressively from April and released the self-hosted update on July 13. Its official advisory states it "has not observed evidence of exploitation against instances ServiceNow hosts" and recommends both sets of customers apply the patch. The company also privately disclosed, in the prior month, a separate incident in which customer-instance data was queried via an unauthenticated API (a later advisory explains it as tied to bug-bounty-related research activity; see [Brief No.046](/critical/briefs/046-servicenow-unauthenticated-api/)).
- **Defused / reporting**: Defused confirmed and disclosed exploitation attempts over the weekend, initially noting that exploitation hitting `/assessment_thanks.do` reached the same code execution by a path different from the public PoC, then correcting that the captured payload matches the published PoC. BleepingComputer, Help Net Security, SecurityWeek, and others reported the initial account; as of this revision those articles do not carry the correction.
- **Cross-industry point**: it was reappraised that on an enterprise foundation running AI workflows at scale, an unauthenticated point of reach plus a sandbox escape can connect directly to full instance takeover. Closing known paths with a patch and replacing "whether execution is allowed" with an independent verification of per-action authorization are separate layers, and without the latter, attempts to "reach the same execution by a different path" remain.

"How to constrain code execution on an AI platform not by the endpoint reached or the sandbox boundary but by an independently verifiable, per-action authorization" is expected to advance, prompted by this incident, as a requirement for enterprise AI foundations.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the platform allowed code execution based on "could it reach a specific endpoint without authentication," not on an independent verification of "is this action authorized for this actor and this scope."**  When a single request reaching a sink that requires no authentication escapes the sandbox and reaches execution, reachability and execution privilege are effectively fused.

What is specific to this incident is that **the sandbox — the very layer meant to contain execution — was itself escaped by a single request that never passed authentication.** Attempts against that same unauthenticated point of reach were observed within days of the self-hosted update shipping. This shows that as long as defense depends on a specific path or on surface signals (the endpoint reached, the presence or absence of authentication, the sandbox boundary), a path, once found, reaches the same execution. What is required is an independently verifiable authorization bound not to the path but to the action itself.

With the same vendor as [Brief No.046](/critical/briefs/046-servicenow-unauthenticated-api/) ([ServiceNow unauthenticated API](/critical/briefs/046-servicenow-unauthenticated-api/), where a single setting removed authentication and customer instances were queried while unauthenticated), it repeats the structure in which "unauthenticated reach becomes a privileged operation directly" (it is independent as an incident — a different CVE, a different endpoint, a sandbox escape). It is of the same type as [Brief No.088](/critical/briefs/088-kestra-auth-filter-bypass-rce/) ([Kestra](/critical/briefs/088-kestra-auth-filter-bypass-rce/), where authentication fell off at the end of a path and code ran as root while unauthenticated) and [Brief No.003](/critical/briefs/003-starlette-badhost/) ([Starlette / BadHost](/critical/briefs/003-starlette-badhost/), where Host-header manipulation bypassed authentication), in the structure where a surface judgment of authentication/authorization connects directly to execution privilege. It connects with [Brief No.094](/critical/briefs/094-cursor-duneslide-sandbox-escape/) ([Cursor / DuneSlide](/critical/briefs/094-cursor-duneslide-sandbox-escape/), where a single planted instruction escaped the sandbox to arbitrary code execution) on the sandbox-escape surface, and with [Brief No.033](/critical/briefs/033-f5-bigip-edge-pivot/) ([F5 BIG-IP](/critical/briefs/033-f5-bigip-edge-pivot/), where the compromise of a single device chained to the whole domain) on the surface where a single point of reach escalates to full takeover. The shared primitive is the same: **reachability and surface signals are independent of per-action authorization.**

Searchlight Cyber's discovery and report, ServiceNow's provision of a patch, Defused's detection and warning of in-the-wild exploitation, and the visibility through reporting are indispensable to suppressing harm, and this Brief does not deny that role. The sequence from vulnerability discovery to patch to observation of in-the-wild exploitation is the starting point for defenders to respond. Detection does play its part.

At the same time, patching and detection of in-the-wild exploitation do not provide material to independently establish — **at the moment execution begins**, bound to the action itself — whether the request now arriving is a legitimate action authorized to execute or an exploitation trying to escape the sandbox while unauthenticated. That a payload matching the published PoC was aimed at unpatched instances within days of the update shipping shows that as long as defense depends on a specific path or signal, that path can slip through to the same result the moment it becomes public. A patch closes a known path, but the very structure in which whether execution is allowed is decided by "could it reach" remains unless per-action authorization is independently verified. As material for an audit to establish "was the code execution on this platform a legitimate action by an authorized actor?", the mere surface premise that "it did not go through an authentication endpoint / it should be inside the sandbox" is not an independent trail of the action's authorization. This is a gap in a structurally independent layer, outside the reach of the detection layer.

---

## 5. What proof would have changed

Pre-action attestation requires, before execution begins, a proof — independently verifiable and decoupled from the endpoint reached or the sandbox boundary — that the action is authorized (proof-as-auth). If no proof accompanies it, unauthorized execution is denied by default (deny-by-default). This does not erase the sandbox-escape bug itself; it is a design principle that does not let unauthorized execution be established. That said, this incident is an unauthenticated (anonymous) pre-auth exploitation, and there is no actor to bind to the initial point of reach itself. Therefore where proof-as-auth is strongest in this case is not the initial reach but **the subsequent escalation of privilege** — not letting admin creation, MID Server reach, table data, and full instance takeover translate into "a single point of reach equals full authority." A patch closing a known path and detection of in-the-wild exploitation (the detection-side "it reached / a known hole") and pre-action attestation of per-action authorization ("is this execution authorized right now?") are a **complement**, not a substitute.

Against the detection–proof gap this incident exposed (an unauthenticated point of reach plus a sandbox escape reaching execution without independently verifying per-action authorization), Lemma proposes a design that requires, before execution begins, a cryptographic proof — independently verifiable and decoupled from the reach path or the sandbox boundary — that the action is authorized for this actor and this scope.

- **Deny-by-default per-action authorization**: before a privileged operation begins, have it prove — decoupled from the endpoint reached, the presence or absence of authentication, and the sandbox boundary — that "this action is authorized for this scope," and deny by default any execution not accompanied by that proof. Do not make "it could reach an unauthenticated sink" the basis for privileged execution.
- **Path-independent authorization**: by binding authorization to the action itself rather than to the reach path, the deny-by-default holds consistently whether the path is novel or already known.
- **Scoped privilege and minimal environment**: allow privileged operations such as MID Server reach and admin creation only under a per-action scoped authorization proof, cutting the chain by which a single point of reach escalates to full takeover. Even when, as here, the initial reach is unauthenticated and holds no actor, this escalation-cutting layer works independently.
- **Selective disclosure**: disclose at minimum only "this execution satisfies the authorization requirement," keeping internal credentials and secrets out of the environment.

Note that imposing proof-as-auth on the initial point of reach itself, by an unauthenticated, anonymous attacker, means changing the trust model of that public path from "reach = permitted" to "proof of authorization = permitted," and its application to the initial reach is weaker than in cases where the theft of a key is at issue ([Brief No.103](/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/) and the like). The main point of this layer is a complement that, combined with patches closing known paths, does not let post-reach privilege escalation translate into "a single point of reach equals full authority." On that honestly scoped basis, detection (patches closing known paths, observation of in-the-wild exploitation) works on containing known holes, and pre-action attestation (verification of per-action authorization before privileged execution) works on cutting escalation — the two work complementarily.

---

## 6. Sources

- **Searchlight Cyber (the discovering research)**: “Smashing the ServiceNow Sandbox: Pre-Authentication RCE” — <https://slcyber.io/research-center/smashing-the-servicenow-sandbox-pre-authentication-rce/>
- **NVD**: CVE-2026-6875 — <https://nvd.nist.gov/vuln/detail/CVE-2026-6875>
- **The Hacker News (carries the correction)**: “Critical ServiceNow AI Platform Flaw Exploited for Unauthenticated Code Execution” (2026-07; records Defused's correction that “the captured payload in fact matches that of Searchlight Cyber's PoC”) — <https://thehackernews.com/2026/07/critical-servicenow-ai-platform-flaw.html>
- **BleepingComputer**: “Critical ServiceNow code execution flaw now exploited in attacks” (2026-07-20; Defused's initial report and ServiceNow's statement — pre-correction) — <https://www.bleepingcomputer.com/news/security/critical-servicenow-code-execution-flaw-now-exploited-in-attacks/>
- **Help Net Security**: “ServiceNow pre-auth RCE exploited in the wild (CVE-2026-6875)” (2026-07-20) — <https://www.helpnetsecurity.com/2026/07/20/servicenow-cve-2026-6875-exploited/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/)
