---
brief_no: 125
title: "keyv・cacheable の npm 乗っ取り：38 分で 9 本が公開され、すべて取り下げられた — 通ったのはビルドの来歴であって、発行者の正体ではない"
title_en: "The keyv and cacheable npm takeover: nine releases published in 38 minutes, all since pulled — what the provenance attested was the build, not who was at the keyboard"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-08-04
published: 2026-08-07
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "082-xz-utils-backdoor-identity-provenance", "038-ironworm-npm-self-propagation", "090-air-fake-agent-skill-toctou"]
status: published
version: "1.0"
og_lead_ja: "keyv・cacheable の npm 乗っ取り、38 分で公開された 9 本がすべて取り下げ"
og_lead_en: "keyv and cacheable npm takeover — nine releases in 38 minutes, all pulled"
gap_detected: "Signature and provenance checks worked as designed. These packages are published with provenance from a GitHub Actions release.yml."
gap_missing: "That provenance does not say who was at the keyboard. Nothing established the publisher's identity before the release was installed."
gap_fix: "Make which publisher identity, and which source state, a release came from checkable before it is installed, and let a release that carries no such proof be held."
analysis_lead_en: "What cannot be checked is not whether the build came from the right workflow. It is whether the person who triggered that workflow was the maintainer."
---

## 1. TL;DR

On 4 August 2026, a widely used family of npm caching packages — keyv, cacheable, and others — was compromised through a takeover of the maintainer's account. The npm registry still records what happened: **nine versions published between 09:35 and 10:13 UTC that day, a window of about 38 minutes, every one of them since pulled**. To anyone installing them, those releases came down the legitimate path. These packages are published with provenance from a GitHub Actions `release.yml`, and signature and provenance checks work as designed against them. **What was missing is the layer that establishes, before a release is installed, whether the person who triggered that workflow was the maintainer.**

## 2. What happened

- The subject is a family of caching packages widely depended on in Node.js. Nine versions published on 2026-08-04 and subsequently pulled can be confirmed in the registry:

| Package | Version pulled | Published (UTC) |
|---|---|---|
| `keyv` | 6.0.0 | 09:35:00 |
| `@cacheable/node-cache` | 3.1.2 | 10:10:34 |
| `cacheable` | 2.5.1 | 10:10:44 |
| `flat-cache` | 6.1.24 | 10:10:55 |
| `cacheable-request` | 13.0.20 | 10:11:24 |
| `@cacheable/memory` | 2.2.1 | 10:11:29 |
| `file-entry-cache` | 11.1.6 | 10:13:02 |
| `@cacheable/utils` | 2.5.1 | 10:14:21 |
| `cache-manager` | 7.2.10 | 10:14:41 |

- In every case the `latest` tag has been rolled back to the preceding version (`keyv` points at 5.6.0, not 6.0.0). Attestations for the pulled versions are gone along with the versions themselves.
- These packages do use npm provenance. Fetching the attestation for the surviving `cacheable@2.5.0` returns a SLSA provenance v1 statement recording `repository: github.com/jaredwray/cacheable`, `.github/workflows/release.yml`, and `ref: refs/heads/main`.
- No commits from 4 August remain on the GitHub side. The published releases stop at `v6.0.0-rc.1` on 3 August, and that day's commits are ordinary dependency upgrades and release work. The repository's `pushed_at` is 5 August, which suggests the history was tidied during remediation.
- What the poisoned releases contained — a preinstall hook that fetched an external runtime and ran an obfuscated credential stealer, the development, CI, and cloud credentials it targeted, and its propagation downstream — rests on independent analyses from several security vendors (§6). Because the versions were pulled, none of this can be confirmed from the registry at the time of writing.

The compromise took shape through the following chain.

1. An attacker takes over the maintainer's account and gains a position from which releases can be published.
2. Releases published from that position travel the legitimate path. Signature and provenance checks on the installing side pass, so long as the provenance points at the expected workflow.
3. In environments that resolve the dependency, the preinstall hook runs and credentials are taken.
4. Those credentials are used to publish further, and the compromise spreads downstream.

## 3. Timeline — disclosure and response

- 2026-08-03: `v6.0.0-rc.1` is published for `keyv`. In the GitHub commit history, that day's work is ordinary dependency upgrades and a release.
- 2026-08-04 09:35 UTC: `keyv@6.0.0` is published.
- 2026-08-04 10:10–10:14 UTC: eight more packages follow — `cacheable`, `flat-cache`, `cacheable-request`, `file-entry-cache`, `cache-manager`, and others.
- 2026-08-04 to 08-05: several security vendors publish independent analyses, listing affected packages and first-response steps.
- All nine versions are pulled from the registry, and `latest` is rolled back to the preceding version in each case.

