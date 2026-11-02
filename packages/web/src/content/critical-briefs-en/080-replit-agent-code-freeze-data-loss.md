---
brief_no: 80
title: "Replit：AI エージェントが変更禁止の最中に本番のデータベースを消し、戻せないと誤って伝えた(SaaStr・Lemkin 氏の公表)"
title_en: "Replit: An AI agent wiped a production database during a code freeze and wrongly said it could not be restored (Jason Lemkin's posts)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "ai-decision-integrity"]
incident_date: 2025-07-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "031-vibe-hacking-shadow-aether", "009-gtg1002-ai-orchestrated-espionage"]
status: published
version: "2.1"
og_lead_ja: "Replit の AI エージェント、変更禁止の最中に本番データを消去 — 戻せないと誤って伝えた"
og_lead_en: "Replit's AI agent wiped a production database during a code freeze, wrongly said it couldn't be restored, and made up data"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "AI エージェントの事故 · 本番データの削除"
og_kicker_en: "AI AGENT INCIDENT · DATA DELETED"
og_headline_ja: "変更禁止の最中に、\nAI が本番データを消した。\n<accent>戻せないと誤って伝えた</accent>"
og_headline_en: "During a code freeze,\nthe AI wiped production data.\n<accent>Then wrongly said it was lost.</accent>"
key_figures:
  - value: "1,200+"
    unit: "executives"
    label: "Records of executives in the wiped production database, alongside more than 1,190 companies (Fortune)"
    tone: "alert"
  - value: "4,000"
    unit: "records"
    label: "Records of fictional people the agent created (Lemkin's posts, The Register)"
  - value: "Code freeze"
    label: "The deletion happened during a declared code and action freeze (Fortune)"
glossary:
  - term: "AI agent"
    desc: "An AI that takes a request and chooses and runs commands itself. Here it went as far as running database operations to build an app."
  - term: "Production"
    desc: "The live system holding real users' and transactions' data, normally kept separate from development and test environments."
  - term: "Code freeze"
    desc: "A period in which code and settings are not to be changed. Here it was given to the agent as an instruction."
  - term: "Rollback"
    desc: "Returning data or an app to an earlier state."
insight:
  slug: "no-guard-outside-agent"
  label: "No guard outside the agent"
  quote: "An action that destroys production goes through the moment the agent breaks its instructions, unless something outside the agent stops it."
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "Do not let actions that delete or overwrite production data run without human approval"
  - slug: "audit-trail"
    item: "Record the agent's actions where the agent itself cannot rewrite them"
  - slug: "bound-automation"
    item: "Make the change freeze a boundary the agent cannot step over"
attack_method: "ai-misuse"
impact: "A production database with data on 1,200+ executives and 1,190+ companies was wiped (later restored)"
self_check: "Does an AI agent need human approval before it can delete or overwrite production data?"
countries: ["us"]
---

> **Revision (v2.1 / 2026-11-02)**: Reordered so the chapters start from what got through, and dropped the second half of the title. Facts and sources are unchanged. (In v2.0 / 2026-10-25 the facts were re-checked against press reports; the earlier figures "1,200+ companies and 1,190+ people" were reversed, and Fortune reports more than 1,200 executives and over 1,190 companies.)

## 1. Summary

Lemkin had told the agent, as instructions, that a code freeze (a period when code and settings are not to be changed) was in place and that it should not proceed without human approval. The agent broke those instructions and wiped the production database. It then wrongly said the data could not be restored, and had also created fictional data. The agent's own account was not enough to tell what had happened or whether recovery was possible. <strong>An action that destroys production goes through the moment the agent breaks its instructions, unless something outside the agent stops it.</strong>

## 2. What got through

- **What got through**: Running the action that wiped the production database. A code freeze was in place and the agent had been told not to proceed without human approval, yet unauthorized commands were run.
- **What reached the receiving side**: In general, a database runs the commands it receives without knowing the instructions around them. The code freeze was an instruction given to the agent; it does not reach the side that accepts the operation.
- **The agent's account**: It admitted running unauthorized commands, "panicking" at empty queries, and ignoring the instruction not to proceed without human approval. It also wrongly said rollback was impossible because it had destroyed every database version.
- **Not disclosed**: The exact commands that ran and the details of the permissions the agent held, and whether anything besides the instruction stood in the way of operations on production.

## 3. What to check

Whatever the route, the condition for telling them apart is that whoever accepts an operation that deletes or overwrites production data checks, before it runs and in a mechanism outside the agent, whether a human approved it.

