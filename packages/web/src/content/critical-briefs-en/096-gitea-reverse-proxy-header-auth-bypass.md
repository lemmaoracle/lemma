---
brief_no: 96
title: "Gitea：公式 Docker イメージの既定設定のため、HTTP ヘッダー 1 本で誰でも管理者になりすませた(CVE-2026-20896)"
title_en: "Gitea: a default in the official Docker image let anyone impersonate an admin with a single HTTP header (CVE-2026-20896)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["code-provenance"]
incident_date: 2026-06-20
published: 2026-07-07
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["003-starlette-badhost", "088-kestra-auth-filter-bypass-rce", "091-photo-zip-authentication-laundering", "046-servicenow-unauthenticated-api", "033-f5-bigip-edge-pivot"]
status: published
layout: "report"
sections: "proof"
gate: "identity"
version: "1.0"
og_lead_ja: "Gitea：公式 Docker イメージの既定設定で、HTTP ヘッダー 1 本で管理者になりすませた（CVE-2026-20896）"
og_lead_en: "Gitea: a default in the official Docker image let one HTTP header impersonate an admin (CVE-2026-20896)"
og_kicker_ja: "脆弱性の公表 · 開発基盤"
og_kicker_en: "VULNERABILITY · DEV PLATFORM"
og_headline_ja: "ヘッダー 1 本で、\n誰でも管理者に\nなりすませた。\n<accent>CVSS 9.8（Critical）</accent>"
og_headline_en: "One HTTP header let\nanyone pose as an admin.\n<accent>CVSS 9.8 (Critical)</accent>"
key_figures:
  - value: "9.8"
    unit: "CVSS"
    label: "Severity (Critical), as rated by Gitea as the CNA. No credentials needed"
    tone: "alert"
  - value: "~6,200"
    unit: "instances"
    label: "Gitea instances exposed to the internet (external observation)"
  - value: "13"
    unit: "days"
    label: "From disclosure to the first probing detected in the field (per Sysdig)"
glossary:
  - term: "Reverse proxy"
    desc: "A server that sits between users and a service and relays their requests. In some setups it authenticates the user and passes the result to the service in a header."
  - term: "Reverse-proxy (header) authentication"
    desc: "A scheme in which the reverse proxy passes the authenticated user's name to the service in a header such as `X-WEBAUTH-USER`, and the service accepts it as an authenticated identity."
  - term: "REVERSE_PROXY_TRUSTED_PROXIES"
    desc: "The Gitea setting for which sources count as trusted reverse proxies. `*` trusts every source."
insight:
  slug: "header-as-identity"
  label: "A header that claims to be the user"
  quote: "When who sent a request is decided only by a value inside the request, anyone who can write that value can act as that person."
