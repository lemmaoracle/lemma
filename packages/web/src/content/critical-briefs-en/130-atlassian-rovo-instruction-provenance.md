---
brief_no: 130
title: "Atlassian Rovo：文書やリンクに仕込んだ指示で、Jira・Confluence のデータを外へ送らせられることが示された(PromptArmor・Varonis)"
title_en: "Atlassian Rovo: Instructions planted in a file or a link could make it send Jira and Confluence data outside (PromptArmor, Varonis)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.1"
og_lead_ja: "Atlassian Rovo、文書やリンクに仕込んだ指示で社内データを外へ送りうる — 1 つの経路は公開時点で未修正"
og_lead_en: "Atlassian Rovo could be made to send internal data out by instructions planted in a file or link — one path unfixed at publication"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "文書に隠した一文で、\nAI が社内データを外へ。\n<accent>承認の画面は出ない</accent>"
og_headline_en: "One hidden line in a file,\nand the AI sent data out.\n<accent>No approval prompt.</accent>"
key_figures:
  - value: "1"
    unit: "click"
    label: "Opening a link was enough to load an attacker's instructions into a signed-in user's Rovo Chat, with no warning or confirmation (Varonis; fixed)"
    tone: "alert"
  - value: "50+"
    label: "Services Rovo can reach through connectors. What it can reach is what can be sent out (Varonis)"
  - value: "05-23 → 08-05"
    label: "From PromptArmor's report to publication. At publication, the file-borne path was described as still unfixed"
glossary:
  - term: "Rovo"
    desc: "Atlassian's AI assistant. It searches Jira, Confluence and more, and acts with the user's permissions."
  - term: "Prompt injection"
    desc: "Hiding instructions, separate from the user's request, inside a file or page the AI reads. The AI may follow them without telling them apart from the request."
  - term: "Connector"
    desc: "A link from the AI assistant to other services such as Slack or Microsoft 365. The more you connect, the more data the AI can read."
insight:
  slug: "instruction-origin-unchecked"
  label: "Instructions followed regardless of origin"
  quote: "A line inside a document an AI assistant reads can be carried out, all the way to sending data out, with the same weight as the user's own request."
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Before an AI assistant sends anything out, check that the instruction came from the user, and stop it if you cannot"
  - slug: "audit-trail"
    item: "Record what the AI assistant sent and where, separately from the assistant"
takeaway: "Nothing checked, before sending data out, that the instruction came from the user's request."
attack_method: "ai-misuse"
self_check: "Before an AI assistant that touches internal data sends anything out, can you check that the instruction really came from the user?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. The fact corrections made in v2.0 (2026-10-25), such as the date of Varonis's discovery, still apply.

## 1. Summary

Researchers showed that Atlassian's AI assistant Rovo, by two paths, ran instructions planted in a file or a link with the user's permissions, without telling them apart from the user's request, and sent internal data to an attacker's URL. On neither path did an approval prompt appear before sending. <strong>A line inside a document an AI assistant reads can be carried out, all the way to sending data out, with the same weight as the user's own request.</strong>

## 2. What got through

- **What got through**: A call, with the user's permissions, to the tool that opens an outside URL. On the file-borne path (PromptArmor), uploading a file with hidden instructions and asking "organize my Jira tickets" was enough for Rovo to append what it found in Jira and Confluence to an attacker's URL and open it. On the link path (Varonis, RovoBlast), when a signed-in user opened a link carrying attacker instructions in a parameter named `rovoChatPrompt`, the instructions entered Rovo Chat with no warning, no confirmation and no label showing they came from outside.
- **A control that did not stop it**: Disabling web search left the tool that opens search results, and data went out through it (PromptArmor). PromptArmor also describes a second channel that leaks data by rendering an image in the AI's answer.
- **What reached the receiving side**: In general, an AI assistant's call to a tool arrives as an operation based on the user's request. From the tool's side, it cannot be told whether the instruction came from the user's request or from text in a document the assistant read.
- **Reach**: Rovo can read Jira, Confluence, Bitbucket, Slack, Google Workspace, Microsoft 365, databases and more, and connects to over 50 services (Varonis). In the demonstrations, Confluence pages, Jira tickets and SharePoint content containing personal data were taken (SecurityWeek).
- **Not disclosed**: Whether any real-world harm or exploitation occurred.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that whoever calls the tool that opens an outside URL or sends data out checks, before running it, that the operation came from the user's request, against a record of that request.

- **Who approves**: The user. The destination and contents are shown on a screen apart from the documents the assistant reads, and the user approves them. Text inside documents, tickets or links is never used as approval.
- **Where it is checked**: Just before the assistant calls a tool that opens an outside URL or sends data out. A send that does not match the record of the request is held until the check is done.
- **What is recorded**: What was sent, where, and on which request, kept apart from the assistant in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before anything is sent out, that the instruction came from the user's request, and keeping a record. Detection means noticing suspicious instructions or destinations. The dates below are when researchers and the press reported or published each point, not necessarily when the demonstrations took place.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before sending, check that the instruction came from the user's request</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>In the researchers' demonstrations,<br>internal data went to an attacker's URL</span></div>
<div class="rx-zone det"><b>Detection · partial</b>Turning features off, watching destinations</div>
<div class="rx-g g1"><div class="t">05-23</div><b>PromptArmor reports to Atlassian</b></div>
<div class="rx-g g2"><div class="t">05-25</div><b>Atlassian assigns a case number</b></div>
<div class="rx-g g3"><div class="t">08-05</div><b>PromptArmor publishes the details</b></div>
<div class="rx-g g4"><div class="t">08-08</div><b>SecurityWeek and others report it</b></div>
</div>
</figure>

