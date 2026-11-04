---
brief_no: 121
title: "Hugging Face Diffusers「FaceHugger」：モデルを読み込むだけで任意コードが実行された(Zafran の調査、CVE-2026-44827 他)"
title_en: "Hugging Face Diffusers \"FaceHugger\": loading a model was enough to run arbitrary code (Zafran research, CVE-2026-44827 et al.)"
pillar: "02-verifiable-ai"
primary_category: "model-supply-chain"
secondary_categories: ["code-provenance", "agent-infrastructure"]
incident_date: 2026-07-27
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["116-open-oss-privacy-filter-fake-model", "090-air-fake-agent-skill-toctou", "073-shadowmq-pickle-zmq-pattern", "072-lerobot-pickle-grpc-rce", "095-amazon-q-mcp-auto-execution"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Hugging Face Diffusers「FaceHugger」でモデル読込時にコード実行（CVE-2026-44827 他）"
og_lead_en: "\"FaceHugger\" flaws in Hugging Face Diffusers let a malicious model repo run code on load"
search_title: "Diffusers の FaceHugger：読込でコード実行"
search_description: "Hugging Face の Diffusers で、悪性のモデルリポジトリを読み込むだけで任意コードが実行される欠陥群 FaceHugger が公表された（Zafran）。何が起きたか、なぜ安全ガードを通ったか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI ライブラリの脆弱性 · モデル読込で実行"
og_kicker_en: "AI LIBRARY FLAW · CODE RUNS ON LOAD"
og_headline_ja: "モデルを読み込むだけで、\n任意コードが実行された。\n<accent>CVE 3 件</accent>"
og_headline_en: "Just loading a model\nran arbitrary code.\n<accent>Three CVEs</accent>"
key_figures:
  - value: "3"
    unit: "CVEs"
    label: "Flaws tracked as CVEs, scored CVSS 8.8, 7.5 and 8.8 (by GitHub as CNA)"
    tone: "alert"
  - value: "~7M"
    label: "Monthly Diffusers downloads, running inside production AI pipelines and CI/CD"
  - value: "03-19 → 05-01"
    label: "From Zafran's report of the first two flaws to the release of the fixed Diffusers 0.38.0"
glossary:
  - term: "trust_remote_code"
    desc: "The safeguard built to stop unreviewed custom code from running. It is off by default (False), refusing custom code."
  - term: "TOCTOU"
    desc: "Time-of-check to time-of-use: if the target can change after it is checked, the check stops meaning anything."
insight:
  slug: "checked-is-not-what-runs"
  label: "What was checked is not what runs"
  quote: "Unless the file about to run is checked, immediately before it runs, against the file that was checked, different code runs with the safeguard's approval."
industries: ["ai", "developers"]
controls:
  - slug: "hold-unverified"
    item: "Do not execute until the files the guard checked are confirmed to be the files being run"
attack_method: "supply-chain"
takeaway: "The trust_remote_code safeguard applied only to the config fetch, so code that diverged from it at load time still ran as if it had passed the guard."
self_check: "When you load a model, do you check that the files the guard checked are the files that actually run?"
countries: ["global"]
---

## 1. Summary

Merely loading a malicious model repository ran arbitrary Python on the user's machine. The `trust_remote_code` safeguard, built to stop unreviewed code, refused custom code by default. But a model download is split into two non-atomic HTTP requests, a config fetch and a body fetch, and the guard ran against only the first (Zafran). <strong>Unless the file about to run is checked, immediately before it runs, against the file that was checked, different code runs with the safeguard's approval.</strong>

## 2. What got through

- **What got through**: Loading a custom pipeline through `DiffusionPipeline.from_pretrained`. Once what the guard inspected was made to diverge from what actually loads, the substituted code ran with the "safe" status the guard had already conferred (Zafran).
- **What was stopped**: Nothing. The `trust_remote_code` check ran, but it covered only the first request, the config (Zafran).
- **How the divergence is made**: In the race-condition variant (CVE-2026-45804), the config is swapped in the window after the check and before the body fetch. The other variants need no timing: they create the same divergence through the default resolution of `None.py`, cross-repository pipeline loading, loads from a local snapshot, or malicious custom components (Zafran).
- **What reached the receiving side**: In general, the side loading a model receives a name, a model card, a download count, and the fetched files. None of those show the provenance of the code about to run. The substitution happens inside the trusted distribution path itself.
- **Not disclosed**: Whether, and in how many environments, a malicious repository was actually loaded. As of this Brief's publication, no widespread in-the-wild exploitation has been reported.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, after the fetch completes and immediately before execution, the side loading the model checks that the code and weights actually loading are the ones that were checked, issued unaltered by the publisher they claim.

- **Who approves**: The model's publisher, and the user or organization that decides whose models may be loaded. A repository's location, reputation, or download count is not an approval.
- **Where it is checked**: After the fetch completes, immediately before the code runs. What is checked is the hash of the code and weights that actually load, not the model card or the name. Anything that does not match is held, not loaded.
- **What is recorded**: Which code and weights were loaded (or held), on which publisher's confirmation, and when. Later, it shows which environment ran what.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a model's code runs, that the code and weights loading are the ones that were checked and that the publisher is who it claims, and keeping a record. Detection means researchers finding and reporting the flaw. Dates are those each party reported or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>After the fetch and immediately before execution, check that the code and weights loading match what was checked</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Substituted code ran with the guard's approval<br>All three CVEs bypass trust_remote_code</span></div>
<div class="rx-zone det"><b>Detection · researchers found it</b>Zafran reported it; 0.38.0 closed the known bypass paths</div>
<div class="rx-g g1"><div class="t">2026-03-19</div><b>Zafran reports the first two</b></div>
<div class="rx-g g2"><div class="t">2026-05-01</div><b>Diffusers 0.38.0 fixes them</b></div>
<div class="rx-g g3"><div class="t">2026-07-27</div><b>Zafran publishes the detail</b></div>
<div class="rx-g g4"><div class="t">2026-08-03</div><b>Coverage spreads</b></div>
</div>
</figure>

The guard was running and refused custom code by default. What was missing is the layer that checks that the artifact seen at the moment of the check is the artifact run at the moment of execution. It has the same shape as [Brief 116](/critical/briefs/116-open-oss-privacy-filter-fake-model/) (a fake OSS privacy filter), where trending and download counts stood in for provenance, and [Brief 090](/critical/briefs/090-air-fake-agent-skill-toctou/) (a fake AIR agent skill), where contents changed after passing a scanner. Here the target changed between check and execution.

## 4. What Lemma does

**Lemma puts the check in section 03 immediately before a model's code runs.** It does not tell good models from bad or judge whether code is dangerous; before execution, it checks that the code and weights actually loading match what a verified publisher issued.

### Industries and operations to watch

- **Industry · AI**: Organizations that fetch models from public repositories such as Hugging Face and load them in production AI pipelines.
- **Industry · Developers & agent operations**: Developers and organizations that load models, including custom pipelines, inside CI/CD.

### Current controls vs Lemma

The route in this case is a divergence between what the guard checked and what loads afterwards, through variants that use timing and variants that do not.

| Control | Config swapped in a timing window (CVE-2026-45804) | Divergence without timing (`None.py`, cross-repository, local snapshot) |
| --- | --- | --- |
| `trust_remote_code` (off by default) | Not effective | Not effective |
| Upgrading to 0.38.0 (checks moved to the dynamic-module loading chokepoint) | Effective | Effective |
| Pinning repository revisions | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective |

`trust_remote_code` was bypassed in all three CVEs. Diffusers 0.38.0 moved the security checks to the dynamic-module loading chokepoint, so that what is checked and what runs sit at the same point, closing the known bypass paths; it does not reach environments that have not upgraded. Pinning revisions is recommended, but in the parallel `transformers` flaw Zafran disclosed, a pinned commit hash failed to propagate, letting malicious code be swapped in after `trust_remote_code` approval. Lemma checks the code and weights that actually load, not the name or location, before they run. A record of each load is also kept, so which environment ran what can be confirmed later.

Note: Lemma's check works only when it is built into the step that loads the model, and the approved publishers and the hashes of code and weights allowed to run are managed outside the loading side. If an approved publisher itself issues malicious code, it can pass. Lemma does not change Diffusers itself. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that load models

- Do you decide whose models may be loaded, and confirm that a model was issued by that publisher separately from its name and download count?
- Have you upgraded Diffusers to 0.38.0 or later and pinned the revisions of the repositories you load?
- Do you confine the model-loading process to a scope of permissions that does not presume code execution?

## 5. Facts and timeline

- **Affected product**: Hugging Face's Diffusers, a library for diffusion models. Anyone calling `DiffusionPipeline.from_pretrained` with custom pipelines is affected; loading a malicious model repository quietly executes attacker code. Roughly seven million downloads a month, close to 200,000 a day.
- **Discovered by**: Security firm Zafran (Gal Zaban and Ido Shani of Zafran Labs), under the collective name FaceHugger.
- **Vulnerabilities**: **CVE-2026-44827** (CVSS 8.8): code injection via the default-resolved filename `None.py` loaded as custom pipeline code. **CVE-2026-45804** (CVSS 7.5): a race condition between the `hf_hub_download` and `snapshot_download` calls, with the configuration rewritten in between. **CVE-2026-44513** (CVSS 8.8): three further variants sharing the same root cause: cross-repository pipeline loading, loads from a local snapshot, and malicious custom components.
- **The bypass chain (Zafran)**: (1) A model download is split into a config fetch and a body fetch, two HTTP requests. (2) The `trust_remote_code` check applies only to the first, the config. (3) What the guard inspected is made to diverge from what actually loads. (4) The substituted code runs with the "safe" status the guard already conferred.
- **Race-condition window (Zafran)**: Zafran measured the swap window at roughly 0.3 seconds, and the exploit needs an uncached first download. Even so, Zafran notes that on a heavily used repository an attacker can still win often enough by briefly publishing a malicious config and then reverting it.

### Timeline

- **2026-03-19**: Zafran reports the first two flaws to Hugging Face.
- **2026-05-01**: Diffusers 0.38.0 ships with the fix.
- **2026-05**: The CVEs are published following responsible disclosure.
- **2026-07-27**: Zafran Labs (Gal Zaban, Ido Shani) publishes the technical detail.
- **2026-08-03**: The Hacker News, Cybersecurity News and others report on it, and coverage spreads.

> All three CVSS scores are the assessment of the CNA, GitHub. NVD's own evaluation status differs by CVE: as of writing, CVE-2026-44827 is Analyzed, CVE-2026-44513 is Modified, and CVE-2026-45804 is Awaiting Analysis. This was responsible disclosure; as of publication no widespread in-the-wild exploitation has been reported. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Diffusers**: 0.38.0 relocated the security checks to the dynamic-module loading chokepoint, so that what is checked and what is executed are the same object, closing the known bypass paths. Users are advised to upgrade and to pin repository revisions.
- **transformers**: Zafran also disclosed a parallel flaw in Hugging Face's `transformers`, where a pinned commit hash fails to propagate, letting an attacker swap in malicious code after `trust_remote_code` approval.
- **Earlier comparable cases**: An equivalent `trust_remote_code` bypass in vLLM in March 2026, and InstructLab hardcoding `trust_remote_code=True` in April. Loading a model can amount to executing code beyond diffusion models.

## 6. Sources

- **NVD (primary, vulnerability records)**: CVE-2026-44827 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44827> / CVE-2026-45804 — <https://nvd.nist.gov/vuln/detail/CVE-2026-45804> / CVE-2026-44513 — <https://nvd.nist.gov/vuln/detail/CVE-2026-44513>
- **Hugging Face / GitHub (primary, fix release)**: "Diffusers 0.38.0" (2026-05-01) — <https://github.com/huggingface/diffusers/releases/tag/v0.38.0>
- **The Hacker News (independent reporting)**: Ravie Lakshmanan, "Hugging Face Diffusers Flaws Could Let Model Repositories Execute Arbitrary Code" (2026-08-03) — <https://thehackernews.com/2026/08/hugging-face-diffusers-flaws-could-let.html>
- **Infosecurity Magazine (independent reporting, technical detail)**: Alessandro Mascellino, "Bugs in Hugging Face Diffusers Bypass Custom Code Safeguard" (2026-07-28) — <https://www.infosecurity-magazine.com/news/hugging-face-diffusers-trust/>
- **Cybersecurity News (independent analysis)**: Guru Baran, "Hugging Face Diffusers Vulnerabilities Enable Remote Code Execution Through Malicious AI Models" (2026-08-03) — <https://cybersecuritynews.com/hugging-face-diffusers-vulnerabilities/>
- **RAXE Labs (earlier sibling case, independent analysis)**: "RAXE-2026-044: vLLM Hardcoded trust_remote_code Bypass" (CVE-2026-27893, 2026-03-27) — <https://raxe.ai/labs/advisories/RAXE-2026-044>
- **TheHackerWire (earlier sibling case)**: "InstructLab RCE via Malicious HuggingFace Models" (CVE-2026-6859, 2026-04-22) — <https://www.thehackerwire.com/instructlab-rce-via-malicious-huggingface-models-cve-2026-6859/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
