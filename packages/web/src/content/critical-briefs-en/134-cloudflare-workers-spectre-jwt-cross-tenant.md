---
brief_no: 134
title: "Cloudflare Workers で隣接テナントの JWT が Spectre で抜き取れることが示された — 盗まれたトークンが、そのまま利用者として通ってしまう"
title_en: "A co-located tenant's JWT was shown to be extractable from Cloudflare Workers via Spectre — a stolen token passes straight through as the user"
pillar: 03-agent-authority
primary_category: identity-auth
secondary_categories: [agent-infrastructure]
incident_date: 2026-08-19
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["006-google-api-key-revocation-lag", "075-klue-oauth-salesforce-credential-lifecycle", "059-vercel-contextai-oauth", "062-claude-code-github-action-bot-trust", "083-change-healthcare-mfa-credential-access"]
status: published
version: "1.0"
og_lead_ja: "Cloudflare Workers で隣接テナントのJWTがSpectreで抽出可能"
og_lead_en: "Co-located JWT extractable from Cloudflare Workers via Spectre; a stolen token passes"
gap_detected: "Detection can work. Isolating malicious-looking behavior into a separate process (DyPrIs) functions as a monitoring layer."
gap_missing: "There was no layer to verify that whoever presented a stolen JWT was its legitimate holder. Possession of the token passes straight through as identity."
gap_fix: "Replace session auth built on a replayable bearer token with a proof of identity that never sends the key itself."
---

## 1. TL;DR

Cloudflare disclosed that it reassessed and demonstrated a remote Spectre attack on Workers — a serverless environment where many tenants share one OS process — that could **extract a co-located tenant's JWT under production-like conditions**. At up to 12 bits/second with over 99% accuracy, it read from another tenant's memory through a speculative-execution side channel. A JWT is treated such that merely holding it is proof of being "a logged-in user." **What was missing was a layer to verify that whoever presents the token is its legitimate holder.**

## 2. What happened

- The Cloudflare Workers Runtime team, with academic researchers (including Haocheng Xiao of the University of Edinburgh), reassessed the remote Spectre attack on Workers first evaluated in 2021. It published a paper (arXiv:2608.17043); the research was carried out in 2024 and early 2025.
- In production, it demonstrated reading another tenant's memory at up to 12 bits/second with 99% accuracy. Workers co-locates tens of thousands of tenants in one process via V8 isolates; each Worker has its own heap, but a single arbitrary read can lead to cross-tenant leakage.
- Using Durable Objects — built for real-time coordination — the attacker held one isolate alive with WebSocket keep-alives, repeatedly resetting CPU-time and request limits and securing the persistent timing channel the attack needs. This evaded DyPrIs, which isolates malicious-looking scripts only after execution.
- Cloudflare writes that it placed a JWT in the victim Worker and leaked it bitwise. A JWT is the credential many web apps use to prove a user is logged in; stealing it silently means stealing that session.

The chain:

1. An attacker Worker co-locates in the same process as a victim Worker.
2. Durable Objects and WebSockets keep one isolate alive, providing a persistent timing channel.
3. A Spectre side channel reads the neighboring tenant's memory (including a JWT) one bit at a time.
4. Presenting the JWT passes as that session's user, with no check on whether the presenter is the legitimate holder.

## 3. Timeline — disclosure and response

- 2024–early 2025: Cloudflare Workers Runtime team conducts the production reassessment.
- 2025-09: deploys in-process isolation using Memory Protection Keys (MPK).
- 2026-08 (disclosure): Cloudflare publishes the paper and write-up, demonstrating leakage at 12 bits/second with 99% accuracy in production. **The attack was already mitigated in production at disclosure** (improved DyPrIs, integrated V8 Sandbox, MPK), and Cloudflare states it found no indicators of active exploitation over the past three years.

