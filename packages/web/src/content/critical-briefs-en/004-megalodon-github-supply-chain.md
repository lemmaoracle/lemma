---
brief_no: 4
title: "Megalodon GitHub supply chain — 6 時間で 5,561 リポジトリを汚染した CI/CD credential 窃取キャンペーン"
title_en: "Megalodon GitHub Supply Chain — CI/CD Credential-Theft Campaign That Poisoned 5,561 Repositories in 6 Hours"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-22
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "6 時間で 5,561 リポジトリの CI/CD 認証情報を窃取 — Megalodon GitHub サプライチェーン"
og_lead_en: "5,561 repos poisoned in 6 hours via CI/CD credential theft — Megalodon GitHub supply chain"
---

## TL;DR

Megalodon, surfaced in May 2026, is an automated supply-chain attack campaign. Within 6 hours, 5,781 malicious commits were pushed to 5,561 GitHub repositories, propagating malware that exfiltrates CI/CD credentials. Initial analyses were published by Safe Dep and Ox Security; Hudson Rock identified infostealer infections as the origin point. The attack chain proceeded by direct push using GitHub credentials stolen from infected developers — without touching the legitimate npm account behind the @tiledesk/tiledesk-server package, the GitHub repository was compromised and malicious versions (2.18.6 through 2.18.12) were distributed. This incident is a recent representative case of absent independent verification of code provenance (commit author / origin).

---

## 1. Incident Overview

- **Campaign name**: Megalodon
- **Disclosure / reporting**: Safe Dep, Ox Security, Hudson Rock
- **Scale**: 5,561 GitHub repositories, 5,781 malicious commits, within 6 hours
- **Principal payload path**: @tiledesk/tiledesk-server, the npm package backing an open-source live-chat / chatbot platform, versions 2.18.6 through 2.18.12 (published 2026-05-19 through 2026-05-21). The last clean release is 2.18.5
- **Exfiltrated**: AWS secret keys, Google Cloud access tokens, AWS / GCP / Azure metadata, instance role credentials, SSH private keys, Docker / Kubernetes configurations, Vault tokens, GitHub tokens, Bitbucket tokens
- **Attacker GitHub account characteristics**: Random usernames (rkb8el9r, bhlru9nr, and similar), pushing via compromised PATs or deploy keys
- **Spoofing characteristics**: Reuse of four author names — build-bot / auto-ci / ci-bot / pipeline-bot — paired with seven kinds of commit messages dressed up as routine CI maintenance

---

## 2. Timeline

- 2026-05-19: tiledesk-server 2.18.6 (the first backdoored release) is published to npm
- 2026-05-19 to 2026-05-21: 2.18.7 through 2.18.12 are released in succession, all backdoored
- 2026-05-22: Safe Dep and Ox Security each publish independent technical analyses
- Around 2026-05-22: Hudson Rock reports the infostealer-origin path. The attacker GitHub usernames associated with affected repositories match infostealer-infected machines in 33% of cases directly, with additional matches via email address

---

## 3. Attack Vector

1. **Initial compromise**: Infostealer infection. GitHub credentials (PATs, deploy keys, session tokens) are stolen from individual developers' personal machines
2. **Credential routing**: Using the stolen credentials, the infected developer's direct push access into the GitHub repositories they hold permission to is taken over
3. **Mass push**: An automated script pushes 5,781 commits dressed up as routine CI maintenance to 5,561 repositories within 6 hours. Each commit uses one of the spoofed author names build-bot / auto-ci / ci-bot / pipeline-bot
4. **Persistence vehicle**: The Megalodon payload is bundled inside GitHub Actions workflow files (`.github/workflows/`), replacing the original workflow with an attacker-controlled "Optimize-Build" workflow
5. **Downstream amplification**: When a repository owner merges the malicious commits, the CI/CD pipeline executes Megalodon, exfiltrates AWS / GCP / Azure / Vault credentials from the CI environment, and propagates further
6. **Impact realization example**: Without ever touching the npm account behind @tiledesk/tiledesk-server (`eljohnny`), the GitHub repository was compromised and the maintainer unknowingly published malicious versions 2.18.6 through 2.18.12

---

## 4. Structural Analysis

