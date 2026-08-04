---
brief_no: 121
title: "Hugging Face Diffusers「FaceHugger」：モデルを読み込むだけで任意コードが実行された — 安全ガードは最初の1回しか確かめていなかった（Zafran / CVE-2026-44827 他）"
title_en: "\"FaceHugger\" in Hugging Face Diffusers: loading a model ran arbitrary code — the safeguard only checked the first fetch (Zafran / CVE-2026-44827 et al.)"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "agent-infrastructure"]
incident_date: 2026-07-27
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["116-open-oss-privacy-filter-fake-model", "090-air-fake-agent-skill-toctou", "073-shadowmq-pickle-zmq-pattern", "072-lerobot-pickle-grpc-rce", "095-amazon-q-mcp-auto-execution"]
status: published
version: "1.0"
og_lead_ja: "Hugging Face Diffusers「FaceHugger」でモデル読込時にコード実行（CVE-2026-44827 他）"
og_lead_en: "\"FaceHugger\" flaws in Hugging Face Diffusers let a malicious model repo run code on load"
gap_detected: "A safeguard existed and was on by default: trust_remote_code, built to stop unreviewed custom code from running."
gap_missing: "The guard checked only the first fetch — the config — and never re-verified the artifact that was actually loaded and executed."
gap_fix: "Require the provenance and integrity of the artifact that actually executes as independently verifiable proof, and block loads that do not match it before execution."
---

## 1. TL;DR

On July 27, 2026, security firm **Zafran** disclosed a set of flaws — collectively named **FaceHugger** — in **Hugging Face Diffusers** that let a malicious model repository run arbitrary Python on a user's machine at load time. The cause was a time-of-check-to-time-of-use (TOCTOU) gap: model downloads split into two non-atomic HTTP requests, and the `trust_remote_code` safeguard ran against only the first. The guard was in place and running. **What was missing is the layer that confirms that the artifact the guard checked is the artifact that actually runs.**

## 2. What happened

- The target is Diffusers, Hugging Face's diffusion-model library. Anyone calling `DiffusionPipeline.from_pretrained` with custom pipelines is affected; loading a malicious model repository quietly executes attacker code. The library draws roughly seven million downloads a month — close to 200,000 a day — sitting inside production AI pipelines and CI/CD systems.
- Three CVEs track the issue. **CVE-2026-44827** (CVSS 8.8) — code injection via the default-resolved filename `None.py` loaded as custom pipeline code. **CVE-2026-45804** (CVSS 7.5) — a race condition between the `hf_hub_download` and `snapshot_download` calls, with the configuration rewritten in the interval between them. **CVE-2026-44513** (CVSS 8.8) — three further variants sharing the same root cause: cross-repository pipeline loading, loads from a local snapshot, and malicious custom components.
- All of them bypass `trust_remote_code` — the safeguard built to stop unreviewed custom code from executing, which is off by default (`False`).

The bypass works through the following chain.

1. A model download is split into a config fetch and a body fetch — two HTTP requests rather than one atomic operation.
2. The `trust_remote_code` check applies only to the first request, the config.
3. The attacker makes what the guard inspected diverge from what actually loads. In the race-condition variant (CVE-2026-45804) the config is swapped in the window between the check and the body fetch — Zafran measured that window at roughly 0.3 seconds, and the exploit needs an uncached first download. Even so, Zafran notes that on a heavily used repository an attacker can still win the race often enough, by briefly publishing a malicious config and then reverting it. The other variants need no timing at all: they create the same divergence through the default resolution of `None.py`, or through cross-repository and local-snapshot loads.
4. The substituted code runs with the "safe" status the guard already conferred.

## 3. Timeline — disclosure and response

- 2026-03-19: Zafran reports the first two flaws to Hugging Face.
- 2026-05-01: Diffusers 0.38.0 ships with the fix.
- 2026-05: the CVEs are published following responsible disclosure.
- 2026-07-27: Zafran Labs (Gal Zaban, Ido Shani) publishes the technical detail.
- 2026-08-03: The Hacker News, Cybersecurity News and others report on it, and coverage spreads.

> All three CVSS scores are the assessment of the CNA, GitHub. NVD's own evaluation status differs by CVE: as of writing, CVE-2026-44827 is Analyzed, CVE-2026-44513 is Modified, and CVE-2026-45804 is Awaiting Analysis. This was responsible disclosure; as of publication no widespread in-the-wild exploitation has been reported.

The response and industry movement after disclosure:

- Diffusers 0.38.0 relocated the security checks to the **dynamic-module loading chokepoint**, so that what is checked and what is executed are the same object, closing the known bypass paths. Users are advised to upgrade and to pin repository revisions.
- Zafran also disclosed a parallel flaw in Hugging Face's `transformers`, where a pinned commit hash fails to propagate, letting an attacker swap in malicious code after `trust_remote_code` approval — the same check-then-use gap.
- Comparable load-time code execution had already surfaced in other frameworks in March and April 2026, ahead of this disclosure: an equivalent `trust_remote_code` bypass in vLLM in March, and InstructLab hardcoding `trust_remote_code=True` in April. "Loading a model can execute code" is not specific to diffusion models.

