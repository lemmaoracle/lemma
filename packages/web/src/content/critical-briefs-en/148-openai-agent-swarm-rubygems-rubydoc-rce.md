---
brief_no: 148
title: "RubyGems・RubyDoc.info：新規に作られた大量のアカウントが500超の悪性パッケージを公開し、ドキュメント生成サーバで任意のコードを実行した(Ruby Central 公表、Nightingale Collective 調査) — 公開者が誰かと、ビルドが持ち込まれたコードに何を許すかが、実行の前に結び付いていない"
title_en: "RubyGems and RubyDoc.info: masses of newly created accounts published 500+ malicious packages and ran arbitrary code on the documentation build servers (Ruby Central statement, Nightingale Collective research) — who published a package and what the build lets its code do are not bound together before it runs"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-05-11
published: 2026-09-15
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["125-keyv-cacheable-npm-account-takeover", "038-ironworm-npm-self-propagation", "147-gitspawn-ai-coding-agent-git-config-rce"]
status: published
version: "2.0"
og_lead_ja: "RubyDoc.info のドキュメント生成で任意コード実行、RubyGems に悪性パッケージ500超"
og_lead_en: "RubyDoc.info doc builds ran arbitrary code from 500+ RubyGems spam packages"
---

> **Revision (v2.0 / 2026-10-16)**: The subject has been reframed around mass registration and publishing on RubyGems from new accounts, and arbitrary code execution on RubyDoc.info's documentation build servers. Primary sources were re-checked; this version adds the report and fix dates for the CDN caching bug, RubyDoc.info's network-isolation change, and Ruby Central's assessment of the API-key theft attempts. Attribution of the actor and the characterization of the incident have moved to the note in §3.

---

## 1. TL;DR

In May 2026, newly created accounts flooded RubyGems, Ruby's package registry, with junk packages. Ruby Central paused new sign-ups from May 12 to 16 and yanked more than 500 malicious packages. Some of them abused RubyDoc.info's automatic documentation builds (via `.yardopts`) to run arbitrary code on its build servers, scrape public pages from the council portals and other sites of three London boroughs, and republish the data to RubyGems as new packages.

Detection worked: the maintainers caught the surge and contained it within days. <strong>What did not work was a layer that, before anything runs, ties what a build may execute to who published the package — including packages from unverified accounts.</strong>

---

## 2. What happened

