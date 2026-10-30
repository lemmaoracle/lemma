---
brief_no: 166
title: "LiteLLM：正規名で配布された v1.107.0 が、攻撃者の管理するリポジトリでビルドされ、正規の鍵で署名されていた — 署名が、承認されたソースと独立した承認者に結びついているかを、取り込む前に確かめる層は無かった"
title_en: "LiteLLM: v1.107.0, distributed under the official name, was built from an attacker-controlled repository and signed with the genuine key — Nothing let consumers check, before pulling it, that the signature was tied to an approved source and an independent approver"
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
og_lead_ja: "LiteLLM：正規名の v1.107.0 が攻撃者管理のリポジトリでビルドされ、PyPI に約 1 時間 40 分残った"
og_lead_en: "LiteLLM: v1.107.0 under the official name was built from an attacker-controlled repo and stayed on PyPI for about 100 minutes"
industries: ["ai", "developers"]
operations: ["delivery"]
attack_method: "supply-chain"
countries: ["global"]
---

## 1. TL;DR

On 21 October 2026, `litellm==1.107.0`, a release of the AI gateway LiteLLM, appeared on PyPI (seven wheels) and on Docker Hub and GHCR under the official name and standard tags. By LiteLLM's own account, the official `v1.107.0` tag on GitHub contains no malicious files; the artifacts were built from an attacker-controlled repository. LiteLLM describes the release as containing compiled malicious code that steals credentials and loads remote-code-execution tooling. It was live on PyPI from 11:39 UTC for about 1 hour 44 minutes, and on Docker Hub from 11:46 UTC until 14:20 UTC.

Detection worked. An outside researcher flagged it in an issue at 12:06 UTC, and PyPI quarantined the release by 13:23 UTC. The poisoned release carried a valid signature applied by the genuine pipeline with the genuine key. <strong>What did not work was a layer that lets a consumer check, before pulling a signed artifact, that it was built from an approved source with approval from an independent approver.</strong>

## 2. What happened

- **Target**: LiteLLM, an open-source gateway that calls many model providers through one API. Seven `litellm==1.107.0` PyPI wheels; the `v1.107.0`, `latest`, `main-latest` and `main-stable` tags on Docker Hub; the same tags on GHCR.
- **Provenance of the artifacts**: the official GitHub `v1.107.0` tag has no malicious files. The artifacts were built from an attacker-controlled repository, `Berri-AI/litellm`, which imitates the genuine `BerriAI/litellm`, then signed and published by the genuine pipeline (LiteLLM).
- **Signing**: after an incident in March, LiteLLM moved releases to a private repository and Trusted Publishers workflows and signed its Docker images. The compromised v1.107.0 images also carry a valid signature from the then-current key. LiteLLM rotated the signing key on 23 October and advises trusting old-key signatures only on images published before v1.107.0.
- **Content**: LiteLLM describes compiled malicious code that steals credentials and loads remote-code-execution tools. Wiz, in an independent analysis, reports that AWS, GCP and Azure credentials, AI-provider API keys and SSH keys were targeted, and that stolen data was sent to a lookalike domain.
- **Scope**: LiteLLM says enterprise customers on the private registry were not affected and earlier versions are safe. Wiz cites roughly 49,000 downloads from ClickPy data (an independent figure). The actual amount of data taken has not been published.

The chain was as follows.

1. On 27 May 2026, a config file holding an admin key for an internal alpha service, the Agent Platform, was committed to a public repository. It was deleted about three hours later, but stayed in public history until 22 October, and the key was never revoked (LiteLLM calls this human error).
2. On 10 October, the key was used to call the Agent Platform API, and the response contained the GitHub CLI OAuth token of an organisation owner.
3. On 10 and 12 October, throwaway workflows sent CI secrets, including two other maintainers' tokens, to an external endpoint. The 10 October run records were deleted within minutes.
4. On 21 October at 10:08 UTC, a push changing the release workflow was rejected by branch protection, then succeeded when the owner's token overrode the protection. The workflow now accepted another fork as its build source.
5. At 10:46 UTC a staging run started from the lookalike fork. At 11:11 UTC another maintainer's token passed the production approval gate, and the pipeline signed and published v1.107.0 built from the fork commit.
6. Seven wheels reached PyPI at 11:39–11:40 UTC, and images reached Docker Hub and GHCR from 11:46 UTC. At 11:53–11:54 UTC a third maintainer's token deleted the run records.

The irreversible actions were steps 4 to 6. Protection and approval were both passed as someone holding a person's credentials, and what consumers saw was the official name and standard tags.

## 3. Timeline — disclosure and response

- **2026-05-27**: config file with the admin key committed to a public repository; deleted about three hours later; in public history until 10-22.
- **2026-10-10**: the key is used against the Agent Platform API; the owner's token appears in a response; CI secrets are sent out.
- **2026-10-12**: secrets from several private repositories are sent out the same way.
- **2026-10-21 10:08 UTC**: branch protection rejects the change; the owner's token overrides it.
- **2026-10-21 11:11 UTC**: the production approval gate is passed with another maintainer's token.
- **2026-10-21 11:39–11:46 UTC**: seven PyPI wheels, then Docker Hub and GHCR images, are published.
- **2026-10-21 12:06 UTC**: an outside researcher flags the compromise in issue #47826.
- **2026-10-21 12:09–12:24 UTC**: the attacker, using the owner's token, reverts the workflow change and force-pushes it out of visible history.
- **2026-10-21 13:02 UTC onward**: LiteLLM starts response; PyPI quarantines by 13:23; GHCR tags are unavailable at 13:51; at 14:19–14:20 all release-workflow permissions are removed and Docker Hub tags are removed or repointed.
- **2026-10-21 18:20 UTC**: first incident post; updated 20:30 UTC.
- **2026-10-23 21:00 UTC**: attack-chain analysis published; the Docker image signing key is rotated the same day.
- **2026-10-30**: incident post updated with the new signing key's fingerprint.

