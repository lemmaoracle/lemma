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
gap_detected: "External researchers found the malicious publication within just 20 to 26 minutes of release, leading to scope identification and alerts."
gap_missing: "Because the artifact was accepted on the premise that 'signed by a legitimate publisher means a trustworthy artifact,' signature verification could not stop an artifact whose contents had been swapped even though the signature was genuine."
gap_fix: "Before pulling in a high-risk artifact, independently verify with Lemma that it was produced from the intended source and build path, and prevent it up front."
---

## 1. TL;DR

In May 2026, malicious versions of the `@tanstack/*` packages reached npm. The attacker stole no token; they hijacked TanStack's legitimate OIDC trusted-publisher integration mid-workflow and shipped malicious artifacts through the legitimate channel, signed under a valid OIDC identity. A signature attests who published an artifact, not whether its contents are the intended build output, and pre-detection fetches had little reason to suspect them precisely because the signatures were valid.

---

## 2. What happened

- **Affected**: 42 packages under the `@tanstack/*` npm namespace, 84 malicious versions total (CVE-2026-45321, CVSS 9.6)
- **Publish window**: 2026-05-11, 19:20–19:26 UTC (about six minutes)
- **Core method**: not npm-token theft. The attacker hijacked TanStack's legitimate GitHub Actions OIDC trusted-publisher integration during workflow execution and **published the malicious versions signed under the legitimate OIDC identity**. The signed provenance attestations remained valid while the malicious artifacts moved through the legitimate channel
- **Vulnerability chain**: misconfigured `pull_request_target` ("Pwn Request") → GitHub Actions cache poisoning across the fork↔base trust boundary → in-memory extraction of the OIDC token from the Actions runner process
- **Payload**: ~2.3MB obfuscated `router_init.js`. Exfiltrated AWS / GCP / Kubernetes / HashiCorp Vault / npm / GitHub tokens / SSH private keys / `.npmrc`. Polled GitHub tokens every 60 seconds and, upon detecting revocation, ran `rm -rf ~/` to wipe the home directory
- **Attribution**: TeamPCP, per StepSecurity. Part of the "Mini Shai-Hulud" worm campaign that contaminated more than 170 packages across npm / PyPI on the same day (Mistral AI, UiPath, OpenSearch, Guardrails AI, and others)
- **Detection**: an external researcher (ashishkurmi at StepSecurity) publicly detected the malicious publishes 20–26 minutes after they landed
- **Adjacent activity**: TeamPCP also compromised Aqua Trivy (2026-03) and the Bitwarden CLI npm package (2026-04). The same actor is associated with the same-day GitHub internal-repository compromise covered in [Brief 015](/critical/briefs/015-github-vscode-extension-breach/)

The incident came together as the following chain.

1. **Pwn Request abuse**: exploit the misconfigured `pull_request_target` setting so that a fork PR can land code in the base repository's trusted context, creating a foothold inside the workflow
2. **Cache poisoning**: poison the GitHub Actions cache across the fork↔base trust boundary so that attacker-controlled code runs on the runner during workflow execution
3. **OIDC token extraction**: extract the OIDC token from the Actions runner process memory at runtime, transiently gaining the right to **legitimately sign and publish** as npm's trusted publisher
4. **Publish via the legitimate channel**: instead of using a stolen token, use the hijacked legitimate OIDC identity to publish 84 malicious versions. The provenance signatures remain valid throughout
5. **Payload execution on install**: in the consuming environment, `router_init.js` exfiltrates AWS / GCP / Kubernetes / Vault / npm / GitHub / SSH credentials
6. **Destructive trigger**: on detecting that a GitHub token has been revoked, execute `rm -rf ~/` to wipe the home directory of the affected environment

---

## 3. Timeline — disclosure and response

- 2026-03 / 2026-04: TeamPCP compromises Aqua Trivy and the Bitwarden CLI npm package (preceding campaigns)
- 2026-05-11 19:20–19:26 UTC: 84 malicious versions land across 42 `@tanstack/*` packages, signed and published via the legitimate OIDC channel
- 2026-05-11, 20–26 minutes later: StepSecurity researchers publicly detect and announce the publishes
- 2026-05-11, same day: the same actor contaminates more than 170 packages across npm / PyPI ("Mini Shai-Hulud")
- 2026-05 onward: CVE-2026-45321 is assigned, TanStack publishes a postmortem, and IOCs / response guidance are consolidated by vendors

> Note: proper nouns and CVE identifiers are based on primary sources (research labs, the GitHub Advisory Database, NVD, and the like); each implementation's remediation status varies over time, so consult the latest information.

The response and industry movement after disclosure:

- **TanStack**: published a postmortem and reviewed workflow configuration (specifically `pull_request_target` handling) and the OIDC publishing path
- **StepSecurity / researchers**: detected and disclosed the publishes within 20–26 minutes, sharing IOCs and the list of affected packages
- **npm / GitHub ecosystem**: the design around OIDC trusted publishers and Actions cache / trust boundaries surfaced as a live topic. Trusted publishers had been recommended specifically as a countermeasure against token theft, but a new attack surface — runtime hijack of the publisher identity — became visible
- **Cross-industry framing**: this incident is part of the "Mini Shai-Hulud" worm and spread to more than 170 packages across npm / PyPI the same day. Abuses of legitimate publishing pipelines continue (e.g., axios, 2026-04). Version-pinning of dependencies and the verification of build provenance — alongside signature verification — emerge as the working agenda

