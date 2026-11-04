---
brief_no: 64
title: "Salesloft Drift：連携アプリの OAuth トークンが盗まれ、各社の Salesforce 環境が照会された(UNC6395・Google 脅威インテリジェンス調査)"
title_en: "Salesloft Drift: Stolen OAuth tokens from a trusted integration were used to query companies' Salesforce environments (UNC6395, Google Threat Intelligence)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2025-08-08
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["059-vercel-contextai-oauth", "069-connectwise-cloud-backup-app-identity-credential-abuse", "075-klue-oauth-salesforce-credential-lifecycle", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "006-google-api-key-revocation-lag"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "Salesloft Drift：盗まれた連携の OAuth トークンで各社の Salesforce が照会された（GTIG：700 超の組織に影響の可能性）"
og_lead_en: "Salesloft Drift: stolen integration OAuth tokens used to query companies' Salesforce (GTIG: 700+ organizations possibly affected)"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "連携アプリのトークンで、\n各社の Salesforce が\n照会された。\n<accent>700 超の組織に影響の可能性</accent>"
og_headline_en: "Stolen OAuth tokens\nfrom an integration\nqueried Salesforce.\n<accent>700+ orgs possibly hit.</accent>"
key_figures:
  - value: "700+"
    unit: "orgs"
    label: "Organizations GTIG said may have been affected"
    tone: "alert"
  - value: "08-08 → 08-20"
    label: "From the first queries with the stolen tokens to Salesloft revoking the Drift tokens (queries ran until 08-18)"
  - value: "Mar–Jun"
    unit: "2025"
    label: "Period of unauthorized access to Salesloft's GitHub account, after which tokens were taken from Drift's AWS environment"
glossary:
  - term: "OAuth token"
    desc: "A pass that lets an app connect to another service on a user's behalf. While it is valid, whoever holds it can act with the permissions it was granted."
  - term: "Integration app"
    desc: "An outside app, such as Drift, that connects to a user's Salesforce and works there. The installing organization grants it permission to connect."
  - term: "Case"
    desc: "A Salesforce record for managing support requests. Credentials pasted during the exchange can remain in its body."
insight:
  slug: "standing-integration-token"
  label: "Queries that pass on a valid integration token alone"
  quote: "That an integration's token is valid does not, by itself, tell whether a query made with it is one the integration is actually meant to make."
industries: ["supply-chain"]
operations: ["data-access"]
controls:
  - slug: "limit-and-revoke"
    item: "Narrow a connected app's token scope per operation, and make revocation take effect immediately"
  - slug: "verify-entry"
    item: "Check each operation from a connected app against the grantor's authorization and its current validity"
attack_method: "supply-chain"
impact: "700+ organizations possibly affected (GTIG)"
takeaway: "Nothing checked, before they ran, whether queries made with an integration token were within what was granted; they passed as legitimate integration access."
self_check: "Can you check an operation made with an integration's token against the allowed scope, separately from whether the token is valid?"
countries: ["us"]
---

## 1. Summary

The attacker used not users' passwords but the OAuth tokens of Drift, an integration the companies had installed. The tokens were taken from the integration's side (Drift's AWS environment) and used to connect, as the legitimate integration, to the Salesforce of many organizations that had the same integration. The targets were not only CRM records but AWS access keys and VPN credentials pasted into support Case bodies (GTIG). <strong>That an integration's token is valid does not, by itself, tell whether a query made with it is one the integration is actually meant to make.</strong>

## 2. What got through

- **What got through**: Queries to each company's Salesforce with stolen Drift OAuth tokens (8–18 August 2025). Beyond Account, User and Opportunity, Case bodies were searched for pasted AWS access keys, Snowflake tokens, VPN credentials and passwords. Customer contacts, Case bodies and account records were also exfiltrated (GTIG).
- **What was stopped**: Queries after 20 August, when Salesloft, working with Salesforce, revoked the active Drift tokens and removed the Drift integration from the Salesforce marketplace.
- **What reached the receiving side**: In general, a query with a valid OAuth token arrives as legitimate integration access on a user's behalf. Whether the integration or another party holding the token is using it cannot be told apart at the moment it is accepted.
- **Not disclosed**: A confirmed number of exfiltrated records (the "1.5 billion records from 760 companies" from an extortion group calling itself ShinyHunters is an extortion claim, not independently confirmed), and whether credentials taken from Cases were used on other systems.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever accepts operations from an integration checks, before they run and separately from possession of the token, that the operation is a kind within the granted scope and that the token is still valid.

- **Who approves**: The administrator of the installing organization (the grantor). At install, decide by kind of operation what the integration may do: for example, reading and writing the records its features need is allowed; bulk queries of other objects are not. The breadth of consented permissions alone does not draw this line.
- **Where it is checked**: The part of Salesforce that accepts queries from the integration. It checks whether a query falls within the decided scope and whether the token has been revoked, and refuses it if not.
- **What is recorded**: Which permission each query relied on. What was held and what was let through is kept apart from the integration, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a query from an integration runs, whether it falls within the allowed scope and whether the token is valid, and keeping a record. Detection means examining which records were queried after the fact and revoking the tokens. The dates below are those given by GTIG and in reporting.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before it runs, check the query is within the allowed scope and the token is valid</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>700+ organizations possibly affected (GTIG)<br>Case bodies searched for credentials</span></div>
<div class="rx-zone det"><b>Detection · revocation and investigation</b>Revoke the tokens and examine which records were queried</div>
<div class="rx-g g1"><div class="t">Mar–Jun</div><b>Unauthorized access to Salesloft's GitHub account</b></div>
<div class="rx-g g2"><div class="t">08-08</div><b>Queries with the stolen tokens begin</b></div>
<div class="rx-g g3"><div class="t">08-18</div><b>Last day of the queries</b></div>
<div class="rx-g g4"><div class="t">08-20</div><b>Drift tokens revoked, integration removed</b></div>
</div>
</figure>

Detection and revocation worked: the investigation traced which records were queried, and revoking the tokens stopped further queries. But that came after the queries, and while the tokens were valid the queries passed as legitimate integration access. Similar cases, where a consented integration or OAuth token was the way in, are [Vercel/Context.ai](/critical/briefs/059-vercel-contextai-oauth/) (an "allow all" OAuth grant to an AI tool as the entry point) and [ConnectWise](/critical/briefs/069-connectwise-cloud-backup-app-identity-credential-abuse/) (a vendor's app credential used to sign in to customer tenants); on revocation lag it connects to [Google API keys](/critical/briefs/006-google-api-key-revocation-lag/) (still valid after deletion).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts queries from an integration.** It does not look for intrusions; it checks, before the query runs, whether the integration's query falls within the kinds allowed at install and whether the token is still valid.

### Industries and operations to watch

- **Industry · Procurement & supply chain**: Organizations that connect SaaS such as chat or sales tools to a CRM like Salesforce. Many organizations with the same integration can be affected at once by a single compromise on the vendor's side.
- **Operation · Lookup & data access**: Letting an integration read CRM records. The queries here came not from a user but from the integration's token.

### Current controls vs Lemma

The route in this case is queries with valid tokens before revocation (columns 1 and 2). Column 3 is not this case's route (the queries ran until 18 August; revocation was on 20 August).

| Control | Query within the integration's purpose, with a valid token | Query beyond the integration's purpose, with a valid token | Query with a revoked token |
| --- | --- | --- | --- |
| User multi-factor authentication (MFA) | Not relevant | Not relevant | Not relevant |
| Inventorying and narrowing the OAuth scope granted to integrations | Not effective | Partial | Not relevant |
| Monitoring and after-the-fact analysis of query records | Partial | Partial | Partial |
| Revoking tokens and removing the integration | Partial | Partial | Effective |
| **Lemma (pre-execution check)** | Not effective | Effective | Effective |

MFA is not relevant to this route: the queries were made with tokens and did not go through a user's sign-in. Inventorying scope can narrow how broad the integration's permissions are, but within them any query passes for whoever holds the token. Monitoring and analysis can trace which records were queried, but notice comes after the query. Revocation stops further queries, but not those before it, and exfiltrated records and credentials are not returned. Lemma checks and holds queries beyond the integration's purpose, and queries with revoked tokens, before they run.

Note: Lemma's check works only when the queries allowed for an integration are decided by kind, the check is built into the part of the CRM that accepts queries from integrations, and token validity can be confirmed at the moment of the query. It passes if a query within the decided scope is misused, and a loosely decided scope passes loosely. Lemma does not delete or replace credentials left in the CRM. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organization about apps connected to your CRM

- Do you regularly review the OAuth scope granted to each integration and remove integrations no longer in use?
- Is there a rule against pasting credentials into support Cases, and a procedure to find and invalidate any that are pasted?
- When an integration vendor discloses a compromise, is there a set procedure and owner for revoking that integration's tokens and replacing credentials left in the CRM?

## 5. Facts and timeline

- **Target**: Salesloft's Drift (a chatbot integration) and the customer organizations that connected Drift to Salesforce. The attacker used the OAuth tokens Drift held to query each company's Salesforce.
- **Threat actor**: UNC6395 (the tracking name used by Google Threat Intelligence Group [GTIG] / Mandiant). GTIG distinguishes it from ShinyHunters (UNC6040), tied to a separate Salesforce-related attack in June 2025.
- **Scale**: GTIG said 700+ organizations may have been affected. An extortion group calling itself ShinyHunters claims it stole 1.5 billion records from 760 companies using the compromised Drift OAuth tokens (an extortion claim, not independently confirmed).
- **Targeted data**: Beyond Account, User and Opportunity, secrets embedded in Case bodies (AWS access keys, Snowflake tokens, VPN credentials, passwords). Customer contacts, Case bodies and account records were also exfiltrated.
- **Route in**: Salesloft's GitHub account was accessed without authorization from March to June 2025, after which the customer-integration OAuth tokens were taken from Drift's AWS environment (as reported by The Hacker News).

### Timeline

- **2025-03–06**: UNC6395 gained unauthorized access to Salesloft's GitHub account (pulling repositories, adding a guest user, setting up workflows), then reached Drift's AWS environment and obtained the customer-integration OAuth tokens.
- **2025-08-08**: UNC6395 began querying companies' Salesforce environments with the stolen Drift OAuth tokens (until the 18th), searching Cases and more for secrets.
- **2025-08-20**: Salesloft, working with Salesforce, revoked the active Drift tokens, removed the Drift integration from the Salesforce marketplace, and took Drift temporarily offline.
- **After**: GTIG / Mandiant disclosed it as UNC6395. Identifying affected organizations and replacing potentially exposed credentials proceeded.

> The number of affected organizations rests on GTIG's "700+ potentially affected." The "760 companies, 1.5 billion records" is an extortion claim from the party calling itself ShinyHunters, not independently confirmed. The actor name (UNC6395) and its distinction from UNC6040 are GTIG / Mandiant's assessment. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Salesloft / Salesforce**: Salesloft revoked the active Drift tokens on 20 August, removed the Drift integration from the Salesforce marketplace, and took Drift temporarily offline.
- **GTIG / Mandiant**: investigated and disclosed it as UNC6395.
- **Inventorying OAuth integrations**: inventorying the OAuth scope granted to trusted SaaS integrations, and moving broad, persistent grants to revocable authorizations scoped per operation, has been recommended.
- **Secrets inside the CRM**: not pasting secrets into support Cases (and detecting it), and managing the origin and expiry of stored credentials, became points of discussion.

## 6. Sources

- **Google Cloud / GTIG (primary, investigation)**: "Data Theft from Salesforce Instances via Salesloft Drift" (UNC6395, OAuth token theft and impact scope) — <https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift>
- **The Hacker News**: "GitHub Account Compromise Led to Salesloft Drift Breach" (2025-09, root cause = GitHub compromise) — <https://thehackernews.com/2025/09/github-account-compromise-led-to.html>
- **The Hacker News**: "Salesloft Takes Drift Offline After OAuth Token Theft Hits Hundreds of Organizations" (2025-09) — <https://thehackernews.com/2025/09/salesloft-takes-drift-offline-after.html>
- **AppOmni**: "Salesloft Drift–Salesforce Breach (UNC6395): Why Salesforce OAuth Integrations are a Growing Risk" — <https://appomni.com/blog/drift-breach-salesforce-unc6395-saas-prevention/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
