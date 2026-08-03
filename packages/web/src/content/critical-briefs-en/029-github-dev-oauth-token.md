---
brief_no: 29
title: "github.dev で OAuth トークンが 1 クリックで窃取された — webview が合成イベントを信頼し、トークンは閲覧リポジトリにスコープされていなかった"
title_en: "One-Click GitHub OAuth Token Theft via github.dev — The Webview Trusted Synthetic Events, and the Token Was Not Scoped to the Repo"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-02
published: 2026-06-06
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "027-librechat-mcp-url-secrets", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "OAuth トークンが 1 クリックで窃取 — github.dev webview の合成イベント"
og_lead_en: "One-click GitHub OAuth token theft via github.dev"
gap_detected: "The preventive response — advance notification by the researcher and a same-day interim fix from the provider — worked."
gap_missing: "There was no layer to confirm before execution under whose authorization the extension install would run or what scope the token was delegated, so excessive privileges were exercised as-is."
gap_fix: "Before a privileged act such as installing an extension, independently verify with Lemma that the act falls within the range of delegated authority, and prevent it up front."
---

## 1. TL;DR

Ammar Askar published a one-click attack and PoC in github.dev, the browser build of VS Code. Clicking an attacker's link lets a webview script use synthetic key events (not real user actions) to install a malicious extension that steals github.dev's OAuth token. That token was valid for every repo the user can access, not just the open one. What is missing is a layer that verifies, before the action, under whose authorization the install runs and how far the token is delegated.

---

## 2. What happened

