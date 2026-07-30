---
brief_no: 96
title: "Gitea：Docker の既定設定のため、HTTP ヘッダー 1 本で誰でも管理者になりすませた（CVE-2026-20896）"
title_en: "Gitea: a Docker default let anyone impersonate an admin with a single HTTP header (CVE-2026-20896)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["code-provenance"]
incident_date: 2026-06-20
published: 2026-07-07
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["003-starlette-badhost", "088-kestra-auth-filter-bypass-rce", "091-photo-zip-authentication-laundering", "046-servicenow-unauthenticated-api", "033-f5-bigip-edge-pivot"]
status: published
version: "1.0"
og_lead_ja: "Gitea — 既定の逆プロキシ設定で HTTP ヘッダー 1 本の管理者なりすまし（CVE-2026-20896）"
og_lead_en: "Gitea — a default reverse-proxy config lets one HTTP header impersonate an admin (CVE-2026-20896)"
gap_detected: "The detection chain worked — early CVE disclosure, the CVSS 9.8 rating, the fixed releases (1.26.3 / 1.26.4), and Sysdig's probing observation — making the impact and urgency externally visible."
gap_missing: "There is no layer that independently verifies — separately from the auth layer's formal check — whether a request bearing an `X-WEBAUTH-USER` header actually passed through a trusted reverse proxy, and whether its principal holds admin authority."
gap_fix: "Before a privileged action, verify the authenticity of the request's path and the principal's authority — decoupled from the formal check on headers or paths — and stop execution when no proof accompanies it, verified independently by Lemma to prevent it up front."
---

## 1. TL;DR

The official Docker image of the self-hosted Git service Gitea shipped a vulnerability that let anyone impersonate an administrator with a single HTTP header (CVE-2026-20896, CVSS 9.8). Because the image defaulted to `REVERSE_PROXY_TRUSTED_PROXIES = *` (treating every source as a trusted reverse proxy), any deployment with reverse-proxy authentication enabled would grant admin privileges to any sender that simply added `X-WEBAUTH-USER: admin` (the fix is in 1.26.3, and reverse-proxy auth was changed to explicit opt-in). The problem is not the strength of an authentication algorithm; it is that the basis for authorization was placed on a surface signal — "an HTTP header the attacker can freely set" — without independently verifying, before execution, whether that request truly originated from a trusted reverse proxy.

---

## 2. What happened

- **Subject**: Gitea, a self-hosted open-source Git service, widely used as a development platform that consolidates source code, CI/CD, and developer identities.
- **Identifier**: CVE-2026-20896, published as one of the security fixes in Gitea 1.26.3.
- **Severity**: CVSS 9.8 (Critical). An unauthenticated party on the network can obtain administrator privileges.
- **Published**: 2026-06-20 (Gitea 1.26.3 release). Reported by Joshua Martinelle of Tenable and @rz1027; fixed by @bircni.
- **Core of the exploit**: in a deployment with reverse-proxy authentication enabled, an attacker is recognized as an administrator simply by attaching a single `X-WEBAUTH-USER: admin` header, with no credentials at all.
- **Chain of impact**: after reaching admin, it can escalate to reading all private repositories, injecting an SSH key for persistent access, tampering with webhooks to exfiltrate subsequent code pushes, stealing CI/CD secrets, and lateral movement into the server's interior via SSRF through webhooks.
- **Affected versions**: Gitea Docker images at 1.26.2 and earlier. Fixed in 1.26.3; updating to the immediately following 1.26.4 is recommended (it fixes a code-page regression in 1.26.3).
- **Scale**: roughly 6,200 Gitea instances are exposed to the internet (external observation). In the field, the reported state is initial probing detected 13 days after disclosure, with no progression to actual exploitation.

The incident came together as the following chain.

1. **Trusting every source via the default**: the official Docker image bundles `REVERSE_PROXY_TRUSTED_PROXIES = *`, treating every source IP as a "trusted reverse proxy."
2. **Accepting the header as an identity claim**: with reverse-proxy authentication enabled, Gitea accepts an incoming `X-WEBAUTH-USER` header as a reverse-proxy-verified claim of an authenticated identity.
3. **Sending the impersonation header**: the attacker attaches `X-WEBAUTH-USER: admin` to a request for a protected endpoint. No credentials are needed, and there are no other preconditions.
4. **Recognition as administrator**: Gitea recognizes the request as coming from an administrator and permits privileged operations.
5. **Persistence and lateral movement**: it can escalate to reading all private repositories, persistent access via an injected SSH key, tampering with webhooks to exfiltrate subsequent pushes, stealing CI/CD secrets, and reaching the server's interior via SSRF through webhooks.

