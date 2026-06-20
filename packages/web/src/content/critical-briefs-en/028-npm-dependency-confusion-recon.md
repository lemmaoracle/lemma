---
brief_no: 28
title: "npm 依存関係混乱による開発環境偵察キャンペーン — 内部スコープを偽装した 33 パッケージが、ビルド環境の来歴前提を突いた"
title_en: "The npm Dependency-Confusion Recon Campaign — 33 Packages Impersonating Internal Scopes Exploit the Build Environment's Provenance Assumptions"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-28
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["004-megalodon-github-supply-chain", "014-tanstack-oidc-trusted-publisher", "015-github-vscode-extension-breach"]
version: "1.0"
status: published
og_lead_ja: "内部スコープを偽装した 33 パッケージが、ビルド環境の来歴前提を突いた — npm 依存関係混乱キャンペーン"
og_lead_en: "33 packages impersonating internal scopes exploited the build environment's provenance assumptions — npm dependency-confusion recon campaign"
gap_detected: "Investigations by security vendors made containment work — quarantine, blocking communication, and removal from the registry."
gap_missing: "There was no layer to confirm before ingestion whether each package was actually issued by the internal publisher it claimed, so the internal-looking quality of the name and metadata was used in place of provenance."
gap_fix: "Before the build ingests a dependency, independently verify with Lemma that the artifact carries provenance showing it was issued by a legitimate publisher, and prevent it up front."
---

## TL;DR

On May 28–29, 2026, a single operator using three npm maintainer accounts published 33+ malicious packages across nine organization scopes impersonating real companies' internal namespaces. Using dependency confusion, packages spoofed internal names like `@cloudplatform-single-spa` and `@sber-ecom-core/sberpay-widget` (impersonating Sberbank) with forged internal GitHub Enterprise and Jira URLs in `package.json`. A `postinstall` hook launches an obfuscated stager — silent on CI, otherwise fetching a payload from C2 to collect environment variables, credentials, and development context. Currently locked to `RECON_ONLY=1` reconnaissance, a server-side flag switch enables full exploitation. Following Microsoft Threat Intelligence feedback, the package set was removed. This campaign belongs to Pillar 01 (Verifiable Origin) `code-provenance` and illustrates that **package names and metadata "looking internal" are used in place of provenance during registry resolution.** It joins the supply-chain cluster of Briefs 004 / 014 / 015.

Name matches the internal scope ≠ issued by the internal publisher

---

## 1. Incident Overview

- **Target**: the npm public registry (victims were development and build environments susceptible to dependency confusion)
- **Scale**: 3 accounts (mr.4nd3r50n / ce-rwb / t-in-one), 33+ scoped packages, 9 organization scopes
- **Date**: 2026-05-28 (26 + 7 packages) and 2026-05-29 (12 packages). Some scopes were pre-staged on 2026-05-04
- **Technique**: dependency confusion (impersonating internal package names) + forged enterprise infrastructure URLs in metadata + abnormally high version numbers (`100.100.100` etc.) to win registry resolution
- **Payload**: an obfuscated stager (obfuscator.io family) launched via `postinstall` hook. Goes silent on CI detection, checks for Node.js 16+, avoids re-execution via cache, fetches an OS-specific payload from C2 (`oob.moika[.]tech`), and executes it as a detached process
- **Staging design**: locked to `RECON_ONLY=1` reconnaissance mode (collects environment info, hostname, environment variables, development context). A server-side flag switch transitions to full credential theft and backdoor installation
- **Attribution**: a common X-Secret header value across all accounts, identical C2, identical template generator, and matching publishing toolchain strongly point to a single operator. One account showed prior activity as a bug-bounty researcher in 2024
- **Response**: Microsoft Threat Intelligence investigated and fed back to npm; the affected repos and users were removed

---

## 2. Chain of Events

