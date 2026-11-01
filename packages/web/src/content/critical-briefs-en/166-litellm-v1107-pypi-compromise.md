---
brief_no: 166
title: "LiteLLM：攻撃者のフォークからビルドされた v1.107.0 が、正規の署名つきで配布された"
title_en: "LiteLLM: v1.107.0, built from an attacker's fork, was distributed with a genuine signature"
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
sections: "proof"
gate: "intake"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規の署名つきで、\n攻撃者の版が\n配布された。\n<accent>PyPI に約 1 時間 44 分</accent>"
og_headline_en: "Attacker-built release,\ngenuine signature.\n<accent>On PyPI for 1 h 44 min.</accent>"
key_figures:
  - value: "~49,000"
    label: "Downloads of v1.107.0 (ClickPy figure cited by Wiz; independent analysis)"
    tone: "alert"
  - value: "11:39 → 13:23"
    label: "From publication on PyPI to quarantine (10-21, UTC)"
  - value: "05-27 → 10-21"
    label: "From an admin key landing in a public repository to the malicious release (the key had not been revoked)"
insight:
  slug: "signed-but-wrong-source"
  label: "Genuine signature, attacker's source"
  quote: "What to check before pulling a release is not whether it is signed, but which source it was built from."
industries: ["ai", "developers"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "Pin the versions you pull by version and hash, and move to a new release only after checking it"
  - slug: "ownership-check"
    item: "Check that each artifact you pull is an approved build from the official repository's tag"
  - slug: "audit-trail"
    item: "Record which version runs where, and which credentials each host can reach"
attack_method: "supply-chain"
impact: "A credential-stealing release was published to PyPI, Docker Hub and GHCR under the official name and tags (about 49,000 downloads, independent analysis)"
takeaway: "The release built from an attacker's fork still carried a genuine signature and provenance. They show which pipeline built a release, not which source it pulled in."
self_check: "Do you pin the open-source packages and images you run in production by version and hash?"
countries: ["global"]
---

## 1. Summary

LiteLLM v1.107.0, an AI gateway release, was built from an attacker's fork by LiteLLM's own pipeline and published to PyPI, Docker Hub and GHCR under the official name and tags. It carried a signature from the genuine key and valid publishing provenance; after an outside report, PyPI quarantined it in about 1 hour 44 minutes. <strong>A signature and provenance show which pipeline produced a release; they do not guarantee which source that pipeline pulled in.</strong>

## 2. What got through

- **What got through**: the publication and pulling of the malicious `litellm==1.107.0` under the official name and standard tags. On PyPI it was available from 11:39 UTC on 21 October until it was quarantined at 13:23 UTC.
- **What reaches the receiving side**: in general, a consumer sees the name, version, tag, signature and provenance. According to LiteLLM, v1.107.0 carried a valid signature (cosign) from the then-genuine key and valid Trusted Publishing provenance.
- **Not disclosed**: the actual amount of data taken, and the attacker's identity.

## 3. What to check

Whatever the route, the condition for telling them apart is that the consumer checks, before pulling, that the artifact is an approved build from the official repository's tag.

- **Who approves**: the publisher. It rebuilds from the official tag's source somewhere other than the release pipeline, and approves only hashes that match the published artifacts. The approval key is kept out of reach of both the release pipeline and the GitHub organisation's permissions. The consumer can also approve versions it has rebuilt and checked itself. Whether the source is official is decided by whether the commit is reachable from the official tag (a fork's commit can sometimes be looked up by ID through the official repository).
- **Where it is checked**: at the point where the consumer's CI or deployment fetches packages and images. Artifacts that do not match an approved hash are not pulled in.
- **What is left**: a record of which version ran on which host and under which approval. If a release turns out to be malicious, the range of credentials to rotate can be decided afterwards.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before pulling, that the artifact is an approved build from the official tag's source, and keeping a record. Detection means noticing after a malicious release is out.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Check the artifact against approved builds before pulling it</div>
<div class="rx-zone gapz"><b>In between</b><span>It reached consumers with a genuine<br>signature and provenance</span></div>
<div class="rx-zone det"><b>Detection · worked</b>Act on an outside report, quarantine and pull the release</div>
<div class="rx-g g1"><div class="t">10-21 11:39</div><b>Published to PyPI</b></div>
<div class="rx-g g2"><div class="t">until 13:23</div><b>Could be pulled under the official name</b></div>
<div class="rx-g g3"><div class="t">12:06</div><b>Outside researcher reports it</b></div>
<div class="rx-g g4"><div class="t">13:23</div><b>PyPI quarantines it</b></div>
</div>
</figure>

What detection stopped was the published release, not the environments that had already pulled it. A malicious release shipped under the genuine name is an issue shared with the [keyv/cacheable npm takeover](/critical/briefs/125-keyv-cacheable-npm-account-takeover/) (malicious versions shipped under the genuine name).

## 4. What Lemma does

**Lemma builds the check in section 3 into the point where packages and images are pulled.** It does not look for intrusions; it checks whether the artifact about to be pulled is an approved build.

### Industries and operations to watch

- **Industry · AI adoption (all industries)**: organisations running their own AI gateways or agent platforms. Many model providers' API keys and cloud credentials sit in one place, so a malicious release running there reaches far.
- **Industry · Developers & agent operations**: teams whose CI and deployments pull open-source packages and container images automatically. Moving tags such as `latest` are pulled the moment they are published.
- **Operation · Sending & delivery**: on the publishing side, controlling who can trigger and approve a release.

### Current controls vs Lemma

| Control | Build from a fork's source | Rewriting the official tag itself | Malicious release from the holder of the approval key |
| --- | --- | --- | --- |
| Checking signatures and publishing provenance (cosign, Trusted Publishing) | Not effective | Not effective | Not effective |
| Checking provenance against a named source repository and tag (SLSA etc.) | Partial | Not effective | Not effective |
| Outside reports and quarantine | Partial | Partial | Partial |
| Pinning, and delaying updates after publication | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Not effective | Not effective |

A signature and provenance confirm which pipeline built a release. The provenance here names a workflow in a release repository separate from the source, and that workflow pulled the fork's source by changing an input. Checking a named source repository and tag in the provenance can work when the build runs in the source repository itself, but it passes for anyone who can rewrite the workflow. Pinning keeps a new version from being pulled straight away, and delaying updates after publication (such as Renovate's minimumReleaseAge) waits for outside reports in the meantime; neither checks the contents of the version being adopted. Lemma checks the artifact itself: whether what is about to be pulled is an approved build from the official tag's source. For open-source projects whose publishers issue no approvals, the reference is a version the consumer has rebuilt and checked itself.

Note: Lemma's check works only where it is built into the point of pulling, the approval key is held separately from the release pipeline, and the approval rests on a match with an independent rebuild from the official tag. It passes if the official tag's source itself is rewritten, or if the approval key holder's authority is taken over. Here the attacker used the owner's token to override branch protection on the official repository; malicious code that lands in the official repository cannot be told apart by Lemma's check. In this case the production approval on GitHub was also passed with a stolen maintainer token. LiteLLM had restricted approval to a dedicated account tied to an office device, but had temporarily relaxed that restriction that week. Approval with a separate key does not work if operations relax it. The table compares what each control checks; it does not show whether anything would have stopped this case. Lemma does not detect or prevent intrusions or malicious code.

### Checklist

Three points for your organisation to check about the open-source code you pull and your own releases

- Before moving to a new version, do you review the difference between the published artifact and the source at the official repository's tag?
- In your own releases, are the account that triggers a release and the account that approves it held by different people on different devices?
- Do you keep a list of which credentials each host running your dependencies can reach?

## 5. Facts and timeline

- **Target**: seven `litellm==1.107.0` PyPI wheels; the `v1.107.0`, `latest`, `main-latest` and `main-stable` tags on Docker Hub, and the same tags on GHCR (LiteLLM).
- **Provenance of the artifacts**: the official GitHub `v1.107.0` tag has no malicious files. The artifacts were built from the source of `Berri-AI/litellm`, a fork imitating the genuine `BerriAI/litellm`, then signed and published by LiteLLM's pipeline (LiteLLM). The release workflow lives in a private release repository (`BerriAI/project-releaser`); the attacker changed it so the source owner could be set by an input (commit `9cf97e9`), then ran it against the fork's commit. The images were signed with the cosign key the pipeline uses (LiteLLM).
- **Signature and provenance**: after an incident in March, LiteLLM replaced static publishing credentials with Trusted Publishing and signed its container images with cosign. Trusted Publishing lets packages be published to PyPI only from a set CI workflow. In its 30 October post, LiteLLM says v1.107.0 was validly signed with valid provenance, and that "no pipeline controls can defend against an attacker who is an organization owner, because the owner owns the pipeline". The signing key was rotated on 23 October.
- **Content**: LiteLLM describes compiled malicious code that steals credentials and loads remote-code-execution tools. Wiz, in an independent analysis, reports that AWS, GCP and Azure credentials, AI-provider API keys and SSH keys were targeted, and that stolen data was sent to a lookalike domain.
- **Scope**: LiteLLM says enterprise customers on the private registry were not affected and earlier versions are safe. Wiz cites roughly 49,000 downloads from ClickPy data (independent analysis), and observed stolen AWS role credentials being used from about 4.5 hours after exfiltration (16:20–17:01 UTC; independent analysis).
- **Entry point**: on 27 May, a config file holding an admin key for an internal experimental service, the Agent Platform, was committed to a public repository. It was deleted about three hours later but stayed in public history until 22 October, and the key was never revoked. On 10 October, an API call made with that key returned an organisation owner's GitHub CLI token. The attacker used that token to rewrite the release workflow and passed the production approval with another maintainer's token. That week, to allow more frequent releases, the restriction of production approval to a dedicated account tied to an office device had been temporarily relaxed, so any two engineers could trigger and approve a release (LiteLLM).

### Timeline

- **2026-05-27**: a config file with the admin key is committed to a public repository; deleted about three hours later; in public history until 22 October.
- **2026-10-10**: the key is used against the Agent Platform API and the owner's token appears in a response. Throwaway workflows send CI secrets out, and the run records are deleted within minutes. On the 12th, secrets from several private repositories are sent out the same way.
- **2026-10-21**: at 10:08 UTC a change to the release workflow is rejected by branch protection and pushed through with the owner's token. At 11:11 UTC the production approval is passed with another maintainer's token. Publication to PyPI starts at 11:39 UTC, and to Docker Hub and GHCR at 11:46 UTC. At 12:06 UTC an outside researcher flags it in issue #47826. PyPI quarantines the release by 13:23 UTC, GHCR tags were unavailable by 13:51 UTC, and at 14:20 UTC Docker Hub tags are removed or repointed. First incident post at 18:20 UTC.
- **2026-10-23**: attack-chain analysis published; the image signing key is rotated the same day.
- **2026-10-30**: a list of changes with target dates is published; the incident post adds the new signing key's fingerprint.

> Facts here rest on LiteLLM's official posts (the incident post, the 23 October attack-chain analysis and the 30 October list of changes) and Wiz's independent analysis. LiteLLM says some assumptions in its early updates on 21 October were inaccurate and treats the 23 October analysis as canonical. Wiz gives the PyPI quarantine as 13:20 UTC and Docker Hub removal as about 13:53 UTC; this Brief uses LiteLLM's values. The commits Wiz dates from 08:56 UTC were to the attacker's fork, a separate event from the 10:08 UTC push to the official workflow. At 12:09–12:24 UTC the attacker used the owner's token to revert the workflow change and remove it from visible history. What has not been disclosed does not mean no measure was in place. As of 1 November, there has been no update after 30 October.

### After disclosure

- **Guidance to consumers**: pin to 1.106.2 or another pre-incident version. In affected environments, delete `cook.pth`, `cook.py`, `sitecustomize.py` and any `__pycache__/cook*.pyc` and `sitecustomize*.pyc`, stop the resident process and rebuild environments and images. If 1.107.0 ran on a host with outbound access, assume data left it and rotate every credential the host could reach (IAM role, provider keys in the database, master key and so on). Trust old-key signatures only on images published before v1.107.0.
- **LiteLLM's own actions**: it removed all members from its GitHub organisation and revoked internal and vendor tokens. On 30 October it published 25 changes with target dates. Holding production approval only in a dedicated account tied to a specific device in its office, and keeping day-to-day accounts out of the owner role, are marked complete. A verifier running outside GitHub that compares published wheels and images with the official tag and pulls them on a mismatch is planned by 31 December.

## 6. Sources

- **LiteLLM (Primary, company notice)**: "Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised" (incident post, 2026-10-21, updated 10-23 and 10-30) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM (Primary, company notice)**: "The attack chain behind the v1.107.0 LiteLLM release" (2026-10-23) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **LiteLLM (Primary, company notice)**: "What we are changing after October 21" (changes and target dates, 2026-10-30) — <https://docs.litellm.ai/blog/security-changes-after-oct-21-2026>
- **GitHub (Primary, reporting issue)**: BerriAI/litellm issue #47826 (2026-10-21 12:06 UTC) — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz (Independent analysis)**: "LiteLLM Compromised, Steals Credentials" (2026-10-21, updated 10-22) — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

References: ["The last layer left in AI-era cyber defense"](https://lemma.frame00.com/blog/detection-is-not-proof/)