How to verify "was this generated from the intended build provenance?" — not only "was it published via a legitimate signature and legitimate channel?" — is the open question moving forward.

---

## 4. Why it wasn't stopped

The central **failure primitive is "provenance assurance depended on the publisher-identity signature (OIDC trusted publisher), and once that identity was hijacked at runtime, the malicious artifact moved through the legitimate channel with a valid signature still attached."** A signature attests "who published this"; it does not attest "the contents of this artifact are the intended, reviewed build output."

The same `code-provenance` category as [Brief 004](/critical/briefs/004-megalodon-github-supply-chain/) (Megalodon GitHub supply chain), but a different primitive. [Brief 004](/critical/briefs/004-megalodon-github-supply-chain/) was a direct push using stolen developer credentials; this incident is a runtime hijack of a legitimate OIDC trusted publisher. Both share the structure that "an artifact's origin is accepted while remaining decoupled from any layer that independently verifies it." This incident sits alongside [Brief 015](/critical/briefs/015-github-vscode-extension-breach/) (the GitHub internal-repository compromise and the poisoned VS Code extension) as part of the same actor's (TeamPCP) campaign against developer trust surfaces, and is adjacent to [Brief 010](/critical/briefs/010-claude-code-leak-lure/) (the Claude Code impersonation distribution) on the shared theme of "abuse of trust signals." It is described as "the first supply-chain worm to ship with valid signed provenance," sharply illustrating the gap between signature validity and artifact integrity.

External researchers detected and published the malicious release within about 20–26 minutes, followed by CVE assignment, postmortems, and IOC consolidation. The detection / threat-sharing layer is indispensable for scoping and containing impact, and this Brief does not deny that role.

But detection does not change what the receiving side (the npm registry, the CI/CD or developer environment fetching dependencies) actually **accepts**. In this case the malicious artifact arrived through the legitimate channel **bearing a valid OIDC provenance signature**, so signature verification passed. The assumption "signed by a trusted publisher = trustworthy artifact" was broken by an in-flight identity hijack. Environments that fetched packages during the tens of minutes before public detection had less reason to suspect the artifacts precisely because the signatures were valid. For regulatory reporting, audit, and litigation, the publisher-identity signature alone is not an independent evidentiary trail that "this artifact is the intended build output."

---

## 5. What proof would have changed

Pre-execution attestation takes the design choice of not stopping provenance at the publisher-identity signature: it fixes "this artifact was produced from the intended source, build inputs, and review path" as an independently verifiable cryptographic proof tied to the build's provenance. If the runner is hijacked during workflow execution, the build-provenance proof is inconsistent, and the receiving side can reject the artifact even when the signature is formally valid. Detection (IOC, anomaly monitoring) and pre-execution attestation (build-provenance proof) are **complementary** rather than substitutes.

Against the detection–proof gap exposed here (provenance assurance stopped at the publisher-identity signature, and the workflow-runtime hijack let malicious artifacts move through with a valid signature still attached), Lemma proposes a design in which provenance is not "the signature of who published this" but rather "this artifact was produced from this source, with these build inputs, via this path" — fixed to the build's provenance as an independently verifiable cryptographic proof.

- **From signature to provenance**: move the basis of provenance from the publisher-identity signature to a cryptographic proof tied to the source, build inputs, and path.
- **Verification before execution**: the receiver (CI/CD or developer environment) verifies the proof before pulling the artifact in, and rejects it on inconsistency even when the signature is formally valid.
- **Hijack resistance**: even if the OIDC identity is hijacked at runtime, the build-provenance proof signals on a separate channel whether the artifact was produced from the intended build path.
- **Compatibility with existing layers**: it does not replace signatures or trusted publishers but layers independent artifact-provenance verification on top of them.

Lemma does not substitute for signatures or trusted publishers; it adds a complementary layer that proves the artifact's origin alongside the signature that identifies its publisher.

---

## 6. Sources

- **Snyk**: "TanStack npm Packages Hit by Mini Shai-Hulud" (2026-05, overview of the attack, the OIDC hijack, and the payload) — https://snyk.io/blog/tanstack-npm-packages-compromised/
- **TanStack official postmortem**: "Postmortem: TanStack npm supply-chain compromise" (2026-05) — https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- **GitHub Advisory Database / CVE-2026-45321**: "Malware in @tanstack/* packages exfiltrates cloud credentials, GitHub tokens, and SSH keys" (GHSA-g7cv-rxg3-hmpx) — https://github.com/advisories/GHSA-g7cv-rxg3-hmpx
- **The Hacker News**: "Mini Shai-Hulud Worm Compromises TanStack, Mistral AI, Guardrails AI & More Packages" (2026-05) — https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html
- **Reference implementation (GitHub)**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

References: ["The last layer left for cyber defense in the age of AI"](https://lemma.frame00.com/blog/detection-is-not-proof/), ["Proof-as-Auth: sign in without ever sending your key"](https://lemma.frame00.com/blog/proof-as-auth-sign-in-without-sending-your-key/), [Pillar 01 — Verifiable Origin](https://lemma.frame00.com/pillars/#provenance), [Trust402](https://lemma.frame00.com/trust402/)