industries: ["developers"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check that an admin-claiming header really came from the trusted reverse proxy"
attack_method: "impersonation"
impact: "With reverse-proxy authentication enabled, an unauthenticated party could be recognized as an admin (in the field, only initial probing was reported)"
takeaway: "Under the default, an admin-claiming header was accepted from any source. Before an admin operation, check the path the request came by and who is behind it."
self_check: "For a service that accepts identity headers, can you check, before accepting one, that it came from the trusted reverse proxy?"
countries: ["global"]
---

## 1. Summary

The official Docker image of Gitea, a self-hosted Git service, defaulted to treating every source as a trusted reverse proxy. So in a deployment with reverse-proxy authentication enabled, a request from anywhere was recognized as an administrator just by carrying the header `X-WEBAUTH-USER: admin`. No credentials and no other preconditions were needed. Gitea fixed it in 1.26.3 and made reverse-proxy authentication explicit opt-in. <strong>When who sent a request is decided only by a value inside the request, anyone who can write that value can act as that person.</strong>

## 2. What got through

- **What got through**: A request to a protected endpoint carrying `X-WEBAUTH-USER: admin`, and the resulting recognition as an administrator with privileged operations permitted. Because of the default `REVERSE_PROXY_TRUSTED_PROXIES = *`, the header was accepted as a claim of an authenticated identity whether or not the sender was a reverse proxy (Gitea, NVD).
- **What reached the receiving side**: In general, an identity passed in a header arrives as a string inside the request. From the string alone, it cannot be told whether the reverse proxy that authenticated the user wrote it or the sender added it. The clue that tells them apart is which source the request came from, and the default here did not use that clue.
- **What could follow once admin was reached**: Reading all private repositories, adding an SSH key for persistent access, changing webhooks to send later pushes outside, taking CI/CD secrets, and reaching the server's interior via SSRF through webhooks. These are possible impacts, not confirmed harm.
- **Not disclosed**: Whether any instance had admin rights taken in the field. Sysdig detected the first probing 13 days after disclosure, but reported it was at the initial-reconnaissance stage with no progression to an attack (The Hacker News). How many of the roughly 6,200 exposed instances had reverse-proxy authentication enabled.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that the side running an operation with admin authority checks, before running it and apart from the name written in the request, that the principal behind the request is an administrator.

- **Who approves**: The person who decides who gets admin authority, such as whoever is responsible for running Gitea. Who may perform admin operations such as adding SSH keys, changing webhooks or changing settings, and within what scope, is decided outside the service.
- **Where it is checked**: In two places. Just before accepting an identity header, check that the request came from the trusted reverse proxy. Just before running an admin operation, check that the principal is allowed to perform it. A request that merely says "admin" in a header is stopped without running.
- **What is recorded**: Which approval, whose request and which admin operation was run, kept apart from the fact that the request carried a header.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an admin operation runs, the path the request came by and whether the principal is allowed to perform it, and keeping a record. Detection means noticing a weakness or anomaly after it surfaces. The dates below are when the fixed releases came out and probing was observed, not necessarily when the weakness became exploitable.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before an admin operation, check the path the request came by and the principal's authority</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>With one header, an unauthenticated party<br>was recognized as an admin</span></div>
<div class="rx-zone det"><b>Detection · worked</b>CVE disclosure, fixed releases, Sysdig's observation of probing</div>
<div class="rx-g g1"><div class="t">Before</div><b>Every source trusted by default</b></div>
<div class="rx-g g2"><div class="t">06-20</div><b>Fixed in 1.26.3, CVE published</b></div>
<div class="rx-g g3"><div class="t">06-21</div><b>1.26.4 out, direct update urged</b></div>
<div class="rx-g g4"><div class="t">13 days later</div><b>First probing seen in the field</b></div>
</div>
</figure>

The fixed releases and the observation of probing deal with the weakness found and what followed; they are not a way to check the principal behind a request before an admin operation. Other cases where a value inside the request decided authentication are [Starlette's BadHost](/critical/briefs/003-starlette-badhost/) (manipulating the Host header bypassed an MCP server's authentication) and [Kestra's auth-filter bypass](/critical/briefs/088-kestra-auth-filter-bypass-rce/) (changing the end of the path removed authentication).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that runs operations with admin authority.** It does not look for weaknesses or intrusions; it checks, before running and apart from the name written in a header, that the principal behind the request is allowed to perform that operation.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organizations running a self-hosted development platform such as Gitea behind a reverse proxy. Source code, CI/CD and developer identities are gathered in one place.
- **Operation · Accounts & permissions**: Adding SSH keys, changing webhooks, changing admin settings. A header that says "admin" does not by itself show that the sender is allowed to perform the operation.

### Current controls vs Lemma

What the weakness here was confirmed to allow is column 1; column 2 is the operations that could follow once a request is recognized as an admin.

| Control | Accepting a request with an admin-claiming header (including reading private repositories) | Admin operations (adding SSH keys, changing webhooks) |
| --- | --- | --- |
| Applying the fixed release (1.26.3 / 1.26.4; reverse-proxy auth made explicit opt-in) | Partial | Not relevant |
| Minimizing trusted sources; the reverse proxy overwriting or stripping the header | Partial | Not relevant |
| Anomaly detection (after acceptance) | Not effective | Not effective |
| **Lemma (pre-execution check)** | Not effective | Effective |

The fixed release removes the default trust of every source, but if reverse-proxy authentication is enabled with a broad set of trusted sources, the same kind of request still gets through. Minimizing trusted sources and overwriting or stripping the header narrow who can write it, but they depend on the configuration staying as set. Anomaly detection comes after the request is accepted, so admin access at the moment of acceptance is not stopped. Lemma does not stop the acceptance itself; it checks admin operations such as adding SSH keys or changing webhooks, before they run, against whether the principal is allowed. A record of what ran is also kept, so which operation was performed under which approval can be confirmed without relying only on the fact that the request carried a header.

Note: Lemma's check works only when it is built in just before admin operations run and the approvals are managed outside Gitea. What a request recognized as an admin can read (such as private repositories) is outside this check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for a development platform running behind a reverse proxy

- Is Gitea's official Docker image on 1.26.4 or later?
- If you use reverse-proxy authentication, are trusted sources limited to the actual reverse proxy?
- Can you see, outside the service, a record of when and under whose authority SSH keys were added or webhooks changed?

## 5. Facts and timeline

- **Subject**: Gitea, a self-hosted open-source Git service, widely used as a development platform that gathers source code, CI/CD and developer identities.
- **Identifier**: CVE-2026-20896, published as one of the security fixes in Gitea 1.26.3.
- **Severity**: CVSS 9.8 (Critical, AV:N/AC:L/PR:N/UI:N/C:H/I:H/A:H). This is the rating by Gitea as the CNA; NVD's own reassessment had not been provided as of writing.
- **Report and fix**: Reported by Joshua Martinelle of Tenable and @rz1027; fixed by @bircni.
- **Core of the technique**: The official Docker image defaulted to `REVERSE_PROXY_TRUSTED_PROXIES = *`, treating every source IP as a trusted reverse proxy. With reverse-proxy authentication enabled, attaching `X-WEBAUTH-USER: admin` to a request for a protected endpoint was enough to be recognized as an administrator.
- **Possible impact**: Reading all private repositories, persistent access by adding an SSH key, changing webhooks to send later pushes outside, taking CI/CD secrets, and reaching the server's interior via SSRF through webhooks.
- **Affected versions**: Gitea Docker images at 1.26.2 and earlier. Fixed in 1.26.3; updating to 1.26.4, which fixes a code-page regression in 1.26.3, is recommended.
- **Scale**: Roughly 6,200 Gitea instances exposed to the internet (external observation).

### Timeline

- **(Before)**: Gitea's official Docker image defaulted to `REVERSE_PROXY_TRUSTED_PROXIES = *`.
- **2026-06-20**: Gitea 1.26.3 is published with several security fixes including CVE-2026-20896. Reverse-proxy authentication is made explicit opt-in and the default `*` is removed.
- **2026-06-21**: 1.26.4 is published, fixing a code-page regression in 1.26.3. Gitea strongly recommends updating directly to 1.26.4.
- **Early 2026-07**: Sysdig reports detecting the first exploitation attempt in the field 13 days after disclosure. The activity was at the initial-reconnaissance stage and had not progressed to exploitation.

> Technical facts rest on Gitea's official release announcements (1.26.3 / 1.26.4) and the NVD entry. Some secondary reporting describes "in-the-wild exploitation at the time of disclosure," but the closer-to-primary Sysdig observation is "initial reconnaissance 13 days after disclosure," and this Brief writes at that precision. Refer to the latest primary sources. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Gitea (go-gitea)**: Fixed CVE-2026-20896 in 1.26.3 and changed reverse-proxy authentication to explicit opt-in, deliberately enabled by an admin, removing the default `*`. It strongly recommends updating directly to 1.26.4. The same release also provided several security fixes, including an SSRF (CVE-2026-22874).
- **NVD**: Registered CVE-2026-20896.
- **Sysdig**: Detected the first probing in the field 13 days after disclosure, and reported it was at the initial-reconnaissance stage with no progression to an attack.
- **Advice to operators**: For deployments that use identity headers behind a reverse proxy, having the reverse proxy reliably overwrite or strip the header and minimizing the sources Gitea trusts were shared as emergency measures. Immediate updating of exposed instances is also recommended.

## 6. Sources

- **Gitea Blog**: “Gitea 1.26.3 and 1.26.4 are released” (the CVE-2026-20896 entry and fix details) — <https://blog.gitea.com/release-of-1.26.3-and-1.26.4/>
- **NVD**: CVE-2026-20896 — <https://nvd.nist.gov/vuln/detail/CVE-2026-20896>
- **The Hacker News**: “Threat Actors Probe Gitea Docker Flaw CVE-2026-20896 13 Days After Disclosure” — <https://thehackernews.com/2026/07/threat-actors-probe-gitea-docker-flaw.html>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
