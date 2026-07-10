---
brief_no: 101
title: "Paysafe 偽 SDK：正規の決済 SDK を装う 17 パッケージが、決済 API 鍵ごと開発者の秘密を持ち出した"
title_en: "Paysafe fake SDKs: 17 packages posing as legitimate payment SDKs exfiltrated developers' secrets, payment API keys and all"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["kyc-aml-disclosure", "attribute-proof-bypass"]
incident_date: 2026-07-07
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["028-npm-dependency-confusion-recon", "038-ironworm-npm-self-propagation", "090-air-fake-agent-skill-toctou", "077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "Paysafe 偽 SDK — 決済 SDK を装う 17 パッケージが決済 API 鍵ごと開発者の秘密を窃取した"
og_lead_en: "Paysafe fake SDKs — 17 packages posing as payment SDKs stole developer secrets, payment API keys and all"
gap_detected: "The detection chain worked — supply-chain security firm Socket's AI scanner caught all 17 packages, flagged the npm ones as malware about six minutes after publication, and published the technique, the targeted secrets, and the C2 obfuscation along with dependency-audit guidance."
gap_missing: "There is no layer that independently verifies — at the moment a developer pulls in a payment SDK as a dependency — whether it originates from a legitimate publisher as an authorized distribution, and whether attribute privileges such as payment API keys and KYC credentials are used only through authorized paths."
gap_fix: "Before pulling in a dependency, verify the distribution's provenance and keep attribute privileges such as payment API keys and KYC credentials separated between storage and use, so that installation or execution is stopped when no proof accompanies it — verified independently by Lemma, and prevent it up front."
---

## TL;DR

The supply-chain security firm Socket detected 17 malicious packages (13 on npm, 4 on PyPI) that pose as SDKs for the payment services Paysafe, Skrill, and Neteller. Each package exposes the API a legitimate SDK is expected to provide, returns fake success responses to calls, and, behind the scenes, hunts for and exfiltrates secrets in the development environment. The stolen targets extend to Paysafe API keys, AWS keys, GitHub tokens, and npm tokens, plus hostnames, usernames, and API-usage metadata — and include the KYC-adjacent `paysafe-kyc`. The npm packages were flagged as malware about six minutes after publication, but they carried anti-analysis logic that aborts execution when sandbox indicators are present or the host has fewer than two CPU cores. The technique itself is a repeat of typosquatting, but what is specific to this case is that what gets stolen is the very authority to execute payments (the Paysafe API key) and KYC-adjacent credentials. A cluster of regulatory attributes — payment and identity verification — was pulled into CI/CD and production under the trusted guise of an "SDK," with no verification of its provenance. Detection and pre-execution proof are complements, not substitutes.

---

## 1. Incident overview

- **Subject**: malicious packages posing as the official SDKs of Paysafe, Skrill, and Neteller (all payment / e-money services). The targets are developers implementing these payment integrations.
- **Detection**: the AI scanner of the supply-chain security firm Socket detected a cluster published to npm and PyPI at nearly the same time.
- **Scale**: 17 packages in total (13 on npm, 4 on PyPI). These include `paysafe-checkout`, `paysafe-vault`, `paysafe-api`, `paysafe-node`, `paysafe-payments`, `paysafe-sdk`, `paysafe-kyc`, `skrill`, `skrill-sdk`, `skrill-payments`, and `neteller`.
- **Core of the technique**: each package exposes the API a legitimate SDK is expected to provide and makes itself look functional. In reality it does not communicate with the Paysafe backend but returns fake success responses, while behind the scenes it hunts for secrets in the environment (tokens, passwords, API keys) and sends them out.
- **Stolen targets**: Paysafe API keys, AWS keys, GitHub tokens, and npm tokens, plus hostnames, usernames, and metadata about API usage.
- **Anti-analysis**: it returns early when common sandbox indicators are detected or when the host has fewer than two CPU cores, suppressing discovery in automated analysis environments. The C2's final destination is hidden by multi-stage decoding (XOR, character shifting, reversal) and resolved to a tracker domain under ngrok-type infrastructure.
- **Speed of detection**: the npm packages carried versions from 1.0.0 to 1.0.3 and were flagged as malware about six minutes after publication.
- **Core**: a cluster of regulatory attributes — API keys representing the authority to execute payments and KYC-adjacent credentials — was pulled into development environments and CI/CD through packages under the trusted guise of a "payment SDK," with no verification of its provenance (whether it originates from a legitimate publisher as an authorized distribution).

---

## 2. Timeline

- 2026-07-07: Socket's AI scanner detected a cluster of 17 packages published to npm and PyPI at the same time. The npm packages were judged as malware about six minutes after each was published.
- From 2026-07-07 onward: Socket published the technique (posing as the legitimate API and returning fake success responses while stealing secrets), the stolen targets, the anti-analysis logic, and the C2 obfuscation, and recommended auditing dependency trees, auditing CI/CD logs, blocking the package names at the registry proxy, and cross-checking `PAYSAFE_API_KEY` against the package names in CI logs.

> Note: the technical facts are based on Socket's analysis and BleepingComputer's reporting. The package count (17), the ~6-minute detection, the stolen targets, the anti-analysis logic, and the C2 obfuscation are per Socket's observations. The actual number of environments compromised by adoption is not disclosed as of this writing. Refer to the latest primary sources.

---

## 3. Attack vector

1. **Mimicking the legitimate SDK**: the attacker publishes packages to npm and PyPI under names resembling the Paysafe, Skrill, and Neteller SDKs (typosquatting). They expose the API a legitimate SDK is expected to provide and make themselves look functional.
2. **Fake success responses**: the package does not communicate with the Paysafe backend and returns fake success responses to calls. Because the integration "appears to work," developers are unlikely to notice an anomaly.
3. **Hunting for and stealing secrets**: behind the scenes it hunts for secrets in the environment (Paysafe API keys, AWS keys, GitHub tokens, npm tokens, hostnames, usernames, API-usage metadata) and sends them out.
4. **Anti-analysis**: it returns early in environments with sandbox indicators or fewer than two CPU cores, suppressing discovery in automated analysis. The C2's final destination is hidden by multi-stage decoding (XOR, character shifting, reversal).
5. **Adoption and lateral movement**: the stolen payment API keys, KYC credentials, and cloud/registry tokens can be used for abuse spanning both regulatory attributes and development privileges — abusing payment processing, intruding into CI/CD, and publishing additional packages on legitimate registries.

---

## 4. Structural analysis

This case sits in Pillar 01 (Verifiable Origin), category `code-provenance`. The central failure primitive is that **the developer did not independently verify, before adoption, the provenance of the package (SDK) they pull in as a dependency — whether it originates from a legitimate publisher as an authorized distribution.** The package exposed the legitimate SDK's API verbatim and satisfied the appearance of a "payment SDK," but that appearance does not guarantee the authenticity of the publisher. As a technique, typosquatting is in the same lineage as Brief No.028 (development-environment recon via npm dependency confusion), Brief No.038 (IronWorm, an npm worm that re-publishes itself with stolen credentials), and Brief No.090 (AIR, a fake agent skill that passed every scanner) — all of which share the structure in which the provenance of the distribution being adopted is not verified before execution or installation.

What is specific to this case is that what gets stolen is not merely generic development secrets but **a cluster of regulatory attributes: the Paysafe API key representing the authority to execute payments, and KYC-adjacent credentials (including `paysafe-kyc`).** Here the perspective of Pillar 04 overlaps. A payment API key is a regulatory authority under which whoever holds it can execute a transfer of funds, and a KYC credential is an entitlement that handles the regulatory attribute of identity verification. That these were pulled in under the trusted guise of a "payment SDK," with provenance unverified, and leaked together, connects to the structure shown by Brief No.077 (IDMerit, exposure of roughly 1 billion KYC records) and Brief No.013 (Coinbase, an insider leak of raw KYC PII) — that "a cluster of identity-verification / regulatory attributes is not verified for authenticity at the point of storage or adoption." As secondaries, we add `kyc-aml-disclosure` in that payment / KYC credentials are the target, and `attribute-proof-bypass` in that the authority for payment and identity verification was accepted and leaked without provenance verification.

Furthermore, the behavior of fake success responses touches on the integrity of the payment integration itself. A state in which the integration "appears to work" while in reality it does not communicate with the legitimate backend is a manifestation of the payment flow's provenance and authenticity not being fixed before execution. The common primitive is the same. That is, **the distribution, and the regulatory-attribute authority it carries, are pulled in while decoupled from the layer that verifies their provenance.**

---

## 5. The detection-versus-proof gap

Socket's ~6-minute detection via its AI scanner, the publication of the technique, the stolen targets, and the C2 obfuscation, and the recommendations to audit dependency trees and cross-check CI logs are indispensable for containing the spread of harm and for early response, and this Brief does not diminish that role. Indeed, detection within minutes of publication can protect many developers before adoption. Detection does play its part.

On the other hand, detection does not become material that independently proves, **at the moment the developer pulls it in as a dependency**, whether "the payment SDK they are about to adopt originates from a legitimate publisher as an authorized distribution." Because the malicious package exposes the legitimate SDK's API and feigns functionality with fake success responses, it is hard to distinguish from the genuine article at the surface of name and behavior. Signature- or reputation-based detection tends to lag in the early moments after a new publication, and in an environment that adopted it during those six minutes, it comes after the payment API keys and KYC credentials have already been sent out. As material to prove in an audit that "this payment integration originates from a legitimately published SDK, and this API key was used only through an authorized path," the mere fact that "it had the API of a payment SDK" is not an independent trail of the publisher's provenance or of the use of the attribute authority. This is a structurally independent gap outside the reach of the detection layer.

Pre-execution attestation fills this gap by inserting one step of provenance proof into the path of adopting a package and of using the attribute authority it carries. Before adopting a dependency, it verifies whether "this distribution originates from a legitimate publisher and is an authorized version," and blocks installation or execution beforehand when no proof accompanies it. In addition, if regulatory-attribute authority such as payment API keys and KYC credentials is separated between storage and use, and made exercisable only after proving that "this attribute is used for this operation at this scope," the plaintext leakage of keys itself can be avoided. Pre-execution proof is not a substitute for detection but a **complement**, and the combination of both layers establishes the trust boundary of the development supply chain that handles payments and KYC.

---

## 6. Response and industry context

- **Research (Socket)**: detected the 17 packages with its AI scanner and judged the npm ones as malware about six minutes after each publication. It recommends that developers audit dependency trees, audit CI/CD logs, block the package names at the registry proxy, and check for compromise by cross-checking `PAYSAFE_API_KEY` against the package names in CI logs.
- **Registries (npm / PyPI)**: malicious packages become subject to action after detection. However, detection tends to lag during the first few minutes after a new publication, and in an environment that adopted it, the sending-out of secrets can come first.
- **Cross-industry**: SDKs that handle regulatory attributes such as payments and KYC have a wider blast radius than typosquatting of generic libraries, because stolen keys and credentials immediately lead to the abuse of funds transfer or identity verification. Among organizations implementing payment integrations, provenance verification of dependencies (checking signatures and publishers) and separation of storage and use for payment API keys and KYC credentials were shared as the crux of countermeasures. In the first half of 2026 alone, supply-chain campaigns on npm and PyPI have grown at a pace far exceeding the prior year, and the need to place provenance verification at the point of adoption has been pointed out repeatedly.

---

## 7. Lemma's analysis

Against the detection-versus-proof gap this case exposed — the provenance of the payment SDK, and the payment / KYC attribute authority it carries, are not independently verified before adoption and use — Lemma proposes the following design.

- **Pre-execution proof of a distribution's provenance**: before adopting a dependency package, independently verify that it originates from a legitimate publisher and is an authorized version, and reject installation or execution beforehand when no proof accompanies it.
- **Separation of storage and use for attribute authority**: rather than placing regulatory-attribute authority such as payment API keys and KYC credentials in the environment in plaintext for full inheritance, make it exercisable only after proving that "this attribute is used for this operation at this scope." Prove only the satisfaction of the authority, without sending the key itself.
- **Fixing the authenticity of the payment flow**: fix, as provenance, that the payment integration connects to the legitimate backend, and make integrations without substance — such as fake success responses — detectable as a missing proof.
- **Selective disclosure**: without disclosing the payment / identity-verification credentials themselves, prove with minimal disclosure only that "this subject satisfies the authority for this payment and this attribute."

Detection (post-hoc scanning, publication of the technique, dependency audits) works to remediate harm; pre-execution proof (independent verification of provenance and attribute authority before adoption and use) works to establish trust in the development supply chain that handles payments and KYC — each complementary.

---

## 8. Sources

- **Socket (research, primary)**: “Coordinated npm and PyPI Campaign Typosquats Popular Secure Payment Apps” (2026-07) — <https://socket.dev/blog/npm-pypi-campaign-typosquats-popular-secure-payment-apps>
- **BleepingComputer**: “Fake Paysafe, Skrill SDKs on npm and PyPI steal credentials” (2026-07) — <https://www.bleepingcomputer.com/news/security/fake-paysafe-skrill-sdks-on-npm-and-pypi-steal-credentials/>
- **Developer Tech**: “Socket: PyPI and npm payment SDK malware compromises CI/CD” (2026-07) — <https://www.developer-tech.com/news/socket-pypi-and-npm-payment-sdk-malware-compromises-ci-cd/>

---

## 9. About distribution

This material is a structured analysis of public information; it is not an audit, diagnosis, or recommendation for any specific organization.

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
