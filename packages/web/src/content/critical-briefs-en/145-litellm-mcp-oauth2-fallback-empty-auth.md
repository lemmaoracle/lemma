---
brief_no: 145
title: "AIゲートウェイLiteLLMで、MCP認証の失敗時フォールバックが「検証なしの許可」として機能していた(CVE-2026-59822、CISAが実悪用を確認しKEV登録) — 認証が失敗したことと、認証情報を検証しなかったことは、この設計では区別されなかった"
title_en: "In the LiteLLM AI gateway, the fallback for a failed MCP authentication check quietly behaved as unconditional access (CVE-2026-59822, confirmed under active exploitation and added to CISA's KEV catalog) — in this design, a failed check and no check at all produced the same outcome"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-06-30
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["003-starlette-badhost", "138-servicenow-ai-platform-quad-cve"]
status: published
version: "1.0"
og_lead_ja: "LiteLLMのMCP認証、失敗時フォールバックが無検証許可に(CVE-2026-59822)"
og_lead_en: "LiteLLM's MCP auth fallback silently granted unchecked access (CVE-2026-59822)"
---

## 1. TL;DR

LiteLLM, an open-source "AI gateway" built by BerriAI that centralizes access to AI models, had an authentication-bypass vulnerability, CVE-2026-59822, in its MCP (Model Context Protocol) Streamable HTTP endpoint. When LiteLLM's own API key validation failed, the fallback path silently replaced that failure with an empty authorization object — one treated as always valid — so an attacker with no valid LiteLLM key could reach connected MCP tools and services simply by sending a fabricated Authorization header. GitHub disclosed the flaw on June 30, 2026, and fixed it in v1.84.0, but on September 2, 2026, CISA confirmed active exploitation and added it to its Known Exploited Vulnerabilities (KEV) catalog, giving federal agencies until September 16 to remediate. **Authentication was built to fail. It was not built with a layer, past that failure, that denied access — the absence of verification was itself treated as permission.**

## 2. What happened

