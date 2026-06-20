---
brief_no: 59
title: "AI ツールに渡した「すべて許可」の OAuth が、ベンダー侵害でそのまま侵入経路になった — 標準的に付与される広範・永続の OAuth が、行動ごとにスコープ・検証されない構造（Vercel / Context.ai）"
title_en: "When \"Allow All\" OAuth to an AI Tool Becomes the Breach Path (Vercel / Context.ai)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-04-19
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "AI ツールへの「すべて許可」OAuth が侵入経路に — Vercel / Context.ai"
og_lead_en: "\"Allow all\" OAuth to an AI tool became the breach path — Vercel"
gap_detected: "The compromised credentials were identifiable in threat-intelligence feeds more than a month before public disclosure, and monitoring and logs captured the activity."
gap_missing: "There was no layer to check before action whether this access stayed within the originally intended scope, so access operating inside a once-granted 'allow all' consent passed straight through."
gap_fix: "Before a high-risk action, independently verify with Lemma that this operation is authorized for this party in this scope and is currently valid, and prevent it up front."
---

## TL;DR

When you start using an AI productivity tool, you hit "Allow all" on the screen that asks "allow access to your email, documents, and calendar" — and that single tap hands the granter's own authority, wholesale, to the tool's vendor (and to whoever later breaches that vendor). On 19 April 2026, Vercel disclosed unauthorized access to internal systems and a limited set of customer credentials. The origin: an employee had granted the AI agent platform Context.ai broad "Allow all" OAuth to their corporate Google Workspace account. Context.ai was hit by an infostealer (Lumma Stealer) in February, attackers seized OAuth tokens in March, and in April used those tokens to pivot through the Vercel employee's Workspace into the internal environment-variable management console. Environment variables stored in readable form (API keys, DB credentials) were exposed, and an actor claiming to be ShinyHunters posted ~580 employee records on BreachForums and claimed to be selling the data for $2M. We analyze this under Pillar 03 (Agent Authority Proof), `agent-infrastructure`, as a structure in which **the broad, long-lived OAuth granted to an AI tool persists as "standing authority" rather than being scoped, authorized, and verified per action.**

---

## 1. Incident overview

- **Disclosure**: On 2026-04-19, Vercel disclosed unauthorized access to internal systems and a limited set of customer credentials (CEO Guillermo Rauch explained the attack chain on X the same day)
- **Root cause**: Compromise of the third-party AI agent platform Context.ai. At least one Vercel employee had granted Context.ai broad OAuth ("Allow all," including full read of Google Drive) to their corporate Google Workspace account
- **What Context.ai is**: An enterprise AI platform that connects to 40+ corporate tools via OAuth/API, processing organizational data to generate content. Its very value proposition presumes broad access to the corporate identity fabric (a high-privilege third party by design)
- **Reachable targets**: Vercel's project settings and environment-variable management console. The attacker accessed environment variables not classified as "sensitive" (i.e. stored in readable form). "Sensitive"-marked variables carry encryption that prevents UI retrieval, and Vercel says there is no evidence of access to those. Reach was per team scope, not a platform-wide single-point exposure
- **Attacker's claims**: An actor claiming to be ShinyHunters posted on BreachForums around 2026-04-19, claiming internal DBs, API keys, GitHub/NPM tokens, source code, etc., and offered ~580 Vercel employee records (names, emails, account status, activity timestamps) as evidence, claiming to sell the data for $2M. ShinyHunters denied involvement (a possible impersonation or splinter; no technical evidence), and Vercel is investigating and has not independently verified the full scope of the claim

---

## 2. Timeline

