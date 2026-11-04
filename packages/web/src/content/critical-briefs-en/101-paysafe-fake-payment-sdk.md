---
brief_no: 101
title: "偽の Paysafe SDK：決済 SDK の名前を装うパッケージが、開発環境の鍵とトークンを持ち出す作りだった(Socket の調査)"
title_en: "Fake Paysafe SDKs: packages posing as payment SDKs were built to carry off developers' keys and tokens (Socket research)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["kyc-aml-disclosure", "attribute-proof-bypass"]
incident_date: 2026-07-07
published: 2026-07-10
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["028-npm-dependency-confusion-recon", "038-ironworm-npm-self-propagation", "090-air-fake-agent-skill-toctou", "077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach"]
status: published
gate: "intake"
version: "1.0"
og_lead_ja: "偽の Paysafe SDK：決済 SDK を装う 17 パッケージが、開発環境の鍵とトークンを送り出す作りだった（Socket）"
og_lead_en: "Fake Paysafe SDKs: 17 packages posing as payment SDKs were built to send out developers' keys and tokens (Socket)"
layout: "report"
sections: "proof"
og_kicker_ja: "サプライチェーン攻撃 · 偽の決済 SDK"
og_kicker_en: "SUPPLY CHAIN · FAKE PAYMENT SDKS"
og_headline_ja: "偽の決済 SDK が、\n鍵を送り出す作りだった。\n<accent>17 パッケージ</accent>"
og_headline_en: "Fake payment SDKs\nwere built to send out keys.\n<accent>17 packages</accent>"
key_figures:
  - value: "17"
    unit: "packages"
    label: "Packages posing as payment SDKs: 13 on npm, 4 on PyPI (Socket)"
    tone: "alert"
  - value: "~6"
    unit: "min"
    label: "From publication to a malware verdict on npm (Socket)"
  - value: "Undisclosed"
    label: "How many environments installed the packages (not in Socket's disclosure)"
glossary:
  - term: "SDK"
    desc: "A component for calling a service from your own code. Developers pull in a payment SDK as a dependency to call payment functions."
  - term: "Typosquatting"
    desc: "Publishing a fake package under a name resembling the real one, so developers install it by mistyping or by taking it for the genuine article."
insight:
  slug: "name-is-not-origin"
  label: "A name is not an origin"
  quote: "A component that looks genuine in name and behavior still gets into the development environment unless its publisher is checked before it is pulled in."
industries: ["finance", "developers"]
controls:
  - slug: "ownership-check"
    item: "Confirm a payment SDK package is really Paysafe's official one before installing"
attack_method: "supply-chain"
impact: "17 malicious packages posing as payment SDKs"
takeaway: "Packages posing as payment SDKs, in name and API, returned fake success responses while built to find and send out keys and tokens from the development environment."
self_check: "Before pulling a payment (or similar) SDK in as a dependency, do you check that the package comes from the official publisher?"
countries: ["global"]
---

## 1. Summary

These were not the official SDKs of Paysafe, Skrill, or Neteller but separate packages published to npm and PyPI under similar names. They exposed the API a legitimate SDK is expected to provide, returned fake success responses to calls, and, behind the scenes, were built to find keys and tokens in the development environment and send them out (Socket's analysis). <strong>A component that looks genuine in name and behavior still gets into the development environment unless its publisher is checked before it is pulled in.</strong>

## 2. What got through

- **What got through**: Publishing packages posing as payment SDKs, and pulling them in as dependencies. The packages carried names such as `paysafe-checkout`, `paysafe-vault`, `paysafe-api`, `paysafe-node`, `paysafe-payments`, `paysafe-sdk`, `paysafe-kyc`, `skrill`, `skrill-sdk`, `skrill-payments`, and `neteller` (Socket).
- **What was stopped**: Each npm package was flagged as malware about six minutes after publication (Socket).
- **What reached the receiving side**: In general, the side pulling in a package receives a name, a version, and contents; whether the publisher is the official one cannot be told from the name. These packages did not talk to Paysafe's backend and returned fake success responses, so the integration appeared to work (Socket).
- **What was targeted**: Paysafe API keys, AWS keys, GitHub tokens, npm tokens, hostnames, usernames, and API-usage data (Socket).
- **Not disclosed**: How many environments installed the packages, and whether the keys were actually abused.

## 3. Pre-execution check

Whatever the route, the condition for telling them apart is that, before a developer or CI pulls in a dependency, it checks that the package comes from the official publisher.

- **Who approves**: The package's publisher (the payment service's official publisher), and the organization that decides which publishers' components may be pulled in. A similar name is not an approval.
- **Where it is checked**: Before a dependency is pulled in (before installation, before a CI build). Packages whose publisher cannot be checked are held, not installed.
- **What is recorded**: Which package was pulled in, on which publisher's confirmation. Later, it shows which environment pulled in what.

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">Exhibit 1</span><span class="rx-ex-t">Detection vs pre-execution check</span></div>
<p class="rx-ex-cap">A pre-execution check means checking, before a dependency is pulled in, that the package comes from the official publisher, and keeping a record. Detection means a scanner or researcher judging a package malicious after publication. Dates are those Socket observed or published.</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>Pre-execution check · not known from the disclosures</b>Before pulling it in, check that the package comes from the official publisher</div>
<div class="rx-zone gapz"><b>What was confirmed</b><span>17 packages posing as payment SDKs were published<br>Number of environments that installed them undisclosed</span></div>
<div class="rx-zone det"><b>Detection · worked after publication</b>Flagged on npm about six minutes after publication</div>
<div class="rx-g g1"><div class="t">Published</div><b>Published to npm and PyPI at nearly the same time</b></div>
<div class="rx-g g2"><div class="t">~6 min later</div><b>Flagged as malware on npm</b></div>
<div class="rx-g g3"><div class="t">2026-07-07</div><b>Socket detects the cluster of 17</b></div>
<div class="rx-g g4"><div class="t">2026-07</div><b>Socket publishes the technique and how to check</b></div>
</div>
</figure>

