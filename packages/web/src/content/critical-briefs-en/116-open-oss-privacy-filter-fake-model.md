---
brief_no: 116
title: "偽の OpenAI モデルが Hugging Face のトレンド1位になった — 発行者の来歴が、実行の前に独立検証されない"
title_en: "A fake OpenAI model hit #1 trending on Hugging Face — publisher provenance never verified before execution"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2026-05-07
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["010-claude-code-leak-lure", "101-paysafe-fake-payment-sdk", "090-air-fake-agent-skill-toctou", "004-megalodon-github-supply-chain", "048-trapdoor-ai-instruction-provenance"]
status: published
version: "1.0"
og_lead_ja: "偽 OpenAI モデルが Hugging Face トレンド1位、発行者来歴が実行前に未検証"
og_lead_en: "Fake OpenAI model tops Hugging Face trending; publisher provenance unverified before execution"
gap_detected: "Scanning and trending monitoring caught the malicious repository, leading to disclosure and removal."
gap_missing: "A layer that independently verifies, before execution, that the model artifact and its publisher are legitimate."
gap_fix: "Verify the model's publisher provenance before execution, separating the typosquat from the legitimate publisher by provenance."
---

## 1. TL;DR

On May 7, 2026, HiddenLayer disclosed a malicious Hugging Face repository, `Open-OSS/privacy-filter`. It typosquatted OpenAI's legitimate `openai/privacy-filter` release, copied the model card nearly verbatim — including the link to OpenAI's official documentation — and passed as legitimate. Only the README was swapped, instructing users to run `start.bat` on Windows or `loader.py` on Unix-like systems. The `loader.py` fetches a PowerShell command from a remote server and executes an infostealer. The repository reached #1 trending, 244,000 downloads, and 667 likes in under 18 hours, though those numbers were almost certainly artificially inflated. Detection through scanning and trending monitoring worked after the fact. **What was missing is the layer that verifies, before execution, whether the model's publisher is really OpenAI.**

## 2. What happened

- The malicious repository `Open-OSS/privacy-filter` typosquatted OpenAI's legitimate `openai/privacy-filter` release, copied the model card nearly verbatim, and even carried the link to OpenAI's real model card PDF to look legitimate.
- It diverged from the legitimate project in exactly one place — the README — which told users to clone the repo and run `start.bat` (Windows) or `python loader.py` (Linux/macOS) directly.
- After running decoy code to look like a real loader, `loader.py` fetches a PowerShell command from a remote server and ultimately executes a credential-harvesting infostealer.
- Before removal, the repository reached #1 trending, roughly 244,000 downloads, and 667 likes in under 18 hours. (Attribution points to a Chinese-speaking actor, but that is not this Brief's focus.)

The attack succeeds through the following chain.

1. A user looks for `openai/privacy-filter` and lands on `Open-OSS/privacy-filter`, near-identical in name and appearance. The model card is a verbatim copy, down to the link to OpenAI's official documentation.
2. Reputation signals — #1 trending, 244K+ downloads, hundreds of likes — are taken as grounds that it is legitimate.
3. Following the README, the user runs `start.bat` or `loader.py`.
4. `loader.py` fetches a PowerShell command from a remote server, the infostealer executes, and browser credentials, tokens, and wallets are stolen.

## 3. Timeline — disclosure and response

- 2026-05-07: HiddenLayer identifies malicious code in `Open-OSS/privacy-filter` and discloses. At the time the repository sat among the platform's top trending, with over 240,000 downloads.
- 2026-05-07: HiddenLayer reports its findings to Hugging Face's security team.
- 2026-05-08: Hugging Face confirms a terms-of-service violation and removes the repository.

> Note: the facts here rest on HiddenLayer's primary research and established media reporting. The download and like counts were almost certainly artificially inflated and do not represent the real scale of cloning or execution. The majority of the 667 accounts that liked the repository followed mechanical naming patterns — `firstname-lastname###` (504) and `adjectivenoun####` (153) — indicating bot-driven manipulation of the trending list. This Brief focuses not on the attackers' attribution or motives, but on the structure in which a model's publisher provenance is not independently verified before execution.

Response and industry movement after disclosure are as follows.

- HiddenLayer treated any Windows host that cloned the repository and executed the files as compromised, recommending reimaging and rotation of all credentials.
- It also identified a set of malicious repositories under another account using the same command-retrieval URL, noting this is likely part of a broader supply-chain operation targeting open-source ecosystems.

## 4. Why it wasn't stopped