- 2026-02: A Context.ai employee is infected with Lumma Stealer (per Hudson Rock, via the employee's personal download of a Roblox-related script/tool). Credentials for Google Workspace, Supabase, Datadog, Authkit, etc. are stolen, including admin access to Context.ai's own OAuth-app management environment
- 2026-03: Context.ai later discloses unauthorized access to its AWS environment and possible compromise of some users' OAuth tokens. With the authorization fabric of the "Allow all" OAuth apps seized, the attacker can mint/reuse valid tokens on behalf of consenting users
- 2026-04: The attacker uses the compromised tokens to pivot through the Vercel employee's Google Workspace into the internal environment-variable console
- 2026-04-19: Vercel discloses publicly; the ShinyHunters-claiming actor posts on BreachForums claiming a $2M sale

> Note: The internal infection path / token-seizure details at Context.ai, and the truth of the BreachForums data claim, depend on the ongoing investigation and are not asserted here.

---

## 3. The attack path: a three-hop supply-chain escalation

This incident shows how broad, long-lived OAuth granted to an AI tool chains downstream from a vendor-side compromise, in three clear hops.

1. **Hop 1 — compromise of the AI vendor's endpoint**: A Context.ai employee is infected with an infostealer. Multiple credentials including Google Workspace, plus admin access to Context.ai's OAuth-app management environment, are stolen
2. **Hop 2 — seizing the OAuth tokens**: The attacker seizes Context.ai's AWS environment and OAuth authorization fabric. On behalf of users who consented to "Allow all," they can mint/reuse valid OAuth tokens — standing access requiring no password re-entry
3. **Hop 3 — lateral move to downstream Vercel**: Because a Vercel employee had connected the corporate Workspace to Context.ai with broad OAuth, the attacker uses that token to pivot through the employee's Workspace identity into Vercel's internal systems, reaching the project-settings env-var console and retrieving readable (non-"sensitive") API keys and DB credentials

A contributing factor is a **secret-classification gap**. Vercel's "sensitive environment variable" designation applies encryption readable only at build time, but it is opt-in; by default env-var values are stored readably. If a customer had not marked a variable "sensitive," anyone with project authority — including the attacker who arrived via the compromised OAuth token — can read it. Vercel now supports a team policy that defaults new production/preview variables to sensitive.

---

## 4. Structural analysis

This incident belongs to the `agent-infrastructure` category under Pillar 03 (Agent Authority Proof). The central failure primitive is that **the OAuth granted to an AI tool persists as broad, long-lived "standing authority" rather than a "dynamic authority" scoped, authorized, and verified per action.** AI productivity tools, by their functional requirements (reading and writing across email, documents, internal knowledge), structurally demand broad OAuth scopes. The moment a user authorizes that with a corporate identity, they extend their access posture to the vendor's infrastructure — and to whoever later breaches that vendor. As secondary we note `identity-auth` (authorization of the delegated authority) and `attribute-proof-bypass` (the absence of independent verification of the authority attribute).

As in Brief 029 (an over-scoped OAuth token stolen at github.dev), it is a structure in which "the token is not scoped to the act." Where 029 was over-scoping within a single service, this case adds another axis: **an organization-crossing standing token routed through a high-privilege third party — an AI tool.** And the problem Brief 033 (F5 BIG-IP) showed — "lateral movement via positional trust plus stored credentials" — recurs here on the OAuth trust surface of AI-SaaS integration rather than a network appliance. The common thread: **a party's access depends not on per-occasion authorization, but on broad trust granted once in the past.**

OAuth grants to AI tools, even where procurement vendor-risk assessment is detailed, slip past as "a routine onboarding tap" at the consent screen itself — creating an identity bridge that bypasses the assessment process. The employee who granted it did not necessarily have the authority to grant that level of access on the employer's behalf.

---

## 5. The gap between detection and proof

Infostealer intelligence feeds, OAuth-grant audits, egress monitoring, and EDR are all layers that can function at each stage here, and this Brief does not deny their role. Indeed, Hudson Rock had identified the Context.ai employee's credentials in its feed more than a month before public disclosure. The detection capability existed.

At the same time, detection provides no material to independently establish, **before the access executes**, whether "the access being made with this token right now is within the original authorization." The attacker's operations are formally legitimate access via valid OAuth tokens issued on behalf of consenting users. The Workspace-to-Vercel pivot, too, happens inside the already-granted broad scope, so token-validity checks do not stop it. What the Hudson Rock case shows is that what was missing was not the detection capability but **the workflow connecting intelligence to immediate revocation of standing authority.** From an audit standpoint, too, evidence that independently shows "which token executed which action within which authorization" rarely survives beyond reconciling each service's access logs.

Pre-execution attestation treats authority grants to AI tools not as "broad, long-lived consent" but as authorization scoped and independently verifiable per action (the industry standardization context likewise points toward avoiding user-OAuth pass-through and converting, via RFC 8693 token exchange, into per-operation scoped, auditable tokens). If the proof does not satisfy "this operation is within the granter's authorization and is currently valid," the access is blocked before execution.

Detecting an infostealer infection or OAuth-token compromise after the fact and revoking or rotating the leaked credentials (detection), and independently verifying the party, scope, and validity of the authorization before the action (pre-execution attestation), are **complements**, not substitutes: the former works on discovering the breach and containing the damage, the latter on breaking the chain by which a compromised standing token converts straight into downstream breach access.

---

## 6. Response and industry trends

- **Vercel**: Disclosed on April 19 and continues to investigate. Recommends customers review activity logs, immediately migrate secrets to the "sensitive" designation, and rotate non-sensitive values; provides a team policy defaulting new production/preview variables to sensitive
- **Auditing OAuth in AI-SaaS integration**: A recommended move is to inventory third-party OAuth apps' broad-scope grants in the Google Workspace admin console and prioritize review of apps individually authorized by employees outside IT management. Broad-scope grants are candidates for revocation and re-provisioning at least privilege
- **Credential operations**: Replacing long-lived static secrets in deploy environments with time/scope-limited credentials — AWS IAM roles, GitHub OIDC federation, runtime-fetched secret managers — structurally narrows the blast radius of a single token theft
- **Cross-industry point**: This case is one instance of a repeatable pattern — infostealer infection → OAuth token compromise → lateral move to downstream customers (structurally the same shape as the 2024 Snowflake campaign) — and the need to treat AI productivity tools' broad, long-lived access in the same risk class as traditional cloud providers has become a point of debate

The absence of a design that treats OAuth grants to AI tools not as "standing authority" but as "monitored, revocable, per-action-scoped authorization" is not one vendor's problem; it remains an operational issue across organizations adopting AI SaaS.

---

## 7. Lemma's analysis

Against the detection-and-proof gap this incident exposed (broad, long-lived OAuth to an AI tool persists as standing authority without being scoped, authorized, and verified per action), Lemma proposes a design that backs a tool's or agent's actions not by "presenting a key" but by "a proof of per-action-scoped, independently verifiable authorization." By verifying, before an operation executes, "is this action within the granter's authorization" and "is that authorization currently valid" — rather than relying on the broad consent at grant time — it breaks the chain by which a vendor breach converts a standing token straight into downstream breach access.

---

## 8. Sources

- **Cloud Security Alliance (primary, analysis)**: "AI SaaS as Enterprise Attack Vector: The Vercel–Context.ai Breach" (2026-04-20) — <https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-saas-supply-chain-vercel-contextai-2026/>
- **Vercel (primary, the party)**: "Vercel April 2026 security incident" (Vercel Knowledge Base, 2026-04-19) — <https://vercel.com/kb/bulletin/vercel-april-2026-security-incident>
- **The Hacker News**: "Vercel Breach Tied to Context AI Hack Exposes Limited Customer Credentials" (2026-04-20) — <https://thehackernews.com/2026/04/vercel-breach-tied-to-context-ai-hack.html>
- **BleepingComputer**: "Vercel confirms breach as hackers claim to be selling stolen data" (2026-04) — <https://www.bleepingcomputer.com/news/security/vercel-confirms-breach-as-hackers-claim-to-be-selling-stolen-data/>
- **InfoStealers.com (Hudson Rock)**: "Breaking: Vercel Breach Linked to Infostealer Infection at Context.ai" (2026-04) — <https://www.infostealers.com/article/breaking-vercel-breach-linked-to-infostealer-infection-at-context-ai/>

---

## 9. About Brief distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
