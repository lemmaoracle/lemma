---
brief_no: 205
title: "Claude Code：承認したコマンドを秘密情報ごと保存した設定ファイルが公開リポジトリに push され、パスワードや API キーが公開の GitHub に出ていた(Apiiro の調査)"
title_en: "Claude Code: settings files that saved approved commands, secrets included, were pushed to public repositories, leaving passwords and API keys on public GitHub (Apiiro research)"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-11-05
published: 2026-11-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["037-agent-config-auto-execution", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
fact_check:
  by: "muse-spark-1.3×7 + GLM-5.3"
  at: 2026-11-12
  rev: "b67e5566169a06da"
  ref: "https://github.com/lemmaoracle/lemma/pull/1162"
status: draft
version: "1.0"
og_lead_ja: "Claude Code で「今後は聞かない」と承認したコマンドが秘密情報ごと設定ファイルに保存され、公開の GitHub で 1,122 ファイルに 1,379 件の秘密情報が見つかったと Apiiro が報告"
og_lead_en: "Commands approved with \"don't ask again\" in Claude Code were saved with their secrets; Apiiro reports 1,379 secrets in 1,122 settings files on public GitHub"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "情報の公開の事例 · AI ツールの設定ファイル"
og_kicker_en: "EXPOSURE · AI TOOL SETTINGS"
og_headline_ja: "承認したコマンドが\n秘密情報ごと保存され\n公開の GitHub へ。\n<accent>1,122 ファイルと報告</accent>"
og_headline_en: "Approved commands saved\nwith their secrets went\nto public GitHub.\n<accent>1,122 files, Apiiro reports.</accent>"
key_figures:
  - value: "1,122"
    unit: "files"
    label: "Of 104,185 copies of .claude/settings.local.json on public GitHub, those containing a real secret (about 1.1%; Apiiro)"
    tone: "alert"
  - value: "1,379"
    unit: "secrets"
    label: "Distinct secrets in those 1,122 files (including 379 database passwords, 43 SSH logins and 23 AWS keys; Apiiro)"
  - value: "2,539"
    unit: "secrets"
    label: "Secrets counted when git history, shared settings files and conversation logs are included (1,994 repositories; Apiiro)"
glossary:
  - term: "Allow rule"
    desc: "A line an AI coding tool saves for an operation it may run next time without asking. In Claude Code, the text of the approved command becomes the rule as it is."
  - term: "Global git excludes"
    desc: "The list of files that git on a given machine never tracks, in any repository. Unlike a repository's .gitignore, it does not travel with the repository."
insight:
  slug: "local-ignore-not-publish-check"
  stop: true
  label: "A local exclusion is not a publication check"
  quote: "Before a push to a public repository, check the files it contains against the owner's list of files that may be published, not against local exclusion settings."
industries: ["developers", "ai"]
operations: ["disclosure", "account-admin"]
controls:
  - slug: "minimize-data"
    item: "Keep secrets out of command text, passing them from a vault reference or the environment, so no secret remains in an allow rule"
  - slug: "hold-unverified"
    item: "Hold a push to a public repository before publication when it contains a file not on the list of files that may be published"
  - slug: "limit-and-revoke"
    item: "Revoke and reissue any secret that ever appeared in a settings file or its history, before deleting the file"
  - slug: "audit-trail"
    item: "Record, apart from the repository, which push published which file and which list entry it matched"
attack_method: "human-error"
impact: "Of 104,185 Claude Code settings files on public GitHub, 1,122 contained 1,379 secrets (Apiiro). Whether the credentials work was not tested"
takeaway: "Commands approved in Claude Code were saved with their secrets in a settings file, and the file was pushed to public repositories. A local exclusion does not travel with the repository. Before publishing, check the files against the owner's publication list."
self_check: "Do you know whether the allow rules and settings an AI coding tool saves locally contain secrets?"
countries: ["global"]
---

## 1. Summary

In Claude Code, Anthropic's AI coding tool, choosing "Yes, and don't ask again" when approving a shell command saves the command's text as it is, as an allow rule, in the project's .claude/settings.local.json. According to Apiiro's research, passwords and API keys in the command were saved along with it, and the file was pushed to public repositories. Of 104,185 copies of the file on public GitHub (in 103,617 repositories), 1,122 contained 1,379 real secrets.

The first time Claude Code writes the file inside a git repository, it adds it to the user's global git excludes. Apiiro says this exclusion does not protect a folder that becomes a git repository later, a clone on another machine, or a file already tracked. As of 2 November 2026 every file with a secret was on its default branch, first committed a median of 217 days earlier. Apiiro did not test the credentials; one notified organisation confirmed its key was live.

<strong>A record saved to skip a prompt is still a file, and leaves by the same route as every other file.</strong>

## 2. What got through

- **What got through**: Pushes to public repositories. According to Apiiro, .claude/settings.local.json, holding the saved allow rules, was committed with other files and pushed to public GitHub. Tracing 1,105 repositories with a file containing a secret, in 539 a commit listing Claude as co-author changed the file. Apiiro says nobody meant to publish their keys.
- **What reached the accepting side**: In general, a repository host receives only the committed files and their contents. It does not receive whether a file was meant to stay on the user's machine or to be shared with the team. Global git excludes work only for git on that machine and do not travel with the repository.
- **Not disclosed**: How the file came to be tracked in each repository (created by hand, or a case the exclusion did not cover). Whether, in the commits co-authored by Claude, the file was added on the user's instruction or by the agent's choice. How many of the secrets still work, and whether any were used (Apiiro did not test them).

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a push to a public repository, the files it contains are checked as fit to publish against a list set by the repository's owner, apart from local exclusion settings.

- **Who approves**: The repository's owner (the administrator of the organisation's repositories). They set the list of files that may be published, and treat an AI tool's local settings (such as .claude/settings.local.json) and conversation logs as not on the list.
- **Where it is checked**: The step that accepts a push to a public repository. A push containing a file not on the list, or content matching a secret format, is held before publication. A second place, earlier, is the step that saves an approved command as an allow rule: if the rule's text contains a secret, it is not saved as it is.
- **What is recorded**: Which push published, or held, which file, and which list entry it matched. It is kept apart from the repository, so that when a secret surfaces, one can establish since when it was public.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a push to a public repository, the files it contains against the owner's publication list, and keeping a record. Detection means finding published secrets and telling their owners. Dates rely on Apiiro's report and the GitHub issue; the publication date relies on iTWire.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check files against the owner's publication list before the push</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>1,379 secrets in 1,122 files<br>First committed a median of 217 days earlier</span></div>
<div class="rx-zone det"><b>Detection · worked through a researcher's study</b>Apiiro searched public GitHub and told the organisations and Anthropic</div>
<div class="rx-g g1"><div class="t">2025-08</div><b>An issue on the same problem is opened</b></div>
<div class="rx-g g2"><div class="t">11-01 to 03</div><b>Apiiro searches public GitHub</b></div>
<div class="rx-g g3"><div class="t">11-02 to 03</div><b>Apiiro notifies the organisations</b></div>
<div class="rx-g g4"><div class="t">11-05</div><b>Apiiro publishes its report (iTWire)</b></div>
</div>
</figure>