This incident is a representative case of a structure in which, across commit / release / CI/CD pipeline stages, **commit author identity and repository owner authentication are not independently verified, yet form a chain**. The attacker had only to seize one stage (an individual developer's credentials) for all downstream stages (npm publication, CI/CD execution, malicious distribution with no obvious culprit) to follow legitimate processes.

The primitive differs from Brief 001 and Brief 002 (cross-chain message trust on bridges) — the target here is a code commit, not a cross-chain message — but the underlying structure is shared: **the chain of trust is not independently verified at each stage**. The earlier Briefs concerned the config and observation layers; this incident concerns the authentication layer of commit author and repo owner. Both share the structure of absent trust-boundary verification.

The structure differs from Brief 003 (Starlette / BadHost) in that the present case concerns the origin of code commits while Brief 003 concerns the authentication of HTTP requests, but the two are adjacent: credential concentration and authentication bypass are shared points of discussion.

---

## 5. The detection–proof gap

In this incident, three firms — Safe Dep, Ox Security, and Hudson Rock — independently analyzed the campaign and identified the cause (infostealer origin) and the scope (5,561 repositories, four spoofed author names) within five days. The detection layer contributed to shaping the contours of the event and made the problem visible across the industry. This Brief does not deny the role of detection vendors.

But detection does not change what the receiving sides (GitHub, npm registry, CI/CD pipelines) accept. The attacker's spoofed commits were pushed through the legitimate commit signing process, and the registry accepted publication under what looked like a legitimate maintainer account. Detection limited the spread of damage, but it could not stop acceptance itself.

For the purposes of establishing in regulatory filings or administrative proceedings whether "the commit was legitimate / the publication was legitimate," detection scores carry no independent attribution residue. Pre-execution attestation stands in a **complementary**, not substitutive, relationship to detection. The requirement is a design that embeds, on each commit, an independently verifiable cryptographic proof that "this was generated by a legitimate individual developer under legitimate authority" — and that the CI/CD pipeline verifies the proof before building the commit. GitHub's signing commits (GPG signing) is conceptually in this direction, but as long as the key itself sits on the machine, the structure of seizure via infostealer remains. The direction of fixing commit author identity as a ZK proof without exposing the key is discussed separately in [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05) (for the thesis on the relationship between detection and pre-execution attestation, see [The last layer left in AI-era cyber defense](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05)).

---

## 6. Response and Industry Developments

- **Safe Dep**: Identified and disclosed the Megalodon payload path in tiledesk-server
- **Ox Security**: Independent analysis of the Megalodon CI/CD malware (lead researcher: Bustan)
- **Hudson Rock**: Confirmed the infostealer-origin path with empirical data (33% username match)
- **GitHub / npm**: During the same period, npm introduced "graded releases" (2026-05-22), adding a step so that leaked tokens alone cannot publish a package (a related but separate matter)
- **npm registry**: An industry-wide cross-organizational process for early detection and rollback of malicious publications under legitimate maintainer accounts is being put in place

On the relationship with TeamPCP: Just before Megalodon surfaced, TeamPCP had announced an "open-sourcing" of the Shai-Hulud supply-chain worm and a "supply-chain attack competition," but Ox Security's Bustan has stated that no evidence linking Megalodon to TeamPCP has been found.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed by this incident (absent independent verification of commit author and repo origin), Lemma proposes a design that fixes, at each stage of commit / release / CI/CD pipeline, an independently verifiable cryptographic proof of "this commit / artifact came from a legitimate origin." The core is a design in which the key itself does not sit on a machine that can be seized (combined with key-less proofs), in the direction of fixing commit author identity as a ZK proof. For design details see [Bridge exploits in 2026: the case for verifiable origin proofs](https://lemma.frame00.com/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04) and [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Safe Dep technical analysis**: "Megalodon mass GitHub repo backdooring of CI workflows" (2026-05, Safe Dep official blog) — https://safedep.io/megalodon-mass-github-repo-backdooring-ci-workflows/
- **Ox Security technical analysis**: "Megalodon CI/CD malware on GitHub" (2026-05, Ox Security official blog, lead researcher: Bustan) — https://www.ox.security/blog/megalodon-cicd-malware-github/
- **Hudson Rock analysis**: "Infostealers just spawned a 5,000-repo GitHub supply chain attack" (2026-05, Hudson Rock official blog) — Confirmation of the infostealer-origin path with empirical data. https://www.hudsonrock.com/blog/infostealers-just-spawned-a-5000-repo-github-supply-chain-attack

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
