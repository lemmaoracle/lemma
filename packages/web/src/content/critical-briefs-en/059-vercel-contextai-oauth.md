---
brief_no: 59
title: "Vercel：従業員が AI ツール Context.ai に渡した OAuth が、ベンダーの侵害を経て社内への入口になった(Vercel 開示)"
title_en: "Vercel: An employee's OAuth grant to the AI tool Context.ai became a way into internal systems after the vendor was breached (Vercel disclosure)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-04-19
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["064-salesloft-drift-oauth-salesforce", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "Vercel：従業員が AI ツール Context.ai に「すべて許可」で渡した OAuth が、Context.ai の侵害を経て社内システムへの入口になったと開示"
og_lead_en: "Vercel: an employee's \"Allow all\" OAuth grant to the AI tool Context.ai became a way into internal systems after Context.ai was breached, Vercel disclosed"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン攻撃"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "AI ツールに渡した\nOAuth が、ベンダーの\n侵害を経て入口に。\n<accent>Vercel が 4 月に開示</accent>"
og_headline_en: "An OAuth grant to\nan AI tool became\na way in via its vendor.\n<accent>Vercel disclosed it.</accent>"
key_figures:
  - value: "02 → 04-19"
    label: "From a Context.ai employee's infostealer infection (Hudson Rock) to Vercel's disclosure (2026)"
  - value: "1+"
    unit: "month"
    label: "How long before the disclosure Hudson Rock had identified the infected employee's credentials in its feed"
  - value: "40+"
    unit: "tools"
    label: "Corporate tools Context.ai connects to via OAuth and APIs"
glossary:
  - term: "OAuth token"
    desc: "A pass that lets an app connect to another service on a user's behalf. While it is valid, it can act with the granted permissions without re-entering a password."
  - term: "Infostealer"
    desc: "Malware that pulls stored credentials and sessions from an infected device. Here, Lumma Stealer (Hudson Rock)."
  - term: "Sensitive environment variable"
    desc: "A Vercel setting that encrypts a value so it cannot be retrieved from the UI. It is opt-in; values not marked are stored in readable form."
insight:
  slug: "standing-ai-tool-oauth"
  label: "Access that passes on a consented OAuth grant alone"
  quote: "Once broad OAuth has been granted to an AI tool, anyone using its valid token arrives as the person who granted it."
industries: ["ai", "developers"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "Before an operation, confirm that its authorization is currently valid"
  - slug: "limit-and-revoke"
    item: "Scope OAuth grants to the operation, and refuse revoked tokens"
attack_method: "supply-chain"
impact: "Unauthorized access to internal systems and some customer credentials (Vercel's disclosure)"
takeaway: "Nothing checked, before it ran, whether access with the OAuth token granted to an AI tool was within what was allowed; it passed as legitimate access."
self_check: "Does your organization know the OAuth scope each employee has individually granted to AI tools?"
countries: ["us"]
---

## 1. Summary

The attacker used not a Vercel employee's password but the OAuth grant made when the employee connected the corporate Google Workspace to an AI tool with "Allow all." The token was obtained from the AI tool vendor's side and, through the employee's Workspace identity, reached Vercel's internal systems and the project environment-variable console (per Vercel's disclosure and CSA's analysis). <strong>Once broad OAuth has been granted to an AI tool, anyone using its valid token arrives as the person who granted it.</strong>

## 2. What got through

- **What got through**: Access with the compromised token to internal systems via a Vercel employee's Google Workspace, and reading of environment variables not marked "sensitive" (API keys, DB credentials and the like) (April 2026). Reach was per team scope, not a platform-wide exposure (Vercel).
- **What did not get through**: Environment variables marked "sensitive." They are encrypted against UI retrieval, and Vercel says there is no evidence of access to them.
- **What reached the receiving side**: In general, access with a consented OAuth token arrives as legitimate access on a user's behalf, without a password being entered. Whether the AI tool or another party that obtained the token is using it cannot be told apart at the moment it is accepted.
- **Not disclosed**: The detailed path of the infection and token seizure inside Context.ai, and the truth and full scope of the BreachForums claim that the data included internal DBs, API keys and source code (Vercel is investigating and has not independently verified it).

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever accepts access from an AI tool checks, before it runs and separately from possession of the token, that the operation is a kind that was allowed and that the token is still valid.

- **Who approves**: The administrator of the organization that lets an AI tool connect to its corporate identity. At connection, decide by kind of operation what the tool may do: for example, reading the mail and documents its features need is allowed; reading internal system settings or secret values is not. The breadth of an "Allow all" click on the consent screen alone does not draw this line.
- **Where it is checked**: The part of Workspace or internal systems that accepts operations from the AI tool's token. It checks whether the operation falls within the decided kinds and whether the token has been revoked, and refuses it if not.
- **What is recorded**: Which token performed which operation under which permission. What was held and what was let through is kept apart from the AI tool, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before an operation from an AI tool's token runs, whether it is a kind that was allowed and whether the token is valid, and keeping a record. Detection means finding leaked credentials or a compromise after the fact, revoking the tokens and replacing values. The dates below are those given in the disclosures and analyses by Vercel, Hudson Rock and CSA.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before it runs, check the operation is an allowed kind and the token is valid</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Unauthorized access to internal systems and some customer credentials (Vercel)<br>Non-"sensitive" environment variables were read</span></div>
<div class="rx-zone det"><b>Detection · identification and revocation</b>Identify leaked credentials, revoke tokens and replace values</div>
<div class="rx-g g1"><div class="t">02</div><b>Context.ai employee infected with an infostealer</b></div>
<div class="rx-g g2"><div class="t">03</div><b>Unauthorized access to Context.ai's AWS environment</b></div>
<div class="rx-g g3"><div class="t">04</div><b>Token used to reach Vercel's internal systems</b></div>
<div class="rx-g g4"><div class="t">04-19</div><b>Vercel discloses</b></div>
</div>
</figure>

The material for detection existed: Hudson Rock had identified the infected employee's credentials in its feed more than a month before the disclosure. But connecting that to revoking the token was a later step, and while the token was valid the access passed as legitimate access inside the already-granted broad scope. Similar cases, where a consented integration's OAuth token was the way in, are [Salesloft Drift](/critical/briefs/064-salesloft-drift-oauth-salesforce/) (an integration's tokens used to query companies' Salesforce) and [github.dev](/critical/briefs/029-github-dev-oauth-token/) (theft of an over-scoped OAuth token); on lateral movement with stored credentials it connects to [F5 BIG-IP](/critical/briefs/033-f5-bigip-edge-pivot/), and on revocation lag to [Google API keys](/critical/briefs/006-google-api-key-revocation-lag/) (still valid after deletion).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts operations from an AI tool's token.** It does not look for intrusions; it checks, before the operation runs, whether the AI tool's operation falls within the kinds allowed at connection and whether the token is still valid.

### Industries and operations to watch

- **Industry · AI adoption (all industries)**: Organizations that connect AI tools reading and writing across mail, documents and internal knowledge to their corporate identity. Because the tools' features ask for broad OAuth scopes, a single compromise on the vendor's side can reach the identities of the organizations connected. Even where procurement review is detailed, the consent screen tends to pass as a routine onboarding step.
- **Industry · Developers & agent operations**: Development organizations that keep API keys and DB credentials as environment variables in deploy environments. Values stored in readable form can be read by anyone who gains project authority.
- **Operation · Accounts & permissions**: Employees granting third-party OAuth apps broad rights to the corporate identity outside IT management.

### Current controls vs Lemma

The route in this case is access with a valid token, inside the already-granted broad scope, that reached internal systems and environment variables (an operation beyond the AI tool's purpose, so mainly column 2). Column 3, operations with a revoked token, does not appear in the disclosures.

| Control | Operation within the AI tool's purpose, with a valid token | Operation beyond the AI tool's purpose (internal systems, secret values), with a valid token | Operation with a revoked token |
| --- | --- | --- | --- |
| Employee multi-factor authentication (MFA) | Not relevant | Not relevant | Not relevant |
| Inventorying and narrowing third-party OAuth app scopes | Not effective | Partial | Not relevant |
| Marking environment variables "sensitive" | Partial | Partial | Partial |
| Identifying leaked credentials and revoking tokens | Partial | Partial | Effective |
| **Lemma (pre-execution check)** | Not effective | Effective | Effective |

MFA is not relevant to this route: operations with the token do not go through a password entry. Inventorying can narrow how broad the AI tool's permissions are, but within them any operation passes for whoever holds the token. Marking values "sensitive" keeps them from being read in the UI, but it is opt-in and does not protect unmarked values. Identifying leaks and revoking stops further operations, but not those before it, and values already read are not taken back. Lemma checks and holds operations beyond the AI tool's purpose, and operations with revoked tokens, before they run.

Note: Lemma's check works only when the operations allowed for an AI tool are decided by kind, the check is built into the part of Workspace or internal systems that accepts operations from the token, and token validity can be confirmed at the moment of the operation. It passes if an operation within the decided kinds is misused, and loosely decided kinds pass loosely. Lemma does not encrypt, replace or delete environment-variable values. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm in your organization about corporate identities connected to AI tools

- Do you regularly review the OAuth scope granted to AI tools and re-grant overly broad grants at the scope actually needed?
- Are API keys and DB credentials in deploy environments stored so they cannot be read in the UI, and replaced with credentials limited in time and scope?
- When a connected AI tool's vendor discloses a compromise, is there a set procedure and owner for revoking its tokens and replacing values that may have been read?

## 5. Facts and timeline

- **Disclosure**: On 19 April 2026, Vercel disclosed unauthorized access to internal systems and a limited set of customer credentials. CEO Guillermo Rauch explained the attack chain on X the same day.
- **Context.ai**: An enterprise AI platform that connects to 40+ corporate tools via OAuth and APIs, processing organizational data to generate content. Its features themselves presume broad access to the corporate identity fabric.
- **What was reached**: Vercel's project settings and environment-variable management console. The attacker accessed environment variables not marked "sensitive" (stored in readable form). Reach was per team scope, not a platform-wide exposure (Vercel).
- **Route in**: A Context.ai employee's infostealer infection led to the theft of credentials including Google Workspace, plus admin access to Context.ai's OAuth-app management environment. The attacker took hold of Context.ai's AWS environment and OAuth authorization fabric and could mint and reuse valid tokens on behalf of users who had consented with "Allow all." Because a Vercel employee had connected the corporate Workspace to Context.ai with broad OAuth, that token led through the employee's Workspace identity into Vercel's internal systems (per the disclosures and analyses by Vercel, CSA and Hudson Rock).
- **Attacker's claim**: Someone calling themselves ShinyHunters posted on BreachForums around 19 April 2026, claiming the data included internal DBs, API keys, GitHub/NPM tokens and source code, and offering it for $2M. As evidence they showed records of about 580 Vercel employees (names, emails, account status, activity timestamps). ShinyHunters denied involvement (possibly an impersonation or splinter; no technical evidence).
- **How environment variables are stored**: Vercel's "sensitive" designation applies encryption readable only at build time, but it is opt-in; by default values are stored in readable form.

### Timeline

- **2026-02**: A Context.ai employee was infected with Lumma Stealer (per Hudson Rock, via the employee's personal download of a Roblox-related script or tool). Credentials for Google Workspace, Supabase, Datadog, Authkit and others were stolen, along with admin access to Context.ai's OAuth-app management environment.
- **2026-03**: There was unauthorized access to Context.ai's AWS environment. Context.ai later disclosed this and the possible compromise of some users' OAuth tokens.
- **2026-04**: The attacker used the compromised token to go through a Vercel employee's Google Workspace and reach the internal environment-variable console.
- **2026-04-19**: Vercel disclosed publicly. Someone calling themselves ShinyHunters posted on BreachForums claiming a $2M sale.

> The three hops (infection of the vendor's endpoint, seizure of the OAuth authorization fabric, lateral move into Vercel) rest on the disclosures and analyses by Vercel, CSA and Hudson Rock. The infection path (a Roblox-related download) and the identification of the credentials more than a month before disclosure are Hudson Rock's assessment. The BreachForums data claim comes from the attacker's side, and Vercel has not independently verified its full scope. The details of the infection and token seizure inside Context.ai depend on the ongoing investigation. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Vercel**: Disclosed on 19 April and continues to investigate. It recommended that customers review activity logs, move secrets to the "sensitive" designation and rotate non-sensitive values, and provided a team policy that defaults new production and preview variables to sensitive.
- **Inventorying AI-SaaS OAuth**: Inventorying broad-scope grants to third-party OAuth apps in the Google Workspace admin console, prioritizing apps individually authorized by employees outside IT management, has been recommended. Broad grants are candidates for revocation and re-granting at the scope needed.
- **Credential operations**: Replacing long-lived static secrets in deploy environments with credentials limited in time and scope (AWS IAM roles, GitHub OIDC federation, secret managers fetched at runtime) has been pointed to as the direction.
- **Cross-industry point**: The case has been described as one instance of a repeatable pattern, infostealer infection → OAuth token compromise → lateral move to downstream customers (the same shape as the 2024 Snowflake campaign), and whether AI productivity tools' broad, long-lived access should be treated in the same risk class as traditional cloud providers has become a point of debate.

## 6. Sources

- **Cloud Security Alliance (primary, analysis)**: "AI SaaS as Enterprise Attack Vector: The Vercel–Context.ai Breach" (2026-04-20) — <https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-saas-supply-chain-vercel-contextai-2026/>
- **Vercel (primary, the party)**: "Vercel April 2026 security incident" (Vercel Knowledge Base, 2026-04-19) — <https://vercel.com/kb/bulletin/vercel-april-2026-security-incident>
- **The Hacker News**: "Vercel Breach Tied to Context AI Hack Exposes Limited Customer Credentials" (2026-04-20) — <https://thehackernews.com/2026/04/vercel-breach-tied-to-context-ai-hack.html>
- **BleepingComputer**: "Vercel confirms breach as hackers claim to be selling stolen data" (2026-04) — <https://www.bleepingcomputer.com/news/security/vercel-confirms-breach-as-hackers-claim-to-be-selling-stolen-data/>
- **InfoStealers.com (Hudson Rock)**: "Breaking: Vercel Breach Linked to Infostealer Infection at Context.ai" (2026-04) — <https://www.infostealers.com/article/breaking-vercel-breach-linked-to-infostealer-infection-at-context-ai/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