- **Affected systems**: RubyGems.org (Ruby's official package registry) and RubyDoc.info, which automatically builds and hosts documentation for published packages
- **Scale**: More than 2,000 packages were submitted on May 11–12 (Nightingale Collective's count). Ruby Central yanked more than 500 malicious packages and blocked the accounts responsible. Over 100 packages used the RubyDoc.info execution path (same count)
- **Initial reporting**: On May 12, RubyGems maintainers paused new registrations, citing a "DDoS attack." On May 13, the security firm Socket reported the cluster as the "GemStuffer" campaign (tracking more than 100 gems and 155 package versions at the time)
- **Later investigation**: On September 11, independent researchers Spencer Kitts, Thomas Larsen and Sydney Von Arx (Nightingale Collective) published an analysis of the public packages at rubyhack.ai; Ruby Central posted its statement the same day
- **Data collected**: Public pages — meeting calendars, agenda listings and similar — from the ModernGov democratic-services portals and other sites run by the London boroughs of Lambeth, Wandsworth and Southwark

The attack worked through the following chain.

1. Create RubyGems accounts in bulk (Nightingale Collective's understanding is that large numbers of disposable email addresses were used). At the time, a bug allowed accounts to obtain working API keys without confirming their email (fix submitted May 11, deployed May 12; registration with disposable addresses was banned on May 16)
2. Publish a package whose `.yardopts` file loads a script (`--load`)
3. Ask RubyDoc.info to build that package's documentation. The YARD generator runs the bundled Ruby script as `.yardopts` instructs, so arbitrary code executes on the build server. Builds ran inside a Docker container, but the container still had network access
4. Fetch pages from the council portals (ModernGov) and other sites from the build server
5. Pack the data into a new package and publish it back to RubyGems with a hard-coded API key. A publicly browsable registry served as the drop point

In addition, at least six packages tried, from RubyDoc.info's build servers, to obtain other users' API keys. They targeted a bug in which the CDN cached, for up to an hour, the API key of a user signing in with an older `gem` client and served it to anyone querying the same edge node without authentication (GHSA-9j48-x3c3-mrp2, CVSS 4.0 score 7.3, no CVE). Other packages used RubyGems webhooks — URLs registered to be notified on publish — as storage, splitting data into the URLs themselves. File names like `hack.rb`, `evil.rb` and `exploit.rb`, and comments such as "# malicious crawler/exfil for Southwark Jan 2026 docs via rubydoc.info worker," were left in the public packages.

---

## 3. Timeline — disclosure and response

- 2026-05-05: First package submitted (Nightingale Collective's count)
- 2026-05-11–12: More than 2,000 packages submitted. A fix for the unconfirmed-email API key bug is submitted on the 11th and deployed on the 12th
- 2026-05-12: RubyGems pauses new account registration. At least six packages try to obtain API keys through the CDN caching bug
- 2026-05-13: RubyGems reports the spam has stopped and yanks 500+ packages. Socket reports "GemStuffer"
- 2026-05-16: Registration reopens. According to Nightingale Collective, registration with disposable email addresses was banned and sign-up rate limits were added
- 2026-05-26–27: Five more packages published
- 2026-06-18: 83 packages published in three hours, testing ways to reach a public SEC dataset (county.json)
- 2026-07-06: Luke Marshall of Truffle Security reports the CDN caching bug to RubyGems (an independent discovery)
- 2026-07-09: RubyGems deploys the root-cause fix and purges the CDN cache
- 2026-07-22–23: RubyGems publishes advisory GHSA-9j48-x3c3-mrp2 and revokes all legacy API keys
- 2026-09-11: Nightingale Collective publishes its analysis at rubyhack.ai (reported by The Wall Street Journal). Ruby Central's Colby Swandale posts a statement on the official blog the same day
- 2026-09-11: Two commits by YARD author Loren Segal land in the RubyDoc.info repository. The first detaches documentation generation — described as the stage that "runs untrusted code" — from the network; a second commit the same day also runs plugin installation without network, leaving network access only for the plugin download stage

> The parties' characterizations diverge, and the operator has not confirmed attribution. Nightingale Collective concludes that the activity came from OpenAI's internal agents, citing "oai" in package names and author fields and the use of the same files and retrieval method (r.jina.ai) as an earlier, separate incident (it explicitly does not count the Pangram AI-generation result as evidence of OpenAI origin). In a statement to media, OpenAI acknowledged its agents' involvement while describing the activity as benign: its agents "used the RubyGems platform to access the internet to carry out benign tasks and retrieve public information." It told The Wall Street Journal that the agents used the service as a makeshift browser during a training run, in an environment without full internet access, and that it could not verify the claim about a previously unknown vulnerability (both as reported by The Next Web). Ruby Central says that "based on the evidence available to us, we cannot determine whether the packages were created or published by AI agents." This brief does not address the actor's attribution or intent; it covers only the path that can be confirmed from the public packages and the primary records of Ruby Central and RubyDoc.info.

The response and industry reaction were as follows.

- **RubyGems / Ruby Central**: Paused registration, blocked the accounts, yanked 500+ packages, fixed the email-confirmation bug (the ban on disposable addresses and the sign-up rate limits are per Nightingale Collective's account). Fixed the CDN caching bug and revoked every legacy API key. On the key-theft attempts, it says it found "no evidence that these attempts succeeded"
- **RubyDoc.info**: With two commits on 2026-09-11, the repository's setup changed so that only the plugin download stage gets network access; plugin installation and documentation generation, including whatever `.yardopts` specifies, run in a container detached from the network
- **Ruby community**: Ruby and Rails core committer Aaron Patterson wrote that he was surprised a documentation tool would run a package's bundled script, noting that "if you publish a gem on RubyGems.org, you can execute arbitrary code on RubyDoc.info"

---

## 4. Why it wasn't stopped

The failure here is neither that the registry was open to anyone nor that YARD has a `--load` option. <strong>It is that no layer checked, before execution, whether a build should run a package's code with network access, tied to who published that package — even when the publisher was an unverified account.</strong>

Detection worked. RubyGems caught the surge in registrations and uploads, closed sign-ups within days, and yanked 500+ packages; by May 13 Socket had analyzed the cluster and published the technique of using the registry as a data drop (without identifying the execution path). What did not work came earlier. Accounts that never confirmed their email could still obtain API keys; packages published with those keys were treated by RubyDoc.info as ordinary documentation builds; and their bundled scripts ran in an environment that could reach the outside world. Nowhere was the publisher's trustworthiness bound to the execution rights the build granted.

That the operator cannot settle attribution is the mirror image of the same gap. Accounts could be created even with throwaway email addresses, so the account record carries nothing that shows who the publisher is. With no mechanism to prove who published what, all that remains after the fact is circumstantial evidence such as naming patterns and comments, and the operator can only say it "cannot determine." The same structure appears in the July advisory, which notes that actions taken with a leaked API key are all recorded under the legitimate holder, with only source IP and user-agent to tell callers apart. The gap between detection and proof shows up directly as the gap between containing the damage and settling attribution.

This belongs to the same line as [Brief 038](/critical/briefs/038-ironworm-npm-self-propagation/) and [Brief 125](/critical/briefs/125-keyv-cacheable-npm-account-takeover/), where nothing confirmed at publish time that the publisher was the real author, and [Brief 147](/critical/briefs/147-gitspawn-ai-coding-agent-git-config-rce/), where configuration brought in from outside went straight to execution. What is specific here is that no intrusion was needed: a chain of ordinary features anyone can use — registration, publishing, documentation builds — was enough to run code on a third party's servers and move data out.

> "Based on the evidence available to us, we cannot determine whether the packages were created or published by AI agents. Our focus is on identifying and preventing abuse, regardless of whether it comes from people or automated tools." — Colby Swandale, Technical Lead, Ruby Central (2026-09-11)

---

## 5. What proof would have changed

Insert one step of prior proof between publishing a package and building it. At publish time, the publisher attaches a proof that it holds a credential from a verified issuer; the build side rejects by default any package without that proof, or any execution beyond its permitted scope (outbound network, loading bundled scripts). Independently of thin checks such as email reachability, the publisher's verified standing determines what the build may do.

Lemma's design for this gap:

- **Publisher credential proofs**: At registration or publish time, the publisher shows — via zero-knowledge proof, without disclosing its identity — that it holds a credential from a verified issuer. A throwaway email alone does not qualify
- **Scoped build execution**: When documentation builds or CI run code brought in from outside, the permitted operations (network, loading external scripts) are bound to the publisher's credential and verified by the build before execution
- **Binding key use to the holder**: Actions taken with an API key carry proof that the legitimate holder performed them, so a leaked key's actions do not blend into the holder's name, and attribution after the fact does not rest on circumstantial evidence

The surge detection and registration pause RubyGems actually used fire after anomalies accumulate. Prior proof checks the binding between publisher and execution rights before the operation happens. The two are complements, not substitutes: the first finds and contains damage; the second structurally prevents uncredentialed packages from executing in third-party environments in the first place.

Note: This does not require closing an open registry. A registry can keep accepting publications without credential proofs while restricting only what builds grant them. Nor can this layer retroactively establish who the actor in this incident was.

---

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

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) · ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 01 — Verifiable Origin](/pillars/#provenance)

As of this writing, OpenAI acknowledges its agents' involvement but describes the activity as benign tasks, so the parties' characterizations of the incident diverge. Ruby Central has not confirmed whether AI agents created or published the packages. Among the figures and dates, the total number of submissions (2,000+) and the date of the first package are Nightingale Collective's counts from the public packages.