## 4. Why it wasn't stopped

The failure here is neither a missing safeguard nor a malfunctioning one. **There was no layer that independently confirmed that what the guard checked and what actually executes are the same thing.**

`trust_remote_code` exists to stop unreviewed code from running, and it refused custom code by default. Detection worked. What was missing came earlier — any guarantee that the artifact seen at the moment of the check is the artifact executed at the moment of the load.

> TOCTOU makes a check meaningless whenever the target can change between check and use. The guard does not lie. The thing it checked simply no longer exists.

Models ship wrapped in a name, a card, and a download count. None of those prove the provenance of the code about to run. The substitution happens inside the "trusted" distribution path itself. This pushes the lesson of [Brief 116](/critical/briefs/116-open-oss-privacy-filter-fake-model/) — trending and download counts are not a substitute for provenance — all the way to integrity at the moment of execution, and it is continuous with the timing gap in [Brief 090](/critical/briefs/090-air-fake-agent-skill-toctou/), where the contents change after passing a scanner.

## 5. What proof would have changed

Proof-as-auth inserts one layer into the path ahead of each individual load of a model: an independent verification of the provenance of the artifact that is about to execute. Rather than treating a repository's location or reputation as a stand-in for provenance, it establishes — before execution can proceed — whether this code and these weights were issued by the publisher they claim, unaltered. The placement is the point: not in the window between check and execution where the swap happens, but immediately before execution.

Lemma's design against this primitive:

- **Bind provenance to the executing artifact.** Attach provenance and issuer proof to the hash of the code and weights that actually load — not to the model card or the name.
- **Verify immediately before loading.** After the fetch completes and before execution begins, confirm the artifact matches verified provenance, closing the gap between check and use.
- **Verify the issuer independently.** Confirm the publisher's identity independently of where the repository sits.
- **Execute with least privilege.** Confine the model-loading process to a scope that does not presume code execution.

Lemma is not a product that tells good models from bad, nor one that judges whether code is dangerous. Its scope is to verify the provenance of the executing artifact before it runs, and to hold back loads whose artifact does not match its proof. Scanners and guards (`trust_remote_code`, revision pinning, repository monitoring) and pre-execution proof (an audit trail confirming artifact identity immediately before execution) are complementary, not alternatives. The first rejects known danger; the second closes the one thing detection structurally cannot reach — the drift between what was checked and what runs. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for design detail, ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/); for scope, [Pillar 02 — Verifiable AI](/pillars/#inference).

## 6. Sources

- **NVD (primary, vulnerability records)**: CVE-2026-44827 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44827> / CVE-2026-45804 — <https://nvd.nist.gov/vuln/detail/CVE-2026-45804> / CVE-2026-44513 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44513>
- **Hugging Face / GitHub (primary, fix release)**: "Diffusers 0.38.0" (2026-05-01) — <https://github.com/huggingface/diffusers/releases/tag/v0.38.0>
- **The Hacker News (independent reporting)**: Ravie Lakshmanan, "Hugging Face Diffusers Flaws Could Let Model Repositories Execute Arbitrary Code" (2026-08-03) — <https://thehackernews.com/2026/08/hugging-face-diffusers-flaws-could-let.html>
- **Infosecurity Magazine (independent reporting, technical detail)**: Alessandro Mascellino, "Bugs in Hugging Face Diffusers Bypass Custom Code Safeguard" (2026-07-28) — <https://www.infosecurity-magazine.com/news/hugging-face-diffusers-trust/>
- **Cybersecurity News (independent analysis)**: Guru Baran, "Hugging Face Diffusers Vulnerabilities Enable Remote Code Execution Through Malicious AI Models" (2026-08-03) — <https://cybersecuritynews.com/hugging-face-diffusers-vulnerabilities/>
- **RAXE Labs (earlier sibling case, independent analysis)**: "RAXE-2026-044: vLLM Hardcoded trust_remote_code Bypass" (CVE-2026-27893, 2026-03-27) — <https://raxe.ai/labs/advisories/RAXE-2026-044>
- **TheHackerWire (earlier sibling case)**: "InstructLab RCE via Malicious HuggingFace Models" (CVE-2026-6859, 2026-04-22) — <https://www.thehackerwire.com/instructlab-rce-via-malicious-huggingface-models-cve-2026-6859/>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 02 — Verifiable AI](/pillars/#inference) · [Brief 116 (fake OSS privacy filter)](/critical/briefs/116-open-oss-privacy-filter-fake-model/) · [Brief 090 (AIR fake agent skill)](/critical/briefs/090-air-fake-agent-skill-toctou/)