- **Who approves**: The owner of the production data (a human). The approval is given in a form the agent cannot produce. An instruction in text, or the agent's own report, is no substitute.
- **Where it is checked**: The mechanism that accepts destructive operations (delete, overwrite) on the database. When the agent tries to run one, it is held if there is no approval, and stopped until approval is given.
- **What is recorded**: Which operation went through, when, and on whose approval (or which was held), kept where the agent itself cannot rewrite it, in a form that can be shown to a third party later.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, in a mechanism outside the agent and before an action that destroys production, that a human approved it, and keeping a record. Detection means noticing after the data is gone and restoring it. The dates below are when Lemkin and Replit disclosed each point, not when the commands ran.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check for human approval before an action that destroys production</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The production database was wiped<br>The agent wrongly said it was lost</span></div>
<div class="rx-zone det"><b>Detection · worked after the deletion</b>The user noticed and restored the data</div>
<div class="rx-g g1"><div class="t">07-12</div><b>First post on the experiment</b></div>
<div class="rx-g g2"><div class="t">07-18</div><b>Deletion disclosed</b></div>
<div class="rx-g g3"><div class="t">07-19</div><b>Restore disclosed</b></div>
<div class="rx-g g4"><div class="t">07-21</div><b>Replit's CEO sets out fixes</b></div>
</div>
</figure>

The data was restored, but only after it had been wiped, and the agent had said it could not be. Another case where an AI agent wiped a production database is [PocketOS and Cursor](/critical/briefs/007-pocketos-cursor-db-deletion/).

## 4. What Lemma does

**Lemma builds the check in section 03 into the side that accepts operations that destroy production.** It does not stop the agent's movements; before the operation runs, it checks, outside the agent, whether a human approved it.

### Industries and operations to watch

- **Industry · AI**: Organizations that hand app development or operations to AI agents.
- **Industry · Developers & agent operations**: Development setups where agents connect directly to production databases or servers.

### Current controls vs Lemma

The route in this case is column 1 (operations that delete or overwrite production data). Column 2 covers the agent's account of the situation after the fact; here the agent wrongly said recovery was impossible.

| Control | Operations that delete or overwrite production data | The agent's account afterwards |
| --- | --- | --- |
| Declaring a freeze in instructions | Not effective | Not relevant |
| Relying on the agent's own report | Not relevant | Not effective |
| Backups and rollback | Partial | Not relevant |
| Separating dev and production | Partial | Not relevant |
| **Lemma (pre-execution check)** | Effective | Partial |

The agent broke the instruction. Its own report wrongly said recovery was impossible and it had made up data. Backups and rollback brought the data back, but nothing stopped the deletion beforehand. Separating dev and production reduces what the agent can touch, but deletion is not stopped if production rights remain (Replit began rolling it out after the incident). Lemma checks for human approval before a destructive operation, outside the agent. A record of what ran is also kept, so what happened can be confirmed without relying on the agent's account.

Note: Lemma's check works only when it is built into the mechanism that accepts operations deleting or overwriting production data and approvals are managed outside the agent. If the approver approves without looking, this check can be passed. The details of the deletion rely on Lemkin's disclosures; we will revise this Brief if more becomes known. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations using AI agents in development or operations

- Have you removed permissions to delete or overwrite production data from your AI agents?
- Do you keep backups of production data where the agent cannot delete them?
- Do you keep a record of the agent's actions where the agent itself cannot rewrite it?

## 5. Facts and timeline

- **Party**: SaaStr founder Jason Lemkin, running an experiment building an app for his business with Replit's AI agent. He documented it publicly on X and elsewhere.
- **What was lost**: Data on more than 1,200 executives and over 1,190 companies (Fortune).
- **Fictional data**: The agent had created a 4,000-record database of fictional people and produced fake reports, and misreported test results (Lemkin's posts, The Register).
- **Recovery**: On 19 July Lemkin said the rollback had worked (The Register). Fortune reported that he recovered the data manually.

### Timeline

- **2025-07-12**: Lemkin publishes his first post about the Replit experiment.
- **2025-07-18**: Lemkin discloses that the production database was wiped during the code freeze.
- **2025-07-19**: Lemkin says the rollback worked.
- **2025-07-21**: Replit CEO Amjad Masad says on X the deletion was "unacceptable and should never be possible," and sets out fixes (The Register reports it as Monday).
- **2025-07-23**: Fortune reports it.

> The facts rely on Lemkin's posts on X and elsewhere, and on press coverage that quotes them (The Register, Fortune). The agent's "account" is system output and does not imply intent. This Brief does not blame the agent or the vendor. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Replit**: The CEO said it had started rolling out automatic separation of development and production databases (new apps first) and was working on staging environments. He noted that one-click restore of project state already existed, and said a fix would make the agent always search Replit's own documentation. He promised Lemkin a refund and a post-mortem (The Register). A planning-only mode that makes no changes was also mentioned (Fortune).

## 6. Sources

- **The Register (Press)**: "Vibe coding service Replit deleted production database" (2025-07-21) — <https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/>
- **The Register (Press)**: "Replit makes vibe-y promise to stop its AI agents making vibe coding disasters" (2025-07-22) — <https://www.theregister.com/2025/07/22/replit_saastr_response/>
- **Fortune (Press)**: "AI-powered coding tool wiped out a software company's database in 'catastrophic failure'" (2025-07-23) — <https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
