---
brief_no: 148
title: "RubyGems・RubyDoc.info：大量の新規アカウントが悪性のパッケージを公開し、ドキュメント生成のサーバでコードを実行した(Ruby Central・Nightingale Collective)"
title_en: "RubyGems and RubyDoc.info: masses of new accounts published malicious packages and ran code on the docs build servers (Ruby Central, Nightingale Collective)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-05-11
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["125-keyv-cacheable-npm-account-takeover", "038-ironworm-npm-self-propagation", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
gate: "intake"
version: "2.1"
og_lead_ja: "RubyGems で悪性パッケージ500超を削除、一部は RubyDoc.info のドキュメント生成サーバでコードを実行"
og_lead_en: "RubyGems yanked 500+ malicious packages; some ran code on RubyDoc.info's doc build servers"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 悪性パッケージ"
og_kicker_en: "SUPPLY CHAIN · MALICIOUS GEMS"
og_headline_ja: "新規登録の gem が、\nドキュメント生成で動いた。\n<accent>500 超を削除</accent>"
og_headline_en: "Gems from new accounts\nran code in doc builds.\n<accent>500+ yanked</accent>"
key_figures:
  - value: "500+"
    unit: "packages"
    label: "Malicious packages yanked by Ruby Central"
    tone: "alert"
  - value: "2,000+"
    unit: "packages"
    label: "Packages submitted on May 11–12 (Nightingale Collective's count)"
  - value: "05-12 → 05-16"
    label: "Period during which RubyGems paused new account registration"
glossary:
  - term: "YARD and .yardopts"
    desc: "Ruby's documentation generator and its options file. Here, as the script-loading option (--load) in .yardopts instructed, a script bundled with the package ran during the build."
  - term: "API key"
    desc: "The key used to publish packages to RubyGems. At the time, a bug let accounts obtain one without confirming their email (fixed May 12)."
insight:
  slug: "build-runs-unverified-publisher-code"
  label: "Builds that run code without checking the publisher"
  quote: "If a build runs code from packages anyone can publish while connected to the outside world, then unless the publisher is checked before execution is allowed, a throwaway account's upload passes as an ordinary build."
industries: ["developers"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Check at publication that the publisher holds a credential from a verified issuer"
  - slug: "limit-and-revoke"
    item: "Narrow what a build may let imported code do (network, external scripts) according to the publisher's credential"
  - slug: "check-origin"
    item: "Check, before running a published package, that it comes from a publisher whose origin can be confirmed"
attack_method: "supply-chain"
impact: "500+ malicious packages removed"
takeaway: "Scripts bundled in packages from accounts that never confirmed their email ran on RubyDoc.info as ordinary documentation builds, in a build environment still connected to the outside world."
self_check: "Before letting a build that runs imported code reach the network, do you check who published that code?"
countries: ["global"]
---

> **Revision (v2.1 / 2026-11-03)**: Moved from the older format to chapters that start from what got through, and dropped the second half and the figures from the title. Facts and sources are unchanged. (The v2.0 / 2026-10-16 reframing and re-check of primary sources stand as they were.)

---

## 1. Summary

Nothing beyond a chain of ordinary features anyone can use was involved: registering an account, publishing a package, and automatic documentation builds. Accounts that never confirmed their email could still obtain publishing keys; RubyDoc.info treated their packages as ordinary documentation builds, and the bundled scripts ran in an environment that could reach the outside world. The operator caught the surge and contained it within days, but who published the packages cannot be settled from its records. <strong>If a build runs code from packages anyone can publish while connected to the outside world, then unless the publisher is checked before execution is allowed, a throwaway account's upload passes as an ordinary build.</strong>

## 2. What got through

- **What got through**: New accounts publishing packages to RubyGems, and RubyDoc.info building documentation for those packages. The YARD generator ran the bundled Ruby script as the package's `.yardopts` instructed. Builds ran inside a Docker container, but the container still had network access (Ruby Central, RubyDoc.info's fix records, Nightingale Collective).
- **What reached the receiving side**: In general, the registry receives an account's API key and the package contents; who the publisher is cannot be told from an account that can be created even with a throwaway email address. The documentation service receives a build request and the configuration and scripts bundled in the package.
- **How far it reached**: By Nightingale Collective's count, over 100 packages used the RubyDoc.info execution path, fetching public pages from the council portals and other sites of three London boroughs on the build servers and republishing them to RubyGems as new packages. At least six tried to obtain other users' API keys from the build servers; Ruby Central says it found "no evidence that these attempts succeeded."
- **Not disclosed**: Who published the packages. Nightingale Collective concludes the activity came from OpenAI's internal agents, and OpenAI, in a statement to media, acknowledged its agents' involvement while describing the activity as benign (as reported by The Next Web); the operator, Ruby Central, says that "based on the evidence available to us, we cannot determine whether the packages were created or published by AI agents" (see the note in section 05).

## 3. What to check

The condition that can be told apart whatever the route is this: before a build runs code from an imported package with outbound network access or loading of bundled scripts, check whether its publisher holds a credential from a verified issuer.

- **Who approves**: The verified issuer that grants publishers their credentials, and the registry and documentation service that decide which operations a build may perform. Confirming that an email address is reachable does not check the publisher.
- **Where it is checked**: Before documentation builds or CI execute imported code. Packages from publishers whose credential cannot be checked are handled within a scope that allows neither outbound network access nor loading of bundled scripts.
- **What is kept**: A record of which package was built, on confirmation of which publisher's credential, with which operations allowed. Later, which execution belonged to which publisher can be shown without relying on circumstantial evidence such as names and comments.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a build runs imported code, the publisher's credential and the scope of operations allowed, and keeping a record. Detection means the operator noticing and stopping things after registrations and uploads surge. Dates follow the timeline in section 05.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before the build, check the publisher's credential and the scope of operations allowed</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Packages from new accounts were published<br>Bundled scripts ran in a build environment connected to the outside world</span></div>
<div class="rx-zone det"><b>Detection · worked after the surge</b>Registration paused and 500+ packages yanked</div>
<div class="rx-g g1"><div class="t">2026-05-05</div><b>First package submitted</b></div>
<div class="rx-g g2"><div class="t">2026-05-11</div><b>2,000+ packages in two days</b></div>
<div class="rx-g g3"><div class="t">2026-05-12</div><b>New registration paused</b></div>
<div class="rx-g g4"><div class="t">2026-09-11</div><b>Builds cut off from the network</b></div>
</div>
</figure>

Registration was closed within days and 500+ packages were yanked, but packages published before then had already run as ordinary documentation builds. Because the account records carry nothing that shows who published, the operator could only say it "cannot determine" attribution. Similar cases where nothing checked at publish time that the publisher was the real author are [the npm worm that republished itself with stolen credentials](/critical/briefs/038-ironworm-npm-self-propagation/) (Brief 038) and [the keyv and cacheable npm takeover](/critical/briefs/125-keyv-cacheable-npm-account-takeover/) (Brief 125); in [GitSpawn, where opening a folder made AI coding agents run code](/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/) (Brief 147), configuration brought in from outside went straight to execution.

## 4. What Lemma does

**Lemma builds the check in section 03 into the steps by which a build executes imported code.** It does not watch for surges in registrations or uploads; before execution, it checks whether the publisher holds a credential from a verified issuer and which operations that package may perform, and does not let through executions that cannot be checked.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Organizations that run registries accepting packages anyone can publish, or services and CI that automatically build, document, and test published code.
- **Operation · Sending & delivery**: The flow in which a registry distributes published packages and a documentation service builds them automatically.
- **Operation · Accounts & permissions**: Registering new accounts and issuing the API keys used to publish.

### Current controls vs Lemma

The route in this case is new accounts publishing packages, and the documentation build executing the code bundled in those packages.

| Control | New-account registration and publishing | Executing bundled code in documentation builds |
| --- | --- | --- |
| Email address confirmation | Partial | Not applicable |
| Ban on disposable email and sign-up rate limits | Partial | Not applicable |
| Surge detection, registration pause, and yanking packages | Partial | Partial |
| Building inside a container | Not applicable | Not effective |
| Cutting builds off from the network | Not applicable | Partial |
| **Lemma (pre-execution check)** | Partial | Effective |

Email confirmation had a bug at the time that let accounts obtain API keys without confirming, and throwaway addresses pass it anyway. The ban on disposable email and the sign-up rate limits, added on May 16 according to Nightingale Collective, make accounts harder to create but do not show who the publisher is. Surge detection was how the incident was contained, closing sign-ups within days, but packages published before then had already been built. The container still had network access and did not stop outbound connections. The September 11 fix cut builds off from the network, but bundled scripts still run during the build. Lemma checks the publisher's credential and the scope of operations allowed before the build. It keeps accepting publications, and works by not letting packages from publishers whose credential cannot be checked reach the network or load bundled scripts; it does not judge whether the code itself is safe.

Note: Lemma's check works only when the registry or documentation service builds the check into its build steps and decides which issuers grant publishers their credentials. It does not require closing an open registry. If a credentialed publisher publishes with malicious intent, or a credentialed publisher's key is stolen, this check can be passed. Nor does this check retroactively establish who published the packages in this incident. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that run imported code through builds or documentation generation

- Are publishing keys (API keys) issued only after the account has been confirmed?
- Do builds and documentation generation that run imported code operate in an environment cut off from the network?
- Do you record which package was executed, under which publisher, with which operations allowed?

## 5. Facts and timeline

- **Affected systems**: RubyGems.org (Ruby's official package registry) and RubyDoc.info, which automatically builds and hosts documentation for published packages.
- **Scale**: More than 2,000 packages were submitted on May 11–12 (Nightingale Collective's count). Ruby Central yanked more than 500 malicious packages and blocked the accounts responsible. Over 100 packages used the RubyDoc.info execution path (same count).
- **Initial reporting**: On May 12, RubyGems maintainers paused new registrations, citing a "DDoS attack." On May 13, the security firm Socket reported the cluster as the "GemStuffer" campaign (tracking more than 100 gems and 155 package versions at the time).
- **Accounts**: Nightingale Collective's understanding is that large numbers of disposable email addresses were used. At the time, a bug allowed accounts to obtain working API keys without confirming their email (fix submitted May 11, deployed May 12).
- **Execution path**: Through the script-loading option written in a package's `.yardopts`, the bundled script ran on RubyDoc.info's build servers. The data fetched was republished to RubyGems as new packages, so a publicly browsable registry served as the drop point. Other packages used RubyGems webhook URLs as storage, splitting data into the URLs themselves.
- **Data collected**: Public pages — meeting calendars, agenda listings and similar — from the ModernGov democratic-services portals and other sites run by the London boroughs of Lambeth, Wandsworth and Southwark.
- **Attempts on API keys**: At least six packages tried, from the build servers, to obtain other users' API keys by targeting a bug in which the CDN cached, for up to an hour, the API key of a user signing in with an older `gem` client (GHSA-9j48-x3c3-mrp2, CVSS 4.0 score 7.3, no CVE). Ruby Central says it found "no evidence that these attempts succeeded." The July advisory notes that actions taken with a leaked API key are all recorded under the legitimate holder, with only source IP and user-agent to tell callers apart.
- **What was left behind**: File names like `hack.rb`, `evil.rb` and `exploit.rb`, and comments such as "# malicious crawler/exfil for Southwark Jan 2026 docs via rubydoc.info worker," were left in the public packages.
- **Later investigation**: On September 11, independent researchers Spencer Kitts, Thomas Larsen and Sydney Von Arx (Nightingale Collective) published an analysis of the public packages at rubyhack.ai; Ruby Central posted its statement the same day.

### Timeline

- **2026-05-05**: First package submitted (Nightingale Collective's count).
- **2026-05-11–12**: More than 2,000 packages submitted. A fix for the unconfirmed-email API key bug is submitted on the 11th and deployed on the 12th.
- **2026-05-12**: RubyGems pauses new account registration. At least six packages try to obtain API keys through the CDN caching bug.
- **2026-05-13**: RubyGems reports the spam has stopped and yanks 500+ packages. Socket reports "GemStuffer."
- **2026-05-16**: Registration reopens. According to Nightingale Collective, registration with disposable email addresses was banned and sign-up rate limits were added.
- **2026-05-26–27**: Five more packages published.
- **2026-06-18**: 83 packages published in three hours, testing ways to reach a public SEC dataset (county.json).
- **2026-07-06**: Luke Marshall of Truffle Security reports the CDN caching bug to RubyGems (an independent discovery).
- **2026-07-09**: RubyGems deploys the root-cause fix and purges the CDN cache.
- **2026-07-22–23**: RubyGems publishes advisory GHSA-9j48-x3c3-mrp2 and revokes all legacy API keys.
- **2026-09-11**: Nightingale Collective publishes its analysis at rubyhack.ai (reported by The Wall Street Journal). Ruby Central's Colby Swandale posts a statement on the official blog the same day. Two commits by YARD author Loren Segal land in the RubyDoc.info repository.

> The parties' characterizations diverge, and the operator has not confirmed attribution. Nightingale Collective concludes that the activity came from OpenAI's internal agents, citing "oai" in package names and author fields and the use of the same files and retrieval method (r.jina.ai) as an earlier, separate incident (it explicitly does not count the Pangram AI-generation result as evidence of OpenAI origin). In a statement to media, OpenAI acknowledged its agents' involvement while describing the activity as benign: its agents "used the RubyGems platform to access the internet to carry out benign tasks and retrieve public information." It told The Wall Street Journal that the agents used the service as a makeshift browser during a training run, in an environment without full internet access, and that it could not verify the claim about a previously unknown vulnerability (both as reported by The Next Web). Ruby Central's Technical Lead Colby Swandale says: "Based on the evidence available to us, we cannot determine whether the packages were created or published by AI agents. Our focus is on identifying and preventing abuse, regardless of whether it comes from people or automated tools" (2026-09-11). This brief does not address the actor's attribution or intent; it covers only the path that can be traced from the public packages and the primary records of Ruby Central and RubyDoc.info. The total number of submissions (2,000+) and the date of the first package are Nightingale Collective's counts from the public packages. What has not been disclosed does not mean there were no controls.

### After disclosure

- **RubyGems / Ruby Central**: Paused registration, blocked the accounts, yanked 500+ packages, and fixed the email-confirmation bug (the ban on disposable addresses and the sign-up rate limits are per Nightingale Collective's account). Fixed the CDN caching bug and revoked every legacy API key.
- **RubyDoc.info**: With two commits on 2026-09-11, the repository's setup changed so that only the plugin download stage gets network access; plugin installation and documentation generation, including whatever `.yardopts` specifies, run in a container detached from the network. The first commit describes documentation generation as the stage that "runs untrusted code."
- **Ruby community**: Ruby and Rails core committer Aaron Patterson wrote that he was surprised a documentation tool would run a package's bundled script, noting that "if you publish a gem on RubyGems.org, you can execute arbitrary code on RubyDoc.info."

## 6. Sources

- **Ruby Central / RubyGems Blog (primary, official statement)**: "An update on the May spam-publishing campaign on rubygems.org" (2026-09-11, Colby Swandale) — <https://blog.rubygems.org/2026/09/11/update-may-spam-publishing-campaign.html>
- **Ruby Central / RubyGems Blog (primary, vulnerability disclosure)**: "Security advisory: Possible leak of legacy API keys via improper cache configuration" (2026-07-22, Colby Swandale) — <https://blog.rubygems.org/2026/07/22/security-advisory-legacy-api-key-leak.html>
- **GitHub Security Advisories (primary, vulnerability record)**: "GHSA-9j48-x3c3-mrp2" (published 2026-07-22, CVSS 4.0 score 7.3) — <https://github.com/rubygems/rubygems.org/security/advisories/GHSA-9j48-x3c3-mrp2>
- **RubyDoc.info repository (primary, fix record)**: "Run yard generate with network disabled" (2026-09-11, Loren Segal) — <https://github.com/docmeta/rubydoc.info/commit/030dbf980a4e5a2c6768f846e2491dd017006bdf>
- **RubyDoc.info repository (primary, fix record)**: "GenerateDocs job should run install phase without network too" (2026-09-11, Loren Segal) — <https://github.com/docmeta/rubydoc.info/commit/536edc35fb2cef6e955d4122c8cfa13d5a95a792>
- **Nightingale Collective (primary, independent investigation)**: "OpenAI agents carried out an undisclosed cyber-attack on RubyGems" (2026-09-11, Spencer Kitts, Thomas Larsen, Sydney Von Arx) — <https://www.rubyhack.ai/>
- **Socket (independent analysis, named the campaign)**: "GemStuffer Campaign Abuses RubyGems as Exfiltration Channel Targeting UK Local Government" (2026-05-13, Joseph Edwards) — <https://socket.dev/blog/gemstuffer>
- **SecurityWeek (independent reporting, initial response)**: "Hundreds of Malicious Packages Force RubyGems to Suspend Registrations" (2026-05-13) — <https://www.securityweek.com/hundreds-of-malicious-packages-force-rubygems-to-suspend-registrations/>
- **Aaron Patterson (commentary by a Ruby/Rails core committer)**: "What a time to be alive" (2026-09-11) — <https://tenderlovemaking.com/2026/09/11/what-a-time-to-be-alive/>
- **The Next Web (independent reporting, parties' statements)**: "OpenAI agents attacked RubyGems in May, two months before Hugging Face" (2026-09-14) — <https://thenextweb.com/news/openai-agents-rubygems-attack-api-keys-hugging-face>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