The secrets sat on default branches for a median of 217 days until researchers looked. A case where AI agent config bundled in repositories ran without being checked is [Miasma](/critical/briefs/037-agent-config-auto-execution/). A case where a user-supplied URL carried a server's secrets out is [LibreChat](/critical/briefs/027-librechat-mcp-url-secrets/), and research where Claude Code's GitHub integration trusted an actor's name is [Claude Code GitHub Action](/critical/briefs/062-claude-code-github-action-bot-trust/). Here there was no attack: a local record saved by an AI tool left as it was through the publication step.

## 4. What Lemma does

**Lemma builds the pre-execution check into the side where a public repository accepts a push.** It does not look for published secrets; it checks, before publication, that the files included may be published.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Development teams that let an AI coding tool check databases or call APIs. Settings that save a prompt's effort stay behind in a local file.
- **Industry · AI adoption (all industries)**: Organisations, such as contract developers and start-ups, that publish repositories built with AI tools or hand them to customers. Apiiro counts 63 affected organisations and says most exposure came from individual developers.
- **Operation · Disclosure & data release**: Publishing repositories, forks and packages.
- **Operation · Accounts & permissions**: Issuing and revoking database passwords, cloud keys and publishing tokens.

### Current controls vs Lemma

The route in this case is column 1 (pushing the local settings file). Column 2 covers secrets entering the shared .claude/settings.json or conversation logs and being pushed, which is part of Apiiro's wider count (2,539). Column 3 covers a third party using a published key; nothing disclosed says this happened here.

| Control | Push of the local settings file | Push of shared settings or conversation logs | Use of a published key |
| --- | --- | --- | --- |
| Global git excludes (added on first write) | Partial | Not effective | Not effective |
| Secret scanning tools (before or after the push) | Partial | Partial | Not effective |
| Expiry and scope limits on keys | Not effective | Not effective | Partial |
| **Lemma (pre-execution check)** | Effective | Partial | Not effective |

Global git excludes protect a file created on that machine, but not a file already tracked or a clone on another machine. In Apiiro's sample, of 1,122 files gitleaks caught 564 and TruffleHog 643, and 215 were caught by neither (passwords inside commands are hard to spot). Expiry and scope limits narrow the harm after publication but do not stop the publication itself. Lemma checks, before publication, not the format of the contents but whether each file is on the owner's publication list.

Note: Lemma's check works only when it is built into the step where a public repository accepts a push, and the list of files that may be published is managed by the owner apart from developers' local settings. If a secret is written into a file that is on the list, such as a shared settings file, it can pass without a content check. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions, and it does not revoke published keys.

### Checklist

Three things to confirm about repositories where AI coding tools are used

- Do you check public repositories, down to git history and forks, for AI tool settings files and conversation logs?
- Do you have a procedure to revoke and reissue a secret found in a settings file or its history before deleting the file?
- Have you confirmed that your secret scanning also catches passwords written inside commands?