The failure here is not that scanning was weak, nor that users were careless. It is that the trust signals a model hub provides — trending rank, download count, likes, the appearance of the model card — prove nothing about the model's publisher provenance, that is, whether OpenAI actually published it. Detection worked: the malicious code was identified by scanning, and the repository was removed after the report. What was missing sits earlier — verification, at the instant the user executes, that the model artifact and its publisher are legitimate.

The user executed without any means to independently verify the publisher's identity. The verbatim model card, the link to official documentation, the #1 trending rank — all looked like a "legitimate OpenAI model." But looking right and ranking high is not proof of being the publisher one claims to be. In this case the reputation signal itself became the attack surface: a bot-inflated trending rank stood in for legitimacy and drew users toward execution.

> Download and like counts are meant to serve as cues to a model's trustworthiness. But they can be generated mechanically and the ranking can be manipulated. Looking like "many people use this" is not proof that "a legitimate publisher released it."

The same structure connects to [Brief 101 (Paysafe fake payment SDK)](/critical/briefs/101-paysafe-fake-payment-sdk/) and [Brief 004 (Megalodon GitHub supply chain)](/critical/briefs/004-megalodon-github-supply-chain/), where artifacts impersonating legitimate packages or releases were pulled in before their provenance could be checked, and to [Brief 010 (Claude Code leak lure)](/critical/briefs/010-claude-code-leak-lure/), where a legitimate-looking lure went unverified before execution. Each shows that an artifact "looking legitimate" and its publisher and contents being verified right now are separate questions.

## 5. What proof would have changed

Proof-as-auth inserts a layer, ahead of each individual action in which a model is pulled from a hub and executed, that independently verifies the provenance of the artifact and its publisher. Rather than letting trending rank, download count, likes, or the appearance of a model card stand in for legitimacy, it checks — before execution completes — whether this model is an untampered artifact published by the claimed publisher. If the answer is "provenance unknown" or "publisher does not match," the pull and the execution are held in advance.

The design Lemma offers for this primitive is as follows.

- **Pre-execution verification of publisher provenance**: bind pulling and executing a model not to a match in name or appearance, but to the publisher's verifiable provenance — so a typosquat posing as `openai/privacy-filter` is separated out as lacking the legitimate publisher's provenance before execution.
- **Provenance replacement of reputation signals**: remove manipulable reputation signals — trending rank, download count, likes — from the basis for judging legitimacy, and replace them with provenance proof, excluding bot-inflated numbers from standing in for legitimacy.
- **Binding of artifact integrity**: bind not the appearance of the model card or README, but the integrity of the model artifact itself to verifiable provenance, so an artifact disguised as legitimate through copied metadata is separated out as lacking proof before execution.
- **Provenance verification built into CI paths**: embed provenance verification into the CI and automation paths that pull models from a hub, stopping a model that lacks provenance before it is pulled or executed.

Lemma is not a product that scans and removes malicious code, nor one that governs a hub's reputation ranking. Its scope is to independently verify the provenance of the artifact and its publisher before a model is pulled and executed, excluding the passage of typosquats and disguised artifacts before execution. Detection (identifying malicious code, removing the repository, sharing IOCs) and pre-execution proof (a record that independently verifies publisher provenance and artifact integrity before pull and execution) are complements, not substitutes. See [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05) and [Verifiable AI](/pillars/#inference); the view that binds publisher and artifact provenance also connects to [Verifiable Origin](/pillars/#provenance).

## 6. Sources

- HiddenLayer Research Team, “Malware Found in Trending Hugging Face Repository ‘Open-OSS/privacy-filter’” (2026-05-07) — <https://www.hiddenlayer.com/research/malware-found-in-trending-hugging-face-repository-open-oss-privacy-filter>
- Infosecurity Magazine, “Malicious Hugging Face Repo Impersonates OpenAI to Spread Infostealer” (2026-05) — <https://www.infosecurity-magazine.com/news/malicious-hugging-face-repo/>
- The Hacker News, “Fake OpenAI Privacy Filter Repo Hits Hugging Face Trending, Delivers Infostealer” (2026-05) — <https://thehackernews.com/2026/05/fake-openai-privacy-filter-repo-hits-1.html>
- Security Boulevard, “Fake OpenAI Repository on Hugging Face Pushes Infostealer Malware” (2026-05) — <https://securityboulevard.com/2026/05/fake-openai-repository-on-hugging-face-pushes-infostealer-malware/>

References: [Proof-as-Auth: sign in without sending your key](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Verifiable AI](/pillars/#inference) · [Verifiable Origin](/pillars/#provenance) · [Brief 101 (Paysafe fake payment SDK)](/critical/briefs/101-paysafe-fake-payment-sdk/) · [Brief 004 (Megalodon GitHub supply chain)](/critical/briefs/004-megalodon-github-supply-chain/)
