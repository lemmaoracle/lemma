---
brief_no: 166
title: "LiteLLM：正規名で配布された v1.107.0 が、攻撃者の管理するリポジトリでビルドされ、正規の鍵で署名されていた — 成果物が公式のソースと一致するかを、取り込む前に照合する層は無かった"
title_en: "LiteLLM: v1.107.0, distributed under the official name, was built from an attacker-controlled repository and signed with the genuine key — Nothing checked, before it was pulled, that the artifact matched the official source"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-21
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["145-litellm-mcp-oauth2-fallback-empty-auth", "066-litellm-ai-gateway-privilege-escalation", "148-openai-agent-swarm-rubygems-rubydoc-rce", "125-keyv-cacheable-npm-account-takeover"]
status: draft
version: "1.0"
og_lead_ja: "LiteLLM：v1.107.0 が攻撃者のリポジトリでビルドされ、署名つきで配布"
og_lead_en: "LiteLLM: v1.107.0 was built from an attacker repo and shipped signed"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規の署名つきで、\n攻撃者の版が\n配布された。\n<accent>PyPI に約 1 時間 44 分</accent>"
og_headline_en: "Attacker-built release,\ngenuine signature.\n<accent>On PyPI for 1 h 44 min.</accent>"
summary_labels: ["What happened", "Why it was hard to tell", "The missing layer"]
key_figures:
  - value: "~49,000"
    label: "Downloads of v1.107.0 (ClickPy figure cited by Wiz; independent analysis)"
    tone: "alert"
  - value: "11:39 → 13:23"
    label: "From publication on PyPI to quarantine (10-21, UTC)"
  - value: "05-27 → 10-21"
    label: "From an admin key landing in a public repository to the malicious release (the key had not been revoked)"
glossary:
  - term: "LiteLLM"
    desc: "An open-source gateway that calls many AI model providers through one API. It often holds every provider's API key in one place."
  - term: "Signature (cosign)"
    desc: "A digital signature on a container image. It shows the image came out of the key holder's pipeline; it does not show which source was built."
  - term: "Trusted Publishing"
    desc: "A PyPI mechanism that lets packages be published only from a set CI workflow, without static passwords or tokens, leaving a record of the publication's provenance."
insight:
  slug: "signed-but-wrong-source"
  label: "Genuine signature, attacker's source"
  quote: "The release built from the attacker's fork carried the genuine key's signature and valid publishing provenance. What the signature showed was only that it had passed through the genuine pipeline."
