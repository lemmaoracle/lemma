---
brief_no: 82
title: "xz utils：メンテナーの権限を得た「Jia Tan」が、署名済みの正規リリースにバックドアを埋め込んだ(CVE-2024-3094、Andres Freund / CISA)"
title_en: "xz utils: \"Jia Tan,\" after gaining maintainer authority, planted a backdoor in signed official releases (CVE-2024-3094, Andres Freund / CISA)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2024-03-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["004-megalodon-github-supply-chain", "014-tanstack-oidc-trusted-publisher"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "xz utils：約 2 年の貢献で権限を得た「Jia Tan」が、署名済みのリリース 5.6.0／5.6.1 にバックドアを埋め込んだ（CVE-2024-3094）"
og_lead_en: "xz utils: \"Jia Tan,\" who gained authority over about two years of contributions, planted a backdoor in signed releases 5.6.0 / 5.6.1 (CVE-2024-3094)"
search_title: "xz utils backdoor CVE-2024-3094"
search_description: "A backdoor in signed xz utils releases 5.6.0 / 5.6.1 (CVE-2024-3094, CVSS 10.0): what happened and what to check."
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · OSS のバックドア"
og_kicker_en: "SUPPLY CHAIN · OSS BACKDOOR"
og_headline_ja: "権限を得た開発者が、\n署名済みの版に仕込んだ。\n<accent>CVSS 10.0</accent>"
og_headline_en: "Signed releases\ncarried a backdoor.\n<accent>CVSS 10.0</accent>"
key_figures:
  - value: "10.0"
    unit: "CVSS"
    label: "Severity of CVE-2024-3094 (NIST NVD)"
    tone: "alert"
  - value: "~2"
    unit: "years"
    label: "From \"Jia Tan\"'s first contributions to the backdoored 5.6.0 release"
  - value: "~500"
    unit: "ms"
    label: "The SSH login delay that led to the discovery (Andres Freund)"
glossary:
  - term: "PGP signature"
    desc: "A way to show that a file was signed with a particular key. A valid signature alone does not tell you who holds the key."
  - term: "Release archive"
    desc: "A compressed bundle of the source for distribution (.tar.gz). Here, files absent from the git source were included only in the archive."
insight:
  slug: "valid-signature-is-not-identity"
  label: "A valid signature does not identify the key-holder"
  quote: "A valid signature still lets a release from a developer whose real existence cannot be confirmed pass as official, unless who holds the key is checked before authority is handed over."
industries: ["developers"]
operations: ["delivery", "account-admin"]
controls:
  - slug: "ownership-check"
    item: "Confirm the developer who signed a release is a real, verified person"
attack_method: "supply-chain"
impact: "Backdoor in signed releases of a compression library widely used on Linux (CVSS 10.0)"
takeaway: "Because the releases were validly signed with \"Jia Tan\"'s key, signature verification did not catch the backdoor; discovery rested on an incidental observation of an SSH delay."
self_check: "Before handing release or signing authority to a developer, do you check that they are a real person?"
countries: ["global"]
---

## 1. Summary

"Jia Tan" kept submitting high-quality patches, earned the project's trust, and obtained de facto maintainer authority, including creating and signing releases. The backdoor was not written directly into the source tree; it was hidden as a combination of a build script and test files included only in the release archives, and the archives were validly signed with "Jia Tan"'s PGP key. <strong>A valid signature still lets a release from a developer whose real existence cannot be confirmed pass as official, unless who holds the key is checked before authority is handed over.</strong>

## 2. What got through

