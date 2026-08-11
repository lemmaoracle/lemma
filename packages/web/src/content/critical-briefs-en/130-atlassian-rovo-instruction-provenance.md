---
brief_no: 130
title: "Atlassian Rovo が、アップロード文書や URL パラメータの指示に従い Jira・Confluence のデータを外部へ送った — 指示の出所が、行動の前に確かめられていない"
title_en: "Atlassian Rovo followed instructions from an uploaded file and a URL parameter, sending Jira and Confluence data outward — the origin of the instruction was never verified before the action"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "1.0"
og_lead_ja: "Atlassian Rovo が指示の出所を確かめず Jira/Confluence データを外部送信"
og_lead_en: "Atlassian Rovo sent Jira/Confluence data out without verifying instruction origin"
gap_detected: "Detection can work. Content scanning and egress monitoring can be designed as layers that catch malicious instructions or suspicious destinations."
gap_missing: "Nothing verified, before the action, whether the instruction the agent followed came from the authenticated user's intent or from attacker-planted content."
gap_fix: "Before an action like outbound transfer, insert a step that independently verifies the instruction's origin is the user's intent."
analysis_lead_ja: "確かめられないのは、指示が正しく実行されたかではない。その指示が、利用者の意図から来たのか、攻撃者の仕込みから来たのか、である。"
analysis_lead_en: "The question isn't whether the instruction was executed correctly. It's whether it came from the user's intent, or from attacker-planted content."
---

## 1. TL;DR

Atlassian's AI assistant Rovo was shown to be trickable, via two separate paths, into collecting Jira tickets, Confluence pages, and other internal data and forwarding them to an attacker's server. Researchers at PromptArmor demonstrated that uploading a document with a concealed instruction and asking Rovo to "organize my Jira tickets" was enough for Rovo to append what it found to an attacker's URL and open it. Separately, Varonis showed that a URL parameter could preload attacker instructions into Rovo Chat, so one click from an authenticated user ran them with that user's privileges (RovoBlast). Rovo did what it was told. **What failed was the layer that would verify, before the outbound action, whether the instruction came from the authenticated user's intent or from attacker-planted content.**

## 2. What happened

- Two independent research teams reported paths that trick Rovo into gathering internal data and forwarding it to an attacker's server. Per PromptArmor, the exposure covers "any data the agent can access in Atlassian, including any data the agent can access via 'connectors'."
- **PromptArmor (content-borne)**: an attacker plants an instruction inside a document; the user uploads it and asks Rovo to "organize my Jira tickets." Rovo searches Jira and Confluence as asked, appends the internal data it finds to an attacker's URL, and opens it — the attacker's site logs the request. There is no separate approval step.
- **Disabling web search does not stop this path.** PromptArmor states that the attack "succeeds even if an organization has disabled web search for Rovo. This is because the web search setting fails to remove the tool for opening the search results." The outbound request leaves through a URL-retrieval tool that is separate from search.
- **Varonis (RovoBlast)**: a link of the form `https://home.atlassian.com/chat?rovoChatPathway=chat&rovoChatPrompt=<prompt>` preloads attacker instructions into Rovo Chat via the `rovoChatPrompt` parameter. When an authenticated user clicks it, the instructions flow into the trusted session with no warning or confirmation dialog, and Rovo proceeds through multi-step exfiltration using the autonomous ResearchAgent's web browsing and posting capabilities. Varonis shows Rovo can reach Jira, Confluence, and Bitbucket as well as Slack, Microsoft 365, Google Workspace and 50+ further platforms through Rovo Connectors. Per The Hacker News, the proof-of-concept exfiltrated a private API key from Confluence.

The attack holds together through this chain:

1. The attacker plants an instruction where Rovo will read it — inside an uploaded document (PromptArmor) or in a URL parameter that preloads Rovo Chat (Varonis).
2. The user performs a legitimate action (asking to organize a document, clicking a link).
3. Rovo does not distinguish the planted instruction from the user's actual intent and runs it with the user's privileges.
4. Rovo gathers Jira/Confluence content or data reachable through connectors and sends it to the attacker's destination. No approval step intervenes.

## 3. Timeline — disclosure and response

- 2026-01: Varonis Threat Labs discovers RovoBlast.
- 2026-05-23: PromptArmor discloses the content-borne path to Atlassian.
- 2026-05-25: Atlassian acknowledges receipt and assigns a case number.
- 2026-06-04 / 2026-07-29: PromptArmor follows up.
- 2026-07-08: Atlassian fixes the Varonis-reported issue (RovoBlast) server-side.
- 2026-08-05: PromptArmor publishes details of the content-borne path, stating that Rovo remains vulnerable as of publication.
- 2026-08-08: The Hacker News reports on both. As of that date, neither path has been assigned a CVE.

