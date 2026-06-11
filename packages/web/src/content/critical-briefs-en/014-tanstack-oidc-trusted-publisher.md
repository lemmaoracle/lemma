---
brief_no: 14
title: "TanStack npm 汚染 — 正規 OIDC trusted publisher で署名された悪性パッケージ、来歴署名が有効でも成果物は悪性"
title_en: "The TanStack npm Compromise — Malicious Packages Signed Under a Legitimate OIDC Trusted Publisher, Where a Valid Provenance Signature Did Not Mean a Trustworthy Artifact"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-11
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["015-github-vscode-extension-breach", "004-megalodon-github-supply-chain", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "正規 OIDC trusted publisher で署名された悪性パッケージ — TanStack npm 汚染"
og_lead_en: "Malicious npm packages signed under a legitimate OIDC trusted publisher — TanStack"
---

## TL;DR

On 2026-05-11 between 19:20 and 19:26 UTC, 84 malicious versions across 42 packages in the `@tanstack/*` JavaScript namespace were published to npm (CVE-2026-45321, CVSS 9.6). The attacker did not steal an npm token; instead, they hijacked TanStack's legitimate GitHub Actions OIDC trusted-publisher integration during workflow execution and delivered malicious packages via the legitimate publishing path, **signed under a valid OIDC identity**. The incident is reported as part of the first supply-chain worm ("Mini Shai-Hulud") to spread with valid signed provenance attached, and TeamPCP contaminated more than 170 npm / PyPI packages on the same day. The malicious payload exfiltrated AWS / GCP / Kubernetes / Vault / npm / GitHub / SSH credentials and ran `rm -rf ~/` whenever it detected that a GitHub token had been revoked. The case exposes a detection–proof gap in Pillar 01: a technically valid provenance signature (who published it) does not guarantee that the artifact itself is what was intended.

---

## 1. Incident Overview

- **Affected**: 42 packages under the `@tanstack/*` npm namespace, 84 malicious versions total (CVE-2026-45321, CVSS 9.6)
- **Publish window**: 2026-05-11, 19:20–19:26 UTC (about six minutes)
- **Core method**: not npm-token theft. The attacker hijacked TanStack's legitimate GitHub Actions OIDC trusted-publisher integration during workflow execution and **published the malicious versions signed under the legitimate OIDC identity**. The signed provenance attestations remained valid while the malicious artifacts moved through the legitimate channel
- **Vulnerability chain**: misconfigured `pull_request_target` ("Pwn Request") → GitHub Actions cache poisoning across the fork↔base trust boundary → in-memory extraction of the OIDC token from the Actions runner process
- **Payload**: ~2.3MB obfuscated `router_init.js`. Exfiltrated AWS / GCP / Kubernetes / HashiCorp Vault / npm / GitHub tokens / SSH private keys / `.npmrc`. Polled GitHub tokens every 60 seconds and, upon detecting revocation, ran `rm -rf ~/` to wipe the home directory
- **Attribution**: TeamPCP, per StepSecurity. Part of the "Mini Shai-Hulud" worm campaign that contaminated more than 170 packages across npm / PyPI on the same day (Mistral AI, UiPath, OpenSearch, Guardrails AI, and others)
- **Detection**: an external researcher (ashishkurmi at StepSecurity) publicly detected the malicious publishes 20–26 minutes after they landed
- **Adjacent activity**: TeamPCP also compromised Aqua Trivy (2026-03) and the Bitwarden CLI npm package (2026-04). The same actor is associated with the same-day GitHub internal-repository compromise covered in Brief 015

---

## 2. Timeline

- 2026-03 / 2026-04: TeamPCP compromises Aqua Trivy and the Bitwarden CLI npm package (preceding campaigns)
- 2026-05-11 19:20–19:26 UTC: 84 malicious versions land across 42 `@tanstack/*` packages, signed and published via the legitimate OIDC channel
- 2026-05-11, 20–26 minutes later: StepSecurity researchers publicly detect and announce the publishes
- 2026-05-11, same day: the same actor contaminates more than 170 packages across npm / PyPI ("Mini Shai-Hulud")
- 2026-05 onward: CVE-2026-45321 is assigned, TanStack publishes a postmortem, and IOCs / response guidance are consolidated by vendors

---

## 3. Attack Vector

1. **Pwn Request abuse**: exploit the misconfigured `pull_request_target` setting so that a fork PR can land code in the base repository's trusted context, creating a foothold inside the workflow
2. **Cache poisoning**: poison the GitHub Actions cache across the fork↔base trust boundary so that attacker-controlled code runs on the runner during workflow execution
3. **OIDC token extraction**: extract the OIDC token from the Actions runner process memory at runtime, transiently gaining the right to **legitimately sign and publish** as npm's trusted publisher
4. **Publish via the legitimate channel**: instead of using a stolen token, use the hijacked legitimate OIDC identity to publish 84 malicious versions. The provenance signatures remain valid throughout
5. **Payload execution on install**: in the consuming environment, `router_init.js` exfiltrates AWS / GCP / Kubernetes / Vault / npm / GitHub / SSH credentials
6. **Destructive trigger**: on detecting that a GitHub token has been revoked, execute `rm -rf ~/` to wipe the home directory of the affected environment

---

## 4. Structural Argument

The incident belongs to the `code-provenance` category of Pillar 01 (Verifiable Origin). The central failure primitive is that provenance assurance depended on "was it signed by a legitimate publisher identity (OIDC trusted publisher)?" — and once that identity was hijacked during workflow execution, **the malicious artifact moved through the legitimate channel with a valid signature still attached**. A signature attests "who published this"; it does not attest "the contents of this artifact are the intended, reviewed build output." `identity-auth` (hijack of the OIDC identity) is noted as a secondary category.

The same `code-provenance` category as Brief 004 (Megalodon GitHub supply chain), but a different primitive. Brief 004 was a direct push using stolen developer credentials; this incident is a runtime hijack of a legitimate OIDC trusted publisher. Both share the structure that "an artifact's origin is accepted while remaining decoupled from any layer that independently verifies it." This incident sits alongside Brief 015 (the GitHub internal-repository compromise and the poisoned VS Code extension) as part of the same actor's (TeamPCP) campaign against developer trust surfaces, and is adjacent to Brief 010 (the Claude Code impersonation distribution) on the shared theme of "abuse of trust signals." It is described as "the first supply-chain worm to ship with valid signed provenance," sharply illustrating the gap between signature validity and artifact integrity.

---

## 5. The detection–proof gap

External researchers detected and published the malicious release within about 20–26 minutes, followed by CVE assignment, postmortems, and IOC consolidation. The detection / threat-sharing layer is indispensable for scoping and containing impact, and this Brief does not deny that role.

But detection does not change what the receiving side (the npm registry, the CI/CD or developer environment fetching dependencies) actually **accepts**. In this case the malicious artifact arrived through the legitimate channel **bearing a valid OIDC provenance signature**, so signature verification passed. The assumption "signed by a trusted publisher = trustworthy artifact" was broken by an in-flight identity hijack. Environments that fetched packages during the tens of minutes before public detection had less reason to suspect the artifacts precisely because the signatures were valid. For regulatory reporting, audit, and litigation, the publisher-identity signature alone is not an independent evidentiary trail that "this artifact is the intended build output."

Pre-execution attestation takes the design choice of not stopping provenance at the publisher-identity signature: it fixes "this artifact was produced from the intended source, build inputs, and review path" as an independently verifiable cryptographic proof tied to the build's provenance. If the runner is hijacked during workflow execution, the build-provenance proof is inconsistent, and the receiving side can reject the artifact even when the signature is formally valid. Detection (IOC, anomaly monitoring) and pre-execution attestation (build-provenance proof) are **complementary** rather than substitutes (see [The Last Layer Left for Cyber Defense in the AI Era](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) (Lemma, 2026-05) for the thesis on detection vs. pre-execution attestation).

---

## 6. Response and Industry Response

- **TanStack**: published a postmortem and reviewed workflow configuration (specifically `pull_request_target` handling) and the OIDC publishing path
- **StepSecurity / researchers**: detected and disclosed the publishes within 20–26 minutes, sharing IOCs and the list of affected packages
- **npm / GitHub ecosystem**: the design around OIDC trusted publishers and Actions cache / trust boundaries surfaced as a live topic. Trusted publishers had been recommended specifically as a countermeasure against token theft, but a new attack surface — runtime hijack of the publisher identity — became visible
- **Cross-industry framing**: this incident is part of the "Mini Shai-Hulud" worm and spread to more than 170 packages across npm / PyPI the same day. Abuses of legitimate publishing pipelines continue (e.g., axios, 2026-04). Version-pinning of dependencies and the verification of build provenance — alongside signature verification — emerge as the working agenda

How to verify "was this generated from the intended build provenance?" — not only "was it published via a legitimate signature and legitimate channel?" — is the open question moving forward.

---

## 7. Lemma's Analysis

Against the detection–proof gap exposed here (provenance assurance stopped at the publisher-identity signature, and the workflow-runtime hijack let malicious artifacts move through with a valid signature still attached), Lemma proposes a design in which provenance is not "the signature of who published this" but rather "this artifact was produced from this source, with these build inputs, via this path" — fixed to the build's provenance as an independently verifiable cryptographic proof. Even if the OIDC identity is hijacked at runtime, the build-provenance proof, on a separate channel, signals "this was / was not produced from the intended build path," so the receiver can reject on proof inconsistency even when the signature is formally valid. Lemma does not substitute for signatures or trusted publishers; it adds a complementary layer that proves the artifact's origin alongside the signature that identifies its publisher. For design details see [What the 2026 Bridge Incidents Are Showing — On the Verifiable-Origin Category](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/) (Lemma, 2026-04) and [Proof-as-Auth: Sign In Without Sending Your Key](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) (Lemma, 2026-05); for the reference implementation see [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin) (GitHub).

---

## 8. Sources

- **Snyk**: "TanStack npm Packages Hit by Mini Shai-Hulud" (2026-05, overview of the attack, the OIDC hijack, and the payload) — https://snyk.io/blog/tanstack-npm-packages-compromised/
- **TanStack official postmortem**: "Postmortem: TanStack npm supply-chain compromise" (2026-05) — https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- **GitHub Advisory Database / CVE-2026-45321**: "Malware in @tanstack/* packages exfiltrates cloud credentials, GitHub tokens, and SSH keys" (GHSA-g7cv-rxg3-hmpx) — https://github.com/advisories/GHSA-g7cv-rxg3-hmpx
- **The Hacker News**: "Mini Shai-Hulud Worm Compromises TanStack, Mistral AI, Guardrails AI & More Packages" (2026-05) — https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html

---

## 9. About distribution

Lemma Critical Brief is a threat intelligence brief published by Lemma. It is structured analysis of public information — not an audit, assessment, or recommendation directed at any specific organization. For decision-support use, please consult your Lemma Critical contact directly.

[Discovery Call →](https://tally.so/r/Pd2Rl5)
[Whitepaper →](https://tally.so/r/7RJXdR)
[✉️ Newsletter →](https://tally.so/r/rjvN2X?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