- **What got through**: Publishing release archives 5.6.0 / 5.6.1 signed with "Jia Tan"'s PGP key, and each distribution pulling them in as legitimate packages. Before that, after about two years of contributions and direct contact with the existing maintainer, de facto maintainer authority, including creating and signing releases, had been handed over.
- **What reached the receiving side**: In general, the side pulling in a release receives the archive and a valid signature; who holds the key cannot be told from the signature. Here, the backdoor was a combination of an Autoconf build script (`build-to-host.m4`) and obfuscated test files included only in the `.tar.gz` archives, and it did not appear in the source from a `git clone` (Andres Freund, Binarly).
- **How far it reached**: Fedora Rawhide and parts of Debian testing / unstable. It was caught before reaching major stable releases. No evidence that the attack was actually used has been confirmed.
- **Not disclosed**: Who "Jia Tan" is. Analysis of time zones, commit timestamps, and similar features has led to discussion of nation-state-level involvement, but attribution is not confirmed.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is checking, before release or signing authority is handed over, that the key-holder corresponds to a real person the project approved.

- **Who approves**: The maintainers of the project handing over authority, and the distributions that pull in its releases. The volume or quality of contributions, or a valid signature, is not an approval of the key-holder.
- **Where it is checked**: Before maintainer or release authority is handed over, and before a signed release is pulled in. Releases signed with a key whose holder cannot be checked are held, not pulled in.
- **What is recorded**: Who handed which authority to whom, and which release was pulled in on which signer's confirmation. Later, it shows which version came in under whose signature.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before authority is handed over and before a release is pulled in, that the key-holder is an approved real person, and keeping a record. Detection means noticing from anomalous behavior after distribution. Dates follow the timeline in section 05.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before handing over authority and before pulling in a release, check who holds the key</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>Signed 5.6.0 / 5.6.1 were published<br>They reached development distributions such as Fedora Rawhide</span></div>
<div class="rx-zone det"><b>Detection · worked after distribution</b>Found from an SSH login delay, before reaching stable releases</div>
<div class="rx-g g1"><div class="t">Late 2021–</div><b>"Jia Tan" begins contributing</b></div>
<div class="rx-g g2"><div class="t">2024-02-24</div><b>Backdoored 5.6.0 released</b></div>
<div class="rx-g g3"><div class="t">2024-03-09</div><b>5.6.1 released</b></div>
<div class="rx-g g4"><div class="t">2024-03-29</div><b>Andres Freund reports; CISA issues an alert</b></div>
</div>
</figure>