> Facts here rest on LiteLLM's official posts (the incident post and the attack-chain analysis of 23 October) and Wiz's independent analysis. LiteLLM itself says some assumptions in its early updates on 21 October were inaccurate or incomplete and treats the 23 October analysis as canonical; the early updates guessed that the first token came from internal deployment logs, and the analysis corrects this to the Agent Platform API response. That the attacker used separate tokens to avoid noisy audit logs, and that every reachable token has been identified, are LiteLLM's belief, not confirmed fact. Wiz gives the PyPI quarantine as 13:20 UTC and Docker Hub removal as about 13:53 UTC, against LiteLLM's 13:23 UTC and 14:20 UTC; this Brief uses LiteLLM's values. The commits Wiz dates from 08:56 UTC were to the attacker's fork, a separate event from the 10:08 UTC push to the official release workflow. "About 27 minutes" is computed from the timeline (11:39:51 to 12:06:41); LiteLLM's acknowledgement says "within 20 minutes".

Response and industry reaction:

- **Guidance to consumers**: pin to 1.106.2 or another pre-incident version. In affected environments, delete `cook*` and `sitecustomize*` files and stop the resident process. Rebuilding environments and images is preferred. If 1.107.0 ran on a host with outbound access, assume data left it and rotate every credential the host could reach (IAM role, provider keys in the database, master key and so on).
- **LiteLLM's own actions**: it is revoking all internal-system and vendor tokens, removed all members from its GitHub organisation and rotated its image signing key. On 23 October it said process improvements would be shared "next week"; none had been published by 31 October.

## 4. Why it wasn't stopped

The failure is not that nobody noticed, nor only that one key went unmanaged. It is that no layer let consumers independently check the origin of an artifact before pulling it.

That is the **gap between detection and proof**. Detection worked: an outside researcher flagged the release about 27 minutes after publication, and PyPI quarantined it in about 1 hour 44 minutes. What failed sits before that. Branch protection rejected the change and was overridden with the owner's credentials. The production approval gate was passed with another maintainer's credentials. The run records were deleted. All a consumer sees is the official name, the standard tag and the built artifact; nothing attached to the artifact says it was built from an approved source, through an approved pipeline, and approved by an independent party.

According to LiteLLM, the attacker used separate tokens to trigger and approve the release under a recently relaxed rule that let two engineers do so, though LiteLLM also notes that an owner's token could have relaxed that rule anyway. That an approval was given and that the approver was an independent party are different facts.

The same structure appears in earlier Briefs. [LiteLLM's MCP authentication fallback](/critical/briefs/145-litellm-mcp-oauth2-fallback-empty-auth/) and [its privilege-escalation chain](/critical/briefs/066-litellm-ai-gateway-privilege-escalation/) are other incidents in the same product. In the [keyv/cacheable npm takeover](/critical/briefs/125-keyv-cacheable-npm-account-takeover/) and the [RubyGems malicious packages](/critical/briefs/148-openai-agent-swarm-rubygems-rubydoc-rce/), no published account shows consumers a way to check the origin of an artifact distributed under a genuine name.

> "Signed with the genuine key" and "built from an approved source with independent approval" are different facts. The first is visible to the consumer; the second stays invisible unless it is checked before pulling.

## 5. What proof would have changed

A single step could sit just before a consumer pulls an artifact: confirming that it was built from an approved source and an approved pipeline. The design Lemma offers against this gap is as follows.

<ul class="bd-check">

- **Proof of build provenance**: register, per artifact, the source repository, commit, build workflow and build origin as issuer-signed proof, and let the consumer match it before running. Matched against registered provenance, a build from a similarly named fork fails (unless the authority to rewrite the registration itself is stolen, as the note below says).
- **Proof of approval independence**: treat production approval as the signature of a registered approver distinct from the party that triggered the build, so one credential cannot both trigger and approve.
- **A record that cannot be altered**: keep which proof an artifact was pulled on as a record separate from the publisher's run logs, one the publisher cannot delete.

</ul>

> Note: the proof shows only that an artifact matches its registered provenance and approval. It passes if a registered approver's own credentials are stolen or if the provenance registry itself is compromised. Judging what the code does is outside the proof.

This differs from after-the-fact detection, quarantine and key rotation. The detection layer and this layer are complementary, not substitutes: the former notices a malicious release and has it withdrawn, the latter lets an artifact whose origin cannot be confirmed be stopped before it is pulled.

## 6. Sources

- **LiteLLM (primary, company notice)**: "Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised" (incident post, 2026-10-21, updated 10-23 and 10-30) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM (primary, company notice)**: "The attack chain behind the v1.107.0 LiteLLM release" (2026-10-23) — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **GitHub (primary, reporting issue)**: BerriAI/litellm issue #47826 (2026-10-21 12:06 UTC) — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz (independent analysis)**: "LiteLLM Compromised, Steals Credentials" (2026-10-21, updated 10-22) — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

LiteLLM's investigation continues, so the range of tokens identified and the process improvements may change. Wiz's download figure quotes ClickPy data and does not appear in LiteLLM's notice. The actual amount of data taken and the attacker's identity have not been published. Japanese media and blogs are not used as sources.

References: [The last layer left in AI-era cyber defense](/blog/detection-is-not-proof/), [Pillar 01 — Verifiable origin](/pillars/#provenance)