> This Brief concerns a platform's own production demonstration, not real-world harm. The attack was mitigated at disclosure, with no indicators of active exploitation. The figures (12 bits/second, over 99%), the mitigations, and the JWT-extraction experiment all follow Cloudflare's own disclosure.

Points and response:

- The platform mitigated a hard-to-close side-channel path by layering isolation and detection. That is an important defense, but its premise is not that "a stolen credential won't pass on the thief's side."
- A bearer token like a JWT is treated as identity by mere possession, so once leaked, the holder can no longer be distinguished.

## 4. Why it wasn't stopped

The focus here is not only the difficulty of closing a side channel like Spectre. **There is no layer that verifies whether whoever presents a stolen JWT is its legitimate holder.**

A JWT is treated such that holding it is itself proof of being "a logged-in user" (a bearer token). So if a co-located tenant reads it silently via a side channel, the thief can act in that session, indistinguishable from the legitimate user. DyPrIs, which isolates malicious-looking behavior, functions as a defense but was evaded by a persistent connection. What was missing was the step before: verifying that the one presenting this token is really its holder.

> A bearer credential passes as identity by possession. The moment a token leaks, the distinction between the holder and the thief disappears. Identity is secured not by holding a token, but by a proof that can be shown without sending the key.

This runs in the same direction as [Brief 006](/critical/briefs/006-google-api-key-revocation-lag/), where a credential stayed valid after revocation, and [Brief 075](/critical/briefs/075-klue-oauth-salesforce-credential-lifecycle/), where an unrevoked old credential and a long-lived OAuth token became an intrusion path. In each, a credential's possession is not bound to being its legitimate holder.

## 5. What proof would have changed

Proof-as-auth replaces session authentication built on a replayable bearer token with a proof of identity that never sends the key. It does not try to keep the token from leaking (side channels are hard to close). It keeps a leaked token from passing as the user.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Identity proof without sending the key</strong>: base session auth not on a secret that passes by possession (a bearer token), but on a proof only the legitimate holder can show without sending the key itself.</li>
<li><strong>Verifying the presenter's legitimacy</strong>: make it possible for the receiving side to verify, before authorizing an action, that the one presenting the credential is its legitimate holder — not treating possession as identity.</li>
<li><strong>Scope and short life</strong>: pin the authority a session can demonstrate to what is needed, narrowing the replay window if it leaks.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>Closing a side channel like Spectre itself is the job of runtime and CPU isolation and mitigation. This layer sits after that, keeping a leaked token from passing as the user.</li>
<li>Proof can show only that a presenter is the legitimate holder — not protect against a user's own endpoint being compromised by another path.</li>
<li>Which sessions get this authentication is the operator's decision; this layer supplies the means, not the decision.</li>
</ul>

The difference from your own access logs is here: a log remains after the token is used, but it is not material for distinguishing, before the action, whether the presenter was the legitimate holder.

Detection and this layer are complementary, not substitutes. The former catches malicious-looking behavior and lowers the probability of leakage; the latter keeps a leaked token from passing straight through as the user.

## 6. Sources

- **Cloudflare (primary, official)**: "A revisit of remote Spectre attacks on Workers" (2026-08) — <https://blog.cloudflare.com/revisiting-spectre-attacks-on-workers/>
- **arXiv (primary, paper)**: Pedersen, Xiao, Ainsworth, Topham, Schwarzl, "Remote Spectre attacks on Cloudflare Workers" (arXiv:2608.17043) — <https://arxiv.org/pdf/2608.17043>
- **The Hacker News (independent)**: "Cloudflare Workers Spectre Attack Leaks JWT From Co-Located Worker at 12 Bits/Second" (2026-08) — <https://thehackernews.com/2026/08/cloudflare-workers-spectre-attack-leaks.html>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On the design, see ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/). On proving agent authority, see [Pillar 03 — Agent Authority](/pillars/#authority).

This document is a structural analysis of public information, not an audit, assessment, or recommendation regarding any specific organization. The attack was mitigated in production as of disclosure.