It was found before reaching stable releases, but by then the signed releases had already entered development distributions as legitimate packages. Other cases where a signature or credential was valid while the origin of the contents or the signer was not checked include [a push with a legitimate developer's stolen credentials](/critical/briefs/004-megalodon-github-supply-chain/) (Brief 004) and [malicious npm packages published with a legitimate OIDC signature](/critical/briefs/014-tanstack-oidc-trusted-publisher/) (Brief 014).

## 4. What Lemma does

**Lemma builds the pre-execution check into the steps that hand over authority and pull in releases.** It does not watch for anomalous behavior; before authority is handed over and before a release is pulled in, it checks that the key-holder is an approved real person, and does not let through what cannot be checked.

### Industries and operations to watch

- **Industry · Developers & agent operations**: Developers, organizations, and distributions that pull in OSS releases as dependencies or packages and feed them into builds and distribution.
- **Operation · Sending & delivery**: The flow in which signed release archives are published and each distribution ships them as legitimate packages.
- **Operation · Accounts & permissions**: The steps by which an OSS project hands commit rights, or authority to create and sign releases, to contributors.

### Current controls vs Lemma

The route in this case is distributions pulling in a release signed by someone who had obtained maintainer authority.

| Control | Handing over maintainer authority | Pulling in a signed release |
| --- | --- | --- |
| Signature verification | Not applicable | Not effective |
| Review of the source from `git clone` | Not applicable | Not effective |
| Detection of anomalous behavior (delay, Valgrind output) | Not applicable | Partial |
| **Lemma (pre-execution check)** | Effective | Partial |

Signature verification does not catch the backdoor, because the signature was valid. Source review struggles to tell it apart, because the backdoor did not appear in the source from a `git clone` and was included only in the archives. Detection of anomalous behavior was the only path of discovery here and worked before stable releases were reached, but the releases had already entered development distributions. Lemma checks, before authority is handed over, that the recipient's key corresponds to an approved real person. Before a release is pulled in, it checks that the signer passed that check, but it does not judge whether the contents are safe.

Note: Lemma's check works only when it is built into the steps that hand over authority and pull in releases, and the project manages which approved people correspond to which keys. If a person who passed the check signs with malicious intent, or the key of someone who passed the check is stolen, this check can be passed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for development organizations that pull in OSS releases

- Do you confirm that the OSS release archives you pull in have the same contents as the published source?
- Besides verifying the signature, is there a procedure to confirm who holds the signing key?
- Do you record which release was pulled in, on confirmation of whose signature?

## 5. Facts and timeline

- **Subject**: xz utils (liblzma), a compression library widely used across Linux / Unix-family systems and shipped by default in numerous distributions.
- **CVE**: CVE-2024-3094 (CVSS 10.0, NIST NVD).
- **Discovery**: Andres Freund (an engineer at Microsoft) noticed Valgrind output and a slight delay in SSH logins (about 500ms), investigated, and reported to the Openwall mailing list on 2024-03-29.
- **Attacker**: "Jia Tan" (GitHub: JiaT75), a person whose real existence cannot be confirmed. Nation-state-level involvement remains circumstantial and unconfirmed.
- **Technique**: The backdoor was hidden as a combination of an Autoconf build script (`build-to-host.m4`) and obfuscated test files included only in the `.tar.gz` archives. When a systemd-linked `openssh-server` loads liblzma, it hooks public-key authentication, putting the holder of the attacker's specific private key in a position to execute RCE.
- **Signature**: The release archives were signed with "Jia Tan"'s PGP key, and the signature was technically valid.
- **How far it reached**: Fedora Rawhide and parts of Debian testing / unstable. It was caught before reaching major stable releases.

### Timeline

- **Late 2021 to early 2022**: "Jia Tan" begins contributing to the xz project, earning trust by continuously submitting high-quality patches.
- **2022 to 2023**: Obtains commit rights and, by gradually taking over the work of the existing maintainer (Lasse Collin), becomes a core contributor. During the same period, suspicious accounts pressing the existing maintainer from outside to "release more aggressively" were also observed.
- **2024-02-24**: xz utils 5.6.0 is released. The build script containing the backdoor is included for the first time.
- **2024-03-09**: xz utils 5.6.1 is released. Details of the backdoor are updated.
- **2024-03-29**: Andres Freund finds the liblzma backdoor and reports it to the Openwall mailing list and to security stakeholders.
- **2024-03-29 to 30**: CISA and the Linux distributors issue emergency advisories recommending a downgrade from affected versions.
- **After 2024-03-29**: "Jia Tan"'s account activity stops. Detailed technical analyses follow from Binarly, Openwall, and others.

> Names, the CVE, and versions are based on primary sources from Openwall (Andres Freund's first report), NIST NVD, and CISA. Attribution to a nation-state-level actor remains circumstantial and unconfirmed. Each distributor's remediation status varies over time, so consult the latest information. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Andres Freund (Microsoft)**: Notified the community and CISA on the day of discovery.
- **CISA**: Issued an emergency alert (2024-03-29) recommending a downgrade from affected versions.
- **The Linux distributors**: Fedora, Debian, openSUSE, Arch, and others distributed downgrade packages.
- **Binarly**: Published a detailed technical analysis of the obfuscated build scripts and test files.

## 6. Sources

- **Andres Freund (primary report)**: Openwall mailing-list post "backdoor in upstream xz/liblzma leading to ssh server compromise" (2024-03-29) — https://www.openwall.com/lists/oss-security/2024/03/29/4
- **CISA emergency alert**: "CISA Adds One Known Exploited Vulnerability to Catalog" / XZ Utils Backdoor Advisory (2024-03-29)
- **Binarly**: "XZ Utils Supply Chain Backdoor: Technical Analysis" (2024-03 to 04)
- **NIST NVD**: CVE-2024-3094 entry — https://nvd.nist.gov/vuln/detail/CVE-2024-3094
- **Ars Technica**: "What we know about the xz Utils backdoor that almost infected the world" (2024-03-29)

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/)
