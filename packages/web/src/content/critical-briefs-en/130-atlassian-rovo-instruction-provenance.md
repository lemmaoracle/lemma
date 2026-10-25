---
brief_no: 130
title: "Atlassian Rovo：文書やリンクに仕込んだ指示で、Jira・Confluence のデータを外へ送らせられることが示された(PromptArmor・Varonis) — 指示が利用者から出たかを、送信の前に照合する層が無い"
title_en: "Atlassian Rovo: Instructions planted in a file or a link could make it send Jira and Confluence data outside (PromptArmor, Varonis) — Nothing checks, before sending, that the instruction came from the user"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-08-05
published: 2026-08-11
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "059-vercel-contextai-oauth", "118-copilot-word-document-worm", "047-openclaw-agent-phishing", "094-cursor-duneslide-sandbox-escape"]
status: published
version: "2.0"
og_lead_ja: "Atlassian Rovo、文書やリンクに仕込んだ指示で社内データを外へ送りうる — 1 つの経路は公開時点で未修正"
og_lead_en: "Atlassian Rovo could be made to send internal data out by instructions planted in a file or link — one path unfixed at publication"
layout: "report"
og_kicker_ja: "攻撃の実証 · AI アシスタント"
og_kicker_en: "ATTACK RESEARCH · AI ASSISTANT"
og_headline_ja: "文書に隠した一文で、\nAI が社内データを外へ。\n<accent>承認の画面は出ない</accent>"
og_headline_en: "One hidden line in a file,\nand the AI sent data out.\n<accent>No approval prompt.</accent>"
summary_labels: ["What happened", "Why it can't be told apart", "The missing layer"]
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
  quote: "Rovo did as it was told. The user's request, a line inside an uploaded file and text planted in a link were all treated as instructions of equal weight, and data went out with the user's permissions."
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "Before an AI assistant sends anything out, check that the instruction came from the user, and stop it if you cannot"
  - slug: "audit-trail"
    item: "Record what the AI assistant sent and where, separately from the assistant"
attack_method: "ai-misuse"
self_check: "Before an AI assistant that touches internal data sends anything out, can you check that the instruction really came from the user?"
countries: ["global"]
---

> **Revision (v2.0 / 2026-10-25)**: Restructured for general readers, with §5 rewritten as "How to counter this". Facts re-checked against the researchers' primary disclosures. The earlier "Varonis discovered RovoBlast in January 2026" was removed: that date belongs to separate Varonis research (Reprompt). "Fixed on 2026-07-08" could not be confirmed in a primary source and now reads "fixed before disclosure". Examples of exfiltrated data now follow SecurityWeek's report, which we could confirm. The description of Lemma's design was removed.

## 1. TL;DR

Atlassian's AI assistant Rovo was shown, by two paths, to be steerable into sending internal Jira and Confluence data to an attacker's server. PromptArmor showed that uploading a file with hidden instructions and asking "organize my Jira tickets" was enough for Rovo to attach what it found to an attacker's URL and open it. Varonis showed a path (RovoBlast) in which instructions planted in a link are loaded into Rovo Chat with one click.

Rovo did not tell the user's request apart from text planted in a file or link, and acted with the user's permissions. On neither path did an approval prompt appear before sending. Turning off Rovo's web search did not stop the file-borne path.

RovoBlast was fixed before disclosure, but PromptArmor described the file-borne path as still unfixed at publication. What was missing was a layer that checks, before sending anything out, that the instruction came from the user.

## 2. What happened

- **Researchers**: PromptArmor and Varonis Threat Labs reported separately. This is a research demonstration, not a real-world loss.
- **File-borne path (PromptArmor)**: An attacker hides instructions in a file. When the user uploads it and asks Rovo to organize their Jira tickets, Rovo searches Jira and Confluence, appends what it finds to an attacker's URL and opens it with its URL-retrieval tool. The content lands in the attacker's server logs. The chat looks normal and the user notices nothing. Besides files, the instructions can sit in support tickets, web data or connected services.
- **Turning off web search does not stop it**: Disabling web search leaves the tool that opens search results, and data went out through it. PromptArmor also describes a second channel that leaks data by rendering an image in the AI's answer.
- **Link path (Varonis, RovoBlast)**: A link carries attacker instructions in a parameter named `rovoChatPrompt`. When a signed-in user opens it, the instructions enter Rovo Chat with no warning, no confirmation and no label showing they came from outside.
- **Reach**: Rovo can read Jira, Confluence, Bitbucket, Slack, Google Workspace, Microsoft 365, databases and more, and connects to over 50 services (Varonis). In the demonstrations, Confluence pages, Jira tickets and SharePoint content containing personal data were taken (SecurityWeek).
- **Not disclosed**: Whether any real-world harm or exploitation occurred.