> The spine of this Brief — the publications and their removal, the versions, the timestamps, and the provenance setup — was read directly from the npm registry and the GitHub API. What the poisoned releases contained (the hook's behaviour, the credentials targeted, the scale of propagation, package counts, download figures) could not be confirmed from a primary source, because the versions were pulled; those details rest on vendor analyses. The maintainer is the victim of an account takeover, and this Brief does not argue any individual's negligence. The matter is ongoing, and a post-mortem from the parties involved would supersede parts of this account.

The response and industry movement after disclosure:

- The poisoned versions were pulled, and vendors recommend immediate rotation of credentials in affected environments (npm, CI, and cloud tokens) along with pinning and auditing of the affected versions.
- The case belongs to a run of npm supply chain compromises through 2026. Package-by-package remediation continues, but the shape — a poisoned release travelling the legitimate path — remains.

## 4. Why it wasn't stopped

The failure here is neither that signing and provenance were absent nor that a cryptographic check was defeated. **There was no way, before installation, to establish which publisher identity a release had been triggered by.**

Provenance checks worked as designed. These packages are published with provenance from a GitHub Actions `release.yml`, and that fact is still confirmable from npm's attestation API today. What was missing sits earlier — provenance answers "this build came from this repository, from this workflow," not "the person who triggered that workflow was the maintainer." From the moment the account is taken over, legitimate provenance carries a malicious artifact, and stays legitimate while it does.

> Installing is an action. Without a way, before that action, to establish that the provenance ties back to the right publisher, a valid signature is simply a pass.

The 38-minute window makes the same point. Pulling the versions worked as after-the-fact remediation, but in environments that resolved the dependency during that window, everything verified and then ran. This descends from cases where valid signatures and provenance carried malicious artifacts — [Brief 014](/critical/briefs/014-tanstack-oidc-trusted-publisher/) (a malicious package signed through a legitimate OIDC trusted publisher) and [Brief 082](/critical/briefs/082-xz-utils-backdoor-identity-provenance/) (a backdoor placed in legitimate releases by someone who had earned the standing of a trusted developer) — and it shares the spread-by-stolen-credential shape of [Brief 038](/critical/briefs/038-ironworm-npm-self-propagation/) and the passes-every-check shape of [Brief 090](/critical/briefs/090-air-fake-agent-skill-toctou/).

## 5. What proof would have changed

Proof-as-auth inserts one step into the path ahead of the moment a dependency is taken in: it fixes what the provenance ties back to. It puts "which publisher identity, and which source state, did this release come from" into a form in which the installing side can establish it — before the install completes, and without querying the publisher.

Lemma's design against this gap:

<ul class="bd-check">
<li><strong>The publisher identity, tied to the provenance.</strong> Tie a release not only to the workflow but to the identity that triggered it, and keep which party it came from in a form that can be checked before the install.</li>
<li><strong>Bound to the source state.</strong> Tie the provenance not only to the fact that a build ran but to the state of the source that build was made from.</li>
<li><strong>Authorization before the install.</strong> Let dependency resolution and installation proceed only where that check clears, so a release that carries no such proof can be held before the action.</li>
<li><strong>The republication chain, cut.</strong> Ensure that a republication made with stolen credentials does not clear on the installing side without the publisher identity behind it.</li>
</ul>

What this layer does not carry is worth stating as well.

<ul class="bd-limit">
<li>It does not detect malware. Whether code is malicious is judged by a person, and by the scanners already in place.</li>
<li>It does not prevent the account takeover itself. That belongs to authentication; this layer supplies the means to tell apart what came out afterward.</li>
<li>The gate on taking a dependency in sits with the dependency-resolution policy; this layer supplies the material for that decision, no more.</li>
</ul>

This is also where it differs from a publisher's own build log. A log is something the publishing side produces for itself; the side taking the dependency in cannot check it independently. In the environments that installed during those 38 minutes, everything verified.

Lemma does not replace scanners, signing, or provenance. Scanners, signature verification, and provenance are complementary to this layer, not alternatives to it. The first catch known malicious artifacts and invalid signatures; the second closes one point before the dependency is taken in.

## 6. Sources

- **npm registry (primary, read directly)**: package metadata — publication times, removals, `dist-tags` — <https://registry.npmjs.org/keyv> and the other packages listed above
- **npm attestation API (primary, read directly)**: SLSA provenance for a surviving version — <https://registry.npmjs.org/-/npm/v1/attestations/cacheable@2.5.0>
- **GitHub API (primary, read directly)**: repository commits and releases — <https://github.com/jaredwray/keyv> · <https://github.com/jaredwray/cacheable>
- **Chainguard (independent analysis)**: "The keyv and cacheable npm Supply Chain Attack: Inside the Mini Shai-Hulud Campaign" — <https://www.chainguard.dev/unchained/the-keyv-and-cacheable-npm-supply-chain-attack-inside-the-mini-shai-hulud-campaign>
- **Wiz (independent analysis)**: "keyv and cacheable npm Package Hijacked in Supply Chain Attack" — <https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack>
- **Snyk (independent analysis)**: "Inside the keyv npm Supply Chain Compromise" — <https://snyk.io/blog/inside-keyv-npm-compromise-preinstall-malware-trusted-provenance-ide-hooks/>
- **Aikido (independent analysis)**: "Keyv and friends compromised in npm supply chain attack" — <https://www.aikido.dev/blog/keyv-and-friends-compromised-in-npm-supply-chain-attack>
- **SafeDep (independent analysis)**: "keyv and cacheable npm compromise" — <https://safedep.io/keyv-npm-supply-chain-compromise/>

References: ["The last layer left for cyber defense in the age of AI"](/blog/detection-is-not-proof/) (Lemma, 2026-05) · ["Proof-as-Auth: sign in without ever sending your key"](/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 01 — Verifiable Origin](/pillars/#provenance) · [Brief 014 (TanStack)](/critical/briefs/014-tanstack-oidc-trusted-publisher/) · [Brief 082 (xz utils)](/critical/briefs/082-xz-utils-backdoor-identity-provenance/)