---

## 3. Timeline — disclosure and response

- 2026-06-20: Gitea 1.26.3 is published, providing several security fixes including CVE-2026-20896. Reverse-proxy authentication is changed to explicit opt-in and the `*` wildcard is removed from the default.
- 2026-06-21: 1.26.4 is published, fixing a code-page regression introduced in 1.26.3. Gitea strongly recommends updating directly to 1.26.4.
- Early 2026-07: the cloud security firm Sysdig reports detecting the first exploitation attempt in the field 13 days after disclosure. It notes, however, that the activity was at the stage of an attacker's initial reconnaissance and had not progressed to exploitation.

> Note: technical facts are based on Gitea's official release announcements (1.26.3 / 1.26.4) and the NVD entry. The CVSS 9.8 is the assessment by the CNA (Gitea); NVD's own reassessment is not yet provided as of writing. Some secondary reporting describes "in-the-wild exploitation at the time of disclosure," but the closest-to-primary Sysdig observation is "initial reconnaissance 13 days after disclosure," and this Brief writes at that precision. Refer to the latest primary sources.

The response and industry movement after disclosure:

- **Gitea (go-gitea)**: fixed CVE-2026-20896 in 1.26.3 and changed reverse-proxy authentication to explicit opt-in (deliberately enabled by an admin), removing the default `*` wildcard. It strongly recommends updating directly to 1.26.4, which fixes the code-page regression in 1.26.3. The same release also provided several security fixes including an SSRF (CVE-2026-22874).
- **NVD**: registered CVE-2026-20896. The CVSS 9.8 (AV:N/AC:L/PR:N/UI:N/C:H/I:H/A:H) is the assessment by the CNA (Gitea); NVD's own reassessment is not yet provided as of writing.
- **Sysdig**: detected the first field probing 13 days after disclosure, but reports it was at the initial-reconnaissance stage with no progression to exploitation.
- **Operational point**: for deployments that use identity headers behind a reverse proxy, it was shared as an emergency measure that the reverse proxy must reliably overwrite/strip the header and that the set of sources Gitea trusts should be minimized. Immediate updating of exposed instances is also recommended.
- **Cross-industry**: header-based authentication via a reverse proxy (delegating identity headers such as `X-WEBAUTH-USER`) is a widely used configuration, and when the premise "the upstream has verified this" collapses at a single default setting, it leads directly to unauthenticated full-authority reach. The need for a design that independently verifies a header-derived identity together with the authenticity of its path was reaffirmed.

---

## 4. Why it wasn't stopped

The central failure primitive is that **the basis for authorization was placed on a surface signal — "the value of an HTTP header the attacker can freely set" — without independently verifying, before acting, whether the request truly came from a trusted path (the reverse proxy).** Gitea decided "the `X-WEBAUTH-USER` says admin, so this party is admin," but never confirmed "did this request actually pass through the reverse proxy responsible for verifying identity." The basis for authorization was placed on how the request looked, not on a verifiable proof of authority.