- **Target**: github.dev — the browser VS Code editor opened by pressing `.` on a github.com repo, or by swapping github.com → github.dev in the URL.
- **Disclosure**: 2026-06-02, by researcher Ammar Askar via a blog post, a PoC repo, and a GitHub issue (microsoft/vscode #319593).
- **Root cause (a chain of two)**:
  1. When the VS Code webview (the isolated surface used for Markdown preview, Notebook rendering, etc.) forwards key events to the host for shortcut relaying, it **failed to distinguish script-generated synthetic events from real user actions**.
  2. The OAuth token github.com POSTs to github.dev was **not scoped to the repo being worked on — it was valid for every repo the user can access**.
- **How it lands**: forged events drive the "accept recommended extensions" / "install workspace extension" flows, executing the attacker's extension → it obtains the GitHub API token inside github.dev → it enumerates the victim's private repos via the GitHub API (shown in an info box in the PoC; exfiltratable in a weaponized version).
- **A very short entry**: desktop VS Code has a similar issue, but it requires cloning a repo and opening a Notebook. github.dev opens an editor on a single link click, so the attack's entry is extremely short.
- **Fixes**: Microsoft added a trust prompt for opening browser Notebooks and rejected arbitrary callers of the extension-install command on 6-03, and stopped forwarding some synthetic events from the webview on 6-04. Microsoft stated desktop VS Code is unaffected.
- **CVE**: unassigned at the time of writing.

The incident came together as the following chain.

1. **Distribute the malicious link**: the attacker prepares a github.dev link to a repo containing a Jupyter Notebook and gets the victim to click it.
2. **JavaScript runs in the webview**: through Notebook rendering, a script executes inside the webview's isolated surface.
3. **Relay synthetic events**: the script forges VS Code shortcut actions, sending "not a real user action" synthetic events to the host through the webview → host relay.
4. **Walk into extension install**: combining the recommended-extension acceptance prompt and the workspace-extension install mechanism, the attacker's extension is brought to execution.
5. **Token capture and lateral reach**: the attacker's extension grabs the OAuth token inside github.dev. Because the token is valid for every repo, it enumerates — and, in a weaponized version, exfiltrates — the victim's private repos via the GitHub API.

---

## 3. Timeline — disclosure and response

- 2026-06-02: ~1 hour after notifying GitHub, Ammar Askar did a full disclosure via blog, PoC, and GitHub issue #319593 — bypassing MSRC, citing a past VS Code bug report that was silently fixed without credit.
- 2026-06-03: Microsoft shipped interim fixes (trust prompt on opening Notebooks, caller checks on the extension-install command). BleepingComputer and others reported; Microsoft issued a statement.
- 2026-06-04: Microsoft shipped a further fix (stopping some synthetic-event forwarding from the webview).

> Note: proper nouns and CVEs are based on primary sources (research institutions, GitHub Advisory, NVD, etc.); each implementation's remediation status varies over time, so consult the latest information. This case is CVE-unassigned and mid-way through staged fixes, so its remediation status may be updated.

The response and industry movement after disclosure:

- **Microsoft / GitHub**: shipped interim fixes in stages (6-03, 6-04) before a CVE assignment — a trust prompt on opening Notebooks, caller checks on the extension-install command, and stopping some synthetic-event forwarding from the webview — touching both the trust boundary and event provenance.
- **The disclosure-process debate**: the researcher chose full disclosure bypassing MSRC, citing a past VS Code bug that was silently fixed without credit. Around the same time, another researcher (handle Nightmare Eclipse) published several zero-days out of dissatisfaction with MSRC's disclosure handling — making the disclosure and patch cycle for browser/editor platforms an industry talking point.
- **Cross-industry**: in-browser dev environments, AI coding platforms, and MCP clients all co-locate "externally loaded content" with "privileged operations and delegated tokens" in one process. The argument that least-scoping delegation and verifying authorization of privileged actions should be baseline requirements is gaining weight through this case and Briefs 003 / 027.

---

## 4. Why it wasn't stopped

The central **failure primitive is "the OAuth token delegated to github.dev was not scoped to the least range (the open repo), and the privileged act of installing an extension proceeded without independently verifying on whose authorization it ran."**

Like Briefs 027 (LibreChat MCP URL) and 003 (Starlette/BadHost), this is an agent-infrastructure trust-boundary problem. 027 was an "exit" where the connection target config referenced the server's privilege context; 003 was an "entry" where Host-header manipulation bypassed auth. This case sits between them — the **scope of a delegated token and the authorization of a privileged action** were missing — and the three share a root: agent infrastructure that acts without independently verifying the range and exercise of a permission. In particular, "had the token been least-scoped to the target, theft would have been limited to that one repo" plainly states the core of the authority-proof category: over-delegation turns a single leak into a total compromise.

Secondarily, this is also an input-integrity problem — **synthetic events crossed a trust boundary**. The webview failed to distinguish "a key the real user pressed" from "a key a script created," exactly where it should have. That belongs to the same family as [Brief 018](/critical/briefs/018-hackerbot-claw-ai-vs-ai/) (the integrity / missing provenance of the CLAUDE.md instructions a defending Claude Code ingests): "the origin of an ingested action or instruction is not verified." Still, this Brief's main axis is the scope and authorization of delegated permissions.

The near-coordinated disclosure (advance notice to GitHub) and Microsoft's next-day fix worked well to prevent harm and protect users; this Brief does not dispute that role. Users can also clear github.dev cookies / site data, which re-surfaces a sign-in warning when a malicious link is clicked.

But detection does not change "what range of token github.dev holds, and which actions it can execute without authorization." Use of a stolen OAuth token via the GitHub API is indistinguishable from github.dev's legitimate token use, and the extension install follows the legitimate flow. What was missing is the pre-execution, independent verification of "on whose authorization does this extension install run" and "to what range is this token delegated" — a different track from anomaly detection. For audit, too, after a leak there is little independent trail beyond reconciling API access logs to prove "which private repo, on whose delegation, was accessed when."

---

## 5. What proof would have changed

Pre-execution attestation embeds a verifiable scope (target repo, valid range) into the delegated token and independently verifies privileged actions like extension installs against "the registrant's authorization" and "the delegated range" before they run. If the proof says "this action exceeds the delegated range" or "this token must not be valid outside this repo," the action is blocked before execution. Detection of privileged actions ("a suspicious extension ran") and pre-execution proof of delegated authority ("is this action within the authorized range") are not substitutes but **complements**.

Against the detection–proof gap exposed here (a delegated token not scoped to least privilege, and a privileged action executed without independent authorization), Lemma proposes a design that records delegations and privileged actions against agent infrastructure and verifies, before execution, "who authorized what, within which range" as an independently verifiable proof.

- **Trailing the delegation scope**: a delegated permission like an OAuth token embeds the target repo and valid range as a verifiable scope, trailed under an issuer signature
- **Pre-execution authorization of privileged actions**: privileged actions like extension installs are independently verified, before execution, against "the registrant's authorization" and "the delegated range." Actions exceeding the delegated range are stopped as a pre-execution refusal, not via detection
- **Enforcing least scope**: even when a token is over-valid, if the proof says "this action reaches a repo outside scope" or "this token must not be valid outside this repo," it is rejected before execution

This closes — through least-scope enforcement and pre-execution authorization of privileged actions — the structure in which over-delegation turns a single leak into a total compromise. Detection of privileged actions (detection) and pre-execution proof of delegated authority work as complements.

---

## 6. Sources

- **Ammar Askar**: "1-Click GitHub Token Stealing via a VSCode Bug" (2026-06-02, the researcher's own technical write-up) — http://blog.ammaraskar.com/github-token-stealing/
- **PoC repository**: ammaraskar/github-dev-token-steal-poc (2026-06-02) — https://github.com/ammaraskar/github-dev-token-steal-poc/
- **GitHub issue**: microsoft/vscode #319593 — https://github.com/microsoft/vscode/issues/319593
- **BleepingComputer**: "VS Code zero-day lets hackers steal GitHub tokens in one click" (2026-06-03, Microsoft statement and fix history) — https://www.bleepingcomputer.com/news/security/vs-code-zero-day-lets-hackers-steal-github-tokens-in-one-click/
- **The Hacker News**: "One-Click GitHub Dev Attack Lets Attackers Steal Full GitHub OAuth Tokens" (2026-06) — https://thehackernews.com/2026/06/one-click-github-dev-attack-lets.html

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 03 — Agent Authority Proof](https://lemma.frame00.com/pillars/#authority), [Trust402](https://lemma.frame00.com/trust402/)
