---
brief_no: 121
title: "Hugging Face Diffusers：モデルを読み込むだけで任意コードが実行された — 安全ガードは最初の1回しか確かめていなかった（Zafran / CVE-2026-44827 他）"
title_en: "Hugging Face Diffusers: loading a model ran arbitrary code — the safeguard only checked the first fetch (Zafran / CVE-2026-44827 et al.)"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "agent-infrastructure"]
incident_date: 2026-08-03
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["116-open-oss-privacy-filter-fake-model", "090-air-fake-agent-skill-toctou", "073-shadowmq-pickle-zmq-pattern", "072-lerobot-pickle-grpc-rce", "095-amazon-q-mcp-auto-execution"]
status: published
version: "1.0"
og_lead_ja: "Hugging Face Diffusers のTOCTOU欠陥でモデル読込時にコード実行（CVE-2026-44827 他）"
og_lead_en: "Hugging Face Diffusers TOCTOU flaws let a malicious model repo run code on load"
gap_detected: "A safeguard existed and was on by default: trust_remote_code, built to stop unreviewed custom code from running."
gap_missing: "The guard checked only the first fetch — the config — and never re-verified the artifact that actually got loaded and executed."
gap_fix: "Require the provenance and integrity of the artifact that actually executes as independently verifiable proof, and block loads that do not match it before execution."
---

## 1. TL;DR

On August 3, 2026, security firm **Zafran** disclosed flaws in **Hugging Face Diffusers** that let a malicious model repository run arbitrary Python on a user's machine at load time. The cause was a time-of-check-to-time-of-use gap: model downloads split into two non-atomic HTTP requests, and the `trust_remote_code` safeguard ran against only the first. The guard worked. **What was missing is the layer that confirms the artifact the guard checked is the artifact that actually runs.**

## 2. What happened

- The target is Diffusers, Hugging Face's diffusion-model library. Anyone calling `DiffusionPipeline.from_pretrained` with custom pipelines is affected; loading a malicious model repository quietly executes attacker code.
- Three CVEs track the issue. **CVE-2026-44827** (CVSS 8.8) — code injection via the default-resolved filename `None.py` loaded as custom pipeline code. **CVE-2026-45804** (CVSS 7.5) — a race condition between the `hf_hub_download` and `snapshot_download` calls, where the configuration is rewritten in between. **CVE-2026-44513** (CVSS 8.8) — three further variants sharing the same root cause, covering cross-repository pipeline loading, loads from a local snapshot, and malicious custom components.
- All of them bypass `trust_remote_code` — the safeguard built to stop unreviewed custom code from executing, which defaults to the refusing side (`False`).

The bypass works through this chain.

1. A model download is split into a config fetch and a body fetch — two HTTP requests rather than one atomic operation.
2. The `trust_remote_code` check applies only to the first request, the config.
3. The attacker swaps the target in the window after the check and before the body is fetched. Zafran measured that window at roughly 0.3 seconds; the exploit needs an uncached first download. Even so, the firm notes a popular repository can succeed statistically by briefly pushing a malicious config and reverting it.
4. The substituted code runs with the "safe" status the guard already conferred.

## 3. Timeline — disclosure and response

- March 19, 2026 — Zafran reports the first two flaws to Hugging Face.
- May 1, 2026 — Diffusers 0.38.0 ships with the fix.
- May 2026 — the CVEs are published following responsible disclosure.
- August 3, 2026 — Zafran publishes the technical detail and coverage spreads.

> CVE identifiers and CVSS values follow the published advisories and reporting. This was responsible disclosure; as of publication no widespread in-the-wild exploitation has been reported. The CVSS values are the advisories' own scoring — whether NVD has independently assessed them is a separate check.

Response and industry movement since disclosure:

- Diffusers 0.38.0 relocated the security checks to the **dynamic-module loading chokepoint**, putting the thing checked and the thing executed at the same point and closing the known bypass paths. Users are advised to upgrade and to pin repository revisions.
- Zafran also disclosed a parallel flaw in Hugging Face's `transformers`, where a pinned commit hash fails to propagate, letting an attacker swap in malicious code after `trust_remote_code` approval — the same check-then-use gap.
- Comparable load-time code execution surfaced in other frameworks around the same period (InstructLab hardcoding `trust_remote_code=True`, an equivalent bypass in vLLM). "Loading a model can execute code" is not specific to diffusion models.