This case is isomorphic to [Brief 003](/critical/briefs/003-starlette-badhost/) (Starlette / BadHost, where an MCP server's authentication was bypassed by manipulating the Host header). Both share the structure in which "the authentication decision depends on a surface attribute of the request under the attacker's control (the Host header / the `X-WEBAUTH-USER` header), and the principal's authority is not independently verified before acting." It is continuous with [Brief 088](/critical/briefs/088-kestra-auth-filter-bypass-rce/) (Kestra, where authentication fell away simply by ending the path in `/configs`) in that authorization flips on a surface — "a path suffix or header value the attacker can choose" — and unauthenticated reach becomes a privileged operation directly. It connects to [Brief 091](/critical/briefs/091-photo-zip-authentication-laundering/) (Photo ZIP, where a "Calendly-originated" email that passed SPF, DKIM, and DMARC through authentication laundering was a forgery) in that passing a formal authentication check (header consistency / DNS authentication) is not itself a proof of the sender's or principal's authenticity. And it is in the same lineage as [Brief 046](/critical/briefs/046-servicenow-unauthenticated-api/) (ServiceNow, where a single setting removed authentication and customer instances were queried while unauthenticated), where a single default or setting flips authentication on or off and reach equals query.

A development platform like Gitea is a layer that consolidates source code, build pipelines, and developer identities; when its authorization is broken, the code provenance and CI/CD privileges it binds together pass to the attacker at once. Because reaching admin leads directly to SSH-key injection, webhook tampering, and CI/CD secret theft, we tag `code-provenance` as secondary. Webhook tampering that exfiltrates subsequent pushes repurposes a legitimate delivery/storage path into a future code-exfiltration channel, touching the integrity of code provenance. Only when the authority of the principal requesting each "action" — a repository operation or a CI run — is independently verified can a development platform be safely placed into production use.

The early CVE disclosure, the CVSS severity rating, the fixed releases (1.26.3 / 1.26.4), and Sysdig's field observation of probing are indispensable for grasping the scope and deciding on emergency patching, and this Brief does not diminish that role. Observing known impersonation-header patterns with a WAF or IDS also helps the response. Detection does play its part.

But detection does not change what the receiving side — the authentication layer of the Gitea that processes the request — accepts, or on whose authority. Here, a request bearing `X-WEBAUTH-USER: admin` passed the authentication layer's decision legitimately, so an unauthenticated request reached administrative operations. What was missing is a layer that independently verifies — on a separate track from the header's formal check — "did this request actually pass through the reverse proxy responsible for verifying identity," and "does this principal truly hold admin authority." Even if anomaly detection fires after the fact, the administrative access at the moment the authentication layer accepted the request is not stopped. As material to prove in an audit that "this administrative operation was by a legitimately authorized principal," the fact that the request contained a header is not an independent record of the principal's authority.

---

## 5. What proof would have changed

Pre-execution attestation confirms, before a privileged operation, the authority of the principal requesting it — in an independently verifiable form, decoupled from the formal check on headers or paths. When no proof of authority accompanies it, execution is blocked beforehand no matter what headers the request carries. Passing the authentication layer (the detection-flavored "this header goes through") and pre-execution proof of the caller's authority ("this principal holds the authority to perform this administrative operation") are **complements**, not substitutes; only when the two overlap can the consolidated authority of a development platform be safely put into production.

Against the detection-versus-proof gap this case exposed — authorization decided on a surface signal (a header value), without independently verifying the principal's authority and the path's authenticity before acting — Lemma proposes the following design.

- **Pre-execution proof of authority per action**: before a privileged operation such as an administrative or repository operation, independently verify the authority of the principal requesting it, decoupled from the formal check on HTTP headers or paths, and reject execution beforehand when no proof accompanies it (proof-as-auth).
- **No dependence on surface signals**: place the basis for authorization not on surface attributes an attacker can freely set — headers, path suffixes — but on a verifiable proof of authority.
- **Binding the path to the identity claim**: verify an identity claim delegated in a header together with the authenticity of the path (the reverse proxy) that issued it, so that an arbitrary source cannot forge the claim.
- **Selective disclosure**: prove only that "this principal holds the authority to perform this operation," with minimal disclosure, without revealing the principal's authority attributes themselves.

Detection (after-the-fact patching, anomaly detection, severity rating) works to remediate harm; pre-execution proof (independent verification of authority before a privileged operation) works to establish trust in the development platform — each complementary.

---

## 6. Sources

- **Gitea Blog**: “Gitea 1.26.3 and 1.26.4 are released” (the CVE-2026-20896 entry and fix details) — <https://blog.gitea.com/release-of-1.26.3-and-1.26.4/>
- **NVD**: CVE-2026-20896 — <https://nvd.nist.gov/vuln/detail/CVE-2026-20896>
- **The Hacker News**: “Threat Actors Probe Gitea Docker Flaw CVE-2026-20896 13 Days After Disclosure” — <https://thehackernews.com/2026/07/threat-actors-probe-gitea-docker-flaw.html>
