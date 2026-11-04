---
brief_no: 146
title: "Hugging Face Transformers：同意の確認より前に、リモートの Python コードがディスクへ書き込まれうると判明(CERT/CC 公表、CVE-2026-80047)"
title_en: "Hugging Face Transformers: remote Python code could be written to disk before the consent check (CERT/CC, CVE-2026-80047)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, model-supply-chain]
incident_date: 2026-09-01
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["121-hugging-face-diffusers-toctou"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "Transformers の load_custom_generate() が、同意の確認より前にリモートのコードを取得し、ディスクへ書き込んでいた（CVE-2026-80047）"
og_lead_en: "Transformers' load_custom_generate() fetched remote code and wrote it to disk before the consent check (CVE-2026-80047)"
layout: "report"
sections: "proof"
og_kicker_ja: "AI ライブラリの脆弱性 · 同意の前に書き込み"
og_kicker_en: "AI LIBRARY FLAW · PRE-CONSENT WRITE"
og_headline_ja: "同意を確認するより前に、\nコードがディスクに残る。\n<accent>CERT/CC が公表</accent>"
og_headline_en: "Remote code hit disk\nbefore the consent check.\n<accent>Per CERT/CC</accent>"
key_figures:
  - value: "1"
    unit: "path"
    label: "Loading path that fetched and wrote before the consent check (load_custom_generate()); every other path checked consent first (CERT/CC)"
    tone: "alert"
  - value: "08-04 → 09-08"
    label: "From notifying Hugging Face via CERT/CC to the fix being merged (35 days)"
  - value: "4.49.0 → 5.16.1"
    label: "Versions in which this brief found the ordering unfixed in source; the CVE record lists up to 5.8.1"
glossary:
  - term: "trust_remote_code"
    desc: "The mechanism that asks the user whether custom Python code in a model repository may run."
  - term: "Module cache"
    desc: "The local location where fetched remote code is kept (~/.cache/huggingface/modules), reused by later loads."
insight:
  slug: "consent-after-write"
  label: "A write that finishes before consent is checked"
  quote: "Unless the consent check sits before the action it is meant to stop, the result of that action stays even when the user says no."
industries: ["ai", "developers"]
controls:
  - slug: "check-origin"
    item: "Check the origin of remote code from a model repository before fetching and writing it"
  - slug: "hold-unverified"
    item: "Block fetching and writing before consent is confirmed, on every loading path"
attack_method: "supply-chain"
takeaway: "The trust_remote_code consent mechanism stopped only execution; in load_custom_generate(), the fetch and the disk write had already finished before consent was checked (CERT/CC)."
self_check: "Before remote code is fetched and written to disk, have its origin and the user's consent already been checked?"
countries: ["global"]
---

## 1. Summary

Remote code in a model repository was designed to be fetched and run only after the user consented through `trust_remote_code`. But `load_custom_generate()` alone fetched the code and wrote it to the cache unconditionally before consent was checked, so even when the user declined, the written file stayed on disk (CERT/CC). Consent stopped only execution. <strong>Unless the consent check sits before the action it is meant to stop, the result of that action stays even when the user says no.</strong>

## 2. What got through

- **What got through**: `GenerativePreTrainedModel.load_custom_generate()` fetching a repository's `custom_generate/generate.py` and writing it to the local module cache, unconditionally and before `resolve_trust_remote_code()` evaluated consent (CERT/CC).
- **What was stopped**: Execution of the code, which was correctly gated by the consent check (CERT/CC). The fetch and the write, however, happened regardless of consent and were not rolled back.
- **The other paths**: AutoConfig, AutoModel, AutoTokenizer and AutoImageProcessor all check `trust_remote_code` before fetching or writing. Only `load_custom_generate()` departed from that order (CERT/CC).
- **What reached the receiving side**: In general, the side loading a model receives a model reference and the fetched files. Which path writes before consent is hard for a user to tell. CERT/CC states that a user routinely loading a repository containing malicious code is enough to trigger the write, with no privilege escalation or extra interaction.
- **Risk left behind**: In environments where cache paths are reused, CERT/CC notes that a previously written file could later be read during a trusted model load, potentially leading to unintended execution.
- **Not disclosed**: Whether the vulnerability has been exploited. As of this writing, no such report has been confirmed.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that remote code's origin and the user's consent have been checked before it is written to disk, and that, when it is read back later, the file being read is the same one that was checked.

- **Who approves**: The user or organization that decides which model repositories' code may be fetched and run. A repository's name, or the fact that the fetch succeeded, is not an approval.
- **Where it is checked**: Before remote code is fetched and written to the cache, and again before a file left in the cache is read back and run. It does not rely solely on the consent state at write time. Anything not cleared is held, not written.
- **What is recorded**: Which code from which repository was fetched, written or run (or held), on whose consent, and when. An attempt to write without consent is itself recorded.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking the origin and the user's consent before remote code is fetched, written or run, and keeping a record. Detection means the reporter and CERT/CC finding and disclosing the flaw. Dates are those each party notified or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before fetch and write, and before code is read back from the cache and run, check origin and consent</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>The consent check stopped only execution<br>Fetched code stayed on disk even when the user declined</span></div>
<div class="rx-zone det"><b>Detection · the reporter and CERT/CC found it</b>Reported via CERT/CC; v5.17.0 swapped the order</div>
<div class="rx-g g1"><div class="t">2026-08-04</div><b>Hugging Face notified</b></div>
<div class="rx-g g2"><div class="t">2026-09-01</div><b>CERT/CC publishes</b></div>
<div class="rx-g g3"><div class="t">2026-09-08</div><b>Fix merged</b></div>
<div class="rx-g g4"><div class="t">2026-09-09</div><b>v5.17.0 ships</b></div>
</div>
</figure>

The consent mechanism was running and did stop execution. What was missing is the layer that checks consent and origin before the actions consent was meant to stop, the fetch and the write. As in [Brief 121](/critical/briefs/121-hugging-face-diffusers-toctou/) (Hugging Face Diffusers "FaceHugger"), where what the safeguard checked diverged from what actually ran, the check and the action were not in the same place.

## 4. What Lemma does

**Lemma puts the pre-execution check before remote code is fetched and written, and before it is run.** It does not tell malicious code from safe code or judge whether code is dangerous; before each action, it checks that the origin of the code being fetched, written or run, and the user's consent, have been cleared.

### Industries and operations to watch

- **Industry · AI**: Organizations that fetch models from public repositories such as Hugging Face Hub and load models that carry custom code.
- **Industry · Developers & agent operations**: Developers and organizations that load models on development machines or in CI and reuse cache locations.

### Current controls vs Lemma

The route in this case is the first column (fetching and writing to the cache). The third column is the risk CERT/CC noted, of a leftover file being read later.

| Control | Fetching and writing to the cache | Running the written code on the spot | Reading a leftover cached file later |
| --- | --- | --- | --- |
| `trust_remote_code` consent check (up to v5.16.1) | Not effective | Effective | Not effective |
| Upgrading to v5.17.0 (consent check moved ahead of the fetch) | Effective | Effective | Not effective |
| Not calling `load_custom_generate()` on untrusted repositories (CERT/CC mitigation) | Partial | Partial | Partial |
| **Lemma (pre-execution check)** | Effective | Effective | Effective |

Up to v5.16.1, the consent check stopped execution but did not reach the fetch and write in `load_custom_generate()`. v5.17.0 switched to an existence check that does not download and moved the consent check ahead of the fetch. It does not remove files written before the upgrade, which is why CERT/CC also recommends periodically inspecting or clearing the cache. The fix changed the ordering at this call site; `get_cached_module_file()` still writes unconditionally whenever it is called. Avoiding untrusted repositories depends on the judgment of what counts as trusted. Lemma checks origin and consent before each fetch, write and run, and keeps a record of it.

Note: Lemma's check works only when it is built into the steps that fetch, write and read back models, and the approved repositories and the hashes of code allowed to be fetched are managed outside the loading side. If an approved repository itself carries malicious code, it can pass. Lemma does not delete cached files and does not change Transformers itself. The states in the third column are this brief's assessment of the risk CERT/CC noted. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for organizations that load models

- Have you upgraded Transformers to v5.17.0 or later?
- Do you use `load_custom_generate()` only with model repositories you have decided to trust?
- Do you periodically inspect the module cache (`~/.cache/huggingface/modules`) and delete code you did not consent to?

## 5. Facts and timeline

- **Affected product**: Hugging Face's Transformers library, a primary framework for defining and operating machine learning models across NLP, vision, audio and multimodal. Hugging Face Hub hosts more than a million models.
- **Vulnerability**: CVE-2026-80047 (CERT/CC VU#456290). `load_custom_generate()` fetched `custom_generate/generate.py` via `get_cached_module_file()` and wrote it to the local cache unconditionally, before `resolve_trust_remote_code()` evaluated consent.
- **Root cause (CERT/CC)**: An unconditional file-copy operation in `dynamic_module_utils.py` that runs before consent is evaluated.
- **Affected versions**: CERT/CC lists 4.49.0 through 5.8.1. In the v5.16.1 source (released 2026-08-26), as this brief read it, the ordering in this function is still unfixed; it changes only in v5.17.0.
- **Reporter**: Prasanna Dabi (notified via CERT/CC).

### Timeline

- **2026-08-04**: Reporter Prasanna Dabi notifies Hugging Face via CERT/CC.
- **2026-09-01**: CERT/CC publishes VU#456290; CVE-2026-80047 is assigned.
- **2026-09-08**: Hugging Face merges the fix ([PR #48620](https://github.com/huggingface/transformers/pull/48620), "Avoid unconditionally downloading remote hub file").
- **2026-09-09**: [v5.17.0](https://github.com/huggingface/transformers/releases/tag/v5.17.0) ships with the fix.

> As of CERT/CC's September 1, 2026 publication, the note states: "We have not received a statement from the vendor" and "At the time of writing, no vendor-provided patch or advisory is available." That describes the position on the publication date; the fix was merged on 2026-09-08. No official statement from Hugging Face on this issue had been confirmed as of this writing (2026-09-11). No CVSS score appears in the note, so none is stated here. Figures and the sequence of events are based on CERT/CC's VU#456290 and on the huggingface/transformers repository (PR #48620; the v5.17.0 and v5.16.1 sources). What has not been disclosed does not mean there were no controls.

### After disclosure

- **Hugging Face**: PR #48620 switched to an existence check with `has_file()` that does not download, and moved `resolve_trust_remote_code()` ahead of `get_cached_module_file()`. It touches only `generation/utils.py`; `dynamic_module_utils.py` is left as it was.
- **CERT/CC (mitigation)**: Recommends not invoking `load_custom_generate()` against untrusted model repositories, and periodically inspecting or clearing the module cache (`~/.cache/huggingface/modules`).
- **CERT/CC (intended order)**: States that the `trust_remote_code` check should come before fetching or writing any remote content, the order the library's other loading paths, such as AutoConfig, already follow.

## 6. Sources

- **CERT/CC (primary, official vulnerability note)**: "VU#456290 — Hugging Face Transformers library writes remote code to disk prior to consent check" (published 2026-09-01) — <https://kb.cert.org/vuls/id/456290>
- **Hugging Face / transformers (primary, the fix)**: "[`Generate`] Avoid unconditionally downloading remote hub file" (PR #48620, merged 2026-09-08) — <https://github.com/huggingface/transformers/pull/48620>
- **Hugging Face / transformers (primary, release carrying the fix)**: v5.17.0 (2026-09-09) — <https://github.com/huggingface/transformers/releases/tag/v5.17.0>
- **Cybersecurity News (independent)**: "Hugging Face Flaw Lets Malicious AI Models Plant Python Code on User Systems" — <https://cybersecuritynews.com/hugging-face-flaw/>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