## 5. Facts and timeline

- **Parties**: Anthropic (United States), which provides Claude Code, and the developers and organisations using it. The study was done by the application security company Apiiro, and this Brief relies on its report.
- **What happened**: According to Apiiro, when Claude Code is asked to check a database or call an API, the command it proposes can contain a secret. Choosing "Yes, and don't ask again" saves the command's text, secret included, as an allow rule in .claude/settings.local.json. Anthropic's documentation also says this approval is saved as an allow rule. Apiiro attributes this to Claude Code's behaviour rather than the model, and says that of 16 coding agents, Claude Code was the only one confirmed to write the full approved command to a project file by default.
- **The exclusion**: According to Anthropic's documentation, the first time Claude Code writes the file inside a git repository that does not already ignore it, it adds it to the global git excludes. If the file was created by hand, the user is asked to add it to .gitignore themselves. Apiiro says a folder that becomes a git repository later, a clone on another machine and a file already committed are not protected, and later approvals are appended to a tracked file.
- **Scope and numbers**: On 1–3 November 2026, Apiiro read public repositories through GitHub's code search and commit search. It found 104,185 copies of .claude/settings.local.json (in 103,617 repositories), of which 1,122 (about 1.1%) contained a real secret. There were 1,379 distinct values (636 provider-format keys and 743 passwords or tokens for public hosts), including 379 database passwords, 43 SSH logins, 42 GitHub, GitLab and npm tokens and 23 AWS keys. 211 forks of 74 repositories carried the same secrets, and earlier versions held 734 secrets (in 509 repositories) absent from current copies. Including git history, the shared .claude/settings.json and conversation logs, the count was 2,539 secrets across 1,994 repositories.
- **Method and limits**: Apiiro did not use or test any credential. A "real secret" is one that matches a provider's key format or points to a public host, not one confirmed valid. It classified 2,774 values with rules and a separate LLM review, counting only those both agreed on. It counts 63 affected organisations, one of which confirmed its key was live.

### Timeline

- **2025-08-11**: An issue (#5544) reporting that credentials in approved commands are stored in plain text in settings.local.json is opened on anthropics/claude-code.
- **2026-01-03**: #5544 is closed by a bot after 60 days of inactivity.
- **2026-11-01 to 03**: Apiiro searches public GitHub.
- **2026-11-02 to 03**: Apiiro notifies the affected organisations. It also shares its findings with Anthropic before publication.
- **2026-11-05**: Apiiro publishes its report (per iTWire).
- **2026-11-07**: The head of Claude Code at Anthropic responds on Hacker News (per Apiiro).
- **2026-11-08**: Apiiro adds an update to its report.

> The facts rely on Apiiro's report (research publication, primary) and on Anthropic's Claude Code documentation and the GitHub issue (primary). Apiiro's report page carries no publication date; the date relies on iTWire's report. Of the figures, 1,122 files and 1,379 secrets count current copies of .claude/settings.local.json, while 2,539 secrets across 1,994 repositories is the wider count including history, shared settings files and conversation logs. Whether the secrets still work, or were used by a third party, has not been disclosed. That commits co-authored by Claude changed the file (539 of 1,105 repositories) does not show that Claude Code published every secret. What has not been disclosed does not mean there were no controls. This Brief does not evaluate the responses of the provider or its users. Written as of 12 November.

### After disclosure

- **Anthropic**: According to Apiiro, on 7 November the head of Claude Code said on Hacker News that Claude Code had not historically scrubbed secrets but that Anthropic was looking at what it could do to prevent this, and would try catching it in auto mode and adding basic secret checks. They said that, since the file is excluded from git when created, they saw the public copies as files created by hand and checked in, and recommended auto mode and the host's secret scanning.
- **GitHub issues**: According to Apiiro, four issues on the same problem had been opened since August 2025; none received a reply, and three were closed automatically.
- **Apiiro**: Recommends revoking and reissuing secrets before deleting the files, searching repositories and git history for both settings files, untracking the local settings file and adding it to the repository's .gitignore, and keeping secrets out of command text.

## 6. Sources

- **Apiiro (Primary, research report)**: "Coding Agents Are Leaking Your Secrets to GitHub" (November 2026, updated 2026-11-08) — <https://apiiro.com/blog/coding-agents-leaking-secrets-github-dont-ask-again>
- **Anthropic (Primary, product documentation)**: "Settings files and precedence" (Claude Code Docs) — <https://code.claude.com/docs/en/settings>
- **anthropics/claude-code (Primary, GitHub issue)**: "[BUG] approved bash commands containing credentials are stored as is with plain text credentials in settings.local.json" #5544 (2025-08-11) — <https://github.com/anthropics/claude-code/issues/5544>
- **iTWire (Press)**: "Claude Code approval files found exposing company secrets on GitHub, says Apirro researchers" (2026-11-07) — <https://itwire.com/business-it-news/security/claude-code-approval-files-found-exposing-company-secrets-on-github-says-apirro-researchers>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