industries: ["ai", "developers"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Pin the versions you pull by version and hash, and move to a new release only after checking it"
  - slug: "ownership-check"
    item: "Compare the contents of each artifact you pull with the tag in the official repository"
  - slug: "audit-trail"
    item: "Record which version runs where, and which credentials each host can reach"
attack_method: "supply-chain"
impact: "A credential-stealing release was published to PyPI, Docker Hub and GHCR under the official name and tags (about 49,000 downloads, independent analysis)"
takeaway: "The release built from the attacker's fork carried a genuine signature and provenance. Nothing checked, before it was pulled, that the artifact matched the official source."
self_check: "Do you check that the open-source artifacts you pull match the source in the official repository?"
countries: ["global"]
---

## 1. TL;DR

On 21 October 2026, `litellm==1.107.0`, a release of the AI gateway LiteLLM, was published to PyPI (seven wheels) and to Docker Hub and GHCR under the official name and standard tags. By LiteLLM's own account, the official `v1.107.0` tag on GitHub contains no malicious files; the artifacts were built by LiteLLM's own pipeline from the source of an attacker-controlled fork. The content is malicious code that steals credentials and loads remote-code-execution tooling.

The attacker had obtained an organisation owner's GitHub token through an admin key that had sat in a public repository since May without being revoked. With that token the attacker rewrote the release workflow, and passed the production approval with another maintainer's token. The resulting release carried the genuine key's signature and valid publishing provenance.

An outside researcher flagged the release about 27 minutes after publication, and PyPI quarantined it in about 1 hour 44 minutes. Until then, a release with a genuine signature and provenance reached consumers as it was. What failed was the layer that checks, before an artifact is pulled, that it matches the official source.

## 2. What happened

- **Target**: seven `litellm==1.107.0` PyPI wheels; the `v1.107.0`, `latest`, `main-latest` and `main-stable` tags on Docker Hub, and the same tags on GHCR (LiteLLM).
- **Provenance of the artifacts**: the official GitHub `v1.107.0` tag has no malicious files. The artifacts were built from the source of `Berri-AI/litellm`, a fork imitating the genuine `BerriAI/litellm`, then signed and published by LiteLLM's pipeline (LiteLLM).
- **Signature and provenance**: after an incident in March, LiteLLM replaced static publishing credentials with Trusted Publishing and signed its container images with cosign. In its 30 October post, LiteLLM says v1.107.0 was validly signed with valid Trusted Publishing provenance, and that "no pipeline controls can defend against an attacker who is an organization owner, because the owner owns the pipeline". The signing key was rotated on 23 October.
- **Content**: LiteLLM describes compiled malicious code that steals credentials and loads remote-code-execution tools. Wiz, in an independent analysis, reports that AWS, GCP and Azure credentials, AI-provider API keys and SSH keys were targeted, and that stolen data was sent to a lookalike domain.
- **Scope**: LiteLLM says enterprise customers on the private registry were not affected and earlier versions are safe. Wiz cites roughly 49,000 downloads from ClickPy data (independent analysis), and observed stolen AWS role credentials being used from about 4.5 hours after exfiltration (16:20–17:01 UTC; independent analysis).
- **Entry point**: on 27 May, a config file holding an admin key for an internal experimental service, the Agent Platform, was committed to a public repository. It was deleted about three hours later but stayed in public history until 22 October, and the key was never revoked. On 10 October, an API call made with that key returned an organisation owner's GitHub CLI token (LiteLLM).
- **Not disclosed**: the actual amount of data taken, and the attacker's identity. LiteLLM says it has identified every token that could have been reached; that is the company's belief.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">The sequence, as far as disclosed</span></div>
<p class="rx-ex-cap">The consumer's point to stop it is ⑤. Compared with the source of the official tag, a build from the fork does not match. Steps ① to ④ all happened inside LiteLLM.</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">Attacker</div><div class="no">1</div><b>Uses the admin key left in a public repository</b><p>10-10. The response contains the owner's token.</p></div>
<div class="rx-step"><div class="who">Attacker</div><div class="no">2</div><b>Sends CI secrets out</b><p>10-10 and 10-12, including two other maintainers' tokens.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">3</div><b>Points the release workflow at the fork</b><p>10-21. Branch protection overridden with the owner's token.</p></div>
<div class="rx-step crit"><div class="who">Attacker</div><div class="no">4</div><b>Passes the production approval</b><p>With another maintainer's token. The pipeline signs and publishes.</p></div>
<div class="rx-step crit"><div class="who">Consumer</div><div class="no">5</div><b>Pulls it under the official name and tag</b><p>Signature and provenance both genuine.</p></div>
</div>
</figure>

## 3. Timeline — disclosure and response

- **2026-05-27**: a config file with the admin key is committed to a public repository; deleted about three hours later; in public history until 22 October.
- **2026-10-10**: the key is used against the Agent Platform API and the owner's token appears in a response. Throwaway workflows send CI secrets out, and the run records are deleted within minutes. On the 12th, secrets from several private repositories are sent out the same way.
- **2026-10-21**: at 10:08 UTC a change to the release workflow is rejected by branch protection and pushed through with the owner's token. At 11:11 UTC the production approval is passed with another maintainer's token. Publication to PyPI starts at 11:39 UTC, and to Docker Hub and GHCR at 11:46 UTC. At 12:06 UTC an outside researcher flags it in issue #47826. PyPI quarantines the release by 13:23 UTC, and at 14:20 UTC Docker Hub tags are removed or repointed. First incident post at 18:20 UTC.
- **2026-10-23**: attack-chain analysis published; the image signing key is rotated the same day.
- **2026-10-30**: a list of changes with target dates is published; the incident post adds the new signing key's fingerprint.

> Facts here rest on LiteLLM's official posts (the incident post, the 23 October attack-chain analysis and the 30 October list of changes) and Wiz's independent analysis. LiteLLM says some assumptions in its early updates on 21 October were inaccurate and treats the 23 October analysis as canonical. Wiz gives the PyPI quarantine as 13:20 UTC and Docker Hub removal as about 13:53 UTC; this Brief uses LiteLLM's values. The commits Wiz dates from 08:56 UTC were to the attacker's fork, a separate event from the 10:08 UTC push to the official workflow. At 12:09–12:24 UTC the attacker used the owner's token to revert the workflow change and remove it from visible history.

### After disclosure

- **Guidance to consumers**: pin to 1.106.2 or another pre-incident version. In affected environments, delete `cook*` and `sitecustomize*` files, stop the resident process and rebuild environments and images. If 1.107.0 ran on a host with outbound access, assume data left it and rotate every credential the host could reach (IAM role, provider keys in the database, master key and so on). Trust old-key signatures only on images published before v1.107.0.
- **LiteLLM's own actions**: it removed all members from its GitHub organisation and revoked internal and vendor tokens. On 30 October it published 25 changes with target dates. Holding production approval only in a dedicated account tied to a specific device in its office, and keeping day-to-day accounts out of the owner role, are marked complete. A verifier running outside GitHub that compares published wheels and images with the official tag and pulls them on a mismatch is planned by 31 December.

## 4. Why it wasn't stopped

The failure is not only one unmanaged key. There was no **layer that checks, before an artifact is pulled, that it matches the official source**, and all consumers could see was the official name, the standard tag, and a genuine signature and provenance.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 2</span><span class="rx-ex-t">The gap between detection and proof</span></div>
<p class="rx-ex-cap">Proof here means checking, before pulling, that "this artifact was built from the source of this tag in the official repository", and keeping a record. Detection means noticing a malicious release after it is out.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Proof layer · absent here</b>Compare the artifact with the source of the official tag</div>
<div class="rx-zone gapz"><b>Gap</b><span>It reached consumers with<br>a genuine signature and provenance</span></div>
<div class="rx-zone det"><b>Detection layer · noticed</b>Flagged from outside, quarantined and withdrawn</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>Built from the fork</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>Published under the official name</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Flagged at 12:06</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>Quarantined at 13:23</b></div>
</div>
</figure>

Detection worked: the PyPI release was quarantined in under two hours. But "signed with the genuine key" and "built from the official source" are separate facts, and the signature and provenance showed only the first. Branch protection and the production approval were both passed with stolen personal tokens; that separation is the **gap between detection and proof**.

The same structure appears in the [keyv/cacheable npm takeover](/critical/briefs/125-keyv-cacheable-npm-account-takeover/) (malicious releases shipped under the genuine package name).

## 5. How to counter this

**Pin the open-source versions you pull, and move to a new release only after checking that its contents match the source in the official repository.** A correct signature or provenance shows an artifact passed through the genuine pipeline, not which source that pipeline used. If releases that cannot be checked are not pulled, whatever happens inside the publisher is less likely to reach your environment. This is not a substitute for detection; it sits in front of it.

### Industries and operations to watch

- **Industry · AI adoption (all industries)**: organisations running their own AI gateway or agent platform. It holds many providers' API keys and cloud credentials in one place, so a malicious release running there reaches a lot.
- **Industry · Developers & agent operations**: teams whose CI and deployments pull open-source packages and container images automatically. Moving tags such as `latest` are pulled the moment they are published.
- **Operation · Sending & delivery**: on the publishing side, controlling who triggers and who approves a release.

### Do today's controls close it?

| Control | This case | Why |
| --- | --- | --- |
| Verifying image signatures (cosign) | Not effective | The poisoned images carried a valid signature from the then-genuine key. |
| Checking Trusted Publishing provenance | Not effective | LiteLLM says v1.107.0 also had valid provenance. |
| Outside reports and quarantine | Partial | Flagged about 27 minutes after publication and quarantined in about 1 hour 44 minutes; environments that pulled it in between were reached. |
| Pinning by version and hash | Effective | Environments pinned by hash or digest to a pre-incident version do not pull 1.107.0. LiteLLM also advises pinning to a pre-incident version. |

### What is needed

1. **Pin versions, and do not move to a new release at once.** Pin the open-source software used in production by version and hash (images by digest). Do not take moving tags such as `latest` straight into production.
2. **Compare what you pull with the official source.** Before moving to a new release, check that the package or image contents match the source of the tag in the official repository. Keep checking signatures and provenance as the step before that.
3. **Record which version ran where.** Keep which version ran on which host, and which credentials each host can reach, in a form that can be checked later: in other words, as proof. When a release turns out to be malicious, the scope of what to rotate can be set at once.

### Checklist

Three things to confirm in your organisation about the open source you pull and your own releases

- Do you pin the open-source packages and images used in production by version and hash?
- In your own releases, are the account that triggers and the account that approves held by different people on different devices?
- Do you keep a list of which credentials each host running dependencies can reach?

Note: if the publisher's source tag itself is rewritten, the comparison will match. Here the official tag was not tampered with, so comparing contents would show a difference. Judging what malicious code does is outside this check. LiteLLM's investigation continues; if follow-up reports reveal more, this Brief will be revised.

## 6. Sources

- **LiteLLM (Primary, company notice)**: "Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised" (incident post, 2026-10-21, updated 10-23 and 10-30) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM (Primary, company notice)**: "The attack chain behind the v1.107.0 LiteLLM release" (2026-10-23) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **LiteLLM (Primary, company notice)**: "What we are changing after October 21" (changes and target dates, 2026-10-30) — <https://docs.litellm.ai/blog/security-changes-after-oct-21-2026>
- **GitHub (Primary, reporting issue)**: BerriAI/litellm issue #47826 (2026-10-21 12:06 UTC) — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz (Independent analysis)**: "LiteLLM Compromised, Steals Credentials" (2026-10-21, updated 10-22) — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