The existing control of turning off web search did not stop the file-borne path, because the control worked on "feature on or off", not on "where the instruction came from". A similar case, where instructions planted in an email sent internal data out, is [EchoLeak in M365 Copilot](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/).

## 4. What Lemma does

**Lemma builds the pre-execution check into the point just before an AI assistant opens an outside URL or sends data out.** It does not look for intrusions; it checks, before the operation runs, that it came from the user's request, against a record of that request.

### Industries and operations to watch

- **Industry · AI**: Organizations that add AI assistants or agents to internal tools and connect them to other services.
- **Operation · Lookup & data access**: Having an AI assistant search and summarize internal documents and tickets. What you connect is what can leave.

### Current controls vs Lemma

The route in this case is a chain from column 1 (taking in instructions from a file or link) to column 2 (sending through the tool that opens an outside URL). The second channel, which leaks data by rendering an image, is not given its own column (see the note).

| Control | Taking in instructions from a file or link | Sending through the tool that opens an outside URL |
| --- | --- | --- |
| Turning off web search | Not relevant | Not effective |
| Finding instructions in files | Partial | Not relevant |
| Watching destinations | Not relevant | Partial |
| Connecting fewer services | Not relevant | Partial |
| **Lemma (pre-execution check)** | Not effective | Effective |

Disabling web search left the tool that opens search results, and data went out through it. Finding instructions in files stops what it finds, but reworded instructions remain. Watching destinations can notice suspicious destinations, but only after sending. Connecting fewer services narrows the reach, but remaining data can still be sent. Lemma does not stop the taking-in itself; it checks the send against the record of the request.

Note: Lemma's check works only when it is built into the call to the tool that opens an outside URL or sends data out, and the record of the user's request is managed apart from the documents the assistant reads. A route that does not pass through a tool call, such as leaking data by rendering an image, needs to be closed separately. If the user approves an operation that contains the attacker's URL as it is, it passes. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm about AI assistants that touch internal data

- Have you removed the services your AI assistant connects to but does not need?
- Have you limited the assistant's ability to open outside URLs or send data out to what you actually use?
- Can you see a record of what the assistant sent and where, separately from the assistant?

## 5. Facts and timeline

- **Researchers**: PromptArmor and Varonis Threat Labs reported separately. This is a research demonstration, not a real-world loss.
- **File-borne path (PromptArmor)**: The chat looks normal and the user notices nothing. The content lands in the attacker's server logs. Besides files, the instructions can sit in support tickets, web data or connected services.
- **The chain the researchers showed**: Instructions are planted in a file, a ticket or a link parameter. The user does something ordinary, such as asking for a file to be tidied or opening a link. Rovo runs the planted instructions with the user's permissions, without telling them apart from the request. Internal data goes to the attacker's URL, and the chat looks normal.

### Timeline

- **2026-05-23**: PromptArmor reports the file-borne path to Atlassian.
- **2026-05-25**: Atlassian acknowledges and assigns a case number.
- **2026-06-04**: PromptArmor follows up.
- **2026-07-29**: PromptArmor follows up again.
- **2026-08-05**: PromptArmor publishes the details, saying Rovo "remains vulnerable".
- **2026-08-08**: SecurityWeek and others report it. Varonis presented RovoBlast at DEF CON 34.

> The facts rely on PromptArmor's and Varonis's disclosures (primary). Examples of data taken rely on SecurityWeek's report. The date of the RovoBlast fix is not confirmed in a primary source. We do not claim real-world harm. What has not been disclosed does not mean there were no controls. We will revise this Brief if Atlassian announces a fix for the file-borne path.

### After disclosure

- **Atlassian**: Fixed RovoBlast before disclosure, after Varonis reported it through Bugcrowd (Varonis, SecurityWeek). According to PromptArmor, there was no further communication on the file-borne path for more than two months.
- **Varonis**: Advised organizations to limit the services Rovo connects to and remove unused integrations, keep sensitive areas such as legal, HR and finance out of scope, turn off browsing agents and automation they do not use, and review logs with alerts on unusual activity.

## 6. Sources

- **PromptArmor (Research, primary)**: "Atlassian Rovo Exfiltrates Data" (2026-08-05) — <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis Threat Labs (Research, primary)**: "RovoBlast" — <https://www.varonis.com/blog/rovoblast>
- **SecurityWeek (Press)**: "Critical One-Click Vulnerability in Atlassian's Rovo AI Exposed Enterprise Data" (2026-08-08) — <https://www.securityweek.com/critical-one-click-vulnerability-in-atlassians-rovo-ai-exposed-enterprise-data/>
- **The Hacker News (Press)**: "Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers" (2026-08-08) — <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)