- LiteLLM is an open-source AI gateway/proxy that unifies access to more than 100 LLM providers — including OpenAI, Anthropic, and Google — behind a single API, widely used by organizations to centrally manage access to multiple AI models and MCP servers.
- MCP (Model Context Protocol) is the standard protocol through which AI agents connect to external tools and data sources; LiteLLM functions as a gateway mediating connections to a fleet of MCP servers.
- The flaw sat in the authentication handling of LiteLLM's MCP Streamable HTTP endpoint. It supported an OAuth2 "passthrough" for upstream MCP servers — relaying an upstream OAuth2 token alongside LiteLLM's own key validation — but the fallback path for a failed LiteLLM key check swallowed that failure and replaced it with an empty `UserAPIKeyAuth()` object, one treated as always-valid authorization.
- As a result, an attacker holding no valid LiteLLM key could bypass key validation entirely by sending a request with a fabricated Authorization header, then list and invoke the configured MCP tools through LiteLLM.
- GitHub (BerriAI/litellm) disclosed the flaw on 2026-06-30 as security advisory GHSA-7488-6r32-c95q, rating it CVSS 8.8 (High, per GitHub's own advisory), with a fix shipped in v1.84.0.
- About two months after the fix shipped, on 2026-09-02, CISA confirmed the vulnerability was being actively exploited and added it to its KEV catalog. Three of the seven vulnerabilities added that day involved AI-related infrastructure — LiteLLM, Starlette (CVE-2026-48710, already covered in [Lemma Critical Brief 003](/critical/briefs/003-starlette-badhost/)), and JFrog Artifactory — leading security researchers to note this was among the first KEV batches where AI-infrastructure flaws made up a substantial share.
- Security researchers (FOFA) report more than 80,000 internet-facing LiteLLM deployments.

The episode was structured as follows.

1. **Design**: For MCP connections, LiteLLM provided a "passthrough" mechanism supporting both its own key validation and upstream MCP servers' OAuth2 validation.
2. **A miswired fallback**: When LiteLLM's own key check failed, the handler did not treat that failure as an error — it silently substituted an empty authorization object treated as always valid.
3. **Unauthenticated reach**: A fabricated Authorization header alone routed a request through this flawed fallback and into the configured MCP tools.
4. **Disclosure and fix**: The flaw was disclosed via GHSA and fixed in v1.84.0 on 2026-06-30.
5. **Confirmed exploitation and a federal mandate**: CISA confirmed active exploitation and added the CVE to KEV on 2026-09-02, with a remediation deadline of 09-16.

## 3. Timeline — disclosure and response

- 2026-06-30: GitHub (BerriAI/litellm) publishes security advisory GHSA-7488-6r32-c95q for CVE-2026-59822, CVSS 8.8, with a fix in v1.84.0.
- 2026-09-02: CISA adds this vulnerability, along with six others, to its KEV catalog. Three of the seven — LiteLLM, Starlette (CVE-2026-48710), and JFrog Artifactory — were AI-related infrastructure flaws.
- 2026-09-02: CISA sets federal remediation deadlines of 09-05 for Kestra, Artifactory, Switchvox, and SonicWall, and 09-16 for LiteLLM and Starlette.

> Reporting describes an attack campaign against unpatched LiteLLM deployments that chained the Starlette flaw (CVE-2026-48710) with a separate LiteLLM command-injection vulnerability (CVE-2026-42271) to drop the XMRig cryptocurrency miner (The Hacker News, eSecurity Planet, 2026-09). **That chain involves a different pair of vulnerabilities than CVE-2026-59822, the subject of this brief, and no primary source found at the time of writing confirms CVE-2026-59822 itself was used in that specific attack.** CISA's KEV addition establishes only that CVE-2026-59822 on its own was confirmed as actively exploited.

Response and related developments:

- LiteLLM had previously had multiple other vulnerabilities — a SQL injection (CVE-2026-42208) and a command injection (CVE-2026-42271) among them — added to CISA's KEV catalog, making this one of several serious flaws repeatedly confirmed in the same product.
- Starlette (CVE-2026-48710), added to KEV in the same batch, bypasses MCP server authentication through a Host-header parsing discrepancy and is already covered in [Lemma Critical Brief 003](/critical/briefs/003-starlette-badhost/).

## 4. Why it wasn't stopped

This incident's failure is neither an unknown attack technique nor an elaborate evasion. **The design treated the outcome of a failed key check not as "unverified" downstream, but as "always valid" — there was no layer distinguishing a failed verification from no verification at all.**

LiteLLM's MCP Streamable HTTP endpoint had a legitimate feature: OAuth2 passthrough for upstream MCP servers. But its fallback path, when LiteLLM's own key check failed, generated an empty `UserAPIKeyAuth()` object and let processing continue. To the rest of the system, that object was indistinguishable from a verified, valid authorization. A fabricated Authorization header did not pass verification and did not evade it — it simply rode the path that a failed verification, by design, granted.

<strong>A failed check and no check at all produced the same outcome in the system's behavior.</strong> This was not a clever evasion technique — it was a flaw in the design of the fallback path itself, and that design ran in production for more than two months, from the GHSA disclosure on 06-30 to CISA's confirmation of active exploitation and KEV addition on 09-02.

Starlette, added in the same KEV batch ([Brief 003](/critical/briefs/003-starlette-badhost/)), shares the same shape through a different route: a Host-header parsing discrepancy let a path-based authentication check register as passed when it hadn't been, opening the same kind of hole in the authentication layer of the same class of AI-infrastructure component — an MCP server. That LiteLLM and Starlette were both confirmed as actively exploited in the same CISA batch points to a recurring design pattern around MCP authentication handling, not an isolated implementation slip: a failed or bypassed check being treated as implicit permission rather than an explicit denial. It connects, too, to the ServiceNow AI Platform incident in which a single unauthenticated request reached code execution and privilege escalation ([Brief 138](/critical/briefs/138-servicenow-ai-platform-quad-cve/)), in that authorization was not independently re-confirmed immediately before the action.

## 5. What proof would have changed

Proof before the fact replaces a design where "authentication failed, or wasn't performed" silently converts into "permitted," with one where that conversion cannot happen implicitly. It does not stop an MCP gateway from offering a flexible connection method like OAuth2 passthrough. It makes it verifiable, at each action, that a path where verification didn't succeed defaults to denial.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Fail-closed proof of authorization</strong>: when key or token verification fails or is skipped, treat that state itself as an explicit "not authorized," preventing an implicit substitution with a default-permissive empty object.</li>
<li><strong>Per-action authorization for MCP tool calls</strong>: gate a tool call routed through the gateway not on the formal presence of either an upstream OAuth2 passthrough or a LiteLLM key, but on an independent confirmation that the caller is, at that moment, entitled to invoke that tool.</li>
<li><strong>Provenance of the fallback path itself</strong>: make it independently verifiable, at implementation time, that authentication fallback and exception-handling code paths meet the same verification standard as the primary path.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not substitute for patching the LiteLLM or MCP server implementation itself.</li>
<li>It does not judge whether OAuth2 passthrough is the right design choice.</li>
<li>It does not substitute for identifying or attributing which specific attack campaign, if any, used this vulnerability.</li>
</ul>

The difference from after-the-fact vulnerability scanning and KEV listing is here: a KEV addition confirms, after the fact, that a vulnerability was exploited — and for roughly two months between the GHSA disclosure and the KEV addition, this design kept running inside production MCP gateways.

Detection and this layer are complementary, not substitutes. The former surfaces, after the fact, that a vulnerability existed and was exploited; the latter makes sure that "verification failed, or wasn't performed" cannot itself become the basis for permitting the next tool call, before that call happens.

## 6. Sources

- **GitHub / BerriAI (primary, official security advisory)**: "MCP Authentication Bypass via OAuth2 Passthrough Fallback" (GHSA-7488-6r32-c95q, published 2026-06-30) — <https://github.com/BerriAI/litellm/security/advisories/GHSA-7488-6r32-c95q>
- **CISA (primary, official KEV catalog)**: "CISA Adds Seven Known Exploited Vulnerabilities to Catalog" (2026-09-02) — <https://www.cisa.gov/news-events/alerts/2026/09/02/cisa-adds-seven-known-exploited-vulnerabilities-catalog>
- **The Hacker News (independent)**: "CISA Adds Seven Exploited Flaws as Attackers Deploy Reverse Shells and Crypto Miners" (2026-09) — <https://thehackernews.com/2026/09/cisa-adds-seven-exploited-flaws-as.html>
- **eSecurity Planet (independent)**: "CISA Adds 7 Exploited Flaws as Attackers Target AI Infrastructure" — <https://www.esecurityplanet.com/news/news-cisa-exploited-ai-flaws/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

Figures and the sequence of events are based on GitHub's official security advisory (GHSA-7488-6r32-c95q, 2026-06-30) and CISA's official KEV catalog announcement (2026-09-02). The CVSS score follows the issuing source (GitHub Security Advisory) at 8.8; this brief does not adopt the 8.2 figure that appears in some secondary sources. The brief explicitly notes that a connection to the reported cryptomining campaign is unconfirmed.