> This Brief covers researcher demonstrations. **The two paths differ in status**: RovoBlast (the URL-parameter path) is fixed server-side, while the content-borne path was unfixed as of PromptArmor's publication. Varonis reported through Bugcrowd and presented at DEF CON 34. Varonis's own write-up does not specify which particular credentials were retrieved in testing; the detail of a private API key from Confluence comes from The Hacker News's reporting. Individual exfiltration volumes and real-world impact are not claimed, as no independent primary confirmation is available. Technical details such as destinations and parameter names follow the researchers' disclosures.

Response and developments:

- One path (RovoBlast) was closed by a product-side fix. The other (content-borne) leaves risk in the very flow of having Rovo process instruction-bearing documents until a fix is confirmed.
- What both paths share is the absence of a layer that, before the action, distinguishes the origin of the instruction (uploaded content, a URL parameter) from the user's actual intent. That disabling web search did not stop the content-borne path shows the unit of control is a feature toggle, not the origin of an instruction.

## 4. Why it wasn't stopped

The failure here is not that Rovo executed an instruction incorrectly — it executed correctly. It is that **there was no layer to distinguish, before the outbound action, whether the instruction the agent followed came from the authenticated user's intent or from content the attacker planted in what it was asked to process.**

A detection layer can be designed: content scanning can catch a malicious instruction, egress monitoring a suspicious destination. What failed sat before that — the basis on which Rovo treated something as "the user's intent" and acted. The contents of an uploaded document and the value of a URL parameter were both treated as instructions with the same weight as the user's own request. With origin left undistinguished, the agent's privileges ride on it.

> An instruction's weight depends on whose intent it came from. Treat a sentence inside a user-uploaded document as equivalent to the user's own request, and the attacker simply borrows the user's privileges.

This shares its structure with [Brief 055](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) (M365 Copilot sending internal data without verifying the origin of the instruction) and [Brief 118](/critical/briefs/118-copilot-word-document-worm/) (a generated document becoming the next carrier). RovoBlast's URL-parameter path also carries the flavor of [Brief 094](/critical/briefs/094-cursor-duneslide-sandbox-escape/), preloading an instruction with a single click. The common thread: the agent's action is not authorized against the origin of the instruction.

## 5. What proof would have changed

Proof-as-auth inserts, one step before an agent moves to an action like outbound transfer, a layer that verifies the origin of the instruction. A machine does not judge whether the instruction's content is malicious. Instead, "did this instruction come from the authenticated user's intent, or from processed content or a URL parameter" becomes something the acting side can verify before the action lands.

The design Lemma proposes for this gap:

<ul class="bd-check">
<li><strong>Provenance binding on instruction origin</strong>: bind to each instruction the agent receives a provenance record of whether it is the user's direct intent or derived from processed content or a URL parameter, so the two are not treated as instructions of equal weight.</li>
<li><strong>Authorization proof before outbound action</strong>: require, just before sending Jira/Confluence content to an external destination, a proof that the action is authorized in a way bound to the user's intent — filling the missing approval step with proof.</li>
<li><strong>Selective disclosure of secrets</strong>: keep stored API keys off the agent's response and egress path, presenting only the verification needed rather than the secret itself.</li>
<li><strong>Scope fixed to intent</strong>: when the agent acts with the user's privileges, fix those privileges to the range of actions the user actually intended, so a planted instruction does not simply ride the privilege.</li>
</ul>

What this layer does not do:

<ul class="bd-limit">
<li>Judging whether an instruction is malicious remains the work of content scanning and scanners built on top of this binding.</li>
<li>Proof can show that an action was authorized against the user's intent; it cannot show whether the user's own judgment was sound.</li>
<li>Which actions to gate is the operator's decision; this layer supplies the material for it.</li>
</ul>

This is where it differs from an internal log: a log remains after the action, but it is no material for distinguishing, before the action, whether that action was authorized against the user's intent.

Lemma does not detect prompt injection. Content scanning and egress monitoring are complementary to this layer, not alternatives. The former catch a malicious instruction or a suspicious destination; the latter makes "the origin of the instruction the agent followed" verifiable before the outbound action.

## 6. Sources

- **PromptArmor (primary research)**: "Atlassian Rovo Exfiltrates Data" (published 2026-08-05; disclosed 2026-05-23) — <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis (primary research)**: "RovoBlast" — instruction preloading via Rovo Chat's `rovoChatPrompt` parameter (discovered 2026-01, reported through Bugcrowd, presented at DEF CON 34) — <https://www.varonis.com/blog/rovoblast>
- **The Hacker News (independent reporting)**: "Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers" (2026-08-08) — <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

References: On why after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/). On the design, see ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/); on scope, [Pillar 03 — Agent Authority](/pillars/#agent) · [Brief 055 (internal data sent without verifying the origin of the instruction)](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) · [Brief 118 (a generated document becoming the next carrier)](/critical/briefs/118-copilot-word-document-worm/)