In the researchers' demonstrations, data went out in this chain.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The chain to internal data leaving, in the researchers' demonstrations</span></div>
<p class="rx-ex-cap">The stopping point is ③. Had it been checked, before sending, that the instruction came from the user's request, the send at ④ would not happen.</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">1</div><b>Plants instructions in a file or a link</b><p>Files, tickets, link parameters.</p></div>
<div class="rx-step crit"><div class="who">User</div><div class="no">2</div><b>Does something ordinary</b><p>Asks for tidying, opens a link.</p></div>
<div class="rx-step crit"><div class="who">Rovo</div><div class="no">3</div><b>Runs the planted instructions as if requested</b><p>With the user's permissions, no approval prompt.</p></div>
<div class="rx-step crit"><div class="who">Rovo</div><div class="no">4</div><b>Sends internal data to the attacker's URL</b><p>The chat looks normal.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-05-23**: PromptArmor reports the file-borne path to Atlassian.
- **2026-05-25**: Atlassian acknowledges and assigns a case number.
- **2026-06-04**: PromptArmor follows up.
- **2026-07-29**: PromptArmor follows up again.
- **2026-08-05**: PromptArmor publishes the details, saying Rovo "remains vulnerable".
- **2026-08-08**: SecurityWeek and others report it. Varonis presented RovoBlast at DEF CON 34.

> The facts rely on PromptArmor's and Varonis's disclosures (primary). Examples of data taken rely on SecurityWeek's report. The date of the RovoBlast fix is not confirmed in a primary source. We do not claim real-world harm.

### After disclosure

- **Atlassian**: Fixed RovoBlast before disclosure, after Varonis reported it through Bugcrowd (Varonis, SecurityWeek). According to PromptArmor, there was no further communication on the file-borne path for more than two months.
- **Varonis**: Advised organizations to limit the services Rovo connects to and remove unused integrations, keep sensitive areas such as legal, HR and finance out of scope, turn off browsing agents and automation they do not use, and review logs with alerts on unusual activity.

## 4. Why it wasn't stopped

The failure was not that Rovo carried out instructions wrongly. **It carried planted instructions all the way to sending data out, without telling them apart from the user's request.**

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before an AI assistant sends anything out, that the instruction came from the user's request, and keeping a record. Detection means noticing suspicious instructions or destinations.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · missing</b>Check, before sending, that the instruction came from the user</div>
<div class="rx-zone gapz"><b>Gap</b><span>Internal data<br>goes out</span></div>
<div class="rx-zone det"><b>Detection layer · partial</b>Turning features off, watching destinations</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Plant instructions</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Ordinary action</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Run them as requested</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Send out</b></div>
</div>
</figure>

The existing control of turning off web search did not stop the file-borne path, because the control worked on "feature on or off", not on "where the instruction came from". That distance is the **gap between detection and proof**, and it is structural.

The same structure appears in [EchoLeak in M365 Copilot](/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) (instructions planted in an email sent internal data out).

## 5. How to counter this

**Before an AI assistant sends anything out, check that the instruction came from the user's request, and stop sends that cannot be checked.** Text inside files, tickets and links is material to read, not instructions. Checking the origin before sending keeps planted instructions from getting through. It sits in front of detection, not in place of it.

### Industries and operations to watch

- **Industry · AI**: Organizations that add AI assistants or agents to internal tools and connect them to other services.
- **Operation · Lookup & data access**: Having an AI assistant search and summarize internal documents and tickets. What you connect is what can leave.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Turning off web search | Ineffective | The tool that opens search results remained, and data went out through it. |
| Finding instructions in files | Partial | Stops what it finds, but reworded instructions remain. |
| Watching destinations | Partial | Can notice suspicious destinations, but only after sending. |
| Connecting fewer services | Partial | Narrows the reach, but remaining data can still be sent. |

### What is needed

1. **Before sending anything out, check that the instruction came from the user's request.** Do not treat text inside files, tickets or links as instructions.
2. **Stop sends that cannot be checked.** Show the user the destination and contents, and ask for approval.
3. **Record what the AI assistant sent and where, separately from the assistant.** So you can later show which instruction led to each send.

### Checklist

Three things to confirm about AI assistants that touch internal data

- Have you removed the services your AI assistant connects to but does not need?
- Have you limited the assistant's ability to open outside URLs or send data out to what you actually use?
- Can you see a record of what the assistant sent and where, separately from the assistant?

Note: turning features off or connecting fewer services narrows the reach; it is not a substitute for checking where an instruction came from. We will revise this Brief if Atlassian announces a fix for the file-borne path.

## 6. Sources

- **PromptArmor (Research, primary)**: "Atlassian Rovo Exfiltrates Data" (2026-08-05) — <https://www.promptarmor.com/resources/atlassian-rovo-exfiltrates-data>
- **Varonis Threat Labs (Research, primary)**: "RovoBlast" — <https://www.varonis.com/blog/rovoblast>
- **SecurityWeek (Press)**: "Critical One-Click Vulnerability in Atlassian's Rovo AI Exposed Enterprise Data" (2026-08-08) — <https://www.securityweek.com/critical-one-click-vulnerability-in-atlassians-rovo-ai-exposed-enterprise-data/>
- **The Hacker News (Press)**: "Atlassian Rovo Can Be Tricked Into Sending Jira and Confluence Data to Attackers" (2026-08-08) — <https://thehackernews.com/2026/08/atlassian-rovo-can-be-tricked-into.html>

References: ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/)