They were flagged within about six minutes, but in an environment that installed one in that window, keys could be sent out first. Other cases where the origin of an incoming component was not checked before installation or execution include [npm dependency confusion](/critical/briefs/028-npm-dependency-confusion-recon/) (Brief 028), [an npm worm that republishes itself with stolen credentials](/critical/briefs/038-ironworm-npm-self-propagation/) (Brief 038), and [a fake agent skill that passed every scanner](/critical/briefs/090-air-fake-agent-skill-toctou/) (Brief 090).

## 4. What Lemma does

**Lemma builds the pre-execution check into the step that pulls in dependencies.** It does not watch packages; before one is pulled in, it checks that its publisher is the official one and does not pull in what cannot be checked.

### Industries and operations to watch

- **Industry · Finance**: Organizations implementing integrations with payment or identity-verification services. The payment API keys sit in the same environment as the SDKs they pull in.
- **Industry · Developers & software**: Developers and organizations that pull dependencies from npm or PyPI and ship them through CI to production.

### Current controls vs Lemma

The route in this case is pulling in, as a dependency, a package posing as a payment SDK.

| Control | Pulling in a package as a dependency |
| --- | --- |
| Judging by name and behavior | Not effective |
| Scanner and registry verdicts after publication | Partial |
| Blocking package names at the registry proxy | Partial |
| **Lemma (pre-execution check)** | Effective |

Judging by name and behavior does not settle it, because the packages exposed the legitimate SDK's API and returned fake success responses. Verdicts after publication worked within about six minutes on npm, but in an environment that installed a package before then, keys could be sent out first. Blocking package names, which Socket recommended, only works for names already known to be malicious. Lemma checks the package's publisher before it is pulled in, not its name or behavior. A record of what was pulled in is also kept, so which environment pulled in what can be confirmed later.

Note: Lemma's check works only when it is built into the step that pulls in dependencies (installation or the CI build) and the publishers that may be pulled in are managed by the organization. If the official publisher's own account is taken over and used to publish, this check can be passed. The table compares what each control checks; it does not show whether this incident would have been stopped. Lemma does not detect or prevent intrusions.

### Checklist

Three things to confirm for development organizations that use payment (or similar) SDKs

- Before pulling a payment (or similar) SDK in as a dependency, do you confirm that the package comes from the official publisher?
- Is there a procedure that stops, without installing, a package whose publisher cannot be confirmed?
- Do you record which environment pulled in which package, and when?

## 5. Facts and timeline

- **Subject**: Packages posing as the official SDKs of Paysafe, Skrill, and Neteller (all payment / e-money services). The targets were developers implementing these payment integrations. The three companies' names were used; their official SDKs were not altered.
- **Scale**: 17 packages in total (13 on npm, 4 on PyPI). The npm packages were released in versions 1.0.0 to 1.0.3 (Socket).
- **Technique**: They exposed the API a legitimate SDK is expected to provide, returned fake success responses without talking to Paysafe's backend, and behind the scenes looked for secrets in the environment (tokens, passwords, API keys) and sent them out (Socket).
- **Anti-analysis**: They stopped early when common sandbox indicators were found or when the host had fewer than two CPU cores. The destination was hidden by layered decoding (XOR, character shifting, reversal) and resolved to a domain under ngrok-type infrastructure (Socket).
- **Detection**: Socket's AI scanner detected the cluster published to npm and PyPI at nearly the same time. Each npm package was flagged as malware about six minutes after publication (Socket).

### Timeline

- **2026-07-07**: Socket's AI scanner detects the cluster of 17 packages published to npm and PyPI. Each npm package is flagged as malware about six minutes after publication.
- **From 2026-07-07**: Socket publishes the technique, the targeted secrets, the anti-analysis logic, and how the destination was hidden, and recommends auditing dependencies.

> The technical facts rely on Socket's analysis and BleepingComputer's reporting. The package count (17), the ~6-minute verdict, the targeted secrets, the anti-analysis logic, and the hidden destination are per Socket's observations. How many environments installed the packages is not disclosed as of this writing. What has not been disclosed does not mean there were no controls.

### After disclosure

- **Socket**: Recommended that developers audit dependency trees, audit CI/CD logs, block the package names at the registry proxy, and check for compromise by cross-checking `PAYSAFE_API_KEY` against the package names in CI logs.

## 6. Sources

- **Socket (research, primary)**: “Coordinated npm and PyPI Campaign Typosquats Popular Secure Payment Apps” (2026-07) — <https://socket.dev/blog/npm-pypi-campaign-typosquats-popular-secure-payment-apps>
- **BleepingComputer**: “Fake Paysafe, Skrill SDKs on npm and PyPI steal credentials” (2026-07) — <https://www.bleepingcomputer.com/news/security/fake-paysafe-skrill-sdks-on-npm-and-pypi-steal-credentials/>
- **Developer Tech**: “Socket: PyPI and npm payment SDK malware compromises CI/CD” (2026-07) — <https://www.developer-tech.com/news/socket-pypi-and-npm-payment-sdk-malware-compromises-ci-cd/>
