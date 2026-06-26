---
brief_no: 82
title: "xz utils バックドア（CVE-2024-3094）：2 年かけて「信頼された開発者」になりすまし、コード署名済みの正規リリースにバックドアを埋め込んだ — アイデンティティの来歴を独立検証する層がなければ、コード署名は「この鍵が使われた」ことしか証明しない（Andres Freund / CISA）"
title_en: "xz utils backdoor (CVE-2024-3094): a two-year impersonation of a \"trusted developer\" planted a backdoor in a code-signed official release — without a layer that independently verifies identity provenance, code signing only proves \"this key was used\" (Andres Freund / CISA)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2024-02-24
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["004-megalodon-github-supply-chain", "014-tanstack-oidc-trusted-publisher"]
status: published
version: "1.0"
og_lead_ja: "2 年かけた「信頼された開発者」なりすまし — xz utils バックドア"
og_lead_en: "A two-year \"trusted developer\" impersonation — xz utils backdoor"
gap_detected: "Andres Freund noticed an extraordinarily incidental anomaly — a slight delay in SSH logins — and discovered the liblzma backdoor just before it reached stable releases."
gap_missing: "The release was correctly signed with \"Jia Tan\"'s PGP key, but there was no layer to independently verify whether the key-holder's identity was a real, project-trusted developer, so an identity fabricated over two years passed as legitimate."
gap_fix: "Before granting contributor or maintainer authority, independently verify with Lemma the provenance of \"whether this developer's identity corresponds to a real person,\" and prevent it up front."
---

## TL;DR

In March 2024, a CVSS 10.0 backdoor (CVE-2024-3094) was discovered in xz utils, a compression library embedded across a wide range of Linux systems. The attacker "Jia Tan" spent roughly two years building trust as a legitimate OSS contributor, obtained de facto maintainer authority, then planted a sophisticated backdoor in the release build scripts and distributed it as code-signed official releases (5.6.0 / 5.6.1). The cryptographic signature was valid. The premise that "Jia Tan" was a legitimate developer was false from the very start. Code signing proves "whose key was used," but it does not prove "whether that key-holder's identity is authentic." That gap carried a large-scale RCE path via the OpenSSH daemon — suspected of involving a nation-state-level actor — to the very threshold of stable releases.

---

## 1. Incident Overview

- **Target**: xz utils (liblzma) — a compression library widely used across Linux / Unix-family systems, shipped by default in numerous distributions
- **CVE**: CVE-2024-3094 (CVSS score: 10.0)
- **Discoverer**: Andres Freund (an engineer at Microsoft). He noticed a slight delay in SSH logins and reported it to a mailing list on 2024-03-29
- **Attacker**: "Jia Tan" (GitHub: JiaT75) — a person whose real existence cannot be confirmed. Circumstantial evidence points to involvement by a nation-state-level actor
- **Backdoor breakdown**: The malicious code was hidden not directly in the source tree but as a combination of an Autoconf build script (`build-to-host.m4`) and obfuscated test files included only in the `.tar.gz` release archives. It does not appear in a `git clone`
- **Scope of impact**: Through a systemd-based `openssh-server` linked against liblzma, a path opens for the holder of a specific authenticated public key to execute RCE. It reached Fedora Rawhide and parts of Debian testing / unstable. It was caught before reaching major stable releases
- **Root cause**: Not a technical vulnerability but **forgery of trust provenance**. "Jia Tan" obtained maintainer authority including release authority through roughly two years of contribution history and social-engineering approaches to the project's existing maintainer
- **Relation to code signing**: The release archives were signed with "Jia Tan"'s PGP key, so technically the signature was valid. But nowhere did a mechanism exist to independently verify that the "Jia Tan" identity was authentic
- **Core**: Code signing proves "this key was used," but it does not prove "whether that key-holder's identity is the same as the real person the project trusted." "Jia Tan" was a fabricated identity made trustworthy over roughly two years; even when the key's provenance was correct, the identity's provenance was false from the start.

---

