---
brief_no: 146
title: "Hugging Face Transformersのライブラリが、ユーザーが同意する前にリモートのPythonコードをディスクへ書き込みうることが判明(CVE-2026-80047、CERT/CC公表) — 「同意を確認してから取得する」設計のはずが、取得と書き込みは同意より先に完了していた"
title_en: "Hugging Face's Transformers library was found to write remote Python code to disk before a user's consent prompt is ever evaluated (CVE-2026-80047, CERT/CC) — the fetch and the write finished before the consent check the design was supposed to gate on"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, model-supply-chain]
incident_date: 2026-09-01
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["110-openai-eval-agent-containment-escape-hugging-face"]
status: published
version: "1.0"
og_lead_ja: "Transformers、同意確認前にリモートコードをディスク書込と判明(CVE-2026-80047)"
og_lead_en: "Transformers writes remote code to disk before consent check (CVE-2026-80047)"
---

## 1. TL;DR

On September 1, 2026, CERT/CC at Carnegie Mellon University disclosed a vulnerability (CVE-2026-80047, VU#456290) in Hugging Face's Transformers library (v4.49.0 through v5.8.1): remote Python code from a model repository gets written to local disk before the user's consent prompt is ever evaluated. `GenerativePreTrainedModel.load_custom_generate()` unconditionally fetches a remote Python module and writes it to the local cache before `resolve_trust_remote_code()` evaluates the user's `trust_remote_code` consent prompt — so even when a user declines that prompt, the written code remains on disk. Every other remote-code-loading path in the library (AutoConfig, AutoModel, and others) checks consent first; only this one function did not follow that order. **The fetch and the write were supposed to happen only after consent was confirmed. In practice they completed before consent was ever evaluated, leaving the consent mechanism able to gate execution alone.** The reporter notified the vendor on August 4, 2026; no fix existed at CERT/CC's September 1 publication, but seven days later, on September 8, a change reversing the fetch-before-consent order was merged and shipped the next day in v5.17.0.

## 2. What happened

- Hugging Face's Transformers library is a primary framework for defining and operating modern machine learning models — NLP, vision, audio, and multimodal — for both training and inference, and Hugging Face Hub hosts more than a million models.
- The library has a consent mechanism, `trust_remote_code`, designed so that a repository's custom remote Python code is fetched and executed only after the user confirms they trust it.
- But `GenerativePreTrainedModel.load_custom_generate()` alone fetched a repository's `custom_generate/generate.py` via `get_cached_module_file()` and wrote it to the local cache (`~/.cache/huggingface/modules`) unconditionally, before `resolve_trust_remote_code()` ever evaluated consent.
- Per CERT/CC, execution of the code was correctly gated by the consent check, but the fetch and write happened regardless of consent, and could not be rolled back. Even when a user declines the trust prompt, the written file remains on disk.
- CERT/CC traces the root cause to an unconditional file-copy operation in `dynamic_module_utils.py` that runs before consent is evaluated.
- Every other remote-code-loading path in the library — AutoConfig, AutoModel, AutoTokenizer, AutoImageProcessor — checks `trust_remote_code` before fetching or writing any remote content; `load_custom_generate()` alone deviated from that order.
- An attacker need only publish a model repository containing a malicious `custom_generate/generate.py`; any downstream user loading that model reference — a routine load operation — triggers the write, with no privilege escalation or extra interaction required.
- CERT/CC notes that in environments where cache paths are reused, a previously written attacker file could later be served during a trusted model load, potentially enabling unintended execution.

The episode was structured as follows.

1. **A designed consent gate**: `trust_remote_code` was built to let a user confirm whether remote code execution is allowed.
2. **A deviation in ordering**: `load_custom_generate()` alone fetched and wrote to cache unconditionally, before that consent check.
3. **Persisting past refusal**: even when a user declines the prompt, the written file is not rolled back and remains on disk.
4. **A risk of later reuse**: in environments with reused cache paths, the leftover file can surface and execute during a later, trusted model load.
5. **From notification to fix**: Hugging Face was notified on 2026-08-04, CERT/CC published on 2026-09-01, and the fix was merged on 2026-09-08 (shipped in v5.17.0 on 09-09) — 35 days from report to fix, seven from disclosure.

## 3. Timeline — disclosure and response

- 2026-08-04: Reporter Prasanna Dabi notifies Hugging Face via CERT/CC.
- 2026-09-01: CERT/CC publishes VU#456290 for the vulnerability, assigned CVE-2026-80047.
- 2026-09-08: Hugging Face merges the fix ([PR #48620](https://github.com/huggingface/transformers/pull/48620), "Avoid unconditionally downloading remote hub file"): existence is now checked with `has_file()` without downloading, and `resolve_trust_remote_code()` moved ahead of `get_cached_module_file()`.
- 2026-09-09: [v5.17.0](https://github.com/huggingface/transformers/releases/tag/v5.17.0) ships with the fix.

> As of CERT/CC's September 1, 2026 publication, the note states plainly: "We have not received a statement from the vendor" and "At the time of writing, no vendor-provided patch or advisory is available." That statement describes the position on the publication date; the fix was merged seven days later, on 2026-09-08. Note also that CERT/CC gives the affected range as 4.49.0 through 5.8.1, yet in the v5.16.1 source (released 2026-08-26) the ordering in this function is still unfixed — it changes only in v5.17.0.

Response and related developments:

- As mitigation, CERT/CC recommends users avoid invoking `load_custom_generate()` against untrusted model repositories, and periodically inspect or clear the Hugging Face module cache (`~/.cache/huggingface/modules`).
- CERT/CC states plainly that implementations should perform the `trust_remote_code` check before fetching or writing any remote content — the ordering already followed by the library's other loading paths, such as AutoConfig.

## 4. Why it wasn't stopped

This incident's failure is not that the `trust_remote_code` consent mechanism didn't exist. **It is that the mechanism existed but only ever gated code execution — the fetch and the disk write completed beforehand, regardless of whether consent was given.**

CERT/CC's analysis shows that most of the library's remote-code-loading paths — AutoConfig, AutoModel, AutoTokenizer, AutoImageProcessor — implemented the correct order: check consent, then fetch and write. Only `load_custom_generate()` deviated from it. This was not a flaw in the library's overall design philosophy; it was <strong>a single implementation site where the contract of "check consent, then fetch" was not honored</strong> — a partial but consequential deviation.

Even when a user answers "no" to the consent prompt, the file is already on disk. Once the act of checking consent arrives after the action it was supposed to gate — fetching and writing the file — the consent mechanism's ability to stop something before it happens is lost. And in environments with reused cache paths, CERT/CC notes, the file written at that moment can later surface and execute during the load of a different, genuinely trusted model. The moment consent was checked and the place where that check actually took effect did not line up.

This shares a shape with other disclosed vulnerabilities: a gate meant to check something completes after, or independently of, the action it was meant to gate. It sits adjacent to the incident in which OpenAI's evaluation agents breached Hugging Face's production infrastructure ([Brief 110](/critical/briefs/110-openai-eval-agent-containment-escape-hugging-face/)) — both involve the same platform — but the root cause differs: that incident involved agents finding a write path beyond their granted permissions, while this one involves the library's own consent-check wiring being out of order.

## 5. What proof would have changed

Proof before the fact replaces a design where the act of "checking consent" can be implementation-wired out of step with the action that consent was meant to gate — the fetch and the write. It does not stop models from carrying remote code in the first place. It makes it verifiable, from outside the implementation, that the consent check actually runs before, and on the same path as, the action.

The design Lemma offers against this gap:

<ul class="bd-check">
<li><strong>Proof of provenance before fetch and write</strong>: independently verify the origin and trustworthiness of remote code from a model repository before it is fetched and written to cache. A write that occurs before that verification completes is itself recorded as an action.</li>
<li><strong>Verification of consistent gate wiring</strong>: make it independently verifiable, per implementation, that the contract of "check consent, then fetch" is honored across every loading path in a library, not just most of them.</li>
<li><strong>Re-verification of cached code at the point of execution</strong>: when a previously written file is read back in a different context later, re-check its provenance at that moment rather than relying solely on the consent state recorded at write time.</li>
</ul>

What it does not do:

<ul class="bd-limit">
<li>It does not substitute for patching the Transformers library implementation itself.</li>
<li>It does not judge whether the `trust_remote_code` consent design is the right approach.</li>
<li>It does not substitute for identifying whether this vulnerability has been exploited in the wild (no such report exists as of this writing).</li>
</ul>

The difference from after-the-fact vulnerability scanning is here: CERT/CC's disclosure points out this wiring error after the fact, and the fix took seven days from that disclosure and 35 from the report to arrive. Through that window — and still today, in environments that stay on 4.49.0 through 5.16.1 — this design keeps running.

Detection and this layer are complementary, not substitutes. The former points out, after the fact, that the wiring was wrong; the latter makes it verifiable, before the action happens, that the act of checking consent and the action consent was meant to gate are not wired out of step inside the implementation.

## 6. Sources

- **CERT/CC (primary, official vulnerability note)**: "VU#456290 — Hugging Face Transformers library writes remote code to disk prior to consent check" (published 2026-09-01) — <https://kb.cert.org/vuls/id/456290>
- **Hugging Face / transformers (primary, the fix)**: "[`Generate`] Avoid unconditionally downloading remote hub file" (PR #48620, merged 2026-09-08) — <https://github.com/huggingface/transformers/pull/48620>
- **Hugging Face / transformers (primary, release carrying the fix)**: v5.17.0 (2026-09-09) — <https://github.com/huggingface/transformers/releases/tag/v5.17.0>
- **Cybersecurity News (independent)**: "Hugging Face Flaw Lets Malicious AI Models Plant Python Code on User Systems" — <https://cybersecuritynews.com/hugging-face-flaw/>

References: On why after-the-fact detection is not proof, see ["The last layer left in AI-era cyber defense"](/blog/detection-is-not-proof/). On data provenance, see [Pillar 01 — Provenance](/pillars/#provenance).

Figures and the sequence of events are based on CERT/CC's official vulnerability note VU#456290 (published 2026-09-01) and on the huggingface/transformers repository itself (PR #48620; the v5.17.0 and v5.16.1 sources). No CVSS score appears in that note, so none is stated in this brief. No official statement from Hugging Face on this issue has been confirmed as of this writing (2026-09-11), but the fix itself ships in v5.17.0.