(Organized as a chain of events since victim organizations are not publicly identified and the campaign is at the reconnaissance stage. Times are UTC, based on Microsoft Threat Intelligence's disclosure.)

- 2026-05-04: `@capibar.chat/ui-kit` and `@sber-ecom-core/sberpay-widget` pre-staged at version 99.0.7
- 2026-05-28 18:47–18:51: mr.4nd3r50n published 26 packages under the `@cloudplatform-single-spa` scope (all at v100.100.100)
- 2026-05-28 19:02–19:03: ce-rwb published 7 packages (v3.5.22, different scopes). The 12-minute gap from the previous batch is consistent with an account switch
- 2026-05-29 09:01:56–09:02:39: t-in-one published 10 auth/token-named packages under `@t-in-one` in a 43-second automated burst. Immediately republished under `@capibar.chat` and `@sber-ecom-core`
- After publication: each payload connected to the same C2 (`oob.moika[.]tech`) with the same X-Secret header
- After 2026-05-29: Microsoft Threat Intelligence identified and disclosed the campaign as an active supply-chain attack (blog dated 5/29, updated 5/30). Feedback to npm led to removal of the package set

---

## 3. Attack Vector

1. **Namespace squatting**: registered packages under scopes impersonating real companies' internal names (`@cloudplatform-single-spa`, `@payments-widget`, `@sber-ecom-core`, etc.)
2. **Metadata forgery**: set `package.json` homepage / repository / bugs / author fields to plausible-looking internal GitHub Enterprise, Jira, and docs portal URLs to create superficial legitimacy during code review
3. **Version inflation**: abnormally high version numbers (`100.100.100` etc.) to beat genuine internal packages in misconfigured npm resolution order
4. **Install-time code execution**: the `postinstall` hook runs the moment `npm install` completes, without waiting for a `require()` call from victim code
5. **Obfuscated stager behavior**: detects CI environment variables and goes silent (evading heavily monitored CI); checks Node version; avoids re-execution via `~/.cache/<scope>_init/`; identifies the project root; determines the OS; fetches payload from C2
6. **Detached execution and reconnaissance**: writes payload to `tmpdir` and launches it as an independent process that survives the `npm install` lifetime. Collects environment variables, credentials, and development context. The `RECON_ONLY` flag is server-side switchable to full exploitation

---

## 4. Structural Argument

This campaign belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that **package resolution uses "name match" and "metadata that looks internal" as a substitute for the provenance of whether the package actually originated from the claimed internal publisher.** `identity-auth` is noted as secondary.

Brief 004 (Megalodon), Brief 014 (TanStack OIDC), and Brief 015 (VS Code extension) share the supply-chain cluster but differ in primitive. Brief 004 was mass contamination via stolen CI/CD credentials; Brief 014 was a takeover of a legitimate trusted publisher to publish maliciously **under a valid signature**; Brief 015 was placement of poisoned extensions that passed review. This campaign involves neither signature compromise nor legitimate-publisher takeover — it publishes **brand-new packages whose publisher is the attacker** and resolves them purely through internal-name impersonation. Where 014/015 "seize legitimate provenance," this campaign "exploits the gap where provenance is never checked in the first place (dependency confusion)." Both share the root: "the publisher provenance of the artifacts a build consumes is not independently verified."

The `@sber-ecom-core/sberpay-widget` impersonation of Sberbank's payment widget demonstrates explicit targeting of the financial sector, and combined with the two-stage design — reconnaissance data feeding subsequent targeted exploitation — the campaign's reach is longer than a one-off typosquat.

---

## 5. The detection–proof gap

Quarantine of the stager by Microsoft Defender and others, IOC-based egress blocking, and registry reporting and takedown functioned effectively to contain this campaign (the package set has been removed). This Brief does not dispute their role.

Detection, however, does not change the decision of which packages a build accepts as originating from a legitimate internal publisher. The stager in this campaign goes silent on CI, avoids re-execution via cache, and disguises itself with obfuscation and innocuous build/test scripts — all designed to delay detection. By the time detection fires, the `npm install`-time reconnaissance payload has already run and environment variables and development context may have been sent to C2. What was absent was pre-ingestion provenance verification of "was this package actually issued by the legitimate publisher of the internal scope it claims?" — and this is separate from malware detection. For regulatory reporting and audit, a post-hoc scan result does not, on its own, serve as an independent provenance trail proving that "the dependencies the build consumed carry legitimate provenance."

Pre-execution attestation adopts a design that requires, before a build consumes a dependency, an independently verifiable cryptographic proof of the package's publisher provenance (is it the legitimate publisher of the claimed scope? was it published through the expected path?). If the proof reports that "this `@sber-ecom-core` package carries no provenance from the legitimate publisher," resolution and installation are blocked before they occur. Malware detection ("this payload is malicious" — a detection-style judgment) and publisher-provenance pre-execution attestation ("this artifact arrived from the legitimate publisher") are not substitutes but **complements**.

---

## 6. Response and Industry Response

- **Microsoft Threat Intelligence**: identified and disclosed the campaign as active; provided IOCs (C2 domain, X-Secret value, dropped payload patterns), hunting queries, and mitigations (`--ignore-scripts`, scope locking, credential rotation). Feedback to npm led to removal of the package set
- **Cross-industry point**: a contemporaneous Mini Shai-Hulud typosquat campaign (the TeamPCP cluster, sharing roots with Briefs 014/015) was also observed, confirming that the npm ecosystem became a supply-chain-attack concentration area in 2026. With dependency confusion, typosquat, and trusted-publisher takeover operating as parallel primitives, "how to independently verify the provenance of the artifacts a build consumes" is solidifying as a shared challenge

Scope locking (pinning internal scopes to a private registry in `.npmrc`) and disabling install scripts are effective mitigations, but both depend on correct operator configuration. The point that publisher-provenance verification should be embedded as a mandatory build step is gaining weight through this and other 2026 supply-chain incidents.

---

## 7. Lemma's Analysis

For the detection–proof gap exposed here — package resolution uses name and metadata "internal-ness" in place of provenance, without independently verifying publisher provenance — Lemma offers a design that verifies, before a build consumes a dependency, the artifact's publisher provenance as an independently verifiable cryptographic proof. Even if the package name and metadata claim an internal publisher, if the provenance proof reports the absence of a legitimate publisher, ingestion is rejected before it occurs. "The name looks internal ≠ it arrived from the legitimate publisher" — this is the design philosophy of the Verifiable Origin category.

---

## 8. Sources

- **Microsoft Security Blog (Microsoft Defender Security Research Team)**: "Malicious npm packages abuse dependency confusion to profile developer environments" (2026-05-29, attack chain, attribution, IOCs, mitigations) — https://www.microsoft.com/en-us/security/blog/2026/05/29/33-malicious-npm-packages-abuse-dependency-confusion-profile-developer-environments/
- **Microsoft Security Blog**: "Typosquatted npm packages used to steal cloud and CI/CD secrets" (2026-05-28, contemporaneous Mini Shai-Hulud campaign, adjacent incident) — https://www.microsoft.com/en-us/security/blog/2026/05/28/typosquatted-npm-packages-used-steal-cloud-ci-cd-secrets/
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.