## 4. Why it wasn't stopped

The failure here is not the absence of a safeguard. It is the absence of a layer confirming that what the guard checked and what actually executes are the same thing.

`trust_remote_code` exists to stop unreviewed code from running, and it defaults to refusing. Detection worked. What did not is the step before it — any guarantee that the artifact seen at the moment of the check is the artifact executed a few hundred milliseconds later.

> TOCTOU makes a check meaningless whenever the target can change between check and use. The guard does not lie. The thing it checked has simply stopped existing.

Models ship wrapped in a name, a card, and a download count. None of those prove the provenance of the code about to run. The substitution happens inside the "trusted" distribution path itself. This pushes the lesson of [Brief 116](/critical/briefs/116-open-oss-privacy-filter-fake-model/) — trending and download counts are not a substitute for provenance — all the way to integrity at the moment of execution, and it is continuous with the timing gap in [Brief 090](/critical/briefs/090-air-fake-agent-skill-toctou/), where contents change after passing a scanner.

## 5. What proof would have changed

Where does pre-execution proof insert itself into the model-loading path? Not into the window between check and execution where the swap happens, but immediately before execution, verifying the artifact that is about to run.

- **Bind provenance to the executing artifact.** Attach provenance and issuer proof to the hash of the code and weights that actually load — not to the model card or the name.
- **Verify immediately before loading.** After the fetch completes and before execution begins, confirm the artifact matches verified provenance, closing the gap between check and use.
- **Verify the issuer independently.** Confirm the publisher's identity independently of where the repository sits.
- **Execute with least privilege.** Confine the model-loading process to a scope that does not presume code execution.

Lemma is not a product that tells good models from bad, nor one that judges whether code is dangerous. Its scope is to verify the provenance of the executing artifact before it runs, and to make loads that do not match their proof separable. Scanners and guards (`trust_remote_code`, revision pinning, repository monitoring) and pre-execution proof (an audit trail confirming artifact identity immediately before execution) are complementary, not alternatives. The first rejects known danger; the second closes the one thing detection structurally cannot reach — the drift between what was checked and what runs. For the complementarity framing see ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05); for scope, [Pillar 02 — Verifiable AI](/pillars/#inference).

## 6. Sources

- **The Hacker News (independent reporting)**: "Hugging Face Diffusers Flaws Could Let Model Repositories Execute Arbitrary Code" (2026-08-03) — <https://thehackernews.com/2026/08/hugging-face-diffusers-flaws-could-let.html>
- **Infosecurity Magazine (independent reporting, technical detail)**: "Bugs in Hugging Face Diffusers Bypass Custom Code Safeguard" — <https://www.infosecurity-magazine.com/news/hugging-face-diffusers-trust/>
- **Cybersecurity News (independent analysis)**: "Hugging Face Diffusers Vulnerabilities Enable Remote Code Execution Through Malicious AI Models" (2026-08-03) — <https://cybersecuritynews.com/hugging-face-diffusers-vulnerabilities/>
- **TheHackerWire (sibling case)**: "InstructLab RCE via Malicious HuggingFace Models (CVE-2026-6859)" — <https://www.thehackerwire.com/instructlab-rce-via-malicious-huggingface-models-cve-2026-6859/>
- **RAXE Labs (sibling case, independent analysis)**: "RAXE-2026-044: vLLM Hardcoded trust_remote_code Bypass Enables Remote Code Execution via Malicious Model Repositories (CVE-2026-27893)" — <https://raxe.ai/labs/advisories/RAXE-2026-044>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · [Pillar 02 — Verifiable AI](/pillars/#inference) · [Brief 116 (fake OSS privacy filter)](/critical/briefs/116-open-oss-privacy-filter-fake-model/) · [Brief 090 (AIR fake agent skill)](/critical/briefs/090-air-fake-agent-skill-toctou/)