## 2. Timeline

- **Late 2021 to early 2022**: "Jia Tan" begins contributing to the xz project. By continuously submitting high-quality patches, he earns trust
- **2022 to 2023**: Obtains commit rights and establishes himself as a core contributor by gradually taking over the work of the existing maintainer (Lasse Collin). During the same period, suspicious accounts pressuring the existing maintainer from the outside to "release more aggressively" were also observed
- **2024-02-24**: xz utils 5.6.0 is released. The build script containing the backdoor is included for the first time
- **2024-03-09**: xz utils 5.6.1 is released. Details of the backdoor are updated
- **2024-03-29**: Andres Freund notices anomalies in Valgrind output and a slight delay in SSH logins (about 500ms) and, after investigation, discovers the liblzma backdoor. He reports it to the Openwall mailing list and to security stakeholders
- **2024-03-29 to 30**: CISA and the various Linux distributors issue emergency advisories. They recommend downgrading affected versions
- **After 2024-03-29**: "Jia Tan"'s account activity ceases. Detailed technical analyses are published in succession by Binarly, Openwall, and others

> Note: Names, CVE, and versions are based on the primary sources from Openwall (Andres Freund's first report), NIST NVD, and CISA; attribution to a nation-state-level actor remains circumstantial and unconfirmed. Each distributor's remediation status varies over time, so consult the latest information.

---

## 3. Attack Vector

1. **Long-term identity construction**: "Jia Tan" begins contributing to an OSS project under a false identity. By continuously submitting high-quality patches indistinguishable from genuine ones, he accumulates the community's trust
2. **Acquisition of maintainer authority**: Through direct contact with the existing maintainer and sustained contribution, he obtains de facto maintainer authority including the creation and signing of releases
3. **Concealment of the backdoor**: Rather than writing the backdoor directly into the source code, he implements it as a combination of an Autoconf build script and test files inside the release archive. It cannot be detected by inspecting the source from a `git clone`
4. **Signing and distribution as an official release**: Distributed as release archives (5.6.0 / 5.6.1) signed with "Jia Tan"'s PGP key. Each distribution pulls them in as legitimate packages
5. **RCE path via liblzma**: When a systemd-linked `openssh-server` loads liblzma, the backdoor activates. It hooks the public-key authentication processing, putting the holder of the attacker's specific private key in a position to execute RCE
6. **(Unfinished due to discovery)**: Discovered before reaching stable distributions; no evidence that the attack was actually used has been confirmed

---

## 4. Structural Analysis

This incident belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central **failure primitive is "code signing proves 'this key-holder signed,' but it does not prove 'whether this key-holder's identity is the same as the person the project trusted'"**. It is nothing other than the exposure of the foundational thesis of provenance verification.

OSS code signing typically confirms the technical fact that "the person holding this key signed." But "whether the person holding this key is the person intended by the organization or community that approved the contributions" is a separate proposition. "Jia Tan" generated a key pair under a non-existent (or fake) identity and, over two years, made the community trust that identity. "The key's provenance is correct," but "the key-holder's identity provenance was false."

Comparison with Brief No.004 (Megalodon GitHub supply chain): Megalodon seized an existing legitimate developer's credentials (PATs, etc.) and pushed (theft of identity). The present case had a fabricated identity from the very start (forgery of identity). Both are isomorphic in lacking a layer that independently verifies "whether the author of a commit / release is a legitimate developer," but the present case, in its preparation period (two years) and the precision of its concealment techniques, is one of the most refined examples indicating nation-state-level involvement.

If Brief No.014 (TanStack npm poisoning) showed that "even when a legitimate OIDC signature is valid, the artifact can be malicious," the present case is the paired example showing that "even when a legitimate PGP signature is valid, the identity can be forged."

---

## 5. The detection–proof gap

In this incident, detection worked. Andres Freund's anomaly detection (SSH delay, differences in Valgrind output) — an extraordinarily incidental and deeply technical observation — was the sole path of discovery. The rapid response by CISA and the various distributors prevented it from reaching stable releases. Had Andres Freund not noticed this anomaly, it could have been included in the stable releases of major Linux distributions, and the role the detection layer played in halting the spread of damage in this incident is not denied.

But there was no proof. Because the code signature was valid, signature-verification tools do not detect the backdoor. The backdoor did not exist directly in the source tree but was embedded in the build process of the release archive, making it difficult to detect by source-code review alone. The root problem lies in the absence of any mechanism to independently verify, at the point of the contribution's start or at the point of granting maintainer authority, "whether 'Jia Tan'"s identity belonged to an authentic developer. Detection captured the contours of the anomaly after the fact, but it does not change the very judgment of acceptance — "whom to trust."

What changes with Lemma is that it fixes, as an independently verifiable cryptographic proof, not only who wrote the code but also "whether that someone's identity corresponds to a real person approved by the project or organization." It provides a design that does not separate key-pair generation from the key-holder's identity provenance, and an attribute proof at the point of granting maintainer authority. For the thesis that after-the-fact detection is not proof, see ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/) (Lemma, 2026-05); for the design that verifies independently before the action, see ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05). Detection and pre-execution attestation stand in a relationship of **complement**, not substitute.

---

## 6. Response and Industry Developments

- **Andres Freund (Microsoft)**: Discovered and reported it through a deep individual technical observation. Notified the community and CISA the same day
- **CISA**: Issued an emergency alert (2024-03-29). Recommended downgrading from affected versions
- **The various Linux distributors**: Fedora, Debian, openSUSE, Arch, and others distributed downgrade packages as an emergency response
- **Binarly**: Published a detailed technical analysis of the obfuscated build scripts and test files
- **International attribution debate**: Analysis of time zones, commit timestamps, and linguistic features has led to wide discussion of nation-state-level involvement (no confirmed attribution)
- **Industry thesis**: It demonstrated the feasibility of supply-chain attacks via "long-term accumulation of trust" in the OSS ecosystem. The need to verify the identity of contributors and maintainers was raised anew, and discussion of the spread of code-signing standards such as Sigstore accelerated

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed in this incident (code signing proves the key-holder, but not the provenance of the key-holder's identity), Lemma proposes the following.

- **Provenance proof of developer identity**: At the point of granting contributor or maintainer authority, fix as a ZK proof "whether the identity is bound to a real organization or person." Do not separate key generation from identity provenance
- **Pre-execution attestation of authority grants**: At each step of granting maintainer authority or delegating release authority, leave the provenance of both the delegator and the recipient as a verifiable record
- **Provenance chain of build artifacts**: Seamlessly chain the author provenance of the source code → the executor provenance of the build process → the signer provenance of the release archive, making forgery at any stage detectable
- **Proof of correspondence between release archive and source**: Disclose, in an independently verifiable form before the build runs, the differences between the source confirmable via `git clone` and the release archive

This is the design philosophy of "cryptographically valid ≠ identity provenance correct" — the core of the verifiable-origin category — and rather than replacing after-the-fact detection like Andres Freund's, it makes the two **complement** each other by fixing identity provenance before acceptance. For the design details, see [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/verifiable-origin/); for the scope, see [Trust402](https://lemma.frame00.com/trust402/).

---

## 8. Sources

- **Andres Freund (primary report)**: Openwall mailing-list post "backdoor in upstream xz/liblzma leading to ssh server compromise" (2024-03-29) — https://www.openwall.com/lists/oss-security/2024/03/29/4
- **CISA emergency alert**: "CISA Adds One Known Exploited Vulnerability to Catalog" / XZ Utils Backdoor Advisory (2024-03-29)
- **Binarly**: "XZ Utils Supply Chain Backdoor: Technical Analysis" (2024-03 to 04)
- **NIST NVD**: CVE-2024-3094 entry — https://nvd.nist.gov/vuln/detail/CVE-2024-3094
- **Ars Technica**: "What we know about the xz Utils backdoor that almost infected the world" (2024-03-29)

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
